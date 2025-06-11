# -*- coding: utf-8 -*-
"""
评价系统相关路由
"""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import json
import os
import uuid
from werkzeug.utils import secure_filename
from PIL import Image

from app import db
from models import Review, Attraction, User

reviews_bp = Blueprint('reviews', __name__)

# 允许的图片格式
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    """检查文件扩展名是否允许"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def create_upload_folder():
    """创建上传文件夹"""
    upload_folder = os.path.join(current_app.root_path, 'static', 'uploads', 'reviews')
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)
    return upload_folder

def process_image(file, max_size=(1200, 1200), quality=85):
    """处理上传的图片：压缩和调整大小"""
    try:
        # 打开图片
        image = Image.open(file)
        
        # 转换为RGB模式（处理RGBA等格式）
        if image.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'P':
                image = image.convert('RGBA')
            background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
            image = background
        
        # 调整图片大小
        image.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        return image
    except Exception as e:
        raise ValueError(f"图片处理失败: {str(e)}")

def save_uploaded_image(file):
    """保存上传的图片"""
    if not file or not allowed_file(file.filename):
        raise ValueError("不支持的文件格式")
    
    # 创建上传文件夹
    upload_folder = create_upload_folder()
    
    # 生成唯一文件名
    file_ext = file.filename.rsplit('.', 1)[1].lower()
    filename = f"{uuid.uuid4().hex}.{file_ext}"
    filepath = os.path.join(upload_folder, filename)
    
    # 处理图片
    processed_image = process_image(file)
    
    # 保存图片
    processed_image.save(filepath, format='JPEG', quality=85, optimize=True)
    
    # 返回相对路径
    return f"/static/uploads/reviews/{filename}"

@reviews_bp.route('/', methods=['POST'])
@jwt_required()
def create_review():
    """创建评价"""
    try:
        user_id = get_jwt_identity()
        
        # 检查请求类型：JSON或表单数据
        if request.content_type and 'multipart/form-data' in request.content_type:
            # 表单数据（包含文件上传）
            data = request.form.to_dict()
            files = request.files.getlist('images')
        else:
            # JSON数据
            data = request.get_json() or {}
            files = []
        
        # 验证必填字段
        required_fields = ['attraction_id', 'rating', 'content']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field}不能为空'}), 400
        
        attraction_id = int(data['attraction_id'])
        rating = int(data['rating'])
        
        # 验证景点是否存在
        attraction = Attraction.query.get(attraction_id)
        if not attraction:
            return jsonify({'error': '景点不存在'}), 404
        
        # 验证评分范围
        if not (1 <= rating <= 5):
            return jsonify({'error': '评分必须在1-5之间'}), 400
        
        # 检查用户是否已经评价过该景点
        existing_review = Review.query.filter_by(
            user_id=user_id,
            attraction_id=attraction_id
        ).first()
        
        if existing_review:
            return jsonify({'error': '您已经评价过该景点'}), 400
        
        # 处理上传的图片
        image_urls = []
        if files:
            for file in files:
                if file and file.filename:
                    try:
                        image_url = save_uploaded_image(file)
                        image_urls.append(image_url)
                    except ValueError as e:
                        return jsonify({'error': str(e)}), 400
        
        # 如果是JSON请求，也可能包含图片URL
        if 'images' in data and isinstance(data['images'], list):
            image_urls.extend(data['images'])
        
        # 创建评价
        review = Review(
            user_id=user_id,
            attraction_id=attraction_id,
            rating=rating,
            title=data.get('title', ''),
            content=data['content'],
            images=json.dumps(image_urls, ensure_ascii=False),
            visit_date=datetime.strptime(data['visit_date'], '%Y-%m-%d').date() if data.get('visit_date') else None
        )
        
        db.session.add(review)
        
        # 更新景点评分统计
        reviews = Review.query.filter_by(attraction_id=attraction_id).all()
        total_rating = sum(r.rating for r in reviews) + rating
        total_count = len(reviews) + 1
        
        attraction.rating = round(total_rating / total_count, 1)
        attraction.review_count = total_count
        
        db.session.commit()
        
        return jsonify({
            'message': '评价创建成功',
            'review': review.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'创建评价失败: {str(e)}'}), 500

@reviews_bp.route('/attraction/<int:attraction_id>', methods=['GET'])
def get_attraction_reviews(attraction_id):
    """获取景点评价列表"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        sort_by = request.args.get('sort_by', 'created_at')  # created_at/rating/helpful_count
        rating_filter = request.args.get('rating', type=int)  # 按评分筛选
        
        # 验证景点是否存在
        attraction = Attraction.query.get(attraction_id)
        if not attraction:
            return jsonify({'error': '景点不存在'}), 404
        
        query = Review.query.filter_by(attraction_id=attraction_id)
        
        # 评分筛选
        if rating_filter:
            query = query.filter(Review.rating == rating_filter)
        
        # 排序
        if sort_by == 'rating':
            query = query.order_by(Review.rating.desc())
        elif sort_by == 'helpful_count':
            query = query.order_by(Review.helpful_count.desc())
        else:
            query = query.order_by(Review.created_at.desc())
        
        pagination = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        reviews = [review.to_dict() for review in pagination.items]
        
        # 评分分布统计
        rating_stats = db.session.query(
            Review.rating,
            db.func.count(Review.id).label('count')
        ).filter_by(attraction_id=attraction_id).group_by(Review.rating).all()
        
        rating_distribution = {str(i): 0 for i in range(1, 6)}
        for rating, count in rating_stats:
            rating_distribution[str(rating)] = count
        
        return jsonify({
            'reviews': reviews,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_prev': pagination.has_prev,
                'has_next': pagination.has_next
            },
            'rating_distribution': rating_distribution,
            'average_rating': attraction.rating,
            'total_reviews': attraction.review_count
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'获取评价列表失败: {str(e)}'}), 500

@reviews_bp.route('/<int:review_id>', methods=['GET'])
def get_review_detail(review_id):
    """获取评价详情"""
    try:
        review = Review.query.get(review_id)
        
        if not review:
            return jsonify({'error': '评价不存在'}), 404
        
        return jsonify({
            'review': review.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'获取评价详情失败: {str(e)}'}), 500

@reviews_bp.route('/<int:review_id>/helpful', methods=['POST'])
@jwt_required()
def mark_helpful(review_id):
    """标记评价有用"""
    try:
        user_id = get_jwt_identity()
        review = Review.query.get(review_id)
        
        if not review:
            return jsonify({'error': '评价不存在'}), 404
        
        # 简单实现：直接增加有用数（实际项目中应该记录用户操作避免重复）
        review.helpful_count += 1
        db.session.commit()
        
        return jsonify({
            'message': '标记成功',
            'helpful_count': review.helpful_count
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'标记失败: {str(e)}'}), 500

@reviews_bp.route('/my-reviews', methods=['GET'])
@jwt_required()
def get_my_reviews():
    """获取我的评价"""
    try:
        user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        pagination = Review.query.filter_by(user_id=user_id)\
            .order_by(Review.created_at.desc())\
            .paginate(page=page, per_page=per_page, error_out=False)
        
        reviews = []
        for review in pagination.items:
            review_data = review.to_dict()
            review_data['attraction'] = review.attraction.to_dict() if review.attraction else None
            reviews.append(review_data)
        
        return jsonify({
            'reviews': reviews,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_prev': pagination.has_prev,
                'has_next': pagination.has_next
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'获取我的评价失败: {str(e)}'}), 500

@reviews_bp.route('/<int:review_id>', methods=['PUT'])
@jwt_required()
def update_review(review_id):
    """更新评价"""
    try:
        user_id = get_jwt_identity()
        review = Review.query.get(review_id)
        
        if not review:
            return jsonify({'error': '评价不存在'}), 404
        
        if review.user_id != user_id:
            return jsonify({'error': '无权限修改此评价'}), 403
        
        data = request.get_json()
        
        # 更新允许修改的字段
        updatable_fields = ['rating', 'title', 'content', 'images', 'visit_date']
        old_rating = review.rating
        
        for field in updatable_fields:
            if field in data:
                if field == 'images':
                    setattr(review, field, json.dumps(data[field], ensure_ascii=False))
                elif field == 'visit_date' and data[field]:
                    setattr(review, field, datetime.strptime(data[field], '%Y-%m-%d').date())
                elif field == 'rating':
                    new_rating = data[field]
                    if not (1 <= new_rating <= 5):
                        return jsonify({'error': '评分必须在1-5之间'}), 400
                    setattr(review, field, new_rating)
                else:
                    setattr(review, field, data[field])
        
        # 如果评分发生变化，更新景点评分统计
        if 'rating' in data and data['rating'] != old_rating:
            attraction = review.attraction
            reviews = Review.query.filter_by(attraction_id=attraction.id).all()
            total_rating = sum(r.rating for r in reviews if r.id != review.id) + data['rating']
            total_count = len(reviews)
            
            attraction.rating = round(total_rating / total_count, 1)
        
        db.session.commit()
        
        return jsonify({
            'message': '评价更新成功',
            'review': review.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'更新评价失败: {str(e)}'}), 500

@reviews_bp.route('/<int:review_id>', methods=['DELETE'])
@jwt_required()
def delete_review(review_id):
    """删除评价"""
    try:
        user_id = get_jwt_identity()
        review = Review.query.get(review_id)
        
        if not review:
            return jsonify({'error': '评价不存在'}), 404
        
        if review.user_id != user_id:
            return jsonify({'error': '无权限删除此评价'}), 403
        
        attraction = review.attraction
        
        db.session.delete(review)
        
        # 更新景点评分统计
        remaining_reviews = Review.query.filter_by(attraction_id=attraction.id).all()
        if remaining_reviews:
            total_rating = sum(r.rating for r in remaining_reviews if r.id != review.id)
            total_count = len(remaining_reviews) - 1
            attraction.rating = round(total_rating / total_count, 1) if total_count > 0 else 0
            attraction.review_count = total_count
        else:
            attraction.rating = 0
            attraction.review_count = 0
        
        db.session.commit()
        
        return jsonify({
            'message': '评价删除成功'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'删除评价失败: {str(e)}'}), 500
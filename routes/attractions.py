# -*- coding: utf-8 -*-
"""
景点相关路由
"""

from flask import Blueprint, request, jsonify, render_template
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import or_, and_
import json
import math

from app import db
from models import Attraction, Review, User

attractions_bp = Blueprint('attractions', __name__)

@attractions_bp.route('/', methods=['GET'])
def get_attractions():
    """获取景点列表"""
    try:
        # 获取查询参数
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 12, type=int)
        category = request.args.get('category')  # 红色历史/网红打卡/美食探索
        keyword = request.args.get('keyword')
        min_rating = request.args.get('min_rating', type=float)
        is_barrier_free = request.args.get('is_barrier_free', type=bool)
        sort_by = request.args.get('sort_by', 'rating')  # rating/review_count/created_at
        
        # 构建查询
        query = Attraction.query
        
        # 分类筛选
        if category:
            query = query.filter(Attraction.category == category)
        
        # 关键词搜索
        if keyword:
            query = query.filter(
                or_(
                    Attraction.name.contains(keyword),
                    Attraction.description.contains(keyword),
                    Attraction.address.contains(keyword)
                )
            )
        
        # 评分筛选
        if min_rating:
            query = query.filter(Attraction.rating >= min_rating)
        
        # 无障碍筛选
        if is_barrier_free:
            query = query.filter(Attraction.is_barrier_free == True)
        
        # 排序
        if sort_by == 'rating':
            query = query.order_by(Attraction.rating.desc())
        elif sort_by == 'review_count':
            query = query.order_by(Attraction.review_count.desc())
        elif sort_by == 'created_at':
            query = query.order_by(Attraction.created_at.desc())
        
        # 分页
        pagination = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        attractions = [attraction.to_dict() for attraction in pagination.items]
        
        return jsonify({
            'attractions': attractions,
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
        return jsonify({'error': f'获取景点列表失败: {str(e)}'}), 500

@attractions_bp.route('/<int:attraction_id>', methods=['GET'])
def get_attraction_detail(attraction_id):
    """获取景点详情页面"""
    try:
        print(f"Debug: 正在查询景点ID: {attraction_id}")
        attraction = Attraction.query.get(attraction_id)
        print(f"Debug: 查询结果: {attraction}")
        
        if not attraction:
            print(f"Debug: 景点ID {attraction_id} 未找到")
            return render_template('404.html'), 404
        
        print(f"Debug: 开始获取评价数据")
        # 获取最新评价
        recent_reviews = Review.query.filter_by(attraction_id=attraction_id)\
            .order_by(Review.created_at.desc()).limit(5).all()
        print(f"Debug: 最新评价数量: {len(recent_reviews)}")
        
        # 获取所有评价用于统计
        all_reviews = Review.query.filter_by(attraction_id=attraction_id).all()
        print(f"Debug: 总评价数量: {len(all_reviews)}")
        
        # 计算评分分布
        rating_distribution = {}
        total_reviews = len(all_reviews)
        if total_reviews > 0:
            for i in range(1, 6):
                count = len([r for r in all_reviews if r.rating == i])
                rating_distribution[i] = round((count / total_reviews) * 100, 1)
        else:
            rating_distribution = {i: 0 for i in range(1, 6)}
        print(f"Debug: 评分分布: {rating_distribution}")
        
        # 获取附近景点（同城市的其他景点）
        nearby_attractions = Attraction.query.filter(
            Attraction.id != attraction_id
        ).limit(6).all()
        print(f"Debug: 附近景点数量: {len(nearby_attractions)}")
        
        print(f"Debug: 开始渲染模板")
        from datetime import datetime
        return render_template('attraction_detail.html', 
                             attraction=attraction,
                             reviews=recent_reviews,
                             nearby_attractions=nearby_attractions,
                             rating_distribution=rating_distribution,
                             current_time=datetime.now())
        
    except Exception as e:
        print(f"Debug: 发生异常: {type(e).__name__}: {str(e)}")
        import traceback
        print(f"Debug: 异常堆栈: {traceback.format_exc()}")
        return render_template('error.html', error=str(e)), 500

@attractions_bp.route('/api/<int:attraction_id>', methods=['GET'])
def get_attraction_api(attraction_id):
    """获取景点详情API"""
    try:
        attraction = Attraction.query.get(attraction_id)
        
        if not attraction:
            return jsonify({'error': '景点不存在'}), 404
        
        # 获取最新评价
        recent_reviews = Review.query.filter_by(attraction_id=attraction_id)\
            .order_by(Review.created_at.desc()).limit(5).all()
        
        attraction_data = attraction.to_dict()
        attraction_data['recent_reviews'] = [review.to_dict() for review in recent_reviews]
        
        return jsonify({
            'attraction': attraction_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'获取景点详情失败: {str(e)}'}), 500

@attractions_bp.route('/categories', methods=['GET'])
def get_categories():
    """获取景点分类统计"""
    try:
        categories = db.session.query(
            Attraction.category,
            db.func.count(Attraction.id).label('count')
        ).group_by(Attraction.category).all()
        
        category_data = [
            {
                'category': category,
                'count': count,
                'display_name': {
                    '红色历史': '红色历史景点',
                    '网红打卡': '网红打卡点',
                    '美食探索': '美食探索'
                }.get(category, category)
            }
            for category, count in categories
        ]
        
        return jsonify({
            'categories': category_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'获取分类统计失败: {str(e)}'}), 500

@attractions_bp.route('/recommend', methods=['GET'])
@jwt_required(optional=True)
def get_recommendations():
    """获取推荐景点"""
    try:
        user_id = get_jwt_identity()
        limit = request.args.get('limit', 10, type=int)
        category = request.args.get('category')
        
        # 基础推荐查询
        query = Attraction.query.filter(Attraction.rating >= 4.0)
        
        if category:
            query = query.filter(Attraction.category == category)
        
        # 如果用户已登录，基于用户兴趣推荐
        if user_id:
            user = User.query.get(user_id)
            if user and user.interests:
                try:
                    interests = json.loads(user.interests)
                    # 简单的基于标签匹配的推荐
                    interest_conditions = []
                    for interest in interests:
                        interest_conditions.append(
                            or_(
                                Attraction.tags.contains(interest),
                                Attraction.description.contains(interest)
                            )
                        )
                    if interest_conditions:
                        query = query.filter(or_(*interest_conditions))
                except:
                    pass
        
        # 按评分和评价数量排序
        attractions = query.order_by(
            (Attraction.rating * Attraction.review_count).desc()
        ).limit(limit).all()
        
        # 如果推荐结果不足，补充热门景点
        if len(attractions) < limit:
            remaining = limit - len(attractions)
            attraction_ids = [a.id for a in attractions]
            
            additional_attractions = Attraction.query\
                .filter(~Attraction.id.in_(attraction_ids))\
                .order_by(Attraction.rating.desc())\
                .limit(remaining).all()
            
            attractions.extend(additional_attractions)
        
        return jsonify({
            'recommendations': [attraction.to_dict() for attraction in attractions],
            'total': len(attractions)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'获取推荐失败: {str(e)}'}), 500

@attractions_bp.route('/nearby', methods=['GET'])
def get_nearby_attractions():
    """获取附近景点"""
    try:
        lat = request.args.get('lat', type=float)
        lng = request.args.get('lng', type=float)
        radius = request.args.get('radius', 5.0, type=float)  # 默认5公里
        limit = request.args.get('limit', 20, type=int)
        
        if not lat or not lng:
            return jsonify({'error': '经纬度参数不能为空'}), 400
        
        # 简单的距离计算（实际项目中应使用更精确的地理计算）
        attractions = Attraction.query.filter(
            and_(
                Attraction.latitude.isnot(None),
                Attraction.longitude.isnot(None)
            )
        ).all()
        
        nearby_attractions = []
        for attraction in attractions:
            # 计算距离（简化版本）
            distance = math.sqrt(
                (attraction.latitude - lat) ** 2 + 
                (attraction.longitude - lng) ** 2
            ) * 111  # 粗略转换为公里
            
            if distance <= radius:
                attraction_data = attraction.to_dict()
                attraction_data['distance'] = round(distance, 2)
                nearby_attractions.append(attraction_data)
        
        # 按距离排序
        nearby_attractions.sort(key=lambda x: x['distance'])
        
        return jsonify({
            'nearby_attractions': nearby_attractions[:limit],
            'center': {'lat': lat, 'lng': lng},
            'radius': radius
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'获取附近景点失败: {str(e)}'}), 500

@attractions_bp.route('/search', methods=['GET'])
def search_attractions():
    """搜索景点"""
    try:
        keyword = request.args.get('keyword', '').strip()
        if not keyword:
            return jsonify({'error': '搜索关键词不能为空'}), 400
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 12, type=int)
        
        # 多字段搜索
        query = Attraction.query.filter(
            or_(
                Attraction.name.contains(keyword),
                Attraction.description.contains(keyword),
                Attraction.address.contains(keyword),
                Attraction.tags.contains(keyword)
            )
        )
        
        # 按相关性排序（简化版本）
        query = query.order_by(
            db.case(
                (Attraction.name.contains(keyword), 3),
                (Attraction.description.contains(keyword), 2),
                else_=1
            ).desc(),
            Attraction.rating.desc()
        )
        
        pagination = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'attractions': [attraction.to_dict() for attraction in pagination.items],
            'keyword': keyword,
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
        return jsonify({'error': f'搜索失败: {str(e)}'}), 500
# -*- coding: utf-8 -*-
"""
志愿服务相关路由
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import json

from app import db
from models import VolunteerService, User, Attraction

volunteers_bp = Blueprint('volunteers', __name__)

@volunteers_bp.route('/', methods=['GET'])
def get_volunteer_services():
    """获取志愿服务列表"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        service_type = request.args.get('type')  # guide/accessibility/translation/emergency
        location = request.args.get('location')  # 地点筛选
        status = request.args.get('status', 'active')  # active/completed/cancelled
        
        query = VolunteerService.query
        
        # 状态筛选
        if status:
            query = query.filter(VolunteerService.status == status)
        
        # 服务类型筛选
        if service_type:
            query = query.filter(VolunteerService.service_type == service_type)
        
        # 地点筛选
        if location:
            query = query.filter(VolunteerService.location.contains(location))
        
        # 只显示未来的服务
        query = query.filter(VolunteerService.service_date >= datetime.now().date())
        
        # 按服务时间排序
        query = query.order_by(VolunteerService.service_date.asc(), VolunteerService.service_time.asc())
        
        pagination = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        services = []
        for service in pagination.items:
            service_data = service.to_dict()
            service_data['volunteer'] = service.volunteer.to_dict() if service.volunteer else None
            service_data['attraction'] = service.attraction.to_dict() if service.attraction else None
            services.append(service_data)
        
        return jsonify({
            'services': services,
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
        return jsonify({'error': f'获取志愿服务列表失败: {str(e)}'}), 500

@volunteers_bp.route('/', methods=['POST'])
@jwt_required()
def create_volunteer_service():
    """创建志愿服务"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # 验证必填字段
        required_fields = ['service_type', 'title', 'description', 'service_date', 'service_time', 'location']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field}不能为空'}), 400
        
        # 验证服务类型
        valid_types = ['guide', 'accessibility', 'translation', 'emergency']
        if data['service_type'] not in valid_types:
            return jsonify({'error': f'服务类型必须是: {", ".join(valid_types)}'}), 400
        
        # 验证服务日期（不能是过去的日期）
        service_date = datetime.strptime(data['service_date'], '%Y-%m-%d').date()
        if service_date < datetime.now().date():
            return jsonify({'error': '服务日期不能是过去的日期'}), 400
        
        # 创建志愿服务
        service = VolunteerService(
            volunteer_id=user_id,
            service_type=data['service_type'],
            title=data['title'],
            description=data['description'],
            service_date=service_date,
            service_time=datetime.strptime(data['service_time'], '%H:%M').time(),
            duration=data.get('duration', 60),  # 默认60分钟
            location=data['location'],
            max_participants=data.get('max_participants', 10),
            requirements=data.get('requirements', ''),
            contact_info=data.get('contact_info', ''),
            attraction_id=data.get('attraction_id'),
            languages=json.dumps(data.get('languages', []), ensure_ascii=False),
            accessibility_features=json.dumps(data.get('accessibility_features', []), ensure_ascii=False)
        )
        
        # 验证关联景点
        if service.attraction_id:
            attraction = Attraction.query.get(service.attraction_id)
            if not attraction:
                return jsonify({'error': '关联景点不存在'}), 404
        
        db.session.add(service)
        db.session.commit()
        
        return jsonify({
            'message': '志愿服务创建成功',
            'service': service.to_dict()
        }), 201
        
    except ValueError as e:
        return jsonify({'error': f'日期时间格式错误: {str(e)}'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'创建志愿服务失败: {str(e)}'}), 500

@volunteers_bp.route('/<int:service_id>', methods=['GET'])
def get_volunteer_service_detail(service_id):
    """获取志愿服务详情"""
    try:
        service = VolunteerService.query.get(service_id)
        
        if not service:
            return jsonify({'error': '志愿服务不存在'}), 404
        
        service_data = service.to_dict()
        service_data['volunteer'] = service.volunteer.to_dict() if service.volunteer else None
        service_data['attraction'] = service.attraction.to_dict() if service.attraction else None
        
        return jsonify({
            'service': service_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'获取志愿服务详情失败: {str(e)}'}), 500

@volunteers_bp.route('/<int:service_id>/join', methods=['POST'])
@jwt_required()
def join_volunteer_service(service_id):
    """参加志愿服务"""
    try:
        user_id = get_jwt_identity()
        service = VolunteerService.query.get(service_id)
        
        if not service:
            return jsonify({'error': '志愿服务不存在'}), 404
        
        if service.volunteer_id == user_id:
            return jsonify({'error': '不能参加自己发布的志愿服务'}), 400
        
        if service.status != 'active':
            return jsonify({'error': '该志愿服务已结束或取消'}), 400
        
        if service.current_participants >= service.max_participants:
            return jsonify({'error': '参与人数已满'}), 400
        
        # 检查是否已经参加
        participants = json.loads(service.participants or '[]')
        if user_id in participants:
            return jsonify({'error': '您已经参加了该志愿服务'}), 400
        
        # 添加参与者
        participants.append(user_id)
        service.participants = json.dumps(participants, ensure_ascii=False)
        service.current_participants = len(participants)
        
        db.session.commit()
        
        return jsonify({
            'message': '成功参加志愿服务',
            'current_participants': service.current_participants
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'参加志愿服务失败: {str(e)}'}), 500

@volunteers_bp.route('/<int:service_id>/leave', methods=['POST'])
@jwt_required()
def leave_volunteer_service(service_id):
    """退出志愿服务"""
    try:
        user_id = get_jwt_identity()
        service = VolunteerService.query.get(service_id)
        
        if not service:
            return jsonify({'error': '志愿服务不存在'}), 404
        
        participants = json.loads(service.participants or '[]')
        if user_id not in participants:
            return jsonify({'error': '您未参加该志愿服务'}), 400
        
        # 移除参与者
        participants.remove(user_id)
        service.participants = json.dumps(participants, ensure_ascii=False)
        service.current_participants = len(participants)
        
        db.session.commit()
        
        return jsonify({
            'message': '成功退出志愿服务',
            'current_participants': service.current_participants
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'退出志愿服务失败: {str(e)}'}), 500

@volunteers_bp.route('/my-services', methods=['GET'])
@jwt_required()
def get_my_volunteer_services():
    """获取我发布的志愿服务"""
    try:
        user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status = request.args.get('status')  # active/completed/cancelled
        
        query = VolunteerService.query.filter_by(volunteer_id=user_id)
        
        if status:
            query = query.filter(VolunteerService.status == status)
        
        query = query.order_by(VolunteerService.created_at.desc())
        
        pagination = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        services = []
        for service in pagination.items:
            service_data = service.to_dict()
            service_data['attraction'] = service.attraction.to_dict() if service.attraction else None
            services.append(service_data)
        
        return jsonify({
            'services': services,
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
        return jsonify({'error': f'获取我的志愿服务失败: {str(e)}'}), 500

@volunteers_bp.route('/my-participations', methods=['GET'])
@jwt_required()
def get_my_participations():
    """获取我参加的志愿服务"""
    try:
        user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # 查找包含当前用户ID的志愿服务
        services = VolunteerService.query.filter(
            VolunteerService.participants.contains(str(user_id))
        ).order_by(VolunteerService.service_date.desc()).all()
        
        # 手动分页
        start = (page - 1) * per_page
        end = start + per_page
        paginated_services = services[start:end]
        
        result_services = []
        for service in paginated_services:
            service_data = service.to_dict()
            service_data['volunteer'] = service.volunteer.to_dict() if service.volunteer else None
            service_data['attraction'] = service.attraction.to_dict() if service.attraction else None
            result_services.append(service_data)
        
        total = len(services)
        pages = (total + per_page - 1) // per_page
        
        return jsonify({
            'services': result_services,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total,
                'pages': pages,
                'has_prev': page > 1,
                'has_next': page < pages
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'获取我参加的志愿服务失败: {str(e)}'}), 500

@volunteers_bp.route('/<int:service_id>', methods=['PUT'])
@jwt_required()
def update_volunteer_service(service_id):
    """更新志愿服务"""
    try:
        user_id = get_jwt_identity()
        service = VolunteerService.query.get(service_id)
        
        if not service:
            return jsonify({'error': '志愿服务不存在'}), 404
        
        if service.volunteer_id != user_id:
            return jsonify({'error': '无权限修改此志愿服务'}), 403
        
        data = request.get_json()
        
        # 更新允许修改的字段
        updatable_fields = [
            'title', 'description', 'service_date', 'service_time', 
            'duration', 'location', 'max_participants', 'requirements', 
            'contact_info', 'languages', 'accessibility_features', 'status'
        ]
        
        for field in updatable_fields:
            if field in data:
                if field == 'service_date':
                    new_date = datetime.strptime(data[field], '%Y-%m-%d').date()
                    if new_date < datetime.now().date():
                        return jsonify({'error': '服务日期不能是过去的日期'}), 400
                    setattr(service, field, new_date)
                elif field == 'service_time':
                    setattr(service, field, datetime.strptime(data[field], '%H:%M').time())
                elif field in ['languages', 'accessibility_features']:
                    setattr(service, field, json.dumps(data[field], ensure_ascii=False))
                elif field == 'status':
                    valid_statuses = ['active', 'completed', 'cancelled']
                    if data[field] not in valid_statuses:
                        return jsonify({'error': f'状态必须是: {", ".join(valid_statuses)}'}), 400
                    setattr(service, field, data[field])
                else:
                    setattr(service, field, data[field])
        
        db.session.commit()
        
        return jsonify({
            'message': '志愿服务更新成功',
            'service': service.to_dict()
        }), 200
        
    except ValueError as e:
        return jsonify({'error': f'日期时间格式错误: {str(e)}'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'更新志愿服务失败: {str(e)}'}), 500

@volunteers_bp.route('/<int:service_id>', methods=['DELETE'])
@jwt_required()
def delete_volunteer_service(service_id):
    """删除志愿服务"""
    try:
        user_id = get_jwt_identity()
        service = VolunteerService.query.get(service_id)
        
        if not service:
            return jsonify({'error': '志愿服务不存在'}), 404
        
        if service.volunteer_id != user_id:
            return jsonify({'error': '无权限删除此志愿服务'}), 403
        
        db.session.delete(service)
        db.session.commit()
        
        return jsonify({
            'message': '志愿服务删除成功'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'删除志愿服务失败: {str(e)}'}), 500

@volunteers_bp.route('/stats', methods=['GET'])
def get_volunteer_stats():
    """获取志愿服务统计"""
    try:
        # 按服务类型统计
        type_stats = db.session.query(
            VolunteerService.service_type,
            db.func.count(VolunteerService.id).label('count')
        ).group_by(VolunteerService.service_type).all()
        
        # 按状态统计
        status_stats = db.session.query(
            VolunteerService.status,
            db.func.count(VolunteerService.id).label('count')
        ).group_by(VolunteerService.status).all()
        
        # 总统计
        total_services = VolunteerService.query.count()
        active_services = VolunteerService.query.filter_by(status='active').count()
        total_participants = db.session.query(
            db.func.sum(VolunteerService.current_participants)
        ).scalar() or 0
        
        return jsonify({
            'total_services': total_services,
            'active_services': active_services,
            'total_participants': total_participants,
            'type_distribution': {t: c for t, c in type_stats},
            'status_distribution': {s: c for s, c in status_stats}
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'获取统计数据失败: {str(e)}'}), 500
# -*- coding: utf-8 -*-
"""
路线规划相关路由
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import and_
import json
import math

from app import db
from models import Route, RouteAttraction, Attraction, User

routes_bp = Blueprint('routes', __name__)

@routes_bp.route('/', methods=['GET'])
def get_routes():
    """获取路线列表"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        difficulty = request.args.get('difficulty')
        is_barrier_free = request.args.get('is_barrier_free', type=bool)
        max_duration = request.args.get('max_duration', type=float)
        sort_by = request.args.get('sort_by', 'rating')  # rating/usage_count/created_at
        
        query = Route.query
        
        # 筛选条件
        if difficulty:
            query = query.filter(Route.difficulty_level == difficulty)
        
        if is_barrier_free:
            query = query.filter(Route.is_barrier_free == True)
        
        if max_duration:
            query = query.filter(Route.duration_hours <= max_duration)
        
        # 排序
        if sort_by == 'rating':
            query = query.order_by(Route.rating.desc())
        elif sort_by == 'usage_count':
            query = query.order_by(Route.usage_count.desc())
        elif sort_by == 'created_at':
            query = query.order_by(Route.created_at.desc())
        
        pagination = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        routes = [route.to_dict() for route in pagination.items]
        
        return jsonify({
            'routes': routes,
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
        return jsonify({'error': f'获取路线列表失败: {str(e)}'}), 500

@routes_bp.route('/<int:route_id>', methods=['GET'])
def get_route_detail(route_id):
    """获取路线详情"""
    try:
        route = Route.query.get(route_id)
        
        if not route:
            return jsonify({'error': '路线不存在'}), 404
        
        # 增加使用次数
        route.usage_count += 1
        db.session.commit()
        
        return jsonify({
            'route': route.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'获取路线详情失败: {str(e)}'}), 500

@routes_bp.route('/create', methods=['POST'])
@jwt_required()
def create_route():
    """创建新路线"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # 验证必填字段
        required_fields = ['name', 'attractions']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field}不能为空'}), 400
        
        if len(data['attractions']) < 2:
            return jsonify({'error': '路线至少需要包含2个景点'}), 400
        
        # 创建路线
        route = Route(
            name=data['name'],
            description=data.get('description', ''),
            creator_id=user_id,
            duration_hours=data.get('duration_hours'),
            difficulty_level=data.get('difficulty_level', '简单'),
            total_distance=data.get('total_distance'),
            estimated_cost=data.get('estimated_cost'),
            is_barrier_free=data.get('is_barrier_free', False)
        )
        
        db.session.add(route)
        db.session.flush()  # 获取route.id
        
        # 添加路线景点
        for i, attraction_data in enumerate(data['attractions']):
            attraction_id = attraction_data.get('attraction_id')
            if not attraction_id:
                continue
            
            # 验证景点是否存在
            attraction = Attraction.query.get(attraction_id)
            if not attraction:
                continue
            
            route_attraction = RouteAttraction(
                route_id=route.id,
                attraction_id=attraction_id,
                order=i + 1,
                visit_duration=attraction_data.get('visit_duration'),
                notes=attraction_data.get('notes')
            )
            db.session.add(route_attraction)
        
        db.session.commit()
        
        return jsonify({
            'message': '路线创建成功',
            'route': route.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'创建路线失败: {str(e)}'}), 500

@routes_bp.route('/generate', methods=['POST'])
@jwt_required(optional=True)
def generate_route():
    """智能生成路线"""
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        
        # 获取参数
        preferences = data.get('preferences', [])  # 用户偏好：红色历史/网红打卡/美食探索
        duration_hours = data.get('duration_hours', 8)  # 游览时长
        start_location = data.get('start_location')  # 起点坐标
        max_attractions = data.get('max_attractions', 6)  # 最大景点数
        is_barrier_free = data.get('is_barrier_free', False)  # 是否需要无障碍
        
        # 构建景点查询
        query = Attraction.query.filter(Attraction.rating >= 3.5)
        
        if preferences:
            query = query.filter(Attraction.category.in_(preferences))
        
        if is_barrier_free:
            query = query.filter(Attraction.is_barrier_free == True)
        
        # 获取候选景点
        candidate_attractions = query.order_by(Attraction.rating.desc()).limit(20).all()
        
        if len(candidate_attractions) < 2:
            return jsonify({'error': '没有找到足够的景点来生成路线'}), 400
        
        # 简单的路线生成算法
        selected_attractions = []
        total_duration = 0
        
        # 如果有起点，优先选择距离起点较近的景点
        if start_location:
            lat, lng = start_location.get('lat'), start_location.get('lng')
            if lat and lng:
                # 计算距离并排序
                for attraction in candidate_attractions:
                    if attraction.latitude and attraction.longitude:
                        distance = math.sqrt(
                            (attraction.latitude - lat) ** 2 + 
                            (attraction.longitude - lng) ** 2
                        )
                        attraction.distance_from_start = distance
                
                candidate_attractions.sort(key=lambda x: getattr(x, 'distance_from_start', float('inf')))
        
        # 选择景点
        for attraction in candidate_attractions:
            if len(selected_attractions) >= max_attractions:
                break
            
            # 估算游览时间（基于景点类型）
            estimated_visit_time = {
                '红色历史': 2.0,
                '网红打卡': 1.0,
                '美食探索': 1.5
            }.get(attraction.category, 1.5)
            
            if total_duration + estimated_visit_time <= duration_hours:
                selected_attractions.append({
                    'attraction': attraction,
                    'visit_duration': estimated_visit_time
                })
                total_duration += estimated_visit_time
        
        if len(selected_attractions) < 2:
            return jsonify({'error': '无法生成满足条件的路线'}), 400
        
        # 生成路线数据
        route_data = {
            'name': f'智能推荐路线 - {duration_hours}小时游',
            'description': f'基于您的偏好自动生成的{duration_hours}小时游览路线',
            'duration_hours': total_duration,
            'difficulty_level': '简单' if len(selected_attractions) <= 4 else '中等',
            'is_barrier_free': is_barrier_free,
            'attractions': [
                {
                    'attraction_id': item['attraction'].id,
                    'attraction': item['attraction'].to_dict(),
                    'visit_duration': item['visit_duration'],
                    'order': i + 1
                }
                for i, item in enumerate(selected_attractions)
            ]
        }
        
        return jsonify({
            'generated_route': route_data,
            'message': f'成功生成包含{len(selected_attractions)}个景点的路线'
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'生成路线失败: {str(e)}'}), 500

@routes_bp.route('/optimize', methods=['POST'])
def optimize_route():
    """优化路线顺序"""
    try:
        data = request.get_json()
        attraction_ids = data.get('attraction_ids', [])
        
        if len(attraction_ids) < 2:
            return jsonify({'error': '至少需要2个景点才能优化路线'}), 400
        
        # 获取景点信息
        attractions = Attraction.query.filter(Attraction.id.in_(attraction_ids)).all()
        attraction_dict = {a.id: a for a in attractions}
        
        # 简单的距离优化算法（最近邻）
        if all(a.latitude and a.longitude for a in attractions):
            optimized_order = []
            remaining = list(attraction_ids)
            current = remaining.pop(0)  # 从第一个景点开始
            optimized_order.append(current)
            
            while remaining:
                current_attraction = attraction_dict[current]
                min_distance = float('inf')
                next_attraction_id = None
                
                for attraction_id in remaining:
                    attraction = attraction_dict[attraction_id]
                    distance = math.sqrt(
                        (current_attraction.latitude - attraction.latitude) ** 2 +
                        (current_attraction.longitude - attraction.longitude) ** 2
                    )
                    
                    if distance < min_distance:
                        min_distance = distance
                        next_attraction_id = attraction_id
                
                if next_attraction_id:
                    optimized_order.append(next_attraction_id)
                    remaining.remove(next_attraction_id)
                    current = next_attraction_id
                else:
                    optimized_order.extend(remaining)
                    break
        else:
            # 如果没有坐标信息，保持原顺序
            optimized_order = attraction_ids
        
        # 返回优化后的景点信息
        optimized_attractions = [
            {
                'attraction_id': attraction_id,
                'attraction': attraction_dict[attraction_id].to_dict(),
                'order': i + 1
            }
            for i, attraction_id in enumerate(optimized_order)
        ]
        
        return jsonify({
            'optimized_attractions': optimized_attractions,
            'message': '路线优化完成'
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'路线优化失败: {str(e)}'}), 500

@routes_bp.route('/my-routes', methods=['GET'])
@jwt_required()
def get_my_routes():
    """获取我创建的路线"""
    try:
        user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        pagination = Route.query.filter_by(creator_id=user_id)\
            .order_by(Route.created_at.desc())\
            .paginate(page=page, per_page=per_page, error_out=False)
        
        routes = [route.to_dict() for route in pagination.items]
        
        return jsonify({
            'routes': routes,
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
        return jsonify({'error': f'获取我的路线失败: {str(e)}'}), 500
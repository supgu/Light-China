from flask import Blueprint, render_template, jsonify, request
from models import db, Attraction, Route, VolunteerService
from sqlalchemy import func
import json

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    """首页路由"""
    return render_template('index.html')

@main_bp.route('/api/map/china-data')
def get_china_map_data():
    """获取全国地图数据"""
    try:
        # 模拟全国城市热度数据
        china_data = [
            {'name': '北京', 'value': 1500, 'code': 'BJ', 'lat': 39.9042, 'lon': 116.4074},
            {'name': '上海', 'value': 1200, 'code': 'SH', 'lat': 31.2304, 'lon': 121.4737},
            {'name': '广州', 'value': 800, 'code': 'GZ', 'lat': 23.1291, 'lon': 113.2644},
            {'name': '深圳', 'value': 750, 'code': 'SZ', 'lat': 22.5431, 'lon': 114.0579},
            {'name': '杭州', 'value': 600, 'code': 'HZ', 'lat': 30.2741, 'lon': 120.1551},
            {'name': '南京', 'value': 550, 'code': 'NJ', 'lat': 32.0603, 'lon': 118.7969},
            {'name': '成都', 'value': 500, 'code': 'CD', 'lat': 30.5728, 'lon': 104.0668},
            {'name': '西安', 'value': 480, 'code': 'XA', 'lat': 34.3416, 'lon': 108.9398},
            {'name': '武汉', 'value': 450, 'code': 'WH', 'lat': 30.5928, 'lon': 114.3055},
            {'name': '重庆', 'value': 420, 'code': 'CQ', 'lat': 29.5647, 'lon': 106.5507},
            {'name': '天津', 'value': 400, 'code': 'TJ', 'lat': 39.3434, 'lon': 117.3616},
            {'name': '苏州', 'value': 380, 'code': 'SZ', 'lat': 31.2989, 'lon': 120.5853},
            {'name': '青岛', 'value': 350, 'code': 'QD', 'lat': 36.0986, 'lon': 120.3719},
            {'name': '大连', 'value': 320, 'code': 'DL', 'lat': 38.9140, 'lon': 121.6147},
            {'name': '厦门', 'value': 300, 'code': 'XM', 'lat': 24.4798, 'lon': 118.0894}
        ]
        
        return jsonify({
            'success': True,
            'data': china_data
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@main_bp.route('/api/map/city-data/<city_name>')
def get_city_data(city_name):
    """获取指定城市的详细数据"""
    try:
        # 根据城市名称查询景点数据
        attractions = Attraction.query.filter(
            Attraction.location.like(f'%{city_name}%')
        ).all()
        
        # 查询路线数据
        routes = Route.query.filter(
            Route.description.like(f'%{city_name}%')
        ).all()
        
        # 查询志愿服务数据
        volunteer_services = VolunteerService.query.filter(
            VolunteerService.location.like(f'%{city_name}%')
        ).all()
        
        # 构建城市数据
        city_data = {
            'city': city_name,
            'stats': {
                'attractions': len(attractions),
                'routes': len(routes),
                'volunteers': len(volunteer_services),
                'visits': sum([getattr(attr, 'rating', 0) * 100 for attr in attractions])  # 模拟访问量
            },
            'attractions': []
        }
        
        # 处理景点数据
        for attraction in attractions[:10]:  # 限制返回前10个
            attraction_data = {
                'id': attraction.id,
                'name': attraction.name,
                'type': 'red_history' if '红色' in attraction.description or '革命' in attraction.description or '纪念' in attraction.description else 'scenic',
                'description': attraction.description[:100] + '...' if len(attraction.description) > 100 else attraction.description,
                'location': attraction.location,
                'rating': attraction.rating,
                'is_barrier_free': attraction.is_barrier_free,
                'contact_phone': attraction.contact_phone
            }
            
            # 根据景点名称和描述判断类型
            if any(keyword in attraction.name for keyword in ['美食', '小吃', '餐厅', '食堂']):
                attraction_data['type'] = 'food'
            elif any(keyword in attraction.name for keyword in ['网红', '打卡', 'ins']):
                attraction_data['type'] = 'internet_famous'
            elif any(keyword in attraction.description for keyword in ['红色', '革命', '纪念', '党史', '抗战']):
                attraction_data['type'] = 'red_history'
            
            city_data['attractions'].append(attraction_data)
        
        return jsonify({
            'success': True,
            'data': city_data
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@main_bp.route('/api/map/ranking')
def get_city_ranking():
    """获取城市热度排行榜"""
    try:
        # 统计各城市的景点数量和评分
        city_stats = db.session.query(
            func.substring_index(Attraction.location, '市', 1).label('city'),
            func.count(Attraction.id).label('attraction_count'),
            func.avg(Attraction.rating).label('avg_rating')
        ).group_by(
            func.substring_index(Attraction.location, '市', 1)
        ).order_by(
            func.count(Attraction.id).desc()
        ).limit(10).all()
        
        ranking_data = []
        for i, (city, count, rating) in enumerate(city_stats, 1):
            # 清理城市名称
            clean_city = city.replace('省', '').replace('市', '').replace('自治区', '')
            if clean_city:
                ranking_data.append({
                    'rank': i,
                    'city': clean_city,
                    'attraction_count': count,
                    'avg_rating': round(float(rating or 0), 1),
                    'heat_score': count * (rating or 0) * 10  # 热度分数
                })
        
        # 如果数据库中数据不足，添加一些模拟数据
        if len(ranking_data) < 5:
            mock_data = [
                {'rank': 1, 'city': '上海', 'attraction_count': 25, 'avg_rating': 4.5, 'heat_score': 1125},
                {'rank': 2, 'city': '北京', 'attraction_count': 22, 'avg_rating': 4.3, 'heat_score': 946},
                {'rank': 3, 'city': '杭州', 'attraction_count': 18, 'avg_rating': 4.4, 'heat_score': 792},
                {'rank': 4, 'city': '广州', 'attraction_count': 16, 'avg_rating': 4.2, 'heat_score': 672},
                {'rank': 5, 'city': '成都', 'attraction_count': 15, 'avg_rating': 4.3, 'heat_score': 645},
                {'rank': 6, 'city': '西安', 'attraction_count': 14, 'avg_rating': 4.1, 'heat_score': 574},
                {'rank': 7, 'city': '南京', 'attraction_count': 12, 'avg_rating': 4.2, 'heat_score': 504},
                {'rank': 8, 'city': '深圳', 'attraction_count': 11, 'avg_rating': 4.0, 'heat_score': 440},
                {'rank': 9, 'city': '苏州', 'attraction_count': 10, 'avg_rating': 4.3, 'heat_score': 430},
                {'rank': 10, 'city': '青岛', 'attraction_count': 9, 'avg_rating': 4.1, 'heat_score': 369}
            ]
            ranking_data = mock_data[:10]
        
        return jsonify({
            'success': True,
            'data': ranking_data
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@main_bp.route('/api/search')
def search():
    """搜索城市和景点"""
    try:
        query = request.args.get('q', '').strip()
        if not query:
            return jsonify({
                'success': False,
                'message': '搜索关键词不能为空'
            }), 400
        
        # 搜索景点
        attractions = Attraction.query.filter(
            db.or_(
                Attraction.name.like(f'%{query}%'),
                Attraction.location.like(f'%{query}%'),
                Attraction.description.like(f'%{query}%')
            )
        ).limit(10).all()
        
        # 搜索路线
        routes = Route.query.filter(
            db.or_(
                Route.name.like(f'%{query}%'),
                Route.description.like(f'%{query}%')
            )
        ).limit(5).all()
        
        search_results = {
            'attractions': [{
                'id': attr.id,
                'name': attr.name,
                'location': attr.location,
                'rating': attr.rating,
                'type': 'attraction'
            } for attr in attractions],
            'routes': [{
                'id': route.id,
                'name': route.name,
                'description': route.description[:100] + '...' if len(route.description) > 100 else route.description,
                'type': 'route'
            } for route in routes]
        }
        
        return jsonify({
            'success': True,
            'data': search_results
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500
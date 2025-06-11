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
    """获取指定城市的景点数据"""
    try:
        # 查询指定城市的景点
        attractions = Attraction.query.filter_by(city=city_name).all()
        
        city_data = []
        for attraction in attractions:
            city_data.append({
                'id': attraction.id,
                'name': attraction.name,
                'lat': float(attraction.latitude) if attraction.latitude else 0,
                'lon': float(attraction.longitude) if attraction.longitude else 0,
                'rating': float(attraction.rating) if attraction.rating else 0,
                'review_count': attraction.review_count or 0,
                'category': attraction.category or '景点',
                'description': attraction.description or '',
                'image_url': attraction.image_url or '',
                'address': attraction.address or '',
                'opening_hours': attraction.opening_hours or '',
                'ticket_price': attraction.ticket_price or '',
                'phone': attraction.phone or '',
                'website': attraction.website or ''
            })
        
        return jsonify({
            'success': True,
            'data': city_data,
            'count': len(city_data)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@main_bp.route('/api/map/ranking')
def get_city_ranking():
    """获取城市排行榜数据"""
    try:
        # 按城市统计景点数量和平均评分
        city_stats = db.session.query(
            Attraction.city,
            func.count(Attraction.id).label('attraction_count'),
            func.avg(Attraction.rating).label('avg_rating'),
            func.sum(Attraction.review_count).label('total_reviews')
        ).filter(
            Attraction.city.isnot(None)
        ).group_by(
            Attraction.city
        ).order_by(
            func.count(Attraction.id).desc()
        ).limit(20).all()
        
        ranking_data = []
        for i, (city, count, avg_rating, total_reviews) in enumerate(city_stats, 1):
            ranking_data.append({
                'rank': i,
                'city': city,
                'attraction_count': count,
                'avg_rating': round(float(avg_rating) if avg_rating else 0, 1),
                'total_reviews': int(total_reviews) if total_reviews else 0
            })
        
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
    """搜索景点"""
    try:
        query = request.args.get('q', '').strip()
        city = request.args.get('city', '').strip()
        category = request.args.get('category', '').strip()
        min_rating = request.args.get('min_rating', type=float)
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # 构建查询
        search_query = Attraction.query
        
        if query:
            search_query = search_query.filter(
                Attraction.name.contains(query) |
                Attraction.description.contains(query) |
                Attraction.address.contains(query)
            )
        
        if city:
            search_query = search_query.filter(Attraction.city == city)
        
        if category:
            search_query = search_query.filter(Attraction.category == category)
        
        if min_rating:
            search_query = search_query.filter(Attraction.rating >= min_rating)
        
        # 分页
        pagination = search_query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        attractions = []
        for attraction in pagination.items:
            attractions.append({
                'id': attraction.id,
                'name': attraction.name,
                'city': attraction.city,
                'category': attraction.category,
                'rating': float(attraction.rating) if attraction.rating else 0,
                'review_count': attraction.review_count or 0,
                'image_url': attraction.image_url,
                'description': attraction.description,
                'address': attraction.address,
                'latitude': float(attraction.latitude) if attraction.latitude else None,
                'longitude': float(attraction.longitude) if attraction.longitude else None
            })
        
        return jsonify({
            'success': True,
            'data': attractions,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@main_bp.route('/reviews')
def reviews_page():
    """评价页面路由"""
    try:
        from models import Review, Attraction, User
        from sqlalchemy import func, desc
        
        # 获取筛选参数
        page = request.args.get('page', 1, type=int)
        sort_by = request.args.get('sort_by', 'created_at')
        city_filter = request.args.get('city', '')
        rating_filter = request.args.get('rating', type=int)
        per_page = 20
        
        # 构建查询
        query = Review.query.join(Attraction).join(User)
        
        # 城市筛选
        if city_filter:
            query = query.filter(Attraction.city == city_filter)
            
        # 评分筛选
        if rating_filter:
            query = query.filter(Review.rating == rating_filter)
            
        # 排序
        if sort_by == 'rating':
            query = query.order_by(desc(Review.rating))
        elif sort_by == 'helpful_count':
            query = query.order_by(desc(Review.helpful_count))
        else:
            query = query.order_by(desc(Review.created_at))
            
        # 分页
        pagination = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        reviews = pagination.items
        
        # 获取统计数据
        total_reviews = Review.query.count()
        average_rating = db.session.query(func.avg(Review.rating)).scalar() or 0
        active_reviewers = db.session.query(func.count(func.distinct(Review.user_id))).scalar() or 0
        
        # 今日新增评价
        from datetime import date
        today_reviews = Review.query.filter(
            func.date(Review.created_at) == date.today()
        ).count()
        
        # 获取所有城市列表
        cities = db.session.query(Attraction.city).distinct().all()
        cities = [city[0] for city in cities if city[0]]
        
        return render_template('reviews.html',
            reviews=reviews,
            total_reviews=total_reviews,
            average_rating=round(average_rating, 1),
            active_reviewers=active_reviewers,
            today_reviews=today_reviews,
            cities=cities,
            has_more=pagination.has_next
        )
        
    except Exception as e:
        print(f"评价页面错误: {str(e)}")
        return render_template('error.html', 
            error_message="加载评价页面失败",
            error_details=str(e)
        ), 500
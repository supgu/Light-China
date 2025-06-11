# -*- coding: utf-8 -*-
"""
数据库初始化脚本
"""

import os
import sys
from datetime import datetime, date, time
import json

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from models import User, Attraction, Route, RouteAttraction, Review, VolunteerService
from werkzeug.security import generate_password_hash

def init_database():
    """初始化数据库"""
    app = create_app()
    
    with app.app_context():
        # 删除所有表
        db.drop_all()
        print("已删除所有数据表")
        
        # 创建所有表
        db.create_all()
        print("已创建所有数据表")
        
        # 创建示例数据
        create_sample_data()
        print("已创建示例数据")

def create_sample_data():
    """创建示例数据"""
    
    # 创建示例用户
    users = [
        {
            'username': 'admin',
            'email': 'admin@example.com',
            'password': 'admin123',
            'nickname': '管理员',
            'phone': '13800138000',
            'gender': 'other',
            'birth_date': date(1990, 1, 1),
            'interests': json.dumps(['历史文化', '自然风光', '美食'], ensure_ascii=False),
            'accessibility_needs': json.dumps(['无障碍通道'], ensure_ascii=False),
            'is_volunteer': True
        },
        {
            'username': 'tourist1',
            'email': 'tourist1@example.com',
            'password': 'password123',
            'nickname': '旅行爱好者',
            'phone': '13800138001',
            'gender': 'male',
            'birth_date': date(1995, 5, 15),
            'interests': json.dumps(['自然风光', '户外运动'], ensure_ascii=False),
            'accessibility_needs': json.dumps([], ensure_ascii=False),
            'is_volunteer': False
        },
        {
            'username': 'guide1',
            'email': 'guide1@example.com',
            'password': 'guide123',
            'nickname': '专业导游',
            'phone': '13800138002',
            'gender': 'female',
            'birth_date': date(1988, 8, 20),
            'interests': json.dumps(['历史文化', '艺术展览'], ensure_ascii=False),
            'accessibility_needs': json.dumps([], ensure_ascii=False),
            'is_volunteer': True
        }
    ]
    
    user_objects = []
    for user_data in users:
        user = User(
            username=user_data['username'],
            email=user_data['email'],
            password_hash=generate_password_hash(user_data['password']),
            nickname=user_data['nickname'],
            phone=user_data['phone'],
            gender=user_data['gender'],
            birth_date=user_data['birth_date'],
            interests=user_data['interests'],
            accessibility_needs=user_data['accessibility_needs'],
            is_volunteer=user_data['is_volunteer']
        )
        db.session.add(user)
        user_objects.append(user)
    
    db.session.commit()
    print(f"已创建 {len(users)} 个示例用户")
    
    # 创建示例景点
    attractions = [
        {
            'name': '故宫博物院',
            'category': '历史文化',
            'description': '明清两代的皇家宫殿，现为世界文化遗产和国家重点文物保护单位。',
            'address': '北京市东城区景山前街4号',
            'latitude': 39.9163,
            'longitude': 116.3972,
            'opening_hours': '08:30-17:00',
            'ticket_price': 60.0,
            'contact_phone': '010-85007421',
            'images': json.dumps([
                'https://example.com/gugong1.jpg',
                'https://example.com/gugong2.jpg'
            ], ensure_ascii=False),
            'tags': json.dumps(['世界文化遗产', '皇家建筑', '历史'], ensure_ascii=False),
            'rating': 4.8,
            'review_count': 15420,
            'is_barrier_free': True
        },
        {
            'name': '天安门广场',
            'category': '历史文化',
            'description': '世界上最大的城市广场之一，是中华人民共和国的象征。',
            'address': '北京市东城区东长安街',
            'latitude': 39.9042,
            'longitude': 116.3974,
            'opening_hours': '全天开放',
            'ticket_price': 0.0,
            'contact_phone': '010-63095630',
            'images': json.dumps([
                'https://example.com/tiananmen1.jpg'
            ], ensure_ascii=False),
            'tags': json.dumps(['广场', '政治中心', '免费'], ensure_ascii=False),
            'rating': 4.6,
            'review_count': 8930,
            'is_barrier_free': True
        },
        {
            'name': '颐和园',
            'category': '自然风光',
            'description': '中国古典园林之首，以昆明湖、万寿山为基址，以杭州西湖为蓝本。',
            'address': '北京市海淀区新建宫门路19号',
            'latitude': 39.9998,
            'longitude': 116.2754,
            'opening_hours': '06:30-18:00',
            'ticket_price': 30.0,
            'contact_phone': '010-62881144',
            'images': json.dumps([
                'https://example.com/yiheyuan1.jpg',
                'https://example.com/yiheyuan2.jpg'
            ], ensure_ascii=False),
            'tags': json.dumps(['皇家园林', '湖泊', '古建筑'], ensure_ascii=False),
            'rating': 4.7,
            'review_count': 12580,
            'is_barrier_free': False
        },
        {
            'name': '798艺术区',
            'category': '艺术展览',
            'description': '由原国营798厂等电子工业的老厂房改造而成的新型文化创意产业集聚区。',
            'address': '北京市朝阳区酒仙桥路4号',
            'latitude': 39.9842,
            'longitude': 116.4967,
            'opening_hours': '10:00-22:00',
            'ticket_price': 0.0,
            'contact_phone': '010-64387888',
            'images': json.dumps([
                'https://example.com/798_1.jpg'
            ], ensure_ascii=False),
            'tags': json.dumps(['当代艺术', '创意园区', '免费'], ensure_ascii=False),
            'rating': 4.4,
            'review_count': 5670,
            'is_barrier_free': True
        },
        {
            'name': '南锣鼓巷',
            'category': '美食',
            'description': '北京最古老的街区之一，有着丰富的历史文化底蕴和众多特色小吃。',
            'address': '北京市东城区南锣鼓巷',
            'latitude': 39.9368,
            'longitude': 116.4034,
            'opening_hours': '全天开放',
            'ticket_price': 0.0,
            'contact_phone': '',
            'images': json.dumps([
                'https://example.com/nanluoguxiang1.jpg'
            ], ensure_ascii=False),
            'tags': json.dumps(['胡同', '小吃', '文艺'], ensure_ascii=False),
            'rating': 4.2,
            'review_count': 9870,
            'is_barrier_free': False
        }
    ]
    
    attraction_objects = []
    for attraction_data in attractions:
        attraction = Attraction(**attraction_data)
        db.session.add(attraction)
        attraction_objects.append(attraction)
    
    db.session.commit()
    print(f"已创建 {len(attractions)} 个示例景点")
    
    # 创建示例路线
    routes = [
        {
            'name': '北京经典一日游',
            'description': '游览北京最著名的景点，体验古都文化。',
            'creator_id': user_objects[0].id,
            'duration_hours': 8.0,
            'difficulty_level': 'easy',
            'total_distance': 25.0,
            'estimated_cost': 120.0,
            'is_barrier_free': True,
            'rating': 4.5,
            'usage_count': 156
        },
        {
            'name': '艺术文化探索之旅',
            'description': '探索北京的现代艺术和传统文化的完美结合。',
            'creator_id': user_objects[1].id,
            'duration_hours': 6.0,
            'difficulty_level': 'medium',
            'total_distance': 15.0,
            'estimated_cost': 80.0,
            'is_barrier_free': True,
            'rating': 4.2,
            'usage_count': 89
        }
    ]
    
    route_objects = []
    for route_data in routes:
        route = Route(**route_data)
        db.session.add(route)
        route_objects.append(route)
    
    db.session.commit()
    print(f"已创建 {len(routes)} 条示例路线")
    
    # 创建路线景点关联
    route_attractions = [
        # 北京经典一日游
        {'route_id': route_objects[0].id, 'attraction_id': attraction_objects[1].id, 'order': 1, 'visit_duration': 60},  # 天安门广场
        {'route_id': route_objects[0].id, 'attraction_id': attraction_objects[0].id, 'order': 2, 'visit_duration': 180}, # 故宫
        {'route_id': route_objects[0].id, 'attraction_id': attraction_objects[4].id, 'order': 3, 'visit_duration': 120}, # 南锣鼓巷
        {'route_id': route_objects[0].id, 'attraction_id': attraction_objects[2].id, 'order': 4, 'visit_duration': 120}, # 颐和园
        
        # 艺术文化探索之旅
        {'route_id': route_objects[1].id, 'attraction_id': attraction_objects[3].id, 'order': 1, 'visit_duration': 180}, # 798艺术区
        {'route_id': route_objects[1].id, 'attraction_id': attraction_objects[4].id, 'order': 2, 'visit_duration': 120}, # 南锣鼓巷
        {'route_id': route_objects[1].id, 'attraction_id': attraction_objects[0].id, 'order': 3, 'visit_duration': 60},  # 故宫
    ]
    
    for ra_data in route_attractions:
        route_attraction = RouteAttraction(**ra_data)
        db.session.add(route_attraction)
    
    db.session.commit()
    print(f"已创建 {len(route_attractions)} 个路线景点关联")
    
    # 创建示例评价
    reviews = [
        {
            'user_id': user_objects[1].id,
            'attraction_id': attraction_objects[0].id,
            'rating': 5,
            'title': '震撼的历史体验',
            'content': '故宫真的太壮观了！建筑精美，历史厚重，值得花一整天时间慢慢游览。',
            'images': json.dumps([], ensure_ascii=False),
            'visit_date': date(2024, 1, 15),
            'helpful_count': 23
        },
        {
            'user_id': user_objects[2].id,
            'attraction_id': attraction_objects[0].id,
            'rating': 4,
            'title': '值得一去',
            'content': '故宫确实很棒，但是人太多了，建议早点去或者选择淡季。',
            'images': json.dumps([], ensure_ascii=False),
            'visit_date': date(2024, 1, 20),
            'helpful_count': 15
        },
        {
            'user_id': user_objects[1].id,
            'attraction_id': attraction_objects[3].id,
            'rating': 4,
            'title': '艺术爱好者的天堂',
            'content': '798艺术区有很多有趣的展览和装置艺术，咖啡厅也很有特色。',
            'images': json.dumps([], ensure_ascii=False),
            'visit_date': date(2024, 1, 25),
            'helpful_count': 8
        }
    ]
    
    for review_data in reviews:
        review = Review(**review_data)
        db.session.add(review)
    
    db.session.commit()
    print(f"已创建 {len(reviews)} 个示例评价")
    
    # 创建示例志愿服务
    volunteer_services = [
        {
            'volunteer_id': user_objects[0].id,
            'service_type': 'guide',
            'title': '故宫深度讲解服务',
            'description': '为游客提供故宫历史文化深度讲解，包括建筑特色、历史故事等。',
            'target_group': '普通游客',
            'location': '故宫博物院',
            'available_dates': json.dumps(['2024-02-15', '2024-02-16', '2024-02-17'], ensure_ascii=False),
            'max_participants': 8,
            'current_participants': 3,
            'contact_info': '微信：admin_guide',
            'status': 'active'
        },
        {
            'volunteer_id': user_objects[2].id,
            'service_type': 'accessibility',
            'title': '无障碍出行协助',
            'description': '为行动不便的游客提供出行协助，包括轮椅推行、路线指引等服务。',
            'target_group': '残障人士',
            'location': '颐和园',
            'available_dates': json.dumps(['2024-02-20', '2024-02-21'], ensure_ascii=False),
            'max_participants': 5,
            'current_participants': 2,
            'contact_info': '电话：13800138002',
            'status': 'active'
        },
        {
            'volunteer_id': user_objects[0].id,
            'service_type': 'translation',
            'title': '外国游客翻译服务',
            'description': '为外国游客提供中英文翻译服务，帮助他们更好地了解中国文化。',
            'target_group': '外国游客',
            'location': '798艺术区',
            'available_dates': json.dumps(['2024-02-25', '2024-02-26'], ensure_ascii=False),
            'max_participants': 10,
            'current_participants': 3,
            'contact_info': '邮箱：admin@example.com',
            'status': 'active'
        }
    ]
    
    for vs_data in volunteer_services:
        volunteer_service = VolunteerService(**vs_data)
        db.session.add(volunteer_service)
    
    db.session.commit()
    print(f"已创建 {len(volunteer_services)} 个示例志愿服务")
    
    print("\n=== 示例数据创建完成 ===")
    print("示例用户账号：")
    print("- 管理员: admin / admin123")
    print("- 游客: tourist1 / password123")
    print("- 导游: guide1 / guide123")
    print("\n可以使用这些账号登录测试系统功能。")

if __name__ == '__main__':
    init_database()
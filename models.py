# -*- coding: utf-8 -*-
"""
点亮中国·点亮上海 旅游推荐平台
数据库模型
"""

from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    """用户模型"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, comment='用户名')
    email = db.Column(db.String(120), unique=True, nullable=False, comment='邮箱')
    password_hash = db.Column(db.String(255), nullable=False, comment='密码哈希')
    nickname = db.Column(db.String(50), comment='昵称')
    avatar = db.Column(db.String(255), comment='头像URL')
    phone = db.Column(db.String(20), comment='手机号')
    gender = db.Column(db.String(10), comment='性别')
    birth_date = db.Column(db.Date, comment='出生日期')
    age_group = db.Column(db.String(20), comment='年龄段')
    interests = db.Column(db.Text, comment='兴趣标签，JSON格式')
    accessibility_needs = db.Column(db.Text, comment='无障碍需求，JSON格式')
    is_volunteer = db.Column(db.Boolean, default=False, comment='是否为志愿者')
    volunteer_skills = db.Column(db.Text, comment='志愿服务技能')
    created_at = db.Column(db.DateTime, default=datetime.utcnow, comment='创建时间')
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, comment='更新时间')
    
    # 关系
    reviews = db.relationship('Review', backref='user', lazy='dynamic')
    routes = db.relationship('Route', backref='creator', lazy='dynamic')
    volunteer_services = db.relationship('VolunteerService', backref='volunteer', lazy='dynamic')
    
    def set_password(self, password):
        """设置密码"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """验证密码"""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'nickname': self.nickname,
            'avatar': self.avatar,
            'phone': self.phone,
            'gender': self.gender,
            'birth_date': self.birth_date.isoformat() if self.birth_date else None,
            'age_group': self.age_group,
            'interests': self.interests,
            'accessibility_needs': self.accessibility_needs,
            'is_volunteer': self.is_volunteer,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Attraction(db.Model):
    """景点模型"""
    __tablename__ = 'attractions'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, comment='景点名称')
    category = db.Column(db.String(50), nullable=False, comment='景点类别：红色历史/网红打卡/美食探索')
    description = db.Column(db.Text, comment='景点描述')
    address = db.Column(db.String(255), comment='详细地址')
    city = db.Column(db.String(50), comment='所在城市')
    latitude = db.Column(db.Float, comment='纬度')
    longitude = db.Column(db.Float, comment='经度')
    opening_hours = db.Column(db.String(100), comment='开放时间')
    ticket_price = db.Column(db.Float, default=0.0, comment='门票价格')
    contact_phone = db.Column(db.String(20), comment='联系电话')
    images = db.Column(db.Text, comment='图片URL列表，JSON格式')
    tags = db.Column(db.Text, comment='标签，JSON格式')
    rating = db.Column(db.Float, default=0.0, comment='平均评分')
    review_count = db.Column(db.Integer, default=0, comment='评价数量')
    is_barrier_free = db.Column(db.Boolean, default=False, comment='是否无障碍')
    created_at = db.Column(db.DateTime, default=datetime.utcnow, comment='创建时间')
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, comment='更新时间')
    
    # 关系
    reviews = db.relationship('Review', backref='attraction', lazy='dynamic')
    route_attractions = db.relationship('RouteAttraction', backref='attraction', lazy='dynamic')
    
    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'description': self.description,
            'address': self.address,
            'city': self.city,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'opening_hours': self.opening_hours,
            'ticket_price': self.ticket_price,
            'contact_phone': self.contact_phone,
            'images': self.images,
            'tags': self.tags,
            'rating': self.rating,
            'review_count': self.review_count,
            'is_barrier_free': self.is_barrier_free,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Route(db.Model):
    """路线模型"""
    __tablename__ = 'routes'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, comment='路线名称')
    description = db.Column(db.Text, comment='路线描述')
    creator_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, comment='创建者ID')
    duration_hours = db.Column(db.Float, comment='预计用时（小时）')
    difficulty_level = db.Column(db.String(20), comment='难度等级：简单/中等/困难')
    total_distance = db.Column(db.Float, comment='总距离（公里）')
    estimated_cost = db.Column(db.Float, comment='预估费用')
    is_barrier_free = db.Column(db.Boolean, default=False, comment='是否无障碍路线')
    rating = db.Column(db.Float, default=0.0, comment='路线评分')
    usage_count = db.Column(db.Integer, default=0, comment='使用次数')
    created_at = db.Column(db.DateTime, default=datetime.utcnow, comment='创建时间')
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, comment='更新时间')
    
    # 关系
    route_attractions = db.relationship('RouteAttraction', backref='route', lazy='dynamic', order_by='RouteAttraction.order')
    
    def to_dict(self):
        """转换为字典"""
        attractions = [ra.attraction.to_dict() for ra in self.route_attractions.order_by('order')]
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'creator_id': self.creator_id,
            'duration_hours': self.duration_hours,
            'difficulty_level': self.difficulty_level,
            'total_distance': self.total_distance,
            'estimated_cost': self.estimated_cost,
            'is_barrier_free': self.is_barrier_free,
            'rating': self.rating,
            'usage_count': self.usage_count,
            'attractions': attractions,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class RouteAttraction(db.Model):
    """路线景点关联模型"""
    __tablename__ = 'route_attractions'
    
    id = db.Column(db.Integer, primary_key=True)
    route_id = db.Column(db.Integer, db.ForeignKey('routes.id'), nullable=False)
    attraction_id = db.Column(db.Integer, db.ForeignKey('attractions.id'), nullable=False)
    order = db.Column(db.Integer, nullable=False, comment='景点在路线中的顺序')
    visit_duration = db.Column(db.Float, comment='建议游览时长（小时）')
    notes = db.Column(db.Text, comment='备注信息')

class Review(db.Model):
    """评价模型"""
    __tablename__ = 'reviews'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    attraction_id = db.Column(db.Integer, db.ForeignKey('attractions.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False, comment='评分1-5')
    title = db.Column(db.String(100), comment='评价标题')
    content = db.Column(db.Text, comment='评价内容')
    images = db.Column(db.Text, comment='评价图片，JSON格式')
    visit_date = db.Column(db.Date, comment='游览日期')
    is_verified = db.Column(db.Boolean, default=False, comment='是否实地验证')
    helpful_count = db.Column(db.Integer, default=0, comment='有用数')
    created_at = db.Column(db.DateTime, default=datetime.utcnow, comment='创建时间')
    
    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'attraction_id': self.attraction_id,
            'rating': self.rating,
            'title': self.title,
            'content': self.content,
            'images': self.images,
            'visit_date': self.visit_date.isoformat() if self.visit_date else None,
            'is_verified': self.is_verified,
            'helpful_count': self.helpful_count,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'user': self.user.to_dict() if self.user else None
        }

class VolunteerService(db.Model):
    """志愿服务模型"""
    __tablename__ = 'volunteer_services'
    
    id = db.Column(db.Integer, primary_key=True)
    volunteer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False, comment='服务标题')
    description = db.Column(db.Text, comment='服务描述')
    service_type = db.Column(db.String(50), comment='服务类型：导游/陪伴/翻译/无障碍协助')
    target_group = db.Column(db.String(50), comment='服务对象：老年人/残障人士/外国游客')
    location = db.Column(db.String(255), comment='服务地点')
    available_dates = db.Column(db.Text, comment='可服务日期，JSON格式')
    max_participants = db.Column(db.Integer, default=1, comment='最大服务人数')
    current_participants = db.Column(db.Integer, default=0, comment='当前预约人数')
    contact_info = db.Column(db.String(255), comment='联系方式')
    status = db.Column(db.String(20), default='active', comment='状态：active/paused/completed')
    created_at = db.Column(db.DateTime, default=datetime.utcnow, comment='创建时间')
    
    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'volunteer_id': self.volunteer_id,
            'title': self.title,
            'description': self.description,
            'service_type': self.service_type,
            'target_group': self.target_group,
            'location': self.location,
            'available_dates': self.available_dates,
            'max_participants': self.max_participants,
            'current_participants': self.current_participants,
            'contact_info': self.contact_info,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'volunteer': self.volunteer.to_dict() if self.volunteer else None
        }
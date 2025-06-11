# -*- coding: utf-8 -*-
"""
点亮中国·点亮上海 旅游推荐平台
主应用文件
"""

from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
import os

from config import config
from models import db

# 初始化扩展
cors = CORS()
jwt = JWTManager()
migrate = Migrate()

def create_app(config_name=None):
    """应用工厂函数"""
    if config_name is None:
        config_name = os.environ.get('FLASK_CONFIG', 'default')
    
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # 初始化扩展
    db.init_app(app)
    cors.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    
    # 注册蓝图
    from routes.main import main_bp
    from routes.auth import auth_bp
    from routes.attractions import attractions_bp
    from routes.routes import routes_bp
    from routes.reviews import reviews_bp
    from routes.volunteers import volunteers_bp
    
    app.register_blueprint(main_bp)  # 主页路由，不需要前缀
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(attractions_bp, url_prefix='/attraction')
    app.register_blueprint(routes_bp, url_prefix='/api/routes')
    app.register_blueprint(reviews_bp, url_prefix='/api/reviews')
    app.register_blueprint(volunteers_bp, url_prefix='/api/volunteers')
    
    # 错误处理
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': '资源未找到'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': '服务器内部错误'}), 500
    
    # 健康检查接口
    @app.route('/api/health')
    def health_check():
        return jsonify({
            'status': 'healthy',
            'message': '点亮中国·点亮上海平台运行正常',
            'version': '1.0.0-beta'
        })
    
    # 主页接口
    @app.route('/api/')
    def index():
        return jsonify({
            'message': '欢迎使用点亮中国·点亮上海旅游推荐平台',
            'features': [
                '智能路线规划',
                '红色历史景点推荐',
                '网红打卡点查询',
                '美食探索',
                '志愿服务预约'
            ],
            'version': '1.0.0-beta'
        })
    
    return app

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        # 导入所有模型以确保它们被注册
        from models import User, Attraction, Route, Review, VolunteerService
        
        db.create_all()
        print("数据库表已创建")
    app.run(debug=True, host='0.0.0.0', port=5000)
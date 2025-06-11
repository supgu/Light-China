# -*- coding: utf-8 -*-
"""
应用启动文件
"""

import os
from app import create_app

# 创建Flask应用实例
app = create_app()

if __name__ == '__main__':
    # 开发环境配置
    debug_mode = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '127.0.0.1')
    
    print(f"\n=== 旅游打卡APP Beta版 ===")
    print(f"启动地址: http://{host}:{port}")
    print(f"调试模式: {debug_mode}")
    print(f"\n可用的API端点:")
    print(f"- 健康检查: GET /health")
    print(f"- 用户注册: POST /api/auth/register")
    print(f"- 用户登录: POST /api/auth/login")
    print(f"- 景点列表: GET /api/attractions/")
    print(f"- 路线列表: GET /api/routes/")
    print(f"- 评价列表: GET /api/reviews/attraction/<id>")
    print(f"- 志愿服务: GET /api/volunteers/")
    print(f"\n首次运行请先执行: python init_db.py")
    print(f"="*40)
    
    app.run(
        host=host,
        port=port,
        debug=debug_mode,
        threaded=True
    )
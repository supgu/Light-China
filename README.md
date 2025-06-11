# 旅游打卡APP Beta版

一个专注于无障碍旅游和志愿服务的旅游打卡应用后端系统。

## 项目特色

### 核心优势
- **无广告植入**: 纯净的用户体验，专注于旅游服务
- **针对性强**: 专门为中国旅游市场设计，支持本土化需求
- **泛用性强**: 支持多种旅游场景和用户群体
- **真实性保障**: 用户真实评价和体验分享
- **功能全开放**: 所有核心功能免费使用

### 弱势群体服务
- **无障碍支持**: 完善的无障碍设施信息和路线规划
- **志愿服务**: 专业志愿者提供导览、翻译、协助等服务
- **个性化需求**: 支持特殊需求用户的定制化服务

## 技术架构

### 后端技术栈
- **框架**: Flask + SQLAlchemy
- **数据库**: SQLite (开发) / PostgreSQL (生产)
- **认证**: JWT Token
- **API**: RESTful API
- **缓存**: Redis (可选)

### 核心功能模块
1. **用户系统**: 注册、登录、个人资料管理
2. **景点系统**: 景点信息、分类、搜索、推荐
3. **路线系统**: 路线规划、智能推荐、个性化定制
4. **评价系统**: 用户评价、评分、图片分享
5. **志愿服务**: 志愿者注册、服务发布、参与管理

## 快速开始

### 环境要求
- Python 3.8+
- pip

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd lightChina
```

2. **安装依赖**
```bash
pip install -r requirements.txt
```

3. **初始化数据库**
```bash
python init_db.py
```

4. **启动应用**
```bash
python run.py
```

5. **访问应用**
- 应用地址: http://127.0.0.1:5000
- 健康检查: http://127.0.0.1:5000/health

## API 文档

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取用户资料
- `PUT /api/auth/profile` - 更新用户资料

### 景点相关
- `GET /api/attractions/` - 获取景点列表
- `GET /api/attractions/<id>` - 获取景点详情
- `GET /api/attractions/categories` - 获取景点分类
- `GET /api/attractions/recommended` - 获取推荐景点
- `GET /api/attractions/nearby` - 获取附近景点

### 路线相关
- `GET /api/routes/` - 获取路线列表
- `GET /api/routes/<id>` - 获取路线详情
- `POST /api/routes/` - 创建路线
- `POST /api/routes/generate` - 智能生成路线
- `POST /api/routes/<id>/optimize` - 优化路线

### 评价相关
- `POST /api/reviews/` - 创建评价
- `GET /api/reviews/attraction/<id>` - 获取景点评价
- `GET /api/reviews/my-reviews` - 获取我的评价
- `PUT /api/reviews/<id>` - 更新评价
- `DELETE /api/reviews/<id>` - 删除评价

### 志愿服务相关
- `GET /api/volunteers/` - 获取志愿服务列表
- `POST /api/volunteers/` - 创建志愿服务
- `GET /api/volunteers/<id>` - 获取服务详情
- `POST /api/volunteers/<id>/join` - 参加服务
- `POST /api/volunteers/<id>/leave` - 退出服务

## 示例数据

系统提供了丰富的示例数据，包括：

### 示例用户
- **管理员**: `admin` / `admin123`
- **游客**: `tourist1` / `password123`
- **导游**: `guide1` / `guide123`

### 示例景点
- 故宫博物院 (历史文化)
- 天安门广场 (历史文化)
- 颐和园 (自然风光)
- 798艺术区 (艺术展览)
- 南锣鼓巷 (美食)

### 示例路线
- 北京经典一日游
- 艺术文化探索之旅

## 配置说明

### 环境变量
- `FLASK_ENV`: 运行环境 (development/production)
- `SECRET_KEY`: 应用密钥
- `DATABASE_URL`: 数据库连接URL
- `JWT_SECRET_KEY`: JWT密钥
- `REDIS_URL`: Redis连接URL

### 配置文件
主要配置在 `config.py` 中，包括：
- 数据库配置
- JWT配置
- 文件上传配置
- 地图API配置

## 开发指南

### 项目结构
```
lightChina/
├── app.py              # Flask应用工厂
├── config.py           # 配置文件
├── models.py           # 数据模型
├── init_db.py          # 数据库初始化
├── run.py              # 应用启动文件
├── requirements.txt    # 依赖包列表
├── routes/             # 路由模块
│   ├── __init__.py
│   ├── auth.py         # 认证路由
│   ├── attractions.py  # 景点路由
│   ├── routes.py       # 路线路由
│   ├── reviews.py      # 评价路由
│   └── volunteers.py   # 志愿服务路由
└── README.md           # 项目说明
```

### 添加新功能
1. 在 `models.py` 中定义数据模型
2. 在 `routes/` 目录下创建对应的路由文件
3. 在 `app.py` 中注册新的蓝图
4. 更新数据库迁移

### 数据库迁移
```bash
# 初始化迁移
flask db init

# 创建迁移
flask db migrate -m "描述信息"

# 应用迁移
flask db upgrade
```

## 部署指南

### 生产环境部署
1. 设置环境变量
2. 配置生产数据库
3. 配置Web服务器 (Nginx + Gunicorn)
4. 设置SSL证书
5. 配置监控和日志

### Docker部署
```dockerfile
# Dockerfile示例
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "run.py"]
```

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License

## 联系方式

- 项目维护者: [您的姓名]
- 邮箱: [您的邮箱]
- 项目地址: [项目仓库地址]

## 更新日志

### v1.0.0-beta (2024-01-30)
- 初始版本发布
- 实现核心功能模块
- 提供完整的API接口
- 支持无障碍旅游功能
- 集成志愿服务系统

---

**注意**: 这是Beta版本，仅供开发和测试使用。生产环境部署前请进行充分的安全性和性能测试。
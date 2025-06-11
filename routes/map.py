#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
地图路由模块
为 Google Maps 提供数据API服务
"""

from flask import Blueprint, jsonify, request
import json
import random

map_bp = Blueprint('map', __name__)

class InteractiveMapService:
    """交互式地图服务"""
    
    def __init__(self):
        self.provinces = [
            "北京", "天津", "河北", "山西", "内蒙古", "辽宁", "吉林", "黑龙江",
            "上海", "江苏", "浙江", "安徽", "福建", "江西", "山东", "河南",
            "湖北", "湖南", "广东", "广西", "海南", "重庆", "四川", "贵州",
            "云南", "西藏", "陕西", "甘肃", "青海", "宁夏", "新疆"
        ]
        
        self.cities_data = {
            "上海": {"value": 1200, "attractions": ["外滩", "东方明珠", "豫园", "南京路"], "routes": 15, "volunteers": 8, "checkins": 2340},
            "北京": {"value": 1500, "attractions": ["故宫", "天安门", "长城", "颐和园"], "routes": 20, "volunteers": 12, "checkins": 3200},
            "广州": {"value": 800, "attractions": ["广州塔", "陈家祠", "沙面", "白云山"], "routes": 12, "volunteers": 6, "checkins": 1800},
            "深圳": {"value": 750, "attractions": ["世界之窗", "欢乐谷", "大梅沙", "莲花山"], "routes": 10, "volunteers": 5, "checkins": 1650},
            "杭州": {"value": 600, "attractions": ["西湖", "灵隐寺", "千岛湖", "宋城"], "routes": 8, "volunteers": 4, "checkins": 1200},
            "南京": {"value": 550, "attractions": ["中山陵", "夫子庙", "明孝陵", "玄武湖"], "routes": 7, "volunteers": 3, "checkins": 980},
            "成都": {"value": 500, "attractions": ["宽窄巷子", "锦里", "大熊猫基地", "都江堰"], "routes": 9, "volunteers": 6, "checkins": 1100},
            "西安": {"value": 480, "attractions": ["兵马俑", "大雁塔", "华清池", "城墙"], "routes": 6, "volunteers": 4, "checkins": 890}
        }
    
    def generate_province_data(self):
        """生成省份热度数据"""
        return [(province, random.randint(100, 1000)) for province in self.provinces]
    
    def generate_city_data(self):
        """生成城市热度数据"""
        return [(city, data["value"]) for city, data in self.cities_data.items()]
    
    def get_china_cities_with_coordinates(self):
        """获取带坐标的中国城市数据"""
        cities_coordinates = {
            "北京": {"lat": 39.9042, "lng": 116.4074, "code": "BJ"},
            "上海": {"lat": 31.2304, "lng": 121.4737, "code": "SH"},
            "广州": {"lat": 23.1291, "lng": 113.2644, "code": "GZ"},
            "深圳": {"lat": 22.5431, "lng": 114.0579, "code": "SZ"},
            "杭州": {"lat": 30.2741, "lng": 120.1551, "code": "HZ"},
            "南京": {"lat": 32.0603, "lng": 118.7969, "code": "NJ"},
            "成都": {"lat": 30.5728, "lng": 104.0668, "code": "CD"},
            "西安": {"lat": 34.3416, "lng": 108.9398, "code": "XA"},
            "武汉": {"lat": 30.5928, "lng": 114.3055, "code": "WH"},
            "重庆": {"lat": 29.5630, "lng": 106.5516, "code": "CQ"},
            "天津": {"lat": 39.3434, "lng": 117.3616, "code": "TJ"},
            "苏州": {"lat": 31.2989, "lng": 120.5853, "code": "SZ2"},
            "青岛": {"lat": 36.0986, "lng": 120.3719, "code": "QD"},
            "长沙": {"lat": 28.2282, "lng": 112.9388, "code": "CS"},
            "大连": {"lat": 38.9140, "lng": 121.6147, "code": "DL"}
        }
        
        result = []
        for city_name, city_info in self.cities_data.items():
            if city_name in cities_coordinates:
                coord = cities_coordinates[city_name]
                result.append({
                    "name": city_name,
                    "lat": coord["lat"],
                    "lng": coord["lng"],
                    "code": coord["code"],
                    "value": city_info["value"],
                    "attractions": city_info["attractions"],
                    "routes": city_info["routes"],
                    "volunteers": city_info["volunteers"],
                    "checkins": city_info["checkins"]
                })
        
        return result

# 创建地图服务实例
map_service = InteractiveMapService()

@map_bp.route('/api/cities')
def get_cities_data():
    """获取城市数据API"""
    cities = map_service.get_china_cities_with_coordinates()
    return jsonify({
        'success': True,
        'data': cities,
        'total': len(cities)
    })

@map_bp.route('/api/city/<city_name>')
def get_city_detail(city_name):
    """获取单个城市详细信息"""
    cities = map_service.get_china_cities_with_coordinates()
    city = next((c for c in cities if c['name'] == city_name), None)
    
    if city:
        return jsonify({
            'success': True,
            'data': city
        })
    else:
        return jsonify({
            'success': False,
            'message': f'城市 {city_name} 未找到'
        }), 404

@map_bp.route('/api/provinces')
def get_provinces_data():
    """获取省份数据API"""
    provinces = map_service.generate_province_data()
    return jsonify({
        'success': True,
        'data': provinces,
        'total': len(provinces)
    })
@map_bp.route('/api/stats')
def get_stats():
    """获取统计数据API"""
    return jsonify({
        'success': True,
        'data': {
            'provinces': 31,
            'cities': len(map_service.cities_data),
            'routes': 87,
            'volunteers': 48,
            'checkins': 13260
        }
    })
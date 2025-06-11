// 景点数据配置
const ATTRACTIONS_DATA = {
    shanghai: {
        center: { lat: 31.2304, lng: 121.4737 },
        zoom: 12,
        attractions: [
            // 红色旅游景点
            {
                id: 'cpc-first-congress',
                name: '中共一大会址',
                type: 'red',
                position: { lat: 31.2236, lng: 121.4736 },
                description: '中国共产党第一次全国代表大会会址，中国共产党的诞生地',
                rating: 4.8,
                visitors: 15000,
                image: '/static/images/attractions/cpc-first-congress.jpg',
                tags: ['红色旅游', '历史文化', '爱国主义教育']
            },
            {
                id: 'longhua-martyrs-cemetery',
                name: '龙华烈士陵园',
                type: 'red',
                position: { lat: 31.1774, lng: 121.4414 },
                description: '纪念为中国人民解放事业英勇献身的革命烈士',
                rating: 4.7,
                visitors: 8500,
                image: '/static/images/attractions/longhua-martyrs.jpg',
                tags: ['红色旅游', '烈士纪念', '历史教育']
            },
            {
                id: 'soong-ching-ling-residence',
                name: '宋庆龄故居',
                type: 'red',
                position: { lat: 31.2108, lng: 121.4267 },
                description: '中华人民共和国名誉主席宋庆龄的故居',
                rating: 4.6,
                visitors: 6200,
                image: '/static/images/attractions/soong-residence.jpg',
                tags: ['红色旅游', '名人故居', '历史文化']
            },
            
            // 美食打卡点
            {
                id: 'chenghuangmiao-snacks',
                name: '城隍庙小吃街',
                type: 'food',
                position: { lat: 31.2267, lng: 121.4920 },
                description: '上海传统小吃聚集地，品尝正宗上海味道',
                rating: 4.5,
                visitors: 25000,
                image: '/static/images/attractions/chenghuangmiao.jpg',
                tags: ['美食', '小吃', '传统文化']
            },
            {
                id: 'nanjing-road-food',
                name: '南京路步行街美食',
                type: 'food',
                position: { lat: 31.2342, lng: 121.4742 },
                description: '繁华商业街上的各色美食，中西合璧',
                rating: 4.4,
                visitors: 18000,
                image: '/static/images/attractions/nanjing-road.jpg',
                tags: ['美食', '购物', '都市体验']
            },
            {
                id: 'xintiandi-dining',
                name: '新天地餐饮区',
                type: 'food',
                position: { lat: 31.2198, lng: 121.4752 },
                description: '时尚餐饮聚集地，融合传统与现代',
                rating: 4.6,
                visitors: 12000,
                image: '/static/images/attractions/xintiandi.jpg',
                tags: ['美食', '时尚', '夜生活']
            },
            {
                id: 'tianzifang-food',
                name: '田子坊美食',
                type: 'food',
                position: { lat: 31.2108, lng: 121.4663 },
                description: '弄堂里的创意美食，文艺气息浓厚',
                rating: 4.3,
                visitors: 9500,
                image: '/static/images/attractions/tianzifang.jpg',
                tags: ['美食', '文艺', '创意']
            }
        ]
    },
    
    beijing: {
        center: { lat: 39.9042, lng: 116.4074 },
        zoom: 11,
        attractions: [
            // 示例数据，可以后续扩展
            {
                id: 'tiananmen-square',
                name: '天安门广场',
                type: 'red',
                position: { lat: 39.9031, lng: 116.3976 },
                description: '中华人民共和国的象征',
                rating: 4.9,
                visitors: 50000,
                image: '/static/images/attractions/tiananmen.jpg',
                tags: ['红色旅游', '国家象征', '历史文化']
            }
        ]
    },
    
    guangzhou: {
        center: { lat: 23.1291, lng: 113.2644 },
        zoom: 11,
        attractions: [
            // 示例数据，可以后续扩展
            {
                id: 'shamian-island',
                name: '沙面岛',
                type: 'red',
                position: { lat: 23.1067, lng: 113.2354 },
                description: '历史文化街区',
                rating: 4.5,
                visitors: 8000,
                image: '/static/images/attractions/shamian.jpg',
                tags: ['历史文化', '建筑艺术']
            }
        ]
    }
};

// 城市热度数据
const CITY_HEAT_DATA = [
    {
        name: '上海',
        code: 'shanghai',
        position: { lat: 31.2304, lng: 121.4737 },
        value: 1200,
        color: '#ff4444'
    },
    {
        name: '北京',
        code: 'beijing',
        position: { lat: 39.9042, lng: 116.4074 },
        value: 1500,
        color: '#ff2222'
    },
    {
        name: '广州',
        code: 'guangzhou',
        position: { lat: 23.1291, lng: 113.2644 },
        value: 800,
        color: '#ff6666'
    },
    {
        name: '深圳',
        code: 'shenzhen',
        position: { lat: 22.5431, lng: 114.0579 },
        value: 950,
        color: '#ff5555'
    },
    {
        name: '杭州',
        code: 'hangzhou',
        position: { lat: 30.2741, lng: 120.1551 },
        value: 720,
        color: '#ff7777'
    },
    {
        name: '成都',
        code: 'chengdu',
        position: { lat: 30.5728, lng: 104.0668 },
        value: 680,
        color: '#ff8888'
    },
    {
        name: '西安',
        code: 'xian',
        position: { lat: 34.3416, lng: 108.9398 },
        value: 650,
        color: '#ff9999'
    },
    {
        name: '南京',
        code: 'nanjing',
        position: { lat: 32.0603, lng: 118.7969 },
        value: 580,
        color: '#ffaaaa'
    }
];

// 图标配置
const MARKER_ICONS = {
    red: {
        url: '/static/icons/red-site.png',
        scaledSize: { width: 32, height: 32 },
        anchor: { x: 16, y: 32 }
    },
    food: {
        url: '/static/icons/food-site.png',
        scaledSize: { width: 32, height: 32 },
        anchor: { x: 16, y: 32 }
    },
    city: {
        url: '/static/icons/city-marker.png',
        scaledSize: { width: 24, height: 24 },
        anchor: { x: 12, y: 24 }
    }
};

// 导出数据
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ATTRACTIONS_DATA,
        CITY_HEAT_DATA,
        MARKER_ICONS
    };
}
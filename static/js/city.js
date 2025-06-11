// @ts-nocheck
// 城市详情页JavaScript功能

// 全局变量
let cityMap = null;
let currentCity = null;
let attractions = [];
let routes = [];
let recommendations = [];

// 初始化城市地图
function initCityMap(cityName, coordinates) {
    currentCity = cityName;
    if (coordinates && coordinates.length >= 2) {
        // 使用传入的坐标
        initializeMapWithCoords([coordinates[1], coordinates[0]]); // 注意经纬度顺序
    } else {
        // 使用默认坐标
        initializeMap();
    }
}

// 初始化分类筛选
function initCategoryFilter() {
    const categoryBtns = document.querySelectorAll('.tab-btn');
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.category;
            
            // 更新按钮状态
            categoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // 筛选内容
            filterContentByCategory(category);
        });
    });
}

// 初始化行程规划
function initRoutePlanning() {
    const routeBtn = document.getElementById('routeBtn');
    if (routeBtn) {
        routeBtn.addEventListener('click', function() {
            showRoutePlanningModal();
        });
    }
}

// 加载城市数据
function loadCityData(cityName) {
    // 这里可以添加异步加载城市数据的逻辑
    console.log('Loading data for city:', cityName);
}

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    initializeMap();
    initializeTabs();
    initializeToolbar();
    initializeModals();
    loadCityData();
});

// 初始化页面
function initializePage() {
    // 从URL获取城市信息
    const urlParams = new URLSearchParams(window.location.search);
    const cityName = urlParams.get('city') || '上海';
    currentCity = cityName;
    
    // 更新页面标题
    document.title = `${cityName} - 光明中国旅游平台`;
    
    // 更新城市信息
    updateCityInfo(cityName);
}

// 更新城市信息
function updateCityInfo(cityName) {
    const cityData = getCityData(cityName);
    
    // 更新城市标题
    const cityTitle = document.querySelector('.city-info h1');
    if (cityTitle) {
        cityTitle.textContent = cityData.name;
    }
    
    // 更新城市副标题
    const citySubtitle = document.querySelector('.city-subtitle');
    if (citySubtitle) {
        citySubtitle.textContent = cityData.subtitle;
    }
    
    // 更新统计数据
    updateCityStats(cityData.stats);
}

// 更新城市统计数据
function updateCityStats(stats) {
    const statItems = document.querySelectorAll('.stat-item');
    
    if (statItems.length >= 4) {
        statItems[0].querySelector('.stat-number').textContent = stats.attractions;
        statItems[1].querySelector('.stat-number').textContent = stats.routes;
        statItems[2].querySelector('.stat-number').textContent = stats.volunteers;
        statItems[3].querySelector('.stat-number').textContent = stats.rating;
    }
}

// 初始化地图
function initializeMap() {
    // 初始化Google地图
    if (typeof google !== 'undefined' && google.maps) {
        initAMap();
    } else {
        console.warn('Google Maps未加载，请检查网络连接');
        showMapError();
    }
    
    // 地图控制按钮事件
    const mapControlBtns = document.querySelectorAll('.map-control-btn');
    mapControlBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            handleMapControl(action);
            
            // 更新按钮状态
            mapControlBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// 初始化Google地图
function initAMap() {
    const mapContainer = document.getElementById('cityMap');
    if (!mapContainer) return;
    
    // 获取城市坐标
    const cityCoords = getCityCoordinates(currentCity);
    
    cityMap = new google.maps.Map(mapContainer, {
        zoom: 12,
        center: { lat: cityCoords[1], lng: cityCoords[0] },
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    
    // 加载景点标记
    loadAttractionMarkers();
}

// Google Maps API回调函数
window.initMap = function() {
    // 当Google Maps API加载完成后调用
    if (typeof google !== 'undefined' && google.maps) {
        console.log('Google Maps API加载成功');
        // 如果页面已经初始化，则立即初始化地图
        if (document.readyState === 'complete') {
            initializeMap();
        }
    } else {
        console.error('Google Maps API加载失败');
        showMapError();
    }
};

// 使用指定坐标初始化地图
function initializeMapWithCoords(coords) {
    const mapContainer = document.getElementById('cityMap');
    if (!mapContainer) {
        console.error('地图容器未找到');
        return;
    }
    
    if (typeof google === 'undefined' || !google.maps) {
        console.error('Google Maps API未加载');
        showMapError();
        return;
    }
    
    try {
        cityMap = new google.maps.Map(mapContainer, {
            zoom: 12,
            center: { lat: coords[1], lng: coords[0] },
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });
        
        // 加载景点标记
        loadAttractionMarkers();
        
        console.log('地图初始化成功');
    } catch (error) {
        console.error('地图初始化失败:', error);
        showMapError();
    }
}

// 筛选内容
function filterContentByCategory(category) {
    const contentItems = document.querySelectorAll('.content-item');
    
    contentItems.forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
    
    // 更新地图标记
    updateMapMarkers(category);
}

// 更新地图标记
// 存储所有标记的数组
let mapMarkers = [];

function updateMapMarkers(category) {
    if (!cityMap) return;
    
    // 清除现有标记
    mapMarkers.forEach(marker => {
        marker.setMap(null);
    });
    mapMarkers = [];
    
    // 重新加载对应类别的标记
    loadAttractionMarkers(category);
}

// 显示路线规划模态框
function showRoutePlanningModal() {
    // 这里可以添加路线规划模态框的显示逻辑
    console.log('显示路线规划模态框');
}

// 显示地图加载错误信息
function showMapError() {
    const mapContainer = document.getElementById('cityMap');
    if (!mapContainer) return;
    
    mapContainer.innerHTML = `
        <div class="map-loading-container">
            <div class="map-loading-content">
                <h3>地图加载失败</h3>
                <p>请检查网络连接或刷新页面重试</p>
            </div>
        </div>
    `;
}

// 加载景点标记
function loadAttractionMarkers(category = 'all') {
    if (!cityMap) return;
    
    const attractionData = getAttractionData(currentCity);
    
    attractionData.forEach(attraction => {
        // 如果指定了分类且不匹配，则跳过
        if (category !== 'all' && attraction.type !== category) {
            return;
        }
        
        const marker = new google.maps.Marker({
            position: { lat: attraction.coordinates[1], lng: attraction.coordinates[0] },
            map: cityMap,
            title: attraction.name,
            icon: {
                url: getAttractionIcon(attraction.type),
                scaledSize: new google.maps.Size(32, 32)
            }
        });
        
        // 添加到标记数组
        mapMarkers.push(marker);
        
        // 添加点击事件
        marker.addListener('click', () => {
            showAttractionInfo(attraction);
        });
    });
}

// 处理地图控制
function handleMapControl(action) {
    if (!cityMap) return;
    
    switch (action) {
        case 'attractions':
            showAttractionLayer();
            break;
        case 'routes':
            showRouteLayer();
            break;
        case 'volunteers':
            showVolunteerLayer();
            break;
        case 'traffic':
            toggleTrafficLayer();
            break;
    }
}

// 显示景点图层
function showAttractionLayer() {
    // 清除其他图层
    clearMapLayers();
    
    // 重新加载景点标记
    loadAttractionMarkers();
}

// 显示路线图层
function showRouteLayer() {
    clearMapLayers();
    
    const routeData = getRouteData(currentCity);
    
    routeData.forEach(route => {
        const polyline = new AMap.Polyline({
            path: route.path,
            strokeColor: route.color || '#007bff',
            strokeWeight: 4,
            strokeOpacity: 0.8
        });
        
        cityMap.add(polyline);
        
        // 添加路线标记
        route.points.forEach((point, index) => {
            const marker = new AMap.Marker({
                position: point.coordinates,
                title: point.name,
                label: {
                    content: (index + 1).toString(),
                    offset: new AMap.Pixel(-5, -5)
                }
            });
            
            cityMap.add(marker);
        });
    });
}

// 显示志愿服务图层
function showVolunteerLayer() {
    clearMapLayers();
    
    const volunteerData = getVolunteerData(currentCity);
    
    volunteerData.forEach(volunteer => {
        const marker = new AMap.Marker({
            position: volunteer.coordinates,
            title: volunteer.name,
            icon: new AMap.Icon({
                size: new AMap.Size(32, 32),
                image: '/static/images/volunteer-icon.png',
                imageSize: new AMap.Size(32, 32)
            })
        });
        
        marker.on('click', () => {
            showVolunteerInfo(volunteer);
        });
        
        cityMap.add(marker);
    });
}

// 切换交通图层
function toggleTrafficLayer() {
    if (cityMap.trafficLayer) {
        cityMap.remove(cityMap.trafficLayer);
        cityMap.trafficLayer = null;
    } else {
        cityMap.trafficLayer = new AMap.TileLayer.Traffic({
            zIndex: 10
        });
        cityMap.add(cityMap.trafficLayer);
    }
}

// 清除地图图层
function clearMapLayers() {
    if (cityMap) {
        cityMap.clearMap();
    }
}

// 初始化标签页
function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            
            // 更新按钮状态
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // 更新内容显示
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === targetTab) {
                    content.classList.add('active');
                }
            });
            
            // 加载对应内容
            loadTabContent(targetTab);
        });
    });
    
    // 默认加载第一个标签页
    if (tabBtns.length > 0) {
        tabBtns[0].click();
    }
}

// 加载标签页内容
function loadTabContent(tabId) {
    switch (tabId) {
        case 'routes':
            loadRoutes();
            break;
        case 'attractions':
            loadAttractions();
            break;
        case 'recommendations':
            loadRecommendations();
            break;
    }
}

// 加载推荐路线
function loadRoutes() {
    const routesGrid = document.querySelector('.routes-grid');
    if (!routesGrid) return;
    
    const routeData = getRouteData(currentCity);
    
    routesGrid.innerHTML = routeData.map(route => `
        <div class="route-card" onclick="viewRoute('${route.id}')">
            <div class="route-image">
                <img src="${route.image}" alt="${route.name}" width="300" height="200" onerror="this.classList.add('hidden')">
                <div class="route-badge">${route.type}</div>
            </div>
            <div class="route-content">
                <h3 class="route-title">${route.name}</h3>
                <p class="route-description">${route.description}</p>
                <div class="route-meta">
                    <div class="route-duration">
                        <span>⏱️</span>
                        <span>${route.duration}</span>
                    </div>
                    <div class="route-rating">
                        <span>⭐</span>
                        <span>${route.rating}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// 加载热门景点
function loadAttractions() {
    const attractionsGrid = document.querySelector('.attractions-grid');
    if (!attractionsGrid) return;
    
    const attractionData = getAttractionData(currentCity);
    
    attractionsGrid.innerHTML = attractionData.map(attraction => `
        <div class="attraction-card" onclick="viewAttraction('${attraction.id}')">
            <div class="attraction-image">
                <img src="${attraction.image}" alt="${attraction.name}" width="300" height="200" onerror="this.classList.add('hidden')">
                <div class="attraction-favorite ${attraction.favorited ? 'favorited' : ''}" onclick="toggleFavorite(event, '${attraction.id}')">
                    ❤️
                </div>
            </div>
            <div class="attraction-content">
                <h3 class="attraction-title">${attraction.name}</h3>
                <div class="attraction-location">
                    <span>📍</span>
                    <span>${attraction.location}</span>
                </div>
                <div class="attraction-tags">
                    ${attraction.tags.map(tag => `<span class="attraction-tag">${tag}</span>`).join('')}
                </div>
                <div class="attraction-footer">
                    <div class="attraction-rating">
                        <span>⭐</span>
                        <span>${attraction.rating}</span>
                    </div>
                    <div class="attraction-price">${attraction.price}</div>
                </div>
            </div>
        </div>
    `).join('');
}

// 加载智能推荐
function loadRecommendations() {
    const recommendationsGrid = document.querySelector('.recommendations-grid');
    if (!recommendationsGrid) return;
    
    const recommendationData = getRecommendationData(currentCity);
    
    recommendationsGrid.innerHTML = recommendationData.map(rec => `
        <div class="recommendation-card" onclick="handleRecommendation('${rec.type}')">
            <div class="recommendation-icon">${rec.icon}</div>
            <h3 class="recommendation-title">${rec.title}</h3>
            <p class="recommendation-description">${rec.description}</p>
        </div>
    `).join('');
}

// 初始化工具栏
function initializeToolbar() {
    const toolbarBtns = document.querySelectorAll('.toolbar-btn');
    
    toolbarBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            handleToolbarAction(action);
        });
    });
}

// 处理工具栏操作
function handleToolbarAction(action) {
    switch (action) {
        case 'plan':
            openTripPlanModal();
            break;
        case 'volunteer':
            window.location.href = '/volunteer-service';
            break;
        case 'share':
            shareCity();
            break;
        case 'feedback':
            openFeedbackModal();
            break;
    }
}

// 初始化模态框
function initializeModals() {
    // 行程规划模态框
    const tripPlanModal = document.getElementById('tripPlanModal');
    const closeTripPlanModal = document.getElementById('closeTripPlanModal');
    const tripPlanForm = document.getElementById('tripPlanForm');
    
    if (closeTripPlanModal) {
        closeTripPlanModal.addEventListener('click', () => {
            tripPlanModal.classList.remove('show');
        });
    }
    
    // 点击背景关闭模态框
    if (tripPlanModal) {
        tripPlanModal.addEventListener('click', (e) => {
            if (e.target === tripPlanModal) {
                tripPlanModal.classList.remove('show');
            }
        });
    }
    
    // 行程规划表单提交
    if (tripPlanForm) {
        tripPlanForm.addEventListener('submit', handleTripPlanSubmit);
    }
}

// 打开行程规划模态框
function openTripPlanModal() {
    const modal = document.getElementById('tripPlanModal');
    if (modal) {
        modal.classList.add('show');
        
        // 预填城市信息
        const cityInput = modal.querySelector('input[name="destination"]');
        if (cityInput) {
            cityInput.value = currentCity;
        }
    }
}

// 处理行程规划表单提交
async function handleTripPlanSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const planData = Object.fromEntries(formData.entries());
    
    // 显示加载状态
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '创建中...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch('/api/trip-plans', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(planData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage('行程规划创建成功！', 'success');
            document.getElementById('tripPlanModal').classList.remove('show');
            
            // 跳转到用户中心查看行程
            setTimeout(() => {
                window.location.href = '/user-center?tab=trips';
            }, 1500);
        } else {
            showMessage(result.message || '创建失败，请重试', 'error');
        }
    } catch (error) {
        console.error('创建行程规划错误:', error);
        showMessage('网络错误，请稍后重试', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// 分享城市
function shareCity() {
    if (navigator.share) {
        navigator.share({
            title: `${currentCity} - 光明中国旅游平台`,
            text: `来看看${currentCity}的精彩景点和推荐路线！`,
            url: window.location.href
        });
    } else {
        // 复制链接到剪贴板
        navigator.clipboard.writeText(window.location.href).then(() => {
            showMessage('链接已复制到剪贴板', 'success');
        }).catch(() => {
            showMessage('分享功能暂不可用', 'error');
        });
    }
}

// 查看路线详情
function viewRoute(routeId) {
    window.location.href = `/route-detail?id=${routeId}`;
}

// 查看景点详情
function viewAttraction(attractionId) {
    window.location.href = `/attraction-detail?id=${attractionId}`;
}

// 切换收藏状态
async function toggleFavorite(event, attractionId) {
    event.stopPropagation();
    
    const favoriteBtn = event.target;
    const isFavorited = favoriteBtn.classList.contains('favorited');
    
    try {
        const response = await fetch('/api/favorites', {
            method: isFavorited ? 'DELETE' : 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                type: 'attraction',
                id: attractionId
            })
        });
        
        if (response.ok) {
            favoriteBtn.classList.toggle('favorited');
            showMessage(isFavorited ? '已取消收藏' : '已添加到收藏', 'success');
        } else {
            showMessage('操作失败，请重试', 'error');
        }
    } catch (error) {
        console.error('收藏操作错误:', error);
        showMessage('网络错误，请稍后重试', 'error');
    }
}

// 处理推荐操作
function handleRecommendation(type) {
    switch (type) {
        case 'weather':
            showWeatherInfo();
            break;
        case 'traffic':
            showTrafficInfo();
            break;
        case 'food':
            window.location.href = `/search?q=${currentCity}美食&type=food`;
            break;
        case 'hotel':
            window.location.href = `/search?q=${currentCity}酒店&type=hotel`;
            break;
        case 'shopping':
            window.location.href = `/search?q=${currentCity}购物&type=shopping`;
            break;
        case 'culture':
            window.location.href = `/search?q=${currentCity}文化&type=culture`;
            break;
    }
}

// 显示天气信息
function showWeatherInfo() {
    // 这里可以集成天气API
    showMessage('天气信息功能开发中...', 'info');
}

// 显示交通信息
function showTrafficInfo() {
    // 切换到交通图层
    const trafficBtn = document.querySelector('[data-action="traffic"]');
    if (trafficBtn) {
        trafficBtn.click();
    }
}

// 加载城市数据
function loadCityData() {
    // 这里可以从API加载实际数据
    // 目前使用模拟数据
}

// 数据获取函数

// 获取城市数据
function getCityData(cityName) {
    const cityDataMap = {
        '上海': {
            name: '上海',
            subtitle: '东方明珠，国际大都市',
            stats: {
                attractions: '156',
                routes: '23',
                volunteers: '89',
                rating: '4.8'
            }
        },
        '北京': {
            name: '北京',
            subtitle: '首都北京，历史文化名城',
            stats: {
                attractions: '203',
                routes: '31',
                volunteers: '127',
                rating: '4.9'
            }
        },
        '广州': {
            name: '广州',
            subtitle: '花城广州，岭南文化中心',
            stats: {
                attractions: '134',
                routes: '19',
                volunteers: '76',
                rating: '4.7'
            }
        }
    };
    
    return cityDataMap[cityName] || cityDataMap['上海'];
}

// 获取城市坐标
function getCityCoordinates(cityName) {
    const coordsMap = {
        '上海': [121.4737, 31.2304],
        '北京': [116.4074, 39.9042],
        '广州': [113.2644, 23.1291]
    };
    
    return coordsMap[cityName] || coordsMap['上海'];
}

// 获取景点数据
function getAttractionData(cityName) {
    return [
        {
            id: '1',
            name: '外滩',
            location: '黄浦区中山东一路',
            coordinates: [121.4908, 31.2397],
            type: 'landmark',
            image: '/static/images/bund.jpg',
            tags: ['历史建筑', '夜景', '摄影'],
            rating: 4.8,
            price: '免费',
            favorited: false
        },
        {
            id: '2',
            name: '东方明珠',
            location: '浦东新区世纪大道1号',
            coordinates: [121.5067, 31.2397],
            type: 'landmark',
            image: '/static/images/oriental-pearl.jpg',
            tags: ['地标建筑', '观景台', '夜景'],
            rating: 4.6,
            price: '¥180起',
            favorited: true
        },
        {
            id: '3',
            name: '豫园',
            location: '黄浦区福佑路168号',
            coordinates: [121.4925, 31.2269],
            type: 'culture',
            image: '/static/images/yuyuan.jpg',
            tags: ['古典园林', '文化', '购物'],
            rating: 4.5,
            price: '¥40',
            favorited: false
        }
    ];
}

// 获取路线数据
function getRouteData(cityName) {
    return [
        {
            id: '1',
            name: '经典上海一日游',
            description: '外滩-东方明珠-南京路-豫园，感受上海的历史与现代',
            type: '经典路线',
            duration: '8小时',
            rating: 4.8,
            image: '/static/images/route1.jpg',
            color: '#007bff',
            path: [[121.4908, 31.2397], [121.5067, 31.2397], [121.4925, 31.2269]],
            points: [
                { name: '外滩', coordinates: [121.4908, 31.2397] },
                { name: '东方明珠', coordinates: [121.5067, 31.2397] },
                { name: '豫园', coordinates: [121.4925, 31.2269] }
            ]
        },
        {
            id: '2',
            name: '红色历史之旅',
            description: '中共一大会址-中共二大会址-龙华烈士陵园',
            type: '红色旅游',
            duration: '6小时',
            rating: 4.9,
            image: '/static/images/route2.jpg',
            color: '#dc3545',
            path: [[121.4737, 31.2304], [121.4825, 31.2189], [121.4392, 31.1659]],
            points: [
                { name: '中共一大会址', coordinates: [121.4737, 31.2304] },
                { name: '中共二大会址', coordinates: [121.4825, 31.2189] },
                { name: '龙华烈士陵园', coordinates: [121.4392, 31.1659] }
            ]
        }
    ];
}

// 获取志愿服务数据
function getVolunteerData(cityName) {
    return [
        {
            id: '1',
            name: '外滩志愿服务点',
            coordinates: [121.4908, 31.2397],
            services: ['导览服务', '无障碍协助', '语言翻译'],
            volunteers: 12
        },
        {
            id: '2',
            name: '豫园志愿服务点',
            coordinates: [121.4925, 31.2269],
            services: ['文化讲解', '购物指导', '应急救助'],
            volunteers: 8
        }
    ];
}

// 获取推荐数据
function getRecommendationData(cityName) {
    return [
        {
            type: 'weather',
            icon: '🌤️',
            title: '天气预报',
            description: '查看今日天气，合理安排行程'
        },
        {
            type: 'traffic',
            icon: '🚇',
            title: '交通指南',
            description: '地铁公交路线，出行更便捷'
        },
        {
            type: 'food',
            icon: '🍜',
            title: '特色美食',
            description: '品尝地道上海菜，小笼包生煎包'
        },
        {
            type: 'hotel',
            icon: '🏨',
            title: '住宿推荐',
            description: '精选酒店民宿，舒适便捷'
        },
        {
            type: 'shopping',
            icon: '🛍️',
            title: '购物天堂',
            description: '南京路淮海路，购物血拼好去处'
        },
        {
            type: 'culture',
            icon: '🎭',
            title: '文化体验',
            description: '博物馆剧院，感受海派文化'
        }
    ];
}

// 获取景点图标
function getAttractionIcon(type) {
    const iconMap = {
        'landmark': '/static/images/landmark-icon.png',
        'culture': '/static/images/culture-icon.png',
        'nature': '/static/images/nature-icon.png',
        'food': '/static/images/food-icon.png'
    };
    
    return iconMap[type] || iconMap['landmark'];
}

// 获取景点数据
function getAttractionPoints() {
    return [
        { name: '外滩', lat: 31.2397, lon: 121.4908 },
        { name: '东方明珠', lat: 31.2397, lon: 121.5067 },
        { name: '豫园', lat: 31.2269, lon: 121.4925 }
    ];
}

// 显示景点信息
function showAttractionInfo(attraction) {
    const infoWindow = new AMap.InfoWindow({
        content: `
            <div class="info-window-content">
                        <h3 class="info-window-title">${attraction.name}</h3>
                        <p class="info-window-location">${attraction.location}</p>
                        <div class="info-window-footer">
                            <span class="info-window-rating">⭐ ${attraction.rating}</span>
                            <button onclick="viewAttraction('${attraction.id}')" class="info-window-btn">查看详情</button>
                </div>
            </div>
        `
    });
    
    infoWindow.open(cityMap, attraction.coordinates);
}

// 显示志愿者信息
function showVolunteerInfo(volunteer) {
    const infoWindow = new AMap.InfoWindow({
        content: `
            <div class="info-window-content">
                        <h3 class="info-window-title">${volunteer.name}</h3>
                        <p class="info-window-location">在线志愿者：${volunteer.volunteers}人</p>
                        <div class="volunteer-services">
                            ${volunteer.services.map(service => `<span class="service-tag">${service}</span>`).join('')}
                        </div>
                        <button onclick="window.location.href='/volunteer-service'" class="info-window-btn volunteer-btn">申请服务</button>
            </div>
        `
    });
    
    infoWindow.open(cityMap, volunteer.coordinates);
}

// 显示消息提示
function showMessage(message, type = 'info') {
    // 创建消息元素
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${type}`;
    messageEl.textContent = message;
    
    // 添加样式
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    // 设置背景色
    switch (type) {
        case 'success':
            messageEl.style.background = '#28a745';
            break;
        case 'error':
            messageEl.style.background = '#dc3545';
            break;
        case 'warning':
            messageEl.style.background = '#ffc107';
            messageEl.style.color = '#212529';
            break;
        default:
            messageEl.style.background = '#17a2b8';
    }
    
    // 添加到页面
    document.body.appendChild(messageEl);
    
    // 自动移除
    setTimeout(() => {
        messageEl.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 300);
    }, 3000);
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
/**
 * Light China Google Maps 地图交互功能
 * 基于 Google Maps JavaScript API 实现全国地图到城市地图的交互
 */

class GoogleMapController {
    constructor() {
        this.map = null;
        this.markers = [];
        this.infoWindow = null;
        this.currentView = 'china'; // 'china' | 'city'
        this.currentCity = null;
        this.cityData = {};
        this.heatmapLayer = null;
        this.currentFilter = 'all';
        this.attractionsData = window.ATTRACTIONS_DATA || {};
        // 城市热度数据（基于2024年旅游热度数据）
        this.cityHeatData = window.CITY_HEAT_DATA || [
            // 一线城市 - 超高热度
            { name: '上海', lat: 31.2304, lng: 121.4737, heat: 1580, attractions: 68, description: '国际化大都市，现代与传统完美融合，2024年最受欢迎旅游目的地', code: 'SH' },
            { name: '北京', lat: 39.9042, lng: 116.4074, heat: 1650, attractions: 75, description: '首都北京，历史文化名城，故宫、长城等世界级景点', code: 'BJ' },
            { name: '深圳', lat: 22.5431, lng: 114.0579, heat: 1420, attractions: 52, description: '科技创新之城，现代化都市，年轻人最爱的旅游城市', code: 'SZ' },
            { name: '广州', lat: 23.1291, lng: 113.2644, heat: 1380, attractions: 58, description: '南国花城，美食之都，粤菜文化发源地', code: 'GZ' },
            
            // 新一线城市 - 高热度
            { name: '成都', lat: 30.5728, lng: 104.0668, heat: 1320, attractions: 65, description: '天府之国，美食文化之都，熊猫故乡，2024年网红打卡地', code: 'CD' },
            { name: '杭州', lat: 30.2741, lng: 120.1551, heat: 1280, attractions: 55, description: '人间天堂，西湖美景，数字经济之城', code: 'HZ' },
            { name: '重庆', lat: 29.5630, lng: 106.5516, heat: 1250, attractions: 62, description: '山城重庆，火锅之都，8D魔幻城市，抖音热门城市', code: 'CQ' },
            { name: '西安', lat: 34.3416, lng: 108.9398, heat: 1180, attractions: 58, description: '千年古都，丝路起点，兵马俑等世界文化遗产', code: 'XA' },
            { name: '南京', lat: 32.0603, lng: 118.7969, heat: 1050, attractions: 48, description: '六朝古都，文化名城，民国风情浓厚', code: 'NJ' },
            { name: '武汉', lat: 30.5928, lng: 114.3055, heat: 980, attractions: 45, description: '九省通衢，江城武汉，樱花之城', code: 'WH' },
            
            // 热门旅游城市
            { name: '三亚', lat: 18.2479, lng: 109.5146, heat: 1150, attractions: 35, description: '热带海滨城市，天涯海角，度假胜地', code: 'SY' },
            { name: '厦门', lat: 24.4798, lng: 118.0894, heat: 1080, attractions: 42, description: '海上花园，鼓浪屿，文艺小清新之城', code: 'XM' },
            { name: '青岛', lat: 36.0671, lng: 120.3826, heat: 950, attractions: 38, description: '红瓦绿树，碧海蓝天，啤酒之城', code: 'QD' },
            { name: '大理', lat: 25.6066, lng: 100.2675, heat: 920, attractions: 28, description: '风花雪月，洱海苍山，文艺青年聚集地', code: 'DL' },
            { name: '丽江', lat: 26.8721, lng: 100.2240, heat: 890, attractions: 25, description: '古城丽江，纳西文化，世界文化遗产', code: 'LJ' },
            
            // 新兴热门城市
            { name: '长沙', lat: 28.2282, lng: 112.9388, heat: 1120, attractions: 48, description: '娱乐之都，湘菜美食，橘子洲头，网红城市', code: 'CS' },
            { name: '苏州', lat: 31.2989, lng: 120.5853, heat: 980, attractions: 52, description: '园林之城，江南水乡，古典与现代并存', code: 'SZ2' },
            { name: '天津', lat: 39.3434, lng: 117.3616, heat: 850, attractions: 35, description: '海河之滨，近代建筑博物馆，相声之乡', code: 'TJ' },
            { name: '郑州', lat: 34.7466, lng: 113.6253, heat: 780, attractions: 32, description: '中原腹地，交通枢纽，少林寺所在地', code: 'ZZ' },
            { name: '济南', lat: 36.6512, lng: 117.1201, heat: 720, attractions: 28, description: '泉城济南，大明湖，趵突泉', code: 'JN' }
        ];
        this.markerIcons = window.MARKER_ICONS || {};
        
        // 中国主要城市坐标数据
        this.chinaData = [
            {name: '北京', lat: 39.9042, lng: 116.4074, value: 1500, code: 'BJ'},
            {name: '上海', lat: 31.2304, lng: 121.4737, value: 1200, code: 'SH'},
            {name: '广州', lat: 23.1291, lng: 113.2644, value: 800, code: 'GZ'},
            {name: '深圳', lat: 22.5431, lng: 114.0579, value: 750, code: 'SZ'},
            {name: '杭州', lat: 30.2741, lng: 120.1551, value: 600, code: 'HZ'},
            {name: '成都', lat: 30.5728, lng: 104.0668, value: 550, code: 'CD'},
            {name: '西安', lat: 34.3416, lng: 108.9398, value: 500, code: 'XA'},
            {name: '南京', lat: 32.0603, lng: 118.7969, value: 480, code: 'NJ'},
            {name: '武汉', lat: 30.5928, lng: 114.3055, value: 450, code: 'WH'},
            {name: '重庆', lat: 29.5630, lng: 106.5516, value: 420, code: 'CQ'},
            {name: '天津', lat: 39.3434, lng: 117.3616, value: 400, code: 'TJ'},
            {name: '苏州', lat: 31.2989, lng: 120.5853, value: 380, code: 'SZ2'},
            {name: '青岛', lat: 36.0986, lng: 120.3719, value: 350, code: 'QD'},
            {name: '长沙', lat: 28.2282, lng: 112.9388, value: 320, code: 'CS'},
            {name: '大连', lat: 38.9140, lng: 121.6147, value: 300, code: 'DL'}
        ];
        
        this.init();
    }

    async init() {
        try {
            // 等待Google Maps API加载完成
            if (typeof google === 'undefined' || !google.maps) {
                console.error('Google Maps API未加载');
                this.showError('地图库加载失败，请检查网络连接');
                return;
            }
            
            // 加载城市数据
            await this.loadCityData();
            // 加载景点数据
            this.loadAttractionsData();
            // 初始化地图
            this.initGoogleMap();
            // 绑定事件
            this.bindEvents();
            
            // 绑定浮动地图控制事件
            this.bindFloatingMapEvents();
            // 初始化筛选控件
            this.initFilterControls();
            // 加载城市排行榜
            this.loadCityRanking();
        } catch (error) {
            console.error('地图初始化失败:', error);
            this.showError('地图加载失败，请刷新页面重试');
        }
    }

    async loadCityData() {
        try {
            // 从API获取城市数据
            const response = await fetch('/map/api/cities');
            const result = await response.json();
            
            if (result.success) {
                // 合并API数据和默认数据
                this.chinaData = this.mergeWithDefaultData(result.data);
            }
        } catch (error) {
            console.error('加载城市数据失败:', error);
            // 使用默认数据
        }
    }

    mergeWithDefaultData(apiData) {
        const merged = [...this.chinaData];
        if (apiData && Array.isArray(apiData)) {
            apiData.forEach(item => {
                const existing = merged.find(city => city.code === item.code || city.name === item.name);
                if (existing) {
                    existing.value = item.value || existing.value;
                } else if (item.lat && item.lng) {
                    merged.push(item);
                }
            });
        }
        return merged;
    }

    initGoogleMap() {
        const mapContainer = document.getElementById('map');
        if (!mapContainer) {
            console.error('地图容器未找到');
            return;
        }

        // 创建地图实例 - 按照Google Maps API交互控制规范配置
        this.map = new google.maps.Map(mapContainer, {
            center: { lat: 31.2304, lng: 121.4737 }, // 默认中心：上海
            zoom: 5,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            
            // 交互控制配置
            gestureHandling: "greedy", // 允许直接缩放
            zoomControl: true,              // 保留右下角缩放按钮
            
            // 缩放级别限制
            minZoom: 4,
            maxZoom: 18,
            
            // 地图边界限制（仅允许在中国范围内活动）
            restriction: {
                latLngBounds: {
                    north: 55,
                    south: 18,
                    east: 135,
                    west: 73
                },
                strictBounds: true // 拖不出边界
            },
            
            // 地图样式
            styles: [
                {
                    featureType: 'water',
                    elementType: 'geometry',
                    stylers: [{ color: '#e3f2fd' }, { lightness: 17 }]
                },
                {
                    featureType: 'landscape',
                    elementType: 'geometry',
                    stylers: [{ color: '#f8f9fa' }, { lightness: 20 }]
                },
                {
                    featureType: 'road',
                    elementType: 'geometry',
                    stylers: [{ color: '#ffffff' }, { lightness: 18 }]
                }
            ],
            
            // 控件配置
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControlOptions: {
                position: google.maps.ControlPosition.RIGHT_BOTTOM
            }
        });

        // 创建信息窗口
        this.infoWindow = new google.maps.InfoWindow();

        // 添加地图事件监听器
        this.addMapEventListeners();

        // 初始化搜索功能
        this.initSearchBox();

        // 添加城市标记
        this.addCityMarkers();
        
        // 更新统计信息
        this.updateStats();
        
        // 延迟聚焦到上海
        setTimeout(() => {
            this.focusOnShanghai();
        }, 1000);
        
        console.log('Google Maps 初始化完成');
    }

    // 聚焦到上海的方法
    focusOnShanghai() {
        this.map.setCenter({ lat: 31.2304, lng: 121.4737 });
        this.map.setZoom(10);
        
        // 加载上海景点标记
        this.loadShanghaiAttractions();
        
        // 高亮上海标记
        const shanghaiMarker = this.markers.find(marker => 
            marker.getTitle() && marker.getTitle().includes('上海')
        );
        
        if (shanghaiMarker) {
            // 触发上海标记的点击事件
            google.maps.event.trigger(shanghaiMarker, 'click');
        }
    }
    
    // 加载景点数据
    loadAttractionsData() {
        if (window.ATTRACTIONS_DATA && window.ATTRACTIONS_DATA.shanghai) {
            this.attractionsData = window.ATTRACTIONS_DATA.shanghai;
        } else {
            console.warn('景点数据未找到，使用默认数据');
            this.attractionsData = this.getDefaultShanghaiAttractions();
        }
    }
    
    // 获取默认上海景点数据
    getDefaultShanghaiAttractions() {
        return [
            {
                title: "中共一大会址",
                lat: 31.2222,
                lng: 121.4755,
                type: "red",
                content: "中国共产党第一次全国代表大会在此召开，具有重要历史意义",
                rating: 4.8
            },
            {
                title: "四行仓库抗战纪念馆",
                lat: 31.2515,
                lng: 121.4648,
                type: "red",
                content: "八百壮士抗日英雄事迹纪念地，爱国主义教育基地",
                rating: 4.6
            },
            {
                title: "龙华烈士陵园",
                lat: 31.1774,
                lng: 121.4421,
                type: "red",
                content: "革命烈士纪念地，缅怀先烈的重要场所",
                rating: 4.7
            },
            {
                title: "南翔小笼包",
                lat: 31.2989,
                lng: 121.4179,
                type: "food",
                content: "百年美食代表，汤汁丰富，皮薄馅嫩",
                rating: 4.9
            },
            {
                title: "豫园绿波廊",
                lat: 31.2276,
                lng: 121.4920,
                type: "food",
                content: "传统上海菜代表，历史悠久的老字号餐厅",
                rating: 4.5
            },
            {
                title: "城隍庙",
                lat: 31.2276,
                lng: 121.4920,
                type: "history",
                content: "上海著名古建筑群，传统文化体验地",
                rating: 4.4
            },
            {
                title: "外滩",
                lat: 31.2396,
                lng: 121.4906,
                type: "history",
                content: "上海标志性景观，万国建筑博览群",
                rating: 4.8
            },
            {
                title: "田子坊",
                lat: 31.2108,
                lng: 121.4661,
                type: "history",
                content: "石库门建筑群，文艺创意园区",
                rating: 4.3
            }
        ];
    }
    
    // 加载上海景点标记
    loadShanghaiAttractions() {
        // 清除现有景点标记
        this.clearAttractionMarkers();
        
        this.attractionsData.forEach(attraction => {
            if (this.currentFilter === 'all' || this.currentFilter === attraction.type) {
                this.createAttractionMarker(attraction);
            }
        });
        
        this.updateFilterCount();
    }
    
    // 创建景点标记
    createAttractionMarker(attraction) {
        const marker = new google.maps.Marker({
            position: { lat: attraction.lat, lng: attraction.lng },
            map: this.map,
            title: attraction.title,
            icon: this.getMarkerIcon(attraction.type)
        });
        
        // 创建信息窗口内容
        const infoContent = this.createInfoWindowContent(attraction);
        
        // 添加点击事件
        marker.addListener('click', () => {
            this.infoWindow.setContent(infoContent);
            this.infoWindow.open(this.map, marker);
        });
        
        // 标记为景点标记
        marker.isAttraction = true;
        this.markers.push(marker);
    }
    
    // 获取标记图标
    getMarkerIcon(type) {
        const icons = {
            red: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="16" cy="16" r="14" fill="#ff4757" stroke="white" stroke-width="3"/>
                        <text x="16" y="20" text-anchor="middle" fill="white" font-size="16">🚩</text>
                    </svg>
                `),
                scaledSize: new google.maps.Size(32, 32)
            },
            food: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="16" cy="16" r="14" fill="#ffa502" stroke="white" stroke-width="3"/>
                        <text x="16" y="20" text-anchor="middle" fill="white" font-size="16">🍜</text>
                    </svg>
                `),
                scaledSize: new google.maps.Size(32, 32)
            },
            history: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="16" cy="16" r="14" fill="#3742fa" stroke="white" stroke-width="3"/>
                        <text x="16" y="20" text-anchor="middle" fill="white" font-size="16">🏛️</text>
                    </svg>
                `),
                scaledSize: new google.maps.Size(32, 32)
            }
        };
        
        return icons[type] || icons.history;
    }
    
    // 创建信息窗口内容
    createInfoWindowContent(attraction) {
        const typeNames = {
            red: '红色旅游',
            food: '美食地图',
            history: '历史地标'
        };
        
        return `
            <div class="custom-info-window">
                <div class="info-window-header">
                    <div class="info-window-title">${attraction.title}</div>
                    <div class="info-window-type">${typeNames[attraction.type] || '景点'}</div>
                </div>
                <div class="info-window-content">
                    <div class="info-window-description">${attraction.content}</div>
                    <div class="info-window-rating">⭐ ${attraction.rating || '4.5'}</div>
                    <div class="info-window-actions">
                        <button class="action-btn favorite" onclick="toggleFavorite('${attraction.title}')">❤️ 收藏</button>
                        <button class="action-btn navigate" onclick="openNavigation(${attraction.lat}, ${attraction.lng})">🧭 导航</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // 清除景点标记
    clearAttractionMarkers() {
        this.markers = this.markers.filter(marker => {
            if (marker.isAttraction) {
                marker.setMap(null);
                return false;
            }
            return true;
        });
    }
    
    // 初始化筛选控件
    initFilterControls() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // 移除所有active类
                filterBtns.forEach(b => b.classList.remove('active'));
                // 添加active类到当前按钮
                e.target.classList.add('active');
                
                // 更新筛选类型
                this.currentFilter = e.target.dataset.type;
                
                // 重新加载景点
                this.loadShanghaiAttractions();
            });
        });
    }
    
    // 更新筛选计数
    updateFilterCount() {
        const filterCountEl = document.getElementById('filterCount');
        if (filterCountEl) {
            const visibleCount = this.markers.filter(m => m.isAttraction).length;
            const typeNames = {
                all: '全部景点',
                red: '红色旅游景点',
                food: '美食景点',
                history: '历史地标'
            };
            filterCountEl.textContent = `显示 ${visibleCount} 个${typeNames[this.currentFilter] || '景点'}`;
        }
    }

    addCityMarkers() {
        // 清除现有标记
        this.clearMarkers();

        // 使用新的城市热度数据，优先使用热度数据，回退到基础城市数据
        const dataSource = this.cityHeatData.length > 0 ? this.cityHeatData : this.chinaData;
        
        dataSource.forEach(city => {
            // 根据热度值设置标记大小和颜色（兼容heat和value字段）
            const heatValue = city.heat || city.value || 0;
            const size = this.getMarkerSize(heatValue);
            const color = city.color || this.getMarkerColor(heatValue);
            
            // 创建自定义标记图标
            const icon = {
                path: google.maps.SymbolPath.CIRCLE,
                scale: size,
                fillColor: color,
                fillOpacity: 0.7,
                strokeColor: '#ffffff',
                strokeWeight: 3
            };

            const marker = new google.maps.Marker({
                position: city.position || { lat: city.lat, lng: city.lng },
                map: this.map,
                title: `${city.name} (热度: ${city.heat || city.value || 0})`,
                icon: icon,
                animation: google.maps.Animation.DROP,
                zIndex: 1000
            });

            // 添加点击事件 - 聚焦到城市
            marker.addListener('click', () => {
                if (city.code && this.attractionsData[city.code]) {
                    this.focusOnCity(city.code);
                } else {
                    this.showCityInfo(city, marker);
                }
            });

            // 添加悬停效果
            marker.addListener('mouseover', () => {
                marker.setIcon({
                    ...icon,
                    scale: size * 1.2,
                    fillOpacity: 1
                });
            });

            marker.addListener('mouseout', () => {
                marker.setIcon(icon);
            });

            this.markers.push(marker);
        });
    }

    getMarkerSize(value) {
        // 根据热度值计算标记大小 (8-20)
        const minSize = 8;
        const maxSize = 20;
        const maxValue = Math.max(...this.chinaData.map(city => city.value));
        return minSize + (value / maxValue) * (maxSize - minSize);
    }

    getMarkerColor(value) {
        // 根据热度值返回颜色
        if (value >= 1000) return '#ff4444'; // 红色 - 最热
        if (value >= 600) return '#ff8800';  // 橙色 - 很热
        if (value >= 400) return '#ffcc00';  // 黄色 - 热
        if (value >= 200) return '#88cc00';  // 绿色 - 一般
        return '#4488cc';                    // 蓝色 - 较冷
    }

    showCityInfo(city, marker) {
        const content = `
            <div class="city-info-window">
                <h3>${city.name}</h3>
                <p><strong>热度值:</strong> ${city.value}</p>
                <p><strong>坐标:</strong> ${city.lat.toFixed(4)}, ${city.lng.toFixed(4)}</p>
                <div class="info-actions">
                    <button onclick="window.mapController.viewCityDetail('${city.code}')" class="btn-primary">查看详情</button>
                    <button onclick="window.mapController.zoomToCity('${city.code}')" class="btn-secondary">放大查看</button>
                </div>
            </div>
        `;

        this.infoWindow.setContent(content);
        this.infoWindow.open(this.map, marker);
        
        // 更新右侧面板信息
        this.updateCityPanel(city);
    }

    updateCityPanel(city) {
        const panel = document.querySelector('.city-info');
        if (panel) {
            panel.innerHTML = `
                <h3>${city.name}</h3>
                <div class="city-stats">
                    <div class="stat-item">
                        <div class="stat-number">${city.value}</div>
                        <div class="stat-label">热度值</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${Math.floor(city.value * 0.8)}</div>
                        <div class="stat-label">景点数量</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${Math.floor(city.value * 0.3)}</div>
                        <div class="stat-label">游客打卡</div>
                    </div>
                </div>
                
                <h3 class="section-title">🎯 热门景点</h3>
                <div class="attraction-list">
                    <div class="attraction-item">
                        <span class="attraction-name">景点1</span>
                        <span class="attraction-rating">⭐ 4.8</span>
                    </div>
                    <div class="attraction-item">
                        <span class="attraction-name">景点2</span>
                        <span class="attraction-rating">⭐ 4.6</span>
                    </div>
                    <div class="attraction-item">
                        <span class="attraction-name">景点3</span>
                        <span class="attraction-rating">⭐ 4.5</span>
                    </div>
                </div>
            `;
        }
    }

    zoomToCity(cityCode) {
        const city = this.chinaData.find(c => c.code === cityCode);
        if (city) {
            this.map.setCenter({ lat: city.lat, lng: city.lng });
            this.map.setZoom(12);
            this.currentView = 'city';
            this.currentCity = city;
            
            // 加载城市详细数据
            this.loadCityDetails(cityCode);
        }
    }

    async loadCityDetails(cityCode) {
        try {
            const response = await fetch(`/api/map/city-data/${cityCode}`);
            const result = await response.json();
            
            if (result.success) {
                this.addCityAttractions(result.data.attractions || []);
            }
        } catch (error) {
            console.error('加载城市详情失败:', error);
            // 添加模拟景点数据
            this.addMockAttractions();
        }
    }

    addCityAttractions(attractions) {
        // 清除城市标记，添加景点标记
        this.clearMarkers();
        
        attractions.forEach(attraction => {
            const marker = new google.maps.Marker({
                position: { lat: attraction.lat, lng: attraction.lng },
                map: this.map,
                title: attraction.name,
                icon: {
                    url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                    scaledSize: new google.maps.Size(32, 32)
                }
            });

            marker.addListener('click', () => {
                this.showAttractionInfo(attraction, marker);
            });

            this.markers.push(marker);
        });
    }

    addMockAttractions() {
        if (!this.currentCity) return;
        
        // 在当前城市周围添加模拟景点
        const mockAttractions = [
            { name: '景点A', lat: this.currentCity.lat + 0.01, lng: this.currentCity.lng + 0.01, rating: 4.8 },
            { name: '景点B', lat: this.currentCity.lat - 0.01, lng: this.currentCity.lng + 0.01, rating: 4.6 },
            { name: '景点C', lat: this.currentCity.lat + 0.01, lng: this.currentCity.lng - 0.01, rating: 4.5 }
        ];
        
        this.addCityAttractions(mockAttractions);
    }

    showAttractionInfo(attraction, marker) {
        const content = `
            <div class="attraction-info-window">
                <h3>${attraction.name}</h3>
                <p><strong>评分:</strong> ⭐ ${attraction.rating || '4.5'}</p>
                <div class="info-actions">
                    <button onclick="window.location.href='/attraction/${attraction.id || 1}'" class="btn-primary">查看详情</button>
                    <button onclick="window.mapController.getDirections('${attraction.name}')" class="btn-secondary">导航</button>
                </div>
            </div>
        `;

        this.infoWindow.setContent(content);
        this.infoWindow.open(this.map, marker);
    }

    viewCityDetail(cityCode) {
        window.location.href = `/city/${cityCode}`;
    }

    getDirections(destination) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const origin = `${position.coords.latitude},${position.coords.longitude}`;
                const url = `https://www.google.com/maps/dir/${origin}/${encodeURIComponent(destination)}`;
                window.open(url, '_blank');
            }, () => {
                // 如果无法获取位置，直接搜索目的地
                const url = `https://www.google.com/maps/search/${encodeURIComponent(destination)}`;
                window.open(url, '_blank');
            });
        }
    }

    resetToChina() {
        this.map.setCenter({ lat: 35.8617, lng: 104.1954 });
        this.map.setZoom(5);
        this.currentView = 'china';
        this.currentCity = null;
        
        // 重新添加城市标记
        this.addCityMarkers();
        
        // 重置右侧面板
        this.resetCityPanel();
    }

    resetCityPanel() {
        const panel = document.querySelector('.city-info');
        if (panel) {
            panel.innerHTML = `
                <h3>选择城市</h3>
                <div class="city-stats">
                    <div class="stat-item">
                        <div class="stat-number">0</div>
                        <div class="stat-label">热度值</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">0</div>
                        <div class="stat-label">景点数量</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">0</div>
                        <div class="stat-label">游客打卡</div>
                    </div>
                </div>
                
                <h3 class="section-title">🎯 热门景点</h3>
                <div class="attraction-list">
                    <div class="placeholder-text">
                        点击地图上的城市查看景点信息
                    </div>
                </div>
            `;
        }
    }

    clearMarkers() {
        this.markers.forEach(marker => {
            marker.setMap(null);
        });
        this.markers = [];
    }

    // 聚焦到指定城市
    focusOnCity(cityCode) {
        const cityData = this.attractionsData[cityCode];
        if (!cityData) {
            console.error(`城市数据未找到: ${cityCode}`);
            return;
        }
        
        // 设置地图中心和缩放级别
        this.map.setZoom(cityData.zoom);
        this.map.setCenter(cityData.center);
        
        // 更新当前视图状态
        this.currentView = 'city';
        this.currentCity = cityCode;
        
        // 清除城市标记
        this.clearMarkers();
        
        // 添加景点标记
        this.addAttractionMarkers(cityCode);
        
        // 显示城市信息面板
        this.showCityInfoPanel(cityCode);
        
        // 显示返回按钮
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.classList.remove('hidden');
        }
        
        console.log(`已聚焦到城市: ${cityCode}`);
    }
    
    // 添加景点标记
    addAttractionMarkers(cityCode) {
        const cityData = this.attractionsData[cityCode];
        if (!cityData || !cityData.attractions) {
            return;
        }
        
        cityData.attractions.forEach(attraction => {
            // 获取对应类型的图标
            const iconConfig = this.markerIcons[attraction.type] || this.markerIcons.city;
            
            const marker = new google.maps.Marker({
                position: attraction.position,
                map: this.map,
                title: attraction.name,
                icon: iconConfig ? {
                    url: iconConfig.url,
                    scaledSize: new google.maps.Size(iconConfig.scaledSize.width, iconConfig.scaledSize.height),
                    anchor: new google.maps.Point(iconConfig.anchor.x, iconConfig.anchor.y)
                } : null,
                animation: google.maps.Animation.DROP
            });
            
            // 添加点击事件显示景点信息
            marker.addListener('click', () => {
                this.showAttractionInfo(attraction, marker);
            });
            
            this.markers.push(marker);
        });
    }
    
    // 显示景点信息窗口
    showAttractionInfo(attraction, marker) {
        const content = `
            <div class="attraction-info-window">
                <h3>${attraction.name}</h3>
                <div class="attraction-type">${this.getTypeLabel(attraction.type)}</div>
                <p class="attraction-description">${attraction.description}</p>
                <div class="attraction-stats">
                    <span class="rating">⭐ ${attraction.rating}</span>
                    <span class="visitors">👥 ${attraction.visitors}人</span>
                </div>
                <div class="attraction-tags">
                    ${attraction.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <div class="attraction-actions">
                    <button class="btn-favorite" onclick="window.mapController.toggleFavorite('${attraction.id}')">❤️ 收藏</button>
                    <button class="btn-route" onclick="window.mapController.planRoute('${attraction.id}')">🗺️ 路线规划</button>
                </div>
            </div>
        `;
        
        this.infoWindow.setContent(content);
        this.infoWindow.open(this.map, marker);
    }
    
    // 获取类型标签
    getTypeLabel(type) {
        const labels = {
            'red': '🚩 红色旅游',
            'food': '🍜 美食打卡'
        };
        return labels[type] || type;
    }
    
    // 显示城市信息面板
    showCityInfoPanel(cityCode) {
        const cityData = this.attractionsData[cityCode];
        const panel = document.getElementById('cityInfoPanel');
        const cityName = document.getElementById('cityName');
        const attractionsGrid = document.getElementById('attractionsGrid');
        
        if (panel && cityName && attractionsGrid && cityData) {
            // 设置城市名称
            cityName.textContent = this.getCityName(cityCode);
            
            // 生成景点卡片
            attractionsGrid.innerHTML = cityData.attractions.map(attraction => `
                <div class="attraction-card" data-id="${attraction.id}">
                    <div class="card-image">
                        <img src="${attraction.image}" alt="${attraction.name}" onerror="this.src='/static/images/placeholder.jpg'">
                        <div class="card-type ${attraction.type}">${this.getTypeLabel(attraction.type)}</div>
                    </div>
                    <div class="card-content">
                        <h3 class="card-title">${attraction.name}</h3>
                        <p class="card-description">${attraction.description}</p>
                        <div class="card-stats">
                            <span class="rating">⭐ ${attraction.rating}</span>
                            <span class="visitors">👥 ${attraction.visitors}</span>
                        </div>
                        <div class="card-tags">
                            ${attraction.tags.slice(0, 2).map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                        <div class="card-actions">
                            <button class="btn-favorite" onclick="window.mapController.toggleFavorite('${attraction.id}')">❤️</button>
                            <button class="btn-route" onclick="window.mapController.planRoute('${attraction.id}')">路线规划</button>
                        </div>
                    </div>
                </div>
            `).join('');
            
            // 显示面板
            panel.classList.remove('hidden');
            
            // 添加卡片点击事件
            attractionsGrid.querySelectorAll('.attraction-card').forEach(card => {
                card.addEventListener('click', () => {
                    const attractionId = card.dataset.id;
                    const attraction = cityData.attractions.find(a => a.id === attractionId);
                    if (attraction) {
                        // 在地图上高亮显示对应标记
                        this.highlightAttraction(attraction);
                    }
                });
            });
        }
    }
    
    // 获取城市中文名称
    getCityName(cityCode) {
        const names = {
            'shanghai': '上海',
            'beijing': '北京',
            'guangzhou': '广州',
            'shenzhen': '深圳',
            'hangzhou': '杭州',
            'chengdu': '成都',
            'xian': '西安',
            'nanjing': '南京'
        };
        return names[cityCode] || cityCode;
    }
    
    // 高亮显示景点
    highlightAttraction(attraction) {
        // 将地图中心移动到景点位置
        this.map.panTo(attraction.position);
        this.map.setZoom(15);
        
        // 找到对应的标记并触发点击事件
        const marker = this.markers.find(m => 
            m.getPosition().lat() === attraction.position.lat && 
            m.getPosition().lng() === attraction.position.lng
        );
        
        if (marker) {
            // 模拟点击标记
            google.maps.event.trigger(marker, 'click');
            
            // 高亮标记效果
            const originalIcon = marker.getIcon();
            marker.setIcon({
                ...originalIcon,
                scale: originalIcon.scale * 1.3,
                fillOpacity: 1
            });
            
            // 2秒后恢复原状
            setTimeout(() => {
                marker.setIcon(originalIcon);
            }, 2000);
        }
    }
    
    // 返回全国视图
    backToChinaView() {
        this.currentView = 'china';
        this.map.setZoom(5);
        this.map.setCenter({ lat: 35.8617, lng: 104.1954 });
        
        // 清除景点标记
        this.clearMarkers();
        
        // 重新显示城市标记
        this.addCityMarkers();
        
        // 隐藏城市信息面板
        this.closeCityInfoPanel();
        
        // 隐藏返回按钮
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.classList.add('hidden');
        }
    }
    
    // 居中地图
    centerMap() {
        if (this.currentView === 'china') {
            this.map.setCenter({ lat: 35.8617, lng: 104.1954 });
            this.map.setZoom(5);
        } else {
            // 居中到当前城市
            const cityData = this.attractionsData[this.currentCity];
            if (cityData) {
                this.map.setCenter(cityData.center);
                this.map.setZoom(cityData.zoom);
            }
        }
    }
    
    // 刷新地图
    refreshMap() {
        if (this.currentView === 'china') {
            this.addCityMarkers();
        } else {
            this.addAttractionMarkers(this.currentCity);
        }
        this.updateStats();
    }
    
    // 搜索功能
    performSearch() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;
        
        const query = searchInput.value.trim().toLowerCase();
        if (!query) return;
        
        // 搜索城市
        const city = this.chinaData.find(c => 
            c.name.toLowerCase().includes(query) || 
            c.code.toLowerCase().includes(query)
        );
        
        if (city) {
            this.focusOnCity(city.code);
            searchInput.value = '';
            return;
        }
        
        // 搜索景点
        for (const [cityCode, cityData] of Object.entries(this.attractionsData)) {
            if (cityData.attractions) {
                const attraction = cityData.attractions.find(a => 
                    a.name.toLowerCase().includes(query)
                );
                
                if (attraction) {
                    this.focusOnCity(cityCode);
                    setTimeout(() => {
                        this.highlightAttraction(attraction);
                    }, 1000);
                    searchInput.value = '';
                    return;
                }
            }
        }
        
        this.showMessage('未找到相关结果', 'error');
    }
    
    // 关闭城市信息面板
    closeCityInfoPanel() {
        const panel = document.getElementById('cityInfoPanel');
        if (panel) {
            panel.classList.add('hidden');
        }
    }
    
    // 收藏景点
    toggleFavorite(attractionId) {
        // 这里可以调用后端API保存收藏状态
        console.log('Toggle favorite for attraction:', attractionId);
        
        // 更新UI状态
        const favoriteBtn = document.querySelector(`[onclick*="${attractionId}"] .btn-favorite`);
        if (favoriteBtn) {
            if (favoriteBtn.innerHTML.includes('❤️')) {
                favoriteBtn.innerHTML = '🤍 收藏';
            } else {
                favoriteBtn.innerHTML = '❤️ 已收藏';
            }
        }
    }
    
    // 路线规划
    planRoute(attractionId) {
        // 这里可以集成路线规划功能
        console.log('Plan route to attraction:', attractionId);
        
        // 简单实现：打开Google Maps路线规划
        const attraction = this.getAttractionById(attractionId);
        if (attraction) {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${attraction.position.lat},${attraction.position.lng}`;
            window.open(url, '_blank');
        }
    }
    
    // 根据ID获取景点信息
    getAttractionById(attractionId) {
        for (const cityData of Object.values(this.attractionsData)) {
            if (cityData.attractions) {
                const attraction = cityData.attractions.find(a => a.id === attractionId);
                if (attraction) return attraction;
            }
        }
        return null;
    }
    
    // 全屏切换
    toggleFullscreen() {
        const mapContainer = document.getElementById('map');
        if (!mapContainer) return;
        
        if (!document.fullscreenElement) {
            mapContainer.requestFullscreen().catch(err => {
                console.log('Error attempting to enable fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }
    
    updateStats() {
        const dataSource = this.cityHeatData.length > 0 ? this.cityHeatData : this.chinaData;
        const totalCities = dataSource.length;
        const totalHeat = dataSource.reduce((sum, city) => sum + city.value, 0);
        const avgHeat = Math.round(totalHeat / totalCities);
        
        // 更新统计信息显示
        const statsContainer = document.querySelector('.stats-container');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="stat-item">
                    <div class="stat-number">${totalCities}</div>
                    <div class="stat-label">城市数量</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${totalHeat}</div>
                    <div class="stat-label">总热度</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${avgHeat}</div>
                    <div class="stat-label">平均热度</div>
                </div>
            `;
        }
    }

    async loadCityRanking() {
        try {
            const rankingContainer = document.querySelector('.ranking-list');
            if (!rankingContainer) return;
            
            // 按热度值排序
            const sortedCities = [...this.chinaData]
                .sort((a, b) => b.value - a.value)
                .slice(0, 10);
            
            const rankingHTML = sortedCities.map((city, index) => `
                <div class="ranking-item" onclick="window.mapController.zoomToCity('${city.code}')">
                    <span class="rank">${index + 1}</span>
                    <span class="city-name">${city.name}</span>
                    <span class="city-value">${city.value}</span>
                </div>
            `).join('');
            
            rankingContainer.innerHTML = rankingHTML;
        } catch (error) {
            console.error('加载城市排行榜失败:', error);
        }
    }

    addMapEventListeners() {
        // 初始化用户标记数组
        this.userMarkers = [];
        this.isAddingMarker = false;
        
        // 地图点击事件 - 根据模式添加用户标记或显示信息
        this.map.addListener("click", (e) => {
            console.log("点击了地图，坐标：", e.latLng.lat(), e.latLng.lng());
            
            if (this.isAddingMarker) {
                // 添加用户自定义标记
                this.addUserMarker(e.latLng);
            } else {
                // 创建临时标记显示坐标信息
                this.showLocationInfo(e.latLng);
            }
        });
        
        // 右键菜单事件
        this.map.addListener("rightclick", (e) => {
            this.showContextMenu(e);
        });
        
        // 缩放级别变化事件
        this.map.addListener("zoom_changed", () => {
            const currentZoom = this.map.getZoom();
            console.log("当前缩放级别为：", currentZoom);
            
            // 根据缩放级别调整标记显示
            this.adjustMarkersForZoom(currentZoom);
        });
        
        // 地图中心变化事件
        this.map.addListener("center_changed", () => {
            const center = this.map.getCenter();
            console.log("地图中心变化为：", center.lat(), center.lng());
        });
        
        // 地图边界变化事件（用于视图监听）
        this.map.addListener("bounds_changed", () => {
            const bounds = this.map.getBounds();
            if (bounds) {
                console.log("地图视图边界变化");
                // 可以在这里处理视图范围内的数据加载
            }
        });
        
        // 地图拖拽结束事件
        this.map.addListener("dragend", () => {
            console.log("地图拖拽结束");
        });
    }
    
    adjustMarkersForZoom(zoomLevel) {
        // 根据缩放级别调整标记大小和可见性
        this.markers.forEach(marker => {
            const icon = marker.getIcon();
            if (icon && typeof icon === 'object') {
                const baseScale = icon.scale || 10;
                const newScale = zoomLevel > 6 ? baseScale * 1.2 : baseScale;
                
                marker.setIcon({
                    ...icon,
                    scale: newScale
                });
            }
        });
    }
    
    // 为多个标记附加信息的闭包方法
    attachMarkerInfo(marker, cityInfo) {
        const infoWindow = new google.maps.InfoWindow({ 
            content: `
                <div class="marker-info">
                    <h3>${cityInfo.name}</h3>
                    <p>热度值: ${cityInfo.value}</p>
                    <p>坐标: ${cityInfo.lat.toFixed(4)}, ${cityInfo.lng.toFixed(4)}</p>
                </div>
            `
        });
        
        marker.addListener("click", () => {
            // 关闭其他信息窗口
            if (this.infoWindow) {
                this.infoWindow.close();
            }
            
            // 打开当前信息窗口
            infoWindow.open(this.map, marker);
            
            // 缩放并聚焦到标记
            this.map.setZoom(10);
            this.map.setCenter(marker.getPosition());
        });
    }

    bindEvents() {
        // 绑定搜索按钮事件
        const searchBtn = document.getElementById('searchBtn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.performSearch();
            });
        }
        
        // 绑定搜索输入框回车事件
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
        }
        
        // 绑定返回按钮事件
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.backToChinaView();
            });
        }
        
        // 绑定刷新按钮事件
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshMap();
            });
        }
        
        // 绑定居中按钮事件
        const centerBtn = document.getElementById('centerBtn');
        if (centerBtn) {
            centerBtn.addEventListener('click', () => {
                this.centerMap();
            });
        }
        
        // 绑定全屏按钮事件
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                this.toggleFullscreen();
            });
        }
        
        // 绑定城市信息面板关闭按钮
        const closeCityPanel = document.getElementById('closeCityPanel');
        if (closeCityPanel) {
            closeCityPanel.addEventListener('click', () => {
                this.closeCityInfoPanel();
            });
        }
        
        // 绑定城市热区点击事件
        const cityHotspots = document.getElementById('cityHotspots');
        if (cityHotspots) {
            cityHotspots.addEventListener('click', (e) => {
                const hotspotItem = e.target.closest('.hotspot-item');
                if (hotspotItem) {
                    const cityCode = hotspotItem.dataset.city;
                    this.focusOnCity(cityCode);
                }
            });
        }
    }

    // 绑定浮动地图控制事件
    bindFloatingMapEvents() {
        const floatingMap = document.getElementById('floatingMap');
        const minimizeBtn = document.getElementById('minimizeBtn');
        
        if (minimizeBtn && floatingMap) {
            minimizeBtn.addEventListener('click', () => {
                floatingMap.classList.toggle('minimized');
                if (floatingMap.classList.contains('minimized')) {
                    minimizeBtn.innerHTML = '➕';
                    floatingMap.style.height = '50px';
                } else {
                    minimizeBtn.innerHTML = '➖';
                    floatingMap.style.height = '300px';
                }
            });
        }
        
        // 双击标题栏切换最小化状态
        const mapHeader = floatingMap?.querySelector('.map-header');
        if (mapHeader) {
            mapHeader.addEventListener('dblclick', () => {
                minimizeBtn?.click();
            });
        }
    }

    initSearchBox() {
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        
        if (searchInput && searchBtn) {
            // 搜索按钮点击事件
            searchBtn.addEventListener('click', () => {
                this.searchCity(searchInput.value.trim());
            });
            
            // 回车键搜索
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchCity(searchInput.value.trim());
                }
            });
            
            // 输入时的自动建议
            searchInput.addEventListener('input', (e) => {
                this.showSearchSuggestions(e.target.value.trim());
            });
        }
    }
    
    searchCity(query) {
        if (!query) return;
        
        // 在城市数据中搜索
        const city = this.chinaData.find(city => 
            city.name.includes(query) || 
            city.code.toLowerCase().includes(query.toLowerCase())
        );
        
        if (city) {
            // 找到城市，缩放到该城市
            this.map.setCenter({ lat: city.lat, lng: city.lng });
            this.map.setZoom(8);
            
            // 显示城市信息
            const marker = this.markers.find(m => m.getTitle() === city.name);
            if (marker) {
                this.showCityInfo(city, marker);
            }
            
            // 清空搜索框
            const searchInput = document.getElementById('searchInput');
            if (searchInput) searchInput.value = '';
        } else {
            // 未找到城市，显示提示
            this.showMessage('未找到相关城市，请尝试其他关键词');
        }
    }
    
    showSearchSuggestions(query) {
        if (!query || query.length < 1) return;
        
        // 简单的搜索建议实现
        const suggestions = this.chinaData
            .filter(city => city.name.includes(query))
            .slice(0, 5)
            .map(city => city.name);
            
        // 这里可以添加下拉建议框的显示逻辑
        console.log('搜索建议:', suggestions);
    }
    
    showMessage(message, type = 'info') {
        // 创建消息提示
        const messageDiv = document.createElement('div');
        messageDiv.className = `message-toast message-${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ff4444' : '#4CAF50'};
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            z-index: 10000;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        `;
        
        document.body.appendChild(messageDiv);
        
        // 3秒后自动移除
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }

    showError(message) {
        const mapContainer = document.getElementById('map');
        if (mapContainer) {
            mapContainer.innerHTML = `
                <div class="map-error-message">
                    <h3>地图加载失败</h3>
                    <p>${message}</p>
                    <button onclick="location.reload()" class="btn-primary">重新加载</button>
                </div>
            `;
        }
    }
    
    // 添加用户自定义标记
    addUserMarker(position, name = null, description = null) {
        const markerName = name || prompt('请输入标记名称:', '我的标记');
        if (!markerName) return;
        
        const markerDescription = description || prompt('请输入标记描述 (可选):', '');
        
        const userMarker = new google.maps.Marker({
            position: position,
            map: this.map,
            title: markerName,
            icon: {
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 6,
                fillColor: '#4285f4',
                fillOpacity: 0.9,
                strokeColor: '#ffffff',
                strokeWeight: 2,
                rotation: 0
            },
            draggable: true,
            animation: google.maps.Animation.DROP
        });
        
        // 添加到用户标记数组
        this.userMarkers.push({
            marker: userMarker,
            name: markerName,
            description: markerDescription,
            position: position
        });
        
        // 添加信息窗口
        const infoWindow = new google.maps.InfoWindow({
            content: this.createUserMarkerInfoWindow(markerName, markerDescription, position)
        });
        
        // 点击标记显示信息窗口
        userMarker.addListener('click', () => {
            this.closeAllInfoWindows();
            infoWindow.open(this.map, userMarker);
        });
        
        // 拖拽结束事件
        userMarker.addListener('dragend', (e) => {
            const userMarkerData = this.userMarkers.find(um => um.marker === userMarker);
            if (userMarkerData) {
                userMarkerData.position = e.latLng;
            }
        });
        
        // 右键删除标记
        userMarker.addListener('rightclick', () => {
            if (confirm('确定要删除这个标记吗？')) {
                this.removeUserMarker(userMarker);
            }
        });
        
        // 退出添加模式
        this.isAddingMarker = false;
        this.updateAddMarkerButton();
        
        // 显示成功消息
        this.showMessage('标记添加成功！', 'success');
    }
    
    // 创建用户标记信息窗口内容
    createUserMarkerInfoWindow(name, description, position) {
        return `
            <div class="user-marker-info">
                <h3>${name}</h3>
                ${description ? `<p>${description}</p>` : ''}
                <div class="coordinates">
                    <small>坐标: ${position.lat().toFixed(6)}, ${position.lng().toFixed(6)}</small>
                </div>
                <div class="marker-actions">
                    <button onclick="mapController.shareLocation(${position.lat()}, ${position.lng()})" class="share-btn">分享</button>
                </div>
            </div>
        `;
    }
    
    // 显示位置信息（临时标记）
    showLocationInfo(position) {
        const tempMarker = new google.maps.Marker({
            position: position,
            map: this.map,
            title: "位置信息",
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#ff6b6b',
                fillOpacity: 0.8,
                strokeColor: '#ffffff',
                strokeWeight: 2
            }
        });
        
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div class="location-info">
                    <h4>位置信息</h4>
                    <p>纬度: ${position.lat().toFixed(6)}</p>
                    <p>经度: ${position.lng().toFixed(6)}</p>
                    <button onclick="mapController.addMarkerAtPosition(${position.lat()}, ${position.lng()})" class="add-marker-btn">在此添加标记</button>
                </div>
            `
        });
        
        infoWindow.open(this.map, tempMarker);
        
        // 3秒后移除临时标记
        setTimeout(() => {
            tempMarker.setMap(null);
            infoWindow.close();
        }, 3000);
    }
    
    // 显示右键菜单
    showContextMenu(event) {
        const contextMenu = document.getElementById('map-context-menu') || this.createContextMenu();
        
        // 设置菜单位置
        contextMenu.style.left = event.pixel.x + 'px';
        contextMenu.style.top = event.pixel.y + 'px';
        contextMenu.style.display = 'block';
        
        // 存储点击位置
        this.contextMenuPosition = event.latLng;
        
        // 点击其他地方隐藏菜单
        setTimeout(() => {
            document.addEventListener('click', this.hideContextMenu.bind(this), { once: true });
        }, 100);
    }
    
    // 创建右键菜单
    createContextMenu() {
        const menu = document.createElement('div');
        menu.id = 'map-context-menu';
        menu.className = 'map-context-menu';
        menu.innerHTML = `
            <div class="context-menu-item" onclick="mapController.addMarkerHere()">
                <span>📍</span> 在此添加标记
            </div>
            <div class="context-menu-item" onclick="mapController.shareLocation()">
                <span>📤</span> 分享位置
            </div>
        `;
        
        document.body.appendChild(menu);
        return menu;
    }
    
    // 隐藏右键菜单
    hideContextMenu() {
        const menu = document.getElementById('map-context-menu');
        if (menu) {
            menu.style.display = 'none';
        }
    }
    
    // 在指定位置添加标记
    addMarkerHere() {
        this.hideContextMenu();
        if (this.contextMenuPosition) {
            this.addUserMarker(this.contextMenuPosition);
        }
    }
    
    // 在指定坐标添加标记
    addMarkerAtPosition(lat, lng) {
        const position = new google.maps.LatLng(lat, lng);
        this.addUserMarker(position);
    }
    
    // 移除用户标记
    removeUserMarker(marker) {
        const index = this.userMarkers.findIndex(um => um.marker === marker);
        if (index > -1) {
            marker.setMap(null);
            this.userMarkers.splice(index, 1);
            this.showMessage('标记已删除', 'info');
        }
    }
    
    // 切换添加标记模式
    toggleAddMarkerMode() {
        this.isAddingMarker = !this.isAddingMarker;
        this.updateAddMarkerButton();
        
        if (this.isAddingMarker) {
            this.showMessage('点击地图添加标记', 'info');
        } else {
            this.showMessage('已退出添加标记模式', 'info');
        }
    }
    
    // 更新添加标记按钮状态
    updateAddMarkerButton() {
        const button = document.getElementById('add-marker-btn');
        if (button) {
            button.textContent = this.isAddingMarker ? '退出添加模式' : '添加标记';
            button.className = this.isAddingMarker ? 'btn btn-secondary' : 'btn btn-primary';
        }
    }
    
    // 显示消息提示
    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `map-message map-message-${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 15px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            background-color: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        `;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }
    
    // 分享位置
    shareLocation(lat, lng) {
        const position = lat && lng ? { lat, lng } : this.contextMenuPosition;
        if (position) {
            const url = `https://maps.google.com/?q=${position.lat || position.lat()},${position.lng || position.lng()}`;
            navigator.clipboard.writeText(url).then(() => {
                this.showMessage('位置链接已复制到剪贴板', 'success');
            }).catch(() => {
                prompt('复制此链接分享位置:', url);
            });
        }
    }
    
    // 清除所有用户标记
    clearAllUserMarkers() {
        if (this.userMarkers) {
            this.userMarkers.forEach(um => um.marker.setMap(null));
            this.userMarkers = [];
            this.showMessage('所有用户标记已清除', 'info');
        }
    }
}

// 全局变量
window.mapController = null;

// 初始化函数（由Google Maps API回调）
window.initMap = function() {
    window.mapController = new GoogleMapController();
};

// 页面加载完成后的备用初始化
document.addEventListener('DOMContentLoaded', function() {
    // 如果Google Maps API已经加载但mapController未初始化
    if (typeof google !== 'undefined' && google.maps && !window.mapController) {
        setTimeout(() => {
            if (!window.mapController) {
                window.mapController = new GoogleMapController();
            }
        }, 1000);
    }
});
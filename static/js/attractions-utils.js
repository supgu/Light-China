// 景点工具函数

// 收藏功能
function toggleFavorite(attractionTitle) {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const index = favorites.indexOf(attractionTitle);
    
    if (index > -1) {
        favorites.splice(index, 1);
        showMessage(`已取消收藏 ${attractionTitle}`, 'info');
    } else {
        favorites.push(attractionTitle);
        showMessage(`已收藏 ${attractionTitle}`, 'success');
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoriteButtons();
}

// 导航功能
function openNavigation(lat, lng) {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        // 移动端优先使用高德地图
        const amapUrl = `https://uri.amap.com/navigation?to=${lng},${lat}&mode=car&policy=1&src=mypage&coordinate=gaode&callnative=0`;
        window.open(amapUrl, '_blank');
    } else {
        // 桌面端使用Google Maps
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
        window.open(googleMapsUrl, '_blank');
    }
    
    showMessage('正在打开导航...', 'info');
}

// 更新收藏按钮状态
function updateFavoriteButtons() {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const favoriteButtons = document.querySelectorAll('.action-btn.favorite');
    
    favoriteButtons.forEach(btn => {
        const attractionTitle = btn.getAttribute('onclick').match(/'([^']+)'/)[1];
        if (favorites.includes(attractionTitle)) {
            btn.innerHTML = '💖 已收藏';
            btn.classList.add('favorited');
        } else {
            btn.innerHTML = '❤️ 收藏';
            btn.classList.remove('favorited');
        }
    });
}

// 显示消息提示
function showMessage(message, type = 'info') {
    // 创建消息元素
    const messageEl = document.createElement('div');
    messageEl.className = `message-toast message-${type}`;
    messageEl.textContent = message;
    
    // 添加样式
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#52c41a' : type === 'error' ? '#ff4d4f' : '#1890ff'};
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-size: 14px;
        max-width: 300px;
        word-wrap: break-word;
        animation: slideInRight 0.3s ease-out;
    `;
    
    // 添加动画样式
    if (!document.getElementById('message-animations')) {
        const style = document.createElement('style');
        style.id = 'message-animations';
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
    }
    
    // 添加到页面
    document.body.appendChild(messageEl);
    
    // 3秒后自动移除
    setTimeout(() => {
        messageEl.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 300);
    }, 3000);
}

// 获取收藏列表
function getFavorites() {
    return JSON.parse(localStorage.getItem('favorites') || '[]');
}

// 清空收藏
function clearFavorites() {
    localStorage.removeItem('favorites');
    updateFavoriteButtons();
    showMessage('已清空收藏列表', 'info');
}

// 导出收藏列表
function exportFavorites() {
    const favorites = getFavorites();
    if (favorites.length === 0) {
        showMessage('收藏列表为空', 'info');
        return;
    }
    
    const dataStr = JSON.stringify(favorites, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `我的收藏_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showMessage('收藏列表已导出', 'success');
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 延迟更新收藏按钮状态，确保信息窗口已渲染
    setTimeout(updateFavoriteButtons, 1000);
});
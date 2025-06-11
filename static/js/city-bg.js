// 设置城市英雄区域背景图片
document.addEventListener('DOMContentLoaded', function() {
    const heroBg = document.querySelector('.city-hero-bg[data-bg-image]');
    if (heroBg) {
        const bgImage = heroBg.getAttribute('data-bg-image');
        if (bgImage) {
            heroBg.style.backgroundImage = `url('${bgImage}')`;
        }
    }
});
// 景点详情页面JavaScript

// 全局变量
let selectedRating = 0;
let uploadedImages = [];

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeReviewModal();
    initializeImageUpload();
    initializeRatingSystem();
});

// 初始化评论模态框
function initializeReviewModal() {
    const writeReviewBtn = document.getElementById('writeReviewBtn');
    const writeReviewBtn2 = document.getElementById('writeReviewBtn2');
    const reviewModal = document.getElementById('reviewModal');
    const closeReviewModal = document.getElementById('closeReviewModal');
    const cancelReview = document.getElementById('cancelReview');
    const reviewForm = document.getElementById('reviewForm');

    // 打开评论模态框的函数
    function openReviewModal() {
        reviewModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    // 为两个评论按钮添加事件监听器
    if (writeReviewBtn) {
        writeReviewBtn.addEventListener('click', openReviewModal);
    }
    
    if (writeReviewBtn2) {
        writeReviewBtn2.addEventListener('click', openReviewModal);
    }

    // 关闭评论模态框
    function closeModal() {
        reviewModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        resetReviewForm();
    }

    if (closeReviewModal) {
        closeReviewModal.addEventListener('click', closeModal);
    }

    if (cancelReview) {
        cancelReview.addEventListener('click', closeModal);
    }

    // 点击模态框外部关闭
    reviewModal.addEventListener('click', function(e) {
        if (e.target === reviewModal) {
            closeModal();
        }
    });

    // 表单提交
    if (reviewForm) {
        reviewForm.addEventListener('submit', handleReviewSubmit);
    }
}

// 初始化评分系统
function initializeRatingSystem() {
    const ratingStars = document.querySelectorAll('.rating-star');
    const ratingInput = document.getElementById('reviewRating');

    ratingStars.forEach(star => {
        star.addEventListener('click', function() {
            selectedRating = parseInt(this.dataset.rating);
            ratingInput.value = selectedRating;
            updateStarDisplay();
        });

        star.addEventListener('mouseover', function() {
            const hoverRating = parseInt(this.dataset.rating);
            highlightStars(hoverRating);
        });
    });

    // 鼠标离开时恢复选中状态
    document.querySelector('.rating-input').addEventListener('mouseleave', function() {
        updateStarDisplay();
    });
}

// 更新星星显示
function updateStarDisplay() {
    highlightStars(selectedRating);
}

// 高亮星星
function highlightStars(rating) {
    const ratingStars = document.querySelectorAll('.rating-star');
    ratingStars.forEach((star, index) => {
        if (index < rating) {
            star.style.color = '#ffd700';
            star.style.textShadow = '0 0 5px rgba(255, 215, 0, 0.5)';
        } else {
            star.style.color = '#ddd';
            star.style.textShadow = 'none';
        }
    });
}

// 初始化图片上传
function initializeImageUpload() {
    const imageInput = document.getElementById('reviewImages');
    const uploadPreview = document.getElementById('uploadPreview');

    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            handleImageSelection(e.target.files);
        });
    }
}

// 处理图片选择
function handleImageSelection(files) {
    const uploadPreview = document.getElementById('uploadPreview');
    uploadPreview.innerHTML = '';
    uploadedImages = [];

    Array.from(files).forEach((file, index) => {
        if (file.type.startsWith('image/')) {
            uploadedImages.push(file);
            
            // 创建预览元素
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            
            const img = document.createElement('img');
            img.className = 'preview-image';
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-image';
            removeBtn.innerHTML = '×';
            removeBtn.type = 'button';
            removeBtn.addEventListener('click', () => removeImage(index));
            
            // 读取并显示图片
            const reader = new FileReader();
            reader.onload = function(e) {
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
            
            previewItem.appendChild(img);
            previewItem.appendChild(removeBtn);
            uploadPreview.appendChild(previewItem);
        }
    });
}

// 移除图片
function removeImage(index) {
    uploadedImages.splice(index, 1);
    
    // 重新创建文件列表
    const dt = new DataTransfer();
    uploadedImages.forEach(file => dt.items.add(file));
    document.getElementById('reviewImages').files = dt.files;
    
    // 重新显示预览
    handleImageSelection(uploadedImages);
}

// 处理评论表单提交
async function handleReviewSubmit(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    try {
        // 显示加载状态
        submitBtn.disabled = true;
        submitBtn.textContent = '发布中...';
        
        // 验证表单
        if (!validateReviewForm()) {
            return;
        }
        
        // 创建FormData对象
        const formData = new FormData();
        formData.append('attraction_id', attractionData.id);
        formData.append('rating', selectedRating);
        formData.append('content', document.getElementById('reviewContent').value);
        
        // 添加图片文件
        uploadedImages.forEach(file => {
            formData.append('images', file);
        });
        
        // 获取JWT token
        const token = localStorage.getItem('access_token');
        if (!token) {
            showMessage('请先登录', 'error');
            return;
        }
        
        // 发送请求
        const response = await fetch('/api/reviews/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage('评价发布成功！', 'success');
            document.getElementById('reviewModal').style.display = 'none';
            document.body.style.overflow = 'auto';
            resetReviewForm();
            
            // 刷新评论列表
            setTimeout(() => {
                location.reload();
            }, 1500);
        } else {
            showMessage(result.error || '发布失败，请重试', 'error');
        }
        
    } catch (error) {
        console.error('提交评论失败:', error);
        showMessage('网络错误，请重试', 'error');
    } finally {
        // 恢复按钮状态
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// 验证评论表单
function validateReviewForm() {
    if (selectedRating === 0) {
        showMessage('请选择评分', 'error');
        return false;
    }
    
    const content = document.getElementById('reviewContent').value.trim();
    if (!content) {
        showMessage('请输入评价内容', 'error');
        return false;
    }
    
    if (content.length < 10) {
        showMessage('评价内容至少需要10个字符', 'error');
        return false;
    }
    
    return true;
}

// 重置评论表单
function resetReviewForm() {
    selectedRating = 0;
    uploadedImages = [];
    document.getElementById('reviewForm').reset();
    document.getElementById('uploadPreview').innerHTML = '';
    updateStarDisplay();
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
        padding: 12px 20px;
        border-radius: 4px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    // 根据类型设置背景色
    switch (type) {
        case 'success':
            messageEl.style.backgroundColor = '#4CAF50';
            break;
        case 'error':
            messageEl.style.backgroundColor = '#f44336';
            break;
        case 'warning':
            messageEl.style.backgroundColor = '#ff9800';
            break;
        default:
            messageEl.style.backgroundColor = '#2196F3';
    }
    
    // 添加到页面
    document.body.appendChild(messageEl);
    
    // 3秒后自动移除
    setTimeout(() => {
        messageEl.style.animation = 'slideOut 0.3s ease';
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
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .preview-item {
        position: relative;
        display: inline-block;
        margin: 5px;
    }
    
    .preview-image {
        width: 80px;
        height: 80px;
        object-fit: cover;
        border-radius: 4px;
        border: 2px solid #ddd;
    }
    
    .remove-image {
        position: absolute;
        top: -5px;
        right: -5px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #f44336;
        color: white;
        border: none;
        cursor: pointer;
        font-size: 12px;
        line-height: 1;
    }
    
    .remove-image:hover {
        background: #d32f2f;
    }
    
    .rating-star {
        font-size: 24px;
        cursor: pointer;
        margin: 0 2px;
        transition: all 0.2s ease;
        color: #ddd;
    }
    
    .rating-star:hover {
        transform: scale(1.1);
    }
    
    .image-upload {
        margin-top: 10px;
    }
    
    .upload-preview {
        margin-top: 10px;
        min-height: 20px;
    }
`;
document.head.appendChild(style);
// 登录注册页面JavaScript功能

// 全局变量
let currentStep = 1;
let maxSteps = 3;
let verificationTimer = null;
let verificationCountdown = 60;

// 表单切换功能
function initFormTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const formType = btn.dataset.form;
            
            // 更新标签状态
            tabBtns.forEach(tab => tab.classList.remove('active'));
            btn.classList.add('active');
            
            // 切换表单显示
            if (formType === 'login') {
                loginForm.style.display = 'block';
                registerForm.style.display = 'none';
            } else {
                loginForm.style.display = 'none';
                registerForm.style.display = 'block';
            }
        });
    });
    
    // 表单内切换链接
    const switchLinks = document.querySelectorAll('.switch-form');
    switchLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.dataset.target;
            const targetBtn = document.querySelector(`[data-form="${target}"]`);
            if (targetBtn) {
                targetBtn.click();
            }
        });
    });
}

// 登录功能
function initLogin() {
    const loginForm = document.getElementById('loginFormSubmit');
    const loginTypeBtns = document.querySelectorAll('.login-type-btn');
    const phoneGroup = document.getElementById('phoneLoginGroup');
    const emailGroup = document.getElementById('emailLoginGroup');
    const togglePasswordBtn = document.getElementById('togglePassword');
    
    // 登录方式切换
    loginTypeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            
            loginTypeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            if (type === 'phone') {
                phoneGroup.style.display = 'block';
                emailGroup.style.display = 'none';
                phoneGroup.querySelector('input').required = true;
                emailGroup.querySelector('input').required = false;
            } else {
                phoneGroup.style.display = 'none';
                emailGroup.style.display = 'block';
                phoneGroup.querySelector('input').required = false;
                emailGroup.querySelector('input').required = true;
            }
        });
    });
    
    // 密码显示/隐藏
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', () => {
            const passwordInput = loginForm.querySelector('input[name="password"]');
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                togglePasswordBtn.textContent = '🙈';
            } else {
                passwordInput.type = 'password';
                togglePasswordBtn.textContent = '👁️';
            }
        });
    }
    
    // 登录表单提交
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(loginForm);
            const loginData = Object.fromEntries(formData.entries());
            
            // 显示加载状态
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '登录中...';
            submitBtn.disabled = true;
            
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(loginData)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    // 登录成功
                    showMessage('登录成功！', 'success');
                    
                    // 保存token
                    if (result.token) {
                        localStorage.setItem('token', result.token);
                        localStorage.setItem('user', JSON.stringify(result.user));
                    }
                    
                    // 跳转到首页或指定页面
                    setTimeout(() => {
                        const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || '/';
                        window.location.href = redirectUrl;
                    }, 1000);
                } else {
                    // 登录失败
                    showMessage(result.message || '登录失败，请检查用户名和密码', 'error');
                }
            } catch (error) {
                console.error('登录错误:', error);
                showMessage('网络错误，请稍后重试', 'error');
            } finally {
                // 恢复按钮状态
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}

// 注册功能
function initRegister() {
    const registerForm = document.getElementById('registerFormSubmit');
    const registerTypeBtns = document.querySelectorAll('.register-type-btn');
    const phoneGroup = document.getElementById('phoneRegisterGroup');
    const emailGroup = document.getElementById('emailRegisterGroup');
    const sendCodeBtn = document.getElementById('sendCodeBtn');
    const togglePasswordBtn = document.getElementById('toggleRegisterPassword');
    const nextStepBtn = document.getElementById('nextStepBtn');
    const prevStepBtn = document.getElementById('prevStepBtn');
    const submitBtn = document.getElementById('submitRegisterBtn');
    const userTypeOptions = document.querySelectorAll('input[name="user_type"]');
    
    // 注册方式切换
    registerTypeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            
            registerTypeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            if (type === 'phone') {
                phoneGroup.style.display = 'block';
                emailGroup.style.display = 'none';
                phoneGroup.querySelector('input').required = true;
                emailGroup.querySelector('input').required = false;
            } else {
                phoneGroup.style.display = 'none';
                emailGroup.style.display = 'block';
                phoneGroup.querySelector('input').required = false;
                emailGroup.querySelector('input').required = true;
            }
        });
    });
    
    // 发送验证码
    if (sendCodeBtn) {
        sendCodeBtn.addEventListener('click', async () => {
            const activeType = document.querySelector('.register-type-btn.active').dataset.type;
            const contact = activeType === 'phone' 
                ? phoneGroup.querySelector('input').value
                : emailGroup.querySelector('input').value;
            
            if (!contact) {
                showMessage(`请先输入${activeType === 'phone' ? '手机号' : '邮箱地址'}`, 'error');
                return;
            }
            
            // 验证格式
            if (activeType === 'phone' && !/^1[3-9]\d{9}$/.test(contact)) {
                showMessage('请输入正确的手机号格式', 'error');
                return;
            }
            
            if (activeType === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) {
                showMessage('请输入正确的邮箱格式', 'error');
                return;
            }
            
            try {
                const response = await fetch('/api/auth/send-verification', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        type: activeType,
                        contact: contact
                    })
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    showMessage('验证码已发送', 'success');
                    startVerificationCountdown(sendCodeBtn);
                } else {
                    showMessage(result.message || '发送失败，请稍后重试', 'error');
                }
            } catch (error) {
                console.error('发送验证码错误:', error);
                showMessage('网络错误，请稍后重试', 'error');
            }
        });
    }
    
    // 密码显示/隐藏
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', () => {
            const passwordInput = registerForm.querySelector('input[name="password"]');
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                togglePasswordBtn.textContent = '🙈';
            } else {
                passwordInput.type = 'password';
                togglePasswordBtn.textContent = '👁️';
            }
        });
    }
    
    // 密码强度检测
    const passwordInput = registerForm.querySelector('input[name="password"]');
    if (passwordInput) {
        passwordInput.addEventListener('input', () => {
            updatePasswordStrength(passwordInput.value);
        });
    }
    
    // 用户类型选择
    userTypeOptions.forEach(option => {
        option.addEventListener('change', () => {
            const userType = option.value;
            const specialNeedsDetails = document.getElementById('specialNeedsDetails');
            const volunteerDetails = document.getElementById('volunteerDetails');
            const businessDetails = document.getElementById('businessDetails');
            
            // 隐藏所有详情
            specialNeedsDetails.style.display = 'none';
            volunteerDetails.style.display = 'none';
            businessDetails.style.display = 'none';
            
            // 显示对应详情
            if (userType === 'special_needs') {
                specialNeedsDetails.style.display = 'block';
            } else if (userType === 'volunteer') {
                volunteerDetails.style.display = 'block';
            } else if (userType === 'business') {
                businessDetails.style.display = 'block';
            }
        });
    });
    
    // 步骤导航
    if (nextStepBtn) {
        nextStepBtn.addEventListener('click', () => {
            if (validateCurrentStep()) {
                nextStep();
            }
        });
    }
    
    if (prevStepBtn) {
        prevStepBtn.addEventListener('click', () => {
            prevStep();
        });
    }
    
    // 注册表单提交
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!validateCurrentStep()) {
                return;
            }
            
            const formData = new FormData(registerForm);
            const registerData = Object.fromEntries(formData.entries());
            
            // 处理多选字段
            const specialNeedsTypes = Array.from(registerForm.querySelectorAll('input[name="special_needs_types"]:checked'))
                .map(input => input.value);
            const volunteerServices = Array.from(registerForm.querySelectorAll('input[name="volunteer_services"]:checked'))
                .map(input => input.value);
            const interests = Array.from(registerForm.querySelectorAll('input[name="interests"]:checked'))
                .map(input => input.value);
            
            registerData.special_needs_types = specialNeedsTypes;
            registerData.volunteer_services = volunteerServices;
            registerData.interests = interests;
            
            // 显示加载状态
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '注册中...';
            submitBtn.disabled = true;
            
            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(registerData)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    // 注册成功
                    showMessage('注册成功！正在跳转...', 'success');
                    
                    // 保存token
                    if (result.token) {
                        localStorage.setItem('token', result.token);
                        localStorage.setItem('user', JSON.stringify(result.user));
                    }
                    
                    // 跳转到首页
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 1500);
                } else {
                    // 注册失败
                    showMessage(result.message || '注册失败，请检查信息后重试', 'error');
                }
            } catch (error) {
                console.error('注册错误:', error);
                showMessage('网络错误，请稍后重试', 'error');
            } finally {
                // 恢复按钮状态
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}

// 密码找回功能
function initPasswordReset() {
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const forgotPasswordModal = document.getElementById('forgotPasswordModal');
    const closeForgotPasswordModal = document.getElementById('closeForgotPasswordModal');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const resetTypeBtns = document.querySelectorAll('.reset-type-btn');
    const phoneResetGroup = document.getElementById('phoneResetGroup');
    const emailResetGroup = document.getElementById('emailResetGroup');
    const sendResetCodeBtn = document.getElementById('sendResetCodeBtn');
    
    // 打开模态框
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            forgotPasswordModal.classList.add('show');
        });
    }
    
    // 关闭模态框
    if (closeForgotPasswordModal) {
        closeForgotPasswordModal.addEventListener('click', () => {
            forgotPasswordModal.classList.remove('show');
        });
    }
    
    // 点击背景关闭
    if (forgotPasswordModal) {
        forgotPasswordModal.addEventListener('click', (e) => {
            if (e.target === forgotPasswordModal) {
                forgotPasswordModal.classList.remove('show');
            }
        });
    }
    
    // 重置方式切换
    resetTypeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            
            resetTypeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            if (type === 'phone') {
                phoneResetGroup.style.display = 'block';
                emailResetGroup.style.display = 'none';
                phoneResetGroup.querySelector('input').required = true;
                emailResetGroup.querySelector('input').required = false;
            } else {
                phoneResetGroup.style.display = 'none';
                emailResetGroup.style.display = 'block';
                phoneResetGroup.querySelector('input').required = false;
                emailResetGroup.querySelector('input').required = true;
            }
        });
    });
    
    // 发送重置验证码
    if (sendResetCodeBtn) {
        sendResetCodeBtn.addEventListener('click', async () => {
            const activeType = document.querySelector('.reset-type-btn.active').dataset.type;
            const contact = activeType === 'phone' 
                ? phoneResetGroup.querySelector('input').value
                : emailResetGroup.querySelector('input').value;
            
            if (!contact) {
                showMessage(`请先输入${activeType === 'phone' ? '手机号' : '邮箱地址'}`, 'error');
                return;
            }
            
            try {
                const response = await fetch('/api/auth/send-reset-code', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        type: activeType,
                        contact: contact
                    })
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    showMessage('验证码已发送', 'success');
                    startVerificationCountdown(sendResetCodeBtn);
                } else {
                    showMessage(result.message || '发送失败，请稍后重试', 'error');
                }
            } catch (error) {
                console.error('发送重置验证码错误:', error);
                showMessage('网络错误，请稍后重试', 'error');
            }
        });
    }
    
    // 重置密码表单提交
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(forgotPasswordForm);
            const resetData = Object.fromEntries(formData.entries());
            
            // 验证密码确认
            if (resetData.new_password !== resetData.confirm_new_password) {
                showMessage('两次输入的密码不一致', 'error');
                return;
            }
            
            const submitBtn = forgotPasswordForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '重置中...';
            submitBtn.disabled = true;
            
            try {
                const response = await fetch('/api/auth/reset-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(resetData)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    showMessage('密码重置成功！', 'success');
                    forgotPasswordModal.classList.remove('show');
                    
                    // 切换到登录表单
                    setTimeout(() => {
                        document.querySelector('[data-form="login"]').click();
                    }, 1000);
                } else {
                    showMessage(result.message || '重置失败，请检查信息后重试', 'error');
                }
            } catch (error) {
                console.error('重置密码错误:', error);
                showMessage('网络错误，请稍后重试', 'error');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}

// 社交登录功能
function initSocialLogin() {
    const wechatLoginBtn = document.getElementById('wechatLogin');
    const qqLoginBtn = document.getElementById('qqLogin');
    const wechatLoginModal = document.getElementById('wechatLoginModal');
    const closeWechatLoginModal = document.getElementById('closeWechatLoginModal');
    
    // 微信登录
    if (wechatLoginBtn) {
        wechatLoginBtn.addEventListener('click', () => {
            wechatLoginModal.classList.add('show');
            generateWechatQR();
        });
    }
    
    // 关闭微信登录模态框
    if (closeWechatLoginModal) {
        closeWechatLoginModal.addEventListener('click', () => {
            wechatLoginModal.classList.remove('show');
        });
    }
    
    // QQ登录
    if (qqLoginBtn) {
        qqLoginBtn.addEventListener('click', () => {
            // 这里可以集成QQ登录SDK
            showMessage('QQ登录功能开发中...', 'info');
        });
    }
}

// 表单验证
function initFormValidation() {
    // 实时验证
    const inputs = document.querySelectorAll('input[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            validateField(input);
        });
        
        input.addEventListener('input', () => {
            clearFieldError(input);
        });
    });
}

// 工具函数

// 显示消息
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

// 验证码倒计时
function startVerificationCountdown(button) {
    let countdown = 60;
    button.disabled = true;
    
    const timer = setInterval(() => {
        button.textContent = `${countdown}秒后重发`;
        countdown--;
        
        if (countdown < 0) {
            clearInterval(timer);
            button.textContent = '发送验证码';
            button.disabled = false;
        }
    }, 1000);
}

// 密码强度更新
function updatePasswordStrength(password) {
    const strengthBar = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');
    
    if (!strengthBar || !strengthText) return;
    
    let strength = 0;
    let strengthLabel = '弱';
    
    // 长度检查
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    
    // 复杂度检查
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    // 设置强度
    strengthBar.className = 'strength-fill';
    if (strength <= 2) {
        strengthBar.classList.add('weak');
        strengthLabel = '弱';
    } else if (strength <= 4) {
        strengthBar.classList.add('medium');
        strengthLabel = '中';
    } else {
        strengthBar.classList.add('strong');
        strengthLabel = '强';
    }
    
    strengthText.textContent = `密码强度：${strengthLabel}`;
}

// 步骤导航
function nextStep() {
    if (currentStep < maxSteps) {
        // 隐藏当前步骤
        document.querySelector(`[data-step="${currentStep}"]`).classList.remove('active');
        
        // 显示下一步骤
        currentStep++;
        document.querySelector(`[data-step="${currentStep}"]`).classList.add('active');
        
        // 更新按钮状态
        updateStepButtons();
    }
}

function prevStep() {
    if (currentStep > 1) {
        // 隐藏当前步骤
        document.querySelector(`[data-step="${currentStep}"]`).classList.remove('active');
        
        // 显示上一步骤
        currentStep--;
        document.querySelector(`[data-step="${currentStep}"]`).classList.add('active');
        
        // 更新按钮状态
        updateStepButtons();
    }
}

function updateStepButtons() {
    const prevBtn = document.getElementById('prevStepBtn');
    const nextBtn = document.getElementById('nextStepBtn');
    const submitBtn = document.getElementById('submitRegisterBtn');
    
    // 上一步按钮
    if (currentStep === 1) {
        prevBtn.style.display = 'none';
    } else {
        prevBtn.style.display = 'inline-block';
    }
    
    // 下一步/提交按钮
    if (currentStep === maxSteps) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'inline-block';
    } else {
        nextBtn.style.display = 'inline-block';
        submitBtn.style.display = 'none';
    }
}

// 验证当前步骤
function validateCurrentStep() {
    const currentStepEl = document.querySelector(`[data-step="${currentStep}"]`);
    const requiredFields = currentStepEl.querySelectorAll('input[required], select[required]');
    
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    // 特殊验证
    if (currentStep === 1) {
        // 验证密码确认
        const password = currentStepEl.querySelector('input[name="password"]').value;
        const confirmPassword = currentStepEl.querySelector('input[name="confirm_password"]').value;
        
        if (password !== confirmPassword) {
            showFieldError(currentStepEl.querySelector('input[name="confirm_password"]'), '两次输入的密码不一致');
            isValid = false;
        }
    }
    
    return isValid;
}

// 验证单个字段
function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    
    // 必填验证
    if (field.required && !value) {
        showFieldError(field, '此字段为必填项');
        return false;
    }
    
    // 格式验证
    if (value) {
        switch (fieldName) {
            case 'phone':
                if (!/^1[3-9]\d{9}$/.test(value)) {
                    showFieldError(field, '请输入正确的手机号格式');
                    return false;
                }
                break;
            case 'email':
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    showFieldError(field, '请输入正确的邮箱格式');
                    return false;
                }
                break;
            case 'password':
                if (value.length < 6) {
                    showFieldError(field, '密码长度至少6位');
                    return false;
                }
                break;
            case 'username':
                if (value.length < 2 || value.length > 20) {
                    showFieldError(field, '用户名长度应在2-20个字符之间');
                    return false;
                }
                break;
        }
    }
    
    clearFieldError(field);
    return true;
}

// 显示字段错误
function showFieldError(field, message) {
    clearFieldError(field);
    
    field.style.borderColor = '#dc3545';
    
    const errorEl = document.createElement('div');
    errorEl.className = 'field-error';
    errorEl.textContent = message;
    errorEl.style.cssText = `
        color: #dc3545;
        font-size: 12px;
        margin-top: 5px;
    `;
    
    field.parentNode.appendChild(errorEl);
}

// 清除字段错误
function clearFieldError(field) {
    field.style.borderColor = '';
    
    const errorEl = field.parentNode.querySelector('.field-error');
    if (errorEl) {
        errorEl.remove();
    }
}

// 生成微信二维码
function generateWechatQR() {
    const qrContainer = document.getElementById('wechatQRCode');
    
    // 模拟生成二维码
    setTimeout(() => {
        qrContainer.innerHTML = `
            <div class="qr-code-container">
                        <div class="qr-code-content">
                            <div class="qr-code-icon">📱</div>
                            <div class="qr-code-text">微信扫码登录</div>
                </div>
            </div>
        `;
    }, 1000);
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
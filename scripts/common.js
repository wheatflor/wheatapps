/**
 * 공통 유틸리티 함수들
 * 모든 웹앱에서 사용 가능
 */

// 앱 기본 설정
const APP_CONFIG = {
    BASE_URL: window.location.origin + window.location.pathname.split('/apps/')[0],
    DASHBOARD_URL: function() {
        return this.BASE_URL + '/index.html';
    },
    CURRENT_PATH: window.location.pathname,
    IS_GITHUB_PAGES: window.location.hostname.includes('github.io')
};

/**
 * 로컬스토리지 래퍼 (안전한 접근)
 */
const Storage = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch(e) {
            console.warn('로컬스토리지 쓰기 오류:', e);
        }
    },
    
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch(e) {
            console.warn('로컬스토리지 읽기 오류:', e);
            return defaultValue;
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(key);
        } catch(e) {
            console.warn('로컬스토리지 삭제 오류:', e);
        }
    }
};

/**
 * 날짜/시간 유틸리티
 */
const DateUtils = {
    formatDate: (date, format = 'YYYY-MM-DD') => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },
    
    formatTime: (date, format = 'HH:MM:SS') => {
        const d = new Date(date);
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }
};

/**
 * DOM 유틸리티
 */
const DOM = {
    // 요소 선택
    select: (selector) => document.querySelector(selector),
    selectAll: (selector) => document.querySelectorAll(selector),
    
    // 요소 생성
    create: (html) => {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.firstElementChild;
    },
    
    // 클래스 조작
    addClass: (el, className) => el.classList.add(className),
    removeClass: (el, className) => el.classList.remove(className),
    toggleClass: (el, className) => el.classList.toggle(className),
    hasClass: (el, className) => el.classList.contains(className),
    
    // 속성 조작
    setAttr: (el, attr, value) => el.setAttribute(attr, value),
    getAttr: (el, attr) => el.getAttribute(attr),
    
    // 텍스트 조작
    setText: (el, text) => el.textContent = text,
    setHTML: (el, html) => el.innerHTML = html,
    
    // 이벤트
    on: (el, event, handler) => el.addEventListener(event, handler),
    off: (el, event, handler) => el.removeEventListener(event, handler),
    
    // 스타일
    setStyle: (el, styles) => Object.assign(el.style, styles),
    
    // 숨김/표시
    show: (el) => el.style.display = '',
    hide: (el) => el.style.display = 'none'
};

/**
 * 네트워크 유틸리티
 */
const Network = {
    fetch: async (url, options = {}) => {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch(error) {
            console.error('네트워크 오류:', error);
            throw error;
        }
    }
};

/**
 * 유효성 검사
 */
const Validator = {
    isEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    isPhone: (phone) => /^[\d\-\+\(\) ]{7,}$/.test(phone),
    isUrl: (url) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },
    isEmpty: (value) => !value || value.trim() === '',
    isNumber: (value) => !isNaN(value) && isFinite(value)
};

/**
 * 알림 및 확인
 */
const Alerts = {
    success: (message, duration = 3000) => {
        showAlert(message, 'success', duration);
    },
    
    error: (message, duration = 5000) => {
        showAlert(message, 'error', duration);
    },
    
    warning: (message, duration = 4000) => {
        showAlert(message, 'warning', duration);
    },
    
    confirm: (message) => {
        return confirm(message);
    }
};

function showAlert(message, type = 'info', duration = 3000) {
    const alertEl = document.createElement('div');
    alertEl.className = `alert alert-${type}`;
    alertEl.textContent = message;
    alertEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    const bgColor = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    }[type] || '#3b82f6';
    
    alertEl.style.backgroundColor = bgColor;
    document.body.appendChild(alertEl);
    
    setTimeout(() => {
        alertEl.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => alertEl.remove(), 300);
    }, duration);
}

// 애니메이션 CSS 추가
if (!document.querySelector('style[data-alert]')) {
    const style = document.createElement('style');
    style.setAttribute('data-alert', 'true');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(400px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

/**
 * 객체 유틸리티
 */
const ObjectUtils = {
    clone: (obj) => JSON.parse(JSON.stringify(obj)),
    
    merge: (target, source) => {
        return { ...target, ...source };
    },
    
    pick: (obj, keys) => {
        return keys.reduce((acc, key) => {
            if (key in obj) acc[key] = obj[key];
            return acc;
        }, {});
    }
};

/**
 * 배열 유틸리티
 */
const ArrayUtils = {
    unique: (arr) => [...new Set(arr)],
    
    chunk: (arr, size) => {
        const chunks = [];
        for (let i = 0; i < arr.length; i += size) {
            chunks.push(arr.slice(i, i + size));
        }
        return chunks;
    },
    
    flatten: (arr) => arr.reduce((acc, val) => acc.concat(val), []),
    
    shuffle: (arr) => {
        const newArr = [...arr];
        for (let i = newArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
        }
        return newArr;
    }
};

console.log('✅ 공통 유틸리티 로드됨');
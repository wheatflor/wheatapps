/**
 * 회사 정보 검색 웹앱
 * - 회사명 + 검색항목으로 자동 구글 검색
 * - localStorage를 이용한 항목 저장
 * - Enter 키 검색 지원
 */

// 상태 관리
const appState = {
    items: Storage.get('searchItems', []),
    statusMessage: null,
    statusTimeout: null
};

// DOM 요소
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const itemInput = document.getElementById('itemInput');
const addItemBtn = document.getElementById('addItemBtn');
const itemsList = document.getElementById('itemsList');
const statusMessage = document.getElementById('statusMessage');

/**
 * 앱 초기화
 */
function initializeApp() {
    console.log('🔍 회사 정보 검색 앱 초기화');

    renderItems();
    setupEventListeners();
}

/**
 * 이벤트 리스너 설정
 */
function setupEventListeners() {
    // 검색 입력 - Enter 키
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // 항목 입력 - Enter 키
    itemInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAddItem();
        }
    });

    // 버튼 클릭
    searchBtn.addEventListener('click', handleSearch);
    addItemBtn.addEventListener('click', handleAddItem);
}

/**
 * 검색 처리
 * - 회사명 검증
 * - 항목 검증
 * - 구글 검색 탭 순차 오픈
 */
async function handleSearch() {
    const query = searchInput.value.trim();

    // 입력값 검증
    if (!query) {
        showStatus('회사명을 입력해주세요', 'error');
        return;
    }

    if (appState.items.length === 0) {
        showStatus('검색 항목을 최소 1개 이상 설정해주세요', 'error');
        return;
    }

    // 각 항목별로 구글 검색 탭 열기 (순차적으로)
    for (let i = 0; i < appState.items.length; i++) {
        const item = appState.items[i];
        const searchQuery = `${query} ${item}`;
        const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;

        // 탭 열기
        try {
            window.open(googleSearchUrl, '_blank');
        } catch (error) {
            console.error('탭 열기 실패:', error);
            showStatus('탭을 열 수 없습니다. 팝업 차단을 확인해주세요.', 'error');
            return;
        }

        // 다음 탭까지 대기 (브라우저 부하 방지)
        if (i < appState.items.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    // 입력칸 비우기 및 포커스
    searchInput.value = '';
    searchInput.focus();

    showStatus(`✅ ${appState.items.length}개 탭이 열렸습니다`, 'success');
}

/**
 * 항목 추가 처리
 * - 입력값 검증
 * - 중복 검사
 * - 상태 저장
 * - UI 갱신
 */
function handleAddItem() {
    const itemText = itemInput.value.trim();

    // 입력값 검증
    if (!itemText) {
        showStatus('항목을 입력해주세요', 'error');
        return;
    }

    // 중복 검사
    if (appState.items.includes(itemText)) {
        showStatus('이미 추가된 항목입니다', 'error');
        return;
    }

    // 최대 10개 제한 (선택사항)
    if (appState.items.length >= 10) {
        showStatus('최대 10개까지만 추가 가능합니다', 'error');
        return;
    }

    // 항목 추가
    appState.items.push(itemText);
    saveItems();
    renderItems();

    // UI 초기화
    itemInput.value = '';
    itemInput.focus();

    showStatus('✅ 항목이 추가되었습니다', 'success');
}

/**
 * 항목 제거
 * @param {number} index - 제거할 항목의 인덱스
 */
function removeItem(index) {
    const removedItem = appState.items[index];
    appState.items.splice(index, 1);
    saveItems();
    renderItems();
    showStatus(`"${removedItem}" 항목이 제거되었습니다`, 'success');
}

/**
 * 항목 목록 렌더링
 */
function renderItems() {
    if (appState.items.length === 0) {
        itemsList.innerHTML = '<div class="empty-state">설정된 항목이 없습니다</div>';
        return;
    }

    itemsList.innerHTML = appState.items
        .map((item, index) => `
            <div class="item-row">
                <span class="item-text">${escapeHtml(item)}</span>
                <button 
                    class="item-remove-btn" 
                    onclick="removeItem(${index})"
                    title="항목 삭제"
                >
                    삭제
                </button>
            </div>
        `)
        .join('');
}

/**
 * 상태 메시지 표시
 * @param {string} message - 표시할 메시지
 * @param {string} type - 메시지 타입 (success/error)
 */
function showStatus(message, type = 'info') {
    statusMessage.textContent = message;
    statusMessage.className = `status-message status-${type}`;

    // 이전 타이머 취소
    if (appState.statusTimeout) {
        clearTimeout(appState.statusTimeout);
    }

    // 3초 후 메시지 제거
    appState.statusTimeout = setTimeout(() => {
        statusMessage.textContent = '';
        statusMessage.className = '';
    }, 3000);
}

/**
 * 상태 저장 (localStorage)
 */
function saveItems() {
    Storage.set('searchItems', appState.items);
    console.log('💾 항목 저장됨:', appState.items);
}

/**
 * HTML 이스케이프 (XSS 방지)
 * @param {string} text - 이스케이프할 텍스트
 * @returns {string} 이스케이프된 텍스트
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * 앱 시작
 */
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

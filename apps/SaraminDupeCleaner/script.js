/**
 * Saramin URL Manager 웹앱
 * - URL 정규화
 * - 중복 판별 (rec_idx 기반)
 * - 중복 제거
 * - 일괄 처리
 */

// 상태 관리
const appState = {
    currentData: [],
    duplicateIndices: new Set()
};

// DOM 요소
const inputArea = document.getElementById('inputArea');
const outputArea = document.getElementById('outputArea');
const logArea = document.getElementById('logArea');

/**
 * 앱 초기화
 */
function initializeApp() {
    console.log('🔗 Saramin URL Manager 초기화');
    addLog('Saramin URL Manager 시작');
}

/**
 * 로그 추가
 */
function addLog(message) {
    const timestamp = new Date().toLocaleTimeString('ko-KR');
    logArea.textContent += `[${timestamp}] ${message}\n`;
    logArea.scrollTop = logArea.scrollHeight;
    console.log(message);
}

/**
 * rec_idx 추출
 */
function extractRecIdx(url) {
    const match = url.match(/rec_idx=(\d+)/);
    return match ? match[1] : null;
}

/**
 * URL 정규화
 */
function normalizeUrl(url) {
    const recIdx = extractRecIdx(url);
    if (!recIdx) return url;

    const baseUrl = url.split('rec_idx=')[0];
    return `${baseUrl}rec_idx=${recIdx}`;
}

/**
 * 링크 정규화 처리
 */
function normalizeUrls() {
    const input = inputArea.value;
    const lines = input.split('\n').filter(line => line.trim());

    if (lines.length === 0) {
        addLog('❌ 입력 데이터가 없습니다.');
        Alerts.error('입력 데이터를 입력해주세요.');
        return;
    }

    appState.currentData = lines.map(line => normalizeUrl(line.trim()));
    updateOutput();
    addLog(`✅ 링크 정규화 완료: ${appState.currentData.length}개 링크 처리`);
    Alerts.success(`${appState.currentData.length}개 링크가 정규화되었습니다.`);
}

/**
 * 중복 판별
 */
function detectDuplicates() {
    const input = inputArea.value;
    const lines = input.split('\n').filter(line => line.trim());

    if (lines.length === 0) {
        addLog('❌ 입력 데이터가 없습니다.');
        Alerts.error('입력 데이터를 입력해주세요.');
        return;
    }

    appState.currentData = lines.map(line => line.trim());
    appState.duplicateIndices.clear();

    const recIdxMap = new Map();
    let duplicateCount = 0;

    appState.currentData.forEach((url, index) => {
        const recIdx = extractRecIdx(url);
        if (recIdx) {
            if (recIdxMap.has(recIdx)) {
                appState.duplicateIndices.add(index);
                if (!appState.duplicateIndices.has(recIdxMap.get(recIdx))) {
                    appState.duplicateIndices.add(recIdxMap.get(recIdx));
                }
                duplicateCount++;
            } else {
                recIdxMap.set(recIdx, index);
            }
        }
    });

    updateOutputWithHighlight();
    addLog(`✅ 중복 판별 완료: ${duplicateCount}개 중복 링크 발견`);
    Alerts.success(`${duplicateCount}개의 중복 링크가 발견되었습니다.`);
}

/**
 * 중복 제거
 */
function removeDuplicates() {
    const input = inputArea.value;
    const lines = input.split('\n').filter(line => line.trim());

    if (lines.length === 0) {
        addLog('❌ 입력 데이터가 없습니다.');
        Alerts.error('입력 데이터를 입력해주세요.');
        return;
    }

    const recIdxMap = new Map();
    const uniqueUrls = [];
    let removedCount = 0;

    lines.forEach(line => {
        const url = line.trim();
        const recIdx = extractRecIdx(url);

        if (recIdx) {
            if (!recIdxMap.has(recIdx)) {
                recIdxMap.set(recIdx, true);
                uniqueUrls.push(url);
            } else {
                removedCount++;
            }
        } else {
            uniqueUrls.push(url);
        }
    });

    appState.currentData = uniqueUrls;
    appState.duplicateIndices.clear();
    updateOutput();
    addLog(`✅ 중복 제거 완료: ${removedCount}개 중복 링크 제거됨, ${appState.currentData.length}개 링크 남음`);
    Alerts.success(`${removedCount}개 중복 제거 완료! ${appState.currentData.length}개 링크 남음`);
}

/**
 * 일괄 실행
 */
function runAll() {
    const input = inputArea.value;
    const lines = input.split('\n').filter(line => line.trim());

    if (lines.length === 0) {
        addLog('❌ 입력 데이터가 없습니다.');
        Alerts.error('입력 데이터를 입력해주세요.');
        return;
    }

    addLog('=== 🔄 일괄 실행 시작 ===');

    // 1단계: 정규화
    appState.currentData = lines.map(line => normalizeUrl(line.trim()));
    addLog(`1️⃣ 링크 정규화 완료 (${appState.currentData.length}개)`);

    // 2단계: 중복 판별
    appState.duplicateIndices.clear();
    const recIdxMap = new Map();
    let duplicateCount = 0;

    appState.currentData.forEach((url, index) => {
        const recIdx = extractRecIdx(url);
        if (recIdx) {
            if (recIdxMap.has(recIdx)) {
                appState.duplicateIndices.add(index);
                if (!appState.duplicateIndices.has(recIdxMap.get(recIdx))) {
                    appState.duplicateIndices.add(recIdxMap.get(recIdx));
                }
                duplicateCount++;
            } else {
                recIdxMap.set(recIdx, index);
            }
        }
    });
    addLog(`2️⃣ 중복 판별 완료 (${duplicateCount}개 중복 발견)`);

    // 3단계: 중복 제거
    const uniqueRecIdxMap = new Map();
    const uniqueUrls = [];
    let removedCount = 0;

    appState.currentData.forEach(url => {
        const recIdx = extractRecIdx(url);

        if (recIdx) {
            if (!uniqueRecIdxMap.has(recIdx)) {
                uniqueRecIdxMap.set(recIdx, true);
                uniqueUrls.push(url);
            } else {
                removedCount++;
            }
        } else {
            uniqueUrls.push(url);
        }
    });

    appState.currentData = uniqueUrls;
    appState.duplicateIndices.clear();
    updateOutput();
    addLog(`3️⃣ 중복 제거 완료 (${removedCount}개 제거, ${appState.currentData.length}개 최종)`);
    addLog('=== ✅ 일괄 실행 완료 ===');

    Alerts.success(`✅ 처리 완료: ${appState.currentData.length}개 고유 URL`);
}

/**
 * 출력 업데이트 (일반)
 */
function updateOutput() {
    outputArea.textContent = appState.currentData.join('\n');
}

/**
 * 출력 업데이트 (중복 강조)
 */
function updateOutputWithHighlight() {
    outputArea.innerHTML = '';

    appState.currentData.forEach((url, index) => {
        const line = document.createElement('div');
        line.textContent = url;
        if (appState.duplicateIndices.has(index)) {
            line.className = 'duplicate-line';
        }
        outputArea.appendChild(line);
    });
}

/**
 * 결과 복사
 */
function copyResult() {
    const text = appState.currentData.join('\n');

    if (!text) {
        addLog('❌ 복사할 결과가 없습니다.');
        Alerts.error('먼저 처리를 수행해주세요.');
        return;
    }

    navigator.clipboard.writeText(text).then(() => {
        addLog(`✅ 결과 복사 완료: ${appState.currentData.length}개 링크`);
        Alerts.success(`${appState.currentData.length}개 링크가 복사되었습니다.`);
    }).catch(err => {
        addLog(`❌ 복사 실패: ${err.message}`);
        Alerts.error('복사 실패: ' + err.message);
    });
}

/**
 * 앱 시작
 */
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

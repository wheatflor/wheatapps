/**
 * 텍스트 파일 병합 웹앱
 * - 여러 텍스트 파일 선택
 * - 파일 목록 관리
 * - 파일 병합 및 다운로드
 */

// 상태 관리
const appState = {
    files: [],
    merging: false
};

// DOM 요소
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const fileList = document.getElementById('file-list');
const fileListContainer = document.getElementById('file-list-container');
const fileCount = document.getElementById('file-count');
const mergeBtn = document.getElementById('merge-btn');
const clearBtn = document.getElementById('clear-btn');

/**
 * 앱 초기화
 */
function initializeApp() {
    console.log('📄 텍스트 파일 병합 앱 초기화');
    setupEventListeners();
}

/**
 * 이벤트 리스너 설정
 */
function setupEventListeners() {
    // 드롭존 클릭
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    // 파일 입력 변경
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    // 드래그 오버
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    // 드래그 종료
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    // 드롭
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        handleFiles(e.dataTransfer.files);
    });

    // 병합 버튼
    mergeBtn.addEventListener('click', handleMerge);

    // 삭제 버튼
    clearBtn.addEventListener('click', handleClear);
}

/**
 * 파일 처리
 */
function handleFiles(newFiles) {
    // .txt 파일만 필터링
    const txtFiles = Array.from(newFiles).filter(file =>
        file.name.toLowerCase().endsWith('.txt') ||
        file.type === 'text/plain'
    );

    if (txtFiles.length === 0) {
        Alerts.error('텍스트 파일(.txt)만 선택할 수 있습니다.');
        return;
    }

    // 파일 추가
    appState.files.push(...txtFiles);
    updateFileList();
    Alerts.success(`${txtFiles.length}개 파일이 추가되었습니다.`);
}

/**
 * 파일 목록 업데이트
 */
function updateFileList() {
    if (appState.files.length === 0) {
        fileListContainer.style.display = 'none';
        mergeBtn.disabled = true;
        return;
    }

    fileListContainer.style.display = 'block';
    mergeBtn.disabled = false;
    fileCount.textContent = appState.files.length;

    fileList.innerHTML = appState.files
        .map((file, index) => `
            <div class="file-item">
                <div class="file-info">
                    <span class="file-icon">📄</span>
                    <span class="file-name">${escapeHtml(file.name)}</span>
                </div>
                <button
                    class="file-remove"
                    onclick="removeFile(${index})"
                    title="파일 삭제"
                >
                    ×
                </button>
            </div>
        `)
        .join('');
}

/**
 * 파일 제거
 */
function removeFile(index) {
    const fileName = appState.files[index].name;
    appState.files.splice(index, 1);
    updateFileList();
    Alerts.success(`"${fileName}" 파일이 제거되었습니다.`);
}

/**
 * 전체 삭제
 */
function handleClear() {
    if (appState.files.length === 0) return;

    if (confirm(`${appState.files.length}개의 파일을 모두 삭제하시겠습니까?`)) {
        appState.files = [];
        fileInput.value = '';
        updateFileList();
        Alerts.success('모든 파일이 삭제되었습니다.');
    }
}

/**
 * 파일 병합 및 다운로드
 */
async function handleMerge() {
    if (appState.files.length === 0) return;

    appState.merging = true;
    mergeBtn.disabled = true;
    const originalText = mergeBtn.textContent;
    mergeBtn.textContent = '병합 중...';

    try {
        const contents = [];

        // 각 파일 읽기
        for (let i = 0; i < appState.files.length; i++) {
            try {
                const content = await readFileContent(appState.files[i]);
                contents.push(content);
            } catch (error) {
                Alerts.error(`파일 읽기 실패: ${appState.files[i].name}`);
                return;
            }
        }

        // 파일 병합 (빈 줄로 구분)
        const mergedContent = contents.join('\n');

        // 다운로드
        downloadFile(mergedContent, 'merged.txt');
        Alerts.success('✅ 파일이 병합되어 다운로드되었습니다!');

    } catch (error) {
        console.error('병합 오류:', error);
        Alerts.error('파일 병합 중 오류가 발생했습니다.');
    } finally {
        appState.merging = false;
        mergeBtn.disabled = false;
        mergeBtn.textContent = originalText;
    }
}

/**
 * 파일 내용 읽기
 */
function readFileContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            resolve(e.target.result);
        };

        reader.onerror = (e) => {
            reject(new Error('파일을 읽을 수 없습니다.'));
        };

        reader.readAsText(file, 'UTF-8');
    });
}

/**
 * 파일 다운로드
 */
function downloadFile(content, filename) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * HTML 이스케이프 (XSS 방지)
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 앱 시작
 */
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

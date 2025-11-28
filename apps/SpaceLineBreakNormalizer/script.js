/**
 * Whitespace Normalizer 웹앱
 * - 유니코드 특수 공백 문자 정규화
 * - 특수 줄바꿈 문자 표준화
 * - 텍스트 정규화
 */

// 상태 관리
const appState = {
    logs: []
};

// DOM 요소
const inputArea = document.getElementById('input-text');
const outputArea = document.getElementById('output-text');
const logPane = document.getElementById('log-pane');
const normalizeBtn = document.getElementById('normalize-btn');
const resetBtn = document.getElementById('reset-btn');
const copyBtn = document.getElementById('copy-btn');

// 유니코드 특수 공백 문자 목록
const SPACE_CHARS = [
    "\u00A0", // NO-BREAK SPACE
    "\u1680", // OGHAM SPACE MARK
    "\u2000", // EN QUAD
    "\u2001", // EM QUAD
    "\u2002", // EN SPACE
    "\u2003", // EM SPACE
    "\u2004", // THREE-PER-EM SPACE
    "\u2005", // FOUR-PER-EM SPACE
    "\u2006", // SIX-PER-EM SPACE
    "\u2007", // FIGURE SPACE
    "\u2008", // PUNCTUATION SPACE
    "\u2009", // THIN SPACE
    "\u200A", // HAIR SPACE
    "\u202F", // NARROW NO-BREAK SPACE
    "\u205F", // MEDIUM MATHEMATICAL SPACE
    "\u3000"  // IDEOGRAPHIC SPACE
];

// 유니코드 특수 줄바꿈 문자 목록
const LINEBREAKS = [
    "\u2028", // LINE SEPARATOR
    "\u2029", // PARAGRAPH SEPARATOR
    "\r\n",  // Windows
    "\n",     // Unix
    "\r"      // Mac old
];

/**
 * 앱 초기화
 */
function initializeApp() {
    console.log('✨ Whitespace Normalizer 초기화');
    setupEventListeners();
}

/**
 * 이벤트 리스너 설정
 */
function setupEventListeners() {
    normalizeBtn.addEventListener('click', handleNormalize);
    resetBtn.addEventListener('click', handleReset);
    copyBtn.addEventListener('click', handleCopy);

    // Enter 키 누르면 정규화
    inputArea.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            handleNormalize();
        }
    });
}

/**
 * 공백 문자 정규화
 */
function normalizeWhitespace(text) {
    let logs = [];
    let original = text;

    // 1. 특수 공백 정규화
    SPACE_CHARS.forEach(char => {
        if (text.includes(char)) {
            const charMap = {
                "\u00A0": "NO-BREAK SPACE (NBSP)",
                "\u1680": "OGHAM SPACE MARK",
                "\u2000": "EN QUAD",
                "\u2001": "EM QUAD",
                "\u2002": "EN SPACE",
                "\u2003": "EM SPACE",
                "\u2004": "THREE-PER-EM SPACE",
                "\u2005": "FOUR-PER-EM SPACE",
                "\u2006": "SIX-PER-EM SPACE",
                "\u2007": "FIGURE SPACE",
                "\u2008": "PUNCTUATION SPACE",
                "\u2009": "THIN SPACE",
                "\u200A": "HAIR SPACE",
                "\u202F": "NARROW NO-BREAK SPACE",
                "\u205F": "MEDIUM MATHEMATICAL SPACE",
                "\u3000": "IDEOGRAPHIC SPACE"
            };
            text = text.split(char).join(" ");
            logs.push(`✓ "${charMap[char]}" → 일반 스페이스`);
        }
    });

    // 2. 특수 줄바꿈 정규화
    [["\u2028", "LINE SEPARATOR"], ["\u2029", "PARAGRAPH SEPARATOR"], ["\r\n", "Windows CRLF"], ["\r", "Old Mac CR"]].forEach(([char, name]) => {
        if (text.includes(char)) {
            text = text.split(char).join("\n");
            logs.push(`✓ "${name}" → 표준 줄바꿈`);
        }
    });

    // 3. 연속 스페이스 압축
    if (/(  +)/.test(text)) {
        text = text.replace(/ +/g, " ");
        logs.push("✓ 연속된 스페이스 → 1개로 변환");
    }

    // 4. 각 줄 앞뒤 공백 제거
    let before = text;
    text = text.split('\n').map(line => line.trim()).join('\n');
    if (text !== before) logs.push("✓ 각 줄 앞/뒤 스페이스 제거");

    // 5. 연속 빈 줄 정규화
    before = text;
    text = text.replace(/\n{3,}/g, '\n\n');
    if (text !== before) logs.push("✓ 3개↑ 연속 빈줄 → 2개로 변환");

    // 6. 탭을 4칸 스페이스로 변환
    if (text.includes("\t")) {
        text = text.replace(/\t/g, "    ");
        logs.push("✓ 탭(\\t) → 4개 스페이스로 변환");
    }

    // 7. 전체 앞뒤 불필요한 공백 제거
    before = text;
    text = text.replace(/^\s+|\s+$/g, '');
    if (text !== before) logs.push("✓ 전체 앞/뒤 빈줄 및 공백 제거");

    if (logs.length === 0) logs.push("ℹ️ 수정사항 없음 (이미 표준 상태)");

    return { text, logs };
}

/**
 * 정규화 처리
 */
function handleNormalize() {
    const input = inputArea.value;

    if (!input.trim()) {
        Alerts.error('입력 텍스트를 입력해주세요.');
        return;
    }

    const result = normalizeWhitespace(input);
    outputArea.value = result.text;
    appState.logs = result.logs;
    updateLogPane();

    Alerts.success(`✅ 정규화 완료: ${result.logs.length}개 처리`);
}

/**
 * 초기화
 */
function handleReset() {
    inputArea.value = '';
    outputArea.value = '';
    logPane.textContent = '';
    appState.logs = [];
    Alerts.success('초기화되었습니다.');
}

/**
 * 로그 표시 업데이트
 */
function updateLogPane() {
    logPane.textContent = appState.logs.join('\n');
}

/**
 * 결과 복사
 */
function handleCopy() {
    const text = outputArea.value;

    if (!text) {
        Alerts.error('복사할 결과가 없습니다.');
        return;
    }

    navigator.clipboard.writeText(text).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✓ 복사됨';
        Alerts.success('결과가 복사되었습니다!');

        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 1500);
    }).catch(err => {
        Alerts.error('복사 실패: ' + err.message);
    });
}

/**
 * 앱 시작
 */
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

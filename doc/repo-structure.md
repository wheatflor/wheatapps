# 웹 앱 호스팅 레포지토리 - 폴더 구조 및 설계

## 📁 전체 폴더 구조

```
repository-root/
├── index.html                          # 대시보드 메인 페이지
├── .github/
│   └── workflows/
│       └── generate-metadata.yml       # 메타데이터 자동 생성 워크플로우
├── _data/
│   ├── tree.json                       # 자동 생성: 폴더트리 구조
│   ├── metadata.json                   # 자동 생성: 모든 앱의 메타데이터
│   └── stats.json                      # 자동 생성: 통계 데이터
├── _config/
│   └── web-app-template.md             # 웹 앱 제작 요청서 템플릿
├── apps/
│   ├── calculator/
│   │   ├── index.html
│   │   ├── metadata.json               # 각 앱의 메타데이터
│   │   ├── style.css (선택사항)
│   │   └── script.js (선택사항)
│   ├── todo-list/
│   │   ├── index.html
│   │   └── metadata.json
│   ├── weather-app/
│   │   ├── index.html
│   │   └── metadata.json
│   └── [더 많은 앱들...]
├── assets/
│   ├── icons/
│   │   ├── calculator.svg
│   │   ├── todo-list.svg
│   │   └── [앱 아이콘들...]
│   ├── styles/
│   │   ├── dashboard.css
│   │   └── common.css
│   └── scripts/
│       ├── dashboard.js
│       ├── search.js
│       └── tree-renderer.js
├── .gitignore
└── README.md
```

## 📋 각 파일의 역할

### 1. `index.html` - 대시보드
- 메인 진입점
- 3가지 보기 모드: 검색, 폴더트리, 모든 앱
- 통계 탭
- 정렬 기능 (이름 오름차순/내림차순)

### 2. `_data/tree.json` - 자동 생성 폴더트리
```json
{
  "generatedAt": "2025-01-15T10:30:45Z",
  "structure": {
    "name": "apps",
    "type": "directory",
    "path": "apps",
    "children": [
      {
        "name": "calculator",
        "type": "directory",
        "path": "apps/calculator",
        "children": [
          {
            "name": "index.html",
            "type": "file",
            "path": "apps/calculator/index.html"
          },
          {
            "name": "metadata.json",
            "type": "file",
            "path": "apps/calculator/metadata.json"
          }
        ]
      }
    ]
  }
}
```

### 3. `_data/metadata.json` - 모든 앱의 메타데이터
```json
{
  "generatedAt": "2025-01-15T10:30:45Z",
  "totalApps": 5,
  "lastUpdated": "2025-01-15 10:30:45",
  "apps": [
    {
      "id": "calculator",
      "name": "전자 계산기",
      "path": "apps/calculator/index.html",
      "description": "기본 사칙연산을 수행하는 계산기",
      "icon": "assets/icons/calculator.svg",
      "tags": ["유틸리티", "계산"],
      "features": ["덧셈", "뺄셈", "곱셈", "나눗셈"],
      "createdAt": "2025-01-10T08:00:00Z",
      "updatedAt": "2025-01-15T10:30:00Z"
    },
    {
      "id": "todo-list",
      "name": "할 일 목록",
      "path": "apps/todo-list/index.html",
      "description": "간단한 할 일 관리 앱",
      "icon": "assets/icons/todo-list.svg",
      "tags": ["생산성", "목록"],
      "features": ["항목 추가", "항목 완료", "항목 삭제"],
      "createdAt": "2025-01-12T09:00:00Z",
      "updatedAt": "2025-01-14T15:20:00Z"
    }
  ]
}
```

### 4. `_data/stats.json` - 통계 데이터
```json
{
  "totalApps": 5,
  "lastUpdated": "2025-01-15 10:30:45",
  "appsByTag": {
    "유틸리티": 2,
    "생산성": 1,
    "계산": 1,
    "목록": 1
  }
}
```

### 5. `apps/[app-name]/metadata.json` - 개별 앱 메타데이터
```json
{
  "id": "calculator",
  "name": "전자 계산기",
  "description": "기본 사칙연산을 수행하는 계산기",
  "icon": "../../assets/icons/calculator.svg",
  "tags": ["유틸리티", "계산"],
  "features": [
    "덧셈",
    "뺄셈",
    "곱셈",
    "나눗셈",
    "소수점 계산"
  ],
  "version": "1.0.0",
  "author": "Developer Name",
  "createdAt": "2025-01-10T08:00:00Z",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

---

## 🔄 GitHub Actions 워크플로우 - 메타데이터 자동 생성

### `.github/workflows/generate-metadata.yml`

**목적:**
- Push할 때마다 실행
- `apps/` 폴더의 모든 `metadata.json` 수집
- 폴더트리 구조 생성
- 통계 데이터 생성
- `_data/metadata.json`, `_data/tree.json`, `_data/stats.json` 업데이트
- 변경사항을 메인 브랜치에 자동 커밋

**실행 로직:**
1. 모든 앱 폴더 스캔
2. 각 앱의 `metadata.json` 읽기
3. 폴더트리 구조 분석
4. 세 개의 데이터 파일 생성
5. 자동 커밋 및 푸시

---

## 🎯 앱 접속 주소 규칙

**자동 생성 규칙:** 폴더 경로 기반
- 폴더 구조: `apps/calculator/index.html`
- 접속 URL: `https://username.github.io/repo-name/apps/calculator/`
- 또는: `https://username.github.io/repo-name/apps/calculator/index.html`

**메타데이터는 UI 표시용 정보일 뿐**
- 실제 링크: 자동 생성된 폴더트리 기반
- 앱 이름, 설명, 아이콘은 메타데이터에서 읽기
- 앱 경로는 `_data/metadata.json`의 `path` 필드 사용

---

## 💾 사용 방법 - 5단계

### Step 1: 레포지토리 초기화

```bash
git clone https://your-repo-url
cd your-repo
# 폴더 구조 생성
mkdir -p apps _data _config assets/{icons,styles,scripts}
mkdir -p .github/workflows
```

### Step 2: 워크플로우 파일 추가
- `.github/workflows/generate-metadata.yml` 복사 및 설정

### Step 3: 첫 번째 앱 추가

```bash
mkdir -p apps/calculator
cat > apps/calculator/index.html << 'EOF'
<!DOCTYPE html>
<html>
  <head>
    <title>계산기</title>
  </head>
  <body>
    <!-- 앱 내용 -->
  </body>
</html>
EOF

cat > apps/calculator/metadata.json << 'EOF'
{
  "id": "calculator",
  "name": "전자 계산기",
  "description": "기본 사칙연산을 수행하는 계산기",
  "icon": "../../assets/icons/calculator.svg",
  "tags": ["유틸리티", "계산"],
  "features": ["덧셈", "뺄셈", "곱셈", "나눗셈"],
  "version": "1.0.0",
  "createdAt": "2025-01-10T08:00:00Z",
  "updatedAt": "2025-01-10T08:00:00Z"
}
EOF
```

### Step 4: 푸시 및 자동 메타데이터 생성

```bash
git add .
git commit -m "Add calculator app"
git push origin main
# → GitHub Actions 자동 실행
# → _data/metadata.json, tree.json, stats.json 자동 생성
```

### Step 5: 대시보드에서 확인
- `https://username.github.io/repo-name/` 접속
- 새 앱이 자동으로 목록에 추가됨

---

## 🔧 앱 추가 프로세스

### 새 앱 추가 시 필수 요소:

1. **폴더 생성**: `apps/[app-id]/`
2. **index.html**: 앱 메인 파일
3. **metadata.json**: 앱 정보
   - `id`: 영문 소문자 + 하이픈 (폴더명과 동일)
   - `name`: 한글 앱 이름
   - `description`: 앱 설명
   - `icon`: SVG 아이콘 경로
   - `tags`: 분류 태그 배열
   - `features`: 주요 기능 배열
   - `version`: 버전 (시맨틱 버전닝)
   - `createdAt`, `updatedAt`: ISO 8601 형식 타임스탠프

### 선택사항:
- `style.css`: 외부 스타일 (index.html에 임베드 권장)
- `script.js`: 외부 스크립트 (index.html에 임베드 권장)
- 추가 리소스 파일들

---

## 🎨 대시보드 기능 상세

### 1. 검색 기능
- 검색창에 텍스트 입력 + Enter
- 검색 범위:
  - 앱 이름 (name)
  - 앱 설명 (description)
  - 태그 (tags)
  - 기능 (features)
- 실시간 결과 표시

### 2. 폴더트리 보기
- `_data/tree.json` 기반
- 재귀적 폴더 구조 표시
- 클릭으로 앱 접속

### 3. 모든 앱 보기
- 정렬 옵션: 이름 오름차순, 이름 내림차순
- 카드형 UI (아이콘, 이름, 설명, 태그)
- 클릭으로 앱 접속

### 4. 통계 탭
- 전체 앱 수
- 마지막 업데이트 시간 (년월일시분초)
- 태그별 앱 개수

---

## ✅ 체크리스트 - 새 앱 추가 시

- [ ] 폴더명은 영문 소문자 + 하이픈 (kebab-case)
- [ ] `index.html` 생성 및 완전한 HTML 구조
- [ ] `metadata.json` 생성 및 모든 필드 입력
- [ ] 아이콘 SVG 추가 (권장: 100x100px)
- [ ] 메타데이터 JSON 형식 검증
- [ ] 푸시 전 로컬에서 index.html 열어 확인
- [ ] Push 후 GitHub Actions 완료 대기
- [ ] 대시보드 새로고침 후 앱 표시 확인

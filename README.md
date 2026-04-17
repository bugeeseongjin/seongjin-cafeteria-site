# 성진이의 단양고등학교 급식 사이트

단양고등학교의 조식, 중식, 석식 메뉴와 칼로리 정보를 확인할 수 있는 웹사이트입니다.

## 주요 기능

- **오늘의 급식 조회**: NEIS API 를 통해 실시간 급식 정보 제공
- **날짜별 조회**: 원하는 날짜의 급식 메뉴 확인 가능
- **다크모드 지원**: 사용자 환경에 따른 테마 전환
- **급식 공유하기**: 클립보드 복사로 간편한 공유
- **알레르기 정보 제거**: 깔끔한 메뉴 표시

## 기술 스택

- **HTML5**: 시맨틱 마크업
- **CSS3**: 다크모드 및 반응형 디자인
- **JavaScript (ES6+)**: 동적 데이터 처리 및 API 연동
- **NEIS API**: 한국교육과학연구원의 급식 정보 API

## 프로젝트 구조

```
/workspace/
├── index.html          # 메인 HTML 파일
├── css/
│   └── style.css       # 스타일시트 (다크모드 포함)
├── js/
│   └── main.js         # 메인 JavaScript 로직
├── netlify.toml        # Netlify 설정 파일
├── index.template.html # 환경 변수 치환용 템플릿
└── README.md           # 프로젝트 문서
```

## 설치 및 실행

### 1. Netlify 에 배포

1. GitHub 저장소를 Netlify 에 연결합니다.

2. **환경 변수 설정** (필수):
   - Netlify 대시보드 로그인 → 프로젝트 (Site) 선택
   - **Site configuration** → **Environment variables** 클릭
   - **Add a variable** 클릭하여 다음 정보 입력:
     - **Variable name**: `API_KEY`
     - **Value**: NEIS 에서 발급받은 API 키 값
   - **Deploy** 버튼을 눌러 재배포

3. **빌드 설정**:
   - Build command: `cp index.template.html index.html && envsubst < index.template.html > index.html`
   - Publish directory: `.` (루트 디렉토리)

### 2. 로컬에서 테스트

```bash
# Python 내장 서버로 테스트
python -m http.server 8000

# 또는 Node.js 사용 시
npx serve .
```

브라우저에서 `http://localhost:8000` 으로 접속하세요.

## API 키 발급 방법

1. [NEIS 오픈 API 포털](https://open.neis.go.kr/portal.do) 접속
2. 회원가입 후 로그인
3. "마이페이지" → "발급키 관리"에서 API 키 발급
4. 발급된 키를 Netlify 환경 변수에 등록

## 사용 방법

1. **날짜 선택**: 상단의 날짜 입력 필드에서 원하는 날짜를 선택합니다.
2. **급식 확인**: 조식, 중식, 석식 메뉴와 칼로리 정보가 자동으로 표시됩니다.
3. **테마 전환**: 우측 상단의 토글 버튼으로 라이트/다크 모드를 전환할 수 있습니다.
4. **공유하기**: "급식 공유하기" 버튼을 클릭하면 클립보드에 메뉴가 복사됩니다.

## 커스터마이징

### 학교 정보 변경

`js/main.js` 파일의 상단 상수를 수정하세요:

```javascript
const SCHOOL_CODE = "8000040";  // 학교 코드
const OFFICE_CODE = "M10";      // 교육청 코드
```

학교 코드는 [NEIS 학교정보](https://www.schoolinfo.go.kr/) 에서 조회할 수 있습니다.

### 스타일 수정

`css/style.css` 파일을 수정하여 색상, 폰트, 레이아웃 등을 변경할 수 있습니다.

## 문제 해결

### 급식이 표시되지 않아요
- **주말/공휴일**: 주말과 공휴일에는 급식이 제공되지 않습니다.
- **방학 기간**: 방학 중에는 급식 운영이 중단될 수 있습니다.
- **API 키 확인**: Netlify 환경 변수에 API 키가 올바르게 설정되었는지 확인하세요.

### 다크모드가 작동하지 않아요
- 브라우저 캐시를 삭제하고 페이지를 새로고침 해보세요.
- localStorage 가 차단되어 있지 않은지 확인하세요.

### 클립보드 복사가 안 돼요
- HTTPS 환경에서만 정상 작동합니다.
- 브라우저 권한 설정을 확인하세요.

## 라이선스

MIT License

## 연락처

- GitHub: [@hehee9](https://github.com/hehee9)
- Email: gyugyum@gmail.com

## 감사의 글

- [NEIS 오픈 API](https://open.neis.go.kr/) - 급식 정보 제공
- [Netlify](https://www.netlify.com/) - 호스팅 서비스

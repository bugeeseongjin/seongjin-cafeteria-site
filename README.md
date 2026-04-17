# 성진이의 단양고등학교 급식 사이트

[![Netlify Status](https://api.netlify.com/api/v1/badges/7ce303d9-060c-4e85-ad8c-bd44b80acc13/deploy-status)](https://app.netlify.com/projects/seongjin-cafeteria-site/deploys)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 주요 기능

- **실시간 급식 조회**: NEIS API 를 통해 매일의 급식 정보를 제공합니다
- **다크모드 지원**: 사용자의 선호에 따라 라이트/다크 모드를 전환할 수 있습니다
- **날짜 선택**: 과거 및 미래의 급식 정보를 확인할 수 있습니다
- **클립보드 복사**: 급식 정보를 쉽게 복사하여 공유할 수 있습니다
- **반응형 디자인**: 모바일, 태블릿, 데스크톱에서 최적화된 화면을 제공합니다

## 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Netlify Functions (Node.js)
- **API**: NEIS (나이스) 급식정보 API
- **배포**: Netlify

## 프로젝트 구조

```
├── index.html              # 메인 HTML 파일
├── css/
│   └── style.css          # 스타일시트
├── js/
│   └── main.js            # 클라이언트 측 JavaScript
├── netlify/
│   └── functions/
│       └── main.js        # Netlify Functions (서버 측 로직)
└── README.md              # 프로젝트 문서
```

## 설치 및 실행

### 1. Netlify 에 배포

1. 이 저장소를 GitHub 에 푸시합니다
2. Netlify 에서 새 사이트를 생성하고 GitHub 저장소를 연결합니다
3. 다음 환경 변수를 설정합니다:
   - `API_KEY`: NEIS API 키 ([NEIS 포털](https://open.neis.go.kr/) 에서 발급)

### 2. 환경 변수 설정

Netlify 대시보드에서:
1. Site configuration > Environment variables 클릭
2. Add a variable 클릭
3. 이름: `API_KEY`, 값: 실제 NEIS API 키 입력
4. Save 저장

### 3. 재배포

환경 변수 변경 후 사이트를 재배포합니다.

## API 키 발급 방법

1. [NEIS 열린마당](https://open.neis.go.kr/) 사이트에 접속합니다
2. 회원가입 후 로그인합니다
3. '키 발급' 메뉴에서 API 키를 발급받습니다
4. 발급받은 키를 Netlify 환경 변수에 등록합니다

## 사용 방법

1. 웹사이트에 접속하면 오늘의 급식이 자동으로 표시됩니다
2. 날짜 선택기를 사용하여 다른 날짜의 급식을 확인할 수 있습니다
3. 다크모드 버튼을 눌러 테마를 전환할 수 있습니다
4. '복사' 버튼을 눌러 급식 정보를 클립보드에 복사할 수 있습니다

## 커스터마이징

### 학교 코드 변경

`js/main.js` 파일에서 학교 코드를 수정합니다:

```javascript
const SCHOOL_CODE = 'G100000384';  // 단양고등학교 코드
const SCHOOL_TYPE = 'H';           // 고등학교
```

### 시도교육청 코드 변경

`netlify/functions/main.js` 파일에서 ATPS_CODE 를 수정합니다:

```javascript
const url = `...&ATPS_CODE=11&...`;  // 11: 서울특별시교육청
```

시도교육청 코드:
- 11: 서울특별시교육청
- 12: 부산광역시교육청
- ... (기타 지역은 NEIS API 문서 참조)

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 문의

문제가 발생하거나 질문이 있으시면 이슈를 등록해주세요.

---

**성진이의 단양고등학교 급식 사이트** © 2024

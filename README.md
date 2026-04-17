# 성진중학교 급식 사이트

[![Netlify Status](https://api.netlify.com/api/v1/badges/7ce303d9-060c-4e85-ad8c-bd44b80acc13/deploy-status)](https://app.netlify.com/projects/seongjin-cafeteria-site/deploys)

성진중학교의 조식, 중식, 석식 메뉴와 칼로리 정보를 확인하는 웹사이트입니다.

## 주요 기능

- **실시간 급식 정보**: NEIS API 를 통해 최신 급식 메뉴 조회
- **다크모드 지원**: 사용자 선호에 따른 테마 전환
- **급식 공유하기**: 클립보드 복사 기능으로 간편한 공유
- **반응형 디자인**: 모바일 및 데스크톱 최적화

## 프로젝트 구조

```
├── index.html              # 메인 HTML 파일
├── css/
│   └── style.css          # 스타일시트
├── netlify/
│   └── functions/
│       └── main.js        # Netlify 함수 (API 키 관리)
└── README.md              # 프로젝트 설명서
```

## 설치 및 실행

### 1. Netlify 에 배포

1. GitHub 저장소를 Netlify 에 연결
2. 빌드 설정:
   - Build command: `echo "No build required"`
   - Publish directory: `/`

### 2. 환경 변수 설정

Netlify 대시보드에서 다음 단계를 따라 API 키를 등록하세요:

1. **Netlify 대시보드 로그인**: Netlify 에 로그인 후 프로젝트 선택
2. **환경 변수 메뉴 이동**: Site configuration > Environment variables 클릭
3. **변수 추가**: Add a variable 을 클릭하여 다음과 같이 입력:
   - 이름: `API_KEY`
   - 값: NEIS 에서 발급받은 API 키

### 3. 재배포

환경 변수 설정 후 사이트를 재배포하면 자동으로 적용됩니다.

## 사용 방법

1. 날짜 선택기로 원하는 날짜를 선택합니다
2. 조식, 중식, 석식 메뉴와 칼로리가 자동으로 표시됩니다
3. 다크모드 전환 스위치로 테마를 변경할 수 있습니다
4. '급식 공유하기' 버튼으로 메뉴 정보를 클립보드에 복사할 수 있습니다

## 기술 스택

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Netlify Functions
- **API**: NEIS 나이스교육정보서비스
- **배포**: Netlify

## 라이선스

MIT License

## 연락처

문의사항은 GitHub Issues 를 이용해 주세요.

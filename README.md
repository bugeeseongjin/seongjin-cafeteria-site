# 성진이의 단양고등학교 급식 사이트

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/ko/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/ko/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/ko/docs/Web/JavaScript)

<div align="center">

### [**Live Demo**](https://seongjin-cafeteria-site.netlify.app/)

[![Website](https://img.shields.io/badge/Website-Live-brightgreen?style=for-the-badge&logo=netlify)](https://seongjin-cafeteria-site.netlify.app/)

**위 링크를 통해 단양고등학교의 실시간 급식 정보를 확인하실 수 있습니다**

</div>

---

## 📋 개요

단양고등학교의 조식, 중식, 석식 메뉴와 칼로리 정보를 제공하는 웹사이트입니다.
NEIS(국가교육행정정보시스템) API 를 활용하여 실시간 급식 정보를 조회하고 표시합니다.

---

## ✨ 주요 기능

- **실시간 급식 정보**: NEIS API 를 통해 당일 및 선택한 날짜의 급식 메뉴 조회
- **알레르기 정보 제거**: 메뉴에서 알레르기 유발물질 표기를 자동으로 제거하여 깔끔하게 표시
- **다크 모드 지원**: 사용자의 선호에 따라 라이트/다크 테마 전환 가능
- **급식 공유하기**: 선택한 날짜의 급식 정보를 클립보드에 복사하여 공유
- **반응형 디자인**: PC, 태블릿, 모바일 등 다양한 기기에서 최적화된 화면 제공

---

## 🏗️ 프로젝트 구조

```
/workspace/
├── index.html          # 메인 HTML 파일
├── css/
│   └── style.css       # 스타일시트
├── js/
│   └── main.js         # 메인 JavaScript 로직
├── _e44a2cde-18dc-487d-96e3-2dee61acc3a5.ico  # 파비콘
└── README.md           # 프로젝트 문서
```

---

## 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **API**: NEIS 급식정보 API
- **배포**: Netlify
- **폰트**: 학교안심 빵빵학 R (Naver Nunnu Fonts)

---

## 🚀 시작하기

### 필수 요구사항

- 모던 웹 브라우저 (Chrome, Firefox, Safari, Edge 등)
- NEIS API 키 (https://open.neis.go.kr/ 에서 발급)

### 설치 및 실행

1. 저장소를 클론합니다:
   ```bash
   git clone https://github.com/hehee9/seongjin-cafeteria-site.git
   cd seongjin-cafeteria-site
   ```

2. `js/main.js` 파일에서 API 키를 설정합니다:
   ```javascript
   const API_KEY = "your-api-key-here";
   ```
   
   > ⚠️ **보안 중요**: 실제 배포 시에는 API 키를 코드에 직접 포함하지 마세요.
   > Netlify 환경 변수를 사용하는 것을 권장합니다.

3. 파일을 웹 서버에서 호스팅하거나 로컬 서버를 실행합니다:
   ```bash
   # Python 을 사용한 간단한 로컬 서버
   python -m http.server 8000
   ```

4. 브라우저에서 `http://localhost:8000` 으로 접속합니다.

---

## 🔐 API 키 설정 (Netlify 배포 시)

본 프로젝트는 Netlify 에 배포될 예정이며, API 키는 Netlify 환경 변수로 관리합니다.

### API 키 추가 단계:

1. **Netlify 대시보드 로그인**: Netlify 에 로그인 후 프로젝트 (Site) 선택
2. **환경 변수 메뉴 이동**: Site configuration > Environment variables 클릭
3. **변수 추가**: Add a variable 을 클릭하여 API 키 이름 (예: `API_KEY`) 과 값 (API key 실제 값) 을 입력
4. ** 재배포**: 환경 변수 추가 후 사이트를 재배포합니다.

```javascript
// js/main.js 에서 환경 변수 사용
const API_KEY = process.env.API_KEY || "";
```

> 📝 **참고**: 브라우저 환경에서는 `process.env` 를 직접 사용할 수 없습니다.
> Netlify Functions 를 사용하거나 빌드 시점에 환경 변수를 주입하는 방식을 고려하세요.

---

## 📱 사용 방법

### 날짜 선택

- 상단의 날짜 입력 필드에서 원하는 날짜를 선택합니다.
- 기본값은 오늘 날짜로 설정됩니다.

### 테마 변경

- 우측 상단의 토글 스위치를 클릭하여 라이트/다크 모드를 전환합니다.
- 선택한 테마는 localStorage 에 저장되어 다음 방문 시 유지됩니다.

### 급식 공유

- "급식 공유하기" 버튼을 클릭하면 현재 선택된 날짜의 급식 정보가 클립보드에 복사됩니다.
- 복사된 정보는 다음과 같은 형식입니다:
  ```
  2024-01-15 급식
  *조식*
  김치찌개 밥 미역국 (칼로리: 550.00)
  -------------------
  *중식*
  돈까스 샐러드 식혜 (칼로리: 650.00)
  -------------------
  *석식*
  된장찌개 제육볶음 (칼로리: 600.00)
  
  Powered By https://seongjin-cafeteria-site.netlify.app
  ```

---

## 🎨 커스터마이징

### 학교 코드 변경

다른 학교의 급식 정보를 표시하려면 `js/main.js` 의 상수를 수정하세요:

```javascript
const SCHOOL_CODE = "8000040";  // 대상 학교 코드
const OFFICE_CODE = "M10";      // 관할 교육청 코드
```

학교 코드와 교육청 코드는 NEIS 홈페이지에서 확인하실 수 있습니다.

### 스타일 수정

`css/style.css` 파일을 수정하여 색상, 폰트, 레이아웃 등을 자유롭게 변경할 수 있습니다.

---

## 📄 라이선스

본 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

```
MIT License

Copyright (c) 2024 Hehee

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📞 연락처

- **이메일**: gyugyum@gmail.com
- **GitHub**: [@hehee9](https://github.com/hehee9)

---

## 🙏 감사의 글

- **NEIS (국가교육행정정보시스템)**: 급식 정보 API 제공
- **Naver Nunnu Fonts**: 학교안심 빵빵학 R 폰트 제공
- **Netlify**: 무료 호스팅 서비스 제공

---

*본 프로젝트는 단양고등학교 학생들의 편의를 위해 개발되었습니다.*

/**
 * 단양고등학교 급식 사이트 - 메인 스크립트
 * @description NEIS API 를 통해 급식 정보를 조회하고 표시합니다.
 */

// 전역 상수
const SCHOOL_CODE = "8000040";
const OFFICE_CODE = "M10";

// API 키는 Netlify 환경 변수에서 가져옵니다
const API_KEY = process.env.API_KEY || "";

/**
 * 알레르기 정보를 제거하는 함수
 * @param {string} text - 원본 텍스트
 * @returns {string} - 알레르기 정보가 제거된 텍스트
 */
const removeAllergyInfo = (text) => {
    if (!text) return text;
    return text.replace(/\s*\(\d+(\.\d+)*\)/g, '');
};

/**
 * 날짜 포맷팅 함수 (YYYYMMDD)
 * @param {string} dateStr - YYYY-MM-DD 형식의 날짜 문자열
 * @returns {string} - YYYYMMDD 형식의 날짜 문자열
 */
const formatDate = (dateStr) => {
    return dateStr.split("-").join("");
};

/**
 * 급식 메뉴 조회 함수
 * @param {string} date - 조회할 날짜 (YYYYMMDD)
 * @param {string} mealCode - 식사 코드 (1: 조식, 2: 중식, 3: 석식)
 * @returns {Promise<{menu: string, calories: string}>} - 메뉴와 칼로리 정보
 */
const fetchMealMenu = async (date, mealCode) => {
    const url = `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=${API_KEY}&ATPT_OFCDC_SC_CODE=${OFFICE_CODE}&SD_SCHUL_CODE=${SCHOOL_CODE}&MLSV_YMD=${date}&MMEAL_SC_CODE=${mealCode}`;
    
    try {
        const response = await fetch(url);
        const data = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(data, "text/xml");
        
        const menuElement = xml.querySelector("DDISH_NM");
        const rawMenu = menuElement ? menuElement.textContent : "선택한 날짜의 급식이 없습니다...";
        const menu = removeAllergyInfo(rawMenu);
        const calories = xml.querySelector("CAL_INFO")?.textContent || "";
        
        return { menu, calories };
    } catch (error) {
        console.error(`Error fetching ${mealCode} menu:`, error);
        return { menu: "급식 정보를 불러오는데 실패했습니다.", calories: "" };
    }
};

/**
 * 모든 식사 메뉴를 업데이트하는 함수
 */
const updateAllMenus = async () => {
    const selectedDate = formatDate(dateInput.value);
    
    const [breakfast, lunch, dinner] = await Promise.all([
        fetchMealMenu(selectedDate, "1"),
        fetchMealMenu(selectedDate, "2"),
        fetchMealMenu(selectedDate, "3")
    ]);
    
    // 조식 업데이트
    breakfastContainer.innerHTML = breakfast.menu;
    breakfastCal.textContent = breakfast.calories;
    
    // 중식 업데이트
    lunchContainer.innerHTML = lunch.menu;
    lunchCal.textContent = lunch.calories;
    
    // 석식 업데이트
    dinnerContainer.innerHTML = dinner.menu;
    dinnerCal.textContent = dinner.calories;
};

/**
 * 메뉴 공유 함수
 */
const shareMenu = () => {
    const selectedDate = dateInput.value;
    const breakfastMenu = document.getElementById("breakfastMenu").innerText;
    const lunchMenu = document.getElementById("lunchMenu").innerText;
    const dinnerMenu = document.getElementById("dinnerMenu").innerText;
    const breakfastCal = document.getElementById("breakfastCal").innerText;
    const lunchCal = document.getElementById("lunchCal").innerText;
    const dinnerCal = document.getElementById("dinnerCal").innerText;
    
    const sharedText = `${selectedDate} 급식\n*조식*\n${breakfastMenu} (칼로리: ${breakfastCal})\n-------------------\n*중식*\n${lunchMenu} (칼로리: ${lunchCal})\n-------------------\n*석식*\n${dinnerMenu} (칼로리: ${dinnerCal})\n\nPowered By https://seongjin-cafeteria-site.netlify.app`;
    
    navigator.clipboard.writeText(sharedText)
        .then(() => alert("급식 정보가 클립보드에 복사되었습니다."))
        .catch(err => console.error("클립보드 복사 실패:", err));
};

/**
 * 테마 토글 함수
 */
const toggleTheme = () => {
    const body = document.body;
    const isDark = body.classList.contains('dark-theme');
    body.classList.toggle('dark-theme', !isDark);
    body.classList.toggle('light-theme', isDark);
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
};

/**
 * 테마 초기화 함수
 */
const initTheme = () => {
    const saved = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('dark-theme', saved === 'dark');
    document.body.classList.toggle('light-theme', saved === 'light');
    document.getElementById('theme-switch-checkbox').checked = saved === 'dark';
};

/**
 * 오늘 날짜로 설정하는 함수
 */
const setTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    dateInput.value = `${year}-${month}-${day}`;
};

/**
 * DOMContentLoaded 이벤트 리스너
 */
document.addEventListener('DOMContentLoaded', () => {
    // 요소 참조
    window.dateInput = document.getElementById("date");
    window.breakfastContainer = document.getElementById("breakfastMenu");
    window.lunchContainer = document.getElementById("lunchMenu");
    window.dinnerContainer = document.getElementById("dinnerMenu");
    window.breakfastCal = document.getElementById("breakfastCal");
    window.lunchCal = document.getElementById("lunchCal");
    window.dinnerCal = document.getElementById("dinnerCal");
    
    // 초기화
    initTheme();
    setTodayDate();
    
    // 이벤트 리스너 등록
    dateInput.addEventListener("change", updateAllMenus);
    
    // 초기 메뉴 로드
    updateAllMenus();
});

// 전역 함수로 노출 (HTML 에서 onclick 등으로 호출하기 위함)
window.shareMenu = shareMenu;
window.toggleTheme = toggleTheme;

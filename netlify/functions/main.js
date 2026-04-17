const SCHOOL_CODE = "8000040";
const OFFICE_CODE = "M10";
const API_KEY = process.env.API_KEY || "";

let dateInput;
let breakfastContainer, lunchContainer, dinnerContainer;
let breakfastCalEl, lunchCalEl, dinnerCalEl;

const removeAllergyInfo = (text) => {
    if (!text) return text;
    let cleaned = text.replace(/\n/g, ' ').replace(/<br\s*\/?>/g, ' ');
    return cleaned.replace(/\s*\(\d+(\.\d+)*\)/g, '').trim();
};

const formatDate = (dateStr) => {
    return dateStr.split("-").join("");
};

const fetchMealMenu = async (date, mealCode) => {
    if (!API_KEY) {
        console.error("API 키가 설정되지 않았습니다.");
        return { menu: "API 키가 설정되지 않았습니다.", calories: "" };
    }

    const url = `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=${API_KEY}&ATPT_OFCDC_SC_CODE=${OFFICE_CODE}&SD_SCHUL_CODE=${SCHOOL_CODE}&MLSV_YMD=${date}&MMEAL_SC_CODE=${mealCode}`;

    try {
        const response = await fetch(url);
        const data = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(data, "text/xml");

        const errorMessage = xml.querySelector("RESULT > MESSAGE");
        if (errorMessage) {
            console.error("API 에러:", errorMessage.textContent);
            return { menu: "급식 정보를 불러오는데 실패했습니다.", calories: "" };
        }

        const menuElement = xml.querySelector("DDISH_NM");
        if (!menuElement || !menuElement.textContent || menuElement.textContent.trim() === "") {
            return { menu: "선택한 날짜의 급식이 없습니다.", calories: "" };
        }

        const rawMenu = menuElement.textContent;
        const menu = removeAllergyInfo(rawMenu);
        const calories = xml.querySelector("CAL_INFO")?.textContent || "";

        return { menu, calories };
    } catch (error) {
        console.error(`Error fetching ${mealCode} menu:`, error);
        return { menu: "급식 정보를 불러오는데 실패했습니다.", calories: "" };
    }
};

const updateAllMenus = async () => {
    if (!dateInput || !dateInput.value) {
        console.error("날짜가 선택되지 않았습니다.");
        return;
    }

    const selectedDate = formatDate(dateInput.value);

    breakfastContainer.textContent = "로딩 중...";
    lunchContainer.textContent = "로딩 중...";
    dinnerContainer.textContent = "로딩 중...";
    breakfastCalEl.textContent = "";
    lunchCalEl.textContent = "";
    dinnerCalEl.textContent = "";

    const [breakfast, lunch, dinner] = await Promise.all([
        fetchMealMenu(selectedDate, "1"),
        fetchMealMenu(selectedDate, "2"),
        fetchMealMenu(selectedDate, "3")
    ]);

    breakfastContainer.textContent = breakfast.menu;
    breakfastCalEl.textContent = breakfast.calories;

    lunchContainer.textContent = lunch.menu;
    lunchCalEl.textContent = lunch.calories;

    dinnerContainer.textContent = dinner.menu;
    dinnerCalEl.textContent = dinner.calories;
};

const shareMenu = () => {
    const selectedDate = dateInput.value;
    const breakfastMenu = breakfastContainer.textContent;
    const lunchMenu = lunchContainer.textContent;
    const dinnerMenu = dinnerContainer.textContent;
    const breakfastCal = breakfastCalEl.textContent;
    const lunchCal = lunchCalEl.textContent;
    const dinnerCal = dinnerCalEl.textContent;

    const sharedText = `${selectedDate} 급식\n*조식*\n${breakfastMenu} (칼로리: ${breakfastCal})\n-------------------\n*중식*\n${lunchMenu} (칼로리: ${lunchCal})\n-------------------\n*석식*\n${dinnerMenu} (칼로리: ${dinnerCal})\n\nPowered By https://seongjin-cafeteria-site.netlify.app`;

    navigator.clipboard.writeText(sharedText)
        .then(() => alert("급식 정보가 클립보드에 복사되었습니다."))
        .catch(err => {
            console.error("클립보드 복사 실패:", err);
            alert("클립보드 복사에 실패했습니다.");
        });
};

const toggleTheme = () => {
    const body = document.body;
    const checkbox = document.getElementById('theme-switch-checkbox');
    const isDark = checkbox.checked;

    if (isDark) {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        localStorage.setItem('theme', 'light');
    }
};

const initTheme = () => {
    const saved = localStorage.getItem('theme') || 'light';
    const checkbox = document.getElementById('theme-switch-checkbox');

    if (saved === 'dark') {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
        checkbox.checked = true;
    } else {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        checkbox.checked = false;
    }
};

const setTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    dateInput.value = `${year}-${month}-${day}`;
};

exports.handler = async (event) => {
    return {
        statusCode: 200,
        body: "",
    };
};

document.addEventListener('DOMContentLoaded', () => {
    dateInput = document.getElementById("date");
    breakfastContainer = document.getElementById("breakfastMenu");
    lunchContainer = document.getElementById("lunchMenu");
    dinnerContainer = document.getElementById("dinnerMenu");
    breakfastCalEl = document.getElementById("breakfastCal");
    lunchCalEl = document.getElementById("lunchCal");
    dinnerCalEl = document.getElementById("dinnerCal");

    if (!dateInput || !breakfastContainer || !lunchContainer || !dinnerContainer) {
        console.error("필수 DOM 요소를 찾을 수 없습니다.");
        return;
    }

    if (!API_KEY) {
        console.warn("API 키가 설정되지 않았습니다. Netlify 환경 변수를 확인하세요.");
        breakfastContainer.textContent = "API 키가 설정되지 않았습니다.";
        lunchContainer.textContent = "관리자에게 문의하세요.";
        dinnerContainer.textContent = "";
    }

    initTheme();
    setTodayDate();

    dateInput.addEventListener("change", updateAllMenus);

    updateAllMenus();
});

window.shareMenu = shareMenu;
window.toggleTheme = toggleTheme;

const dateInput = document.getElementById("date");

const removeAllergyInfo = (text) => {
    if (!text) return text;
    return text.replace(/\s*\(\d+(\.\d+)*\)/g, '');
};

const fetchMenu = () => {
    const selectedDate = dateInput.value.split("-").join("");
    const schoolCode = "8000040";
    const breakfastContainer = document.getElementById("breakfastMenu");
    const lunchContainer = document.getElementById("lunchMenu");
    const dinnerContainer = document.getElementById("dinnerMenu");
    const breakfastCal = document.getElementById("breakfastCal");
    const lunchCal = document.getElementById("lunchCal");
    const dinnerCal = document.getElementById("dinnerCal");

    fetch(`https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=${process.env.API_KEY}&ATPT_OFCDC_SC_CODE=M10&SD_SCHUL_CODE=${schoolCode}&MLSV_YMD=${selectedDate}&MMEAL_SC_CODE=1`)
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const xml = parser.parseFromString(data, "text/xml");
            const menuElement = xml.querySelector("DDISH_NM");
            const rawMenu = menuElement ? menuElement.textContent : "선택한 날짜의 급식이 없습니다...";
            breakfastContainer.innerHTML = removeAllergyInfo(rawMenu);
            breakfastCal.textContent = xml.querySelector("CAL_INFO")?.textContent || "";
        })
        .catch(() => breakfastContainer.innerHTML = "An error occurred while fetching the menu.");

    fetch(`https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=${process.env.API_KEY}&ATPT_OFCDC_SC_CODE=M10&SD_SCHUL_CODE=${schoolCode}&MLSV_YMD=${selectedDate}&MMEAL_SC_CODE=2`)
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const xml = parser.parseFromString(data, "text/xml");
            const rawMenu = xml.querySelector("DDISH_NM")?.textContent || "선택한 날짜의 급식이 없습니다...";
            lunchContainer.innerHTML = removeAllergyInfo(rawMenu);
            lunchCal.textContent = xml.querySelector("CAL_INFO")?.textContent || "";
        })
        .catch(() => lunchContainer.innerHTML = "An error occurred while fetching the menu.");

    fetch(`https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=${process.env.API_KEY}&ATPT_OFCDC_SC_CODE=M10&SD_SCHUL_CODE=${schoolCode}&MLSV_YMD=${selectedDate}&MMEAL_SC_CODE=3`)
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const xml = parser.parseFromString(data, "text/xml");
            const rawMenu = xml.querySelector("DDISH_NM")?.textContent || "선택한 날짜의 급식이 없습니다...";
            dinnerContainer.innerHTML = removeAllergyInfo(rawMenu);
            dinnerCal.textContent = xml.querySelector("CAL_INFO")?.textContent || "";
        })
        .catch(() => dinnerContainer.innerHTML = "An error occurred while fetching the menu.");
};

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
        .then(() => alert("급식 정보가 클립보드에 복사되었습니다."));
};

const toggleTheme = () => {
    const body = document.body;
    const isDark = body.classList.contains('dark-theme');
    body.classList.toggle('dark-theme', !isDark);
    body.classList.toggle('light-theme', isDark);
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
};

const saved = localStorage.getItem('theme') || 'light';
document.body.classList.toggle('dark-theme', saved === 'dark');
document.body.classList.toggle('light-theme', saved === 'light');
document.getElementById('theme-switch-checkbox').checked = saved === 'dark';

const today = new Date();
dateInput.value = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
dateInput.addEventListener("change", fetchMenu);

fetchMenu();

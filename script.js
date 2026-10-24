const dateInput = document.getElementById("date");

const removeAllergyInfo = (text) => {
    if (!text) return text;
    return text.replace(/\s*\(\d+(\.\d+)*\)/g, '');
};

const nutritionToggle = document.getElementById("nutrition-switch-checkbox");

const toggleNutrition = () => {
    document.querySelectorAll(".nutrition-info").forEach(panel => {
        panel.hidden = !nutritionToggle.checked;
    });
};

const renderMenu = (container, rawMenu) => {
    const items = removeAllergyInfo(rawMenu).split(/<br\s*\/?\s*>/i).map(item => item.trim()).filter(Boolean);
    container.replaceChildren(...items.map(item => {
        const span = document.createElement("span");
        span.className = "menu-item";
        span.textContent = item;
        return span;
    }));
};

const updateNutrition = (meal, xml) => {
    const nutrients = xml.querySelector("NTR_INFO")?.textContent || "";
    document.getElementById(meal + "Nutrients").textContent = nutrients.replace(/<br\s*\/?\s*>/gi, "\n");
    document.getElementById(meal + "NutritionEmpty").hidden = Boolean(
        xml.querySelector("CAL_INFO")?.textContent || nutrients
    );
};

const fetchMenu = () => {
    ["breakfast", "lunch", "dinner"].forEach(meal => {
        document.getElementById(meal + "Cal").textContent = "";
        document.getElementById(meal + "Nutrients").textContent = "";
        document.getElementById(meal + "NutritionEmpty").hidden = false;
    });
    const selectedDate = dateInput.value.split("-").join("");
    const schoolCode = "8000040";
    const breakfastContainer = document.getElementById("breakfastMenu");
    const lunchContainer = document.getElementById("lunchMenu");
    const dinnerContainer = document.getElementById("dinnerMenu");
    const breakfastCal = document.getElementById("breakfastCal");
    const lunchCal = document.getElementById("lunchCal");
    const dinnerCal = document.getElementById("dinnerCal");

    fetch(`https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=48060c7a4fd14f30886424999d5fcba0&ATPT_OFCDC_SC_CODE=M10&SD_SCHUL_CODE=${schoolCode}&MLSV_YMD=${selectedDate}&MMEAL_SC_CODE=1`)
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const xml = parser.parseFromString(data, "text/xml");
            const menuElement = xml.querySelector("DDISH_NM");
            const rawMenu = menuElement ? menuElement.textContent : "선택한 날짜의 급식이 없습니다...";
            renderMenu(breakfastContainer, rawMenu);
            breakfastCal.textContent = xml.querySelector("CAL_INFO")?.textContent || "";
            updateNutrition("breakfast", xml);
        })
        .catch(() => renderMenu(breakfastContainer, "An error occurred while fetching the menu."));

    fetch(`https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=48060c7a4fd14f30886424999d5fcba0&ATPT_OFCDC_SC_CODE=M10&SD_SCHUL_CODE=${schoolCode}&MLSV_YMD=${selectedDate}&MMEAL_SC_CODE=2`)
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const xml = parser.parseFromString(data, "text/xml");
            const rawMenu = xml.querySelector("DDISH_NM")?.textContent || "선택한 날짜의 급식이 없습니다...";
            renderMenu(lunchContainer, rawMenu);
            lunchCal.textContent = xml.querySelector("CAL_INFO")?.textContent || "";
            updateNutrition("lunch", xml);
        })
        .catch(() => renderMenu(lunchContainer, "An error occurred while fetching the menu."));

    fetch(`https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=48060c7a4fd14f30886424999d5fcba0&ATPT_OFCDC_SC_CODE=M10&SD_SCHUL_CODE=${schoolCode}&MLSV_YMD=${selectedDate}&MMEAL_SC_CODE=3`)
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const xml = parser.parseFromString(data, "text/xml");
            const rawMenu = xml.querySelector("DDISH_NM")?.textContent || "선택한 날짜의 급식이 없습니다...";
            renderMenu(dinnerContainer, rawMenu);
            dinnerCal.textContent = xml.querySelector("CAL_INFO")?.textContent || "";
            updateNutrition("dinner", xml);
        })
        .catch(() => renderMenu(dinnerContainer, "An error occurred while fetching the menu."));
};

const shareMenu = async () => {
    const button = document.getElementById("copy-button");
    const status = document.getElementById("copy-status");
    const meals = [["breakfast", "조식"], ["lunch", "중식"], ["dinner", "석식"]];
    const sections = meals.map(([meal, title]) => {
        const menu = document.getElementById(meal + "Menu");
        const items = [...menu.querySelectorAll(".menu-item")];
        const menuText = items.length ? items.map(item => item.textContent).join("\n") : menu.innerText;
        const lines = [title, menuText];
        if (nutritionToggle.checked) {
            const calories = document.getElementById(meal + "Cal").textContent;
            const nutrients = document.getElementById(meal + "Nutrients").textContent;
            if (calories) lines.push("칼로리: " + calories);
            if (nutrients) lines.push(nutrients);
        }
        return lines.join("\n");
    });
    const sharedText = dateInput.value + " 단양고등학교 급식\n\n" + sections.join("\n\n");
    button.disabled = true;
    try {
        await navigator.clipboard.writeText(sharedText);
        button.textContent = "복사 완료";
        status.textContent = "급식 정보가 클립보드에 복사되었습니다.";
    } catch {
        button.textContent = "복사 실패";
        status.textContent = "복사하지 못했습니다. 브라우저의 클립보드 권한을 확인해 주세요.";
    } finally {
        button.disabled = false;
        setTimeout(() => { button.textContent = "급식 복사"; }, 2000);
    }
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

nutritionToggle.checked = false;
toggleNutrition();

const today = new Date();
dateInput.value = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
dateInput.addEventListener("change", fetchMenu);

fetchMenu();

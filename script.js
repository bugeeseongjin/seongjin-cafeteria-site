const dateInput = document.getElementById("date");
const dateTrigger = document.getElementById("date-trigger");
const dateDisplay = document.getElementById("date-display");
const nutritionToggle = document.getElementById("nutrition-switch-checkbox");
const themeToggle = document.getElementById("theme-switch-checkbox");
const copyButton = document.getElementById("copy-button");
const copyLabel = document.getElementById("copy-label");
const copyStatus = document.getElementById("copy-status");
const fetchStatus = document.getElementById("fetch-status");
const dateDialog = document.getElementById("date-dialog");
const calendarGrid = document.getElementById("calendar-grid");
const calendarMonthLabel = document.getElementById("calendar-month-label");
const calendarDirectDate = document.getElementById("calendar-direct-date");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const mealTypes = [["breakfast", "조식"], ["lunch", "중식"], ["dinner", "석식"]];
const mealData = Object.fromEntries(mealTypes.map(([meal]) => [meal, {
    phase: "loading",
    items: [],
    calories: "",
    nutrients: ""
}]));
const panelAnimations = new WeakMap();
let fetchSequence = 0;
let loadingMeals = true;
let copying = false;
let copyResetTimer;
let copyFeedbackButton = null;
let calendarYear;
let calendarMonth;
let calendarClosing = false;

const removeAllergyInfo = text => text.replace(/\s*\(\d+(?:\.\d+)*\.?\)/g, "");
const splitMenu = text => text.split(/<br\s*\/?\s*>/i).map(item => item.trim()).filter(Boolean);
const toDateValue = date => [
    String(date.getFullYear()).padStart(4, "0"),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
].join("-");

const parseDateValue = value => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return null;
    const [, year, month, day] = match.map(Number);
    if (year < 1 || year > 9999) return null;
    const date = new Date(0);
    date.setHours(0, 0, 0, 0);
    date.setFullYear(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
};

const animateElement = (element, frames, options = {}) => {
    if (reducedMotion.matches || !element.animate) return Promise.resolve();
    const animation = element.animate(frames, {
        duration: 280,
        easing: "cubic-bezier(.2,.75,.25,1)",
        fill: "backwards",
        ...options
    });
    return animation.finished.catch(() => {});
};

const updateCopyAvailability = () => {
    const hasMeals = mealTypes.some(([meal]) => mealData[meal].phase === "ready" && mealData[meal].items.length > 0);
    copyButton.disabled = loadingMeals || copying || !hasMeals;
    mealTypes.forEach(([meal, title]) => {
        const button = document.getElementById(meal + "Copy");
        const available = mealData[meal].phase === "ready" && mealData[meal].items.length > 0;
        button.disabled = loadingMeals || copying || !available;
        button.title = loadingMeals ? "급식을 불러오는 중입니다." : available ? title + "만 복사" : "급식이 없어 복사할 수 없습니다.";
    });
};

const readNutritionPreference = () => {
    try {
        return document.cookie.split(";").some(cookie => cookie.trim() === "nutrition_visibility=1");
    } catch {
        return false;
    }
};

const saveNutritionPreference = () => {
    try {
        document.cookie = "nutrition_visibility=" + (nutritionToggle.checked ? "1" : "0")
            + "; Max-Age=31536000; Path=/; SameSite=Lax"
            + (location.protocol === "https:" ? "; Secure" : "");
    } catch {}
};

const renderMeal = (meal, motion = true) => {
    const state = mealData[meal];
    const section = document.getElementById(meal + "Container");
    const menu = document.getElementById(meal + "Menu");
    const calories = document.getElementById(meal + "Cal");
    const nutrients = document.getElementById(meal + "Nutrients");
    const emptyNutrition = document.getElementById(meal + "NutritionEmpty");
    section.setAttribute("aria-busy", String(state.phase === "loading"));
    menu.replaceChildren();
    if (state.phase === "loading") {
        menu.classList.add("is-loading");
        for (let index = 0; index < 4; index++) {
            const line = document.createElement("span");
            line.className = "skeleton-line";
            line.setAttribute("aria-hidden", "true");
            menu.append(line);
        }
        calories.textContent = "칼로리 확인 중";
        nutrients.textContent = "";
        emptyNutrition.textContent = "영양정보를 불러오는 중입니다.";
        emptyNutrition.hidden = false;
        return;
    }
    menu.classList.remove("is-loading");
    const items = state.phase === "ready" ? state.items : [
        state.phase === "error" ? "급식 정보를 불러오지 못했습니다." : "선택한 날짜의 급식이 없습니다."
    ];
    items.forEach((item, index) => {
        const span = document.createElement("span");
        span.className = "menu-item";
        span.textContent = nutritionToggle.checked ? item : removeAllergyInfo(item);
        menu.append(span);
        if (motion) animateElement(span, [
            { opacity: 0, transform: "translateY(7px)" },
            { opacity: 1, transform: "translateY(0)" }
        ], { delay: Math.min(index * 28, 168) });
    });
    calories.textContent = state.calories ? "칼로리: " + state.calories : "칼로리 정보 없음";
    nutrients.textContent = state.nutrients;
    emptyNutrition.textContent = "등록된 영양성분 정보가 없습니다.";
    emptyNutrition.hidden = Boolean(state.nutrients);
    if (motion) animateElement(calories, [{ opacity: 0 }, { opacity: 1 }], { duration: 320 });
};

const setNutritionExpanded = async (panel, expanded, motion = true) => {
    const previous = panelAnimations.get(panel);
    const height = panel.hidden ? 0 : panel.getBoundingClientRect().height;
    const opacity = panel.hidden ? 0 : Number(getComputedStyle(panel).opacity);
    if (previous) previous.cancel();
    panelAnimations.delete(panel);
    if (!motion || reducedMotion.matches || !panel.animate) {
        panel.hidden = !expanded;
        return;
    }
    panel.hidden = false;
    const animation = panel.animate([
        { height: height + "px", opacity },
        { height: (expanded ? panel.scrollHeight : 0) + "px", opacity: expanded ? 1 : 0 }
    ], { duration: 320, easing: "cubic-bezier(.2,.75,.25,1)", fill: "both" });
    panelAnimations.set(panel, animation);
    try {
        await animation.finished;
    } catch {
        return;
    } finally {
        if (panelAnimations.get(panel) === animation) {
            panel.hidden = !expanded;
            panelAnimations.delete(panel);
            animation.cancel();
        }
    }
};

const toggleNutrition = (motion = true) => {
    mealTypes.forEach(([meal]) => {
        renderMeal(meal, motion);
        setNutritionExpanded(document.getElementById(meal + "Nutrition"), nutritionToggle.checked, motion);
    });
};

const fetchMenu = async () => {
    const sequence = ++fetchSequence;
    const selectedDate = dateInput.value.replaceAll("-", "");
    const schoolCode = "8000040";
    loadingMeals = true;
    updateCopyAvailability();
    fetchStatus.textContent = "급식 정보를 불러오고 있습니다.";
    mealTypes.forEach(([meal]) => {
        mealData[meal] = { phase: "loading", items: [], calories: "", nutrients: "" };
        renderMeal(meal, false);
    });
    await Promise.all(mealTypes.map(async ([meal], index) => {
        try {
            const response = await fetch("https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=48060c7a4fd14f30886424999d5fcba0&ATPT_OFCDC_SC_CODE=M10&SD_SCHUL_CODE=" + schoolCode + "&MLSV_YMD=" + selectedDate + "&MMEAL_SC_CODE=" + (index + 1));
            if (!response.ok) throw new Error("급식 조회 실패");
            const data = await response.text();
            if (sequence !== fetchSequence) return;
            const xml = new DOMParser().parseFromString(data, "text/xml");
            const rawMenu = xml.querySelector("DDISH_NM")?.textContent || "";
            const items = splitMenu(rawMenu);
            mealData[meal] = {
                phase: items.length ? "ready" : "empty",
                items,
                calories: xml.querySelector("CAL_INFO")?.textContent || "",
                nutrients: (xml.querySelector("NTR_INFO")?.textContent || "").replace(/<br\s*\/?\s*>/gi, "\n")
            };
        } catch {
            if (sequence !== fetchSequence) return;
            mealData[meal] = { phase: "error", items: [], calories: "", nutrients: "" };
        }
        if (sequence === fetchSequence) renderMeal(meal);
    }));
    if (sequence !== fetchSequence) return;
    loadingMeals = false;
    updateCopyAvailability();
    fetchStatus.textContent = mealTypes.some(([meal]) => mealData[meal].phase === "error")
        ? "일부 급식 정보를 불러오지 못했습니다."
        : "급식 정보를 불러왔습니다.";
};

const buildClipboardText = (selectedMeal = null) => {
    const selectedTypes = mealTypes.filter(([meal]) =>
        (!selectedMeal || meal === selectedMeal) && mealData[meal].phase === "ready" && mealData[meal].items.length > 0
    );
    if (selectedTypes.length === 0) return "";
    const sections = selectedTypes.map(([meal, title]) => {
        const state = mealData[meal];
        return [
            title,
            state.items.map(removeAllergyInfo).join("\n"),
            "칼로리: " + (state.calories || "정보 없음")
        ].join("\n");
    });
    return dateInput.value + " 단양고등학교 급식\n\n" + sections.join("\n\n")
        + "\n\n출처: https://seongjin-cafeteria-site.netlify.app/";
};

const resetCopyFeedback = () => {
    if (copyFeedbackButton) {
        copyFeedbackButton.dataset.state = "";
        const message = copyFeedbackButton.querySelector(".meal-copy-message");
        if (message) message.textContent = "";
    }
    copyLabel.textContent = "급식 복사";
    copyFeedbackButton = null;
};

const shareMenu = async (selectedMeal = null) => {
    if (loadingMeals || copying) return;
    const selectedType = selectedMeal ? mealTypes.find(([meal]) => meal === selectedMeal) : null;
    if (selectedMeal && (!selectedType || mealData[selectedMeal].phase !== "ready" || mealData[selectedMeal].items.length === 0)) return;
    const clipboardText = buildClipboardText(selectedMeal);
    if (!clipboardText) return;
    clearTimeout(copyResetTimer);
    resetCopyFeedback();
    const button = selectedMeal ? document.getElementById(selectedMeal + "Copy") : copyButton;
    const label = selectedMeal ? button.querySelector(".meal-copy-message") : copyLabel;
    copyFeedbackButton = button;
    copying = true;
    updateCopyAvailability();
    button.dataset.state = "copying";
    label.textContent = "복사 중";
    animateElement(button, [{ transform: "scale(.96)" }, { transform: "scale(1)" }], { duration: 180 });
    try {
        await navigator.clipboard.writeText(clipboardText);
        button.dataset.state = "success";
        label.textContent = "복사 완료";
        copyStatus.textContent = (selectedType ? selectedType[1] + " " : "") + "급식과 칼로리가 클립보드에 복사되었습니다.";
        animateElement(button, [
            { transform: "scale(1)" },
            { transform: "scale(1.05)", offset: 0.45 },
            { transform: "scale(1)" }
        ], { duration: 340 });
    } catch {
        button.dataset.state = "error";
        label.textContent = "복사 실패";
        copyStatus.textContent = "복사하지 못했습니다. 브라우저의 클립보드 권한을 확인해 주세요.";
        animateElement(button, [
            { transform: "translateX(0)" },
            { transform: "translateX(-3px)" },
            { transform: "translateX(3px)" },
            { transform: "translateX(0)" }
        ], { duration: 220 });
    } finally {
        copying = false;
        updateCopyAvailability();
        copyResetTimer = setTimeout(resetCopyFeedback, 2000);
    }
};

const toggleTheme = () => {
    const dark = themeToggle.checked;
    document.body.classList.toggle("dark-theme", dark);
    document.body.classList.toggle("light-theme", !dark);
    document.querySelector('meta[name="theme-color"]').content = dark ? "#202326" : "#ffffff";
    try {
        localStorage.setItem("theme", dark ? "dark" : "light");
    } catch {}
};

const renderCalendar = (focusValue = "") => {
    calendarMonthLabel.textContent = calendarYear + "년 " + (calendarMonth + 1) + "월";
    calendarGrid.replaceChildren();
    const first = parseDateValue(String(calendarYear).padStart(4, "0") + "-" + String(calendarMonth + 1).padStart(2, "0") + "-01");
    const last = new Date(first);
    last.setMonth(last.getMonth() + 1, 0);
    for (let day = 0; day < first.getDay(); day++) {
        const blank = document.createElement("span");
        blank.setAttribute("aria-hidden", "true");
        calendarGrid.append(blank);
    }
    const todayValue = toDateValue(new Date());
    for (let day = 1; day <= last.getDate(); day++) {
        const date = new Date(first);
        date.setDate(day);
        const value = toDateValue(date);
        const button = document.createElement("button");
        button.type = "button";
        button.className = "calendar-day";
        button.dataset.date = value;
        button.textContent = day;
        button.setAttribute("aria-label", calendarYear + "년 " + (calendarMonth + 1) + "월 " + day + "일");
        button.setAttribute("aria-pressed", String(value === dateInput.value));
        if (value === todayValue) button.setAttribute("aria-current", "date");
        button.tabIndex = value === (focusValue || dateInput.value) || (!focusValue && day === 1 && !dateInput.value.startsWith(value.slice(0, 7))) ? 0 : -1;
        button.addEventListener("click", () => selectDate(value));
        calendarGrid.append(button);
        if (value === focusValue) button.focus();
    }
};

const changeCalendarMonth = offset => {
    const date = parseDateValue(String(calendarYear).padStart(4, "0") + "-" + String(calendarMonth + 1).padStart(2, "0") + "-01");
    date.setMonth(date.getMonth() + offset);
    if (date.getFullYear() < 1 || date.getFullYear() > 9999) return;
    calendarYear = date.getFullYear();
    calendarMonth = date.getMonth();
    renderCalendar();
    animateElement(calendarGrid, [
        { opacity: 0, transform: "translateX(" + (offset > 0 ? 8 : -8) + "px)" },
        { opacity: 1, transform: "translateX(0)" }
    ], { duration: 200 });
};

const openCalendar = () => {
    if (dateDialog.open) return;
    const selected = parseDateValue(dateInput.value) || new Date();
    calendarYear = selected.getFullYear();
    calendarMonth = selected.getMonth();
    calendarDirectDate.value = dateInput.value;
    renderCalendar();
    dateDialog.showModal();
    animateElement(dateDialog, [
        { opacity: 0, transform: "translateY(12px) scale(.98)" },
        { opacity: 1, transform: "translateY(0) scale(1)" }
    ], { duration: 240 });
    calendarGrid.querySelector('[tabindex="0"]')?.focus();
};

const closeCalendar = async () => {
    if (!dateDialog.open || calendarClosing) return;
    calendarClosing = true;
    dateDialog.classList.add("is-closing");
    await animateElement(dateDialog, [
        { opacity: 1, transform: "translateY(0) scale(1)" },
        { opacity: 0, transform: "translateY(8px) scale(.98)" }
    ], { duration: 180 });
    dateDialog.close();
    dateDialog.classList.remove("is-closing");
    calendarClosing = false;
};

const selectDate = value => {
    const date = parseDateValue(value);
    if (!date) return;
    const changed = dateInput.value !== value;
    dateInput.value = value;
    dateDisplay.textContent = value.replaceAll("-", ". ");
    calendarDirectDate.value = value;
    closeCalendar();
    if (changed) fetchMenu();
};

calendarGrid.addEventListener("keydown", event => {
    const button = event.target.closest(".calendar-day");
    if (!button) return;
    const date = parseDateValue(button.dataset.date);
    const offsets = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (event.key in offsets) date.setDate(date.getDate() + offsets[event.key]);
    else if (event.key === "Home") date.setDate(date.getDate() - date.getDay());
    else if (event.key === "End") date.setDate(date.getDate() + 6 - date.getDay());
    else if (event.key === "PageUp" || event.key === "PageDown") {
        const day = date.getDate();
        date.setDate(1);
        date.setMonth(date.getMonth() + (event.key === "PageUp" ? -1 : 1));
        const last = new Date(date);
        last.setMonth(last.getMonth() + 1, 0);
        date.setDate(Math.min(day, last.getDate()));
    } else return;
    event.preventDefault();
    if (date.getFullYear() < 1 || date.getFullYear() > 9999) return;
    calendarYear = date.getFullYear();
    calendarMonth = date.getMonth();
    renderCalendar(toDateValue(date));
});

document.getElementById("calendar-direct-form").addEventListener("submit", event => {
    event.preventDefault();
    if (calendarDirectDate.reportValidity()) selectDate(calendarDirectDate.value);
});
document.getElementById("calendar-previous").addEventListener("click", () => changeCalendarMonth(-1));
document.getElementById("calendar-next").addEventListener("click", () => changeCalendarMonth(1));
document.getElementById("calendar-close").addEventListener("click", closeCalendar);
document.getElementById("calendar-today").addEventListener("click", () => selectDate(toDateValue(new Date())));
dateTrigger.addEventListener("click", openCalendar);
dateDialog.addEventListener("cancel", event => {
    event.preventDefault();
    closeCalendar();
});
dateDialog.addEventListener("click", event => {
    const rect = dateDialog.getBoundingClientRect();
    if (event.target === dateDialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) closeCalendar();
});
nutritionToggle.addEventListener("change", () => {
    saveNutritionPreference();
    toggleNutrition();
});
themeToggle.addEventListener("change", toggleTheme);
copyButton.addEventListener("click", () => shareMenu());
mealTypes.forEach(([meal]) => {
    document.getElementById(meal + "Copy").addEventListener("click", () => shareMenu(meal));
});

let savedTheme = "light";
try {
    savedTheme = localStorage.getItem("theme") || "light";
} catch {}
themeToggle.checked = savedTheme === "dark";
toggleTheme();
nutritionToggle.checked = readNutritionPreference();
toggleNutrition(false);
dateInput.value = toDateValue(new Date());
dateDisplay.textContent = dateInput.value.replaceAll("-", ". ");
dateInput.addEventListener("change", fetchMenu);
fetchMenu();

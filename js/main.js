const API_KEY = process.env.API_KEY;
const SCHOOL_CODE = 'G100000384';
const SCHOOL_TYPE = 'H';

let currentDate = new Date();

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

function formatDisplayDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[date.getDay()];
    return `${year}년 ${month}월 ${day}일 (${weekday})`;
}

function setTodayDate() {
    const today = new Date();
    document.getElementById('today-date').textContent = formatDisplayDate(today);
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

async function fetchMeal(dateStr) {
    try {
        const response = await fetch(`/.netlify/functions/main?date=${dateStr}&schoolCode=${SCHOOL_CODE}&schoolType=${SCHOOL_TYPE}`);
        
        if (!response.ok) {
            throw new Error('네트워크 응답이 올바르지 않습니다');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('급식 정보 조회 실패:', error);
        throw error;
    }
}

function parseMealData(xmlText) {
    if (!xmlText || xmlText.includes('해당하는 급식정보가 없습니다')) {
        return null;
    }
    
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    const meals = [];
    const mealTimes = ['조식', '중식', '석식'];
    
    mealTimes.forEach((time, index) => {
        const mealTag = xmlDoc.getElementsByTagName(`DD${index + 1}_TEXT`)[0];
        if (mealTag && mealTag.textContent && mealTag.textContent.trim() !== '') {
            const menu = mealTag.textContent
                .replace(/\n/g, '<br>')
                .replace(/<br>\s*<br>/g, '<br>');
            
            meals.push({
                time: time,
                menu: menu
            });
        }
    });
    
    return meals.length > 0 ? meals : null;
}

function displayMeal(meals, dateStr) {
    const contentDiv = document.getElementById('meal-content');
    const displayDate = formatDisplayDate(currentDate);
    
    if (!meals) {
        contentDiv.innerHTML = `
            <div class="no-meal">
                <p>${displayDate}는 급식이 없습니다.</p>
                <p style="margin-top: 10px; font-size: 0.9rem;">주말 또는 공휴일입니다.</p>
            </div>
        `;
        return;
    }
    
    let html = '<ul class="meal-list">';
    meals.forEach(meal => {
        html += `
            <li class="meal-item">
                <span class="meal-time">${meal.time}</span>
                <span class="meal-menu">${meal.menu}</span>
            </li>
        `;
    });
    html += '</ul>';
    
    contentDiv.innerHTML = html;
}

function displayError(message) {
    const contentDiv = document.getElementById('meal-content');
    contentDiv.innerHTML = `
        <div class="error">
            <p>${message}</p>
            <p style="margin-top: 10px; font-size: 0.9rem;">잠시 후 다시 시도해주세요.</p>
        </div>
    `;
}

async function loadMeal() {
    const contentDiv = document.getElementById('meal-content');
    contentDiv.innerHTML = '<div class="loading">급식 정보를 불러오는 중...</div>';
    
    const dateStr = formatDate(currentDate);
    
    try {
        const data = await fetchMeal(dateStr);
        
        if (data.success && data.mealData) {
            const meals = parseMealData(data.mealData);
            displayMeal(meals, dateStr);
        } else {
            displayMeal(null, dateStr);
        }
    } catch (error) {
        displayError('급식 정보를 불러오는데 실패했습니다.');
    }
}

function copyMealInfo() {
    const contentDiv = document.getElementById('meal-content');
    const textContent = contentDiv.innerText;
    
    if (textContent.includes('급식 정보를 불러오는 중') || textContent.includes('실패했습니다')) {
        alert('복사할 급식 정보가 없습니다.');
        return;
    }
    
    const displayDate = formatDisplayDate(currentDate);
    const copyText = `[${displayDate}]\n${textContent}`;
    
    navigator.clipboard.writeText(copyText)
        .then(() => {
            const copyBtn = document.getElementById('copy-btn');
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '완료!';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 1500);
        })
        .catch(err => {
            alert('복사에 실패했습니다.');
        });
}

function updateDateInput() {
    const dateInput = document.getElementById('date-input');
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    dateInput.value = `${year}-${month}-${day}`;
}

function initEventListeners() {
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    
    document.getElementById('copy-btn').addEventListener('click', copyMealInfo);
    
    document.getElementById('prev-day').addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() - 1);
        updateDateInput();
        loadMeal();
    });
    
    document.getElementById('next-day').addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() + 1);
        updateDateInput();
        loadMeal();
    });
    
    document.getElementById('today-btn').addEventListener('click', () => {
        currentDate = new Date();
        updateDateInput();
        loadMeal();
    });
    
    document.getElementById('date-input').addEventListener('change', (e) => {
        const selectedDate = new Date(e.target.value);
        if (!isNaN(selectedDate.getTime())) {
            currentDate = selectedDate;
            loadMeal();
        }
    });
}

function init() {
    setTodayDate();
    initTheme();
    updateDateInput();
    initEventListeners();
    loadMeal();
    
    setInterval(() => {
        const now = new Date();
        if (now.getHours() === 0 && now.getMinutes() === 0) {
            currentDate = new Date();
            updateDateInput();
            setTodayDate();
            loadMeal();
        }
    }, 60000);
}

document.addEventListener('DOMContentLoaded', init);

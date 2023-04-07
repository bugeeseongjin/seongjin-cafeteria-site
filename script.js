const date = new Date();
const year = date.getFullYear();
const month = date.getMonth() + 1;
const day = date.getDate();

const formattedDate = `${year}${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}`;

const submitBtn = document.getElementById('submit-btn');
submitBtn.addEventListener('click', () => {
  const schoolCode = document.getElementById('school-code').value;
  const apiUrl = `https://open.neis.go.kr/hub/mealServiceDietInfo?ATPT_OFCDC_SC_CODE=M10&SD_SCHUL_CODE=${schoolCode}&MLSV_YMD=${formattedDate}`;
  
  fetch(apiUrl)
    .then(response => response.text())
    .then(data => {
      const parser = new DOMParser();
      const xml = parser.parseFromString(data, 'application/xml');
      const mealInfo = xml.getElementsByTagName('DDISH_NM')[0].textContent.trim();
      
      const resultContainer = document.getElementById('result');
      resultContainer.innerHTML = `<p>${mealInfo}</p>`;
    })
    .catch(error => {
      const resultContainer = document.getElementById('result');
      resultContainer.innerHTML = `<p>${error.message}</p>`;
    });
});

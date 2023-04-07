function getMeal() {
	let date = document.getElementById("date").value;
	let url = `https://open.neis.go.kr/hub/mealServiceDietInfo?ATPT_OFCDC_SC_CODE=M10&SD_SCHUL_CODE=8111007&MLSV_YMD=${date}`;
	fetch(url)
	.then(response => response.text())
	.then(data => {
		parser = new DOMParser();
		xmlDoc = parser.parseFromString(data, "text/xml");
		let mealInfo = xmlDoc.getElementsByTagName("DDISH_NM")[0].childNodes[0].nodeValue;
		let mealCal = xmlDoc.getElementsByTagName("CAL_INFO")[0].childNodes[0].nodeValue;
		let mealNtr = xmlDoc.getElementsByTagName("NTR_INFO")[0].childNodes[0].nodeValue;
		let mealStr = `Menu: ${mealInfo}<br>Calories: ${mealCal}<br>Nutrition Info: ${mealNtr}`;
		document.getElementById("meal").innerHTML = mealStr;
	})
	.catch(error => {
		console.error('Error:', error);
		document.getElementById("meal").innerHTML = "Error retrieving meal information";
	});
}

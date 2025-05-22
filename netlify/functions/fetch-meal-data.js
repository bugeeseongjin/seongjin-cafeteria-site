const fetch = require('node-fetch');
const xml2js = require('xml2js');

exports.handler = async (event, context) => {
  const { date, schoolCode, mealType } = event.queryStringParameters;
  const apiKey = process.env.NEIS_API_KEY;

  if (!date || !schoolCode || !mealType) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required query parameters: date, schoolCode, mealType' }),
    };
  }

  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API key (NEIS_API_KEY) is not configured.' }),
    };
  }

  const apiUrl = `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=${apiKey}&Type=xml&ATPT_OFCDC_SC_CODE=J10&SD_SCHUL_CODE=${schoolCode}&MLSV_YMD=${date}&MMEAL_SC_CODE=${mealType}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `NEIS API request failed: ${response.statusText}` }),
      };
    }

    const xmlData = await response.text();
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xmlData);

    let menuText = "급식 정보가 없습니다.";
    let calText = "";

    if (result.mealServiceDietInfo && result.mealServiceDietInfo.row && result.mealServiceDietInfo.row.length > 0) {
      const mealData = result.mealServiceDietInfo.row[0];
      if (mealData.DDISH_NM && mealData.DDISH_NM[0]) {
        // Replace <br/> tags with newlines for better readability
        menuText = mealData.DDISH_NM[0].replace(/<br\s*\/?>/gi, '\n');
      }
      if (mealData.CAL_INFO && mealData.CAL_INFO[0]) {
        calText = mealData.CAL_INFO[0];
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ menuText, calText }),
    };

  } catch (error) {
    console.error('Error fetching or parsing meal data:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch or parse meal data.', details: error.message }),
    };
  }
};

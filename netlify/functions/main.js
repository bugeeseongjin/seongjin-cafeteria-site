exports.handler = async (event) => {
    const { date, schoolCode, schoolType } = event.queryStringParameters;
    
    if (!date || !schoolCode || !schoolType) {
        return {
            statusCode: 400,
            body: JSON.stringify({ success: false, error: '필수 파라미터가 없습니다.' })
        };
    }
    
    const API_KEY = process.env.API_KEY;
    
    if (!API_KEY) {
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, error: 'API 키가 설정되지 않았습니다.' })
        };
    }
    
    const url = `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=${API_KEY}&TYPE=json&ATPS_CODE=11&SCHOOL_CODE=${schoolCode}&FROM_DATE=${date}&TO_DATE=${date}`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`NEIS API 요청 실패: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.mealServiceDietInfo && data.mealServiceDietInfo[1] && data.mealServiceDietInfo[1].row) {
            const mealData = data.mealServiceDietInfo[1].row[0];
            return {
                statusCode: 200,
                body: JSON.stringify({
                    success: true,
                    mealData: mealData
                })
            };
        } else {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    success: true,
                    mealData: null
                })
            };
        }
    } catch (error) {
        console.error('Error fetching meal data:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                error: '급식 정보를 불러오는데 실패했습니다.'
            })
        };
    }
};

const BASE_URL = "https://api.weatherapi.com/v1/future.json";
const API_KEY = "7d271b8045354eed93e74150251203";

async function fetchWeatherData(city, month) {
  if (!city || !month) {
    console.error("City or month is missing.");
    return null;
  }

  const formattedMonth = String(month).padStart(2, '0');
  const date = `2025-${formattedMonth}-10`;

  try {
    const response = await fetch(`${BASE_URL}?key=${API_KEY}&q=${city}&dt=${date}`);
    if (!response.ok) {
      throw new Error("Failed to fetch weather data");
    }
    const data = await response.json();
    const forecast = data.forecast?.forecastday?.[0]?.day;

    if (!forecast) {
      console.error("Weather data not available.");
      return null;
    }

    return {
      avgTemp: forecast.avgtemp_c,
      avgPrecip: forecast.totalprecip_mm,
      stithi: `पुढील अंदाजित तापमान ${forecast.avgtemp_c}°C आणि पर्जन्यमान ${forecast.totalprecip_mm} मिमी असेल.`
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
}

export default fetchWeatherData;

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./WeatherForecast.css";
import Navbar from './shared/Navbar';

const WeatherForecast = ({currentLang}) => {
  const [city, setCity] = useState("सांगली");
  const [selectedMonth, setSelectedMonth] = useState("2025-03");
  const [weatherData, setWeatherData] = useState([]);
  const [bestSowingDate, setBestSowingDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cityFileMap = {
    "सांगली": "weather_data_sangli.json",
    "पुणे": "weather_data_pune.json",
    "कोल्हापूर": "weather_data_kolhapur.json"
  };

  const translations = {
    en: {
      title: "Weather Forecast",
      subtitle: "Please select a city and month",
      loading: "Loading...",
      noData: "No data available for this month.",
      bestSowingDay: "There will be higher precipitation",
      warning: "Warning",
      notSafe: "Sowing is not safe this month.",
      cityPlaceholder: "Select City",
      monthPlaceholder: "Select Month",
    },
    hi: {
      title: "हवामान अंदाज",
      subtitle: "कृपया शहर और महीना चुनें",
      loading: "लोड हो रहा है...",
      noData: "इस महीने के लिए डेटा उपलब्ध नहीं है।",
      bestSowingDay: "इस काल में अधिक वर्षा होगी।",
      warning: "चेतावनी",
      notSafe: "इस महीने में बारिश की संभावना कम है ",
      cityPlaceholder: "शहर चुनें",
      monthPlaceholder: "महीना चुनें",
    },
    mr: {
      title: "हवामान अंदाज",
      subtitle: "कृपया शहर आणि महिना निवडा",
      loading: "लोड करत आहे...",
      noData: "या महिन्यातील डेटा उपलब्ध नाही.",
      bestSowingDay: "या काळात अधिक पाऊस पडेल",
      warning: "सावधान",
      notSafe: "या महिन्यात पावसाची शक्यता कमी आहे",
      cityPlaceholder: "शहर निवडा",
      monthPlaceholder: "महिना निवडा",
    },
    te: {
      title: "వాతావరణ సూచన",
      subtitle: "దయచేసి నగరం మరియు నెలను ఎంచుకోండి",
      loading: "లోడ్ అవుతోంది...",
      noData: "ఈ నెలకు డేటా అందుబాటులో లేదు.",
      bestSowingDay: "విత్తనం కోసం ఉత్తమమైన రోజు",
      warning: "హెచ్చరిక",
      notSafe: "ఈ నెలలో విత్తనం సురక్షితం కాదు.",
      cityPlaceholder: "నగరం ఎంచుకోండి",
      monthPlaceholder: "నెల ఎంచుకోండి",
    },
    pa: {
      title: "ਮੌਸਮ ਦੀ ਪੇਸ਼ਗੋਈ",
      subtitle: "ਕਿਰਪਾ ਕਰਕੇ ਸ਼ਹਿਰ ਅਤੇ ਮਹੀਨਾ ਚੁਣੋ",
      loading: "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...",
      noData: "ਇਸ ਮਹੀਨੇ ਲਈ ਡੇਟਾ ਉਪਲਬਧ ਨਹੀਂ ਹੈ।",
      bestSowingDay: "ਬੀਜਣ ਲਈ ਸਭ ਤੋਂ ਵਧੀਆ ਦਿਨ",
      warning: "ਚੇਤਾਵਨੀ",
      notSafe: "ਇਸ ਮਹੀਨੇ ਬੀਜਣਾ ਸੁਰੱਖਿਅਤ ਨਹੀਂ ਹੈ।",
      cityPlaceholder: "ਸ਼ਹਿਰ ਚੁਣੋ",
      monthPlaceholder: "ਮਹੀਨਾ ਚੁਣੋ",
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        
        const fileName = cityFileMap[city];
        if (!fileName) throw new Error("अवैध शहर निवड");

        
        const response = await fetch(`${process.env.PUBLIC_URL}/${fileName}`);
        
        if (!response.ok) {
          throw new Error(`HTTP त्रुटी: ${response.status} - ${await response.text()}`);
        }
        const rawData = await response.text();
        let data;
        try {
          data = JSON.parse(rawData);
        } catch (e) {
          throw new Error(`JSON पार्स त्रुटी: ${e.message}`);
        }

        if (!data || !Array.isArray(data)) {
          throw new Error("JSON मध्ये 'weather_data' अॅरे आढळला नाही");
        }

        data.forEach((entry, index) => {
          if (!entry.time || typeof entry.time !== "string") {
            throw new Error(`अवैध time फील्ड @ index ${index}`);
          }

          
          if (
            typeof entry["precipitation_sum_member01 (mm)"] === "undefined" ||
            typeof entry["precipitation_sum_member02 (mm)"] === "undefined" ||
            typeof entry["precipitation_sum_member03 (mm)"] === "undefined" ||
            typeof entry["precipitation_sum_member04 (mm)"] === "undefined"
          ) {
            throw new Error(`अपूर्ण precipitation डेटा @ index ${index}`);
          }
        });

        
        const filteredData = data
          .filter(item => item.time.startsWith(selectedMonth))
          .sort((a, b) => new Date(a.time) - new Date(b.time));

        setWeatherData(filteredData);
        setBestSowingDate(findBestSowingDay(filteredData));

      } catch (err) {
        console.error("त्रुटी:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [city, selectedMonth]);

  const findBestSowingDay = (data) => {
    const requiredDays = 5;
    if (data.length < requiredDays) return null;

    for (let i = 0; i <= data.length - requiredDays; i++) {
      let valid = true;
      for (let j = 0; j < requiredDays; j++) {
        const day = data[i + j];
        const totalPrecip = 
          day["precipitation_sum_member01 (mm)"] +
          day["precipitation_sum_member02 (mm)"] +
          day["precipitation_sum_member03 (mm)"] +
          day["precipitation_sum_member04 (mm)"];
        
        if (totalPrecip < 10) {
          valid = false;
          break;
        }
      }
      if (valid) return data[i].time;
    }
    return null;
  };

  const formatDate = (dateString) => {
    const options = { 
      day: "numeric", 
      month: "long", 
      year: "numeric", 
      timeZone: "Asia/Kolkata" 
    };
    return new Date(dateString).toLocaleDateString("mr-IN", options);
  };


  return (
    <>
      <Navbar currentLang={currentLang} />
  
      <div className="weather-container">
        <div className="weather-header">
          <h1 className="weather-title">{translations[currentLang]?.title}</h1>
          <p className="weather-p">{translations[currentLang]?.subtitle}</p>
        </div>
  
        <div className="weather-search-filters">
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="dropdown"
          >
            <option value="" disabled>
              {translations[currentLang]?.cityPlaceholder}
            </option>
            {Object.entries(cityFileMap).map(([cityName, fileName]) => (
              <option key={fileName} value={cityName}>
                {cityName}
              </option>
            ))}
          </select>
          <br />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="dropdown"
          >
            <option value="" disabled>
              {translations[currentLang]?.monthPlaceholder}
            </option>
            <option value="2025-03">मार्च 2025</option>
            <option value="2025-04">एप्रिल 2025</option>
            <option value="2025-05">मे 2025</option>
            <option value="2025-06">जून 2025</option>
          </select>
        </div>
  
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>{translations[currentLang]?.loading}</p>
          </div>
        ) : error ? (
          <div className="error-card">
            <p>त्रुटी: {error}</p>
          </div>
        ) : (
          <div className="weather-grid">
            <div className="weather-card">
              {weatherData.length === 0 ? (
                <p className="no-data">{translations[currentLang]?.noData}</p>
              ) : bestSowingDate ? (
                <div className="result-content">
                  <h3>{translations[currentLang]?.bestSowingDay}</h3>
                  <p className="success-message">
                    {formatDate(bestSowingDate)}
                  </p>
                </div>
              ) : (
                <div className="result-content">
                  <h3>{translations[currentLang]?.warning}</h3>
                  <p className="warning-message">
                    {translations[currentLang]?.notSafe}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default WeatherForecast;

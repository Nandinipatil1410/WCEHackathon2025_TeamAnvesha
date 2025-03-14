import React, { useState, useEffect } from "react";
import "./WeatherForecast.css";

const WeatherForecast = () => {
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 1. फाइल नाव तपासा
        const fileName = cityFileMap[city];
        if (!fileName) throw new Error("अवैध शहर निवड");

        // 2. डेटा मिळवा
        const response = await fetch(`${process.env.PUBLIC_URL}/${fileName}`);
        
        // 3. HTTP एरर तपासा
        if (!response.ok) {
          throw new Error(`HTTP त्रुटी: ${response.status} - ${await response.text()}`);
        }

        // 4. JSON पार्स करा
        const rawData = await response.text();
        let data;
        try {
          data = JSON.parse(rawData);
        } catch (e) {
          throw new Error(`JSON पार्स त्रुटी: ${e.message}`);
        }

        // 5. डेटा संरचना तपासा
        if (!data || !Array.isArray(data)) {
          throw new Error("JSON मध्ये 'weather_data' अॅरे आढळला नाही");
        }

        // 6. प्रत्येक एंट्री तपासा
        data.forEach((entry, index) => {
          if (!entry.time || typeof entry.time !== "string") {
            throw new Error(`अवैध time फील्ड @ index ${index}`);
          }

          // Check the correct field names with '(mm)' suffix
          if (
            typeof entry["precipitation_sum_member01 (mm)"] === "undefined" ||
            typeof entry["precipitation_sum_member02 (mm)"] === "undefined" ||
            typeof entry["precipitation_sum_member03 (mm)"] === "undefined" ||
            typeof entry["precipitation_sum_member04 (mm)"] === "undefined"
          ) {
            throw new Error(`अपूर्ण precipitation डेटा @ index ${index}`);
          }
        });

        // 7. डेटा प्रक्रिया
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
    <div className="weather-container">
      <div className="navbar">
        <div className="navbar-left">
          <span className="navbar-title">AgriSeva</span>
        </div>
      </div>
      
      <h2>हवामान अंदाज</h2>
      <h3>कृपया शहर आणि महिना निवडा</h3>

      <div className="selectors">
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="dropdown"
        >
          {Object.entries(cityFileMap).map(([cityName, fileName]) => (
            <option key={fileName} value={cityName}>{cityName}</option>
          ))}
        </select>

        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="dropdown"
        >
          <option value="2025-03">मार्च 2025</option>
          <option value="2025-04">एप्रिल 2025</option>
          <option value="2025-05">मे 2025</option>
          <option value="2025-06">जून 2025</option>
        </select>
      </div>

      {loading ? (
        <p className="loading-text">लोड करत आहे...</p>
      ) : error ? (
        <div className="error-message">
          <p>त्रुटी: {error}</p>
          <small>फाइल संरचना तपासा:</small>
          <pre>
            {"Data is not fetched"}
          </pre>
        </div>
      ) : (
        <div className="weather-card">
          {weatherData.length === 0 ? (
            <p>या महिन्यातील डेटा उपलब्ध नाही.</p>
          ) : bestSowingDate ? (
            <p className="success-message">
              पेरणी सुरु करण्याचा उत्तम दिवस: {formatDate(bestSowingDate)}
            </p>
          ) : (
            <p className="warning-message">
              या महिन्यात सलग 5 दिवस 10 mm पेक्षा जास्त पाऊस नसल्यामुळे पेरणी सुरक्षित नाही.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default WeatherForecast;


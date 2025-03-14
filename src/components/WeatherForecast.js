import React, { useState, useEffect } from "react";
import fetchWeatherData from "./Weather";
import "./WeatherForecast.css";

const WeatherForecast = () => {
  const [city, setCity] = useState("सांगली");
  const [weather, setWeather] = useState(null);
  const [language, setLanguage] = useState("mr");

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchWeatherData(city);
      setWeather(data);
    };
    fetchData();
  }, [city]);

  return (
    <div className="weather-container">
      <div className="navbar">
        <div className="navbar-left">
          <span className="navbar-title">AgriSeva</span>
        </div>
        <div className="navbar-right">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="language-dropdown"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="mr">मराठी</option>
          </select>
        </div>
      </div>
      <h2>हवामान अंदाज</h2>
      <h3>कृपया तुमचे शहर निवडा</h3>
      <select value={city} onChange={(e) => setCity(e.target.value)} className="dropdown">
        <option value="Sangli">Sangli</option>
        <option value="Pune">Pune</option>
        <option value="Mumbai">Mumbai</option>
      </select>
      {weather && (
        <div className="weather-card">
          <p>{weather.stithi}</p>
        </div>
      )}
    </div>
  );
};

export default WeatherForecast;

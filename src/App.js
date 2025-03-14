import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link ,Navigate} from 'react-router-dom';
import './App.css';

import axios from "axios";
import ChatbotPage from './components/Chatbot';
import GovtSchemes from './components/GovermentSchemes';
import PestDetection from './components/PestDetect';

import Weather from './components/WeatherForecast'
import WeatherForecast from './components/WeatherForecast';
// SVG Components
const PlantLogo = () => (
  <svg viewBox="0 0 24 24" width="100%" height="100%" fill="#2c5f2d">
    <path d="M12,3C10.89,3 10,3.89 10,5V7H14V5C14,3.89 13.11,3 12,3Z" />
  </svg>
);

const WeatherIcon = () => (
  <svg viewBox="0 0 24 24" width="100%" height="100%" fill="#2c5f2d">
    <path d="M6,19A5,5 0 0,1 1,14A5,5 0 0,1 6,9C7,6.65 9.3,5 12,5C15.43,5 18.24,7.66 18.5,11.03L19,11A4,4 0 0,1 23,15A4,4 0 0,1 19,19H6Z" />
  </svg>
);

const CropIcon = () => (
  <svg viewBox="0 0 24 24" width="100%" height="100%" fill="#2c5f2d">
    <path d="M15,4V6H18V4H15M14,8V10H17V8H14M13,12V14H16V12H13M12,16V18H15V16H12Z" />
  </svg>
);

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी' },
  { code: 'mr', name: 'मराठी' },
  { code: 'te', name: 'తెలుగు' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ' }
];

function HomePage({ currentLang, setCurrentLang }) {
  return (
    <div className="home-container">
      <nav className="nav-bar">
        <div className="logo">AgriSeva</div>
        <select value={currentLang} onChange={(e) => setCurrentLang(e.target.value)} className="language-select">
          {languages.map(lang => (
            <option key={lang.code} value={lang.code}>{lang.name}</option>
          ))}
        </select>
      </nav>
      <div className="main-content">
        <div className="plant-avatar">
          <Link to="/chatbot">
            <div className="avatar-image">
              <PlantLogo />
            </div>
          </Link>
          <p>नमस्कार! मी तुमचा कृषी सहाय्यक</p>
        </div>
        <div className="features-grid">
          <Link to="/weather" className="feature-card">
            <div className="feature-icon">
              <WeatherIcon />
            </div>
            <span>हवामान अंदाज</span>
          </Link>
          <Link to="/crops" className="feature-card">
            <div className="feature-icon">
              <CropIcon />
            </div>
            <span>पीक शिफारस</span>
          </Link>
          <Link to="/schemes" className="feature-card">
            <div className="feature-icon">
              <PlantLogo />
            </div>
            <span>शासकिय योजना </span>
          </Link>
          <Link to="/pestdetect" className="feature-card">
            <div className="feature-icon">
              <PlantLogo />
            </div>
            <span>कीड तपासा  </span>
          </Link>
        </div>
      </div>
    </div>
  );
}


function App() {
  const [currentLang, setCurrentLang] = useState('mr');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  return (
    <Router>
      <Routes>
        {/* If user is logged in, redirect them to the home page */}
        
        {/* Login route */}
        {/* <Route path="/login" element={<LoginPage IsLoggedIn={setIsLoggedIn}  />} />
        <Route path="/" element={isLoggedIn ? <HomePage currentLang={currentLang} setCurrentLang={setCurrentLang} /> : <Navigate to="/login" />} /> */}

        <Route path="/" element={<HomePage currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
        <Route path="/chatbot" element={<ChatbotPage />} />
        <Route path="/schemes" element={<GovtSchemes />} />
        <Route path="/pestdetect" element={<PestDetection />} />
        <Route path="/weather" element={<WeatherForecast />} />
      </Routes>
    </Router>
  );
}
export default App;
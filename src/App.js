import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link ,Navigate} from 'react-router-dom';
import './App.css';
import chatbotImg from "./assets/plant-logo.png";
import weatherImg from "./assets/weather-logo.png";
import cropsImg from "./assets/crop.jpg";
import schemesImg from "./assets/schemes.png";
import pestImg from "./assets/detect.png";

import ChatbotPage from './components/Chatbot';
import GovtSchemes from './components/GovermentSchemes';
import PestDetect from './components/PestDetect';
import WeatherForecast from './components/WeatherForecast';
import CropPredictor from './components/CropPredictor'



const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी' },
  { code: 'mr', name: 'मराठी' },
  { code: 'te', name: 'తెలుగు' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ' }
];

function HomePage({ currentLang, setCurrentLang }) {
  const translations = {
    en: {
      greeting: "Hello! I am your Agriculture Assistant",
      weather: "Weather Forecast",
      crops: "Crop Recommendation",
      schemes: "Government Schemes",
      pestDetection: "Pest Detection",
    },
    hi: {
      greeting: "नमस्ते! मैं आपका कृषि सहायक हूँ",
      weather: "मौसम पूर्वानुमान",
      crops: "फसल सिफारिश",
      schemes: "सरकारी योजनाएँ",
      pestDetection: "कीट पहचान",
    },
    mr: {
      greeting: "नमस्कार! मी तुमचा कृषी सहाय्यक",
      weather: "हवामान अंदाज",
      crops: "पीक शिफारस",
      schemes: "शासकिय योजना",
      pestDetection: "कीड तपासा",
    },
    te: {
      greeting: "హలో! నేను మీ వ్యవసాయ సహాయకుడు",
      weather: "వాతావరణ సూచన",
      crops: "పంట సిఫార్సు",
      schemes: "ప్రభుత్వ పథకాలు",
      pestDetection: "కీటకాల గుర్తింపు",
    },
    pa: {
      greeting: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ ਖੇਤੀ ਮਦਦਗਾਰ ਹਾਂ",
      weather: "ਮੌਸਮ ਦੀ ਪੇਸ਼ਗੋਈ",
      crops: "ਫ਼ਸਲ ਦੀ ਸਿਫਾਰਸ਼",
      schemes: "ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ",
      pestDetection: "ਕੀੜੇ ਦੀ ਪਛਾਣ",
    },
  };

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
            <img src={chatbotImg} alt="Chatbot" className="feature-image" />
            </div>
          </Link>
          <p className="greeting-text">{translations[currentLang]?.greeting || translations["en"].greeting}</p>
        </div>
        <div className="features-grid">
          <Link to="/weather" className="feature-card">
            <div className="feature-icon">
            <img src={weatherImg} alt="Weather" className="feature-image" />
            </div>
            <span>{translations[currentLang]?.weather || translations["en"].weather}</span>
          </Link>
          <Link to="/crop-predict" className="feature-card">
            <div className="feature-icon">
            <img src={cropsImg} alt="Crops" className="feature-image" />
            </div>
            <span>{translations[currentLang]?.crops || translations["en"].crops}</span>
          </Link>
          <Link to="/schemes" className="feature-card">
            <div className="feature-icon">
            <img src={schemesImg} alt="Schemes" className="feature-image" />
            </div>
            <span>{translations[currentLang]?.schemes || translations["en"].schemes}</span>
          </Link>
          <Link to="/pestdetect" className="feature-card">
            <div className="feature-icon">
            <img src={pestImg} alt="Pest Detection" className="feature-image" />
            </div>
            <span>{translations[currentLang]?.pestDetection || translations["en"].pestDetection}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}



function App() {
  const [currentLang, setCurrentLang] = useState('mr');

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
        <Route path="/chatbot" element={<ChatbotPage />} />
        <Route path="/schemes" element={<GovtSchemes currentLang={currentLang}/> } />
        <Route path="/pestdetect" element={<PestDetect currentLang={currentLang} />} />
        <Route path="/weather" element={<WeatherForecast />} />
        
<Route path="/crop-predict" element={<CropPredictor />} />
      </Routes>
    </Router>
  );
}
export default App;
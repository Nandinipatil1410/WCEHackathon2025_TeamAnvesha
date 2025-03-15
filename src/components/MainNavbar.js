import React from 'react';
import { Link } from 'react-router-dom';
import './MainNavbar.css';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी' },
  { code: 'mr', name: 'मराठी' },
  { code: 'te', name: 'తెలుగు' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ' }
];

function MainNavbar({ currentLang, setCurrentLang }) {
  return (
    <nav className="main-navbar">
      <Link to="/" className="main-brand">AgriSeva</Link>
      <select 
        value={currentLang} 
        onChange={(e) => setCurrentLang(e.target.value)} 
        className="main-language-select"
      >
        {languages.map(lang => (
          <option key={lang.code} value={lang.code}>{lang.name}</option>
        ))}
      </select>
    </nav>
  );
}

export default MainNavbar; 
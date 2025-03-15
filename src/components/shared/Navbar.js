import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react'; // Import icons for hamburger menu
import './Navbar.css';

const Navbar = ({ currentLang, setCurrentLang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [translatedTexts, setTranslatedTexts] = useState({});
  const navRef = useRef(null);

  // Translation Function
  const translateText = async (text, targetLang) => {
    try {
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
      );
      const data = await response.json();
      return data[0].map((item) => item[0]).join('');
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text in case of error
    }
  };

  useEffect(() => {
    const translateNavbar = async () => {
      const texts = {
        home: 'Home',
        pestDetect: 'Pest Detection',
        weather: 'Weather',
        schemes: 'Schemes',
        cropPredict: 'Crop Predictor',
        chatbot: 'Chat Bot',
        brand: 'AgriSeva'
      };

      const translatedData = {};
      for (const key in texts) {
        translatedData[key] = await translateText(texts[key], currentLang);
      }

      setTranslatedTexts(translatedData);
    };

    translateNavbar();
  }, [currentLang]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => {
    console.log('Toggle menu clicked, current state:', isOpen);
    setIsOpen(!isOpen);
  };

  return (
    <nav className="shared-navbar" ref={navRef}>
      <Link to="/" className="nav-brand">{"AgriSeva"}</Link>

      {/* Hamburger menu button */}
      <button 
        className="hamburger" 
        onClick={toggleMenu}
        aria-label="Toggle navigation menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Navigation links */}
      <div className={`nav-links ${isOpen ? 'active' : ''}`}>
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} onClick={toggleMenu}>
          {translatedTexts.home}
        </Link>
        <Link to="/pestdetect" className={`nav-link ${location.pathname === '/pest-detect' ? 'active' : ''}`} onClick={toggleMenu}>
          {translatedTexts.pestDetect}
        </Link>
        <Link to="/weather" className={`nav-link ${location.pathname === '/weather' ? 'active' : ''}`} onClick={toggleMenu}>
          {translatedTexts.weather}
        </Link>
        <Link to="/schemes" className={`nav-link ${location.pathname === '/schemes' ? 'active' : ''}`} onClick={toggleMenu}>
          {translatedTexts.schemes}
        </Link>
        <Link to="/crop-predict" className={`nav-link ${location.pathname === '/crop-predictor' ? 'active' : ''}`} onClick={toggleMenu}>
          {translatedTexts.cropPredict}
        </Link>
        <Link to="/chatbot" className={`nav-link ${location.pathname === '/chatbot' ? 'active' : ''}`} onClick={toggleMenu}>
          {translatedTexts.chatbot}
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;

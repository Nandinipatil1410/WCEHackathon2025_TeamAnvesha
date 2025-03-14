import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as tf from '@tensorflow/tfjs';
import './CropPredictor.css';

const CropPredictor = () => {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedSoil, setSelectedSoil] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const soilTypes = [
    'Neutral (Loamy)',
    'Alkaline (Clayey)',
    'Acidic (Sandy)'
  ];

  const monthToNumber = {
    'January': 0, 'February': 1, 'March': 2, 'April': 3,
    'May': 4, 'June': 5, 'July': 6, 'August': 7,
    'September': 8, 'October': 9, 'November': 10, 'December': 11,
    'All Year': 12
  };

  const soilTypeToNumber = {
    'Neutral (Loamy)': 0,
    'Alkaline (Clayey)': 1,
    'Acidic (Sandy)': 2
  };

  const numberToCrop = [
    'Rice', 'Maize', 'Chickpea', 'Kidneybeans', 'Pigeonpeas',
    'Mothbeans', 'Mungbean', 'Blackgram', 'Lentil', 'Pomegranate',
    'Banana', 'Mango', 'Grapes', 'Watermelon', 'Muskmelon',
    'Apple', 'Orange', 'Papaya', 'Coconut', 'Cotton', 'Jute', 'Coffee'
  ];

  useEffect(() => {
    loadModel();
  }, []);

  const loadModel = async () => {
    try {
      const loadedModel = await tf.loadLayersModel('/model/model.json');
      setModel(loadedModel);
    } catch (error) {
      console.error('Error loading model:', error);
    }
  };

  const handlePredict = async () => {
    if (!model || !selectedMonth || !selectedSoil) return;

    setLoading(true);
    try {
      const input = tf.tensor2d([[
        monthToNumber[selectedMonth],
        soilTypeToNumber[selectedSoil]
      ]]);

      const prediction = model.predict(input);
      const predictedCropIndex = prediction.argMax(1).dataSync()[0];
      setPrediction(numberToCrop[predictedCropIndex]);
    } catch (error) {
      console.error('Prediction error:', error);
    }
    setLoading(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-brand">AgriSeva</div>
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/pest-detect" className="nav-link">Pest Detection</Link>
          <Link to="/schemes" className="nav-link">Schemes</Link>
          <Link to="/chatbot" className="nav-link">Chat Bot</Link>
        </div>
      </nav>

      <div className="container">
        <div className="header">
          <h1>पीक शिफारस</h1>
          <p>कृपया महिना आणि माती प्रकार निवडा</p>
        </div>

        <div className="prediction-form">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="dropdown"
          >
            <option value="">महिना निवडा</option>
            {months.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>

          <select
            value={selectedSoil}
            onChange={(e) => setSelectedSoil(e.target.value)}
            className="dropdown"
          >
            <option value="">माती प्रकार निवडा</option>
            {soilTypes.map(soil => (
              <option key={soil} value={soil}>{soil}</option>
            ))}
          </select>

          <button 
            onClick={handlePredict}
            disabled={!selectedMonth || !selectedSoil || loading}
            className="predict-button"
          >
            शिफारस मिळवा
          </button>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>विश्लेषण करत आहे...</p>
          </div>
        ) : prediction && (
          <div className="result-card">
            <h3>शिफारस केलेले पीक</h3>
            <p className="prediction">{prediction}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default CropPredictor;

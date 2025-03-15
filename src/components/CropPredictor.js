import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as tf from '@tensorflow/tfjs';
import './CropPredictor.css';
import Navbar from './shared/Navbar';

const translateText = async (text, targetLang) => {
  try {
    console.log(`Translating text: "${text}" to language: ${targetLang}`);
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
    );
    const data = await response.json();
    const translated = data[0].map((item) => item[0]).join("");
    console.log(`Translated text: "${translated}"`);
    return translated;
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
};

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

const CropPredictor = ({ currentLang }) => {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedSoil, setSelectedSoil] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState(null);
  const [translatedText, setTranslatedText] = useState({});
  const [translatedMonths, setTranslatedMonths] = useState([]);
  const [translatedSoilTypes, setTranslatedSoilTypes] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef(null);

  const texts = {
    title: "Crop Recommendation",
    selectMonth: "Select Month",
    selectSoil: "Select Soil Type",
    getRecommendation: "Get Recommendation",
    analyzing: "Analyzing...",
    recommendedCrop: "Recommended Crop"
  };

  useEffect(() => {
    console.log("Loading model...");
    loadModel();
    translateAllText();
  }, [currentLang]);

  const loadModel = async () => {
    try {
      console.log('Attempting to load model...');
      const loadedModel = await tf.loadLayersModel('/model/model.json');
      console.log('Model loaded successfully');
      setModel(loadedModel);
    } catch (error) {
      console.error('Error loading model:', error);
    }
  };

  const translateAllText = async () => {
    console.log("Translating all texts...");
    const newTranslations = {};

    for (const key in texts) {
      console.log(`Translating text for ${key}`);
      newTranslations[key] = await translateText(texts[key], currentLang);
    }

    console.log("Translating months...");
    const translatedMonths = await Promise.all(months.map(month => translateText(month, currentLang)));
    console.log("Translating soil types...");
    const translatedSoilTypes = await Promise.all(soilTypes.map(soil => translateText(soil, currentLang)));

    setTranslatedText(newTranslations);
    setTranslatedMonths(translatedMonths);
    setTranslatedSoilTypes(translatedSoilTypes);
  };

  const handlePredict = async () => {
    if (!model || !selectedMonth || !selectedSoil) {
      console.log("Model or input data is missing.");
      return;
    }

    console.log("Making prediction...");
    setLoading(true);
    try {
      const input = tf.tensor2d([[monthToNumber[selectedMonth], soilTypeToNumber[selectedSoil]]]);
      console.log(`Input data: [${monthToNumber[selectedMonth]}, ${soilTypeToNumber[selectedSoil]}]`);
      const prediction = model.predict(input);
      const predictedCropIndex = prediction.argMax(1).dataSync()[0];
      console.log(`Predicted crop index: ${predictedCropIndex}`);
      const predictedCrop = numberToCrop[predictedCropIndex];

      const translatedCrop = await translateText(predictedCrop, currentLang);
      setPrediction(translatedCrop);
      console.log(`Predicted crop: ${translatedCrop}`);
    } catch (error) {
      console.error('Prediction error:', error);
    }
    setLoading(false);
  };

  const speakText = async (text, lang) => {
    try {
      console.log(`Speaking text: "${text}" in language: ${lang}`);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
        setIsSpeaking(false);
        return;
      }

      const voiceId = lang === "en" ? "arman" : "diya";
      const response = await fetch("https://waves-api.smallest.ai/api/v1/lightning/get_speech", {
        method: "POST",
        headers: {
          Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2QxY2QxZDE5MTUxNTkzMzFlYzUyM2IiLCJpYXQiOjE3NDE4MDMzNjh9.TGDZPo6btvAk2Z1DaNIK0TKUJ5ZgqL5vFLp9zt2cygI",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ voice_id: voiceId, text, speed: 1, sample_rate: 24000, add_wav_header: true }),
      });

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
      audioRef.current = audio;
      setIsSpeaking(true);

      audio.addEventListener("ended", () => {
        setIsSpeaking(false);
        audioRef.current = null;
      });
    } catch (error) {
      console.error("Speech error:", error);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
        setIsSpeaking(false);
        return;
      }
    };
  }, []);


  return (
    <>
      <Navbar currentLang={currentLang} />
      <div className="container">
        <div className="header">
          <h1>{translatedText.title || texts.title}</h1>
          <p>{translatedText.selectMonth || texts.selectMonth} & {translatedText.selectSoil || texts.selectSoil}</p>
        </div>

        <div className="prediction-form">
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="dropdown">
            <option value="">{translatedText.selectMonth || texts.selectMonth}</option>
            {translatedMonths.map((month, index) => (
              <option key={months[index]} value={months[index]}>{month}</option>
            ))}
          </select>

          <select value={selectedSoil} onChange={(e) => setSelectedSoil(e.target.value)} className="dropdown">
            <option value="">{translatedText.selectSoil || texts.selectSoil}</option>
            {translatedSoilTypes.map((soil, index) => (
              <option key={soilTypes[index]} value={soilTypes[index]}>{soil}</option>
            ))}
          </select>

          <button onClick={handlePredict} disabled={!selectedMonth || !selectedSoil || loading} className="predict-button">
            {translatedText.getRecommendation || texts.getRecommendation}
          </button>
        </div>

        {prediction && (
          <div className="result-card">
            <h3>{translatedText.recommendedCrop || texts.recommendedCrop}</h3>
            <p className="prediction">{prediction}</p>
            <button onClick={() => speakText(prediction, currentLang)} className="speak-button">
              🔊 {translatedText.listen || texts.listen}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CropPredictor;

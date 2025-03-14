import React, { useState, useEffect, useRef } from "react";
import * as tmImage from "@teachablemachine/image";
import "./PestDetect.css";
import newImage from './new.png'
const URL = "/my_model/";

const PestDetection = ({ currentLang }) => {
  const [selectedLanguage, setSelectedLanguage] = useState(currentLang || "mr");
  const [image, setImage] = useState(null);
  const [result, setResult] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [translatedResult, setTranslatedResult] = useState("");
  const [translatedRecommendation, setTranslatedRecommendation] = useState("");

  const modelRef = useRef(null);
  const maxPredictionsRef = useRef(null);

  const recommendations = {
    "Maize Healthy": "No action needed, maintain a regular fertilizer schedule with balanced NPK (Nitrogen, Phosphorus, Potassium).",
    "Maize Leaf Blight": "For control, use Copper-based fungicides to prevent fungal spread.",
    "Maize Streak Virus": "Use resistant maize varieties if available. Apply fungicides to control symptoms.",
    "Maize Common Rust": "Apply Sulfur or Mancozeb-based fungicides. Ensure a balanced nitrogen application for healthy maize.",
    "Potato Healthy": "Continue with a balanced fertilizer application, ensuring good nitrogen, phosphorus, and potassium levels.",
    "Potato Early Blight": "Use fungicides like Chlorothalonil to control blight. Ensure proper nitrogen levels.",
    "Potato Late Blight": "Control late blight with Ridomil Gold or Mancozeb-based fungicides. Add potassium-rich fertilizers.",
    "Grape Healthy": "Maintain regular fertilizer application with balanced NPK.",
    "Grape Black Rot": "Use Sulfur-based fungicides for control. Maintain proper nitrogen levels.",
    "Grape Esca (Black Measles)": "Apply fungicides regularly. Use resistant grape varieties if available.",
    "Grape Leaf Blight (Isariopsis Leaf Spot)": "Use Copper-based fungicides to control the disease.",
    "Tomato Healthy": "Ensure balanced fertilizer use, with equal ratios of Nitrogen, Phosphorus, and Potassium.",
    "Tomato Leaf Blight": "Use Copper or Mancozeb fungicides to control leaf blight.",
    "Tomato Leaf Curl": "Use insecticidal soap or neem oil to control insects.",
    "Tomato Septoria Leaf Spot": "Apply Copper fungicides to prevent the spread.",
    "Tomato Verticillium Wilt": "Use resistant tomato varieties to prevent wilt.",
  };

  useEffect(() => {
    loadModel();
  }, []);

  useEffect(() => {
    setSelectedLanguage(currentLang);
  }, [currentLang]);

  useEffect(() => {
    if (result) translateText(result, setTranslatedResult);
    if (recommendation) translateText(recommendation, setTranslatedRecommendation);
  }, [result, recommendation, currentLang]);

  const loadModel = async () => {
    try {
      const modelURL = `${URL}model.json`;
      const metadataURL = `${URL}metadata.json`;

      modelRef.current = await tmImage.load(modelURL, metadataURL);
      maxPredictionsRef.current = modelRef.current.getTotalClasses();
    } catch (error) {
      console.error("Model loading error:", error);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      setImage(reader.result);
      if (modelRef.current) {
        await predict(reader.result);
      }
    };
  };

  const predict = async (imageSrc) => {
    try {
      const img = new Image();
      img.src = imageSrc;
      img.onload = async () => {
        const prediction = await modelRef.current.predict(img);
        const highestProb = prediction.reduce((prev, curr) =>
          curr.probability > prev.probability ? curr : prev
        );

        const detectedDisease = highestProb.className.trim();
        const detectedResult = `${detectedDisease}: ${highestProb.probability.toFixed(2)}`;

        setResult(detectedResult);
        setRecommendation(recommendations[detectedDisease] || "No recommendation available.");
      };
    } catch (error) {
      console.error("Prediction error:", error);
    }
  };
  const translations = {
    en: {
      title: "Pest Detection",
      description: "Select an image to detect plant diseases.",
      resultLabel: "Detected Disease",
      recommendationLabel: "Recommendation",
      readResult: "🔊 Read Result",
      readRecommendation: "📢 Read Recommendation",
    },
    hi: {
      title: "कीट पहचान",
      description: "पौधों की बीमारियों का पता लगाने के लिए एक छवि चुनें।",
      resultLabel: "पहचानी गई बीमारी",
      recommendationLabel: "सिफारिश",
      readResult: "🔊 परिणाम पढ़ें",
      readRecommendation: "📢 सिफारिश पढ़ें",
    },
    mr: {
      title: "कीटक शोध",
      description: "वनस्पतींच्या रोगांचे निदान करण्यासाठी प्रतिमा निवडा.",
      resultLabel: "ओळखलेला रोग",
      recommendationLabel: "शिफारस",
      readResult: "🔊 निकाल वाचा",
      readRecommendation: "📢 शिफारस वाचा",
    }
  }
  const speakText = async (text, lang) => {
    try {
      const cleanedText = text.replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
        .replace(/#{1,6}\s*(.*?)\n?/g, "$1")
        .replace(/\n+/g, " ");

      const voiceId = lang === "en" ? "arman" : "diya";  // Ensure correct voice selection
      const maxTextLength = 200;
      const textChunks = cleanedText.match(new RegExp(`.{1,${maxTextLength}}(\\s|$)`, "g")) || [];

      for (const chunk of textChunks) {
        const response = await fetch("https://waves-api.smallest.ai/api/v1/lightning/get_speech", {
          method: "POST",
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2QxY2QxZDE5MTUxNTkzMzFlYzUyM2IiLCJpYXQiOjE3NDE4MDMzNjh9.TGDZPo6btvAk2Z1DaNIK0TKUJ5ZgqL5vFLp9zt2cygI`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            voice_id: voiceId,
            text: chunk.trim(),
            speed: 1,
            sample_rate: 24000,
            format: "wav",
            add_wav_header: true
          }),
        });

        if (!response.ok) {
          throw new Error(`TTS API Error ${response.status}`);
        }

        const audioBlob = await response.blob();
        const audioUrl = window.URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        await new Promise(resolve => {
          audio.onended = resolve;
          audio.play();
        });
      }
    } catch (error) {
      console.error("Speech error:", error);
    }
  };
  const translateText = async (text, setTranslation) => {
    try {
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${selectedLanguage}&dt=t&q=${encodeURIComponent(text)}`
      );
      const data = await response.json();
      setTranslation(data[0].map(item => item[0]).join(" "));
    } catch (error) {
      console.error("Translation error:", error);
      setTranslation(text);
    }
  };
  return (
    <div className="pest-container">
      <h2>{translations[selectedLanguage].title}</h2>

      {/* Custom File Upload UI */}
      <div className="upload-container ">

        <div className="pest-navbar">
          <h2>AgriSeva</h2>
        </div>
        <input type="file" onChange={handleImageChange} accept="image/*" />
        <img
          src={image || newImage}
          alt="Upload"
          className="upload-image"
          />
      </div>

      {translatedResult && (
        <p className="result">
          {translations[selectedLanguage].resultLabel}: {translatedResult}
        </p>
      )}
      {translatedRecommendation && (
        <p className="recommendation">
          {translations[selectedLanguage].recommendationLabel}: {translatedRecommendation}
        </p>
      )}
       <button onClick={() => speakText(translatedResult, selectedLanguage)}>
        {translations[selectedLanguage].readResult}
      </button>
      <button onClick={() => speakText(translatedRecommendation, selectedLanguage)}>
        {translations[selectedLanguage].readRecommendation}
      </button>
    </div>
  );
};

export default PestDetection;

import React, { useState, useEffect } from "react";
import * as tmImage from "@teachablemachine/image";
import "./PestDetect.css";
import newImage from "./new.png";
const PestDetection = () => {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [model, setModel] = useState(null);
  const URL = "/my_model/"; // Path to your Teachable Machine model

  useEffect(() => {
    const loadModel = async () => {
      const modelURL = URL + "model.json";
      const metadataURL = URL + "metadata.json";
      const loadedModel = await tmImage.load(modelURL, metadataURL);
      setModel(loadedModel);
    };
    loadModel();
  }, []);

  const recommendations = {
    "Maize Healthy": "No action needed, maintain a regular fertilizer schedule with balanced NPK (Nitrogen, Phosphorus, Potassium). For organic options, use compost or well-rotted manure to improve soil health.",
    "Maize Leaf Blight": "For control, use Copper-based fungicides to prevent fungal spread. Apply a balanced NPK fertilizer to support plant growth. Organic option: Neem oil spray for natural pest control and use compost for soil enrichment.",
    "Maize Streak Virus": "Use resistant maize varieties if available. Apply fungicides to control symptoms. Fertilize with a balanced fertilizer rich in Phosphorus to boost root growth. Organic option: Apply organic seaweed-based fertilizer to increase plant immunity.",
    "Maize Common Rust": "Apply Sulfur or Mancozeb-based fungicides. Ensure a balanced nitrogen application for healthy maize. Organic option: Use organic compost or organic manure to boost nitrogen in the soil naturally.",
    "Potato Healthy": "Continue with a balanced fertilizer application, ensuring good nitrogen, phosphorus, and potassium levels. Organic option: Use compost and organic manure to improve soil health and plant vigor.",
    "Potato Early Blight": "Use fungicides like Chlorothalonil to control blight. Ensure proper nitrogen levels with a balanced fertilizer. Organic option: Apply compost tea or seaweed extract to promote plant health and boost resistance.",
    "Potato Late Blight": "Control late blight with Ridomil Gold or Mancozeb-based fungicides. Add potassium-rich fertilizers to improve disease resistance. Organic option: Apply organic potassium-based fertilizers like wood ash or kelp meal.",
    "Grape Healthy": "Maintain regular fertilizer application with balanced NPK. Organic option: Use compost and organic matter to feed the plants naturally and improve soil structure.",
    "Grape Black Rot": "Use Sulfur-based fungicides for control. Maintain proper nitrogen levels. Organic option: Apply neem oil or garlic spray for natural fungal control and compost for soil nourishment.",
    "Grape Esca (Black Measles)": "Apply fungicides regularly. Use resistant grape varieties if available. Organic option: Organic grapevine management can include regular pruning and using organic fungicides like Bordeaux mixture.",
    "Grape Leaf Blight (Isariopsis Leaf Spot)": "Use Copper-based fungicides to control the disease. Regularly fertilize with balanced nutrients. Organic option: Use compost or well-rotted manure to support healthy vine growth and organic fungicide applications.",
    "Tomato Healthy": "Ensure balanced fertilizer use, with equal ratios of Nitrogen, Phosphorus, and Potassium. Organic option: Compost and organic fertilizers like worm castings can provide all essential nutrients.",
    "Tomato Leaf Blight": "Use Copper or Mancozeb fungicides to control leaf blight. Fertilize with a balanced fertilizer, especially one rich in Phosphorus to improve root strength. Organic option: Apply organic compost, neem oil spray, and use organic fungicides like Bacillus subtilis.",
    "Tomato Leaf Curl": "Use insecticidal soap or neem oil to control insects. Fertilize with a balanced fertilizer, ensuring nitrogen is adequate for healthy leaf growth. Organic option: Organic pest control using garlic spray or neem oil, and compost for nourishment.",
    "Tomato Septoria Leaf Spot": "Apply Copper fungicides to prevent the spread. Maintain good air circulation and ensure regular fertilizer with balanced NPK. Organic option: Use compost tea and organic copper-based fungicides.",
    "Tomato Verticillium Wilt": "Use resistant tomato varieties to prevent wilt. Apply potassium-rich fertilizers to boost plant health. Organic option: Use organic matter like compost or well-rotted manure, and apply organic fungicides like neem oil.",
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      setImage(reader.result);
      if (model) {
        predict(reader.result);
      }
    };
  };

  const predict = async (imageSrc) => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = async () => {
      if (!model) return;
      const prediction = await model.predict(img);
      const highestProb = prediction.reduce((prev, curr) =>
        curr.probability > prev.probability ? curr : prev
      );

      const detectedPest = highestProb.className.split(":")[0].trim();
      setResult(`${detectedPest}: ${highestProb.probability.toFixed(2)}`);
      setRecommendation(recommendations[detectedPest] || "No recommendation available.");
    };
  };

  return (
    <div className="container">
      <h2>कीटक तपासा</h2>
      <p>कृपया पिकाचा फोटो अपलोड करा, म्हणजे AI कीटक शोधू शकेल.</p>

      {/* Custom File Upload UI */}
      <div className="upload-container ">
        <input type="file" onChange={handleImageChange} accept="image/*" />
        <img
          src={image || newImage}
          alt="Upload"
          className="upload-image"
        />
        <div className=" overlay-text">📷 क्लिक करा</div>
      </div>

      {result && <p className="result">ओळखलेले रोग: {result}</p>}
      {recommendation && <p className="recommendation">💡 खताची शिफारस: {recommendation}</p>}
    </div>
  );
};

export default PestDetection;

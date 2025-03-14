import { useState, useEffect } from "react";
import { Search, Volume2 } from "lucide-react";
import "./GovtSchemes.css";

const schemes = [
  {
    id: 1,
    title: "प्रधानमंत्री पीक विमा योजना",
    status: "सक्रिय योजना",
    date: "10/01/2025 पासून सुरू",
    state: "महाराष्ट्र",
    details: "ही योजना नैसर्गिक आपत्तीमुळे पीक नष्ट झाल्यास शेतकऱ्यांना विमा संरक्षण आणि आर्थिक सहाय्य प्रदान करते.",
    eligibility: ["आधार कार्ड", "बँक खाते तपशील", "जमिनीचे मालकी हक्क दस्तऐवज"],
    applicationLink: "https://pmfby.gov.in",
  },
  {
    id: 2,
    title: "प्रधानमंत्री किसान सन्मान निधी",
    status: "सक्रिय योजना",
    date: "12/01/2025 पासून सुरू",
    state: "कर्नाटक",
    details: "पीएम-किसान योजना शेतकऱ्यांना दरवर्षी ₹6,000 आर्थिक मदत देते, जी दर 2,000 रुपयांच्या तीन हप्त्यांमध्ये दिली जाते.",
    eligibility: ["आधार कार्ड", "बँक खाते तपशील", "जमिनीचा मालकीचा पुरावा"],
    applicationLink: "https://pmkisan.gov.in",
  },
  {
    "id": 3,
    "title": "प्रधानमंत्री कृषी सिंचन योजना",
    "status": "लवकरच कालबाह्य होणार",
    "date": "अंतिम तारीख - १५ जानेवारी",
    "state": "पंजाब",
    "details": "शेतीतील उत्पादकता सुधारण्यासाठी आणि जलसंसाधनांचा प्रभावी वापर सुनिश्चित करण्यासाठी ही योजना आहे.",
    "eligibility": ["आधार कार्ड", "जमीन मालकी कागदपत्रे"],
    "applicationLink": "https://pmksy.gov.in"
  },
  {
    "id": 4,
    "title": "नॅशनल अ‍ॅग्रिकल्चर मार्केट (eNAM)",
    "status": "लवकरच कालबाह्य होणार",
    "date": "अंतिम तारीख - १५ जानेवारी",
    "state": "महाराष्ट्र",
    "details": "कृषी उत्पादनांसाठी अखिल भारतीय इलेक्ट्रॉनिक व्यापार पोर्टल.",
    "eligibility": ["आधार कार्ड", "शेतकरी नोंदणी प्रमाणपत्र"],
    "applicationLink": "https://enam.gov.in"
  }
];

export default function GovtSchemes() {
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [translatedSchemes, setTranslatedSchemes] = useState(schemes);
  const [selectedLanguage, setSelectedLanguage] = useState("mr");

  const languageCodes = {
    en: "English",
    hi: "Hindi",
    mr: "Marathi",
  };

  useEffect(() => {
    const translateSchemes = async () => {
      if (selectedLanguage === "mr") {
        setTranslatedSchemes(schemes);
        return;
      }

      const translatedData = await Promise.all(
        schemes.map(async (scheme) => {
          const translatedTitle = await translateText(scheme.title, selectedLanguage);
          const translatedStatus = await translateText(scheme.status, selectedLanguage);
          const translatedDate = await translateText(scheme.date, selectedLanguage);
          const translatedDetails = await translateText(scheme.details, selectedLanguage);
          const translatedState = await translateText(scheme.state, selectedLanguage);
          return {
            ...scheme,
            title: translatedTitle,
            status: translatedStatus,
            date: translatedDate,
            state: translatedState,
            details: translatedDetails,
          };
        })
      );
      setTranslatedSchemes(translatedData);
    };

    translateSchemes();
  }, [selectedLanguage]);

  const translateText = async (text, targetLang) => {
    try {
      const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=mr&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`);
      const data = await response.json();
      return data[0].map((item) => item[0]).join("");
    } catch (error) {
      console.error("Translation error:", error);
      return text;
    }
  };

  const speakText = async (text, lang) => {
    try {
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
    } catch (error) {
      console.error("Speech error:", error);
    }
  };

  return (
    <div className="container">
      {!selectedScheme ? (
        <div>
          <h2 className="title">सरकारी योजना शोधा</h2>
          <div className="search-container">
            <input
              type="text"
              placeholder="योजना शोधा"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="search-icon" />
          </div>
          <select onChange={(e) => setSelectedState(e.target.value)}>
            <option value="">राज्य निवडा</option>
            <option value="महाराष्ट्र">महाराष्ट्र</option>
            <option value="कर्नाटक">कर्नाटक</option>
          </select>

          <select onChange={(e) => setSelectedLanguage(e.target.value)} value={selectedLanguage}>
            {Object.entries(languageCodes).map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>

          {translatedSchemes.map((scheme) => (
            <div key={scheme.id} className="card">
              <h3>{scheme.title}</h3>
              <p className="status">{scheme.status}</p>
              <p className="date">{scheme.date}</p>
              <p className="state">{scheme.state}</p>
              <p>{scheme.details}</p>

              <button onClick={() => speakText(scheme.details, selectedLanguage)}>
                <Volume2 size={18} />
              </button>

              <button onClick={() => { setSelectedScheme(scheme); }}>
                तपशील पहा
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <button onClick={() => setSelectedScheme(null)} className="back-button">
            ← मागे जा
          </button>
          <h2 className="title">{selectedScheme.title}</h2>
          <p>{selectedScheme.details}</p>

          <button onClick={() => speakText(selectedScheme.details, selectedLanguage)}>
            🔊 वाचा
          </button>

          <a href={selectedScheme.applicationLink} target="_blank" rel="noopener noreferrer">
            <button className="apply-button">आता अर्ज करा</button>
          </a>
        </div>
      )}
    </div>
  );
}

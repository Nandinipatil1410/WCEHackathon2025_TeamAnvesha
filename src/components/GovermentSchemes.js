import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import "./GovernmentSchemes.css";
import Navbar from './shared/Navbar';


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
    id: 3,
    title: "प्रधानमंत्री कृषी सिंचन योजना",
    status: "लवकरच कालबाह्य होणार",
    date: "अंतिम तारीख - १५ जानेवारी",
    state: "पंजाब",
    details: "शेतीतील उत्पादकता सुधारण्यासाठी आणि जलसंसाधनांचा प्रभावी वापर सुनिश्चित करण्यासाठी ही योजना आहे.",
    eligibility: ["आधार कार्ड", "जमीन मालकी कागदपत्रे"],
    applicationLink: "https://pmksy.gov.in"
  },
  {
    id: 4,
    title: "नॅशनल अ‍ॅग्रिकल्चर मार्केट (eNAM)",
    status: "लवकरच कालबाह्य होणार",
    date: "अंतिम तारीख - १५ जानेवारी",
    state: "महाराष्ट्र",
    details: "कृषी उत्पादनांसाठी अखिल भारतीय इलेक्ट्रॉनिक व्यापार पोर्टल.",
    eligibility: ["आधार कार्ड", "शेतकरी नोंदणी प्रमाणपत्र"],
    applicationLink: "https://enam.gov.in"
  },
  {
    id: 5,
    title: "पंजाब मंडी बोर्ड ई-लिस्टींग",
    status: "सक्रिय योजना",
    date: "अंतिम तारीख - ३१ डिसेंबर",
    state: "पंजाब",
    details: "कृषी उत्पादनांसाठी ऑनलाइन व्यापार आणि लिलाव सुविधा",
    eligibility: ["आधार कार्ड", "शेतकरी नोंदणी प्रमाणपत्र"],
    applicationLink: "https://mandiboard.punjab.gov.in"
  },
  {
    id: 6,
    title: "गुजरात कृषी विपणन ऑनलाइन सेवा",
    status: "सक्रिय योजना",
    date: "अंतिम तारीख - ३१ मार्च ",
    state: "गुजरात",
    details: "शेतकऱ्यांसाठी ऑनलाइन बाजार आणि व्यापार सुविधा",
    eligibility: ["आधार कार्ड", "शेतकरी नोंदणी प्रमाणपत्र"],
    applicationLink: "https://agri.gujarat.gov.in"
  },
  {
    id: 7,
    title: "केरळ कृषी विपणन ई-प्लॅटफॉर्म",
    status: "सक्रिय योजना",
    date: "अंतिम तारीख - ३० जून",
    state: "केरळ",
    details: "कृषी उत्पादनांसाठी ऑनलाइन व्यापार आणि विपणन सुविधा",
    eligibility: ["आधार कार्ड", "शेतकरी नोंदणी प्रमाणपत्र"],
    applicationLink: "https://keralaagriculture.gov.in"
  },
  {
    id: 8,
    title: "महाराष्ट्र कृषी उद्योग विकास योजना",
    status: "सक्रिय योजना",
    date: "31/03/2024 पासून सुरू",
    state: "महाराष्ट्र",
    details: "शेतकऱ्यांना कृषी-व्यवसाय सुरू करण्यासाठी आर्थिक सहाय्य आणि मार्गदर्शन.",
    eligibility: ["आधार कार्ड", "व्यवसाय योजना", "जमीन दस्तऐवज"],
    applicationLink: "https://agribusiness.maharashtra.gov.in",
  },
  {
    id: 9,
    title: "गुजरात सौर ऊर्जा कृषी योजना",
    status: "सक्रिय योजना",
    date: "चालू आहे",
    state: "गुजरात",
    details: "शेतीसाठी सौर ऊर्जा प्रकल्प उभारणीसाठी अनुदान आणि तांत्रिक सहाय्य.",
    eligibility: ["आधार कार्ड", "वीज बिल", "7/12 उतारा"],
    applicationLink: "https://geda.gujarat.gov.in",
  },
  {
    id: 10,
    title: "कर्नाटक रैतर संजीवनी",
    status: "सक्रिय योजना",
    date: "वार्षिक योजना",
    state: "कर्नाटक",
    details: "शेतकऱ्यांसाठी आरोग्य विमा आणि अपघात विमा संरक्षण योजना.",
    eligibility: ["आधार कार्ड", "शेतकरी ओळखपत्र"],
    applicationLink: "https://raithasanjivini.karnataka.gov.in",
  },
  {
    id: 11,
    title: "केरळ नारळ विकास योजना",
    status: "सक्रिय योजना",
    date: "चालू आहे",
    state: "केरळ",
    details: "नारळ शेतीसाठी विशेष प्रोत्साहन आणि तांत्रिक मार्गदर्शन.",
    eligibility: ["आधार कार्ड", "जमीन दस्तऐवज"],
    applicationLink: "https://coconutboard.kerala.gov.in",
  }
];





export default function GovtSchemes({ currentLang }) {

  const [selectedScheme, setSelectedScheme] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("");

  const [translatedSchemes, setTranslatedSchemes] = useState([]);
  const [translatedStates, setTranslatedStates] = useState([]);
  const [translatedUI, setTranslatedUI] = useState({
    title: "Government Schemes",
    description: "Find and apply for agricultural schemes.",
    searchPlaceholder: "Search schemes...",
    selectState: "Select State",
    backButton: "Back",
    eligibilityTitle: "Eligibility Criteria",
    applyNow: "Apply Now",
    viewDetails: "View Details",
    listenButton: "🔊 Listen" // Add this key
  });


  useEffect(() => {
    const translateUI = async () => {
      const uiKeys = {
        title: "शासकीय योजना",
        description: "कृषी योजनांसाठी शोधा आणि अर्ज करा.",
        searchPlaceholder: "योजना शोधा...",
        selectState: "राज्य निवडा",
        backButton: "मागे",
        eligibilityTitle: "पात्रता निकष",
        applyNow: "आता अर्ज करा",
        viewDetails: "तपशील पहा",
        listenButton: "🔊 ऐका"  // Translate Listen button
      };



      console.log("Translating UI text:", uiKeys);

      const translations = await Promise.all(
        Object.entries(uiKeys).map(async ([key, value]) => {
          const translatedText = await translateText(value, currentLang);
          console.log(`Translated ${key}: ${translatedText}`); // Debug log
          return [key, translatedText];
        })
      );

      setTranslatedUI(Object.fromEntries(translations));
      console.log("Updated translated UI:", Object.fromEntries(translations)); // Debug log
    };

    translateUI();
  }, [currentLang]);


  useEffect(() => {
    const translateSchemes = async () => {
      if (currentLang === "mr") {
        setTranslatedSchemes(schemes);
        return;
      }

      if (!schemes.length) return; // Ensure schemes exist

      const translatedData = await Promise.all(
        schemes.map(async (scheme) => {
          const translatedTitle = await translateText(scheme.title, currentLang);
          const translatedStatus = await translateText(scheme.status, currentLang);
          const translatedDate = await translateText(scheme.date, currentLang);
          const translatedDetails = await translateText(scheme.details, currentLang);
          const translatedState = await translateText(scheme.state, currentLang);
          const translatedEligibility = await Promise.all(
            scheme.eligibility.map(item => translateText(item, currentLang))
          );

          return {
            ...scheme,
            title: translatedTitle,
            status: translatedStatus,
            date: translatedDate,
            state: translatedState,
            details: translatedDetails,
            eligibility: translatedEligibility
          };
        })
      );
      setTranslatedSchemes(translatedData);

      // Extract and translate state names
      const uniqueStates = [...new Set(schemes.map((s) => s.state))];
      const translatedStatesList = await Promise.all(
        uniqueStates.map((state) => translateText(state, currentLang))
      );
      setTranslatedStates(translatedStatesList);
    };

    translateSchemes();
  }, [currentLang]);


  const audioRef = useRef(null); // Store the audio instance
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speakText = async (text, lang) => {
    try {
      // Stop current speech if already playing
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
      audioRef.current = audio; // Store the audio instance
      setIsSpeaking(true);

      // When audio finishes, reset state
      audio.addEventListener("ended", () => {
        setIsSpeaking(false);
        audioRef.current = null;
      });
    } catch (error) {
      console.error("Speech error:", error);
    }
  };
  // Stop speech when the component unmounts or route changes
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
        setIsSpeaking(false);
      }
    };
  }, []);

  const translateText = async (text, targetLang) => {
    try {
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=mr&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
      );
      const data = await response.json();
      return data[0].map((item) => item[0]).join("");
    } catch (error) {
      console.error("Translation error:", error);
      return text;
    }
  };

  const filteredSchemes = translatedSchemes.filter(
    (scheme) =>
      scheme.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedState === "" || scheme.state === selectedState)
  );

  return (
    <>
      <Navbar currentLang={currentLang} />
      <div className="govt-container">
        {!selectedScheme ? (
          <>
            <div className="govt-header">
              <h1 className="title">{translatedUI.title}</h1>
              <p>{translatedUI.description}</p>
            </div>

            <div className="search-filters">
              <div className="search-container">
                <input
                  type="text"
                  placeholder={translatedUI.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="search-icon" />
              </div>

              <select onChange={(e) => setSelectedState(e.target.value)}>
                <option value="">{translatedUI.selectState}</option>
                {[...new Set(schemes.map((s) => s.state))].map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div className="schemes-grid">
              {filteredSchemes.map((scheme) => (
                <div key={scheme.id} className="card">
                  <h3>{scheme.title}</h3>
                  <span className={`status-badge ${scheme.status.includes("सक्रिय") || scheme.status.includes("active") ? "status-active" : "status-expiring"}`}>
                    {scheme.status}
                  </span>
                  <p className="date">{scheme.date}</p>
                  <p className="state">{scheme.state}</p>
                  <p>{scheme.details}</p>

                  {/* ✅ Correctly reference scheme inside onClick */}
                  <button
                    className="button primary-button"
                    onClick={async () => {
                      const translatedDetails = await translateText(scheme.details, currentLang);

                      // Ensure eligibility is an array before mapping
                      const translatedEligibility = scheme.eligibility
                        ? await Promise.all(scheme.eligibility.map(async (item) => await translateText(item, currentLang)))
                        : [];

                      setSelectedScheme({
                        ...scheme,
                        details: translatedDetails,
                        eligibility: translatedEligibility
                      });
                    }}
                  >
                    {translatedUI.viewDetails}
                  </button>


                  <button
                    className="button speak-button"
                    onClick={() => speakText(`${scheme.title}. ${scheme.details}`, currentLang)}
                  >
                    {translatedUI.listenButton}
                  </button>
                </div>
              ))}

            </div>
          </>
        ) : (
          <div className="scheme-details">
            <button
              onClick={() => setSelectedScheme(null)}
              className="back-button"
            >
              {translatedUI.backButton}
            </button>
            <h2 className="title">{selectedScheme.title}</h2>
            <p>{selectedScheme.details}</p>
            <h3>{translatedUI.eligibilityTitle}</h3>
            <ul className="eligibility-list">
              {selectedScheme.eligibility.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <a
              href={selectedScheme.applicationLink}
              target="_blank"
              rel="noopener noreferrer"
            >

              <button
                className="button primary-button"
                onClick={async () => {
                  if (!schemes || !schemes.details) {
                    console.error("Scheme data is missing or undefined:", schemes);
                    return;
                  }

                  const translatedDetails = await translateText(schemes.details, currentLang);

                  const translatedEligibility = Array.isArray(schemes.eligibility)
                    ? await Promise.all(schemes.eligibility.map(async (item) => await translateText(item, currentLang)))
                    : [];

                  setSelectedScheme({
                    ...schemes,
                    details: translatedDetails,
                    eligibility: translatedEligibility.length ? translatedEligibility : schemes.eligibility || [],
                  });
                }}
              >
                {translatedUI.viewDetails}
              </button>


            </a>
          </div>
        )}
      </div>
    </>
  );
}
import { useState } from "react";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
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
    status: "सक्रिय",
    date: "अंतिम तारीख - ३१ डिसेंबर",
    state: "पंजाब",
    details: "कृषी उत्पादनांसाठी ऑनलाइन व्यापार आणि लिलाव सुविधा",
    eligibility: ["आधार कार्ड", "शेतकरी नोंदणी प्रमाणपत्र"],
    applicationLink: "https://mandiboard.punjab.gov.in"
  },
  {
    id: 6,
    title: "गुजरात कृषी विपणन ऑनलाइन सेवा",
    status: "सक्रिय",
    date: "अंतिम तारीख - ३१ मार्च ",
    state: "गुजरात",
    details: "शेतकऱ्यांसाठी ऑनलाइन बाजार आणि व्यापार सुविधा",
    eligibility: ["आधार कार्ड", "शेतकरी नोंदणी प्रमाणपत्र"],
    applicationLink: "https://agri.gujarat.gov.in"
  },
  {
    id: 7,
    title: "केरळ कृषी विपणन ई-प्लॅटफॉर्म",
    status: "सक्रिय",
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

export default function GovtSchemes() {
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("");

  const filteredSchemes = schemes.filter(
    (scheme) =>
      scheme.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedState === "" || scheme.state === selectedState)
  );

  return (
    <>
      <nav className="navbar">
        <div className="nav-brand">AgriSeva</div>
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/pestdetect" className="nav-link">Pest Detection</Link>
          <Link to="/schemes" className="nav-link active">Schemes</Link>
          <Link to="/chatbot" className="nav-link">Chat Bot</Link>
        </div>
      </nav>

      <div className="container">
        {!selectedScheme ? (
          <>
            <div className="header">
              <h1 className="title">सरकारी कृषी योजना</h1>
              <p>शेतकऱ्यांसाठी विविध सरकारी योजनांची माहिती</p>
            </div>
            
            <div className="search-filters">
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
                {[...new Set(schemes.map((s) => s.state))].map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div className="schemes-grid">
              {filteredSchemes.map((scheme) => (
                <div key={scheme.id} className="card">
                  <h3>{scheme.title}</h3>
                  <span className={`status-badge ${scheme.status.includes("सक्रिय") ? "status-active" : "status-expiring"}`}>
                    {scheme.status}
                  </span>
                  <p className="date">{scheme.date}</p>
                  <p className="state">{scheme.state}</p>
                  <p>{scheme.details}</p>
                  <button 
                    className="button primary-button"
                    onClick={() => setSelectedScheme(scheme)}
                  >
                    तपशील पहा
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
              ← मागे जा
            </button>
            <h2 className="title">{selectedScheme.title}</h2>
            <p>{selectedScheme.details}</p>
            <h3>पात्रता निकष</h3>
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
              <button className="button primary-button">
                आता अर्ज करा
              </button>
            </a>
          </div>
        )}
      </div>
    </>
  );
}

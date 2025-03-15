import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IconButton } from '@mui/material';
import { Menu as MenuIcon, Edit as EditIcon, Delete as DeleteIcon, Mic as MicIcon, Send as SendIcon, LightMode as LightModeIcon, DarkMode as DarkModeIcon, VolumeUp as VolumeUpIcon } from '@mui/icons-material';
import './Chatbot.css'
import { Check as CheckIcon } from '@mui/icons-material';
import CloseIcon from "@mui/icons-material/Close";
import Navbar from './shared/Navbar';

const translations = {
  en: {
    title: "Agriculture Chatbot",
    newChat: "New Chat",
    myChats: "My Chats",
    typeMessage: "Type your message...",
    selectLanguage: "Select Language",
  },
  mr: {
    title: "कृषी संवाद",
    newChat: "नवीन चॅट",
    myChats: "माझ्या चॅट्स",
    typeMessage: "तुमचा संदेश टाइप करा...",
    selectLanguage: "भाषा निवडा",
  },
  hi: {
    title: "कृषि संवाद",
    newChat: "नयी चैट",
    myChats: "मेरी चैट्स",
    typeMessage: "अपना संदेश टाइप करें...",
    selectLanguage: "भाषा चुनें",
  }
};

const ChatbotPage = ({ currentLang }) => {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(currentLang || "mr");  // Use prop as initial state
  const [chatHistory, setChatHistory] = useState(() => JSON.parse(localStorage.getItem("agriChatHistory")) || {});
  const [chatNames, setChatNames] = useState(() => JSON.parse(localStorage.getItem("agriChatNames")) || {});
  const [currentChatId, setCurrentChatId] = useState(() => localStorage.getItem("agriCurrentChatId") || "कृषी संवाद 1");
  const [messages, setMessages] = useState(chatHistory[currentChatId] || []);
  const [renameChatId, setRenameChatId] = useState(null);
  const [renameChatName, setRenameChatName] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = currentLang === "mr" ? "mr-IN" : currentLang === "hi" ? "hi-IN" : "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;

  const checkForNavigation = (query) => {
    const weatherKeywords = ["weather", "rain", "temperature", "forecast", "हवामान", "तापमान", "पाऊस"];
    const cropKeywords = ["crop", "best crop", "plant", "शेती", "पिक", "कोणते पीक"];
    const schemeKeywords = ["government scheme", "subsidy", "योजना", "सरकारी मदत", "अनुदान"];
    const pestKeywords = ["pest", "insect", "disease", "कीड", "रोग", "डाग"];

    if (weatherKeywords.some(word => query.toLowerCase().includes(word))) {
      navigate('/weather');
      return true;
    }
    if (cropKeywords.some(word => query.toLowerCase().includes(word))) {
      navigate('/crop-recommendation');
      return true;
    }
    if (schemeKeywords.some(word => query.toLowerCase().includes(word))) {
      navigate('/schemes');
      return true;
    }
    if (pestKeywords.some(word => query.toLowerCase().includes(word))) {
      navigate('/pestdetect');
      return true;
    }

    return false;
  };

  useEffect(() => {
    setSelectedLanguage(currentLang);
  }, [currentLang]);

  useEffect(() => {
    localStorage.setItem("agriChatHistory", JSON.stringify(chatHistory));
    localStorage.setItem("agriChatNames", JSON.stringify(chatNames));
    localStorage.setItem("agriCurrentChatId", currentChatId);
  }, [chatHistory, chatNames, currentChatId]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setIsLoading(true);

    if (checkForNavigation(input)) {
      setInput('');
      return;
    }

    setIsLoading(true);

    try {
      const userMessage = { text: input, sender: 'user' };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setChatHistory({
        ...chatHistory,
        [currentChatId]: updatedMessages,
      });
      setInput('');

      const response = await fetch('http://localhost:5000/api/nvidia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: "user", content: input }]
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported');
      }

      const botMessage = { text: '', sender: 'bot' };
      setMessages([...updatedMessages, botMessage]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(5);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                botMessage.text += parsed.content;
                setMessages([...updatedMessages, { ...botMessage }]);
              }
            } catch (e) {
              console.error('Error parsing chunk:', e);
            }
          }
        }
      }

      setChatHistory({
        ...chatHistory,
        [currentChatId]: [...updatedMessages, botMessage],
      });

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        text: "माफ करा, एक त्रुटी आली. कृपया पुन्हा प्रयत्न करा.",
        sender: 'bot'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    setInput(transcript);
    setIsListening(false);
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    setIsListening(false);
  };

  const speakText = async (text) => {
    try {
      const cleanedText = text
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
        .replace(/#{1,6}\s*(.*?)\n?/g, "$1")
        .replace(/\n+/g, " ");

      const voiceId = selectedLanguage === "en" ? "arman" : "nikita";
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
          const errorMessage = await response.text();
          throw new Error(`TTS API Error ${response.status}: ${errorMessage}`);
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
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

  const formatBotResponse = (text, language) => {
    const devanagariRegex = /[\u0900-\u097F]/;
    const isDevanagari = devanagariRegex.test(text);

    if (isDevanagari) {
      return text
        .replace(/\n\n/g, "<br/><br/>")
        .replace(/\n/g, "<br/>")
        .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
        .replace(/\*(.*?)\*/g, "<i>$1</i>")
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
        .replace(/#{1,6}\s*(.*?)\n/g, "<b>$1</b><br/>");
    }

    return text
      .replace(/\n\n/g, "<br/><br/>")
      .replace(/\n/g, "<br/>")
      .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
      .replace(/\*(.*?)\*/g, "<i>$1</i>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
      .replace(/#{1,6}\s*(.*?)\n/g, "<b>$1</b><br/>");
  };

  {
    messages.map((msg, index) => (
      <div key={index} className={`message ${msg.sender}`}>
        <p className="formatted-text" dangerouslySetInnerHTML={{ __html: msg.sender === 'bot' ? formatBotResponse(msg.text, selectedLanguage) : msg.text }}></p>
        {msg.sender === 'bot' && (
          <IconButton onClick={() => speakText(msg.text)}>
            <VolumeUpIcon />
          </IconButton>
        )}
      </div>
    ))
  }

  const createNewChat = () => {
    const newChatId = `कृषी संवाद ${Object.keys(chatHistory).length + 1}`;

    setChatHistory((prevChatHistory) => {
      const updatedChatHistory = { ...prevChatHistory, [newChatId]: [] };
      localStorage.setItem("agriChatHistory", JSON.stringify(updatedChatHistory));
      return updatedChatHistory;
    });

    setChatNames((prevChatNames) => {
      const updatedChatNames = { ...prevChatNames, [newChatId]: newChatId };
      localStorage.setItem("agriChatNames", JSON.stringify(updatedChatNames));
      return updatedChatNames;
    });

    setCurrentChatId(newChatId);
    setMessages([]);
    localStorage.setItem("agriCurrentChatId", newChatId);
  };

  const loadChat = (chatId) => {
    setCurrentChatId(chatId);
    setMessages(chatHistory[chatId] || []);
  };

  const startRenameChat = (chatId) => {
    setRenameChatId(chatId);
    setRenameChatName(chatNames[chatId] || chatId);
  };

  const confirmRenameChat = (chatId) => {
    if (!renameChatName.trim()) return;

    const updatedChatNames = { ...chatNames, [chatId]: renameChatName };
    setChatNames(updatedChatNames);
    setRenameChatId(null); // Exit rename mode

    localStorage.setItem("agriChatNames", JSON.stringify(updatedChatNames));
  };

  const deleteChat = (chatId) => {
    const updatedChats = { ...chatHistory };
    delete updatedChats[chatId];
    const updatedNames = { ...chatNames };
    delete updatedNames[chatId];
    setChatHistory(updatedChats);
    setChatNames(updatedNames);
    if (currentChatId === chatId) {
      const remainingChats = Object.keys(updatedChats);
      setCurrentChatId(remainingChats.length ? remainingChats[0] : "");
      setMessages(remainingChats.length ? updatedChats[remainingChats[0]] : []);
    }
  };

  return (
    <>
      <Navbar currentLang={currentLang} />
      <div className="chat-container">
        {/* 🔹 Navbar (Fixed at Top) */}
        <div className="chat-navbar">
          <IconButton onClick={() => setIsSidebarOpen(!isSidebarOpen)} className='menu-icon'>
            <MenuIcon />
          </IconButton>

          <h2>{chatNames[currentChatId] || currentChatId}</h2>
        </div>

        {/* 🔹 Sidebar (Collapsible) */}
        <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-header">
            <h3>माझ्या चॅट्स</h3>
            <IconButton onClick={() => setIsSidebarOpen(false)}>
              <CloseIcon /> {/* ✅ Close button */}
            </IconButton>
          </div>
          {Object.keys(chatHistory).map((chatId) => (
            <div key={chatId} className={`chat-item ${chatId === currentChatId ? 'active' : ''}`}>
              {renameChatId === chatId ? (
                <input
                  type="text"
                  value={renameChatName}
                  onChange={(e) => setRenameChatName(e.target.value)}
                />
              ) : (
                <span onClick={() => loadChat(chatId)}>
                  {chatNames[chatId] || chatId}
                </span>
              )}

              {/* Rename & Delete Buttons */}
              {renameChatId === chatId ? (
                <IconButton onClick={() => confirmRenameChat(chatId)}>
                  <CheckIcon />  {/* ✅ Confirm Rename */}
                </IconButton>
              ) : (
                <>
                  <IconButton onClick={() => startRenameChat(chatId)}>
                    <EditIcon /> {/* ✏ Rename Chat */}
                  </IconButton>
                  <IconButton onClick={() => deleteChat(chatId)}>
                    <DeleteIcon /> {/* 🗑 Delete Chat */}
                  </IconButton>
                </>
              )}
            </div>
          ))}

          <button className="new-chat-btn" onClick={createNewChat}>नवीन चॅट</button>
        </div>

        {/* 🔹 Chat Area */}
        <div className={`chat-content ${isSidebarOpen ? '' : 'full-width'}`}>
          <div className="messages-container">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                <p className="formatted-text" dangerouslySetInnerHTML={{ __html: msg.sender === 'bot' ? formatBotResponse(msg.text, selectedLanguage) : msg.text }}></p>
                {msg.sender === 'bot' && (
                  <IconButton onClick={() => speakText(msg.text)}>
                    <VolumeUpIcon />
                  </IconButton>
                )}
              </div>
            ))}

            {isLoading && <div className="message bot loading"><span>...</span></div>}
          </div>

          {/* 🔹 Input Box (Fixed at Bottom) */}
          <div className="chat-input">
            <input type="text" placeholder="तुमचा संदेश टाइप करा..." value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} />
            <IconButton onClick={handleVoiceInput} color={isListening ? "secondary" : "primary"}>
              <MicIcon />
            </IconButton>
            <IconButton onClick={handleSend}><SendIcon /></IconButton>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatbotPage;

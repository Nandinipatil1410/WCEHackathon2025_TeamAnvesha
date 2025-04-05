import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { IconButton } from '@mui/material';
import {Mic as MicIcon, Send as SendIcon,  VolumeUp as VolumeUpIcon } from '@mui/icons-material';
import './Chatbot.css'

import Navbar from './shared/Navbar';


const ChatbotPage = ({ currentLang }) => {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(windowWidth > 768);
  const [selectedLanguage, setSelectedLanguage] = useState(currentLang || "mr");  // Use prop as initial state
  const [chatHistory, setChatHistory] = useState(() => JSON.parse(localStorage.getItem("agriChatHistory")) || {});
  const [chatNames, setChatNames] = useState(() => JSON.parse(localStorage.getItem("agriChatNames")) || {});
  const [currentChatId, setCurrentChatId] = useState(() => localStorage.getItem("agriCurrentChatId") || "कृषी संवाद 1");
  const [messages, setMessages] = useState(chatHistory[currentChatId] || []);
  
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
      navigate('/crop-predict');
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

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setIsSidebarOpen(width > 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

      const response = await fetch('https://backend-for-agriseva.onrender.com/api/nvidia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
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

      const voiceId = selectedLanguage === "en" ? "arman" : "diya";
      const maxTextLength = 200;
      const textChunks = cleanedText.match(new RegExp(`.{1,${maxTextLength}}(\\s|$)`, "g")) || [];

      for (const chunk of textChunks) {
        const response = await fetch("https://waves-api.smallest.ai/api/v1/lightning/get_speech", {
          method: "POST",
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2QxY2QxZDE5MTUxNTkzMzFlYzUyM2IiLCJpYXQiOjE3NDIwMDA3MDl9.WVg8wxS0aPujXcejVt3sqh1jBKyr1vkaFlhmvNqouO0`,
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

  return (
    <>
      <Navbar currentLang={currentLang} />
      <div className="chat-container">
        


        {/* Chat content */}
        <div className={`chat-content ${windowWidth <= 768 && !isSidebarOpen ? 'full-width' : ''}`}>
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

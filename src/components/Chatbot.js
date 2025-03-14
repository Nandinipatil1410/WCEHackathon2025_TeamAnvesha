import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IconButton, Button, TextField, Select, MenuItem } from '@mui/material';
import { Menu as MenuIcon, Edit as EditIcon, Delete as DeleteIcon, Mic as MicIcon, Send as SendIcon, LightMode as LightModeIcon, DarkMode as DarkModeIcon, VolumeUp as VolumeUpIcon } from '@mui/icons-material';
// import './Chatbot.css'


const ChatbotPage = ({ currentLang }) => {  
  const [chatHistory, setChatHistory] = useState(() => JSON.parse(localStorage.getItem("agriChatHistory")) || {});
  const [chatNames, setChatNames] = useState(() => JSON.parse(localStorage.getItem("agriChatNames")) || {});
  const [currentChatId, setCurrentChatId] = useState(() => localStorage.getItem("agriCurrentChatId") || `कृषी संवाद 1`);
  const [messages, setMessages] = useState(chatHistory[currentChatId] || []);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState(currentLang || "mr");  // Use prop as initial state

  useEffect(() => {
    localStorage.setItem("agriChatHistory", JSON.stringify(chatHistory));
    localStorage.setItem("agriChatNames", JSON.stringify(chatNames));
    localStorage.setItem("agriCurrentChatId", currentChatId);
  }, [chatHistory, chatNames, currentChatId]);

  const handleSend = async () => {
    if (!input.trim()) return;
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


  return (
    <div className={`chatbot-container ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="chat-header">
        <Link to="/" className="back-button">←</Link>
        <IconButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}><MenuIcon /></IconButton>
        <h2>कृषी मित्र</h2>
        <Select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
          <MenuItem value="mr">मराठी</MenuItem>
          <MenuItem value="hi">हिंदी</MenuItem>
          <MenuItem value="en">English</MenuItem>
        </Select>
        <IconButton onClick={() => setIsDarkMode(!isDarkMode)}>
          {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </div>

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

      <div className="input-container">
        <TextField fullWidth variant="outlined" value={input} onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="तुमचा संदेश टाइप करा..." disabled={isLoading} multiline maxRows={4} />
        <IconButton onClick={handleSend} disabled={isLoading || !input.trim()}><SendIcon /></IconButton>
      </div>
    </div>
  );
};

export default ChatbotPage;

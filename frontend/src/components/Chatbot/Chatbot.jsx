import React, { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  Plus,
  Search,
  Send,
  Image,
  Video,
  Mic,
  User,
  Moon,
  Sun,
  LogOut,
  Edit,
  Settings,
  Menu,
  X,
  AlertTriangle,
  Trash2,
  Camera,
} from "lucide-react";
import "./Chatbot.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const MentalHealthChatbot = () => {
  // State management
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [inputMode, setInputMode] = useState("text");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const textInputRef = useRef(null);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Video and audio state and refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [streamInterval, setStreamInterval] = useState(null);

  // Fetch user profile and chats on component mount
  useEffect(() => {
    const fetchUserAndChats = async () => {
      const token = localStorage.getItem("token");

      // Fetch user profile
      const userResponse = await fetch(
        "http://localhost:3000/api/auth/profile",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const userData = await userResponse.json();
      if (userResponse.ok) {
        setUser(userData);
      } else {
        navigate("/");
        return;
      }

      // Fetch chats
      const chatsResponse = await fetch("http://localhost:3000/api/chats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const chatsData = await chatsResponse.json();
      if (chatsResponse.ok) {
        setChats(chatsData);
      } else {
        console.error("Failed to fetch chats:", chatsData.message);
      }
    };

    fetchUserAndChats();
  }, [navigate]);

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Theme toggling
  useEffect(() => {
    document.body.className = darkMode ? "dark-mode" : "light-mode";
  }, [darkMode]);

  // Handle sending a message
  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: getRandomResponse(),
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);

      // Update chat list
      setChats((prev) =>
        prev.map((chat) =>
          chat._id === activeChat
            ? {
                ...chat,
                lastMessage: botResponse.text.substring(0, 40) + "...",
              }
            : chat
        )
      );
    }, 1000);
  };

  // Handle creating a new chat
  const handleNewChat = async () => {
    const token = localStorage.getItem("token");
    const newChat = {
      title: `New Session ${chats.length + 1}`,
      lastMessage: "How may I help you today?",
      timestamp: new Date(),
    };

    const response = await fetch("http://localhost:3000/api/chats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newChat),
    });

    if (response.ok) {
      const data = await response.json();
      setChats((prev) => [data, ...prev]);
      setActiveChat(data._id);
      setMessages([
        {
          id: 1,
          text: `Hello, ${user.username}. How may I help you today?`,
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    } else {
      console.error("Failed to create new chat");
    }
  };

  // Handle deleting a chat
  const handleDeleteChat = async (chatId) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:3000/api/chats/${chatId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const updatedChats = chats.filter((chat) => chat._id !== chatId);
      setChats(updatedChats);
      if (activeChat === chatId) {
        setActiveChat(null);
        setMessages([]);
      }
    } else {
      console.error("Failed to delete chat");
    }
  };

  // Sample responses
  const getRandomResponse = () => {
    const responses = [
      "How does that make you feel?",
      "Tell me more about that experience.",
      "I notice you seem to be feeling frustrated. Would you like to explore that further?",
      "That sounds challenging. How have you been coping with it?",
      "I'm here to listen. Would you like to share more about what's on your mind?",
      "Let's take a moment to recognize the progress you've made so far.",
      "Have you tried any relaxation techniques when you feel this way?",
      "What thoughts come up for you when you experience this situation?",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Format timestamp
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  // Filter chats based on search query
  const filteredChats = chats.filter(
    (chat) =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Video and audio functionality
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing webcam:", error);
    }
  };

  const captureAndSendFrame = async () => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("face", blob, "frame.jpg");
      formData.append("user_id", user?._id || "12345");

      try {
        const res = await axios.post("http://127.0.0.1:5000/unified_emotion", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const botResponse = {
          id: messages.length + 1,
          text: res.data.chatbot_response,
          sender: "bot",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botResponse]);
      } catch (error) {
        console.error("Error sending frame:", error);
      }
    }, "image/jpeg");
  };

  const startStreaming = () => {
    if (!isStreaming) {
      setIsStreaming(true);
      const interval = setInterval(captureAndSendFrame, 3000);
      setStreamInterval(interval);
    } else {
      if (streamInterval) {
        clearInterval(streamInterval);
        setStreamInterval(null);
      }
      setIsStreaming(false);
    }
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setCountdown(5);

    // Add a visual indicator to the UI
    const textIndicator = document.createElement('div');
    textIndicator.className = 'recording-indicator';
    textIndicator.textContent = 'Preparing to record...';
    document.querySelector('.video-input-wrapper').appendChild(textIndicator);

    // Start countdown
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (textIndicator) {
            textIndicator.textContent = 'Recording in progress...';
            textIndicator.classList.add('active');
          }
          startRecording();
          return null;
        }
        textIndicator.textContent = `Recording in ${prev - 1}...`;
        return prev - 1;
      });
    }, 1000);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);

      let audioChunks = [];
      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = async () => {
        // Show processing indicator
        const indicatorEl = document.querySelector('.recording-indicator');
        if (indicatorEl) {
          indicatorEl.textContent = 'Processing your voice...';
          indicatorEl.classList.add('processing');
        }

        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        const formData = new FormData();
        formData.append("voice", audioBlob, "voice.wav");
        formData.append("user_id", user?._id || "12345");

        try {
          const res = await axios.post("http://127.0.0.1:5000/unified_emotion", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          const botResponse = {
            id: messages.length + 1,
            text: res.data.chatbot_response,
            sender: "bot",
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, botResponse]);

          // Remove the indicator after processing
          if (indicatorEl) {
            indicatorEl.remove();
          }
        } catch (error) {
          console.error("Error sending voice:", error);
          // Show error in indicator
          if (indicatorEl) {
            indicatorEl.textContent = 'Error processing voice';
            indicatorEl.classList.add('error');
            setTimeout(() => indicatorEl.remove(), 3000);
          }
        }

        // Close audio stream
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();

      // Add visual audio wave animation during recording
      const waveContainer = document.createElement('div');
      waveContainer.className = 'audio-wave-container';
      for (let i = 0; i < 5; i++) {
        const bar = document.createElement('div');
        bar.className = 'audio-wave-bar';
        waveContainer.appendChild(bar);
      }
      document.querySelector('.video-input-wrapper').appendChild(waveContainer);

      setTimeout(() => {
        recorder.stop();
        setIsRecording(false);

        // Remove the wave animation
        const waveEl = document.querySelector('.audio-wave-container');
        if (waveEl) waveEl.remove();
      }, 5000); // Record for 5 seconds
    } catch (error) {
      console.error("Error recording audio:", error);
      setIsRecording(false);

      // Show error indicator
      const indicatorEl = document.querySelector('.recording-indicator');
      if (indicatorEl) {
        indicatorEl.textContent = 'Microphone access denied';
        indicatorEl.classList.add('error');
        setTimeout(() => indicatorEl.remove(), 3000);
      }
    }
  };

  // Handle video mode
  useEffect(() => {
    if (inputMode === "video") {
      startCamera();
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
      if (streamInterval) {
        clearInterval(streamInterval);
        setStreamInterval(null);
      }
      setIsStreaming(false);
    }

    // Cleanup function
    return () => {
      if (streamInterval) {
        clearInterval(streamInterval);
      }
    };
  }, [inputMode]);

  // Clean up streams when component unmounts
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
      if (streamInterval) {
        clearInterval(streamInterval);
      }
    };
  }, []);

  // Add this function to load messages for a specific chat
  const loadChatMessages = async (chatId) => {
    if (!chatId) return;

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:3000/api/chats/${chatId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const messagesData = await response.json();
        // Format the messages for display
        const formattedMessages = messagesData.map((msg, index) => ({
          id: index + 1,
          text: msg.content,
          sender: msg.sender,
          timestamp: new Date(msg.timestamp)
        }));

        setMessages(formattedMessages);
        setActiveChat(chatId);
      } else {
        console.error("Failed to load chat messages");
        // If failed to load messages, show a default welcome message
        setMessages([{
          id: 1,
          text: "Welcome back. How can I help you today?",
          sender: "bot",
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error("Error loading chat messages:", error);
    }
  };

  // Update the setActiveChat call in the Chat item click handler
  const handleChatClick = (chatId) => {
    loadChatMessages(chatId);
    // Close mobile menu if open
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  // Enhance the search functionality
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // If search is empty, show all chats
    if (!query.trim()) {
      return;
    }

    // If we have a query but no matching chats, show a message
    if (query.trim() && filteredChats.length === 0) {
      // Consider adding a "no results" indicator in the UI
      const noResultsEl = document.createElement('div');
      noResultsEl.className = 'no-search-results';
      noResultsEl.textContent = 'No chats match your search';

      const chatsList = document.querySelector('.chats-list');
      // Remove any existing "no results" message
      const existingNoResults = document.querySelector('.no-search-results');
      if (existingNoResults) existingNoResults.remove();

      if (chatsList && filteredChats.length === 0) {
        chatsList.appendChild(noResultsEl);
      }
    } else {
      // Remove the no results message if we have results
      const existingNoResults = document.querySelector('.no-search-results');
      if (existingNoResults) existingNoResults.remove();
    }
  };

  // Update the search input to use the enhanced handler
  const searchInput = (
    <input
      type="text"
      placeholder="Search conversations..."
      className="search-input"
      value={searchQuery}
      onChange={handleSearchChange}
    />
  );

  // Add this effect to update the active chat when needed
  useEffect(() => {
    // If we have chats but no active chat, set the first one as active
    if (chats.length > 0 && !activeChat) {
      loadChatMessages(chats[0]._id);
    }

    // If active chat is deleted or filtered out, reset to first available chat
    if (activeChat && filteredChats.length > 0) {
      const chatExists = filteredChats.some(chat => chat._id === activeChat);
      if (!chatExists) {
        loadChatMessages(filteredChats[0]._id);
      }
    }
  }, [chats, filteredChats, activeChat]);

  return (
    <div className={`app-container ${darkMode ? "dark" : "light"}`}>
      {/* Mobile menu toggle */}
      <div className="mobile-menu-toggle">
        {isMobileMenuOpen ? (
          <X size={24} onClick={() => setIsMobileMenuOpen(false)} />
        ) : (
          <Menu size={24} onClick={() => setIsMobileMenuOpen(true)} />
        )}
      </div>

      {/* Left sidebar */}
      <div className={`sidebar ${isMobileMenuOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">Empathy AI</h2>
          <button className="new-chat-btn" onClick={handleNewChat}>
            <Plus size={20} />
            <span>New Chat</span>
          </button>
        </div>

        <div className="search-container">
          <Search size={16} className="search-icon" />
          {searchInput}
        </div>

        <div className="chats-list">
          {filteredChats.map((chat) => (
            <div
              key={chat._id}
              className={`chat-item ${activeChat === chat._id ? "active" : ""}`}
              onClick={() => handleChatClick(chat._id)}
            >
              <div className="chat-icon">
                <MessageCircle size={20} />
              </div>
              <div className="chat-details">
                <div className="chat-title">{chat.title}</div>
                <div className="chat-message">{chat.lastMessage}</div>
              </div>
              <div className="chat-meta">
                <div className="chat-time">
                  {formatDate(new Date(chat.timestamp))}
                </div>
              </div>
              {/* Delete Button */}
              <div
                className="delete-chat-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteChat(chat._id);
                }}
              >
                <Trash2 size={16} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div className="main-content">
        <div className="chat-header">
          <div className="chat-info">
            <h3>Session {activeChat}</h3>
          </div>
          <div className="profile-container">
            <div
              className="profile-icon"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            >
              <User size={24} />
            </div>
            {showProfileDropdown && (
              <div className="profile-dropdown">
                <div className="dropdown-item">
                  <Edit size={16} />
                  <span>Edit Profile</span>
                </div>
                <div className="dropdown-item">
                  <Settings size={16} />
                  <span>Settings</span>
                </div>
                <div
                  className="dropdown-item"
                  onClick={() => setDarkMode(!darkMode)}
                >
                  {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                  <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
                </div>
                <div className="dropdown-item">
                  <LogOut size={16} />
                  <span
                    onClick={() => {
                      localStorage.removeItem("token");
                      navigate("/");
                    }}
                  >
                    Logout
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="messages-container">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${
                message.sender === "user" ? "user-message" : "bot-message"
              }`}
            >
              <div className="message-content">
                <p>{message.text}</p>
              </div>
              <div className="message-time">
                {formatTime(message.timestamp)}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <div className="input-mode-selector">
            <button
              className={`input-mode-btn ${
                inputMode === "text" ? "active" : ""
              }`}
              onClick={() => setInputMode("text")}
            >
              <MessageCircle size={20} />
            </button>
            <button
              className={`input-mode-btn ${
                inputMode === "video" ? "active" : ""
              }`}
              onClick={() => setInputMode("video")}
            >
              <Video size={20} />
            </button>
          </div>

          {inputMode === "video" ? (
            <div className={`video-input-wrapper ${isStreaming ? 'streaming-active' : ''}`}>
              <div className="video-status" style={{ display: isStreaming ? 'flex' : 'none' }}>
                <div className="status-dot"></div>
                <span>Live Analysis</span>
              </div>

              <video
                ref={videoRef}
                autoPlay
                playsInline
                onLoadedMetadata={() => {
                  // Animation when video loads
                  if (videoRef.current) {
                    videoRef.current.style.animation = 'video-fade-in 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards';
                  }
                }}
              ></video>

              <canvas ref={canvasRef} style={{ display: "none" }} width="400" height="300"></canvas>

              <div className="video-overlay">
                <div className="overlay-icon">
                  <Camera size={40} color="white" opacity={0.8} />
                </div>
              </div>

              <div className="video-controls">
                <button
                  onClick={startStreaming}
                  className={isStreaming ? 'active' : ''}
                >
                  <Video size={18} />
                  <span>{isStreaming ? 'Stop Analysis' : 'Start Live Analysis'}</span>
                </button>

                <button
                  onClick={handleStartRecording}
                  disabled={isRecording}
                  className={isRecording ? 'recording' : ''}
                >
                  <Mic size={18} />
                  <span>
                    {isRecording
                      ? countdown
                        ? `Recording in ${countdown}...`
                        : 'Recording...'
                      : 'Voice Analysis'}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-input-wrapper">
              <input
                type="text"
                className="text-input"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                ref={textInputRef}
              />
              <button
                className="send-btn"
                onClick={handleSendMessage}
                disabled={!input.trim()}
              >
                <Send size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentalHealthChatbot;
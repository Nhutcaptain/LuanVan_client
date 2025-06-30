// components/Chatbot.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import './styles.css';
import api from '@/lib/axios';
import { getOrCreateUserId } from '@/utils/user';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isDiagnosticMode, setIsDiagnosticMode] = useState(false);
  const [message, setMessage] = useState('');
  
  type ConversationMessage = {
    sender: string;
    text: string;
    isThinking?: boolean;
    isError?: boolean;
    timestamp?: string;
  };

  const [conversation, setConversation] = useState<ConversationMessage[]>([]);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

   const messagesEndRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatBotReply = (reply: string) => {
    const parts = reply.split(/\n(\d+\.)/g);
    
    return parts.map((part, index) => {
      if (/^\d+\.$/.test(part)) {
        return (
          <div key={index} className="diagnosis-point">
            <span className="point-number">{part}</span>
          </div>
        );
      } else if (part.includes('**')) {
        const boldParts = part.split('**');
        return (
          <div key={index} className="warning-message">
            {boldParts.map((text, i) => 
              i % 2 === 1 ? <strong key={i}>{text}</strong> : text
            )}
          </div>
        );
      }
      return <div key={index}>{part}</div>;
    });
  };

  const toggleDiagnosticMode = () => {
    setIsDiagnosticMode(!isDiagnosticMode);
    setIsThinking(true);
    setTimeout(() => setIsThinking(false), 1500);
  };

  const handleSendMessage = async () => {
    if (message.trim()) {
      setIsThinking(true);
      try {
        const userMessage = {
          sender: 'user',
          text: message,
          timestamp: new Date().toISOString()
        };
        
        setConversation(prev => [...prev, userMessage]);
        setMessage('');
        
        const thinkingMessage = {
          sender: 'bot',
          text: '...',
          isThinking: true
        };
        setConversation(prev => [...prev, thinkingMessage]);
        
        const endpoint = isDiagnosticMode ? '/symptom/diagnose' : '/openai/ask';
        const userId = getOrCreateUserId();
        
        const response = isDiagnosticMode 
          ? await api.post(endpoint, {userId: userId, description: message})
          : await api.post(endpoint, {message});
        
        const data = response.data;
        setConversation(prev => [
          ...prev.filter(msg => !msg.isThinking),
          {
            sender: 'bot',
            text: isDiagnosticMode ? data.response || data.message : data.reply || data.message,
            timestamp: new Date().toISOString()
          }
        ]);
      
      } catch (error) {
        console.error('Lỗi khi gửi tin nhắn:', error);
        setConversation(prev => [
          ...prev.filter(msg => !msg.isThinking),
          {
            sender: 'bot',
            text: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
            isError: true,
            timestamp: new Date().toISOString()
          }
        ]);
      } finally {
        setIsThinking(false);
      }
    }
  };

  return (
    <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
      {isOpen ? (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-logo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="..." fill="#0A84FF"/>
              </svg>
              <span>Trợ lý AI</span>
            </div>
            <button onClick={toggleChatbot} className="chatbot-close-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18 6L6 18M6 6l12 12" strokeWidth="2"/>
              </svg>
            </button>
          </div>
          
          <div className={`diagnostic-toggle ${isDiagnosticMode ? 'active' : ''}`}>
            <button 
              onClick={toggleDiagnosticMode}
              className={`diagnostic-btn ${isThinking ? 'thinking' : ''} ${isDiagnosticMode ? 'active' : ''} `}
            >
              <span className="diagnostic-icon">
                {isThinking && (
                  <div className="thinking-dots">
                    <span>.</span><span>.</span><span>.</span>
                  </div>
                ) }
              </span>
              <span>Chatbot chẩn đoán</span>
            </button>
          </div>
          
          <div className="chatbot-message-area">
            {conversation.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.sender}`}>
                {msg.sender === 'bot' ? formatBotReply(msg.text) : msg.text}
              </div>
            ))}
            {isThinking && (
              <div className="chat-message bot thinking">
                <div className="thinking-dots">
                  <span>.</span><span>.</span><span>.</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="chatbot-input-area">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Nhập câu hỏi của bạn..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button 
              onClick={handleSendMessage} 
              disabled={!message.trim()}
              className="send-btn"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <button onClick={toggleChatbot} className="chatbot-toggle-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      )}
    </div>
  );
};

export default Chatbot;
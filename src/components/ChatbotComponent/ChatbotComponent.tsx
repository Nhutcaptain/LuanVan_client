// components/Chatbot.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import './styles.css';
import api from '@/lib/axios';
import { getOrCreateUserId } from '@/utils/user';
import { FiCopy, FiCheck, FiPlus, FiUserPlus } from 'react-icons/fi';
import { BiMessageSquareAdd } from "react-icons/bi";
import { AiOutlineSend } from "react-icons/ai";

import Image from 'next/image';
import { data } from 'framer-motion/client';
import Modal from '../ModalComponent/ModalComponent';
import { useRouter } from 'next/navigation';
import { IUser } from '@/interface/usermodel';
import { Specialty } from '@/interface/Department';

interface Doctor {
  _id?: string;
  nameSlug?: string;
  userId: IUser;
  departmentId?: string;
  specialtyId?: Specialty;
  specialization: string;
  certificate: string[];
  experience: string[];
  schedule: {
    date: string;
    time: string;
    shifts: string[];
  };
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isDiagnosticMode, setIsDiagnosticMode] = useState(false);
  const [message, setMessage] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [isNewChatConfirm, setIsNewChatConfirm] = useState(false);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [recommendedDoctors, setRecommendedDoctors] = useState<Doctor[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const router = useRouter();
  
  type ConversationMessage = {
    id: string;
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

  const copyToClipboard = (text: string, messageId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleSendMessage = async () => {
    if (message.trim()) {
      setIsThinking(true);
      try {
        const userMessage = {
          id: Date.now().toString(),
          sender: 'user',
          text: message,
          timestamp: new Date().toISOString()
        };
        
        setConversation(prev => [...prev, userMessage]);
        setMessage('');
        
        const thinkingMessage = {
          id: `thinking-${Date.now()}`,
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
        if(data.doctors) {
          setRecommendedDoctors(data.doctors);
        }
        console.log(data);
        setConversation(prev => [
          ...prev.filter(msg => !msg.isThinking),
          {
            id: Date.now().toString(),
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
            id: Date.now().toString(),
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

  const startNewChat = () => {
    resetConversation();
    if (conversation.length > 0) {
      setIsNewChatConfirm(true);
    } else {
      resetConversation();
    }
  };

  const resetConversation = () => {
    setConversation([]);
    setIsNewChatConfirm(false);
  };

  const cancelNewChat = () => {
    setIsNewChatConfirm(false);
  };

  const handleDoctorSuggestion = () => {
    setShowDoctorModal(true);
  }

  return (
    <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
      {isOpen ? (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-logo">
              <Image 
                src="/icons/medical_robotic.png" 
                alt="AI Icon"
                width={28}
                height={28}
                className="ai-icon"
              />
              <span>Trợ lý AI</span>
            </div>
            <div className="chatbot-header-actions">
              <button 
                onClick={startNewChat} 
                className="new-chat-btn"
                title="Tạo cuộc trò chuyện mới"
              >
                <BiMessageSquareAdd className="new-chat-icon" />
              </button>
              <button onClick={toggleChatbot} className="chatbot-close-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M18 6L6 18M6 6l12 12" strokeWidth="2"/>
                </svg>
              </button>
            </div>
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

          <div className="doctor-suggestion-btn">
            <button 
              onClick={handleDoctorSuggestion}
              className="doctor-btn"
              title="Gợi ý bác sĩ"
            >
              <FiUserPlus className="doctor-icon" />
              <span>Gợi ý bác sĩ</span>
            </button>
          </div>

          {showDoctorModal && (
            <Modal onClose={() => setShowDoctorModal(false)} title="Bác sĩ gợi ý">
              <div className="doctors-list">
                {isLoadingDoctors ? (
                  <div className="loading-doctors">
                    <div className="thinking-dots">
                      <span>.</span><span>.</span><span>.</span>
                    </div>
                  </div>
                ) : (
                  recommendedDoctors.map((doctor) => (
                    <div key={doctor._id} className="doctor-card">
                      <div className="avatar-container">
                          <img 
                          src={doctor.userId.avatar.url || '/icons/default_avatar.png'} 
                          alt={doctor.userId.fullName}
                          className="doctor-avatar"
                        />
                      </div>
                      <div className="buttom-card-group">
                        <div className="doctor-info">
                          <h4 className="doctor-name">{doctor.userId.fullName}</h4>
                          <p className="doctor-specialty">{doctor.specialtyId?.name}</p>
                        </div>
                      <button 
                        className="select-doctor-btn"
                        onClick={() => {
                          // Handle doctor selection logic here
                          setShowDoctorModal(false);
                          router.push(`/thong-tin-bac-si/${doctor.nameSlug}`)
                        }}
                      >
                        Xem thông tin
                      </button>
                      </div>
                    </div>
                    
                  ))
                )}
                {!isLoadingDoctors && recommendedDoctors.length === 0 && (
                  <div className="no-doctors">
                    <p>Không tìm thấy bác sĩ phù hợp</p>
                  </div>
                )}
              </div>
            </Modal>
          )}
          
          <div className="chatbot-message-area">
            {conversation.length === 0 && (
              <div className="welcome-message">
                <div className="welcome-avatar">
                  <Image 
                    src="/icons/medical_robotic.png" 
                    alt="AI Avatar"
                    width={80}
                    height={80}
                    className="ai-avatar-img"
                  />
                </div>
                <div className="welcome-text">
                  <p>Xin chào, mình là trợ lý AI!</p>
                  <p>Mình có thể giúp gì cho bạn hôm nay?</p>
                </div>
              </div>
            )}
            {conversation.map((msg) => (
              <div key={msg.id} className={`chat-message ${msg.sender}`}>
                <div className="message-content">
                  {msg.sender === 'bot' ? formatBotReply(msg.text) : msg.text}
                </div>
                {!msg.isThinking && (
                  <button 
                    className="copy-btn"
                    onClick={() => copyToClipboard(msg.text, msg.id)}
                    title="Copy tin nhắn"
                  >
                    {copiedMessageId === msg.id ? (
                      <FiCheck className="copy-icon" />
                    ) : (
                      <FiCopy className="copy-icon" />
                    )}
                  </button>
                )}
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
              <AiOutlineSend size={24}></AiOutlineSend>
            </button>
          </div>
        </div>
      ) : (
        <button onClick={toggleChatbot} className="chatbot-toggle-btn">
         <Image 
            src="/icons/medical_robotic.png" 
            alt="AI Icon"
            width={33}
            height={33}
            className="ai-icon"
          />
        </button>
      )}
    </div>
  );
};

export default Chatbot;
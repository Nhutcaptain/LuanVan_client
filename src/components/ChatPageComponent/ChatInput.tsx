"use client";

import { useState } from "react";
import { FiUserPlus } from "react-icons/fi";

interface Props {
  onSend: (message: string) => void;
  isDiagnosisMode: boolean;
  isShowModal: boolean;
  setDiagnosisMode: (mode: boolean) => void;
  onShowModal: (show: boolean) => void;
}

const ChatInput = (props: Props) => {
  const { onSend, isDiagnosisMode,isShowModal, setDiagnosisMode, onShowModal } = props;
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
  };

  const handleDoctorSuggestion = () => {
    onShowModal(!isShowModal);
  };

  return (
    <form onSubmit={handleSubmit} className="chat-input">
      <input
        className="input-field"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Nhập câu hỏi hoặc vấn đề bạn muốn được hỗ trợ..."
      />
      <div className="button-group">
        <div className="left-group">
          <div className={`diagnosis-button`}>
          <button
            type="button"
            className={`dg-button ${isDiagnosisMode ? "active" : ""}`}
            onClick={() => setDiagnosisMode(!isDiagnosisMode)}
          >
            AI chẩn đoán
          </button>
        </div>
        <div className="doctor-suggestion-btn">
          <button
            onClick={handleDoctorSuggestion}
            className="doctor-btn"
            title="Gợi ý bác sĩ"
            type='button'
          >
            <FiUserPlus className="doctor-icon" />
            <span>Gợi ý bác sĩ</span>
          </button>
        </div>
        </div>
        <button
          type="submit"
          className={`sen-message ${input ? "active" : " "} `}
        >
          Gửi
        </button>
      </div>
    </form>
  );
};

export default ChatInput;

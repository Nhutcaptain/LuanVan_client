'use client';

import { useState } from 'react';

interface Props {
  onSend: (message: string) => void;
  isDiagnosisMode: boolean;
  setDiagnosisMode: (mode: boolean) => void;
}

const ChatInput = (props: Props) => {
  const { onSend, isDiagnosisMode, setDiagnosisMode } = props;
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input.trim());
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="chat-input">
      <input
        className='input-field'
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Nhập câu hỏi hoặc vấn đề bạn muốn được hỗ trợ..."
      />
      <div className="button-group">
        <div className={`diagnosis-button`}>
          <button
            type="button"
            className={`dg-button ${isDiagnosisMode ? 'active' : ''}`}
            onClick={() => setDiagnosisMode(!isDiagnosisMode)}
          >
            AI chẩn đoán
          </button>
        </div>
        <button type="submit" className={`sen-message ${input ? "active" : " "} `}>Gửi</button>
      </div>
    </form>
  );
}

export default ChatInput;

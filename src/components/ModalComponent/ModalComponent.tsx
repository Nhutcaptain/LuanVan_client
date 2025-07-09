'use client';
import { ReactNode } from 'react';
import './styles.css'; // Make sure to add modal styles

interface ModalProps {
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const Modal = ({ onClose, title, children }: ModalProps) => {
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>{title}</h3>
          <button onClick={onClose} className="modal-close-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M18 6L6 18M6 6l12 12" strokeWidth="2"/>
            </svg>
          </button>
        </div>
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
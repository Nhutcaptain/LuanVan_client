import React from 'react';
import Modal from 'react-modal';
import './modalStyles.css'

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
}

const ResultModal: React.FC<ResultModalProps> = ({ isOpen, onClose, pdfUrl }) => {
  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      width: '80%',
      height: '80%',
      maxWidth: '900px',
      padding: '20px',
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      zIndex: 1000,
    },
  };

  const handlePrint = () => {
    const printWindow = window.open(pdfUrl, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles}
      contentLabel="Kết quả xét nghiệm"
      ariaHideApp={false}
    >
      <div className="modal-header">
        <h2>Kết quả xét nghiệm</h2>
        <button onClick={onClose} className="close-button">
          ×
        </button>
      </div>
      <div className="pdf-container">
        <iframe
          src={pdfUrl}
          width="100%"
          height="100%"
          style={{ border: 'none' }}
          title="Kết quả xét nghiệm"
        />
      </div>
      <div className="modal-footer">
        <button onClick={handlePrint} className="print-button">
          In kết quả
        </button>
      </div>
    </Modal>
  );
};

export default ResultModal;
import React, { useEffect } from 'react';
import Modal from 'react-modal';
import { Document, Page, Text, View, StyleSheet, PDFViewer, PDFDownloadLink, Font } from '@react-pdf/renderer';
import { Service } from '@/interface/ServiceInterface';
import { IPatient } from '@/interface/patientInterface';
import { DoctorInterface } from '@/interface/DoctorInterface';

Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: '/font/Roboto-Regular.ttf',
    },
    {
      src: '/font/Roboto-Bold.ttf',
      fontWeight: 'bold',
    },
  ],
});

// Styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Roboto',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottom: 1,
    paddingBottom: 10,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  patientCode: {
    fontSize: 12,
  },
  date: {
    fontSize: 12,
    marginTop: 5,
  },
  patientInfo: {
    marginTop: 20,
    marginBottom: 30,
    lineHeight: 1.2,
    fontSize: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  table: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '15%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#f0f0f0',
    padding: 5,
  },
  tableCol: {
    width: '85%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableCellHeader: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  tableCell: {
    fontSize: 12,
  },
  footer: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  doctorInfo: {
    fontSize: 12,
    textAlign: 'right',
  },
});

// PDF Document Component
const PrescriptionPDF = ({ 
  selectedServices, 
  patientInfo, 
  doctorInfo,
  currentDate 
}: { 
  selectedServices: Service[]; 
  patientInfo: IPatient | null; 
  doctorInfo: DoctorInterface | null;
  currentDate: string;
}) => (
  <Document>
    {selectedServices.map((service, serviceIndex) => (
        <Page key={service._id} size="A5" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.hospitalName}>BỆNH VIỆN ĐA KHOA LỤC LÂM</Text>
          <Text style={styles.date}>Ngày: {currentDate}</Text>
        </View>
        <Text style={styles.patientCode}>Mã BN: {patientInfo?.patientCode}</Text>
      </View>

      {/* Patient Info */}
      <View style={styles.patientInfo}>
        <Text>Họ và tên: {patientInfo?.userId.fullName}</Text>
        <Text>Ngày sinh: {new Date(patientInfo?.userId?.dateOfBirth ?? '').toLocaleDateString()}</Text>
      </View>

      {/* Title */}
      <View style={styles.title}>
        <Text>CHỈ ĐỊNH {service.name}</Text>
      </View>

      {/* Services Table */}
      <View style={styles.table}>
        {/* Table Header */}
        <View style={styles.tableRow}>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>STT</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCellHeader}>Nội dung chỉ định</Text>
          </View>
        </View>
        
        {/* Table Rows */}
       <View style={styles.tableRow}>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCell}>{serviceIndex + 1}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{service.name}</Text>
              {service.description && (
                <Text style={[styles.tableCell, { marginTop: 5 }]}>
                  {service.description}
                </Text>
              )}
            </View>
          </View>

      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View></View>
        {doctorInfo && (
          <View style={styles.doctorInfo}>
            <Text>Khoa: {doctorInfo.departmentId}</Text>
            <Text>Chuyên khoa: {(doctorInfo.specialtyId as any).name}</Text>
            <Text>Bác sĩ chỉ định: {doctorInfo.userId.fullName}</Text>
          </View>
        )}
      </View>
    </Page>
    ))}
  </Document>
);

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedServices: Service[];
  patientInfo: IPatient | null;
  doctorInfo: DoctorInterface | null;
  currentDate: string;
}

const PrescriptionModal: React.FC<PrescriptionModalProps> = ({
  isOpen,
  onClose,
  selectedServices,
  patientInfo,
  doctorInfo,
  currentDate
}) => {
    useEffect(() => {
        Modal.setAppElement('#modal-root');
    },[])
   
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="PDF Preview"
      className="pdf-modal"
      overlayClassName="pdf-modal-overlay"
    >
      <div className="modal-header">
        <h2>Xem trước chỉ định</h2>
        <button onClick={onClose} className="close-button">×</button>
      </div>
      
      <PDFViewer width="100%" height="500px">
        <PrescriptionPDF 
          selectedServices={selectedServices} 
          patientInfo={patientInfo} 
          doctorInfo={doctorInfo}
          currentDate={currentDate}
        />
      </PDFViewer>
      
      <div className="modal-footer">
        <PDFDownloadLink 
          document={
            <PrescriptionPDF 
              selectedServices={selectedServices} 
              patientInfo={patientInfo} 
              doctorInfo={doctorInfo}
              currentDate={currentDate}
            />
          } 
          fileName={`chidinh_${patientInfo?.patientCode}.pdf`}
        >
          {({ loading }) => (
            <button className="download-button" disabled={loading}>
              {loading ? 'Đang tạo PDF...' : 'Tải xuống PDF'}
            </button>
          )}
        </PDFDownloadLink>
        <button onClick={() => window.print()} className="print-pdf-button">
          In PDF
        </button>
      </div>
    </Modal>
  );
};

export default PrescriptionModal;
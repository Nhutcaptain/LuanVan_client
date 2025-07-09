'use client';

import { Page, Text, View, Document, StyleSheet, PDFViewer, Font } from '@react-pdf/renderer';
import { ExaminationFormData } from '@/interface/ExaminationInterface';
import { format } from 'date-fns';

// Đăng ký font nếu cần (ví dụ sử dụng font Unicode cho tiếng Việt)
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

// Tạo stylesheet
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Roboto',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 5,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    borderBottom: '1px solid #000',
    paddingBottom: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
    width: '30%',
  },
  value: {
    width: '70%',
  },
  prescriptionTable: {
    width: '100%',
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 5,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 5,
    borderBottom: '1px solid #ddd',
  },
  col1: {
    width: '30%',
  },
  col2: {
    width: '20%',
  },
  col3: {
    width: '20%',
  },
  col4: {
    width: '30%',
  },
  footer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

interface ExaminationPDFProps {
  data: ExaminationFormData;
  patientInfo: any;
  doctorName: any;
}

export const ExaminationPDF = ({ data, patientInfo, doctorName }: ExaminationPDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>BỆNH ÁN ĐIỆN TỬ</Text>
        <Text style={styles.subtitle}>PHÒNG KHÁM ĐA KHOA</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>THÔNG TIN BỆNH NHÂN</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Họ và tên:</Text>
          <Text style={styles.value}>{patientInfo?.userId.fullName || 'N/A'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Ngày sinh:</Text>
          <Text style={styles.value}>
            {patientInfo?.dateOfBirth ? format(new Date(patientInfo.dateOfBirth), 'dd/MM/yyyy') : 'N/A'}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Giới tính:</Text>
          <Text style={styles.value}>{patientInfo?.gender === 'male' ? 'Nam' : 'Nữ'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Địa chỉ:</Text>
          <Text style={styles.value}>{patientInfo?.address || 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>THÔNG TIN KHÁM BỆNH</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Ngày khám:</Text>
          <Text style={styles.value}>{format(new Date(data.date), 'dd/MM/yyyy')}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Bác sĩ:</Text>
          <Text style={styles.value}>{doctorName || 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>TRIỆU CHỨNG</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Chủ quan:</Text>
          <Text style={styles.value}>{data.subjective}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Khách quan:</Text>
          <Text style={styles.value}>{data.objective}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CHẨN ĐOÁN</Text>
        <Text>{data.assessment}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>KẾ HOẠCH ĐIỀU TRỊ</Text>
        <Text>{data.plan}</Text>
      </View>

      {data.prescriptions && data.prescriptions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ĐƠN THUỐC</Text>
          <View style={styles.prescriptionTable}>
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>Tên thuốc</Text>
              <Text style={styles.col2}>Liều lượng</Text>
              <Text style={styles.col3}>Tần suất</Text>
              <Text style={styles.col4}>Thời gian</Text>
            </View>
            {data.prescriptions.map((pres, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.col1}>{pres.medication}</Text>
                <Text style={styles.col2}>{pres.dosage}</Text>
                <Text style={styles.col3}>{pres.frequency}</Text>
                <Text style={styles.col4}>{pres.duration}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>THEO DÕI</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Ngày tái khám:</Text>
          <Text style={styles.value}>
            {data.followUp ? format(new Date(data.followUp), 'dd/MM/yyyy') : 'Không có'}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Ghi chú:</Text>
          <Text style={styles.value}>{data.notes || 'Không có'}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View>
          <Text>Bác sĩ điều trị</Text>
          <Text style={{ marginTop: 20 }}>{doctorName || 'N/A'}</Text>
        </View>
        <View>
          <Text>Ngày {format(new Date(), 'dd/MM/yyyy')}</Text>
        </View>
      </View>
    </Page>
  </Document>
);
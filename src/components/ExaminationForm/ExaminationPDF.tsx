"use client";

import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFViewer,
  Font,
} from "@react-pdf/renderer";
import { ExaminationFormData } from "@/interface/ExaminationInterface";
import { format } from "date-fns";
import { DoctorInterface } from "@/interface/DoctorInterface";
import { IPatient } from "@/interface/patientInterface";
import { AddressForm } from "@/interface/AddressForm";

Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "/font/Roboto-Regular.ttf",
    },
    {
      src: "/font/Roboto-Bold.ttf",
      fontWeight: "bold",
    },
    {
      src: "/font/Roboto-Italic.ttf",
      fontWeight: "normal",
      fontStyle: "italic",
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
    fontFamily: "Roboto",
    fontSize: 11,
    '@media print': {
      padding: 30,
      margin: 0,
    },
  },
  headerTitle: {
    textAlign: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold'
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  hospitalName: {
    fontSize: 12,
    fontWeight: "bold",
  },
  patientCode: {
    fontSize: 11,
  },
  section: {
    marginBottom: 10, // Giảm khoảng cách giữa các section
  },
  patientInfo: {
    flexDirection: "column",
    marginBottom: 10,
    borderBottom: "1px solid #000",
    paddingBottom: 8,
  },
  patientInfoRow: {
    flexDirection: "row",
    marginBottom: 3,
    alignItems: "center",
  },
  patientInfoLabel: {
    fontWeight: "bold",
    width: 70, // Giảm độ rộng của label
    marginRight: 5,
  },
  patientInfoContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    flex: 1,
  },
  infoItem: {
    marginRight: 15, // Khoảng cách giữa các thông tin trên cùng hàng
  },
  doctorInfo: {
    flexDirection: "column",
    marginBottom: 10,
    borderBottom: "1px solid #000",
    paddingBottom: 8,
  },
  diagnosis: {
    marginBottom: 10,
    borderBottom: "1px solid #000",
    paddingBottom: 8,
  },
  diagnosisTitle: {
    fontWeight: "bold",
    marginBottom: 3,
  },
  prescriptionTable: {
    width: "100%",
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    padding: 3,
    fontWeight: "bold",
    borderBottom: "1px solid #ddd",
    fontSize: 10, // Giảm font size cho header bảng
  },
  tableRow: {
    flexDirection: "row",
    padding: 3,
    borderBottom: "1px solid #ddd",
    fontSize: 10, // Giảm font size cho nội dung bảng
  },
  colIndex: {
    width: "10%",
    textAlign: "center",
  },
  colMedication: {
    width: "40%",
  },
  colDate: {
    width: "25%",
  },
  colQuantity: {
    width: "25%",
    textAlign: "center",
  },
  medicationName: {
    fontWeight: "bold",
  },
  dosage: {
    fontStyle: "italic",
  },
  footer: {
    flexDirection: "column",
    alignItems: "flex-end",
    marginTop: 20,
  },
  examDate: {
    marginBottom: 20,
  },
  doctorSignature: {
    flexDirection: "column",
    alignItems: "flex-end",
    marginBottom: 20,
  },
  signatureLabel: {
    textAlign: "center",
    marginRight: 50,
    marginBottom: 50, // Khoảng cách giữa "Bác sĩ điều trị" và đường kẻ
  },
  signatureLine: {
    width: 200,
    borderTop: "1px solid #000",
    marginBottom: 5,
  },
  doctorName: {
    textAlign: "center",
    width: 200, // Cùng độ rộng với đường kẻ
  },
  followUp: {
    flexDirection: "column",
    alignItems: "flex-start",
    fontStyle: "italic",
    fontWeight: 'bold',
    fontSize: 10, // Giảm font size cho phần tái khám
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%'
  },
  leftSection: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'left'
  },
  rightSection: {
    flex: 1,
    textAlign: 'right'
  },
});

interface ExaminationPDFProps {
  data: ExaminationFormData;
  patientInfo: IPatient | undefined;
  doctorInfo: DoctorInterface | null;
}

export const ExaminationPDF = ({
  data,
  patientInfo,
  doctorInfo,
}: ExaminationPDFProps) => {
  const calculateAge = (dateOfBirth: string | Date) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatAddress = (address: AddressForm | string | undefined): string => {
    if (!address) return "N/A";

    if (typeof address === "string") return address;

    const parts = [];
    if (address.houseNumber) parts.push(address.houseNumber);
    if (address.ward?.name) parts.push(address.ward.name);
    if (address.district?.name) parts.push(address.district.name);
    if (address.province?.name) parts.push(address.province.name);

    return parts.join(", ") || "N/A";
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with hospital name and patient code */}
        <View style={styles.headerTitle}>
          <Text style={styles.title}>PHIẾU KHÁM</Text>
        </View>
        <View style={styles.header}>
          <Text style={styles.hospitalName}>Bệnh viện Lục Lâm</Text>
          <Text style={styles.patientCode}>
            Mã BN: {patientInfo?.patientCode || "N/A"}
          </Text>
        </View>

        {/* Patient information */}
        <View style={styles.patientInfo}>
          <Text style={{ fontWeight: "bold", marginBottom: 3 }}>
            Thông tin bệnh nhân
          </Text>
          <View style={styles.patientInfoRow}>
            <Text style={styles.patientInfoLabel}>Bệnh nhân:</Text>
            <View style={styles.patientInfoContent}>
              <Text style={styles.infoItem}>
                {patientInfo?.userId.fullName || "N/A"}
              </Text>
              <Text style={styles.infoItem}>
                Giới tính:{" "}
                {patientInfo?.userId.gender === "male" ? "Nam" : "Nữ"}
              </Text>
              <Text style={styles.infoItem}>
                Tuổi:{" "}
                {patientInfo?.userId.dateOfBirth
                  ? calculateAge(patientInfo.userId.dateOfBirth)
                  : "N/A"}
              </Text>
            </View>
          </View>
          <View style={styles.patientInfoRow}>
            <Text style={styles.patientInfoLabel}>Liên hệ:</Text>
            <View style={styles.patientInfoContent}>
              <Text style={styles.infoItem}>
                ĐT: {patientInfo?.userId.phone || "N/A"}
              </Text>
              <Text style={styles.infoItem}>
                Địa chỉ: {formatAddress(patientInfo?.userId.address)}
              </Text>
            </View>
          </View>
        </View>

        {/* Doctor information */}
        <View style={styles.doctorInfo}>
          <Text style={{ fontWeight: "bold", marginBottom: 3 }}>
            Thông tin bác sĩ
          </Text>
          <View style={styles.patientInfoRow}>
            <Text style={styles.patientInfoLabel}>Bác sĩ:</Text>
            <Text>{doctorInfo?.userId.fullName || "N/A"}</Text>
          </View>
          <View style={styles.patientInfoRow}>
            <Text style={styles.patientInfoLabel}>Chuyên khoa:</Text>
            <Text>{doctorInfo?.departmentId ? (doctorInfo.departmentId as any).name : 'N/A'}</Text>
          </View>
        </View>

        {/* Diagnosis */}
        <View style={styles.diagnosis}>
          <Text style={styles.diagnosisTitle}>Chẩn đoán:</Text>
          <Text>{data.assessment}</Text>
        </View>

        {/* Prescription table */}
        {data.prescriptions && data.prescriptions.length > 0 && (
          <View style={styles.section}>
            <Text style={{ fontWeight: "bold", marginBottom: 3 }}>
              Đơn thuốc
            </Text>
            <View style={styles.prescriptionTable}>
              <View style={styles.tableHeader}>
                <Text style={styles.colIndex}>STT</Text>
                <Text style={styles.colMedication}>Thuốc</Text>
                <Text style={styles.colDate}>Ngày dùng</Text>
                <Text style={styles.colQuantity}>Số lượng</Text>
              </View>
              {data.prescriptions.map((pres, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.colIndex}>{index + 1}</Text>
                  <View style={styles.colMedication}>
                    <Text style={styles.medicationName}>{pres.medication}</Text>
                    <Text style={styles.dosage}>{pres.dosage}</Text>
                  </View>
                  <Text style={styles.colDate}>{pres.duration}</Text>
                  <Text style={styles.colQuantity}>
                    {pres.quantity} {pres.unit || ""}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.examDate}>
            Ngày khám: {format(new Date(data.date), "dd/MM/yyyy")}
          </Text>

          <View style={styles.doctorSignature}>
            <Text style={styles.signatureLabel}>Bác sĩ điều trị</Text>
            <Text style={styles.doctorName}>
              {doctorInfo?.userId.fullName || "N/A"}
            </Text>
          </View>

          <View style={styles.container}>
            <View style={styles.leftSection}>
              <Text>Số hoá đơn: {data.invoiceNumber}</Text>
            </View>

            <View style={styles.rightSection}>
              <Text style={styles.followUp}>
                Ngày tái khám:{" "}
                {data.followUp
                  ? format(new Date(data.followUp), "dd/MM/yyyy")
                  : "Không có"}
              </Text>
              <Text style={styles.followUp}>
                Khi đi tái khám, nhớ mang đơn này
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

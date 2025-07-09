'use client';

import { PDFDownloadLink } from '@react-pdf/renderer';
import { ExaminationFormData } from '@/interface/ExaminationInterface';
import { IPatient } from '@/interface/patientInterface';
import { ExaminationPDF } from '@/components/ExaminationForm/ExaminationPDF';

interface PDFDownloadButtonProps {
  examinationData: ExaminationFormData;
  patientInfo?: IPatient;
  doctorName?: string | null;
}

const PDFDownloadButton = ({
  examinationData,
  patientInfo,
  doctorName
}: PDFDownloadButtonProps) => {
  if (typeof window === 'undefined') return null;

  return (
    <PDFDownloadLink
      document={
        <ExaminationPDF
          data={examinationData}
          patientInfo={patientInfo}
          doctorName={doctorName}
        />
      }
      fileName={`benh_an_${patientInfo?.userId.fullName || 'unknown'}_${new Date(
        examinationData.date
      ).toISOString().split('T')[0]}.pdf`}
    >
      {({ loading }) => (
        <button
        type='button'
          className={`px-4 py-2 rounded-md ${
            loading ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
          disabled={loading}
        >
          {loading ? 'Đang tạo...' : 'Tải về PDF'}
        </button>
      )}
    </PDFDownloadLink>
  );
};

export default PDFDownloadButton;

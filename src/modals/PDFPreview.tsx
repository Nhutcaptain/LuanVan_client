'use client';

import { PDFViewer } from '@react-pdf/renderer';
import { ExaminationFormData } from '@/interface/ExaminationInterface';
import { IPatient } from '@/interface/patientInterface';
import { ExaminationPDF } from '@/components/ExaminationForm/ExaminationPDF';

interface PDFPreviewProps {
  data: ExaminationFormData;
  patientInfo?: IPatient;
  doctorName?: string | null;
}

const PDFPreview = ({ data, patientInfo, doctorName }: PDFPreviewProps) => {
  return (
    <PDFViewer width="100%" height="500px" showToolbar={false}>
      <ExaminationPDF data={data} patientInfo={patientInfo} doctorName={doctorName} />
    </PDFViewer>
  );
};

export default PDFPreview;

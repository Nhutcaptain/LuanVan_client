'use client';

import { PDFViewer } from '@react-pdf/renderer';
import { ExaminationFormData } from '@/interface/ExaminationInterface';
import { IPatient } from '@/interface/patientInterface';
import { ExaminationPDF } from '@/components/ExaminationForm/ExaminationPDF';
import { DoctorInterface } from '@/interface/DoctorInterface';

interface PDFPreviewProps {
  data: ExaminationFormData;
  patientInfo?: IPatient;
  doctorName?: string | null;
  doctorInfo: DoctorInterface | null;
}

const PDFPreview = ({ data, patientInfo, doctorName, doctorInfo }: PDFPreviewProps) => {
  return (
    <PDFViewer width="100%" height="500px" showToolbar={false}>
      <ExaminationPDF data={data} patientInfo={patientInfo} doctorInfo={doctorInfo} />
    </PDFViewer>
  );
};

export default PDFPreview;

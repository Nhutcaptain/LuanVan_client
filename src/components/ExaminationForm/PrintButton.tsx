"use client";

import { ExaminationPDF } from "@/components/ExaminationForm/ExaminationPDF";
import { pdf } from "@react-pdf/renderer";
import { ExaminationFormData } from "@/interface/ExaminationInterface";
import { IPatient } from "@/interface/patientInterface";
import { DoctorInterface } from "@/interface/DoctorInterface";
import { toast, ToastContainer } from "react-toastify";
import { div } from "framer-motion/client";

interface PrintButtonProps {
  data: ExaminationFormData;
  patientInfo?: IPatient;
  doctorInfo: DoctorInterface | null;
}

export const PrintButton = ({
  data,
  patientInfo,
  doctorInfo,
}: PrintButtonProps) => {
  
  const handlePrint = async () => {
    const blob = await pdf(
      <ExaminationPDF
        data={data}
        patientInfo={patientInfo}
        doctorInfo={doctorInfo}
      />
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url);
    if (printWindow) {
      printWindow.addEventListener("load", () => {
        printWindow.focus();
        printWindow.print();
      });
    }
  };

  return (
    <div>
      <button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-white">
        In phiếu khám
      </button>
      <ToastContainer></ToastContainer>
    </div>
  );
};

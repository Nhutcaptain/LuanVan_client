'use client';

import { useState, useEffect } from 'react';
import { ExaminationFormData } from '@/interface/ExaminationInterface';
import { IPatient } from '@/interface/patientInterface';
import dynamic from 'next/dynamic';
import PDFDownloadButton from './PDFDownloadLink';

interface PDFExportDialogProps {
  open: boolean;
  onClose: () => void;
  examinationData: ExaminationFormData;
  patientInfo?: IPatient;
}

const PDFPreview = dynamic(() => import('./PDFPreview'), { ssr: false });

export const PDFExportDialog = ({
  open,
  onClose,
  examinationData,
  patientInfo,
}: PDFExportDialogProps) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const doctorName = typeof window !== 'undefined' ? localStorage.getItem('fullName') : '';

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Xuất bệnh án</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="p-6 overflow-auto flex-grow">
          <div className="mb-6">
            <p className="text-green-600 font-medium mb-2">Hồ sơ đã được lưu thành công!</p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="font-semibold">Bệnh nhân:</p>
                <p>{patientInfo?.userId.fullName || 'N/A'}</p>
              </div>
              <div>
                <p className="font-semibold">Ngày khám:</p>
                <p>{new Date(examinationData.date).toLocaleDateString('vi-VN')}</p>
              </div>
            </div>
          </div>

          {isClient && (
            <div className="border rounded-md overflow-hidden mb-6">
              <PDFPreview
                data={examinationData}
                patientInfo={patientInfo}
                doctorName={doctorName}
              />
            </div>
          )}
        </div>

        <div className="p-4 border-t flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            Đóng
          </button>
          {isClient && (
           <PDFDownloadButton
            examinationData={examinationData}
            doctorName={doctorName}
            patientInfo={patientInfo}
           ></PDFDownloadButton>
          )}
        </div>
      </div>
    </div>
  );
};

'use client';
import { useEffect, useState } from 'react';
import { ExaminationFormData, PrescriptionItem } from '@/interface/ExaminationInterface';
import PrescriptionForm from '../PrescriptionForm/PrescriptionForm';
import './styles.css'
import PatientInfoLookup from '../PatientInfoLookup/PatientInfoLookup';
import {jwtDecode} from 'jwt-decode';
import InputComponent from '../InputComponent/InputComponent';
import { PDFExportDialog } from '@/modals/PDFExportModal';
import { Service } from '@/interface/ServiceInterface';
import { IPatient } from '@/interface/patientInterface';
import { div } from 'framer-motion/client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface DecodedToken {
  userId?: string;
  // Add other properties if needed
}


interface ExaminationFormProps {
  doctorId: string;
  onSubmit: (data: ExaminationFormData) => void;
  isSubmitting?: boolean;
  selectedPatient: string;
  onPatientInfo: (patient: IPatient) => void;
  selectedServices: Service[];
  onSaveTerm: (data: ExaminationFormData) => void;
  initialExamination?: ExaminationFormData;
}

export default function ExaminationForm({ 
  doctorId,
  onSubmit,
  onSaveTerm,
  isSubmitting = false,
  selectedPatient,
  onPatientInfo,
  selectedServices,
  initialExamination
 
}: ExaminationFormProps) {
  const [formData, setFormData] = useState<Omit<ExaminationFormData, 'prescriptions'>>({
    date: new Date().toISOString().split('T')[0],
    subjective: '',
    patientCode:'',
    objective: '',
    assessment: '',
    testOrders: [{
      serviceId: '',
      status: '',
      resultFile: '',
    }],
    status: '',
    plan: '',
    notes: '',
    patientId: '',
    followUp: new Date(),
    doctorId: doctorId,
  });

  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([]);
  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [showPDFExportDialog, setShowPDFExportDialog] = useState(false);
  const [pdfData, setPdfData] = useState<ExaminationFormData>();
  const [newPrescription, setNewPrescription] = useState<PrescriptionItem>({
    medication: '',
    dosage: '',
    frequency: '',
    duration: ''
  });

  useEffect(() => {
    const updatedTestOrders = selectedServices.map(service => ({
      serviceId: service._id,
      status: 'ordered', 
      resultFile: '',
    }));

    setFormData(prev => ({
      ...prev,
      doctorId,
      testOrders: updatedTestOrders,
    }));
  },[selectedServices])

useEffect(() => {
    if (initialExamination) {
      setFormData(initialExamination);
      if (initialExamination.prescriptions) {
        setPrescriptions(initialExamination.prescriptions);
      }
    } else {
      // Reset form when no initial examination
      setFormData({
        date: new Date().toISOString().split('T')[0],
        subjective: '',
        patientCode: '',
        objective: '',
        assessment: '',
        testOrders: [],
        status: '',
        plan: '',
        notes: '',
        patientId: selectedPatient,
        followUp: new Date(),
        doctorId: doctorId,
      });
      setPrescriptions([]);
    }
  }, [initialExamination, doctorId, selectedPatient]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePrescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewPrescription(prev => ({ ...prev, [name]: value }));
  };

  const addPrescription = () => {
    if (Object.values(newPrescription).every(val => val.trim() !== '')) {
      setPrescriptions(prev => [...prev, newPrescription]);
      setNewPrescription({
        medication: '',
        dosage: '',
        frequency: '',
        duration: ''
      });
    }
  };

  const removePrescription = (index: number) => {
    setPrescriptions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveTemp = () => {
    onSaveTerm({
      ...formData,
      prescriptions
    })
    console.log(formData);

  }

  const validateForm = (requiredFields: string[]): boolean => {
  for (const field of requiredFields) {
    const value = (formData as Record<string, any>)[field];
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      const fieldNames: Record<string, string> = {
        date: 'Ngày khám',
        subjective: 'Triệu chứng chủ quan',
        objective: 'Triệu chứng khách quan',
        assessment: 'Chẩn đoán',
        plan: 'Kế hoạch điều trị',
        followUp: 'Ngày tái khám',
      };
      toast.error(`Vui lòng nhập: ${fieldNames[field] || field}`);
      return false;
    }
  }
  return true;
};

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const requiredFields = ['date', 'subjective', 'objective', 'assessment', 'plan', 'followUp'];
    if (!validateForm(requiredFields)) return;
    onSubmit({
      ...formData,
      prescriptions,
    });
    setFormData({
      date: new Date().toISOString().split('T')[0],
    subjective: '',
    patientCode:'',
     testOrders: [{
      serviceId: '',
      status: '',
      resultFile: '',
    }],
    status: '',
    objective: '',
    assessment: '',
    plan: '',
    notes: '',
    patientId: '',
    });
    setNewPrescription({
      medication: '',
        dosage: '',
        frequency: '',
        duration: ''
    });
    setPrescriptions([]);
    setPdfData({...formData, prescriptions})
    setShowPDFExportDialog(true);
  };

  const handlePatientSelect = (patient: any) => {
    onPatientInfo(patient);
    if(patient) {
      setFormData(prev => ({
      ...prev,
      patientId: patient.userId._id,
      patientCode: patient.patientCode,
    }));
    setPatientInfo(patient);
    }
  };

  return (
    <div>
      <form  className="examination-form">
      <div className="form-section">
        <h2>Thông Tin Khám Bệnh</h2>
        <PatientInfoLookup onPatientSelect={handlePatientSelect} patientId={selectedPatient}/>
        <div className="form-group">
          <label htmlFor="date">Ngày Khám</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-section">
        <h2>Triệu Chứng</h2>
        <div className="form-group">
          <label htmlFor="subjective">Triệu Chứng Chủ Quan</label>
          <textarea
            id="subjective"
            name="subjective"
            value={formData.subjective}
            onChange={handleChange}
            rows={5}
            required
            placeholder="Bệnh nhân mô tả triệu chứng..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="objective">Triệu Chứng Khách Quan</label>
          <textarea
            id="objective"
            name="objective"
            value={formData.objective}
            onChange={handleChange}
            rows={5}
            required
            placeholder="Kết quả thăm khám, xét nghiệm..."
          />
        </div>
      </div>

      <div className="form-section">
        <h2>Chẩn Đoán & Kế Hoạch</h2>
        <div className="form-group">
          <label htmlFor="assessment">Chẩn Đoán</label>
          <textarea
            id="assessment"
            name="assessment"
            value={formData.assessment}
            onChange={handleChange}
            rows={3}
            placeholder="Chẩn đoán bệnh..."
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="plan">Kế Hoạch Điều Trị</label>
          <textarea
            id="plan"
            name="plan"
            value={formData.plan}
            onChange={handleChange}
            rows={3}
            placeholder="Phác đồ điều trị..."
          />
        </div>
      </div>

      <div className="form-section">
        <h2>Kê Đơn Thuốc</h2>
        <div className="prescription-input-group">
          <input
            type="text"
            name="medication"
            placeholder="Tên thuốc"
            value={newPrescription.medication}
            onChange={handlePrescriptionChange}
            required
          />
          <input
            type="text"
            name="dosage"
            placeholder="Liều lượng"
            value={newPrescription.dosage}
            onChange={handlePrescriptionChange}
            required
          />
          <input
            type="text"
            name="frequency"
            placeholder="Tần suất"
            value={newPrescription.frequency}
            onChange={handlePrescriptionChange}
            required
          />
          <input
            type="text"
            name="duration"
            placeholder="Thời gian"
            value={newPrescription.duration}
            onChange={handlePrescriptionChange}
            required
          />
          <button 
            type="button" 
            onClick={addPrescription}
            className="add-prescription-btn"
          >
            Thêm Thuốc
          </button>
        </div>

        {prescriptions.length > 0 && (
          <div className="prescription-list">
            <h3>Danh Sách Thuốc Đã Kê</h3>
            {prescriptions.map((item, index) => (
              <PrescriptionForm
                key={index}
                item={item}
                index={index}
                onRemove={() => removePrescription(index)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="form-group">
          <label htmlFor="date">Ngày Tái Khám</label>
          <input
            type="date"
            id="date"
            name="followUp"
            value={formData.followUp instanceof Date ? formData.followUp.toISOString().split('T')[0] : formData.followUp || ''}
            onChange={handleChange}
            required
          />
        </div>

      <div className="form-group">
        <label htmlFor="notes">Ghi Chú Thêm</label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={2}
          placeholder="Ghi chú khác..."
        />
      </div>
        
      <div className="btn-group">
        <button 
          type='submit'
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="submit-btn"
        >
          {isSubmitting ? 'Đang Lưu...' : 'Lưu Hồ Sơ Khám Bệnh'}
        </button>
        <button className='submit-btn' onClick={handleSaveTemp} type='button'>
          Lưu để chờ kết quả xét nghiệm
        </button>
      </div>
      {pdfData && (
        <PDFExportDialog
          open={showPDFExportDialog}
          onClose={() => setShowPDFExportDialog(false)}
          examinationData={pdfData}
          patientInfo={patientInfo}
        />
      )}
    </form>
    <ToastContainer></ToastContainer>
    </div>
  );
}
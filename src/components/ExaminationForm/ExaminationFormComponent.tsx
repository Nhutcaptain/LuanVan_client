'use client';

import { useEffect, useState } from 'react';
import { ExaminationFormData, PrescriptionItem } from '@/interface/ExaminationInterface';
import PrescriptionForm from '../PrescriptionForm/PrescriptionForm';
import './styles.css'
import PatientInfoLookup from '../PatientInfoLookup/PatientInfoLookup';
import {jwtDecode} from 'jwt-decode';

interface DecodedToken {
  userId?: string;
  // Add other properties if needed
}

const getDoctorIdFromToken = () => {
  try{
    const token = localStorage.getItem('token');
    if(!token) return '';
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded.userId;
  }catch(error) {
    console.error('Không thể decode toke', error);
    return '';
  }
}


interface ExaminationFormProps {

  onSubmit: (data: ExaminationFormData) => void;
  isSubmitting?: boolean;
}

export default function ExaminationForm({ 
 
  onSubmit,
  isSubmitting = false 
}: ExaminationFormProps) {
  const [formData, setFormData] = useState<Omit<ExaminationFormData, 'prescriptions'>>({
    date: new Date().toISOString().split('T')[0],
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
    notes: '',
    patientId: '',
    doctorId: getDoctorIdFromToken(),
  });

  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([]);
  const [newPrescription, setNewPrescription] = useState<PrescriptionItem>({
    medication: '',
    dosage: '',
    frequency: '',
    duration: ''
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      prescriptions,
    });
    setFormData({
      date: new Date().toISOString().split('T')[0],
    subjective: '',
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
  };

  const handlePatientSelect = (patient: any) => {
    console.log("In the handle patient select:", patient)
    if(patient) {
      setFormData(prev => ({
      ...prev,
      patientId: patient.userId,
    }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="examination-form">
      <div className="form-section">
        <h2>Thông Tin Khám Bệnh</h2>
        <PatientInfoLookup onPatientSelect={handlePatientSelect} />
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
            required
            placeholder="Chẩn đoán bệnh..."
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
            required
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
          />
          <input
            type="text"
            name="dosage"
            placeholder="Liều lượng"
            value={newPrescription.dosage}
            onChange={handlePrescriptionChange}
          />
          <input
            type="text"
            name="frequency"
            placeholder="Tần suất"
            value={newPrescription.frequency}
            onChange={handlePrescriptionChange}
          />
          <input
            type="text"
            name="duration"
            placeholder="Thời gian"
            value={newPrescription.duration}
            onChange={handlePrescriptionChange}
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

      <button 
        type="submit" 
        disabled={isSubmitting}
        className="submit-btn"
      >
        {isSubmitting ? 'Đang Lưu...' : 'Lưu Hồ Sơ Khám Bệnh'}
      </button>
    </form>
  );
}
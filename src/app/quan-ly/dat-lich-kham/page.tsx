'use client'
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import './styles.css';
import SelectComponent from '@/components/SelectComponent/SelectComponent';
import { IUser } from '@/interface/usermodel';
import api from '@/lib/axios';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import InputComponent from '@/components/InputComponent/InputComponent';

interface Department {
  _id: string;
  name: string;
}

interface Specialty {
  _id: string;
  name: string;
  departmentId: string;
}

interface Doctor {
  _id: string;
  name: string;
  specialtyId: string;
  departmentId: string;
}

interface AvailableDate {
  date: string;
  availableSlots: {
    morning: boolean;
    afternoon: boolean;
  };
}

const AppointmentPage = () => {
  const router = useRouter();
  const [patient, setPatient] = useState<IUser | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
  
  const [formData, setFormData] = useState({
    departmentId: '',
    specialtyId: '',
    doctorId: '',
    appointmentDate: '',
    session: '',
    reason: '',
    agreeTerms: false,
  });

  const [loading, setLoading] = useState({
    patient: true,
    departments: true,
    specialties: false,
    doctors: false,
    dates: false,
    submitting: false,
  });

  // Fetch patient data from backend
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await api.get('/auth/me');
        
        if (res.status === 200) {
          setPatient(res.data);
        } else {
          throw new Error('Failed to fetch patient');
        }
      } catch (err) {
        console.error('Failed to fetch patient:', err);
        toast.error('Không thể tải thông tin bệnh nhân');
      } finally {
        setLoading(prev => ({ ...prev, patient: false }));
      }
    };

    fetchPatient();
  }, []);

  // Fetch departments from backend
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get('/department/getAllDepartment');
        
        if (res.status === 200) {
          setDepartments(res.data);
        } else {
          throw new Error('Failed to fetch departments');
        }
      } catch (err) {
        console.error('Failed to fetch departments:', err);
        toast.error('Không thể tải danh sách khoa');
      } finally {
        setLoading(prev => ({ ...prev, departments: false }));
      }
    };

    fetchDepartments();
  }, []);

  // Fetch specialties when department is selected
  useEffect(() => {
    if (!formData.departmentId) {
      setSpecialties([]);
      setFormData(prev => ({ ...prev, specialtyId: '', doctorId: '' }));
      return;
    }

    const fetchSpecialties = async () => {
      try {
        setLoading(prev => ({ ...prev, specialties: true }));
        const res = await api.get(`/department/getAllSpecialtyByDepartmentId/${formData.departmentId}`);
        
        if (res.status === 200) {
          setSpecialties(res.data);
        } else {
          throw new Error('Failed to fetch specialties');
        }
      } catch (err) {
        console.error('Failed to fetch specialties:', err);
        toast.error('Không thể tải danh sách chuyên khoa');
      } finally {
        setLoading(prev => ({ ...prev, specialties: false }));
      }
    };

    fetchSpecialties();
  }, [formData.departmentId]);

  // Fetch doctors when either department or specialty is selected
  useEffect(() => {
    if (!formData.specialtyId) {
      setDoctors([]);
      setFormData(prev => ({ ...prev, doctorId: '' }));
      return;
    }

    const fetchDoctors = async () => {
      try {
        setLoading(prev => ({ ...prev, doctors: true }));
        const res = await api.get(`/doctors/getDoctorBySpecialtyId/${formData.specialtyId}`);
        
        if (res.status === 200) {
          setDoctors(res.data);
        } else {
          throw new Error('Failed to fetch doctors');
        }
      } catch (err) {
        console.error('Failed to fetch doctors:', err);
        toast.error('Không thể tải danh sách bác sĩ');
      } finally {
        setLoading(prev => ({ ...prev, doctors: false }));
      }
    };

    fetchDoctors();
  }, [formData.departmentId, formData.specialtyId]);

  // Fetch available dates when doctor is selected
  useEffect(() => {
    if (!formData.doctorId) {
      setAvailableDates([]);
      setFormData(prev => ({ ...prev, appointmentDate: '', session: '' }));
      return;
    }

    const fetchAvailableDates = async () => {
      try {
        setLoading(prev => ({ ...prev, dates: true }));
        const res = await api.get(`/appointment/availability?doctorId=${formData.doctorId}`);
        
        if (res.status === 200) {
          setAvailableDates(res.data);
        } else {
          throw new Error('Failed to fetch available dates');
        }
      } catch (err) {
        console.error('Failed to fetch available dates:', err);
        toast.error('Không thể tải ngày khám khả dụng');
      } finally {
        setLoading(prev => ({ ...prev, dates: false }));
      }
    };

    fetchAvailableDates();
  }, [formData.doctorId]);

  const handleChange = (
  e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
) => {
  const { name, value, type } = e.target;

  // Nếu là checkbox, dùng checked; còn lại dùng value
  const newValue = type === 'checkbox'
    ? (e.target as HTMLInputElement).checked
    : type === 'date'
    ? new Date(value).toISOString().split('T')[0] // giữ định dạng yyyy-mm-dd
    : value;

  setFormData(prev => ({
    ...prev,
    [name]: newValue
  }));
};


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreeTerms) {
      toast.error('Vui lòng đồng ý với điều khoản và dịch vụ');
      return;
    }

    try {
      setLoading(prev => ({ ...prev, submitting: true }));
      console.log(formData)
      
      const res = await api.post('/appointment/createAppointment', {
        patientId: patient?._id,
        doctorId: formData.doctorId,
        departmentId: formData.departmentId,
        specialtyId: formData.specialtyId,
        appointmentDate: formData.appointmentDate,
        session: formData.session,
        reason: formData.reason,
      });

      if (res.status === 201) {
        toast.success('Đặt lịch hẹn thành công!');
      } else {
        throw new Error(res.data.message || 'Failed to create appointment');
      }
    } catch (err: any) {
      console.error('Failed to submit appointment:', err);
      toast.error(err.message || 'Đặt lịch hẹn thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  };

  if (loading.patient || loading.departments) {
    return (
      <div className="container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="container">
        <div className="error-message">Không tìm thấy thông tin bệnh nhân</div>
      </div>
    );
  }

  const selectedDateAvailability = availableDates.find(
    d => d.date === formData.appointmentDate
  );

  return (
    <div className="container">
      <h1 className="page-title">ĐẶT LỊCH HẸN KHÁM BỆNH</h1>
      
      {/* Patient information section */}
      <div className="patient-info-section">
        <h2 className="section-title">THÔNG TIN BỆNH NHÂN</h2>
        <div className="patient-info-grid">
          <div className="info-item">
            <label className="info-label">Họ và tên:</label>
            <p className="info-value">{patient.fullName}</p>
          </div>
          <div className="info-item">
            <label className="info-label">Email:</label>
            <p className="info-value">{patient.email}</p>
          </div>
          <div className="info-item">
            <label className="info-label">Số điện thoại:</label>
            <p className="info-value">{patient.phone}</p>
          </div>
          {patient.address && (
            <div className="info-item">
              <label className="info-label">Địa chỉ:</label>
              <div className="address-details">
                {patient.address.houseNumber && <span>{patient.address.houseNumber}, </span>}
                <span>{patient.address.ward.name}, </span>
                <span>{patient.address.district.name}, </span>
                <span>{patient.address.province.name}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Appointment form */}
      <form onSubmit={handleSubmit} className="appointment-form">
        <h2 className="section-title">THÔNG TIN ĐẶT LỊCH</h2>
        
        <div className="form-grid">
          <div className="form-column">
            <SelectComponent
              label="Khoa*"
              name="departmentId"
              value={formData.departmentId}
              onChange={handleChange}
              options={departments.map(dept => ({
                label: dept.name,
                value: dept._id
              }))}
              required
            />

            <SelectComponent
              label="Chuyên khoa"
              name="specialtyId"
              value={formData.specialtyId}
              onChange={handleChange}
              options={specialties.map(spec => ({
                label: spec.name,
                value: spec._id
              }))}
              disabled={!formData.departmentId || loading.specialties}
            />
          </div>

          <div className="form-column">
            <SelectComponent
              label="Bác sĩ*"
              name="doctorId"
              value={formData.doctorId}
              onChange={handleChange}
              options={doctors.map(doctor => ({
                label: doctor.name,
                value: doctor._id
              }))}
              disabled={(!formData.departmentId && !formData.specialtyId) || loading.doctors}
              required
            />
          </div>
        </div>

        <div className="date-session-container">
          <div className="date-picker">
            <InputComponent
                onChange={handleChange}
                value={formData.appointmentDate}
                type='date'
                name='appointmentDate'
            ></InputComponent>
          </div>

          {formData.appointmentDate && (
            <div className="session-picker">
              <label className="session-label">Buổi khám*</label>
              <div className="session-options">
                <label className={`session-option `}>
                  <input
                    type="radio"
                    name="session"
                    value="morning"
                    checked={formData.session === 'morning'}
                    onChange={handleChange}
                    className="session-radio"
                    
                    required
                  />
                  <span className="session-text">Buổi sáng (8:00 - 12:00)</span>
                 
                </label>
                <label className={`session-option `}>
                  <input
                    type="radio"
                    name="session"
                    value="afternoon"
                    checked={formData.session === 'afternoon'}
                    onChange={handleChange}
                    className="session-radio"
                    
                    required
                  />
                  <span className="session-text">Buổi chiều (13:00 - 17:00)</span>
                  
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="reason" className="form-label">
            Triệu chứng/Lý do khám
          </label>
          <textarea
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            className="form-textarea"
            rows={4}
            placeholder="Mô tả triệu chứng hoặc lý do khám của bạn..."
          />
        </div>

        <div className="terms-agreement">
          <label className="terms-label">
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              className="terms-checkbox"
              required
            />
            <span className="terms-text">Tôi đồng ý với <a href="/terms" className="terms-link">điều khoản và dịch vụ</a></span>
          </label>
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={loading.submitting}
        >
          {loading.submitting ? (
            <span className="button-loading">ĐANG XỬ LÝ...</span>
          ) : (
            <span>ĐẶT LỊCH NGAY</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default AppointmentPage;
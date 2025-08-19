'use client'
import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { FaCheckCircle, FaCalendarAlt, FaUserMd, FaHospital, FaClock, FaInfoCircle, FaTimes, FaTrash } from 'react-icons/fa';
import './styles.css';
import { useSocket } from '@/hook/useSocket';
import Swal from 'sweetalert2';

interface Appointment {
  _id: string;
  patientId: string;
  doctorId: {
    _id: string;
    userId: {
      fullName: string;
      email: string;
      phone: string;
    }
  };
  appointmentDate: string;
  session: string;
  queueNumber: number;
  departmentId: {
    name: string;
    _id: string;
  };
  status: "scheduled" | "completed" | "cancelled" | 'waiting_result' | 'pending';
  reason?: string;
  cancelReason?: string;
  examinationId: string;
  confirmStatus: 'pending' | "confirmed" | "rejected";
}

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [patientId, setPatientId] = useState('');
  const router = useRouter();

  const { socket, joinRoom, leaveRoom } = useSocket("http://localhost:5000", {
    eventHandlers: {
      "appointment-status-completed": (appointmentId: string) => {
        Swal.fire({
          title: "Quá trình khám hoàn tất",
          text: 'Quá trình khám của bạn đã hoàn tất',
          icon: 'success',
          showConfirmButton: true,
        })
        setAppointments((prev) =>
          prev.map((app) =>
            app._id === appointmentId ? { ...app, status: 'completed' } : app
          )
        )
      },
      "appointment-status-updated": (updatedAppointment: Appointment) => {
        setAppointments((prev) =>
          prev.map((app) =>
            app._id === updatedAppointment._id ? updatedAppointment : app
          )
        )
      }
    }
  })

  useEffect(() => {
    if (!patientId) return;
    joinRoom(`patient_${patientId}`);
    return () => {
      leaveRoom(`patient_${patientId}`);
    }
  }, [patientId, joinRoom, leaveRoom])

  useEffect(() => {
    const patientId = localStorage.getItem('userId');
    setPatientId(patientId ?? '');
    const fetchAppointments = async () => {
      try {
        const res = await api.get(`/appointment/getMyAppointments/${patientId}`);
        if (res.status === 200) {
          setAppointments(res.data);
        } else {
          throw new Error('Failed to fetch appointments');
        }
      } catch (err) {
        console.error('Failed to fetch appointments:', err);
        toast.error('Không thể tải danh sách lịch hẹn');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatSession = (session: string) => {
    if (session.includes('-')) {
      const [start, end] = session.split('-');
      return `${start} - ${end}`;
    }
    return session === 'morning' ? 'Buổi sáng (8:00 - 12:00)' : 'Buổi chiều (13:00 - 17:00)';
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleCloseDetail = () => {
    setSelectedAppointment(null);
  };

  const handleCancelAppointment = async (id: string) => {
    try {
      const { value: cancelReason } = await Swal.fire({
        title: 'Lý do hủy lịch hẹn',
        input: 'text',
        inputLabel: 'Vui lòng nhập lý do hủy',
        inputPlaceholder: 'Nhập lý do hủy lịch hẹn...',
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value) {
            return 'Vui lòng nhập lý do hủy!';
          }
        }
      });

      if (cancelReason) {
        const res = await api.put(`/appointment/cancelAppointment/${id}`, { cancelReason });
        if (res.status === 200) {
          setAppointments(prev =>
            prev.map(app =>
              app._id === id ? { ...app, status: 'cancelled', cancelReason } : app
            )
          );
          toast.success('Đã hủy lịch hẹn thành công');
          setSelectedAppointment(null);
        }
      }
    } catch (err) {
      console.error('Failed to cancel appointment:', err);
      toast.error('Hủy lịch hẹn thất bại');
    }
  };

  const handleDeleteAppointment = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn chặn sự kiện click lan ra card cha
    
    try {
      const result = await Swal.fire({
        title: 'Bạn có chắc chắn muốn xóa?',
        text: "Bạn không thể hoàn tác sau khi xóa!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
      });

      if (result.isConfirmed) {
        const res = await api.delete(`/appointment/deleteAppointment/${id}`);
        if (res.status === 200) {
          setAppointments(prev => prev.filter(app => app._id !== id));
          toast.success('Đã xóa lịch hẹn thành công');
        }
      }
    } catch (err) {
      console.error('Failed to delete appointment:', err);
      toast.error('Xóa lịch hẹn thất bại');
    }
  };

  if (loading) {
    return (
      <div className="appointments-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  const calculateDaysRemaining = (appointmentDate: string) => {
    const today = new Date();
    const appointmentDay = new Date(appointmentDate);
    
    today.setHours(0, 0, 0, 0);
    appointmentDay.setHours(0, 0, 0, 0);
    
    const diffTime = appointmentDay.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const handleGotoMedicalRecord = (id: string) => {
    router.push(`/quan-ly/xem-benh-an?examinationId=${id}`)
  }

  const getStatusBadge = (appointment: Appointment) => {
    // Ưu tiên hiển thị trạng thái hủy trước
    if (appointment.status === 'cancelled') {
      return { text: 'Đã hủy', class: 'cancelled' };
    }
    
    // Tiếp theo là các trạng thái khác
    if (appointment.status === 'pending' || appointment.confirmStatus === 'pending') {
      return { text: 'Chờ xác nhận', class: 'pending' };
    }
    if (appointment.status === 'scheduled' && appointment.confirmStatus === 'confirmed') {
      return { text: 'Đã xác nhận', class: 'confirmed' };
    }
    if(appointment.confirmStatus === 'rejected') {
      return { text: 'Đã từ chối', class: 'rejected' };
    }
    if (appointment.status === 'scheduled') {
      return { text: 'Đã đặt', class: 'scheduled' };
    }
    if (appointment.status === 'waiting_result') {
      return { text: 'Đang khám', class: 'waiting' };
    }
    if (appointment.status === 'completed') {
      return { text: 'Hoàn thành', class: 'completed' };
    }
    
    return { text: appointment.status, class: appointment.status };
  };

  return (
    <div className="appointments-container">
      <h1 className="page-title">DANH SÁCH LỊCH HẸN</h1>
      
      {appointments.length === 0 ? (
        <div className="no-appointments">
          <p>Bạn chưa có lịch hẹn nào</p>
          <button 
            className="btn-new-appointment"
            onClick={() => router.push('/book-appointment')}
          >
            Đặt lịch mới
          </button>
        </div>
      ) : (
        <div className="appointments-list">
          {appointments.map(appointment => {
            const daysRemaining = calculateDaysRemaining(appointment.appointmentDate);
            const statusBadge = getStatusBadge(appointment);
            
            return (
              <div 
                key={appointment._id} 
                className={`appointment-card ${statusBadge.class}`}
                onClick={() => handleAppointmentClick(appointment)}
              >
                {appointment.status === 'cancelled' && (
                  <button 
                  className="delete-btn"
                  onClick={(e) => handleDeleteAppointment(appointment._id, e)}
                  disabled={appointment.status !== 'cancelled'}
                  title={appointment.status !== 'cancelled' ? 'Chỉ có thể xóa lịch đã hủy' : 'Xóa lịch hẹn'}
                >
                  <FaTimes />
                </button>
                )}
                
                <div className="card-header">
                  <h3>
                    <FaCalendarAlt className="icon" /> 
                    {formatDate(appointment.appointmentDate)}
                  </h3>
                  {appointment.status === 'completed' ? (
                    <FaCheckCircle className="completed-icon" />
                  ) : daysRemaining <= 4 && daysRemaining >= 2 ? (
                    <span className="days-remaining red">Còn {daysRemaining} ngày</span>
                  ) : daysRemaining === 1 ? (
                    <span className="days-remaining red">Ngày mai</span>
                  ) : daysRemaining === 0 ? (
                    <span className="days-remaining red">Hôm nay</span>
                  ) : null}
                </div>
                
                <div className="card-body">
                  <p><FaUserMd className="icon" /> Bác sĩ: {appointment.doctorId.userId.fullName}</p>
                  <p><FaHospital className="icon" /> Khoa: {appointment.departmentId.name}</p>
                  <p><FaClock className="icon" /> Khung giờ: {formatSession(appointment.session)}</p>
                  <div className={`status-badge ${statusBadge.class}`}>
                    {statusBadge.text}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedAppointment && (
        <div className="appointment-detail-modal">
          <div className="modal-content-appointment">
            <button className="close-button" onClick={handleCloseDetail}>×</button>
            
            <h2>CHI TIẾT LỊCH HẸN</h2>
            
            <div className="detail-section">
              <div className="detail-row">
                <strong className="detail-label">Số thứ tự: </strong>
                <span className="detail-value">{selectedAppointment.queueNumber}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label"><FaCalendarAlt /> Ngày khám:</span>
                <span className="detail-value">{formatDate(selectedAppointment.appointmentDate)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label"><FaClock /> Khung giờ:</span>
                <span className="detail-value">{formatSession(selectedAppointment.session)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label"><FaUserMd /> Bác sĩ:</span>
                <span className="detail-value">{selectedAppointment.doctorId.userId.fullName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label"><FaHospital /> Khoa:</span>
                <span className="detail-value">{selectedAppointment.departmentId.name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Trạng thái:</span>
                <span className={`detail-value status ${getStatusBadge(selectedAppointment).class}`}>
                  {getStatusBadge(selectedAppointment).text}
                  {selectedAppointment.status === 'completed' && (
                    <FaCheckCircle className="completed-icon" />
                  )}
                </span>
              </div>
              {selectedAppointment.reason && (
                <div className="detail-row">
                  <span className="detail-label"><FaInfoCircle /> Lý do khám:</span>
                  <span className="detail-value">{selectedAppointment.reason}</span>
                </div>
              )}
              {selectedAppointment.cancelReason && (
                <div className="detail-row">
                  <span className="detail-label"><FaInfoCircle /> Lý do hủy:</span>
                  <span className="detail-value cancel-reason">{selectedAppointment.cancelReason}</span>
                </div>
              )}
            </div>

            <div className="action-buttons">
              {selectedAppointment.status === 'scheduled' && (
                <button 
                  className="btn-cancel"
                  onClick={() => handleCancelAppointment(selectedAppointment._id)}
                >
                  Huỷ lịch hẹn
                </button>
              )}
              {selectedAppointment.status === 'completed' && (
                <button 
                  className="btn-navigate"
                  onClick={() => handleGotoMedicalRecord(selectedAppointment.examinationId)}
                >
                  Xem bệnh án
                </button>
              )}
              {selectedAppointment.status === 'cancelled' && (
                <button 
                  className="btn-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAppointment(selectedAppointment._id, e);
                  }}
                >
                  <FaTrash /> Xóa lịch
                </button>
              )}
              <button 
                className="btn-close"
                onClick={handleCloseDetail}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
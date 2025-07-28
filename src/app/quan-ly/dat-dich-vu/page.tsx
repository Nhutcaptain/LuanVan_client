'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './styles.css';
import api from '@/lib/axios';
import { toast } from 'react-toastify';
import { IUser } from '@/interface/usermodel';

interface Service {
  _id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
}

const AppointmentPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [patient, setPatient] = useState<IUser | null>(null);
  const router = useRouter();

  // Mock data - bạn sẽ thay thế bằng API call thực tế
  useEffect(() => {
    const mockServices: Service[] = [
      {
        _id: '1',
        name: 'Tiêm phòng cúm',
        description: 'Tiêm phòng cúm theo mùa, bảo vệ sức khỏe trong 1 năm',
        duration: 30,
        price: 250000,
      },
      {
        _id: '2',
        name: 'Xét nghiệm máu',
        description: 'Xét nghiệm tổng quát các chỉ số máu cơ bản',
        duration: 45,
        price: 350000,
      },
      {
        _id: '3',
        name: 'Khám tổng quát',
        description: 'Khám sức khỏe tổng quát định kỳ',
        duration: 60,
        price: 500000,
      },
    ];
    setServices(mockServices);
  }, []);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await api.get("/auth/me");

        if (res.status === 200) {
          setPatient(res.data);
        } else {
          throw new Error("Failed to fetch patient");
        }
      } catch (err) {
        console.error("Failed to fetch patient:", err);
        toast.error("Không thể tải thông tin bệnh nhân");
      } finally {
        
      }
    };

    fetchPatient();
  }, []);

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedDate || !agreeToTerms) {
      alert('Vui lòng điền đầy đủ thông tin và đồng ý với điều khoản');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Gọi API backend để đặt lịch
      // const response = await fetch('/api/appointments', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     serviceId: selectedService._id,
      //     serviceName: selectedService.name,
      //     date: selectedDate,
      //   }),
      // });

      // if (!response.ok) throw new Error('Đặt lịch thất bại');

      // Mock success
      setTimeout(() => {
        setSubmitSuccess(true);
        setIsSubmitting(false);
        
        // Redirect hoặc hiển thị thông báo thành công
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }, 1000);
    } catch (error) {
      console.error('Error:', error);
      setIsSubmitting(false);
      alert('Có lỗi xảy ra khi đặt lịch');
    }
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1); // Ngày mai là ngày sớm nhất có thể đặt
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3); // Tối đa 3 tháng sau

  return (
    <div className="booking-container">
      <header className="booking-header">
        <h1>ĐẶT LỊCH CHO DỊCH VỤ</h1>
      </header>

      <main className="booking-main">
        {submitSuccess ? (
          <div className="booking-success">
            <h2>Đặt lịch thành công!</h2>
            <p>Bạn sẽ được chuyển về trang chủ trong giây lát...</p>
          </div>
        ) : (
          <>
            <div className="booking-search">
              <input
                type="text"
                placeholder="Tìm kiếm dịch vụ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="booking-search-input"
              />
            </div>

            <div className="services-container">
              {filteredServices.map((service) => (
                <div
                  key={service._id}
                  className={`service-item ${selectedService?._id === service._id ? 'active' : ''}`}
                  onClick={() => handleServiceSelect(service)}
                >
                  <h3>{service.name}</h3>
                  <p className="service-price">{service.price.toLocaleString()} VND</p>
                  <p className="service-time">{service.duration} phút</p>
                </div>
              ))}
            </div>

            {selectedService && (
              <div className="service-details">
                <h3>Thông tin dịch vụ đã chọn</h3>
                <p><strong>Tên dịch vụ:</strong> {selectedService.name}</p>
                <p><strong>Mô tả:</strong> {selectedService.description}</p>
                <p><strong>Giá:</strong> {selectedService.price.toLocaleString()} VND</p>
                <p><strong>Thời gian thực hiện:</strong> {selectedService.duration} phút</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="booking-form">
              <div className="form-field">
                <label htmlFor="appointment-date">Chọn ngày đặt lịch:</label>
                <input
                  type="date"
                  id="appointment-date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={minDate.toISOString().split('T')[0]}
                  max={maxDate.toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="form-checkbox">
                <input
                  type="checkbox"
                  id="agree-terms"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  required
                />
                <label htmlFor="agree-terms">Tôi đồng ý với điều khoản và dịch vụ</label>
              </div>

              <button
                type="submit"
                className="booking-submit"
                disabled={isSubmitting || !selectedService || !selectedDate || !agreeToTerms}
              >
                {isSubmitting ? 'Đang xử lý...' : 'Đặt lịch ngay'}
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
};

export default AppointmentPage;
'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FaFileMedical, FaFlask, FaMoneyBillWave, FaFileAlt, FaUser, FaBirthdayCake, FaVenusMars, FaMapMarkerAlt } from 'react-icons/fa'
import "./styles.css"
import api from '@/lib/axios'

interface Prescription {
  medication: string
  dosage: string
  quantity: number
  unit: string
  frequency: string
  duration: number
}

interface TestOrder {
  serviceId: {
    name: string
    price: number
  }
  resultFileUrl?: string
}

interface Address {
  province: string
  district: string
  ward: string
  houseNumber: string
}

interface PatientInfo {
  fullName: string
  gender: string
  dateOfBirth: string
  address: Address
  phone: string;
  patientCode: string;
  email: string;
}

interface ExaminationDetail {
  _id: string
  date: string
  doctorName: string
  isOvertimeAppointment: boolean
  doctorId: {
    overtimeExaminationPrice: number
    officeExaminationPrice: number
  }
  invoiceNumber?: string
  subjective?: string
  objective?: string
  assessment?: string
  plan?: string
  prescriptions: Prescription[]
  testOrders: TestOrder[]
  notes?: string
  patientId: PatientInfo
  followUp?: string
  status: string
}

const ExaminationDetail = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<ExaminationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const examinationId = searchParams.get('id')

  useEffect(() => {
    if (!examinationId) {
      setError('Không tìm thấy ID bệnh án')
      setLoading(false)
      return
    }

    const fetchExaminationDetail = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/examination/getDetail/${examinationId}`)
        if(response.status === 200) {
          setData(response.data)
        }
      } catch (err) {
        setError('Không thể tải chi tiết bệnh án')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchExaminationDetail()
  }, [examinationId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatGender = (gender: string) => {
    return gender === 'male' ? 'Nam' : gender === 'female' ? 'Nữ' : 'Khác'
  }

  const formatAddress = (address: Address) => {
    return `${address.houseNumber}, ${(address.ward as any).name}, ${(address.district as any).name}, ${(address.province as any).name}`
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">Đang tải chi tiết bệnh án...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error">{error}</div>
        <button className="back-button" onClick={() => router.back()}>
          ← Quay lại danh sách
        </button>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="error-container">
        <div className="error">Không tìm thấy thông tin bệnh án</div>
        <button className="back-button" onClick={() => router.back()}>
          ← Quay lại danh sách
        </button>
      </div>
    )
  }

  return (
    <div className="record-detail">
      <button
        className="back-button"
        onClick={() => router.back()}
        disabled={loading}
      >
        ← Quay lại danh sách
      </button>

      {/* Thông tin khám bệnh */}
      <div className="examination-info-section">
        <h2>Thông tin khám bệnh</h2>
        <div className="detail-header">
          <div className="doctor-info">
            <p>
              <strong>Ngày khám:</strong> {formatDateTime(data.date)}
            </p>
            <p>
              <strong>Bác sĩ:</strong> {data.doctorName}
            </p>
            <p>
              <strong>Loại khám:</strong>
              <span
                className={`appointment-type ${
                  data.isOvertimeAppointment ? "overtime" : "normal"
                }`}
              >
                {data.isOvertimeAppointment ? "Khám ngoài giờ" : "Khám thường"}
              </span>
            </p>
            <p>
              <strong>Giá khám: </strong>
              {formatCurrency(
                data.isOvertimeAppointment
                  ? data.doctorId.overtimeExaminationPrice
                  : data.doctorId.officeExaminationPrice
              )}
            </p>
            {data.invoiceNumber && (
              <p>
                <strong>Số hóa đơn:</strong> {data.invoiceNumber}
              </p>
            )}
            <p>
              <strong>Trạng thái:</strong> 
              <span className={`status ${data.status}`}>
                {data.status === 'completed' ? 'Đã hoàn thành' : 
                 data.status === 'examining' ? 'Đang khám' : 
                 data.status === 'waiting_result' ? 'Chờ kết quả' : data.status}
              </span>
            </p>
          </div>
        </div>
         <div className="patient-info-section">
        <h2>
          <FaUser /> Thông tin bệnh nhân
        </h2>
        <div className="patient-details">
          <div className="patient-detail-row">
            <span className="patient-detail-label">
              <FaUser /> Họ tên:
            </span>
            <span className="patient-detail-value">{data.patientId.fullName}</span>
          </div>
          <div className="patient-detail-row">
            <span className="patient-detail-label">
              <FaBirthdayCake /> Ngày sinh:
            </span>
            <span className="patient-detail-value">{formatDate(data.patientId.dateOfBirth)}</span>
          </div>
          <div className="patient-detail-row">
            <span className="patient-detail-label">
              <FaVenusMars /> Giới tính:
            </span>
            <span className="patient-detail-value">{formatGender(data.patientId.gender)}</span>
          </div>
          <div className="patient-detail-row">
            <span className="patient-detail-label">
              <FaMapMarkerAlt /> Địa chỉ:
            </span>
            <span className="patient-detail-value">{formatAddress(data.patientId.address)}</span>
          </div>
          <div className="patient-detail-row">
            <span className="patient-detail-label">
              <FaMapMarkerAlt /> Số điện thoại:
            </span>
            <span className="patient-detail-value">{data.patientId.phone}</span>
          </div>
          <div className="patient-detail-row">
            <span className="patient-detail-label">
              <FaMapMarkerAlt /> Email:
            </span>
            <span className="patient-detail-value">{data.patientId.email}</span>
          </div>
        </div>
      </div>

        <div className="detail-section">
          <h3>Triệu chứng chủ quan</h3>
          <div className="detail-content">
            {data.subjective || "Không có thông tin"}
          </div>
        </div>

        <div className="detail-section">
          <h3>Triệu chứng khách quan</h3>
          <div className="detail-content">
            {data.objective || "Không có thông tin"}
          </div>
        </div>

        <div className="detail-section">
          <h3>Chẩn đoán</h3>
          <div className="detail-content diagnosis">
            {data.assessment || "Không có thông tin"}
          </div>
        </div>

        <div className="detail-section">
          <h3>Kế hoạch điều trị</h3>
          <div className="detail-content">
            {data.plan || "Không có thông tin"}
          </div>
        </div>

        {data.prescriptions.length > 0 && (
          <div className="detail-section">
            <h3>
              <FaFileMedical /> Đơn thuốc
            </h3>
            <div className="prescription-list">
              {data.prescriptions.map((prescription, index) => (
                <div key={index} className="prescription-item">
                  <div className="prescription-row">
                    <span className="prescription-label">Thuốc:</span>
                    <span className="prescription-value">{prescription.medication}</span>
                  </div>
                  <div className="prescription-row">
                    <span className="prescription-label">Liều dùng:</span>
                    <span className="prescription-value">{prescription.dosage}</span>
                  </div>
                  <div className="prescription-row">
                    <span className="prescription-label">Số lượng:</span>
                    <span className="prescription-value">{prescription.quantity} {prescription.unit}</span>
                  </div>
                  <div className="prescription-row">
                    <span className="prescription-label">Thời gian:</span>
                    <span className="prescription-value">{prescription.duration} ngày</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.testOrders.length > 0 && (
          <div className="detail-section">
            <h3>
              <FaFlask /> Dịch vụ xét nghiệm
            </h3>
            <div className="test-orders-list">
              <table>
                <thead>
                  <tr>
                    <th>Tên dịch vụ</th>
                    <th>Giá tiền</th>
                    <th>Kết quả</th>
                  </tr>
                </thead>
                <tbody>
                  {data.testOrders.map((test, index) => (
                    <tr key={index}>
                      <td>{test.serviceId.name}</td>
                      <td>{formatCurrency(test.serviceId.price)}</td>
                      <td>
                        {test.resultFileUrl ? (
                          <a
                            href={test.resultFileUrl}
                            className="see-result with-icon"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FaFileAlt size={14} />
                            Xem kết quả
                          </a>
                        ) : (
                          "Không có kết quả"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="detail-section total-section">
          <h3>
            <FaMoneyBillWave /> Tổng chi phí
          </h3>
          <div className="cost-summary">
            <div className="cost-row">
              <span className="cost-label">Phí khám bệnh:</span>
              <span className="cost-value">
                {formatCurrency(
                  data.isOvertimeAppointment
                    ? data.doctorId.overtimeExaminationPrice
                    : data.doctorId.officeExaminationPrice
                )}
              </span>
            </div>
            {data.testOrders.length > 0 && (
              <div className="cost-row">
                <span className="cost-label">Phí xét nghiệm:</span>
                <span className="cost-value">
                  {formatCurrency(
                    data.testOrders.reduce(
                      (total, test) => total + test.serviceId.price,
                      0
                    )
                  )}
                </span>
              </div>
            )}
            <div className="cost-row total">
              <span className="cost-label">Tổng cộng:</span>
              <span className="cost-value">
                {formatCurrency(
                  (data.isOvertimeAppointment
                    ? data.doctorId.overtimeExaminationPrice
                    : data.doctorId.officeExaminationPrice) +
                    data.testOrders.reduce(
                      (total, test) => total + test.serviceId.price,
                      0
                    )
                )}
              </span>
            </div>
          </div>
        </div>

        {data.notes && (
          <div className="detail-section">
            <h3>Ghi chú</h3>
            <div className="detail-content">{data.notes}</div>
          </div>
        )}

        {data.followUp && (
          <div className="detail-section follow-up">
            <h3>Hẹn tái khám</h3>
            <div className="detail-content">
              Ngày: {formatDateTime(data.followUp)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ExaminationDetail
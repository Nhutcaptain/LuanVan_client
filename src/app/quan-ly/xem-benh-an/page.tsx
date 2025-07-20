"use client";
import { useEffect, useState } from "react";
import "./styles.css";
import api from "@/lib/axios";
import {
  FaCalendarAlt,
  FaFileAlt,
  FaFileMedical,
  FaFlask,
  FaMoneyBillWave,
} from "react-icons/fa";
import { useSearchParams } from "next/navigation";

interface PrescriptionItem {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  unit: string;
}

interface TestOrderItem {
  serviceId: {
    _id: string;
    name: string;
    price: number;
  };
  status: string;
  resultFileUrl?: string;
}

interface ExaminationSummary {
  id: string;
  date: Date | string;
  doctorName: string;
  doctorId: {
    overtimeExaminationPrice: number;
    officeExaminationPrice: number;
  };
  assessment: string;
  isOvertimeAppointment: boolean;
}

interface ExaminationDetail {
  id: string;
  date: Date | string;
  doctorName: string;
  doctorId: {
    overtimeExaminationPrice: number;
    officeExaminationPrice: number;
  };
  subjective: string;
  objective?: string;
  assessment: string;
  plan: string;
  prescriptions: PrescriptionItem[];
  testOrders: TestOrderItem[];
  notes?: string;
  isOvertimeAppointment: boolean;
  invoiceNumber?: string;
  followUp?: Date;
}

const fetchExaminationSummaries = async (): Promise<ExaminationSummary[]> => {
  const userId = localStorage.getItem("userId");
  const res = await api.get(`/examination/getSummary/${userId}`);
  return res.data;
};

const fetchExaminationDetail = async (
  id: string
): Promise<ExaminationDetail> => {
  const res = await api.get(`/examination/getDetail/${id}`);
  return res.data;
};

export default function XemBenhAnPage() {
  const [summaries, setSummaries] = useState<ExaminationSummary[]>([]);
  const [selectedRecord, setSelectedRecord] =
    useState<ExaminationDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const searchParams = useSearchParams();
  const examinationId = searchParams.get("examinationId");

  useEffect(() => {
    const loadSummaries = async () => {
      try {
        setLoading(true);
        const data = await fetchExaminationSummaries();
        setSummaries(data);
      } catch (err) {
        setError("Không thể tải danh sách bệnh án");
      } finally {
        setLoading(false);
      }
    };

    loadSummaries();
  }, []);

  useEffect(() => {
    if (examinationId) {
      handleSelectRecord(examinationId);
    }
  }, [examinationId]);

  const handleSelectRecord = async (id: string) => {
    try {
      setLoading(true);
      const detail = await fetchExaminationDetail(id);
      setSelectedRecord(detail);
    } catch (err) {
      setError("Không thể tải chi tiết bệnh án");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const filteredSummaries = summaries.filter(
    (summary) =>
      summary.assessment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      summary.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatDate(summary.date).includes(searchTerm)
  );

  return (
    <div className="examination-page">
      <h1 className="page-title">Hồ sơ bệnh án</h1>

      {loading && <div className="loading-indicator">Đang tải...</div>}
      {error && <div className="error-message">{error}</div>}

      {selectedRecord ? (
        <div className="record-detail">
          <button
            className="back-button"
            onClick={() => setSelectedRecord(null)}
            disabled={loading}
          >
            ← Quay lại danh sách
          </button>

          <div className="detail-header">
            <h2>Bệnh án ngày {formatDate(selectedRecord.date)}</h2>
            <div className="doctor-info">
              <p>
                <strong>Bác sĩ:</strong> {selectedRecord.doctorName}
              </p>
              <p>
                <strong>Loại khám:</strong>
                <span
                  className={`appointment-type ${
                    selectedRecord.isOvertimeAppointment ? "overtime" : "normal"
                  }`}
                >
                  {selectedRecord.isOvertimeAppointment
                    ? "Khám ngoài giờ"
                    : "Khám thường"}
                </span>
              </p>
              <p>
                <strong>Giá khám: </strong>
                {formatCurrency(
                  selectedRecord.isOvertimeAppointment
                    ? selectedRecord.doctorId.overtimeExaminationPrice
                    : selectedRecord.doctorId.officeExaminationPrice
                )}
              </p>
              {selectedRecord.invoiceNumber && (
                <p>
                  <strong>Số hóa đơn:</strong> {selectedRecord.invoiceNumber}
                </p>
              )}
            </div>
          </div>

          <div className="detail-section">
            <h3>Triệu chứng chủ quan</h3>
            <p className="detail-content">
              {selectedRecord.subjective || "Không có thông tin"}
            </p>
          </div>

          <div className="detail-section">
            <h3>Triệu chứng khách quan</h3>
            <p className="detail-content">
              {selectedRecord.objective || "Không có thông tin"}
            </p>
          </div>

          <div className="detail-section">
            <h3>Chẩn đoán</h3>
            <p className="detail-content diagnosis">
              {selectedRecord.assessment || "Không có thông tin"}
            </p>
          </div>

          <div className="detail-section">
            <h3>Kế hoạch điều trị</h3>
            <p className="detail-content">
              {selectedRecord.plan || "Không có thông tin"}
            </p>
          </div>

          {selectedRecord.prescriptions.length > 0 && (
            <div className="detail-section">
              <h3>
                <FaFileMedical /> Đơn thuốc
              </h3>
              <div className="prescription-list">
                {selectedRecord.prescriptions.map((prescription, index) => (
                  <div key={index} className="prescription-item">
                    <p>
                      <strong>Thuốc:</strong> {prescription.medication}
                    </p>
                    <p>
                      <strong>Liều dùng:</strong> {prescription.dosage}
                    </p>
                    <p>
                      <strong>Số lượng:</strong> {prescription.quantity}{" "}
                      {prescription.unit}
                    </p>
                    <p>
                      <strong>Tần suất:</strong> {prescription.frequency}
                    </p>
                    <p>
                      <strong>Thời gian:</strong> {prescription.duration} ngày
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedRecord.testOrders.length > 0 && (
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
                    {selectedRecord.testOrders.map((test, index) => (
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
              <p>
                <strong>Phí khám bệnh: </strong>
                {formatCurrency(
                  selectedRecord.isOvertimeAppointment
                    ? selectedRecord.doctorId.overtimeExaminationPrice
                    : selectedRecord.doctorId.officeExaminationPrice
                )}
              </p>
              {selectedRecord.testOrders.length > 0 && (
                <p>
                  <strong>Phí xét nghiệm: </strong>
                  {formatCurrency(
                    selectedRecord.testOrders.reduce(
                      (total, test) => total + test.serviceId.price,
                      0
                    )
                  )}
                </p>
              )}
              <p className="total-cost">
                <strong>Tổng cộng: </strong>
                {formatCurrency(
                  (selectedRecord.isOvertimeAppointment
                    ? selectedRecord.doctorId.overtimeExaminationPrice
                    : selectedRecord.doctorId.officeExaminationPrice) +
                    selectedRecord.testOrders.reduce(
                      (total, test) => total + test.serviceId.price,
                      0
                    )
                )}
              </p>
            </div>
          </div>

          {selectedRecord.notes && (
            <div className="detail-section">
              <h3>Ghi chú</h3>
              <p className="detail-content">{selectedRecord.notes}</p>
            </div>
          )}

          {selectedRecord.followUp && (
            <div className="detail-section follow-up">
              <h3>Hẹn tái khám</h3>
              <p className="detail-content">
                Ngày: {formatDate(selectedRecord.followUp)}
              </p>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Tìm kiếm theo chẩn đoán, bác sĩ hoặc ngày..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="record-list">
            {filteredSummaries.length > 0 ? (
              filteredSummaries.map((summary) => (
                <div
                  key={summary.id}
                  className="record-card"
                  onClick={() => handleSelectRecord(summary.id)}
                >
                  <div className="card-header">
                    <h3>
                      <FaCalendarAlt className="icon" />
                      {formatDate(summary.date)}
                    </h3>
                    <div className="card-tags">
                      <span className="doctor-tag">{summary.doctorName}</span>
                      <span
                        className={`appointment-type ${
                          summary.isOvertimeAppointment ? "overtime" : "normal"
                        }`}
                      >
                        {summary.isOvertimeAppointment ? "Ngoài giờ" : "Thường"}
                      </span>
                    </div>
                  </div>
                  <p className="diagnosis-summary">
                    <strong>Chẩn đoán:</strong> {summary.assessment}
                  </p>
                </div>
              ))
            ) : (
              <p className="no-results">
                {loading ? "Đang tải..." : "Không tìm thấy bệnh án phù hợp"}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

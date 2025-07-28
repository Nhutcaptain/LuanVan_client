"use client";
import { useEffect, useState } from "react";
import {
  ExaminationFormData,
  PrescriptionItem,
} from "@/interface/ExaminationInterface";
import PrescriptionForm from "../PrescriptionForm/PrescriptionForm";
import "./styles.css";
import PatientInfoLookup from "../PatientInfoLookup/PatientInfoLookup";
import { jwtDecode } from "jwt-decode";
import InputComponent from "../InputComponent/InputComponent";
import { PDFExportDialog } from "@/modals/PDFExportModal";
import { Service } from "@/interface/ServiceInterface";
import { IPatient } from "@/interface/patientInterface";
import { div } from "framer-motion/client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Medicine } from "@/interface/MedicineInterface";
import api from "@/lib/axios";
import { DoctorInterface } from "@/interface/DoctorInterface";

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
  doctorInfo: DoctorInterface | null;
  onProvisionalChange: (e: string) => void;
}

export default function ExaminationForm({
  doctorId,
  onSubmit,
  onSaveTerm,
  isSubmitting = false,
  selectedPatient,
  onPatientInfo,
  selectedServices,
  initialExamination,
  doctorInfo,
  onProvisionalChange
}: ExaminationFormProps) {
  const [formData, setFormData] = useState<
    Omit<ExaminationFormData, "prescriptions">
  >({
    date: new Date().toISOString().split("T")[0],
    subjective: "",
    patientCode: "",
    provisional: "",
    assessment: "",
    invoiceNumber: "",
    testOrders: [
      {
        serviceId: "",
        status: "",
        resultFile: "",
      },
    ],
    status: "",
    plan: "",
    notes: "",
    patientId: "",
    followUp: new Date(),
    doctorId: doctorId,
    isOvertimeAppointment: false,
  });

  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([]);
  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [showPDFExportDialog, setShowPDFExportDialog] = useState(false);
  const [pdfData, setPdfData] = useState<ExaminationFormData>();
  const [showMedDropdown, setShowMedDropdown] = useState(false);
  const [medSearchTerm, setMedSearchTerm] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [newPrescription, setNewPrescription] = useState<PrescriptionItem>({
    medication: "",
    dosage: "",
    frequency: "",
    duration: "",
    quantity: 0,
    unit: "",
  });

  useEffect(() => {
  setFormData((prev) => {
    // Giữ lại các testOrders đã có status === "completed"
    const existingCompletedOrders = prev.testOrders?.filter(
      (order) => order.status === "completed"
    ) || [];

    // Tạo testOrders mới từ selectedServices (nếu chưa có trong danh sách)
    const newOrders = selectedServices
      .filter(service => !existingCompletedOrders.some(existing => existing.serviceId === service._id))
      .map(service => ({
        serviceId: service._id,
        status: "ordered",
        resultFile: "",
      }));

    return {
      ...prev,
      doctorId,
      testOrders: [...existingCompletedOrders, ...newOrders],
    };
  });
}, [selectedServices]);


  useEffect(() => {
    const fetchMedications = async () => {
      try {
        const res = await api.get("/medicine/getAll");
        if (res.status === 200) {
          setMedicines(res.data);
        }
      } catch (error) {}
    };
    fetchMedications();
  }, []);

  useEffect(() => {
    if (initialExamination) {
      console.log(initialExamination.testOrders)
      setFormData({
        ...initialExamination,
        testOrders: initialExamination.testOrders,
        date: new Date(initialExamination.date).toISOString().split("T")[0],
      });
      if (initialExamination.prescriptions) {
        setPrescriptions(initialExamination.prescriptions);
      }
    } else {
      // Reset form when no initial examination
      setFormData({
        date: new Date().toISOString().split("T")[0],
        subjective: "",
        invoiceNumber: "",
        patientCode: "",
        provisional: "",
        assessment: "",
        testOrders: [],
        status: "",
        plan: "",
        notes: "",
        patientId: selectedPatient,
        followUp: new Date(),
        doctorId: doctorId,
        isOvertimeAppointment: false
      });
      setPrescriptions([]);

    }
  }, [initialExamination, doctorId, selectedPatient]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if(name === 'provisional') {
      onProvisionalChange(value);
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePrescriptionChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setNewPrescription((prev) => {
      const updatedPrescription = { ...prev, [name]: value };

      // Tự động tính toán số lượng khi frequency hoặc duration thay đổi
      if (name === "dosage" || name === "duration") {
        updatedPrescription.quantity = calculateQuantity(
          name === "dosage" ? value : updatedPrescription.dosage,
          name === "duration" ? value : updatedPrescription.duration
        );
      }

      return updatedPrescription;
    });
  };

  const addPrescription = () => {

    setPrescriptions((prev) => [...prev, newPrescription]);
    setNewPrescription({
      medication: "",
      dosage: "",
      frequency: "",
      duration: "",
      quantity: 0,
      unit: "",
    });
  };

  const removePrescription = (index: number) => {
    setPrescriptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveTemp = () => {
    const invoiceNumber = generateInvoiceNumber();
    onSaveTerm({
      ...formData,
      invoiceNumber,
      prescriptions,
    });
  };

  const validateForm = (requiredFields: string[]): boolean => {
    for (const field of requiredFields) {
      const value = (formData as Record<string, any>)[field];
      if (!value || (typeof value === "string" && value.trim() === "")) {
        const fieldNames: Record<string, string> = {
          date: "Ngày khám",
          subjective: "Triệu chứng",
          provisional: "Chẩn đoán sơ bộ",
          assessment: "Chẩn đoán",
          plan: "Kế hoạch điều trị",
          followUp: "Ngày tái khám",
        };
        toast.error(`Vui lòng nhập: ${fieldNames[field] || field}`);
        return false;
      }
    }
    return true;
  };

  const generateInvoiceNumber = () => {
    const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
    return `${randomNumber}`; // Ví dụ: "84590123"
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
    const hasPendingTests = formData.testOrders?.some(
      (order: any) => order.status !== "completed"
    );
    if (hasPendingTests) {
      toast.warning("Đang chờ kết quả xét nghiệm", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return; 
    }

    const requiredFields = [
      "date",
      "subjective",
      "provisional",
      "assessment",
      "followUp",
    ];
    let invoiceNumber;
    if (!formData.invoiceNumber) {
      invoiceNumber = generateInvoiceNumber();
    } else {
      invoiceNumber = formData.invoiceNumber;
    }
    if (!validateForm(requiredFields)) return;
    onSubmit({
      ...formData,
      invoiceNumber,
      prescriptions,
    });
    setFormData({
      date: new Date().toISOString().split("T")[0],
      subjective: "",
      patientCode: "",
      invoiceNumber: "",
      testOrders: [
        {
          serviceId: "",
          status: "",
          resultFile: "",
        },
      ],
      status: "",
      provisional: "",
      assessment: "",
      plan: "",
      notes: "",
      patientId: "",
      isOvertimeAppointment: false,
    });
    setNewPrescription({
      medication: "",
      dosage: "",
      frequency: "",
      duration: "",
      quantity: 0,
      unit: '',
    });
    setPrescriptions([]);
    setPdfData({ ...formData, invoiceNumber, prescriptions });
    setShowPDFExportDialog(true);
  };

  const handlePatientSelect = (patient: any) => {
    onPatientInfo(patient);
    if (patient) {
      setFormData((prev) => ({
        ...prev,
        patientId: patient.userId._id,
        patientCode: patient.patientCode,
      }));
      setPatientInfo(patient);
    }
  };

  const calculateQuantity = (frequency: any, duration: any) => {
    if (!frequency || !duration) return "";

    const days = parseInt(duration);
    const match = frequency.match(/(\d+) viên x (\d+) lần/);

    if (match) {
      const dosagePerTime = parseInt(match[1]);
      const timesPerDay = parseInt(match[2]);
      return dosagePerTime * timesPerDay * days;
    }

    // Trường hợp uống khi đau
    if (frequency.includes("Khi đau")) {
      const dosage = parseInt(frequency.match(/(\d+) viên/)[1]);
      return dosage * days; // Giả sử 1 lần đau/ngày
    }

    return "";
  };

  const filteredMedicines = medicines.filter((med) =>
    med.name.toLowerCase().includes(medSearchTerm.toLowerCase())
  );

  return (
    <div>
      <form className="examination-form">
        <div className="form-section">
          <h2>Thông Tin Khám Bệnh</h2>
          <PatientInfoLookup
            onPatientSelect={handlePatientSelect}
            patientId={selectedPatient}
          />
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
            <label htmlFor="subjective">Triệu Chứng</label>
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
            <label htmlFor="provisional">Chẩn đoán sơ bộ</label>
            <textarea
              id="provisional"
              name="provisional"
              value={formData.provisional}
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
            {/* Ô chọn thuốc */}
            <div className="medication-select-container">
              <div
                className="medication-select-trigger"
                onClick={() => setShowMedDropdown(!showMedDropdown)}
              >
                {newPrescription.medication || "Chọn thuốc"}
                <span className="dropdown-arrow">▼</span>
              </div>

              {showMedDropdown && (
                <div className="medication-dropdown">
                  <div className="search-container">
                    <input
                      type="text"
                      placeholder="Tìm kiếm thuốc..."
                      value={medSearchTerm}
                      onChange={(e) => setMedSearchTerm(e.target.value)}
                      className="med-search-input"
                    />
                  </div>
                  <div className="medication-list">
                    {filteredMedicines.map((med) => (
                      <div
                        key={med._id}
                        className="medication-item"
                        onClick={() => {
                          setNewPrescription({
                            ...newPrescription,
                            medication: med.name,
                            unit: med.unit,
                          });
                          setShowMedDropdown(false);
                          setMedSearchTerm("");
                        }}
                      >
                        <span>{med.name}</span>
                        <span className="med-stock">
                          (Tồn kho: {med.stock} {med.unit})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Tần suất - tự động chuyển đổi giữa select và input */}
            {newPrescription.unit === "viên" ? (
              <select
                name="dosage"
                value={newPrescription.dosage}
                onChange={handlePrescriptionChange}
                className="dosage-select"
              >
                <option value="">Chọn liều dùng</option>
                <option value="1 viên x 1 lần/ngày - Sau ăn">
                  1 viên x 1 lần/ngày - Sau ăn
                </option>
                <option value="1 viên x 2 lần/ngày - Sau ăn">
                  1 viên x 2 lần/ngày - Sau ăn
                </option>
                <option value="2 viên x 2 lần/ngày - Sau ăn">
                  2 viên x 2 lần/ngày - Sau ăn
                </option>
                <option value="1 viên x 3 lần/ngày - Sau ăn">
                  1 viên x 3 lần/ngày - Sau ăn
                </option>
                <option value="Khi đau - 1 viên">Khi đau - 1 viên</option>
                <option value="custom">Tùy chỉnh...</option>
              </select>
            ) : (
              <input
                type="text"
                name="dosage"
                placeholder="Liều dùng"
                value={newPrescription.dosage}
                onChange={handlePrescriptionChange}
                className="dosage-input"
              />
            )}

            {/* Thời gian dùng */}
            <input
              type="text"
              name="duration"
              placeholder="Thời gian"
              value={newPrescription.duration}
              onChange={handlePrescriptionChange}
              className="duration-input"
            />

            {/* Số lượng thuốc */}
            <input
              type="number"
              name="quantity"
              placeholder="Số lượng"
              value={newPrescription.quantity}
              onChange={handlePrescriptionChange}
              className="quantity-input"
              min="1"
            />

            <button
              type="button"
              onClick={() => {
                const selectedMed = medicines.find(
                  (m) => m.name === newPrescription.medication
                );
                if (
                  selectedMed &&
                  Number(newPrescription.quantity) > selectedMed.stock
                ) {
                  toast.error(
                    `Số lượng vượt quá tồn kho (${selectedMed.stock} ${selectedMed.unit})`
                  );
                  return;
                }
                addPrescription();
              }}
              className="add-prescription-btn"
            >
              Thêm
            </button>
          </div>

          {/* Bảng hiển thị đơn thuốc */}
          {prescriptions.length > 0 && (
            <table className="prescription-table">
              <thead>
                <tr>
                  <th>Tên thuốc</th>
                  <th>Cách dùng</th>
                  <th>Số ngày</th>
                  <th>Số lượng</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((item, index) => (
                  <tr key={index}>
                    <td>{item.medication}</td>
                    <td>{item.dosage}</td>
                    <td>{item.duration}</td>
                    <td>{item.quantity}</td>
                    <td>
                      <button
                        className="remove-btn"
                        onClick={() => removePrescription(index)}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* {prescriptions.length > 0 && (
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
          )} */}
        </div>

        <div className="form-group">
          <label htmlFor="date">Ngày Tái Khám</label>
          <input
            type="date"
            id="date"
            name="followUp"
            value={
              formData.followUp instanceof Date
                ? formData.followUp.toISOString().split("T")[0]
                : formData.followUp || ""
            }
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

        <div className="sticky-btn-group">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="submit-btn primary"
          >
            {isSubmitting ? (
              <>
                <span className="icon">⏳</span> Đang Lưu...
              </>
            ) : (
              <>
                <span className="icon">💾</span> Lưu Hồ Sơ Khám Bệnh
              </>
            )}
          </button>
          <button
            className="submit-btn secondary"
            onClick={handleSaveTemp}
            type="button"
          >
            <span className="icon">⏱️</span> Lưu để chờ kết quả xét nghiệm
          </button>
        </div>
        {pdfData && (
          <PDFExportDialog
            doctorInfo={doctorInfo}
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

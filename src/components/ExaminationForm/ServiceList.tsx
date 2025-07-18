import React, { useState } from "react";
import "./styles.css";
import { Service } from "@/interface/ServiceInterface";
import { IPatient } from "@/interface/patientInterface";
import { DoctorInterface } from "@/interface/DoctorInterface";
import PrescriptionModal from "@/modals/PrescriptionModal";
import ResultModal from "@/modals/ResultModal"; // Tạo component mới này

interface Props {
  services: Service[];
  patientInfo: IPatient | null;
  doctorInfo: DoctorInterface | null;
  onSelectedServicesChange: (services: Service[]) => void;
  initialSelectedServices: Service[];
  tempExamination?: any;
}

const ServiceList: React.FC<Props> = ({
  services,
  patientInfo,
  doctorInfo,
  onSelectedServicesChange,
  initialSelectedServices,
  tempExamination,
}) => {
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [currentResultUrl, setCurrentResultUrl] = useState("");
  const [printedServices, setPrintedServices] = useState<string[]>([]);
  const currentDate = new Date().toLocaleDateString("vi-VN");

  const getServiceOrder = (serviceId: string) => {
    if (!tempExamination?.testOrders) return null;
    return tempExamination.testOrders.find(
      (order: any) => order.serviceId === serviceId
    );
  };

  const isNewService = (serviceId: string) => {
    return !tempExamination?.testOrders?.some(
      (order: any) => order.serviceId === serviceId
    );
  };

  const toggleServiceSelection = (service: Service) => {
    const isSelected = initialSelectedServices.some((s) => s._id === service._id);
    const updatedSelected = isSelected
      ? initialSelectedServices.filter((s) => s._id !== service._id)
      : [...initialSelectedServices, service];
    
    onSelectedServicesChange(updatedSelected);
  };

  const handlePrintPrescription = () => {
    if (initialSelectedServices.length > 0) {
      const newServicesToPrint = initialSelectedServices.filter(
        (service) => isNewService(service._id)
      );

      if (newServicesToPrint.length > 0) {
        setIsPrescriptionModalOpen(true);
        setPrintedServices([
          ...printedServices,
          ...newServicesToPrint.map((s) => s._id),
        ]);
      }
    }
  };

  const handleViewResult = (serviceId: string) => {
    const order = getServiceOrder(serviceId);
    if (order?.resultFileUrl) {
      setCurrentResultUrl(order.resultFileUrl);
      setIsResultModalOpen(true);
    }
  };

  const hasUnprintedServices = initialSelectedServices.some(
    (service) => isNewService(service._id) && !printedServices.includes(service._id)
  );

  return (
    <div className="service-list-container">
      <h2>Danh sách dịch vụ</h2>

      <div className="table-responsive">
        <table className="service-table">
          <thead>
            <tr>
              <th>Chọn</th>
              <th>Tên dịch vụ</th>
              <th>Trạng thái</th>
              <th>Kết quả</th>
              <th>Giá</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => {
              const order = getServiceOrder(service._id);
              const isNew = isNewService(service._id);
              return (
                <tr key={service._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={initialSelectedServices.some(
                        (s) => s._id === service._id
                      )}
                      onChange={() => toggleServiceSelection(service)}
                    />
                  </td>
                  <td>{service.name}</td>
                  <td>
                    {order?.status === 'ordered' && (
                      <span className="status-waiting">(Đang đợi kết quả)</span>
                    )}
                    {order?.status === 'completed' && (
                      <span className="status-completed">(Đã có kết quả)</span>
                    )}
                    {isNew && (
                      <span className="status-new">(Mới thêm)</span>
                    )}
                  </td>
                  <td>
                    {order?.resultFileUrl && (
                      <button 
                        className="view-result-button"
                        onClick={() => handleViewResult(service._id)}
                      >
                        Xem kết quả
                      </button>
                    )}
                  </td>
                  <td>{service.price.toLocaleString()} VND</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {initialSelectedServices.length > 0 && (
        <div className="selected-services-section">
          <h3>Dịch vụ đã chọn:</h3>
          <ul className="selected-services-list">
            {initialSelectedServices.map((service) => {
              const order = getServiceOrder(service._id);
              const isNew = isNewService(service._id);
              const isPrinted = printedServices.includes(service._id);
              return (
                <li key={service._id}>
                  {service.name} - {service.price.toLocaleString()} VND
                  {order?.status === 'ordered' && (
                    <span className="status-waiting"> (Đang đợi kết quả)</span>
                  )}
                  {order?.status === 'completed' && (
                    <span className="status-completed"> (Đã có kết quả)</span>
                  )}
                  {isNew && !isPrinted && (
                    <span className="status-new"> (Chưa in)</span>
                  )}
                  {order?.resultFileUrl && (
                    <button 
                      className="view-result-button small"
                      onClick={() => handleViewResult(service._id)}
                    >
                      Xem kết quả
                    </button>
                  )}
                </li>
              );
            })}
          </ul>

          {hasUnprintedServices ? (
            <button onClick={handlePrintPrescription} className="print-button">
              <span role="img" aria-label="print">
                🖨️
              </span>{" "}
              In chỉ định
            </button>
          ) : (
            <button className="printed-button" disabled>
              <span role="img" aria-label="printed">
                ✓
              </span>{" "}
              Đã in các chỉ định này
            </button>
          )}
        </div>
      )}

      <PrescriptionModal
        isOpen={isPrescriptionModalOpen}
        onClose={() => setIsPrescriptionModalOpen(false)}
        selectedServices={initialSelectedServices.filter(
          (service) => isNewService(service._id)
        )}
        patientInfo={patientInfo}
        doctorInfo={doctorInfo}
        currentDate={currentDate}
      />

      <ResultModal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        pdfUrl={currentResultUrl}
      />
    </div>
  );
};

export default ServiceList;
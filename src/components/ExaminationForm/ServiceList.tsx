import React, { useState } from "react";
import "./styles.css";
import { Service } from "@/interface/ServiceInterface";
import { IPatient } from "@/interface/patientInterface";
import { DoctorInterface } from "@/interface/DoctorInterface";
import PrescriptionModal from "@/modals/PrescriptionModal";
import ResultModal from "@/modals/ResultModal";

interface Props {
  services: Service[];
  patientInfo: IPatient | null;
  doctorInfo: DoctorInterface | null;
  onSelectedServicesChange: (services: Service[]) => void;
  initialSelectedServices: Service[];
  tempExamination?: any;
  selectedPatient: string;
  provisional: string;
}

const ServiceList: React.FC<Props> = ({
  services,
  patientInfo,
  doctorInfo,
  onSelectedServicesChange,
  initialSelectedServices,
  tempExamination,
  selectedPatient,
  provisional
}) => {
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [currentResultUrl, setCurrentResultUrl] = useState("");
  const [printedServices, setPrintedServices] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
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

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  const hasUnprintedServices = initialSelectedServices.some(
    (service) => isNewService(service._id) && !printedServices.includes(service._id)
  );

  // Filter and sort services
  const filteredServices = services
    .filter(service =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      return sortDirection === "asc" 
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });

  return (
    <div className="service-list-container">
      <div className="service-list-header">
        <h2>Danh sách dịch vụ</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="Tìm kiếm dịch vụ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>
      {!selectedPatient && (
        <div className="patient-selection-alert">
          Vui lòng chọn bệnh nhân trước khi chọn dịch vụ
        </div>
      )}

      <div className="table-wrapper">
        <div className="table-responsive">
          <table className="service-table">
            <thead>
              <tr>
                <th>Chọn</th>
                <th onClick={toggleSortDirection} className="sortable-header">
                  Tên dịch vụ
                  <span className="sort-icon">
                    {sortDirection === "asc" ? " ↑" : " ↓"}
                  </span>
                </th>
                <th>Trạng thái</th>
                <th>Giá</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map((service) => {
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
                        className="service-checkbox"
                        disabled={!selectedPatient}
                      />
                    </td>
                    <td>{service.name}</td>
                    <td>
                      {order?.status === 'ordered' && (
                        <span className="status-waiting">Đang đợi kết quả</span>
                      )}
                      {order?.status === 'completed' && (
                        <span className="status-completed">Đã có kết quả</span>
                      )}
                      {isNew && (
                        <span className="status-new">Mới thêm</span>
                      )}
                    </td>
                    <td>{service.price.toLocaleString()} VND</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
                  <span className="service-name">{service.name}</span>
                  <span className="service-price"> - {service.price.toLocaleString()} VND</span>
                  {order?.status === 'ordered' && (
                    <span className="status-waiting"> (Đang đợi kết quả)</span>
                  )}
                  {order?.status === 'completed' && (
                    <span className="status-completed"> (Đã có kết quả)</span>
                  )}
                  {isNew && !isPrinted && (
                    <span className="status-new"> (Chưa in)</span>
                  )}
                  {
                    order?.resultFileUrl && (
                    <button 
                      className="view-result-button small"
                      onClick={() => handleViewResult(service._id)}
                    >
                      Xem kết quả
                    </button>
                  )
                  }
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
        provisional={provisional}
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
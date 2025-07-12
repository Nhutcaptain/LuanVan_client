import { Department, Specialty } from "@/interface/Department";
import { Service } from "@/interface/ServiceInterface";
import React from "react";

interface SpecialtyListProps {
  specialties: Specialty[];
  departments: Department[];
  services: Service[];
  selectedSpecialties: string[];
  onSelectedSpecialty: (id: string) => void;
  onSelectionChange: (selected: string[]) => void;
  onEdit: (specialty: Specialty) => void;
  onDelete: (id: string) => void;
  isMultipleSelected: boolean;
}

const SpecialtyList: React.FC<SpecialtyListProps> = ({
  specialties,
  departments,
  services,
  selectedSpecialties,
  onSelectedSpecialty,
  onSelectionChange,
  onEdit,
  onDelete,
  isMultipleSelected,
}) => {
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      onSelectionChange(specialties.map((s) => s._id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectSpecialty = (id: string) => {
    if (isMultipleSelected) {
      if (selectedSpecialties.includes(id)) {
        onSelectionChange(selectedSpecialties.filter((s) => s !== id));
      } else {
        onSelectionChange([...selectedSpecialties, id]);
      }
    } else {
      if(selectedSpecialties[0] !== id) {
        onSelectionChange([id]);
      } else {
        onSelectionChange([]);
      }
    }
  };

  const getDepartmentName = (departmentId: string) => {
    const dept = departments.find((d) => d._id === departmentId);
    return dept ? dept.name : "N/A";
  };

  const getServiceNames = (serviceIds: string[]) => {
    return (
      serviceIds
        .map((id) => services.find((s) => s._id === id)?.name)
        .filter((name) => name)
        .join(", ") || "Chưa có dịch vụ"
    );
  };

  return (
    <div className="list-container">
      <table className="data-table">
        <thead>
          <tr>
            {isMultipleSelected && (
              <th>
                <input
                  type="checkbox"
                  checked={
                    selectedSpecialties.length === specialties.length &&
                    specialties.length > 0
                  }
                  onChange={handleSelectAll}
                />
              </th>
            )}
            <th>Mã</th>
            <th>Tên chuyên khoa</th>
            <th>Khoa</th>
            <th>Mô tả</th>
            <th>Dịch vụ</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {specialties.map((spec) => (
            <tr key={spec._id} onClick={() => handleSelectSpecialty(spec._id)} className={`${selectedSpecialties.includes(spec._id) ? 'active' : ''}`}>
              {isMultipleSelected && (
                <td>
                  <input
                    type="checkbox"
                    checked={selectedSpecialties.includes(spec._id)}
                    onChange={() => handleSelectSpecialty(spec._id)}
                  />
                </td>
              )}
              <td>{spec.code}</td>
              <td>{spec.name}</td>
              <td>{getDepartmentName(spec.departmentId)}</td>
              <td>{spec.description}</td>
              <td className="service-list">
                {getServiceNames(spec.serviceIds)}
              </td>
              <td>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => onEdit(spec)}
                >
                  Sửa
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => onDelete(spec._id)}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {specialties.length === 0 && (
        <div className="empty-state">
          Không có chuyên khoa nào được tìm thấy
        </div>
      )}
    </div>
  );
};

export default SpecialtyList;

import { Department } from "@/interface/Department";
import React, { useState } from "react";

interface DepartmentListProps {
  departments: Department[];
  onEdit: (department: Department) => void;
  onDelete: (id: string) => void;
  onSelected: (id: string) => void;
}

const DepartmentList: React.FC<DepartmentListProps> = ({
  departments,
  onEdit,
  onDelete,
  onSelected,
}) => {
  const [selectedDepartment, setSelectedDepartment] = useState('')
  return (
    <div className="list-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Tên khoa</th>
            <th>Mô tả</th>
            <th>Thao tác</th>
          </tr>
        </thead>
      </table>
      <div className="table-body">
        <table className="data-table">
          <tbody>
            {departments.map((dept) => (
              <tr key={dept._id} onClick={() => {
                onSelected(dept._id);
                setSelectedDepartment(dept._id);
              }} className={`${selectedDepartment === dept._id ? 'active' : ''}`}>
                <td>{dept.name}</td>
                <td>{dept.description}</td>
                <td>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => onEdit(dept)}
                  >
                    Sửa
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => onDelete(dept._id)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {departments.length === 0 && (
        <div className="empty-state">Không có khoa nào được tìm thấy</div>
      )}
    </div>
  );
};

export default DepartmentList;

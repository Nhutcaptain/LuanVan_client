import { Department } from "@/interface/Department";


interface DepartmentListProps {
  departments: Department[];
  onSelect: (department: Department) => void;
  onEdit: (department: Department) => void;
  onDelete: (id: string) => void;
  selectedId?: string;
}

const DepartmentList = ({ departments, onSelect, onEdit, onDelete, selectedId }: DepartmentListProps) => {
  return (
    <ul className="list">
      {departments.map((department) => (
        <li 
          key={department._id} 
          className={`list-item ${selectedId === department._id ? 'active' : ''}`}
          onClick={() => onSelect(department)}
        >
          <div>
            <strong>{department.name}</strong>
            <div style={{ fontSize: '14px', marginTop: '5px' }}>{department.description}</div>
          </div>
          <div>
            <button 
              className="button button-secondary button-small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(department);
              }}
            >
              Edit
            </button>
            <button 
              className="button button-danger button-small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(department._id);
              }}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default DepartmentList;
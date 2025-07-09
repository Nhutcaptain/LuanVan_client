import { Specialty } from "../page";

interface SpecialtyListProps {
  specialties: Specialty[];
  onSelect: (specialty: Specialty) => void;
  onEdit: (specialty: Specialty) => void;
  onDelete: (id: string) => void;
  selectedId?: string;
}

const SpecialtyList = ({ specialties, onSelect, onEdit, onDelete, selectedId }: SpecialtyListProps) => {
  return (
    <ul className="list">
      {specialties.map((specialty) => (
        <li 
          key={specialty._id} 
          className={`list-item ${selectedId === specialty._id ? 'active' : ''}`}
          onClick={() => onSelect(specialty)}
        >
          <div>
            <strong>{specialty.name}</strong>
            <div style={{ fontSize: '12px', color: '#666' }}>{specialty.code}</div>
            <div style={{ fontSize: '14px', marginTop: '5px' }}>{specialty.description}</div>
          </div>
          <div>
            <button 
              className="button button-secondary button-small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(specialty);
              }}
            >
              Edit
            </button>
            <button 
              className="button button-danger button-small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(specialty._id);
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

export default SpecialtyList;
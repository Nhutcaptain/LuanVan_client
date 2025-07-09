import { Department, Specialty } from '@/interface/Department';
import { useState, useEffect } from 'react';

interface SpecialtyFormProps {
  specialty: Specialty | null;
  departments: Department[];
  onSubmit: (specialty: Omit<Specialty, '_id'> | Specialty) => void;
  onCancel: () => void;
}

const SpecialtyForm = ({ specialty, departments, onSubmit, onCancel }: SpecialtyFormProps) => {
  const [formData, setFormData] = useState({
    departmentId: '',
    name: '',
    description: '',
    code: ''
  });

  useEffect(() => {
    if (specialty) {
      setFormData({
        departmentId: specialty.departmentId,
        name: specialty.name,
        description: specialty.description,
        code: specialty.code
      });
    }
  }, [specialty]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(specialty ? { ...specialty, ...formData } : formData as Omit<Specialty, '_id'>);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Department</label>
        <select
          name="departmentId"
          className="form-input"
          value={formData.departmentId}
          onChange={handleChange}
          required
        >
          <option value="">Select a department</option>
          {departments.map(dept => (
            <option key={dept._id} value={dept._id}>{dept.name}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Name</label>
        <input
          type="text"
          name="name"
          className="form-input"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label className="form-label">Code</label>
        <input
          type="text"
          name="code"
          className="form-input"
          value={formData.code}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea
          name="description"
          className="form-textarea"
          value={formData.description}
          onChange={handleChange}
        />
      </div>
      <div className="modal-footer">
        <button type="button" className="button button-danger" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="button button-primary">
          {specialty ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};

export default SpecialtyForm;
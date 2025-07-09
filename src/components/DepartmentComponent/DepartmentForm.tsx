import { Department } from '@/interface/Department';
import { useState, useEffect } from 'react';

interface DepartmentFormProps {
  department: Department | null;
  onSubmit: (department: Omit<Department, '_id'> | Department) => void;
  onCancel: () => void;
}

const DepartmentForm = ({ department, onSubmit, onCancel }: DepartmentFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name,
        description: department.description
      });
    }
  }, [department]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(department ? { ...department, ...formData } : formData);
  };

  return (
    <form onSubmit={handleSubmit}>
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
          {department ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};

export default DepartmentForm;
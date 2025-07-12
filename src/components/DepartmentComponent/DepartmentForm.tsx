import { Department } from '@/interface/Department';
import React, { useState, useEffect } from 'react';


interface DepartmentFormProps {
    department?: Department | null;
    onSave: (department: Department | Omit<Department, '_id'>) => void;
    onCancel: () => void;
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({ department, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });

    useEffect(() => {
        if (department) {
            setFormData({
                name: department.name,
                description: department.description,
            });
        }
    }, [department]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (department) {
            onSave({ ...department, ...formData });
        } else {
            onSave(formData);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>{department ? 'Chỉnh sửa khoa' : 'Thêm khoa mới'}</h3>
                    <button className="close-btn" onClick={onCancel}>×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Tên khoa *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Mô tả</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                        />
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={onCancel}>
                            Hủy
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {department ? 'Cập nhật' : 'Thêm'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DepartmentForm;
import { Department, Specialty } from '@/interface/Department';
import React, { useState, useEffect } from 'react';

interface SpecialtyFormProps {
    specialty?: Specialty | null;
    departments: Department[];
    onSave: (specialty: Specialty | Omit<Specialty, '_id'>) => void;
    onCancel: () => void;
}

const SpecialtyForm: React.FC<SpecialtyFormProps> = ({ specialty, departments, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        departmentId: '',
        name: '',
        description: '',
        code: '',
    });

    useEffect(() => {
        if (specialty) {
            setFormData({
                departmentId: specialty.departmentId,
                name: specialty.name,
                description: specialty.description,
                code: specialty.code,
            });
        }
    }, [specialty]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (specialty) {
            onSave({ ...specialty, ...formData });
        } else {
            onSave({ ...formData, serviceIds: [] });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>{specialty ? 'Chỉnh sửa chuyên khoa' : 'Thêm chuyên khoa mới'}</h3>
                    <button className="close-btn" onClick={onCancel}>×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="departmentId">Khoa *</label>
                        <select
                            id="departmentId"
                            name="departmentId"
                            value={formData.departmentId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Chọn khoa</option>
                            {departments.map(dept => (
                                <option key={dept._id} value={dept._id}>
                                    {dept.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="code">Mã chuyên khoa *</label>
                        <input
                            type="text"
                            id="code"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="name">Tên chuyên khoa *</label>
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
                            {specialty ? 'Cập nhật' : 'Thêm'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SpecialtyForm;
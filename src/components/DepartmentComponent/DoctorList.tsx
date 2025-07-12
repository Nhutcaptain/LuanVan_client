import { Department, Specialty } from '@/interface/Department';
import React from 'react';

interface Doctor {
    _id: string;
    name: string;
    userId: {
        fullName: string;
        email: string;
        phone: string;
    }
    specialtyId: string;
    departmentId: string;
}

interface DoctorListProps {
    doctors: Doctor[];
    departments: Department[];
    specialties: Specialty[];
}

const DoctorList: React.FC<DoctorListProps> = ({ doctors, departments, specialties }) => {
    const getDepartmentName = (departmentId: string) => {
        const dept = departments.find(d => d._id === departmentId);
        return dept ? dept.name : 'N/A';
    };

    const getSpecialtyName = (specialtyId: string) => {
        const spec = specialties.find(s => s._id === specialtyId);
        return spec ? spec.name : 'N/A';
    };

    return (
        <div className="list-container">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Tên bác sĩ</th>
                        <th>Khoa</th>
                        <th>Chuyên khoa</th>
                        <th>Email</th>
                        <th>Số điện thoại</th>
                    </tr>
                </thead>
                <tbody>
                    {doctors.map(doc => (
                        <tr key={doc._id}>
                            <td>{doc.userId.fullName}</td>
                            <td>{getDepartmentName(doc.departmentId)}</td>
                            <td>{(doc.specialtyId as any).name}</td>
                            <td>{doc.userId.email}</td>
                            <td>{doc.userId.phone}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {doctors.length === 0 && (
                <div className="empty-state">Không có bác sĩ nào được tìm thấy</div>
            )}
        </div>
    );
};

export default DoctorList;
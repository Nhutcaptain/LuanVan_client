'use client'
import { useState, useEffect } from 'react';
import './styles.css';
import api from '@/lib/axios';
import { useParams, useRouter } from 'next/navigation';
import { Convergence } from 'next/font/google';

interface Doctor {
    _id: string;
    fullName: string;
    avatar: {
        publicId: string;
        url: string;
    };
    certificate: string[];
    experience: string[];
    departmentId: {
        _id: string;
        name: string;
    };
    specialtyId: {
        _id: string;
        name: string;
    };
    dateOfBirth: Date;
    gender?: string;
}

const DoctorProfile = () => {
    const params = useParams();
    const nameSlug = params.doctorNameSlug as string;

    const [expandedSections, setExpandedSections] = useState({
        experience: false,
        certificate: false
    });
    const [age, setAge] = useState<number | null>(null);
    const [doctorData, setDoctorData] = useState<Doctor | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get(`/doctors/getDoctorBySlug?nameSlug=${nameSlug}`);
                setDoctorData(res.data);
                console.log(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [nameSlug]);

    useEffect(() => {
        if (doctorData?.dateOfBirth) {
            const birthDate = new Date(doctorData.dateOfBirth);
            const today = new Date();
            let calculatedAge = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                calculatedAge--;
            }

            setAge(calculatedAge);
        }
    }, [doctorData?.dateOfBirth]);

    const toggleSection = (section: 'experience' | 'certificate') => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (!doctorData) {
        return <div className="error">Không tìm thấy thông tin bác sĩ</div>;
    }

    const covertGender = (gender: string) => {
        return gender === 'male' ? 'Name' : 'Nữ';
    }

    const handleBooking = () => {
        router.push(`/quan-ly/dat-lich-kham?doctorId=${doctorData._id}&specialtyId=${doctorData.specialtyId._id}&departmentId=${doctorData.departmentId._id}`);
    }

    return (
        <div className="doctor-profile-container">
            <div className="profile-header">
                <h1>Thông tin Bác sĩ</h1>
            </div>

            <div className="profile-content">
                <div className="info-section">
                    <div className="basic-info">
                        <h2 className="doctor-name">{doctorData.fullName}</h2>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Tuổi:</span>
                                <span className="info-value">{age !== null ? age : 'N/A'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Giới tính:</span>
                                <span className="info-value">{covertGender(doctorData.gender ?? '') || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Chuyên khoa:</span>
                                <span className="info-value">{doctorData.specialtyId.name}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Kinh nghiệm:</span>
                                <span className="info-value">{doctorData.experience?.length || 0} năm</span>
                            </div>
                        </div>
                    </div>

                    <div className="sections-container">
                        {/* Experience Section */}
                        <div className={`expandable-section ${expandedSections.experience ? 'expanded' : ''}`}>
                            <button 
                                className="expand-button" 
                                onClick={() => toggleSection('experience')}
                            >
                                <h3 className="section-title">Kinh nghiệm làm việc</h3>
                                <span className="expand-icon">
                                    {expandedSections.experience ? '−' : '+'}
                                </span>
                            </button>
                            <div className="section-content">
                                {doctorData.experience && doctorData.experience.length > 0 ? (
                                    <ul className="styled-list">
                                        {doctorData.experience.map((exp, index) => (
                                            <li key={`exp-${index}`}>
                                                <span className="list-bullet">•</span>
                                                <span>{exp}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="no-info">Chưa có thông tin kinh nghiệm</p>
                                )}
                            </div>
                        </div>

                        {/* Certificate Section */}
                        <div className={`expandable-section ${expandedSections.certificate ? 'expanded' : ''}`}>
                            <button 
                                className="expand-button" 
                                onClick={() => toggleSection('certificate')}
                            >
                                <h3 className="section-title">Chứng chỉ</h3>
                                <span className="expand-icon">
                                    {expandedSections.certificate ? '−' : '+'}
                                </span>
                            </button>
                            <div className="section-content">
                                {doctorData.certificate && doctorData.certificate.length > 0 ? (
                                    <ul className="styled-list">
                                        {doctorData.certificate.map((cert, index) => (
                                            <li key={`cert-${index}`}>
                                                <span className="list-bullet">•</span>
                                                <span>{cert}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="no-info">Chưa có thông tin chứng chỉ</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="image-section">
                    <div className="avatar-container">
                        <img
                            src={doctorData.avatar?.url || '/default-avatar.jpg'}
                            alt={`${doctorData.fullName}'s avatar`}
                            className="doctor-avatar"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = '/default-avatar.jpg';
                            }}
                        />
                    </div>
                    <div className="set-appointment-btn" onClick={handleBooking}>
                        <button className="appointment-button" >
                            Đặt lịch hẹn
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorProfile;
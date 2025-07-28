'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import './styles.css';

interface Doctor {
  fullName: string;
  avatar: {
    publicId: string;
    url: string;
  };
  department: string;
  specialization: string;
  nameSlug: string;
  degree: string;
  academicTitle: string;
}

interface Department {
  _id: string;
  name: string;
  introduction?: string;
  treatmentMethods?: string;
}

interface TabContentProps {
  content?: string;
  loading: boolean;
}

const TabContent = ({ content, loading }: TabContentProps) => {
  if (loading) {
    return <div className="loading-spinner">Đang tải dữ liệu...</div>;
  }

  if (!content) {
    return <div className="no-content">Nội dung đang được cập nhật</div>;
  }

  return (
    <div 
      className="tinymce-content" 
      dangerouslySetInnerHTML={{ __html: content }} 
    />
  );
};

const DoctorList = () => {
  const params = useParams();
  const router = useRouter();
  const departmentId = params.departmentId as string;

  const [activeTab, setActiveTab] = useState<'introduction' | 'treatment' | 'doctors'>('introduction');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get doctors
        const doctorsRes = await api.get(`/department/getAll/${departmentId}`);
        if (doctorsRes.status === 200) {
          setDoctors(doctorsRes.data);
        }
        
        // Get departments
        const deptRes = await api.get('/department/getAllDepartment');
        if (deptRes.status === 200) {
          setDepartments(deptRes.data);
          const foundDept = deptRes.data.find((dept: Department) => dept._id === departmentId);
          setCurrentDepartment(foundDept || null);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [departmentId]);

  // Get unique specializations
  const specializations = [...new Set(doctors.map(doctor => doctor.specialization))];

  // Filter doctors
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = specializationFilter === '' || 
                               doctor.specialization === specializationFilter;
    return matchesSearch && matchesSpecialization;
  });

  // Handle department change
  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDeptId = e.target.value;
    if (newDeptId !== departmentId) {
      router.push(`/dich-vu-chuyen-khoa/${newDeptId}`);
    }
  };

  if (loading && !currentDepartment) {
    return (
      <div className="doctor-list-container">
        <div className="loading-spinner">Đang tải dữ liệu...</div>
      </div>
    );
  }

  const formatDegree = (degree: string) => {
    const name: Record<string, string> = {
      Doctor: 'Bác sĩ',
      Master: 'Thạc sĩ',
      PhD: 'Tiến sĩ',
    }
    return name[degree] || degree;
  }

  const getPrefixTitle = (academicTitle?: string, degree?: string) => {
  const titleMap: Record<string, string> = {
    "Associate Professor": "PGS",
    "Professor": "GS",
  };

  const degreeMap: Record<string, string> = {
    "PhD": "Tiến sĩ.",
    "Master": "Thạc sĩ.",
    "Doctor": "Bác sĩ.",
  };

  const title = titleMap[academicTitle || ""] || "";
  const degreeShort = degreeMap[degree || ""] || "";

  // Nếu cả học hàm và học vị đều không có thì trả về rỗng
  const prefixParts = [title, degreeShort].filter(Boolean);

  return prefixParts.join(".");
};


  return (
    <div className="doctor-list-container">
      <div className="header-section">
        <h1 className="page-title">Khoa {currentDepartment?.name || 'DANH SÁCH BÁC SĨ'}</h1>
      </div>

      {/* Tab navigation */}
      <div className="tabs-navigation">
        <button
          className={`tab-button ${activeTab === 'introduction' ? 'active' : ''}`}
          onClick={() => setActiveTab('introduction')}
        >
          Giới thiệu khoa
        </button>
        <button
          className={`tab-button ${activeTab === 'treatment' ? 'active' : ''}`}
          onClick={() => setActiveTab('treatment')}
        >
          Bệnh lý & Phương pháp điều trị
        </button>
        <button
          className={`tab-button ${activeTab === 'doctors' ? 'active' : ''}`}
          onClick={() => setActiveTab('doctors')}
        >
          Danh sách bác sĩ
        </button>
      </div>

      {/* Tab content */}
      <div className="tab-content">
        {activeTab === 'introduction' && (
          <TabContent 
            content={currentDepartment?.introduction} 
            loading={loading} 
          />
        )}

        {activeTab === 'treatment' && (
          <TabContent 
            content={currentDepartment?.treatmentMethods} 
            loading={loading} 
          />
        )}

        {activeTab === 'doctors' && (
          <>
            {/* Search and filter toolbar */}
            <div className="toolbar">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Tìm kiếm bác sĩ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <i className="search-icon">🔍</i>
              </div>

              <div className="filters">
                <select
                  value={specializationFilter}
                  onChange={(e) => setSpecializationFilter(e.target.value)}
                >
                  <option value="">Tất cả chuyên khoa</option>
                  {specializations.map((spec, index) => (
                    <option key={index} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>

                {/* <select
                  value={departmentId}
                  onChange={handleDepartmentChange}
                >
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select> */}
              </div>
            </div>

            {/* Stats */}
            <div className="stats">
              <span>Tìm thấy {filteredDoctors.length} bác sĩ</span>
              {specializationFilter && (
                <span className="filter-tag">
                  Chuyên khoa: {specializationFilter}
                  <button onClick={() => setSpecializationFilter('')}>×</button>
                </span>
              )}
            </div>

            {/* Doctors list */}
            <div className="doctors-list">
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map((doctor, index) => (
                  <Link 
                    className="doctor-item" 
                    key={index} 
                    href={`/tim-bac-si/${doctor.nameSlug}`}
                  >
                    <div className="doctor-avatar-container">
                      <img
                        src={doctor.avatar.url || '/default-doctor.jpg'}
                        alt={`${doctor.fullName}'s avatar`}
                        className="doctor-avatar"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/default-doctor.jpg';
                        }}
                      />
                    </div>
                    
                    <div className="doctor-info">
                      <h3 className="doctor-name">{getPrefixTitle(doctor.academicTitle, doctor.degree)} {doctor.fullName}</h3>
                      <div className="doctor-meta">
                        <div className="meta-item">
                          <span className="meta-label">KHOA:</span>
                          <span className="meta-value">{doctor.department || 'N/A'}</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">CHUYÊN KHOA:</span>
                          <span className="meta-value">{doctor.specialization}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="view-profile">
                      <span>XEM HỒ SƠ →</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="no-results">
                  <p>Không tìm thấy bác sĩ phù hợp</p>
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      setSpecializationFilter('');
                    }}
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DoctorList;
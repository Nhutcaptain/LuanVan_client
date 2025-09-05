'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import './department.css';
import TabContent from '@/components/TabContent/TabContentComponent';

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
  content: string;
}

const DoctorList = () => {
  const params = useParams();
  const router = useRouter();
  const departmentId = params.departmentId as string;

  const [activeTab, setActiveTab] = useState<'introduction' | 'treatment' | 'doctors'>('introduction');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null);
  const [introduction, setIntroduction] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);

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
    
    const fetchIntroduction = async() => {
      try{
        const res = await api.get(`/department/getIntroduction/${departmentId}`)
        if(res.status === 200) {
          setIntroduction(res.data.content);
        }
      }catch(error) {
        console.error(error);
      }
    }

    fetchData();
    fetchIntroduction();
  }, [departmentId]);

  // Handle tab change with loading
  const handleTabChange = (tab: 'introduction' | 'treatment' | 'doctors') => {
    setTabLoading(true);
    setActiveTab(tab);
    
    // Simulate loading for better UX
    setTimeout(() => {
      setTabLoading(false);
    }, 300);
  };

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
        <div className="loading-overlay">
          <div className="loading-spinner">Đang tải dữ liệu...</div>
        </div>
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
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">Đang tải dữ liệu...</div>
        </div>
      )}
      
      <div className="header-section">
        <h1 className="page-title">Khoa {currentDepartment?.name || 'DANH SÁCH BÁC SĨ'}</h1>
      </div>

      {/* Tab navigation */}
      <div className="tabs-navigation">
        <button
          className={`tab-button ${activeTab === 'introduction' ? 'active' : ''}`}
          onClick={() => handleTabChange('introduction')}
          disabled={tabLoading}
        >
          Giới thiệu khoa
        </button>
        <button
          className={`tab-button ${activeTab === 'doctors' ? 'active' : ''}`}
          onClick={() => handleTabChange('doctors')}
          disabled={tabLoading}
        >
          Danh sách bác sĩ
        </button>
      </div>

      {/* Tab content */}
      <div className="tab-content">
        {tabLoading ? (
          <div className="tab-loading">
            <div className="loading-spinner">Đang tải...</div>
          </div>
        ) : (
          <>
            {activeTab === 'introduction' && (
              <TabContent 
                content={currentDepartment?.content} 
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
                      <option value="">Tất cả lĩnh vực chuyên môn</option>
                      {specializations.map((spec, index) => (
                        <option key={index} value={spec}>
                          {spec}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Stats */}
                <div className="stats">
                  <span>Tìm thấy {filteredDoctors.length} bác sĩ</span>
                  {specializationFilter && (
                    <span className="filter-tag">
                      Lĩnh vự chuyên sâu: {specializationFilter}
                      <button onClick={() => setSpecializationFilter('')}>×</button>
                    </span>
                  )}
                </div>

                {/* Doctors list */}
                <div className="doctors-list-1">
                  {filteredDoctors.length > 0 ? (
                    filteredDoctors.map((doctor, index) => (
                      <Link 
                        className="doctor-item" 
                        key={index} 
                        href={`/thong-tin-bac-si/${doctor.nameSlug}`}
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
                        
                        <div className="doctor-info-1">
                          <h3 className="doctor-name-1">{getPrefixTitle(doctor.academicTitle, doctor.degree)} {doctor.fullName}</h3>
                          <div className="doctor-meta">
                            <div className="meta-item">
                              <span className="meta-label">CHUYÊN KHOA:</span>
                              <span className="meta-value">{doctor.department || 'N/A'}</span>
                            </div>
                            <div className="meta-item">
                              <span className="meta-label">LĨNH VỰC CHUYÊN SÂU:</span>
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
          </>
        )}
      </div>
    </div>
  );
};

export default DoctorList;
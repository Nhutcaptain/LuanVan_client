'use client'
import { useState, useEffect, ChangeEvent, KeyboardEvent } from 'react';
import axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';
import './styles.css';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/axios';
import { FiSearch, FiX } from 'react-icons/fi';

interface Department {
  _id: string;
  name: string;
  description: string;
}

interface Doctor {
  _id: string;
  userId: any;
  name: string;
  nameSlug: string;
  departmentId: Department;
  degree: string;
  specialization: string;
  specialtyId: string;
}

const DoctorSearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.get('/department/getAllDepartment');
        setDepartments(response.data);
      } catch (err) {
        console.error('Error fetching departments:', err);
      }
    };

    fetchDepartments();
  }, []);

  useEffect(() => {
    const title = searchParams.get('title');
    if (title) {
      setSearchTerm(title);
      handleSearch(title);
    }
  }, [searchParams]);

  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      setDoctors([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get(`/doctors/search?title=${encodeURIComponent(term)}`);
      setDoctors(response.data);
    } catch (err) {
      setError('Không thể tìm kiếm bác sĩ. Vui lòng thử lại sau.');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      router.push(`/tim-bac-si2/?title=${encodeURIComponent(searchTerm)}`);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setDoctors([]);
    router.push('/tim-bac-si2');
  };

  return (
    <div className="doctor-search-container">
      <Head>
        <title>Tìm bác sĩ | Hệ thống y tế</title>
        <meta name="description" content="Tìm kiếm bác sĩ theo tên hoặc chuyên khoa" />
      </Head>

      <div className="search-hero">
        <h1>Tìm bác sĩ</h1>
        <div className="search-box">
          <div className="search-input-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Nhập tên bác sĩ hoặc chuyên khoa..."
              value={searchTerm}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
            />
            {searchTerm && (
              <button className="clear-button" onClick={clearSearch}>
                <FiX />
              </button>
            )}
          </div>
          <button
            className="search-button"
            onClick={() => router.push(`/tim-bac-si2/?title=${encodeURIComponent(searchTerm)}`)}
            disabled={!searchTerm.trim()}
          >
            Tìm kiếm
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải kết quả...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => handleSearch(searchTerm)}>Thử lại</button>
        </div>
      )}

      {doctors.length > 0 && (
        <div className="search-results">
          <div className="results-header">
            <h2>Kết quả tìm kiếm</h2>
            <p className="results-count">{doctors.length} bác sĩ được tìm thấy</p>
          </div>
          <div className="doctors-grid">
            {doctors.map((doctor) => (
              <Link
                key={doctor._id}
                href={`/thong-tin-bac-si/${doctor.nameSlug}`}
                className="doctor-card"
              >
                <div className="doctor-avatar-2">
                  {(doctor.userId as any).avatar?.url ? (
                    <img
                      src={doctor.userId.avatar.url}
                      alt={`Ảnh đại diện của ${doctor.userId.fullName}`}
                      className="avatar-image2"
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      {doctor.userId.fullName.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="doctor-info">
                  <h3 className="doctor-name">{doctor.userId.fullName}</h3>
                  <p className="doctor-department">
                    <span>Chuyên khoa:</span> {doctor.departmentId.name}
                  </p>
                  <p className="doctor-specialty">
                    <span>Lĩnh vực chuyên sâu:</span> {(doctor.specialtyId as any).name}
                  </p>
                  <div className="doctor-view-profile">Xem hồ sơ →</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="departments-section">
        <h2>Các chuyên khoa</h2>
        <p className="section-subtitle">Tìm bác sĩ theo chuyên khoa</p>
        <div className="departments-grid">
          {departments.map((dept) => (
            <Link
              key={dept._id}
              href={`/dich-vu-chuyen-khoa/${dept._id}`}
              className="department-card"
            >
              <h3>{dept.name}</h3>
              <p className="department-description">{dept.description}</p>
              <div className="department-link">Xem chi tiết →</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorSearchPage;
// src/app/quan-ly-suc-khoe/page.tsx
"use client";

import { useEffect, useState } from 'react';


import './styles.css';
import { HealthStatus } from '@/interface/HealthStatusInterface';
import HealthStatusCard from '@/components/HealthStatusCard/HealthStatusCardComponent';
import HealthMetricSection from '@/components/HealthMetricSection/HealthMetricSectionComponent';
import api from '@/lib/axios';

export default function HealthStatusPage() {
  const [healthData, setHealthData] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealthData = async () => {
      const userId = localStorage.getItem('userId');
      try {
        const response = await api.get(`/patient/get/${userId}`);
        if(!response){
          alert('Lỗi khi lấy tình trạng sức khoẻ');
          return;
        }
        setHealthData(response.data)
        
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchHealthData();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="health-container">
      <h1 className="health-title">Quản Lý Tình Trạng Sức Khỏe</h1>
      
      {healthData ? (
        <>
          <div className="health-overview">
            <HealthStatusCard 
              title="Thông tin cơ bản"
              items={[
                { label: 'Cân nặng', value: healthData.weight?.value ? `${healthData.weight.value} kg` : 'Chưa có dữ liệu', date: healthData.weight?.testedAt },
                { label: 'Chiều cao', value: healthData.height?.value ? `${healthData.height.value} cm` : 'Chưa có dữ liệu', date: healthData.height?.testedAt },
                { label: 'Nhóm máu', value: healthData.blood?.value || 'Chưa có dữ liệu', date: healthData.blood?.testedAt },
              ]}
            />
            
            <HealthStatusCard 
              title="Chỉ số quan trọng"
              items={[
                { label: 'Nhịp tim', value: healthData.heartRate?.value ? `${healthData.heartRate.value} bpm` : 'Chưa có dữ liệu', date: healthData.heartRate?.testedAt },
                { label: 'Huyết áp', value: healthData.bloodPressure?.value || 'Chưa có dữ liệu', date: healthData.bloodPressure?.testedAt },
                { label: 'Tiểu đường', value: healthData.diabetes?.value || 'Chưa có dữ liệu', date: healthData.diabetes?.testedAt },
              ]}
            />
          </div>

          <div className="health-detailed-sections">
            {healthData.kidneyFunction && (
              <HealthMetricSection 
                title="Chức năng thận"
                metrics={healthData.kidneyFunction || {}}
              />
            )}
            
            {healthData.liverFunction && (
              <HealthMetricSection 
                title="Chức năng gan"
                metrics={healthData.liverFunction}
              />
            )}
            
            {healthData.cholesterol && (
              <HealthMetricSection 
                title="Mỡ máu"
                metrics={healthData.cholesterol}
              />
            )}
            
            {healthData.glucose && (
              <HealthMetricSection 
                title="Đường huyết"
                metrics={healthData.glucose}
              />
            )}
          </div>

          {healthData.note && (
            <div className="health-notes">
              <h3>Ghi chú</h3>
              <p>{healthData.note}</p>
            </div>
          )}

          {healthData.createdAt && (
            <div className="health-last-updated">
              Cập nhật lần cuối: {new Date(healthData.createdAt).toLocaleDateString()}
            </div>
          )}
        </>
      ) : (
        <div className="health-no-data">Không có dữ liệu sức khỏe</div>
      )}
    </div>
  );
}
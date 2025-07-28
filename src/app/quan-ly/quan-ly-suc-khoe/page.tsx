"use client";

import { useEffect, useState } from 'react';
import './styles.css';
import { HealthStatus } from '@/interface/HealthStatusInterface';
import HealthStatusCard from '@/components/HealthStatusCard/HealthStatusCardComponent';
import HealthMetricSection from '@/components/HealthMetricSection/HealthMetricSectionComponent';
import api from '@/lib/axios';
import Swal from 'sweetalert2';

export default function HealthStatusPage() {
  const [healthData, setHealthData] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealthData = async () => {
    const userId = localStorage.getItem('userId');
    try {
      const response = await api.get(`/patient/get/${userId}`);
      if (!response) {
        alert('Lỗi khi lấy tình trạng sức khoẻ');
        return;
      }
      setHealthData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateHealthData = async (updatedData: Partial<HealthStatus>) => {
    Swal.fire({
      title: "Đang cập nhật",
      text: 'Vui lòng chờ trong giây lát',
      icon: 'info',
      showLoaderOnDeny: true,
    })
    try {
      const userId = localStorage.getItem('userId');
      const response = await api.put(`/patient/updateHealthStatus/${userId}`, updatedData);
      if (response.data) {
        setHealthData(response.data);
        Swal.close();
        Swal.fire({
          title: 'Cập nhật thông tin thành công',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi cập nhật');
    }
  };

  useEffect(() => {
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
                { label: 'Cân nặng', value: healthData.weight?.value ? `${healthData.weight.value} kg` : 'Chưa có dữ liệu', date: healthData.weight?.testedAt, fieldName: 'weight' },
                { label: 'Chiều cao', value: healthData.height?.value ? `${healthData.height.value} cm` : 'Chưa có dữ liệu', date: healthData.height?.testedAt, fieldName: 'height' },
                { label: 'Nhóm máu', value: healthData.blood?.value || 'Chưa có dữ liệu', date: healthData.blood?.testedAt, fieldName: 'blood' },
              ]}
              onUpdate={(field, value) => handleUpdateHealthData({ [field]: { value, testedAt: new Date().toISOString() } })}
            />
            
            <HealthStatusCard 
              title="Chỉ số quan trọng"
              items={[
                { label: 'Nhịp tim', value: healthData.heartRate?.value ? `${healthData.heartRate.value} bpm` : 'Chưa có dữ liệu', date: healthData.heartRate?.testedAt, fieldName: 'heartRate' },
                { label: 'Huyết áp', value: healthData.bloodPressure?.value || 'Chưa có dữ liệu', date: healthData.bloodPressure?.testedAt, fieldName:'bloodPressure' },
                { label: 'Tiểu đường', value: healthData.diabetes?.value || 'Chưa có dữ liệu', date: healthData.diabetes?.testedAt, fieldName:'diabetes' },
              ]}
              onUpdate={(field, value) => handleUpdateHealthData({ [field]: { value, testedAt: new Date().toISOString() } })}
            />
          </div>

          <div className="health-detailed-sections">
            {healthData.kidneyFunction && (
              <HealthMetricSection 
                title="Chức năng thận"
                metrics={healthData.kidneyFunction || {}}
                onUpdate={(updatedMetrics) => handleUpdateHealthData({ kidneyFunction: updatedMetrics })}
              />
            )}
            
            {healthData.liverFunction && (
              <HealthMetricSection 
                title="Chức năng gan"
                metrics={healthData.liverFunction}
                onUpdate={(updatedMetrics) => handleUpdateHealthData({ liverFunction: updatedMetrics })}
              />
            )}
            
            {healthData.cholesterol && (
              <HealthMetricSection 
                title="Mỡ máu"
                metrics={healthData.cholesterol}
                onUpdate={(updatedMetrics) => handleUpdateHealthData({ cholesterol: updatedMetrics })}
              />
            )}
            
            {healthData.glucose && (
              <HealthMetricSection 
                title="Đường huyết"
                metrics={healthData.glucose}
                onUpdate={(updatedMetrics) => handleUpdateHealthData({ glucose: updatedMetrics })}
              />
            )}
          </div>

          {healthData.note && (
            <div className="health-notes">
              <h3>Ghi chú từ bác sĩ</h3>
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
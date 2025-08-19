"use client";

import { useEffect, useState } from "react";
import "./styles.css";
import { HealthStatus } from "@/interface/HealthStatusInterface";
import HealthStatusCard from "@/components/HealthStatusCard/HealthStatusCardComponent";
import HealthMetricSection from "@/components/HealthMetricSection/HealthMetricSectionComponent";
import api from "@/lib/axios";
import Swal from "sweetalert2";

// Helper function to create initial health data
const createInitialHealthData = (userId: string): HealthStatus => ({
  userId,
  weight: { value: undefined, testedAt: undefined },
  height: { value: undefined, testedAt: undefined },
  blood: { value: "Chưa được cập nhật", testedAt: undefined },
  heartRate: { value: undefined, testedAt: undefined },
  bloodPressure: { value: "Chưa được cập nhật", testedAt: undefined },
  diabetes: { value: "Chưa được cập nhật", testedAt: undefined },
  kidneyFunction: {
    creatinine: { value: undefined, testedAt: undefined },
    urea: { value: undefined, testedAt: undefined },
    gfr: { value: undefined, testedAt: undefined },
  },
  liverFunction: {
    alt: { value: undefined, testedAt: undefined },
    ast: { value: undefined, testedAt: undefined },
    bilirubin: { value: undefined, testedAt: undefined },
  },
  cholesterol: {
    total: { value: undefined, testedAt: undefined },
    hdl: { value: undefined, testedAt: undefined },
    ldl: { value: undefined, testedAt: undefined },
    triglycerides: { value: undefined, testedAt: undefined },
  },
  glucose: {
    fasting: { value: undefined, testedAt: undefined },
    hba1c: { value: undefined, testedAt: undefined },
  },
  note: "Chưa được cập nhật",
  createdAt: new Date().toISOString(),
});

export default function HealthStatusPage() {
  const [healthData, setHealthData] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState('')

  const fetchHealthData = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setError("User ID not found");
      setLoading(false);
      return;
    }
    setUserId(userId);

    try {
      const response = await api.get(`/patient/get/${userId}`);
      
      if (response.status === 404) {
        // Create initial health data if 404 is returned
        setHealthData(createInitialHealthData(userId));
      } else if (response.data) {
        // Ensure all fields have values, fill with defaults if missing
        const data = response.data;
        const defaultData = createInitialHealthData(userId);
        
        // Merge the response data with default values
        const mergedData: HealthStatus = {
          ...defaultData,
          ...data,
          weight: { ...defaultData.weight, ...data.weight },
          height: { ...defaultData.height, ...data.height },
          blood: { ...defaultData.blood, ...data.blood },
          heartRate: { ...defaultData.heartRate, ...data.heartRate },
          bloodPressure: { ...defaultData.bloodPressure, ...data.bloodPressure },
          diabetes: { ...defaultData.diabetes, ...data.diabetes },
          kidneyFunction: { ...defaultData.kidneyFunction, ...data.kidneyFunction },
          liverFunction: { ...defaultData.liverFunction, ...data.liverFunction },
          cholesterol: { ...defaultData.cholesterol, ...data.cholesterol },
          glucose: { ...defaultData.glucose, ...data.glucose },
          note: data.note || defaultData.note,
          createdAt: data.createdAt || defaultData.createdAt,
        };
        
        setHealthData(mergedData);
      }
    } catch (err:any) {
      if (err.response?.status === 404) {
        const userId = localStorage.getItem("userId");
        if (userId) {
          setHealthData(createInitialHealthData(userId));
        } else {
          setError("User ID not found");
        }
      } else {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateHealthData = async (updatedData: Partial<HealthStatus>) => {
    Swal.fire({
      title: "Đang cập nhật",
      text: "Vui lòng chờ trong giây lát",
      icon: "info",
      didOpen: () => {
        Swal.showLoading();
      }
    });
    try {
      const userId = localStorage.getItem("userId");
      const response = await api.put(
        `/patient/updateHealthStatus/${userId}`,
        updatedData
      );
      if (response.data) {
        const defaultData = createInitialHealthData(userId ?? '');
        const data = response.data;
        const mergedData: HealthStatus = {
          ...defaultData,
          ...data,
          weight: { ...defaultData.weight, ...data.weight },
          height: { ...defaultData.height, ...data.height },
          blood: { ...defaultData.blood, ...data.blood },
          heartRate: { ...defaultData.heartRate, ...data.heartRate },
          bloodPressure: { ...defaultData.bloodPressure, ...data.bloodPressure },
          diabetes: { ...defaultData.diabetes, ...data.diabetes },
          kidneyFunction: { ...defaultData.kidneyFunction, ...data.kidneyFunction },
          liverFunction: { ...defaultData.liverFunction, ...data.liverFunction },
          cholesterol: { ...defaultData.cholesterol, ...data.cholesterol },
          glucose: { ...defaultData.glucose, ...data.glucose },
          note: data.note || defaultData.note,
          createdAt: data.createdAt || defaultData.createdAt,
        };
        setHealthData(mergedData);
        Swal.close();
        Swal.fire({
          title: "Cập nhật thông tin thành công",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi cập nhật");
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (!healthData) return <div className="error">{error || "Không thể tải dữ liệu sức khỏe"}</div>;

  return (
    <div className="health-container">
      <h1 className="health-title">Quản Lý Tình Trạng Sức Khỏe</h1>

      <>
        <div className="health-overview">
          <HealthStatusCard
            title="Thông tin cơ bản"
            items={[
              {
                label: "Cân nặng",
                value: healthData?.weight?.value
                  ? `${healthData.weight.value} kg`
                  : "Chưa có dữ liệu",
                date: healthData?.weight?.testedAt,
                fieldName: "weight",
              },
              {
                label: "Chiều cao",
                value: healthData?.height?.value
                  ? `${healthData.height.value} cm`
                  : "Chưa có dữ liệu",
                date: healthData?.height?.testedAt,
                fieldName: "height",
              },
              {
                label: "Nhóm máu",
                value: healthData?.blood?.value || "Chưa có dữ liệu",
                date: healthData?.blood?.testedAt,
                fieldName: "blood",
              },
            ]}
            onUpdate={(field, value) =>
              handleUpdateHealthData({
                [field]: { value, testedAt: new Date().toISOString() },
              })
            }
          />

          <HealthStatusCard
            title="Chỉ số quan trọng"
            items={[
              {
                label: "Nhịp tim",
                value: healthData?.heartRate?.value
                  ? `${healthData.heartRate.value} bpm`
                  : "Chưa có dữ liệu",
                date: healthData?.heartRate?.testedAt,
                fieldName: "heartRate",
              },
              {
                label: "Huyết áp",
                value: healthData?.bloodPressure?.value || "Chưa có dữ liệu",
                date: healthData?.bloodPressure?.testedAt,
                fieldName: "bloodPressure",
              },
              {
                label: "Tiểu đường",
                value: healthData?.diabetes?.value || "Chưa có dữ liệu",
                date: healthData?.diabetes?.testedAt,
                fieldName: "diabetes",
              },
            ]}
            onUpdate={(field, value) =>
              handleUpdateHealthData({
                [field]: { value, testedAt: new Date().toISOString() },
              })
            }
          />
        </div>

        <div className="health-detailed-sections">
          <HealthMetricSection
            title="Chức năng thận"
            metrics={healthData?.kidneyFunction || {}}
            onUpdate={(updatedMetrics) =>
              handleUpdateHealthData({ kidneyFunction: updatedMetrics })
            }
          />

          <HealthMetricSection
            title="Chức năng gan"
            metrics={healthData?.liverFunction}
            onUpdate={(updatedMetrics) =>
              handleUpdateHealthData({ liverFunction: updatedMetrics })
            }
          />

          <HealthMetricSection
            title="Mỡ máu"
            metrics={healthData?.cholesterol}
            onUpdate={(updatedMetrics) =>
              handleUpdateHealthData({ cholesterol: updatedMetrics })
            }
          />

          <HealthMetricSection
            title="Đường huyết"
            metrics={healthData?.glucose}
            onUpdate={(updatedMetrics) =>
              handleUpdateHealthData({ glucose: updatedMetrics })
            }
          />
        </div>

        <div className="health-notes">
          <strong>Ghi chú</strong>
          <p>{healthData?.note ?? "Chưa cập nhật"}</p>
        </div>

        <div className="health-last-updated">
          Cập nhật lần cuối:{" "}
          {healthData?.createdAt
            ? new Date(healthData.createdAt).toLocaleDateString()
            : "Chưa cập nhật"}
        </div>
      </>
    </div>
  );
}
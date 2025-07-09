// app/schedules-management/page.tsx
'use client'
import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import Swal from 'sweetalert2';
import ScheduleManagementTab from '@/components/ManageScheduleComponents/ScheduleManagement';
import ShiftManagementTab from '@/components/ManageScheduleComponents/ShiftManagementTab';
import {Location} from '@/interface/LocationInterface'
import './styles.css'
interface Department {
  _id: string;
  name: string;
}

interface Shift {
  _id: string;
  name: string;
  startTime: string;
  endTime: string;
  locationId: string;
}

interface Doctor {
  _id: string;
  fullName: string;
  nameSlug: string;
  departmentId: string;
}

interface SpecialSchedule {
    _id: string;
    doctorId: string;
    date: Date,
    type: string,
    note: string,
}

interface ScheduleDay {
  dayOfWeek: number;
  shiftIds: Shift[];
}

interface WeeklySchedule {
  _id: string;
  fromDate?: Date;
  toDate?: Date;
  doctorId: string;
  schedule: ScheduleDay[];
  isActive: boolean;
}

const daysOfWeek = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

const SchedulesManagement = () => {
  // Data state
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [schedules, setSchedules] = useState<WeeklySchedule[]>([]);
  const [specialSchedules, setSpecialSchedules] = useState<SpecialSchedule[]>([]);

  // Active tab state
  const [activeTab, setActiveTab] = useState<'schedule' | 'shift' | 'special'>('schedule');

  // Fetch departments and locations on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptRes, locRes] = await Promise.all([
          api.get('/department/getAllDepartment'),
          api.get('/location/getAll')
        ]);

        if (deptRes.status === 200) {
          setDepartments(deptRes.data);
        }
        if (locRes.status === 201) {
          setLocations(locRes.data);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="schedules-container">
      <h1>Quản lý Lịch Làm Việc Bệnh Viện</h1>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          Quản lý Lịch
        </button>
        <button 
          className={`tab ${activeTab === 'shift' ? 'active' : ''}`}
          onClick={() => setActiveTab('shift')}
        >
          Quản lý Ca làm việc
        </button>
        <button
          className={`tab ${activeTab === 'special' ? 'active' : ''}`} 
          onClick={() => setActiveTab('special')}>Lịch đặc biệt</button>
      </div>

      {activeTab === 'schedule' ? (
        <ScheduleManagementTab
          departments={departments}
          doctors={doctors}
          locations={locations}
          shifts={shifts}
          schedules={schedules}
          daysOfWeek={daysOfWeek}
          setDoctors={setDoctors}
          setShifts={setShifts}
          setSchedules={setSchedules}
          
        />
      ) : (
        <ShiftManagementTab
          locations={locations}
          shifts={shifts}
          setShifts={setShifts}
        />
      )}
    </div>
  );
};

export default SchedulesManagement;
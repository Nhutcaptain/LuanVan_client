// components/schedules/ShiftManagementTab.tsx
'use client'
import { useEffect, useState } from 'react';
import {Location} from '@/interface/LocationInterface'
import Swal from 'sweetalert2';
import ShiftForm from './ShiftForm';
import ShiftList from './ShiftList';
import api from '@/lib/axios';

interface Shift {
  _id: string;
  name: string;
  startTime: string;
  endTime: string;
  locationId: string;
}

interface ShiftManagementTabProps {
  locations: Location[];
}

const ShiftManagementTab = ({
  locations,
}: ShiftManagementTabProps) => {
  const [shiftForm, setShiftForm] = useState({
    name: '',
    startTime: '08:00',
    endTime: '17:00',
    locationId: '',
    isEditing: false,
    editId: null as string | null,
  });
  const [shifts, setShifts] = useState<Shift[]>([]);

  useEffect(() => {
    if (!shiftForm.locationId) return;
    
    const fetchShifts = async () => {
      try {
        const res = await api.get(`/schedule/getShiftByLocation/${shiftForm.locationId}`);
        if (res.status === 200) {
          setShifts(res.data);
        }
      } catch (error: any) {
        
      }
    };

    fetchShifts();
  }, [shiftForm.locationId, setShifts]);

  const handleShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    Swal.fire({
      title: 'Đang xử lý...',
      text: shiftForm.isEditing ? 'Đang cập nhật ca làm việc' : 'Đang thêm ca làm việc',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    try{
      if (shiftForm.isEditing && shiftForm.editId) {
        // Update existing shift
        setShifts(shifts.map(shift => 
          shift._id === shiftForm.editId ? {
            ...shift,
            name: shiftForm.name,
            startTime: shiftForm.startTime,
            endTime: shiftForm.endTime,
            locationId: shiftForm.locationId
          } : shift
        ));
      } else {
        const newShift: Shift = {
          _id: '',
          name: shiftForm.name,
          startTime: shiftForm.startTime,
          endTime: shiftForm.endTime,
          locationId: shiftForm.locationId
        };
        
        const res = await api.post('/schedule/createShift',newShift);
        if(res.status === 201) {
          setShifts([...shifts, newShift]);
        }
      }

      // Reset form
      setShiftForm({
        name: '',
        startTime: '08:00',
        endTime: '17:00',
        locationId: locations[0]._id,
        isEditing: false,
        editId: null,
      });

      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: shiftForm.isEditing ? 'Cập nhật ca làm việc thành công' : 'Thêm ca làm việc thành công',
        showConfirmButton: true
      });
    }catch(error) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Đã xảy ra lỗi khi xử lý',
      });
    }
  };

  const handleShiftInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShiftForm({ ...shiftForm, [name]: value });
  };

  const handleEditShift = (shift: Shift) => {
    setShiftForm({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      locationId: shift.locationId,
      isEditing: true,
      editId: shift._id,
    });
  };

  const handleDeleteShift = async (id: string) => {
    const confirmResult = await Swal.fire({
      title: 'Xác nhận',
      text: 'Bạn có chắc chắn muốn xóa ca làm việc này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });

    if (confirmResult.isConfirmed) {
      try {
        const res = await api.delete(`/schedule/deleteShift/${id}`);
        if (res.status === 200) {
          setShifts(shifts.filter(s => s._id !== id));
          Swal.fire('Thành công', 'Đã xóa ca làm việc', 'success');
        }
      } catch (error) {
        Swal.fire('Lỗi', 'Xóa ca làm việc thất bại', 'error');
      }
    }
  };

  return (
    <div className="shift-management">
      <ShiftForm
        shiftForm={shiftForm}
        locations={locations}
        onChange={handleShiftInputChange}
        onSubmit={handleShiftSubmit}
        onCancel={() => setShiftForm({
          name: '',
          startTime: '08:00',
          endTime: '17:00',
          locationId: locations[0]?._id || '',
          isEditing: false,
          editId: null,
        })}
      />

      <ShiftList
        shifts={shifts}
        locations={locations}
        onEdit={handleEditShift}
        onDelete={handleDeleteShift}
        getLocationName={(id) => locations.find(l => l._id === id)?.name || ''}
      />
    </div>
  );
};

export default ShiftManagementTab;
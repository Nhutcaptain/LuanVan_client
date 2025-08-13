// components/ScheduleCell.tsx
import { useEffect, useState } from 'react';
import './ScheduleCell.css';
import api from '@/lib/axios';
import { Location } from '@/interface/LocationInterface';

interface ScheduleCellProps {
  day: any;
  shiftType: 'morning' | 'afternoon';
}

export default function ScheduleCell({ day, shiftType }: ScheduleCellProps) {
  if (day.isSpecial) {
    return (
      <div className="special-schedule">
        {day.type}
      </div>
    );
  }

  const [locations, setLocations] = useState<Location[]>([])

  useEffect(() => {
    const fetchLocation = async() => {
      try{
        const res = await api.get('/location/getAll');
        if(res.status === 200) {
          setLocations(res.data);
        }
      }catch(error) {
        alert(error);
      }
    }
    fetchLocation();
  },[])

  const shifts = day.shifts || [];
  const filteredShifts = shifts.filter((shift: any) => {
    const hour = parseInt(shift.startTime.split(':')[0]);
    return shiftType === 'morning' ? hour < 12 : hour >= 12;
  });

  if (filteredShifts.length === 0) {
    return <div className="no-shift">-</div>;
  }

  const getLocationName = (locationId: string) => {
    const location = locations.find(loc => loc._id === locationId);
    console.log(locationId, location);
    return location ? location.name : 'Không xác định';
  }

  return (
    <div className="shift-cell">
      {filteredShifts.map((shift: any, index: number) => (
        <div key={index} className="shift-info">
          <div className="shift-time">{shift.startTime}-{shift.endTime}</div>
          {shift.locationId && (
            <div className="shift-location">{(shift.locationId as any).name}</div>
          )}
        </div>
      ))}
    </div>
  );
}
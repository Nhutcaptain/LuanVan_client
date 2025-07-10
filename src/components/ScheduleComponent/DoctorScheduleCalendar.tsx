// components/DoctorScheduleCalendar.tsx
'use client';
import { useState, useEffect } from 'react';
import './DoctorScheduleCalendar.css';
import { Shift, SpecialSchedule, WeeklySchedule } from '@/interface/Shifts';
import CalendarSelector from './CalendarSelector';
import WeeklyView from './WeeklyView';
import DailyView from './DailyView';

interface DoctorScheduleCalendarProps {
  doctorId: string;
  weeklySchedule: WeeklySchedule | null;
  shifts: Shift[];
  specialSchedules: SpecialSchedule[];
}

export default function DoctorScheduleCalendar({
  doctorId,
  weeklySchedule,
  shifts,
  specialSchedules,
}: DoctorScheduleCalendarProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'weekly' | 'daily'>('weekly');
  const [doctorShifts, setDoctorShifts] = useState<Record<string, Shift>>({});
  const [today] = useState<Date>(new Date());

  // Process shifts into a map for easy access
  useEffect(() => {
    const shiftsMap: Record<string, Shift> = {};
    shifts?.forEach(shift => {
      if (shift._id) {
        shiftsMap[shift._id] = shift;
      }
    });
    setDoctorShifts(shiftsMap);
  }, [shifts]);

  // Get the current week's schedule
  const getWeeklySchedule = () => {
    const dayOfWeek = currentDate.getDay(); // 0 (Sunday) to 6 (Saturday)
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // Start on Monday
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDays.push(date);
    }

    return weekDays.map(date => {
      const isToday = date.toDateString() === today.toDateString();
      const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay(); // Convert to 0-6 (Monday-Sunday)

      const specialSchedule = Array.isArray(specialSchedules)
        ? specialSchedules.find(ss => new Date(ss.date).toDateString() === date.toDateString())
        : null;

      if (specialSchedule) {
        return {
          date,
          type: specialSchedule.type,
          note: specialSchedule.note,
          isSpecial: true,
          isToday,
        };
      }

      if (weeklySchedule) {
        const daySchedule = weeklySchedule?.schedule?.find(s => s.dayOfWeek === dayOfWeek);
        if (daySchedule) {
          return {
            date,
            shiftIds: daySchedule.shiftIds,
            shifts: daySchedule?.shiftIds?.map(shift => ({
              ...shift,
              locationId: shift.locationId // Keep the locationId from the shift
            })),
            isSpecial: false,
            isToday,
          };
        }
      }

      return {
        date,
        isSpecial: false,
        shifts: [],
        isToday,
      };
    });
  };

  // Get daily schedule
  const getDailySchedule = () => {
    const isToday = currentDate.toDateString() === today.toDateString(); 
    const dayOfWeek = currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1; // Convert to 0-6 (Monday-Sunday)

    const specialSchedule = specialSchedules.find(ss => 
      new Date(ss.date).toDateString() === currentDate.toDateString()
    );

    if (specialSchedule) {
      return {
        date: currentDate,
        type: specialSchedule.type,
        note: specialSchedule.note,
        isSpecial: true,
        isToday,
      };
    }

    if (weeklySchedule) {
      const daySchedule = weeklySchedule.schedule.find(s => s.dayOfWeek === dayOfWeek);
      if (daySchedule) {
        return {
          date: currentDate,
          shiftIds: daySchedule.shiftIds,
          shifts: daySchedule.shiftIds.map(shift => ({
            ...shift,
            locationId: shift.locationId
          })),
          isSpecial: false,
          isToday,
        };
      }
    }

    return {
      date: currentDate,
      isSpecial: false,
      shifts: [],
      isToday
    };
  };

  return (
    <div className="schedule-container">
      <div className="schedule-header">
        <h2>Lịch làm việc của bác sĩ {weeklySchedule?.doctorName}</h2>
        <div className="view-controls">
          <button 
            onClick={() => setViewMode('weekly')} 
            className={viewMode === 'weekly' ? 'active' : ''}
          >
            Tuần
          </button>
          <button 
            onClick={() => setViewMode('daily')} 
            className={viewMode === 'daily' ? 'active' : ''}
          >
            Ngày
          </button>
        </div>
        <CalendarSelector 
          currentDate={currentDate} 
          onChange={setCurrentDate} 
        />
      </div>

      {viewMode === 'weekly' ? (
        <WeeklyView 
          weekSchedule={getWeeklySchedule()} 
          doctorShifts={doctorShifts} 
          today={today}
        />
      ) : (
        <DailyView 
          dailySchedule={getDailySchedule()} 
          doctorShifts={doctorShifts} 
        />
      )}
    </div>
  );
}
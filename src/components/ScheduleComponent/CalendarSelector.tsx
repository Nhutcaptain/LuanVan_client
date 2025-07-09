// components/CalendarSelector.tsx
'use client';
import { useState } from 'react';
import './CalendarSelector.css';

interface CalendarSelectorProps {
  currentDate: Date;
  onChange: (date: Date) => void;
}

export default function CalendarSelector({ currentDate, onChange }: CalendarSelectorProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [month, setMonth] = useState(currentDate.getMonth());
  const [year, setYear] = useState(currentDate.getFullYear());

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const weeks = [];
  let week = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    week.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  
  // Add empty cells for remaining days in the last week
  if (week.length > 0) {
    while (week.length < 7) {
      week.push(null);
    }
    weeks.push(week);
  }

  const handleDateSelect = (day: number | null) => {
    if (day !== null) {
      const selectedDate = new Date(year, month, day);
      onChange(selectedDate);
      setShowCalendar(false);
    }
  };

  const isCurrentDate = (day: number | null) => {
    if (day === null) return false;
    const date = new Date(year, month, day);
    return date.toDateString() === currentDate.toDateString();
  };

  const isSpecialDate = (day: number | null) => {
    // You would implement this based on your special schedules
    return false;
  };

  return (
    <div className="calendar-selector">
      <button 
        className="current-date-display" 
        onClick={() => setShowCalendar(!showCalendar)}
      >
        {currentDate.toLocaleDateString('vi-VN')}
      </button>
      
      {showCalendar && (
        <div className="calendar-popup">
          <div className="calendar-header">
            <button onClick={() => {
              if (month === 0) {
                setMonth(11);
                setYear(year - 1);
              } else {
                setMonth(month - 1);
              }
            }}>
              &lt;
            </button>
            <span>{month + 1}/{year}</span>
            <button onClick={() => {
              if (month === 11) {
                setMonth(0);
                setYear(year + 1);
              } else {
                setMonth(month + 1);
              }
            }}>
              &gt;
            </button>
          </div>
          
          <table className="calendar-grid">
            <thead>
              <tr>
                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(day => (
                  <th key={day}>{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week, weekIndex) => (
                <tr key={weekIndex}>
                  {week.map((day, dayIndex) => (
                    <td 
                      key={dayIndex}
                      className={`
                        ${day === null ? 'empty' : ''}
                        ${isCurrentDate(day) ? 'current' : ''}
                        ${isSpecialDate(day) ? 'special' : ''}
                      `}
                      onClick={() => handleDateSelect(day)}
                    >
                      {day}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
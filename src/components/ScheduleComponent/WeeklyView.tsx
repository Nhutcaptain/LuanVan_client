// components/WeeklyView.tsx;
import { Shift } from '@/interface/Shifts';
import './WeeklyView.css';
import ScheduleCell from './ScheduleCell';

interface WeeklyViewProps {
  weekSchedule: any[];
  doctorShifts: Record<string, Shift>;
  today: Date;
}

export default function WeeklyView({ weekSchedule, doctorShifts, today }: WeeklyViewProps) {
  const daysOfWeek = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

  return (
    <div className="weekly-view">
      <table className="schedule-table">
        <thead>
          <tr className="day-header">
            {weekSchedule.map((day, index) => {
              const isToday = day.date.toDateString() === today.toDateString();
              return (
                (
                  <th key={index} className={isToday ? 'today-cell' : ''}>
                    <div>{daysOfWeek[index]}</div>
                    <div>
                      {day.date.getDate()}/{day.date.getMonth() + 1}

                    </div>
                  </th>
                )
              )
            })}
          </tr>
        </thead>
        <tbody>
          <tr className="morning-shift">
            {weekSchedule.map((day, index) => (
              <td key={index}>
                <ScheduleCell day={day} shiftType="morning" />
              </td>
            ))}
          </tr>
          <tr className="afternoon-shift">
            {weekSchedule.map((day, index) => (
              <td key={index}>
                <ScheduleCell day={day} shiftType="afternoon" />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
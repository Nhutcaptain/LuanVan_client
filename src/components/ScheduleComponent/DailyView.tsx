// components/DailyView.tsx;
import './DailyView.css';
import { Shift } from '@/interface/Shifts';

interface DailyViewProps {
  dailySchedule: any;
  doctorShifts: Record<string, Shift>;
}

export default function DailyView({ dailySchedule, doctorShifts }: DailyViewProps) {
  const daysOfWeek = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

  return (
    <div className={`daily-view ${dailySchedule.isToday ? 'today-view' : ''}`}>
      <h3 className={dailySchedule.isToday ? 'today-header' : ''}>
        {daysOfWeek[dailySchedule.date.getDay()]} - 
        {dailySchedule.date.getDate()}/{dailySchedule.date.getMonth() + 1}/{dailySchedule.date.getFullYear()}
        {dailySchedule.isToday && <span className="today-label"> (Hôm nay)</span>}
      </h3>
      
      <div className="daily-schedule">
        {dailySchedule.isSpecial ? (
          <div className="special-day">
            <strong>{dailySchedule.type === 'leave' ? 'Nghỉ làm' : 'Họp'}</strong>
            {dailySchedule.note && <p>{dailySchedule.note}</p>}
          </div>
        ) : dailySchedule.shifts && dailySchedule.shifts.length > 0 ? (
          <div className="shifts-container">
            <h4>Các ca làm việc:</h4>
            {dailySchedule.shifts.map((shift: Shift, index: number) => (
              <div key={index} className="shift-item">
                <div className="shift-time">
                  {shift.name}: {shift.startTime} - {shift.endTime}
                </div>
                {shift.locationId && (
                  <div className="shift-location">Địa điểm: {shift.locationId}</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-shift">Không có lịch làm việc</div>
        )}
      </div>
    </div>
  );
}
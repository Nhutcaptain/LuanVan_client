export interface Shift {
    _id?: string;
    name: string;
    startTime: string;
    endTime: string;
    locationId: string;
}

export interface ScheduleDay {
    dayOfWeek: number;
    shiftId: Shift[];
}

export interface WeeklySchedule {
    id: string;
    doctorId: string;
    doctorName: string;
    schedule: ScheduleDay[];
    isActive?: boolean;
}
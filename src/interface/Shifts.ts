export interface Shift {
    _id?: string;
    name: string;
    startTime: string;
    endTime: string;
    locationId: string;
}

export interface ScheduleDay {
    dayOfWeek: number;
    shiftIds: Shift[];
}

export interface WeeklySchedule {
    _id: string;
    doctorId: string;
    doctorName?: string;
    schedule: ScheduleDay[];
    isActive?: boolean;
}

export interface SpecialSchedule {
    doctorId: string;
    date: Date,
    type: string,
    note: string,
}

export interface OvertimeSlot {
    startTime: string; // "HH:mm" format, e.g., "18:00"
    endTime: string; // "HH:mm" format, e.g., "20:00"
}

export interface weeklySlotSchema {
    dayOfWeek: number; // 0 = Sunday, 6 = Saturday
    isActive: boolean;
    slots: OvertimeSlot[];
    locationId: string;
}

export interface OvertimeSchedule {
    _id?: string;
    doctorId: string;
    weeklySchedule: weeklySlotSchema[];
}
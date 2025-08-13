export interface Appointment {
  _id?: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string; // ISO date string
  session: string;
  departmentId?: string;
  specialtyId?: string;
  status?: "scheduled" | "completed" | "cancelled" | "examining" | "waiting_result";
  reason?: string;
  location?: string;
  queueNumber: string;
  notificationSent?: {
    email?: boolean;
    sms?: boolean;
  };
  notes: string;
  isOvertime: boolean;
  createdAt?: string;
  updatedAt?: string;
  confirmStatus: string;
}
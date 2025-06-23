export interface Appointment {
  _id?: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string; // ISO date string
  session: "morning" | "afternoon";
  departmentId?: string;
  specialtyId?: string;
  status?: "scheduled" | "completed" | "cancelled";
  reason?: string;
  notificationSent?: {
    email?: boolean;
    sms?: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}
export interface Appointment {
  _id?: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string; // ISO date string
  session: string;
  departmentId?: string;
  specialtyId?: string;
  status?: "scheduled" | "completed" | "cancelled";
  reason?: string;
  location?: string;
  queueNumber: string;
  notificationSent?: {
    email?: boolean;
    sms?: boolean;
  };
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}
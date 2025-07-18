import { TestOrder } from "./TestOrders";

export interface PrescriptionItem {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface ExaminationFormData {
  _id?: string;
  doctorId?: string;
  patientId: string;
  date: string;
  status: string;
  testOrders: TestOrder[];
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  followUp?: Date;
  prescriptions: PrescriptionItem[];
  notes: string;
  patientCode: string;
}

export interface ExaminationDetail {
  doctorId?: string;
  doctorName?: string;
  date: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  prescriptions: PrescriptionItem[];
  notes: string;
}
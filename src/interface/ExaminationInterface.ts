import { TestOrder } from "./TestOrders";

export interface PrescriptionItem {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number | string;
  unit?: string;
}

export interface ExaminationFormData {
  _id?: string;
  doctorId?: string;
  patientId: string;
  date: string;
  status: string;
  testOrders: TestOrder[];
  subjective: string;
  provisional: string;
  assessment: string;
  plan: string;
  followUp?: Date;
  prescriptions: PrescriptionItem[];
  notes: string;
  isOvertimeAppointment: boolean;
  invoiceNumber: string;
  patientCode: string;
}

export interface ExaminationDetail {
  id: string;
  date: Date | string;
  doctorName: string;
  doctorId: {
    overtimeExaminationPrice: number;
    normalExaminationPrice: number;
  };
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  prescriptions: PrescriptionItem[];
  testOrders: {
    serviceId: {
      _id: string;
      name: string;
      price: number;
    };
    status: string;
    resultFileUrl: string;
  }[];
  notes: string;
  isOvertimeAppointment: boolean;
  invoiceNumber: string;
}
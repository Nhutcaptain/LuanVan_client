export interface PrescriptionItem {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface ExaminationFormData {
  doctorId?: string;
  patientId: string;
  date: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  prescriptions: PrescriptionItem[];
  notes: string;
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
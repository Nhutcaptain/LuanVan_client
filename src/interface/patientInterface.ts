export interface IPatient {
  _id?: string;
  userId: string;
  medicalHistory?: string;
  allergies?: string;
  medications?: string;
  insurance?: {
    provider?: string;
    number?: string;
    validUntil?: Date | string;
  };
}
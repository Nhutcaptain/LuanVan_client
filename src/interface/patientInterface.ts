import { IUser } from "./usermodel";

export interface IPatient {
  _id?: string;
  userId: IUser;
  medicalHistory?: string;
  allergies?: string;
  medications?: string;
  patientCode: string;
  insurance?: {
    provider?: string;
    number?: string;
    validUntil?: Date | string;
  };
}
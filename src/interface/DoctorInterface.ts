import { Specialty } from "./Department";
import { IUser } from "./usermodel";

 export interface DoctorInterface {
  _id?: string;
  nameSlug?: string;
  userId: IUser;
  departmentId?: string;
  specialtyId?: string;
  specialization: string;
  certificate: string[];
  experience: string[];
  schedule: {
    date: string;
    time: string;
    shifts: string[];
  };
}

export interface DoctorListInterface {
  _id: string;
  fullName: string;
  departmentId?: string;
  specialtyId?: string;
}
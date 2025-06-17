import { IUser } from "./usermodel";

 export interface DoctorInterface {
  _id: string;
  userId: IUser;
  specialization: string;
  certificate: string[];
  experience: string[];
  schedule: {
    date: string;
    time: string;
    shifts: string[];
  };
}
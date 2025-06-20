import { AddressForm } from "./AddressForm";

export interface IUser {
  _id?: string;
  email: string;
  password: string;
  fullName: string;
  role?: 'admin' | 'doctor' | 'nurse' | 'patient';
  phone: string;
  address: AddressForm;
  dateOfBirth: Date | string;
  gender: string;
  isActive: boolean;
  avatar: {
    publicId: string,
    url: string,
  };
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
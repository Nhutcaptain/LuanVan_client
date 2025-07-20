import { IUser } from "@/interface/usermodel";

export const validatePatientInfo = (patient: IUser | null): string | null => {
  if (!patient) return "Không tìm thấy thông tin bệnh nhân";
  
  const missingFields = [];
  
  if (!patient.fullName) missingFields.push("họ và tên");
  if (!patient.email) missingFields.push("email");
  if (!patient.phone) missingFields.push("số điện thoại");
  if (!patient.address) missingFields.push("địa chỉ");
  if (!patient.gender) missingFields.push("giới tính");
  if (!patient.dateOfBirth) missingFields.push("ngày tháng năm sinh");

  if (missingFields.length > 0) {
    return `Vui lòng điền đầy đủ thông tin: ${missingFields.join(", ")}`;
  }
  
  return null;
};
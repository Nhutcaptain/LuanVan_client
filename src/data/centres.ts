import { 
  GiHeartOrgan, GiLungs, GiBrain, 
  GiKidneys, GiStomach, GiBoneKnife,
  GiEyeShield, GiTooth, GiBabyFace,
  GiHealthNormal, GiPsychicWaves
} from "react-icons/gi";
import { FaHeartbeat, FaProcedures, FaClinicMedical } from "react-icons/fa";
import { MdWoman, MdChildCare, MdElderly } from "react-icons/md";

import { IconType } from "react-icons";

interface Centre {
  icon: IconType;
  name: string;
  link?: string; // Optional link property
  id?: string;
}

export const centre: Centre[] = [
  { icon: GiHeartOrgan, name: "Tim mạch", id: '68562cf93299eeee8435f20a', link: `/dich-vu-chuyen-khoa/${'68562cf93299eeee8435f20a'}` },
  { icon: GiLungs, name: "Hô hấp" },
  { icon: GiBrain, name: "Thần kinh" },
  { icon: GiKidneys, name: "Thận - Tiết niệu" },
  { icon: GiStomach, name: "Tiêu hóa", id: '68562d213299eeee8435f216', link: `/dich-vu-chuyen-khoa/${'68562d213299eeee8435f216'}`},
  { icon: GiBoneKnife, name: "Chấn thương chỉnh hình" },
  { icon: GiEyeShield, name: "Mắt" },
  { icon: GiTooth, name: "Răng hàm mặt" },
  { icon: GiBabyFace, name: "Sơ sinh" },
  { icon: MdChildCare, name: "Nhi khoa" },
  { icon: MdWoman, name: "Phụ sản" },
  { icon: MdElderly, name: "Lão khoa" },
  { icon: FaHeartbeat, name: "Hồi sức cấp cứu" },
  { icon: FaProcedures, name: "Gây mê hồi sức" },
  { icon: GiPsychicWaves, name: "Tâm thần" },
  { icon: FaClinicMedical, name: "Da liễu" },
  { icon: GiHealthNormal, name: "Y học cổ truyền" },
  // Có thể thêm các chuyên khoa khác
];
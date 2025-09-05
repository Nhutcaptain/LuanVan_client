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
  { icon: GiLungs, name: "Hô hấp", id: "68562d033299eeee8435f20d", link: `/dich-vu-chuyen-khoa/${'68562d033299eeee8435f20d'}` },
  { icon: GiBrain, name: "Thần kinh" , id: "68562d0c3299eeee8435f210", link: `/dich-vu-chuyen-khoa/${'68562d0c3299eeee8435f210'}`},
  { icon: GiKidneys, name: "Thận - Tiết niệu" , id: "68562d0c3299eeee8435f210", link: `/dich-vu-chuyen-khoa/${'68562d0c3299eeee8435f210'}`},
  { icon: GiStomach, name: "Tiêu hóa", id: '68562d213299eeee8435f216', link: `/dich-vu-chuyen-khoa/${'68562d213299eeee8435f216'}`},
  { icon: GiBoneKnife, name: "Chấn thương chỉnh hình",id: "68562d283299eeee8435f219", link: `/dich-vu-chuyen-khoa/${'68562d283299eeee8435f219'}` },
  { icon: GiEyeShield, name: "Mắt",id: "68562d313299eeee8435f21c", link: `/dich-vu-chuyen-khoa/${'68562d313299eeee8435f21c'}` },
  { icon: GiTooth, name: "Răng hàm mặt",id: "68562d393299eeee8435f21f", link: `/dich-vu-chuyen-khoa/${'68562d393299eeee8435f21f'}` },
  { icon: GiBabyFace, name: "Sơ sinh",id: "68562d403299eeee8435f222", link: `/dich-vu-chuyen-khoa/${'68562d403299eeee8435f222'}` },
  { icon: MdChildCare, name: "Nhi khoa" ,id: "68562d0c3299eeee8435f210", link: `/dich-vu-chuyen-khoa/${'68562d0c3299eeee8435f210'}`},
  { icon: MdWoman, name: "Phụ sản" ,id: "68562c0e3299eeee8435f1fe", link: `/dich-vu-chuyen-khoa/${'68562c0e3299eeee8435f1fe'}`},
  { icon: MdElderly, name: "Lão khoa",id: "68562d0c3299eeee8435f210", link: `/dich-vu-chuyen-khoa/${'68562d0c3299eeee8435f210'}` },
  { icon: GiPsychicWaves, name: "Tâm thần" , id: "68562d523299eeee8435f228", link: `/dich-vu-chuyen-khoa/${'68562d523299eeee8435f228'}`},
  { icon: FaClinicMedical, name: "Da liễu",id: "68562d0c3299eeee8435f210", link: `/dich-vu-chuyen-khoa/${'68562d0c3299eeee8435f210'}` },
  { icon: GiHealthNormal, name: "Y học cổ truyền" ,id: "68562d673299eeee8435f22e", link: `/dich-vu-chuyen-khoa/${'68562d673299eeee8435f22e'}`},
  // Có thể thêm các chuyên khoa khác
];
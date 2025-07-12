import api from "@/lib/axios";
import { jwtDecode } from "jwt-decode";
interface DecodedToken {
  userId?: string;
}

export const getOrCreateUserId = () => {
    let userId = localStorage.getItem('userId');
    if(!userId) {
        userId = crypto.randomUUID();
        localStorage.setItem('chat_user_id', userId);
    }

    return userId;
}

export const getDoctorIdFromToken = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return "";
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded.userId;
  } catch (error) {
    console.error("Không thể decode token", error);
    return "";
  }
};

export const getDoctorIdByUserId = async() => {
  try{
    const userId = getDoctorIdFromToken();
    if(!userId) return;
    const res = await api.get(`/doctors/getDoctorIdByUserId/${userId}`);
    if(res.status === 200) {
      console.log(res.data.doctorId);
      return res.data.doctorId;
    }
  }catch(error) {
    return;
  }
}
"use client";
import { useEffect, useRef, useState } from "react";
import "./styles.css";
import MessageItem from "@/components/ChatPageComponent/MessageItem";
import ChatInput from "@/components/ChatPageComponent/ChatInput";
import { toast } from "react-toastify";
import api from "@/lib/axios";
import Image from "next/image";
import { IUser } from "@/interface/usermodel";
import { Specialty } from "@/interface/Department";
import Modal from "@/components/ModalComponent/ModalComponent";
import { useRouter } from "next/navigation";

interface Doctor {
  _id?: string;
  nameSlug?: string;
  userId: IUser;
  departmentId?: string;
  specialtyId?: Specialty;
  specialization: string;
  certificate: string[];
  experience: string[];
  schedule: {
    date: string;
    time: string;
    shifts: string[];
  };
}

export default function Home() {
  const [messages, setMessages] = useState<
    { role: "user" | "ai"; content: string }[]
  >([]);

  const [isDiagnosisMode, setIsDiagnosisMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [recommendDoctors, setRecommendDoctors] = useState<Doctor[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const endpoint = isDiagnosisMode ? "/symptom/diagnose" : "/openai/generate";
  const router = useRouter();

  const handleSend = async (message: string) => {
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setIsLoading(true);
    const userId = localStorage.getItem("userId");

    try {
      const payload = isDiagnosisMode
        ? { description: message, userId }
        : { prompt: message, userId };
      const res = await api.post(endpoint, payload);
      if (res.status === 200) {
        if (res.data.doctors) {
          setRecommendDoctors(res.data.doctors);
        }
        console.log(res.data.response);
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            content: res.data.response,
          },
        ]);
        //   const voices = window.speechSynthesis.getVoices();
        //   console.log(voices);
        //   if ('speechSynthesis' in window) {
        //   const utterance = new SpeechSynthesisUtterance(res.data.response);
        //   utterance.lang = 'vi-VN'; // Nếu tiếng Việt, hoặc 'en-US' nếu tiếng Anh
        //   utterance.pitch = 1;
        //   utterance.rate = 1;
        //   window.speechSynthesis.speak(utterance);
        // }
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi gửi yêu cầu");
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: "Đã xảy ra lỗi khi gửi yêu cầu. Vui lòng thử lại sau.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-wrapper">
      <div className="chat-header">Trợ lý AI Y Tế</div>
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="welcome-message">
            <div className="welcome-avatar">
              <Image
                src="/icons/medical_robotic.png"
                alt="AI Avatar"
                width={80}
                height={80}
                className="ai-avatar-img"
              />
            </div>
            <div className="welcome-text">
              <p>Xin chào, mình là trợ lý AI!</p>
              <p>Mình có thể giúp gì cho bạn hôm nay?</p>
            </div>
          </div>
        )}
        {messages.map((msg, index) => (
          <MessageItem key={index} role={msg.role} content={msg.content} />
        ))}
        {isLoading && <MessageItem role="ai" content="" isLoading={true} />}
        <div ref={bottomRef} />
      </div>

      {/* Nút AI chẩn đoán */}
      <div className="quick-actions"></div>

      <ChatInput
        isShowModal={showModal}
        onShowModal={setShowModal}
        onSend={handleSend}
        isDiagnosisMode={isDiagnosisMode}
        setDiagnosisMode={setIsDiagnosisMode}
      />

      {showModal && (
        <Modal onClose={() => setShowModal(false)} title="Bác sĩ gợi ý">
          <div className="doctors-list">
            {isLoadingDoctors ? (
              <div className="loading-doctors">
                <div className="thinking-dots">
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </div>
              </div>
            ) : (
              recommendDoctors.map((doctor) => (
                <div key={doctor._id} className="doctor-card">
                  <div className="avatar-container">
                    <img
                      src={
                        doctor.userId.avatar.url || "/icons/default_avatar.png"
                      }
                      alt={doctor.userId.fullName}
                      className="doctor-avatar"
                    />
                  </div>
                  <div className="buttom-card-group">
                    <div className="doctor-info">
                      <h4 className="doctor-name">{doctor.userId.fullName}</h4>
                      <p className="doctor-specialty">
                        {doctor.specialtyId?.name}
                      </p>
                    </div>
                    <button
                      className="select-doctor-btn"
                      onClick={() => {
                        // Handle doctor selection logic here
                        setShowModal(false);
                        router.push(`/thong-tin-bac-si/${doctor.nameSlug}`);
                      }}
                    >
                      Xem thông tin
                    </button>
                  </div>
                </div>
              ))
            )}
            {!isLoadingDoctors && recommendDoctors.length === 0 && (
              <div className="no-doctors">
                <p>Không tìm thấy bác sĩ phù hợp</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

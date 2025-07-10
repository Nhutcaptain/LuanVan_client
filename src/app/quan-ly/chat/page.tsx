"use client";
import { useEffect, useRef, useState } from "react";
import "./styles.css";
import MessageItem from "@/components/ChatPageComponent/MessageItem";
import ChatInput from "@/components/ChatPageComponent/ChatInput";
import { toast } from "react-toastify";
import api from "@/lib/axios";
import Image from "next/image";

export default function Home() {
  const [messages, setMessages] = useState<
    { role: "user" | "ai"; content: string }[]
  >([]);

  const [isDiagnosisMode, setIsDiagnosisMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const handleSend = async (message: string) => {
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setIsLoading(true);
    const userId = localStorage.getItem('userId');

    try {
      const res = await api.post("/openai/generate", { prompt: message, userId: userId });
      if (res.status === 200) {
        console.log(res.data.response);
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            content: res.data.response,
          },
        ]);
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
          <MessageItem
            key={index}
            role={msg.role}
            content={msg.content}
          />
        ))}
        {isLoading && <MessageItem role="ai" content="" isLoading={true} />}
        <div ref={bottomRef} />
      </div>

      {/* Nút AI chẩn đoán */}
      <div className="quick-actions"></div>

      <ChatInput
        onSend={handleSend}
        isDiagnosisMode={isDiagnosisMode}
        setDiagnosisMode={setIsDiagnosisMode}
      />
    </div>
  );
}

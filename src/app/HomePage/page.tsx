"use client";

import React, { useEffect, useRef, useState } from "react";
import { FaBook, FaCalendarAlt, FaHistory, FaPhoneAlt } from "react-icons/fa";
import "./style.css";
import {
  FaHeartPulse,
  FaUserDoctor,
  FaCalendarDays,
  FaRobot,
  FaArrowDown,
} from "react-icons/fa6";
import ButtonCardComponent from "@/components/ButtomCardComponent/ButtonCardComponent";
import { centre } from "@/data/centres";
const sectionsIds = ["section1", "section2", "section3"];
import { motion } from "framer-motion";
import Link from "next/link";
import { useInView } from "react-intersection-observer";
import TitleComponent from "@/components/TitleComponent";
import NewsCardComponent from "@/components/NewsCardComponent/NewsCardComponent";
import Footer from "@/components/FooterComponent/Footer";
import api from "@/lib/axios";
import { MdAccountCircle } from "react-icons/md";
import { RiHeartPulseLine } from "react-icons/ri";
import { FaRegRectangleList, FaRegCalendarPlus } from "react-icons/fa6";
import { LiaHistorySolid } from "react-icons/lia";

const HomePage = () => {
  const [isScrolledPastFirst, setIsScrolledPastFirst] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [sideNews, setSideNews] = useState<any[]>([]);
  const [mainNews, setMainNews] = useState<any[]>([]);
  const [otherNews, setOtherNews] = useState<any[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [role, setRole] = useState("");
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });
  const showMoreRef = useRef<HTMLDivElement | null>(null);

  const patientFeatures = [
    {
      icon: <RiHeartPulseLine className="text-4xl" />,
      label: "Quản lý sức khoẻ",
      link: "/quan-ly/quan-ly-suc-khoe",
    },
    {
      icon: <FaUserDoctor className="text-4xl" />,
      label: "Tìm bác sĩ",
      link: "/tim-bac-si",
    },
    {
      icon: <FaRegCalendarPlus className="text-4xl" />,
      label: "Đặt lịch khám",
      link: "/quan-ly/dat-lich-kham",
    },
    {
      icon: <FaRobot className="text-4xl" />,
      label: "Chat với AI",
      link: "/chat",
    },
    {
      icon: <LiaHistorySolid className="text-4xl" />,
      label: "Lịch sử khám",
      link: "/quan-ly/xem-benh-an",
    },
    {
      icon: <MdAccountCircle className="text-4xl" />,
      label: "Thông tin cá nhân",
      link: "/quan-ly/thong-tin",
    },
  ];

  const doctorFeatures = [
    {
      icon: <FaCalendarAlt className="text-4xl" />,
      label: "Lịch làm việc",
      link: "/bac-si/lich-lam-viec",
    },
    {
      icon: <FaUserDoctor className="text-4xl" />,
      label: "Khám bệnh",
      link: "/bac-si/kham-benh",
    },
    {
      icon: <FaHistory className="text-4xl" />,
      label: "Lịch sử khám",
      link: "/quan-ly/dat-lich-kham",
    },
    {
      icon: <FaBook className="text-4xl" />,
      label: "Bài báo khoa học",
      link: "/quan-ly/chat",
    },
  ];

  useEffect(() => {
    const role = localStorage.getItem("role");
    setRole(role ?? "");
    const onScroll = () => {
      const scrollPos = window.scrollY;
      const vh = window.innerHeight;
      setIsScrolledPastFirst(scrollPos >= vh);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      const res = await api.get("/posts/getHomePagePosts");
      if (res.status === 200) {
        setSideNews(res.data.slice(0, 2));
        setMainNews(res.data.slice(2, 3));
        setOtherNews(res.data.slice(3, 6));
      }
    };
    fetchNews();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;

      let activeIndex = 0;
      for (let i = 0; i < sectionsIds.length; i++) {
        const el = document.getElementById(sectionsIds[i]);
        if (el) {
          const offsetTop = el.offsetTop;
          const offsetHeight = el.offsetHeight;
          const middle = scrollY + vh / 2;

          if (middle >= offsetTop && middle < offsetTop + offsetHeight) {
            activeIndex = i;
            break;
          }
        }
      }

      setCurrentSection(activeIndex);
      setIsScrolledPastFirst(scrollY >= vh);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (showAll && showMoreRef.current) {
      showMoreRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    } else if (!showAll && showMoreRef.current && currentSection === 1) {
      showMoreRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [showAll]);

  const displayedItems = showAll ? centre : centre.slice(0, 8);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-30 z-0">
          <img 
            src="/bg/bg3.jpg" 
            alt="Hospital Background" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className={`z-10 px-6 text-center transition-all duration-500 ${currentSection === 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <h1 className="text-5xl md:text-6xl font-bold mb-8">
            Chào mừng đến với <span className="text-blue-300">Bệnh viện Lục Lâm</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Chúng tôi cam kết mang đến dịch vụ chăm sóc sức khỏe chất lượng cao 
            với đội ngũ bác sĩ chuyên nghiệp và trang thiết bị hiện đại.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/tim-bac-si" 
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
            >
              Tìm bác sĩ
            </Link>
            <Link 
              href="/quan-ly/dat-lich-kham" 
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors shadow-lg"
            >
              Đặt lịch khám
            </Link>
          </div>
        </div>

        <div className="absolute bottom-10 right-10 z-20 bg-white p-4 rounded-full shadow-xl">
          <a href="tel:028-351-3333" className="flex items-center text-blue-600">
            <FaPhoneAlt className="text-2xl mr-2" />
            <span className="text-xl font-bold">028 351 3333</span>
          </a>
        </div>
      </div>

      {/* Features Section */}
      <section id="section2" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-blue-600 mb-16">
            {role === "doctor" ? "Các chức năng chính" : "Dịch vụ của chúng tôi"}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(role === "doctor" ? doctorFeatures : patientFeatures).map((feature, index) => (
              <Link href={feature.link} key={index}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all border border-blue-100"
                >
                  <div className="text-blue-600 mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.label}</h3>
                  <p className="text-gray-600">Truy cập ngay để sử dụng dịch vụ</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section ref={showMoreRef} className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-blue-600 mb-16">
            Các chuyên khoa tại bệnh viện
          </h2>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayedItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link href={item.link || "#"} key={index}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all flex flex-col items-center text-center"
                    >
                      <div className="bg-blue-100 p-4 rounded-full mb-4">
                        <Icon size={40} className="text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
            
            <div className="text-center mt-10">
              <button
                onClick={() => setShowAll(!showAll)}
                className="flex items-center justify-center gap-2 mx-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span className="font-medium">
                  {showAll ? "Ẩn bớt" : "Xem thêm chuyên khoa"}
                </span>
                <FaArrowDown className={`transition-transform ${showAll ? "rotate-180" : ""}`} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-bold text-blue-600">Tin tức & Sự kiện</h2>
            <Link 
              href="/tin-tuc" 
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
            >
              Xem tất cả
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          
          {/* Featured News */}
          {mainNews.length > 0 && (
            <div className="mb-16">
              <Link href={`/tin-tuc/${mainNews[0]?.slug}`}>
                <div className="grid md:grid-cols-2 gap-8 bg-gray-50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                  <div className="h-64 md:h-full">
                    <img 
                      src={mainNews[0]?.thumbnailUrl || "/placeholder-news.jpg"} 
                      alt={mainNews[0]?.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-8">
                    <span className="inline-block bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium mb-4">
                      Tin nổi bật
                    </span>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">{mainNews[0]?.title}</h3>
                    <p className="text-gray-600 mb-6 line-clamp-3">{mainNews[0]?.summary}</p>
                    <div className="text-blue-600 font-medium flex items-center gap-2">
                      Đọc tiếp
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}
          
          {/* News Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {sideNews.concat(otherNews).map((news, index) => (
              <Link href={`/tin-tuc/${news.slug}`} key={index}>
                <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow h-full flex flex-col">
                  <div className="h-48">
                    <img 
                      src={news.thumbnailUrl || "/placeholder-news.jpg"} 
                      alt={news.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 flex-grow">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">{news.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{news.summary}</p>
                    <div className="text-blue-600 text-sm font-medium mt-auto">
                      Đọc tiếp
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-blue-600 to-blue-800 text-white pt-16 pb-8">
        <div className="container mx-auto px-6">
          <Footer />
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
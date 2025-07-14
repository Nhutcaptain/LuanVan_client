"use client";

import React, { useEffect, useRef, useState } from "react";
import { FaPhoneAlt } from "react-icons/fa";
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
import CardComponent from "@/components/CardComponent/CardComponent";
import { newSplitter } from "@/utils/newsSpliiter";
import { newsData } from "@/data/news_data";
import NewsCardComponent from "@/components/NewsCardComponent/NewsCardComponent";
import Footer from "@/components/FooterComponent/Footer";
const HomePage = () => {
  const [isScrolledPastFirst, setIsScrolledPastFirst] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showAll, setShowAll] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0.1, // hợp lệ ở đây
    triggerOnce: false,
  });
  const showMoreRef = useRef<HTMLDivElement | null>(null);

  const { sideNews, mainNews, otherNews } = newSplitter(newsData);

  useEffect(() => {
    const onScroll = () => {
      const scrollPos = window.scrollY;
      const vh = window.innerHeight;

      setIsScrolledPastFirst(scrollPos >= vh);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY; // lấy scroll từ window
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
    handleScroll(); // init

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
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="relative flex flex-col min-h-screen">
        {/* Header */}

        <div className="section_container mb-20" ref={containerRef}>
          <section
            id="section1"
            className="relative h-screen flex items-center justify-center text-white"
          >
            {/* Main Content */}
            <main
              className={`flex w-full z-10
                        ${currentSection === 0 ? "fade-in" : "fade-in-hidden"}
                    `}
            >
              <div className="w-1/2 center text-center text-black">
                <h2 className="text-7xl font-bold mb-6">
                  Chào mừng bạn đến với bệnh viện Lục Lâm 2
                </h2>
                <div className="intro">
                  <p className="text-2xl mb-4 font-bold">
                    Chúng tôi cung cấp dịch vụ chăm sóc sức khỏe chất lượng cao.
                  </p>
                  <p className="text-2xl mb-4 font-bold">
                    Đội ngũ bác sĩ và nhân viên y tế chuyên nghiệp, tận tâm.
                  </p>
                  <p className="text-2xl mb-4 font-bold">
                    <span>Hỗ trợ tư vấn trực tuyến </span>
                    <span className="text-[#3D90D7]">24/24 với AI</span>
                  </p>
                  <p className="text-2xl mb-4 font-bold">
                    Liên hệ với chúng tôi để biết thêm thông tin.
                  </p>
                </div>
              </div>
            </main>
            <div className="background_image">
              <img src={"/bg/bg3.jpg"}></img>
            </div>
            <div className="hotline z-20 text-black w-70 absolute bottom-10 right-0">
              <a href="tel:1900-1234" className="flex items-center">
                <FaPhoneAlt className="text-3xl mr-2" />
                <span className="text-3xl font-bold">028 351 3333</span>
              </a>
            </div>
          </section>
          {/* Section 2 */}
          <section
            id="section2"
            className="flex items-center justify-center text-white flex-col"
          >
            <div
              className={`top_features flex-1 mt-20 ${
                currentSection === 1
                  ? "animate-fadeScaleIn"
                  : "animate-fadeScaleOut"
              } mb-10`}
            >
              <h2 className="text-4xl font-bold mb-6 text-center text-[#3D90D7]">
                Chăm sóc sức khoẻ cực đơn giản
              </h2>
              <div className="features ">
                <Link href={"/quan-ly/quan-ly-suc-khoe"}>
                  <ButtonCardComponent>
                    <FaHeartPulse size={80} color="#0065F8"></FaHeartPulse>
                    <p className="text-[#0065F8] font-bold">Quản lý sức khoẻ</p>
                  </ButtonCardComponent>
                </Link>
                <ButtonCardComponent>
                  <FaUserDoctor size={80} color="#0065F8"></FaUserDoctor>
                  <p className="text-[#0065F8] font-bold">Tìm bác sĩ</p>
                </ButtonCardComponent>
                <Link href={'/quan-ly/dat-lich-kham'}>
                  <ButtonCardComponent>
                    <FaCalendarDays size={80} color="#0065F8"></FaCalendarDays>
                    <p className="text-[#0065F8] font-bold">Đặt lịch khám</p>
                  </ButtonCardComponent>
                </Link>
                <Link href={'/quan-ly/chat'}>
                  <ButtonCardComponent>
                    <FaRobot size={80} color="#0065F8"></FaRobot>
                    <p className="text-[#0065F8] font-bold">Tư vấn AI</p>
                  </ButtonCardComponent>
                </Link>
              </div>
            </div>
            <div
              className="bottom_features flex-[2]"
              ref={(node) => {
                ref(node);
                showMoreRef.current = node;
              }}
            >
              <h2 className="text-4xl font-bold mb-6 text-center text-[#3D90D7]">
                Các chuyên khoa tại bệnh viện
              </h2>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView && { opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              >
                <div className={`grid md:grid-cols-4 grid-cols-2 gap-6`}>
                  {displayedItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <Link href={item.link || "#"} key={index}>
                        <ButtonCardComponent
                          key={index}
                          propStyle={{ width: 300 }}
                        >
                          <Icon size={80} color="#0065F8" />
                          <p className="text-[#0065F8] font-bold">
                            {item.name}
                          </p>
                        </ButtonCardComponent>
                      </Link>
                    );
                  })}
                </div>
                <div className="showMore text-center mt-10 mb-10 items-center justify-center flex">
                  <div
                    className="flex items-center justify-center gap-2 button_group w-50"
                    onClick={() => setShowAll(!showAll)}
                  >
                    <p className="text-[#0065F8] font-bold cursor-pointer text-2xl">
                      {showAll ? "Ẩn bớt" : "Xem thêm"}
                    </p>
                    <FaArrowDown
                      className={`arrow-icon text-[#0065F8] text-2xl cursor-pointer ${
                        showAll ? "arrow-up" : "arrow-down"
                      }`}
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
          {/* Section 3 */}
          <section
            id="section3"
            className="flex items-center justify-center text-gray-900 w-full mt-20"
          >
            <div className="px-4 text-center">
              <TitleComponent title="Các trưởng khoa dày dặn kinh nghiệm" />
              <div className="head_group grid grid-cols-2 md:grid-cols-4 gap-6">
                <CardComponent
                  imgUri="https://www.fvhospital.com/wp-content/uploads/2016/09/dr-le-dinh-phuong.jpg"
                  title="Bác sĩnh Lê Đình Phương"
                  description="Khoa Nhi"
                  index={0}
                ></CardComponent>
                <CardComponent
                  imgUri="https://www.fvhospital.com/wp-content/uploads/2016/09/dr-le-dinh-phuong.jpg"
                  title="Bác sĩnh Lê Đình Phương"
                  description="Khoa Nhi"
                  index={1}
                ></CardComponent>
                <CardComponent
                  imgUri="https://www.fvhospital.com/wp-content/uploads/2016/09/dr-le-dinh-phuong.jpg"
                  title="Bác sĩnh Lê Đình Phương"
                  description="Khoa Nhi"
                  index={2}
                ></CardComponent>
                <CardComponent
                  imgUri="https://www.fvhospital.com/wp-content/uploads/2016/09/dr-le-dinh-phuong.jpg"
                  title="Bác sĩnh Lê Đình Phương"
                  description="Khoa Nhi"
                  index={3}
                ></CardComponent>
              </div>
            </div>
          </section>
          <section
            id="section4"
            className="items-center justify-center text-gray-900 mt-20 section4"
          >
            <TitleComponent title="Bài viết" />
            <div className="news-group">
              <div className="top-news">
                <div className="side-news">
                  {sideNews.map((news, index) => (
                    <NewsCardComponent
                      articles={news}
                      key={index}
                    ></NewsCardComponent>
                  ))}
                </div>
                <div className="main-news">
                  {mainNews.map((news, index) => (
                    <NewsCardComponent
                      key={index}
                      isMainNews
                      articles={news}
                    ></NewsCardComponent>
                  ))}
                </div>
              </div>
              <div className="bottom-news grid grid-cols-1 md:grid-cols-3 gap-6">
                {otherNews.map((news, index) => (
                  <NewsCardComponent
                    key={index}
                    isOtherNews
                    articles={news}
                  ></NewsCardComponent>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="w-full bg-[#d7d7d7ef] py-6 mt-auto h-[500px] flex justify-center">
          <Footer />
        </footer>
      </div>
    </div>
  );
};

export default HomePage;

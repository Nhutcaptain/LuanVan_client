import React from 'react'
import './style.css'
import { MdAddLocationAlt } from "react-icons/md";
import { FaPhoneAlt } from "react-icons/fa";
import Link from 'next/link';

const Footer = () => {
  return (
    <div className='footer-container'>
        <div className="footer-content">
            <div>
                <h2 className='title'>Bệnh viện Lục Lâm 2</h2>
                <span className='content-container'>
                    <MdAddLocationAlt className='icon' size={34}/>
                    <p className='content'>Địa chỉ: 123 Đường ABC, Phường XYZ, Quận 1, TP.HCM</p>
                </span>
                <span className='content-container'>
                    <FaPhoneAlt className='icon' size={24}/>
                    <p className='content'>Số điện thoại: 0123 456 789</p>
                </span>
            </div>
        </div>
        <div className="footer-content">
            <div>
                <h2 className='title'>Hệ thống Lục Lâm</h2>
                <Link href={'#'} className='link'>
                    <p className='content'>Bệnh viện Lục Lâm</p>
                </Link>
            </div>
        </div>
        <div className="footer-content">
            <div>
                <h2 className='title'>Đường dẫn hữu ích</h2>
                <Link href={'#'} className='link'>
                    <p className='content'>Trang chủ</p>
                </Link>
                <Link href={'#'} className='link'>
                    <p className='content'>Tìm bác sĩ</p>
                </Link>
                <Link href={'#'} className='link'>
                    <p className='content'>Đặt lịch hẹn</p>
                </Link>
                <Link href={'#'} className='link'>
                    <p className='content'>Tin tức</p>
                </Link>

            </div>
        </div>
        <div className="footer-content">
            <div>
                <h2 className='title'>Hợp tác quốc tế</h2>
                <p className='content'>Tứ miếu nhất hội</p>
            </div>
            <div>
                <h2 className='title'>Theo dõi chúng tôi</h2>
                <p className='content'>Email: </p>
            </div>
        </div>
    </div>
  )
}

export default Footer
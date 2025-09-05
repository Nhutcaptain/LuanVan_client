'use client'
import React from 'react'
import Link from 'next/link'
import { RiHeartPulseLine, RiLogoutBoxLine } from "react-icons/ri";
import { FaRegRectangleList } from "react-icons/fa6";
import { LiaHistorySolid } from "react-icons/lia";
import { FaRegCalendarPlus } from "react-icons/fa";
import { usePathname } from 'next/navigation';
import { 
    MdAccountCircle, 
    MdPostAdd, 
    MdMedicalServices,
    MdSchedule,
    MdGroups,
    MdAttachMoney,
    MdLocalHospital,
    MdLogout
} from "react-icons/md";
import { FaPills, FaFileInvoiceDollar } from "react-icons/fa";
import Cookies from 'js-cookie';

const AdminSidebarMenu = () => {
    const pathname = usePathname();
    const sidebarData = [
        {
            icon: <MdAccountCircle className='text-2xl' />,
            label: 'Quản lý tài khoản',
            link: '/admin/account'
        },
        {
            icon: <MdPostAdd className='text-2xl' />,
            label: 'Đăng bài viết',
            link: '/admin/posts'
        },
        {
            icon: <FaPills className='text-2xl' />,
            label: 'Quản lý kho thuốc',
            link: '/admin/medicine-management'
        },
        {
            icon: <MdSchedule className='text-2xl' />,
            label: 'Phân công / xếp lịch',
            link: '/admin/schedules'
        },
        {
            icon: <MdLocalHospital className='text-2xl' />,
            label: 'Quản lý chuyên khoa',
            link: '/admin/department'
        },
        {
            icon: <FaFileInvoiceDollar className='text-2xl' />,
            label: 'Thống kê khám bệnh',
            link: '/admin/stats'
        },
        {
            icon: <MdMedicalServices className='text-2xl' />,
            label: 'Quản lý dịch vụ',
            link: '/admin/service'
        },
    ];
    const handleLogout = () => {
        // Add your logout logic here
        console.log('Logging out...');
        Cookies.remove('token');
    };

    return (
        <div className="h-screen sticky top-0">
            <aside className='w-72 bg-gradient-to-b from-blue-600 to-blue-800 text-white h-full p-4 shadow-xl'>
                {/* Logo/Header Section */}
                <div className="mb-10 pt-4 px-2">
                    <h2 className="text-2xl font-bold text-white">Hệ thống quản trị</h2>
                    <p className="text-blue-100 text-sm mt-1">Trung tâm y tế</p>
                </div>

                {/* Navigation Links */}
                <nav className='flex flex-col gap-2'>
                    {sidebarData.map((item, index) => (
                        <Link 
                            key={index} 
                            href={item.link} 
                            className={`flex items-center rounded-lg p-3 transition-all duration-300 hover:bg-blue-700 hover:pl-5
                            ${pathname === item.link ? 'bg-white text-blue-800 font-medium shadow-md' : 'text-white'}`}
                        >
                            <span className={`mr-3 ${pathname === item.link ? 'text-blue-600' : 'text-white'}`}>
                                {item.icon}
                            </span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* Logout Button */}
                <div className="mt-auto pt-6">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center w-full p-3 rounded-lg text-red-100 hover:bg-blue-700 hover:text-white transition-colors duration-300"
                    >
                        <RiLogoutBoxLine className='text-2xl mr-3' />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </aside>
        </div>
    )
}

export default AdminSidebarMenu;
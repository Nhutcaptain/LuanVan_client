'use client'
import React, { useEffect, useState } from 'react'
import './styles.css'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Home, Info, Contact, HeartPulse, User, History, LogOut, Menu, X } from 'lucide-react';

const HeaderComponent = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [user, setUser] = useState<{ fullName?: string, role?: string, avatar?: string } | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const router = useRouter()
    
    useEffect(() => {
        const onScroll = () => {
            setIsScrolled(window.scrollY > 50);
        }
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const updateUser = () => {
            const token = localStorage.getItem('token');
            const fullName = localStorage.getItem('fullName');
            const role = localStorage.getItem('role');
            const avatar = localStorage.getItem('avatar');
            
            if (token && fullName && role) {
                setUser({ 
                    fullName, 
                    role,
                    avatar: avatar || undefined
                });
            } else {
                setUser(null);
            }
        }
        
        updateUser();
        window.addEventListener('storage', updateUser);
        window.addEventListener('userChange', updateUser);
        
        return () => {
            window.removeEventListener('storage', updateUser);
            window.removeEventListener('userChange', updateUser);
        }
    }, []);

    const handleLogout = () => {
        Cookies.remove('token');
        localStorage.removeItem('token');
        localStorage.removeItem('fullName');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        localStorage.removeItem('doctorId');
        localStorage.removeItem('avatar');
        setUser(null);
        window.dispatchEvent(new Event('userChanged'));
        router.push('/');
        setIsMenuOpen(false);
    }

    const getInitials = (name?: string) => {
        if (!name) return 'US';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    return (
        <header
            className={`fixed top-0 left-0 w-full transition-all duration-300 z-50
            ${isScrolled ? 'bg-white/95 shadow-md py-2' : 'bg-white/80 py-3'}
            ${isMenuOpen ? 'bg-white' : ''}`}
        >
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-[#3D90D7] rounded-full flex items-center justify-center">
                            <HeartPulse className="text-white w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-[#3D90D7]">BỆNH VIỆN</span>
                            <span className="text-lg font-extrabold text-[#5A3E36] leading-4">Lục Lâm 2</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-1">
                        <NavLink href="/" icon={<Home size={16} />} isScrolled={isScrolled}>
                            Trang chủ
                        </NavLink>
                        <NavLink href="/about" icon={<Info size={16} />} isScrolled={isScrolled}>
                            Giới thiệu
                        </NavLink>
                        <NavLink href="/contact" icon={<Contact size={16} />} isScrolled={isScrolled}>
                            Liên hệ
                        </NavLink>
                        <NavLink href="/health-management" icon={<HeartPulse size={16} />} isScrolled={isScrolled}>
                            Quản lý sức khoẻ
                        </NavLink>

                        {user ? (
                            <div className="relative group ml-4">
                                <button className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition">
                                    <div className="w-8 h-8 rounded-full bg-[#3D90D7] text-white flex items-center justify-center">
                                        {user.avatar ? (
                                            <img 
                                                src={user.avatar} 
                                                alt={user.fullName} 
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        ) : (
                                            <span>{getInitials(user.fullName)}</span>
                                        )}
                                    </div>
                                    <span className={`${isScrolled ? 'text-gray-800' : 'text-gray-700'}`}>
                                        {user.fullName}
                                    </span>
                                </button>
                                
                                {/* Dropdown menu */}
                                <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                    <div className="py-1">
                                        <Link 
                                            href={user.role === 'patient' ? "/quan-ly/thong-tin" : "/bac-si/thong-tin"} 
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            <User className="mr-2 h-4 w-4" />
                                            Thông tin cá nhân
                                        </Link>
                                        <Link 
                                            href="/quan-ly/lich-su-kham-chua-benh" 
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            <History className="mr-2 h-4 w-4" />
                                            Lịch sử khám bệnh
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 ml-4">
                                <Link
                                    href="/tai-khoan/dang-nhap"
                                    className={`px-4 py-2 rounded-md border text-sm font-medium transition
                                    ${isScrolled ? 'border-[#3D90D7] text-[#3D90D7]' : 'border-[#3D90D7] text-[#3D90D7]'} hover:bg-[#3D90D7]/10`}
                                >
                                    Đăng nhập
                                </Link>
                                <Link
                                    href="/tai-khoan/dang-ky"
                                    className="px-4 py-2 rounded-md bg-[#3D90D7] text-white text-sm font-medium hover:bg-[#2566a6] transition"
                                >
                                    Đăng ký
                                </Link>
                            </div>
                        )}
                    </nav>

                    {/* Mobile menu button */}
                    <button 
                        className="md:hidden p-2 rounded-md focus:outline-none"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden pt-4 pb-6 space-y-2">
                        <MobileNavLink href="/" icon={<Home size={16} />} onClick={() => setIsMenuOpen(false)}>
                            Trang chủ
                        </MobileNavLink>
                        <MobileNavLink href="/about" icon={<Info size={16} />} onClick={() => setIsMenuOpen(false)}>
                            Giới thiệu
                        </MobileNavLink>
                        <MobileNavLink href="/contact" icon={<Contact size={16} />} onClick={() => setIsMenuOpen(false)}>
                            Liên hệ
                        </MobileNavLink>
                        <MobileNavLink href="/health-management" icon={<HeartPulse size={16} />} onClick={() => setIsMenuOpen(false)}>
                            Quản lý sức khoẻ
                        </MobileNavLink>

                        {user ? (
                            <div className="pt-4 border-t border-gray-200 mt-2">
                                <div className="flex items-center px-4 py-2">
                                    <div className="w-8 h-8 rounded-full bg-[#3D90D7] text-white flex items-center justify-center mr-3">
                                        {user.avatar ? (
                                            <img 
                                                src={user.avatar} 
                                                alt={user.fullName} 
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        ) : (
                                            <span>{getInitials(user.fullName)}</span>
                                        )}
                                    </div>
                                    <span className="font-medium">{user.fullName}</span>
                                </div>
                                <MobileNavLink 
                                    href={user.role === 'patient' ? "/quan-ly/thong-tin" : "/bac-si/thong-tin"} 
                                    icon={<User size={16} />}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Thông tin cá nhân
                                </MobileNavLink>
                                <MobileNavLink 
                                    href="/quan-ly/lich-su-kham-chua-benh" 
                                    icon={<History size={16} />}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Lịch sử khám bệnh
                                </MobileNavLink>
                                <button
                                    className="flex items-center w-full px-4 py-2 text-left text-sm font-medium text-red-600 hover:bg-gray-100 rounded-md"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Đăng xuất
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2 pt-4 border-t border-gray-200 mt-2">
                                <Link
                                    href="/tai-khoan/dang-nhap"
                                    className="flex-1 px-4 py-2 rounded-md border border-[#3D90D7] text-[#3D90D7] text-sm font-medium text-center hover:bg-[#3D90D7]/10 transition"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Đăng nhập
                                </Link>
                                <Link
                                    href="/tai-khoan/dang-ky"
                                    className="flex-1 px-4 py-2 rounded-md bg-[#3D90D7] text-white text-sm font-medium text-center hover:bg-[#2566a6] transition"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Đăng ký
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    )
}

// Reusable NavLink component for desktop
const NavLink = ({ href, children, icon, isScrolled }: { href: string, children: React.ReactNode, icon: React.ReactNode, isScrolled: boolean }) => {
    return (
        <Link
            href={href}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
            ${isScrolled ? 'text-gray-800 hover:bg-gray-100' : 'text-gray-700 hover:bg-gray-100'}`}
        >
            <span className="mr-1">{icon}</span>
            {children}
        </Link>
    )
}

// Reusable NavLink component for mobile
const MobileNavLink = ({ href, children, icon, onClick }: { href: string, children: React.ReactNode, icon: React.ReactNode, onClick: () => void }) => {
    return (
        <Link
            href={href}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            onClick={onClick}
        >
            <span className="mr-2">{icon}</span>
            {children}
        </Link>
    )
}

export default HeaderComponent
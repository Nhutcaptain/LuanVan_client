'use client'
import React, { useEffect, useState } from 'react'
import './styles.css'
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

const HeaderComponent = () => {
    const [isScrolledPastFirst, setIsScrolledPastFirst] = useState(false);
    const [user, setUser] = useState<{ fullName?: string, role?: string } | null>(null);

    useEffect(() => {
        const onScroll = () => {
            const scrollPos = window.scrollY;
            const vh = window.innerHeight;
            setIsScrolledPastFirst(scrollPos >= vh)
        }
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    },[]);

    // Kiểm tra đăng nhập (giả sử lưu token và tên trong localStorage)
    useEffect(() => {
        const updateUser = () => {
            const token = localStorage.getItem('token');
            const fullName = localStorage.getItem('fullName');
            const role = localStorage.getItem('role');
            if (token && fullName && role) {
                setUser({ fullName, role });
                console.log('User logged in:', fullName);
            } else {
                setUser(null);
            }
        }
        updateUser(); // Cập nhật user khi component mount
        window.addEventListener('storage', updateUser); // Cập nhật khi localStorage thay đổi
        window.addEventListener('userChange', updateUser); // Cập nhật khi user thay đổi
        return () => {
            window.removeEventListener('storage', updateUser);
            window.removeEventListener('userChange', updateUser);
        }

        
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('fullName');
        setUser(null);
        window.location.reload();
    }

    return (
        <div>
            <header
                className={`fixed top-0 left-0 w-full px-0 py-3 transition-colors duration-500 z-30 shadow-md
                ${isScrolledPastFirst ? 'bg-[#5A3E36]/95 text-white backdrop-blur' : 'bg-white/80 text-[#5A3E36]'}
                rounded-b-xl`}
            >
                <div className="header-container max-w-6xl mx-auto flex justify-between items-center px-4">
                    <h1 className="text-2xl font-extrabold tracking-wide flex items-center gap-2">
                        <span className="text-[#3D90D7]">Lục Lâm 2</span>
                        <span className="text-xs bg-[#3D90D7] text-white px-2 py-0.5 rounded-full ml-2">Bệnh viện</span>
                    </h1>
                    <nav className="space-x-2 flex items-center">
                        <Link href="/" className="px-3 py-2 rounded hover:bg-[#3D90D7]/10 transition font-medium">Trang chủ</Link>
                        <Link href="/about" className="px-3 py-2 rounded hover:bg-[#3D90D7]/10 transition font-medium">Giới thiệu</Link>
                        <Link href="/contact" className="px-3 py-2 rounded hover:bg-[#3D90D7]/10 transition font-medium">Liên hệ</Link>
                        <Link href="/contact" className="px-3 py-2 rounded hover:bg-[#3D90D7]/10 transition font-medium">Quản lý sức khoẻ</Link>
                        <div className="flex items-center gap-2 ml-4">
                            {user ? (
                                <>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger className="px-4 py-2 rounded-lg bg-[#3D90D7] text-white font-semibold hover:bg-[#2566a6] transition">
                                            {user.fullName}
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem>
                                                {user.role == 'patient' && (
                                                    <Link href="/quan-ly/thong-tin">Thông tin cá nhân</Link>
                                                )}

                                                {user.role == 'doctor' && (
                                                    <Link href="/bac-si/thong-tin">Thông tin cá nhân</Link>
                                                )}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Link href="/quan-ly/lich-su-kham-chua-benh">Lịch sử khám bệnh</Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={handleLogout}>
                                                Đăng xuất
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>

                                    </DropdownMenu>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/tai-khoan/dang-ky"
                                        className="px-4 py-2 rounded-lg bg-[#3D90D7] text-white font-semibold hover:bg-[#2566a6] transition"
                                    >
                                        Đăng ký
                                    </Link>
                                    <Link
                                        href="/tai-khoan/dang-nhap"
                                        className="px-4 py-2 rounded-lg border border-[#3D90D7] text-[#3D90D7] font-semibold hover:bg-[#3D90D7] hover:text-white transition"
                                    >
                                        Đăng nhập
                                    </Link>
                                </>
                            )}
                        </div>
                    </nav>
                </div>
            </header>
            <div className="header-content pt-20">
                {/* Nội dung khác có thể được thêm vào đây */}
            </div>
        </div>
    )
}

export default HeaderComponent
'use client';

import { usePathname } from 'next/navigation';
import HeaderComponent from './HeaderComponent/HeaderComponent';


export default function HeaderWrapper() {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');
  const isDoctorPage = pathname.startsWith('/bac-si');

  if (isAdminPage) return null;
  if (isDoctorPage) return null;
  return <HeaderComponent />;
}
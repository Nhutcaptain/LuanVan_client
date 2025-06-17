'use client';

import { usePathname } from 'next/navigation';
import HeaderComponent from './HeaderComponent/HeaderComponent';


export default function HeaderWrapper() {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  if (isAdminPage) return null;
  return <HeaderComponent />;
}
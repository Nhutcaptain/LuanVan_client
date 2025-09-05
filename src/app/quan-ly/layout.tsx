import SideBarMenuComponent from '@/components/SideBarMenu/SideBarMenuComponent';
import React from 'react'
interface Props {
    children: React.ReactNode
}

const AccountLayout = (prop: Props) => {
    const { children } = prop;
  return (
    <div className='flex min-h-screen'>
        <SideBarMenuComponent />
        <main className='flex-1 p-6'>{children}</main>
    </div>
  )
}

export default AccountLayout
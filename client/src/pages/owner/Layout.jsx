import React, { useEffect } from 'react'
import NavbarOwner from '../../components/owner/NavbarOwner'
import Sidebar from '../../components/owner/Sidebar'
import { Outlet } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'

const Layout = () => {
  const {isOwner, navigate} = useAppContext()

  useEffect(()=>{
    if(!isOwner){
      navigate('/')
    }
  },[isOwner])
  
  return (
    <div className='flex flex-col min-h-screen'>
      <NavbarOwner />
      <div className='flex flex-grow'>
        <Sidebar />
        <div className='flex-grow pl-20 md:pl-60 lg:pl-80 p-8 flex justify-center items-center'>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Layout
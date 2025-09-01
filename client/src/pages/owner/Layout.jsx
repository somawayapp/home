import React, { useState, useEffect } from 'react';
import NavbarOwner from '../../components/owner/NavbarOwner';
import Sidebar from '../../components/owner/Sidebar';
import { Outlet } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const Layout = () => {
  const { isOwner, navigate } = useAppContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);

  useEffect(() => {
    if (!isOwner) {
      navigate('/');
    }
    
    // Set initial sidebar state based on window size
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOwner, navigate]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className='flex flex-col min-h-screen'>
      <NavbarOwner />
      <div className='flex flex-grow'>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className={`flex-grow transition-all duration-300 px-4 md:px-12 lg:px-16 xl:px-24 flex justify-center items-start pt-8`}>
          <div className="w-full max-w-screen-xl">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
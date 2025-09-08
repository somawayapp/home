import React from 'react'
import { assets } from '../../assets/assets'
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const NavbarOwner = () => {
  const { user } = useAppContext();

  return (
    <div className="flex sticky top-0 flex-col z-50 bg-white">
      {/* Moving Tinder Gradient Bar */}
     

      {/* Navbar Content */}
      <div className="flex items-center justify-between px-6 md:px-10 py-4 text-gray-500 border-b border-borderColor relative transition-all">
        <Link to='/'>
          <img src={assets.logo} alt="" className="h-7"/>
        </Link>
        <p>Welcome, {user?.name || "Owner"}</p>
      </div>


       <div className="relative w-full h-[45px] overflow-hidden">
        <div className="absolute inset-0 animate-gradient-move bg-[linear-gradient(90deg,#FF5864,#FD297B,#FF5864,#FF655b)] bg-[length:200%_100%]"></div>
      </div>
    </div>
  );
};

export default NavbarOwner;


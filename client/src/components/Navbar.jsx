import React, { useState, useEffect, useRef } from 'react'
import { assets, menuLinks } from '../assets/assets'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import Hero from './Hero'
import NavbarLinks from './NavbarLinks'
import { motion } from 'motion/react'
import { div } from 'framer-motion/client'

const Navbar = () => {
  const { setShowLogin, user, logout, isOwner, axios, setIsOwner } = useAppContext()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const dropdownRef = useRef(null)

  const changeRole = async () => {
    try {
      const { data } = await axios.post('/api/owner/change-role')
      if (data.success) {
        setIsOwner(true)
        toast.success(data.message)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  // 🔒 Prevent body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [open])

  // ❌ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (


    
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`flex  flex-col  bg-white sticky mt-0 top-0 z-50 justify-between  px-6 md:px-16 lg:px-24 xl:px-32 text-gray-600
       border-b border-light relative transition-all ${location.pathname === '/' && 'bg-light'}`}
    >

        <div className=' flex  items-center pt-3 md:pt-9 justify-between  '>

    
      {/* Logo */}
      <Link to='/'>
        <motion.img whileHover={{ scale: 1.05 }} src={assets.logo} alt='logo' className='h-8' />
      </Link>




      <div className='flex flex-row gap-4'>


      {/* Right side buttons */}
      <div className='hidden sm:flex items-center gap-4'>
        <button
  onClick={() => {
    if (isOwner) {
      navigate('/owner')
    } else if (!user) {
      setShowLogin(true)   // 🔑 open login popup
    } else {
      changeRole()
    }
  }}
  className='cursor-pointer px-4 py-2 rounded-3xl hover:bg-gray-100 transition'
>
  {isOwner ? 'Dashboard' : 'Add listing'}
</button>


      </div>

    {/* Toggle Menu Button + Dropdown */}
<div className="relative">
  {/* Toggle Button */}
  <button
    className='cursor-pointer border border-light rounded-full px-3 py-3  md:py-1  md:px-2  shadow-md hover:shadow-md flex items-center gap-3'
    aria-label='Menu'
    onClick={() => setOpen(!open)}
  >
    <img src={assets.menu_icon} alt='menu' className='h-4 w-4 md:h-4 md:w-6 ' />
    <img
      src={user?.image || assets.user_profile}
      alt='user'
      className='hidden lg:block w-8 h-8 rounded-full object-cover'
    />
  </button>







  {open && (
    <div
      className="fixed inset-0 bg-black/10 z-30"
      onClick={() => setOpen(false)} // clicking backdrop closes menu
    ></div>
  )}
  {/* Dropdown Menu */}


<div
  ref={dropdownRef}   // ✅ attach ref here
  className={`absolute top-14 right-0 w-55 md:w-60 border pb-2 pt-1 border-light bg-white rounded-lg md:rounded-xl shadow-xl 
              flex flex-col items-stretch transition-all duration-300 z-40
              ${open ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0 pointer-events-none'}`}
>

  {menuLinks.map((link, index) => (
    <Link
      key={index}
      to={link.path}
      onClick={() => setOpen(false)}
      className="group relative w-full border-b border-borderColor py-1 px-4"
    >
      <span className="block py-2 text-left relative z-10">{link.name}</span>
      <span className="absolute inset-x-0 top-1 bottom-1 bg-gray-100 opacity-0 group-hover:opacity-100 transition"></span>
    </Link>
  ))}

  {/* List Cars / Dashboard */}
  <div
    onClick={() => {
                if (!user) {
                  setShowLogin(true)
                } else if (isOwner) {
                  navigate('/owner')
                } else {
                  changeRole()
                }
                setOpen(false)
              }}
    className="group relative w-full border-b border-borderColor px-4  py-1 cursor-pointer"
  >
    <span className="block py-2 text-left relative z-10">
      {isOwner ? 'Dashboard' : 'List cars'}
    </span>
    <span className="absolute inset-x-0 top-1 bottom-1 bg-gray-100 opacity-0 group-hover:opacity-100 transition"></span>
  </div>

  {/* Auth section */}
  {user ? (
    <div
      onClick={() => {
        logout();
        setOpen(false);
      }}
      className="group relative w-full px-4  py-1 cursor-pointer"
    >
      <span className="block py-2 text-left relative z-10">Logout</span>
      <span className="absolute inset-x-0 top-1 bottom-1 bg-gray-100 opacity-0 group-hover:opacity-100 transition"></span>
    </div>
  ) : (
    <div
     onClick={() => {
                  setShowLogin(true)
                  setOpen(false)
                }}

      className="group relative w-full px-4  py-1 cursor-pointer"
    >
      <span className="block py-2 text-left relative z-10">Login / Signup</span>
      <span className="absolute inset-x-0 top-1 bottom-1 bg-gray-100 opacity-0 group-hover:opacity-100 transition"></span>
    </div>
  )}
</div>
      
</div>

            </div>
    </div>



    </motion.div>

  )
}

export default Navbar
import React, { useState, useEffect, useRef } from 'react'
import { assets, cityList, menuLinks } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import { motion } from "framer-motion"
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'


const Hero = () => {
  const {showModal,  setShowModal } = useAppContext();
  const [showDesktop, setShowDesktop] = useState(true)
// ✅ Use filters + setFilters from context
const { filters, setFilters } = useAppContext();


const navigate = useNavigate()

const routerLocation = useLocation()
const currentPath = routerLocation.pathname

    const { setShowLogin, user, logout, isOwner, axios, setIsOwner } = useAppContext()
    const [open, setOpen] = useState(false)
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
  
    // Prevents body scroll when the mobile menu is open
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
  
    // Closes the dropdown when clicking outside
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


 const links = [
  { name: "Homes", path: "/", type: "video", src: assets.housevid },
  { name: "Agents", path: "/agents", type: "image", src: assets.agenticon },
  { name: "Projects", path: "/projects", type: "video", src: assets.upcomingvid },
]


  // Track screen size
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768)
    const [isMdScreen, setIsMdScreen] = useState(false);

  useEffect(() => {
    // Define the media query for 'md' screen size.
    // Tailwind's 'md' is typically >= 768px.
    const mediaQuery = window.matchMedia('(min-width: 768px)');

    const handleResize = () => {
      setIsMdScreen(mediaQuery.matches);
    };

    // Initial check
    handleResize();

    // Add listener for screen size changes
    mediaQuery.addEventListener('change', handleResize);

    // Cleanup function to remove the listener
    return () => {
      mediaQuery.removeEventListener('change', handleResize);
    };
  }, []); // Empty dependency array means this effect runs once on mount

  // Determine if the button should be animated
  const shouldAnimate = isMdScreen;

  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth < 768)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Read query params on mount
useEffect(() => {
  const params = new URLSearchParams(routerLocation.search);

  const locationParam = params.get("location");
  const minPriceParam = params.get("minPrice");
  const propertytypeParam = params.get("propertytype");

  // ✅ Only update if at least one param exists
  if (locationParam || minPriceParam || propertytypeParam) {
    setFilters((prev) => ({
      ...prev,
      ...(locationParam && { location: locationParam }),
      ...(minPriceParam && { minPrice: minPriceParam }),
      ...(propertytypeParam && { propertytype: propertytypeParam }),
    }));
  }
}, [routerLocation.search, setFilters]);


  // Disable scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = showModal ? 'hidden' : 'auto'
    return () => { document.body.style.overflow = 'auto' }
  }, [showModal])

  // Handle scroll compress (only desktop + home route)


useEffect(() => {
  if (isSmallScreen || location.pathname !== "/") {
    setShowDesktop(false)
    return
  }

  const topThreshold = 20    // First change after 20px
  const wall = 100           // Dead zone between 20px and 40px
  const bottomThreshold = topThreshold + wall // 40px
  let lastState = 'top'      // can be 'top' or 'bottom'

  const handleScroll = () => {
    const scrollY = window.scrollY

    if (scrollY < topThreshold && lastState !== 'top') {
      // Scroll is in top zone
      setShowDesktop(true)
      lastState = 'top'
    } else if (scrollY > bottomThreshold && lastState !== 'bottom') {
      // Scroll is in bottom zone
      setShowDesktop(false)
      lastState = 'bottom'
    }
    // If scroll is between topThreshold and bottomThreshold, do nothing (wall)
  }

  window.addEventListener("scroll", handleScroll)
  return () => window.removeEventListener("scroll", handleScroll)
}, [routerLocation.pathname])




  return (
    <div className="flex  border-b border-lighter flex-col bg-white transition-colors 
    duration-300 px-4   md:px-13   items-center justify-between 
    w-full sticky top-0 left-0 right-0 z-50 py-4 md:py-6 "
     style={{
    background: "linear-gradient(180deg, #ffffff 39.9%, #f8f8f8 100%)",
  }}>


      {/* === Desktop / MD+ form (expanded) */}
  

               


<div className="flex flex-row w-full  items-center justify-between">


<Link to="https://houseclient.vercel.app" className="z-50  ">
                {/* Larger screens → full logo */}

             <div className='text-primary hidden sm:block'>
              <svg
    width="92"
    height="32"
   
    style={{ display: "block" }}
  
 viewBox="0 0 3490 1080" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Hodii logo">
  
  <path d="
    M949.278 666.715
    C875.957 506.859 795.615 344.664 713.713 184.809
    C698.893 155.177 670.813 98.2527 645.852 67.8412
    C609.971 24.1733 556.93 0.779785 503.109 0.779785
    C449.288 0.779785 396.247 24.1733 360.366 67.8412
    C335.406 98.2527 307.325 155.177 292.505 184.809
    C210.603 344.664 130.262 506.859 56.9404 666.715
    C47.5802 687.769 24.9598 737.675 16.3796 760.289
    C6.23941 787.581 0.779297 817.213 0.779297 846.845
    C0.779297 975.509 101.401 1079.22 235.564 1079.22
    C346.326 1079.22 400 1015 400 940
  " fill="none" stroke="currentColor" stroke-width="110" stroke-linecap="round" stroke-linejoin="round"/>

  <path d="
    M400 940
    C400 930 400 470 400 470
    M400 705 L600 705
    M600 470
    C600 470 600 930 600 940
  " fill="none" stroke="currentColor" stroke-width="110" stroke-linecap="round" stroke-linejoin="round"/>

  <path d="
    M600 940
    C610 1010 640 1079.22 770.655 1079.22
    C904.817 1079.22 1006.22 975.509 1006.22 846.845
    C1006.22 817.213 999.979 787.581 989.839 760.289
    C981.259 737.675 958.638 687.769 949.278 666.715
  " fill="none" stroke="currentColor" stroke-width="110" stroke-linecap="round" stroke-linejoin="round"/>

  <text x="1200" y="650" font-family="Arial, sans-serif" font-size="800" font-weight="550" fill="currentColor" dominant-baseline="middle">hodii</text>
</svg>

</div>


                {/* Small screens → small icon */}

             <div className="text-primary block sm:hidden">
  <svg
    width="32"
    height="32"
    viewBox="300 -50 400 1150"
    preserveAspectRatio="xMidYMid meet"
    style={{ display: "block" }}
  >
    

  <path d="
    M949.278 666.715
    C875.957 506.859 795.615 344.664 713.713 184.809
    C698.893 155.177 670.813 98.2527 645.852 67.8412
    C609.971 24.1733 556.93 0.779785 503.109 0.779785
    C449.288 0.779785 396.247 24.1733 360.366 67.8412
    C335.406 98.2527 307.325 155.177 292.505 184.809
    C210.603 344.664 130.262 506.859 56.9404 666.715
    C47.5802 687.769 24.9598 737.675 16.3796 760.289
    C6.23941 787.581 0.779297 817.213 0.779297 846.845
    C0.779297 975.509 101.401 1079.22 235.564 1079.22
    C346.326 1079.22 400 1015 400 940
  " fill="none" stroke="currentColor" stroke-width="85" stroke-linecap="round" stroke-linejoin="round"/>

  <path d="
    M400 940
    C400 930 400 470 400 470
    M400 705 L600 705
    M600 470
    C600 470 600 930 600 940
  " fill="none" stroke="currentColor" stroke-width="85" stroke-linecap="round" stroke-linejoin="round"/>

  <path d="
    M600 940
    C610 1010 640 1079.22 770.655 1079.22
    C904.817 1079.22 1006.22 975.509 1006.22 846.845
    C1006.22 817.213 999.979 787.581 989.839 760.289
    C981.259 737.675 958.638 687.769 949.278 666.715
  " fill="none" stroke="currentColor" stroke-width="85" stroke-linecap="round" stroke-linejoin="round"/>
</svg>



</div>
            </Link>

              

{/*


   {!isSmallScreen && showDesktop && location.pathname === "/" && (
    <div className='flex flex-col mt-5  items-center justify-center'>


<div className="hidden md:flex  flex-row gap-10 mb-2 ml-4">
 
  {links.map((link) => {
    const isActive = currentPath === link.path
    return (
      <Link
        key={link.path}
        to={link.path}
        className={`relative flex items-center gap-2 transition-colors hover:text-black ${
          isActive ? " text-textdark" : " text-textlight"
        }`}
      >
        {link.type === "video" ? (
          <video
            src={link.src}
            autoPlay
            muted
            playsInline
            className="w-15 h-15 rounded-full object-cover"
          />
        ) : (
          <img
            src={link.src}
            alt={link.name}
            className="w-8 h-8 rounded-full object-cover"
          />
        )}

        <span className="inline-block">{link.name}</span>

        {isActive && (
          <span className="absolute left-[-1px] -bottom-0    w-[calc(100%+9px)] h-[3px] bg-black rounded-full"></span>
        )}
      </Link>
    )
  })}  

</div>


        

</div>
      )}
      
*/}





          {/* Now for all screens but was for  === Compressed / other screens & routes */}
       <motion.button
    initial={{ scale: 1, opacity: 1 }}
          animate={{
            // Apply animation only if it's an 'md' screen
            scale: shouldAnimate ? (showDesktop ? 1 : 0.9) : 1,
            opacity: shouldAnimate ? (showDesktop ? 1 : 0.95) : 1,
          }}
          transition={{ type: "spring", stiffness: 200, damping: 25, duration: 0.3 }}
          
  onClick={() => setShowModal(true)}
  className="
    flex items-center justify-between
    gap-1 md:gap-2
    bg-white rounded-full text-gray-600
    shadow-[0px_8px_20px_rgba(0,0,0,0.1)] border border-lightb
    ml-0 md:ml-[5%] max-w-150
  "
>
  <div className="flex-1 gap-0 md:gap-2 flex justify-between items-center">
   <div className="flex items-center">
  {/* === House Video Icon === */}
  <video
    src={assets.housevid}
    autoPlay
    loop
    muted
    playsInline
    className="w-13 h-9 md:h-11 md:w-15 rounded-full pl-0 md:pl-2  object-cover"
  />

  {/* === Text === */}
<span className=" pl-1 py_2 pr-2 font-medium text-neutral-800 text-[13px] md:text-[15px] rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
  {(filters.location || "Anywhere").slice(0, 10)}
</span>
</div>


    <span className="self-stretch my-2 hidden sm:block  w-px bg-borderColor"></span>


<span className="font-medium hidden sm:block text-neutral-800 p-2 text-[13px] md:text-[15px] rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
  {filters.minPrice ? `Ksh ${filters.minPrice}` : "Anyprice"}
</span>


<span className="self-stretch my-2  w-px bg-borderColor"></span>

<span className="font-medium text-neutral-800 p-2 rounded-full text-[13px] md:text-[15px] hover:bg-gray-100 transition-colors cursor-pointer">
  {(filters.propertytype || "Anytype").slice(0, 10)}
</span>


  </div>

  <div className="p-1 md:p-[5.5] ">
   <motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.85 }}
  className="flex items-center justify-center gap-1 p-[10] btn text-white rounded-full cursor-pointer"
>
  <svg
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    role="presentation"
    focusable="false"
    style={{
      display: "block",
      fill: "none",
      height: "12px",
      width: "12px",
      stroke: "currentColor",
      strokeWidth: 6,
      overflow: "visible",
    }}
  >
    <path d="m20.666 20.666 10 10"></path>
    <path
      d="m24.0002 12.6668c0 6.2593-5.0741 11.3334-11.3334 11.3334-6.2592 0-11.3333-5.0741-11.3333-11.3334 0-6.2592 5.0741-11.3333 11.3333-11.3333 6.2593 0 11.3334 5.0741 11.3334 11.3333z"
      fill="none"
    ></path>
  </svg>
</motion.button>

  </div>
</motion.button>




   <div className='flex items-center  gap-4'>
          {/* Dashboard/Add Listing button (hidden on small screens) */}
          <div className='hidden sm:flex items-center gap-4'>
            <button
              onClick={() => {
                if (isOwner) {
                  navigate('/owner')
                } else if (!user) {
                  setShowLogin(true)
                } else {
                  changeRole()
                }
              }}
              className='cursor-pointer text-neutral-800  text-[15px] font-medium rounded-3xl px-4 py-2 transition hover:bg-bgColor'
            >
              {isOwner ? 'Dashboard' : 'Become an agent'}
            </button>
          </div>

          {/* Toggle Menu Button */}
          <div className='relative text-neutral-800 hover:text-neutral-900 '>
            <button
              className='flex cursor-pointer items-center gap-3 rounded-full border border-borderColor 
              px-3 py-3  transition shadow-md hover:shadow-lg md:px-2 md:py-1'
              aria-label='Menu'
              onClick={() => setOpen(!open)}
            >
              <img src={assets.menu_icon} alt='menu' className='h-4 w-4 md:h-3 md:w-5' />
              <img
                src={user?.image || assets.user_profile}
                alt='user'
                className='hidden h-7 w-7 rounded-full object-cover lg:block'
              />
            </button>

            {/* Backdrop for mobile menu */}
            {open && (
              <div
                className='fixed inset-0 z-30 bg-black/10'
                onClick={() => setOpen(false)}
              ></div>
            )}

            {/* Dropdown Menu */}
            <div
              ref={dropdownRef}
              className={`fixed  right-6  md:right-16 top-20 z-40 flex w-55 flex-col items-stretch rounded-lg border border-light bg-white pb-2 pt-1 shadow-xl transition-all duration-300 md:w-60 md:rounded-xl ${
                open ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0 pointer-events-none'
              }`}
            >
              {menuLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.path}
                  onClick={() => setOpen(false)}
                  className='group relative w-full border-b border-borderColor px-4 py-1'
                >
                  <span className='relative z-10 block py-2 text-left'>{link.name}</span>
                  <span className='absolute inset-x-0 bottom-1 top-1 bg-gray-100 opacity-0 transition group-hover:opacity-100'></span>
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
                className='group relative w-full cursor-pointer border-b border-borderColor px-4 py-1'
              >
                <span className='relative z-10 block py-2 text-left'>
                  {isOwner ? 'Dashboard' : '  Create Listing'}
                </span>
                <span className='absolute inset-x-0 bottom-1 top-1 bg-gray-100 opacity-0 transition group-hover:opacity-100'></span>
              </div>

              {/* Auth section */}
              {user ? (
                <div
                  onClick={() => {
                    logout()
                    setOpen(false)
                  }}
                  className='group relative w-full rounded-xl   cursor-pointer px-4 py-1'
                >
                  <span className='relative z-10 block py-2 text-white  text-left'>Logout</span>
                  <span className='absolute inset-x-0 rounded-xl mx-2 bottom-1 top-1 bg-black  transition group-hover:bg-black/80'></span>
                </div>
              ) : (
                <div
                  onClick={() => {
                    setShowLogin(true)
                    setOpen(false)
                  }}
                  className='group relative w-full rounded-xl  cursor-pointer px-4 py-1'
                >
                  <span className='relative z-10 block py-2 text-white  text-left'>Login / Signup</span>
                  <span className='absolute inset-x-0 rounded-xl mx-2 bottom-1 top-1 bg-black  transition group-hover:bg-black/80'></span>
                </div>
              )}
            </div>
          </div>
        </div>

</div>

          {/* Toggle Menu Button 

   {!isSmallScreen && showDesktop && location.pathname === "/" && (

<motion.div
  initial={{ scale: 0.85, opacity: 0, y: -20 }}
  animate={{ scale: 1, opacity: 1, y: 0 }}
  transition={{ type: "spring", stiffness: 200, damping: 25, duration: 0.3 }}
  className="flex flex-col mb-8 w-full items-center"
>
  <div
        onClick={() => setShowModal(true)}
    className="hidden md:flex mt-2 w-full flex-row max-w-215 items-center justify-between rounded-full bg-white shadow-[0px_8px_20px_rgba(0,0,0,0.1)] border border-borderColor"
  >
    <div className="flex flex-row items-center w-full">
            <div class="group flex flex-row items-center">
        <div class="flex flex-col py-3 pr-29 pl-9 items-start rounded-full group-hover:bg-gray-100 transition-colors cursor-pointer">
          <p class="text-sm font-sm text-dark">Any where</p>
          <p class="mt-[-4px] text-textlight">
            {pickupLocation || " Search destinations"}
          </p>
        </div>
                <span class="h-9 w-px bg-borderColor opacity-100 group-hover:opacity-0 transition-opacity"></span>
      </div>

            <div class="group flex flex-row items-center">
        <span class="h-9 w-px bg-borderColor opacity-100 group-hover:opacity-0 transition-opacity"></span>
        <div class="flex flex-col py-3 px-8 items-start rounded-full group-hover:bg-gray-100 transition-colors cursor-pointer">
          <p class="text-sm font-sm text-dark">Any price</p>
          <p class="mt-[-4px] text-textlight">{pricePerDay || "Enter price "}</p>
        </div>
      </div>

            <div class="group flex flex-row items-center">
        <span class="h-9 w-px bg-borderColor opacity-100 group-hover:opacity-0 transition-opacity"></span>
        <div class="flex flex-col py-3 px-8 items-start rounded-full group-hover:bg-gray-100 transition-colors cursor-pointer">
          <p class="text-sm font-sm text-dark">Any type</p>
          <p class="mt-[-4px] text-textlight">{pickupLocation || " Select type"}</p>
        </div>
      </div>

            <div class="group flex flex-row items-center flex-grow">
        <span class="h-9 w-px bg-borderColor opacity-100 group-hover:opacity-0 transition-opacity"></span>
        <div class="flex flex-row items-center justify-between w-full rounded-full group-hover:bg-gray-100 transition-colors cursor-pointer">
                    <div class="flex flex-col py-3 px-8 items-start">
            <p class="text-sm font-sm text-textdark">Any size</p>
            <p class="mt-[-4px] text-textlight">{seatingCapacity || "Enter size"}</p>
          </div>
                    <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            class="flex items-center justify-center gap-1 px-4 mr-2 py-4 bg-primary btn text-white rounded-full cursor-pointer"
          >
            <img src={assets.search_icon} alt="search" class="brightness-300 md:h-5 md:w-5" />
          </motion.button>
        </div>
      </div>
    </div>
  </div>
</motion.div>




      )} */}

     
              
              
           

    </div>
  )
}

export default Hero
    
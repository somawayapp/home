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

             <div className='text-primary hidden sm:block  '>
           <svg width="102" height="32" viewBox="0 0 3490 1080" style={{ display: "block" }}>
           <path d="M1494.71 456.953C1458.28 412.178 1408.46 389.892 1349.68 389.892C1233.51 389.892 1146.18 481.906 1146.18 605.892C1146.18 729.877 1233.51 821.892 1349.68 821.892C1408.46 821.892 1458.28 799.605 1494.71 754.83L1500.95 810.195H1589.84V401.588H1500.95L1494.71 456.953ZM1369.18 736.895C1295.33 736.895 1242.08 683.41 1242.08 605.892C1242.08 528.373 1295.33 474.888 1369.18 474.888C1443.02 474.888 1495.49 529.153 1495.49 605.892C1495.49 682.63 1443.8 736.895 1369.18 736.895ZM1656.11 810.195H1750.46V401.588H1656.11V810.195ZM948.912 666.715C875.618 506.859 795.308 344.664 713.438 184.809C698.623 155.177 670.554 98.2527 645.603 67.8412C609.736 24.1733 556.715 0.779785 502.915 0.779785C449.115 0.779785 396.094 24.1733 360.227 67.8412C335.277 98.2527 307.207 155.177 292.392 184.809C210.522 344.664 130.212 506.859 56.9187 666.715C47.5621 687.769 24.9504 737.675 16.3736 760.289C6.2373 787.581 0.779297 817.213 0.779297 846.845C0.779297 975.509 101.362 1079.22 235.473 1079.22C346.193 1079.22 434.3 1008.26 502.915 934.18C571.53 1008.26 659.638 1079.22 770.357 1079.22C904.468 1079.22 1005.83 975.509 1005.83 846.845C1005.83 817.213 999.593 787.581 989.457 760.289C980.88 737.675 958.268 687.769 948.912 666.715ZM502.915 810.195C447.555 738.455 396.094 649.56 396.094 577.819C396.094 506.079 446.776 470.209 502.915 470.209C559.055 470.209 610.516 508.419 610.516 577.819C610.516 647.22 558.275 738.455 502.915 810.195ZM770.357 998.902C688.362 998.902 618.032 941.557 555.741 872.656C619.966 792.541 690.826 679.121 690.826 577.819C690.826 458.513 598.04 389.892 502.915 389.892C407.79 389.892 315.784 458.513 315.784 577.819C315.784 679.098 386.145 792.478 450.144 872.593C387.845 941.526 317.491 998.902 235.473 998.902C146.586 998.902 81.0898 931.061 81.0898 846.845C81.0898 826.57 84.2087 807.856 91.2261 788.361C98.2436 770.426 120.855 720.52 130.212 701.025C203.505 541.17 282.256 380.534 364.126 220.679C378.941 191.047 403.891 141.921 422.605 119.307C442.877 94.3538 470.947 81.0975 502.915 81.0975C534.883 81.0975 562.953 94.3538 583.226 119.307C601.939 141.921 626.89 191.047 641.704 220.679C723.574 380.534 802.325 541.17 875.618 701.025C884.975 720.52 907.587 770.426 914.604 788.361C921.622 807.856 925.52 826.57 925.52 846.845C925.52 931.061 859.244 998.902 770.357 998.902ZM3285.71 389.892C3226.91 389.892 3175.97 413.098 3139.91 456.953V226.917H3045.56V810.195H3134.45L3140.69 754.83C3177.12 799.605 3226.94 821.892 3285.71 821.892C3401.89 821.892 3489.22 729.877 3489.22 605.892C3489.22 481.906 3401.89 389.892 3285.71 389.892ZM3266.22 736.895C3191.6 736.895 3139.91 682.63 3139.91 605.892C3139.91 529.153 3191.6 474.888 3266.22 474.888C3340.85 474.888 3393.32 528.373 3393.32 605.892C3393.32 683.41 3340.07 736.895 3266.22 736.895ZM2827.24 389.892C2766.15 389.892 2723.56 418.182 2699.37 456.953L2693.13 401.588H2604.24V810.195H2698.59V573.921C2698.59 516.217 2741.47 474.888 2800.73 474.888C2856.87 474.888 2888.84 513.097 2888.84 578.599V810.195H2983.19V566.903C2983.19 457.733 2923.15 389.892 2827.24 389.892ZM1911.86 460.072L1905.62 401.588H1816.73V810.195H1911.08V604.332C1911.08 532.592 1954.74 486.585 2027.26 486.585C2042.85 486.585 2058.44 488.144 2070.92 492.043V401.588C2059.22 396.91 2044.41 395.35 2028.04 395.35C1978.58 395.35 1936.66 421.177 1911.86 460.072ZM2353.96 389.892C2295.15 389.892 2244.21 413.098 2208.15 456.953V226.917H2113.8V810.195H2202.69L2208.93 754.83C2245.36 799.605 2295.18 821.892 2353.96 821.892C2470.13 821.892 2557.46 729.877 2557.46 605.892C2557.46 481.906 2470.13 389.892 2353.96 389.892ZM2334.46 736.895C2259.84 736.895 2208.15 682.63 2208.15 605.892C2208.15 529.153 2259.84 474.888 2334.46 474.888C2409.09 474.888 2461.56 528.373 2461.56 605.892C2461.56 683.41 2408.31 736.895 2334.46 736.895ZM1703.28 226.917C1669.48 226.917 1642.08 254.326 1642.08 288.13C1642.08 321.934 1669.48 349.343 1703.28 349.343C1737.09 349.343 1764.49 321.934 1764.49 288.13C1764.49 254.326 1737.09 226.917 1703.28 226.917Z" fill="currentcolor"></path></svg>
             </div>

                {/* Small screens → small icon */}

            <div className="text-primary block sm:hidden">
  <svg
    width="32"
    height="32"
    viewBox="300 0 400 1080"
    preserveAspectRatio="xMidYMid meet"
    style={{ display: "block" }}
  >
    <path
      d="M949.278 666.715C875.957 506.859 795.615 344.664 713.713 184.809C698.893 155.177 670.813 98.2527 645.852 67.8412C609.971 24.1733 556.93 0.779785 503.109 0.779785C449.288 0.779785 396.247 24.1733 360.366 67.8412C335.406 98.2527 307.325 155.177 292.505 184.809C210.603 344.664 130.262 506.859 56.9404 666.715C47.5802 687.769 24.9598 737.675 16.3796 760.289C6.23941 787.581 0.779297 817.213 0.779297 846.845C0.779297 975.509 101.401 1079.22 235.564 1079.22C346.326 1079.22 434.468 1008.26 503.109 934.18C571.751 1008.26 659.892 1079.22 770.655 1079.22C904.817 1079.22 1006.22 975.509 1006.22 846.845C1006.22 817.213 999.979 787.581 989.839 760.289C981.259 737.675 958.638 687.769 949.278 666.715ZM503.109 810.195C447.728 738.455 396.247 649.56 396.247 577.819C396.247 506.079 446.948 470.209 503.109 470.209C559.27 470.209 610.751 508.419 610.751 577.819C610.751 647.22 558.49 738.455 503.109 810.195ZM770.655 998.902C688.628 998.902 618.271 941.557 555.955 872.656C620.205 792.541 691.093 679.121 691.093 577.819C691.093 458.513 598.271 389.892 503.109 389.892C407.947 389.892 315.906 458.513 315.906 577.819C315.906 679.098 386.294 792.478 450.318 872.593C387.995 941.526 317.614 998.902 235.564 998.902C146.642 998.902 81.1209 931.061 81.1209 846.845C81.1209 826.57 84.241 807.856 91.2611 788.361C98.2812 770.426 120.902 720.52 130.262 701.025C203.583 541.17 282.365 380.534 364.267 220.679C379.087 191.047 404.047 141.921 422.768 119.307C443.048 94.3538 471.129 81.0975 503.109 81.0975C535.09 81.0975 563.17 94.3538 583.451 119.307C602.171 141.921 627.132 191.047 641.952 220.679C723.854 380.534 802.635 541.17 875.957 701.025C885.317 720.52 907.937 770.426 914.957 788.361C921.978 807.856 925.878 826.57 925.878 846.845C925.878 931.061 859.576 998.902 770.655 998.902Z"
      fill="currentColor"
    />
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
    shadow-[0px_8px_20px_rgba(0,0,0,0.1)] border border-light
    ml-0 md:ml-[5%] max-w-150
  "
>
  <div className="flex-1 gap-1 md:gap-2 flex justify-between items-center">
   <div className="flex items-center gap-2">
  {/* === House Video Icon === */}
  <video
    src={assets.housevid}
    autoPlay
    loop
    muted
    playsInline
    className="w-15 h-11 rounded-full pl-2   object-cover"
  />

  {/* === Text === */}
<span className=" p-2 font-medium text-neutral-700 text-[13px] md:text-[15px] rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
  {(filters.location || "Anywhere").slice(0, 10)}
</span>
</div>


    <span className="self-stretch my-2  w-px bg-borderColor"></span>


<span className=" font-medium text-neutral-700 p-2 text-[13px] md:text-[15px] rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
{filters.minPrice ? `Ksh ${filters.minPrice}` : "Anyprice"}
</span>

<span className="self-stretch my-2  w-px bg-borderColor"></span>

<span className="font-medium text-neutral-700 p-2 rounded-full text-[13px] md:text-[15px] hover:bg-gray-100 transition-colors cursor-pointer">
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
              className='cursor-pointer text-neutral-700  text-[15px] font-medium rounded-3xl px-4 py-2 transition hover:bg-bgColor'
            >
              {isOwner ? 'Dashboard' : 'Become an agent'}
            </button>
          </div>

          {/* Toggle Menu Button */}
          <div className='relative text-neutral-700 hover:text-neutral-900 '>
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
    
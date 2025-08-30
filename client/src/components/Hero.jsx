import React, { useState, useEffect } from 'react'
import { assets, cityList } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import { useLocation } from 'react-router-dom'
import { motion } from "framer-motion"
import { Link } from "react-router-dom"


const Hero = () => {
  const [pickupLocation, setPickupLocation] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showDesktop, setShowDesktop] = useState(true)

  const { pricePerDay, setPricePerDay, seatingCapacity, setSeatingCapacity, navigate } = useAppContext()
  const location = useLocation()
  const currentPath = location.pathname

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
    const params = new URLSearchParams(location.search)
    const pickupLocationParam = params.get('pickupLocation')
    const pricePerDayParam = params.get('pricePerDay')
    const seatingCapacityParam = params.get('seatingCapacity')

    if (pickupLocationParam) setPickupLocation(pickupLocationParam)
    if (pricePerDayParam) setPricePerDay(pricePerDayParam)
    if (seatingCapacityParam) setSeatingCapacity(seatingCapacityParam)
  }, [location.search])

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
  const wall = 90            // Dead zone between 20px and 40px
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
}, [location.pathname])


  const handleSearch = (e) => {
    e.preventDefault()
    navigate(
      `/cars?pickupLocation=${pickupLocation}&pricePerDay=${pricePerDay}&seatingCapacity=${seatingCapacity}`
    )
    setShowModal(false)
  }

  return (
    <div className="flex items-center justify-center w-full">

      {/* === Desktop / MD+ form (expanded) */}
      {!isSmallScreen && showDesktop && location.pathname === "/" && (
           <motion.div
           initial={{ scale: 0.85, opacity: 0, y: -20 }} // Starts smaller, transparent, and higher up
            animate={{ scale: 1, opacity: 1, y: 0 }} // Expands to full size, becomes opaque, and moves to final position
            transition={{ type: "spring", stiffness: 200, damping: 25, duration: 0.3 }}
            className='flex flex-col items-center justify-center  '>
               


          <div className="flex flex-row items-center gap-6 ml-4">


  {/* === Links Section === */}
<div className="hidden md:flex flex-row gap-10 ml-4">
  {links.map((link) => {
    const isActive = currentPath === link.path
    return (
      <Link
        key={link.path}
        to={link.path}
        className={`relative flex items-center gap-2 transition-colors hover:text-black ${
          isActive ? "text-black" : " text-gray-700"
        }`}
      >
        {/* === Icon/Video/Image Left of Text === */}
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

        {/* === Link Text === */}
        <span className="inline-block">{link.name}</span>

        {/* === Active Underline === */}
        {isActive && (
          <span className="absolute left-[-1px] -bottom-0    w-[calc(100%+9px)] h-[3px] bg-black rounded-full"></span>
        )}
      </Link>
    )
  })}
</div>

</div>


        <div  onSubmit={handleSearch}
          className="hidden md:flex mt-5 mb-5 flex-row items-center justify-between rounded-full w-full  bg-white shadow-[0px_8px_20px_rgba(0,0,0,0.1)] border border-light"
        >
          <div className="flex flex-row items-center gap-9 ml-4" onClick={() => setShowModal(true)}>
            <div className="flex flex-col py-1 px-6 mr-9 items-start rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
              <p className="text-sm font-medium text-gray-700">Any where</p>
              <p className=" text-sm font-medium text-gray-500">{pickupLocation || ' search destinations'}</p>
            </div>

            <span className="h-10 w-px bg-gray-300"></span>
            <div className="flex flex-col py-1 px-6 items-start rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
              <p className="text-sm font-medium text-gray-700">Any price</p>
              <p className="text-sm font-medium text-gray-500">{pricePerDay || 'Enter max price '}</p>
            </div>

             <span className="h-10 w-px bg-gray-300"></span>
             <div className="flex flex-col py-1 px-6 items-start rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
              <p className="text-sm font-medium text-gray-700">Any type</p>
              <p className=" text-sm font-medium text-gray-500">{pickupLocation || ' select type'}</p>
            </div>


            <span className="h-10 w-px bg-gray-300"></span>
            <div className="flex flex-col py-1 px-6 items-start rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
              <p className="text-sm font-medium text-gray-700">Any size</p>
              <p className="text-sm text-gray-500">{seatingCapacity || 'Enter size'}</p>
            </div>
          </div>

          <div className="p-2  ml-5 ">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-1 px-4 py-4 bg-primary hover:bg-primary-dull text-white rounded-full cursor-pointer"
            >
              <img src={assets.search_icon} alt="search" className="brightness-300 md:h-5 md:w-5" />
            </motion.button>
          </div>
        </div>
              
              
              
                </motion.div>

      )}

      {/* === Compressed / other screens & routes */}
      {(isSmallScreen || !showDesktop) && (
       <motion.button
    initial={{ scale: 1, opacity: 1 }}
          animate={{
            // Apply animation only if it's an 'md' screen
            scale: shouldAnimate ? (showDesktop ? 1 : 0.85) : 1,
            opacity: shouldAnimate ? (showDesktop ? 1 : 0.95) : 1,
            y: shouldAnimate ? (showDesktop ? -10 : -5) : (showDesktop ? -10 : -5), // You might still want the 'y' animation
          }}
          transition={{ type: "spring", stiffness: 200, damping: 25, duration: 0.3 }}
          
  onClick={() => setShowModal(true)}
  className="
    flex items-center justify-between w-full
    gap-1 md:gap-4
    bg-white rounded-full text-gray-600
    shadow-[0px_8px_20px_rgba(0,0,0,0.1)] border border-light
    mt-4 md:mt-3 max-w-140 md:max-w-450
  "
>
  <div className="flex-1 gap-1 md:gap-4 flex justify-between items-center">
   <div className="flex items-center gap-2">
  {/* === House Video Icon === */}
  <video
    src={assets.housevid}
    autoPlay
    loop
    muted
    playsInline
    className="w-11 h-11 rounded-full object-cover"
  />

  {/* === Text === */}
  <span className="pr-2 pl-3 md:pl-5 py-2 font-medium text-md md:text-lg md:pr-4 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
    {pickupLocation || "Any where"}
  </span>
</div>


    <span className="self-stretch w-px bg-gray-300"></span>

    <span className="px-2 md:px-4 font-medium py-2 text-md md:text-lg rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
      {pricePerDay || "Any price"}
    </span>

    <span className="self-stretch w-px bg-gray-300"></span>

    <span className="px-2 md:px-4 font-medium py-2 text-md md:text-lg rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
      {seatingCapacity || "Any size"}
    </span>
  </div>

  <div className="p-1 md:p-2">
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center justify-center md:ml-2 gap-1 px-3 py-3 bg-primary hover:bg-primary-dull text-white rounded-full cursor-pointer"
    >
      <img src={assets.search_icon} alt="search" className="brightness-300" />
    </motion.button>
  </div>
</motion.button>

      )}









      {/* === Popup Modal */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/10 flex p-2 items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl p-6 w-full border border-light max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4">Filter Cars</h2>
            <form onSubmit={handleSearch} className="flex flex-col gap-4">
              <div>
                <label className="block mb-1">Pickup Location</label>
                <select value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} className="w-full border rounded-lg p-2">
                  <option value="">Select Location</option>
                  {cityList.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1">Price Per Day</label>
                <input
                  value={pricePerDay}
                  onChange={(e) => setPricePerDay(e.target.value)}
                  type="number"
                  placeholder="Enter price per day"
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block mb-1">Seating Capacity</label>
                <input
                  value={seatingCapacity}
                  onChange={(e) => setSeatingCapacity(e.target.value)}
                  type="number"
                  placeholder="Enter seating capacity"
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div className="flex justify-between mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg bg-gray-200">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white">Apply Filters</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default Hero
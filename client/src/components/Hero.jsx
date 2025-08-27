import React, { useState, useEffect } from 'react'
import { assets, cityList } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import { useLocation } from 'react-router-dom'
import { motion } from "framer-motion"

const Hero = () => {
  const [pickupLocation, setPickupLocation] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showDesktop, setShowDesktop] = useState(true)

  const { pricePerDay, setPricePerDay, seatingCapacity, setSeatingCapacity, navigate } = useAppContext()
  const location = useLocation()

  // Track screen size
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768)

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


    const threshold = 50
    const wall = 10
    let lastState = true

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > threshold + wall && lastState) {
        setShowDesktop(false)
        lastState = false
      } else if (currentScrollY < threshold - wall && !lastState) {
        setShowDesktop(true)
        lastState = true
      }
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
             initial={false}
                 key="hero-desktop"
            animate={{ scale: 1, opacity: 1, y: 0 }} // Expands to full size, becomes opaque, and moves to final position
            transition={{ type: "spring", stiffness: 200, damping: 25, duration: 0.3 }}
            className='flex flex-col items-center justify-center  '>
               


             <div className=' flex flex-row'>

              <p>homes</p>
                            <p>homes</p>
              <p>homes</p>

             </div>


        <div  onSubmit={handleSearch}
          className="hidden md:flex mt-5 flex-row items-center justify-between rounded-full w-full max-w-200 bg-white shadow-[0px_8px_20px_rgba(0,0,0,0.1)] border border-light"
        >
          <div className="flex flex-row items-center gap-8 ml-4" onClick={() => setShowModal(true)}>
            <div className="flex flex-col py-2 px-6 items-start gap-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
              <p className="text-sm font-medium text-gray-700">Pickup Location</p>
              <p className="px-1 text-sm text-gray-500">{pickupLocation || 'Please select location'}</p>
            </div>
            <span className="h-10 w-px bg-gray-300"></span>
            <div className="flex flex-col py-2 px-6 items-start gap-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
              <p className="text-sm font-medium text-gray-700">Price Per Day</p>
              <p className="px-1 text-sm text-gray-500">{pricePerDay || 'Enter price per day'}</p>
            </div>
            <span className="h-10 w-px bg-gray-300"></span>
            <div className="flex flex-col py-2 px-6 items-start gap-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
              <p className="text-sm font-medium text-gray-700">Seating Capacity</p>
              <p className="px-1 text-sm text-gray-500">{seatingCapacity || 'Enter seating capacity'}</p>
            </div>
          </div>

          <div className="p-2">
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
          scale: showDesktop ? 1 : 0.85,
          opacity: showDesktop ? 1 : 0.95,
          y: showDesktop ? 0 : -10
        }}
        transition={{ type: "spring", stiffness: 200, damping: 25, duration: 0.3 }}

          onClick={() => setShowModal(true)}
          className="flex items-center justify-between w-full max-w-120 gap-2 bg-white rounded-full text-gray-600
            shadow-[0px_8px_20px_rgba(0,0,0,0.1)] border border-light mt-4  md:mt-3"
        >
          <div className="flex-1 flex justify-between items-center text-md md:text-lg">
            <span className="px-4 py-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
              {pickupLocation || "Any location"}
            </span>
            <span className="self-stretch w-px bg-gray-300"></span>
            <span className="px-4 py-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
              {pricePerDay || "Any price"}
            </span>
            <span className="self-stretch w-px bg-gray-300"></span>
            <span className="px-4 py-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
              {seatingCapacity || "Any size"}
            </span>
          </div>

          <div className="p-1 md:p-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center ml-2 gap-1 px-3 py-3 bg-primary hover:bg-primary-dull text-white rounded-full cursor-pointer"
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
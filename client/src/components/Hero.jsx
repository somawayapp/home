import React, { useState, useEffect } from 'react'
import { assets, cityList } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import { motion } from 'motion/react'
import { useLocation } from 'react-router-dom'

const Hero = () => {
  const [pickupLocation, setPickupLocation] = useState('')
  const [showModal, setShowModal] = useState(false)

  const { pricePerDay, setPricePerDay, seatingCapacity, setSeatingCapacity, navigate } = useAppContext()
  const location = useLocation()

  // On mount, read query params and update state
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const pickupLocationParam = params.get('pickupLocation')
    const pricePerDayParam = params.get('pricePerDay')
    const seatingCapacityParam = params.get('seatingCapacity')

    if (pickupLocationParam) setPickupLocation(pickupLocationParam)
    if (pricePerDayParam) setPricePerDay(pricePerDayParam)
    if (seatingCapacityParam) setSeatingCapacity(seatingCapacityParam)
  }, [location.search])

  // Disable scrolling when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto' // cleanup
    }
  }, [showModal])

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(
      '/cars?pickupLocation=' +
        pickupLocation +
        '&pricePerDay=' +
        pricePerDay +
        '&seatingCapacity=' +
        seatingCapacity
    )
    setShowModal(false) // close modal after search
  }

  
  return (
    <>
      {/* Desktop / Tablet View */}
      <motion.form
        initial={{ scale: 0.95, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        onSubmit={handleSearch}
        className='hidden md:flex flex-row items-center justify-between  rounded-full w-full max-w-200 
         bg-white shadow-[0px_8px_20px_rgba(0,0,0,0.1)] borbder border-light'
      >
        <div className='flex flex-row items-center gap-8 ml-4'     onClick={() => setShowModal(true)}
>
       {/* Pickup Location */}
<div className='flex flex-col py-2 px-6 items-start gap-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer'>
  <p className="text-sm font-medium text-gray-700">Pickup Location</p>
  <p className='px-1 text-sm text-gray-500'>
    {pickupLocation ? pickupLocation : 'Please select location'}
  </p>
</div>

<span className="h-10 w-px bg-gray-300"></span>

{/* Price Per Day */}
<div className='flex flex-col py-2 px-6  items-start gap-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer'>
  <p className="text-sm font-medium text-gray-700">Price Per Day</p>
  <p className='px-1 text-sm text-gray-500'>
    {pricePerDay ? pricePerDay : 'Enter price per day'}
  </p>
</div>

<span className="h-10 w-px bg-gray-300"></span>

{/* Seating Capacity */}
<div className='flex flex-col py-2 px-6  items-start gap-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer'>
  <p className="text-sm font-medium text-gray-700">Seating Capacity</p>
  <p className='px-1 text-sm text-gray-500'>
    {seatingCapacity ? seatingCapacity : 'Enter seating capacity'}
  </p>
</div>

        </div>



       <div  className='p-2'>
         <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className='flex items-center justify-center gap-1 px-4 py-4 bg-primary hover:bg-primary-dull text-white rounded-full cursor-pointer'
        >
          <img src={assets.search_icon} alt='search' className='brightness-300 md:h-5 md:w-5' />
        </motion.button>
         </div>
       
      </motion.form>







    {/* Mobile View */}
  <button
    onClick={() => setShowModal(true)}
    className="w-full max-w-120 flex items-center  md:hidden justify-between gap-2 
               bg-white shadow-md rounded-full text-gray-600 text-sm border border-light"
  >


    {/* Texts spaced out */}
  <div className="flex-1 flex justify-between items-center text-xs sm:text-sm">
  {/* Any location */}
  <span className="px-4 py-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
    {pickupLocation || "Any location"}
  </span>

  {/* Divider */}
  <span className="self-stretch w-px bg-gray-300"></span>

  {/* Any price */}
  <span className="px-4 py-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
    {pricePerDay || "Any price"}
  </span>

  {/* Divider */}
  <span className="self-stretch w-px bg-gray-300"></span>

  {/* Any size */}
  <span className="px-4 py-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
    {seatingCapacity || "Any size"}
  </span>
</div>

     <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className='flex items-center justify-center ml-2 gap-1 px-3 py-3 bg-primary hover:bg-primary-dull text-white rounded-full cursor-pointer'
        >
          <img src={assets.search_icon} alt='search' className='brightness-300' />
        </motion.button>


  </button>


      {/* Popup Modal for Mobile Filters */}
      {showModal && (
     <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/10 flex p-2 items-center justify-center z-50"
     onClick={() => setShowModal(false)} // clicking outside closes modal

       >

          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl p-6 w-full border border-light  max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside

          >
            <h2 className="text-lg font-semibold mb-4">Filter Cars</h2>
            <form onSubmit={handleSearch} className="flex flex-col gap-4">
              {/* Pickup Location */}
              <div>
                <label className="block mb-1">Pickup Location</label>
                <select  value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} className="w-full border rounded-lg p-2">
                  <option value=''>Select Location</option>
                  {cityList.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Per Day */}
              <div>
                <label className="block mb-1">Price Per Day</label>
                <input
                  value={pricePerDay}
                  onChange={(e) => setPricePerDay(e.target.value)}
                  type='number'
                  placeholder='Enter price per day'
                  className="w-full border rounded-lg p-2"
                  
                />
              </div>

              {/* Seating Capacity */}
              <div>
                <label className="block mb-1">Seating Capacity</label>
                <input
                  value={seatingCapacity}
                  onChange={(e) => setSeatingCapacity(e.target.value)}
                  type='number'
                  placeholder='Enter seating capacity'
                  className="w-full border rounded-lg p-2"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary text-white"
                >
                  Apply Filters
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </>
  )
}

export default Hero

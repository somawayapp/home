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
        className='hidden md:flex flex-row items-center justify-between p-2 rounded-full w-full max-w-200 
         bg-white shadow-[0px_8px_20px_rgba(0,0,0,0.1)]'
      >
        <div className='flex flex-row items-center gap-8 ml-4'>
          {/* Pickup Location */}
          <div className='flex flex-col items-start gap-1'>
            <select required value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)}>
              <option value=''>Pickup Location</option>
              {cityList.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <p className='px-1 text-sm text-gray-500'>
              {pickupLocation ? pickupLocation : 'Please select location'}
            </p>
          </div>

    <span className="h-10 w-px bg-gray-300"></span>

          {/* Price Per Day */}
          <div className='flex flex-col items-start gap-1'>
            <label htmlFor='price-per-day'>Price Per Day</label>
            <input
              value={pricePerDay}
              onChange={(e) => setPricePerDay(e.target.value)}
              type='number'
              id='price-per-day'
              placeholder='Enter price per day'
              className='text-sm text-gray-500'
              required
            />
          </div>

    <span className="h-10 w-px bg-gray-300"></span>


          {/* Seating Capacity */}
          <div className='flex flex-col items-start gap-1'>
            <label htmlFor='seating-capacity'>Seating Capacity</label>
            <input
              value={seatingCapacity}
              onChange={(e) => setSeatingCapacity(e.target.value)}
              type='number'
              id='seating-capacity'
              placeholder='Enter seating capacity'
              className='text-sm text-gray-500'
              required
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className='flex items-center justify-center gap-1 px-5 py-5 bg-primary hover:bg-primary-dull text-white rounded-full cursor-pointer'
        >
          <img src={assets.search_icon} alt='search' className='brightness-300' />
        </motion.button>
      </motion.form>







    {/* Mobile View */}
<div className="md:hidden w-full flex justify-center">
  <button
    onClick={() => setShowModal(true)}
    className="w-full max-w-120 flex items-center justify-between gap-2 py-2 px-2 
               bg-white shadow-md rounded-full text-gray-600 text-sm 
               hover:bg-gray-100 transition-colors duration-200"
  >


    {/* Texts spaced out */}
    <div className="flex-1 flex justify-between text-xs sm:text-sm">
      <span>Any location</span>
          <span className="h-6 w-px bg-gray-300"></span>

      <span>Any price</span>
          <span className="h-6 w-px bg-gray-300"></span>

      <span>Any size</span>
    </div>

     <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className='flex items-center justify-center ml-2 gap-1 px-3 py-3 bg-primary hover:bg-primary-dull text-white rounded-full cursor-pointer'
        >
          <img src={assets.search_icon} alt='search' className='brightness-300' />
        </motion.button>


  </button>
</div>


      {/* Popup Modal for Mobile Filters */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
          >
            <h2 className="text-lg font-semibold mb-4">Filter Cars</h2>
            <form onSubmit={handleSearch} className="flex flex-col gap-4">
              {/* Pickup Location */}
              <div>
                <label className="block mb-1">Pickup Location</label>
                <select required value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} className="w-full border rounded-lg p-2">
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
                  required
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
                  required
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

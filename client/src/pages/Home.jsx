import React, { useEffect, useState, useRef } from 'react'
import Title from '../components/Title'
import { assets, dummyCarData } from '../assets/assets'
import CarCard from '../components/CarCard'
import { useSearchParams } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { motion } from 'motion/react'
import Hero from '../components/Hero'
import Navbar from '../components/Navbar'

const Home = () => {
  // Navbar ref for dynamic height
  const navbarRef = useRef(null)
  const [navbarHeight, setNavbarHeight] = useState(0)

  useEffect(() => {
    if (navbarRef.current) {
      setNavbarHeight(navbarRef.current.offsetHeight)
    }
  }, [])

  // Getting search params from URL
  const [searchParams] = useSearchParams()
  const pickupLocation = searchParams.get('pickupLocation')
  const pickupDate = searchParams.get('pickupDate')
  const returnDate = searchParams.get('returnDate')

  const { cars, axios } = useAppContext()
  const [input, setInput] = useState('')

  const isSearchData = pickupLocation && pickupDate && returnDate
  const [filteredCars, setFilteredCars] = useState([])

  // Filter locally based on input
  const applyFilter = async () => {
    if (input === '') {
      setFilteredCars(cars)
      return
    }

    const filtered = cars.slice().filter((car) => {
      return (
        car.brand.toLowerCase().includes(input.toLowerCase()) ||
        car.model.toLowerCase().includes(input.toLowerCase()) ||
        car.category.toLowerCase().includes(input.toLowerCase()) ||
        car.transmission.toLowerCase().includes(input.toLowerCase())
      )
    })
    setFilteredCars(filtered)
  }

  // Search server-side availability
  const searchCarAvailablity = async () => {
    const { data } = await axios.post('/api/bookings/check-availability', {
      location: pickupLocation,
      pickupDate,
      returnDate,
    })

    if (data.success) {
      setFilteredCars(data.availableCars)
      if (data.availableCars.length === 0) {
        toast('No cars available')
      }
    }
  }

  useEffect(() => {
    isSearchData && searchCarAvailablity()
  }, [])

  useEffect(() => {
    cars.length > 0 && !isSearchData && applyFilter()
  }, [input, cars])

  return (
    <div>
      {/* Navbar with ref */}
      <Navbar ref={navbarRef} />

      {/* Content starts below navbar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        style={{ marginTop: navbarHeight }} // dynamic spacing
        className="px-6 md:px-16 lg:px-24 xl:px-32"
      >
        <p className="text-gray-500 xl:px-20 max-w-7xl mx-auto">
          Showing {filteredCars.length} Cars
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-4 mx-auto">
          {filteredCars.map((car, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.4 }}
            >
              <CarCard car={car} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default Home

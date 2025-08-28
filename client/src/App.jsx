// App.js
import React, { useState, useEffect, useRef } from 'react'
import Navbar from './components/Navbar'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
// ... other imports

const App = () => {
  const { showLogin } = useAppContext()
  const isOwnerPath = useLocation().pathname.startsWith('/owner')

  const [navbarHeight, setNavbarHeight] = useState(0)
  const navbarRef = useRef(null)

  useEffect(() => {
    if (navbarRef.current) {
      setNavbarHeight(navbarRef.current.offsetHeight)
    }

    const handleResize = () => {
      if (navbarRef.current) {
        setNavbarHeight(navbarRef.current.offsetHeight)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <>
      {showLogin && <Login />}

      {!isOwnerPath && <Navbar ref={navbarRef} />}

      {/* Main content wrapper with padding equal to navbar height */}
      <div style={{ paddingTop: !isOwnerPath ? navbarHeight : 0 }}>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/car-details/:id' element={<CarDetails />} />
          <Route path='/cars' element={<Cars />} />
          <Route path='/my-bookings' element={<MyBookings />} />
          <Route path='/owner' element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path='add-car' element={<AddCar />} />
            <Route path='manage-cars' element={<ManageCars />} />
            <Route path='manage-bookings' element={<ManageBookings />} />
          </Route>
        </Routes>
      </div>

      {!isOwnerPath && <Footer />}
    </>
  )
}

export default App

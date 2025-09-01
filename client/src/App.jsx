import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import CarDetails from './pages/CarDetails'
import Cars from './pages/Cars'
import MyBookings from './pages/MyBookings'
import Layout from './pages/owner/Layout'
import Dashboard from './pages/owner/Dashboard'
import AddListing from './pages/owner/AddListing'
import ManageCars from './pages/owner/ManageCars'
import ManageBookings from './pages/owner/ManageBookings'
import Login from './components/Login'
import { Toaster } from 'react-hot-toast'
import { useAppContext } from './context/AppContext'
import SiteLayout from './components/SiteLayout'

const App = () => {
  const { showLogin } = useAppContext()

  return (
    <>
      <Toaster />
      {showLogin && <Login />}

      <Routes>
        {/* Public site layout */}
        <Route element={<SiteLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/car-details/:id" element={<CarDetails />} />
          <Route path="/cars" element={<Cars />} />
          <Route path="/my-bookings" element={<MyBookings />} />
        </Route>

        {/* Owner dashboard layout */}
        <Route path="/owner" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="add-listing" element={<AddListing />} />
          <Route path="manage-cars" element={<ManageCars />} />
          <Route path="manage-bookings" element={<ManageBookings />} />
        </Route>
      </Routes>
    </>
  )
}

export default App

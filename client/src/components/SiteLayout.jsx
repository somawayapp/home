// src/components/SiteLayout.jsx
import React from "react"
import Navbar from "./Navbar"
import Footer from "./Footer"
import { Outlet } from "react-router-dom"
import { useAppContext } from "../context/AppContext"

const SiteLayout = () => {
  const { showLogin } = useAppContext()

  return (
    <div className="flex flex-col min-h-screen">
               <Navbar />


      <main className="flex-1">
        <Outlet /> {/* This renders the page content */}
      </main>

      <Footer />
    </div>
  )
}

export default SiteLayout

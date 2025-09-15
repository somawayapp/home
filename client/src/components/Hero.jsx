import React, { useState, useEffect, useRef } from "react";
import { assets, menuLinks, cityList } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

const Hero = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setShowLogin, user, logout, isOwner, axios, setIsOwner } =
    useAppContext();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // --- Filter state ---
  const [filters, setFilters] = useState({
    location: "",
    lat: null,
    lng: null,
    radius: 2000,
    price: "",
    propertyType: "",
    bedrooms: "",
    bathrooms: "",
  });

  const { setShowModal } = useAppContext();


  const [mapCenter, setMapCenter] = useState([0.3476, 32.5825]); // Kampala default
  const [markerPosition, setMarkerPosition] = useState(null);

  // --- Current Location ---
  const handleUseCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setMapCenter([latitude, longitude]);
        setMarkerPosition([latitude, longitude]);
        setFilters({ ...filters, lat: latitude, lng: longitude });
      },
      (err) => toast.error("Failed to get location"),
      { enableHighAccuracy: true }
    );
  };

  // --- Map click to choose location ---
  function LocationSelector() {
    useMapEvents({
      click(e) {
        setMarkerPosition([e.latlng.lat, e.latlng.lng]);
        setFilters({ ...filters, lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });
    return null;
  }

  // --- Handle Search ---
  const handleSearch = () => {
    const query = new URLSearchParams(filters).toString();
    navigate(`/listings?${query}`);
    setShowModal(false);
  };

  // --- Close dropdown on outside click ---
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="flex flex-col bg-white sticky top-0 left-0 right-0 z-50 border-b border-borderColor px-4 md:px-12"
      style={{
        background: "linear-gradient(180deg, #ffffff 39.9%, #f8f8f8 100%)",
      }}
    >
      {/* --- Top Navigation --- */}
      <div className="flex w-full items-center justify-between">
        <Link to="/" className="z-50 py-4 md:py-6">
          <img src={assets.logo} alt="logo" className="h-8" />
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Add Listing / Dashboard */}
          <button
            onClick={() => {
              if (isOwner) navigate("/owner");
              else if (!user) setShowLogin(true);
              else changeRole();
            }}
            className="hidden sm:flex cursor-pointer rounded-3xl px-4 py-2 hover:bg-bgColor"
          >
            {isOwner ? "Dashboard" : "Add Listing"}
          </button>

          {/* Dropdown Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center gap-3 rounded-full border border-borderColor px-3 py-2 hover:shadow-md"
              onClick={() => setOpen(!open)}
            >
              <img src={assets.menu_icon} alt="menu" className="h-4 w-4" />
              <img
                src={user?.image || assets.user_profile}
                alt="user"
                className="h-8 w-8 rounded-full object-cover"
              />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg border border-light bg-white shadow-xl">
                {menuLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
                <div
                  className="block px-4 py-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    if (!user) setShowLogin(true);
                    else logout();
                    setOpen(false);
                  }}
                >
                  {user ? "Logout" : "Login / Signup"}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


<button onClick={() => setShowModal(true)}>Open Filter Modal</button>



      {/* --- Search Bar --- */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="flex items-center justify-between max-w-4xl mx-auto w-full rounded-full bg-white shadow-md border px-6 py-3 cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        <span className="text-gray-700">
          {filters.location || "Search location"}
        </span>
        <span className="text-gray-400">|</span>
        <span>{filters.price ? `Up to ${filters.price}` : "Any Price"}</span>
        <span className="text-gray-400">|</span>
        <span>
          {filters.propertyType ? filters.propertyType : "Any Property Type"}
        </span>
        <span className="text-gray-400">|</span>
        <span>
          {filters.bedrooms
            ? `${filters.bedrooms}+ Beds`
            : "Any Bedrooms"}
        </span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="ml-4 bg-primary text-white px-4 py-2 rounded-full"
        >
          <img src={assets.search_icon} alt="search" className="h-4 w-4" />
        </motion.button>
      </motion.div>

    
    </div>
  );
};

export default Hero;

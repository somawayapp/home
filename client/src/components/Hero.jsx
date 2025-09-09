import React, { useState, useEffect, useRef } from 'react'
import { assets, cityList, menuLinks } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import { motion } from "framer-motion"
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import FilterModal from './FilterModal'
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const Hero = ( {  showModal,
    setShowModal,
    handleSearch,
    filters,
    setFilters,
    useCurrentLocation,
   
  }) => {
    const [mapCenter, setMapCenter] = useState([0.3476, 32.5825]); // Default center (Kampala as fallback)
    const [radius, setRadius] = useState(2000); // meters
    const [markerPosition, setMarkerPosition] = useState(null);
  
    // Get current location if available
    const handleUseCurrentLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setMapCenter([latitude, longitude]);
          setMarkerPosition([latitude, longitude]);
          setFilters({ ...filters, lat: latitude, lng: longitude, radius });
        },
        (err) => console.log("Location error:", err),
        { enableHighAccuracy: true }
      );
    };
  
    function LocationSelector() {
      useMapEvents({
        click(e) {
          setMarkerPosition([e.latlng.lat, e.latlng.lng]);
          setFilters({ ...filters, lat: e.latlng.lat, lng: e.latlng.lng, radius });
        },
      });
      return null;
    }
  
  const [pickupLocation, setPickupLocation] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showDesktop, setShowDesktop] = useState(true)

  const { pricePerDay, setPricePerDay, seatingCapacity, setSeatingCapacity, navigate } = useAppContext()
  const location = useLocation()
  const currentPath = location.pathname
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
}, [location.pathname])


  const handleSearch = (e) => {
    e.preventDefault()
    navigate(
      `/cars?pickupLocation=${pickupLocation}&pricePerDay=${pricePerDay}&seatingCapacity=${seatingCapacity}`
    )
    setShowModal(false)
  }

  return (
    <div className="flex border border-bottom border-borderColor flex-col bg-white transition-colors duration-300 px-4 md:px-12 items-center justify-between 
    w-full sticky top-0 left-0 right-0 z-50  "
     style={{
    background: "linear-gradient(180deg, #ffffff 39.9%, #f8f8f8 100%)",
  }}>

      {/* === Desktop / MD+ form (expanded) */}
  

               


<div className="flex flex-row w-full items-start justify-between">


<Link to="/" className="z-50 py-4 md:py-7 ">
              {/* Small screens → small icon */}
              <motion.img
                whileHover={{ scale: 1.05 }}
                src={assets.smalllogo}
                alt="logo"
                className="h-8 block sm:hidden"
              />
            
              {/* Larger screens → full logo */}
              <motion.img
                whileHover={{ scale: 1.05 }}
                src={assets.logo}
                alt="logo"
                className="h-8 hidden sm:block"
              />
            </Link>

              

  {/* === Links Section === */}

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
    flex items-center justify-between
    gap-1 md:gap-4
    bg-white rounded-full text-gray-600
    shadow-[0px_8px_20px_rgba(0,0,0,0.1)] border border-light
    mt-4 md:mt-6 max-w-150
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
    className="w-11 h-11 rounded-full pl-3 md:pl-5  object-cover"
  />

  {/* === Text === */}
  <span className="px-2 py-2 font-medium text-textdark text-md md:text-lg md:pr-4 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
    {pickupLocation || "Any where"}
  </span>
</div>


    <span className="self-stretch  w-px bg-borderColor"></span>

    <span className="px-2 md:px-4 font-medium  text-textdark py-2 text-md md:text-lg rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
      {pricePerDay || "Any price"}
    </span>

    <span className="self-stretch w-px bg-borderColor"></span>

    <span className="px-2 md:px-4 font-medium  text-textdark  py-2 text-md md:text-lg rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
      {seatingCapacity || "Any size"}
    </span>
  </div>

  <div className="p-1 md:p-2">
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center justify-center md:ml-2 gap-1 px-3 py-3 btn text-white rounded-full cursor-pointer"
    >
      <img src={assets.search_icon} alt="search" className="brightness-300" />
    </motion.button>
  </div>
</motion.button>

      )}




   <div className='flex items-center py-4 md:py-7 gap-4'>
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
              className='cursor-pointer  rounded-3xl px-4 py-2 transition hover:bg-bgColor'
            >
              {isOwner ? 'Dashboard' : 'Add listing'}
            </button>
          </div>

          {/* Toggle Menu Button */}
          <div className='relative text-textlight'>
            <button
              className='flex cursor-pointer items-center gap-3 rounded-full border border-borderColor 
              px-3 py-3  transition hover:shadow-md md:px-2 md:py-1'
              aria-label='Menu'
              onClick={() => setOpen(!open)}
            >
              <img src={assets.menu_icon} alt='menu' className='h-4 w-4 md:h-4 md:w-6' />
              <img
                src={user?.image || assets.user_profile}
                alt='user'
                className='hidden h-8 w-8 rounded-full object-cover lg:block'
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
              className={`fixed  right-6  md:right-16 lg:right-24 xl:right-32  top-14 z-40 flex w-55 flex-col items-stretch rounded-lg border border-light bg-white pb-2 pt-1 shadow-xl transition-all duration-300 md:w-60 md:rounded-xl ${
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
                  {isOwner ? 'Dashboard' : 'List cars'}
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
                  className='group relative w-full cursor-pointer px-4 py-1'
                >
                  <span className='relative z-10 block py-2 text-left'>Logout</span>
                  <span className='absolute inset-x-0 bottom-1 top-1 bg-gray-100 opacity-0 transition group-hover:opacity-100'></span>
                </div>
              ) : (
                <div
                  onClick={() => {
                    setShowLogin(true)
                    setOpen(false)
                  }}
                  className='group relative w-full cursor-pointer px-4 py-1'
                >
                  <span className='relative z-10 block py-2 text-left'>Login / Signup</span>
                  <span className='absolute inset-x-0 bottom-1 top-1 bg-gray-100 opacity-0 transition group-hover:opacity-100'></span>
                </div>
              )}
            </div>
          </div>
        </div>

</div>


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




      )}

     
              
              
           
    








      {/* === Popup Modal */}
       showModal && (
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
               className="bg-white rounded-2xl p-6 w-full border border-light max-w-3xl shadow-xl max-h-[90vh] overflow-y-auto"
               onClick={(e) => e.stopPropagation()}
             >
               <h2 className="text-lg font-semibold mb-4">Filter Listings</h2>
     
               {/* Location Search */}
               <div className="flex flex-col gap-4">
                 <label className="block text-sm font-medium">Location</label>
                 <input
                   type="text"
                   placeholder="Type a city or area"
                   value={filters.pickupLocation || ""}
                   onChange={(e) => setFilters({ ...filters, pickupLocation: e.target.value })}
                   className="w-full border rounded-lg p-2"
                 />
                 <button
                   type="button"
                   onClick={handleUseCurrentLocation}
                   className="px-4 py-2 rounded-lg bg-primary text-white"
                 >
                   Use Current Location
                 </button>
               </div>
     
               {/* Map Picker */}
               <div className="mt-4 rounded-lg overflow-hidden border h-72">
                 <MapContainer center={mapCenter} zoom={13} style={{ height: "100%", width: "100%" }}>
                   <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                   <LocationSelector />
                   {markerPosition && (
                     <>
                       <Marker position={markerPosition}></Marker>
                       <Circle center={markerPosition} radius={radius} />
                     </>
                   )}
                 </MapContainer>
                 <div className="flex items-center gap-3 mt-2">
                   <label>Search Radius:</label>
                   <input
                     type="range"
                     min="500"
                     max="10000"
                     step="500"
                     value={radius}
                     onChange={(e) => {
                       setRadius(Number(e.target.value));
                       setFilters({ ...filters, radius: Number(e.target.value) });
                     }}
                   />
                   <span>{Math.round(radius / 1000)} km</span>
                 </div>
               </div>
     
               {/* Filters */}
               <div className="grid grid-cols-2 gap-4 mt-4">
                 <div>
                   <label className="block mb-1">Max Price</label>
                   <input
                     type="number"
                     placeholder="Max price"
                     value={filters.pricePerDay || ""}
                     onChange={(e) => setFilters({ ...filters, pricePerDay: e.target.value })}
                     className="w-full border rounded-lg p-2"
                   />
                 </div>
                 <div>
                   <label className="block mb-1">Property Type</label>
                   <select
                     value={filters.propertyType || ""}
                     onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
                     className="w-full border rounded-lg p-2"
                   >
                     <option value="">Any</option>
                     <option value="apartment">Apartment</option>
                     <option value="house">House</option>
                     <option value="land">Land</option>
                     <option value="commercial">Commercial</option>
                   </select>
                 </div>
                 <div>
                   <label className="block mb-1">Bedrooms</label>
                   <input
                     type="number"
                     placeholder="Min bedrooms"
                     value={filters.bedrooms || ""}
                     onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
                     className="w-full border rounded-lg p-2"
                   />
                 </div>
                 <div>
                   <label className="block mb-1">Bathrooms</label>
                   <input
                     type="number"
                     placeholder="Min bathrooms"
                     value={filters.bathrooms || ""}
                     onChange={(e) => setFilters({ ...filters, bathrooms: e.target.value })}
                     className="w-full border rounded-lg p-2"
                   />
                 </div>
               </div>
     
               {/* Footer */}
               <div className="flex justify-between mt-6">
                 <button
                   type="button"
                   onClick={() => setShowModal(false)}
                   className="px-4 py-2 rounded-lg bg-gray-200"
                 >
                   Cancel
                 </button>
                 <button
                   type="button"
                   onClick={handleSearch}
                   className="px-4 py-2 rounded-lg bg-primary text-white"
                 >
                   Apply Filters
                 </button>
               </div>
             </motion.div>
           </motion.div>
         )
    </div>
  )
}

export default Hero
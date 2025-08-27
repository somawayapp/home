import React, { useState, useEffect } from "react";
import { assets, cityList } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Hero = () => {
  const [pickupLocation, setPickupLocation] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isCompressed, setIsCompressed] = useState(false);

  const { pricePerDay, setPricePerDay, seatingCapacity, setSeatingCapacity, navigate } = useAppContext();
  const location = useLocation();

  // Read query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("pickupLocation")) setPickupLocation(params.get("pickupLocation"));
    if (params.get("pricePerDay")) setPricePerDay(params.get("pricePerDay"));
    if (params.get("seatingCapacity")) setSeatingCapacity(params.get("seatingCapacity"));
  }, [location.search]);

  // Disable scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [showModal]);

  // Scroll listener for compressing
  useEffect(() => {
    if (location.pathname !== "/") {
      setIsCompressed(true);
      return;
    }

    const handleScroll = () => {
      setIsCompressed(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(
      "/cars?pickupLocation=" +
        pickupLocation +
        "&pricePerDay=" +
        pricePerDay +
        "&seatingCapacity=" +
        seatingCapacity
    );
    setShowModal(false);
  };

  return (
    <div className="flex items-center justify-center w-full">
      {/* Desktop Form */}
      <motion.form
        initial={{ scale: 0.95, opacity: 0, y: 50 }}
        animate={{
          scale: 1,
          opacity: 1,
          y: 0,
          width: isCompressed ? "22rem" : "48rem",
          padding: isCompressed ? "0.25rem 0.5rem" : "0.5rem 1rem",
        }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        onSubmit={handleSearch}
        className="flex items-center justify-between bg-white shadow-[0px_8px_20px_rgba(0,0,0,0.1)] border border-light rounded-full w-full max-w-[48rem]"
      >
        <div
          className={`flex items-center ${
            isCompressed ? "justify-between w-full px-2" : "gap-8 ml-4"
          }`}
          onClick={() => setShowModal(true)}
        >
          {/* Pickup */}
          <div className={`flex flex-col items-start gap-1 rounded-full cursor-pointer hover:bg-gray-100 transition-colors py-2 px-6 ${isCompressed ? "px-4 py-2" : "py-2 px-6"}`}>
            <p className={`text-sm font-medium text-gray-700 ${isCompressed ? "text-xs" : "text-sm"}`}>Pickup Location</p>
            <p className={`text-gray-500 ${isCompressed ? "text-xs" : "text-sm"}`}>
              {pickupLocation || (isCompressed ? "Any location" : "Please select location")}
            </p>
          </div>

          <span className={`self-stretch w-px bg-gray-300 ${isCompressed ? "hidden" : "block"}`}></span>

          {/* Price */}
          {!isCompressed && (
            <div className="flex flex-col items-start gap-1 rounded-full cursor-pointer hover:bg-gray-100 transition-colors py-2 px-6">
              <p className="text-sm font-medium text-gray-700">Price Per Day</p>
              <p className="px-1 text-sm text-gray-500">{pricePerDay || "Enter price per day"}</p>
            </div>
          )}

          <span className={`self-stretch w-px bg-gray-300 ${isCompressed ? "hidden" : "block"}`}></span>

          {/* Capacity */}
          {!isCompressed && (
            <div className="flex flex-col items-start gap-1 rounded-full cursor-pointer hover:bg-gray-100 transition-colors py-2 px-6">
              <p className="text-sm font-medium text-gray-700">Seating Capacity</p>
              <p className="px-1 text-sm text-gray-500">{seatingCapacity || "Enter seating capacity"}</p>
            </div>
          )}
        </div>

        {/* Search Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center justify-center gap-1 bg-primary hover:bg-primary-dull text-white rounded-full cursor-pointer ${isCompressed ? "px-3 py-3 ml-2" : "px-4 py-4 p-2"}`}
        >
          <img
            src={assets.search_icon}
            alt="search"
            className={`brightness-300 ${isCompressed ? "h-4 w-4" : "md:h-5 md:w-5"}`}
          />
        </motion.button>
      </motion.form>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/10 flex p-2 items-center justify-center z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl p-6 w-full border border-light max-w-md shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold mb-4">Filter Cars</h2>
              <form onSubmit={handleSearch} className="flex flex-col gap-4">
                <div>
                  <label className="block mb-1">Pickup Location</label>
                  <select
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="">Select Location</option>
                    {cityList.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
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
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white">
                    Apply Filters
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Hero;

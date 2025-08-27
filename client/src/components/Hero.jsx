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
    <div className="flex items-center justify-center">
      {/* Unified Bar (expands/contracts) */}
      <motion.form
        onSubmit={handleSearch}
        initial={false}
        animate={
          isCompressed
            ? { scale: 0.95, opacity: 0.95, y: -20, borderRadius: "9999px", width: "22rem" }
            : { scale: 1, opacity: 1, y: 0, borderRadius: "9999px", width: "48rem" }
        }
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="flex items-center justify-between bg-white shadow-[0px_8px_20px_rgba(0,0,0,0.1)] border border-light"
      >
        <div
          className="flex flex-row items-center flex-1 gap-6 px-4 py-2 cursor-pointer"
          onClick={() => setShowModal(true)}
        >
          {/* Pickup Location */}
          <div className="flex flex-col items-start gap-1">
            <p className="text-xs md:text-sm font-medium text-gray-700">Pickup</p>
            <p className="text-xs text-gray-500">{pickupLocation || "Any location"}</p>
          </div>

          {!isCompressed && <span className="h-8 w-px bg-gray-300"></span>}

          {/* Price Per Day */}
          {!isCompressed && (
            <div className="flex flex-col items-start gap-1">
              <p className="text-xs md:text-sm font-medium text-gray-700">Price</p>
              <p className="text-xs text-gray-500">{pricePerDay || "Any price"}</p>
            </div>
          )}

          {!isCompressed && <span className="h-8 w-px bg-gray-300"></span>}

          {/* Seating Capacity */}
          {!isCompressed && (
            <div className="flex flex-col items-start gap-1">
              <p className="text-xs md:text-sm font-medium text-gray-700">Capacity</p>
              <p className="text-xs text-gray-500">{seatingCapacity || "Any size"}</p>
            </div>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center gap-1 px-3 py-3 bg-primary hover:bg-primary-dull text-white rounded-full cursor-pointer m-2"
        >
          <img src={assets.search_icon} alt="search" className="h-4 w-4 md:h-5 md:w-5 brightness-300" />
        </motion.button>
      </motion.form>

      {/* Popup Modal */}
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
                {/* Pickup Location */}
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

                {/* Price Per Day */}
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

                {/* Seating Capacity */}
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

                {/* Buttons */}
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

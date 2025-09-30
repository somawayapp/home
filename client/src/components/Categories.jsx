import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  FaHome,
  FaWarehouse,
  FaHotel,
  FaTractor,
  FaSlidersH,
} from "react-icons/fa";
import {
  MdApartment,
  MdMeetingRoom,
  MdBusiness,
  MdStore,
  MdOutlineVilla,
} from "react-icons/md";

const categories = [
  { value: "Bedsitter", label: "Bedsitter", icon: MdApartment },
  { value: "singleroom", label: "Single Room", icon: MdMeetingRoom },
  { value: "Bungalow", label: "Bungalow", icon: FaHome },
  { value: "Maisonette", label: "Maisonette", icon: FaHome },
  { value: "Townhouse", label: "Townhouse", icon: FaHome },
  { value: "Villa", label: "Villa", icon: MdOutlineVilla },
  { value: "House", label: "House", icon: FaHome },
  { value: "Land", label: "Land / Plot", icon: FaTractor },
  { value: "Commercial", label: "Commercial", icon: MdBusiness },
  { value: "Office", label: "Office Space", icon: MdBusiness },
  { value: "Shop", label: "Shop / Retail", icon: MdStore },
  { value: "Warehouse", label: "Warehouse", icon: FaWarehouse },
  { value: "Industrial", label: "Industrial", icon: FaWarehouse },
  { value: "Hotel", label: "Hotel / Guesthouse", icon: FaHotel },
  { value: "Farm", label: "Farm / Agricultural Land", icon: FaTractor },
];

export default function CategoryBar({
  filters,
  setFilters,
  getActiveFilters,
  handleClearAll,
}) {
  const [showPopup, setShowPopup] = useState(true);
  const scrollRef = useRef(null);

  const handleCategoryClick = (cat) => {
    setFilters((prev) => ({ ...prev, propertytype: cat }));
  };

  const activeFilters = getActiveFilters();

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const width = scrollRef.current.clientWidth;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -width : width,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative mt-4">
      <div className="flex items-center">
        {/* Left arrow (only on lg screens) */}
        <button
          onClick={() => scroll("left")}
          className="hidden lg:flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 mr-2"
        >
          ◀
        </button>

        {/* Categories scroll */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-x-auto no-scrollbar flex gap-6 px-2"
        >
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = filters.propertytype === cat.value;
            return (
              <div
                key={cat.value}
                onClick={() => handleCategoryClick(cat.value)}
                className={`flex flex-col items-center justify-center cursor-pointer min-w-[70px] ${
                  isActive ? "text-color-primary" : "text-gray-500"
                }`}
              >
                <Icon size={24} />
                <span className="text-xs mt-1 text-center">{cat.label}</span>
              </div>
            );
          })}
        </div>

        {/* Right arrow (only on lg screens) */}
        <button
          onClick={() => scroll("right")}
          className="hidden lg:flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 ml-2"
        >
          ▶
        </button>

        {/* Filters button fixed at right */}
        <div className="flex-shrink-0 ml-2">
          <button
            onClick={() => setShowPopup(!showPopup)}
            className="flex items-center gap-2 bg-bgColor px-3 py-2 rounded-lg text-gray-600 hover:bg-bgColorhover"
          >
            <FaSlidersH />
            <span className="hidden sm:inline">Current Filters</span>
          </button>
        </div>
      </div>

      {/* Popup with active filters */}
      {showPopup && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg p-4 w-64 z-20"
        >
          {activeFilters.length > 0 ? (
            <div className="space-y-2">
              {activeFilters.map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded"
                >
                  {key}: {value}
                  <button
                    onClick={() => {
                      const newFilters = { ...filters };
                      if (key.startsWith("amenities")) {
                        newFilters[key] = [];
                      } else {
                        newFilters[key] =
                          key === "minPrice"
                            ? 0
                            : key === "maxPrice"
                            ? 1000000000
                            : "";
                      }
                      setFilters(newFilters);
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={handleClearAll}
                className="w-full mt-2 bg-gray-200 text-gray-600 py-1 rounded hover:bg-gray-300"
              >
                Clear All
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No filters applied</p>
          )}
        </motion.div>
      )}
    </div>
  );
}

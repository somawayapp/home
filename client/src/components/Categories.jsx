import { useState, useRef, useEffect } from "react";
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
import { ChevronLeft, ChevronRight, X } from "lucide-react";

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
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollRef = useRef(null);

  const handleCategoryClick = (cat) => {
    setFilters((prev) => ({ ...prev, propertytype: cat }));
  };

  const activeFilters = getActiveFilters();

  const updateScrollButtons = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  };

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const width = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -width : width,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    updateScrollButtons();
    const ref = scrollRef.current;
    if (ref) ref.addEventListener("scroll", updateScrollButtons);
    return () => {
      if (ref) ref.removeEventListener("scroll", updateScrollButtons);
    };
  }, []);

  return (
<div className="relative py-4 mb-4 group border-b border-borderColor ">
      <div className="relative flex items-center">
        {/* Scroll container */}


       <div className="relative w-full">
  {/* Scrollable categories */}
  <div
    ref={scrollRef}
    className="flex-1 overflow-x-auto no-scrollbar flex gap-4 px-2 scroll-smooth"
  >
    {categories.map((cat) => {
      const Icon = cat.icon;
      const isActive = filters.propertytype === cat.value;
      return (
        <div
          key={cat.value}
          onClick={() => handleCategoryClick(cat.value)}
          className={`flex flex-col items-center justify-center cursor-pointer 
                      shrink-0 min-w-[80px] px-2 pb-1 relative
                      transition-all duration-200
                      ${
                        isActive
                          ? "text-black after:block after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-black"
                          : "text-gray-400 hover:text-gray-800 hover:after:block hover:after:content-[''] hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:right-0 hover:after:h-[2px] hover:after:bg-gray-800"
                      }`}
        >
          <Icon size={26} className="text-inherit" />
          <span className="text-xs mt-1 text-center whitespace-nowrap">
            {cat.label}
          </span>
        </div>
      );
    })}
  </div>

  {/* Left arrow */}
  {canScrollLeft && (
    <button
      onClick={() => scroll("left")}
      className="absolute left-0 top-1/2 -translate-y-1/2 
                 bg-black/40 text-white p-2 rounded-full cursor-pointer 
                 hover:bg-black/60 transition"
    >
      <ChevronLeft size={22} />
    </button>
  )}

  {/* Right arrow */}
  {canScrollRight && (
    <button
      onClick={() => scroll("right")}
      className="absolute right-0 top-1/2 -translate-y-1/2 
                 bg-black/40 text-white p-2 rounded-full cursor-pointer 
                 hover:bg-black/60 transition"
    >
      <ChevronRight size={22} />
    </button>
  )}
</div>



        {/* Filters button */}
        <div className="flex-shrink-0 ml-2 md:ml-4 ">
          <button
            onClick={() => setShowPopup(!showPopup)}
            className="flex items-center gap-2 bg-bgColor px-3 py-2 rounded-lg text-gray-600 hover:bg-bgColorhover cursor-pointer transition"
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
          className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg p-4 w-64 z-20 border border-gray-300"
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
                    className="bg-gray-300 hover:bg-red-500 hover:text-white rounded-full p-1 cursor-pointer transition"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={handleClearAll}
                className="w-full mt-2 bg-gray-200 text-gray-600 py-1 rounded hover:bg-gray-300 cursor-pointer transition"
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

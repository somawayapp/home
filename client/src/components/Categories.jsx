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
      <div className="relative  px-4 md:px-16 flex items-center">
        {/* Scroll container */}


        <div
          ref={scrollRef}
          className="flex-1 overflow-x-auto no-scrollbar flex gap-2  md:gap-4 scroll-smooth relative"
        >
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = filters.propertytype === cat.value;
            return (
<div
  key={cat.value}
  onClick={() => handleCategoryClick(cat.value)}
  className={`flex flex-col items-center justify-center cursor-pointer 
              shrink-0 min-w-[80px] pr-2 pb-1 relative
              transition-all duration-200
              ${
                isActive
                  ? "text-neutral-900 after:block after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-black"
                  : "text-neutral-500 hover:text-neutral-600 hover:after:block hover:after:content-[''] hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:right-0 hover:after:h-[2px] hover:after:bg-neutral-600"
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

   


        {/* Filters button */}
        <div className="flex-shrink-0 flex flex-row  ml-2 gap-4 ">
             {/* Right arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="  bg-black/30 text-white p-2 rounded-full cursor-pointer hover:bg-black/60 transition"
          >
            <ChevronRight size={22} />
          </button>
        )}

          <button
            onClick={() => setShowPopup(!showPopup)}
            className="flex items-center gap-2 border border-borderColor py-4 px-4  md:px-6 rounded-full md:rounded-xl hover:shadow-xl hover:text-gray-900 shadow-lg text-gray-700 hover:border-borderColorhover  cursor-pointer transition"
          >
            <FaSlidersH />
            <span className="hidden sm:inline">Current Filters</span>
          </button>
        </div>
      </div>







       {/* Left arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute  hidden md:flex  left-0 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full cursor-pointer hover:bg-black/60 transition"
          >
            <ChevronLeft size={22} />
          </button>
        )}





        
      {/* Popup with active filters */}
      {showPopup && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg p-4 w-64 z-20 border border-borderColor"
        >
          {activeFilters.length > 0 ? (
            <div className="space-y-2">
              {activeFilters.map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between bg-bgColor text-gray-600 text-sm px-2 py-1 rounded"
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
                    className="bg-gray-600 hover:bg-gray-900 text-white rounded-full p-1 cursor-pointer transition"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={handleClearAll}
                className="w-full mt-2 bg-primary text-white py-1 rounded hover:bg-primary-dull cursor-pointer transition"
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

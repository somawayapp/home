import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { FaSlidersH, FaBuilding, FaDoorOpen, FaBed, FaCity, FaWarehouse, FaTrailer, FaTractor, FaHotel, FaStore } from "react-icons/fa";
import { GiBarn, GiCastle, GiCube } from "react-icons/gi";
import { MdHouse, MdOutlineVilla, MdBusiness } from "react-icons/md";
import { TbBeach, TbBuildingCommunity, TbBuildingCottage, TbBuildingEstate } from "react-icons/tb";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export const categories = [
  { value: "Apartment", label: "Apartment", icon: FaBuilding, description: "This property is an apartment building!" },
  { value: "Bedsitter", label: "Bedsitter", icon: FaBed, description: "This property is a bedsitter!" },
  { value: "singleroom", label: "Single Room", icon: FaDoorOpen, description: "This property is a single room!" },
  { value: "Bungalow", label: "Bungalow", icon: TbBuildingCottage, description: "This property is a bungalow!" },
  { value: "Maisonette", label: "Maisonette", icon: TbBuildingEstate, description: "This property is a maisonette!" },
  { value: "Townhouse", label: "Townhouse", icon: TbBuildingCommunity, description: "This property is a townhouse!" },
  { value: "Villa", label: "Villa", icon: MdOutlineVilla, description: "This property is a modern villa!" },
  { value: "House", label: "Houseu", icon: MdHouse, description: "This property is a house!" },
  { value: "Land", label: "Land / Plot", icon: FaTractor, description: "This property is land or a plot!" },
  { value: "Commercial", label: "Commercial Property", icon: MdBusiness, description: "This property is a commercial building!" },
  { value: "Office", label: "Office Space", icon: FaCity, description: "This property is an office space!" },
  { value: "Shop", label: "Shop / Retail", icon: FaStore, description: "This property is a shop or retail space!" },
  { value: "Warehouse", label: "Warehouse / Godown", icon: FaWarehouse, description: "This property is a warehouse or godown!" },
  { value: "Industrial", label: "Industrial Property", icon: FaWarehouse, description: "This property is an industrial property!" },
  { value: "Hotel", label: "Hotel / Guesthouse", icon: FaHotel, description: "This property is a hotel or guesthouse!" },
  { value: "Farm", label: "Farm / Agricultural Land", icon: GiBarn, description: "This property is a farm or agricultural land!" },
];

export default function CategoryBar({ filters, setFilters, getActiveFilters, handleClearAll }) {
  const [showPopup, setShowPopup] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollRef = useRef(null);

  const handleCategoryClick = (cat) => {
    setFilters((prev) => ({
      ...prev,
      propertytype: prev.propertytype === cat ? "" : cat, // toggle logic
    }));
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
    <div className="relative py-4 mb-4 group border-b border-borderColor">
      <div className="relative px-4 md:px-16 flex items-center">
        {/* Scroll container */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-x-auto no-scrollbar flex gap-2 md:gap-4 scroll-smooth relative"
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
                <span className="text-xs mt-1 text-center whitespace-nowrap">{cat.label}</span>
              </div>
            );
          })}
        </div>

        {/* Filters button + popup wrapper */}
        <div className="relative flex-shrink-0 flex flex-row ml-2 gap-4">
          {/* Right arrow */}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute -left-12 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full cursor-pointer hover:bg-black/60 transition"
            >
              <ChevronRight size={22} />
            </button>
          )}

          {/* Filters button */}
          <button
            onClick={() => setShowPopup(!showPopup)}
            className="flex items-center gap-2 border border-borderColor py-4 px-4 md:px-6 rounded-full md:rounded-xl hover:shadow-xl hover:text-gray-900 shadow-lg text-gray-700 hover:border-borderColorhover cursor-pointer transition"
          >
            <FaSlidersH />
            <span className="hidden sm:inline">Current Filters</span>
          </button>

          {/* Popup */}
          {showPopup && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute top-full right-0 mt-2 bg-white shadow-lg rounded-xl p-4 w-64 z-20 border border-borderColor"
            >
              {activeFilters.length > 0 ? (
                <div className="space-y-2">
                  {activeFilters.map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between border border-borderColor text-gray-600 text-sm px-2 py-1 rounded-xl"
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
                        className="bg-black hover:bg-gray-700 text-white rounded-full p-1 cursor-pointer transition"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={handleClearAll}
                    className="w-full mt-2 bg-black hover:bg-gray-700 text-white py-1 rounded-lx  cursor-pointer transition"
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
      </div>

      {/* Left arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute hidden md:flex left-16 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full cursor-pointer hover:bg-black/60 transition"
        >
          <ChevronLeft size={22} />
        </button>
      )}
    </div>
  );
}

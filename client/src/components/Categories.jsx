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
    <div className="relative group ">
      <div className="relative  flex items-center">
        {/* Scroll container */}
      
        {/* Filters button + popup wrapper */}
        <div className="relative flex-shrink-0 flex flex-row ml-2 gap-4">
       

          {/* Filters button */}
          <button
            onClick={() => setShowPopup(!showPopup)}
            className="flex items-center gap-2 border border-borderColor py-3 px-3 md:py-2 md:px-6 rounded-full md:rounded-2xl hover:shadow-xl hover:text-neutral-900 shadow-lg text-neutral-700 hover:border-borderColorhover cursor-pointer transition"
          >
            <FaSlidersH />
            <span className="hidden sm:inline"> Filters</span>
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
                    className="w-full mt-2 bg-black hover:bg-gray-700 text-white py-1 rounded-xl  cursor-pointer transition"
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

     
    </div>
  );
}

import React, { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const CarCard = ({ car }) => {
  const currency = import.meta.env.VITE_CURRENCY;
  const navigate = useNavigate();

  // Handle single or multiple images
  const images = Array.isArray(car.image) ? car.image : [car.image];
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);

  const scrollToImage = (index) => {
    if (scrollRef.current) {
      const imageWidth = scrollRef.current.clientWidth;
      scrollRef.current.scrollTo({
        left: index * imageWidth,
        behavior: "smooth",
      });
    }
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (images.length > 1) {
      const newIndex = (currentIndex + 1) % images.length;
      setCurrentIndex(newIndex);
      scrollToImage(newIndex);
    }
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    if (images.length > 1) {
      const newIndex = (currentIndex - 1 + images.length) % images.length;
      setCurrentIndex(newIndex);
      scrollToImage(newIndex);
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const containerWidth = scrollRef.current.clientWidth;
      const index = Math.round(scrollLeft / containerWidth);
      setCurrentIndex(index);
    }
  };

  return (
    <div
      onClick={() => {
        navigate(`/car-details/${car._id}`);
        scrollTo(0, 0);
      }}
      className="group rounded-xl overflow-hidden shadow-lg hover:-translate-y-1 transition-all duration-500 cursor-pointer"
    >
      {/* Image Carousel */}
      <div className="relative w-full h-48 md:h-56 aspect-[3/3] overflow-hidden">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide transition-transform duration-200 group-hover:scale-105"
        >
          {images.length > 0 ? (
            images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`car-${index}`}
                className="w-full h-full object-cover flex-shrink-0 snap-center rounded-xl"
              />
            ))
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
              No image
            </div>
          )}
        </div>

        {/* Availability Badge */}
        {car.isAvailable && (
          <p className="absolute top-3 left-3 bg-primary/90 text-white text-xs px-2.5 py-1 rounded-full">
            Available Now
          </p>
        )}

        {/* Price Badge */}
        <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg">
          <span className="font-semibold">
            {currency}
            {car.pricePerDay}
          </span>
          <span className="text-sm text-white/80"> / day</span>
        </div>

        {/* Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
            {images.map((_, index) => (
              <span
                key={index}
                className={`h-[5px] w-[5px] rounded-full bg-white transition-all duration-300 ${
                  currentIndex === index ? "w-[8px] scale-110" : "opacity-50"
                }`}
              />
            ))}
          </div>
        )}

        {/* Arrows (Desktop only) */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="hidden md:block absolute left-3 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNext}
              className="hidden md:block absolute right-3 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Info Section */}
      <div className="p-4 sm:p-5">
        <h3 className="text-lg font-medium">
          {car.brand} {car.model}
        </h3>
        <p className="text-muted-foreground text-sm mb-2">
          {car.category} • {car.year}
        </p>

        <div className="grid grid-cols-2 gap-y-2 text-gray-600 text-sm">
          <div className="flex items-center">
            <img src={assets.users_icon} alt="" className="h-4 mr-2" />
            <span>{car.seating_capacity} Seats</span>
          </div>
          <div className="flex items-center">
            <img src={assets.fuel_icon} alt="" className="h-4 mr-2" />
            <span>{car.fuel_type}</span>
          </div>
          <div className="flex items-center">
            <img src={assets.car_icon} alt="" className="h-4 mr-2" />
            <span>{car.transmission}</span>
          </div>
          <div className="flex items-center">
            <img src={assets.location_icon} alt="" className="h-4 mr-2" />
            <span>{car.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarCard;

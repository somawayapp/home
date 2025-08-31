import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef } from "react";

const CarCard = ({ car }) => {
  const images = Array.isArray(car.image) ? car.image : [];
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
    <div className="relative gap-2 md:gap-4 group mb-3 md:mb-[15px] overflow-hidden rounded-xl">
      <Link to={`/car-details/${car._id}`} className="block">
        <div className="relative w-full h-full aspect-[3/3] rounded-xl overflow-hidden">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto aspect-[3/3] snap-x snap-mandatory scroll-smooth scrollbar-hide transition-transform duration-200 group-hover:scale-105"
          >
            {images.length > 0 ? (
              images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  className="w-full h-full object-cover rounded-xl flex-shrink-0 snap-center"
                  alt={`image-${index}`}
                />
              ))
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                No image
              </div>
            )}
          </div>

          <div className="absolute rounded-full hover:bg-[#0556f7] bg-[#2F74FD] bottom-3 right-3 px-3 py-1 text-white text-sm font-medium">
            {car.isAvailable ? "Available" : "Unavailable"}
          </div>

          {/* Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1 px-2 py-1 rounded-full">
              {images.map((_, index) => (
                <span
                  key={index}
                  className={`h-[5px] w-[5px] rounded-full bg-white transition-all duration-300 ${
                    currentIndex === index ? "w-[8px] h-[5px] scale-110" : "opacity-50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </Link>

      <div className="absolute top-3 right-3">
      </div>

      {/* Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="hidden md:block absolute left-3 top-[37%] -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={handleNext}
            className="hidden md:block absolute right-3 top-[37%] -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Info */}
      <div className="mt-3 gap-1">
        <Link to={`/car-details/${car._id}`} className="block">
          <div className="flex justify-between mr-1">
            <p className="text-[var(--softTextColor)] font-semibold capitalize text-[14px] md:text-[15px]">
              {car.location || "America"}
            </p>
          </div>

          <p className="text-[var(--softTextColor)] capitalize text-[14px] md:text-[15px]">
            {car.seating_capacity ? `${car.seating_capacity} Seats` : ""}{" "}
            {car.model ? `${car.model}` : ""} for hire
          </p>

          <p className="text-[var(--softTextColor)] text-[13px] md:text-[14px]">
            {car.year}
          </p>

          <p className="text-[var(--softTextColor)] font-semibold text-[14px] md:text-[15px]">
            KSh {car.pricePerDay}
            <span className="font-normal"> /day</span>
          </p>
        </Link>
      </div>
    </div>
  );
};

export default CarCard;

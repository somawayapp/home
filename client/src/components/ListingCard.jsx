import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef } from "react";
import LikeButton from "./LikeButton";

const ListingCard = ({ listing }) => {
  // ✅ Use `images` field from schema
  const images = Array.isArray(listing.images) ? listing.images : listing.images ? [listing.images] : [];
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
    <div className="relative gap-2 md:gap-4 group mb-2 md:mb-[8px] overflow-hidden ">
      {/* ✅ Updated Link to generic listing page */}
      <Link to={`/listing-details/${listing._id}`} className="block">
        <div className="relative w-full h-full aspect-[3/2.9] rounded-3xl overflow-hidden">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto aspect-[3/2.9] snap-x snap-mandatory scroll-smooth scrollbar-none transition-transform duration-200 group-hover:scale-105"
          >
            {images.length > 0 ? (
              images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  className="w-full h-full bg-bgColor object-cover rounded-3xl flex-shrink-0 snap-center"
                  alt={`image-${index}`}
                />
              ))
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-bgColor text-gray-500">
                No image
              </div>
            )}
          </div>

          {/* ✅ Status Badge  */}

          <div className={`absolute rounded-full top-3 left-3 px-3 py-1 text-neutral-600 text-[12px] font-bold
            ${listing.listingstatus ? "bg-gray-100 hover:gray-100" : " bg-gray-100 hover:gray-100"}`}>
          {listing.offertype === "rent" ? " for rent" : " for sale"}
          </div> 
          


          {/* ✅ Image Dots */}
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

      {/* ✅ Like Button */}
      <div className="absolute top-3 right-3">
        <LikeButton listingId={listing._id} />
      </div>

      {/* ✅ Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="block absolute cursor-pointer left-3 top-[37%] -translate-y-1/2 bg-black/50 text-gray-100 p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={handleNext}
            className="block absolute cursor-pointer right-3 top-[37%] -translate-y-1/2 bg-black/50 text-gray-100 p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

     {/* ✅ Info Section */}
<div className="mt-1.5  ">
  <Link to={`/listing-details/${listing._id}`} className="block">
    {/* County + Suburb */}
    <div className="flex justify-between mr-1">
      <p className=" font-semibold text-neutral-900 capitalize text-[13px] md:text-[14px]">
          {listing.propertytype ? ` ${listing.propertytype}` : ""}

             <span >
  {listing.location?.area
    ? `in ${listing.location.area.replace(/(division|location)/gi, "").trim()}`
    : ""}
</span>
      </p>
  

    </div>

    {/* Size + Type (or Bedrooms + Type) */}
 <p className="text-neutral-600 text-[13px] capitalize">
  {listing.features?.bedrooms
    ? `${listing.features.bedrooms} Bedroom`
    : listing.features?.rooms
    ? `${listing.features.rooms} Rooms`
    : listing.features?.size
    ? `${listing.features.size} sq ft`
    : ""}

  {" for "}
  {listing.status?.toLowerCase()}

  {" • KSh "}
  {listing.price?.toLocaleString()}
</p>


   
   
  </Link>
</div>

    </div>
  );
};

export default ListingCard;

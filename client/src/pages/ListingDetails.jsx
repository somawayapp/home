import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import { Phone, Mail, MessageSquare, MapPin, Bed, Bath, Ruler } from "lucide-react";

const ListingDetails = () => {
  const { id } = useParams();
  const { listings, axios } = useAppContext();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [showGallery, setShowGallery] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: "Hi, I'd like to know more about this property. Please get in touch with me.",
    similar: false,
    allowAgents: false,
  });

  useEffect(() => {
    const found = listings.find((l) => l._id === id);
    setListing(found);
  }, [id, listings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("/api/contact-agent", {
        listingId: id,
        ...form,
      });
      if (data.success) toast.success("Request sent to agent!");
      else toast.error(data.message || "Failed to send request");
    } catch (err) {
      toast.error("Failed to send message");
    }
  };

  if (!listing) return <Loader />;

  const images = Array.isArray(listing.images) ? listing.images : [listing.images].filter(Boolean);

  return (
    <div className="px-4 md:px-16 lg:px-24 xl:px-32 mt-16 mb-20">
      {/* Back button */}
      <div className=" flex-row justify-between flex"> 
        <div>
            <h1 className="text-3xl font-bold text-gray-800">{listing.title}</h1>
            <p className="text-gray-500 flex items-center gap-2">
              <MapPin size={16} />{" "}
              {[listing.location?.county, listing.location?.suburb]
                .filter(Boolean)
                .join(", ")}
            </p>
        </div>
        


          <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-6 text-gray-500 cursor-pointer"
      >
        <img src={assets.arrow_icon} alt="" className="rotate-180 opacity-65" />
        Back
      </button>
      </div>
    

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT: IMAGES & DETAILS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-2"
        >
          {/* Image Gallery */}
          <div
            className="relative w-full aspect-[3/2] rounded-xl overflow-hidden cursor-pointer group"
            onClick={() => setShowGallery(true)}
          >
            <img
              src={images[currentImage]}
              alt="listing"
              className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
                  }}
                  className="absolute left-3 top-1/2 bg-black/50 text-white p-2 rounded-full"
                >
                  ‹
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImage((prev) => (prev + 1) % images.length);
                  }}
                  className="absolute right-3 top-1/2 bg-black/50 text-white p-2 rounded-full"
                >
                  ›
                </button>
              </>
            )}
          </div>

          {/* Popup Gallery */}
          {showGallery && (
            <div
              className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
              onClick={() => setShowGallery(false)}
            >
              <div className="relative w-[90%] max-w-4xl">
                <img
                  src={images[currentImage]}
                  alt="gallery"
                  className="w-full max-h-[85vh] object-contain rounded-lg"
                />
                <button
                  className="absolute top-4 right-4 text-white text-3xl font-bold"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowGallery(false);
                  }}
                >
                  ×
                </button>

                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
                      }}
                      className="absolute left-4 top-1/2 text-white text-4xl font-bold"
                    >
                      ‹
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImage((prev) => (prev + 1) % images.length);
                      }}
                      className="absolute right-4 top-1/2 text-white text-4xl font-bold"
                    >
                      ›
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Details */}
          <div className="mt-8 space-y-4">
          
            <p className="text-2xl font-semibold text-gray-800">
              KSh {listing.price?.toLocaleString()}
              <span className="text-gray-500 text-base font-normal ml-2">
                {listing.offertype === "rent" ? "/month" : "/sale"}
              </span>
            </p>

            {/* Features */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">
              {listing.features?.bedrooms && (
                <div className="flex items-center gap-2 bg-light p-3 rounded-lg text-gray-700">
                  <Bed size={18} /> {listing.features.bedrooms} Beds
                </div>
              )}
              {listing.features?.bathrooms && (
                <div className="flex items-center gap-2 bg-light p-3 rounded-lg text-gray-700">
                  <Bath size={18} /> {listing.features.bathrooms} Baths
                </div>
              )}
              {listing.features?.size && (
                <div className="flex items-center gap-2 bg-light p-3 rounded-lg text-gray-700">
                  <Ruler size={18} /> {listing.features.size}
                </div>
              )}
            </div>

            {/* Description */}
            {listing.description && (
              <div className="mt-6">
                <h2 className="text-xl font-medium mb-2">Description</h2>
                <p className="text-gray-600 leading-relaxed">{listing.description}</p>
              </div>
            )}

            {/* Amenities */}
            {(listing.amenities?.internal?.length > 0 ||
              listing.amenities?.external?.length > 0) && (
              <div className="mt-6">
                <h2 className="text-xl font-medium mb-2">Amenities</h2>
                <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-gray-600 text-sm">
                  {[...(listing.amenities?.internal || []), ...(listing.amenities?.external || [])].map(
                    (a, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <img src={assets.check_icon} alt="" className="h-4" />
                        {a}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
          </div>
        </motion.div>

        {/* RIGHT: CONTACT FORM */}
        <motion.form
  onSubmit={handleSubmit}
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2, duration: 0.6 }}
  className="sticky top-20 w-full max-w-sm mx-auto rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-white"
>
  {/* Top Banner */}
  <div className="bg-red-600 text-white text-center py-3">
    <div className="flex items-center justify-center gap-2">
      <span className="bg-white text-red-600 p-2 rounded-full">
        <Phone size={18} />
      </span>
      <span className="font-bold text-lg">+254 784 2 ....</span>
    </div>
    <p className="text-sm mt-1 font-medium opacity-90">Show the number</p>
  </div>

  {/* Agent Info */}
  <div className="flex flex-col items-center py-4">
    <img
      src={listing.agency?.logo || "/placeholder-logo.png"}
      alt="Agent Logo"
      className="w-12 h-12 object-contain mb-2"
    />
    <p className="text-primary font-semibold text-base">{listing.agency?.name || "Ikaya Rentals"}</p>
  </div>

  <div className="px-6 pb-6 space-y-4">
    {/* Fields */}
    <input
      type="text"
      placeholder="* Full name"
      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
      value={form.name}
      onChange={(e) => setForm({ ...form, name: e.target.value })}
      required
    />
    <input
      type="text"
      placeholder="* Phone number"
      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
      value={form.phone}
      onChange={(e) => setForm({ ...form, phone: e.target.value })}
      required
    />
    <input
      type="email"
      placeholder="* Your email"
      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
      value={form.email}
      onChange={(e) => setForm({ ...form, email: e.target.value })}
      required
    />
    <textarea
      placeholder="* Fill text with min of 150 chars and max of 4000..."
      rows="4"
      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-primary focus:border-primary"
      value={form.message}
      onChange={(e) => setForm({ ...form, message: e.target.value })}
      required
    />

    {/* Checkbox */}
    <div className="flex items-start gap-2 text-xs text-gray-600">
      <input type="checkbox" required className="mt-1" />
      <span>
        * I agree to buyrentkenya.com Terms & Conditions and Privacy Policy.
      </span>
    </div>

    {/* Submit Button */}
    <button className="w-full bg-blue-600 text-white font-semibold py-3 rounded-md hover:bg-blue-700 transition">
      Message
    </button>
  </div>
</motion.form>

      </div>
    </div>
  );
};

export default ListingDetails;

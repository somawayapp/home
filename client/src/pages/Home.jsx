import React, { useEffect, useState } from "react";
import Title from "../components/Title";
import ListingCard from "../components/ListingCard";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import { motion } from "motion/react";
import Hero from "../components/Hero";

const Home = () => {
  const { listings } = useAppContext();
  const [input, setInput] = useState("");
  const [filteredListings, setFilteredListings] = useState([]);

  // ✅ Apply text search filter
  const applyFilter = () => {
    if (input.trim() === "") {
      setFilteredListings(listings);
      return;
    }

    const filtered = listings.slice().filter((listing) => {
      return (
        (listing.title && listing.title.toLowerCase().includes(input.toLowerCase())) ||
        (listing.propertytype && listing.propertytype.toLowerCase().includes(input.toLowerCase())) ||
        (listing.location && listing.location.toLowerCase().includes(input.toLowerCase()))
      );
    });

    setFilteredListings(filtered);
  };

  // ✅ Re-apply filter when input or listings change
  useEffect(() => {
    if (listings.length > 0) applyFilter();
  }, [input, listings]);

  return (
    <div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="px-4 md:px-16 lg:px-24 xl:px-32 mt-10"
      >
        <p className="text-gray-500 xl:px-20 max-w-7xl mx-auto">
          Showing {filteredListings.length} Listings
        </p>

        {/* ✅ Search Input */}
        <div className="max-w-7xl mx-auto mt-4">
          <input
            type="text"
            placeholder="Search by title, property type, or location..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* ✅ Listings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-6 mx-auto">
          {filteredListings.map((listing, index) => (
            <motion.div
              key={listing._id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.4 }}
            >
              <ListingCard listing={listing} />
            </motion.div>
          ))}

          {/* ✅ Empty State */}
          {filteredListings.length === 0 && (
            <div className="col-span-full text-center text-gray-500 mt-8">
              No listings found matching your search.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Home;


import React, { useEffect, useState } from "react";
import ListingCard from "../components/ListingCard";
import { useAppContext } from "../context/AppContext";
import { motion } from "motion/react";

const Listings = () => {
  const { listings } = useAppContext();
  const [input, setInput] = useState("");
  const [filteredListings, setFilteredListings] = useState([]);

  const applyFilter = () => {
    if (input.trim() === "") {
      setFilteredListings(listings);
      return;
    }

    const filtered = listings.slice().filter((listing) => {
      return (
        (listing.title && listing.title.toLowerCase().includes(input.toLowerCase())) ||
        (listing.propertytype && listing.propertytype.toLowerCase().includes(input.toLowerCase())) );
    });

    setFilteredListings(filtered);
  };

  useEffect(() => {
    if (listings.length > 0) applyFilter();
  }, [input, listings]);

  return (
    <div className="px-4 md:px-12 lg:px-16 xl:px-24 mt-8">
      {/* ✅ Search Input */}
      <div className="max-w-6xl mx-auto mb-6">
        <input
          type="text"
          placeholder="Search by title, property type, or location..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* ✅ Listings Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mx-auto"
      >
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
          <div className="col-span-full text-center text-gray-500 mt-6">
            No listings found matching you search.
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Listings;

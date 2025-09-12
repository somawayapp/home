import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Import useLocation and useNavigate
import Title from "../components/Title";
import ListingCard from "../components/ListingCard";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import { motion } from "framer-motion"; // Note: changed from motion/react to framer-motion
import Hero from "../components/Hero";

const Home = () => {
  const { listings } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  // State to hold all filter criteria
  const [filters, setFilters] = useState({
    location: "",
    minPrice: "",
    maxPrice: "",
    propertytype: "",
    offertype: "",
    bedrooms: "",
    bathrooms: "",
    rooms: "",
    size: "",
    amenitiesInternal: "",
    amenitiesExternal: "",
    amenitiesNearby: "",
    featured: "",
    available: "",
  });

  const [filteredListings, setFilteredListings] = useState([]);

  // Function to get filters from URL
  const getFiltersFromUrl = () => {
    const params = new URLSearchParams(location.search);
    const newFilters = {};
    for (const [key, value] of params.entries()) {
      newFilters[key] = value;
    }
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Function to apply all filters
  const applyFilter = () => {
    let newFilteredListings = [...listings];

    // Filter by location, title, propertytype
    const searchTerm = filters.location.toLowerCase();
    if (searchTerm) {
      newFilteredListings = newFilteredListings.filter((listing) =>
        (listing.title && listing.title.toLowerCase().includes(searchTerm)) ||
        (listing.propertytype && listing.propertytype.toLowerCase().includes(searchTerm)) ||
        (listing.location && listing.location.toLowerCase().includes(searchTerm))
      );
    }
    
    // Filter by minPrice
    if (filters.minPrice) {
      newFilteredListings = newFilteredListings.filter(
        (listing) => listing.price >= parseFloat(filters.minPrice)
      );
    }

    // Filter by maxPrice
    if (filters.maxPrice) {
      newFilteredListings = newFilteredListings.filter(
        (listing) => listing.price <= parseFloat(filters.maxPrice)
      );
    }

    // Filter by property type
    if (filters.propertytype) {
      newFilteredListings = newFilteredListings.filter(
        (listing) => listing.propertytype === filters.propertytype
      );
    }

    // Filter by offer type (e.g., 'sale', 'rent')
    if (filters.offertype) {
      newFilteredListings = newFilteredListings.filter(
        (listing) => listing.offertype === filters.offertype
      );
    }

    // Filter by number of bedrooms
    if (filters.bedrooms) {
      newFilteredListings = newFilteredListings.filter(
        (listing) => listing.bedrooms >= parseInt(filters.bedrooms)
      );
    }

    // You can add similar logic for other filters here...
    // bathrooms, rooms, size, etc.

    setFilteredListings(newFilteredListings);
  };

  // Update URL whenever filters change
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.append(key, value);
      }
    });
    navigate(`?${params.toString()}`, { replace: true });
  }, [filters, navigate]);

  // Re-apply filters when listings or filters state changes
  useEffect(() => {
    getFiltersFromUrl();
  }, [location.search]);
  
  useEffect(() => {
    if (listings.length > 0) applyFilter();
  }, [listings, filters]);
  

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Handle removing a single filter
  const removeFilter = (filterKey) => {
    setFilters((prev) => ({ ...prev, [filterKey]: "" }));
  };

  // Handle removing all filters
  const clearAllFilters = () => {
    setFilters({
      location: "",
      minPrice: "",
      maxPrice: "",
      propertytype: "",
      offertype: "",
      bedrooms: "",
      bathrooms: "",
      rooms: "",
      size: "",
      amenitiesInternal: "",
      amenitiesExternal: "",
      amenitiesNearby: "",
      featured: "",
      available: "",
    });
  };

  const getActiveFilters = () => {
    return Object.entries(filters).filter(([key, value]) => !!value);
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="px-4 md:px-16 lg:px-24 xl:px-32 mt-10"
      >
        <div className="max-w-7xl mx-auto">
          {/* ✅ Filter Controls Section */}
          <div className="bg-gray-100 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Filter Listings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Location/Text Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Location/Title</label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. New York, apartment"
                  value={filters.location}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* Min Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Min Price</label>
                <input
                  type="number"
                  name="minPrice"
                  placeholder="Min Price"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Max Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Max Price</label>
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="Max Price"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Property Type</label>
                <select
                  name="propertytype"
                  value={filters.propertytype}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="condo">Condo</option>
                  {/* Add more options as needed */}
                </select>
              </div>

              {/* Offer Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Offer Type</label>
                <select
                  name="offertype"
                  value={filters.offertype}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All</option>
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                </select>
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
                <input
                  type="number"
                  name="bedrooms"
                  placeholder="Min Bedrooms"
                  value={filters.bedrooms}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Add more filter boxes for bathrooms, rooms, size, etc. as needed */}
            </div>
          </div>
        </div>

        {/* ✅ Active Filters Section */}
        {getActiveFilters().length > 0 && (
          <div className="max-w-7xl mx-auto mt-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-gray-700 mr-2">
                Active Filters:
              </span>
              {getActiveFilters().map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-1 rounded-full"
                >
                  {key}: {value}
                  <button
                    onClick={() => removeFilter(key)}
                    className="ml-2 text-blue-600 hover:text-blue-900 focus:outline-none"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                onClick={clearAllFilters}
                className="ml-2 text-gray-500 hover:text-gray-700 text-sm font-medium focus:outline-none"
              >
                Remove all
              </button>
            </div>
          </div>
        )}

        <p className="text-gray-500 xl:px-20 max-w-7xl mx-auto mt-10">
          Showing {filteredListings.length} Listings
        </p>

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
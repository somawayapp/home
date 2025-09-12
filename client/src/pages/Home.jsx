import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Title from "../components/Title";
import ListingCard from "../components/ListingCard";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import Hero from "../components/Hero"; // Assuming this is your search bar component
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Slider from "rc-slider";

// Fix for default marker icon in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const Home = () => {
  const { listings } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapCenter, setMapCenter] = useState([51.505, -0.09]);

  const MAX_PRICE_DEFAULT = 1000000000;

  const [filters, setFilters] = useState({
    location: "",
    minPrice: "",
    maxPrice: MAX_PRICE_DEFAULT, // Default max price
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
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      maxPrice: newFilters.maxPrice
        ? parseFloat(newFilters.maxPrice)
        : MAX_PRICE_DEFAULT,
    }));
  };

  // Function to apply all filters
  const applyFilter = () => {
    let newFilteredListings = [...listings];

    setLoading(true); // Start loading state

    // Filter logic
    // ... (Your existing filter logic here)
    const searchTerm = filters.location.toLowerCase();
    if (searchTerm) {
      newFilteredListings = newFilteredListings.filter(
        (listing) =>
          (listing.title && listing.title.toLowerCase().includes(searchTerm)) ||
          (listing.propertytype && listing.propertytype.toLowerCase().includes(searchTerm)) ||
          (listing.location && listing.location.toLowerCase().includes(searchTerm))
      );
    }
    
    // Price Filter
    if (filters.minPrice) {
      newFilteredListings = newFilteredListings.filter(
        (listing) => listing.price >= parseFloat(filters.minPrice)
      );
    }
    if (filters.maxPrice) {
      newFilteredListings = newFilteredListings.filter(
        (listing) => listing.price <= parseFloat(filters.maxPrice)
      );
    }

    // Property Type Filter
    if (filters.propertytype) {
      newFilteredListings = newFilteredListings.filter(
        (listing) => listing.propertytype === filters.propertytype
      );
    }

    // Offer Type Filter
    if (filters.offertype) {
      newFilteredListings = newFilteredListings.filter(
        (listing) => listing.offertype === filters.offertype
      );
    }

    // Bedrooms Filter
    if (filters.bedrooms) {
      newFilteredListings = newFilteredListings.filter(
        (listing) => listing.bedrooms >= parseInt(filters.bedrooms)
      );
    }

    // Bathrooms Filter
    if (filters.bathrooms) {
      newFilteredListings = newFilteredListings.filter(
        (listing) => listing.bathrooms >= parseInt(filters.bathrooms)
      );
    }

    // Rooms Filter
    if (filters.rooms) {
      newFilteredListings = newFilteredListings.filter(
        (listing) => listing.rooms >= parseInt(filters.rooms)
      );
    }

    // Size Filter
    if (filters.size) {
      newFilteredListings = newFilteredListings.filter(
        (listing) => listing.size >= parseInt(filters.size)
      );
    }

    // Amenities Filters
    if (filters.amenitiesInternal) {
      const internalAmenities = filters.amenitiesInternal.split(",");
      newFilteredListings = newFilteredListings.filter((listing) =>
        internalAmenities.every((amenity) =>
          listing.amenitiesInternal.includes(amenity.trim())
        )
      );
    }

    if (filters.amenitiesExternal) {
      const externalAmenities = filters.amenitiesExternal.split(",");
      newFilteredListings = newFilteredListings.filter((listing) =>
        externalAmenities.every((amenity) =>
          listing.amenitiesExternal.includes(amenity.trim())
        )
      );
    }
    
    if (filters.amenitiesNearby) {
      const nearbyAmenities = filters.amenitiesNearby.split(",");
      newFilteredListings = newFilteredListings.filter((listing) =>
        nearbyAmenities.every((amenity) =>
          listing.amenitiesNearby.includes(amenity.trim())
        )
      );
    }

    setFilteredListings(newFilteredListings);
    setLoading(false); // End loading state
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

  const handlePriceChange = (value) => {
    setFilters((prev) => ({
      ...prev,
      minPrice: value[0],
      maxPrice: value[1],
    }));
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
      maxPrice: MAX_PRICE_DEFAULT,
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
    return Object.entries(filters).filter(([key, value]) => !!value && key !== 'maxPrice' || (key === 'maxPrice' && value !== MAX_PRICE_DEFAULT));
  };

  // Map logic
  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`)
      .then((res) => res.json())
      .then((data) => {
        const address = data.address;
        const city = address.city || address.town || address.village || "";
        const state = address.state || "";
        const country = address.country || "";
        const formattedAddress = `${city}, ${state}, ${country}`.replace(/, ,/g, "").trim();
        setFilters((prev) => ({ ...prev, location: formattedAddress }));
        toast.success(`Location set to: ${formattedAddress}`);
        setShowMapModal(false);
      })
      .catch((error) => {
        console.error("Error fetching location:", error);
        toast.error("Could not fetch location details.");
      });
  };

  const MapEventHandler = () => {
    useMapEvents({
      click: handleMapClick,
    });
    return null;
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter([latitude, longitude]);
          fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`)
            .then((res) => res.json())
            .then((data) => {
              const address = data.address;
              const city = address.city || address.town || address.village || "";
              setFilters((prev) => ({ ...prev, location: city }));
            })
            .catch((error) => {
              console.error("Error fetching location:", error);
              toast.error("Could not fetch location details from coordinates.");
            });
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast.error("Could not retrieve your current location.");
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser.");
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

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
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">Location/Title</label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. New York, apartment"
                  value={filters.location}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => setShowMapModal(true)}
                  className="absolute right-0 top-6 mt-1.5 mr-2 text-blue-500 hover:text-blue-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {/* Price Range with Slider */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input
                      type="number"
                      name="minPrice"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      name="maxPrice"
                      placeholder="Max"
                      value={filters.maxPrice === MAX_PRICE_DEFAULT ? "" : filters.maxPrice}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Slider
                    className="horizontal-slider"
                    thumbClassName="example-thumb"
                    trackClassName="example-track"
                    value={[parseFloat(filters.minPrice) || 0, parseFloat(filters.maxPrice) || MAX_PRICE_DEFAULT]}
                    min={0}
                    max={MAX_PRICE_DEFAULT}
                    step={1000}
                    onChange={handlePriceChange}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>${parseFloat(filters.minPrice) || 0}</span>
                    <span>${parseFloat(filters.maxPrice) || MAX_PRICE_DEFAULT}</span>
                  </div>
                </div>
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

              {/* Bedrooms, Bathrooms, Rooms, Size */}
              {/* These will be simple text/number inputs */}
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

              <div>
                <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
                <input
                  type="number"
                  name="bathrooms"
                  placeholder="Min Bathrooms"
                  value={filters.bathrooms}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Rooms</label>
                <input
                  type="number"
                  name="rooms"
                  placeholder="Min Rooms"
                  value={filters.rooms}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Size (sqft)</label>
                <input
                  type="number"
                  name="size"
                  placeholder="Min Size"
                  value={filters.size}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Amenity Checkboxes (or multi-select) */}
              {/* For simplicity, we'll use a multi-select or a list of checkboxes */}
              <div className="col-span-full">
                <label className="block text-sm font-medium text-gray-700">Internal Amenities</label>
                <select multiple name="amenitiesInternal" onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24">
                  <option value="AC">AC</option>
                  <option value="Wi-Fi">Wi-Fi</option>
                  <option value="Built-in washer">Built-in washer</option>
                  {/* ... add all internal amenities */}
                </select>
              </div>

              <div className="col-span-full">
                <label className="block text-sm font-medium text-gray-700">External Amenities</label>
                <select multiple name="amenitiesExternal" onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24">
                  <option value="Parking">Parking</option>
                  <option value="Pool">Pool</option>
                  <option value="Gym & Fitness center">Gym & Fitness center</option>
                  {/* ... add all external amenities */}
                </select>
              </div>

              <div className="col-span-full">
                <label className="block text-sm font-medium text-gray-700">Nearby Amenities</label>
                <select multiple name="amenitiesNearby" onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24">
                  <option value="Gym">Gym</option>
                  <option value="Shopping Mall">Shopping Mall</option>
                  <option value="Public transportation access">Public transportation access</option>
                  {/* ... add all nearby amenities */}
                </select>
              </div>
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

        {/* ✅ Loading State */}
        {loading ? (
          <div className="flex justify-center items-center mt-8">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="ml-4 text-lg text-gray-600">Loading listings...</p>
          </div>
        ) : (
          <>
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
          </>
        )}
      </motion.div>

      {/* ✅ Map Modal/Popup */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-11/12 max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <h2 className="text-xl font-semibold mb-4">Select a Location on the Map</h2>
            <div className="flex-grow">
              <MapContainer
                center={mapCenter}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapEventHandler />
                <Marker position={mapCenter} />
              </MapContainer>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowMapModal(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
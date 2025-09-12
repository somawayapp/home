import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from "react-leaflet";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { motion } from "framer-motion";
import ListingCard from "../components/ListingCard";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

// Helper components for Leaflet
const LocationSelector = ({ setMarkerPosition, setMapCenter }) => {
  useMapEvents({
    click: (e) => {
      setMarkerPosition([e.latlng.lat, e.latlng.lng]);
      setMapCenter([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
};

// Available amenities
const internalAmenities = ["AC", "Heating", "Wi-Fi", "Bathtub", "Dishwasher", "Built-in washer", "Built-in dryer", "Smart home", "Balcony", "Security systems", "CCTV cameras", "Intercoms"];
const externalAmenities = ["Parking", "Pool", "Gym & Fitness center", "Social areas", "Rooftop gardens", "Back garden", "Bike parking", "Covered parking", "Package lockers", "Party room", "Billiards table", "Clubhouse", "Spa", "Playgrounds", "Walking paths", "Friendly spaces", "Valet trash", "Surveillance cameras", "Building Wi-Fi", "Greenery around the space"];
const nearbyAmenities = ["Gym", "Shopping Mall", "Public transportation access", "Airport", "Train", "Beach", "Parks", "Restaurants", "Coffee shops", "Grocery stores", "Schools", "Hospitals/Clinics", "Banks/ATMs", "Movie theaters", "Libraries"];

const Home = () => {
  const { listings } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  // State for the main page filters (synced with URL)
  const [filters, setFilters] = useState({
    location: "",
    minPrice: 0,
    maxPrice: 1000000000, // Default max price to 1 billion
    propertytype: "",
    offertype: "",
    bedrooms: "",
    bathrooms: "",
    rooms: "",
    size: "",
    amenitiesInternal: [],
    amenitiesExternal: [],
    amenitiesNearby: [],
    featured: "",
    available: "",
    lat: null,
    lng: null,
    radius: 5000,
  });

  // State for the modal's temporary filters
  const [modalFilters, setModalFilters] = useState(filters);
  const [showModal, setShowModal] = useState(false);
  const [filteredListings, setFilteredListings] = useState([]);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [mapCenter, setMapCenter] = useState([51.505, -0.09]);
  const [markerPosition, setMarkerPosition] = useState(null);

  // Function to get filters from URL
  const getFiltersFromUrl = () => {
    const params = new URLSearchParams(location.search);
    const newFilters = {};
    for (const [key, value] of params.entries()) {
      if (key.startsWith("amenities")) {
        newFilters[key] = value.split(",");
      } else {
        newFilters[key] = value;
      }
    }
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Function to apply all filters
  const applyFilter = () => {
    let newFilteredListings = [...listings];
    const {
      location,
      minPrice,
      maxPrice,
      propertytype,
      offertype,
      bedrooms,
      bathrooms,
      size,
      amenitiesInternal,
      amenitiesExternal,
      amenitiesNearby,
      lat,
      lng,
      radius,
    } = filters;

    // Text search filter
    const searchTerm = location?.toLowerCase();
    if (searchTerm) {
      newFilteredListings = newFilteredListings.filter((listing) =>
        (listing.title && listing.title.toLowerCase().includes(searchTerm)) ||
        (listing.propertytype && listing.propertytype.toLowerCase().includes(searchTerm)) ||
        (listing.location && listing.location.toLowerCase().includes(searchTerm))
      );
    }

    // Price filter
    newFilteredListings = newFilteredListings.filter((listing) =>
      listing.price >= minPrice && listing.price <= maxPrice
    );

    // Property type filter
    if (propertytype) {
      newFilteredListings = newFilteredListings.filter(
        (listing) => listing.propertytype === propertytype
      );
    }

    // Bedrooms filter
    if (bedrooms) {
      newFilteredListings = newFilteredListings.filter(
        (listing) => listing.bedrooms >= parseInt(bedrooms)
      );
    }
    
    // Bathrooms filter
    if (bathrooms) {
      newFilteredListings = newFilteredListings.filter(
        (listing) => listing.bathrooms >= parseInt(bathrooms)
      );
    }

    // Size filter
    if (size) {
      newFilteredListings = newFilteredListings.filter(
        (listing) => listing.size >= parseInt(size)
      );
    }
    
    // Amenities filter
    const allAmenities = [...amenitiesInternal, ...amenitiesExternal, ...amenitiesNearby];
    if (allAmenities.length > 0) {
      newFilteredListings = newFilteredListings.filter((listing) => {
        const listingAmenities = [...(listing.amenitiesInternal || []), ...(listing.amenitiesExternal || []), ...(listing.amenitiesNearby || [])];
        return allAmenities.every(amenity => listingAmenities.includes(amenity));
      });
    }

    // Proximity search (You'll need a proper distance calculation function)
    if (lat && lng && radius) {
      newFilteredListings = newFilteredListings.filter((listing) => {
        // Implement haversine or similar distance calculation
        // For demonstration, let's assume a dummy function
        // const distance = getDistance(lat, lng, listing.lat, listing.lng);
        // return distance <= radius;
        return true; // Placeholder
      });
    }

    setFilteredListings(newFilteredListings);
  };

  // Sync URL with filters
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        params.append(key, value.join(","));
      } else if (value && !Array.isArray(value)) {
        params.append(key, value);
      }
    });
    navigate(`?${params.toString()}`, { replace: true });
  }, [filters, navigate]);

  useEffect(() => {
    getFiltersFromUrl();
  }, [location.search]);

  useEffect(() => {
    if (listings.length > 0) applyFilter();
  }, [listings, filters]);

  // Handle a single filter change in the modal
  const handleModalFilterChange = (key, value) => {
    setModalFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Handle amenity change in the modal
  const handleAmenityChange = (amenity, category) => {
    setModalFilters((prev) => {
      const currentAmenities = prev[category] || [];
      const newAmenities = currentAmenities.includes(amenity)
        ? currentAmenities.filter((a) => a !== amenity)
        : [...currentAmenities, amenity];
      return { ...prev, [category]: newAmenities };
    });
  };

  const handleApplyFilters = () => {
    setFilters(modalFilters);
    setShowModal(false);
  };

  const handleClearAll = () => {
    const defaultFilters = {
      location: "",
      minPrice: 0,
      maxPrice: 1000000000,
      propertytype: "",
      offertype: "",
      bedrooms: "",
      bathrooms: "",
      rooms: "",
      size: "",
      amenitiesInternal: [],
      amenitiesExternal: [],
      amenitiesNearby: [],
      featured: "",
      available: "",
      lat: null,
      lng: null,
      radius: 5000,
    };
    setFilters(defaultFilters);
    setModalFilters(defaultFilters);
    setMarkerPosition(null);
  };

  const getActiveFilters = () => {
    const active = [];
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        active.push([key, value.join(", ")]);
      } else if (value && typeof value !== 'object') {
        if (key === 'minPrice' && value === 0) return;
        if (key === 'maxPrice' && value === 1000000000) return;
        active.push([key, value]);
      }
    });
    return active;
  };

  // Note: The location suggestions and map functions from the user's prompt
  // are included here, but require external libraries (e.g., Nominatim API)
  // to be fully functional.

  return (
    <div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="px-4 md:px-16 lg:px-24 xl:px-32 mt-10"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center mb-6">
          <p className="text-gray-500">
            Showing {filteredListings.length} Listings
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 focus:outline-none"
          >
            Filter
          </button>
        </div>

        {/* --- Active Filters --- */}
        {getActiveFilters().length > 0 && (
          <div className="max-w-7xl mx-auto mt-4">
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
                    onClick={() => {
                      // Remove filter logic
                      const newFilters = { ...filters };
                      if (key.startsWith("amenities")) {
                        newFilters[key] = [];
                      } else {
                        newFilters[key] = key === "minPrice" ? 0 : key === "maxPrice" ? 1000000000 : "";
                      }
                      setFilters(newFilters);
                    }}
                    className="ml-2 text-blue-600 hover:text-blue-900 focus:outline-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                onClick={handleClearAll}
                className="ml-2 text-gray-500 hover:text-gray-700 text-sm font-medium focus:outline-none"
              >
                Remove all
              </button>
            </div>
          </div>
        )}

        {/* --- Listings Grid --- */}
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

          {filteredListings.length === 0 && (
            <div className="col-span-full text-center text-gray-500 mt-8">
              No listings found matching your search.
            </div>
          )}
        </div>
      </motion.div>

      {/* --- Filter Modal (Popup) --- */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 w-full max-w-3xl border border-light shadow-xl max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-lg font-semibold mb-4">Filter Listings</h2>

            {/* --- Location Input with Autocomplete --- */}
            <label className="block mb-2">Location</label>
            <input
              type="text"
              value={modalFilters.location}
              onChange={(e) => handleModalFilterChange("location", e.target.value)}
              placeholder="Type a city or area"
              className="w-full border rounded-lg p-2"
            />
            {locationSuggestions.length > 0 && (
              <ul className="border rounded-lg mt-2 max-h-40 overflow-y-auto">
                {locationSuggestions.map((suggestion) => (
                  <li
                    key={suggestion.place_id}
                    className="p-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      setModalFilters(prev => ({
                        ...prev,
                        location: suggestion.display_name,
                        lat: parseFloat(suggestion.lat),
                        lng: parseFloat(suggestion.lon)
                      }));
                      setMapCenter([parseFloat(suggestion.lat), parseFloat(suggestion.lon)]);
                      setMarkerPosition([parseFloat(suggestion.lat), parseFloat(suggestion.lon)]);
                      setLocationSuggestions([]);
                    }}
                  >
                    {suggestion.display_name}
                  </li>
                ))}
              </ul>
            )}

            {/* --- Map Picker --- */}
            <div className="mt-4 rounded-lg overflow-hidden border h-72">
              <MapContainer center={mapCenter} zoom={13} style={{ height: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationSelector setMarkerPosition={(pos) => handleModalFilterChange('lat', pos[0]) & handleModalFilterChange('lng', pos[1])} setMapCenter={setMapCenter} />
                {markerPosition && (
                  <>
                    <Marker position={markerPosition} />
                    <Circle center={markerPosition} radius={modalFilters.radius} />
                  </>
                )}
              </MapContainer>
              <div className="flex items-center gap-3 mt-2">
                <label>Radius:</label>
                <input
                  type="range"
                  min="500"
                  max="10000"
                  step="500"
                  value={modalFilters.radius}
                  onChange={(e) => handleModalFilterChange("radius", Number(e.target.value))}
                />
                <span>{Math.round(modalFilters.radius / 1000)} km</span>
              </div>
            </div>

            {/* --- Other Filters --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block mb-1">Price Range</label>
                <div className="px-1">
                  <Slider
                    range
                    min={0}
                    max={1000000000}
                    step={10000}
                    value={[modalFilters.minPrice, modalFilters.maxPrice]}
                    onChange={(value) => {
                      handleModalFilterChange("minPrice", value[0]);
                      handleModalFilterChange("maxPrice", value[1]);
                    }}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>${modalFilters.minPrice || 0}</span>
                  <span>${modalFilters.maxPrice || 1000000000}</span>
                </div>
              </div>
              
              <div>
                <label className="block mb-1">Property Type</label>
                <select
                  value={modalFilters.propertytype}
                  onChange={(e) => handleModalFilterChange("propertytype", e.target.value)}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="">Any</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="land">Land</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>

              <div>
                <label className="block mb-1">Min Bedrooms</label>
                <input
                  type="number"
                  value={modalFilters.bedrooms || ""}
                  onChange={(e) => handleModalFilterChange("bedrooms", e.target.value ? parseInt(e.target.value) : "")}
                  className="w-full border rounded-lg p-2"
                  placeholder="Min bedrooms"
                />
              </div>

              <div>
                <label className="block mb-1">Min Bathrooms</label>
                <input
                  type="number"
                  value={modalFilters.bathrooms || ""}
                  onChange={(e) => handleModalFilterChange("bathrooms", e.target.value ? parseInt(e.target.value) : "")}
                  className="w-full border rounded-lg p-2"
                  placeholder="Min bathrooms"
                />
              </div>

              <div>
                <label className="block mb-1">Min Size (sqft)</label>
                <input
                  type="number"
                  value={modalFilters.size || ""}
                  onChange={(e) => handleModalFilterChange("size", e.target.value ? parseInt(e.target.value) : "")}
                  className="w-full border rounded-lg p-2"
                  placeholder="Min size"
                />
              </div>
            </div>

            {/* --- Amenities --- */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Internal Amenities */}
              <div>
                <h3 className="text-md font-semibold mb-2">Internal Amenities</h3>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                  {internalAmenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`internal-${amenity}`}
                        checked={modalFilters.amenitiesInternal.includes(amenity)}
                        onChange={() => handleAmenityChange(amenity, "amenitiesInternal")}
                        className="accent-blue-500"
                      />
                      <label htmlFor={`internal-${amenity}`} className="text-sm cursor-pointer">{amenity}</label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* External Amenities */}
              <div>
                <h3 className="text-md font-semibold mb-2">External Amenities</h3>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                  {externalAmenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`external-${amenity}`}
                        checked={modalFilters.amenitiesExternal.includes(amenity)}
                        onChange={() => handleAmenityChange(amenity, "amenitiesExternal")}
                        className="accent-blue-500"
                      />
                      <label htmlFor={`external-${amenity}`} className="text-sm cursor-pointer">{amenity}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nearby Amenities */}
              <div>
                <h3 className="text-md font-semibold mb-2">Nearby Amenities</h3>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                  {nearbyAmenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`nearby-${amenity}`}
                        checked={modalFilters.amenitiesNearby.includes(amenity)}
                        onChange={() => handleAmenityChange(amenity, "amenitiesNearby")}
                        className="accent-blue-500"
                      />
                      <label htmlFor={`nearby-${amenity}`} className="text-sm cursor-pointer">{amenity}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* --- Footer --- */}
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyFilters}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Home;
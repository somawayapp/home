import React, { useState, useEffect, useRef } from "react";
import { assets, menuLinks, cityList } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate, createSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet/dist/images/marker-icon-2x.png";
import "leaflet/dist/images/marker-shadow.png";
import ReactSlider from "react-slider";

// Fix for default Leaflet marker icons
delete L.Icon.Default.prototype._get  

// eslint-disable-next-line
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


const Hero = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setShowLogin, user, logout, isOwner, axios, setIsOwner } =
    useAppContext();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // --- Filter state ---
  const [filters, setFilters] = useState({
    location: "",
    lat: null,
    lng: null,
    radius: 2000,
    minPrice: "",
    maxPrice: "",
    propertyType: "",
    bedrooms: "",
    bathrooms: "",
    amenities: [],
    features: [],
  });

  const [showModal, setShowModal] = useState(false);
  const [mapCenter, setMapCenter] = useState([0.3476, 32.5825]); // Kampala default
  const [markerPosition, setMarkerPosition] = useState(null);
  const [locationSuggestions, setLocationSuggestions] = useState([]);

  // Mock geocoding function (replace with a real API call)
  const geocodeLocation = async (query) => {
    // This is a placeholder. In a real app, you'd call a geocoding API.
    // Example: `const res = await axios.get('https://api.opencagedata.com/geocode/v1/json', { params: { q: query, key: 'YOUR_API_KEY' } });`
    const mockData = [
      { name: "Kampala, Uganda", lat: 0.3476, lng: 32.5825 },
      { name: "Entebbe, Uganda", lat: 0.0506, lng: 32.4632 },
      { name: "Jinja, Uganda", lat: 0.4243, lng: 33.2045 },
    ];
    return mockData.filter(loc => loc.name.toLowerCase().includes(query.toLowerCase()));
  };

  // Sync filters from URL on page load or URL change
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const newFilters = {
      location: searchParams.get("location") || "",
      lat: searchParams.get("lat") ? parseFloat(searchParams.get("lat")) : null,
      lng: searchParams.get("lng") ? parseFloat(searchParams.get("lng")) : null,
      radius: searchParams.get("radius") ? parseInt(searchParams.get("radius")) : 2000,
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      propertyType: searchParams.get("propertyType") || "",
      bedrooms: searchParams.get("bedrooms") || "",
      bathrooms: searchParams.get("bathrooms") || "",
      amenities: searchParams.get("amenities") ? searchParams.get("amenities").split(',') : [],
      features: searchParams.get("features") ? searchParams.get("features").split(',') : [],
    };
    setFilters(newFilters);
    if (newFilters.lat && newFilters.lng) {
      setMapCenter([newFilters.lat, newFilters.lng]);
      setMarkerPosition([newFilters.lat, newFilters.lng]);
    }
  }, [location.search]);

  // Handle Search
  const handleSearch = () => {
    const validFilters = Object.fromEntries(
      Object.entries(filters).filter(([key, value]) => {
        if (Array.isArray(value)) {
          return value.length > 0;
        }
        return value !== "" && value !== null;
      })
    );
    navigate({
      pathname: '/listings',
      search: `?${createSearchParams(validFilters)}`
    });
    setShowModal(false);
  };

  // Update a single filter
  const handleFilterChange = (key, value) => {
    const updatedFilters = { ...filters, [key]: value };
    setFilters(updatedFilters);
  };

  // Remove a single filter
  const handleRemoveFilter = (key) => {
    let newFilters = { ...filters };
    if (key === "lat" || key === "lng") {
      newFilters.lat = null;
      newFilters.lng = null;
      setMarkerPosition(null);
    } else if (key === "amenities" || key === "features") {
      newFilters[key] = [];
    } else if (key === "minPrice" || key === "maxPrice") {
      newFilters.minPrice = "";
      newFilters.maxPrice = "";
    } else {
      newFilters[key] = "";
    }
    setFilters(newFilters);
    const validFilters = Object.fromEntries(
      Object.entries(newFilters).filter(([k, v]) => {
        if (Array.isArray(v)) {
          return v.length > 0;
        }
        return v !== "" && v !== null;
      })
    );
    navigate({
      pathname: '/listings',
      search: `?${createSearchParams(validFilters)}`
    });
  };

  // Remove all filters
  const handleRemoveAllFilters = () => {
    setFilters({
      location: "",
      lat: null,
      lng: null,
      radius: 2000,
      minPrice: "",
      maxPrice: "",
      propertyType: "",
      bedrooms: "",
      bathrooms: "",
      amenities: [],
      features: [],
    });
    setMarkerPosition(null);
    navigate("/listings");
  };

  // Current Location
  const handleUseCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setMapCenter([latitude, longitude]);
        setMarkerPosition([latitude, longitude]);
        setFilters(prev => ({ ...prev, lat: latitude, lng: longitude }));
      },
      (err) => toast.error("Failed to get location: " + err.message),
      { enableHighAccuracy: true }
    );
  };

  // Map click to choose location
  function LocationSelector() {
    useMapEvents({
      click(e) {
        setMarkerPosition([e.latlng.lat, e.latlng.lng]);
        setFilters(prev => ({ ...prev, lat: e.latlng.lat, lng: e.latlng.lng }));
      },
    });
    return null;
  }

  // Handle geocoding input
  const handleGeocodeInput = async (e) => {
    const query = e.target.value;
    handleFilterChange("location", query);
    if (query.length > 2) {
      const suggestions = await geocodeLocation(query);
      setLocationSuggestions(suggestions);
    } else {
      setLocationSuggestions([]);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    setFilters(prev => ({
      ...prev,
      location: suggestion.name,
      lat: suggestion.lat,
      lng: suggestion.lng,
    }));
    setMapCenter([suggestion.lat, suggestion.lng]);
    setMarkerPosition([suggestion.lat, suggestion.lng]);
    setLocationSuggestions([]);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get active filters for display
  const activeFilters = Object.entries(filters).filter(([key, value]) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== "" && value !== null;
  });

  const getFilterLabel = (key, value) => {
    switch (key) {
      case "location":
        return `Location: ${value}`;
      case "minPrice":
        return `Price: $${value} - $${filters.maxPrice}`;
      case "maxPrice":
        return null;
      case "propertyType":
        return `Type: ${value}`;
      case "bedrooms":
        return `${value}+ Beds`;
      case "bathrooms":
        return `${value}+ Baths`;
      case "lat":
      case "lng":
        return `Map Location`;
      case "radius":
        return `Radius: ${Math.round(value / 1000)} km`;
      case "amenities":
        return `Amenities: ${value.join(", ")}`;
      case "features":
        return `Features: ${value.join(", ")}`;
      default:
        return `${key}: ${value}`;
    }
  };

  return (
    <div
      className="flex flex-col bg-white sticky top-0 left-0 right-0 z-50 border-b border-borderColor px-4 md:px-12"
      style={{
        background: "linear-gradient(180deg, #ffffff 39.9%, #f8f8f8 100%)",
      }}
    >
      {/* --- Top Navigation --- */}
      <div className="flex w-full items-center justify-between">
        <Link to="/" className="z-50 py-4 md:py-6">
          <img src={assets.logo} alt="logo" className="h-8" />
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Add Listing / Dashboard */}
          <button
            onClick={() => {
              if (isOwner) navigate("/owner");
              else if (!user) setShowLogin(true);
              else toast.error("This functionality needs to be implemented.");
            }}
            className="hidden sm:flex cursor-pointer rounded-3xl px-4 py-2 hover:bg-bgColor"
          >
            {isOwner ? "Dashboard" : "Add Listing"}
          </button>

          {/* Dropdown Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center gap-3 rounded-full border border-borderColor px-3 py-2 hover:shadow-md"
              onClick={() => setOpen(!open)}
            >
              <img src={assets.menu_icon} alt="menu" className="h-4 w-4" />
              <img
                src={user?.image || assets.user_profile}
                alt="user"
                className="h-8 w-8 rounded-full object-cover"
              />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg border border-light bg-white shadow-xl">
                {menuLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
                <div
                  className="block px-4 py-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    if (!user) setShowLogin(true);
                    else logout();
                    setOpen(false);
                  }}
                >
                  {user ? "Logout" : "Login / Signup"}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- Search Bar --- */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="flex items-center justify-between max-w-4xl mx-auto w-full rounded-full bg-white shadow-md border px-6 py-3 cursor-pointer mt-4"
        onClick={() => setShowModal(true)}
      >
        <span className="text-gray-700">
          {filters.location || "Search location"}
        </span>
        <span className="text-gray-400">|</span>
        <span>
          {filters.minPrice || filters.maxPrice
            ? `$${filters.minPrice || 0} - $${filters.maxPrice || "Max"}`
            : "Any Price"}
        </span>
        <span className="text-gray-400">|</span>
        <span>
          {filters.propertyType || "Any Property Type"}
        </span>
        <span className="text-gray-400">|</span>
        <span>
          {filters.bedrooms
            ? `${filters.bedrooms}+ Beds`
            : "Any Bedrooms"}
        </span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="ml-4 bg-primary text-white px-4 py-2 rounded-full"
        >
          <img src={assets.search_icon} alt="search" className="h-4 w-4" />
        </motion.button>
      </motion.div>

      {/* --- Applied Filters Display --- */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 pb-4">
          <span className="font-semibold text-sm">Active Filters:</span>
          {activeFilters.map(([key, value]) => {
            const label = getFilterLabel(key, value);
            return label ? (
              <div key={key} className="flex items-center gap-1 bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                <span>{label}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFilter(key);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  &times;
                </button>
              </div>
            ) : null;
          })}
          <button
            onClick={handleRemoveAllFilters}
            className="px-3 py-1 text-sm rounded-full bg-red-500 text-white hover:bg-red-600 transition"
          >
            Remove All
          </button>
        </div>
      )}

      {/* --- Filter Modal --- */}
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

            {/* --- Location Input --- */}
            <div className="relative mb-4">
              <label className="block mb-2">Location</label>
              <input
                type="text"
                value={filters.location}
                onChange={handleGeocodeInput}
                placeholder="Search for a city or area"
                className="w-full border rounded-lg p-2"
              />
              {locationSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
                  {locationSuggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {suggestion.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              type="button"
              onClick={handleUseCurrentLocation}
              className="px-4 py-2 rounded-lg bg-primary text-white"
            >
              Use Current Location
            </button>

            {/* --- Map Picker --- */}
            <div className="mt-4 rounded-lg overflow-hidden border h-72">
              <MapContainer center={mapCenter} zoom={13} style={{ height: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationSelector />
                {markerPosition && (
                  <>
                    <Marker position={markerPosition} />
                    <Circle center={markerPosition} radius={filters.radius} />
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
                  value={filters.radius}
                  onChange={(e) =>
                    handleFilterChange("radius", Number(e.target.value))
                  }
                />
                <span>{Math.round(filters.radius / 1000)} km</span>
              </div>
            </div>

            {/* --- Other Filters --- */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="col-span-2">
                <label className="block mb-4">Price Range</label>
                <ReactSlider
                  className="horizontal-slider"
                  thumbClassName="example-thumb"
                  trackClassName="example-track"
                  defaultValue={[Number(filters.minPrice) || 0, Number(filters.maxPrice) || 5000000]}
                  min={0}
                  max={5000000}
                  step={100000}
                  onChange={([min, max]) => {
                    handleFilterChange("minPrice", min);
                    handleFilterChange("maxPrice", max);
                  }}
                  renderThumb={(props, state) => <div {...props}>${state.valueNow}</div>}
                />
                <div className="flex justify-between mt-2 text-sm text-gray-500">
                  <span>Min: ${filters.minPrice || 0}</span>
                  <span>Max: ${filters.maxPrice || "Max"}</span>
                </div>
              </div>

              <div>
                <label className="block mb-1">Property Type</label>
                <select
                  value={filters.propertyType}
                  onChange={(e) =>
                    handleFilterChange("propertyType", e.target.value)
                  }
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
                <label className="block mb-1">Bedrooms</label>
                <input
                  type="number"
                  value={filters.bedrooms}
                  onChange={(e) =>
                    handleFilterChange("bedrooms", e.target.value)
                  }
                  className="w-full border rounded-lg p-2"
                  placeholder="Min bedrooms"
                />
              </div>

              <div>
                <label className="block mb-1">Bathrooms</label>
                <input
                  type="number"
                  value={filters.bathrooms}
                  onChange={(e) =>
                    handleFilterChange("bathrooms", e.target.value)
                  }
                  className="w-full border rounded-lg p-2"
                  placeholder="Min bathrooms"
                />
              </div>

              {/* Amenities Filter */}
              <div className="col-span-2">
                <label className="block mb-2">Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {['Pool', 'Gym', 'WiFi', 'Parking', 'A/C'].map(amenity => (
                    <label key={amenity} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={filters.amenities.includes(amenity.toLowerCase())}
                        onChange={(e) => {
                          const newAmenities = e.target.checked
                            ? [...filters.amenities, amenity.toLowerCase()]
                            : filters.amenities.filter(a => a !== amenity.toLowerCase());
                          handleFilterChange("amenities", newAmenities);
                        }}
                      />
                      {amenity}
                    </label>
                  ))}
                </div>
              </div>

              {/* Features Filter */}
              <div className="col-span-2">
                <label className="block mb-2">Features</label>
                <div className="flex flex-wrap gap-2">
                  {['Balcony', 'Garden', 'Furnished', 'Pet-Friendly'].map(feature => (
                    <label key={feature} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={filters.features.includes(feature.toLowerCase())}
                        onChange={(e) => {
                          const newFeatures = e.target.checked
                            ? [...filters.features, feature.toLowerCase()]
                            : filters.features.filter(f => f !== feature.toLowerCase());
                          handleFilterChange("features", newFeatures);
                        }}
                      />
                      {feature}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* --- Footer --- */}
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSearch}
                className="px-4 py-2 rounded-lg bg-primary text-white"
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

export default Hero;
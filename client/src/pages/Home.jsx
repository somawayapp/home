
         

          import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { motion } from "framer-motion";
import ListingCard from "../components/ListingCard";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import "leaflet/dist/leaflet.css";
import L from "leaflet";


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrosshairs } from '@fortawesome/free-solid-svg-icons';

// Helper components for Leaflet
const LocationSelector = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick([e.latlng.lat, e.latlng.lng]);
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

  const [filters, setFilters] = useState({
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
  });

  const { showModal, setShowModal } = useAppContext();

  const [filteredListings, setFilteredListings] = useState([]);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [mapCenter, setMapCenter] = useState([51.505, -0.09]);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

// Custom red  marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
});

// Create a new custom icon that is a simple red dot or pin
const redPinIcon = new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
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
    } = filters;

    
// Text search filter
const searchTerm = location?.toLowerCase();
if (searchTerm) {
  const terms = searchTerm.split(/\s+/); // ["nairobi", "ngara"]

  newFilteredListings = newFilteredListings.filter((listing) => {
    const titleStr = listing.title?.toLowerCase() || "";
    const typeStr = listing.propertytype?.toLowerCase() || "";
    const locationStr = listing.location
      ? Object.values(listing.location).filter(Boolean).join(" ").toLowerCase()
      : "";

    // All terms must match in at least one field
    return terms.every((term) =>
      titleStr.includes(term) ||
      typeStr.includes(term) ||
      locationStr.includes(term)
    );
  });
}

    // Price filter
    newFilteredListings = newFilteredListings.filter((listing) =>
      listing.price >= minPrice && listing.price <= maxPrice
    );

    // Property type filter
    if (propertytype) {
      newFilteredListings = newFilteredListings.filter(
        (listing) => listing.propertytype?.toLowerCase() === propertytype.toLowerCase()
      );
    }

    if (offertype) {
  newFilteredListings = newFilteredListings.filter(
    (listing) => listing.offertype?.toLowerCase() === offertype.toLowerCase()
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
function toArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;       // already an array
  if (typeof val === "string") return val.split(","); // string from query
  return [];
}

const allAmenities = [
  ...toArray(amenitiesInternal),
  ...toArray(amenitiesExternal),
  ...toArray(amenitiesNearby),
].map(a => a.trim().toLowerCase());

if (allAmenities.length > 0) {
newFilteredListings = newFilteredListings.filter((listing) => {
  const listingAmenities = [
    ...(listing.amenities?.internal || []),
    ...(listing.amenities?.external || []),
    ...(listing.amenities?.nearby || []),
  ].map(a => a.toLowerCase()); // normalize

  return allAmenities.every(amenity => listingAmenities.includes(amenity));
});

    
}


    // Proximity search (Requires haversine calculation, omitted for brevity)
    // if (lat && lng) {
    //    newFilteredListings = newFilteredListings.filter((listing) => {
    //      return true; // Placeholder
    //    });
    // }

    setFilteredListings(newFilteredListings);
  };

  // Sync URL with filters
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        params.append(key, value.join(","));
      } else if (value && typeof value !== 'object') {
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

  // Handle a single filter change
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Handle amenity change
  const handleAmenityChange = (amenity, category) => {
    setFilters((prev) => {
      const currentAmenities = prev[category] || [];
      const newAmenities = currentAmenities.includes(amenity)
        ? currentAmenities.filter((a) => a !== amenity)
        : [...currentAmenities, amenity];
      return { ...prev, [category]: newAmenities };
    });
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
    };
    setFilters(defaultFilters);
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

  // Function to get address from coordinates
// Function to get address from coordinates


// Function to get the most specific available location name
// Only city/town/village (for default auto-fetch)
const getCityLevelLocation = async ([lat, lng]) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await res.json();
    if (data && data.address) {
      const address = data.address;
      return (
        address.city ||
        address.town ||
        address.village ||
        "Unknown Location"
      );
    }
    return "Unknown Location";
  } catch (err) {
    console.error("City-level geocode error:", err);
    return "Unknown Location";
  }
};

// Full fallback chain (for button click + map click)
const getPreciseLocationName = async ([lat, lng]) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await res.json();
    if (data && data.address) {
      const a = data.address;
      return (
        a.road ||
        a.neighbourhood ||
        a.hamlet ||
        a.suburb ||
        a.city ||
        a.town ||
        a.village ||
        a.county ||
        "Unknown Location"
      );
    }
    return "Unknown Location";
  } catch (err) {
    console.error("Precise geocode error:", err);
    return "Unknown Location";
  }
};



// ------------------ State Helpers ------------------
const setLocation = (locationName, lat, lng) => {
  handleFilterChange("location", locationName);
  localStorage.setItem("lastLocation", locationName);

  if (lat && lng) {
    localStorage.setItem("lastLat", lat);
    localStorage.setItem("lastLng", lng);
  }
};

const handleUseCurrentLocation = async () => {
  if ("geolocation" in navigator) {
    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setMarkerPosition([latitude, longitude]);
        setMapCenter([latitude, longitude]);

        // full fallback chain
        const precise = await getPreciseLocationName([latitude, longitude]);
        handleFilterChange("location", precise);

        // run filter immediately and check if empty
        setTimeout(() => {
          if (filteredListings.length === 0) {
            // try next broader level (city/town/village/county)
            getCityLevelLocation([latitude, longitude]).then((cityLevel) => {
              handleFilterChange("location", cityLevel);
              toast("No listings for precise spot, falling back to broader area.");
            });
          }
        }, 200);

        toast.success(`Location set to: ${precise}`);
        setIsFetchingLocation(false);
      },
      () => {
        toast.error("Unable to retrieve your location.");
        setIsFetchingLocation(false);
      }
    );
  } else {
    toast.error("Geolocation not supported.");
  }
};



const handleMapClick = async (latlng) => {
  setMarkerPosition(latlng);

  const locationName = await getPreciseLocationName(latlng);

  handleFilterChange("location", locationName);
  handleFilterChange("lat", null);
  handleFilterChange("lng", null);

  toast.success(`Location set to: ${locationName}`);
};





// ------------------ Mount Logic ------------------
useEffect(() => {
  const savedLocation = localStorage.getItem("lastLocation");
  const savedLat = localStorage.getItem("lastLat");
  const savedLng = localStorage.getItem("lastLng");

  if (savedLocation && savedLat && savedLng) {
    handleFilterChange("location", savedLocation);
    setMarkerPosition([parseFloat(savedLat), parseFloat(savedLng)]);
    setMapCenter([parseFloat(savedLat), parseFloat(savedLng)]);
  } else if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setMarkerPosition([latitude, longitude]);
        setMapCenter([latitude, longitude]);

        const locationName = await getCityLevelLocation([latitude, longitude]);
        setLocation(locationName, latitude, longitude);
      },
      () => {
        toast.error("Unable to retrieve location.");
      }
    );
  }
}, []);



  return (
    <div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="px-4 md:px-16  mt-6"
      >
       

        {/* --- Active Filters --- */}
        {getActiveFilters().length > 0 && (
          <div className=" mx-auto">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500 font-semibold bg-bgColor hover:bg-bgColorhover  cursor-pointer  px-2.5 py-2  rounded-full  text-gray-700 mr-2">
                Active Filters:
              </span>
              {getActiveFilters().map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center bg-bgColor text-gray-500  text-sm px-2.5 py-2 rounded-full"
                >
                  {key}: {value}
                  <button
                    onClick={() => {
                      const newFilters = { ...filters };
                      if (key.startsWith("amenities")) {
                        newFilters[key] = [];
                      } else {
                        newFilters[key] = key === "minPrice" ? 0 : key === "maxPrice" ? 1000000000 : "";
                      }
                      setFilters(newFilters);
                    }}
                    className="ml-2  hover:text-gray-600 cursor-pointer  focus:outline-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                onClick={handleClearAll}
                className="ml-2 bg-bgColor  text-gray-500  hover:bg-bgColorhover  cursor-pointer  rounded-full  px-2.5 py-2 text-sm  focus:outline-none"
              >
                Remove all
              </button>


                <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-lg bg-color-primary text-gray-500 hover:bg-color-primary-dull  cursor-pointer  focus:outline-none"
          >
            Filters
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
          className="fixed inset-0 bg-black/20 flex items-center justify-center  p-4 md:p-9 z-50"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl  w-full max-w-3xl border border-light shadow-xl p-3 md:p-8"
          >
            <div className="  max-h-[80vh] md:max-h-[90vh] overflow-y-auto p-1 ">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Filter Listings</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* --- Location Input with Autocomplete --- */}
            <label className="block mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={filters.location}
              onChange={(e) => handleFilterChange(e.target.name, e.target.value)}
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
                      handleFilterChange("location", suggestion.display_name);
                      setMarkerPosition([parseFloat(suggestion.lat), parseFloat(suggestion.lon)]);
                      setMapCenter([parseFloat(suggestion.lat), parseFloat(suggestion.lon)]);
                      setLocationSuggestions([]);
                    }}
                  >
                    {suggestion.display_name}
                  </li>
                ))}
              </ul>
            )}

            <button
              type="button"
              onClick={handleUseCurrentLocation }
              className={`px-4 py-3 btn text-sm inline-flex items-center mt-4 justify-center rounded-xl text-white font-semibold
                ${isFetchingLocation ? "animate-pulse" : ""}`}
            >
              <FontAwesomeIcon icon={faCrosshairs} className="mr-2" />
              {isFetchingLocation ? "Fetching location..." : "Use Current Location"}
            </button>


              

            {/* --- Map Picker --- */}
            <div className="mt-4 rounded-lg overflow-hidden border h-72">
              <MapContainer center={mapCenter} zoom={13} style={{ height: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationSelector onMapClick={handleMapClick} />
                {markerPosition && (
            <Marker position={markerPosition} icon={redPinIcon} />
                )}
              </MapContainer>
            </div>

            {/* --- Other Filters --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block mb-1">Price Range</label>
                <div className="px-1 text-color-primary">
                  <Slider
                    range
                    min={0}
                    max={1000000000}
                    step={10000}
                    value={[filters.minPrice, filters.maxPrice]}
                    onChange={(value) => {
                      handleFilterChange("minPrice", value[0]);
                      handleFilterChange("maxPrice", value[1]);
                    }}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>${filters.minPrice || 0}</span>
                  <span>${filters.maxPrice || 1000000000}</span>
                </div>

                {/* New Input Fields */}
                <div className="flex gap-4 mt-5">
                  <div className="w-1/2">
                    <label className="block text-sm text-gray-500 mb-1" htmlFor="min-price">Min Price ($)</label>
                    <input
                      id="min-price"
                      type="number"
                      value={filters.minPrice === 0 ? "" : filters.minPrice}
                      onChange={(e) => handleFilterChange("minPrice", e.target.value ? parseInt(e.target.value) : 0)}
                      className="w-full border rounded-lg p-2 text-sm"
                      placeholder="Min"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-sm text-gray-500  mb-1" htmlFor="max-price">Max Price ($)</label>
                    <input
                      id="max-price"
                      type="number"
                      value={filters.maxPrice === 1000000000 ? "" : filters.maxPrice}
                      onChange={(e) => handleFilterChange("maxPrice", e.target.value ? parseInt(e.target.value) : 1000000000)}
                      className="w-full border rounded-lg p-2 text-sm"
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>
              

                          <div className="flex-col gap-4 ">

              <div>
                <label className="block mb-1">Property Type</label>
                <select
                  name="propertytype"
                  value={filters.propertytype}
                  onChange={(e) => handleFilterChange(e.target.name, e.target.value)}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="">Any</option>
                             <option value="Apartment">Apartment</option>
<option value="Bedsitter">Bedsitter</option>
<option value="singleroom">Single Room</option>
<option value="Bungalow">Bungalow</option>
<option value="Maisonette">Maisonette</option>
<option value="Townhouse">Townhouse</option>
<option value="Villa">Villa</option>
<option value="House">House</option>
<option value="Land">Land / Plot</option>
<option value="Commercial">Commercial Property</option>
<option value="Office">Office Space</option>
<option value="Shop">Shop / Retail</option>
<option value="Warehouse">Warehouse / Godown</option>
<option value="Industrial">Industrial Property</option>
<option value="Hotel">Hotel / Guesthouse</option>
<option value="Farm">Farm / Agricultural Land</option> 
                </select>
              </div>



                <div>
                <label className="block mb-1 mt-4">Min Size (sqft)</label>
                <input
                  type="number"
                  name="size"
                  value={filters.size || ""}
                  onChange={(e) => handleFilterChange(e.target.name, e.target.value ? parseInt(e.target.value) : "")}
                  className="w-full border rounded-lg p-2"
                  placeholder="Min size"
                />
              </div>

              </div>
 
              <div>
                <label className="block mb-1">Min Bedrooms</label>
                <input
                  type="number"
                  name="bedrooms"
                  value={filters.bedrooms || ""}
                  onChange={(e) => handleFilterChange(e.target.name, e.target.value ? parseInt(e.target.value) : "")}
                  className="w-full border rounded-lg p-2"
                  placeholder="Min bedrooms"
                />
              </div>

              <div>
                <label className="block mb-1">Min Bathrooms</label>
                <input
                  type="number"
                  name="bathrooms"
                  value={filters.bathrooms || ""}
                  onChange={(e) => handleFilterChange(e.target.name, e.target.value ? parseInt(e.target.value) : "")}
                  className="w-full border rounded-lg p-2"
                  placeholder="Min bathrooms"
                />
              </div>

            
            </div>



          <div>
  <label className="block mb-1 mt-4 md:mt-6 font-medium">Offer Type</label>
  <div className="flex flex-col gap-2">
    <label className="flex items-center gap-2">
      <input
        type="radio"
        name="offertype"
        value="rent"
        checked={filters.offertype === "rent"}
        onChange={(e) =>
          handleFilterChange(
            "offertype",
            filters.offertype === "rent" ? "" : e.target.value
          )
        }
        className="w-4 h-4 accent-color-primary cursor-pointer"
      />
      <span className=" cursor-pointer">For Rent</span>
    </label>

    <label className="flex items-center gap-2">
      <input
        type="radio"
        name="offertype"
        value="sale"
        checked={filters.offertype === "sale"}
        onChange={(e) =>
          handleFilterChange(
            "offertype",
            filters.offertype === "sale" ? "" : e.target.value
          )
        }
        className="w-4 h-4 accent-color-primary cursor-pointer"
      />
      <span className=" cursor-pointer">For Sale</span>
    </label>
  </div>
</div>



            {/* --- Amenities --- */}
            <div className="mt-6 mb-6 flex  flex-col  gap-6">
              {/* Internal Amenities */}
              <div>
                <h3 className="text-md font-semibold mb-2">Internal Amenities</h3>
                 <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                                   {internalAmenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`internal-${amenity}`}
                        checked={filters.amenitiesInternal.includes(amenity)}
                        onChange={() => handleAmenityChange(amenity, "amenitiesInternal")}
                        className="accent-color-primary"
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
                        checked={filters.amenitiesExternal.includes(amenity)}
                        onChange={() => handleAmenityChange(amenity, "amenitiesExternal")}
                        className="accent-color-primary"
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
                        checked={filters.amenitiesNearby.includes(amenity)}
                        onChange={() => handleAmenityChange(amenity, "amenitiesNearby")}
                        className="accent-color-primary"
                      />
                      <label htmlFor={`nearby-${amenity}`} className="text-sm cursor-pointer">{amenity}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
         </div>  </motion.div>       

        </motion.div>
      )}
    </div>
  );
};

export default Home;
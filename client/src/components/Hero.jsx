import React, { useState, useEffect, useRef } from "react";
import { assets, menuLinks } from "../assets/assets";
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
import L from "leaflet"; // Import leaflet to change the default icon
import "rc-slider/assets/index.css"; // Import slider styles
import Slider from "rc-slider";

// Fix for default Leaflet icon not showing
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const Hero = () => {
    const navigate = useNavigate();
    const location = useLocation();
    // Destructure 'logout' from the useAppContext hook
    const { setShowLogin, user, logout, isOwner, axios, setIsOwner, filters, setFilters, handleSearch, handleRemoveAllFilters, handleRemoveFilter } =
        useAppContext();

    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [showModal, setShowModal] = useState(false);
    const [mapCenter, setMapCenter] = useState([0.3476, 32.5825]); // Kampala default
    const [markerPosition, setMarkerPosition] = useState(null);
    const [locationSuggestions, setLocationSuggestions] = useState([]);

    // Available amenities list
    const availableAmenities = ["WiFi", "Pool", "Gym", "Parking", "Air Conditioning", "Pet Friendly"];

    // --- Sync filters from URL on page load or URL change ---
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const newFilters = {
            location: searchParams.get("location") || "",
            lat: searchParams.get("lat") ? parseFloat(searchParams.get("lat")) : null,
            lng: searchParams.get("lng") ? parseFloat(searchParams.get("lng")) : null,
            radius: searchParams.get("radius") ? parseInt(searchParams.get("radius")) : 2000,
            minPrice: searchParams.get("minPrice") ? parseInt(searchParams.get("minPrice")) : null,
            maxPrice: searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")) : null,
            propertyType: searchParams.get("propertyType") || "",
            bedrooms: searchParams.get("bedrooms") ? parseInt(searchParams.get("bedrooms")) : null,
            bathrooms: searchParams.get("bathrooms") ? parseInt(searchParams.get("bathrooms")) : null,
            amenities: searchParams.get("amenities") ? searchParams.get("amenities").split(",") : [],
        };
        setFilters(newFilters);
        if (newFilters.lat && newFilters.lng) {
            setMapCenter([newFilters.lat, newFilters.lng]);
            setMarkerPosition([newFilters.lat, newFilters.lng]);
        }
    }, [location.search, setFilters]);

    // --- Geocoding for location autocomplete ---
    const geocode = async (query) => {
        if (query.length < 3) return [];
        try {
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`;
            const response = await fetch(url);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Geocoding failed:", error);
            return [];
        }
    };

    useEffect(() => {
        if (filters.location) {
            const handler = setTimeout(() => {
                geocode(filters.location).then(results => setLocationSuggestions(results));
            }, 500); // Debounce
            return () => clearTimeout(handler);
        } else {
            setLocationSuggestions([]);
        }
    }, [filters.location]);

    // --- Update a single filter ---
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    // --- Current Location ---
    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser.");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setMapCenter([latitude, longitude]);
                setMarkerPosition([latitude, longitude]);
                setFilters(prev => ({
                    ...prev,
                    lat: latitude,
                    lng: longitude,
                }));
                toast.success("Location found!");
            },
            (err) => {
                let message = "Failed to get location. Please enable location services in your browser settings.";
                if (err.code === err.PERMISSION_DENIED) {
                    message = "Location permission denied. Please enable it to use this feature.";
                }
                toast.error(message);
            },
            { enableHighAccuracy: true }
        );
    };

    // --- Map click to choose location ---
    function LocationSelector() {
        useMapEvents({
            click(e) {
                setMarkerPosition([e.latlng.lat, e.latlng.lng]);
                setFilters(prev => ({
                    ...prev,
                    lat: e.latlng.lat,
                    lng: e.latlng.lng,
                }));
            },
        });
        return null;
    }

    // --- Close dropdown on outside click ---
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // --- Get active filters for display ---
    const activeFilters = Object.entries(filters).filter(([key, value]) => {
        if (key === "amenities") {
            return value.length > 0;
        }
        return value !== "" && value !== null && key !== "lat" && key !== "lng";
    });

    // Also check for lat/lng to show the map filter
    if (filters.lat !== null && filters.lng !== null) {
        activeFilters.push(["mapLocation", "Map Location"]);
    }

    const getFilterLabel = (key, value) => {
        switch (key) {
            case "location":
                return `Location: ${value}`;
            case "minPrice":
                return `Min Price: $${value}`;
            case "maxPrice":
                return `Max Price: $${value}`;
            case "propertyType":
                return `Type: ${value}`;
            case "bedrooms":
                return `${value}+ Beds`;
            case "bathrooms":
                return `${value}+ Baths`;
            case "radius":
                return `Radius: ${Math.round(value / 1000)} km`;
            case "amenities":
                return `Amenities: ${value.join(", ")}`;
            case "mapLocation":
                return "Map Location Filter";
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
                            else toast("Feature coming soon", { icon: '🚀' }); // Placeholder for change role
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
                <span>{filters.maxPrice ? `Up to $${filters.maxPrice}` : "Any Price"}</span>
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
                <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                    <span className="font-semibold text-sm">Active Filters:</span>
                    {activeFilters.map(([key, value]) => (
                        <div key={key} className="flex items-center gap-1 bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                            <span>{getFilterLabel(key, value)}</span>
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
                    ))}
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

                        {/* --- Location Input with Autocomplete --- */}
                        <label className="block mb-2">Location</label>
                        <input
                            type="text"
                            value={filters.location}
                            onChange={(e) => handleFilterChange("location", e.target.value)}
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
                                            setFilters(prev => ({
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

                        <button
                            type="button"
                            onClick={handleUseCurrentLocation}
                            className="mt-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90"
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="block mb-1">Price Range</label>
                                <div className="px-1">
                                    <Slider
                                        range
                                        min={0}
                                        max={1000000}
                                        step={1000}
                                        value={[filters.minPrice || 0, filters.maxPrice || 1000000]}
                                        onChange={(value) => {
                                            setFilters(prev => ({
                                                ...prev,
                                                minPrice: value[0],
                                                maxPrice: value[1]
                                            }));
                                        }}
                                    />
                                </div>
                                <div className="flex justify-between text-sm text-gray-600 mt-2">
                                    <span>${filters.minPrice || 0}</span>
                                    <span>${filters.maxPrice || 1000000}</span>
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
                                <label className="block mb-1">Min Bedrooms</label>
                                <input
                                    type="number"
                                    value={filters.bedrooms || ""}
                                    onChange={(e) =>
                                        handleFilterChange("bedrooms", e.target.value ? parseInt(e.target.value) : null)
                                    }
                                    className="w-full border rounded-lg p-2"
                                    placeholder="Min bedrooms"
                                />
                            </div>

                            <div>
                                <label className="block mb-1">Min Bathrooms</label>
                                <input
                                    type="number"
                                    value={filters.bathrooms || ""}
                                    onChange={(e) =>
                                        handleFilterChange("bathrooms", e.target.value ? parseInt(e.target.value) : null)
                                    }
                                    className="w-full border rounded-lg p-2"
                                    placeholder="Min bathrooms"
                                />
                            </div>
                        </div>

                        {/* --- Amenities --- */}
                        <div className="mt-6">
                            <h3 className="text-md font-semibold mb-2">Amenities & Features</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4">
                                {availableAmenities.map((amenity) => (
                                    <div key={amenity} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id={amenity}
                                            checked={filters.amenities.includes(amenity)}
                                            onChange={() => {
                                                const newAmenities = filters.amenities.includes(amenity)
                                                    ? filters.amenities.filter((a) => a !== amenity)
                                                    : [...filters.amenities, amenity];
                                                handleFilterChange("amenities", newAmenities);
                                            }}
                                            className="accent-primary"
                                        />
                                        <label htmlFor={amenity} className="text-sm cursor-pointer">{amenity}</label>
                                    </div>
                                ))}
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
                                onClick={() => {
                                    handleSearch();
                                    setShowModal(false);
                                }}
                                className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90"
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
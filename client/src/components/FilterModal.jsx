import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import L from "leaflet";

const FilterModal = ({
  showModal,
  setShowModal,
  handleSearch,
  filters,
  setFilters,
  useCurrentLocation,
}) => {
  const [mapCenter, setMapCenter] = useState([0.3476, 32.5825]); // Default center (Kampala as fallback)
  const [radius, setRadius] = useState(2000); // meters
  const [markerPosition, setMarkerPosition] = useState(null);

  // Get current location if available
  const handleUseCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setMapCenter([latitude, longitude]);
        setMarkerPosition([latitude, longitude]);
        setFilters({ ...filters, lat: latitude, lng: longitude, radius });
      },
      (err) => console.log("Location error:", err),
      { enableHighAccuracy: true }
    );
  };

  function LocationSelector() {
    useMapEvents({
      click(e) {
        setMarkerPosition([e.latlng.lat, e.latlng.lng]);
        setFilters({ ...filters, lat: e.latlng.lat, lng: e.latlng.lng, radius });
      },
    });
    return null;
  }

  return (
    showModal && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/10 flex p-2 items-center justify-center z-50"
        onClick={() => setShowModal(false)}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl p-6 w-full border border-light max-w-3xl shadow-xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-lg font-semibold mb-4">Filter Listings</h2>

          {/* Location Search */}
          <div className="flex flex-col gap-4">
            <label className="block text-sm font-medium">Location</label>
            <input
              type="text"
              placeholder="Type a city or area"
              value={filters.pickupLocation || ""}
              onChange={(e) => setFilters({ ...filters, pickupLocation: e.target.value })}
              className="w-full border rounded-lg p-2"
            />
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              className="px-4 py-2 rounded-lg bg-primary text-white"
            >
              Use Current Location
            </button>
          </div>

          {/* Map Picker */}
          <div className="mt-4 rounded-lg overflow-hidden border h-72">
            <MapContainer center={mapCenter} zoom={13} style={{ height: "100%", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationSelector />
              {markerPosition && (
                <>
                  <Marker position={markerPosition}></Marker>
                  <Circle center={markerPosition} radius={radius} />
                </>
              )}
            </MapContainer>
            <div className="flex items-center gap-3 mt-2">
              <label>Search Radius:</label>
              <input
                type="range"
                min="500"
                max="10000"
                step="500"
                value={radius}
                onChange={(e) => {
                  setRadius(Number(e.target.value));
                  setFilters({ ...filters, radius: Number(e.target.value) });
                }}
              />
              <span>{Math.round(radius / 1000)} km</span>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block mb-1">Max Price</label>
              <input
                type="number"
                placeholder="Max price"
                value={filters.pricePerDay || ""}
                onChange={(e) => setFilters({ ...filters, pricePerDay: e.target.value })}
                className="w-full border rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block mb-1">Property Type</label>
              <select
                value={filters.propertyType || ""}
                onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
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
                placeholder="Min bedrooms"
                value={filters.bedrooms || ""}
                onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
                className="w-full border rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block mb-1">Bathrooms</label>
              <input
                type="number"
                placeholder="Min bathrooms"
                value={filters.bathrooms || ""}
                onChange={(e) => setFilters({ ...filters, bathrooms: e.target.value })}
                className="w-full border rounded-lg p-2"
              />
            </div>
          </div>

          {/* Footer */}
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
    )
  );
};

export default FilterModal;

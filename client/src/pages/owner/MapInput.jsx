import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrosshairs } from "@fortawesome/free-solid-svg-icons";
import L from "leaflet";
import { toast } from "react-hot-toast";

// Fix Leaflet marker issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Red pin
const redPinIcon = new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png`,
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Helper: reverse geocode with structured details
const getAddressFromCoordinates = async (coords, setForm) => {
  const provider = new OpenStreetMapProvider({
    params: { "accept-language": "en" },
  });
  try {
    const results = await provider.search({
      query: `${coords[0]}, ${coords[1]}`,
    });
    if (results.length > 0) {
      const result = results[0];
      const raw = result.raw.address || {};

      setForm((prev) => ({
        ...prev,
        country: raw.country || "Kenya",
        county: raw.county || "",
        city: raw.city || raw.town || raw.village || "",
        area: raw.suburb || raw.neighbourhood || "",
        exactLocation: result.label,
        coordinates: coords,
      }));
    } else {
      toast.error("Could not find an address for this location.");
    }
  } catch (err) {
    console.error("Geocoding error:", err);
    toast.error("Error fetching address. Try again.");
  }
};

// Map click handler
const MapEvents = ({ setForm }) => {
  const map = useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      await getAddressFromCoordinates([lat, lng], setForm);
      map.flyTo(e.latlng, map.getZoom());
    },
  });
  return null;
};

const MapInput = ({ onLocationChange }) => {
  const [form, setForm] = useState({
    country: "Kenya",
    county: "",
    city: "",
    area: "",
    exactLocation: "",
    coordinates: null, // [lat, lng]
  });
  const [loading, setLoading] = useState(false);

  // Send data upwards
  useEffect(() => {
    onLocationChange(form);
  }, [form, onLocationChange]);

  // Get current device location
  const handleGetCurrentLocation = () => {
    setLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          await getAddressFromCoordinates([latitude, longitude], setForm);
          setLoading(false);
          toast.success("Current location set!");
        },
        (err) => {
          console.error("Geolocation error:", err);
          toast.error("Enable location services.");
          setLoading(false);
        }
      );
    } else {
      toast.error("Geolocation not supported.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <label className="font-semibold md:text-lg">Location</label>

      {/* Inputs */}
      <input
        type="text"
        placeholder="Country"
        value={form.country}
        readOnly
        className="px-3 py-2 border rounded-md"
      />
      <input
        type="text"
        placeholder="County"
        value={form.county}
        onChange={(e) => setForm({ ...form, county: e.target.value })}
        className="px-3 py-2 border rounded-md"
      />
      <input
        type="text"
        placeholder="City / Town"
        value={form.city}
        onChange={(e) => setForm({ ...form, city: e.target.value })}
        className="px-3 py-2 border rounded-md"
      />
      <input
        type="text"
        placeholder="Area"
        value={form.area}
        onChange={(e) => setForm({ ...form, area: e.target.value })}
        className="px-3 py-2 border rounded-md"
      />
      <input
        type="text"
        placeholder="Exact Location"
        value={form.exactLocation}
        onChange={(e) => setForm({ ...form, exactLocation: e.target.value })}
        className="px-3 py-2 border rounded-md"
      />

      {/* Lat / Lng (optional) */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Latitude"
          value={form.coordinates ? form.coordinates[0] : ""}
          readOnly
          className="px-3 py-2 border rounded-md flex-1"
        />
        <input
          type="text"
          placeholder="Longitude"
          value={form.coordinates ? form.coordinates[1] : ""}
          readOnly
          className="px-3 py-2 border rounded-md flex-1"
        />
      </div>

      {/* Button */}
      <button
        type="button"
        onClick={handleGetCurrentLocation}
        disabled={loading}
        className="px-4 py-3 rounded-xl text-white bg-blue-600 font-semibold"
      >
        {loading ? "Fetching..." : <><FontAwesomeIcon icon={faCrosshairs} /> Use Exact Location</>}
      </button>

      {/* Map */}
      <div className="w-full h-80 rounded-md overflow-hidden shadow-md z-0">
        <MapContainer
          center={form.coordinates || [-1.286389, 36.817223]} // Nairobi
          zoom={form.coordinates ? 15 : 8}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {form.coordinates && (
            <Marker position={form.coordinates} icon={redPinIcon} />
          )}
          <MapEvents setForm={setForm} />
        </MapContainer>
      </div>
    </div>
  );
};

export default MapInput;

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrosshairs } from '@fortawesome/free-solid-svg-icons';
import L from 'leaflet';
import { toast } from 'react-hot-toast';

// Fix for default marker icon issue with Leaflet in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Red custom marker icon
const redPinIcon = new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});




// ✅ Reverse geocoding using Nominatim API
const getAddressFromCoordinates = async (coords, setLocationData) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${coords[0]}&lon=${coords[1]}&format=json&addressdetails=1`
    );
    const data = await res.json();

    if (data && data.address) {
      const place = data.address;

      setLocationData((prev) => ({
        ...prev,
        country: "Kenya", // force Kenya if all your points are inside
        county:  "",
        city: place.city || place.town || place.village || "",
        suburb: place.suburb || "",
        area: place.neighbourhood || "",
        road: place.road || place.hamlet || "",

        coordinates: coords,
      }));
    } else {
      setLocationData((prev) => ({
        ...prev,
        coordinates: coords,
      }));
      toast.error("Could not find address details for this location.");
    }
  } catch (error) {
    console.error("Geocoding error:", error);
    setLocationData((prev) => ({
      ...prev,
      coordinates: coords,
    }));
    toast.error("Error fetching address. Coordinates were saved.");
  }
};

// Map click handler
const MapEvents = ({ setLocationData }) => {
  const map = useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      await getAddressFromCoordinates([lat, lng], setLocationData);
      map.flyTo(e.latlng, map.getZoom());
    },
  });
  return null;
};


const KENYA_COUNTIES = [
  "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita-Taveta",
  "Garissa", "Wajir", "Mandera", "Marsabit", "Isiolo", "Meru",
  "Tharaka-Nithi", "Embu", "Kitui", "Machakos", "Makueni", "Nyandarua",
  "Nyeri", "Kirinyaga", "Murang'a", "Kiambu", "Turkana", "West Pokot",
  "Samburu", "Trans Nzoia", "Uasin Gishu", "Elgeyo-Marakwet", "Nandi",
  "Baringo", "Laikipia", "Nakuru", "Narok", "Kajiado", "Kericho", "Bomet",
  "Kakamega", "Vihiga", "Bungoma", "Busia", "Siaya", "Kisumu", "Homa Bay",
  "Migori", "Kisii", "Nyamira", "Nairobi"
];

const MapInput = ({ initialLocation, onLocationChange }) => {
  const [locationData, setLocationData] = useState(
    initialLocation || {
      country: "Kenya",
      county: "",
      city: "",
      suburb: "",
      area: "",
      road: "",
      coordinates: null,
    }
  );
  const [loading, setLoading] = useState(false);

  // Send changes to parent
  useEffect(() => {
    onLocationChange(locationData);
  }, [locationData, onLocationChange]);

  // Use browser geolocation
  const handleGetCurrentLocation = () => {
    setLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          await getAddressFromCoordinates([latitude, longitude], setLocationData);
          setLoading(false);
          toast.success("Current location set!");
        },
        (error) => {
          console.error("Geolocation error:", error.code, error.message);
          let msg = "Error getting your location.";
          if (error.code === 1) msg = "Permission denied. Please allow location access.";
          if (error.code === 2) msg = "Position unavailable.";
          if (error.code === 3) msg = "Location request timed out.";
          toast.error(msg);
          setLoading(false);
        }
      );
    } else {
      toast.error("Geolocation not supported by your browser.");
      setLoading(false);
    }
  };


  

  return (
    <div className="flex flex-col gap-4 w-full">
      <label className="font-semibold md:text-lg">Location</label>

      {/* Form inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
     <input
    type="text"
     placeholder="Country"
     value={locationData.country}
     readOnly
     className="px-3 py-2 border rounded-md cursor-not-allowed"
     />


        <input
          type="text"
          placeholder="County"
          list="counties-list"
          value={locationData.county}
          onChange={(e) => setLocationData({ ...locationData, county: e.target.value })}
          className="px-3 py-2 border rounded-md"
                     required

        />
        <datalist id="counties-list">
          {KENYA_COUNTIES.map((cty) => (
            <option key={cty} value={cty} />
          ))}
        </datalist>

        <input
          type="text"
          placeholder="City or Town"
          value={locationData.city}
          onChange={(e) => setLocationData({ ...locationData, city: e.target.value })}
          className="px-3 py-2 border rounded-md"
                     required

        />

        <input
          type="text"
          placeholder="Suburb"
          value={locationData.suburb}
          onChange={(e) => setLocationData({ ...locationData, suburb: e.target.value })}
          className="px-3 py-2 border rounded-md"
                     required

        />

        <input
          type="text"
          placeholder="Area"
          value={locationData.area}
          onChange={(e) => setLocationData({ ...locationData, area: e.target.value })}
          className="px-3 py-2 border rounded-md"
                     required

        />


       <input
          type="text"
          placeholder="Road or Estate"
          value={locationData.road}
          onChange={(e) => setLocationData({ ...locationData, road: e.target.value })}
          className="px-3 py-2 border rounded-md"
                     required

        />
        {/* Editable Latitude */}
        <input
          type="text"
          placeholder="Latitude"
          value={locationData.coordinates ? locationData.coordinates[0] : ""}
          onChange={(e) => {
            const lat = parseFloat(e.target.value) || "";
            setLocationData((prev) => ({
              ...prev,
              coordinates: [lat, prev.coordinates ? prev.coordinates[1] : ""],
            }));
          }}
          className="px-3 py-2 border rounded-md"
        />

        {/* Editable Longitude */}
        <input
          type="text"
          placeholder="Longitude"
          value={locationData.coordinates ? locationData.coordinates[1] : ""}
          onChange={(e) => {
            const lng = parseFloat(e.target.value) || "";
            setLocationData((prev) => ({
              ...prev,
              coordinates: [prev.coordinates ? prev.coordinates[0] : "", lng],
            }));
          }}
          className="px-3 py-2 border rounded-md"
        />
      </div>

      {/* Button */}
      <div className="flex items-center gap-2">
          <div className="p-[6px] bg-primary/40 rounded-3xl shadow-lg">

<button
  type="button"
  onClick={handleGetCurrentLocation}
  className={`px-4 py-3 btn text-sm inline-flex items-center justify-center rounded-3xl text-white font-semibold
    ${loading ? "animate-pulse" : ""}`}
>
  <FontAwesomeIcon icon={faCrosshairs} className="mr-2" />
  {loading ? "Fetching location..." : "Use Current Location"}
</button>
</div>

      </div>

      {/* Map */}
      <div className="w-full h-80 rounded-md overflow-hidden shadow-md z-0">
        <MapContainer
          center={locationData.coordinates || [-1.286389, 36.817223]} // Nairobi default
          zoom={locationData.coordinates ? 15 : 8}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {locationData.coordinates && (
            <Marker position={locationData.coordinates} icon={redPinIcon} />
          )}
          <MapEvents setLocationData={setLocationData} />
        </MapContainer>
      </div>
    </div>
  );
};

export default MapInput;


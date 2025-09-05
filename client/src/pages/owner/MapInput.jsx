import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
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

// Create a new custom icon that is a simple red dot or pin
const redPinIcon = new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component to handle map events and user interaction
const MapEvents = ({ setPosition, setAddress }) => {
  const map = useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      await getAddressFromCoordinates([lat, lng], setAddress);
      map.flyTo(e.latlng, map.getZoom()); // Optional: center map on click
    },
  });
  return null;
};

// Reverse geocoding function
const getAddressFromCoordinates = async (coords, setAddress) => {
  const provider = new OpenStreetMapProvider({
    params: {
      'accept-language': 'en',
    },
  });
  try {
    const results = await provider.search({ query: `${coords[0]}, ${coords[1]}` });
    if (results.length > 0) {
      setAddress(results[0].label);
    } else {
      setAddress('');
      toast.error('Could not find an address for this location.');
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    toast.error('Error fetching address. Please try again.');
  }
};

const MapInput = ({ initialAddress, onLocationChange }) => {
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState(initialAddress || '');
  const [loading, setLoading] = useState(false);

  // Effect to update the parent component when position or address changes
  useEffect(() => {
    onLocationChange({
      location: address,
      coordinates: position,
    });
  }, [position, address, onLocationChange]);

  // Function to get current location from browser
  const handleGetCurrentLocation = () => {
    setLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
          await getAddressFromCoordinates([latitude, longitude], setAddress);
          setLoading(false);
          toast.success('Current location set!');
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast.error("Error getting your location. Please ensure location services are enabled.");
          setLoading(false);
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <label>Location</label>
      <div className="flex items-center gap-2 mb-2">
        <input
          type="text"
          name="location"
          placeholder="Enter address or click on the map"
          className="px-3 py-2 mt-1 flex-1 border border-gray-600 hover:border-blue-800 rounded-md outline-none focus:ring focus:ring-blue-800"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="px-4 py-2 mt-1 text-sm bg-blue-800 text-white rounded-md hover:bg-blue-900 transition-colors flex items-center gap-2 cursor-pointer"
          disabled={loading}
        >
          {loading ? 'Fetching...' : <><FontAwesomeIcon icon={faCrosshairs} /> Current Location</>}
        </button>
      </div>

      <div className="w-full h-80 rounded-md overflow-hidden shadow-md z-0">
        <MapContainer
          center={position || [-1.286389, 36.817223]} // Default to Nairobi, Kenya
          zoom={position ? 15 : 8}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {position && <Marker position={position} icon={redPinIcon} />}
          <MapEvents setPosition={setPosition} setAddress={setAddress} />
        </MapContainer>
      </div>
    </div>
  );
};

export default MapInput;
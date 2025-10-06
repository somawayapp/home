import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();
  const currency = import.meta.env.VITE_CURRENCY;
  const locationHook = useLocation();
  const [showModal, setShowModal] = useState(false);


  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  

  // ✅ Filters for listings
  const [filters, setFilters] = useState({
    location: "",
    minPrice: "",
    maxPrice: "",
    propertytype: "",
    offertype: "", // "sale" | "rent"
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

  // ✅ Listings state
  const [listings, setListings] = useState([]);

  // Function to check if user is logged in
  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/user/data");
      if (data.success) {
        setUser(data.user);
        setIsOwner(data.user.role === "owner");
      } else {
        navigate("/");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };


  // ✅ Fetch all listings from the server (no query filters)
const fetchListings = async () => {
  try {
    const { data } = await axios.get("/api/user/listings");
    if (data.success) {
      setListings(data.listings);
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error(error.message);
  }
};

  // ✅ Fetch all listings from the server
  const fetchListings = async () => {
    try {
      // Parse filters from URL search params
      const params = new URLSearchParams(locationHook.search);
      const queryParams = {};

      [
        "location",
        "minPrice",
        "maxPrice",
        "propertytype",
        "offertype",
        "bedrooms",
        "bathrooms",
        "rooms",
        "size",
        "amenitiesInternal",
        "amenitiesExternal",
        "amenitiesNearby",
        "featured",
        "available",
      ].forEach((key) => {
        const value = params.get(key);
        if (value) queryParams[key] = value;
      });

      const { data } = await axios.get("/api/user/listings", { params: queryParams });

      data.success ? setListings(data.listings) : toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Function to log out the user
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setIsOwner(false);
    axios.defaults.headers.common["Authorization"] = "";
    toast.success("You have been logged out");
  };

  // Retrieve token from localStorage on first render
  useEffect(() => {
    const token = localStorage.getItem("token");
    setToken(token);
    fetchListings();
  }, []);

  // Fetch user data when token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `${token}`;
      fetchUser();
    }
  }, [token]);

  const value = {
    navigate,
    currency,
    axios,
    user,
    showModal,
     setShowModal,
    setUser,
    token,
    setToken,
    isOwner,
    setIsOwner,
    fetchUser,
    showLogin,
    setShowLogin,
    logout,
    fetchListings,
    listings,
    setListings,
    filters,
    setFilters,
    
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;


};

export const useAppContext = () => {
  return useContext(AppContext);
};

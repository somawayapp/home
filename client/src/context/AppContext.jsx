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
const [loading, setLoading] = useState(true); // start as true

const fetchListings = async () => {
  try {
    setLoading(true); // <-- show preloader while fetching
    const { data } = await axios.get("/api/user/listings");
    if (data.success) {
      setListings(data.listings);
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error(error.message);
  } finally {
    setLoading(false); // <-- hide preloader
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
    loading,
    setLoading,    // optional, if you want to toggle manually
  
    
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;


};

export const useAppContext = () => {
  return useContext(AppContext);
};

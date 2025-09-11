import { createContext, useContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate, useLocation, createSearchParams } from "react-router-dom";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

export const AppContext = createContext();

// A simple debounce function to prevent excessive API calls
const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
};

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();
  const currency = import.meta.env.VITE_CURRENCY;
  const locationHook = useLocation();

  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [listings, setListings] = useState([]);
  const isInitialMount = useRef(true);

  // Centralized Filters state
  const [filters, setFilters] = useState({
    location: "",
    lat: null,
    lng: null,
    radius: 2000,
    minPrice: null,
    maxPrice: null,
    propertyType: "",
    bedrooms: null,
    bathrooms: null,
    amenities: [],
  });


  // Debounced function for fetching listings
  const debouncedFetchListings = useRef(debounce(async (currentFilters) => {
    try {
      const queryParams = Object.fromEntries(
        Object.entries(currentFilters).filter(([key, value]) => {
          if (key === "amenities") {
            return value.length > 0;
          }
          return value !== "" && value !== null;
        })
      );

      if (queryParams.amenities) {
        queryParams.amenities = queryParams.amenities.join(",");
      }

      // Update URL with the new filters
      navigate({
        pathname: '/listings',
        search: `?${createSearchParams(queryParams)}`
      });
      
      // Fetch data with new filters
      const { data } = await axios.get("/api/user/listings", { params: queryParams });
      
      data.success ? setListings(data.listings) : toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  }, 500)).current;

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

  // --- Handle Search and Filter Removal ---
  const handleSearch = () => {
    debouncedFetchListings(filters);
  };

  const handleRemoveFilter = (key) => {
    const newFilters = { ...filters };
    if (key === "lat" || key === "lng" || key === "mapLocation") {
      newFilters.lat = null;
      newFilters.lng = null;
    } else if (key === "amenities") {
      newFilters.amenities = [];
    } else {
      newFilters[key] = key === "minPrice" || key === "maxPrice" || key === "bedrooms" || key === "bathrooms" ? null : "";
    }
    setFilters(newFilters);
    debouncedFetchListings(newFilters);
  };

  const handleRemoveAllFilters = () => {
    const newFilters = {
      location: "",
      lat: null,
      lng: null,
      radius: 2000,
      minPrice: null,
      maxPrice: null,
      propertyType: "",
      bedrooms: null,
      bathrooms: null,
      amenities: [],
    };
    setFilters(newFilters);
    navigate("/listings");
  };

  // --- Effects ---

  // Effect to initialize state from URL on first mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    setToken(token);
    
    // Initial fetch based on URL params
    const searchParams = new URLSearchParams(locationHook.search);
    const queryParams = {};
    for (let [key, value] of searchParams.entries()) {
      if (key === "amenities") {
        queryParams[key] = value.split(",");
      } else {
        queryParams[key] = value;
      }
    }

    setFilters(prev => ({
      ...prev,
      ...queryParams
    }));

    // Initial data fetch
    const fetchData = async () => {
      try {
        const { data } = await axios.get("/api/user/listings", { params: queryParams });
        data.success ? setListings(data.listings) : toast.error(data.message);
      } catch (error) {
        toast.error(error.message);
      }
    };
    fetchData();
    isInitialMount.current = false;

  }, []);

  // Fetch user data when token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `${token}`;
      fetchUser();
    }
  }, [token]);

  // Debounce effect: trigger live filtering when filters change
  useEffect(() => {
    // We don't want to run this effect on the initial mount as the initial fetch is already handled.
    if (isInitialMount.current) return;

    const validFilters = Object.fromEntries(
      Object.entries(filters).filter(([key, value]) => {
        if (key === "amenities") {
          return value.length > 0;
        }
        return value !== "" && value !== null;
      })
    );
    
    // Check if filters have actually changed in a meaningful way
    const currentSearchParams = new URLSearchParams(locationHook.search);
    const currentParams = Object.fromEntries(currentSearchParams.entries());
    
    // A basic check to prevent re-fetching if only lat/lng are updated from map interaction without a new search.
    const hasFilterChanged = JSON.stringify(validFilters) !== JSON.stringify(currentParams);

    if (hasFilterChanged && locationHook.pathname === "/listings") {
      debouncedFetchListings(filters);
    }
  }, [filters, locationHook.pathname, locationHook.search]);


  const value = {
    navigate,
    currency,
    axios,
    user,
    setUser,
    token,
    setToken,
    isOwner,
    setIsOwner,
    fetchUser,
    showLogin,
    setShowLogin,
    logout,
    listings,
    setListings,
    filters,
    setFilters,
    handleSearch,
    handleRemoveFilter,
    handleRemoveAllFilters,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
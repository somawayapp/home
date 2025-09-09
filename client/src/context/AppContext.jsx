import { createContext, useContext, useEffect, useState } from "react";
import axios from 'axios'
import {toast} from 'react-hot-toast'
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

export const AppContext = createContext();

export const AppProvider = ({ children })=>{

    const navigate = useNavigate()
    const currency = import.meta.env.VITE_CURRENCY
    const location = useLocation();

    const [token, setToken] = useState(null)
    const [user, setUser] = useState(null)
    const [isOwner, setIsOwner] = useState(false)
    const [showLogin, setShowLogin] = useState(false)
    const [pricePerDay, setPricePerDay] = useState('')
    const [seatingCapacity, setSeatingCapacity] = useState('')

    const [listings, setListings] = useState([])

    // Function to check if user is logged in
    const fetchUser = async ()=>{
        try {
           const {data} = await axios.get('/api/user/data')
           if (data.success) {
            setUser(data.user)
            setIsOwner(data.user.role === 'owner')
           }else{
            navigate('/')
           }
        } catch (error) {
            toast.error(error.message)
        }
    }
    // Function to fetch all listings from the server



const fetchListings = async () =>{
    try {
        // Grab query params from current URL
        const params = new URLSearchParams(location.search);
        const pickupLocation = params.get("pickupLocation");
        const pricePerDay = params.get("pricePerDay");
        const seatingCapacity = params.get("seatingCapacity");

        // Send them to backend
        const { data } = await axios.get("/api/user/listings", {
            params: { pickupLocation, pricePerDay, seatingCapacity }
        });

        data.success ? setListings(data.listings) : toast.error(data.message);
    } catch (error) {
        toast.error(error.message);
    }
};


    // Function to log out the user
    const logout = ()=>{
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
        setIsOwner(false)
        axios.defaults.headers.common['Authorization'] = ''
        toast.success('You have been logged out')
    }


    // useEffect to retrieve the token from localStorage
    useEffect(()=>{
        const token = localStorage.getItem('token')
        setToken(token)
        fetchListings()
    },[])

    // useEffect to fetch user data when token is available
    useEffect(()=>{
        if(token){
            axios.defaults.headers.common['Authorization'] = `${token}`
            fetchUser()
        }
    },[token])

    const value = {
        navigate, currency, axios, user, setUser,
        token, setToken, isOwner, setIsOwner, fetchUser, showLogin, setShowLogin, logout, fetchListings, listings, setListings, 
        pricePerDay, setPricePerDay, seatingCapacity, setSeatingCapacity
    }

    return (
    <AppContext.Provider value={value}>
        { children }
    </AppContext.Provider>
    )
}

export const useAppContext = ()=>{
    return useContext(AppContext)
}
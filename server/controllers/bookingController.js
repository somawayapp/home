import Booking from "../models/Booking.js"
import Listing from "../models/Listing.js";


// Function to Check Availability of listing for a given Date
const checkAvailability = async (listing, pickupDate, returnDate)=>{
    const bookings = await Booking.find({
        listing,
        pickupDate: {$lte: returnDate},
        returnDate: {$gte: pickupDate},
    })
    return bookings.length === 0;
}

// API to Check Availability of listings for the given Date and location
export const checkAvailabilityOfListing = async (req, res)=>{
    try {
        const {location, pickupDate, returnDate} = req.body

        // fetch all available listing for the given location
        const listing = await Listing.find({location, isAvaliable: true})

        // check listing availability for the given date range using promise
        const availableListingsPromises = listings.map(async (listing)=>{
           const isAvailable = await checkAvailability(listing._id, pickupDate, returnDate)
           return {...listing._doc, isAvailable: isAvailable}
        })

        let availableListings = await Promise.all(availableListingsPromises);
        availableListings = availableListings.filter(listing => listing.isAvailable === true)

        res.json({success: true, availableListings})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// API to Create Booking
export const createBooking = async (req, res)=>{
    try {
        const {_id} = req.user;
        const {listing, pickupDate, returnDate} = req.body;

        const isAvailable = await checkAvailability(listing, pickupDate, returnDate)
        if(!isAvailable){
            return res.json({success: false, message: "Listing is not available"})
        }

        const listingData = await Listing.findById(listing)

        // Calculate price based on pickupDate and returnDate
        const picked = new Date(pickupDate);
        const returned = new Date(returnDate);
        const noOfDays = Math.ceil((returned - picked) / (1000 * 60 * 60 * 24))
        const price = listingData.pricePerDay * noOfDays;

        await Booking.create({listing, owner: listingData.owner, user: _id, pickupDate, returnDate, price})

        res.json({success: true, message: "Booking Created"})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// API to List User Bookings 
export const getUserBookings = async (req, res)=>{
    try {
        const {_id} = req.user;
        const bookings = await Booking.find({ user: _id }).populate("listing").sort({createdAt: -1})
        res.json({success: true, bookings})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// API to get Owner Bookings

export const getOwnerBookings = async (req, res)=>{
    try {
        if(req.user.role !== 'owner'){
            return res.json({ success: false, message: "Unauthorized" })
        }
        const bookings = await Booking.find({owner: req.user._id}).populate('listing user').select("-user.password").sort({createdAt: -1 })
        res.json({success: true, bookings})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// API to change booking status
export const changeBookingStatus = async (req, res)=>{
    try {
        const {_id} = req.user;
        const {bookingId, status} = req.body

        const booking = await Booking.findById(bookingId)

        if(booking.owner.toString() !== _id.toString()){
            return res.json({ success: false, message: "Unauthorized"})
        }

        booking.status = status;
        await booking.save();

        res.json({ success: true, message: "Status Updated"})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}
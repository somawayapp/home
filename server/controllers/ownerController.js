
import imagekit from "../configs/imageKit.js";
import Booking from "../models/Booking.js";
import Listing from "../models/Listing.js";
import User from "../models/User.js";
import fs from "fs";
import path from "path";
import pLimit from "p-limit";





// API to Change Role of User
export const changeRoleToOwner = async (req, res)=>{
    try {
        const {_id} = req.user;
        await User.findByIdAndUpdate(_id, {role: "owner"})
        res.json({success: true, message: "Now you can create a listing"})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}





// server/controllers/listingController.js (or wherever your controller is)
export const autosaveListingDraft = async (req, res) => {
  try {
    const { _id: agency } = req.user;
    const listingData = req.body;
    const { title } = listingData;

    // A simple way to manage drafts: find an existing draft by the same user
    // You could also store a tempListingId on the front-end to identify the draft
    const existingDraft = await Listing.findOne({ agency, draft: true, listingstatus: false });

    if (existingDraft) {
      // If a draft exists, update it
      await Listing.findByIdAndUpdate(existingDraft._id, {
        ...listingData,
        agency,
        draft: true,
        listingstatus: false,
      });
      return res.status(200).json({ success: true, message: "Draft updated successfully." });
    } else {
      // Otherwise, create a new draft
      await Listing.create({
        ...listingData,
        agency,
        draft: true,
        listingstatus: false,
      });
      return res.status(201).json({ success: true, message: "New draft created." });
    }
  } catch (error) {
    console.error("Error in autosaveListingDraft:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addListing = async (req, res) => {
  try {
    const { _id } = req.user;
    const listingData = req.body;
    const { draft, listingstatus, ...restOfListingData } = listingData;

    if (!restOfListingData.images || restOfListingData.images.length === 0) {
      return res.json({ success: false, message: "At least one image is required" });
    }

    // Find if a draft exists and update it, or create a new one
    const existingDraft = await Listing.findOne({ agency: _id, draft: true, listingstatus: false });

    if (existingDraft) {
       // Update the draft to a final, active listing
      const updatedListing = await Listing.findByIdAndUpdate(existingDraft._id, {
        ...restOfListingData,
        agency: _id,
        draft: false, // It's no longer a draft
        listingstatus: true, // It's now an active listing
      }, { new: true });

      return res.status(200).json({ success: true, message: "Listing published successfully", listingId: updatedListing._id });
    } else {
       // If no draft exists, create a new active listing
       const newListing = await Listing.create({
         ...restOfListingData,
         agency: _id,
         draft: false,
         listingstatus: true
       });
       return res.status(201).json({ success: true, message: "Listing created successfully", listingId: newListing._id });
    }

  } catch (error) {
    console.error("Error in addListing:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// New endpoint for generating the authentication parameters
export const getAuthenticationParameters = (req, res) => {
  try {
    const authenticationParameters = imagekit.getAuthenticationParameters();
    res.status(200).json(authenticationParameters);
  } catch (error) {
    console.error("Error generating ImageKit authentication parameters:", error.message);
    res.status(500).json({ success: false, message: "Failed to get authentication parameters" });
  }
};


// API to Get Agent Listings
export const getOwnerListings = async (req, res)=>{
    try {
        const {_id} = req.user;
        const listings = await Listing.find({agency: _id });
        res.json({success: true, listings});
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}

// API to Toggle Car Availability
export const toggleCarAvailability = async (req, res) =>{
    try {
        const {_id} = req.user;
        const {carId} = req.body
        const car = await Car.findById(carId)

        // Checking is car belongs to the user
        if(car.owner.toString() !== _id.toString()){
            return res.json({ success: false, message: "Unauthorized" });
        }

        car.isAvaliable = !car.isAvaliable;
        await car.save()

        res.json({success: true, message: "Availability Toggled"})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// Api to delete a car
export const deleteCar = async (req, res) =>{
    try {
        const {_id} = req.user;
        const {carId} = req.body
        const car = await Car.findById(carId)

        // Checking is car belongs to the user
        if(car.owner.toString() !== _id.toString()){
            return res.json({ success: false, message: "Unauthorized" });
        }

        car.owner = null;
        car.isAvaliable = false;

        await car.save()

        res.json({success: true, message: "Car Removed"})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// API to get Dashboard Data
export const getDashboardData = async (req, res) =>{
    try {
        const { _id, role } = req.user;

        if(role !== 'owner'){
            return res.json({ success: false, message: "Unauthorized" });
        }

        const cars = await Car.find({owner: _id})
        const bookings = await Booking.find({ owner: _id }).populate('car').sort({ createdAt: -1 });

        const pendingBookings = await Booking.find({owner: _id, status: "pending" })
        const completedBookings = await Booking.find({owner: _id, status: "confirmed" })

        // Calculate monthlyRevenue from bookings where status is confirmed
        const monthlyRevenue = bookings.slice().filter(booking => booking.status === 'confirmed').reduce((acc, booking)=> acc + booking.price, 0)

        const dashboardData = {
            totalCars: cars.length,
            totalBookings: bookings.length,
            pendingBookings: pendingBookings.length,
            completedBookings: completedBookings.length,
            recentBookings: bookings.slice(0,3),
            monthlyRevenue
        }

        res.json({ success: true, dashboardData });

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// API to update user image

export const updateUserImage = async (req, res)=>{
    try {
        const { _id } = req.user;

        const imageFile = req.file;

        // Upload Image to ImageKit
        const fileBuffer = fs.readFileSync(imageFile.path)
        const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: '/users'
        })

        // optimization through imagekit URL transformation
        var optimizedImageUrl = imagekit.url({
            path : response.filePath,
            transformation : [
                {width: '400'}, // Width resizing
                {quality: 'auto'}, // Auto compression
                { format: 'webp' }  // Convert to modern format
            ]
        });

        const image = optimizedImageUrl;

        await User.findByIdAndUpdate(_id, {image});
        res.json({success: true, message: "Image Updated" })

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}   
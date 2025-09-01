import imagekit from "../configs/imageKit.js";
import Booking from "../models/Booking.js";
import Listing from "../models/Listing.js";
import User from "../models/User.js";
import fs from "fs";
import path from "path";

// API to Change Role of User
export const changeRoleToAgent = async (req, res)=>{
    try {
        const {_id} = req.user;
        await User.findByIdAndUpdate(_id, {role: "agent"})
        res.json({success: true, message: "Now you can list properties"})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// API to List Property
export const addListing = async (req, res) => {
    try {
        const { _id } = req.user;
        let listingData = JSON.parse(req.body.listingData);
        const imageFiles = req.files; // <-- multiple files now
        let uploadedImages = [];

        if (!imageFiles || imageFiles.length === 0) {
            return res.json({ success: false, message: "At least one image is required" });
        }

        for (const file of imageFiles) {
            const fileBuffer = fs.readFileSync(file.path);

            const response = await imagekit.upload({
                file: fileBuffer,
                fileName: file.originalname,
                folder: "/properties" // Changed folder name
            });

            // Create optimized URL
            const optimizedImageUrl = imagekit.url({
                path: response.filePath,
                transformation: [
                    { width: "1280" },
                    { quality: "auto" },
                    { format: "webp" }
                ]
            });
            uploadedImages.push(optimizedImageUrl);

            // Clean up the temporary file
            fs.unlinkSync(file.path);
        }

        // Get agent details from the user model or the request body
        // Assuming agent details are provided in the request body for simplicity.
        const { agentname, agentphone, agentwhatsapp } = listingData;
        const newListing = {
            ...listingData,
            agency: _id, // The owner/uploader of the listing
            images: uploadedImages,
            agentname: agentname,
            agentphone: agentphone,
            agentwhatsapp: agentwhatsapp,
        };

        // Save to DB
        await Listing.create(newListing);

        res.json({ success: true, message: "Property Listing Added Successfully" });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};


// API to Get Agent Listings
export const getAgentListings = async (req, res)=>{
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
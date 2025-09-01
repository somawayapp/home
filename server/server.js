import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import userRouter from "./routes/userRoutes.js";
import ownerRouter from "./routes/ownerRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import multer from "multer"; // Import multer

// Initialize Express App
const app = express()

// Connect Database
await connectDB()

// Middleware
app.use(cors());

// IMPORTANT: Do NOT use express.json() or express.urlencoded() for file upload routes.
// The file upload middleware (multer) handles the parsing for 'multipart/form-data'.
// The `listingData` JSON part of your payload will be in `req.body` after multer processes the request.
// However, it's good practice to have `express.json()` for other non-file-upload routes.
app.use(express.json()); // Keep this for other routes that use JSON
app.use(express.urlencoded({ extended: true }));


// Configure Multer for file uploads
const upload = multer({
    storage: multer.diskStorage({
        // You can customize the destination folder for uploaded files
        destination: (req, file, cb) => {
            cb(null, 'uploads/');
        },
        // And the file name
        filename: (req, file, cb) => {
            cb(null, Date.now() + '-' + file.originalname);
        },
    }),
    // Here you set the file size limit
    limits: {
        fileSize: 20 * 1024 * 1024, // Set the limit to 20MB (20 * 1024 * 1024 bytes)
    },
});


app.get('/', (req, res)=> res.send("Server is running"))

// Route Handlers
// Pass the multer middleware to the owner route for add-listing
app.use('/api/user', userRouter)
app.use('/api/owner', ownerRouter)
app.use('/api/bookings', bookingRouter)


const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`))
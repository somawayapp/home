import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import userRouter from "./routes/userRoutes.js";
import ownerRouter from "./routes/ownerRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import multer from "multer";

// Initialize Express App
const app = express()

// Connect Database
await connectDB()

// --- CORS Configuration ---
// Configure CORS to allow a specific origin.
// Change 'https://houseclient.vercel.app' to your client's actual domain.
const allowedOrigins = [
  'https://houseclient.vercel.app',
  'https://homeclient.vercel.app',
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // allow
    } else {
      callback(new Error('Not allowed by CORS')); // block
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};


app.use(cors(corsOptions));
//
// -------------------------

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Configure Multer for file uploads with memory storage
const upload = multer({
    storage: multer.memoryStorage(), // Correct for Vercel: stores files in memory
    limits: {
        fileSize: 20 * 1024 * 1024, // 20MB limit, adjust as needed
    },
});


app.get('/', (req, res)=> res.send("Server is running"))

// Route Handlers
// The multer middleware should be applied directly in your route file (e.g., ownerRoutes.js)
// using the 'upload' instance exported from a dedicated middleware file.
// app.use('/api/owner', upload.array('images'), ownerRouter)
// It is recommended to apply multer on a per-route basis for clarity.

app.use('/api/user', userRouter)
app.use('/api/owner', ownerRouter)
app.use('/api/bookings', bookingRouter)


const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`))
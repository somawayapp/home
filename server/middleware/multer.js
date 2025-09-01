// server/middleware/multer.js

import multer from "multer";
import path from "path";

// No need for fs to create an 'uploads' directory,
// as files will be handled in memory.

const upload = multer({
    // Use memoryStorage instead of diskStorage
    storage: multer.memoryStorage(),
    // Set limits for file uploads to prevent DoS attacks
    limits: {
        fileSize: 20 * 1024 * 1024, // 20 MB in bytes (Vercel Pro limit is 50MB)
    },
    // Optional: Filter file types
    fileFilter: (req, file, cb) => {
        const allowedFileTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedFileTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error("Error: Only images are allowed!"));
        }
    },
});

export default upload;
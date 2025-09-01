import multer from "multer";
import path from "path";
import fs from "fs";

// Define a directory for temporary file storage
const tempUploadDir = 'uploads';

// Check if the uploads directory exists, if not, create it
if (!fs.existsSync(tempUploadDir)) {
  fs.mkdirSync(tempUploadDir);
}

// Configure multer to use disk storage
const storage = multer.diskStorage({
    // Set the destination for uploaded files
    destination: (req, file, cb) => {
        cb(null, tempUploadDir);
    },
    // Set the filename for uploaded files to prevent conflicts
    filename: (req, file, cb) => {
        // Use a unique name to avoid overwriting files with the same name.
        // `Date.now()` is a simple way to add uniqueness.
        // `path.extname` gets the original file extension.
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

// Configure the main multer upload middleware
const upload = multer({
    storage: storage,
    // Set limits for file uploads to prevent DoS attacks and handle file size errors gracefully
    limits: {
        fileSize: 20 * 1024 * 1024, // 20 MB in bytes (adjust as needed, Vercel Pro limit is 50MB)
    },
    // Optional: Filter file types to only allow images
    fileFilter: (req, file, cb) => {
        const allowedFileTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedFileTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error("Error: Only images (jpeg, jpg, png, gif, webp) are allowed!"));
        }
    },
});

export default upload;
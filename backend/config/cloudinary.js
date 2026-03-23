const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// In-memory storage — buffers are streamed to Cloudinary in the controller
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/**
 * Upload a single buffer to Cloudinary via upload_stream.
 * Returns a Promise that resolves to the Cloudinary result (including secure_url).
 */
function uploadToCloudinary(fileBuffer, folder = 'angeles-eats-roots/vendors') {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
                transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        stream.end(fileBuffer);
    });
}

module.exports = { upload, uploadToCloudinary, cloudinary };

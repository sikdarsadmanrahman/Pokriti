import multer from 'multer';
import ApiError from '../utils/ApiError.js';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

/** Files are buffered in memory and streamed straight to Cloudinary (nothing touches disk). */
export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, cb) =>
    ALLOWED.includes(file.mimetype)
      ? cb(null, true)
      : cb(new ApiError(400, 'Only JPEG, PNG, WebP or AVIF images are allowed')),
});

import cloudinary, { CLOUDINARY_FOLDER, deleteImages } from '../config/cloudinary.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function uploadBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: CLOUDINARY_FOLDER,
        resource_type: 'image',
        format: 'webp', // stored + delivered as WebP
        transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
      },
      (err, result) =>
        err
          ? reject(err)
          : resolve({ url: result.secure_url, publicId: result.public_id, width: result.width, height: result.height })
    );
    stream.end(buffer);
  });
}

/** POST /api/admin/uploads/images  (multipart, field name "images", up to 5 files) */
export const uploadImages = asyncHandler(async (req, res) => {
  if (!req.files?.length) throw new ApiError(400, 'No image files provided');
  const data = await Promise.all(req.files.map((f) => uploadBuffer(f.buffer)));
  res.status(201).json({ success: true, data });
});

export const removeImage = asyncHandler(async (req, res) => {
  await deleteImages([req.body.publicId]);
  res.json({ success: true, message: 'Image deleted' });
});

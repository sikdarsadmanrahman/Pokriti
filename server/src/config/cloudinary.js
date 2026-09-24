import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || 'organic-store';

/** Best-effort removal of assets no longer referenced by any document. */
export async function deleteImages(publicIds = []) {
  const ids = publicIds.filter(Boolean);
  if (!ids.length) return;
  await cloudinary.api.delete_resources(ids);
}

export default cloudinary;

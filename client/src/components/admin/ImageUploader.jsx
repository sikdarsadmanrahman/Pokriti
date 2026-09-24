import { useRef, useState } from 'react';
import { Loader2, Trash2, Upload } from 'lucide-react';
import { useUploadImagesMutation } from '../../api/adminApi.js';
import { useToast } from '../common/ToastContext.jsx';

/** Uploads files straight to Cloudinary via the backend, returns { url, publicId } added to the form. */
export default function ImageUploader({ images, onChange, max = 8 }) {
  const inputRef = useRef();
  const [uploadImages, { isLoading }] = useUploadImagesMutation();
  const toast = useToast();
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = async (files) => {
    if (!files?.length) return;
    const remaining = max - images.length;
    if (remaining <= 0) return toast?.error(`You can add up to ${max} images`);

    const formData = new FormData();
    Array.from(files).slice(0, remaining).forEach((f) => formData.append('images', f));
    try {
      const uploaded = await uploadImages(formData).unwrap();
      onChange([...images, ...uploaded]);
    } catch (err) {
      toast?.error(err?.message || 'Image upload failed');
    }
  };

  const removeAt = (i) => onChange(images.filter((_, idx) => idx !== i));

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition ${
          dragOver ? 'border-brand-500 bg-brand-50' : 'border-stone-300 hover:border-brand-300'
        }`}
      >
        {isLoading ? <Loader2 className="animate-spin text-brand-600" size={24} /> : <Upload size={24} className="text-stone-400" />}
        <p className="mt-2 text-sm text-stone-500">Click or drag images here (JPEG/PNG/WebP, max 5MB each) — stored as WebP</p>
        <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
      </div>

      {images.length > 0 && (
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
          {images.map((img, i) => (
            <div key={img.publicId || img.url} className="group relative aspect-square overflow-hidden rounded-lg bg-stone-100">
              <img src={img.url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

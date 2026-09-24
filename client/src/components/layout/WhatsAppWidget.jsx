import { MessageCircle, Phone, X } from 'lucide-react';
import { useState } from 'react';
import { useGetConfigQuery } from '../../api/publicApi.js';

/** Floating support widget: expands to WhatsApp + Call, sticky above the flash-sale bar on mobile. */
export default function WhatsAppWidget() {
  const { data: config } = useGetConfigQuery();
  const [open, setOpen] = useState(false);
  const whatsapp = config?.support?.whatsapp;
  const phone = config?.support?.phone;
  if (!whatsapp && !phone) return null;

  return (
    <div className="fixed bottom-5 right-4 z-40 flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
      {open && (
        <div className="animate-fade-in flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-black/5">
          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
            >
              <MessageCircle size={18} /> WhatsApp us
            </a>
          )}
          {phone && (
            <a href={`tel:${phone}`} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50">
              <Phone size={18} /> Call {phone}
            </a>
          )}
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Contact support"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-lg transition hover:bg-green-700 active:scale-95"
      >
        {open ? <X size={24} /> : <MessageCircle size={26} />}
      </button>
    </div>
  );
}

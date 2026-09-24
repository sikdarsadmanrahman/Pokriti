import { BadgeCheck, Download, FileCheck2, Leaf, MapPin, ShieldCheck } from 'lucide-react';

/** Certifications the brand wants to showcase; wire `fileUrl` up to real Cloudinary/S3 PDF links. */
const CERTIFICATIONS = [
  { title: 'BSTI Certification', desc: 'Bangladesh Standards and Testing Institution approval for food safety.', icon: BadgeCheck, fileUrl: '#' },
  { title: 'Lab Purity Report', desc: 'Independent lab test confirming no added sugar or adulteration in our honey.', icon: FileCheck2, fileUrl: '#' },
  { title: 'Organic Sourcing Certificate', desc: 'Verification of organic farming practices from our partner farms.', icon: Leaf, fileUrl: '#' },
];

export default function TrustPage() {
  return (
    <div className="container-x py-12">
      <div className="mx-auto max-w-2xl text-center">
        <span className="badge bg-brand-100 text-brand-700">
          <ShieldCheck size={14} /> Quality & Trust
        </span>
        <h1 className="mt-3 font-display text-3xl font-bold text-stone-900">Purity You Can Verify</h1>
        <p className="mt-3 text-stone-600">
          We test every batch and keep our sourcing transparent — download our certifications and lab reports below.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {CERTIFICATIONS.map((c) => (
          <div key={c.title} className="card flex flex-col items-center p-6 text-center">
            <c.icon size={36} className="mb-3 text-brand-600" />
            <h3 className="font-semibold text-stone-900">{c.title}</h3>
            <p className="mt-1 text-sm text-stone-500">{c.desc}</p>
            <a href={c.fileUrl} target="_blank" rel="noreferrer" className="btn-secondary mt-4">
              <Download size={16} /> Download Report
            </a>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-14 max-w-3xl rounded-2xl bg-brand-50 p-8">
        <div className="flex items-center gap-2 text-brand-800">
          <MapPin size={20} />
          <h2 className="font-display text-xl font-bold">Our Sourcing Story</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-brand-700">
          Our honey comes straight from beekeepers in the Sundarbans mangrove forests, our ghee is churned from milk sourced from
          local dairy farms, and our nuts and organic sugar are selected from growers who follow chemical-free practices. Every
          product moves from farm to package with minimal processing, so what reaches your table is as close to nature as possible.
        </p>
      </div>
    </div>
  );
}

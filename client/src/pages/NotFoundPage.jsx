import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="container-x flex flex-col items-center py-24 text-center">
      <p className="font-display text-6xl font-extrabold text-brand-200">404</p>
      <h1 className="mt-2 text-xl font-bold text-stone-900">Page not found</h1>
      <p className="mt-2 text-stone-500">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary mt-6">Back to Home</Link>
    </div>
  );
}

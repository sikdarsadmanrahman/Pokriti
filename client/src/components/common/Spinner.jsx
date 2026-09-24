export default function Spinner({ className = '' }) {
  return (
    <div
      className={`h-5 w-5 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600 ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

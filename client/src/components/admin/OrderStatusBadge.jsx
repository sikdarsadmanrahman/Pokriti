const STYLES = {
  Pending: 'bg-stone-100 text-stone-700',
  Processing: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-honey-100 text-honey-700',
  Delivered: 'bg-brand-100 text-brand-700',
  Cancelled: 'bg-red-100 text-red-700',
};

export default function OrderStatusBadge({ status }) {
  return <span className={`badge ${STYLES[status] || 'bg-stone-100 text-stone-700'}`}>{status}</span>;
}

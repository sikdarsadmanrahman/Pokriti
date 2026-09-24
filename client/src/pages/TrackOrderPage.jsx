import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, Circle, PackageSearch } from 'lucide-react';
import { useTrackOrderMutation } from '../api/publicApi.js';
import { useToast } from '../components/common/ToastContext.jsx';
import { formatBDT } from '../utils/format.js';

const PIPELINE = ['Pending', 'Processing', 'Shipped', 'Delivered'];

export default function TrackOrderPage() {
  const [params] = useSearchParams();
  const [orderId, setOrderId] = useState(params.get('orderId') || '');
  const [phone, setPhone] = useState('');
  const [track, { data: order, isLoading }] = useTrackOrderMutation();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await track({ orderId, phone }).unwrap();
    } catch (err) {
      toast?.error(err?.message || 'Order not found');
    }
  };

  const currentStep = order && PIPELINE.indexOf(order.status);

  return (
    <div className="container-x max-w-lg py-12">
      <h1 className="mb-6 font-display text-3xl font-bold text-stone-900">Track Your Order</h1>
      <form onSubmit={handleSubmit} className="card space-y-4 p-5">
        <div>
          <label className="label">Order ID</label>
          <input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="ORD-260924-0001" className="input font-mono" />
        </div>
        <div>
          <label className="label">Phone Number</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" className="input" inputMode="tel" />
        </div>
        <button type="submit" disabled={isLoading} className="btn-primary w-full">
          {isLoading ? 'Searching…' : 'Track Order'}
        </button>
      </form>

      {order && (
        <div className="card mt-6 p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-mono font-bold text-stone-900">{order.orderId}</span>
            {order.status === 'Cancelled' ? (
              <span className="badge bg-red-100 text-red-700">Cancelled</span>
            ) : (
              <span className="badge bg-brand-100 text-brand-700">{order.status}</span>
            )}
          </div>

          {order.status !== 'Cancelled' && (
            <div className="mb-6 flex items-center justify-between">
              {PIPELINE.map((step, i) => (
                <div key={step} className="flex flex-1 flex-col items-center">
                  <div className="flex w-full items-center">
                    {i > 0 && <div className={`h-0.5 flex-1 ${i <= currentStep ? 'bg-brand-600' : 'bg-stone-200'}`} />}
                    {i <= currentStep ? (
                      <CheckCircle2 size={22} className="shrink-0 text-brand-600" />
                    ) : (
                      <Circle size={22} className="shrink-0 text-stone-300" />
                    )}
                    {i < PIPELINE.length - 1 && <div className={`h-0.5 flex-1 ${i < currentStep ? 'bg-brand-600' : 'bg-stone-200'}`} />}
                  </div>
                  <span className="mt-1 text-[11px] text-stone-500">{step}</span>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2 border-t border-stone-100 pt-4 text-sm">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-stone-600">
                <span>{item.name} ({item.variantLabel}) × {item.quantity}</span>
                <span>{formatBDT(item.lineTotal)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-stone-100 pt-2 font-bold text-stone-900">
              <span>Total</span>
              <span>{formatBDT(order.total)}</span>
            </div>
          </div>
        </div>
      )}

      {!order && (
        <div className="mt-8 flex flex-col items-center text-center text-stone-400">
          <PackageSearch size={40} />
          <p className="mt-2 text-sm">Enter your Order ID and phone number to see live status.</p>
        </div>
      )}
    </div>
  );
}

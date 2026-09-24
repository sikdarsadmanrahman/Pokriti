import { Link, useLocation, useParams } from 'react-router-dom';
import { CheckCircle2, Copy } from 'lucide-react';
import { useToast } from '../components/common/ToastContext.jsx';
import { formatBDT } from '../utils/format.js';

export default function OrderSuccessPage() {
  const { orderId } = useParams();
  const { state } = useLocation();
  const toast = useToast();
  const order = state?.order;

  const copyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(orderId);
      toast?.success('Order ID copied');
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="container-x flex flex-col items-center py-16 text-center">
      <CheckCircle2 size={64} className="mb-4 text-brand-600" />
      <h1 className="font-display text-3xl font-bold text-stone-900">Order Placed!</h1>
      <p className="mt-2 max-w-md text-stone-600">
        {order?.payment?.method === 'cod'
          ? "Thanks — we've received your order and will contact you shortly to confirm delivery."
          : "Thanks — we've received your order. We'll verify your payment and confirm shortly."}
      </p>

      <div className="mt-6 flex items-center gap-2 rounded-xl bg-brand-50 px-5 py-3">
        <span className="font-mono text-lg font-bold text-brand-800">{orderId}</span>
        <button onClick={copyOrderId} aria-label="Copy order ID"><Copy size={16} className="text-brand-600" /></button>
      </div>

      {order && (
        <div className="mt-6 w-full max-w-sm space-y-1 rounded-xl border border-stone-200 p-4 text-sm">
          <div className="flex justify-between"><span className="text-stone-500">Subtotal</span><span>{formatBDT(order.subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-stone-500">Shipping</span><span>{formatBDT(order.shippingCost)}</span></div>
          <div className="flex justify-between font-bold"><span>Total</span><span>{formatBDT(order.total)}</span></div>
        </div>
      )}

      <p className="mt-6 text-sm text-stone-500">Keep your Order ID and phone number handy to track your order anytime.</p>
      <div className="mt-4 flex gap-3">
        <Link to={`/track-order?orderId=${orderId}`} className="btn-secondary">Track This Order</Link>
        <Link to="/shop" className="btn-primary">Continue Shopping</Link>
      </div>
    </div>
  );
}

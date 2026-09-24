import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Printer } from 'lucide-react';
import {
  useAdminGetOrderQuery, useUpdateOrderStatusMutation, useUpdatePaymentStatusMutation, useLazyGetInvoiceQuery,
} from '../../api/adminApi.js';
import { useToast } from '../../components/common/ToastContext.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import OrderStatusBadge from '../../components/admin/OrderStatusBadge.jsx';
import InvoiceView from '../../components/admin/InvoiceView.jsx';
import { formatBDT } from '../../utils/format.js';

const TRANSITIONS = {
  Pending: ['Processing', 'Cancelled'],
  Processing: ['Shipped', 'Cancelled'],
  Shipped: ['Delivered', 'Cancelled'],
  Delivered: [],
  Cancelled: [],
};

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: order, isLoading } = useAdminGetOrderQuery(id);
  const [updateStatus, { isLoading: updatingStatus }] = useUpdateOrderStatusMutation();
  const [updatePayment] = useUpdatePaymentStatusMutation();
  const [fetchInvoice, { data: invoice }] = useLazyGetInvoiceQuery();
  const [showInvoice, setShowInvoice] = useState(false);

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!order) return <p className="text-stone-500">Order not found.</p>;

  const moveTo = async (status) => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast?.success(`Order marked as ${status}`);
    } catch (err) {
      toast?.error(err?.message);
    }
  };

  const verifyPayment = async (status) => {
    try {
      await updatePayment({ id, status }).unwrap();
      toast?.success(`Payment marked ${status.replace('_', ' ')}`);
    } catch (err) {
      toast?.error(err?.message);
    }
  };

  const openInvoice = async () => {
    await fetchInvoice(id);
    setShowInvoice(true);
  };

  return (
    <div>
      <button onClick={() => navigate('/admin/orders')} className="mb-4 flex items-center gap-1 text-sm text-stone-500 hover:text-brand-700">
        <ChevronLeft size={16} /> Back to Orders
      </button>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-mono text-2xl font-bold text-stone-900">{order.orderId}</h1>
          <p className="text-sm text-stone-500">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <button onClick={openInvoice} className="btn-outline"><Printer size={16} /> Invoice</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card p-5">
            <h2 className="mb-3 font-semibold text-stone-900">Items</h2>
            <div className="divide-y divide-stone-50">
              {order.items.map((it, i) => (
                <div key={i} className="flex items-center gap-3 py-3">
                  <img src={it.image} alt="" className="h-12 w-12 rounded-lg bg-stone-100 object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-stone-900">{it.name}</p>
                    <p className="text-xs text-stone-500">{it.variantLabel} × {it.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold">{formatBDT(it.lineTotal)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-1 border-t border-stone-100 pt-3 text-sm">
              <div className="flex justify-between text-stone-500"><span>Subtotal</span><span>{formatBDT(order.subtotal)}</span></div>
              <div className="flex justify-between text-stone-500"><span>Shipping</span><span>{formatBDT(order.shippingCost)}</span></div>
              <div className="flex justify-between text-base font-bold text-stone-900"><span>Total</span><span>{formatBDT(order.total)}</span></div>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="mb-3 font-semibold text-stone-900">Status History</h2>
            <ul className="space-y-2 text-sm">
              {order.statusHistory?.map((h, i) => (
                <li key={i} className="flex items-center justify-between text-stone-600">
                  <span>{h.status}{h.note && ` — ${h.note}`}</span>
                  <span className="text-xs text-stone-400">{new Date(h.changedAt).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h2 className="mb-3 font-semibold text-stone-900">Customer</h2>
            <p className="text-sm font-medium text-stone-900">{order.customerSnapshot.name}</p>
            <p className="text-sm text-stone-600">{order.customerSnapshot.phone}</p>
            {order.customerSnapshot.email && <p className="text-sm text-stone-600">{order.customerSnapshot.email}</p>}
            <div className="mt-3 border-t border-stone-100 pt-3 text-sm text-stone-600">
              <p>{order.shipping.fullAddress}</p>
              <p>{order.shipping.area} {order.shipping.district}</p>
              <p className="mt-1 capitalize text-stone-500">{order.shipping.zone.replace('_', ' ')}</p>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="mb-3 font-semibold text-stone-900">Payment</h2>
            <p className="text-sm uppercase text-stone-700">{order.payment.method}</p>
            {order.payment.senderNumber && <p className="text-sm text-stone-600">From: {order.payment.senderNumber}</p>}
            {order.payment.trxId && <p className="font-mono text-sm text-stone-600">TrxID: {order.payment.trxId}</p>}
            <p className="mt-1 text-sm capitalize text-stone-500">Status: {order.payment.status.replace('_', ' ')}</p>
            {order.payment.status === 'pending_verification' && (
              <div className="mt-3 flex gap-2">
                <button onClick={() => verifyPayment('paid')} className="btn-primary flex-1 !py-1.5 text-xs">Mark Paid</button>
                <button onClick={() => verifyPayment('failed')} className="btn-outline flex-1 !py-1.5 text-xs text-red-600">Mark Failed</button>
              </div>
            )}
          </div>

          <div className="card p-5">
            <h2 className="mb-3 font-semibold text-stone-900">Update Status</h2>
            {TRANSITIONS[order.status]?.length ? (
              <div className="flex flex-col gap-2">
                {TRANSITIONS[order.status].map((s) => (
                  <button key={s} disabled={updatingStatus} onClick={() => moveTo(s)} className={s === 'Cancelled' ? 'btn-outline text-red-600' : 'btn-primary'}>
                    Move to {s}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-stone-400">This order is in a final state.</p>
            )}
          </div>
        </div>
      </div>

      {showInvoice && invoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4 print:static print:bg-white print:p-0">
          <div className="mx-auto my-8 max-w-xl print:my-0">
            <div className="mb-3 flex justify-end gap-2 print:hidden">
              <button onClick={() => window.print()} className="btn-primary"><Printer size={16} /> Print</button>
              <button onClick={() => setShowInvoice(false)} className="btn-outline">Close</button>
            </div>
            <div className="rounded-2xl bg-white shadow-xl print:rounded-none print:shadow-none">
              <InvoiceView invoice={invoice} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

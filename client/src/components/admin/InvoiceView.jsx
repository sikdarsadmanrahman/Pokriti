import { formatBDT } from '../../utils/format.js';

/** Print-optimised layout — used both on-screen and for the browser's Print to PDF. */
export default function InvoiceView({ invoice }) {
  if (!invoice) return null;
  return (
    <div className="mx-auto max-w-xl bg-white p-8 text-sm text-stone-800 print:p-0" id="invoice-print-area">
      <div className="mb-6 flex items-start justify-between border-b border-stone-200 pb-4">
        <div>
          <h1 className="font-display text-xl font-bold text-brand-800">{invoice.brand.name}</h1>
          {invoice.brand.address && <p className="text-xs text-stone-500">{invoice.brand.address}</p>}
          {invoice.brand.phone && <p className="text-xs text-stone-500">{invoice.brand.phone}</p>}
        </div>
        <div className="text-right">
          <p className="font-mono text-lg font-bold">{invoice.invoiceNo}</p>
          <p className="text-xs text-stone-500">{new Date(invoice.date).toLocaleString()}</p>
          <p className="mt-1 text-xs font-semibold uppercase text-brand-700">{invoice.status}</p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-6">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase text-stone-400">Ship To</p>
          <p className="font-medium">{invoice.customer.name}</p>
          <p>{invoice.customer.phone}</p>
          <p className="mt-1 text-stone-600">{invoice.shipping.fullAddress}</p>
          {invoice.shipping.area && <p className="text-stone-600">{invoice.shipping.area}</p>}
          {invoice.shipping.district && <p className="text-stone-600">{invoice.shipping.district}</p>}
        </div>
        <div className="text-right">
          <p className="mb-1 text-xs font-semibold uppercase text-stone-400">Payment</p>
          <p className="uppercase">{invoice.payment.method}</p>
          {invoice.payment.trxId && <p className="text-xs text-stone-500">TrxID: {invoice.payment.trxId}</p>}
          <p className="text-xs capitalize text-stone-500">{invoice.payment.status?.replace('_', ' ')}</p>
        </div>
      </div>

      <table className="mb-4 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-stone-200 text-xs uppercase text-stone-400">
            <th className="py-2">Item</th>
            <th className="py-2 text-center">Qty</th>
            <th className="py-2 text-right">Price</th>
            <th className="py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((it, i) => (
            <tr key={i} className="border-b border-stone-100">
              <td className="py-2">{it.name} <span className="text-stone-400">({it.variantLabel})</span></td>
              <td className="py-2 text-center">{it.quantity}</td>
              <td className="py-2 text-right">{formatBDT(it.unitPrice)}</td>
              <td className="py-2 text-right">{formatBDT(it.lineTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="ml-auto max-w-[240px] space-y-1 text-sm">
        <div className="flex justify-between"><span className="text-stone-500">Subtotal</span><span>{formatBDT(invoice.subtotal)}</span></div>
        <div className="flex justify-between"><span className="text-stone-500">Shipping</span><span>{formatBDT(invoice.shippingCost)}</span></div>
        {invoice.discount > 0 && <div className="flex justify-between"><span className="text-stone-500">Discount</span><span>-{formatBDT(invoice.discount)}</span></div>}
        <div className="flex justify-between border-t border-stone-200 pt-1 text-base font-bold"><span>Total</span><span>{formatBDT(invoice.total)}</span></div>
        {invoice.codAmount > 0 && (
          <div className="mt-2 rounded-lg bg-honey-50 px-3 py-2 text-right font-bold text-honey-800">
            Collect on Delivery: {formatBDT(invoice.codAmount)}
          </div>
        )}
      </div>

      {invoice.note && (
        <div className="mt-4 border-t border-stone-100 pt-3 text-xs text-stone-500">Note: {invoice.note}</div>
      )}
    </div>
  );
}

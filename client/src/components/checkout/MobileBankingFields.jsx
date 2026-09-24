import { Copy } from 'lucide-react';
import { useToast } from '../common/ToastContext.jsx';

/** Shown when the customer picks bKash/Nagad/Rocket: our merchant number + fields for their Sender Number and TrxID. */
export default function MobileBankingFields({ method, merchantNumber, senderNumber, trxId, onChange, errors }) {
  const toast = useToast();
  const label = { bkash: 'bKash', nagad: 'Nagad', rocket: 'Rocket' }[method] || method;

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(merchantNumber || '');
      toast?.success('Merchant number copied');
    } catch {
      /* clipboard unavailable — number is still selectable/visible on screen */
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-honey-200 bg-honey-50 p-4">
      <p className="text-sm text-stone-700">
        Send <span className="font-semibold">Money/Payment</span> via {label} to:
      </p>
      <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
        <span className="font-mono text-base font-bold text-stone-900">{merchantNumber || '—'}</span>
        <button type="button" onClick={copyNumber} className="flex items-center gap-1 text-xs font-semibold text-brand-700">
          <Copy size={14} /> Copy
        </button>
      </div>

      <div>
        <label className="label">Your {label} Number (the one you sent from)</label>
        <input
          value={senderNumber}
          onChange={(e) => onChange('senderNumber', e.target.value)}
          placeholder="01XXXXXXXXX"
          className="input"
          inputMode="tel"
        />
        {errors?.senderNumber && <p className="mt-1 text-xs text-red-600">{errors.senderNumber}</p>}
      </div>
      <div>
        <label className="label">Transaction ID (TrxID)</label>
        <input value={trxId} onChange={(e) => onChange('trxId', e.target.value.toUpperCase())} placeholder="e.g. 8N7A6D5E4F" className="input font-mono" />
        {errors?.trxId && <p className="mt-1 text-xs text-red-600">{errors.trxId}</p>}
      </div>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingBag } from 'lucide-react';
import { selectCartItems, selectCartSubtotal, clearCart } from '../app/cartSlice.js';
import { useGetConfigQuery, usePlaceOrderMutation } from '../api/publicApi.js';
import { useToast } from '../components/common/ToastContext.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ShippingZoneSelect from '../components/checkout/ShippingZoneSelect.jsx';
import PaymentMethodSelect from '../components/checkout/PaymentMethodSelect.jsx';
import MobileBankingFields from '../components/checkout/MobileBankingFields.jsx';
import OrderSummary from '../components/checkout/OrderSummary.jsx';

const MOBILE_BANKING = ['bkash', 'nagad', 'rocket'];

export default function CheckoutPage() {
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: config } = useGetConfigQuery();
  const [placeOrder, { isLoading }] = usePlaceOrderMutation();

  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    fullAddress: '', district: '', area: '', zone: 'inside_dhaka',
    paymentMethod: 'cod', senderNumber: '', trxId: '', note: '',
  });
  const [errors, setErrors] = useState({});
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const shippingCost = config?.shippingRates?.[form.zone] ?? (form.zone === 'inside_dhaka' ? 60 : 120);
  const total = subtotal + shippingCost;
  const isMobileBanking = MOBILE_BANKING.includes(form.paymentMethod);
  const merchantNumber = useMemo(
    () => config?.paymentMethods?.find((m) => m.id === form.paymentMethod)?.merchantNumber,
    [config, form.paymentMethod]
  );

  if (items.length === 0) {
    return (
      <div className="container-x py-16">
        <EmptyState icon={ShoppingBag} title="Your cart is empty" description="Add some products before checking out." action={<Link to="/shop" className="btn-primary">Go to Shop</Link>} />
      </div>
    );
  }

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Enter your full name';
    if (!/^01[3-9]\d{8}$/.test(form.phone.replace(/\D/g, '').replace(/^880/, '0'))) e.phone = 'Enter a valid Bangladeshi mobile number';
    if (form.fullAddress.trim().length < 10) e.fullAddress = 'Please enter your full delivery address';
    if (isMobileBanking) {
      if (!/^01[3-9]\d{8}$/.test(form.senderNumber.replace(/\D/g, '').replace(/^880/, '0'))) e.senderNumber = 'Enter the number you paid from';
      if (!/^[A-Za-z0-9]{6,20}$/.test(form.trxId)) e.trxId = 'Enter a valid Transaction ID';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    try {
      const res = await placeOrder({
        customer: { name: form.name, phone: form.phone, email: form.email || undefined },
        shipping: { fullAddress: form.fullAddress, district: form.district, area: form.area, zone: form.zone },
        items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
        payment: {
          method: form.paymentMethod,
          ...(isMobileBanking && { senderNumber: form.senderNumber, trxId: form.trxId }),
        },
        note: form.note || undefined,
      }).unwrap();

      dispatch(clearCart());
      navigate(`/order-success/${res.orderId}`, { state: { order: res, phone: form.phone } });
    } catch (err) {
      toast?.error(err?.message || 'Could not place your order. Please try again.');
    }
  };

  return (
    <div className="container-x py-8">
      <h1 className="mb-6 font-display text-3xl font-bold text-stone-900">Checkout</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="mb-4 font-semibold text-stone-900">Contact & Delivery Details</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Full Name</label>
                <input value={form.name} onChange={(e) => set('name', e.target.value)} className="input" />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="01XXXXXXXXX" className="input" inputMode="tel" />
                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="label">Email (optional)</label>
                <input value={form.email} onChange={(e) => set('email', e.target.value)} type="email" className="input" />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Full Address</label>
                <textarea value={form.fullAddress} onChange={(e) => set('fullAddress', e.target.value)} rows={2} className="input" />
                {errors.fullAddress && <p className="mt-1 text-xs text-red-600">{errors.fullAddress}</p>}
              </div>
              <div>
                <label className="label">Area / Thana (optional)</label>
                <input value={form.area} onChange={(e) => set('area', e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">District (optional)</label>
                <input value={form.district} onChange={(e) => set('district', e.target.value)} className="input" />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Order Note (optional)</label>
                <input value={form.note} onChange={(e) => set('note', e.target.value)} placeholder="e.g. call before delivery" className="input" />
              </div>
            </div>
          </section>

          <section className="card p-5">
            <h2 className="mb-4 font-semibold text-stone-900">Delivery Zone</h2>
            <ShippingZoneSelect rates={config?.shippingRates} value={form.zone} onChange={(z) => set('zone', z)} />
          </section>

          <section className="card p-5">
            <h2 className="mb-4 font-semibold text-stone-900">Payment Method</h2>
            <PaymentMethodSelect methods={config?.paymentMethods} value={form.paymentMethod} onChange={(m) => set('paymentMethod', m)} />
            {isMobileBanking && (
              <div className="mt-4">
                <MobileBankingFields
                  method={form.paymentMethod}
                  merchantNumber={merchantNumber}
                  senderNumber={form.senderNumber}
                  trxId={form.trxId}
                  onChange={set}
                  errors={errors}
                />
              </div>
            )}
          </section>
        </div>

        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <OrderSummary items={items} subtotal={subtotal} shippingCost={shippingCost} total={total} />
          <button type="submit" disabled={isLoading} className="btn-primary w-full">
            {isLoading ? 'Placing Order…' : `Place Order — ${new Intl.NumberFormat('en-BD').format(total)} ৳`}
          </button>
        </div>
      </form>
    </div>
  );
}

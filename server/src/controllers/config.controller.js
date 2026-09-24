import { SHIPPING_RATES } from '../config/constants.js';

/** Public storefront config: shipping rates, payment options + merchant numbers, support contacts. */
export const getPublicConfig = (req, res) => {
  res.set('Cache-Control', 'public, max-age=300');
  res.json({
    success: true,
    data: {
      brandName: process.env.BRAND_NAME || 'Gram Rosh',
      currency: 'BDT',
      shippingRates: SHIPPING_RATES,
      paymentMethods: [
        { id: 'cod', label: 'Cash on Delivery', requiresTrxId: false },
        { id: 'bkash', label: 'bKash', merchantNumber: process.env.BKASH_NUMBER, requiresTrxId: true },
        { id: 'nagad', label: 'Nagad', merchantNumber: process.env.NAGAD_NUMBER, requiresTrxId: true },
        { id: 'rocket', label: 'Rocket', merchantNumber: process.env.ROCKET_NUMBER, requiresTrxId: true },
      ],
      support: { phone: process.env.SUPPORT_PHONE, whatsapp: process.env.SUPPORT_WHATSAPP },
    },
  });
};

/** Single source of truth for business rules. Shipping is ALWAYS computed server-side. */
export const SHIPPING_ZONES = ['inside_dhaka', 'outside_dhaka'];
export const SHIPPING_RATES = { inside_dhaka: 60, outside_dhaka: 120 }; // BDT

export const ORDER_STATUS = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

/** Forward-only pipeline. Cancelled/Delivered are terminal. */
export const ORDER_TRANSITIONS = {
  Pending: ['Processing', 'Cancelled'],
  Processing: ['Shipped', 'Cancelled'],
  Shipped: ['Delivered', 'Cancelled'],
  Delivered: [],
  Cancelled: [],
};

export const PAYMENT_METHODS = ['cod', 'bkash', 'nagad', 'rocket'];
export const MOBILE_BANKING = ['bkash', 'nagad', 'rocket'];
export const PAYMENT_STATUS = ['unpaid', 'pending_verification', 'paid', 'failed'];

export const PRODUCT_STATUS = ['active', 'archived'];

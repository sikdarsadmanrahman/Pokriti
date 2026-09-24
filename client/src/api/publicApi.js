import { apiSlice } from './apiSlice.js';

/** Storefront endpoints — no auth. */
export const publicApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getConfig: builder.query({ query: () => '/config' }),
    getCategories: builder.query({ query: () => '/categories', providesTags: ['Category'] }),

    getProducts: builder.query({
      query: (params = {}) => ({ url: '/products', params }),
      providesTags: (result) =>
        result ? [...result.map((p) => ({ type: 'Product', id: p._id })), { type: 'Product', id: 'LIST' }] : [{ type: 'Product', id: 'LIST' }],
    }),
    getFlashSale: builder.query({ query: () => '/products/flash-sale' }),
    getProductBySlug: builder.query({
      query: (slug) => `/products/${slug}`,
      providesTags: (r, e, slug) => [{ type: 'Product', id: slug }],
    }),

    placeOrder: builder.mutation({ query: (body) => ({ url: '/orders', method: 'POST', body }) }),
    trackOrder: builder.mutation({ query: (body) => ({ url: '/orders/track', method: 'POST', body }) }),
  }),
});

export const {
  useGetConfigQuery,
  useGetCategoriesQuery,
  useGetProductsQuery,
  useGetFlashSaleQuery,
  useGetProductBySlugQuery,
  usePlaceOrderMutation,
  useTrackOrderMutation,
} = publicApi;

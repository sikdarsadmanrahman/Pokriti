import { apiSlice } from './apiSlice.js';

/** Admin endpoints — every call carries the JWT via apiSlice.prepareHeaders. */
export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({ query: (body) => ({ url: '/auth/login', method: 'POST', body }) }),
    getMe: builder.query({ query: () => '/auth/me' }),

    getDashboard: builder.query({ query: () => '/admin/dashboard', providesTags: ['Dashboard'] }),

    adminGetCategories: builder.query({ query: () => '/admin/categories', providesTags: ['Category'] }),
    createCategory: builder.mutation({ query: (body) => ({ url: '/admin/categories', method: 'POST', body }), invalidatesTags: ['Category'] }),
    updateCategory: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/categories/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Category'],
    }),
    deleteCategory: builder.mutation({ query: (id) => ({ url: `/admin/categories/${id}`, method: 'DELETE' }), invalidatesTags: ['Category'] }),

    adminGetProducts: builder.query({
      query: (params = {}) => ({ url: '/admin/products', params }),
      providesTags: (result) =>
        result ? [...result.map((p) => ({ type: 'Product', id: p._id })), { type: 'Product', id: 'LIST' }] : [{ type: 'Product', id: 'LIST' }],
    }),
    adminGetProduct: builder.query({ query: (id) => `/admin/products/${id}`, providesTags: (r, e, id) => [{ type: 'Product', id }] }),
    createProduct: builder.mutation({
      query: (body) => ({ url: '/admin/products', method: 'POST', body }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }, 'Dashboard'],
    }),
    updateProduct: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/products/${id}`, method: 'PUT', body }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Product', id }, { type: 'Product', id: 'LIST' }],
    }),
    updateStock: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/products/${id}/stock`, method: 'PATCH', body }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Product', id }, { type: 'Product', id: 'LIST' }, 'Dashboard'],
    }),
    updateProductStatus: builder.mutation({
      query: ({ id, status }) => ({ url: `/admin/products/${id}/status`, method: 'PATCH', body: { status } }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Product', id }, { type: 'Product', id: 'LIST' }],
    }),
    deleteProduct: builder.mutation({ query: (id) => ({ url: `/admin/products/${id}`, method: 'DELETE' }), invalidatesTags: [{ type: 'Product', id: 'LIST' }] }),
    uploadImages: builder.mutation({ query: (formData) => ({ url: '/admin/uploads/images', method: 'POST', body: formData }) }),
    deleteImage: builder.mutation({ query: (publicId) => ({ url: '/admin/uploads/images', method: 'DELETE', body: { publicId } }) }),

    adminGetOrders: builder.query({
      query: (params = {}) => ({ url: '/admin/orders', params }),
      // baseQueryWithUnwrap forwards the response's `pagination` object as the 2nd (meta) argument here.
      transformResponse: (items, pagination) => ({ items, pagination }),
      providesTags: (result) =>
        result?.items ? [...result.items.map((o) => ({ type: 'Order', id: o._id })), { type: 'Order', id: 'LIST' }] : [{ type: 'Order', id: 'LIST' }],
    }),
    adminGetOrder: builder.query({ query: (id) => `/admin/orders/${id}`, providesTags: (r, e, id) => [{ type: 'Order', id }] }),
    updateOrderStatus: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/orders/${id}/status`, method: 'PATCH', body }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Order', id }, { type: 'Order', id: 'LIST' }, 'Dashboard'],
    }),
    updatePaymentStatus: builder.mutation({
      query: ({ id, status }) => ({ url: `/admin/orders/${id}/payment`, method: 'PATCH', body: { status } }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Order', id }, { type: 'Order', id: 'LIST' }],
    }),
    getInvoice: builder.query({ query: (id) => `/admin/orders/${id}/invoice` }),
    getInvoicesBatch: builder.query({ query: (ids) => `/admin/orders/invoices?ids=${ids.join(',')}` }),

    adminGetCustomers: builder.query({
      query: (params = {}) => ({ url: '/admin/customers', params }),
      transformResponse: (items, pagination) => ({ items, pagination }),
      providesTags: (result) =>
        result?.items ? [...result.items.map((c) => ({ type: 'Customer', id: c._id })), { type: 'Customer', id: 'LIST' }] : [{ type: 'Customer', id: 'LIST' }],
    }),
    adminGetCustomer: builder.query({ query: (id) => `/admin/customers/${id}`, providesTags: (r, e, id) => [{ type: 'Customer', id }] }),
    adminGetCustomerOrders: builder.query({ query: ({ id, ...params }) => ({ url: `/admin/customers/${id}/orders`, params }) }),
    updateCustomer: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/customers/${id}`, method: 'PATCH', body }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Customer', id }, { type: 'Customer', id: 'LIST' }],
    }),
  }),
});

export const {
  useLoginMutation, useGetMeQuery, useGetDashboardQuery,
  useAdminGetCategoriesQuery, useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation,
  useAdminGetProductsQuery, useAdminGetProductQuery, useCreateProductMutation, useUpdateProductMutation,
  useUpdateStockMutation, useUpdateProductStatusMutation, useDeleteProductMutation,
  useUploadImagesMutation, useDeleteImageMutation,
  useAdminGetOrdersQuery, useAdminGetOrderQuery, useUpdateOrderStatusMutation, useUpdatePaymentStatusMutation,
  useGetInvoiceQuery, useLazyGetInvoiceQuery, useLazyGetInvoicesBatchQuery,
  useAdminGetCustomersQuery, useAdminGetCustomerQuery, useAdminGetCustomerOrdersQuery, useUpdateCustomerMutation,
} = adminApi;

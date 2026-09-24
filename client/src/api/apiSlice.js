import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/**
 * Single RTK Query API slice for the whole app.
 * VITE_API_BASE_URL empty -> relative "/api/..." (works with the Vite dev proxy and same-origin prod deploys).
 * Admin requests attach the JWT automatically; the response envelope { success, data } is unwrapped here
 * so every hook below returns just the payload.
 */
const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_API_BASE_URL || ''}/api`,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) headers.set('authorization', `Bearer ${token}`);
    return headers;
  },
});

const baseQueryWithUnwrap = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error) {
    const message = result.error.data?.message || 'Something went wrong. Please try again.';
    return { error: { status: result.error.status, message, details: result.error.data?.details } };
  }
  return { data: result.data?.data, meta: result.data?.pagination };
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithUnwrap,
  tagTypes: ['Product', 'Category', 'Order', 'Customer', 'Dashboard'],
  endpoints: () => ({}),
});

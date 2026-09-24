import { Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/common/ToastContext.jsx';
import MainLayout from './components/layout/MainLayout.jsx';
import AdminLayout from './components/admin/AdminLayout.jsx';
import RequireAuth from './components/admin/RequireAuth.jsx';

import HomePage from './pages/HomePage.jsx';
import ShopPage from './pages/ShopPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import OrderSuccessPage from './pages/OrderSuccessPage.jsx';
import TrackOrderPage from './pages/TrackOrderPage.jsx';
import TrustPage from './pages/TrustPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

import AdminLoginPage from './pages/admin/AdminLoginPage.jsx';
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import AdminProductsPage from './pages/admin/AdminProductsPage.jsx';
import AdminProductFormPage from './pages/admin/AdminProductFormPage.jsx';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage.jsx';
import AdminOrdersPage from './pages/admin/AdminOrdersPage.jsx';
import AdminOrderDetailPage from './pages/admin/AdminOrderDetailPage.jsx';
import AdminCustomersPage from './pages/admin/AdminCustomersPage.jsx';
import AdminCustomerDetailPage from './pages/admin/AdminCustomerDetailPage.jsx';

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        {/* Storefront */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
          <Route path="/track-order" element={<TrackOrderPage />} />
          <Route path="/trust" element={<TrustPage />} />
        </Route>

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="products/:id" element={<AdminProductFormPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="orders/:id" element={<AdminOrderDetailPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="customers/:id" element={<AdminCustomerDetailPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ToastProvider>
  );
}

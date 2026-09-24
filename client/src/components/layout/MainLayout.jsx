import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import FlashSaleBar from './FlashSaleBar.jsx';
import WhatsAppWidget from './WhatsAppWidget.jsx';
import CartDrawer from '../cart/CartDrawer.jsx';

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <FlashSaleBar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppWidget />
      <CartDrawer />
    </div>
  );
}

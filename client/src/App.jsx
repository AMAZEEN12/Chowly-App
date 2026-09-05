import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import ExplorePage from './pages/ExplorePage';
import RestaurantPage from './pages/RestaurantPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import StaffLoginPage from './pages/StaffLoginPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import StaffDashboardPage from './pages/StaffDashboardPage';
import StaffOrderPage from './pages/StaffOrderPage';
import PaymentPage from './pages/PaymentPage';
import RestaurantApplyPage from './pages/RestaurantApplyPage';
import ProfilePage from './pages/ProfilePage';
export default function App() {
  return <BrowserRouter><Navbar/><Routes>
    <Route path="/" element={<LandingPage/>}/>
    <Route path="/explore" element={<ExplorePage/>}/>
    <Route path="/restaurants/:id" element={<RestaurantPage/>}/>
    <Route path="/cart" element={<CartPage/>}/>
    <Route path="/checkout" element={<CheckoutPage/>}/>
    <Route path="/login" element={<LoginPage/>}/>
    <Route path="/staff-login" element={<StaffLoginPage/>}/>
    <Route path="/orders" element={<OrderHistoryPage/>}/>
    <Route path="/orders/:id" element={<OrderDetailsPage/>}/>
    <Route path="/orders/:id/pay" element={<PaymentPage/>}/>
    <Route path="/staff" element={<StaffDashboardPage/>}/>
    <Route path="/staff/orders/:id" element={<StaffOrderPage/>}/>
    <Route path="/restaurant/apply" element={<RestaurantApplyPage/>}/>
    <Route path="/profile" element={<ProfilePage/>}/>
    <Route path="*" element={<main className="container page"><div className="empty"><h2>Page not found.</h2></div></main>}/>
  </Routes></BrowserRouter>;
}

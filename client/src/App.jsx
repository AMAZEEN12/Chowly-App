import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import CartToast from './components/CartToast';
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
import CheckEmailPage from './pages/CheckEmailPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import RestaurantRegisterPage from './pages/RestaurantRegisterPage';
import RestaurantSetupPage from './pages/RestaurantSetupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
export default function App() {
  return <BrowserRouter><Navbar/><CartToast/><Routes>
    <Route path="/" element={<LandingPage/>}/>
    <Route path="/explore" element={<ExplorePage/>}/>
    <Route path="/restaurants/:id" element={<RestaurantPage/>}/>
    <Route path="/cart" element={<CartPage/>}/>
    <Route path="/checkout" element={<CheckoutPage/>}/>
    <Route path="/login" element={<LoginPage/>}/>
    <Route path="/check-email" element={<CheckEmailPage/>}/>
    <Route path="/verify-email" element={<VerifyEmailPage/>}/>
    <Route path="/staff-login" element={<StaffLoginPage/>}/>
    <Route path="/forgot-password" element={<ForgotPasswordPage role="customer"/>}/>
    <Route path="/staff/forgot-password" element={<ForgotPasswordPage role="staff"/>}/>
    <Route path="/reset-password" element={<ResetPasswordPage/>}/>
    <Route path="/orders" element={<OrderHistoryPage/>}/>
    <Route path="/orders/:id" element={<OrderDetailsPage/>}/>
    <Route path="/orders/:id/pay" element={<PaymentPage/>}/>
    <Route path="/staff" element={<StaffDashboardPage/>}/>
    <Route path="/staff/orders/:id" element={<StaffOrderPage/>}/>
    <Route path="/restaurant/apply" element={<RestaurantApplyPage/>}/>
    <Route path="/restaurant/register" element={<RestaurantRegisterPage/>}/>
    <Route path="/restaurant/:id/setup" element={<RestaurantSetupPage/>}/>
    <Route path="/profile" element={<ProfilePage/>}/>
    <Route path="*" element={<main className="container page"><div className="empty"><h2>Page not found.</h2></div></main>}/>
  </Routes></BrowserRouter>;
}
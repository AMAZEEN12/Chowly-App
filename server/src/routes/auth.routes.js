import { Router } from 'express';
import {
  forgotPasswordCustomer, forgotPasswordStaff, getMe, googleAuth, loginCustomer, loginStaff,
  registerCustomer, resendVerification, resetPasswordCustomer, resetPasswordStaff, updateMe, verifyEmail
} from '../controllers/auth.controller.js';
import { protectCustomer } from '../middleware/auth.js';
const router = Router();
router.post('/customer/register', registerCustomer);
router.post('/customer/login', loginCustomer);
router.post('/customer/forgot-password', forgotPasswordCustomer);
router.post('/customer/reset-password', resetPasswordCustomer);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/google', googleAuth);
router.post('/staff/login', loginStaff);
router.post('/staff/forgot-password', forgotPasswordStaff);
router.post('/staff/reset-password', resetPasswordStaff);
router.get('/me', protectCustomer, getMe);
router.patch('/me', protectCustomer, updateMe);
export default router;

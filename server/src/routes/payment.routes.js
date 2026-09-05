import { Router } from 'express';
import { createPretendPayment, getOrderPayment } from '../controllers/payment.controller.js';
import { protectAny, protectCustomer } from '../middleware/auth.js';
const router = Router();
router.post('/', protectCustomer, createPretendPayment);
router.get('/order/:orderId', protectAny, getOrderPayment);
export default router;

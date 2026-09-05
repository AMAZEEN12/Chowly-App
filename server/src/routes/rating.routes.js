import { Router } from 'express';
import { getOrderRating, upsertRating } from '../controllers/rating.controller.js';
import { protectAny, protectCustomer } from '../middleware/auth.js';
const router = Router();
router.put('/', protectCustomer, upsertRating);
router.get('/order/:orderId', protectAny, getOrderRating);
export default router;

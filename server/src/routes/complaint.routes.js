import { Router } from 'express';
import { createComplaint, listOrderComplaints } from '../controllers/complaint.controller.js';
import { protectAny, protectCustomer } from '../middleware/auth.js';
const router = Router();
router.post('/', protectCustomer, createComplaint);
router.get('/order/:orderId', protectAny, listOrderComplaints);
export default router;

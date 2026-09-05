import { Router } from 'express';
import { listRestaurantStaff } from '../controllers/staff.controller.js';
import { protectStaff } from '../middleware/auth.js';
const router = Router();
router.get('/', protectStaff, listRestaurantStaff);
export default router;

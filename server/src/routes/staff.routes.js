import { Router } from 'express';
import { createStaff, listRestaurantStaff, listStaffForSetup } from '../controllers/staff.controller.js';
import { protectStaff } from '../middleware/auth.js';
const router = Router();
router.get('/', protectStaff, listRestaurantStaff);
router.post('/setup', createStaff);
router.get('/setup', listStaffForSetup);
export default router;

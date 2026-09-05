import { Router } from 'express';
import { listMenuItems } from '../controllers/menu.controller.js';
const router = Router();
router.get('/items', listMenuItems);
export default router;

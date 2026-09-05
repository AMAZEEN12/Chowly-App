import { Router } from 'express';
import { createMenuItem, deleteMenuItem, listAllMenuItemsForRestaurant, listMenuItems } from '../controllers/menu.controller.js';
const router = Router();
router.get('/items', listMenuItems);
router.get('/items/all', listAllMenuItemsForRestaurant);
router.post('/items', createMenuItem);
router.delete('/items/:id', deleteMenuItem);
export default router;

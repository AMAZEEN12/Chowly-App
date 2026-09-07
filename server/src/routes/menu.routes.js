import { Router } from 'express';
import { createMenuItem, deleteMenuItem, listAllMenuItemsForRestaurant, listMenuItems, updateMenuItem } from '../controllers/menu.controller.js';
const router = Router();
router.get('/items', listMenuItems);
router.get('/items/all', listAllMenuItemsForRestaurant);
router.post('/items', createMenuItem);
router.patch('/items/:id', updateMenuItem);
router.delete('/items/:id', deleteMenuItem);
export default router;

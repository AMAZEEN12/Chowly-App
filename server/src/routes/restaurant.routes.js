import { Router } from 'express';
import { applyRestaurant, getRestaurant, listRestaurants } from '../controllers/restaurant.controller.js';
const router = Router();
router.get('/', listRestaurants);
router.post('/apply', applyRestaurant);
router.get('/:id', getRestaurant);
export default router;

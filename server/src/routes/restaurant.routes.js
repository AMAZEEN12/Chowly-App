import { Router } from 'express';
import { applyRestaurant, getRestaurant, listRestaurants, registerRestaurant, updateRestaurant } from '../controllers/restaurant.controller.js';
const router = Router();
router.get('/', listRestaurants);
router.post('/apply', applyRestaurant);
router.post('/register', registerRestaurant);
router.get('/:id', getRestaurant);
router.patch('/:id', updateRestaurant);
export default router;

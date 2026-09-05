import 'dotenv/config';
import { connectDB } from '../config/db.js';
import Restaurant from '../models/Restaurant.js';
import Menu from '../models/Menu.js';
import MenuItem from '../models/MenuItem.js';
import Staff from '../models/Staff.js';
import Customer from '../models/Customer.js';
import Order from '../models/Order.js';
import Complaint from '../models/Complaint.js';
import Rating from '../models/Rating.js';
import Payment from '../models/Payment.js';
import RestaurantApplication from '../models/RestaurantApplication.js';
const restaurants = [
  ['Chicken Republic', 'chicken-republic', 'Lagos', ['Nigerian', 'Quick Service'], 'Lunch Rush: 10% off selected meals', 2, '#ff7a00', 6.5244, 3.3792],
  ['Kilimanjaro', 'kilimanjaro', 'Ibadan', ['Nigerian', 'Continental'], 'Free drink on selected combos', 3, '#ff4d67', 7.3775, 3.9470],
  ['Yellow Chilli', 'yellow-chilli', 'Port Harcourt', ['African', 'Contemporary'], 'Chef special this week', 4, '#a7f432', 4.8156, 7.0498],
  ['Tastee Fried Chicken', 'tastee-fried-chicken', 'Akure', ['Quick Service', 'Chicken'], 'Combo deal available today', 2, '#4f8cff', 7.2571, 5.2058],
  ['NOK by Alara', 'nok-by-alara', 'Lagos', ['African', 'Fine Dining'], 'Evening experience: selected mocktails -10%', 5, '#8a5cff', 6.4281, 3.4219]
];
const menuItemsByRestaurant = [
  [
    ['Fried Rice', 'Food', 2000, 18, 10, true, 'Smoky Nigerian fried rice with vegetables.'],
    ['Grilled Chicken', 'Food', 5000, 28, 0, true, 'Char-grilled chicken with house seasoning.'],
    ['Malt', 'Drink', 1000, 2, 0, false, 'Chilled malt drink.'],
    ['Chapman', 'Drink', 2500, 7, 5, true, 'Classic fruity Chapman.']
  ],
  [
    ['Jollof Rice', 'Food', 1800, 20, 0, true, 'Party-style jollof rice.'],
    ['Pounded Yam & Egusi', 'Food', 4500, 30, 0, false, 'Pounded yam served with rich egusi soup.'],
    ['Zobo', 'Drink', 1200, 4, 10, true, 'Chilled hibiscus drink.']
  ],
  [
    ['Suya Platter', 'Food', 3000, 22, 0, true, 'Spiced suya platter with fresh garnish.'],
    ['Chapman', 'Drink', 3500, 8, 0, false, 'House Chapman with citrus.']
  ],
  [
    ['Pounded Yam & Egusi', 'Food', 4500, 28, 5, true, 'Traditional pounded yam and egusi.'],
    ['Palm Wine', 'Drink', 2000, 3, 0, false, 'Fresh chilled palm wine.', true]
  ],
  [
    ['Catfish Pepper Soup', 'Food', 6000, 30, 0, true, 'Spicy catfish pepper soup.'],
    ['Grilled Fish', 'Food', 7500, 35, 0, true, 'Whole grilled fish with herbs.'],
    ['Sparkling Water', 'Drink', 1500, 2, 0, false, 'Chilled sparkling water.'],
    ['Mocktail', 'Drink', 4000, 8, 10, true, 'Signature alcohol-free mocktail.']
  ]
];
const staffNames = [
  ['Tolu', 'Rachel', 'Ndidi'], ['Femi', 'Grace', 'Kunle'], ['Ifeoma', 'Emeka', 'Blessing'], ['Bola', 'Segun', 'Aisha'], ['Zainab', 'Chidi', 'Musa']
];
async function seed() {
  await connectDB();
  await Promise.all([
    Restaurant.deleteMany({}), Menu.deleteMany({}), MenuItem.deleteMany({}), Staff.deleteMany({}), Customer.deleteMany({}),
    Order.deleteMany({}), Complaint.deleteMany({}), Rating.deleteMany({}), Payment.deleteMany({}), RestaurantApplication.deleteMany({})
  ]);
  const createdRestaurants = [];
  for (const [name, slug, location, cuisineTypes, promoText, cashbackPercent, accent, latitude, longitude] of restaurants) {
    createdRestaurants.push(await Restaurant.create({ name, slug, location, phone: '0203058842', email: `${slug}@restaurant.ng`, cuisineTypes, promoText, cashbackPercent, accent, latitude, longitude }));
  }

  for (let i = 0; i < createdRestaurants.length; i++) {
    const restaurant = createdRestaurants[i];
    const foodMenu = await Menu.create({ restaurant: restaurant._id, name: 'Food Menu', type: 'Food' });
    const drinkMenu = await Menu.create({ restaurant: restaurant._id, name: 'Drinks Menu', type: 'Drink' });
    for (const [name, category, price, prepTimeMins, discountPercent, featured, description, isAlcoholic] of menuItemsByRestaurant[i]) {
      await MenuItem.create({
        restaurant: restaurant._id,
        menu: category === 'Food' ? foodMenu._id : drinkMenu._id,
        name, category, price, prepTimeMins, discountPercent, featured, description,
        isAlcoholic: !!isAlcoholic
      });
    }
    const roles = ['Waiter', 'Chef', 'Bartender'];
    for (let r = 0; r < roles.length; r++) {
      const name = staffNames[i][r];
      await Staff.create({
        name,
        email: `${name.toLowerCase()}.${roles[r].toLowerCase()}@chowly.demo`,
        password: 'Password123!',
        role: roles[r],
        salary: [30000, 70000, 50000][r] + i * 1000,
        restaurant: restaurant._id
      });
    }
  }
  await Customer.create([
    { name: 'Adebayo', email: 'adebayo@chowly.demo', phone: '0881193849', password: 'Password123!', dateOfBirth: '1994-03-12' },
    { name: 'Adebisi', email: 'adebisi@chowly.demo', phone: '0881193850', password: 'Password123!', dateOfBirth: '2010-07-21' },
    { name: 'Olutayo', email: 'olutayo@chowly.demo', phone: '0881193851', password: 'Password123!', dateOfBirth: null }
  ]);
  console.log('Seed complete.');
  console.log('Demo customer (adult, can order alcohol): adebayo@chowly.demo / Password123!');
  console.log('Demo customer (under 18, alcohol blocked): adebisi@chowly.demo / Password123!');
  console.log('Demo customer (no date of birth yet): olutayo@chowly.demo / Password123!');
  console.log('Demo waiter: tolu.waiter@chowly.demo / Password123!');
  process.exit(0);
}
seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

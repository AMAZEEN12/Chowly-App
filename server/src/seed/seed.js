import 'dotenv/config';
import { connectDB } from '../config/db.js';
import Restaurant from '../models/Restaurant.js';
import Menu from '../models/Menu.js';
import MenuItem from '../models/MenuItem.js';
import Staff from '../models/Staff.js';
import Customer from '../models/Customer.js';
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

const menuImageByName = {
  // Food/drink photos were selected to match the menu item itself. Where possible,
  // the source is Wikimedia Commons or a direct image from a food site.
  'Fried Rice': 'https://commons.wikimedia.org/wiki/Special:FilePath/Fried_rice_with_chicken_meat.jpg',
  'Grilled Chicken': 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=85',
  'Malt': 'https://static.wixstatic.com/media/667e45_8b47ea44df524cb6a078ff336db69eee~mv2.png/v1/fill/w_980,h_980,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/667e45_8b47ea44df524cb6a078ff336db69eee~mv2.png',
  'Chapman': 'https://i.pinimg.com/736x/81/a4/cc/81a4cc8d14614b2e699ee3896cc59c23.jpg',
  'Jollof Rice': 'https://flawlessfood.co.uk/wp-content/uploads/2023/01/Jollof-Rice-04.jpg',
  'Pounded Yam & Egusi': 'https://commons.wikimedia.org/wiki/Special:FilePath/Egusi_soup_with_pounded_yam_and_assorted_meats.jpg',
  'Zobo': 'https://commons.wikimedia.org/wiki/Special:FilePath/Chilled_Zobo_drink.jpg',
  'Suya Platter': 'https://www.tastingtable.com/img/gallery/suya-the-classic-nigerian-street-food-you-should-know/how-to-make-suya-at-home-1663005990.jpg',
  'Palm Wine': 'https://www.nairaland.com/attachments/5037988_palmwine_jpegb65231f7d6af6f0d7dc0dbd47e3269c2',
  'Catfish Pepper Soup': 'https://i.pinimg.com/originals/9a/59/91/9a5991c5d00eb913d4f22934adb0d493.jpg',
  'Grilled Fish': 'https://ocdn.eu/pulscms-transforms/1/LOgk9kpTURBXy8yNDA3YTUzMzNkNzcyZGU2YTJlZTA4ZDIyMmE0YTM1My5qcGeQgaEwAA',
  'Sparkling Water': 'https://product.hstatic.net/200000909439/product/8002270011023500_650x_1975e97bff7342a5af0a9ca635ca36c1_grande.png',
  'Mocktail': 'https://goodemma.com/wp-content/uploads/Flavorful-non-alcoholic-cocktails.jpg'
};

const staffNames = [
  ['Tolu', 'Rachel', 'Ndidi'], ['Femi', 'Grace', 'Kunle'], ['Ifeoma', 'Emeka', 'Blessing'], ['Bola', 'Segun', 'Aisha'], ['Zainab', 'Chidi', 'Musa']
];
// This seed is additive/idempotent: it only creates the demo records that
// are missing and never deletes anything, so restaurants, staff and
// customers you've added yourself (or previous demo runs) are left alone.
// Safe to run with `npm run seed` as many times as you like.
async function seed() {
  await connectDB();

  const createdRestaurants = [];
  for (const [name, slug, location, cuisineTypes, promoText, cashbackPercent, accent, latitude, longitude] of restaurants) {
    let restaurant = await Restaurant.findOne({ slug });
    if (!restaurant) {
      restaurant = await Restaurant.create({ name, slug, location, phone: '0203058842', email: `${slug}@restaurant.ng`, cuisineTypes, promoText, cashbackPercent, accent, latitude, longitude });
      console.log(`Created demo restaurant: ${name}`);
    }
    createdRestaurants.push(restaurant);
  }

  for (let i = 0; i < createdRestaurants.length; i++) {
    const restaurant = createdRestaurants[i];

    let foodMenu = await Menu.findOne({ restaurant: restaurant._id, type: 'Food' });
    if (!foodMenu) foodMenu = await Menu.create({ restaurant: restaurant._id, name: 'Food Menu', type: 'Food' });
    let drinkMenu = await Menu.findOne({ restaurant: restaurant._id, type: 'Drink' });
    if (!drinkMenu) drinkMenu = await Menu.create({ restaurant: restaurant._id, name: 'Drinks Menu', type: 'Drink' });

    for (const [name, category, price, prepTimeMins, discountPercent, featured, description, isAlcoholic] of menuItemsByRestaurant[i]) {
      const imageUrl = menuImageByName[name] || '';
      const exists = await MenuItem.findOne({ restaurant: restaurant._id, name });
      if (exists) {
        // Refresh demo/external image URLs when the seed's image selection changes.
        // Data URLs are restaurant-uploaded images and are intentionally preserved.
        const current = exists.imageUrl || '';
        const isUploadedImage = current.startsWith('data:image/');
        const isKnownDemoImage = !current || current.startsWith('https://images.unsplash.com/') || current.startsWith('https://static.wixstatic.com/') || current.startsWith('https://commons.wikimedia.org/') || current.startsWith('https://flawlessfood.co.uk/') || current.startsWith('https://i.pinimg.com/') || current.startsWith('https://www.tastingtable.com/') || current.startsWith('https://www.nairaland.com/') || current.startsWith('https://ocdn.eu/') || current.startsWith('https://product.hstatic.net/') || current.startsWith('https://goodemma.com/') || current.includes('photo-1622483767028-3f66f4a4b1e1');
        if (imageUrl && !isUploadedImage && isKnownDemoImage && current !== imageUrl) {
          exists.imageUrl = imageUrl;
          await exists.save();
        }
        continue;
      }
      await MenuItem.create({
        restaurant: restaurant._id,
        menu: category === 'Food' ? foodMenu._id : drinkMenu._id,
        name, category, price, prepTimeMins, discountPercent, featured, description,
        imageUrl,
        isAlcoholic: !!isAlcoholic
      });
    }

    const roles = ['Waiter', 'Chef', 'Bartender'];
    for (let r = 0; r < roles.length; r++) {
      const name = staffNames[i][r];
      const email = `${name.toLowerCase()}.${roles[r].toLowerCase()}@chowly.demo`;
      const exists = await Staff.findOne({ email });
      if (exists) continue;
      await Staff.create({
        name,
        email,
        password: 'Password123!',
        role: roles[r],
        salary: [30000, 70000, 50000][r] + i * 1000,
        restaurant: restaurant._id
      });
    }
  }

  const demoCustomers = [
    { name: 'Adebayo', email: 'adebayo@chowly.demo', phone: '0881193849', password: 'Password123!', dateOfBirth: '1994-03-12', isVerified: true },
    { name: 'Adebisi', email: 'adebisi@chowly.demo', phone: '0881193850', password: 'Password123!', dateOfBirth: '2010-07-21', isVerified: true },
    { name: 'Olutayo', email: 'olutayo@chowly.demo', phone: '0881193851', password: 'Password123!', dateOfBirth: null, isVerified: true }
  ];
  for (const customerData of demoCustomers) {
    const exists = await Customer.findOne({ email: customerData.email });
    if (exists) continue;
    await Customer.create(customerData);
  }

  console.log('Seed complete (existing data left untouched).');
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

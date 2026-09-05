// Quick dev/debug script — lists every restaurant and its staff.
// Run with: node src/scripts/list-restaurants-and-staff.js
//
// Passwords are intentionally never shown: Staff.js hashes them with bcrypt
// before saving, which is one-way — there is no way to recover the original
// text from the database, by this script or anything else. If you need to
// know a staff member's password, use the "Forgot password" flow to set a
// new one, or check the seed script (server/src/seed/seed.js), which uses
// the fixed demo password 'Password123!' for every seeded account.

import 'dotenv/config';
import { connectDB } from '../config/db.js';
import mongoose from 'mongoose';
import Restaurant from '../models/Restaurant.js';
import Staff from '../models/Staff.js';

async function run() {
  await connectDB();

  const restaurants = await Restaurant.find().sort({ name: 1 });
  const staff = await Staff.find().select('name email role salary restaurant').sort({ restaurant: 1, role: 1, name: 1 });

  const staffByRestaurant = {};
  for (const s of staff) {
    const key = String(s.restaurant);
    (staffByRestaurant[key] ||= []).push(s);
  }

  console.log(`\n${restaurants.length} restaurant(s):\n`);
  for (const r of restaurants) {
    console.log(`- ${r.name}  [${r.isActive ? 'LIVE' : 'draft'}]  (${r.location})  id=${r._id}`);
    const staffHere = staffByRestaurant[String(r._id)] || [];
    if (!staffHere.length) {
      console.log('    (no staff added yet)');
    } else {
      for (const s of staffHere) {
        console.log(`    - ${s.name} — ${s.role} — ${s.email}${s.salary ? ` — ₦${s.salary}` : ''}`);
      }
    }
  }
  console.log('');

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

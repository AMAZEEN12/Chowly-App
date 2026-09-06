# Chowly MERN Web Application
Chowly is a full-stack restaurant digital dining application built from the TeSA Africa Chowly model/build assignments and the assessment feedback.
## Core story implemented
- Browse restaurants, food and drinks menus.
- Search menu items and view promotions.
- Add items to cart and place a dine-in or scheduled order.
- Persist orders in MongoDB and show estimated waiting time.
- Automatically assign a waiter from the restaurant.
- Waiter records the chef and bartender and marks the order served.
- Customer can submit a complaint when an order is delayed and rate an order.
- Customer completes a clearly labelled **pretend payment** before exit.
- Customer can view order history.
- Staff can sign in through a staff portal.
## Bonus features
- Customer signup/login and staff login.
- Restaurant onboarding request form.
- Scheduled orders.
- Tips for staff during pretend payment.
- Promotions/discount badges.
- Animated customer UI.
- Status timeline and richer order detail.
- Controlled debugging exercises documented in `docs/BUG_FIX_LOG.md` (see note below).
- **Nearest restaurant.** On the Explore page, "Find nearest to me" uses the browser's own location and sorts restaurants by distance (each restaurant carries a latitude/longitude in the seed data).
- **Happy birthday.** A customer's date of birth (set at signup or on their Profile page) is compared against today's date; on their birthday, they see a greeting banner on their profile and a small cake icon next to the Profile link in the navbar.
- **Profile registration.** A dedicated `/profile` page for a signed-in customer to view and edit their name, phone number and date of birth (`GET`/`PATCH /api/auth/me`).
- **Age limit for alcohol.** Menu items can be flagged `isAlcoholic` (Palm Wine, in the seed data). Ordering one requires the customer to have a date of birth on file showing they're 18 or older — enforced both in the UI (the add button is blocked with an explanation) and, authoritatively, on the server when the order is submitted.

## A note on this specific export
This copy of the project was reconstructed from a PDF export of the source ("Chowly_MERN_Full_Source_Code.pdf"). Two things from that PDF weren't actually included in it, even though this README (which was copied from the same PDF) mentions them:
- `docs/BUILD_MANUAL.md` and the "companion DOCX manual"
- `docs/BUG_FIX_LOG.md`, documenting the intentional debugging exercises mentioned above

If you have those files from wherever this PDF was originally generated, add them under a new `docs/` folder — the code doesn't depend on them, they're just referenced here. Otherwise, use the **Quick start** section below, which is a full, self-contained setup and deployment walkthrough written for this copy of the project.

## Quick start

### 1. Local setup
```
cd server && npm install && cp .env.example .env
```
Open `server/.env` and fill in:
```
PORT=5000
MONGODB_URI=<your MongoDB Atlas connection string, with a database name in the path>
JWT_SECRET=<any long random string>
CLIENT_URL=http://localhost:5173
```
Then seed the database and start the API:
```
npm run seed
npm run dev
```
Visit `http://localhost:5000` to confirm the server is up (it will 404 with a JSON body, which is expected — there's no root route, only `/api/...`).

In a second terminal:
```
cd client && npm install && cp .env.example .env
```
Open `client/.env` and set the API base URL (check `client/src/api/client.js` for the exact variable name it reads):
```
VITE_API_URL=http://localhost:5000/api
```
Then:
```
npm run dev
```
Open the URL Vite prints (usually `http://localhost:5173`).

Demo logins (created by `npm run seed`, all password `Password123!`):
- Adult customer, can order alcohol: `adebayo@chowly.demo`
- Under-18 customer, alcohol blocked: `adebisi@chowly.demo`
- Customer with no date of birth yet: `olutayo@chowly.demo`
- Waiter: `tolu.waiter@chowly.demo`

### 2. Deploy the database
Create a free MongoDB Atlas cluster, a database user, and allow network access from anywhere (`0.0.0.0/0`) for simplicity. Use that connection string as `MONGODB_URI` everywhere below.

### 3. Deploy the backend (Render or Railway)
- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Environment variables: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL` (set this to your deployed frontend URL once you have it from step 4)
- After the first deploy, run `npm run seed` once against the live database (via the host's shell, or by running it locally with the same `MONGODB_URI`).

### 4. Deploy the frontend (Vercel or Netlify)
- Root directory: `client`
- Build command: `npm run build` — output directory `dist`
- Environment variable: the API base URL, pointing at your deployed backend (e.g. `https://your-backend.onrender.com/api`)
- Once deployed, go back to step 3 and set `CLIENT_URL` on the backend to this exact frontend URL, then redeploy the backend.

### 5. Verify
Open the deployed frontend link, sign up as a customer, place an order, then open the staff portal in another tab/device and confirm you can assign a chef/bartender and mark the order served.

### Payment flow
The customer payment screen now uses a staged, simulated checkout: saved cards/bank accounts/digital wallets are offered to returning customers, new customers can add a method, bank transfer displays the restaurant demo account and an “I have transferred” confirmation, and every method ends with a payment-success modal offering “Make another order” or “Exit app”. Full card numbers and CVV are not persisted.

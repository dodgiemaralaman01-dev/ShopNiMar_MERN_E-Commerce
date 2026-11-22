# ShopNiMar

ShopNiMar is a MERN e-commerce project with a customer storefront, an admin dashboard, and an Express/MongoDB backend.

## Run locally

1. Configure the backend environment:

   ```powershell
   cd backend
   Copy-Item .env.example .env
   ```

   Set `MONGODB_URI` to your MongoDB connection string and `JWT_SECRET` to a long, random value in `backend/.env`. Keep this file private; it is ignored by Git.

2. In a terminal, install and start the backend:

   ```powershell
   cd backend
   npm install
   npm run dev
   ```

3. In separate terminals, install and start the customer storefront and admin dashboard:

   ```powershell
   cd frontend
   npm install
   npm start
   ```

   ```powershell
   cd admin
   npm install
   npm run dev
   ```

The storefront and admin dashboard expect the backend at `http://localhost:4000`.

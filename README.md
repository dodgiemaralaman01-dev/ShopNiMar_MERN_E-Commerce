# Shop Ni Mar

Shop Ni Mar is a MERN Stack e-commerce website for thrift clothing, offering affordable styles for men, women, and kids. It provides a convenient way to browse clothing online, explore product collections, and shop without having to visit a thrift store in person.

## About

Customers can browse the homepage and dedicated men's, women's, and kids' pages; view product images and prices; discover new collections, popular items, and promotional offers; and add clothing to a cart. The website also includes login and sign-up pages and an email newsletter subscription section.

The administrative panel helps the store administrator manage product inventory. Administrators can add products, enter product details, upload images, set regular and promotional prices, choose product categories, and remove products from the catalog.

Shop Ni Mar aims to make thrift shopping more accessible and organized for customers shopping for themselves and their families, while giving the administrator a straightforward way to manage the store's product listings.

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

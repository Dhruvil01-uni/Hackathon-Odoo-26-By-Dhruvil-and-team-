# TransitOps — Fleet ERP

TransitOps is a comprehensive Fleet Enterprise Resource Planning (ERP) platform built during the **Odoo 26 Hackathon**. It provides logistics companies with a real-time, unified dashboard to manage vehicles, drivers, trips, fuel consumption, maintenance, and operating expenses.

## 🚀 Features

*   **Vehicle Management:** Track complete fleet inventory, including capacity, type, odometer readings, and current status (Available, On Trip, In Shop, Retired).
*   **Driver Management:** Manage driver profiles, track license expiry dates, and monitor safety scores.
*   **Trip Dispatching:** Create trips, assign available vehicles and drivers, and track them from dispatch to completion.
*   **Fuel & Expenses:** Log fuel consumption linked to specific vehicles and trips. Record operational expenses and analyze cost metrics.
*   **Maintenance Logs:** Schedule maintenance, track estimated costs, and automatically update vehicle availability when vehicles go into the shop.
*   **Real-time Analytics:** View total fleet cost, active vehicles, drivers on duty, and total trips directly from the dashboard.

## 🛠️ Technology Stack

*   **Frontend:** React (TypeScript), Vite, Tailwind CSS, Shadcn UI, Recharts (for charts), Lucide React (for icons).
*   **Backend:** Node.js, Express.js (TypeScript), Prisma ORM.
*   **Database:** PostgreSQL (via Prisma).
*   **Deployment:** 
    *   Frontend: Vercel
    *   Backend: Render (`render.yaml` configured)

## 📦 Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd Hackathon-Odoo-26-By-Dhruvil-and-team-
   ```

2. **Backend Setup (Express + Prisma):**
   ```bash
   cd server
   npm install
   
   # Rename .env.example to .env and provide your Postgres connection string
   # DATABASE_URL="postgresql://user:password@localhost:5432/transitops"
   
   # Run Prisma Migrations and Seed mock data
   npx prisma migrate dev
   npm run seed
   
   # Start the development server (runs on port 5000)
   npm run dev
   ```

3. **Frontend Setup (React + Vite):**
   ```bash
   # In a new terminal tab
   cd client
   npm install
   
   # Start the Vite development server (runs on port 5173)
   npm run dev
   ```

4. **View the Application:**
   Open your browser and navigate to `http://localhost:5173`.

## 🚢 Deployment Configuration

*   **Render:** The backend is configured to be easily deployed on Render using the included `render.yaml` infrastructure-as-code file. It automatically spins up a PostgreSQL instance and a Node.js web service.
*   **Vercel:** The frontend is configured for deployment on Vercel via the `client/vercel.json` file. It proxies `/api/*` requests seamlessly to the backend server.

---
*Built with  by Dhruvil and Team for the Odoo 26 Hackathon.*

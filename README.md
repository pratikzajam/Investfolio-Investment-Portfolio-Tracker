# Investment Portfolio Tracker 📈 💹

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=nodedotjs)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen?logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![Google Gemini AI](https://img.shields.io/badge/Google-Gemini_AI-4285F4?logo=google)](https://ai.google.dev/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)](https://vercel.com/)

A modern, full-stack investment portfolio tracking application built with the MERN stack (MongoDB, Express.js, React, Node.js) and integrated with **Google Gemini AI** for intelligent portfolio analysis. 

Investfolio empowers investors to track, analyze, and optimize multi-asset portfolios—including stocks, cryptocurrencies, bonds, ETFs, commodities, and forex—with real-time statistics, interactive charts, and voice-assisted AI guidance.

---

🌐 **Live Applications:**
- **Frontend App:** [https://investment-frontend-peach.vercel.app](https://investment-frontend-peach.vercel.app)
- **Backend API:** [https://investfolio-investment-portfolio-tr.vercel.app](https://investfolio-investment-portfolio-tr.vercel.app)

---

## Key Features ✨

* 🤖 **AI-Powered Portfolio Assistant (Google Gemini 3.5)**: Get real-time advice, portfolio breakdowns, and investment tips driven securely by backend-aggregated portfolio analytics.
* 🎙️ **Voice & Speech Recognition**: Full hands-free interaction with speech-to-text recognition and text-to-speech voice responses (with mute toggles and live audio spectrums).
* 📊 **Automated Backend Calculations**: Offloaded portfolio metrics (total portfolio value, profit/loss change amount, percentage returns, and asset allocations) to server-side aggregators.
* 📈 **Interactive Visualizations**: Dynamic Chart.js performance trends, gain/loss indicators, and asset allocation pie charts.
* 🔒 **Secure Authentication**: JWT-based session security, password hashing with bcrypt, and protected client/server routes.
* 📱 **Modern Glassmorphic UI**: Built with React, Tailwind CSS, Framer Motion micro-animations, and full responsive design across desktop and mobile devices.

---

## Tech Stack 🛠️

### Frontend
- **Framework**: React.js with Vite
- **Styling**: Tailwind CSS & Vanilla CSS Design System
- **Animations**: Framer Motion & CSS Micro-animations
- **Data Visualization**: Chart.js & React-Chartjs-2
- **Voice Interface**: React Speech Recognition & Web Speech API

### Backend
- **Runtime & Framework**: Node.js & Express.js (Vercel Serverless Compatible)
- **Database**: MongoDB Atlas with Mongoose ORM
- **AI Integration**: `@google/generative-ai` (Gemini 3.5 Flash Lite)
- **Security & Auth**: JSON Web Tokens (JWT) & BcryptJS
- **CORS & Middleware**: Dynamic origin validation & database connection caching

---

## Project Architecture 🏗️

```
📦 Investfolio-Investment-Portfolio-Tracker
├── ⚙️ backend
│   ├── 🔧 config/          # Database connection pooling (Serverless safe)
│   ├── 🎮 controllers/     # Asset calculation, auth, and AI Chatbot logic
│   ├── 🔒 middlewares/     # JWT authentication verifiers
│   ├── 📊 models/          # User and Asset Mongoose Schemas
│   ├── 🛣️ routes/          # Express API route endpoints
│   ├── 📝 package.json
│   ├── 🚀 app.js           # Serverless Express entry point
│   └── ⚡ vercel.json      # Serverless deployment configuration
│
└── 🎯 frontend
    ├── 📱 src/
    │   ├── components/     # Navbar, ChatBot, Glass Cards, Modals
    │   ├── pages/          # Home, Dashboard, Portfolio, Compare
    │   ├── contexts/       # Auth and Portfolio State Providers
    │   ├── config.js       # Centralized API base URL config
    │   ├── App.jsx
    │   └── main.jsx
    └── 📝 package.json
```

---

## Getting Started 🚀

### Prerequisites
* Node.js (v18 or higher)
* MongoDB Atlas Cluster or local MongoDB instance
* Google Gemini API Key ([Google AI Studio](https://aistudio.google.com/))

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/pratikzajam/Investfolio-Investment-Portfolio-Tracker.git
   cd Investfolio-Investment-Portfolio-Tracker
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend/` folder:
   ```env
   PORT=3777
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   FRONTEND_URL=http://localhost:5173
   GEMINI_API_KEY=your_gemini_api_key
   ```
   Start the backend development server:
   ```bash
   npm run dev
   # Server will start on http://localhost:3777
   ```

3. **Frontend Setup**
   Open a new terminal window:
   ```bash
   cd frontend
   npm install
   ```
   Create a `.env` file in the `frontend/` folder:
   ```env
   VITE_BACKEND_URL=http://localhost:3777
   ```
   Start the frontend development server:
   ```bash
   npm run dev
   # Frontend will start on http://localhost:5173
   ```

---

## API Documentation 🛣️

| Endpoint | Method | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `/` | `GET` | No | Backend Health Check |
| `/api/user/signup` | `POST` | No | Register new user account |
| `/api/user/login` | `POST` | No | Authenticate user & return JWT token |
| `/api/user/is-auth` | `GET` | Yes | Verify token validity |
| `/api/user/getassets` | `GET` | Yes | Fetch user assets & computed portfolio stats |
| `/api/user/addasset` | `POST` | Yes | Add a new asset to portfolio |
| `/api/user/deleteasset/:id` | `DELETE` | Yes | Remove asset from portfolio |
| `/api/user/chat` | `POST` | Yes | Query Gemini AI chatbot with live portfolio context |

---

## Screenshots 📸

#### Dashboard Overview
![Dashboard](frontend/public/images/dashboard.png)

#### Portfolio & Asset Management
![Portfolio](frontend/public/images/porfolio.png)

#### Portfolio Comparison Tool
![Comparison](frontend/public/images/comparison.png)

---

## Author 👨‍💻

**Pratik Zajam**
- **GitHub:** [@pratikzajam](https://github.com/pratikzajam)
- **Project Repository:** [Investfolio-Investment-Portfolio-Tracker](https://github.com/pratikzajam/Investfolio-Investment-Portfolio-Tracker)

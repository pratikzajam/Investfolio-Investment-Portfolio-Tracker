require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db.js');
const UserRouter = require('./routes/userRoutes.js');

const app = express();

app.use(express.json());

// Configure CORS for local & production deployment
app.use(cors({
    origin: true,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    optionsSuccessStatus: 204
}));

// Middleware to ensure DB is connected before processing requests
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error("Database Connection Error:", err);
        return res.status(500).json({ status: false, message: "Database Connection Failed" });
    }
});

// Routes
app.use("/api/user", UserRouter);

// Health check / Root endpoint
app.get("/", (req, res) => {
    res.status(200).json({ status: true, message: "Investfolio Backend API is running" });
});

// Export app for Vercel Serverless Function
module.exports = app;

// Local Development Server listener
if (require.main === module) {
    const PORT = process.env.PORT || 3777;
    connectDB().then(() => {
        app.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT}`);
        });
    }).catch((err) => {
        console.error("Server Error on startup:", err);
    });
}

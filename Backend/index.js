const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const passport = require('passport');
const session = require('express-session');

dotenv.config();

require('./config/PassportConfig.js')(passport);

const authRoutes = require('./Routes/UserRoute');
const leaderboardRoutes = require('./Routes/LeaderboardRoute');

const app = express();

// Enable CORS for frontend communication
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON requests
app.use(express.json());

// Configure session for user authentication
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
}));

// Initialize Passport for authentication
app.use(passport.initialize());
app.use(passport.session());

// API routes
app.use('/auth', authRoutes);
app.use('/leaderboard', leaderboardRoutes);

// Start server on specified port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

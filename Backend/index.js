const express = require('express');
const session = require('express-session');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('passport');

dotenv.config();

require('./config/PassportConfig.js')(passport);

const authRoutes = require('./Routes/UserRoute');
const leaderboardRoutes = require('./Routes/LeaderboardRoute');

const app = express();

// CORS configuration
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(express.json());

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, 
    saveUninitialized: true, 
    cookie: {
        httpOnly: true, 
        secure: false, 
        maxAge: 24 * 60 * 60 * 1000 
    }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);
app.use('/leaderboard', leaderboardRoutes);

// Starting the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
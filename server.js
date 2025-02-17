const express = require('express');
const session = require('express-session');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));

// Session middleware
app.use(session({
    secret: 'your_secure_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Routes
app.use('/', authRoutes);
app.use('/home', userRoutes);
app.use('/admin', adminRoutes);

// Start the Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`CruiseControl server is running on http://localhost:${PORT}`);
});
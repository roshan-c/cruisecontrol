const express = require('express');
const router = express.Router();
const { getData, saveData } = require('../models/db');

// Login Route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Received login attempt:', { username });

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    const data = getData();
    const user = data.users.find(user => user.username === username);

    if (!user || password !== user.password) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    req.session.username = username;
    req.session.isAdmin = user.isAdmin;
    res.json({ message: 'Login successful', isAdmin: user.isAdmin });
});

// Signup Route
router.post('/signup', async (req, res) => {
    const { username, password, isAdmin } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    const data = getData();
    if (data.users.find(user => user.username === username)) {
        return res.status(400).json({ message: 'Username already exists' });
    }

    const newUser = {
        username,
        password,
        isAdmin: isAdmin === 'true' || isAdmin === true,
        visitedBars: [],
        points: 0,
        currentGoal: null,
        completedGoals: []
    };
    data.users.push(newUser);
    saveData(data);
    res.json({ message: 'Signup successful' });
});

// Logout Route
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Internal server error' });
        }
        res.json({ message: 'Logout successful' });
    });
});

module.exports = router;
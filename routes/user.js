const express = require('express');
const router = express.Router();
const { getData, saveData } = require('../models/db');
const { isAuthenticated } = require('../middleware/auth');

// Home Route
router.get('/', isAuthenticated, (req, res) => {
    const data = getData();
    const user = data.users.find(u => u.username === req.session.username);
    
    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    res.json({
        username: user.username,
        points: user.points,
        isAdmin: user.isAdmin
    });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { getData, saveData } = require('../models/db');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Get All Users
router.get('/users', isAuthenticated, isAdmin, (req, res) => {
    const data = getData();
    const users = data.users.map(user => ({
        username: user.username,
        isAdmin: user.isAdmin,
        visitedBars: user.visitedBars,
        points: user.points,
        completedGoals: user.completedGoals
    }));
    res.json(users);
});

// Update User Points
router.post('/updatePoints', isAuthenticated, isAdmin, (req, res) => {
    const { username, points } = req.body;
    const data = getData();
    const user = data.users.find(u => u.username === username);
    
    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    if (typeof points !== 'number' || isNaN(points)) {
        return res.status(400).json({ message: 'Points must be a valid number' });
    }

    user.points = points;
    saveData(data);
    res.json({ message: 'User points updated', points: user.points });
});

// Progress Bar
router.post('/progressBar', isAuthenticated, isAdmin, (req, res) => {
    const data = getData();
    if (data.currentBarIndex < data.bars.length - 1) {
        data.currentBarIndex += 1;

        // Assign new goals to users
        data.users.forEach(user => {
            const availableGoals = data.secondaryGoals.filter(goal => 
                !user.completedGoals.includes(goal.name)
            ).map(goal => goal.name);
            
            user.currentGoal = availableGoals.length > 0 
                ? availableGoals[Math.floor(Math.random() * availableGoals.length)]
                : null;
        });

        saveData(data);
        res.json({ message: `Progressed to next bar: ${data.bars[data.currentBarIndex].name}` });
    } else {
        res.json({ message: 'No more bars to progress to.' });
    }
});

module.exports = router;
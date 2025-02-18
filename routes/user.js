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

    const currentBar = data.bars[data.currentBarIndex]?.name || 'No more bars';
    const nextBar = data.bars[data.currentBarIndex + 1]?.name || 'No more bars';

    res.json({
        username: user.username,
        currentBar,
        nextBar,
        points: user.points,
        currentGoal: user.currentGoal,
        isAdmin: user.isAdmin,
        visitedBars: user.visitedBars
    });
});

// Update Bar Route
router.post('/updateBar', isAuthenticated, (req, res) => {
    const { bar, isChecked } = req.body;
    const data = getData();
    const user = data.users.find(u => u.username === req.session.username);
    
    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    const currentBar = data.bars[data.currentBarIndex].name;
    if (bar !== currentBar) {
        return res.status(400).json({ message: 'Can only update the current bar' });
    }

    if (isChecked && !user.visitedBars.includes(bar)) {
        user.visitedBars.push(bar);
        user.points += 1;
    } else if (!isChecked) {
        const index = user.visitedBars.indexOf(bar);
        if (index > -1) {
            user.visitedBars.splice(index, 1);
            user.points -= 1;
        }
    }

    saveData(data);
    res.json({ points: user.points });
});

// Complete Goal Route
router.post('/completeGoal', isAuthenticated, (req, res) => {
    const data = getData();
    const user = data.users.find(u => u.username === req.session.username);
    
    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    if (!user.currentGoal) {
        return res.status(400).json({ message: 'No current goal to complete' });
    }

    user.completedGoals.push(user.currentGoal);
    user.points += 1;
    user.currentGoal = null;
    saveData(data);
    res.json({ message: 'Goal completed successfully', points: user.points });
});

module.exports = router;
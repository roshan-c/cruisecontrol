const express = require('express');
const router = express.Router();
const { getData, saveData } = require('../models/db');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Event Management Routes
router.post('/events', isAuthenticated, isAdmin, (req, res) => {
    const { name, duration } = req.body;

    if (!name || !duration) {
        return res.status(400).json({ message: 'Missing required event details' });
    }

    const data = getData();
    const newEvent = {
        id: `event_${Date.now()}`,
        name,
        startTime: new Date().toISOString(),
        duration: duration * 60 * 1000, // Convert minutes to milliseconds
        status: 'active',
        participants: [],
        settings: {
            availableBars: data.bars.map(bar => bar.name),
            availableGoals: data.secondaryGoals.map(goal => goal.name)
        }
    };

    if (!data.events) {
        data.events = [];
    }
    data.events.push(newEvent);
    saveData(data);
    res.json({ message: 'Event created successfully', event: newEvent });
});

router.get('/events', isAuthenticated, isAdmin, (req, res) => {
    const data = getData();
    const events = data.events || [];
    res.json(events);
});

router.get('/events/:id', isAuthenticated, isAdmin, (req, res) => {
    const data = getData();
    const event = (data.events || []).find(e => e.id === req.params.id);
    
    if (!event) {
        return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
});

// Join Event
router.post('/events/:id/join', isAuthenticated, (req, res) => {
    const data = getData();
    const event = (data.events || []).find(e => e.id === req.params.id);
    
    if (!event) {
        return res.status(404).json({ message: 'Event not found' });
    }

    if (event.status !== 'active') {
        return res.status(400).json({ message: 'Cannot join a completed event' });
    }

    // Check if user is already a participant
    const existingParticipant = event.participants.find(p => p.username === req.session.username);
    if (existingParticipant) {
        return res.status(400).json({ message: 'Already joined this event' });
    }

    // Add user as a participant
    event.participants.push({
        username: req.session.username,
        points: 0,
        visitedBars: [],
        completedGoals: []
    });

    saveData(data);
    res.json({ message: 'Successfully joined event' });
});

// Update Event Progress
router.post('/events/:id/progress', isAuthenticated, (req, res) => {
    const { bar, goal } = req.body;
    const data = getData();
    const event = (data.events || []).find(e => e.id === req.params.id);
    
    if (!event) {
        return res.status(404).json({ message: 'Event not found' });
    }

    if (event.status !== 'active') {
        return res.status(400).json({ message: 'Cannot update progress for completed event' });
    }

    const participant = event.participants.find(p => p.username === req.session.username);
    if (!participant) {
        return res.status(400).json({ message: 'Not a participant in this event' });
    }

    let pointsEarned = 0;

    // Handle bar visit
    if (bar && event.settings.availableBars.includes(bar)) {
        if (!participant.visitedBars.includes(bar)) {
            participant.visitedBars.push(bar);
            pointsEarned += 10; // 10 points for visiting a new bar
        }
    }

    // Handle goal completion
    if (goal && event.settings.availableGoals.includes(goal)) {
        if (!participant.completedGoals.includes(goal)) {
            participant.completedGoals.push(goal);
            pointsEarned += 20; // 20 points for completing a goal
        }
    }

    participant.points += pointsEarned;
    saveData(data);

    res.json({
        message: 'Progress updated',
        pointsEarned,
        totalPoints: participant.points,
        visitedBars: participant.visitedBars,
        completedGoals: participant.completedGoals
    });
});

router.post('/events/:id/end', isAuthenticated, isAdmin, (req, res) => {
    const data = getData();
    const event = (data.events || []).find(e => e.id === req.params.id);
    
    if (!event) {
        return res.status(404).json({ message: 'Event not found' });
    }

    if (event.status === 'completed') {
        return res.status(400).json({ message: 'Event already completed' });
    }

    event.status = 'completed';
    event.endTime = new Date().toISOString();
    saveData(data);

    // Sort participants by points for rankings
    event.participants.sort((a, b) => b.points - a.points);
    
    res.json({ 
        message: 'Event ended successfully', 
        event,
        rankings: event.participants.map((p, index) => ({
            rank: index + 1,
            username: p.username,
            points: p.points
        }))
    });
});

router.get('/events/:id/results', isAuthenticated, isAdmin, (req, res) => {
    const data = getData();
    const event = (data.events || []).find(e => e.id === req.params.id);
    
    if (!event) {
        return res.status(404).json({ message: 'Event not found' });
    }

    const results = {
        eventName: event.name,
        status: event.status,
        startTime: event.startTime,
        endTime: event.endTime,
        participants: event.participants.sort((a, b) => b.points - a.points)
            .map((p, index) => ({
                rank: index + 1,
                username: p.username,
                points: p.points,
                visitedBars: p.visitedBars,
                completedGoals: p.completedGoals
            }))
    };

    res.json(results);
});

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

// Add new bar
router.post('/bars', isAuthenticated, isAdmin, (req, res) => {
    const { name } = req.body;
    
    if (!name) {
        return res.status(400).json({ message: 'Bar name is required' });
    }

    const data = getData();
    
    // Check if bar already exists
    if (data.bars.some(bar => bar.name === name)) {
        return res.status(400).json({ message: 'Bar already exists' });
    }

    // Add new bar to global list
    data.bars.push({ name });

    // Add new bar to all active events
    if (data.events) {
        data.events.forEach(event => {
            if (event.status === 'active' && !event.settings.availableBars.includes(name)) {
                event.settings.availableBars.push(name);
            }
        });
    }

    saveData(data);
    res.json({ 
        message: 'Bar added successfully',
        bar: name,
        activeEventsUpdated: data.events ? data.events.filter(e => e.status === 'active').length : 0
    });
});

// Add new challenge/goal
router.post('/goals', isAuthenticated, isAdmin, (req, res) => {
    const { name } = req.body;
    
    if (!name) {
        return res.status(400).json({ message: 'Goal name is required' });
    }

    const data = getData();
    
    // Check if goal already exists
    if (data.secondaryGoals.some(goal => goal.name === name)) {
        return res.status(400).json({ message: 'Goal already exists' });
    }

    // Add new goal to global list
    data.secondaryGoals.push({ name });

    // Add new goal to all active events
    if (data.events) {
        data.events.forEach(event => {
            if (event.status === 'active' && !event.settings.availableGoals.includes(name)) {
                event.settings.availableGoals.push(name);
            }
        });
    }

    saveData(data);
    res.json({ 
        message: 'Goal added successfully',
        goal: name,
        activeEventsUpdated: data.events ? data.events.filter(e => e.status === 'active').length : 0
    });
});

module.exports = router;

const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const dbPath = path.join(__dirname, 'db.json');

// Helper Functions
function getData() {
    if (!fs.existsSync(dbPath)) {
        const defaultData = {
            currentBarIndex: 0,
            users: [],
            bars: [
                "Bar 1",
                "Bar 2",
                "Bar 3",
                "Bar 4",
                "Bar 5",
                "Bar 6",
                "Bar 7",
                "Bar 8",
                "Bar 9",
                "Bar 10",
                "Bar 11",
                "Bar 12"
            ],
            secondaryGoals: [
                "Take a group photo",
                "Sing a karaoke song",
                "Get a bartender's signature",
                "Try a specialty cocktail",
                "Find a bar with live music",
                "Dance for at least 5 minutes",
                "Order a drink with an umbrella",
                "Wear a themed costume",
                "Exchange contact information with a stranger",
                "Participate in a bar trivia game"
            ]
        };
        fs.writeFileSync(dbPath, JSON.stringify(defaultData, null, 2));
    }
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    return data;
}

function saveData(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// Middleware to parse JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname));

// Session middleware
app.use(session({
    secret: 'your_secure_secret_key', // Replace with a strong, unique secret
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS in production
}));

// Authentication Middleware
function isAuthenticated(req, res, next) {
    if (req.session.username) {
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
}

function isAdmin(req, res, next) {
    if (req.session.isAdmin) {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: Admins only' });
    }
}

// Routes

// Signup Route
app.post('/signup', async (req, res) => {
    const { username, password, isAdmin } = req.body;
    console.log('Received signup attempt:', { username, isAdmin });

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    const data = getData();
    const existingUser = data.users.find(user => user.username === username);

    if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
    }

    try {
        const newUser = {
            username,
            password, // Store password as plain text (not recommended for production)
            isAdmin: isAdmin === 'true' || isAdmin === true,
            visitedBars: [],
            points: 0,
            currentGoal: null,        // Initialize currentGoal
            completedGoals: []        // Initialize completedGoals
        };
        data.users.push(newUser);
        saveData(data);
        console.log(`User '${username}' signed up successfully.`);
        res.json({ message: 'Signup successful' });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Login Route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Received login attempt:', { username, password });

    if (!username || !password) {
        console.log('Login failed: Missing username or password.');
        return res.status(400).json({ message: 'Username and password are required' });
    }

    const data = getData();
    const user = data.users.find(user => user.username === username);

    if (!user) {
        console.log(`Login failed: User '${username}' not found.`);
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    try {
        if (password === user.password) {
            req.session.username = username;
            req.session.isAdmin = user.isAdmin;
            console.log(`User '${username}' logged in successfully. Admin: ${user.isAdmin}`);
            return res.json({ message: 'Login successful', isAdmin: user.isAdmin });
        } else {
            console.log(`Login failed: Incorrect password for user '${username}'.`);
            return res.status(400).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Logout Route
app.post('/logout', isAuthenticated, (req, res) => {
    const username = req.session.username;
    req.session.destroy(err => {
        if (err) {
            console.error('Error during logout:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        console.log(`User '${username}' logged out.`);
        res.json({ message: 'Logout successful' });
    });
});

// Home Route
app.get('/home', isAuthenticated, (req, res) => {
    const data = getData();
    const user = data.users.find(u => u.username === req.session.username);
    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    const currentBar = data.bars[data.currentBarIndex] || 'No more bars';
    const nextBar = data.bars[data.currentBarIndex + 1] || 'No more bars';

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
app.post('/updateBar', isAuthenticated, (req, res) => {
    const { bar, isChecked } = req.body;
    console.log(`Received /updateBar request: bar='${bar}', isChecked=${isChecked}`);

    const data = getData();
    const user = data.users.find(u => u.username === req.session.username);
    if (!user) {
        console.log('Update failed: User not found.');
        return res.status(400).json({ message: 'User not found' });
    }

    // Ensure the bar being updated is the current bar
    const currentBar = data.bars[data.currentBarIndex];
    console.log(`Current Bar Index: ${data.currentBarIndex}, Current Bar: '${currentBar}'`);
    if (bar !== currentBar) {
        console.log(`Update failed: Provided bar '${bar}' does not match current bar '${currentBar}'.`);
        return res.status(400).json({ message: 'Can only update the current bar' });
    }

    if (isChecked) {
        if (!user.visitedBars.includes(bar)) {
            user.visitedBars.push(bar);
            user.points += 1; // Award 1 point for visiting a bar
            console.log(`Point added: ${user.username} now has ${user.points} points.`);
        } else {
            console.log(`No action taken: ${user.username} has already visited '${bar}'.`);
        }
    } else {
        const index = user.visitedBars.indexOf(bar);
        if (index > -1) {
            user.visitedBars.splice(index, 1);
            user.points -= 1; // Deduct point if unchecking
            console.log(`Point deducted: ${user.username} now has ${user.points} points.`);
        } else {
            console.log(`No action taken: ${user.username} had not visited '${bar}'.`);
        }
    }

    saveData(data);
    console.log('Update successful:', { username: user.username, points: user.points, visitedBars: user.visitedBars });
    res.json({ points: user.points });
});

// Complete Goal Route
app.post('/completeGoal', isAuthenticated, async (req, res) => {
    const data = getData();
    const user = data.users.find(u => u.username === req.session.username);
    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    if (!user.currentGoal) {
        return res.status(400).json({ message: 'No current goal to complete' });
    }

    try {
        // Add the current goal to completedGoals
        user.completedGoals.push(user.currentGoal);
        // Increment points
        user.points += 1;
        console.log(`User '${user.username}' completed goal '${user.currentGoal}'. Total points: ${user.points}`);
        // Reset currentGoal
        user.currentGoal = null;
        saveData(data);
        res.json({ message: 'Goal completed successfully', points: user.points });
    } catch (error) {
        console.error('Error completing goal:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Admin Routes

// Get All Users (Admin Only)
app.get('/admin/users', isAuthenticated, isAdmin, (req, res) => {
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

// Admin Update User Points (Admin Only)
app.post('/admin/updatePoints', isAuthenticated, isAdmin, (req, res) => {
    const { username, points } = req.body;
    console.log(`Admin request to update points: username='${username}', points=${points}`);

    const data = getData();
    const user = data.users.find(u => u.username === username);
    if (!user) {
        console.log(`Update failed: User '${username}' not found.`);
        return res.status(400).json({ message: 'User not found' });
    }

    if (typeof points !== 'number' || isNaN(points)) {
        console.log(`Update failed: Invalid points value '${points}'.`);
        return res.status(400).json({ message: 'Points must be a valid number' });
    }

    user.points = points;
    saveData(data);
    console.log(`User '${username}' points updated to ${points}.`);
    res.json({ message: 'User points updated', points: user.points });
});

// Admin Progress to Next Bar (Admin Only)
app.post('/admin/progressBar', isAuthenticated, isAdmin, (req, res) => {
    const data = getData();
    if (data.currentBarIndex < data.bars.length - 1) {
        data.currentBarIndex += 1;

        // Assign a new goal for each user
        data.users.forEach(user => {
            const availableGoals = data.secondaryGoals.filter(goal => !user.completedGoals.includes(goal));
            if (availableGoals.length > 0) {
                const randomGoal = availableGoals[Math.floor(Math.random() * availableGoals.length)];
                user.currentGoal = randomGoal;
                console.log(`Assigned new goal to '${user.username}': '${randomGoal}'`);
            } else {
                user.currentGoal = null; // No available goals
                console.log(`No available goals to assign to '${user.username}'.`);
            }
        });

        saveData(data);
        console.log(`Progressed to next bar. CurrentBarIndex is now ${data.currentBarIndex}.`);
        res.json({ message: `Progressed to next bar: ${data.bars[data.currentBarIndex]}` });
    } else {
        console.log('No more bars to progress to.');
        res.json({ message: 'No more bars to progress to.' });
    }
});

// Start the Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`CruiseControl server is running on http://localhost:${PORT}`);
});
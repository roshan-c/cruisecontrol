const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`HTTP server on port ${PORT}`);
});

/* Bonjour service
const { Bonjour } = require('bonjour-service');
const bonjour = new Bonjour();

bonjour.publish({
  name: 'CruiseControl',
  type: 'http',
  port: PORT,
})
*/

// Middleware
app.use(express.json());
// Force correct Content-Type for CSS
app.use((req, res, next) => {
  if (req.path.endsWith('.css')) {
    res.type('text/css');
  }
  next();
});

// Serve static files
app.use(express.static('public'));
app.use(session({
  secret: 'cruise-control-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
};

const requireAdmin = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const user = await db.get('SELECT is_admin FROM users WHERE id = ?', [req.session.userId]);
    if (user && user.is_admin) {
      next();
    } else {
      res.status(403).json({ error: 'Admin access required' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
};

// Helper to reload DB for each request (to get latest data)
function getDb() {
  // database.js exports a singleton, but we reload the file for latest data
  return require('./database');
}

// Replace all db.get, db.all, db.run usages with in-memory logic for JOINs/aggregates
// ---
// Register, Login, Logout, Get current user: (no change needed)
// ---

// Register user (username only)
app.post('/api/register', async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username required' });
  }
  try {
    const db = getDb();
    const users = await db.all('SELECT * FROM users');
    if (users.find(u => u.username === username)) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    const result = await db.run('INSERT INTO users (username) VALUES (?)', [username]);
    req.session.userId = result.id;
    req.session.username = username;
    res.json({ success: true, userId: result.id, username });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Login user (username only)
app.post('/api/login', async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username required' });
  }
  try {
    const db = getDb();
    const user = (await db.all('SELECT * FROM users')).find(u => u.username === username);
    if (user) {
      req.session.userId = user.id;
      req.session.username = user.username;
      res.json({ success: true, userId: user.id, username: user.username, isAdmin: user.is_admin });
    } else {
      res.status(400).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// Get current user
app.get('/api/user', requireAuth, async (req, res) => {
  try {
    const db = getDb();
    const user = (await db.all('SELECT * FROM users')).find(u => u.id === req.session.userId);
    if (user) {
      res.json({ id: user.id, username: user.username, is_admin: user.is_admin });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Get active events
app.get('/api/events', requireAuth, async (req, res) => {
  try {
    const db = getDb();
    const userId = req.session.userId;
    const events = await db.all('SELECT * FROM events WHERE ended_at IS NULL');
    const participants = await db.all('SELECT * FROM participants');
    const userParticipants = participants.filter(p => p.user_id === userId);
    const result = events.map(e => {
      const participant_count = participants.filter(p => p.event_id === e.id).length;
      const is_joined = userParticipants.some(p => p.event_id === e.id) ? 1 : 0;
      return { ...e, participant_count, is_joined };
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Join event
app.post('/api/events/:id/join', requireAuth, async (req, res) => {
  const eventId = Number(req.params.id);
  try {
    const db = getDb();
    const event = (await db.all('SELECT * FROM events WHERE ended_at IS NULL')).find(e => e.id === eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found or ended' });
    }
    const participants = await db.all('SELECT * FROM participants');
    if (participants.some(p => p.user_id === req.session.userId && p.event_id === eventId)) {
      return res.status(400).json({ error: 'Already joined this event' });
    }
    await db.run('INSERT INTO participants (user_id, event_id) VALUES (?, ?)', [req.session.userId, eventId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Get bars and goals
app.get('/api/bars', requireAuth, async (req, res) => {
  try {
    const db = getDb();
    const bars = await db.all('SELECT * FROM bars ORDER BY name');
    res.json(bars);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/goals', requireAuth, async (req, res) => {
  try {
    const db = getDb();
    const goals = await db.all('SELECT * FROM goals ORDER BY name');
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Get progress for event
app.get('/api/events/:id/progress', requireAuth, async (req, res) => {
  const eventId = Number(req.params.id);
  try {
    const db = getDb();
    const participants = await db.all('SELECT * FROM participants');
    const participant = participants.find(p => p.user_id === req.session.userId && p.event_id === eventId);
    if (!participant) {
      return res.status(404).json({ error: 'Not participating in this event' });
    }
    const progress = (await db.all('SELECT * FROM progress')).filter(pr => pr.participant_id === participant.id);
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Toggle progress (bar or goal)
app.post('/api/events/:id/progress', requireAuth, async (req, res) => {
  const eventId = Number(req.params.id);
  const { type, itemName } = req.body;
  if (!type || !itemName || !['bar', 'goal'].includes(type)) {
    return res.status(400).json({ error: 'Invalid type or itemName' });
  }
  try {
    const db = getDb();
    const participants = await db.all('SELECT * FROM participants');
    const participant = participants.find(p => p.user_id === req.session.userId && p.event_id === eventId);
    if (!participant) {
      return res.status(404).json({ error: 'Not participating in this event' });
    }
    const progress = await db.all('SELECT * FROM progress');
    const existing = progress.find(pr => pr.participant_id === participant.id && pr.type === type && pr.item_name === itemName);
    if (existing) {
      await db.run('DELETE FROM progress WHERE id = ?', [existing.id]);
      res.json({ success: true, action: 'removed' });
    } else {
      await db.run('INSERT INTO progress (participant_id, type, item_name) VALUES (?, ?, ?)', [participant.id, type, itemName]);
      res.json({ success: true, action: 'added' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Admin: Create event (no change needed except for ending all active events)
app.post('/api/admin/events', requireAdmin, async (req, res) => {
  const { name, durationMinutes } = req.body;
  if (!name || !durationMinutes) {
    return res.status(400).json({ error: 'Name and duration required' });
  }
  try {
    const db = getDb();
    // End all active events
    const events = await db.all('SELECT * FROM events');
    for (const event of events) {
      if (!event.ended_at) {
        await db.run('UPDATE events SET ended_at = ? WHERE id = ?', [new Date().toISOString(), event.id]);
      }
    }
    const result = await db.run('INSERT INTO events (name, duration_minutes) VALUES (?, ?)', [name, durationMinutes]);
    res.json({ success: true, eventId: result.id });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Admin: End event
app.post('/api/admin/events/:id/end', requireAdmin, async (req, res) => {
  const eventId = Number(req.params.id);
  try {
    const db = getDb();
    const events = await db.all('SELECT * FROM events');
    const event = events.find(e => e.id === eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    event.ended_at = new Date().toISOString();
    db._save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Admin: Get event results (leaderboard)
app.get('/api/admin/results/:id', requireAdmin, async (req, res) => {
  const eventId = Number(req.params.id);
  try {
    const db = getDb();
    const participants = (await db.all('SELECT * FROM participants')).filter(p => p.event_id === eventId);
    const users = await db.all('SELECT * FROM users');
    const progress = await db.all('SELECT * FROM progress');
    const results = participants.map(p => {
      const user = users.find(u => u.id === p.user_id);
      const userProgress = progress.filter(pr => pr.participant_id === p.id);
      const bars_completed = userProgress.filter(pr => pr.type === 'bar').length;
      const goals_completed = userProgress.filter(pr => pr.type === 'goal').length;
      const points = (bars_completed + goals_completed) * 10;
      return {
        username: user ? user.username : 'Unknown',
        points,
        bars_completed,
        goals_completed
      };
    });
    results.sort((a, b) => b.points - a.points || a.username.localeCompare(b.username));
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Get event results (for all users)
app.get('/api/events/:id/results', requireAuth, async (req, res) => {
  const eventId = Number(req.params.id);
  try {
    const db = getDb();
    const participants = (await db.all('SELECT * FROM participants')).filter(p => p.event_id === eventId);
    const users = await db.all('SELECT * FROM users');
    const progress = await db.all('SELECT * FROM progress');
    const results = participants.map(p => {
      const user = users.find(u => u.id === p.user_id);
      const userProgress = progress.filter(pr => pr.participant_id === p.id);
      const bars_completed = userProgress.filter(pr => pr.type === 'bar').length;
      const goals_completed = userProgress.filter(pr => pr.type === 'goal').length;
      const points = (bars_completed + goals_completed) * 10;
      return {
        username: user ? user.username : 'Unknown',
        points,
        bars_completed,
        goals_completed
      };
    });
    results.sort((a, b) => b.points - a.points || a.username.localeCompare(b.username));
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
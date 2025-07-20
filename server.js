const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
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

// Routes

// Register user (username only)
app.post('/api/register', async (req, res) => {
  const { username } = req.body;
  
  if (!username) {
    return res.status(400).json({ error: 'Username required' });
  }

  try {
    const result = await db.run('INSERT INTO users (username) VALUES (?)', [username]);
    req.session.userId = result.id;
    req.session.username = username;
    res.json({ success: true, userId: result.id, username });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      res.status(400).json({ error: 'Username already exists' });
    } else {
      res.status(500).json({ error: 'Database error' });
    }
  }
});

// Login user (username only)
app.post('/api/login', async (req, res) => {
  const { username } = req.body;
  
  if (!username) {
    return res.status(400).json({ error: 'Username required' });
  }

  try {
    const user = await db.get('SELECT id, username, is_admin FROM users WHERE username = ?', [username]);
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
  req.session.destroy();
  res.json({ success: true });
});

// Get current user
app.get('/api/user', requireAuth, async (req, res) => {
  try {
    const user = await db.get('SELECT id, username, is_admin FROM users WHERE id = ?', [req.session.userId]);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Get active events
app.get('/api/events', requireAuth, async (req, res) => {
  try {
    const events = await db.all(`
      SELECT e.*, 
             COUNT(p.id) as participant_count,
             CASE WHEN p2.user_id IS NOT NULL THEN 1 ELSE 0 END as is_joined
      FROM events e
      LEFT JOIN participants p ON e.id = p.event_id
      LEFT JOIN participants p2 ON e.id = p2.event_id AND p2.user_id = ?
      WHERE e.ended_at IS NULL
      GROUP BY e.id
    `, [req.session.userId]);
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Join event
app.post('/api/events/:id/join', requireAuth, async (req, res) => {
  const eventId = req.params.id;
  
  try {
    // Check if event exists and is active
    const event = await db.get('SELECT * FROM events WHERE id = ? AND ended_at IS NULL', [eventId]);
    if (!event) {
      return res.status(404).json({ error: 'Event not found or ended' });
    }

    // Check if already joined
    const existing = await db.get('SELECT * FROM participants WHERE user_id = ? AND event_id = ?', [req.session.userId, eventId]);
    if (existing) {
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
    const bars = await db.all('SELECT * FROM bars ORDER BY name');
    res.json(bars);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/goals', requireAuth, async (req, res) => {
  try {
    const goals = await db.all('SELECT * FROM goals ORDER BY name');
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Get progress for event
app.get('/api/events/:id/progress', requireAuth, async (req, res) => {
  const eventId = req.params.id;
  
  try {
    const participant = await db.get('SELECT id FROM participants WHERE user_id = ? AND event_id = ?', [req.session.userId, eventId]);
    if (!participant) {
      return res.status(404).json({ error: 'Not participating in this event' });
    }

    const progress = await db.all('SELECT * FROM progress WHERE participant_id = ?', [participant.id]);
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Toggle progress (bar or goal)
app.post('/api/events/:id/progress', requireAuth, async (req, res) => {
  const eventId = req.params.id;
  const { type, itemName } = req.body;
  
  if (!type || !itemName || !['bar', 'goal'].includes(type)) {
    return res.status(400).json({ error: 'Invalid type or itemName' });
  }

  try {
    const participant = await db.get('SELECT id FROM participants WHERE user_id = ? AND event_id = ?', [req.session.userId, eventId]);
    if (!participant) {
      return res.status(404).json({ error: 'Not participating in this event' });
    }

    // Check if already completed
    const existing = await db.get('SELECT * FROM progress WHERE participant_id = ? AND type = ? AND item_name = ?', [participant.id, type, itemName]);
    
    if (existing) {
      // Remove progress (unchecking)
      await db.run('DELETE FROM progress WHERE id = ?', [existing.id]);
      res.json({ success: true, action: 'removed' });
    } else {
      // Add progress (checking)
      await db.run('INSERT INTO progress (participant_id, type, item_name) VALUES (?, ?, ?)', [participant.id, type, itemName]);
      res.json({ success: true, action: 'added' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Admin: Create event
app.post('/api/admin/events', requireAdmin, async (req, res) => {
  const { name, durationMinutes } = req.body;
  
  if (!name || !durationMinutes) {
    return res.status(400).json({ error: 'Name and duration required' });
  }

  try {
    // End any existing active events (MVP: one active event max)
    await db.run('UPDATE events SET ended_at = CURRENT_TIMESTAMP WHERE ended_at IS NULL');
    
    const result = await db.run('INSERT INTO events (name, duration_minutes) VALUES (?, ?)', [name, durationMinutes]);
    res.json({ success: true, eventId: result.id });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Admin: End event
app.post('/api/admin/events/:id/end', requireAdmin, async (req, res) => {
  const eventId = req.params.id;
  
  try {
    await db.run('UPDATE events SET ended_at = CURRENT_TIMESTAMP WHERE id = ?', [eventId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Admin: Get event results
app.get('/api/admin/results/:id', requireAdmin, async (req, res) => {
  const eventId = req.params.id;
  
  try {
    const results = await db.all(`
      SELECT u.username, 
             COUNT(pr.id) * 10 as points,
             COUNT(CASE WHEN pr.type = 'bar' THEN 1 END) as bars_completed,
             COUNT(CASE WHEN pr.type = 'goal' THEN 1 END) as goals_completed
      FROM participants p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN progress pr ON p.id = pr.participant_id
      WHERE p.event_id = ?
      GROUP BY p.id, u.username
      ORDER BY points DESC, u.username
    `, [eventId]);
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Get event results (for all users)
app.get('/api/events/:id/results', requireAuth, async (req, res) => {
  const eventId = req.params.id;
  
  try {
    const results = await db.all(`
      SELECT u.username, 
             COUNT(pr.id) * 10 as points,
             COUNT(CASE WHEN pr.type = 'bar' THEN 1 END) as bars_completed,
             COUNT(CASE WHEN pr.type = 'goal' THEN 1 END) as goals_completed
      FROM participants p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN progress pr ON p.id = pr.participant_id
      WHERE p.event_id = ?
      GROUP BY p.id, u.username
      ORDER BY points DESC, u.username
    `, [eventId]);
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`CruiseControl server running on http://0.0.0.0:${PORT}`);
  console.log(`Share this IP with your friends: http://[YOUR_PHONE_IP]:${PORT}`);
});
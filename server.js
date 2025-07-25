/* prettier-ignore */ /* eslint-disable */
const express     = require('express');
const compression = require('compression');    // npm i compression
const session     = require('express-session');
const path        = require('path');
const db          = require('./database');

const app  = express();
const PORT = process.env.PORT || 3000;

/* ─────────────────  CORE MIDDLEWARE STACK  ───────────────── */

app.use(express.json());          // body-parser
app.use(compression());           // gzip / deflate
app.use(express.static(path.join(__dirname, 'public'))); // css, js, img…

app.use(
  session({
    secret: 'cruise-control-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1_000 } // 24 h
  })
);

/* ──────────────────────  AUTH HELPERS  ───────────────────── */

const requireAuth = (req, res, next) =>
  req.session.userId
    ? next()
    : res.status(401).json({ error: 'Authentication required' });

const requireAdmin = async (req, res, next) => {
  if (!req.session.userId)
    return res.status(401).json({ error: 'Authentication required' });
  try {
    const user = await db.get(
      'SELECT is_admin FROM users WHERE id = ?',
      req.session.userId
    );
    return user && user.is_admin
      ? next()
      : res.status(403).json({ error: 'Admin access required' });
  } catch {
    return res.status(500).json({ error: 'Database error' });
  }
};

/* helper: always re-require database.js so in-memory data stays fresh */
const getDb = () => require('./database');

/* ────────────────────────  API ROUTES  ───────────────────── */

/* Register */
app.post('/api/register', async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });
  try {
    const db = getDb();
    const exists = (await db.all('SELECT * FROM users')).some(
      (u) => u.username === username
    );
    if (exists) return res.status(400).json({ error: 'Username already exists' });

    const result = await db.run(
      'INSERT INTO users (username) VALUES (?)',
      username
    );
    req.session.userId = result.id;
    req.session.username = username;

    return res.json({ success: true, userId: result.id, username });
  } catch {
    return res.status(500).json({ error: 'Database error' });
  }
});

/* Login */
app.post('/api/login', async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });
  try {
    const db = getDb();
    const user = (await db.all('SELECT * FROM users')).find(
      (u) => u.username === username
    );
    if (!user) return res.status(400).json({ error: 'User not found' });

    req.session.userId = user.id;
    req.session.username = user.username;

    return res.json({
      success: true,
      userId: user.id,
      username: user.username,
      isAdmin: user.is_admin
    });
  } catch {
    return res.status(500).json({ error: 'Database error' });
  }
});

/* Logout */
app.post('/api/logout', (req, res) =>
  req.session.destroy(() => res.json({ success: true }))
);

/* Current user */
app.get('/api/user', requireAuth, async (req, res) => {
  try {
    const db = getDb();
    const user = (await db.all('SELECT * FROM users')).find(
      (u) => u.id === req.session.userId
    );
    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.json({
      id: user.id,
      username: user.username,
      is_admin: user.is_admin
    });
  } catch {
    return res.status(500).json({ error: 'Database error' });
  }
});

/* Active events list */
app.get('/api/events', requireAuth, async (req, res) => {
  try {
    const db = getDb();
    const events = await db.all('SELECT * FROM events WHERE ended_at IS NULL');
    const participants = await db.all('SELECT * FROM participants');

    const result = events.map((e) => {
      const participant_count = participants.filter(
        (p) => p.event_id === e.id
      ).length;
      const is_joined = participants.some(
        (p) => p.user_id === req.session.userId && p.event_id === e.id
      )
        ? 1
        : 0;
      return { ...e, participant_count, is_joined };
    });

    return res.json(result);
  } catch {
    return res.status(500).json({ error: 'Database error' });
  }
});

/* Join event */
app.post('/api/events/:id/join', requireAuth, async (req, res) => {
  const eventId = Number(req.params.id);
  try {
    const db = getDb();
    const event = (
      await db.all('SELECT * FROM events WHERE ended_at IS NULL')
    ).find((e) => e.id === eventId);
    if (!event)
      return res.status(404).json({ error: 'Event not found or ended' });

    const participants = await db.all('SELECT * FROM participants');
    const duplicate = participants.some(
      (p) => p.user_id === req.session.userId && p.event_id === eventId
    );
    if (duplicate)
      return res.status(400).json({ error: 'Already joined this event' });

    await db.run(
      'INSERT INTO participants (user_id, event_id) VALUES (?, ?)',
      req.session.userId,
      eventId
    );
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: 'Database error' });
  }
});

/* Bars & goals catalog */
app.get('/api/bars', requireAuth, async (_req, res) => {
  try {
    const bars = await getDb().all('SELECT * FROM bars ORDER BY name');
    return res.json(bars);
  } catch {
    return res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/goals', requireAuth, async (_req, res) => {
  try {
    const goals = await getDb().all('SELECT * FROM goals ORDER BY name');
    return res.json(goals);
  } catch {
    return res.status(500).json({ error: 'Database error' });
  }
});

/* Progress */
app.get('/api/events/:id/progress', requireAuth, async (req, res) => {
  const eventId = Number(req.params.id);
  try {
    const db = getDb();
    const participants = await db.all('SELECT * FROM participants');
    const participant = participants.find(
      (p) => p.user_id === req.session.userId && p.event_id === eventId
    );
    if (!participant)
      return res.status(404).json({ error: 'Not participating in event' });

    const progress = (await db.all('SELECT * FROM progress')).filter(
      (pr) => pr.participant_id === participant.id
    );
    return res.json(progress);
  } catch {
    return res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/events/:id/progress', requireAuth, async (req, res) => {
  const eventId = Number(req.params.id);
  const { type, itemName } = req.body;
  if (!type || !itemName || !['bar', 'goal'].includes(type))
    return res.status(400).json({ error: 'Invalid type or itemName' });

  try {
    const db = getDb();
    const participants = await db.all('SELECT * FROM participants');
    const participant = participants.find(
      (p) => p.user_id === req.session.userId && p.event_id === eventId
    );
    if (!participant)
      return res.status(404).json({ error: 'Not participating in event' });

    const progress = await db.all('SELECT * FROM progress');
    const existing = progress.find(
      (pr) =>
        pr.participant_id === participant.id &&
        pr.type === type &&
        pr.item_name === itemName
    );

    if (existing) {
      await db.run('DELETE FROM progress WHERE id = ?', existing.id);
      return res.json({ success: true, action: 'removed' });
    }
    await db.run(
      'INSERT INTO progress (participant_id, type, item_name) VALUES (?, ?, ?)',
      participant.id,
      type,
      itemName
    );
    return res.json({ success: true, action: 'added' });
  } catch {
    return res.status(500).json({ error: 'Database error' });
  }
});

/* Admin: create event */
app.post('/api/admin/events', requireAdmin, async (req, res) => {
  const { name, durationMinutes } = req.body;
  if (!name || !durationMinutes)
    return res.status(400).json({ error: 'Name and duration required' });

  try {
    const db = getDb();
    /* end all running events */
    const events = await db.all('SELECT * FROM events');
    await Promise.all(
      events
        .filter((e) => !e.ended_at)
        .map((e) =>
          db.run('UPDATE events SET ended_at = ? WHERE id = ?', new Date(), e.id)
        )
    );
    const result = await db.run(
      'INSERT INTO events (name, duration_minutes) VALUES (?, ?)',
      name,
      durationMinutes
    );
    return res.json({ success: true, eventId: result.id });
  } catch {
    return res.status(500).json({ error: 'Database error' });
  }
});

/* Admin: end event */
app.post('/api/admin/events/:id/end', requireAdmin, async (req, res) => {
  const eventId = Number(req.params.id);
  try {
    const db = getDb();
    const event = (await db.all('SELECT * FROM events')).find(
      (e) => e.id === eventId
    );
    if (!event) return res.status(404).json({ error: 'Event not found' });
    await db.run('UPDATE events SET ended_at = ? WHERE id = ?', new Date(), eventId);
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: 'Database error' });
  }
});

/* Results helper */
const buildResults = (participants, users, progress) =>
  participants
    .map((p) => {
      const user = users.find((u) => u.id === p.user_id) || {
        username: 'Unknown'
      };
      const userProgress = progress.filter((pr) => pr.participant_id === p.id);
      const bars = userProgress.filter((pr) => pr.type === 'bar').length;
      const goals = userProgress.filter((pr) => pr.type === 'goal').length;
      const points = (bars + goals) * 10;
      return { username: user.username, points, bars_completed: bars, goals_completed: goals };
    })
    .sort((a, b) => b.points - a.points || a.username.localeCompare(b.username));

/* Admin leaderboard */
app.get('/api/admin/results/:id', requireAdmin, async (req, res) => {
  const eventId = Number(req.params.id);
  try {
    const db = getDb();
    const participants = (
      await db.all('SELECT * FROM participants')
    ).filter((p) => p.event_id === eventId);
    const users = await db.all('SELECT * FROM users');
    const progress = await db.all('SELECT * FROM progress');
    return res.json(buildResults(participants, users, progress));
  } catch {
    return res.status(500).json({ error: 'Database error' });
  }
});

/* User leaderboard */
app.get('/api/events/:id/results', requireAuth, async (req, res) => {
  const eventId = Number(req.params.id);
  try {
    const db = getDb();
    const participants = (
      await db.all('SELECT * FROM participants')
    ).filter((p) => p.event_id === eventId);
    const users = await db.all('SELECT * FROM users');
    const progress = await db.all('SELECT * FROM progress');
    return res.json(buildResults(participants, users, progress));
  } catch {
    return res.status(500).json({ error: 'Database error' });
  }
});

/* ─────────────────────  HTML ENTRYPOINT  ───────────────────── */

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* ───────────────────  START THE HTTP SERVER  ───────────────── */

app.listen(PORT, () => console.log(`HTTP server listening on ${PORT}`));
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.db = new sqlite3.Database(path.join(__dirname, 'cruise.db'));
    this.init();
  }

  init() {
    this.db.serialize(() => {
      // Users table
      this.db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        points INTEGER DEFAULT 0,
        is_admin BOOLEAN DEFAULT 0
      )`);

      // Events table
      this.db.run(`CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        duration_minutes INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        ended_at DATETIME
      )`);

      // Participants table
      this.db.run(`CREATE TABLE IF NOT EXISTS participants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id),
        event_id INTEGER REFERENCES events(id),
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Progress table
      this.db.run(`CREATE TABLE IF NOT EXISTS progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        participant_id INTEGER REFERENCES participants(id),
        type TEXT CHECK(type IN ('bar','goal')),
        item_name TEXT,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Bars table
      this.db.run(`CREATE TABLE IF NOT EXISTS bars (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      )`);

      // Goals table
      this.db.run(`CREATE TABLE IF NOT EXISTS goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      )`);

      // Insert admin user if not exists
      this.db.run(`INSERT OR IGNORE INTO users (username, is_admin) VALUES ('admin', 1)`);
    });
  }

  // Promisify database operations
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

module.exports = new Database();
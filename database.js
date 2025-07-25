const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db.json');

// Initial structure for the JSON database
const INITIAL_DB = {
  users: [
    { id: 1, username: 'admin', points: 0, is_admin: true }
  ],
  events: [],
  participants: [],
  progress: [],
  bars: [],
  goals: []
};

class Database {
  constructor() {
    this._ensureDbFile();
    this._load();
    this._nextIds = this._computeNextIds();
  }

  _ensureDbFile() {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(INITIAL_DB, null, 2));
    }
  }

  _load() {
    this.db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  }

  _save() {
    fs.writeFileSync(DB_PATH, JSON.stringify(this.db, null, 2));
  }

  _computeNextIds() {
    // Find the next ID for each table
    const nextIds = {};
    for (const key of Object.keys(INITIAL_DB)) {
      const arr = this.db[key] || [];
      nextIds[key] = arr.length > 0 ? Math.max(...arr.map(x => x.id || 0)) + 1 : 1;
    }
    return nextIds;
  }

  // Simulate SQL SELECT ... WHERE ... LIMIT 1
  async get(sql, params = []) {
    this._load();
    const { table, where } = this._parseSql(sql, params);
    const row = (this.db[table] || []).find(where);
    return row ? { ...row } : undefined;
  }

  // Simulate SQL SELECT ...
  async all(sql, params = []) {
    this._load();
    const { table, where, orderBy } = this._parseSql(sql, params);
    let rows = (this.db[table] || []).filter(where);
    if (orderBy) {
      rows = rows.sort((a, b) => {
        if (a[orderBy] < b[orderBy]) return -1;
        if (a[orderBy] > b[orderBy]) return 1;
        return 0;
      });
    }
    return rows.map(row => ({ ...row }));
  }

  // Simulate SQL INSERT, UPDATE, DELETE
  async run(sql, params = []) {
    this._load();
    const { table, action, where, set, insertValues } = this._parseSql(sql, params);
    let result = { id: null, changes: 0 };
    if (action === 'insert') {
      const newRow = { id: this._nextIds[table]++, ...insertValues };
      this.db[table].push(newRow);
      result.id = newRow.id;
      result.changes = 1;
    } else if (action === 'update') {
      let changes = 0;
      for (let row of this.db[table]) {
        if (where(row)) {
          Object.assign(row, set);
          changes++;
        }
      }
      result.changes = changes;
    } else if (action === 'delete') {
      const before = this.db[table].length;
      this.db[table] = this.db[table].filter(row => !where(row));
      result.changes = before - this.db[table].length;
    }
    this._save();
    return result;
  }

  // No-op for JSON
  async close() {
    return;
  }

  // --- SQL parser helpers ---
  _parseSql(sql, params) {
    // This is a minimal parser for the specific queries used in this app
    sql = sql.trim();
    const lower = sql.toLowerCase();
    if (lower.startsWith('select')) {
      // SELECT ... FROM table WHERE ... ORDER BY ...
      const table = sql.match(/from\s+(\w+)/i)[1];
      let where = () => true;
      let orderBy = null;
      if (/where/i.test(sql)) {
        const whereClause = sql.split(/where/i)[1].split(/order by/i)[0].trim();
        where = this._buildWhere(whereClause, params);
      }
      if (/order by/i.test(sql)) {
        orderBy = sql.split(/order by/i)[1].trim().split(/\s+/)[0];
      }
      return { table, where, orderBy };
    } else if (lower.startsWith('insert')) {
      // INSERT INTO table (col1, col2) VALUES (?, ?)
      const table = sql.match(/into\s+(\w+)/i)[1];
      const cols = sql.match(/\(([^)]+)\)/)[1].split(',').map(s => s.trim());
      const insertValues = {};
      cols.forEach((col, i) => {
        insertValues[col] = params[i];
      });
      return { table, action: 'insert', insertValues };
    } else if (lower.startsWith('update')) {
      // UPDATE table SET col1 = ? WHERE ...
      const table = sql.match(/update\s+(\w+)/i)[1];
      const setClause = sql.match(/set\s+([^w]+)where/i)[1].trim();
      const set = this._buildSet(setClause, params);
      const whereClause = sql.split(/where/i)[1].trim();
      const where = this._buildWhere(whereClause, params.slice(Object.keys(set).length));
      return { table, action: 'update', set, where };
    } else if (lower.startsWith('delete')) {
      // DELETE FROM table WHERE ...
      const table = sql.match(/from\s+(\w+)/i)[1];
      const whereClause = sql.split(/where/i)[1].trim();
      const where = this._buildWhere(whereClause, params);
      return { table, action: 'delete', where };
    }
    throw new Error('Unsupported SQL: ' + sql);
  }

  _buildWhere(whereClause, params) {
    // Only supports simple equality and IN checks
    if (!whereClause) return () => true;
    let idx = 0;
    if (/in \(/i.test(whereClause)) {
      // e.g. type IN ("bar", "goal")
      const [col, inVals] = whereClause.match(/(\w+) in \(([^)]+)\)/i).slice(1, 3);
      const values = inVals.split(',').map(s => s.replace(/['"]/g, '').trim());
      return row => values.includes(row[col]);
    } else if (/=/.test(whereClause)) {
      // e.g. id = ? AND type = ?
      const conditions = whereClause.split(/and/i).map(s => s.trim());
      return row => conditions.every(cond => {
        const [col, op, val] = cond.split(/\s*=\s*/);
        const param = params[idx++];
        return row[col] == param;
      });
    }
    return () => true;
  }

  _buildSet(setClause, params) {
    // e.g. col1 = ?, col2 = ?
    const set = {};
    const assignments = setClause.split(',').map(s => s.trim());
    assignments.forEach((assign, i) => {
      const [col] = assign.split('=');
      set[col.trim()] = params[i];
    });
    return set;
  }
}

module.exports = new Database();
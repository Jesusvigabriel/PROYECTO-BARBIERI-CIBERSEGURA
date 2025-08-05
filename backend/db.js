const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('database.sqlite');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_id INTEGER,
    text TEXT,
    FOREIGN KEY(template_id) REFERENCES templates(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER,
    text TEXT,
    is_correct INTEGER,
    FOREIGN KEY(question_id) REFERENCES questions(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER,
    question_id INTEGER,
    option_id INTEGER,
    FOREIGN KEY(player_id) REFERENCES players(id),
    FOREIGN KEY(question_id) REFERENCES questions(id),
    FOREIGN KEY(option_id) REFERENCES options(id)
  )`);

  const password = bcrypt.hashSync('admin', 10);
  db.run('INSERT OR IGNORE INTO admin (username, password) VALUES (?, ?)', ['admin', password]);
});

module.exports = db;

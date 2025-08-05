const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false
}));

function isAdmin(req, res, next) {
  if (req.session && req.session.admin) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing credentials' });
  }
  db.get('SELECT password FROM admin WHERE username = ?', [username], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    bcrypt.compare(password, row.password, (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Server error' });
      }
      if (!result) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      req.session.admin = true;
      res.json({ message: 'Login successful' });
    });
  });
});

app.get('/api/admin', isAdmin, (req, res) => {
  res.json({ message: 'Admin access granted' });
});

app.get('/', (req, res) => {
  res.send('Server running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bcrypt = require('bcrypt');
const path = require('path');
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

app.post('/api/player', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Missing name' });
  }
  db.run('INSERT INTO players (username) VALUES (?)', [name], function (err) {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT') {
        return res.status(409).json({ error: 'Player already exists' });
      }
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(201).json({ id: this.lastID, name });
  });
});

app.get('/api/players', isAdmin, (req, res) => {
  db.all('SELECT id, username AS name FROM players', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.delete('/api/players', isAdmin, (req, res) => {
  db.run('DELETE FROM players', err => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Players deleted' });
  });
});

app.post('/api/templates', isAdmin, (req, res) => {
  const { name, questions } = req.body;
  if (!name || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'Invalid template data' });
  }

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    db.run('INSERT INTO templates (name) VALUES (?)', [name], function (err) {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).json({ error: 'Database error' });
      }
      const templateId = this.lastID;
      let qIndex = 0;

      function insertNextQuestion() {
        if (qIndex >= questions.length) {
          db.run('COMMIT');
          return res.status(201).json({ id: templateId, name });
        }

        const q = questions[qIndex];
        if (!q.text || !q.image_url || !Array.isArray(q.options)) {
          db.run('ROLLBACK');
          return res.status(400).json({ error: 'Invalid question data' });
        }

        db.run(
          'INSERT INTO questions (template_id, text, image_url) VALUES (?, ?, ?)',
          [templateId, q.text, q.image_url],
          function (err) {
            if (err) {
              db.run('ROLLBACK');
              return res.status(500).json({ error: 'Database error' });
            }
            const questionId = this.lastID;
            let oIndex = 0;

            function insertNextOption() {
              if (oIndex >= q.options.length) {
                qIndex++;
                return insertNextQuestion();
              }

              const opt = q.options[oIndex];
              if (!opt.text || typeof opt.is_correct !== 'boolean') {
                db.run('ROLLBACK');
                return res.status(400).json({ error: 'Invalid option data' });
              }

              db.run(
                'INSERT INTO options (question_id, text, is_correct) VALUES (?, ?, ?)',
                [questionId, opt.text, opt.is_correct ? 1 : 0],
                err => {
                  if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: 'Database error' });
                  }
                  oIndex++;
                  insertNextOption();
                }
              );
            }

            insertNextOption();
          }
        );
      }

  insertNextQuestion();
    });
  });
});

app.post('/api/responses', (req, res) => {
  const { player_id, question_id, is_correct } = req.body;
  if (!player_id || !question_id || typeof is_correct !== 'boolean') {
    return res.status(400).json({ error: 'Invalid response data' });
  }

  db.run(
    'INSERT INTO responses (player_id, question_id, is_correct) VALUES (?, ?, ?)',
    [player_id, question_id, is_correct ? 1 : 0],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res
        .status(201)
        .json({ id: this.lastID, player_id, question_id, is_correct });
    }
  );
});

app.get('/api/report/top-players', isAdmin, (req, res) => {
  const sql = `
    SELECT p.id, p.username AS name, COALESCE(SUM(r.is_correct), 0) AS correct_answers
    FROM players p
    LEFT JOIN responses r ON p.id = r.player_id
    GROUP BY p.id
    ORDER BY correct_answers DESC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.get('/api/report/questions', isAdmin, (req, res) => {
  const sql = `
    SELECT q.id, q.text, COUNT(r.id) AS total_responses,
           COALESCE(SUM(r.is_correct), 0) AS correct_responses
    FROM questions q
    LEFT JOIN responses r ON q.id = r.question_id
    GROUP BY q.id
    ORDER BY q.id
  `;
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.get('/api/admin', isAdmin, (req, res) => {
  res.json({ message: 'Admin access granted' });
});

const distPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

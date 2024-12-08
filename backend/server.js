const express = require('express');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL');
  }
});

// Helper function to generate JWT token
function generateToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
}

// Routes

// 1. User Signup
app.post('/api/signup', (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  db.query(
    'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
    [username, email, hashedPassword],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error during signup' });
      }
      const token = generateToken({ id: result.insertId, username });
      res.json({ token });
    }
  );
});

// 2. User Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err || results.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = results[0];
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.json({ token });
  });
});

// 3. Search Weather
app.post('/api/search-weather', (req, res) => {
  const { city, token } = req.body;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Unauthorized' });

    const userId = decoded.id;

    axios
      .get(`http://api.weatherstack.com/current?access_key=${process.env.WEATHER_API_KEY}&query=${city}`)
      .then((response) => {
        const { temperature, weather_descriptions } = response.data.current;
        const description = weather_descriptions.join(', ');

        db.query(
          'INSERT INTO searches (user_id, city, temperature, description) VALUES (?, ?, ?, ?)',
          [userId, city, temperature, description],
          (err) => {
            if (err) return res.status(500).json({ message: 'Error saving weather search' });

            res.json({ city, temperature, description });
          }
        );
      })
      .catch(() => res.status(500).json({ message: 'Error fetching weather data' }));
  });
});

// 4. Get Search Report
app.get('/api/search-report', (req, res) => {
  db.query(
    `
    SELECT u.username, s.city, s.temperature, s.description, s.created_at 
    FROM searches s
    JOIN users u ON s.user_id = u.id
    ORDER BY s.created_at DESC
  `,
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Error fetching search report' });
      res.json(results);
    }
  );
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');
const wasteRoutes = require('./routes/wasteRoutes');
const Classification = require('./models/Classification');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/miniproject';

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ DB ERROR:', err.message));

// --- NEW UI ROUTES ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/signup', (req, res) => res.sendFile(path.join(__dirname, 'public', 'signup.html')));

// --- MAIN DASHBOARD ROUTE ---
app.get('/main_app_page', async (req, res) => {
  try {
    const username = req.query.username || '';
    const total = await Classification.countDocuments({ username });
    res.render('mainpage', {
      user: { username },
      mapsKey: process.env.GOOGLE_MAPS_API_KEY || '',
      stats: { total, accuracy: '95%', centers: 12, satisfaction: '98%' }
    });
  } catch (err) {
    res.status(500).send('Error loading dashboard.');
  }
});

// --- API ROUTES ---
app.use('/', authRoutes);
app.use('/api/waste', wasteRoutes);

app.listen(PORT, () => console.log(`🚀 Node Server running on port ${PORT}`));

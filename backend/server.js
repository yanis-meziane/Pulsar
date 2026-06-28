const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const PORT = 3001;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,       
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

pool.connect((err, client, release) => {
  if (err) {
    console.log('Erreur de connexion à la Base de Données :', err);
  } else {
    console.log('Connexion avec la Base de données établie !');
    release();
  }
});

const checkAdminRole = async (req, res, next) => {
  const userId = req.body.userId;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
  }

  try {
    const userCheck = await pool.query('SELECT user_role FROM users WHERE user_id = $1', [userId]);

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
    }
    if (userCheck.rows[0].role.trim() !== 'admin') {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }
    next();
  } catch (error) {
    console.error('Erreur middleware checkAdminRole:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

app.get('/api/test', (req, res) => {
  res.json({ message: 'API fonctionne correctement' });
});

app.post('/api/register', async (req, res) => {
  const { firstname, lastname, mail, mdp } = req.body;

  try {
    const checkUser = await pool.query('SELECT * FROM users WHERE mail = $1', [mail]);

    if (checkUser.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Ce mail est déjà utilisé' });
    }

    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const role = parseInt(userCount.rows[0].count) === 0 ? 'admin' : 'user';

    const hashedPassword = await bcrypt.hash(mdp, 10);

    const result = await pool.query(
      'INSERT INTO users (firstname, lastname, mail, mdp, user_role) VALUES ($1, $2, $3, $4, $5) RETURNING user_id, firstname, lastname, mail, user_role',
      [firstname, lastname, mail, hashedPassword, role]
    );

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.post('/api/login', async (req, res) => {
  const { mail, mdp } = req.body;

  try {
    const result = await pool.query(
      'SELECT user_id, firstname, lastname, mail, mdp, user_role FROM users WHERE mail = $1',
      [mail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Mail ou mot de passe incorrect' });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(mdp, user.mdp);

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Mail ou mot de passe incorrect' });
    }

    return res.status(200).json({
      success: true,
      type: user.user_role,
      userId: user.user_id, 
      firstname: user.firstname
    });

  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
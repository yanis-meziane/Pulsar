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

app.get('/api/clubs', async (req, res) => {
  try {
    const result = await pool.query('SELECT club_id, club_name FROM clubs');
    res.json({ success: true, clubs: result.rows });
  } catch (error) {
    console.error('Erreur récupération clubs:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.post('/api/trainings', async (req, res) => {
  const { userId, clubId, date, season, goals, assists } = req.body;

  if (!userId || !clubId || !date || !season) {
    return res.status(400).json({ success: false, message: 'Champs obligatoires manquants (date, saison, club)' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO trainings (user_id, club_id, date, season, goals, assists) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, clubId, date, season, goals, assists]
    );
    res.status(201).json({ success: true, training: result.rows[0] });
  } catch (error) {
    console.error('Erreur ajout entraînement:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// API Competitions (Tournois)

app.post('/api/competitions', async (req, res) => {
  const { userId, name, location, date, nb_matchs, goals, assists, wins, losses, final_ranking } = req.body;

  if (!userId || !name || !date) {
    return res.status(400).json({ success: false, message: 'Champs obligatoires manquants' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO tournois (user_id, name, location, date, nb_matchs, goals, assists, wins, losses, final_ranking)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [userId, name, location, date, nb_matchs || 0, goals || 0, assists || 0,  wins || 0, losses || 0, final_ranking || null]
    );

    res.status(201).json({ success: true, competition: result.rows[0] });
  } catch (error) {
    console.error('Erreur ajout compétition:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// API Hat

app.post('/api/hat', async (req, res) => {
  const { userId, name, location, date, nb_matchs, goals, assists, wins, losses, final_ranking } = req.body;

  if (!userId || !name || !date) {
    return res.status(400).json({ success: false, message: 'Champs obligatoires manquants' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO hats (user_id, name, location, date, nb_matchs, goals, assists, wins, losses, final_ranking)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [userId, name, location, date, nb_matchs || 0, goals || 0, assists || 0, wins || 0, losses || 0, final_ranking || null]
    );

    res.status(201).json({ success: true, hat: result.rows[0] });
  } catch (error) {
    console.error('Erreur ajout hat:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// API Championnat (Indoor / Outdoor selon le champ championnat_type)
// Un seul endpoint : le type choisi dans le formulaire (Indoor/Outdoor)
// est simplement une valeur de la colonne championnat_type.

app.post('/api/championnat', async (req, res) => {
  const {
    userId, division, championnat_type, clubId,
    location, date, nb_matchs, goals, assists, wins, losses, final_ranking
  } = req.body;

  if (!userId || !division || !championnat_type || !date) {
    return res.status(400).json({ success: false, message: 'Champs obligatoires manquants (division, championnat_type, date)' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO championnat
         (user_id, club_id, division, championnat_type, location, date, nb_matchs, goals, assists, wins, losses, final_ranking)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [userId, clubId || null, division, championnat_type, location, date,
       nb_matchs || 0, goals || 0, assists || 0, wins || 0, losses || 0, final_ranking || null]
    );

    res.status(201).json({ success: true, championnat: result.rows[0] });
  } catch (error) {
    console.error('Erreur ajout championnat:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// API Stats - Entraînements

app.get('/api/stats/training/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(`
      SELECT club_name, season, nb_sessions, total_goals, moyenne_par_semaine, total_assists, assists_par_semaine
      FROM stats_training_per_club
      WHERE user_id = $1
    `, [userId]);

    res.status(200).json({ success: true, stats: result.rows });
  } catch (error) {
    console.error('Erreur récupération stats entraînement:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// API Stats - Tournois (competitions)

app.get('/api/stats/tournaments/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(`
      SELECT name AS tournament_name, location, year AS annee,
             nb_matchs, goals, assists, wins, losses, final_ranking
      FROM tournois
      WHERE user_id = $1
      ORDER BY year DESC, name
    `, [userId]);

    res.status(200).json({ success: true, stats: result.rows });
  } catch (error) {
    console.error('Erreur récupération stats tournois:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// API Stats - Hat

app.get('/api/stats/hats/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(`
      SELECT name AS tournament_name, location, year AS annee,
             nb_matchs, goals, assists, wins, losses, final_ranking
      FROM hats
      WHERE user_id = $1
      ORDER BY year DESC, name
    `, [userId]);

    res.status(200).json({ success: true, stats: result.rows });
  } catch (error) {
    console.error('Erreur récupération stats hat:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// API Stats - Championnat (liste détaillée, filtrable par type et/ou année)
// Ex: GET /api/stats/championnat/12?type=Indoor&year=2026

app.get('/api/stats/championnat/:userId', async (req, res) => {
  const { userId } = req.params;
  const { type, year } = req.query;

  const conditions = ['user_id = $1'];
  const params = [userId];

  if (type) {
    params.push(type);
    conditions.push(`championnat_type = $${params.length}`);
  }
  if (year) {
    params.push(year);
    conditions.push(`year = $${params.length}`);
  }

  try {
    const result = await pool.query(`
      SELECT division, championnat_type, location, year AS annee,
             nb_matchs, goals, assists, wins, losses, final_ranking
      FROM championnat
      WHERE ${conditions.join(' AND ')}
      ORDER BY year DESC, division
    `, params);

    res.status(200).json({ success: true, stats: result.rows });
  } catch (error) {
    console.error('Erreur récupération stats championnat:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// API Stats - Championnat agrégées (moyenne par type + saison)
// Ex: GET /api/stats/championnat-summary/12?type=Indoor&year=2026
// -> renvoie la moyenne buts/passes etc. pour ce type et cette saison uniquement

app.get('/api/stats/championnat-summary/:userId', async (req, res) => {
  const { userId } = req.params;
  const { type, year } = req.query;

  const conditions = ['user_id = $1'];
  const params = [userId];

  if (type) {
    params.push(type);
    conditions.push(`championnat_type = $${params.length}`);
  }
  if (year) {
    params.push(year);
    conditions.push(`year = $${params.length}`);
  }

  try {
    const result = await pool.query(`
      SELECT
        championnat_type,
        year AS annee,
        COUNT(championnat_id)              AS nb_championnats,
        SUM(nb_matchs)                     AS total_matchs,
        SUM(goals)                         AS total_goals,
        ROUND(AVG(goals), 2)               AS moyenne_goals,
        SUM(assists)                       AS total_assists,
        ROUND(AVG(assists), 2)             AS moyenne_assists,
        SUM(wins)                          AS total_wins,
        SUM(losses)                        AS total_losses,
        ROUND(AVG(final_ranking), 2)       AS moyenne_classement
      FROM championnat
      WHERE ${conditions.join(' AND ')}
      GROUP BY championnat_type, year
      ORDER BY year DESC, championnat_type
    `, params);

    res.status(200).json({ success: true, summary: result.rows });
  } catch (error) {
    console.error('Erreur récupération résumé championnat:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
import { useState } from "react";
import "./Tournois.css";
import { useNavigate } from "react-router-dom";


export default function Tournois() {
    const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: '',
    name: '',
    location: '',
    nb_matchs: 0,
    goals: 0,
    assists: 0,
    wins: 0,
    losses: 0,
    egality: 0,
    final_ranking: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userId');
    try {
      const response = await fetch('/api/competitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...formData })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Erreur HTTP ${response.status}`);
      }
      const data = await response.json();
      setMessage(data.success ? 'Tournoi enregistré !' : data.message);
      if (data.success) {
        setTimeout(() => navigate('/admin/addStats'), 1000);
        }
    } catch (err) {
      console.error(err);
      setMessage('Erreur serveur');
    }
  };

  return (
    <div id="tournoisContainer">
      <form onSubmit={handleSubmit} className="tournoisForm">
        <h1>Tournois — Ajouter une compétition</h1>

        <article className="tournoisArticle">
          <label>Nom du tournoi :
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </label>
        </article>

        <article className="tournoisArticle">
          <label>Lieu :
            <input type="text" name="location" value={formData.location} onChange={handleChange} />
          </label>
        </article>

        <article className="tournoisArticle">
          <label>Date :
            <input type="date" name="date" value={formData.date} onChange={handleChange} required />
          </label>
        </article>

        <article className="tournoisArticle">
          <label>Nombre de matchs :
            <input type="number" name="nb_matchs" min="0" value={formData.nb_matchs} onChange={handleChange} />
          </label>
        </article>

        <article className="tournoisArticle">
          <label>Goals :
            <input type="number" name="goals" min="0" value={formData.goals} onChange={handleChange} />
          </label>
        </article>

        <article className="tournoisArticle">
          <label>Assists :
            <input type="number" name="assists" min="0" value={formData.assists} onChange={handleChange} />
          </label>
        </article>

        <article className="tournoisArticle">
          <label>Victoires :
            <input type="number" name="wins" min="0" value={formData.wins} onChange={handleChange} />
          </label>
        </article>

        <article className="tournoisArticle">
          <label>Défaites :
            <input type="number" name="losses" min="0" value={formData.losses} onChange={handleChange} />
          </label>
        </article>

        <article className="tournoisArticle">
          <label>Égalité :
            <input type="number" name="egality" min="0" value={formData.egality} onChange={handleChange} />
          </label>
        </article>

        <article className="tournoisArticle">
          <label>Classement final :
            <input type="number" name="final_ranking" min="1" value={formData.final_ranking} onChange={handleChange} />
          </label>
        </article>

        <article className="tournoisArticle">
          <input id="submitTournois" type="submit" value="Valider" />
        </article>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}
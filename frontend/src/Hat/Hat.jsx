import { useState } from "react";
import "./Hat.css";
import { useNavigate } from "react-router-dom";

export default function Hat() {
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
      const response = await fetch('/api/hat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...formData })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Erreur HTTP ${response.status}`);
      }

      const data = await response.json();
      setMessage(data.success ? 'Hat enregistré !' : data.message);
      if (data.success) {
        setTimeout(() => navigate('/admin/addStats'), 1000);
        }
    } catch (err) {
      console.error(err);
      setMessage('Erreur serveur');
    }
  };

  return (
    <div id="hatContainer">
      <form onSubmit={handleSubmit} className="hatForm">
        <h1>Hat — Ajouter une compétition</h1>

        <article className="hatArticle">
          <label>
            <span>Nom du hat :</span>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </label>
        </article>

        <article className="hatArticle">
          <label>
            <span>Lieu :</span>
            <input type="text" name="location" value={formData.location} onChange={handleChange} />
          </label>
        </article>

        <article className="hatArticle">
          <label>
            <span>Date :</span>
            <input type="date" name="date" value={formData.date} onChange={handleChange} required />
          </label>
        </article>

        <article className="hatArticle">
          <label>
            <span>Nombre de matchs :</span>
            <input type="number" name="nb_matchs" min="0" value={formData.nb_matchs} onChange={handleChange} />
          </label>
        </article>

        <article className="hatArticle">
          <label>
            <span>Goals :</span>
            <input type="number" name="goals" min="0" value={formData.goals} onChange={handleChange} />
          </label>
        </article>

        <article className="hatArticle">
          <label>
            <span>Assists :</span>
            <input type="number" name="assists" min="0" value={formData.assists} onChange={handleChange} />
          </label>
        </article>

        <article className="hatArticle">
          <label>
            <span>Victoires :</span>
            <input type="number" name="wins" min="0" value={formData.wins} onChange={handleChange} />
          </label>
        </article>

        <article className="hatArticle">
          <label>
            <span>Défaites :</span>
            <input type="number" name="losses" min="0" value={formData.losses} onChange={handleChange} />
          </label>
        </article>

        <article className="hatArticle">
          <label>
            <span>Classement final :</span>
            <input type="number" name="final_ranking" min="1" value={formData.final_ranking} onChange={handleChange} />
          </label>
        </article>

        <article className="hatArticle">
          <input id="submitHat" type="submit" value="Valider" />
        </article>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}
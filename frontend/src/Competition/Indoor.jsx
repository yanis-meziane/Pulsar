import { useState } from "react";
import "./Competition.css";
import AddStats from "../Admin/AddStats";

export default function Indoor() {
  const [formData, setFormData] = useState({
    division: '',
    location: '',
    date: '',
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
      const response = await fetch('http://localhost:3001/api/indoor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...formData })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Erreur HTTP ${response.status}`);
      }

      const data = await response.json();
      setMessage(data.success ? 'Indoor enregistré !' : data.message);
      if (data.success) {
        setTimeout(() => window.location.navigate(AddStats), 1000);
      }
    } catch (err) {
      console.error(err);
      setMessage('Erreur serveur');
    }
  };

  return (
    <div id="indoorContainer">
      <form onSubmit={handleSubmit} className="indoorForm">
        <h1>Indoor — Ajouter des résultats</h1>

        <article className="indoorArticle">
          <label>
            <span>Division :</span>
            <input type="text" name="division" value={formData.division} onChange={handleChange} required />
          </label>
        </article>

        <article className="indoorArticle">
          <label>
            <span>Lieu :</span>
            <input type="text" name="location" value={formData.location} onChange={handleChange} />
          </label>
        </article>

        <article className="indoorArticle">
          <label>
            <span>Date :</span>
            <input type="date" name="date" value={formData.date} onChange={handleChange} required />
          </label>
        </article>

        <article className="indoorArticle">
          <label>
            <span>Nombre de match : </span>
            <input type="number" name="nb_matchs" min="0" value={formData.nb_matchs} onChange={handleChange} />
          </label>
        </article>

        <article className="indoorArticle">
          <label>
            <span>Goals : </span>
            <input type="number" name="goals" min="0" value={formData.goals} onChange={handleChange} />
          </label>
        </article>

        <article className="indoorArticle">
          <label>
            <span>Assists : </span>
            <input type="number" name="assists" min="0" value={formData.assists} onChange={handleChange} />
          </label>
        </article>

        <article className="indoorArticle">
          <label>
            <span>Nombre de victoires : </span>
            <input type="number" name="wins" min="0" value={formData.wins} onChange={handleChange} />
          </label>
        </article>

        <article className="indoorArticle">
          <label>
            <span>Nombre de défaites : </span>
            <input type="number" name="losses" min="0" value={formData.losses} onChange={handleChange} />
          </label>
        </article>

        <article className="indoorArticle">
          <label>
            <span>Classement final : </span>
            <input type="number" name="final_ranking" min="1" value={formData.final_ranking} onChange={handleChange} />
          </label>
        </article>

        <article className="indoorArticle">
          <input id="submitIndoor" type="submit" value="Valider" />
        </article>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}
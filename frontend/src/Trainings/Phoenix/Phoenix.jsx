import { useState, useEffect } from "react";
import "./Phoenix.css"
import AddStats from "../../Admin/AddStats";

export default function Phoenix() {
  const [clubId, setClubId] = useState(null);
  const [formData, setFormData] = useState({ date: '', goals: 0, assists: 0 });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/clubs')
      .then(res => res.json())
      .then(data => {
        console.log('Clubs reçus :', data);
        const phoenix = data.clubs.find(club => club.club_name === 'Phœnix');
        if (phoenix) {
          setClubId(phoenix.club_id);
        } else {
          console.error('Club Phœnix introuvable dans la réponse');
        }
      })
      .catch(err => console.error('Erreur lors du chargement des clubs :', err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userId');

    const formattedDate = formData.date.replace(/-/g, '/');

    try {
      const response = await fetch('/api/trainings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, clubId, ...formData, date: formattedDate })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Erreur HTTP ${response.status}`);
      }

      const data = await response.json();
      setMessage(data.success ? 'Entraînement enregistré !' : data.message);
      if (data.success) {
        setTimeout(() => window.location.navigate(AddStats), 1000);
      }
    } catch (err) {
      console.error(err);
      setMessage('Erreur serveur');
    }
  };

  return (
    <div id="phoenixContainer">
      <form onSubmit={handleSubmit} className="phoenixForm">
        <h1>Phœnix — Ajouter un entraînement</h1>

        <article className="phoenixArticle">
          <label>
            <span>Date : </span>
            <input type="date" name="date" value={formData.date} onChange={handleChange} required />
          </label>
        </article>

        <article className="phoenixArticle">
          <label>
            <span>Nombre de points : </span>
            <input type="number" name="goals" min="0" value={formData.goals} onChange={handleChange} />
          </label>
        </article>

        <article className="phoenixArticle">
          <label>
            <span>Nombre d'assists : </span>
            <input type="number" name="assists" min="0" value={formData.assists} onChange={handleChange} />
          </label>
        </article>

        <article className="phoenixArticle">
          <input id="submit" type="submit" defaultValue="Valider" />
        </article>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}
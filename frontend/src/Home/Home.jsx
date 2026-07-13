import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const CATEGORIES = ["Trainings", "Tournois", "Hat", "Championnat"];

export default function Home() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [trainingStats, setTrainingStats] = useState(null);
  const [tournamentStats, setTournamentStats] = useState(null);
  const [hatStats, setHatStats] = useState(null);
  const [champStats, setChampStats] = useState(null);

  const [champType, setChampType] = useState('Tous');
  const [champYear, setChampYear] = useState('Toutes');
  
  const fetchIfNeeded = async (category) => {
    setMessage('');
    try {
      if (category === 'Trainings' && trainingStats === null) {
        setLoading(true);
        const res = await fetch(`http://localhost:3001/api/stats/training/${userId}`);
        const data = await res.json();
        setTrainingStats(data.success ? data.stats : []);
        if (!data.success) setMessage('Erreur lors du chargement des stats entraînement');
      }
      if (category === 'Tournois' && tournamentStats === null) {
        setLoading(true);
        const res = await fetch(`http://localhost:3001/api/stats/tournaments/${userId}`);
        const data = await res.json();
        setTournamentStats(data.success ? data.stats : []);
        if (!data.success) setMessage('Erreur lors du chargement des stats tournois');
      }
      if (category === 'Hat' && hatStats === null) {
        setLoading(true);
        const res = await fetch(`http://localhost:3001/api/stats/hats/${userId}`);
        const data = await res.json();
        setHatStats(data.success ? data.stats : []);
        if (!data.success) setMessage('Erreur lors du chargement des stats hat');
      }
      if (category === 'Championnat' && champStats === null) {
        setLoading(true);
        // On charge tout le championnat une seule fois, puis on filtre
        // côté client (type + saison) pour un rendu instantané.
        const res = await fetch(`http://localhost:3001/api/stats/championnat/${userId}`);
        const data = await res.json();
        setChampStats(data.success ? data.stats : []);
        if (!data.success) setMessage('Erreur lors du chargement des stats championnat');
      }
    } catch {
      setMessage('Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    fetchIfNeeded(category);
  };

  // Types et saisons disponibles pour les filtres, déduits des données reçues
  const champTypes = useMemo(() => {
    if (!champStats) return [];
    return [...new Set(champStats.map(r => r.championnat_type))];
  }, [champStats]);

  const champYears = useMemo(() => {
    if (!champStats) return [];
    return [...new Set(champStats.map(r => r.annee))].sort((a, b) => b - a);
  }, [champStats]);

  const filteredChampStats = useMemo(() => {
    if (!champStats) return [];
    return champStats.filter(r =>
      (champType === 'Tous' || r.championnat_type === champType) &&
      (champYear === 'Toutes' || String(r.annee) === String(champYear))
    );
  }, [champStats, champType, champYear]);

  const champSummary = useMemo(() => {
    if (filteredChampStats.length === 0) return null;
    const n = filteredChampStats.length;
    const sum = (key) => filteredChampStats.reduce((acc, r) => acc + Number(r[key] || 0), 0);
    return {
      nbChamps: n,
      totalMatchs: sum('nb_matchs'),
      moyenneGoals: (sum('goals') / n).toFixed(2),
      moyenneAssists: (sum('assists') / n).toFixed(2),
      totalWins: sum('wins'),
      totalLosses: sum('losses'),
      moyenneClassement: (sum('final_ranking') / n).toFixed(2),
    };
  }, [filteredChampStats]);

  const TournamentTable = ({ data }) => (
    !data || data.length === 0 ? (
      <p>Aucune donnée disponible</p>
    ) : (
      <table>
        <thead>
          <tr>
            <th>Nom du tournoi</th>
            <th>Lieu</th>
            <th>Année</th>
            <th>Nb matchs</th>
            <th>Goals</th>
            <th>Assists</th>
            <th>Victoires</th>
            <th>Défaites</th>
            <th>Classement final</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td>{row.tournament_name}</td>
              <td>{row.location}</td>
              <td>{row.annee}</td>
              <td>{row.nb_matchs}</td>
              <td>{row.goals}</td>
              <td>{row.assists}</td>
              <td>{row.wins}</td>
              <td>{row.losses}</td>
              <td>{row.final_ranking ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  );

  const ChampionnatTable = ({ data }) => (
    !data || data.length === 0 ? (
      <p>Aucune donnée pour ce filtre</p>
    ) : (
      <table>
        <thead>
          <tr>
            <th>Division</th>
            <th>Type</th>
            <th>Lieu</th>
            <th>Saison</th>
            <th>Nb matchs</th>
            <th>Goals</th>
            <th>Assists</th>
            <th>Victoires</th>
            <th>Défaites</th>
            <th>Classement final</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td>{row.division}</td>
              <td>{row.championnat_type}</td>
              <td>{row.location}</td>
              <td>{row.annee}</td>
              <td>{row.nb_matchs}</td>
              <td>{row.goals}</td>
              <td>{row.assists}</td>
              <td>{row.wins}</td>
              <td>{row.losses}</td>
              <td>{row.final_ranking ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  );

  const renderContent = () => {
    if (!activeCategory) {
      return <p className="statsPlaceholder">Sélectionnez une catégorie à gauche pour afficher les statistiques.</p>;
    }
    if (loading) return <p>Chargement...</p>;

    switch (activeCategory) {
      case 'Trainings':
        return trainingStats === null || trainingStats.length === 0 ? (
          <p>Aucune donnée disponible</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Club</th>
                <th>Total goals</th>
                <th>Moyenne / semaine</th>
                <th>Moyenne assists / semaine</th>
              </tr>
            </thead>
            <tbody>
              {trainingStats.map((row, index) => (
                <tr key={index}>
                  <td>{row.club_name}</td>
                  <td>{row.total_goals}</td>
                  <td>{row.moyenne_par_semaine}</td>
                  <td>{row.assists_par_semaine}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'Tournois':
        return <TournamentTable data={tournamentStats} />;

      case 'Hat':
        return <TournamentTable data={hatStats} />;

      case 'Championnat':
        return (
          <>
            <div className="champFilters">
              <label>
                Type :
                <select value={champType} onChange={e => setChampType(e.target.value)}>
                  <option value="Tous">Tous</option>
                  {champTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
              <label>
                Saison :
                <select value={champYear} onChange={e => setChampYear(e.target.value)}>
                  <option value="Toutes">Toutes</option>
                  {champYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </label>
            </div>

            {champSummary && (
              <div className="champSummary">
                <p><strong>{champSummary.nbChamps}</strong> championnat(s) — <strong>{champSummary.totalMatchs}</strong> matchs joués</p>
                <p>Moyenne buts : <strong>{champSummary.moyenneGoals}</strong> — Moyenne passes : <strong>{champSummary.moyenneAssists}</strong></p>
                <p>Victoires : <strong>{champSummary.totalWins}</strong> — Défaites : <strong>{champSummary.totalLosses}</strong> — Classement moyen : <strong>{champSummary.moyenneClassement}</strong></p>
              </div>
            )}

            <ChampionnatTable data={filteredChampStats} />
          </>
        );

      default:
        return null;
    }
  };


  return (
    <div>
      <h1>Coucou, je suis la page user classique</h1>

      <button onClick={() => navigate("/login")}>Se connecter</button>
      <button onClick={() => navigate("/register")}>S'inscrire</button>

      <div className="statsLayout">
        <aside className="statsSidebar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={activeCategory === cat ? 'active' : ''}
              onClick={() => handleCategoryClick(cat)}
            >
              {cat}
            </button>
          ))}
        </aside>

        <section className="statsContent">
          {message && <p className="errorMessage">{message}</p>}
          {renderContent()}
        </section>
      </div>
    </div>
  );
}
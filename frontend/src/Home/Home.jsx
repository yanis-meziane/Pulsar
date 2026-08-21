import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const CATEGORIES = ["Trainings", "Tournois", "Hat", "Championnat"];

const CAROUSEL_PHOTOS = [
  {
    src: "../public/Championnat.jpeg",
    alt: "Photo du club",
    caption: "Saison 2025 – 2026",
    driveUrl: "https://drive.google.com/drive/folders/1B56btMdINSfpn-ZMykXfvxC1dFwtLdIj",
  },
  {
    src: "../public/Lutece.jpeg",
    alt: "Photo d'entraînement",
    caption: "Entraînements",
    driveUrl: "https://drive.google.com/drive/folders/1pH-mdALOFogiwh-a20aEuAume4F9l5L2",
  },
  {
    src: "../public/SummerLove.jpeg",
    alt: "Photo de tournoi",
    caption: "Derniers tournois",
    driveUrl: "https://drive.google.com/drive/folders/1fsJWgzh4XZfLfR4oXKg8iDLRmA34xYXH",
  },
];

const AUTOPLAY_DELAY = 5000;

function Carousel({ photos, onPhotoClick }) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const goTo = useCallback(
    (i) => {
      setIndex((i + photos.length) % photos.length);
    },
    [photos.length]
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (isPaused || photos.length <= 1) return undefined;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % photos.length);
    }, AUTOPLAY_DELAY);
    return () => clearInterval(timerRef.current);
  }, [isPaused, photos.length]);

  if (!photos || photos.length === 0) return null;

  return (
    <div
      className="carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="carousel__frame">
        {photos.map((photo, i) => (
          <div
            key={i}
            className={`carousel__slide${i === index ? " isActive" : ""}`}
            aria-hidden={i !== index}
            role={photo.driveUrl ? "button" : undefined}
            tabIndex={photo.driveUrl && i === index ? 0 : -1}
            onClick={() => photo.driveUrl && onPhotoClick && onPhotoClick(photo, i)}
            onKeyDown={(e) => {
              if (photo.driveUrl && (e.key === "Enter" || e.key === " ") && onPhotoClick) {
                e.preventDefault();
                onPhotoClick(photo, i);
              }
            }}
            style={{ cursor: photo.driveUrl ? "pointer" : undefined }}
          >
            {photo.src ? (
              <img src={photo.src} alt={photo.alt || ""} />
            ) : (
              <div className="carousel__placeholder">
                <svg viewBox="0 0 256 256" aria-hidden="true">
                  <path d="M208,56H180.28L166.65,35.56A8,8,0,0,0,160,32H96a8,8,0,0,0-6.65,3.56L75.71,56H48A24,24,0,0,0,24,80V192a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V80A24,24,0,0,0,208,56Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8H80a8,8,0,0,0,6.66-3.56L100.28,48h55.44l13.62,20.44A8,8,0,0,0,176,72h32a8,8,0,0,1,8,8ZM128,88a44,44,0,1,0,44,44A44.05,44.05,0,0,0,128,88Zm0,72a28,28,0,1,1,28-28A28,28,0,0,1,128,160Z" />
                </svg>
                <span>{photo.alt || "Photo à venir"}</span>
              </div>
            )}
            {photo.caption && <div className="carousel__caption">{photo.caption}</div>}
          </div>
        ))}

        {photos.length > 1 && (
          <>
            <button
              type="button"
              className="carousel__arrow carousel__arrow--prev"
              onClick={prev}
              aria-label="Photo précédente"
            >
              <svg viewBox="0 0 256 256" aria-hidden="true">
                <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z" />
              </svg>
            </button>
            <button
              type="button"
              className="carousel__arrow carousel__arrow--next"
              onClick={next}
              aria-label="Photo suivante"
            >
              <svg viewBox="0 0 256 256" aria-hidden="true">
                <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
              </svg>
            </button>
          </>
        )}
      </div>

      {photos.length > 1 && (
        <div className="carousel__dots">
          {photos.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`carousel__dot${i === index ? " isActive" : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Aller à la photo ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [trainingStats, setTrainingStats] = useState(null);
  const [trainingSeason, setTrainingSeason] = useState('Toutes');
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

  // Saisons disponibles pour les entraînements, déduites des données reçues
  const trainingSeasons = useMemo(() => {
    if (!trainingStats) return [];
    return [...new Set(trainingStats.map(r => r.season))].sort().reverse();
  }, [trainingStats]);

  const filteredTrainingStats = useMemo(() => {
    if (!trainingStats) return [];
    return trainingStats.filter(r =>
      trainingSeason === 'Toutes' || r.season === trainingSeason
    );
  }, [trainingStats, trainingSeason]);

  const trainingSummary = useMemo(() => {
    if (filteredTrainingStats.length === 0) return null;
    const sum = (key) => filteredTrainingStats.reduce((acc, r) => acc + Number(r[key] || 0), 0);
    return {
      nbSessions: sum('nb_sessions'),
      totalGoals: sum('total_goals'),
      totalAssists: sum('total_assists'),
    };
  }, [filteredTrainingStats]);

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
        return (
          <>
            <div className="champFilters">
              <label>
                Saison :
                <select value={trainingSeason} onChange={e => setTrainingSeason(e.target.value)}>
                  <option value="Toutes">Toutes</option>
                  {trainingSeasons.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
            </div>

            {trainingSummary && (
              <div className="champSummary">
                <p><strong>{trainingSummary.nbSessions}</strong> séance(s) au total</p>
                <p>Total buts : <strong>{trainingSummary.totalGoals}</strong> — Total passes : <strong>{trainingSummary.totalAssists}</strong></p>
              </div>
            )}

            {filteredTrainingStats.length === 0 ? (
              <p>Aucune donnée pour ce filtre</p>
            ) : (
              <table className="tableInformation">
                <thead>
                  <tr>
                    <th>Club</th>
                    <th>Saison</th>
                    <th>Total goals</th>
                    <th>Moyenne / semaine</th>
                    <th>Moyenne assists / semaine</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrainingStats.map((row, index) => (
                    <tr key={index}>
                      <td>{row.club_name}</td>
                      <td>{row.season}</td>
                      <td>{row.total_goals}</td>
                      <td>{row.moyenne_par_semaine}</td>
                      <td>{row.assists_par_semaine}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
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
    <div id="mainHome">
      <div className="topBar">
        <button onClick={() => navigate("/login")} className="tc-pill-btn" type="button">
          Se connecter
          <svg className="tc-pill-btn__icon" viewBox="0 0 256 256" aria-hidden="true">
            <path d="M200,64V168a8,8,0,0,1-16,0V83.31L69.66,197.66a8,8,0,0,1-11.32-11.32L172.69,72H88a8,8,0,0,1,0-16H192A8,8,0,0,1,200,64Z" />
          </svg>
        </button>
        {/*<button onClick={() => navigate("/register")}>S'inscrire</button>*/}
      </div>

      <header className="brandHeader">
        <span className="brandHeader__eyebrow">Statistiques de club</span>
        <div className="brandHeader__mark">
          <span className="brandHeader__rule" />
          <h1 className="brandHeader__title">
            Pulsar
            <span className="brandHeader__pulse" aria-hidden="true" />
          </h1>
          <span className="brandHeader__rule" />
        </div>
      </header>

      <Carousel
        photos={CAROUSEL_PHOTOS}
        onPhotoClick={(photo) => {
          if (photo.driveUrl) {
            window.open(photo.driveUrl, "_blank", "noopener,noreferrer");
          }
        }}
      />

      <div id="HomeContainer">
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
    </div>
  );
}
// Page de transition qui va servir pour rajouter les stats

import { useNavigate } from "react-router-dom";
import "./AddStats.css";

export default function AddStats() {
    const navigate = useNavigate();
    return (
        <div className="addStatsContainer">
            <span className="addStatsContainer__eyebrow">Pulsar — Administration</span>
            <h1>Ajouter des statistiques</h1>
            <p className="addStatsSubtitle">Choisissez une catégorie pour enregistrer de nouveaux résultats.</p>

            <div className="addStatsGrid">
                <button onClick={() => navigate("/admin/addStats/Trainings")} type="button">
                    Entraînement Phœnix
                </button>
                <button onClick={() => navigate("/admin/addStats/Hat")} type="button">
                    Hat
                </button>
                <button onClick={() => navigate("/admin/addStats/Tournois")} type="button">
                    Tournois
                </button>
                <button onClick={() => navigate("/admin/addStats/Competition")} type="button">
                    Compétition
                </button>
            </div>
        </div>
    );
}
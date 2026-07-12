// Page de transition qui va servir pour rajouter les stats 

import { useNavigate } from "react-router-dom"

export default function AddStats(){
    const navigate = useNavigate();
    return(
        <div>
            <h1>Bonjour je suis la page de transition et de rajout de stats</h1>

            <button onClick={() => navigate("/admin/addStats/Trainings")}> Entraînement Phoenix</button>
            <button onClick={() => navigate("/admin/addStats/Hat")}>Hat</button>
            <button onClick={() => navigate("/admin/addStats/Tournois")}>Tournois</button>
            <button onClick={() => navigate("/admin/addStats/Competition")}>Competition</button>
        </div>
    )
}
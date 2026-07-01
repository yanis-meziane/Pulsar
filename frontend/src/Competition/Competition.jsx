import { useNavigate } from "react-router-dom"

export default function Competition(){
    const navigate = useNavigate();
    return(
        <div>
            <h1>Bonjour, je suis la page Competition</h1>

            <button onClick={() => navigate("/admin/addStats/Competition/Indoor")}>Indoor</button>
            <button onClick={() => navigate("/admin/addStats/Competition/Outdoor")}>Outdoor</button>
        </div>
    )
}
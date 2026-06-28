import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Coucou, je suis la page user classique</h1>

      <button onClick={() => navigate("/login")}>Se connecter</button>
      <button onClick={() => navigate("/register")}>S'inscrire</button>
    </div>
  );
}
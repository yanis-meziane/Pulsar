import { useNavigate } from "react-router-dom";

export default function Admin() {

  const navigate = useNavigate();

  return (
    <div>
      <h1>Coucou, je suis la page Admin</h1>

      <button onClick={() => navigate("/admin/addStats")}> Rajouter des stats</button>
    </div>
  );
}
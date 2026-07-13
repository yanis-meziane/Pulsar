import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./Home/Home"
import Register from "./Register/Register"
import Login from "./Login/Login"

// Import pour les pages Admin

import Admin from "./Admin/Admin"
import AddStats from "./Admin/AddStats"
import Phoenix from "./Trainings/Phoenix/Phoenix"
import Competition from "./Competition/Competition"
import Hat from "./Hat/Hat"
import Tournois from "./Tournois/Tournois"

import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {<Route path="/register" element={<Register />} />}

      {/* Routes nécessaires que pour les admin */}

        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/addStats" element={<AddStats />} />
        <Route path="/admin/addStats/Trainings" element={<Phoenix />} />
        <Route path="/admin/addStats/Hat" element={<Hat />} />
        <Route path="/admin/addStats/Tournois" element={<Tournois />} />
        <Route path="/admin/addStats/Competition" element={<Competition />} />
        
      {/* Route pour le rajout des statistiques */}


      </Routes>
    </BrowserRouter>
  )
}

export default App
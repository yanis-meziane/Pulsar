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
import ProtectedRoute from "./ProtectedRoutes"
import Error from "./Error/Error"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {<Route path="/register" element={<Register />} />}
        <Route path="/error" element={<Error />} />

      {/* Routes nécessaires que pour les admin */}

        <Route path="/login" element={<Login />} />

        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
             <Admin />
          </ProtectedRoute> 
          }/>

        <Route path="/admin/addStats" element={
          <ProtectedRoute requiredRole="admin">
            <AddStats />
          </ProtectedRoute>
          } />
        <Route path="/admin/addStats/Trainings" element={
          <ProtectedRoute requiredRole="admin">
            <Phoenix />
          </ProtectedRoute>
          } />
        <Route path="/admin/addStats/Hat" element={
          <ProtectedRoute requiredRole="admin">
            <Hat />
          </ProtectedRoute>
        } />
        <Route path="/admin/addStats/Tournois" element={
          <ProtectedRoute requiredRole="admin">
            <Tournois />
          </ProtectedRoute>
         } />

        <Route path="/admin/addStats/Competition" element={
          <ProtectedRoute requiredRole="admin">
              <Competition />
          </ProtectedRoute>
        } />
        
      {/* Route pour le rajout des statistiques */}


      </Routes>
    </BrowserRouter>
  )
}

export default App
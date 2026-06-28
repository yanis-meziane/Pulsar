import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./Home/Home"
import Register from "./Register/Register"
import Login from "./Login/Login"
import Admin from "./Admin/Admin"
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
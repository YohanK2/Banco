import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from './pages/login.jsx'
import Dashboard from './pages/dashboard.jsx'
import Inicio from './pages/inicio.jsx'
import Registro from './pages/registro.jsx'
import Transferencias from './pages/transferencias'
import SaldoMovimientos from './pages/SaldoMovimientos'
import Retiros from './pages/Retiros'
import Historial from './pages/Historial'
import Ajustes from './pages/Ajustes'
import { NotificationsProvider } from "./context/NotificationsContext.jsx";

function App() {
  return (
    <Router>
      <NotificationsProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/resumen" element={<Dashboard />} />
          <Route path="/transferencias" element={<Transferencias />} />
          <Route path="/movimientos" element={<SaldoMovimientos />} />
          <Route path="/retiros" element={<Retiros />} />
          <Route path="/historial" element={<Historial />} />
          <Route path="/perfil" element={<Ajustes initialSection="perfil" />} />
          <Route path="/soporte" element={<Dashboard />} />
          <Route path="/ajustes" element={<Ajustes />} />
        </Routes>
      </NotificationsProvider>
    </Router>
  )
}


export default App

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Transferencias from './pages/transferencias'
import SaldoMovimientos from './pages/SaldoMovimientos'
import Retiros from './pages/Retiros'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/resumen" element={<Dashboard />} />
        <Route path="/transferencias" element={<Transferencias />} />
        <Route path="/movimientos" element={<SaldoMovimientos />} />
        <Route path="/retiros" element={<Retiros />} />
        <Route path="/historial" element={<Dashboard />} />
        <Route path="/perfil" element={<Dashboard />} />
        <Route path="/soporte" element={<Dashboard />} />
      </Routes>
    </Router>
  )
}


export default App

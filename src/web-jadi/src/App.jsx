import React from 'react';
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UserAdmin from "./pages/UserAdmin";
import KelolaProduk from "./pages/KelolaProduk";

function App() {
  return (
    <Routes>
      {/* Route utama mengarah ke Login */}
      <Route path="/" element={<Login />} />
      
      {/* Route dashboard yang baru saja kita berhasil hubungkan */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Route register yang hanya bisa di akses oleh admin */}
      <Route path="/user-admin" element={<UserAdmin />} />

      {/* Route register yang hanya bisa di akses oleh admin */}
      <Route path="/kelola-produk" element={<KelolaProduk />} />
    </Routes>
  );
}

export default App;
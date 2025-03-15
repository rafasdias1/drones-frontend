import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import DroneDetails from "./pages/DroneDetails";
import Login from "./pages/Login";
import DroneList from "./pages/DroneList";
import PrivateRoute from "./components/ProtectedRoute";
import Mapa from "./pages/Mapa";
import DroneProjects from "./pages/DroneProjects";
import AdminManager from "./pages/admin/AdminManager";

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* 🟢 Rotas Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/drones" element={<DroneList />} />
        <Route path="/drones/:id" element={<DroneDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/mapa" element={<Mapa />} />
        <Route path="/projetos" element={<DroneProjects />} />

        {/* 🔐 Rotas Protegidas (Painel Admin) */}
        <Route path="/admin" element={<PrivateRoute />}>
          {/* AdminManager como página principal do painel */}
          <Route index element={<AdminManager />} />
        </Route>

        {/* Página 404 - Caso tente acessar uma rota inexistente */}
        <Route path="*" element={<h1 className="text-center mt-10 text-2xl">Página não encontrada 😢</h1>} />
      </Routes>
    </Router>
  );
}
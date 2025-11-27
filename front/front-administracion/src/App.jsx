import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Espacios from "./pages/Espacios/Espacios.jsx";
import AddEspacio from "./pages/Espacios/AddEspacio.jsx";
import EditEspacio from "./pages/Espacios/EditEspacio.jsx";
import Eventos from "./pages/Eventos/Eventos.jsx";
import AddEvento from "./pages/Eventos/AddEvento.jsx";
import EditEvento from "./pages/Eventos/EditEvento.jsx";
import EventoDetalle from "./pages/Eventos/EventoDetalle.jsx";
import AddActividad from "./pages/Actividades/AddActividad.jsx";
import EditActividad from "./pages/Actividades/EditActividad.jsx";
import Usuarios from "./pages/Usuarios.jsx";
import AddUser from "./pages/AddUser.jsx";
import Login from "./pages/Login.jsx";
import "./App.scss";

const AppContent = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="container-fluid">
      <div className="row">
        {!isLoginPage && (
          <div className="col-12 col-md-2 bg-dark text-white p-3" id="sidebar">
            <nav>
              <h4 className="mb-4">Menú</h4>
              <ul className="nav flex-column">
                <li className="nav-item"><Link className="nav-link text-light" to="/">Inicio</Link></li>
                <li className="nav-item"><Link className="nav-link text-light" to="/espacios">Espacios</Link></li>
                <li className="nav-item"><Link className="nav-link text-light" to="/eventos">Eventos</Link></li>
                <li className="nav-item"><Link className="nav-link text-light" to="/usuarios">Usuarios</Link></li>
              </ul>
            </nav>
          </div>
        )}

        <div className={isLoginPage ? "col-12" : "col-12 col-md-10 p-4"}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/espacios" element={<Espacios />} />
            <Route path="/add-espacio" element={<AddEspacio />} />
            <Route path="/edit-espacio/:id" element={<EditEspacio />} />
            <Route path="/eventos" element={<Eventos />} />
            <Route path="/add-evento" element={<AddEvento />} />
            <Route path="/edit-evento/:id" element={<EditEvento />} />
            <Route path="/eventos/:id" element={<EventoDetalle />} />
            <Route path="/eventos/:id/add-actividad" element={<AddActividad />} />
            <Route path="/eventos/:id/edit-actividad/:actividadId" element={<EditActividad />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/add-user" element={<AddUser />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

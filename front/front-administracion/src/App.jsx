import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import Home from "./pages/Home.jsx";
import Espacios from "./pages/Espacios/Espacios.jsx";
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
  const navigate = useNavigate();
  const isLoginPage = location.pathname === '/login';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();
  const isAdmin = Boolean(storedUser?.administrador);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const getLinkClass = (paths) => {
    const isActive = paths.some(path => {
      if (path === '/') {
        return location.pathname === '/';
      }
      return location.pathname.startsWith(path);
    });
    return `sidebar-link ${isActive ? 'active' : ''}`;
  };

  return (
    <div className="app-container">
      {!isLoginPage && (
        <>
          {/* Navbar para móvil */}
          <nav className="navbar navbar-dark d-lg-none" style={{ backgroundColor: '#1a1d29' }}>
            <div className="container-fluid">
              <button 
                className="navbar-toggler" 
                type="button" 
                onClick={toggleSidebar}
              >
                <span className="navbar-toggler-icon"></span>
              </button>
              <span className="navbar-brand mb-0 h1">FacuMapp Admin</span>
            </div>
          </nav>

          {/* Sidebar */}
          <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
            <div className="sidebar-header">
              <Link className="sidebar-brand" to="/" onClick={closeSidebar}>
                <img className="sidebar-logo" src="/images/Facumapp-logo.jpeg" alt="FacuMapp Logo" />
                <h4 className="sidebar-title">FacuMapp</h4>
              </Link>
              <button className="btn-close btn-close-white d-lg-none" onClick={closeSidebar}></button>
            </div>
            <nav className="sidebar-nav">
              <Link className={getLinkClass(['/'])} to="/" onClick={closeSidebar}>
                <i className="bi bi-house-door me-2"></i>
                Inicio
              </Link>
              <Link className={getLinkClass(['/espacios', '/edit-espacio'])} to="/espacios" onClick={closeSidebar}>
                <i className="bi bi-building me-2"></i>
                Espacios
              </Link>
              <Link className={getLinkClass(['/eventos', '/add-evento', '/edit-evento'])} to="/eventos" onClick={closeSidebar}>
                <i className="bi bi-calendar-event me-2"></i>
                Eventos
              </Link>
              {isAdmin && (
                <Link className={getLinkClass(['/usuarios', '/add-user'])} to="/usuarios" onClick={closeSidebar}>
                  <i className="bi bi-people me-2"></i>
                  Usuarios
                </Link>
              )}
              <button className="sidebar-link logout-btn" onClick={() => { handleLogout(); closeSidebar(); }}>
                <i className="bi bi-box-arrow-right me-2"></i>
                Cerrar Sesión
              </button>
            </nav>
          </div>

          {/* Overlay para cerrar sidebar en móvil */}
          {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}
        </>
      )}

      <div className={`main-content ${!isLoginPage ? 'with-sidebar' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/espacios" element={<Espacios />} />
          <Route path="/edit-espacio/:id" element={<EditEspacio />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/add-evento" element={<AddEvento />} />
          <Route path="/edit-evento/:id" element={<EditEvento />} />
          <Route path="/eventos/:id" element={<EventoDetalle />} />
          <Route path="/eventos/:id/add-actividad" element={<AddActividad />} />
          <Route path="/eventos/:id/edit-actividad/:actividadId" element={<EditActividad />} />
          <Route
            path="/usuarios"
            element={isAdmin ? <Usuarios /> : <Navigate to="/" replace />}
          />
          <Route
            path="/add-user"
            element={isAdmin ? <AddUser /> : <Navigate to="/" replace />}
          />
          <Route path="/login" element={<Login />} />
        </Routes>
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

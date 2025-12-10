import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from "../config";

export default function Home() {
  const [stats, setStats] = useState({ eventos: 0, espacios: 0, actividades: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Obtener información del usuario
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    const fetchStats = async () => {
      try {
        const [eventosRes, espaciosRes] = await Promise.all([
          fetch(`${API_URL}/evento`),
          fetch(`${API_URL}/espacio`)
        ]);

        if (!eventosRes.ok || !espaciosRes.ok) {
          throw new Error('Error al obtener las estadísticas');
        }

        const eventosData = await eventosRes.json();
        const espaciosData = await espaciosRes.json();

        // Intentar obtener actividades, pero no fallar si no está disponible
        let actividadesCount = 0;
        try {
          const actividadesRes = await fetch(`${API_URL}/actividad`);
          if (actividadesRes.ok) {
            const actividadesData = await actividadesRes.json();
            actividadesCount = actividadesData.length;
          }
        } catch (e) {
          console.log('Actividades no disponibles:', e);
        }

        setStats({
          eventos: eventosData.length,
          espacios: espaciosData.length,
          actividades: actividadesCount
        });
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>
            <i className="bi bi-speedometer2 me-2"></i>
            Panel de Administración
          </h1>
          <p className="text-muted mb-0">
            {user ? `Bienvenido, ${user.nombre}` : 'Bienvenido al panel de control'}
          </p>
        </div>
      </div>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando estadísticas...</span>
          </div>
          <p className="text-muted mt-3">Cargando estadísticas...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-danger d-flex align-items-center">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          Error: {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid-container mb-4">
          {/* Card Eventos */}
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">
              <i className="bi bi-calendar-event"></i>
            </div>
            <div className="stat-content">
              <h6>Eventos</h6>
              <h2>{stats.eventos}</h2>
              <p className="mb-3">
                {stats.eventos === 0 ? 'No hay eventos' : 
                 stats.eventos === 1 ? '1 evento registrado' : 
                 `${stats.eventos} eventos registrados`}
              </p>
              <Link to="/eventos" className="btn btn-sm btn-custom">
                <i className="bi bi-arrow-right me-2"></i>
                Gestionar Eventos
              </Link>
            </div>
          </div>

          {/* Card Espacios */}
          <div className="stat-card stat-card-success">
            <div className="stat-icon">
              <i className="bi bi-building"></i>
            </div>
            <div className="stat-content">
              <h6>Espacios</h6>
              <h2>{stats.espacios}</h2>
              <p className="mb-3">
                {stats.espacios === 0 ? 'No hay espacios' : 
                 stats.espacios === 1 ? '1 espacio registrado' : 
                 `${stats.espacios} espacios registrados`}
              </p>
              <Link to="/espacios" className="btn btn-sm btn-custom">
                <i className="bi bi-arrow-right me-2"></i>
                Gestionar Espacios
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

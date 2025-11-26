import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [stats, setStats] = useState({ eventos: 0, espacios: 0, usuarios: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [eventosRes, espaciosRes] = await Promise.all([
          fetch('http://localhost:3000/evento'),
          fetch('http://localhost:3000/espacio')
        ]);

        if (!eventosRes|| !espaciosRes) {
          throw new Error('Error al obtener las estadísticas');
        }

        const eventosData = await eventosRes.json();
        const espaciosData = await espaciosRes.json();
       

        setStats({
          eventos: eventosData.length,
          espacios: espaciosData.length,
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
    <div>
      <h1 className="mb-4">Panel de Administración</h1>
      <p className="lead">Bienvenido al panel de control. Aquí tienes un resumen de tu aplicación.</p>

      {loading && <div className="text-center">Cargando estadísticas...</div>}
      {error && <div className="alert alert-danger">Error: {error}</div>}

      {!loading && !error && (
        <div className="row">
          {/* Card Eventos */}
          <div className="col-md-4 mb-4">
            <div className="card text-white bg-primary h-100">
              <div className="card-body">
                <h5 className="card-title">Eventos</h5>
                <p className="card-text display-4">{stats.eventos}</p>
                <Link to="/eventos" className="btn btn-light">Gestionar Eventos</Link>
              </div>
            </div>
          </div>

          {/* Card Espacios */}
          <div className="col-md-4 mb-4">
            <div className="card text-white bg-success h-100">
              <div className="card-body">
                <h5 className="card-title">Espacios</h5>
                <p className="card-text display-4">{stats.espacios}</p>
                <Link to="/espacios" className="btn btn-light">Gestionar Espacios</Link>
              </div>
            </div>
          </div>
        
        </div>
      )}
    </div>
  );
}

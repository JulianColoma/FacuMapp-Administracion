import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Eventos() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const response = await fetch("http://localhost:3000/evento");
        if (!response.ok) {
          throw new Error("Error al obtener los eventos");
        }
        const data = await response.json();
        setEventos(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEventos();
  }, []);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Eventos</h1>
      <div className="row">
        {eventos.map((ev) => (
          <div key={ev.id} className="col-12 col-md-4 mb-3">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{ev.nombre}</h5>
                <p className="card-text">{ev.descripcion}</p>
                <p className="card-text"><small className="text-muted">{new Date(ev.fecha_inicio).toLocaleDateString()} - {new Date(ev.fecha_fin).toLocaleDateString()}</small></p>
                <Link to={`/eventos/${ev.id}`} className="btn btn-primary">
                  Ver actividades
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Eventos() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    fetchEventos();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este evento?")) {
      try {
        const response = await fetch(`http://localhost:3000/evento/${id}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Error al eliminar el evento");
        }

        fetchEventos(); // Recargar eventos
      } catch (error) {
        setError(error.message);
      }
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container-fluid px-4 mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="display-6 fw-bold">Gestión de Eventos</h1>
        <Link to="/add-evento" className="btn btn-primary">
          Agregar Evento
        </Link>
      </div>
      <div className="row">
        {eventos.map((ev) => (
          <div key={ev.id} className="col-12 col-md-4 mb-3">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{ev.nombre}</h5>
                <p className="card-text">{ev.descripcion}</p>
                <p className="card-text">
                  <small className="text-muted">
                    {new Date(ev.fecha_inicio).toLocaleDateString()} -{" "}
                    {new Date(ev.fecha_fin).toLocaleDateString()}
                  </small>
                </p>
                <div className="d-flex justify-content-between align-items-center">
                  <Link
                    to={`/eventos/${ev.id}`}
                    className="btn btn-primary"
                  >
                    Ver actividades
                  </Link>
                  <div>
                    <Link
                      to={`/edit-evento/${ev.id}`}
                      className="btn btn-sm btn-outline-primary me-2"
                    >
                      Editar
                    </Link>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(ev.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

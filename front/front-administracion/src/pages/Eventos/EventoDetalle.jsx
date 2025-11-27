import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

export default function EventoDetalle() {
  const { id } = useParams();
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [evento, setEvento] = useState(null);
  const navigate = useNavigate();

  const fetchEventoYActividades = async () => {
    try {
      const eventoResponse = await fetch(`http://localhost:3000/evento/${id}`);
      if (!eventoResponse.ok) {
        throw new Error("Error al obtener los detalles del evento");
      }
      const eventoData = await eventoResponse.json();
      setEvento(eventoData);

      const actividadesResponse = await fetch(
        `http://localhost:3000/actividadEv/${id}`
      );
      if (!actividadesResponse.ok) {
        throw new Error("Error al obtener las actividades");
      }
      const actividadesData = await actividadesResponse.json();
      setActividades(actividadesData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventoYActividades();
  }, [id]);

  const handleDelete = async (actividadId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta actividad?")) {
      try {
        const response = await fetch(
          `http://localhost:3000/actividad/${actividadId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Error al eliminar la actividad");
        }

        fetchEventoYActividades(); // Recargar actividades
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
        <h1 className="display-6 fw-bold">
          Actividades del {evento ? evento.nombre : "Evento"}
        </h1>
        <Link to={`/eventos/${id}/add-actividad`} className="btn btn-primary">
          Agregar Actividad
        </Link>
      </div>
      {actividades.length > 0 ? (
        <div className="row">
          {actividades.map((act) => (
            <div key={act.id} className="col-12 col-md-6 col-lg-4 mb-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{act.nombre}</h5>
                  <p className="card-text">{act.descripcion}</p>
                  <p className="card-text">
                    <small className="text-muted">
                      {new Date(act.fecha).toLocaleDateString()}
                    </small>
                  </p>
                  <p className="card-text">
                    <small className="text-muted">
                      {act.hora_inicio} - {act.hora_fin}
                    </small>
                  </p>
                  <div className="d-flex justify-content-between">
                    <Link
                      to={`/eventos/${id}/edit-actividad/${act.id}`}
                      className="btn btn-sm btn-outline-primary"
                    >
                      Editar
                    </Link>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(act.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No hay actividades para este evento.</p>
      )}
    </div>
  );
}

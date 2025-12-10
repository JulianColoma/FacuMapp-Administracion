import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { API_URL } from "../../config";

export default function EventoDetalle() {
  const { id } = useParams();
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [evento, setEvento] = useState(null);
  const navigate = useNavigate();

  const fetchEventoYActividades = async () => {
    try {
      const eventoResponse = await fetch(`${API_URL}/evento/${id}`);
      if (!eventoResponse.ok) {
        throw new Error("Error al obtener los detalles del evento");
      }
      const eventoData = await eventoResponse.json();
      setEvento(eventoData);

      const actividadesResponse = await fetch(
        `${API_URL}/actividadEv/${id}`
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
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertir esta acción",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${API_URL}/actividad/${actividadId}`,
          {
            method: "DELETE",
            credentials: "include",
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        if (!response.ok) {
          if (response.status === 403) {
            throw new Error("No tienes permisos para eliminar actividades. Debes ser administrador.");
          }
          throw new Error("Error al eliminar la actividad");
        }

        await Swal.fire({
          icon: "success",
          title: "¡Eliminado!",
          text: "La actividad ha sido eliminada",
          confirmButtonText: "Aceptar"
        });
        fetchEventoYActividades(); // Recargar actividades
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message.includes("permisos") ? error.message : "Error al eliminar la actividad",
          confirmButtonText: "Aceptar"
        });
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

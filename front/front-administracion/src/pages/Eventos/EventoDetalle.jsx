import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { API_URL } from "../../config";
import "../../App.scss";

export default function EventoDetalle() {
  const { id } = useParams();
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [evento, setEvento] = useState(null);

  const isEventoPast = (endValue) => {
    if (!endValue) return false;
    const datePart = String(endValue).split("T")[0];
    const endDate = new Date(`${datePart}T23:59:59`);
    return endDate < new Date();
  };

  const isActividadPast = (actividad) => {
    if (!actividad?.fecha) return false;
    const datePart = String(actividad.fecha).split("T")[0];
    const timePart = actividad.hora_fin ? String(actividad.hora_fin) : "23:59:59";
    const endDate = new Date(`${datePart}T${timePart}`);
    return endDate < new Date();
  };

  const fetchEventoYActividades = useCallback(async () => {
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
  }, [id]);

  useEffect(() => {
    fetchEventoYActividades();
  }, [fetchEventoYActividades]);

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
        {isEventoPast(evento?.fecha_fin || evento?.fecha_inicio) ? (
          <button type="button" className="btn btn-secondary" disabled>
            Evento finalizado
          </button>
        ) : (
          <Link to={`/eventos/${id}/add-actividad`} className="btn btn-primary">
            Agregar Actividad
          </Link>
        )}
      </div>
      {actividades.length > 0 ? (
        <div className="actividades-grid">
          {actividades.map((act) => {
            const actividadPasada = isActividadPast(act);
            return (
            <div key={act.id} className="actividad-card">
              <div className="actividad-card-body">
                <h5 className="actividad-card-title">{act.nombre}</h5>

                <p className="actividad-card-description">
                  {act.descripcion}
                </p>

                <div className="actividad-card-meta">
                  <div className="actividad-meta-item">
                    <i className="bi bi-calendar-day"></i>
                    <span>{act.fecha.split('-').reverse().join('/')}</span>
                  </div>

                  <div className="actividad-meta-item">
                    <i className="bi bi-clock"></i>
                    <span>{act.hora_inicio} - {act.hora_fin}</span>
                  </div>

                  <div className="actividad-meta-item">
                    <i className="bi bi-geo-alt"></i>
                    <span>{act.espacio_nombre}</span>
                  </div>
                </div>

                <div className="actividad-card-actions">
                  {!actividadPasada && (
                    <Link
                      to={`/eventos/${id}/edit-actividad/${act.id}`}
                      className="evento-btn-icon"
                      title="Editar actividad"
                    >
                      <i className="bi bi-pencil"></i>
                    </Link>
                  )}

                  {!actividadPasada && (
                    <button
                      className="evento-btn-icon evento-btn-delete"
                      onClick={() => handleDelete(act.id)}
                      title="Eliminar actividad"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
            );
          })}
        </div>
      ) : (
        <p>No hay actividades para este evento.</p>
      )}
    </div>
  );
}

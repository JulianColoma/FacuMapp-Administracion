import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { API_URL } from "../../config";

export default function Eventos() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchEventos = async () => {
    try {
      const response = await fetch(`${API_URL}/evento`);
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
        const response = await fetch(`${API_URL}/evento/${id}`, {
          method: "DELETE",
          credentials: "include",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          if (response.status === 403) {
            throw new Error("No tienes permisos para eliminar eventos. Debes ser administrador.");
          }
          throw new Error("Error al eliminar el evento");
        }

        await Swal.fire({
          icon: "success",
          title: "¡Eliminado!",
          text: "El evento ha sido eliminado",
          confirmButtonText: "Aceptar"
        });
        fetchEventos();
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message.includes("permisos") ? error.message : "Error al eliminar el evento",
          confirmButtonText: "Aceptar"
        });
      }
    }
  };

  const filteredEventos = eventos.filter(ev =>
    ev.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ev.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="page-container">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando eventos...</span>
          </div>
          <p className="text-muted mt-3">Cargando eventos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="alert alert-danger d-flex align-items-center">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>
            <i className="bi bi-calendar-event me-2"></i>
            Gestión de Eventos
          </h1>
          <p className="text-muted mb-0">
            {eventos.length} {eventos.length === 1 ? 'evento registrado' : 'eventos registrados'}
          </p>
        </div>
        <Link to="/add-evento" className="btn btn-success">
          <i className="bi bi-plus-circle me-2"></i>
          Agregar Evento
        </Link>
      </div>

      <div className="custom-card mb-4">
        <div className="position-relative">
          <i className="bi bi-search position-absolute" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d' }}></i>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar eventos por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredEventos.length === 0 ? (
        <div className="custom-card text-center py-5">
          <i className="bi bi-calendar-event display-1 text-muted mb-3"></i>
          <h4 className="text-muted">
            {searchTerm ? 'No se encontraron eventos' : 'No hay eventos registrados'}
          </h4>
          <p className="text-muted mb-4">
            {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando tu primer evento'}
          </p>
          {!searchTerm && (
            <Link to="/add-evento" className="btn btn-custom">
              <i className="bi bi-plus-circle me-2"></i>
              Agregar Primer Evento
            </Link>
          )}
        </div>
      ) : (
        <div className="grid-container">
          {filteredEventos.map((ev) => (
            <div key={ev.id} className="custom-card">
              <div className="p-3">
                <div className="d-flex align-items-start justify-content-between mb-3">
                  <h5 className="card-title mb-0">{ev.nombre}</h5>
                  {ev.nombre_espacio && (
                    <span className="badge bg-success">
                      <i className="bi bi-geo-alt me-1"></i>
                      {ev.nombre_espacio}
                    </span>
                  )}
                </div>
                
                <p className="card-text text-muted mb-3">{ev.descripcion}</p>
                
                <div className="d-flex align-items-center mb-3">
                  <i className="bi bi-calendar-range text-primary me-2"></i>
                  <span className="text-muted">
                    {ev.fecha_inicio.split('-').reverse().join('/')} - {ev.fecha_fin.split('-').reverse().join('/')}
                  </span>
                </div>

                <div className="d-flex gap-2">
                  <Link
                    to={`/eventos/${ev.id}`}
                    className="btn btn-info text-white flex-grow-1"
                  >
                    <i className="bi bi-list-ul me-2"></i>
                    Ver Actividades
                  </Link>
                  <Link
                    to={`/edit-evento/${ev.id}`}
                    className="btn btn-warning text-white"
                  >
                    <i className="bi bi-pencil-square me-2"></i>
                    Editar
                  </Link>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(ev.id)}
                  >
                    <i className="bi bi-trash-fill me-2"></i>
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

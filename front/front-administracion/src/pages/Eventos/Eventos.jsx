import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { API_URL } from "../../config";

export default function Eventos() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;


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

  const isEventoPast = (evento) => {
    const endValue = evento?.fecha_fin || evento?.fecha_inicio;
    if (!endValue) return false;
    const datePart = String(endValue).split("T")[0];
    const endDate = new Date(`${datePart}T23:59:59`);
    return endDate < new Date();
  };

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

  const totalPages = Math.ceil(filteredEventos.length / ITEMS_PER_PAGE);

  const paginatedEventos = filteredEventos.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );


  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);



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
        <Link to="/add-evento" className="btn btn-primary px-4">
          <i className="bi bi-plus-circle me-2"></i>
          Agregar Evento
        </Link>
      </div>

      <div className="row mb-4">
        <div className="col-12">
          <input
            type="text"
            className="form-control form-control-custom"
            placeholder="Buscar eventos..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
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
        <>
          <div className="eventos-grid">
            {paginatedEventos.map((ev) => {
              const eventoPasado = isEventoPast(ev);
              return (
              <div key={ev.id} className="evento-card-compact">
                <div className="evento-card-content">
                  <div className="evento-card-header">
                    <div className="evento-header-main">
                      <h5 className="evento-card-title">{ev.nombre}</h5>

                      {ev.nombre_espacio && (
                        <div className="evento-card-location">
                          <i className="bi bi-geo-alt-fill"></i>
                          <span>{ev.nombre_espacio}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="evento-card-description">{ev.descripcion}</p>

                  <div className="evento-card-dates">
                    <i className="bi bi-calendar-check"></i>
                    <span className="date-text">
                      {ev.fecha_inicio.split("-").reverse().join("/")}
                    </span>
                    <span className="date-separator">→</span>
                    <span className="date-text">
                      {ev.fecha_fin.split("-").reverse().join("/")}
                    </span>
                  </div>

                  <div className="evento-card-actions">
                    <Link
                      to={`/eventos/${ev.id}`}
                      className="evento-btn evento-btn-primary"
                    >
                      <i className="bi bi-list-ul"></i>
                      <span>Ver Actividades</span>
                    </Link>

                    {!eventoPasado && (
                      <Link
                        to={`/edit-evento/${ev.id}`}
                        className="evento-btn-icon"
                        title="Editar evento"
                      >
                        <i className="bi bi-pencil"></i>
                      </Link>
                    )}

                    {!eventoPasado && (
                      <button
                        className="evento-btn-icon evento-btn-delete"
                        onClick={() => handleDelete(ev.id)}
                        title="Eliminar evento"
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

          {totalPages > 1 && (
            <div className="pagination-futuristic">
              <button
                className="pagination-btn prev"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <i className="bi bi-chevron-left"></i>
                <span>Anterior</span>
              </button>

              <div className="pagination-indicator">
                {currentPage} / {totalPages}
              </div>

              <button
                className="pagination-btn next"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <span>Siguiente</span>
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}


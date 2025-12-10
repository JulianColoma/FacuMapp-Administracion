import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { API_URL } from "../../config";

export default function Espacios() {
  const [espacios, setEspacios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchEspacios = async () => {
    try {
      const response = await fetch(`${API_URL}/espacio`);
      if (!response.ok) {
        throw new Error("Error al obtener los espacios");
      }
      const data = await response.json();
      setEspacios(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEspacios();
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
        const response = await fetch(`${API_URL}/espacio/${id}`, {
          method: "DELETE",
          credentials: "include",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          if (response.status === 403) {
            throw new Error("No tienes permisos para eliminar espacios. Debes ser administrador.");
          }
          throw new Error("Error al eliminar el espacio");
        }

        await Swal.fire({
          icon: "success",
          title: "¡Eliminado!",
          text: "El espacio ha sido eliminado",
          confirmButtonText: "Aceptar"
        });
        fetchEspacios();
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message.includes("permisos") ? error.message : "Error al eliminar el espacio",
          confirmButtonText: "Aceptar"
        });
      }
    }
  };

  const filteredEspacios = espacios.filter(esp =>
    esp.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    esp.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="page-container">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando espacios...</span>
          </div>
          <p className="text-muted mt-3">Cargando espacios...</p>
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
            <i className="bi bi-building me-2"></i>
            Gestión de Espacios
          </h1>
          <p className="text-muted mb-0">
            {espacios.length} {espacios.length === 1 ? 'espacio registrado' : 'espacios registrados'}
          </p>
        </div>
        <Link to="/add-espacio" className="btn btn-success">
          <i className="bi bi-plus-circle me-2"></i>
          Agregar Espacio
        </Link>
      </div>

      <div className="custom-card mb-4">
        <div className="position-relative">
          <i className="bi bi-search position-absolute" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d' }}></i>
          <input
            type="text"
            className="form-control ps-5"
            placeholder="Buscar espacios por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredEspacios.length === 0 ? (
        <div className="custom-card text-center py-5">
          <i className="bi bi-building display-1 text-muted mb-3"></i>
          <h4 className="text-muted">
            {searchTerm ? 'No se encontraron espacios' : 'No hay espacios registrados'}
          </h4>
          <p className="text-muted mb-4">
            {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando tu primer espacio'}
          </p>
          {!searchTerm && (
            <Link to="/add-espacio" className="btn btn-custom">
              <i className="bi bi-plus-circle me-2"></i>
              Agregar Primer Espacio
            </Link>
          )}
        </div>
      ) : (
        <div className="grid-container">
          {filteredEspacios.map((esp) => (
            <div key={esp.id} className="custom-card">
              <div className="space-card-image">
                <img
                  src={esp.imagen ? `${API_URL}/uploads/${esp.imagen}` : "/images/no-image.png"}
                  alt={esp.nombre}
                  onError={(e) => { e.target.src = "/images/no-image.png"; }}
                />
              </div>
              <div className="p-3">
                <h5 className="card-title mb-2">{esp.nombre}</h5>
                <p className="card-text text-muted mb-3">{esp.descripcion}</p>
                <div className="d-flex align-items-center mb-3">
                  <i className="bi bi-people text-primary me-2"></i>
                  <span className="text-muted">Capacidad: {esp.capacidad} personas</span>
                </div>
                <div className="d-flex gap-2">
                  <Link
                    to={`/edit-espacio/${esp.id}`}
                    className="btn btn-warning text-white flex-grow-1"
                  >
                    <i className="bi bi-pencil-square me-2"></i>
                    Editar
                  </Link>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(esp.id)}
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

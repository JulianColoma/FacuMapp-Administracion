import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { API_URL } from "../config";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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
        const response = await fetch(`${API_URL}/deleteuser/${id}`, {
          method: "DELETE",
          credentials: "include",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          if (response.status === 403) {
            throw new Error("No tienes permisos para eliminar usuarios. Debes ser administrador.");
          }
          throw new Error("Error al eliminar el usuario");
        }

        await Swal.fire({
          icon: "success",
          title: "¡Eliminado!",
          text: "El usuario ha sido eliminado",
          confirmButtonText: "Aceptar"
        });
        setUsuarios((prev) => prev.filter((u) => u.id !== id));
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message.includes("permisos") ? error.message : "Error al eliminar el usuario",
          confirmButtonText: "Aceptar"
        });
      }
    }
  };

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await fetch(`${API_URL}/getuser`);
        if (!response.ok) {
          throw new Error("Error al obtener los usuarios");
        }
        const data = await response.json();
        setUsuarios(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, []);

  const filteredUsuarios = usuarios.filter((u) =>
    u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.administrador ? "administrador" : "usuario").includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="page-container">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando usuarios...</span>
          </div>
          <p className="text-muted mt-3">Cargando usuarios...</p>
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
            <i className="bi bi-people me-2"></i>
            Gestión de Usuarios
          </h1>
          <p className="text-muted mb-0">
            {usuarios.length} {usuarios.length === 1 ? "usuario registrado" : "usuarios registrados"}
          </p>
        </div>
        <Link to="/add-user" className="btn btn-success">
          <i className="bi bi-plus-circle me-2"></i>
          Agregar Usuario
        </Link>
      </div>

      <div className="custom-card mb-4">
        <div className="position-relative">
          <i className="bi bi-search position-absolute" style={{ left: "12px", top: "50%", transform: "translateY(-50%)", color: "#6c757d" }}></i>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar usuarios por nombre o rol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredUsuarios.length === 0 ? (
        <div className="custom-card text-center py-5">
          <i className="bi bi-people display-1 text-muted mb-3"></i>
          <h4 className="text-muted">
            {searchTerm ? "No se encontraron usuarios" : "No hay usuarios registrados"}
          </h4>
          <p className="text-muted mb-4">
            {searchTerm ? "Intenta con otros términos de búsqueda" : "Comienza agregando tu primer usuario"}
          </p>
          {!searchTerm && (
            <Link to="/add-user" className="btn btn-custom">
              <i className="bi bi-plus-circle me-2"></i>
              Agregar Primer Usuario
            </Link>
          )}
        </div>
      ) : (
        <div className="custom-card">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="text-uppercase text-muted" style={{ width: "40%" }}>Nombre</th>
                  <th className="text-uppercase text-muted text-center" style={{ width: "30%" }}>Rol</th>
                  <th className="text-uppercase text-muted text-center" style={{ width: "30%" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsuarios.map((u) => (
                  <tr key={u.id}>
                    <td className="py-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="avatar bg-primary bg-opacity-10 text-primary fw-bold rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                          {u.nombre.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <div className="fw-semibold">{u.nombre}</div>
                          <div className="text-muted small">ID: {u.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <span
                        className={`badge px-3 py-2 rounded-pill ${u.administrador ? "bg-primary" : "bg-secondary text-dark bg-opacity-25"}`}
                      >
                        {u.administrador ? "Administrador" : "Usuario"}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(u.id)}>
                        <i className="bi bi-trash me-1"></i>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

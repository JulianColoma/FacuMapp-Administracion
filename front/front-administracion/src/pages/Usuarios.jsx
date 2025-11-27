import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:3000/deleteuser/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Error al eliminar el usuario");
      }
      setUsuarios(usuarios.filter((u) => u.id !== id));
    } catch (error) {
      alert("No se pudo eliminar el usuario: " + error.message);
    }
  };
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await fetch("http://localhost:3000/getuser");
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

  if (loading) {
    return <div className="p-5 text-center fs-4">Cargando usuarios...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-danger m-4 p-4 fs-5">Error: {error}</div>
    );
  }

  return (
    <div className="container-fluid px-4 mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="display-6 fw-bold">Gestión de Usuarios</h1>
        <Link to="/add-user" className="btn btn-primary">
          Agregar Usuario
        </Link>
      </div>

      <div className="card shadow-sm rounded-4 overflow-hidden border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped table-hover mb-0 fs-5 align-middle">
              <thead className="table-dark text-uppercase fs-6">
                <tr>
                  <th scope="col" className="p-4">
                    Nombre
                  </th>
                  <th scope="col" className="p-4 text-center">
                    Rol
                  </th>
                  <th scope="col" className="p-4 text-center">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id}>
                    <td className="p-4">{u.nombre}</td>
                    <td className="p-4 text-center">
                      <span
                        className={`badge fs-6 px-4 py-2 rounded-pill ${
                          u.administrador
                            ? "bg-primary bg-gradient"
                            : "bg-secondary bg-gradient text-dark bg-opacity-25"
                        }`}
                      >
                        {u.administrador ? "Administrador" : "Usuario"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(u.id)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

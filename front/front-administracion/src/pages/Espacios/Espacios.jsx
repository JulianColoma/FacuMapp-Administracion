import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Espacios() {
  const [espacios, setEspacios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEspacios = async () => {
    try {
      const response = await fetch("http://localhost:3000/espacio");
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
    if (window.confirm("¿Estás seguro de que quieres eliminar este espacio?")) {
      try {
        const response = await fetch(`http://localhost:3000/espacio/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Error al eliminar el espacio");
        }

        fetchEspacios(); // Recargar espacios
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
        <h1 className="display-6 fw-bold">Gestión de Espacios</h1>
        <Link to="/add-espacio" className="btn btn-primary">
          Agregar Espacio
        </Link>
      </div>
      <div className="row">
        {espacios.map((esp) => (
          <div key={esp.id} className="col-12 col-md-4 mb-3">
            <div className="card">
              {esp.imagen ? (
                <img
                  src={`http://localhost:3000/uploads/${esp.imagen}`}
                  className="card-img-top"
                  alt={esp.nombre}
                  style={{ height: "200px", objectFit: "cover" }}
                />
              ) : (
                <div
                  className="card-img-top bg-secondary"
                  style={{ height: "200px" }}
                ></div>
              )}
              <div className="card-body">
                <h5 className="card-title">{esp.nombre}</h5>
                <p className="card-text">{esp.descripcion}</p>
                <p className="card-text">
                  <small className="text-muted">Capacidad: {esp.capacidad}</small>
                </p>
                <div className="d-flex justify-content-end">
                  <Link
                    to={`/edit-espacio/${esp.id}`}
                    className="btn btn-sm btn-outline-primary me-2"
                  >
                    Editar
                  </Link>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(esp.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { API_URL } from "../../config";

export default function Espacios() {
  const [espacios, setEspacios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        fetchEspacios(); // Recargar espacios
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
              <img
                src={esp.imagen ? `${API_URL}/uploads/${esp.imagen}` : "/images/no-image.png"}
                className="card-img-top"
                alt={esp.nombre}
                style={{ height: "200px", objectFit: "cover" }}
                onError={(e) => { e.target.src = "/images/no-image.png"; }}
              />
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

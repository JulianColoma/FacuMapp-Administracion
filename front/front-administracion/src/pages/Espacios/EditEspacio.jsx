import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function EditEspacio() {
  const { id } = useParams();
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [capacidad, setCapacidad] = useState("");
  const [imagen, setImagen] = useState(null);
  const [currentImagen, setCurrentImagen] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEspacio = async () => {
      try {
        const response = await fetch(`http://localhost:3000/espacio/${id}`);
        if (!response.ok) {
          throw new Error("Error al obtener el espacio");
        }
        const data = await response.json();
        setNombre(data.nombre);
        setDescripcion(data.descripcion);
        setCapacidad(data.capacidad);
        setCurrentImagen(data.imagen);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEspacio();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("descripcion", descripcion);
    formData.append("capacidad", capacidad);
    if (imagen) {
      formData.append("imagen", imagen);
    }

    try {
      const response = await fetch(`http://localhost:3000/espacio/${id}`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el espacio");
      }

      navigate("/espacios");
    } catch (error) {
      setError(error.message);
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
      <h1 className="mb-4 display-6 fw-bold">Editar Espacio</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="nombre" className="form-label">
            Nombre
          </label>
          <input
            type="text"
            className="form-control"
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="descripcion" className="form-label">
            Descripción
          </label>
          <textarea
            className="form-control"
            id="descripcion"
            rows="3"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
          ></textarea>
        </div>
        <div className="mb-3">
          <label htmlFor="capacidad" className="form-label">
            Capacidad
          </label>
          <input
            type="number"
            className="form-control"
            id="capacidad"
            value={capacidad}
            onChange={(e) => setCapacidad(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="imagen" className="form-label">
            Imagen (opcional)
          </label>
          {currentImagen && (
            <img
              src={`http://localhost:3000/uploads/${currentImagen}`}
              alt="Imagen actual"
              className="img-thumbnail mb-2"
              style={{ maxHeight: "150px" }}
            />
          )}
          <input
            type="file"
            className="form-control"
            id="imagen"
            onChange={(e) => setImagen(e.target.files[0])}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Guardar Cambios
        </button>
      </form>
    </div>
  );
}

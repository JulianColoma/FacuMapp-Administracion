import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function EditEvento() {
  const { id } = useParams();
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvento = async () => {
      try {
        const response = await fetch(`http://localhost:3000/evento/${id}`);
        if (!response.ok) {
          throw new Error("Error al obtener el evento");
        }
        const data = await response.json();
        setNombre(data.nombre);
        setDescripcion(data.descripcion);
        setFechaInicio(new Date(data.fecha_inicio).toISOString().split("T")[0]);
        setFechaFin(new Date(data.fecha_fin).toISOString().split("T")[0]);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvento();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:3000/evento/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre,
          descripcion,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el evento");
      }

      navigate("/eventos");
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
      <h1 className="mb-4 display-6 fw-bold">Editar Evento</h1>
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
          <label htmlFor="fechaInicio" className="form-label">
            Fecha de Inicio
          </label>
          <input
            type="date"
            className="form-control"
            id="fechaInicio"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="fechaFin" className="form-label">
            Fecha de Fin
          </label>
          <input
            type="date"
            className="form-control"
            id="fechaFin"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Guardar Cambios
        </button>
      </form>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddEvento() {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/evento", {
        method: "POST",
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
        throw new Error("Error al crear el evento");
      }

      navigate("/eventos");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="container-fluid px-4 mt-5">
      <h1 className="mb-4 display-6 fw-bold">Agregar Evento</h1>
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
          Crear Evento
        </button>
      </form>
    </div>
  );
}

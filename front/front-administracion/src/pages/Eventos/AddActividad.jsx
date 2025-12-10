import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../../config";

export default function AddActividad() {
  const { id } = useParams();
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [idEspacio, setIdEspacio] = useState("");
  const [espacios, setEspacios] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEspacios = async () => {
      try {
        const response = await fetch(`${API_URL}/espacio`, {
          credentials: "include",
        });
        const data = await response.json();
        setEspacios(data);
      } catch (error) {
        console.error("Error al cargar espacios:", error);
      }
    };

    fetchEspacios();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(`${API_URL}/actividad`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre,
          descripcion,
          fecha,
          hora_inicio: horaInicio,
          hora_fin: horaFin,
          id_espacio: parseInt(idEspacio),
          id_evento: parseInt(id),
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al crear la actividad");
      }

      navigate(`/eventos/${id}`);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="container-fluid px-4 mt-5">
      <h1 className="mb-4 display-6 fw-bold">Agregar Actividad</h1>
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
        <div className="mb-3">
          <label htmlFor="fecha" className="form-label">
            Fecha
          </label>
          <input
            type="date"
            className="form-control"
            id="fecha"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="espacio" className="form-label">
            Espacio
          </label>
          <select
            className="form-select"
            id="espacio"
            value={idEspacio}
            onChange={(e) => setIdEspacio(e.target.value)}
            required
          >
            <option value="">Seleccione un espacio</option>
            {espacios.map((espacio) => (
              <option key={espacio.id} value={espacio.id}>
                {espacio.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="row">
        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="horaInicio" className="form-label">
              Hora de Inicio
            </label>
            <input
              type="time"
              className="form-control"
              id="horaInicio"
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
              required
            />
          </div>
          <div className="col-md-6 mb-3">
            <label htmlFor="horaFin" className="form-label">
              Hora de Fin
            </label>
            <input
              type="time"
              className="form-control"
              id="horaFin"
              value={horaFin}
              onChange={(e) => setHoraFin(e.target.value)}
              required
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary">
          Crear Actividad
        </button>
      </form>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { API_URL } from "../../config";

export default function AddActividad() {
  const { id: eventoId } = useParams();
  const todayIso = new Date();
  todayIso.setHours(0, 0, 0, 0);
  const todayStr = todayIso.toISOString().split("T")[0];
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [idEspacio, setIdEspacio] = useState("");
  const [espacios, setEspacios] = useState([]);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadEspacios = async () => {
      try {
        const token = localStorage.getItem("token");
        const resp = await fetch(`${API_URL}/espacio`, {
          credentials: "include",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const data = await resp.json();
        setEspacios(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Error cargando espacios", e);
      }
    };
    loadEspacios();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);

    // Validaciones del lado cliente
    const cleanNombre = nombre.trim();
    const cleanDescripcion = descripcion.trim();
    const newErrors = {};

    if (!cleanNombre || cleanNombre.length < 1) {
      newErrors.nombre = "El nombre es obligatorio";
    } else if (cleanNombre.length > 255) {
      newErrors.nombre = "El nombre no puede exceder 255 caracteres";
    }

    if (!cleanDescripcion || cleanDescripcion.length < 1) {
      newErrors.descripcion = "La descripción es obligatoria";
    }

    if (!fecha) {
      newErrors.fecha = "La fecha es obligatoria";
    } else if (fecha < todayStr) {
      newErrors.fecha = "La fecha no puede ser anterior a hoy";
    }

    if (!horaInicio) {
      newErrors.horaInicio = "La hora de inicio es obligatoria";
    }

    if (!horaFin) {
      newErrors.horaFin = "La hora de fin es obligatoria";
    } else if (horaInicio && horaFin <= horaInicio) {
      newErrors.horaFin = "La hora de fin debe ser posterior a la hora de inicio";
    }

    if (!idEspacio) {
      newErrors.idEspacio = "Debes seleccionar un espacio";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/actividad`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          nombre: cleanNombre,
          descripcion: cleanDescripcion,
          fecha,
          hora_inicio: horaInicio,
          hora_fin: horaFin,
          id_evento: Number(eventoId),
          id_espacio: Number(idEspacio),
        }),
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("No tienes permisos para realizar esta acción. Debes ser administrador.");
        }
        const { error: backendError } = await response.json().catch(() => ({}));
        throw new Error(backendError || "Error al crear la actividad");
      }

      await Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Actividad creada exitosamente",
        confirmButtonText: "Aceptar"
      });
      navigate(`/eventos/${eventoId}`);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al guardar la actividad",
        confirmButtonText: "Aceptar"
      });
    }
  };

  return (
    <div className="container-fluid px-4 mt-5">
      <h1 className="mb-4 display-6 fw-bold">Agregar Actividad</h1>
      {generalError && <div className="alert alert-danger">{generalError}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="nombre" className="form-label">
            Nombre
          </label>
          <input
            type="text"
            className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
        </div>
        <div className="mb-3">
          <label htmlFor="descripcion" className="form-label">
            Descripción
          </label>
          <textarea
            className={`form-control ${errors.descripcion ? 'is-invalid' : ''}`}
            id="descripcion"
            rows="3"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          ></textarea>
          {errors.descripcion && <div className="invalid-feedback">{errors.descripcion}</div>}
        </div>
        <div className="mb-3">
          <label htmlFor="fecha" className="form-label">
            Fecha
          </label>
          <input
            type="date"
            className={`form-control ${errors.fecha ? 'is-invalid' : ''}`}
            id="fecha"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            onInvalid={(e) => e.target.setCustomValidity(' ')}
            onInput={(e) => e.target.setCustomValidity('')}
          />
          {errors.fecha && <div className="invalid-feedback">{errors.fecha}</div>}
        </div>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="horaInicio" className="form-label">
              Hora de Inicio
            </label>
            <input
              type="time"
              className={`form-control ${errors.horaInicio ? 'is-invalid' : ''}`}
              id="horaInicio"
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
              onInvalid={(e) => e.target.setCustomValidity(' ')}
              onInput={(e) => e.target.setCustomValidity('')}
            />
            {errors.horaInicio && <div className="invalid-feedback">{errors.horaInicio}</div>}
          </div>
          <div className="col-md-6 mb-3">
            <label htmlFor="horaFin" className="form-label">
              Hora de Fin
            </label>
            <input
              type="time"
              className={`form-control ${errors.horaFin ? 'is-invalid' : ''}`}
              id="horaFin"
              value={horaFin}
              onChange={(e) => setHoraFin(e.target.value)}
              onInvalid={(e) => e.target.setCustomValidity(' ')}
              onInput={(e) => e.target.setCustomValidity('')}
            />
            {errors.horaFin && <div className="invalid-feedback">{errors.horaFin}</div>}
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="espacio" className="form-label">
            Espacio
          </label>
          <select
            id="espacio"
            className={`form-select ${errors.idEspacio ? 'is-invalid' : ''}`}
            value={idEspacio}
            onChange={(e) => setIdEspacio(e.target.value)}
          >
            <option value="">Selecciona un espacio</option>
            {espacios.map((esp) => (
              <option key={esp.id} value={esp.id}>
                {esp.nombre}
              </option>
            ))}
          </select>
          {errors.idEspacio && <div className="invalid-feedback">{errors.idEspacio}</div>}
        </div>
        <button type="submit" className="btn btn-primary">
          Crear Actividad
        </button>
      </form>
    </div>
  );
}


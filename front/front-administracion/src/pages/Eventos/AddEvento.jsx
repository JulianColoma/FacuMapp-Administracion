import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { API_URL } from "../../config";

export default function AddEvento() {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);
  const navigate = useNavigate();

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

    if (!fechaInicio) {
      newErrors.fechaInicio = "La fecha de inicio es obligatoria";
    }

    if (!fechaFin) {
      newErrors.fechaFin = "La fecha de fin es obligatoria";
    } else if (fechaInicio && fechaFin < fechaInicio) {
      newErrors.fechaFin = "La fecha de fin no puede ser anterior a la fecha de inicio";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/evento`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          nombre: cleanNombre,
          descripcion: cleanDescripcion,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("No tienes permisos para realizar esta acción. Debes ser administrador.");
        }
        const { error: backendError } = await response.json().catch(() => ({}));
        throw new Error(backendError || "Error al crear el evento");
      }

      await Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Evento creado exitosamente",
        confirmButtonText: "Aceptar"
      });
      navigate("/eventos");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al guardar el evento",
        confirmButtonText: "Aceptar"
      });
    }
  };

  return (
    <div className="container-fluid px-4 mt-5">
      <h1 className="mb-4 display-6 fw-bold">Agregar Evento</h1>
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
          <label htmlFor="fechaInicio" className="form-label">
            Fecha de Inicio
          </label>
          <input
            type="date"
            className={`form-control ${errors.fechaInicio ? 'is-invalid' : ''}`}
            id="fechaInicio"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            onInvalid={(e) => e.target.setCustomValidity(' ')}
            onInput={(e) => e.target.setCustomValidity('')}
          />
          {errors.fechaInicio && <div className="invalid-feedback">{errors.fechaInicio}</div>}
        </div>
        <div className="mb-3">
          <label htmlFor="fechaFin" className="form-label">
            Fecha de Fin
          </label>
          <input
            type="date"
            className={`form-control ${errors.fechaFin ? 'is-invalid' : ''}`}
            id="fechaFin"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            onInvalid={(e) => e.target.setCustomValidity(' ')}
            onInput={(e) => e.target.setCustomValidity('')}
          />
          {errors.fechaFin && <div className="invalid-feedback">{errors.fechaFin}</div>}
        </div>
        <button type="submit" className="btn btn-primary">
          Crear Evento
        </button>
      </form>
    </div>
  );
}

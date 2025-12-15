import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { API_URL } from "../../config";

export default function EditEvento() {
  const { id } = useParams();
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [idEspacio, setIdEspacio] = useState("");
  const [espacios, setEspacios] = useState([]);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvento = async () => {
      try {
        const response = await fetch(`${API_URL}/evento/${id}`);
        if (!response.ok) {
          throw new Error("Error al obtener el evento");
        }
        const data = await response.json();
        setNombre(data.nombre);
        setDescripcion(data.descripcion);
        setFechaInicio(data.fecha_inicio || "");
        setFechaFin(data.fecha_fin || "");
        setIdEspacio(data.id_espacio || "");
      } catch (error) {
        setGeneralError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchEspacios = async () => {
      try {
        const response = await fetch(`${API_URL}/espacio`);
        if (!response.ok) {
          throw new Error("Error al obtener espacios");
        }
        const data = await response.json();
        setEspacios(data);
      } catch (error) {
        console.error("Error al cargar espacios:", error);
      }
    };

    fetchEvento();
    fetchEspacios();
  }, [id]);

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
    } else if (cleanDescripcion.length > 500) {
      newErrors.descripcion = "La descripción no puede exceder 500 caracteres";
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
      const response = await fetch(`${API_URL}/evento/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          nombre: cleanNombre,
          descripcion: cleanDescripcion,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          id_espacio: idEspacio ? parseInt(idEspacio) : undefined,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("No tienes permisos para realizar esta acción. Debes ser administrador.");
        }
        const { error: backendError } = await response.json().catch(() => ({}));
        throw new Error(backendError || "Error al actualizar el evento");
      }

      await Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Evento actualizado exitosamente",
        confirmButtonText: "Aceptar"
      });
      navigate("/eventos");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.message || "Error al actualizar el evento",
        confirmButtonText: "Aceptar"
      });
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando evento...</span>
          </div>
          <p className="text-muted mt-3">Cargando evento...</p>
        </div>
      </div>
    );
  }

  if (generalError && !nombre) {
    return (
      <div className="page-container">
        <div className="alert alert-danger d-flex align-items-center">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          Error: {generalError}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header ">
        <div>
          <h1>
            <i className="bi bi-pencil-square me-2"></i>
            Editar Evento
          </h1>
          <p className="text-muted mb-0">Modifique los campos que desee actualizar</p>
        </div>
      </div>

      <div className="card  border-0 p-4 shadow-sm">
        {generalError && (
          <div className="alert alert-danger d-flex align-items-center mb-4">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="nombre" className="form-label">
              Nombre del Evento
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
              rows="4"
              value={descripcion}
              maxLength={500}
              onChange={(e) => setDescripcion(e.target.value)}
            ></textarea>
            {errors.descripcion && <div className="invalid-feedback">{errors.descripcion}</div>}
            {!errors.descripcion && (
              <div className="form-text">{descripcion.length}/500</div>
            )}
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="fechaInicio" className="form-label">
                <i className="bi bi-calendar-check me-2"></i>
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

            <div className="col-md-6 mb-3">
              <label htmlFor="fechaFin" className="form-label">
                <i className="bi bi-calendar-x me-2"></i>
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
          </div>

          <div className="mb-4">
            <label htmlFor="espacio" className="form-label">
              <i className="bi bi-geo-alt me-2"></i>
              Espacio (Opcional)
            </label>
            <select
              className="form-control"
              id="espacio"
              value={idEspacio}
              onChange={(e) => setIdEspacio(e.target.value)}
            >
              <option value="">-- Seleccionar un espacio --</option>
              {espacios.map((espacio) => (
                <option key={espacio.id} value={espacio.id}>
                  {espacio.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="d-flex gap-2 justify-content-end">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate('/eventos')}
            >
              <i className="bi bi-x-circle me-2"></i>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary px-4">
              <i className="bi bi-check-circle me-2"></i>
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

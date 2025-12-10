import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { API_URL } from "../../config";

export default function EditEspacio() {
  const { id } = useParams();
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [capacidad, setCapacidad] = useState("");
  const [imagen, setImagen] = useState(null);
  const [currentImagen, setCurrentImagen] = useState(null);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEspacio = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/espacio/${id}` , {
          credentials: "include",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!response.ok) {
          throw new Error("Error al obtener el espacio");
        }
        const data = await response.json();
        setNombre(data.nombre || "");
        setDescripcion(data.descripcion || "");
        setCapacidad(data.capacidad ?? "");
        setCurrentImagen(data.imagen);
      } catch (error) {
        setGeneralError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEspacio();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);

    // Validaciones del lado cliente
    const cleanNombre = nombre.trim();
    const cleanDescripcion = descripcion.trim();
    const numCapacidad = Number(capacidad);
    const newErrors = {};

    if (!cleanNombre || cleanNombre.length < 1) {
      newErrors.nombre = "El nombre es obligatorio";
    } else if (cleanNombre.length > 255) {
      newErrors.nombre = "El nombre no puede exceder 255 caracteres";
    }

    if (!cleanDescripcion || cleanDescripcion.length < 1) {
      newErrors.descripcion = "La descripción es obligatoria";
    }

    if (!capacidad || isNaN(numCapacidad) || numCapacidad < 1) {
      newErrors.capacidad = "La capacidad es obligatoria y debe ser mayor a 0";
    } else if (!Number.isInteger(numCapacidad)) {
      newErrors.capacidad = "La capacidad debe ser un número entero";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const formData = new FormData();
    formData.append("nombre", cleanNombre);
    formData.append("descripcion", cleanDescripcion);
    formData.append("capacidad", numCapacidad);
    if (imagen) {
      formData.append("imagen", imagen);
    }

    try {
      const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/espacio/${id}`, {
          method: "PUT",
          body: formData,
          credentials: "include",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("No tienes permisos para realizar esta acción. Debes ser administrador.");
        }
        const { error: backendError } = await response.json().catch(() => ({}));
        throw new Error(backendError || "Error al actualizar el espacio");
      }

      await Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Espacio actualizado exitosamente",
        confirmButtonText: "Aceptar"
      });
      navigate("/espacios");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al actualizar el espacio",
        confirmButtonText: "Aceptar"
      });
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
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
      <div className="page-header">
        <div>
          <h1>
            <i className="bi bi-pencil-square me-2"></i>
            Editar Espacio
          </h1>
          <p className="text-muted mb-0">Modifique los campos que desee actualizar</p>
        </div>
      </div>

      <div className="custom-card">
        {generalError && (
          <div className="alert alert-danger d-flex align-items-center mb-4">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="nombre" className="form-label">
                <i className="bi bi-building me-2"></i>
                Nombre del Espacio
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

            <div className="col-md-6 mb-3">
              <label htmlFor="capacidad" className="form-label">
                <i className="bi bi-people me-2"></i>
                Capacidad
              </label>
              <input
                type="number"
                className={`form-control ${errors.capacidad ? 'is-invalid' : ''}`}
                id="capacidad"
                value={capacidad}
                onChange={(e) => setCapacidad(e.target.value)}
              />
              {errors.capacidad && <div className="invalid-feedback">{errors.capacidad}</div>}
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="descripcion" className="form-label">
              <i className="bi bi-text-paragraph me-2"></i>
              Descripción
            </label>
            <textarea
              className={`form-control ${errors.descripcion ? 'is-invalid' : ''}`}
              id="descripcion"
              rows="4"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            ></textarea>
            {errors.descripcion && <div className="invalid-feedback">{errors.descripcion}</div>}
          </div>

          <div className="mb-4">
            <label htmlFor="imagen" className="form-label">
              <i className="bi bi-image me-2"></i>
              Imagen
            </label>
            {currentImagen && (
              <div className="mb-3">
                <p className="text-muted mb-2">Imagen actual:</p>
                <img
                  src={`${API_URL}/uploads/${currentImagen}`}
                  alt="Imagen actual"
                  className="img-thumbnail"
                  style={{ maxHeight: "200px", maxWidth: "100%" }}
                />
              </div>
            )}
            <input
              type="file"
              className="form-control"
              id="imagen"
              accept="image/*"
              onChange={(e) => setImagen(e.target.files[0])}
            />
            <small className="text-muted">Seleccione una nueva imagen solo si desea cambiarla</small>
          </div>

          <div className="d-flex gap-2 justify-content-end">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate('/espacios')}
            >
              <i className="bi bi-x-circle me-2"></i>
              Cancelar
            </button>
            <button type="submit" className="btn btn-success">
              <i className="bi bi-check-circle me-2"></i>
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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
    return <div>Error: {generalError}</div>;
  }

  return (
    <div className="container-fluid px-4 mt-5">
      <h1 className="mb-4 display-6 fw-bold">Editar Espacio</h1>
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
          <label htmlFor="capacidad" className="form-label">
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
        <div className="mb-3">
          <label htmlFor="imagen" className="form-label">
            Imagen (opcional)
          </label>
          {currentImagen && (
            <img
              src={`${API_URL}/uploads/${currentImagen}`}
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

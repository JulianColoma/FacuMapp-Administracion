import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { API_URL } from "../../config";
import CategoryManagerModal from "../../components/CategoryManagerModal";

export default function EditEspacio() {
  const { id } = useParams();
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [capacidad, setCapacidad] = useState("");
  const [imagen, setImagen] = useState(null);
  const [currentImagen, setCurrentImagen] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [initialSelectedCategories, setInitialSelectedCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEspacio = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/espacio/${id}`, {
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
        // si el endpoint devuelve categorías asociadas
        if (data.categorias && Array.isArray(data.categorias)) {
          const ids = data.categorias.map((c) => c.id);
          setSelectedCategories(ids);
          setInitialSelectedCategories(ids);
        }
      } catch (error) {
        setGeneralError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEspacio();
    // fetch all categorias disponibles
    const fetchCategorias = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/categoria`, {
          credentials: "include",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (res.ok) {
          const cats = await res.json();
          setCategories(cats || []);
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchCategorias();
  }, [id]);

  const handleCategoriesChange = (categoryIds) => {
    setSelectedCategories(categoryIds);
  };

  const syncCategorias = async () => {
    const toAdd = selectedCategories.filter((id) => !initialSelectedCategories.includes(id));
    const toRemove = initialSelectedCategories.filter((id) => !selectedCategories.includes(id));
    const token = localStorage.getItem('token');

    for (const catId of toAdd) {
      try {
        const res = await fetch(`${API_URL}/espaciocat/${id}`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ categoria: catId }),
        });
        if (!res.ok) console.error('Error adding categoria', catId);
      } catch (e) {
        console.error(e);
      }
    }

    for (const catId of toRemove) {
      try {
        const res = await fetch(`${API_URL}/espaciocat/${id}`, {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ categoria: catId }),
        });
        if (!res.ok) console.error('Error removing categoria', catId);
      } catch (e) {
        console.error(e);
      }
    }
    // after syncing, update initialSelectedCategories
    setInitialSelectedCategories([...selectedCategories]);
  };

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

      // sincronizar categorias asociadas al espacio
      await syncCategorias();

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
          <i className="bi bi-building me-2"></i>

          Error: {generalError}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Editar espacio</h1>
        <p className="page-subtitle">Modifique los campos que desee actualizar</p>
      </div>

      <div className="custom-card ">
        <form onSubmit={handleSubmit}>
          <div className="form-content">

          {/* Nombre + Capacidad */}
          <div className="m4">
            <div className="row g-3">
              {/* Nombre ocupa más espacio */}
              <div className="col-md-8">
                <label className="form-label d-block">
                  Nombre del espacio
                </label>
                <input
                  className={`form-control w-100 ${errors.nombre ? "is-invalid" : ""}`}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
                {errors.nombre && (
                  <div className="invalid-feedback">{errors.nombre}</div>
                )}
              </div>

              {/* Capacidad más chica */}
              <div className="col-md-4">
                <label className="form-label d-block">
                  Capacidad
                </label>
                <input
                  type="number"
                  className={`form-control w-100 ${errors.capacidad ? "is-invalid" : ""}`}
                  value={capacidad}
                  onChange={(e) => setCapacidad(e.target.value)}
                />
                {errors.capacidad && (
                  <div className="invalid-feedback">{errors.capacidad}</div>
                )}
              </div>
            </div>
          </div>



          {/* Descripción */}
          <div className="m4">
            <label className="form-label d-block">
              Descripción
            </label>
            <textarea
              rows="5"
              className={`form-control w-100 ${errors.descripcion ? "is-invalid" : ""}`}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
            {errors.descripcion && (
              <div className="invalid-feedback">{errors.descripcion}</div>
            )}
          </div>


          {/* Imagen */}
          {/* Imagen */}
          <div className="mb-4">
            <label className="form-label d-block mb-2">
              Imagen del espacio
            </label>

            {currentImagen && (
              <div className="image-preview mb-3">
                <img
                  src={`${API_URL}/uploads/${currentImagen}`}
                  alt="Imagen actual"
                  style={{ maxHeight: 180 }}
                />
              </div>
            )}

            <input
              type="file"
              className="form-control w-100"
              accept="image/*"
              onChange={e => setImagen(e.target.files[0])}
            />

            <small className="text-muted d-block mt-2">
              Solo seleccione una imagen si desea reemplazar la actual
            </small>
          </div>

          {/* Categorías */}
          {/* Categorías */}
          <div className="m4">
            <label className="form-label d-block mb-2">
              Categorías
            </label>

            {/* Categorías existentes */}
            <div className="d-flex flex-wrap gap-2 mb-4">
              {categories.filter(cat => selectedCategories.includes(cat.id)).map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  className="btn btn-sm"
                  style={{ backgroundColor: cat.color, borderColor: cat.color, color: 'white' }}
                  disabled
                >
                  <i className="bi bi-tag-fill me-1"></i>
                  {cat.nombre}
                </button>
              ))}
            </div>

            {/* Botón para gestionar categorías */}
            <button
              type="button"
              className="btn btn-outline-primary"
              data-bs-toggle="modal"
              data-bs-target="#categoryManagerModal"
            >
              <i className="bi bi-gear me-2"></i>
              Gestionar Categorías
            </button>

            <small className="text-muted d-block mt-2">
              Haz clic para agregar, editar o eliminar categorías
            </small>
          </div>


          {/* Acciones */}
          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-outline-secondary" onClick={() => navigate("/espacios")}>
              <i className="bi bi-x-circle me-2"></i>
              Cancelar</button>
            <button type="submit" className="btn btn-primary px-4">
              <i className="bi bi-check-circle me-2"></i>
              Guardar cambios</button>
          </div>
          </div>
        </form>
      </div>

      {/* Category Manager Modal */}
      <CategoryManagerModal 
        modalId="categoryManagerModal"
        selectedCategoryIds={selectedCategories}
        onCategoriesChange={handleCategoriesChange}
      />
    </div>
  );

}

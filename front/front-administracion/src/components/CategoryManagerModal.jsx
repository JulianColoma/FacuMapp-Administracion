import { useState, useEffect } from 'react';
import { Modal } from 'bootstrap';
import { API_URL } from '../config';
import Swal from 'sweetalert2';

export default function CategoryManagerModal({ 
  modalId = 'categoryManagerModal', 
  onCategoriesChange,
  selectedCategoryIds = [] 
}) {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newCatNombre, setNewCatNombre] = useState('');
  const [newCatColor, setNewCatColor] = useState('#000000');
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editNombre, setEditNombre] = useState('');
  const [editColor, setEditColor] = useState('#000000');
  const [isUpdating, setIsUpdating] = useState(false);

  // Sincronizar categorías seleccionadas al montar
  useEffect(() => {
    setSelectedCategories(selectedCategoryIds);
  }, [selectedCategoryIds]);

  // Cargar categorías al abrir el modal
  useEffect(() => {
    const modalElement = document.getElementById(modalId);
    const handleShow = () => {
      fetchCategories();
    };
    modalElement?.addEventListener('show.bs.modal', handleShow);
    return () => {
      modalElement?.removeEventListener('show.bs.modal', handleShow);
    };
  }, [modalId]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/categoria`, {
        credentials: 'include',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const cats = await res.json();
        setCategories(cats || []);
      }
    } catch (e) {
      console.error('Error cargando categorías:', e);
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatNombre || newCatNombre.trim().length < 2) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El nombre de la categoría debe tener al menos 2 caracteres'
      });
      return;
    }

    setCreatingCategory(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Token disponible:', token ? 'Sí' : 'No');
      const res = await fetch(`${API_URL}/categoria`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          nombre: newCatNombre,
          color: newCatColor || undefined
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `No se pudo crear la categoría (${res.status})`);
      }

      const newCategory = await res.json();
      setCategories(prev => [...prev, newCategory]);
      setSelectedCategories(prev => [...prev, newCategory.id]);
      setNewCatNombre('');
      setNewCatColor('#000000');

      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Categoría creada correctamente',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear la categoría'
      });
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleEditCategory = async (categoryId) => {
    if (!editNombre || editNombre.trim().length < 2) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El nombre debe tener al menos 2 caracteres'
      });
      return;
    }

    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Token disponible para actualizar:', token ? 'Sí' : 'No');
      const res = await fetch(`${API_URL}/categoria/${categoryId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          nombre: editNombre,
          color: editColor
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `No se pudo actualizar la categoría (${res.status})`);
      }

      const updatedCategory = await res.json();
      setCategories(prev =>
        prev.map(cat => cat.id === categoryId ? updatedCategory : cat)
      );
      setEditingId(null);

      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Categoría actualizada correctamente',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar la categoría'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    const confirmation = await Swal.fire({
      icon: 'warning',
      title: 'Confirmar eliminación',
      text: '¿Estás seguro de que deseas eliminar esta categoría?',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545'
    });

    if (!confirmation.isConfirmed) return;

    try {
      const token = localStorage.getItem('token');
      console.log('Token disponible para eliminar:', token ? 'Sí' : 'No');
      const res = await fetch(`${API_URL}/categoria/${categoryId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `No se pudo eliminar la categoría (${res.status})`);
      }

      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      setSelectedCategories(prev => prev.filter(id => id !== categoryId));

      Swal.fire({
        icon: 'success',
        title: 'Eliminado',
        text: 'Categoría eliminada correctamente',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar la categoría'
      });
    }
  };

  const toggleCategorySelection = (catId) => {
    setSelectedCategories(prev =>
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const handleSaveChanges = () => {
    if (onCategoriesChange) {
      onCategoriesChange(selectedCategories);
    }
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = Modal.getInstance(modalElement);
      modal?.hide();
    }
  };

  return (
    <div
      className="modal fade"
      id={modalId}
      tabIndex="-1"
      role="dialog"
      aria-labelledby={`${modalId}Label`}
      aria-hidden="true"
    >
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id={`${modalId}Label`}>
              <i className="bi bi-tags me-2"></i>
              Gestionar Categorías
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {/* Crear nueva categoría */}
            <div className="mb-4 p-3 bg-light rounded">
              <h6 className="mb-3">
                <i className="bi bi-plus-circle me-2"></i>
                Nueva Categoría
              </h6>
              <form onSubmit={handleCreateCategory} className="d-flex gap-2 align-items-end">
                <div className="flex-grow-1">
                  <label className="form-label small">Nombre</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Ej: Informática"
                    value={newCatNombre}
                    onChange={e => setNewCatNombre(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label small">Color</label>
                  <input
                    type="color"
                    className="form-control form-control-sm p-1"
                    style={{ width: 50, height: 36 }}
                    value={newCatColor}
                    onChange={e => setNewCatColor(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-success btn-sm"
                  disabled={creatingCategory}
                >
                  {creatingCategory ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Creando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-plus me-1"></i>
                      Crear
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Buscador */}
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar categorías..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Lista de categorías */}
            <div>
              {filteredCategories.length === 0 ? (
                <div className="alert alert-info" role="alert">
                  <i className="bi bi-info-circle me-2"></i>
                  {searchTerm ? 'No se encontraron categorías' : 'No hay categorías disponibles'}
                </div>
              ) : (
                <div className="list-group">
                  {filteredCategories.map(cat => (
                    <div
                      key={cat.id}
                      className="list-group-item d-flex align-items-center justify-content-between"
                    >
                      <div className="d-flex align-items-center gap-3 flex-grow-1">
                        {/* Checkbox de selección */}
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={selectedCategories.includes(cat.id)}
                          onChange={() => toggleCategorySelection(cat.id)}
                        />

                        {/* Color badge */}
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            backgroundColor: cat.color,
                            borderRadius: '50%',
                            border: '2px solid #dee2e6'
                          }}
                          title={cat.color}
                        ></div>

                        {/* Nombre o edición */}
                        {editingId === cat.id ? (
                          <div className="d-flex gap-2 flex-grow-1">
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={editNombre}
                              onChange={e => setEditNombre(e.target.value)}
                            />
                            <input
                              type="color"
                              className="form-control form-control-sm p-1"
                              style={{ width: 50, height: 36 }}
                              value={editColor}
                              onChange={e => setEditColor(e.target.value)}
                            />
                          </div>
                        ) : (
                          <span>{cat.nombre}</span>
                        )}
                      </div>

                      {/* Acciones */}
                      <div className="d-flex gap-2">
                        {editingId === cat.id ? (
                          <>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleEditCategory(cat.id)}
                              disabled={isUpdating}
                              title="Guardar cambios"
                            >
                              <i className="bi bi-check-circle me-1"></i>
                              Guardar
                            </button>
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => setEditingId(null)}
                              title="Cancelar edición"
                            >
                              <i className="bi bi-x-circle me-1"></i>
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="btn btn-outline-warning btn-sm"
                              onClick={() => {
                                setEditingId(cat.id);
                                setEditNombre(cat.nombre);
                                setEditColor(cat.color);
                              }}
                              title="Editar categoría"
                            >
                              <i className="bi bi-pencil-square me-1"></i>
                              Editar
                            </button>
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleDeleteCategory(cat.id)}
                              title="Eliminar categoría"
                            >
                              <i className="bi bi-trash3 me-1"></i>
                              Eliminar
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-outline-secondary"
              data-bs-dismiss="modal"
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSaveChanges}
            >
              <i className="bi bi-check-circle me-2"></i>
              Guardar Selección
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

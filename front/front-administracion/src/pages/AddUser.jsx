import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { API_URL } from "../config";

const AddUser = () => {
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('user');
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);
    setSuccess(false);

    // Validaciones del lado cliente
    const newErrors = {};
    const cleanNombre = nombre.trim();

    if (!cleanNombre || cleanNombre.length < 3) {
      newErrors.nombre = "El nombre debe tener al menos 3 caracteres";
    } else if (cleanNombre.length > 255) {
      newErrors.nombre = "El nombre no puede exceder 255 caracteres";
    } else if (!/^[a-zA-Z0-9_]+$/.test(cleanNombre)) {
      newErrors.nombre = "El nombre solo puede contener letras, números y guiones bajos";
    }

    if (!password || password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    } else if (password.length > 100) {
      newErrors.password = "La contraseña no puede exceder 100 caracteres";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          nombre: cleanNombre,
          contrasena: password,
          administrador: rol === 'admin',
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("No tienes permisos para realizar esta acción. Debes ser administrador.");
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear el usuario');
      }

      await Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Usuario creado exitosamente",
        confirmButtonText: "Aceptar"
      });
      navigate('/usuarios');
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al crear el usuario",
        confirmButtonText: "Aceptar"
      });
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Agregar Usuario</h1>
      {generalError && <div className="alert alert-danger">{generalError}</div>}
      {success && <div className="alert alert-success">Usuario creado con éxito. Redirigiendo...</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="nombre" className="form-label">Nombre de Usuario</label>
          <input
            type="text"
            className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
          <small className="form-text text-muted">Solo letras, números y guiones bajos</small>
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Contraseña</label>
          <input
            type="password"
            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          <small className="form-text text-muted">Mínimo 6 caracteres</small>
        </div>
        <div className="mb-3">
          <label htmlFor="rol" className="form-label">Rol</label>
          <select
            className="form-select"
            id="rol"
            value={rol}
            onChange={(e) => setRol(e.target.value)}
          >
            <option value="user">Usuario</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary">
          Agregar
        </button>
      </form>
    </div>
  );
};

export default AddUser;

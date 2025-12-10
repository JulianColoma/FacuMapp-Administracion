import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import "../style.scss";

export default function Login() {
  const [nombre, setNombre] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setGeneralError("");

    // Validaciones del lado cliente
    const newErrors = {};
    const cleanNombre = nombre.trim();

    if (!cleanNombre || cleanNombre.length < 3) {
      newErrors.nombre = "El nombre debe tener al menos 3 caracteres";
    } else if (!/^[a-zA-Z0-9_]+$/.test(cleanNombre)) {
      newErrors.nombre = "El nombre solo puede contener letras, números y guiones bajos";
    }

    if (!contrasena || contrasena.length < 6) {
      newErrors.contrasena = "La contraseña debe tener al menos 6 caracteres";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nombre: cleanNombre, contrasena }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al iniciar sesión");
      }

      // Guardar token y datos del usuario en localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirigir a la página de inicio
      navigate("/");

    } catch (error) {
      setGeneralError(error.message === "Invalid credentials" ? "Usuario o contraseña incorrectos" : error.message);
      console.error("Error al iniciar sesión:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-shape"></div>
        <div className="login-shape"></div>
      </div>
      
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <i className="bi bi-geo-alt-fill"></i>
          </div>
          <h1 className="login-title">FacuMapp Admin</h1>
          <p className="login-subtitle">Sistema de Gestión de Espacios y Eventos</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="nombre" className="form-label">
              <i className="bi bi-person me-2"></i>
              Usuario
            </label>
            <input
              id="nombre"
              type="text"
              placeholder="Ingrese su usuario"
              className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              disabled={loading}
            />
            {errors.nombre && (
              <div className="invalid-feedback d-block">
                <i className="bi bi-exclamation-circle me-1"></i>
                {errors.nombre}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="contrasena" className="form-label">
              <i className="bi bi-lock me-2"></i>
              Contraseña
            </label>
            <input
              id="contrasena"
              type="password"
              placeholder="Ingrese su contraseña"
              className={`form-control ${errors.contrasena ? 'is-invalid' : ''}`}
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              disabled={loading}
            />
            {errors.contrasena && (
              <div className="invalid-feedback d-block">
                <i className="bi bi-exclamation-circle me-1"></i>
                {errors.contrasena}
              </div>
            )}
          </div>

          {generalError && (
            <div className="alert alert-danger d-flex align-items-center">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {generalError}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary w-100 login-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Ingresando...
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right me-2"></i>
                Iniciar Sesión
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p className="text-muted mb-0">
            <i className="bi bi-shield-check me-1"></i>
            Acceso seguro y encriptado
          </p>
        </div>
      </div>
    </div>
  );
}

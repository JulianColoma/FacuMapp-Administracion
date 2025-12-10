import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

export default function Login() {
  const [nombre, setNombre] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
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
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-4">
          <div className="card p-4 shadow-sm">
            <h3 className="text-center mb-4">Login</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Usuario"
                  className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
                {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
              </div>
              <div className="mb-3">
                <input
                  type="password"
                  placeholder="Contraseña"
                  className={`form-control ${errors.contrasena ? 'is-invalid' : ''}`}
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                />
                {errors.contrasena && <div className="invalid-feedback">{errors.contrasena}</div>}
              </div>

              {generalError &&
                <div className="alert alert-danger p-2 mb-3 fs-6">{generalError}</div>
              }

              <button type="submit" className="btn btn-primary w-100">
                Ingresar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

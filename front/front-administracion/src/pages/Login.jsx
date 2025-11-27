import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [nombre, setNombre] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nombre, contrasena }),
        credentials: 'include', 
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al iniciar sesión");
      }

      // Guardar token y datos del usuario en localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirigir a la página de inicio
      navigate("/");

    } catch (error) {
      setError(error.message);
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
                  className="form-control"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <input
                  type="password"
                  placeholder="Contraseña"
                  className="form-control"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  required
                />
              </div>

              {error && 
                <div className="alert alert-danger p-2 mb-3 fs-6">{
                  error === "Invalid credentials" ? "Usuario o contraseña incorrectos." : error
                }</div>
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

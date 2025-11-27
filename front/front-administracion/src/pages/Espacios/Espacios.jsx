import { useEffect, useState } from "react";

export default function Espacios() {
  const [espacios, setEspacios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagen, setImagen] = useState(null);

  const fetchEspacios = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/espacio");
      if (!response.ok) {
        throw new Error("Error al obtener los espacios");
      }
      const data = await response.json();
      setEspacios(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEspacios();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("descripcion", descripcion);
    formData.append("imagen", imagen);

    try {
      const response = await fetch("http://localhost:3000/espacio", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error al crear el espacio");
      }

      // Limpiar el formulario y recargar los espacios
      setNombre("");
      setDescripcion("");
      setImagen(null);
      fetchEspacios();
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Espacios</h1>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-3">
          <label htmlFor="nombre" className="form-label">
            Nombre
          </label>
          <input
            type="text"
            className="form-control"
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="descripcion" className="form-label">
            Descripción
          </label>
          <textarea
            className="form-control"
            id="descripcion"
            rows="3"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
          ></textarea>
        </div>
        <div className="mb-3">
          <label htmlFor="imagen" className="form-label">
            Imagen
          </label>
          <input
            type="file"
            className="form-control"
            id="imagen"
            onChange={(e) => setImagen(e.target.files[0])}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Crear Espacio
        </button>
      </form>

      <div className="row">
        {espacios.map((espacio) => (
          <div key={espacio.id} className="col-12 col-md-4 mb-3">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{espacio.nombre}</h5>
                <p className="card-text">{espacio.descripcion}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";

export default function Espacios() {
  const [espacios, setEspacios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEspacios = async () => {
      try {
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

    fetchEspacios();
  }, []);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Espacios</h1>
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

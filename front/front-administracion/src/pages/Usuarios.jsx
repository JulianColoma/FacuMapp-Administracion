import { useEffect, useState } from "react";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /*useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await fetch("http://localhost:3000/");
        if (!response.ok) {
          throw new Error("Error al obtener los usuarios");
        }
        const data = await response.json();
        setUsuarios(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, []);*/

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Usuarios</h1>
      <div className="row">
        {usuarios.map((u) => (
          <div key={u.id} className="col-12 col-md-4 mb-3">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{u.nombre}</h5>
                <p className="card-text">Rol: {u.administrador ? 'Administrador' : 'Usuario'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

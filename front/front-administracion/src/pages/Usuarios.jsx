import { useEffect, useState } from "react";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        // Asegúrate de que tu backend devuelve el ID en el SELECT
        const response = await fetch("http://localhost:3000/getuser");
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
  }, []);

  if (loading) {
    return <div className="p-5 text-center fs-4">Cargando usuarios...</div>;
  }

  if (error) {
    return <div className="alert alert-danger m-4 p-4 fs-5">Error: {error}</div>;
  }

  return (
    
    <div className="container-fluid px-4 mt-5">
      
     
      <h1 className="mb-4 display-6 fw-bold">Gestión de Usuarios</h1>

    
      <div className="card shadow-sm rounded-4 overflow-hidden border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            
           
            <table className="table table-striped table-hover mb-0 fs-5 align-middle">
              
             
              <thead className="table-dark text-uppercase fs-6">
                <tr>
                 
                  <th scope="col" className="p-4">Nombre</th>
                  <th scope="col" className="p-4 text-center">Rol</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id }> 
                    
                    <td className="p-4">{u.nombre}</td>
                    <td className="p-4 text-center">
                     
                      <span
                        className={`badge fs-6 px-4 py-2 rounded-pill ${
                          u.administrador ? "bg-primary bg-gradient" : "bg-secondary bg-gradient text-dark bg-opacity-25"
                        }`}
                      >
                        {u.administrador ? "Administrador" : "Usuario"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
          </div>
        </div>
      </div>
    </div>
  );
}
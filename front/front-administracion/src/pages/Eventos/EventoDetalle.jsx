import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function EventoDetalle() {
  const { id } = useParams();
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [evento, setEvento] = useState(null);

  useEffect(() => {
    const fetchEventoYActividades = async () => {
      try {
        // Fetch evento details
        const eventoResponse = await fetch(`http://localhost:3000/evento/${id}`);
        if (!eventoResponse.ok) {
          throw new Error("Error al obtener los detalles del evento");
        }
        const eventoData = await eventoResponse.json();
        setEvento(eventoData);

        // Fetch actividades
        const actividadesResponse = await fetch(`http://localhost:3000/actividad/${id}`);
        if (!actividadesResponse.ok) {
          throw new Error("Error al obtener las actividades");
        }
        const actividadesData = await actividadesResponse.json();
        setActividades(actividadesData);

      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEventoYActividades();
  }, [id]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Actividades del {evento ? evento.nombre : 'Evento'}</h1>
      {actividades.length > 0 ? (
        <div className="row">
          {actividades.map((act) => (
            <div key={act.id} className="col-12 col-md-6 col-lg-4 mb-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{act.nombre}</h5>
                  <p className="card-text">{act.descripcion}</p>
                  <p className="card-text"><small className="text-muted">{new Date(act.fecha).toLocaleDateString()}</small></p>
                  <p className="card-text"><small className="text-muted">{act.hora_inicio} - {act.hora_fin}</small></p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No hay actividades para este evento.</p>
      )}
    </div>
  );
}

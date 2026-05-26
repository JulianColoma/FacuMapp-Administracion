import { API_URL } from "../config";

export async function fetchAllEspacios({ token } = {}) {
  const espacios = [];
  let cursor = null;

  do {
    const params = new URLSearchParams({ limit: "50" });
    if (cursor) params.set("cursor", cursor);

    const response = await fetch(`${API_URL}/espacio?${params.toString()}`, {
      credentials: "include",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener espacios");
    }

    const data = await response.json();
    if (Array.isArray(data)) return data;

    espacios.push(...(data.items ?? []));
    cursor = data.nextCursor ?? null;
  } while (cursor);

  return espacios;
}

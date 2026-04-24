import { useEffect, useState, useCallback, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { API_URL } from "../../config";
import { FLOOR_OPTIONS, FLOOR_ZONES } from "./data/floorZones";
import "./EspaciosMap.scss";

// Offset para alinear coordenadas del mapa (ZONES) con el viewBox del SVG.
// Ajusta estos valores si tu plano cambia.
const OFFSET_X = 0;
const OFFSET_Y = 0;

export default function Espacios() {
  const [espacios, setEspacios] = useState([]);
  const [mapEspacios, setMapEspacios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapLoading, setMapLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categoryQuery, setCategoryQuery] = useState("");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [hoveredZone, setHoveredZone] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1.34);
  const [activeFloor, setActiveFloor] = useState(0);
  const svgRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const [showMapView, setShowMapView] = useState(Boolean(location.state?.showMapView));

  const handleZoom = useCallback((direction) => {
    setZoomLevel((prev) => {
      const newZoom = direction === 'in' ? prev * 1.2 : prev / 1.2;
      return Math.max(0.5, Math.min(newZoom, 5));
    });
  }, []);

  const handleMouseWheel = useCallback((e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    handleZoom(e.deltaY < 0 ? 'in' : 'out');
  }, [handleZoom]);


  const COLORS = {
    paredes: "#2b2f3a",
    zonaDefault: "rgba(33, 150, 243, 0.15)",
    zonaStroke: "rgba(33, 150, 243, 0.35)",
    zonaHover: "rgba(33, 150, 243, 0.3)",
    pbReferenceFill: "#64748b",
    pbReferenceStroke: "#475569",
  };
  const ITEMS_PER_PAGE = 6;
  const [total, setTotal] = useState(0);
  const [nextCursor, setNextCursor] = useState(null);
  const [cursorHistory, setCursorHistory] = useState([null]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageCacheRef = useRef(new Map());
  const prefetchedPagesRef = useRef(new Set());
  const currentCursor = cursorHistory[currentPage - 1] ?? null;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const activeZones = FLOOR_ZONES[activeFloor] ?? FLOOR_ZONES[0] ?? [];
  const showGroundReference = activeFloor !== 0;
  const groundReferenceZones = FLOOR_ZONES[0] ?? [];

  const findFloorForZone = useCallback((zoneId) => {
    const normalizedZoneId = String(zoneId);
    return FLOOR_OPTIONS.find((floor) =>
      (FLOOR_ZONES[floor.id] ?? []).some((zone) => zone.id === normalizedZoneId)
    )?.id ?? 0;
  }, []);


  const getPageCacheKey = useCallback((cursor = null, search = "", category = "") => {
    return JSON.stringify({
      cursor: cursor ?? null,
      search: search.trim(),
      category: category || "",
    });
  }, []);

  const fetchPageData = useCallback(async (cursor = null, search = "", category = "") => {
    const params = new URLSearchParams({ limit: String(ITEMS_PER_PAGE) });
    const normalizedSearchValue = search.trim();
    if (cursor) params.set("cursor", cursor);
    if (normalizedSearchValue) params.set("search", normalizedSearchValue);
    if (category) params.set("category", category);

    const response = await fetch(`${API_URL}/espacio?${params.toString()}`);
    if (!response.ok) throw new Error("Error al obtener los espacios");
    return response.json();
  }, []);

  const prefetchEspacios = useCallback(async (cursor = null, search = "", category = "") => {
    const cacheKey = getPageCacheKey(cursor, search, category);
    if (!cursor || pageCacheRef.current.has(cacheKey) || prefetchedPagesRef.current.has(cacheKey)) {
      return;
    }

    prefetchedPagesRef.current.add(cacheKey);

    try {
      const data = await fetchPageData(cursor, search, category);
      pageCacheRef.current.set(cacheKey, {
        items: data.items ?? [],
        nextCursor: data.nextCursor ?? null,
        total: data.total ?? 0,
      });
    } catch (_error) {
      prefetchedPagesRef.current.delete(cacheKey);
    }
  }, [fetchPageData, getPageCacheKey]);

  const fetchEspacios = useCallback(async (cursor = null, search = "", category = "") => {
    const cacheKey = getPageCacheKey(cursor, search, category);
    const cachedPage = pageCacheRef.current.get(cacheKey);

    if (cachedPage) {
      setError(null);
      setEspacios(cachedPage.items);
      setNextCursor(cachedPage.nextCursor);
      setTotal(cachedPage.total);
      setLoading(false);

      if (cachedPage.nextCursor) {
        prefetchEspacios(cachedPage.nextCursor, search, category);
      }
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await fetchPageData(cursor, search, category);
      const pageData = {
        items: data.items ?? [],
        nextCursor: data.nextCursor ?? null,
        total: data.total ?? 0,
      };

      pageCacheRef.current.set(cacheKey, pageData);
      setEspacios(pageData.items);
      setNextCursor(pageData.nextCursor);
      setTotal(pageData.total);

      if (pageData.nextCursor) {
        prefetchEspacios(pageData.nextCursor, search, category);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [fetchPageData, getPageCacheKey, prefetchEspacios]);

  useEffect(() => {
    fetchEspacios(currentCursor, searchTerm, selectedCategory);
  }, [currentCursor, fetchEspacios, searchTerm, selectedCategory]);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await fetch(`${API_URL}/categoria`);
        if (!response.ok) throw new Error("Error al obtener las categorias");
        const data = await response.json();
        setCategorias(Array.isArray(data) ? data : []);
      } catch (fetchError) {
        setError(fetchError.message);
      }
    };

    fetchCategorias();
  }, []);

  useEffect(() => {
    if (!showMapView || mapEspacios.length > 0) return;

    const fetchMapEspacios = async () => {
      try {
        setMapLoading(true);
        let cursor = null;
        let hasMore = true;
        const collected = [];

        while (hasMore) {
          const params = new URLSearchParams({ limit: "50" });
          if (cursor) params.set("cursor", cursor);

          const response = await fetch(`${API_URL}/espacio?${params.toString()}`);
          if (!response.ok) throw new Error("Error al obtener los espacios del mapa");

          const data = await response.json();
          collected.push(...(data.items ?? []));
          cursor = data.nextCursor ?? null;
          hasMore = Boolean(data.nextCursor);
        }

        setMapEspacios(collected);
      } catch (_error) {
        setMapEspacios([]);
      } finally {
        setMapLoading(false);
      }
    };

    fetchMapEspacios();
  }, [mapEspacios.length, showMapView]);

  useEffect(() => {
    const mapContainer = svgRef.current?.closest('.map-container');
    if (!mapContainer) return;

    mapContainer.addEventListener('wheel', handleMouseWheel, { passive: false });
    return () => mapContainer.removeEventListener('wheel', handleMouseWheel);
  }, [handleMouseWheel]);

  const categoryOptions = [...categorias].sort((a, b) =>
    String(a.nombre || "").localeCompare(String(b.nombre || ""))
  );
  const selectedCategoryName = selectedCategory
    ? categoryOptions.find((cat) => String(cat.id) === selectedCategory)?.nombre || ""
    : "";
  const normalizedCategoryQuery = categoryQuery.trim().toLowerCase();
  const filteredCategories = categoryOptions.filter((cat) =>
    String(cat.nombre || "").toLowerCase().includes(normalizedCategoryQuery)
  );

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const hasFilters = Boolean(normalizedSearch || selectedCategory);

  useEffect(() => {
    setCursorHistory([null]);
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    if (typeof location.state?.showMapView === "boolean") {
      setShowMapView(location.state.showMapView);
    }
  }, [location.state]);

  useEffect(() => {
    if (!location.state?.showMapView) return;

    if (typeof location.state?.activeFloor === "number") {
      setActiveFloor(location.state.activeFloor);
      return;
    }

    if (location.state?.editedSpaceId != null) {
      setActiveFloor(findFloorForZone(location.state.editedSpaceId));
    }
  }, [findFloorForZone, location.state]);


  const handleZoneClick = (zoneId) => {
    navigate(`/edit-espacio/${zoneId}`, {
      state: { returnToMap: true, activeFloor },
    });
  };

  if (loading) return <div className="text-center py-5">Cargando...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="page-container">
      <div className="page-header mb-4">
        <h1>
          <i className="bi bi-building me-2"></i> Gestión de Espacios
        </h1>
      </div>

      <div className={`filters-bar mb-4 ${showMapView ? "is-map-mode" : ""}`}>
        {showMapView ? (
          <>
            <div className="filters-map-summary">
              <span className="filters-map-badge">Plano interactivo</span>
            </div>
            <button
              type="button"
              className={`filters-view-toggle ${showMapView ? "is-active" : ""}`}
              onClick={() => setShowMapView((prev) => !prev)}
              title={showMapView ? "Ver lista" : "Ver mapa"}
              aria-label={showMapView ? "Ver lista" : "Ver mapa"}
            >
              <i className={`bi ${showMapView ? "bi-grid-1x2-fill" : "bi-map-fill"}`}></i>
            </button>
          </>
        ) : (
          <>
        <div className="filters-main">
          <div className="filters-field filters-search">
            <i className="bi bi-search"></i>
            <input
              type="text"
              className="filters-input"
              placeholder="Buscar espacio..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
            />
            <button
              type="button"
              className={`filters-view-toggle ${showMapView ? "is-active" : ""}`}
              onClick={() => setShowMapView((prev) => !prev)}
              title={showMapView ? "Ver lista" : "Ver mapa"}
              aria-label={showMapView ? "Ver lista" : "Ver mapa"}
            >
              <i className={`bi ${showMapView ? "bi-grid-1x2-fill" : "bi-map-fill"}`}></i>
            </button>
          </div>
          <div
            className="filters-category"
            onBlur={() => setTimeout(() => setIsCategoryOpen(false), 100)}
          >
            <div className={`filters-field filters-compact ${isCategoryOpen ? "is-open" : ""}`}>
              <i className="bi bi-tag"></i>
              <input
                type="text"
                className="filters-input"
                placeholder="Filtrar categorias..."
                value={categoryQuery}
                onChange={(e) => {
                  setCategoryQuery(e.target.value);
                  setIsCategoryOpen(true);
                }}
                onFocus={() => {
                  setCategoryQuery(selectedCategoryName || categoryQuery);
                  setIsCategoryOpen(true);
                }}
              />
              <button
                type="button"
                className="filters-clear"
                aria-label="Limpiar categoria"
                disabled={!selectedCategory && !categoryQuery}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setSelectedCategory("");
                  setCategoryQuery("");
                }}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
            {isCategoryOpen && (
              <div className="filters-dropdown" role="listbox">
                <button
                  type="button"
                  className={`filters-option ${selectedCategory === "" ? "is-active" : ""}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setSelectedCategory("");
                    setCategoryQuery("");
                    setIsCategoryOpen(false);
                  }}
                >
                  Todas las categorias
                </button>
                {filteredCategories.length === 0 && (
                  <div className="filters-empty">Sin resultados</div>
                )}
                {filteredCategories.map((cat) => {
                  const value = cat.id != null ? String(cat.id) : String(cat.nombre || "");
                  const isActive = selectedCategory === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      className={`filters-option ${isActive ? "is-active" : ""}`}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setSelectedCategory(value);
                        setCategoryQuery(cat.nombre || "");
                        setIsCategoryOpen(false);
                      }}
                    >
                      <span
                        className="filters-option-dot"
                        style={{ backgroundColor: cat.color || "#94a3b8" }}
                      ></span>
                      <span>{cat.nombre || "Sin nombre"}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className="filters-meta">
          <span className="filters-count">{total} resultados</span>
          <button
            type="button"
            className="filters-reset"
            disabled={!hasFilters}
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("");
              setCategoryQuery("");
            }}
          >
            Limpiar
          </button>
        </div>
          </>
        )}
      </div>

      <div className="row">
        {!showMapView && (
        <div className="col-12 mb-4">
          <div className="grid-container">
            {espacios.map((esp) => {
              const imageUrl = esp.imagen ? `${API_URL}/uploads/${esp.imagen}` : null;
              return (
                <div key={esp.id} className="custom-card">
                  <div className="space-card-image">
                    <img
                      src={imageUrl || "/images/no-image.png"}
                      alt={esp.nombre}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/600x400?text=Sin+Imagen";
                      }}
                    />
                  </div>
                  <div className="card-body">
                    <h5 className="card-title">{esp.nombre}</h5>
                    <p className="card-text">
                      {esp.descripcion || "Sin descripción disponible."}
                    </p>
                    {esp.categorias && esp.categorias.length > 0 && (
                      <div className="mb-2 d-flex flex-wrap gap-2">
                        {esp.categorias.slice(0, 3).map((cat) => (
                          <span
                            key={cat.id}
                            className="badge badge-custom"
                            style={{ backgroundColor: cat.color || undefined }}
                          >
                            {cat.nombre}
                          </span>
                        ))}
                        {esp.categorias.length > 3 && (
                          <span className="badge bg-secondary">
                            +{esp.categorias.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="card-capacity">
                      <i className="bi bi-people-fill"></i>
                      Capacidad: {esp.capacidad} personas
                    </div>
                    <Link
                      to={`/edit-espacio/${esp.id}`}
                      className="btn btn-edit"
                    >
                      Editar
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
          {totalPages > 1 && (
            <div className="pagination-futuristic">
              <button
                className="pagination-btn prev"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <i className="bi bi-chevron-left"></i>
                <span>Anterior</span>
              </button>

              <div className="pagination-indicator">
                {currentPage} / {totalPages}
              </div>

              <button
                className="pagination-btn next"
                disabled={!nextCursor}
                onClick={() => {
                  if (!nextCursor) return;
                  setCursorHistory((prev) => {
                    const nextIndex = currentPage;
                    if (prev[nextIndex] === nextCursor) return prev;
                    return [...prev.slice(0, nextIndex), nextCursor];
                  });
                  setCurrentPage((p) => p + 1);
                }}
              >
                <span>Siguiente</span>
                <i className="bi bi-chevron-right"></i>
              </button>

            </div>
          )}
        </div>
        )}

        {showMapView && (
        <div className="col-12">
          <div className="map-view-shell">
            <div className="map-view-intro">
              <h5 className="mb-0">Mapa del edificio</h5>
              <span className="map-view-badge">Vista mapa</span>
            </div>
            <div className="card p-3 border-0 map-view-card">
            <div className="map-toolbar mb-3">
              <div className="map-toolbar-title">
                <h5 className="mb-0 text-muted">Mapa Interactivo</h5>
              </div>
              <div className="floor-switcher" role="tablist" aria-label="Selector de piso">
                {FLOOR_OPTIONS.map((floor) => (
                  <button
                    key={floor.id}
                    type="button"
                    className={`floor-switcher-btn ${activeFloor === floor.id ? "is-active" : ""}`}
                    onClick={() => {
                      setActiveFloor(floor.id);
                      setHoveredZone(null);
                    }}
                  >
                    {floor.label}
                  </button>
                ))}
              </div>
              <div className="zoom-controls">
                <button 
                  className="btn btn-sm btn-outline-secondary" 
                  onClick={() => handleZoom('out')}
                  title="Zoom out (Ctrl+Scroll Down)"
                >
                  <i className="bi bi-zoom-out"></i>
                </button>
                <span className="zoom-indicator">{Math.round(zoomLevel * 100)}%</span>
                <button 
                  className="btn btn-sm btn-outline-secondary" 
                  onClick={() => handleZoom('in')}
                  title="Zoom in (Ctrl+Scroll Up)"
                >
                  <i className="bi bi-zoom-in"></i>
                </button>
                <button 
                  className="btn btn-sm btn-outline-secondary" 
                  onClick={() => setZoomLevel(1)}
                  title="Reset zoom"
                >
                  <i className="bi bi-arrow-counterclockwise"></i>
                </button>
              </div>
            </div>
            {mapLoading ? (
              <div className="map-loading-state">Cargando mapa...</div>
            ) : (
            <div className="map-container">
              <svg
                ref={svgRef}
                width="100%"
                viewBox="0 0 3419 2640"
                xmlns="http://www.w3.org/2000/svg"
                className="interactive-map-svg"
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: '0 0', transition: 'transform 0.2s ease' }}
              >
                <g id="Group 1">
                  <g transform={`translate(${-OFFSET_X} ${-OFFSET_Y})`}>
                    {showGroundReference &&
                      groundReferenceZones.map((zone) => {
                        const commonReferenceProps = {
                          key: `ground-reference-${zone.id}`,
                          fill: zone.fill ?? COLORS.pbReferenceFill,
                          stroke: zone.stroke ?? COLORS.pbReferenceStroke,
                          strokeWidth: zone.strokeWidth ?? 1.5,
                          style: {
                            pointerEvents: "none",
                          },
                          opacity: 0.22,
                        };

                        if (zone.path) {
                          return <path {...commonReferenceProps} d={zone.path} />;
                        }

                        return (
                          <rect
                            {...commonReferenceProps}
                            x={zone.x}
                            y={zone.y}
                            width={zone.w}
                            height={zone.h}
                            rx={zone.r}
                          />
                        );
                      })}

                    {activeZones.map((zone) => {
                      const espacioData = mapEspacios.find(
                        (e) => String(e.id) === zone.id
                      );
                      const title = espacioData
                        ? espacioData.nombre
                        : `Espacio ID ${zone.id}`;

                      const isHovered = hoveredZone === zone.id;
                      const fillColor = isHovered ? COLORS.zonaHover : COLORS.zonaDefault;

                      const isPressable = zone.pressable !== false;

                      const commonProps = {
                        key: zone.id,
                        id: `zone-${zone.id}`,
                        fill: zone.fill ?? fillColor,
                        stroke: zone.stroke ?? COLORS.zonaStroke,
                        strokeWidth: zone.strokeWidth ?? 2,
                        style: {
                          cursor: isPressable ? "pointer" : "default",
                          transition: "fill 0.2s ease",
                          pointerEvents: isPressable ? "auto" : "none",
                        },
                        onMouseEnter: () => isPressable && setHoveredZone(zone.id),
                        onMouseLeave: () => isPressable && setHoveredZone(null),
                        onClick: () => isPressable && handleZoneClick(zone.id),
                        className: "map-zone"
                      };

                      // Renderizar paths personalizados (zonas irregulares)
                      if (zone.path) {
                        return (
                          <path {...commonProps} d={zone.path}>
                            <title>{title}</title>
                          </path>
                        );
                      }

                      // Renderizar rectángulos (zonas regulares)
                      return (
                        <rect
                          {...commonProps}
                          x={zone.x}
                          y={zone.y}
                          width={zone.w}
                          height={zone.h}
                          rx={zone.r}
                        >
                          <title>{title}</title>
                        </rect>
                      );
                    })}
                  </g>

                  {activeFloor === 0 && (
                  <path
                    id="paredes"
                    d= "M3177.79 2632.49C3179.72 2632.49 3181.29 2634.06 3181.29 2635.99C3181.29 2637.92 3179.72 2639.49 3177.79 2639.49H32.7908C30.858 2639.49 29.2909 2637.92 29.2908 2635.99C29.2908 2634.06 30.8577 2632.49 32.7908 2632.49H3177.79ZM3332.03 1166.5C3332.44 1164.61 3334.3 1163.4 3336.19 1163.81C3336.56 1163.89 3336.91 1164.03 3337.23 1164.21L3398.55 1176.8C3400.44 1177.19 3401.66 1179.04 3401.27 1180.93C3400.89 1182.82 3399.03 1184.04 3397.14 1183.66L3338.11 1171.54L3047.74 2530.49H3235.79C3237.72 2530.49 3239.29 2532.06 3239.29 2533.99C3239.29 2535.92 3237.72 2537.49 3235.79 2537.49H3042.79C3040.86 2537.49 3039.29 2535.92 3039.29 2533.99C3039.29 2532.99 3039.71 2532.09 3040.38 2531.45L3332.03 1166.5ZM1633.17 2530.49C1634.83 2530.49 1636.17 2531.83 1636.17 2533.49C1636.17 2535.15 1634.83 2536.49 1633.17 2536.49H1309.29C1307.63 2536.49 1306.29 2535.15 1306.29 2533.49C1306.29 2531.83 1307.63 2530.49 1309.29 2530.49H1633.17ZM258.783 537.415C259.172 535.521 261.021 534.301 262.915 534.689L3228.39 1143.19C3230.24 1143.57 3231.45 1145.35 3231.14 1147.2C3231.14 1147.47 3231.12 1147.75 3231.06 1148.03L2934.98 2533.72C2934.58 2535.61 2932.72 2536.82 2930.83 2536.41C2930.78 2536.4 2930.73 2536.39 2930.68 2536.38C2930.4 2536.45 2930.1 2536.49 2929.79 2536.49H1714.79C1712.86 2536.49 1711.29 2534.92 1711.29 2532.99C1711.29 2531.06 1712.86 2529.49 1714.79 2529.49H2928.73L3223.62 1149.36L261.508 541.547C259.614 541.158 258.395 539.308 258.783 537.415ZM1003.79 2501.49C1005.72 2501.49 1007.29 2503.06 1007.29 2504.99C1007.29 2506.92 1005.72 2508.49 1003.79 2508.49H32.7879C30.855 2508.49 29.288 2506.92 29.2879 2504.99C29.2879 2503.06 30.8549 2501.49 32.7879 2501.49H1003.79ZM927.788 2454.49C928.616 2454.49 929.288 2455.16 929.288 2455.99V2483.99C929.288 2484.77 928.698 2485.41 927.941 2485.48L927.788 2485.49H880.788C880.011 2485.49 879.373 2484.9 879.296 2484.14L879.288 2483.99V2455.99C879.288 2455.16 879.96 2454.49 880.788 2454.49H927.788ZM882.288 2482.49H926.288V2457.49H882.288V2482.49ZM258.345 603.381C258.673 602.915 259.254 602.656 259.85 602.768C260.134 602.822 260.383 602.953 260.582 603.135L850.042 714.018C850.856 714.172 851.392 714.955 851.239 715.769C851.086 716.583 850.302 717.12 849.488 716.967L260.727 606.215L3.30348 1974.7L502.65 2012.79C503.476 2012.85 504.095 2013.57 504.032 2014.4C504.027 2014.47 504.014 2014.54 504 2014.6V2377H715.5C716.328 2377 717 2377.67 717 2378.5C717 2379.33 716.328 2380 715.5 2380H504V2435H759.998V2380H742.299C741.47 2380 740.799 2379.33 740.799 2378.5C740.799 2377.67 741.47 2377 742.299 2377H761.299C761.332 2377 761.365 2377 761.398 2377C761.431 2377 761.464 2377 761.498 2377C762.326 2377 762.998 2377.67 762.998 2378.5V2435H972.998V2399.5C972.998 2398.67 973.67 2398 974.498 2398H1050.5C1051.33 2398 1052 2398.67 1052 2399.5C1052 2400.33 1051.33 2401 1050.5 2401H975.998V2436.46C975.998 2436.47 976 2436.49 976 2436.5C976 2437.33 975.328 2438 974.5 2438H502.5C501.671 2438 501 2437.33 501 2436.5V2015.67L1.95094 1977.61C1.72274 1977.68 1.47412 1977.7 1.22242 1977.65C0.408383 1977.5 -0.12699 1976.72 0.0261355 1975.9L257.945 604.776C257.9 604.581 257.893 604.373 257.932 604.164C257.99 603.856 258.139 603.587 258.345 603.381ZM1272.79 2385.49C1273.62 2385.49 1274.29 2386.16 1274.29 2386.99V2433.99C1274.29 2434.77 1273.7 2435.41 1272.94 2435.48L1272.79 2435.49H1248.79C1248.01 2435.49 1247.38 2434.9 1247.3 2434.14L1247.29 2433.99V2386.99C1247.29 2386.16 1247.96 2385.49 1248.79 2385.49H1272.79ZM2775.8 2431.49C2776.62 2431.49 2777.3 2432.16 2777.3 2432.99C2777.3 2433.82 2776.62 2434.49 2775.8 2434.49H1333.8C1332.97 2434.49 1332.3 2433.82 1332.3 2432.99C1332.3 2432.16 1332.97 2431.49 1333.8 2431.49H2775.8ZM2998.79 2135.49C2999.62 2135.49 3000.29 2136.16 3000.29 2136.99C3000.29 2137.82 2999.62 2138.49 2998.79 2138.49H2977.36L2918.53 2433.27C2918.38 2433.99 2917.74 2434.49 2917.02 2434.47C2916.95 2434.48 2916.87 2434.49 2916.79 2434.49H2797.79C2796.96 2434.49 2796.29 2433.82 2796.29 2432.99C2796.29 2432.16 2796.96 2431.49 2797.79 2431.49H2915.82L2974.56 2137.18C2974.68 2136.61 2975.11 2136.17 2975.64 2136.03C2975.92 2135.7 2976.33 2135.49 2976.79 2135.49H2998.79ZM1250.29 2432.49H1271.29V2388.49H1250.29V2432.49ZM1215.5 2397C1216.33 2397 1217 2397.67 1217 2398.5C1217 2399.33 1216.33 2400 1215.5 2400H1126.5C1125.67 2400 1125 2399.33 1125 2398.5C1125 2397.67 1125.67 2397 1126.5 2397H1215.5ZM2775.79 1838.49C2776.62 1838.49 2777.29 1839.16 2777.29 1839.99V1851.99C2777.29 1852.82 2776.62 1853.49 2775.79 1853.49C2774.96 1853.49 2774.29 1852.82 2774.29 1851.99V1842.49H2704.29V1884.49H2774.29V1861.99C2774.29 1861.16 2774.96 1860.49 2775.79 1860.49C2776.62 1860.49 2777.29 1861.16 2777.29 1861.99V1885.99C2777.29 1886.77 2776.7 1887.41 2775.94 1887.48L2775.79 1887.49H2736.29V1892.99C2736.29 1893.82 2735.62 1894.49 2734.79 1894.49C2733.96 1894.49 2733.29 1893.82 2733.29 1892.99V1887.49H2704.29V1914.49H2774.29V1903.49H2734.79C2733.96 1903.49 2733.29 1902.82 2733.29 1901.99C2733.29 1901.16 2733.96 1900.49 2734.79 1900.49H2774.79C2774.97 1900.49 2775.13 1900.52 2775.29 1900.58C2775.45 1900.52 2775.62 1900.49 2775.79 1900.49C2776.62 1900.49 2777.29 1901.16 2777.29 1901.99V1934.99C2777.29 1935.82 2776.62 1936.49 2775.79 1936.49C2774.96 1936.49 2774.29 1935.82 2774.29 1934.99V1917.49H2704.29V2064.49H2774.29V2019.99C2774.29 2019.16 2774.96 2018.49 2775.79 2018.49C2776.62 2018.49 2777.29 2019.16 2777.29 2019.99V2065.99C2777.29 2066.77 2776.7 2067.41 2775.94 2067.48L2775.79 2067.49H2744.29V2075.99C2744.29 2076.82 2743.62 2077.49 2742.79 2077.49C2741.96 2077.49 2741.29 2076.82 2741.29 2075.99V2067.49H2669.29V2092.58H2669.29C2669.45 2092.52 2669.62 2092.49 2669.79 2092.49H2695.79C2696.62 2092.49 2697.29 2093.16 2697.29 2093.99C2697.29 2094.82 2696.62 2095.49 2695.79 2095.49H2669.79C2669.62 2095.49 2669.45 2095.46 2669.29 2095.4V2103.99C2669.29 2104.82 2668.62 2105.49 2667.79 2105.49C2666.96 2105.49 2666.29 2104.82 2666.29 2103.99V2095.49H2628.29V2129.49H2666.29V2121.99C2666.29 2121.16 2666.96 2120.49 2667.79 2120.49C2668.62 2120.49 2669.29 2121.16 2669.29 2121.99V2146.49H2775.79C2776.62 2146.49 2777.29 2147.16 2777.29 2147.99V2198.99C2777.29 2199.82 2776.62 2200.49 2775.79 2200.49C2774.96 2200.49 2774.29 2199.82 2774.29 2198.99V2149.49H2704.29V2225.49H2774.29V2206.99C2774.29 2206.16 2774.96 2205.49 2775.79 2205.49C2776.62 2205.49 2777.29 2206.16 2777.29 2206.99V2276.99C2777.29 2277.82 2776.62 2278.49 2775.79 2278.49C2774.96 2278.49 2774.29 2277.82 2774.29 2276.99V2228.49H2704.29V2301.49H2774.29V2285.99C2774.29 2285.16 2774.96 2284.49 2775.79 2284.49C2776.62 2284.49 2777.29 2285.16 2777.29 2285.99V2307.99C2777.29 2308.82 2776.62 2309.49 2775.79 2309.49C2774.96 2309.49 2774.29 2308.82 2774.29 2307.99V2304.49H2704.29V2378.49H2774.29V2369.99C2774.29 2369.16 2774.96 2368.49 2775.79 2368.49L2775.94 2368.5C2776.7 2368.58 2777.29 2369.21 2777.29 2369.99V2379.99C2777.29 2380.77 2776.7 2381.41 2775.94 2381.48L2775.79 2381.49H2702.79C2702.74 2381.49 2702.69 2381.49 2702.64 2381.48C2701.93 2381.41 2701.37 2380.85 2701.3 2380.14L2701.29 2379.99V2149.49H2668.79C2668.62 2149.49 2668.45 2149.46 2668.29 2149.4C2668.13 2149.46 2667.97 2149.49 2667.79 2149.49C2666.96 2149.49 2666.29 2148.82 2666.29 2147.99V2132.49H2626.79C2626.01 2132.49 2625.38 2131.9 2625.3 2131.14L2625.29 2130.99V2093.99C2625.29 2093.16 2625.96 2092.49 2626.79 2092.49C2626.97 2092.49 2627.13 2092.52 2627.29 2092.58C2627.45 2092.52 2627.62 2092.49 2627.79 2092.49H2666.29V2065.99C2666.29 2065.16 2666.96 2064.49 2667.79 2064.49C2667.97 2064.49 2668.13 2064.52 2668.29 2064.58C2668.45 2064.52 2668.62 2064.49 2668.79 2064.49H2701.29V1842.49H2406.29V1899.99C2406.29 1900.82 2405.62 1901.49 2404.79 1901.49C2403.96 1901.49 2403.29 1900.82 2403.29 1899.99V1840.99C2403.29 1840.16 2403.96 1839.49 2404.79 1839.49H2774.38C2774.58 1838.91 2775.14 1838.49 2775.79 1838.49ZM2889.79 2146.49C2890.62 2146.49 2891.29 2147.16 2891.29 2147.99C2891.29 2148.82 2890.62 2149.49 2889.79 2149.49H2872.29V2379.99C2872.29 2380.77 2871.7 2381.41 2870.94 2381.48L2870.79 2381.49H2798.79C2798.74 2381.49 2798.69 2381.49 2798.64 2381.48C2797.93 2381.41 2797.37 2380.85 2797.3 2380.14L2797.29 2379.99V2360.99C2797.29 2360.16 2797.96 2359.49 2798.79 2359.49C2799.62 2359.49 2800.29 2360.16 2800.29 2360.99V2378.49H2869.29V2304.49H2800.29V2352.99C2800.29 2353.82 2799.62 2354.49 2798.79 2354.49C2797.96 2354.49 2797.29 2353.82 2797.29 2352.99V2285.99C2797.29 2285.16 2797.96 2284.49 2798.79 2284.49C2799.62 2284.49 2800.29 2285.16 2800.29 2285.99V2301.49H2869.29V2228.49H2800.29V2276.99C2800.29 2277.82 2799.62 2278.49 2798.79 2278.49C2797.96 2278.49 2797.29 2277.82 2797.29 2276.99V2206.99C2797.29 2206.16 2797.96 2205.49 2798.79 2205.49C2799.62 2205.49 2800.29 2206.16 2800.29 2206.99V2225.49H2869.29V2149.49H2800.29V2198.99C2800.29 2199.82 2799.62 2200.49 2798.79 2200.49C2797.96 2200.49 2797.29 2199.82 2797.29 2198.99V2147.99C2797.29 2147.16 2797.96 2146.49 2798.79 2146.49H2889.79ZM2775.79 2319.49C2776.62 2319.49 2777.29 2320.16 2777.29 2320.99V2356.99C2777.29 2357.82 2776.62 2358.49 2775.79 2358.49C2774.96 2358.49 2774.29 2357.82 2774.29 2356.99V2320.99C2774.29 2320.16 2774.96 2319.49 2775.79 2319.49ZM2318.79 1839.49C2319.62 1839.49 2320.29 1840.16 2320.29 1840.99V2217.99C2320.29 2218.82 2319.62 2219.49 2318.79 2219.49C2318.62 2219.49 2318.45 2219.46 2318.29 2219.4C2318.13 2219.46 2317.97 2219.49 2317.79 2219.49H2072.29V2237.99C2072.29 2238.77 2071.7 2239.41 2070.94 2239.48L2070.79 2239.49H1940.79C1940.74 2239.49 1940.69 2239.49 1940.64 2239.48C1939.93 2239.41 1939.37 2238.85 1939.3 2238.14L1939.29 2237.99V2052.99C1939.29 2052.21 1939.88 2051.58 1940.64 2051.5C1940.69 2051.49 1940.74 2051.49 1940.79 2051.49H1945.79C1946.62 2051.49 1947.29 2052.16 1947.29 2052.99C1947.29 2053.82 1946.62 2054.49 1945.79 2054.49H1942.29V2236.49H2069.29V2114.99C2069.29 2114.16 2069.96 2113.49 2070.79 2113.49C2071.62 2113.49 2072.29 2114.16 2072.29 2114.99V2216.49H2164.29V2167.49H2087.79C2086.96 2167.49 2086.29 2166.82 2086.29 2165.99C2086.29 2165.16 2086.96 2164.49 2087.79 2164.49H2239.79C2240.62 2164.49 2241.29 2165.16 2241.29 2165.99C2241.29 2166.82 2240.62 2167.49 2239.79 2167.49H2167.29V2216.49H2258.29V2167.49H2254.79C2253.96 2167.49 2253.29 2166.82 2253.29 2165.99C2253.29 2165.16 2253.96 2164.49 2254.79 2164.49H2258.29V2150.99C2258.29 2150.16 2258.96 2149.49 2259.79 2149.49C2260.62 2149.49 2261.29 2150.16 2261.29 2150.99V2216.49H2317.29V2139.49H2259.79C2258.96 2139.49 2258.29 2138.82 2258.29 2137.99C2258.29 2137.16 2258.96 2136.49 2259.79 2136.49H2317.29V2042.49H2259.79C2258.96 2042.49 2258.29 2041.82 2258.29 2040.99C2258.29 2040.16 2258.96 2039.49 2259.79 2039.49H2317.29V1943.49H2259.79C2258.96 1943.49 2258.29 1942.82 2258.29 1941.99C2258.29 1941.16 2258.96 1940.49 2259.79 1940.49H2317.29V1842.49H2261.29V1926.99C2261.29 1927.82 2260.62 1928.49 2259.79 1928.49C2258.96 1928.49 2258.29 1927.82 2258.29 1926.99V1840.99C2258.29 1840.16 2258.96 1839.49 2259.79 1839.49H2318.79ZM1355.79 1822.49C1356.62 1822.49 1357.29 1823.16 1357.29 1823.99V1830.99C1357.29 1831.77 1356.7 1832.41 1355.94 1832.48L1355.79 1832.49H1306.29V1904.49H1354.29V1843.99C1354.29 1843.16 1354.96 1842.49 1355.79 1842.49C1356.62 1842.49 1357.29 1843.16 1357.29 1843.99V1928.99C1357.29 1929.77 1356.7 1930.41 1355.94 1930.48L1355.79 1930.49H1314.29V1967.49H1355.79C1356.62 1967.49 1357.29 1968.16 1357.29 1968.99V1991.99C1357.29 1992.77 1356.7 1993.41 1355.94 1993.48L1355.79 1993.49H1306.29V2019.49H1354.29V2004.99C1354.29 2004.16 1354.96 2003.49 1355.79 2003.49C1356.62 2003.49 1357.29 2004.16 1357.29 2004.99V2020.99C1357.29 2021.77 1356.7 2022.41 1355.94 2022.48L1355.79 2022.49H1306.29V2053.49H1354.29V2033.99C1354.29 2033.16 1354.96 2032.49 1355.79 2032.49C1356.62 2032.49 1357.29 2033.16 1357.29 2033.99V2054.99C1357.29 2055.77 1356.7 2056.41 1355.94 2056.48L1355.79 2056.49H1306.29V2090.49H1354.29V2067.99C1354.29 2067.16 1354.96 2066.49 1355.79 2066.49C1356.62 2066.49 1357.29 2067.16 1357.29 2067.99V2091.99C1357.29 2092.77 1356.7 2093.41 1355.94 2093.48L1355.79 2093.49H1306.29V2119.49H1354.29V2104.99C1354.29 2104.16 1354.96 2103.49 1355.79 2103.49C1356.62 2103.49 1357.29 2104.16 1357.29 2104.99V2120.99C1357.29 2121.77 1356.7 2122.41 1355.94 2122.48L1355.79 2122.49H1306.29V2199.49H1354.29V2167.99C1354.29 2167.16 1354.96 2166.49 1355.79 2166.49C1356.62 2166.49 1357.29 2167.16 1357.29 2167.99V2199.49H1397.29V2156.4C1396.71 2156.2 1396.29 2155.64 1396.29 2154.99C1396.29 2154.34 1396.71 2153.78 1397.29 2153.58V2147.99C1397.29 2147.16 1397.96 2146.49 1398.79 2146.49C1399.62 2146.49 1400.29 2147.16 1400.29 2147.99V2199.49H1413.29V2191.99C1413.29 2191.16 1413.96 2190.49 1414.79 2190.49C1415.62 2190.49 1416.29 2191.16 1416.29 2191.99V2204.49H1475.29V2180.49H1416.2C1416 2181.07 1415.44 2181.49 1414.79 2181.49C1413.96 2181.49 1413.29 2180.82 1413.29 2179.99V2167.99C1413.29 2167.16 1413.96 2166.49 1414.79 2166.49C1415.62 2166.49 1416.29 2167.16 1416.29 2167.99V2177.49H1475.29V2156.49H1416.2C1416 2157.07 1415.44 2157.49 1414.79 2157.49C1413.96 2157.49 1413.29 2156.82 1413.29 2155.99V2152.99C1413.29 2152.16 1413.96 2151.49 1414.79 2151.49C1415.62 2151.49 1416.29 2152.16 1416.29 2152.99V2153.49H1440.38C1440.58 2152.91 1441.14 2152.49 1441.79 2152.49C1442.44 2152.49 1443 2152.91 1443.2 2153.49H1466.29V2135.49H1443.29V2143.99C1443.29 2144.82 1442.62 2145.49 1441.79 2145.49C1440.96 2145.49 1440.29 2144.82 1440.29 2143.99V2135.49H1416.29V2140.99C1416.29 2141.82 1415.62 2142.49 1414.79 2142.49C1413.96 2142.49 1413.29 2141.82 1413.29 2140.99V2135.49H1400.2C1400 2136.07 1399.44 2136.49 1398.79 2136.49C1398.11 2136.49 1397.54 2136.04 1397.36 2135.43C1396.74 2135.24 1396.29 2134.67 1396.29 2133.99C1396.29 2133.34 1396.71 2132.78 1397.29 2132.58V2126.99C1397.29 2126.16 1397.96 2125.49 1398.79 2125.49C1399.62 2125.49 1400.29 2126.16 1400.29 2126.99V2132.49H1413.29V2128.99C1413.29 2128.16 1413.96 2127.49 1414.79 2127.49C1415.62 2127.49 1416.29 2128.16 1416.29 2128.99V2132.49H1466.29V2100.49H1412.79C1411.96 2100.49 1411.29 2099.82 1411.29 2098.99C1411.29 2098.16 1411.96 2097.49 1412.79 2097.49H1474.29V2057.49H1400.29V2074.99C1400.29 2075.82 1399.62 2076.49 1398.79 2076.49C1397.96 2076.49 1397.29 2075.82 1397.29 2074.99V2039.99C1397.29 2039.16 1397.96 2038.49 1398.79 2038.49C1399.62 2038.49 1400.29 2039.16 1400.29 2039.99V2054.49H1474.29V2009.49H1400.29V2026.99C1400.29 2027.82 1399.62 2028.49 1398.79 2028.49C1397.96 2028.49 1397.29 2027.82 1397.29 2026.99V1987.99C1397.29 1987.16 1397.96 1986.49 1398.79 1986.49C1399.62 1986.49 1400.29 1987.16 1400.29 1987.99V2006.49H1474.29V1962.49H1462.79C1461.96 1962.49 1461.29 1961.82 1461.29 1960.99C1461.29 1960.16 1461.96 1959.49 1462.79 1959.49H1465.29V1930.49H1400.2C1400 1931.07 1399.44 1931.49 1398.79 1931.49C1397.96 1931.49 1397.29 1930.82 1397.29 1929.99V1908.99C1397.29 1908.16 1397.96 1907.49 1398.79 1907.49C1399.62 1907.49 1400.29 1908.16 1400.29 1908.99V1927.49H1475.29V1883.49H1454.79C1453.96 1883.49 1453.29 1882.82 1453.29 1881.99C1453.29 1881.16 1453.96 1880.49 1454.79 1880.49H1476.79C1476.84 1880.49 1476.89 1880.49 1476.94 1880.5C1477.7 1880.58 1478.29 1881.21 1478.29 1881.99V1927.49H1521.29V1842.4C1521.13 1842.46 1520.97 1842.49 1520.79 1842.49H1456.29V1868.99C1456.29 1869.82 1455.62 1870.49 1454.79 1870.49C1453.96 1870.49 1453.29 1869.82 1453.29 1868.99V1840.99C1453.29 1840.16 1453.96 1839.49 1454.79 1839.49H1520.79C1521.18 1839.49 1521.53 1839.64 1521.79 1839.87C1522.06 1839.64 1522.41 1839.49 1522.79 1839.49C1523.62 1839.49 1524.29 1840.16 1524.29 1840.99V1874.49H1569.29V1842.49H1535.79C1534.96 1842.49 1534.29 1841.82 1534.29 1840.99C1534.29 1840.16 1534.96 1839.49 1535.79 1839.49H1570.79C1570.84 1839.49 1570.89 1839.49 1570.94 1839.5C1571.7 1839.58 1572.29 1840.21 1572.29 1840.99V1875.99C1572.29 1876.77 1571.7 1877.41 1570.94 1877.48L1570.79 1877.49H1524.29V1927.49H1569.29V1888.99C1569.29 1888.16 1569.96 1887.49 1570.79 1887.49C1571.62 1887.49 1572.29 1888.16 1572.29 1888.99V2155.49H1658.79C1659.62 2155.49 1660.29 2156.16 1660.29 2156.99C1660.29 2157.82 1659.62 2158.49 1658.79 2158.49H1572.29V2211.49H1671.29V2167.99C1671.29 2167.16 1671.96 2166.49 1672.79 2166.49C1673.62 2166.49 1674.29 2167.16 1674.29 2167.99V2211.49H1773.29V2158.49H1683.79C1682.96 2158.49 1682.29 2157.82 1682.29 2156.99C1682.29 2156.16 1682.96 2155.49 1683.79 2155.49H1784.79C1785.62 2155.49 1786.29 2156.16 1786.29 2156.99C1786.29 2157.82 1785.62 2158.49 1784.79 2158.49H1776.29V2211.49H1813.29V2158.49H1795.79C1794.96 2158.49 1794.29 2157.82 1794.29 2156.99C1794.29 2156.16 1794.96 2155.49 1795.79 2155.49H1813.29V2151.99C1813.29 2151.16 1813.96 2150.49 1814.79 2150.49C1815.62 2150.49 1816.29 2151.16 1816.29 2151.99V2211.49H1876.29V2138.49H1814.79C1814.01 2138.49 1813.38 2137.9 1813.3 2137.14L1813.29 2136.99V2052.99C1813.29 2052.16 1813.96 2051.49 1814.79 2051.49C1815.62 2051.49 1816.29 2052.16 1816.29 2052.99V2135.49H1876.29V2038.49H1816.29V2040.99C1816.29 2041.82 1815.62 2042.49 1814.79 2042.49C1813.96 2042.49 1813.29 2041.82 1813.29 2040.99V2002.99C1813.29 2002.16 1813.96 2001.49 1814.79 2001.49C1815.62 2001.49 1816.29 2002.16 1816.29 2002.99V2035.49H1876.29V1990.49H1816.29V1991.99C1816.29 1992.82 1815.62 1993.49 1814.79 1993.49C1813.96 1993.49 1813.29 1992.82 1813.29 1991.99V1953.99C1813.29 1953.16 1813.96 1952.49 1814.79 1952.49C1815.62 1952.49 1816.29 1953.16 1816.29 1953.99V1987.49H1876.29V1942.49H1816.29V1942.99C1816.29 1943.82 1815.62 1944.49 1814.79 1944.49C1813.96 1944.49 1813.29 1943.82 1813.29 1942.99V1904.99C1813.29 1904.16 1813.96 1903.49 1814.79 1903.49C1815.62 1903.49 1816.29 1904.16 1816.29 1904.99V1939.49H1876.29V1894.49H1816.2C1816 1895.07 1815.44 1895.49 1814.79 1895.49C1813.96 1895.49 1813.29 1894.82 1813.29 1893.99V1856.99C1813.29 1856.16 1813.96 1855.49 1814.79 1855.49C1815.62 1855.49 1816.29 1856.16 1816.29 1856.99V1891.49H1876.29V1842.49H1816.29V1845.99C1816.29 1846.82 1815.62 1847.49 1814.79 1847.49C1813.96 1847.49 1813.29 1846.82 1813.29 1845.99V1840.99C1813.29 1840.16 1813.96 1839.49 1814.79 1839.49H2070.79C2070.84 1839.49 2070.89 1839.49 2070.94 1839.5C2071.7 1839.58 2072.29 1840.21 2072.29 1840.99V1887.99C2072.29 1888.82 2071.62 1889.49 2070.79 1889.49C2069.96 1889.49 2069.29 1888.82 2069.29 1887.99V1842.49H1968.29V1913.49H2069.29V1906.99C2069.29 1906.16 2069.96 1905.49 2070.79 1905.49C2071.62 1905.49 2072.29 1906.16 2072.29 1906.99V1922.99C2072.29 1923.82 2071.62 1924.49 2070.79 1924.49C2069.96 1924.49 2069.29 1923.82 2069.29 1922.99V1916.49H1968.29V1984.49H2069.29V1940.99C2069.29 1940.16 2069.96 1939.49 2070.79 1939.49C2071.62 1939.49 2072.29 1940.16 2072.29 1940.99V2090.99C2072.29 2091.82 2071.62 2092.49 2070.79 2092.49C2069.96 2092.49 2069.29 2091.82 2069.29 2090.99V1987.49H1968.29V2052.99C1968.29 2053.77 1967.7 2054.41 1966.94 2054.48L1966.79 2054.49H1961.79C1960.96 2054.49 1960.29 2053.82 1960.29 2052.99C1960.29 2052.16 1960.96 2051.49 1961.79 2051.49H1965.29V1842.49H1879.29V2212.99C1879.29 2213.77 1878.7 2214.41 1877.94 2214.48L1877.79 2214.49H1570.79C1570.01 2214.49 1569.38 2213.9 1569.3 2213.14L1569.29 2212.99V1930.49H1468.29V1959.49H1475.79C1475.84 1959.49 1475.89 1959.49 1475.94 1959.5C1476.7 1959.58 1477.29 1960.21 1477.29 1960.99V2098.99C1477.29 2099.77 1476.7 2100.41 1475.94 2100.48L1475.79 2100.49H1469.29V2153.49H1476.79C1476.84 2153.49 1476.89 2153.49 1476.94 2153.5C1477.7 2153.58 1478.29 2154.21 1478.29 2154.99V2205.99C1478.29 2206.77 1477.7 2207.41 1476.94 2207.48L1476.79 2207.49H1414.79C1414.01 2207.49 1413.38 2206.9 1413.3 2206.14L1413.29 2205.99V2202.49H1304.79C1304.74 2202.49 1304.69 2202.49 1304.64 2202.48C1303.93 2202.41 1303.37 2201.85 1303.3 2201.14L1303.29 2200.99V1991.99C1303.29 1991.21 1303.88 1990.58 1304.64 1990.5C1304.69 1990.49 1304.74 1990.49 1304.79 1990.49H1354.29V1970.49H1304.79C1303.96 1970.49 1303.29 1969.82 1303.29 1968.99C1303.29 1968.16 1303.96 1967.49 1304.79 1967.49H1311.29V1930.49H1304.79C1303.96 1930.49 1303.29 1929.82 1303.29 1928.99C1303.29 1928.16 1303.96 1927.49 1304.79 1927.49H1354.29V1907.49H1304.79C1304.01 1907.49 1303.38 1906.9 1303.3 1906.14L1303.29 1905.99V1830.99C1303.29 1830.16 1303.96 1829.49 1304.79 1829.49H1354.29V1823.99C1354.29 1823.16 1354.96 1822.49 1355.79 1822.49ZM1367.79 2132.49C1368.62 2132.49 1369.29 2133.16 1369.29 2133.99C1369.29 2134.82 1368.62 2135.49 1367.79 2135.49H1357.29V2153.49H1367.79C1368.62 2153.49 1369.29 2154.16 1369.29 2154.99C1369.29 2155.82 1368.62 2156.49 1367.79 2156.49H1355.79C1355.01 2156.49 1354.38 2155.9 1354.3 2155.14L1354.29 2154.99V2133.99C1354.29 2133.16 1354.96 2132.49 1355.79 2132.49H1367.79ZM1385.79 2132.49C1386.62 2132.49 1387.29 2133.16 1387.29 2133.99C1387.29 2134.82 1386.62 2135.49 1385.79 2135.49H1383.29V2153.49H1385.79C1386.62 2153.49 1387.29 2154.16 1387.29 2154.99C1387.29 2155.82 1386.62 2156.49 1385.79 2156.49H1379.79C1378.96 2156.49 1378.29 2155.82 1378.29 2154.99C1378.29 2154.16 1378.96 2153.49 1379.79 2153.49H1380.29V2135.49H1379.79C1378.96 2135.49 1378.29 2134.82 1378.29 2133.99C1378.29 2133.16 1378.96 2132.49 1379.79 2132.49H1385.79ZM2098.79 1981.49C2099.62 1981.49 2100.29 1982.16 2100.29 1982.99V2136.49H2106.79C2107.62 2136.49 2108.29 2137.16 2108.29 2137.99C2108.29 2138.82 2107.62 2139.49 2106.79 2139.49H2098.79C2098.01 2139.49 2097.38 2138.9 2097.3 2138.14L2097.29 2137.99V1982.99C2097.29 1982.16 2097.96 1981.49 2098.79 1981.49ZM2210.79 2136.49C2211.62 2136.49 2212.29 2137.16 2212.29 2137.99C2212.29 2138.82 2211.62 2139.49 2210.79 2139.49H2122.79C2121.96 2139.49 2121.29 2138.82 2121.29 2137.99C2121.29 2137.16 2121.96 2136.49 2122.79 2136.49H2210.79ZM2231.79 1980.49C2232.62 1980.49 2233.29 1981.16 2233.29 1981.99V2136.99C2233.29 2137.17 2233.26 2137.33 2233.2 2137.49C2233.26 2137.65 2233.29 2137.82 2233.29 2137.99C2233.29 2138.82 2232.62 2139.49 2231.79 2139.49H2226.79C2225.96 2139.49 2225.29 2138.82 2225.29 2137.99C2225.29 2137.16 2225.96 2136.49 2226.79 2136.49H2230.29V1981.99C2230.29 1981.16 2230.96 1980.49 2231.79 1980.49ZM1690.94 1839.5C1691.7 1839.58 1692.29 1840.21 1692.29 1840.99V1870.49H1765.29V1842.49H1703.79C1702.96 1842.49 1702.29 1841.82 1702.29 1840.99C1702.29 1840.16 1702.96 1839.49 1703.79 1839.49H1766.79C1766.84 1839.49 1766.89 1839.49 1766.94 1839.5C1767.7 1839.58 1768.29 1840.21 1768.29 1840.99V1871.99C1768.29 1872.77 1767.7 1873.41 1766.94 1873.48L1766.79 1873.49H1690.79C1690.01 1873.49 1689.38 1872.9 1689.3 1872.14L1689.29 1871.99V1842.49H1656.29V2131.49H1671.29V2104.99C1671.29 2104.16 1671.96 2103.49 1672.79 2103.49C1672.97 2103.49 1673.13 2103.52 1673.29 2103.58C1673.45 2103.52 1673.62 2103.49 1673.79 2103.49H1719.79C1719.84 2103.49 1719.89 2103.49 1719.94 2103.5C1720.7 2103.58 1721.29 2104.21 1721.29 2104.99V2131.49H1775.79C1776.62 2131.49 1777.29 2132.16 1777.29 2132.99C1777.29 2133.82 1776.62 2134.49 1775.79 2134.49H1719.79C1719.74 2134.49 1719.69 2134.49 1719.64 2134.48C1718.93 2134.41 1718.37 2133.85 1718.3 2133.14L1718.29 2132.99V2106.49H1674.29V2132.99C1674.29 2133.77 1673.7 2134.41 1672.94 2134.48L1672.79 2134.49H1594.79C1594.01 2134.49 1593.38 2133.9 1593.3 2133.14L1593.29 2132.99V2055.99C1593.29 2055.16 1593.96 2054.49 1594.79 2054.49C1595.62 2054.49 1596.29 2055.16 1596.29 2055.99V2131.49H1653.29V2043.49H1594.79C1594.74 2043.49 1594.69 2043.49 1594.64 2043.48C1593.93 2043.41 1593.37 2042.85 1593.3 2042.14L1593.29 2041.99V1954.99C1593.29 1954.16 1593.96 1953.49 1594.79 1953.49C1595.62 1953.49 1596.29 1954.16 1596.29 1954.99V2040.49H1653.29V1943.49H1596.29V1943.99C1596.29 1944.82 1595.62 1945.49 1594.79 1945.49C1593.96 1945.49 1593.29 1944.82 1593.29 1943.99V1854.99C1593.29 1854.16 1593.96 1853.49 1594.79 1853.49C1595.62 1853.49 1596.29 1854.16 1596.29 1854.99V1940.49H1653.29V1842.49H1596.29V1842.99C1596.29 1843.82 1595.62 1844.49 1594.79 1844.49C1593.96 1844.49 1593.29 1843.82 1593.29 1842.99V1840.99C1593.29 1840.16 1593.96 1839.49 1594.79 1839.49H1690.79C1690.84 1839.49 1690.89 1839.49 1690.94 1839.5ZM1790.79 1839.49C1791.62 1839.49 1792.29 1840.16 1792.29 1840.99V2132.99C1792.29 2133.77 1791.7 2134.41 1790.94 2134.48L1790.79 2134.49H1786.79C1785.96 2134.49 1785.29 2133.82 1785.29 2132.99C1785.29 2132.16 1785.96 2131.49 1786.79 2131.49H1789.29V1842.49H1777.79C1776.96 1842.49 1776.29 1841.82 1776.29 1840.99C1776.29 1840.16 1776.96 1839.49 1777.79 1839.49H1790.79ZM2259.79 2052.49C2260.62 2052.49 2261.29 2053.16 2261.29 2053.99V2124.99C2261.29 2125.82 2260.62 2126.49 2259.79 2126.49C2258.96 2126.49 2258.29 2125.82 2258.29 2124.99V2053.99C2258.29 2053.16 2258.96 2052.49 2259.79 2052.49ZM2742.79 2081.49C2743.62 2081.49 2744.29 2082.16 2744.29 2082.99V2092.49H2775.79C2776.62 2092.49 2777.29 2093.16 2777.29 2093.99C2777.29 2094.82 2776.62 2095.49 2775.79 2095.49H2716.29V2122.49H2775.79C2776.62 2122.49 2777.29 2123.16 2777.29 2123.99C2777.29 2124.82 2776.62 2125.49 2775.79 2125.49H2714.79C2714.01 2125.49 2713.38 2124.9 2713.3 2124.14L2713.29 2123.99V2095.49H2708.79C2707.96 2095.49 2707.29 2094.82 2707.29 2093.99C2707.29 2093.16 2707.96 2092.49 2708.79 2092.49H2741.29V2082.99C2741.29 2082.16 2741.96 2081.49 2742.79 2081.49ZM1398.79 2086.49C1399.62 2086.49 1400.29 2087.16 1400.29 2087.99V2097.58C1400.87 2097.78 1401.29 2098.34 1401.29 2098.99C1401.29 2099.64 1400.87 2100.2 1400.29 2100.4V2113.99C1400.29 2114.82 1399.62 2115.49 1398.79 2115.49C1397.96 2115.49 1397.29 2114.82 1397.29 2113.99V2087.99C1397.29 2087.16 1397.96 2086.49 1398.79 2086.49ZM3051.7 1759.01C3051.86 1758.19 3052.65 1757.67 3053.46 1757.83C3054.28 1758 3054.8 1758.79 3054.64 1759.6L2987.49 2092.49H3007.79C3008.62 2092.49 3009.29 2093.16 3009.29 2093.99C3009.29 2094.82 3008.62 2095.49 3007.79 2095.49H2985.79C2985.02 2095.49 2984.39 2094.91 2984.3 2094.16C2984.22 2093.92 2984.2 2093.66 2984.25 2093.39L3051.7 1759.01ZM2798.79 1832.49C2799.62 1832.49 2800.29 1833.16 2800.29 1833.99V1839.49H2870.79C2871.62 1839.49 2872.29 1840.16 2872.29 1840.99V2074.49H2889.79C2890.62 2074.49 2891.29 2075.16 2891.29 2075.99C2891.29 2076.82 2890.62 2077.49 2889.79 2077.49H2870.79C2870.01 2077.49 2869.38 2076.9 2869.3 2076.14L2869.29 2075.99V2070.49H2798.79C2798.74 2070.49 2798.69 2070.49 2798.64 2070.48C2797.93 2070.41 2797.37 2069.85 2797.3 2069.14L2797.29 2068.99V2018.99C2797.29 2018.16 2797.96 2017.49 2798.79 2017.49C2799.62 2017.49 2800.29 2018.16 2800.29 2018.99V2067.49H2869.29V1918.49H2800.29V1934.99C2800.29 1935.82 2799.62 1936.49 2798.79 1936.49C2797.96 1936.49 2797.29 1935.82 2797.29 1934.99V1900.99C2797.29 1900.16 2797.96 1899.49 2798.79 1899.49C2799.62 1899.49 2800.29 1900.16 2800.29 1900.99V1915.49H2869.29V1842.49H2800.29V1885.99C2800.29 1886.82 2799.62 1887.49 2798.79 1887.49C2797.96 1887.49 2797.29 1886.82 2797.29 1885.99V1833.99C2797.29 1833.16 2797.96 1832.49 2798.79 1832.49ZM2259.79 1953.49C2260.62 1953.49 2261.29 1954.16 2261.29 1954.99V2027.99C2261.29 2028.82 2260.62 2029.49 2259.79 2029.49C2258.96 2029.49 2258.29 2028.82 2258.29 2027.99V1954.99C2258.29 1954.16 2258.96 1953.49 2259.79 1953.49ZM2798.79 1942.49C2799.62 1942.49 2800.29 1943.16 2800.29 1943.99V2009.99C2800.29 2010.82 2799.62 2011.49 2798.79 2011.49C2797.96 2011.49 2797.29 2010.82 2797.29 2009.99V1943.99C2797.29 1943.16 2797.96 1942.49 2798.79 1942.49ZM2775.79 1943.49C2776.62 1943.49 2777.29 1944.16 2777.29 1944.99V2008.99C2777.29 2009.82 2776.62 2010.49 2775.79 2010.49C2774.96 2010.49 2774.29 2009.82 2774.29 2008.99V1944.99C2774.29 1944.16 2774.96 1943.49 2775.79 1943.49ZM1449.79 1959.49C1450.62 1959.49 1451.29 1960.16 1451.29 1960.99C1451.29 1961.82 1450.62 1962.49 1449.79 1962.49H1400.29V1974.99C1400.29 1975.82 1399.62 1976.49 1398.79 1976.49C1397.96 1976.49 1397.29 1975.82 1397.29 1974.99V1960.99C1397.29 1960.16 1397.96 1959.49 1398.79 1959.49H1449.79ZM2098.79 1962.49C2099.62 1962.49 2100.29 1963.16 2100.29 1963.99V1967.99C2100.29 1968.82 2099.62 1969.49 2098.79 1969.49C2097.96 1969.49 2097.29 1968.82 2097.29 1967.99V1963.99C2097.29 1963.16 2097.96 1962.49 2098.79 1962.49ZM2231.79 1962.49C2232.62 1962.49 2233.29 1963.16 2233.29 1963.99V1967.99C2233.29 1968.82 2232.62 1969.49 2231.79 1969.49C2230.96 1969.49 2230.29 1968.82 2230.29 1967.99V1963.99C2230.29 1963.16 2230.96 1962.49 2231.79 1962.49ZM2098.79 1891.49C2099.62 1891.49 2100.29 1892.16 2100.29 1892.99V1951.99C2100.29 1952.82 2099.62 1953.49 2098.79 1953.49C2097.96 1953.49 2097.29 1952.82 2097.29 1951.99V1892.99C2097.29 1892.16 2097.96 1891.49 2098.79 1891.49ZM2231.79 1891.49C2232.62 1891.49 2233.29 1892.16 2233.29 1892.99V1951.99C2233.29 1952.82 2232.62 1953.49 2231.79 1953.49C2230.96 1953.49 2230.29 1952.82 2230.29 1951.99V1892.99C2230.29 1892.16 2230.96 1891.49 2231.79 1891.49ZM2132.79 1851.49C2133.62 1851.49 2134.29 1852.16 2134.29 1852.99V1896.49H2193.29V1853.99C2193.29 1853.82 2193.32 1853.65 2193.38 1853.49C2193.32 1853.33 2193.29 1853.17 2193.29 1852.99C2193.29 1852.16 2193.96 1851.49 2194.79 1851.49H2202.79C2203.62 1851.49 2204.29 1852.16 2204.29 1852.99C2204.29 1853.82 2203.62 1854.49 2202.79 1854.49H2196.29V1897.99C2196.29 1898.77 2195.7 1899.41 2194.94 1899.48L2194.79 1899.49H2132.79C2132.74 1899.49 2132.69 1899.49 2132.64 1899.48C2131.93 1899.41 2131.37 1898.85 2131.3 1898.14L2131.29 1897.99V1854.49H2122.79C2121.96 1854.49 2121.29 1853.82 2121.29 1852.99C2121.29 1852.16 2121.96 1851.49 2122.79 1851.49H2132.79ZM1441.79 1880.49C1442.62 1880.49 1443.29 1881.16 1443.29 1881.99C1443.29 1882.82 1442.62 1883.49 1441.79 1883.49H1400.29V1895.99C1400.29 1896.82 1399.62 1897.49 1398.79 1897.49C1397.96 1897.49 1397.29 1896.82 1397.29 1895.99V1881.99C1397.29 1881.16 1397.96 1880.49 1398.79 1880.49H1441.79ZM2106.79 1851.49C2107.62 1851.49 2108.29 1852.16 2108.29 1852.99C2108.29 1853.82 2107.62 1854.49 2106.79 1854.49H2100.29V1868.99C2100.29 1869.82 2099.62 1870.49 2098.79 1870.49C2097.96 1870.49 2097.29 1869.82 2097.29 1868.99V1852.99C2097.29 1852.21 2097.88 1851.58 2098.64 1851.5C2098.69 1851.49 2098.74 1851.49 2098.79 1851.49H2106.79ZM2231.94 1851.5C2232.7 1851.58 2233.29 1852.21 2233.29 1852.99V1868.99C2233.29 1869.82 2232.62 1870.49 2231.79 1870.49C2230.96 1870.49 2230.29 1869.82 2230.29 1868.99V1854.49H2223.79C2222.96 1854.49 2222.29 1853.82 2222.29 1852.99C2222.29 1852.16 2222.96 1851.49 2223.79 1851.49H2231.79C2231.84 1851.49 2231.89 1851.49 2231.94 1851.5ZM931.788 1147.49C932.616 1147.49 933.288 1148.16 933.288 1148.99C933.288 1149.82 932.616 1150.49 931.788 1150.49H909.288V1256.49H914.788C915.616 1256.49 916.288 1257.16 916.288 1257.99C916.288 1258.82 915.616 1259.49 914.788 1259.49H909.288V1294.58C909.444 1294.52 909.612 1294.49 909.788 1294.49H920.788C921.616 1294.49 922.288 1295.16 922.288 1295.99C922.288 1296.82 921.616 1297.49 920.788 1297.49H909.788C909.612 1297.49 909.444 1297.46 909.288 1297.4V1473.49H912.788C913.616 1473.49 914.288 1474.16 914.288 1474.99C914.288 1475.82 913.616 1476.49 912.788 1476.49H909.288V1788.49H1176.79C1176.96 1788.49 1177.13 1788.52 1177.29 1788.58C1177.45 1788.52 1177.61 1788.49 1177.79 1788.49C1178.62 1788.49 1179.29 1789.16 1179.29 1789.99V1818.49H1232.29V1791.49H1216.79C1215.96 1791.49 1215.29 1790.82 1215.29 1789.99C1215.29 1789.16 1215.96 1788.49 1216.79 1788.49H1233.79C1234.62 1788.49 1235.29 1789.16 1235.29 1789.99V1819.99C1235.29 1820.82 1234.62 1821.49 1233.79 1821.49C1233.62 1821.49 1233.45 1821.46 1233.29 1821.4C1233.13 1821.46 1232.97 1821.49 1232.79 1821.49H1177.79C1177.01 1821.49 1176.38 1820.9 1176.3 1820.14L1176.29 1819.99V1791.49H908.788C908.612 1791.49 908.444 1791.46 908.288 1791.4C908.131 1791.46 907.963 1791.49 907.788 1791.49C906.96 1791.49 906.288 1790.82 906.288 1789.99V1148.99C906.288 1148.16 906.959 1147.49 907.788 1147.49C907.963 1147.49 908.131 1147.52 908.288 1147.58C908.444 1147.52 908.612 1147.49 908.788 1147.49H931.788ZM2798.94 1806.5C2799.7 1806.58 2800.29 1807.21 2800.29 1807.99V1815.99C2800.29 1816.82 2799.62 1817.49 2798.79 1817.49C2797.96 1817.49 2797.29 1816.82 2797.29 1815.99V1809.49H2404.79C2403.96 1809.49 2403.29 1808.82 2403.29 1807.99C2403.29 1807.16 2403.96 1806.49 2404.79 1806.49H2798.79C2798.84 1806.49 2798.89 1806.49 2798.94 1806.5ZM1506.79 988.491C1507.62 988.491 1508.29 989.163 1508.29 989.991V998.325L1573.25 1031.43C1573.99 1031.8 1574.29 1032.71 1573.91 1033.44C1573.78 1033.69 1573.6 1033.88 1573.39 1034.02L1543.62 1115.8C1543.55 1116 1543.43 1116.18 1543.29 1116.33V1780.49H1653.79C1653.84 1780.49 1653.89 1780.49 1653.94 1780.5C1654.7 1780.58 1655.29 1781.21 1655.29 1781.99V1807.99C1655.29 1808.77 1654.7 1809.41 1653.94 1809.48L1653.79 1809.49H1616.79C1615.96 1809.49 1615.29 1808.82 1615.29 1807.99C1615.29 1807.16 1615.96 1806.49 1616.79 1806.49H1652.29V1783.49H1589.29V1806.49H1604.79C1605.62 1806.49 1606.29 1807.16 1606.29 1807.99C1606.29 1808.82 1605.62 1809.49 1604.79 1809.49H1567.79C1566.96 1809.49 1566.29 1808.82 1566.29 1807.99C1566.29 1807.16 1566.96 1806.49 1567.79 1806.49H1586.29V1783.49H1543.29V1806.49H1557.79C1558.62 1806.49 1559.29 1807.16 1559.29 1807.99C1559.29 1808.82 1558.62 1809.49 1557.79 1809.49H1454.79C1453.96 1809.49 1453.29 1808.82 1453.29 1807.99C1453.29 1807.16 1453.96 1806.49 1454.79 1806.49H1540.29V1711.49H1456.29V1794.99C1456.29 1795.82 1455.62 1796.49 1454.79 1796.49C1453.96 1796.49 1453.29 1795.82 1453.29 1794.99V1709.99C1453.29 1709.16 1453.96 1708.49 1454.79 1708.49H1540.29V1657.49H1456.29V1698.99C1456.29 1699.82 1455.62 1700.49 1454.79 1700.49C1453.96 1700.49 1453.29 1699.82 1453.29 1698.99V1657.49H1452.79C1451.96 1657.49 1451.29 1656.82 1451.29 1655.99C1451.29 1655.16 1451.96 1654.49 1452.79 1654.49H1540.29V1592.49H1456.29V1639.99C1456.29 1640.82 1455.62 1641.49 1454.79 1641.49C1453.96 1641.49 1453.29 1640.82 1453.29 1639.99V1590.99C1453.29 1590.16 1453.96 1589.49 1454.79 1589.49C1454.97 1589.49 1455.13 1589.52 1455.29 1589.58C1455.45 1589.52 1455.62 1589.49 1455.79 1589.49H1540.29V1537.49H1456.29V1577.99C1456.29 1578.82 1455.62 1579.49 1454.79 1579.49C1453.96 1579.49 1453.29 1578.82 1453.29 1577.99V1532.99C1453.29 1532.16 1453.96 1531.49 1454.79 1531.49C1455.62 1531.49 1456.29 1532.16 1456.29 1532.99V1534.49H1540.29V1479.49H1456.29V1523.99C1456.29 1524.82 1455.62 1525.49 1454.79 1525.49C1453.96 1525.49 1453.29 1524.82 1453.29 1523.99V1477.99C1453.29 1477.16 1453.96 1476.49 1454.79 1476.49H1540.29V1365.49H1456.29V1464.99C1456.29 1465.82 1455.62 1466.49 1454.79 1466.49C1453.96 1466.49 1453.29 1465.82 1453.29 1464.99V1364.99C1453.29 1364.82 1453.32 1364.65 1453.38 1364.49C1453.32 1364.33 1453.29 1364.17 1453.29 1363.99C1453.29 1363.16 1453.96 1362.49 1454.79 1362.49H1540.29V1302.49H1456.29V1351.99C1456.29 1352.82 1455.62 1353.49 1454.79 1353.49C1453.96 1353.49 1453.29 1352.82 1453.29 1351.99V1299.99C1453.29 1299.16 1453.96 1298.49 1454.79 1298.49C1455.44 1298.49 1456 1298.91 1456.2 1299.49H1540.29V1248.49H1456.29V1290.99C1456.29 1291.82 1455.62 1292.49 1454.79 1292.49C1453.96 1292.49 1453.29 1291.82 1453.29 1290.99V1247.99C1453.29 1247.82 1453.32 1247.65 1453.38 1247.49C1453.32 1247.33 1453.29 1247.17 1453.29 1246.99C1453.29 1246.16 1453.96 1245.49 1454.79 1245.49H1540.29V1130.49H1456.29V1234.99C1456.29 1235.82 1455.62 1236.49 1454.79 1236.49C1453.96 1236.49 1453.29 1235.82 1453.29 1234.99V1130.49H1450.79C1449.96 1130.49 1449.29 1129.82 1449.29 1128.99C1449.29 1128.16 1449.96 1127.49 1450.79 1127.49H1540.29V1115.99C1540.29 1115.56 1540.47 1115.17 1540.76 1114.9C1540.77 1114.86 1540.79 1114.81 1540.8 1114.77L1570.44 1033.36L1506.63 1000.84C1506.37 1000.71 1506.16 1000.51 1506.02 1000.28C1505.58 1000.01 1505.29 999.537 1505.29 998.991V991.491H1466.29V998.991C1466.29 999.748 1465.73 1000.37 1465 1000.47C1464.88 1000.65 1464.72 1000.8 1464.52 1000.92L1403.51 1036.14L1432.33 1115.31C1432.47 1115.69 1432.44 1116.08 1432.29 1116.43V1127.49H1435.79C1436.62 1127.49 1437.29 1128.16 1437.29 1128.99C1437.29 1129.82 1436.62 1130.49 1435.79 1130.49H1432.29V1158.99C1432.29 1159.82 1431.62 1160.49 1430.79 1160.49C1429.96 1160.49 1429.29 1159.82 1429.29 1158.99V1115.99C1429.29 1115.92 1429.3 1115.85 1429.31 1115.78L1400.44 1036.46C1400.22 1035.86 1400.41 1035.22 1400.86 1034.82C1400.94 1034.4 1401.19 1034.02 1401.59 1033.79L1463.02 998.318C1463.11 998.268 1463.2 998.227 1463.29 998.196V989.991C1463.29 989.163 1463.96 988.491 1464.79 988.491H1506.79ZM1794.79 1081.49C1795.62 1081.49 1796.29 1082.16 1796.29 1082.99V1615.99L1796.28 1616.14C1796.21 1616.9 1795.57 1617.49 1794.79 1617.49H1767.29V1807.99C1767.29 1808.41 1767.12 1808.78 1766.85 1809.05C1766.78 1809.12 1766.71 1809.18 1766.63 1809.23C1766.43 1809.37 1766.2 1809.46 1765.94 1809.48L1765.79 1809.49H1707.79C1706.96 1809.49 1706.29 1808.82 1706.29 1807.99C1706.29 1807.16 1706.96 1806.49 1707.79 1806.49H1764.29V1761.49H1709.29V1794.99C1709.29 1795.82 1708.62 1796.49 1707.79 1796.49C1706.96 1796.49 1706.29 1795.82 1706.29 1794.99V1759.99C1706.29 1759.21 1706.88 1758.58 1707.64 1758.5C1707.69 1758.49 1707.74 1758.49 1707.79 1758.49H1764.29V1665.49H1709.29V1698.99C1709.29 1699.82 1708.62 1700.49 1707.79 1700.49C1706.96 1700.49 1706.29 1699.82 1706.29 1698.99V1663.99C1706.29 1663.21 1706.88 1662.58 1707.64 1662.5C1707.69 1662.49 1707.74 1662.49 1707.79 1662.49H1764.29V1617.49H1709.29V1650.99C1709.29 1651.82 1708.62 1652.49 1707.79 1652.49C1706.96 1652.49 1706.29 1651.82 1706.29 1650.99V1615.99C1706.29 1615.21 1706.88 1614.58 1707.64 1614.5C1707.69 1614.49 1707.74 1614.49 1707.79 1614.49H1793.29V1552.49H1709.29V1602.99C1709.29 1603.82 1708.62 1604.49 1707.79 1604.49C1706.96 1604.49 1706.29 1603.82 1706.29 1602.99V1550.99C1706.29 1550.21 1706.88 1549.58 1707.64 1549.5C1707.69 1549.49 1707.74 1549.49 1707.79 1549.49H1793.29V1494.49H1709.29V1538.99C1709.29 1539.82 1708.62 1540.49 1707.79 1540.49C1706.96 1540.49 1706.29 1539.82 1706.29 1538.99V1492.99C1706.29 1492.16 1706.96 1491.49 1707.79 1491.49H1793.29V1435.49H1709.29V1479.99C1709.29 1480.82 1708.62 1481.49 1707.79 1481.49C1706.96 1481.49 1706.29 1480.82 1706.29 1479.99V1433.99C1706.29 1433.16 1706.96 1432.49 1707.79 1432.49H1793.29V1376.49H1709.29V1420.99C1709.29 1421.82 1708.62 1422.49 1707.79 1422.49C1706.96 1422.49 1706.29 1421.82 1706.29 1420.99V1374.99C1706.29 1374.16 1706.96 1373.49 1707.79 1373.49H1793.29V1318.49H1720.79C1719.96 1318.49 1719.29 1317.82 1719.29 1316.99C1719.29 1316.16 1719.96 1315.49 1720.79 1315.49H1793.29V1259.49H1709.29V1303.99C1709.29 1304.82 1708.62 1305.49 1707.79 1305.49C1706.96 1305.49 1706.29 1304.82 1706.29 1303.99V1257.99C1706.29 1257.16 1706.96 1256.49 1707.79 1256.49H1793.29V1202.49H1709.29V1244.99C1709.29 1245.82 1708.62 1246.49 1707.79 1246.49C1706.96 1246.49 1706.29 1245.82 1706.29 1244.99V1202.49H1702.79C1701.96 1202.49 1701.29 1201.82 1701.29 1200.99C1701.29 1200.16 1701.96 1199.49 1702.79 1199.49H1793.29V1084.49H1685.29V1199.49H1688.79C1689.62 1199.49 1690.29 1200.16 1690.29 1200.99C1690.29 1201.82 1689.62 1202.49 1688.79 1202.49H1685.29V1807.99C1685.29 1808.77 1684.7 1809.41 1683.94 1809.48L1683.79 1809.49H1666.79C1665.96 1809.49 1665.29 1808.82 1665.29 1807.99C1665.29 1807.16 1665.96 1806.49 1666.79 1806.49H1682.29V1082.99C1682.29 1082.16 1682.96 1081.49 1683.79 1081.49H1794.79ZM1877.79 1780.49C1878.62 1780.49 1879.29 1781.16 1879.29 1781.99V1806.49H1903.79C1904.62 1806.49 1905.29 1807.16 1905.29 1807.99C1905.29 1808.82 1904.62 1809.49 1903.79 1809.49H1821.79C1820.96 1809.49 1820.29 1808.82 1820.29 1807.99C1820.29 1807.16 1820.96 1806.49 1821.79 1806.49H1876.29V1783.49H1803.29V1807.99C1803.29 1808.77 1802.7 1809.41 1801.94 1809.48L1801.79 1809.49H1778.79C1777.96 1809.49 1777.29 1808.82 1777.29 1807.99C1777.29 1807.16 1777.96 1806.49 1778.79 1806.49H1800.29V1781.99C1800.29 1781.16 1800.96 1780.49 1801.79 1780.49H1877.79ZM882.616 721.76C882.769 720.946 883.554 720.409 884.368 720.562L1953.53 921.682C1953.99 921.767 1954.35 922.049 1954.56 922.423L3174.46 1175.63C3174.65 1175.67 3174.82 1175.74 3174.97 1175.84C3175.24 1175.72 3175.55 1175.68 3175.87 1175.74C3176.68 1175.91 3177.2 1176.7 3177.04 1177.51L3067.98 1707.67C3067.82 1708.48 3067.02 1709.01 3066.21 1708.84C3065.4 1708.67 3064.88 1707.88 3065.04 1707.07L3173.76 1178.55L2099.29 955.526V1246.99C2099.29 1247.2 2099.25 1247.4 2099.17 1247.58C2099.13 1247.66 2099.09 1247.75 2099.03 1247.83C2098.79 1248.19 2098.4 1248.44 2097.94 1248.48L2097.79 1248.49H2046.29V1806.49H2132.29V1734.99C2132.29 1734.21 2132.88 1733.58 2133.64 1733.5C2133.69 1733.49 2133.74 1733.49 2133.79 1733.49H2194.79C2194.84 1733.49 2194.89 1733.49 2194.94 1733.5C2195.7 1733.58 2196.29 1734.21 2196.29 1734.99V1806.49H2317.79C2318.62 1806.49 2319.29 1807.16 2319.29 1807.99C2319.29 1808.82 2318.62 1809.49 2317.79 1809.49H2181.79C2180.96 1809.49 2180.29 1808.82 2180.29 1807.99C2180.29 1807.16 2180.96 1806.49 2181.79 1806.49H2193.29V1736.49H2135.29V1806.49H2145.79C2146.62 1806.49 2147.29 1807.16 2147.29 1807.99C2147.29 1808.82 2146.62 1809.49 2145.79 1809.49H1986.79C1985.96 1809.49 1985.29 1808.82 1985.29 1807.99C1985.29 1807.16 1985.96 1806.49 1986.79 1806.49H2043.29V1747.49H1988.29V1796.99C1988.29 1797.82 1987.62 1798.49 1986.79 1798.49C1985.96 1798.49 1985.29 1797.82 1985.29 1796.99V1745.99C1985.29 1745.16 1985.96 1744.49 1986.79 1744.49H2043.29V1662.49H1988.29V1731.99C1988.29 1732.82 1987.62 1733.49 1986.79 1733.49C1985.96 1733.49 1985.29 1732.82 1985.29 1731.99V1660.99C1985.29 1660.16 1985.96 1659.49 1986.79 1659.49H2043.29V1572.49H1988.29V1649.99C1988.29 1650.82 1987.62 1651.49 1986.79 1651.49C1985.96 1651.49 1985.29 1650.82 1985.29 1649.99V1570.99C1985.29 1570.16 1985.96 1569.49 1986.79 1569.49H2043.29V1486.49H1988.29V1555.99C1988.29 1556.82 1987.62 1557.49 1986.79 1557.49C1985.96 1557.49 1985.29 1556.82 1985.29 1555.99V1484.99C1985.29 1484.16 1985.96 1483.49 1986.79 1483.49H2043.29V1422.49H1988.29V1471.99C1988.29 1472.82 1987.62 1473.49 1986.79 1473.49C1985.96 1473.49 1985.29 1472.82 1985.29 1471.99V1420.99C1985.29 1420.16 1985.96 1419.49 1986.79 1419.49H2043.29V1338.49H1988.29V1407.99C1988.29 1408.82 1987.62 1409.49 1986.79 1409.49C1985.96 1409.49 1985.29 1408.82 1985.29 1407.99V1305.99C1985.29 1305.16 1985.96 1304.49 1986.79 1304.49C1987.62 1304.49 1988.29 1305.16 1988.29 1305.99V1335.49H2043.29V1248.49H2014.79C2013.96 1248.49 2013.29 1247.82 2013.29 1246.99C2013.29 1246.16 2013.96 1245.49 2014.79 1245.49H2096.29V954.991C2096.29 954.962 2096.29 954.934 2096.29 954.905L1952.54 925.067L1919.53 1085.43C1919.49 1085.64 1919.4 1085.83 1919.29 1085.99V1245.49H1955.79C1956.62 1245.49 1957.29 1246.16 1957.29 1246.99C1957.29 1247.82 1956.62 1248.49 1955.79 1248.49H1919.29V1276.49H1955.79C1956.62 1276.49 1957.29 1277.16 1957.29 1277.99C1957.29 1278.82 1956.62 1279.49 1955.79 1279.49H1919.29V1397.49H1955.79C1956.62 1397.49 1957.29 1398.16 1957.29 1398.99C1957.29 1399.82 1956.62 1400.49 1955.79 1400.49H1919.29V1455.49H1966.29V1450.99C1966.29 1450.16 1966.96 1449.49 1967.79 1449.49C1968.62 1449.49 1969.29 1450.16 1969.29 1450.99V1456.99C1969.29 1457.77 1968.7 1458.41 1967.94 1458.48L1967.79 1458.49H1919.29V1485.49H1966.29V1465.99C1966.29 1465.16 1966.96 1464.49 1967.79 1464.49C1968.62 1464.49 1969.29 1465.16 1969.29 1465.99V1531.99C1969.29 1532.82 1968.62 1533.49 1967.79 1533.49C1966.96 1533.49 1966.29 1532.82 1966.29 1531.99V1488.49H1919.29V1543.49H1967.79C1968.62 1543.49 1969.29 1544.16 1969.29 1544.99V1590.99C1969.29 1591.82 1968.62 1592.49 1967.79 1592.49C1966.96 1592.49 1966.29 1591.82 1966.29 1590.99V1546.49H1919.29V1601.49H1967.79C1968.62 1601.49 1969.29 1602.16 1969.29 1602.99V1649.99C1969.29 1650.82 1968.62 1651.49 1967.79 1651.49C1966.96 1651.49 1966.29 1650.82 1966.29 1649.99V1604.49H1919.29V1659.49H1967.79C1968.62 1659.49 1969.29 1660.16 1969.29 1660.99V1703.99C1969.29 1704.82 1968.62 1705.49 1967.79 1705.49C1966.96 1705.49 1966.29 1704.82 1966.29 1703.99V1662.49H1919.29V1716.49H1967.79C1968.62 1716.49 1969.29 1717.16 1969.29 1717.99V1764.99C1969.29 1765.82 1968.62 1766.49 1967.79 1766.49C1966.96 1766.49 1966.29 1765.82 1966.29 1764.99V1719.49H1919.29V1774.49H1967.79C1968.62 1774.49 1969.29 1775.16 1969.29 1775.99C1969.29 1776.17 1969.26 1776.33 1969.2 1776.49C1969.26 1776.65 1969.29 1776.82 1969.29 1776.99V1784.99C1969.29 1785.82 1968.62 1786.49 1967.79 1786.49C1966.96 1786.49 1966.29 1785.82 1966.29 1784.99V1777.49H1919.29V1806.49H1966.29V1799.99C1966.29 1799.16 1966.96 1798.49 1967.79 1798.49C1968.62 1798.49 1969.29 1799.16 1969.29 1799.99V1807.99C1969.29 1808.77 1968.7 1809.41 1967.94 1809.48L1967.79 1809.49H1917.79C1917.01 1809.49 1916.38 1808.9 1916.3 1808.14L1916.29 1807.99V1083.99C1916.29 1083.44 1916.59 1082.96 1917.03 1082.7L1949.7 924.012L1455.31 831.013C1455.33 831.175 1455.33 831.343 1455.3 831.514L1441.2 907.527L1639.75 944.878C1639.86 944.9 1639.98 944.938 1640.08 944.985C1640.24 944.964 1640.39 944.965 1640.55 944.993C1641.37 945.136 1641.91 945.914 1641.77 946.73L1639.13 961.735C1638.99 962.551 1638.21 963.096 1637.4 962.953C1636.58 962.81 1636.03 962.032 1636.18 961.216L1638.55 947.705L1440.65 910.477L1438.81 920.401C1438.7 921.013 1438.23 921.469 1437.65 921.594C1437.36 921.769 1437 921.845 1436.63 921.78L1151.77 871.705C1150.95 871.562 1150.41 870.784 1150.55 869.969C1150.69 869.153 1151.47 868.607 1152.29 868.751L1436.09 918.638L1452.35 830.966C1452.39 830.793 1452.45 830.634 1452.53 830.49L925.967 731.439L905.552 823.805L939.584 829.998C940.399 830.146 940.94 830.927 940.792 831.742C940.643 832.557 939.862 833.098 939.047 832.95L903.298 826.444C902.483 826.296 901.942 825.515 902.091 824.7C902.141 824.421 902.266 824.175 902.441 823.977L923.017 730.885L883.813 723.511C882.999 723.358 882.463 722.574 882.616 721.76ZM2348.79 1806.49C2349.62 1806.49 2350.29 1807.16 2350.29 1807.99C2350.29 1808.82 2349.62 1809.49 2348.79 1809.49H2335.79C2334.96 1809.49 2334.29 1808.82 2334.29 1807.99C2334.29 1807.16 2334.96 1806.49 2335.79 1806.49H2348.79ZM2385.79 1806.49C2386.62 1806.49 2387.29 1807.16 2387.29 1807.99C2387.29 1808.82 2386.62 1809.49 2385.79 1809.49H2377.79C2376.96 1809.49 2376.29 1808.82 2376.29 1807.99C2376.29 1807.16 2376.96 1806.49 2377.79 1806.49H2385.79ZM1355.94 1788.5C1356.7 1788.58 1357.29 1789.21 1357.29 1789.99V1804.99C1357.29 1805.82 1356.62 1806.49 1355.79 1806.49C1354.96 1806.49 1354.29 1805.82 1354.29 1804.99V1791.49H1245.79C1244.96 1791.49 1244.29 1790.82 1244.29 1789.99C1244.29 1789.16 1244.96 1788.49 1245.79 1788.49H1355.79C1355.84 1788.49 1355.89 1788.49 1355.94 1788.5ZM1208.79 1788.49C1209.62 1788.49 1210.29 1789.16 1210.29 1789.99C1210.29 1790.82 1209.62 1791.49 1208.79 1791.49H1185.79C1184.96 1791.49 1184.29 1790.82 1184.29 1789.99C1184.29 1789.16 1184.96 1788.49 1185.79 1788.49H1208.79ZM2993.07 1745.96C2993.23 1745.16 2994 1744.64 2994.8 1744.78C2994.98 1744.75 2995.16 1744.75 2995.35 1744.79L3023.68 1750.44C3024.39 1750.58 3024.89 1751.21 3024.88 1751.92C3024.93 1752.12 3024.94 1752.33 3024.89 1752.55L3020.35 1775.29C3020.19 1776.1 3019.4 1776.63 3018.59 1776.46C3018.52 1776.45 3018.46 1776.43 3018.4 1776.41C3018.3 1776.41 3018.19 1776.4 3018.09 1776.38L2989.76 1770.73C2988.96 1770.57 2988.44 1769.8 2988.58 1769C2988.55 1768.82 2988.55 1768.64 2988.58 1768.45L2993.07 1745.96ZM2991.72 1768.06L3017.7 1773.25L3021.72 1753.11L2995.74 1747.92L2991.72 1768.06ZM1613.79 1352.49C1614.62 1352.49 1615.29 1353.16 1615.29 1353.99V1391.49H1620.79C1621.62 1391.49 1622.29 1392.16 1622.29 1392.99C1622.29 1393.82 1621.62 1394.49 1620.79 1394.49H1613.79C1613.01 1394.49 1612.38 1393.9 1612.3 1393.14L1612.29 1392.99V1355.49H1566.29V1391.49H1600.79C1601.62 1391.49 1602.29 1392.16 1602.29 1392.99C1602.29 1393.82 1601.62 1394.49 1600.79 1394.49H1566.29V1634.49H1660.79C1660.84 1634.49 1660.89 1634.49 1660.94 1634.5C1661.7 1634.58 1662.29 1635.21 1662.29 1635.99V1758.99C1662.29 1759.82 1661.62 1760.49 1660.79 1760.49C1659.96 1760.49 1659.29 1759.82 1659.29 1758.99V1637.49H1566.29V1757.49H1647.79C1648.62 1757.49 1649.29 1758.16 1649.29 1758.99C1649.29 1759.82 1648.62 1760.49 1647.79 1760.49H1564.79C1564.74 1760.49 1564.69 1760.49 1564.64 1760.48C1563.93 1760.41 1563.37 1759.85 1563.3 1759.14L1563.29 1758.99V1353.99C1563.29 1353.16 1563.96 1352.49 1564.79 1352.49H1613.79ZM995.941 1147.5C996.698 1147.58 997.288 1148.21 997.288 1148.99V1752.99C997.288 1753.77 996.698 1754.41 995.941 1754.48L995.788 1754.49H933.788C932.96 1754.49 932.288 1753.82 932.288 1752.99C932.288 1752.16 932.959 1751.49 933.788 1751.49H994.288V1664.49H935.288V1743.99C935.288 1744.82 934.616 1745.49 933.788 1745.49C932.96 1745.49 932.288 1744.82 932.288 1743.99V1662.99C932.288 1662.16 932.959 1661.49 933.788 1661.49H994.288V1571.49H935.288V1651.99C935.288 1652.82 934.616 1653.49 933.788 1653.49C932.96 1653.49 932.288 1652.82 932.288 1651.99V1569.99C932.288 1569.16 932.959 1568.49 933.788 1568.49H994.288V1476.49H935.288V1557.99C935.288 1558.82 934.616 1559.49 933.788 1559.49C932.96 1559.49 932.288 1558.82 932.288 1557.99V1476.49H928.788C927.96 1476.49 927.288 1475.82 927.288 1474.99C927.288 1474.16 927.959 1473.49 928.788 1473.49H994.288V1385.49H935.288V1462.99C935.288 1463.82 934.616 1464.49 933.788 1464.49C932.96 1464.49 932.288 1463.82 932.288 1462.99V1383.99C932.288 1383.16 932.959 1382.49 933.788 1382.49H994.288V1293.49H935.288V1371.99C935.288 1372.82 934.616 1373.49 933.788 1373.49C932.96 1373.49 932.288 1372.82 932.288 1371.99V1297.49H927.788C926.96 1297.49 926.288 1296.82 926.288 1295.99C926.288 1295.16 926.959 1294.49 927.788 1294.49H932.288V1285.99C932.288 1285.16 932.959 1284.49 933.788 1284.49C934.616 1284.49 935.288 1285.16 935.288 1285.99V1290.49H994.288V1232.49H926.288V1274.49H933.788C934.616 1274.49 935.288 1275.16 935.288 1275.99C935.288 1276.82 934.616 1277.49 933.788 1277.49H924.788C924.011 1277.49 923.373 1276.9 923.296 1276.14L923.288 1275.99V1259.49H921.788C920.96 1259.49 920.288 1258.82 920.288 1257.99C920.288 1257.16 920.959 1256.49 921.788 1256.49H923.288V1230.99C923.288 1230.16 923.959 1229.49 924.788 1229.49H994.288V1150.49H973.788C972.96 1150.49 972.288 1149.82 972.288 1148.99C972.288 1148.16 972.959 1147.49 973.788 1147.49H995.788C995.84 1147.49 995.891 1147.49 995.941 1147.5ZM1082.79 1685.49C1083.62 1685.49 1084.29 1686.16 1084.29 1686.99V1752.99C1084.29 1753.77 1083.7 1754.41 1082.94 1754.48L1082.79 1754.49H1005.79L1005.79 1754.49L1005.79 1754.49C1004.96 1754.49 1004.29 1753.82 1004.29 1752.99V1714.99C1004.29 1714.21 1004.88 1713.58 1005.63 1713.5C1005.68 1713.49 1005.74 1713.49 1005.79 1713.49H1020.79C1021.62 1713.49 1022.29 1714.16 1022.29 1714.99C1022.29 1715.82 1021.62 1716.49 1020.79 1716.49H1007.29V1751.49H1081.29V1686.99C1081.29 1686.16 1081.96 1685.49 1082.79 1685.49ZM1165.79 1147.49C1166.62 1147.49 1167.29 1148.16 1167.29 1148.99V1751.49H1167.79C1168.62 1751.49 1169.29 1752.16 1169.29 1752.99C1169.29 1753.82 1168.62 1754.49 1167.79 1754.49H1105.79C1104.96 1754.49 1104.29 1753.82 1104.29 1752.99C1104.29 1752.16 1104.96 1751.49 1105.79 1751.49H1164.29V1669.49H1107.29V1740.99C1107.29 1741.82 1106.62 1742.49 1105.79 1742.49C1104.96 1742.49 1104.29 1741.82 1104.29 1740.99V1667.99C1104.29 1667.21 1104.88 1666.58 1105.64 1666.5C1105.69 1666.49 1105.74 1666.49 1105.79 1666.49H1164.29V1623.49H1107.29V1656.99C1107.29 1657.82 1106.62 1658.49 1105.79 1658.49C1104.96 1658.49 1104.29 1657.82 1104.29 1656.99V1621.99C1104.29 1621.21 1104.88 1620.58 1105.64 1620.5C1105.69 1620.49 1105.74 1620.49 1105.79 1620.49H1164.29V1571.49H1107.29V1606.99C1107.29 1607.82 1106.62 1608.49 1105.79 1608.49C1104.96 1608.49 1104.29 1607.82 1104.29 1606.99V1569.99C1104.29 1569.21 1104.88 1568.58 1105.64 1568.5C1105.69 1568.49 1105.74 1568.49 1105.79 1568.49H1164.29V1526.49H1107.29V1558.99C1107.29 1559.82 1106.62 1560.49 1105.79 1560.49C1104.96 1560.49 1104.29 1559.82 1104.29 1558.99V1524.99C1104.29 1524.21 1104.88 1523.58 1105.64 1523.5C1105.69 1523.49 1105.74 1523.49 1105.79 1523.49H1164.29V1479.49H1107.29V1511.99C1107.29 1512.82 1106.62 1513.49 1105.79 1513.49C1104.96 1513.49 1104.29 1512.82 1104.29 1511.99V1477.99C1104.29 1477.21 1104.88 1476.58 1105.64 1476.5C1105.69 1476.49 1105.74 1476.49 1105.79 1476.49H1164.29V1436.49H1107.29V1465.99C1107.29 1466.82 1106.62 1467.49 1105.79 1467.49C1104.96 1467.49 1104.29 1466.82 1104.29 1465.99V1434.99C1104.29 1434.21 1104.88 1433.58 1105.64 1433.5C1105.69 1433.49 1105.74 1433.49 1105.79 1433.49H1164.29V1390.49H1107.29V1413.99C1107.29 1414.82 1106.62 1415.49 1105.79 1415.49C1104.96 1415.49 1104.29 1414.82 1104.29 1413.99V1388.99C1104.29 1388.16 1104.96 1387.49 1105.79 1387.49H1164.29V1359.49H1107.29V1377.99C1107.29 1378.82 1106.62 1379.49 1105.79 1379.49C1104.96 1379.49 1104.29 1378.82 1104.29 1377.99V1357.99C1104.29 1357.16 1104.96 1356.49 1105.79 1356.49H1164.29V1297.49H1107.29V1342.99C1107.29 1343.82 1106.62 1344.49 1105.79 1344.49C1104.96 1344.49 1104.29 1343.82 1104.29 1342.99V1297.49H1101.79C1100.96 1297.49 1100.29 1296.82 1100.29 1295.99C1100.29 1295.16 1100.96 1294.49 1101.79 1294.49H1164.29V1150.49H1130.79C1129.96 1150.49 1129.29 1149.82 1129.29 1148.99C1129.29 1148.16 1129.96 1147.49 1130.79 1147.49H1165.79ZM1202.79 1147.49C1203.62 1147.49 1204.29 1148.16 1204.29 1148.99C1204.29 1149.82 1203.62 1150.49 1202.79 1150.49H1184.29V1308.49H1209.79C1210.62 1308.49 1211.29 1309.16 1211.29 1309.99C1211.29 1310.82 1210.62 1311.49 1209.79 1311.49H1184.29V1338.49H1196.79C1197.62 1338.49 1198.29 1339.16 1198.29 1339.99C1198.29 1340.82 1197.62 1341.49 1196.79 1341.49H1184.29V1356.49H1195.29V1345.99C1195.29 1345.16 1195.96 1344.49 1196.79 1344.49C1197.62 1344.49 1198.29 1345.16 1198.29 1345.99V1356.49H1247.29V1341.49H1208.79C1207.96 1341.49 1207.29 1340.82 1207.29 1339.99C1207.29 1339.16 1207.96 1338.49 1208.79 1338.49H1247.29V1323.99C1247.29 1323.16 1247.96 1322.49 1248.79 1322.49C1249.62 1322.49 1250.29 1323.16 1250.29 1323.99V1397.99C1250.29 1398.82 1249.62 1399.49 1248.79 1399.49C1247.96 1399.49 1247.29 1398.82 1247.29 1397.99V1359.49H1184.29V1416.49H1238.79C1239.62 1416.49 1240.29 1417.16 1240.29 1417.99C1240.29 1418.82 1239.62 1419.49 1238.79 1419.49H1184.29V1476.49H1246.79C1246.97 1476.49 1247.13 1476.52 1247.29 1476.58V1472.99C1247.29 1472.16 1247.96 1471.49 1248.79 1471.49C1249.62 1471.49 1250.29 1472.16 1250.29 1472.99V1511.99C1250.29 1512.82 1249.62 1513.49 1248.79 1513.49C1247.96 1513.49 1247.29 1512.82 1247.29 1511.99V1510.49H1186.29V1604.49H1247.29V1531.99C1247.29 1531.16 1247.96 1530.49 1248.79 1530.49C1249.62 1530.49 1250.29 1531.16 1250.29 1531.99V1613.99C1250.29 1614.82 1249.62 1615.49 1248.79 1615.49C1247.96 1615.49 1247.29 1614.82 1247.29 1613.99V1607.49H1186.29V1676.49H1247.29V1629.99C1247.29 1629.16 1247.96 1628.49 1248.79 1628.49C1249.62 1628.49 1250.29 1629.16 1250.29 1629.99V1688.99C1250.29 1689.82 1249.62 1690.49 1248.79 1690.49C1247.96 1690.49 1247.29 1689.82 1247.29 1688.99V1679.49H1186.29V1751.49H1247.29V1704.99C1247.29 1704.16 1247.96 1703.49 1248.79 1703.49C1249.62 1703.49 1250.29 1704.16 1250.29 1704.99V1752.99C1250.29 1753.77 1249.7 1754.41 1248.94 1754.48L1248.79 1754.49H1181.79C1180.96 1754.49 1180.29 1753.82 1180.29 1752.99C1180.29 1752.16 1180.96 1751.49 1181.79 1751.49H1183.29V1508.99C1183.29 1508.16 1183.96 1507.49 1184.79 1507.49H1247.29V1479.4C1247.13 1479.46 1246.97 1479.49 1246.79 1479.49H1182.79C1182.74 1479.49 1182.69 1479.49 1182.64 1479.48C1181.93 1479.41 1181.37 1478.85 1181.3 1478.14L1181.29 1477.99V1149.99C1181.29 1149.82 1181.32 1149.65 1181.38 1149.49C1181.32 1149.33 1181.29 1149.17 1181.29 1148.99C1181.29 1148.16 1181.96 1147.49 1182.79 1147.49H1202.79ZM1334.79 1147.49C1335.62 1147.49 1336.29 1148.16 1336.29 1148.99V1750.99C1336.29 1751.17 1336.26 1751.33 1336.2 1751.49H1357.29V1243.99C1357.29 1243.16 1357.96 1242.49 1358.79 1242.49H1401.29V1182.99C1401.29 1182.16 1401.96 1181.49 1402.79 1181.49H1429.29V1167.99C1429.29 1167.16 1429.96 1166.49 1430.79 1166.49C1431.62 1166.49 1432.29 1167.16 1432.29 1167.99V1181.99C1432.29 1182.17 1432.26 1182.33 1432.2 1182.49C1432.26 1182.65 1432.29 1182.82 1432.29 1182.99V1222.99C1432.29 1223.82 1431.62 1224.49 1430.79 1224.49C1429.96 1224.49 1429.29 1223.82 1429.29 1222.99V1184.49H1404.29V1242.49H1429.29V1236.99C1429.29 1236.16 1429.96 1235.49 1430.79 1235.49C1431.62 1235.49 1432.29 1236.16 1432.29 1236.99V1243.99L1432.28 1244.14C1432.21 1244.9 1431.57 1245.49 1430.79 1245.49H1360.29V1389.49H1430.79C1431.62 1389.49 1432.29 1390.16 1432.29 1390.99C1432.29 1391.17 1432.26 1391.33 1432.2 1391.49C1432.26 1391.65 1432.29 1391.82 1432.29 1391.99V1400.99C1432.29 1401.82 1431.62 1402.49 1430.79 1402.49C1429.96 1402.49 1429.29 1401.82 1429.29 1400.99V1392.49H1360.29V1415.49H1429.29V1411.99C1429.29 1411.16 1429.96 1410.49 1430.79 1410.49C1431.62 1410.49 1432.29 1411.16 1432.29 1411.99V1415.99C1432.29 1416.17 1432.26 1416.33 1432.2 1416.49C1432.26 1416.65 1432.29 1416.82 1432.29 1416.99C1432.29 1417.82 1431.62 1418.49 1430.79 1418.49H1360.29V1560.49H1429.38C1429.58 1559.91 1430.14 1559.49 1430.79 1559.49C1431.62 1559.49 1432.29 1560.16 1432.29 1560.99V1597.99C1432.29 1598.82 1431.62 1599.49 1430.79 1599.49C1429.96 1599.49 1429.29 1598.82 1429.29 1597.99V1563.49H1360.29V1612.58C1360.45 1612.52 1360.62 1612.49 1360.79 1612.49H1429.29V1607.99C1429.29 1607.16 1429.96 1606.49 1430.79 1606.49C1431.62 1606.49 1432.29 1607.16 1432.29 1607.99V1693.99C1432.29 1694.82 1431.62 1695.49 1430.79 1695.49C1429.96 1695.49 1429.29 1694.82 1429.29 1693.99V1615.49H1360.79C1360.62 1615.49 1360.45 1615.46 1360.29 1615.4V1702.49H1430.79C1431.62 1702.49 1432.29 1703.16 1432.29 1703.99V1752.99C1432.29 1753.82 1431.62 1754.49 1430.79 1754.49C1429.96 1754.49 1429.29 1753.82 1429.29 1752.99V1705.49H1360.29V1751.49H1417.79C1418.62 1751.49 1419.29 1752.16 1419.29 1752.99C1419.29 1753.82 1418.62 1754.49 1417.79 1754.49H1270.79C1269.96 1754.49 1269.29 1753.82 1269.29 1752.99C1269.29 1752.16 1269.96 1751.49 1270.79 1751.49H1333.38C1333.32 1751.33 1333.29 1751.17 1333.29 1750.99V1667.49H1273.29V1739.99C1273.29 1740.82 1272.62 1741.49 1271.79 1741.49C1270.96 1741.49 1270.29 1740.82 1270.29 1739.99V1665.99C1270.29 1665.16 1270.96 1664.49 1271.79 1664.49H1333.29V1569.49H1273.29V1653.99C1273.29 1654.82 1272.62 1655.49 1271.79 1655.49C1270.96 1655.49 1270.29 1654.82 1270.29 1653.99V1567.99C1270.29 1567.16 1270.96 1566.49 1271.79 1566.49C1271.97 1566.49 1272.13 1566.52 1272.29 1566.58C1272.45 1566.52 1272.62 1566.49 1272.79 1566.49H1333.29V1505.49H1273.29V1553.99C1273.29 1554.82 1272.62 1555.49 1271.79 1555.49C1270.96 1555.49 1270.29 1554.82 1270.29 1553.99V1485.99C1270.29 1485.16 1270.96 1484.49 1271.79 1484.49C1272.62 1484.49 1273.29 1485.16 1273.29 1485.99V1502.49H1333.29V1479.49H1271.79C1270.96 1479.49 1270.29 1478.82 1270.29 1477.99C1270.29 1477.16 1270.96 1476.49 1271.79 1476.49H1333.29V1389.49H1273.29V1464.99C1273.29 1465.82 1272.62 1466.49 1271.79 1466.49C1270.96 1466.49 1270.29 1465.82 1270.29 1464.99V1387.99C1270.29 1387.16 1270.96 1386.49 1271.79 1386.49H1333.29V1294.49H1273.29V1373.99C1273.29 1374.82 1272.62 1375.49 1271.79 1375.49C1270.96 1375.49 1270.29 1374.82 1270.29 1373.99V1294.49H1267.79C1266.96 1294.49 1266.29 1293.82 1266.29 1292.99C1266.29 1292.16 1266.96 1291.49 1267.79 1291.49H1333.29V1150.49H1313.79C1312.96 1150.49 1312.29 1149.82 1312.29 1148.99C1312.29 1148.16 1312.96 1147.49 1313.79 1147.49H1334.79ZM1707.79 1710.49C1708.62 1710.49 1709.29 1711.16 1709.29 1711.99V1746.99C1709.29 1747.82 1708.62 1748.49 1707.79 1748.49C1706.96 1748.49 1706.29 1747.82 1706.29 1746.99V1711.99C1706.29 1711.16 1706.96 1710.49 1707.79 1710.49ZM1876.79 1681.49C1877.62 1681.49 1878.29 1682.16 1878.29 1682.99V1742.99C1878.29 1743.77 1877.7 1744.41 1876.94 1744.48L1876.79 1744.49H1793.79C1792.96 1744.49 1792.29 1743.82 1792.29 1742.99C1792.29 1742.82 1792.32 1742.65 1792.38 1742.49C1792.32 1742.33 1792.29 1742.17 1792.29 1741.99V1722.99C1792.29 1722.16 1792.96 1721.49 1793.79 1721.49C1794.62 1721.49 1795.29 1722.16 1795.29 1722.99V1741.49H1875.29V1684.49H1795.29V1701.99C1795.29 1702.82 1794.62 1703.49 1793.79 1703.49C1792.96 1703.49 1792.29 1702.82 1792.29 1701.99V1682.99C1792.29 1682.21 1792.88 1681.58 1793.64 1681.5C1793.69 1681.49 1793.74 1681.49 1793.79 1681.49H1876.79ZM1054.79 1387.49C1055.62 1387.49 1056.29 1388.16 1056.29 1388.99C1056.29 1389.82 1055.62 1390.49 1054.79 1390.49H1051.29V1416.99C1051.29 1417.77 1050.7 1418.41 1049.94 1418.48L1049.79 1418.49H1022.29V1479.49H1081.29V1465.99C1081.29 1465.16 1081.96 1464.49 1082.79 1464.49C1083.62 1464.49 1084.29 1465.16 1084.29 1465.99V1480.99L1084.28 1481.14C1084.21 1481.9 1083.57 1482.49 1082.79 1482.49H1022.29V1604.49H1082.79C1082.84 1604.49 1082.89 1604.49 1082.94 1604.5C1083.7 1604.58 1084.29 1605.21 1084.29 1605.99V1663.99C1084.29 1664.82 1083.62 1665.49 1082.79 1665.49C1081.96 1665.49 1081.29 1664.82 1081.29 1663.99V1607.49H1022.29V1675.49H1082.79C1083.62 1675.49 1084.29 1676.16 1084.29 1676.99C1084.29 1677.82 1083.62 1678.49 1082.79 1678.49H1022.29V1706.99C1022.29 1707.82 1021.62 1708.49 1020.79 1708.49C1019.96 1708.49 1019.29 1707.82 1019.29 1706.99V1417.99C1019.29 1417.81 1019.32 1417.64 1019.38 1417.49C1019.32 1417.33 1019.29 1417.16 1019.29 1416.99C1019.29 1416.16 1019.96 1415.49 1020.79 1415.49H1048.29V1388.99C1048.29 1388.21 1048.88 1387.58 1049.64 1387.5C1049.69 1387.49 1049.74 1387.49 1049.79 1387.49H1054.79ZM1660.79 1391.49C1661.62 1391.49 1662.29 1392.16 1662.29 1392.99V1612.99C1662.29 1613.82 1661.62 1614.49 1660.79 1614.49C1659.96 1614.49 1659.29 1613.82 1659.29 1612.99V1394.49H1650.79C1649.96 1394.49 1649.29 1393.82 1649.29 1392.99C1649.29 1392.16 1649.96 1391.49 1650.79 1391.49H1660.79ZM1082.79 1542.49C1083.62 1542.49 1084.29 1543.16 1084.29 1543.99V1590.99C1084.29 1591.82 1083.62 1592.49 1082.79 1592.49C1081.96 1592.49 1081.29 1591.82 1081.29 1590.99V1543.99C1081.29 1543.16 1081.96 1542.49 1082.79 1542.49ZM1430.79 1425.49C1431.62 1425.49 1432.29 1426.16 1432.29 1426.99V1548.99C1432.29 1549.82 1431.62 1550.49 1430.79 1550.49C1429.96 1550.49 1429.29 1549.82 1429.29 1548.99V1426.99C1429.29 1426.16 1429.96 1425.49 1430.79 1425.49ZM1082.79 1493.49C1083.62 1493.49 1084.29 1494.16 1084.29 1494.99V1531.99C1084.29 1532.82 1083.62 1533.49 1082.79 1533.49C1081.96 1533.49 1081.29 1532.82 1081.29 1531.99V1494.99C1081.29 1494.16 1081.96 1493.49 1082.79 1493.49ZM1248.79 1405.49C1249.62 1405.49 1250.29 1406.16 1250.29 1406.99V1465.99C1250.29 1466.82 1249.62 1467.49 1248.79 1467.49C1247.96 1467.49 1247.29 1466.82 1247.29 1465.99V1406.99C1247.29 1406.16 1247.96 1405.49 1248.79 1405.49ZM1082.79 1412.49C1083.62 1412.49 1084.29 1413.16 1084.29 1413.99V1450.99C1084.29 1451.82 1083.62 1452.49 1082.79 1452.49C1081.96 1452.49 1081.29 1451.82 1081.29 1450.99V1413.99C1081.29 1413.16 1081.96 1412.49 1082.79 1412.49ZM1967.79 1389.49C1968.62 1389.49 1969.29 1390.16 1969.29 1390.99V1397.49H1970.79C1971.62 1397.49 1972.29 1398.16 1972.29 1398.99C1972.29 1399.82 1971.62 1400.49 1970.79 1400.49H1969.29V1439.99C1969.29 1440.82 1968.62 1441.49 1967.79 1441.49C1966.96 1441.49 1966.29 1440.82 1966.29 1439.99V1400.49H1964.79C1963.96 1400.49 1963.29 1399.82 1963.29 1398.99C1963.29 1398.16 1963.96 1397.49 1964.79 1397.49H1966.29V1390.99C1966.29 1390.16 1966.96 1389.49 1967.79 1389.49ZM1082.79 1324.49C1083.62 1324.49 1084.29 1325.16 1084.29 1325.99V1393.99C1084.29 1394.82 1083.62 1395.49 1082.79 1395.49C1081.96 1395.49 1081.29 1394.82 1081.29 1393.99V1390.49H1076.79C1075.96 1390.49 1075.29 1389.82 1075.29 1388.99C1075.29 1388.16 1075.96 1387.49 1076.79 1387.49H1081.29V1330.49H1077.79C1076.96 1330.49 1076.29 1329.82 1076.29 1328.99C1076.29 1328.16 1076.96 1327.49 1077.79 1327.49H1081.29V1325.99C1081.29 1325.16 1081.96 1324.49 1082.79 1324.49ZM1967.79 1333.49C1968.62 1333.49 1969.29 1334.16 1969.29 1334.99V1383.99C1969.29 1384.82 1968.62 1385.49 1967.79 1385.49C1966.96 1385.49 1966.29 1384.82 1966.29 1383.99V1334.99C1966.29 1334.16 1966.96 1333.49 1967.79 1333.49ZM1430.79 1255.49C1431.62 1255.49 1432.29 1256.16 1432.29 1256.99V1377.99C1432.29 1378.82 1431.62 1379.49 1430.79 1379.49C1429.96 1379.49 1429.29 1378.82 1429.29 1377.99V1256.99C1429.29 1256.16 1429.96 1255.49 1430.79 1255.49ZM1707.79 1315.49C1708.62 1315.49 1709.29 1316.16 1709.29 1316.99V1361.99C1709.29 1362.82 1708.62 1363.49 1707.79 1363.49C1706.96 1363.49 1706.29 1362.82 1706.29 1361.99V1316.99C1706.29 1316.16 1706.96 1315.49 1707.79 1315.49ZM1085.79 1294.49C1086.62 1294.49 1087.29 1295.16 1087.29 1295.99C1087.29 1296.82 1086.62 1297.49 1085.79 1297.49H1084.29V1316.99C1084.29 1317.82 1083.62 1318.49 1082.79 1318.49C1081.96 1318.49 1081.29 1317.82 1081.29 1316.99V1297.49H1051.29V1327.49H1054.79C1055.62 1327.49 1056.29 1328.16 1056.29 1328.99C1056.29 1329.82 1055.62 1330.49 1054.79 1330.49H1049.79C1049.01 1330.49 1048.38 1329.9 1048.3 1329.14L1048.29 1328.99V1295.99C1048.29 1295.16 1048.96 1294.49 1049.79 1294.49C1049.97 1294.49 1050.13 1294.52 1050.29 1294.58C1050.45 1294.52 1050.62 1294.49 1050.79 1294.49H1085.79ZM1967.79 1245.49C1968.62 1245.49 1969.29 1246.16 1969.29 1246.99V1311.99C1969.29 1312.82 1968.62 1313.49 1967.79 1313.49C1966.96 1313.49 1966.29 1312.82 1966.29 1311.99V1246.99C1966.29 1246.16 1966.96 1245.49 1967.79 1245.49ZM1268.79 1147.49C1269.62 1147.49 1270.29 1148.16 1270.29 1148.99C1270.29 1149.82 1269.62 1150.49 1268.79 1150.49H1250.29V1291.49H1255.79C1256.62 1291.49 1257.29 1292.16 1257.29 1292.99C1257.29 1293.82 1256.62 1294.49 1255.79 1294.49H1250.29V1309.99C1250.29 1310.77 1249.7 1311.41 1248.94 1311.48L1248.79 1311.49H1221.79C1220.96 1311.49 1220.29 1310.82 1220.29 1309.99C1220.29 1309.16 1220.96 1308.49 1221.79 1308.49H1247.29V1150.49H1228.79C1227.96 1150.49 1227.29 1149.82 1227.29 1148.99C1227.29 1148.16 1227.96 1147.49 1228.79 1147.49H1268.79ZM1100.79 1147.49C1101.62 1147.49 1102.29 1148.16 1102.29 1148.99C1102.29 1149.82 1101.62 1150.49 1100.79 1150.49H1023.29V1294.49H1026.79C1027.62 1294.49 1028.29 1295.16 1028.29 1295.99C1028.29 1296.82 1027.62 1297.49 1026.79 1297.49H1021.79L1021.79 1297.49L1021.79 1297.49C1020.96 1297.49 1020.29 1296.82 1020.29 1295.99V1148.99C1020.29 1148.16 1020.96 1147.49 1021.79 1147.49H1100.79ZM1997.79 1245.49C1998.62 1245.49 1999.29 1246.16 1999.29 1246.99C1999.29 1247.82 1998.62 1248.49 1997.79 1248.49H1988.29V1285.99C1988.29 1286.82 1987.62 1287.49 1986.79 1287.49C1985.96 1287.49 1985.29 1286.82 1985.29 1285.99V1246.99C1985.29 1246.16 1985.96 1245.49 1986.79 1245.49H1997.79ZM3369.88 981.914C3370.28 980.024 3372.14 978.819 3374.03 979.223C3375.92 979.627 3377.13 981.486 3376.72 983.376L3357.39 1073.86L3415.55 1085.8C3417.44 1086.19 3418.66 1088.04 3418.27 1089.93C3417.89 1091.82 3416.03 1093.04 3414.14 1092.66L3352.72 1080.05C3350.86 1079.67 3349.65 1077.88 3349.97 1076.02C3349.92 1075.64 3349.94 1075.23 3350.02 1074.83L3369.88 981.914ZM2636.68 112.293C2637.09 110.403 2638.95 109.198 2640.84 109.601C2642.73 110.005 2643.93 111.865 2643.53 113.755L2476.41 895.868L3244.93 1053.57L3263.88 964.914C3264.28 963.024 3266.14 961.819 3268.03 962.223C3269.92 962.627 3271.13 964.486 3270.72 966.376L3250.87 1059.29C3250.46 1061.18 3248.6 1062.39 3246.71 1061.98C3245.85 1061.8 3245.13 1061.31 3244.64 1060.65L2471.72 902.052C2469.88 901.674 2468.67 899.915 2468.97 898.077C2468.93 897.714 2468.94 897.339 2469.02 896.963L2636.68 112.293ZM1670.05 951.969C1670.19 951.153 1670.97 950.608 1671.79 950.751C1671.92 950.774 1672.04 950.816 1672.16 950.87C1672.43 950.751 1672.73 950.708 1673.04 950.766L1932.21 998.519C1933.02 998.67 1933.56 999.452 1933.41 1000.27C1933.26 1001.08 1932.48 1001.62 1931.66 1001.47L1672.78 953.767L1670.51 966.701C1670.36 967.517 1669.58 968.062 1668.77 967.919C1667.95 967.775 1667.41 966.998 1667.55 966.183L1670.05 951.969ZM1112.66 915.07C1112.82 914.257 1113.6 913.725 1114.42 913.883C1115.23 914.041 1115.76 914.827 1115.6 915.641L1103.74 976.871C1103.59 977.684 1102.8 978.216 1101.98 978.059C1101.77 978.017 1101.58 977.933 1101.41 977.817L1094.77 976.698C1093.95 976.561 1093.4 975.787 1093.54 974.971C1093.68 974.154 1094.45 973.603 1095.27 973.74L1101.1 974.722L1112.66 915.07ZM986.555 839.967C986.703 839.152 987.485 838.611 988.3 838.759L1010.73 842.828C1011.02 842.666 1011.37 842.6 1011.73 842.665C1012.54 842.814 1013.08 843.595 1012.93 844.41L992.755 954.99L998.084 955.888C998.9 956.025 999.451 956.799 999.313 957.616C999.176 958.433 998.402 958.984 997.586 958.847L990.767 957.698C989.98 957.566 989.442 956.843 989.526 956.06C989.529 955.994 989.535 955.926 989.548 955.858L1009.65 845.681L987.763 841.711C986.949 841.563 986.408 840.782 986.555 839.967ZM1124.16 863.425C1124.42 863.303 1124.73 863.257 1125.04 863.309L1139.2 865.693C1140.01 865.831 1140.57 866.604 1140.43 867.421C1140.29 868.238 1139.52 868.789 1138.7 868.651L1125.38 866.409L1118.94 900.196C1118.78 901.01 1117.99 901.544 1117.18 901.389C1116.37 901.233 1115.83 900.447 1115.99 899.634L1122.67 864.642C1122.81 863.917 1123.45 863.415 1124.16 863.425ZM2542.24 101.896C2542.65 100.006 2544.51 98.8011 2546.4 99.205C2548.29 99.6089 2549.49 101.469 2549.09 103.359L2382.87 881.292C2382.46 883.182 2380.6 884.387 2378.71 883.983C2378.19 883.871 2377.72 883.647 2377.32 883.342L265.719 450.052C263.825 449.663 262.606 447.813 262.994 445.92C263.382 444.026 265.232 442.806 267.126 443.194L2376.82 876.095L2542.24 101.896ZM951.551 833.968C951.696 833.152 952.474 832.609 953.29 832.754L970.927 835.887C971.742 836.032 972.286 836.81 972.141 837.626C971.996 838.442 971.218 838.986 970.402 838.841L952.764 835.707C951.949 835.562 951.406 834.783 951.551 833.968ZM2454.15 113.948C2454.31 113.137 2455.11 112.614 2455.92 112.78C2456.73 112.947 2457.25 113.739 2457.09 114.551L2310.53 828.777C2310.37 829.557 2309.63 830.068 2308.85 829.959C2308.54 830.147 2308.16 830.225 2307.78 830.146L1735.56 712.731C1734.75 712.565 1734.23 711.771 1734.4 710.96C1734.56 710.149 1735.36 709.627 1736.17 709.793L2307.81 827.092L2454.15 113.948ZM427.844 443.806C428.011 442.994 428.804 442.471 429.615 442.638L1637.44 690.478C1638.25 690.645 1638.77 691.438 1638.61 692.249C1638.44 693.06 1637.65 693.583 1636.84 693.417L429.012 445.577C428.201 445.411 427.678 444.617 427.844 443.806ZM1457.94 0.456941C1458.51 -0.131815 1459.44 -0.153315 1460.04 0.402253C1460.09 0.44235 1460.15 0.484629 1460.2 0.533113C1460.25 0.579806 1460.29 0.630328 1460.33 0.68155L1801.05 330.029C1801.59 330.548 1801.65 331.369 1801.24 331.963C1801.18 332.215 1801.06 332.455 1800.86 332.654L1704.92 431.914L1741.06 466.849C1741.65 467.424 1741.67 468.374 1741.09 468.97C1741 469.07 1740.89 469.152 1740.77 469.22L1734.49 475.72C1733.91 476.315 1732.96 476.332 1732.37 475.756C1731.77 475.18 1731.76 474.23 1732.33 473.635L1737.85 467.923L1702.11 433.372C1701.96 433.303 1701.82 433.21 1701.69 433.09C1701.1 432.514 1701.08 431.564 1701.66 430.969L1798.02 331.273L1459.18 3.74307L1228.42 242.471L1567.48 570.204L1686.65 446.911C1687.23 446.316 1688.18 446.3 1688.77 446.876C1689.37 447.452 1689.39 448.4 1688.81 448.996L1670.68 467.751L1684.85 481.453C1685.45 482.029 1685.47 482.979 1684.89 483.574C1684.31 484.17 1683.36 484.186 1682.77 483.61L1668.6 469.908L1634.8 504.869L1670.72 539.587L1704.64 504.49L1690.37 490.69C1689.77 490.115 1689.76 489.165 1690.33 488.569C1690.91 487.974 1691.86 487.958 1692.45 488.533L1706.73 502.333L1709.99 498.956C1710.57 498.36 1711.52 498.344 1712.12 498.92C1712.71 499.496 1712.73 500.445 1712.15 501.041L1672.29 542.28C1672.22 542.489 1672.11 542.687 1671.94 542.856C1671.77 543.033 1671.57 543.156 1671.35 543.23C1670.77 543.699 1669.92 543.674 1669.37 543.142C1669.05 542.836 1668.9 542.424 1668.91 542.016L1632.72 507.026L1569.49 572.437C1569.26 572.675 1568.97 572.818 1568.67 572.87C1568.61 572.99 1568.53 573.105 1568.43 573.208C1567.85 573.803 1566.9 573.82 1566.31 573.244L1225.37 243.69C1225.03 243.366 1224.88 242.923 1224.92 242.492C1224.89 242.085 1225.03 241.669 1225.33 241.352L1457.58 1.08682C1457.64 0.857566 1457.76 0.64035 1457.94 0.456941Z"
                    fill="none"
                    stroke={COLORS.paredes ?? "#111827"}
                    strokeWidth={1}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    style={{ pointerEvents: "none" }}
                  />
                  )}

                </g>
              </svg>
            </div>
            )}
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}


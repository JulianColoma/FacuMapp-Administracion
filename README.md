# FacuMapp - Administracion

Panel de administracion para el mapa interactivo de la Facultad de Ingenieria de la UTN La Plata. Permite gestionar espacios, eventos, actividades y usuarios del campus universitario.

## Stack Tecnologico

| Componente | Tecnologia |
|------------|------------|
| Frontend | React 19, Vite, Bootstrap 5, React Router DOM |
| Backend | Node.js, Express, JWT, Zod, Multer |
| Base de datos | MySQL 5.7 |
| Infraestructura | Docker Compose |

## Estructura del proyecto

```
FacuMapp-Administracion/
├── back/
│   ├── app.js                 # Punto de entrada del servidor Express
│   ├── config/database.js     # Conexion a MySQL
│   ├── controllers/           # Logica de negocio
│   ├── middleware/             # Middleware de autenticacion y usuario
│   ├── models/                # Modelos de datos
│   ├── routes/                # Rutas de la API
│   ├── schemas/               # Validaciones con Zod
│   ├── utils/                 # Utilidades
│   ├── dockerfile
│   └── package.json
├── front/
│   └── front-administracion/
│       ├── src/
│       │   ├── App.jsx        # Router principal y layout
│       │   ├── pages/         # Vistas: Home, Login, Espacios, Eventos, Usuarios
│       │   ├── components/    # Componentes reutilizables
│       │   ├── config.js      # Configuracion del frontend
│       │   └── utils/         # Utilidades
│       ├── dockerfile
│       └── package.json
├── docker-compose.yml         # Servicios: MySQL, Backend, Frontend
├── init.sql                   # Schema y datos iniciales de la base de datos
├── .env.example               # Plantilla de variables de entorno
└── uploads/                   # Directorio de imagenes subidas
```

## Requisitos previos

- [Docker](https://www.docker.com/) y Docker Compose
- O bien, Node.js v18+ y MySQL 5.7 si ejecutas sin Docker

## Instalacion y ejecucion

1. Clonar el repositorio:
```bash
git clone <url-del-repositorio>
cd FacuMapp-Administracion
```

2. Crear el archivo `.env` a partir del ejemplo:
```bash
cp .env.example .env
```

3. Completar las variables de entorno en `.env` con tus credenciales.

4. Levantar los servicios con Docker Compose:
```bash
docker-compose up --build
```

Los servicios quedaran disponibles en:

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:98 |
| Backend  | http://localhost:3000 |

## Endpoints principales

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/test` | Health check de la API |
| POST | `/login` | Inicio de sesion |
| GET | `/espacios` | Listar espacios |
| PUT | `/espacios/:id` | Editar espacio |
| GET | `/eventos` | Listar eventos |
| POST | `/eventos` | Crear evento |
| PUT | `/eventos/:id` | Editar evento |
| DELETE | `/eventos/:id` | Eliminar evento |
| GET | `/eventos/:id` | Detalle de evento con actividades |
| POST | `/eventos/:id/actividades` | Crear actividad |
| PUT | `/actividades/:id` | Editar actividad |
| DELETE | `/actividades/:id` | Eliminar actividad |
| GET | `/usuarios` | Listar usuarios (solo admin) |
| POST | `/usuarios` | Crear usuario (solo admin) |

## Base de datos

El esquema inicial (`init.sql`) crea las siguientes tablas:

- **espacio** - Espacios del campus (aulas, laboratorios, oficinas, etc.)
- **evento** - Eventos programados en la facultad
- **actividad** - Actividades dentro de cada evento
- **categoria** - Categorias para clasificar espacios (Civil, Mecanica, Sistemas, etc.)
- **categoriaxespacio** - Relacion many-to-many entre categorias y espacios
- **users** - Usuarios del sistema con flag de administrador


## Funcionalidades

- **Autenticacion JWT** con cookies y roles (admin / usuario comun)
- **CRUD completo** de espacios, eventos, actividades y usuarios
- **Gestion de imagenes** para espacios (almacenadas en `/uploads`)
- **Panel administrativo responsive** con sidebar colapsable en movil
- **Validaciones** con Zod en el backend
- **Control de acceso** - solo los administradores pueden gestionar usuarios

---

## Copyright

Todos los derechos reservados.

Copyright 2026 Julian Valentin Coloma Visconti, Tomas Rosato y Franco Arce.

Prohibida la reproduccion total o parcial de este codigo sin autorizacion explicita de los autores.

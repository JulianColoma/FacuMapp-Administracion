CREATE DATABASE IF NOT EXISTS mapa_interactivo;
USE mapa_interactivo;

-- Configurar codificación
SET NAMES 'utf8mb4';

-- ==========================================
-- 1. CREACIÓN DE TABLAS
-- ==========================================

CREATE TABLE IF NOT EXISTS espacio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    imagen TEXT,
    capacidad INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS evento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NOT NULL,
    id_espacio INT,
    FOREIGN KEY (id_espacio) REFERENCES espacio(id) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS actividad (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha DATETIME NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    id_espacio INT NOT NULL,
    id_evento INT NOT NULL,
    FOREIGN KEY (id_espacio) REFERENCES espacio(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_evento) REFERENCES evento(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS categoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    color VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS categoriaxespacio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_categoria INT NOT NULL,
    id_espacio INT NOT NULL,
    FOREIGN KEY (id_espacio) REFERENCES espacio(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_categoria) REFERENCES categoria(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    administrador BOOLEAN NOT NULL DEFAULT FALSE
);

-- ==========================================
-- 2. LIMPIEZA DE TABLAS
-- ==========================================
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE actividad;
TRUNCATE TABLE categoriaxespacio;
TRUNCATE TABLE espacio;
TRUNCATE TABLE evento;
TRUNCATE TABLE categoria;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================
-- 3. INSERCIÓN DE DATOS
-- ==========================================

-- 3.1. Insertar Espacios (Imágenes = id.jpg)
INSERT INTO espacio (id, nombre, descripcion, imagen, capacidad) VALUES
(1, 'Secretaria de Asuntos Universitatios', 'Oficina administrativa.', '1.jpg', 5),
(2, 'Secretaria de Asuntos Universitatios', 'Oficina administrativa.', '2.jpg', 5),
(3, 'Secretaria de asuntos universitarios', 'Oficina administrativa.', '3.jpg', 5),
(4, 'Cocina', 'Área de alimentación y descanso.', '4.jpg', 50),
(5, 'sala de sesiones del consejo academico', 'Espacio de la facultad.', '5.jpg', 0),
(6, 'Secretaria administrativa', 'Oficina administrativa.', '6.jpg', 5),
(7, 'Baño uso exclusivo personal', 'Instalaciones sanitarias.', '7.jpg', 4),
(8, 'Lactario', 'Espacio de la facultad.', '8.jpg', 0),
(9, 'Direccion de recursos humanos', 'Oficina administrativa.', '9.jpg', 5),
(10, 'Departamento de personal', 'Oficina administrativa.', '10.jpg', 5),
(11, 'Direccion de administracion - departamento de compras - patrimonio', 'Oficina administrativa.', '11.jpg', 5),
(12, 'Direccion de administracion - departamento contable - tesoreria', 'Oficina administrativa.', '12.jpg', 5),
(13, 'Despacho general - mesa de entrada - informes', 'Espacio de la facultad.', '13.jpg', 0),
(14, 'SECRETARIA ACADEMICA', 'Oficina administrativa.', '14.jpg', 5),
(15, 'direccion de servicios generales', 'Oficina administrativa.', '15.jpg', 5),
(16, 'Equpo interdisciplinario', 'Espacio de la facultad.', '16.jpg', 0),
(17, 'DASUTEN', 'Espacio de la facultad.', '17.jpg', 0),
(18, 'PECERA', 'Espacio de estudio y lectura.', '18.jpg', 30),
(19, 'ALUMNOS', 'Espacio de la facultad.', '19.jpg', 0),
(20, 'Adut', 'Espacio de la facultad.', '20.jpg', 0),
(22, 'Baños mixtos', 'Instalaciones sanitarias.', '22.jpg', 4),
(23, 'BUFFET', 'Área de alimentación y descanso.', '23.jpg', 50),
(24, 'Area tecnica de TIC - redes/servidores', 'Espacio de la facultad.', '24.jpg', 0),
(25, 'Area tecnica de TIC - Desarrollo / Ciberseguridad', 'Espacio de la facultad.', '25.jpg', 0),
(26, 'IEC - Investigacion en enseñanza de las ciencias', 'Espacio de la facultad.', '26.jpg', 0),
(27, 'SUM', 'Espacio para eventos y conferencias.', '27.jpg', 100),
(271, 'cocina', 'Área de alimentación y descanso.', '271.jpg', 50),
(28, 'Direccion Departamento Ciencias Basicas', 'Oficina administrativa.', '28.jpg', 5),
(29, 'Aula 61', 'Aula destinada al dictado de clases teóricas y prácticas.', '29.jpg', 40),
(30, 'Laboratorio IEC - Investigacion de Enseñanza de las Ciencias', 'Laboratorio equipado para prácticas e investigación.', '30.jpg', 20),
(31, 'Laboratorio Fisica', 'Laboratorio equipado para prácticas e investigación.', '31.jpg', 20),
(32, 'Aula 62', 'Aula destinada al dictado de clases teóricas y prácticas.', '32.jpg', 40),
(33, 'Aula 63', 'Aula destinada al dictado de clases teóricas y prácticas.', '33.jpg', 40),
(34, 'Laboratorio de fisica 3', 'Laboratorio equipado para prácticas e investigación.', '34.jpg', 20),
(35, 'Aula 64', 'Aula destinada al dictado de clases teóricas y prácticas.', '35.jpg', 40),
(36, 'aula 51', 'Aula destinada al dictado de clases teóricas y prácticas.', '36.jpg', 40),
(37, 'aula 52', 'Aula destinada al dictado de clases teóricas y prácticas.', '37.jpg', 40),
(38, 'aula 53', 'Aula destinada al dictado de clases teóricas y prácticas.', '38.jpg', 40),
(39, 'aula 101', 'Aula destinada al dictado de clases teóricas y prácticas.', '39.jpg', 40),
(40, 'aula 102', 'Aula destinada al dictado de clases teóricas y prácticas.', '40.jpg', 40),
(41, 'laboratorio sipe 1', 'Laboratorio equipado para prácticas e investigación.', '41.jpg', 20),
(412, 'aula 103 laboratorio sipe 2', 'Aula destinada al dictado de clases teóricas y prácticas.', '412.jpg', 40),
(42, 'aula 75 laboratorio lm', 'Aula destinada al dictado de clases teóricas y prácticas.', '42.jpg', 40),
(43, 'aula 74 laboratorio cim', 'Aula destinada al dictado de clases teóricas y prácticas.', '43.jpg', 40),
(44, 'archivo historico utn la plata aula  73', 'Aula destinada al dictado de clases teóricas y prácticas.', '44.jpg', 40),
(45, 'aula 72 area matematica', 'Aula destinada al dictado de clases teóricas y prácticas.', '45.jpg', 40),
(46, 'laboratorio de ingles aula 71', 'Aula destinada al dictado de clases teóricas y prácticas.', '46.jpg', 40),
(47, 'fotocopiadora', 'Espacio de la facultad.', '47.jpg', 0),
(48, 'aula 89', 'Aula destinada al dictado de clases teóricas y prácticas.', '48.jpg', 40),
(491, 'bedelia', 'Espacio de la facultad.', '491.jpg', 0),
(492, 'departamento de mecanica', 'Oficina administrativa.', '492.jpg', 5),
(50, 'aula 88', 'Aula destinada al dictado de clases teóricas y prácticas.', '50.jpg', 40),
(51, 'sala de profesores', 'Espacio de la facultad.', '51.jpg', 0),
(52, 'calidad del aire', 'Espacio de la facultad.', '52.jpg', 0),
(53, 'aula 87', 'Aula destinada al dictado de clases teóricas y prácticas.', '53.jpg', 40),
(54, 'aula 83 grupo de materiales granulados', 'Aula destinada al dictado de clases teóricas y prácticas.', '54.jpg', 40),
(55, 'aula 86', 'Aula destinada al dictado de clases teóricas y prácticas.', '55.jpg', 40),
(56, 'departamento', 'Oficina administrativa.', '56.jpg', 5),
(57, 'sala de automatizacion', 'Espacio de la facultad.', '57.jpg', 0),
(58, 'aula 85', 'Aula destinada al dictado de clases teóricas y prácticas.', '58.jpg', 40),
(59, 'metrologia', 'Espacio de la facultad.', '59.jpg', 0),
(60, 'grupo de materiales granulados', 'Espacio de la facultad.', '60.jpg', 0),
(601, 'oficina', 'Oficina administrativa.', '601.jpg', 5),
(61, 'laboratorio materiales tratamientos termicos', 'Laboratorio equipado para prácticas e investigación.', '61.jpg', 20),
(611, 'control numerico', 'Espacio de la facultad.', '611.jpg', 0),
(612, 'direccion', 'Oficina administrativa.', '612.jpg', 5),
(613, 'laboratorios de mecanica', 'Laboratorio equipado para prácticas e investigación.', '613.jpg', 20),
(62, 'cursos ypf', 'Espacio de la facultad.', '62.jpg', 0),
(63, 'no existe en el mapa', 'Espacio no definido o en desuso.', '63.jpg', 0),
(64, 'mantenimiento', 'Espacio de la facultad.', '64.jpg', 0),
(65, 'no existe en el mapa', 'Espacio no definido o en desuso.', '65.jpg', 0),
(66, 'aula 91', 'Aula destinada al dictado de clases teóricas y prácticas.', '66.jpg', 40),
(67, 'aula 92', 'Aula destinada al dictado de clases teóricas y prácticas.', '67.jpg', 40),
(68, 'biblioteca', 'Espacio de estudio y lectura.', '68.jpg', 30),
(69, 'CIAB', 'Espacio de la facultad.', '69.jpg', 0),
(70, 'laboratorio de ingenieria quimica', 'Laboratorio equipado para prácticas e investigación.', '70.jpg', 20),
(71, 'GIAB', 'Espacio de la facultad.', '71.jpg', 0),
(72, 'aula 103', 'Aula destinada al dictado de clases teóricas y prácticas.', '72.jpg', 40),
(73, 'aula 102', 'Aula destinada al dictado de clases teóricas y prácticas.', '73.jpg', 40),
(74, 'aula 101', 'Aula destinada al dictado de clases teóricas y prácticas.', '74.jpg', 40),
(75, 'departamento de saud', 'Oficina administrativa.', '75.jpg', 5),
(76, 'deposito de servicio', 'Espacio de la facultad.', '76.jpg', 0),
(77, 'no existe en el mapa', 'Espacio no definido o en desuso.', '77.jpg', 0),
(78, 'gabinete', 'Espacio de la facultad.', '78.jpg', 0),
(79, 'aula 113', 'Aula destinada al dictado de clases teóricas y prácticas.', '79.jpg', 40),
(80, 'aula 112', 'Aula destinada al dictado de clases teóricas y prácticas.', '80.jpg', 40),
(81, 'secretaria de posgrado', 'Oficina administrativa.', '81.jpg', 5),
(82, 'departamento de sistemas', 'Oficina administrativa.', '82.jpg', 5),
(83, 'aula 111', 'Aula destinada al dictado de clases teóricas y prácticas.', '83.jpg', 40),
(84, 'mecasur', 'Espacio de la facultad.', '84.jpg', 0),
(85, 'mecasur', 'Espacio de la facultad.', '85.jpg', 0),
(86, 'sala de profesores', 'Espacio de la facultad.', '86.jpg', 0),
(87, 'sui', 'Espacio de la facultad.', '87.jpg', 0),
(88, 'tic - soporte tecnico com centro operativo de monitoreo', 'Espacio de la facultad.', '88.jpg', 0),
(89, 'laboratorio de microbiologia y biotecnologia', 'Laboratorio equipado para prácticas e investigación.', '89.jpg', 20),
(90, 'direccion de acreditacion concurso carrera academica acreditacion academica', 'Oficina administrativa.', '90.jpg', 5),
(91, 'ecaass estudio de calidad de aguas aire suelos y sedimentos', 'Espacio de la facultad.', '91.jpg', 0),
(92, 'matemaTICa', 'Espacio de la facultad.', '92.jpg', 0),
(93, 'subsecretaria de posgrado', 'Oficina administrativa.', '93.jpg', 5),
(94, 'aula 42', 'Aula destinada al dictado de clases teóricas y prácticas.', '94.jpg', 40),
(95, 'administración computación', 'Espacio de la facultad.', '95.jpg', 0),
(96, 'laboratorio de química', 'Laboratorio equipado para prácticas e investigación.', '96.jpg', 20),
(97, 'gabinete de computación', 'Espacio de la facultad.', '97.jpg', 0),
(98, 'cultura prensa y difusión', 'Espacio de la facultad.', '98.jpg', 0),
(99, 'laboratorio de quimica', 'Laboratorio equipado para prácticas e investigación.', '99.jpg', 20),
(100, 'intendencia', 'Espacio de la facultad.', '100.jpg', 0),
(101, 'auditorio de quimica', 'Espacio para eventos y conferencias.', '101.jpg', 100),
(102, 'aula 31a', 'Aula destinada al dictado de clases teóricas y prácticas.', '102.jpg', 40),
(103, 'aula 32', 'Aula destinada al dictado de clases teóricas y prácticas.', '103.jpg', 40),
(104, 'aula 31b', 'Aula destinada al dictado de clases teóricas y prácticas.', '104.jpg', 40),
(105, 'TSSE tratamiento de señales en sistemas electricos', 'Espacio de la facultad.', '105.jpg', 0),
(106, 'Laboratorio de Máquinas y Accionamientos Eléctricos', 'Laboratorio equipado para prácticas e investigación.', '106.jpg', 20),
(107, 'direccion departamento de ingenieria electrica', 'Oficina administrativa.', '107.jpg', 5),
(108, 'sala de reuniones', 'Espacio de la facultad.', '108.jpg', 0),
(109, 'laboratorio de electronica', 'Laboratorio equipado para prácticas e investigación.', '109.jpg', 20),
(110, 'sala de estudio', 'Espacio de estudio y lectura.', '110.jpg', 30),
(111, 'aula 35', 'Aula destinada al dictado de clases teóricas y prácticas.', '111.jpg', 40),
(112, 'Depósito de instrumentos / Laboratorio de Mediciones Eléctrica - Laboratorio Electrotécnica / Laboratorio de Sistemas Eléctricos de Potencia', 'Laboratorio equipado para prácticas e investigación.', '112.jpg', 20),
(1121, 'Depósito de servicio', 'Espacio de la facultad.', '1121.jpg', 0),
(113, 'Laboratorio de Maniobras y Ensayos', 'Laboratorio equipado para prácticas e investigación.', '113.jpg', 20),
(114, 'Laboratorio de Eficiencia Energética Aplicada', 'Laboratorio equipado para prácticas e investigación.', '114.jpg', 20),
(115, 'aula 21', 'Aula destinada al dictado de clases teóricas y prácticas.', '115.jpg', 40),
(116, 'departamento de ingenieria civil - sala del consejo sala de profesores', 'Oficina administrativa.', '116.jpg', 5),
(117, 'no existe en el mapa', 'Espacio no definido o en desuso.', '117.jpg', 0),
(118, 'oficina', 'Oficina administrativa.', '118.jpg', 5),
(119, 'gabinete de computadoras', 'Espacio de la facultad.', '119.jpg', 0),
(120, 'oficina', 'Oficina administrativa.', '120.jpg', 5),
(121, 'aula de tecnología', 'Aula destinada al dictado de clases teóricas y prácticas.', '121.jpg', 40),
(122, 'aula 23', 'Aula destinada al dictado de clases teóricas y prácticas.', '122.jpg', 40),
(123, 'aula 24', 'Aula destinada al dictado de clases teóricas y prácticas.', '123.jpg', 40),
(124, 'aula de tecnología', 'Aula destinada al dictado de clases teóricas y prácticas.', '124.jpg', 40),
(125, 'aula 25', 'Aula destinada al dictado de clases teóricas y prácticas.', '125.jpg', 40),
(126, 'lemac', 'Espacio de la facultad.', '126.jpg', 0),
(133, 'aula', 'Aula destinada al dictado de clases teóricas y prácticas.', '133.jpg', 40),
(134, 'aula 12', 'Aula destinada al dictado de clases teóricas y prácticas.', '134.jpg', 40),
(135, 'aula 14', 'Aula destinada al dictado de clases teóricas y prácticas.', '135.jpg', 40),
(136, 'direccion CITEMA', 'Oficina administrativa.', '136.jpg', 5),
(137, 'laboratorio de analisis espectofotometricos y microscopia', 'Laboratorio equipado para prácticas e investigación.', '137.jpg', 20),
(138, 'laboratorio tecnologia aplicada 1 laboratorio general y cromatografia', 'Laboratorio equipado para prácticas e investigación.', '138.jpg', 20),
(139, 'polideportivo', 'Área deportiva.', '139.jpg', 200),
(140, 'bicicetero', 'Espacio exterior.', '140.jpg', 0),
(141, 'paseo de las ingenierias', 'Espacio exterior.', '141.jpg', 0),
(142, 'parada de colectivo', 'Espacio exterior.', '142.jpg', 0);

-- 3.2. Insertar Categorías
INSERT INTO categoria (nombre, color) VALUES 
('Tecnología', '#3498db'), -- Azul
('Arte y Cultura', '#e74c3c'), -- Rojo
('Aire Libre', '#2ecc71'), -- Verde
('Networking', '#f1c40f'); -- Amarillo

-- 3.3. Insertar Usuarios
INSERT INTO users (nombre, contrasena, administrador) VALUES 
('juan_perez', '$2b$10$V1DqRLVQjaxAg/P070MqUudYb1mc5QwDFiMNUETfPvPVt3HoPQXxK', FALSE),
('maria_gomez', '$2b$10$V1DqRLVQjaxAg/P070MqUudYb1mc5QwDFiMNUETfPvPVt3HoPQXxK', FALSE),
('super_admin', '$2b$10$V1DqRLVQjaxAg/P070MqUudYb1mc5QwDFiMNUETfPvPVt3HoPQXxK', TRUE),
('admin', '$2b$10$V1DqRLVQjaxAg/P070MqUudYb1mc5QwDFiMNUETfPvPVt3HoPQXxK', TRUE);

-- 3.4. Insertar Eventos (Con IDs de espacio actualizados)
INSERT INTO evento (nombre, descripcion, fecha_inicio, fecha_fin, id_espacio) VALUES 
('Semana de la Innovación', 'Evento anual sobre nuevas tecnologías y startups.', '2025-10-10 09:00:00', '2025-10-15 18:00:00', 27), -- SUM
('Festival de Otoño', 'Celebración cultural y artística.', '2025-11-05 10:00:00', '2025-11-07 22:00:00', 141), -- Paseo
('Hackathon 2026', 'Competición de programación de 48 horas.', '2026-12-01 18:00:00', '2026-12-03 18:00:00', 27); -- SUM

-- 3.5. Insertar Categoría x Espacio
INSERT INTO categoriaxespacio (id_categoria, id_espacio) VALUES 
(1, 24), -- TIC -> Tecnología
(1, 30), -- Lab IEC -> Tecnología
(3, 139), -- Polideportivo -> Aire Libre
(3, 141), -- Paseo -> Aire Libre
(4, 23); -- Buffet -> Networking

-- 3.6. Insertar Actividades (Con IDs de espacio actualizados)
INSERT INTO actividad (nombre, descripcion, fecha, hora_inicio, hora_fin, id_espacio, id_evento) VALUES 
('Conferencia de Apertura', 'Charla sobre el futuro de la IA.', '2025-10-10', '09:00:00', '11:00:00', 27, 1), -- SUM
('Taller de Python', 'Introducción a la ciencia de datos.', '2025-10-11', '14:00:00', '16:00:00', 30, 1), -- Lab IEC
('Concierto al Atardecer', 'Música en vivo para cerrar el día.', '2025-11-05', '19:00:00', '21:00:00', 141, 2), -- Paseo
('Inicio del Hackathon', 'Formación de equipos y anuncio del reto.', '2026-12-01', '18:00:00', '20:00:00', 27, 3), -- SUM
('Mentoria de Proyectos', 'Sesión de ayuda con expertos.', '2026-12-02', '10:00:00', '12:00:00', 29, 3); -- Aula 61
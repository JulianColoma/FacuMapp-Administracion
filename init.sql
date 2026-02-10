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

-- 3.1. Insertar Espacios (Imágenes = id.webp)
INSERT INTO espacio (id, nombre, descripcion, imagen, capacidad) VALUES
(1, 'Secretaria de Asuntos Universitatios', 'Oficina administrativa.', '1.webp', 5),
(4, 'Cocina', 'Área de alimentación y descanso.', '4.webp', 50),
(5, 'sala de sesiones del consejo academico', 'Espacio de la facultad.', '5.webp', 0),
(6, 'Secretaria administrativa', 'Oficina administrativa.', '6.webp', 5),
(7, 'Baño uso exclusivo personal', 'Instalaciones sanitarias.', '7.webp', 4),
(8, 'Lactario', 'Espacio de la facultad.', '8.webp', 0),
(9, 'Direccion de recursos humanos', 'Oficina administrativa.', '9.webp', 5),
(10, 'Departamento de personal', 'Oficina administrativa.', '10.webp', 5),
(11, 'Direccion de administracion - departamento de compras - patrimonio', 'Oficina administrativa.', '11.webp', 5),
(12, 'Direccion de administracion - departamento contable - tesoreria', 'Oficina administrativa.', '12.webp', 5),
(13, 'Despacho general - mesa de entrada - informes', 'Espacio de la facultad.', '13.webp', 0),
(14, 'SECRETARIA ACADEMICA', 'Oficina administrativa.', '14.webp', 5),
(15, 'direccion de servicios generales', 'Oficina administrativa.', '15.webp', 5),
(16, 'Equpo interdisciplinario', 'Espacio de la facultad.', '16.webp', 0),
(17, 'DASUTEN', 'Espacio de la facultad.', '17.webp', 0),
(18, 'PECERA', 'Espacio de estudio y lectura.', '18.webp', 30),
(19, 'ALUMNOS', 'Espacio de la facultad.', '19.webp', 0),
(20, 'Adut', 'Espacio de la facultad.', '20.webp', 0),
(23, 'BUFFET', 'Área de alimentación y descanso.', '23.webp', 50),
(24, 'Area tecnica de TIC - redes/servidores', 'Espacio de la facultad.', '24.webp', 0),
(25, 'Area tecnica de TIC - Desarrollo / Ciberseguridad', 'Espacio de la facultad.', '25.webp', 0),
(26, 'IEC - Investigacion en enseñanza de las ciencias', 'Espacio de la facultad.', '26.webp', 0),
(27, 'SUM', 'Espacio para eventos y conferencias.', '27.webp', 100),
(271, 'cocina', 'Área de alimentación y descanso.', '271.webp', 50),
(28, 'Direccion Departamento Ciencias Basicas', 'Oficina administrativa.', '28.webp', 5),
(29, 'Aula 61', 'Aula destinada al dictado de clases teóricas y prácticas.', '29.webp', 40),
(30, 'Laboratorio IEC - Investigacion de Enseñanza de las Ciencias', 'Laboratorio equipado para prácticas e investigación.', '30.webp', 20),
(31, 'Laboratorio Fisica', 'Laboratorio equipado para prácticas e investigación.', '31.webp', 20),
(32, 'Aula 62', 'Aula destinada al dictado de clases teóricas y prácticas.', '32.webp', 40),
(33, 'Aula 63', 'Aula destinada al dictado de clases teóricas y prácticas.', '33.webp', 40),
(34, 'Laboratorio de fisica 3', 'Laboratorio equipado para prácticas e investigación.', '34.webp', 20),
(35, 'Aula 64', 'Aula destinada al dictado de clases teóricas y prácticas.', '35.webp', 40),
(36, 'aula 51', 'Aula destinada al dictado de clases teóricas y prácticas.', '36.webp', 40),
(37, 'aula 52', 'Aula destinada al dictado de clases teóricas y prácticas.', '37.webp', 40),
(38, 'aula 53', 'Aula destinada al dictado de clases teóricas y prácticas.', '38.webp', 40),
(39, 'aula 101', 'Aula destinada al dictado de clases teóricas y prácticas.', '39.webp', 40),
(40, 'aula 102', 'Aula destinada al dictado de clases teóricas y prácticas.', '40.webp', 40),
(41, 'laboratorio sipe 1', 'Laboratorio equipado para prácticas e investigación.', '41.webp', 20),
(412, 'aula 103 laboratorio sipe 2', 'Aula destinada al dictado de clases teóricas y prácticas.', '412.webp', 40),
(42, 'aula 75 laboratorio lm', 'Aula destinada al dictado de clases teóricas y prácticas.', '42.webp', 40),
(43, 'aula 74 laboratorio cim', 'Aula destinada al dictado de clases teóricas y prácticas.', '43.webp', 40),
(44, 'archivo historico utn la plata aula  73', 'Aula destinada al dictado de clases teóricas y prácticas.', '44.webp', 40),
(45, 'aula 72 area matematica', 'Aula destinada al dictado de clases teóricas y prácticas.', '45.webp', 40),
(46, 'laboratorio de ingles aula 71', 'Aula destinada al dictado de clases teóricas y prácticas.', '46.webp', 40),
(47, 'fotocopiadora', 'Espacio de la facultad.', '47.webp', 0),
(48, 'aula 89', 'Aula destinada al dictado de clases teóricas y prácticas.', '48.webp', 40),
(491, 'bedelia', 'Espacio de la facultad.', '491.webp', 0),
(492, 'departamento de mecanica', 'Oficina administrativa.', '492.webp', 5),
(50, 'aula 88', 'Aula destinada al dictado de clases teóricas y prácticas.', '50.webp', 40),
(51, 'sala de profesores', 'Espacio de la facultad.', '51.webp', 0),
(52, 'calidad del aire', 'Espacio de la facultad.', '52.webp', 0),
(53, 'aula 87', 'Aula destinada al dictado de clases teóricas y prácticas.', '53.webp', 40),
(54, 'aula 83 grupo de materiales granulados', 'Aula destinada al dictado de clases teóricas y prácticas.', '54.webp', 40),
(55, 'aula 86', 'Aula destinada al dictado de clases teóricas y prácticas.', '55.webp', 40),
(56, 'departamento', 'Oficina administrativa.', '56.webp', 5),
(57, 'sala de automatizacion', 'Espacio de la facultad.', '57.webp', 0),
(58, 'aula 85', 'Aula destinada al dictado de clases teóricas y prácticas.', '58.webp', 40),
(59, 'metrologia', 'Espacio de la facultad.', '59.webp', 0),
(60, 'grupo de materiales granulados', 'Espacio de la facultad.', '60.webp', 0),
(61, 'laboratorio materiales tratamientos termicos', 'Laboratorio equipado para prácticas e investigación.', '61.webp', 20),
(611, 'control numerico', 'Espacio de la facultad.', '611.webp', 0),
(612, 'direccion', 'Oficina administrativa.', '612.webp', 5),
(613, 'laboratorios de mecanica', 'Laboratorio equipado para prácticas e investigación.', '613.webp', 20),
(62, 'cursos ypf', 'Espacio de la facultad.', '62.webp', 0),

(64, 'mantenimiento', 'Espacio de la facultad.', '64.webp', 0),

(66, 'aula 91', 'Aula destinada al dictado de clases teóricas y prácticas.', '66.webp', 40),
(67, 'aula 92', 'Aula destinada al dictado de clases teóricas y prácticas.', '67.webp', 40),
(68, 'biblioteca', 'Espacio de estudio y lectura.', '68.webp', 30),
(69, 'CIAB', 'Espacio de la facultad.', '69.webp', 0),
(70, 'laboratorio de ingenieria quimica', 'Laboratorio equipado para prácticas e investigación.', '70.webp', 20),
(71, 'GIAB', 'Espacio de la facultad.', '71.webp', 0),
(72, 'aula 103', 'Aula destinada al dictado de clases teóricas y prácticas.', '72.webp', 40),
(73, 'aula 102', 'Aula destinada al dictado de clases teóricas y prácticas.', '73.webp', 40),
(74, 'aula 101', 'Aula destinada al dictado de clases teóricas y prácticas.', '74.webp', 40),
(75, 'departamento de salud', 'Oficina administrativa.', '75.webp', 5),

(78, 'gabinete', 'Espacio de la facultad.', '78.webp', 0),
(79, 'aula 113', 'Aula destinada al dictado de clases teóricas y prácticas.', '79.webp', 40),
(80, 'aula 112', 'Aula destinada al dictado de clases teóricas y prácticas.', '80.webp', 40),
(81, 'secretaria de posgrado', 'Oficina administrativa.', '81.webp', 5),
(82, 'departamento de sistemas', 'Oficina administrativa.', '82.webp', 5),
(83, 'aula 111', 'Aula destinada al dictado de clases teóricas y prácticas.', '83.webp', 40),
(84, 'mecasur', 'Espacio de la facultad.', '84.webp', 0),
(85, 'mecasur', 'Espacio de la facultad.', '85.webp', 0),
(86, 'sala de profesores', 'Espacio de la facultad.', '86.webp', 0),
(87, 'sui', 'Espacio de la facultad.', '87.webp', 0),
(88, 'tic - soporte tecnico com centro operativo de monitoreo', 'Espacio de la facultad.', '88.webp', 0),
(89, 'laboratorio de microbiologia y biotecnologia', 'Laboratorio equipado para prácticas e investigación.', '89.webp', 20),
(90, 'direccion de acreditacion concurso carrera academica acreditacion academica', 'Oficina administrativa.', '90.webp', 5),
(91, 'ecaass estudio de calidad de aguas aire suelos y sedimentos', 'Espacio de la facultad.', '91.webp', 0),
(92, 'matemaTICa', 'Espacio de la facultad.', '92.webp', 0),
(93, 'subsecretaria de posgrado', 'Oficina administrativa.', '93.webp', 5),
(94, 'aula 42', 'Aula destinada al dictado de clases teóricas y prácticas.', '94.webp', 40),
(95, 'administración computación', 'Espacio de la facultad.', '95.webp', 0),
(96, 'laboratorio de química', 'Laboratorio equipado para prácticas e investigación.', '96.webp', 20),
(97, 'gabinete de computación', 'Espacio de la facultad.', '97.webp', 0),
(98, 'cultura prensa y difusión', 'Espacio de la facultad.', '98.webp', 0),
(99, 'laboratorio de quimica', 'Laboratorio equipado para prácticas e investigación.', '99.webp', 20),
(100, 'intendencia', 'Espacio de la facultad.', '100.webp', 0),
(101, 'auditorio de quimica', 'Espacio para eventos y conferencias.', '101.webp', 100),
(102, 'aula 31a', 'Aula destinada al dictado de clases teóricas y prácticas.', '102.webp', 40),
(103, 'aula 32', 'Aula destinada al dictado de clases teóricas y prácticas.', '103.webp', 40),
(104, 'aula 31b', 'Aula destinada al dictado de clases teóricas y prácticas.', '104.webp', 40),
(105, 'TSSE tratamiento de señales en sistemas electricos', 'Espacio de la facultad.', '105.webp', 0),
(106, 'Laboratorio de Máquinas y Accionamientos Eléctricos', 'Laboratorio equipado para prácticas e investigación.', '106.webp', 20),
(107, 'direccion departamento de ingenieria electrica', 'Oficina administrativa.', '107.webp', 5),
(108, 'sala de reuniones', 'Espacio de la facultad.', '108.webp', 0),
(109, 'laboratorio de electronica', 'Laboratorio equipado para prácticas e investigación.', '109.webp', 20),
(110, 'sala de estudio', 'Espacio de estudio y lectura.', '110.webp', 30),
(111, 'aula 35', 'Aula destinada al dictado de clases teóricas y prácticas.', '111.webp', 40),
(112, 'Depósito de instrumentos / Laboratorio de Mediciones Eléctrica - Laboratorio Electrotécnica / Laboratorio de Sistemas Eléctricos de Potencia', 'Laboratorio equipado para prácticas e investigación.', '112.webp', 20),
(1121, 'Depósito de servicio', 'Espacio de la facultad.', '1121.webp', 0),
(113, 'Laboratorio de Maniobras y Ensayos', 'Laboratorio equipado para prácticas e investigación.', '113.webp', 20),
(114, 'Laboratorio de Eficiencia Energética Aplicada', 'Laboratorio equipado para prácticas e investigación.', '114.webp', 20),
(115, 'aula 21', 'Aula destinada al dictado de clases teóricas y prácticas.', '115.webp', 40),
(116, 'departamento de ingenieria civil - sala del consejo sala de profesores', 'Oficina administrativa.', '116.webp', 5),

(118, 'oficina', 'Oficina administrativa.', '118.webp', 5),
(119, 'gabinete de computadoras', 'Espacio de la facultad.', '119.webp', 0),
(120, 'oficina', 'Oficina administrativa.', '120.webp', 5),
(121, 'aula de tecnología', 'Aula destinada al dictado de clases teóricas y prácticas.', '121.webp', 40),
(122, 'aula 23', 'Aula destinada al dictado de clases teóricas y prácticas.', '122.webp', 40),
(123, 'aula 24', 'Aula destinada al dictado de clases teóricas y prácticas.', '123.webp', 40),
(125, 'aula 25', 'Aula destinada al dictado de clases teóricas y prácticas.', '125.webp', 40),
(126, 'lemac', 'Espacio de la facultad.', '126.webp', 0),

(133, 'aula', 'Aula destinada al dictado de clases teóricas y prácticas.', '133.webp', 40),
(134, 'aula 12', 'Aula destinada al dictado de clases teóricas y prácticas.', '134.webp', 40),
(135, 'aula 14', 'Aula destinada al dictado de clases teóricas y prácticas.', '135.webp', 40),
(136, 'direccion CITEMA', 'Oficina administrativa.', '136.webp', 5),
(137, 'laboratorio de analisis espectofotometricos y microscopia', 'Laboratorio equipado para prácticas e investigación.', '137.webp', 20),
(138, 'laboratorio tecnologia aplicada', 'Laboratorio equipado para prácticas e investigación.', '138.webp', 20),
(1381, 'laboratorio general y cromatografía', 'Laboratorio equipado para prácticas e investigación.', '1381.webp', 20),
(139, 'polideportivo', 'Área deportiva.', '139.webp', 200),
(140, 'bicicetero', 'Espacio exterior.', '140.webp', 0),
(141, 'paseo de las ingenierias', 'Espacio exterior.', '141.webp', 0),
(142, 'parada de colectivo', 'Espacio exterior.', '142.webp', 0),

(1111, 'Baño', 'Instalaciones sanitarias.', '1111.webp', 2),
(1112, 'Baño', 'Instalaciones sanitarias.', '1112.webp', 4),
(1113, 'Baño', 'Instalaciones sanitarias.', '1113.webp', 4),
(1114, 'Baño', 'Instalaciones sanitarias.', '1114.webp', 4),
(1115, 'Baño', 'Instalaciones sanitarias.', '1115.webp', 4),
(1116, 'Baño', 'Instalaciones sanitarias.', '1116.webp', 4),

(44443, 'Entrada Principal', 'Acceso principal a la facultad.', '44443.webp', 0);

-- 3.2. Insertar Categorías
INSERT INTO categoria (nombre, color) VALUES 
-- Especialidades de la Facultad (Prioritarias)
('Civil', '#0e8341'), -- 1
('Mecánica', '#267e7c'), -- 2
('Química', '#926d29'), -- 3
('Básicas', '#8b181b'), -- 4
('Industrial', '#c05029'), -- 5
('Sistemas', '#4579b0'), -- 6
('Eléctrica', '#cc3e45'), -- 7

-- Espacios Académicos y de Estudio
('Aulas', '#6610f2'), -- 8
('Laboratorios e Investigación', '#6f42c1'), -- 9
('Estudio y Lectura', '#20c997'), -- 10

-- Administrativo y Gestión
('Oficinas y Administración', '#495057'), -- 11

-- Servicios e Instalaciones
('Baños y Sanitarios', '#0dcaf0'), -- 12
('Alimentación y Descanso', '#fd7e14'), -- 13
('Servicios al Estudiante', '#ffc107'), -- 14

-- Otros espacios
('Auditorios y Eventos', '#d63384'), -- 15
('Deportes y Exteriores', '#7cb342'); -- 16



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

-- =======================================================
-- 1. ASIGNACIÓN POR DEPARTAMENTOS 
-- =======================================================

-- BASICAS (ID 4) 
(4, 24), (4, 25), (4, 26), (4, 28), (4, 29), (4, 30), (4, 31), (4, 32), (4, 33), (4, 34), (4, 35),

-- INDUSTRIAL (ID 5) 
(5, 36), (5, 37), (5, 38), (5, 39), (5, 40), (5, 41), (5, 412), (5, 42), (5, 43), (5, 44), (5, 45), (5, 46),

-- MECANICA (ID 2)
(2, 491), (2, 492), (2, 50), (2, 51), (2, 52), (2, 53), (2, 54), (2, 55), (2, 56), (2, 57), (2, 58), (2, 59), (2, 60), (2, 61), (2, 611), (2, 612), (2, 613), (2, 62), (2, 64),

-- QUIMICA (ID 3)
(3, 66), (3, 67), (3, 69), (3, 70), (3, 71), (3, 72), (3, 73), (3, 74),
-- laboratorios de química 
(3, 89), (3, 96), (3, 99), (3, 101),

-- SISTEMAS (ID 6) 
(6, 75), (6, 78), (6, 79), (6, 80), (6, 81), (6, 82), (6, 83), (6, 84), (6, 85),


-- ELECTRICA (ID 7) -> Rango 102-114
(7, 102), (7, 103), (7, 104), (7, 105), (7, 106), (7, 107), (7, 108), (7, 109), (7, 110), (7, 111), (7, 112), (7, 1121), (7, 113), (7, 114),

-- CIVIL (ID 1) -> Rango 115-1381
(1, 115), (1, 116), (1, 118), (1, 119), (1, 120), (1, 121), (1, 122), (1, 123), (1, 125), (1, 126), (1, 133), (1, 134), (1, 135), (1, 136), (1, 137), (1, 138), (1, 1381),

-- =======================================================
-- 2. ASIGNACIÓN FUNCIONAL (Tipo de espacio)
-- =======================================================

-- AULAS (ID 8)
(8, 29), (8, 32), (8, 33), (8, 35), (8, 36), (8, 37), (8, 38), (8, 39), (8, 40), (8, 412), (8, 42), (8, 43), (8, 44), (8, 45), (8, 46), (8, 48), (8, 50), (8, 53), (8, 54), (8, 55), (8, 58), (8, 66), (8, 67), (8, 72), (8, 73), (8, 74), (8, 79), (8, 80), (8, 83), (8, 94), (8, 102), (8, 103), (8, 104), (8, 111), (8, 115), (8, 121), (8, 122), (8, 123), (8, 125), (8, 133), (8, 134), (8, 135),

-- LABORATORIOS (ID 9)
(9, 30), (9, 31), (9, 34), (9, 41), (9, 412), (9, 42), (9, 43), (9, 46), (9, 61), (9, 613), (9, 70), (9, 89), (9, 96), (9, 99), (9, 106), (9, 109), (9, 112), (9, 113), (9, 114), (9, 137), (9, 138), (9, 1381),

-- OFICINAS Y ADMINISTRACIÓN (ID 11)
(11, 1), (11, 4), (11, 6), (11, 9), (11, 10), (11, 11), (11, 12), (11, 14), (11, 15), (11, 28), (11, 492), (11, 56), (11, 612), (11, 75), (11, 81), (11, 82), (11, 90), (11, 93), (11, 107), (11, 116), (11, 118), (11, 120), (11, 136),

-- BAÑOS (ID 12)
(12, 7), (12, 1111), (12, 1112), (12, 1113), (12, 1114), (12, 1115), (12, 1116),

-- ALIMENTACIÓN Y DESCANSO (ID 13)
(13, 23), (13, 27), (13, 271),

-- ESTUDIO Y LECTURA (ID 10)
(10, 18), (10, 68), (10, 110),

-- AUDITORIOS Y EVENTOS (ID 15)
(15, 5), (15, 27), (15, 101),

-- DEPORTES Y EXTERIORES (ID 16)
(16, 139), (16, 140), (16, 141), (16, 142), (16, 44443),

-- SERVICIOS AL ESTUDIANTE / VARIOS (ID 14)
(14, 8), (14, 13), (14, 17), (14, 47), (14, 491), (14, 51), (14, 86), (14, 108);


-- 3.6. Insertar Actividades (Con IDs de espacio actualizados)
INSERT INTO actividad (nombre, descripcion, fecha, hora_inicio, hora_fin, id_espacio, id_evento) VALUES 
('Conferencia de Apertura', 'Charla sobre el futuro de la IA.', '2025-10-10', '09:00:00', '11:00:00', 27, 1), -- SUM
('Taller de Python', 'Introducción a la ciencia de datos.', '2025-10-11', '14:00:00', '16:00:00', 30, 1), -- Lab IEC
('Concierto al Atardecer', 'Música en vivo para cerrar el día.', '2025-11-05', '19:00:00', '21:00:00', 141, 2), -- Paseo
('Inicio del Hackathon', 'Formación de equipos y anuncio del reto.', '2026-12-01', '18:00:00', '20:00:00', 27, 3), -- SUM
('Mentoria de Proyectos', 'Sesión de ayuda con expertos.', '2026-12-02', '10:00:00', '12:00:00', 29, 3); -- Aula 61
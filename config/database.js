import { createPool } from 'mysql2/promise';

// Configuración de la base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'mysql',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'app_user',
    password: process.env.DB_PASSWORD || 'app_password',
    database: process.env.DB_NAME || 'mapa_interactivo',
    charset: 'utf8mb4',
    timezone: '+00:00',
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
};

// Crear pool de conexiones
const pool = createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Función para obtener conexión
const getConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Nueva conexión establecida como id ' + connection.threadId);
        return connection;
    } catch (error) {
        console.error('Error obteniendo conexión de la BD:', error);
        throw error;
    }
};

// Función para ejecutar queries
const query = async (sql, params = []) => {
    try {
        const [rows] = await pool.execute(sql, params);
        return rows;
    } catch (error) {
        console.error('Error ejecutando query:', error);
        throw error;
    }
};



export default {
    pool,
    getConnection,
    query
};
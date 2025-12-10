import bcrypt from 'bcrypt';
import { query } from './config/database.js';

async function createAdmin() {
  const nombre = 'admin';
  const contrasena = 'admin123'; // Cambiar esta contraseña después
  const administrador = true;

  try {
    // Verificar si el usuario ya existe
    const [existingUser] = await query('SELECT * FROM users WHERE nombre = ?', [nombre]);
    
    if (existingUser) {
      console.log(`Usuario "${nombre}" ya existe.`);
      console.log(`ID: ${existingUser.id}`);
      console.log(`Admin: ${existingUser.administrador}`);
      return;
    }

    // Crear el hash de la contraseña
    const cryptPass = await bcrypt.hash(contrasena, 10);

    // Insertar el usuario
    await query(
      `INSERT INTO users (nombre, contrasena, administrador)
       VALUES (?, ?, ?);`,
      [nombre, cryptPass, administrador]
    );

    console.log('✓ Usuario administrador creado exitosamente');
    console.log(`Usuario: ${nombre}`);
    console.log(`Contraseña: ${contrasena}`);
    console.log('¡IMPORTANTE! Cambia esta contraseña después del primer inicio de sesión');
  } catch (error) {
    console.error('Error creando usuario administrador:', error);
  } finally {
    process.exit(0);
  }
}

createAdmin();

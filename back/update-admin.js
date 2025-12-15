import bcrypt from 'bcryptjs';
import { query } from './config/database.js';

async function updateAdminPassword() {
  const nombre = 'admin';
  const nuevaContrasena = 'admin123'; // Nueva contraseña

  try {
    // Verificar si el usuario existe
    const [existingUser] = await query('SELECT * FROM users WHERE nombre = ?', [nombre]);
    
    if (!existingUser) {
      console.log(`✗ Usuario "${nombre}" no existe.`);
      process.exit(1);
    }

    // Crear el hash de la nueva contraseña
    const cryptPass = await bcrypt.hash(nuevaContrasena, 10);

    // Actualizar la contraseña
    await query(
      `UPDATE users SET contrasena = ? WHERE nombre = ?`,
      [cryptPass, nombre]
    );

    console.log('✓ Contraseña actualizada exitosamente\n');
    console.log('═══════════════════════════════════════');
    console.log('  CREDENCIALES DE ADMINISTRADOR');
    console.log('═══════════════════════════════════════');
    console.log(`  Usuario:     ${nombre}`);
    console.log(`  Contraseña:  ${nuevaContrasena}`);
    console.log('═══════════════════════════════════════\n');
    console.log('¡IMPORTANTE! Cambia esta contraseña después del primer inicio de sesión');
  } catch (error) {
    console.error('Error actualizando contraseña:', error);
  } finally {
    process.exit(0);
  }
}

updateAdminPassword();

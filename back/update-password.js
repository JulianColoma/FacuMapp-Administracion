import bcryptjs from 'bcryptjs';
import { query } from './config/database.js';

async function updateAdminPassword() {
  try {
    const password = 'admin123';
    const hash = await bcryptjs.hash(password, 10);
    console.log('Nuevo hash:', hash);
    
    await query(
      'UPDATE users SET contrasena = ? WHERE nombre = ?',
      [hash, 'admin']
    );
    
    console.log('✓ Contraseña actualizada');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

updateAdminPassword();

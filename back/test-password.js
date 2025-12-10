import bcrypt from 'bcrypt';

// Hash encontrado en init.sql
const hash = '$2b$10$V1DqRLVQjaxAg/P070MqUudYb1mc5QwDFiMNUETfPvPVt3HoPQXxK';

// Contraseñas comunes para probar
const passwords = ['admin', 'admin123', '123456', 'password', '1234', 'admin1234'];

async function testPasswords() {
  console.log('Probando contraseñas comunes...\n');
  
  for (const password of passwords) {
    const isValid = await bcrypt.compare(password, hash);
    if (isValid) {
      console.log(`✓ ¡Contraseña encontrada! "${password}"`);
      console.log(`\nCredenciales de acceso:`);
      console.log(`Usuario: admin`);
      console.log(`Contraseña: ${password}`);
      return;
    }
  }
  
  console.log('✗ No se encontró la contraseña entre las opciones comunes.');
}

testPasswords();

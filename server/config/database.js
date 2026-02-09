import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

console.log('🔧 Configurando conexión a MariaDB local...');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sistema_asistencia',
  port: parseInt(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

console.log('🐬 Configuración MariaDB local:', {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database,
  port: dbConfig.port,
  hasPassword: !!dbConfig.password
});

const pool = mysql.createPool(dbConfig);

// Test local connection and create tables
const initializeDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión a MariaDB local establecida correctamente');
    
    // Crear tabla usuarios optimizada (solo cédulas y contraseñas)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT PRIMARY KEY AUTO_INCREMENT,
        cedula INT(11) UNIQUE NOT NULL,
        password_hash VARCHAR(200) NOT NULL,
        activo BOOLEAN DEFAULT TRUE,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_cedula (cedula)
      )
    `);
    
    // Crear tabla asistencias
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS asistencias (
        id INT PRIMARY KEY AUTO_INCREMENT,
        usuario_id INT NOT NULL,
        cedula INT(11) NOT NULL,
        fecha DATE NOT NULL,
        hora_entrada TIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        INDEX idx_fecha (fecha),
        INDEX idx_cedula_fecha (cedula, fecha)
      )
    `);
    
    console.log('✅ Tablas de base de datos local verificadas/creadas');
    connection.release();
  } catch (error) {
    console.error('❌ Error inicializando base de datos local:', error.message);
    throw error;
  }
};

// Initialize database on startup
initializeDatabase();

export default pool;
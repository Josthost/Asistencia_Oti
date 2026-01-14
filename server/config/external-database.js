import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

console.log('🔧 Configurando conexión a BD externa...');

const externalDbConfig = {
  host: process.env.EXTERNAL_DB_HOST || 'localhost',
  user: process.env.EXTERNAL_DB_USER || 'root',
  password: process.env.EXTERNAL_DB_PASSWORD || '',
  database: process.env.EXTERNAL_DB_NAME || 'empleados_db',
  port: process.env.EXTERNAL_DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  timeout: 10000,
  acquireTimeout: 10000
};

console.log('🌐 Configuración BD externa:', {
  host: externalDbConfig.host,
  user: externalDbConfig.user,
  database: externalDbConfig.database,
  port: externalDbConfig.port,
  hasPassword: !!externalDbConfig.password
});

const externalPool = mysql.createPool(externalDbConfig);

// Test external connection
const testExternalConnection = async () => {
  try {
    const connection = await externalPool.getConnection();
    console.log('✅ Conexión a BD externa establecida correctamente');
    connection.release();
  } catch (error) {
    console.error('❌ Error conectando a BD externa:', error.message);
    console.warn('⚠️  La funcionalidad de autocompletado no estará disponible');
  }
};

testExternalConnection();

export default externalPool;
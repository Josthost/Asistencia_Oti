import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

console.log('🔧 Configurando conexión a PostgreSQL externa...');

const externalDbConfig = {
  host: process.env.EXTERNAL_DB_HOST || '172.16.0.78',
  user: process.env.EXTERNAL_DB_USER || 'postgres',
  password: process.env.EXTERNAL_DB_PASSWORD || 'postgres123',
  database: process.env.EXTERNAL_DB_NAME || 'db_iabn_2025',
  port: parseInt(process.env.EXTERNAL_DB_PORT) || 5432,
  max: 5, // máximo de conexiones en el pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: false // ajustar según configuración del servidor
};

console.log('🐘 Configuración PostgreSQL externa:', {
  host: externalDbConfig.host,
  user: externalDbConfig.user,
  database: externalDbConfig.database,
  port: externalDbConfig.port,
  hasPassword: !!externalDbConfig.password
});

const externalPool = new Pool(externalDbConfig);

// Test external connection
const testExternalConnection = async () => {
  try {
    const client = await externalPool.connect();
    console.log('✅ Conexión a PostgreSQL externa establecida correctamente');
    
    // Test query para verificar estructura
    const testQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('sno_personal', 'sno_personalnomina', 'sno_unidadadmin')
      LIMIT 3
    `;
    
    const result = await client.query(testQuery);
    console.log(`📊 Tablas encontradas: ${result.rows.length}/3`);
    
    client.release();
  } catch (error) {
    console.error('❌ Error conectando a PostgreSQL externa:', error.message);
    console.warn('⚠️  La funcionalidad de autocompletado no estará disponible');
  }
};

testExternalConnection();

export default externalPool;
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Para simular __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar dotenv - CON RUTA ABSOLUTA
const envPath = path.join(__dirname, '..', '.env');
console.log('📁 Buscando .env en:', envPath);
dotenv.config({ path: envPath });

// Verificar que las variables críticas estén cargadas
console.log('🔑 JWT_SECRET cargado:', process.env.JWT_SECRET ? '✅ SI' : '❌ NO');
console.log('🐬 DB_HOST:', process.env.DB_HOST);
console.log('🗄️ DB_NAME:', process.env.DB_NAME);

// Si JWT_SECRET no está definido, usar un valor por defecto para desarrollo
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET no encontrado, usando valor por defecto para desarrollo');
  process.env.JWT_SECRET = 'clave_secreta_para_desarrollo_' + Date.now();
  process.env.JWT_EXPIRES_IN = '24h';
}

if (!process.env.DB_NAME) {
  console.warn('⚠️  DB_NAME no encontrado, usando valor por defecto');
  process.env.DB_NAME = 'sistema_asistencia';
}

// Importar rutas
import authRoutes from './routes/auth.js';
import asistenciasRoutes from './routes/asistencias.js';
import employeesRoutes from './routes/employees.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware CORS SIMPLIFICADO Y FUNCIONAL
app.use(cors({
  origin: 'http://172.16.1.51',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/asistencias', asistenciasRoutes);
app.use('/api/employees', employeesRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: {
      db_configured: !!process.env.DB_HOST,
      jwt_configured: !!process.env.JWT_SECRET
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error no manejado:', err.stack);
  res.status(500).json({ error: 'Algo salió mal!' });
});

// 404 handler
app.use((req, res) => {
  console.log('❌ Ruta no encontrada:', req.method, req.url);
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores globales
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📊 API disponible en http://localhost:${PORT}/api`);
  console.log(`🔑 JWT configurado: ${process.env.JWT_SECRET ? '✅' : '❌'}`);
  console.log(`🗄️ Base de datos: ${process.env.DB_NAME || 'sistema_asistencia'}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
});

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Importar rutas
import authRoutes from './routes/auth.js';
import asistenciasRoutes from './routes/asistencias.js';
import employeesRoutes from './routes/employees.js';

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

const app = express();
const PORT = process.env.PORT || 3001;

// ==========================================
// CONFIGURACIÓN DE CORS
// ==========================================
const allowedOrigins = [
  'http://localhost:5173',
  'http://172.16.1.51',
  'http://172.16.0.71',
  process.env.CORS_ORIGIN
];

const isDev = process.env.NODE_ENV !== 'production';

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (isDev || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('🚫 CORS bloqueado para:', origin);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middlewares de Express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// DEFINICIÓN DE RUTAS API
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/asistencias', asistenciasRoutes);
app.use('/api/employees', employeesRoutes);

// ==========================================
// HEALTH CHECK
// ==========================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: {
      node_env: process.env.NODE_ENV || 'development',
      db_configured: !!process.env.DB_HOST,
      jwt_configured: !!process.env.JWT_SECRET,
      external_db_configured: !!process.env.EXTERNAL_DB_HOST
    }
  });
});

// ==========================================
// SERVIR FRONTEND ESTÁTICO
// ==========================================
if (process.env.SERVE_STATIC === 'true') {
  const distPath = path.join(__dirname, '..', 'dist');
  console.log('📦 SERVE_STATIC activado. Sirviendo archivos desde:', distPath);
  
  // Servir archivos estáticos
  app.use(express.static(distPath));

  // En lugar de definir ruta por ruta (/login, /register, etc.)
  // Usamos una expresión regular compatible para que cualquier ruta de navegación 
  // que NO sea de la API, sirva el index.html
  app.get(/^(?!\/api).+/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ==========================================
// MANEJO DE ERRORES
// ==========================================

app.use('/api/', (req, res) => {
  console.log('❌ Ruta API no encontrada:', req.method, req.url);
  res.status(404).json({ error: 'Ruta API no encontrada' });
});

// 404 handler general (para lo que no es API ni archivos estáticos)
app.use((req, res) => {
  if (process.env.SERVE_STATIC === 'true') {
    const distPath = path.join(__dirname, '..', 'dist');
    res.sendFile(path.join(distPath, 'index.html'));
  } else {
    res.status(404).json({ error: 'Ruta no encontrada' });
  }
});

// Error handling middleware global
app.use((err, req, res, next) => {
  console.error('❌ Error no manejado:', err.stack);
  res.status(500).json({ error: 'Algo salió mal en el servidor!' });
});

// Captura de errores críticos del proceso
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📊 API disponible en http://localhost:${PORT}/api`);
  console.log(`🔑 JWT configurado: ${process.env.JWT_SECRET ? '✅' : '❌'}`);
  console.log(`🗄️ Base de datos: ${process.env.DB_NAME || 'sistema_asistencia'}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
});
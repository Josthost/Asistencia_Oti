import express from 'express';
import employeeService from '../services/employeeService.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Buscar empleado por cédula en BD externa
// Allow public searching by cedula for registration flow (no token required)
router.get('/buscar-cedula/:cedula', async (req, res) => {
  try {
    const { cedula } = req.params;
    
    // Validar cédula
    if (!cedula || !/^\d+$/.test(cedula)) {
      return res.status(400).json({ 
        error: 'Cédula inválida. Debe contener solo números.' 
      });
    }
    
    console.log('🔍 API: Buscando empleado con cédula:', cedula);
    const empleado = await employeeService.getEmployeeByCedula(cedula);
    
    if (!empleado) {
      console.log('❌ API: No se encontró empleado con cédula:', cedula);
      return res.status(404).json({ 
        error: 'No se encontró empleado con esa cédula',
        found: false
      });
    }
    
    console.log('✅ API: Empleado encontrado:', empleado.nombre_completo);
    res.json({
      found: true,
      empleado
    });
    
  } catch (error) {
    console.error('Error buscando empleado:', error);
    
    // Devolver 503 para errores de servicio no disponible
    res.status(503).json({ 
      error: 'Base de datos externa no disponible temporalmente',
      found: false,
      details: error.message
    });
  }
});

// Buscar empleados por término
router.get('/buscar', authenticateToken, authorizeRoles('admin', 'supervisor'), async (req, res) => {
  try {
    const { q: searchTerm, limit = 10 } = req.query;
    
    if (!searchTerm || searchTerm.trim().length < 2) {
      return res.status(400).json({ 
        error: 'El término de búsqueda debe tener al menos 2 caracteres' 
      });
    }
    
    const empleados = await employeeService.searchEmployees(searchTerm.trim(), parseInt(limit));
    
    res.json({
      empleados,
      total: empleados.length
    });
    
  } catch (error) {
    console.error('Error buscando empleados:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      empleados: []
    });
  }
});

// Obtener estadísticas de BD externa
router.get('/stats', authenticateToken, authorizeRoles('admin', 'supervisor'), async (req, res) => {
  try {
    const stats = await employeeService.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      conexion_activa: false
    });
  }
});

export default router;
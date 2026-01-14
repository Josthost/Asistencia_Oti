import express from 'express';
import employeeService from '../services/employeeService.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Buscar empleado por cédula en BD externa
router.get('/buscar-cedula/:cedula', authenticateToken, async (req, res) => {
  try {
    const { cedula } = req.params;
    
    // Validar cédula
    if (!cedula || !/^\d+$/.test(cedula)) {
      return res.status(400).json({ 
        error: 'Cédula inválida. Debe contener solo números.' 
      });
    }
    
    const empleado = await employeeService.getEmployeeByCedula(cedula);
    
    if (!empleado) {
      return res.status(404).json({ 
        error: 'No se encontró empleado con esa cédula',
        found: false
      });
    }
    
    res.json({
      found: true,
      empleado
    });
    
  } catch (error) {
    console.error('Error buscando empleado:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      found: false
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
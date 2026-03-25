import express from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// ==========================================
// 1. REGISTRAR ASISTENCIA (POST /)
// ==========================================
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const cedula = req.user.cedula;
    
    // Obtener fecha y hora actuales del servidor
    const now = new Date();
    
    // Formatear fecha para MariaDB (YYYY-MM-DD)
    const fecha = now.toISOString().split('T')[0];
    
    // Formatear hora para MariaDB (HH:MM:SS)
    const horaEntrada = now.toTimeString().split(' ')[0];
    
    console.log('📅 Registro de asistencia:', { userId, cedula, fecha, horaEntrada });

    // Verificar si ya registró asistencia hoy
    const [existingRecords] = await db.execute(
      'SELECT id FROM asistencias WHERE usuario_id = ? AND fecha = ?',
      [userId, fecha]
    );

    if (existingRecords.length > 0) {
      return res.status(400).json({ error: 'Ya has registrado tu asistencia el día de hoy' });
    }

    // Registrar asistencia en BD local
    const [result] = await db.execute(
      'INSERT INTO asistencias (usuario_id, cedula, fecha, hora_entrada) VALUES (?, ?, ?, ?)',
      [userId, cedula, fecha, horaEntrada]
    );

    res.status(201).json({
      message: 'Asistencia registrada exitosamente',
      asistencia: {
        id: result.insertId,
        usuario_id: userId,
        cedula,
        fecha,
        hora_entrada: horaEntrada
      }
    });

  } catch (error) {
    console.error('Error registrando asistencia:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==========================================
// 2. OBTENER MIS ASISTENCIAS (GET /mis-asistencias)
// ==========================================
router.get('/mis-asistencias', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { fecha_inicio, fecha_fin, limit = 50 } = req.query;

    let query = 'SELECT * FROM asistencias WHERE usuario_id = ?';
    let params = [userId];

    if (fecha_inicio && fecha_fin) {
      query += ' AND fecha BETWEEN ? AND ?';
      params.push(fecha_inicio, fecha_fin);
    }

    query += ' ORDER BY fecha DESC, hora_entrada DESC LIMIT ?';
    params.push(parseInt(limit));

    const [asistencias] = await db.execute(query, params);
    res.json(asistencias);

  } catch (error) {
    console.error('Error obteniendo mis asistencias:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==========================================
// 3. OBTENER TODAS (Solo Admin/Supervisor)
// ==========================================
router.get('/todas', authenticateToken, async (req, res) => {
  try {
    const { rol, departamento, usuario: nombreUsuario } = req.user;

    // SEGURIDAD: Verificar rol permitido
    if (!['admin', 'supervisor'].includes(rol)) {
      return res.status(403).json({ error: 'No tienes permisos para ver el registro general' });
    }

    const { fecha_inicio, fecha_fin, cedula, limit = 100 } = req.query;
    
    console.log(`📊 Consulta General por: ${nombreUsuario} (${rol})`);

    // Query optimizada usando JOIN con nuestra tabla local de usuarios
    let query = `
      SELECT a.*, u.usuario, u.rol, u.departamento, u.cargo
      FROM asistencias a 
      JOIN usuarios u ON a.usuario_id = u.id 
      WHERE 1=1
    `;
    let params = [];

    // LÓGICA DE SUPERVISOR: Filtrado por departamento local (Sin consultar SNO externo)
    if (rol === 'supervisor') {
      if (!departamento) {
        return res.status(403).json({ error: 'Supervisor sin departamento asignado en el sistema.' });
      }
      query += ' AND u.departamento = ?';
      params.push(departamento);
      console.log(`🔒 Filtro de Privacidad: Solo Depto ${departamento}`);
    }

    // Filtros por fecha
    if (fecha_inicio && fecha_fin) {
      query += ' AND a.fecha BETWEEN ? AND ?';
      params.push(fecha_inicio, fecha_fin);
    }

    // Filtro por cédula específica
    if (cedula) {
      query += ' AND a.cedula = ?';
      params.push(cedula);
    }

    query += ' ORDER BY a.fecha DESC, a.hora_entrada DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const [asistencias] = await db.execute(query, params);
    res.json(asistencias);

  } catch (error) {
    console.error('Error en consulta general:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==========================================
// 4. ESTADÍSTICAS DASHBOARD (GET /estadisticas)
// ==========================================
router.get('/estadisticas', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const hoy = new Date().toISOString().split('T')[0];

    // Ejecutamos consultas en paralelo para mejorar rendimiento
    const [hoyResult, mesResult, totalResult] = await Promise.all([
      db.execute('SELECT COUNT(*) as count FROM asistencias WHERE usuario_id = ? AND fecha = ?', [userId, hoy]),
      db.execute('SELECT COUNT(*) as count FROM asistencias WHERE usuario_id = ? AND MONTH(fecha) = MONTH(CURDATE()) AND YEAR(fecha) = YEAR(CURDATE())', [userId]),
      db.execute('SELECT COUNT(*) as count FROM asistencias WHERE usuario_id = ?', [userId])
    ]);

    res.json({
      registrado_hoy: hoyResult[0][0].count > 0,
      asistencias_mes: mesResult[0][0].count,
      total_asistencias: totalResult[0][0].count
    });

  } catch (error) {
    console.error('Error en estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==========================================
// 5. ELIMINAR REGISTRO (Solo Admin)
// ==========================================
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado. Solo administradores.' });
    }

    const { id } = req.params;
    const [result] = await db.execute('DELETE FROM asistencias WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }

    res.json({ message: 'Registro eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar' });
  }
});

export default router;
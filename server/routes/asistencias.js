import express from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Registrar asistencia
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const cedula = req.user.cedula;
    const fecha = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const horaEntrada = new Date().toTimeString().split(' ')[0]; // HH:MM:SS

    // Verificar si ya registró asistencia hoy
    const [existingRecord] = await db.execute(
      'SELECT id FROM asistencias WHERE usuario_id = ? AND fecha = ?',
      [userId, fecha]
    );

    if (existingRecord.length > 0) {
      return res.status(400).json({ 
        error: 'Ya has registrado tu asistencia el día de hoy' 
      });
    }

    // Insertar registro de asistencia
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

// Obtener mis asistencias
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
    console.error('Error obteniendo asistencias:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener todas las asistencias (solo admin/supervisor)
router.get('/todas', authenticateToken, async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, cedula, limit = 100 } = req.query;

    let query = `
      SELECT a.*, u.cedula as usuario_cedula
      FROM asistencias a 
      JOIN usuarios u ON a.usuario_id = u.id 
      WHERE 1=1
    `;
    let params = [];

    if (fecha_inicio && fecha_fin) {
      query += ' AND a.fecha BETWEEN ? AND ?';
      params.push(fecha_inicio, fecha_fin);
    }

    if (cedula) {
      query += ' AND a.cedula = ?';
      params.push(cedula);
    }

    query += ' ORDER BY a.fecha DESC, a.hora_entrada DESC LIMIT ?';
    params.push(parseInt(limit));

    const [asistencias] = await db.execute(query, params);

    res.json(asistencias);

  } catch (error) {
    console.error('Error obteniendo todas las asistencias:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener estadísticas de asistencia
router.get('/estadisticas', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const hoy = new Date().toISOString().split('T')[0];
    const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    // Verificar si registró hoy
    const [registroHoy] = await db.execute(
      'SELECT id FROM asistencias WHERE usuario_id = ? AND fecha = ?',
      [userId, hoy]
    );

    // Contar asistencias del mes
    const [asistenciasMes] = await db.execute(
      'SELECT COUNT(*) as total FROM asistencias WHERE usuario_id = ? AND fecha >= ?',
      [userId, inicioMes]
    );

    // Contar total de asistencias
    const [totalAsistencias] = await db.execute(
      'SELECT COUNT(*) as total FROM asistencias WHERE usuario_id = ?',
      [userId]
    );

    res.json({
      registrado_hoy: registroHoy.length > 0,
      asistencias_mes: asistenciasMes[0].total,
      total_asistencias: totalAsistencias[0].total
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
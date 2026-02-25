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
    
    // Obtener fecha y hora actuales (Respetando zona horaria local del servidor)
    const now = new Date();
    
    // Formatear fecha para MariaDB (YYYY-MM-DD)
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const fecha = `${year}-${month}-${day}`;
    
    // Formatear hora para MariaDB (HH:MM:SS)
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const horaEntrada = `${hours}:${minutes}:${seconds}`;
    
    console.log('📅 Intentando registrar asistencia:', { userId, cedula, fecha, horaEntrada });

    // Verificar si ya registró asistencia hoy para evitar duplicados
    const [existingRecords] = await db.execute(
      'SELECT id FROM asistencias WHERE usuario_id = ? AND fecha = ?',
      [userId, fecha]
    );

    if (existingRecords.length > 0) {
      return res.status(400).json({ error: 'Ya has registrado tu asistencia el día de hoy' });
    }

    // Registrar asistencia
    const [result] = await db.execute(
      'INSERT INTO asistencias (usuario_id, cedula, fecha, hora_entrada) VALUES (?, ?, ?, ?)',
      [userId, cedula, fecha, horaEntrada]
    );

    console.log('✅ Asistencia registrada con ID:', result.insertId);

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
// 3. OBTENER TODAS (Solo Admin/Supervisor) (GET /todas)
// ==========================================
router.get('/todas', authenticateToken, async (req, res) => {
  try {
    // SEGURIDAD: Verificar rol
    if (!['admin', 'supervisor'].includes(req.user.rol)) {
      return res.status(403).json({ error: 'No tienes permisos para ver el registro general' });
    }

    const { fecha_inicio, fecha_fin, cedula, limit = 100 } = req.query;
    
    console.log('📊 Admin consultando asistencias:', { usuario: req.user.usuario, filtros: req.query });

    // Traemos datos del usuario (usuario y rol) haciendo JOIN
    let query = `
      SELECT a.*, u.usuario, u.rol 
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

// ==========================================
// 4. ESTADÍSTICAS (GET /estadisticas)
// ==========================================
router.get('/estadisticas', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    // Usamos fecha local para el "hoy"
    const now = new Date();
    const hoy = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // 1. Verificar si marcó hoy
    const [hoyResult] = await db.execute(
      'SELECT COUNT(*) as registrado_hoy FROM asistencias WHERE usuario_id = ? AND fecha = ?',
      [userId, hoy]
    );

    // 2. Asistencias este mes (Usando funciones SQL para mayor precisión)
    const [mesResult] = await db.execute(
      'SELECT COUNT(*) as este_mes FROM asistencias WHERE usuario_id = ? AND MONTH(fecha) = MONTH(CURDATE()) AND YEAR(fecha) = YEAR(CURDATE())',
      [userId]
    );

    // 3. Total histórico
    const [totalResult] = await db.execute(
      'SELECT COUNT(*) as total FROM asistencias WHERE usuario_id = ?',
      [userId]
    );

    res.json({
      registrado_hoy: hoyResult[0].registrado_hoy > 0,
      asistencias_mes: mesResult[0].este_mes,
      total_asistencias: totalResult[0].total
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==========================================
// 5. ELIMINAR REGISTRO (Solo Admin) (DELETE /:id)
// ==========================================
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // SEGURIDAD: Solo admin puede borrar
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ 
        error: 'Solo los administradores pueden eliminar registros de asistencia' 
      });
    }

    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    // Verificar existencia antes de borrar
    const [existingRecord] = await db.execute('SELECT id FROM asistencias WHERE id = ?', [id]);

    if (existingRecord.length === 0) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }

    // Ejecutar borrado
    await db.execute('DELETE FROM asistencias WHERE id = ?', [id]);

    console.log(`🗑️ Asistencia ID ${id} eliminada por admin ${req.user.usuario}`);
    res.json({ message: 'Registro de asistencia eliminado exitosamente' });

  } catch (error) {
    console.error('Error eliminando asistencia:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
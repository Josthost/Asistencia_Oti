// const express = require('express');
// const db = require('../config/database');
// const { authenticateToken } = require('../middleware/auth');

// const router = express.Router();

// // Registrar asistencia (hora y fecha automáticas)
// router.post('/', authenticateToken, async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const cedula = req.user.cedula;
    
//     // Obtener fecha y hora actuales
//     const now = new Date();
//     const fecha = now.toISOString().split('T')[0]; // YYYY-MM-DD
//     const horaEntrada = now.toTimeString().split(' ')[0]; // HH:MM:SS

//     // Verificar si ya registró asistencia hoy
//     const [existingRecords] = await db.execute(
//       'SELECT id FROM asistencias WHERE usuario_id = ? AND fecha = ?',
//       [userId, fecha]
//     );

//     if (existingRecords.length > 0) {
//       return res.status(400).json({ error: 'Ya has registrado tu asistencia hoy' });
//     }

//     // Registrar asistencia
//     const [result] = await db.execute(
//       'INSERT INTO asistencias (usuario_id, cedula, fecha, hora_entrada) VALUES (?, ?, ?, ?)',
//       [userId, cedula, fecha, horaEntrada]
//     );

//     res.status(201).json({
//       message: 'Asistencia registrada exitosamente',
//       asistencia: {
//         id: result.insertId,
//         fecha,
//         hora_entrada: horaEntrada
//       }
//     });

//   } catch (error) {
//     console.error('Error registrando asistencia:', error);
//     res.status(500).json({ error: 'Error interno del servidor' });
//   }
// });

// // Obtener asistencias del usuario actual
// router.get('/mis-asistencias', authenticateToken, async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { fecha_inicio, fecha_fin, limit = 50 } = req.query;

//     let query = 'SELECT * FROM asistencias WHERE usuario_id = ?';
//     let params = [userId];

//     if (fecha_inicio && fecha_fin) {
//       query += ' AND fecha BETWEEN ? AND ?';
//       params.push(fecha_inicio, fecha_fin);
//     }

//     query += ' ORDER BY fecha DESC, hora_entrada DESC LIMIT ?';
//     params.push(parseInt(limit));

//     const [asistencias] = await db.execute(query, params);

//     res.json(asistencias);

//   } catch (error) {
//     console.error('Error obteniendo asistencias:', error);
//     res.status(500).json({ error: 'Error interno del servidor' });
//   }
// });

// // Obtener todas las asistencias (solo admin/supervisor)
// router.get('/todas', authenticateToken, async (req, res) => {
//   try {
//     if (!['admin', 'supervisor'].includes(req.user.rol)) {
//       return res.status(403).json({ error: 'No tienes permisos para ver todas las asistencias' });
//     }

//     const { fecha_inicio, fecha_fin, cedula, limit = 100 } = req.query;

//     let query = `
//       SELECT a.*, u.usuario, u.rol 
//       FROM asistencias a 
//       JOIN usuarios u ON a.usuario_id = u.id 
//       WHERE 1=1
//     `;
//     let params = [];

//     if (fecha_inicio && fecha_fin) {
//       query += ' AND a.fecha BETWEEN ? AND ?';
//       params.push(fecha_inicio, fecha_fin);
//     }

//     if (cedula) {
//       query += ' AND a.cedula = ?';
//       params.push(cedula);
//     }

//     query += ' ORDER BY a.fecha DESC, a.hora_entrada DESC LIMIT ?';
//     params.push(parseInt(limit));

//     const [asistencias] = await db.execute(query, params);

//     res.json(asistencias);

//   } catch (error) {
//     console.error('Error obteniendo todas las asistencias:', error);
//     res.status(500).json({ error: 'Error interno del servidor' });
//   }
// });

// // Estadísticas de asistencia
// router.get('/estadisticas', authenticateToken, async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const hoy = new Date().toISOString().split('T')[0];

//     // Asistencia de hoy
//     const [hoyResult] = await db.execute(
//       'SELECT COUNT(*) as registrado_hoy FROM asistencias WHERE usuario_id = ? AND fecha = ?',
//       [userId, hoy]
//     );

//     // Asistencias este mes
//     const [mesResult] = await db.execute(
//       'SELECT COUNT(*) as este_mes FROM asistencias WHERE usuario_id = ? AND MONTH(fecha) = MONTH(CURDATE()) AND YEAR(fecha) = YEAR(CURDATE())',
//       [userId]
//     );

//     // Total de asistencias
//     const [totalResult] = await db.execute(
//       'SELECT COUNT(*) as total FROM asistencias WHERE usuario_id = ?',
//       [userId]
//     );

//     res.json({
//       registrado_hoy: hoyResult[0].registrado_hoy > 0,
//       asistencias_mes: mesResult[0].este_mes,
//       total_asistencias: totalResult[0].total
//     });

//   } catch (error) {
//     console.error('Error obteniendo estadísticas:', error);
//     res.status(500).json({ error: 'Error interno del servidor' });
//   }
// });

// module.exports = router;

import express from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Registrar asistencia (hora y fecha automáticas)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const cedula = req.user.cedula;
    
    // Obtener fecha y hora actuales
    const now = new Date();
    const fecha = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const horaEntrada = now.toTimeString().split(' ')[0]; // HH:MM:SS

    // Verificar si ya registró asistencia hoy
    const [existingRecords] = await db.execute(
      'SELECT id FROM asistencias WHERE usuario_id = ? AND fecha = ?',
      [userId, fecha]
    );

    if (existingRecords.length > 0) {
      return res.status(400).json({ error: 'Ya has registrado tu asistencia hoy' });
    }

    // Registrar asistencia
    const [result] = await db.execute(
      'INSERT INTO asistencias (usuario_id, cedula, fecha, hora_entrada) VALUES (?, ?, ?, ?)',
      [userId, cedula, fecha, horaEntrada]
    );

    res.status(201).json({
      message: 'Asistencia registrada exitosamente',
      asistencia: {
        id: result.insertId,
        fecha,
        hora_entrada: horaEntrada
      }
    });

  } catch (error) {
    console.error('Error registrando asistencia:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener asistencias del usuario actual
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
    if (!['admin', 'supervisor'].includes(req.user.rol)) {
      return res.status(403).json({ error: 'No tienes permisos para ver todas las asistencias' });
    }

    const { fecha_inicio, fecha_fin, cedula, limit = 100 } = req.query;

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

// Estadísticas de asistencia
router.get('/estadisticas', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const hoy = new Date().toISOString().split('T')[0];

    // Asistencia de hoy
    const [hoyResult] = await db.execute(
      'SELECT COUNT(*) as registrado_hoy FROM asistencias WHERE usuario_id = ? AND fecha = ?',
      [userId, hoy]
    );

    // Asistencias este mes
    const [mesResult] = await db.execute(
      'SELECT COUNT(*) as este_mes FROM asistencias WHERE usuario_id = ? AND MONTH(fecha) = MONTH(CURDATE()) AND YEAR(fecha) = YEAR(CURDATE())',
      [userId]
    );

    // Total de asistencias
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

export default router;
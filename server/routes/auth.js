import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

// Después de los imports en auth.js, agrega:
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET no encontrado, usando valor por defecto');
  process.env.JWT_SECRET = 'clave_temporal_para_desarrollo_' + Date.now();
  process.env.JWT_EXPIRES_IN = '24h';
}

const router = express.Router();

// Registro de usuario
router.post('/register', async (req, res) => {
  try {
    const { cedula, password } = req.body;

    // Validaciones
    if (!cedula || !password) {
      return res.status(400).json({ error: 'Cédula y contraseña son requeridos' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Verificar si la cédula ya está registrada
    const [existingUsers] = await db.execute(
      'SELECT id FROM usuarios WHERE cedula = ?',
      [cedula]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Esta cédula ya está registrada en el sistema' });
    }

    // Encriptar contraseña
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insertar usuario (solo cédula y contraseña)
    const [result] = await db.execute(
      'INSERT INTO usuarios (cedula, password_hash) VALUES (?, ?)',
      [cedula, passwordHash]
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      userId: result.insertId
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Login de usuario
router.post('/login', async (req, res) => {
  try {
    const { cedula, password } = req.body;

    if (!cedula || !password) {
      return res.status(400).json({ error: 'Cédula y contraseña son requeridos' });
    }

    // Buscar usuario por cédula
    const [users] = await db.execute(
      'SELECT id, cedula, password_hash, activo FROM usuarios WHERE cedula = ? AND activo = TRUE',
      [cedula]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = users[0];

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        cedula: user.cedula
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        cedula: user.cedula
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Verificar token
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    valid: true,
    user: req.user
  });
});

// Logout (opcional - principalmente para limpiar del lado del cliente)
router.post('/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logout exitoso' });
});

export default router;
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Registro de usuario
router.post('/register', async (req, res) => {
  try {
    const { cedula, usuario, password, rol = 'empleado' } = req.body;

    // Validaciones
    if (!cedula || !usuario || !password) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Verificar si el usuario ya existe
    const [existingUsers] = await db.execute(
      'SELECT id FROM usuarios WHERE cedula = ? OR usuario = ?',
      [cedula, usuario]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'La cédula o usuario ya están registrados' });
    }

    // Encriptar contraseña
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insertar usuario
    const [result] = await db.execute(
      'INSERT INTO usuarios (cedula, usuario, password_hash, rol) VALUES (?, ?, ?, ?)',
      [cedula, usuario, passwordHash, rol]
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
    const { usuario, password } = req.body;

    if (!usuario || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    // Buscar usuario
    const [users] = await db.execute(
      'SELECT id, cedula, usuario, password_hash, rol, activo FROM usuarios WHERE usuario = ? AND activo = TRUE',
      [usuario]
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
        cedula: user.cedula, 
        usuario: user.usuario, 
        rol: user.rol 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        cedula: user.cedula,
        usuario: user.usuario,
        rol: user.rol
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

module.exports = router;
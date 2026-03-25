import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';
import employeeService from '../services/employeeService.js';
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
    const { cedula, password, departamento } = req.body; // Quitamos usuario y cargo del body

    if (!cedula || !password) {
      return res.status(400).json({ error: 'Cédula y contraseña son requeridos' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    let departamentoUsuario = departamento;
    let rolUsuario = 'empleado';

    // Buscar datos en BD externa para determinar el Rol y Departamento automáticamente
    try {
      console.log('🔍 Buscando datos externos para cédula:', cedula);
      const empleadoData = await employeeService.getEmployeeByCedula(cedula);
      
      if (empleadoData) {
        departamentoUsuario = empleadoData.departamento;
        const cargoUsuario = (empleadoData.cargo || '').toLowerCase();
        
        // Lógica de roles basada en el cargo (aunque no guardemos el cargo, lo usamos para el rol)
        const adminRoles = ['director', 'gerente general', 'administrador', 'jefe', 'coordinador general'];
        const supervisorRoles = ['supervisor', 'coordinador', 'encargado', 'líder'];

        if (adminRoles.some(role => cargoUsuario.includes(role))) {
          rolUsuario = 'admin';
        } else if (supervisorRoles.some(role => cargoUsuario.includes(role))) {
          rolUsuario = 'supervisor';
        }
      }
    } catch (error) {
      console.warn('⚠️ Error en BD externa, continuando con datos básicos');
    }

    // Verificar si ya existe
    const [existingUsers] = await db.execute('SELECT id FROM usuarios WHERE cedula = ?', [cedula]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Esta cédula ya está registrada' });
    }

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // INSERT CORREGIDO: Sin 'usuario' y sin 'cargo'
    const [result] = await db.execute(
      "INSERT INTO usuarios (cedula, password_hash, rol, departamento) VALUES (?, ?, ?, ?)",
      [cedula, passwordHash, rolUsuario, departamentoUsuario]
    );

    console.log(`✅ Registro exitoso: ${cedula} - Rol: ${rolUsuario}`);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: { id: result.insertId, cedula, rol: rolUsuario, departamento: departamentoUsuario }
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

    // SELECT CORREGIDO: Sin 'usuario' y sin 'cargo'
    const [users] = await db.execute(
      'SELECT id, cedula, password_hash, activo, rol, departamento FROM usuarios WHERE cedula = ? AND activo = TRUE',
      [cedula]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { userId: user.id, cedula: user.cedula, rol: user.rol, departamento: user.departamento },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        cedula: user.cedula,
        rol: user.rol || 'empleado',
        departamento: user.departamento
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
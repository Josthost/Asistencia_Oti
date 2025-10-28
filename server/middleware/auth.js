// const jwt = require('jsonwebtoken');
// const db = require('../config/database');

// const authenticateToken = async (req, res, next) => {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];

//   if (!token) {
//     return res.status(401).json({ error: 'Token de acceso requerido' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
//     // Verificar que el usuario aún existe y está activo
//     const [users] = await db.execute(
//       'SELECT id, cedula, usuario, rol, activo FROM usuarios WHERE id = ? AND activo = TRUE',
//       [decoded.userId]
//     );

//     if (users.length === 0) {
//       return res.status(401).json({ error: 'Usuario no válido' });
//     }

//     req.user = users[0];
//     next();
//   } catch (error) {
//     return res.status(403).json({ error: 'Token inválido' });
//   }
// };

// const authorizeRoles = (...roles) => {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.rol)) {
//       return res.status(403).json({ error: 'No tienes permisos para esta acción' });
//     }
//     next();
//   };
// };

// module.exports = { authenticateToken, authorizeRoles };

import jwt from 'jsonwebtoken';
import db from '../config/database.js';

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar que el usuario aún existe y está activo
    const [users] = await db.execute(
      'SELECT id, cedula, usuario, rol, activo FROM usuarios WHERE id = ? AND activo = TRUE',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Usuario no válido' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido' });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ error: 'No tienes permisos para esta acción' });
    }
    next();
  };
};

export { authenticateToken, authorizeRoles };
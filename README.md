# Sistema de Control de Asistencia

Sistema completo de control de asistencia con autenticación de usuarios y base de datos MySQL.

## 🚀 Características

- **Autenticación completa**: Login, registro y protección de rutas
- **Roles de usuario**: Admin, Supervisor, Empleado
- **Registro automático**: Fecha y hora se registran automáticamente
- **Base de datos MySQL**: Integración completa con XAMPP
- **Interface moderna**: React + TypeScript + Tailwind CSS
- **API REST**: Backend con Express.js

## 🛠️ Tecnologías

### Frontend
- React 18.3.1
- TypeScript 5.5.3
- Tailwind CSS 3.4.1
- React Router DOM 6.22.2
- Axios para API calls
- Lucide React (iconos)

### Backend
- Node.js + Express.js
- MySQL2 (conexión a base de datos)
- MySQL2 (conexión a base de datos principal y externa)
- bcryptjs (encriptación de contraseñas)
- jsonwebtoken (autenticación JWT)
- CORS habilitado

## 📋 Requisitos Previos

1. **XAMPP** instalado y corriendo
2. **Node.js** versión 18 o superior
3. **MySQL** corriendo en puerto 3306

## 🔧 Instalación

### 1. Configurar Base de Datos

Abrir phpMyAdmin y ejecutar:

```sql
CREATE DATABASE sistema_asistencia;
USE sistema_asistencia;

-- Tabla usuarios
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cedula INT(11) UNIQUE NOT NULL,
    usuario VARCHAR(20) NOT NULL,
    password_hash VARCHAR(200) NOT NULL,
    rol ENUM('admin', 'empleado', 'supervisor') DEFAULT 'empleado',
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla asistencias
CREATE TABLE asistencias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    cedula INT(11) NOT NULL,
    fecha DATE NOT NULL,
    hora_entrada TIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_fecha (fecha),
    INDEX idx_cedula_fecha (cedula, fecha)
);
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

El archivo `.env` debe configurarse tanto para la base de datos principal como para la externa:

```env
# Base de datos principal (Sistema de asistencia)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=sistema_asistencia
DB_PORT=3306

# Base de datos externa (Datos de empleados)
EXTERNAL_DB_HOST=192.168.1.100
EXTERNAL_DB_USER=empleados_user
EXTERNAL_DB_PASSWORD=empleados_pass
EXTERNAL_DB_NAME=empleados_db
EXTERNAL_DB_PORT=3306

JWT_SECRET=tu_clave_secreta_muy_segura_aqui_2024
```

### 4. Ejecutar el Sistema

**Opción 1: Ejecutar todo junto**
```bash
npm run dev:full
```

**Opción 2: Ejecutar por separado**
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run dev
```

## 🌐 URLs del Sistema

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/health

## 👥 Roles y Permisos

### 🔵 **Empleado**
- Registrar su propia asistencia
- Ver sus propias asistencias
- Ver estadísticas personales

### 🟡 **Supervisor**
- Todo lo del empleado +
- Ver todas las asistencias
- Acceso a reportes
- Gestionar empleados

### 🔴 **Administrador**
- Acceso completo al sistema
- Gestión de usuarios
- Reportes avanzados
- Configuración del sistema

## 📱 Funcionalidades

### Autenticación
- ✅ Login con usuario/contraseña
- ✅ Registro de nuevos usuarios
- ✅ Autocompletado de datos desde BD externa
- ✅ Protección de rutas por rol
- ✅ JWT tokens seguros
- ✅ Logout automático

### Asistencia
- ✅ Registro automático de fecha/hora
- ✅ Un registro por día por usuario
- ✅ Historial de asistencias
- ✅ Estadísticas personales

### Base de Datos Externa
- ✅ Conexión a BD externa para datos de empleados
- ✅ Búsqueda automática por cédula
- ✅ Autocompletado de formularios
- ✅ Búsqueda avanzada de empleados
- ✅ Estadísticas de conexión

### Reportes (Admin/Supervisor)
- ✅ Reportes por fecha
- ✅ Filtros por empleado
- ✅ Exportación de datos
- ✅ Estadísticas generales

## 🔒 Seguridad

- Contraseñas encriptadas con bcrypt (12 rounds)
- Tokens JWT con expiración
- Validación de datos en frontend y backend
- Protección contra inyección SQL
- CORS configurado correctamente

## 🚀 Despliegue

### Desarrollo
```bash
npm run dev:full
```

### Producción
```bash
npm run build
npm run server
```

## 📊 Estructura de la Base de Datos

### Tabla `usuarios`
- `id`: Clave primaria
- `cedula`: Número de cédula único
- `usuario`: Nombre de usuario
- `password_hash`: Contraseña encriptada
- `rol`: admin/supervisor/empleado
- `activo`: Estado del usuario
- `fecha_creacion`: Timestamp de creación

### Tabla `asistencias`
- `id`: Clave primaria
- `usuario_id`: FK a usuarios
- `cedula`: Cédula del usuario
- `fecha`: Fecha de asistencia
- `hora_entrada`: Hora exacta de entrada
- `created_at`: Timestamp de creación

## 🔧 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/verify` - Verificar token
- `POST /api/auth/logout` - Cerrar sesión

### Asistencias
- `POST /api/asistencias` - Registrar asistencia
- `GET /api/asistencias/mis-asistencias` - Mis asistencias
- `GET /api/asistencias/todas` - Todas las asistencias (Admin/Supervisor)
- `GET /api/asistencias/estadisticas` - Estadísticas

### Empleados (BD Externa)
- `GET /api/employees/buscar-cedula/:cedula` - Buscar por cédula
- `GET /api/employees/buscar` - Búsqueda general
- `GET /api/employees/stats` - Estadísticas de BD externa

## 🎨 Colores del Sistema

- **Azul Principal**: #273376
- **Amarillo**: #FFC907  
- **Rojo**: #A70336

## 📞 Soporte

Para problemas o dudas:
1. Verificar que XAMPP esté corriendo
2. Verificar conexión a base de datos externa
3. Confirmar que ambas bases de datos existen
4. Revisar los logs del servidor
5. Verificar las variables de entorno (principal y externa)

---

**¡Sistema listo para usar!** 🎉
# Guía de Edición - Control de Asistencia

## 🎨 Cambiar Colores

### Archivo: `assets/css/custom.css`

Para cambiar el tema de colores, modifica las variables CSS:

```css
:root {
  /* Colores principales - Cambia estos valores */
  --primary-50: #f0f9ff;   /* Muy claro (fondos) */
  --primary-100: #e0f2fe;  /* Claro */
  --primary-600: #0284c7;  /* Principal (botones, enlaces) */
  --primary-700: #0369a1;  /* Oscuro (hover) */
}
```

### Ejemplos de temas:

**Tema Verde:**
```css
--primary-50: #ecfdf5;
--primary-600: #059669;
--primary-700: #047857;
```

**Tema Morado:**
```css
--primary-50: #f5f3ff;
--primary-600: #7c3aed;
--primary-700: #6d28d9;
```

**Tema Rojo:**
```css
--primary-50: #fef2f2;
--primary-600: #dc2626;
--primary-700: #b91c1c;
```

## 📝 Cambiar Textos

### Título de la aplicación
**Archivo:** `includes/header.php`
```php
<span class="ml-2 text-xl font-bold text-gray-900">Control de Asistencia</span>
```

### Elementos del menú
**Archivo:** `includes/sidebar.php`
```php
Panel Principal
Empleados
Asistencia
Reportes
```

## 🗄️ Modificar Base de Datos

### Archivo: `config/database.php`
```php
$host = 'localhost';        // Servidor de base de datos
$dbname = 'attendance_db';  // Nombre de la base de datos
$username = 'root';         // Usuario
$password = '';             // Contraseña
```

## 📊 Personalizar Dashboard

### Archivo: `pages/dashboard.php`

**Cambiar tarjetas de estadísticas:**
```php
// Busca estas líneas y modifica los textos
<h2 class="text-sm font-medium text-gray-500">Total Empleados</h2>
<h2 class="text-sm font-medium text-gray-500">Asistencia Hoy</h2>
```

**Agregar nuevas estadísticas:**
```php
// Agregar después de las consultas existentes
$monthlyAttendance = $pdo->query("
    SELECT COUNT(*) as total 
    FROM attendance 
    WHERE MONTH(date) = MONTH(CURDATE())
")->fetch()['total'];
```

## 👥 Personalizar Empleados

### Archivo: `pages/employees.php`

**Agregar nuevos campos:**
1. Modifica la tabla `employees` en la base de datos
2. Actualiza el formulario HTML
3. Modifica las consultas SQL

**Ejemplo - Agregar campo teléfono:**
```sql
ALTER TABLE employees ADD COLUMN phone VARCHAR(20);
```

```html
<input type="tel" name="phone" placeholder="Teléfono">
```

## 📅 Personalizar Asistencia

### Archivo: `pages/attendance.php`

**Cambiar formato de hora:**
```php
// Cambiar de 24h a 12h
date('h:i A', strtotime($record['check_in_time']))
```

**Agregar campos adicionales:**
- Hora de salida
- Ubicación
- Comentarios

## 📈 Personalizar Reportes

### Archivo: `pages/reports.php`

**Agregar nuevos tipos de reportes:**
- Reporte mensual
- Reporte por departamento
- Reporte de tardanzas

## 🔧 Configuración Avanzada

### Cambiar zona horaria
**Archivo:** `config/database.php`
```php
date_default_timezone_set('America/Bogota');
```

### Agregar validaciones
```php
if (empty($name)) {
    $errors[] = "El nombre es requerido";
}
```

### Mejorar seguridad
```php
// Sanitizar datos
$name = filter_var($name, FILTER_SANITIZE_STRING);

// Validar entrada
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = "Email inválido";
}
```

## 📱 Hacer Responsive

### Archivo: `assets/css/custom.css`
```css
@media (max-width: 768px) {
    .sidebar {
        display: none;
    }
    
    .main-content {
        margin-left: 0;
    }
}
```

## 🚀 Optimizaciones

### Paginación
```php
$limit = 10;
$offset = ($page - 1) * $limit;
$query = "SELECT * FROM employees LIMIT $limit OFFSET $offset";
```

### Búsqueda
```php
$search = $_GET['search'] ?? '';
$query = "SELECT * FROM employees WHERE name LIKE '%$search%'";
```

### Exportar datos
```php
header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename="empleados.csv"');
```
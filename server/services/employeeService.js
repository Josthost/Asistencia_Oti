import externalDb from '../config/external-database.js';

class EmployeeService {
  /**
   * Buscar empleado por cédula en la base de datos externa
   * @param {string|number} cedula - Cédula del empleado
   * @returns {Promise<Object|null>} Datos del empleado o null si no se encuentra
   */
  async getEmployeeByCedula(cedula) {
    try {
      console.log(`🔍 Buscando empleado con cédula: ${cedula}`);
      
      // Consulta SQL - ajusta según la estructura de tu tabla externa
      const query = `
        SELECT 
          cedula,
          nombre,
          apellido,
          CONCAT(nombre, ' ', apellido) as nombre_completo,
          departamento,
          cargo,
          email,
          telefono,
          fecha_ingreso,
          estado
        FROM empleados 
        WHERE cedula = ? AND estado = 'activo'
        LIMIT 1
      `;
      
      const [rows] = await externalDb.execute(query, [cedula]);
      
      if (rows.length === 0) {
        console.log(`❌ No se encontró empleado con cédula: ${cedula}`);
        return null;
      }
      
      const empleado = rows[0];
      console.log(`✅ Empleado encontrado: ${empleado.nombre_completo}`);
      
      return {
        cedula: empleado.cedula,
        nombre: empleado.nombre,
        apellido: empleado.apellido,
        nombre_completo: empleado.nombre_completo,
        departamento: empleado.departamento,
        cargo: empleado.cargo,
        email: empleado.email || null,
        telefono: empleado.telefono || null,
        fecha_ingreso: empleado.fecha_ingreso || null
      };
      
    } catch (error) {
      console.error('❌ Error consultando empleado:', error);
      
      // Si hay error de conexión, devolver null en lugar de lanzar error
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        console.warn('⚠️  Base de datos externa no disponible');
        return null;
      }
      
      throw error;
    }
  }

  /**
   * Buscar múltiples empleados por término de búsqueda
   * @param {string} searchTerm - Término de búsqueda
   * @param {number} limit - Límite de resultados
   * @returns {Promise<Array>} Lista de empleados
   */
  async searchEmployees(searchTerm, limit = 10) {
    try {
      console.log(`🔍 Buscando empleados con término: ${searchTerm}`);
      
      const query = `
        SELECT 
          cedula,
          nombre,
          apellido,
          CONCAT(nombre, ' ', apellido) as nombre_completo,
          departamento,
          cargo
        FROM empleados 
        WHERE (
          cedula LIKE ? OR 
          nombre LIKE ? OR 
          apellido LIKE ? OR 
          departamento LIKE ? OR 
          cargo LIKE ?
        ) AND estado = 'activo'
        ORDER BY nombre, apellido
        LIMIT ?
      `;
      
      const searchPattern = `%${searchTerm}%`;
      const [rows] = await externalDb.execute(query, [
        searchPattern, searchPattern, searchPattern, 
        searchPattern, searchPattern, limit
      ]);
      
      console.log(`✅ Encontrados ${rows.length} empleados`);
      return rows;
      
    } catch (error) {
      console.error('❌ Error buscando empleados:', error);
      return [];
    }
  }

  /**
   * Obtener estadísticas de la base de datos externa
   * @returns {Promise<Object>} Estadísticas
   */
  async getStats() {
    try {
      const [totalRows] = await externalDb.execute(
        'SELECT COUNT(*) as total FROM empleados WHERE estado = "activo"'
      );
      
      const [deptRows] = await externalDb.execute(
        'SELECT COUNT(DISTINCT departamento) as departamentos FROM empleados WHERE estado = "activo"'
      );
      
      return {
        total_empleados: totalRows[0].total,
        total_departamentos: deptRows[0].departamentos,
        conexion_activa: true
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return {
        total_empleados: 0,
        total_departamentos: 0,
        conexion_activa: false
      };
    }
  }
}

export default new EmployeeService();
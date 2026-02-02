import externalDb from '../config/external-database.js';

class EmployeeService {
  /**
   * Buscar empleado por cédula en la base de datos PostgreSQL externa
   * @param {string|number} cedula - Cédula del empleado
   * @returns {Promise<Object|null>} Datos del empleado o null si no se encuentra
   */
  async getEmployeeByCedula(cedula) {
    let client;
    try {
      console.log(`🔍 Buscando empleado con cédula: ${cedula}`);
      
      client = await externalDb.connect();
      
      // Consulta SQL completa según especificaciones
      const query = `
        SELECT 
            sno_personal.nomper AS nombre,
            sno_personal.apeper AS apellido,
            sno_personal.cedper AS cedula,
            sno_personal.fecnacper AS fecha_nacimiento,
            sno_personal.sexper AS sexo,
            sno_personal.fecingper AS fecha_ingreso,
            sno_personalnomina.codnom AS codigo_nomina,
            sno_personalnomina.descasicar AS cargo,
            sno_unidadadmin.desuniadm AS departamento,
            sno_constantepersonal.moncon AS monto_constante,
            sno_nomina.desnom AS descripcion_nomina,
            rpc_beneficiario.ctaban AS cuenta_banco
        FROM sno_personal, sno_personalnomina, sno_unidadadmin, 
             sno_constantepersonal, sno_nomina, rpc_beneficiario 
        WHERE sno_personal.cedper = $1
            AND sno_personal.estper = '1' 
            AND sno_personalnomina.codper = sno_personal.codper 
            AND sno_personalnomina.codnom <= '0010' 
            AND sno_personalnomina.staper = '1'  
            AND sno_personalnomina.minorguniadm = sno_unidadadmin.minorguniadm 
            AND sno_personalnomina.ofiuniadm = sno_unidadadmin.ofiuniadm 
            AND sno_personalnomina.uniuniadm = sno_unidadadmin.uniuniadm 
            AND sno_personalnomina.depuniadm = sno_unidadadmin.depuniadm 
            AND sno_personalnomina.prouniadm = sno_unidadadmin.prouniadm 
            AND sno_constantepersonal.codnom = sno_personalnomina.codnom 
            AND sno_constantepersonal.codper = sno_personalnomina.codper 
            AND (sno_constantepersonal.codcons = '0000000001' 
                 OR sno_constantepersonal.codcons = '0000000002') 
            AND sno_nomina.codnom = sno_personalnomina.codnom 
            AND rpc_beneficiario.ced_bene = sno_personal.cedper
        LIMIT 1
      `;
      
      const result = await client.query(query, [cedula]);
      
      if (result.rows.length === 0) {
        console.log(`❌ No se encontró empleado activo con cédula: ${cedula}`);
        return null;
      }
      
      const empleado = result.rows[0];
      console.log(`✅ Empleado encontrado: ${empleado.nombre} ${empleado.apellido}`);
      
      // Formatear datos para el frontend
      const empleadoFormateado = {
        cedula: empleado.cedula,
        nombre: empleado.nombre?.trim() || '',
        apellido: empleado.apellido?.trim() || '',
        nombre_completo: `${empleado.nombre?.trim() || ''} ${empleado.apellido?.trim() || ''}`.trim(),
        departamento: empleado.departamento?.trim() || '',
        cargo: empleado.cargo?.trim() || '',
        fecha_ingreso: empleado.fecha_ingreso || null,
        fecha_nacimiento: empleado.fecha_nacimiento || null,
        sexo: empleado.sexo || null,
        codigo_nomina: empleado.codigo_nomina || null,
        descripcion_nomina: empleado.descripcion_nomina || null,
        monto_constante: empleado.monto_constante || null,
        cuenta_banco: empleado.cuenta_banco || null
      };
      
      return empleadoFormateado;
      
    } catch (error) {
      console.error('❌ Error consultando empleado en PostgreSQL:', error);
      
      // Si hay error de conexión, devolver null en lugar de lanzar error
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        console.warn('⚠️  Base de datos PostgreSQL externa no disponible');
        return null;
      }
      
      throw error;
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  /**
   * Buscar múltiples empleados por término de búsqueda
   * @param {string} searchTerm - Término de búsqueda
   * @param {number} limit - Límite de resultados
   * @returns {Promise<Array>} Lista de empleados
   */
  async searchEmployees(searchTerm, limit = 10) {
    let client;
    try {
      console.log(`🔍 Buscando empleados con término: ${searchTerm}`);
      
      client = await externalDb.connect();
      
      const query = `
        SELECT DISTINCT
            sno_personal.cedper AS cedula,
            sno_personal.nomper AS nombre,
            sno_personal.apeper AS apellido,
            sno_personalnomina.descasicar AS cargo,
            sno_unidadadmin.desuniadm AS departamento
        FROM sno_personal, sno_personalnomina, sno_unidadadmin
        WHERE (
            sno_personal.cedper ILIKE $1 OR 
            sno_personal.nomper ILIKE $1 OR 
            sno_personal.apeper ILIKE $1 OR 
            sno_personalnomina.descasicar ILIKE $1 OR
            sno_unidadadmin.desuniadm ILIKE $1
        ) 
        AND sno_personal.estper = '1'
        AND sno_personalnomina.codper = sno_personal.codper 
        AND sno_personalnomina.codnom <= '0010' 
        AND sno_personalnomina.staper = '1'
        AND sno_personalnomina.minorguniadm = sno_unidadadmin.minorguniadm 
        AND sno_personalnomina.ofiuniadm = sno_unidadadmin.ofiuniadm 
        AND sno_personalnomina.uniuniadm = sno_unidadadmin.uniuniadm 
        AND sno_personalnomina.depuniadm = sno_unidadadmin.depuniadm 
        AND sno_personalnomina.prouniadm = sno_unidadadmin.prouniadm
        ORDER BY sno_personal.nomper, sno_personal.apeper
        LIMIT $2
      `;
      
      const searchPattern = `%${searchTerm}%`;
      const result = await client.query(query, [searchPattern, limit]);
      
      console.log(`✅ Encontrados ${result.rows.length} empleados`);
      
      return result.rows.map(row => ({
        cedula: row.cedula,
        nombre: row.nombre?.trim() || '',
        apellido: row.apellido?.trim() || '',
        nombre_completo: `${row.nombre?.trim() || ''} ${row.apellido?.trim() || ''}`.trim(),
        cargo: row.cargo?.trim() || '',
        departamento: row.departamento?.trim() || ''
      }));
      
    } catch (error) {
      console.error('❌ Error buscando empleados:', error);
      return [];
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  /**
   * Obtener estadísticas de la base de datos externa
   * @returns {Promise<Object>} Estadísticas
   */
  async getStats() {
    let client;
    try {
      client = await externalDb.connect();
      
      // Contar empleados activos
      const totalQuery = `
        SELECT COUNT(DISTINCT sno_personal.cedper) as total 
        FROM sno_personal, sno_personalnomina 
        WHERE sno_personal.estper = '1'
        AND sno_personalnomina.codper = sno_personal.codper 
        AND sno_personalnomina.codnom <= '0010' 
        AND sno_personalnomina.staper = '1'
      `;
      
      // Contar departamentos únicos
      const deptQuery = `
        SELECT COUNT(DISTINCT sno_unidadadmin.desuniadm) as departamentos 
        FROM sno_unidadadmin, sno_personalnomina, sno_personal
        WHERE sno_personalnomina.minorguniadm = sno_unidadadmin.minorguniadm 
        AND sno_personalnomina.ofiuniadm = sno_unidadadmin.ofiuniadm 
        AND sno_personalnomina.uniuniadm = sno_unidadadmin.uniuniadm 
        AND sno_personalnomina.depuniadm = sno_unidadadmin.depuniadm 
        AND sno_personalnomina.prouniadm = sno_unidadadmin.prouniadm
        AND sno_personalnomina.codper = sno_personal.codper
        AND sno_personal.estper = '1'
        AND sno_personalnomina.staper = '1'
      `;
      
      const [totalResult, deptResult] = await Promise.all([
        client.query(totalQuery),
        client.query(deptQuery)
      ]);
      
      return {
        total_empleados: parseInt(totalResult.rows[0].total) || 0,
        total_departamentos: parseInt(deptResult.rows[0].departamentos) || 0,
        conexion_activa: true
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return {
        total_empleados: 0,
        total_departamentos: 0,
        conexion_activa: false
      };
    } finally {
      if (client) {
        client.release();
      }
    }
  }
}

export default new EmployeeService();
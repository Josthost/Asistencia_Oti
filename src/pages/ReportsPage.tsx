import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart3, 
  Calendar, 
  FileDown, 
  AlertCircle, 
  Users 
} from 'lucide-react';

// Contexto y Servicios
import { useAuth } from '../context/AuthContext';
import { asistenciasAPI, employeesAPI } from '../services/api';

// Tipos y Utilidades
import { AsistenciaRecord, AttendanceRecord, Employee } from '../types';
import { 
  getCurrentWeekRange, 
  getFormattedDateRange, 
  getWeekDays, 
  getDayName 
} from '../utils/dateUtils';

// Tipo unificado
type UnifiedRecord = AsistenciaRecord | AttendanceRecord;

// Función auxiliar para fechas
const formatDateSafe = (dateString: string): string => {
  if (!dateString) return '';
  try {
    // Intenta limpiar la fecha (ej: "2023-10-10T00:00:00.000Z" -> "2023-10-10")
    return dateString.split('T')[0];
  } catch (e) {
    return dateString;
  }
};

const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  
  // Estado
  const [records, setRecords] = useState<UnifiedRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [weekRange, setWeekRange] = useState(getCurrentWeekRange());
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // ==========================================
  // CARGA DE DATOS
  // ==========================================
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const dateParams = {
        fecha_inicio: weekRange.startDate,
        fecha_fin: weekRange.endDate
      };

      const promises: Promise<any>[] = [
        asistenciasAPI.getTodasAsistencias(dateParams)
      ];

      // Intentar cargar empleados para mapear nombres si es necesario
      if (employeesAPI.getAll) {
        promises.push(employeesAPI.getAll());
      } else {
        promises.push(Promise.resolve([]));
      }

      const results = await Promise.all(promises);
      
      setRecords(results[0]);
      if (results[1]) setEmployees(results[1]);

    } catch (err: any) {
      console.error('Error cargando reportes:', err);
      setError(err.response?.data?.error || 'Error cargando datos del reporte');
    } finally {
      setIsLoading(false);
    }
  }, [weekRange]);

  useEffect(() => {
    if (user?.rol === 'admin' || user?.rol === 'supervisor') {
      loadData();
    }
  }, [loadData, user]);

  // ==========================================
  // SEGURIDAD
  // ==========================================
  if (user?.rol !== 'admin' && user?.rol !== 'supervisor') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="bg-red-50 p-6 rounded-full mb-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Acceso Denegado</h3>
        <p className="mt-2 text-gray-500 max-w-md">
          No tienes permisos suficientes para visualizar los reportes del sistema. Contacta a tu administrador.
        </p>
      </div>
    );
  }

  // ==========================================
  // PROCESAMIENTO DE DATOS
  // ==========================================
  
  // Helper para obtener fecha cruda de cualquier formato de registro
  const getRecordDate = (r: UnifiedRecord) => (r as any).fecha || (r as any).date;
  
  const getUserName = (r: UnifiedRecord): string => {
    const record = r as any;
    // 1. Si ya tiene nombre de usuario (SQL Backend)
    if (record.usuario) return record.usuario;
    // 2. Si tiene ID de empleado (Legacy/NoSQL), buscamos el nombre
    if (record.employeeId) {
      const emp = employees.find(e => String(e.id) === String(record.employeeId));
      if (emp && emp.name) return emp.name;
    }
    // 3. Fallback
    return 'Usuario Desconocido';
  };

  // 1. Estadísticas Diarias
  const weekDays = getWeekDays(weekRange.startDate);
  const attendanceByDay = weekDays.map(day => {
    const count = records.filter(r => getRecordDate(r) === day).length;
    return {
      date: day,
      dayName: getDayName(day).substring(0, 3), 
      count
    };
  });

  // 2. Top Usuarios
  const attendanceByUser: Record<string, number> = {};
  
  records.forEach(r => {
    const name = getUserName(r);
    attendanceByUser[name] = (attendanceByUser[name] || 0) + 1;
  });

  const topUsers = Object.entries(attendanceByUser)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const maxDaily = Math.max(...attendanceByDay.map(d => d.count), 1);
  const maxUser = Math.max(...topUsers.map(u => u.count), 1);

  // ==========================================
  // EXPORTACIÓN A CSV
  // ==========================================
  const handleExportCSV = () => {
    const headers = [
      'ID', 'Nombre', 'Cédula', 'Fecha', 'Día', 'Hora Entrada', 'Rol', 'Notas'
    ];

    const rows = records.map(r => {
      const anyR = r as any;
      // Obtenemos la fecha cruda
      const rawDate = getRecordDate(r);
      
      return [
        anyR.id,
        `"${getUserName(r)}"`,
        anyR.cedula || 'N/A',
        formatDateSafe(rawDate), // ✅ AQUÍ USAMOS LA FUNCIÓN (Solución del error)
        `"${getDayName(rawDate)}"`,
        anyR.hora_entrada || anyR.checkInTime,
        anyR.rol || 'empleado',
        `"${anyR.notas || ''}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const BOM = '\uFEFF'; 
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Reporte_Asistencia_${weekRange.startDate}_${weekRange.endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Reportes y Estadísticas</h1>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* GRID SUPERIOR: GRÁFICOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        
        {/* GRÁFICO 1: Barras Semanales */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
            <BarChart3 className="mr-2 h-5 w-5 text-blue-600" />
            Asistencia Semanal
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {getFormattedDateRange(weekRange.startDate, weekRange.endDate)}
          </p>
          
          <div className="h-64 flex items-end justify-between space-x-2">
            {attendanceByDay.map((day) => (
              <div key={day.date} className="flex flex-col items-center flex-1 group">
                 {/* Barra */}
                <div 
                  className="w-full bg-blue-100 rounded-t-md relative transition-all duration-500 group-hover:bg-blue-200"
                  style={{ height: '100%' }}
                >
                  <div 
                    className="absolute bottom-0 w-full bg-blue-600 rounded-t-md transition-all duration-500 group-hover:bg-blue-700"
                    style={{ 
                      height: `${maxDaily > 0 ? (day.count / maxDaily) * 100 : 0}%`,
                      minHeight: day.count > 0 ? '4px' : '0'
                    }}
                  ></div>
                  
                  {/* Tooltip flotante */}
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded transition-opacity whitespace-nowrap z-10">
                    {day.count} registros
                  </div>
                </div>
                
                {/* Etiquetas Eje X */}
                <div className="text-xs font-medium text-gray-600 mt-2 capitalize">
                  {day.dayName}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GRÁFICO 2: Top Empleados */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Users className="mr-2 h-5 w-5 text-green-600" />
            Top Asistencia
          </h2>
          
          {topUsers.length > 0 ? (
            <div className="space-y-5">
              {topUsers.map((user, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-700">{user.name}</span>
                    <span className="font-bold text-gray-900">{user.count} días</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-green-500 h-2.5 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${maxUser > 0 ? (user.count / maxUser) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 italic">
              No hay datos para mostrar esta semana
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN INFERIOR: CONTROLES Y EXPORTACIÓN */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center border-b pb-3">
          <Calendar className="mr-2 h-5 w-5 text-gray-600" />
          Generar Reporte Personalizado
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          {/* Inputs de Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
            <input
              type="date"
              value={weekRange.startDate}
              onChange={(e) => setWeekRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
            <input
              type="date"
              value={weekRange.endDate}
              onChange={(e) => setWeekRange(prev => ({ ...prev, endDate: e.target.value }))}
              min={weekRange.startDate}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Botón Exportar */}
          <div className="flex justify-end md:justify-start">
            <button
              onClick={handleExportCSV}
              disabled={records.length === 0}
              className={`w-full md:w-auto px-4 py-2 rounded-md flex items-center justify-center transition-colors ${
                records.length === 0 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
              }`}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Descargar CSV ({records.length})
            </button>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-gray-500">
          * El reporte incluye todos los registros dentro del rango de fechas seleccionado.
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
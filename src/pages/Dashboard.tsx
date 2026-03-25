import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Clock, 
  ClipboardCheck, 
  CalendarCheck, 
  AlertCircle, 
  Activity 
} from 'lucide-react';

// Componentes y Hooks
import DigitalClock from '../components/DigitalClock';
import { useAuth } from '../context/AuthContext';
import { asistenciasAPI, employeesAPI } from '../services/api';
import { AsistenciaRecord, AsistenciaStats, AttendanceRecord } from '../types';

// Función auxiliar para formatear fechas de forma segura (Del archivo 1)
const formatDateSafe = (dateString: string): string => {
  if (!dateString) return 'Fecha inválida';
  try {
    const [year, month, day] = dateString.split('-');
    if (!year || !month || !day) return dateString;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('es-ES', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    });
  } catch (error) {
    return dateString;
  }
};

// Tipo unificado para la tabla
type UnifiedRecord = AsistenciaRecord | AttendanceRecord;

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'admin' || user?.rol === 'supervisor';

  // Estado
  const [records, setRecords] = useState<UnifiedRecord[]>([]);
  const [personalStats, setPersonalStats] = useState<AsistenciaStats | null>(null);
  const [adminStats, setAdminStats] = useState<{
    total_empleados: number;
    total_departamentos: number;
    conexion_activa: boolean;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Carga de datos
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const promises: Promise<any>[] = [];

      if (isAdmin) {
        // ADMIN: Carga estadísticas globales y últimos registros de todos
        // Usamos employeesAPI.getStats para obtener conteos reales
        if (employeesAPI.getStats) {
             promises.push(employeesAPI.getStats());
        } else {
             // Fallback si no existe la función en la API aun
             promises.push(Promise.resolve({ total_empleados: 0, total_departamentos: 0, conexion_activa: true }));
        }
        
        // Cargar ultimas 5 asistencias globales
        // Nota: Pasamos un objeto vacío o parametros de paginacion si tu API lo soporta
        promises.push(asistenciasAPI.getTodasAsistencias({ limit: 5 })); 
      } else {
        // USUARIO: Carga estadísticas personales y sus últimos registros
        promises.push(asistenciasAPI.getEstadisticas());
        promises.push(asistenciasAPI.getMisAsistencias({ limit: 5 }));
      }

      const results = await Promise.all(promises);

      if (isAdmin) {
        setAdminStats(results[0]);
        setRecords(results[1]);
      } else {
        setPersonalStats(results[0]);
        setRecords(results[1]);
      }

    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Error cargando datos del dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadData();
    // Refrescar cada minuto para mantener el dashboard vivo
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Acción de registro rápido (Solo usuarios)
  const handleRegisterAttendance = async () => {
    try {
      await asistenciasAPI.registrar();
      await loadData(); // Recargar para actualizar tarjetas
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error registrando asistencia');
    }
  };

  if (isLoading && records.length === 0 && !personalStats && !adminStats) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      <DigitalClock />
      
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}
      
      {/* CTA: Botón de registro rápido (Solo si es usuario y NO ha marcado hoy) */}
      {!isAdmin && personalStats && !personalStats.registrado_hoy && (
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-blue-900 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                ¡No has registrado tu asistencia hoy!
              </h3>
              <p className="text-blue-700 text-sm mt-1">
                Registra tu entrada ahora para mantener tu historial al día.
              </p>
            </div>
            <button
              onClick={handleRegisterAttendance}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg transform active:scale-95"
            >
              Registrar Entrada
            </button>
          </div>
        </div>
      )}
      
      {/* GRID DE TARJETAS (Varía según rol) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {isAdmin ? (
          /* ================= VISTA ADMIN ================= */
          <>
            {/* Card 1: Total Empleados */}
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center border-l-4 border-blue-600">
              <div className="p-3 rounded-full bg-blue-50">
                <Users className="h-8 w-8 text-blue-800" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">Total Empleados</h2>
                <p className="text-2xl font-bold text-gray-800">
                  {adminStats?.total_empleados || 0}
                </p>
              </div>
            </div>

            {/* Card 2: Departamentos */}
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center border-l-4 border-indigo-500">
              <div className="p-3 rounded-full bg-indigo-50">
                <ClipboardCheck className="h-8 w-8 text-indigo-800" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">Departamentos</h2>
                <p className="text-2xl font-bold text-gray-800">
                  {adminStats?.total_departamentos || 0}
                </p>
              </div>
            </div>

            {/* Card 3: Estado Sistema */}
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center border-l-4 border-green-500">
              <div className="p-3 rounded-full bg-green-50">
                <Activity className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">Base de Datos</h2>
                <p className="text-lg font-bold text-gray-800">
                  {adminStats?.conexion_activa ? 'Conectado' : 'Error'}
                </p>
              </div>
            </div>

             {/* Card 4: Tu Rol */}
             <div className="bg-white rounded-lg shadow-md p-6 flex items-center border-l-4 border-purple-500">
              <div className="p-3 rounded-full bg-purple-50">
                <Users className="h-8 w-8 text-purple-800" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">Tu Rol</h2>
                <div>
                  <p className="text-lg font-bold text-gray-800 capitalize">{user?.rol}</p>
                  {user?.departamento && (
                    <p className="text-xs text-gray-500">{user.departamento}</p>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          /* ================= VISTA USUARIO ================= */
          <>
            {/* Card 1: Estado Hoy */}
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center border-l-4 border-[#273376]">
              <div className="p-3 rounded-full bg-[#f0f2f9]">
                <Clock className="h-8 w-8 text-[#273376]" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">Estado Hoy</h2>
                <p className={`text-2xl font-bold ${personalStats?.registrado_hoy ? 'text-green-600' : 'text-amber-600'}`}>
                  {personalStats?.registrado_hoy ? 'Registrado' : 'Pendiente'}
                </p>
              </div>
            </div>
            
            {/* Card 2: Asistencias Mes */}
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center border-l-4 border-yellow-400">
              <div className="p-3 rounded-full bg-yellow-50">
                <CalendarCheck className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">Este Mes</h2>
                <p className="text-2xl font-bold text-gray-800">
                  {personalStats?.asistencias_mes || 0}
                </p>
              </div>
            </div>
            
            {/* Card 3: Total Histórico */}
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center border-l-4 border-blue-400">
              <div className="p-3 rounded-full bg-blue-50">
                <ClipboardCheck className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">Total Registros</h2>
                <p className="text-2xl font-bold text-gray-800">
                  {personalStats?.total_asistencias || 0}
                </p>
              </div>
            </div>
            
            {/* Card 4: Rol */}
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center border-l-4 border-red-500">
              <div className="p-3 rounded-full bg-red-50">
                <Users className="h-8 w-8 text-red-700" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">Mi Rol</h2>
                <div>
                  <p className="text-lg font-bold text-gray-800 capitalize">{user?.rol}</p>
                  {user?.departamento && (
                    <p className="text-xs text-gray-500">{user.departamento}</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* TABLA DE ACTIVIDAD RECIENTE */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
          {isAdmin ? 'Actividad Reciente del Sistema' : 'Mi Actividad Reciente'}
        </h2>
        
        {records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {isAdmin && (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                  )}
                  {isAdmin && (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Departamento
                    </th>
                  )}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hora Entrada
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Detalles
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.map((record) => {
                  // Normalización de datos al vuelo usando 'as any' para compatibilidad
                  const r = record as any;
                  const fecha = r.fecha || r.date;
                  const hora = (r.hora_entrada || r.checkInTime || '').substring(0, 5);
                  const usuario = r.usuario || (r.employeeId ? 'Empleado #' + r.employeeId : 'Desconocido');
                  const rol = r.rol;
                  const notas = r.notas;
                  const departamento = r.departamento;

                  return (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {usuario}
                          </div>
                          {rol && (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              rol === 'admin' ? 'bg-red-100 text-red-800' :
                              rol === 'supervisor' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {rol}
                            </span>
                          )}
                        </td>
                      )}
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {departamento || '-'}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatDateSafe(fecha)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">
                          {hora}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {notas ? (
                          <span className="text-xs text-gray-500 italic max-w-[150px] truncate block" title={notas}>
                            📝 {notas}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No hay actividad reciente para mostrar.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
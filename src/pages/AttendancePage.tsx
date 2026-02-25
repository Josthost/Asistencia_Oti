import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

// Contextos y Servicios
import { useAuth } from '../context/AuthContext';
// Si el archivo api.ts está bien guardado, estos imports dejarán de estar en rojo
import { asistenciasAPI, employeesAPI } from '../services/api'; 

// Tipos
import { AsistenciaRecord, AsistenciaStats, Employee, AttendanceRecord } from '../types';

// Componentes
import AttendanceForm from '../components/AttendanceForm';
import AttendanceList from '../components/AttendanceList';

// Definimos un tipo unificado para manejar registros tanto del backend SQL como del frontend
type UnifiedRecord = AsistenciaRecord | AttendanceRecord;

const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  
  // Estado para los registros (acepta ambos tipos)
  const [records, setRecords] = useState<UnifiedRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<AsistenciaStats | null>(null);
  
  const [filterDate, setFilterDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Determinar si es modo Admin/Supervisor
  const isAdmin = user?.rol === 'admin' || user?.rol === 'supervisor';

  // ==========================================
  // CARGA DE DATOS
  // ==========================================
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Preparamos los parámetros tal como los pide tu API original (Objeto, no string)
      const dateParams = filterDate 
        ? { fecha_inicio: filterDate, fecha_fin: filterDate } 
        : undefined;

      const promises: Promise<any>[] = [];

      if (isAdmin) {
        // Carga datos para admin (Todos los registros + Lista de empleados)
        promises.push(asistenciasAPI.getTodasAsistencias(dateParams)); 
        
        // Intentamos cargar empleados. Si employeesAPI.getAll no existe en tu versión final,
        // puedes comentar esta línea y el setEmployees de abajo.
        if (employeesAPI.getAll) {
          promises.push(employeesAPI.getAll()); 
        } else {
          promises.push(Promise.resolve([])); // Fallback seguro
        }
      } else {
        // Carga datos para usuario normal (Mis registros + Mis estadísticas)
        promises.push(asistenciasAPI.getMisAsistencias(dateParams));
        promises.push(asistenciasAPI.getEstadisticas());
      }

      const results = await Promise.all(promises);

      if (isAdmin) {
        setRecords(results[0]);
        setEmployees(results[1]); // Asigna empleados (o array vacío si falló)
        setStats(null);
      } else {
        setRecords(results[0]);
        setStats(results[1]);
      }

    } catch (err: any) {
      console.error('Error cargando datos:', err);
      setError(err.response?.data?.error || err.message || 'Error conectando con el servidor');
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, filterDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ==========================================
  // HANDLERS (ACCIONES)
  // ==========================================

  // 1. Auto-Registro (Usuario normal)
  const handleSelfRegister = async () => {
    try {
      setError('');
      setSuccess('');
      await asistenciasAPI.registrar();
      setSuccess('¡Asistencia registrada exitosamente!');
      await loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al registrar asistencia');
    }
  };

  // 2. Registro Manual (Admin)
  const handleAdminSave = async (record: AttendanceRecord) => {
    try {
      setError('');
      setSuccess('');
      
      // Verificamos si la función existe antes de llamarla
      if (!asistenciasAPI.registrarManual) {
        throw new Error("La función registrarManual no está definida en la API");
      }

      // Enviamos los datos al backend
      await asistenciasAPI.registrarManual({
        usuario_id: record.employeeId, 
        fecha: record.date,
        hora_entrada: record.checkInTime,
        notas: record.notes
      });

      setSuccess('Registro manual guardado correctamente');
      await loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Error al guardar el registro manual');
    }
  };

  // 3. Eliminar Registro
  const handleDeleteRecord = async (recordId: number | string) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este registro permanentemente?')) return;

    try {
      setError('');
      
      if (!asistenciasAPI.eliminar) {
         throw new Error("La función eliminar no está definida en la API");
      }

      await asistenciasAPI.eliminar(recordId);
      setSuccess('Registro eliminado');
      await loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'No se pudo eliminar el registro');
    }
  };

  // ==========================================
  // FILTRADO VISUAL (Respaldo)
  // ==========================================
  // Aunque ya filtramos en el backend, esto ayuda a refrescar la vista si cambia el estado local
  const displayRecords = filterDate 
    ? records.filter(r => {
        // Usamos 'as any' para acceder a propiedades dinámicas sin error de TS
        // Esto verifica si existe 'fecha' (Backend SQL) o 'date' (Frontend Local)
        const fechaRegistro = (r as any).fecha || (r as any).date; 
        return fechaRegistro === filterDate;
      })
    : records;

  // ==========================================
  // RENDER
  // ==========================================
  if (isLoading && records.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {isAdmin ? 'Gestión de Asistencias' : 'Mi Asistencia'}
        </h1>
        <button 
          onClick={loadData} 
          className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
          title="Recargar datos"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>
      
      {/* Mensajes de error/éxito */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}
      
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4 flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          <span className="text-green-700 text-sm">{success}</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Formulario */}
        <div className="lg:col-span-1">
          <AttendanceForm 
            // Props Usuario
            onRegister={handleSelfRegister}
            stats={stats}
            isRegisteredToday={stats?.registrado_hoy || false}
            // Props Admin
            employees={isAdmin ? employees : undefined}
            onSave={handleAdminSave}
          />
        </div>
        
        {/* Columna Derecha: Tabla */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-lg font-semibold text-gray-800">Historial</h2>
              
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full sm:w-auto"
                />
                {filterDate && (
                  <button
                    onClick={() => setFilterDate('')}
                    className="text-sm text-red-500 hover:text-red-700 px-2"
                  >
                    Borrar
                  </button>
                )}
              </div>
            </div>
            
            <AttendanceList
              records={displayRecords}
              employees={employees}
              onDelete={handleDeleteRecord}
              canDelete={isAdmin}
            />
            
            <div className="mt-4 text-xs text-gray-400 text-right">
              Registros visualizados: {displayRecords.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
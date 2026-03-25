import React from 'react';
import { ClipboardList, Trash, AlertCircle } from 'lucide-react';
// Importamos tipos de ambos orígenes (asegúrate de que existan en types.ts)
import { AsistenciaRecord, AttendanceRecord, Employee } from '../types';
import { getDayName } from '../utils/dateUtils';

// Definimos un tipo unión para aceptar ambos formatos de registro
type UnifiedRecord = AsistenciaRecord | AttendanceRecord;

interface AttendanceListProps {
  records: UnifiedRecord[];
  employees?: Employee[]; // Opcional: Solo necesario si usas el formato del archivo 2
  onDelete: (id: number | string) => void;
  canDelete?: boolean;
}

const AttendanceList: React.FC<AttendanceListProps> = ({ 
  records, 
  employees = [], 
  onDelete, 
  canDelete = true // Por defecto permitimos borrar si no se especifica
}) => {

  // ==========================================
  // HELPERS DE FORMATO
  // ==========================================
  const formatTime = (timeString?: string) => {
    if (!timeString) return '--:--';
    // Si viene formato largo HH:MM:SS, cortamos a HH:MM
    return timeString.length > 5 ? timeString.substring(0, 5) : timeString;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Fecha inválida';
    try {
      const [year, month, day] = dateString.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (isNaN(date.getTime())) return dateString;
      
      return date.toLocaleDateString('es-ES', {
        year: 'numeric', month: '2-digit', day: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  // ==========================================
  // NORMALIZADOR DE DATOS (CORREGIDO)
  // ==========================================
  const getRenderData = (record: UnifiedRecord) => {
    // CASO 1: Formato Archivo 1 (Datos planos - tiene campo 'usuario')
    if ('usuario' in record) {
      return {
        id: record.id,
        name: record.usuario || 'Usuario',
        cedula: record.cedula,
        date: record.fecha,
        time: record.hora_entrada,
        role: record.rol, 
        notes: null
      };
    } 
    
    // CASO 2: Formato Archivo 2 (Requiere búsqueda en employees)
    // CORRECCIÓN: Usamos 'as AttendanceRecord' para que TypeScript entienda el tipo
    const r2 = record as AttendanceRecord;
    const emp = employees.find(e => e.id === r2.employeeId);
    
    return {
      id: r2.id,
      name: emp ? emp.name : 'Empleado Desconocido',
      cedula: emp ? emp.cedula : 'N/A',
      date: r2.date,
      time: r2.checkInTime,
      role: null,
      notes: r2.notes
    };
  };

  // ==========================================
  // RENDER: ESTADO VACÍO
  // ==========================================
  if (records.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Sin registros de asistencia</h3>
        <p className="mt-1 text-sm text-gray-500">
          No hay registros para mostrar en el período seleccionado.
        </p>
      </div>
    );
  }

  // ==========================================
  // RENDER: TABLA
  // ==========================================
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Empleado
              </th>
              {canDelete && (
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Departamento
                </th>
              )}
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cédula
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hora
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Detalles
              </th>
              {canDelete && (
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.map((rawRecord) => {
              const data = getRenderData(rawRecord);
              
              return (
                <tr key={data.id} className="hover:bg-gray-50 transition-colors">
                  {/* Nombre y Rol */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{data.name}</span>
                      {data.role && (
                        <span className={`mt-1 inline-flex w-fit px-2 py-0.5 text-xs font-semibold rounded-full ${
                          data.role === 'admin' ? 'bg-red-100 text-red-800' :
                          data.role === 'supervisor' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {data.role}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Departamento (solo para admins) */}
                  {canDelete && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(rawRecord as any).departamento || '-'}
                    </td>
                  )}

                  {/* Cédula */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {data.cedula}
                  </td>

                  {/* Fecha y Día */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(data.date)}</div>
                    <div className="text-xs text-gray-500 capitalize">
                      {data.date ? getDayName(data.date) : ''}
                    </div>
                  </td>

                  {/* Hora */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {formatTime(data.time)}
                  </td>

                  {/* Notas / Detalles */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {data.notes ? (
                      <span className="flex items-center text-gray-700" title={data.notes}>
                        <AlertCircle className="w-3 h-3 mr-1 text-gray-400" />
                        {data.notes.length > 20 ? data.notes.substring(0, 20) + '...' : data.notes}
                      </span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>

                  {/* Acciones */}
                  {canDelete && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          console.log('🗑️ Eliminando registro:', data.id);
                          onDelete(data.id);
                        }}
                        className="text-red-600 hover:text-red-900 transition-colors p-2 rounded-full hover:bg-red-50"
                        aria-label="Eliminar registro"
                        title="Eliminar registro"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceList;
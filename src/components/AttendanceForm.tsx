import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  TrendingUp, 
  CheckCircle, 
  User, 
  Save, 
  AlertCircle 
} from 'lucide-react';
// Asegúrate de que estos tipos coincidan con los de tu proyecto
import { AsistenciaStats, Employee, AttendanceRecord } from '../types';

// ==========================================
// UTILIDADES
// ==========================================
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const formatTime = (date: Date): string => {
  return date.toTimeString().split(' ')[0].substring(0, 5);
};

// ==========================================
// INTERFACES
// ==========================================
interface AttendanceFormProps {
  // PROPS PARA MODO USUARIO (Auto-servicio)
  onRegister?: () => Promise<void>;
  stats?: AsistenciaStats | null;
  isRegisteredToday?: boolean;

  // PROPS PARA MODO ADMIN (Gestión empleados)
  employees?: Employee[];
  onSave?: (record: AttendanceRecord) => void;
}

const AttendanceForm: React.FC<AttendanceFormProps> = ({ 
  // User Props
  onRegister, 
  stats, 
  isRegisteredToday = false,
  // Admin Props
  employees, 
  onSave 
}) => {
  // Detectar modo: Si hay lista de empleados, es MODO ADMIN
  const isAdminMode = employees && employees.length > 0;

  // ==========================================
  // ESTADOS
  // ==========================================
  
  // Estado para MODO USUARIO
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Estado para MODO ADMIN
  const [adminForm, setAdminForm] = useState({
    employeeId: '',
    date: formatDate(new Date()),
    time: formatTime(new Date()),
    notes: ''
  });
  const [adminErrors, setAdminErrors] = useState<Record<string, string>>({});

  // Efecto del reloj
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ==========================================
  // LÓGICA MODO ADMIN
  // ==========================================
  const handleSetCurrentTime = () => {
    const now = new Date();
    setAdminForm(prev => ({ ...prev, time: formatTime(now) }));
  };

  const validateAdmin = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!adminForm.employeeId) newErrors.employeeId = 'Por favor seleccione un empleado';
    if (!adminForm.date) newErrors.date = 'La fecha es requerida';
    if (!adminForm.time) newErrors.time = 'La hora es requerida';
    setAdminErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAdmin() || !onSave) return;

    const record: AttendanceRecord = {
      id: crypto.randomUUID(),
      employeeId: adminForm.employeeId,
      date: adminForm.date,
      checkInTime: adminForm.time,
      notes: adminForm.notes.trim() || undefined
    };

    onSave(record);
    
    // Resetear formulario
    setAdminForm({
      employeeId: '',
      date: formatDate(new Date()),
      time: formatTime(new Date()),
      notes: ''
    });
    setAdminErrors({});
  };

  // ==========================================
  // LÓGICA MODO USUARIO
  // ==========================================
  const handleUserRegister = async () => {
    if (!onRegister) return;
    setIsLoadingUser(true);
    try {
      await onRegister();
    } finally {
      setIsLoadingUser(false);
    }
  };

  const getUserDateDisplay = () => {
    return {
      dateStr: currentTime.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      timeStr: currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
  };

  // ==========================================
  // RENDERIZADO
  // ==========================================

  // 1. VISTA DE ADMINISTRADOR
  if (isAdminMode && employees) {
    return (
      <form onSubmit={handleAdminSubmit} className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <User className="mr-2 h-5 w-5 text-blue-600" />
          Registrar Asistencia (Manual)
        </h2>
        
        {/* Selector Empleado */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Empleado *</label>
          <select
            value={adminForm.employeeId}
            onChange={(e) => setAdminForm({...adminForm, employeeId: e.target.value})}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              adminErrors.employeeId ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Seleccione un empleado</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} {emp.cedula ? `(${emp.cedula})` : ''}
              </option>
            ))}
          </select>
          {adminErrors.employeeId && <p className="text-red-500 text-xs mt-1">{adminErrors.employeeId}</p>}
        </div>
        
        {/* Fecha */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
          <input
            type="date"
            value={adminForm.date}
            onChange={(e) => setAdminForm({...adminForm, date: e.target.value})}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              adminErrors.date ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {adminErrors.date && <p className="text-red-500 text-xs mt-1">{adminErrors.date}</p>}
        </div>
        
        {/* Hora */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Entrada *</label>
          <div className="flex space-x-2">
            <input
              type="time"
              value={adminForm.time}
              onChange={(e) => setAdminForm({...adminForm, time: e.target.value})}
              className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                adminErrors.time ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <button
              type="button"
              onClick={handleSetCurrentTime}
              className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-200"
            >
              Ahora
            </button>
          </div>
          {adminErrors.time && <p className="text-red-500 text-xs mt-1">{adminErrors.time}</p>}
        </div>
        
        {/* Notas */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
          <textarea
            value={adminForm.notes}
            onChange={(e) => setAdminForm({...adminForm, notes: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Guardar Registro
          </button>
        </div>
      </form>
    );
  }

  // 2. VISTA DE USUARIO NORMAL
  const { dateStr, timeStr } = getUserDateDisplay();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <Clock className="mr-2 h-5 w-5 text-blue-600" />
          Registrar Mi Asistencia
        </h2>
        
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Fecha actual:</div>
          <div className="font-medium text-gray-800 capitalize">{dateStr}</div>
          <div className="text-sm text-gray-600 mt-2 mb-1">Hora actual:</div>
          <div className="font-medium text-gray-800">{timeStr}</div>
        </div>
        
        {isRegisteredToday ? (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-green-700 font-medium">Ya registraste tu asistencia hoy</span>
          </div>
        ) : (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center">
             <AlertCircle className="h-5 w-5 text-blue-500 mr-2" />
            <span className="text-blue-700">Haz clic para registrar tu entrada</span>
          </div>
        )}
        
        <button
          onClick={handleUserRegister}
          disabled={isLoadingUser || isRegisteredToday}
          className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
            isRegisteredToday
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : isLoadingUser
              ? 'bg-blue-400 text-white cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isLoadingUser ? 'Registrando...' : isRegisteredToday ? 'Asistencia Ya Registrada' : 'Registrar Asistencia'}
        </button>
      </div>
      
      {/* Estadísticas */}
      {stats && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
            Mis Estadísticas
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Este mes:</span>
              <span className="font-semibold text-gray-800">{stats.asistencias_mes} días</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total registros:</span>
              <span className="font-semibold text-gray-800">{stats.total_asistencias}</span>
            </div>
            <div className="pt-2 border-t flex items-center">
              <Calendar className="h-4 w-4 text-blue-500 mr-2" />
              <span className="text-sm text-gray-600">
                {isRegisteredToday ? 'Estado: Completado' : 'Estado: Pendiente'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceForm;
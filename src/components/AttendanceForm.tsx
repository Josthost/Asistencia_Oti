import React, { useState, useEffect } from 'react';
import { Employee, AttendanceRecord } from '../types';
import { formatDate, formatTime } from '../utils/dateUtils';

interface AttendanceFormProps {
  employees: Employee[];
  onSave: (record: AttendanceRecord) => void;
}

const AttendanceForm: React.FC<AttendanceFormProps> = ({ employees, onSave }) => {
  const [employeeId, setEmployeeId] = useState('');
  const [date, setDate] = useState(formatDate(new Date()));
  const [checkInTime, setCheckInTime] = useState(formatTime(new Date()));
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!employeeId) {
      newErrors.employeeId = 'Por favor seleccione un empleado';
    }
    
    if (!date) {
      newErrors.date = 'La fecha es requerida';
    }
    
    if (!checkInTime) {
      newErrors.checkInTime = 'La hora de entrada es requerida';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    const record: AttendanceRecord = {
      id: crypto.randomUUID(),
      employeeId,
      date,
      checkInTime,
      notes: notes.trim() || undefined
    };
    
    onSave(record);
    resetForm();
  };
  
  const resetForm = (): void => {
    setEmployeeId('');
    setDate(formatDate(new Date()));
    setCheckInTime(formatTime(new Date()));
    setNotes('');
    setErrors({});
  };
  
  const handleSetCurrentTime = (): void => {
    const now = new Date();
    setCheckInTime(formatTime(now));
  };
  
  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Registrar Asistencia</h2>
      
      <div className="mb-4">
        <label htmlFor="employee" className="block text-sm font-medium text-gray-700 mb-1">
          Empleado *
        </label>
        <select
          id="employee"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
            errors.employeeId ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Seleccione un empleado</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.name} ({employee.cedula})
            </option>
          ))}
        </select>
        {errors.employeeId && (
          <p className="text-red-500 text-xs mt-1">{errors.employeeId}</p>
        )}
      </div>
      
      <div className="mb-4">
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
          Fecha *
        </label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
            errors.date ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
      </div>
      
      <div className="mb-4">
        <label htmlFor="checkInTime" className="block text-sm font-medium text-gray-700 mb-1">
          Hora de Entrada *
        </label>
        <div className="flex space-x-2">
          <input
            type="time"
            id="checkInTime"
            value={checkInTime}
            onChange={(e) => setCheckInTime(e.target.value)}
            className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              errors.checkInTime ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          <button
            type="button"
            onClick={handleSetCurrentTime}
            className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
          >
            Ahora
          </button>
        </div>
        {errors.checkInTime && (
          <p className="text-red-500 text-xs mt-1">{errors.checkInTime}</p>
        )}
      </div>
      
      <div className="mb-6">
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notas
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          rows={3}
        />
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
        >
          Registrar Asistencia
        </button>
      </div>
    </form>
  );
};

export default AttendanceForm;
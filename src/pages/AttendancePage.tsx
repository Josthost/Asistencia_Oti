import React, { useState, useEffect } from 'react';
import AttendanceForm from '../components/AttendanceForm';
import AttendanceList from '../components/AttendanceList';
import { AttendanceRecord, Employee } from '../types';
import { getEmployees, getAttendanceRecords, saveAttendanceRecord, deleteAttendanceRecord } from '../utils/storage';
import { formatDate } from '../utils/dateUtils';

const AttendancePage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [filterDate, setFilterDate] = useState(formatDate(new Date()));
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = () => {
    setEmployees(getEmployees());
    setRecords(getAttendanceRecords());
  };
  
  const handleSaveRecord = (record: AttendanceRecord) => {
    saveAttendanceRecord(record);
    loadData();
  };
  
  const handleDeleteRecord = (recordId: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este registro de asistencia?')) {
      deleteAttendanceRecord(recordId);
      loadData();
    }
  };
  
  const filteredRecords = records.filter(
    record => filterDate === '' || record.date === filterDate
  );
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Asistencia</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <AttendanceForm
            employees={employees}
            onSave={handleSaveRecord}
          />
        </div>
        
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Registros de Asistencia</h2>
            
            <div className="mb-4">
              <label htmlFor="filter-date" className="block text-sm font-medium text-gray-700 mb-1">
                Filtrar por Fecha
              </label>
              <input
                type="date"
                id="filter-date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
              {filterDate && (
                <button
                  onClick={() => setFilterDate('')}
                  className="ml-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  Limpiar filtro
                </button>
              )}
            </div>
            
            <AttendanceList
              records={filteredRecords}
              employees={employees}
              onDelete={handleDeleteRecord}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
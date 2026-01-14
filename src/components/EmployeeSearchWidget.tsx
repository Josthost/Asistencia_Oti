import React, { useState } from 'react';
import { employeesAPI } from '../services/api';
import { Search, Users, Database } from 'lucide-react';

interface EmployeeSearchWidgetProps {
  onEmployeeSelect?: (employee: any) => void;
}

const EmployeeSearchWidget: React.FC<EmployeeSearchWidgetProps> = ({ onEmployeeSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [stats, setStats] = useState<{
    total_empleados: number;
    total_departamentos: number;
    conexion_activa: boolean;
  } | null>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      return;
    }

    setIsSearching(true);
    try {
      const result = await employeesAPI.buscar(searchTerm);
      setResults(result.empleados);
    } catch (error) {
      console.error('Error buscando empleados:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await employeesAPI.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  React.useEffect(() => {
    loadStats();
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Database className="mr-2 h-5 w-5 text-blue-600" />
          Base de Datos Externa
        </h3>
        {stats && (
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center">
              <Users className="mr-1 h-4 w-4" />
              {stats.total_empleados} empleados
            </span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              stats.conexion_activa 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {stats.conexion_activa ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
        )}
      </div>

      <div className="flex space-x-2 mb-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Buscar por cédula, nombre, departamento..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={isSearching || !searchTerm.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSearching ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {results.map((employee, index) => (
            <div
              key={index}
              className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onEmployeeSelect?.(employee)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">{employee.nombre_completo}</h4>
                  <p className="text-sm text-gray-600">Cédula: {employee.cedula}</p>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>{employee.departamento}</p>
                  <p>{employee.cargo}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {results.length === 0 && searchTerm && !isSearching && (
        <p className="text-gray-500 text-center py-4">
          No se encontraron empleados con ese término de búsqueda
        </p>
      )}
    </div>
  );
};

export default EmployeeSearchWidget;
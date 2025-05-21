import React, { useState, useEffect } from 'react';
import { Employee } from '../types';
import EmployeeList from '../components/EmployeeList';
import EmployeeForm from '../components/EmployeeForm';
import { getEmployees, saveEmployee, deleteEmployee } from '../utils/storage';
import { UserPlus } from 'lucide-react';

const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    loadEmployees();
  }, []);
  
  const loadEmployees = () => {
    const loadedEmployees = getEmployees();
    setEmployees(loadedEmployees);
  };
  
  const handleSaveEmployee = (employee: Employee) => {
    saveEmployee(employee);
    setShowForm(false);
    setEditingEmployee(undefined);
    loadEmployees();
  };
  
  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };
  
  const handleDeleteEmployee = (employeeId: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este empleado?')) {
      deleteEmployee(employeeId);
      loadEmployees();
    }
  };
  
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingEmployee(undefined);
  };
  
  const filteredEmployees = employees.filter(employee => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      employee.name.toLowerCase().includes(searchTermLower) ||
      employee.cedula.toLowerCase().includes(searchTermLower) ||
      (employee.department && employee.department.toLowerCase().includes(searchTermLower)) ||
      (employee.position && employee.position.toLowerCase().includes(searchTermLower))
    );
  });
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Empleados</h1>
        
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Agregar Empleado
          </button>
        )}
      </div>
      
      {showForm ? (
        <div className="mb-6">
          <EmployeeForm
            employee={editingEmployee}
            onSave={handleSaveEmployee}
            onCancel={handleCancelForm}
          />
        </div>
      ) : (
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar empleados..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
            <span className="absolute right-3 top-2 text-gray-400">🔍</span>
          </div>
        </div>
      )}
      
      <EmployeeList
        employees={filteredEmployees}
        onEdit={handleEditEmployee}
        onDelete={handleDeleteEmployee}
      />
    </div>
  );
};

export default EmployeesPage;
import React, { useState, useEffect } from 'react';
import { Employee } from '../types';

interface EmployeeFormProps {
  employee?: Employee;
  onSave: (employee: Employee) => void;
  onCancel: () => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ employee, onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [cedula, setCedula] = useState('');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (employee) {
      setName(employee.name);
      setCedula(employee.cedula);
      setDepartment(employee.department || '');
      setPosition(employee.position || '');
    }
  }, [employee]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    
    if (!cedula.trim()) {
      newErrors.cedula = 'La cédula es requerida';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    const updatedEmployee: Employee = {
      id: employee?.id || crypto.randomUUID(),
      name: name.trim(),
      cedula: cedula.trim(),
      department: department.trim() || undefined,
      position: position.trim() || undefined
    };
    
    onSave(updatedEmployee);
    resetForm();
  };

  const resetForm = (): void => {
    setName('');
    setCedula('');
    setDepartment('');
    setPosition('');
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        {employee ? 'Editar Empleado' : 'Agregar Nuevo Empleado'}
      </h2>
      
      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre Completo *
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>
      
      <div className="mb-4">
        <label htmlFor="cedula" className="block text-sm font-medium text-gray-700 mb-1">
          Cédula *
        </label>
        <input
          type="text"
          id="cedula"
          value={cedula}
          onChange={(e) => setCedula(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
            errors.cedula ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.cedula && <p className="text-red-500 text-xs mt-1">{errors.cedula}</p>}
      </div>
      
      <div className="mb-4">
        <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
          Departamento
        </label>
        <input
          type="text"
          id="department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        />
      </div>
      
      <div className="mb-6">
        <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
          Cargo
        </label>
        <input
          type="text"
          id="position"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        />
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Guardar
        </button>
      </div>
    </form>
  );
};

export default EmployeeForm;
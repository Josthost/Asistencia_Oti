import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI, employeesAPI } from '../services/api';
import { ClipboardCheck, User, Lock, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    cedula: '',
    usuario: '',
    password: '',
    confirmPassword: '',
    rol: 'empleado' as 'admin' | 'empleado' | 'supervisor'
  });
  const [employeeData, setEmployeeData] = useState<{
    nombre?: string;
    apellido?: string;
    departamento?: string;
    cargo?: string;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Si cambió la cédula, limpiar datos del empleado
    if (name === 'cedula') {
      setEmployeeData(null);
      setSearchMessage('');
    }
  };

  const validateForm = () => {
    if (!formData.cedula || !formData.usuario || !formData.password) {
      setError('Todos los campos son requeridos');
      return false;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    if (!/^\d+$/.test(formData.cedula)) {
      setError('La cédula debe contener solo números');
      return false;
    }

    return true;
  };

  const handleSearchEmployee = async () => {
    if (!formData.cedula || formData.cedula.length < 6) {
      setSearchMessage('Ingrese una cédula válida (mínimo 6 dígitos)');
      return;
    }

    setIsSearching(true);
    setSearchMessage('Buscando empleado...');
    setEmployeeData(null);

    try {
      const result = await employeesAPI.buscarPorCedula(formData.cedula);
      
      if (result.found && result.empleado) {
        setEmployeeData({
          nombre: result.empleado.nombre,
          apellido: result.empleado.apellido,
          departamento: result.empleado.departamento,
          cargo: result.empleado.cargo
        });
        setSearchMessage(`✅ Empleado encontrado: ${result.empleado.nombre_completo}`);
        
        // Auto-generar usuario basado en nombre y apellido
        const usuarioSugerido = `${result.empleado.nombre.toLowerCase()}.${result.empleado.apellido.toLowerCase()}`.replace(/\s+/g, '');
        setFormData(prev => ({
          ...prev,
          usuario: usuarioSugerido
        }));
      } else {
        setSearchMessage('❌ No se encontró empleado con esa cédula');
      }
    } catch (error: any) {
      console.error('Error buscando empleado:', error);
      setSearchMessage('⚠️ Error al buscar empleado. Puede continuar manualmente.');
    } finally {
      setIsSearching(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await authAPI.register({
        cedula: parseInt(formData.cedula),
        usuario: formData.usuario,
        password: formData.password,
        rol: formData.rol
      });

      setSuccess('Usuario registrado exitosamente. Redirigiendo al login...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err: any) {
      setError(err.response?.data?.error || 'Error en el registro');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <ClipboardCheck className="h-12 w-12" style={{ color: '#FFC907' }} />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold" style={{ color: '#273376' }}>
            Registro de Usuario
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Crea tu cuenta para acceder al sistema
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              <span className="text-green-700 text-sm">{success}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="cedula" className="block text-sm font-medium text-gray-700">
                Cédula
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="cedula"
                  name="cedula"
                  type="text"
                  required
                  value={formData.cedula}
                  onChange={handleChange}
                  className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Ingresa tu cédula"
                />
              </div>
              <div className="mt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={handleSearchEmployee}
                  disabled={isSearching || !formData.cedula}
                  className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSearching ? 'Buscando...' : 'Buscar Datos'}
                </button>
              </div>
              {searchMessage && (
                <p className={`text-xs mt-1 ${
                  searchMessage.includes('✅') ? 'text-green-600' : 
                  searchMessage.includes('❌') ? 'text-red-600' : 
                  'text-blue-600'
                }`}>
                  {searchMessage}
                </p>
              )}
            </div>

            {/* Mostrar datos encontrados */}
            {employeeData && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-green-800 mb-2">Datos encontrados:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-green-700">
                  <div><strong>Nombre:</strong> {employeeData.nombre}</div>
                  <div><strong>Apellido:</strong> {employeeData.apellido}</div>
                  <div><strong>Departamento:</strong> {employeeData.departamento}</div>
                  <div><strong>Cargo:</strong> {employeeData.cargo}</div>
                </div>
              </div>
            )}
            <div>
              <label htmlFor="usuario" className="block text-sm font-medium text-gray-700">
                Usuario
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="usuario"
                  name="usuario"
                  type="text"
                  required
                  value={formData.usuario}
                  onChange={handleChange}
                  className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Elige un nombre de usuario"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar Contraseña
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Repite tu contraseña"
                />
              </div>
            </div>

            <div>
              <label htmlFor="rol" className="block text-sm font-medium text-gray-700">
                Rol
              </label>
              <select
                id="rol"
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="empleado">Empleado</option>
                <option value="supervisor">Supervisor</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                background: isLoading ? '#9CA3AF' : 'linear-gradient(135deg, #273376 0%, #1f2a5e 100%)'
              }}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Registrarse'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link
                to="/login"
                className="font-medium hover:underline"
                style={{ color: '#273376' }}
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI, employeesAPI } from '../services/api';
import { ClipboardCheck, User, Lock, CreditCard, AlertCircle, CheckCircle, Search, UserCheck, Building, Briefcase } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    cedula: '',
    usuario: '',
    password: '',
    confirmPassword: '',
    departamento: '',
    cargo: '',
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
  const [dataFound, setDataFound] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  // Función para determinar el rol basado en el cargo
  const determineRole = (cargo: string): 'admin' | 'supervisor' | 'empleado' => {
    const cargoLower = cargo.toLowerCase();
    
    // Roles de administrador
    const adminRoles = [
      'director', 'gerente general', 'administrador', 'jefe de recursos humanos',
      'coordinador general', 'superintendente', 'gerente', 'director general'
    ];
    
    // Roles de supervisor
    const supervisorRoles = [
      'supervisor', 'jefe', 'coordinador', 'encargado', 'responsable',
      'líder', 'subjefe', 'asistente de gerencia', 'coordinador de área'
    ];
    
    if (adminRoles.some(role => cargoLower.includes(role))) {
      return 'admin';
    }
    
    if (supervisorRoles.some(role => cargoLower.includes(role))) {
      return 'supervisor';
    }
    
    return 'empleado';
  };

  // Función para generar usuario sin acentos
  const generateUsername = (nombre: string, apellido: string): string => {
    const removeAccents = (str: string) => {
      return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };
    
    const cleanNombre = removeAccents(nombre.toLowerCase().trim());
    const cleanApellido = removeAccents(apellido.toLowerCase().trim());
    
    return `${cleanNombre}.${cleanApellido}`.replace(/\s+/g, '');
  };

  const handleCedulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Solo números
    setFormData({ ...formData, cedula: value });
    
    // Limpiar datos si cambia la cédula
    if (dataFound) {
      setDataFound(false);
      setEmployeeData(null);
      setSearchMessage('');
      setFormData(prev => ({
        ...prev,
        usuario: '',
        departamento: '',
        cargo: '',
        rol: 'empleado'
      }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSearchEmployee = async () => {
    if (!formData.cedula || formData.cedula.length < 6) {
      setSearchMessage('Ingrese una cédula válida (mínimo 6 dígitos)');
      return;
    }

    setIsSearching(true);
    setSearchMessage('Buscando empleado...');
    setEmployeeData(null);
    setDataFound(false);

    try {
      const result = await employeesAPI.buscarPorCedula(formData.cedula);
      
      if (result.found && result.empleado) {
        const empleado = result.empleado;
        setEmployeeData(empleado);
        setDataFound(true);
        setSearchMessage(`✅ Empleado encontrado: ${empleado.nombre_completo}`);
        
        // Generar usuario automáticamente
        const usuarioGenerado = generateUsername(empleado.nombre, empleado.apellido);
        
        // Determinar rol automáticamente
        const rolAsignado = determineRole(empleado.cargo);
        
        // Actualizar formulario con datos encontrados
        setFormData(prev => ({
          ...prev,
          usuario: usuarioGenerado,
          departamento: empleado.departamento,
          cargo: empleado.cargo,
          rol: rolAsignado
        }));
      } else {
        setSearchMessage('❌ No se encontró empleado con esa cédula en la base de datos externa');
        setDataFound(false);
      }
    } catch (error: any) {
      console.error('Error buscando empleado:', error);
      setSearchMessage('⚠️ Error al conectar con la base de datos externa');
      setDataFound(false);
    } finally {
      setIsSearching(false);
    }
  };

  const validateForm = () => {
    if (!formData.cedula || !formData.password || !formData.confirmPassword) {
      setError('Cédula y contraseñas son requeridas');
      return false;
    }

    if (!dataFound) {
      setError('Debe buscar y encontrar los datos del empleado primero');
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

    return true;
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

  const getRoleBadgeColor = (rol: string) => {
    switch (rol) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'supervisor': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getRoleLabel = (rol: string) => {
    switch (rol) {
      case 'admin': return 'Administrador';
      case 'supervisor': return 'Supervisor';
      default: return 'Empleado';
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
            Ingresa tu cédula para obtener tus datos automáticamente
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
            {/* Campo Cédula - EDITABLE */}
            <div>
              <label htmlFor="cedula" className="block text-sm font-medium text-gray-700">
                Cédula de Identidad *
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
                  onChange={handleCedulaChange}
                  disabled={dataFound}
                  className={`appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    dataFound ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Ingresa tu cédula"
                />
              </div>
              
              {/* Botón de búsqueda */}
              <div className="mt-2">
                <button
                  type="button"
                  onClick={handleSearchEmployee}
                  disabled={isSearching || !formData.cedula || dataFound}
                  className="w-full flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  <Search className="h-4 w-4 mr-2" />
                  {isSearching ? 'Buscando...' : dataFound ? 'Datos Encontrados' : 'Buscar Datos del Empleado'}
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

            {/* Campo Usuario - NO EDITABLE */}
            <div>
              <label htmlFor="usuario" className="block text-sm font-medium text-gray-700">
                Usuario (Generado Automáticamente)
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="usuario"
                  name="usuario"
                  type="text"
                  value={formData.usuario}
                  disabled
                  className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 bg-gray-100 text-gray-500 rounded-md cursor-not-allowed sm:text-sm"
                  placeholder="Se generará automáticamente"
                />
              </div>
            </div>

            {/* Campo Departamento - NO EDITABLE */}
            <div>
              <label htmlFor="departamento" className="block text-sm font-medium text-gray-700">
                Departamento
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="departamento"
                  name="departamento"
                  type="text"
                  value={formData.departamento}
                  disabled
                  className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 bg-gray-100 text-gray-500 rounded-md cursor-not-allowed sm:text-sm"
                  placeholder="Se obtendrá de la base de datos"
                />
              </div>
            </div>

            {/* Campo Cargo - NO EDITABLE */}
            <div>
              <label htmlFor="cargo" className="block text-sm font-medium text-gray-700">
                Cargo
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="cargo"
                  name="cargo"
                  type="text"
                  value={formData.cargo}
                  disabled
                  className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 bg-gray-100 text-gray-500 rounded-md cursor-not-allowed sm:text-sm"
                  placeholder="Se obtendrá de la base de datos"
                />
              </div>
            </div>

            {/* Mostrar rol asignado */}
            {dataFound && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Rol Asignado
                </label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(formData.rol)}`}>
                    <UserCheck className="h-4 w-4 mr-1" />
                    {getRoleLabel(formData.rol)}
                  </span>
                </div>
              </div>
            )}

            {/* Campo Contraseña - EDITABLE */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña *
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
                  onChange={handlePasswordChange}
                  disabled={!dataFound}
                  className={`appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    !dataFound ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>

            {/* Campo Confirmar Contraseña - EDITABLE */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar Contraseña *
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
                  onChange={handlePasswordChange}
                  disabled={!dataFound}
                  className={`appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    !dataFound ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Repite tu contraseña"
                />
              </div>
            </div>
          </div>

          {/* Mostrar datos encontrados */}
          {employeeData && dataFound && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-green-800 mb-2">Datos del Empleado:</h4>
              <div className="grid grid-cols-1 gap-2 text-xs text-green-700">
                <div><strong>Nombre Completo:</strong> {employeeData.nombre} {employeeData.apellido}</div>
                <div><strong>Departamento:</strong> {employeeData.departamento}</div>
                <div><strong>Cargo:</strong> {employeeData.cargo}</div>
                <div><strong>Usuario Generado:</strong> {formData.usuario}</div>
                <div><strong>Rol Asignado:</strong> {getRoleLabel(formData.rol)}</div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || !dataFound}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                background: (isLoading || !dataFound) ? '#9CA3AF' : 'linear-gradient(135deg, #273376 0%, #1f2a5e 100%)'
              }}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : !dataFound ? (
                'Busque los datos del empleado primero'
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
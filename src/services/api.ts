import axios from 'axios';
import { LoginCredentials, RegisterData, AuthResponse, AsistenciaRecord, AsistenciaStats } from '../types';

// Usamos URL relativa para que funcione con el proxy de Vite y en producción
const API_BASE_URL = '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      // Evitar bucle de redirección si ya estamos en login
      if (!window.location.pathname.includes('/login')) {
         window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterData): Promise<{ message: string; userId: number }> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  verify: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

// Asistencias API
export const asistenciasAPI = {
  registrar: async (): Promise<{ message: string; asistencia: any }> => {
    const response = await api.post('/asistencias');
    return response.data;
  },

  getMisAsistencias: async (params?: {
    fecha_inicio?: string;
    fecha_fin?: string;
    limit?: number;
  }): Promise<AsistenciaRecord[]> => {
    const response = await api.get('/asistencias/mis-asistencias', { params });
    return response.data;
  },

  getTodasAsistencias: async (params?: {
    fecha_inicio?: string;
    fecha_fin?: string;
    cedula?: number;
    limit?: number;
  }): Promise<AsistenciaRecord[]> => {
    const response = await api.get('/asistencias/todas', { params });
    return response.data;
  },

  getEstadisticas: async (): Promise<AsistenciaStats> => {
    const response = await api.get('/asistencias/estadisticas');
    return response.data;
  },

  // Nuevo: Para que el admin registre manualmente
  registrarManual: async (data: { usuario_id: string | number; fecha: string; hora_entrada: string; notas?: string }) => {
    const response = await api.post('/asistencias/manual', data);
    return response.data;
  },

  // Nuevo: Para eliminar registros (Con logs de depuración recuperados)
  eliminar: async (id: number | string): Promise<any> => {
    console.log('🗑️ Enviando solicitud DELETE para ID:', id);
    try {
      const response = await api.delete(`/asistencias/${id}`);
      console.log('✅ Respuesta DELETE recibida:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error en DELETE:', error);
      throw error;
    }
  }
};

// Employees API (External DB)
export const employeesAPI = {
  buscarPorCedula: async (cedula: string): Promise<{
    found: boolean;
    empleado?: {
      cedula: string;
      nombre: string;
      apellido: string;
      nombre_completo: string;
      departamento: string;
      cargo: string;
      email?: string;
      telefono?: string;
      fecha_ingreso?: string;
    };
    error?: string;
  }> => {
    const response = await api.get(`/employees/buscar-cedula/${cedula}`);
    return response.data;
  },

  buscar: async (searchTerm: string, limit = 10): Promise<{
    empleados: any[];
    total: number;
  }> => {
    const response = await api.get('/employees/buscar', {
      params: { q: searchTerm, limit }
    });
    return response.data;
  },

  getStats: async (): Promise<{
    total_empleados: number;
    total_departamentos: number;
    conexion_activa: boolean;
  }> => {
    const response = await api.get('/employees/stats');
    return response.data;
  },

  getAll: async (): Promise<any[]> => {
    // Usamos la ruta de buscar sin parámetros para traer todos
    const response = await api.get('/employees/buscar', { params: { limit: 100 } }); 
    return response.data.empleados || response.data;
  }
};

export default api;
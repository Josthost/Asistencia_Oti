export interface User {
  id: number;
  cedula: number;
  usuario: string;
  rol: 'admin' | 'empleado' | 'supervisor';
}

export interface LoginCredentials {
  usuario: string;
  password: string;
}

export interface RegisterData {
  cedula: number;
  usuario: string;
  password: string;
  rol?: 'admin' | 'empleado' | 'supervisor';
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface AsistenciaRecord {
  id: number;
  usuario_id: number;
  cedula: number;
  fecha: string;
  hora_entrada: string;
  created_at: string;
  usuario?: string;
  rol?: string;
}

export interface AsistenciaStats {
  registrado_hoy: boolean;
  asistencias_mes: number;
  total_asistencias: number;
}

export interface Employee {
  id: string;
  name: string;
  cedula: string;
  department?: string;
  position?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // ISO string
  checkInTime: string; // HH:MM format
  notes?: string;
}

export interface WeeklyReport {
  startDate: string;
  endDate: string;
  records: AttendanceRecord[];
}
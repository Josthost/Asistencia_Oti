// ==========================================
// AUTENTICACIÓN Y USUARIOS
// ==========================================

export interface User {
  id: number;
  cedula: string;    // Identificador principal (Login)
  usuario: string;   // Nombre real para mostrar (ej: "Pedro Pérez")
  rol: 'admin' | 'empleado' | 'supervisor';
}

export interface LoginCredentials {
  cedula: string;    // ⚠️ LOGIN CON CÉDULA
  password: string;
}

export interface RegisterData {
  cedula: string;    // Identificador único
  usuario: string;   // Nombre completo
  password: string;
  rol?: 'admin' | 'empleado' | 'supervisor';
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// ==========================================
// ASISTENCIAS (Backend SQL / API)
// ==========================================

export interface AsistenciaRecord {
  id: number;
  usuario_id: number;
  cedula: string | number; // Flexible (string en frontend, number en DB)
  fecha: string;           // YYYY-MM-DD
  hora_entrada: string;    // HH:MM:SS
  created_at?: string;
  
  // Campos opcionales que vienen de uniones (JOINs)
  usuario?: string;        // Nombre del empleado asociado
  rol?: string;
  notas?: string;
}

export interface AsistenciaStats {
  registrado_hoy: boolean;
  asistencias_mes: number;
  total_asistencias: number;
}

// ==========================================
// EMPLEADOS (Gestión Admin)
// ==========================================

export interface Employee {
  id: string | number;
  name: string;      // Nombre completo
  cedula: string;
  department?: string;
  position?: string;
}

// ==========================================
// REGISTROS FRONTEND / LEGACY
// ==========================================

export interface AttendanceRecord {
  id: string; // UUID
  employeeId: string;
  date: string;
  checkInTime: string;
  notes?: string;
}

// ==========================================
// REPORTES Y UTILIDADES
// ==========================================

// Tipo Unificado: Permite que los componentes (Dashboard, Tablas) acepten ambos formatos sin errores
export type UnifiedRecord = AsistenciaRecord | AttendanceRecord;

export interface WeeklyReport {
  startDate: string;
  endDate: string;
  records: UnifiedRecord[];
}
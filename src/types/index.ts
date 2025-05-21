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
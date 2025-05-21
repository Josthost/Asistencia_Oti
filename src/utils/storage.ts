import { Employee, AttendanceRecord } from '../types';
import employeesData from '../data/employees.json';
import attendanceData from '../data/attendance.json';

// Initialize localStorage with data if empty
if (!localStorage.getItem('employees')) {
  localStorage.setItem('employees', JSON.stringify(employeesData));
}

if (!localStorage.getItem('attendance')) {
  localStorage.setItem('attendance', JSON.stringify(attendanceData));
}

// Employee CRUD Operations
export const getEmployees = (): Employee[] => {
  const employees = localStorage.getItem('employees');
  return employees ? JSON.parse(employees) : [];
};

export const saveEmployee = (employee: Employee): void => {
  const employees = getEmployees();
  const existingIndex = employees.findIndex(e => e.id === employee.id);
  
  if (existingIndex >= 0) {
    employees[existingIndex] = employee;
  } else {
    employees.push(employee);
  }
  
  localStorage.setItem('employees', JSON.stringify(employees));
};

export const deleteEmployee = (employeeId: string): void => {
  const employees = getEmployees();
  const filteredEmployees = employees.filter(e => e.id !== employeeId);
  localStorage.setItem('employees', JSON.stringify(filteredEmployees));
};

export const getEmployeeById = (employeeId: string): Employee | undefined => {
  const employees = getEmployees();
  return employees.find(e => e.id === employeeId);
};

// Attendance CRUD Operations
export const getAttendanceRecords = (): AttendanceRecord[] => {
  const records = localStorage.getItem('attendance');
  return records ? JSON.parse(records) : [];
};

export const saveAttendanceRecord = (record: AttendanceRecord): void => {
  const records = getAttendanceRecords();
  const existingIndex = records.findIndex(r => r.id === record.id);
  
  if (existingIndex >= 0) {
    records[existingIndex] = record;
  } else {
    records.push(record);
  }
  
  localStorage.setItem('attendance', JSON.stringify(records));
};

export const deleteAttendanceRecord = (recordId: string): void => {
  const records = getAttendanceRecords();
  const filteredRecords = records.filter(r => r.id !== recordId);
  localStorage.setItem('attendance', JSON.stringify(filteredRecords));
};

export const getAttendanceRecordsByDateRange = (startDate: string, endDate: string): AttendanceRecord[] => {
  const records = getAttendanceRecords();
  return records.filter(record => {
    const recordDate = new Date(record.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return recordDate >= start && recordDate <= end;
  });
};

export const getEmployeeAttendance = (employeeId: string): AttendanceRecord[] => {
  const records = getAttendanceRecords();
  return records.filter(record => record.employeeId === employeeId);
};
import React, { useState, useEffect } from 'react';
import ReportGenerator from '../components/ReportGenerator';
import { getEmployees, getAttendanceRecords } from '../utils/storage';
import { Employee, AttendanceRecord } from '../types';
import { getCurrentWeekRange, getFormattedDateRange, getWeekDays, getDayName } from '../utils/dateUtils';
import { BarChart3 } from 'lucide-react';

const ReportsPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [weekRange, setWeekRange] = useState(getCurrentWeekRange());
  
  useEffect(() => {
    const loadData = () => {
      setEmployees(getEmployees());
      setRecords(getAttendanceRecords());
    };
    
    loadData();
  }, []);
  
  // Filter records for the current week
  const weeklyRecords = records.filter(record => {
    return record.date >= weekRange.startDate && record.date <= weekRange.endDate;
  });
  
  // Count attendance per day
  const weekDays = getWeekDays(weekRange.startDate);
  const attendanceByDay = weekDays.map(day => {
    const count = weeklyRecords.filter(record => record.date === day).length;
    return {
      date: day,
      dayName: getDayName(day).substring(0, 3),
      count
    };
  });
  
  // Count attendance per employee
  const attendanceByEmployee: Record<string, number> = {};
  weeklyRecords.forEach(record => {
    attendanceByEmployee[record.employeeId] = (attendanceByEmployee[record.employeeId] || 0) + 1;
  });
  
  const employeeAttendance = Object.entries(attendanceByEmployee)
    .map(([employeeId, count]) => {
      const employee = employees.find(e => e.id === employeeId);
      return {
        name: employee ? employee.name : 'Unknown',
        count
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5 employees
  
  // Find the max count for scaling the chart
  const maxDailyCount = Math.max(...attendanceByDay.map(d => d.count), 1);
  const maxEmployeeCount = Math.max(...employeeAttendance.map(e => e.count), 1);
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Reports</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Weekly Statistics */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <BarChart3 className="mr-2 h-5 w-5 text-blue-600" />
            Weekly Attendance
          </h2>
          <p className="text-gray-600 mb-4">
            {getFormattedDateRange(weekRange.startDate, weekRange.endDate)}
          </p>
          
          <div className="h-64 flex items-end justify-between">
            {attendanceByDay.map((day) => (
              <div key={day.date} className="flex flex-col items-center flex-1">
                <div 
                  className="w-full bg-blue-500 rounded-t-md transition-all duration-500 ease-in-out hover:bg-blue-600"
                  style={{ 
                    height: `${day.count > 0 ? (day.count / maxDailyCount) * 200 : 0}px`,
                  }}
                ></div>
                <div className="text-xs font-medium text-gray-600 mt-2">
                  {day.dayName}
                </div>
                <div className="text-xs font-bold text-gray-800">
                  {day.count}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Top Employees */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Top Attendance
          </h2>
          
          {employeeAttendance.length > 0 ? (
            <div className="space-y-4">
              {employeeAttendance.map((employee, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">
                      {employee.name}
                    </span>
                    <span className="text-sm font-bold text-gray-800">
                      {employee.count} days
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-green-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${(employee.count / maxEmployeeCount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No attendance data available</p>
          )}
        </div>
      </div>
      
      {/* Report Generator */}
      <ReportGenerator employees={employees} records={records} />
    </div>
  );
};

export default ReportsPage;
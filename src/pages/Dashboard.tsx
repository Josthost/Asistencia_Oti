import React, { useState, useEffect } from 'react';
import { getEmployees } from '../utils/storage';
import { getAttendanceRecords } from '../utils/storage';
import { getCurrentWeekRange } from '../utils/dateUtils';
import { Employee, AttendanceRecord } from '../types';
import DigitalClock from '../components/DigitalClock';
import { Users, Clock, ClipboardCheck, CalendarCheck } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [todayRecords, setTodayRecords] = useState<AttendanceRecord[]>([]);
  const [weeklyRecords, setWeeklyRecords] = useState<AttendanceRecord[]>([]);
  
  useEffect(() => {
    const loadData = () => {
      const loadedEmployees = getEmployees();
      const loadedRecords = getAttendanceRecords();
      
      setEmployees(loadedEmployees);
      setRecords(loadedRecords);
      
      // Filter today's records
      const today = new Date().toISOString().split('T')[0];
      const todayRecs = loadedRecords.filter(record => record.date === today);
      setTodayRecords(todayRecs);
      
      // Filter weekly records
      const { startDate, endDate } = getCurrentWeekRange();
      const weeklyRecs = loadedRecords.filter(record => {
        return record.date >= startDate && record.date <= endDate;
      });
      setWeeklyRecords(weeklyRecs);
    };
    
    loadData();
    
    // Set up interval to refresh data every minute
    const intervalId = setInterval(loadData, 60000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Get unique employees who checked in today
  const todayEmployeeIds = new Set(todayRecords.map(record => record.employeeId));
  const todayAttendanceCount = todayEmployeeIds.size;
  
  // Get unique employees who checked in this week
  const weeklyEmployeeIds = new Set(weeklyRecords.map(record => record.employeeId));
  const weeklyAttendanceCount = weeklyEmployeeIds.size;
  
  // Calculate attendance percentage
  const attendancePercentage = employees.length > 0 
    ? Math.round((todayAttendanceCount / employees.length) * 100) 
    : 0;
  
  // Get recent attendance records (last 5)
  const recentRecords = [...records]
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.checkInTime}`);
      const dateB = new Date(`${b.date}T${b.checkInTime}`);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 5);
  
  const getEmployeeName = (employeeId: string): string => {
    const employee = employees.find(e => e.id === employeeId);
    return employee ? employee.name : 'Unknown';
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      <DigitalClock />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Employees Card */}
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center transition-transform hover:scale-105">
          <div className="bg-blue-100 p-3 rounded-full">
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <div className="ml-4">
            <h2 className="text-sm font-medium text-gray-500">Total Employees</h2>
            <p className="text-2xl font-semibold text-gray-800">{employees.length}</p>
          </div>
        </div>
        
        {/* Today's Attendance Card */}
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center transition-transform hover:scale-105">
          <div className="bg-green-100 p-3 rounded-full">
            <Clock className="h-8 w-8 text-green-600" />
          </div>
          <div className="ml-4">
            <h2 className="text-sm font-medium text-gray-500">Today's Attendance</h2>
            <p className="text-2xl font-semibold text-gray-800">{todayAttendanceCount}</p>
          </div>
        </div>
        
        {/* Weekly Attendance Card */}
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center transition-transform hover:scale-105">
          <div className="bg-purple-100 p-3 rounded-full">
            <CalendarCheck className="h-8 w-8 text-purple-600" />
          </div>
          <div className="ml-4">
            <h2 className="text-sm font-medium text-gray-500">Weekly Check-ins</h2>
            <p className="text-2xl font-semibold text-gray-800">{weeklyRecords.length}</p>
          </div>
        </div>
        
        {/* Attendance Rate Card */}
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center transition-transform hover:scale-105">
          <div className="bg-orange-100 p-3 rounded-full">
            <ClipboardCheck className="h-8 w-8 text-orange-600" />
          </div>
          <div className="ml-4">
            <h2 className="text-sm font-medium text-gray-500">Today's Rate</h2>
            <p className="text-2xl font-semibold text-gray-800">{attendancePercentage}%</p>
          </div>
        </div>
      </div>
      
      {/* Recent Activity Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
        
        {recentRecords.length > 0 ? (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-in Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {getEmployeeName(record.employeeId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{record.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{record.checkInTime}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No recent activity</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
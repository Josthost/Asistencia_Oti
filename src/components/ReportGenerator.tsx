import React, { useState } from 'react';
import { AttendanceRecord, Employee } from '../types';
import { getCurrentWeekRange, getFormattedDateRange, getCurrentMonthRange } from '../utils/dateUtils';
import { downloadPdf } from '../utils/pdfGenerator';
import { FileDown, Calendar } from 'lucide-react';

interface ReportGeneratorProps {
  employees: Employee[];
  records: AttendanceRecord[];
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ employees, records }) => {
  const initialWeekRange = getCurrentWeekRange();
  const initialMonthRange = getCurrentMonthRange();
  const [startDate, setStartDate] = useState(initialWeekRange.startDate);
  const [endDate, setEndDate] = useState(initialWeekRange.endDate);
  const [reportType, setReportType] = useState<'weekly' | 'monthly'>('weekly');
  
  const handleReportTypeChange = (type: 'weekly' | 'monthly') => {
    setReportType(type);
    if (type === 'weekly') {
      setStartDate(initialWeekRange.startDate);
      setEndDate(initialWeekRange.endDate);
    } else {
      setStartDate(initialMonthRange.startDate);
      setEndDate(initialMonthRange.endDate);
    }
  };
  
  const handleGenerateReport = () => {
    const filteredRecords = records.filter(record => {
      const recordDate = record.date;
      return recordDate >= startDate && recordDate <= endDate;
    });
    
    downloadPdf(filteredRecords, employees, startDate, endDate);
  };
  
  const dateRangeText = getFormattedDateRange(startDate, endDate);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <Calendar className="mr-2 h-5 w-5 text-blue-600" />
        Attendance Report Generator
      </h2>
      
      <div className="mb-4">
        <div className="flex space-x-4">
          <button
            onClick={() => handleReportTypeChange('weekly')}
            className={`px-4 py-2 rounded-md transition-colors ${
              reportType === 'weekly'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Weekly Report
          </button>
          <button
            onClick={() => handleReportTypeChange('monthly')}
            className={`px-4 py-2 rounded-md transition-colors ${
              reportType === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Monthly Report
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            id="start-date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
        </div>
        
        <div>
          <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            id="end-date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">
          Generate report for: <span className="font-medium">{dateRangeText}</span>
        </div>
        
        <button
          onClick={handleGenerateReport}
          className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <FileDown className="mr-2 h-4 w-4" />
          Generate PDF
        </button>
      </div>
    </div>
  );
};

export default ReportGenerator;
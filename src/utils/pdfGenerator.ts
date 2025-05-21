import { Employee, AttendanceRecord } from '../types';
import { getFormattedDateRange, getDayName } from './dateUtils';

// Helper function to group attendance records by employee
const groupRecordsByEmployee = (
  records: AttendanceRecord[],
  employees: Employee[]
): Record<string, { employee: Employee; records: AttendanceRecord[] }> => {
  const groupedRecords: Record<string, { employee: Employee; records: AttendanceRecord[] }> = {};

  employees.forEach(employee => {
    groupedRecords[employee.id] = {
      employee,
      records: []
    };
  });

  records.forEach(record => {
    if (groupedRecords[record.employeeId]) {
      groupedRecords[record.employeeId].records.push(record);
    }
  });

  return groupedRecords;
};

// Generate PDF content
export const generatePdfContent = (
  records: AttendanceRecord[],
  employees: Employee[],
  startDate: string,
  endDate: string
): string => {
  const dateRange = getFormattedDateRange(startDate, endDate);
  const groupedRecords = groupRecordsByEmployee(records, employees);
  
  // This is a simple HTML template for the PDF
  // In a real app, you might use a more sophisticated PDF library
  let content = `
    <html>
      <head>
        <title>Weekly Attendance Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
          }
          h1, h2 {
            color: #2563EB;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
          }
          .date-range {
            font-size: 16px;
            color: #64748B;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #64748B;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Weekly Attendance Report</h1>
          <div class="date-range">${dateRange}</div>
        </div>
  `;
  
  // Add a table for each employee with attendance
  Object.values(groupedRecords).forEach(({ employee, records }) => {
    if (records.length > 0) {
      content += `
        <h2>${employee.name} (${employee.cedula})</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Day</th>
              <th>Check-in Time</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      // Sort records by date
      const sortedRecords = [...records].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      sortedRecords.forEach(record => {
        content += `
          <tr>
            <td>${record.date}</td>
            <td>${getDayName(record.date)}</td>
            <td>${record.checkInTime}</td>
            <td>${record.notes || ''}</td>
          </tr>
        `;
      });
      
      content += `
          </tbody>
        </table>
      `;
    }
  });
  
  content += `
        <div class="footer">
          Report generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
        </div>
      </body>
    </html>
  `;
  
  return content;
};

// Function to trigger PDF download
export const downloadPdf = async (
  records: AttendanceRecord[],
  employees: Employee[],
  startDate: string,
  endDate: string
): Promise<void> => {
  const content = generatePdfContent(records, employees, startDate, endDate);
  
  // Create a Blob from the HTML content
  const blob = new Blob([content], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  // Create a link and trigger download
  const a = document.createElement('a');
  a.href = url;
  a.download = `attendance-report-${startDate}-to-${endDate}.html`;
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
  
  // Note: In a production app, you might want to use a proper PDF library
  // like jsPDF or use a server-side solution to generate PDFs
};
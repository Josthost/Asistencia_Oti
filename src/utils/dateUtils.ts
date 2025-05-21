// Format date to YYYY-MM-DD
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Format time to HH:MM
export const formatTime = (date: Date): string => {
  return date.toTimeString().substring(0, 5);
};

// Get current week's date range (Monday to Sunday)
export const getCurrentWeekRange = (): { startDate: string, endDate: string } => {
  const today = new Date();
  const day = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
  
  // Calculate days to subtract to get to Monday
  const daysToMonday = day === 0 ? 6 : day - 1;
  
  const monday = new Date(today);
  monday.setDate(today.getDate() - daysToMonday);
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return {
    startDate: formatDate(monday),
    endDate: formatDate(sunday)
  };
};

// Get current month's date range
export const getCurrentMonthRange = (): { startDate: string, endDate: string } => {
  const today = new Date();
  
  // First day of current month
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  
  // Last day of current month
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  lastDay.setHours(23, 59, 59, 999);
  
  return {
    startDate: formatDate(firstDay),
    endDate: formatDate(lastDay)
  };
};

// Get formatted date range string (e.g., "1 Mayo - 7 Mayo, 2023")
export const getFormattedDateRange = (startDate: string, endDate: string): string => {
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
  const startFormatted = start.toLocaleDateString('es-ES', options);
  
  const endOptions: Intl.DateTimeFormatOptions = { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  };
  const endFormatted = end.toLocaleDateString('es-ES', endOptions);
  
  return `${startFormatted} - ${endFormatted}`;
};

// Get day name from date
export const getDayName = (dateString: string): string => {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('es-ES', { weekday: 'long' });
};

// Get all days in a week given the start date (Monday)
export const getWeekDays = (startDate: string): string[] => {
  const start = new Date(startDate + 'T00:00:00');
  const days = [];
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    days.push(formatDate(day));
  }
  
  return days;
};
// ==========================================
// UTILIDADES DE FECHA Y HORA
// ==========================================

// Formato YYYY-MM-DD
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Formato HH:MM
export const formatTime = (date: Date): string => {
  return date.toTimeString().substring(0, 5);
};

// Obtener rango de la semana actual (Lunes a Domingo)
export const getCurrentWeekRange = (): { startDate: string, endDate: string } => {
  const today = new Date();
  const day = today.getDay(); // 0 es Domingo, 1 es Lunes...
  
  // Calcular días a restar para llegar al Lunes
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

// Obtener rango del mes actual
export const getCurrentMonthRange = (): { startDate: string, endDate: string } => {
  const today = new Date();
  
  // Primer día del mes
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  
  // Último día del mes
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  lastDay.setHours(23, 59, 59, 999);
  
  return {
    startDate: formatDate(firstDay),
    endDate: formatDate(lastDay)
  };
};

// Obtener rango legible (ej: "1 Mayo - 7 Mayo, 2023")
export const getFormattedDateRange = (startDate: string, endDate: string): string => {
  // Usamos parsing manual para evitar problemas de zona horaria
  const [sYear, sMonth, sDay] = startDate.split('-');
  const [eYear, eMonth, eDay] = endDate.split('-');

  const start = new Date(parseInt(sYear), parseInt(sMonth) - 1, parseInt(sDay));
  const end = new Date(parseInt(eYear), parseInt(eMonth) - 1, parseInt(eDay));
  
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

// Obtener nombre del día (Lunes, Martes...)
export const getDayName = (dateString: string): string => {
  if (!dateString) return 'Día inválido';
  
  try {
    // Parseo manual seguro
    const [year, month, day] = dateString.split('-');
    if (!year || !month || !day) return 'Día inválido';
    
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    if (isNaN(date.getTime())) return 'Día inválido';
    
    // Capitalizar la primera letra (lunes -> Lunes)
    const dayName = date.toLocaleDateString('es-ES', { weekday: 'long' });
    return dayName.charAt(0).toUpperCase() + dayName.slice(1);
    
  } catch (error) {
    return 'Día inválido';
  }
};

// Obtener array de fechas de la semana dado el inicio
export const getWeekDays = (startDate: string): string[] => {
  const [year, month, day] = startDate.split('-');
  const start = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  
  const days = [];
  
  for (let i = 0; i < 7; i++) {
    const current = new Date(start);
    current.setDate(start.getDate() + i);
    days.push(formatDate(current));
  }
  
  return days;
};

// Formatear fecha segura para tablas y reportes
export const formatDateSafe = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    // Limpiar si viene con hora ISO (T)
    const datePart = dateString.includes('T') ? dateString.split('T')[0] : dateString;
    
    const [year, month, day] = datePart.split('-');
    if (!year || !month || !day) return dateString;
    
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (error) {
    return dateString;
  }
};
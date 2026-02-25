import React, { useState, useEffect } from 'react';

// Definimos props opcionales por si quieres cambiar el idioma desde fuera
interface DigitalClockProps {
  locale?: string;
}

const DigitalClock: React.FC<DigitalClockProps> = ({ locale = 'es-ES' }) => {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');
  
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      
      // Formato de hora: HH:MM:SS
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setTime(`${hours}:${minutes}:${seconds}`);
      
      // Formato de fecha: Día de la semana, Día Mes, Año
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      
      const dateString = now.toLocaleDateString(locale, options);
      
      // Mejora: Capitalizar la primera letra (ej: "lunes..." -> "Lunes...")
      // Esto hace que se vea más profesional en español
      const capitalizedDate = dateString.charAt(0).toUpperCase() + dateString.slice(1);
      
      setDate(capitalizedDate);
    };
    
    // Actualizar inmediatamente y luego cada segundo
    updateClock();
    const intervalId = setInterval(updateClock, 1000);
    
    // Limpieza al desmontar
    return () => clearInterval(intervalId);
  }, [locale]); // Se actualiza si cambias el idioma dinámicamente
  
  return (
    <div className="text-center mb-6">
      {/* Hora con el color institucional */}
      <div 
        className="text-3xl font-bold transition-all duration-500 tabular-nums" 
        style={{ color: '#273376' }}
      >
        {time || '--:--:--'}
      </div>
      
      {/* Fecha */}
      <div className="text-gray-600 text-sm mt-1">
        {date}
      </div>
    </div>
  );
};

export default DigitalClock;
import React, { useState, useEffect } from 'react';

const DigitalClock: React.FC = () => {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');
  
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      
      // Format time as HH:MM:SS
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setTime(`${hours}:${minutes}:${seconds}`);
      
      // Format date as Weekday, Month Day, Year
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      setDate(now.toLocaleDateString('en-US', options));
    };
    
    // Update immediately and then every second
    updateClock();
    const intervalId = setInterval(updateClock, 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <div className="text-center mb-6">
      <div className="text-3xl font-bold text-blue-600 transition-all duration-500">
        {time}
      </div>
      <div className="text-gray-600 text-sm">
        {date}
      </div>
    </div>
  );
};

export default DigitalClock;
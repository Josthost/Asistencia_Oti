import('./server/routes/auth.js')
  .then(module => {
    console.log('✅ auth.js se carga correctamente');
    console.log('Export default:', typeof module.default);
  })
  .catch(error => {
    console.log('❌ Error cargando auth.js:', error.message);
  });

import('./server/routes/asistencias.js')
  .then(module => {
    console.log('✅ asistencias.js se carga correctamente');
    console.log('Export default:', typeof module.default);
  })
  .catch(error => {
    console.log('❌ Error cargando asistencias.js:', error.message);
  });

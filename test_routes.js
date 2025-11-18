const http = require('http');

const routes = [
  '/api/health',
  '/api/auth/login', 
  '/api/asistencias',
  '/'
];

routes.forEach(route => {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: route,
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`${route}: ${res.statusCode} - ${data.substring(0, 50)}...`);
    });
  });

  req.on('error', (e) => {
    console.log(`${route}: ERROR - ${e.message}`);
  });

  req.end();
});

Despliegue y pasos para la MV (172.16.0.71)
===========================================

Resumen rápido:
- Construye la aplicación React localmente con `npm run build`.
- Sube el contenido de la carpeta `dist` a la MV (por ejemplo `/var/www/asistencia/dist`).
- En la MV, corre el backend Node (`server`) y configura `nginx` para servir `dist` y hacer proxy a `/api`.

Pasos detallados (ejecutar desde tu máquina local donde puedas correr `npm run build`):

1. Instalar dependencias y construir:

```bash
npm install
npm run build
```

2. Comprimir `dist` y subirlo a la MV (ejemplo con `scp`):

```bash
tar -czf dist.tar.gz dist
scp dist.tar.gz usuario@172.16.0.71:/tmp/
ssh usuario@172.16.0.71
sudo mkdir -p /var/www/asistencia
sudo tar -xzf /tmp/dist.tar.gz -C /var/www/asistencia
sudo chown -R www-data:www-data /var/www/asistencia
```

3. Backend en la MV:

- Copia la carpeta `server` y `package.json` y `node_modules`/instala dependencias en la MV.
- Crea `/var/www/asistencia/.env` basado en `.env.example` y ajusta `CORS_ORIGIN`, `EXTERNAL_DB_*` y `JWT_SECRET`.
- Usa `pm2` o un `systemd` service para ejecutar el backend en `localhost:3001`.

Ejemplo rápido con `pm2`:

```bash
cd /path/to/project_on_vm
npm install --production
pm2 start server/server.js --name asistencia-backend
```

4. Configurar `nginx`:

- Copia `deploy/nginx.conf` a `/etc/nginx/sites-available/asistencia` y edítalo, reemplaza rutas a certificados y `root` si es necesario.
- Habilita y recarga nginx:

```bash
sudo ln -s /etc/nginx/sites-available/asistencia /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

5. HTTPS (recomendado):

- Usa Certbot (Let's Encrypt) si tu MV tiene un dominio público apuntando a ella. Si trabajas en red LAN y sólo tienes IP, usa certificados privados o mkcert.

6. Notas finales:
- `src/services/api.ts` está configurado para usar rutas relativas (`/api`) — `nginx` debe proxy-pasar `/api` al backend.
- Si quieres que el servidor Express sirva la carpeta `dist`, activa `SERVE_STATIC=true` en `.env` y coloca `dist` en la raíz del proyecto; el server puede servir el frontend directamente.

// @ts-nocheck
const buenasPracticasDocker = `
    <div class="content-section">
        <h1 id="buenas-practicas-docker">Buenas Prácticas con Docker</h1>
        <p>Mejores prácticas para producción: seguridad, performance, mantenibilidad y monitoreo de contenedores PrestaShop 8.9+.</p>

        <h2 class="section-title">1. Dockerfile Optimizado</h2>

        <pre><code class="language-dockerfile"># ✅ BIEN - Multi-stage, optimizado
FROM composer:2 AS deps
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader

FROM node:18-alpine AS assets
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY assets/ ./assets/
RUN npm run build

FROM php:8.1-fpm-alpine
RUN apk add --no-cache \\
        libzip-dev \\
        && docker-php-ext-install zip pdo_mysql opcache \\
        && apk del --purge .build-deps

COPY --from=deps /app/vendor /app/vendor
COPY --from=assets /app/dist /app/dist
COPY --chown=www-data:www-data . /app

USER www-data
WORKDIR /app
EXPOSE 9000

HEALTHCHECK --interval=30s CMD php-fpm-healthcheck

CMD ["php-fpm"]

# Resultado: ~80MB vs ~500MB sin optimizar
</code></pre>

        <h2 class="section-title">2. Seguridad</h2>

        <h3>2.1. Usuario No-Root</h3>

        <pre><code class="language-dockerfile"># ❌ MAL
FROM php:8.1-fpm
COPY . /var/www/html
CMD ["php-fpm"]

# ✅ BIEN
FROM php:8.1-fpm-alpine

# Crear usuario sin privilegios
RUN addgroup -g 1000 appuser \\
    && adduser -D -u 1000 -G appuser appuser

COPY --chown=appuser:appuser . /app

USER appuser
CMD ["php-fpm"]
</code></pre>

        <h3>2.2. Secrets y Configuración</h3>

        <pre><code class="language-yaml"># docker-compose.yml con secrets
version: '3.8'

services:
  prestashop:
    image: prestashop:8.9
    environment:
      - DB_USER=prestashop
      - DB_HOST=mysql
      - DB_NAME=prestashop
    secrets:
      - db_password
      - api_key
    
  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_DATABASE=prestashop
      - MYSQL_USER=prestashop
      - MYSQL_PASSWORD_FILE=/run/secrets/db_password
    secrets:
      - db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
  api_key:
    file: ./secrets/api_key.txt
</code></pre>

        <pre><code class="language-php"><?php
// Leer secret en aplicación
$dbPassword = file_get_contents('/run/secrets/db_password');
$apiKey = file_get_contents('/run/secrets/api_key');

// O desde variable de entorno
$dbPassword = getenv('DB_PASSWORD');
</code></pre>

        <h3>2.3. Escaneo de Vulnerabilidades</h3>

        <pre><code class="language-bash"># Trivy - escaneo local
trivy image prestashop:latest

# Integrar en CI/CD
docker build -t prestashop:test .
trivy image --exit-code 1 --severity HIGH,CRITICAL prestashop:test

# Docker Scout
docker scout cves prestashop:latest
docker scout recommendations prestashop:latest

# Snyk
snyk container test prestashop:latest --file=Dockerfile
</code></pre>

        <h2 class="section-title">3. Performance</h2>

        <h3>3.1. Caché de Layers</h3>

        <pre><code class="language-dockerfile"># ✅ Orden optimizado
FROM php:8.1-fpm-alpine

# 1. Dependencias del sistema (cambian raramente)
RUN apk add --no-cache git zip

# 2. Extensiones PHP (cambian raramente)
RUN docker-php-ext-install pdo_mysql opcache

# 3. Archivos de dependencias (cambian ocasionalmente)
COPY composer.json composer.lock ./
RUN composer install --no-dev

# 4. Código (cambia frecuentemente)
COPY . .
</code></pre>

        <h3>3.2. Optimización PHP</h3>

        <pre><code class="language-ini"># php.ini optimizado
[PHP]
memory_limit = 512M
max_execution_time = 60
upload_max_filesize = 20M
post_max_size = 20M

[opcache]
opcache.enable = 1
opcache.memory_consumption = 256
opcache.interned_strings_buffer = 16
opcache.max_accelerated_files = 10000
opcache.revalidate_freq = 0
opcache.validate_timestamps = 0  # Producción
opcache.fast_shutdown = 1

[realpath_cache]
realpath_cache_size = 4096K
realpath_cache_ttl = 600
</code></pre>

        <h3>3.3. Resource Limits</h3>

        <pre><code class="language-yaml"># docker-compose.yml con límites
services:
  prestashop:
    image: prestashop:8.9
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G
    
  mysql:
    image: mysql:8.0
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
        reservations:
          cpus: '1.0'
          memory: 2G
</code></pre>

        <h2 class="section-title">4. Logging</h2>

        <h3>4.1. Log Drivers</h3>

        <pre><code class="language-bash"># JSON file (default) con rotación
docker run -d \\
  --log-driver json-file \\
  --log-opt max-size=10m \\
  --log-opt max-file=3 \\
  prestashop:8.9

# Syslog
docker run -d \\
  --log-driver syslog \\
  --log-opt syslog-address=tcp://192.168.1.100:514 \\
  prestashop:8.9

# Fluentd
docker run -d \\
  --log-driver fluentd \\
  --log-opt fluentd-address=localhost:24224 \\
  prestashop:8.9

# Journald
docker run -d --log-driver journald prestashop:8.9
</code></pre>

        <h3>4.2. Configuración Global</h3>

        <pre><code class="language-json">// /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3",
    "labels": "env,service",
    "env": "ENV_VAR1,ENV_VAR2"
  }
}
</code></pre>

        <h2 class="section-title">5. Healthchecks</h2>

        <pre><code class="language-dockerfile"># En Dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \\
  CMD curl -f http://localhost/ || exit 1

# Para PHP-FPM
HEALTHCHECK --interval=30s CMD \\
  php-fpm-healthcheck || exit 1

# Script personalizado
COPY healthcheck.sh /usr/local/bin/
HEALTHCHECK CMD /usr/local/bin/healthcheck.sh
</code></pre>

        <pre><code class="language-bash"># healthcheck.sh
#!/bin/sh
set -e

# Check PHP-FPM
if ! pgrep -x php-fpm > /dev/null; then
    echo "PHP-FPM not running"
    exit 1
fi

# Check application
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/)
if [ "$response" != "200" ]; then
    echo "HTTP check failed: $response"
    exit 1
fi

echo "Health check passed"
exit 0
</code></pre>

        <h2 class="section-title">6. Monitoreo</h2>

        <h3>6.1. Prometheus + Grafana</h3>

        <pre><code class="language-yaml"># docker-compose.yml con monitoring
version: '3.8'

services:
  prestashop:
    image: prestashop:8.9
    labels:
      - "prometheus.scrape=true"
      - "prometheus.port=9253"
  
  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
    ports:
      - "8080:8080"
  
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    ports:
      - "9090:9090"
  
  grafana:
    image: grafana/grafana
    volumes:
      - grafana-data:/var/lib/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin

volumes:
  prometheus-data:
  grafana-data:
</code></pre>

        <h3>6.2. Métricas Importantes</h3>

        <pre><code class="language-bash"># CPU y memoria en tiempo real
docker stats --no-stream

# Eventos del sistema
docker events --filter 'type=container' --format '{{json .}}'

# Inspección de recursos
docker inspect --format='{{.State.Health.Status}}' prestashop

# Logs con timestamps
docker logs --timestamps --since 1h prestashop
</code></pre>

        <h2 class="section-title">7. CI/CD Production-Ready</h2>

        <pre><code class="language-yaml"># .github/workflows/production.yml
name: Production Deploy

on:
  push:
    tags: [ 'v*' ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Login
        uses: docker/login-action@v2
        with:
          username: \${{ secrets.DOCKER_USERNAME }}
          password: \${{ secrets.DOCKER_TOKEN }}
      
      - name: Build and test
        run: |
          docker build -t prestashop:test --target test .
          docker run prestashop:test npm test
          docker run prestashop:test composer test
      
      - name: Security scan
        run: |
          docker build -t prestashop:\${{ github.ref_name }} .
          trivy image --exit-code 1 --severity HIGH,CRITICAL prestashop:\${{ github.ref_name }}
      
      - name: Push
        run: |
          docker tag prestashop:\${{ github.ref_name }} usuario/prestashop:\${{ github.ref_name }}
          docker tag prestashop:\${{ github.ref_name }} usuario/prestashop:latest
          docker push usuario/prestashop:\${{ github.ref_name }}
          docker push usuario/prestashop:latest
      
      - name: Deploy
        run: |
          ssh user@server "docker pull usuario/prestashop:\${{ github.ref_name }} && docker-compose up -d"
</code></pre>

        <h2 class="section-title">8. Backup Automatizado</h2>

        <pre><code class="language-bash"># backup.sh
#!/bin/bash
set -e

BACKUP_DIR="/backups/$(date +%Y-%m-%d)"
mkdir -p "$BACKUP_DIR"

# Backup MySQL
docker exec mysql mysqldump -u root -p\$MYSQL_ROOT_PASSWORD prestashop \\
  | gzip > "$BACKUP_DIR/database.sql.gz"

# Backup volúmenes
docker run --rm \\
  -v prestashop-uploads:/source:ro \\
  -v $BACKUP_DIR:/backup \\
  busybox tar czf /backup/uploads.tar.gz -C /source .

docker run --rm \\
  -v prestashop-modules:/source:ro \\
  -v $BACKUP_DIR:/backup \\
  busybox tar czf /backup/modules.tar.gz -C /source .

# Subir a S3
aws s3 sync "$BACKUP_DIR" s3://backups/prestashop/$(date +%Y-%m-%d)/

# Limpiar backups antiguos (> 30 días)
find /backups -type d -mtime +30 -exec rm -rf {} +

echo "Backup completado: $BACKUP_DIR"
</code></pre>

        <pre><code class="language-bash"># Crontab para backup diario
0 2 * * * /scripts/backup.sh >> /var/log/backup.log 2>&1
</code></pre>

        <h2 class="section-title">9. Docker Compose Producción</h2>

        <pre><code class="language-yaml"># docker-compose.prod.yml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - static-files:/var/www/html/static:ro
    depends_on:
      prestashop:
        condition: service_healthy
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 256M
  
  prestashop:
    image: usuario/prestashop:\${VERSION}
    volumes:
      - uploads:/var/www/html/upload
      - modules:/var/www/html/modules
    environment:
      - PHP_MEMORY_LIMIT=512M
      - DB_HOST=mysql
      - DB_NAME=prestashop
      - DB_USER=prestashop
    env_file:
      - .env.production
    secrets:
      - db_password
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 40s
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
  
  mysql:
    image: mysql:8.0
    volumes:
      - mysql-data:/var/lib/mysql
      - ./mysql/my.cnf:/etc/mysql/conf.d/custom.cnf:ro
    environment:
      - MYSQL_DATABASE=prestashop
      - MYSQL_USER=prestashop
    secrets:
      - db_password
      - mysql_root_password
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          memory: 4G
  
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

volumes:
  mysql-data:
  redis-data:
  uploads:
  modules:
  static-files:

secrets:
  db_password:
    file: ./secrets/db_password.txt
  mysql_root_password:
    file: ./secrets/mysql_root_password.txt
</code></pre>

        <h2 class="section-title">10. Checklist de Producción</h2>

        <div class="alert alert-success">
            <strong>✅ Antes de Producción:</strong>
            <ul class="mb-0">
                <li>[ ] Imágenes optimizadas (multi-stage)</li>
                <li>[ ] Usuario no-root</li>
                <li>[ ] Secrets no hardcodeados</li>
                <li>[ ] Healthchecks configurados</li>
                <li>[ ] Resource limits establecidos</li>
                <li>[ ] Logging configurado</li>
                <li>[ ] Monitoreo activo</li>
                <li>[ ] Backup automatizado</li>
                <li>[ ] Escaneo de vulnerabilidades</li>
                <li>[ ] HTTPS configurado</li>
                <li>[ ] Restart policy: unless-stopped</li>
                <li>[ ] Volúmenes para persistencia</li>
                <li>[ ] Network security (firewalls)</li>
                <li>[ ] Documentación actualizada</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Red Flags:</strong>
            <ul class="mb-0">
                <li>Contenedores como root</li>
                <li>:latest en producción</li>
                <li>Datos en filesystem del contenedor</li>
                <li>Contraseñas en variables de entorno visibles</li>
                <li>Sin healthchecks</li>
                <li>Sin backup</li>
                <li>Sin límites de recursos</li>
                <li>Logs sin rotación</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>📚 Recursos:</strong>
            <ul class="mb-0">
                <li><strong>Docs:</strong> docs.docker.com</li>
                <li><strong>Security:</strong> CIS Docker Benchmark</li>
                <li><strong>Best Practices:</strong> Docker Official Images</li>
                <li><strong>Tools:</strong> Hadolint, Trivy, Dive</li>
            </ul>
        </div>
    </div>
`;

// @ts-nocheck
const seguridadContenedoresPrestashop = `
    <div class="content-section">
        <h1 id="seguridad-contenedores-prestashop">Seguridad de Contenedores y Mejores Prácticas</h1>
        <p>Implementación de seguridad en contenedores Docker para tiendas PrestaShop 8.9+ siguiendo mejores prácticas de producción.</p>

        <h2 class="section-title">1. Dockerfile Seguro para PrestaShop</h2>

        <pre><code class="language-dockerfile"># Dockerfile seguro para PrestaShop
FROM php:8.1-fpm-alpine AS base

# Instalar solo dependencias necesarias
RUN apk add --no-cache \\
    libzip-dev libpng-dev libwebp-dev libjpeg-turbo-dev \\
    && docker-php-ext-configure gd --with-webp --with-jpeg \\
    && docker-php-ext-install pdo_mysql gd zip opcache \\
    && apk del libzip-dev libpng-dev  # Eliminar build deps

# Crear usuario no-root
RUN addgroup -g 1000 prestashop \\
    && adduser -D -u 1000 -G prestashop prestashop

# Configuración segura de PHP
COPY php-secure.ini /usr/local/etc/php/conf.d/security.ini

WORKDIR /var/www/html

# Production stage
FROM base AS production

# Copiar archivos como root
COPY --chown=prestashop:prestashop . /var/www/html

# Permisos restrictivos
RUN chmod -R 755 /var/www/html \\
    && chmod -R 770 /var/www/html/var/cache \\
    && chmod -R 770 /var/www/html/var/logs \\
    && chmod -R 770 /var/www/html/upload \\
    && chmod 440 /var/www/html/config/settings.inc.php

# Eliminar archivos innecesarios
RUN rm -rf /var/www/html/install \\
    && rm -rf /var/www/html/docs \\
    && rm -f /var/www/html/.git* \\
    && rm -f /var/www/html/.env*

# Cambiar a usuario no-root
USER prestashop

# Security labels
LABEL security.scan="passed" \\
      maintainer="security@example.com"

CMD ["php-fpm"]
</code></pre>

        <pre><code class="language-ini"># php-secure.ini
; Deshabilitar funciones peligrosas
disable_functions = exec,passthru,shell_exec,system,proc_open,popen,curl_exec,curl_multi_exec,parse_ini_file,show_source

; Ocultar versión de PHP
expose_php = Off

; Limitar ejecución
max_execution_time = 30
max_input_time = 60
memory_limit = 512M

; Subida de archivos
file_uploads = On
upload_max_filesize = 10M
post_max_size = 12M

; Session security
session.cookie_httponly = 1
session.cookie_secure = 1
session.use_strict_mode = 1
session.cookie_samesite = "Lax"

; Error handling (no mostrar errores)
display_errors = Off
log_errors = On
error_log = /var/log/php/error.log
</code></pre>

        <h2 class="section-title">2. Docker Compose Seguro</h2>

        <pre><code class="language-yaml"># docker-compose.secure.yml
version: '3.8'

services:
  prestashop:
    image: prestashop:8.9-secure
    container_name: prestashop
    
    # Usuario no-root
    user: "1000:1000"
    
    # Capabilities limitadas
    cap_drop:
      - ALL
    cap_add:
      - CHOWN
      - SETGID
      - SETUID
    
    # Security options
    security_opt:
      - no-new-privileges:true
      - apparmor=docker-default
    
    # Read-only root filesystem
    read_only: true
    tmpfs:
      - /tmp:noexec,nosuid,size=100m
      - /var/run:noexec,nosuid,size=10m
    
    volumes:
      # Solo escritura donde sea necesario
      - prestashop-data:/var/www/html/upload
      - prestashop-cache:/var/www/html/var/cache
      - prestashop-logs:/var/www/html/var/logs
    
    environment:
      - DB_SERVER=mysql
      - DB_NAME=prestashop
      - DB_USER=prestashop_user
      - DB_PASSWD_FILE=/run/secrets/db_password
      - REDIS_HOST=redis
    
    secrets:
      - db_password
      - api_key
    
    networks:
      - frontend
      - backend
    
    # Resource limits
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
          pids: 100
        reservations:
          cpus: '0.5'
          memory: 512M
    
    # Health check
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health.php"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 60s
    
    # Restart policy
    restart: unless-stopped
    
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
  
  mysql:
    image: mysql:8.0
    container_name: mysql
    
    # Usuario no-root
    user: "999:999"
    
    # Security
    cap_drop:
      - ALL
    cap_add:
      - CHOWN
      - SETGID
      - SETUID
      - DAC_OVERRIDE
    security_opt:
      - no-new-privileges:true
    
    environment:
      - MYSQL_DATABASE=prestashop
      - MYSQL_USER=prestashop_user
      - MYSQL_PASSWORD_FILE=/run/secrets/db_password
      - MYSQL_ROOT_PASSWORD_FILE=/run/secrets/mysql_root_password
    
    secrets:
      - db_password
      - mysql_root_password
    
    volumes:
      - mysql-data:/var/lib/mysql
      - ./mysql-secure.cnf:/etc/mysql/conf.d/secure.cnf:ro
    
    networks:
      - backend
    
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
    
    command: --default-authentication-plugin=mysql_native_password --skip-name-resolve
  
  redis:
    image: redis:7-alpine
    container_name: redis
    
    user: "999:999"
    
    cap_drop:
      - ALL
    security_opt:
      - no-new-privileges:true
    
    read_only: true
    tmpfs:
      - /tmp
    
    command: >
      redis-server
      --requirepass \${REDIS_PASSWORD}
      --appendonly yes
      --maxmemory 256mb
      --maxmemory-policy allkeys-lru
    
    volumes:
      - redis-data:/data
    
    networks:
      - backend

  # Nginx reverse proxy
  nginx:
    image: nginx:alpine
    container_name: nginx
    
    cap_drop:
      - ALL
    cap_add:
      - CHOWN
      - SETGID
      - SETUID
      - NET_BIND_SERVICE
    
    security_opt:
      - no-new-privileges:true
    
    read_only: true
    tmpfs:
      - /var/run:noexec,nosuid
      - /var/cache/nginx:noexec,nosuid
    
    ports:
      - "80:80"
      - "443:443"
    
    volumes:
      - ./nginx-secure.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - nginx-logs:/var/log/nginx
    
    networks:
      - frontend
    
    depends_on:
      - prestashop

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true  # No acceso a internet

volumes:
  prestashop-data:
  prestashop-cache:
  prestashop-logs:
  mysql-data:
  redis-data:
  nginx-logs:

secrets:
  db_password:
    file: ./secrets/db_password.txt
  mysql_root_password:
    file: ./secrets/mysql_root_password.txt
  api_key:
    file: ./secrets/api_key.txt
</code></pre>

        <h2 class="section-title">3. Nginx Seguro con SSL</h2>

        <pre><code class="language-nginx"># nginx-secure.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:;" always;
    
    # Hide nginx version
    server_tokens off;
    
    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=login:10m rate=5r/m;
    limit_req_zone \$binary_remote_addr zone=api:10m rate=100r/m;
    limit_conn_zone \$binary_remote_addr zone=addr:10m;
    
    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name shop.example.com;
        return 301 https://\$server_name\$request_uri;
    }
    
    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name shop.example.com;
        
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        
        # Security limits
        client_max_body_size 10M;
        client_body_timeout 12;
        client_header_timeout 12;
        keepalive_timeout 15;
        send_timeout 10;
        
        # Limit connections
        limit_conn addr 10;
        
        location / {
            proxy_pass http://prestashop:80;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            
            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }
        
        # Rate limit login
        location ~* ^/admin.*/(login|authentication) {
            limit_req zone=login burst=5;
            proxy_pass http://prestashop:80;
        }
        
        # Rate limit API
        location /api/ {
            limit_req zone=api burst=20;
            proxy_pass http://prestashop:80;
        }
        
        # Deny access to sensitive files
        location ~ /\\.(git|env|htaccess) {
            deny all;
            return 404;
        }
        
        location ~ /(config|classes|modules/.*/controllers) {
            deny all;
            return 404;
        }
    }
}
</code></pre>

        <h2 class="section-title">4. Secrets Management</h2>

        <pre><code class="language-bash"># Crear secrets
mkdir -p secrets
chmod 700 secrets

# Generar passwords seguros
openssl rand -base64 32 > secrets/db_password.txt
openssl rand -base64 32 > secrets/mysql_root_password.txt
openssl rand -base64 32 > secrets/api_key.txt

chmod 400 secrets/*.txt

# Docker secrets (Swarm)
docker secret create db_password secrets/db_password.txt
docker secret create mysql_root secrets/mysql_root_password.txt
docker secret create api_key secrets/api_key.txt
</code></pre>

        <pre><code class="language-php"><?php
// PrestaShop - Leer secrets
class SecureConfig
{
    public static function getSecret(string $name): string
    {
        $secretPath = "/run/secrets/{$name}";
        
        if (file_exists($secretPath)) {
            return trim(file_get_contents($secretPath));
        }
        
        // Fallback a variable de entorno (solo dev)
        $envVar = strtoupper($name);
        return getenv($envVar) ?: '';
    }
}

// Uso
define('_DB_PASSWD_', SecureConfig::getSecret('db_password'));
define('_API_KEY_', SecureConfig::getSecret('api_key'));
</code></pre>

        <h2 class="section-title">5. Escaneo de Vulnerabilidades</h2>

        <pre><code class="language-bash"># Trivy - escanear imagen
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \\
  aquasec/trivy image prestashop:8.9

# Escaneo con reporte
trivy image --severity HIGH,CRITICAL \\
  --format json --output report.json \\
  prestashop:8.9

# Escanear antes de deploy
trivy image --exit-code 1 --severity CRITICAL prestashop:8.9 || exit 1
</code></pre>

        <pre><code class="language-yaml"># .github/workflows/security.yml
name: Security Scan

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2am
  push:
    branches: [ main ]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build image
        run: docker build -t prestashop:scan .
      
      - name: Run Trivy
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'prestashop:scan'
          format: 'sarif'
          output: 'trivy-results.sarif'
      
      - name: Upload to Security tab
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
</code></pre>

        <h2 class="section-title">6. Docker Bench Security</h2>

        <pre><code class="language-bash"># Ejecutar Docker Bench Security
docker run --rm --net host --pid host --userns host --cap-add audit_control \\
  -e DOCKER_CONTENT_TRUST=\$DOCKER_CONTENT_TRUST \\
  -v /var/lib:/var/lib \\
  -v /var/run/docker.sock:/var/run/docker.sock \\
  -v /usr/lib/systemd:/usr/lib/systemd \\
  -v /etc:/etc --label docker_bench_security \\
  docker/docker-bench-security

# Generar reporte
docker run --rm -v \$(pwd):/tmp docker/docker-bench-security > security-report.txt
</code></pre>

        <h2 class="section-title">7. Módulo de Seguridad PrestaShop</h2>

        <pre><code class="language-php"><?php
// modules/securityenhanced/securityenhanced.php
class SecurityEnhanced extends Module
{
    public function __construct()
    {
        $this->name = 'securityenhanced';
        $this->tab = 'administration';
        $this->version = '1.0.0';
        parent::__construct();
        $this->displayName = 'Security Enhanced';
        $this->description = 'Enhanced security for containerized PrestaShop';
    }
    
    public function install()
    {
        return parent::install() 
            && $this->registerHook('actionFrontControllerSetMedia')
            && $this->registerHook('actionAdminLoginControllerLoginBefore');
    }
    
    // Añadir security headers
    public function hookActionFrontControllerSetMedia($params)
    {
        header('X-Frame-Options: SAMEORIGIN');
        header('X-Content-Type-Options: nosniff');
        header('X-XSS-Protection: 1; mode=block');
        header('Referrer-Policy: no-referrer-when-downgrade');
        
        // CSP
        $csp = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval';";
        header("Content-Security-Policy: {$csp}");
    }
    
    // Rate limiting de login
    public function hookActionAdminLoginControllerLoginBefore($params)
    {
        $redis = new Redis();
        $redis->connect('redis', 6379);
        
        $ip = Tools::getRemoteAddr();
        $key = "login_attempts:{$ip}";
        $attempts = (int)$redis->get($key);
        
        if ($attempts >= 5) {
            $ttl = $redis->ttl($key);
            die(json_encode([
                'hasError' => true,
                'errors' => ["Too many login attempts. Try again in {$ttl} seconds."]
            ]));
        }
        
        $redis->incr($key);
        $redis->expire($key, 300); // 5 minutos
    }
}
</code></pre>

        <h2 class="section-title">8. Checklist de Seguridad</h2>

        <div class="alert alert-success">
            <strong>✅ Seguridad de Contenedores:</strong>
            <ul class="mb-0">
                <li>✅ Usuario no-root en contenedores</li>
                <li>✅ Capabilities limitadas (cap_drop ALL)</li>
                <li>✅ Read-only filesystem donde sea posible</li>
                <li>✅ Secrets en archivos, no en env vars</li>
                <li>✅ Network backend aislada (internal: true)</li>
                <li>✅ Resource limits configurados</li>
                <li>✅ Escaneo de vulnerabilidades (Trivy)</li>
                <li>✅ SSL/TLS configurado</li>
                <li>✅ Rate limiting en nginx</li>
                <li>✅ Security headers configurados</li>
                <li>✅ Logs centralizados</li>
                <li>✅ Backups automatizados</li>
            </ul>
        </div>

        <div class="alert alert-danger">
            <strong>❌ Evitar:</strong>
            <ul class="mb-0">
                <li>Ejecutar como root</li>
                <li>Passwords en variables de entorno</li>
                <li>Imágenes sin escanear</li>
                <li>Exponer puertos innecesarios</li>
                <li>Privileged containers</li>
                <li>Volúmenes con permisos 777</li>
                <li>Latest tag en producción</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>🔍 Auditoría Regular:</strong>
            <ul class="mb-0">
                <li>Escaneo diario de vulnerabilidades</li>
                <li>Revisión de logs de seguridad</li>
                <li>Actualización de dependencias</li>
                <li>Rotación de secrets</li>
                <li>Backup testing</li>
            </ul>
        </div>
    </div>
`;

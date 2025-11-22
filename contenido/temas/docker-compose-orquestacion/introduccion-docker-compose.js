// @ts-nocheck
const introduccionDockerCompose = `
    <div class="content-section">
        <h1 id="introduccion-docker-compose">Introducción a Docker Compose</h1>
        <p>Docker Compose simplifica la gestión de aplicaciones multi-contenedor. Ideal para desarrollo, testing y despliegue de PrestaShop 8.9+ con sus dependencias.</p>

        <h2 class="section-title">1. ¿Qué es Docker Compose?</h2>

        <p>Docker Compose es una herramienta para definir y ejecutar aplicaciones Docker multi-contenedor usando un archivo YAML.</p>

        <div class="alert alert-info">
            <strong>📦 Ventajas:</strong>
            <ul class="mb-0">
                <li>Definición declarativa de toda la infraestructura</li>
                <li>Un solo comando para iniciar todo</li>
                <li>Gestión de dependencias entre servicios</li>
                <li>Networking automático entre contenedores</li>
                <li>Reproducibilidad en diferentes entornos</li>
                <li>Ideal para desarrollo local</li>
            </ul>
        </div>

        <h2 class="section-title">2. Instalación</h2>

        <pre><code class="language-bash"># Docker Compose V2 (incluido con Docker Desktop)
docker compose version

# Linux - instalación manual
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \\
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalación
docker compose version
# Docker Compose version v2.20.0
</code></pre>

        <h2 class="section-title">3. Ejemplo Básico</h2>

        <pre><code class="language-yaml"># docker-compose.yml - PrestaShop básico
version: '3.8'

services:
  prestashop:
    image: prestashop/prestashop:8.9
    ports:
      - "8080:80"
    environment:
      - DB_SERVER=mysql
      - DB_NAME=prestashop
      - DB_USER=prestashop
      - DB_PASSWD=admin123
    depends_on:
      - mysql
  
  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=root123
      - MYSQL_DATABASE=prestashop
      - MYSQL_USER=prestashop
      - MYSQL_PASSWORD=admin123
    volumes:
      - mysql-data:/var/lib/mysql

volumes:
  mysql-data:
</code></pre>

        <h2 class="section-title">4. Comandos Básicos</h2>

        <pre><code class="language-bash"># Iniciar servicios (crea y arranca)
docker compose up

# En background (detached)
docker compose up -d

# Ver logs en tiempo real
docker compose logs -f

# Logs de un servicio específico
docker compose logs -f prestashop

# Ver servicios corriendo
docker compose ps

# Detener servicios
docker compose stop

# Iniciar servicios detenidos
docker compose start

# Reiniciar servicios
docker compose restart

# Detener y eliminar contenedores
docker compose down

# Detener, eliminar contenedores y volúmenes
docker compose down -v

# Eliminar todo (contenedores, redes, imágenes)
docker compose down --rmi all -v
</code></pre>

        <h2 class="section-title">5. Escalar Servicios</h2>

        <pre><code class="language-bash"># Escalar servicio a 3 instancias
docker compose up -d --scale prestashop=3

# Ver instancias
docker compose ps
</code></pre>

        <pre><code class="language-yaml"># docker-compose.yml con nginx load balancer
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - prestashop
  
  prestashop:
    image: prestashop/prestashop:8.9
    deploy:
      replicas: 3
    environment:
      - DB_SERVER=mysql
</code></pre>

        <h2 class="section-title">6. Comandos de Gestión</h2>

        <pre><code class="language-bash"># Ejecutar comando en servicio
docker compose exec prestashop bash
docker compose exec prestashop php bin/console cache:clear

# Ejecutar comando one-shot (sin servicio corriendo)
docker compose run prestashop php bin/console

# Ver configuración parseada
docker compose config

# Validar archivo compose
docker compose config --quiet

# Listar imágenes usadas
docker compose images

# Ver uso de recursos
docker compose top

# Pausar servicios
docker compose pause

# Reanudar servicios
docker compose unpause
</code></pre>

        <h2 class="section-title">7. Build Personalizado</h2>

        <pre><code class="language-yaml"># docker-compose.yml con build
version: '3.8'

services:
  prestashop:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - PHP_VERSION=8.1
        - PRESTASHOP_VERSION=8.9.0
    ports:
      - "8080:80"
    volumes:
      - ./modules:/var/www/html/modules
    depends_on:
      - mysql
  
  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=root123
</code></pre>

        <pre><code class="language-bash"># Build imágenes
docker compose build

# Build sin cache
docker compose build --no-cache

# Build servicio específico
docker compose build prestashop

# Build y up en un comando
docker compose up --build

# Pull imágenes del registry
docker compose pull
</code></pre>

        <h2 class="section-title">8. Múltiples Archivos</h2>

        <pre><code class="language-bash"># docker-compose.yml (base)
# docker-compose.override.yml (desarrollo - se aplica automáticamente)
# docker-compose.prod.yml (producción)

# Desarrollo (automático)
docker compose up

# Producción (especificar archivo)
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Test
docker compose -f docker-compose.yml -f docker-compose.test.yml up --abort-on-container-exit
</code></pre>

        <pre><code class="language-yaml"># docker-compose.yml (base)
version: '3.8'

services:
  prestashop:
    image: prestashop/prestashop:8.9
    environment:
      - DB_SERVER=mysql

# docker-compose.override.yml (desarrollo)
version: '3.8'

services:
  prestashop:
    volumes:
      - ./src:/var/www/html/src
    environment:
      - DEBUG=true

# docker-compose.prod.yml (producción)
version: '3.8'

services:
  prestashop:
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 2G
</code></pre>

        <h2 class="section-title">9. Healthchecks</h2>

        <pre><code class="language-yaml">version: '3.8'

services:
  prestashop:
    image: prestashop/prestashop:8.9
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 40s
    depends_on:
      mysql:
        condition: service_healthy
  
  mysql:
    image: mysql:8.0
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
</code></pre>

        <h2 class="section-title">10. Ejemplo Completo PrestaShop</h2>

        <pre><code class="language-yaml"># docker-compose.yml - Stack completo
version: '3.8'

services:
  # Nginx reverse proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - prestashop
    restart: unless-stopped
  
  # PrestaShop
  prestashop:
    image: prestashop/prestashop:8.9
    volumes:
      - prestashop-data:/var/www/html
      - ./modules:/var/www/html/modules
    environment:
      - DB_SERVER=mysql
      - DB_NAME=prestashop
      - DB_USER=prestashop
      - DB_PASSWD=\${DB_PASSWORD}
      - PS_DOMAIN=shop.local
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/"]
      interval: 30s
  
  # MySQL
  mysql:
    image: mysql:8.0
    volumes:
      - mysql-data:/var/lib/mysql
      - ./mysql/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    environment:
      - MYSQL_ROOT_PASSWORD=\${MYSQL_ROOT_PASSWORD}
      - MYSQL_DATABASE=prestashop
      - MYSQL_USER=prestashop
      - MYSQL_PASSWORD=\${DB_PASSWORD}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
  
  # Redis cache
  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes
    restart: unless-stopped
  
  # phpMyAdmin (opcional, solo desarrollo)
  phpmyadmin:
    image: phpmyadmin:latest
    ports:
      - "8081:80"
    environment:
      - PMA_HOST=mysql
      - PMA_USER=root
      - PMA_PASSWORD=\${MYSQL_ROOT_PASSWORD}
    depends_on:
      - mysql
    profiles:
      - dev

volumes:
  prestashop-data:
  mysql-data:
  redis-data:

networks:
  default:
    name: prestashop-net
</code></pre>

        <pre><code class="language-bash"># .env
DB_PASSWORD=secure_password_123
MYSQL_ROOT_PASSWORD=root_secure_456
</code></pre>

        <pre><code class="language-bash"># Iniciar stack completo
docker compose up -d

# Con phpMyAdmin (perfil dev)
docker compose --profile dev up -d

# Ver logs
docker compose logs -f prestashop

# Acceder
# PrestaShop: http://localhost
# phpMyAdmin: http://localhost:8081

# Backup
docker compose exec mysql mysqldump -u root -p prestashop > backup.sql

# Restore
docker compose exec -T mysql mysql -u root -p prestashop < backup.sql
</code></pre>

        <h2 class="section-title">11. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Docker Compose:</strong>
            <ul class="mb-0">
                <li>Usar variables de entorno para secretos</li>
                <li>Archivo <code>.env</code> en <code>.gitignore</code></li>
                <li>Healthchecks en servicios críticos</li>
                <li>depends_on con condition para orden de inicio</li>
                <li>Named volumes para persistencia</li>
                <li>restart: unless-stopped en producción</li>
                <li>Perfiles para servicios opcionales</li>
                <li>Versión explícita de imágenes (no :latest)</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Evitar:</strong>
            <ul class="mb-0">
                <li>Hardcodear contraseñas en compose</li>
                <li>Exponer puertos innecesarios</li>
                <li>Mezclar desarrollo y producción en mismo archivo</li>
                <li>depends_on sin healthcheck (no garantiza que esté listo)</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>💡 Compose vs Docker CLI:</strong>
            <table class="table table-sm">
                <tr>
                    <th>Docker CLI</th>
                    <th>Docker Compose</th>
                </tr>
                <tr>
                    <td>Contenedor individual</td>
                    <td>Múltiples servicios</td>
                </tr>
                <tr>
                    <td>Comandos largos</td>
                    <td>Archivo declarativo</td>
                </tr>
                <tr>
                    <td>Manual networking</td>
                    <td>Networking automático</td>
                </tr>
                <tr>
                    <td>Gestión compleja</td>
                    <td>Un comando: <code>up/down</code></td>
                </tr>
            </table>
        </div>
    </div>
`;

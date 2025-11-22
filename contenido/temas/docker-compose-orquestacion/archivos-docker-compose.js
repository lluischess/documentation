// @ts-nocheck
const archivosDockerCompose = `
    <div class="content-section">
        <h1 id="archivos-docker-compose">Archivos docker-compose.yml</h1>
        <p>Estructura completa y opciones del archivo docker-compose.yml para aplicaciones PrestaShop 8.9+ con múltiples servicios.</p>

        <h2 class="section-title">1. Estructura Básica</h2>

        <pre><code class="language-yaml"># Versión del formato (3.8 recomendado)
version: '3.8'

# Servicios (contenedores)
services:
  servicio1:
    # configuración...
  servicio2:
    # configuración...

# Volúmenes nombrados
volumes:
  volumen1:
  volumen2:

# Redes personalizadas
networks:
  red1:
  red2:

# Configuraciones externas
configs:
  config1:

# Secrets
secrets:
  secret1:
</code></pre>

        <h2 class="section-title">2. Opciones de Servicio</h2>

        <pre><code class="language-yaml">services:
  prestashop:
    # Imagen a usar
    image: prestashop/prestashop:8.9
    
    # O build desde Dockerfile
    build:
      context: .
      dockerfile: Dockerfile
      args:
        PHP_VERSION: 8.1
      target: production
    
    # Nombre del contenedor
    container_name: prestashop-app
    
    # Hostname interno
    hostname: prestashop
    
    # Comando a ejecutar
    command: apache2-foreground
    
    # Entrypoint
    entrypoint: /docker-entrypoint.sh
    
    # Working directory
    working_dir: /var/www/html
    
    # Usuario
    user: www-data
    
    # Puertos
    ports:
      - "8080:80"           # host:container
      - "8443:443"
      - "127.0.0.1:9000:9000"  # bind a IP específica
    
    # Exponer puertos (sin publicar)
    expose:
      - "9000"
    
    # Volúmenes
    volumes:
      - prestashop-data:/var/www/html
      - ./modules:/var/www/html/modules
      - ./config.php:/var/www/html/config.php:ro
      - type: bind
        source: ./themes
        target: /var/www/html/themes
        read_only: true
    
    # Variables de entorno
    environment:
      - DB_SERVER=mysql
      - DB_NAME=prestashop
      - DEBUG=true
      - PHP_MEMORY_LIMIT=512M
    
    # O desde archivo
    env_file:
      - .env
      - .env.local
    
    # Dependencias
    depends_on:
      - mysql
      - redis
    
    # Dependencias con condición
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_started
    
    # Redes
    networks:
      - frontend
      - backend
    
    # Alias en red
    networks:
      backend:
        aliases:
          - app
          - prestashop-app
    
    # DNS
    dns:
      - 8.8.8.8
      - 8.8.4.4
    
    # Links (legacy, usar networks)
    links:
      - mysql:database
    
    # Restart policy
    restart: unless-stopped  # always, on-failure, unless-stopped, no
    
    # Healthcheck
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 40s
    
    # Logging
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
    
    # Labels
    labels:
      com.example.description: "PrestaShop application"
      com.example.version: "8.9"
    
    # Deploy (Swarm)
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
      update_config:
        parallelism: 1
        delay: 10s
    
    # Perfiles
    profiles:
      - dev
      - debug
    
    # Extra hosts
    extra_hosts:
      - "somehost:162.242.195.82"
      - "otherhost:50.31.209.229"
    
    # Privileged
    privileged: false
    
    # Capabilities
    cap_add:
      - NET_ADMIN
    cap_drop:
      - SYS_ADMIN
    
    # Security opts
    security_opt:
      - no-new-privileges:true
    
    # Tmpfs
    tmpfs:
      - /tmp
      - /run
</code></pre>

        <h2 class="section-title">3. Volúmenes</h2>

        <pre><code class="language-yaml">services:
  prestashop:
    volumes:
      # Named volume
      - prestashop-data:/var/www/html
      
      # Bind mount
      - ./src:/var/www/html/src
      
      # Bind mount read-only
      - ./config:/etc/config:ro
      
      # Volume con opciones
      - type: volume
        source: uploads
        target: /var/www/html/upload
        volume:
          nocopy: true
      
      # Tmpfs
      - type: tmpfs
        target: /tmp
        tmpfs:
          size: 100m

volumes:
  prestashop-data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /mnt/data/prestashop
  
  uploads:
    external: true  # Volumen creado externamente
  
  mysql-data:
    name: custom_mysql_data  # Nombre personalizado
</code></pre>

        <h2 class="section-title">4. Redes</h2>

        <pre><code class="language-yaml">services:
  prestashop:
    networks:
      - frontend
      - backend
  
  mysql:
    networks:
      backend:
        ipv4_address: 172.20.0.10

networks:
  frontend:
    driver: bridge
  
  backend:
    driver: bridge
    ipam:
      driver: default
      config:
        - subnet: 172.20.0.0/16
          gateway: 172.20.0.1
    internal: true  # Sin acceso a internet
  
  external-net:
    external: true  # Red creada externamente
    name: my-pre-existing-network
</code></pre>

        <h2 class="section-title">5. Build Avanzado</h2>

        <pre><code class="language-yaml">services:
  prestashop:
    build:
      # Contexto de build
      context: .
      
      # Dockerfile personalizado
      dockerfile: docker/Dockerfile.prod
      
      # Build args
      args:
        - PHP_VERSION=8.1
        - PRESTASHOP_VERSION=8.9.0
        - BUILD_DATE=\${BUILD_DATE}
      
      # Target de multi-stage
      target: production
      
      # Cache desde imagen
      cache_from:
        - prestashop:latest
        - prestashop:cache
      
      # Labels en imagen
      labels:
        - "com.example.version=8.9"
      
      # Network durante build
      network: host
      
      # Plataforma
      platform: linux/amd64
      
      # SSH agent
      ssh:
        - default
    
    # Tag adicionales
    image: prestashop:custom
</code></pre>

        <h2 class="section-title">6. Extensiones y Anchors</h2>

        <pre><code class="language-yaml"># YAML anchors para reutilización
version: '3.8'

# Definir plantillas
x-common-variables: &common-vars
  DB_SERVER: mysql
  DB_NAME: prestashop

x-logging: &default-logging
  driver: json-file
  options:
    max-size: "10m"
    max-file: "3"

x-healthcheck: &http-healthcheck
  test: ["CMD", "curl", "-f", "http://localhost/"]
  interval: 30s
  timeout: 3s
  retries: 3

services:
  prestashop-web:
    image: prestashop:8.9
    environment:
      <<: *common-vars
      PS_DOMAIN: web.shop.com
    logging: *default-logging
    healthcheck: *http-healthcheck
  
  prestashop-admin:
    image: prestashop:8.9
    environment:
      <<: *common-vars
      PS_DOMAIN: admin.shop.com
    logging: *default-logging
    healthcheck: *http-healthcheck
</code></pre>

        <h2 class="section-title">7. Configs y Secrets</h2>

        <pre><code class="language-yaml">version: '3.8'

services:
  prestashop:
    image: prestashop:8.9
    configs:
      - source: php_config
        target: /usr/local/etc/php/php.ini
        mode: 0440
    secrets:
      - db_password
      - api_key

configs:
  php_config:
    file: ./config/php.ini
  
  nginx_config:
    external: true  # Config creada externamente

secrets:
  db_password:
    file: ./secrets/db_password.txt
  
  api_key:
    external: true
</code></pre>

        <h2 class="section-title">8. Ejemplo Completo Producción</h2>

        <pre><code class="language-yaml"># docker-compose.prod.yml
version: '3.8'

x-common: &common
  restart: unless-stopped
  logging:
    driver: json-file
    options:
      max-size: "10m"
      max-file: "3"

x-prestashop-env: &prestashop-env
  DB_SERVER: mysql
  DB_NAME: prestashop
  DB_USER: prestashop
  REDIS_SERVER: redis

services:
  nginx:
    <<: *common
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - type: bind
        source: ./nginx/nginx.conf
        target: /etc/nginx/nginx.conf
        read_only: true
      - type: bind
        source: ./nginx/ssl
        target: /etc/nginx/ssl
        read_only: true
      - static-files:/var/www/html/static:ro
    depends_on:
      prestashop:
        condition: service_healthy
    networks:
      - frontend
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
  
  prestashop:
    <<: *common
    image: prestashop/prestashop:8.9
    environment:
      <<: *prestashop-env
    env_file:
      - .env.production
    secrets:
      - db_password
    volumes:
      - prestashop-data:/var/www/html
      - uploads:/var/www/html/upload
      - static-files:/var/www/html/static
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - frontend
      - backend
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G
    healthcheck:
      test: ["CMD", "php-fpm-healthcheck"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 40s
  
  mysql:
    <<: *common
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: prestashop
      MYSQL_USER: prestashop
    secrets:
      - db_password
      - mysql_root_password
    volumes:
      - mysql-data:/var/lib/mysql
      - type: bind
        source: ./mysql/my.cnf
        target: /etc/mysql/conf.d/custom.cnf
        read_only: true
    networks:
      - backend
    deploy:
      resources:
        limits:
          memory: 4G
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
  
  redis:
    <<: *common
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass \${REDIS_PASSWORD}
    volumes:
      - redis-data:/data
    networks:
      - backend
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s

volumes:
  prestashop-data:
  mysql-data:
  redis-data:
  uploads:
  static-files:

networks:
  frontend:
  backend:
    internal: true

secrets:
  db_password:
    file: ./secrets/db_password.txt
  mysql_root_password:
    file: ./secrets/mysql_root_password.txt
</code></pre>

        <h2 class="section-title">9. Validación y Debug</h2>

        <pre><code class="language-bash"># Validar sintaxis
docker compose config

# Ver configuración final (con variables resueltas)
docker compose config

# Validar sin output
docker compose config --quiet

# Ver solo servicios
docker compose config --services

# Ver solo volúmenes
docker compose config --volumes

# Ver hash de configuración
docker compose config --hash="*"

# Convertir a JSON
docker compose config --format json

# Validar archivo específico
docker compose -f docker-compose.prod.yml config
</code></pre>

        <h2 class="section-title">10. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Archivos Compose:</strong>
            <ul class="mb-0">
                <li>Versión 3.8 para compatibilidad</li>
                <li>YAML anchors para DRY</li>
                <li>Secrets para datos sensibles</li>
                <li>Healthchecks en todos los servicios</li>
                <li>Named volumes mejor que bind mounts en prod</li>
                <li>restart: unless-stopped en producción</li>
                <li>Resource limits para evitar consumo excesivo</li>
                <li>Nombres descriptivos de servicios</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Evitar:</strong>
            <ul class="mb-0">
                <li>Links (deprecated, usar networks)</li>
                <li>Versión 2.x (usar 3.x)</li>
                <li>Hardcodear puertos en múltiples archivos</li>
                <li>Mezclar configuración de dev y prod</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>📋 Referencia Rápida:</strong>
            <ul class="mb-0">
                <li><strong>image:</strong> Imagen a usar</li>
                <li><strong>build:</strong> Build desde Dockerfile</li>
                <li><strong>ports:</strong> Publicar puertos</li>
                <li><strong>volumes:</strong> Montajes</li>
                <li><strong>environment:</strong> Variables</li>
                <li><strong>depends_on:</strong> Dependencias</li>
                <li><strong>networks:</strong> Redes</li>
                <li><strong>restart:</strong> Política de reinicio</li>
            </ul>
        </div>
    </div>
`;

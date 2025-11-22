// @ts-nocheck
const orquestacionMultiplesContenedores = `
    <div class="content-section">
        <h1 id="orquestacion-multiples-contenedores">Orquestación de Múltiples Contenedores</h1>
        <p>Gestión de aplicaciones complejas con múltiples servicios, escalado y load balancing para PrestaShop 8.9+.</p>

        <h2 class="section-title">1. Dependencias entre Servicios</h2>

        <h3>1.1. depends_on Básico</h3>

        <pre><code class="language-yaml">version: '3.8'

services:
  prestashop:
    image: prestashop:8.9
    depends_on:
      - mysql
      - redis
  
  mysql:
    image: mysql:8.0
  
  redis:
    image: redis:7-alpine

# Orden de inicio: mysql, redis → prestashop
</code></pre>

        <h3>1.2. depends_on con Healthcheck</h3>

        <pre><code class="language-yaml">services:
  prestashop:
    image: prestashop:8.9
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_started
  
  mysql:
    image: mysql:8.0
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
  
  redis:
    image: redis:7-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
</code></pre>

        <h2 class="section-title">2. Escalado de Servicios</h2>

        <pre><code class="language-yaml"># docker-compose.yml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - prestashop
  
  prestashop:
    image: prestashop:8.9
    # Sin ports publicados para escalar
    environment:
      - DB_SERVER=mysql
    depends_on:
      - mysql
  
  mysql:
    image: mysql:8.0
</code></pre>

        <pre><code class="language-bash"># Escalar servicio
docker compose up -d --scale prestashop=5

# Ver instancias
docker compose ps prestashop
</code></pre>

        <pre><code class="language-nginx"># nginx.conf - Load balancer
upstream prestashop_backend {
    server prestashop:80;
}

server {
    listen 80;
    
    location / {
        proxy_pass http://prestashop_backend;
        proxy_set_header Host \$host;
    }
}
</code></pre>

        <h2 class="section-title">3. Workers y Jobs</h2>

        <pre><code class="language-yaml">version: '3.8'

services:
  # Web server
  prestashop-web:
    image: prestashop:8.9
    ports:
      - "8080:80"
    environment:
      - APP_TYPE=web
  
  # Background workers
  prestashop-worker:
    image: prestashop:8.9
    command: php artisan queue:work
    environment:
      - APP_TYPE=worker
    deploy:
      replicas: 3
  
  # Scheduled tasks
  prestashop-cron:
    image: prestashop:8.9
    command: php artisan schedule:work
    environment:
      - APP_TYPE=cron
</code></pre>

        <h2 class="section-title">4. Microservicios</h2>

        <pre><code class="language-yaml">version: '3.8'

services:
  # API Gateway
  gateway:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./gateway/nginx.conf:/etc/nginx/nginx.conf
    networks:
      - frontend
  
  # Frontend Service
  frontend:
    build: ./frontend
    networks:
      - frontend
  
  # Products Microservice
  products-api:
    build: ./services/products
    networks:
      - frontend
      - backend
    depends_on:
      - products-db
  
  products-db:
    image: postgres:15
    networks:
      - backend
    volumes:
      - products-data:/var/lib/postgresql/data
  
  # Orders Microservice
  orders-api:
    build: ./services/orders
    networks:
      - frontend
      - backend
    depends_on:
      - orders-db
      - rabbitmq
  
  orders-db:
    image: mysql:8.0
    networks:
      - backend
    volumes:
      - orders-data:/var/lib/mysql
  
  # Users Microservice
  users-api:
    build: ./services/users
    networks:
      - frontend
      - backend
    depends_on:
      - users-db
  
  users-db:
    image: mongo:6
    networks:
      - backend
    volumes:
      - users-data:/data/db
  
  # Message Queue
  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "15672:15672"
    networks:
      - backend
  
  # Cache
  redis:
    image: redis:7-alpine
    networks:
      - backend

networks:
  frontend:
  backend:
    internal: true

volumes:
  products-data:
  orders-data:
  users-data:
</code></pre>

        <h2 class="section-title">5. Service Discovery</h2>

        <pre><code class="language-yaml"># DNS automático entre servicios
services:
  api:
    image: api:latest
    environment:
      # Usa nombres de servicios como hostnames
      - DB_HOST=mysql
      - CACHE_HOST=redis
      - QUEUE_HOST=rabbitmq
  
  mysql:
    image: mysql:8.0
    # Accesible en: mysql, mysql.backend
  
  redis:
    image: redis:7-alpine
    # Accesible en: redis
  
  rabbitmq:
    image: rabbitmq:3
    # Accesible en: rabbitmq
</code></pre>

        <h2 class="section-title">6. Inicialización de Datos</h2>

        <pre><code class="language-yaml">services:
  mysql:
    image: mysql:8.0
    volumes:
      # Scripts de inicialización
      - ./mysql/init:/docker-entrypoint-initdb.d
    environment:
      - MYSQL_ROOT_PASSWORD=root123
  
  prestashop:
    image: prestashop:8.9
    depends_on:
      mysql:
        condition: service_healthy
    # Wait-for-it script
    entrypoint: ["/wait-for-it.sh", "mysql:3306", "--", "apache2-foreground"]
</code></pre>

        <pre><code class="language-bash"># init.sql en mysql/init/
CREATE DATABASE IF NOT EXISTS prestashop;
CREATE USER IF NOT EXISTS 'psuser'@'%' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON prestashop.* TO 'psuser'@'%';
FLUSH PRIVILEGES;
</code></pre>

        <h2 class="section-title">7. Orchestration Patterns</h2>

        <h3>7.1. Sidecar Pattern</h3>

        <pre><code class="language-yaml">services:
  prestashop:
    image: prestashop:8.9
    volumes:
      - shared-logs:/var/log
  
  # Sidecar: Log aggregator
  logstash:
    image: logstash:8
    volumes:
      - shared-logs:/logs:ro
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    depends_on:
      - prestashop

volumes:
  shared-logs:
</code></pre>

        <h3>7.2. Ambassador Pattern</h3>

        <pre><code class="language-yaml">services:
  prestashop:
    image: prestashop:8.9
    environment:
      - DB_HOST=db-proxy
  
  # Ambassador: Database proxy
  db-proxy:
    image: haproxy:alpine
    volumes:
      - ./haproxy.cfg:/usr/local/etc/haproxy/haproxy.cfg:ro
    depends_on:
      - mysql-master
      - mysql-slave

  mysql-master:
    image: mysql:8.0
  
  mysql-slave:
    image: mysql:8.0
</code></pre>

        <h2 class="section-title">8. Rolling Updates</h2>

        <pre><code class="language-yaml">services:
  prestashop:
    image: prestashop:8.9
    deploy:
      replicas: 5
      update_config:
        parallelism: 2       # Actualizar 2 a la vez
        delay: 10s           # Esperar 10s entre actualizaciones
        failure_action: rollback
        monitor: 60s
      rollback_config:
        parallelism: 2
        delay: 5s
</code></pre>

        <pre><code class="language-bash"># Actualizar imagen
docker compose pull prestashop
docker compose up -d --no-deps prestashop

# O con build
docker compose build prestashop
docker compose up -d --no-deps prestashop
</code></pre>

        <h2 class="section-title">9. Resource Limits</h2>

        <pre><code class="language-yaml">services:
  prestashop:
    image: prestashop:8.9
    deploy:
      replicas: 3
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
          memory: 4G
</code></pre>

        <h2 class="section-title">10. Ejemplo Completo: E-commerce Stack</h2>

        <pre><code class="language-yaml">version: '3.8'

services:
  # Load Balancer
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - prestashop
    networks:
      - frontend
  
  # PrestaShop (escalable)
  prestashop:
    image: prestashop:8.9
    environment:
      - DB_SERVER=mysql
      - CACHE_SERVER=redis
      - SEARCH_HOST=elasticsearch
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - frontend
      - backend
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 2G
  
  # MySQL Primary
  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=\${MYSQL_ROOT_PASSWORD}
    volumes:
      - mysql-data:/var/lib/mysql
    networks:
      - backend
    healthcheck:
      test: ["CMD", "mysqladmin", "ping"]
      interval: 10s
  
  # Redis Cache
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data
    networks:
      - backend
  
  # Elasticsearch
  elasticsearch:
    image: elasticsearch:8.10.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    volumes:
      - elastic-data:/usr/share/elasticsearch/data
    networks:
      - backend
  
  # Background Workers
  worker:
    image: prestashop:8.9
    command: php bin/console worker:start
    deploy:
      replicas: 2
    depends_on:
      - rabbitmq
    networks:
      - backend
  
  # Message Queue
  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "15672:15672"
    volumes:
      - rabbitmq-data:/var/lib/rabbitmq
    networks:
      - backend

networks:
  frontend:
  backend:
    internal: true

volumes:
  mysql-data:
  redis-data:
  elastic-data:
  rabbitmq-data:
</code></pre>

        <h2 class="section-title">11. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Orquestación:</strong>
            <ul class="mb-0">
                <li>depends_on con healthchecks</li>
                <li>Escalar servicios stateless</li>
                <li>Load balancer para servicios escalados</li>
                <li>Resource limits en producción</li>
                <li>Service discovery con nombres DNS</li>
                <li>Separar web, workers y cron</li>
                <li>Init scripts para datos iniciales</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Evitar:</strong>
            <ul class="mb-0">
                <li>Escalar servicios con estado (BD)</li>
                <li>depends_on sin healthcheck (race conditions)</li>
                <li>Hardcodear hostnames (usar service names)</li>
                <li>Todos los servicios en una red</li>
            </ul>
        </div>
    </div>
`;

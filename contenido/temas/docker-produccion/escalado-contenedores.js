// @ts-nocheck
const escaladoContenedores = `
    <div class="content-section">
        <h1 id="escalado-contenedores">Escalado de Contenedores</h1>
        <p>Estrategias de escalado horizontal y vertical para contenedores Docker en producción con PrestaShop 8.9+.</p>

        <h2 class="section-title">1. Escalado Horizontal con Compose</h2>

        <pre><code class="language-yaml"># docker-compose.yml
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
    image: prestashop:8.9
    # Sin publicar puertos (nginx hace proxy)
    environment:
      - DB_SERVER=mysql
    depends_on:
      - mysql
  
  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=root123
</code></pre>

        <pre><code class="language-bash"># Escalar a 5 instancias
docker compose up -d --scale prestashop=5

# Verificar
docker compose ps prestashop

# Escalar dinámicamente
docker compose up -d --scale prestashop=10
docker compose up -d --scale prestashop=3  # Scale down
</code></pre>

        <h2 class="section-title">2. Load Balancer con Nginx</h2>

        <pre><code class="language-nginx"># nginx.conf
upstream prestashop_backend {
    # Round robin (default)
    server prestashop:80;
    
    # Cuando hay múltiples instancias, nginx resuelve DNS
    # y balancea entre todas
}

# Least connections
upstream prestashop_backend_lc {
    least_conn;
    server prestashop:80;
}

# IP Hash (sticky sessions)
upstream prestashop_backend_sticky {
    ip_hash;
    server prestashop:80;
}

# Weighted
upstream prestashop_backend_weighted {
    server prestashop:80 weight=3;
    server prestashop:80 weight=1;
}

server {
    listen 80;
    
    location / {
        proxy_pass http://prestashop_backend;
        proxy_set_header Host \\$host;
        proxy_set_header X-Real-IP \\$remote_addr;
        proxy_set_header X-Forwarded-For \\$proxy_add_x_forwarded_for;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffering
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\\n";
    }
}
</code></pre>

        <h2 class="section-title">3. HAProxy Load Balancer</h2>

        <pre><code class="language-yaml">services:
  haproxy:
    image: haproxy:alpine
    ports:
      - "80:80"
      - "8404:8404"  # Stats
    volumes:
      - ./haproxy.cfg:/usr/local/etc/haproxy/haproxy.cfg:ro
    depends_on:
      - prestashop
  
  prestashop:
    image: prestashop:8.9
    deploy:
      replicas: 5
</code></pre>

        <pre><code class="language-haproxy"># haproxy.cfg
global
    maxconn 4096
    log stdout format raw local0

defaults
    mode http
    timeout connect 5s
    timeout client 50s
    timeout server 50s
    log global
    option httplog

# Stats page
frontend stats
    bind *:8404
    stats enable
    stats uri /
    stats refresh 10s

# Frontend
frontend http_front
    bind *:80
    default_backend prestashop_back

# Backend con health checks
backend prestashop_back
    balance roundrobin
    option httpchk GET /health
    http-check expect status 200
    
    # Docker DNS resolution
    server-template prestashop 5 prestashop:80 check resolvers docker init-addr libc,none
    
resolvers docker
    nameserver dns1 127.0.0.11:53
    resolve_retries 3
    timeout resolve 1s
    timeout retry 1s
</code></pre>

        <h2 class="section-title">4. Escalado Vertical (Resources)</h2>

        <pre><code class="language-yaml">services:
  prestashop:
    image: prestashop:8.9
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
        reservations:
          cpus: '1.0'
          memory: 2G
    
    # Ajustar según carga
    environment:
      - PHP_MEMORY_LIMIT=512M
      - PHP_MAX_EXECUTION_TIME=60
</code></pre>

        <h2 class="section-title">5. Auto-scaling con Docker Swarm</h2>

        <pre><code class="language-bash"># Inicializar Swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml prestashop

# Ver servicios
docker service ls

# Escalar servicio
docker service scale prestashop_prestashop=10

# Ver replicas
docker service ps prestashop_prestashop
</code></pre>

        <pre><code class="language-yaml"># docker-compose.swarm.yml
version: '3.8'

services:
  prestashop:
    image: prestashop:8.9
    deploy:
      replicas: 5
      update_config:
        parallelism: 2
        delay: 10s
      restart_policy:
        condition: on-failure
        max_attempts: 3
      resources:
        limits:
          cpus: '2'
          memory: 2G
</code></pre>

        <h2 class="section-title">6. Shared Storage para Escalado</h2>

        <pre><code class="language-yaml">services:
  prestashop:
    image: prestashop:8.9
    volumes:
      # Shared uploads (NFS, EFS, GlusterFS)
      - type: volume
        source: shared-uploads
        target: /var/www/html/upload
        volume:
          driver: local
          driver_opts:
            type: nfs
            o: addr=nfs-server,rw
            device: ":/uploads"

volumes:
  shared-uploads:
    driver: local
    driver_opts:
      type: nfs
      o: addr=192.168.1.100,rw
      device: ":/mnt/uploads"
</code></pre>

        <h2 class="section-title">7. Session Sharing (Redis)</h2>

        <pre><code class="language-yaml">services:
  prestashop:
    image: prestashop:8.9
    environment:
      - REDIS_HOST=redis
      - SESSION_HANDLER=redis
    depends_on:
      - redis
  
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data

volumes:
  redis-data:
</code></pre>

        <pre><code class="language-php"><?php
// PrestaShop - configurar Redis sessions
// config/defines.inc.php
define('_PS_CACHE_ENABLED_', '1');
define('_PS_CACHING_SYSTEM_', 'CacheRedis');

// config/redis.php
return [
    'server' => getenv('REDIS_HOST') ?: 'redis',
    'port' => 6379,
    'database' => 0,
    'prefix' => 'ps_',
];
</code></pre>

        <h2 class="section-title">8. Database Scaling</h2>

        <h3>8.1. Read Replicas</h3>

        <pre><code class="language-yaml">services:
  mysql-master:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=root123
    volumes:
      - mysql-master-data:/var/lib/mysql
  
  mysql-replica:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=root123
    volumes:
      - mysql-replica-data:/var/lib/mysql
    deploy:
      replicas: 2
  
  # ProxySQL para routing
  proxysql:
    image: proxysql/proxysql:latest
    ports:
      - "6033:6033"
    volumes:
      - ./proxysql.cnf:/etc/proxysql.cnf:ro
</code></pre>

        <h2 class="section-title">9. Monitoring para Auto-scaling</h2>

        <pre><code class="language-bash"># Script de auto-scaling basado en CPU
#!/bin/bash

THRESHOLD=80
CURRENT_REPLICAS=\$(docker service inspect prestashop_prestashop --format='{{.Spec.Mode.Replicated.Replicas}}')
CPU_USAGE=\$(docker stats --no-stream --format "{{.CPUPerc}}" | sed 's/%//' | awk '{sum+=\\$1} END {print sum/NR}')

if (( \$(echo "\\$CPU_USAGE > \\$THRESHOLD" | bc -l) )); then
    NEW_REPLICAS=\$((CURRENT_REPLICAS + 2))
    docker service scale prestashop_prestashop=\\$NEW_REPLICAS
    echo "Scaled up to \\$NEW_REPLICAS replicas (CPU: \\$CPU_USAGE%)"
elif (( \$(echo "\\$CPU_USAGE < 30" | bc -l) )) && (( CURRENT_REPLICAS > 2 )); then
    NEW_REPLICAS=\$((CURRENT_REPLICAS - 1))
    docker service scale prestashop_prestashop=\\$NEW_REPLICAS
    echo "Scaled down to \\$NEW_REPLICAS replicas (CPU: \\$CPU_USAGE%)"
fi
</code></pre>

        <h2 class="section-title">10. Ejemplo Completo: Stack Escalable</h2>

        <pre><code class="language-yaml"># docker-compose.scale.yml
version: '3.8'

services:
  # Load Balancer
  haproxy:
    image: haproxy:alpine
    ports:
      - "80:80"
      - "8404:8404"
    volumes:
      - ./haproxy.cfg:/usr/local/etc/haproxy/haproxy.cfg:ro
    networks:
      - frontend
  
  # Scalable Application
  prestashop:
    image: prestashop:8.9
    deploy:
      replicas: 5
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
      update_config:
        parallelism: 2
        delay: 10s
    environment:
      - DB_SERVER=mysql
      - REDIS_HOST=redis
    volumes:
      - shared-uploads:/var/www/html/upload
    networks:
      - frontend
      - backend
  
  # Shared Session Store
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data
    networks:
      - backend
  
  # Database
  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=root123
    volumes:
      - mysql-data:/var/lib/mysql
    networks:
      - backend

networks:
  frontend:
  backend:
    internal: true

volumes:
  shared-uploads:
    driver: local
    driver_opts:
      type: nfs
      o: addr=nfs-server,rw
      device: ":/uploads"
  redis-data:
  mysql-data:
</code></pre>

        <h2 class="section-title">11. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Escalado:</strong>
            <ul class="mb-0">
                <li>Load balancer para distribuir tráfico</li>
                <li>Stateless containers (sesiones en Redis)</li>
                <li>Shared storage para uploads</li>
                <li>Health checks configurados</li>
                <li>Resource limits apropiados</li>
                <li>Auto-scaling basado en métricas</li>
                <li>Rolling updates sin downtime</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>📊 Cuándo Escalar:</strong>
            <ul class="mb-0">
                <li><strong>Horizontal:</strong> CPU > 70%, muchas requests</li>
                <li><strong>Vertical:</strong> Memory constrains, procesos lentos</li>
                <li><strong>Database:</strong> Read replicas si muchas queries SELECT</li>
            </ul>
        </div>
    </div>
`;

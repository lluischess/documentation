// @ts-nocheck
const redesVolumenesCompose = `
    <div class="content-section">
        <h1 id="redes-volumenes-compose">Redes y Volúmenes en Compose</h1>
        <p>Gestión avanzada de networking y almacenamiento persistente en Docker Compose para arquitecturas PrestaShop 8.9+.</p>

        <h2 class="section-title">1. Redes en Compose</h2>

        <h3>1.1. Red por Defecto</h3>

        <pre><code class="language-yaml"># Compose crea red bridge automáticamente
version: '3.8'

services:
  prestashop:
    image: prestashop:8.9
  
  mysql:
    image: mysql:8.0

# Ambos en red "proyecto_default"
# DNS automático: prestashop, mysql
</code></pre>

        <h3>1.2. Redes Personalizadas</h3>

        <pre><code class="language-yaml">version: '3.8'

services:
  nginx:
    image: nginx:alpine
    networks:
      - frontend
  
  prestashop:
    image: prestashop:8.9
    networks:
      - frontend
      - backend
  
  mysql:
    image: mysql:8.0
    networks:
      - backend

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true  # Sin acceso a internet
</code></pre>

        <h3>1.3. Red con Configuración</h3>

        <pre><code class="language-yaml">networks:
  frontend:
    driver: bridge
    driver_opts:
      com.docker.network.bridge.name: frontend-br
    ipam:
      driver: default
      config:
        - subnet: 172.20.0.0/16
          gateway: 172.20.0.1
          ip_range: 172.20.1.0/24
  
  backend:
    driver: bridge
    internal: true
    ipam:
      config:
        - subnet: 172.21.0.0/16
</code></pre>

        <h3>1.4. IP Estática</h3>

        <pre><code class="language-yaml">services:
  mysql:
    image: mysql:8.0
    networks:
      backend:
        ipv4_address: 172.21.0.10

networks:
  backend:
    ipam:
      config:
        - subnet: 172.21.0.0/16
</code></pre>

        <h3>1.5. Alias de Red</h3>

        <pre><code class="language-yaml">services:
  prestashop:
    image: prestashop:8.9
    networks:
      backend:
        aliases:
          - app
          - prestashop-app
          - ps

# Accesible por: prestashop, app, prestashop-app, ps
</code></pre>

        <h3>1.6. Red Externa</h3>

        <pre><code class="language-yaml"># Red creada externamente
networks:
  external-net:
    external: true
    name: my-pre-existing-network

services:
  prestashop:
    networks:
      - external-net
</code></pre>

        <h2 class="section-title">2. Volúmenes en Compose</h2>

        <h3>2.1. Named Volumes</h3>

        <pre><code class="language-yaml">version: '3.8'

services:
  prestashop:
    image: prestashop:8.9
    volumes:
      - prestashop-data:/var/www/html
      - uploads:/var/www/html/upload
  
  mysql:
    image: mysql:8.0
    volumes:
      - mysql-data:/var/lib/mysql

volumes:
  prestashop-data:
  uploads:
  mysql-data:

# Creados como: proyecto_prestashop-data, etc.
</code></pre>

        <h3>2.2. Volumen con Driver</h3>

        <pre><code class="language-yaml">volumes:
  mysql-data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /mnt/data/mysql
  
  nfs-volume:
    driver: local
    driver_opts:
      type: nfs
      o: addr=192.168.1.100,rw
      device: ":/path/to/dir"
</code></pre>

        <h3>2.3. Volumen Externo</h3>

        <pre><code class="language-bash"># Crear volumen externamente
docker volume create --name shared-uploads

# Usar en compose
</code></pre>

        <pre><code class="language-yaml">volumes:
  uploads:
    external: true
    name: shared-uploads
</code></pre>

        <h3>2.4. Bind Mounts</h3>

        <pre><code class="language-yaml">services:
  prestashop:
    volumes:
      # Bind mount relativo
      - ./src:/var/www/html/src
      
      # Bind mount absoluto
      - /host/path:/container/path
      
      # Read-only
      - ./config:/etc/config:ro
      
      # Con opciones
      - type: bind
        source: ./modules
        target: /var/www/html/modules
        read_only: false
        bind:
          propagation: rprivate
</code></pre>

        <h3>2.5. tmpfs</h3>

        <pre><code class="language-yaml">services:
  prestashop:
    tmpfs:
      - /tmp
      - /run
      
    # O con opciones
    tmpfs:
      - type: tmpfs
        target: /cache
        tmpfs:
          size: 100m
          mode: 1777
</code></pre>

        <h2 class="section-title">3. Arquitectura Multi-Red</h2>

        <pre><code class="language-yaml"># 3-tier architecture
version: '3.8'

services:
  # Public tier
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    networks:
      - public
    volumes:
      - static:/var/www/html/static:ro
  
  # Application tier
  prestashop:
    image: prestashop:8.9
    networks:
      - public
      - app
      - data
    volumes:
      - prestashop-data:/var/www/html
      - static:/var/www/html/static
  
  # Data tier
  mysql:
    image: mysql:8.0
    networks:
      - data
    volumes:
      - mysql-data:/var/lib/mysql
  
  redis:
    image: redis:7-alpine
    networks:
      - data

networks:
  public:
    driver: bridge
  app:
    driver: bridge
    internal: true
  data:
    driver: bridge
    internal: true

volumes:
  prestashop-data:
  mysql-data:
  static:
</code></pre>

        <h2 class="section-title">4. Compartir Volúmenes</h2>

        <pre><code class="language-yaml">services:
  prestashop-web:
    image: prestashop:8.9
    volumes:
      - shared-uploads:/var/www/html/upload
  
  prestashop-worker:
    image: prestashop:8.9
    command: php worker.php
    volumes:
      - shared-uploads:/var/www/html/upload
  
  backup:
    image: busybox
    volumes:
      - shared-uploads:/data:ro
    command: tar czf /backup/uploads.tar.gz /data

volumes:
  shared-uploads:
</code></pre>

        <h2 class="section-title">5. Volúmenes Anónimos</h2>

        <pre><code class="language-yaml">services:
  prestashop:
    image: prestashop:8.9
    volumes:
      # Volumen anónimo (sin nombre)
      - /var/www/html/var/cache
      
      # Override con named volume
      - cache-data:/var/www/html/var/cache

volumes:
  cache-data:
</code></pre>

        <h2 class="section-title">6. Backup y Restore</h2>

        <pre><code class="language-bash"># Backup de volumen
docker compose run --rm \\
  -v prestashop-data:/source:ro \\
  -v $(pwd)/backups:/backup \\
  busybox \\
  tar czf /backup/prestashop-\$(date +%Y%m%d).tar.gz -C /source .

# Restore
docker compose run --rm \\
  -v prestashop-data:/target \\
  -v $(pwd)/backups:/backup \\
  busybox \\
  tar xzf /backup/prestashop-20240101.tar.gz -C /target
</code></pre>

        <pre><code class="language-yaml"># Servicio de backup en compose
services:
  backup:
    image: alpine:latest
    volumes:
      - prestashop-data:/data/prestashop:ro
      - mysql-data:/data/mysql:ro
      - ./backups:/backups
    command: |
      sh -c "tar czf /backups/backup-\$(date +%Y%m%d-%H%M%S).tar.gz /data"
    profiles:
      - backup
</code></pre>

        <h2 class="section-title">7. Limpieza</h2>

        <pre><code class="language-bash"># Listar volúmenes
docker compose volume ls

# Eliminar volúmenes al hacer down
docker compose down -v

# Eliminar solo volúmenes no usados
docker compose down
docker volume prune
</code></pre>

        <h2 class="section-title">8. Ejemplo Completo</h2>

        <pre><code class="language-yaml">version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    networks:
      - frontend
    volumes:
      - static-files:/var/www/html/static:ro
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
  
  prestashop:
    image: prestashop:8.9
    networks:
      frontend:
        aliases:
          - app
      backend:
    volumes:
      - prestashop-code:/var/www/html
      - uploads:/var/www/html/upload
      - static-files:/var/www/html/static
      - ./modules:/var/www/html/modules
      - type: tmpfs
        target: /tmp
  
  mysql:
    image: mysql:8.0
    networks:
      backend:
        ipv4_address: 172.21.0.10
    volumes:
      - mysql-data:/var/lib/mysql
      - ./mysql/my.cnf:/etc/mysql/conf.d/custom.cnf:ro
  
  redis:
    image: redis:7-alpine
    networks:
      - backend
    volumes:
      - redis-data:/data

networks:
  frontend:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
  
  backend:
    driver: bridge
    internal: true
    ipam:
      config:
        - subnet: 172.21.0.0/16

volumes:
  prestashop-code:
  uploads:
    driver: local
  mysql-data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /mnt/data/mysql
  redis-data:
  static-files:
</code></pre>

        <h2 class="section-title">9. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Redes y Volúmenes:</strong>
            <ul class="mb-0">
                <li>Redes separadas por capa (frontend/backend)</li>
                <li>internal: true para redes privadas</li>
                <li>Named volumes para datos importantes</li>
                <li>Bind mounts solo en desarrollo</li>
                <li>Backup automático de volúmenes</li>
                <li>Alias descriptivos para servicios</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Evitar:</strong>
            <ul class="mb-0">
                <li>IP estáticas innecesarias (usar DNS)</li>
                <li>Exponer servicios internos a red pública</li>
                <li>Bind mounts en producción</li>
                <li>Volúmenes anónimos para datos importantes</li>
            </ul>
        </div>
    </div>
`;

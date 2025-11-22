// @ts-nocheck
const dockerSwarmOrquestacion = `
    <div class="content-section">
        <h1 id="docker-swarm-orquestacion">Docker Swarm para Orquestación</h1>
        <p>Orquestación nativa de Docker para gestionar clusters de contenedores en producción con PrestaShop 8.9+.</p>

        <h2 class="section-title">1. Conceptos de Swarm</h2>

        <div class="alert alert-info">
            <strong>📦 Docker Swarm:</strong>
            <ul class="mb-0">
                <li>Orquestación nativa de Docker</li>
                <li>Cluster de múltiples hosts</li>
                <li>Load balancing integrado</li>
                <li>Service discovery automático</li>
                <li>Rolling updates</li>
                <li>Secrets management</li>
            </ul>
        </div>

        <h2 class="section-title">2. Inicializar Swarm</h2>

        <pre><code class="language-bash"># Manager node
docker swarm init --advertise-addr 192.168.1.10

# Output: token para workers
# docker swarm join --token SWMTKN-1-xxx 192.168.1.10:2377

# Ver info del swarm
docker info | grep Swarm

# Listar nodes
docker node ls
</code></pre>

        <h3>2.1. Añadir Workers</h3>

        <pre><code class="language-bash"># En worker nodes
docker swarm join --token SWMTKN-1-xxx 192.168.1.10:2377

# Obtener token desde manager
docker swarm join-token worker
docker swarm join-token manager

# Promover worker a manager
docker node promote worker-node-1
</code></pre>

        <h2 class="section-title">3. Deploy Services</h2>

        <pre><code class="language-bash"># Crear servicio simple
docker service create \\
  --name prestashop \\
  --replicas 3 \\
  --publish 8080:80 \\
  prestashop:8.9

# Listar servicios
docker service ls

# Ver detalles
docker service ps prestashop

# Inspect
docker service inspect prestashop
</code></pre>

        <h2 class="section-title">4. Docker Stack (Compose para Swarm)</h2>

        <pre><code class="language-yaml"># docker-stack.yml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    deploy:
      replicas: 2
      placement:
        constraints:
          - node.role == manager
    networks:
      - frontend
  
  prestashop:
    image: prestashop:8.9
    deploy:
      replicas: 5
      update_config:
        parallelism: 2
        delay: 10s
        failure_action: rollback
      restart_policy:
        condition: on-failure
        max_attempts: 3
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
      placement:
        constraints:
          - node.role == worker
    secrets:
      - db_password
    networks:
      - frontend
      - backend
  
  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD_FILE=/run/secrets/mysql_root_password
    secrets:
      - mysql_root_password
      - db_password
    volumes:
      - mysql-data:/var/lib/mysql
    deploy:
      replicas: 1
      placement:
        constraints:
          - node.labels.type == database
    networks:
      - backend
  
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data
    deploy:
      replicas: 1
    networks:
      - backend

networks:
  frontend:
  backend:

volumes:
  mysql-data:
  redis-data:

secrets:
  db_password:
    external: true
  mysql_root_password:
    external: true
</code></pre>

        <pre><code class="language-bash"># Crear secrets
echo "mySecurePassword" | docker secret create db_password -
echo "rootPassword" | docker secret create mysql_root_password -

# Deploy stack
docker stack deploy -c docker-stack.yml prestashop

# Listar stacks
docker stack ls

# Servicios del stack
docker stack services prestashop

# Ver contenedores
docker stack ps prestashop

# Remover stack
docker stack rm prestashop
</code></pre>

        <h2 class="section-title">5. Escalado</h2>

        <pre><code class="language-bash"># Escalar servicio
docker service scale prestashop_prestashop=10

# Ver replicas
docker service ps prestashop_prestashop

# Scale down
docker service scale prestashop_prestashop=3
</code></pre>

        <h2 class="section-title">6. Rolling Updates</h2>

        <pre><code class="language-bash"># Actualizar imagen
docker service update --image prestashop:8.9.1 prestashop_prestashop

# Con configuración de update
docker service update \\
  --update-parallelism 2 \\
  --update-delay 10s \\
  --image prestashop:8.9.1 \\
  prestashop_prestashop

# Rollback
docker service rollback prestashop_prestashop

# Ver historial
docker service inspect --pretty prestashop_prestashop
</code></pre>

        <h2 class="section-title">7. Placement Constraints</h2>

        <pre><code class="language-yaml">services:
  prestashop:
    deploy:
      placement:
        constraints:
          # Solo workers
          - node.role == worker
          # Node con label específico
          - node.labels.type == app
          # Hostname específico
          - node.hostname == worker-1
        preferences:
          # Spread por zona
          - spread: node.labels.zone
</code></pre>

        <pre><code class="language-bash"># Añadir labels a nodes
docker node update --label-add type=app worker-1
docker node update --label-add zone=us-east worker-2
</code></pre>

        <h2 class="section-title">8. Overlay Network</h2>

        <pre><code class="language-bash"># Crear overlay network
docker network create \\
  --driver overlay \\
  --attachable \\
  my-overlay-net

# Encriptada
docker network create \\
  --driver overlay \\
  --opt encrypted \\
  secure-net

# Listar
docker network ls
</code></pre>

        <h2 class="section-title">9. Health Checks</h2>

        <pre><code class="language-yaml">services:
  prestashop:
    image: prestashop:8.9
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 40s
    deploy:
      replicas: 5
</code></pre>

        <h2 class="section-title">10. Configs</h2>

        <pre><code class="language-bash"># Crear config
docker config create nginx_v1 nginx.conf

# Usar en servicio
docker service create \\
  --config source=nginx_v1,target=/etc/nginx/nginx.conf \\
  nginx:alpine
</code></pre>

        <pre><code class="language-yaml">services:
  nginx:
    image: nginx:alpine
    configs:
      - source: nginx_v1
        target: /etc/nginx/nginx.conf
        mode: 0440

configs:
  nginx_v1:
    external: true
</code></pre>

        <h2 class="section-title">11. Drain y Maintenance</h2>

        <pre><code class="language-bash"># Drenar node (no schedule nuevos contenedores)
docker node update --availability drain worker-1

# Ver nodes
docker node ls

# Activar nuevamente
docker node update --availability active worker-1

# Remover node
docker node rm worker-1

# Leave swarm (desde el node)
docker swarm leave
</code></pre>

        <h2 class="section-title">12. Ejemplo Completo Producción</h2>

        <pre><code class="language-yaml"># production-stack.yml
version: '3.8'

services:
  traefik:
    image: traefik:v2.10
    command:
      - "--api.dashboard=true"
      - "--providers.docker.swarmMode=true"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    deploy:
      replicas: 1
      placement:
        constraints:
          - node.role == manager
    networks:
      - traefik-public
  
  prestashop:
    image: prestashop:8.9
    deploy:
      replicas: 10
      update_config:
        parallelism: 2
        delay: 10s
        order: start-first
      rollback_config:
        parallelism: 2
      restart_policy:
        condition: on-failure
        max_attempts: 3
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.prestashop.rule=Host(\`shop.com\`)"
        - "traefik.http.services.prestashop.loadbalancer.server.port=80"
    secrets:
      - db_password
    configs:
      - source: php_config
        target: /usr/local/etc/php/php.ini
    networks:
      - traefik-public
      - backend
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
  
  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD_FILE=/run/secrets/mysql_root
    secrets:
      - mysql_root
      - db_password
    volumes:
      - mysql-data:/var/lib/mysql
    deploy:
      replicas: 1
      placement:
        constraints:
          - node.labels.type == database
    networks:
      - backend
  
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass \${REDIS_PASSWORD}
    volumes:
      - redis-data:/data
    deploy:
      replicas: 3
    networks:
      - backend

networks:
  traefik-public:
    external: true
  backend:
    driver: overlay
    internal: true

volumes:
  mysql-data:
  redis-data:

secrets:
  db_password:
    external: true
  mysql_root:
    external: true

configs:
  php_config:
    external: true
</code></pre>

        <h2 class="section-title">13. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Docker Swarm:</strong>
            <ul class="mb-0">
                <li>Múltiples managers (3 o 5) para HA</li>
                <li>Secrets para datos sensibles</li>
                <li>Placement constraints para servicios críticos</li>
                <li>Health checks en todos los servicios</li>
                <li>Rolling updates configurados</li>
                <li>Resource limits definidos</li>
                <li>Overlay networks para aislamiento</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>🆚 Swarm vs Kubernetes:</strong>
            <ul class="mb-0">
                <li><strong>Swarm:</strong> Simple, integrado, Docker nativo</li>
                <li><strong>K8s:</strong> Complejo, ecosistema amplio, industry standard</li>
                <li><strong>Usar Swarm:</strong> Equipos pequeños, setup simple</li>
                <li><strong>Usar K8s:</strong> Escala masiva, multi-cloud</li>
            </ul>
        </div>
    </div>
`;

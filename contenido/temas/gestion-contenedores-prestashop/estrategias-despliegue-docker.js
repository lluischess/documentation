// @ts-nocheck
const estrategiasDespliegueDocker = `
    <div class="content-section">
        <h1 id="estrategias-despliegue-docker">Estrategias de Despliegue con Docker</h1>
        <p>Implementación de estrategias de despliegue avanzadas para tiendas PrestaShop 8.9+ usando contenedores Docker sin downtime.</p>

        <h2 class="section-title">1. Blue-Green Deployment</h2>

        <p>Mantener dos entornos idénticos: Blue (actual) y Green (nuevo). Cambiar tráfico instantáneamente.</p>

        <h3>1.1. Setup Básico</h3>

        <pre><code class="language-yaml"># docker-compose.blue.yml
version: '3.8'

services:
  prestashop-blue:
    image: prestashop:8.9.0
    container_name: prestashop-blue
    environment:
      - DB_SERVER=mysql
      - PS_INSTALL_AUTO=0
    volumes:
      - blue-data:/var/www/html
    networks:
      - prestashop-net

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx-blue.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - prestashop-blue
    networks:
      - prestashop-net

volumes:
  blue-data:

networks:
  prestashop-net:
    external: true
</code></pre>

        <pre><code class="language-yaml"># docker-compose.green.yml
version: '3.8'

services:
  prestashop-green:
    image: prestashop:8.9.1  # Nueva versión
    container_name: prestashop-green
    environment:
      - DB_SERVER=mysql
      - PS_INSTALL_AUTO=0
    volumes:
      - green-data:/var/www/html
    networks:
      - prestashop-net

volumes:
  green-data:

networks:
  prestashop-net:
    external: true
</code></pre>

        <h3>1.2. Nginx Switch</h3>

        <pre><code class="language-nginx"># nginx-blue.conf
upstream backend {
    server prestashop-blue:80;
}

server {
    listen 80;
    location / {
        proxy_pass http://backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
</code></pre>

        <pre><code class="language-nginx"># nginx-green.conf
upstream backend {
    server prestashop-green:80;
}

server {
    listen 80;
    location / {
        proxy_pass http://backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
</code></pre>

        <h3>1.3. Script de Despliegue</h3>

        <pre><code class="language-bash">#!/bin/bash
# blue-green-deploy.sh
set -e

CURRENT_ENV=\$(cat .current-env)
NEW_ENV=\$([ "\$CURRENT_ENV" = "blue" ] && echo "green" || echo "blue")

echo "Current: \$CURRENT_ENV, Deploying: \$NEW_ENV"

# 1. Deploy nueva versión
docker-compose -f docker-compose.\${NEW_ENV}.yml up -d

# 2. Esperar a que esté listo
echo "Waiting for \$NEW_ENV to be ready..."
for i in {1..30}; do
    if docker exec prestashop-\${NEW_ENV} curl -f http://localhost/health > /dev/null 2>&1; then
        echo "\$NEW_ENV is healthy"
        break
    fi
    sleep 2
done

# 3. Copiar datos si es necesario
if [ "\$CURRENT_ENV" = "blue" ]; then
    docker cp prestashop-blue:/var/www/html/upload/. prestashop-green:/var/www/html/upload/
fi

# 4. Smoke tests
echo "Running smoke tests..."
curl -f http://localhost:8081/ || exit 1  # Green usa puerto 8081 temporalmente

# 5. Switch nginx
cp nginx-\${NEW_ENV}.conf nginx.conf
docker-compose up -d nginx --force-recreate

# 6. Verificar
sleep 5
curl -f http://localhost/ || {
    echo "Deploy failed, rolling back..."
    cp nginx-\${CURRENT_ENV}.conf nginx.conf
    docker-compose up -d nginx --force-recreate
    exit 1
}

# 7. Stop old environment
echo "Stopping \$CURRENT_ENV..."
docker-compose -f docker-compose.\${CURRENT_ENV}.yml down

# 8. Update current
echo "\$NEW_ENV" > .current-env

echo "Deploy successful! Now running \$NEW_ENV"
</code></pre>

        <h2 class="section-title">2. Canary Deployment</h2>

        <p>Desplegar nueva versión gradualmente, enviando un porcentaje pequeño del tráfico inicialmente.</p>

        <pre><code class="language-yaml"># docker-compose.canary.yml
version: '3.8'

services:
  # Versión estable - 90% tráfico
  prestashop-stable:
    image: prestashop:8.9.0
    deploy:
      replicas: 9
    environment:
      - DB_SERVER=mysql
    networks:
      - prestashop

  # Versión canary - 10% tráfico
  prestashop-canary:
    image: prestashop:8.9.1
    deploy:
      replicas: 1
    environment:
      - DB_SERVER=mysql
      - PS_DEV_MODE=1  # Más logging
    networks:
      - prestashop

  # HAProxy para distribución de tráfico
  haproxy:
    image: haproxy:alpine
    ports:
      - "80:80"
      - "8404:8404"  # Stats
    volumes:
      - ./haproxy-canary.cfg:/usr/local/etc/haproxy/haproxy.cfg:ro
    networks:
      - prestashop

networks:
  prestashop:
</code></pre>

        <pre><code class="language-haproxy"># haproxy-canary.cfg
global
    maxconn 4096

defaults
    mode http
    timeout connect 5s
    timeout client 50s
    timeout server 50s

# Stats
frontend stats
    bind *:8404
    stats enable
    stats uri /
    stats refresh 5s

# Frontend público
frontend http_front
    bind *:80
    
    # Logs con identificador de versión
    http-request set-header X-Version stable
    
    # 10% al canary
    acl is_canary rand(100) lt 10
    use_backend canary_back if is_canary
    
    default_backend stable_back

# Backend estable (90%)
backend stable_back
    balance roundrobin
    option httpchk GET /health
    http-check expect status 200
    server-template stable 9 prestashop-stable:80 check

# Backend canary (10%)
backend canary_back
    balance roundrobin
    option httpchk GET /health
    http-check expect status 200
    http-response set-header X-Version canary
    server-template canary 1 prestashop-canary:80 check
</code></pre>

        <h3>2.1. Script de Canary Progressivo</h3>

        <pre><code class="language-bash">#!/bin/bash
# canary-deploy.sh
set -e

# Fase 1: 10% tráfico
echo "Phase 1: 10% traffic to canary"
docker service scale prestashop_prestashop-canary=1
docker service scale prestashop_prestashop-stable=9
sleep 300  # 5 minutos

# Check metrics
ERROR_RATE=\$(curl -s http://prometheus:9090/api/v1/query?query=rate\(http_errors_total\[5m\]\) | jq .data.result[0].value[1])
if (( \$(echo "\$ERROR_RATE > 0.01" | bc -l) )); then
    echo "Error rate too high! Rolling back..."
    docker service scale prestashop_prestashop-canary=0
    docker service scale prestashop_prestashop-stable=10
    exit 1
fi

# Fase 2: 25% tráfico
echo "Phase 2: 25% traffic to canary"
docker service scale prestashop_prestashop-canary=3
docker service scale prestashop_prestashop-stable=7
sleep 300

# Fase 3: 50% tráfico
echo "Phase 3: 50% traffic to canary"
docker service scale prestashop_prestashop-canary=5
docker service scale prestashop_prestashop-stable=5
sleep 300

# Fase 4: 100% tráfico
echo "Phase 4: 100% traffic to canary"
docker service scale prestashop_prestashop-canary=10
docker service scale prestashop_prestashop-stable=0

echo "Canary deployment successful!"
</code></pre>

        <h2 class="section-title">3. Rolling Update</h2>

        <p>Actualización gradual de instancias, sin downtime.</p>

        <pre><code class="language-yaml"># docker-compose.rolling.yml
version: '3.8'

services:
  prestashop:
    image: prestashop:8.9.1
    deploy:
      replicas: 5
      update_config:
        parallelism: 1        # Actualizar de 1 en 1
        delay: 30s            # Esperar 30s entre cada una
        order: start-first    # Iniciar nueva antes de parar vieja
        failure_action: rollback
        monitor: 60s
      rollback_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
        max_attempts: 3
</code></pre>

        <pre><code class="language-bash"># Rolling update con Docker Swarm
docker service update \\
  --image prestashop:8.9.1 \\
  --update-parallelism 1 \\
  --update-delay 30s \\
  --update-order start-first \\
  prestashop_prestashop

# Ver progreso
docker service ps prestashop_prestashop

# Rollback si falla
docker service rollback prestashop_prestashop
</code></pre>

        <h2 class="section-title">4. Recreate (Downtime Aceptable)</h2>

        <pre><code class="language-bash"># Estrategia más simple: parar todo y recrear
docker-compose down
docker-compose pull
docker-compose up -d

# Con backup de DB primero
docker exec mysql mysqldump -u root -p\${MYSQL_ROOT_PASSWORD} prestashop > backup.sql
docker-compose down
docker-compose pull
docker-compose up -d
</code></pre>

        <h2 class="section-title">5. A/B Testing</h2>

        <pre><code class="language-nginx"># nginx-ab-testing.conf
upstream backend_a {
    server prestashop-a:80;
}

upstream backend_b {
    server prestashop-b:80;
}

# Split por cookie
map \$cookie_version \$backend {
    "b" backend_b;
    default backend_a;
}

# Split por región
geo \$geo_backend {
    default backend_a;
    192.168.1.0/24 backend_b;  # Red específica usa versión B
}

server {
    listen 80;
    
    location / {
        # A/B test: 50% cada uno
        if (\$http_x_ab_test = "") {
            set \$http_x_ab_test \$request_id;
        }
        
        # Hash del request_id para distribuir 50/50
        set \$ab_hash 0;
        if (\$http_x_ab_test ~ "^[0-9a-f]{16}") {
            set \$ab_hash 1;
        }
        
        proxy_pass http://\$backend;
        proxy_set_header Host \$host;
        proxy_set_header X-AB-Version \$backend;
    }
}
</code></pre>

        <h2 class="section-title">6. Feature Flags en PrestaShop</h2>

        <pre><code class="language-php"><?php
// PrestaShop - Feature flags para deploy gradual
class FeatureFlags
{
    private $redis;
    
    public function __construct()
    {
        $this->redis = new Redis();
        $this->redis->connect('redis', 6379);
    }
    
    public function isEnabled(string $feature, int $customerId): bool
    {
        // Verificar si feature está habilitado
        $enabled = $this->redis->get("feature:{$feature}:enabled");
        if ($enabled === 'false') {
            return false;
        }
        
        // Rollout gradual: % de usuarios
        $rolloutPercent = (int)$this->redis->get("feature:{$feature}:rollout") ?: 0;
        if ($rolloutPercent === 100) {
            return true;
        }
        
        // Hash del customer ID para distribución consistente
        $hash = crc32($customerId) % 100;
        return $hash < $rolloutPercent;
    }
    
    public function setRollout(string $feature, int $percent): void
    {
        $this->redis->set("feature:{$feature}:rollout", $percent);
    }
}

// Uso en módulo
class MyModule extends Module
{
    public function hookDisplayHome($params)
    {
        $featureFlags = new FeatureFlags();
        
        // Nueva feature solo para % de usuarios
        if ($featureFlags->isEnabled('new_checkout', $this->context->customer->id)) {
            return $this->display(__FILE__, 'views/templates/hook/new_checkout.tpl');
        }
        
        return $this->display(__FILE__, 'views/templates/hook/old_checkout.tpl');
    }
}
</code></pre>

        <h2 class="section-title">7. Health Checks y Readiness</h2>

        <pre><code class="language-php"><?php
// health.php - Endpoint de health check
header('Content-Type: application/json');

$health = [
    'status' => 'healthy',
    'checks' => []
];

// Check database
try {
    $db = Db::getInstance();
    $db->executeS('SELECT 1');
    $health['checks']['database'] = 'ok';
} catch (Exception $e) {
    $health['status'] = 'unhealthy';
    $health['checks']['database'] = 'error';
}

// Check Redis
try {
    $redis = new Redis();
    $redis->connect('redis', 6379);
    $redis->ping();
    $health['checks']['redis'] = 'ok';
} catch (Exception $e) {
    $health['status'] = 'unhealthy';
    $health['checks']['redis'] = 'error';
}

// Check filesystem
if (is_writable(_PS_CACHE_DIR_)) {
    $health['checks']['cache_writable'] = 'ok';
} else {
    $health['status'] = 'degraded';
    $health['checks']['cache_writable'] = 'error';
}

http_response_code($health['status'] === 'healthy' ? 200 : 503);
echo json_encode($health, JSON_PRETTY_PRINT);
</code></pre>

        <pre><code class="language-yaml">services:
  prestashop:
    image: prestashop:8.9
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health.php"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 60s
</code></pre>

        <h2 class="section-title">8. Comparativa de Estrategias</h2>

        <table>
            <thead>
                <tr>
                    <th>Estrategia</th>
                    <th>Downtime</th>
                    <th>Complejidad</th>
                    <th>Rollback</th>
                    <th>Recursos</th>
                    <th>Uso</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Blue-Green</strong></td>
                    <td>0s</td>
                    <td>Media</td>
                    <td>Instantáneo</td>
                    <td>2x</td>
                    <td>Deploys mayores</td>
                </tr>
                <tr>
                    <td><strong>Canary</strong></td>
                    <td>0s</td>
                    <td>Alta</td>
                    <td>Rápido</td>
                    <td>1.1x</td>
                    <td>Releases críticos</td>
                </tr>
                <tr>
                    <td><strong>Rolling</strong></td>
                    <td>0s</td>
                    <td>Baja</td>
                    <td>Medio</td>
                    <td>1x</td>
                    <td>Uso general</td>
                </tr>
                <tr>
                    <td><strong>Recreate</strong></td>
                    <td>1-5min</td>
                    <td>Muy baja</td>
                    <td>Manual</td>
                    <td>1x</td>
                    <td>Dev/staging</td>
                </tr>
                <tr>
                    <td><strong>A/B Testing</strong></td>
                    <td>0s</td>
                    <td>Alta</td>
                    <td>Instantáneo</td>
                    <td>2x</td>
                    <td>Testing features</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">9. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Deployment:</strong>
            <ul class="mb-0">
                <li>Siempre hacer backup de DB antes de deploy</li>
                <li>Health checks configurados</li>
                <li>Rollback automático si fallan checks</li>
                <li>Logs detallados del proceso</li>
                <li>Notificaciones de deploy (Slack, email)</li>
                <li>Smoke tests automatizados</li>
                <li>Ventanas de mantenimiento planificadas</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>📋 Checklist Pre-Deploy:</strong>
            <ol class="mb-0">
                <li>✅ Backup de base de datos</li>
                <li>✅ Tests pasando en CI</li>
                <li>✅ Nuevo contenedor healthy</li>
                <li>✅ Migraciones de DB probadas</li>
                <li>✅ Plan de rollback listo</li>
                <li>✅ Monitoreo activo</li>
                <li>✅ Equipo notificado</li>
            </ol>
        </div>
    </div>
`;

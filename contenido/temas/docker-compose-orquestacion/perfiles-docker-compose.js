// @ts-nocheck
const perfilesDockerCompose = `
    <div class="content-section">
        <h1 id="perfiles-docker-compose">Perfiles en Docker Compose</h1>
        <p>Gestión de servicios opcionales y configuraciones específicas por entorno en Docker Compose para PrestaShop 8.9+.</p>

        <h2 class="section-title">1. Conceptos de Perfiles</h2>

        <p>Los perfiles permiten activar/desactivar servicios según el contexto (desarrollo, testing, producción, debugging).</p>

        <pre><code class="language-yaml">version: '3.8'

services:
  # Servicios principales (siempre activos)
  prestashop:
    image: prestashop:8.9
  
  mysql:
    image: mysql:8.0
  
  # Servicios con perfil (solo si se activan)
  phpmyadmin:
    image: phpmyadmin:latest
    profiles:
      - dev
      - debug
  
  mailhog:
    image: mailhog/mailhog
    profiles:
      - dev
</code></pre>

        <pre><code class="language-bash"># Sin perfil: solo prestashop y mysql
docker compose up -d

# Con perfil dev: + phpmyadmin y mailhog
docker compose --profile dev up -d

# Múltiples perfiles
docker compose --profile dev --profile test up -d
</code></pre>

        <h2 class="section-title">2. Casos de Uso</h2>

        <h3>2.1. Desarrollo</h3>

        <pre><code class="language-yaml">services:
  prestashop:
    image: prestashop:8.9
  
  # Herramientas de desarrollo
  phpmyadmin:
    image: phpmyadmin:latest
    ports:
      - "8081:80"
    profiles:
      - dev
  
  mailhog:
    image: mailhog/mailhog
    ports:
      - "8025:8025"
    profiles:
      - dev
  
  adminer:
    image: adminer
    ports:
      - "8082:8080"
    profiles:
      - dev
</code></pre>

        <h3>2.2. Testing</h3>

        <pre><code class="language-yaml">services:
  # Test database
  mysql-test:
    image: mysql:8.0
    environment:
      - MYSQL_DATABASE=prestashop_test
    profiles:
      - test
  
  # Test runner
  phpunit:
    build: .
    command: vendor/bin/phpunit
    depends_on:
      - mysql-test
    profiles:
      - test
</code></pre>

        <pre><code class="language-bash"># Ejecutar tests
docker compose --profile test run --rm phpunit
</code></pre>

        <h3>2.3. Debug</h3>

        <pre><code class="language-yaml">services:
  prestashop-debug:
    image: prestashop:8.9
    environment:
      - XDEBUG_MODE=debug
      - PHP_IDE_CONFIG=serverName=prestashop
    ports:
      - "9003:9003"
    profiles:
      - debug
  
  redis-commander:
    image: rediscommander/redis-commander
    ports:
      - "8083:8081"
    profiles:
      - debug
</code></pre>

        <h3>2.4. Monitoreo</h3>

        <pre><code class="language-yaml">services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    profiles:
      - monitoring
  
  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    profiles:
      - monitoring
</code></pre>

        <h2 class="section-title">3. Perfiles por Entorno</h2>

        <pre><code class="language-yaml"># docker-compose.yml
version: '3.8'

services:
  prestashop:
    image: prestashop:8.9
  
  # Desarrollo
  dev-tools:
    image: alpine
    command: tail -f /dev/null
    profiles: [dev]
  
  # Staging
  staging-monitor:
    image: monitoring:latest
    profiles: [staging]
  
  # Producción
  production-backup:
    image: backup:latest
    profiles: [prod]
</code></pre>

        <h2 class="section-title">4. Perfiles Múltiples</h2>

        <pre><code class="language-yaml">services:
  redis-insight:
    image: redislabs/redisinsight
    profiles:
      - dev
      - debug
      - monitoring
</code></pre>

        <pre><code class="language-bash"># Activar con cualquier perfil
docker compose --profile dev up
docker compose --profile debug up
docker compose --profile monitoring up
</code></pre>

        <h2 class="section-title">5. Variables de Entorno</h2>

        <pre><code class="language-bash"># .env
COMPOSE_PROFILES=dev,debug

# Ahora 'docker compose up' activa dev y debug automáticamente
</code></pre>

        <h2 class="section-title">6. Ejemplo Completo</h2>

        <pre><code class="language-yaml">version: '3.8'

services:
  # Core (siempre activo)
  prestashop:
    image: prestashop:8.9
    ports:
      - "\${PORT:-8080}:80"
  
  mysql:
    image: mysql:8.0
  
  redis:
    image: redis:7-alpine
  
  # Development
  phpmyadmin:
    image: phpmyadmin:latest
    ports:
      - "8081:80"
    profiles: [dev]
  
  mailhog:
    image: mailhog/mailhog
    ports:
      - "8025:8025"
    profiles: [dev]
  
  # Testing
  selenium:
    image: selenium/standalone-chrome
    profiles: [test]
  
  test-runner:
    build:
      context: .
      target: test
    profiles: [test]
  
  # Debug
  xdebug-helper:
    image: prestashop:8.9-debug
    profiles: [debug]
  
  # Monitoring
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    profiles: [monitoring]
  
  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    profiles: [monitoring]
  
  # Production
  backup:
    image: backup-service
    profiles: [prod]
</code></pre>

        <pre><code class="language-bash"># Comandos por entorno

# Desarrollo completo
docker compose --profile dev up -d

# Desarrollo + debugging
docker compose --profile dev --profile debug up -d

# Testing
docker compose --profile test run --rm test-runner

# Producción
docker compose --profile prod up -d

# Producción + monitoring
docker compose --profile prod --profile monitoring up -d
</code></pre>

        <h2 class="section-title">7. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Perfiles:</strong>
            <ul class="mb-0">
                <li>Servicios core sin perfil (siempre activos)</li>
                <li>Herramientas dev/debug en perfiles</li>
                <li>COMPOSE_PROFILES en .env para defecto</li>
                <li>Nombres descriptivos: dev, test, prod</li>
                <li>Combinar perfiles cuando sea necesario</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>📋 Perfiles Comunes:</strong>
            <ul class="mb-0">
                <li><strong>dev:</strong> phpmyadmin, mailhog, adminer</li>
                <li><strong>test:</strong> selenium, phpunit, mock services</li>
                <li><strong>debug:</strong> xdebug, profilers</li>
                <li><strong>monitoring:</strong> prometheus, grafana</li>
                <li><strong>prod:</strong> backup, log aggregators</li>
            </ul>
        </div>
    </div>
`;

// @ts-nocheck
const variablesEntornoSecrets = `
    <div class="content-section">
        <h1 id="variables-entorno-secrets">Variables de Entorno y Secrets</h1>
        <p>Gestión segura de configuración y datos sensibles en Docker Compose para PrestaShop 8.9+.</p>

        <h2 class="section-title">1. Variables de Entorno</h2>

        <h3>1.1. Definición Directa</h3>

        <pre><code class="language-yaml">services:
  prestashop:
    image: prestashop:8.9
    environment:
      - DB_SERVER=mysql
      - DB_NAME=prestashop
      - DB_USER=prestashop
      - DB_PASSWD=admin123
      - PS_DOMAIN=shop.local
      - DEBUG=true
      
      # Sintaxis alternativa
      PHP_MEMORY_LIMIT: 512M
      MAX_EXECUTION_TIME: 60
</code></pre>

        <h3>1.2. Archivo .env</h3>

        <pre><code class="language-bash"># .env - Variables para Compose
DB_PASSWORD=secure_password_123
MYSQL_ROOT_PASSWORD=root_password_456
REDIS_PASSWORD=redis_pass_789
PS_VERSION=8.9
PHP_VERSION=8.1

# Puertos
PRESTASHOP_PORT=8080
MYSQL_PORT=3306
PHPMYADMIN_PORT=8081
</code></pre>

        <pre><code class="language-yaml"># docker-compose.yml usa variables de .env
version: '3.8'

services:
  prestashop:
    image: prestashop/prestashop:\${PS_VERSION}
    ports:
      - "\${PRESTASHOP_PORT}:80"
    environment:
      - DB_PASSWD=\${DB_PASSWORD}
  
  mysql:
    image: mysql:8.0
    ports:
      - "\${MYSQL_PORT}:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=\${MYSQL_ROOT_PASSWORD}
</code></pre>

        <h3>1.3. Múltiples Archivos env_file</h3>

        <pre><code class="language-yaml">services:
  prestashop:
    env_file:
      - .env              # Variables comunes
      - .env.local        # Override local
      - config/db.env     # Configuración de BD
    environment:
      - DEBUG=true        # Override directo
</code></pre>

        <pre><code class="language-bash"># .env
DB_SERVER=mysql
DB_NAME=prestashop

# .env.local (en .gitignore)
DB_USER=prestashop
DB_PASSWD=local_password

# config/db.env
MYSQL_ROOT_PASSWORD=root_password
MYSQL_DATABASE=prestashop
</code></pre>

        <h2 class="section-title">2. Docker Secrets</h2>

        <h3>2.1. Secrets con Archivos</h3>

        <pre><code class="language-bash"># Crear archivos de secrets
mkdir secrets
echo "mySecurePassword123" > secrets/db_password.txt
echo "rootSecurePassword456" > secrets/mysql_root_password.txt
echo "sk_live_abc123xyz" > secrets/stripe_api_key.txt

# Permisos restrictivos
chmod 600 secrets/*

# Añadir a .gitignore
echo "secrets/" >> .gitignore
</code></pre>

        <pre><code class="language-yaml"># docker-compose.yml
version: '3.8'

services:
  prestashop:
    image: prestashop:8.9
    secrets:
      - db_password
      - stripe_api_key
    environment:
      # Variables normales
      - DB_SERVER=mysql
      - DB_USER=prestashop
      # Secrets se leen desde /run/secrets/
  
  mysql:
    image: mysql:8.0
    secrets:
      - db_password
      - mysql_root_password
    environment:
      - MYSQL_USER=prestashop
      - MYSQL_PASSWORD_FILE=/run/secrets/db_password
      - MYSQL_ROOT_PASSWORD_FILE=/run/secrets/mysql_root_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
  
  mysql_root_password:
    file: ./secrets/mysql_root_password.txt
  
  stripe_api_key:
    file: ./secrets/stripe_api_key.txt
</code></pre>

        <h3>2.2. Leer Secrets en Aplicación</h3>

        <pre><code class="language-php"><?php
// PHP - Leer secret
function getSecret(string $secretName): string
{
    $secretPath = "/run/secrets/{$secretName}";
    
    if (!file_exists($secretPath)) {
        throw new \\RuntimeException("Secret {$secretName} not found");
    }
    
    return trim(file_get_contents($secretPath));
}

// Uso
$dbPassword = getSecret('db_password');
$stripeKey = getSecret('stripe_api_key');

// Configuración de BD
$dsn = sprintf(
    'mysql:host=%s;dbname=%s',
    getenv('DB_SERVER'),
    getenv('DB_NAME')
);

$pdo = new PDO(
    $dsn,
    getenv('DB_USER'),
    getSecret('db_password')
);
</code></pre>

        <h3>2.3. Secrets Externos (Swarm)</h3>

        <pre><code class="language-bash"># Crear secret en Swarm
echo "mypassword" | docker secret create db_password -

# Listar secrets
docker secret ls

# Inspeccionar secret
docker secret inspect db_password
</code></pre>

        <pre><code class="language-yaml"># docker-compose.yml con secrets externos
version: '3.8'

services:
  prestashop:
    secrets:
      - db_password
      - api_key

secrets:
  db_password:
    external: true  # Creado externamente en Swarm
  
  api_key:
    external: true
</code></pre>

        <h2 class="section-title">3. Sustitución de Variables</h2>

        <pre><code class="language-yaml"># Sintaxis de sustitución
services:
  prestashop:
    image: prestashop:\${PS_VERSION:-8.9}      # Default: 8.9
    ports:
      - "\${PORT:-8080}:80"                     # Default: 8080
    environment:
      - DB_SERVER=\${DB_HOST:-mysql}           # Default: mysql
      - DB_NAME=\${DB_NAME}                     # Requerida
      - CACHE_ENABLED=\${CACHE_ENABLED:-true}  # Default: true
</code></pre>

        <pre><code class="language-bash"># Usar variables del shell
export PS_VERSION=8.9.1
docker compose up

# O inline
PS_VERSION=8.9.1 docker compose up

# Ver variables resueltas
docker compose config
</code></pre>

        <h2 class="section-title">4. Configs</h2>

        <pre><code class="language-yaml">version: '3.8'

services:
  prestashop:
    configs:
      # Config montado en ruta específica
      - source: php_ini
        target: /usr/local/etc/php/php.ini
        mode: 0440
      
      # Config con nombre diferente
      - source: app_config
        target: /app/config/app.php
        uid: '1000'
        gid: '1000'
        mode: 0640

configs:
  php_ini:
    file: ./config/php.ini
  
  app_config:
    file: ./config/app.php
  
  nginx_conf:
    external: true  # Config creado externamente
</code></pre>

        <h2 class="section-title">5. Variables de Entorno en Runtime</h2>

        <pre><code class="language-bash"># Pasar variable al ejecutar comando
docker compose exec -e DEBUG=true prestashop php script.php

# Ejecutar con múltiples variables
docker compose run \\
  -e DB_HOST=mysql \\
  -e DB_NAME=test \\
  prestashop php bin/console test
</code></pre>

        <h2 class="section-title">6. Jerarquía de Prioridad</h2>

        <pre><code class="language-yaml"># Prioridad (mayor a menor):
# 1. Variables en 'environment'
# 2. Variables de 'env_file'
# 3. Variables del .env
# 4. Variables del shell
# 5. Defaults en compose

services:
  prestashop:
    env_file:
      - .env              # Prioridad 3
    environment:
      - DEBUG=true        # Prioridad 1 (gana)
</code></pre>

        <h2 class="section-title">7. Ejemplo Completo</h2>

        <pre><code class="language-yaml"># docker-compose.yml
version: '3.8'

services:
  prestashop:
    image: prestashop/prestashop:\${PS_VERSION:-8.9}
    ports:
      - "\${PRESTASHOP_PORT:-8080}:80"
    env_file:
      - .env
      - .env.local
    environment:
      - DB_SERVER=mysql
      - DB_NAME=\${DB_NAME}
      - DB_USER=\${DB_USER}
    secrets:
      - db_password
      - stripe_key
    configs:
      - source: php_config
        target: /usr/local/etc/php/php.ini
  
  mysql:
    image: mysql:\${MYSQL_VERSION:-8.0}
    environment:
      - MYSQL_DATABASE=\${DB_NAME}
      - MYSQL_USER=\${DB_USER}
      - MYSQL_PASSWORD_FILE=/run/secrets/db_password
      - MYSQL_ROOT_PASSWORD_FILE=/run/secrets/mysql_root_password
    secrets:
      - db_password
      - mysql_root_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
  mysql_root_password:
    file: ./secrets/mysql_root_password.txt
  stripe_key:
    file: ./secrets/stripe_key.txt

configs:
  php_config:
    file: ./config/php.ini
</code></pre>

        <pre><code class="language-bash"># .env
PS_VERSION=8.9
MYSQL_VERSION=8.0
PRESTASHOP_PORT=8080
DB_NAME=prestashop
DB_USER=prestashop

# .env.local (en .gitignore)
# Overrides locales, no commitear
</code></pre>

        <h2 class="section-title">8. Seguridad</h2>

        <pre><code class="language-bash"># .gitignore
.env.local
.env.production
secrets/
*.secret
*.key
</code></pre>

        <pre><code class="language-bash"># .env.example - Template para equipo
PS_VERSION=8.9
PRESTASHOP_PORT=8080
DB_NAME=prestashop
DB_USER=prestashop
# DB_PASSWORD - crear en .env.local
# STRIPE_KEY - crear en secrets/stripe_key.txt
</code></pre>

        <h2 class="section-title">9. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Variables y Secrets:</strong>
            <ul class="mb-0">
                <li>Secrets para datos sensibles (contraseñas, API keys)</li>
                <li>Variables de entorno para configuración</li>
                <li>Archivo .env en .gitignore</li>
                <li>Proporcionar .env.example para el equipo</li>
                <li>Usar defaults en sustitución de variables</li>
                <li>Secrets con permisos 600</li>
                <li>_FILE suffix para MySQL secrets</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Nunca:</strong>
            <ul class="mb-0">
                <li>Commitear contraseñas en .env</li>
                <li>Hardcodear secrets en docker-compose.yml</li>
                <li>Usar variables de entorno para secrets en prod</li>
                <li>Exponer secrets en logs</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>💡 Cuándo Usar:</strong>
            <ul class="mb-0">
                <li><strong>Secrets:</strong> Contraseñas, API keys, certificados</li>
                <li><strong>Configs:</strong> Archivos de configuración</li>
                <li><strong>Variables:</strong> Configuración no sensible</li>
                <li><strong>.env:</strong> Defaults locales</li>
            </ul>
        </div>
    </div>
`;

// @ts-nocheck
const seguridadDocker = `
    <div class="content-section">
        <h1 id="seguridad-docker">Seguridad en Docker</h1>
        <p>Implementación de mejores prácticas de seguridad para contenedores Docker en producción con PrestaShop 8.9+.</p>

        <h2 class="section-title">1. Principios de Seguridad</h2>

        <div class="alert alert-warning">
            <strong>⚠️ Defense in Depth:</strong>
            <ul class="mb-0">
                <li>Múltiples capas de seguridad</li>
                <li>Principio de mínimo privilegio</li>
                <li>Aislamiento de contenedores</li>
                <li>Inmutabilidad de imágenes</li>
                <li>Auditoría y monitoreo continuo</li>
            </ul>
        </div>

        <h2 class="section-title">2. Imágenes Seguras</h2>

        <h3>2.1. Base Images Oficiales</h3>

        <pre><code class="language-dockerfile"># ❌ Evitar imágenes no oficiales
FROM random-user/php:8.1

# ✅ Usar imágenes oficiales
FROM php:8.1-fpm-alpine

# ✅ Con versión específica
FROM php:8.1.25-fpm-alpine3.18

# ✅ Con hash SHA256 (inmutable)
FROM php@sha256:abc123...
</code></pre>

        <h3>2.2. Escaneo de Vulnerabilidades</h3>

        <pre><code class="language-bash"># Docker Scout (oficial)
docker scout cves prestashop:latest
docker scout recommendations prestashop:latest

# Trivy
trivy image prestashop:latest
trivy image --severity HIGH,CRITICAL prestashop:latest

# Snyk
snyk container test prestashop:latest

# Clair
clairctl analyze prestashop:latest
</code></pre>

        <h3>2.3. Dockerfile Seguro</h3>

        <pre><code class="language-dockerfile"># Multi-stage para reducir superficie de ataque
FROM php:8.1-fpm-alpine AS builder

# Actualizar y limpiar
RUN apk update && apk upgrade && \\
    rm -rf /var/cache/apk/*

# Instalar solo lo necesario
RUN apk add --no-cache \\
    libzip-dev \\
    libpng-dev

# Usuario no-root
RUN addgroup -g 1001 prestashop && \\
    adduser -D -u 1001 -G prestashop prestashop

# Copiar archivos
COPY --chown=prestashop:prestashop . /var/www/html

# Stage final
FROM php:8.1-fpm-alpine

# Copiar solo artifacts necesarios
COPY --from=builder --chown=prestashop:prestashop /var/www/html /var/www/html

# Usuario no-root
USER prestashop

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s \\
    CMD php-fpm-healthcheck || exit 1

# No exponer información
LABEL maintainer="devops@company.com"
</code></pre>

        <h2 class="section-title">3. Usuario No-Root</h2>

        <pre><code class="language-dockerfile"># Crear usuario
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Cambiar ownership
RUN chown -R appuser:appuser /var/www/html

# Cambiar a usuario
USER appuser

# Verificar
RUN whoami  # appuser
</code></pre>

        <pre><code class="language-yaml"># docker-compose.yml
services:
  prestashop:
    image: prestashop:8.9
    user: "1001:1001"  # UID:GID
    security_opt:
      - no-new-privileges:true
</code></pre>

        <h2 class="section-title">4. Capabilities y Seccomp</h2>

        <h3>4.1. Drop Capabilities</h3>

        <pre><code class="language-yaml">services:
  prestashop:
    image: prestashop:8.9
    cap_drop:
      - ALL
    cap_add:
      - CHOWN
      - SETUID
      - SETGID
      - DAC_OVERRIDE
</code></pre>

        <pre><code class="language-bash"># CLI
docker run --cap-drop=ALL --cap-add=CHOWN prestashop:8.9
</code></pre>

        <h3>4.2. Seccomp Profile</h3>

        <pre><code class="language-json">// seccomp-profile.json
{
  "defaultAction": "SCMP_ACT_ERRNO",
  "architectures": ["SCMP_ARCH_X86_64"],
  "syscalls": [
    {
      "names": [
        "read", "write", "open", "close",
        "stat", "fstat", "lstat",
        "poll", "brk", "mmap"
      ],
      "action": "SCMP_ACT_ALLOW"
    }
  ]
}
</code></pre>

        <pre><code class="language-yaml">services:
  prestashop:
    security_opt:
      - seccomp:./seccomp-profile.json
</code></pre>

        <h2 class="section-title">5. Secrets Management</h2>

        <h3>5.1. Docker Secrets</h3>

        <pre><code class="language-bash"># Crear secret
echo "mySecurePassword" | docker secret create db_password -

# Listar
docker secret ls

# Inspeccionar (no muestra valor)
docker secret inspect db_password
</code></pre>

        <pre><code class="language-yaml">services:
  prestashop:
    secrets:
      - db_password
      - api_key
    environment:
      - DB_HOST=mysql

secrets:
  db_password:
    external: true
  api_key:
    file: ./secrets/api_key.txt
</code></pre>

        <h3>5.2. Vault Integration</h3>

        <pre><code class="language-bash"># HashiCorp Vault
vault kv put secret/prestashop db_password=secret123

# Leer en contenedor
vault kv get -field=db_password secret/prestashop
</code></pre>

        <h2 class="section-title">6. Network Security</h2>

        <pre><code class="language-yaml">services:
  prestashop:
    networks:
      - frontend
      - backend
  
  mysql:
    networks:
      - backend  # No accesible desde frontend

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true  # Sin acceso a internet
</code></pre>

        <h2 class="section-title">7. Read-Only Filesystem</h2>

        <pre><code class="language-yaml">services:
  prestashop:
    read_only: true
    tmpfs:
      - /tmp
      - /var/run
    volumes:
      - uploads:/var/www/html/upload  # Solo escritura necesaria
</code></pre>

        <h2 class="section-title">8. Resource Limits</h2>

        <pre><code class="language-yaml">services:
  prestashop:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
          pids: 100
        reservations:
          cpus: '1.0'
          memory: 1G
    ulimits:
      nproc: 65535
      nofile:
        soft: 20000
        hard: 40000
</code></pre>

        <h2 class="section-title">9. Docker Bench Security</h2>

        <pre><code class="language-bash"># Auditoría de seguridad
docker run --rm -it \\
  --net host \\
  --pid host \\
  --userns host \\
  --cap-add audit_control \\
  -v /var/lib:/var/lib:ro \\
  -v /var/run/docker.sock:/var/run/docker.sock:ro \\
  -v /etc:/etc:ro \\
  docker/docker-bench-security

# Output:
# [PASS] 1.1.1 Ensure a separate partition for containers
# [WARN] 1.2.1 Ensure the container host has been hardened
# [INFO] 2.1 Ensure network traffic is restricted
</code></pre>

        <h2 class="section-title">10. Content Trust</h2>

        <pre><code class="language-bash"># Habilitar Docker Content Trust
export DOCKER_CONTENT_TRUST=1

# Firmar imagen
docker trust sign prestashop:latest

# Push firmado
docker push prestashop:latest

# Verificar firma
docker trust inspect prestashop:latest

# Pull solo imágenes firmadas
docker pull prestashop:latest  # Falla si no está firmado
</code></pre>

        <h2 class="section-title">11. AppArmor y SELinux</h2>

        <h3>11.1. AppArmor Profile</h3>

        <pre><code class="language-bash"># /etc/apparmor.d/docker-prestashop
#include <tunables/global>

profile docker-prestashop flags=(attach_disconnected,mediate_deleted) {
  #include <abstractions/base>
  
  network inet tcp,
  network inet udp,
  
  deny /proc/** w,
  deny /sys/** w,
  
  /var/www/html/** r,
  /var/www/html/upload/** rw,
}
</code></pre>

        <pre><code class="language-yaml">services:
  prestashop:
    security_opt:
      - apparmor=docker-prestashop
</code></pre>

        <h3>11.2. SELinux</h3>

        <pre><code class="language-yaml">services:
  prestashop:
    security_opt:
      - label=type:container_runtime_t
    volumes:
      - ./data:/data:z  # SELinux label
</code></pre>

        <h2 class="section-title">12. Ejemplo Completo Seguro</h2>

        <pre><code class="language-yaml"># docker-compose.prod.yml
version: '3.8'

services:
  prestashop:
    image: prestashop:8.9@sha256:abc123...
    user: "1001:1001"
    read_only: true
    security_opt:
      - no-new-privileges:true
      - seccomp:./seccomp-profile.json
      - apparmor=docker-prestashop
    cap_drop:
      - ALL
    cap_add:
      - CHOWN
      - SETUID
      - SETGID
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
          pids: 100
    tmpfs:
      - /tmp:noexec,nosuid,size=100m
      - /var/run:noexec,nosuid,size=50m
    volumes:
      - uploads:/var/www/html/upload
      - type: bind
        source: ./config
        target: /etc/config
        read_only: true
    secrets:
      - db_password
      - api_key
    networks:
      - frontend
      - backend
    healthcheck:
      test: ["CMD", "php-fpm-healthcheck"]
      interval: 30s
      timeout: 3s
      retries: 3
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
  
  mysql:
    image: mysql:8.0@sha256:def456...
    user: "999:999"
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - CHOWN
      - SETUID
      - SETGID
    networks:
      - backend
    secrets:
      - db_password
      - mysql_root_password
    volumes:
      - mysql-data:/var/lib/mysql
    deploy:
      resources:
        limits:
          memory: 4G

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true

volumes:
  uploads:
  mysql-data:

secrets:
  db_password:
    external: true
  mysql_root_password:
    external: true
  api_key:
    external: true
</code></pre>

        <h2 class="section-title">13. Security Checklist</h2>

        <div class="alert alert-success">
            <strong>✅ Seguridad Docker:</strong>
            <ul class="mb-0">
                <li>☐ Imágenes oficiales con versión fija</li>
                <li>☐ Escaneo de vulnerabilidades (Trivy, Scout)</li>
                <li>☐ Usuario no-root en contenedores</li>
                <li>☐ Secrets en Docker Secrets o Vault</li>
                <li>☐ Read-only filesystem donde sea posible</li>
                <li>☐ Drop ALL capabilities, add solo necesarias</li>
                <li>☐ Seccomp profile personalizado</li>
                <li>☐ Redes internas para servicios privados</li>
                <li>☐ Resource limits configurados</li>
                <li>☐ Content Trust habilitado</li>
                <li>☐ Docker Bench Security ejecutado</li>
                <li>☐ Logging y auditoría configurados</li>
            </ul>
        </div>

        <h2 class="section-title">14. Mejores Prácticas</h2>

        <div class="alert alert-info">
            <strong>🔒 Security Best Practices:</strong>
            <ul class="mb-0">
                <li>Actualizar imágenes regularmente</li>
                <li>Minimizar superficie de ataque (alpine)</li>
                <li>No hardcodear secrets</li>
                <li>Usar multi-stage builds</li>
                <li>Limitar recursos para prevenir DoS</li>
                <li>Auditoría continua con herramientas</li>
                <li>Principio de mínimo privilegio</li>
                <li>Aislamiento de redes</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Nunca:</strong>
            <ul class="mb-0">
                <li>Ejecutar como root en producción</li>
                <li>Usar :latest en producción</li>
                <li>Hardcodear contraseñas en Dockerfile</li>
                <li>Deshabilitar seguridad features</li>
                <li>Exponer Docker socket sin protección</li>
                <li>Ignorar vulnerabilidades HIGH/CRITICAL</li>
            </ul>
        </div>
    </div>
`;

// @ts-nocheck
const conceptosBasicosContenedores = `
    <div class="content-section">
        <h1 id="conceptos-basicos-contenedores">Conceptos Básicos de Contenedores</h1>
        <p>Los contenedores son unidades ligeras de software que empaquetan código y dependencias. Ideales para desarrollo y producción de PrestaShop 8.9+.</p>

        <h2 class="section-title">1. ¿Qué es un Contenedor?</h2>

        <p>Un contenedor es una unidad estándar de software que empaqueta el código y todas sus dependencias para que la aplicación se ejecute de manera rápida y confiable en diferentes entornos.</p>

        <div class="alert alert-info">
            <strong>📦 Contenedor vs Máquina Virtual:</strong>
            <table class="table table-sm">
                <tr>
                    <th>Característica</th>
                    <th>Contenedor</th>
                    <th>VM</th>
                </tr>
                <tr>
                    <td>Tamaño</td>
                    <td>MBs</td>
                    <td>GBs</td>
                </tr>
                <tr>
                    <td>Inicio</td>
                    <td>Segundos</td>
                    <td>Minutos</td>
                </tr>
                <tr>
                    <td>Aislamiento</td>
                    <td>Proceso</td>
                    <td>Sistema Operativo completo</td>
                </tr>
                <tr>
                    <td>Recursos</td>
                    <td>Compartidos</td>
                    <td>Dedicados</td>
                </tr>
            </table>
        </div>

        <h2 class="section-title">2. Ventajas de Contenedores</h2>

        <pre><code class="language-bash"># Portabilidad
# Funciona igual en dev, staging y producción

# Consistencia
# "En mi máquina funciona" → "En todos lados funciona"

# Eficiencia
# Uso optimizado de recursos del host

# Escalabilidad
# Fácil replicación de instancias

# Aislamiento
# Cada contenedor es independiente
</code></pre>

        <h2 class="section-title">3. Componentes de un Contenedor</h2>

        <pre><code class="language-yaml"># Anatomía de un contenedor
Contenedor:
  - Imagen base (ej: php:8.1-fpm)
  - Código de aplicación
  - Dependencias (composer, npm)
  - Variables de entorno
  - Puertos expuestos
  - Volúmenes montados
  - Configuración de red
</code></pre>

        <h2 class="section-title">4. Casos de Uso</h2>

        <h3>4.1. Desarrollo Local</h3>

        <pre><code class="language-bash"># Entorno PrestaShop completo en minutos
docker-compose up -d

# Acceso inmediato:
# - PrestaShop: http://localhost:8080
# - MySQL: localhost:3306
# - phpMyAdmin: http://localhost:8081
</code></pre>

        <h3>4.2. Microservicios</h3>

        <pre><code class="language-yaml"># docker-compose.yml - Arquitectura de microservicios
version: '3.8'

services:
  # PrestaShop principal
  prestashop:
    image: prestashop/prestashop:8.9
    ports:
      - "8080:80"
  
  # API separada
  api:
    build: ./api
    ports:
      - "9000:80"
  
  # Worker para jobs
  worker:
    build: ./worker
    command: php worker.php
  
  # Base de datos
  mysql:
    image: mysql:8.0
  
  # Redis para cache
  redis:
    image: redis:7-alpine
</code></pre>

        <h3>4.3. Testing Automatizado</h3>

        <pre><code class="language-bash"># Ejecutar tests en contenedor limpio
docker run --rm \\
  -v $(pwd):/app \\
  -w /app \\
  php:8.1-cli \\
  php vendor/bin/phpunit

# Tests con dependencias específicas
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
</code></pre>

        <h2 class="section-title">5. Namespaces y Cgroups</h2>

        <pre><code class="language-bash"># Namespaces: Aislamiento de recursos
# - PID: Procesos aislados
# - NET: Red propia
# - MNT: Sistema de archivos separado
# - UTS: Hostname propio
# - IPC: Comunicación entre procesos
# - USER: Usuarios separados

# Cgroups: Limitación de recursos
docker run --memory="512m" --cpus="1.0" php:8.1-cli

# Ver recursos usados
docker stats
</code></pre>

        <h2 class="section-title">6. Ciclo de Vida de un Contenedor</h2>

        <pre><code class="language-bash"># 1. Crear contenedor (no lo inicia)
docker create --name prestashop prestashop/prestashop:8.9

# 2. Iniciar contenedor
docker start prestashop

# 3. Ejecutar comando en contenedor corriendo
docker exec -it prestashop bash

# 4. Pausar contenedor (freeze)
docker pause prestashop

# 5. Reanudar
docker unpause prestashop

# 6. Detener (SIGTERM, luego SIGKILL)
docker stop prestashop

# 7. Reiniciar
docker restart prestashop

# 8. Eliminar
docker rm prestashop

# Ver logs
docker logs -f prestashop
</code></pre>

        <h2 class="section-title">7. Estados de un Contenedor</h2>

        <pre><code class="language-bash"># Estados posibles:
# - created: Creado pero no iniciado
# - running: En ejecución
# - paused: Pausado
# - restarting: Reiniciando
# - exited: Detenido
# - dead: Error al detener

# Ver estado de contenedores
docker ps -a

# Filtrar por estado
docker ps --filter "status=running"
docker ps --filter "status=exited"
</code></pre>

        <h2 class="section-title">8. Ejemplo Práctico: PrestaShop</h2>

        <pre><code class="language-bash"># 1. Descargar imagen
docker pull prestashop/prestashop:8.9

# 2. Crear red
docker network create prestashop-net

# 3. MySQL
docker run -d \\
  --name mysql \\
  --network prestashop-net \\
  -e MYSQL_ROOT_PASSWORD=admin \\
  -e MYSQL_DATABASE=prestashop \\
  mysql:8.0

# 4. PrestaShop
docker run -d \\
  --name prestashop \\
  --network prestashop-net \\
  -p 8080:80 \\
  -e DB_SERVER=mysql \\
  -e DB_NAME=prestashop \\
  -e DB_USER=root \\
  -e DB_PASSWD=admin \\
  prestashop/prestashop:8.9

# 5. Acceder
# http://localhost:8080

# 6. Ver logs en tiempo real
docker logs -f prestashop

# 7. Ejecutar comandos
docker exec -it prestashop bash
# cd /var/www/html
# php bin/console prestashop:module install mymodule
</code></pre>

        <h2 class="section-title">9. Inspección de Contenedores</h2>

        <pre><code class="language-bash"># Información completa del contenedor
docker inspect prestashop

# IP del contenedor
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' prestashop

# Uso de recursos
docker stats prestashop

# Procesos corriendo
docker top prestashop

# Cambios en filesystem
docker diff prestashop
</code></pre>

        <h2 class="section-title">10. Mejores Prácticas Básicas</h2>

        <div class="alert alert-success">
            <strong>✅ Buenas Prácticas:</strong>
            <ul class="mb-0">
                <li>Un proceso principal por contenedor</li>
                <li>Contenedores inmutables (recrear, no modificar)</li>
                <li>Usar variables de entorno para configuración</li>
                <li>Logs a stdout/stderr, no a archivos</li>
                <li>No guardar datos en el contenedor</li>
                <li>Usar volúmenes para persistencia</li>
                <li>Nombres descriptivos para contenedores</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Evitar:</strong>
            <ul class="mb-0">
                <li>Ejecutar como root en producción</li>
                <li>Hardcodear credenciales en imágenes</li>
                <li>Mezclar build y runtime en la misma imagen</li>
                <li>Contenedores "pet" (únicos e irremplazables)</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>💡 Conceptos Clave:</strong>
            <ul class="mb-0">
                <li><strong>Efímero:</strong> Los contenedores pueden ser destruidos y recreados</li>
                <li><strong>Idempotente:</strong> Mismo resultado cada vez</li>
                <li><strong>Stateless:</strong> Estado fuera del contenedor</li>
                <li><strong>12-Factor App:</strong> Principios de aplicaciones cloud-native</li>
            </ul>
        </div>
    </div>
`;

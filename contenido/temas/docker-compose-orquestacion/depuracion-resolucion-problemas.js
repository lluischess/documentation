// @ts-nocheck
const depuracionResolucionProblemas = `
    <div class="content-section">
        <h1 id="depuracion-resolucion-problemas">Depuración y Resolución de Problemas</h1>
        <p>Técnicas y herramientas para diagnosticar y resolver problemas en Docker Compose con PrestaShop 8.9+.</p>

        <h2 class="section-title">1. Comandos de Diagnóstico</h2>

        <pre><code class="language-bash"># Ver estado de servicios
docker compose ps

# Ver todos los contenedores (incluso detenidos)
docker compose ps -a

# Ver solo servicios corriendo
docker compose ps --services --filter "status=running"

# Ver uso de recursos
docker compose top

# Estadísticas en tiempo real
docker stats

# Ver eventos
docker compose events

# Ver configuración final
docker compose config

# Validar compose sin iniciar
docker compose config --quiet
</code></pre>

        <h2 class="section-title">2. Logs</h2>

        <h3>2.1. Ver Logs</h3>

        <pre><code class="language-bash"># Logs de todos los servicios
docker compose logs

# Logs en tiempo real
docker compose logs -f

# Logs de servicio específico
docker compose logs prestashop
docker compose logs -f mysql

# Últimas N líneas
docker compose logs --tail=100 prestashop

# Logs con timestamps
docker compose logs -t prestashop

# Logs desde hace X tiempo
docker compose logs --since 1h prestashop
docker compose logs --since 2024-01-01 prestashop

# Múltiples servicios
docker compose logs -f prestashop mysql redis
</code></pre>

        <h3>2.2. Debug de Logs</h3>

        <pre><code class="language-bash"># Buscar errores
docker compose logs prestashop | grep -i error
docker compose logs prestashop | grep -i exception

# Guardar logs a archivo
docker compose logs prestashop > prestashop-logs.txt

# Logs con filtro de tiempo
docker compose logs --since "2024-01-01T10:00:00" --until "2024-01-01T12:00:00"
</code></pre>

        <h2 class="section-title">3. Inspect y Debug</h2>

        <pre><code class="language-bash"># Inspeccionar servicio
docker compose inspect prestashop

# Ver configuración de red
docker network inspect proyecto_default

# Ver configuración de volumen
docker volume inspect proyecto_mysql-data

# Ver variables de entorno del contenedor
docker compose exec prestashop env

# Ver procesos corriendo
docker compose exec prestashop ps aux

# Ver puertos publicados
docker compose port prestashop 80

# Verificar conectividad
docker compose exec prestashop ping mysql
docker compose exec prestashop curl http://mysql:3306
</code></pre>

        <h2 class="section-title">4. Acceso a Contenedores</h2>

        <pre><code class="language-bash"># Shell interactivo
docker compose exec prestashop bash
docker compose exec prestashop sh

# Ejecutar comando
docker compose exec prestashop php -v
docker compose exec prestashop ls -la /var/www/html

# Como usuario específico
docker compose exec -u www-data prestashop whoami

# Sin TTY (para scripts)
docker compose exec -T prestashop php script.php

# En contenedor detenido (con run)
docker compose run --rm prestashop bash
</code></pre>

        <h2 class="section-title">5. Problemas Comunes</h2>

        <h3>5.1. Servicio no Inicia</h3>

        <pre><code class="language-bash"># Ver por qué falló
docker compose logs prestashop

# Ver código de salida
docker compose ps

# Reintentar inicio
docker compose up -d prestashop

# Ver healthcheck
docker compose ps
# STATUS: unhealthy

# Ver detalles de healthcheck
docker inspect --format='{{json .State.Health}}' proyecto_prestashop_1 | jq
</code></pre>

        <h3>5.2. Error de Conexión entre Servicios</h3>

        <pre><code class="language-bash"># Verificar que estén en la misma red
docker compose exec prestashop ping mysql

# Ver DNS resolution
docker compose exec prestashop nslookup mysql
docker compose exec prestashop getent hosts mysql

# Ver red del servicio
docker inspect proyecto_prestashop_1 --format='{{json .NetworkSettings.Networks}}'

# Verificar puerto
docker compose exec prestashop telnet mysql 3306
docker compose exec prestashop nc -zv mysql 3306
</code></pre>

        <h3>5.3. Puertos en Uso</h3>

        <pre><code class="language-bash"># Error: port is already allocated

# Ver qué usa el puerto
sudo lsof -i :8080
netstat -tulpn | grep 8080

# Cambiar puerto en compose
ports:
  - "8081:80"  # En vez de 8080

# O matar proceso que lo usa
kill -9 <PID>
</code></pre>

        <h3>5.4. Volúmenes con Permisos</h3>

        <pre><code class="language-bash"># Error: Permission denied

# Ver permisos en volumen
docker compose exec prestashop ls -la /var/www/html

# Cambiar owner
docker compose exec -u root prestashop chown -R www-data:www-data /var/www/html

# O en Dockerfile
RUN chown -R www-data:www-data /var/www/html
USER www-data
</code></pre>

        <h3>5.5. Out of Memory</h3>

        <pre><code class="language-bash"># Ver uso de memoria
docker stats

# Añadir límites
services:
  prestashop:
    deploy:
      resources:
        limits:
          memory: 2G

# Limpiar recursos no usados
docker system prune -a
</code></pre>

        <h2 class="section-title">6. Recrear Servicios</h2>

        <pre><code class="language-bash"># Recrear servicio específico
docker compose up -d --force-recreate prestashop

# Recrear sin dependencias
docker compose up -d --force-recreate --no-deps prestashop

# Rebuild y recrear
docker compose up -d --build prestashop

# Restart rápido
docker compose restart prestashop

# Stop y start
docker compose stop prestashop
docker compose start prestashop

# Eliminar y recrear todo
docker compose down
docker compose up -d
</code></pre>

        <h2 class="section-title">7. Debug con docker-compose.override.yml</h2>

        <pre><code class="language-yaml"># docker-compose.override.yml
version: '3.8'

services:
  prestashop:
    # Habilitar debug
    environment:
      - DEBUG=true
      - XDEBUG_MODE=debug
    
    # Ver logs detallados
    logging:
      driver: json-file
      options:
        max-size: "200m"
    
    # Comando de debug
    command: php-fpm -d display_errors=On -d error_reporting=E_ALL
  
  mysql:
    # Logs de queries
    command: --general-log=1 --general-log-file=/var/log/mysql/general.log
    volumes:
      - ./mysql-logs:/var/log/mysql
</code></pre>

        <h2 class="section-title">8. Troubleshooting Checklist</h2>

        <pre><code class="language-bash"># 1. Validar sintaxis
docker compose config --quiet

# 2. Ver estado
docker compose ps

# 3. Ver logs de errores
docker compose logs | grep -i error

# 4. Verificar redes
docker network ls
docker network inspect proyecto_default

# 5. Verificar volúmenes
docker volume ls
docker volume inspect proyecto_mysql-data

# 6. Verificar recursos
docker stats

# 7. Verificar conectividad
docker compose exec prestashop ping mysql

# 8. Verificar puertos
docker compose ps
ss -tulpn | grep docker

# 9. Reintentar con verbose
docker compose --verbose up

# 10. Limpiar y reiniciar
docker compose down -v
docker compose up -d
</code></pre>

        <h2 class="section-title">9. Herramientas de Debug</h2>

        <h3>9.1. dive (analizar imágenes)</h3>

        <pre><code class="language-bash">dive prestashop:latest
</code></pre>

        <h3>9.2. ctop (monitoreo)</h3>

        <pre><code class="language-bash">ctop
</code></pre>

        <h3>9.3. docker-compose-viz (visualizar)</h3>

        <pre><code class="language-bash">docker run --rm -it \\
  -v $(pwd):/input \\
  pmsipilot/docker-compose-viz \\
  render -m image docker-compose.yml --output-file=diagram.png
</code></pre>

        <h2 class="section-title">10. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Debugging:</strong>
            <ul class="mb-0">
                <li>Logs en tiempo real: <code>-f</code></li>
                <li>Healthchecks en servicios críticos</li>
                <li>docker-compose.override.yml para debug local</li>
                <li>Resource limits para detectar problemas</li>
                <li>Validar config antes de deploy</li>
                <li>Nombres descriptivos de servicios</li>
                <li>Logging driver con rotación</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Errores Frecuentes:</strong>
            <ul class="mb-0">
                <li><strong>Port in use:</strong> Cambiar puerto o liberar</li>
                <li><strong>Network not found:</strong> Recrear con <code>down/up</code></li>
                <li><strong>Permission denied:</strong> Verificar owner en volumes</li>
                <li><strong>Service unhealthy:</strong> Revisar healthcheck</li>
                <li><strong>Can't connect:</strong> Verificar DNS y red</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>🔍 Debug Workflow:</strong>
            <ol class="mb-0">
                <li>Ver logs: <code>docker compose logs -f</code></li>
                <li>Ver estado: <code>docker compose ps</code></li>
                <li>Acceder: <code>docker compose exec servicio bash</code></li>
                <li>Test conectividad: <code>ping, curl, telnet</code></li>
                <li>Recrear: <code>--force-recreate</code></li>
                <li>Limpiar: <code>down -v && up</code></li>
            </ol>
        </div>
    </div>
`;

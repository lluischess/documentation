// @ts-nocheck
const redesDocker = `
    <div class="content-section">
        <h1 id="redes-docker">Redes en Docker</h1>
        <p>Networking en Docker: drivers de red, comunicación entre contenedores, DNS interno y configuración avanzada para PrestaShop 8.9+.</p>

        <h2 class="section-title">1. Drivers de Red</h2>

        <pre><code class="language-bash"># Docker proporciona 5 drivers de red:

1. bridge (default)
   - Red privada interna
   - NAT para acceso externo
   - Contenedores en mismo host

2. host
   - Usa red del host directamente
   - Sin aislamiento
   - Mejor performance

3. none
   - Sin red
   - Contenedor aislado

4. overlay
   - Multi-host networking
   - Docker Swarm
   - Kubernetes

5. macvlan
   - MAC address propia
   - Como dispositivo físico en la red
</code></pre>

        <h2 class="section-title">2. Red Bridge (Default)</h2>

        <h3>2.1. Red Bridge por Defecto</h3>

        <pre><code class="language-bash"># Ver redes
docker network ls

# Red bridge default (docker0)
docker network inspect bridge

# Contenedor usa bridge por defecto
docker run -d --name nginx nginx

# Ver IP asignada
docker inspect nginx --format '{{.NetworkSettings.IPAddress}}'
# 172.17.0.2

# Comunicación entre contenedores por IP
docker run -d --name web1 nginx
docker run -d --name web2 nginx
docker exec web2 ping 172.17.0.2  # IP de web1
</code></pre>

        <h3>2.2. User-Defined Bridge Network</h3>

        <pre><code class="language-bash"># Crear red bridge personalizada (recomendado)
docker network create prestashop-net

# Con opciones
docker network create \\
  --driver bridge \\
  --subnet 172.20.0.0/16 \\
  --gateway 172.20.0.1 \\
  --ip-range 172.20.1.0/24 \\
  prestashop-net

# Conectar contenedor a red personalizada
docker run -d \\
  --name prestashop \\
  --network prestashop-net \\
  prestashop/prestashop:8.9

docker run -d \\
  --name mysql \\
  --network prestashop-net \\
  mysql:8.0

# DNS automático por nombre de contenedor
docker exec prestashop ping mysql  # ¡Funciona!

# IP estática en red personalizada
docker run -d \\
  --name mysql \\
  --network prestashop-net \\
  --ip 172.20.0.10 \\
  mysql:8.0
</code></pre>

        <h2 class="section-title">3. Publicación de Puertos</h2>

        <pre><code class="language-bash"># Mapear puerto del contenedor al host
docker run -d -p 8080:80 nginx

# Puerto aleatorio en host
docker run -d -p 80 nginx

# Ver puerto asignado
docker port <container>

# Múltiples puertos
docker run -d \\
  -p 8080:80 \\
  -p 8443:443 \\
  nginx

# Bind a IP específica del host
docker run -d -p 192.168.1.100:8080:80 nginx

# UDP
docker run -d -p 53:53/udp dns-server

# Rango de puertos
docker run -d -p 8000-8010:8000-8010 app

# Ver puertos publicados
docker ps --format "table {{.Names}}\\t{{.Ports}}"
</code></pre>

        <h2 class="section-title">4. DNS y Service Discovery</h2>

        <pre><code class="language-bash"># En redes user-defined, DNS automático

# docker-compose.yml
version: '3.8'
services:
  prestashop:
    image: prestashop/prestashop:8.9
    environment:
      # Usa nombre del servicio como hostname
      - DB_SERVER=mysql
      - REDIS_SERVER=redis
    networks:
      - backend
  
  mysql:
    image: mysql:8.0
    networks:
      - backend
  
  redis:
    image: redis:7-alpine
    networks:
      - backend

networks:
  backend:

# PrestaShop puede conectar a:
# - mysql (resuelve a IP de contenedor MySQL)
# - redis (resuelve a IP de contenedor Redis)
</code></pre>

        <h3>4.1. Alias de Red</h3>

        <pre><code class="language-bash"># Alias para contenedor
docker run -d \\
  --name mysql-primary \\
  --network prestashop-net \\
  --network-alias mysql \\
  --network-alias database \\
  mysql:8.0

# Accesible por:
# - mysql-primary (nombre contenedor)
# - mysql (alias)
# - database (alias)
</code></pre>

        <h2 class="section-title">5. Múltiples Redes</h2>

        <pre><code class="language-bash"># Crear redes separadas
docker network create frontend
docker network create backend

# PrestaShop en ambas redes
docker run -d \\
  --name prestashop \\
  --network frontend \\
  prestashop/prestashop:8.9

docker network connect backend prestashop

# MySQL solo en backend
docker run -d \\
  --name mysql \\
  --network backend \\
  mysql:8.0

# Nginx solo en frontend
docker run -d \\
  --name nginx \\
  --network frontend \\
  nginx

# Resultado:
# - Nginx puede comunicar con PrestaShop
# - PrestaShop puede comunicar con MySQL
# - Nginx NO puede comunicar con MySQL (aislado)
</code></pre>

        <h2 class="section-title">6. Red Host</h2>

        <pre><code class="language-bash"># Usar red del host directamente
docker run -d \\
  --network host \\
  nginx

# Accesible en http://host-ip:80
# Sin NAT, mejor performance
# Sin aislamiento de red

# Casos de uso:
# - Performance crítica
# - Herramientas de monitoreo
# - Desarrollo local rápido

# No funciona en Docker Desktop (Mac/Windows)
</code></pre>

        <h2 class="section-title">7. Red None</h2>

        <pre><code class="language-bash"># Sin interfaz de red
docker run -d --network none alpine

# Solo loopback (127.0.0.1)
# Sin acceso externo

# Casos de uso:
# - Procesamiento batch aislado
# - Contenedores de seguridad máxima
# - Build stages en multi-stage
</code></pre>

        <h2 class="section-title">8. Ejemplo Completo: PrestaShop</h2>

        <pre><code class="language-yaml"># docker-compose.yml - Arquitectura multi-red
version: '3.8'

services:
  # Frontend público
  nginx:
    image: nginx:alpine
    networks:
      - frontend
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
  
  # Aplicación en ambas redes
  prestashop:
    image: prestashop/prestashop:8.9
    networks:
      - frontend
      - backend
    environment:
      - DB_SERVER=mysql
      - REDIS_SERVER=redis
  
  # Backend privado
  mysql:
    image: mysql:8.0
    networks:
      - backend
    volumes:
      - mysql-data:/var/lib/mysql
  
  redis:
    image: redis:7-alpine
    networks:
      - backend

networks:
  # Red pública (nginx + prestashop)
  frontend:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
  
  # Red privada (prestashop + db + cache)
  backend:
    driver: bridge
    internal: true  # Sin acceso a internet
    ipam:
      config:
        - subnet: 172.21.0.0/16

volumes:
  mysql-data:
</code></pre>

        <h2 class="section-title">9. Inspección y Debugging</h2>

        <pre><code class="language-bash"># Inspeccionar red
docker network inspect prestashop-net

# Ver contenedores conectados
docker network inspect prestashop-net \\
  --format '{{range .Containers}}{{.Name}} - {{.IPv4Address}}{{println}}{{end}}'

# Conectar/desconectar contenedor en caliente
docker network connect backend my-container
docker network disconnect backend my-container

# Debugging de red dentro del contenedor
docker exec -it prestashop bash

# Herramientas útiles
apt-get update && apt-get install -y iputils-ping curl dnsutils netcat

# Test conectividad
ping mysql
curl http://nginx
nslookup mysql
nc -zv mysql 3306

# Ver interfaces de red del contenedor
ip addr
route -n

# Ver conexiones
netstat -tulpn
</code></pre>

        <h2 class="section-title">10. Red Overlay (Swarm)</h2>

        <pre><code class="language-bash"># Para multi-host (Docker Swarm o Kubernetes)

# Inicializar swarm
docker swarm init

# Crear red overlay
docker network create \\
  --driver overlay \\
  --attachable \\
  prestashop-overlay

# Desplegar stack
docker stack deploy -c docker-compose.yml prestashop

# Los contenedores en diferentes hosts pueden comunicarse
</code></pre>

        <h2 class="section-title">11. Seguridad de Red</h2>

        <pre><code class="language-bash"># Red interna (sin acceso a internet)
docker network create \\
  --internal \\
  secure-backend

# Firewall entre contenedores (iptables)
docker run -d \\
  --cap-add NET_ADMIN \\
  --name firewall \\
  alpine

# Encriptar tráfico entre contenedores (Swarm)
docker network create \\
  --driver overlay \\
  --opt encrypted \\
  secure-overlay
</code></pre>

        <h2 class="section-title">12. Performance y Optimización</h2>

        <pre><code class="language-bash"># MTU personalizado
docker network create \\
  --opt com.docker.network.driver.mtu=9000 \\
  jumbo-net

# IPv6
docker network create \\
  --ipv6 \\
  --subnet 2001:db8::/64 \\
  ipv6-net

# Ver estadísticas de red
docker stats --format "table {{.Name}}\\t{{.NetIO}}"
</code></pre>

        <h2 class="section-title">13. Limpieza</h2>

        <pre><code class="language-bash"># Listar redes
docker network ls

# Eliminar red
docker network rm prestashop-net

# Eliminar redes no usadas
docker network prune

# Ver redes dangling
docker network ls --filter "dangling=true"
</code></pre>

        <h2 class="section-title">14. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Networking:</strong>
            <ul class="mb-0">
                <li>Usar redes user-defined (no default bridge)</li>
                <li>Separar frontend y backend en redes distintas</li>
                <li>DNS automático con nombres de servicio</li>
                <li>Red interna para BD y servicios privados</li>
                <li>Publicar solo puertos necesarios</li>
                <li>Usar alias para flexibilidad</li>
                <li>Documentar arquitectura de red</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Evitar:</strong>
            <ul class="mb-0">
                <li>Depender de IPs hardcodeadas</li>
                <li>Exponer servicios privados a internet</li>
                <li>Usar red host en producción sin necesidad</li>
                <li>Mezclar frontend y backend en misma red sin control</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>🌐 Patrones de Red:</strong>
            <ul class="mb-0">
                <li><strong>3-tier:</strong> frontend + app + backend (3 redes)</li>
                <li><strong>Sidecar:</strong> Contenedor auxiliar en misma red</li>
                <li><strong>Service Mesh:</strong> Proxy de red entre servicios</li>
                <li><strong>DMZ:</strong> Red desmilitarizada para servicios públicos</li>
            </ul>
        </div>
    </div>
`;

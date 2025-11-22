// @ts-nocheck
const arquitecturaDocker = `
    <div class="content-section">
        <h1 id="arquitectura-docker">Arquitectura de Docker</h1>
        <p>Comprensión de la arquitectura cliente-servidor de Docker, componentes clave y cómo interactúan para gestionar contenedores.</p>

        <h2 class="section-title">1. Arquitectura Cliente-Servidor</h2>

        <pre><code class="language-bash"># Docker usa arquitectura cliente-servidor

┌─────────────┐         API REST         ┌──────────────┐
│  Docker CLI │ ────────────────────────► │ Docker Daemon│
│  (docker)   │                           │  (dockerd)   │
└─────────────┘                           └──────────────┘
                                                 │
                                                 ▼
                                          ┌──────────────┐
                                          │  containerd  │
                                          └──────────────┘
                                                 │
                                                 ▼
                                          ┌──────────────┐
                                          │     runc     │
                                          └──────────────┘
                                                 │
                                                 ▼
                                          ┌──────────────┐
                                          │ Contenedores │
                                          └──────────────┘
</code></pre>

        <h2 class="section-title">2. Componentes Principales</h2>

        <h3>2.1. Docker CLI</h3>

        <pre><code class="language-bash"># Cliente de línea de comandos
docker --version

# Comandos se envían al daemon
docker ps
docker run
docker build
docker pull

# Ver donde está conectado
docker context ls

# Conexión remota
docker -H tcp://192.168.1.100:2375 ps
</code></pre>

        <h3>2.2. Docker Daemon (dockerd)</h3>

        <pre><code class="language-bash"># Proceso en segundo plano que gestiona:
# - Imágenes
# - Contenedores
# - Redes
# - Volúmenes

# Ver estado del daemon
sudo systemctl status docker

# Configuración del daemon
sudo nano /etc/docker/daemon.json
</code></pre>

        <pre><code class="language-json">{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2",
  "dns": ["8.8.8.8", "8.8.4.4"],
  "insecure-registries": ["registry.local:5000"],
  "registry-mirrors": ["https://mirror.gcr.io"]
}
</code></pre>

        <h3>2.3. containerd</h3>

        <pre><code class="language-bash"># Runtime de contenedores de bajo nivel
# Gestiona el ciclo de vida del contenedor

# Ver contenedores via containerd
sudo ctr containers list

# Ver namespaces
sudo ctr namespace list
</code></pre>

        <h3>2.4. runc</h3>

        <pre><code class="language-bash"># Runtime OCI (Open Container Initiative)
# Crea y ejecuta contenedores según el estándar OCI

# runc está integrado, no se usa directamente
# Pero es lo que finalmente ejecuta el contenedor
</code></pre>

        <h2 class="section-title">3. Docker API REST</h2>

        <pre><code class="language-bash"># Docker expone API REST en socket Unix
/var/run/docker.sock

# O puerto TCP (requiere configuración)
tcp://0.0.0.0:2375

# Listar contenedores via API
curl --unix-socket /var/run/docker.sock \\
  http://localhost/v1.41/containers/json

# Crear contenedor
curl --unix-socket /var/run/docker.sock \\
  -X POST \\
  -H "Content-Type: application/json" \\
  -d '{
    "Image": "prestashop/prestashop:8.9",
    "ExposedPorts": {"80/tcp": {}}
  }' \\
  http://localhost/v1.41/containers/create
</code></pre>

        <pre><code class="language-php"><?php
// Usar Docker API desde PHP
$client = new \\GuzzleHttp\\Client([
    'base_uri' => 'http://localhost',
    'curl' => [
        CURLOPT_UNIX_SOCKET_PATH => '/var/run/docker.sock',
    ],
]);

// Listar contenedores
$response = $client->get('/v1.41/containers/json');
$containers = json_decode($response->getBody(), true);

foreach ($containers as $container) {
    echo "ID: {$container['Id']}" . PHP_EOL;
    echo "Nombre: {$container['Names'][0]}" . PHP_EOL;
    echo "Estado: {$container['State']}" . PHP_EOL;
}
</code></pre>

        <h2 class="section-title">4. Storage Drivers</h2>

        <pre><code class="language-bash"># Ver driver actual
docker info | grep "Storage Driver"

# Drivers disponibles:
# - overlay2 (recomendado para Linux)
# - aufs (legacy)
# - devicemapper (legacy)
# - btrfs
# - zfs
</code></pre>

        <pre><code class="language-bash"># Capas de filesystem (Union FS)
┌─────────────────┐
│  Capa R/W       │ ← Contenedor (modificaciones)
├─────────────────┤
│  Capa R/O       │ ← Imagen (tu aplicación)
├─────────────────┤
│  Capa R/O       │ ← Dependencias
├─────────────────┤
│  Capa R/O       │ ← Base (php:8.1-fpm)
└─────────────────┘

# Ver capas de una imagen
docker history prestashop/prestashop:8.9
</code></pre>

        <h2 class="section-title">5. Namespaces</h2>

        <pre><code class="language-bash"># Docker usa namespaces de Linux para aislamiento

# 1. PID Namespace - Procesos aislados
docker run --rm busybox ps aux
# Solo ve sus propios procesos

# 2. Network Namespace - Red propia
docker run --rm busybox ip addr

# 3. Mount Namespace - Sistema de archivos
docker run --rm busybox mount

# 4. UTS Namespace - Hostname
docker run --rm --hostname mi-contenedor busybox hostname

# 5. IPC Namespace - Comunicación entre procesos
docker run --rm busybox ipcs

# 6. User Namespace - Mapeo de usuarios
docker run --rm busybox id
</code></pre>

        <h2 class="section-title">6. Control Groups (cgroups)</h2>

        <pre><code class="language-bash"># Limitar recursos del contenedor

# Memoria
docker run --memory="512m" --memory-swap="1g" nginx

# CPU
docker run --cpus="1.5" nginx  # 1.5 cores
docker run --cpu-shares=512 nginx  # Peso relativo

# I/O
docker run --device-read-bps /dev/sda:1mb nginx
docker run --device-write-bps /dev/sda:1mb nginx

# PIDs máximos
docker run --pids-limit=100 nginx

# Ver límites aplicados
docker inspect <container_id> | grep -A 20 "HostConfig"
</code></pre>

        <h2 class="section-title">7. Networking Stack</h2>

        <pre><code class="language-bash"># Docker gestiona networking con drivers

# Ver redes
docker network ls

# Drivers de red:
# - bridge: Red interna (default)
# - host: Red del host
# - none: Sin red
# - overlay: Multi-host (Swarm)
# - macvlan: Asigna MAC address al contenedor

# Crear red bridge personalizada
docker network create \\
  --driver bridge \\
  --subnet 172.20.0.0/16 \\
  --gateway 172.20.0.1 \\
  prestashop-net

# Inspeccionar red
docker network inspect prestashop-net
</code></pre>

        <h2 class="section-title">8. Docker Registry</h2>

        <pre><code class="language-bash"># Docker Hub es el registry público por defecto
docker pull prestashop/prestashop:8.9

# Registry privado local
docker run -d -p 5000:5000 --name registry registry:2

# Push a registry privado
docker tag prestashop/prestashop:8.9 localhost:5000/prestashop:8.9
docker push localhost:5000/prestashop:8.9

# Pull desde registry privado
docker pull localhost:5000/prestashop:8.9
</code></pre>

        <h2 class="section-title">9. Docker en Producción</h2>

        <h3>9.1. Docker Swarm</h3>

        <pre><code class="language-bash"># Orquestador nativo de Docker
docker swarm init

# Desplegar stack
docker stack deploy -c docker-compose.yml prestashop

# Escalar servicio
docker service scale prestashop_web=5

# Ver servicios
docker service ls
</code></pre>

        <h3>9.2. Seguridad</h3>

        <pre><code class="language-bash"># Ejecutar como usuario no-root
docker run --user 1000:1000 nginx

# Seccomp profile (syscalls permitidas)
docker run --security-opt seccomp=default.json nginx

# AppArmor
docker run --security-opt apparmor=docker-default nginx

# Capabilities limitadas
docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE nginx

# Read-only filesystem
docker run --read-only nginx
</code></pre>

        <h2 class="section-title">10. Monitoreo</h2>

        <pre><code class="language-bash"># Métricas en tiempo real
docker stats

# Eventos del daemon
docker events

# Ver uso de disco
docker system df

# Logs del daemon
sudo journalctl -u docker.service

# Info completa del sistema
docker system info
</code></pre>

        <div class="alert alert-info">
            <strong>🏗️ Flujo de Trabajo:</strong>
            <pre class="mb-0">1. CLI envía comando → docker run nginx
2. Daemon recibe petición via API
3. Daemon verifica si imagen existe localmente
4. Si no existe, pull desde registry
5. Daemon pide a containerd crear contenedor
6. containerd usa runc para iniciar contenedor
7. runc crea namespaces y cgroups
8. Contenedor inicia con proceso principal
9. Daemon retorna control a CLI
10. CLI muestra resultado al usuario</pre>
        </div>

        <div class="alert alert-success">
            <strong>✅ Arquitectura Clave:</strong>
            <ul class="mb-0">
                <li><strong>Modular:</strong> Componentes independientes</li>
                <li><strong>API-driven:</strong> Todo via REST API</li>
                <li><strong>Estándar OCI:</strong> Compatible con otros runtimes</li>
                <li><strong>Extensible:</strong> Plugins para storage, red, logs</li>
            </ul>
        </div>
    </div>
`;

// @ts-nocheck
const almacenamientoContenedores = `
    <div class="content-section">
        <h1 id="almacenamiento-contenedores">Almacenamiento en Contenedores</h1>
        <p>Gestión de datos persistentes en Docker: volúmenes, bind mounts y tmpfs. Estrategias para bases de datos, uploads y logs en PrestaShop 8.9+.</p>

        <h2 class="section-title">1. Tipos de Almacenamiento</h2>

        <pre><code class="language-bash"># Docker ofrece 3 tipos de montaje:

1. Volumes (recomendado)
   - Gestionado por Docker
   - /var/lib/docker/volumes/
   - Mejor performance
   - Portable entre hosts

2. Bind Mounts
   - Carpeta del host
   - Cualquier ruta
   - Desarrollo local
   - Menos portable

3. tmpfs
   - En memoria RAM
   - No persiste
   - Datos temporales sensibles
</code></pre>

        <div class="alert alert-info">
            <strong>📊 Comparación:</strong>
            <table class="table table-sm">
                <tr>
                    <th>Característica</th>
                    <th>Volume</th>
                    <th>Bind Mount</th>
                    <th>tmpfs</th>
                </tr>
                <tr>
                    <td>Gestión</td>
                    <td>Docker</td>
                    <td>Usuario</td>
                    <td>Docker</td>
                </tr>
                <tr>
                    <td>Persistencia</td>
                    <td>Sí</td>
                    <td>Sí</td>
                    <td>No</td>
                </tr>
                <tr>
                    <td>Performance</td>
                    <td>Alta</td>
                    <td>Media</td>
                    <td>Muy Alta</td>
                </tr>
                <tr>
                    <td>Compartir</td>
                    <td>Fácil</td>
                    <td>Manual</td>
                    <td>No</td>
                </tr>
            </table>
        </div>

        <h2 class="section-title">2. Volumes</h2>

        <h3>2.1. Crear y Gestionar</h3>

        <pre><code class="language-bash"># Crear volumen
docker volume create prestashop-data

# Listar volúmenes
docker volume ls

# Inspeccionar
docker volume inspect prestashop-data

# Ver ubicación real
docker volume inspect prestashop-data --format '{{.Mountpoint}}'
# /var/lib/docker/volumes/prestashop-data/_data

# Eliminar volumen
docker volume rm prestashop-data

# Eliminar volúmenes no usados
docker volume prune
</code></pre>

        <h3>2.2. Usar Volumes</h3>

        <pre><code class="language-bash"># Montar volumen en contenedor
docker run -d \\
  --name prestashop \\
  -v prestashop-data:/var/www/html/var \\
  prestashop/prestashop:8.9

# Volumen anónimo (creado automáticamente)
docker run -v /var/www/html/uploads prestashop:8.9

# Múltiples volúmenes
docker run -d \\
  -v ps-data:/var/www/html/var \\
  -v ps-uploads:/var/www/html/upload \\
  -v ps-themes:/var/www/html/themes \\
  prestashop:8.9

# Volumen de solo lectura
docker run -v config-volume:/etc/config:ro nginx

# Compartir volumen entre contenedores
docker run --name web1 -v shared-data:/data nginx
docker run --name web2 -v shared-data:/data nginx
</code></pre>

        <h3>2.3. Volume Drivers</h3>

        <pre><code class="language-bash"># Local driver (default)
docker volume create --driver local my-volume

# NFS driver
docker volume create \\
  --driver local \\
  --opt type=nfs \\
  --opt o=addr=192.168.1.100,rw \\
  --opt device=:/path/to/dir \\
  nfs-volume

# AWS EFS
docker volume create \\
  --driver local \\
  --opt type=nfs4 \\
  --opt o=addr=fs-12345.efs.region.amazonaws.com,nfsvers=4.1 \\
  --opt device=:/ \\
  efs-volume
</code></pre>

        <h2 class="section-title">3. Bind Mounts</h2>

        <pre><code class="language-bash"># Montar carpeta del host
docker run -d \\
  --name prestashop-dev \\
  -v /home/user/prestashop/src:/var/www/html \\
  -v /home/user/prestashop/config:/etc/prestashop \\
  prestashop:8.9

# Sintaxis --mount (más explícita, recomendada)
docker run -d \\
  --mount type=bind,source=/home/user/prestashop,target=/var/www/html \\
  prestashop:8.9

# Solo lectura
docker run -v /host/config:/etc/config:ro nginx

# Bind mount con opciones
docker run \\
  --mount type=bind,source=/src,target=/app,readonly \\
  nginx
</code></pre>

        <h3>3.1. Desarrollo Local</h3>

        <pre><code class="language-yaml"># docker-compose.yml para desarrollo
version: '3.8'

services:
  prestashop:
    image: prestashop/prestashop:8.9
    volumes:
      # Código en vivo
      - ./src:/var/www/html/src
      - ./modules:/var/www/html/modules
      - ./themes:/var/www/html/themes
      
      # Config separada
      - ./config/php.ini:/usr/local/etc/php/php.ini:ro
      
      # Logs accesibles
      - ./logs:/var/www/html/var/logs
    ports:
      - "8080:80"
  
  mysql:
    image: mysql:8.0
    volumes:
      # Datos persistentes
      - mysql-data:/var/lib/mysql
      
      # Init scripts
      - ./docker/mysql/init.sql:/docker-entrypoint-initdb.d/init.sql:ro

volumes:
  mysql-data:
</code></pre>

        <h2 class="section-title">4. tmpfs Mounts</h2>

        <pre><code class="language-bash"># Montar en RAM (no persiste)
docker run -d \\
  --tmpfs /tmp:rw,size=100m,mode=1777 \\
  prestashop:8.9

# Con --mount
docker run -d \\
  --mount type=tmpfs,destination=/cache,tmpfs-size=100m,tmpfs-mode=1777 \\
  prestashop:8.9

# Casos de uso:
# - Sesiones de usuario
# - Cache temporal
# - Datos sensibles (contraseñas temporales)
# - Compilación de assets
</code></pre>

        <h2 class="section-title">5. Backup y Restore</h2>

        <h3>5.1. Backup de Volúmenes</h3>

        <pre><code class="language-bash"># Método 1: Tar desde contenedor helper
docker run --rm \\
  -v prestashop-data:/data \\
  -v $(pwd):/backup \\
  busybox \\
  tar czf /backup/prestashop-backup-$(date +%Y%m%d).tar.gz -C /data .

# Método 2: Copiar directo
docker run --rm \\
  -v prestashop-data:/source:ro \\
  -v $(pwd):/backup \\
  busybox \\
  cp -a /source/. /backup/prestashop-data/

# Método 3: Docker cp (si contenedor está corriendo)
docker cp prestashop:/var/www/html/var ./backup/

# Backup de MySQL
docker exec mysql \\
  mysqldump -u root -ppassword prestashop \\
  > prestashop-db-$(date +%Y%m%d).sql
</code></pre>

        <h3>5.2. Restore</h3>

        <pre><code class="language-bash"># Restaurar desde tar
docker run --rm \\
  -v prestashop-data:/data \\
  -v $(pwd):/backup \\
  busybox \\
  tar xzf /backup/prestashop-backup.tar.gz -C /data

# Restaurar MySQL
docker exec -i mysql \\
  mysql -u root -ppassword prestashop \\
  < prestashop-db-backup.sql
</code></pre>

        <h2 class="section-title">6. Ejemplo Completo: PrestaShop</h2>

        <pre><code class="language-yaml"># docker-compose.yml - Producción
version: '3.8'

services:
  prestashop:
    image: prestashop/prestashop:8.9
    volumes:
      # Código customizado (bind mount en dev, volume en prod)
      - prestashop-modules:/var/www/html/modules
      - prestashop-themes:/var/www/html/themes
      
      # Uploads de clientes
      - prestashop-uploads:/var/www/html/upload
      - prestashop-img:/var/www/html/img
      
      # Cache y logs
      - prestashop-cache:/var/www/html/var/cache
      - prestashop-logs:/var/www/html/var/logs
      
      # Config (read-only)
      - ./config/parameters.php:/var/www/html/app/config/parameters.php:ro
    tmpfs:
      # Sesiones en RAM
      - /tmp
      - /var/www/html/var/cache/prod:size=500m
    environment:
      - PS_DOMAIN=shop.example.com
  
  mysql:
    image: mysql:8.0
    volumes:
      # Datos de BD (crítico)
      - mysql-data:/var/lib/mysql
      
      # Config MySQL
      - ./docker/mysql/my.cnf:/etc/mysql/conf.d/custom.cnf:ro
    environment:
      - MYSQL_ROOT_PASSWORD_FILE=/run/secrets/mysql_root_password
    secrets:
      - mysql_root_password
  
  redis:
    image: redis:7-alpine
    volumes:
      # Persistencia de cache (opcional)
      - redis-data:/data
    command: redis-server --appendonly yes

volumes:
  prestashop-modules:
  prestashop-themes:
  prestashop-uploads:
  prestashop-img:
  prestashop-cache:
  prestashop-logs:
  mysql-data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /mnt/data/mysql
  redis-data:

secrets:
  mysql_root_password:
    file: ./secrets/mysql_root_password.txt
</code></pre>

        <h2 class="section-title">7. Performance y Optimización</h2>

        <pre><code class="language-yaml"># Optimización de volumes en macOS/Windows

services:
  prestashop:
    volumes:
      # Delegated: escrituras lazy (mejor performance)
      - ./src:/var/www/html/src:delegated
      
      # Cached: lecturas desde cache
      - ./vendor:/var/www/html/vendor:cached
      
      # Named volume (mejor que bind mount)
      - node_modules:/var/www/html/node_modules

volumes:
  node_modules:
</code></pre>

        <h2 class="section-title">8. Limpieza de Espacio</h2>

        <pre><code class="language-bash"># Ver uso de disco
docker system df

# Detallado
docker system df -v

# Limpiar volúmenes no usados
docker volume prune

# Limpiar todo (cuidado!)
docker system prune -a --volumes

# Eliminar volúmenes específicos
docker volume rm $(docker volume ls -q --filter dangling=true)

# Ver tamaño de volúmenes
docker volume ls -q | xargs -I{} docker volume inspect {} \\
  --format '{{.Name}}: {{.Mountpoint}}' | while read v; do
    echo "$v $(du -sh $(echo $v | cut -d: -f2) | cut -f1)"
done
</code></pre>

        <h2 class="section-title">9. Seguridad</h2>

        <pre><code class="language-bash"># Volumen con permisos específicos
docker run -d \\
  -v prestashop-data:/data \\
  --user 1000:1000 \\
  prestashop:8.9

# SELinux labels
docker run -v /host/path:/container/path:z prestashop:8.9

# Volumen encriptado (usando dm-crypt)
# 1. Crear dispositivo encriptado
sudo cryptsetup luksFormat /dev/sdb1
sudo cryptsetup open /dev/sdb1 encrypted-volume

# 2. Montar en Docker
docker volume create \\
  --driver local \\
  --opt type=none \\
  --opt device=/dev/mapper/encrypted-volume \\
  --opt o=bind \\
  secure-volume
</code></pre>

        <h2 class="section-title">10. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Almacenamiento:</strong>
            <ul class="mb-0">
                <li>Volumes para datos de producción</li>
                <li>Bind mounts solo en desarrollo</li>
                <li>tmpfs para datos temporales/sensibles</li>
                <li>Backup automático de volúmenes críticos</li>
                <li>Named volumes mejor que anónimos</li>
                <li>Separar datos por tipo (BD, uploads, logs)</li>
                <li>Monitoring de uso de espacio</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Evitar:</strong>
            <ul class="mb-0">
                <li>Guardar datos en el filesystem del contenedor</li>
                <li>Bind mounts de todo el proyecto en producción</li>
                <li>Volúmenes sin estrategia de backup</li>
                <li>Mezclar datos de diferentes servicios</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>💡 Estrategia de Volúmenes:</strong>
            <ul class="mb-0">
                <li><strong>Código:</strong> Bind mount (dev) / Imagen (prod)</li>
                <li><strong>Base de datos:</strong> Named volume con backup</li>
                <li><strong>Uploads:</strong> Named volume o S3</li>
                <li><strong>Logs:</strong> Volume o log driver</li>
                <li><strong>Cache:</strong> tmpfs o Redis volume</li>
                <li><strong>Config:</strong> Bind mount read-only o secrets</li>
            </ul>
        </div>
    </div>
`;

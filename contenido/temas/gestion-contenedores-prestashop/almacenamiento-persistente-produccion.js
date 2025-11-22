// @ts-nocheck
const almacenamientoPersistenteProduccion = `
    <div class="content-section">
        <h1 id="almacenamiento-persistente-produccion">Almacenamiento Persistente y Montajes en Producción</h1>
        <p>Gestión de almacenamiento persistente para datos críticos de PrestaShop 8.9+ en contenedores Docker en producción.</p>

        <h2 class="section-title">1. Tipos de Almacenamiento en Docker</h2>

        <table>
            <thead>
                <tr>
                    <th>Tipo</th>
                    <th>Ubicación</th>
                    <th>Gestión</th>
                    <th>Performance</th>
                    <th>Uso</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Volumes</strong></td>
                    <td>/var/lib/docker/volumes/</td>
                    <td>Docker</td>
                    <td>Excelente</td>
                    <td>Datos de producción</td>
                </tr>
                <tr>
                    <td><strong>Bind Mounts</strong></td>
                    <td>Cualquier path del host</td>
                    <td>Manual</td>
                    <td>Buena</td>
                    <td>Config, desarrollo</td>
                </tr>
                <tr>
                    <td><strong>tmpfs</strong></td>
                    <td>Memoria RAM</td>
                    <td>Temporal</td>
                    <td>Muy alta</td>
                    <td>Cache, tmp files</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">2. Arquitectura PrestaShop con Volumes</h2>

        <pre><code class="language-yaml"># docker-compose.prod.yml
version: '3.8'

services:
  prestashop:
    image: prestashop:8.9
    volumes:
      # Named volumes (producción)
      - prestashop-uploads:/var/www/html/upload
      - prestashop-modules:/var/www/html/modules
      - prestashop-themes:/var/www/html/themes
      - prestashop-cache:/var/www/html/var/cache
      - prestashop-logs:/var/www/html/var/logs
      
      # Config (bind mount read-only)
      - ./config/settings.inc.php:/var/www/html/config/settings.inc.php:ro
      
      # tmpfs para archivos temporales
      - type: tmpfs
        target: /tmp
        tmpfs:
          size: 100m
          mode: 1777
    
    environment:
      - DB_SERVER=mysql
    
    networks:
      - prestashop
  
  mysql:
    image: mysql:8.0
    volumes:
      # Volume para datos de MySQL
      - mysql-data:/var/lib/mysql
      
      # Config personalizada
      - ./mysql/my.cnf:/etc/mysql/conf.d/custom.cnf:ro
    
    environment:
      - MYSQL_ROOT_PASSWORD_FILE=/run/secrets/mysql_root_password
    
    secrets:
      - mysql_root_password
    
    networks:
      - prestashop
  
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      # Persistencia Redis
      - redis-data:/data
    
    networks:
      - prestashop

volumes:
  # Named volumes
  prestashop-uploads:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /mnt/storage/prestashop/uploads
  
  prestashop-modules:
    driver: local
  
  prestashop-themes:
    driver: local
  
  prestashop-cache:
    driver: local
  
  prestashop-logs:
    driver: local
  
  mysql-data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /mnt/storage/mysql
  
  redis-data:
    driver: local

networks:
  prestashop:

secrets:
  mysql_root_password:
    file: ./secrets/mysql_root_password.txt
</code></pre>

        <h2 class="section-title">3. NFS para Shared Storage</h2>

        <h3>3.1. Setup NFS Server</h3>

        <pre><code class="language-bash"># En el servidor NFS
sudo apt-get install nfs-kernel-server

# Crear directorio compartido
sudo mkdir -p /mnt/nfs/prestashop/uploads
sudo chown -R 1000:1000 /mnt/nfs/prestashop

# Configurar exports
sudo nano /etc/exports

# Añadir:
/mnt/nfs/prestashop 192.168.1.0/24(rw,sync,no_subtree_check,no_root_squash)

# Aplicar configuración
sudo exportfs -ra
sudo systemctl restart nfs-kernel-server
</code></pre>

        <h3>3.2. Docker con NFS</h3>

        <pre><code class="language-yaml">volumes:
  prestashop-uploads:
    driver: local
    driver_opts:
      type: nfs
      o: addr=192.168.1.100,rw,nfsvers=4
      device: ":/mnt/nfs/prestashop/uploads"
  
  prestashop-shared:
    driver: local
    driver_opts:
      type: nfs
      o: addr=nfs-server.local,rw,soft,timeo=30
      device: ":/exports/prestashop"
</code></pre>

        <h2 class="section-title">4. Storage Drivers</h2>

        <pre><code class="language-bash"># Ver storage driver actual
docker info | grep "Storage Driver"

# Recomendado: overlay2
# /etc/docker/daemon.json
{
  "storage-driver": "overlay2",
  "storage-opts": [
    "overlay2.override_kernel_check=true"
  ]
}

sudo systemctl restart docker
</code></pre>

        <h2 class="section-title">5. Backup y Restore de Volumes</h2>

        <h3>5.1. Backup</h3>

        <pre><code class="language-bash">#!/bin/bash
# backup-volumes.sh
set -e

BACKUP_DIR="/backup/prestashop/\$(date +%Y%m%d-%H%M%S)"
mkdir -p \$BACKUP_DIR

# Backup uploads
docker run --rm \\
  -v prestashop-uploads:/source:ro \\
  -v \$BACKUP_DIR:/backup \\
  alpine \\
  tar czf /backup/uploads.tar.gz -C /source .

# Backup MySQL
docker exec mysql mysqldump \\
  -u root -p\$MYSQL_ROOT_PASSWORD \\
  --all-databases \\
  --single-transaction \\
  --quick \\
  --lock-tables=false \\
  | gzip > \$BACKUP_DIR/mysql-backup.sql.gz

# Backup Redis
docker exec redis redis-cli BGSAVE
docker cp redis:/data/dump.rdb \$BACKUP_DIR/redis-dump.rdb

echo "Backup completed: \$BACKUP_DIR"

# Subir a S3 (opcional)
aws s3 sync \$BACKUP_DIR s3://my-backups/prestashop/

# Limpiar backups antiguos (>30 días)
find /backup/prestashop -type d -mtime +30 -exec rm -rf {} +
</code></pre>

        <h3>5.2. Restore</h3>

        <pre><code class="language-bash">#!/bin/bash
# restore-volumes.sh
set -e

BACKUP_DIR=\$1

if [ -z "\$BACKUP_DIR" ]; then
    echo "Usage: \$0 <backup_directory>"
    exit 1
fi

# Stop containers
docker-compose down

# Restore uploads
docker run --rm \\
  -v prestashop-uploads:/target \\
  -v \$BACKUP_DIR:/backup:ro \\
  alpine \\
  sh -c "cd /target && tar xzf /backup/uploads.tar.gz"

# Restore MySQL
gunzip < \$BACKUP_DIR/mysql-backup.sql.gz | \\
  docker exec -i mysql mysql -u root -p\$MYSQL_ROOT_PASSWORD

# Restore Redis
docker cp \$BACKUP_DIR/redis-dump.rdb redis:/data/dump.rdb

# Start containers
docker-compose up -d

echo "Restore completed from: \$BACKUP_DIR"
</code></pre>

        <h2 class="section-title">6. S3/Object Storage</h2>

        <pre><code class="language-yaml"># docker-compose.s3.yml
services:
  prestashop:
    image: prestashop:8.9-s3
    environment:
      # S3 para uploads
      - AWS_ACCESS_KEY_ID=\${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=\${AWS_SECRET_ACCESS_KEY}
      - AWS_S3_BUCKET=prestashop-uploads
      - AWS_S3_REGION=us-east-1
      - USE_S3_STORAGE=1
    volumes:
      # Solo cache local
      - prestashop-cache:/var/www/html/var/cache
</code></pre>

        <pre><code class="language-php"><?php
// PrestaShop - S3 Storage Adapter
use Aws\\S3\\S3Client;

class S3StorageAdapter
{
    private $s3;
    private $bucket;
    
    public function __construct()
    {
        $this->bucket = getenv('AWS_S3_BUCKET');
        
        $this->s3 = new S3Client([
            'version' => 'latest',
            'region'  => getenv('AWS_S3_REGION'),
            'credentials' => [
                'key'    => getenv('AWS_ACCESS_KEY_ID'),
                'secret' => getenv('AWS_SECRET_ACCESS_KEY'),
            ],
        ]);
    }
    
    public function upload($localPath, $remotePath)
    {
        return $this->s3->putObject([
            'Bucket' => $this->bucket,
            'Key'    => $remotePath,
            'SourceFile' => $localPath,
            'ACL'    => 'public-read',
        ]);
    }
    
    public function download($remotePath, $localPath)
    {
        return $this->s3->getObject([
            'Bucket' => $this->bucket,
            'Key'    => $remotePath,
            'SaveAs' => $localPath,
        ]);
    }
    
    public function getUrl($remotePath)
    {
        return $this->s3->getObjectUrl($this->bucket, $remotePath);
    }
    
    public function delete($remotePath)
    {
        return $this->s3->deleteObject([
            'Bucket' => $this->bucket,
            'Key'    => $remotePath,
        ]);
    }
}

// Override en módulo
class MyModule extends Module
{
    private $storage;
    
    public function __construct()
    {
        parent::__construct();
        
        if (getenv('USE_S3_STORAGE')) {
            $this->storage = new S3StorageAdapter();
        }
    }
    
    public function hookActionObjectImageAddAfter($params)
    {
        if ($this->storage && isset($params['object'])) {
            $image = $params['object'];
            $localPath = _PS_IMG_DIR_ . $image->getPathForCreation();
            $remotePath = "products/{$image->id_product}/{$image->id}.jpg";
            
            $this->storage->upload($localPath, $remotePath);
            
            // Opcional: eliminar archivo local
            unlink($localPath);
        }
    }
}
</code></pre>

        <h2 class="section-title">7. GlusterFS para Alta Disponibilidad</h2>

        <pre><code class="language-bash"># Setup GlusterFS (2+ nodos)
sudo apt-get install glusterfs-server

# Iniciar servicio
sudo systemctl start glusterd
sudo systemctl enable glusterd

# En nodo 1
sudo gluster peer probe node2.example.com

# Crear volume replicado
sudo gluster volume create prestashop-vol replica 2 \\
  node1.example.com:/data/gluster/prestashop \\
  node2.example.com:/data/gluster/prestashop

sudo gluster volume start prestashop-vol
</code></pre>

        <pre><code class="language-yaml"># Docker con GlusterFS
volumes:
  prestashop-uploads:
    driver: local
    driver_opts:
      type: glusterfs
      o: addr=node1.example.com,backup-volfile-servers=node2.example.com
      device: prestashop-vol
</code></pre>

        <h2 class="section-title">8. Performance y Optimización</h2>

        <h3>8.1. Volume Performance</h3>

        <pre><code class="language-yaml">services:
  prestashop:
    volumes:
      # Optimizado para lecturas frecuentes
      - type: volume
        source: prestashop-uploads
        target: /var/www/html/upload
        volume:
          nocopy: true
      
      # Cache en tmpfs (muy rápido)
      - type: tmpfs
        target: /var/www/html/var/cache
        tmpfs:
          size: 512m
      
      # Logs con opciones de performance
      - type: volume
        source: prestashop-logs
        target: /var/www/html/var/logs
        volume:
          nocopy: true
</code></pre>

        <h3>8.2. MySQL Tuning para Volumes</h3>

        <pre><code class="language-ini"># mysql/my.cnf
[mysqld]
# InnoDB para volumes
innodb_flush_method = O_DIRECT
innodb_buffer_pool_size = 2G
innodb_log_file_size = 512M
innodb_flush_log_at_trx_commit = 2

# Optimizaciones
max_connections = 200
thread_cache_size = 16
table_open_cache = 4000
</code></pre>

        <h2 class="section-title">9. Monitoreo de Storage</h2>

        <pre><code class="language-bash"># Ver uso de volumes
docker system df -v

# Inspeccionar volume
docker volume inspect prestashop-uploads

# Listar archivos en volume
docker run --rm -v prestashop-uploads:/data alpine ls -lh /data

# Tamaño de volume
docker run --rm -v prestashop-uploads:/data alpine du -sh /data

# Monitoreo continuo con Prometheus
</code></pre>

        <pre><code class="language-yaml"># prometheus-storage-exporter
services:
  node-exporter:
    image: prom/node-exporter
    volumes:
      - /:/host:ro,rslave
      - /var/lib/docker/volumes:/var/lib/docker/volumes:ro
    command:
      - '--path.rootfs=/host'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
</code></pre>

        <h2 class="section-title">10. Migración de Datos</h2>

        <pre><code class="language-bash">#!/bin/bash
# migrate-to-nfs.sh
set -e

OLD_VOLUME="prestashop-uploads"
NEW_NFS_PATH="/mnt/nfs/prestashop/uploads"

echo "Stopping PrestaShop container..."
docker-compose stop prestashop

echo "Copying data from volume to NFS..."
docker run --rm \\
  -v \$OLD_VOLUME:/source:ro \\
  -v \$NEW_NFS_PATH:/target \\
  alpine \\
  sh -c "cp -av /source/. /target/"

echo "Updating docker-compose.yml to use NFS..."
# Actualizar docker-compose.yml aquí

echo "Starting PrestaShop with NFS..."
docker-compose up -d prestashop

echo "Verifying..."
docker-compose exec prestashop ls -lh /var/www/html/upload

echo "Migration completed! Old volume can be removed with:"
echo "docker volume rm \$OLD_VOLUME"
</code></pre>

        <h2 class="section-title">11. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Storage en Producción:</strong>
            <ul class="mb-0">
                <li>Named volumes para datos críticos</li>
                <li>NFS/GlusterFS para clusters multi-nodo</li>
                <li>S3/Object storage para uploads escalables</li>
                <li>Backups automatizados diarios</li>
                <li>tmpfs para archivos temporales</li>
                <li>Read-only bind mounts para config</li>
                <li>Monitoreo de espacio en disco</li>
                <li>Políticas de retención de backups</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Evitar:</strong>
            <ul class="mb-0">
                <li>Datos críticos en container filesystem</li>
                <li>Bind mounts en producción (salvo config)</li>
                <li>Volumes sin backup</li>
                <li>Permisos 777 en volumes</li>
                <li>Storage sin monitoreo</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>📊 Dimensionamiento:</strong>
            <ul class="mb-0">
                <li><strong>Uploads:</strong> 10-50GB+ (crece con productos)</li>
                <li><strong>MySQL:</strong> 5-20GB+ (depende de catálogo)</li>
                <li><strong>Redis:</strong> 256MB-2GB (cache)</li>
                <li><strong>Logs:</strong> 1-5GB (rotación configurada)</li>
                <li><strong>Cache:</strong> 512MB-2GB (tmpfs)</li>
            </ul>
        </div>
    </div>
`;

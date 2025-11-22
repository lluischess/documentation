// @ts-nocheck
const escalabilidadHorizontalVertical = `
    <div class="content-section">
        <h1 id="escalabilidad-horizontal-vertical">Escalabilidad Horizontal vs. Vertical</h1>
        <p>Estrategias de escalabilidad para aplicaciones PrestaShop 8.9+ de alto tráfico.</p>

        <h2 class="section-title">1. Escalabilidad Vertical (Scale Up)</h2>

        <p>Añadir más recursos (CPU, RAM, disco) al servidor existente.</p>

        <pre><code class="language-plaintext">ANTES                    DESPUÉS
┌──────────┐            ┌──────────┐
│  Server  │            │  Server  │
│ 4 CPU    │    →      │ 16 CPU   │
│ 8GB RAM  │            │ 64GB RAM │
│ 100GB HD │            │ 1TB SSD  │
└──────────┘            └──────────┘
    ↓                       ↓
  PrestaShop            PrestaShop
</code></pre>

        <div class="alert alert-success">
            <strong>✅ Ventajas Vertical:</strong>
            <ul class="mb-0">
                <li>Fácil de implementar (solo upgrade hardware)</li>
                <li>Sin cambios en código</li>
                <li>Sin complejidad de red</li>
                <li>Ideal para empezar</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Desventajas Vertical:</strong>
            <ul class="mb-0">
                <li><strong>Límite físico:</strong> No puedes crecer infinitamente</li>
                <li><strong>Caro:</strong> Servidores grandes son exponencialmente caros</li>
                <li><strong>Single Point of Failure:</strong> Si cae el servidor, cae todo</li>
                <li><strong>Downtime:</strong> Requiere apagar para hacer upgrade</li>
            </ul>
        </div>

        <h2 class="section-title">2. Escalabilidad Horizontal (Scale Out)</h2>

        <p>Añadir más servidores al pool.</p>

        <pre><code class="language-plaintext">ANTES                    DESPUÉS
┌──────────┐            ┌──────────────────────────┐
│  Server  │            │    Load Balancer         │
│ 4 CPU    │            └─────┬────────┬───────────┘
│ 8GB RAM  │                  │        │        
└──────────┘            ┌─────▼──┐ ┌──▼─────┐ ┌──▼─────┐
                        │Server 1│ │Server 2│ │Server 3│
                        │ 4 CPU  │ │ 4 CPU  │ │ 4 CPU  │
                        │ 8GB RAM│ │ 8GB RAM│ │ 8GB RAM│
                        └────────┘ └────────┘ └────────┘
</code></pre>

        <div class="alert alert-success">
            <strong>✅ Ventajas Horizontal:</strong>
            <ul class="mb-0">
                <li><strong>Escalabilidad ilimitada:</strong> Añade servidores según necesites</li>
                <li><strong>Alta disponibilidad:</strong> Si cae 1 servidor, otros continúan</li>
                <li><strong>Sin downtime:</strong> Añade servidores sin apagar</li>
                <li><strong>Cost-effective:</strong> Servidores commodity más baratos</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Desventajas Horizontal:</strong>
            <ul class="mb-0">
                <li>Requiere Load Balancer</li>
                <li>Sesiones compartidas (Redis/Memcached)</li>
                <li>Archivos compartidos (NFS/S3)</li>
                <li>Complejidad arquitectónica</li>
            </ul>
        </div>

        <h2 class="section-title">3. PrestaShop: Escalabilidad Vertical</h2>

        <pre><code class="language-bash"># Optimización para servidor vertical potente
# php.ini
memory_limit = 4096M
max_execution_time = 300
opcache.memory_consumption = 512
opcache.interned_strings_buffer = 64
opcache.max_accelerated_files = 100000

# MySQL my.cnf
innodb_buffer_pool_size = 32G  # 70-80% de RAM
max_connections = 500
query_cache_size = 512M
innodb_log_file_size = 2G
</code></pre>

        <h2 class="section-title">4. PrestaShop: Escalabilidad Horizontal</h2>

        <h3>4.1. Arquitectura Multi-Server</h3>

        <pre><code class="language-plaintext">┌─────────────────────────────────────────┐
│         Internet Users                  │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Load Balancer (Nginx/HAProxy)      │
└──────┬──────────┬──────────┬────────────┘
       │          │          │
┌──────▼──┐  ┌───▼─────┐ ┌──▼────────┐
│ Web 1   │  │ Web 2   │ │ Web 3     │
│PrestaShp│  │PrestaShp│ │PrestaShop │
└──┬──────┘  └───┬─────┘ └──┬────────┘
   │             │           │
   └─────────────┴───────────┘
                 │
        ┌────────▼────────────┐
        │  Shared Storage     │
        │  (NFS / S3)         │
        └────────┬────────────┘
                 │
        ┌────────▼────────────┐
        │  MySQL Master       │
        │  (Read/Write)       │
        └────────┬────────────┘
                 │
        ┌────────▼────────────┐
        │  MySQL Slave        │
        │  (Read Only)        │
        └─────────────────────┘
</code></pre>

        <h3>4.2. Sesiones Compartidas con Redis</h3>

        <pre><code class="language-php"><?php
// config/defines.inc.php
define('_PS_CACHE_ENABLED_', '1');
define('_PS_CACHING_SYSTEM_', 'CacheRedis');

// Configuración Redis para sesiones
// app/config/parameters.php
'session' => [
    'handler' => 'redis',
    'redis' => [
        'host' => 'redis-cluster.internal',
        'port' => 6379,
        'auth' => getenv('REDIS_PASSWORD'),
        'database' => 1,
        'prefix' => 'ps_session_',
    ]
],

// Implementación custom
class RedisSessionHandler implements \\SessionHandlerInterface
{
    private Redis $redis;
    
    public function __construct()
    {
        $this->redis = new Redis();
        $this->redis->connect('redis-cluster.internal', 6379);
        $this->redis->auth(getenv('REDIS_PASSWORD'));
        $this->redis->select(1);
    }
    
    public function read($id): string
    {
        $data = $this->redis->get("ps_session_{$id}");
        return $data ?: '';
    }
    
    public function write($id, $data): bool
    {
        return $this->redis->setex(
            "ps_session_{$id}",
            1440, // 24 minutos TTL
            $data
        );
    }
    
    public function destroy($id): bool
    {
        return $this->redis->del("ps_session_{$id}") > 0;
    }
}

// Registrar handler
session_set_save_handler(new RedisSessionHandler(), true);
</code></pre>

        <h3>4.3. Archivos Compartidos (NFS o S3)</h3>

        <pre><code class="language-bash"># Opción 1: NFS (Network File System)
# En cada servidor web
sudo mount nfs-server.internal:/mnt/prestashop /var/www/prestashop/img
sudo mount nfs-server.internal:/mnt/prestashop /var/www/prestashop/upload
sudo mount nfs-server.internal:/mnt/prestashop /var/www/prestashop/download

# /etc/fstab
nfs-server.internal:/mnt/prestashop/img /var/www/prestashop/img nfs defaults 0 0
</code></pre>

        <pre><code class="language-php"><?php
// Opción 2: S3 para imágenes (módulo custom)
namespace App\\Storage;

use Aws\\S3\\S3Client;

class S3ImageStorage
{
    private S3Client $s3;
    private string $bucket = 'prestashop-images';
    
    public function __construct()
    {
        $this->s3 = new S3Client([
            'version' => 'latest',
            'region'  => 'eu-west-1',
            'credentials' => [
                'key'    => getenv('AWS_ACCESS_KEY_ID'),
                'secret' => getenv('AWS_SECRET_ACCESS_KEY'),
            ],
        ]);
    }
    
    public function upload(string $localPath, string $s3Key): bool
    {
        try {
            $this->s3->putObject([
                'Bucket' => $this->bucket,
                'Key'    => $s3Key,
                'SourceFile' => $localPath,
                'ACL'    => 'public-read',
            ]);
            return true;
        } catch (\\Exception $e) {
            PrestaShopLogger::addLog('S3 Upload failed: ' . $e->getMessage());
            return false;
        }
    }
    
    public function getUrl(string $s3Key): string
    {
        return "https://{$this->bucket}.s3.amazonaws.com/{$s3Key}";
    }
}

// Hook para subir imágenes a S3
public function hookActionObjectProductAddAfter($params)
{
    $product = $params['object'];
    $storage = new S3ImageStorage();
    
    // Subir imagen principal
    $localPath = _PS_IMG_DIR_ . "p/{$product->id}.jpg";
    if (file_exists($localPath)) {
        $storage->upload($localPath, "products/{$product->id}.jpg");
    }
}
</code></pre>

        <h2 class="section-title">5. Comparación y Recomendaciones</h2>

        <table>
            <thead>
                <tr>
                    <th>Tráfico</th>
                    <th>Recomendación</th>
                    <th>Arquitectura</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>< 10k visitas/día</td>
                    <td>✅ Vertical</td>
                    <td>1 servidor (4 CPU, 8GB RAM)</td>
                </tr>
                <tr>
                    <td>10k - 50k visitas/día</td>
                    <td>✅ Vertical optimizado</td>
                    <td>1 servidor (8 CPU, 16GB RAM)</td>
                </tr>
                <tr>
                    <td>50k - 200k visitas/día</td>
                    <td>⚠️ Híbrido</td>
                    <td>1 web + MySQL replica + Redis</td>
                </tr>
                <tr>
                    <td>> 200k visitas/día</td>
                    <td>✅ Horizontal</td>
                    <td>3+ web servers + LB + Redis + MySQL cluster</td>
                </tr>
                <tr>
                    <td>> 1M visitas/día</td>
                    <td>✅ Horizontal avanzado</td>
                    <td>10+ servidores + CDN + Microservicios</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">6. Checklist Escalabilidad Horizontal</h2>

        <div class="alert alert-info">
            <strong>🎯 Checklist antes de escalar horizontalmente:</strong>
            <ul class="mb-0">
                <li>✅ Sesiones en Redis/Memcached (no en disco)</li>
                <li>✅ Archivos en NFS o S3 (no local)</li>
                <li>✅ Base de datos separada (no en web server)</li>
                <li>✅ Cache distribuido (Redis cluster)</li>
                <li>✅ Load Balancer configurado (sticky sessions si necesario)</li>
                <li>✅ Logs centralizados (ELK, CloudWatch)</li>
                <li>✅ Código stateless (sin dependencias locales)</li>
                <li>✅ Deploy sincronizado en todos los servidores</li>
            </ul>
        </div>

        <h2 class="section-title">7. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>💡 Best Practices:</strong>
            <ul class="mb-0">
                <li><strong>Empieza vertical:</strong> Optimiza primero, escala después</li>
                <li><strong>Monitoring:</strong> Mide antes de escalar (APM, Grafana)</li>
                <li><strong>Stateless:</strong> Diseña la app para ser stateless</li>
                <li><strong>Automatización:</strong> Infra as Code (Terraform, Ansible)</li>
                <li><strong>Auto-scaling:</strong> Usa Cloud (AWS Auto Scaling Groups)</li>
                <li><strong>Cache agresivo:</strong> Redis + Varnish + CDN</li>
            </ul>
        </div>
    </div>
`;

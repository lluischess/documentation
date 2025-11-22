// @ts-nocheck
const cachingDistribuidoRedisMemcached = `
    <div class="content-section">
        <h1 id="caching-distribuido-redis-memcached">Caching Distribuido (Redis, Memcached)</h1>
        <p>Estrategias de caché distribuido con Redis y Memcached para PrestaShop 8.9+ de alto rendimiento.</p>

        <h2 class="section-title">1. ¿Por qué Caché Distribuido?</h2>

        <pre><code class="language-plaintext">SIN CACHÉ DISTRIBUIDO             CON CACHÉ DISTRIBUIDO
┌─────┬─────┬─────┐              ┌─────┬─────┬─────┐
│Web1 │Web2 │Web3 │              │Web1 │Web2 │Web3 │
│Cache│Cache│Cache│              └──┬───┴──┬───┴──┬─┘
│local│local│local│                 │      │      │
└──┬──┴──┬──┴──┬──┘                 └──────┼──────┘
   │     │     │                           │
   └─────┼─────┘                    ┌──────▼──────┐
         │                          │Redis Cluster│
    ┌────▼────┐                     │  (shared)   │
    │  MySQL  │                     └──────┬──────┘
    └─────────┘                            │
                                      ┌────▼────┐
Problema: Cache duplicado           │  MySQL  │
3x memoria desperdiciada             └─────────┘
Cache invalidation complejo          
                                     Solución: Cache compartido
                                     Cache invalidation simple
</code></pre>

        <h2 class="section-title">2. Redis: Configuración Cluster</h2>

        <h3>2.1. Redis Cluster Setup</h3>

        <pre><code class="language-bash"># Instalar Redis
sudo apt install redis-server

# Configurar Redis Cluster (3 masters + 3 slaves)
# redis-7001.conf
port 7001
cluster-enabled yes
cluster-config-file nodes-7001.conf
cluster-node-timeout 5000
appendonly yes

# Crear cluster
redis-cli --cluster create \\
  127.0.0.1:7001 127.0.0.1:7002 127.0.0.1:7003 \\
  127.0.0.1:7004 127.0.0.1:7005 127.0.0.1:7006 \\
  --cluster-replicas 1
</code></pre>

        <h3>2.2. PrestaShop: Redis Cache</h3>

        <pre><code class="language-php"><?php
// config/defines.inc.php
define('_PS_CACHE_ENABLED_', '1');
define('_PS_CACHING_SYSTEM_', 'CacheRedis');

// app/config/parameters.php
'cache' => [
    'redis' => [
        'host' => 'redis-cluster.internal',
        'port' => 6379,
        'auth' => getenv('REDIS_PASSWORD'),
        'database' => 0,
        'prefix' => 'ps_',
    ]
],

// Implementación Redis Cache
namespace PrestaShop\\PrestaShop\\Adapter\\Cache;

class CacheRedis extends Cache
{
    private \\Redis $redis;
    
    public function __construct()
    {
        $this->redis = new \\Redis();
        $this->redis->connect(
            Configuration::get('REDIS_HOST'),
            Configuration::get('REDIS_PORT')
        );
        $this->redis->auth(Configuration::get('REDIS_PASSWORD'));
        $this->redis->select(0);
    }
    
    protected function _set($key, $value, $ttl = 0)
    {
        $key = $this->getPrefix() . $key;
        
        if ($ttl > 0) {
            return $this->redis->setex($key, $ttl, serialize($value));
        }
        
        return $this->redis->set($key, serialize($value));
    }
    
    protected function _get($key)
    {
        $key = $this->getPrefix() . $key;
        $value = $this->redis->get($key);
        
        return $value !== false ? unserialize($value) : false;
    }
    
    protected function _exists($key)
    {
        return $this->redis->exists($this->getPrefix() . $key);
    }
    
    protected function _delete($key)
    {
        return $this->redis->del($this->getPrefix() . $key);
    }
    
    public function flush()
    {
        return $this->redis->flushDb();
    }
}
</code></pre>

        <h3>2.3. Cache Patterns Avanzados</h3>

        <pre><code class="language-php"><?php
// Cache-Aside Pattern
class ProductCache
{
    private \\Redis $redis;
    
    public function getProduct(int $id): array
    {
        $key = "product:{$id}";
        
        // 1. Intentar desde cache
        $cached = $this->redis->get($key);
        if ($cached) {
            return json_decode($cached, true);
        }
        
        // 2. Fallback a DB
        $product = Db::getInstance()->getRow(
            'SELECT * FROM ' . _DB_PREFIX_ . 'product WHERE id_product = ' . (int)$id
        );
        
        // 3. Guardar en cache (1 hora)
        $this->redis->setex($key, 3600, json_encode($product));
        
        return $product;
    }
    
    public function invalidate(int $id): void
    {
        $this->redis->del("product:{$id}");
    }
}

// Write-Through Pattern
class ProductRepository
{
    public function save(Product $product): void
    {
        // 1. Guardar en DB
        $product->save();
        
        // 2. Actualizar cache inmediatamente
        $this->redis->setex(
            "product:{$product->id}",
            3600,
            json_encode($product->toArray())
        );
    }
}

// Cache Stampede Prevention (Lock)
class CacheWithLock
{
    public function get(string $key, callable $callback, int $ttl = 3600)
    {
        $cached = $this->redis->get($key);
        if ($cached) {
            return unserialize($cached);
        }
        
        // Obtener lock
        $lockKey = "{$key}:lock";
        $locked = $this->redis->set($lockKey, 1, ['NX', 'EX' => 10]);
        
        if (!$locked) {
            // Otro proceso está regenerando, esperar
            sleep(1);
            return $this->get($key, $callback, $ttl);
        }
        
        try {
            // Regenerar valor
            $value = $callback();
            $this->redis->setex($key, $ttl, serialize($value));
            return $value;
        } finally {
            $this->redis->del($lockKey);
        }
    }
}
</code></pre>

        <h2 class="section-title">3. Memcached</h2>

        <h3>3.1. Memcached Setup</h3>

        <pre><code class="language-bash"># Instalar Memcached
sudo apt install memcached

# Configurar
# /etc/memcached.conf
-m 2048          # 2GB RAM
-p 11211         # Puerto
-u memcache      # Usuario
-c 1024          # Max conexiones
-I 10m           # Max item size 10MB

sudo systemctl restart memcached
</code></pre>

        <h3>3.2. PrestaShop: Memcached</h3>

        <pre><code class="language-php"><?php
// Implementación Memcached
class CacheMemcached extends Cache
{
    private \\Memcached $memcached;
    
    public function __construct()
    {
        $this->memcached = new \\Memcached();
        $this->memcached->addServer('memcached.internal', 11211);
        
        // Opciones
        $this->memcached->setOption(\\Memcached::OPT_COMPRESSION, true);
        $this->memcached->setOption(\\Memcached::OPT_BINARY_PROTOCOL, true);
    }
    
    protected function _set($key, $value, $ttl = 0)
    {
        return $this->memcached->set(
            $this->getPrefix() . $key,
            $value,
            $ttl ?: 3600
        );
    }
    
    protected function _get($key)
    {
        return $this->memcached->get($this->getPrefix() . $key);
    }
    
    protected function _delete($key)
    {
        return $this->memcached->delete($this->getPrefix() . $key);
    }
}
</code></pre>

        <h2 class="section-title">4. Redis vs Memcached</h2>

        <table>
            <thead>
                <tr>
                    <th>Feature</th>
                    <th>Redis</th>
                    <th>Memcached</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Tipos de datos</strong></td>
                    <td>✅ String, Hash, List, Set, Sorted Set</td>
                    <td>⚠️ Solo String</td>
                </tr>
                <tr>
                    <td><strong>Persistencia</strong></td>
                    <td>✅ RDB, AOF</td>
                    <td>❌ Solo en memoria</td>
                </tr>
                <tr>
                    <td><strong>Replicación</strong></td>
                    <td>✅ Master-Slave, Cluster</td>
                    <td>❌ No nativa</td>
                </tr>
                <tr>
                    <td><strong>Performance</strong></td>
                    <td>⚠️ Muy rápido</td>
                    <td>✅ Ligeramente más rápido</td>
                </tr>
                <tr>
                    <td><strong>Max item size</strong></td>
                    <td>✅ 512MB</td>
                    <td>⚠️ 1MB default</td>
                </tr>
                <tr>
                    <td><strong>Pub/Sub</strong></td>
                    <td>✅ Sí</td>
                    <td>❌ No</td>
                </tr>
                <tr>
                    <td><strong>Transactions</strong></td>
                    <td>✅ Sí</td>
                    <td>❌ No</td>
                </tr>
                <tr>
                    <td><strong>Multi-threading</strong></td>
                    <td>❌ Single-threaded</td>
                    <td>✅ Multi-threaded</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">5. Casos de Uso</h2>

        <h3>5.1. Redis para Sesiones</h3>

        <pre><code class="language-php"><?php
// php.ini
session.save_handler = redis
session.save_path = "tcp://redis.internal:6379?auth=password&database=1"
</code></pre>

        <h3>5.2. Redis para Rate Limiting</h3>

        <pre><code class="language-php"><?php
class RateLimiter
{
    private \\Redis $redis;
    
    public function isAllowed(string $userId, int $maxRequests = 100, int $window = 60): bool
    {
        $key = "rate_limit:{$userId}";
        $current = $this->redis->incr($key);
        
        if ($current === 1) {
            $this->redis->expire($key, $window);
        }
        
        return $current <= $maxRequests;
    }
}

// Uso en controller
if (!$rateLimiter->isAllowed($customerId, 100, 60)) {
    throw new TooManyRequestsException('Rate limit exceeded');
}
</code></pre>

        <h3>5.3. Redis para Leaderboards</h3>

        <pre><code class="language-php"><?php
// Sorted Sets para rankings
class Leaderboard
{
    public function addScore(int $userId, float $score): void
    {
        $this->redis->zadd('leaderboard:sales', $score, $userId);
    }
    
    public function getTopSellers(int $limit = 10): array
    {
        return $this->redis->zrevrange('leaderboard:sales', 0, $limit - 1, true);
    }
    
    public function getUserRank(int $userId): int
    {
        return $this->redis->zrevrank('leaderboard:sales', $userId) + 1;
    }
}
</code></pre>

        <h2 class="section-title">6. Monitoring y Debugging</h2>

        <pre><code class="language-bash"># Redis monitoring
redis-cli INFO stats
# total_commands_processed:1000000
# instantaneous_ops_per_sec:1234
# keyspace_hits:950000
# keyspace_misses:50000

# Hit rate
echo "scale=2; (950000 / 1000000) * 100" | bc
# 95.00% (bueno)

# Memory usage
redis-cli INFO memory
# used_memory_human:1.5G
# maxmemory_human:4G

# Slow queries
redis-cli SLOWLOG GET 10
</code></pre>

        <h2 class="section-title">7. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Best Practices:</strong>
            <ul class="mb-0">
                <li><strong>TTL siempre:</strong> Evitar memoria llena</li>
                <li><strong>Namespacing:</strong> Prefijos claros (ps:product:123)</li>
                <li><strong>Cache invalidation:</strong> Estrategia clara (event-driven)</li>
                <li><strong>Monitoring:</strong> Hit rate > 80%</li>
                <li><strong>Maxmemory policy:</strong> allkeys-lru</li>
                <li><strong>Connection pooling:</strong> Reutilizar conexiones</li>
                <li><strong>Serialización:</strong> JSON o MessagePack</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Evitar:</strong>
            <ul class="mb-0">
                <li>Cachear objetos muy grandes (> 1MB)</li>
                <li>TTL infinito (sin expiración)</li>
                <li>Cache stampede sin lock</li>
                <li>Queries N+1 en cache</li>
            </ul>
        </div>
    </div>
`;

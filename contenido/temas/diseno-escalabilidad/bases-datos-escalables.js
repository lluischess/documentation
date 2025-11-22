// @ts-nocheck
const basesDatosEscalables = `
    <div class="content-section">
        <h1 id="bases-datos-escalables">Bases de Datos Escalables (Replicación, Sharding, NoSQL)</h1>
        <p>Estrategias de escalabilidad de bases de datos para PrestaShop 8.9+ de alto tráfico.</p>

        <h2 class="section-title">1. Replicación Master-Slave (Read Replicas)</h2>

        <pre><code class="language-plaintext">┌─────────────┐
│   App       │
└──┬────────┬─┘
   │ Write  │ Read
   │        │
┌──▼────┐   │
│Master │   │  (Write: INSERT, UPDATE, DELETE)
│(R/W)  ├───┼──→ Replicación binlog
└───────┘   │
            │
    ┌───────▼────┬──────────┐
    │            │          │
┌───▼───┐  ┌────▼──┐  ┌───▼───┐
│Slave 1│  │Slave 2│  │Slave 3│  (Read: SELECT)
│(R/O)  │  │(R/O)  │  │(R/O)  │
└───────┘  └───────┘  └───────┘
</code></pre>

        <h3>1.1. Configuración MySQL Master</h3>

        <pre><code class="language-ini"># /etc/mysql/my.cnf (Master)
[mysqld]
server-id = 1
log_bin = /var/log/mysql/mysql-bin.log
binlog_do_db = prestashop
binlog_format = ROW
expire_logs_days = 7
max_binlog_size = 100M

# Crear usuario replicación
mysql> CREATE USER 'repl'@'%' IDENTIFIED BY 'strong_password';
mysql> GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%';
mysql> FLUSH PRIVILEGES;
mysql> SHOW MASTER STATUS;
+------------------+----------+--------------+------------------+
| File             | Position | Binlog_Do_DB | Binlog_Ignore_DB |
+------------------+----------+--------------+------------------+
| mysql-bin.000003 |      107 | prestashop   |                  |
+------------------+----------+--------------+------------------+
</code></pre>

        <h3>1.2. Configuración MySQL Slave</h3>

        <pre><code class="language-ini"># /etc/mysql/my.cnf (Slave)
[mysqld]
server-id = 2
relay-log = /var/log/mysql/mysql-relay-bin
log_bin = /var/log/mysql/mysql-bin.log
read_only = 1

# Configurar replicación
mysql> CHANGE MASTER TO
    MASTER_HOST='10.0.1.10',
    MASTER_USER='repl',
    MASTER_PASSWORD='strong_password',
    MASTER_LOG_FILE='mysql-bin.000003',
    MASTER_LOG_POS=107;

mysql> START SLAVE;
mysql> SHOW SLAVE STATUS\\G
# Verificar: Slave_IO_Running: Yes, Slave_SQL_Running: Yes
</code></pre>

        <h3>1.3. PrestaShop: Read/Write Splitting</h3>

        <pre><code class="language-php"><?php
// app/config/parameters.php
'database_master' => [
    'server' => '10.0.1.10',  // Master (write)
    'name' => 'prestashop',
    'user' => 'ps_user',
    'password' => 'password',
],
'database_slaves' => [
    [
        'server' => '10.0.1.11',  // Slave 1 (read)
        'name' => 'prestashop',
        'user' => 'ps_user',
        'password' => 'password',
    ],
    [
        'server' => '10.0.1.12',  // Slave 2 (read)
        'name' => 'prestashop',
        'user' => 'ps_user',
        'password' => 'password',
    ],
],

// Implementación custom Db class
class DbReadWrite extends Db
{
    private static $masterConnection = null;
    private static $slaveConnections = [];
    
    public static function getInstance($master = false)
    {
        if ($master || self::isWriteOperation()) {
            return self::getMasterConnection();
        }
        return self::getSlaveConnection();
    }
    
    private static function isWriteOperation(): bool
    {
        $query = strtoupper(trim(self::$_lastQuery ?? ''));
        return str_starts_with($query, 'INSERT') 
            || str_starts_with($query, 'UPDATE') 
            || str_starts_with($query, 'DELETE')
            || str_starts_with($query, 'REPLACE');
    }
    
    private static function getSlaveConnection()
    {
        // Round-robin entre slaves
        $slaves = Configuration::get('database_slaves');
        $slaveIndex = array_rand($slaves);
        
        if (!isset(self::$slaveConnections[$slaveIndex])) {
            $slave = $slaves[$slaveIndex];
            self::$slaveConnections[$slaveIndex] = new mysqli(
                $slave['server'],
                $slave['user'],
                $slave['password'],
                $slave['name']
            );
        }
        
        return self::$slaveConnections[$slaveIndex];
    }
}

// Uso
Db::getInstance()->executeS('SELECT * FROM ps_product'); // Slave
Db::getInstance(true)->execute('UPDATE ps_product SET active = 1'); // Master
</code></pre>

        <h2 class="section-title">2. Sharding (Particionamiento Horizontal)</h2>

        <p>Dividir datos entre múltiples bases de datos por algún criterio (ej: ID cliente, región).</p>

        <pre><code class="language-plaintext">┌──────────────────────────────────────┐
│           Application                │
└────┬────────┬────────┬────────┬──────┘
     │        │        │        │
┌────▼───┐ ┌─▼─────┐ ┌▼──────┐ ┌▼──────┐
│Shard 1 │ │Shard 2│ │Shard 3│ │Shard 4│
│Clientes│ │Clientes│ │Clientes│ │Clientes│
│ID 1-   │ │ID 250k│ │ID 500k│ │ID 750k│
│250k    │ │-500k  │ │-750k  │ │-1M    │
└────────┘ └───────┘ └───────┘ └───────┘
</code></pre>

        <pre><code class="language-php"><?php
// Ejemplo: Sharding por ID de cliente
class ShardingManager
{
    private array $shards = [
        ['host' => '10.0.1.10', 'range' => [0, 250000]],
        ['host' => '10.0.1.11', 'range' => [250001, 500000]],
        ['host' => '10.0.1.12', 'range' => [500001, 750000]],
        ['host' => '10.0.1.13', 'range' => [750001, 1000000]],
    ];
    
    public function getShardForCustomer(int $customerId): array
    {
        foreach ($this->shards as $shard) {
            if ($customerId >= $shard['range'][0] && $customerId <= $shard['range'][1]) {
                return $shard;
            }
        }
        throw new Exception('Shard not found');
    }
    
    public function getCustomer(int $customerId): array
    {
        $shard = $this->getShardForCustomer($customerId);
        $db = new mysqli($shard['host'], 'user', 'pass', 'prestashop');
        
        $stmt = $db->prepare('SELECT * FROM ps_customer WHERE id_customer = ?');
        $stmt->bind_param('i', $customerId);
        $stmt->execute();
        
        return $stmt->get_result()->fetch_assoc();
    }
}
</code></pre>

        <h2 class="section-title">3. NoSQL para Escalabilidad</h2>

        <h3>3.1. Redis para Caché</h3>

        <pre><code class="language-php"><?php
// Cache de productos en Redis
class ProductCacheRedis
{
    private Redis $redis;
    
    public function getProduct(int $productId): ?array
    {
        $cached = $this->redis->get("product:{$productId}");
        
        if ($cached) {
            return json_decode($cached, true);
        }
        
        // Fallback a MySQL
        $product = Db::getInstance()->getRow(
            'SELECT * FROM ' . _DB_PREFIX_ . 'product WHERE id_product = ' . (int)$productId
        );
        
        // Cache por 1 hora
        $this->redis->setex("product:{$productId}", 3600, json_encode($product));
        
        return $product;
    }
}
</code></pre>

        <h3>3.2. MongoDB para Logs/Analytics</h3>

        <pre><code class="language-php"><?php
// Logs de actividad en MongoDB (no impacta MySQL)
use MongoDB\\Client;

class ActivityLogger
{
    private $collection;
    
    public function __construct()
    {
        $client = new Client('mongodb://mongo.internal:27017');
        $this->collection = $client->prestashop->activity_logs;
    }
    
    public function logProductView(int $productId, int $customerId): void
    {
        $this->collection->insertOne([
            'event' => 'product_view',
            'product_id' => $productId,
            'customer_id' => $customerId,
            'timestamp' => new MongoDB\\BSON\\UTCDateTime(),
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
            'ip' => $_SERVER['REMOTE_ADDR'] ?? '',
        ]);
    }
    
    public function getPopularProducts(int $limit = 10): array
    {
        return $this->collection->aggregate([
            ['\\$match' => ['event' => 'product_view']],
            ['\\$group' => [
                '_id' => '\\$product_id',
                'views' => ['\\$sum' => 1]
            ]],
            ['\\$sort' => ['views' => -1]],
            ['\\$limit' => $limit]
        ])->toArray();
    }
}
</code></pre>

        <h3>3.3. Elasticsearch para Búsqueda</h3>

        <pre><code class="language-php"><?php
// Búsqueda rápida en Elasticsearch (mejor que LIKE en MySQL)
use Elasticsearch\\ClientBuilder;

class ProductSearchElasticsearch
{
    private $client;
    
    public function __construct()
    {
        $this->client = ClientBuilder::create()
            ->setHosts(['elasticsearch.internal:9200'])
            ->build();
    }
    
    public function search(string $query, int $limit = 20): array
    {
        $params = [
            'index' => 'products',
            'body' => [
                'query' => [
                    'multi_match' => [
                        'query' => $query,
                        'fields' => ['name^3', 'description', 'reference'],
                        'fuzziness' => 'AUTO'
                    ]
                ],
                'size' => $limit
            ]
        ];
        
        $results = $this->client->search($params);
        
        return array_map(fn($hit) => $hit['_source'], $results['hits']['hits']);
    }
    
    public function indexProduct(int $productId): void
    {
        $product = new Product($productId);
        
        $this->client->index([
            'index' => 'products',
            'id' => $productId,
            'body' => [
                'name' => $product->name,
                'description' => $product->description,
                'reference' => $product->reference,
                'price' => $product->price,
                'active' => (bool)$product->active,
            ]
        ]);
    }
}
</code></pre>

        <h2 class="section-title">4. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Best Practices:</strong>
            <ul class="mb-0">
                <li><strong>Read Replicas:</strong> Para apps con 80%+ lecturas</li>
                <li><strong>Connection Pooling:</strong> Reutilizar conexiones</li>
                <li><strong>Monitoring:</strong> Lag de replicación < 1s</li>
                <li><strong>Sharding:</strong> Solo si replicación no es suficiente</li>
                <li><strong>NoSQL complementario:</strong> No reemplazo total de MySQL</li>
                <li><strong>Cache primero:</strong> Redis antes que replicas</li>
                <li><strong>Backups:</strong> Desde slaves, no desde master</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Cuidado con:</strong>
            <ul class="mb-0">
                <li>Replication lag (leer datos obsoletos)</li>
                <li>Sharding cross-shard queries (muy lentas)</li>
                <li>Consistencia eventual en NoSQL</li>
                <li>Backups distribuidos complejos</li>
            </ul>
        </div>
    </div>
`;

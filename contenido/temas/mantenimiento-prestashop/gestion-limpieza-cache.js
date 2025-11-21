// @ts-nocheck
const gestionLimpiezaCache = `
    <div class="content-section">
        <h1 id="gestion-cache">Gestión y Limpieza de la Caché</h1>
        <p>La caché es fundamental para el rendimiento de PrestaShop 8.9+. Una gestión adecuada de la caché mejora drásticamente los tiempos de carga, pero requiere saber cuándo y cómo limpiarla para evitar problemas con contenido desactualizado.</p>

        <h2 class="section-title">1. Tipos de Caché en PrestaShop</h2>

        <h3>1.1. Caché de Smarty (Plantillas)</h3>
        <p>PrestaShop compila las plantillas Smarty (.tpl) en archivos PHP para acelerar su ejecución.</p>

        <table class="table table-bordered">
            <thead class="table-dark">
                <tr>
                    <th>Aspecto</th>
                    <th>Detalles</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Ubicación</strong></td>
                    <td><code>var/cache/dev/smarty/</code> o <code>var/cache/prod/smarty/</code></td>
                </tr>
                <tr>
                    <td><strong>Contiene</strong></td>
                    <td>Plantillas compiladas (.php), archivos de caché (.cache)</td>
                </tr>
                <tr>
                    <td><strong>Cuándo limpiar</strong></td>
                    <td>Tras modificar archivos .tpl, .css, .js del tema</td>
                </tr>
                <tr>
                    <td><strong>Configuración</strong></td>
                    <td>Parámetros Avanzados > Rendimiento > Caché de plantillas</td>
                </tr>
            </tbody>
        </table>

        <h3>1.2. Caché de Symfony (Aplicación)</h3>
        <p>Almacena el contenedor de servicios, rutas, configuración, anotaciones y más.</p>

        <table class="table table-bordered">
            <thead class="table-dark">
                <tr>
                    <th>Aspecto</th>
                    <th>Detalles</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Ubicación</strong></td>
                    <td><code>var/cache/dev/</code> o <code>var/cache/prod/</code></td>
                </tr>
                <tr>
                    <td><strong>Contiene</strong></td>
                    <td>Container, rutas, configuración, traducciones, anotaciones</td>
                </tr>
                <tr>
                    <td><strong>Cuándo limpiar</strong></td>
                    <td>Tras instalar/desinstalar módulos, cambios en servicios, configuración</td>
                </tr>
                <tr>
                    <td><strong>Subcarpetas</strong></td>
                    <td>annotations/, ContainerXXX/, translations/, etc.</td>
                </tr>
            </tbody>
        </table>

        <h3>1.3. Caché CCC (Combine, Compress and Cache)</h3>
        <p>Combina, minifica y cachea archivos CSS y JavaScript para reducir requests HTTP.</p>

        <table class="table table-bordered">
            <thead class="table-dark">
                <tr>
                    <th>Aspecto</th>
                    <th>Detalles</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Ubicación CSS</strong></td>
                    <td><code>themes/[tema]/assets/cache/</code></td>
                </tr>
                <tr>
                    <td><strong>Ubicación JS</strong></td>
                    <td><code>themes/[tema]/assets/cache/</code></td>
                </tr>
                <tr>
                    <td><strong>Cuándo limpiar</strong></td>
                    <td>Tras modificar CSS/JS, problemas de estilos en front</td>
                </tr>
                <tr>
                    <td><strong>Activar</strong></td>
                    <td>Parámetros Avanzados > Rendimiento > CCC para CSS/JS</td>
                </tr>
            </tbody>
        </table>

        <h3>1.4. Caché de Módulos</h3>

        <pre><code class="language-plaintext">var/cache/[env]/modules/
├── module_list.php          # Lista de módulos activos
├── xml/                      # Metadata de módulos
└── [module_name]/           # Caché específica por módulo</code></pre>

        <h2 class="section-title">2. Métodos de Limpieza de Caché</h2>

        <h3>2.1. Desde el Back Office</h3>

        <pre><code class="language-plaintext">Parámetros Avanzados > Rendimiento
├── [Limpiar caché de Smarty]        → Elimina var/cache/[env]/smarty/
├── [Limpiar caché de Symfony]       → Elimina var/cache/[env]/ (excepto smarty)
└── [Regenerar miniaturas]           → Limpia imágenes cacheadas</code></pre>

        <div class="alert alert-warning">
            <strong>⚠️ Limitación del Back Office:</strong> La limpieza desde BO puede fallar por límites de PHP (max_execution_time, memory_limit). Para tiendas grandes, usar CLI.
        </div>

        <h3>2.2. Desde Línea de Comandos (CLI) - Recomendado</h3>

        <pre><code class="language-bash"># Limpiar toda la caché (producción)
php bin/console cache:clear --env=prod

# Limpiar caché de desarrollo
php bin/console cache:clear --env=dev

# Limpiar sin calentar (warm-up)
php bin/console cache:clear --no-warmup

# Limpiar solo caché de Symfony (mantiene Smarty)
rm -rf var/cache/prod/*
# Excluir smarty
find var/cache/prod -mindepth 1 -maxdepth 1 ! -name 'smarty' -exec rm -rf {} +

# Limpiar solo Smarty
rm -rf var/cache/prod/smarty/compile/*
rm -rf var/cache/prod/smarty/cache/*</code></pre>

        <h3>2.3. Limpieza Programática en PHP</h3>

        <pre><code class="language-php"><?php
// En un módulo o controller
use Symfony\\Component\\Filesystem\\Filesystem;

// Limpiar caché de Smarty
Tools::clearSmartyCache();

// Limpiar XML de módulos
Tools::clearXMLCache();

// Limpiar caché de compilación de assets
Tools::clearCache();

// Limpiar caché de Symfony vía Filesystem
$fs = new Filesystem();
$cacheDir = _PS_CACHE_DIR_ . 'prod/';

// Eliminar todo excepto .gitkeep
$fs->remove(glob($cacheDir . '*'));

// Regenerar caché
if (class_exists('PrestaShop\\PrestaShop\\Adapter\\Cache\\CacheClearer')) {
    $cacheClearer = new \\PrestaShop\\PrestaShop\\Adapter\\Cache\\CacheClearer();
    $cacheClearer->clearAllCaches();
}
</code></pre>

        <h3>2.4. Script de Limpieza Personalizado</h3>

        <pre><code class="language-php"><?php
// tools/clear_cache.php - Script para ejecutar vía CLI o CRON
require_once dirname(__DIR__) . '/config/config.inc.php';

class CacheCleaner
{
    public static function clearAll(): array
    {
        $results = [];
        
        // 1. Smarty
        try {
            Tools::clearSmartyCache();
            $results['smarty'] = '✓ Smarty cache cleared';
        } catch (Exception $e) {
            $results['smarty'] = '✗ Error: ' . $e->getMessage();
        }
        
        // 2. XML de módulos
        try {
            Tools::clearXMLCache();
            $results['xml'] = '✓ XML cache cleared';
        } catch (Exception $e) {
            $results['xml'] = '✗ Error: ' . $e->getMessage();
        }
        
        // 3. Class index
        try {
            Tools::generateIndex();
            $results['class_index'] = '✓ Class index regenerated';
        } catch (Exception $e) {
            $results['class_index'] = '✗ Error: ' . $e->getMessage();
        }
        
        // 4. Symfony cache (vía CLI es más seguro)
        $output = [];
        $returnVar = 0;
        exec('php ' . _PS_ROOT_DIR_ . '/bin/console cache:clear --env=prod 2>&1', $output, $returnVar);
        
        if ($returnVar === 0) {
            $results['symfony'] = '✓ Symfony cache cleared';
        } else {
            $results['symfony'] = '✗ Error clearing Symfony cache: ' . implode('\\n', $output);
        }
        
        return $results;
    }
}

// Ejecutar
echo "Starting cache cleanup...\\n";
$results = CacheCleaner::clearAll();

foreach ($results as $cache => $message) {
    echo "$cache: $message\\n";
}

echo "\\nCache cleanup completed!\\n";
</code></pre>

        <h2 class="section-title">3. Caché de Base de Datos (Query Cache)</h2>

        <h3>3.1. Configuración de MySQL Query Cache</h3>

        <pre><code class="language-sql">-- Verificar estado del query cache (MySQL 5.7)
SHOW VARIABLES LIKE 'query_cache%';

-- Configurar query cache en my.cnf / my.ini
[mysqld]
query_cache_type = 1
query_cache_size = 64M
query_cache_limit = 2M

-- Ver estadísticas
SHOW STATUS LIKE 'Qcache%';

-- Limpiar query cache
FLUSH QUERY CACHE;
RESET QUERY CACHE;</code></pre>

        <div class="alert alert-info">
            <strong>💡 MySQL 8.0+:</strong> Query Cache ha sido eliminado en MySQL 8.0. Se recomienda usar InnoDB Buffer Pool y caché de aplicación (Redis/Memcached).
        </div>

        <h2 class="section-title">4. Caché de Aplicación (Redis/Memcached)</h2>

        <h3>4.1. Configurar Redis en PrestaShop</h3>

        <pre><code class="language-php"><?php
// config/parameters.php
return [
    'parameters' => [
        // ... otras configuraciones
        'ps_cache_enable' => true,
        'ps_cache_fs' => [
            'servers' => [
                [
                    'host' => '127.0.0.1',
                    'port' => 6379,
                    'auth' => '',  // Contraseña si aplica
                    'database' => 0,
                ],
            ],
        ],
    ],
];
</code></pre>

        <h3>4.2. Limpiar Caché de Redis</h3>

        <pre><code class="language-bash"># Conectar a Redis
redis-cli

# Limpiar toda la base de datos actual
FLUSHDB

# Limpiar todas las bases de datos
FLUSHALL

# Ver claves con patrón de PrestaShop
KEYS ps:*

# Eliminar claves específicas
DEL ps:cache:product_123
DEL ps:cache:category_*</code></pre>

        <h3>4.3. Gestión de Caché en PHP con Redis</h3>

        <pre><code class="language-php"><?php
// modules/mymodule/src/Service/CacheService.php
declare(strict_types=1);

namespace MyModule\\Service;

use Redis;
use PrestaShop\\PrestaShop\\Core\\Cache\\Clearer\\CacheClearerInterface;

class CacheService
{
    private ?Redis $redis = null;
    private string $prefix = 'ps:';

    public function __construct()
    {
        if (class_exists('Redis')) {
            $this->redis = new Redis();
            $this->redis->connect('127.0.0.1', 6379);
            $this->redis->setOption(Redis::OPT_PREFIX, $this->prefix);
        }
    }

    /**
     * Obtener valor de caché
     */
    public function get(string $key): mixed
    {
        if (!$this->redis) {
            return false;
        }
        
        $value = $this->redis->get($key);
        
        if ($value === false) {
            return false;
        }
        
        return unserialize($value);
    }

    /**
     * Guardar en caché
     */
    public function set(string $key, mixed $value, int $ttl = 3600): bool
    {
        if (!$this->redis) {
            return false;
        }
        
        return $this->redis->setex($key, $ttl, serialize($value));
    }

    /**
     * Eliminar clave específica
     */
    public function delete(string $key): bool
    {
        if (!$this->redis) {
            return false;
        }
        
        return (bool) $this->redis->del($key);
    }

    /**
     * Eliminar múltiples claves por patrón
     */
    public function deleteByPattern(string $pattern): int
    {
        if (!$this->redis) {
            return 0;
        }
        
        $keys = $this->redis->keys($pattern);
        
        if (empty($keys)) {
            return 0;
        }
        
        return $this->redis->del($keys);
    }

    /**
     * Limpiar toda la caché de PrestaShop
     */
    public function flush(): bool
    {
        if (!$this->redis) {
            return false;
        }
        
        return $this->redis->flushDB();
    }

    /**
     * Obtener estadísticas de caché
     */
    public function getStats(): array
    {
        if (!$this->redis) {
            return [];
        }
        
        $info = $this->redis->info();
        
        return [
            'redis_version' => $info['redis_version'] ?? 'unknown',
            'used_memory_human' => $info['used_memory_human'] ?? 'unknown',
            'connected_clients' => $info['connected_clients'] ?? 0,
            'total_commands_processed' => $info['total_commands_processed'] ?? 0,
            'keyspace_hits' => $info['keyspace_hits'] ?? 0,
            'keyspace_misses' => $info['keyspace_misses'] ?? 0,
            'hit_rate' => $this->calculateHitRate($info),
        ];
    }

    private function calculateHitRate(array $info): string
    {
        $hits = (int) ($info['keyspace_hits'] ?? 0);
        $misses = (int) ($info['keyspace_misses'] ?? 0);
        $total = $hits + $misses;
        
        if ($total === 0) {
            return '0%';
        }
        
        return round(($hits / $total) * 100, 2) . '%';
    }
}
</code></pre>

        <h2 class="section-title">5. Estrategias de Cache Warming</h2>

        <h3>5.1. Pre-calentar Caché después de Limpiar</h3>

        <pre><code class="language-bash"># Después de limpiar, regenerar caché automáticamente
php bin/console cache:clear --env=prod

# Visitar páginas principales para calentar caché
curl -s "https://mitienda.com/" > /dev/null
curl -s "https://mitienda.com/es/2-inicio" > /dev/null
curl -s "https://mitienda.com/es/3-ropa" > /dev/null

# Script de warming automático
php tools/cache_warmer.php</code></pre>

        <h3>5.2. Script de Cache Warming</h3>

        <pre><code class="language-php"><?php
// tools/cache_warmer.php
require_once dirname(__DIR__) . '/config/config.inc.php';

class CacheWarmer
{
    private array $urls = [];

    public function __construct()
    {
        $baseUrl = 'https://mitienda.com/es/';
        
        // URLs principales
        $this->urls[] = $baseUrl;
        
        // Categorías principales
        $categories = Category::getCategories(1, true, false);
        foreach ($categories as $category) {
            $this->urls[] = $baseUrl . $category['id_category'] . '-' . $category['link_rewrite'];
        }
        
        // Productos más populares
        $products = Product::getProducts(1, 0, 50, 'sold', 'DESC');
        foreach ($products as $product) {
            $link = new Link();
            $this->urls[] = $link->getProductLink($product['id_product']);
        }
    }

    public function warm(): void
    {
        echo "Starting cache warming...\\n";
        
        foreach ($this->urls as $url) {
            $this->visitUrl($url);
            echo "✓ Warmed: $url\\n";
            usleep(100000); // 100ms entre requests
        }
        
        echo "\\nCache warming completed!\\n";
    }

    private function visitUrl(string $url): void
    {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_exec($ch);
        curl_close($ch);
    }
}

$warmer = new CacheWarmer();
$warmer->warm();
</code></pre>

        <h2 class="section-title">6. Automatización con CRON</h2>

        <pre><code class="language-bash"># Limpiar caché diariamente a las 3 AM
0 3 * * * cd /var/www/prestashop && php bin/console cache:clear --env=prod --no-warmup

# Limpiar caché de Smarty cada hora
0 * * * * cd /var/www/prestashop && php tools/clear_smarty_cache.php

# Limpiar caché de Redis semanalmente
0 4 * * 0 redis-cli FLUSHDB</code></pre>

        <h2 class="section-title">7. Monitorización de Caché</h2>

        <h3>7.1. Métricas Importantes</h3>

        <table class="table table-striped">
            <thead class="table-dark">
                <tr>
                    <th>Métrica</th>
                    <th>Objetivo</th>
                    <th>Herramienta</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Hit Rate de Redis</td>
                    <td>> 90%</td>
                    <td><code>redis-cli INFO stats</code></td>
                </tr>
                <tr>
                    <td>Tamaño de var/cache/</td>
                    <td>< 500 MB</td>
                    <td><code>du -sh var/cache/</code></td>
                </tr>
                <tr>
                    <td>Tiempo de generación de página</td>
                    <td>< 200ms</td>
                    <td>Symfony Profiler</td>
                </tr>
                <tr>
                    <td>Número de queries SQL</td>
                    <td>< 50 por página</td>
                    <td>Debug Toolbar</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">8. Mejores Prácticas</h2>

        <div class="row">
            <div class="col-md-6">
                <div class="card border-success mb-3">
                    <div class="card-header bg-success text-white">✅ Hacer</div>
                    <div class="card-body">
                        <ul>
                            <li>Limpiar caché tras actualizar módulos</li>
                            <li>Usar CLI para limpiezas en producción</li>
                            <li>Implementar Redis/Memcached</li>
                            <li>Monitorizar hit rate de caché</li>
                            <li>Automatizar limpieza con CRON</li>
                            <li>Documentar procedimientos de caché</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card border-danger mb-3">
                    <div class="card-header bg-danger text-white">❌ Evitar</div>
                    <div class="card-body">
                        <ul>
                            <li>Limpiar caché desde BO en tiendas grandes</li>
                            <li>Tener CCC activado en desarrollo</li>
                            <li>No limpiar caché tras cambios</li>
                            <li>Eliminar archivos .gitkeep de caché</li>
                            <li>No tener backup antes de limpiar</li>
                            <li>Usar rm -rf * sin cuidado</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Importante:</strong> Siempre tener backup actualizado antes de operaciones masivas de limpieza de caché. En tiendas con mucho tráfico, la limpieza de caché puede causar picos de carga temporal.
        </div>
    </div>
`;

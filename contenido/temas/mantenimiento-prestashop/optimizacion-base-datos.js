// @ts-nocheck
const optimizacionBaseDatos = `
    <div class="content-section">
        <h1 id="optimizacion-bd">Optimización de Base de Datos y Consultas</h1>
        <p>Una base de datos bien optimizada es crucial para el rendimiento de PrestaShop 8.9+. Esta sección cubre técnicas para mantener la base de datos MySQL/MariaDB eficiente, identificar y resolver cuellos de botella, y optimizar consultas SQL.</p>

        <h2 class="section-title">1. Diagnóstico del Estado de la Base de Datos</h2>

        <h3>1.1. Verificar Tamaño de Tablas</h3>

        <pre><code class="language-sql">-- Ver tamaño de todas las tablas de PrestaShop
SELECT 
    table_name AS 'Tabla',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Tamaño (MB)',
    table_rows AS 'Filas',
    ROUND((data_length / 1024 / 1024), 2) AS 'Datos (MB)',
    ROUND((index_length / 1024 / 1024), 2) AS 'Índices (MB)'
FROM information_schema.TABLES
WHERE table_schema = 'prestashop'
    AND table_name LIKE 'ps_%'
ORDER BY (data_length + index_length) DESC
LIMIT 20;

-- Tamaño total de la base de datos
SELECT 
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Tamaño Total (MB)'
FROM information_schema.TABLES
WHERE table_schema = 'prestashop';</code></pre>

        <h3>1.2. Identificar Tablas Fragmentadas</h3>

        <pre><code class="language-sql">-- Tablas con fragmentación significativa
SELECT 
    table_name,
    ROUND(data_length / 1024 / 1024, 2) AS 'Datos (MB)',
    ROUND(data_free / 1024 / 1024, 2) AS 'Fragmentado (MB)',
    ROUND((data_free / data_length) * 100, 2) AS 'Fragmentación (%)'
FROM information_schema.TABLES
WHERE table_schema = 'prestashop'
    AND table_name LIKE 'ps_%'
    AND data_free > 0
ORDER BY data_free DESC
LIMIT 20;</code></pre>

        <h2 class="section-title">2. Limpieza de Tablas de Logs</h2>

        <h3>2.1. Tablas que Crecen Indefinidamente</h3>

        <table class="table table-bordered">
            <thead class="table-dark">
                <tr>
                    <th width="30%">Tabla</th>
                    <th width="40%">Propósito</th>
                    <th width="30%">Estrategia de Limpieza</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><code>ps_connections</code></td>
                    <td>Conexiones de usuarios</td>
                    <td>Eliminar > 30 días</td>
                </tr>
                <tr>
                    <td><code>ps_connections_page</code></td>
                    <td>Páginas visitadas</td>
                    <td>Eliminar > 30 días</td>
                </tr>
                <tr>
                    <td><code>ps_connections_source</code></td>
                    <td>Fuentes de tráfico</td>
                    <td>Eliminar > 30 días</td>
                </tr>
                <tr>
                    <td><code>ps_guest</code></td>
                    <td>Invitados (no registrados)</td>
                    <td>Eliminar > 60 días</td>
                </tr>
                <tr>
                    <td><code>ps_cart</code></td>
                    <td>Carritos abandonados</td>
                    <td>Eliminar > 90 días sin pedido</td>
                </tr>
                <tr>
                    <td><code>ps_pagenotfound</code></td>
                    <td>404 errors</td>
                    <td>Eliminar > 15 días</td>
                </tr>
                <tr>
                    <td><code>ps_log</code></td>
                    <td>Logs del sistema</td>
                    <td>Eliminar > 30 días</td>
                </tr>
                <tr>
                    <td><code>ps_mail</code></td>
                    <td>Emails enviados</td>
                    <td>Eliminar > 60 días</td>
                </tr>
            </tbody>
        </table>

        <h3>2.2. Scripts de Limpieza</h3>

        <pre><code class="language-sql">-- Limpiar conexiones antiguas (> 30 días)
DELETE FROM ps_connections 
WHERE date_add < DATE_SUB(NOW(), INTERVAL 30 DAY);

DELETE FROM ps_connections_page
WHERE time_start < DATE_SUB(NOW(), INTERVAL 30 DAY);

DELETE FROM ps_connections_source
WHERE date_add < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- Limpiar invitados antiguos (> 60 días)
DELETE FROM ps_guest
WHERE id_guest NOT IN (SELECT id_guest FROM ps_cart)
    AND id_guest NOT IN (SELECT id_guest FROM ps_connections)
    AND id_guest NOT IN (SELECT id_guest FROM ps_orders);

-- Limpiar carritos abandonados (> 90 días sin convertir)
DELETE FROM ps_cart
WHERE date_add < DATE_SUB(NOW(), INTERVAL 90 DAY)
    AND id_cart NOT IN (SELECT id_cart FROM ps_orders);

-- Limpiar cart_product de carritos eliminados
DELETE FROM ps_cart_product
WHERE id_cart NOT IN (SELECT id_cart FROM ps_cart);

-- Limpiar 404s antiguos
DELETE FROM ps_pagenotfound
WHERE date_add < DATE_SUB(NOW(), INTERVAL 15 DAY);

-- Limpiar logs del sistema
DELETE FROM ps_log
WHERE date_add < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- Limpiar emails antiguos
DELETE FROM ps_mail
WHERE date_add < DATE_SUB(NOW(), INTERVAL 60 DAY);</code></pre>

        <h3>2.3. Script PHP de Limpieza Automatizada</h3>

        <pre><code class="language-php"><?php
// modules/mymodule/src/Service/DatabaseCleanerService.php
declare(strict_types=1);

namespace MyModule\\Service;

use Db;
use Exception;

class DatabaseCleanerService
{
    private array $stats = [];

    /**
     * Ejecutar limpieza completa
     */
    public function cleanAll(): array
    {
        $this->stats = [];
        
        $this->cleanConnections(30);
        $this->cleanGuests(60);
        $this->cleanCarts(90);
        $this->cleanPageNotFound(15);
        $this->cleanLogs(30);
        $this->cleanMails(60);
        $this->cleanOrphanedRecords();
        
        return $this->stats;
    }

    /**
     * Limpiar conexiones antiguas
     */
    private function cleanConnections(int $days): void
    {
        $db = Db::getInstance();
        
        try {
            // ps_connections
            $deleted = $db->delete(
                'connections',
                'date_add < DATE_SUB(NOW(), INTERVAL ' . (int) $days . ' DAY)'
            );
            $this->stats['connections'] = $deleted . ' registros eliminados';
            
            // ps_connections_page
            $deleted = $db->delete(
                'connections_page',
                'time_start < UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL ' . (int) $days . ' DAY))'
            );
            $this->stats['connections_page'] = $deleted . ' registros eliminados';
            
            // ps_connections_source
            $deleted = $db->delete(
                'connections_source',
                'date_add < DATE_SUB(NOW(), INTERVAL ' . (int) $days . ' DAY)'
            );
            $this->stats['connections_source'] = $deleted . ' registros eliminados';
            
        } catch (Exception $e) {
            $this->stats['connections'] = 'Error: ' . $e->getMessage();
        }
    }

    /**
     * Limpiar invitados huérfanos
     */
    private function cleanGuests(int $days): void
    {
        $db = Db::getInstance();
        
        try {
            $sql = 'DELETE FROM ' . _DB_PREFIX_ . 'guest
                WHERE id_guest NOT IN (SELECT DISTINCT id_guest FROM ' . _DB_PREFIX_ . 'cart WHERE id_guest IS NOT NULL)
                    AND id_guest NOT IN (SELECT DISTINCT id_guest FROM ' . _DB_PREFIX_ . 'connections WHERE id_guest IS NOT NULL)
                    AND id_guest NOT IN (SELECT DISTINCT id_guest FROM ' . _DB_PREFIX_ . 'orders WHERE id_guest IS NOT NULL)';
            
            $deleted = $db->execute($sql);
            $this->stats['guests'] = $db->Affected_Rows() . ' invitados eliminados';
            
        } catch (Exception $e) {
            $this->stats['guests'] = 'Error: ' . $e->getMessage();
        }
    }

    /**
     * Limpiar carritos abandonados
     */
    private function cleanCarts(int $days): void
    {
        $db = Db::getInstance();
        
        try {
            // Primero obtener IDs de carritos a eliminar
            $sql = 'SELECT id_cart FROM ' . _DB_PREFIX_ . 'cart
                WHERE date_add < DATE_SUB(NOW(), INTERVAL ' . (int) $days . ' DAY)
                    AND id_cart NOT IN (SELECT id_cart FROM ' . _DB_PREFIX_ . 'orders)';
            
            $cartIds = $db->executeS($sql);
            
            if (!empty($cartIds)) {
                $ids = array_column($cartIds, 'id_cart');
                $idsStr = implode(',', $ids);
                
                // Eliminar productos del carrito
                $db->execute('DELETE FROM ' . _DB_PREFIX_ . 'cart_product WHERE id_cart IN (' . $idsStr . ')');
                
                // Eliminar carritos
                $db->delete('cart', 'id_cart IN (' . $idsStr . ')');
                
                $this->stats['carts'] = count($ids) . ' carritos abandonados eliminados';
            } else {
                $this->stats['carts'] = '0 carritos a eliminar';
            }
            
        } catch (Exception $e) {
            $this->stats['carts'] = 'Error: ' . $e->getMessage();
        }
    }

    /**
     * Limpiar página no encontrada
     */
    private function cleanPageNotFound(int $days): void
    {
        $db = Db::getInstance();
        
        try {
            $deleted = $db->delete(
                'pagenotfound',
                'date_add < DATE_SUB(NOW(), INTERVAL ' . (int) $days . ' DAY)'
            );
            $this->stats['pagenotfound'] = $db->Affected_Rows() . ' registros 404 eliminados';
            
        } catch (Exception $e) {
            $this->stats['pagenotfound'] = 'Error: ' . $e->getMessage();
        }
    }

    /**
     * Limpiar logs del sistema
     */
    private function cleanLogs(int $days): void
    {
        $db = Db::getInstance();
        
        try {
            $deleted = $db->delete(
                'log',
                'date_add < DATE_SUB(NOW(), INTERVAL ' . (int) $days . ' DAY)'
            );
            $this->stats['logs'] = $db->Affected_Rows() . ' logs eliminados';
            
        } catch (Exception $e) {
            $this->stats['logs'] = 'Error: ' . $e->getMessage();
        }
    }

    /**
     * Limpiar emails antiguos
     */
    private function cleanMails(int $days): void
    {
        $db = Db::getInstance();
        
        try {
            $deleted = $db->delete(
                'mail',
                'date_add < DATE_SUB(NOW(), INTERVAL ' . (int) $days . ' DAY)'
            );
            $this->stats['mails'] = $db->Affected_Rows() . ' emails eliminados';
            
        } catch (Exception $e) {
            $this->stats['mails'] = 'Error: ' . $e->getMessage();
        }
    }

    /**
     * Limpiar registros huérfanos
     */
    private function cleanOrphanedRecords(): void
    {
        $db = Db::getInstance();
        
        try {
            // Limpiar cart_product sin cart
            $sql = 'DELETE FROM ' . _DB_PREFIX_ . 'cart_product
                WHERE id_cart NOT IN (SELECT id_cart FROM ' . _DB_PREFIX_ . 'cart)';
            $db->execute($sql);
            $orphaned = $db->Affected_Rows();
            
            $this->stats['orphaned_cart_products'] = $orphaned . ' productos huérfanos eliminados';
            
        } catch (Exception $e) {
            $this->stats['orphaned'] = 'Error: ' . $e->getMessage();
        }
    }

    /**
     * Obtener estadísticas de tamaño de tablas
     */
    public function getTableSizes(): array
    {
        $db = Db::getInstance();
        
        $sql = "SELECT 
            table_name AS 'table',
            ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'size_mb',
            table_rows AS 'rows'
        FROM information_schema.TABLES
        WHERE table_schema = '" . _DB_NAME_ . "'
            AND table_name LIKE '" . _DB_PREFIX_ . "%'
        ORDER BY (data_length + index_length) DESC
        LIMIT 20";
        
        return $db->executeS($sql) ?: [];
    }
}
</code></pre>

        <h2 class="section-title">3. Optimización de Tablas</h2>

        <h3>3.1. OPTIMIZE TABLE</h3>

        <pre><code class="language-sql">-- Optimizar tabla específica (recupera espacio fragmentado)
OPTIMIZE TABLE ps_product;

-- Optimizar todas las tablas de PrestaShop
SELECT CONCAT('OPTIMIZE TABLE ', table_name, ';') AS optimize_command
FROM information_schema.TABLES
WHERE table_schema = 'prestashop'
    AND table_name LIKE 'ps_%'
    AND engine = 'InnoDB';

-- Ejecutar optimización en batch
SET @tables = NULL;
SELECT GROUP_CONCAT(table_name SEPARATOR ',') INTO @tables
FROM information_schema.TABLES
WHERE table_schema = 'prestashop'
    AND table_name LIKE 'ps_%';

SET @optimize = CONCAT('OPTIMIZE TABLE ', @tables);
PREPARE stmt FROM @optimize;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;</code></pre>

        <div class="alert alert-warning">
            <strong>⚠️ Importante:</strong> OPTIMIZE TABLE bloquea la tabla durante la operación. En tablas grandes, puede tardar varios minutos. Ejecutar en horarios de bajo tráfico.
        </div>

        <h3>3.2. ANALYZE TABLE</h3>

        <pre><code class="language-sql">-- Actualizar estadísticas de índices
ANALYZE TABLE ps_product;
ANALYZE TABLE ps_order_detail;
ANALYZE TABLE ps_cart;

-- Analizar todas las tablas
SELECT CONCAT('ANALYZE TABLE ', table_name, ';') AS analyze_command
FROM information_schema.TABLES
WHERE table_schema = 'prestashop'
    AND table_name LIKE 'ps_%';</code></pre>

        <h3>3.3. Script PHP de Optimización</h3>

        <pre><code class="language-php"><?php
// tools/optimize_database.php
require_once dirname(__DIR__) . '/config/config.inc.php';

class DatabaseOptimizer
{
    /**
     * Optimizar todas las tablas de PrestaShop
     */
    public static function optimizeAll(): array
    {
        $db = Db::getInstance();
        $results = [];
        
        // Obtener lista de tablas
        $sql = "SELECT table_name 
            FROM information_schema.TABLES
            WHERE table_schema = '" . _DB_NAME_ . "'
                AND table_name LIKE '" . _DB_PREFIX_ . "%'
                AND engine = 'InnoDB'";
        
        $tables = $db->executeS($sql);
        
        if (empty($tables)) {
            return ['error' => 'No tables found'];
        }
        
        echo "Starting database optimization...\\n\\n";
        
        foreach ($tables as $table) {
            $tableName = $table['table_name'];
            
            try {
                echo "Optimizing $tableName... ";
                
                // Optimize
                $result = $db->execute("OPTIMIZE TABLE \`$tableName\`");
                
                // Analyze
                $db->execute("ANALYZE TABLE \`$tableName\`");
                
                echo "✓ Done\\n";
                $results[$tableName] = 'optimized';
                
            } catch (Exception $e) {
                echo "✗ Error: " . $e->getMessage() . "\\n";
                $results[$tableName] = 'error: ' . $e->getMessage();
            }
            
            // Pequeña pausa para no saturar
            usleep(100000); // 100ms
        }
        
        echo "\\nOptimization completed!\\n";
        
        return $results;
    }

    /**
     * Obtener fragmentación de tablas
     */
    public static function getFragmentation(): array
    {
        $db = Db::getInstance();
        
        $sql = "SELECT 
            table_name,
            ROUND(data_length / 1024 / 1024, 2) AS 'data_mb',
            ROUND(data_free / 1024 / 1024, 2) AS 'free_mb',
            ROUND((data_free / NULLIF(data_length, 0)) * 100, 2) AS 'fragmentation_pct'
        FROM information_schema.TABLES
        WHERE table_schema = '" . _DB_NAME_ . "'
            AND table_name LIKE '" . _DB_PREFIX_ . "%'
            AND data_free > 0
        ORDER BY data_free DESC";
        
        return $db->executeS($sql) ?: [];
    }
}

// Ejecutar
if (php_sapi_name() === 'cli') {
    $results = DatabaseOptimizer::optimizeAll();
}
</code></pre>

        <h2 class="section-title">4. Índices y Optimización de Queries</h2>

        <h3>4.1. Identificar Queries Lentas</h3>

        <pre><code class="language-sql">-- Activar slow query log en MySQL
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;  -- Queries > 2 segundos
SET GLOBAL slow_query_log_file = '/var/log/mysql/slow-query.log';

-- Ver queries lentas en ejecución
SELECT 
    id,
    user,
    host,
    db,
    command,
    time,
    state,
    LEFT(info, 100) AS query
FROM information_schema.processlist
WHERE command != 'Sleep'
    AND time > 2
ORDER BY time DESC;</code></pre>

        <h3>4.2. Analizar Queries con EXPLAIN</h3>

        <pre><code class="language-sql">-- Analizar query específica
EXPLAIN SELECT p.*, pl.name
FROM ps_product p
INNER JOIN ps_product_lang pl ON p.id_product = pl.id_product
WHERE p.active = 1
    AND pl.id_lang = 1
ORDER BY p.date_add DESC
LIMIT 50;

-- EXPLAIN ANALYZE (MySQL 8.0+) muestra tiempos reales
EXPLAIN ANALYZE
SELECT p.*, pl.name
FROM ps_product p
INNER JOIN ps_product_lang pl ON p.id_product = pl.id_product
WHERE p.active = 1;

-- Identificar queries que no usan índices
SELECT * FROM sys.statements_with_full_table_scans
WHERE db = 'prestashop'
LIMIT 10;</code></pre>

        <h3>4.3. Índices Recomendados para PrestaShop</h3>

        <pre><code class="language-sql">-- Productos
CREATE INDEX idx_product_active_date ON ps_product(active, date_add);
CREATE INDEX idx_product_category_active ON ps_product(id_category_default, active);

-- Pedidos
CREATE INDEX idx_orders_customer_valid ON ps_orders(id_customer, valid, date_add);
CREATE INDEX idx_orders_state_date ON ps_orders(current_state, date_add);

-- Detalles de pedido
CREATE INDEX idx_order_detail_product ON ps_order_detail(product_id, id_order);

-- Carritos
CREATE INDEX idx_cart_customer_date ON ps_cart(id_customer, date_add);

-- Categorías
CREATE INDEX idx_category_active_parent ON ps_category(active, id_parent);

-- Stock
CREATE INDEX idx_stock_product_shop ON ps_stock_available(id_product, id_shop);

-- Conexiones (para limpieza eficiente)
CREATE INDEX idx_connections_date ON ps_connections(date_add);
CREATE INDEX idx_guest_date ON ps_guest(date_add);</code></pre>

        <h2 class="section-title">5. Configuración de MySQL/MariaDB</h2>

        <h3>5.1. my.cnf Optimizado para PrestaShop</h3>

        <pre><code class="language-ini">[mysqld]
# Buffer pool (70-80% de RAM disponible para MySQL)
innodb_buffer_pool_size = 2G
innodb_buffer_pool_instances = 8

# Logs
innodb_log_file_size = 256M
innodb_log_buffer_size = 64M
innodb_flush_log_at_trx_commit = 2  # 1 para máxima seguridad, 2 para rendimiento

# Connections
max_connections = 200
max_connect_errors = 10000

# Query cache (solo MySQL 5.7, eliminado en 8.0)
query_cache_type = 1
query_cache_size = 64M
query_cache_limit = 2M

# Tabla y temporales
tmp_table_size = 64M
max_heap_table_size = 64M
table_open_cache = 4000

# Otros
thread_cache_size = 50
join_buffer_size = 4M
sort_buffer_size = 4M
read_rnd_buffer_size = 4M

# Slow query log
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow-query.log
long_query_time = 2</code></pre>

        <h2 class="section-title">6. Monitorización y Métricas</h2>

        <h3>6.1. Métricas Clave</h3>

        <pre><code class="language-sql">-- Estado general de MySQL
SHOW STATUS;

-- Variables de configuración
SHOW VARIABLES;

-- Uso de InnoDB Buffer Pool
SHOW STATUS LIKE 'Innodb_buffer_pool_%';

-- Ratio de cache hits
SHOW STATUS LIKE 'Qcache%';

-- Conexiones
SHOW STATUS LIKE 'Threads_%';
SHOW STATUS LIKE 'Max_used_connections';

-- Slow queries
SHOW STATUS LIKE 'Slow_queries';</code></pre>

        <h2 class="section-title">7. Automatización con CRON</h2>

        <pre><code class="language-bash"># Limpieza de tablas de logs (diaria a las 3 AM)
0 3 * * * php /var/www/prestashop/tools/clean_database.php

# Optimización de tablas (semanal, domingos a las 4 AM)
0 4 * * 0 php /var/www/prestashop/tools/optimize_database.php

# Análisis de tablas (mensual)
0 5 1 * * mysql -u root -p[password] prestashop -e "SELECT CONCAT('ANALYZE TABLE ', table_name, ';') FROM information_schema.TABLES WHERE table_schema = 'prestashop'" | mysql -u root -p[password] prestashop</code></pre>

        <h2 class="section-title">8. Mejores Prácticas</h2>

        <div class="row">
            <div class="col-md-6">
                <div class="card border-success mb-3">
                    <div class="card-header bg-success text-white">✅ Hacer</div>
                    <div class="card-body">
                        <ul>
                            <li>Backup antes de optimizar</li>
                            <li>Limpiar tablas de logs regularmente</li>
                            <li>Optimizar tablas en horarios de bajo tráfico</li>
                            <li>Monitorizar slow query log</li>
                            <li>Usar EXPLAIN para analizar queries</li>
                            <li>Añadir índices basados en uso real</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card border-danger mb-3">
                    <div class="card-header bg-danger text-white">❌ Evitar</div>
                    <div class="card-body">
                        <ul>
                            <li>OPTIMIZE TABLE en horas pico</li>
                            <li>Eliminar datos sin backup</li>
                            <li>Crear índices sin analizar impacto</li>
                            <li>Ignorar slow query log</li>
                            <li>Dejar crecer tablas indefinidamente</li>
                            <li>No monitorizar rendimiento</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <div class="alert alert-info">
            <strong>🎯 Recomendaciones finales:</strong>
            <ul class="mb-0">
                <li>Tamaño de BD < 2GB para tiendas medianas</li>
                <li>Limpiar logs al menos semanalmente</li>
                <li>Optimizar tablas mensualmente</li>
                <li>Monitorizar queries > 2 segundos</li>
                <li>Mantener índices actualizados</li>
            </ul>
        </div>
    </div>
`;

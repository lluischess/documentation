// @ts-nocheck
const tuningServidoresBD = `
    <div class="content-section">
        <h1 id="tuning-servidores">Tuning de Servidores de Bases de Datos</h1>
        <p>Configurar correctamente MySQL/MariaDB es crucial para el rendimiento óptimo de PrestaShop 8.9+. Esta guía cubre los parámetros esenciales de optimización.</p>

        <h2 class="section-title">1. Configuración Básica (my.cnf)</h2>

        <pre><code class="language-ini">[mysqld]
# === MEMORIA ===
innodb_buffer_pool_size = 2G          # 70-80% RAM disponible para MySQL
innodb_buffer_pool_instances = 8      # División del buffer pool
innodb_log_file_size = 512M           # Tamaño logs de transacciones
innodb_log_buffer_size = 64M

# === CONEXIONES ===
max_connections = 200
max_connect_errors = 10000
thread_cache_size = 50

# === QUERY CACHE (MySQL 5.7 únicamente) ===
query_cache_type = 1
query_cache_size = 64M
query_cache_limit = 2M

# === TABLAS TEMPORALES ===
tmp_table_size = 64M
max_heap_table_size = 64M

# === OTROS ===
table_open_cache = 4000
join_buffer_size = 4M
sort_buffer_size = 4M
</code></pre>

        <h2 class="section-title">2. Parámetros por Tamaño de Servidor</h2>

        <table class="table table-striped">
            <thead class="table-dark">
                <tr>
                    <th>Parámetro</th>
                    <th>2GB RAM</th>
                    <th>4GB RAM</th>
                    <th>8GB RAM</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><code>innodb_buffer_pool_size</code></td>
                    <td>1G</td>
                    <td>3G</td>
                    <td>6G</td>
                </tr>
                <tr>
                    <td><code>innodb_log_file_size</code></td>
                    <td>256M</td>
                    <td>512M</td>
                    <td>1G</td>
                </tr>
                <tr>
                    <td><code>max_connections</code></td>
                    <td>100</td>
                    <td>200</td>
                    <td>300</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">3. Verificar Configuración Actual</h2>

        <pre><code class="language-sql">-- Ver todas las variables
SHOW VARIABLES;

-- Variables críticas
SHOW VARIABLES LIKE 'innodb_buffer_pool_size';
SHOW VARIABLES LIKE 'max_connections';

-- Ver estado actual
SHOW STATUS LIKE 'Threads_connected';
SHOW STATUS LIKE 'Qcache_hits';

-- Buffer pool usage
SELECT 
    (PagesData*PageSize)/POWER(1024,3) DataGB,
    (PagesFree*PageSize)/POWER(1024,3) FreeGB
FROM (
    SELECT variable_value PageSize
    FROM information_schema.global_status
    WHERE variable_name='Innodb_page_size'
) PageSize, (
    SELECT variable_value PagesData
    FROM information_schema.global_status
    WHERE variable_name='Innodb_buffer_pool_pages_data'
) PagesData, (
    SELECT variable_value PagesFree
    FROM information_schema.global_status
    WHERE variable_name='Innodb_buffer_pool_pages_free'
) PagesFree;
</code></pre>

        <h2 class="section-title">4. Optimizaciones para PrestaShop</h2>

        <h3>4.1. InnoDB Configuración</h3>

        <pre><code class="language-ini"># Optimizado para escrituras frecuentes
innodb_flush_log_at_trx_commit = 2    # 1=seguro, 2=rápido
innodb_flush_method = O_DIRECT
innodb_file_per_table = 1

# Threads
innodb_read_io_threads = 4
innodb_write_io_threads = 4

# Optimización de commits
innodb_flush_neighbors = 0    # SSD: 0, HDD: 1
</code></pre>

        <h3>4.2. Character Set y Collation</h3>

        <pre><code class="language-ini">[mysqld]
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

[client]
default-character-set = utf8mb4
</code></pre>

        <h2 class="section-title">5. Monitorización de Rendimiento</h2>

        <pre><code class="language-sql">-- Conexiones activas
SHOW PROCESSLIST;

-- Threads y conexiones
SHOW STATUS LIKE 'Threads%';
SHOW STATUS LIKE 'Connections';

-- Cache hits
SHOW STATUS LIKE 'Qcache%';

-- InnoDB stats
SHOW ENGINE INNODB STATUS;
</code></pre>

        <h2 class="section-title">6. Herramientas de Tuning</h2>

        <pre><code class="language-bash"># MySQLTuner - Script automático
wget http://mysqltuner.pl/ -O mysqltuner.pl
perl mysqltuner.pl

# Percona Toolkit
apt-get install percona-toolkit
pt-mysql-summary

# Tuning Primer
wget https://launchpad.net/mysql-tuning-primer/trunk/1.6-r1/+download/tuning-primer.sh
bash tuning-primer.sh
</code></pre>

        <h2 class="section-title">7. Aplicar Cambios</h2>

        <pre><code class="language-bash"># Editar configuración
sudo nano /etc/mysql/my.cnf

# Reiniciar MySQL
sudo systemctl restart mysql

# Verificar logs por errores
sudo tail -f /var/log/mysql/error.log

# Verificar cambios aplicados
mysql -u root -p -e "SHOW VARIABLES LIKE 'innodb_buffer_pool_size';"
</code></pre>

        <h2 class="section-title">8. Mejores Prácticas</h2>

        <div class="alert alert-warning">
            <strong>⚠️ Importante:</strong>
            <ul class="mb-0">
                <li>Hacer backup antes de cambiar configuración</li>
                <li>Cambiar parámetros uno a uno y monitorizar</li>
                <li>InnoDB Buffer Pool debe ser 70-80% de RAM disponible</li>
                <li>Monitorizar durante 24-48h después de cambios</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>🎯 Métricas Objetivo:</strong>
            <ul class="mb-0">
                <li>Buffer Pool Hit Rate > 99%</li>
                <li>Conexiones activas < 80% max_connections</li>
                <li>Slow queries < 1% del total</li>
            </ul>
        </div>
    </div>
`;

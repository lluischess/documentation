// @ts-nocheck
const monitoreoRendimientoBD = `
    <div class="content-section">
        <h1 id="monitoreo-bd">Monitoreo de Rendimiento de BD</h1>
        <p>Monitorizar el rendimiento de MySQL/MariaDB es esencial para mantener PrestaShop 8.9+ funcionando óptimamente. Esta guía cubre métricas clave, herramientas y estrategias de monitorización.</p>

        <h2 class="section-title">1. Métricas Clave a Monitorizar</h2>

        <table class="table table-bordered">
            <thead class="table-dark">
                <tr>
                    <th>Métrica</th>
                    <th>Comando</th>
                    <th>Valor Objetivo</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Conexiones</strong></td>
                    <td><code>SHOW STATUS LIKE 'Threads_connected';</code></td>
                    <td>< 80% de max_connections</td>
                </tr>
                <tr>
                    <td><strong>QPS</strong></td>
                    <td><code>SHOW STATUS LIKE 'Questions';</code></td>
                    <td>Varía según carga</td>
                </tr>
                <tr>
                    <td><strong>Slow Queries</strong></td>
                    <td><code>SHOW STATUS LIKE 'Slow_queries';</code></td>
                    <td>< 1% del total</td>
                </tr>
                <tr>
                    <td><strong>Buffer Pool</strong></td>
                    <td><code>SHOW STATUS LIKE 'Innodb_buffer_pool%';</code></td>
                    <td>Hit rate > 99%</td>
                </tr>
                <tr>
                    <td><strong>Lock Waits</strong></td>
                    <td><code>SHOW STATUS LIKE 'Innodb_row_lock_waits';</code></td>
                    <td>< 1% de transacciones</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">2. Comandos de Diagnóstico</h2>

        <pre><code class="language-sql">-- Estado general
SHOW STATUS;

-- Procesos activos
SHOW PROCESSLIST;

-- Variables de configuración
SHOW VARIABLES;

-- Queries lentas en ejecución
SELECT * FROM information_schema.processlist
WHERE command != 'Sleep' AND time > 5
ORDER BY time DESC;

-- InnoDB status completo
SHOW ENGINE INNODB STATUS\\G

-- Tamaño de tablas
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb,
    table_rows
FROM information_schema.TABLES
WHERE table_schema = 'prestashop'
ORDER BY (data_length + index_length) DESC
LIMIT 20;
</code></pre>

        <h2 class="section-title">3. Monitoreo con Performance Schema</h2>

        <pre><code class="language-sql">-- Habilitar Performance Schema (my.cnf)
-- performance_schema = ON

-- Top 10 queries más lentas
SELECT 
    DIGEST_TEXT,
    COUNT_STAR AS executions,
    ROUND(AVG_TIMER_WAIT/1000000000, 2) AS avg_ms,
    ROUND(SUM_TIMER_WAIT/1000000000, 2) AS total_ms
FROM performance_schema.events_statements_summary_by_digest
ORDER BY SUM_TIMER_WAIT DESC
LIMIT 10;

-- Uso de memoria por evento
SELECT 
    event_name,
    CURRENT_NUMBER_OF_BYTES_USED/1024/1024 AS mb_used
FROM performance_schema.memory_summary_global_by_event_name
WHERE CURRENT_NUMBER_OF_BYTES_USED > 0
ORDER BY CURRENT_NUMBER_OF_BYTES_USED DESC
LIMIT 20;

-- Queries en espera (locks)
SELECT 
    r.trx_id waiting_trx_id,
    r.trx_mysql_thread_id waiting_thread,
    r.trx_query waiting_query,
    b.trx_id blocking_trx_id,
    b.trx_mysql_thread_id blocking_thread,
    b.trx_query blocking_query
FROM information_schema.innodb_lock_waits w
INNER JOIN information_schema.innodb_trx b ON b.trx_id = w.blocking_trx_id
INNER JOIN information_schema.innodb_trx r ON r.trx_id = w.requesting_trx_id;
</code></pre>

        <h2 class="section-title">4. Herramientas de Monitoreo</h2>

        <h3>4.1. MySQLTuner</h3>

        <pre><code class="language-bash"># Descargar y ejecutar
wget http://mysqltuner.pl/ -O mysqltuner.pl
perl mysqltuner.pl

# Recomendaciones automáticas de optimización
</code></pre>

        <h3>4.2. Percona Monitoring and Management (PMM)</h3>

        <pre><code class="language-bash"># Instalar PMM Server (Docker)
docker run -d -p 80:80 -p 443:443 \
    --name pmm-server \
    -e DISABLE_TELEMETRY=1 \
    percona/pmm-server:latest

# Instalar PMM Client
wget https://downloads.percona.com/downloads/pmm2/2.41.0/binary/debian/bullseye/x86_64/pmm2-client_2.41.0-1.bullseye_amd64.deb
dpkg -i pmm2-client_*.deb

# Configurar cliente
pmm-admin config --server-url=https://admin:admin@localhost:443
pmm-admin add mysql --username=pmm --password=pass
</code></pre>

        <h3>4.3. Grafana + Prometheus</h3>

        <pre><code class="language-yaml"># docker-compose.yml
version: '3'
services:
  prometheus:
    image: prom/prometheus
    ports:
      - 9090:9090
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
  
  grafana:
    image: grafana/grafana
    ports:
      - 3000:3000
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
  
  mysqld-exporter:
    image: prom/mysqld-exporter
    environment:
      - DATA_SOURCE_NAME=exporter:password@(mysql:3306)/
    ports:
      - 9104:9104
</code></pre>

        <h2 class="section-title">5. Script de Monitoreo Personalizado</h2>

        <pre><code class="language-bash">#!/bin/bash
# mysql_monitor.sh - Monitoreo básico

MYSQL_USER="root"
MYSQL_PASS="password"
ALERT_EMAIL="admin@example.com"

# Conexiones actuales
CONNECTIONS=\$(mysql -u$MYSQL_USER -p$MYSQL_PASS -e "SHOW STATUS LIKE 'Threads_connected';" | awk 'NR==2 {print \$2}')
MAX_CONN=\$(mysql -u$MYSQL_USER -p$MYSQL_PASS -e "SHOW VARIABLES LIKE 'max_connections';" | awk 'NR==2 {print \$2}')
CONN_PCT=\$(echo "scale=2; \$CONNECTIONS / \$MAX_CONN * 100" | bc)

echo "Connections: \$CONNECTIONS / \$MAX_CONN (\$CONN_PCT%)"

if (( \$(echo "\$CONN_PCT > 80" | bc -l) )); then
    echo "WARNING: High connection usage!" | mail -s "MySQL Alert" \$ALERT_EMAIL
fi

# Slow queries
SLOW_QUERIES=\$(mysql -u$MYSQL_USER -p$MYSQL_PASS -e "SHOW STATUS LIKE 'Slow_queries';" | awk 'NR==2 {print \$2}')
echo "Slow queries: \$SLOW_QUERIES"

# Buffer pool hit rate
mysql -u$MYSQL_USER -p$MYSQL_PASS << EOF
SELECT 
    CONCAT(ROUND((1 - (Innodb_buffer_pool_reads / Innodb_buffer_pool_read_requests)) * 100, 2), '%') AS hit_rate
FROM 
    (SELECT variable_value AS Innodb_buffer_pool_read_requests 
     FROM performance_schema.global_status WHERE variable_name='Innodb_buffer_pool_read_requests') AS t1,
    (SELECT variable_value AS Innodb_buffer_pool_reads 
     FROM performance_schema.global_status WHERE variable_name='Innodb_buffer_pool_reads') AS t2;
EOF
</code></pre>

        <h2 class="section-title">6. Alertas Automatizadas</h2>

        <pre><code class="language-sql">-- Crear tabla de métricas
CREATE TABLE monitoring_metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    metric_name VARCHAR(100),
    metric_value DECIMAL(10,2),
    threshold_value DECIMAL(10,2),
    alert_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stored procedure de monitoreo
DELIMITER //
CREATE PROCEDURE check_performance()
BEGIN
    DECLARE connections INT;
    DECLARE max_conn INT;
    DECLARE slow_queries INT;
    
    SELECT variable_value INTO connections 
    FROM performance_schema.global_status 
    WHERE variable_name='Threads_connected';
    
    SELECT variable_value INTO max_conn 
    FROM performance_schema.global_variables 
    WHERE variable_name='max_connections';
    
    IF connections > (max_conn * 0.8) THEN
        INSERT INTO monitoring_metrics (metric_name, metric_value, threshold_value)
        VALUES ('connections', connections, max_conn * 0.8);
    END IF;
END //
DELIMITER ;

-- Ejecutar cada minuto (event scheduler)
CREATE EVENT monitor_performance
ON SCHEDULE EVERY 1 MINUTE
DO CALL check_performance();
</code></pre>

        <h2 class="section-title">7. Dashboard de Métricas</h2>

        <pre><code class="language-php"><?php
// modules/mymodule/src/Service/DatabaseMonitorService.php
declare(strict_types=1);

namespace MyModule\\Service;

use Db;

class DatabaseMonitorService
{
    public function getMetrics(): array
    {
        $db = Db::getInstance();
        $metrics = [];
        
        // Conexiones
        $connections = $db->getValue("SHOW STATUS LIKE 'Threads_connected'", false);
        $maxConn = $db->getValue("SHOW VARIABLES LIKE 'max_connections'", false);
        $metrics['connections'] = [
            'current' => (int)$connections,
            'max' => (int)$maxConn,
            'percentage' => round(($connections / $maxConn) * 100, 2)
        ];
        
        // Queries por segundo
        $uptime = $db->getValue("SHOW STATUS LIKE 'Uptime'", false);
        $questions = $db->getValue("SHOW STATUS LIKE 'Questions'", false);
        $metrics['qps'] = round($questions / $uptime, 2);
        
        // Slow queries
        $slowQueries = $db->getValue("SHOW STATUS LIKE 'Slow_queries'", false);
        $metrics['slow_queries'] = (int)$slowQueries;
        
        // Buffer pool
        $bufferReads = $db->getValue("SHOW STATUS LIKE 'Innodb_buffer_pool_reads'", false);
        $bufferRequests = $db->getValue("SHOW STATUS LIKE 'Innodb_buffer_pool_read_requests'", false);
        $hitRate = (1 - ($bufferReads / max($bufferRequests, 1))) * 100;
        $metrics['buffer_pool_hit_rate'] = round($hitRate, 2);
        
        return $metrics;
    }

    public function checkThresholds(): array
    {
        $metrics = $this->getMetrics();
        $alerts = [];
        
        if ($metrics['connections']['percentage'] > 80) {
            $alerts[] = 'High connection usage: ' . $metrics['connections']['percentage'] . '%';
        }
        
        if ($metrics['buffer_pool_hit_rate'] < 99) {
            $alerts[] = 'Low buffer pool hit rate: ' . $metrics['buffer_pool_hit_rate'] . '%';
        }
        
        return $alerts;
    }
}
</code></pre>

        <h2 class="section-title">8. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Monitoreo Efectivo:</strong>
            <ul class="mb-0">
                <li>Establecer baselines de rendimiento normal</li>
                <li>Alertas automáticas para métricas críticas</li>
                <li>Dashboard centralizado (Grafana/PMM)</li>
                <li>Revisar métricas diariamente</li>
                <li>Análisis semanal de tendencias</li>
                <li>Documentar incidentes y soluciones</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>🎯 Métricas Críticas para PrestaShop:</strong>
            <ul class="mb-0">
                <li><strong>QPS:</strong> Queries por segundo</li>
                <li><strong>Conexiones:</strong> < 80% del máximo</li>
                <li><strong>Slow Queries:</strong> < 1% del total</li>
                <li><strong>Buffer Pool Hit Rate:</strong> > 99%</li>
                <li><strong>Lock Waits:</strong> Mínimos</li>
                <li><strong>Replication Lag:</strong> < 5 segundos</li>
            </ul>
        </div>
    </div>
`;

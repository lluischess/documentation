// @ts-nocheck
const replicacionAltaDisponibilidad = `
    <div class="content-section">
        <h1 id="replicacion-disponibilidad">Replicación y Alta Disponibilidad</h1>
        <p>La replicación y alta disponibilidad garantizan que PrestaShop 8.9+ siga funcionando ante fallos de hardware o picos de tráfico. Esta guía cubre configuración de Master-Slave y estrategias de failover.</p>

        <h2 class="section-title">1. Tipos de Replicación</h2>

        <table class="table table-bordered">
            <thead class="table-dark">
                <tr>
                    <th>Tipo</th>
                    <th>Descripción</th>
                    <th>Uso</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Master-Slave</strong></td>
                    <td>1 Master (escritura) → N Slaves (lectura)</td>
                    <td>Separar lecturas/escrituras</td>
                </tr>
                <tr>
                    <td><strong>Master-Master</strong></td>
                    <td>Múltiples Masters (escritura)</td>
                    <td>Alta disponibilidad total</td>
                </tr>
                <tr>
                    <td><strong>Galera Cluster</strong></td>
                    <td>Cluster multi-master sincrónico</td>
                    <td>Máxima disponibilidad</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">2. Configurar Master (Servidor Principal)</h2>

        <pre><code class="language-ini"># /etc/mysql/my.cnf
[mysqld]
server-id = 1
log_bin = /var/log/mysql/mysql-bin.log
binlog_format = ROW
binlog_do_db = prestashop
expire_logs_days = 7
max_binlog_size = 100M
</code></pre>

        <pre><code class="language-sql">-- Crear usuario de replicación
CREATE USER 'replicator'@'%' IDENTIFIED BY 'password';
GRANT REPLICATION SLAVE ON *.* TO 'replicator'@'%';
FLUSH PRIVILEGES;

-- Ver posición del binary log
SHOW MASTER STATUS;
-- Anotar File y Position
</code></pre>

        <h2 class="section-title">3. Configurar Slave (Servidor Réplica)</h2>

        <pre><code class="language-ini"># /etc/mysql/my.cnf
[mysqld]
server-id = 2
relay_log = /var/log/mysql/mysql-relay-bin
log_bin = /var/log/mysql/mysql-bin.log
binlog_format = ROW
read_only = 1
</code></pre>

        <pre><code class="language-sql">-- Configurar replicación
CHANGE MASTER TO
    MASTER_HOST='192.168.1.10',
    MASTER_USER='replicator',
    MASTER_PASSWORD='password',
    MASTER_LOG_FILE='mysql-bin.000001',
    MASTER_LOG_POS=12345;

-- Iniciar replicación
START SLAVE;

-- Verificar estado
SHOW SLAVE STATUS\\G
-- Verificar: Slave_IO_Running = Yes, Slave_SQL_Running = Yes
</code></pre>

        <h2 class="section-title">4. Configurar PrestaShop para Replicación</h2>

        <pre><code class="language-php"><?php
// config/defines.inc.php

// Master (escrituras)
define('_DB_SERVER_', '192.168.1.10');
define('_DB_NAME_', 'prestashop');
define('_DB_USER_', 'root');
define('_DB_PASSWD_', 'password');

// Slave (lecturas)
define('_DB_SERVER_SLAVE_', '192.168.1.20');

// En Db.php, modificar para usar slave en lecturas
class Db extends DbCore
{
    public static function getInstance($master = true)
    {
        if (!$master && defined('_DB_SERVER_SLAVE_')) {
            // Usar slave para lecturas
            return new Db(_DB_SERVER_SLAVE_);
        }
        
        return new Db(_DB_SERVER_);
    }
}
</code></pre>

        <h2 class="section-title">5. Monitorizar Replicación</h2>

        <pre><code class="language-sql">-- En Slave: Verificar lag
SHOW SLAVE STATUS\\G

-- Métricas clave:
-- Seconds_Behind_Master: lag en segundos (debe ser < 5)
-- Last_Error: errores de replicación
-- Slave_IO_Running: Yes = recibiendo binlog
-- Slave_SQL_Running: Yes = aplicando cambios

-- Ver eventos en cola
SHOW PROCESSLIST;
</code></pre>

        <h2 class="section-title">6. Failover Automático con ProxySQL</h2>

        <pre><code class="language-bash"># Instalar ProxySQL
apt-get install proxysql

# Configurar
mysql -u admin -padmin -h 127.0.0.1 -P6032
</code></pre>

        <pre><code class="language-sql">-- Añadir servidores
INSERT INTO mysql_servers (hostgroup_id, hostname, port) 
VALUES (0, '192.168.1.10', 3306);  -- Master
INSERT INTO mysql_servers (hostgroup_id, hostname, port) 
VALUES (1, '192.168.1.20', 3306);  -- Slave

-- Configurar reglas de routing
INSERT INTO mysql_query_rules (rule_id, active, match_pattern, destination_hostgroup)
VALUES (1, 1, '^SELECT.*FOR UPDATE', 0);  -- Escritura a Master
INSERT INTO mysql_query_rules (rule_id, active, match_pattern, destination_hostgroup)
VALUES (2, 1, '^SELECT', 1);  -- Lectura a Slave

LOAD MYSQL SERVERS TO RUNTIME;
SAVE MYSQL SERVERS TO DISK;
</code></pre>

        <h2 class="section-title">7. Galera Cluster (Multi-Master)</h2>

        <pre><code class="language-bash"># Instalar Galera
apt-get install mariadb-server galera-4
</code></pre>

        <pre><code class="language-ini"># /etc/mysql/conf.d/galera.cnf
[mysqld]
binlog_format=ROW
default_storage_engine=InnoDB
innodb_autoinc_lock_mode=2

# Galera settings
wsrep_on=ON
wsrep_provider=/usr/lib/galera/libgalera_smm.so
wsrep_cluster_name="prestashop_cluster"
wsrep_cluster_address="gcomm://192.168.1.10,192.168.1.20,192.168.1.30"
wsrep_node_address="192.168.1.10"
wsrep_node_name="node1"
wsrep_sst_method=rsync
</code></pre>

        <h2 class="section-title">8. Solución de Problemas</h2>

        <table class="table table-striped">
            <thead class="table-dark">
                <tr>
                    <th>Problema</th>
                    <th>Solución</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Replicación parada</td>
                    <td><code>START SLAVE;</code></td>
                </tr>
                <tr>
                    <td>Error de duplicado</td>
                    <td><code>SET GLOBAL SQL_SLAVE_SKIP_COUNTER = 1; START SLAVE;</code></td>
                </tr>
                <tr>
                    <td>Lag alto</td>
                    <td>Aumentar <code>innodb_flush_log_at_trx_commit=2</code></td>
                </tr>
                <tr>
                    <td>Slave desincronizado</td>
                    <td>Re-sincronizar desde backup del master</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">9. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Recomendaciones:</strong>
            <ul class="mb-0">
                <li>Monitorizar lag de replicación (debe ser < 5s)</li>
                <li>Usar binlog_format=ROW para consistencia</li>
                <li>Backups desde slave para no afectar master</li>
                <li>Probar failover regularmente</li>
                <li>Documentar procedimientos de recuperación</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>🎯 Configuración Típica PrestaShop:</strong>
            <ul class="mb-0">
                <li><strong>Master:</strong> Todas las escrituras (INSERT, UPDATE, DELETE)</li>
                <li><strong>Slaves (1-3):</strong> Lecturas (SELECT) distribuidas</li>
                <li><strong>ProxySQL:</strong> Routing automático de queries</li>
                <li><strong>Backup:</strong> Desde slave sin impactar producción</li>
            </ul>
        </div>
    </div>
`;

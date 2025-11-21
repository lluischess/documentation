// @ts-nocheck
const configuracionCronJobs = `
    <div class="content-section">
        <h1 id="configuracion-cron">Configuración de CRON Jobs para Tareas Programadas</h1>
        <p>Los CRON jobs son esenciales para automatizar tareas recurrentes en PrestaShop 8.9+. Esta guía cubre la configuración, creación y gestión de tareas programadas para mantener la tienda funcionando óptimamente.</p>

        <h2 class="section-title">1. Fundamentos de CRON</h2>

        <h3>1.1. Sintaxis de CRON</h3>

        <pre><code class="language-bash"># Formato básico:
# ┌───────────── minuto (0 - 59)
# │ ┌───────────── hora (0 - 23)
# │ │ ┌───────────── día del mes (1 - 31)
# │ │ │ ┌───────────── mes (1 - 12)
# │ │ │ │ ┌───────────── día de la semana (0 - 7, 0 y 7 son domingo)
# │ │ │ │ │
# * * * * * comando a ejecutar</code></pre>

        <h3>1.2. Ejemplos Comunes</h3>

        <table class="table table-bordered">
            <thead class="table-dark">
                <tr>
                    <th width="30%">Expresión</th>
                    <th width="70%">Descripción</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><code>* * * * *</code></td>
                    <td>Cada minuto</td>
                </tr>
                <tr>
                    <td><code>*/5 * * * *</code></td>
                    <td>Cada 5 minutos</td>
                </tr>
                <tr>
                    <td><code>0 * * * *</code></td>
                    <td>Cada hora (minuto 0)</td>
                </tr>
                <tr>
                    <td><code>0 2 * * *</code></td>
                    <td>Diariamente a las 2:00 AM</td>
                </tr>
                <tr>
                    <td><code>0 0 * * 0</code></td>
                    <td>Semanalmente (Domingo a medianoche)</td>
                </tr>
                <tr>
                    <td><code>0 0 1 * *</code></td>
                    <td>Mensualmente (día 1 a medianoche)</td>
                </tr>
                <tr>
                    <td><code>0 9-17 * * 1-5</code></td>
                    <td>Cada hora de 9 AM a 5 PM, lunes a viernes</td>
                </tr>
                <tr>
                    <td><code>0 */6 * * *</code></td>
                    <td>Cada 6 horas</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">2. CRON Jobs Esenciales de PrestaShop</h2>

        <h3>2.1. Configuración Completa</h3>

        <pre><code class="language-bash"># /etc/cron.d/prestashop o editar con: crontab -e

# Variables de entorno
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
PRESTASHOP_PATH=/var/www/prestashop

# ============================================
# TAREAS FRECUENTES (Cada minuto - 5 minutos)
# ============================================

# Procesar emails en cola (cada 5 minutos)
*/5 * * * * www-data php \${PRESTASHOP_PATH}/bin/console prestashop:mail:send >> /var/log/prestashop/cron-mail.log 2>&1

# Verificar stock bajo (cada 10 minutos)
*/10 * * * * www-data php \${PRESTASHOP_PATH}/bin/console prestashop:stock:check >> /var/log/prestashop/cron-stock.log 2>&1

# ============================================
# TAREAS HORARIAS
# ============================================

# Actualizar precios de productos
0 * * * * www-data php \${PRESTASHOP_PATH}/bin/console prestashop:products:update-prices >> /var/log/prestashop/cron-prices.log 2>&1

# Sincronizar inventario
15 * * * * www-data php \${PRESTASHOP_PATH}/bin/console prestashop:inventory:sync >> /var/log/prestashop/cron-inventory.log 2>&1

# Limpiar caché antiguo
30 * * * * www-data find \${PRESTASHOP_PATH}/var/cache/prod/smarty/cache -type f -mtime +7 -delete 2>&1

# ============================================
# TAREAS DIARIAS
# ============================================

# Generar sitemap (2:00 AM)
0 2 * * * www-data php \${PRESTASHOP_PATH}/bin/console prestashop:sitemap:generate >> /var/log/prestashop/cron-sitemap.log 2>&1

# Limpiar tablas de logs (3:00 AM)
0 3 * * * www-data php \${PRESTASHOP_PATH}/tools/clean_database.php >> /var/log/prestashop/cron-clean-db.log 2>&1

# Backup de base de datos (4:00 AM)
0 4 * * * www-data php \${PRESTASHOP_PATH}/tools/backup_database.php >> /var/log/prestashop/cron-backup.log 2>&1

# Actualizar tasas de cambio (5:00 AM)
0 5 * * * www-data php \${PRESTASHOP_PATH}/bin/console prestashop:currency:update >> /var/log/prestashop/cron-currency.log 2>&1

# Procesar pedidos abandonados (6:00 AM)
0 6 * * * www-data php \${PRESTASHOP_PATH}/modules/ps_emailalerts/cron_abandoned.php >> /var/log/prestashop/cron-abandoned.log 2>&1

# Limpiar carritos antiguos (3:30 AM)
30 3 * * * www-data php \${PRESTASHOP_PATH}/tools/clean_old_carts.php >> /var/log/prestashop/cron-carts.log 2>&1

# ============================================
# TAREAS SEMANALES
# ============================================

# Optimizar base de datos (Domingo 4:00 AM)
0 4 * * 0 www-data php \${PRESTASHOP_PATH}/tools/optimize_database.php >> /var/log/prestashop/cron-optimize.log 2>&1

# Generar reportes semanales (Lunes 7:00 AM)
0 7 * * 1 www-data php \${PRESTASHOP_PATH}/tools/generate_weekly_report.php >> /var/log/prestashop/cron-reports.log 2>&1

# Rotar logs (Domingo 5:00 AM)
0 5 * * 0 www-data php \${PRESTASHOP_PATH}/tools/rotate_logs.php >> /var/log/prestashop/cron-rotate.log 2>&1

# ============================================
# TAREAS MENSUALES
# ============================================

# Análisis completo de rendimiento (día 1, 6:00 AM)
0 6 1 * * www-data php \${PRESTASHOP_PATH}/tools/performance_analysis.php >> /var/log/prestashop/cron-performance.log 2>&1

# Backup completo mensual (día 1, 1:00 AM)
0 1 1 * * www-data /usr/local/bin/full_backup.sh >> /var/log/prestashop/cron-full-backup.log 2>&1
</code></pre>

        <h2 class="section-title">3. Scripts PHP para CRON</h2>

        <h3>3.1. Script Base para CRON</h3>

        <pre><code class="language-php"><?php
// tools/cron_template.php
// Template base para scripts de CRON

// Verificar que se ejecute desde CLI
if (php_sapi_name() !== 'cli') {
    die('Este script solo puede ejecutarse desde línea de comandos');
}

// Cargar configuración de PrestaShop
require_once dirname(__DIR__) . '/config/config.inc.php';

// Función de logging
function cronLog(string $message, string $level = 'INFO'): void
{
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] [$level] $message" . PHP_EOL;
    
    echo $logMessage;
    
    // También guardar en archivo
    $logFile = _PS_ROOT_DIR_ . '/var/logs/cron.log';
    file_put_contents($logFile, $logMessage, FILE_APPEND);
}

// Manejo de errores
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    cronLog("PHP Error: $errstr in $errfile:$errline", 'ERROR');
});

// Manejo de excepciones
set_exception_handler(function($exception) {
    cronLog("Exception: " . $exception->getMessage(), 'ERROR');
    cronLog("Trace: " . $exception->getTraceAsString(), 'ERROR');
});

try {
    cronLog("=== Starting CRON Job ===");
    
    // Aquí va tu lógica
    
    cronLog("=== CRON Job Completed Successfully ===");
    
} catch (Exception $e) {
    cronLog("Fatal error: " . $e->getMessage(), 'ERROR');
    exit(1);
}

exit(0);
</code></pre>

        <h3>3.2. Limpieza de Carritos Abandonados</h3>

        <pre><code class="language-php"><?php
// tools/clean_old_carts.php
require_once dirname(__DIR__) . '/config/config.inc.php';

class CartCleaner
{
    private int $daysOld = 90;
    
    public function clean(): array
    {
        $db = Db::getInstance();
        $results = [
            'carts_deleted' => 0,
            'cart_products_deleted' => 0,
        ];
        
        try {
            // Obtener IDs de carritos antiguos sin pedidos
            $sql = 'SELECT id_cart 
                FROM ' . _DB_PREFIX_ . 'cart
                WHERE date_add < DATE_SUB(NOW(), INTERVAL ' . (int)$this->daysOld . ' DAY)
                    AND id_cart NOT IN (SELECT id_cart FROM ' . _DB_PREFIX_ . 'orders)
                LIMIT 1000'; // Procesar en lotes
            
            $carts = $db->executeS($sql);
            
            if (!empty($carts)) {
                $cartIds = array_column($carts, 'id_cart');
                $idsString = implode(',', $cartIds);
                
                // Eliminar productos del carrito
                $db->execute('DELETE FROM ' . _DB_PREFIX_ . 'cart_product 
                    WHERE id_cart IN (' . $idsString . ')');
                $results['cart_products_deleted'] = $db->Affected_Rows();
                
                // Eliminar reglas de carrito
                $db->execute('DELETE FROM ' . _DB_PREFIX_ . 'cart_cart_rule 
                    WHERE id_cart IN (' . $idsString . ')');
                
                // Eliminar carritos
                $db->execute('DELETE FROM ' . _DB_PREFIX_ . 'cart 
                    WHERE id_cart IN (' . $idsString . ')');
                $results['carts_deleted'] = $db->Affected_Rows();
            }
            
            return $results;
            
        } catch (Exception $e) {
            PrestaShopLogger::addLog(
                'CartCleaner error: ' . $e->getMessage(),
                3
            );
            throw $e;
        }
    }
}

// Ejecutar
if (php_sapi_name() === 'cli') {
    $cleaner = new CartCleaner();
    $results = $cleaner->clean();
    
    echo "Carts deleted: " . $results['carts_deleted'] . "\\n";
    echo "Cart products deleted: " . $results['cart_products_deleted'] . "\\n";
}
</code></pre>

        <h3>3.3. Envío de Emails en Cola</h3>

        <pre><code class="language-php"><?php
// tools/send_queued_emails.php
require_once dirname(__DIR__) . '/config/config.inc.php';

class EmailQueueProcessor
{
    private int $batchSize = 50;
    private int $maxRetries = 3;
    
    public function process(): array
    {
        $db = Db::getInstance();
        $results = [
            'sent' => 0,
            'failed' => 0,
            'retried' => 0,
        ];
        
        // Obtener emails pendientes
        $sql = 'SELECT * FROM ' . _DB_PREFIX_ . 'mail_queue
            WHERE status = "pending" OR (status = "failed" AND retries < ' . $this->maxRetries . ')
            ORDER BY priority DESC, date_add ASC
            LIMIT ' . $this->batchSize;
        
        $emails = $db->executeS($sql);
        
        foreach ($emails as $email) {
            try {
                $sent = Mail::send(
                    $email['id_lang'],
                    $email['template'],
                    $email['subject'],
                    json_decode($email['template_vars'], true),
                    $email['recipient'],
                    null,
                    null,
                    null,
                    null,
                    null,
                    _PS_MAIL_DIR_,
                    false
                );
                
                if ($sent) {
                    // Marcar como enviado
                    $db->update('mail_queue', [
                        'status' => 'sent',
                        'sent_at' => date('Y-m-d H:i:s'),
                    ], 'id_mail_queue = ' . (int)$email['id_mail_queue']);
                    
                    $results['sent']++;
                } else {
                    // Incrementar reintentos
                    $db->execute('UPDATE ' . _DB_PREFIX_ . 'mail_queue 
                        SET status = "failed", retries = retries + 1
                        WHERE id_mail_queue = ' . (int)$email['id_mail_queue']);
                    
                    $results['retried']++;
                }
                
            } catch (Exception $e) {
                PrestaShopLogger::addLog(
                    'EmailQueueProcessor error: ' . $e->getMessage(),
                    3,
                    null,
                    'Mail',
                    $email['id_mail_queue']
                );
                
                $results['failed']++;
            }
        }
        
        return $results;
    }
}

// Ejecutar
if (php_sapi_name() === 'cli') {
    $processor = new EmailQueueProcessor();
    $results = $processor->process();
    
    echo "Emails sent: " . $results['sent'] . "\\n";
    echo "Emails retried: " . $results['retried'] . "\\n";
    echo "Emails failed: " . $results['failed'] . "\\n";
}
</code></pre>

        <h2 class="section-title">4. CRON Manager en Módulo</h2>

        <h3>4.1. Servicio de Gestión de CRON</h3>

        <pre><code class="language-php"><?php
// modules/mymodule/src/Service/CronManagerService.php
declare(strict_types=1);

namespace MyModule\\Service;

use Db;
use PrestaShopLogger;

class CronManagerService
{
    /**
     * Registrar tarea CRON
     */
    public function registerTask(
        string $name,
        string $description,
        string $command,
        string $frequency = '0 * * * *',
        bool $active = true
    ): bool {
        $db = Db::getInstance();
        
        return $db->insert('cron_task', [
            'name' => pSQL($name),
            'description' => pSQL($description),
            'command' => pSQL($command),
            'frequency' => pSQL($frequency),
            'active' => (int)$active,
            'last_run' => null,
            'next_run' => $this->calculateNextRun($frequency),
            'created_at' => date('Y-m-d H:i:s'),
        ]);
    }

    /**
     * Obtener tareas pendientes
     */
    public function getPendingTasks(): array
    {
        $db = Db::getInstance();
        
        $sql = 'SELECT * FROM ' . _DB_PREFIX_ . 'cron_task
            WHERE active = 1
                AND (next_run IS NULL OR next_run <= NOW())
            ORDER BY priority DESC, next_run ASC';
        
        return $db->executeS($sql) ?: [];
    }

    /**
     * Ejecutar tarea
     */
    public function executeTask(int $taskId): array
    {
        $db = Db::getInstance();
        $task = $db->getRow('SELECT * FROM ' . _DB_PREFIX_ . 'cron_task 
            WHERE id_cron_task = ' . (int)$taskId);
        
        if (!$task) {
            throw new \\Exception("Task not found: $taskId");
        }
        
        $startTime = microtime(true);
        $output = '';
        $returnCode = 0;
        
        try {
            // Marcar como en ejecución
            $db->update('cron_task', [
                'status' => 'running',
                'last_run' => date('Y-m-d H:i:s'),
            ], 'id_cron_task = ' . (int)$taskId);
            
            // Ejecutar comando
            exec($task['command'] . ' 2>&1', $output, $returnCode);
            $output = implode("\\n", $output);
            
            // Actualizar tarea
            $db->update('cron_task', [
                'status' => $returnCode === 0 ? 'success' : 'failed',
                'last_output' => pSQL(substr($output, 0, 1000)),
                'last_duration' => round(microtime(true) - $startTime, 2),
                'next_run' => $this->calculateNextRun($task['frequency']),
                'run_count' => (int)$task['run_count'] + 1,
            ], 'id_cron_task = ' . (int)$taskId);
            
            // Log
            PrestaShopLogger::addLog(
                "CRON task executed: " . $task['name'] . 
                " | Duration: " . round(microtime(true) - $startTime, 2) . "s" .
                " | Status: " . ($returnCode === 0 ? 'success' : 'failed'),
                $returnCode === 0 ? 1 : 3,
                null,
                'Cron',
                $taskId
            );
            
        } catch (\\Exception $e) {
            $db->update('cron_task', [
                'status' => 'error',
                'last_output' => pSQL($e->getMessage()),
            ], 'id_cron_task = ' . (int)$taskId);
            
            throw $e;
        }
        
        return [
            'task_id' => $taskId,
            'status' => $returnCode === 0 ? 'success' : 'failed',
            'duration' => round(microtime(true) - $startTime, 2),
            'output' => $output,
        ];
    }

    /**
     * Calcular próxima ejecución basada en frecuencia CRON
     */
    private function calculateNextRun(string $frequency): string
    {
        // Usar librería como cron/cron-expression para cálculo preciso
        // Por simplicidad, aquí un ejemplo básico
        
        // Parsear frecuencia y calcular siguiente ejecución
        // Esto es un placeholder, implementación real requiere librería
        
        return date('Y-m-d H:i:s', strtotime('+1 hour'));
    }

    /**
     * Ejecutar todas las tareas pendientes
     */
    public function runPendingTasks(): array
    {
        $tasks = $this->getPendingTasks();
        $results = [];
        
        foreach ($tasks as $task) {
            try {
                $result = $this->executeTask($task['id_cron_task']);
                $results[] = $result;
            } catch (\\Exception $e) {
                $results[] = [
                    'task_id' => $task['id_cron_task'],
                    'status' => 'error',
                    'error' => $e->getMessage(),
                ];
            }
        }
        
        return $results;
    }

    /**
     * Desactivar tarea
     */
    public function deactivateTask(int $taskId): bool
    {
        return Db::getInstance()->update('cron_task', [
            'active' => 0,
        ], 'id_cron_task = ' . (int)$taskId);
    }

    /**
     * Obtener estadísticas de tareas
     */
    public function getStatistics(): array
    {
        $db = Db::getInstance();
        
        return [
            'total_tasks' => (int)$db->getValue('SELECT COUNT(*) FROM ' . _DB_PREFIX_ . 'cron_task'),
            'active_tasks' => (int)$db->getValue('SELECT COUNT(*) FROM ' . _DB_PREFIX_ . 'cron_task WHERE active = 1'),
            'pending_tasks' => count($this->getPendingTasks()),
            'last_run' => $db->getValue('SELECT MAX(last_run) FROM ' . _DB_PREFIX_ . 'cron_task'),
        ];
    }
}
</code></pre>

        <h2 class="section-title">5. Monitorización de CRON</h2>

        <h3>5.1. Verificar Estado de CRON</h3>

        <pre><code class="language-bash"># Verificar servicio cron
systemctl status cron

# Ver logs de cron
tail -f /var/log/syslog | grep CRON

# Listar crontab del usuario actual
crontab -l

# Listar crontab de usuario específico
crontab -u www-data -l

# Ver últimas ejecuciones
grep CRON /var/log/syslog | tail -20</code></pre>

        <h3>5.2. Script de Monitorización</h3>

        <pre><code class="language-bash">#!/bin/bash
# tools/monitor_cron.sh

PRESTASHOP_PATH="/var/www/prestashop"
LOG_FILE="/var/log/prestashop/cron-monitor.log"
ALERT_EMAIL="admin@example.com"

echo "=== CRON Monitoring Report ===" > "$LOG_FILE"
echo "Date: $(date)" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Verificar que cron está ejecutando
if ! systemctl is-active --quiet cron; then
    echo "ERROR: Cron service is not running!" >> "$LOG_FILE"
    echo "Cron service is down!" | mail -s "ALERT: Cron Failure" "$ALERT_EMAIL"
fi

# Verificar logs de CRON recientes
echo "=== Recent CRON Executions ===" >> "$LOG_FILE"
grep CRON /var/log/syslog | tail -10 >> "$LOG_FILE"

echo "" >> "$LOG_FILE"
echo "=== CRON Log Errors ===" >> "$LOG_FILE"
grep -i "error\\|fatal\\|failed" "$PRESTASHOP_PATH"/var/logs/cron*.log >> "$LOG_FILE" 2>&1

# Verificar tamaño de logs
LOG_SIZE=$(du -sh "$PRESTASHOP_PATH"/var/logs/ | cut -f1)
echo "" >> "$LOG_FILE"
echo "Log directory size: $LOG_SIZE" >> "$LOG_FILE"

cat "$LOG_FILE"</code></pre>

        <h2 class="section-title">6. Mejores Prácticas</h2>

        <div class="row">
            <div class="col-md-6">
                <div class="card border-success mb-3">
                    <div class="card-header bg-success text-white">✅ Hacer</div>
                    <div class="card-body">
                        <ul>
                            <li>Usar rutas absolutas en CRON</li>
                            <li>Redirigir output a logs</li>
                            <li>Establecer timeout para tareas largas</li>
                            <li>Monitorizar ejecuciones fallidas</li>
                            <li>Documentar cada tarea CRON</li>
                            <li>Probar en horarios de bajo tráfico</li>
                            <li>Implementar sistema de alertas</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card border-danger mb-3">
                    <div class="card-header bg-danger text-white">❌ Evitar</div>
                    <div class="card-body">
                        <ul>
                            <li>Ejecutar tareas pesadas en horas pico</li>
                            <li>No loggear ejecuciones de CRON</li>
                            <li>Olvidar limpiar logs antiguos</li>
                            <li>No establecer límites de tiempo</li>
                            <li>Ejecutar tareas solapadas</li>
                            <li>Ignorar errores de CRON</li>
                            <li>No tener backup antes de CRON críticos</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <h2 class="section-title">7. Troubleshooting de CRON</h2>

        <table class="table table-striped">
            <thead class="table-dark">
                <tr>
                    <th width="30%">Problema</th>
                    <th width="70%">Solución</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>CRON no ejecuta</strong></td>
                    <td>
                        <ul class="mb-0">
                            <li>Verificar sintaxis del crontab</li>
                            <li>Comprobar permisos de archivos</li>
                            <li>Revisar logs: <code>/var/log/syslog</code></li>
                            <li>Verificar PATH en crontab</li>
                        </ul>
                    </td>
                </tr>
                <tr>
                    <td><strong>Script falla en CRON pero funciona manual</strong></td>
                    <td>
                        <ul class="mb-0">
                            <li>Añadir SHELL y PATH al crontab</li>
                            <li>Usar rutas absolutas</li>
                            <li>Verificar usuario de ejecución</li>
                            <li>Revisar variables de entorno</li>
                        </ul>
                    </td>
                </tr>
                <tr>
                    <td><strong>No recibo emails del CRON</strong></td>
                    <td>
                        <ul class="mb-0">
                            <li>Configurar MAILTO en crontab</li>
                            <li>Verificar sistema de mail</li>
                            <li>Redirigir output manualmente</li>
                        </ul>
                    </td>
                </tr>
                <tr>
                    <td><strong>CRON se ejecuta varias veces</strong></td>
                    <td>
                        <ul class="mb-0">
                            <li>Implementar sistema de locks</li>
                            <li>Verificar sintaxis de frecuencia</li>
                            <li>Revisar múltiples crontabs</li>
                        </ul>
                    </td>
                </tr>
            </tbody>
        </table>

        <h3>7.1. Sistema de Locks para Evitar Ejecuciones Duplicadas</h3>

        <pre><code class="language-php"><?php
// Implementar lock en scripts PHP
class CronLock
{
    private string $lockFile;

    public function __construct(string $taskName)
    {
        $this->lockFile = sys_get_temp_dir() . '/cron_' . $taskName . '.lock';
    }

    public function acquire(): bool
    {
        // Verificar si existe lock
        if (file_exists($this->lockFile)) {
            $lockTime = filemtime($this->lockFile);
            
            // Si el lock tiene más de 1 hora, asumimos proceso muerto
            if (time() - $lockTime > 3600) {
                unlink($this->lockFile);
            } else {
                return false; // Tarea ya ejecutándose
            }
        }
        
        // Crear lock
        touch($this->lockFile);
        return true;
    }

    public function release(): void
    {
        if (file_exists($this->lockFile)) {
            unlink($this->lockFile);
        }
    }
}

// Uso en script
$lock = new CronLock('clean_carts');

if (!$lock->acquire()) {
    die("Task is already running\\n");
}

try {
    // ... ejecutar tarea ...
} finally {
    $lock->release();
}
</code></pre>

        <div class="alert alert-info">
            <strong>💡 Recomendación:</strong> Para gestión avanzada de CRON, considerar usar herramientas como Supervisor, Systemd Timers, o servicios cloud como AWS EventBridge para mayor control y monitorización.
        </div>
    </div>
`;

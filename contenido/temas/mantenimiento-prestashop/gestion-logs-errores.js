// @ts-nocheck
const gestionLogsErrores = `
    <div class="content-section">
        <h1 id="gestion-logs">Gestión de Logs y Errores</h1>
        <p>Una gestión efectiva de logs es esencial para mantener, depurar y optimizar PrestaShop 8.9+. Esta guía cubre la configuración, análisis y automatización de logs de errores y eventos.</p>

        <h2 class="section-title">1. Tipos de Logs en PrestaShop</h2>

        <table class="table table-bordered">
            <thead class="table-dark">
                <tr>
                    <th width="25%">Tipo de Log</th>
                    <th width="35%">Ubicación</th>
                    <th width="40%">Contenido</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>PrestaShop Logs</strong></td>
                    <td><code>var/logs/prod.log</code><br><code>var/logs/dev.log</code></td>
                    <td>Errores de aplicación, warnings, excepciones</td>
                </tr>
                <tr>
                    <td><strong>PHP Errors</strong></td>
                    <td><code>/var/log/php8.1-fpm.log</code></td>
                    <td>Fatal errors, warnings, notices de PHP</td>
                </tr>
                <tr>
                    <td><strong>Web Server</strong></td>
                    <td><code>/var/log/nginx/error.log</code><br><code>/var/log/apache2/error.log</code></td>
                    <td>Errores del servidor web</td>
                </tr>
                <tr>
                    <td><strong>MySQL/MariaDB</strong></td>
                    <td><code>/var/log/mysql/error.log</code></td>
                    <td>Errores de base de datos</td>
                </tr>
                <tr>
                    <td><strong>Slow Query Log</strong></td>
                    <td><code>/var/log/mysql/slow-query.log</code></td>
                    <td>Consultas SQL lentas</td>
                </tr>
                <tr>
                    <td><strong>Cron Logs</strong></td>
                    <td><code>/var/log/cron.log</code></td>
                    <td>Ejecución de tareas programadas</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">2. Configuración de Logs en PrestaShop</h2>

        <h3>2.1. Niveles de Log</h3>

        <pre><code class="language-php"><?php
// PrestaShop Logger Severity Levels
define('PS_LOG_SEVERITY_INFO',    1);  // Información general
define('PS_LOG_SEVERITY_WARNING', 2);  // Advertencias
define('PS_LOG_SEVERITY_ERROR',   3);  // Errores
define('PS_LOG_SEVERITY_MAJOR',   4);  // Errores críticos

// Registrar log
PrestaShopLogger::addLog(
    'Mensaje del log',
    PS_LOG_SEVERITY_INFO,
    null,                    // Error code
    'Order',                 // Object type
    123,                     // Object ID
    true                     // Allow duplicate
);
</code></pre>

        <h3>2.2. Configuración en Back Office</h3>

        <pre><code class="language-plaintext">Parámetros Avanzados > Registros
├── Nivel mínimo de severidad
│   ├── 1 - Informativo
│   ├── 2 - Advertencia
│   ├── 3 - Error
│   └── 4 - Crítico
├── Duración de logs (días)
└── Ver logs</code></pre>

        <h3>2.3. Configuración de Monolog (Symfony)</h3>

        <pre><code class="language-yaml"># config/packages/dev/monolog.yaml
monolog:
    handlers:
        main:
            type: stream
            path: "%kernel.logs_dir%/%kernel.environment%.log"
            level: debug
            channels: ["!event"]
        
        console:
            type: console
            process_psr_3_messages: false
            channels: ["!event", "!doctrine"]
        
        # Log de errores críticos
        critical:
            type: stream
            path: "%kernel.logs_dir%/critical.log"
            level: critical
            formatter: monolog.formatter.json
        
        # Rotar logs automáticamente
        rotating_file:
            type: rotating_file
            path: "%kernel.logs_dir%/%kernel.environment%.log"
            level: debug
            max_files: 10
</code></pre>

        <h2 class="section-title">3. Servicio de Logging Personalizado</h2>

        <pre><code class="language-php"><?php
// modules/mymodule/src/Service/LoggerService.php
declare(strict_types=1);

namespace MyModule\\Service;

use PrestaShopLogger;
use Context;

class LoggerService
{
    private string $moduleName;
    private string $logFile;
    private bool $enableFileLogging;

    public function __construct(string $moduleName, bool $enableFileLogging = true)
    {
        $this->moduleName = $moduleName;
        $this->logFile = _PS_MODULE_DIR_ . $moduleName . '/logs/module.log';
        $this->enableFileLogging = $enableFileLogging;
        
        // Crear directorio de logs si no existe
        $logDir = dirname($this->logFile);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
    }

    /**
     * Log informativo
     */
    public function info(string $message, array $context = []): void
    {
        $this->log($message, PS_LOG_SEVERITY_INFO, $context);
    }

    /**
     * Log de advertencia
     */
    public function warning(string $message, array $context = []): void
    {
        $this->log($message, PS_LOG_SEVERITY_WARNING, $context);
    }

    /**
     * Log de error
     */
    public function error(string $message, array $context = []): void
    {
        $this->log($message, PS_LOG_SEVERITY_ERROR, $context);
    }

    /**
     * Log crítico
     */
    public function critical(string $message, array $context = []): void
    {
        $this->log($message, PS_LOG_SEVERITY_MAJOR, $context);
    }

    /**
     * Log con contexto completo
     */
    private function log(string $message, int $severity, array $context = []): void
    {
        // Añadir contexto adicional
        $context['module'] = $this->moduleName;
        $context['user_id'] = Context::getContext()->employee->id ?? null;
        $context['ip'] = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $context['timestamp'] = date('Y-m-d H:i:s');
        
        // Construir mensaje completo
        $fullMessage = '[' . $this->moduleName . '] ' . $message;
        
        if (!empty($context)) {
            $fullMessage .= ' | Context: ' . json_encode($context);
        }
        
        // Log a PrestaShop
        PrestaShopLogger::addLog(
            $fullMessage,
            $severity,
            null,
            $this->moduleName,
            null,
            true
        );
        
        // Log a archivo si está activado
        if ($this->enableFileLogging) {
            $this->writeToFile($fullMessage, $severity);
        }
    }

    /**
     * Escribir log a archivo
     */
    private function writeToFile(string $message, int $severity): void
    {
        $severityNames = [
            PS_LOG_SEVERITY_INFO => 'INFO',
            PS_LOG_SEVERITY_WARNING => 'WARNING',
            PS_LOG_SEVERITY_ERROR => 'ERROR',
            PS_LOG_SEVERITY_MAJOR => 'CRITICAL',
        ];
        
        $severityName = $severityNames[$severity] ?? 'UNKNOWN';
        $logEntry = date('Y-m-d H:i:s') . " [$severityName] " . $message . PHP_EOL;
        
        file_put_contents($this->logFile, $logEntry, FILE_APPEND);
    }

    /**
     * Log de excepción
     */
    public function logException(\\Throwable $e, array $context = []): void
    {
        $context['exception'] = get_class($e);
        $context['file'] = $e->getFile();
        $context['line'] = $e->getLine();
        $context['trace'] = $e->getTraceAsString();
        
        $this->error($e->getMessage(), $context);
    }

    /**
     * Limpiar logs antiguos
     */
    public function cleanOldLogs(int $days = 30): int
    {
        if (!file_exists($this->logFile)) {
            return 0;
        }
        
        $cutoffTime = time() - ($days * 24 * 60 * 60);
        $fileTime = filemtime($this->logFile);
        
        if ($fileTime < $cutoffTime) {
            unlink($this->logFile);
            return 1;
        }
        
        return 0;
    }

    /**
     * Obtener últimas líneas del log
     */
    public function tail(int $lines = 100): array
    {
        if (!file_exists($this->logFile)) {
            return [];
        }
        
        $file = new \\SplFileObject($this->logFile, 'r');
        $file->seek(PHP_INT_MAX);
        $lastLine = $file->key();
        
        $startLine = max(0, $lastLine - $lines);
        $result = [];
        
        $file->seek($startLine);
        while (!$file->eof()) {
            $result[] = trim($file->current());
            $file->next();
        }
        
        return array_filter($result);
    }
}
</code></pre>

        <h2 class="section-title">4. Análisis de Logs</h2>

        <h3>4.1. Comandos Útiles</h3>

        <pre><code class="language-bash"># Ver últimas 50 líneas de log
tail -n 50 var/logs/prod.log

# Seguir log en tiempo real
tail -f var/logs/prod.log

# Buscar errores específicos
grep "ERROR" var/logs/prod.log

# Contar errores por tipo
grep -o "\\[ERROR\\]\\|\\[WARNING\\]\\|\\[CRITICAL\\]" var/logs/prod.log | sort | uniq -c

# Errores en las últimas 24 horas
find var/logs/ -name "*.log" -mtime -1 -exec grep "ERROR" {} \\;

# Top 10 errores más frecuentes
grep "ERROR" var/logs/prod.log | sort | uniq -c | sort -rn | head -10

# Errores de un módulo específico
grep "\\[mymodule\\]" var/logs/prod.log | grep "ERROR"

# Filtrar por fecha específica
grep "2024-01-15" var/logs/prod.log | grep "ERROR"</code></pre>

        <h3>4.2. Script de Análisis de Logs</h3>

        <pre><code class="language-php"><?php
// tools/log_analyzer.php
require_once dirname(__DIR__) . '/config/config.inc.php';

class LogAnalyzer
{
    private string $logFile;
    
    public function __construct(string $logFile = null)
    {
        $this->logFile = $logFile ?? _PS_ROOT_DIR_ . '/var/logs/prod.log';
    }

    /**
     * Analizar logs y generar estadísticas
     */
    public function analyze(int $lastDays = 7): array
    {
        if (!file_exists($this->logFile)) {
            return ['error' => 'Log file not found'];
        }
        
        $cutoffTime = time() - ($lastDays * 24 * 60 * 60);
        $stats = [
            'total_lines' => 0,
            'by_severity' => [
                'INFO' => 0,
                'WARNING' => 0,
                'ERROR' => 0,
                'CRITICAL' => 0,
            ],
            'by_module' => [],
            'by_hour' => array_fill(0, 24, 0),
            'top_errors' => [],
            'date_range' => [
                'from' => null,
                'to' => null,
            ],
        ];
        
        $file = new SplFileObject($this->logFile, 'r');
        $errorMessages = [];
        
        while (!$file->eof()) {
            $line = $file->current();
            $file->next();
            
            if (empty(trim($line))) {
                continue;
            }
            
            $stats['total_lines']++;
            
            // Extraer fecha y hora
            if (preg_match('/^(\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2})/', $line, $matches)) {
                $timestamp = strtotime($matches[1]);
                
                // Solo analizar logs recientes
                if ($timestamp < $cutoffTime) {
                    continue;
                }
                
                // Actualizar rango de fechas
                if ($stats['date_range']['from'] === null || $timestamp < strtotime($stats['date_range']['from'])) {
                    $stats['date_range']['from'] = $matches[1];
                }
                if ($stats['date_range']['to'] === null || $timestamp > strtotime($stats['date_range']['to'])) {
                    $stats['date_range']['to'] = $matches[1];
                }
                
                // Contar por hora
                $hour = (int) date('H', $timestamp);
                $stats['by_hour'][$hour]++;
            }
            
            // Contar por severidad
            foreach ($stats['by_severity'] as $severity => $count) {
                if (stripos($line, $severity) !== false) {
                    $stats['by_severity'][$severity]++;
                    
                    // Guardar mensajes de error
                    if (in_array($severity, ['ERROR', 'CRITICAL'])) {
                        $errorMessages[] = $this->extractMessage($line);
                    }
                }
            }
            
            // Contar por módulo
            if (preg_match('/\\[([a-zA-Z0-9_]+)\\]/', $line, $matches)) {
                $module = $matches[1];
                if (!isset($stats['by_module'][$module])) {
                    $stats['by_module'][$module] = 0;
                }
                $stats['by_module'][$module]++;
            }
        }
        
        // Top errores más frecuentes
        $errorCounts = array_count_values($errorMessages);
        arsort($errorCounts);
        $stats['top_errors'] = array_slice($errorCounts, 0, 10, true);
        
        // Ordenar módulos por frecuencia
        arsort($stats['by_module']);
        
        return $stats;
    }

    /**
     * Extraer mensaje limpio de la línea de log
     */
    private function extractMessage(string $line): string
    {
        // Remover timestamp y severidad
        $line = preg_replace('/^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}/', '', $line);
        $line = preg_replace('/\\[(INFO|WARNING|ERROR|CRITICAL)\\]/', '', $line);
        
        // Limitar longitud
        return substr(trim($line), 0, 100);
    }

    /**
     * Generar reporte HTML
     */
    public function generateReport(int $lastDays = 7): string
    {
        $stats = $this->analyze($lastDays);
        
        $html = '<h2>Log Analysis Report</h2>';
        $html .= '<p>Period: ' . $stats['date_range']['from'] . ' to ' . $stats['date_range']['to'] . '</p>';
        $html .= '<p>Total lines: ' . $stats['total_lines'] . '</p>';
        
        $html .= '<h3>By Severity</h3><ul>';
        foreach ($stats['by_severity'] as $severity => $count) {
            $html .= '<li>' . $severity . ': ' . $count . '</li>';
        }
        $html .= '</ul>';
        
        $html .= '<h3>Top 10 Modules</h3><ul>';
        $topModules = array_slice($stats['by_module'], 0, 10, true);
        foreach ($topModules as $module => $count) {
            $html .= '<li>' . $module . ': ' . $count . '</li>';
        }
        $html .= '</ul>';
        
        $html .= '<h3>Top 10 Errors</h3><ul>';
        foreach ($stats['top_errors'] as $error => $count) {
            $html .= '<li>(' . $count . 'x) ' . htmlspecialchars($error) . '</li>';
        }
        $html .= '</ul>';
        
        return $html;
    }
}

// Ejecutar análisis
$analyzer = new LogAnalyzer();
echo $analyzer->generateReport(7);
</code></pre>

        <h2 class="section-title">5. Rotación de Logs</h2>

        <h3>5.1. Configuración de Logrotate</h3>

        <pre><code class="language-bash"># /etc/logrotate.d/prestashop
/var/www/prestashop/var/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    missingok
    create 0644 www-data www-data
    sharedscripts
    postrotate
        # Limpiar caché si es necesario
        php /var/www/prestashop/bin/console cache:clear --env=prod --no-warmup > /dev/null 2>&1
    endscript
}</code></pre>

        <h3>5.2. Script PHP de Rotación</h3>

        <pre><code class="language-php"><?php
// tools/rotate_logs.php
require_once dirname(__DIR__) . '/config/config.inc.php';

class LogRotator
{
    /**
     * Rotar logs de PrestaShop
     */
    public static function rotate(int $maxFiles = 10): void
    {
        $logDir = _PS_ROOT_DIR_ . '/var/logs/';
        $files = glob($logDir . '*.log');
        
        foreach ($files as $file) {
            if (filesize($file) > 10 * 1024 * 1024) { // > 10MB
                self::rotateFile($file, $maxFiles);
            }
        }
    }

    /**
     * Rotar un archivo específico
     */
    private static function rotateFile(string $file, int $maxFiles): void
    {
        $basename = basename($file);
        $dirname = dirname($file);
        
        // Eliminar archivo más antiguo si existe
        $oldestFile = $dirname . '/' . $basename . '.' . $maxFiles . '.gz';
        if (file_exists($oldestFile)) {
            unlink($oldestFile);
        }
        
        // Rotar archivos existentes
        for ($i = $maxFiles - 1; $i >= 1; $i--) {
            $oldFile = $dirname . '/' . $basename . '.' . $i . '.gz';
            $newFile = $dirname . '/' . $basename . '.' . ($i + 1) . '.gz';
            
            if (file_exists($oldFile)) {
                rename($oldFile, $newFile);
            }
        }
        
        // Comprimir archivo actual
        $compressed = $dirname . '/' . $basename . '.1.gz';
        $content = file_get_contents($file);
        file_put_contents($compressed, gzencode($content, 9));
        
        // Limpiar archivo original
        file_put_contents($file, '');
        
        echo "Rotated: $basename\\n";
    }
}

// Ejecutar
LogRotator::rotate(10);
</code></pre>

        <h2 class="section-title">6. Monitorización de Logs en Tiempo Real</h2>

        <h3>6.1. Servicio de Monitorización</h3>

        <pre><code class="language-php"><?php
// modules/mymodule/src/Service/LogMonitorService.php
declare(strict_types=1);

namespace MyModule\\Service;

class LogMonitorService
{
    private array $watchers = [];
    private array $alerts = [];

    /**
     * Añadir watcher para patrones específicos
     */
    public function watch(string $pattern, callable $callback): void
    {
        $this->watchers[] = [
            'pattern' => $pattern,
            'callback' => $callback,
        ];
    }

    /**
     * Monitorizar archivo de log
     */
    public function monitor(string $logFile, int $intervalSeconds = 5): void
    {
        if (!file_exists($logFile)) {
            throw new \\Exception("Log file not found: $logFile");
        }
        
        $lastPosition = filesize($logFile);
        
        echo "Monitoring $logFile...\\n";
        echo "Press Ctrl+C to stop\\n\\n";
        
        while (true) {
            clearstatcache();
            $currentSize = filesize($logFile);
            
            if ($currentSize > $lastPosition) {
                $handle = fopen($logFile, 'r');
                fseek($handle, $lastPosition);
                
                while (($line = fgets($handle)) !== false) {
                    $this->processLine($line);
                }
                
                $lastPosition = ftell($handle);
                fclose($handle);
            }
            
            sleep($intervalSeconds);
        }
    }

    /**
     * Procesar línea de log
     */
    private function processLine(string $line): void
    {
        echo $line;
        
        foreach ($this->watchers as $watcher) {
            if (preg_match($watcher['pattern'], $line)) {
                call_user_func($watcher['callback'], $line);
            }
        }
    }

    /**
     * Enviar alerta
     */
    public function sendAlert(string $message, string $severity = 'warning'): void
    {
        $alert = [
            'message' => $message,
            'severity' => $severity,
            'timestamp' => date('Y-m-d H:i:s'),
        ];
        
        $this->alerts[] = $alert;
        
        // Aquí puedes integrar con sistemas de alertas
        // Email, Slack, etc.
        error_log("[ALERT] [$severity] $message");
    }
}

// Ejemplo de uso
$monitor = new LogMonitorService();

// Alertar en errores críticos
$monitor->watch('/\\[CRITICAL\\]/', function($line) use ($monitor) {
    $monitor->sendAlert("Critical error detected: $line", 'critical');
});

// Alertar en errores de BD
$monitor->watch('/MySQL.*error/', function($line) use ($monitor) {
    $monitor->sendAlert("Database error detected: $line", 'error');
});

// Iniciar monitorización
// $monitor->monitor(_PS_ROOT_DIR_ . '/var/logs/prod.log');
</code></pre>

        <h2 class="section-title">7. Integración con Servicios Externos</h2>

        <h3>7.1. Enviar Logs a Sentry</h3>

        <pre><code class="language-php"><?php
// composer require sentry/sentry-symfony

// config/packages/sentry.yaml
sentry:
    dsn: '%env(SENTRY_DSN)%'
    options:
        environment: '%kernel.environment%'
        release: '%env(APP_VERSION)%'

// Usar en código
use Sentry\\captureException;
use Sentry\\captureMessage;

try {
    // ... código ...
} catch (\\Exception $e) {
    captureException($e);
    throw $e;
}

// Log de mensaje
captureMessage('Something went wrong', [
    'level' => 'warning',
    'extra' => ['user_id' => 123]
]);
</code></pre>

        <h3>7.2. Enviar Logs a Elasticsearch</h3>

        <pre><code class="language-php"><?php
// composer require elasticsearch/elasticsearch

use Elasticsearch\\ClientBuilder;

class ElasticsearchLogger
{
    private $client;
    private string $index;

    public function __construct(string $host, string $index)
    {
        $this->client = ClientBuilder::create()
            ->setHosts([$host])
            ->build();
        $this->index = $index;
    }

    public function log(string $level, string $message, array $context = []): void
    {
        $params = [
            'index' => $this->index,
            'body' => [
                '@timestamp' => date('c'),
                'level' => $level,
                'message' => $message,
                'context' => $context,
                'server' => $_SERVER['SERVER_NAME'] ?? 'unknown',
            ]
        ];

        $this->client->index($params);
    }
}
</code></pre>

        <h2 class="section-title">8. Automatización con CRON</h2>

        <pre><code class="language-bash"># Análisis diario de logs
0 2 * * * php /var/www/prestashop/tools/log_analyzer.php > /var/log/prestashop/analysis.log

# Rotación semanal
0 3 * * 0 php /var/www/prestashop/tools/rotate_logs.php

# Limpiar logs antiguos (> 30 días)
0 4 * * * find /var/www/prestashop/var/logs/ -name "*.log.*" -mtime +30 -delete

# Enviar reporte semanal por email
0 9 * * 1 php /var/www/prestashop/tools/send_log_report.php</code></pre>

        <h2 class="section-title">9. Mejores Prácticas</h2>

        <div class="row">
            <div class="col-md-6">
                <div class="card border-success mb-3">
                    <div class="card-header bg-success text-white">✅ Hacer</div>
                    <div class="card-body">
                        <ul>
                            <li>Rotar logs regularmente</li>
                            <li>Establecer alertas automáticas</li>
                            <li>Revisar logs críticos diariamente</li>
                            <li>Usar niveles de log apropiados</li>
                            <li>Centralizar logs si es posible (ELK, Splunk)</li>
                            <li>Añadir contexto útil a los logs</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card border-danger mb-3">
                    <div class="card-header bg-danger text-white">❌ Evitar</div>
                    <div class="card-body">
                        <ul>
                            <li>Dejar logs crecer indefinidamente</li>
                            <li>Ignorar warnings y notices</li>
                            <li>Loggear información sensible</li>
                            <li>Logging excesivo en producción</li>
                            <li>No monitorizar logs críticos</li>
                            <li>Olvidar limpiar logs de desarrollo</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Seguridad:</strong> Nunca loggear información sensible como contraseñas, tokens de API, números de tarjetas de crédito, o datos personales sin encriptar.
        </div>
    </div>
`;

// @ts-nocheck
const monitorizacionRendimiento = `
    <div class="content-section">
        <h1 id="monitorizacion-rendimiento">Monitorización de Rendimiento y Herramientas</h1>
        <p>La monitorización continua del rendimiento es esencial para mantener una tienda PrestaShop 8.9+ rápida y eficiente. Esta sección cubre herramientas, métricas clave y estrategias para identificar y resolver cuellos de botella.</p>

        <h2 class="section-title">1. Herramientas Nativas de PrestaShop</h2>

        <h3>1.1. Symfony Profiler (Debug Toolbar)</h3>
        <p>Herramienta de desarrollo que muestra información detallada sobre cada request.</p>

        <pre><code class="language-php"><?php
// config/defines.inc.php - Activar modo debug
define('_PS_MODE_DEV_', true);

// También en .env (PrestaShop 8+)
APP_ENV=dev
APP_DEBUG=1
</code></pre>

        <div class="alert alert-info">
            <strong>💡 Información del Profiler:</strong>
            <ul class="mb-0">
                <li><strong>Timeline:</strong> Tiempo de ejecución de cada componente</li>
                <li><strong>Database:</strong> Número de queries, tiempo total, queries duplicadas</li>
                <li><strong>Memory:</strong> Uso de memoria RAM</li>
                <li><strong>Cache:</strong> Hits/misses de caché</li>
                <li><strong>Events:</strong> Eventos de Symfony disparados</li>
                <li><strong>Logs:</strong> Logs generados durante el request</li>
            </ul>
        </div>

        <h3>1.2. Panel de Rendimiento del Back Office</h3>

        <pre><code class="language-plaintext">Parámetros Avanzados > Rendimiento
├── Smarty
│   ├── Caché de templates: Activar
│   ├── Compilación: Multi-front + Cache
│   └── Clear cache
├── CCC (Combine, Compress and Cache)
│   ├── Minificar HTML: Sí
│   ├── Minificar CSS: Sí
│   ├── Minificar JS: Sí
│   └── Usar CCC para CSS/JS: Sí
├── Servidores de Medios
│   └── CDN para assets estáticos
└── Caché
    ├── Usar caché: Sí
    └── Limpiar caché de Symfony</code></pre>

        <h2 class="section-title">2. Herramientas de Análisis Web</h2>

        <h3>2.1. Google PageSpeed Insights</h3>

        <table class="table table-bordered">
            <thead class="table-dark">
                <tr>
                    <th width="30%">Métrica</th>
                    <th width="35%">Objetivo</th>
                    <th width="35%">Descripción</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>LCP</strong></td>
                    <td>< 2.5s (bueno)</td>
                    <td>Largest Contentful Paint - Tiempo de carga del contenido principal</td>
                </tr>
                <tr>
                    <td><strong>FID</strong></td>
                    <td>< 100ms (bueno)</td>
                    <td>First Input Delay - Tiempo de respuesta a interacción</td>
                </tr>
                <tr>
                    <td><strong>CLS</strong></td>
                    <td>< 0.1 (bueno)</td>
                    <td>Cumulative Layout Shift - Estabilidad visual</td>
                </tr>
                <tr>
                    <td><strong>FCP</strong></td>
                    <td>< 1.8s (bueno)</td>
                    <td>First Contentful Paint - Primer contenido visible</td>
                </tr>
                <tr>
                    <td><strong>TTI</strong></td>
                    <td>< 3.8s (bueno)</td>
                    <td>Time to Interactive - Tiempo hasta interactividad completa</td>
                </tr>
                <tr>
                    <td><strong>TBT</strong></td>
                    <td>< 200ms (bueno)</td>
                    <td>Total Blocking Time - Tiempo de bloqueo del hilo principal</td>
                </tr>
            </tbody>
        </table>

        <h3>2.2. GTmetrix</h3>

        <pre><code class="language-plaintext">Análisis de GTmetrix
├── Performance Score (0-100)
├── Structure Score (0-100)
├── Web Vitals
│   ├── LCP, CLS, TBT
│   └── Recomendaciones específicas
├── Waterfall
│   ├── Timeline de carga de recursos
│   └── Identificar recursos lentos
└── Recommendations
    ├── Prioridad Alta/Media/Baja
    └── Implementación sugerida</code></pre>

        <h3>2.3. WebPageTest</h3>

        <div class="alert alert-success">
            <strong>✅ Ventajas de WebPageTest:</strong>
            <ul class="mb-0">
                <li>Tests desde múltiples ubicaciones geográficas</li>
                <li>Diferentes dispositivos y navegadores</li>
                <li>Filmstrip de carga visual</li>
                <li>Análisis de seguridad (headers, certificados)</li>
                <li>Comparación de múltiples URLs</li>
            </ul>
        </div>

        <h2 class="section-title">3. Monitorización de Servidor</h2>

        <h3>3.1. Comandos de Sistema</h3>

        <pre><code class="language-bash"># CPU y Memoria
top -b -n 1
htop  # Más visual

# Uso de disco
df -h
du -sh /var/www/prestashop/*

# Procesos de PHP-FPM
ps aux | grep php-fpm
systemctl status php8.1-fpm

# Conexiones MySQL
mysqladmin -u root -p processlist
mysqladmin -u root -p status

# Logs en tiempo real
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
tail -f /var/log/mysql/error.log
tail -f /var/www/prestashop/var/logs/dev.log

# Conexiones de red
netstat -an | grep :80 | wc -l  # HTTP
netstat -an | grep :443 | wc -l  # HTTPS</code></pre>

        <h3>3.2. Monitorización con New Relic</h3>

        <pre><code class="language-ini"># /etc/php/8.1/fpm/conf.d/newrelic.ini
extension=newrelic.so
newrelic.license="TU_LICENSE_KEY"
newrelic.appname="PrestaShop Production"
newrelic.daemon.address="/var/run/newrelic-daemon.sock"
newrelic.framework=no  # PrestaShop no es framework soportado directamente
newrelic.transaction_tracer.enabled=true
newrelic.transaction_tracer.detail=1</code></pre>

        <div class="alert alert-info">
            <strong>📊 Métricas de New Relic:</strong>
            <ul class="mb-0">
                <li>Apdex score (satisfacción del usuario)</li>
                <li>Throughput (requests/minuto)</li>
                <li>Response time promedio</li>
                <li>Error rate</li>
                <li>Transacciones más lentas</li>
                <li>Queries SQL más lentas</li>
            </ul>
        </div>

        <h3>3.3. Monitorización con Datadog</h3>

        <pre><code class="language-yaml"># /etc/datadog-agent/conf.d/php_fpm.d/conf.yaml
init_config:

instances:
  - status_url: http://localhost/php-fpm-status
    ping_url: http://localhost/php-fpm-ping
    use_fastcgi: true
    tags:
      - app:prestashop
      - env:production</code></pre>

        <h2 class="section-title">4. Monitorización de Aplicación</h2>

        <h3>4.1. Servicio de Monitorización Personalizado</h3>

        <pre><code class="language-php"><?php
// modules/mymodule/src/Service/PerformanceMonitorService.php
declare(strict_types=1);

namespace MyModule\\Service;

use Db;

class PerformanceMonitorService
{
    private array $metrics = [];
    private float $startTime;
    private float $startMemory;

    public function __construct()
    {
        $this->startTime = microtime(true);
        $this->startMemory = memory_get_usage(true);
    }

    /**
     * Iniciar medición de un segmento
     */
    public function start(string $segment): void
    {
        $this->metrics[$segment] = [
            'start_time' => microtime(true),
            'start_memory' => memory_get_usage(true),
        ];
    }

    /**
     * Finalizar medición de un segmento
     */
    public function stop(string $segment): array
    {
        if (!isset($this->metrics[$segment])) {
            return [];
        }

        $elapsed = microtime(true) - $this->metrics[$segment]['start_time'];
        $memory = memory_get_usage(true) - $this->metrics[$segment]['start_memory'];

        $this->metrics[$segment]['elapsed'] = $elapsed;
        $this->metrics[$segment]['memory'] = $memory;
        $this->metrics[$segment]['memory_human'] = $this->formatBytes($memory);

        return $this->metrics[$segment];
    }

    /**
     * Obtener métricas de BD
     */
    public function getDatabaseMetrics(): array
    {
        $db = Db::getInstance();
        
        return [
            'total_queries' => $db->getNumberOfQueries(),
            'query_time' => round($db->getQueryTime(), 4),
            'slow_queries' => $this->getSlowQueries(),
        ];
    }

    /**
     * Obtener queries lentas
     */
    private function getSlowQueries(): array
    {
        $db = Db::getInstance();
        $queries = $db->queries ?? [];
        $slowQueries = [];

        foreach ($queries as $query) {
            if (isset($query['time']) && $query['time'] > 0.1) { // > 100ms
                $slowQueries[] = [
                    'query' => substr($query['query'], 0, 200),
                    'time' => round($query['time'], 4),
                ];
            }
        }

        return $slowQueries;
    }

    /**
     * Obtener métricas globales
     */
    public function getGlobalMetrics(): array
    {
        return [
            'total_time' => round(microtime(true) - $this->startTime, 4),
            'total_memory' => $this->formatBytes(memory_get_usage(true) - $this->startMemory),
            'peak_memory' => $this->formatBytes(memory_get_peak_usage(true)),
            'server_load' => sys_getloadavg(),
            'timestamp' => date('Y-m-d H:i:s'),
        ];
    }

    /**
     * Registrar métricas en log
     */
    public function logMetrics(string $context = 'general'): void
    {
        $metrics = [
            'context' => $context,
            'global' => $this->getGlobalMetrics(),
            'database' => $this->getDatabaseMetrics(),
            'segments' => $this->metrics,
        ];

        $logFile = _PS_ROOT_DIR_ . '/var/logs/performance.log';
        $logEntry = date('Y-m-d H:i:s') . ' | ' . json_encode($metrics) . PHP_EOL;

        file_put_contents($logFile, $logEntry, FILE_APPEND);
    }

    /**
     * Formatear bytes a formato legible
     */
    private function formatBytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= (1 << (10 * $pow));

        return round($bytes, 2) . ' ' . $units[$pow];
    }

    /**
     * Enviar alertas si se exceden umbrales
     */
    public function checkThresholds(): array
    {
        $alerts = [];
        $metrics = $this->getGlobalMetrics();
        $dbMetrics = $this->getDatabaseMetrics();

        // Tiempo de respuesta > 3 segundos
        if ($metrics['total_time'] > 3.0) {
            $alerts[] = [
                'type' => 'slow_response',
                'message' => 'Response time exceeded 3s: ' . $metrics['total_time'] . 's',
                'severity' => 'warning',
            ];
        }

        // Memoria > 128MB
        if (memory_get_usage(true) > 128 * 1024 * 1024) {
            $alerts[] = [
                'type' => 'high_memory',
                'message' => 'Memory usage exceeded 128MB: ' . $metrics['peak_memory'],
                'severity' => 'warning',
            ];
        }

        // Más de 50 queries
        if ($dbMetrics['total_queries'] > 50) {
            $alerts[] = [
                'type' => 'too_many_queries',
                'message' => 'Too many database queries: ' . $dbMetrics['total_queries'],
                'severity' => 'info',
            ];
        }

        return $alerts;
    }
}
</code></pre>

        <h3>4.2. Middleware de Monitorización</h3>

        <pre><code class="language-php"><?php
// modules/mymodule/src/Middleware/PerformanceMiddleware.php
declare(strict_types=1);

namespace MyModule\\Middleware;

use MyModule\\Service\\PerformanceMonitorService;

class PerformanceMiddleware
{
    private PerformanceMonitorService $monitor;

    public function __construct(PerformanceMonitorService $monitor)
    {
        $this->monitor = $monitor;
    }

    /**
     * Registrar antes del controller
     */
    public function before(): void
    {
        $this->monitor->start('controller');
    }

    /**
     * Registrar después del controller
     */
    public function after(): void
    {
        $this->monitor->stop('controller');
        
        // Verificar umbrales
        $alerts = $this->monitor->checkThresholds();
        
        // Registrar si hay alertas
        if (!empty($alerts)) {
            $this->monitor->logMetrics('performance_alert');
            
            // Enviar notificación si es crítico
            foreach ($alerts as $alert) {
                if ($alert['severity'] === 'critical') {
                    $this->sendAlert($alert);
                }
            }
        }
    }

    private function sendAlert(array $alert): void
    {
        // Implementar notificación (email, Slack, etc.)
        error_log('[PERFORMANCE ALERT] ' . $alert['message']);
    }
}
</code></pre>

        <h2 class="section-title">5. Métricas Clave a Monitorizar</h2>

        <h3>5.1. Backend (Servidor)</h3>

        <table class="table table-striped">
            <thead class="table-dark">
                <tr>
                    <th>Métrica</th>
                    <th>Valor Óptimo</th>
                    <th>Comando/Herramienta</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>CPU Load</strong></td>
                    <td>< 70%</td>
                    <td><code>top</code>, <code>htop</code></td>
                </tr>
                <tr>
                    <td><strong>Memoria RAM</strong></td>
                    <td>< 80%</td>
                    <td><code>free -h</code></td>
                </tr>
                <tr>
                    <td><strong>Disco I/O</strong></td>
                    <td>< 80%</td>
                    <td><code>iostat</code></td>
                </tr>
                <tr>
                    <td><strong>PHP-FPM Pools</strong></td>
                    <td>No saturados</td>
                    <td><code>systemctl status php-fpm</code></td>
                </tr>
                <tr>
                    <td><strong>MySQL Connections</strong></td>
                    <td>< max_connections</td>
                    <td><code>SHOW STATUS LIKE 'Threads_connected'</code></td>
                </tr>
            </tbody>
        </table>

        <h3>5.2. Aplicación (PrestaShop)</h3>

        <table class="table table-striped">
            <thead class="table-dark">
                <tr>
                    <th>Métrica</th>
                    <th>Valor Óptimo</th>
                    <th>Dónde Ver</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>TTFB</strong></td>
                    <td>< 600ms</td>
                    <td>DevTools > Network</td>
                </tr>
                <tr>
                    <td><strong>Page Load Time</strong></td>
                    <td>< 3s</td>
                    <td>PageSpeed Insights</td>
                </tr>
                <tr>
                    <td><strong>Database Queries</strong></td>
                    <td>< 50 por página</td>
                    <td>Symfony Profiler</td>
                </tr>
                <tr>
                    <td><strong>Memory Usage</strong></td>
                    <td>< 128MB por request</td>
                    <td>Symfony Profiler</td>
                </tr>
                <tr>
                    <td><strong>Cache Hit Rate</strong></td>
                    <td>> 90%</td>
                    <td>Redis/Memcached stats</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">6. Dashboard de Monitorización</h2>

        <h3>6.1. Grafana + Prometheus</h3>

        <pre><code class="language-yaml"># prometheus.yml
scrape_configs:
  - job_name: 'prestashop'
    static_configs:
      - targets: ['localhost:9090']
    
  - job_name: 'mysql'
    static_configs:
      - targets: ['localhost:9104']
    
  - job_name: 'nginx'
    static_configs:
      - targets: ['localhost:9113']
    
  - job_name: 'php-fpm'
    static_configs:
      - targets: ['localhost:9253']</code></pre>

        <h3>6.2. Elasticsearch + Kibana para Logs</h3>

        <pre><code class="language-json">{
  "index_patterns": ["prestashop-*"],
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 1
  },
  "mappings": {
    "properties": {
      "@timestamp": { "type": "date" },
      "level": { "type": "keyword" },
      "message": { "type": "text" },
      "context": { "type": "object" },
      "extra": { "type": "object" }
    }
  }
}</code></pre>

        <h2 class="section-title">7. Alertas Automatizadas</h2>

        <h3>7.1. Script de Monitorización con Alertas</h3>

        <pre><code class="language-bash">#!/bin/bash
# monitor_prestashop.sh

SITE_URL="https://mitienda.com"
ALERT_EMAIL="admin@mitienda.com"
THRESHOLD_RESPONSE_TIME=3  # segundos

# Verificar tiempo de respuesta
response_time=$(curl -o /dev/null -s -w '%{time_total}' $SITE_URL)

if (( $(echo "$response_time > $THRESHOLD_RESPONSE_TIME" | bc -l) )); then
    echo "Alert: Slow response time $response_time seconds" | \
        mail -s "PrestaShop Performance Alert" $ALERT_EMAIL
fi

# Verificar disponibilidad
status_code=$(curl -o /dev/null -s -w '%{http_code}' $SITE_URL)

if [ "$status_code" != "200" ]; then
    echo "Alert: Site returned status code $status_code" | \
        mail -s "PrestaShop Availability Alert" $ALERT_EMAIL
fi

# Verificar uso de disco
disk_usage=$(df -h / | tail -1 | awk '{print $5}' | sed 's/%//')

if [ "$disk_usage" -gt 80 ]; then
    echo "Alert: Disk usage at \${disk_usage}%\" | \
        mail -s "PrestaShop Disk Alert" $ALERT_EMAIL
fi</code></pre>

        <h2 class="section-title">8. Mejores Prácticas</h2>

        <div class="row">
            <div class="col-md-6">
                <div class="card border-success mb-3">
                    <div class="card-header bg-success text-white">✅ Hacer</div>
                    <div class="card-body">
                        <ul>
                            <li>Monitorizar 24/7 en producción</li>
                            <li>Establecer baselines de rendimiento</li>
                            <li>Configurar alertas automáticas</li>
                            <li>Revisar logs regularmente</li>
                            <li>Usar herramientas APM (New Relic, Datadog)</li>
                            <li>Hacer pruebas de carga periódicas</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card border-danger mb-3">
                    <div class="card-header bg-danger text-white">❌ Evitar</div>
                    <div class="card-body">
                        <ul>
                            <li>Ignorar alertas de rendimiento</li>
                            <li>No tener monitoring en producción</li>
                            <li>Depender solo de herramientas externas</li>
                            <li>No revisar slow query log</li>
                            <li>Asumir que todo está bien sin datos</li>
                            <li>No documentar problemas recurrentes</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <div class="alert alert-info">
            <strong>🎯 Checklist de Monitorización:</strong>
            <ul class="mb-0">
                <li>✅ Servidor monitorizadocon Prometheus/Datadog</li>
                <li>✅ Logs centralizados con ELK Stack</li>
                <li>✅ Alertas configuradas (email/Slack)</li>
                <li>✅ Dashboard con métricas clave</li>
                <li>✅ Tests de rendimiento automatizados</li>
                <li>✅ Revisión semanal de métricas</li>
            </ul>
        </div>
    </div>
`;

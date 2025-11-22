// @ts-nocheck
const monitorizacionContenedoresPrestashop = `
    <div class="content-section">
        <h1 id="monitorizacion-contenedores-prestashop">Monitorización de Contenedores (Prometheus, Grafana)</h1>
        <p>Sistema completo de monitorización y observabilidad para tiendas PrestaShop 8.9+ en contenedores Docker usando Prometheus y Grafana.</p>

        <h2 class="section-title">1. Stack Completo de Monitorización</h2>

        <pre><code class="language-yaml"># docker-compose.monitoring.yml
version: '3.8'

services:
  # Aplicación PrestaShop
  prestashop:
    image: prestashop:8.9
    environment:
      - DB_SERVER=mysql
      - REDIS_HOST=redis
    volumes:
      - prestashop-data:/var/www/html
    networks:
      - app
      - monitoring
    labels:
      - "prometheus.scrape=true"
      - "prometheus.port=9253"
  
  # MySQL
  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD_FILE=/run/secrets/mysql_root
      - MYSQL_DATABASE=prestashop
    secrets:
      - mysql_root
    volumes:
      - mysql-data:/var/lib/mysql
    networks:
      - app
      - monitoring
  
  # MySQL Exporter
  mysql-exporter:
    image: prom/mysqld-exporter:latest
    command:
      - "--mysqld.address=mysql:3306"
      - "--mysqld.username=exporter"
    environment:
      - DATA_SOURCE_NAME=exporter:exporterpass@(mysql:3306)/
    networks:
      - monitoring
    depends_on:
      - mysql
  
  # Redis
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data
    networks:
      - app
      - monitoring
  
  # Redis Exporter
  redis-exporter:
    image: oliver006/redis_exporter:latest
    environment:
      - REDIS_ADDR=redis:6379
    networks:
      - monitoring
    depends_on:
      - redis
  
  # cAdvisor - métricas de contenedores
  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    container_name: cadvisor
    privileged: true
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
      - /dev/disk/:/dev/disk:ro
    ports:
      - "8082:8080"
    networks:
      - monitoring
  
  # Node Exporter - métricas del host
  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    command:
      - '--path.rootfs=/host'
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    volumes:
      - /:/host:ro,rslave
    ports:
      - "9100:9100"
    networks:
      - monitoring
  
  # Prometheus
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'
      - '--web.console.libraries=/usr/share/prometheus/console_libraries'
      - '--web.console.templates=/usr/share/prometheus/consoles'
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - ./prometheus/alerts.yml:/etc/prometheus/alerts.yml:ro
      - prometheus-data:/prometheus
    networks:
      - monitoring
    depends_on:
      - cadvisor
      - node-exporter
  
  # Alertmanager
  alertmanager:
    image: prom/alertmanager:latest
    container_name: alertmanager
    ports:
      - "9093:9093"
    volumes:
      - ./alertmanager/alertmanager.yml:/etc/alertmanager/alertmanager.yml:ro
      - alertmanager-data:/alertmanager
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
      - '--storage.path=/alertmanager'
    networks:
      - monitoring
  
  # Grafana
  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=\${GRAFANA_PASSWORD}
      - GF_INSTALL_PLUGINS=grafana-piechart-panel,grafana-worldmap-panel
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana-data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning:ro
      - ./grafana/dashboards:/var/lib/grafana/dashboards:ro
    networks:
      - monitoring
    depends_on:
      - prometheus
  
  # Loki - logs
  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    command: -config.file=/etc/loki/loki-config.yml
    volumes:
      - ./loki/loki-config.yml:/etc/loki/loki-config.yml:ro
      - loki-data:/loki
    networks:
      - monitoring
  
  # Promtail - recolector de logs
  promtail:
    image: grafana/promtail:latest
    volumes:
      - /var/log:/var/log:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./promtail/promtail-config.yml:/etc/promtail/config.yml:ro
    command: -config.file=/etc/promtail/config.yml
    networks:
      - monitoring
    depends_on:
      - loki

networks:
  app:
  monitoring:

volumes:
  prestashop-data:
  mysql-data:
  redis-data:
  prometheus-data:
  alertmanager-data:
  grafana-data:
  loki-data:

secrets:
  mysql_root:
    file: ./secrets/mysql_root_password.txt
</code></pre>

        <h2 class="section-title">2. Configuración Prometheus</h2>

        <pre><code class="language-yaml"># prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'prestashop-prod'
    environment: 'production'

# Alertmanager
alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']

# Rules
rule_files:
  - '/etc/prometheus/alerts.yml'

# Scrape configs
scrape_configs:
  # Prometheus self
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
  
  # cAdvisor - contenedores
  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']
    relabel_configs:
      - source_labels: [__address__]
        target_label: instance
        replacement: 'docker-host'
  
  # Node Exporter - host
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
  
  # MySQL
  - job_name: 'mysql'
    static_configs:
      - targets: ['mysql-exporter:9104']
  
  # Redis
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
  
  # PrestaShop (custom metrics)
  - job_name: 'prestashop'
    static_configs:
      - targets: ['prestashop:9253']
    metrics_path: '/metrics.php'
</code></pre>

        <h2 class="section-title">3. Alertas Prometheus</h2>

        <pre><code class="language-yaml"># prometheus/alerts.yml
groups:
  - name: prestashop_alerts
    interval: 30s
    rules:
      # Container down
      - alert: ContainerDown
        expr: absent(up{job="cadvisor"})
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Container {{ \$labels.container }} is down"
          description: "Container has been down for more than 1 minute"
      
      # High CPU
      - alert: HighCPU
        expr: rate(container_cpu_usage_seconds_total{name=~"prestashop.*"}[5m]) * 100 > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage on {{ \$labels.name }}"
          description: "CPU usage is {{ \$value }}%"
      
      # High Memory
      - alert: HighMemory
        expr: (container_memory_usage_bytes{name=~"prestashop.*"} / container_spec_memory_limit_bytes{name=~"prestashop.*"}) * 100 > 90
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High memory usage on {{ \$labels.name }}"
          description: "Memory usage is {{ \$value }}%"
      
      # MySQL down
      - alert: MySQLDown
        expr: mysql_up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "MySQL is down"
      
      # MySQL slow queries
      - alert: MySQLSlowQueries
        expr: rate(mysql_global_status_slow_queries[5m]) > 10
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High number of slow queries"
          description: "{{ \$value }} slow queries per second"
      
      # Redis down
      - alert: RedisDown
        expr: redis_up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Redis is down"
      
      # Disk space
      - alert: DiskSpaceLow
        expr: (node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"}) * 100 < 10
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Disk space low"
          description: "Only {{ \$value }}% remaining"
      
      # High response time
      - alert: HighResponseTime
        expr: prestashop_response_time_seconds > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time"
          description: "Response time is {{ \$value }}s"
</code></pre>

        <h2 class="section-title">4. Alertmanager Config</h2>

        <pre><code class="language-yaml"># alertmanager/alertmanager.yml
global:
  resolve_timeout: 5m
  slack_api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'

# Routes
route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: 'slack-notifications'
  
  routes:
    # Critical alerts
    - match:
        severity: critical
      receiver: 'slack-critical'
      continue: true
    
    # Warning alerts
    - match:
        severity: warning
      receiver: 'slack-warnings'

# Receivers
receivers:
  - name: 'slack-notifications'
    slack_configs:
      - channel: '#monitoring'
        title: 'PrestaShop Alert'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
        send_resolved: true
  
  - name: 'slack-critical'
    slack_configs:
      - channel: '#critical-alerts'
        title: '🚨 CRITICAL: {{ .CommonLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
        send_resolved: true
  
  - name: 'slack-warnings'
    slack_configs:
      - channel: '#warnings'
        title: '⚠️ Warning: {{ .CommonLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'

# Inhibition rules
inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'cluster']
</code></pre>

        <h2 class="section-title">5. Métricas Custom en PrestaShop</h2>

        <pre><code class="language-php"><?php
// modules/monitoring/monitoring.php
class Monitoring extends Module
{
    private $redis;
    
    public function __construct()
    {
        $this->name = 'monitoring';
        $this->tab = 'administration';
        $this->version = '1.0.0';
        parent::__construct();
        
        $this->redis = new Redis();
        $this->redis->connect('redis', 6379);
    }
    
    public function install()
    {
        return parent::install()
            && $this->registerHook('actionFrontControllerSetMedia')
            && $this->registerHook('actionOrderStatusPostUpdate');
    }
    
    // Métricas de performance
    public function hookActionFrontControllerSetMedia($params)
    {
        $start = microtime(true);
        register_shutdown_function(function() use ($start) {
            $duration = microtime(true) - $start;
            $this->recordMetric('response_time', $duration);
        });
    }
    
    // Métricas de negocio
    public function hookActionOrderStatusPostUpdate($params)
    {
        if ($params['newOrderStatus']->id == Configuration::get('PS_OS_PAYMENT')) {
            $this->recordMetric('orders_completed', 1, 'counter');
            $this->recordMetric('revenue', $params['cart']->getOrderTotal(), 'gauge');
        }
    }
    
    private function recordMetric($name, $value, $type = 'gauge')
    {
        $key = "metrics:{$name}";
        
        if ($type === 'counter') {
            $this->redis->incrByFloat($key, $value);
        } else {
            $this->redis->set($key, $value);
        }
        
        $this->redis->expire($key, 300); // 5 minutos
    }
}

// metrics.php - endpoint Prometheus
<?php
require_once('config/config.inc.php');

header('Content-Type: text/plain; version=0.0.4');

$redis = new Redis();
$redis->connect('redis', 6379);

$metrics = [
    'prestashop_response_time_seconds' => 'gauge',
    'prestashop_orders_completed_total' => 'counter',
    'prestashop_revenue_total' => 'gauge',
    'prestashop_active_customers' => 'gauge',
    'prestashop_cart_total' => 'gauge',
];

foreach ($metrics as $name => $type) {
    $value = $redis->get("metrics:" . str_replace('prestashop_', '', $name));
    if ($value !== false) {
        echo "# TYPE {$name} {$type}\n";
        echo "{$name} {$value}\n";
    }
}

// Métricas de sistema
$db = Db::getInstance();

// Active customers
$activeCustomers = $db->getValue('SELECT COUNT(*) FROM ' . _DB_PREFIX_ . 'customer WHERE active = 1');
echo "# TYPE prestashop_active_customers gauge\n";
echo "prestashop_active_customers {$activeCustomers}\n";

// Active carts
$activeCarts = $db->getValue('SELECT COUNT(*) FROM ' . _DB_PREFIX_ . 'cart WHERE date_add > DATE_SUB(NOW(), INTERVAL 1 HOUR)');
echo "# TYPE prestashop_active_carts gauge\n";
echo "prestashop_active_carts {$activeCarts}\n";

// Product count
$products = $db->getValue('SELECT COUNT(*) FROM ' . _DB_PREFIX_ . 'product WHERE active = 1');
echo "# TYPE prestashop_products_total gauge\n";
echo "prestashop_products_total {$products}\n";
</code></pre>

        <h2 class="section-title">6. Grafana Datasources</h2>

        <pre><code class="language-yaml"># grafana/provisioning/datasources/datasources.yml
apiVersion: 1

datasources:
  # Prometheus
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: false
    jsonData:
      timeInterval: "15s"
  
  # Loki (logs)
  - name: Loki
    type: loki
    access: proxy
    url: http://loki:3100
    editable: false
</code></pre>

        <h2 class="section-title">7. Dashboard Grafana PrestaShop</h2>

        <pre><code class="language-json">// grafana/dashboards/prestashop-overview.json
{
  "dashboard": {
    "title": "PrestaShop Overview",
    "tags": ["prestashop", "ecommerce"],
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "CPU Usage",
        "type": "graph",
        "targets": [{
          "expr": "rate(container_cpu_usage_seconds_total{name=~\\"prestashop.*\\"}[5m]) * 100",
          "legendFormat": "{{ name }}"
        }],
        "yaxes": [{"format": "percent"}]
      },
      {
        "id": 2,
        "title": "Memory Usage",
        "type": "graph",
        "targets": [{
          "expr": "container_memory_usage_bytes{name=~\\"prestashop.*\\"} / 1024 / 1024",
          "legendFormat": "{{ name }}"
        }],
        "yaxes": [{"format": "decmbytes"}]
      },
      {
        "id": 3,
        "title": "Response Time",
        "type": "graph",
        "targets": [{
          "expr": "prestashop_response_time_seconds",
          "legendFormat": "Response Time"
        }],
        "yaxes": [{"format": "s"}]
      },
      {
        "id": 4,
        "title": "Orders Today",
        "type": "singlestat",
        "targets": [{
          "expr": "increase(prestashop_orders_completed_total[24h])"
        }]
      },
      {
        "id": 5,
        "title": "Revenue Today",
        "type": "singlestat",
        "targets": [{
          "expr": "prestashop_revenue_total"
        }],
        "format": "currencyUSD"
      },
      {
        "id": 6,
        "title": "Active Customers",
        "type": "stat",
        "targets": [{
          "expr": "prestashop_active_customers"
        }]
      },
      {
        "id": 7,
        "title": "MySQL Queries/s",
        "type": "graph",
        "targets": [{
          "expr": "rate(mysql_global_status_queries[5m])",
          "legendFormat": "Queries"
        }]
      },
      {
        "id": 8,
        "title": "Redis Memory",
        "type": "graph",
        "targets": [{
          "expr": "redis_memory_used_bytes / 1024 / 1024",
          "legendFormat": "Used Memory"
        }],
        "yaxes": [{"format": "decmbytes"}]
      }
    ]
  }
}
</code></pre>

        <h2 class="section-title">8. Queries PromQL Útiles</h2>

        <pre><code class="language-promql"># CPU por contenedor
rate(container_cpu_usage_seconds_total{name=~"prestashop.*"}[5m]) * 100

# Memory usage
container_memory_usage_bytes{name=~"prestashop.*"} / 1024 / 1024

# Network I/O
rate(container_network_receive_bytes_total{name=~"prestashop.*"}[5m])
rate(container_network_transmit_bytes_total{name=~"prestashop.*"}[5m])

# Container restarts
increase(container_start_time_seconds{name=~"prestashop.*"}[1h])

# MySQL connections
mysql_global_status_threads_connected

# MySQL slow queries
rate(mysql_global_status_slow_queries[5m])

# Redis hits/misses
rate(redis_keyspace_hits_total[5m])
rate(redis_keyspace_misses_total[5m])

# Top 5 containers por CPU
topk(5, rate(container_cpu_usage_seconds_total[5m]))

# Disk I/O
rate(container_fs_reads_bytes_total{name=~"prestashop.*"}[5m])
rate(container_fs_writes_bytes_total{name=~"prestashop.*"}[5m])
</code></pre>

        <h2 class="section-title">9. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Monitorización:</strong>
            <ul class="mb-0">
                <li>Métricas de infraestructura (CPU, RAM, disco, red)</li>
                <li>Métricas de aplicación (response time, errors)</li>
                <li>Métricas de negocio (orders, revenue)</li>
                <li>Logs centralizados (Loki)</li>
                <li>Alertas configuradas (Slack, email)</li>
                <li>Dashboards visuales (Grafana)</li>
                <li>Retención apropiada (30 días)</li>
                <li>Health checks en servicios</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>📊 Métricas Clave PrestaShop:</strong>
            <ul class="mb-0">
                <li><strong>Performance:</strong> Response time, throughput</li>
                <li><strong>Disponibilidad:</strong> Uptime, error rate</li>
                <li><strong>Negocio:</strong> Orders, revenue, conversión</li>
                <li><strong>Recursos:</strong> CPU, RAM, disco, red</li>
                <li><strong>Base de datos:</strong> Queries/s, slow queries</li>
                <li><strong>Cache:</strong> Hit rate, memory usage</li>
            </ul>
        </div>
    </div>
`;

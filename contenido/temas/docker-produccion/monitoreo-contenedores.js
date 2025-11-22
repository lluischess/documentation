// @ts-nocheck
const monitoreoContenedores = `
    <div class="content-section">
        <h1 id="monitoreo-contenedores">Monitoreo de Contenedores</h1>
        <p>Implementación de soluciones de monitoreo y observabilidad para contenedores Docker en producción con PrestaShop 8.9+.</p>

        <h2 class="section-title">1. Docker Stats</h2>

        <pre><code class="language-bash"># Stats en tiempo real
docker stats

# Formato personalizado
docker stats --format "table {{.Container}}\\t{{.CPUPerc}}\\t{{.MemUsage}}"

# Sin stream (una vez)
docker stats --no-stream

# Contenedor específico
docker stats prestashop

# Compose
docker compose stats
</code></pre>

        <h2 class="section-title">2. Prometheus + Grafana</h2>

        <h3>2.1. Docker Compose Stack</h3>

        <pre><code class="language-yaml"># docker-compose.monitoring.yml
version: '3.8'

services:
  # PrestaShop con exportador
  prestashop:
    image: prestashop:8.9
    ports:
      - "8080:80"
  
  # cAdvisor - métricas de contenedores
  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    ports:
      - "8081:8080"
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
    privileged: true
  
  # Node Exporter - métricas del host
  node-exporter:
    image: prom/node-exporter:latest
    ports:
      - "9100:9100"
    command:
      - '--path.rootfs=/host'
    volumes:
      - /:/host:ro,rslave
  
  # Prometheus
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=15d'
  
  # Grafana
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
      - GF_INSTALL_PLUGINS=grafana-piechart-panel
    volumes:
      - grafana-data:/var/lib/grafana
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards:ro
      - ./grafana/datasources:/etc/grafana/provisioning/datasources:ro

volumes:
  prometheus-data:
  grafana-data:
</code></pre>

        <h3>2.2. Prometheus Config</h3>

        <pre><code class="language-yaml"># prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  # cAdvisor - contenedores
  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']
  
  # Node Exporter - host
  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']
  
  # Prometheus self
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

# Alertas
alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']

rule_files:
  - 'alerts.yml'
</code></pre>

        <h3>2.3. Grafana Datasource</h3>

        <pre><code class="language-yaml"># grafana/datasources/prometheus.yml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: false
</code></pre>

        <h2 class="section-title">3. Métricas Importantes</h2>

        <h3>3.1. PromQL Queries</h3>

        <pre><code class="language-promql"># CPU Usage por contenedor
rate(container_cpu_usage_seconds_total[5m]) * 100

# Memory Usage
container_memory_usage_bytes / container_spec_memory_limit_bytes * 100

# Network I/O
rate(container_network_receive_bytes_total[5m])
rate(container_network_transmit_bytes_total[5m])

# Disk I/O
rate(container_fs_reads_bytes_total[5m])
rate(container_fs_writes_bytes_total[5m])

# Container restart count
increase(container_start_time_seconds[1h])

# Container up/down
container_last_seen

# Top containers por CPU
topk(5, rate(container_cpu_usage_seconds_total[5m]))
</code></pre>

        <h2 class="section-title">4. Alertmanager</h2>

        <pre><code class="language-yaml"># alerts.yml
groups:
  - name: containers
    interval: 30s
    rules:
      # High CPU
      - alert: ContainerHighCPU
        expr: rate(container_cpu_usage_seconds_total[5m]) * 100 > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Container {{ \$labels.name }} high CPU"
          description: "CPU usage is {{ \$value }}%"
      
      # High Memory
      - alert: ContainerHighMemory
        expr: (container_memory_usage_bytes / container_spec_memory_limit_bytes * 100) > 90
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Container {{ \$labels.name }} high memory"
      
      # Container Down
      - alert: ContainerDown
        expr: absent(container_last_seen{name="prestashop"})
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Container prestashop is down"
</code></pre>

        <pre><code class="language-yaml"># alertmanager.yml
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname', 'cluster']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: 'slack'

receivers:
  - name: 'slack'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/XXX'
        channel: '#alerts'
        title: 'Docker Alert'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
</code></pre>

        <h2 class="section-title">5. ELK Stack (Elasticsearch, Logstash, Kibana)</h2>

        <pre><code class="language-yaml">services:
  elasticsearch:
    image: elasticsearch:8.10.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - elastic-data:/usr/share/elasticsearch/data
  
  logstash:
    image: logstash:8.10.0
    ports:
      - "5000:5000"
    volumes:
      - ./logstash/logstash.conf:/usr/share/logstash/pipeline/logstash.conf:ro
    depends_on:
      - elasticsearch
  
  kibana:
    image: kibana:8.10.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch
  
  # Metricbeat - envía métricas a Elastic
  metricbeat:
    image: elastic/metricbeat:8.10.0
    user: root
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./metricbeat/metricbeat.yml:/usr/share/metricbeat/metricbeat.yml:ro
    command: metricbeat -e -strict.perms=false
    depends_on:
      - elasticsearch
</code></pre>

        <h2 class="section-title">6. Docker Health Checks</h2>

        <pre><code class="language-yaml">services:
  prestashop:
    image: prestashop:8.9
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 40s
  
  mysql:
    image: mysql:8.0
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
</code></pre>

        <pre><code class="language-bash"># Verificar health
docker inspect --format='{{json .State.Health}}' prestashop | jq

# Solo contenedores healthy
docker ps --filter health=healthy

# Unhealthy
docker ps --filter health=unhealthy
</code></pre>

        <h2 class="section-title">7. Datadog</h2>

        <pre><code class="language-yaml">services:
  datadog:
    image: datadog/agent:latest
    environment:
      - DD_API_KEY=\${DATADOG_API_KEY}
      - DD_SITE=datadoghq.com
      - DD_LOGS_ENABLED=true
      - DD_LOGS_CONFIG_CONTAINER_COLLECT_ALL=true
      - DD_CONTAINER_EXCLUDE="name:datadog-agent"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - /proc/:/host/proc/:ro
      - /sys/fs/cgroup/:/host/sys/fs/cgroup:ro
</code></pre>

        <h2 class="section-title">8. Portainer</h2>

        <pre><code class="language-yaml">services:
  portainer:
    image: portainer/portainer-ce:latest
    ports:
      - "9443:9443"
      - "8000:8000"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - portainer-data:/data
    restart: unless-stopped

volumes:
  portainer-data:
</code></pre>

        <h2 class="section-title">9. Dashboard Grafana Ejemplo</h2>

        <pre><code class="language-json">// dashboard-docker.json
{
  "dashboard": {
    "title": "Docker Monitoring",
    "panels": [
      {
        "title": "CPU Usage",
        "targets": [{
          "expr": "rate(container_cpu_usage_seconds_total{name=~\\"prestashop.*\\"}[5m]) * 100"
        }]
      },
      {
        "title": "Memory Usage",
        "targets": [{
          "expr": "container_memory_usage_bytes{name=~\\"prestashop.*\\"} / 1024 / 1024"
        }]
      },
      {
        "title": "Network I/O",
        "targets": [
          {
            "expr": "rate(container_network_receive_bytes_total{name=~\\"prestashop.*\\"}[5m])",
            "legendFormat": "Received"
          },
          {
            "expr": "rate(container_network_transmit_bytes_total{name=~\\"prestashop.*\\"}[5m])",
            "legendFormat": "Transmitted"
          }
        ]
      }
    ]
  }
}
</code></pre>

        <h2 class="section-title">10. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Monitoreo:</strong>
            <ul class="mb-0">
                <li>Métricas de CPU, RAM, red, disco</li>
                <li>Healthchecks en todos los servicios</li>
                <li>Alertas configuradas (Slack, email)</li>
                <li>Dashboards visuales (Grafana)</li>
                <li>Retención de métricas (15-30 días)</li>
                <li>Monitoreo del host también</li>
                <li>Logs centralizados</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>📊 Stack Recomendado:</strong>
            <ul class="mb-0">
                <li><strong>Básico:</strong> docker stats + healthchecks</li>
                <li><strong>Intermedio:</strong> Prometheus + Grafana</li>
                <li><strong>Avanzado:</strong> ELK Stack o Datadog</li>
                <li><strong>All-in-one:</strong> Portainer</li>
            </ul>
        </div>
    </div>
`;

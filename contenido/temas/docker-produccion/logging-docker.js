// @ts-nocheck
const loggingDocker = `
    <div class="content-section">
        <h1 id="logging-docker">Logging en Docker</h1>
        <p>Gestión centralizada de logs y estrategias de logging para contenedores Docker en producción con PrestaShop 8.9+.</p>

        <h2 class="section-title">1. Logging Drivers</h2>

        <pre><code class="language-bash"># Ver driver por defecto
docker info --format '{{.LoggingDriver}}'

# json-file (default), syslog, journald, gelf, fluentd, awslogs, splunk, etc.
</code></pre>

        <h3>1.1. JSON File (Default)</h3>

        <pre><code class="language-yaml">services:
  prestashop:
    image: prestashop:8.9
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
        labels: "production,prestashop"
        compress: "true"
</code></pre>

        <h3>1.2. Syslog</h3>

        <pre><code class="language-yaml">services:
  prestashop:
    logging:
      driver: syslog
      options:
        syslog-address: "tcp://192.168.0.42:514"
        syslog-facility: "daemon"
        tag: "{{.Name}}/{{.ID}}"
</code></pre>

        <h2 class="section-title">2. Ver Logs</h2>

        <pre><code class="language-bash"># Ver logs de contenedor
docker logs prestashop

# Follow (tiempo real)
docker logs -f prestashop

# Últimas N líneas
docker logs --tail 100 prestashop

# Con timestamps
docker logs -t prestashop

# Desde/hasta
docker logs --since 1h prestashop
docker logs --since "2024-01-01T10:00:00" prestashop
docker logs --until "2024-01-01T12:00:00" prestashop

# Compose
docker compose logs -f prestashop
docker compose logs --tail=50 prestashop mysql
</code></pre>

        <h2 class="section-title">3. ELK Stack para Logs</h2>

        <h3>3.1. Docker Compose ELK</h3>

        <pre><code class="language-yaml">version: '3.8'

services:
  # Elasticsearch
  elasticsearch:
    image: elasticsearch:8.10.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms1g -Xmx1g"
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - elastic-data:/usr/share/elasticsearch/data
  
  # Logstash
  logstash:
    image: logstash:8.10.0
    ports:
      - "5000:5000/tcp"
      - "5000:5000/udp"
      - "9600:9600"
    volumes:
      - ./logstash/logstash.conf:/usr/share/logstash/pipeline/logstash.conf:ro
    depends_on:
      - elasticsearch
  
  # Kibana
  kibana:
    image: kibana:8.10.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch
  
  # Filebeat - recolecta logs
  filebeat:
    image: elastic/filebeat:8.10.0
    user: root
    volumes:
      - ./filebeat/filebeat.yml:/usr/share/filebeat/filebeat.yml:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
    command: filebeat -e -strict.perms=false
    depends_on:
      - elasticsearch
  
  # PrestaShop con logging a logstash
  prestashop:
    image: prestashop:8.9
    logging:
      driver: gelf
      options:
        gelf-address: "udp://logstash:5000"
        tag: "prestashop"

volumes:
  elastic-data:
</code></pre>

        <h3>3.2. Logstash Config</h3>

        <pre><code class="language-ruby"># logstash/logstash.conf
input {
  gelf {
    port => 5000
  }
  
  beats {
    port => 5044
  }
}

filter {
  # Parse JSON logs
  if [message] =~ /^{.*}$/ {
    json {
      source => "message"
    }
  }
  
  # Añadir geoip
  if [client_ip] {
    geoip {
      source => "client_ip"
    }
  }
  
  # Parse nginx access logs
  if [tag] == "nginx" {
    grok {
      match => { "message" => "%{COMBINEDAPACHELOG}" }
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "docker-logs-%{+YYYY.MM.dd}"
  }
  
  # Debug
  stdout {
    codec => rubydebug
  }
}
</code></pre>

        <h3>3.3. Filebeat Config</h3>

        <pre><code class="language-yaml"># filebeat/filebeat.yml
filebeat.inputs:
  - type: container
    paths:
      - '/var/lib/docker/containers/*/*.log'
    processors:
      - add_docker_metadata:
          host: "unix:///var/run/docker.sock"

output.elasticsearch:
  hosts: ["elasticsearch:9200"]
  index: "filebeat-%{+yyyy.MM.dd}"

setup.kibana:
  host: "kibana:5601"
</code></pre>

        <h2 class="section-title">4. Fluentd</h2>

        <pre><code class="language-yaml">services:
  fluentd:
    image: fluent/fluentd:latest
    ports:
      - "24224:24224"
      - "24224:24224/udp"
    volumes:
      - ./fluentd/fluent.conf:/fluentd/etc/fluent.conf:ro
  
  prestashop:
    image: prestashop:8.9
    logging:
      driver: fluentd
      options:
        fluentd-address: "localhost:24224"
        tag: "docker.{{.Name}}"
</code></pre>

        <pre><code class="language-ruby"># fluentd/fluent.conf
<source>
  @type forward
  port 24224
  bind 0.0.0.0
</source>

<filter docker.**>
  @type parser
  key_name log
  <parse>
    @type json
  </parse>
</filter>

<match docker.**>
  @type elasticsearch
  host elasticsearch
  port 9200
  logstash_format true
  logstash_prefix docker
  include_tag_key true
  tag_key @log_name
</match>
</code></pre>

        <h2 class="section-title">5. Loki + Promtail + Grafana</h2>

        <pre><code class="language-yaml">services:
  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    volumes:
      - ./loki/loki-config.yml:/etc/loki/local-config.yaml:ro
    command: -config.file=/etc/loki/local-config.yaml
  
  promtail:
    image: grafana/promtail:latest
    volumes:
      - /var/log:/var/log:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - ./promtail/promtail-config.yml:/etc/promtail/config.yml:ro
    command: -config.file=/etc/promtail/config.yml
  
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_PATHS_PROVISIONING=/etc/grafana/provisioning
    volumes:
      - ./grafana/datasources:/etc/grafana/provisioning/datasources:ro
</code></pre>

        <pre><code class="language-yaml"># promtail/promtail-config.yml
server:
  http_listen_port: 9080

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: containers
    docker_sd_configs:
      - host: unix:///var/run/docker.sock
        refresh_interval: 5s
    relabel_configs:
      - source_labels: ['__meta_docker_container_name']
        regex: '/(.*)'
        target_label: 'container'
</code></pre>

        <h2 class="section-title">6. Structured Logging</h2>

        <pre><code class="language-php"><?php
// PrestaShop módulo - structured logging
use Monolog\\Logger;
use Monolog\\Handler\\StreamHandler;
use Monolog\\Formatter\\JsonFormatter;

class MyModule extends Module
{
    private $logger;
    
    public function __construct()
    {
        parent::__construct();
        
        $handler = new StreamHandler('php://stdout', Logger::INFO);
        $handler->setFormatter(new JsonFormatter());
        
        $this->logger = new Logger('prestashop');
        $this->logger->pushHandler($handler);
    }
    
    public function processOrder($orderId)
    {
        $this->logger->info('Order processing started', [
            'order_id' => $orderId,
            'customer_id' => $this->context->customer->id,
            'cart_total' => $this->context->cart->getOrderTotal(),
            'timestamp' => time(),
            'environment' => _PS_MODE_DEV_ ? 'dev' : 'prod'
        ]);
        
        try {
            // Process order...
            
            $this->logger->info('Order processed successfully', [
                'order_id' => $orderId,
                'duration_ms' => 150
            ]);
        } catch (\\Exception $e) {
            $this->logger->error('Order processing failed', [
                'order_id' => $orderId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
}
</code></pre>

        <h2 class="section-title">7. Log Rotation</h2>

        <h3>7.1. Docker JSON File</h3>

        <pre><code class="language-json">// /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "5",
    "compress": "true"
  }
}
</code></pre>

        <pre><code class="language-bash"># Reiniciar Docker
sudo systemctl restart docker
</code></pre>

        <h3>7.2. Logrotate</h3>

        <pre><code class="language-bash"># /etc/logrotate.d/docker-containers
/var/lib/docker/containers/*/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
}
</code></pre>

        <h2 class="section-title">8. Búsqueda en Logs</h2>

        <pre><code class="language-bash"># Grep en logs
docker logs prestashop 2>&1 | grep ERROR
docker logs prestashop 2>&1 | grep -i "exception"

# jq para JSON logs
docker logs prestashop 2>&1 | jq 'select(.level == "error")'

# Kibana (LogQL)
{container="prestashop"} |= "error" | json

# Loki (LogQL)
{container="prestashop"} |= "ERROR" | json | level="error"
</code></pre>

        <h2 class="section-title">9. Ejemplo Completo: Logging Stack</h2>

        <pre><code class="language-yaml"># docker-compose.logging.yml
version: '3.8'

services:
  # Application
  nginx:
    image: nginx:alpine
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
        labels: "service=nginx,environment=production"
  
  prestashop:
    image: prestashop:8.9
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
        labels: "service=prestashop,environment=production"
  
  # Logging Stack
  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    volumes:
      - loki-data:/loki
    command: -config.file=/etc/loki/local-config.yaml
  
  promtail:
    image: grafana/promtail:latest
    volumes:
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./promtail-config.yml:/etc/promtail/config.yml:ro
    command: -config.file=/etc/promtail/config.yml
  
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
    volumes:
      - grafana-data:/var/lib/grafana

volumes:
  loki-data:
  grafana-data:
</code></pre>

        <h2 class="section-title">10. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Logging:</strong>
            <ul class="mb-0">
                <li>Structured logging (JSON)</li>
                <li>Log rotation configurado</li>
                <li>Centralización de logs (ELK, Loki)</li>
                <li>Niveles de log apropiados</li>
                <li>Timestamps en todos los logs</li>
                <li>Context en logs (request_id, user_id)</li>
                <li>No logear datos sensibles</li>
                <li>Retención apropiada (7-30 días)</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Evitar:</strong>
            <ul class="mb-0">
                <li>Logs sin límite de tamaño</li>
                <li>Logear contraseñas o tokens</li>
                <li>Logs solo en contenedor (se pierden)</li>
                <li>Niveles DEBUG en producción</li>
                <li>Logs no estructurados</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>📋 Stack Recomendado:</strong>
            <ul class="mb-0">
                <li><strong>Pequeño:</strong> JSON file + rotation</li>
                <li><strong>Mediano:</strong> Loki + Promtail + Grafana</li>
                <li><strong>Grande:</strong> ELK Stack completo</li>
                <li><strong>Cloud:</strong> CloudWatch, Stackdriver, Datadog</li>
            </ul>
        </div>
    </div>
`;

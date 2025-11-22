// @ts-nocheck
const microserviciosAPIGateways = `
    <div class="content-section">
        <h1 id="microservicios-api-gateways">Microservicios y API Gateways para Gestión de Tráfico</h1>
        <p>Arquitectura de microservicios con API Gateway para PrestaShop 8.9+ escalable.</p>

        <h2 class="section-title">1. Monolito vs Microservicios</h2>

        <pre><code class="language-plaintext">MONOLITO                         MICROSERVICIOS
┌──────────────────┐             ┌─────────────────┐
│   PrestaShop     │             │   API Gateway   │
│                  │             └────┬────────────┘
│ ┌──────────────┐ │                  │
│ │   Catalog    │ │             ┌────┼──────┬─────┐
│ ├──────────────┤ │             │    │      │     │
│ │    Order     │ │           ┌─▼──┐ │   ┌──▼──┐ │
│ ├──────────────┤ │           │Cat │ │   │Order│ │
│ │   Customer   │ │           │Svc │ │   │ Svc │ │
│ ├──────────────┤ │           └────┘ │   └─────┘ │
│ │   Payment    │ │                  │            │
│ └──────────────┘ │              ┌───▼───┐   ┌───▼──┐
│                  │              │Customer│   │Payment│
│   MySQL          │              │  Svc  │   │ Svc  │
└──────────────────┘              └───────┘   └──────┘
                                      │            │
                                  ┌───▼───┐   ┌───▼───┐
                                  │MySQL 1│   │MySQL 2│
                                  └───────┘   └───────┘
</code></pre>

        <h2 class="section-title">2. API Gateway con Kong</h2>

        <h3>2.1. Kong Setup</h3>

        <pre><code class="language-yaml"># docker-compose.yml
version: '3'
services:
  kong-database:
    image: postgres:13
    environment:
      POSTGRES_USER: kong
      POSTGRES_DB: kong
      POSTGRES_PASSWORD: kong
    
  kong:
    image: kong:latest
    environment:
      KONG_DATABASE: postgres
      KONG_PG_HOST: kong-database
      KONG_PG_PASSWORD: kong
      KONG_PROXY_ACCESS_LOG: /dev/stdout
      KONG_ADMIN_ACCESS_LOG: /dev/stdout
      KONG_PROXY_ERROR_LOG: /dev/stderr
      KONG_ADMIN_ERROR_LOG: /dev/stderr
      KONG_ADMIN_LISTEN: 0.0.0.0:8001
    ports:
      - "8000:8000"  # Proxy
      - "8443:8443"  # Proxy SSL
      - "8001:8001"  # Admin API
    depends_on:
      - kong-database

  konga:
    image: pantsel/konga
    ports:
      - "1337:1337"
    environment:
      DB_ADAPTER: postgres
      DB_URI: postgresql://kong:kong@kong-database:5432/konga
</code></pre>

        <h3>2.2. Configurar Services y Routes</h3>

        <pre><code class="language-bash"># Service: Catalog
curl -i -X POST http://localhost:8001/services \\
  --data name=catalog-service \\
  --data url=http://catalog-api:8080

# Route para Catalog
curl -i -X POST http://localhost:8001/services/catalog-service/routes \\
  --data 'paths[]=/api/products' \\
  --data 'methods[]=GET' \\
  --data 'methods[]=POST'

# Service: Order
curl -i -X POST http://localhost:8001/services \\
  --data name=order-service \\
  --data url=http://order-api:8080

# Route para Order
curl -i -X POST http://localhost:8001/services/order-service/routes \\
  --data 'paths[]=/api/orders'

# Ahora:
# GET http://localhost:8000/api/products → catalog-service
# GET http://localhost:8000/api/orders → order-service
</code></pre>

        <h3>2.3. Kong Plugins (Rate Limiting, Auth, CORS)</h3>

        <pre><code class="language-bash"># Rate Limiting
curl -X POST http://localhost:8001/services/catalog-service/plugins \\
  --data name=rate-limiting \\
  --data config.minute=100 \\
  --data config.policy=local

# JWT Authentication
curl -X POST http://localhost:8001/services/order-service/plugins \\
  --data name=jwt

# CORS
curl -X POST http://localhost:8001/services/catalog-service/plugins \\
  --data name=cors \\
  --data config.origins=https://shop.example.com \\
  --data config.methods=GET,POST,PUT,DELETE \\
  --data config.credentials=true

# Logging
curl -X POST http://localhost:8001/services/order-service/plugins \\
  --data name=file-log \\
  --data config.path=/var/log/kong/orders.log
</code></pre>

        <h2 class="section-title">3. Nginx como API Gateway</h2>

        <pre><code class="language-nginx"># /etc/nginx/nginx.conf
upstream catalog_service {
    server catalog-api-1:8080;
    server catalog-api-2:8080;
}

upstream order_service {
    server order-api-1:8080;
    server order-api-2:8080;
}

server {
    listen 80;
    server_name api.shop.com;

    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api_limit:10m rate=10r/s;

    location /api/products {
        limit_req zone=api_limit burst=20;
        
        proxy_pass http://catalog_service;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        
        # Cache GET requests
        proxy_cache api_cache;
        proxy_cache_valid 200 5m;
        proxy_cache_bypass \$http_cache_control;
    }

    location /api/orders {
        limit_req zone=api_limit burst=10;
        
        # Solo authenticated
        auth_request /auth;
        
        proxy_pass http://order_service;
        proxy_set_header Host \$host;
    }
    
    location = /auth {
        internal;
        proxy_pass http://auth-service/validate;
        proxy_pass_request_body off;
        proxy_set_header Content-Length "";
        proxy_set_header X-Original-URI \$request_uri;
    }
}
</code></pre>

        <h2 class="section-title">4. Ejemplo: Microservicio Catalog</h2>

        <pre><code class="language-php"><?php
// catalog-service/public/index.php
// Microservicio independiente

require_once __DIR__ . '/../vendor/autoload.php';

use Slim\\Factory\\AppFactory;

\$app = AppFactory::create();

// GET /products
\$app->get('/products', function (\$request, \$response) {
    \$db = new PDO('mysql:host=catalog-db;dbname=catalog', 'user', 'pass');
    
    \$stmt = \$db->query('SELECT * FROM products WHERE active = 1 LIMIT 100');
    \$products = \$stmt->fetchAll(PDO::FETCH_ASSOC);
    
    \$response->getBody()->write(json_encode(\$products));
    return \$response->withHeader('Content-Type', 'application/json');
});

// GET /products/{id}
\$app->get('/products/{id}', function (\$request, \$response, \$args) {
    \$redis = new Redis();
    \$redis->connect('redis', 6379);
    
    // Cache
    \$cached = \$redis->get("product:{\$args['id']}");
    if (\$cached) {
        \$response->getBody()->write(\$cached);
        return \$response->withHeader('Content-Type', 'application/json');
    }
    
    // DB
    \$db = new PDO('mysql:host=catalog-db;dbname=catalog', 'user', 'pass');
    \$stmt = \$db->prepare('SELECT * FROM products WHERE id = ?');
    \$stmt->execute([\$args['id']]);
    \$product = \$stmt->fetch(PDO::FETCH_ASSOC);
    
    \$json = json_encode(\$product);
    \$redis->setex("product:{\$args['id']}", 3600, \$json);
    
    \$response->getBody()->write(\$json);
    return \$response->withHeader('Content-Type', 'application/json');
});

\$app->run();
</code></pre>

        <h2 class="section-title">5. Service Discovery</h2>

        <h3>5.1. Consul para Service Discovery</h3>

        <pre><code class="language-bash"># Registrar servicio en Consul
curl -X PUT http://consul:8500/v1/agent/service/register \\
  -d '{
    "ID": "catalog-service-1",
    "Name": "catalog-service",
    "Address": "10.0.1.10",
    "Port": 8080,
    "Check": {
      "HTTP": "http://10.0.1.10:8080/health",
      "Interval": "10s"
    }
  }'
</code></pre>

        <pre><code class="language-php"><?php
// Descubrir servicio
class ConsulServiceDiscovery
{
    public function getServiceUrl(string \$serviceName): string
    {
        \$response = file_get_contents("http://consul:8500/v1/catalog/service/{\$serviceName}");
        \$services = json_decode(\$response, true);
        
        if (empty(\$services)) {
            throw new Exception("Service {\$serviceName} not found");
        }
        
        // Random selection (simple load balancing)
        \$service = \$services[array_rand(\$services)];
        
        return "http://{\$service['ServiceAddress']}:{\$service['ServicePort']}";
    }
}

// Uso
\$discovery = new ConsulServiceDiscovery();
\$catalogUrl = \$discovery->getServiceUrl('catalog-service');

\$response = file_get_contents("\$catalogUrl/products");
</code></pre>

        <h2 class="section-title">6. Circuit Breaker Pattern</h2>

        <pre><code class="language-php"><?php
// Protección contra servicios caídos
class CircuitBreaker
{
    private Redis \$redis;
    private string \$serviceName;
    private int \$failureThreshold = 5;
    private int \$timeout = 60;
    
    public function call(callable \$callback)
    {
        \$state = \$this->redis->get("circuit:{\$this->serviceName}");
        
        // OPEN: Service está down, no intentar
        if (\$state === 'open') {
            throw new ServiceUnavailableException();
        }
        
        try {
            \$result = \$callback();
            
            // Success: reset failures
            \$this->redis->del("circuit:{\$this->serviceName}:failures");
            
            return \$result;
        } catch (\\Exception \$e) {
            \$failures = \$this->redis->incr("circuit:{\$this->serviceName}:failures");
            
            if (\$failures >= \$this->failureThreshold) {
                // OPEN circuit
                \$this->redis->setex("circuit:{\$this->serviceName}", \$this->timeout, 'open');
            }
            
            throw \$e;
        }
    }
}

// Uso
\$circuitBreaker = new CircuitBreaker('order-service');

try {
    \$orders = \$circuitBreaker->call(function() {
        return file_get_contents('http://order-service/orders');
    });
} catch (ServiceUnavailableException \$e) {
    // Fallback: cache, default value, etc.
    \$orders = \$this->getCachedOrders();
}
</code></pre>

        <h2 class="section-title">7. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Best Practices:</strong>
            <ul class="mb-0">
                <li><strong>API Gateway único:</strong> Single entry point</li>
                <li><strong>Service Discovery:</strong> Consul, Eureka</li>
                <li><strong>Circuit Breaker:</strong> Hystrix, resilience4j</li>
                <li><strong>Distributed Tracing:</strong> Jaeger, Zipkin</li>
                <li><strong>Centralized Logging:</strong> ELK, CloudWatch</li>
                <li><strong>API Versioning:</strong> /v1/products, /v2/products</li>
                <li><strong>Health Checks:</strong> /health endpoint en cada servicio</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Desventajas Microservicios:</strong>
            <ul class="mb-0">
                <li>Complejidad operacional alta</li>
                <li>Debugging distribuido difícil</li>
                <li>Latencia de red entre servicios</li>
                <li>Consistencia eventual</li>
                <li>Testing end-to-end complejo</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>🎯 Recomendación PrestaShop:</strong>
            <ul class="mb-0">
                <li><strong>Core:</strong> Monolito modular</li>
                <li><strong>Servicios externos:</strong> Microservicios (search, analytics, recommendations)</li>
                <li><strong>API Gateway:</strong> Kong o AWS API Gateway</li>
            </ul>
        </div>
    </div>
`;

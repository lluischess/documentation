// @ts-nocheck
const balanceadoresCargaProxyInverso = `
    <div class="content-section">
        <h1 id="balanceadores-carga-proxy-inverso">Balanceadores de Carga y Proxy Inverso</h1>
        <p>Distribución de tráfico con Nginx, HAProxy y AWS ALB para PrestaShop 8.9+ de alta disponibilidad.</p>

        <h2 class="section-title">1. Concepto: Load Balancer</h2>

        <pre><code class="language-plaintext">┌────────────┐
│   Clients  │
│  (10,000)  │
└─────┬──────┘
      │
┌─────▼──────────────┐
│  Load Balancer     │  ← Distribuye carga
└──┬──────┬──────┬───┘
   │      │      │
┌──▼──┐ ┌▼───┐ ┌▼───┐
│Web 1│ │Web2│ │Web3│  ← 3,333 requests cada uno
└─────┘ └────┘ └────┘
</code></pre>

        <h2 class="section-title">2. Nginx como Load Balancer</h2>

        <h3>2.1. Round Robin (default)</h3>

        <pre><code class="language-nginx"># /etc/nginx/nginx.conf
upstream prestashop_backend {
    server 10.0.1.10:80;  # Web Server 1
    server 10.0.1.11:80;  # Web Server 2
    server 10.0.1.12:80;  # Web Server 3
}

server {
    listen 80;
    server_name shop.example.com;

    location / {
        proxy_pass http://prestashop_backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
</code></pre>

        <h3>2.2. Least Connections</h3>

        <pre><code class="language-nginx"># Envía a servidor con menos conexiones activas
upstream prestashop_backend {
    least_conn;
    
    server 10.0.1.10:80;
    server 10.0.1.11:80;
    server 10.0.1.12:80;
}
</code></pre>

        <h3>2.3. IP Hash (Sticky Sessions)</h3>

        <pre><code class="language-nginx"># Mismo cliente siempre al mismo servidor
upstream prestashop_backend {
    ip_hash;
    
    server 10.0.1.10:80;
    server 10.0.1.11:80;
    server 10.0.1.12:80;
}

# Útil si sesiones NO están en Redis
</code></pre>

        <h3>2.4. Weighted Load Balancing</h3>

        <pre><code class="language-nginx"># Distribuir según capacidad del servidor
upstream prestashop_backend {
    server 10.0.1.10:80 weight=3;  # Servidor potente (60%)
    server 10.0.1.11:80 weight=1;  # Servidor medio (20%)
    server 10.0.1.12:80 weight=1;  # Servidor medio (20%)
}
</code></pre>

        <h3>2.5. Health Checks</h3>

        <pre><code class="language-nginx">upstream prestashop_backend {
    server 10.0.1.10:80 max_fails=3 fail_timeout=30s;
    server 10.0.1.11:80 max_fails=3 fail_timeout=30s;
    server 10.0.1.12:80 max_fails=3 fail_timeout=30s;
    
    # Si falla 3 veces, lo marca como down por 30s
}
</code></pre>

        <h2 class="section-title">3. HAProxy (High Availability)</h2>

        <pre><code class="language-haproxy"># /etc/haproxy/haproxy.cfg
global
    log /dev/log local0
    maxconn 4096
    user haproxy
    group haproxy

defaults
    mode http
    log global
    option httplog
    option dontlognull
    timeout connect 5000ms
    timeout client  50000ms
    timeout server  50000ms

# Frontend (recibe tráfico)
frontend prestashop_front
    bind *:80
    bind *:443 ssl crt /etc/ssl/certs/prestashop.pem
    
    # Redirect HTTP to HTTPS
    redirect scheme https code 301 if !{ ssl_fc }
    
    default_backend prestashop_servers

# Backend (servidores)
backend prestashop_servers
    balance roundrobin
    option httpchk GET /index.php HTTP/1.1\\r\\nHost:\\ shop.example.com
    
    server web1 10.0.1.10:80 check inter 2000 rise 2 fall 3
    server web2 10.0.1.11:80 check inter 2000 rise 2 fall 3
    server web3 10.0.1.12:80 check inter 2000 rise 2 fall 3

# Stats page
listen stats
    bind *:8080
    stats enable
    stats uri /stats
    stats auth admin:password123
</code></pre>

        <h2 class="section-title">4. AWS Application Load Balancer (ALB)</h2>

        <pre><code class="language-yaml"># AWS CloudFormation / Terraform
Resources:
  PrestaShopALB:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties:
      Name: prestashop-alb
      Subnets:
        - subnet-abc123
        - subnet-def456
      SecurityGroups:
        - sg-web-public
      Tags:
        - Key: Name
          Value: PrestaShop-ALB

  PrestaShopTargetGroup:
    Type: AWS::ElasticLoadBalancingV2::TargetGroup
    Properties:
      Name: prestashop-tg
      Port: 80
      Protocol: HTTP
      VpcId: vpc-123456
      HealthCheckPath: /index.php
      HealthCheckIntervalSeconds: 30
      HealthCheckTimeoutSeconds: 5
      HealthyThresholdCount: 2
      UnhealthyThresholdCount: 3
      TargetType: instance
      Targets:
        - Id: i-web1
          Port: 80
        - Id: i-web2
          Port: 80
        - Id: i-web3
          Port: 80

  PrestaShopListener:
    Type: AWS::ElasticLoadBalancingV2::Listener
    Properties:
      LoadBalancerArn: !Ref PrestaShopALB
      Port: 443
      Protocol: HTTPS
      Certificates:
        - CertificateArn: arn:aws:acm:eu-west-1:123456:certificate/abc
      DefaultActions:
        - Type: forward
          TargetGroupArn: !Ref PrestaShopTargetGroup
</code></pre>

        <h2 class="section-title">5. Sticky Sessions</h2>

        <p>Cuando necesitas que el mismo cliente siempre vaya al mismo servidor (útil si sesiones no están en Redis).</p>

        <h3>5.1. Nginx Sticky Sessions</h3>

        <pre><code class="language-nginx"># Opción 1: IP Hash
upstream prestashop_backend {
    ip_hash;
    server 10.0.1.10:80;
    server 10.0.1.11:80;
}

# Opción 2: Sticky Cookie (requiere nginx-plus o módulo)
upstream prestashop_backend {
    sticky cookie srv_id expires=1h domain=.example.com path=/;
    server 10.0.1.10:80;
    server 10.0.1.11:80;
}
</code></pre>

        <h3>5.2. HAProxy Sticky Sessions</h3>

        <pre><code class="language-haproxy">backend prestashop_servers
    balance roundrobin
    cookie SERVERID insert indirect nocache
    
    server web1 10.0.1.10:80 check cookie web1
    server web2 10.0.1.11:80 check cookie web2
    server web3 10.0.1.12:80 check cookie web3
</code></pre>

        <h3>5.3. AWS ALB Sticky Sessions</h3>

        <pre><code class="language-yaml">PrestaShopTargetGroup:
  Properties:
    TargetGroupAttributes:
      - Key: stickiness.enabled
        Value: true
      - Key: stickiness.type
        Value: lb_cookie
      - Key: stickiness.lb_cookie.duration_seconds
        Value: 86400  # 24 horas
</code></pre>

        <h2 class="section-title">6. SSL Termination</h2>

        <p>El Load Balancer maneja HTTPS, los backends usan HTTP (más rápido).</p>

        <pre><code class="language-nginx"># Nginx SSL Termination
server {
    listen 443 ssl http2;
    server_name shop.example.com;

    ssl_certificate /etc/letsencrypt/live/shop.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/shop.example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        # Backend HTTP (no HTTPS)
        proxy_pass http://prestashop_backend;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
</code></pre>

        <pre><code class="language-php"><?php
// PrestaShop: detectar HTTPS desde X-Forwarded-Proto
// config/defines.inc.php
if (isset(\$_SERVER['HTTP_X_FORWARDED_PROTO']) && \$_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {
    \$_SERVER['HTTPS'] = 'on';
}
</code></pre>

        <h2 class="section-title">7. Monitoring del Load Balancer</h2>

        <pre><code class="language-bash"># Nginx Status Module
# /etc/nginx/nginx.conf
server {
    listen 8080;
    location /nginx_status {
        stub_status on;
        allow 127.0.0.1;
        deny all;
    }
}

# Verificar estado
curl http://localhost:8080/nginx_status
# Active connections: 234
# server accepts handled requests
#  12345 12345 98765
</code></pre>

        <pre><code class="language-bash"># HAProxy Stats (dashboard web)
# http://load-balancer:8080/stats
# Ver en tiempo real:
# - Requests por segundo
# - Servidores up/down
# - Conexiones activas
# - Health checks
</code></pre>

        <h2 class="section-title">8. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Best Practices:</strong>
            <ul class="mb-0">
                <li><strong>Health Checks:</strong> Siempre activos, cada 10-30s</li>
                <li><strong>SSL Termination:</strong> En LB, no en backends</li>
                <li><strong>Sticky Sessions:</strong> Solo si sesiones no están en Redis</li>
                <li><strong>Monitoring:</strong> Logs centralizados + dashboard</li>
                <li><strong>Redundancia:</strong> 2 load balancers (HA con keepalived)</li>
                <li><strong>Rate Limiting:</strong> Proteger de DDoS en LB</li>
                <li><strong>HTTP/2:</strong> Activar para mejor performance</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>🎯 Comparación:</strong>
            <ul class="mb-0">
                <li><strong>Nginx:</strong> Rápido, simple, gratis</li>
                <li><strong>HAProxy:</strong> Más features, HA avanzada</li>
                <li><strong>AWS ALB:</strong> Managed, auto-scaling, caro</li>
            </ul>
        </div>
    </div>
`;

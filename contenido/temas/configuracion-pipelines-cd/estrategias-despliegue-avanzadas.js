// @ts-nocheck
const estrategiasDespliegueAvanzadas = `
    <div class="content-section">
        <h1 id="estrategias-despliegue-avanzadas">Estrategias de Despliegue (Blue/Green, Canary, Rolling Updates)</h1>
        <p>Implementación de estrategias avanzadas de deployment para PrestaShop 8.9+ con zero-downtime.</p>

        <h2 class="section-title">1. Blue-Green Deployment</h2>

        <h3>1.1. Concepto</h3>

        <pre><code class="language-plaintext">┌─────────────────────────────────────┐
│          Load Balancer              │
│        (Nginx / HAProxy)            │
└────────────┬────────────────────────┘
             │
      ┌──────┴──────┐
      │             │
┌─────▼─────┐ ┌────▼──────┐
│   BLUE    │ │   GREEN   │
│  (Active) │ │ (Standby) │
│  v1.0.0   │ │  v1.1.0   │
└───────────┘ └───────────┘

1. Blue (v1.0.0) está activo
2. Deploy v1.1.0 a Green
3. Test Green
4. Switch tráfico a Green
5. Blue queda como fallback
</code></pre>

        <h3>1.2. Nginx Blue-Green</h3>

        <pre><code class="language-nginx"># /etc/nginx/sites-available/prestashop
upstream prestashop_blue {
    server 192.168.1.10:8080;  # Blue
}

upstream prestashop_green {
    server 192.168.1.11:8080;  # Green
}

# Symlink para switch rápido
upstream prestashop_active {
    server 192.168.1.10:8080;  # Apunta a blue o green
}

server {
    listen 80;
    server_name www.myshop.com;
    
    location / {
        proxy_pass http://prestashop_active;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
</code></pre>

        <pre><code class="language-bash">#!/bin/bash
# blue-green-switch.sh

CURRENT=\$(readlink /var/www/prestashop)

if [[ "\$CURRENT" == *"blue"* ]]; then
    NEW="green"
    NEW_PATH="/var/www/prestashop-green"
else
    NEW="blue"
    NEW_PATH="/var/www/prestashop-blue"
fi

echo "Switching from \$CURRENT to \$NEW..."

# Test new environment
curl -f http://localhost:8080/health || exit 1

# Switch
ln -sfn \$NEW_PATH /var/www/prestashop
systemctl reload nginx

echo "✅ Switched to \$NEW"
</code></pre>

        <h2 class="section-title">2. Canary Deployment</h2>

        <h3>2.1. Nginx Canary (10% tráfico)</h3>

        <pre><code class="language-nginx"># /etc/nginx/sites-available/prestashop
upstream prestashop_stable {
    server 192.168.1.10:8080 weight=9;  # 90% tráfico
}

upstream prestashop_canary {
    server 192.168.1.11:8080 weight=1;  # 10% tráfico
}

split_clients "\${remote_addr}" \$upstream {
    10%     canary;
    *       stable;
}

server {
    listen 80;
    server_name www.myshop.com;
    
    location / {
        proxy_pass http://prestashop_\$upstream;
    }
}
</code></pre>

        <h3>2.2. Canary Progresivo</h3>

        <pre><code class="language-bash">#!/bin/bash
# canary-rollout.sh

deploy_canary() {
    local percentage=\$1
    
    echo "Deploying canary with \$percentage% traffic..."
    
    # Update nginx config
    sed -i "s/split_clients.*\$/split_clients \\"\\\${remote_addr}\\" \\\$upstream {/" /etc/nginx/sites-available/prestashop
    sed -i "s/^\\s*[0-9]*%\\s*canary/    \${percentage}%     canary/" /etc/nginx/sites-available/prestashop
    
    nginx -t && systemctl reload nginx
    
    echo "Monitoring for 5 minutes..."
    sleep 300
    
    # Check error rate
    ERROR_RATE=\$(check_error_rate)
    
    if [ "\$ERROR_RATE" -gt "1" ]; then
        echo "❌ Error rate too high, rolling back..."
        rollback_canary
        exit 1
    fi
}

# Gradual rollout
deploy_canary 10   # 10%
deploy_canary 25   # 25%
deploy_canary 50   # 50%
deploy_canary 100  # 100%

echo "✅ Canary fully deployed"
</code></pre>

        <h2 class="section-title">3. Rolling Updates</h2>

        <h3>3.1. Docker Swarm Rolling Update</h3>

        <pre><code class="language-yaml"># docker-compose.yml
version: '3.8'

services:
  prestashop:
    image: myshop/prestashop:\${VERSION}
    deploy:
      replicas: 5
      update_config:
        parallelism: 1          # 1 contenedor a la vez
        delay: 30s              # Esperar 30s entre cada uno
        failure_action: rollback
        monitor: 60s            # Monitor 60s antes de continuar
        order: start-first      # Start new before stopping old
      rollback_config:
        parallelism: 0          # Rollback todos a la vez
        delay: 0s
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 10s
      timeout: 5s
      retries: 3
</code></pre>

        <pre><code class="language-bash"># Deploy rolling update
docker stack deploy -c docker-compose.yml prestashop

# Ver progreso
docker service ps prestashop_prestashop

# Rollback si falla
docker service rollback prestashop_prestashop
</code></pre>

        <h3>3.2. Kubernetes Rolling Update</h3>

        <pre><code class="language-yaml"># deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prestashop
spec:
  replicas: 5
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1           # Max 1 pod extra durante update
      maxUnavailable: 0     # Min 0 pods down
  template:
    spec:
      containers:
      - name: prestashop
        image: myshop/prestashop:1.2.0
        readinessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 10
          periodSeconds: 5
</code></pre>

        <pre><code class="language-bash"># Deploy rolling update
kubectl set image deployment/prestashop prestashop=myshop/prestashop:1.2.0

# Ver progreso
kubectl rollout status deployment/prestashop

# Rollback
kubectl rollout undo deployment/prestashop
</code></pre>

        <h2 class="section-title">4. Comparativa de Estrategias</h2>

        <table>
            <thead>
                <tr>
                    <th>Estrategia</th>
                    <th>Downtime</th>
                    <th>Riesgo</th>
                    <th>Costo</th>
                    <th>Rollback</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Blue-Green</strong></td>
                    <td>Zero</td>
                    <td>Bajo</td>
                    <td>Alto (2x recursos)</td>
                    <td>Instantáneo</td>
                </tr>
                <tr>
                    <td><strong>Canary</strong></td>
                    <td>Zero</td>
                    <td>Muy Bajo</td>
                    <td>Medio</td>
                    <td>Rápido</td>
                </tr>
                <tr>
                    <td><strong>Rolling</strong></td>
                    <td>Zero</td>
                    <td>Medio</td>
                    <td>Bajo</td>
                    <td>Medio</td>
                </tr>
                <tr>
                    <td><strong>Recreate</strong></td>
                    <td>Sí</td>
                    <td>Alto</td>
                    <td>Bajo</td>
                    <td>Lento</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">5. GitHub Actions - Canary Deploy</h2>

        <pre><code class="language-yaml"># .github/workflows/canary.yml
name: Canary Deployment

on:
  push:
    branches: [ main ]

jobs:
  canary:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy canary (10%)
        run: |
          ssh deploy@prod << 'EOF'
            cd /var/www/prestashop-canary
            git pull origin main
            composer install --no-dev
            php bin/console cache:clear
          EOF
          
          # Update nginx to send 10% to canary
          ssh deploy@prod "sudo /opt/scripts/canary-rollout.sh 10"
      
      - name: Monitor (5 min)
        run: sleep 300
      
      - name: Check metrics
        id: check
        run: |
          ERROR_RATE=\$(curl -s http://metrics/canary/error-rate)
          if (( \$(echo "\$ERROR_RATE > 1.0" | bc -l) )); then
            echo "status=failed" >> \$GITHUB_OUTPUT
          else
            echo "status=success" >> \$GITHUB_OUTPUT
          fi
      
      - name: Rollback if failed
        if: steps.check.outputs.status == 'failed'
        run: ssh deploy@prod "sudo /opt/scripts/canary-rollout.sh 0"
      
      - name: Increase to 50%
        if: steps.check.outputs.status == 'success'
        run: ssh deploy@prod "sudo /opt/scripts/canary-rollout.sh 50"
      
      - name: Full rollout
        if: steps.check.outputs.status == 'success'
        run: ssh deploy@prod "sudo /opt/scripts/canary-rollout.sh 100"
</code></pre>

        <h2 class="section-title">6. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Deployment Strategies:</strong>
            <ul class="mb-0">
                <li><strong>E-commerce (PrestaShop):</strong> Blue-Green (zero risk)</li>
                <li><strong>Alta disponibilidad:</strong> Canary (gradual)</li>
                <li><strong>Microservicios:</strong> Rolling (K8s/Swarm)</li>
                <li><strong>Desarrollo:</strong> Recreate (simple)</li>
                <li>Health checks obligatorios</li>
                <li>Monitoring activo durante deploy</li>
                <li>Rollback automático si métricas degradan</li>
            </ul>
        </div>
    </div>
`;

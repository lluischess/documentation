// @ts-nocheck
const monitorizacionPostDespliegueAlertas = `
    <div class="content-section">
        <h1 id="monitorizacion-post-despliegue-alertas">Monitorización Post-Despliegue y Alertas</h1>
        <p>Monitoreo activo y alertas automáticas post-deployment para PrestaShop 8.9+ garantizando estabilidad.</p>

        <h2 class="section-title">1. Health Checks Post-Deploy</h2>

        <pre><code class="language-bash">#!/bin/bash
# post-deploy-checks.sh

echo "🔍 Running post-deployment checks..."

# 1. HTTP Status
echo "Checking HTTP status..."
STATUS=\$(curl -s -o /dev/null -w "%{http_code}" https://www.myshop.com)
if [ "\$STATUS" != "200" ]; then
    echo "❌ HTTP check failed: \$STATUS"
    exit 1
fi

# 2. Health endpoint
echo "Checking health endpoint..."
HEALTH=\$(curl -s https://www.myshop.com/health | jq -r '.status')
if [ "\$HEALTH" != "ok" ]; then
    echo "❌ Health check failed"
    exit 1
fi

# 3. Database connectivity
echo "Checking database..."
php bin/console dbal:run-sql "SELECT 1" > /dev/null 2>&1
if [ \$? -ne 0 ]; then
    echo "❌ Database check failed"
    exit 1
fi

# 4. Cache status
echo "Checking cache..."
php bin/console cache:pool:list > /dev/null 2>&1
if [ \$? -ne 0 ]; then
    echo "❌ Cache check failed"
    exit 1
fi

# 5. Critical routes
echo "Checking critical routes..."
for route in "/" "/checkout" "/login" "/api/products"; do
    STATUS=\$(curl -s -o /dev/null -w "%{http_code}" "https://www.myshop.com\$route")
    if [ "\$STATUS" -ge "400" ]; then
        echo "❌ Route \$route failed: \$STATUS"
        exit 1
    fi
done

echo "✅ All checks passed"
</code></pre>

        <h2 class="section-title">2. Monitoring con Prometheus</h2>

        <pre><code class="language-yaml"># prometheus-rules.yml
groups:
  - name: deployment
    interval: 10s
    rules:
      # Error rate spike
      - alert: HighErrorRatePostDeploy
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 2m
        annotations:
          summary: "High error rate detected post-deployment"
      
      # Response time degradation
      - alert: SlowResponseTimePostDeploy
        expr: histogram_quantile(0.95, http_request_duration_seconds) > 2
        for: 3m
        annotations:
          summary: "Response time degraded after deployment"
      
      # Cart abandonment spike
      - alert: CartAbandonmentSpike
        expr: rate(cart_abandoned_total[10m]) > 1.2 * rate(cart_abandoned_total[1h] offset 1h)
        annotations:
          summary: "Cart abandonment increased post-deploy"
</code></pre>

        <h2 class="section-title">3. GitHub Actions - Monitoring</h2>

        <pre><code class="language-yaml"># .github/workflows/post-deploy-monitor.yml
name: Post-Deploy Monitoring

on:
  workflow_dispatch:

jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - name: Initial checks
        run: |
          curl -f https://www.myshop.com/health || exit 1
      
      - name: Monitor for 30 minutes
        run: |
          END_TIME=\$((SECONDS + 1800))
          
          while [ \$SECONDS -lt \$END_TIME ]; do
            # Check error rate
            ERROR_RATE=\$(curl -s http://prometheus:9090/api/v1/query?query=rate\\(http_requests_total\\{status=~\\\"5..\\\"\\}\\[5m\\]\\) | jq -r '.data.result[0].value[1]')
            
            if (( \$(echo "\$ERROR_RATE > 0.05" | bc -l) )); then
              echo "❌ High error rate: \$ERROR_RATE"
              curl -X POST \${{ secrets.SLACK_WEBHOOK }} \\
                -d '{"text":"🚨 High error rate post-deploy: '\$ERROR_RATE'"}'
              exit 1
            fi
            
            # Check response time
            P95=\$(curl -s http://prometheus:9090/api/v1/query?query=histogram_quantile\\(0.95,http_request_duration_seconds\\) | jq -r '.data.result[0].value[1]')
            
            if (( \$(echo "\$P95 > 2.0" | bc -l) )); then
              echo "⚠️ Slow response time: \$P95s"
            fi
            
            sleep 60
          done
          
          echo "✅ 30-minute monitoring completed"
</code></pre>

        <h2 class="section-title">4. Slack Alerting</h2>

        <pre><code class="language-bash">#!/bin/bash
# alert-slack.sh

send_alert() {
    local MESSAGE=\$1
    local COLOR=\$2
    
    curl -X POST \$SLACK_WEBHOOK_URL \\
        -H 'Content-Type: application/json' \\
        -d "{
            \"attachments\": [{
                \"color\": \"\$COLOR\",
                \"title\": \"Deployment Alert\",
                \"text\": \"\$MESSAGE\",
                \"fields\": [
                    {\"title\": \"Environment\", \"value\": \"Production\", \"short\": true},
                    {\"title\": \"Time\", \"value\": \"\$(date)\", \"short\": true}
                ]
            }]
        }"
}

# Uso
if [ "\$ERROR_RATE" -gt "5" ]; then
    send_alert "🚨 High error rate: \$ERROR_RATE%" "danger"
fi
</code></pre>

        <h2 class="section-title">5. Custom Metrics</h2>

        <pre><code class="language-php"><?php
// src/Monitoring/DeploymentMetrics.php

class DeploymentMetrics
{
    public function trackDeployment(string $version): void
    {
        // Record deployment
        \$this->prometheus->counter('deployments_total', [
            'environment' => 'production',
            'version' => \$version,
        ])->inc();
        
        // Start monitoring window
        \$this->redis->set('deployment:last', time());
    }
    
    public function checkPostDeploymentHealth(): array
    {
        \$deployTime = \$this->redis->get('deployment:last');
        \$timeSinceDeploy = time() - \$deployTime;
        
        // Only check if deployment was recent (< 1 hour)
        if (\$timeSinceDeploy > 3600) {
            return ['status' => 'stable'];
        }
        
        \$errors = [];
        
        // Check error rate
        \$errorRate = \$this->getErrorRate('5m');
        if (\$errorRate > 0.05) {
            \$errors[] = "High error rate: {\$errorRate}";
        }
        
        // Check response time
        \$p95 = \$this->getP95ResponseTime('5m');
        if (\$p95 > 2.0) {
            \$errors[] = "Slow response time: {\$p95}s";
        }
        
        return [
            'status' => empty(\$errors) ? 'healthy' : 'degraded',
            'errors' => \$errors,
        ];
    }
}
</code></pre>

        <h2 class="section-title">6. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Post-Deployment Monitoring:</strong>
            <ul class="mb-0">
                <li>Health checks inmediatos post-deploy</li>
                <li>Monitoreo activo 30-60 minutos</li>
                <li>Alertas automáticas en Slack</li>
                <li>Métricas: error rate, response time, cart abandonment</li>
                <li>Rollback automático si degradación</li>
                <li>Dashboard dedicado para deployments</li>
            </ul>
        </div>
    </div>
`;

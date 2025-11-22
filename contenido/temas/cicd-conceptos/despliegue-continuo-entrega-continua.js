// @ts-nocheck
const despliegueContinuoEntregaContinua = `
    <div class="content-section">
        <h1 id="despliegue-continuo-entrega-continua">Principios de Despliegue Continuo y Entrega Continua</h1>
        <p>Diferencias, estrategias e implementación de Continuous Delivery (CD) y Continuous Deployment para proyectos PrestaShop 8.9+.</p>

        <h2 class="section-title">1. Continuous Delivery vs Continuous Deployment</h2>

        <table>
            <thead>
                <tr>
                    <th>Aspecto</th>
                    <th>Continuous Delivery (CD)</th>
                    <th>Continuous Deployment</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Deploy a producción</strong></td>
                    <td>Manual (aprobación requerida)</td>
                    <td>Automático</td>
                </tr>
                <tr>
                    <td><strong>Frecuencia</strong></td>
                    <td>A demanda (diario/semanal)</td>
                    <td>Cada commit que pasa tests</td>
                </tr>
                <tr>
                    <td><strong>Riesgo</strong></td>
                    <td>Bajo-Medio</td>
                    <td>Muy bajo (con buena cobertura)</td>
                </tr>
                <tr>
                    <td><strong>Control</strong></td>
                    <td>Alto (humano decide cuándo)</td>
                    <td>Automatizado total</td>
                </tr>
                <tr>
                    <td><strong>Uso típico</strong></td>
                    <td>E-commerce, finanzas</td>
                    <td>SaaS, aplicaciones web</td>
                </tr>
            </tbody>
        </table>

        <div class="alert alert-info">
            <strong>📊 Para PrestaShop:</strong>
            <ul class="mb-0">
                <li><strong>Continuous Delivery:</strong> Recomendado (aprobación manual a producción)</li>
                <li><strong>Continuous Deployment:</strong> Solo en staging/qa automático</li>
                <li>Producción requiere revisión humana por impacto en ventas</li>
            </ul>
        </div>

        <h2 class="section-title">2. Pipeline de Entrega Continua</h2>

        <pre><code class="language-plaintext">┌─────────────┐
│   Commit    │
└──────┬──────┘
       │
┌──────▼──────────┐
│  Build & Test   │  ← CI (Automático)
│  (Unit, Lint)   │
└──────┬──────────┘
       │
┌──────▼──────────┐
│  Integration    │  ← Tests más largos
│     Tests       │
└──────┬──────────┘
       │
┌──────▼──────────┐
│ Deploy Staging  │  ← Automático
└──────┬──────────┘
       │
┌──────▼──────────┐
│  E2E Tests      │  ← Smoke tests
│  (Staging)      │
└──────┬──────────┘
       │
┌──────▼──────────┐
│ Manual Approval │  ← Continuous Delivery
└──────┬──────────┘
       │
┌──────▼──────────┐
│ Deploy Prod     │  ← Con estrategia (blue-green, canary)
└─────────────────┘
</code></pre>

        <h2 class="section-title">3. Implementación Continuous Delivery</h2>

        <h3>3.1. Pipeline Completo</h3>

        <pre><code class="language-yaml"># .github/workflows/cd-pipeline.yml
name: Continuous Delivery Pipeline

on:
  push:
    branches: [ main ]
  workflow_dispatch:  # Manual trigger

env:
  PHP_VERSION: '8.1'
  NODE_VERSION: '18'

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: \${{ env.PHP_VERSION }}
          coverage: xdebug
      
      - name: Install dependencies
        run: composer install --no-dev --optimize-autoloader
      
      - name: Run tests
        run: vendor/bin/phpunit --testsuite=all
      
      - name: Build assets
        run: |
          npm ci
          npm run build:production
      
      - name: Create artifact
        run: |
          tar -czf prestashop-\${{ github.sha }}.tar.gz \\
            --exclude='node_modules' \\
            --exclude='.git' \\
            --exclude='tests' \\
            .
      
      - name: Upload artifact
        uses: actions/upload-artifact@v3
        with:
          name: prestashop-build
          path: prestashop-\${{ github.sha }}.tar.gz
          retention-days: 30
  
  deploy-staging:
    needs: build-and-test
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: https://staging.myshop.com
    
    steps:
      - name: Download artifact
        uses: actions/download-artifact@v3
        with:
          name: prestashop-build
      
      - name: Deploy to staging
        run: |
          scp prestashop-\${{ github.sha }}.tar.gz \\
            deploy@staging.myshop.com:/tmp/
          
          ssh deploy@staging.myshop.com << 'EOF'
            cd /var/www/prestashop
            tar -xzf /tmp/prestashop-\${{ github.sha }}.tar.gz
            php bin/console cache:clear
            php bin/console prestashop:update --env=prod
          EOF
      
      - name: Smoke tests
        run: |
          curl -f https://staging.myshop.com/health || exit 1
          curl -f https://staging.myshop.com/ | grep "PrestaShop" || exit 1
  
  test-e2e-staging:
    needs: deploy-staging
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npx playwright test
        env:
          BASE_URL: https://staging.myshop.com
      
      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-results
          path: test-results/
  
  approval-gate:
    needs: test-e2e-staging
    runs-on: ubuntu-latest
    environment:
      name: production-approval
    
    steps:
      - name: Request approval
        run: echo "Waiting for manual approval to deploy to production..."
  
  deploy-production:
    needs: approval-gate
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://www.myshop.com
    
    steps:
      - name: Download artifact
        uses: actions/download-artifact@v3
        with:
          name: prestashop-build
      
      - name: Blue-Green deployment
        run: |
          # Deploy to green (inactive)
          ssh deploy@prod.myshop.com << 'EOF'
            cd /var/www/prestashop-green
            tar -xzf /tmp/prestashop-\${{ github.sha }}.tar.gz
            php bin/console cache:clear --env=prod
          EOF
          
          # Smoke test green
          curl -f https://green.myshop.com/health || exit 1
          
          # Switch traffic to green
          ssh deploy@prod.myshop.com << 'EOF'
            sudo ln -sfn /var/www/prestashop-green /var/www/prestashop
            sudo systemctl reload nginx
          EOF
      
      - name: Verify production
        run: |
          sleep 10
          curl -f https://www.myshop.com/health || exit 1
      
      - name: Notification
        uses: 8398a7/action-slack@v3
        with:
          status: \${{ job.status }}
          text: '🚀 Production deployment completed!'
          webhook_url: \${{ secrets.SLACK_WEBHOOK }}
</code></pre>

        <h3>3.2. Ambientes y Promoción</h3>

        <pre><code class="language-plaintext">Development  →  Staging  →  QA  →  Production
    (auto)       (auto)     (auto)   (manual approval)

┌──────────────┐
│  Local Dev   │  Desarrollador trabaja aquí
└──────┬───────┘
       │ git push
┌──────▼───────┐
│   CI Build   │  Tests automáticos
└──────┬───────┘
       │ auto
┌──────▼───────┐
│   Staging    │  Deploy automático (main branch)
│  Environment │  E2E tests, QA manual
└──────┬───────┘
       │ aprobación QA
┌──────▼───────┐
│ QA/Pre-Prod  │  Última validación
│  Environment │  Datos de producción anonimizados
└──────┬───────┘
       │ manual approval
┌──────▼───────┐
│  Production  │  Clientes reales
│  Environment │
└──────────────┘
</code></pre>

        <h2 class="section-title">4. Estrategias de Deployment</h2>

        <h3>4.1. Blue-Green Deployment</h3>

        <pre><code class="language-bash">#!/bin/bash
# blue-green-deploy.sh

# Detectar ambiente activo
ACTIVE=\$(readlink /var/www/prestashop)

if [[ "\$ACTIVE" == *"blue"* ]]; then
    INACTIVE="green"
    TARGET="/var/www/prestashop-green"
else
    INACTIVE="blue"
    TARGET="/var/www/prestashop-blue"
fi

echo "Active: \$ACTIVE"
echo "Deploying to: \$INACTIVE"

# Deploy a ambiente inactivo
cd \$TARGET
tar -xzf /tmp/release.tar.gz
php bin/console cache:clear --env=prod

# Smoke test
curl -f http://localhost:8080/health || exit 1

# Switch
ln -sfn \$TARGET /var/www/prestashop
systemctl reload nginx

echo "✅ Switched to \$INACTIVE"

# Rollback si falla
# ln -sfn /var/www/prestashop-\$ACTIVE /var/www/prestashop
</code></pre>

        <h3>4.2. Canary Deployment</h3>

        <pre><code class="language-nginx"># nginx.conf - Canary con 10% tráfico a nueva versión
upstream prestashop_stable {
    server 192.168.1.10:8080;  # v1.0
}

upstream prestashop_canary {
    server 192.168.1.11:8080;  # v1.1
}

split_clients "\${remote_addr}" \$upstream {
    10%     "canary";   # 10% tráfico a canary
    *       "stable";   # 90% tráfico a stable
}

server {
    location / {
        proxy_pass http://prestashop_\$upstream;
    }
}
</code></pre>

        <h3>4.3. Rolling Deployment</h3>

        <pre><code class="language-yaml"># docker-compose.yml con rolling update
version: '3.8'

services:
  prestashop:
    image: myshop/prestashop:\${VERSION}
    deploy:
      replicas: 5
      update_config:
        parallelism: 1      # Actualizar 1 a la vez
        delay: 30s          # Esperar 30s entre cada uno
        failure_action: rollback
        monitor: 60s
      rollback_config:
        parallelism: 0      # Rollback todos a la vez
        delay: 0s
</code></pre>

        <h2 class="section-title">5. Rollback Strategy</h2>

        <pre><code class="language-bash">#!/bin/bash
# rollback.sh

# Versiones disponibles
VERSIONS=(\$(ls -1 /var/www/releases/ | sort -r))

echo "Versiones disponibles:"
select VERSION in "\${VERSIONS[@]}"; do
    if [ -n "\$VERSION" ]; then
        echo "Rolling back to \$VERSION..."
        
        # Symlink a versión anterior
        ln -sfn /var/www/releases/\$VERSION /var/www/prestashop
        
        # Reload services
        systemctl reload nginx
        systemctl reload php8.1-fpm
        
        # Verificar
        curl -f http://localhost/health
        
        if [ \$? -eq 0 ]; then
            echo "✅ Rollback exitoso a \$VERSION"
        else
            echo "❌ Rollback falló"
            exit 1
        fi
        
        break
    fi
done
</code></pre>

        <h2 class="section-title">6. Feature Flags</h2>

        <pre><code class="language-php"><?php
// FeatureFlag.php
class FeatureFlag
{
    private static $flags = [
        'new_checkout' => false,
        'payment_gateway_v2' => true,
        'ai_recommendations' => false,
    ];
    
    public static function isEnabled(string $flag): bool
    {
        // Desde BD o config
        return Configuration::get("FEATURE_{$flag}") ?? self::$flags[$flag] ?? false;
    }
}

// En controlador
if (FeatureFlag::isEnabled('new_checkout')) {
    return $this->renderNewCheckout();
}

return $this->renderOldCheckout();
</code></pre>

        <pre><code class="language-yaml"># Feature flags en CI/CD
deploy-production:
  steps:
    - name: Enable feature gradually
      run: |
        # Habilitar para 10% usuarios
        php bin/console feature:enable new_checkout --percentage=10
        
        # Monitor metrics
        sleep 300
        
        # Si OK, habilitar 50%
        php bin/console feature:enable new_checkout --percentage=50
        
        # Si OK, habilitar 100%
        php bin/console feature:enable new_checkout --percentage=100
</code></pre>

        <h2 class="section-title">7. Database Migrations</h2>

        <pre><code class="language-php"><?php
// Migration versioning
// migrations/Version20240115120000.php
class Version20240115120000 extends AbstractMigration
{
    public function up(): void
    {
        $this->addSql('
            ALTER TABLE ps_product 
            ADD COLUMN sustainability_score INT DEFAULT 0
        ');
    }
    
    public function down(): void
    {
        $this->addSql('
            ALTER TABLE ps_product 
            DROP COLUMN sustainability_score
        ');
    }
}
</code></pre>

        <pre><code class="language-yaml"># Migrations en pipeline
deploy:
  steps:
    - name: Backup database
      run: |
        mysqldump prestashop > backup-\$(date +%Y%m%d-%H%M%S).sql
    
    - name: Run migrations
      run: |
        php bin/console migrations:migrate --no-interaction
    
    - name: Verify migrations
      run: |
        php bin/console migrations:status
</code></pre>

        <h2 class="section-title">8. Monitoring y Observabilidad</h2>

        <pre><code class="language-yaml"># Healthcheck endpoint
/health:
  - Database: OK
  - Cache: OK  
  - Queue: OK
  - Disk: 45% used
  - Memory: 2.1GB / 4GB
  - Version: 8.9.1
  - Last deploy: 2024-01-15 10:30:00
</code></pre>

        <pre><code class="language-bash"># Post-deployment monitoring
#!/bin/bash

echo "Monitoring deployment..."

for i in {1..10}; do
    # Check error rate
    ERROR_RATE=\$(curl -s http://metrics/errors | jq '.rate')
    
    if (( \$(echo "\$ERROR_RATE > 1.0" | bc -l) )); then
        echo "❌ Error rate too high: \$ERROR_RATE"
        ./rollback.sh
        exit 1
    fi
    
    # Check response time
    RESPONSE_TIME=\$(curl -o /dev/null -s -w '%{time_total}' http://www.myshop.com/)
    
    if (( \$(echo "\$RESPONSE_TIME > 2.0" | bc -l) )); then
        echo "⚠️ Slow response time: \$RESPONSE_TIME"
    fi
    
    sleep 60
done

echo "✅ Deployment stable"
</code></pre>

        <h2 class="section-title">9. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Continuous Delivery:</strong>
            <ul class="mb-0">
                <li>Pipeline automático hasta staging</li>
                <li>Aprobación manual para producción</li>
                <li>Deploy en horarios de bajo tráfico</li>
                <li>Blue-green o canary deployment</li>
                <li>Rollback automático si métricas degradan</li>
                <li>Feature flags para features grandes</li>
                <li>Database migrations versionadas</li>
                <li>Monitoring y alertas 24/7</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Consideraciones PrestaShop:</strong>
            <ul class="mb-0">
                <li>Nunca deploy en horarios pico de ventas</li>
                <li>Backup BD antes de cada deploy</li>
                <li>Cache clear post-deployment</li>
                <li>Verificar compatibilidad módulos</li>
                <li>Test checkout flow end-to-end</li>
                <li>Monitor cart abandonment rate post-deploy</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>🎯 Métricas CD:</strong>
            <ul class="mb-0">
                <li><strong>Deployment Frequency:</strong> Diario/Semanal</li>
                <li><strong>Lead Time:</strong> < 1 día (commit → producción)</li>
                <li><strong>MTTR:</strong> < 1 hora (Mean Time To Recovery)</li>
                <li><strong>Change Failure Rate:</strong> < 15%</li>
            </ul>
        </div>
    </div>
`;

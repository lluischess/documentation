// @ts-nocheck
const principiosIntegracionContinua = `
    <div class="content-section">
        <h1 id="principios-integracion-continua">Principios de Integración Continua</h1>
        <p>Fundamentos y mejores prácticas de Integración Continua (CI) para proyectos PrestaShop 8.9+ garantizando calidad y estabilidad.</p>

        <h2 class="section-title">1. ¿Qué es Integración Continua?</h2>

        <div class="alert alert-info">
            <strong>🔄 Continuous Integration (CI):</strong>
            <ul class="mb-0">
                <li>Práctica de integrar código frecuentemente (múltiples veces al día)</li>
                <li>Cada integración verificada por build automático</li>
                <li>Tests automáticos detectan errores rápidamente</li>
                <li>Feedback inmediato a desarrolladores</li>
                <li>Reduce riesgos de integración</li>
                <li>Mejora la calidad del software</li>
            </ul>
        </div>

        <h2 class="section-title">2. Principios Fundamentales de CI</h2>

        <h3>2.1. Mantener un Repositorio Único</h3>

        <pre><code class="language-bash"># Repositorio central (Git)
# Todo el código en un solo lugar

# Estructura típica PrestaShop
prestashop-project/
├── modules/
│   └── mymodule/
├── themes/
│   └── mytheme/
├── override/
├── composer.json
├── .gitignore
├── .gitlab-ci.yml  # o .github/workflows/
└── README.md

# Un solo source of truth
git clone https://github.com/company/prestashop-project.git
</code></pre>

        <h3>2.2. Automatizar el Build</h3>

        <pre><code class="language-yaml"># .github/workflows/ci.yml
name: Continuous Integration

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.1'
          extensions: mbstring, intl, gd, xml, zip, mysql
          coverage: xdebug
      
      - name: Validate composer.json
        run: composer validate --strict
      
      - name: Cache Composer dependencies
        uses: actions/cache@v3
        with:
          path: vendor
          key: \${{ runner.os }}-composer-\${{ hashFiles('**/composer.lock') }}
      
      - name: Install dependencies
        run: composer install --prefer-dist --no-progress
      
      - name: Check code style
        run: vendor/bin/phpcs
      
      - name: Static analysis
        run: vendor/bin/phpstan analyse
      
      - name: Run tests
        run: vendor/bin/phpunit --coverage-text
      
      - name: Build success notification
        if: success()
        run: echo "✅ Build completed successfully"
</code></pre>

        <h3>2.3. Hacer el Build Auto-verificable</h3>

        <pre><code class="language-bash"># Script de build auto-verificable
#!/bin/bash
# build.sh

set -e  # Exit on error

echo "🔨 Starting build process..."

# 1. Dependencies
echo "📦 Installing dependencies..."
composer install --no-interaction --prefer-dist

# 2. Code quality
echo "🎨 Checking code style..."
vendor/bin/phpcs || exit 1

# 3. Static analysis
echo "🔍 Running static analysis..."
vendor/bin/phpstan analyse || exit 1

# 4. Tests
echo "🧪 Running tests..."
vendor/bin/phpunit || exit 1

# 5. Build assets
echo "🎨 Building frontend assets..."
npm install
npm run build

echo "✅ Build completed successfully!"
exit 0
</code></pre>

        <h3>2.4. Todos Commitan al Mainline Diariamente</h3>

        <pre><code class="language-markdown">## Workflow diario recomendado

### Mañana
1. Pull latest changes
   \`\`\`bash
   git checkout develop
   git pull origin develop
   \`\`\`

2. Crear feature branch
   \`\`\`bash
   git checkout -b feature/add-payment-gateway
   \`\`\`

3. Desarrollar feature (max 1 día)

### Tarde
4. Commit frecuentes (cada 1-2 horas)
   \`\`\`bash
   git add .
   git commit -m "feat: Add PayPal integration"
   \`\`\`

5. Integrar antes de fin de día
   \`\`\`bash
   git checkout develop
   git pull origin develop
   git merge feature/add-payment-gateway
   git push origin develop
   \`\`\`

### ⚠️ Reglas
- No dejar branches sin integrar > 24h
- Si feature > 1 día, usar feature flags
- Integrar aunque feature incomplete (con tests)
</code></pre>

        <h3>2.5. Cada Commit Build en Máquina de Integración</h3>

        <pre><code class="language-yaml"># Webhook automático en cada push
on:
  push:
    branches: [ develop, main ]

# Trigger build inmediatamente
jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 15  # Fail fast
    
    steps:
      - uses: actions/checkout@v4
      - name: Run CI pipeline
        run: ./build.sh
</code></pre>

        <h3>2.6. Mantener Build Rápido</h3>

        <table>
            <thead>
                <tr>
                    <th>Tiempo Build</th>
                    <th>Estado</th>
                    <th>Acción</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>< 5 min</td>
                    <td>✅ Excelente</td>
                    <td>Mantener</td>
                </tr>
                <tr>
                    <td>5-10 min</td>
                    <td>✅ Bueno</td>
                    <td>Aceptable</td>
                </tr>
                <tr>
                    <td>10-15 min</td>
                    <td>⚠️ Regular</td>
                    <td>Optimizar</td>
                </tr>
                <tr>
                    <td>> 15 min</td>
                    <td>❌ Malo</td>
                    <td>Refactorizar pipeline</td>
                </tr>
            </tbody>
        </table>

        <pre><code class="language-yaml"># Optimización: Paralelizar jobs
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: composer install
      - run: vendor/bin/phpcs
  
  phpstan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: composer install
      - run: vendor/bin/phpstan analyse
  
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: composer install
      - run: vendor/bin/phpunit

# Todos corren en paralelo (3-5 min total vs 15 min secuencial)
</code></pre>

        <h3>2.7. Test en Clon del Ambiente de Producción</h3>

        <pre><code class="language-yaml"># Docker para ambiente idéntico
services:
  php:
    image: php:8.1-fpm-alpine
    volumes:
      - ./:/var/www/html
  
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: prestashop_test
      MYSQL_ROOT_PASSWORD: test
  
  nginx:
    image: nginx:alpine
    volumes:
      - ./:/var/www/html
    ports:
      - "8080:80"

# CI usa mismo docker-compose.yml
# Garantiza paridad dev-test-prod
</code></pre>

        <h3>2.8. Fácil Acceso al Último Ejecutable</h3>

        <pre><code class="language-yaml"># Artifacts en GitHub Actions
- name: Upload build artifacts
  uses: actions/upload-artifact@v3
  with:
    name: prestashop-module-\${{ github.sha }}
    path: |
      modules/mymodule/
      !modules/mymodule/node_modules/
    retention-days: 30

# Download desde GitHub UI o API
# https://github.com/user/repo/actions/runs/123/artifacts
</code></pre>

        <h3>2.9. Todos Ven lo que Está Pasando</h3>

        <pre><code class="language-yaml"># Notificaciones en Slack
- name: Slack notification
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: \${{ job.status }}
    text: |
      Build \${{ job.status }}
      Commit: \${{ github.event.head_commit.message }}
      Author: \${{ github.actor }}
      Branch: \${{ github.ref_name }}
    webhook_url: \${{ secrets.SLACK_WEBHOOK }}

# Dashboard visible en oficina
# Radiador de información (build monitor)
</code></pre>

        <h3>2.10. Automate Deployment</h3>

        <pre><code class="language-yaml"># Auto-deploy a staging en merge a develop
on:
  push:
    branches: [ develop ]

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to staging
        run: |
          rsync -avz --exclude 'node_modules' \\
            ./ user@staging.example.com:/var/www/prestashop/
      
      - name: Run migrations
        run: ssh user@staging.example.com "cd /var/www/prestashop && php bin/console prestashop:update"
</code></pre>

        <h2 class="section-title">3. Pipeline CI Completo PrestaShop</h2>

        <pre><code class="language-yaml"># .github/workflows/ci-complete.yml
name: Complete CI Pipeline

on:
  push:
    branches: [ develop, main ]
  pull_request:
    branches: [ develop, main ]

env:
  PHP_VERSION: '8.1'
  NODE_VERSION: '18'

jobs:
  prepare:
    runs-on: ubuntu-latest
    outputs:
      cache-key: \${{ steps.cache-keys.outputs.composer }}
    
    steps:
      - uses: actions/checkout@v4
      
      - id: cache-keys
        run: |
          echo "composer=\${{ runner.os }}-composer-\${{ hashFiles('**/composer.lock') }}" >> \$GITHUB_OUTPUT

  lint:
    needs: prepare
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: \${{ env.PHP_VERSION }}
      
      - name: Cache dependencies
        uses: actions/cache@v3
        with:
          path: vendor
          key: \${{ needs.prepare.outputs.cache-key }}
      
      - name: Install dependencies
        run: composer install
      
      - name: PHP CodeSniffer
        run: vendor/bin/phpcs --standard=PSR12 modules/
  
  static-analysis:
    needs: prepare
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: \${{ env.PHP_VERSION }}
      
      - name: Cache dependencies
        uses: actions/cache@v3
        with:
          path: vendor
          key: \${{ needs.prepare.outputs.cache-key }}
      
      - name: Install dependencies
        run: composer install
      
      - name: PHPStan
        run: vendor/bin/phpstan analyse --level=6 modules/
  
  test-unit:
    needs: prepare
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: \${{ env.PHP_VERSION }}
          coverage: xdebug
      
      - name: Cache dependencies
        uses: actions/cache@v3
        with:
          path: vendor
          key: \${{ needs.prepare.outputs.cache-key }}
      
      - name: Install dependencies
        run: composer install
      
      - name: PHPUnit
        run: vendor/bin/phpunit --coverage-clover=coverage.xml
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage.xml
  
  test-integration:
    needs: prepare
    runs-on: ubuntu-latest
    
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_DATABASE: prestashop_test
          MYSQL_ROOT_PASSWORD: root
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: \${{ env.PHP_VERSION }}
          extensions: mysql
      
      - name: Install dependencies
        run: composer install
      
      - name: Run integration tests
        env:
          DB_HOST: 127.0.0.1
          DB_NAME: prestashop_test
          DB_USER: root
          DB_PASS: root
        run: vendor/bin/phpunit --testsuite=Integration
  
  build-assets:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build assets
        run: npm run build
      
      - name: Upload assets
        uses: actions/upload-artifact@v3
        with:
          name: built-assets
          path: |
            themes/*/assets/dist/
            modules/*/views/dist/
  
  security-scan:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Security check
        run: |
          composer audit
          npm audit
  
  quality-gate:
    needs: [lint, static-analysis, test-unit, test-integration, build-assets, security-scan]
    runs-on: ubuntu-latest
    
    steps:
      - name: All checks passed
        run: echo "✅ Quality gate passed - Ready to deploy"
</code></pre>

        <h2 class="section-title">4. Beneficios de CI</h2>

        <table>
            <thead>
                <tr>
                    <th>Beneficio</th>
                    <th>Sin CI</th>
                    <th>Con CI</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Detección de bugs</strong></td>
                    <td>Días/semanas</td>
                    <td>Minutos</td>
                </tr>
                <tr>
                    <td><strong>Tiempo de integración</strong></td>
                    <td>Horas/días</td>
                    <td>Automático</td>
                </tr>
                <tr>
                    <td><strong>Confianza en código</strong></td>
                    <td>Baja</td>
                    <td>Alta</td>
                </tr>
                <tr>
                    <td><strong>Frecuencia de releases</strong></td>
                    <td>Mensual</td>
                    <td>Diaria</td>
                </tr>
                <tr>
                    <td><strong>Riesgo de deploy</strong></td>
                    <td>Alto</td>
                    <td>Bajo</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">5. Métricas de CI</h2>

        <pre><code class="language-markdown">## KPIs de Continuous Integration

### Build Health
- **Build Success Rate:** > 95%
- **Build Duration:** < 10 minutos
- **Time to Fix Broken Build:** < 1 hora

### Code Quality
- **Test Coverage:** > 80%
- **Code Review Time:** < 4 horas
- **PR Size:** < 400 LOC

### Integration
- **Commits per Day:** > 1 por desarrollador
- **Branch Lifetime:** < 1 día
- **Merge Conflicts:** < 5% de merges
</code></pre>

        <h2 class="section-title">6. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ CI Efectivo:</strong>
            <ul class="mb-0">
                <li>Commit al menos una vez al día</li>
                <li>Build < 10 minutos</li>
                <li>Tests automáticos completos</li>
                <li>Fix broken builds inmediatamente</li>
                <li>Mantener trunk estable siempre</li>
                <li>Todos ejecutan build localmente antes de commit</li>
                <li>Notificaciones inmediatas de fallos</li>
                <li>Ambiente de CI = ambiente producción</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Antipatrones:</strong>
            <ul class="mb-0">
                <li>Branches de larga duración (> 1 día)</li>
                <li>Ignorar builds rotos</li>
                <li>Skip tests para "ir más rápido"</li>
                <li>Build manual en máquina local del desarrollador</li>
                <li>No tener ambiente de CI dedicado</li>
                <li>Tests flaky (intermitentes)</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>📋 Checklist de CI:</strong>
            <ul class="mb-0">
                <li>[ ] Repositorio central único</li>
                <li>[ ] Build automatizado</li>
                <li>[ ] Build auto-verificable</li>
                <li>[ ] Tests automáticos (unit + integration)</li>
                <li>[ ] Commit diario al mainline</li>
                <li>[ ] Cada commit triggerea build</li>
                <li>[ ] Build rápido (< 10 min)</li>
                <li>[ ] Test en ambiente de producción clonado</li>
                <li>[ ] Artifacts accesibles</li>
                <li>[ ] Visibilidad del estado del build</li>
                <li>[ ] Deploy automático a staging</li>
            </ul>
        </div>
    </div>
`;

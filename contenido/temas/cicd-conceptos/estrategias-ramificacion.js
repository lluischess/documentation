// @ts-nocheck
const estrategiasRamificacion = `
    <div class="content-section">
        <h1 id="estrategias-ramificacion">Estrategias de Ramificación (Gitflow, Trunk-Based Development, Feature Branching)</h1>
        <p>Comparativa y guía de implementación de estrategias de branching para equipos PrestaShop 8.9+ con CI/CD.</p>

        <h2 class="section-title">1. Comparativa de Estrategias</h2>

        <table>
            <thead>
                <tr>
                    <th>Estrategia</th>
                    <th>Complejidad</th>
                    <th>Deploy Frequency</th>
                    <th>Team Size</th>
                    <th>Mejor para</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Gitflow</strong></td>
                    <td>Alta</td>
                    <td>Semanal/Mensual</td>
                    <td>Grande</td>
                    <td>Releases planificados</td>
                </tr>
                <tr>
                    <td><strong>GitHub Flow</strong></td>
                    <td>Baja</td>
                    <td>Diario</td>
                    <td>Pequeño/Medio</td>
                    <td>Continuous Deployment</td>
                </tr>
                <tr>
                    <td><strong>Trunk-Based</strong></td>
                    <td>Muy Baja</td>
                    <td>Múltiple/día</td>
                    <td>Cualquiera</td>
                    <td>CD avanzado</td>
                </tr>
                <tr>
                    <td><strong>GitLab Flow</strong></td>
                    <td>Media</td>
                    <td>Diario/Semanal</td>
                    <td>Medio/Grande</td>
                    <td>Múltiples ambientes</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">2. Gitflow</h2>

        <h3>2.1. Estructura de Branches</h3>

        <pre><code class="language-plaintext">main (producción)
  │
  ├── hotfix/fix-payment-bug
  │
develop (integración)
  │
  ├── release/1.2.0
  │
  ├── feature/add-paypal
  │
  └── feature/new-checkout

Branches principales:
- main: Código en producción
- develop: Código en desarrollo

Branches de soporte:
- feature/*: Nuevas funcionalidades
- release/*: Preparación de releases
- hotfix/*: Fixes urgentes en producción
</code></pre>

        <h3>2.2. Workflow Gitflow</h3>

        <pre><code class="language-bash"># Iniciar feature
git checkout develop
git checkout -b feature/add-paypal

# Desarrollar feature
git add .
git commit -m "feat: add PayPal integration"
git push origin feature/add-paypal

# Merge feature a develop
git checkout develop
git merge --no-ff feature/add-paypal
git push origin develop
git branch -d feature/add-paypal

# Crear release
git checkout develop
git checkout -b release/1.2.0

# Preparar release (versioning, changelog)
# Commit final
git commit -m "chore: prepare release 1.2.0"

# Merge a main
git checkout main
git merge --no-ff release/1.2.0
git tag -a v1.2.0 -m "Release 1.2.0"
git push origin main --tags

# Merge a develop
git checkout develop
git merge --no-ff release/1.2.0
git push origin develop

# Eliminar branch release
git branch -d release/1.2.0

# Hotfix urgente
git checkout main
git checkout -b hotfix/1.2.1

# Fix bug
git commit -m "fix: payment gateway error"

# Merge a main
git checkout main
git merge --no-ff hotfix/1.2.1
git tag -a v1.2.1 -m "Hotfix 1.2.1"
git push origin main --tags

# Merge a develop
git checkout develop
git merge --no-ff hotfix/1.2.1
git push origin develop
</code></pre>

        <h3>2.3. CI/CD con Gitflow</h3>

        <pre><code class="language-yaml"># .github/workflows/gitflow.yml
name: Gitflow CI/CD

on:
  push:
    branches:
      - main
      - develop
      - 'release/**'
      - 'hotfix/**'
  pull_request:
    branches:
      - develop

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: composer install
      - run: vendor/bin/phpunit

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to staging
        run: ./scripts/deploy.sh staging

  deploy-production:
    needs: test
    if: startsWith(github.ref, 'refs/heads/release/') || startsWith(github.ref, 'refs/heads/hotfix/')
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: ./scripts/deploy.sh production
</code></pre>

        <h2 class="section-title">3. GitHub Flow</h2>

        <h3>3.1. Estructura Simple</h3>

        <pre><code class="language-plaintext">main
  │
  ├── feature/add-payment
  │
  ├── fix/checkout-bug
  │
  └── refactor/product-service

Solo 1 branch principal: main
Todas las features salen de main
Merge via Pull Request + review
Deploy automático desde main
</code></pre>

        <h3>3.2. Workflow GitHub Flow</h3>

        <pre><code class="language-bash"># 1. Crear branch desde main
git checkout main
git pull origin main
git checkout -b feature/add-stripe

# 2. Desarrollar y commit
git add .
git commit -m "feat: add Stripe payment integration"
git push origin feature/add-stripe

# 3. Abrir Pull Request en GitHub
# - Descripción clara
# - Screenshots si UI
# - Tests pasando
# - Review de al menos 1 persona

# 4. Después de aprobación, merge a main
# - Squash commits (opcional)
# - Delete branch automático

# 5. Deploy automático
# GitHub Actions detecta push a main
# Deploy a producción
</code></pre>

        <h3>3.3. CI/CD con GitHub Flow</h3>

        <pre><code class="language-yaml"># .github/workflows/github-flow.yml
name: GitHub Flow CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: composer install
      - run: vendor/bin/phpunit
      - run: vendor/bin/phpstan analyse

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to production
        run: ./scripts/deploy.sh production
      
      - name: Notify Slack
        run: |
          curl -X POST \${{ secrets.SLACK_WEBHOOK }} \\
            -d '{"text":"🚀 Deployed to production"}'
</code></pre>

        <h2 class="section-title">4. Trunk-Based Development</h2>

        <h3>4.1. Concepto</h3>

        <pre><code class="language-plaintext">trunk (main)
  │
  ├── short-lived branch (< 1 día)
  │   └── merge rápido
  │
  └── commit directo (con feature flags)

Características:
- 1 branch principal: trunk/main
- Branches muy cortos (< 24h)
- Commits directos al trunk (equipos pequeños)
- Feature flags para funcionalidad incompleta
- CI/CD muy robusto
- Tests automáticos fuertes
</code></pre>

        <h3>4.2. Workflow Trunk-Based</h3>

        <pre><code class="language-bash"># Opción 1: Commit directo (equipos pequeños, alta confianza)
git checkout main
git pull origin main
# Hacer cambios
git add .
git commit -m "feat: add search filter"
git push origin main  # Deploy automático

# Opción 2: Short-lived branch (< 1 día)
git checkout main
git pull origin main
git checkout -b add-filter

# Desarrollar (pocas horas)
git add .
git commit -m "feat: add search filter"
git push origin add-filter

# Pull request inmediato
# Merge en < 4 horas
# Delete branch

# Feature flags para funcionalidad no completa
if (FeatureFlag::isEnabled('new_search')) {
    return $this->newSearchService->search($query);
}
return $this->legacySearch($query);
</code></pre>

        <h3>4.3. Feature Flags</h3>

        <pre><code class="language-php"><?php
// FeatureFlag.php
class FeatureFlag
{
    public static function isEnabled(string $feature): bool
    {
        // Desde BD/config
        $flags = [
            'new_checkout' => true,
            'new_search' => false,  // En desarrollo
            'ai_recommendations' => false,
        ];
        
        return $flags[$feature] ?? false;
    }
    
    public static function isEnabledForUser(string $feature, int $userId): bool
    {
        // Gradual rollout: 10% de usuarios
        return (crc32($feature . $userId) % 100) < 10;
    }
}

// Uso en código
if (FeatureFlag::isEnabled('new_checkout')) {
    // Código nuevo (en desarrollo)
    return $this->newCheckoutService->process();
}

// Código existente (estable)
return $this->legacyCheckout();
</code></pre>

        <h2 class="section-title">5. GitLab Flow</h2>

        <h3>5.1. Estructura con Environments</h3>

        <pre><code class="language-plaintext">main
  │
  ├── staging  (auto-deploy)
  │
  ├── pre-production  (manual approval)
  │
  └── production  (manual approval)

Feature branches → main → staging → pre-prod → prod
</code></pre>

        <h3>5.2. Workflow GitLab Flow</h3>

        <pre><code class="language-bash"># 1. Feature branch
git checkout -b feature/new-payment
git commit -m "feat: add payment gateway"
git push origin feature/new-payment

# 2. Merge request a main
# Tests automáticos
# Code review
# Merge a main

# 3. main → staging (automático)
git checkout staging
git merge main
git push origin staging
# Auto-deploy a staging

# 4. staging → pre-production (manual)
# QA testing en staging
git checkout pre-production
git merge staging
git push origin pre-production

# 5. pre-production → production (manual approval)
git checkout production
git merge pre-production
git push origin production
</code></pre>

        <h2 class="section-title">6. Recomendación por Tipo de Proyecto</h2>

        <table>
            <thead>
                <tr>
                    <th>Proyecto</th>
                    <th>Estrategia</th>
                    <th>Razón</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>E-commerce (PrestaShop)</td>
                    <td>GitHub Flow o GitLab Flow</td>
                    <td>Balance entre velocidad y control</td>
                </tr>
                <tr>
                    <td>SaaS startup</td>
                    <td>Trunk-Based + Feature Flags</td>
                    <td>Deploy múltiple/día</td>
                </tr>
                <tr>
                    <td>Empresa grande</td>
                    <td>Gitflow</td>
                    <td>Releases planificados, múltiples ambientes</td>
                </tr>
                <tr>
                    <td>Open Source</td>
                    <td>GitHub Flow</td>
                    <td>Simple para contributors</td>
                </tr>
                <tr>
                    <td>Equipo pequeño experto</td>
                    <td>Trunk-Based</td>
                    <td>Máxima velocidad</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">7. Branch Protection Rules</h2>

        <pre><code class="language-yaml"># GitHub - Configuración en Settings → Branches

main:
  - Require pull request before merging
    - Required approvals: 2
    - Dismiss stale reviews
  - Require status checks to pass
    - CI tests
    - PHPStan
    - PHPCS
  - Require branches to be up to date
  - Include administrators: No
  - Allow force pushes: No
  - Allow deletions: No

develop:
  - Require pull request before merging
    - Required approvals: 1
  - Require status checks to pass
  - Allow force pushes: No
</code></pre>

        <h2 class="section-title">8. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Branching Efectivo:</strong>
            <ul class="mb-0">
                <li>Elegir estrategia según tamaño de equipo</li>
                <li>Branches cortas (< 1-2 días idealmente)</li>
                <li>Commits frecuentes y pequeños</li>
                <li>Pull requests con descripción clara</li>
                <li>Code review obligatorio</li>
                <li>CI/CD automatizado en todas las branches</li>
                <li>Branch protection en main/develop</li>
                <li>Feature flags para features largas</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Evitar:</strong>
            <ul class="mb-0">
                <li>Branches de larga duración (> 1 semana)</li>
                <li>Merge conflicts frecuentes</li>
                <li>Commits masivos (> 500 LOC)</li>
                <li>Skip CI checks</li>
                <li>Merge sin review</li>
                <li>Estrategia inconsistente en equipo</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>🎯 Para PrestaShop:</strong>
            <ul class="mb-0">
                <li><strong>Pequeño equipo (1-3):</strong> GitHub Flow</li>
                <li><strong>Equipo medio (4-10):</strong> GitLab Flow</li>
                <li><strong>Equipo grande (10+):</strong> Gitflow</li>
                <li><strong>Múltiples clientes:</strong> Gitflow con release branches</li>
            </ul>
        </div>
    </div>
`;

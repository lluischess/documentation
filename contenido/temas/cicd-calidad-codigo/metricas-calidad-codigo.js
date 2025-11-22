// @ts-nocheck
const metricasCalidadCodigo = `
    <div class="content-section">
        <h1 id="metricas-calidad-codigo">Métricas de Calidad de Código</h1>
        <p>Medición y seguimiento de métricas clave para evaluar y mejorar la calidad del código en proyectos PrestaShop 8.9+.</p>

        <h2 class="section-title">1. Categorías de Métricas</h2>

        <table>
            <thead>
                <tr>
                    <th>Categoría</th>
                    <th>Métricas</th>
                    <th>Objetivo</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Mantenibilidad</strong></td>
                    <td>MI, CC, Acoplamiento</td>
                    <td>Facilidad de cambios</td>
                </tr>
                <tr>
                    <td><strong>Confiabilidad</strong></td>
                    <td>Test coverage, defects</td>
                    <td>Estabilidad</td>
                </tr>
                <tr>
                    <td><strong>Seguridad</strong></td>
                    <td>Vulnerabilities, code smells</td>
                    <td>Protección</td>
                </tr>
                <tr>
                    <td><strong>Performance</strong></td>
                    <td>Tiempo respuesta, queries</td>
                    <td>Velocidad</td>
                </tr>
                <tr>
                    <td><strong>Tamaño</strong></td>
                    <td>LOC, archivos, clases</td>
                    <td>Complejidad proyecto</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">2. Métricas Fundamentales</h2>

        <h3>2.1. Líneas de Código (LOC)</h3>

        <pre><code class="language-bash"># Usando phploc
vendor/bin/phploc modules/mymodule

# Output:
Size
  Lines of Code (LOC)                        5432
  Comment Lines of Code (CLOC)                892
  Non-Comment Lines of Code (NCLOC)         4540
  Logical Lines of Code (LLOC)              1245
  
  Classes                                     45
  Methods                                    234
  Functions                                   12
</code></pre>

        <h3>2.2. Complejidad Ciclomática</h3>

        <pre><code class="language-plaintext">Complejidad Ciclomática (CC):
- Proyecto: CC promedio < 5
- Clase: CC promedio < 3
- Método: CC < 10

Medición:
vendor/bin/phpmd modules/mymodule text codesize
vendor/bin/phpmetrics modules/mymodule
</code></pre>

        <h3>2.3. Maintainability Index (MI)</h3>

        <pre><code class="language-plaintext">MI = 171 - 5.2 * ln(HV) - 0.23 * CC - 16.2 * ln(LOC)

Escala:
- 100-85: Excelente (verde)
- 84-65: Buena (amarillo)
- 64-50: Regular (naranja)
- < 50: Mala (rojo) - Refactorizar urgente

Objetivo: MI > 65 para todo el código
</code></pre>

        <h3>2.4. Code Coverage</h3>

        <pre><code class="language-bash"># PHPUnit con cobertura
vendor/bin/phpunit --coverage-html reports/coverage

# Output:
Code Coverage Report:
  Lines:   85.32% (2341/2744)
  Functions: 89.45% (156/174)
  Classes:  92.11% (35/38)
</code></pre>

        <h3>2.5. Acoplamiento (Coupling)</h3>

        <pre><code class="language-plaintext">Afferent Coupling (Ca): Clases que dependen de esta
Efferent Coupling (Ce): Clases de las que depende esta

Instability (I) = Ce / (Ca + Ce)
- 0 = Estable (muchas dependientes)
- 1 = Inestable (muchas dependencias)

Objetivo: I entre 0.3 y 0.7
</code></pre>

        <h2 class="section-title">3. Herramientas de Medición</h2>

        <h3>3.1. PHP Metrics (Completo)</h3>

        <pre><code class="language-bash"># Instalar
composer require --dev phpmetrics/phpmetrics

# Generar reporte
vendor/bin/phpmetrics \\
  --report-html=reports/metrics \\
  --report-json=reports/metrics.json \\
  modules/mymodule

# Ver dashboard
open reports/metrics/index.html
</code></pre>

        <h3>3.2. SonarQube (Empresarial)</h3>

        <pre><code class="language-bash"># Docker
docker run -d --name sonarqube -p 9000:9000 sonarqube:lts

# Scanner
docker run --rm \\
  -e SONAR_HOST_URL="http://localhost:9000" \\
  -v "\$(pwd):/usr/src" \\
  sonarsource/sonar-scanner-cli

# sonar-project.properties
sonar.projectKey=prestashop-module
sonar.sources=modules/mymodule
sonar.php.coverage.reportPaths=reports/coverage/clover.xml
sonar.php.tests.reportPath=reports/junit.xml
</code></pre>

        <h3>3.3. Code Climate</h3>

        <pre><code class="language-yaml"># .codeclimate.yml
version: "2"

plugins:
  phpcodesniffer:
    enabled: true
    config:
      standard: "PSR12"
  
  phpmd:
    enabled: true
    config:
      rulesets: "codesize,unusedcode,naming"
  
  duplication:
    enabled: true
    config:
      languages:
        php:
          mass_threshold: 50

exclude_patterns:
  - "vendor/"
  - "tests/"
</code></pre>

        <h2 class="section-title">4. Métricas Específicas PrestaShop</h2>

        <h3>4.1. Módulo PrestaShop</h3>

        <pre><code class="language-php"><?php
// Métricas de un módulo PrestaShop
class ModuleMetrics
{
    public static function calculate(string $modulePath): array
    {
        return [
            // Tamaño
            'files' => self::countFiles($modulePath),
            'classes' => self::countClasses($modulePath),
            'methods' => self::countMethods($modulePath),
            'loc' => self::countLOC($modulePath),
            
            // Complejidad
            'avg_complexity' => self::avgComplexity($modulePath),
            'max_complexity' => self::maxComplexity($modulePath),
            
            // Hooks
            'hooks_registered' => self::countHooks($modulePath),
            'hooks_used' => self::countHookUsage($modulePath),
            
            // Tests
            'test_coverage' => self::testCoverage($modulePath),
            'test_count' => self::countTests($modulePath),
            
            // Database
            'db_tables' => self::countDbTables($modulePath),
            'queries' => self::countQueries($modulePath),
        ];
    }
}
</code></pre>

        <h3>4.2. Dashboard de Métricas</h3>

        <pre><code class="language-json">{
  "project": "MyModule",
  "version": "1.2.0",
  "date": "2024-01-15",
  "metrics": {
    "size": {
      "files": 45,
      "classes": 28,
      "methods": 234,
      "loc": 5432,
      "cloc": 892
    },
    "complexity": {
      "average": 3.2,
      "maximum": 12,
      "methods_over_10": 3
    },
    "quality": {
      "maintainability_index": 72.5,
      "test_coverage": 85.3,
      "code_smells": 8,
      "bugs": 2,
      "vulnerabilities": 0
    },
    "prestashop": {
      "hooks_registered": 15,
      "db_tables": 3,
      "overrides": 2,
      "templates": 12
    }
  }
}
</code></pre>

        <h2 class="section-title">5. Technical Debt</h2>

        <h3>5.1. Cálculo de Deuda Técnica</h3>

        <pre><code class="language-plaintext">Technical Debt = Tiempo para arreglar todos los code smells

Fórmula SonarQube:
Debt = Σ(code_smell * tiempo_remediation)

Ejemplo:
- 10 code smells mayores × 1h = 10h
- 25 code smells menores × 15min = 6.25h
- Total: 16.25h = 2 días

Debt Ratio = (Debt / Development Time) × 100
Objetivo: < 5%
</code></pre>

        <h3>5.2. SQALE Rating</h3>

        <table>
            <thead>
                <tr>
                    <th>Rating</th>
                    <th>Debt Ratio</th>
                    <th>Descripción</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>A</strong></td>
                    <td>< 5%</td>
                    <td>Excelente</td>
                </tr>
                <tr>
                    <td><strong>B</strong></td>
                    <td>5-10%</td>
                    <td>Buena</td>
                </tr>
                <tr>
                    <td><strong>C</strong></td>
                    <td>10-20%</td>
                    <td>Regular</td>
                </tr>
                <tr>
                    <td><strong>D</strong></td>
                    <td>20-50%</td>
                    <td>Mala</td>
                </tr>
                <tr>
                    <td><strong>E</strong></td>
                    <td>> 50%</td>
                    <td>Crítica</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">6. Badges y Visualización</h2>

        <pre><code class="language-markdown"># README.md con badges

# My PrestaShop Module

![Build](https://github.com/user/repo/workflows/CI/badge.svg)
![Coverage](https://codecov.io/gh/user/repo/branch/main/graph/badge.svg)
![Quality](https://sonarcloud.io/api/project_badges/measure?project=key&metric=alert_status)
![Maintainability](https://api.codeclimate.com/v1/badges/xxx/maintainability)
![Version](https://img.shields.io/badge/version-1.2.0-blue)
![PHP](https://img.shields.io/badge/php-8.1%2B-purple)

## Métricas de Calidad

| Métrica | Valor | Objetivo |
|---------|-------|----------|
| Test Coverage | 85% | > 80% |
| Maintainability | A | A |
| Complexity | 3.2 | < 5 |
| Technical Debt | 1.2 days | < 5% |
</code></pre>

        <h2 class="section-title">7. Tracking de Métricas en CI/CD</h2>

        <pre><code class="language-yaml"># .github/workflows/metrics.yml
name: Code Metrics

on:
  push:
    branches: [ main ]
  pull_request:

jobs:
  metrics:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Histórico completo
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.1'
          coverage: xdebug
      
      - name: Install dependencies
        run: composer install
      
      - name: Run tests with coverage
        run: vendor/bin/phpunit --coverage-clover=coverage.xml
      
      - name: Upload to Codecov
        uses: codecov/codecov-action@v3
      
      - name: PHP Metrics
        run: |
          vendor/bin/phpmetrics \\
            --report-html=reports/metrics \\
            --report-json=reports/metrics.json \\
            modules/mymodule
      
      - name: Extract metrics
        run: |
          MAINTAINABILITY=\$(cat reports/metrics.json | jq '.average.maintainabilityIndex')
          COMPLEXITY=\$(cat reports/metrics.json | jq '.average.cyclomaticComplexity')
          
          echo "Maintainability Index: \$MAINTAINABILITY"
          echo "Avg Complexity: \$COMPLEXITY"
          
          # Verificar umbrales
          if (( \$(echo "\$MAINTAINABILITY < 65" | bc -l) )); then
            echo "❌ Maintainability below threshold"
            exit 1
          fi
          
          if (( \$(echo "\$COMPLEXITY > 10" | bc -l) )); then
            echo "❌ Complexity above threshold"
            exit 1
          fi
      
      - name: Comment PR with metrics
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const metrics = JSON.parse(fs.readFileSync('reports/metrics.json'));
            
            const body = \`## 📊 Code Metrics
            
            | Métrica | Valor | Status |
            |---------|-------|--------|
            | Maintainability Index | \${metrics.average.maintainabilityIndex.toFixed(1)} | \${metrics.average.maintainabilityIndex > 65 ? '✅' : '❌'} |
            | Avg Complexity | \${metrics.average.cyclomaticComplexity.toFixed(1)} | \${metrics.average.cyclomaticComplexity < 10 ? '✅' : '❌'} |
            | LOC | \${metrics.nbClasses} classes, \${metrics.nbMethods} methods | ℹ️ |
            \`;
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body
            });
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: metrics-reports
          path: reports/
</code></pre>

        <h2 class="section-title">8. Objetivos de Calidad (Quality Gates)</h2>

        <pre><code class="language-yaml"># sonar-project.properties
sonar.qualitygate.wait=true

# Quality Gate Conditions:
sonar.qualitygate.conditions:
  - metric: coverage
    operator: LT
    error: 80
  
  - metric: duplicated_lines_density
    operator: GT
    error: 3
  
  - metric: code_smells
    operator: GT
    error: 0
  
  - metric: bugs
    operator: GT
    error: 0
  
  - metric: vulnerabilities
    operator: GT
    error: 0
  
  - metric: security_rating
    operator: GT
    error: A
  
  - metric: sqale_rating
    operator: GT
    error: A
</code></pre>

        <h2 class="section-title">9. Reporte de Métricas</h2>

        <pre><code class="language-bash">#!/bin/bash
# generate-metrics-report.sh

echo "📊 Generando reporte de métricas..."

# Directorio de reportes
mkdir -p reports

# PHPLoc
vendor/bin/phploc \\
  --log-json=reports/phploc.json \\
  modules/mymodule

# PHPMD
vendor/bin/phpmd modules/mymodule json codesize,unusedcode \\
  > reports/phpmd.json

# PHP Metrics
vendor/bin/phpmetrics \\
  --report-html=reports/metrics \\
  --report-json=reports/metrics.json \\
  modules/mymodule

# Coverage
vendor/bin/phpunit --coverage-clover=reports/coverage.xml

# Generar resumen
cat << EOF > reports/summary.md
# Code Quality Report
Date: \$(date +%Y-%m-%d)

## Size Metrics
\$(cat reports/phploc.json | jq -r '
  "- LOC: " + (.loc|tostring) +
  "\\n- Classes: " + (.classes|tostring) +
  "\\n- Methods: " + (.methods|tostring)
')

## Complexity
\$(cat reports/metrics.json | jq -r '
  "- Avg Complexity: " + (.average.cyclomaticComplexity|tostring) +
  "\\n- Max Complexity: " + (.max.cyclomaticComplexity|tostring) +
  "\\n- Maintainability: " + (.average.maintainabilityIndex|tostring)
')

## Coverage
\$(php -r "
  \\$xml = simplexml_load_file('reports/coverage.xml');
  \\$metrics = \\$xml->project->metrics;
  echo '- Line Coverage: ' . round((\\$metrics['coveredstatements'] / \\$metrics['statements']) * 100, 2) . '%';
")
EOF

echo "✅ Reporte generado en reports/"
echo "📄 Ver: reports/summary.md"
echo "🌐 Dashboard: reports/metrics/index.html"
</code></pre>

        <h2 class="section-title">10. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Métricas de Calidad:</strong>
            <ul class="mb-0">
                <li>Medir regularmente (CI/CD)</li>
                <li>Definir umbrales claros (quality gates)</li>
                <li>Tracking histórico (tendencias)</li>
                <li>Dashboard visible para equipo</li>
                <li>Automatizar recolección</li>
                <li>Revisar en retrospectivas</li>
                <li>Priorizar mejoras por ROI</li>
                <li>No obsesionarse con 100% en todo</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Antipatrones:</strong>
            <ul class="mb-0">
                <li>Medir por medir (vanity metrics)</li>
                <li>Umbrales irrealistas</li>
                <li>Gaming the metrics</li>
                <li>Ignorar contexto de negocio</li>
                <li>Métricas sin acción</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>🎯 Objetivos Recomendados:</strong>
            <ul class="mb-0">
                <li><strong>Coverage:</strong> > 80%</li>
                <li><strong>MI:</strong> > 65</li>
                <li><strong>CC promedio:</strong> < 5</li>
                <li><strong>Technical Debt:</strong> < 5%</li>
                <li><strong>Duplicación:</strong> < 3%</li>
                <li><strong>Bugs:</strong> 0</li>
                <li><strong>Vulnerabilities:</strong> 0</li>
            </ul>
        </div>
    </div>
`;

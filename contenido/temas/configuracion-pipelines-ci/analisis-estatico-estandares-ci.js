// @ts-nocheck
const analisisEstaticoEstandaresCI = `
    <div class="content-section">
        <h1 id="analisis-estatico-estandares-ci">Análisis Estático de Código y Verificación de Estándares en CI</h1>
        <p>Integración de PHPStan, PHPCS y otras herramientas de análisis estático en pipelines CI/CD para PrestaShop 8.9+.</p>

        <h2 class="section-title">1. GitHub Actions - Quality Checks</h2>

        <pre><code class="language-yaml"># .github/workflows/quality.yml
name: Code Quality

on: [push, pull_request]

jobs:
  phpcs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: shivammathur/setup-php@v2
        with:
          php-version: '8.1'
          tools: cs2pr
      
      - run: composer install
      - name: PHPCS
        run: vendor/bin/phpcs --report=checkstyle | cs2pr

  phpstan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: shivammathur/setup-php@v2
        with:
          php-version: '8.1'
      
      - run: composer install
      - name: PHPStan
        run: vendor/bin/phpstan analyse --error-format=github --no-progress

  phpmd:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: shivammathur/setup-php@v2
      - run: composer install
      - run: vendor/bin/phpmd src/ github codesize,unusedcode
</code></pre>

        <h2 class="section-title">2. GitLab CI - Quality Stage</h2>

        <pre><code class="language-yaml"># .gitlab-ci.yml
stages:
  - quality
  - test

phpcs:
  stage: quality
  script:
    - composer install
    - vendor/bin/phpcs --standard=PSR12 --report=gitlab src/
  artifacts:
    reports:
      codequality: phpcs-report.json

phpstan:
  stage: quality
  script:
    - composer install
    - vendor/bin/phpstan analyse --level=6 --error-format=gitlab src/
  artifacts:
    reports:
      codequality: phpstan-report.json
</code></pre>

        <h2 class="section-title">3. Pre-commit Hook</h2>

        <pre><code class="language-bash"># .git/hooks/pre-commit
#!/bin/bash

echo "Running quality checks..."

# PHPCS
vendor/bin/phpcs --standard=PSR12 src/
if [ \$? -ne 0 ]; then
    echo "❌ PHPCS failed"
    exit 1
fi

# PHPStan
vendor/bin/phpstan analyse --level=6 src/
if [ \$? -ne 0 ]; then
    echo "❌ PHPStan failed"
    exit 1
fi

echo "✅ Quality checks passed"
</code></pre>

        <h2 class="section-title">4. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Análisis Estático:</strong>
            <ul class="mb-0">
                <li>PHPCS con PSR-12 obligatorio</li>
                <li>PHPStan nivel 6+ para código nuevo</li>
                <li>Parallel jobs para velocidad</li>
                <li>Reportes integrados en GitHub/GitLab</li>
                <li>Pre-commit hooks locales</li>
            </ul>
        </div>
    </div>
`;

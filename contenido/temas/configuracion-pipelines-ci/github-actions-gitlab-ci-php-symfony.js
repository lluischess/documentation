// @ts-nocheck
const githubActionsGitlabCIPHPSymfony = `
    <div class="content-section">
        <h1 id="github-actions-gitlab-ci-php-symfony">Configuración de GitHub Actions/GitLab CI para Proyectos PHP/Symfony</h1>
        <p>Guía completa de configuración de pipelines CI/CD para proyectos PHP, Symfony y PrestaShop 8.9+ en GitHub Actions y GitLab CI.</p>

        <h2 class="section-title">1. GitHub Actions - Pipeline Completo PHP</h2>

        <pre><code class="language-yaml"># .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
  schedule:
    - cron: '0 2 * * 1'  # Weekly on Monday 2am

env:
  PHP_VERSION: '8.1'
  PHP_EXTENSIONS: mbstring, intl, gd, xml, zip, mysql, pdo_mysql, opcache
  PHP_INI_VALUES: memory_limit=256M, max_execution_time=180

jobs:
  validate:
    name: Validate Composer
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: \${{ env.PHP_VERSION }}
          extensions: \${{ env.PHP_EXTENSIONS }}
          ini-values: \${{ env.PHP_INI_VALUES }}
          coverage: none
      
      - name: Validate composer.json
        run: composer validate --strict --no-check-lock
      
      - name: Check composer.lock
        run: composer validate --no-check-all --check-lock

  dependencies:
    name: Install Dependencies
    runs-on: ubuntu-latest
    needs: validate
    
    strategy:
      matrix:
        dependencies: [lowest, highest]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: \${{ env.PHP_VERSION }}
          extensions: \${{ env.PHP_EXTENSIONS }}
          coverage: none
      
      - name: Get Composer cache directory
        id: composer-cache
        run: echo "dir=\$(composer config cache-files-dir)" >> \$GITHUB_OUTPUT
      
      - name: Cache dependencies
        uses: actions/cache@v3
        with:
          path: \${{ steps.composer-cache.outputs.dir }}
          key: \${{ runner.os }}-composer-\${{ matrix.dependencies }}-\${{ hashFiles('**/composer.lock') }}
          restore-keys: \${{ runner.os }}-composer-\${{ matrix.dependencies }}-
      
      - name: Install dependencies (lowest)
        if: matrix.dependencies == 'lowest'
        run: composer update --prefer-lowest --prefer-stable --no-interaction
      
      - name: Install dependencies (highest)
        if: matrix.dependencies == 'highest'
        run: composer install --prefer-dist --no-interaction
      
      - name: Show installed packages
        run: composer show

  coding-standards:
    name: Coding Standards
    runs-on: ubuntu-latest
    needs: dependencies
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: \${{ env.PHP_VERSION }}
          extensions: \${{ env.PHP_EXTENSIONS }}
          tools: cs2pr
          coverage: none
      
      - name: Cache dependencies
        uses: actions/cache@v3
        with:
          path: vendor
          key: \${{ runner.os }}-composer-highest-\${{ hashFiles('**/composer.lock') }}
      
      - run: composer install --no-interaction
      
      - name: PHP CodeSniffer
        run: vendor/bin/phpcs --report=checkstyle | cs2pr

  static-analysis:
    name: Static Analysis
    runs-on: ubuntu-latest
    needs: dependencies
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: \${{ env.PHP_VERSION }}
          extensions: \${{ env.PHP_EXTENSIONS }}
          coverage: none
      
      - name: Cache dependencies
        uses: actions/cache@v3
        with:
          path: vendor
          key: \${{ runner.os }}-composer-highest-\${{ hashFiles('**/composer.lock') }}
      
      - run: composer install --no-interaction
      
      - name: PHPStan
        run: vendor/bin/phpstan analyse --error-format=github --no-progress

  tests:
    name: Tests PHP \${{ matrix.php }}
    runs-on: ubuntu-latest
    needs: dependencies
    
    strategy:
      fail-fast: false
      matrix:
        php: ['8.1', '8.2', '8.3']
        include:
          - php: '8.1'
            coverage: xdebug
    
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: prestashop_test
        ports:
          - 3306:3306
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
          php-version: \${{ matrix.php }}
          extensions: \${{ env.PHP_EXTENSIONS }}
          coverage: \${{ matrix.coverage || 'none' }}
      
      - name: Cache dependencies
        uses: actions/cache@v3
        with:
          path: vendor
          key: \${{ runner.os }}-php\${{ matrix.php }}-composer-\${{ hashFiles('**/composer.lock') }}
      
      - run: composer install --no-interaction
      
      - name: Run tests
        run: vendor/bin/phpunit --testdox
        env:
          DB_HOST: 127.0.0.1
          DB_PORT: 3306
          DB_DATABASE: prestashop_test
          DB_USERNAME: root
          DB_PASSWORD: root
      
      - name: Generate coverage
        if: matrix.coverage == 'xdebug'
        run: vendor/bin/phpunit --coverage-clover=coverage.xml
      
      - name: Upload to Codecov
        if: matrix.coverage == 'xdebug'
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage.xml
          flags: php\${{ matrix.php }}
</code></pre>

        <h2 class="section-title">2. GitHub Actions - Pipeline Symfony</h2>

        <pre><code class="language-yaml"># .github/workflows/symfony.yml
name: Symfony CI

on: [push, pull_request]

jobs:
  symfony:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        php: ['8.1', '8.2']
        symfony: ['6.4.*', '7.0.*']
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: \${{ matrix.php }}
          extensions: mbstring, intl, pdo_mysql
          tools: symfony-cli
      
      - name: Install dependencies
        run: |
          composer require "symfony/symfony:\${{ matrix.symfony }}" --no-update
          composer install --prefer-dist --no-interaction
      
      - name: Symfony Check
        run: symfony check:requirements
      
      - name: Lint YAML
        run: symfony console lint:yaml config
      
      - name: Lint Twig
        run: symfony console lint:twig templates
      
      - name: Lint Container
        run: symfony console lint:container
      
      - name: Doctrine Schema Validate
        run: symfony console doctrine:schema:validate --skip-sync
      
      - name: PHPUnit
        run: php bin/phpunit
</code></pre>

        <h2 class="section-title">3. GitLab CI - Pipeline Completo</h2>

        <pre><code class="language-yaml"># .gitlab-ci.yml
image: php:8.1-cli

variables:
  MYSQL_ROOT_PASSWORD: root
  MYSQL_DATABASE: prestashop_test
  COMPOSER_CACHE_DIR: "\$CI_PROJECT_DIR/.composer-cache"

cache:
  key: \$CI_COMMIT_REF_SLUG
  paths:
    - vendor/
    - .composer-cache/

stages:
  - validate
  - build
  - test
  - quality
  - deploy

before_script:
  - apt-get update -qq && apt-get install -y -qq git unzip
  - curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
  - docker-php-ext-install pdo_mysql

# Validate
validate:composer:
  stage: validate
  script:
    - composer validate --strict --no-check-lock
  only:
    - merge_requests
    - main

# Build
build:dependencies:
  stage: build
  script:
    - composer install --prefer-dist --no-progress --no-interaction
  artifacts:
    paths:
      - vendor/
    expire_in: 1 day

# Tests
test:phpunit:
  stage: test
  services:
    - mysql:8.0
  dependencies:
    - build:dependencies
  script:
    - cp .env.test .env
    - php bin/console doctrine:database:create --env=test
    - php bin/console doctrine:schema:create --env=test
    - vendor/bin/phpunit --coverage-text --colors=never
  coverage: '/^\s*Lines:\s*\d+.\d+\%/'
  artifacts:
    when: always
    reports:
      junit: build/logs/junit.xml
      coverage_report:
        coverage_format: cobertura
        path: build/logs/cobertura.xml

test:php81:
  extends: test:phpunit
  image: php:8.1-cli

test:php82:
  extends: test:phpunit
  image: php:8.2-cli

# Quality
quality:phpcs:
  stage: quality
  dependencies:
    - build:dependencies
  script:
    - vendor/bin/phpcs --standard=PSR12 --report=gitlab src/
  artifacts:
    reports:
      codequality: phpcs-report.json

quality:phpstan:
  stage: quality
  dependencies:
    - build:dependencies
  script:
    - vendor/bin/phpstan analyse --level=6 --error-format=gitlab src/
  artifacts:
    reports:
      codequality: phpstan-report.json

quality:phpmd:
  stage: quality
  dependencies:
    - build:dependencies
  script:
    - vendor/bin/phpmd src/ text codesize,unusedcode
  allow_failure: true

# Deploy
deploy:staging:
  stage: deploy
  environment:
    name: staging
    url: https://staging.myshop.com
  script:
    - echo "Deploying to staging..."
    - rsync -avz --delete ./ user@staging:/var/www/
    - ssh user@staging "cd /var/www && composer install --no-dev --optimize-autoloader"
    - ssh user@staging "cd /var/www && php bin/console cache:clear --env=prod"
  only:
    - develop

deploy:production:
  stage: deploy
  environment:
    name: production
    url: https://www.myshop.com
  script:
    - echo "Deploying to production..."
    - rsync -avz --delete ./ user@prod:/var/www/
    - ssh user@prod "cd /var/www && composer install --no-dev --optimize-autoloader"
    - ssh user@prod "cd /var/www && php bin/console cache:clear --env=prod"
  when: manual
  only:
    - main
</code></pre>

        <h2 class="section-title">4. Matrix Strategy - Múltiples Versiones</h2>

        <pre><code class="language-yaml"># GitHub Actions - Matrix completo
jobs:
  test:
    runs-on: \${{ matrix.os }}
    
    strategy:
      fail-fast: false
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        php: ['8.1', '8.2', '8.3']
        dependencies: [lowest, highest]
        exclude:
          - os: windows-latest
            php: '8.3'
        include:
          - os: ubuntu-latest
            php: '8.1'
            coverage: xdebug
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: \${{ matrix.php }}
          coverage: \${{ matrix.coverage || 'none' }}
      
      - name: Install dependencies
        run: |
          if [ "\${{ matrix.dependencies }}" == "lowest" ]; then
            composer update --prefer-lowest --prefer-stable
          else
            composer install
          fi
        shell: bash
      
      - run: vendor/bin/phpunit
</code></pre>

        <h2 class="section-title">5. Optimización de Cache</h2>

        <h3>5.1. GitHub Actions Cache</h3>

        <pre><code class="language-yaml"># Cache optimizado
- name: Get Composer cache directory
  id: composer-cache
  run: echo "dir=\$(composer config cache-files-dir)" >> \$GITHUB_OUTPUT

- name: Cache Composer dependencies
  uses: actions/cache@v3
  with:
    path: \${{ steps.composer-cache.outputs.dir }}
    key: \${{ runner.os }}-composer-\${{ hashFiles('**/composer.lock') }}
    restore-keys: |
      \${{ runner.os }}-composer-

- name: Cache Symfony cache
  uses: actions/cache@v3
  with:
    path: var/cache
    key: \${{ runner.os }}-symfony-cache-\${{ github.sha }}
    restore-keys: |
      \${{ runner.os }}-symfony-cache-
</code></pre>

        <h3>5.2. GitLab CI Cache</h3>

        <pre><code class="language-yaml"># Cache global
cache:
  key: \${CI_COMMIT_REF_SLUG}
  paths:
    - vendor/
    - .composer-cache/

# Cache por job
job_name:
  cache:
    key: \$CI_JOB_NAME
    paths:
      - vendor/
    policy: pull-push  # pull, push, pull-push
</code></pre>

        <h2 class="section-title">6. Artifacts y Reports</h2>

        <pre><code class="language-yaml"># GitHub Actions
- name: Upload artifacts
  uses: actions/upload-artifact@v3
  with:
    name: test-results
    path: |
      build/logs/
      build/coverage/
    retention-days: 30

# GitLab CI
artifacts:
  paths:
    - build/logs/
    - build/coverage/
  expire_in: 30 days
  reports:
    junit: build/logs/junit.xml
    coverage_report:
      coverage_format: cobertura
      path: build/logs/cobertura.xml
</code></pre>

        <h2 class="section-title">7. Reusable Workflows (GitHub Actions)</h2>

        <pre><code class="language-yaml"># .github/workflows/reusable-php-test.yml
name: Reusable PHP Test

on:
  workflow_call:
    inputs:
      php-version:
        required: true
        type: string
      run-coverage:
        required: false
        type: boolean
        default: false

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: \${{ inputs.php-version }}
          coverage: \${{ inputs.run-coverage && 'xdebug' || 'none' }}
      
      - run: composer install
      - run: vendor/bin/phpunit

# .github/workflows/ci.yml
jobs:
  test-php81:
    uses: ./.github/workflows/reusable-php-test.yml
    with:
      php-version: '8.1'
      run-coverage: true
  
  test-php82:
    uses: ./.github/workflows/reusable-php-test.yml
    with:
      php-version: '8.2'
</code></pre>

        <h2 class="section-title">8. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Pipelines Efectivos:</strong>
            <ul class="mb-0">
                <li>Cache de dependencias (vendor/)</li>
                <li>Matrix para múltiples versiones PHP</li>
                <li>fail-fast: false para ver todos los errores</li>
                <li>Services para BD (MySQL, Redis)</li>
                <li>Artifacts con retention policy</li>
                <li>Reportes automáticos (JUnit, Coverage)</li>
                <li>Workflows reusables para evitar duplicación</li>
                <li>Scheduled runs para detectar regresiones</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Evitar:</strong>
            <ul class="mb-0">
                <li>Instalar dependencies en cada job (usar cache)</li>
                <li>Ejecutar tests sin BD cuando es necesaria</li>
                <li>No especificar versión de PHP</li>
                <li>Secrets en código (usar variables de entorno)</li>
                <li>No usar matrix para tests en múltiples versiones</li>
                <li>Artifacts sin expiración (consume storage)</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>🎯 Métricas Objetivo:</strong>
            <ul class="mb-0">
                <li><strong>Pipeline time:</strong> < 10 minutos</li>
                <li><strong>Success rate:</strong> > 95%</li>
                <li><strong>Cache hit rate:</strong> > 80%</li>
                <li><strong>Coverage:</strong> > 80%</li>
            </ul>
        </div>
    </div>
`;

// @ts-nocheck
const herramientasCICD = `
    <div class="content-section">
        <h1 id="herramientas-cicd">Herramientas de CI/CD (GitHub Actions, GitLab CI, Jenkins, CircleCI)</h1>
        <p>Comparativa y ejemplos prácticos de las principales plataformas CI/CD para proyectos PrestaShop 8.9+.</p>

        <h2 class="section-title">1. Comparativa de Herramientas</h2>

        <table>
            <thead>
                <tr>
                    <th>Herramienta</th>
                    <th>Hosting</th>
                    <th>Precio</th>
                    <th>Configuración</th>
                    <th>Mejor para</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>GitHub Actions</strong></td>
                    <td>Cloud</td>
                    <td>Free (límites), $4/mes</td>
                    <td>YAML simple</td>
                    <td>Proyectos en GitHub</td>
                </tr>
                <tr>
                    <td><strong>GitLab CI</strong></td>
                    <td>Cloud/Self-hosted</td>
                    <td>Free, $19/user/mes</td>
                    <td>YAML simple</td>
                    <td>DevOps completo</td>
                </tr>
                <tr>
                    <td><strong>Jenkins</strong></td>
                    <td>Self-hosted</td>
                    <td>Free (OSS)</td>
                    <td>UI + Groovy</td>
                    <td>Empresas, on-premise</td>
                </tr>
                <tr>
                    <td><strong>CircleCI</strong></td>
                    <td>Cloud/Self-hosted</td>
                    <td>Free, $15/mes</td>
                    <td>YAML</td>
                    <td>Performance</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">2. GitHub Actions</h2>

        <h3>2.1. Pipeline Básico</h3>

        <pre><code class="language-yaml"># .github/workflows/prestashop-ci.yml
name: PrestaShop CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  PHP_VERSION: '8.1'

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        php-version: ['8.1', '8.2', '8.3']
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup PHP \${{ matrix.php-version }}
        uses: shivammathur/setup-php@v2
        with:
          php-version: \${{ matrix.php-version }}
          extensions: mbstring, intl, gd, xml, mysql
          coverage: xdebug
      
      - name: Cache Composer
        uses: actions/cache@v3
        with:
          path: vendor
          key: \${{ runner.os }}-php-\${{ matrix.php-version }}-\${{ hashFiles('**/composer.lock') }}
      
      - name: Install dependencies
        run: composer install --prefer-dist
      
      - name: PHPUnit tests
        run: vendor/bin/phpunit --coverage-clover=coverage.xml
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage.xml
          flags: php-\${{ matrix.php-version }}
</code></pre>

        <h3>2.2. Actions Marketplace</h3>

        <pre><code class="language-yaml"># Usar actions de terceros
jobs:
  deploy:
    steps:
      # SSH Deploy
      - name: Deploy via SSH
        uses: appleboy/ssh-action@master
        with:
          host: \${{ secrets.HOST }}
          username: \${{ secrets.USERNAME }}
          key: \${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/prestashop
            git pull origin main
            composer install --no-dev
      
      # Slack notification
      - name: Slack
        uses: 8398a7/action-slack@v3
        with:
          status: \${{ job.status }}
          webhook_url: \${{ secrets.SLACK_WEBHOOK }}
      
      # Create release
      - name: Create Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: \${{ github.ref }}
          release_name: Release \${{ github.ref }}
</code></pre>

        <h3>2.3. Reusable Workflows</h3>

        <pre><code class="language-yaml"># .github/workflows/reusable-test.yml
name: Reusable Test Workflow

on:
  workflow_call:
    inputs:
      php-version:
        required: true
        type: string

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: \${{ inputs.php-version }}
      - run: composer test

# .github/workflows/main.yml
name: Main CI

on: [push]

jobs:
  test-php81:
    uses: ./.github/workflows/reusable-test.yml
    with:
      php-version: '8.1'
  
  test-php82:
    uses: ./.github/workflows/reusable-test.yml
    with:
      php-version: '8.2'
</code></pre>

        <h2 class="section-title">3. GitLab CI</h2>

        <h3>3.1. Pipeline Completo</h3>

        <pre><code class="language-yaml"># .gitlab-ci.yml
stages:
  - build
  - test
  - deploy

variables:
  PHP_VERSION: "8.1"
  MYSQL_DATABASE: "prestashop_test"
  MYSQL_ROOT_PASSWORD: "root"

# Templates para reutilizar
.php-base:
  image: php:\${PHP_VERSION}-cli
  before_script:
    - apt-get update -qq
    - apt-get install -y -qq git unzip
    - curl -sS https://getcomposer.org/installer | php
    - php composer.phar install --no-progress

build:
  extends: .php-base
  stage: build
  script:
    - composer install --no-dev --optimize-autoloader
    - npm ci
    - npm run build
  artifacts:
    paths:
      - vendor/
      - node_modules/
      - public/build/
    expire_in: 1 day

lint:
  extends: .php-base
  stage: test
  script:
    - vendor/bin/phpcs --standard=PSR12 modules/

phpstan:
  extends: .php-base
  stage: test
  script:
    - vendor/bin/phpstan analyse --level=6 modules/

unit-tests:
  extends: .php-base
  stage: test
  services:
    - mysql:8.0
  script:
    - vendor/bin/phpunit --testsuite=Unit --coverage-text --colors=never
  coverage: '/^\s*Lines:\s*\d+.\d+\%/'

integration-tests:
  extends: .php-base
  stage: test
  services:
    - mysql:8.0
  script:
    - vendor/bin/phpunit --testsuite=Integration
  dependencies:
    - build

deploy-staging:
  stage: deploy
  environment:
    name: staging
    url: https://staging.myshop.com
  script:
    - apt-get install -y rsync
    - rsync -avz --delete ./ user@staging:/var/www/prestashop/
    - ssh user@staging "cd /var/www/prestashop && php bin/console cache:clear"
  only:
    - develop

deploy-production:
  stage: deploy
  environment:
    name: production
    url: https://www.myshop.com
  script:
    - rsync -avz --delete ./ user@prod:/var/www/prestashop/
    - ssh user@prod "cd /var/www/prestashop && php bin/console cache:clear --env=prod"
  when: manual
  only:
    - main
</code></pre>

        <h3>3.2. GitLab Auto DevOps</h3>

        <pre><code class="language-yaml"># .gitlab-ci.yml con Auto DevOps
include:
  - template: Auto-DevOps.gitlab-ci.yml

variables:
  POSTGRES_ENABLED: "false"
  MYSQL_ENABLED: "true"
  
test:
  script:
    - composer install
    - vendor/bin/phpunit
</code></pre>

        <h2 class="section-title">4. Jenkins</h2>

        <h3>4.1. Jenkinsfile (Pipeline as Code)</h3>

        <pre><code class="language-groovy">// Jenkinsfile
pipeline {
    agent any
    
    environment {
        PHP_VERSION = '8.1'
        COMPOSER_HOME = '/tmp/composer'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'composer install --no-interaction'
                sh 'npm ci'
            }
        }
        
        stage('Code Quality') {
            parallel {
                stage('PHPCS') {
                    steps {
                        sh 'vendor/bin/phpcs --standard=PSR12 modules/'
                    }
                }
                
                stage('PHPStan') {
                    steps {
                        sh 'vendor/bin/phpstan analyse --level=6 modules/'
                    }
                }
                
                stage('PHPMD') {
                    steps {
                        sh 'vendor/bin/phpmd modules/ text codesize,unusedcode'
                    }
                }
            }
        }
        
        stage('Tests') {
            steps {
                sh 'vendor/bin/phpunit --coverage-html build/coverage'
                publishHTML([
                    reportDir: 'build/coverage',
                    reportFiles: 'index.html',
                    reportName: 'Coverage Report'
                ])
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm run build'
                archiveArtifacts artifacts: 'public/build/**/*', fingerprint: true
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                sh '''
                    rsync -avz --delete ./ deploy@staging:/var/www/prestashop/
                    ssh deploy@staging "cd /var/www/prestashop && php bin/console cache:clear"
                '''
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                input message: 'Deploy to production?', ok: 'Deploy'
                sh '''
                    rsync -avz --delete ./ deploy@prod:/var/www/prestashop/
                    ssh deploy@prod "cd /var/www/prestashop && php bin/console cache:clear --env=prod"
                '''
            }
        }
    }
    
    post {
        always {
            junit 'build/logs/junit.xml'
            cleanWs()
        }
        
        success {
            slackSend color: 'good', message: "Build \${env.BUILD_NUMBER} succeeded"
        }
        
        failure {
            slackSend color: 'danger', message: "Build \${env.BUILD_NUMBER} failed"
        }
    }
}
</code></pre>

        <h3>4.2. Jenkins Plugins Esenciales</h3>

        <pre><code class="language-plaintext">Plugins recomendados para PrestaShop:

1. Pipeline Plugin - Pipeline as Code
2. Git Plugin - Integración Git
3. Blue Ocean - UI moderna
4. Docker Pipeline - Docker support
5. Slack Notification - Notificaciones
6. JUnit Plugin - Reportes de tests
7. Cobertura Plugin - Coverage reports
8. Checkstyle Plugin - PHPCS integration
9. Warnings Next Generation - Static analysis
10. SSH Agent - Deploy via SSH
</code></pre>

        <h2 class="section-title">5. CircleCI</h2>

        <h3>5.1. Configuración</h3>

        <pre><code class="language-yaml"># .circleci/config.yml
version: 2.1

orbs:
  php: circleci/php@1.1.0
  node: circleci/node@5.0.0

executors:
  php-mysql:
    docker:
      - image: cimg/php:8.1-node
      - image: cimg/mysql:8.0
        environment:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: prestashop_test

jobs:
  build:
    executor: php-mysql
    steps:
      - checkout
      
      - restore_cache:
          keys:
            - composer-v1-{{ checksum "composer.lock" }}
            - composer-v1-
      
      - run:
          name: Install PHP dependencies
          command: composer install --no-interaction
      
      - save_cache:
          key: composer-v1-{{ checksum "composer.lock" }}
          paths:
            - vendor
      
      - restore_cache:
          keys:
            - node-v1-{{ checksum "package-lock.json" }}
            - node-v1-
      
      - run:
          name: Install Node dependencies
          command: npm ci
      
      - save_cache:
          key: node-v1-{{ checksum "package-lock.json" }}
          paths:
            - node_modules
      
      - run:
          name: Build assets
          command: npm run build
      
      - persist_to_workspace:
          root: .
          paths:
            - vendor
            - node_modules
            - public/build
  
  test:
    executor: php-mysql
    parallelism: 4
    steps:
      - checkout
      
      - attach_workspace:
          at: .
      
      - run:
          name: Wait for MySQL
          command: dockerize -wait tcp://127.0.0.1:3306 -timeout 1m
      
      - run:
          name: PHPUnit
          command: |
            TESTFILES=\$(circleci tests glob "tests/**/*Test.php" | circleci tests split --split-by=timings)
            vendor/bin/phpunit \$TESTFILES
      
      - store_test_results:
          path: build/logs
      
      - store_artifacts:
          path: build/coverage
  
  deploy:
    executor: php-mysql
    steps:
      - checkout
      
      - attach_workspace:
          at: .
      
      - add_ssh_keys:
          fingerprints:
            - "SO:ME:FIN:G:ER:PR:IN:T"
      
      - run:
          name: Deploy
          command: |
            rsync -avz --delete ./ user@prod:/var/www/prestashop/
            ssh user@prod "cd /var/www/prestashop && php bin/console cache:clear"

workflows:
  build-test-deploy:
    jobs:
      - build
      - test:
          requires:
            - build
      - deploy:
          requires:
            - test
          filters:
            branches:
              only: main
</code></pre>

        <h2 class="section-title">6. Comparativa Práctica</h2>

        <h3>6.1. Cache</h3>

        <pre><code class="language-yaml"># GitHub Actions
- uses: actions/cache@v3
  with:
    path: vendor
    key: \${{ runner.os }}-composer-\${{ hashFiles('**/composer.lock') }}

# GitLab CI
cache:
  paths:
    - vendor/

# CircleCI
- restore_cache:
    keys:
      - composer-{{ checksum "composer.lock" }}

# Jenkins
// Cache via shared workspace o plugin
</code></pre>

        <h3>6.2. Secrets</h3>

        <pre><code class="language-yaml"># GitHub Actions
\${{ secrets.SSH_KEY }}
\${{ secrets.DATABASE_PASSWORD }}

# GitLab CI (Settings → CI/CD → Variables)
\$SSH_KEY
\$DATABASE_PASSWORD

# CircleCI (Project Settings → Environment Variables)
\$SSH_KEY
\$DATABASE_PASSWORD

# Jenkins (Credentials Plugin)
credentials('ssh-key-id')
credentials('db-password-id')
</code></pre>

        <h2 class="section-title">7. Selección de Herramienta</h2>

        <table>
            <thead>
                <tr>
                    <th>Escenario</th>
                    <th>Recomendación</th>
                    <th>Razón</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Proyecto en GitHub</td>
                    <td>GitHub Actions</td>
                    <td>Integración nativa, simple</td>
                </tr>
                <tr>
                    <td>Proyecto en GitLab</td>
                    <td>GitLab CI</td>
                    <td>Todo en uno, Auto DevOps</td>
                </tr>
                <tr>
                    <td>Empresa on-premise</td>
                    <td>Jenkins</td>
                    <td>Self-hosted, customizable</td>
                </tr>
                <tr>
                    <td>Performance crítica</td>
                    <td>CircleCI</td>
                    <td>Paralelización eficiente</td>
                </tr>
                <tr>
                    <td>Multi-repo</td>
                    <td>Jenkins</td>
                    <td>Pipelines complejas</td>
                </tr>
                <tr>
                    <td>Startup pequeño</td>
                    <td>GitHub Actions</td>
                    <td>Free tier generoso</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">8. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ CI/CD Efectivo:</strong>
            <ul class="mb-0">
                <li>Pipeline as Code (versionado con código)</li>
                <li>Cache agresivo de dependencias</li>
                <li>Paralelizar jobs independientes</li>
                <li>Fail fast (tests rápidos primero)</li>
                <li>Secrets en variables de entorno</li>
                <li>Artifacts con retention policy</li>
                <li>Notificaciones en chat del equipo</li>
                <li>Monitoring de duración de pipeline</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Evitar:</strong>
            <ul class="mb-0">
                <li>Hardcodear secrets en código</li>
                <li>No usar cache (builds lentos)</li>
                <li>Jobs secuenciales innecesarios</li>
                <li>No limpiar artifacts antiguos</li>
                <li>Ignorar builds rotos</li>
                <li>No versionar configuración CI</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>💡 Recomendación PrestaShop:</strong>
            <ul class="mb-0">
                <li><strong>Pequeño proyecto:</strong> GitHub Actions (simple, gratis)</li>
                <li><strong>Proyecto medio:</strong> GitLab CI (features completas)</li>
                <li><strong>Empresa:</strong> Jenkins (control total, on-premise)</li>
                <li><strong>Performance:</strong> CircleCI (paralelización)</li>
            </ul>
        </div>
    </div>
`;

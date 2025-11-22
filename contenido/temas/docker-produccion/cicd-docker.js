// @ts-nocheck
const cicdDocker = `
    <div class="content-section">
        <h1 id="cicd-docker">Integración Continua/Despliegue Continuo con Docker</h1>
        <p>Implementación de pipelines CI/CD con Docker para automatizar build, test y deploy de PrestaShop 8.9+.</p>

        <h2 class="section-title">1. GitHub Actions</h2>

        <pre><code class="language-yaml"># .github/workflows/docker-ci.yml
name: Docker CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: \${{ github.repository }}

jobs:
  # Build y Test
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: \${{ env.REGISTRY }}
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: \${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha,prefix={{branch}}-
            type=semver,pattern={{version}}
      
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: \${{ steps.meta.outputs.tags }}
          labels: \${{ steps.meta.outputs.labels }}
          cache-from: type=registry,ref=\${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}:buildcache
          cache-to: type=registry,ref=\${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}:buildcache,mode=max
      
      - name: Run tests
        run: |
          docker run --rm \${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}:\${{ github.sha }} \\
            php vendor/bin/phpunit
  
  # Deploy a staging
  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    
    steps:
      - name: Deploy to staging
        uses: appleboy/ssh-action@master
        with:
          host: \${{ secrets.STAGING_HOST }}
          username: \${{ secrets.STAGING_USER }}
          key: \${{ secrets.STAGING_KEY }}
          script: |
            cd /app
            docker compose pull
            docker compose up -d
            docker compose exec -T prestashop php bin/console cache:clear
  
  # Deploy a production
  deploy-production:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://shop.example.com
    
    steps:
      - name: Deploy to production
        uses: appleboy/ssh-action@master
        with:
          host: \${{ secrets.PROD_HOST }}
          username: \${{ secrets.PROD_USER }}
          key: \${{ secrets.PROD_KEY }}
          script: |
            cd /app
            docker compose pull
            docker compose up -d --no-deps prestashop
            docker compose exec -T prestashop php bin/console cache:clear
</code></pre>

        <h2 class="section-title">2. GitLab CI</h2>

        <pre><code class="language-yaml"># .gitlab-ci.yml
stages:
  - build
  - test
  - deploy

variables:
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: "/certs"
  IMAGE_TAG: \$CI_REGISTRY_IMAGE:\$CI_COMMIT_SHORT_SHA

# Build
build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  before_script:
    - docker login -u \$CI_REGISTRY_USER -p \$CI_REGISTRY_PASSWORD \$CI_REGISTRY
  script:
    - docker build -t \$IMAGE_TAG .
    - docker tag \$IMAGE_TAG \$CI_REGISTRY_IMAGE:latest
    - docker push \$IMAGE_TAG
    - docker push \$CI_REGISTRY_IMAGE:latest
  only:
    - main
    - develop

# Test
test:
  stage: test
  image: \$IMAGE_TAG
  services:
    - name: mysql:8.0
      alias: mysql
  variables:
    MYSQL_DATABASE: prestashop_test
    MYSQL_ROOT_PASSWORD: test123
    DB_SERVER: mysql
  script:
    - composer install
    - php vendor/bin/phpunit
    - php vendor/bin/phpstan analyze src
  coverage: '/^\s*Lines:\s*\d+.\d+\%/'

# Deploy Staging
deploy:staging:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client
    - eval \$(ssh-agent -s)
    - echo "\$STAGING_SSH_KEY" | tr -d '\r' | ssh-add -
    - mkdir -p ~/.ssh
    - chmod 700 ~/.ssh
  script:
    - ssh -o StrictHostKeyChecking=no \$STAGING_USER@\$STAGING_HOST "
        cd /app &&
        docker compose pull &&
        docker compose up -d &&
        docker compose exec -T prestashop php bin/console cache:clear
      "
  environment:
    name: staging
    url: https://staging.shop.com
  only:
    - develop

# Deploy Production
deploy:production:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client
    - eval \$(ssh-agent -s)
    - echo "\$PROD_SSH_KEY" | tr -d '\r' | ssh-add -
  script:
    - ssh -o StrictHostKeyChecking=no \$PROD_USER@\$PROD_HOST "
        cd /app &&
        docker compose pull &&
        docker compose up -d --no-deps prestashop &&
        docker compose exec -T prestashop php bin/console cache:clear
      "
  environment:
    name: production
    url: https://shop.com
  when: manual
  only:
    - main
</code></pre>

        <h2 class="section-title">3. Jenkins Pipeline</h2>

        <pre><code class="language-groovy">// Jenkinsfile
pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'docker.io'
        IMAGE_NAME = 'myuser/prestashop'
        IMAGE_TAG = "\${env.BUILD_NUMBER}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build') {
            steps {
                script {
                    docker.build("\${IMAGE_NAME}:\${IMAGE_TAG}")
                }
            }
        }
        
        stage('Test') {
            steps {
                script {
                    docker.image("\${IMAGE_NAME}:\${IMAGE_TAG}").inside {
                        sh 'composer install'
                        sh 'php vendor/bin/phpunit'
                    }
                }
            }
        }
        
        stage('Push') {
            steps {
                script {
                    docker.withRegistry('https://\${DOCKER_REGISTRY}', 'docker-credentials') {
                        docker.image("\${IMAGE_NAME}:\${IMAGE_TAG}").push()
                        docker.image("\${IMAGE_NAME}:\${IMAGE_TAG}").push('latest')
                    }
                }
            }
        }
        
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sshagent(['production-ssh']) {
                    sh '''
                        ssh user@production-server "
                            cd /app &&
                            docker compose pull &&
                            docker compose up -d
                        "
                    '''
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            slackSend(
                color: 'good',
                message: "Build \${env.BUILD_NUMBER} succeeded: \${env.JOB_NAME}"
            )
        }
        failure {
            slackSend(
                color: 'danger',
                message: "Build \${env.BUILD_NUMBER} failed: \${env.JOB_NAME}"
            )
        }
    }
}
</code></pre>

        <h2 class="section-title">4. Docker Compose para CI</h2>

        <pre><code class="language-yaml"># docker-compose.ci.yml
version: '3.8'

services:
  app:
    build:
      context: .
      target: test
    environment:
      - DB_SERVER=mysql
      - DB_NAME=prestashop_test
    depends_on:
      mysql:
        condition: service_healthy
  
  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_DATABASE=prestashop_test
      - MYSQL_ROOT_PASSWORD=test123
    healthcheck:
      test: ["CMD", "mysqladmin", "ping"]
      interval: 5s
      retries: 10
  
  redis:
    image: redis:7-alpine
</code></pre>

        <pre><code class="language-bash"># Script de CI
#!/bin/bash
set -e

# Build
docker compose -f docker-compose.ci.yml build

# Tests
docker compose -f docker-compose.ci.yml run --rm app composer install
docker compose -f docker-compose.ci.yml run --rm app php vendor/bin/phpunit
docker compose -f docker-compose.ci.yml run --rm app php vendor/bin/phpstan analyze

# Cleanup
docker compose -f docker-compose.ci.yml down -v
</code></pre>

        <h2 class="section-title">5. Multi-stage Dockerfile para CI/CD</h2>

        <pre><code class="language-dockerfile"># Dockerfile optimizado para CI/CD
FROM php:8.1-fpm-alpine AS base
RUN apk add --no-cache \\
    libzip-dev \\
    libpng-dev
RUN docker-php-ext-install pdo_mysql gd zip

# Dependencies
FROM base AS dependencies
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Development
FROM base AS development
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --optimize-autoloader
COPY . .
CMD ["php-fpm"]

# Test
FROM development AS test
RUN composer install --dev
COPY . .
RUN php vendor/bin/phpunit
RUN php vendor/bin/phpstan analyze

# Production
FROM base AS production
WORKDIR /var/www/html
COPY --from=dependencies /app/vendor ./vendor
COPY . .
RUN chown -R www-data:www-data /var/www/html
USER www-data
CMD ["php-fpm"]
</code></pre>

        <h2 class="section-title">6. Semantic Versioning Automático</h2>

        <pre><code class="language-yaml"># .github/workflows/release.yml
name: Release

on:
  push:
    branches: [ main ]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Semantic Release
        uses: cycjimmy/semantic-release-action@v4
        with:
          extra_plugins: |
            @semantic-release/changelog
            @semantic-release/git
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
      
      - name: Build and Push
        if: steps.semantic.outputs.new_release_published == 'true'
        run: |
          docker build -t myuser/prestashop:\${{ steps.semantic.outputs.new_release_version }} .
          docker push myuser/prestashop:\${{ steps.semantic.outputs.new_release_version }}
</code></pre>

        <h2 class="section-title">7. Estrategias de Deploy</h2>

        <h3>7.1. Blue-Green Deployment</h3>

        <pre><code class="language-bash">#!/bin/bash
# blue-green-deploy.sh

# Deploy nueva versión (green)
docker compose -f docker-compose.green.yml up -d

# Health check
until \$(curl --output /dev/null --silent --head --fail http://green.shop.com/health); do
    sleep 5
done

# Switch traffic (nginx/haproxy)
./switch-traffic.sh green

# Verificar
sleep 30

# Si OK, eliminar blue
docker compose -f docker-compose.blue.yml down

# Renombrar green a blue para próximo deploy
mv docker-compose.green.yml docker-compose.blue.yml
</code></pre>

        <h3>7.2. Canary Deployment</h3>

        <pre><code class="language-yaml"># docker-compose.canary.yml
services:
  prestashop-stable:
    image: prestashop:8.9.0
    deploy:
      replicas: 9  # 90% traffic
  
  prestashop-canary:
    image: prestashop:8.9.1
    deploy:
      replicas: 1  # 10% traffic
</code></pre>

        <h2 class="section-title">8. Rollback Automático</h2>

        <pre><code class="language-bash">#!/bin/bash
# deploy-with-rollback.sh
set -e

PREVIOUS_IMAGE=\$(docker inspect prestashop --format='{{.Image}}')

# Deploy nueva versión
docker compose pull
docker compose up -d

# Health check
for i in {1..30}; do
    if curl --fail http://localhost/health; then
        echo "Deploy successful"
        exit 0
    fi
    sleep 2
done

# Rollback si falla
echo "Health check failed, rolling back..."
docker tag \$PREVIOUS_IMAGE prestashop:latest
docker compose up -d
exit 1
</code></pre>

        <h2 class="section-title">9. Notificaciones</h2>

        <pre><code class="language-bash"># Slack notification
curl -X POST -H 'Content-type: application/json' \\
  --data '{
    "text":"Deploy to production completed",
    "attachments":[{
      "color":"good",
      "fields":[
        {"title":"Environment","value":"Production","short":true},
        {"title":"Version","value":"v1.2.3","short":true}
      ]
    }]
  }' \\
  \$SLACK_WEBHOOK_URL
</code></pre>

        <h2 class="section-title">10. Ejemplo Completo CI/CD</h2>

        <pre><code class="language-yaml"># .github/workflows/complete-cicd.yml
name: Complete CI/CD

on:
  push:
    branches: [ main, develop ]
    tags: [ 'v*' ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run tests
        run: |
          docker compose -f docker-compose.ci.yml run --rm app composer install
          docker compose -f docker-compose.ci.yml run --rm app php vendor/bin/phpunit
          docker compose -f docker-compose.ci.yml down -v
  
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Login
        uses: docker/login-action@v3
        with:
          username: \${{ secrets.DOCKER_USERNAME }}
          password: \${{ secrets.DOCKER_PASSWORD }}
      
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          push: true
          tags: |
            myuser/prestashop:\${{ github.sha }}
            myuser/prestashop:latest
  
  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy
        uses: appleboy/ssh-action@master
        with:
          host: \${{ secrets.HOST }}
          username: \${{ secrets.USERNAME }}
          key: \${{ secrets.SSH_KEY }}
          script: |
            cd /app
            docker compose pull
            docker compose up -d
            
            # Health check
            for i in {1..30}; do
              if curl -f http://localhost/health; then
                echo "Deploy successful"
                exit 0
              fi
              sleep 2
            done
            
            echo "Deploy failed"
            exit 1
      
      - name: Notify
        if: always()
        run: |
          curl -X POST \${{ secrets.SLACK_WEBHOOK }} \\
            -d '{"text":"Deploy \${{ job.status }}: \${{ github.sha }}"}'
</code></pre>

        <h2 class="section-title">11. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ CI/CD con Docker:</strong>
            <ul class="mb-0">
                <li>Tests automáticos en cada commit</li>
                <li>Build de imágenes en pipeline</li>
                <li>Versionado semántico automático</li>
                <li>Health checks antes de deploy</li>
                <li>Rollback automático si falla</li>
                <li>Notificaciones de deploy</li>
                <li>Secrets en variables de entorno</li>
                <li>Cache de layers para speed</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>🔄 Flujo Recomendado:</strong>
            <ol class="mb-0">
                <li>Push a Git</li>
                <li>CI ejecuta tests</li>
                <li>Build imagen Docker</li>
                <li>Push a registry</li>
                <li>Deploy a staging automático</li>
                <li>Deploy a producción manual/aprobado</li>
                <li>Health check post-deploy</li>
                <li>Rollback si falla</li>
            </ol>
        </div>
    </div>
`;

// @ts-nocheck
const integracionDockerCICD = `
    <div class="content-section">
        <h1 id="integracion-docker-cicd">Integración de Docker con Pipelines CI/CD</h1>
        <p>Integración completa de Docker en pipelines CI/CD para automatizar build, test y deploy de PrestaShop 8.9+.</p>

        <h2 class="section-title">1. Pipeline Completo PrestaShop</h2>

        <pre><code class="language-yaml"># .github/workflows/prestashop-cicd.yml
name: PrestaShop CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: \${{ github.repository }}/prestashop
  PHP_VERSION: "8.1"

jobs:
  # 1. Tests unitarios
  unit-tests:
    runs-on: ubuntu-latest
    container:
      image: php:8.1-fpm
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: test123
          MYSQL_DATABASE: prestashop_test
    steps:
      - uses: actions/checkout@v4
      
      - name: Install dependencies
        run: |
          apt-get update
          apt-get install -y libzip-dev libpng-dev git unzip
          docker-php-ext-install pdo_mysql gd zip
          curl -sS https://getcomposer.org/installer | php
          php composer.phar install
      
      - name: Run PHPUnit
        env:
          DB_SERVER: mysql
          DB_NAME: prestashop_test
        run: vendor/bin/phpunit --coverage-text
      
      - name: Run PHPStan
        run: vendor/bin/phpstan analyze modules/ --level=5
  
  # 2. Tests de integración
  integration-tests:
    needs: unit-tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Start containers
        run: docker-compose -f docker-compose.test.yml up -d
      
      - name: Wait for services
        run: |
          timeout 60 bash -c 'until docker-compose exec -T prestashop curl -f http://localhost/; do sleep 2; done'
      
      - name: Run integration tests
        run: docker-compose exec -T prestashop vendor/bin/codecept run
      
      - name: Cleanup
        if: always()
        run: docker-compose -f docker-compose.test.yml down -v
  
  # 3. Build imagen Docker
  build:
    needs: integration-tests
    runs-on: ubuntu-latest
    outputs:
      image-tag: \${{ steps.meta.outputs.tags }}
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      
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
            type=raw,value=latest,enable={{is_default_branch}}
      
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile
          push: true
          tags: \${{ steps.meta.outputs.tags }}
          labels: \${{ steps.meta.outputs.labels }}
          cache-from: type=registry,ref=\${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}:buildcache
          cache-to: type=registry,ref=\${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}:buildcache,mode=max
          build-args: |
            PHP_VERSION=\${{ env.PHP_VERSION }}
            BUILD_DATE=\${{ github.event.head_commit.timestamp }}
            VCS_REF=\${{ github.sha }}
  
  # 4. Security scan
  security-scan:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: \${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}:\${{ github.sha }}
          format: 'sarif'
          output: 'trivy-results.sarif'
      
      - name: Upload to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
  
  # 5. Deploy a staging
  deploy-staging:
    needs: [build, security-scan]
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: https://staging.shop.com
    steps:
      - name: Deploy to staging
        uses: appleboy/ssh-action@master
        with:
          host: \${{ secrets.STAGING_HOST }}
          username: \${{ secrets.STAGING_USER }}
          key: \${{ secrets.STAGING_SSH_KEY }}
          script: |
            cd /app
            echo "\${{ secrets.GITHUB_TOKEN }}" | docker login ghcr.io -u \${{ github.actor }} --password-stdin
            docker pull \${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}:\${{ github.sha }}
            docker tag \${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}:\${{ github.sha }} prestashop:latest
            docker-compose up -d prestashop
            docker-compose exec -T prestashop php bin/console cache:clear
      
      - name: Run smoke tests
        run: |
          curl -f https://staging.shop.com/health || exit 1
          curl -f https://staging.shop.com/ || exit 1
      
      - name: Notify Slack
        uses: 8398a7/action-slack@v3
        with:
          status: \${{ job.status }}
          text: 'Staging deploy completed'
          webhook_url: \${{ secrets.SLACK_WEBHOOK }}
  
  # 6. Deploy a producción (manual)
  deploy-production:
    needs: [build, security-scan]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://shop.com
    steps:
      - name: Create backup
        uses: appleboy/ssh-action@master
        with:
          host: \${{ secrets.PROD_HOST }}
          username: \${{ secrets.PROD_USER }}
          key: \${{ secrets.PROD_SSH_KEY }}
          script: |
            cd /app
            docker exec mysql mysqldump -u root -p\${{ secrets.MYSQL_ROOT_PASSWORD }} prestashop > backup-\$(date +%Y%m%d-%H%M%S).sql
      
      - name: Deploy to production
        uses: appleboy/ssh-action@master
        with:
          host: \${{ secrets.PROD_HOST }}
          username: \${{ secrets.PROD_USER }}
          key: \${{ secrets.PROD_SSH_KEY }}
          script: |
            cd /app
            echo "\${{ secrets.GITHUB_TOKEN }}" | docker login ghcr.io -u \${{ github.actor }} --password-stdin
            docker pull \${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}:\${{ github.sha }}
            docker tag \${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}:\${{ github.sha }} prestashop:latest
            
            # Blue-Green deployment
            ./deploy-blue-green.sh
      
      - name: Health check
        run: |
          for i in {1..30}; do
            if curl -f https://shop.com/health; then
              echo "Production is healthy"
              exit 0
            fi
            sleep 2
          done
          echo "Health check failed"
          exit 1
      
      - name: Rollback on failure
        if: failure()
        uses: appleboy/ssh-action@master
        with:
          host: \${{ secrets.PROD_HOST }}
          username: \${{ secrets.PROD_USER }}
          key: \${{ secrets.PROD_SSH_KEY }}
          script: |
            cd /app
            ./rollback.sh
      
      - name: Notify team
        if: always()
        uses: 8398a7/action-slack@v3
        with:
          status: \${{ job.status }}
          text: 'Production deploy \${{ job.status }}'
          webhook_url: \${{ secrets.SLACK_WEBHOOK }}
</code></pre>

        <h2 class="section-title">2. GitLab CI Pipeline</h2>

        <pre><code class="language-yaml"># .gitlab-ci.yml
stages:
  - test
  - build
  - security
  - deploy-staging
  - deploy-production

variables:
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: "/certs"
  IMAGE_TAG: \$CI_REGISTRY_IMAGE:\$CI_COMMIT_SHORT_SHA

# Tests
test:unit:
  stage: test
  image: prestashop:8.9
  services:
    - mysql:8.0
  variables:
    MYSQL_ROOT_PASSWORD: test123
    MYSQL_DATABASE: prestashop_test
    DB_SERVER: mysql
  script:
    - composer install
    - vendor/bin/phpunit --coverage-text
    - vendor/bin/phpstan analyze modules/ --level=5
  coverage: '/^\s*Lines:\s*\d+.\d+\%/'

test:integration:
  stage: test
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker-compose -f docker-compose.test.yml up -d
    - docker-compose exec -T prestashop vendor/bin/codecept run
  after_script:
    - docker-compose -f docker-compose.test.yml down -v

# Build
build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  before_script:
    - docker login -u \$CI_REGISTRY_USER -p \$CI_REGISTRY_PASSWORD \$CI_REGISTRY
  script:
    - docker build --build-arg PHP_VERSION=8.1 -t \$IMAGE_TAG .
    - docker tag \$IMAGE_TAG \$CI_REGISTRY_IMAGE:latest
    - docker push \$IMAGE_TAG
    - docker push \$CI_REGISTRY_IMAGE:latest
  only:
    - main
    - develop

# Security
security:trivy:
  stage: security
  image: aquasec/trivy:latest
  script:
    - trivy image --severity HIGH,CRITICAL \$IMAGE_TAG

# Deploy Staging
deploy:staging:
  stage: deploy-staging
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client curl
    - eval \$(ssh-agent -s)
    - echo "\$STAGING_SSH_KEY" | tr -d '\r' | ssh-add -
  script:
    - ssh -o StrictHostKeyChecking=no \$STAGING_USER@\$STAGING_HOST "
        cd /app &&
        docker login -u \$CI_REGISTRY_USER -p \$CI_REGISTRY_PASSWORD \$CI_REGISTRY &&
        docker pull \$IMAGE_TAG &&
        docker-compose up -d prestashop &&
        docker-compose exec -T prestashop php bin/console cache:clear
      "
    - curl -f https://staging.shop.com/health
  environment:
    name: staging
    url: https://staging.shop.com
  only:
    - develop

# Deploy Production (manual)
deploy:production:
  stage: deploy-production
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client curl
    - eval \$(ssh-agent -s)
    - echo "\$PROD_SSH_KEY" | tr -d '\r' | ssh-add -
  script:
    # Backup
    - ssh \$PROD_USER@\$PROD_HOST "
        docker exec mysql mysqldump -u root -p\$MYSQL_ROOT_PASSWORD prestashop > backup.sql
      "
    # Deploy
    - ssh \$PROD_USER@\$PROD_HOST "
        cd /app &&
        docker login -u \$CI_REGISTRY_USER -p \$CI_REGISTRY_PASSWORD \$CI_REGISTRY &&
        docker pull \$IMAGE_TAG &&
        ./deploy-blue-green.sh
      "
    # Health check
    - for i in {1..30}; do curl -f https://shop.com/health && break || sleep 2; done
  environment:
    name: production
    url: https://shop.com
    on_stop: rollback:production
  when: manual
  only:
    - main

# Rollback
rollback:production:
  stage: deploy-production
  image: alpine:latest
  script:
    - ssh \$PROD_USER@\$PROD_HOST "cd /app && ./rollback.sh"
  environment:
    name: production
    action: stop
  when: manual
</code></pre>

        <h2 class="section-title">3. Docker Compose para Testing</h2>

        <pre><code class="language-yaml"># docker-compose.test.yml
version: '3.8'

services:
  prestashop:
    build:
      context: .
      target: test
    environment:
      - DB_SERVER=mysql
      - DB_NAME=prestashop_test
      - DB_USER=root
      - DB_PASSWD=test123
      - REDIS_HOST=redis
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_started
    volumes:
      - ./:/var/www/html
    command: |
      sh -c "
        composer install &&
        vendor/bin/phpunit &&
        vendor/bin/codecept run
      "
  
  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=test123
      - MYSQL_DATABASE=prestashop_test
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 5s
      retries: 10
    tmpfs:
      - /var/lib/mysql  # Más rápido para tests
  
  redis:
    image: redis:7-alpine
</code></pre>

        <h2 class="section-title">4. Multi-Stage Dockerfile Optimizado</h2>

        <pre><code class="language-dockerfile"># Dockerfile optimizado para CI/CD
ARG PHP_VERSION=8.1

# Base
FROM php:\${PHP_VERSION}-fpm-alpine AS base
RUN apk add --no-cache \\
    libzip-dev libpng-dev libwebp-dev libjpeg-turbo-dev \\
    && docker-php-ext-configure gd --with-webp --with-jpeg \\
    && docker-php-ext-install pdo_mysql gd zip opcache
WORKDIR /var/www/html

# Dependencies
FROM base AS dependencies
COPY composer.json composer.lock ./
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \\
    && composer install --no-dev --optimize-autoloader --no-scripts

# Test stage
FROM base AS test
RUN apk add --no-cache git
COPY --from=dependencies /usr/local/bin/composer /usr/local/bin/composer
COPY composer.json composer.lock ./
RUN composer install
COPY . .
RUN vendor/bin/phpunit && vendor/bin/phpstan analyze modules/ --level=5

# Production
FROM base AS production
COPY --from=dependencies /var/www/html/vendor ./vendor
COPY . .
RUN chown -R www-data:www-data /var/www/html \\
    && chmod -R 755 /var/www/html
USER www-data
CMD ["php-fpm"]
</code></pre>

        <h2 class="section-title">5. Scripts de Deploy</h2>

        <pre><code class="language-bash">#!/bin/bash
# deploy-blue-green.sh
set -e

CURRENT=\$(cat .current-env 2>/dev/null || echo "blue")
NEW=\$([ "\$CURRENT" = "blue" ] && echo "green" || echo "blue")

echo "🚀 Deploying \$NEW environment..."

# Pull nueva imagen
docker pull \${IMAGE_TAG}
docker tag \${IMAGE_TAG} prestashop-\${NEW}:latest

# Start nuevo environment
docker-compose -f docker-compose.\${NEW}.yml up -d

# Wait for health
echo "⏳ Waiting for health check..."
for i in {1..60}; do
    if curl -sf http://localhost:808\$([ "\$NEW" = "green" ] && echo "1" || echo "0")/health > /dev/null; then
        echo "✅ \$NEW is healthy"
        break
    fi
    [ \$i -eq 60 ] && { echo "❌ Health check failed"; exit 1; }
    sleep 2
done

# Switch traffic (nginx reload)
cp nginx-\${NEW}.conf /etc/nginx/sites-enabled/default
nginx -s reload

# Verificar
echo "🔍 Verifying production..."
sleep 5
if ! curl -sf http://localhost/health > /dev/null; then
    echo "❌ Verification failed, rolling back..."
    cp nginx-\${CURRENT}.conf /etc/nginx/sites-enabled/default
    nginx -s reload
    exit 1
fi

# Stop old environment
echo "🛑 Stopping \$CURRENT environment..."
docker-compose -f docker-compose.\${CURRENT}.yml down

# Update current
echo "\$NEW" > .current-env

echo "✅ Deploy successful! Running \$NEW"

# Slack notification
curl -X POST \$SLACK_WEBHOOK \\
  -d "{\"text\":\"✅ Deploy successful: \$NEW environment\"}"
</code></pre>

        <h2 class="section-title">6. Automatización con Makefile</h2>

        <pre><code class="language-makefile"># Makefile
.PHONY: help test build deploy-staging deploy-prod rollback

help:
	@echo "PrestaShop Docker CI/CD Commands:"
	@echo "  make test           - Run all tests"
	@echo "  make build          - Build Docker image"
	@echo "  make deploy-staging - Deploy to staging"
	@echo "  make deploy-prod    - Deploy to production"
	@echo "  make rollback       - Rollback deployment"

test:
	docker-compose -f docker-compose.test.yml up --abort-on-container-exit
	docker-compose -f docker-compose.test.yml down -v

build:
	docker build -t prestashop:latest --target production .
	docker tag prestashop:latest \${REGISTRY}/prestashop:\${TAG}
	docker push \${REGISTRY}/prestashop:\${TAG}

deploy-staging:
	ssh \${STAGING_HOST} 'cd /app && docker-compose pull && docker-compose up -d'

deploy-prod:
	@echo "⚠️  Deploying to PRODUCTION"
	@read -p "Continue? [y/N] " -n 1 -r; \\
	if [[ \$\$REPLY =~ ^[Yy]\$\$ ]]; then \\
		ssh \${PROD_HOST} 'cd /app && ./deploy-blue-green.sh'; \\
	fi

rollback:
	ssh \${PROD_HOST} 'cd /app && ./rollback.sh'

clean:
	docker system prune -af
	docker volume prune -f
</code></pre>

        <h2 class="section-title">7. Mejores Prácticas CI/CD</h2>

        <div class="alert alert-success">
            <strong>✅ Pipeline:</strong>
            <ul class="mb-0">
                <li>Tests automáticos en cada commit</li>
                <li>Build de imagen Docker en pipeline</li>
                <li>Security scan (Trivy, Snyk)</li>
                <li>Staging deploy automático</li>
                <li>Production deploy manual con aprobación</li>
                <li>Rollback automático si falla health check</li>
                <li>Notificaciones de estado (Slack)</li>
                <li>Cache de layers para velocidad</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>🔒 Secrets Management:</strong>
            <ul class="mb-0">
                <li>Usar GitHub Secrets / GitLab Variables</li>
                <li>No hardcodear credenciales</li>
                <li>Rotar secrets regularmente</li>
                <li>Diferentes secrets por ambiente</li>
            </ul>
        </div>
    </div>
`;

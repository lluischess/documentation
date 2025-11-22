// @ts-nocheck
const despliegueAutomaticoStagingProduccion = `
    <div class="content-section">
        <h1 id="despliegue-automatico-staging-produccion">Despliegue Automático a Entornos de Staging y Producción</h1>
        <p>Configuración de pipelines de deployment automático para PrestaShop 8.9+ con GitHub Actions y GitLab CI.</p>

        <h2 class="section-title">1. Pipeline CD Completo - GitHub Actions</h2>

        <pre><code class="language-yaml"># .github/workflows/cd.yml
name: Continuous Deployment

on:
  push:
    branches: [ develop, main ]
  workflow_dispatch:

env:
  PHP_VERSION: '8.1'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: \${{ env.PHP_VERSION }}
      - run: composer install
      - run: vendor/bin/phpunit

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: https://staging.myshop.com
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup SSH
        uses: webfactory/ssh-agent@v0.8.0
        with:
          ssh-private-key: \${{ secrets.SSH_PRIVATE_KEY_STAGING }}
      
      - name: Deploy to Staging
        run: |
          ssh -o StrictHostKeyChecking=no deploy@staging.myshop.com << 'EOF'
            set -e
            cd /var/www/prestashop
            
            # Backup
            tar -czf backup-\$(date +%Y%m%d-%H%M%S).tar.gz --exclude='var/cache' .
            
            # Pull changes
            git pull origin develop
            
            # Install dependencies
            composer install --no-dev --optimize-autoloader
            
            # Clear cache
            php bin/console cache:clear --env=prod --no-debug
            
            # Run migrations
            php bin/console doctrine:migrations:migrate --no-interaction
            
            # Reload services
            sudo systemctl reload php8.1-fpm
            sudo systemctl reload nginx
          EOF
      
      - name: Verify deployment
        run: |
          sleep 10
          curl -f https://staging.myshop.com/health || exit 1
      
      - name: Notify Slack
        if: always()
        uses: 8398a7/action-slack@v3
        with:
          status: \${{ job.status }}
          text: 'Staging deployment \${{ job.status }}'
          webhook_url: \${{ secrets.SLACK_WEBHOOK }}

  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://www.myshop.com
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup SSH
        uses: webfactory/ssh-agent@v0.8.0
        with:
          ssh-private-key: \${{ secrets.SSH_PRIVATE_KEY_PROD }}
      
      - name: Deploy to Production
        run: |
          ssh -o StrictHostKeyChecking=no deploy@prod.myshop.com << 'EOF'
            set -e
            cd /var/www/prestashop
            
            # Backup database
            mysqldump prestashop > ~/backups/db-\$(date +%Y%m%d-%H%M%S).sql
            
            # Backup files
            tar -czf ~/backups/files-\$(date +%Y%m%d-%H%M%S).tar.gz --exclude='var/cache' .
            
            # Maintenance mode
            touch var/maintenance.flag
            
            # Pull changes
            git pull origin main
            
            # Install dependencies
            composer install --no-dev --optimize-autoloader --classmap-authoritative
            
            # Clear cache
            php bin/console cache:clear --env=prod --no-debug
            
            # Run migrations
            php bin/console doctrine:migrations:migrate --no-interaction
            
            # Warm up cache
            php bin/console cache:warmup --env=prod
            
            # Remove maintenance mode
            rm var/maintenance.flag
            
            # Reload services
            sudo systemctl reload php8.1-fpm
            sudo systemctl reload nginx
          EOF
      
      - name: Verify deployment
        run: |
          sleep 10
          curl -f https://www.myshop.com/health || exit 1
      
      - name: Notify team
        if: always()
        uses: 8398a7/action-slack@v3
        with:
          status: \${{ job.status }}
          text: '🚀 Production deployment \${{ job.status }}'
          webhook_url: \${{ secrets.SLACK_WEBHOOK }}
</code></pre>

        <h2 class="section-title">2. GitLab CI - Multi-environment CD</h2>

        <pre><code class="language-yaml"># .gitlab-ci.yml
stages:
  - test
  - deploy

test:
  stage: test
  script:
    - composer install
    - vendor/bin/phpunit

deploy:staging:
  stage: deploy
  environment:
    name: staging
    url: https://staging.myshop.com
  script:
    - echo "Deploying to staging..."
    - eval \$(ssh-agent -s)
    - echo "\$SSH_PRIVATE_KEY" | tr -d '\\r' | ssh-add -
    - mkdir -p ~/.ssh && chmod 700 ~/.ssh
    - ssh-keyscan staging.myshop.com >> ~/.ssh/known_hosts
    
    - ssh deploy@staging.myshop.com "
        cd /var/www/prestashop &&
        git pull origin develop &&
        composer install --no-dev --optimize-autoloader &&
        php bin/console cache:clear --env=prod &&
        php bin/console doctrine:migrations:migrate --no-interaction &&
        sudo systemctl reload php8.1-fpm nginx
      "
  only:
    - develop

deploy:production:
  stage: deploy
  environment:
    name: production
    url: https://www.myshop.com
  script:
    - echo "Deploying to production..."
    - eval \$(ssh-agent -s)
    - echo "\$SSH_PRIVATE_KEY_PROD" | tr -d '\\r' | ssh-add -
    - mkdir -p ~/.ssh && chmod 700 ~/.ssh
    - ssh-keyscan prod.myshop.com >> ~/.ssh/known_hosts
    
    - ssh deploy@prod.myshop.com "
        cd /var/www/prestashop &&
        touch var/maintenance.flag &&
        git pull origin main &&
        composer install --no-dev --optimize-autoloader --classmap-authoritative &&
        php bin/console cache:clear --env=prod &&
        php bin/console doctrine:migrations:migrate --no-interaction &&
        rm var/maintenance.flag &&
        sudo systemctl reload php8.1-fpm nginx
      "
  when: manual
  only:
    - main
</code></pre>

        <h2 class="section-title">3. Deploy Script Reutilizable</h2>

        <pre><code class="language-bash">#!/bin/bash
# deploy.sh

set -e

ENVIRONMENT=\$1
BRANCH=\$2

if [ -z "\$ENVIRONMENT" ] || [ -z "\$BRANCH" ]; then
    echo "Usage: ./deploy.sh <staging|production> <branch>"
    exit 1
fi

echo "🚀 Deploying \$BRANCH to \$ENVIRONMENT..."

# Load environment config
case \$ENVIRONMENT in
    staging)
        SERVER="deploy@staging.myshop.com"
        PATH="/var/www/prestashop"
        ;;
    production)
        SERVER="deploy@prod.myshop.com"
        PATH="/var/www/prestashop"
        ;;
    *)
        echo "Invalid environment"
        exit 1
        ;;
esac

# Deploy
ssh \$SERVER << EOF
    set -e
    cd \$PATH
    
    echo "📦 Creating backup..."
    tar -czf ~/backups/\$(date +%Y%m%d-%H%M%S).tar.gz --exclude='var/cache' .
    
    echo "🔄 Pulling changes..."
    git fetch origin
    git checkout \$BRANCH
    git pull origin \$BRANCH
    
    echo "📥 Installing dependencies..."
    composer install --no-dev --optimize-autoloader
    
    echo "🗄️ Running migrations..."
    php bin/console doctrine:migrations:migrate --no-interaction
    
    echo "🧹 Clearing cache..."
    php bin/console cache:clear --env=prod --no-debug
    
    echo "♻️ Reloading services..."
    sudo systemctl reload php8.1-fpm
    sudo systemctl reload nginx
    
    echo "✅ Deployment completed!"
EOF

# Verify
echo "🔍 Verifying deployment..."
sleep 5

case \$ENVIRONMENT in
    staging)
        curl -f https://staging.myshop.com/health || exit 1
        ;;
    production)
        curl -f https://www.myshop.com/health || exit 1
        ;;
esac

echo "✅ Verification passed!"
</code></pre>

        <h2 class="section-title">4. Rsync Deploy Strategy</h2>

        <pre><code class="language-bash">#!/bin/bash
# rsync-deploy.sh

ENVIRONMENT=\$1
SOURCE="./build/"
EXCLUDE_FILE=".deployignore"

case \$ENVIRONMENT in
    staging)
        DEST="deploy@staging:/var/www/prestashop/"
        ;;
    production)
        DEST="deploy@prod:/var/www/prestashop/"
        ;;
esac

echo "📦 Building application..."
composer install --no-dev --optimize-autoloader
npm run build

echo "🚀 Deploying via rsync..."
rsync -avz --delete \\
    --exclude-from=\$EXCLUDE_FILE \\
    --progress \\
    \$SOURCE \$DEST

echo "🔄 Post-deployment tasks..."
ssh \${DEST%%:*} << EOF
    cd /var/www/prestashop
    php bin/console cache:clear --env=prod
    sudo systemctl reload php8.1-fpm nginx
EOF

echo "✅ Deployment completed!"
</code></pre>

        <pre><code class="language-plaintext"># .deployignore
.git/
.github/
node_modules/
tests/
var/cache/
var/log/
.env.local
.env.test
*.md
composer.lock
package-lock.json
</code></pre>

        <h2 class="section-title">5. Docker Deployment</h2>

        <pre><code class="language-yaml"># .github/workflows/docker-cd.yml
name: Docker CD

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build Docker image
        run: docker build -t myshop/prestashop:\${{ github.sha }} .
      
      - name: Push to registry
        run: |
          echo \${{ secrets.DOCKER_PASSWORD }} | docker login -u \${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push myshop/prestashop:\${{ github.sha }}
          docker tag myshop/prestashop:\${{ github.sha }} myshop/prestashop:latest
          docker push myshop/prestashop:latest
      
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: \${{ secrets.HOST }}
          username: \${{ secrets.USERNAME }}
          key: \${{ secrets.SSH_KEY }}
          script: |
            cd /var/www
            docker-compose pull
            docker-compose up -d --no-deps --build prestashop
            docker-compose exec prestashop php bin/console cache:clear
</code></pre>

        <h2 class="section-title">6. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ CD Efectivo:</strong>
            <ul class="mb-0">
                <li>Staging automático, producción con aprobación</li>
                <li>Backup antes de cada deploy</li>
                <li>Maintenance mode durante deploy</li>
                <li>Verificación post-deploy (health checks)</li>
                <li>Notificaciones al equipo</li>
                <li>Rollback plan siempre disponible</li>
                <li>Deploy en horarios de bajo tráfico</li>
                <li>Monitoreo activo durante y post-deploy</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Consideraciones PrestaShop:</strong>
            <ul class="mb-0">
                <li>Nunca deploy en horarios pico de ventas</li>
                <li>Backup BD obligatorio antes de deploy</li>
                <li>Migrations tested en staging primero</li>
                <li>Cache clear post-deployment</li>
                <li>Verificar checkout flow post-deploy</li>
                <li>Monitor error logs durante 30min post-deploy</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>🎯 Métricas CD:</strong>
            <ul class="mb-0">
                <li><strong>Deployment Frequency:</strong> Diario (staging), Semanal (prod)</li>
                <li><strong>Lead Time:</strong> < 1 hora (commit → staging)</li>
                <li><strong>MTTR:</strong> < 15 minutos</li>
                <li><strong>Change Failure Rate:</strong> < 10%</li>
            </ul>
        </div>
    </div>
`;

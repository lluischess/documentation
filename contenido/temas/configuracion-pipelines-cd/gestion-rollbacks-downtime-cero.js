// @ts-nocheck
const gestionRollbacksDowntimeCero = `
    <div class="content-section">
        <h1 id="gestion-rollbacks-downtime-cero">Gestión de Rollbacks y Downtime Cero</h1>
        <p>Estrategias de rollback rápido y técnicas de zero-downtime deployment para PrestaShop 8.9+.</p>

        <h2 class="section-title">1. Rollback Automático</h2>

        <pre><code class="language-bash">#!/bin/bash
# auto-rollback.sh

CURRENT_VERSION=\$(cat /var/www/prestashop/VERSION)
BACKUP_PATH="/var/www/backups"

deploy() {
    local NEW_VERSION=\$1
    
    echo "📦 Backing up current version (\$CURRENT_VERSION)..."
    tar -czf \$BACKUP_PATH/\$CURRENT_VERSION.tar.gz /var/www/prestashop
    
    echo "🚀 Deploying \$NEW_VERSION..."
    # Deploy logic here
    
    echo "🔍 Health check..."
    sleep 10
    
    if ! curl -f http://localhost/health; then
        echo "❌ Health check failed, rolling back..."
        rollback \$CURRENT_VERSION
        exit 1
    fi
    
    echo "✅ Deployment successful"
}

rollback() {
    local VERSION=\$1
    
    echo "⏪ Rolling back to \$VERSION..."
    
    cd /var/www
    tar -xzf \$BACKUP_PATH/\$VERSION.tar.gz
    
    php prestashop/bin/console cache:clear --env=prod
    systemctl reload php8.1-fpm nginx
    
    echo "✅ Rollback completed"
}
</code></pre>

        <h2 class="section-title">2. Database Rollback</h2>

        <pre><code class="language-bash">#!/bin/bash
# db-rollback.sh

backup_db() {
    local TIMESTAMP=\$(date +%Y%m%d-%H%M%S)
    mysqldump prestashop > ~/backups/db-\$TIMESTAMP.sql
    echo \$TIMESTAMP > ~/backups/latest-db-backup.txt
}

rollback_db() {
    local BACKUP_FILE=\$1
    
    echo "⏪ Rolling back database..."
    
    # Backup current state first
    backup_db
    
    # Restore
    mysql prestashop < \$BACKUP_FILE
    
    echo "✅ Database rolled back"
}

# Uso
backup_db
# Deploy...
# If fails:
LATEST=\$(cat ~/backups/latest-db-backup.txt)
rollback_db ~/backups/db-\$LATEST.sql
</code></pre>

        <h2 class="section-title">3. Zero-Downtime Techniques</h2>

        <h3>3.1. Symlink Switching</h3>

        <pre><code class="language-bash">#!/bin/bash
# zero-downtime-deploy.sh

RELEASES_DIR="/var/www/releases"
CURRENT_LINK="/var/www/prestashop"
NEW_RELEASE=\$(date +%Y%m%d-%H%M%S)

echo "📦 Creating new release: \$NEW_RELEASE"
mkdir -p \$RELEASES_DIR/\$NEW_RELEASE

# Deploy to new release
cd \$RELEASES_DIR/\$NEW_RELEASE
git clone https://github.com/user/prestashop.git .
composer install --no-dev --optimize-autoloader

# Share persistent data
ln -s /var/www/shared/var/log var/log
ln -s /var/www/shared/var/cache var/cache
ln -s /var/www/shared/.env .env

# Warm cache
php bin/console cache:warmup --env=prod

# Atomic switch
ln -sfn \$RELEASES_DIR/\$NEW_RELEASE \$CURRENT_LINK

# Reload (no restart needed)
systemctl reload php8.1-fpm nginx

echo "✅ Deployed with zero downtime"

# Cleanup old releases (keep last 5)
cd \$RELEASES_DIR
ls -t | tail -n +6 | xargs rm -rf
</code></pre>

        <h3>3.2. Database Migrations Zero-Downtime</h3>

        <pre><code class="language-php"><?php
// Backward-compatible migration strategy

// OLD CODE (v1.0) - reads 'price' column
\$product->getPrice();

// MIGRATION v1.1 - Add new column, keep old
ALTER TABLE product ADD COLUMN price_decimal DECIMAL(10,2);
UPDATE product SET price_decimal = price / 100;

// NEW CODE (v1.1) - reads 'price_decimal', writes both
\$product->getPriceDecimal(); // New method
\$product->setPrice(\$price); // Writes both columns

// MIGRATION v1.2 - Remove old column (after all instances updated)
ALTER TABLE product DROP COLUMN price;
</code></pre>

        <h2 class="section-title">4. GitHub Actions Rollback</h2>

        <pre><code class="language-yaml"># .github/workflows/rollback.yml
name: Rollback

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to rollback to'
        required: true
        type: string

jobs:
  rollback:
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - name: Confirm rollback
        run: |
          echo "Rolling back to version \${{ inputs.version }}"
          echo "Current production version will be backed up"
      
      - name: Execute rollback
        uses: appleboy/ssh-action@master
        with:
          host: \${{ secrets.HOST }}
          username: \${{ secrets.USERNAME }}
          key: \${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/releases
            
            # Check version exists
            if [ ! -d "\${{ inputs.version }}" ]; then
              echo "Version not found"
              exit 1
            fi
            
            # Switch to old version
            ln -sfn /var/www/releases/\${{ inputs.version }} /var/www/prestashop
            
            # Clear cache
            php /var/www/prestashop/bin/console cache:clear --env=prod
            
            # Reload services
            sudo systemctl reload php8.1-fpm nginx
      
      - name: Verify rollback
        run: |
          sleep 10
          curl -f https://www.myshop.com/health || exit 1
      
      - name: Notify team
        uses: 8398a7/action-slack@v3
        with:
          status: \${{ job.status }}
          text: '⏪ Rolled back to \${{ inputs.version }}'
          webhook_url: \${{ secrets.SLACK_WEBHOOK }}
</code></pre>

        <h2 class="section-title">5. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Zero-Downtime:</strong>
            <ul class="mb-0">
                <li>Symlink atomic switching</li>
                <li>Blue-Green deployment</li>
                <li>Backward-compatible migrations</li>
                <li>Shared persistent data</li>
                <li>Health checks pre/post deploy</li>
                <li>Reload services (no restart)</li>
                <li>Keep 5 últimas releases</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>🎯 Rollback Strategy:</strong>
            <ul class="mb-0">
                <li><strong>Code:</strong> Symlink switch (< 1 seg)</li>
                <li><strong>Database:</strong> Backup + restore (< 5 min)</li>
                <li><strong>Files:</strong> Tar backup (< 2 min)</li>
                <li><strong>Full system:</strong> Blue-Green switch (instantáneo)</li>
            </ul>
        </div>
    </div>
`;

// @ts-nocheck
const configuracionVariablesEntornoSeguras = `
    <div class="content-section">
        <h1 id="configuracion-variables-entorno-seguras">Configuración de Variables de Entorno Seguras</h1>
        <p>Gestión segura de configuración y variables de entorno para diferentes ambientes en PrestaShop 8.9+.</p>

        <h2 class="section-title">1. Estructura de Configuración por Ambiente</h2>

        <pre><code class="language-plaintext">.env                    # Valores por defecto (commiteado)
.env.local              # Overrides locales (gitignored)
.env.staging            # Staging config (gitignored)
.env.production         # Production config (gitignored)
.env.test               # Test config (commiteado)
</code></pre>

        <pre><code class="language-bash"># .env (defaults)
APP_ENV=prod
APP_DEBUG=0
DATABASE_HOST=localhost
DATABASE_NAME=prestashop

# .env.production (secrets, nunca commitear)
DATABASE_HOST=prod-db.myshop.com
DATABASE_USER=prestashop_prod
DATABASE_PASSWORD=super_secret_password
STRIPE_SECRET_KEY=sk_live_xxxx
</code></pre>

        <h2 class="section-title">2. GitHub Actions - Environment Variables</h2>

        <pre><code class="language-yaml"># .github/workflows/deploy.yml
jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    environment: staging
    
    steps:
      - name: Create .env
        run: |
          cat << EOF > .env.local
          APP_ENV=prod
          DATABASE_HOST=\${{ secrets.DB_HOST_STAGING }}
          DATABASE_NAME=\${{ secrets.DB_NAME_STAGING }}
          DATABASE_USER=\${{ secrets.DB_USER_STAGING }}
          DATABASE_PASSWORD=\${{ secrets.DB_PASSWORD_STAGING }}
          STRIPE_SECRET_KEY=\${{ secrets.STRIPE_KEY_STAGING }}
          EOF
      
      - name: Deploy
        run: |
          rsync -avz .env.local deploy@staging:/var/www/prestashop/.env.local
</code></pre>

        <h2 class="section-title">3. GitLab CI - Protected Variables</h2>

        <pre><code class="language-yaml"># .gitlab-ci.yml
deploy:production:
  environment:
    name: production
  script:
    - echo "DATABASE_HOST=\$DB_HOST_PROD" > .env.local
    - echo "DATABASE_PASSWORD=\$DB_PASSWORD_PROD" >> .env.local
    - scp .env.local deploy@prod:/var/www/prestashop/.env.local
  only:
    - main

# Variables en GitLab: Settings → CI/CD → Variables
# - DB_HOST_PROD (protected, masked)
# - DB_PASSWORD_PROD (protected, masked)
</code></pre>

        <h2 class="section-title">4. Vault Integration</h2>

        <pre><code class="language-yaml"># GitHub Actions con Vault
- name: Import secrets from Vault
  uses: hashicorp/vault-action@v2
  with:
    url: https://vault.myshop.com
    token: \${{ secrets.VAULT_TOKEN }}
    secrets: |
      secret/data/prod/database host | DB_HOST ;
      secret/data/prod/database password | DB_PASSWORD ;
      secret/data/prod/stripe secret_key | STRIPE_KEY

- name: Create .env
  run: |
    cat << EOF > .env.local
    DATABASE_HOST=\${{ env.DB_HOST }}
    DATABASE_PASSWORD=\${{ env.DB_PASSWORD }}
    STRIPE_SECRET_KEY=\${{ env.STRIPE_KEY }}
    EOF
</code></pre>

        <h2 class="section-title">5. Deploy Script con Variables</h2>

        <pre><code class="language-bash">#!/bin/bash
# deploy-with-env.sh

ENVIRONMENT=\$1

# Load environment variables
case \$ENVIRONMENT in
    staging)
        source ~/.env.staging
        SERVER="deploy@staging"
        ;;
    production)
        source ~/.env.production
        SERVER="deploy@prod"
        ;;
esac

# Create .env.local on server
ssh \$SERVER << EOF
cat << ENV > /var/www/prestashop/.env.local
APP_ENV=prod
DATABASE_HOST=\$DB_HOST
DATABASE_USER=\$DB_USER
DATABASE_PASSWORD=\$DB_PASSWORD
STRIPE_SECRET_KEY=\$STRIPE_KEY
ENV

chmod 600 /var/www/prestashop/.env.local
chown www-data:www-data /var/www/prestashop/.env.local
EOF
</code></pre>

        <h2 class="section-title">6. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Variables de Entorno:</strong>
            <ul class="mb-0">
                <li>Nunca commitear .env.local / .env.production</li>
                <li>Usar GitHub/GitLab Secrets para CI/CD</li>
                <li>Variables específicas por ambiente</li>
                <li>Permisos 600 en archivos .env</li>
                <li>Masked variables en GitLab</li>
                <li>Vault para secrets empresariales</li>
                <li>Rotar secrets regularmente</li>
            </ul>
        </div>
    </div>
`;

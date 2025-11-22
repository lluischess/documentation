// @ts-nocheck
const gestionSecretsCD = `
    <div class="content-section">
        <h1 id="gestion-secrets-cd">Gestión de Secrets en CD</h1>
        <p>Gestión segura de secrets y credenciales en pipelines de Continuous Deployment para PrestaShop 8.9+.</p>

        <h2 class="section-title">1. GitHub Secrets en CD</h2>

        <pre><code class="language-yaml"># .github/workflows/cd.yml
jobs:
  deploy:
    environment: production
    steps:
      - name: Deploy with secrets
        env:
          DB_PASSWORD: \${{ secrets.DB_PASSWORD }}
          API_KEY: \${{ secrets.STRIPE_API_KEY }}
          SSH_KEY: \${{ secrets.SSH_PRIVATE_KEY }}
        run: |
          # Secrets automáticamente masked en logs
          echo "\$SSH_KEY" | ssh-add -
          ssh deploy@prod "deploy.sh"
</code></pre>

        <h2 class="section-title">2. GitLab Protected Variables</h2>

        <pre><code class="language-yaml"># .gitlab-ci.yml
deploy:production:
  environment: production
  script:
    # Variables protegidas solo disponibles en protected branches
    - echo "DB_PASSWORD=\$DB_PASSWORD_PROD" > .env
    - scp .env deploy@prod:/var/www/.env
  only:
    - main  # Protected branch
</code></pre>

        <h2 class="section-title">3. HashiCorp Vault</h2>

        <pre><code class="language-yaml"># GitHub Actions con Vault
- name: Import secrets
  uses: hashicorp/vault-action@v2
  with:
    url: https://vault.company.com
    token: \${{ secrets.VAULT_TOKEN }}
    secrets: |
      secret/data/prod/db password | DB_PASSWORD ;
      secret/data/prod/stripe api_key | STRIPE_KEY
</code></pre>

        <h2 class="section-title">4. AWS Secrets Manager</h2>

        <pre><code class="language-yaml"># GitHub Actions - AWS Secrets
- name: Get secrets from AWS
  run: |
    DB_PASSWORD=\$(aws secretsmanager get-secret-value \\
      --secret-id prod/db/password \\
      --query SecretString \\
      --output text)
    
    echo "::add-mask::\$DB_PASSWORD"
    echo "DB_PASSWORD=\$DB_PASSWORD" >> \$GITHUB_ENV
</code></pre>

        <h2 class="section-title">5. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Secrets Management:</strong>
            <ul class="mb-0">
                <li>Nunca hardcodear secrets</li>
                <li>Usar secret managers (Vault, AWS Secrets)</li>
                <li>Protected variables solo en main</li>
                <li>Rotar secrets cada 90 días</li>
                <li>Audit logs de acceso a secrets</li>
                <li>Masked values en logs</li>
                <li>Least privilege principle</li>
                <li>Secrets específicos por ambiente</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Nunca:</strong>
            <ul class="mb-0">
                <li>Commit secrets en código</li>
                <li>Echo secrets sin masking</li>
                <li>Compartir secrets entre proyectos</li>
                <li>Usar mismos secrets dev/prod</li>
                <li>Secrets en PRs de forks públicos</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>🔐 Herramientas Recomendadas:</strong>
            <ul class="mb-0">
                <li><strong>Pequeño proyecto:</strong> GitHub Secrets</li>
                <li><strong>Empresa:</strong> HashiCorp Vault</li>
                <li><strong>AWS:</strong> AWS Secrets Manager</li>
                <li><strong>Azure:</strong> Azure Key Vault</li>
                <li><strong>GCP:</strong> Secret Manager</li>
            </ul>
        </div>
    </div>
`;

// @ts-nocheck
const seguridadPipelinesCredenciales = `
    <div class="content-section">
        <h1 id="seguridad-pipelines-credenciales">Seguridad en Pipelines CI y Gestión de Credenciales</h1>
        <p>Mejores prácticas de seguridad y gestión segura de secrets en GitHub Actions y GitLab CI para proyectos PrestaShop 8.9+.</p>

        <h2 class="section-title">1. GitHub Secrets</h2>

        <pre><code class="language-yaml"># Uso de secrets en GitHub Actions
jobs:
  deploy:
    steps:
      - name: Deploy
        env:
          SSH_KEY: \${{ secrets.SSH_PRIVATE_KEY }}
          DB_PASSWORD: \${{ secrets.DB_PASSWORD }}
          API_TOKEN: \${{ secrets.API_TOKEN }}
        run: |
          echo "\$SSH_KEY" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa
          # Deploy con credenciales seguras
</code></pre>

        <h2 class="section-title">2. GitLab CI Variables</h2>

        <pre><code class="language-yaml"># .gitlab-ci.yml
# Variables protegidas en Settings → CI/CD → Variables
deploy:
  script:
    - echo "Deploying with \$DB_PASSWORD"
    - scp -i \$SSH_KEY app.tar.gz user@server:/path
  only:
    - main
  # Variables marcadas como "protected" solo en protected branches
</code></pre>

        <h2 class="section-title">3. Vault Integration</h2>

        <pre><code class="language-yaml"># GitHub Actions con HashiCorp Vault
- name: Import Secrets from Vault
  uses: hashicorp/vault-action@v2
  with:
    url: https://vault.example.com
    token: \${{ secrets.VAULT_TOKEN }}
    secrets: |
      secret/data/production db_password | DB_PASSWORD ;
      secret/data/production api_key | API_KEY
</code></pre>

        <h2 class="section-title">4. Seguridad en Logs</h2>

        <pre><code class="language-yaml"># Ocultar valores sensibles en logs
- name: Setup environment
  run: |
    echo "::add-mask::\${{ secrets.API_KEY }}"
    export API_KEY=\${{ secrets.API_KEY }}
    # API_KEY no se mostrará en logs
</code></pre>

        <h2 class="section-title">5. OIDC para AWS</h2>

        <pre><code class="language-yaml"># GitHub Actions OIDC con AWS (sin credenciales estáticas)
permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    steps:
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789:role/GitHubActionsRole
          aws-region: us-east-1
      
      - name: Deploy to S3
        run: aws s3 sync ./build s3://my-bucket/
</code></pre>

        <h2 class="section-title">6. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Seguridad:</strong>
            <ul class="mb-0">
                <li>Nunca hardcodear secrets</li>
                <li>Secrets específicos por ambiente</li>
                <li>Protected secrets solo en main</li>
                <li>Rotar secrets regularmente</li>
                <li>OIDC en lugar de credenciales estáticas</li>
                <li>Audit logs de uso de secrets</li>
                <li>Mask sensitive values en logs</li>
                <li>Least privilege principle</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Nunca Hacer:</strong>
            <ul class="mb-0">
                <li>Commit secrets en código</li>
                <li>Echo secrets sin masking</li>
                <li>Secrets en pull requests de forks</li>
                <li>Compartir secrets entre proyectos</li>
                <li>Usar mismos secrets en dev/prod</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>🔐 Tools Recomendadas:</strong>
            <ul class="mb-0">
                <li><strong>GitHub:</strong> GitHub Secrets + OIDC</li>
                <li><strong>GitLab:</strong> CI/CD Variables + Vault</li>
                <li><strong>Enterprise:</strong> HashiCorp Vault</li>
                <li><strong>AWS:</strong> AWS Secrets Manager + OIDC</li>
            </ul>
        </div>
    </div>
`;

// @ts-nocheck
const integracionInfraestructuraSSHKubernetesCloud = `
    <div class="content-section">
        <h1 id="integracion-infraestructura-ssh-kubernetes-cloud">Integración con Infraestructura (SSH, Kubernetes, Cloud Providers)</h1>
        <p>Conexión de pipelines CD con infraestructura: SSH, Kubernetes, AWS, Azure, GCP para PrestaShop 8.9+.</p>

        <h2 class="section-title">1. SSH Deployment</h2>

        <pre><code class="language-yaml"># GitHub Actions - SSH Deploy
- name: Deploy via SSH
  uses: appleboy/ssh-action@master
  with:
    host: \${{ secrets.HOST }}
    username: \${{ secrets.USERNAME }}
    key: \${{ secrets.SSH_PRIVATE_KEY }}
    port: 22
    script: |
      cd /var/www/prestashop
      git pull origin main
      composer install --no-dev
      php bin/console cache:clear
      sudo systemctl reload php8.1-fpm nginx
</code></pre>

        <h2 class="section-title">2. Kubernetes Deployment</h2>

        <pre><code class="language-yaml"># GitHub Actions - Deploy to K8s
- name: Set up kubectl
  uses: azure/setup-kubectl@v3

- name: Configure kubectl
  run: |
    echo "\${{ secrets.KUBE_CONFIG }}" > kubeconfig
    export KUBECONFIG=./kubeconfig

- name: Deploy to Kubernetes
  run: |
    kubectl set image deployment/prestashop \\
      prestashop=myshop/prestashop:\${{ github.sha }}
    
    kubectl rollout status deployment/prestashop
</code></pre>

        <h2 class="section-title">3. AWS Deployment</h2>

        <pre><code class="language-yaml"># GitHub Actions - AWS ECS
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::123456789:role/GitHubActionsRole
    aws-region: us-east-1

- name: Deploy to ECS
  run: |
    aws ecs update-service \\
      --cluster prestashop-cluster \\
      --service prestashop-service \\
      --force-new-deployment
</code></pre>

        <h2 class="section-title">4. Terraform Integration</h2>

        <pre><code class="language-yaml"># .github/workflows/terraform-deploy.yml
- name: Setup Terraform
  uses: hashicorp/setup-terraform@v2

- name: Terraform Init
  run: terraform init

- name: Terraform Plan
  run: terraform plan -out=tfplan

- name: Terraform Apply
  run: terraform apply -auto-approve tfplan
</code></pre>

        <h2 class="section-title">5. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Integración Infraestructura:</strong>
            <ul class="mb-0">
                <li><strong>SSH:</strong> Usar SSH keys, no passwords</li>
                <li><strong>K8s:</strong> OIDC para autenticación</li>
                <li><strong>AWS:</strong> IAM roles en lugar de access keys</li>
                <li><strong>Terraform:</strong> Remote state en S3</li>
            </ul>
        </div>
    </div>
`;

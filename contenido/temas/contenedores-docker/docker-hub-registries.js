// @ts-nocheck
const dockerHubRegistries = `
    <div class="content-section">
        <h1 id="docker-hub-registries">Docker Hub y Registries Privados</h1>
        <p>Gestión de imágenes en Docker Hub, registries privados, automatización CI/CD y distribución segura de contenedores para PrestaShop 8.9+.</p>

        <h2 class="section-title">1. Docker Hub</h2>

        <h3>1.1. Autenticación</h3>

        <pre><code class="language-bash"># Login en Docker Hub
docker login
# Username: tu-usuario
# Password: ***

# Login con token (recomendado)
echo $DOCKER_TOKEN | docker login -u tu-usuario --password-stdin

# Ver info de autenticación
cat ~/.docker/config.json

# Logout
docker logout
</code></pre>

        <h3>1.2. Push y Pull</h3>

        <pre><code class="language-bash"># Pull imagen pública
docker pull prestashop/prestashop:8.9

# Tag con tu usuario
docker tag prestashop:latest tu-usuario/prestashop-custom:8.9

# Push a Docker Hub
docker push tu-usuario/prestashop-custom:8.9

# Push todas las tags
docker push tu-usuario/prestashop-custom --all-tags

# Pull tu imagen
docker pull tu-usuario/prestashop-custom:8.9
</code></pre>

        <h3>1.3. Repositorios Privados</h3>

        <pre><code class="language-bash"># Crear repo privado en hub.docker.com
# Free: 1 repo privado
# Pro: Repos privados ilimitados

# Push a repo privado
docker push tu-usuario/prestashop-private:latest

# Pull requiere autenticación
docker login
docker pull tu-usuario/prestashop-private:latest
</code></pre>

        <h2 class="section-title">2. Registry Privado Local</h2>

        <h3>2.1. Desplegar Registry</h3>

        <pre><code class="language-bash"># Registry básico
docker run -d \\
  -p 5000:5000 \\
  --name registry \\
  --restart always \\
  -v registry-data:/var/lib/registry \\
  registry:2

# Con autenticación básica
docker run -d \\
  -p 5000:5000 \\
  --name registry \\
  --restart always \\
  -v registry-data:/var/lib/registry \\
  -v /path/to/auth:/auth \\
  -e "REGISTRY_AUTH=htpasswd" \\
  -e "REGISTRY_AUTH_HTPASSWD_REALM=Registry Realm" \\
  -e "REGISTRY_AUTH_HTPASSWD_PATH=/auth/htpasswd" \\
  registry:2

# Crear usuario
mkdir auth
docker run --rm --entrypoint htpasswd httpd:2 \\
  -Bbn admin password > auth/htpasswd
</code></pre>

        <h3>2.2. Usar Registry Local</h3>

        <pre><code class="language-bash"># Tag para registry local
docker tag prestashop:latest localhost:5000/prestashop:8.9

# Push a registry local
docker push localhost:5000/prestashop:8.9

# Pull desde registry local
docker pull localhost:5000/prestashop:8.9

# Listar imágenes en registry
curl http://localhost:5000/v2/_catalog

# Ver tags de imagen
curl http://localhost:5000/v2/prestashop/tags/list
</code></pre>

        <h3>2.3. Registry con HTTPS</h3>

        <pre><code class="language-bash"># Generar certificado SSL
mkdir certs
openssl req -newkey rsa:4096 -nodes -sha256 \\
  -keyout certs/domain.key -x509 -days 365 \\
  -out certs/domain.crt \\
  -subj "/CN=registry.mycompany.com"

# Registry con TLS
docker run -d \\
  -p 443:443 \\
  --name registry \\
  --restart always \\
  -v registry-data:/var/lib/registry \\
  -v $(pwd)/certs:/certs \\
  -e REGISTRY_HTTP_ADDR=0.0.0.0:443 \\
  -e REGISTRY_HTTP_TLS_CERTIFICATE=/certs/domain.crt \\
  -e REGISTRY_HTTP_TLS_KEY=/certs/domain.key \\
  registry:2

# Usar registry HTTPS
docker tag prestashop:latest registry.mycompany.com/prestashop:8.9
docker push registry.mycompany.com/prestashop:8.9
</code></pre>

        <h2 class="section-title">3. Alternativas a Docker Hub</h2>

        <h3>3.1. GitHub Container Registry</h3>

        <pre><code class="language-bash"># Login con token de GitHub
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Tag con ghcr.io
docker tag prestashop:latest ghcr.io/usuario/prestashop:8.9

# Push
docker push ghcr.io/usuario/prestashop:8.9

# Pull
docker pull ghcr.io/usuario/prestashop:8.9
</code></pre>

        <h3>3.2. AWS ECR</h3>

        <pre><code class="language-bash"># Login en ECR
aws ecr get-login-password --region eu-west-1 | \\
  docker login --username AWS --password-stdin \\
  123456789012.dkr.ecr.eu-west-1.amazonaws.com

# Crear repositorio
aws ecr create-repository --repository-name prestashop

# Tag
docker tag prestashop:latest \\
  123456789012.dkr.ecr.eu-west-1.amazonaws.com/prestashop:8.9

# Push
docker push 123456789012.dkr.ecr.eu-west-1.amazonaws.com/prestashop:8.9
</code></pre>

        <h3>3.3. Google Container Registry</h3>

        <pre><code class="language-bash"># Configurar autenticación
gcloud auth configure-docker

# Tag con gcr.io
docker tag prestashop:latest gcr.io/project-id/prestashop:8.9

# Push
docker push gcr.io/project-id/prestashop:8.9
</code></pre>

        <h3>3.4. Azure Container Registry</h3>

        <pre><code class="language-bash"># Login en ACR
az acr login --name myregistry

# Tag
docker tag prestashop:latest myregistry.azurecr.io/prestashop:8.9

# Push
docker push myregistry.azurecr.io/prestashop:8.9
</code></pre>

        <h2 class="section-title">4. Harbor (Registry Enterprise)</h2>

        <pre><code class="language-yaml"># docker-compose.yml para Harbor
version: '3.8'

services:
  registry:
    image: goharbor/registry-photon:v2.5.0
    volumes:
      - registry-data:/storage
  
  registryctl:
    image: goharbor/harbor-registryctl:v2.5.0
  
  core:
    image: goharbor/harbor-core:v2.5.0
    depends_on:
      - registry
  
  portal:
    image: goharbor/harbor-portal:v2.5.0
    ports:
      - "80:8080"
  
  database:
    image: goharbor/harbor-db:v2.5.0
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  registry-data:
  db-data:

# Harbor incluye:
# - UI web
# - Scan de vulnerabilidades
# - Replicación
# - RBAC
# - Webhooks
</code></pre>

        <h2 class="section-title">5. CI/CD con Registry</h2>

        <h3>5.1. GitHub Actions</h3>

        <pre><code class="language-yaml"># .github/workflows/docker.yml
name: Build and Push

on:
  push:
    branches: [ main ]
    tags: [ 'v*' ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: \${{ secrets.DOCKERHUB_USERNAME }}
          password: \${{ secrets.DOCKERHUB_TOKEN }}
      
      - name: Login to GHCR
        uses: docker/login-action@v2
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}
      
      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: |
            usuario/prestashop:latest
            usuario/prestashop:\${{ github.sha }}
            ghcr.io/usuario/prestashop:latest
</code></pre>

        <h3>5.2. GitLab CI</h3>

        <pre><code class="language-yaml"># .gitlab-ci.yml
variables:
  DOCKER_REGISTRY: registry.gitlab.com
  IMAGE_NAME: $CI_REGISTRY_IMAGE

stages:
  - build
  - push

build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker build -t $IMAGE_NAME:$CI_COMMIT_SHA .
    - docker push $IMAGE_NAME:$CI_COMMIT_SHA

push-tag:
  stage: push
  only:
    - tags
  script:
    - docker tag $IMAGE_NAME:$CI_COMMIT_SHA $IMAGE_NAME:$CI_COMMIT_TAG
    - docker push $IMAGE_NAME:$CI_COMMIT_TAG
</code></pre>

        <h2 class="section-title">6. Seguridad de Imágenes</h2>

        <h3>6.1. Firmar Imágenes (Content Trust)</h3>

        <pre><code class="language-bash"># Habilitar Docker Content Trust
export DOCKER_CONTENT_TRUST=1

# Generar claves
docker trust key generate mi-clave

# Firmar y push
docker trust sign usuario/prestashop:8.9

# Verificar firma
docker trust inspect usuario/prestashop:8.9

# Pull solo imágenes firmadas
docker pull usuario/prestashop:8.9
</code></pre>

        <h3>6.2. Escaneo de Vulnerabilidades</h3>

        <pre><code class="language-bash"># Trivy (recomendado)
trivy image prestashop:latest

# Docker Scout (integrado)
docker scout cves prestashop:latest

# Snyk
snyk container test prestashop:latest

# Clair (Harbor)
# UI de Harbor incluye escaneo automático

# Anchore
anchore-cli image add prestashop:latest
anchore-cli image vuln prestashop:latest all
</code></pre>

        <h2 class="section-title">7. Caché y Mirrors</h2>

        <pre><code class="language-bash"># Registry como pull-through cache
docker run -d -p 5000:5000 \\
  --name registry-mirror \\
  -v mirror-data:/var/lib/registry \\
  -e REGISTRY_PROXY_REMOTEURL=https://registry-1.docker.io \\
  registry:2

# Configurar Docker daemon
# /etc/docker/daemon.json
{
  "registry-mirrors": ["http://localhost:5000"]
}

sudo systemctl restart docker

# Ahora pulls usan el cache
docker pull nginx  # Se cachea en localhost:5000
</code></pre>

        <h2 class="section-title">8. Gestión de Imágenes</h2>

        <pre><code class="language-bash"># Listar imágenes en registry
curl http://localhost:5000/v2/_catalog | jq

# Ver tags
curl http://localhost:5000/v2/prestashop/tags/list | jq

# Obtener digest
curl -H "Accept: application/vnd.docker.distribution.manifest.v2+json" \\
  http://localhost:5000/v2/prestashop/manifests/8.9 | jq .config.digest

# Eliminar imagen (requiere garbage collection)
curl -X DELETE http://localhost:5000/v2/prestashop/manifests/sha256:...

# Garbage collection
docker exec registry bin/registry garbage-collect /etc/docker/registry/config.yml
</code></pre>

        <h2 class="section-title">9. Backup de Registry</h2>

        <pre><code class="language-bash"># Backup del volumen
docker run --rm \\
  -v registry-data:/source:ro \\
  -v $(pwd):/backup \\
  busybox \\
  tar czf /backup/registry-backup-$(date +%Y%m%d).tar.gz -C /source .

# Restore
docker run --rm \\
  -v registry-data:/target \\
  -v $(pwd):/backup \\
  busybox \\
  tar xzf /backup/registry-backup.tar.gz -C /target

# Sync entre registries
skopeo sync --src docker --dest docker \\
  source-registry.com/prestashop \\
  dest-registry.com/prestashop
</code></pre>

        <h2 class="section-title">10. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Registries:</strong>
            <ul class="mb-0">
                <li>Registry privado para imágenes internas</li>
                <li>HTTPS obligatorio en producción</li>
                <li>Autenticación y autorización (RBAC)</li>
                <li>Escaneo automático de vulnerabilidades</li>
                <li>Firmado de imágenes (Content Trust)</li>
                <li>Backup automático de registry</li>
                <li>Política de retención (eliminar imágenes viejas)</li>
                <li>Tags versionados (no solo :latest)</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Evitar:</strong>
            <ul class="mb-0">
                <li>Registry HTTP sin autenticación</li>
                <li>Imágenes públicas con datos sensibles</li>
                <li>Depender solo de :latest</li>
                <li>Registry sin backup</li>
                <li>Push directo a producción sin CI/CD</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>🏗️ Estrategia de Registry:</strong>
            <ul class="mb-0">
                <li><strong>Desarrollo:</strong> Registry local o Docker Hub</li>
                <li><strong>CI/CD:</strong> GitHub/GitLab Registry</li>
                <li><strong>Staging:</strong> Registry privado con escaneo</li>
                <li><strong>Producción:</strong> Registry enterprise (Harbor) o cloud (ECR/GCR)</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>💡 Comparación de Registries:</strong>
            <table class="table table-sm">
                <tr>
                    <th>Registry</th>
                    <th>Ventajas</th>
                    <th>Uso</th>
                </tr>
                <tr>
                    <td>Docker Hub</td>
                    <td>Fácil, popular, gratis (público)</td>
                    <td>Open source, desarrollo</td>
                </tr>
                <tr>
                    <td>GHCR</td>
                    <td>Integrado GitHub, CI/CD</td>
                    <td>Proyectos GitHub</td>
                </tr>
                <tr>
                    <td>ECR/GCR/ACR</td>
                    <td>Integración cloud, seguro</td>
                    <td>Producción cloud</td>
                </tr>
                <tr>
                    <td>Harbor</td>
                    <td>Enterprise, full-featured</td>
                    <td>On-premise enterprise</td>
                </tr>
                <tr>
                    <td>Registry OSS</td>
                    <td>Simple, control total</td>
                    <td>Self-hosted básico</td>
                </tr>
            </table>
        </div>
    </div>
`;

// @ts-nocheck
const construccionImagenesDockerCI = `
    <div class="content-section">
        <h1 id="construccion-imagenes-docker-ci">Construcción de Imágenes Docker en CI</h1>
        <p>Automatización de build y push de imágenes Docker para PrestaShop 8.9+ en GitHub Actions y GitLab CI.</p>

        <h2 class="section-title">1. GitHub Actions - Docker Build & Push</h2>

        <pre><code class="language-yaml"># .github/workflows/docker.yml
name: Docker Build

on:
  push:
    branches: [ main ]
    tags: [ 'v*' ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: \${{ github.repository }}

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Log in to Container Registry
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
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha
      
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: \${{ steps.meta.outputs.tags }}
          labels: \${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
</code></pre>

        <h2 class="section-title">2. Multi-platform Build</h2>

        <pre><code class="language-yaml"># Build multi-arquitectura
- name: Build multi-platform
  uses: docker/build-push-action@v5
  with:
    context: .
    platforms: linux/amd64,linux/arm64
    push: true
    tags: myshop/prestashop:latest
</code></pre>

        <h2 class="section-title">3. GitLab CI - Docker Build</h2>

        <pre><code class="language-yaml"># .gitlab-ci.yml
build:docker:
  stage: build
  image: docker:24
  services:
    - docker:24-dind
  variables:
    DOCKER_DRIVER: overlay2
  before_script:
    - docker login -u \$CI_REGISTRY_USER -p \$CI_REGISTRY_PASSWORD \$CI_REGISTRY
  script:
    - docker build -t \$CI_REGISTRY_IMAGE:\$CI_COMMIT_SHORT_SHA .
    - docker push \$CI_REGISTRY_IMAGE:\$CI_COMMIT_SHORT_SHA
    - docker tag \$CI_REGISTRY_IMAGE:\$CI_COMMIT_SHORT_SHA \$CI_REGISTRY_IMAGE:latest
    - docker push \$CI_REGISTRY_IMAGE:latest
  only:
    - main
</code></pre>

        <h2 class="section-title">4. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Docker en CI:</strong>
            <ul class="mb-0">
                <li>Buildx para caching avanzado</li>
                <li>Multi-stage builds</li>
                <li>Tag con SHA y semantic version</li>
                <li>Scan de vulnerabilidades</li>
                <li>Multi-platform cuando necesario</li>
            </ul>
        </div>
    </div>
`;

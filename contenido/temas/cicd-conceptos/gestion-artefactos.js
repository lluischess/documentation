// @ts-nocheck
const gestionArtefactos = `
    <div class="content-section">
        <h1 id="gestion-artefactos">Gestión de Artefactos de Construcción</h1>
        <p>Almacenamiento, versionado y distribución de artefactos de build en proyectos PrestaShop 8.9+ con mejores prácticas.</p>

        <h2 class="section-title">1. ¿Qué son los Artefactos?</h2>

        <div class="alert alert-info">
            <strong>📦 Artefactos de Build:</strong>
            <ul class="mb-0">
                <li>Resultado compilado/procesado del código fuente</li>
                <li>Assets frontend minificados (CSS, JS)</li>
                <li>Dependencias vendor (composer, npm)</li>
                <li>Archives de deploy (.tar.gz, .zip)</li>
                <li>Docker images</li>
                <li>Reportes (coverage, quality)</li>
            </ul>
        </div>

        <h2 class="section-title">2. Tipos de Artefactos PrestaShop</h2>

        <table>
            <thead>
                <tr>
                    <th>Tipo</th>
                    <th>Descripción</th>
                    <th>Ejemplo</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Release Package</strong></td>
                    <td>Código listo para producción</td>
                    <td>prestashop-v1.2.3.tar.gz</td>
                </tr>
                <tr>
                    <td><strong>Docker Image</strong></td>
                    <td>Imagen containerizada</td>
                    <td>myshop/prestashop:1.2.3</td>
                </tr>
                <tr>
                    <td><strong>Frontend Assets</strong></td>
                    <td>CSS/JS compilados</td>
                    <td>theme/assets/dist/</td>
                </tr>
                <tr>
                    <td><strong>Dependencies</strong></td>
                    <td>Vendor packages</td>
                    <td>vendor/, node_modules/</td>
                </tr>
                <tr>
                    <td><strong>Reports</strong></td>
                    <td>Test coverage, quality</td>
                    <td>coverage.html, phpstan.txt</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">3. Almacenamiento de Artefactos</h2>

        <h3>3.1. GitHub Packages</h3>

        <pre><code class="language-yaml"># .github/workflows/release.yml
name: Create Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build-and-release:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Build
        run: |
          composer install --no-dev --optimize-autoloader
          npm ci --production
          npm run build
      
      - name: Create archive
        run: |
          tar -czf prestashop-\${{ github.ref_name }}.tar.gz \\
            --exclude='node_modules' \\
            --exclude='.git' \\
            .
      
      - name: Generate checksums
        run: |
          sha256sum prestashop-\${{ github.ref_name }}.tar.gz > checksums.txt
          md5sum prestashop-\${{ github.ref_name }}.tar.gz >> checksums.txt
      
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            prestashop-\${{ github.ref_name }}.tar.gz
            checksums.txt
          body: |
            ## Release \${{ github.ref_name }}
            
            ### Changes
            - Feature X
            - Bugfix Y
            
            ### Installation
            \`\`\`bash
            wget https://github.com/user/repo/releases/download/\${{ github.ref_name }}/prestashop-\${{ github.ref_name }}.tar.gz
            tar -xzf prestashop-\${{ github.ref_name }}.tar.gz
            \`\`\`
</code></pre>

        <h3>3.2. GitLab Package Registry</h3>

        <pre><code class="language-yaml"># .gitlab-ci.yml
release:
  stage: deploy
  script:
    - tar -czf prestashop-\${CI_COMMIT_TAG}.tar.gz .
    
    - 'curl --header "JOB-TOKEN: \${CI_JOB_TOKEN}" --upload-file prestashop-\${CI_COMMIT_TAG}.tar.gz "https://gitlab.com/api/v4/projects/\${CI_PROJECT_ID}/packages/generic/prestashop/\${CI_COMMIT_TAG}/prestashop-\${CI_COMMIT_TAG}.tar.gz"'
  
  only:
    - tags
</code></pre>

        <h3>3.3. Artifactory / Nexus</h3>

        <pre><code class="language-bash"># Upload a Artifactory
curl -u user:password \\
  -T prestashop-1.2.3.tar.gz \\
  "https://artifactory.company.com/prestashop-releases/1.2.3/prestashop-1.2.3.tar.gz"

# Download desde Artifactory
curl -u user:password \\
  -O "https://artifactory.company.com/prestashop-releases/1.2.3/prestashop-1.2.3.tar.gz"
</code></pre>

        <h2 class="section-title">4. Docker Image Registry</h2>

        <h3>4.1. GitHub Container Registry (ghcr.io)</h3>

        <pre><code class="language-yaml"># .github/workflows/docker.yml
name: Docker Build and Push

on:
  push:
    branches: [ main ]
    tags: [ 'v*' ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: \${{ github.repository }}

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    
    permissions:
      contents: read
      packages: write
    
    steps:
      - uses: actions/checkout@v4
      
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
          cache-from: type=registry,ref=\${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}:buildcache
          cache-to: type=registry,ref=\${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}:buildcache,mode=max
</code></pre>

        <h3>4.2. Docker Hub</h3>

        <pre><code class="language-bash"># Login
docker login -u username -p password

# Tag
docker tag myshop/prestashop:latest myshop/prestashop:1.2.3

# Push
docker push myshop/prestashop:1.2.3
docker push myshop/prestashop:latest

# Pull en servidor
docker pull myshop/prestashop:1.2.3
</code></pre>

        <h2 class="section-title">5. Versionado Semántico</h2>

        <pre><code class="language-plaintext">MAJOR.MINOR.PATCH

Ejemplo: 1.2.3

MAJOR (1): Breaking changes incompatibles
MINOR (2): Nueva funcionalidad compatible
PATCH (3): Bugfixes compatibles

Ejemplos:
- 1.0.0 → 1.0.1: Bugfix (PATCH)
- 1.0.1 → 1.1.0: Nueva feature (MINOR)
- 1.1.0 → 2.0.0: Breaking change (MAJOR)

Pre-releases:
- 1.0.0-alpha
- 1.0.0-beta.1
- 1.0.0-rc.1

Build metadata:
- 1.0.0+20240115
- 1.0.0+sha.abc123
</code></pre>

        <h3>5.1. Automated Versioning</h3>

        <pre><code class="language-yaml"># .github/workflows/version-bump.yml
name: Version Bump

on:
  workflow_dispatch:
    inputs:
      version_type:
        description: 'Version bump type'
        required: true
        type: choice
        options:
          - patch
          - minor
          - major

jobs:
  bump:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v3
      
      - name: Bump version
        run: npm version \${{ inputs.version_type }} -m "chore: bump version to %s"
      
      - name: Push changes
        run: |
          git push origin main
          git push origin --tags
</code></pre>

        <h2 class="section-title">6. Retention Policies</h2>

        <pre><code class="language-yaml"># Política de retención de artefactos

## GitHub Actions
- name: Upload artifacts
  uses: actions/upload-artifact@v3
  with:
    name: build-\${{ github.sha }}
    path: build/
    retention-days: 30  # Mantener 30 días

## GitLab CI
artifacts:
  paths:
    - build/
  expire_in: 30 days  # Auto-eliminar después de 30 días

## Estrategia recomendada
# - Builds de develop: 7 días
# - Builds de PRs: 3 días
# - Releases tagged: Permanente
# - Docker images: latest + 5 últimas versiones
</code></pre>

        <h2 class="section-title">7. Artifact Signing</h2>

        <pre><code class="language-bash"># GPG signing
# Generar key
gpg --full-generate-key

# Firmar artefacto
gpg --armor --detach-sign prestashop-1.2.3.tar.gz
# Genera: prestashop-1.2.3.tar.gz.asc

# Verificar firma
gpg --verify prestashop-1.2.3.tar.gz.asc prestashop-1.2.3.tar.gz

# Exportar public key
gpg --armor --export you@email.com > public-key.asc
</code></pre>

        <pre><code class="language-yaml"># Sign en CI/CD
- name: Import GPG key
  run: |
    echo "\${{ secrets.GPG_PRIVATE_KEY }}" | gpg --import

- name: Sign artifact
  run: |
    gpg --armor --detach-sign prestashop-\${{ github.ref_name }}.tar.gz

- name: Upload signed artifact
  uses: actions/upload-artifact@v3
  with:
    name: release-signed
    path: |
      prestashop-\${{ github.ref_name }}.tar.gz
      prestashop-\${{ github.ref_name }}.tar.gz.asc
</code></pre>

        <h2 class="section-title">8. Dependency Caching</h2>

        <pre><code class="language-yaml"># Cache Composer dependencies
- name: Cache Composer
  uses: actions/cache@v3
  with:
    path: vendor
    key: \${{ runner.os }}-composer-\${{ hashFiles('**/composer.lock') }}
    restore-keys: |
      \${{ runner.os }}-composer-

# Cache npm dependencies
- name: Cache npm
  uses: actions/cache@v3
  with:
    path: node_modules
    key: \${{ runner.os }}-node-\${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      \${{ runner.os }}-node-

# Cache Docker layers
- name: Docker layer cache
  uses: actions/cache@v3
  with:
    path: /tmp/.buildx-cache
    key: \${{ runner.os }}-buildx-\${{ github.sha }}
    restore-keys: |
      \${{ runner.os }}-buildx-
</code></pre>

        <h2 class="section-title">9. Artifact Management Script</h2>

        <pre><code class="language-bash">#!/bin/bash
# artifact-manager.sh

ACTION=\$1
VERSION=\$2
REGISTRY="ghcr.io/company/prestashop"

case "\$ACTION" in
  build)
    echo "Building artifact v\$VERSION..."
    tar -czf prestashop-\$VERSION.tar.gz \\
      --exclude='node_modules' \\
      --exclude='.git' .
    sha256sum prestashop-\$VERSION.tar.gz > prestashop-\$VERSION.tar.gz.sha256
    ;;
    
  upload)
    echo "Uploading artifact v\$VERSION..."
    gh release create v\$VERSION \\
      prestashop-\$VERSION.tar.gz \\
      prestashop-\$VERSION.tar.gz.sha256 \\
      --title "Release \$VERSION" \\
      --notes "See CHANGELOG.md"
    ;;
    
  download)
    echo "Downloading artifact v\$VERSION..."
    gh release download v\$VERSION \\
      -p "prestashop-\$VERSION.tar.gz*"
    ;;
    
  verify)
    echo "Verifying artifact v\$VERSION..."
    sha256sum -c prestashop-\$VERSION.tar.gz.sha256
    ;;
    
  docker-push)
    echo "Pushing Docker image v\$VERSION..."
    docker tag prestashop:latest \$REGISTRY:\$VERSION
    docker push \$REGISTRY:\$VERSION
    docker push \$REGISTRY:latest
    ;;
    
  *)
    echo "Usage: \$0 {build|upload|download|verify|docker-push} VERSION"
    exit 1
    ;;
esac
</code></pre>

        <h2 class="section-title">10. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Gestión de Artefactos:</strong>
            <ul class="mb-0">
                <li>Versionado semántico estricto</li>
                <li>Checksums para verificación de integridad</li>
                <li>Firma digital para releases</li>
                <li>Retention policy clara</li>
                <li>Artefactos inmutables (no sobrescribir)</li>
                <li>Tag Docker images con versión específica</li>
                <li>Cache de dependencias agresivo</li>
                <li>Documentar changelog en releases</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Evitar:</strong>
            <ul class="mb-0">
                <li>Sobrescribir artefactos existentes</li>
                <li>Usar solo "latest" tag</li>
                <li>No versionar artefactos</li>
                <li>Almacenar artefactos en repositorio Git</li>
                <li>No verificar checksums</li>
                <li>Retención infinita de todos los builds</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>📦 Estrategia Recomendada:</strong>
            <ul class="mb-0">
                <li><strong>Releases:</strong> GitHub Releases + Container Registry</li>
                <li><strong>Versioning:</strong> Semantic Versioning 2.0</li>
                <li><strong>Retention:</strong> Permanente para tags, 30 días para branches</li>
                <li><strong>Security:</strong> GPG signing + SHA256 checksums</li>
            </ul>
        </div>
    </div>
`;

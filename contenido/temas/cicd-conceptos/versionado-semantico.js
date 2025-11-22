// @ts-nocheck
const versionadoSemantico = `
    <div class="content-section">
        <h1 id="versionado-semantico">Versionado Semántico</h1>
        <p>Implementación de Semantic Versioning 2.0.0 en proyectos PrestaShop 8.9+ con automatización y mejores prácticas.</p>

        <h2 class="section-title">1. Semantic Versioning (SemVer)</h2>

        <div class="alert alert-info">
            <strong>📐 Formato: MAJOR.MINOR.PATCH</strong>
            <ul class="mb-0">
                <li><strong>MAJOR</strong> (1.0.0 → 2.0.0): Breaking changes incompatibles</li>
                <li><strong>MINOR</strong> (1.0.0 → 1.1.0): Nueva funcionalidad compatible</li>
                <li><strong>PATCH</strong> (1.0.0 → 1.0.1): Bugfixes compatibles</li>
            </ul>
        </div>

        <h3>1.1. Ejemplos de Versiones</h3>

        <pre><code class="language-plaintext">1.0.0 - Primera release estable

1.0.1 - Bugfix menor
1.0.2 - Otro bugfix

1.1.0 - Nueva feature compatible
1.2.0 - Otra feature compatible

2.0.0 - Breaking change (API cambió, no compatible con 1.x)

Pre-releases:
1.0.0-alpha      - Alpha pre-release
1.0.0-alpha.1    - Alpha 1
1.0.0-beta       - Beta pre-release
1.0.0-beta.2     - Beta 2
1.0.0-rc.1       - Release Candidate 1

Build metadata:
1.0.0+20240115        - Build del 15 enero 2024
1.0.0+sha.5114f85     - Build con git commit hash
1.0.0-beta+exp.sha.5114f85
</code></pre>

        <h2 class="section-title">2. Cuándo Incrementar Versión</h2>

        <table>
            <thead>
                <tr>
                    <th>Cambio</th>
                    <th>Versión</th>
                    <th>Ejemplo</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Bugfix</strong></td>
                    <td>PATCH</td>
                    <td>1.0.0 → 1.0.1</td>
                </tr>
                <tr>
                    <td><strong>Nueva feature compatible</strong></td>
                    <td>MINOR</td>
                    <td>1.0.1 → 1.1.0</td>
                </tr>
                <tr>
                    <td><strong>API deprecated (pero funciona)</strong></td>
                    <td>MINOR</td>
                    <td>1.1.0 → 1.2.0</td>
                </tr>
                <tr>
                    <td><strong>Breaking change</strong></td>
                    <td>MAJOR</td>
                    <td>1.2.0 → 2.0.0</td>
                </tr>
                <tr>
                    <td><strong>Remover API deprecated</strong></td>
                    <td>MAJOR</td>
                    <td>2.0.0 → 3.0.0</td>
                </tr>
                <tr>
                    <td><strong>Cambio de dependencia mayor</strong></td>
                    <td>MAJOR</td>
                    <td>3.0.0 → 4.0.0</td>
                </tr>
            </tbody>
        </table>

        <h3>2.1. Ejemplos PrestaShop</h3>

        <pre><code class="language-markdown">## PATCH (1.0.0 → 1.0.1)
- Fix: Error en cálculo de impuestos
- Fix: Corrección de typo en email
- Fix: Performance mejora en queries

## MINOR (1.0.1 → 1.1.0)
- Feat: Nuevo método de pago Stripe
- Feat: Export de productos a CSV
- Feat: Dashboard con métricas
- Deprecate: Método antiguo de cálculo (aún funciona)

## MAJOR (1.1.0 → 2.0.0)
- Breaking: Cambio de estructura de BD
- Breaking: Remueve método deprecated
- Breaking: PHP 8.1+ requerido (antes 7.4+)
- Breaking: Cambio en API pública
</code></pre>

        <h2 class="section-title">3. Implementación en Proyecto</h2>

        <h3>3.1. package.json / composer.json</h3>

        <pre><code class="language-json">// package.json
{
  "name": "prestashop-module",
  "version": "1.2.3",
  "description": "PrestaShop custom module"
}

// composer.json
{
  "name": "company/prestashop-module",
  "version": "1.2.3",
  "type": "prestashop-module"
}
</code></pre>

        <h3>3.2. Conventional Commits</h3>

        <pre><code class="language-markdown">## Formato
type(scope): description

[optional body]

[optional footer]

## Types
- feat: Nueva funcionalidad (MINOR)
- fix: Bugfix (PATCH)
- docs: Documentación
- style: Formateo
- refactor: Refactorización
- test: Tests
- chore: Tareas de mantenimiento

## Breaking Change
BREAKING CHANGE: description (MAJOR)

## Ejemplos
feat: add Stripe payment gateway

fix: calculate tax correctly for EU countries

feat!: migrate to PHP 8.1
BREAKING CHANGE: PHP 7.4 no longer supported

feat(checkout): add express checkout
- Simplified checkout flow
- One-click purchase
- Saved payment methods

Closes #123
</code></pre>

        <h2 class="section-title">4. Automatización con Tools</h2>

        <h3>4.1. Semantic Release</h3>

        <pre><code class="language-json">// package.json
{
  "devDependencies": {
    "semantic-release": "^22.0.0",
    "@semantic-release/changelog": "^6.0.0",
    "@semantic-release/git": "^10.0.0"
  },
  "release": {
    "branches": ["main"],
    "plugins": [
      "@semantic-release/commit-analyzer",
      "@semantic-release/release-notes-generator",
      "@semantic-release/changelog",
      "@semantic-release/npm",
      "@semantic-release/git",
      "@semantic-release/github"
    ]
  }
}
</code></pre>

        <pre><code class="language-yaml"># .github/workflows/release.yml
name: Release

on:
  push:
    branches: [ main ]

jobs:
  release:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Semantic Release
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: npx semantic-release
</code></pre>

        <h3>4.2. Manual Bump con npm version</h3>

        <pre><code class="language-bash"># Bump patch (1.0.0 → 1.0.1)
npm version patch
# Crea commit: "1.0.1"
# Crea tag: v1.0.1

# Bump minor (1.0.1 → 1.1.0)
npm version minor

# Bump major (1.1.0 → 2.0.0)
npm version major

# Pre-release
npm version prerelease --preid=alpha
# 1.0.0 → 1.0.1-alpha.0

npm version prerelease --preid=beta
# 1.0.1-alpha.0 → 1.0.1-beta.0

# Custom version
npm version 2.5.0

# Push con tags
git push origin main --tags
</code></pre>

        <h3>4.3. Composer Version Bump</h3>

        <pre><code class="language-bash"># composer.json no tiene comando built-in
# Usar jq o sed

# Patch
jq '.version = "1.0.1"' composer.json > tmp.json && mv tmp.json composer.json
git add composer.json
git commit -m "chore: bump version to 1.0.1"
git tag v1.0.1

# Script bash
#!/bin/bash
VERSION=\$1

# Update composer.json
jq ".version = \\"\\$VERSION\\"" composer.json > tmp.json && mv tmp.json composer.json

# Update package.json
npm version \$VERSION --no-git-tag-version

# Commit y tag
git add composer.json package.json
git commit -m "chore: bump version to \$VERSION"
git tag v\$VERSION
git push origin main --tags

# Uso
./bump-version.sh 1.2.3
</code></pre>

        <h2 class="section-title">5. CHANGELOG.md</h2>

        <pre><code class="language-markdown"># Changelog

Todos los cambios notables en este proyecto serán documentados aquí.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Nueva feature en desarrollo

## [2.0.0] - 2024-01-15

### Changed
- **BREAKING**: PHP 8.1+ requerido
- **BREAKING**: Cambio en estructura de BD

### Added
- Nueva API RESTful
- Dashboard con métricas

### Removed
- Método deprecated \`getOldProducts()\`

## [1.2.0] - 2024-01-10

### Added
- Integración con Stripe
- Export productos a CSV

### Deprecated
- \`getOldProducts()\` será removido en 2.0.0

## [1.1.1] - 2024-01-05

### Fixed
- Error en cálculo de impuestos
- Performance en listado de productos

## [1.1.0] - 2024-01-01

### Added
- Nuevo módulo de descuentos
- Multi-currency support

## [1.0.0] - 2023-12-20

### Added
- Release inicial estable
- CRUD de productos
- Carrito de compras
- Checkout básico

[Unreleased]: https://github.com/user/repo/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/user/repo/compare/v1.2.0...v2.0.0
[1.2.0]: https://github.com/user/repo/compare/v1.1.1...v1.2.0
[1.1.1]: https://github.com/user/repo/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/user/repo/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/user/repo/releases/tag/v1.0.0
</code></pre>

        <h3>5.1. Generar CHANGELOG Automático</h3>

        <pre><code class="language-bash"># Con conventional-changelog
npm install --save-dev conventional-changelog-cli

# Generar
npx conventional-changelog -p angular -i CHANGELOG.md -s

# O en package.json
{
  "scripts": {
    "changelog": "conventional-changelog -p angular -i CHANGELOG.md -s",
    "version": "npm run changelog && git add CHANGELOG.md"
  }
}
</code></pre>

        <h2 class="section-title">6. Git Tags</h2>

        <pre><code class="language-bash"># Crear tag
git tag -a v1.2.3 -m "Release 1.2.3"

# Push tag
git push origin v1.2.3

# Push todos los tags
git push origin --tags

# Listar tags
git tag

# Ver tag específico
git show v1.2.3

# Eliminar tag local
git tag -d v1.2.3

# Eliminar tag remoto
git push origin --delete v1.2.3

# Checkout a tag
git checkout v1.2.3
</code></pre>

        <h2 class="section-title">7. Dependency Versioning</h2>

        <h3>7.1. Composer (PHP)</h3>

        <pre><code class="language-json">{
  "require": {
    "php": ">=8.1",
    "symfony/http-foundation": "^6.0",      // 6.0.0 - 6.9.9 (permite MINOR)
    "guzzlehttp/guzzle": "~7.5.0",          // 7.5.0 - 7.5.x (solo PATCH)
    "monolog/monolog": "2.*",               // 2.0.0 - 2.9.9 (cualquier MINOR de 2.x)
    "doctrine/orm": "2.14.1"                // Exacto 2.14.1
  }
}

// Símbolos
// ^  - Caret: permite MINOR y PATCH (default)
// ~  - Tilde: solo PATCH
// *  - Wildcard
// >= - Mayor o igual
// Nada - Versión exacta
</code></pre>

        <h3>7.2. npm (JavaScript)</h3>

        <pre><code class="language-json">{
  "dependencies": {
    "react": "^18.2.0",          // 18.2.0 - 18.x.x
    "axios": "~1.6.0",           // 1.6.0 - 1.6.x
    "lodash": "4.17.21",         // Exacto
    "express": ">=4.18.0",       // Mayor o igual
    "@types/node": "*"           // Última versión
  }
}

// package-lock.json guarda versiones exactas
</code></pre>

        <h2 class="section-title">8. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Semantic Versioning:</strong>
            <ul class="mb-0">
                <li>Seguir SemVer 2.0.0 estrictamente</li>
                <li>Usar Conventional Commits</li>
                <li>Mantener CHANGELOG.md actualizado</li>
                <li>Tags en Git para cada release</li>
                <li>Automatizar bump de versión</li>
                <li>Deprecar antes de remover (MINOR → MAJOR)</li>
                <li>Documentar breaking changes claramente</li>
                <li>Versión 0.x.x para desarrollo (API inestable)</li>
                <li>Versión 1.0.0 para primera release estable</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Breaking Changes:</strong>
            <ul class="mb-0">
                <li>Cambio en API pública</li>
                <li>Remover métodos/clases</li>
                <li>Cambio en estructura de BD</li>
                <li>Cambio en formato de configuración</li>
                <li>Bump de versión mayor de dependencia</li>
                <li>Cambio en requerimientos (PHP version, etc.)</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>🎯 Recomendaciones PrestaShop:</strong>
            <ul class="mb-0">
                <li><strong>Módulo privado:</strong> Semantic Release automático</li>
                <li><strong>Módulo público:</strong> Manual bump con changelog detallado</li>
                <li><strong>Core PrestaShop:</strong> Gitflow + manual releases planificados</li>
                <li><strong>Library:</strong> SemVer estricto + deprecation warnings</li>
            </ul>
        </div>

        <h2 class="section-title">9. Migration Guide Template</h2>

        <pre><code class="language-markdown"># Migration Guide: 1.x → 2.0

## Breaking Changes

### PHP Version
- **Before:** PHP 7.4+
- **After:** PHP 8.1+
- **Action:** Upgrade PHP to 8.1 or higher

### Database Schema
- **Change:** Column \`price\` changed from INT to DECIMAL
- **Action:** Run migration: \`php bin/console migrate:2.0\`

### API Changes
\`\`\`php
// Before (deprecated in 1.2.0, removed in 2.0.0)
$product->getOldProducts();

// After
$productRepository->findProducts();
\`\`\`

### Configuration
\`\`\`yaml
# Before
config:
  payment_method: stripe

# After
config:
  payments:
    - stripe
\`\`\`

## Step-by-Step Migration

1. Backup database
2. Update PHP to 8.1+
3. Update composer.json: \`"company/module": "^2.0"\`
4. Run: \`composer update\`
5. Run migrations: \`php bin/console migrate:2.0\`
6. Update code using deprecated methods
7. Test thoroughly
8. Deploy to staging
9. Deploy to production

## Testing Checklist
- [ ] All tests pass
- [ ] Checkout flow works
- [ ] Payment processing works
- [ ] Admin panel accessible
</code></pre>
    </div>
`;

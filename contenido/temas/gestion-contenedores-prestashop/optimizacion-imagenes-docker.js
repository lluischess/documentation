// @ts-nocheck
const optimizacionImagenesDocker = `
    <div class="content-section">
        <h1 id="optimizacion-imagenes-docker">Optimización de Imágenes (Multi-stage builds, capas)</h1>
        <p>Técnicas avanzadas de optimización de imágenes Docker para PrestaShop 8.9+ reduciendo tamaño y mejorando performance.</p>

        <h2 class="section-title">1. Problema: Imagen No Optimizada</h2>

        <pre><code class="language-dockerfile"># ❌ Dockerfile sin optimizar - 1.5GB
FROM php:8.1-fpm

# Instalar todo en una capa
RUN apt-get update && \\
    apt-get install -y git curl wget vim nano htop && \\
    apt-get install -y libzip-dev libpng-dev libwebp-dev && \\
    docker-php-ext-install pdo_mysql gd zip && \\
    curl -sS https://getcomposer.org/installer | php && \\
    mv composer.phar /usr/local/bin/composer

WORKDIR /var/www/html

# Copiar todo
COPY . .

RUN composer install

CMD ["php-fpm"]
</code></pre>

        <h2 class="section-title">2. Multi-Stage Build Optimizado</h2>

        <pre><code class="language-dockerfile"># ✅ Dockerfile optimizado - 400MB
# Etapa 1: Builder
FROM php:8.1-fpm-alpine AS builder

# Instalar dependencias de build
RUN apk add --no-cache --virtual .build-deps \\
    \$PHPIZE_DEPS \\
    libzip-dev \\
    libpng-dev \\
    libwebp-dev \\
    libjpeg-turbo-dev

# Instalar extensiones PHP
RUN docker-php-ext-configure gd --with-webp --with-jpeg && \\
    docker-php-ext-install -j\$(nproc) pdo_mysql gd zip opcache && \\
    apk del .build-deps

# Instalar Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copiar solo archivos necesarios para composer
COPY composer.json composer.lock ./
RUN composer install \\
    --no-dev \\
    --no-scripts \\
    --no-autoloader \\
    --prefer-dist \\
    --optimize-autoloader

# Copiar el resto del código
COPY . .

# Generar autoloader optimizado
RUN composer dump-autoload --optimize --classmap-authoritative

# Etapa 2: Runtime
FROM php:8.1-fpm-alpine AS runtime

# Instalar solo runtime dependencies
RUN apk add --no-cache \\
    libzip \\
    libpng \\
    libwebp \\
    libjpeg-turbo \\
    && docker-php-ext-configure gd --with-webp --with-jpeg \\
    && docker-php-ext-install -j\$(nproc) pdo_mysql gd zip opcache

# Copiar binarios compilados de builder
COPY --from=builder /usr/local/lib/php/extensions/ /usr/local/lib/php/extensions/
COPY --from=builder /usr/local/etc/php/conf.d/ /usr/local/etc/php/conf.d/

# Crear usuario no-root
RUN addgroup -g 1000 prestashop && \\
    adduser -D -u 1000 -G prestashop prestashop

WORKDIR /var/www/html

# Copiar solo lo necesario de builder
COPY --from=builder --chown=prestashop:prestashop /app/vendor ./vendor
COPY --chown=prestashop:prestashop . .

# Limpiar archivos innecesarios
RUN rm -rf /var/www/html/install \\
    /var/www/html/docs \\
    /var/www/html/.git \\
    /var/www/html/tests && \\
    find /var/www/html -name ".gitkeep" -delete

# Permisos
RUN chown -R prestashop:prestashop /var/www/html && \\
    chmod -R 755 /var/www/html && \\
    chmod -R 770 /var/www/html/var/cache \\
    /var/www/html/var/logs \\
    /var/www/html/upload

USER prestashop

# PHP config optimizado
COPY --chown=prestashop:prestashop php.ini /usr/local/etc/php/conf.d/prestashop.ini

CMD ["php-fpm"]
</code></pre>

        <h2 class="section-title">3. Optimización de Capas</h2>

        <h3>3.1. Ordenar Comandos por Frecuencia de Cambio</h3>

        <pre><code class="language-dockerfile"># ✅ Orden óptimo
FROM php:8.1-fpm-alpine

# 1. Instalar dependencias del sistema (raramente cambia)
RUN apk add --no-cache libzip libpng libwebp

# 2. Instalar extensiones PHP (raramente cambia)
RUN docker-php-ext-install pdo_mysql gd zip

# 3. Copiar composer files (cambia ocasionalmente)
COPY composer.json composer.lock ./
RUN composer install --no-dev

# 4. Copiar código fuente (cambia frecuentemente)
COPY . .

# 5. Configuración runtime
CMD ["php-fpm"]
</code></pre>

        <h3>3.2. Combinar Comandos RUN</h3>

        <pre><code class="language-dockerfile"># ❌ Múltiples capas - más espacio
RUN apt-get update
RUN apt-get install -y libzip-dev
RUN apt-get install -y libpng-dev
RUN apt-get clean
# 4 capas

# ✅ Una sola capa - menos espacio
RUN apt-get update && \\
    apt-get install -y \\
        libzip-dev \\
        libpng-dev && \\
    apt-get clean && \\
    rm -rf /var/lib/apt/lists/*
# 1 capa
</code></pre>

        <h2 class="section-title">4. .dockerignore</h2>

        <pre><code class="language-plaintext"># .dockerignore
# Git
.git
.gitignore
.gitattributes

# Docker
Dockerfile
docker-compose*.yml
.dockerignore

# CI/CD
.github
.gitlab-ci.yml
Jenkinsfile

# IDE
.vscode
.idea
*.swp
*.swo

# Tests
tests/
phpunit.xml
.phpunit.result.cache

# Docs
docs/
README.md
*.md

# Logs y cache local
var/logs/*
var/cache/*
!var/logs/.gitkeep
!var/cache/.gitkeep

# Uploads (usar volumen)
upload/*
!upload/.gitkeep

# Dependencias (se instalan en build)
vendor/
node_modules/

# Sistema
.DS_Store
Thumbs.db
*.log
</code></pre>

        <h2 class="section-title">5. BuildKit y Caché</h2>

        <pre><code class="language-dockerfile"># syntax=docker/dockerfile:1.4

FROM php:8.1-fpm-alpine AS base

# Usar cache mount para apt
RUN --mount=type=cache,target=/var/cache/apt \\
    --mount=type=cache,target=/var/lib/apt \\
    apt-get update && \\
    apt-get install -y libzip-dev

# Usar cache mount para composer
COPY composer.json composer.lock ./
RUN --mount=type=cache,target=/root/.composer \\
    composer install --no-dev
</code></pre>

        <pre><code class="language-bash"># Build con BuildKit y cache
DOCKER_BUILDKIT=1 docker build \\
  --cache-from=prestashop:cache \\
  --build-arg BUILDKIT_INLINE_CACHE=1 \\
  -t prestashop:latest .

# Push cache
docker push prestashop:cache
</code></pre>

        <h2 class="section-title">6. Análisis de Capas</h2>

        <pre><code class="language-bash"># Ver capas de imagen
docker history prestashop:latest

# Análisis detallado con dive
docker run --rm -it \\
  -v /var/run/docker.sock:/var/run/docker.sock \\
  wagoodman/dive:latest prestashop:latest

# Comparar tamaño
docker images | grep prestashop
</code></pre>

        <h2 class="section-title">7. Imagen Base Optimizada</h2>

        <h3>7.1. Comparativa de Bases</h3>

        <table>
            <thead>
                <tr>
                    <th>Imagen Base</th>
                    <th>Tamaño</th>
                    <th>Pros</th>
                    <th>Contras</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>php:8.1-fpm</td>
                    <td>~450MB</td>
                    <td>Completa, fácil</td>
                    <td>Grande</td>
                </tr>
                <tr>
                    <td>php:8.1-fpm-alpine</td>
                    <td>~80MB</td>
                    <td>Muy pequeña</td>
                    <td>Menos herramientas</td>
                </tr>
                <tr>
                    <td>php:8.1-fpm-bookworm</td>
                    <td>~200MB</td>
                    <td>Balance</td>
                    <td>Mediana</td>
                </tr>
            </tbody>
        </table>

        <h3>7.2. Custom Base Image</h3>

        <pre><code class="language-dockerfile"># base-prestashop.dockerfile
FROM php:8.1-fpm-alpine

# Instalar extensiones comunes
RUN apk add --no-cache \\
    libzip libpng libwebp libjpeg-turbo \\
    && docker-php-ext-install -j\$(nproc) \\
        pdo_mysql \\
        gd \\
        zip \\
        opcache

# PHP config optimizado
COPY php-production.ini /usr/local/etc/php/conf.d/

# Build y push
# docker build -f base-prestashop.dockerfile -t myregistry/prestashop-base:8.1 .
# docker push myregistry/prestashop-base:8.1
</code></pre>

        <pre><code class="language-dockerfile"># Usar base custom
FROM myregistry/prestashop-base:8.1

COPY . /var/www/html
# Resto de configuración específica
</code></pre>

        <h2 class="section-title">8. Compresión de Imágenes</h2>

        <pre><code class="language-bash"># Squash layers (Docker CLI experimental)
docker build --squash -t prestashop:squashed .

# Exportar y reimportar (elimina metadata)
docker save prestashop:latest | docker load

# Comprimir con docker-squash
pip install docker-squash
docker-squash prestashop:latest -t prestashop:squashed
</code></pre>

        <h2 class="section-title">9. Ejemplo Completo: Imagen Producción</h2>

        <pre><code class="language-dockerfile"># syntax=docker/dockerfile:1.4
ARG PHP_VERSION=8.1

# ===== STAGE 1: Base =====
FROM php:\${PHP_VERSION}-fpm-alpine AS base

RUN apk add --no-cache \\
    libzip libpng libwebp libjpeg-turbo \\
    && docker-php-ext-configure gd --with-webp --with-jpeg \\
    && docker-php-ext-install -j\$(nproc) pdo_mysql gd zip opcache

# ===== STAGE 2: Dependencies =====
FROM base AS dependencies

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Cache composer dependencies
COPY composer.json composer.lock ./
RUN --mount=type=cache,target=/root/.composer \\
    composer install \\
    --no-dev \\
    --no-scripts \\
    --no-autoloader \\
    --optimize-autoloader

# ===== STAGE 3: Builder =====
FROM dependencies AS builder

COPY . .

RUN composer dump-autoload --optimize --classmap-authoritative && \\
    rm -rf tests/ docs/ .git/ && \\
    find . -name ".gitkeep" -delete && \\
    find . -name "*.md" -delete

# ===== STAGE 4: Production =====
FROM base AS production

# Labels
LABEL maintainer="team@example.com" \\
      version="1.0.0" \\
      description="PrestaShop 8.9 optimized"

# Create user
RUN addgroup -g 1000 prestashop && \\
    adduser -D -u 1000 -G prestashop prestashop

WORKDIR /var/www/html

# Copy from builder
COPY --from=builder --chown=prestashop:prestashop /app .

# Permissions
RUN chmod -R 755 . && \\
    chmod -R 770 var/cache var/logs upload

# PHP config
COPY php-production.ini /usr/local/etc/php/conf.d/

USER prestashop

EXPOSE 9000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \\
  CMD php-fpm-healthcheck || exit 1

CMD ["php-fpm"]
</code></pre>

        <h2 class="section-title">10. Build Arguments y Variables</h2>

        <pre><code class="language-dockerfile">ARG PHP_VERSION=8.1
ARG PRESTASHOP_VERSION=8.9.0
ARG BUILD_DATE
ARG VCS_REF

FROM php:\${PHP_VERSION}-fpm-alpine

LABEL org.opencontainers.image.created=\${BUILD_DATE} \\
      org.opencontainers.image.revision=\${VCS_REF} \\
      org.opencontainers.image.version=\${PRESTASHOP_VERSION}

# Usar ARG en RUN
ARG ENVIRONMENT=production
RUN if [ "\$ENVIRONMENT" = "development" ]; then \\
        apk add --no-cache git vim; \\
    fi
</code></pre>

        <pre><code class="language-bash"># Build con argumentos
docker build \\
  --build-arg PHP_VERSION=8.1 \\
  --build-arg PRESTASHOP_VERSION=8.9.1 \\
  --build-arg BUILD_DATE=\$(date -u +"%Y-%m-%dT%H:%M:%SZ") \\
  --build-arg VCS_REF=\$(git rev-parse --short HEAD) \\
  -t prestashop:8.9.1 .
</code></pre>

        <h2 class="section-title">11. CI/CD Build Optimization</h2>

        <pre><code class="language-yaml"># .github/workflows/docker-build.yml
name: Build Optimized Image

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Cache Docker layers
        uses: actions/cache@v3
        with:
          path: /tmp/.buildx-cache
          key: \${{ runner.os }}-buildx-\${{ github.sha }}
          restore-keys: |
            \${{ runner.os }}-buildx-
      
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: prestashop:latest
          cache-from: type=local,src=/tmp/.buildx-cache
          cache-to: type=local,dest=/tmp/.buildx-cache-new,mode=max
          build-args: |
            BUILD_DATE=\${{ github.event.head_commit.timestamp }}
            VCS_REF=\${{ github.sha }}
      
      - name: Move cache
        run: |
          rm -rf /tmp/.buildx-cache
          mv /tmp/.buildx-cache-new /tmp/.buildx-cache
</code></pre>

        <h2 class="section-title">12. Comparativa Final</h2>

        <table>
            <thead>
                <tr>
                    <th>Técnica</th>
                    <th>Reducción</th>
                    <th>Complejidad</th>
                    <th>Build Time</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Alpine base</td>
                    <td>-70%</td>
                    <td>Baja</td>
                    <td>Similar</td>
                </tr>
                <tr>
                    <td>Multi-stage</td>
                    <td>-40%</td>
                    <td>Media</td>
                    <td>+20%</td>
                </tr>
                <tr>
                    <td>.dockerignore</td>
                    <td>-10%</td>
                    <td>Muy baja</td>
                    <td>-10%</td>
                </tr>
                <tr>
                    <td>Combinar RUN</td>
                    <td>-15%</td>
                    <td>Baja</td>
                    <td>Similar</td>
                </tr>
                <tr>
                    <td>BuildKit cache</td>
                    <td>0%</td>
                    <td>Media</td>
                    <td>-50%</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">13. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Optimización de Imágenes:</strong>
            <ul class="mb-0">
                <li>Usar Alpine como base cuando sea posible</li>
                <li>Multi-stage builds para separar build/runtime</li>
                <li>Ordenar capas por frecuencia de cambio</li>
                <li>Combinar comandos RUN relacionados</li>
                <li>.dockerignore completo</li>
                <li>Limpiar archivos temporales en mismo RUN</li>
                <li>No instalar herramientas de desarrollo en prod</li>
                <li>Usuario no-root</li>
                <li>BuildKit cache para CI/CD</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>📊 Objetivos:</strong>
            <ul class="mb-0">
                <li><strong>Desarrollo:</strong> ~500MB (con herramientas)</li>
                <li><strong>Producción:</strong> ~200-400MB (optimizado)</li>
                <li><strong>Build time:</strong> < 5 minutos con cache</li>
                <li><strong>Capas:</strong> < 15 capas finales</li>
            </ul>
        </div>
    </div>
`;

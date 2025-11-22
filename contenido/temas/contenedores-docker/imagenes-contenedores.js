// @ts-nocheck
const imagenesContenedores = `
    <div class="content-section">
        <h1 id="imagenes-contenedores">Imágenes y Contenedores</h1>
        <p>Creación, gestión y optimización de imágenes Docker. Dockerfile, multi-stage builds y mejores prácticas para PrestaShop 8.9+.</p>

        <h2 class="section-title">1. Dockerfile Básico</h2>

        <pre><code class="language-dockerfile"># Dockerfile para PrestaShop personalizado
FROM php:8.1-apache

# Metadatos
LABEL maintainer="dev@example.com"
LABEL version="1.0"
LABEL description="PrestaShop 8.9 con módulos personalizados"

# Variables de build
ARG PRESTASHOP_VERSION=8.9.0

# Instalar extensiones PHP
RUN apt-get update && apt-get install -y \\
    libzip-dev \\
    libpng-dev \\
    libjpeg-dev \\
    libfreetype6-dev \\
    && docker-php-ext-configure gd --with-freetype --with-jpeg \\
    && docker-php-ext-install -j$(nproc) gd zip pdo_mysql

# Copiar código
COPY ./src /var/www/html/

# Permisos
RUN chown -R www-data:www-data /var/www/html

# Variables de entorno
ENV PS_DOMAIN=localhost \\
    DB_SERVER=mysql \\
    DB_NAME=prestashop

# Puerto expuesto
EXPOSE 80

# Usuario no-root
USER www-data

# Comando por defecto
CMD ["apache2-foreground"]
</code></pre>

        <h2 class="section-title">2. Instrucciones Dockerfile</h2>

        <pre><code class="language-dockerfile"># FROM - Imagen base (siempre primero)
FROM php:8.1-fpm-alpine

# RUN - Ejecutar comando durante build
RUN apk add --no-cache git nodejs npm

# COPY - Copiar archivos del contexto
COPY composer.json composer.lock ./
COPY src/ ./src/

# ADD - Como COPY pero puede descomprimir tar y usar URLs
ADD https://example.com/file.tar.gz /tmp/
ADD archivo.tar.gz /opt/

# WORKDIR - Directorio de trabajo
WORKDIR /var/www/html

# ENV - Variables de entorno permanentes
ENV APP_ENV=production \\
    PHP_MEMORY_LIMIT=512M

# ARG - Variables solo en build time
ARG BUILD_DATE
ARG VERSION=1.0.0

# EXPOSE - Documentar puertos (no publica)
EXPOSE 80 443

# VOLUME - Punto de montaje
VOLUME /var/www/html/var/logs

# USER - Cambiar usuario
USER www-data

# CMD - Comando por defecto (se puede override)
CMD ["php-fpm"]

# ENTRYPOINT - Comando principal (no se override fácilmente)
ENTRYPOINT ["docker-entrypoint.sh"]

# HEALTHCHECK - Verificar salud del contenedor
HEALTHCHECK --interval=30s --timeout=3s \\
  CMD curl -f http://localhost/ || exit 1

# SHELL - Cambiar shell por defecto
SHELL ["/bin/bash", "-c"]

# ONBUILD - Ejecutar en imagen hija
ONBUILD COPY . /app
</code></pre>

        <h2 class="section-title">3. Multi-Stage Build</h2>

        <pre><code class="language-dockerfile"># Optimizar tamaño de imagen con multi-stage

# Etapa 1: Build
FROM composer:2 AS builder

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader

COPY . .
RUN composer dump-autoload --optimize --classmap-authoritative


# Etapa 2: Assets
FROM node:18 AS assets

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .
RUN npm run build


# Etapa 3: Runtime final
FROM php:8.1-apache

# Instalar solo extensiones necesarias
RUN docker-php-ext-install pdo_mysql opcache

# Copiar vendor desde builder
COPY --from=builder /app/vendor /var/www/html/vendor
COPY --from=builder /app/src /var/www/html/src

# Copiar assets compilados
COPY --from=assets /app/dist /var/www/html/dist

# Código de aplicación
COPY . /var/www/html/

# Configuración PHP optimizada
RUN echo "opcache.enable=1" >> /usr/local/etc/php/conf.d/opcache.ini \\
    && echo "opcache.memory_consumption=256" >> /usr/local/etc/php/conf.d/opcache.ini

EXPOSE 80
CMD ["apache2-foreground"]

# Resultado: Imagen final ~200MB vs ~800MB sin multi-stage
</code></pre>

        <h2 class="section-title">4. Build de Imagen</h2>

        <pre><code class="language-bash"># Build básico
docker build -t prestashop-custom:latest .

# Con build args
docker build \\
  --build-arg PHP_VERSION=8.1 \\
  --build-arg PRESTASHOP_VERSION=8.9.0 \\
  -t prestashop-custom:8.9 .

# Especificar Dockerfile
docker build -f Dockerfile.prod -t prestashop:prod .

# Sin cache
docker build --no-cache -t prestashop:latest .

# Target específico en multi-stage
docker build --target builder -t prestashop:builder .

# Build con BuildKit (más rápido)
DOCKER_BUILDKIT=1 docker build -t prestashop:latest .

# Ver historial de capas
docker history prestashop-custom:latest

# Ver tamaño detallado
docker images --format "table {{.Repository}}\\t{{.Tag}}\\t{{.Size}}"
</code></pre>

        <h2 class="section-title">5. Gestión de Imágenes</h2>

        <pre><code class="language-bash"># Listar imágenes
docker images
docker image ls

# Buscar en Docker Hub
docker search prestashop

# Pull imagen
docker pull prestashop/prestashop:8.9

# Push a registry
docker push myregistry.com/prestashop:8.9

# Tag imagen
docker tag prestashop:latest prestashop:8.9.0
docker tag prestashop:latest myregistry.com/prestashop:latest

# Guardar imagen a archivo
docker save prestashop:latest > prestashop.tar
docker save prestashop:latest | gzip > prestashop.tar.gz

# Cargar imagen desde archivo
docker load < prestashop.tar
docker load -i prestashop.tar.gz

# Exportar contenedor a imagen
docker export container_id > container.tar
docker import container.tar prestashop:from-container

# Eliminar imágenes
docker rmi prestashop:old
docker image rm prestashop:old

# Eliminar imágenes sin usar
docker image prune
docker image prune -a  # Todas las no usadas

# Ver capas de imagen
docker image inspect prestashop:latest
</code></pre>

        <h2 class="section-title">6. Caché de Build</h2>

        <pre><code class="language-dockerfile"># Aprovechar caché de Docker

# ❌ MAL - Invalida cache en cada cambio de código
FROM php:8.1-fpm
COPY . /var/www/html/
RUN composer install

# ✅ BIEN - Cache de dependencias separado
FROM php:8.1-fpm

# Copiar solo archivos de dependencias primero
COPY composer.json composer.lock ./
RUN composer install --no-dev

# Copiar código después (cambios frecuentes)
COPY . /var/www/html/

# Orden óptimo:
# 1. FROM
# 2. Instalar paquetes del sistema
# 3. Copiar archivos de dependencias
# 4. Instalar dependencias
# 5. Copiar código de aplicación
# 6. Configuración final
</code></pre>

        <h2 class="section-title">7. .dockerignore</h2>

        <pre><code class="language-bash"># .dockerignore - Excluir archivos del contexto
# Reduce tamaño y acelera build

.git
.gitignore
.env
.env.local
node_modules
vendor
var/cache
var/logs
*.log
*.md
README.md
docker-compose*.yml
Dockerfile*
.dockerignore
.vscode
.idea
tests
.phpunit.result.cache
</code></pre>

        <h2 class="section-title">8. Optimización de Imágenes</h2>

        <pre><code class="language-dockerfile"># Técnicas de optimización

# 1. Usar imágenes alpine (más pequeñas)
FROM php:8.1-fpm-alpine  # ~40MB
# vs
FROM php:8.1-fpm         # ~400MB

# 2. Combinar RUN commands
RUN apt-get update \\
    && apt-get install -y git zip \\
    && rm -rf /var/lib/apt/lists/*

# 3. Limpiar cache en mismo layer
RUN apt-get update \\
    && apt-get install -y package \\
    && apt-get clean \\
    && rm -rf /var/lib/apt/lists/*

# 4. Usar COPY en vez de ADD cuando sea posible
COPY src/ /app/src/

# 5. Minimizar número de capas
RUN command1 && command2 && command3

# 6. Usar multi-stage builds
FROM node:18 AS builder
# ... build ...
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
</code></pre>

        <h2 class="section-title">9. Ejemplo Completo: PrestaShop</h2>

        <pre><code class="language-dockerfile"># Dockerfile optimizado para PrestaShop

# Build stage
FROM composer:2 AS composer
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader
COPY . .
RUN composer dump-autoload --optimize --classmap-authoritative

# Assets stage
FROM node:18-alpine AS assets
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY themes/ ./themes/
RUN npm run build

# Runtime stage
FROM php:8.1-apache

# Instalar extensiones necesarias
RUN apt-get update && apt-get install -y \\
        libzip-dev \\
        libpng-dev \\
        libjpeg-dev \\
        libfreetype6-dev \\
    && docker-php-ext-configure gd --with-freetype --with-jpeg \\
    && docker-php-ext-install -j$(nproc) \\
        gd \\
        zip \\
        pdo_mysql \\
        opcache \\
    && rm -rf /var/lib/apt/lists/*

# Configuración PHP
COPY docker/php.ini /usr/local/etc/php/conf.d/custom.ini

# Apache config
RUN a2enmod rewrite headers deflate expires
COPY docker/apache.conf /etc/apache2/sites-available/000-default.conf

# Copiar aplicación
COPY --chown=www-data:www-data . /var/www/html/
COPY --from=composer --chown=www-data:www-data /app/vendor /var/www/html/vendor
COPY --from=assets --chown=www-data:www-data /app/themes/dist /var/www/html/themes/dist

# Permisos
RUN chown -R www-data:www-data /var/www/html/var

USER www-data
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s \\
    CMD curl -f http://localhost/ || exit 1

CMD ["apache2-foreground"]
</code></pre>

        <h2 class="section-title">10. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Imágenes:</strong>
            <ul class="mb-0">
                <li>Usar imágenes oficiales como base</li>
                <li>Imágenes alpine para menor tamaño</li>
                <li>Multi-stage builds para producción</li>
                <li>Un servicio por imagen</li>
                <li>Aprovechar caché de layers</li>
                <li>Usar .dockerignore</li>
                <li>Tags versionados, no solo :latest</li>
                <li>Escanear vulnerabilidades</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Evitar:</strong>
            <ul class="mb-0">
                <li>Imágenes genéricas tipo "todo incluido"</li>
                <li>Datos sensibles en imágenes</li>
                <li>Ejecutar como root</li>
                <li>Instalar herramientas de debug en producción</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>🔍 Análisis de Imágenes:</strong>
            <pre class="mb-0"># Dive - analizar capas
dive prestashop:latest

# Hadolint - linter para Dockerfile
hadolint Dockerfile

# Trivy - escanear vulnerabilidades
trivy image prestashop:latest</pre>
        </div>
    </div>
`;

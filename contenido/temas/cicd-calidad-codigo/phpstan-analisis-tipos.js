// @ts-nocheck
const phpstanAnalisisTipos = `
    <div class="content-section">
        <h1 id="phpstan-analisis-tipos">PHPStan para Análisis Estático de Tipos</h1>
        <p>Análisis estático avanzado de código PHP para PrestaShop 8.9+ usando PHPStan para detectar errores antes de la ejecución.</p>

        <h2 class="section-title">1. ¿Qué es PHPStan?</h2>

        <div class="alert alert-info">
            <strong>🔍 PHPStan (PHP Static Analysis Tool):</strong>
            <ul class="mb-0">
                <li>Detecta errores sin ejecutar el código</li>
                <li>Verifica tipos de datos y compatibilidad</li>
                <li>Encuentra código muerto e inalcanzable</li>
                <li>Detecta llamadas a métodos inexistentes</li>
                <li>Valida PHPDoc y type hints</li>
                <li>10 niveles de strictness (0-9)</li>
                <li>Extensible con reglas personalizadas</li>
            </ul>
        </div>

        <h2 class="section-title">2. Instalación</h2>

        <pre><code class="language-bash"># Instalar PHPStan
composer require --dev phpstan/phpstan

# Instalar extensiones útiles
composer require --dev phpstan/phpstan-strict-rules
composer require --dev phpstan/phpstan-deprecation-rules
composer require --dev phpstan/phpstan-phpunit

# Verificar instalación
vendor/bin/phpstan --version
</code></pre>

        <h2 class="section-title">3. Configuración Básica</h2>

        <pre><code class="language-yaml"># phpstan.neon
parameters:
    level: 6
    paths:
        - modules/mymodule
        - override
    
    excludePaths:
        - */vendor/*
        - */tests/*
        - */cache/*
    
    # PHP version
    phpVersion: 80100  # PHP 8.1
    
    # Ignorar errores específicos
    ignoreErrors:
        - '#Call to an undefined method PrestaShop\\\\PrestaShop\\\\Core\\\\.*#'
    
    # Memory limit
    memory_limit: 1G
</code></pre>

        <h2 class="section-title">4. Niveles de Análisis</h2>

        <table>
            <thead>
                <tr>
                    <th>Nivel</th>
                    <th>Descripción</th>
                    <th>Uso</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>0</strong></td>
                    <td>Básico: sintaxis PHP</td>
                    <td>Código legacy</td>
                </tr>
                <tr>
                    <td><strong>1-3</strong></td>
                    <td>Métodos/propiedades desconocidos</td>
                    <td>Migración gradual</td>
                </tr>
                <tr>
                    <td><strong>4-5</strong></td>
                    <td>Verificación de tipos básica</td>
                    <td>Código existente</td>
                </tr>
                <tr>
                    <td><strong>6-7</strong></td>
                    <td>Verificación estricta de tipos</td>
                    <td>Código nuevo (recomendado)</td>
                </tr>
                <tr>
                    <td><strong>8-9</strong></td>
                    <td>Máxima strictness</td>
                    <td>Proyectos críticos</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">5. Configuración Avanzada PrestaShop</h2>

        <pre><code class="language-yaml"># phpstan.neon
includes:
    - vendor/phpstan/phpstan-strict-rules/rules.neon
    - vendor/phpstan/phpstan-deprecation-rules/rules.neon

parameters:
    level: 7
    
    paths:
        - modules/mymodule/classes
        - modules/mymodule/controllers
        - modules/mymodule/src
    
    bootstrapFiles:
        - config/config.inc.php
    
    # PrestaShop autoload
    scanDirectories:
        - classes
        - controllers
    
    # Type inference
    inferPrivatePropertyTypeFromConstructor: true
    checkMissingIterableValueType: true
    checkGenericClassInNonGenericObjectType: true
    
    # Report unmatched ignored errors
    reportUnmatchedIgnoredErrors: true
    
    # Strict rules
    checkAlwaysTrueCheckTypeFunctionCall: true
    checkAlwaysTrueInstanceof: true
    checkAlwaysTrueStrictComparison: true
    checkExplicitMixedMissingReturn: true
    checkFunctionNameCase: true
    checkInternalClassCaseSensitivity: true
    
    # PHPDoc
    checkMissingCallableSignature: true
    checkUninitializedProperties: true
    
    # Dead code
    checkTooWideReturnTypesInProtectedAndPublicMethods: true
    checkUninitializedProperties: true
    
    ignoreErrors:
        # PrestaShop legacy
        - '#Access to an undefined property ObjectModel::\$.*#'
        - '#Call to an undefined method Db::.*#'
        # Smarty
        - '#Variable \$smarty might not be defined#'
</code></pre>

        <h2 class="section-title">6. Ejemplo: Módulo PrestaShop</h2>

        <pre><code class="language-php"><?php
// modules/mymodule/classes/MyService.php

declare(strict_types=1);

namespace MyModule\\Service;

use Product;
use PrestaShopException;

/**
 * Service para gestionar productos
 */
class ProductService
{
    private int $idLang;
    
    public function __construct(int $idLang)
    {
        $this->idLang = $idLang;
    }
    
    /**
     * Obtener producto por ID
     * 
     * @param int $idProduct
     * @return Product
     * @throws PrestaShopException
     */
    public function getProduct(int $idProduct): Product
    {
        $product = new Product($idProduct, false, $this->idLang);
        
        if (!$product->id) {
            throw new PrestaShopException("Product {$idProduct} not found");
        }
        
        return $product;
    }
    
    /**
     * Actualizar precio de producto
     * 
     * @param int $idProduct
     * @param float $price
     * @return bool
     */
    public function updatePrice(int $idProduct, float $price): bool
    {
        $product = $this->getProduct($idProduct);
        $product->price = $price;
        
        return $product->save();
    }
    
    /**
     * Obtener productos por categoría
     * 
     * @param int $idCategory
     * @return array<int, Product>
     */
    public function getProductsByCategory(int $idCategory): array
    {
        $products = Product::getProducts(
            $this->idLang,
            0,
            100,
            'id_product',
            'ASC',
            $idCategory
        );
        
        return array_map(
            fn(array $data): Product => new Product($data['id_product']),
            $products
        );
    }
}

// modules/mymodule/mymodule.php
class MyModule extends Module
{
    public function __construct()
    {
        $this->name = 'mymodule';
        $this->version = '1.0.0';
        $this->author = 'Your Name';
        
        parent::__construct();
        
        $this->displayName = $this->l('My Module');
        $this->description = $this->l('Module description');
    }
    
    /**
     * @return bool
     */
    public function install(): bool
    {
        return parent::install() 
            && $this->registerHook('displayHeader')
            && $this->installDb();
    }
    
    /**
     * @return bool
     */
    private function installDb(): bool
    {
        $sql = 'CREATE TABLE IF NOT EXISTS \`' . _DB_PREFIX_ . 'mymodule_data\` (
            \`id_data\` INT(11) NOT NULL AUTO_INCREMENT,
            \`name\` VARCHAR(255) NOT NULL,
            \`value\` TEXT,
            \`date_add\` DATETIME NOT NULL,
            PRIMARY KEY (\`id_data\`)
        ) ENGINE=' . _MYSQL_ENGINE_ . ' DEFAULT CHARSET=utf8;';
        
        return \Db::getInstance()->execute($sql);
    }
}
</code></pre>

        <h2 class="section-title">7. Ejecutar PHPStan</h2>

        <pre><code class="language-bash"># Análisis básico
vendor/bin/phpstan analyse

# Nivel específico
vendor/bin/phpstan analyse --level=8

# Con memoria aumentada
vendor/bin/phpstan analyse --memory-limit=2G

# Generar baseline (ignorar errores existentes)
vendor/bin/phpstan analyse --generate-baseline

# Con baseline
vendor/bin/phpstan analyse --configuration=phpstan.neon --error-format=table

# Solo errores (sin warnings)
vendor/bin/phpstan analyse --no-progress

# Formato JSON
vendor/bin/phpstan analyse --error-format=json

# Clear cache
vendor/bin/phpstan clear-result-cache
</code></pre>

        <h2 class="section-title">8. Baseline para Código Legacy</h2>

        <pre><code class="language-bash"># Generar baseline
vendor/bin/phpstan analyse --generate-baseline=phpstan-baseline.neon

# Esto crea phpstan-baseline.neon con errores existentes
</code></pre>

        <pre><code class="language-yaml"># phpstan.neon
includes:
    - phpstan-baseline.neon

parameters:
    level: 7
    paths:
        - modules/mymodule
</code></pre>

        <h2 class="section-title">9. Integración CI/CD</h2>

        <h3>9.1. GitHub Actions</h3>

        <pre><code class="language-yaml"># .github/workflows/phpstan.yml
name: PHPStan

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  phpstan:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.1'
          extensions: mbstring, intl, gd, xml, zip
          coverage: none
      
      - name: Cache Composer
        uses: actions/cache@v3
        with:
          path: vendor
          key: \${{ runner.os }}-composer-\${{ hashFiles('**/composer.lock') }}
      
      - name: Install dependencies
        run: composer install --no-progress --prefer-dist
      
      - name: Run PHPStan
        run: vendor/bin/phpstan analyse --error-format=github --no-progress
      
      - name: Generate Report
        if: failure()
        run: vendor/bin/phpstan analyse --error-format=table > phpstan-report.txt
      
      - name: Upload Report
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: phpstan-report
          path: phpstan-report.txt
</code></pre>

        <h3>9.2. GitLab CI</h3>

        <pre><code class="language-yaml"># .gitlab-ci.yml
phpstan:
  stage: test
  image: php:8.1-cli
  
  before_script:
    - apt-get update && apt-get install -y git unzip
    - curl -sS https://getcomposer.org/installer | php
    - php composer.phar install --no-progress
  
  script:
    - vendor/bin/phpstan analyse --error-format=gitlab > phpstan-report.json
  
  artifacts:
    reports:
      codequality: phpstan-report.json
    when: always
  
  cache:
    paths:
      - vendor/
</code></pre>

        <h3>9.3. Pre-commit Hook</h3>

        <pre><code class="language-bash"># .git/hooks/pre-commit
#!/bin/bash

echo "Running PHPStan..."

# Get staged PHP files
FILES=\$(git diff --cached --name-only --diff-filter=ACM | grep '\.php$')

if [ -z "\$FILES" ]; then
    echo "No PHP files to check"
    exit 0
fi

# Run PHPStan on changed files
vendor/bin/phpstan analyse \$FILES --error-format=table --no-progress

if [ \$? -ne 0 ]; then
    echo "❌ PHPStan found errors. Commit aborted."
    exit 1
fi

echo "✅ PHPStan check passed"
exit 0
</code></pre>

        <h2 class="section-title">10. Reglas Personalizadas</h2>

        <pre><code class="language-php"><?php
// src/PHPStan/Rules/NoDirectDbQuery.php

namespace App\\PHPStan\\Rules;

use PhpParser\\Node;
use PHPStan\\Analyser\\Scope;
use PHPStan\\Rules\\Rule;

/**
 * Prohibir consultas SQL directas
 * @implements Rule<Node\\Expr\\StaticCall>
 */
class NoDirectDbQuery implements Rule
{
    public function getNodeType(): string
    {
        return Node\\Expr\\StaticCall::class;
    }
    
    public function processNode(Node $node, Scope $scope): array
    {
        if (!$node->class instanceof Node\\Name) {
            return [];
        }
        
        $className = $node->class->toString();
        $methodName = $node->name instanceof Node\\Identifier 
            ? $node->name->toString() 
            : '';
        
        // Detectar Db::getInstance()->execute()
        if ($className === 'Db' && $methodName === 'execute') {
            return [
                'Direct SQL query detected. Use Repository pattern instead.'
            ];
        }
        
        return [];
    }
}
</code></pre>

        <pre><code class="language-yaml"># phpstan.neon
rules:
    - App\\PHPStan\\Rules\\NoDirectDbQuery

services:
    -
        class: App\\PHPStan\\Rules\\NoDirectDbQuery
        tags:
            - phpstan.rules.rule
</code></pre>

        <h2 class="section-title">11. PHPStan con Docker</h2>

        <pre><code class="language-dockerfile"># Dockerfile.phpstan
FROM php:8.1-cli-alpine

RUN apk add --no-cache git

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts

COPY . .

CMD ["vendor/bin/phpstan", "analyse"]
</code></pre>

        <pre><code class="language-bash"># Ejecutar con Docker
docker build -f Dockerfile.phpstan -t mymodule-phpstan .
docker run --rm mymodule-phpstan
</code></pre>

        <h2 class="section-title">12. Scripts Composer</h2>

        <pre><code class="language-json">{
    "scripts": {
        "phpstan": "phpstan analyse",
        "phpstan:baseline": "phpstan analyse --generate-baseline",
        "phpstan:clear": "phpstan clear-result-cache",
        "phpstan:ci": "phpstan analyse --error-format=github --no-progress",
        "quality": [
            "@phpstan",
            "@phpcs"
        ]
    }
}
</code></pre>

        <pre><code class="language-bash"># Uso
composer phpstan
composer quality
</code></pre>

        <h2 class="section-title">13. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ PHPStan:</strong>
            <ul class="mb-0">
                <li>Empezar con nivel 0-3 en código legacy</li>
                <li>Incrementar nivel gradualmente</li>
                <li>Usar baseline para errores existentes</li>
                <li>Nivel 6+ para código nuevo</li>
                <li>Type hints en todos los métodos públicos</li>
                <li>PHPDoc completo (@param, @return, @throws)</li>
                <li>declare(strict_types=1) en archivos nuevos</li>
                <li>Ejecutar en CI/CD obligatoriamente</li>
                <li>Cache de resultados para velocidad</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Consideraciones:</strong>
            <ul class="mb-0">
                <li>PHPStan puede ser estricto con código PrestaShop</li>
                <li>Usar ignoreErrors para falsos positivos</li>
                <li>Memory limit alto para proyectos grandes</li>
                <li>No bloquear merges por warnings (solo errors)</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>📊 Recomendaciones por Proyecto:</strong>
            <ul class="mb-0">
                <li><strong>Nuevo:</strong> Nivel 7-8 desde el inicio</li>
                <li><strong>Migración:</strong> Nivel 3 → 5 → 6 gradual</li>
                <li><strong>Legacy:</strong> Nivel 0-1 + baseline</li>
                <li><strong>Crítico:</strong> Nivel 9 + strict rules</li>
            </ul>
        </div>
    </div>
`;

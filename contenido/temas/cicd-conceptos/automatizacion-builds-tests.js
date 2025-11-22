// @ts-nocheck
const automatizacionBuildsTests = `
    <div class="content-section">
        <h1 id="automatizacion-builds-tests">Automatización de Builds y Tests</h1>
        <p>Estrategias y mejores prácticas para automatizar builds y ejecución de tests en proyectos PrestaShop 8.9+ con CI/CD.</p>

        <h2 class="section-title">1. Automatización de Builds</h2>

        <h3>1.1. Build Script Completo</h3>

        <pre><code class="language-bash">#!/bin/bash
# build.sh - Build script automatizado

set -e  # Exit on error
set -u  # Error on undefined variable

BUILD_DIR="build"
TIMESTAMP=\$(date +%Y%m%d-%H%M%S)
VERSION=\${1:-"dev"}

echo "🔨 Starting build process (v\$VERSION)..."

# 1. Clean
echo "🧹 Cleaning previous builds..."
rm -rf \$BUILD_DIR
mkdir -p \$BUILD_DIR

# 2. Install dependencies
echo "📦 Installing PHP dependencies..."
composer install --no-dev --optimize-autoloader --no-interaction

echo "📦 Installing Node dependencies..."
npm ci --production

# 3. Build frontend assets
echo "🎨 Building frontend assets..."
npm run build:production

# 4. Copy files
echo "📋 Copying files..."
rsync -av \\
  --exclude='node_modules' \\
  --exclude='.git' \\
  --exclude='tests' \\
  --exclude='*.md' \\
  --exclude='.env.local' \\
  ./ \$BUILD_DIR/

# 5. Optimize
echo "⚡ Optimizing..."
cd \$BUILD_DIR
composer dump-autoload --optimize --classmap-authoritative
php bin/console cache:warmup --env=prod

# 6. Create archive
echo "📦 Creating archive..."
cd ..
tar -czf prestashop-\$VERSION-\$TIMESTAMP.tar.gz \$BUILD_DIR/

# 7. Generate checksum
echo "🔐 Generating checksum..."
sha256sum prestashop-\$VERSION-\$TIMESTAMP.tar.gz > prestashop-\$VERSION-\$TIMESTAMP.tar.gz.sha256

echo "✅ Build completed!"
echo "📦 Archive: prestashop-\$VERSION-\$TIMESTAMP.tar.gz"
ls -lh prestashop-\$VERSION-\$TIMESTAMP.tar.gz
</code></pre>

        <h3>1.2. Makefile para Tareas Comunes</h3>

        <pre><code class="language-makefile"># Makefile
.PHONY: help install build test clean deploy

PHP := php
COMPOSER := composer
NPM := npm
PHPUNIT := vendor/bin/phpunit
PHPCS := vendor/bin/phpcs
PHPSTAN := vendor/bin/phpstan

help: ## Mostrar ayuda
\t@grep -E '^[a-zA-Z_-]+:.*?## .*$$' \$(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\\033[36m%-20s\\033[0m %s\\n", $$1, $$2}'

install: ## Instalar dependencias
\t\$(COMPOSER) install
\t\$(NPM) install

build: ## Build para producción
\t\$(COMPOSER) install --no-dev --optimize-autoloader
\t\$(NPM) ci --production
\t\$(NPM) run build
\t\$(PHP) bin/console cache:clear --env=prod

test: ## Ejecutar todos los tests
\t\$(PHPUNIT)

test-unit: ## Tests unitarios
\t\$(PHPUNIT) --testsuite=Unit

test-integration: ## Tests de integración
\t\$(PHPUNIT) --testsuite=Integration

test-coverage: ## Tests con cobertura
\t\$(PHPUNIT) --coverage-html build/coverage

lint: ## Verificar código
\t\$(PHPCS) --standard=PSR12 modules/

phpstan: ## Análisis estático
\t\$(PHPSTAN) analyse --level=6 modules/

quality: lint phpstan ## Verificar calidad

ci: install lint phpstan test ## Pipeline CI completo

clean: ## Limpiar archivos generados
\trm -rf vendor/ node_modules/ build/
\t\$(PHP) bin/console cache:clear

deploy-staging: build ## Deploy a staging
\t./scripts/deploy.sh staging

deploy-production: build ## Deploy a producción
\t./scripts/deploy.sh production

# Uso:
# make install
# make test
# make ci
</code></pre>

        <h3>1.3. Composer Scripts</h3>

        <pre><code class="language-json">{
  "scripts": {
    "test": "phpunit",
    "test:unit": "phpunit --testsuite=Unit",
    "test:integration": "phpunit --testsuite=Integration",
    "test:coverage": "phpunit --coverage-html build/coverage",
    "lint": "phpcs --standard=PSR12 modules/",
    "lint:fix": "phpcbf --standard=PSR12 modules/",
    "phpstan": "phpstan analyse --level=6 modules/",
    "phpmd": "phpmd modules/ text codesize,unusedcode",
    "quality": [
      "@lint",
      "@phpstan",
      "@phpmd"
    ],
    "ci": [
      "@quality",
      "@test"
    ],
    "build": [
      "@composer install --no-dev --optimize-autoloader",
      "npm run build"
    ],
    "post-install-cmd": [
      "php bin/console cache:clear"
    ],
    "post-update-cmd": [
      "php bin/console cache:clear"
    ]
  },
  "scripts-descriptions": {
    "test": "Run all tests",
    "quality": "Run quality checks",
    "ci": "Run full CI pipeline",
    "build": "Build for production"
  }
}
</code></pre>

        <h2 class="section-title">2. Pirámide de Tests</h2>

        <pre><code class="language-plaintext">        /\\
       /  \\     E2E Tests (5%)
      /    \\    - Lentos
     /------\\   - Frágiles
    /        \\  - Costosos
   /   API    \\
  / Integration \\ (15%)
 /    Tests      \\
/------------------\\
/    Unit Tests    \\ (80%)
/  Rápidos, Estables \\
/____________________\\
</code></pre>

        <h3>2.1. Tests Unitarios</h3>

        <pre><code class="language-php"><?php
// tests/Unit/Service/ProductServiceTest.php

namespace Tests\\Unit\\Service;

use PHPUnit\\Framework\\TestCase;
use App\\Service\\ProductService;
use App\\Repository\\ProductRepository;

class ProductServiceTest extends TestCase
{
    private ProductService $service;
    private ProductRepository $repository;
    
    protected function setUp(): void
    {
        $this->repository = $this->createMock(ProductRepository::class);
        $this->service = new ProductService($this->repository);
    }
    
    public function testGetActiveProducts(): void
    {
        // Arrange
        $this->repository
            ->expects($this->once())
            ->method('findActiveProducts')
            ->willReturn([
                ['id' => 1, 'name' => 'Product 1'],
                ['id' => 2, 'name' => 'Product 2'],
            ]);
        
        // Act
        $result = $this->service->getActiveProducts();
        
        // Assert
        $this->assertCount(2, $result);
        $this->assertEquals('Product 1', $result[0]['name']);
    }
    
    public function testCalculateDiscountForVipCustomer(): void
    {
        $price = 100.0;
        $discount = $this->service->calculateDiscount($price, isVip: true);
        
        $this->assertEquals(90.0, $discount);
    }
}
</code></pre>

        <h3>2.2. Tests de Integración</h3>

        <pre><code class="language-php"><?php
// tests/Integration/Repository/ProductRepositoryTest.php

namespace Tests\\Integration\\Repository;

use Symfony\\Bundle\\FrameworkBundle\\Test\\KernelTestCase;
use App\\Repository\\ProductRepository;

class ProductRepositoryTest extends KernelTestCase
{
    private ProductRepository $repository;
    
    protected function setUp(): void
    {
        self::bootKernel();
        $this->repository = static::getContainer()->get(ProductRepository::class);
    }
    
    public function testFindActiveProducts(): void
    {
        $products = $this->repository->findActiveProducts();
        
        $this->assertNotEmpty($products);
        
        foreach ($products as $product) {
            $this->assertTrue($product->isActive());
        }
    }
}
</code></pre>

        <h3>2.3. Tests End-to-End</h3>

        <pre><code class="language-javascript">// tests/e2e/checkout.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Checkout Flow', () => {
  test('should complete checkout successfully', async ({ page }) => {
    // 1. Ir a la tienda
    await page.goto('https://staging.myshop.com');
    
    // 2. Buscar producto
    await page.fill('[data-test="search-input"]', 'T-shirt');
    await page.click('[data-test="search-button"]');
    
    // 3. Agregar al carrito
    await page.click('[data-test="product-item"]:first-child');
    await page.click('[data-test="add-to-cart"]');
    
    // 4. Ir al checkout
    await page.click('[data-test="cart-icon"]');
    await page.click('[data-test="checkout-button"]');
    
    // 5. Llenar datos
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="first_name"]', 'John');
    await page.fill('[name="last_name"]', 'Doe');
    
    // 6. Completar pago (mock)
    await page.click('[data-test="payment-method-creditcard"]');
    await page.fill('[name="card_number"]', '4111111111111111');
    await page.click('[data-test="complete-order"]');
    
    // 7. Verificar confirmación
    await expect(page.locator('[data-test="order-confirmation"]')).toBeVisible();
    await expect(page.locator('[data-test="order-number"]')).toContainText('ORD-');
  });
});
</code></pre>

        <h2 class="section-title">3. Configuración PHPUnit</h2>

        <pre><code class="language-xml">&lt;?xml version="1.0" encoding="UTF-8"?&gt;
&lt;!-- phpunit.xml --&gt;
&lt;phpunit xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:noNamespaceSchemaLocation="vendor/phpunit/phpunit/phpunit.xsd"
         bootstrap="tests/bootstrap.php"
         colors="true"
         verbose="true"
         failOnRisky="true"
         failOnWarning="true"&gt;
    
    &lt;testsuites&gt;
        &lt;testsuite name="Unit"&gt;
            &lt;directory&gt;tests/Unit&lt;/directory&gt;
        &lt;/testsuite&gt;
        
        &lt;testsuite name="Integration"&gt;
            &lt;directory&gt;tests/Integration&lt;/directory&gt;
        &lt;/testsuite&gt;
        
        &lt;testsuite name="E2E"&gt;
            &lt;directory&gt;tests/E2E&lt;/directory&gt;
        &lt;/testsuite&gt;
    &lt;/testsuites&gt;
    
    &lt;coverage&gt;
        &lt;include&gt;
            &lt;directory suffix=".php"&gt;src&lt;/directory&gt;
            &lt;directory suffix=".php"&gt;modules&lt;/directory&gt;
        &lt;/include&gt;
        
        &lt;exclude&gt;
            &lt;directory&gt;vendor&lt;/directory&gt;
            &lt;directory&gt;tests&lt;/directory&gt;
        &lt;/exclude&gt;
        
        &lt;report&gt;
            &lt;html outputDirectory="build/coverage"/&gt;
            &lt;clover outputFile="build/logs/clover.xml"/&gt;
            &lt;text outputFile="php://stdout" showUncoveredFiles="false"/&gt;
        &lt;/report&gt;
    &lt;/coverage&gt;
    
    &lt;php&gt;
        &lt;env name="APP_ENV" value="test"/&gt;
        &lt;env name="DB_DATABASE" value="prestashop_test"/&gt;
        &lt;server name="KERNEL_CLASS" value="App\\Kernel"/&gt;
    &lt;/php&gt;
    
    &lt;logging&gt;
        &lt;junit outputFile="build/logs/junit.xml"/&gt;
    &lt;/logging&gt;
&lt;/phpunit&gt;
</code></pre>

        <h2 class="section-title">4. Parallel Testing</h2>

        <pre><code class="language-bash"># Paralelizar tests con ParaTest
composer require --dev brianium/paratest

# Ejecutar en paralelo
vendor/bin/paratest --processes=4 --runner=WrapperRunner

# phpunit.xml config para parallel
&lt;phpunit
    processIsolation="true"
    beStrictAboutOutputDuringTests="true"
&gt;
</code></pre>

        <pre><code class="language-yaml"># GitHub Actions - Matrix paralelo
strategy:
  matrix:
    suite: [Unit, Integration, E2E]
    php: ['8.1', '8.2']

steps:
  - name: Run tests
    run: vendor/bin/phpunit --testsuite=\${{ matrix.suite }}
</code></pre>

        <h2 class="section-title">5. Test Data Builders</h2>

        <pre><code class="language-php"><?php
// tests/Builders/ProductBuilder.php

class ProductBuilder
{
    private int $id = 1;
    private string $name = 'Test Product';
    private float $price = 99.99;
    private bool $active = true;
    
    public static function aProduct(): self
    {
        return new self();
    }
    
    public function withId(int $id): self
    {
        $this->id = $id;
        return $this;
    }
    
    public function withName(string $name): self
    {
        $this->name = $name;
        return $this;
    }
    
    public function inactive(): self
    {
        $this->active = false;
        return $this;
    }
    
    public function build(): Product
    {
        return new Product(
            $this->id,
            $this->name,
            $this->price,
            $this->active
        );
    }
}

// Uso en tests
$product = ProductBuilder::aProduct()
    ->withName('Special Product')
    ->inactive()
    ->build();
</code></pre>

        <h2 class="section-title">6. Database Fixtures</h2>

        <pre><code class="language-php"><?php
// tests/Fixtures/ProductFixtures.php

use Doctrine\\Bundle\\FixturesBundle\\Fixture;
use Doctrine\\Persistence\\ObjectManager;

class ProductFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $products = [
            ['name' => 'Product 1', 'price' => 10.00, 'active' => true],
            ['name' => 'Product 2', 'price' => 20.00, 'active' => true],
            ['name' => 'Product 3', 'price' => 30.00, 'active' => false],
        ];
        
        foreach ($products as $data) {
            $product = new Product();
            $product->setName($data['name']);
            $product->setPrice($data['price']);
            $product->setActive($data['active']);
            
            $manager->persist($product);
        }
        
        $manager->flush();
    }
}

// Cargar en tests
php bin/console doctrine:fixtures:load --env=test
</code></pre>

        <h2 class="section-title">7. Continuous Testing</h2>

        <pre><code class="language-bash"># Watch mode - ejecutar tests al detectar cambios
# Usando phpunit-watcher
composer require --dev spatie/phpunit-watcher

vendor/bin/phpunit-watcher watch

# Configuración .phpunit-watcher.yml
watch:
  directories:
    - src
    - modules
    - tests
  fileMask: '*.php'
notifications:
  passingTests: false
  failingTests: true
</code></pre>

        <h2 class="section-title">8. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Builds Efectivos:</strong>
            <ul class="mb-0">
                <li>Scripts versionados con el código</li>
                <li>Builds reproducibles (mismos inputs → mismos outputs)</li>
                <li>Dependencias pinneadas (lock files)</li>
                <li>Cache agresivo de dependencias</li>
                <li>Build en ambiente aislado (Docker)</li>
                <li>Artifacts versionados y firmados</li>
                <li>Build time < 10 minutos</li>
            </ul>
        </div>

        <div class="alert alert-success">
            <strong>✅ Tests Efectivos:</strong>
            <ul class="mb-0">
                <li>80% unit, 15% integration, 5% E2E</li>
                <li>Tests rápidos (< 1ms por unit test)</li>
                <li>Tests aislados (sin dependencias entre ellos)</li>
                <li>Tests determinísticos (sin flaky tests)</li>
                <li>Coverage > 80%</li>
                <li>Fail fast (tests rápidos primero)</li>
                <li>Paralelizar cuando sea posible</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Evitar:</strong>
            <ul class="mb-0">
                <li>Tests que dependen de orden de ejecución</li>
                <li>Tests con sleep/delays</li>
                <li>Tests que acceden a servicios externos</li>
                <li>Tests sin asserts</li>
                <li>Builds que requieren intervención manual</li>
                <li>No limpiar estado entre tests</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>📊 Métricas Objetivo:</strong>
            <ul class="mb-0">
                <li><strong>Build time:</strong> < 10 minutos</li>
                <li><strong>Test time:</strong> < 5 minutos (unit + integration)</li>
                <li><strong>Coverage:</strong> > 80%</li>
                <li><strong>Flaky test rate:</strong> < 1%</li>
                <li><strong>Build success rate:</strong> > 95%</li>
            </ul>
        </div>
    </div>
`;

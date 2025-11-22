// @ts-nocheck
const refactoringContinuo = `
    <div class="content-section">
        <h1 id="refactoring-continuo">Refactoring Continuo Basado en Análisis</h1>
        <p>Estrategias y técnicas de refactoring continuo en proyectos PrestaShop 8.9+ basándose en análisis estático y métricas.</p>

        <h2 class="section-title">1. ¿Qué es Refactoring Continuo?</h2>

        <div class="alert alert-info">
            <strong>🔄 Refactoring Continuo:</strong>
            <ul class="mb-0">
                <li>Mejora incremental del código existente</li>
                <li>Sin cambiar comportamiento externo</li>
                <li>Basado en métricas y code smells</li>
                <li>Integrado en el flujo de trabajo</li>
                <li>Previene deuda técnica</li>
                <li>Parte del ciclo de desarrollo normal</li>
            </ul>
        </div>

        <h2 class="section-title">2. Regla del Boy Scout</h2>

        <pre><code class="language-markdown">## Boy Scout Rule
"Deja el código más limpio de lo que lo encontraste"

### Aplicación
1. Al trabajar en un archivo
2. Identificar un code smell cercano
3. Refactorizar si toma < 15 minutos
4. Incluir en el mismo commit
5. Documentar en commit message

### Ejemplo Commit
\`\`\`
feat: Add product discount calculation

- Implement discount logic for VIP customers
- Refactor: Extract validateDiscount method (Boy Scout)
- Tests: Add unit tests for discount rules
\`\`\`
</code></pre>

        <h2 class="section-title">3. Técnicas de Refactoring</h2>

        <h3>3.1. Extract Method</h3>

        <pre><code class="language-php"><?php
// Antes: Método largo
class OrderProcessor
{
    public function processOrder($order)
    {
        // Validar orden
        if (!$order->id) {
            throw new Exception('Invalid order');
        }
        
        // Validar productos
        $products = $order->getProducts();
        foreach ($products as $product) {
            if (!$product['active']) {
                throw new Exception('Inactive product');
            }
            if ($product['stock'] < $product['quantity']) {
                throw new Exception('Insufficient stock');
            }
        }
        
        // Calcular total
        $total = 0;
        foreach ($products as $product) {
            $total += $product['price'] * $product['quantity'];
        }
        
        // Aplicar descuentos
        $customer = $order->getCustomer();
        if ($customer->isVip()) {
            $total *= 0.9;
        }
        
        $order->total = $total;
        $order->save();
        
        return $order;
    }
}

// Después: Métodos extraídos
class OrderProcessor
{
    public function processOrder($order): Order
    {
        $this->validateOrder($order);
        $products = $this->validateProducts($order);
        $total = $this->calculateTotal($products);
        $total = $this->applyDiscounts($total, $order->getCustomer());
        
        $order->total = $total;
        $order->save();
        
        return $order;
    }
    
    private function validateOrder($order): void
    {
        if (!$order->id) {
            throw new Exception('Invalid order');
        }
    }
    
    private function validateProducts($order): array
    {
        $products = $order->getProducts();
        
        foreach ($products as $product) {
            $this->validateProduct($product);
        }
        
        return $products;
    }
    
    private function validateProduct(array $product): void
    {
        if (!$product['active']) {
            throw new Exception('Inactive product');
        }
        
        if ($product['stock'] < $product['quantity']) {
            throw new Exception('Insufficient stock');
        }
    }
    
    private function calculateTotal(array $products): float
    {
        $total = 0;
        
        foreach ($products as $product) {
            $total += $product['price'] * $product['quantity'];
        }
        
        return $total;
    }
    
    private function applyDiscounts(float $total, $customer): float
    {
        return $customer->isVip() ? $total * 0.9 : $total;
    }
}
</code></pre>

        <h3>3.2. Replace Magic Numbers</h3>

        <pre><code class="language-php"><?php
// Antes: Magic numbers
class ShippingCalculator
{
    public function calculate($weight, $distance)
    {
        if ($weight < 5 && $distance < 100) {
            return 10;
        } elseif ($weight < 10 && $distance < 200) {
            return 20;
        }
        
        return 30;
    }
}

// Después: Constantes con nombre
class ShippingCalculator
{
    private const LIGHT_WEIGHT_THRESHOLD = 5;
    private const MEDIUM_WEIGHT_THRESHOLD = 10;
    private const SHORT_DISTANCE_THRESHOLD = 100;
    private const MEDIUM_DISTANCE_THRESHOLD = 200;
    
    private const LIGHT_SHORT_COST = 10;
    private const MEDIUM_MEDIUM_COST = 20;
    private const HEAVY_LONG_COST = 30;
    
    public function calculate(float $weight, float $distance): float
    {
        if ($this->isLightAndShort($weight, $distance)) {
            return self::LIGHT_SHORT_COST;
        }
        
        if ($this->isMediumAndMedium($weight, $distance)) {
            return self::MEDIUM_MEDIUM_COST;
        }
        
        return self::HEAVY_LONG_COST;
    }
    
    private function isLightAndShort(float $weight, float $distance): bool
    {
        return $weight < self::LIGHT_WEIGHT_THRESHOLD 
            && $distance < self::SHORT_DISTANCE_THRESHOLD;
    }
    
    private function isMediumAndMedium(float $weight, float $distance): bool
    {
        return $weight < self::MEDIUM_WEIGHT_THRESHOLD 
            && $distance < self::MEDIUM_DISTANCE_THRESHOLD;
    }
}
</code></pre>

        <h3>3.3. Replace Conditional with Polymorphism</h3>

        <pre><code class="language-php"><?php
// Antes: Switch/if basado en tipo
class PaymentProcessor
{
    public function process($payment, $type)
    {
        switch ($type) {
            case 'credit_card':
                return $this->processCreditCard($payment);
            
            case 'paypal':
                return $this->processPayPal($payment);
            
            case 'bank_transfer':
                return $this->processBankTransfer($payment);
            
            default:
                throw new Exception('Unknown payment type');
        }
    }
}

// Después: Polimorfismo
interface PaymentMethod
{
    public function process($payment): bool;
}

class CreditCardPayment implements PaymentMethod
{
    public function process($payment): bool
    {
        // Lógica específica tarjeta
        return true;
    }
}

class PayPalPayment implements PaymentMethod
{
    public function process($payment): bool
    {
        // Lógica específica PayPal
        return true;
    }
}

class BankTransferPayment implements PaymentMethod
{
    public function process($payment): bool
    {
        // Lógica específica transferencia
        return true;
    }
}

class PaymentProcessor
{
    private array $methods = [];
    
    public function __construct()
    {
        $this->methods = [
            'credit_card' => new CreditCardPayment(),
            'paypal' => new PayPalPayment(),
            'bank_transfer' => new BankTransferPayment(),
        ];
    }
    
    public function process($payment, string $type): bool
    {
        $method = $this->methods[$type] ?? null;
        
        if (!$method) {
            throw new Exception("Unknown payment type: {$type}");
        }
        
        return $method->process($payment);
    }
}
</code></pre>

        <h2 class="section-title">4. Automatización del Refactoring</h2>

        <h3>4.1. Rector (PHP Refactoring Tool)</h3>

        <pre><code class="language-bash"># Instalar Rector
composer require --dev rector/rector

# Configuración
# rector.php
<?php
use Rector\\Config\\RectorConfig;
use Rector\\Set\\ValueObject\\SetList;

return static function (RectorConfig $rectorConfig): void {
    $rectorConfig->paths([
        __DIR__ . '/modules/mymodule',
    ]);
    
    $rectorConfig->sets([
        SetList::CODE_QUALITY,
        SetList::DEAD_CODE,
        SetList::TYPE_DECLARATION,
        SetList::EARLY_RETURN,
    ]);
    
    // PHP 8.1
    $rectorConfig->phpVersion(PhpVersion::PHP_81);
};

# Dry-run (mostrar cambios)
vendor/bin/rector process --dry-run

# Aplicar cambios
vendor/bin/rector process
</code></pre>

        <h3>4.2. Reglas Custom de Rector</h3>

        <pre><code class="language-php"><?php
// rector.php - Custom rules
use Rector\\Config\\RectorConfig;
use Rector\\Renaming\\Rector\\MethodCall\\RenameMethodRector;
use Rector\\Renaming\\ValueObject\\MethodCallRename;

return static function (RectorConfig $rectorConfig): void {
    // Renombrar métodos legacy
    $rectorConfig->ruleWithConfiguration(RenameMethodRector::class, [
        new MethodCallRename(
            'Product',
            'getProductName',
            'getName'
        ),
        new MethodCallRename(
            'Customer',
            'getCustomerEmail',
            'getEmail'
        ),
    ]);
    
    // Agregar type hints
    $rectorConfig->sets([
        SetList::TYPE_DECLARATION,
    ]);
};
</code></pre>

        <h2 class="section-title">5. Workflow de Refactoring</h2>

        <h3>5.1. Proceso Step-by-Step</h3>

        <pre><code class="language-markdown">## Proceso de Refactoring Seguro

### 1. Identificar Code Smell
- Ejecutar análisis estático
- Revisar métricas
- Priorizar por impacto

### 2. Asegurar Tests
\`\`\`bash
# Verificar cobertura actual
vendor/bin/phpunit --coverage-text

# Si < 80%, agregar tests primero
\`\`\`

### 3. Crear Branch
\`\`\`bash
git checkout -b refactor/extract-order-validation
\`\`\`

### 4. Refactorizar
- Pequeños pasos incrementales
- Commit después de cada paso
- Ejecutar tests constantemente

### 5. Verificar
\`\`\`bash
# Tests
vendor/bin/phpunit

# Análisis estático
vendor/bin/phpstan analyse
vendor/bin/phpmd modules/mymodule text codesize

# Verificar mejora
vendor/bin/phpmetrics modules/mymodule
\`\`\`

### 6. Code Review
- Pull request con contexto
- Antes/después de métricas
- Explicar motivación

### 7. Deploy
- Merge a main
- Deploy gradual
- Monitor errores
</code></pre>

        <h3>5.2. Refactoring en PR</h3>

        <pre><code class="language-markdown">## Pull Request Template para Refactoring

### Tipo: Refactoring

**Code Smell:** Alta complejidad ciclomática en OrderProcessor
**Métrica antes:** CC = 15, MI = 55
**Métrica después:** CC = 4, MI = 78

### Cambios
- Extract method: validateProducts()
- Extract method: calculateTotal()
- Extract method: applyDiscounts()

### Tests
- [x] Tests existentes pasan
- [x] Cobertura mantenida (85%)
- [x] No cambios en comportamiento

### Verificación
\`\`\`bash
# Antes
vendor/bin/phpmd src text codesize
# OrderProcessor::processOrder() - CC: 15

# Después
vendor/bin/phpmd src text codesize
# OrderProcessor::processOrder() - CC: 4
\`\`\`
</code></pre>

        <h2 class="section-title">6. Refactoring Patterns PrestaShop</h2>

        <h3>6.1. Module Controller Refactoring</h3>

        <pre><code class="language-php"><?php
// Antes: Controlador con lógica de negocio
class MyModuleFrontController extends ModuleFrontController
{
    public function initContent()
    {
        parent::initContent();
        
        // Lógica de negocio mezclada
        $customer = $this->context->customer;
        $cart = $this->context->cart;
        
        $products = Product::getProducts(
            $this->context->language->id,
            0,
            100,
            'id_product',
            'ASC'
        );
        
        foreach ($products as &$product) {
            $product['discount'] = 0;
            if ($customer->isLogged() && $customer->id_group == 3) {
                $product['discount'] = 10;
            }
            $product['final_price'] = $product['price'] * (1 - $product['discount'] / 100);
        }
        
        $this->context->smarty->assign([
            'products' => $products,
        ]);
        
        $this->setTemplate('module:mymodule/views/templates/front/products.tpl');
    }
}

// Después: Con servicios
class MyModuleFrontController extends ModuleFrontController
{
    private $productService;
    private $discountService;
    
    public function __construct()
    {
        parent::__construct();
        $this->productService = new ProductService();
        $this->discountService = new DiscountService();
    }
    
    public function initContent()
    {
        parent::initContent();
        
        $customer = $this->context->customer;
        $products = $this->productService->getAvailableProducts(
            $this->context->language->id
        );
        
        $products = $this->discountService->applyDiscounts(
            $products,
            $customer
        );
        
        $this->context->smarty->assign([
            'products' => $products,
        ]);
        
        $this->setTemplate('module:mymodule/views/templates/front/products.tpl');
    }
}

// Servicios separados
class ProductService
{
    public function getAvailableProducts(int $langId): array
    {
        return Product::getProducts($langId, 0, 100, 'id_product', 'ASC');
    }
}

class DiscountService
{
    public function applyDiscounts(array $products, $customer): array
    {
        foreach ($products as &$product) {
            $discount = $this->calculateDiscount($product, $customer);
            $product['discount'] = $discount;
            $product['final_price'] = $product['price'] * (1 - $discount / 100);
        }
        
        return $products;
    }
    
    private function calculateDiscount(array $product, $customer): float
    {
        if (!$customer->isLogged()) {
            return 0;
        }
        
        if ($customer->id_group == 3) {
            return 10;
        }
        
        return 0;
    }
}
</code></pre>

        <h2 class="section-title">7. CI/CD para Refactoring</h2>

        <pre><code class="language-yaml"># .github/workflows/refactoring-check.yml
name: Refactoring Check

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  metrics-diff:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.1'
      
      - name: Install dependencies
        run: composer install
      
      - name: Metrics on base branch
        run: |
          git checkout \${{ github.base_ref }}
          vendor/bin/phpmetrics --report-json=base-metrics.json modules/mymodule
      
      - name: Metrics on PR branch
        run: |
          git checkout \${{ github.head_ref }}
          vendor/bin/phpmetrics --report-json=pr-metrics.json modules/mymodule
      
      - name: Compare metrics
        run: |
          BASE_MI=\$(cat base-metrics.json | jq '.average.maintainabilityIndex')
          PR_MI=\$(cat pr-metrics.json | jq '.average.maintainabilityIndex')
          
          BASE_CC=\$(cat base-metrics.json | jq '.average.cyclomaticComplexity')
          PR_CC=\$(cat pr-metrics.json | jq '.average.cyclomaticComplexity')
          
          echo "## Metrics Comparison" > comparison.md
          echo "" >> comparison.md
          echo "| Metric | Base | PR | Change |" >> comparison.md
          echo "|--------|------|----|----|" >> comparison.md
          echo "| Maintainability | \$BASE_MI | \$PR_MI | \$(echo "\$PR_MI - \$BASE_MI" | bc) |" >> comparison.md
          echo "| Complexity | \$BASE_CC | \$PR_CC | \$(echo "\$PR_CC - \$BASE_CC" | bc) |" >> comparison.md
          
          cat comparison.md
          
          # Fail if metrics worsened
          if (( \$(echo "\$PR_MI < \$BASE_MI" | bc -l) )); then
            echo "❌ Maintainability decreased"
            exit 1
          fi
          
          if (( \$(echo "\$PR_CC > \$BASE_CC" | bc -l) )); then
            echo "❌ Complexity increased"
            exit 1
          fi
          
          echo "✅ Metrics improved or maintained"
</code></pre>

        <h2 class="section-title">8. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Refactoring Efectivo:</strong>
            <ul class="mb-0">
                <li>Tests antes de refactorizar</li>
                <li>Pequeños pasos incrementales</li>
                <li>Commit frecuente</li>
                <li>Ejecutar tests constantemente</li>
                <li>Un tipo de refactoring por vez</li>
                <li>Code review obligatorio</li>
                <li>Medir mejora con métricas</li>
                <li>Boy Scout rule en cada commit</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Evitar:</strong>
            <ul class="mb-0">
                <li>Refactoring masivo sin tests</li>
                <li>Mezclar feature + refactoring</li>
                <li>Cambiar comportamiento</li>
                <li>Refactoring sin razón clara</li>
                <li>Ignorar code reviews</li>
                <li>No medir impacto</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>📋 Priorización:</strong>
            <ul class="mb-0">
                <li><strong>Alta prioridad:</strong> Código con bugs frecuentes</li>
                <li><strong>Media prioridad:</strong> Código con CC > 10</li>
                <li><strong>Baja prioridad:</strong> Code smells menores</li>
                <li><strong>Boy Scout:</strong> Oportunista en archivos tocados</li>
            </ul>
        </div>
    </div>
`;

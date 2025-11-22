// @ts-nocheck
const analisisComplejidadCiclomatica = `
    <div class="content-section">
        <h1 id="analisis-complejidad-ciclomatica">Herramientas de Análisis de Complejidad Ciclomática</h1>
        <p>Medición y optimización de la complejidad ciclomática en código PrestaShop 8.9+ para mejorar mantenibilidad y testabilidad.</p>

        <h2 class="section-title">1. ¿Qué es la Complejidad Ciclomática?</h2>

        <div class="alert alert-info">
            <strong>📊 Complejidad Ciclomática (McCabe):</strong>
            <ul class="mb-0">
                <li>Mide el número de caminos linealmente independientes en el código</li>
                <li>Indica cuántas pruebas unitarias son necesarias</li>
                <li>Mayor complejidad = más difícil de mantener y testear</li>
                <li>Se calcula contando decisiones (if, for, while, case, catch, &&, ||)</li>
                <li>Fórmula: <code>M = E - N + 2P</code></li>
            </ul>
        </div>

        <h2 class="section-title">2. Escala de Complejidad</h2>

        <table>
            <thead>
                <tr>
                    <th>Complejidad</th>
                    <th>Riesgo</th>
                    <th>Testabilidad</th>
                    <th>Mantenibilidad</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>1-5</strong></td>
                    <td>Bajo</td>
                    <td>Fácil</td>
                    <td>Excelente</td>
                </tr>
                <tr>
                    <td><strong>6-10</strong></td>
                    <td>Moderado</td>
                    <td>Media</td>
                    <td>Buena</td>
                </tr>
                <tr>
                    <td><strong>11-20</strong></td>
                    <td>Alto</td>
                    <td>Difícil</td>
                    <td>Regular</td>
                </tr>
                <tr>
                    <td><strong>21-50</strong></td>
                    <td>Muy Alto</td>
                    <td>Muy Difícil</td>
                    <td>Mala</td>
                </tr>
                <tr>
                    <td><strong>> 50</strong></td>
                    <td>Crítico</td>
                    <td>No testeable</td>
                    <td>Imposible</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">3. Herramientas de Medición</h2>

        <h3>3.1. phploc</h3>

        <pre><code class="language-bash"># Instalar phploc
composer require --dev phploc/phploc

# Análisis de directorio
vendor/bin/phploc modules/mymodule

# Output ejemplo:
# Cyclomatic Complexity
#   Average Complexity per LLOC: 0.25
#   Average Complexity per Class: 5.20
#   Average Complexity per Method: 2.13
#   Minimum Complexity: 1
#   Maximum Complexity: 15
</code></pre>

        <h3>3.2. PHPMD</h3>

        <pre><code class="language-bash"># Análisis de complejidad con PHPMD
vendor/bin/phpmd modules/mymodule text codesize

# Solo complejidad ciclomática
vendor/bin/phpmd modules/mymodule text \\
  rulesets/codesize.xml/CyclomaticComplexity
</code></pre>

        <h3>3.3. PHP Metrics</h3>

        <pre><code class="language-bash"># Instalar PHP Metrics
composer require --dev phpmetrics/phpmetrics

# Generar reporte HTML
vendor/bin/phpmetrics --report-html=reports/metrics modules/mymodule

# Ver reporte
open reports/metrics/index.html
</code></pre>

        <h2 class="section-title">4. Ejemplo: Alta Complejidad</h2>

        <pre><code class="language-php"><?php
// ❌ Complejidad Ciclomática = 15
class OrderValidator
{
    public function validate($order, $customer, $cart, $payment)
    {
        if (!$order) {  // +1
            return false;
        }
        
        if (!$customer || !$customer->active) {  // +2
            return false;
        }
        
        if ($cart->getTotal() <= 0) {  // +1
            return false;
        }
        
        foreach ($cart->getProducts() as $product) {  // +1
            if (!$product['active']) {  // +1
                return false;
            }
            
            if ($product['quantity'] > $product['stock']) {  // +1
                return false;
            }
        }
        
        if ($payment->status !== 'approved') {  // +1
            if ($payment->status === 'pending') {  // +1
                // Wait
            } elseif ($payment->status === 'failed') {  // +1
                return false;
            } else {  // +1
                throw new Exception('Unknown status');
            }
        }
        
        if ($order->shipping_address) {  // +1
            if (!$this->validateAddress($order->shipping_address)) {  // +1
                return false;
            }
        }
        
        return true;
    }
}
</code></pre>

        <h2 class="section-title">5. Refactoring: Reducir Complejidad</h2>

        <h3>5.1. Extract Method</h3>

        <pre><code class="language-php"><?php
// ✅ Refactorizado - Complejidad: 4 métodos con CC 2-4 cada uno
class OrderValidator
{
    public function validate($order, $customer, $cart, $payment): bool
    {
        return $this->validateOrder($order)
            && $this->validateCustomer($customer)
            && $this->validateCart($cart)
            && $this->validatePayment($payment)
            && $this->validateAddress($order->shipping_address);
    }
    
    private function validateOrder($order): bool
    {
        return $order !== null;
    }
    
    private function validateCustomer($customer): bool
    {
        return $customer && $customer->active;
    }
    
    private function validateCart($cart): bool
    {
        if ($cart->getTotal() <= 0) {
            return false;
        }
        
        foreach ($cart->getProducts() as $product) {
            if (!$this->validateProduct($product)) {
                return false;
            }
        }
        
        return true;
    }
    
    private function validateProduct($product): bool
    {
        return $product['active'] 
            && $product['quantity'] <= $product['stock'];
    }
    
    private function validatePayment($payment): bool
    {
        if ($payment->status === 'approved') {
            return true;
        }
        
        if ($payment->status === 'failed') {
            return false;
        }
        
        if ($payment->status === 'pending') {
            // Wait
            return true;
        }
        
        throw new Exception('Unknown payment status');
    }
    
    private function validateAddress($address): bool
    {
        return $address && $this->addressValidator->validate($address);
    }
}
</code></pre>

        <h3>5.2. Replace Nested Conditionals with Guard Clauses</h3>

        <pre><code class="language-php"><?php
// ❌ Nested conditionals - CC = 8
public function processDiscount($order, $customer)
{
    if ($customer) {
        if ($customer->isVip()) {
            if ($order->total > 100) {
                if ($order->products_count > 5) {
                    return $order->total * 0.8;
                } else {
                    return $order->total * 0.9;
                }
            } else {
                return $order->total * 0.95;
            }
        } else {
            if ($order->total > 100) {
                return $order->total * 0.95;
            }
        }
    }
    
    return $order->total;
}

// ✅ Guard clauses - CC = 5
public function processDiscount($order, $customer): float
{
    if (!$customer) {
        return $order->total;
    }
    
    if (!$customer->isVip()) {
        return $order->total > 100 
            ? $order->total * 0.95 
            : $order->total;
    }
    
    if ($order->total <= 100) {
        return $order->total * 0.95;
    }
    
    return $order->products_count > 5 
        ? $order->total * 0.8 
        : $order->total * 0.9;
}
</code></pre>

        <h3>5.3. Strategy Pattern</h3>

        <pre><code class="language-php"><?php
// ❌ Switch statement - CC = 10
class ShippingCalculator
{
    public function calculate($type, $weight, $distance)
    {
        switch ($type) {
            case 'standard':
                if ($weight < 1) {
                    return 5;
                } elseif ($weight < 5) {
                    return 10;
                } else {
                    return 15;
                }
            
            case 'express':
                if ($distance < 100) {
                    return 20;
                } else {
                    return 30;
                }
            
            case 'overnight':
                return 50;
            
            default:
                throw new Exception('Unknown type');
        }
    }
}

// ✅ Strategy Pattern - CC = 1 (main), 2-3 (strategies)
interface ShippingStrategy
{
    public function calculate(float $weight, float $distance): float;
}

class StandardShipping implements ShippingStrategy
{
    public function calculate(float $weight, float $distance): float
    {
        if ($weight < 1) return 5;
        if ($weight < 5) return 10;
        return 15;
    }
}

class ExpressShipping implements ShippingStrategy
{
    public function calculate(float $weight, float $distance): float
    {
        return $distance < 100 ? 20 : 30;
    }
}

class OvernightShipping implements ShippingStrategy
{
    public function calculate(float $weight, float $distance): float
    {
        return 50;
    }
}

class ShippingCalculator
{
    private array $strategies = [];
    
    public function __construct()
    {
        $this->strategies = [
            'standard' => new StandardShipping(),
            'express' => new ExpressShipping(),
            'overnight' => new OvernightShipping(),
        ];
    }
    
    public function calculate(string $type, float $weight, float $distance): float
    {
        $strategy = $this->strategies[$type] ?? null;
        
        if (!$strategy) {
            throw new Exception("Unknown shipping type: {$type}");
        }
        
        return $strategy->calculate($weight, $distance);
    }
}
</code></pre>

        <h2 class="section-title">6. Configuración PHP Metrics</h2>

        <pre><code class="language-yaml"># .phpmetrics.yml
includes:
    - modules/mymodule

excludes:
    - vendor
    - tests
    - cache

report:
    html: reports/metrics
    json: reports/metrics.json

violations:
    cyclomaticComplexity:
        warning: 10
        error: 15
    
    maintainabilityIndex:
        warning: 65
        error: 50
</code></pre>

        <pre><code class="language-bash"># Generar reporte con config
vendor/bin/phpmetrics --config=.phpmetrics.yml
</code></pre>

        <h2 class="section-title">7. Integración CI/CD</h2>

        <pre><code class="language-yaml"># .github/workflows/complexity.yml
name: Complexity Analysis

on: [push, pull_request]

jobs:
  complexity:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.1'
      
      - name: Install dependencies
        run: composer install
      
      - name: Run phploc
        run: vendor/bin/phploc --log-json=phploc.json modules/mymodule
      
      - name: Run PHPMetrics
        run: vendor/bin/phpmetrics --report-html=reports/metrics modules/mymodule
      
      - name: Check complexity threshold
        run: |
          MAX_CC=\$(cat phploc.json | jq '.cyclomatic_complexity.max')
          if [ "\$MAX_CC" -gt 15 ]; then
            echo "❌ Maximum complexity \$MAX_CC exceeds threshold 15"
            exit 1
          fi
          echo "✅ Maximum complexity \$MAX_CC is acceptable"
      
      - name: Upload Reports
        uses: actions/upload-artifact@v3
        with:
          name: complexity-reports
          path: reports/
</code></pre>

        <h2 class="section-title">8. Dashboard de Complejidad</h2>

        <pre><code class="language-bash"># Script para generar dashboard
#!/bin/bash

echo "Generando métricas de complejidad..."

# phploc
vendor/bin/phploc --log-json=reports/phploc.json modules/mymodule

# PHPMD
vendor/bin/phpmd modules/mymodule json codesize > reports/phpmd.json

# PHP Metrics
vendor/bin/phpmetrics --report-html=reports/metrics modules/mymodule

echo "✅ Dashboard generado en reports/"
echo "📊 Abrir reports/metrics/index.html"
</code></pre>

        <h2 class="section-title">9. Métricas Relacionadas</h2>

        <h3>9.1. NPath Complexity</h3>

        <pre><code class="language-php"><?php
// NPath = número de caminos de ejecución
// NPath = 1 + if + else + while + for + case + catch + ?:

// Ejemplo: NPath = 12
public function calculate($a, $b, $c)
{
    if ($a > 0) {  // 2 caminos
        if ($b > 0) {  // 2 caminos
            return $a + $b;
        }
    }
    
    if ($c > 0) {  // 2 caminos
        return $c;
    }
    
    return 0;
}
// NPath = 2 * 2 * 2 = 8 (más caminos base)
</code></pre>

        <h3>9.2. Maintainability Index</h3>

        <pre><code class="language-plaintext">MI = 171 - 5.2 * ln(HV) - 0.23 * CC - 16.2 * ln(LOC)

Donde:
- HV = Halstead Volume
- CC = Cyclomatic Complexity
- LOC = Lines of Code

Escala:
- > 85: Excelente
- 65-85: Buena
- 50-65: Regular
- < 50: Mala (refactorizar urgente)
</code></pre>

        <h2 class="section-title">10. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Reducir Complejidad:</strong>
            <ul class="mb-0">
                <li><strong>Extract Method:</strong> dividir métodos grandes</li>
                <li><strong>Guard Clauses:</strong> retornos tempranos</li>
                <li><strong>Strategy Pattern:</strong> reemplazar switch/if</li>
                <li><strong>Tabla de Decisión:</strong> lógica compleja en arrays</li>
                <li><strong>Polimorfismo:</strong> en lugar de type checking</li>
                <li><strong>Decompose Conditional:</strong> extraer condiciones complejas</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Señales de Alerta:</strong>
            <ul class="mb-0">
                <li>Método con CC > 10</li>
                <li>Clase con CC promedio > 5</li>
                <li>NPath > 200</li>
                <li>Maintainability Index < 65</li>
                <li>Profundidad de anidación > 3</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>🎯 Objetivos:</strong>
            <ul class="mb-0">
                <li><strong>Métodos:</strong> CC < 5 (ideal), < 10 (aceptable)</li>
                <li><strong>Clases:</strong> CC promedio < 3</li>
                <li><strong>NPath:</strong> < 200</li>
                <li><strong>MI:</strong> > 65</li>
                <li>0 métodos con CC > 15</li>
            </ul>
        </div>
    </div>
`;

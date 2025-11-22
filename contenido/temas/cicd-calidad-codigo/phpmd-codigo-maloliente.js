// @ts-nocheck
const phpmdCodigoMaloliente = `
    <div class="content-section">
        <h1 id="phpmd-codigo-maloliente">PHPMD para Detección de Código Maloliente</h1>
        <p>PHP Mess Detector para identificar y eliminar code smells en proyectos PrestaShop 8.9+ mejorando mantenibilidad.</p>

        <h2 class="section-title">1. ¿Qué es PHPMD?</h2>

        <div class="alert alert-info">
            <strong>👃 PHPMD (PHP Mess Detector):</strong>
            <ul class="mb-0">
                <li>Detecta code smells (código maloliente)</li>
                <li>Identifica bugs potenciales</li>
                <li>Encuentra código subóptimo</li>
                <li>Mide complejidad ciclomática</li>
                <li>Detecta código duplicado</li>
                <li>Variables no utilizadas</li>
                <li>Métodos demasiado largos</li>
                <li>Clases con muchas dependencias</li>
            </ul>
        </div>

        <h2 class="section-title">2. Instalación</h2>

        <pre><code class="language-bash"># Instalar PHPMD
composer require --dev phpmd/phpmd

# Verificar instalación
vendor/bin/phpmd --version

# Ver rulesets disponibles
ls vendor/phpmd/phpmd/src/main/resources/rulesets/
</code></pre>

        <h2 class="section-title">3. Rulesets Disponibles</h2>

        <table>
            <thead>
                <tr>
                    <th>Ruleset</th>
                    <th>Descripción</th>
                    <th>Detecta</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>cleancode</strong></td>
                    <td>Código limpio</td>
                    <td>Boolean flags, else expressions, static access</td>
                </tr>
                <tr>
                    <td><strong>codesize</strong></td>
                    <td>Tamaño de código</td>
                    <td>Clases/métodos muy largos, muchos parámetros</td>
                </tr>
                <tr>
                    <td><strong>controversial</strong></td>
                    <td>Prácticas controversiales</td>
                    <td>Camel case, superglobals, goto</td>
                </tr>
                <tr>
                    <td><strong>design</strong></td>
                    <td>Problemas de diseño</td>
                    <td>Acoplamiento, profundidad, complejidad</td>
                </tr>
                <tr>
                    <td><strong>naming</strong></td>
                    <td>Convenciones de nombres</td>
                    <td>Nombres cortos/largos, constructores</td>
                </tr>
                <tr>
                    <td><strong>unusedcode</strong></td>
                    <td>Código no utilizado</td>
                    <td>Variables, parámetros, métodos sin usar</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">4. Configuración Básica</h2>

        <pre><code class="language-xml">&lt;?xml version="1.0"?&gt;
&lt;!-- phpmd.xml --&gt;
&lt;ruleset name="PrestaShop PHPMD Rules"
         xmlns="http://pmd.sf.net/ruleset/1.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://pmd.sf.net/ruleset/1.0.0 http://pmd.sf.net/ruleset_xml_schema.xsd"&gt;
    
    &lt;description&gt;Custom PHPMD rules for PrestaShop&lt;/description&gt;
    
    &lt;!-- Clean Code --&gt;
    &lt;rule ref="rulesets/cleancode.xml"&gt;
        &lt;exclude name="StaticAccess"/&gt;
        &lt;exclude name="ElseExpression"/&gt;
    &lt;/rule&gt;
    
    &lt;!-- Code Size --&gt;
    &lt;rule ref="rulesets/codesize.xml"/&gt;
    
    &lt;!-- Design --&gt;
    &lt;rule ref="rulesets/design.xml"/&gt;
    
    &lt;!-- Naming --&gt;
    &lt;rule ref="rulesets/naming.xml"&gt;
        &lt;exclude name="ShortVariable"/&gt;
    &lt;/rule&gt;
    
    &lt;!-- Unused Code --&gt;
    &lt;rule ref="rulesets/unusedcode.xml"/&gt;
&lt;/ruleset&gt;
</code></pre>

        <h2 class="section-title">5. Ejemplos de Code Smells</h2>

        <h3>5.1. Método Demasiado Largo</h3>

        <pre><code class="language-php"><?php
// ❌ Code Smell: ExcessiveMethodLength
class ProductController
{
    public function processOrder($cart, $customer, $address)
    {
        // 150 líneas de código...
        // Validar cart
        if (!$cart->id) {
            throw new Exception('Invalid cart');
        }
        
        // Validar customer
        if (!$customer->id) {
            throw new Exception('Invalid customer');
        }
        
        // Calcular total
        $total = 0;
        foreach ($cart->getProducts() as $product) {
            $total += $product['price'] * $product['quantity'];
        }
        
        // Aplicar descuentos
        // ... 50 líneas más
        
        // Crear orden
        // ... 50 líneas más
        
        // Enviar emails
        // ... 30 líneas más
    }
}

// ✅ Refactorizado
class ProductController
{
    private $cartValidator;
    private $orderCalculator;
    private $orderCreator;
    private $emailSender;
    
    public function processOrder($cart, $customer, $address): Order
    {
        $this->cartValidator->validate($cart, $customer);
        $total = $this->orderCalculator->calculate($cart);
        $order = $this->orderCreator->create($cart, $customer, $address, $total);
        $this->emailSender->sendOrderConfirmation($order);
        
        return $order;
    }
}
</code></pre>

        <h3>5.2. Demasiados Parámetros</h3>

        <pre><code class="language-php"><?php
// ❌ Code Smell: ExcessiveParameterList
public function createProduct(
    $name,
    $price,
    $tax,
    $weight,
    $width,
    $height,
    $depth,
    $active,
    $available_for_order,
    $show_price,
    $online_only
) {
    // ...
}

// ✅ Refactorizado con DTO
class ProductData
{
    public string $name;
    public float $price;
    public float $tax;
    public float $weight;
    public ?Dimensions $dimensions;
    public bool $active;
    public bool $availableForOrder;
    public bool $showPrice;
    public bool $onlineOnly;
}

public function createProduct(ProductData $data): Product
{
    // ...
}
</code></pre>

        <h3>5.3. Complejidad Ciclomática Alta</h3>

        <pre><code class="language-php"><?php
// ❌ Code Smell: CyclomaticComplexity > 10
public function calculateShipping($cart, $address, $carrier)
{
    $cost = 0;
    
    if ($cart->getTotal() > 100) {
        if ($address->country === 'ES') {
            if ($carrier->id === 1) {
                $cost = 5;
            } elseif ($carrier->id === 2) {
                $cost = 10;
            } else {
                $cost = 15;
            }
        } elseif ($address->country === 'FR') {
            if ($carrier->id === 1) {
                $cost = 8;
            } else {
                $cost = 12;
            }
        }
    } else {
        if ($address->country === 'ES') {
            $cost = 7;
        } else {
            $cost = 15;
        }
    }
    
    return $cost;
}

// ✅ Refactorizado con Strategy Pattern
interface ShippingStrategy
{
    public function calculate(Cart $cart, Address $address, Carrier $carrier): float;
}

class FreeShippingStrategy implements ShippingStrategy
{
    public function calculate(Cart $cart, Address $address, Carrier $carrier): float
    {
        return $cart->getTotal() > 100 ? 0 : 10;
    }
}

class CarrierBasedStrategy implements ShippingStrategy
{
    private array $rates;
    
    public function calculate(Cart $cart, Address $address, Carrier $carrier): float
    {
        $key = "{$address->country}_{$carrier->id}";
        return $this->rates[$key] ?? 15;
    }
}
</code></pre>

        <h3>5.4. Variables No Utilizadas</h3>

        <pre><code class="language-php"><?php
// ❌ Code Smell: UnusedLocalVariable
public function processPayment($cart, $customer)
{
    $total = $cart->getTotal();
    $tax = $cart->getTax();  // No se usa
    $discount = $cart->getDiscount();  // No se usa
    
    $payment = new Payment();
    $payment->amount = $total;
    $payment->save();
    
    return $payment;
}

// ✅ Eliminar variables no usadas
public function processPayment($cart, $customer): Payment
{
    $payment = new Payment();
    $payment->amount = $cart->getTotal();
    $payment->save();
    
    return $payment;
}
</code></pre>

        <h2 class="section-title">6. Configuración Avanzada</h2>

        <pre><code class="language-xml">&lt;?xml version="1.0"?&gt;
&lt;ruleset name="PrestaShop Advanced"&gt;
    
    &lt;!-- Complejidad Ciclomática --&gt;
    &lt;rule ref="rulesets/codesize.xml/CyclomaticComplexity"&gt;
        &lt;properties&gt;
            &lt;property name="reportLevel" value="10"/&gt;
        &lt;/properties&gt;
    &lt;/rule&gt;
    
    &lt;!-- NPath Complexity --&gt;
    &lt;rule ref="rulesets/codesize.xml/NPathComplexity"&gt;
        &lt;properties&gt;
            &lt;property name="minimum" value="200"/&gt;
        &lt;/properties&gt;
    &lt;/rule&gt;
    
    &lt;!-- Longitud de Métodos --&gt;
    &lt;rule ref="rulesets/codesize.xml/ExcessiveMethodLength"&gt;
        &lt;properties&gt;
            &lt;property name="minimum" value="100"/&gt;
        &lt;/properties&gt;
    &lt;/rule&gt;
    
    &lt;!-- Longitud de Clases --&gt;
    &lt;rule ref="rulesets/codesize.xml/ExcessiveClassLength"&gt;
        &lt;properties&gt;
            &lt;property name="minimum" value="1000"/&gt;
        &lt;/properties&gt;
    &lt;/rule&gt;
    
    &lt;!-- Parámetros por Método --&gt;
    &lt;rule ref="rulesets/codesize.xml/ExcessiveParameterList"&gt;
        &lt;properties&gt;
            &lt;property name="minimum" value="5"/&gt;
        &lt;/properties&gt;
    &lt;/rule&gt;
    
    &lt;!-- Public Methods por Clase --&gt;
    &lt;rule ref="rulesets/codesize.xml/ExcessivePublicCount"&gt;
        &lt;properties&gt;
            &lt;property name="minimum" value="20"/&gt;
        &lt;/properties&gt;
    &lt;/rule&gt;
    
    &lt;!-- Acoplamiento --&gt;
    &lt;rule ref="rulesets/design.xml/CouplingBetweenObjects"&gt;
        &lt;properties&gt;
            &lt;property name="maximum" value="13"/&gt;
        &lt;/properties&gt;
    &lt;/rule&gt;
    
    &lt;!-- Nombres Cortos --&gt;
    &lt;rule ref="rulesets/naming.xml/ShortVariable"&gt;
        &lt;properties&gt;
            &lt;property name="minimum" value="3"/&gt;
            &lt;property name="exceptions" value="id,db,em"/&gt;
        &lt;/properties&gt;
    &lt;/rule&gt;
&lt;/ruleset&gt;
</code></pre>

        <h2 class="section-title">7. Ejecutar PHPMD</h2>

        <pre><code class="language-bash"># Análisis básico
vendor/bin/phpmd modules/mymodule text phpmd.xml

# Formato HTML
vendor/bin/phpmd modules/mymodule html phpmd.xml > phpmd-report.html

# Formato XML
vendor/bin/phpmd modules/mymodule xml phpmd.xml > phpmd-report.xml

# Formato JSON
vendor/bin/phpmd modules/mymodule json phpmd.xml > phpmd-report.json

# Solo rulesets específicos
vendor/bin/phpmd modules/mymodule text codesize,unusedcode

# Excluir directorios
vendor/bin/phpmd modules/mymodule text phpmd.xml --exclude vendor,tests

# Sin reporte de warnings (solo errores)
vendor/bin/phpmd modules/mymodule text phpmd.xml --strict
</code></pre>

        <h2 class="section-title">8. Integración CI/CD</h2>

        <h3>8.1. GitHub Actions</h3>

        <pre><code class="language-yaml"># .github/workflows/phpmd.yml
name: PHPMD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  phpmd:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.1'
      
      - name: Install dependencies
        run: composer install --no-progress
      
      - name: Run PHPMD
        run: |
          vendor/bin/phpmd modules/mymodule github phpmd.xml
      
      - name: Generate HTML Report
        if: always()
        run: |
          vendor/bin/phpmd modules/mymodule html phpmd.xml > phpmd-report.html
      
      - name: Upload Report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: phpmd-report
          path: phpmd-report.html
</code></pre>

        <h3>8.2. GitLab CI</h3>

        <pre><code class="language-yaml"># .gitlab-ci.yml
phpmd:
  stage: test
  image: php:8.1-cli
  
  before_script:
    - curl -sS https://getcomposer.org/installer | php
    - php composer.phar install
  
  script:
    - vendor/bin/phpmd modules/mymodule text phpmd.xml
  
  artifacts:
    paths:
      - phpmd-report.html
    when: always
</code></pre>

        <h2 class="section-title">9. Ignorar Reglas</h2>

        <pre><code class="language-php"><?php
class ProductService
{
    /**
     * @SuppressWarnings(PHPMD.ExcessiveMethodLength)
     */
    public function complexLegacyMethod()
    {
        // Método legacy que temporalmente exceede límites
    }
    
    /**
     * @SuppressWarnings(PHPMD.CyclomaticComplexity)
     * @SuppressWarnings(PHPMD.NPathComplexity)
     */
    public function businessLogic()
    {
        // Lógica compleja de negocio
    }
}
</code></pre>

        <h2 class="section-title">10. Reporte HTML Ejemplo</h2>

        <pre><code class="language-bash"># Generar reporte completo
vendor/bin/phpmd modules/mymodule html phpmd.xml \\
  --reportfile reports/phpmd.html \\
  --exclude vendor,tests

# Ver en navegador
open reports/phpmd.html  # macOS
xdg-open reports/phpmd.html  # Linux
start reports/phpmd.html  # Windows
</code></pre>

        <h2 class="section-title">11. Integración con SonarQube</h2>

        <pre><code class="language-bash"># Generar reporte XML para SonarQube
vendor/bin/phpmd modules/mymodule xml phpmd.xml > reports/phpmd.xml
</code></pre>

        <pre><code class="language-properties"># sonar-project.properties
sonar.projectKey=prestashop-module
sonar.sources=modules/mymodule
sonar.php.phpmd.reportPath=reports/phpmd.xml
</code></pre>

        <h2 class="section-title">12. Scripts Composer</h2>

        <pre><code class="language-json">{
    "scripts": {
        "phpmd": "phpmd modules/mymodule text phpmd.xml",
        "phpmd:html": "phpmd modules/mymodule html phpmd.xml --reportfile reports/phpmd.html",
        "phpmd:ci": "phpmd modules/mymodule github phpmd.xml",
        "mess-detector": "@phpmd",
        "quality": [
            "@phpstan",
            "@phpcs",
            "@phpmd"
        ]
    }
}
</code></pre>

        <h2 class="section-title">13. Métricas de Calidad</h2>

        <table>
            <thead>
                <tr>
                    <th>Métrica</th>
                    <th>Bueno</th>
                    <th>Aceptable</th>
                    <th>Malo</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Complejidad Ciclomática</strong></td>
                    <td>< 5</td>
                    <td>5-10</td>
                    <td>> 10</td>
                </tr>
                <tr>
                    <td><strong>NPath Complexity</strong></td>
                    <td>< 100</td>
                    <td>100-200</td>
                    <td>> 200</td>
                </tr>
                <tr>
                    <td><strong>Líneas por Método</strong></td>
                    <td>< 50</td>
                    <td>50-100</td>
                    <td>> 100</td>
                </tr>
                <tr>
                    <td><strong>Líneas por Clase</strong></td>
                    <td>< 500</td>
                    <td>500-1000</td>
                    <td>> 1000</td>
                </tr>
                <tr>
                    <td><strong>Parámetros</strong></td>
                    <td>< 3</td>
                    <td>3-5</td>
                    <td>> 5</td>
                </tr>
                <tr>
                    <td><strong>Acoplamiento</strong></td>
                    <td>< 10</td>
                    <td>10-13</td>
                    <td>> 13</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">14. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ PHPMD:</strong>
            <ul class="mb-0">
                <li>Ejecutar regularmente (CI/CD)</li>
                <li>Empezar con umbrales laxos</li>
                <li>Ajustar umbrales gradualmente</li>
                <li>Priorizar refactoring de code smells críticos</li>
                <li>Documentar excepciones (@SuppressWarnings)</li>
                <li>Combinar con PHPStan y PHPCS</li>
                <li>Generar reportes HTML visuales</li>
                <li>Revisar métricas en code reviews</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Code Smells Comunes PrestaShop:</strong>
            <ul class="mb-0">
                <li>Métodos de controladores muy largos</li>
                <li>Clases Module con muchas responsabilidades</li>
                <li>Complejidad en validaciones de formularios</li>
                <li>Muchos parámetros en métodos de productos</li>
                <li>Código duplicado en hooks</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>🎯 Objetivos de Calidad:</strong>
            <ul class="mb-0">
                <li>0 code smells críticos</li>
                <li>< 10 warnings por 1000 líneas</li>
                <li>Complejidad promedio < 5</li>
                <li>Todos los métodos < 50 líneas</li>
            </ul>
        </div>
    </div>
`;

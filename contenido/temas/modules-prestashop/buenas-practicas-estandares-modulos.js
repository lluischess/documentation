const buenasPracticasEstandaresModulos = `
    <div class="content-section">
        <h1 id="buenas-practicas-estandares-modulos">Buenas Prácticas y Estándares de Codificación para Módulos</h1>
        <p>Seguir estándares de codificación y buenas prácticas no solo mejora la calidad del código, sino que facilita el mantenimiento, la colaboración, y aumenta las posibilidades de que tu módulo sea aceptado en el Marketplace de PrestaShop. Esta guía cubre desde normas básicas hasta prácticas avanzadas de optimización y seguridad.</p>

        <h2 class="section-title">1. Estándares de Código PSR</h2>
        <p>PrestaShop sigue los estándares <strong>PSR-1</strong>, <strong>PSR-2</strong>, <strong>PSR-4</strong> y <strong>PSR-12</strong> de PHP-FIG. Estos definen la estructura de archivos, namespaces, formato de código, y autoloading.</p>

        <h3>1.1. PSR-1: Estándar Básico de Codificación</h3>
        <ul>
            <li>Los archivos PHP DEBEN usar solo <code>&lt;?php</code> y <code>&lt;?=</code> como tags de apertura</li>
            <li>Los archivos PHP DEBEN usar UTF-8 sin BOM</li>
            <li>Los nombres de clases DEBEN declararse en <code>StudlyCaps</code> (PascalCase)</li>
            <li>Las constantes de clase DEBEN declararse en <code>MAYUSCULAS_CON_GUIONES</code></li>
            <li>Los nombres de métodos DEBEN declararse en <code>camelCase</code></li>
        </ul>

        <pre><code class="language-php">declare(strict_types=1);

namespace MiModulo\Service;

class PaymentProcessor
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_COMPLETED = 'completed';

    public function processPayment(int $orderId): bool
    {
        // ...
    }
}</code></pre>

        <h3>1.2. PSR-12: Estilo de Codificación Extendido</h3>

        <pre><code class="language-php">declare(strict_types=1);

namespace MiModulo\Controller;

use PrestaShop\PrestaShop\Core\Grid\GridFactory;
use Symfony\Component\HttpFoundation\Response;

class AdminProductController extends FrameworkBundleAdminController
{
    // Propiedades
    private GridFactory $gridFactory;
    private LoggerInterface $logger;

    // Constructor con promoted properties (PHP 8.1)
    public function __construct(
        GridFactory $gridFactory,
        LoggerInterface $logger
    ) {
        $this->gridFactory = $gridFactory;
        $this->logger = $logger;
    }

    // Métodos
    public function listAction(): Response
    {
        $grid = $this->gridFactory->create();

        return $this->render('@Modules/mimodulo/admin/list.html.twig', [
            'grid' => $grid,
        ]);
    }
}

// Indentación: 4 espacios
// Llaves de apertura en nueva línea para clases y funciones
// Sin espacios en blanco al final de líneas
// Una línea en blanco al final del archivo</code></pre>

        <h3>1.3. PSR-4: Autoloading</h3>
        <p>Organiza tus clases siguiendo PSR-4 para que Composer las cargue automáticamente.</p>

        <pre><code class="language-json">// composer.json
{
  "name": "tuusuario/mimodulo",
  "autoload": {
    "psr-4": {
      "MiModulo\\\\": "src/"
    }
  }
}</code></pre>

        <pre><code class="language-plaintext">Estructura:
mimodulo/
├── src/
│   ├── Entity/
│   │   └── MiEntidad.php          -> MiModulo\Entity\MiEntidad
│   ├── Service/
│   │   └── PaymentService.php     -> MiModulo\Service\PaymentService
│   └── Controller/
│       └── AdminController.php    -> MiModulo\Controller\AdminController</code></pre>

        <h2 class="section-title">2. Seguridad</h2>

        <h3>2.1. Protección contra SQL Injection</h3>

        <p><strong>❌ NUNCA hagas esto:</strong></p>
        <pre><code class="language-php">// PELIGROSO: Vulnerable a SQL injection
$id = $_GET['id'];
$sql = "SELECT * FROM ps_product WHERE id_product = $id";
Db::getInstance()->executeS($sql);</code></pre>

        <p><strong>✅ Hazlo así:</strong></p>
        <pre><code class="language-php">// SEGURO: Usa cast a int
$id = (int)Tools::getValue('id');
$sql = 'SELECT * FROM ' . _DB_PREFIX_ . 'product WHERE id_product = ' . $id;
Db::getInstance()->executeS($sql);

// SEGURO: Usa pSQL() para strings
$nombre = pSQL(Tools::getValue('nombre'));
$sql = "SELECT * FROM \`\${_DB_PREFIX_}\`product WHERE name LIKE '%$nombre%'";

// MEJOR: Usa prepared statements (en consultas muy complejas)
$stmt = Db::getInstance()->prepare('SELECT * FROM ps_product WHERE name = ?');
$stmt->execute([$nombre]);</code></pre>

<h3>2.2. Protección XSS (Cross-Site Scripting)</h3>

        <pre><code class="language-php">// Escapar salida en PHP
$userInput = Tools::getValue('comentario');
echo Tools::safeOutput($userInput); // Convierte &lt;script&gt; a &amp;lt;script&amp;gt;

// En Smarty
{$variable|escape:'html':'UTF-8'}
{$variable|escape:'htmlall':'UTF-8'}  // Escapa todo, incluso comillas

// Para JavaScript
{$variable|escape:'javascript':'UTF-8'}
</code></pre>

        <h3>2.3. CSRF Protection</h3>

        <pre><code class="language-php">// En el controlador Front Office
if (Tools::isSubmit('submitForm')) {
    // Validar token CSRF
    if (!$this->context->customer->isLogged() || 
        !Validate::isLoadedObject($this->context->customer) ||
        !Tools::getToken(false)) {
        die('Invalid token');
    }

    // Procesar formulario...
}

// En la vista (Smarty)
&lt;form method="post"&gt;
    &lt;input type="hidden" name="token" value="{$token}"&gt;
&lt;/form&gt;

// Generar el token en el controlador
$this->context->smarty->assign('token', Tools::getToken(false));</code></pre>

        <h3>2.4. Validación de Datos</h3>

        <pre><code class="language-php">// Usa la clase Validate de PrestaShop
$email = Tools::getValue('email');
if (!Validate::isEmail($email)) {
    $this->errors[] = $this->l('Email inválido');
}

$url = Tools::getValue('website');
if (!Validate::isUrl($url)) {
    $this->errors[] = $this->l('URL inválida');
}

// Validaciones comunes
Validate::isInt($value);
Validate::isUnsignedInt($value);
Validate::isFloat($value);
Validate::isBool($value);
Validate::isDate($value);
Validate::isPhoneNumber($value);
Validate::isPostCode($value);
Validate::isCleanHtml($value);</code></pre>

        <h2 class="section-title">3. Performance y Optimización</h2>

        <h3>3.1. Evitar Queries N+1</h3>

        <p><strong>❌ Problema (N+1 queries):</strong></p>
        <pre><code class="language-php">$products = Product::getProducts(1, 0, 100);

foreach ($products as $product) {
    // Esto ejecuta 1 query por producto = 100 queries
    $category = new Category($product['id_category_default']);
    echo $category->name;
}</code></pre>

        <p><strong>✅ Solución (1 query con JOIN):</strong></p>
        <pre><code class="language-php">$sql = new DbQuery();
$sql->select('p.*, cl.name as category_name');
$sql->from('product', 'p');
$sql->leftJoin('category_lang', 'cl', 'p.id_category_default = cl.id_category AND cl.id_lang = 1');
$sql->limit(100);

$products = Db::getInstance()->executeS($sql); // 1 sola query

foreach ($products as $product) {
    echo $product['category_name'];
}</code></pre>

        <h3>3.2. Cache Inteligente</h3>

        <pre><code class="language-php">class MiModulo extends Module
{
    public function getConfiguracion(): array
    {
        $cacheKey = 'mimodulo_config_' . (int)Context::getContext()->shop->id;

        // Intentar obtener del cache
        if (Cache::isStored($cacheKey)) {
            return Cache::retrieve($cacheKey);
        }

        // Si no está en cache, calcular
        $config = [
            'api_key' => Configuration::get('MIMODULO_API_KEY'),
            'enabled' => (bool)Configuration::get('MIMODULO_ENABLED'),
            // ... otras configuraciones pesadas
        ];

        // Guardar en cache por 1 hora
        Cache::store($cacheKey, $config);

        return $config;
    }

    // Limpiar cache al guardar configuración
    public function processConfiguration(): void
    {
        Configuration::updateValue('MIMODULO_API_KEY', Tools::getValue('api_key'));

        // Invalidar cache
        $cacheKey = 'mimodulo_config_' . (int)Context::getContext()->shop->id;
        Cache::clean($cacheKey);
    }
}</code></pre>

        <h3>3.3. Lazy Loading de Recursos</h3>

        <pre><code class="language-php">// No cargues recursos pesados en __construct
class MiModulo extends Module
{
    private ?array $products = null;

    public function getProducts(): array
    {
        // Solo cargar cuando se necesite
        if ($this->products === null) {
            $this->products = Product::getProducts(1, 0, 100);
        }

        return $this->products;
    }
}</code></pre>

        <h2 class="section-title">4. Estructura de Módulo Recomendada</h2>

        <pre><code class="language-plaintext">mimodulo/
├── composer.json               # Dependencias y autoload PSR-4
├── mimodulo.php                # Archivo principal del módulo
├── config.xml                  # Configuración del módulo
├── logo.png                    # Logo 57x57px
├── index.php                   # Archivo vacío de seguridad
│
├── config/                     # Configuración
│   ├── routes.yml
│   └── services.yml
│
├── src/                        # Código PHP con PSR-4
│   ├── Entity/
│   ├── Service/
│   ├── Controller/
│   ├── Form/
│   └── Repository/
│
├── controllers/                # Controladores legacy
│   ├── front/
│   └── admin/
│
├── views/
│   ├── templates/
│   │   ├── front/
│   │   ├── admin/
│   │   └── hook/
│   ├── css/
│   ├── js/
│   └── img/
│
├── translations/               # Archivos de traducción
│   ├── es.php
│   ├── en.php
│   └── fr.php
│
├── mails/                      # Plantillas de email
│   ├── es/
│   ├── en/
│   └── fr/
│
├── sql/                        # Scripts SQL
│   └── install.php
│
├── upgrade/                    # Scripts de actualización
│   ├── upgrade-1.1.0.php
│   └── upgrade-2.0.0.php
│
├── docs/                       # Documentación
│   ├── README.md
│   └── CHANGELOG.md
│
└── tests/                      # Tests automatizados
    ├── Unit/
    └── Integration/</code></pre>

        <h2 class="section-title">5. Documentación y Comentarios</h2>

        <h3>5.1. PHPDoc</h3>

        <pre><code class="language-php">/**
 * Procesa el pago de un pedido.
 *
 * @param int $orderId ID del pedido a procesar
 * @param string $paymentMethod Método de pago utilizado
 * @param array $transactionData Datos de la transacción
 *
 * @return bool True si el pago fue procesado correctamente
 *
 * @throws PaymentException Si el pago falla
 * @throws InvalidArgumentException Si los parámetros son inválidos
 *
 * @since 1.0.0
 * @author Tu Nombre <tu@email.com>
 */
public function processPayment(
    int $orderId,
    string $paymentMethod,
    array $transactionData
): bool {
    // ...
}</code></pre>

        <h3>5.2. README.md</h3>

        <pre><code class="language-markdown"># Mi Módulo para PrestaShop

## Descripción
Breve descripción de qué hace el módulo.

## Características
- Feature 1
- Feature 2

## Requisitos
- PrestaShop 8.0+
- PHP 8.1+
- Extension PHP requerida

## Instalación
1. Descargar el módulo
2. Subir a /modules/mimodulo
3. Instalar desde el Back Office

## Configuración
Explicar cómo configurar el módulo...

## Licencia
MIT License </code></pre>

        <h2 class="section-title">6. Testing</h2>

        <h3>6.1. PHPUnit para Tests Unitarios</h3>

        <pre><code class="language-php">// tests/Unit/Service/PaymentServiceTest.php
declare(strict_types=1);

namespace MiModulo\Tests\Unit\Service;

use PHPUnit\Framework\TestCase;
use MiModulo\Service\PaymentService;

class PaymentServiceTest extends TestCase
{
    private PaymentService $service;

    protected function setUp(): void
    {
        $this->service = new PaymentService();
    }

    public function testCalculateTotal(): void
    {
        $result = $this->service->calculateTotal(100, 0.21);
        $this->assertEquals(121.0, $result);
    }

    public function testInvalidAmount(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->service->calculateTotal(-10, 0.21);
    }
}</code></pre>

        <h3>6.2. Configuración PHPUnit</h3>

        <pre><code class="language-xml">&lt;!-- phpunit.xml --&gt;
&lt;?xml version="1.0" encoding="UTF-8"?&gt;
&lt;phpunit bootstrap="vendor/autoload.php"
         colors="true"
         verbose="true"&gt;
    &lt;testsuites&gt;
        &lt;testsuite name="Unit"&gt;
            &lt;directory&gt;tests/Unit&lt;/directory&gt;
        &lt;/testsuite&gt;
    &lt;/testsuites&gt;
&lt;/phpunit&gt;</code></pre>

        <h2 class="section-title">7. Control de Versiones (Git)</h2>

        <h3>7.1. .gitignore Recomendado</h3>

        <pre><code class="language-plaintext"># Dependencies
/vendor/
/node_modules/

# Build artifacts
/views/dist/
*.min.js
*.min.css

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Logs
*.log

# Environment
.env
config.local.yml</code></pre>

        <h3>7.2. Conventional Commits</h3>

        <pre><code class="language-bash"># Formato: <tipo>(<scope>): <descripción>

git commit -m "feat(payment): add PayPal integration"
git commit -m "fix(checkout): resolve CSRF validation error"
git commit -m "docs(readme): update installation steps"
git commit -m "refactor(service): improve performance of query builder"
git commit -m "test(payment): add unit tests for PaymentService"

# Tipos comunes:
# feat: Nueva funcionalidad
# fix: Corrección de bug
# docs: Cambios en documentación
# refactor: Refactorización sin cambio funcional
# test: Añadir o modificar tests
# chore: Tareas de mantenimiento</code></pre>

        <h2 class="section-title">8. Checklist de Pre-lanzamiento</h2>

        <h3>8.1. Checklist Técnico</h3>
        <ul>
            <li>✓ Código sigue PSR-1, PSR-2, PSR-4, PSR-12</li>
            <li>✓ No hay warnings ni notices de PHP</li>
            <li>✓ Todas las cadenas son traducibles con <code>$this->l()</code></li>
            <li>✓ Funciona en PHP 8.1, 8.2</li>
            <li>✓ Compatible con PrestaShop 8.0+</li>
            <li>✓ No modifica archivos del core</li>
            <li>✓ Usa namespaces para clases personalizadas</li>
            <li>✓ Métodos install() y uninstall() funcionan correctamente</li>
            <li>✓ Scripts de upgrade están presentes si hay versiones anteriores</li>
            <li>✓ No hay consultas SQL sin sanitizar</li>
            <li>✓ CSRF protection en todos los formularios</li>
            <li>✓ Validación de todos los inputs del usuario</li>
        </ul>

        <h3>8.2. Checklist de Calidad</h3>
        <ul>
            <li>✓ README.md completo y actualizado</li>
            <li>✓ CHANGELOG.md con historial de versiones</li>
            <li>✓ Licencia definida (MIT, GPL, propietaria, etc.)</li>
            <li>✓ Logo del módulo (57x57px)</li>
            <li>✓ Screenshots para el Marketplace</li>
            <li>✓ Tests automatizados (al menos los críticos)</li>
            <li>✓ Documentación técnica para desarrolladores</li>
            <li>✓ Manual de usuario</li>
        </ul>

        <h3>8.3. Checklist de Performance</h3>
        <ul>
            <li>✓ No hay N+1 queries</li>
            <li>✓ Cache implementado donde tiene sentido</li>
            <li>✓ Assets minificados y comprimidos</li>
            <li>✓ JavaScript cargado con defer/async</li>
            <li>✓ Imágenes optimizadas</li>
            <li>✓ No hay memory leaks en bucles largos</li>
        </ul>

        <h2 class="section-title">9. Herramientas de Calidad de Código</h2>

        <h3>9.1. PHP CS Fixer</h3>

        <pre><code class="language-bash"># Instalar
composer require --dev friendsofphp/php-cs-fixer

# Ejecutar
vendor/bin/php-cs-fixer fix src/ --rules=@PSR12</code></pre>

        <h3>9.2. PHPStan (Análisis Estático)</h3>

        <pre><code class="language-bash"># Instalar
composer require --dev phpstan/phpstan

# Ejecutar
vendor/bin/phpstan analyse src/ --level=8</code></pre>

        <h3>9.3. PHPMD (PHP Mess Detector)</h3>

        <pre><code class="language-bash"># Instalar
composer require --dev phpmd/phpmd

# Ejecutar
vendor/bin/phpmd src/ text cleancode,codesize,controversial,design,naming,unusedcode</code></pre>

        <h2 class="section-title">10. Recursos Adicionales</h2>
        <ul>
            <li><strong>Documentación oficial:</strong> <a href="https://devdocs.prestashop-project.org/" target="_blank">DevDocs PrestaShop</a></li>
            <li><strong>Standards PSR:</strong> <a href="https://www.php-fig.org/psr/" target="_blank">PHP-FIG</a></li>
            <li><strong>Validator de módulos:</strong> <a href="https://validator.prestashop.com/" target="_blank">PrestaShop Validator</a></li>
            <li><strong>Foros:</strong> <a href="https://www.prestashop.com/forums/" target="_blank">PrestaShop Forums</a></li>
            <li><strong>GitHub:</strong> <a href="https://github.com/PrestaShop/PrestaShop" target="_blank">PrestaShop Repository</a></li>
        </ul>
    </div>
`;
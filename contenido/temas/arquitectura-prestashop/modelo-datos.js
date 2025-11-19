const modeloDatosPrestaShop = `
    <h1>Modelo de Datos de PrestaShop y Clases Core (PS 8 y 9)</h1>

    <p>En PrestaShop 8 y 9, el modelo de datos es un sistema híbrido que combina el tradicional <strong>ObjectModel</strong> (Legacy) con la arquitectura moderna basada en <strong>Doctrine</strong> (Symfony). Comprender ambos sistemas es crucial para el desarrollo efectivo.</p>

    <h2>1. ObjectModel (Legacy pero Esencial)</h2>
    <p>La clase <code>ObjectModel</code> sigue siendo la base para la mayoría de las entidades en PrestaShop (Productos, Categorías, Clientes, Carritos). Implementa el patrón <strong>Active Record</strong>.</p>

    <h3>Estructura Básica</h3>
    <div class="code-block"><pre><code>&lt;?php
class MyEntity extends ObjectModel
{
    public $id;
    public $name;
    public $active;
    public $date_add;

    /**
     * @see ObjectModel::\$definition
     */
    public static $definition = [
        'table' => 'my_entity',
        'primary' => 'id_my_entity',
        'multilang' => true,
        'fields' => [
            'name' => ['type' => self::TYPE_STRING, 'validate' => 'isGenericName', 'required' => true, 'size' => 128, 'lang' => true],
            'active' => ['type' => self::TYPE_BOOL, 'validate' => 'isBool'],
            'date_add' => ['type' => self::TYPE_DATE, 'validate' => 'isDate'],
        ],
    ];
}
?&gt;</code></pre></div>

    <div class="info-box">
        <strong>💡 Tipos de Datos Comunes:</strong>
        <ul>
            <li><code>self::TYPE_INT</code>: Enteros</li>
            <li><code>self::TYPE_FLOAT</code>: Decimales (Precios)</li>
            <li><code>self::TYPE_STRING</code>: Cadenas de texto</li>
            <li><code>self::TYPE_BOOL</code>: Booleanos (0/1)</li>
            <li><code>self::TYPE_HTML</code>: Contenido HTML (limpiado automáticamente)</li>
            <li><code>self::TYPE_DATE</code>: Fechas</li>
        </ul>
    </div>

    <h3>Operaciones CRUD con ObjectModel</h3>
    <div class="code-block"><pre><code>&lt;?php
// Crear
$product = new Product();
$product->name[1] = 'Nuevo Producto'; // [1 => Español]
$product->price = 19.99;
$product->add();

// Leer
$product = new Product(15); // Cargar ID 15
echo $product->price;

// Actualizar
$product->price = 25.99;
$product->update();

// Eliminar
$product->delete();
?&gt;</code></pre></div>

    <h2>2. La Clase Db (Abstracción de Base de Datos)</h2>
    <p>Para consultas complejas que <code>ObjectModel</code> no puede manejar, utilizamos la clase <code>Db</code>. Es un Singleton que gestiona la conexión PDO.</p>

    <div class="code-block"><pre><code>&lt;?php
// Obtener instancia
$db = Db::getInstance();

// Ejecutar consulta (INSERT, UPDATE, DELETE)
$result = $db->execute('UPDATE ' . _DB_PREFIX_ . 'product SET active = 1 WHERE id_product = 10');

// Obtener un solo valor
$count = $db->getValue('SELECT COUNT(*) FROM ' . _DB_PREFIX_ . 'orders');

// Obtener una fila
$row = $db->getRow('SELECT * FROM ' . _DB_PREFIX_ . 'customer WHERE id_customer = 1');

// Obtener múltiples filas
$results = $db->executeS('SELECT id_product, price FROM ' . _DB_PREFIX_ . 'product WHERE active = 1 LIMIT 10');

// Escapar datos (¡CRÍTICO PARA SEGURIDAD!)
$sql = 'SELECT * FROM ' . _DB_PREFIX_ . 'product WHERE reference = "' . pSQL($reference) . '"';
?&gt;</code></pre></div>

    <div class="warning-box">
        <strong>⚠️ Seguridad SQL Injection:</strong>
        Siempre usa <code>pSQL()</code> para strings y <code>(int)</code> o <code>(float)</code> para números al construir consultas manualmente. Nunca insertes variables directamente en el string SQL sin sanitizar.
    </div>

    <h2>3. Contexto Global (Context)</h2>
    <p>El <code>Context</code> es un "Super-Singleton" que almacena el estado actual de la aplicación (Cliente actual, Carrito, Idioma, Tienda, etc.).</p>

    <div class="code-block"><pre><code>&lt;?php
$context = Context::getContext();

// Acceder a propiedades comunes
$customer = $context->customer;   // Cliente logueado
$cart = $context->cart;           // Carrito actual
$language = $context->language;   // Idioma actual
$shop = $context->shop;           // Tienda actual (Multitienda)
$cookie = $context->cookie;       // Cookies (Legacy)
$smarty = $context->smarty;       // Motor de plantillas

// Ejemplo: Verificar si el cliente está logueado
if ($context->customer->isLogged()) {
    // ...
}
?&gt;</code></pre></div>

    <h2>4. Configuration (Configuración Global)</h2>
    <p>La tabla <code>ps_configuration</code> almacena configuraciones clave-valor de la tienda.</p>

    <div class="code-block"><pre><code>&lt;?php
// Guardar valor
Configuration::updateValue('MY_MODULE_SETTING', 'valor_123');

// Obtener valor
$value = Configuration::get('MY_MODULE_SETTING');

// Obtener valor en un idioma específico
$text = Configuration::get('MY_TEXT', $id_lang);

// Eliminar valor
Configuration::deleteByName('MY_MODULE_SETTING');
?&gt;</code></pre></div>

    <h2>5. Transición a Doctrine (PrestaShop 8/9)</h2>
    <p>En las versiones modernas, PrestaShop está migrando gradualmente hacia Doctrine Entities y Repositories, especialmente en el Back Office.</p>

    <h3>Repositorios (Repositories)</h3>
    <p>En lugar de usar <code>new Product($id)</code>, la nueva arquitectura promueve el uso de repositorios inyectados como servicios.</p>

    <div class="code-block"><pre><code>&lt;?php
// En un controlador de Symfony o Servicio
use PrestaShop\PrestaShop\Core\Domain\Product\ValueObject\ProductId;

public function myAction(int $productId)
{
    // Obtener repositorio (inyectado)
    $productRepository = $this->get('prestashop.core.admin.product.repository');
    
    // Buscar producto
    $product = $productRepository->find(new ProductId($productId));
}
?&gt;</code></pre></div>

    <h3>Entidades Doctrine</h3>
    <p>Las nuevas tablas del core (y módulos modernos) se definen como entidades Doctrine en <code>src/Core/Domain</code> o dentro de los módulos.</p>

    <div class="info-box">
        <strong>🔄 Estado Híbrido:</strong>
        Actualmente, muchas entidades tienen una "doble vida": existen como <code>ObjectModel</code> (para compatibilidad y Front Office) y tienen una representación parcial en Doctrine (para Back Office y API).
    </div>

    <h2>6. Otras Clases Core Importantes</h2>

    <ul>
        <li><strong>Dispatcher</strong>: Maneja el enrutamiento en el Front Office (Legacy). Determina qué controlador cargar basado en la URL.</li>
        <li><strong>Controller</strong>: Clase base para <code>FrontController</code> y <code>AdminController</code>. Gestiona el flujo de la página, carga de CSS/JS y renderizado.</li>
        <li><strong>Tools</strong>: Biblioteca de utilidades estáticas (<code>Tools::getValue()</code>, <code>Tools::redirect()</code>, <code>Tools::isSubmit()</code>).</li>
        <li><strong>Media</strong>: Gestión de CSS y JS (<code>Media::addJsDef()</code>).</li>
        <li><strong>Validate</strong>: Clase con métodos estáticos para validar datos (<code>Validate::isEmail()</code>, <code>Validate::isLoadedObject()</code>).</li>
    </ul>

    <div class="success-box">
        <strong>✅ Buenas Prácticas PS 8/9:</strong>
        <ul>
            <li>Usa <strong>Inyección de Dependencias</strong> siempre que sea posible en lugar de <code>Context::getContext()</code>.</li>
            <li>Prefiere <strong>Doctrine</strong> para nuevas tablas en módulos complejos.</li>
            <li>Usa <strong>Prepared Statements</strong> con Doctrine DBAL si necesitas SQL directo seguro.</li>
            <li>Evita modificar el Core (<code>override/</code>) a menos que sea estrictamente necesario; usa <strong>Hooks</strong> o <strong>Decorators</strong>.</li>
        </ul>
    </div>
`;

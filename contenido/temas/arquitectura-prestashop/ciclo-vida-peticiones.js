const cicloVidaPeticiones = `
    <h1>Ciclo de Vida de Peticiones en PrestaShop</h1>
    
    <p>Entender el <strong>ciclo de vida de una petición HTTP</strong> en PrestaShop es fundamental para desarrollar módulos y temas eficientemente. PrestaShop sigue un flujo estructurado desde que llega una petición hasta que se genera la respuesta.</p>

    <h2>Flujo General de una Petición</h2>
    <div class="code-block"><pre><code>1. index.php (Entry Point)
   ↓
2. config/config.inc.php (Configuración global)
   ↓
3. Dispatcher (Enrutamiento)
   ↓
4. Controller (Front/Admin/Module)
   ↓
5. Hooks (Ejecución de módulos)
   ↓
6. Template (Smarty/Twig)
   ↓
7. Response (HTML/JSON)
</code></pre></div>

    <h2>1. Entry Point: index.php</h2>
    <p>Todas las peticiones pasan por <code>index.php</code>, el punto de entrada principal de PrestaShop.</p>

    <div class="code-block"><pre><code>&lt;?php
// index.php (simplificado)

require_once(__DIR__.'/config/config.inc.php');

// Inicializar el contexto
Context::getContext();

// Ejecutar el dispatcher
Dispatcher::getInstance()->dispatch();
?></code></pre></div>

    <h2>2. Configuración Global: config.inc.php</h2>
    <p>Este archivo carga toda la configuración necesaria:</p>

    <div class="info-box">
        <strong>💡 Tareas de config.inc.php:</strong>
        <ul>
            <li>Carga de constantes y configuración de la tienda</li>
            <li>Conexión a la base de datos</li>
            <li>Autoloading de clases</li>
            <li>Inicialización del contexto (Context)</li>
            <li>Carga de módulos activos</li>
            <li>Configuración de idioma, moneda, país</li>
        </ul>
    </div>

    <div class="code-block"><pre><code>&lt;?php
// config/config.inc.php (estructura simplificada)

// Definir constantes
define('_PS_VERSION_', '8.1.0');
define('_PS_ROOT_DIR_', dirname(__FILE__).'/..');

// Cargar autoloader
require_once(_PS_ROOT_DIR_.'/vendor/autoload.php');

// Conectar a la base de datos
Db::getInstance();

// Inicializar el contexto
Context::getContext()->shop = new Shop((int)Configuration::get('PS_SHOP_DEFAULT'));
Context::getContext()->language = new Language((int)Configuration::get('PS_LANG_DEFAULT'));
Context::getContext()->currency = new Currency((int)Configuration::get('PS_CURRENCY_DEFAULT'));
Context::getContext()->customer = new Customer();
Context::getContext()->cart = new Cart();

// Cargar módulos
Module::preloadModules();
?></code></pre></div>

    <h2>3. Dispatcher: Enrutamiento</h2>
    <p>El <strong>Dispatcher</strong> analiza la URL y determina qué controlador debe ejecutarse.</p>

    <div class="code-block"><pre><code>&lt;?php
// classes/Dispatcher.php (simplificado)

class Dispatcher extends DispatcherCore
{
    public function dispatch()
    {
        // Obtener el controlador de la URL
        // Ejemplo: /producto/zapatos-deportivos → ProductController
        $controller_name = $this->getController();
        
        // Front Office Controllers
        if (file_exists(_PS_CONTROLLER_DIR_.$controller_name.'.php')) {
            require_once(_PS_CONTROLLER_DIR_.$controller_name.'.php');
        }
        
        // Module Controllers
        elseif ($module_controller = $this->getModuleController()) {
            require_once($module_controller);
        }
        
        // Admin Controllers
        elseif ($this->isAdminController()) {
            require_once(_PS_ADMIN_CONTROLLER_DIR_.$controller_name.'.php');
        }
        
        // Instanciar y ejecutar el controlador
        $controller = new $controller_name();
        $controller->run();
    }
    
    protected function getController()
    {
        // Obtener de la URL: ?controller=product
        if (isset($_GET['controller'])) {
            return $_GET['controller'];
        }
        
        // Obtener de URL amigable: /producto/zapatos
        return $this->parseUrlRewrite();
    }
}
?></code></pre></div>

    <h2>4. Controladores</h2>
    <p>PrestaShop tiene tres tipos de controladores:</p>

    <div class="code-block"><pre><code>1. Front Office Controllers
   - ProductController (página de producto)
   - CategoryController (página de categoría)
   - CartController (carrito)
   - OrderController (proceso de compra)
   
2. Admin Controllers
   - AdminProductsController (gestión de productos)
   - AdminOrdersController (gestión de pedidos)
   - AdminModulesController (gestión de módulos)
   
3. Module Controllers
   - modules/mymodule/controllers/front/display.php
   - modules/mymodule/controllers/admin/AdminMyModuleController.php
</code></pre></div>

    <h3>Ejemplo: ProductController</h3>
    <div class="code-block"><pre><code>&lt;?php
// controllers/front/ProductController.php

class ProductController extends ProductControllerCore
{
    public function initContent()
    {
        parent::initContent();
        
        // Obtener el producto
        $id_product = (int)Tools::getValue('id_product');
        $product = new Product($id_product, true, $this->context->language->id);
        
        // Validar que existe
        if (!Validate::isLoadedObject($product)) {
            header('HTTP/1.1 404 Not Found');
            $this->errors[] = 'Producto no encontrado';
            $this->setTemplate('errors/404.tpl');
            return;
        }
        
        // Ejecutar hooks
        Hook::exec('actionProductView', ['product' => $product]);
        
        // Asignar variables a Smarty
        $this->context->smarty->assign([
            'product' => $product,
            'images' => $product->getImages($this->context->language->id),
            'features' => $product->getFrontFeatures($this->context->language->id),
            'combinations' => $product->getAttributeCombinations($this->context->language->id),
        ]);
        
        // Renderizar template
        $this->setTemplate('catalog/product.tpl');
    }
}
?></code></pre></div>

    <h2>5. Hooks: Ejecución de Módulos</h2>
    <p>Durante el ciclo de vida, se ejecutan múltiples <strong>hooks</strong> que permiten a los módulos modificar el comportamiento.</p>

    <div class="code-block"><pre><code>&lt;?php
// Hooks principales en una petición de producto

// 1. Inicio del controlador
Hook::exec('actionFrontControllerSetMedia');

// 2. Antes de cargar el producto
Hook::exec('actionProductView', ['product' => $product]);

// 3. Modificar variables del template
Hook::exec('displayProductAdditionalInfo', ['product' => $product]);

// 4. Añadir contenido al template
Hook::exec('displayFooterProduct', ['product' => $product]);

// 5. Antes de enviar la respuesta
Hook::exec('actionOutputHTMLBefore');
?></code></pre></div>

    <div class="success-box">
        <strong>✅ Hooks más importantes por fase:</strong>
        <ul>
            <li><strong>Inicio</strong>: actionFrontControllerSetMedia, actionDispatcher</li>
            <li><strong>Autenticación</strong>: actionAuthentication, actionCustomerLoginAfter</li>
            <li><strong>Producto</strong>: actionProductView, displayProductAdditionalInfo</li>
            <li><strong>Carrito</strong>: actionCartSave, displayShoppingCart</li>
            <li><strong>Checkout</strong>: actionValidateOrder, actionOrderStatusUpdate</li>
            <li><strong>Output</strong>: actionOutputHTMLBefore, displayHeader, displayFooter</li>
        </ul>
    </div>

    <h2>6. Template Engine: Smarty/Twig</h2>
    <p>PrestaShop usa <strong>Smarty</strong> (1.6-1.7) o <strong>Twig</strong> (1.7+) para renderizar las vistas.</p>

    <div class="code-block"><pre><code>&lt;?php
// Proceso de renderizado

// 1. El controlador asigna variables
$this->context->smarty->assign([
    'product' => $product,
    'price' => $product->getPrice(),
]);

// 2. Se ejecutan hooks de display
$header = Hook::exec('displayHeader');
$footer = Hook::exec('displayFooter');

// 3. Se renderiza el template
$template_path = _PS_THEME_DIR_.'templates/catalog/product.tpl';
$html = $this->context->smarty->fetch($template_path);

// 4. Se envía la respuesta
echo $html;
?></code></pre></div>

    <h2>7. Response: Envío de la Respuesta</h2>
    <p>Finalmente, se envía la respuesta HTTP al navegador.</p>

    <div class="code-block"><pre><code>&lt;?php
// El controlador genera la salida final

class Controller extends ControllerCore
{
    public function display()
    {
        // Headers HTTP
        header('Content-Type: text/html; charset=utf-8');
        
        // Ejecutar hook antes de output
        Hook::exec('actionOutputHTMLBefore', ['html' => &$this->html]);
        
        // Enviar HTML
        echo $this->html;
        
        // Ejecutar hook después de output
        Hook::exec('actionOutputHTMLAfter');
    }
}
?></code></pre></div>

    <h2>Diagrama Completo del Ciclo de Vida</h2>
    <div class="code-block"><pre><code>┌─────────────────────────────────────────────────────────────┐
│ 1. ENTRADA: index.php                                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│ 2. CONFIGURACIÓN: config.inc.php                            │
│    - Constantes, DB, Autoloader, Context                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│ 3. DISPATCHER: Analizar URL y determinar controlador        │
│    - URL Rewrite, Routing                                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│ 4. CONTROLLER: Ejecutar lógica de negocio                   │
│    - init(), initContent(), postProcess()                   │
│    - Cargar modelos (Product, Category, etc.)               │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│ 5. HOOKS: Ejecutar módulos registrados                      │
│    - actionProductView, displayFooterProduct, etc.          │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│ 6. TEMPLATE: Renderizar vista (Smarty/Twig)                 │
│    - Asignar variables, fetch template                      │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│ 7. RESPONSE: Enviar HTML al navegador                       │
│    - Headers, Output, Hooks finales                         │
└─────────────────────────────────────────────────────────────┘
</code></pre></div>

    <h2>Ejemplo Práctico: Petición de Producto</h2>
    <div class="code-block"><pre><code>URL: https://mitienda.com/producto/zapatos-deportivos-123

1. index.php recibe la petición
   
2. config.inc.php carga:
   - Tienda: ID 1
   - Idioma: Español (ID 1)
   - Moneda: EUR
   - Cliente: Invitado o autenticado
   
3. Dispatcher analiza la URL:
   - URL Rewrite: "producto/zapatos-deportivos-123" → ProductController
   - Parámetro: id_product = 123
   
4. ProductController se ejecuta:
   - init(): Inicializar contexto
   - initContent(): Cargar producto ID 123
   - Validar que existe
   - Cargar imágenes, características, combinaciones
   
5. Hooks ejecutados:
   - actionFrontControllerSetMedia (añadir CSS/JS)
   - actionProductView (analytics, vistas)
   - displayProductAdditionalInfo (módulos de info extra)
   - displayFooterProduct (reviews, productos relacionados)
   
6. Template renderizado:
   - themes/classic/templates/catalog/product.tpl
   - Variables: $product, $images, $features
   
7. Response enviada:
   - HTML completo con header, footer, producto
   - Status: 200 OK
</code></pre></div>

    <h2>Optimizaciones del Ciclo de Vida</h2>
    <div class="success-box">
        <strong>✅ Mejores prácticas:</strong>
        <ul>
            <li><strong>Caché</strong>: Usar Smarty cache, APCu, Redis para reducir queries</li>
            <li><strong>Lazy Loading</strong>: Cargar solo datos necesarios en cada fase</li>
            <li><strong>Hooks eficientes</strong>: Evitar lógica pesada en hooks frecuentes</li>
            <li><strong>Query optimization</strong>: Usar índices, evitar N+1 queries</li>
            <li><strong>CDN</strong>: Servir assets estáticos desde CDN</li>
            <li><strong>HTTP/2</strong>: Aprovechar multiplexing para assets</li>
        </ul>
    </div>

    <div class="warning-box">
        <strong>⚠️ Errores comunes:</strong>
        <ul>
            <li>Ejecutar queries pesadas en hooks que se llaman muchas veces</li>
            <li>No validar datos de entrada en controladores personalizados</li>
            <li>Cargar módulos innecesarios que ralentizan el bootstrap</li>
            <li>No usar caché de Smarty en producción</li>
            <li>Modificar archivos core en lugar de usar overrides</li>
        </ul>
    </div>

    <h2>Debugging del Ciclo de Vida</h2>
    <div class="code-block"><pre><code>&lt;?php
// Activar modo debug en config/defines.inc.php

define('_PS_MODE_DEV_', true);

// Ver todos los hooks ejecutados
// En el footer verás:
// - Tiempo de ejecución
// - Queries ejecutadas
// - Memoria usada
// - Hooks llamados

// Profiling con Symfony Profiler (PrestaShop 1.7+)
// Acceder a: /_profiler
?></code></pre></div>

    <div class="info-box">
        <strong>💡 Herramientas de debugging:</strong>
        <ul>
            <li><strong>Debug Mode</strong>: _PS_MODE_DEV_ = true</li>
            <li><strong>Symfony Profiler</strong>: Ver queries, hooks, tiempos</li>
            <li><strong>PrestaShop Console</strong>: Comandos CLI para testing</li>
            <li><strong>Xdebug</strong>: Step debugging del ciclo completo</li>
            <li><strong>Query Monitor</strong>: Analizar queries SQL</li>
        </ul>
    </div>
`;

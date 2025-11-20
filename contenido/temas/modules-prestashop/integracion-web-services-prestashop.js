// @ts-nocheck
const integracionWebServicesPrestaShop = `
    <div class="content-section">
        <h1 id="integracion-web-services-prestashop">Integración con Web Services de PrestaShop</h1>
        <p>PrestaShop incluye una potente API REST (Web Services) que permite interactuar con la tienda desde aplicaciones externas. Esta API es fundamental para integraciones con ERPs, marketplaces, aplicaciones móviles, y sincronización de datos entre sistemas.</p>

        <h2 class="section-title">1. Configuración de Web Services</h2>
        <p>Antes de usar la API, debes activarla y crear claves de acceso en el Back Office.</p>

        <h3>1.1. Activación de Web Services</h3>
        <p><strong>Ruta:</strong> <em>Parámetros avanzados &gt; Webservice &gt; Habilitar el servicio web de PrestaShop</em></p>
        
        <ul>
            <li>Marca la casilla "Activar el servicio web de PrestaShop"</li>
            <li>Marca "Activar el modo CGI para PHP" si tu servidor lo requiere</li>
            <li>Guarda los cambios</li>
        </ul>

        <h3>1.2. Creación de una Clave de API</h3>
        <p><strong>Ruta:</strong> <em>Parámetros avanzados &gt; Webservice &gt; Añadir nueva clave</em></p>

        <ul>
            <li><strong>Descripción:</strong> Nombre identificativo (ej: "ERP Integración")</li>
            <li><strong>Clave:</strong> Se genera automáticamente (32 caracteres), puedes personalizarla</li>
            <li><strong>Estado:</strong> Activada</li>
            <li><strong>Permisos:</strong> Marca los recursos y acciones (GET, POST, PUT, DELETE) que esta clave puede usar</li>
        </ul>

        <p><strong>Ejemplo de clave generada:</strong> <code>YOUR_API_KEY_HERE_32_CHARACTERS</code></p>

        <h2 class="section-title">2. Consumo de la API desde PHP</h2>
        <p>PrestaShop proporciona la clase <code>PrestaShopWebservice</code> para facilitar las llamadas a la API.</p>

        <h3>2.1. Instalación de la Librería</h3>

        <pre><code class="language-bash"># Descarga PSWebServiceLibrary.php
curl -O https://github.com/PrestaShop/PrestaShop-webservice-lib/raw/master/PSWebServiceLibrary.php</code></pre>

        <h3>2.2. Inicialización y Autenticación</h3>

        <pre><code class="language-php">declare(strict_types=1);

require_once 'PSWebServiceLibrary.php';

// Configuración
$webService = new PrestaShopWebservice(
    'https://tu-tienda.com',  // URL de la tienda
    'YOUR_API_KEY_HERE',       // Clave de API
    false                      // Debug mode (true para ver requests/responses)
);

// Con debug activado
$webService = new PrestaShopWebservice(
    'https://tu-tienda.com',
    'YOUR_API_KEY_HERE',
    true  // Imprime las peticiones XML en la salida
);</code></pre>

        <h3>2.3. Operaciones CRUD</h3>

        <h4>GET - Obtener Recursos</h4>

        <pre><code class="language-php">// Obtener listado de productos (solo IDs)
try {
    $xml = $webService->get(['resource' => 'products']);
    
    foreach ($xml->products->product as $product) {
        echo "ID Producto: " . $product['id'] . "\n";
    }
} catch (PrestaShopWebserviceException $e) {
    echo "Error: " . $e->getMessage();
}

// Obtener un producto específico por ID
$xml = $webService->get([
    'resource' => 'products',
    'id' => 1,
]);

echo "Nombre: " . $xml->product->name->language[0] . "\n";
echo "Precio: " . $xml->product->price . "\n";

// Obtener con filtros
$xml = $webService->get([
    'resource' => 'products',
    'filter[active]' => 1,              // Solo productos activos
    'filter[id_category_default]' => 5, // Categoría específica
    'limit' => '0,10',                  // Primeros 10 resultados
    'sort' => '[id_DESC]',              // Ordenar por ID descendente
    'display' => '[id,name,price]',     // Solo mostrar estos campos
]);

// Filtro por rango
$xml = $webService->get([
    'resource' => 'products',
    'filter[id]' => '[1,100]',  // IDs del 1 al 100
]);

// Búsqueda parcial (LIKE)
$xml = $webService->get([
    'resource' => 'products',
    'filter[name]' => '[Camiseta]%',  // Nombres que empiecen con "Camiseta"
]);</code></pre>

        <h4>POST - Crear Recursos</h4>

        <pre><code class="language-php">// Obtener el esquema (estructura vacía) de un producto
$xml = $webService->get(['url' => 'https://tu-tienda.com/api/products?schema=blank']);

// Rellenar datos
$xml->product->price = 29.99;
$xml->product->active = 1;
$xml->product->id_category_default = 2;

// Nombres multiidioma (id_lang = 1 para español, por ejemplo)
$xml->product->name->language[0] = 'Producto Nuevo';
$xml->product->name->language[0]['id'] = 1;

$xml->product->description->language[0] = '<p>Descripción del producto</p>';
$xml->product->description->language[0]['id'] = 1;

// Crear el producto
try {
    $opt = [
        'resource' => 'products',
        'postXml' => $xml->asXML(),
    ];
    $result = $webService->add($opt);
    
    $newId = $result->product->id;
    echo "Producto creado con ID: $newId\n";
} catch (PrestaShopWebserviceException $e) {
    echo "Error al crear: " . $e->getMessage();
}</code></pre>

        <h4>PUT - Actualizar Recursos</h4>

        <pre><code class="language-php">// Obtener el producto existente
$xml = $webService->get([
    'resource' => 'products',
    'id' => 1,
]);

// Modificar el precio
$xml->product->price = 39.99;
$xml->product->active = 0;

// Actualizar
$opt = [
    'resource' => 'products',
    'id' => 1,
    'putXml' => $xml->asXML(),
];

$result = $webService->edit($opt);
echo "Producto actualizado correctamente\n";</code></pre>

        <h4>DELETE - Eliminar Recursos</h4>

        <pre><code class="language-php">// Eliminar un producto
$webService->delete([
    'resource' => 'products',
    'id' => 1,
]);

// Eliminar múltiples productos
$webService->delete([
    'resource' => 'products',
    'id' => '[1,2,3,4]',  // Lista de IDs separados por comas
]);</code></pre>

        <h2 class="section-title">3. Recursos Disponibles</h2>
        <p>Para ver todos los recursos disponibles en tu tienda:</p>

        <pre><code class="language-php">$xml = $webService->get(['url' => 'https://tu-tienda.com/api']);

foreach ($xml->api->children() as $resource) {
    echo $resource->getName() . "\n";
}</code></pre>

        <h3>3.1. Recursos Más Utilizados</h3>

        <div class="table-responsive">
            <table class="table">
                <thead>
                    <tr>
                        <th>Recurso</th>
                        <th>Descripción</th>
                        <th>Uso Común</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><code>products</code></td>
                        <td>Productos del catálogo</td>
                        <td>Sincronización de inventario con ERP</td>
                    </tr>
                    <tr>
                        <td><code>categories</code></td>
                        <td>Categorías de productos</td>
                        <td>Gestión de estructura del catálogo</td>
                    </tr>
                    <tr>
                        <td><code>customers</code></td>
                        <td>Clientes de la tienda</td>
                        <td>Integración con CRM</td>
                    </tr>
                    <tr>
                        <td><code>orders</code></td>
                        <td>Pedidos</td>
                        <td>Sincronizar ventas con sistemas externos</td>
                    </tr>
                    <tr>
                        <td><code>order_states</code></td>
                        <td>Estados de pedido</td>
                        <td>Actualizar estado de envíos</td>
                    </tr>
                    <tr>
                        <td><code>stock_availables</code></td>
                        <td>Stock disponible por producto</td>
                        <td>Gestión de inventario en tiempo real</td>
                    </tr>
                    <tr>
                        <td><code>images</code></td>
                        <td>Imágenes de productos</td>
                        <td>Subir/actualizar imágenes de productos</td>
                    </tr>
                    <tr>
                        <td><code>combinations</code></td>
                        <td>Variantes de productos</td>
                        <td>Gestión de tallas/colores</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <h2 class="section-title">4. Casos de Uso Avanzados</h2>

        <h3>4.1. Subir Imágenes de Productos</h3>

        <pre><code class="language-php">$idProduct = 1;
$imagePath = '/path/to/image.jpg';

// Preparar imagen en Base64
$imageContent = file_get_contents($imagePath);
$base64Image = base64_encode($imageContent);

// Crear XML para la imagen
$xml = '<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
    <image>
        <id_product>' . $idProduct . '</id_product>
        <content><![CDATA[' . $base64Image . ']]></content>
    </image>
</prestashop>';

// Subir imagen
$opt = [
    'resource' => 'images/products/' . $idProduct,
    'postXml' => $xml,
];

$result = $webService->add($opt);
echo "Imagen subida con ID: " . $result->image->id;</code></pre>

        <h3>4.2. Actualizar Stock de Productos</h3>

        <pre><code class="language-php">function actualizarStock(int $idProduct, int $cantidad): void
{
    global $webService;

    // Buscar el stock_available asociado
    $xml = $webService->get([
        'resource' => 'stock_availables',
        'filter[id_product]' => $idProduct,
        'filter[id_product_attribute]' => 0, // 0 = producto simple, sin combinaciones
    ]);

    $idStockAvailable = $xml->stock_availables->stock_available[0]['id'];

    // Obtener el registro completo
    $stock = $webService->get([
        'resource' => 'stock_availables',
        'id' => $idStockAvailable,
    ]);

    // Actualizar cantidad
    $stock->stock_available->quantity = $cantidad;

    // Guardar
    $webService->edit([
        'resource' => 'stock_availables',
        'id' => $idStockAvailable,
        'putXml' => $stock->asXML(),
    ]);

    echo "Stock actualizado a $cantidad unidades\n";
}

// Uso
actualizarStock(1, 50);</code></pre>

        <h3>4.3. Crear un Pedido Completo</h3>

        <pre><code class="language-php">// 1. Obtener esquema de pedido
$xml = $webService->get(['url' => 'https://tu-tienda.com/api/orders?schema=blank']);

// 2. Rellenar datos básicos
$xml->order->id_customer = 1;
$xml->order->id_carrier = 2;
$xml->order->id_lang = 1;
$xml->order->id_currency = 1;
$xml->order->payment = 'Transferencia bancaria';
$xml->order->module = 'ps_wirepayment';
$xml->order->total_paid = 100.00;
$xml->order->total_paid_real = 100.00;
$xml->order->total_products = 90.00;
$xml->order->total_products_wt = 100.00;
$xml->order->total_shipping = 10.00;
$xml->order->current_state = 1; // Estado "Esperando pago por transferencia"

// 3. Añadir líneas de pedido (order_rows)
unset($xml->order->associations->order_rows->order_row);
$orderRow = $xml->order->associations->order_rows->addChild('order_row');
$orderRow->addChild('product_id', 1);
$orderRow->addChild('product_quantity', 2);
$orderRow->addChild('product_price', 45.00);
$orderRow->addChild('product_name', 'Producto A');

// 4. Crear el pedido
$result = $webService->add([
    'resource' => 'orders',
    'postXml' => $xml->asXML(),
]);

echo "Pedido creado con ID: " . $result->order->id;</code></pre>

        <h2 class="section-title">5. Autenticación desde JavaScript (CORS)</h2>
        <p>Por defecto, PrestaShop Web Services no permite peticiones CORS desde navegadores. Si necesitas acceder desde una SPA, debes configurar CORS.</p>

        <h3>5.1. Habilitar CORS en PrestaShop</h3>
        <p>Modifica el archivo <code>.htaccess</code> de la raíz de PrestaShop:</p>

        <pre><code class="language-apache"># Añadir antes de las reglas de PrestaShop
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
Header always set Access-Control-Max-Age "3600"

# Responder a preflight requests
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ $1 [R=200,L]</code></pre>

        <h3>5.2. Llamada desde JavaScript (Fetch API)</h3>

        <pre><code class="language-javascript">const API_URL = 'https://tu-tienda.com/api';
const API_KEY = 'YOUR_API_KEY_HERE';

// Autenticación Basic Auth (API_KEY como usuario, sin contraseña)
const headers = {
    'Authorization': 'Basic ' + btoa(API_KEY + ':'),
    'Content-Type': 'application/json',
    'Output-Format': 'JSON', // Respuesta en JSON en lugar de XML
};

// GET - Obtener productos
fetch(\`\${ API_URL }/products?display=full&limit=10\`, {
method: 'GET',
    headers: headers,
})
.then(response => response.json())
    .then(data => {
        console.log('Productos:', data.products);
    })
    .catch(error => console.error('Error:', error));</code></pre>

        <h2 class="section-title">6. Webhooks y Notificaciones en Tiempo Real</h2>
        <p>PrestaShop no tiene webhooks nativos, pero puedes implementarlos en tu módulo usando hooks.</p>

        <h3>6.1. Enviar Notificación al Crear un Pedido</h3>

        <pre><code class="language-php">class MiModulo extends Module
{
    public function hookActionValidateOrder(array $params): void
    {
        $order = $params['order'];

        // Enviar webhook a sistema externo
        $this->enviarWebhook('https://mi-sistema.com/webhook/nuevo-pedido', [
            'event' => 'order.created',
            'order_id' => $order->id,
            'customer_email' => $order->getCustomer()->email,
            'total' => $order->total_paid,
            'timestamp' => date('c'),
        ]);
    }

    private function enviarWebhook(string $url, array $data): void
    {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_exec($ch);
        curl_close($ch);
    }
}</code></pre>

        <h2 class="section-title">7. Mejores Prácticas</h2>
        <ul>
            <li><strong>Cache de claves:</strong> No hagas una petición a la API para obtener el esquema cada vez. Cachea los esquemas.</li>
            <li><strong>Batch operations:</strong> Si necesitas actualizar muchos productos, agrúpalos para reducir peticiones HTTP.</li>
            <li><strong>Rate limiting:</strong> Respeta los límites del servidor. No hagas más de 5-10 peticiones por segundo.</li>
            <li><strong>Error handling:</strong> Siempre captura <code>PrestaShopWebserviceException</code> y registra errores.</li>
            <li><strong>HTTPS:</strong> Usa siempre HTTPS para proteger la clave de API.</li>
            <li><strong>Permisos mínimos:</strong> Crea claves de API con solo los permisos necesarios (principio de mínimo privilegio).</li>
            <li><strong>Log de actividad:</strong> Registra todas las operaciones de la API para auditoría.</li>
        </ul>

        <h3>7.1. Ejemplo de Manejo Robusto de Errores</h3>

        <pre><code class="language-php">function actualizarProductoSeguro(int $id, array $datos): bool
{
    global $webService;

    try {
        // Obtener producto
        $xml = $webService->get([
            'resource' => 'products',
            'id' => $id,
        ]);

        // Actualizar campos
        foreach ($datos as $campo => $valor) {
            $xml->product->{$campo} = $valor;
        }

        // Validar antes de enviar (opcional: validación custom)
        if (empty($xml->product->name)) {
            throw new Exception('El nombre del producto no puede estar vacío');
        }

        // Enviar actualización
        $webService->edit([
            'resource' => 'products',
            'id' => $id,
            'putXml' => $xml->asXML(),
        ]);

        PrestaShopLogger::addLog(
            "Producto $id actualizado vía API",
            1, // Info
            null,
            'Product',
            $id
        );

        return true;

    } catch (PrestaShopWebserviceException $e) {
        // Errores de la API
        $errorCode = $e->getCode();
        $errorMessage = $e->getMessage();

        PrestaShopLogger::addLog(
            "Error API al actualizar producto $id: [$errorCode] $errorMessage",
            3, // Error
            null,
            'Product',
            $id
        );

        return false;

    } catch (Exception $e) {
        // Errores de validación u otros
        PrestaShopLogger::addLog(
            "Error general al actualizar producto $id: " . $e->getMessage(),
            3,
            null,
            'Product',
            $id
        );

        return false;
    }
}</code></pre>
    </div>
    `;

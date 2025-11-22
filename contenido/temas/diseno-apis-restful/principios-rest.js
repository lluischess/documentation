// @ts-nocheck
const principiosREST = `
    <div class="content-section">
        <h1 id="principios-rest">Principios REST (Stateless, Cacheable, Uniform Interface)</h1>
        <p>REST (Representational State Transfer) define un conjunto de restricciones arquitecturales para crear APIs escalables y mantenibles. Esencial para el desarrollo de Web Services en PrestaShop 8.9+.</p>

        <h2 class="section-title">1. Los 6 Principios REST</h2>

        <table class="table table-bordered">
            <thead class="table-dark">
                <tr>
                    <th width="25%">Principio</th>
                    <th width="40%">Descripción</th>
                    <th width="35%">Ejemplo PrestaShop</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Client-Server</strong></td>
                    <td>Separación entre cliente y servidor</td>
                    <td>Frontend (React) consume API PrestaShop</td>
                </tr>
                <tr>
                    <td><strong>Stateless</strong></td>
                    <td>Cada petición contiene toda la información necesaria</td>
                    <td>Token JWT en cada request</td>
                </tr>
                <tr>
                    <td><strong>Cacheable</strong></td>
                    <td>Respuestas deben indicar si son cacheables</td>
                    <td>Headers: Cache-Control, ETag</td>
                </tr>
                <tr>
                    <td><strong>Uniform Interface</strong></td>
                    <td>Interfaz uniforme para recursos</td>
                    <td><code>/api/products/{id}</code></td>
                </tr>
                <tr>
                    <td><strong>Layered System</strong></td>
                    <td>Arquitectura en capas</td>
                    <td>Load Balancer → API → Database</td>
                </tr>
                <tr>
                    <td><strong>Code on Demand</strong></td>
                    <td>(Opcional) Servidor envía código ejecutable</td>
                    <td>JavaScript widgets</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">2. Stateless (Sin Estado)</h2>

        <div class="alert alert-info">
            <strong>🔑 Concepto:</strong> El servidor no guarda información sobre el cliente entre peticiones. Cada request debe contener toda la información necesaria.
        </div>

        <pre><code class="language-php"><?php
// ❌ MAL: Depende de sesión (stateful)
class ProductController
{
    public function getProducts()
    {
        $userId = $_SESSION['user_id']; // Depende de estado del servidor
        return Product::getByUser($userId);
    }
}

// ✅ BIEN: Stateless (token en cada request)
class ProductController
{
    public function getProducts(Request $request)
    {
        // Extraer token del header
        $token = $request->headers->get('Authorization');
        $userId = JWT::decode($token)->user_id;
        
        return Product::getByUser($userId);
    }
}
</code></pre>

        <h3>Implementación en PrestaShop</h3>

        <pre><code class="language-php"><?php
// modules/myapi/controllers/ApiController.php
class ApiController extends ModuleFrontController
{
    public function initContent()
    {
        // Validar token en cada petición
        $token = $this->getAuthToken();
        
        if (!$this->validateToken($token)) {
            http_response_code(401);
            die(json_encode(['error' => 'Unauthorized']));
        }
        
        // Procesar request
        $this->processRequest();
    }
    
    private function getAuthToken(): ?string
    {
        $headers = getallheaders();
        
        if (isset($headers['Authorization'])) {
            // Bearer token
            return str_replace('Bearer ', '', $headers['Authorization']);
        }
        
        return null;
    }
    
    private function validateToken(?string $token): bool
    {
        if (!$token) {
            return false;
        }
        
        try {
            $decoded = JWT::decode($token, new Key(
                Configuration::get('API_SECRET_KEY'),
                'HS256'
            ));
            
            // Token válido
            return true;
        } catch (Exception $e) {
            return false;
        }
    }
}
</code></pre>

        <h2 class="section-title">3. Cacheable</h2>

        <pre><code class="language-php"><?php
// Implementar cache en respuestas
class ProductApiController
{
    public function getProduct(int $id)
    {
        $product = new Product($id);
        
        // ETag basado en fecha de modificación
        $etag = md5($product->date_upd);
        
        // Verificar If-None-Match del cliente
        $clientEtag = $_SERVER['HTTP_IF_NONE_MATCH'] ?? null;
        
        if ($clientEtag === $etag) {
            // Recurso no modificado
            http_response_code(304);
            header('ETag: ' . $etag);
            exit;
        }
        
        // Enviar recurso con headers de cache
        header('Content-Type: application/json');
        header('Cache-Control: public, max-age=3600'); // 1 hora
        header('ETag: ' . $etag);
        header('Last-Modified: ' . $product->date_upd);
        
        echo json_encode([
            'id' => $product->id,
            'name' => $product->name,
            'price' => $product->price,
        ]);
    }
}
</code></pre>

        <h2 class="section-title">4. Uniform Interface</h2>

        <h3>4.1. Identificación de Recursos</h3>

        <pre><code class="language-plaintext">✅ BIEN: URLs descriptivas y consistentes
GET    /api/products              # Listar productos
GET    /api/products/123          # Obtener producto específico
GET    /api/products/123/images   # Imágenes del producto
GET    /api/categories/5/products # Productos de categoría

❌ MAL: URLs inconsistentes
GET    /api/getProducts
GET    /api/product?id=123
GET    /api/productImages/123
GET    /api/cat5products
</code></pre>

        <h3>4.2. Manipulación mediante Representaciones</h3>

        <pre><code class="language-php"><?php
// Cliente envía representación para crear/modificar recurso
class ProductApiController
{
    public function createProduct()
    {
        // Recibir representación JSON
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validar
        if (!isset($data['name']) || !isset($data['price'])) {
            http_response_code(400);
            die(json_encode(['error' => 'Missing required fields']));
        }
        
        // Crear recurso
        $product = new Product();
        $product->name = $data['name'];
        $product->price = $data['price'];
        $product->active = $data['active'] ?? true;
        
        if ($product->save()) {
            http_response_code(201);
            header('Location: /api/products/' . $product->id);
            echo json_encode([
                'id' => $product->id,
                'name' => $product->name,
                'price' => $product->price,
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create product']);
        }
    }
}
</code></pre>

        <h3>4.3. Mensajes Auto-descriptivos</h3>

        <pre><code class="language-php"><?php
// Response con metadata completa
header('Content-Type: application/json; charset=utf-8');
header('X-RateLimit-Limit: 1000');
header('X-RateLimit-Remaining: 999');
header('X-RateLimit-Reset: 1640995200');

echo json_encode([
    'data' => [
        'id' => 123,
        'name' => 'Product Name',
        'price' => 29.99,
        'stock' => 50,
    ],
    'meta' => [
        'timestamp' => date('c'),
        'version' => '1.0',
    ],
]);
</code></pre>

        <h2 class="section-title">5. Recursos y Colecciones</h2>

        <pre><code class="language-php"><?php
// Definir estructura de recursos
class ResourceStructure
{
    // Recurso individual
    public static function product(Product $product): array
    {
        return [
            'id' => (int)$product->id,
            'reference' => $product->reference,
            'name' => $product->name,
            'description' => strip_tags($product->description),
            'price' => (float)$product->price,
            'quantity' => (int)$product->quantity,
            'active' => (bool)$product->active,
            'images' => self::productImages($product->id),
            'category_id' => (int)$product->id_category_default,
            'created_at' => $product->date_add,
            'updated_at' => $product->date_upd,
        ];
    }
    
    // Colección de recursos
    public static function productCollection(array $products): array
    {
        return [
            'data' => array_map([self::class, 'product'], $products),
            'meta' => [
                'total' => count($products),
            ],
        ];
    }
    
    private static function productImages(int $productId): array
    {
        $images = Image::getImages(Context::getContext()->language->id, $productId);
        
        return array_map(function($image) use ($productId) {
            return [
                'id' => (int)$image['id_image'],
                'url' => Context::getContext()->link->getImageLink(
                    'product',
                    $productId . '-' . $image['id_image'],
                    'large_default'
                ),
            ];
        }, $images);
    }
}
</code></pre>

        <h2 class="section-title">6. Content Negotiation</h2>

        <pre><code class="language-php"><?php
// Soportar múltiples formatos
class ApiResponseFormatter
{
    public function send($data, int $statusCode = 200): void
    {
        $acceptHeader = $_SERVER['HTTP_ACCEPT'] ?? 'application/json';
        
        http_response_code($statusCode);
        
        if (strpos($acceptHeader, 'application/xml') !== false) {
            $this->sendXml($data);
        } else {
            $this->sendJson($data);
        }
    }
    
    private function sendJson($data): void
    {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    }
    
    private function sendXml($data): void
    {
        header('Content-Type: application/xml; charset=utf-8');
        $xml = new SimpleXMLElement('<response/>');
        $this->arrayToXml($data, $xml);
        echo $xml->asXML();
    }
    
    private function arrayToXml($data, &$xml): void
    {
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $subnode = $xml->addChild($key);
                $this->arrayToXml($value, $subnode);
            } else {
                $xml->addChild($key, htmlspecialchars($value));
            }
        }
    }
}
</code></pre>

        <h2 class="section-title">7. Mejores Prácticas</h2>

        <div class="row">
            <div class="col-md-6">
                <div class="card border-success mb-3">
                    <div class="card-header bg-success text-white">✅ Hacer</div>
                    <div class="card-body">
                        <ul>
                            <li>Usar sustantivos para recursos</li>
                            <li>Mantener URLs consistentes</li>
                            <li>Implementar caching con ETags</li>
                            <li>Tokens en headers (Authorization)</li>
                            <li>Respuestas auto-descriptivas</li>
                            <li>Versionado de API</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card border-danger mb-3">
                    <div class="card-header bg-danger text-white">❌ Evitar</div>
                    <div class="card-body">
                        <ul>
                            <li>Verbos en URLs</li>
                            <li>Dependencia de sesiones</li>
                            <li>URLs inconsistentes</li>
                            <li>Respuestas sin headers de cache</li>
                            <li>Mezclar formatos sin Content-Type</li>
                            <li>Estado del servidor entre requests</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <div class="alert alert-info">
            <strong>🎯 Checklist REST:</strong>
            <ul class="mb-0">
                <li>☐ Stateless (token en headers)</li>
                <li>☐ Cacheable (ETags, Cache-Control)</li>
                <li>☐ Uniform Interface (URLs consistentes)</li>
                <li>☐ Recursos identificables por URI</li>
                <li>☐ Manipulación mediante representaciones</li>
                <li>☐ Mensajes auto-descriptivos</li>
            </ul>
        </div>
    </div>
`;

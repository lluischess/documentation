// @ts-nocheck
const verbosHTTPSemantica = `
    <div class="content-section">
        <h1 id="verbos-http">Verbos HTTP (GET, POST, PUT, PATCH, DELETE) y su Semántica</h1>
        <p>Los verbos HTTP definen la acción a realizar sobre un recurso. Usar correctamente cada verbo es fundamental para crear APIs RESTful consistentes en PrestaShop 8.9+.</p>

        <h2 class="section-title">1. Tabla de Verbos HTTP</h2>

        <table class="table table-bordered">
            <thead class="table-dark">
                <tr>
                    <th>Verbo</th>
                    <th>Acción</th>
                    <th>Idempotente</th>
                    <th>Safe</th>
                    <th>Uso</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>GET</strong></td>
                    <td>Obtener recurso</td>
                    <td>✅ Sí</td>
                    <td>✅ Sí</td>
                    <td>Lectura sin modificar</td>
                </tr>
                <tr>
                    <td><strong>POST</strong></td>
                    <td>Crear recurso</td>
                    <td>❌ No</td>
                    <td>❌ No</td>
                    <td>Crear nuevo recurso</td>
                </tr>
                <tr>
                    <td><strong>PUT</strong></td>
                    <td>Reemplazar completo</td>
                    <td>✅ Sí</td>
                    <td>❌ No</td>
                    <td>Actualización completa</td>
                </tr>
                <tr>
                    <td><strong>PATCH</strong></td>
                    <td>Actualización parcial</td>
                    <td>❌ No*</td>
                    <td>❌ No</td>
                    <td>Modificar campos específicos</td>
                </tr>
                <tr>
                    <td><strong>DELETE</strong></td>
                    <td>Eliminar recurso</td>
                    <td>✅ Sí</td>
                    <td>❌ No</td>
                    <td>Borrar recurso</td>
                </tr>
                <tr>
                    <td><strong>HEAD</strong></td>
                    <td>Metadatos</td>
                    <td>✅ Sí</td>
                    <td>✅ Sí</td>
                    <td>Headers sin body</td>
                </tr>
                <tr>
                    <td><strong>OPTIONS</strong></td>
                    <td>Operaciones permitidas</td>
                    <td>✅ Sí</td>
                    <td>✅ Sí</td>
                    <td>CORS, metadatos</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">2. GET - Obtener Recursos</h2>

        <pre><code class="language-php"><?php
// GET /api/products - Listar productos
class ProductApiController extends ModuleFrontController
{
    public function getProducts()
    {
        $products = Product::getProducts(
            $this->context->language->id,
            0,
            100,
            'id_product',
            'DESC'
        );
        
        $response = [
            'data' => array_map(function($product) {
                return [
                    'id' => (int)$product['id_product'],
                    'name' => $product['name'],
                    'price' => (float)$product['price'],
                    'reference' => $product['reference'],
                ];
            }, $products),
            'meta' => [
                'total' => count($products),
            ],
        ];
        
        header('Content-Type: application/json');
        echo json_encode($response);
    }
}

// GET /api/products/{id} - Obtener producto específico
public function getProduct(int $id)
{
    $product = new Product($id, true, $this->context->language->id);
    
    if (!Validate::isLoadedObject($product)) {
        http_response_code(404);
        echo json_encode(['error' => 'Product not found']);
        return;
    }
    
    header('Content-Type: application/json');
    echo json_encode([
        'id' => (int)$product->id,
        'name' => $product->name,
        'description' => strip_tags($product->description),
        'price' => (float)$product->price,
        'quantity' => (int)$product->quantity,
        'active' => (bool)$product->active,
    ]);
}
</code></pre>

        <h2 class="section-title">3. POST - Crear Recursos</h2>

        <pre><code class="language-php"><?php
// POST /api/products - Crear nuevo producto
public function createProduct()
{
    // Leer body JSON
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validar datos requeridos
    if (!isset($data['name']) || !isset($data['price'])) {
        http_response_code(400);
        echo json_encode([
            'error' => 'Validation failed',
            'message' => 'Name and price are required',
        ]);
        return;
    }
    
    try {
        $product = new Product();
        $product->name = $data['name'];
        $product->description = $data['description'] ?? '';
        $product->price = (float)$data['price'];
        $product->quantity = (int)($data['quantity'] ?? 0);
        $product->active = $data['active'] ?? true;
        $product->id_category_default = (int)($data['category_id'] ?? 2);
        
        if (!$product->save()) {
            throw new Exception('Failed to save product');
        }
        
        // 201 Created con Location header
        http_response_code(201);
        header('Location: /api/products/' . $product->id);
        header('Content-Type: application/json');
        
        echo json_encode([
            'id' => (int)$product->id,
            'name' => $product->name,
            'price' => (float)$product->price,
            'created_at' => $product->date_add,
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'error' => 'Internal server error',
            'message' => $e->getMessage(),
        ]);
    }
}

// POST /api/products/bulk - Crear múltiples productos
public function bulkCreate()
{
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['products']) || !is_array($data['products'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid payload']);
        return;
    }
    
    $created = [];
    $errors = [];
    
    foreach ($data['products'] as $productData) {
        try {
            $product = new Product();
            $product->hydrate($productData);
            
            if ($product->save()) {
                $created[] = $product->id;
            } else {
                $errors[] = $productData['name'] ?? 'Unknown';
            }
        } catch (Exception $e) {
            $errors[] = $e->getMessage();
        }
    }
    
    http_response_code(201);
    echo json_encode([
        'created' => count($created),
        'errors' => count($errors),
        'ids' => $created,
    ]);
}
</code></pre>

        <h2 class="section-title">4. PUT - Reemplazar Completo</h2>

        <pre><code class="language-php"><?php
// PUT /api/products/{id} - Reemplazar producto completo
public function replaceProduct(int $id)
{
    $product = new Product($id);
    
    if (!Validate::isLoadedObject($product)) {
        http_response_code(404);
        echo json_encode(['error' => 'Product not found']);
        return;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    // PUT requiere todos los campos
    $requiredFields = ['name', 'price', 'quantity', 'active', 'category_id'];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field])) {
            http_response_code(400);
            echo json_encode([
                'error' => 'Missing required field: ' . $field,
            ]);
            return;
        }
    }
    
    // Reemplazar TODOS los campos
    $product->name = $data['name'];
    $product->description = $data['description'] ?? '';
    $product->price = (float)$data['price'];
    $product->quantity = (int)$data['quantity'];
    $product->active = (bool)$data['active'];
    $product->id_category_default = (int)$data['category_id'];
    
    if ($product->save()) {
        header('Content-Type: application/json');
        echo json_encode([
            'id' => (int)$product->id,
            'name' => $product->name,
            'price' => (float)$product->price,
            'updated_at' => $product->date_upd,
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update product']);
    }
}
</code></pre>

        <h2 class="section-title">5. PATCH - Actualización Parcial</h2>

        <pre><code class="language-php"><?php
// PATCH /api/products/{id} - Actualizar campos específicos
public function updateProduct(int $id)
{
    $product = new Product($id);
    
    if (!Validate::isLoadedObject($product)) {
        http_response_code(404);
        echo json_encode(['error' => 'Product not found']);
        return;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    // PATCH: solo actualizar campos proporcionados
    if (isset($data['name'])) {
        $product->name = $data['name'];
    }
    
    if (isset($data['price'])) {
        $product->price = (float)$data['price'];
    }
    
    if (isset($data['quantity'])) {
        $product->quantity = (int)$data['quantity'];
    }
    
    if (isset($data['active'])) {
        $product->active = (bool)$data['active'];
    }
    
    if ($product->save()) {
        header('Content-Type: application/json');
        echo json_encode([
            'id' => (int)$product->id,
            'updated_fields' => array_keys($data),
            'updated_at' => $product->date_upd,
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update product']);
    }
}

// PATCH con operaciones JSON Patch (RFC 6902)
public function jsonPatch(int $id)
{
    $product = new Product($id);
    
    if (!Validate::isLoadedObject($product)) {
        http_response_code(404);
        return;
    }
    
    $operations = json_decode(file_get_contents('php://input'), true);
    
    foreach ($operations as $op) {
        switch ($op['op']) {
            case 'replace':
                $field = str_replace('/','', $op['path']);
                $product->$field = $op['value'];
                break;
                
            case 'add':
                // Añadir valor a array
                break;
                
            case 'remove':
                // Eliminar campo
                break;
        }
    }
    
    $product->save();
}
</code></pre>

        <h2 class="section-title">6. DELETE - Eliminar Recursos</h2>

        <pre><code class="language-php"><?php
// DELETE /api/products/{id} - Eliminar producto
public function deleteProduct(int $id)
{
    $product = new Product($id);
    
    if (!Validate::isLoadedObject($product)) {
        http_response_code(404);
        echo json_encode(['error' => 'Product not found']);
        return;
    }
    
    if ($product->delete()) {
        // 204 No Content (sin body)
        http_response_code(204);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete product']);
    }
}

// DELETE /api/products - Eliminar múltiples (con query params)
public function bulkDelete()
{
    $ids = explode(',', $_GET['ids'] ?? '');
    $deleted = 0;
    
    foreach ($ids as $id) {
        $product = new Product((int)$id);
        if (Validate::isLoadedObject($product) && $product->delete()) {
            $deleted++;
        }
    }
    
    http_response_code(200);
    echo json_encode([
        'deleted' => $deleted,
        'total' => count($ids),
    ]);
}

// Soft delete (marcar como inactivo)
public function softDelete(int $id)
{
    $product = new Product($id);
    
    if (!Validate::isLoadedObject($product)) {
        http_response_code(404);
        return;
    }
    
    $product->active = false;
    $product->save();
    
    http_response_code(200);
    echo json_encode([
        'message' => 'Product deactivated',
        'id' => $id,
    ]);
}
</code></pre>

        <h2 class="section-title">7. HEAD y OPTIONS</h2>

        <pre><code class="language-php"><?php
// HEAD /api/products/{id} - Solo headers, sin body
public function headProduct(int $id)
{
    $product = new Product($id);
    
    if (!Validate::isLoadedObject($product)) {
        http_response_code(404);
        return;
    }
    
    // Enviar solo headers
    header('Content-Type: application/json');
    header('Content-Length: ' . strlen(json_encode(['id' => $id])));
    header('Last-Modified: ' . $product->date_upd);
    header('ETag: ' . md5($product->date_upd));
}

// OPTIONS /api/products - Operaciones permitidas
public function optionsProducts()
{
    header('Allow: GET, POST, OPTIONS');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Max-Age: 86400');
    http_response_code(204);
}
</code></pre>

        <h2 class="section-title">8. Router Completo</h2>

        <pre><code class="language-php"><?php
// modules/myapi/controllers/front/router.php
class MyApiRouterModuleFrontController extends ModuleFrontController
{
    public function init()
    {
        parent::init();
        
        $method = $_SERVER['REQUEST_METHOD'];
        $uri = $_SERVER['REQUEST_URI'];
        
        // Parsear ruta
        preg_match('#/api/products(?:/(\d+))?#', $uri, $matches);
        $id = $matches[1] ?? null;
        
        // Routing basado en método HTTP
        switch ($method) {
            case 'GET':
                $id ? $this->getProduct((int)$id) : $this->getProducts();
                break;
                
            case 'POST':
                $this->createProduct();
                break;
                
            case 'PUT':
                $this->replaceProduct((int)$id);
                break;
                
            case 'PATCH':
                $this->updateProduct((int)$id);
                break;
                
            case 'DELETE':
                $this->deleteProduct((int)$id);
                break;
                
            case 'OPTIONS':
                $this->optionsProducts();
                break;
                
            default:
                http_response_code(405);
                header('Allow: GET, POST, PUT, PATCH, DELETE, OPTIONS');
                echo json_encode(['error' => 'Method not allowed']);
        }
        
        exit;
    }
}
</code></pre>

        <h2 class="section-title">9. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Usar correctamente:</strong>
            <ul class="mb-0">
                <li><strong>GET:</strong> Solo lectura, cacheable, idempotente</li>
                <li><strong>POST:</strong> Crear recursos, no idempotente</li>
                <li><strong>PUT:</strong> Reemplazo completo, idempotente</li>
                <li><strong>PATCH:</strong> Actualización parcial</li>
                <li><strong>DELETE:</strong> Eliminar, idempotente</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Evitar:</strong>
            <ul class="mb-0">
                <li>GET que modifique datos</li>
                <li>POST para actualizaciones (usar PUT/PATCH)</li>
                <li>DELETE sin verificar existencia</li>
                <li>PUT para actualizaciones parciales (usar PATCH)</li>
            </ul>
        </div>
    </div>
`;

// @ts-nocheck
const codigosEstadoHTTP = `
    <div class="content-section">
        <h1 id="codigos-estado">Códigos de Estado HTTP y su Significado</h1>
        <p>Los códigos de estado HTTP comunican el resultado de una petición. Usar los códigos correctos es esencial para crear APIs REST consistentes y predecibles en PrestaShop 8.9+.</p>

        <h2 class="section-title">1. Categorías de Códigos</h2>

        <table class="table table-bordered">
            <thead class="table-dark">
                <tr>
                    <th>Rango</th>
                    <th>Categoría</th>
                    <th>Significado</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>1xx</strong></td>
                    <td>Informacional</td>
                    <td>Petición recibida, continuando</td>
                </tr>
                <tr>
                    <td><strong>2xx</strong></td>
                    <td>Éxito</td>
                    <td>Petición procesada correctamente</td>
                </tr>
                <tr>
                    <td><strong>3xx</strong></td>
                    <td>Redirección</td>
                    <td>Se requiere acción adicional</td>
                </tr>
                <tr>
                    <td><strong>4xx</strong></td>
                    <td>Error Cliente</td>
                    <td>Error en la petición del cliente</td>
                </tr>
                <tr>
                    <td><strong>5xx</strong></td>
                    <td>Error Servidor</td>
                    <td>Error en el servidor</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">2. Códigos 2xx - Éxito</h2>

        <table class="table table-striped">
            <thead class="table-dark">
                <tr>
                    <th width="15%">Código</th>
                    <th width="30%">Nombre</th>
                    <th width="55%">Uso en API</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>200</strong></td>
                    <td>OK</td>
                    <td>GET exitoso, PATCH exitoso</td>
                </tr>
                <tr>
                    <td><strong>201</strong></td>
                    <td>Created</td>
                    <td>POST crea recurso + header Location</td>
                </tr>
                <tr>
                    <td><strong>204</strong></td>
                    <td>No Content</td>
                    <td>DELETE exitoso, sin body en respuesta</td>
                </tr>
            </tbody>
        </table>

        <pre><code class="language-php"><?php
// 200 OK - GET exitoso
public function getProduct(int $id)
{
    $product = new Product($id);
    
    http_response_code(200);
    header('Content-Type: application/json');
    echo json_encode([
        'id' => $product->id,
        'name' => $product->name,
    ]);
}

// 201 Created - POST crea recurso
public function createProduct()
{
    $data = json_decode(file_get_contents('php://input'), true);
    
    $product = new Product();
    $product->name = $data['name'];
    $product->save();
    
    http_response_code(201);
    header('Location: /api/products/' . $product->id);
    header('Content-Type: application/json');
    echo json_encode([
        'id' => $product->id,
        'name' => $product->name,
    ]);
}

// 204 No Content - DELETE exitoso
public function deleteProduct(int $id)
{
    $product = new Product($id);
    $product->delete();
    
    http_response_code(204);
    // Sin body
}
</code></pre>

        <h2 class="section-title">3. Códigos 3xx - Redirección</h2>

        <table class="table table-striped">
            <thead class="table-dark">
                <tr>
                    <th width="15%">Código</th>
                    <th width="30%">Nombre</th>
                    <th width="55%">Uso en API</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>301</strong></td>
                    <td>Moved Permanently</td>
                    <td>Recurso movido permanentemente</td>
                </tr>
                <tr>
                    <td><strong>302</strong></td>
                    <td>Found</td>
                    <td>Redirección temporal</td>
                </tr>
                <tr>
                    <td><strong>304</strong></td>
                    <td>Not Modified</td>
                    <td>Recurso no modificado (ETag match)</td>
                </tr>
            </tbody>
        </table>

        <pre><code class="language-php"><?php
// 304 Not Modified - Cache
public function getProduct(int $id)
{
    $product = new Product($id);
    $etag = md5($product->date_upd);
    
    if (isset($_SERVER['HTTP_IF_NONE_MATCH']) && 
        $_SERVER['HTTP_IF_NONE_MATCH'] === $etag) {
        http_response_code(304);
        header('ETag: ' . $etag);
        exit;
    }
    
    http_response_code(200);
    header('ETag: ' . $etag);
    echo json_encode(['id' => $product->id]);
}

// 301 Moved Permanently
public function oldEndpoint()
{
    http_response_code(301);
    header('Location: /api/v2/products');
}
</code></pre>

        <h2 class="section-title">4. Códigos 4xx - Error Cliente</h2>

        <table class="table table-striped">
            <thead class="table-dark">
                <tr>
                    <th width="15%">Código</th>
                    <th width="30%">Nombre</th>
                    <th width="55%">Uso en API</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>400</strong></td>
                    <td>Bad Request</td>
                    <td>Datos inválidos, validación fallida</td>
                </tr>
                <tr>
                    <td><strong>401</strong></td>
                    <td>Unauthorized</td>
                    <td>No autenticado (sin token o inválido)</td>
                </tr>
                <tr>
                    <td><strong>403</strong></td>
                    <td>Forbidden</td>
                    <td>Autenticado pero sin permisos</td>
                </tr>
                <tr>
                    <td><strong>404</strong></td>
                    <td>Not Found</td>
                    <td>Recurso no existe</td>
                </tr>
                <tr>
                    <td><strong>405</strong></td>
                    <td>Method Not Allowed</td>
                    <td>Verbo HTTP no permitido</td>
                </tr>
                <tr>
                    <td><strong>409</strong></td>
                    <td>Conflict</td>
                    <td>Conflicto (ej: email duplicado)</td>
                </tr>
                <tr>
                    <td><strong>422</strong></td>
                    <td>Unprocessable Entity</td>
                    <td>Validación semántica fallida</td>
                </tr>
                <tr>
                    <td><strong>429</strong></td>
                    <td>Too Many Requests</td>
                    <td>Rate limit excedido</td>
                </tr>
            </tbody>
        </table>

        <pre><code class="language-php"><?php
// 400 Bad Request - Validación de datos
public function createProduct()
{
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['name']) || empty($data['name'])) {
        http_response_code(400);
        echo json_encode([
            'error' => 'Bad Request',
            'message' => 'Name is required',
            'field' => 'name',
        ]);
        return;
    }
    
    // Continuar con creación...
}

// 401 Unauthorized - Sin autenticación
public function checkAuth()
{
    $token = $_SERVER['HTTP_AUTHORIZATION'] ?? null;
    
    if (!$token) {
        http_response_code(401);
        header('WWW-Authenticate: Bearer realm="API"');
        echo json_encode([
            'error' => 'Unauthorized',
            'message' => 'Authentication required',
        ]);
        exit;
    }
}

// 403 Forbidden - Sin permisos
public function deleteProduct(int $id)
{
    if (!$this->currentUser->isAdmin()) {
        http_response_code(403);
        echo json_encode([
            'error' => 'Forbidden',
            'message' => 'Admin access required',
        ]);
        return;
    }
    
    // Continuar con eliminación...
}

// 404 Not Found - Recurso no existe
public function getProduct(int $id)
{
    $product = new Product($id);
    
    if (!Validate::isLoadedObject($product)) {
        http_response_code(404);
        echo json_encode([
            'error' => 'Not Found',
            'message' => 'Product with ID ' . $id . ' not found',
        ]);
        return;
    }
    
    // Devolver producto...
}

// 405 Method Not Allowed
public function handleRequest()
{
    $method = $_SERVER['REQUEST_METHOD'];
    $allowed = ['GET', 'POST', 'PUT', 'DELETE'];
    
    if (!in_array($method, $allowed)) {
        http_response_code(405);
        header('Allow: ' . implode(', ', $allowed));
        echo json_encode([
            'error' => 'Method Not Allowed',
            'message' => 'Method ' . $method . ' not supported',
            'allowed_methods' => $allowed,
        ]);
        return;
    }
}

// 409 Conflict - Duplicado
public function createCustomer()
{
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Verificar si email ya existe
    $existing = Customer::getCustomersByEmail($data['email']);
    
    if (!empty($existing)) {
        http_response_code(409);
        echo json_encode([
            'error' => 'Conflict',
            'message' => 'Email already registered',
            'field' => 'email',
        ]);
        return;
    }
    
    // Crear cliente...
}

// 422 Unprocessable Entity - Validación semántica
public function updateStock(int $id)
{
    $data = json_decode(file_get_contents('php://input'), true);
    
    if ($data['quantity'] < 0) {
        http_response_code(422);
        echo json_encode([
            'error' => 'Unprocessable Entity',
            'message' => 'Quantity cannot be negative',
            'field' => 'quantity',
            'value' => $data['quantity'],
        ]);
        return;
    }
}

// 429 Too Many Requests - Rate limiting
public function checkRateLimit()
{
    $ip = $_SERVER['REMOTE_ADDR'];
    $key = 'rate_limit_' . $ip;
    
    $requests = (int)Cache::getInstance()->get($key);
    
    if ($requests > 100) {
        http_response_code(429);
        header('Retry-After: 3600');
        header('X-RateLimit-Limit: 100');
        header('X-RateLimit-Remaining: 0');
        header('X-RateLimit-Reset: ' . (time() + 3600));
        
        echo json_encode([
            'error' => 'Too Many Requests',
            'message' => 'Rate limit exceeded. Try again later.',
            'retry_after' => 3600,
        ]);
        exit;
    }
    
    Cache::getInstance()->set($key, $requests + 1, 3600);
}
</code></pre>

        <h2 class="section-title">5. Códigos 5xx - Error Servidor</h2>

        <table class="table table-striped">
            <thead class="table-dark">
                <tr>
                    <th width="15%">Código</th>
                    <th width="30%">Nombre</th>
                    <th width="55%">Uso en API</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>500</strong></td>
                    <td>Internal Server Error</td>
                    <td>Error genérico del servidor</td>
                </tr>
                <tr>
                    <td><strong>502</strong></td>
                    <td>Bad Gateway</td>
                    <td>Error en proxy/gateway</td>
                </tr>
                <tr>
                    <td><strong>503</strong></td>
                    <td>Service Unavailable</td>
                    <td>Servidor temporalmente no disponible</td>
                </tr>
                <tr>
                    <td><strong>504</strong></td>
                    <td>Gateway Timeout</td>
                    <td>Timeout en proxy/gateway</td>
                </tr>
            </tbody>
        </table>

        <pre><code class="language-php"><?php
// 500 Internal Server Error
public function createProduct()
{
    try {
        $product = new Product();
        // ... lógica ...
        $product->save();
        
    } catch (Exception $e) {
        http_response_code(500);
        
        // En desarrollo: mostrar detalles
        if (_PS_MODE_DEV_) {
            echo json_encode([
                'error' => 'Internal Server Error',
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        } else {
            // En producción: mensaje genérico
            echo json_encode([
                'error' => 'Internal Server Error',
                'message' => 'An unexpected error occurred',
            ]);
        }
        
        // Loggear error
        PrestaShopLogger::addLog(
            'API Error: ' . $e->getMessage(),
            3,
            null,
            'API'
        );
    }
}

// 503 Service Unavailable - Mantenimiento
public function checkMaintenance()
{
    if (Configuration::get('PS_SHOP_ENABLE') == 0) {
        http_response_code(503);
        header('Retry-After: 3600');
        echo json_encode([
            'error' => 'Service Unavailable',
            'message' => 'System is under maintenance',
            'retry_after' => 3600,
        ]);
        exit;
    }
}
</code></pre>

        <h2 class="section-title">6. Estructura de Errores Consistente</h2>

        <pre><code class="language-php"><?php
class ApiErrorResponse
{
    public static function send(
        int $statusCode,
        string $error,
        string $message,
        array $details = []
    ): void {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        
        $response = [
            'error' => $error,
            'message' => $message,
            'status_code' => $statusCode,
            'timestamp' => date('c'),
        ];
        
        if (!empty($details)) {
            $response['details'] = $details;
        }
        
        if (_PS_MODE_DEV_ && isset($details['exception'])) {
            $response['debug'] = [
                'file' => $details['exception']->getFile(),
                'line' => $details['exception']->getLine(),
            ];
        }
        
        echo json_encode($response, JSON_PRETTY_PRINT);
        exit;
    }
}

// Uso
try {
    // ... lógica ...
} catch (ValidationException $e) {
    ApiErrorResponse::send(
        422,
        'Validation Error',
        $e->getMessage(),
        ['fields' => $e->getFields()]
    );
} catch (NotFoundException $e) {
    ApiErrorResponse::send(
        404,
        'Not Found',
        $e->getMessage()
    );
} catch (Exception $e) {
    ApiErrorResponse::send(
        500,
        'Internal Server Error',
        'An unexpected error occurred',
        ['exception' => $e]
    );
}
</code></pre>

        <h2 class="section-title">7. Tabla de Referencia Rápida</h2>

        <table class="table table-sm">
            <thead class="table-dark">
                <tr>
                    <th>Situación</th>
                    <th>Código</th>
                </tr>
            </thead>
            <tbody>
                <tr><td>GET exitoso</td><td><code>200 OK</code></td></tr>
                <tr><td>POST crea recurso</td><td><code>201 Created</code></td></tr>
                <tr><td>PUT/PATCH exitoso</td><td><code>200 OK</code></td></tr>
                <tr><td>DELETE exitoso</td><td><code>204 No Content</code></td></tr>
                <tr><td>Datos inválidos</td><td><code>400 Bad Request</code></td></tr>
                <tr><td>Sin autenticación</td><td><code>401 Unauthorized</code></td></tr>
                <tr><td>Sin permisos</td><td><code>403 Forbidden</code></td></tr>
                <tr><td>Recurso no existe</td><td><code>404 Not Found</code></td></tr>
                <tr><td>Método no permitido</td><td><code>405 Method Not Allowed</code></td></tr>
                <tr><td>Duplicado/Conflicto</td><td><code>409 Conflict</code></td></tr>
                <tr><td>Validación semántica</td><td><code>422 Unprocessable Entity</code></td></tr>
                <tr><td>Rate limit</td><td><code>429 Too Many Requests</code></td></tr>
                <tr><td>Error servidor</td><td><code>500 Internal Server Error</code></td></tr>
                <tr><td>Mantenimiento</td><td><code>503 Service Unavailable</code></td></tr>
            </tbody>
        </table>

        <div class="alert alert-info">
            <strong>💡 Regla de Oro:</strong> Usar el código de estado más específico posible. Evitar usar siempre 200 o 500.
        </div>
    </div>
`;

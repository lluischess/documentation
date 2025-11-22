// @ts-nocheck
const manejoErroresExcepciones = `
    <div class="content-section">
        <h1 id="manejo-errores-apis">Manejo de Errores y Excepciones en APIs</h1>
        <p>Un manejo adecuado de errores proporciona respuestas consistentes y útiles en APIs REST con Symfony en PrestaShop 8.9+.</p>

        <h2 class="section-title">1. Excepciones HTTP</h2>

        <pre><code class="language-php"><?php
use Symfony\\Component\\HttpKernel\\Exception\\NotFoundHttpException;
use Symfony\\Component\\HttpKernel\\Exception\\BadRequestHttpException;
use Symfony\\Component\\HttpKernel\\Exception\\UnauthorizedHttpException;
use Symfony\\Component\\HttpKernel\\Exception\\AccessDeniedHttpException;

class ProductController extends AbstractController
{
    public function get(int $id): JsonResponse
    {
        $product = new \\Product($id);
        
        if (!\\Validate::isLoadedObject($product)) {
            throw new NotFoundHttpException('Product not found');
        }
        
        return $this->json(['data' => $product]);
    }
    
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new BadRequestHttpException('Invalid JSON');
        }
        
        if (!isset($data['name'])) {
            throw new BadRequestHttpException('Name is required');
        }
        
        // Crear producto...
    }
    
    public function delete(int $id): JsonResponse
    {
        if (!$this->isGranted('ROLE_ADMIN')) {
            throw new AccessDeniedHttpException('Admin access required');
        }
        
        // Eliminar producto...
    }
}
</code></pre>

        <h2 class="section-title">2. Excepciones Personalizadas</h2>

        <pre><code class="language-php"><?php
// src/Exception/ApiException.php
namespace PrestaShop\\Module\\MyApi\\Exception;

use Symfony\\Component\\HttpKernel\\Exception\\HttpException;

class ApiException extends HttpException
{
    private array $errors;
    
    public function __construct(
        string $message,
        int $statusCode = 400,
        array $errors = [],
        \\Throwable $previous = null
    ) {
        $this->errors = $errors;
        parent::__construct($statusCode, $message, $previous);
    }
    
    public function getErrors(): array
    {
        return $this->errors;
    }
}

// Excepciones específicas
class ProductNotFoundException extends ApiException
{
    public function __construct(int $id)
    {
        parent::__construct(
            "Product with ID {$id} not found",
            404
        );
    }
}

class ValidationException extends ApiException
{
    public function __construct(array $errors)
    {
        parent::__construct(
            'Validation failed',
            422,
            $errors
        );
    }
}

class DuplicateResourceException extends ApiException
{
    public function __construct(string $field, $value)
    {
        parent::__construct(
            "{$field} '{$value}' already exists",
            409,
            ['field' => $field, 'value' => $value]
        );
    }
}

// Uso en controlador
class ProductController extends AbstractController
{
    public function get(int $id): JsonResponse
    {
        $product = new \\Product($id);
        
        if (!\\Validate::isLoadedObject($product)) {
            throw new ProductNotFoundException($id);
        }
        
        return $this->json(['data' => $product]);
    }
}
</code></pre>

        <h2 class="section-title">3. Event Listener para Excepciones</h2>

        <pre><code class="language-php"><?php
// src/EventListener/ExceptionListener.php
namespace PrestaShop\\Module\\MyApi\\EventListener;

use Symfony\\Component\\HttpFoundation\\JsonResponse;
use Symfony\\Component\\HttpKernel\\Event\\ExceptionEvent;
use Symfony\\Component\\HttpKernel\\Exception\\HttpExceptionInterface;
use Psr\\Log\\LoggerInterface;

class ExceptionListener
{
    private LoggerInterface $logger;
    private bool $debug;
    
    public function __construct(LoggerInterface $logger, bool $debug = false)
    {
        $this->logger = $logger;
        $this->debug = $debug;
    }
    
    public function onKernelException(ExceptionEvent $event): void
    {
        $exception = $event->getThrowable();
        $request = $event->getRequest();
        
        // Solo para peticiones API
        if (!str_starts_with($request->getPathInfo(), '/api/')) {
            return;
        }
        
        // Determinar código de estado
        $statusCode = $exception instanceof HttpExceptionInterface
            ? $exception->getStatusCode()
            : 500;
        
        // Construir respuesta
        $response = [
            'error' => $this->getErrorType($statusCode),
            'message' => $exception->getMessage(),
            'status_code' => $statusCode,
            'timestamp' => date('c'),
        ];
        
        // Añadir detalles en debug
        if ($this->debug) {
            $response['debug'] = [
                'exception' => get_class($exception),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
                'trace' => $exception->getTraceAsString(),
            ];
        }
        
        // Errores adicionales si existen
        if (method_exists($exception, 'getErrors')) {
            $response['errors'] = $exception->getErrors();
        }
        
        // Loggear error
        if ($statusCode >= 500) {
            $this->logger->error('API Error', [
                'exception' => $exception,
                'request' => $request->getPathInfo(),
            ]);
        }
        
        $event->setResponse(new JsonResponse($response, $statusCode));
    }
    
    private function getErrorType(int $statusCode): string
    {
        return match($statusCode) {
            400 => 'Bad Request',
            401 => 'Unauthorized',
            403 => 'Forbidden',
            404 => 'Not Found',
            409 => 'Conflict',
            422 => 'Unprocessable Entity',
            429 => 'Too Many Requests',
            500 => 'Internal Server Error',
            503 => 'Service Unavailable',
            default => 'Error',
        };
    }
}

// services.yml
services:
    PrestaShop\\Module\\MyApi\\EventListener\\ExceptionListener:
        arguments:
            $logger: '@logger'
            $debug: '%kernel.debug%'
        tags:
            - { name: kernel.event_listener, event: kernel.exception }
</code></pre>

        <h2 class="section-title">4. Validación con Violations</h2>

        <pre><code class="language-php"><?php
use Symfony\\Component\\Validator\\Validator\\ValidatorInterface;
use Symfony\\Component\\Validator\\Constraints as Assert;

class ProductController extends AbstractController
{
    public function create(
        Request $request,
        ValidatorInterface $validator
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        
        $constraints = new Assert\\Collection([
            'name' => [
                new Assert\\NotBlank(),
                new Assert\\Length(['min' => 3, 'max' => 128]),
            ],
            'price' => [
                new Assert\\NotBlank(),
                new Assert\\Type('numeric'),
                new Assert\\PositiveOrZero(),
            ],
            'email' => [
                new Assert\\Email(),
            ],
        ]);
        
        $violations = $validator->validate($data, $constraints);
        
        if (count($violations) > 0) {
            $errors = [];
            foreach ($violations as $violation) {
                $field = trim($violation->getPropertyPath(), '[]');
                $errors[$field] = $violation->getMessage();
            }
            
            throw new ValidationException($errors);
        }
        
        // Crear producto...
    }
}
</code></pre>

        <h2 class="section-title">5. Try-Catch en Servicios</h2>

        <pre><code class="language-php"><?php
class ProductService
{
    public function createProduct(array $data): \\Product
    {
        try {
            $product = new \\Product();
            $product->name = $data['name'];
            $product->price = $data['price'];
            
            if (!$product->save()) {
                throw new \\Exception('Failed to save product');
            }
            
            // Lógica adicional que puede fallar
            $this->assignCategories($product, $data['categories'] ?? []);
            $this->uploadImages($product, $data['images'] ?? []);
            
            return $product;
            
        } catch (\\PrestaShopException $e) {
            throw new ApiException(
                'PrestaShop error: ' . $e->getMessage(),
                500
            );
        } catch (\\Exception $e) {
            throw new ApiException(
                'Unexpected error: ' . $e->getMessage(),
                500
            );
        }
    }
    
    private function assignCategories(\\Product $product, array $categoryIds): void
    {
        foreach ($categoryIds as $categoryId) {
            $category = new \\Category($categoryId);
            
            if (!\\Validate::isLoadedObject($category)) {
                throw new ApiException(
                    "Category {$categoryId} not found",
                    400,
                    ['field' => 'categories', 'invalid_id' => $categoryId]
                );
            }
        }
        
        $product->updateCategories($categoryIds);
    }
}
</code></pre>

        <h2 class="section-title">6. Errores de Negocio</h2>

        <pre><code class="language-php"><?php
class OrderService
{
    public function createOrder(array $data): \\Order
    {
        // Verificar stock
        $product = new \\Product($data['product_id']);
        
        if ($product->quantity < $data['quantity']) {
            throw new ApiException(
                'Insufficient stock',
                400,
                [
                    'available' => $product->quantity,
                    'requested' => $data['quantity'],
                ]
            );
        }
        
        // Verificar precio mínimo
        if ($data['total'] < 10) {
            throw new ApiException(
                'Minimum order amount is 10€',
                400,
                ['minimum' => 10, 'current' => $data['total']]
            );
        }
        
        // Crear orden...
    }
}
</code></pre>

        <h2 class="section-title">7. Formato de Error Consistente</h2>

        <pre><code class="language-php"><?php
// src/Response/ErrorResponse.php
namespace PrestaShop\\Module\\MyApi\\Response;

use Symfony\\Component\\HttpFoundation\\JsonResponse;

class ErrorResponse extends JsonResponse
{
    public function __construct(
        string $message,
        int $statusCode = 400,
        array $errors = [],
        array $metadata = []
    ) {
        $data = [
            'error' => $this->getErrorType($statusCode),
            'message' => $message,
            'status_code' => $statusCode,
            'timestamp' => date('c'),
        ];
        
        if (!empty($errors)) {
            $data['errors'] = $errors;
        }
        
        if (!empty($metadata)) {
            $data['metadata'] = $metadata;
        }
        
        parent::__construct($data, $statusCode);
    }
    
    private function getErrorType(int $statusCode): string
    {
        return match($statusCode) {
            400 => 'bad_request',
            401 => 'unauthorized',
            403 => 'forbidden',
            404 => 'not_found',
            409 => 'conflict',
            422 => 'validation_error',
            429 => 'too_many_requests',
            500 => 'internal_error',
            default => 'error',
        };
    }
}

// Uso
return new ErrorResponse(
    'Product not found',
    404,
    [],
    ['searched_id' => $id]
);
</code></pre>

        <h2 class="section-title">8. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Manejo de Errores:</strong>
            <ul class="mb-0">
                <li>Usar excepciones HTTP estándar de Symfony</li>
                <li>Event Listener para formato consistente</li>
                <li>Códigos de estado HTTP correctos</li>
                <li>Mensajes de error descriptivos</li>
                <li>No exponer detalles internos en producción</li>
                <li>Loggear errores 5xx</li>
                <li>Incluir timestamp en respuestas</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>📋 Estructura de Error:</strong>
            <pre class="mb-0">{
  "error": "validation_error",
  "message": "Validation failed",
  "status_code": 422,
  "timestamp": "2024-01-15T10:30:00+00:00",
  "errors": {
    "name": "This value should not be blank",
    "price": "This value should be positive"
  }
}</pre>
        </div>
    </div>
`;

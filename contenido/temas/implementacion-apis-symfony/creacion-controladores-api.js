// @ts-nocheck
const creacionControladoresAPI = `
    <div class="content-section">
        <h1 id="controladores-api">Creación de Controladores de API</h1>
        <p>Los controladores API en Symfony permiten crear endpoints REST eficientes y bien estructurados. Esta guía cubre su implementación en PrestaShop 8.9+ con Symfony 4.4+.</p>

        <h2 class="section-title">1. Estructura Básica</h2>

        <pre><code class="language-php"><?php
// src/Controller/Api/ProductController.php
namespace PrestaShop\\Module\\MyApi\\Controller\\Api;

use Symfony\\Bundle\\FrameworkBundle\\Controller\\AbstractController;
use Symfony\\Component\\HttpFoundation\\JsonResponse;
use Symfony\\Component\\HttpFoundation\\Request;
use Symfony\\Component\\HttpFoundation\\Response;
use Symfony\\Component\\Routing\\Annotation\\Route;

/**
 * @Route("/api/products", name="api_products_")
 */
class ProductController extends AbstractController
{
    /**
     * @Route("", name="list", methods={"GET"})
     */
    public function list(Request $request): JsonResponse
    {
        $page = $request->query->getInt('page', 1);
        $limit = $request->query->getInt('limit', 20);
        
        // Obtener productos
        $products = \\Product::getProducts(
            $this->get('prestashop.adapter.legacy.context')->getLanguageId(),
            ($page - 1) * $limit,
            $limit
        );
        
        return $this->json([
            'data' => $products,
            'page' => $page,
            'limit' => $limit,
        ]);
    }
    
    /**
     * @Route("/{id}", name="get", methods={"GET"}, requirements={"id"="\\d+"})
     */
    public function get(int $id): JsonResponse
    {
        $product = new \\Product($id);
        
        if (!\\Validate::isLoadedObject($product)) {
            return $this->json(['error' => 'Product not found'], Response::HTTP_NOT_FOUND);
        }
        
        return $this->json([
            'id' => $product->id,
            'name' => $product->name,
            'price' => (float)$product->price,
            'quantity' => (int)$product->quantity,
        ]);
    }
    
    /**
     * @Route("", name="create", methods={"POST"})
     */
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        $product = new \\Product();
        $product->name = $data['name'];
        $product->price = $data['price'];
        $product->quantity = $data['quantity'] ?? 0;
        
        if (!$product->save()) {
            return $this->json(
                ['error' => 'Failed to create product'],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
        
        return $this->json(
            ['id' => $product->id, 'name' => $product->name],
            Response::HTTP_CREATED
        );
    }
}
</code></pre>

        <h2 class="section-title">2. Attributes (PHP 8.1+)</h2>

        <pre><code class="language-php"><?php
// Con atributos PHP 8.1+
namespace PrestaShop\\Module\\MyApi\\Controller\\Api;

use Symfony\\Component\\HttpFoundation\\JsonResponse;
use Symfony\\Component\\HttpFoundation\\Request;
use Symfony\\Component\\Routing\\Annotation\\Route;

#[Route('/api/products', name: 'api_products_')]
class ProductController extends AbstractController
{
    #[Route('', name: 'list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        // Implementación...
    }
    
    #[Route('/{id}', name: 'get', methods: ['GET'], requirements: ['id' => '\\d+'])]
    public function get(int $id): JsonResponse
    {
        // Implementación...
    }
    
    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        // Implementación...
    }
    
    #[Route('/{id}', name: 'update', methods: ['PUT', 'PATCH'])]
    public function update(int $id, Request $request): JsonResponse
    {
        // Implementación...
    }
    
    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        // Implementación...
    }
}
</code></pre>

        <h2 class="section-title">3. Request y Response</h2>

        <pre><code class="language-php"><?php
class ProductController extends AbstractController
{
    public function create(Request $request): JsonResponse
    {
        // Obtener datos del body
        $data = json_decode($request->getContent(), true);
        
        // Query parameters
        $page = $request->query->get('page', 1);
        
        // Headers
        $contentType = $request->headers->get('Content-Type');
        $authToken = $request->headers->get('Authorization');
        
        // Validar JSON
        if (json_last_error() !== JSON_ERROR_NONE) {
            return $this->json(
                ['error' => 'Invalid JSON: ' . json_last_error_msg()],
                Response::HTTP_BAD_REQUEST
            );
        }
        
        // Crear recurso
        $product = new \\Product();
        $product->hydrate($data);
        $product->save();
        
        // Response con headers personalizados
        $response = $this->json([
            'id' => $product->id,
            'name' => $product->name,
        ], Response::HTTP_CREATED);
        
        $response->headers->set('Location', '/api/products/' . $product->id);
        $response->headers->set('X-Resource-Id', $product->id);
        
        return $response;
    }
}
</code></pre>

        <h2 class="section-title">4. ParamConverter</h2>

        <pre><code class="language-php"><?php
use Sensio\\Bundle\\FrameworkExtraBundle\\Configuration\\ParamConverter;

class ProductController extends AbstractController
{
    /**
     * @Route("/{id}", name="get", methods={"GET"})
     * @ParamConverter("product", class="Product")
     */
    public function get(\\Product $product): JsonResponse
    {
        // Product ya está cargado automáticamente
        return $this->json([
            'id' => $product->id,
            'name' => $product->name,
        ]);
    }
}

// Custom ParamConverter
use Sensio\\Bundle\\FrameworkExtraBundle\\Request\\ParamConverter\\ParamConverterInterface;
use Symfony\\Component\\HttpFoundation\\Request;
use Symfony\\Component\\HttpKernel\\Exception\\NotFoundHttpException;

class ProductParamConverter implements ParamConverterInterface
{
    public function apply(Request $request, ParamConverter $configuration): bool
    {
        $id = $request->attributes->get('id');
        
        if (!$id) {
            return false;
        }
        
        $product = new \\Product($id);
        
        if (!\\Validate::isLoadedObject($product)) {
            throw new NotFoundHttpException('Product not found');
        }
        
        $request->attributes->set($configuration->getName(), $product);
        
        return true;
    }
    
    public function supports(ParamConverter $configuration): bool
    {
        return $configuration->getClass() === 'Product';
    }
}
</code></pre>

        <h2 class="section-title">5. Servicios Inyectados</h2>

        <pre><code class="language-php"><?php
// src/Service/ProductService.php
namespace PrestaShop\\Module\\MyApi\\Service;

class ProductService
{
    public function getProducts(int $page = 1, int $limit = 20): array
    {
        $offset = ($page - 1) * $limit;
        
        return \\Product::getProducts(
            \\Context::getContext()->language->id,
            $offset,
            $limit
        );
    }
    
    public function getProductById(int $id): ?\\Product
    {
        $product = new \\Product($id);
        
        return \\Validate::isLoadedObject($product) ? $product : null;
    }
    
    public function createProduct(array $data): \\Product
    {
        $product = new \\Product();
        $product->name = $data['name'];
        $product->price = $data['price'];
        $product->quantity = $data['quantity'] ?? 0;
        
        if (!$product->save()) {
            throw new \\Exception('Failed to save product');
        }
        
        return $product;
    }
}

// Controlador con servicio inyectado
class ProductController extends AbstractController
{
    private ProductService $productService;
    
    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }
    
    #[Route('', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $products = $this->productService->getProducts(
            $request->query->getInt('page', 1),
            $request->query->getInt('limit', 20)
        );
        
        return $this->json(['data' => $products]);
    }
    
    #[Route('/{id}', methods: ['GET'])]
    public function get(int $id): JsonResponse
    {
        $product = $this->productService->getProductById($id);
        
        if (!$product) {
            return $this->json(['error' => 'Not found'], Response::HTTP_NOT_FOUND);
        }
        
        return $this->json(['data' => $product]);
    }
}
</code></pre>

        <h2 class="section-title">6. Validación de Request</h2>

        <pre><code class="language-php"><?php
use Symfony\\Component\\Validator\\Constraints as Assert;
use Symfony\\Component\\Validator\\Validator\\ValidatorInterface;

class ProductController extends AbstractController
{
    public function create(Request $request, ValidatorInterface $validator): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        // Definir constraints
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
            'quantity' => [
                new Assert\\Type('integer'),
                new Assert\\PositiveOrZero(),
            ],
        ]);
        
        // Validar
        $violations = $validator->validate($data, $constraints);
        
        if (count($violations) > 0) {
            $errors = [];
            foreach ($violations as $violation) {
                $errors[$violation->getPropertyPath()] = $violation->getMessage();
            }
            
            return $this->json([
                'error' => 'Validation failed',
                'violations' => $errors,
            ], Response::HTTP_BAD_REQUEST);
        }
        
        // Crear producto...
    }
}
</code></pre>

        <h2 class="section-title">7. Sub-recursos</h2>

        <pre><code class="language-php"><?php
#[Route('/api/products/{productId}', name: 'api_product_')]
class ProductImageController extends AbstractController
{
    #[Route('/images', name: 'images_list', methods: ['GET'])]
    public function listImages(int $productId): JsonResponse
    {
        $images = \\Image::getImages(
            \\Context::getContext()->language->id,
            $productId
        );
        
        return $this->json(['data' => $images]);
    }
    
    #[Route('/images/{imageId}', name: 'images_get', methods: ['GET'])]
    public function getImage(int $productId, int $imageId): JsonResponse
    {
        $image = new \\Image($imageId);
        
        if (!\\Validate::isLoadedObject($image) || $image->id_product != $productId) {
            return $this->json(['error' => 'Not found'], Response::HTTP_NOT_FOUND);
        }
        
        return $this->json([
            'id' => $image->id,
            'position' => $image->position,
            'url' => \\Context::getContext()->link->getImageLink(
                'product',
                $productId . '-' . $imageId,
                'large_default'
            ),
        ]);
    }
    
    #[Route('/images', name: 'images_create', methods: ['POST'])]
    public function createImage(int $productId, Request $request): JsonResponse
    {
        // Upload y crear imagen...
    }
}
</code></pre>

        <h2 class="section-title">8. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Controladores API:</strong>
            <ul class="mb-0">
                <li>Usar <code>AbstractController</code> como base</li>
                <li>Un controlador por recurso principal</li>
                <li>Inyectar servicios por constructor</li>
                <li>Usar atributos PHP 8.1+ para routes</li>
                <li>Validar siempre el input</li>
                <li>Retornar códigos HTTP correctos</li>
                <li>Mantener controladores delgados (lógica en servicios)</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>🎯 Estructura Recomendada:</strong>
            <pre class="mb-0">src/Controller/Api/
├── ProductController.php
├── CategoryController.php
├── OrderController.php
└── CustomerController.php

src/Service/
├── ProductService.php
├── CategoryService.php
└── OrderService.php</pre>
        </div>
    </div>
`;

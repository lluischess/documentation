// @ts-nocheck
const serializacionDeserializacion = `
    <div class="content-section">
        <h1 id="serializacion-deserializacion">Serialización/Deserialización (Symfony Serializer Component)</h1>
        <p>El Symfony Serializer convierte objetos a formatos como JSON/XML y viceversa, esencial para APIs REST en PrestaShop 8.9+.</p>

        <h2 class="section-title">1. Configuración Básica</h2>

        <pre><code class="language-php"><?php
// config/services.yml
services:
    serializer:
        class: Symfony\\Component\\Serializer\\Serializer
        arguments:
            - ['@serializer.normalizer.object']
            - ['@serializer.encoder.json']
    
    serializer.normalizer.object:
        class: Symfony\\Component\\Serializer\\Normalizer\\ObjectNormalizer
        arguments:
            - '@serializer.name_converter.camel_case_to_snake_case'
    
    serializer.encoder.json:
        class: Symfony\\Component\\Serializer\\Encoder\\JsonEncoder
    
    serializer.name_converter.camel_case_to_snake_case:
        class: Symfony\\Component\\Serializer\\NameConverter\\CamelCaseToSnakeCaseNameConverter
</code></pre>

        <h2 class="section-title">2. Serialización Básica</h2>

        <pre><code class="language-php"><?php
use Symfony\\Component\\Serializer\\SerializerInterface;

class ProductController extends AbstractController
{
    private SerializerInterface $serializer;
    
    public function __construct(SerializerInterface $serializer)
    {
        $this->serializer = $serializer;
    }
    
    public function get(int $id): JsonResponse
    {
        $product = new \\Product($id);
        
        // Serializar a JSON
        $json = $this->serializer->serialize($product, 'json');
        
        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }
    
    // Más simple con json()
    public function list(): JsonResponse
    {
        $products = \\Product::getProducts(
            \\Context::getContext()->language->id,
            0,
            20
        );
        
        return $this->json($products);
    }
}
</code></pre>

        <h2 class="section-title">3. Grupos de Serialización</h2>

        <pre><code class="language-php"><?php
// DTO para controlar qué se serializa
namespace PrestaShop\\Module\\MyApi\\DTO;

use Symfony\\Component\\Serializer\\Annotation\\Groups;

class ProductDTO
{
    #[Groups(['product:read', 'product:list'])]
    public int $id;
    
    #[Groups(['product:read', 'product:list'])]
    public string $name;
    
    #[Groups(['product:read', 'product:list'])]
    public float $price;
    
    #[Groups(['product:read'])]
    public string $description;
    
    #[Groups(['product:read'])]
    public int $quantity;
    
    #[Groups(['product:read'])]
    public array $images;
    
    // Excluir de serialización
    private string $internalNote;
    
    public static function fromProduct(\\Product $product): self
    {
        $dto = new self();
        $dto->id = (int)$product->id;
        $dto->name = $product->name;
        $dto->price = (float)$product->price;
        $dto->description = strip_tags($product->description);
        $dto->quantity = (int)$product->quantity;
        $dto->images = self::getImages($product->id);
        
        return $dto;
    }
    
    private static function getImages(int $productId): array
    {
        $images = \\Image::getImages(\\Context::getContext()->language->id, $productId);
        
        return array_map(fn($img) => [
            'id' => (int)$img['id_image'],
            'url' => \\Context::getContext()->link->getImageLink(
                'product',
                $productId . '-' . $img['id_image'],
                'large_default'
            ),
        ], $images);
    }
}

// En controlador
class ProductController extends AbstractController
{
    public function list(): JsonResponse
    {
        $products = \\Product::getProducts(
            \\Context::getContext()->language->id,
            0,
            20
        );
        
        $dtos = array_map(
            fn($p) => ProductDTO::fromProduct(new \\Product($p['id_product'])),
            $products
        );
        
        // Serializar solo campos del grupo 'product:list'
        $json = $this->serializer->serialize($dtos, 'json', [
            'groups' => ['product:list'],
        ]);
        
        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }
    
    public function get(int $id): JsonResponse
    {
        $product = new \\Product($id);
        $dto = ProductDTO::fromProduct($product);
        
        // Serializar todos los campos del grupo 'product:read'
        $json = $this->serializer->serialize($dto, 'json', [
            'groups' => ['product:read'],
        ]);
        
        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }
}
</code></pre>

        <h2 class="section-title">4. Deserialización</h2>

        <pre><code class="language-php"><?php
class ProductController extends AbstractController
{
    public function create(Request $request): JsonResponse
    {
        // Deserializar JSON a DTO
        $dto = $this->serializer->deserialize(
            $request->getContent(),
            ProductDTO::class,
            'json'
        );
        
        // Crear entidad desde DTO
        $product = new \\Product();
        $product->name = $dto->name;
        $product->price = $dto->price;
        $product->description = $dto->description;
        $product->quantity = $dto->quantity ?? 0;
        
        if (!$product->save()) {
            return $this->json(['error' => 'Failed to save'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
        
        return $this->json(
            ProductDTO::fromProduct($product),
            Response::HTTP_CREATED
        );
    }
}
</code></pre>

        <h2 class="section-title">5. Normalizers Personalizados</h2>

        <pre><code class="language-php"><?php
// Normalizer para Product de PrestaShop
namespace PrestaShop\\Module\\MyApi\\Serializer;

use Symfony\\Component\\Serializer\\Normalizer\\NormalizerInterface;

class ProductNormalizer implements NormalizerInterface
{
    public function normalize($object, string $format = null, array $context = []): array
    {
        /** @var \\Product $object */
        return [
            'id' => (int)$object->id,
            'reference' => $object->reference,
            'name' => $object->name,
            'description' => strip_tags($object->description),
            'price' => [
                'amount' => (float)$object->price,
                'currency' => \\Context::getContext()->currency->iso_code,
                'tax_included' => (bool)$object->price_tax_inc,
            ],
            'stock' => [
                'quantity' => (int)$object->quantity,
                'available' => $object->quantity > 0,
            ],
            'active' => (bool)$object->active,
            'images' => $this->getImages($object->id),
            'category' => [
                'id' => (int)$object->id_category_default,
                'name' => (new \\Category($object->id_category_default))->name,
            ],
            'created_at' => $object->date_add,
            'updated_at' => $object->date_upd,
        ];
    }
    
    public function supportsNormalization($data, string $format = null): bool
    {
        return $data instanceof \\Product;
    }
    
    private function getImages(int $productId): array
    {
        $images = \\Image::getImages(\\Context::getContext()->language->id, $productId);
        
        return array_map(function($image) use ($productId) {
            return [
                'id' => (int)$image['id_image'],
                'url' => \\Context::getContext()->link->getImageLink(
                    'product',
                    $productId . '-' . $image['id_image'],
                    'large_default'
                ),
                'position' => (int)$image['position'],
            ];
        }, $images);
    }
}

// Registrar normalizer en services.yml
services:
    PrestaShop\\Module\\MyApi\\Serializer\\ProductNormalizer:
        tags: ['serializer.normalizer']
</code></pre>

        <h2 class="section-title">6. Callbacks y Context</h2>

        <pre><code class="language-php"><?php
class ProductController extends AbstractController
{
    public function get(int $id, Request $request): JsonResponse
    {
        $product = new \\Product($id);
        
        // Context con callbacks para filtrar propiedades
        $context = [
            'groups' => ['product:read'],
            'callbacks' => [
                'price' => function ($innerObject, $outerObject, string $attributeName, $format, array $context) {
                    // Aplicar descuento si usuario está autenticado
                    if ($this->getUser()) {
                        return $innerObject * 0.9; // 10% descuento
                    }
                    return $innerObject;
                },
            ],
            'circular_reference_handler' => function ($object) {
                return $object->getId();
            },
            'datetime_format' => 'Y-m-d H:i:s',
        ];
        
        $json = $this->serializer->serialize($product, 'json', $context);
        
        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }
}
</code></pre>

        <h2 class="section-title">7. Ignorar Propiedades</h2>

        <pre><code class="language-php"><?php
use Symfony\\Component\\Serializer\\Annotation\\Ignore;

class ProductDTO
{
    public int $id;
    public string $name;
    
    #[Ignore]
    public string $password; // Nunca se serializa
    
    #[Groups(['admin'])]
    public float $cost; // Solo para admin
}

// En controlador
public function get(int $id): JsonResponse
{
    $product = new \\Product($id);
    
    $context = ['groups' => ['product:read']];
    
    // Si es admin, incluir grupo 'admin'
    if ($this->isGranted('ROLE_ADMIN')) {
        $context['groups'][] = 'admin';
    }
    
    $json = $this->serializer->serialize($product, 'json', $context);
    
    return new JsonResponse($json, Response::HTTP_OK, [], true);
}
</code></pre>

        <h2 class="section-title">8. Formatos Múltiples</h2>

        <pre><code class="language-php"><?php
class ProductController extends AbstractController
{
    public function get(int $id, Request $request): Response
    {
        $product = new \\Product($id);
        
        // Detectar formato deseado
        $format = $request->query->get('format', 'json');
        $acceptHeader = $request->headers->get('Accept', 'application/json');
        
        if (str_contains($acceptHeader, 'application/xml')) {
            $format = 'xml';
        }
        
        $content = $this->serializer->serialize($product, $format);
        
        $contentType = $format === 'xml' ? 'application/xml' : 'application/json';
        
        return new Response($content, Response::HTTP_OK, [
            'Content-Type' => $contentType,
        ]);
    }
}
</code></pre>

        <h2 class="section-title">9. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Serialización:</strong>
            <ul class="mb-0">
                <li>Usar DTOs para controlar la salida</li>
                <li>Grupos para diferentes niveles de detalle</li>
                <li>Normalizers para objetos complejos</li>
                <li>Ignorar propiedades sensibles</li>
                <li>Formatear fechas consistentemente</li>
                <li>Cache de objetos serializados</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Evitar:</strong>
            <ul class="mb-0">
                <li>Serializar objetos con referencias circulares sin handler</li>
                <li>Exponer propiedades internas/sensibles</li>
                <li>Serializar toda la entidad sin filtrar</li>
                <li>No validar al deserializar</li>
            </ul>
        </div>
    </div>
`;

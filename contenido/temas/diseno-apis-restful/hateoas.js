// @ts-nocheck
const hateoas = `
    <div class="content-section">
        <h1 id="hateoas">HATEOAS (Hypermedia as the Engine of Application State)</h1>
        <p>HATEOAS es el principio REST que permite a los clientes navegar la API dinámicamente mediante enlaces en las respuestas. Nivel 3 de madurez REST en PrestaShop 8.9+.</p>

        <h2 class="section-title">1. Concepto de HATEOAS</h2>

        <div class="alert alert-info">
            <strong>💡 Principio:</strong> El servidor proporciona enlaces (hypermedia) que indican al cliente qué acciones puede realizar a continuación, eliminando la necesidad de hardcodear URLs en el cliente.
        </div>

        <h3>Sin HATEOAS vs Con HATEOAS</h3>

        <pre><code class="language-json">// ❌ Sin HATEOAS: Cliente debe conocer todas las URLs
{
    "id": 123,
    "name": "Product Name",
    "price": 29.99
}

// Cliente hardcodea: GET /api/products/123/images

// ✅ Con HATEOAS: Enlaces indican acciones disponibles
{
    "id": 123,
    "name": "Product Name",
    "price": 29.99,
    "_links": {
        "self": {"href": "/api/products/123"},
        "images": {"href": "/api/products/123/images"},
        "category": {"href": "/api/categories/5"},
        "update": {"href": "/api/products/123", "method": "PUT"},
        "delete": {"href": "/api/products/123", "method": "DELETE"}
    }
}
</code></pre>

        <h2 class="section-title">2. Implementación Básica</h2>

        <pre><code class="language-php"><?php
class HateoasLinksBuilder
{
    private Context $context;
    
    public function __construct()
    {
        $this->context = Context::getContext();
    }
    
    public function buildProductLinks(int $productId): array
    {
        $baseUrl = $this->context->link->getModuleLink('myapi', 'products');
        
        return [
            'self' => [
                'href' => "$baseUrl/$productId",
                'method' => 'GET',
            ],
            'update' => [
                'href' => "$baseUrl/$productId",
                'method' => 'PUT',
            ],
            'delete' => [
                'href' => "$baseUrl/$productId",
                'method' => 'DELETE',
            ],
            'images' => [
                'href' => "$baseUrl/$productId/images",
                'method' => 'GET',
            ],
            'stock' => [
                'href' => "$baseUrl/$productId/stock",
                'method' => 'GET',
            ],
        ];
    }
}

// En controlador
public function getProduct(int $id)
{
    $product = new Product($id, true, $this->context->language->id);
    
    $linksBuilder = new HateoasLinksBuilder();
    
    $response = [
        'id' => (int)$product->id,
        'name' => $product->name,
        'price' => (float)$product->price,
        'quantity' => (int)$product->quantity,
        '_links' => $linksBuilder->buildProductLinks($id),
    ];
    
    $this->ajaxDie(json_encode($response, JSON_PRETTY_PRINT));
}
</code></pre>

        <h2 class="section-title">3. HAL (Hypertext Application Language)</h2>

        <pre><code class="language-php"><?php
class HALFormatter
{
    public function formatProduct(Product $product): array
    {
        return [
            '_links' => [
                'self' => ['href' => '/api/products/' . $product->id],
                'category' => ['href' => '/api/categories/' . $product->id_category_default],
                'manufacturer' => ['href' => '/api/manufacturers/' . $product->id_manufacturer],
            ],
            '_embedded' => [
                'images' => $this->getEmbeddedImages($product->id),
            ],
            'id' => (int)$product->id,
            'name' => $product->name,
            'reference' => $product->reference,
            'price' => (float)$product->price,
            'quantity' => (int)$product->quantity,
        ];
    }
    
    private function getEmbeddedImages(int $productId): array
    {
        $images = Image::getImages(Context::getContext()->language->id, $productId);
        
        return array_map(function($image) use ($productId) {
            return [
                '_links' => [
                    'self' => ['href' => '/api/images/' . $image['id_image']],
                ],
                'id' => (int)$image['id_image'],
                'url' => $this->getImageUrl($productId, $image['id_image']),
            ];
        }, $images);
    }
}
</code></pre>

        <h2 class="section-title">4. JSON:API Format</h2>

        <pre><code class="language-php"><?php
class JsonApiFormatter
{
    public function formatProduct(Product $product): array
    {
        return [
            'data' => [
                'type' => 'products',
                'id' => (string)$product->id,
                'attributes' => [
                    'name' => $product->name,
                    'reference' => $product->reference,
                    'price' => (float)$product->price,
                    'quantity' => (int)$product->quantity,
                ],
                'relationships' => [
                    'category' => [
                        'links' => [
                            'self' => '/api/products/' . $product->id . '/relationships/category',
                            'related' => '/api/categories/' . $product->id_category_default,
                        ],
                        'data' => [
                            'type' => 'categories',
                            'id' => (string)$product->id_category_default,
                        ],
                    ],
                    'images' => [
                        'links' => [
                            'self' => '/api/products/' . $product->id . '/relationships/images',
                            'related' => '/api/products/' . $product->id . '/images',
                        ],
                    ],
                ],
                'links' => [
                    'self' => '/api/products/' . $product->id,
                ],
            ],
            'links' => [
                'self' => '/api/products/' . $product->id,
            ],
        ];
    }
}
</code></pre>

        <h2 class="section-title">5. Enlaces Condicionales</h2>

        <pre><code class="language-php"><?php
class ConditionalLinksBuilder
{
    public function buildLinks(Product $product, Employee $user): array
    {
        $links = [
            'self' => ['href' => '/api/products/' . $product->id],
        ];
        
        // Solo si tiene permisos de edición
        if ($this->canEdit($user)) {
            $links['update'] = [
                'href' => '/api/products/' . $product->id,
                'method' => 'PUT',
            ];
        }
        
        // Solo si tiene permisos de eliminación
        if ($this->canDelete($user)) {
            $links['delete'] = [
                'href' => '/api/products/' . $product->id,
                'method' => 'DELETE',
            ];
        }
        
        // Solo si el producto está activo
        if ($product->active) {
            $links['purchase'] = [
                'href' => '/api/cart/add',
                'method' => 'POST',
            ];
        }
        
        // Solo si tiene stock
        if ($product->quantity > 0) {
            $links['add_to_cart'] = [
                'href' => '/api/cart/items',
                'method' => 'POST',
            ];
        } else {
            $links['notify_restock'] = [
                'href' => '/api/products/' . $product->id . '/notify',
                'method' => 'POST',
            ];
        }
        
        return $links;
    }
    
    private function canEdit(Employee $user): bool
    {
        return $user->hasPermission('EDIT_PRODUCT');
    }
    
    private function canDelete(Employee $user): bool
    {
        return $user->hasPermission('DELETE_PRODUCT');
    }
}
</code></pre>

        <h2 class="section-title">6. Acciones de Formulario</h2>

        <pre><code class="language-php"><?php
// Describir formularios y validaciones en los enlaces
public function getProductForm(int $id)
{
    $response = [
        '_links' => [
            'self' => ['href' => '/api/products/' . $id . '/form'],
            'submit' => [
                'href' => '/api/products/' . $id,
                'method' => 'PUT',
                'schema' => [
                    'type' => 'object',
                    'required' => ['name', 'price'],
                    'properties' => [
                        'name' => [
                            'type' => 'string',
                            'minLength' => 3,
                            'maxLength' => 128,
                        ],
                        'price' => [
                            'type' => 'number',
                            'minimum' => 0,
                        ],
                        'quantity' => [
                            'type' => 'integer',
                            'minimum' => 0,
                        ],
                        'active' => [
                            'type' => 'boolean',
                        ],
                    ],
                ],
            ],
        ],
    ];
    
    $this->ajaxDie(json_encode($response, JSON_PRETTY_PRINT));
}
</code></pre>

        <h2 class="section-title">7. Navegación de Colecciones</h2>

        <pre><code class="language-php"><?php
public function getProducts()
{
    $page = (int)($_GET['page'] ?? 1);
    $limit = 20;
    $offset = ($page - 1) * $limit;
    
    $products = Product::getProducts(
        $this->context->language->id,
        $offset,
        $limit
    );
    
    $total = Product::getNbProducts();
    $totalPages = ceil($total / $limit);
    
    $response = [
        '_links' => [
            'self' => ['href' => "/api/products?page=$page&limit=$limit"],
            'first' => ['href' => "/api/products?page=1&limit=$limit"],
            'last' => ['href' => "/api/products?page=$totalPages&limit=$limit"],
        ],
        '_embedded' => [
            'products' => array_map(function($product) {
                return [
                    'id' => $product['id_product'],
                    'name' => $product['name'],
                    '_links' => [
                        'self' => ['href' => '/api/products/' . $product['id_product']],
                    ],
                ];
            }, $products),
        ],
        'total' => $total,
        'page' => $page,
        'per_page' => $limit,
    ];
    
    // Enlaces prev/next
    if ($page > 1) {
        $response['_links']['prev'] = [
            'href' => "/api/products?page=" . ($page - 1) . "&limit=$limit",
        ];
    }
    
    if ($page < $totalPages) {
        $response['_links']['next'] = [
            'href' => "/api/products?page=" . ($page + 1) . "&limit=$limit",
        ];
    }
    
    $this->ajaxDie(json_encode($response, JSON_PRETTY_PRINT));
}
</code></pre>

        <h2 class="section-title">8. Ventajas y Desventajas</h2>

        <div class="row">
            <div class="col-md-6">
                <h4>✅ Ventajas</h4>
                <ul>
                    <li>Cliente no hardcodea URLs</li>
                    <li>API autodescriptiva</li>
                    <li>Fácil evolución de la API</li>
                    <li>Descubrimiento dinámico</li>
                    <li>Mejor documentación implícita</li>
                </ul>
            </div>
            <div class="col-md-6">
                <h4>⚠️ Desventajas</h4>
                <ul>
                    <li>Respuestas más grandes</li>
                    <li>Mayor complejidad de implementación</li>
                    <li>Soporte limitado en clientes</li>
                    <li>Overhead de procesamiento</li>
                    <li>Curva de aprendizaje</li>
                </ul>
            </div>
        </div>

        <h2 class="section-title">9. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Recomendaciones:</strong>
            <ul class="mb-0">
                <li>Usar HAL o JSON:API para formato estándar</li>
                <li>Incluir enlaces condicionales según permisos</li>
                <li>Documentar estructura de enlaces</li>
                <li>Proporcionar enlaces de navegación</li>
                <li>Incluir métodos HTTP en enlaces</li>
                <li>Considerar cache de respuestas con enlaces</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Consideración:</strong> HATEOAS es opcional. Para APIs simples o públicas, puede ser overkill. Implementar solo si aporta valor real al cliente de la API.
        </div>
    </div>
`;

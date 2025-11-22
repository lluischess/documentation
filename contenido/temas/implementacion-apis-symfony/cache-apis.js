// @ts-nocheck
const cacheAPIs = `
    <div class="content-section">
        <h1 id="cache-apis">Caché de APIs con Varnish o Symfony Cache Component</h1>
        <p>Optimizar performance de APIs mediante cache HTTP, Symfony Cache y Varnish en PrestaShop 8.9+.</p>

        <h2 class="section-title">1. HTTP Cache Headers</h2>

        <pre><code class="language-php"><?php
class ProductController extends AbstractController
{
    public function list(): Response
    {
        $products = $this->getProducts();
        
        $response = $this->json(['data' => $products]);
        
        // Cache pública por 1 hora
        $response->setPublic();
        $response->setMaxAge(3600);
        
        // Shared cache (CDN/Varnish)
        $response->setSharedMaxAge(3600);
        
        return $response;
    }
    
    public function get(int $id): Response
    {
        $product = new \\Product($id);
        
        $response = $this->json(['data' => $product]);
        
        // ETag basado en fecha de modificación
        $response->setEtag(md5($product->date_upd));
        $response->setLastModified(new \\DateTime($product->date_upd));
        
        // Validación de caché
        $response->isNotModified($this->get('request_stack')->getCurrentRequest());
        
        return $response;
    }
    
    public function create(Request $request): Response
    {
        // POST no debe cachearse
        $response = $this->json(['data' => $newProduct], Response::HTTP_CREATED);
        
        $response->setPrivate();
        $response->headers->addCacheControlDirective('no-cache');
        
        return $response;
    }
}
</code></pre>

        <h2 class="section-title">2. Symfony HTTP Cache</h2>

        <pre><code class="language-php"><?php
// public/index.php
use Symfony\\Component\\HttpFoundation\\Request;
use Symfony\\Component\\HttpKernel\\HttpCache\\HttpCache;
use Symfony\\Component\\HttpKernel\\HttpCache\\Store;

require_once dirname(__DIR__).'/vendor/autoload_runtime.php';

return function (array $context) {
    $kernel = new Kernel($context['APP_ENV'], (bool) $context['APP_DEBUG']);
    
    // Envolver con HTTP Cache
    $kernel = new HttpCache(
        $kernel,
        new Store(__DIR__.'/../var/cache/http'),
        null,
        ['debug' => $context['APP_DEBUG']]
    );
    
    return $kernel;
};
</code></pre>

        <h2 class="section-title">3. Symfony Cache Component</h2>

        <pre><code class="language-php"><?php
use Symfony\\Contracts\\Cache\\CacheInterface;
use Symfony\\Contracts\\Cache\\ItemInterface;

class ProductService
{
    private CacheInterface $cache;
    
    public function __construct(CacheInterface $cache)
    {
        $this->cache = $cache;
    }
    
    public function getProducts(): array
    {
        return $this->cache->get('products_list', function (ItemInterface $item) {
            // Cache por 1 hora
            $item->expiresAfter(3600);
            
            // Tags para invalidación
            $item->tag(['products']);
            
            // Obtener datos
            return \\Product::getProducts(
                \\Context::getContext()->language->id,
                0,
                100
            );
        });
    }
    
    public function getProduct(int $id): array
    {
        return $this->cache->get("product_{$id}", function (ItemInterface $item) use ($id) {
            $item->expiresAfter(3600);
            $item->tag(['products', "product_{$id}"]);
            
            $product = new \\Product($id);
            
            return [
                'id' => $product->id,
                'name' => $product->name,
                'price' => (float)$product->price,
            ];
        });
    }
    
    public function invalidateProduct(int $id): void
    {
        // Invalidar por tag
        $this->cache->invalidateTags(["product_{$id}", 'products']);
    }
}
</code></pre>

        <h2 class="section-title">4. Cache Pools</h2>

        <pre><code class="language-yaml"># config/packages/cache.yaml
framework:
    cache:
        app: cache.adapter.redis
        default_redis_provider: 'redis://localhost:6379'
        
        pools:
            cache.api_products:
                adapter: cache.adapter.redis
                default_lifetime: 3600
            
            cache.api_categories:
                adapter: cache.adapter.redis
                default_lifetime: 7200
</code></pre>

        <pre><code class="language-php"><?php
use Psr\\Cache\\CacheItemPoolInterface;

class ProductService
{
    private CacheItemPoolInterface $productsCache;
    
    public function __construct(CacheItemPoolInterface $productsCache)
    {
        $this->productsCache = $productsCache;
    }
    
    public function getProducts(): array
    {
        $cacheItem = $this->productsCache->getItem('products_list');
        
        if (!$cacheItem->isHit()) {
            $products = \\Product::getProducts(
                \\Context::getContext()->language->id,
                0,
                100
            );
            
            $cacheItem->set($products);
            $cacheItem->expiresAfter(3600);
            
            $this->productsCache->save($cacheItem);
        }
        
        return $cacheItem->get();
    }
}
</code></pre>

        <h2 class="section-title">5. Varnish Configuration</h2>

        <pre><code class="language-vcl"># /etc/varnish/default.vcl
vcl 4.1;

backend default {
    .host = "127.0.0.1";
    .port = "8080";
}

sub vcl_recv {
    # No cachear POST, PUT, DELETE
    if (req.method != "GET" && req.method != "HEAD") {
        return (pass);
    }
    
    # No cachear con Authorization header
    if (req.http.Authorization) {
        return (pass);
    }
    
    # Normalizar Accept-Encoding
    if (req.http.Accept-Encoding) {
        if (req.http.Accept-Encoding ~ "gzip") {
            set req.http.Accept-Encoding = "gzip";
        } else if (req.http.Accept-Encoding ~ "deflate") {
            set req.http.Accept-Encoding = "deflate";
        } else {
            unset req.http.Accept-Encoding;
        }
    }
    
    return (hash);
}

sub vcl_backend_response {
    # Cachear respuestas exitosas
    if (beresp.status == 200 || beresp.status == 301 || beresp.status == 404) {
        set beresp.ttl = 1h;
    }
    
    # Añadir header para debug
    set beresp.http.X-Varnish-TTL = beresp.ttl;
}

sub vcl_deliver {
    # Header de debug (HIT/MISS)
    if (obj.hits > 0) {
        set resp.http.X-Cache = "HIT";
    } else {
        set resp.http.X-Cache = "MISS";
    }
    
    set resp.http.X-Cache-Hits = obj.hits;
}

# Purge específico
sub vcl_purge {
    return (synth(200, "Purged"));
}
</code></pre>

        <h2 class="section-title">6. Cache Invalidation</h2>

        <pre><code class="language-php"><?php
// src/Service/CacheInvalidationService.php
namespace PrestaShop\\Module\\MyApi\\Service;

use Symfony\\Contracts\\Cache\\TagAwareCacheInterface;
use Symfony\\Contracts\\HttpClient\\HttpClientInterface;

class CacheInvalidationService
{
    private TagAwareCacheInterface $cache;
    private HttpClientInterface $httpClient;
    private string $varnishHost;
    
    public function __construct(
        TagAwareCacheInterface $cache,
        HttpClientInterface $httpClient,
        string $varnishHost = 'http://127.0.0.1:6081'
    ) {
        $this->cache = $cache;
        $this->httpClient = $httpClient;
        $this->varnishHost = $varnishHost;
    }
    
    public function invalidateProduct(int $productId): void
    {
        // Invalidar en Symfony Cache
        $this->cache->invalidateTags(["product_{$productId}", 'products']);
        
        // Purge en Varnish
        $this->purgeVarnish("/api/products/{$productId}");
        $this->purgeVarnish("/api/products");
    }
    
    public function invalidateAll(): void
    {
        $this->cache->invalidateTags(['products']);
        $this->purgeVarnish("/api/.*");
    }
    
    private function purgeVarnish(string $path): void
    {
        try {
            $this->httpClient->request('PURGE', $this->varnishHost . $path);
        } catch (\\Exception $e) {
            // Log error pero no fallar
            error_log('Varnish purge failed: ' . $e->getMessage());
        }
    }
}

// Hook de PrestaShop
class MyApi extends Module
{
    public function hookActionObjectProductUpdateAfter(array $params): void
    {
        $product = $params['object'];
        
        $this->get('cache_invalidation_service')
             ->invalidateProduct($product->id);
    }
    
    public function hookActionObjectProductDeleteAfter(array $params): void
    {
        $product = $params['object'];
        
        $this->get('cache_invalidation_service')
             ->invalidateProduct($product->id);
    }
}
</code></pre>

        <h2 class="section-title">7. ESI (Edge Side Includes)</h2>

        <pre><code class="language-php"><?php
class ProductController extends AbstractController
{
    public function show(int $id): Response
    {
        $product = new \\Product($id);
        
        $response = $this->render('product/show.html.twig', [
            'product' => $product,
        ]);
        
        // Cache de página principal por 1 hora
        $response->setPublic();
        $response->setSharedMaxAge(3600);
        
        return $response;
    }
    
    public function stock(int $id): Response
    {
        $product = new \\Product($id);
        
        $response = $this->json(['quantity' => $product->quantity]);
        
        // Stock cambia frecuentemente, cache corto
        $response->setPublic();
        $response->setSharedMaxAge(60);
        
        return $response;
    }
}

// Template con ESI
// <esi:include src="/api/products/{{ product.id }}/stock" />
</code></pre>

        <h2 class="section-title">8. Vary Header</h2>

        <pre><code class="language-php"><?php
class ProductController extends AbstractController
{
    public function list(Request $request): Response
    {
        $language = $request->headers->get('Accept-Language');
        $currency = $request->headers->get('X-Currency');
        
        $products = $this->getProducts($language, $currency);
        
        $response = $this->json(['data' => $products]);
        
        // Cachear variantes por idioma y moneda
        $response->setVary(['Accept-Language', 'X-Currency']);
        $response->setPublic();
        $response->setMaxAge(3600);
        
        return $response;
    }
}
</code></pre>

        <h2 class="section-title">9. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Cache de APIs:</strong>
            <ul class="mb-0">
                <li>GET: Cacheable, POST/PUT/DELETE: No cacheable</li>
                <li>ETags para validación de cache</li>
                <li>Cache-Control headers apropiados</li>
                <li>Tags para invalidación granular</li>
                <li>Varnish para alta escala</li>
                <li>ESI para componentes con diferentes TTL</li>
                <li>Vary header para contenido personalizado</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>📊 TTL Recomendados:</strong>
            <table class="table table-sm">
                <tr>
                    <th>Tipo de Dato</th>
                    <th>TTL</th>
                </tr>
                <tr>
                    <td>Productos (info estática)</td>
                    <td>1-4 horas</td>
                </tr>
                <tr>
                    <td>Stock/Precios</td>
                    <td>1-5 minutos</td>
                </tr>
                <tr>
                    <td>Categorías</td>
                    <td>2-6 horas</td>
                </tr>
                <tr>
                    <td>Configuración</td>
                    <td>12-24 horas</td>
                </tr>
                <tr>
                    <td>Pedidos de usuario</td>
                    <td>No cachear</td>
                </tr>
            </table>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Consideraciones:</strong>
            <ul class="mb-0">
                <li>No cachear datos sensibles o personalizados</li>
                <li>Invalidar cache al actualizar datos</li>
                <li>Monitorizar hit rate del cache</li>
                <li>Configurar límites de memoria</li>
            </ul>
        </div>
    </div>
`;

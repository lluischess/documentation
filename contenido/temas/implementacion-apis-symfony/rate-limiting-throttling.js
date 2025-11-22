// @ts-nocheck
const rateLimitingThrottling = `
    <div class="content-section">
        <h1 id="rate-limiting-throttling">Rate Limiting y Throttling</h1>
        <p>Proteger APIs contra abuso mediante limitación de peticiones. Implementación con Symfony en PrestaShop 8.9+.</p>

        <h2 class="section-title">1. Symfony Rate Limiter Component</h2>

        <pre><code class="language-bash">composer require symfony/rate-limiter
</code></pre>

        <pre><code class="language-yaml"># config/packages/rate_limiter.yaml
framework:
    rate_limiter:
        # Límite global por IP
        api_global:
            policy: 'sliding_window'
            limit: 1000
            interval: '1 hour'
        
        # Límite por usuario autenticado
        api_user:
            policy: 'token_bucket'
            limit: 100
            rate: { interval: '1 minute' }
        
        # Límite estricto para login
        api_login:
            policy: 'fixed_window'
            limit: 5
            interval: '15 minutes'
</code></pre>

        <h2 class="section-title">2. Event Listener</h2>

        <pre><code class="language-php"><?php
// src/EventListener/RateLimitListener.php
namespace PrestaShop\\Module\\MyApi\\EventListener;

use Symfony\\Component\\HttpFoundation\\JsonResponse;
use Symfony\\Component\\HttpKernel\\Event\\RequestEvent;
use Symfony\\Component\\RateLimiter\\RateLimiterFactory;
use Symfony\\Component\\HttpKernel\\Exception\\TooManyRequestsHttpException;

class RateLimitListener
{
    private RateLimiterFactory $globalLimiter;
    private RateLimiterFactory $userLimiter;
    private RateLimiterFactory $loginLimiter;
    
    public function __construct(
        RateLimiterFactory $apiGlobalLimiter,
        RateLimiterFactory $apiUserLimiter,
        RateLimiterFactory $apiLoginLimiter
    ) {
        $this->globalLimiter = $apiGlobalLimiter;
        $this->userLimiter = $apiUserLimiter;
        $this->loginLimiter = $apiLoginLimiter;
    }
    
    public function onKernelRequest(RequestEvent $event): void
    {
        $request = $event->getRequest();
        
        // Solo para rutas API
        if (!str_starts_with($request->getPathInfo(), '/api/')) {
            return;
        }
        
        // Rate limit por IP (global)
        $limiter = $this->globalLimiter->create($request->getClientIp());
        
        // Rate limit especial para login
        if ($request->getPathInfo() === '/api/login') {
            $limiter = $this->loginLimiter->create($request->getClientIp());
        }
        
        // Rate limit por usuario si está autenticado
        if ($user = $this->getUser()) {
            $limiter = $this->userLimiter->create('user_' . $user->getId());
        }
        
        // Consumir token
        $limit = $limiter->consume(1);
        
        // Headers de rate limit
        $event->getResponse()?->headers->set('X-RateLimit-Limit', $limit->getLimit());
        $event->getResponse()?->headers->set('X-RateLimit-Remaining', $limit->getRemainingTokens());
        $event->getResponse()?->headers->set('X-RateLimit-Reset', $limit->getRetryAfter()?->getTimestamp());
        
        // Si excede el límite
        if (!$limit->isAccepted()) {
            throw new TooManyRequestsHttpException(
                $limit->getRetryAfter()->getTimestamp() - time(),
                'Rate limit exceeded'
            );
        }
    }
}

// services.yml
services:
    PrestaShop\\Module\\MyApi\\EventListener\\RateLimitListener:
        arguments:
            $apiGlobalLimiter: '@limiter.api_global'
            $apiUserLimiter: '@limiter.api_user'
            $apiLoginLimiter: '@limiter.api_login'
        tags:
            - { name: kernel.event_listener, event: kernel.request, priority: 10 }
</code></pre>

        <h2 class="section-title">3. Implementación Manual</h2>

        <pre><code class="language-php"><?php
// src/Service/RateLimitService.php
namespace PrestaShop\\Module\\MyApi\\Service;

class RateLimitService
{
    private const WINDOW = 3600; // 1 hora
    
    public function checkLimit(string $identifier, int $maxRequests = 1000): bool
    {
        $key = 'rate_limit_' . md5($identifier);
        $cache = \\Cache::getInstance();
        
        $data = $cache->get($key);
        
        if (!$data) {
            $data = [
                'count' => 0,
                'reset_at' => time() + self::WINDOW,
            ];
        }
        
        // Resetear si la ventana expiró
        if (time() > $data['reset_at']) {
            $data = [
                'count' => 0,
                'reset_at' => time() + self::WINDOW,
            ];
        }
        
        $data['count']++;
        $cache->set($key, $data, self::WINDOW);
        
        return $data['count'] <= $maxRequests;
    }
    
    public function getRemainingRequests(string $identifier, int $maxRequests = 1000): int
    {
        $key = 'rate_limit_' . md5($identifier);
        $data = \\Cache::getInstance()->get($key);
        
        if (!$data) {
            return $maxRequests;
        }
        
        return max(0, $maxRequests - $data['count']);
    }
    
    public function getResetTime(string $identifier): int
    {
        $key = 'rate_limit_' . md5($identifier);
        $data = \\Cache::getInstance()->get($key);
        
        return $data['reset_at'] ?? time() + self::WINDOW;
    }
}

// Uso en controlador
class ProductController extends AbstractController
{
    public function list(Request $request, RateLimitService $rateLimiter): JsonResponse
    {
        $identifier = $request->getClientIp();
        
        if (!$rateLimiter->checkLimit($identifier, 100)) {
            return $this->json([
                'error' => 'Too Many Requests',
                'retry_after' => $rateLimiter->getResetTime($identifier) - time(),
            ], Response::HTTP_TOO_MANY_REQUESTS);
        }
        
        // Añadir headers
        $response = $this->json(['data' => []]);
        $response->headers->set('X-RateLimit-Limit', 100);
        $response->headers->set('X-RateLimit-Remaining', $rateLimiter->getRemainingRequests($identifier, 100));
        $response->headers->set('X-RateLimit-Reset', $rateLimiter->getResetTime($identifier));
        
        return $response;
    }
}
</code></pre>

        <h2 class="section-title">4. Rate Limiting por Endpoint</h2>

        <pre><code class="language-php"><?php
// Atributo personalizado
namespace PrestaShop\\Module\\MyApi\\Attribute;

use Attribute;

#[Attribute(Attribute::TARGET_METHOD)]
class RateLimit
{
    public function __construct(
        public int $limit,
        public int $period = 3600
    ) {}
}

// Uso en controlador
class ProductController extends AbstractController
{
    #[Route('', methods: ['GET'])]
    #[RateLimit(limit: 100, period: 60)] // 100 req/min
    public function list(): JsonResponse
    {
        // ...
    }
    
    #[Route('', methods: ['POST'])]
    #[RateLimit(limit: 10, period: 60)] // 10 req/min para escritura
    public function create(): JsonResponse
    {
        // ...
    }
}

// Event Subscriber para procesar atributo
use Symfony\\Component\\HttpKernel\\Event\\ControllerEvent;

class RateLimitSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::CONTROLLER => 'onKernelController',
        ];
    }
    
    public function onKernelController(ControllerEvent $event): void
    {
        $controller = $event->getController();
        
        if (!is_array($controller)) {
            return;
        }
        
        $reflection = new \\ReflectionMethod($controller[0], $controller[1]);
        $attributes = $reflection->getAttributes(RateLimit::class);
        
        if (empty($attributes)) {
            return;
        }
        
        $rateLimit = $attributes[0]->newInstance();
        
        // Aplicar rate limit...
    }
}
</code></pre>

        <h2 class="section-title">5. Throttling Dinámico</h2>

        <pre><code class="language-php"><?php
class DynamicRateLimitService
{
    public function getLimit(\\Employee $user): int
    {
        // Límites diferentes por rol
        if (in_array('ROLE_ADMIN', $user->getRoles())) {
            return 10000; // 10k req/hora
        }
        
        if (in_array('ROLE_PREMIUM', $user->getRoles())) {
            return 5000; // 5k req/hora
        }
        
        return 1000; // 1k req/hora por defecto
    }
    
    public function getEndpointLimit(string $endpoint, \\Employee $user): int
    {
        // Límites específicos por endpoint
        $limits = [
            '/api/products' => 500,
            '/api/orders' => 100,
            '/api/customers' => 200,
        ];
        
        $baseLimit = $limits[$endpoint] ?? 1000;
        
        // Multiplicador por plan
        if (in_array('ROLE_PREMIUM', $user->getRoles())) {
            $baseLimit *= 5;
        }
        
        return $baseLimit;
    }
}
</code></pre>

        <h2 class="section-title">6. Sliding Window con Redis</h2>

        <pre><code class="language-php"><?php
class RedisRateLimitService
{
    private \\Redis $redis;
    
    public function __construct()
    {
        $this->redis = new \\Redis();
        $this->redis->connect('127.0.0.1', 6379);
    }
    
    public function checkLimit(string $key, int $maxRequests, int $window): bool
    {
        $now = microtime(true);
        $clearBefore = $now - $window;
        
        // Usar sorted set para sliding window
        $this->redis->zRemRangeByScore($key, 0, $clearBefore);
        
        $count = $this->redis->zCard($key);
        
        if ($count < $maxRequests) {
            $this->redis->zAdd($key, $now, $now);
            $this->redis->expire($key, $window);
            return true;
        }
        
        return false;
    }
    
    public function getRemainingRequests(string $key, int $maxRequests, int $window): int
    {
        $now = microtime(true);
        $clearBefore = $now - $window;
        
        $this->redis->zRemRangeByScore($key, 0, $clearBefore);
        $count = $this->redis->zCard($key);
        
        return max(0, $maxRequests - $count);
    }
}
</code></pre>

        <h2 class="section-title">7. Bypass para IPs de Confianza</h2>

        <pre><code class="language-php"><?php
class RateLimitListener
{
    private array $whitelistedIps = [
        '127.0.0.1',
        '192.168.1.0/24',
    ];
    
    public function onKernelRequest(RequestEvent $event): void
    {
        $request = $event->getRequest();
        $clientIp = $request->getClientIp();
        
        // Bypass para IPs de confianza
        if ($this->isWhitelisted($clientIp)) {
            return;
        }
        
        // Aplicar rate limiting...
    }
    
    private function isWhitelisted(string $ip): bool
    {
        foreach ($this->whitelistedIps as $whitelisted) {
            if (str_contains($whitelisted, '/')) {
                // CIDR notation
                if ($this->ipInRange($ip, $whitelisted)) {
                    return true;
                }
            } elseif ($ip === $whitelisted) {
                return true;
            }
        }
        
        return false;
    }
    
    private function ipInRange(string $ip, string $range): bool
    {
        [$subnet, $mask] = explode('/', $range);
        
        $ip_long = ip2long($ip);
        $subnet_long = ip2long($subnet);
        $mask_long = ~((1 << (32 - $mask)) - 1);
        
        return ($ip_long & $mask_long) === ($subnet_long & $mask_long);
    }
}
</code></pre>

        <h2 class="section-title">8. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Rate Limiting:</strong>
            <ul class="mb-0">
                <li>Usar Symfony Rate Limiter para implementación estándar</li>
                <li>Headers de rate limit en todas las respuestas</li>
                <li>Diferentes límites por rol/plan</li>
                <li>Límites más estrictos para operaciones de escritura</li>
                <li>Sliding window para distribución uniforme</li>
                <li>Redis para alta escala</li>
                <li>Whitelist para servicios internos</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>📊 Headers Estándar:</strong>
            <pre class="mb-0">X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
Retry-After: 3600</pre>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Políticas:</strong>
            <ul class="mb-0">
                <li><strong>Fixed Window:</strong> Simple pero puede tener picos al cambio de ventana</li>
                <li><strong>Sliding Window:</strong> Más uniforme, recomendado para producción</li>
                <li><strong>Token Bucket:</strong> Permite ráfagas controladas</li>
            </ul>
        </div>
    </div>
`;

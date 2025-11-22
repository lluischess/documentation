// @ts-nocheck
const consumoAPIsExternas = `
    <div class="content-section">
        <h1 id="consumo-apis-externas">Consumo de APIs Externas (Symfony HttpClient)</h1>
        <p>Integrar servicios externos mediante Symfony HttpClient en PrestaShop 8.9+. Manejo de requests, responses, errores y autenticación.</p>

        <h2 class="section-title">1. Instalación y Configuración</h2>

        <pre><code class="language-bash">composer require symfony/http-client
</code></pre>

        <pre><code class="language-yaml"># config/packages/framework.yaml
framework:
    http_client:
        max_host_connections: 10
        default_options:
            timeout: 30
            max_redirects: 3
            headers:
                'User-Agent': 'PrestaShop/8.9 HttpClient'
        
        scoped_clients:
            # Cliente para Stripe
            stripe.client:
                base_uri: 'https://api.stripe.com'
                headers:
                    'Authorization': 'Bearer %env(STRIPE_API_KEY)%'
            
            # Cliente para API externa
            external_api.client:
                base_uri: '%env(EXTERNAL_API_URL)%'
                timeout: 10
</code></pre>

        <h2 class="section-title">2. Uso Básico</h2>

        <pre><code class="language-php"><?php
use Symfony\\Contracts\\HttpClient\\HttpClientInterface;

class ExternalApiService
{
    private HttpClientInterface $httpClient;
    
    public function __construct(HttpClientInterface $httpClient)
    {
        $this->httpClient = $httpClient;
    }
    
    // GET request
    public function getProducts(): array
    {
        $response = $this->httpClient->request('GET', 'https://api.example.com/products', [
            'query' => [
                'page' => 1,
                'limit' => 20,
            ],
            'headers' => [
                'Accept' => 'application/json',
            ],
        ]);
        
        // Status code
        $statusCode = $response->getStatusCode();
        
        // Headers
        $contentType = $response->getHeaders()['content-type'][0];
        
        // Body como array
        $data = $response->toArray();
        
        return $data;
    }
    
    // POST request
    public function createProduct(array $data): array
    {
        $response = $this->httpClient->request('POST', 'https://api.example.com/products', [
            'json' => $data, // Automáticamente serializa a JSON
            'headers' => [
                'Authorization' => 'Bearer ' . $this->getApiToken(),
            ],
        ]);
        
        return $response->toArray();
    }
    
    // PUT request
    public function updateProduct(int $id, array $data): array
    {
        $response = $this->httpClient->request('PUT', "https://api.example.com/products/{$id}", [
            'json' => $data,
        ]);
        
        return $response->toArray();
    }
    
    // DELETE request
    public function deleteProduct(int $id): bool
    {
        $response = $this->httpClient->request('DELETE', "https://api.example.com/products/{$id}");
        
        return $response->getStatusCode() === 204;
    }
}
</code></pre>

        <h2 class="section-title">3. Manejo de Errores</h2>

        <pre><code class="language-php"><?php
use Symfony\\Contracts\\HttpClient\\Exception\\ClientExceptionInterface;
use Symfony\\Contracts\\HttpClient\\Exception\\ServerExceptionInterface;
use Symfony\\Contracts\\HttpClient\\Exception\\TransportExceptionInterface;

class ExternalApiService
{
    public function getProduct(int $id): ?array
    {
        try {
            $response = $this->httpClient->request(
                'GET',
                "https://api.example.com/products/{$id}"
            );
            
            return $response->toArray();
            
        } catch (ClientExceptionInterface $e) {
            // 4xx errors
            $statusCode = $e->getResponse()->getStatusCode();
            
            if ($statusCode === 404) {
                return null;
            }
            
            throw new ApiException("Client error: " . $e->getMessage(), $statusCode);
            
        } catch (ServerExceptionInterface $e) {
            // 5xx errors
            throw new ApiException("Server error: " . $e->getMessage(), 500);
            
        } catch (TransportExceptionInterface $e) {
            // Network errors
            throw new ApiException("Network error: " . $e->getMessage(), 503);
        }
    }
    
    public function safeRequest(string $url): ?array
    {
        try {
            $response = $this->httpClient->request('GET', $url);
            
            // Verificar status antes de obtener contenido
            if ($response->getStatusCode() >= 400) {
                return null;
            }
            
            return $response->toArray(false); // false = no lanzar excepción
            
        } catch (\\Exception $e) {
            error_log("API request failed: " . $e->getMessage());
            return null;
        }
    }
}
</code></pre>

        <h2 class="section-title">4. Autenticación</h2>

        <pre><code class="language-php"><?php
// Bearer Token
class ApiClientService
{
    private string $apiToken;
    
    public function request(string $method, string $url, array $options = []): array
    {
        $options['headers']['Authorization'] = 'Bearer ' . $this->apiToken;
        
        $response = $this->httpClient->request($method, $url, $options);
        
        return $response->toArray();
    }
}

// Basic Auth
$response = $this->httpClient->request('GET', 'https://api.example.com/data', [
    'auth_basic' => ['username', 'password'],
]);

// OAuth2
class OAuth2ClientService
{
    private string $accessToken;
    private string $refreshToken;
    
    public function request(string $method, string $url, array $options = []): array
    {
        // Verificar si el token expiró
        if ($this->isTokenExpired()) {
            $this->refreshAccessToken();
        }
        
        $options['headers']['Authorization'] = 'Bearer ' . $this->accessToken;
        
        try {
            $response = $this->httpClient->request($method, $url, $options);
            return $response->toArray();
            
        } catch (ClientExceptionInterface $e) {
            if ($e->getResponse()->getStatusCode() === 401) {
                // Token inválido, refrescar y reintentar
                $this->refreshAccessToken();
                
                $options['headers']['Authorization'] = 'Bearer ' . $this->accessToken;
                $response = $this->httpClient->request($method, $url, $options);
                
                return $response->toArray();
            }
            
            throw $e;
        }
    }
    
    private function refreshAccessToken(): void
    {
        $response = $this->httpClient->request('POST', 'https://api.example.com/oauth/token', [
            'json' => [
                'grant_type' => 'refresh_token',
                'refresh_token' => $this->refreshToken,
                'client_id' => getenv('OAUTH_CLIENT_ID'),
                'client_secret' => getenv('OAUTH_CLIENT_SECRET'),
            ],
        ]);
        
        $data = $response->toArray();
        
        $this->accessToken = $data['access_token'];
        $this->refreshToken = $data['refresh_token'] ?? $this->refreshToken;
        
        // Guardar tokens
        \\Configuration::updateValue('API_ACCESS_TOKEN', $this->accessToken);
        \\Configuration::updateValue('API_REFRESH_TOKEN', $this->refreshToken);
    }
}
</code></pre>

        <h2 class="section-title">5. Requests Asíncronos</h2>

        <pre><code class="language-php"><?php
class AsyncApiService
{
    public function getMultipleProducts(array $ids): array
    {
        $responses = [];
        
        // Enviar requests en paralelo
        foreach ($ids as $id) {
            $responses[$id] = $this->httpClient->request(
                'GET',
                "https://api.example.com/products/{$id}"
            );
        }
        
        $products = [];
        
        // Esperar y procesar respuestas
        foreach ($responses as $id => $response) {
            try {
                $products[$id] = $response->toArray();
            } catch (\\Exception $e) {
                error_log("Failed to fetch product {$id}: " . $e->getMessage());
                $products[$id] = null;
            }
        }
        
        return $products;
    }
    
    // Stream de respuesta para archivos grandes
    public function downloadFile(string $url, string $destination): void
    {
        $response = $this->httpClient->request('GET', $url);
        
        $fileHandler = fopen($destination, 'w');
        
        foreach ($this->httpClient->stream($response) as $chunk) {
            fwrite($fileHandler, $chunk->getContent());
        }
        
        fclose($fileHandler);
    }
}
</code></pre>

        <h2 class="section-title">6. Retry y Timeout</h2>

        <pre><code class="language-php"><?php
use Symfony\\Component\\HttpClient\\RetryableHttpClient;

class ResilientApiService
{
    private HttpClientInterface $httpClient;
    
    public function __construct(HttpClientInterface $httpClient)
    {
        // Cliente con reintentos automáticos
        $this->httpClient = new RetryableHttpClient(
            $httpClient,
            null, // Strategy por defecto
            3,    // Máximo 3 reintentos
        );
    }
    
    public function requestWithTimeout(string $url, int $timeout = 10): array
    {
        $response = $this->httpClient->request('GET', $url, [
            'timeout' => $timeout,
            'max_duration' => $timeout + 5, // Timeout total
        ]);
        
        return $response->toArray();
    }
    
    // Retry manual con backoff exponencial
    public function requestWithRetry(string $url, int $maxRetries = 3): array
    {
        $attempt = 0;
        
        while ($attempt < $maxRetries) {
            try {
                $response = $this->httpClient->request('GET', $url);
                return $response->toArray();
                
            } catch (\\Exception $e) {
                $attempt++;
                
                if ($attempt >= $maxRetries) {
                    throw $e;
                }
                
                // Backoff exponencial: 1s, 2s, 4s
                $delay = pow(2, $attempt - 1);
                sleep($delay);
            }
        }
    }
}
</code></pre>

        <h2 class="section-title">7. Webhooks y Callbacks</h2>

        <pre><code class="language-php"><?php
// Recibir webhooks
#[Route('/api/webhooks', name: 'api_webhooks_')]
class WebhookController extends AbstractController
{
    /**
     * @Route("/stripe", name="stripe", methods={"POST"})
     */
    public function stripeWebhook(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $signature = $request->headers->get('Stripe-Signature');
        
        // Verificar firma
        if (!$this->verifyStripeSignature($payload, $signature)) {
            return $this->json(['error' => 'Invalid signature'], 400);
        }
        
        $event = json_decode($payload, true);
        
        // Procesar evento
        match($event['type']) {
            'payment_intent.succeeded' => $this->handlePaymentSuccess($event['data']),
            'payment_intent.payment_failed' => $this->handlePaymentFailure($event['data']),
            default => null,
        };
        
        return $this->json(['received' => true]);
    }
    
    private function verifyStripeSignature(string $payload, string $signature): bool
    {
        $secret = getenv('STRIPE_WEBHOOK_SECRET');
        
        $expectedSignature = hash_hmac('sha256', $payload, $secret);
        
        return hash_equals($expectedSignature, $signature);
    }
}

// Enviar webhooks
class WebhookService
{
    public function sendWebhook(string $url, array $data): bool
    {
        try {
            $response = $this->httpClient->request('POST', $url, [
                'json' => $data,
                'headers' => [
                    'X-Webhook-Signature' => $this->generateSignature($data),
                ],
                'timeout' => 5,
            ]);
            
            return $response->getStatusCode() === 200;
            
        } catch (\\Exception $e) {
            error_log("Webhook failed: " . $e->getMessage());
            return false;
        }
    }
    
    private function generateSignature(array $data): string
    {
        $secret = getenv('WEBHOOK_SECRET');
        return hash_hmac('sha256', json_encode($data), $secret);
    }
}
</code></pre>

        <h2 class="section-title">8. Cache de Requests</h2>

        <pre><code class="language-php"><?php
use Symfony\\Component\\HttpClient\\CachingHttpClient;
use Symfony\\Component\\HttpKernel\\HttpCache\\Store;

class CachedApiService
{
    private HttpClientInterface $httpClient;
    
    public function __construct(HttpClientInterface $httpClient)
    {
        // Cliente con cache HTTP
        $store = new Store(__DIR__.'/../../var/cache/http_client');
        $this->httpClient = new CachingHttpClient($httpClient, $store);
    }
    
    public function getProducts(): array
    {
        // Automáticamente cachea según Cache-Control headers
        $response = $this->httpClient->request('GET', 'https://api.example.com/products');
        
        return $response->toArray();
    }
}
</code></pre>

        <h2 class="section-title">9. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Consumo de APIs:</strong>
            <ul class="mb-0">
                <li>Usar Scoped Clients para diferentes servicios</li>
                <li>Manejo robusto de errores y timeouts</li>
                <li>Implementar retry con backoff exponencial</li>
                <li>Verificar firmas en webhooks</li>
                <li>Requests asíncronos para múltiples llamadas</li>
                <li>Cache de responses cuando sea apropiado</li>
                <li>Loggear requests fallidos</li>
                <li>Configurar User-Agent descriptivo</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Seguridad:</strong>
            <ul class="mb-0">
                <li>Nunca hardcodear API keys en el código</li>
                <li>Usar variables de entorno</li>
                <li>Validar y sanitizar datos recibidos</li>
                <li>Implementar rate limiting para webhooks</li>
                <li>Verificar certificados SSL</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>🔧 Debugging:</strong>
            <pre class="mb-0">// Habilitar logs de HttpClient
framework:
    http_client:
        default_options:
            http_version: '2.0'
        # En desarrollo
        mock_response_factory: 'test.http_client.mock_response_factory'</pre>
        </div>
    </div>
`;

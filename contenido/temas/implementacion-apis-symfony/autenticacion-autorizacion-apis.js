// @ts-nocheck
const autenticacionAutorizacionAPIs = `
    <div class="content-section">
        <h1 id="autenticacion-autorizacion-apis">Autenticación y Autorización para APIs (JWT, OAuth2, API Keys)</h1>
        <p>Proteger APIs REST es crucial. Esta guía cubre JWT, OAuth2 y API Keys con Symfony en PrestaShop 8.9+.</p>

        <h2 class="section-title">1. JWT (JSON Web Tokens)</h2>

        <h3>1.1. Instalación</h3>

        <pre><code class="language-bash"># Instalar LexikJWTAuthenticationBundle
composer require lexik/jwt-authentication-bundle

# Generar claves
php bin/console lexik:jwt:generate-keypair
</code></pre>

        <h3>1.2. Configuración</h3>

        <pre><code class="language-yaml"># config/packages/lexik_jwt_authentication.yaml
lexik_jwt_authentication:
    secret_key: '%env(resolve:JWT_SECRET_KEY)%'
    public_key: '%env(resolve:JWT_PUBLIC_KEY)%'
    pass_phrase: '%env(JWT_PASSPHRASE)%'
    token_ttl: 3600

# config/packages/security.yaml
security:
    encoders:
        App\\Entity\\User:
            algorithm: bcrypt
    
    providers:
        app_user_provider:
            entity:
                class: App\\Entity\\User
                property: email
    
    firewalls:
        login:
            pattern: ^/api/login
            stateless: true
            anonymous: true
            json_login:
                check_path: /api/login
                username_path: email
                password_path: password
                success_handler: lexik_jwt_authentication.handler.authentication_success
                failure_handler: lexik_jwt_authentication.handler.authentication_failure
        
        api:
            pattern: ^/api
            stateless: true
            guard:
                authenticators:
                    - lexik_jwt_authentication.jwt_token_authenticator
    
    access_control:
        - { path: ^/api/login, roles: IS_AUTHENTICATED_ANONYMOUSLY }
        - { path: ^/api, roles: IS_AUTHENTICATED_FULLY }
</code></pre>

        <h3>1.3. Login Endpoint</h3>

        <pre><code class="language-php"><?php
// src/Controller/Api/AuthController.php
namespace PrestaShop\\Module\\MyApi\\Controller\\Api;

use Symfony\\Component\\HttpFoundation\\JsonResponse;
use Symfony\\Component\\HttpFoundation\\Request;
use Symfony\\Component\\Routing\\Annotation\\Route;

#[Route('/api', name: 'api_auth_')]
class AuthController extends AbstractController
{
    /**
     * @Route("/login", name="login", methods={"POST"})
     */
    public function login(Request $request): JsonResponse
    {
        // El JWT se genera automáticamente por LexikJWTAuthenticationBundle
        // Este método solo se ejecuta si la autenticación falla
        return $this->json([
            'message' => 'Authentication required',
        ], 401);
    }
    
    /**
     * @Route("/me", name="me", methods={"GET"})
     */
    public function me(): JsonResponse
    {
        $user = $this->getUser();
        
        return $this->json([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'roles' => $user->getRoles(),
        ]);
    }
}

// Cliente usa:
// POST /api/login
// { "email": "user@example.com", "password": "password" }
//
// Response:
// { "token": "eyJ0eXAiOiJKV1QiLCJhbGc..." }
//
// Requests subsecuentes:
// Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
</code></pre>

        <h2 class="section-title">2. API Keys</h2>

        <pre><code class="language-php"><?php
// src/Security/ApiKeyAuthenticator.php
namespace PrestaShop\\Module\\MyApi\\Security;

use Symfony\\Component\\HttpFoundation\\JsonResponse;
use Symfony\\Component\\HttpFoundation\\Request;
use Symfony\\Component\\HttpFoundation\\Response;
use Symfony\\Component\\Security\\Core\\Authentication\\Token\\TokenInterface;
use Symfony\\Component\\Security\\Core\\Exception\\AuthenticationException;
use Symfony\\Component\\Security\\Http\\Authenticator\\AbstractAuthenticator;
use Symfony\\Component\\Security\\Http\\Authenticator\\Passport\\Badge\\UserBadge;
use Symfony\\Component\\Security\\Http\\Authenticator\\Passport\\Passport;
use Symfony\\Component\\Security\\Http\\Authenticator\\Passport\\SelfValidatingPassport;

class ApiKeyAuthenticator extends AbstractAuthenticator
{
    public function supports(Request $request): ?bool
    {
        return $request->headers->has('X-API-Key');
    }
    
    public function authenticate(Request $request): Passport
    {
        $apiKey = $request->headers->get('X-API-Key');
        
        if (null === $apiKey) {
            throw new AuthenticationException('No API key provided');
        }
        
        return new SelfValidatingPassport(
            new UserBadge($apiKey, function ($apiKey) {
                // Buscar usuario por API key
                $user = $this->findUserByApiKey($apiKey);
                
                if (!$user) {
                    throw new AuthenticationException('Invalid API key');
                }
                
                return $user;
            })
        );
    }
    
    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        return null;
    }
    
    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        return new JsonResponse([
            'error' => 'Authentication failed',
            'message' => $exception->getMessageKey(),
        ], Response::HTTP_UNAUTHORIZED);
    }
    
    private function findUserByApiKey(string $apiKey): ?\\Employee
    {
        // Buscar en tabla personalizada o Configuration
        $userId = \\Configuration::get('API_KEY_' . hash('sha256', $apiKey));
        
        if (!$userId) {
            return null;
        }
        
        $employee = new \\Employee($userId);
        
        return \\Validate::isLoadedObject($employee) ? $employee : null;
    }
}

// Uso:
// X-API-Key: your-api-key-here
</code></pre>

        <h2 class="section-title">3. OAuth2 (LexikOAuthServerBundle)</h2>

        <pre><code class="language-bash">composer require friendsofsymfony/oauth-server-bundle
</code></pre>

        <pre><code class="language-yaml"># config/packages/fos_oauth_server.yaml
fos_oauth_server:
    db_driver: orm
    client_class: App\\Entity\\Client
    access_token_class: App\\Entity\\AccessToken
    refresh_token_class: App\\Entity\\RefreshToken
    auth_code_class: App\\Entity\\AuthCode
    service:
        user_provider: app_user_provider
</code></pre>

        <pre><code class="language-php"><?php
// Crear cliente OAuth
$clientManager = $this->container->get('fos_oauth_server.client_manager.default');
$client = $clientManager->createClient();
$client->setRedirectUris(['https://myapp.com/callback']);
$client->setAllowedGrantTypes(['authorization_code', 'refresh_token']);
$clientManager->updateClient($client);

// Client ID y Secret
$clientId = $client->getPublicId();
$clientSecret = $client->getSecret();

// Flujo de autorización:
// 1. GET /oauth/v2/auth?client_id=xxx&redirect_uri=xxx&response_type=code
// 2. POST /oauth/v2/token
//    grant_type=authorization_code&client_id=xxx&client_secret=xxx&code=xxx
</code></pre>

        <h2 class="section-title">4. Autorización basada en Roles</h2>

        <pre><code class="language-php"><?php
#[Route('/api/products', name: 'api_products_')]
class ProductController extends AbstractController
{
    /**
     * Todos los usuarios autenticados
     */
    #[Route('', name: 'list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $this->denyAccessUnlessGranted('IS_AUTHENTICATED_FULLY');
        // O verificar en security.yaml con access_control
        
        return $this->json(['data' => []]);
    }
    
    /**
     * Solo administradores
     */
    #[Route('', name: 'create', methods: ['POST'])]
    public function create(): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');
        
        // Crear producto...
    }
    
    /**
     * Verificación condicional
     */
    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $product = new \\Product($id);
        
        // Solo el propietario o admin puede eliminar
        if (!$this->isGranted('ROLE_ADMIN') && $product->id_employee != $this->getUser()->getId()) {
            throw new AccessDeniedHttpException('You cannot delete this product');
        }
        
        $product->delete();
        
        return $this->json(null, Response::HTTP_NO_CONTENT);
    }
}
</code></pre>

        <h2 class="section-title">5. Voters Personalizados</h2>

        <pre><code class="language-php"><?php
// src/Security/Voter/ProductVoter.php
namespace PrestaShop\\Module\\MyApi\\Security\\Voter;

use Symfony\\Component\\Security\\Core\\Authentication\\Token\\TokenInterface;
use Symfony\\Component\\Security\\Core\\Authorization\\Voter\\Voter;

class ProductVoter extends Voter
{
    const EDIT = 'product.edit';
    const DELETE = 'product.delete';
    const VIEW = 'product.view';
    
    protected function supports(string $attribute, $subject): bool
    {
        return in_array($attribute, [self::EDIT, self::DELETE, self::VIEW])
            && $subject instanceof \\Product;
    }
    
    protected function voteOnAttribute(string $attribute, $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();
        
        if (!$user instanceof \\Employee) {
            return false;
        }
        
        /** @var \\Product $product */
        $product = $subject;
        
        return match($attribute) {
            self::VIEW => $this->canView($product, $user),
            self::EDIT => $this->canEdit($product, $user),
            self::DELETE => $this->canDelete($product, $user),
            default => false,
        };
    }
    
    private function canView(\\Product $product, \\Employee $user): bool
    {
        // Todos pueden ver productos activos
        if ($product->active) {
            return true;
        }
        
        // Solo propietarios y admins ven inactivos
        return $this->canEdit($product, $user);
    }
    
    private function canEdit(\\Product $product, \\Employee $user): bool
    {
        // Admins pueden editar todo
        if (in_array('ROLE_ADMIN', $user->getRoles())) {
            return true;
        }
        
        // Propietario puede editar su producto
        return $product->id_employee === $user->getId();
    }
    
    private function canDelete(\\Product $product, \\Employee $user): bool
    {
        // Solo admins pueden eliminar
        return in_array('ROLE_ADMIN', $user->getRoles());
    }
}

// En controlador
public function update(int $id, Request $request): JsonResponse
{
    $product = new \\Product($id);
    
    $this->denyAccessUnlessGranted('product.edit', $product);
    
    // Actualizar producto...
}
</code></pre>

        <h2 class="section-title">6. Rate Limiting por Usuario</h2>

        <pre><code class="language-php"><?php
// src/EventListener/RateLimitListener.php
namespace PrestaShop\\Module\\MyApi\\EventListener;

use Symfony\\Component\\HttpKernel\\Event\\RequestEvent;
use Symfony\\Component\\HttpKernel\\Exception\\TooManyRequestsHttpException;

class RateLimitListener
{
    public function onKernelRequest(RequestEvent $event): void
    {
        $request = $event->getRequest();
        
        if (!str_starts_with($request->getPathInfo(), '/api/')) {
            return;
        }
        
        $user = $this->getUser();
        
        if (!$user) {
            return;
        }
        
        $key = 'rate_limit_' . $user->getId();
        $limit = $this->getUserRateLimit($user);
        
        $requests = (int)\\Cache::getInstance()->get($key);
        
        if ($requests > $limit) {
            throw new TooManyRequestsHttpException(3600, 'Rate limit exceeded');
        }
        
        \\Cache::getInstance()->set($key, $requests + 1, 3600);
    }
    
    private function getUserRateLimit($user): int
    {
        // Diferentes límites por rol
        if (in_array('ROLE_ADMIN', $user->getRoles())) {
            return 10000; // 10k req/hora
        }
        
        return 1000; // 1k req/hora para usuarios normales
    }
}
</code></pre>

        <h2 class="section-title">7. Refresh Tokens</h2>

        <pre><code class="language-php"><?php
#[Route('/api/token', name: 'api_token_')]
class TokenController extends AbstractController
{
    /**
     * @Route("/refresh", name="refresh", methods={"POST"})
     */
    public function refresh(Request $request, JWTTokenManagerInterface $JWTManager): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $refreshToken = $data['refresh_token'] ?? null;
        
        if (!$refreshToken) {
            return $this->json(['error' => 'Missing refresh token'], 400);
        }
        
        // Validar refresh token
        $user = $this->validateRefreshToken($refreshToken);
        
        if (!$user) {
            return $this->json(['error' => 'Invalid refresh token'], 401);
        }
        
        // Generar nuevo JWT
        $token = $JWTManager->create($user);
        
        return $this->json([
            'token' => $token,
            'refresh_token' => $this->generateRefreshToken($user),
        ]);
    }
}
</code></pre>

        <h2 class="section-title">8. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Seguridad:</strong>
            <ul class="mb-0">
                <li>Usar HTTPS siempre</li>
                <li>JWT con expiración corta (1h)</li>
                <li>Implementar refresh tokens</li>
                <li>Rate limiting por usuario</li>
                <li>Rotar API keys periódicamente</li>
                <li>Loggear intentos de autenticación fallidos</li>
                <li>Implementar 2FA para operaciones críticas</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>🔐 Comparación:</strong>
            <table class="table table-sm">
                <tr>
                    <th>Método</th>
                    <th>Uso</th>
                    <th>Seguridad</th>
                </tr>
                <tr>
                    <td><strong>JWT</strong></td>
                    <td>APIs públicas, SPAs</td>
                    <td>Alta (con HTTPS)</td>
                </tr>
                <tr>
                    <td><strong>API Keys</strong></td>
                    <td>Server-to-server</td>
                    <td>Media</td>
                </tr>
                <tr>
                    <td><strong>OAuth2</strong></td>
                    <td>Aplicaciones terceros</td>
                    <td>Muy Alta</td>
                </tr>
            </table>
        </div>
    </div>
`;

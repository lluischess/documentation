// @ts-nocheck
const versionadoAPIs = `
    <div class="content-section">
        <h1 id="versionado-apis">Versionado de APIs (URI, Header, Query Parameter)</h1>
        <p>El versionado permite evolucionar APIs sin romper compatibilidad con clientes existentes. Esta guía cubre las estrategias de versionado para APIs REST en PrestaShop 8.9+.</p>

        <h2 class="section-title">1. Estrategias de Versionado</h2>

        <table class="table table-bordered">
            <thead class="table-dark">
                <tr>
                    <th>Estrategia</th>
                    <th>Ejemplo</th>
                    <th>Pros</th>
                    <th>Contras</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>URI Path</strong></td>
                    <td><code>/api/v1/products</code></td>
                    <td>✅ Simple, visible, cacheable</td>
                    <td>❌ Múltiples endpoints</td>
                </tr>
                <tr>
                    <td><strong>Query Parameter</strong></td>
                    <td><code>/api/products?v=1</code></td>
                    <td>✅ URL única</td>
                    <td>❌ Cache complejo</td>
                </tr>
                <tr>
                    <td><strong>Header</strong></td>
                    <td><code>Accept: application/vnd.api.v1+json</code></td>
                    <td>✅ RESTful puro</td>
                    <td>❌ Menos visible, testing difícil</td>
                </tr>
                <tr>
                    <td><strong>Content Negotiation</strong></td>
                    <td><code>Accept: application/vnd.prestashop+json; version=1</code></td>
                    <td>✅ Estándar HTTP</td>
                    <td>❌ Complejo implementar</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">2. Versionado en URI (Recomendado)</h2>

        <pre><code class="language-php"><?php
// modules/myapi/myapi.php
class MyApi extends Module
{
    public function hookModuleRoutes()
    {
        return [
            // API v1
            'api_v1_products' => [
                'controller' => 'products',
                'rule' => 'api/v1/products',
                'keywords' => [],
                'params' => [
                    'fc' => 'module',
                    'module' => 'myapi',
                    'controller' => 'v1products',
                ],
            ],
            'api_v1_product' => [
                'controller' => 'products',
                'rule' => 'api/v1/products/{id}',
                'keywords' => ['id' => ['regexp' => '[0-9]+']],
                'params' => [
                    'fc' => 'module',
                    'module' => 'myapi',
                    'controller' => 'v1products',
                ],
            ],
            
            // API v2
            'api_v2_products' => [
                'controller' => 'products',
                'rule' => 'api/v2/products',
                'keywords' => [],
                'params' => [
                    'fc' => 'module',
                    'module' => 'myapi',
                    'controller' => 'v2products',
                ],
            ],
        ];
    }
}
</code></pre>

        <h3>Controladores por Versión</h3>

        <pre><code class="language-php"><?php
// controllers/front/v1products.php
class MyApiV1ProductsModuleFrontController extends ModuleFrontController
{
    public function initContent()
    {
        $products = Product::getProducts(
            $this->context->language->id,
            0, 100, 'id_product', 'DESC'
        );
        
        // Formato v1
        $response = array_map(function($p) {
            return [
                'id' => (int)$p['id_product'],
                'name' => $p['name'],
                'price' => (float)$p['price'],
            ];
        }, $products);
        
        $this->ajaxDie(json_encode($response));
    }
}

// controllers/front/v2products.php
class MyApiV2ProductsModuleFrontController extends ModuleFrontController
{
    public function initContent()
    {
        $products = Product::getProducts(
            $this->context->language->id,
            0, 100, 'id_product', 'DESC'
        );
        
        // Formato v2 (mejorado con más datos)
        $response = [
            'data' => array_map(function($p) {
                return [
                    'id' => (int)$p['id_product'],
                    'reference' => $p['reference'],
                    'name' => $p['name'],
                    'description' => strip_tags($p['description']),
                    'price' => [
                        'amount' => (float)$p['price'],
                        'currency' => 'EUR',
                        'tax_included' => true,
                    ],
                    'stock' => (int)$p['quantity'],
                    'images' => $this->getProductImages($p['id_product']),
                ];
            }, $products),
            'meta' => [
                'total' => count($products),
                'version' => '2.0',
            ],
        ];
        
        $this->ajaxDie(json_encode($response));
    }
}
</code></pre>

        <h2 class="section-title">3. Versionado con Query Parameter</h2>

        <pre><code class="language-php"><?php
class ProductsController extends ModuleFrontController
{
    public function initContent()
    {
        $version = $_GET['v'] ?? $_GET['version'] ?? '1';
        
        switch ($version) {
            case '2':
                $this->handleV2();
                break;
            case '1':
            default:
                $this->handleV1();
                break;
        }
    }
    
    private function handleV1()
    {
        // Implementación v1
        $this->ajaxDie(json_encode([
            'id' => 1,
            'name' => 'Product',
        ]));
    }
    
    private function handleV2()
    {
        // Implementación v2
        $this->ajaxDie(json_encode([
            'data' => [
                'id' => 1,
                'name' => 'Product',
                'metadata' => [],
            ],
        ]));
    }
}

// Uso:
// GET /api/products?v=1
// GET /api/products?v=2
</code></pre>

        <h2 class="section-title">4. Versionado con Header</h2>

        <pre><code class="language-php"><?php
class ProductsController extends ModuleFrontController
{
    public function initContent()
    {
        $version = $this->getApiVersion();
        
        match($version) {
            '2.0' => $this->handleV2(),
            '1.0' => $this->handleV1(),
            default => $this->handleV1(),
        };
    }
    
    private function getApiVersion(): string
    {
        // Desde header personalizado
        if (isset($_SERVER['HTTP_API_VERSION'])) {
            return $_SERVER['HTTP_API_VERSION'];
        }
        
        // Desde Accept header
        // Accept: application/vnd.prestashop.v2+json
        $accept = $_SERVER['HTTP_ACCEPT'] ?? '';
        
        if (preg_match('/application\/vnd\.prestashop\.v(\d+)\+json/', $accept, $matches)) {
            return $matches[1] . '.0';
        }
        
        // Por defecto v1
        return '1.0';
    }
}

// Cliente usa:
// API-Version: 2.0
// o
// Accept: application/vnd.prestashop.v2+json
</code></pre>

        <h2 class="section-title">5. Deprecación de Versiones</h2>

        <pre><code class="language-php"><?php
class ApiDeprecationMiddleware
{
    private array $deprecatedVersions = [
        '1.0' => [
            'sunset_date' => '2025-12-31',
            'replacement' => '2.0',
        ],
    ];
    
    public function checkDeprecation(string $version): void
    {
        if (isset($this->deprecatedVersions[$version])) {
            $info = $this->deprecatedVersions[$version];
            
            // Headers de deprecación
            header('Deprecation: true');
            header('Sunset: ' . $info['sunset_date']);
            header('Link: </api/v' . $info['replacement'] . '>; rel="successor-version"');
            
            // Warning en response
            header('Warning: 299 - "API version ' . $version . 
                   ' is deprecated and will be removed on ' . 
                   $info['sunset_date'] . '"');
        }
    }
}

// En controlador
$deprecation = new ApiDeprecationMiddleware();
$deprecation->checkDeprecation('1.0');
</code></pre>

        <h2 class="section-title">6. Versionado Semántico</h2>

        <div class="alert alert-info">
            <strong>📋 Semantic Versioning (SemVer):</strong>
            <ul class="mb-0">
                <li><strong>MAJOR (v1 → v2):</strong> Cambios incompatibles (breaking changes)</li>
                <li><strong>MINOR (v1.0 → v1.1):</strong> Nuevas funcionalidades compatibles</li>
                <li><strong>PATCH (v1.0.0 → v1.0.1):</strong> Bug fixes</li>
            </ul>
        </div>

        <pre><code class="language-php"><?php
class ApiVersionManager
{
    const CURRENT_VERSION = '2.1.3';
    
    public static function isCompatible(string $requestedVersion): bool
    {
        [$major, $minor, $patch] = explode('.', $requestedVersion);
        [$currentMajor] = explode('.', self::CURRENT_VERSION);
        
        // Major version must match
        return $major === $currentMajor;
    }
    
    public static function getVersionInfo(): array
    {
        return [
            'current' => self::CURRENT_VERSION,
            'supported' => ['2.0.0', '2.1.0', '2.1.3'],
            'deprecated' => ['1.0.0', '1.5.0'],
            'sunset_dates' => [
                '1.0.0' => '2025-06-30',
                '1.5.0' => '2025-12-31',
            ],
        ];
    }
}
</code></pre>

        <h2 class="section-title">7. Documentación de Versiones</h2>

        <pre><code class="language-php"><?php
// Endpoint de información de versiones
// GET /api/versions
class VersionsController extends ModuleFrontController
{
    public function initContent()
    {
        $versions = [
            [
                'version' => '2.0',
                'status' => 'current',
                'released' => '2024-01-15',
                'endpoints' => '/api/v2',
                'documentation' => '/docs/v2',
                'changes' => [
                    'New structured response format',
                    'Added pagination support',
                    'Improved error messages',
                ],
            ],
            [
                'version' => '1.0',
                'status' => 'deprecated',
                'released' => '2023-01-10',
                'sunset_date' => '2025-12-31',
                'endpoints' => '/api/v1',
                'documentation' => '/docs/v1',
                'migration_guide' => '/docs/migration-v1-to-v2',
            ],
        ];
        
        $this->ajaxDie(json_encode($versions, JSON_PRETTY_PRINT));
    }
}
</code></pre>

        <h2 class="section-title">8. Mejores Prácticas</h2>

        <div class="row">
            <div class="col-md-6">
                <div class="card border-success mb-3">
                    <div class="card-header bg-success text-white">✅ Hacer</div>
                    <div class="card-body">
                        <ul>
                            <li>Usar versionado en URI (más simple)</li>
                            <li>Major version en URL (v1, v2)</li>
                            <li>Mantener versiones antiguas funcionando</li>
                            <li>Documentar cambios breaking</li>
                            <li>Avisar deprecación con anticipación</li>
                            <li>Proporcionar guías de migración</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card border-danger mb-3">
                    <div class="card-header bg-danger text-white">❌ Evitar</div>
                    <div class="card-body">
                        <ul>
                            <li>Cambios breaking sin nueva versión</li>
                            <li>Eliminar versiones sin aviso</li>
                            <li>Versionar features individuales</li>
                            <li>Mezclar estrategias de versionado</li>
                            <li>Soportar versiones indefinidamente</li>
                            <li>Versiones muy granulares (v1.2.3.4)</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Estrategia Recomendada:</strong> Usar <strong>URI Path versioning</strong> (<code>/api/v1/</code>) por su simplicidad, visibilidad y compatibilidad con cache. Reservar headers para metadatos opcionales.
        </div>
    </div>
`;

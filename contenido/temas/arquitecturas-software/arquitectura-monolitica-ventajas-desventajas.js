// @ts-nocheck
const arquitecturaMonoliticaVentajasDesventajas = `
    <div class="content-section">
        <h1 id="arquitectura-monolitica-ventajas-desventajas">Arquitectura Monolítica y sus Ventajas/Desventajas</h1>
        <p>Análisis completo de la arquitectura monolítica aplicada a PrestaShop 8.9+ con PHP 8.1+.</p>

        <h2 class="section-title">1. ¿Qué es una Arquitectura Monolítica?</h2>

        <p>Una aplicación monolítica es una aplicación de software en la que <strong>todos los componentes están integrados en una única base de código</strong> y se ejecutan como un solo proceso.</p>

        <pre><code class="language-plaintext">┌──────────────────────────────────────────────────┐
│           Aplicación Monolítica                  │
│                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────┐ │
│  │     UI      │  │   Business   │  │   Data  │ │
│  │  (Smarty)   │←→│    Logic     │←→│  Layer  │ │
│  │             │  │   (PHP)      │  │ (MySQL) │ │
│  └─────────────┘  └──────────────┘  └─────────┘ │
│                                                  │
│           Mismo código, mismo deploy             │
└──────────────────────────────────────────────────┘
</code></pre>

        <h2 class="section-title">2. PrestaShop como Monolito</h2>

        <p>PrestaShop es inherentemente una <strong>aplicación monolítica</strong>:</p>

        <pre><code class="language-php"><?php
// PrestaShop Structure
prestashop/
├── controllers/         # Frontend & Admin Controllers
├── classes/            # Business Logic (ObjectModel)
├── modules/            # Extensiones (también monolíticas)
├── themes/             # UI Layer
├── override/           # Modificaciones al core
└── config/             # Configuración global

// Todo se ejecuta en el mismo proceso PHP-FPM
</code></pre>

        <h2 class="section-title">3. Ejemplo Monolítico: Proceso de Checkout</h2>

        <pre><code class="language-php"><?php
// controllers/front/OrderController.php
class OrderController extends FrontController
{
    public function postProcess()
    {
        // 1. Validación (mismo proceso)
        if (!$this->validateCart()) {
            return $this->errors[] = 'Invalid cart';
        }
        
        // 2. Cálculo de precio (mismo proceso)
        $cart = Context::getContext()->cart;
        $total = $cart->getOrderTotal(true, Cart::BOTH);
        
        // 3. Procesamiento de pago (mismo proceso)
        $payment = Module::getInstanceByName($this->module);
        $payment->validateOrder(
            $cart->id,
            Configuration::get('PS_OS_PAYMENT'),
            $total
        );
        
        // 4. Creación de pedido (mismo proceso)
        $order = new Order($payment->currentOrder);
        
        // 5. Envío de email (mismo proceso)
        Mail::Send(
            $this->context->language->id,
            'order_conf',
            'Order confirmation',
            [],
            $customer->email
        );
        
        // 6. Reducción de stock (mismo proceso)
        foreach ($cart->getProducts() as $product) {
            StockAvailable::updateQuantity(
                $product['id_product'],
                $product['id_product_attribute'],
                -$product['cart_quantity']
            );
        }
        
        // Todo en una sola transacción, mismo código
    }
}
</code></pre>

        <h2 class="section-title">4. Ventajas de la Arquitectura Monolítica</h2>

        <div class="alert alert-success">
            <strong>✅ Ventajas:</strong>
            <ul class="mb-0">
                <li><strong>Simplicidad de desarrollo:</strong> Todo en un mismo proyecto, mismo lenguaje</li>
                <li><strong>Fácil debugging:</strong> Stack trace completo, logs centralizados</li>
                <li><strong>Deployment simple:</strong> Un solo artefacto (ZIP, Docker image)</li>
                <li><strong>Performance:</strong> No latencia de red entre componentes</li>
                <li><strong>Transacciones ACID:</strong> Todo en misma BD, transacciones fáciles</li>
                <li><strong>Testing más simple:</strong> Tests de integración end-to-end fáciles</li>
                <li><strong>Ideal para equipos pequeños:</strong> < 10 developers</li>
                <li><strong>Menor complejidad operacional:</strong> Un servidor, una BD</li>
            </ul>
        </div>

        <h2 class="section-title">5. Desventajas de la Arquitectura Monolítica</h2>

        <div class="alert alert-warning">
            <strong>⚠️ Desventajas:</strong>
            <ul class="mb-0">
                <li><strong>Escalabilidad limitada:</strong> Solo escala verticalmente (más CPU/RAM)</li>
                <li><strong>Deployment riesgoso:</strong> Un cambio pequeño requiere redeploy completo</li>
                <li><strong>Acoplamiento alto:</strong> Cambios en un módulo afectan otros</li>
                <li><strong>Tecnología única:</strong> Todo debe ser PHP, no puedes usar Python para ML</li>
                <li><strong>Tiempos de build largos:</strong> > 100k LOC = builds lentos</li>
                <li><strong>Difícil de mantener:</strong> Código legacy crece sin control</li>
                <li><strong>Single point of failure:</strong> Si cae PHP-FPM, cae toda la app</li>
                <li><strong>Equipos grandes:</strong> Conflictos de merge, coordinación compleja</li>
            </ul>
        </div>

        <h2 class="section-title">6. Cuándo Usar Monolito</h2>

        <table>
            <thead>
                <tr>
                    <th>Escenario</th>
                    <th>Recomendación</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Startup / MVP</td>
                    <td>✅ Monolito (velocidad de desarrollo)</td>
                </tr>
                <tr>
                    <td>Equipo pequeño (< 10 devs)</td>
                    <td>✅ Monolito</td>
                </tr>
                <tr>
                    <td>Tráfico bajo/medio (< 100k users/day)</td>
                    <td>✅ Monolito</td>
                </tr>
                <tr>
                    <td>Dominio simple y bien definido</td>
                    <td>✅ Monolito</td>
                </tr>
                <tr>
                    <td>Alta disponibilidad crítica</td>
                    <td>⚠️ Considerar microservicios</td>
                </tr>
                <tr>
                    <td>Equipos grandes (> 50 devs)</td>
                    <td>⚠️ Considerar microservicios</td>
                </tr>
                <tr>
                    <td>Necesidad de tecnologías diversas</td>
                    <td>❌ No monolito</td>
                </tr>
                <tr>
                    <td>Escalabilidad extrema</td>
                    <td>❌ No monolito</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">7. Evolución: Monolito Modular</h2>

        <pre><code class="language-php"><?php
// Monolito BIEN estructurado (modular)
namespace App;

// Bounded Contexts separados
modules/
├── Catalog/
│   ├── Domain/
│   ├── Application/
│   └── Infrastructure/
├── Order/
│   ├── Domain/
│   ├── Application/
│   └── Infrastructure/
└── Customer/
    ├── Domain/
    ├── Application/
    └── Infrastructure/

// Comunicación via interfaces, no acoplamiento directo
interface OrderServiceInterface
{
    public function createOrder(Cart $cart): Order;
}

// Implementación en el módulo Order
class OrderService implements OrderServiceInterface
{
    public function createOrder(Cart $cart): Order
    {
        // Lógica de negocio
    }
}

// Otros módulos consumen la interfaz
class CheckoutController
{
    public function __construct(
        private OrderServiceInterface $orderService
    ) {}
    
    public function process()
    {
        $order = $this->orderService->createOrder($cart);
    }
}
</code></pre>

        <h2 class="section-title">8. PrestaShop: ¿Monolito o Microservicios?</h2>

        <div class="alert alert-info">
            <strong>🎯 Recomendación para PrestaShop:</strong>
            <ul class="mb-0">
                <li><strong>Core PrestaShop:</strong> Mantener monolítico (probado, estable)</li>
                <li><strong>Nuevas features complejas:</strong> Considerar módulos desacoplados</li>
                <li><strong>Integraciones externas:</strong> APIs REST independientes</li>
                <li><strong>Procesamiento pesado:</strong> Workers asíncronos (RabbitMQ)</li>
                <li><strong>Reporte/Analytics:</strong> Servicio separado (no impacta ventas)</li>
            </ul>
        </div>

        <h2 class="section-title">9. Mejores Prácticas Monolito</h2>

        <div class="alert alert-success">
            <strong>✅ Monolito Bien Hecho:</strong>
            <ul class="mb-0">
                <li>Estructura modular (Bounded Contexts)</li>
                <li>Dependency Injection para desacoplamiento</li>
                <li>Interfaces para componentes críticos</li>
                <li>Testing exhaustivo (unit + integration)</li>
                <li>CI/CD robusto</li>
                <li>Monitoring y observability</li>
                <li>Horizontal scaling cuando sea posible (load balancer)</li>
            </ul>
        </div>

        <div class="alert alert-danger">
            <strong>❌ Anti-patterns:</strong>
            <ul class="mb-0">
                <li>Acoplamiento directo entre módulos</li>
                <li>Código spaghetti sin estructura</li>
                <li>Variables globales (\$_SESSION, \$_GLOBALS)</li>
                <li>Lógica de negocio en controllers</li>
                <li>Sin tests automatizados</li>
                <li>Deployment manual</li>
            </ul>
        </div>
    </div>
`;

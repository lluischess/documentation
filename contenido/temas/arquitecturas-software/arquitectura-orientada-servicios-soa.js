// @ts-nocheck
const arquitecturaOrientadaServiciosSOA = `
    <div class="content-section">
        <h1 id="arquitectura-orientada-servicios-soa">Arquitectura Orientada a Servicios (SOA)</h1>
        <p>Principios de SOA y su evolución hacia microservicios en ecosistemas PrestaShop 8.9+.</p>

        <h2 class="section-title">1. ¿Qué es SOA?</h2>

        <p>SOA (Service-Oriented Architecture) es un estilo arquitectónico donde la funcionalidad se organiza en <strong>servicios reutilizables</strong> que se comunican vía protocolos estándar (SOAP, REST, gRPC).</p>

        <pre><code class="language-plaintext">┌────────────────────────────────────────────┐
│              SOA CLÁSICO                   │
│                                            │
│  ┌──────────┐      ┌──────────────┐      │
│  │   App1   │──┐   │  Enterprise  │      │
│  └──────────┘  │   │  Service Bus │      │
│                ├──→│     (ESB)    │      │
│  ┌──────────┐  │   └──────┬───────┘      │
│  │   App2   │──┘          │              │
│  └──────────┘       ┌─────▼──────┐       │
│                     │  Services   │       │
│                     ├─────────────┤       │
│                     │ Order Svc   │       │
│                     │ Customer Svc│       │
│                     │ Inventory Sc│       │
│                     └─────────────┘       │
│                                            │
│  Servicios compartidos, ESB centralizado │
└────────────────────────────────────────────┘
</code></pre>

        <h2 class="section-title">2. Principios SOA</h2>

        <h3>2.1. Loose Coupling</h3>

        <pre><code class="language-php"><?php
// ❌ TIGHT COUPLING
class OrderController
{
    public function create()
    {
        // Acoplamiento directo a implementación
        $customer = new MysqlCustomerRepository()->find($id);
        $inventory = new MysqlInventoryRepository()->check($productId);
    }
}

// ✅ LOOSE COUPLING (SOA)
class OrderController
{
    public function __construct(
        private CustomerServiceInterface $customerService,
        private InventoryServiceInterface $inventoryService
    ) {}
    
    public function create()
    {
        // Acoplamiento a interfaz, no implementación
        $customer = $this->customerService->find($id);
        $inventory = $this->inventoryService->check($productId);
    }
}
</code></pre>

        <h3>2.2. Service Contract</h3>

        <pre><code class="language-php"><?php
// Contrato explícito del servicio
namespace App\\Service\\Order;

interface OrderServiceInterface
{
    /**
     * Crea una orden desde un carrito
     * @throws InvalidCartException
     * @throws PaymentFailedException
     */
    public function createFromCart(int $cartId): Order;
    
    /**
     * Cancela una orden existente
     * @throws OrderNotFoundException
     * @throws OrderNotCancellableException
     */
    public function cancel(int $orderId): void;
}

// Implementación
final class OrderService implements OrderServiceInterface
{
    public function createFromCart(int $cartId): Order
    {
        // Lógica de negocio
    }
}
</code></pre>

        <h3>2.3. Service Reusability</h3>

        <pre><code class="language-php"><?php
// Servicio reutilizable
namespace App\\Service\\Customer;

final class CustomerService
{
    // Usado por OrderService
    public function getCustomer(int $id): Customer { }
    
    // Usado por AccountService
    public function updateProfile(int $id, array $data): void { }
    
    // Usado por MarketingService
    public function getSegment(int $id): CustomerSegment { }
    
    // Reutilizado por múltiples servicios
}
</code></pre>

        <h2 class="section-title">3. SOA vs Microservicios</h2>

        <table>
            <thead>
                <tr>
                    <th>Aspecto</th>
                    <th>SOA</th>
                    <th>Microservicios</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Tamaño</strong></td>
                    <td>Servicios grandes</td>
                    <td>Servicios pequeños</td>
                </tr>
                <tr>
                    <td><strong>Comunicación</strong></td>
                    <td>ESB centralizado (SOAP)</td>
                    <td>Direct (REST, gRPC)</td>
                </tr>
                <tr>
                    <td><strong>Base de datos</strong></td>
                    <td>Compartida</td>
                    <td>Por servicio</td>
                </tr>
                <tr>
                    <td><strong>Deployment</strong></td>
                    <td>Monolítico</td>
                    <td>Independiente</td>
                </tr>
                <tr>
                    <td><strong>Scope</strong></td>
                    <td>Enterprise-wide</td>
                    <td>Bounded context</td>
                </tr>
                <tr>
                    <td><strong>Reutilización</strong></td>
                    <td>Alta (compartir servicios)</td>
                    <td>Baja (duplicar si necesario)</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">4. SOA en PrestaShop</h2>

        <pre><code class="language-php"><?php
// Estructura SOA en PrestaShop modular
namespace App\\Service;

// ORDER SERVICE
class OrderService
{
    public function __construct(
        private CustomerService $customerService,
        private InventoryService $inventoryService,
        private PaymentService $paymentService,
        private EmailService $emailService
    ) {}
    
    public function placeOrder(int $cartId): Order
    {
        // 1. Obtener customer (servicio reutilizable)
        $customer = $this->customerService->getById($cart->id_customer);
        
        // 2. Verificar stock (servicio reutilizable)
        foreach ($cart->getProducts() as $product) {
            if (!$this->inventoryService->hasStock($product['id'], $product['qty'])) {
                throw new OutOfStockException();
            }
        }
        
        // 3. Procesar pago (servicio reutilizable)
        $payment = $this->paymentService->charge(
            $customer,
            $cart->getTotal()
        );
        
        // 4. Crear orden
        $order = new Order();
        $order->create($cart, $payment);
        
        // 5. Enviar email (servicio reutilizable)
        $this->emailService->sendOrderConfirmation($order);
        
        // 6. Reducir stock (servicio reutilizable)
        foreach ($cart->getProducts() as $product) {
            $this->inventoryService->decreaseStock($product['id'], $product['qty']);
        }
        
        return $order;
    }
}

// CUSTOMER SERVICE (reutilizable)
class CustomerService
{
    public function getById(int $id): Customer
    {
        // Usado por OrderService, AccountService, etc
    }
    
    public function updateProfile(int $id, array $data): void
    {
        // Usado por AccountService, AdminService
    }
}

// INVENTORY SERVICE (reutilizable)
class InventoryService
{
    public function hasStock(int $productId, int $quantity): bool
    {
        // Usado por OrderService, ProductService, CartService
    }
    
    public function decreaseStock(int $productId, int $quantity): void
    {
        // Usado por OrderService, RefundService
    }
}
</code></pre>

        <h2 class="section-title">5. Ventajas y Desventajas</h2>

        <div class="alert alert-success">
            <strong>✅ Ventajas SOA:</strong>
            <ul class="mb-0">
                <li><strong>Reutilización:</strong> Servicios compartidos entre apps</li>
                <li><strong>Mantenibilidad:</strong> Cambios localizados en servicios</li>
                <li><strong>Escalabilidad:</strong> Escalar servicios específicos</li>
                <li><strong>Interoperabilidad:</strong> Diferentes tecnologías pueden consumir servicios</li>
                <li><strong>Separation of Concerns:</strong> Cada servicio una responsabilidad</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Desventajas:</strong>
            <ul class="mb-0">
                <li><strong>Complejidad:</strong> ESB puede ser bottleneck</li>
                <li><strong>Performance:</strong> Overhead de comunicación entre servicios</li>
                <li><strong>Testing complejo:</strong> Dependencias entre servicios</li>
                <li><strong>Governance:</strong> Requiere gobernanza de servicios</li>
                <li><strong>Single point of failure:</strong> Si ESB cae, todo cae</li>
            </ul>
        </div>

        <h2 class="section-title">6. Cuándo Usar SOA</h2>

        <table>
            <thead>
                <tr>
                    <th>Escenario</th>
                    <th>SOA</th>
                    <th>Microservicios</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Enterprise grande</td>
                    <td>✅ SOA</td>
                    <td>⚠️ Complejo</td>
                </tr>
                <tr>
                    <td>Múltiples apps compartiendo lógica</td>
                    <td>✅ SOA</td>
                    <td>❌ Duplicación</td>
                </tr>
                <tr>
                    <td>Startup ágil</td>
                    <td>❌ Overhead</td>
                    <td>✅ Microservicios</td>
                </tr>
                <tr>
                    <td>Alta disponibilidad crítica</td>
                    <td>⚠️ ESB = SPOF</td>
                    <td>✅ Microservicios</td>
                </tr>
                <tr>
                    <td>Equipos independientes</td>
                    <td>⚠️ Governance</td>
                    <td>✅ Microservicios</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">7. Mejores Prácticas SOA</h2>

        <div class="alert alert-info">
            <strong>🎯 Best Practices:</strong>
            <ul class="mb-0">
                <li><strong>Service Contract:</strong> Interfaces explícitas</li>
                <li><strong>Versioning:</strong> Versionado de servicios (v1, v2)</li>
                <li><strong>Idempotencia:</strong> Operaciones idempotentes</li>
                <li><strong>Error Handling:</strong> Manejo consistente de errores</li>
                <li><strong>Logging:</strong> Trazabilidad entre servicios</li>
                <li><strong>Timeout:</strong> Timeouts para evitar cascading failures</li>
                <li><strong>Circuit Breaker:</strong> Protección contra servicios caídos</li>
                <li><strong>Service Discovery:</strong> Registro de servicios disponibles</li>
            </ul>
        </div>

        <h2 class="section-title">8. Evolución: SOA → Microservicios</h2>

        <pre><code class="language-plaintext">SOA (2000s)                 Microservicios (2010s+)
└─ ESB centralizado    →    └─ Comunicación directa
└─ Servicios grandes   →    └─ Servicios pequeños
└─ BD compartida       →    └─ BD por servicio
└─ SOAP/XML           →    └─ REST/JSON, gRPC
└─ Monolítico deploy  →    └─ Deploy independiente
└─ Gobernanza central →    └─ Autonomía de equipos
</code></pre>

        <div class="alert alert-success">
            <strong>💡 Recomendación PrestaShop:</strong>
            <ul class="mb-0">
                <li><strong>Core:</strong> Monolito modular con servicios (SOA ligero)</li>
                <li><strong>Integraciones:</strong> Microservicios externos</li>
                <li><strong>Background jobs:</strong> Workers independientes</li>
                <li><strong>Analytics:</strong> Servicio separado (no impacta ventas)</li>
            </ul>
        </div>
    </div>
`;

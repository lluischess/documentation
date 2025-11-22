// @ts-nocheck
const arquitecturaHexagonalPortsAdapters = `
    <div class="content-section">
        <h1 id="arquitectura-hexagonal-ports-adapters">Arquitectura Hexagonal (Ports and Adapters)</h1>
        <p>Clean Architecture aplicada a PrestaShop 8.9+ con inversión de dependencias y desacoplamiento total.</p>

        <h2 class="section-title">1. Concepto: Hexagonal Architecture</h2>

        <pre><code class="language-plaintext">         ┌─────────────────────────────────────┐
         │         ADAPTERS (OUT)             │
         │  ┌──────┐  ┌──────┐  ┌──────┐    │
         │  │ MySQL│  │Redis │  │Email │    │
         │  └───┬──┘  └───┬──┘  └───┬──┘    │
         │      │         │         │        │
         │  ┌───▼─────────▼─────────▼───┐   │
         │  │       PORTS (OUT)         │   │
         │  │  Interfaces/Contracts     │   │
         │  └───────────┬───────────────┘   │
         │              │                    │
         │      ┌───────▼────────┐          │
         │      │   CORE DOMAIN  │          │
         │      │  Business Logic│          │
         │      │  (PHP Objects) │          │
         │      └───────┬────────┘          │
         │              │                    │
         │  ┌───────────▼───────────────┐   │
         │  │       PORTS (IN)          │   │
         │  │    Use Cases/Commands     │   │
         │  └───┬───────────┬───────────┘   │
         │      │           │                │
         │  ┌───▼──┐    ┌──▼───┐           │
         │  │ HTTP │    │  CLI │            │
         │  └──────┘    └──────┘            │
         │         ADAPTERS (IN)             │
         └───────────────────────────────────┘

Regla: El CORE no depende de NADA externo
</code></pre>

        <h2 class="section-title">2. Implementación en PrestaShop</h2>

        <pre><code class="language-php"><?php
// CORE DOMAIN (sin dependencias externas)
namespace App\\Domain\\Order;

class Order
{
    private OrderId $id;
    private Money $total;
    private CustomerId $customerId;
    private array $items;
    
    public function place(): void
    {
        // Pure business logic
        if ($this->total->isZero()) {
            throw new EmptyOrderException();
        }
        
        $this->status = OrderStatus::PLACED;
        $this->recordEvent(new OrderPlaced($this->id));
    }
}

// PORT (Interfaz que define QUÉ necesita el dominio)
namespace App\\Domain\\Order;

interface OrderRepositoryInterface
{
    public function save(Order $order): void;
    public function findById(OrderId $id): ?Order;
}

// ADAPTER (Implementación CÓMO se hace)
namespace App\\Infrastructure\\Order;

class MysqlOrderRepository implements OrderRepositoryInterface
{
    private Db $db;
    
    public function save(Order $order): void
    {
        // Detalles de implementación MySQL
        $sql = 'INSERT INTO ' . _DB_PREFIX_ . 'orders 
                (id_order, reference, total_paid) 
                VALUES (?, ?, ?)';
        
        $this->db->execute($sql, [
            $order->getId()->value(),
            $order->getReference(),
            $order->getTotal()->amount()
        ]);
    }
}

// USE CASE (Application Layer)
namespace App\\Application\\Order;

class PlaceOrderUseCase
{
    // Depende del PORT, no del ADAPTER
    public function __construct(
        private OrderRepositoryInterface $orderRepository,
        private PaymentGatewayInterface $paymentGateway
    ) {}
    
    public function execute(PlaceOrderCommand $command): void
    {
        $order = Order::create(
            OrderId::fromString($command->orderId),
            Money::fromEuros($command->total)
        );
        
        $order->place();
        
        $this->orderRepository->save($order);
        $this->paymentGateway->charge($order);
    }
}

// CONTROLLER (Adapter IN - HTTP)
namespace App\\Adapter\\Http;

class OrderController
{
    public function __construct(
        private PlaceOrderUseCase $placeOrderUseCase
    ) {}
    
    public function placeOrder(Request $request): Response
    {
        $command = new PlaceOrderCommand(
            $request->get('order_id'),
            $request->get('total')
        );
        
        $this->placeOrderUseCase->execute($command);
        
        return new JsonResponse(['status' => 'ok']);
    }
}
</code></pre>

        <h2 class="section-title">3. Ports vs Adapters</h2>

        <table>
            <thead>
                <tr>
                    <th>Concepto</th>
                    <th>Descripción</th>
                    <th>Ejemplo</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Port (IN)</strong></td>
                    <td>Cómo el mundo exterior USA la app</td>
                    <td>Use Cases, Commands, Queries</td>
                </tr>
                <tr>
                    <td><strong>Adapter (IN)</strong></td>
                    <td>Implementación específica de entrada</td>
                    <td>HTTP Controller, CLI Command, GraphQL</td>
                </tr>
                <tr>
                    <td><strong>Port (OUT)</strong></td>
                    <td>Qué necesita la app del mundo exterior</td>
                    <td>Repository Interface, Gateway Interface</td>
                </tr>
                <tr>
                    <td><strong>Adapter (OUT)</strong></td>
                    <td>Implementación específica de salida</td>
                    <td>MySQL Repo, Redis Cache, SMTP Email</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">4. Ventajas</h2>

        <div class="alert alert-success">
            <strong>✅ Ventajas Hexagonal:</strong>
            <ul class="mb-0">
                <li><strong>Testability:</strong> Core 100% testable sin mocks</li>
                <li><strong>Flexibilidad:</strong> Cambiar MySQL → PostgreSQL sin tocar core</li>
                <li><strong>Independencia de frameworks:</strong> PrestaShop → Symfony sin cambiar lógica</li>
                <li><strong>Múltiples interfaces:</strong> HTTP + CLI + GraphQL al mismo core</li>
                <li><strong>Domain-centric:</strong> Lógica de negocio es el centro</li>
            </ul>
        </div>

        <h2 class="section-title">5. Comparación: Layered vs Hexagonal</h2>

        <table>
            <thead>
                <tr>
                    <th>Aspecto</th>
                    <th>Layered</th>
                    <th>Hexagonal</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Dirección dependencias</td>
                    <td>Top → Down</td>
                    <td>Todo → Core (inward)</td>
                </tr>
                <tr>
                    <td>Core depende de</td>
                    <td>Data Layer</td>
                    <td>NADA (puras interfaces)</td>
                </tr>
                <tr>
                    <td>Testing</td>
                    <td>Requiere mocks de BD</td>
                    <td>Pure unit tests</td>
                </tr>
                <tr>
                    <td>Complejidad</td>
                    <td>Media</td>
                    <td>Alta</td>
                </tr>
                <tr>
                    <td>Ideal para</td>
                    <td>Apps tradicionales</td>
                    <td>Domain-rich applications</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">6. Mejores Prácticas</h2>

        <div class="alert alert-info">
            <strong>🎯 Best Practices:</strong>
            <ul class="mb-0">
                <li>Core Domain sin dependencias externas (ni Doctrine, ni Eloquent)</li>
                <li>Ports como interfaces en el Core</li>
                <li>Adapters en Infrastructure layer</li>
                <li>Dependency Injection para conectar Ports y Adapters</li>
                <li>Use Cases representan funcionalidades del negocio</li>
                <li>DTOs para comunicación entre capas</li>
            </ul>
        </div>
    </div>
`;

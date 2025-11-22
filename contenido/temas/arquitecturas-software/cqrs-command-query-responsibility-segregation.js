// @ts-nocheck
const cqrsCommandQueryResponsibilitySegregation = `
    <div class="content-section">
        <h1 id="cqrs-command-query-responsibility-segregation">CQRS (Command Query Responsibility Segregation)</h1>
        <p>Separación de comandos (escritura) y consultas (lectura) en PrestaShop 8.9+ para escalabilidad y performance.</p>

        <h2 class="section-title">1. Concepto CQRS</h2>

        <pre><code class="language-plaintext">┌─────────────────────────────────────────────────┐
│               TRADICIONAL (CRUD)                 │
│  ┌──────┐    ┌──────────┐    ┌────────┐        │
│  │Client│───→│ Service  │───→│  MySQL │        │
│  └──────┘    │ (R/W)    │    └────────┘        │
│              └──────────┘                        │
│  Mismos modelos para lectura y escritura        │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│                    CQRS                          │
│                                                  │
│  WRITE SIDE                 READ SIDE           │
│  ┌──────┐  ┌────────┐      ┌─────────┐         │
│  │Client│─→│Command │      │  Query  │←─┐      │
│  └──────┘  │Handler │      │ Handler │  │      │
│             └───┬────┘      └────┬────┘  │      │
│                 │                 │       │      │
│            ┌────▼────┐      ┌────▼────┐  │      │
│            │ Write   │─────→│  Read   │  │      │
│            │   DB    │sync  │   DB    │  │      │
│            └─────────┘      └─────────┘  │      │
│             (MySQL)         (Redis/ES)   │      │
│                                           │      │
│  ┌──────┐                                │      │
│  │Client│────────────────────────────────┘      │
│  └──────┘       Queries directas                │
└─────────────────────────────────────────────────┘
</code></pre>

        <h2 class="section-title">2. Implementación en PrestaShop</h2>

        <h3>2.1. WRITE SIDE (Commands)</h3>

        <pre><code class="language-php"><?php
// Command (DTO - immutable)
namespace App\\Application\\Order\\Command;

final class CreateOrderCommand
{
    public function __construct(
        public readonly int $cartId,
        public readonly int $customerId,
        public readonly float $totalPaid
    ) {}
}

// Command Handler (WRITE)
namespace App\\Application\\Order\\CommandHandler;

final class CreateOrderCommandHandler
{
    public function __construct(
        private OrderRepository $orderRepository,
        private EventBus $eventBus
    ) {}
    
    public function handle(CreateOrderCommand $command): void
    {
        // Validación
        $cart = $this->cartRepository->find($command->cartId);
        
        if ($cart->isEmpty()) {
            throw new EmptyCartException();
        }
        
        // Creación (enfocado en escritura)
        $order = new Order(
            OrderId::generate(),
            CustomerId::fromInt($command->customerId),
            Money::fromFloat($command->totalPaid)
        );
        
        $order->place();
        
        // Persistencia en BD de escritura
        $this->orderRepository->save($order);
        
        // Event para sincronizar read model
        $this->eventBus->publish(new OrderCreated(
            $order->id(),
            $order->reference(),
            $order->total()
        ));
    }
}
</code></pre>

        <h3>2.2. READ SIDE (Queries)</h3>

        <pre><code class="language-php"><?php
// Query (DTO)
namespace App\\Application\\Order\\Query;

final class GetOrderDetailsQuery
{
    public function __construct(
        public readonly int $orderId
    ) {}
}

// Query Handler (READ)
namespace App\\Application\\Order\\QueryHandler;

final class GetOrderDetailsQueryHandler
{
    public function __construct(
        private ReadOrderRepository $readRepository  // Read-optimized
    ) {}
    
    public function handle(GetOrderDetailsQuery $query): OrderDetailsDTO
    {
        // Lectura optimizada (puede ser desde Redis, Elasticsearch)
        $orderDetails = $this->readRepository->findDetails($query->orderId);
        
        if (!$orderDetails) {
            throw new OrderNotFoundException();
        }
        
        return new OrderDetailsDTO(
            $orderDetails['id'],
            $orderDetails['reference'],
            $orderDetails['customer_name'],
            $orderDetails['total_paid'],
            $orderDetails['items'],  // Ya denormalizado
            $orderDetails['status']
        );
    }
}

// Read Repository (optimizado para queries)
namespace App\\Infrastructure\\Order\\Read;

final class RedisOrderReadRepository implements ReadOrderRepositoryInterface
{
    public function findDetails(int $orderId): ?array
    {
        // Cache Redis con datos denormalizados
        $cached = $this->redis->get("order:{$orderId}:details");
        
        if ($cached) {
            return json_decode($cached, true);
        }
        
        // Fallback a MySQL con JOIN optimizado
        $sql = 'SELECT 
                    o.id_order,
                    o.reference,
                    CONCAT(c.firstname, " ", c.lastname) as customer_name,
                    o.total_paid,
                    GROUP_CONCAT(od.product_name) as items,
                    os.name as status
                FROM ' . _DB_PREFIX_ . 'orders o
                INNER JOIN ' . _DB_PREFIX_ . 'customer c ON c.id_customer = o.id_customer
                INNER JOIN ' . _DB_PREFIX_ . 'order_detail od ON od.id_order = o.id_order
                INNER JOIN ' . _DB_PREFIX_ . 'order_state os ON os.id_order_state = o.current_state
                WHERE o.id_order = ' . (int)$orderId . '
                GROUP BY o.id_order';
        
        $result = Db::getInstance()->getRow($sql);
        
        // Cache por 1 hora
        $this->redis->setex("order:{$orderId}:details", 3600, json_encode($result));
        
        return $result;
    }
}
</code></pre>

        <h3>2.3. Event Sourcing (opcional con CQRS)</h3>

        <pre><code class="language-php"><?php
// Event Handler para sincronizar Read Model
namespace App\\Infrastructure\\Order\\EventHandler;

final class OrderCreatedEventHandler
{
    public function __construct(
        private RedisOrderReadRepository $readRepo
    ) {}
    
    public function handle(OrderCreated $event): void
    {
        // Actualizar el read model (denormalizado)
        $this->readRepo->updateCache($event->orderId, [
            'id' => $event->orderId,
            'reference' => $event->reference,
            'total_paid' => $event->total,
            'created_at' => $event->occurredOn,
        ]);
    }
}
</code></pre>

        <h2 class="section-title">3. CQRS en Controller</h2>

        <pre><code class="language-php"><?php
namespace App\\Controller;

class OrderController
{
    public function __construct(
        private CommandBus $commandBus,
        private QueryBus $queryBus
    ) {}
    
    // WRITE: Crear orden
    public function create(Request $request): Response
    {
        $command = new CreateOrderCommand(
            $request->get('cart_id'),
            $request->get('customer_id'),
            $request->get('total_paid')
        );
        
        $this->commandBus->dispatch($command);
        
        return new JsonResponse(['status' => 'created'], 201);
    }
    
    // READ: Obtener detalles
    public function show(int $id): Response
    {
        $query = new GetOrderDetailsQuery($id);
        $orderDetails = $this->queryBus->ask($query);
        
        return new JsonResponse($orderDetails);
    }
}
</code></pre>

        <h2 class="section-title">4. Ventajas y Desventajas</h2>

        <div class="alert alert-success">
            <strong>✅ Ventajas CQRS:</strong>
            <ul class="mb-0">
                <li><strong>Escalabilidad:</strong> Read DB puede ser replicada infinitamente</li>
                <li><strong>Performance:</strong> Queries optimizadas sin impactar escrituras</li>
                <li><strong>Denormalización:</strong> Read model denormalizado para queries rápidas</li>
                <li><strong>Seguridad:</strong> Separación entre lectura y escritura</li>
                <li><strong>Diferentes tecnologías:</strong> MySQL write, Redis/ES read</li>
                <li><strong>Escalado independiente:</strong> Más read replicas sin tocar write</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Desventajas:</strong>
            <ul class="mb-0">
                <li><strong>Complejidad:</strong> Mucho más complejo que CRUD</li>
                <li><strong>Eventual consistency:</strong> Puede haber delay entre write y read</li>
                <li><strong>Sincronización:</strong> Mantener ambos modelos sincronizados</li>
                <li><strong>Debugging:</strong> Más difícil de debuggear</li>
                <li><strong>Overhead:</strong> No vale la pena para apps simples</li>
            </ul>
        </div>

        <h2 class="section-title">5. Cuándo Usar CQRS</h2>

        <table>
            <thead>
                <tr>
                    <th>Escenario</th>
                    <th>Usar CQRS</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Lectura >> Escritura (90% reads)</td>
                    <td>✅ Sí</td>
                </tr>
                <tr>
                    <td>Queries complejas con muchos JOINs</td>
                    <td>✅ Sí</td>
                </tr>
                <tr>
                    <td>Alta concurrencia</td>
                    <td>✅ Sí</td>
                </tr>
                <tr>
                    <td>Escalabilidad crítica</td>
                    <td>✅ Sí</td>
                </tr>
                <tr>
                    <td>Aplicación simple (CRUD)</td>
                    <td>❌ No</td>
                </tr>
                <tr>
                    <td>Equipo pequeño sin experiencia</td>
                    <td>❌ No</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">6. Mejores Prácticas</h2>

        <div class="alert alert-info">
            <strong>🎯 Best Practices:</strong>
            <ul class="mb-0">
                <li>Commands inmutables (readonly properties)</li>
                <li>Queries sin side effects</li>
                <li>Event-driven para sincronizar read models</li>
                <li>Write DB normalizada, Read DB denormalizada</li>
                <li>Cache agresivo en read side</li>
                <li>Idempotencia en commands</li>
            </ul>
        </div>
    </div>
`;

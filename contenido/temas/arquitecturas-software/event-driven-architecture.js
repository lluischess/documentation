// @ts-nocheck
const eventDrivenArchitecture = `
    <div class="content-section">
        <h1 id="event-driven-architecture">Event-Driven Architecture (EDA)</h1>
        <p>Arquitectura basada en eventos para PrestaShop 8.9+ con comunicación asíncrona y desacoplamiento.</p>

        <h2 class="section-title">1. Concepto Event-Driven</h2>

        <pre><code class="language-plaintext">┌─────────────────────────────────────────────────┐
│              ARQUITECTURA TRADICIONAL            │
│  Service A ──→ Service B ──→ Service C          │
│  (sync, acoplado)                                │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│           EVENT-DRIVEN ARCHITECTURE              │
│                                                  │
│  ┌──────────┐                                   │
│  │Service A │───┐                               │
│  └──────────┘   │                               │
│                 ▼                                │
│          ┌──────────────┐                       │
│          │  Event Bus   │                       │
│          │ (RabbitMQ)   │                       │
│          └──┬───────┬───┘                       │
│             │       │                            │
│       ┌─────▼───┐ ┌▼────────┐                  │
│       │Service B│ │Service C│                  │
│       └─────────┘ └─────────┘                  │
│   (async, desacoplado, independiente)           │
└─────────────────────────────────────────────────┘
</code></pre>

        <h2 class="section-title">2. Implementación con RabbitMQ</h2>

        <pre><code class="language-php"><?php
// DOMAIN EVENT
namespace App\\Domain\\Order\\Event;

final class OrderPlaced
{
    public function __construct(
        public readonly int $orderId,
        public readonly string $reference,
        public readonly float $total,
        public readonly int $customerId,
        public readonly DateTimeImmutable $occurredOn
    ) {}
    
    public function toPrimitives(): array
    {
        return [
            'order_id' => $this->orderId,
            'reference' => $this->reference,
            'total' => $this->total,
            'customer_id' => $this->customerId,
            'occurred_on' => $this->occurredOn->format('Y-m-d H:i:s'),
        ];
    }
}

// EVENT BUS (Publisher)
namespace App\\Infrastructure\\Event;

use PhpAmqpLib\\Connection\\AMQPStreamConnection;
use PhpAmqpLib\\Message\\AMQPMessage;

final class RabbitMqEventBus
{
    private AMQPStreamConnection $connection;
    
    public function publish(DomainEvent $event): void
    {
        $channel = $this->connection->channel();
        
        $channel->exchange_declare(
            'domain_events',
            'topic',
            false,
            true,
            false
        );
        
        $message = new AMQPMessage(
            json_encode($event->toPrimitives()),
            ['delivery_mode' => AMQPMessage::DELIVERY_MODE_PERSISTENT]
        );
        
        $routingKey = str_replace('\\\\', '.', get_class($event));
        
        $channel->basic_publish(
            $message,
            'domain_events',
            $routingKey
        );
        
        $channel->close();
    }
}

// AGGREGATE (Publisher)
namespace App\\Domain\\Order;

class Order
{
    private array $events = [];
    
    public function place(): void
    {
        // Business logic
        $this->status = OrderStatus::PLACED;
        
        // Record event
        $this->recordEvent(new OrderPlaced(
            $this->id,
            $this->reference,
            $this->total,
            $this->customerId,
            new DateTimeImmutable()
        ));
    }
    
    private function recordEvent(DomainEvent $event): void
    {
        $this->events[] = $event;
    }
    
    public function releaseEvents(): array
    {
        $events = $this->events;
        $this->events = [];
        return $events;
    }
}

// USE CASE (publica eventos)
namespace App\\Application\\Order;

class PlaceOrderUseCase
{
    public function __construct(
        private OrderRepository $orderRepository,
        private EventBus $eventBus
    ) {}
    
    public function execute(PlaceOrderCommand $command): void
    {
        $order = Order::create(...);
        $order->place();
        
        $this->orderRepository->save($order);
        
        // Publish events asynchronously
        foreach ($order->releaseEvents() as $event) {
            $this->eventBus->publish($event);
        }
    }
}
</code></pre>

        <h2 class="section-title">3. Event Handlers (Consumers)</h2>

        <pre><code class="language-php"><?php
// EMAIL SERVICE (escucha OrderPlaced)
namespace App\\Application\\Order\\EventHandler;

final class SendOrderConfirmationEmail
{
    public function __construct(
        private MailerInterface $mailer,
        private CustomerRepository $customerRepository
    ) {}
    
    public function handle(OrderPlaced $event): void
    {
        $customer = $this->customerRepository->find($event->customerId);
        
        $this->mailer->send(
            $customer->email,
            'Order Confirmation',
            'emails/order_confirmation.html',
            ['order' => $event]
        );
    }
}

// INVENTORY SERVICE (escucha OrderPlaced)
namespace App\\Application\\Inventory\\EventHandler;

final class DecreaseStockOnOrderPlaced
{
    public function __construct(
        private StockRepository $stockRepository
    ) {}
    
    public function handle(OrderPlaced $event): void
    {
        $order = $this->orderRepository->find($event->orderId);
        
        foreach ($order->items() as $item) {
            $this->stockRepository->decrease(
                $item->productId,
                $item->quantity
            );
        }
    }
}

// ANALYTICS SERVICE (escucha OrderPlaced)
namespace App\\Application\\Analytics\\EventHandler;

final class TrackOrderInAnalytics
{
    public function __construct(
        private AnalyticsClient $analytics
    ) {}
    
    public function handle(OrderPlaced $event): void
    {
        $this->analytics->track('order_placed', [
            'order_id' => $event->orderId,
            'total' => $event->total,
            'customer_id' => $event->customerId,
        ]);
    }
}
</code></pre>

        <h2 class="section-title">4. Worker Consumer</h2>

        <pre><code class="language-php"><?php
// bin/console rabbitmq:consume
namespace App\\Infrastructure\\Event;

use PhpAmqpLib\\Connection\\AMQPStreamConnection;

final class RabbitMqEventConsumer
{
    private AMQPStreamConnection $connection;
    private array $handlers;
    
    public function consume(string $queueName): void
    {
        $channel = $this->connection->channel();
        
        $channel->queue_declare(
            $queueName,
            false,
            true,
            false,
            false
        );
        
        $channel->queue_bind(
            $queueName,
            'domain_events',
            'App.Domain.Order.Event.OrderPlaced'
        );
        
        $callback = function ($msg) {
            $eventData = json_decode($msg->body, true);
            $event = OrderPlaced::fromPrimitives($eventData);
            
            foreach ($this->handlers as $handler) {
                try {
                    $handler->handle($event);
                    $msg->ack();
                } catch (\\Exception $e) {
                    $msg->nack(true); // Requeue
                }
            }
        };
        
        $channel->basic_consume(
            $queueName,
            '',
            false,
            false,
            false,
            false,
            $callback
        );
        
        while ($channel->is_consuming()) {
            $channel->wait();
        }
    }
}
</code></pre>

        <h2 class="section-title">5. Ventajas y Desventajas</h2>

        <div class="alert alert-success">
            <strong>✅ Ventajas EDA:</strong>
            <ul class="mb-0">
                <li><strong>Desacoplamiento:</strong> Servicios independientes</li>
                <li><strong>Escalabilidad:</strong> Añadir consumers sin modificar publishers</li>
                <li><strong>Asincronía:</strong> No bloquea el flujo principal</li>
                <li><strong>Resiliencia:</strong> Si un consumer cae, queue almacena eventos</li>
                <li><strong>Auditoría:</strong> Todos los eventos están registrados</li>
                <li><strong>Flexibilidad:</strong> Añadir nuevos handlers sin modificar código</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Desventajas:</strong>
            <ul class="mb-0">
                <li><strong>Complejidad:</strong> Infraestructura adicional (RabbitMQ, workers)</li>
                <li><strong>Eventual consistency:</strong> No inmediato</li>
                <li><strong>Debugging difícil:</strong> Flujos asíncronos complejos</li>
                <li><strong>Duplicados:</strong> Manejo de idempotencia necesario</li>
                <li><strong>Orden no garantizado:</strong> Sin configuración especial</li>
            </ul>
        </div>

        <h2 class="section-title">6. Mejores Prácticas</h2>

        <div class="alert alert-info">
            <strong>🎯 Best Practices:</strong>
            <ul class="mb-0">
                <li>Eventos inmutables (readonly)</li>
                <li>Idempotencia en handlers</li>
                <li>Dead letter queue para fallos</li>
                <li>Retry policy (exponential backoff)</li>
                <li>Monitoring de queues</li>
                <li>Event versioning para cambios</li>
                <li>Transaction outbox pattern</li>
            </ul>
        </div>
    </div>
`;

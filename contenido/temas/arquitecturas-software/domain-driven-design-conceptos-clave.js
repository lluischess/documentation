// @ts-nocheck
const domainDrivenDesignConceptosClave = `
    <div class="content-section">
        <h1 id="domain-driven-design-conceptos-clave">Domain-Driven Design (DDD) - Conceptos Clave</h1>
        <p>Principios fundamentales de DDD aplicados a PrestaShop 8.9+ para modelar dominios complejos.</p>

        <h2 class="section-title">1. Conceptos Clave DDD</h2>

        <h3>1.1. Ubiquitous Language</h3>
        <p>Lenguaje común entre developers y domain experts.</p>

        <pre><code class="language-php"><?php
// ❌ MAL: Lenguaje técnico
class PS_Order {
    public function setStatusId($id) {}
}

// ✅ BIEN: Ubiquitous Language
class Order {
    public function markAsPaid(): void {}
    public function ship(): void {}
    public function cancel(): void {}
}
</code></pre>

        <h3>1.2. Bounded Context</h3>
        <p>Fronteras explícitas donde un modelo se aplica.</p>

        <pre><code class="language-plaintext">┌──────────────────────────────────────────┐
│            E-COMMERCE SYSTEM             │
│                                          │
│  ┌──────────────┐  ┌──────────────────┐ │
│  │   CATALOG    │  │     ORDER        │ │
│  │              │  │                  │ │
│  │ Product      │  │ Order            │ │
│  │ Category     │  │ OrderLine        │ │
│  │ Price        │  │ Payment          │ │
│  └──────────────┘  └──────────────────┘ │
│                                          │
│  ┌──────────────┐  ┌──────────────────┐ │
│  │   SHIPPING   │  │   INVENTORY      │ │
│  │              │  │                  │ │
│  │ Shipment     │  │ Stock            │ │
│  │ Carrier      │  │ Warehouse        │ │
│  └──────────────┘  └──────────────────┘ │
│                                          │
│  Cada contexto tiene su propio modelo   │
└──────────────────────────────────────────┘
</code></pre>

        <h3>1.3. Entities vs Value Objects</h3>

        <pre><code class="language-php"><?php
// ENTITY (tiene identidad)
namespace App\\Domain\\Order;

final class Order
{
    private OrderId $id;  // Identidad única
    private Money $total;
    
    public function equals(Order $other): bool
    {
        // Se compara por ID
        return $this->id->equals($other->id);
    }
}

// VALUE OBJECT (sin identidad, inmutable)
namespace App\\Domain\\Shared;

final class Money
{
    public function __construct(
        private readonly float $amount,
        private readonly Currency $currency
    ) {}
    
    public function equals(Money $other): bool
    {
        // Se compara por valor
        return $this->amount === $other->amount 
            && $this->currency->equals($other->currency);
    }
    
    public function add(Money $other): Money
    {
        // Inmutable, retorna nuevo objeto
        return new Money(
            $this->amount + $other->amount,
            $this->currency
        );
    }
}
</code></pre>

        <h3>1.4. Aggregates</h3>

        <pre><code class="language-php"><?php
// AGGREGATE ROOT
namespace App\\Domain\\Order;

final class Order  // Aggregate Root
{
    private OrderId $id;
    private CustomerId $customerId;
    private OrderLines $lines;  // Entities dentro del aggregate
    
    // Solo Order puede modificar OrderLines
    public function addLine(ProductId $productId, int $quantity): void
    {
        // Validaciones de negocio
        if ($quantity <= 0) {
            throw new InvalidQuantityException();
        }
        
        $this->lines->add(new OrderLine(
            $productId,
            $quantity,
            $this->calculateLinePrice($productId, $quantity)
        ));
    }
    
    // No se accede directamente a OrderLine
    // Todas las operaciones pasan por Order (Aggregate Root)
}

// ENTITY dentro del aggregate
final class OrderLine
{
    private OrderLineId $id;
    private ProductId $productId;
    private int $quantity;
    private Money $price;
    
    // Constructor privado, solo Order puede crear OrderLines
    private function __construct() {}
}
</code></pre>

        <h3>1.5. Domain Services</h3>

        <pre><code class="language-php"><?php
// Domain Service (lógica que no pertenece a una entidad)
namespace App\\Domain\\Order;

final class OrderPricingService
{
    public function calculateTotal(
        Order $order,
        Customer $customer,
        Catalog $catalog
    ): Money {
        $subtotal = Money::zero();
        
        foreach ($order->lines() as $line) {
            $product = $catalog->findProduct($line->productId());
            $price = $product->priceFor($customer);
            $subtotal = $subtotal->add($price->multiply($line->quantity()));
        }
        
        // Aplicar descuentos
        $discount = $customer->calculateDiscount($subtotal);
        
        return $subtotal->subtract($discount);
    }
}
</code></pre>

        <h3>1.6. Repositories</h3>

        <pre><code class="language-php"><?php
// Repository Interface (Domain)
namespace App\\Domain\\Order;

interface OrderRepositoryInterface
{
    public function save(Order $order): void;
    public function findById(OrderId $id): ?Order;
    public function findByCustomer(CustomerId $customerId): array;
    public function nextIdentity(): OrderId;
}

// Repository Implementation (Infrastructure)
namespace App\\Infrastructure\\Order;

final class MysqlOrderRepository implements OrderRepositoryInterface
{
    public function save(Order $order): void
    {
        // Mapeo de aggregate a tablas
        $sql = 'INSERT INTO ' . _DB_PREFIX_ . 'orders ...';
        
        // Guardar aggregate root
        Db::getInstance()->execute($sql);
        
        // Guardar entities del aggregate
        foreach ($order->lines() as $line) {
            $this->saveOrderLine($line);
        }
    }
}
</code></pre>

        <h3>1.7. Domain Events</h3>

        <pre><code class="language-php"><?php
// Domain Event
namespace App\\Domain\\Order\\Event;

final class OrderPlaced implements DomainEvent
{
    public function __construct(
        public readonly OrderId $orderId,
        public readonly CustomerId $customerId,
        public readonly Money $total,
        public readonly DateTimeImmutable $occurredOn
    ) {}
}

// Aggregate emite eventos
final class Order
{
    private array $events = [];
    
    public function place(): void
    {
        // Business logic
        $this->status = OrderStatus::PLACED;
        
        // Record event
        $this->events[] = new OrderPlaced(
            $this->id,
            $this->customerId,
            $this->total,
            new DateTimeImmutable()
        );
    }
    
    public function releaseEvents(): array
    {
        $events = $this->events;
        $this->events = [];
        return $events;
    }
}
</code></pre>

        <h2 class="section-title">2. Estructura DDD en PrestaShop</h2>

        <pre><code class="language-php"><?php
src/
├── Domain/              # Core Business Logic
│   ├── Order/
│   │   ├── Order.php                    # Aggregate Root
│   │   ├── OrderId.php                  # Value Object
│   │   ├── OrderLine.php                # Entity
│   │   ├── OrderStatus.php              # Value Object
│   │   ├── OrderRepositoryInterface.php # Port
│   │   ├── Event/
│   │   │   ├── OrderPlaced.php
│   │   │   └── OrderCancelled.php
│   │   └── Service/
│   │       └── OrderPricingService.php  # Domain Service
│   │
│   └── Shared/
│       ├── Money.php                    # Value Object compartido
│       └── Currency.php
│
├── Application/         # Use Cases
│   └── Order/
│       ├── Command/
│       │   └── PlaceOrderCommand.php
│       └── CommandHandler/
│           └── PlaceOrderCommandHandler.php
│
└── Infrastructure/      # Detalles técnicos
    └── Order/
        ├── MysqlOrderRepository.php
        └── EventHandler/
            └── SendOrderConfirmationEmail.php
</code></pre>

        <h2 class="section-title">3. Ventajas y Desventajas</h2>

        <div class="alert alert-success">
            <strong>✅ Ventajas DDD:</strong>
            <ul class="mb-0">
                <li><strong>Modelado rico:</strong> Lógica de negocio en el dominio</li>
                <li><strong>Ubiquitous Language:</strong> Comunicación clara con negocio</li>
                <li><strong>Testability:</strong> Domain puro, fácil de testear</li>
                <li><strong>Mantenibilidad:</strong> Cambios localizados en bounded contexts</li>
                <li><strong>Escalabilidad:</strong> Bounded contexts pueden ser microservicios</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Desventajas:</strong>
            <ul class="mb-0">
                <li><strong>Complejidad:</strong> Curva de aprendizaje alta</li>
                <li><strong>Over-engineering:</strong> Para dominios simples</li>
                <li><strong>Tiempo de desarrollo:</strong> Más lento inicialmente</li>
                <li><strong>Equipo experimentado:</strong> Requiere conocimiento de DDD</li>
            </ul>
        </div>

        <h2 class="section-title">4. Cuándo Usar DDD</h2>

        <table>
            <thead>
                <tr>
                    <th>Escenario</th>
                    <th>Usar DDD</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Dominio complejo con reglas de negocio</td>
                    <td>✅ Sí</td>
                </tr>
                <tr>
                    <td>Proyecto a largo plazo (> 2 años)</td>
                    <td>✅ Sí</td>
                </tr>
                <tr>
                    <td>Colaboración cercana con domain experts</td>
                    <td>✅ Sí</td>
                </tr>
                <tr>
                    <td>CRUD simple</td>
                    <td>❌ No</td>
                </tr>
                <tr>
                    <td>MVP rápido</td>
                    <td>❌ No</td>
                </tr>
                <tr>
                    <td>Equipo sin experiencia DDD</td>
                    <td>❌ No</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">5. Mejores Prácticas</h2>

        <div class="alert alert-info">
            <strong>🎯 Best Practices:</strong>
            <ul class="mb-0">
                <li>Modelar siempre con domain experts</li>
                <li>Ubiquitous Language en código y conversaciones</li>
                <li>Bounded Contexts pequeños y cohesivos</li>
                <li>Aggregates pequeños (idealmente 1 entity root + VOs)</li>
                <li>Value Objects inmutables</li>
                <li>Domain Events para comunicación entre contexts</li>
                <li>Repository retorna aggregates completos</li>
            </ul>
        </div>
    </div>
`;

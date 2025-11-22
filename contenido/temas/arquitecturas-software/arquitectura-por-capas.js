// @ts-nocheck
const arquitecturaPorCapas = `
    <div class="content-section">
        <h1 id="arquitectura-por-capas">Arquitectura por Capas (Layered Architecture)</h1>
        <p>Patrón de arquitectura por capas aplicado a PrestaShop 8.9+ con separación de responsabilidades.</p>

        <h2 class="section-title">1. Arquitectura de 3 Capas Clásica</h2>

        <pre><code class="language-plaintext">┌────────────────────────────────────┐
│     Presentation Layer (UI)        │  ← Controllers, Views, Templates
├────────────────────────────────────┤
│     Business Logic Layer (BLL)     │  ← Services, Domain Logic
├────────────────────────────────────┤
│     Data Access Layer (DAL)        │  ← Repositories, ORM, DB
└────────────────────────────────────┘

Regla: Cada capa solo puede comunicarse con la capa inmediatamente inferior
</code></pre>

        <h2 class="section-title">2. Implementación en PrestaShop</h2>

        <pre><code class="language-php"><?php
// PRESENTATION LAYER
// controllers/front/ProductController.php
class ProductController extends FrontController
{
    public function initContent()
    {
        parent::initContent();
        
        // Solo maneja la presentación
        $productService = new ProductService();
        $product = $productService->getProductById((int)Tools::getValue('id_product'));
        
        $this->context->smarty->assign([
            'product' => $product,
        ]);
        
        $this->setTemplate('product.tpl');
    }
}

// BUSINESS LOGIC LAYER
// src/Service/ProductService.php
namespace App\\Service;

class ProductService
{
    private ProductRepository $productRepository;
    private StockService $stockService;
    
    public function __construct(
        ProductRepository $productRepository,
        StockService $stockService
    ) {
        $this->productRepository = $productRepository;
        $this->stockService = $stockService;
    }
    
    public function getProductById(int $id): array
    {
        // Lógica de negocio
        $product = $this->productRepository->findById($id);
        
        if (!$product) {
            throw new ProductNotFoundException();
        }
        
        // Validaciones de negocio
        if (!$product->active) {
            throw new ProductNotAvailableException();
        }
        
        // Enriquecimiento con stock
        $product['stock'] = $this->stockService->getAvailableQuantity($id);
        
        return $product;
    }
}

// DATA ACCESS LAYER
// src/Repository/ProductRepository.php
namespace App\\Repository;

class ProductRepository
{
    private Db $db;
    
    public function findById(int $id): ?array
    {
        // Solo acceso a datos, sin lógica de negocio
        $sql = 'SELECT * FROM ' . _DB_PREFIX_ . 'product 
                WHERE id_product = ' . (int)$id;
        
        return Db::getInstance()->getRow($sql);
    }
    
    public function findActive(): array
    {
        $sql = 'SELECT * FROM ' . _DB_PREFIX_ . 'product 
                WHERE active = 1';
        
        return Db::getInstance()->executeS($sql);
    }
}
</code></pre>

        <h2 class="section-title">3. Arquitectura de 4 Capas (N-Tier)</h2>

        <pre><code class="language-plaintext">┌────────────────────────────────────┐
│     Presentation Layer             │  Controllers, Views
├────────────────────────────────────┤
│     Application Layer              │  Use Cases, Commands, Queries
├────────────────────────────────────┤
│     Domain Layer                   │  Entities, Value Objects, Rules
├────────────────────────────────────┤
│     Infrastructure Layer           │  DB, File System, External APIs
└────────────────────────────────────┘
</code></pre>

        <pre><code class="language-php"><?php
// DOMAIN LAYER (Core Business)
namespace App\\Domain\\Order;

class Order
{
    private int $id;
    private Money $total;
    private OrderStatus $status;
    private array $items;
    
    public function placeOrder(): void
    {
        // Domain logic
        if ($this->total->isLessThan(Money::fromEuros(10))) {
            throw new MinimumOrderAmountException();
        }
        
        $this->status = OrderStatus::PENDING_PAYMENT;
        $this->recordEvent(new OrderPlaced($this->id));
    }
}

// APPLICATION LAYER (Use Cases)
namespace App\\Application\\Order;

class PlaceOrderUseCase
{
    public function execute(PlaceOrderCommand $command): void
    {
        $cart = $this->cartRepository->findById($command->cartId);
        $order = Order::fromCart($cart);
        $order->placeOrder();
        
        $this->orderRepository->save($order);
        $this->eventBus->publish($order->releaseEvents());
    }
}

// INFRASTRUCTURE LAYER
namespace App\\Infrastructure\\Order;

class MysqlOrderRepository implements OrderRepositoryInterface
{
    public function save(Order $order): void
    {
        // Persistencia concreta
        $sql = 'INSERT INTO ' . _DB_PREFIX_ . 'orders ...';
        Db::getInstance()->execute($sql);
    }
}
</code></pre>

        <h2 class="section-title">4. Ventajas y Desventajas</h2>

        <div class="alert alert-success">
            <strong>✅ Ventajas:</strong>
            <ul class="mb-0">
                <li>Separación clara de responsabilidades</li>
                <li>Fácil de entender y mantener</li>
                <li>Testing por capas</li>
                <li>Reutilización de lógica de negocio</li>
                <li>Cambios de UI sin afectar lógica</li>
                <li>Cambios de BD sin afectar negocio</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Desventajas:</strong>
            <ul class="mb-0">
                <li>Puede ser over-engineering para apps simples</li>
                <li>Performance overhead (múltiples capas)</li>
                <li>Rigidez en la estructura</li>
                <li>Difícil hacer cambios transversales</li>
            </ul>
        </div>

        <h2 class="section-title">5. Mejores Prácticas</h2>

        <div class="alert alert-info">
            <strong>🎯 Best Practices:</strong>
            <ul class="mb-0">
                <li><strong>Dependency Inversion:</strong> Capas superiores dependen de interfaces, no implementaciones</li>
                <li><strong>Single Responsibility:</strong> Cada capa una responsabilidad</li>
                <li><strong>No skip layers:</strong> Presentation no puede llamar DAL directamente</li>
                <li><strong>DTOs:</strong> Usar Data Transfer Objects entre capas</li>
                <li><strong>Testing:</strong> Unit tests por capa</li>
            </ul>
        </div>
    </div>
`;

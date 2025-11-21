// @ts-nocheck
const transaccionesAcid = `
    <div class="content-section">
        <h1 id="transacciones-acid">Transacciones SQL y Propiedades ACID</h1>
        <p>Las transacciones son fundamentales para garantizar la integridad de datos en aplicaciones empresariales. En PrestaShop 8.9+ con PHP 8.1+ y MySQL 8.0+/InnoDB, las transacciones ACID aseguran que las operaciones críticas (pedidos, pagos, inventario) se ejecuten de manera confiable y consistente.</p>

        <h2 class="section-title">1. Fundamentos de Transacciones</h2>

        <h3>1.1. ¿Qué es una Transacción?</h3>
        <p>Una transacción es una unidad lógica de trabajo que consiste en una o más operaciones SQL que se ejecutan como un todo indivisible: todo se completa exitosamente o nada se aplica.</p>

        <div class="alert alert-info">
            <strong>💡 Operaciones de Transacción:</strong>
            <ul class="mb-0">
                <li><strong>BEGIN/START TRANSACTION</strong>: Inicia una transacción</li>
                <li><strong>COMMIT</strong>: Confirma y aplica todos los cambios</li>
                <li><strong>ROLLBACK</strong>: Cancela todos los cambios desde el BEGIN</li>
                <li><strong>SAVEPOINT</strong>: Crea un punto de restauración parcial</li>
            </ul>
        </div>

        <h3>1.2. Sintaxis Básica</h3>

        <pre><code class="language-sql">-- Transacción simple
START TRANSACTION;

UPDATE ps_product SET quantity = quantity - 1 WHERE id_product = 5;
INSERT INTO ps_order_detail (id_order, product_id, product_quantity) VALUES (100, 5, 1);

COMMIT;  -- Si todo va bien

-- Si hay error
ROLLBACK;  -- Deshace todos los cambios</code></pre>

        <h2 class="section-title">2. Propiedades ACID</h2>

        <h3>2.1. Atomicity (Atomicidad)</h3>
        <p><strong>Todo o Nada:</strong> Una transacción se ejecuta completamente o no se ejecuta en absoluto. No hay estados intermedios.</p>

        <pre><code class="language-sql">-- Ejemplo: Transferencia de stock entre almacenes
START TRANSACTION;

-- Restar stock del almacén origen
UPDATE ps_stock_available 
SET quantity = quantity - 10 
WHERE id_product = 100 AND id_shop = 1;

-- Añadir stock al almacén destino
UPDATE ps_stock_available 
SET quantity = quantity + 10 
WHERE id_product = 100 AND id_shop = 2;

-- Si ambas operaciones tienen éxito
COMMIT;

-- Si alguna falla, ninguna se aplica
-- ROLLBACK;</code></pre>

        <div class="alert alert-success">
            <strong>✅ Garantía:</strong> Si hay un fallo de red o error entre las dos operaciones UPDATE, ninguna se aplicará. El stock nunca quedará inconsistente.
        </div>

        <h3>2.2. Consistency (Consistencia)</h3>
        <p><strong>Reglas de Integridad:</strong> Una transacción lleva la base de datos de un estado válido a otro estado válido, respetando todas las restricciones.</p>

        <pre><code class="language-sql">-- Ejemplo: Crear pedido con validación de stock
START TRANSACTION;

-- Verificar stock disponible
SELECT quantity INTO @stock FROM ps_product WHERE id_product = 50;

-- Solo proceder si hay stock suficiente
IF @stock >= 5 THEN
    -- Reducir stock
    UPDATE ps_product SET quantity = quantity - 5 WHERE id_product = 50;
    
    -- Crear pedido
    INSERT INTO ps_orders (id_customer, total_paid, current_state) 
    VALUES (10, 99.99, 2);
    
    -- Insertar detalle
    INSERT INTO ps_order_detail (id_order, product_id, product_quantity) 
    VALUES (LAST_INSERT_ID(), 50, 5);
    
    COMMIT;
ELSE
    ROLLBACK;
END IF;</code></pre>

        <h3>2.3. Isolation (Aislamiento)</h3>
        <p><strong>Transacciones Concurrentes:</strong> Las transacciones se ejecutan de forma aislada. Los cambios de una transacción no son visibles para otras hasta que se confirmen.</p>

        <h4>Niveles de Aislamiento</h4>

        <table class="table table-bordered">
            <thead class="table-dark">
                <tr>
                    <th>Nivel</th>
                    <th>Dirty Read</th>
                    <th>Non-Repeatable Read</th>
                    <th>Phantom Read</th>
                    <th>Rendimiento</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>READ UNCOMMITTED</strong></td>
                    <td>❌ Posible</td>
                    <td>❌ Posible</td>
                    <td>❌ Posible</td>
                    <td>⚡⚡⚡⚡⚡ Máximo</td>
                </tr>
                <tr>
                    <td><strong>READ COMMITTED</strong></td>
                    <td>✅ Prevenido</td>
                    <td>❌ Posible</td>
                    <td>❌ Posible</td>
                    <td>⚡⚡⚡⚡ Alto</td>
                </tr>
                <tr>
                    <td><strong>REPEATABLE READ</strong></td>
                    <td>✅ Prevenido</td>
                    <td>✅ Prevenido</td>
                    <td>❌ Posible</td>
                    <td>⚡⚡⚡ Medio (MySQL default)</td>
                </tr>
                <tr>
                    <td><strong>SERIALIZABLE</strong></td>
                    <td>✅ Prevenido</td>
                    <td>✅ Prevenido</td>
                    <td>✅ Prevenido</td>
                    <td>⚡⚡ Bajo</td>
                </tr>
            </tbody>
        </table>

        <pre><code class="language-sql">-- Configurar nivel de aislamiento para la sesión
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;

-- Configurar para una transacción específica
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
START TRANSACTION;
-- ... queries ...
COMMIT;</code></pre>

        <h4>Problemas de Concurrencia</h4>

        <div class="row">
            <div class="col-md-4">
                <div class="card mb-3">
                    <div class="card-header bg-warning">Dirty Read</div>
                    <div class="card-body">
                        <p class="small">Leer datos no confirmados de otra transacción</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card mb-3">
                    <div class="card-header bg-warning">Non-Repeatable Read</div>
                    <div class="card-body">
                        <p class="small">Leer dos veces el mismo dato y obtener valores diferentes</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card mb-3">
                    <div class="card-header bg-warning">Phantom Read</div>
                    <div class="card-body">
                        <p class="small">Nuevas filas aparecen entre dos lecturas de la misma query</p>
                    </div>
                </div>
            </div>
        </div>

        <h3>2.4. Durability (Durabilidad)</h3>
        <p><strong>Persistencia:</strong> Una vez que una transacción se confirma (COMMIT), los cambios son permanentes, incluso si hay un fallo del sistema.</p>

        <pre><code class="language-sql">-- Una vez ejecutado COMMIT, los datos persisten
START TRANSACTION;
INSERT INTO ps_customer (email, firstname, lastname) 
VALUES ('cliente@example.com', 'Juan', 'Pérez');
COMMIT;  -- Los datos están guardados permanentemente

-- Incluso si el servidor falla aquí, el cliente está registrado</code></pre>

        <h2 class="section-title">3. Casos de Uso en PrestaShop</h2>

        <h3>3.1. Procesamiento de Pedidos</h3>

        <pre><code class="language-sql">-- Crear pedido con múltiples operaciones atómicas
START TRANSACTION;

-- 1. Crear el pedido
INSERT INTO ps_orders (
    id_customer, 
    id_cart, 
    id_currency, 
    id_lang, 
    id_carrier,
    total_paid, 
    total_paid_real,
    current_state,
    payment,
    module,
    date_add
) VALUES (
    10,  -- id_customer
    150, -- id_cart
    1,   -- EUR
    1,   -- Spanish
    2,   -- Carrier
    129.99,
    129.99,
    2,   -- Payment accepted
    'Credit Card',
    'stripe',
    NOW()
);

SET @order_id = LAST_INSERT_ID();

-- 2. Copiar productos del carrito al detalle del pedido
INSERT INTO ps_order_detail (
    id_order,
    product_id,
    product_attribute_id,
    product_name,
    product_quantity,
    product_price,
    unit_price_tax_incl,
    total_price_tax_incl
)
SELECT 
    @order_id,
    cd.id_product,
    cd.id_product_attribute,
    pl.name,
    cd.quantity,
    p.price,
    p.price * 1.21,  -- Con IVA 21%
    (p.price * 1.21) * cd.quantity
FROM ps_cart_product cd
INNER JOIN ps_product p ON cd.id_product = p.id_product
INNER JOIN ps_product_lang pl ON p.id_product = pl.id_product AND pl.id_lang = 1
WHERE cd.id_cart = 150;

-- 3. Reducir stock de cada producto
UPDATE ps_product p
INNER JOIN ps_cart_product cd ON p.id_product = cd.id_product
SET p.quantity = p.quantity - cd.quantity
WHERE cd.id_cart = 150;

-- 4. Vaciar el carrito
DELETE FROM ps_cart_product WHERE id_cart = 150;

-- 5. Crear historial de estado
INSERT INTO ps_order_history (
    id_order,
    id_order_state,
    date_add
) VALUES (
    @order_id,
    2,  -- Payment accepted
    NOW()
);

-- Si todo va bien, confirmar
COMMIT;

-- Si hay algún error, revertir todo
-- ROLLBACK;</code></pre>

        <h3>3.2. Gestión de Inventario con Reservas</h3>

        <pre><code class="language-sql">-- Sistema de reserva de stock
START TRANSACTION;

-- Bloquear la fila para evitar overselling (FOR UPDATE)
SELECT quantity 
FROM ps_product 
WHERE id_product = 25 
FOR UPDATE;

-- Verificar disponibilidad
SET @available = (
    SELECT quantity FROM ps_product WHERE id_product = 25
);

IF @available >= 3 THEN
    -- Reducir stock
    UPDATE ps_product 
    SET quantity = quantity - 3 
    WHERE id_product = 25;
    
    -- Registrar reserva
    INSERT INTO ps_stock_mvt (
        id_product,
        id_stock_mvt_reason,
        quantity,
        date_add
    ) VALUES (
        25,
        3,  -- Customer order
        -3,
        NOW()
    );
    
    SELECT 'Reserva exitosa' AS result;
    COMMIT;
ELSE
    SELECT 'Stock insuficiente' AS result;
    ROLLBACK;
END IF;</code></pre>

        <h3>3.3. Transferencia de Crédito entre Clientes</h3>

        <pre><code class="language-sql">-- Transferir crédito de tienda entre clientes
START TRANSACTION;

DECLARE @amount DECIMAL(10,2) = 50.00;
DECLARE @from_customer INT = 10;
DECLARE @to_customer INT = 20;

-- Bloquear ambas cuentas
SELECT balance FROM ps_customer_balance WHERE id_customer = @from_customer FOR UPDATE;
SELECT balance FROM ps_customer_balance WHERE id_customer = @to_customer FOR UPDATE;

-- Verificar saldo suficiente
IF (SELECT balance FROM ps_customer_balance WHERE id_customer = @from_customer) >= @amount THEN
    
    -- Restar del origen
    UPDATE ps_customer_balance 
    SET balance = balance - @amount
    WHERE id_customer = @from_customer;
    
    -- Añadir al destino
    UPDATE ps_customer_balance 
    SET balance = balance + @amount
    WHERE id_customer = @to_customer;
    
    -- Registrar movimientos
    INSERT INTO ps_balance_history (id_customer, amount, type, date_add)
    VALUES 
        (@from_customer, -@amount, 'transfer_out', NOW()),
        (@to_customer, @amount, 'transfer_in', NOW());
    
    COMMIT;
ELSE
    ROLLBACK;
END IF;</code></pre>

        <h2 class="section-title">4. SAVEPOINT - Puntos de Restauración</h2>

        <h3>4.1. Uso de SAVEPOINT</h3>
        <p>Los SAVEPOINT permiten revertir parcialmente una transacción sin cancelar toda la operación.</p>

        <pre><code class="language-sql">-- Crear pedido con múltiples ítems, con validación por ítem
START TRANSACTION;

-- Crear pedido principal
INSERT INTO ps_orders (id_customer, total_paid, current_state) 
VALUES (15, 0, 1);

SET @order_id = LAST_INSERT_ID();

-- Procesar primer producto
SAVEPOINT product1;
INSERT INTO ps_order_detail (id_order, product_id, product_quantity, product_price)
VALUES (@order_id, 10, 2, 29.99);

-- Si el producto 10 no tiene stock, revertir solo este ítem
-- ROLLBACK TO SAVEPOINT product1;

-- Procesar segundo producto
SAVEPOINT product2;
INSERT INTO ps_order_detail (id_order, product_id, product_quantity, product_price)
VALUES (@order_id, 20, 1, 49.99);

-- Si el producto 20 no tiene stock
-- ROLLBACK TO SAVEPOINT product2;

-- Actualizar total del pedido
UPDATE ps_orders 
SET total_paid = (
    SELECT SUM(product_quantity * product_price) 
    FROM ps_order_detail 
    WHERE id_order = @order_id
)
WHERE id_order = @order_id;

COMMIT;</code></pre>

        <h2 class="section-title">5. Implementación en PHP 8.1+ con PrestaShop</h2>

        <h3>5.1. Transacciones con Db de PrestaShop</h3>

        <pre><code class="language-php"><?php
// modules/mymodule/src/Service/OrderService.php
declare(strict_types=1);

namespace MyModule\\Service;

use Db;
use DbQuery;
use Exception;

class OrderService
{
    /**
     * Crear pedido con transacción
     */
    public function createOrder(int $idCustomer, int $idCart): int
    {
        $db = Db::getInstance();
        
        try {
            // Iniciar transacción
            $db->execute('START TRANSACTION');
            
            // 1. Crear el pedido
            $sql = 'INSERT INTO ' . _DB_PREFIX_ . 'orders 
                (id_customer, id_cart, total_paid, current_state, date_add)
                VALUES (' . (int) $idCustomer . ', ' . (int) $idCart . ', 0, 1, NOW())';
            
            if (!$db->execute($sql)) {
                throw new Exception('Error creating order');
            }
            
            $idOrder = (int) $db->Insert_ID();
            
            // 2. Copiar productos del carrito
            $sql = 'INSERT INTO ' . _DB_PREFIX_ . 'order_detail 
                (id_order, product_id, product_quantity, product_price)
                SELECT ' . $idOrder . ', id_product, quantity, 
                    (SELECT price FROM ' . _DB_PREFIX_ . 'product WHERE id_product = cp.id_product)
                FROM ' . _DB_PREFIX_ . 'cart_product cp
                WHERE id_cart = ' . (int) $idCart;
            
            if (!$db->execute($sql)) {
                throw new Exception('Error adding order details');
            }
            
            // 3. Reducir stock
            $sql = 'UPDATE ' . _DB_PREFIX_ . 'product p
                INNER JOIN ' . _DB_PREFIX_ . 'cart_product cp ON p.id_product = cp.id_product
                SET p.quantity = p.quantity - cp.quantity
                WHERE cp.id_cart = ' . (int) $idCart;
            
            if (!$db->execute($sql)) {
                throw new Exception('Error updating stock');
            }
            
            // 4. Actualizar total del pedido
            $sql = 'UPDATE ' . _DB_PREFIX_ . 'orders 
                SET total_paid = (
                    SELECT SUM(product_quantity * product_price) 
                    FROM ' . _DB_PREFIX_ . 'order_detail 
                    WHERE id_order = ' . $idOrder . '
                )
                WHERE id_order = ' . $idOrder;
            
            if (!$db->execute($sql)) {
                throw new Exception('Error updating order total');
            }
            
            // Confirmar transacción
            $db->execute('COMMIT');
            
            return $idOrder;
            
        } catch (Exception $e) {
            // Revertir en caso de error
            $db->execute('ROLLBACK');
            throw $e;
        }
    }
}
</code></pre>

        <h3>5.2. Servicio de Inventario con Transacciones</h3>

        <pre><code class="language-php"><?php
// modules/mymodule/src/Service/InventoryService.php
declare(strict_types=1);

namespace MyModule\\Service;

use Db;
use Exception;

class InventoryService
{
    /**
     * Transferir stock entre almacenes con transacción
     */
    public function transferStock(
        int $idProduct, 
        int $fromShop, 
        int $toShop, 
        int $quantity
    ): bool {
        $db = Db::getInstance();
        
        try {
            $db->execute('START TRANSACTION');
            
            // Bloquear fila origen para lectura exclusiva
            $sql = 'SELECT quantity FROM ' . _DB_PREFIX_ . 'stock_available 
                WHERE id_product = ' . (int) $idProduct . ' 
                    AND id_shop = ' . (int) $fromShop . '
                FOR UPDATE';
            
            $availableStock = (int) $db->getValue($sql);
            
            // Verificar stock suficiente
            if ($availableStock < $quantity) {
                throw new Exception('Insufficient stock');
            }
            
            // Reducir stock origen
            $sql = 'UPDATE ' . _DB_PREFIX_ . 'stock_available 
                SET quantity = quantity - ' . (int) $quantity . '
                WHERE id_product = ' . (int) $idProduct . ' 
                    AND id_shop = ' . (int) $fromShop;
            
            if (!$db->execute($sql)) {
                throw new Exception('Error reducing origin stock');
            }
            
            // Aumentar stock destino
            $sql = 'UPDATE ' . _DB_PREFIX_ . 'stock_available 
                SET quantity = quantity + ' . (int) $quantity . '
                WHERE id_product = ' . (int) $idProduct . ' 
                    AND id_shop = ' . (int) $toShop;
            
            if (!$db->execute($sql)) {
                throw new Exception('Error increasing destination stock');
            }
            
            // Registrar movimiento
            $sql = 'INSERT INTO ' . _DB_PREFIX_ . 'stock_mvt 
                (id_product, id_stock_mvt_reason, physical_quantity, date_add)
                VALUES 
                    (' . (int) $idProduct . ', 5, -' . (int) $quantity . ', NOW()),
                    (' . (int) $idProduct . ', 6, ' . (int) $quantity . ', NOW())';
            
            if (!$db->execute($sql)) {
                throw new Exception('Error logging movement');
            }
            
            $db->execute('COMMIT');
            return true;
            
        } catch (Exception $e) {
            $db->execute('ROLLBACK');
            throw $e;
        }
    }
}
</code></pre>

        <h3>5.3. Uso de SAVEPOINT en PHP</h3>

        <pre><code class="language-php"><?php
// modules/mymodule/src/Service/BulkOrderService.php
declare(strict_types=1);

namespace MyModule\\Service;

use Db;
use Exception;

class BulkOrderService
{
    /**
     * Procesar múltiples ítems con savepoints
     */
    public function processOrderItems(int $idOrder, array $items): array
    {
        $db = Db::getInstance();
        $processed = [];
        $errors = [];
        
        try {
            $db->execute('START TRANSACTION');
            
            foreach ($items as $index => $item) {
                $savepointName = 'item_' . $index;
                
                // Crear savepoint
                $db->execute('SAVEPOINT ' . $savepointName);
                
                try {
                    // Verificar stock
                    $stock = (int) $db->getValue(
                        'SELECT quantity FROM ' . _DB_PREFIX_ . 'product 
                        WHERE id_product = ' . (int) $item['id_product'] . '
                        FOR UPDATE'
                    );
                    
                    if ($stock < $item['quantity']) {
                        throw new Exception('Insufficient stock for product ' . $item['id_product']);
                    }
                    
                    // Añadir ítem al pedido
                    $sql = 'INSERT INTO ' . _DB_PREFIX_ . 'order_detail 
                        (id_order, product_id, product_quantity, product_price)
                        VALUES (
                            ' . (int) $idOrder . ',
                            ' . (int) $item['id_product'] . ',
                            ' . (int) $item['quantity'] . ',
                            ' . (float) $item['price'] . '
                        )';
                    
                    if (!$db->execute($sql)) {
                        throw new Exception('Error adding item');
                    }
                    
                    // Reducir stock
                    $sql = 'UPDATE ' . _DB_PREFIX_ . 'product 
                        SET quantity = quantity - ' . (int) $item['quantity'] . '
                        WHERE id_product = ' . (int) $item['id_product'];
                    
                    if (!$db->execute($sql)) {
                        throw new Exception('Error updating stock');
                    }
                    
                    $processed[] = $item['id_product'];
                    
                } catch (Exception $e) {
                    // Revertir solo este ítem
                    $db->execute('ROLLBACK TO SAVEPOINT ' . $savepointName);
                    $errors[] = [
                        'product_id' => $item['id_product'],
                        'error' => $e->getMessage()
                    ];
                }
            }
            
            // Confirmar todo si al menos un ítem fue procesado
            if (!empty($processed)) {
                $db->execute('COMMIT');
            } else {
                $db->execute('ROLLBACK');
            }
            
            return [
                'processed' => $processed,
                'errors' => $errors
            ];
            
        } catch (Exception $e) {
            $db->execute('ROLLBACK');
            throw $e;
        }
    }
}
</code></pre>

        <h2 class="section-title">6. Deadlocks y Cómo Evitarlos</h2>

        <h3>6.1. ¿Qué es un Deadlock?</h3>
        <p>Un deadlock ocurre cuando dos o más transacciones se bloquean mutuamente esperando recursos que la otra posee.</p>

        <div class="alert alert-danger">
            <strong>🔒 Ejemplo de Deadlock:</strong>
            <pre class="mb-0">Transacción 1: Bloquea Producto A, espera Producto B
Transacción 2: Bloquea Producto B, espera Producto A
→ Ambas esperan indefinidamente (deadlock)</pre>
        </div>

        <h3>6.2. Prevención de Deadlocks</h3>

        <div class="row">
            <div class="col-md-6">
                <div class="card border-success mb-3">
                    <div class="card-header bg-success text-white">✅ Estrategias</div>
                    <div class="card-body">
                        <ul>
                            <li>Acceder a tablas siempre en el mismo orden</li>
                            <li>Mantener transacciones cortas</li>
                            <li>Usar índices adecuados</li>
                            <li>Evitar interacción de usuario en transacciones</li>
                            <li>Usar nivel de aislamiento apropiado</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card border-info mb-3">
                    <div class="card-header bg-info text-white">🔄 Manejo de Deadlocks</div>
                    <div class="card-body">
                        <ul>
                            <li>MySQL detecta y resuelve deadlocks automáticamente</li>
                            <li>Una transacción será revertida (la "víctima")</li>
                            <li>Implementar retry logic en la aplicación</li>
                            <li>Registrar deadlocks para análisis</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <pre><code class="language-php"><?php
// Implementar retry logic para deadlocks
public function executeWithRetry(callable $callback, int $maxRetries = 3): mixed
{
    $attempt = 0;
    
    while ($attempt < $maxRetries) {
        try {
            return $callback();
        } catch (Exception $e) {
            // Código de error MySQL para deadlock: 1213
            if (str_contains($e->getMessage(), '1213') && $attempt < $maxRetries - 1) {
                $attempt++;
                usleep(100000 * $attempt); // Espera exponencial
                continue;
            }
            throw $e;
        }
    }
}
</code></pre>

        <h2 class="section-title">7. Mejores Prácticas</h2>

        <div class="row">
            <div class="col-md-6">
                <div class="card border-success mb-3">
                    <div class="card-header bg-success text-white">✅ Hacer</div>
                    <div class="card-body">
                        <ul>
                            <li>Mantener transacciones cortas y rápidas</li>
                            <li>Usar el nivel de aislamiento mínimo necesario</li>
                            <li>Siempre usar try-catch con ROLLBACK</li>
                            <li>Acceder a recursos en orden consistente</li>
                            <li>Usar FOR UPDATE para bloqueos explícitos</li>
                            <li>Testear bajo carga concurrente</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card border-danger mb-3">
                    <div class="card-header bg-danger text-white">❌ Evitar</div>
                    <div class="card-body">
                        <ul>
                            <li>Transacciones largas o con esperas</li>
                            <li>Interacción de usuario dentro de transacciones</li>
                            <li>Olvidar ROLLBACK en caso de error</li>
                            <li>Usar SERIALIZABLE sin necesidad</li>
                            <li>No manejar deadlocks en la aplicación</li>
                            <li>Bloquear más filas de las necesarias</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <div class="alert alert-info">
            <strong>🎯 Cuándo usar Transacciones:</strong>
            <ul class="mb-0">
                <li><strong>Operaciones financieras</strong>: Pagos, reembolsos, transferencias</li>
                <li><strong>Gestión de inventario</strong>: Reservas, transferencias de stock</li>
                <li><strong>Creación de pedidos</strong>: Múltiples tablas relacionadas</li>
                <li><strong>Operaciones críticas de negocio</strong>: Donde la consistencia es vital</li>
            </ul>
        </div>
    </div>
`;

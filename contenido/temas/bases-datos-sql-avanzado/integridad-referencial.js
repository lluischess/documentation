// @ts-nocheck
const integridadReferencial = `
    <div class="content-section">
        <h1 id="integridad-referencial">Integridad Referencial y Restricciones</h1>
        <p>La integridad referencial es un conjunto de reglas que garantiza la consistencia y validez de las relaciones entre tablas en una base de datos. En el contexto de PrestaShop 8.9+ y PHP 8.1+, implementar correctamente estas restricciones es fundamental para mantener la coherencia de los datos y prevenir anomalías.</p>

        <h2 class="section-title">1. Conceptos Fundamentales de Integridad</h2>

        <h3>1.1. Tipos de Integridad de Datos</h3>

        <table class="table table-bordered">
            <thead class="table-dark">
                <tr>
                    <th>Tipo</th>
                    <th>Descripción</th>
                    <th>Ejemplo PrestaShop</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Integridad de Entidad</strong></td>
                    <td>Cada fila debe ser única y identificable</td>
                    <td>PRIMARY KEY en id_product</td>
                </tr>
                <tr>
                    <td><strong>Integridad de Dominio</strong></td>
                    <td>Los valores deben pertenecer a un dominio válido</td>
                    <td>CHECK (quantity >= 0), ENUM para estados</td>
                </tr>
                <tr>
                    <td><strong>Integridad Referencial</strong></td>
                    <td>Las relaciones entre tablas deben ser válidas</td>
                    <td>FOREIGN KEY de ps_orders a ps_customer</td>
                </tr>
                <tr>
                    <td><strong>Integridad de Usuario</strong></td>
                    <td>Reglas de negocio específicas</td>
                    <td>Un pedido debe tener al menos un producto</td>
                </tr>
            </tbody>
        </table>

        <h3>1.2. Integridad Referencial Definida</h3>

        <div class="alert alert-info">
            <strong>📖 Definición:</strong> La integridad referencial asegura que una clave foránea siempre hace referencia a un registro existente en la tabla relacionada, o es NULL (si se permite).
        </div>

        <pre><code class="language-sql">-- Ejemplo básico de integridad referencial
CREATE TABLE ps_customer (
    id_customer INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    firstname VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE ps_orders (
    id_order INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_customer INT UNSIGNED NOT NULL,
    total_paid DECIMAL(20,6) NOT NULL,
    
    -- Garantiza que id_customer existe en ps_customer
    CONSTRAINT fk_order_customer
        FOREIGN KEY (id_customer)
        REFERENCES ps_customer(id_customer)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB;</code></pre>

        <h2 class="section-title">2. Restricciones de Claves Foráneas</h2>

        <h3>2.1. Acciones Referenciales Detalladas</h3>

        <h4>CASCADE - Efecto en Cascada</h4>

        <pre><code class="language-sql">-- ON DELETE CASCADE: Elimina registros relacionados
CREATE TABLE ps_order_detail (
    id_order_detail INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_order INT UNSIGNED NOT NULL,
    product_name VARCHAR(255),
    
    FOREIGN KEY (id_order)
        REFERENCES ps_orders(id_order)
        ON DELETE CASCADE  -- Si se elimina el pedido, se eliminan sus detalles
        ON UPDATE CASCADE  -- Si se actualiza id_order, se actualiza aquí también
) ENGINE=InnoDB;

-- Ejemplo de uso:
DELETE FROM ps_orders WHERE id_order = 100;
-- Resultado: También se eliminan todos los registros de ps_order_detail donde id_order = 100</code></pre>

        <h4>RESTRICT - Prevención de Eliminación</h4>

        <pre><code class="language-sql">-- ON DELETE RESTRICT: Impide eliminación si hay referencias
CREATE TABLE ps_orders (
    id_order INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_customer INT UNSIGNED NOT NULL,
    
    FOREIGN KEY (id_customer)
        REFERENCES ps_customer(id_customer)
        ON DELETE RESTRICT  -- No se puede eliminar un cliente con pedidos
        ON UPDATE RESTRICT  -- No se puede cambiar id_customer si hay referencias
) ENGINE=InnoDB;

-- Ejemplo de error:
DELETE FROM ps_customer WHERE id_customer = 1;
-- Error: Cannot delete or update a parent row: a foreign key constraint fails</code></pre>

        <h4>SET NULL - Asignación de NULL</h4>

        <pre><code class="language-sql">-- ON DELETE SET NULL: Asigna NULL a la clave foránea
CREATE TABLE ps_orders (
    id_order INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_cart INT UNSIGNED,  -- Permite NULL
    
    FOREIGN KEY (id_cart)
        REFERENCES ps_cart(id_cart)
        ON DELETE SET NULL  -- Si se elimina el carrito, id_cart = NULL
        ON UPDATE SET NULL
) ENGINE=InnoDB;

-- Ejemplo:
DELETE FROM ps_cart WHERE id_cart = 50;
-- Resultado: ps_orders con id_cart = 50 ahora tienen id_cart = NULL</code></pre>

        <h4>NO ACTION - Sin Acción (Diferido)</h4>

        <pre><code class="language-sql">-- NO ACTION es similar a RESTRICT en MySQL (se verifica al final de la transacción)
CREATE TABLE ps_product_download (
    id_product_download INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_product INT UNSIGNED NOT NULL,
    
    FOREIGN KEY (id_product)
        REFERENCES ps_product(id_product)
        ON DELETE NO ACTION
) ENGINE=InnoDB;

-- En MySQL, NO ACTION y RESTRICT son sinónimos</code></pre>

        <h3>2.2. Matriz de Decisiones para Acciones Referenciales</h3>

        <table class="table table-striped">
            <thead class="table-dark">
                <tr>
                    <th>Relación</th>
                    <th>ON DELETE</th>
                    <th>ON UPDATE</th>
                    <th>Justificación</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Order → OrderDetail</td>
                    <td><code>CASCADE</code></td>
                    <td><code>CASCADE</code></td>
                    <td>Los detalles no tienen sentido sin el pedido</td>
                </tr>
                <tr>
                    <td>Order → Customer</td>
                    <td><code>RESTRICT</code></td>
                    <td><code>CASCADE</code></td>
                    <td>No eliminar clientes con historial, permitir cambio de ID</td>
                </tr>
                <tr>
                    <td>Order → Cart</td>
                    <td><code>SET NULL</code></td>
                    <td><code>CASCADE</code></td>
                    <td>El carrito puede eliminarse, el pedido se conserva</td>
                </tr>
                <tr>
                    <td>OrderDetail → Product</td>
                    <td><code>RESTRICT</code></td>
                    <td><code>CASCADE</code></td>
                    <td>No eliminar productos con historial de ventas</td>
                </tr>
                <tr>
                    <td>Product → Category</td>
                    <td><code>RESTRICT</code></td>
                    <td><code>CASCADE</code></td>
                    <td>Reasignar productos antes de eliminar categoría</td>
                </tr>
                <tr>
                    <td>Image → Product</td>
                    <td><code>CASCADE</code></td>
                    <td><code>CASCADE</code></td>
                    <td>Las imágenes pertenecen solo al producto</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">3. Restricciones CHECK</h2>

        <h3>3.1. Restricciones de Dominio con CHECK</h3>

        <pre><code class="language-sql">-- MySQL 8.0.16+ soporta CHECK constraints
CREATE TABLE ps_product (
    id_product INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    price DECIMAL(20,6) NOT NULL,
    quantity INT NOT NULL,
    minimal_quantity INT UNSIGNED NOT NULL DEFAULT 1,
    ecotax DECIMAL(20,6) NOT NULL DEFAULT 0,
    
    -- Restricciones CHECK
    CONSTRAINT chk_price_positive 
        CHECK (price >= 0),
    
    CONSTRAINT chk_quantity_valid 
        CHECK (quantity >= 0),
    
    CONSTRAINT chk_minimal_positive 
        CHECK (minimal_quantity > 0),
    
    CONSTRAINT chk_minimal_less_than_stock 
        CHECK (minimal_quantity <= quantity OR quantity = 0),
    
    CONSTRAINT chk_ecotax_valid 
        CHECK (ecotax >= 0 AND ecotax < price)
) ENGINE=InnoDB;

-- Intentar insertar datos inválidos
INSERT INTO ps_product (price, quantity, minimal_quantity, ecotax)
VALUES (-10.00, 100, 1, 0.00);
-- Error: Check constraint 'chk_price_positive' is violated

INSERT INTO ps_product (price, quantity, minimal_quantity, ecotax)
VALUES (50.00, 10, 20, 0.00);
-- Error: Check constraint 'chk_minimal_less_than_stock' is violated</code></pre>

        <h3>3.2. CHECK con Expresiones Complejas</h3>

        <pre><code class="language-sql">CREATE TABLE ps_orders (
    id_order INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_customer INT UNSIGNED NOT NULL,
    total_products DECIMAL(20,6) NOT NULL,
    total_shipping DECIMAL(20,6) NOT NULL DEFAULT 0,
    total_discounts DECIMAL(20,6) NOT NULL DEFAULT 0,
    total_paid DECIMAL(20,6) NOT NULL,
    current_state TINYINT UNSIGNED NOT NULL,
    payment_method VARCHAR(50),
    
    -- Verificar que total_paid es correcto
    CONSTRAINT chk_total_calculation
        CHECK (total_paid = total_products + total_shipping - total_discounts),
    
    -- Estados válidos (alternativa a ENUM)
    CONSTRAINT chk_valid_state
        CHECK (current_state BETWEEN 1 AND 20),
    
    -- Si está pagado, debe haber método de pago
    CONSTRAINT chk_payment_method
        CHECK (
            (current_state IN (2, 3, 4, 5) AND payment_method IS NOT NULL) 
            OR 
            (current_state NOT IN (2, 3, 4, 5))
        )
) ENGINE=InnoDB;

-- Verificar restricciones existentes
SELECT 
    CONSTRAINT_NAME,
    CHECK_CLAUSE
FROM information_schema.CHECK_CONSTRAINTS
WHERE CONSTRAINT_SCHEMA = 'prestashop'
  AND TABLE_NAME = 'ps_orders';</code></pre>

        <h3>3.3. Restricciones CHECK vs ENUM</h3>

        <div class="row">
            <div class="col-md-6">
                <div class="card mb-3">
                    <div class="card-header bg-primary text-white">ENUM</div>
                    <div class="card-body">
                        <pre><code class="language-sql">CREATE TABLE ps_customer (
    id_customer INT PRIMARY KEY,
    gender ENUM('male', 'female', 'other')
);</code></pre>
                        <p><strong>Ventajas:</strong></p>
                        <ul>
                            <li>Sintaxis simple</li>
                            <li>Almacenamiento eficiente (internamente como INT)</li>
                        </ul>
                        <p><strong>Desventajas:</strong></p>
                        <ul>
                            <li>Difícil de modificar</li>
                            <li>Específico de MySQL</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="card mb-3">
                    <div class="card-header bg-success text-white">CHECK Constraint</div>
                    <div class="card-body">
                        <pre><code class="language-sql">CREATE TABLE ps_customer (
    id_customer INT PRIMARY KEY,
    gender VARCHAR(10),
    CONSTRAINT chk_gender 
        CHECK (gender IN ('male', 'female', 'other'))
);</code></pre>
                        <p><strong>Ventajas:</strong></p>
                        <ul>
                            <li>Más flexible</li>
                            <li>Estándar SQL</li>
                            <li>Fácil de modificar</li>
                        </ul>
                        <p><strong>Desventajas:</strong></p>
                        <ul>
                            <li>Menos eficiente en espacio</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <h2 class="section-title">4. Restricciones UNIQUE</h2>

        <h3>4.1. Unicidad Simple y Compuesta</h3>

        <pre><code class="language-sql">CREATE TABLE ps_customer (
    id_customer INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    id_shop INT UNSIGNED NOT NULL,
    
    -- UNIQUE simple: email único globalmente
    CONSTRAINT uk_email UNIQUE (email),
    
    -- UNIQUE compuesto: teléfono único por tienda
    CONSTRAINT uk_phone_shop UNIQUE (phone, id_shop)
) ENGINE=InnoDB;

-- ✅ Permitido: mismo teléfono en diferentes tiendas
INSERT INTO ps_customer (email, phone, id_shop) 
VALUES ('user1@mail.com', '123456789', 1);

INSERT INTO ps_customer (email, phone, id_shop) 
VALUES ('user2@mail.com', '123456789', 2);  -- OK

-- ❌ Error: email duplicado
INSERT INTO ps_customer (email, phone, id_shop) 
VALUES ('user1@mail.com', '987654321', 1);  -- Error: Duplicate entry

-- ❌ Error: teléfono duplicado en la misma tienda
INSERT INTO ps_customer (email, phone, id_shop) 
VALUES ('user3@mail.com', '123456789', 1);  -- Error</code></pre>

        <h3>4.2. UNIQUE con NULL</h3>

        <div class="alert alert-warning">
            <strong>⚠️ Importante:</strong> En MySQL, múltiples valores NULL son permitidos en columnas UNIQUE (excepto en PRIMARY KEY).
        </div>

        <pre><code class="language-sql">CREATE TABLE ps_product (
    id_product INT PRIMARY KEY,
    ean13 VARCHAR(13),
    isbn VARCHAR(32),
    
    UNIQUE KEY uk_ean13 (ean13),
    UNIQUE KEY uk_isbn (isbn)
);

-- ✅ Múltiples NULL permitidos
INSERT INTO ps_product (id_product, ean13, isbn) VALUES (1, NULL, NULL);
INSERT INTO ps_product (id_product, ean13, isbn) VALUES (2, NULL, NULL);  -- OK

-- ✅ Pero no valores duplicados
INSERT INTO ps_product (id_product, ean13, isbn) VALUES (3, '1234567890123', NULL);
INSERT INTO ps_product (id_product, ean13, isbn) VALUES (4, '1234567890123', NULL);  -- Error</code></pre>

        <h2 class="section-title">5. Restricciones NOT NULL</h2>

        <h3>5.1. Cuándo Usar NOT NULL</h3>

        <table class="table table-bordered">
            <thead class="table-dark">
                <tr>
                    <th>Campo</th>
                    <th>NULL / NOT NULL</th>
                    <th>Razón</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>id_customer (FK)</td>
                    <td><code>NOT NULL</code></td>
                    <td>Un pedido siempre debe tener un cliente</td>
                </tr>
                <tr>
                    <td>email</td>
                    <td><code>NOT NULL</code></td>
                    <td>Requerido para comunicación</td>
                </tr>
                <tr>
                    <td>phone</td>
                    <td><code>NULL</code></td>
                    <td>Opcional, no todos los clientes lo proporcionan</td>
                </tr>
                <tr>
                    <td>date_add</td>
                    <td><code>NOT NULL</code></td>
                    <td>Auditoría, siempre debe tener valor</td>
                </tr>
                <tr>
                    <td>id_voucher (FK)</td>
                    <td><code>NULL</code></td>
                    <td>No todos los pedidos usan cupón</td>
                </tr>
                <tr>
                    <td>tracking_number</td>
                    <td><code>NULL</code></td>
                    <td>Solo disponible después del envío</td>
                </tr>
            </tbody>
        </table>

        <h3>5.2. Valores por Defecto vs NULL</h3>

        <pre><code class="language-sql">CREATE TABLE ps_product (
    id_product INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    
    -- ❌ MAL: NULL cuando debería ser 0
    quantity INT DEFAULT NULL,
    
    -- ✅ BIEN: Valor por defecto significativo
    quantity_good INT NOT NULL DEFAULT 0,
    
    -- ✅ BIEN: NULL cuando realmente es desconocido
    date_available DATETIME DEFAULT NULL,
    
    -- ✅ BIEN: Valor actual si no se especifica
    date_add DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_upd DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);</code></pre>

        <h2 class="section-title">6. Implementación de Integridad en PrestaShop</h2>

        <h3>6.1. Esquema Completo de Pedidos con Restricciones</h3>

        <pre><code class="language-sql">-- Tabla de clientes
CREATE TABLE ps_customer (
    id_customer INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_shop INT UNSIGNED NOT NULL DEFAULT 1,
    email VARCHAR(255) NOT NULL,
    passwd VARCHAR(255) NOT NULL,
    firstname VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    active TINYINT(1) UNSIGNED NOT NULL DEFAULT 0,
    date_add DATETIME NOT NULL,
    date_upd DATETIME NOT NULL,
    
    CONSTRAINT uk_email UNIQUE (email),
    CONSTRAINT chk_passwd_length CHECK (CHAR_LENGTH(passwd) >= 8),
    
    INDEX idx_shop (id_shop),
    INDEX idx_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de carritos
CREATE TABLE ps_cart (
    id_cart INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_customer INT UNSIGNED NOT NULL,
    id_address_delivery INT UNSIGNED,
    id_currency INT UNSIGNED NOT NULL,
    date_add DATETIME NOT NULL,
    date_upd DATETIME NOT NULL,
    
    CONSTRAINT fk_cart_customer
        FOREIGN KEY (id_customer)
        REFERENCES ps_customer(id_customer)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    
    INDEX idx_customer (id_customer),
    INDEX idx_date (date_add)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de pedidos
CREATE TABLE ps_orders (
    id_order INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_customer INT UNSIGNED NOT NULL,
    id_cart INT UNSIGNED,
    id_currency INT UNSIGNED NOT NULL,
    id_address_delivery INT UNSIGNED NOT NULL,
    id_address_invoice INT UNSIGNED NOT NULL,
    current_state TINYINT UNSIGNED NOT NULL,
    payment_method VARCHAR(50),
    total_products DECIMAL(20,6) NOT NULL DEFAULT 0,
    total_shipping DECIMAL(20,6) NOT NULL DEFAULT 0,
    total_discounts DECIMAL(20,6) NOT NULL DEFAULT 0,
    total_paid DECIMAL(20,6) NOT NULL DEFAULT 0,
    date_add DATETIME NOT NULL,
    date_upd DATETIME NOT NULL,
    
    -- Claves foráneas con acciones específicas
    CONSTRAINT fk_order_customer
        FOREIGN KEY (id_customer)
        REFERENCES ps_customer(id_customer)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_order_cart
        FOREIGN KEY (id_cart)
        REFERENCES ps_cart(id_cart)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    
    -- Restricciones de dominio
    CONSTRAINT chk_totals_positive CHECK (
        total_products >= 0 AND
        total_shipping >= 0 AND
        total_discounts >= 0 AND
        total_paid >= 0
    ),
    
    CONSTRAINT chk_total_calculation CHECK (
        total_paid >= total_products + total_shipping - total_discounts - 0.01 AND
        total_paid <= total_products + total_shipping - total_discounts + 0.01
    ),
    
    CONSTRAINT chk_state_valid CHECK (current_state BETWEEN 1 AND 20),
    
    -- Índices
    INDEX idx_customer (id_customer),
    INDEX idx_cart (id_cart),
    INDEX idx_state (current_state),
    INDEX idx_date (date_add)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de detalles del pedido
CREATE TABLE ps_order_detail (
    id_order_detail INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_order INT UNSIGNED NOT NULL,
    id_product INT UNSIGNED NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_quantity INT UNSIGNED NOT NULL,
    product_price DECIMAL(20,6) NOT NULL,
    total_price DECIMAL(20,6) NOT NULL,
    
    CONSTRAINT fk_detail_order
        FOREIGN KEY (id_order)
        REFERENCES ps_orders(id_order)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_detail_product
        FOREIGN KEY (id_product)
        REFERENCES ps_product(id_product)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    
    CONSTRAINT chk_quantity_positive CHECK (product_quantity > 0),
    CONSTRAINT chk_price_positive CHECK (product_price >= 0),
    CONSTRAINT chk_total_matches CHECK (
        total_price >= product_quantity * product_price - 0.01 AND
        total_price <= product_quantity * product_price + 0.01
    ),
    
    INDEX idx_order (id_order),
    INDEX idx_product (id_product)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;</code></pre>

        <h3>6.2. Validación en Capa de Aplicación (PHP)</h3>

        <pre><code class="language-php"><?php
// classes/Order.php

class Order extends ObjectModel
{
    public $id_customer;
    public $id_cart;
    public $total_products;
    public $total_shipping;
    public $total_discounts;
    public $total_paid;
    
    public static $definition = [
        'table' => 'orders',
        'primary' => 'id_order',
        'fields' => [
            'id_customer' => [
                'type' => self::TYPE_INT,
                'validate' => 'isUnsignedId',
                'required' => true
            ],
            'total_paid' => [
                'type' => self::TYPE_FLOAT,
                'validate' => 'isPrice',
                'required' => true
            ],
            'current_state' => [
                'type' => self::TYPE_INT,
                'validate' => 'isUnsignedId',
                'required' => true
            ]
        ]
    ];
    
    /**
     * Validación adicional antes de guardar
     */
    public function add($autodate = true, $nullValues = false)
    {
        // Validar que total_paid coincide con el cálculo
        $calculated_total = $this->total_products + $this->total_shipping - $this->total_discounts;
        
        if (abs($this->total_paid - $calculated_total) > 0.01) {
            throw new PrestaShopException('Total paid does not match calculation');
        }
        
        // Validar que el cliente existe y está activo
        $customer = new Customer($this->id_customer);
        if (!Validate::isLoadedObject($customer) || !$customer->active) {
            throw new PrestaShopException('Invalid or inactive customer');
        }
        
        // Validar que hay al menos un producto
        if ($this->total_products <= 0) {
            throw new PrestaShopException('Order must have at least one product');
        }
        
        return parent::add($autodate, $nullValues);
    }
    
    /**
     * Validar integridad referencial antes de eliminar
     */
    public function delete()
    {
        // Verificar que no hay invoices asociadas
        $sql = 'SELECT COUNT(*) FROM \`' . _DB_PREFIX_ . 'order_invoice\`
                WHERE \`id_order\` = ' . (int)$this->id;
        
        if (Db::getInstance()->getValue($sql) > 0) {
            throw new PrestaShopException('Cannot delete order with invoices');
        }
        
        // Eliminar order_detail en cascada (manualmente si no hay FK)
        Db::getInstance()->delete('order_detail', 'id_order = ' . (int)$this->id);
        
        return parent::delete();
    }
}</code></pre>

        <h2 class="section-title">7. Triggers para Integridad Compleja</h2>

        <h3>7.1. Validación con BEFORE Triggers</h3>

        <pre><code class="language-sql">-- Trigger para validar stock antes de crear order_detail
DELIMITER $$

CREATE TRIGGER before_order_detail_insert
BEFORE INSERT ON ps_order_detail
FOR EACH ROW
BEGIN
    DECLARE available_stock INT;
    
    -- Obtener stock disponible
    SELECT quantity INTO available_stock
    FROM ps_stock_available
    WHERE id_product = NEW.id_product;
    
    -- Validar que hay suficiente stock
    IF available_stock < NEW.product_quantity THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Insufficient stock for this product';
    END IF;
END$$

DELIMITER ;</code></pre>

        <h3>7.2. Mantenimiento de Integridad con AFTER Triggers</h3>

        <pre><code class="language-sql">-- Actualizar stock automáticamente después de crear order_detail
DELIMITER $$

CREATE TRIGGER after_order_detail_insert
AFTER INSERT ON ps_order_detail
FOR EACH ROW
BEGIN
    UPDATE ps_stock_available
    SET quantity = quantity - NEW.product_quantity
    WHERE id_product = NEW.id_product;
END$$

-- Restaurar stock si se elimina order_detail
CREATE TRIGGER after_order_detail_delete
AFTER DELETE ON ps_order_detail
FOR EACH ROW
BEGIN
    UPDATE ps_stock_available
    SET quantity = quantity + OLD.product_quantity
    WHERE id_product = OLD.id_product;
END$$

DELIMITER ;</code></pre>

        <h2 class="section-title">8. Gestión de Restricciones</h2>

        <h3>8.1. Agregar Restricciones a Tablas Existentes</h3>

        <pre><code class="language-sql">-- Agregar clave foránea
ALTER TABLE ps_orders
ADD CONSTRAINT fk_order_customer
    FOREIGN KEY (id_customer)
    REFERENCES ps_customer(id_customer)
    ON DELETE RESTRICT
    ON UPDATE CASCADE;

-- Agregar CHECK constraint
ALTER TABLE ps_product
ADD CONSTRAINT chk_price_positive
    CHECK (price >= 0);

-- Agregar UNIQUE constraint
ALTER TABLE ps_customer
ADD CONSTRAINT uk_email
    UNIQUE (email);

-- Agregar NOT NULL (requiere datos válidos existentes)
ALTER TABLE ps_customer
MODIFY COLUMN email VARCHAR(255) NOT NULL;</code></pre>

        <h3>8.2. Eliminar Restricciones</h3>

        <pre><code class="language-sql">-- Eliminar clave foránea
ALTER TABLE ps_orders
DROP FOREIGN KEY fk_order_customer;

-- Eliminar CHECK constraint
ALTER TABLE ps_product
DROP CONSTRAINT chk_price_positive;

-- Eliminar UNIQUE constraint
ALTER TABLE ps_customer
DROP INDEX uk_email;

-- Quitar NOT NULL
ALTER TABLE ps_customer
MODIFY COLUMN phone VARCHAR(20) NULL;</code></pre>

        <h3>8.3. Verificar Restricciones Existentes</h3>

        <pre><code class="language-sql">-- Ver claves foráneas
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME,
    DELETE_RULE,
    UPDATE_RULE
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'prestashop'
  AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Ver CHECK constraints
SELECT 
    CONSTRAINT_NAME,
    CHECK_CLAUSE
FROM information_schema.CHECK_CONSTRAINTS
WHERE CONSTRAINT_SCHEMA = 'prestashop';

-- Ver índices UNIQUE
SHOW INDEX FROM ps_customer WHERE Non_unique = 0;</code></pre>

        <h2 class="section-title">9. Mejores Prácticas</h2>

        <table class="table table-striped">
            <thead class="table-dark">
                <tr>
                    <th width="30%">Práctica</th>
                    <th>Recomendación</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Nomenclatura</strong></td>
                    <td>Usar prefijos: <code>fk_</code> para foreign keys, <code>chk_</code> para checks, <code>uk_</code> para unique</td>
                </tr>
                <tr>
                    <td><strong>Acciones referenciales</strong></td>
                    <td>Elegir cuidadosamente CASCADE vs RESTRICT según lógica de negocio</td>
                </tr>
                <tr>
                    <td><strong>Validación en capas</strong></td>
                    <td>Combinar restricciones DB + validación PHP para robustez</td>
                </tr>
                <tr>
                    <td><strong>NOT NULL</strong></td>
                    <td>Usar DEFAULT en lugar de permitir NULL cuando sea posible</td>
                </tr>
                <tr>
                    <td><strong>CHECK constraints</strong></td>
                    <td>Preferir CHECK sobre triggers para validaciones simples</td>
                </tr>
                <tr>
                    <td><strong>Documentación</strong></td>
                    <td>Comentar la razón de restricciones complejas</td>
                </tr>
                <tr>
                    <td><strong>Testing</strong></td>
                    <td>Probar violaciones de restricciones en tests unitarios</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">10. Checklist de Integridad</h2>

        <ul>
            <li>✅ Todas las relaciones tienen claves foráneas definidas</li>
            <li>✅ Acciones ON DELETE y ON UPDATE son apropiadas</li>
            <li>✅ Campos críticos tienen restricciones NOT NULL</li>
            <li>✅ Valores únicos están protegidos con UNIQUE</li>
            <li>✅ Rangos de valores válidos están restringidos con CHECK</li>
            <li>✅ Triggers mantienen consistencia de datos derivados</li>
            <li>✅ La capa de aplicación valida datos antes de INSERT/UPDATE</li>
            <li>✅ Restricciones están documentadas y tienen nombres descriptivos</li>
        </ul>

        <h2 class="section-title">11. Recursos Adicionales</h2>
        <ul>
            <li><strong>MySQL Constraints:</strong> <a href="https://dev.mysql.com/doc/refman/8.0/en/create-table-foreign-keys.html" target="_blank">Foreign Key Constraints</a></li>
            <li><strong>SQL Standards:</strong> <a href="https://www.iso.org/standard/63555.html" target="_blank">ISO/IEC 9075 (SQL Standard)</a></li>
            <li><strong>PrestaShop DevDocs:</strong> <a href="https://devdocs.prestashop.com/8/" target="_blank">Database Best Practices</a></li>
        </ul>
    </div>
    `;

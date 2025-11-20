// @ts-nocheck
const normalizacionBasesDatos = `
    <div class="content-section">
        <h1 id="normalizacion-bases-datos">Normalización de Bases de Datos (1NF, 2NF, 3NF, BCNF)</h1>
        <p>La normalización es el proceso de organizar datos en una base de datos para reducir la redundancia y mejorar la integridad de los datos. En PrestaShop 8.9+ y el desarrollo de módulos personalizados, aplicar correctamente las formas normales es fundamental para crear esquemas de base de datos eficientes, mantenibles y escalables.</p>

        <h2 class="section-title">1. ¿Por Qué Normalizar?</h2>

        <div class="row">
            <div class="col-md-6">
                <div class="card mb-3">
                    <div class="card-header bg-success text-white">✅ Ventajas de la Normalización</div>
                    <div class="card-body">
                        <ul>
                            <li>Elimina redundancia de datos</li>
                            <li>Previene anomalías de inserción, actualización y eliminación</li>
                            <li>Mejora la integridad de datos</li>
                            <li>Facilita el mantenimiento</li>
                            <li>Reduce espacio de almacenamiento</li>
                            <li>Escalabilidad mejorada</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="card mb-3">
                    <div class="card-header bg-warning text-white">⚠️ Desventajas del Exceso de Normalización</div>
                    <div class="card-body">
                        <ul>
                            <li>Queries más complejas con múltiples JOINs</li>
                            <li>Posible degradación de rendimiento en lecturas</li>
                            <li>Mayor complejidad en la lógica de aplicación</li>
                            <li>A veces requiere desnormalización estratégica</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <h2 class="section-title">2. Primera Forma Normal (1NF)</h2>

        <h3>2.1. Reglas de 1NF</h3>
        <p>Una tabla está en 1NF si cumple:</p>
        <ol>
            <li>Todos los atributos contienen <strong>valores atómicos</strong> (indivisibles)</li>
            <li>No hay <strong>grupos repetitivos</strong> de columnas</li>
            <li>Cada columna tiene un <strong>nombre único</strong></li>
            <li>El orden de las filas no importa</li>
        </ol>

        <h3>2.2. Ejemplo: Violación de 1NF</h3>
        
        <div class="alert alert-danger">
            <strong>❌ MAL - Tabla NO en 1NF:</strong>
            <pre class="mb-0"><code class="language-sql">-- Problema 1: Valores no atómicos (múltiples teléfonos en un campo)
-- Problema 2: Columnas repetitivas (phone1, phone2, phone3)
CREATE TABLE ps_customer_bad (
    id_customer INT PRIMARY KEY,
    name VARCHAR(255),
    phones VARCHAR(255),        -- ❌ "612345678, 687654321" (no atómico)
    address VARCHAR(500)        -- ❌ "Calle Mayor 1, Madrid, 28001" (no atómico)
);

-- Ejemplo de datos problemáticos:
INSERT INTO ps_customer_bad VALUES 
(1, 'Juan Pérez', '612345678, 687654321', 'Calle Mayor 1, Madrid, 28001');
-- ▲ Difícil de buscar por teléfono o ciudad</code></pre>
        </div>

        <div class="alert alert-success">
            <strong>✅ BIEN - Tabla en 1NF:</strong>
            <pre class="mb-0"><code class="language-sql">-- Valores atómicos y tabla separada para múltiples teléfonos
CREATE TABLE ps_customer (
    id_customer INT AUTO_INCREMENT PRIMARY KEY,
    firstname VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla separada para teléfonos (relación 1:N)
CREATE TABLE ps_customer_phone (
    id_phone INT AUTO_INCREMENT PRIMARY KEY,
    id_customer INT NOT NULL,
    phone VARCHAR(20) NOT NULL,    -- ✅ Valor atómico
    phone_type ENUM('mobile', 'home', 'work'),
    
    FOREIGN KEY (id_customer) 
        REFERENCES ps_customer(id_customer)
        ON DELETE CASCADE,
    
    INDEX idx_customer (id_customer)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dirección separada con campos atómicos
CREATE TABLE ps_address (
    id_address INT AUTO_INCREMENT PRIMARY KEY,
    id_customer INT NOT NULL,
    address1 VARCHAR(128) NOT NULL,  -- ✅ Atómico
    address2 VARCHAR(128),
    postcode VARCHAR(12),            -- ✅ Atómico
    city VARCHAR(64) NOT NULL,       -- ✅ Atómico
    id_country INT NOT NULL,
    
    FOREIGN KEY (id_customer) 
        REFERENCES ps_customer(id_customer)
        ON DELETE CASCADE,
    
    INDEX idx_customer (id_customer)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;</code></pre>
        </div>

        <h2 class="section-title">3. Segunda Forma Normal (2NF)</h2>

        <h3>3.1. Reglas de 2NF</h3>
        <p>Una tabla está en 2NF si:</p>
        <ol>
            <li>Está en <strong>1NF</strong></li>
            <li>Todos los atributos no-clave dependen <strong>completamente</strong> de la clave primaria (no hay dependencias parciales)</li>
        </ol>

        <div class="alert alert-info">
            <strong>📌 Nota:</strong> Las dependencias parciales solo ocurren cuando la clave primaria es <strong>compuesta</strong> (múltiples columnas).
        </div>

        <h3>3.2. Ejemplo: Violación de 2NF</h3>

        <div class="alert alert-danger">
            <strong>❌ MAL - Tabla NO en 2NF:</strong>
            <pre class="mb-0"><code class="language-sql">-- Pedido con detalles de producto en la misma tabla
CREATE TABLE ps_order_detail_bad (
    id_order INT,
    id_product INT,
    product_quantity INT,
    product_name VARCHAR(255),      -- ❌ Depende solo de id_product
    product_price DECIMAL(20,6),    -- ❌ Depende solo de id_product
    product_reference VARCHAR(64),  -- ❌ Depende solo de id_product
    
    PRIMARY KEY (id_order, id_product) -- Clave compuesta
);

-- Problema: product_name, product_price, product_reference dependen
-- SOLO de id_product, no de la clave completa (id_order + id_product)
-- Esto causa REDUNDANCIA si el mismo producto aparece en múltiples pedidos</code></pre>
        </div>

        <div class="alert alert-success">
            <strong>✅ BIEN - Tablas en 2NF:</strong>
            <pre class="mb-0"><code class="language-sql">-- Tabla de productos (atributos que dependen solo de id_product)
CREATE TABLE ps_product (
    id_product INT AUTO_INCREMENT PRIMARY KEY,
    reference VARCHAR(64) UNIQUE,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(20,6) NOT NULL,
    active TINYINT(1) DEFAULT 1,
    
    INDEX idx_reference (reference)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de detalles de pedido (solo lo específico del pedido)
CREATE TABLE ps_order_detail (
    id_order_detail INT AUTO_INCREMENT PRIMARY KEY,
    id_order INT NOT NULL,
    id_product INT NOT NULL,
    product_quantity INT NOT NULL,
    product_price DECIMAL(20,6) NOT NULL,  -- Precio EN EL MOMENTO del pedido
    
    -- FOREIGN KEYS
    FOREIGN KEY (id_order) 
        REFERENCES ps_orders(id_order)
        ON DELETE CASCADE,
    
    FOREIGN KEY (id_product) 
        REFERENCES ps_product(id_product)
        ON DELETE RESTRICT,
    
    INDEX idx_order (id_order),
    INDEX idx_product (id_product)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Ahora: product_quantity y product_price dependen de toda la clave
-- Los datos del producto (name, reference) están en ps_product</code></pre>
        </div>

        <h3>3.3. ¿Por Qué Guardar product_price en order_detail?</h3>
        <pre><code class="language-php"><?php
/**
 * Razón: El precio del producto puede cambiar con el tiempo.
 * Necesitamos preservar el precio EN EL MOMENTO de la compra.
 * 
 * Si solo guardáramos id_product y obtuviéramos el precio actual,
 * los pedidos históricos mostrarían precios incorrectos.
 */

// CORRECTO: Guardar precio histórico
$orderDetail = new OrderDetail();
$orderDetail->id_order = $order->id;
$orderDetail->id_product = $product->id;
$orderDetail->product_quantity = $quantity;
$orderDetail->product_price = $product->price; // Precio actual congelado
$orderDetail->save();

// Luego, aunque el precio del producto cambie:
// $product->price = 99.99; (nuevo precio)
// El pedido antiguo sigue mostrando el precio correcto del momento de compra</code></pre>

        <h2 class="section-title">4. Tercera Forma Normal (3NF)</h2>

        <h3>4.1. Reglas de 3NF</h3>
        <p>Una tabla está en 3NF si:</p>
        <ol>
            <li>Está en <strong>2NF</strong></li>
            <li>No hay <strong>dependencias transitivas</strong> (atributos no-clave no dependen de otros atributos no-clave)</li>
        </ol>

        <h3>4.2. Ejemplo: Violación de 3NF</h3>

        <div class="alert alert-danger">
            <strong>❌ MAL - Tabla NO en 3NF:</strong>
            <pre class="mb-0"><code class="language-sql">CREATE TABLE ps_employee_bad (
    id_employee INT PRIMARY KEY,
    firstname VARCHAR(255),
    lastname VARCHAR(255),
    id_shop INT,
    shop_name VARCHAR(255),     -- ❌ Depende de id_shop, no de id_employee
    shop_address VARCHAR(255),  -- ❌ Depende de id_shop
    shop_city VARCHAR(64)       -- ❌ Depende de id_shop
);

-- Dependencia transitiva:
-- id_employee → id_shop → shop_name, shop_address, shop_city
-- 
-- Problema: Si shop_name cambia, hay que actualizar TODOS los empleados
-- de esa tienda (redundancia y anomalías de actualización)</code></pre>
        </div>

        <div class="alert alert-success">
            <strong>✅ BIEN - Tablas en 3NF:</strong>
            <pre class="mb-0"><code class="language-sql">-- Tabla de tiendas (información independiente)
CREATE TABLE ps_shop (
    id_shop INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    city VARCHAR(64),
    active TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de empleados (sin dependencias transitivas)
CREATE TABLE ps_employee (
    id_employee INT AUTO_INCREMENT PRIMARY KEY,
    firstname VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    id_shop INT NOT NULL,  -- Solo la FK, no datos redundantes
    
    FOREIGN KEY (id_shop) 
        REFERENCES ps_shop(id_shop)
        ON DELETE RESTRICT,
    
    INDEX idx_shop (id_shop)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Para obtener datos de la tienda, usar JOIN:
SELECT 
    e.id_employee,
    e.firstname,
    e.lastname,
    s.name AS shop_name,
    s.city AS shop_city
FROM ps_employee e
INNER JOIN ps_shop s ON e.id_shop = s.id_shop;</code></pre>
        </div>

        <h2 class="section-title">5. Forma Normal de Boyce-Codd (BCNF)</h2>

        <h3>5.1. Reglas de BCNF</h3>
        <p>Una tabla está en BCNF si:</p>
        <ol>
            <li>Está en <strong>3NF</strong></li>
            <li>Para cada dependencia funcional <code>X → Y</code>, X debe ser una superclave (clave candidata)</li>
        </ol>

        <div class="alert alert-info">
            <strong>📌 BCNF vs 3NF:</strong> BCNF es más estricta que 3NF. Una tabla puede estar en 3NF pero no en BCNF si tiene múltiples claves candidatas que se solapan.
        </div>

        <h3>5.2. Ejemplo: Violación de BCNF</h3>

        <div class="alert alert-danger">
            <strong>❌ Tabla en 3NF pero NO en BCNF:</strong>
            <pre class="mb-0"><code class="language-sql">-- Ejemplo: Profesor enseña Materia en Aula
CREATE TABLE teaching_schedule (
    professor_id INT,
    subject VARCHAR(100),
    room VARCHAR(50),
    
    PRIMARY KEY (professor_id, subject),
    
    -- Dependencias funcionales:
    -- {professor_id, subject} → room (OK, es la PK)
    -- room → subject (Problema: room NO es superclave)
    -- 
    -- Cada aula está dedicada a UNA materia específica
    -- Entonces: si sabemos el aula, sabemos la materia
);

-- Problema: room → subject pero room no es clave candidata
-- Esto causa anomalías de actualización</code></pre>
        </div>

        <div class="alert alert-success">
            <strong>✅ BIEN - Tablas en BCNF:</strong>
            <pre class="mb-0"><code class="language-sql">-- Separar en dos tablas
CREATE TABLE room_subject (
    room VARCHAR(50) PRIMARY KEY,
    subject VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE professor_schedule (
    professor_id INT,
    room VARCHAR(50),
    time_slot VARCHAR(50),
    
    PRIMARY KEY (professor_id, room, time_slot),
    
    FOREIGN KEY (room) 
        REFERENCES room_subject(room)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;</code></pre>
        </div>

        <h3>5.3. Caso Práctico en PrestaShop</h3>
        <pre><code class="language-sql">-- Sistema de cupones con restricciones
-- Violación BCNF: Un cupón puede aplicarse a una categoría específica
-- Y cada categoría tiene un descuento máximo permitido

-- ❌ NO en BCNF:
CREATE TABLE ps_cart_rule_category_bad (
    id_cart_rule INT,
    id_category INT,
    max_discount_percent DECIMAL(5,2),  -- Depende solo de id_category
    
    PRIMARY KEY (id_cart_rule, id_category)
);
-- Problema: id_category → max_discount_percent (id_category no es superclave)

-- ✅ BCNF:
CREATE TABLE ps_category_discount_limit (
    id_category INT PRIMARY KEY,
    max_discount_percent DECIMAL(5,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE ps_cart_rule_category (
    id_cart_rule INT,
    id_category INT,
    
    PRIMARY KEY (id_cart_rule, id_category),
    
    FOREIGN KEY (id_cart_rule) 
        REFERENCES ps_cart_rule(id_cart_rule)
        ON DELETE CASCADE,
    
    FOREIGN KEY (id_category) 
        REFERENCES ps_category_discount_limit(id_category)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;</code></pre>

        <h2 class="section-title">6. Proceso de Normalización Paso a Paso</h2>

        <h3>6.1. Tabla Original (No Normalizada)</h3>
        <pre><code class="language-plaintext">ORDER_INFO (sin normalizar)
┌───────────┬──────────────┬────────────┬──────────┬──────────────┬────────────┬────────┐
│ id_order  │ customer_name│ cust_email │ products │ product_qtys │ total_paid │ status │
├───────────┼──────────────┼────────────┼──────────┼──────────────┼────────────┼────────┤
│ 1         │ Juan Pérez   │ juan@...   │ P1, P2   │ 2, 1         │ 150.00     │ Paid   │
│ 2         │ Ana García   │ ana@...    │ P1       │ 3            │ 90.00      │ Pending│
└───────────┴──────────────┴────────────┴──────────┴──────────────┴────────────┴────────┘

Problemas:
❌ Violación 1NF: products y product_qtys no son atómicos (valores múltiples)
❌ Redundancia: customer_name se repite si el cliente hace múltiples pedidos</code></pre>

        <h3>6.2. Aplicando 1NF</h3>
        <pre><code class="language-sql">-- Separar productos en filas individuales
CREATE TABLE order_info_1nf (
    id_order INT,
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    id_product VARCHAR(10),
    product_quantity INT,
    total_paid DECIMAL(20,6),
    status VARCHAR(50),
    
    PRIMARY KEY (id_order, id_product)
);

-- Datos en 1NF:
-- id_order | customer_name | customer_email | id_product | qty | total  | status
-- 1        | Juan Pérez    | juan@...       | P1         | 2   | 150.00 | Paid
-- 1        | Juan Pérez    | juan@...       | P2         | 1   | 150.00 | Paid
-- 2        | Ana García    | ana@...        | P1         | 3   | 90.00  | Pending

-- ✅ Ahora todos los valores son atómicos
-- ❌ Pero aún hay redundancia de customer_name y customer_email</code></pre>

        <h3>6.3. Aplicando 2NF</h3>
        <pre><code class="language-sql">-- Eliminar dependencias parciales de la clave compuesta

-- Tabla 1: Información del pedido (depende solo de id_order)
CREATE TABLE ps_orders_2nf (
    id_order INT PRIMARY KEY,
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    total_paid DECIMAL(20,6),
    status VARCHAR(50)
);

-- Tabla 2: Detalles del pedido (depende de clave completa)
CREATE TABLE ps_order_detail_2nf (
    id_order INT,
    id_product VARCHAR(10),
    product_quantity INT,
    
    PRIMARY KEY (id_order, id_product),
    FOREIGN KEY (id_order) REFERENCES ps_orders_2nf(id_order)
);

-- ✅ Ya no hay dependencias parciales
-- ❌ Pero customer_name depende de customer_email (transitiva)</code></pre>

        <h3>6.4. Aplicando 3NF</h3>
        <pre><code class="language-sql">-- Eliminar dependencias transitivas

-- Tabla 1: Clientes
CREATE TABLE ps_customer_3nf (
    id_customer INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE
);

-- Tabla 2: Pedidos (ahora con id_customer en lugar de datos redundantes)
CREATE TABLE ps_orders_3nf (
    id_order INT AUTO_INCREMENT PRIMARY KEY,
    id_customer INT NOT NULL,
    total_paid DECIMAL(20,6),
    status VARCHAR(50),
    
    FOREIGN KEY (id_customer) REFERENCES ps_customer_3nf(id_customer)
);

-- Tabla 3: Detalles de pedido
CREATE TABLE ps_order_detail_3nf (
    id_order_detail INT AUTO_INCREMENT PRIMARY KEY,
    id_order INT NOT NULL,
    id_product INT NOT NULL,
    product_quantity INT,
    
    FOREIGN KEY (id_order) REFERENCES ps_orders_3nf(id_order),
    FOREIGN KEY (id_product) REFERENCES ps_product(id_product)
);

-- ✅ Ahora está en 3NF: sin redundancias, sin dependencias transitivas</code></pre>

        <h2 class="section-title">7. Casos Especiales en PrestaShop</h2>

        <h3>7.1. Tablas Multiling: Desnormalización Controlada</h3>
        <p>PrestaShop usa una técnica de desnormalización para datos multiidioma:</p>

        <pre><code class="language-sql">-- Tabla principal
CREATE TABLE ps_product (
    id_product INT AUTO_INCREMENT PRIMARY KEY,
    reference VARCHAR(64),
    price DECIMAL(20,6),
    active TINYINT(1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de idiomas (datos traducibles)
CREATE TABLE ps_product_lang (
    id_product INT NOT NULL,
    id_lang INT NOT NULL,
    name VARCHAR(255),
    description TEXT,
    
    PRIMARY KEY (id_product, id_lang),
    
    FOREIGN KEY (id_product) 
        REFERENCES ps_product(id_product)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Este patrón está en 3NF aunque pueda parecer redundante
-- name y description dependen de (id_product + id_lang), no solo de id_product</code></pre>

        <h2 class="section-title">8. Cuándo NO Normalizar (Desnormalización)</h2>

        <p>A veces es necesario desnormalizar estratégicamente para mejorar el rendimiento:</p>

        <table class="table table-bordered">
            <thead class="table-dark">
                <tr>
                    <th>Escenario</th>
                    <th>Solución Desnormalizada</th>
                    <th>Razón</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Contadores frecuentes</td>
                    <td>Guardar <code>products_count</code> en <code>ps_category</code></td>
                    <td>Evitar COUNT(*) costoso en cada carga</td>
                </tr>
                <tr>
                    <td>Datos agregados</td>
                    <td>Guardar <code>total_paid</code> en <code>ps_orders</code></td>
                    <td>Evitar SUM() de order_detail en cada consulta</td>
                </tr>
                <tr>
                    <td>Data warehousing</td>
                    <td>Tablas de reportes pre-calculados</td>
                    <td>Consultas analíticas muy complejas</td>
                </tr>
                <tr>
                    <td>Caché de datos</td>
                    <td>Duplicar información crítica en memoria</td>
                    <td>Reducir latencia de acceso</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">9. Checklist de Normalización</h2>

        <table class="table table-striped">
            <thead class="table-dark">
                <tr>
                    <th width="10%">Forma</th>
                    <th width="50%">Pregunta de Verificación</th>
                    <th width="40%">Ejemplo de Violación</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>1NF</strong></td>
                    <td>¿Todos los valores son atómicos?</td>
                    <td><code>phones: "612345, 687654"</code></td>
                </tr>
                <tr>
                    <td><strong>1NF</strong></td>
                    <td>¿No hay grupos repetitivos de columnas?</td>
                    <td><code>phone1, phone2, phone3</code></td>
                </tr>
                <tr>
                    <td><strong>2NF</strong></td>
                    <td>¿Todos los atributos dependen de TODA la PK?</td>
                    <td><code>product_name</code> solo depende de <code>id_product</code>, no de <code>(id_order, id_product)</code></td>
                </tr>
                <tr>
                    <td><strong>3NF</strong></td>
                    <td>¿No hay atributos no-clave que dependan de otros no-clave?</td>
                    <td><code>shop_name</code> depende de <code>id_shop</code>, no de <code>id_employee</code></td>
                </tr>
                <tr>
                    <td><strong>BCNF</strong></td>
                    <td>¿Todas las dependencias funcionales tienen una superclave a la izquierda?</td>
                    <td><code>room → subject</code> pero <code>room</code> no es superclave</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">10. Herramientas y Recursos</h2>

        <ul>
            <li><strong>Verificadores automáticos:</strong> Herramientas online para detectar anomalías de normalización</li>
            <li><strong>MySQL Workbench:</strong> Genera diagramas ERD que ayudan a identificar dependencias</li>
            <li><strong>Documentación:</strong> Mantener un documento de dependencias funcionales por tabla</li>
            <li><strong>Code reviews:</strong> Revisar esquemas con equipo antes de implementar</li>
        </ul>
    </div>
    `;

// @ts-nocheck
const desnormalizacionEstrategica = `
    <div class="content-section">
        <h1 id="desnormalizacion-estrategica">Desnormalización Estratégica</h1>
        <p>La desnormalización es la técnica de introducir redundancia controlada en un esquema de base de datos normalizado para mejorar el rendimiento de lectura. En el contexto de PrestaShop 8.9+ y PHP 8.1+, aplicada correctamente, puede resolver cuellos de botella de rendimiento sin sacrificar la integridad de los datos.</p>

        <h2 class="section-title">1. Normalización vs Desnormalización</h2>

        <h3>1.1. Comparación Fundamental</h3>

        <table class="table table-bordered">
            <thead class="table-dark">
                <tr>
                    <th>Aspecto</th>
                    <th>Normalización (3NF)</th>
                    <th>Desnormalización</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Redundancia</strong></td>
                    <td>Minimizada completamente</td>
                    <td>Introducida estratégicamente</td>
                </tr>
                <tr>
                    <td><strong>Integridad</strong></td>
                    <td>Máxima (sin anomalías)</td>
                    <td>Requiere mantenimiento activo</td>
                </tr>
                <tr>
                    <td><strong>Lecturas</strong></td>
                    <td>Requieren múltiples JOINs</td>
                    <td>Rápidas (datos pre-calculados)</td>
                </tr>
                <tr>
                    <td><strong>Escrituras</strong></td>
                    <td>Rápidas (menos tablas)</td>
                    <td>Más lentas (actualizar redundancia)</td>
                </tr>
                <tr>
                    <td><strong>Espacio</strong></td>
                    <td>Óptimo</td>
                    <td>Mayor consumo</td>
                </tr>
                <tr>
                    <td><strong>Complejidad queries</strong></td>
                    <td>Alta (muchos JOINs)</td>
                    <td>Baja (queries simples)</td>
                </tr>
            </tbody>
        </table>

        <h3>1.2. Cuándo Considerar Desnormalización</h3>

        <div class="alert alert-warning">
            <strong>⚠️ Regla de Oro:</strong> Normalizar primero, desnormalizar solo cuando haya evidencia de problemas de rendimiento.
        </div>

        <table class="table table-striped">
            <thead class="table-dark">
                <tr>
                    <th>Escenario</th>
                    <th>¿Desnormalizar?</th>
                    <th>Razón</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Queries de reporte lentos con 5+ JOINs</td>
                    <td>✅ Sí</td>
                    <td>Tablas resumen pueden acelerar dramáticamente</td>
                </tr>
                <tr>
                    <td>Listado de productos con precio final</td>
                    <td>✅ Sí</td>
                    <td>Cálculo repetido miles de veces</td>
                </tr>
                <tr>
                    <td>Contadores (total productos en categoría)</td>
                    <td>✅ Sí</td>
                    <td>COUNT(*) costoso en tablas grandes</td>
                </tr>
                <tr>
                    <td>CRUD simple con pocos SELECTs</td>
                    <td>❌ No</td>
                    <td>Overhead de mantenimiento no justificado</td>
                </tr>
                <tr>
                    <td>Datos que cambian frecuentemente</td>
                    <td>⚠️ Evaluar</td>
                    <td>Costo de sincronización puede ser prohibitivo</td>
                </tr>
                <tr>
                    <td>Tablas pequeñas (<10k filas)</td>
                    <td>❌ No</td>
                    <td>Rendimiento ya es bueno sin optimización</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">2. Técnicas de Desnormalización</h2>

        <h3>2.1. Duplicación de Columnas</h3>

        <p>Copiar datos de tablas relacionadas para evitar JOINs frecuentes.</p>

        <div class="row">
            <div class="col-md-6">
                <div class="card mb-3">
                    <div class="card-header bg-primary text-white">❌ Normalizado (Lento)</div>
                    <div class="card-body">
                        <pre><code class="language-sql">-- Tabla de pedidos
CREATE TABLE ps_orders (
    id_order INT PRIMARY KEY,
    id_customer INT NOT NULL,
    total_paid DECIMAL(20,6)
);

-- Tabla de clientes
CREATE TABLE ps_customer (
    id_customer INT PRIMARY KEY,
    firstname VARCHAR(255),
    lastname VARCHAR(255),
    email VARCHAR(255)
);

-- Query que requiere JOIN
SELECT 
    o.id_order,
    o.total_paid,
    c.firstname,
    c.lastname,
    c.email
FROM ps_orders o
INNER JOIN ps_customer c 
    ON o.id_customer = c.id_customer
WHERE o.id_order = ?;</code></pre>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="card mb-3">
                    <div class="card-header bg-success text-white">✅ Desnormalizado (Rápido)</div>
                    <div class="card-body">
                        <pre><code class="language-sql">-- Datos del cliente duplicados en pedido
CREATE TABLE ps_orders (
    id_order INT PRIMARY KEY,
    id_customer INT NOT NULL,
    
    -- Datos desnormalizados
    customer_firstname VARCHAR(255),
    customer_lastname VARCHAR(255),
    customer_email VARCHAR(255),
    
    total_paid DECIMAL(20,6),
    
    FOREIGN KEY (id_customer)
        REFERENCES ps_customer(id_customer)
);

-- Query simple sin JOIN
SELECT 
    id_order,
    total_paid,
    customer_firstname,
    customer_lastname,
    customer_email
FROM ps_orders
WHERE id_order = ?;</code></pre>
                    </div>
                </div>
            </div>
        </div>

        <div class="alert alert-info">
            <strong>📌 Caso Real en PrestaShop:</strong> La tabla <code>ps_order_detail</code> almacena <code>product_name</code> y <code>product_price</code> en lugar de hacer JOIN con <code>ps_product</code>, porque los productos pueden cambiar o eliminarse pero el historial del pedido debe preservarse.
        </div>

        <h3>2.2. Columnas Calculadas</h3>

        <p>Almacenar resultados de cálculos complejos en lugar de calcularlos en cada query.</p>

        <pre><code class="language-sql">-- Ejemplo: Precio final con impuestos
CREATE TABLE ps_product (
    id_product INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    price DECIMAL(20,6) NOT NULL,
    id_tax_rules_group INT UNSIGNED,
    
    -- Columna desnormalizada: precio con impuesto (calculado)
    price_with_tax DECIMAL(20,6) NOT NULL DEFAULT 0,
    
    wholesale_price DECIMAL(20,6) NOT NULL DEFAULT 0,
    
    -- Columna desnormalizada: margen de beneficio
    profit_margin DECIMAL(10,2) NOT NULL DEFAULT 0,
    
    INDEX idx_price_tax (price_with_tax)
) ENGINE=InnoDB;

-- Trigger para mantener sincronización
DELIMITER $$

CREATE TRIGGER before_product_update
BEFORE UPDATE ON ps_product
FOR EACH ROW
BEGIN
    DECLARE tax_rate DECIMAL(10,4);
    
    -- Obtener tasa de impuesto
    SELECT rate INTO tax_rate
    FROM ps_tax
    WHERE id_tax = (
        SELECT id_tax FROM ps_tax_rules_group
        WHERE id_tax_rules_group = NEW.id_tax_rules_group
        LIMIT 1
    );
    
    -- Calcular precio con impuesto
    SET NEW.price_with_tax = NEW.price * (1 + tax_rate / 100);
    
    -- Calcular margen de beneficio
    IF NEW.wholesale_price > 0 THEN
        SET NEW.profit_margin = ((NEW.price - NEW.wholesale_price) / NEW.wholesale_price) * 100;
    END IF;
END$$

DELIMITER ;

-- Query optimizado
SELECT id_product, name, price_with_tax
FROM ps_product
WHERE price_with_tax BETWEEN 50 AND 100
ORDER BY profit_margin DESC
LIMIT 10;</code></pre>

        <h3>2.3. Tablas Resumen (Aggregate Tables)</h3>

        <p>Crear tablas pre-calculadas con agregaciones frecuentes.</p>

        <pre><code class="language-sql">-- Tabla resumen para estadísticas de ventas
CREATE TABLE ps_sales_summary (
    id_summary INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    summary_date DATE NOT NULL,
    id_product INT UNSIGNED,
    id_category INT UNSIGNED,
    
    -- Métricas agregadas
    total_quantity INT UNSIGNED NOT NULL DEFAULT 0,
    total_revenue DECIMAL(20,6) NOT NULL DEFAULT 0,
    total_orders INT UNSIGNED NOT NULL DEFAULT 0,
    avg_order_value DECIMAL(20,6) NOT NULL DEFAULT 0,
    
    UNIQUE KEY uk_date_product (summary_date, id_product),
    INDEX idx_date (summary_date),
    INDEX idx_category (id_category)
) ENGINE=InnoDB;

-- Procedimiento para actualizar resumen diario
DELIMITER $$

CREATE PROCEDURE update_daily_sales_summary(IN target_date DATE)
BEGIN
    -- Eliminar datos existentes del día
    DELETE FROM ps_sales_summary WHERE summary_date = target_date;
    
    -- Insertar datos agregados
    INSERT INTO ps_sales_summary (
        summary_date,
        id_product,
        id_category,
        total_quantity,
        total_revenue,
        total_orders,
        avg_order_value
    )
    SELECT 
        DATE(o.date_add) AS summary_date,
        od.id_product,
        p.id_category_default,
        SUM(od.product_quantity) AS total_quantity,
        SUM(od.product_price * od.product_quantity) AS total_revenue,
        COUNT(DISTINCT o.id_order) AS total_orders,
        AVG(od.product_price * od.product_quantity) AS avg_order_value
    FROM ps_orders o
    INNER JOIN ps_order_detail od ON o.id_order = od.id_order
    INNER JOIN ps_product p ON od.id_product = p.id_product
    WHERE DATE(o.date_add) = target_date
      AND o.current_state IN (2, 3, 4, 5)  -- Solo pedidos válidos
    GROUP BY 
        DATE(o.date_add),
        od.id_product,
        p.id_category_default;
END$$

DELIMITER ;

-- Ejecutar diariamente con CRON
CALL update_daily_sales_summary(CURDATE());

-- Query ultra-rápido para reportes
SELECT 
    summary_date,
    SUM(total_revenue) AS daily_revenue,
    SUM(total_quantity) AS daily_units,
    AVG(avg_order_value) AS avg_basket
FROM ps_sales_summary
WHERE summary_date BETWEEN '2024-01-01' AND '2024-12-31'
GROUP BY summary_date
ORDER BY summary_date;</code></pre>

        <h3>2.4. Contadores Desnormalizados</h3>

        <p>Mantener contadores en la tabla padre para evitar COUNT(*) costosos.</p>

        <pre><code class="language-sql">-- Agregar contador de productos a tabla de categorías
ALTER TABLE ps_category
ADD COLUMN products_count INT UNSIGNED NOT NULL DEFAULT 0,
ADD INDEX idx_products_count (products_count);

-- Procedimiento para actualizar contadores
DELIMITER $$

CREATE PROCEDURE update_category_products_count()
BEGIN
    UPDATE ps_category c
    SET c.products_count = (
        SELECT COUNT(*)
        FROM ps_category_product cp
        WHERE cp.id_category = c.id_category
    );
END$$

DELIMITER ;

-- Triggers para mantener sincronización automática
DELIMITER $$

CREATE TRIGGER after_category_product_insert
AFTER INSERT ON ps_category_product
FOR EACH ROW
BEGIN
    UPDATE ps_category
    SET products_count = products_count + 1
    WHERE id_category = NEW.id_category;
END$$

CREATE TRIGGER after_category_product_delete
AFTER DELETE ON ps_category_product
FOR EACH ROW
BEGIN
    UPDATE ps_category
    SET products_count = products_count - 1
    WHERE id_category = OLD.id_category;
END$$

DELIMITER ;

-- Query rápido sin COUNT
SELECT id_category, name, products_count
FROM ps_category
WHERE products_count > 10
ORDER BY products_count DESC;</code></pre>

        <h2 class="section-title">3. Mantenimiento de Datos Desnormalizados</h2>

        <h3>3.1. Estrategias de Sincronización</h3>

        <table class="table table-striped">
            <thead class="table-dark">
                <tr>
                    <th>Estrategia</th>
                    <th>Método</th>
                    <th>Ventajas</th>
                    <th>Desventajas</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Triggers</strong></td>
                    <td>Actualización automática en INSERT/UPDATE/DELETE</td>
                    <td>Siempre sincronizado, transparente</td>
                    <td>Overhead en escrituras, difícil debugging</td>
                </tr>
                <tr>
                    <td><strong>Procedimientos</strong></td>
                    <td>CALL manual o programado (CRON)</td>
                    <td>Control total, no afecta transacciones</td>
                    <td>Desfase temporal posible</td>
                </tr>
                <tr>
                    <td><strong>Capa aplicación</strong></td>
                    <td>Actualización en código PHP</td>
                    <td>Lógica centralizada, fácil debug</td>
                    <td>Puede olvidarse, inconsistencia</td>
                </tr>
                <tr>
                    <td><strong>Batch jobs</strong></td>
                    <td>Scripts programados periódicos</td>
                    <td>No afecta rendimiento en tiempo real</td>
                    <td>Datos desactualizados entre ejecuciones</td>
                </tr>
            </tbody>
        </table>

        <h3>3.2. Implementación en PrestaShop</h3>

        <pre><code class="language-php"><?php
// classes/Product.php - Ejemplo de sincronización en capa de aplicación

class Product extends ObjectModel
{
    public $price;
    public $id_tax_rules_group;
    public $price_with_tax; // Campo desnormalizado
    
    /**
     * Actualizar antes de guardar
     */
    public function update($nullValues = false)
    {
        // Calcular precio con impuesto
        $this->price_with_tax = $this->getPriceWithTax();
        
        return parent::update($nullValues);
    }
    
    /**
     * Calcular precio con impuesto
     */
    public function getPriceWithTax()
    {
        $taxRate = TaxRulesGroup::getTaxRate($this->id_tax_rules_group);
        return $this->price * (1 + $taxRate / 100);
    }
    
    /**
     * Actualizar contadores de categoría al asociar producto
     */
    public function addToCategory($idCategory)
    {
        $result = Db::getInstance()->insert('category_product', [
            'id_category' => (int)$idCategory,
            'id_product' => (int)$this->id
        ]);
        
        if ($result) {
            // Incrementar contador desnormalizado
            Category::updateProductsCount($idCategory, 1);
        }
        
        return $result;
    }
}

// classes/Category.php
class Category extends ObjectModel
{
    public $products_count; // Campo desnormalizado
    
    /**
     * Actualizar contador de productos
     */
    public static function updateProductsCount($idCategory, $increment = 0)
    {
        return Db::getInstance()->execute('
            UPDATE \`' . _DB_PREFIX_ . 'category\`
            SET \`products_count\` = \`products_count\` + ' . (int)$increment . '
            WHERE \`id_category\` = ' . (int)$idCategory
        );
    }
    
    /**
     * Recalcular contador desde cero (para mantenimiento)
     */
    public function recalculateProductsCount()
    {
        $count = Db::getInstance()->getValue('
            SELECT COUNT(*)
            FROM \`' . _DB_PREFIX_ . 'category_product\`
            WHERE \`id_category\` = ' . (int)$this->id
        );
        
        $this->products_count = (int)$count;
        return $this->update();
    }
}</code></pre>

        <h2 class="section-title">4. Vistas Materializadas</h2>

        <h3>4.1. Concepto y Simulación en MySQL</h3>

        <p>MySQL no soporta vistas materializadas nativas, pero podemos simularlas con tablas y procedimientos:</p>

        <pre><code class="language-sql">-- Crear tabla que actúa como vista materializada
CREATE TABLE mv_product_sales (
    id_product INT UNSIGNED PRIMARY KEY,
    product_name VARCHAR(255),
    total_sold INT UNSIGNED NOT NULL DEFAULT 0,
    total_revenue DECIMAL(20,6) NOT NULL DEFAULT 0,
    avg_price DECIMAL(20,6) NOT NULL DEFAULT 0,
    last_sale_date DATETIME,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_total_sold (total_sold),
    INDEX idx_revenue (total_revenue)
) ENGINE=InnoDB;

-- Procedimiento para refrescar vista materializada
DELIMITER $$

CREATE PROCEDURE refresh_product_sales_mv()
BEGIN
    TRUNCATE TABLE mv_product_sales;
    
    INSERT INTO mv_product_sales (
        id_product,
        product_name,
        total_sold,
        total_revenue,
        avg_price,
        last_sale_date
    )
    SELECT 
        p.id_product,
        pl.name,
        COALESCE(SUM(od.product_quantity), 0) AS total_sold,
        COALESCE(SUM(od.product_price * od.product_quantity), 0) AS total_revenue,
        COALESCE(AVG(od.product_price), 0) AS avg_price,
        MAX(o.date_add) AS last_sale_date
    FROM ps_product p
    INNER JOIN ps_product_lang pl ON p.id_product = pl.id_product AND pl.id_lang = 1
    LEFT JOIN ps_order_detail od ON p.id_product = od.id_product
    LEFT JOIN ps_orders o ON od.id_order = o.id_order AND o.current_state IN (2,3,4,5)
    GROUP BY p.id_product, pl.name;
END$$

DELIMITER ;

-- Programar con event scheduler (ejecutar cada hora)
CREATE EVENT refresh_sales_mv_hourly
ON SCHEDULE EVERY 1 HOUR
DO CALL refresh_product_sales_mv();

-- Query ultra-rápido
SELECT * FROM mv_product_sales
ORDER BY total_revenue DESC
LIMIT 10;</code></pre>

        <h3>4.2. Refrescamiento Incremental</h3>

        <pre><code class="language-sql">-- Versión optimizada: solo actualiza productos con cambios recientes
DELIMITER $$

CREATE PROCEDURE refresh_product_sales_mv_incremental()
BEGIN
    -- Actualizar productos con ventas en las últimas 2 horas
    DELETE FROM mv_product_sales
    WHERE id_product IN (
        SELECT DISTINCT od.id_product
        FROM ps_order_detail od
        INNER JOIN ps_orders o ON od.id_order = o.id_order
        WHERE o.date_add >= DATE_SUB(NOW(), INTERVAL 2 HOUR)
    );
    
    -- Reinsertar solo los productos actualizados
    INSERT INTO mv_product_sales (
        id_product,
        product_name,
        total_sold,
        total_revenue,
        avg_price,
        last_sale_date
    )
    SELECT 
        p.id_product,
        pl.name,
        COALESCE(SUM(od.product_quantity), 0),
        COALESCE(SUM(od.product_price * od.product_quantity), 0),
        COALESCE(AVG(od.product_price), 0),
        MAX(o.date_add)
    FROM ps_product p
    INNER JOIN ps_product_lang pl ON p.id_product = pl.id_product AND pl.id_lang = 1
    LEFT JOIN ps_order_detail od ON p.id_product = od.id_product
    LEFT JOIN ps_orders o ON od.id_order = o.id_order AND o.current_state IN (2,3,4,5)
    WHERE p.id_product IN (
        SELECT DISTINCT od2.id_product
        FROM ps_order_detail od2
        INNER JOIN ps_orders o2 ON od2.id_order = o2.id_order
        WHERE o2.date_add >= DATE_SUB(NOW(), INTERVAL 2 HOUR)
    )
    GROUP BY p.id_product, pl.name;
END$$

DELIMITER ;</code></pre>

        <h2 class="section-title">5. Casos de Uso en PrestaShop</h2>

        <h3>5.1. Listado de Productos con Precio Final</h3>

        <pre><code class="language-sql">-- Desnormalización: Almacenar precio final pre-calculado
ALTER TABLE ps_product
ADD COLUMN final_price DECIMAL(20,6) NOT NULL DEFAULT 0,
ADD INDEX idx_final_price (final_price);

-- Trigger para actualizar
DELIMITER $$

CREATE TRIGGER calculate_final_price_product
BEFORE UPDATE ON ps_product
FOR EACH ROW
BEGIN
    DECLARE tax_rate DECIMAL(10,4) DEFAULT 0;
    DECLARE discount DECIMAL(10,4) DEFAULT 0;
    
    -- Obtener impuesto
    SELECT rate INTO tax_rate
    FROM ps_tax
    WHERE id_tax = (
        SELECT id_tax FROM ps_tax_rules
        WHERE id_tax_rules_group = NEW.id_tax_rules_group
        LIMIT 1
    );
    
    -- Calcular descuento específico
    SELECT reduction_percent INTO discount
    FROM ps_specific_price
    WHERE id_product = NEW.id_product
      AND to_date >= NOW()
    ORDER BY reduction_percent DESC
    LIMIT 1;
    
    -- Precio final = (precio - descuento) * (1 + impuesto)
    SET NEW.final_price = (NEW.price * (1 - COALESCE(discount, 0) / 100)) * (1 + COALESCE(tax_rate, 0) / 100);
END$$

DELIMITER ;

-- Query simplificado para listado
SELECT id_product, name, final_price
FROM ps_product
WHERE active = 1
ORDER BY final_price ASC
LIMIT 20;</code></pre>

        <h3>5.2. Búsqueda Rápida de Productos</h3>

        <pre><code class="language-sql">-- Tabla desnormalizada con todos los datos de búsqueda
CREATE TABLE ps_product_search (
    id_product INT UNSIGNED PRIMARY KEY,
    search_text TEXT NOT NULL,
    category_names TEXT,
    manufacturer_name VARCHAR(255),
    active TINYINT(1),
    price_with_tax DECIMAL(20,6),
    
    FULLTEXT KEY ft_search (search_text, category_names, manufacturer_name)
) ENGINE=InnoDB;

-- Procedimiento de sincronización
DELIMITER $$

CREATE PROCEDURE sync_product_search()
BEGIN
    TRUNCATE TABLE ps_product_search;
    
    INSERT INTO ps_product_search
    SELECT 
        p.id_product,
        CONCAT_WS(' ',
            pl.name,
            pl.description,
            pl.description_short,
            p.reference,
            p.ean13
        ) AS search_text,
        GROUP_CONCAT(DISTINCT cl.name SEPARATOR ' ') AS category_names,
        m.name AS manufacturer_name,
        p.active,
        p.price * (1 + COALESCE(t.rate, 0) / 100) AS price_with_tax
    FROM ps_product p
    INNER JOIN ps_product_lang pl ON p.id_product = pl.id_product
    LEFT JOIN ps_category_product cp ON p.id_product = cp.id_product
    LEFT JOIN ps_category_lang cl ON cp.id_category = cl.id_category
    LEFT JOIN ps_manufacturer m ON p.id_manufacturer = m.id_manufacturer
    LEFT JOIN ps_tax t ON p.id_tax_rules_group = t.id_tax
    WHERE pl.id_lang = 1
    GROUP BY p.id_product;
END$$

DELIMITER ;

-- Búsqueda ultra-rápida
SELECT id_product, search_text, price_with_tax
FROM ps_product_search
WHERE MATCH(search_text, category_names, manufacturer_name)
AGAINST ('smartphone android' IN NATURAL LANGUAGE MODE)
  AND active = 1
ORDER BY price_with_tax
LIMIT 20;</code></pre>

        <h2 class="section-title">6. Trade-offs y Decisiones</h2>

        <h3>6.1. Análisis de Costo-Beneficio</h3>

        <table class="table table-bordered">
            <thead class="table-dark">
                <tr>
                    <th>Factor</th>
                    <th>Peso</th>
                    <th>Favores Normalización</th>
                    <th>Favorece Desnormalización</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Ratio Lectura/Escritura</strong></td>
                    <td>Alto</td>
                    <td>1:1 o menos</td>
                    <td>100:1 o más</td>
                </tr>
                <tr>
                    <td><strong>Complejidad de queries</strong></td>
                    <td>Alto</td>
                    <td>Queries simples</td>
                    <td>5+ JOINs frecuentes</td>
                </tr>
                <tr>
                    <td><strong>Tamaño de datos</strong></td>
                    <td>Medio</td>
                    <td>< 100k filas</td>
                    <td>> 1M filas</td>
                </tr>
                <tr>
                    <td><strong>Requisitos de consistencia</strong></td>
                    <td>Alto</td>
                    <td>Crítica (financiero)</td>
                    <td>Eventual (analytics)</td>
               </tr>
                <tr>
                    <td><strong>Espacio disponible</strong></td>
                    <td>Bajo</td>
                    <td>Limitado</td>
                    <td>Abundante</td>
                </tr>
            </tbody>
        </table>

        <h3>6.2. Patrón de Decisión</h3>

        <pre><code class="language-plaintext">┌─────────────────────────────────────┐
│ ¿Hay problema de rendimiento real?  │
└───────────────┬─────────────────────┘
                │ No → Mantener normalizado
                ▼ Sí
┌─────────────────────────────────────┐
│ ¿Puedes optimizar con índices?     │
└───────────────┬─────────────────────┘
                │ Sí → Agregar índices primero
                ▼ No
┌─────────────────────────────────────┐
│ ¿Ratio lectura:escritura > 10:1?   │
└───────────────┬─────────────────────┘
                │ No → Considerar cache
                ▼ Sí
┌─────────────────────────────────────┐
│ ¿Puedes mantener sincronización?   │
└───────────────┬─────────────────────┘
                │ No → Usar caché
                ▼ Sí
┌─────────────────────────────────────┐
│      ✅ DESNORMALIZAR               │
└─────────────────────────────────────┘</code></pre>

        <h2 class="section-title">7. Mejores Prácticas</h2>

        <table class="table table-striped">
            <thead class="table-dark">
                <tr>
                    <th>Práctica</th>
                    <th>Descripción</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Documentar decisiones</strong></td>
                    <td>Comentar en SQL y código por qué se desnormalizó</td>
                </tr>
                <tr>
                    <td><strong>Automatizar sincronización</strong></td>
                    <td>Usar triggers o procedimientos, nunca manual</td>
                </tr>
                <tr>
                    <td><strong>Monitorear consistencia</strong></td>
                    <td>Jobs periódicos para verificar datos redundantes</td>
                </tr>
                <tr>
                    <td><strong>Limitar alcance</strong></td>
                    <td>Desnormalizar solo lo necesario, no toda la BD</td>
                </tr>
                <tr>
                    <td><strong>Testear sincronización</strong></td>
                    <td>Tests unitarios para validar triggers y procedimientos</td>
                </tr>
                <tr>
                    <td><strong>Medir impacto</strong></td>
                    <td>Benchmarks antes y después de desnormalizar</td>
                </tr>
                <tr>
                    <td><strong>Plan de rollback</strong></td>
                    <td>Poder volver a normalizado si no funciona</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">8. Checklist de Desnormalización</h2>

        <ul>
            <li>✅ Identifiqué un cuello de botella de rendimiento real (con métricas)</li>
            <li>✅ Probé optimizaciones simples primero (índices, cache)</li>
            <li>✅ El ratio lectura/escritura justifica la redundancia</li>
            <li>✅ Documenté qué datos son redundantes y por qué</li>
            <li>✅ Implementé sincronización automática (triggers/procedimientos)</li>
            <li>✅ Creé tests para validar consistencia</li>
            <li>✅ Medí mejora de rendimiento (antes/después)</li>
            <li>✅ Configuré monitoring para detectar desincronización</li>
            <li>✅ Documenté proceso de rollback si es necesario</li>
        </ul>

        <h2 class="section-title">9. Recursos Adicionales</h2>
        <ul>
            <li><strong>High Performance MySQL:</strong> "High Performance MySQL" by Baron Schwartz</li>
            <li><strong>Database Optimization:</strong> <a href="https://use-the-index-luke.com/" target="_blank">Use The Index, Luke!</a></li>
            <li><strong>PrestaShop Performance:</strong> <a href="https://devdocs.prestashop.com/8/development/database/db-best-practices/" target="_blank">Database Best Practices</a></li>
        </ul>
    </div>
    `;

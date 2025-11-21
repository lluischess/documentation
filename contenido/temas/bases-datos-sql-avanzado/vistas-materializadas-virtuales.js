// @ts-nocheck
const vistasMatVirtuales = `
    <div class="content-section">
        <h1 id="vistas">Vistas Materializadas y Virtuales</h1>
        <p>Las vistas son tablas virtuales basadas en el resultado de una consulta SQL. En PrestaShop 8.9+ con PHP 8.1+ y MySQL 8.0+, las vistas simplifican queries complejas, mejoran la seguridad y pueden optimizar el rendimiento de reportes y dashboards.</p>

        <h2 class="section-title">1. Vistas Virtuales (Standard Views)</h2>

        <h3>1.1. ¿Qué es una Vista Virtual?</h3>
        <p>Una vista virtual es una consulta SQL guardada que se comporta como una tabla. No almacena datos físicamente; cada vez que se consulta, se ejecuta la query subyacente.</p>

        <div class="alert alert-info">
            <strong>💡 Características de Vistas Virtuales:</strong>
            <ul class="mb-0">
                <li>No ocupan espacio de almacenamiento (solo la definición)</li>
                <li>Siempre muestran datos actualizados</li>
                <li>Se pueden usar como tablas en queries</li>
                <li>Simplifican consultas complejas</li>
                <li>Mejoran la seguridad (ocultan columnas)</li>
            </ul>
        </div>

        <h3>1.2. Crear una Vista Virtual</h3>

        <pre><code class="language-sql">-- Sintaxis básica
CREATE VIEW nombre_vista AS
SELECT columnas
FROM tablas
WHERE condiciones;

-- Vista de productos activos con su información completa
CREATE VIEW vw_products_active AS
SELECT 
    p.id_product,
    p.reference,
    pl.name AS product_name,
    pl.description_short,
    p.price,
    p.quantity AS stock,
    c.id_category,
    cl.name AS category_name,
    p.active,
    p.date_add,
    p.date_upd
FROM ps_product p
INNER JOIN ps_product_lang pl 
    ON p.id_product = pl.id_product AND pl.id_lang = 1
INNER JOIN ps_category_product cp 
    ON p.id_product = cp.id_product
INNER JOIN ps_category c 
    ON cp.id_category = c.id_category
INNER JOIN ps_category_lang cl 
    ON c.id_category = cl.id_category AND cl.id_lang = 1
WHERE p.active = 1;</code></pre>

        <h3>1.3. Usar una Vista</h3>

        <pre><code class="language-sql">-- Consultar la vista como si fuera una tabla
SELECT * FROM vw_products_active
WHERE price > 50
ORDER BY date_add DESC
LIMIT 20;

-- Join con otras tablas
SELECT 
    v.*,
    SUM(od.product_quantity) AS total_sold
FROM vw_products_active v
LEFT JOIN ps_order_detail od ON v.id_product = od.product_id
GROUP BY v.id_product
ORDER BY total_sold DESC;</code></pre>

        <h3>1.4. Vistas para Seguridad y Abstracción</h3>

        <pre><code class="language-sql">-- Vista que oculta información sensible de clientes
CREATE VIEW vw_customers_public AS
SELECT 
    id_customer,
    CONCAT(firstname, ' ', lastname) AS full_name,
    email,
    DATE_FORMAT(birthday, '%Y') AS birth_year,  -- Solo año
    date_add AS registered_date,
    active
FROM ps_customer
WHERE active = 1;
-- Contraseña, IP, notas privadas quedan ocultas

-- Vista de pedidos simplificada para reportes
CREATE VIEW vw_orders_summary AS
SELECT 
    o.id_order,
    o.reference,
    o.id_customer,
    CONCAT(c.firstname, ' ', c.lastname) AS customer_name,
    c.email,
    o.total_paid_real,
    o.current_state,
    osl.name AS order_status,
    o.date_add AS order_date,
    DATE_FORMAT(o.date_add, '%Y-%m') AS order_month
FROM ps_orders o
INNER JOIN ps_customer c ON o.id_customer = c.id_customer
INNER JOIN ps_order_state_lang osl 
    ON o.current_state = osl.id_order_state AND osl.id_lang = 1
WHERE o.valid = 1;</code></pre>

        <h2 class="section-title">2. Casos de Uso de Vistas en PrestaShop</h2>

        <h3>2.1. Dashboard de Ventas</h3>

        <pre><code class="language-sql">-- Vista para dashboard de ventas mensuales
CREATE VIEW vw_sales_dashboard AS
SELECT 
    DATE_FORMAT(o.date_add, '%Y-%m') AS month,
    COUNT(DISTINCT o.id_order) AS total_orders,
    COUNT(DISTINCT o.id_customer) AS unique_customers,
    SUM(o.total_paid_real) AS revenue,
    AVG(o.total_paid_real) AS avg_order_value,
    SUM(CASE WHEN o.current_state = 2 THEN 1 ELSE 0 END) AS paid_orders,
    SUM(CASE WHEN o.current_state = 6 THEN 1 ELSE 0 END) AS cancelled_orders
FROM ps_orders o
WHERE o.valid = 1
GROUP BY month;

-- Consultar el dashboard
SELECT * FROM vw_sales_dashboard
WHERE month >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 12 MONTH), '%Y-%m')
ORDER BY month DESC;</code></pre>

        <h3>2.2. Top Productos por Categoría</h3>

        <pre><code class="language-sql">-- Vista de productos más vendidos por categoría
CREATE VIEW vw_top_products_by_category AS
WITH product_sales AS (
    SELECT 
        product_id,
        SUM(product_quantity) AS total_sold,
        SUM(product_quantity * unit_price_tax_incl) AS revenue
    FROM ps_order_detail
    GROUP BY product_id
),
ranked_products AS (
    SELECT 
        c.id_category,
        cl.name AS category_name,
        p.id_product,
        pl.name AS product_name,
        p.price,
        COALESCE(ps.total_sold, 0) AS total_sold,
        COALESCE(ps.revenue, 0) AS revenue,
        ROW_NUMBER() OVER (
            PARTITION BY c.id_category 
            ORDER BY COALESCE(ps.total_sold, 0) DESC
        ) AS ranking
    FROM ps_category c
    INNER JOIN ps_category_lang cl ON c.id_category = cl.id_category AND cl.id_lang = 1
    INNER JOIN ps_category_product cp ON c.id_category = cp.id_category
    INNER JOIN ps_product p ON cp.id_product = p.id_product
    INNER JOIN ps_product_lang pl ON p.id_product = pl.id_product AND pl.id_lang = 1
    LEFT JOIN product_sales ps ON p.id_product = ps.product_id
    WHERE c.active = 1 AND p.active = 1
)
SELECT *
FROM ranked_products
WHERE ranking <= 10;  -- Top 10 por categoría</code></pre>

        <h3>2.3. Análisis de Clientes</h3>

        <pre><code class="language-sql">-- Vista de perfil completo de clientes
CREATE VIEW vw_customer_profile AS
SELECT 
    c.id_customer,
    c.email,
    CONCAT(c.firstname, ' ', c.lastname) AS full_name,
    c.date_add AS registered_date,
    DATEDIFF(NOW(), c.date_add) AS days_registered,
    COUNT(DISTINCT o.id_order) AS total_orders,
    COALESCE(SUM(o.total_paid_real), 0) AS lifetime_value,
    COALESCE(AVG(o.total_paid_real), 0) AS avg_order_value,
    MAX(o.date_add) AS last_order_date,
    DATEDIFF(NOW(), MAX(o.date_add)) AS days_since_last_order,
    CASE 
        WHEN COUNT(o.id_order) = 0 THEN 'Never Purchased'
        WHEN DATEDIFF(NOW(), MAX(o.date_add)) <= 30 THEN 'Active'
        WHEN DATEDIFF(NOW(), MAX(o.date_add)) <= 90 THEN 'At Risk'
        ELSE 'Churned'
    END AS customer_status,
    CASE 
        WHEN COALESCE(SUM(o.total_paid_real), 0) >= 1000 THEN 'VIP'
        WHEN COALESCE(SUM(o.total_paid_real), 0) >= 500 THEN 'Premium'
        WHEN COALESCE(SUM(o.total_paid_real), 0) >= 100 THEN 'Regular'
        ELSE 'Basic'
    END AS customer_tier
FROM ps_customer c
LEFT JOIN ps_orders o ON c.id_customer = o.id_customer AND o.valid = 1
WHERE c.active = 1
GROUP BY c.id_customer;</code></pre>

        <h2 class="section-title">3. Vistas Materializadas</h2>

        <h3>3.1. ¿Qué es una Vista Materializada?</h3>
        <p>Una vista materializada almacena físicamente los datos resultantes de la query. A diferencia de las vistas virtuales, los datos se guardan en disco y deben actualizarse manualmente.</p>

        <div class="alert alert-warning">
            <strong>⚠️ Nota MySQL:</strong> MySQL no soporta vistas materializadas nativamente. Deben implementarse usando tablas normales con triggers o procesos de actualización programados.
        </div>

        <h3>3.2. Implementar Vista Materializada en MySQL</h3>

        <pre><code class="language-sql">-- Paso 1: Crear tabla física para almacenar datos
CREATE TABLE mv_sales_summary (
    month DATE NOT NULL,
    total_orders INT DEFAULT 0,
    total_revenue DECIMAL(20,6) DEFAULT 0,
    avg_order_value DECIMAL(20,6) DEFAULT 0,
    unique_customers INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (month),
    INDEX idx_month (month)
) ENGINE=InnoDB;

-- Paso 2: Poblar con datos iniciales
INSERT INTO mv_sales_summary (month, total_orders, total_revenue, avg_order_value, unique_customers)
SELECT 
    DATE_FORMAT(o.date_add, '%Y-%m-01') AS month,
    COUNT(DISTINCT o.id_order) AS total_orders,
    SUM(o.total_paid_real) AS total_revenue,
    AVG(o.total_paid_real) AS avg_order_value,
    COUNT(DISTINCT o.id_customer) AS unique_customers
FROM ps_orders o
WHERE o.valid = 1
GROUP BY month;

-- Paso 3: Crear procedimiento de actualización
DELIMITER $$

CREATE PROCEDURE sp_refresh_sales_summary()
BEGIN
    TRUNCATE TABLE mv_sales_summary;
    
    INSERT INTO mv_sales_summary (month, total_orders, total_revenue, avg_order_value, unique_customers)
    SELECT 
        DATE_FORMAT(o.date_add, '%Y-%m-01') AS month,
        COUNT(DISTINCT o.id_order) AS total_orders,
        SUM(o.total_paid_real) AS total_revenue,
        AVG(o.total_paid_real) AS avg_order_value,
        COUNT(DISTINCT o.id_customer) AS unique_customers
    FROM ps_orders o
    WHERE o.valid = 1
    GROUP BY month;
END$$

DELIMITER ;

-- Ejecutar actualización
CALL sp_refresh_sales_summary();</code></pre>

        <h3>3.3. Actualización Incremental</h3>

        <pre><code class="language-sql">-- Vista materializada con actualización incremental (más eficiente)
CREATE TABLE mv_product_statistics (
    id_product INT UNSIGNED NOT NULL,
    total_sold INT DEFAULT 0,
    total_revenue DECIMAL(20,6) DEFAULT 0,
    num_orders INT DEFAULT 0,
    avg_price DECIMAL(20,6) DEFAULT 0,
    last_sale_date DATETIME,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id_product),
    INDEX idx_total_sold (total_sold),
    INDEX idx_revenue (total_revenue)
) ENGINE=InnoDB;

-- Procedimiento de actualización incremental
DELIMITER $$

CREATE PROCEDURE sp_refresh_product_statistics_incremental(
    IN last_update_time DATETIME
)
BEGIN
    -- Solo actualizar productos con ventas desde last_update_time
    INSERT INTO mv_product_statistics (
        id_product, 
        total_sold, 
        total_revenue, 
        num_orders, 
        avg_price, 
        last_sale_date
    )
    SELECT 
        od.product_id,
        SUM(od.product_quantity) AS total_sold,
        SUM(od.product_quantity * od.unit_price_tax_incl) AS total_revenue,
        COUNT(DISTINCT od.id_order) AS num_orders,
        AVG(od.unit_price_tax_incl) AS avg_price,
        MAX(o.date_add) AS last_sale_date
    FROM ps_order_detail od
    INNER JOIN ps_orders o ON od.id_order = o.id_order
    WHERE o.valid = 1 
        AND o.date_add >= last_update_time
    GROUP BY od.product_id
    ON DUPLICATE KEY UPDATE
        total_sold = VALUES(total_sold),
        total_revenue = VALUES(total_revenue),
        num_orders = VALUES(num_orders),
        avg_price = VALUES(avg_price),
        last_sale_date = VALUES(last_sale_date);
END$$

DELIMITER ;</code></pre>

        <h3>3.4. Actualización Automática con Triggers</h3>

        <pre><code class="language-sql">-- Trigger para actualizar vista materializada automáticamente
DELIMITER $$

CREATE TRIGGER trg_update_product_stats_after_order
AFTER INSERT ON ps_order_detail
FOR EACH ROW
BEGIN
    -- Actualizar estadísticas del producto
    INSERT INTO mv_product_statistics (
        id_product,
        total_sold,
        total_revenue,
        num_orders
    )
    VALUES (
        NEW.product_id,
        NEW.product_quantity,
        NEW.product_quantity * NEW.unit_price_tax_incl,
        1
    )
    ON DUPLICATE KEY UPDATE
        total_sold = total_sold + NEW.product_quantity,
        total_revenue = total_revenue + (NEW.product_quantity * NEW.unit_price_tax_incl),
        num_orders = num_orders + 1,
        last_updated = NOW();
END$$

DELIMITER ;</code></pre>

        <h2 class="section-title">4. Implementación en PHP 8.1+ con PrestaShop</h2>

        <h3>4.1. Servicio de Actualización de Vistas Materializadas</h3>

        <pre><code class="language-php"><?php
// modules/mymodule/src/Service/MaterializedViewService.php
declare(strict_types=1);

namespace MyModule\\Service;

use Db;
use Exception;

class MaterializedViewService
{
    /**
     * Refrescar vista materializada de estadísticas de ventas
     */
    public function refreshSalesSummary(): bool
    {
        $db = Db::getInstance();
        
        try {
            // Llamar al procedimiento almacenado
            $sql = 'CALL sp_refresh_sales_summary()';
            
            return $db->execute($sql);
            
        } catch (Exception $e) {
            // Log error
            error_log('Error refreshing sales summary: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Actualización incremental desde última vez
     */
    public function refreshProductStatisticsIncremental(): bool
    {
        $db = Db::getInstance();
        
        try {
            // Obtener última actualización
            $lastUpdate = $db->getValue(
                'SELECT MAX(last_updated) FROM mv_product_statistics'
            );
            
            if (!$lastUpdate) {
                $lastUpdate = '2000-01-01 00:00:00';
            }
            
            // Actualizar incrementalmente
            $sql = 'CALL sp_refresh_product_statistics_incremental("' . 
                   pSQL($lastUpdate) . '")';
            
            return $db->execute($sql);
            
        } catch (Exception $e) {
            error_log('Error refreshing product statistics: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Verificar si una vista materializada está desactualizada
     */
    public function isMaterializedViewStale(
        string $viewTable, 
        int $maxAgeMinutes = 60
    ): bool {
        $db = Db::getInstance();
        
        $sql = 'SELECT 
            TIMESTAMPDIFF(MINUTE, MAX(last_updated), NOW()) AS age_minutes
            FROM ' . pSQL($viewTable);
        
        $age = (int) $db->getValue($sql);
        
        return $age > $maxAgeMinutes;
    }
}
</code></pre>

        <h3>4.2. Repositorio usando Vistas</h3>

        <pre><code class="language-php"><?php
// modules/mymodule/src/Repository/DashboardRepository.php
declare(strict_types=1);

namespace MyModule\\Repository;

use Db;

class DashboardRepository
{
    /**
     * Obtener resumen de ventas desde vista materializada
     */
    public function getSalesSummary(int $months = 12): array
    {
        $sql = '
            SELECT 
                month,
                total_orders,
                total_revenue,
                avg_order_value,
                unique_customers,
                last_updated
            FROM mv_sales_summary
            WHERE month >= DATE_SUB(NOW(), INTERVAL ' . (int) $months . ' MONTH)
            ORDER BY month DESC
        ';

        return Db::getInstance()->executeS($sql) ?: [];
    }

    /**
     * Obtener estadísticas de productos desde vista materializada
     */
    public function getProductStatistics(int $limit = 100): array
    {
        $sql = '
            SELECT 
                ps.id_product,
                pl.name AS product_name,
                ps.total_sold,
                ROUND(ps.total_revenue, 2) AS total_revenue,
                ps.num_orders,
                ROUND(ps.avg_price, 2) AS avg_price,
                ps.last_sale_date
            FROM mv_product_statistics ps
            INNER JOIN ' . _DB_PREFIX_ . 'product_lang pl 
                ON ps.id_product = pl.id_product AND pl.id_lang = 1
            ORDER BY ps.total_revenue DESC
            LIMIT ' . (int) $limit . '
        ';

        return Db::getInstance()->executeS($sql) ?: [];
    }

    /**
     * Obtener perfil de clientes desde vista virtual
     */
    public function getCustomerProfiles(string $status = null): array
    {
        $sql = 'SELECT * FROM vw_customer_profile';
        
        if ($status) {
            $sql .= ' WHERE customer_status = "' . pSQL($status) . '"';
        }
        
        $sql .= ' ORDER BY lifetime_value DESC LIMIT 100';

        return Db::getInstance()->executeS($sql) ?: [];
    }
}
</code></pre>

        <h3>4.3. Tarea CRON para Actualizar Vistas</h3>

        <pre><code class="language-php"><?php
// modules/mymodule/cron/RefreshMaterializedViews.php
declare(strict_types=1);

namespace MyModule\\Cron;

use MyModule\\Service\\MaterializedViewService;

class RefreshMaterializedViews
{
    private MaterializedViewService $mvService;

    public function __construct(MaterializedViewService $mvService)
    {
        $this->mvService = $mvService;
    }

    /**
     * Ejecutar actualización de vistas materializadas
     * Ejecutar cada hora vía cron: 0 * * * *
     */
    public function execute(): void
    {
        echo "Starting materialized views refresh...\\n";
        
        // Actualizar resumen de ventas (completo)
        if ($this->mvService->refreshSalesSummary()) {
            echo "✓ Sales summary refreshed\\n";
        } else {
            echo "✗ Failed to refresh sales summary\\n";
        }
        
        // Actualizar estadísticas de productos (incremental)
        if ($this->mvService->refreshProductStatisticsIncremental()) {
            echo "✓ Product statistics refreshed\\n";
        } else {
            echo "✗ Failed to refresh product statistics\\n";
        }
        
        echo "Materialized views refresh completed\\n";
    }
}
</code></pre>

        <h2 class="section-title">5. Comparativa: Vistas Virtuales vs Materializadas</h2>

        <table class="table table-striped">
            <thead class="table-dark">
                <tr>
                    <th>Característica</th>
                    <th>Vista Virtual</th>
                    <th>Vista Materializada</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Almacenamiento</strong></td>
                    <td>Solo definición</td>
                    <td>Datos físicos en disco</td>
                </tr>
                <tr>
                    <td><strong>Rendimiento Lectura</strong></td>
                    <td>⚡ Ejecuta query cada vez</td>
                    <td>⚡⚡⚡⚡⚡ Muy rápido</td>
                </tr>
                <tr>
                    <td><strong>Actualización</strong></td>
                    <td>Siempre actualizado</td>
                    <td>Requiere refresh manual</td>
                </tr>
                <tr>
                    <td><strong>Espacio en Disco</strong></td>
                    <td>Mínimo</td>
                    <td>Considerable</td>
                </tr>
                <tr>
                    <td><strong>Casos de Uso</strong></td>
                    <td>Queries simples, seguridad</td>
                    <td>Reportes pesados, dashboards</td>
                </tr>
                <tr>
                    <td><strong>Complejidad</strong></td>
                    <td>Baja</td>
                    <td>Alta (requiere mantenimiento)</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">6. Gestión y Mantenimiento de Vistas</h2>

        <h3>6.1. Modificar una Vista</h3>

        <pre><code class="language-sql">-- Opción 1: DROP y CREATE
DROP VIEW IF EXISTS vw_products_active;
CREATE VIEW vw_products_active AS
SELECT ... -- Nueva definición

-- Opción 2: CREATE OR REPLACE
CREATE OR REPLACE VIEW vw_products_active AS
SELECT ... -- Nueva definición

-- Opción 3: ALTER VIEW
ALTER VIEW vw_products_active AS
SELECT ... -- Nueva definición</code></pre>

        <h3>6.2. Eliminar una Vista</h3>

        <pre><code class="language-sql">DROP VIEW IF EXISTS vw_products_active;</code></pre>

        <h3>6.3. Ver Definición de una Vista</h3>

        <pre><code class="language-sql">-- Ver la definición de una vista
SHOW CREATE VIEW vw_products_active;

-- Listar todas las vistas
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.VIEWS 
WHERE TABLE_SCHEMA = 'prestashop';</code></pre>

        <h2 class="section-title">7. Mejores Prácticas</h2>

        <div class="row">
            <div class="col-md-6">
                <div class="card border-success mb-3">
                    <div class="card-header bg-success text-white">✅ Hacer</div>
                    <div class="card-body">
                        <ul>
                            <li>Usar vistas para simplificar queries complejas</li>
                            <li>Vistas virtuales para datos en tiempo real</li>
                            <li>Vistas materializadas para reportes pesados</li>
                            <li>Índices en columnas de vistas materializadas</li>
                            <li>Monitorear rendimiento con EXPLAIN</li>
                            <li>Documentar propósito y dependencias</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card border-danger mb-3">
                    <div class="card-header bg-danger text-white">❌ Evitar</div>
                    <div class="card-body">
                        <ul>
                            <li>Vistas que llamen a otras vistas (anidación)</li>
                            <li>Vistas con queries muy lentas</li>
                            <li>Actualizar vistas materializadas en cada request</li>
                            <li>Vistas materializadas sin estrategia de refresh</li>
                            <li>Dependencias circulares entre vistas</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <div class="alert alert-info">
            <strong>🎯 Cuándo usar cada tipo:</strong>
            <ul class="mb-0">
                <li><strong>Vista Virtual</strong>: Seguridad, abstracción, queries simples en tiempo real</li>
                <li><strong>Vista Materializada</strong>: Dashboards, reportes complejos, agregaciones pesadas</li>
                <li><strong>Tabla Normal</strong>: Datos transaccionales, alto volumen de escrituras</li>
            </ul>
        </div>

        <h2 class="section-title">8. Optimización de Rendimiento</h2>

        <h3>8.1. Índices en Vistas Materializadas</h3>

        <pre><code class="language-sql">-- Añadir índices a vistas materializadas para mejorar rendimiento
CREATE INDEX idx_mv_sales_month ON mv_sales_summary(month);
CREATE INDEX idx_mv_sales_revenue ON mv_sales_summary(total_revenue);

CREATE INDEX idx_mv_products_sold ON mv_product_statistics(total_sold);
CREATE INDEX idx_mv_products_revenue ON mv_product_statistics(total_revenue);</code></pre>

        <h3>8.2. Particionamiento de Vistas Materializadas</h3>

        <pre><code class="language-sql">-- Particionar vista materializada por fecha (MySQL 8.0+)
CREATE TABLE mv_sales_summary_partitioned (
    month DATE NOT NULL,
    total_orders INT DEFAULT 0,
    total_revenue DECIMAL(20,6) DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (month)
)
PARTITION BY RANGE (YEAR(month)) (
    PARTITION p2022 VALUES LESS THAN (2023),
    PARTITION p2023 VALUES LESS THAN (2024),
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);</code></pre>

        <div class="alert alert-success">
            <strong>✅ Beneficios del Particionamiento:</strong>
            <ul class="mb-0">
                <li>Mejora el rendimiento de queries con filtros por fecha</li>
                <li>Facilita la eliminación de datos antiguos</li>
                <li>Reduce el tiempo de actualización (refresh solo particiones necesarias)</li>
            </ul>
        </div>
    </div>
`;

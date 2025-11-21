// @ts-nocheck
const funcionesAgregadasHaving = `
    <div class="content-section">
        <h1 id="funciones-agregadas-having">Funciones Agregadas Avanzadas y Group By con HAVING</h1>
        <p>Las funciones agregadas y la cláusula HAVING son esenciales para análisis de datos en PrestaShop 8.9+ con PHP 8.1+. Permiten realizar cálculos estadísticos, reportes y análisis de negocio complejos sobre productos, ventas y clientes.</p>

        <h2 class="section-title">1. Funciones Agregadas Básicas</h2>

        <h3>1.1. Funciones Estándar</h3>

        <table class="table table-bordered">
            <thead class="table-dark">
                <tr>
                    <th width="20%">Función</th>
                    <th width="40%">Descripción</th>
                    <th width="40%">Ejemplo PrestaShop</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><code>COUNT()</code></td>
                    <td>Cuenta filas o valores no nulos</td>
                    <td>Total de productos activos</td>
                </tr>
                <tr>
                    <td><code>SUM()</code></td>
                    <td>Suma valores numéricos</td>
                    <td>Ingresos totales</td>
                </tr>
                <tr>
                    <td><code>AVG()</code></td>
                    <td>Calcula promedio</td>
                    <td>Precio promedio de productos</td>
                </tr>
                <tr>
                    <td><code>MIN()</code></td>
                    <td>Valor mínimo</td>
                    <td>Producto más barato</td>
                </tr>
                <tr>
                    <td><code>MAX()</code></td>
                    <td>Valor máximo</td>
                    <td>Pedido más alto</td>
                </tr>
                <tr>
                    <td><code>GROUP_CONCAT()</code></td>
                    <td>Concatena valores en un grupo</td>
                    <td>Lista de IDs de productos</td>
                </tr>
            </tbody>
        </table>

        <h3>1.2. Ejemplo Básico</h3>

        <pre><code class="language-sql">-- Estadísticas básicas de productos
SELECT 
    COUNT(*) AS total_products,
    COUNT(DISTINCT id_category_default) AS total_categories,
    SUM(quantity) AS total_stock,
    ROUND(AVG(price), 2) AS avg_price,
    MIN(price) AS min_price,
    MAX(price) AS max_price,
    ROUND(STDDEV(price), 2) AS price_std_dev
FROM ps_product
WHERE active = 1;</code></pre>

        <h2 class="section-title">2. GROUP BY Avanzado</h2>

        <h3>2.1. Agrupación Simple</h3>

        <pre><code class="language-sql">-- Productos por categoría
SELECT 
    c.id_category,
    cl.name AS category_name,
    COUNT(DISTINCT p.id_product) AS total_products,
    ROUND(AVG(p.price), 2) AS avg_price,
    ROUND(MIN(p.price), 2) AS min_price,
    ROUND(MAX(p.price), 2) AS max_price,
    SUM(p.quantity) AS total_stock
FROM ps_category c
INNER JOIN ps_category_lang cl 
    ON c.id_category = cl.id_category AND cl.id_lang = 1
INNER JOIN ps_category_product cp 
    ON c.id_category = cp.id_category
INNER JOIN ps_product p 
    ON cp.id_product = p.id_product
WHERE c.active = 1 AND p.active = 1
GROUP BY c.id_category, cl.name
ORDER BY total_products DESC;</code></pre>

        <h3>2.2. Agrupación Múltiple</h3>

        <pre><code class="language-sql">-- Ventas por año, mes y categoría
SELECT 
    YEAR(o.date_add) AS year,
    MONTH(o.date_add) AS month,
    c.id_category,
    cl.name AS category_name,
    COUNT(DISTINCT o.id_order) AS total_orders,
    SUM(od.product_quantity) AS total_units_sold,
    ROUND(SUM(od.product_quantity * od.unit_price_tax_incl), 2) AS revenue
FROM ps_orders o
INNER JOIN ps_order_detail od 
    ON o.id_order = od.id_order
INNER JOIN ps_category_product cp 
    ON od.product_id = cp.id_product
INNER JOIN ps_category c 
    ON cp.id_category = c.id_category
INNER JOIN ps_category_lang cl 
    ON c.id_category = cl.id_category AND cl.id_lang = 1
WHERE o.valid = 1
    AND o.date_add >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
GROUP BY year, month, c.id_category, cl.name
ORDER BY year DESC, month DESC, revenue DESC;</code></pre>

        <h2 class="section-title">3. HAVING - Filtrado de Grupos</h2>

        <h3>3.1. Diferencia entre WHERE y HAVING</h3>

        <div class="alert alert-info">
            <strong>📌 Conceptos Clave:</strong>
            <ul class="mb-0">
                <li><strong>WHERE</strong>: Filtra filas ANTES de agrupar</li>
                <li><strong>HAVING</strong>: Filtra grupos DESPUÉS de agrupar</li>
                <li><strong>WHERE</strong>: No puede usar funciones agregadas</li>
                <li><strong>HAVING</strong>: Puede usar funciones agregadas</li>
            </ul>
        </div>

        <pre><code class="language-sql">-- Categorías con más de 10 productos y precio promedio > 50€
SELECT 
    c.id_category,
    cl.name AS category_name,
    COUNT(DISTINCT p.id_product) AS total_products,
    ROUND(AVG(p.price), 2) AS avg_price
FROM ps_category c
INNER JOIN ps_category_lang cl 
    ON c.id_category = cl.id_category AND cl.id_lang = 1
INNER JOIN ps_category_product cp 
    ON c.id_category = cp.id_category
INNER JOIN ps_product p 
    ON cp.id_product = p.id_product
WHERE c.active = 1       -- Filtra ANTES de agrupar
    AND p.active = 1
GROUP BY c.id_category, cl.name
HAVING COUNT(DISTINCT p.id_product) > 10    -- Filtra DESPUÉS de agrupar
    AND AVG(p.price) > 50
ORDER BY total_products DESC;</code></pre>

        <h3>3.2. Clientes VIP con HAVING</h3>

        <pre><code class="language-sql">-- Clientes que han gastado más de 1000€ y hecho más de 5 pedidos
SELECT 
    c.id_customer,
    c.email,
    CONCAT(c.firstname, ' ', c.lastname) AS full_name,
    COUNT(DISTINCT o.id_order) AS total_orders,
    ROUND(SUM(o.total_paid_real), 2) AS total_spent,
    ROUND(AVG(o.total_paid_real), 2) AS avg_order_value,
    MIN(o.date_add) AS first_order,
    MAX(o.date_add) AS last_order
FROM ps_customer c
INNER JOIN ps_orders o 
    ON c.id_customer = o.id_customer
WHERE o.valid = 1
GROUP BY c.id_customer, c.email, c.firstname, c.lastname
HAVING COUNT(DISTINCT o.id_order) > 5
    AND SUM(o.total_paid_real) > 1000
ORDER BY total_spent DESC;</code></pre>

        <h2 class="section-title">4. Funciones Agregadas Avanzadas</h2>

        <h3>4.1. GROUP_CONCAT() - Concatenación</h3>

        <pre><code class="language-sql">-- Productos con sus categorías concatenadas
SELECT 
    p.id_product,
    pl.name AS product_name,
    p.price,
    -- Concatenar nombres de categorías
    GROUP_CONCAT(
        DISTINCT cl.name 
        ORDER BY cl.name 
        SEPARATOR ', '
    ) AS categories
FROM ps_product p
INNER JOIN ps_product_lang pl 
    ON p.id_product = pl.id_product AND pl.id_lang = 1
INNER JOIN ps_category_product cp 
    ON p.id_product = cp.id_product
INNER JOIN ps_category_lang cl 
    ON cp.id_category = cl.id_category AND cl.id_lang = 1
WHERE p.active = 1
GROUP BY p.id_product, pl.name, p.price
LIMIT 50;

-- Pedidos con lista de productos
SELECT 
    o.id_order,
    o.reference,
    o.total_paid_real,
    COUNT(DISTINCT od.product_id) AS num_products,
    GROUP_CONCAT(
        DISTINCT pl.name 
        ORDER BY pl.name 
        SEPARATOR ' | '
    ) AS product_list
FROM ps_orders o
INNER JOIN ps_order_detail od 
    ON o.id_order = od.id_order
INNER JOIN ps_product_lang pl 
    ON od.product_id = pl.id_product AND pl.id_lang = 1
WHERE o.valid = 1
GROUP BY o.id_order, o.reference, o.total_paid_real
LIMIT 20;</code></pre>

        <h3>4.2. STDDEV() y VARIANCE() - Estadísticas</h3>

        <pre><code class="language-sql">-- Análisis estadístico de precios por categoría
SELECT 
    c.id_category,
    cl.name AS category_name,
    COUNT(p.id_product) AS total_products,
    ROUND(AVG(p.price), 2) AS avg_price,
    ROUND(MIN(p.price), 2) AS min_price,
    ROUND(MAX(p.price), 2) AS max_price,
    -- Desviación estándar
    ROUND(STDDEV(p.price), 2) AS price_std_dev,
    -- Varianza
    ROUND(VARIANCE(p.price), 2) AS price_variance,
    -- Rango
    ROUND(MAX(p.price) - MIN(p.price), 2) AS price_range,
    -- Coeficiente de variación (%)
    ROUND((STDDEV(p.price) / AVG(p.price)) * 100, 2) AS coefficient_variation
FROM ps_category c
INNER JOIN ps_category_lang cl 
    ON c.id_category = cl.id_category AND cl.id_lang = 1
INNER JOIN ps_category_product cp 
    ON c.id_category = cp.id_category
INNER JOIN ps_product p 
    ON cp.id_product = p.id_product
WHERE c.active = 1 AND p.active = 1
GROUP BY c.id_category, cl.name
HAVING COUNT(p.id_product) >= 5
ORDER BY avg_price DESC;</code></pre>

        <h3>4.3. BIT_AND(), BIT_OR(), BIT_XOR() - Operaciones Bitwise</h3>

        <pre><code class="language-sql">-- Análisis de características de productos usando bits
-- Suponiendo que active, available_for_order, etc. son flags
SELECT 
    c.id_category,
    cl.name AS category_name,
    COUNT(*) AS total_products,
    -- Todos los productos están activos?
    BIT_AND(p.active) AS all_active,
    -- Algún producto está activo?
    BIT_OR(p.active) AS any_active,
    -- Productos disponibles para pedido
    SUM(p.available_for_order) AS available_count
FROM ps_category c
INNER JOIN ps_category_lang cl 
    ON c.id_category = cl.id_category AND cl.id_lang = 1
INNER JOIN ps_category_product cp 
    ON c.id_category = cp.id_category
INNER JOIN ps_product p 
    ON cp.id_product = p.id_product
GROUP BY c.id_category, cl.name;</code></pre>

        <h2 class="section-title">5. Agregaciones Condicionales</h2>

        <h3>5.1. COUNT con Condiciones</h3>

        <pre><code class="language-sql">-- Análisis de productos por rango de precio
SELECT 
    c.id_category,
    cl.name AS category_name,
    COUNT(*) AS total_products,
    -- Contar por rangos de precio
    SUM(CASE WHEN p.price < 20 THEN 1 ELSE 0 END) AS low_price_count,
    SUM(CASE WHEN p.price BETWEEN 20 AND 50 THEN 1 ELSE 0 END) AS mid_price_count,
    SUM(CASE WHEN p.price > 50 THEN 1 ELSE 0 END) AS high_price_count,
    -- Porcentajes
    ROUND(SUM(CASE WHEN p.price < 20 THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) AS low_price_pct,
    -- Stock por rango
    SUM(CASE WHEN p.price < 20 THEN p.quantity ELSE 0 END) AS low_price_stock,
    SUM(CASE WHEN p.price BETWEEN 20 AND 50 THEN p.quantity ELSE 0 END) AS mid_price_stock,
    SUM(CASE WHEN p.price > 50 THEN p.quantity ELSE 0 END) AS high_price_stock
FROM ps_category c
INNER JOIN ps_category_lang cl 
    ON c.id_category = cl.id_category AND cl.id_lang = 1
INNER JOIN ps_category_product cp 
    ON c.id_category = cp.id_category
INNER JOIN ps_product p 
    ON cp.id_product = p.id_product
WHERE c.active = 1 AND p.active = 1
GROUP BY c.id_category, cl.name
ORDER BY total_products DESC;</code></pre>

        <h3>5.2. Análisis de Pedidos por Estado</h3>

        <pre><code class="language-sql">-- Pedidos por estado y mes
SELECT 
    DATE_FORMAT(o.date_add, '%Y-%m') AS month,
    COUNT(DISTINCT o.id_order) AS total_orders,
    ROUND(SUM(o.total_paid_real), 2) AS total_revenue,
    -- Por estado
    SUM(CASE WHEN o.current_state = 2 THEN 1 ELSE 0 END) AS paid_orders,
    SUM(CASE WHEN o.current_state = 6 THEN 1 ELSE 0 END) AS cancelled_orders,
    SUM(CASE WHEN o.current_state = 5 THEN 1 ELSE 0 END) AS delivered_orders,
    -- Ingresos por estado
    ROUND(SUM(CASE WHEN o.current_state = 2 THEN o.total_paid_real ELSE 0 END), 2) AS paid_revenue,
    -- Tasa de conversión
    ROUND((SUM(CASE WHEN o.current_state = 2 THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) AS conversion_rate
FROM ps_orders o
WHERE o.date_add >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
GROUP BY month
ORDER BY month DESC;</code></pre>

        <h2 class="section-title">6. GROUP BY con ROLLUP</h2>

        <h3>6.1. Totales y Subtotales</h3>

        <pre><code class="language-sql">-- Ventas con subtotales por categoría y total general
SELECT 
    COALESCE(cl.name, 'TOTAL GENERAL') AS category_name,
    COUNT(DISTINCT o.id_order) AS total_orders,
    SUM(od.product_quantity) AS total_units,
    ROUND(SUM(od.product_quantity * od.unit_price_tax_incl), 2) AS revenue
FROM ps_orders o
INNER JOIN ps_order_detail od 
    ON o.id_order = od.id_order
INNER JOIN ps_category_product cp 
    ON od.product_id = cp.id_product
LEFT JOIN ps_category_lang cl 
    ON cp.id_category = cl.id_category AND cl.id_lang = 1
WHERE o.valid = 1
    AND o.date_add >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
GROUP BY cl.name WITH ROLLUP
ORDER BY revenue DESC;</code></pre>

        <h2 class="section-title">7. Implementación en PHP 8.1+ con PrestaShop</h2>

        <pre><code class="language-php"><?php
// modules/mymodule/src/Repository/ReportRepository.php
declare(strict_types=1);

namespace MyModule\\Repository;

use Db;

class ReportRepository
{
    /**
     * Obtener estadísticas de productos por categoría
     */
    public function getCategoryStatistics(int $idLang = 1): array
    {
        $sql = '
            SELECT 
                c.id_category,
                cl.name AS category_name,
                COUNT(DISTINCT p.id_product) AS total_products,
                ROUND(AVG(p.price), 2) AS avg_price,
                ROUND(MIN(p.price), 2) AS min_price,
                ROUND(MAX(p.price), 2) AS max_price,
                SUM(p.quantity) AS total_stock,
                ROUND(STDDEV(p.price), 2) AS price_std_dev
            FROM ' . _DB_PREFIX_ . 'category c
            INNER JOIN ' . _DB_PREFIX_ . 'category_lang cl 
                ON c.id_category = cl.id_category AND cl.id_lang = ' . (int) $idLang . '
            INNER JOIN ' . _DB_PREFIX_ . 'category_product cp 
                ON c.id_category = cp.id_category
            INNER JOIN ' . _DB_PREFIX_ . 'product p 
                ON cp.id_product = p.id_product
            WHERE c.active = 1 AND p.active = 1
            GROUP BY c.id_category, cl.name
            HAVING COUNT(DISTINCT p.id_product) >= 3
            ORDER BY total_products DESC
        ';

        return Db::getInstance()->executeS($sql) ?: [];
    }

    /**
     * Obtener clientes VIP
     */
    public function getVIPCustomers(float $minSpent = 1000.0, int $minOrders = 5): array
    {
        $sql = '
            SELECT 
                c.id_customer,
                c.email,
                CONCAT(c.firstname, " ", c.lastname) AS full_name,
                COUNT(DISTINCT o.id_order) AS total_orders,
                ROUND(SUM(o.total_paid_real), 2) AS total_spent,
                ROUND(AVG(o.total_paid_real), 2) AS avg_order_value,
                MIN(o.date_add) AS first_order,
                MAX(o.date_add) AS last_order
            FROM ' . _DB_PREFIX_ . 'customer c
            INNER JOIN ' . _DB_PREFIX_ . 'orders o 
                ON c.id_customer = o.id_customer
            WHERE o.valid = 1
            GROUP BY c.id_customer, c.email, c.firstname, c.lastname
            HAVING COUNT(DISTINCT o.id_order) >= ' . (int) $minOrders . '
                AND SUM(o.total_paid_real) >= ' . (float) $minSpent . '
            ORDER BY total_spent DESC
        ';

        return Db::getInstance()->executeS($sql) ?: [];
    }

    /**
     * Análisis de pedidos por estado
     */
    public function getOrderStatusAnalysis(int $months = 12): array
    {
        $sql = '
            SELECT 
                DATE_FORMAT(o.date_add, "%Y-%m") AS month,
                COUNT(DISTINCT o.id_order) AS total_orders,
                ROUND(SUM(o.total_paid_real), 2) AS total_revenue,
                SUM(CASE WHEN o.current_state = 2 THEN 1 ELSE 0 END) AS paid_orders,
                SUM(CASE WHEN o.current_state = 6 THEN 1 ELSE 0 END) AS cancelled_orders,
                ROUND(SUM(CASE WHEN o.current_state = 2 THEN o.total_paid_real ELSE 0 END), 2) AS paid_revenue,
                ROUND((SUM(CASE WHEN o.current_state = 2 THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) AS conversion_rate
            FROM ' . _DB_PREFIX_ . 'orders o
            WHERE o.date_add >= DATE_SUB(NOW(), INTERVAL ' . (int) $months . ' MONTH)
            GROUP BY month
            ORDER BY month DESC
        ';

        return Db::getInstance()->executeS($sql) ?: [];
    }

    /**
     * Productos con múltiples categorías concatenadas
     */
    public function getProductsWithCategories(int $idLang = 1, int $limit = 100): array
    {
        $sql = '
            SELECT 
                p.id_product,
                pl.name AS product_name,
                p.price,
                GROUP_CONCAT(
                    DISTINCT cl.name 
                    ORDER BY cl.name 
                    SEPARATOR ", "
                ) AS categories,
                COUNT(DISTINCT cp.id_category) AS category_count
            FROM ' . _DB_PREFIX_ . 'product p
            INNER JOIN ' . _DB_PREFIX_ . 'product_lang pl 
                ON p.id_product = pl.id_product AND pl.id_lang = ' . (int) $idLang . '
            INNER JOIN ' . _DB_PREFIX_ . 'category_product cp 
                ON p.id_product = cp.id_product
            INNER JOIN ' . _DB_PREFIX_ . 'category_lang cl 
                ON cp.id_category = cl.id_category AND cl.id_lang = ' . (int) $idLang . '
            WHERE p.active = 1
            GROUP BY p.id_product, pl.name, p.price
            HAVING category_count > 1
            ORDER BY category_count DESC
            LIMIT ' . (int) $limit . '
        ';

        return Db::getInstance()->executeS($sql) ?: [];
    }
}
</code></pre>

        <h2 class="section-title">8. Optimización de Agregaciones</h2>

        <h3>8.1. Índices para GROUP BY</h3>

        <pre><code class="language-sql">-- Índices recomendados para mejorar rendimiento

-- Para agrupaciones por categoría
CREATE INDEX idx_category_product ON ps_category_product(id_category, id_product);

-- Para análisis de pedidos por cliente
CREATE INDEX idx_customer_orders ON ps_orders(id_customer, valid, date_add);

-- Para ventas por producto
CREATE INDEX idx_product_sales ON ps_order_detail(product_id, id_order, product_quantity);

-- Para análisis temporal
CREATE INDEX idx_order_date_state ON ps_orders(date_add, current_state, valid);</code></pre>

        <h3>8.2. Tablas Resumen (Summary Tables)</h3>

        <pre><code class="language-sql">-- Para reportes frecuentes, considerar tablas resumen
CREATE TABLE ps_product_statistics_summary (
    id_product INT UNSIGNED NOT NULL,
    period DATE NOT NULL,
    total_orders INT DEFAULT 0,
    total_quantity INT DEFAULT 0,
    total_revenue DECIMAL(20,6) DEFAULT 0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id_product, period),
    INDEX idx_period (period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Actualizar resumen periódicamente (cron job)
INSERT INTO ps_product_statistics_summary (id_product, period, total_orders, total_quantity, total_revenue)
SELECT 
    product_id,
    DATE(o.date_add) AS period,
    COUNT(DISTINCT od.id_order),
    SUM(od.product_quantity),
    SUM(od.product_quantity * od.unit_price_tax_incl)
FROM ps_order_detail od
INNER JOIN ps_orders o ON od.id_order = o.id_order
WHERE o.valid = 1
GROUP BY product_id, period
ON DUPLICATE KEY UPDATE
    total_orders = VALUES(total_orders),
    total_quantity = VALUES(total_quantity),
    total_revenue = VALUES(total_revenue);</code></pre>

        <h2 class="section-title">9. Mejores Prácticas</h2>

        <div class="row">
            <div class="col-md-6">
                <div class="card border-success mb-3">
                    <div class="card-header bg-success text-white">✅ Hacer</div>
                    <div class="card-body">
                        <ul>
                            <li>Añadir índices en columnas de GROUP BY</li>
                            <li>Usar HAVING solo para filtrar agregaciones</li>
                            <li>Limitar resultados con LIMIT</li>
                            <li>Usar DISTINCT solo cuando sea necesario</li>
                            <li>Considerar tablas resumen para reportes frecuentes</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card border-danger mb-3">
                    <div class="card-header bg-danger text-white">❌ Evitar</div>
                    <div class="card-body">
                        <ul>
                            <li>GROUP BY sin índices en tablas grandes</li>
                            <li>Agregar columnas no agregadas sin incluir en GROUP BY</li>
                            <li>Usar WHERE en lugar de HAVING para filtrar grupos</li>
                            <li>GROUP_CONCAT sin límite en datos grandes</li>
                            <li>Múltiples DISTINCT innecesarios</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ MySQL 8.0+ ONLY_FULL_GROUP_BY:</strong> Desde MySQL 5.7.5, el modo ONLY_FULL_GROUP_BY está activo por defecto. Todas las columnas en SELECT deben estar en GROUP BY o usar función agregada.
            <pre class="mb-0"><code class="language-sql">-- ❌ Error con ONLY_FULL_GROUP_BY
SELECT id_customer, email, SUM(total) FROM orders GROUP BY id_customer;

-- ✅ Correcto
SELECT id_customer, ANY_VALUE(email), SUM(total) FROM orders GROUP BY id_customer;</code></pre>
        </div>

        <h2 class="section-title">10. Casos de Uso Prácticos</h2>

        <table class="table table-striped">
            <thead class="table-dark">
                <tr>
                    <th>Caso de Uso</th>
                    <th>Funciones Clave</th>
                    <th>Consideraciones</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Dashboard de Ventas</strong></td>
                    <td>SUM, COUNT, AVG con GROUP BY fecha</td>
                    <td>Usar índice en date_add</td>
                </tr>
                <tr>
                    <td><strong>Análisis de Productos</strong></td>
                    <td>COUNT, AVG, STDDEV por categoría</td>
                    <td>HAVING para filtrar categorías pequeñas</td>
                </tr>
                <tr>
                    <td><strong>Segmentación de Clientes</strong></td>
                    <td>SUM, COUNT con HAVING</td>
                    <td>Combinar con CASE para segmentos</td>
                </tr>
                <tr>
                    <td><strong>Reportes de Inventario</strong></td>
                    <td>SUM(quantity), GROUP_CONCAT</td>
                    <td>Limitar GROUP_CONCAT_MAX_LEN</td>
                </tr>
            </tbody>
        </table>
    </div>
`;

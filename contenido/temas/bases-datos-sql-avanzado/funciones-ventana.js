// @ts-nocheck
const funcionesVentana = `
    <div class="content-section">
        <h1 id="funciones-ventana">Funciones de Ventana (Window Functions)</h1>
        <p>Las Window Functions (funciones de ventana) son una característica avanzada de SQL que permite realizar cálculos sobre un conjunto de filas relacionadas sin agruparlas. En PrestaShop 8.9+ con PHP 8.1+ y MySQL 8.0+, estas funciones son fundamentales para análisis de datos complejos, rankings y cálculos acumulativos.</p>

        <h2 class="section-title">1. Fundamentos de Window Functions</h2>

        <h3>1.1. ¿Qué son las Window Functions?</h3>
        <p>A diferencia de GROUP BY que colapsa filas, las Window Functions mantienen todas las filas y añaden columnas calculadas basadas en "ventanas" de datos relacionados.</p>

        <div class="alert alert-info">
            <strong>💡 Ventajas de Window Functions:</strong>
            <ul class="mb-0">
                <li>Mantiene todas las filas originales</li>
                <li>Permite rankings y percentiles</li>
                <li>Cálculos acumulativos (running totals)</li>
                <li>Comparaciones con filas anteriores/siguientes</li>
                <li>Más eficiente que self-joins</li>
            </ul>
        </div>

        <h3>1.2. Sintaxis General</h3>

        <pre><code class="language-sql">-- Estructura básica
funcion_ventana() OVER (
    [PARTITION BY columna1, columna2]
    [ORDER BY columna3]
    [ROWS/RANGE BETWEEN ... AND ...]
)

-- Componentes:
-- PARTITION BY: divide los datos en grupos (como GROUP BY)
-- ORDER BY: ordena filas dentro de cada partición
-- ROWS/RANGE: define el marco de la ventana</code></pre>

        <h2 class="section-title">2. Funciones de Ranking</h2>

        <h3>2.1. ROW_NUMBER() - Numeración Secuencial</h3>

        <pre><code class="language-sql">-- Ranking de productos más vendidos por categoría
SELECT 
    c.id_category,
    cl.name AS category_name,
    p.id_product,
    pl.name AS product_name,
    sales.total_sold,
    -- ROW_NUMBER asigna un número único a cada fila
    ROW_NUMBER() OVER (
        PARTITION BY c.id_category
        ORDER BY sales.total_sold DESC
    ) AS ranking
FROM ps_category c
INNER JOIN ps_category_lang cl ON c.id_category = cl.id_category AND cl.id_lang = 1
INNER JOIN ps_category_product cp ON c.id_category = cp.id_category
INNER JOIN ps_product p ON cp.id_product = p.id_product
INNER JOIN ps_product_lang pl ON p.id_product = pl.id_product AND pl.id_lang = 1
INNER JOIN (
    SELECT product_id, SUM(product_quantity) AS total_sold
    FROM ps_order_detail
    GROUP BY product_id
) AS sales ON p.id_product = sales.product_id
WHERE c.active = 1 AND p.active = 1
HAVING ranking <= 5  -- Top 5 por categoría
ORDER BY c.id_category, ranking;</code></pre>

        <h3>2.2. RANK() vs DENSE_RANK()</h3>

        <pre><code class="language-sql">-- Diferencia entre RANK y DENSE_RANK
SELECT 
    p.id_product,
    pl.name,
    p.price,
    -- RANK: salta posiciones en caso de empate (1, 2, 2, 4)
    RANK() OVER (ORDER BY p.price DESC) AS rank_position,
    -- DENSE_RANK: no salta posiciones (1, 2, 2, 3)
    DENSE_RANK() OVER (ORDER BY p.price DESC) AS dense_rank_position,
    -- ROW_NUMBER: siempre único (1, 2, 3, 4)
    ROW_NUMBER() OVER (ORDER BY p.price DESC) AS row_number
FROM ps_product p
INNER JOIN ps_product_lang pl ON p.id_product = pl.id_product AND pl.id_lang = 1
WHERE p.active = 1
ORDER BY p.price DESC
LIMIT 20;

-- Ejemplo de resultado:
-- name          | price | rank | dense_rank | row_number
-- Producto A    | 100   | 1    | 1          | 1
-- Producto B    | 100   | 1    | 1          | 2
-- Producto C    | 90    | 3    | 2          | 3  <- RANK salta a 3
-- Producto D    | 80    | 4    | 3          | 4</code></pre>

        <h3>2.3. Productos Top por Categoría</h3>

        <pre><code class="language-sql">-- Top 3 productos más caros de cada categoría
WITH ranked_products AS (
    SELECT 
        c.id_category,
        cl.name AS category_name,
        p.id_product,
        pl.name AS product_name,
        p.price,
        DENSE_RANK() OVER (
            PARTITION BY c.id_category
            ORDER BY p.price DESC
        ) AS price_rank
    FROM ps_category c
    INNER JOIN ps_category_lang cl ON c.id_category = cl.id_category AND cl.id_lang = 1
    INNER JOIN ps_category_product cp ON c.id_category = cp.id_category
    INNER JOIN ps_product p ON cp.id_product = p.id_product
    INNER JOIN ps_product_lang pl ON p.id_product = pl.id_product AND pl.id_lang = 1
    WHERE c.active = 1 AND p.active = 1
)
SELECT *
FROM ranked_products
WHERE price_rank <= 3
ORDER BY id_category, price_rank;</code></pre>

        <h2 class="section-title">3. Funciones de Agregación como Window Functions</h2>

        <h3>3.1. SUM() - Totales Acumulativos</h3>

        <pre><code class="language-sql">-- Ingresos acumulativos por mes
SELECT 
    DATE_FORMAT(o.date_add, '%Y-%m') AS month,
    COUNT(o.id_order) AS orders_count,
    ROUND(SUM(o.total_paid_real), 2) AS monthly_revenue,
    -- Total acumulativo (running total)
    ROUND(SUM(SUM(o.total_paid_real)) OVER (
        ORDER BY DATE_FORMAT(o.date_add, '%Y-%m')
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ), 2) AS cumulative_revenue
FROM ps_orders o
WHERE o.valid = 1
    AND o.date_add >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
GROUP BY month
ORDER BY month;</code></pre>

        <h3>3.2. AVG() - Promedios Móviles</h3>

        <pre><code class="language-sql">-- Promedio móvil de ventas diarias (últimos 7 días)
WITH daily_sales AS (
    SELECT 
        DATE(o.date_add) AS sale_date,
        COUNT(o.id_order) AS orders_count,
        SUM(o.total_paid_real) AS daily_revenue
    FROM ps_orders o
    WHERE o.valid = 1
        AND o.date_add >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY DATE(o.date_add)
)
SELECT 
    sale_date,
    orders_count,
    ROUND(daily_revenue, 2) AS daily_revenue,
    -- Promedio móvil de 7 días
    ROUND(AVG(daily_revenue) OVER (
        ORDER BY sale_date
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ), 2) AS avg_7_days,
    -- Promedio móvil de 14 días
    ROUND(AVG(daily_revenue) OVER (
        ORDER BY sale_date
        ROWS BETWEEN 13 PRECEDING AND CURRENT ROW
    ), 2) AS avg_14_days
FROM daily_sales
ORDER BY sale_date DESC;</code></pre>

        <h3>3.3. COUNT() - Contadores Acumulativos</h3>

        <pre><code class="language-sql">-- Número de pedidos por cliente y total acumulado
SELECT 
    c.id_customer,
    CONCAT(c.firstname, ' ', c.lastname) AS customer_name,
    o.id_order,
    o.date_add,
    o.total_paid_real,
    -- Número de pedido del cliente (1º, 2º, 3º...)
    ROW_NUMBER() OVER (
        PARTITION BY c.id_customer
        ORDER BY o.date_add
    ) AS order_number,
    -- Total acumulado gastado por el cliente
    ROUND(SUM(o.total_paid_real) OVER (
        PARTITION BY c.id_customer
        ORDER BY o.date_add
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ), 2) AS cumulative_spent
FROM ps_customer c
INNER JOIN ps_orders o ON c.id_customer = o.id_customer
WHERE o.valid = 1
ORDER BY c.id_customer, o.date_add;</code></pre>

        <h2 class="section-title">4. Funciones LAG() y LEAD()</h2>

        <h3>4.1. LAG() - Valor de Fila Anterior</h3>

        <pre><code class="language-sql">-- Comparar precio actual con precio anterior
SELECT 
    p.id_product,
    pl.name,
    p.price AS current_price,
    -- Precio del producto anterior (ordenado por precio)
    LAG(p.price, 1) OVER (ORDER BY p.price) AS previous_price,
    -- Diferencia con el precio anterior
    ROUND(p.price - LAG(p.price, 1) OVER (ORDER BY p.price), 2) AS price_diff
FROM ps_product p
INNER JOIN ps_product_lang pl ON p.id_product = pl.id_product AND pl.id_lang = 1
WHERE p.active = 1
ORDER BY p.price;</code></pre>

        <h3>4.2. LEAD() - Valor de Fila Siguiente</h3>

        <pre><code class="language-sql">-- Análisis de evolución de ventas mensuales
WITH monthly_sales AS (
    SELECT 
        DATE_FORMAT(o.date_add, '%Y-%m') AS month,
        SUM(o.total_paid_real) AS revenue
    FROM ps_orders o
    WHERE o.valid = 1
    GROUP BY month
)
SELECT 
    month,
    ROUND(revenue, 2) AS current_revenue,
    -- Ingresos del mes anterior
    ROUND(LAG(revenue, 1) OVER (ORDER BY month), 2) AS previous_month,
    -- Ingresos del mes siguiente
    ROUND(LEAD(revenue, 1) OVER (ORDER BY month), 2) AS next_month,
    -- Crecimiento respecto al mes anterior
    ROUND(
        ((revenue - LAG(revenue, 1) OVER (ORDER BY month)) / 
         LAG(revenue, 1) OVER (ORDER BY month)) * 100,
        2
    ) AS growth_percentage
FROM monthly_sales
ORDER BY month DESC;</code></pre>

        <h3>4.3. Análisis de Comportamiento de Clientes</h3>

        <pre><code class="language-sql">-- Tiempo entre pedidos de cada cliente
SELECT 
    c.id_customer,
    c.email,
    o.id_order,
    o.date_add AS order_date,
    -- Fecha del pedido anterior
    LAG(o.date_add, 1) OVER (
        PARTITION BY c.id_customer
        ORDER BY o.date_add
    ) AS previous_order_date,
    -- Días entre pedidos
    DATEDIFF(
        o.date_add,
        LAG(o.date_add, 1) OVER (
            PARTITION BY c.id_customer
            ORDER BY o.date_add
        )
    ) AS days_since_last_order,
    o.total_paid_real,
    -- Gasto en el pedido anterior
    LAG(o.total_paid_real, 1) OVER (
        PARTITION BY c.id_customer
        ORDER BY o.date_add
    ) AS previous_order_amount
FROM ps_customer c
INNER JOIN ps_orders o ON c.id_customer = o.id_customer
WHERE o.valid = 1
ORDER BY c.id_customer, o.date_add;</code></pre>

        <h2 class="section-title">5. NTILE() - Distribución en Cuartiles</h2>

        <pre><code class="language-sql">-- Segmentar clientes en cuartiles según gasto total
WITH customer_spending AS (
    SELECT 
        c.id_customer,
        CONCAT(c.firstname, ' ', c.lastname) AS full_name,
        c.email,
        COUNT(o.id_order) AS total_orders,
        SUM(o.total_paid_real) AS total_spent
    FROM ps_customer c
    INNER JOIN ps_orders o ON c.id_customer = o.id_customer
    WHERE o.valid = 1
    GROUP BY c.id_customer
)
SELECT 
    id_customer,
    full_name,
    email,
    total_orders,
    ROUND(total_spent, 2) AS total_spent,
    -- Dividir en 4 cuartiles (Q1, Q2, Q3, Q4)
    NTILE(4) OVER (ORDER BY total_spent DESC) AS spending_quartile,
    -- Dividir en 10 deciles
    NTILE(10) OVER (ORDER BY total_spent DESC) AS spending_decile,
    CASE 
        WHEN NTILE(4) OVER (ORDER BY total_spent DESC) = 1 THEN 'VIP'
        WHEN NTILE(4) OVER (ORDER BY total_spent DESC) = 2 THEN 'Premium'
        WHEN NTILE(4) OVER (ORDER BY total_spent DESC) = 3 THEN 'Regular'
        ELSE 'Basic'
    END AS customer_segment
FROM customer_spending
ORDER BY total_spent DESC;</code></pre>

        <h2 class="section-title">6. FIRST_VALUE() y LAST_VALUE()</h2>

        <pre><code class="language-sql">-- Comparar cada producto con el más caro y más barato de su categoría
SELECT 
    c.id_category,
    cl.name AS category_name,
    p.id_product,
    pl.name AS product_name,
    p.price,
    -- Producto más caro de la categoría
    FIRST_VALUE(pl.name) OVER (
        PARTITION BY c.id_category
        ORDER BY p.price DESC
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS most_expensive_product,
    FIRST_VALUE(p.price) OVER (
        PARTITION BY c.id_category
        ORDER BY p.price DESC
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS highest_price,
    -- Producto más barato de la categoría
    LAST_VALUE(pl.name) OVER (
        PARTITION BY c.id_category
        ORDER BY p.price DESC
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS cheapest_product,
    LAST_VALUE(p.price) OVER (
        PARTITION BY c.id_category
        ORDER BY p.price DESC
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS lowest_price
FROM ps_category c
INNER JOIN ps_category_lang cl ON c.id_category = cl.id_category AND cl.id_lang = 1
INNER JOIN ps_category_product cp ON c.id_category = cp.id_category
INNER JOIN ps_product p ON cp.id_product = p.id_product
INNER JOIN ps_product_lang pl ON p.id_product = pl.id_product AND pl.id_lang = 1
WHERE c.active = 1 AND p.active = 1
ORDER BY c.id_category, p.price DESC;</code></pre>

        <h2 class="section-title">7. Implementación en PHP 8.1+ con PrestaShop</h2>

        <pre><code class="language-php"><?php
// modules/mymodule/src/Repository/AnalyticsRepository.php
declare(strict_types=1);

namespace MyModule\\Repository;

use Db;

class AnalyticsRepository
{
    /**
     * Obtener top productos por categoría usando window functions
     */
    public function getTopProductsByCategory(int $idLang = 1, int $limit = 5): array
    {
        $sql = '
            WITH ranked_products AS (
                SELECT 
                    c.id_category,
                    cl.name AS category_name,
                    p.id_product,
                    pl.name AS product_name,
                    sales.total_sold,
                    ROUND(sales.revenue, 2) AS revenue,
                    ROW_NUMBER() OVER (
                        PARTITION BY c.id_category
                        ORDER BY sales.total_sold DESC
                    ) AS ranking
                FROM ' . _DB_PREFIX_ . 'category c
                INNER JOIN ' . _DB_PREFIX_ . 'category_lang cl 
                    ON c.id_category = cl.id_category AND cl.id_lang = ' . (int) $idLang . '
                INNER JOIN ' . _DB_PREFIX_ . 'category_product cp 
                    ON c.id_category = cp.id_category
                INNER JOIN ' . _DB_PREFIX_ . 'product p 
                    ON cp.id_product = p.id_product
                INNER JOIN ' . _DB_PREFIX_ . 'product_lang pl 
                    ON p.id_product = pl.id_product AND pl.id_lang = ' . (int) $idLang . '
                INNER JOIN (
                    SELECT 
                        product_id,
                        SUM(product_quantity) AS total_sold,
                        SUM(product_quantity * unit_price_tax_incl) AS revenue
                    FROM ' . _DB_PREFIX_ . 'order_detail
                    GROUP BY product_id
                ) AS sales ON p.id_product = sales.product_id
                WHERE c.active = 1 AND p.active = 1
            )
            SELECT *
            FROM ranked_products
            WHERE ranking <= ' . (int) $limit . '
            ORDER BY id_category, ranking
        ';

        return Db::getInstance()->executeS($sql) ?: [];
    }

    /**
     * Obtener ingresos acumulativos por mes
     */
    public function getCumulativeRevenue(int $months = 12): array
    {
        $sql = '
            SELECT 
                DATE_FORMAT(o.date_add, "%Y-%m") AS month,
                COUNT(o.id_order) AS orders_count,
                ROUND(SUM(o.total_paid_real), 2) AS monthly_revenue,
                ROUND(SUM(SUM(o.total_paid_real)) OVER (
                    ORDER BY DATE_FORMAT(o.date_add, "%Y-%m")
                    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
                ), 2) AS cumulative_revenue
            FROM ' . _DB_PREFIX_ . 'orders o
            WHERE o.valid = 1
                AND o.date_add >= DATE_SUB(NOW(), INTERVAL ' . (int) $months . ' MONTH)
            GROUP BY month
            ORDER BY month
        ';

        return Db::getInstance()->executeS($sql) ?: [];
    }

    /**
     * Segmentar clientes por gasto usando NTILE
     */
    public function getCustomerSegmentation(): array
    {
        $sql = '
            WITH customer_spending AS (
                SELECT 
                    c.id_customer,
                    CONCAT(c.firstname, " ", c.lastname) AS full_name,
                    c.email,
                    COUNT(o.id_order) AS total_orders,
                    SUM(o.total_paid_real) AS total_spent
                FROM ' . _DB_PREFIX_ . 'customer c
                INNER JOIN ' . _DB_PREFIX_ . 'orders o 
                    ON c.id_customer = o.id_customer
                WHERE o.valid = 1
                GROUP BY c.id_customer
            )
            SELECT 
                id_customer,
                full_name,
                email,
                total_orders,
                ROUND(total_spent, 2) AS total_spent,
                NTILE(4) OVER (ORDER BY total_spent DESC) AS quartile,
                CASE 
                    WHEN NTILE(4) OVER (ORDER BY total_spent DESC) = 1 THEN "VIP"
                    WHEN NTILE(4) OVER (ORDER BY total_spent DESC) = 2 THEN "Premium"
                    WHEN NTILE(4) OVER (ORDER BY total_spent DESC) = 3 THEN "Regular"
                    ELSE "Basic"
                END AS segment
            FROM customer_spending
            ORDER BY total_spent DESC
        ';

        return Db::getInstance()->executeS($sql) ?: [];
    }

    /**
     * Análisis de crecimiento mensual con LAG
     */
    public function getMonthlyGrowth(int $months = 12): array
    {
        $sql = '
            WITH monthly_sales AS (
                SELECT 
                    DATE_FORMAT(o.date_add, "%Y-%m") AS month,
                    SUM(o.total_paid_real) AS revenue
                FROM ' . _DB_PREFIX_ . 'orders o
                WHERE o.valid = 1
                    AND o.date_add >= DATE_SUB(NOW(), INTERVAL ' . (int) $months . ' MONTH)
                GROUP BY month
            )
            SELECT 
                month,
                ROUND(revenue, 2) AS current_revenue,
                ROUND(LAG(revenue, 1) OVER (ORDER BY month), 2) AS previous_month,
                ROUND(
                    ((revenue - LAG(revenue, 1) OVER (ORDER BY month)) / 
                     NULLIF(LAG(revenue, 1) OVER (ORDER BY month), 0)) * 100,
                    2
                ) AS growth_percentage
            FROM monthly_sales
            ORDER BY month DESC
        ';

        return Db::getInstance()->executeS($sql) ?: [];
    }
}
</code></pre>

        <h2 class="section-title">8. Marcos de Ventana (Window Frames)</h2>

        <h3>8.1. ROWS vs RANGE</h3>

        <table class="table table-bordered">
            <thead class="table-dark">
                <tr>
                    <th width="30%">Tipo</th>
                    <th width="70%">Descripción</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><code>ROWS</code></td>
                    <td>Define ventana por número físico de filas</td>
                </tr>
                <tr>
                    <td><code>RANGE</code></td>
                    <td>Define ventana por valores lógicos (incluye empates)</td>
                </tr>
            </tbody>
        </table>

        <h3>8.2. Especificadores de Marco</h3>

        <pre><code class="language-sql">-- Ejemplos de marcos de ventana

-- Desde inicio hasta fila actual (running total)
ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW

-- Últimas 3 filas incluyendo la actual
ROWS BETWEEN 2 PRECEDING AND CURRENT ROW

-- Desde fila actual hasta el final
ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING

-- Ventana de 7 días (3 anteriores, actual, 3 siguientes)
ROWS BETWEEN 3 PRECEDING AND 3 FOLLOWING

-- Solo la fila actual
ROWS BETWEEN CURRENT ROW AND CURRENT ROW</code></pre>

        <h2 class="section-title">9. Mejores Prácticas</h2>

        <div class="row">
            <div class="col-md-6">
                <div class="card border-success mb-3">
                    <div class="card-header bg-success text-white">✅ Hacer</div>
                    <div class="card-body">
                        <ul>
                            <li>Usar window functions en lugar de self-joins</li>
                            <li>Añadir índices en columnas de PARTITION BY y ORDER BY</li>
                            <li>Combinar con CTEs para mayor claridad</li>
                            <li>Especificar el marco de ventana explícitamente</li>
                            <li>Testear rendimiento con EXPLAIN</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card border-danger mb-3">
                    <div class="card-header bg-danger text-white">❌ Evitar</div>
                    <div class="card-body">
                        <ul>
                            <li>Window functions sobre millones de filas sin índices</li>
                            <li>Múltiples window functions con PARTITION BY diferentes</li>
                            <li>LAST_VALUE sin especificar marco completo</li>
                            <li>Window functions en WHERE (usar subquery o CTE)</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Compatibilidad:</strong> Window Functions requieren MySQL 8.0+ o MariaDB 10.2+. PrestaShop 8.9+ recomienda MySQL 8.0 para aprovechar estas características.
        </div>

        <h2 class="section-title">10. Comparativa de Rendimiento</h2>

        <table class="table table-striped">
            <thead class="table-dark">
                <tr>
                    <th>Operación</th>
                    <th>Con Window Function</th>
                    <th>Sin Window Function</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Ranking</strong></td>
                    <td>⚡⚡⚡ ROW_NUMBER()</td>
                    <td>⚡ Variables de sesión</td>
                </tr>
                <tr>
                    <td><strong>Running Total</strong></td>
                    <td>⚡⚡⚡ SUM() OVER</td>
                    <td>⚡ Self-join o subquery</td>
                </tr>
                <tr>
                    <td><strong>Comparar con anterior</strong></td>
                    <td>⚡⚡⚡ LAG()</td>
                    <td>⚡ Self-join</td>
                </tr>
                <tr>
                    <td><strong>Top N por grupo</strong></td>
                    <td>⚡⚡⚡ ROW_NUMBER() + WHERE</td>
                    <td>⚡ Subconsultas correlacionadas</td>
                </tr>
            </tbody>
        </table>
    </div>
`;

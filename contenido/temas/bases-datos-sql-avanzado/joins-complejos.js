// @ts-nocheck
const joinsComplejos = `
    <div class="content-section">
        <h1 id="joins-complejos">Joins Complejos (CROSS JOIN, SELF JOIN, FULL OUTER JOIN)</h1>
        <p>Los joins complejos son técnicas avanzadas de combinación de tablas en SQL que permiten realizar consultas sofisticadas. En PrestaShop 8.9+ con PHP 8.1+ y MySQL 8.0+, estos joins son fundamentales para análisis complejos, generación de reportes y procesamiento de datos relacionados.</p>

        <h2 class="section-title">1. Repaso de Joins Básicos</h2>

        <h3>1.1. Tipos de Joins</h3>

        <table class="table table-bordered">
            <thead class="table-dark">
                <tr>
                    <th width="25%">Tipo de Join</th>
                    <th width="40%">Descripción</th>
                    <th width="35%">Uso en PrestaShop</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><code>INNER JOIN</code></td>
                    <td>Solo filas con coincidencias en ambas tablas</td>
                    <td>Productos con ventas</td>
                </tr>
                <tr>
                    <td><code>LEFT JOIN</code></td>
                    <td>Todas las filas de la tabla izquierda</td>
                    <td>Productos con o sin ventas</td>
                </tr>
                <tr>
                    <td><code>RIGHT JOIN</code></td>
                    <td>Todas las filas de la tabla derecha</td>
                    <td>Poco usado en PrestaShop</td>
                </tr>
                <tr>
                    <td><code>CROSS JOIN</code></td>
                    <td>Producto cartesiano (todas las combinaciones)</td>
                    <td>Combinaciones de productos/atributos</td>
                </tr>
                <tr>
                    <td><code>SELF JOIN</code></td>
                    <td>Tabla unida consigo misma</td>
                    <td>Categorías padre-hijo, productos relacionados</td>
                </tr>
                <tr>
                    <td><code>FULL OUTER JOIN</code></td>
                    <td>Todas las filas de ambas tablas</td>
                    <td>Comparativas completas (requiere emulación en MySQL)</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">2. CROSS JOIN - Producto Cartesiano</h2>

        <h3>2.1. ¿Qué es un CROSS JOIN?</h3>
        <p>Un CROSS JOIN produce el producto cartesiano de dos tablas: cada fila de la primera tabla se combina con cada fila de la segunda tabla.</p>

        <div class="alert alert-warning">
            <strong>⚠️ Precaución:</strong> Un CROSS JOIN puede generar grandes volúmenes de datos. Si tabla A tiene 100 filas y tabla B tiene 200 filas, el resultado tendrá 20,000 filas (100 × 200).
        </div>

        <h3>2.2. Sintaxis de CROSS JOIN</h3>

        <pre><code class="language-sql">-- Sintaxis explícita
SELECT *
FROM tabla1
CROSS JOIN tabla2;

-- Sintaxis implícita (sin WHERE)
SELECT *
FROM tabla1, tabla2;</code></pre>

        <h3>2.3. Generar Todas las Combinaciones de Atributos</h3>

        <pre><code class="language-sql">-- Generar todas las combinaciones posibles de tallas y colores
SELECT 
    p.id_product,
    pl.name AS product_name,
    size.name AS size,
    color.name AS color
FROM ps_product p
INNER JOIN ps_product_lang pl ON p.id_product = pl.id_product AND pl.id_lang = 1
CROSS JOIN (
    SELECT DISTINCT a.id_attribute, al.name
    FROM ps_attribute a
    INNER JOIN ps_attribute_lang al ON a.id_attribute = al.id_attribute AND al.id_lang = 1
    INNER JOIN ps_attribute_group ag ON a.id_attribute_group = ag.id_attribute_group
    WHERE ag.is_color_group = 0 -- Tallas
) AS size
CROSS JOIN (
    SELECT DISTINCT a.id_attribute, al.name
    FROM ps_attribute a
    INNER JOIN ps_attribute_lang al ON a.id_attribute = al.id_attribute AND al.id_lang = 1
    INNER JOIN ps_attribute_group ag ON a.id_attribute_group = ag.id_attribute_group
    WHERE ag.is_color_group = 1 -- Colores
) AS color
WHERE p.id_product = 10  -- Producto específico
LIMIT 100;</code></pre>

        <h3>2.4. Matriz de Precios por Cantidad</h3>

        <pre><code class="language-sql">-- Calcular descuentos por volumen para todos los productos
WITH quantity_ranges AS (
    SELECT 1 AS qty UNION SELECT 10 UNION SELECT 50 UNION SELECT 100
)
SELECT 
    p.id_product,
    pl.name AS product_name,
    p.price AS base_price,
    qr.qty AS quantity,
    ROUND(p.price * qr.qty, 2) AS subtotal,
    CASE 
        WHEN qr.qty >= 100 THEN 0.20
        WHEN qr.qty >= 50 THEN 0.15
        WHEN qr.qty >= 10 THEN 0.10
        ELSE 0
    END AS discount_rate,
    ROUND(p.price * qr.qty * (1 - CASE 
        WHEN qr.qty >= 100 THEN 0.20
        WHEN qr.qty >= 50 THEN 0.15
        WHEN qr.qty >= 10 THEN 0.10
        ELSE 0
    END), 2) AS final_price
FROM ps_product p
INNER JOIN ps_product_lang pl ON p.id_product = pl.id_product AND pl.id_lang = 1
CROSS JOIN quantity_ranges qr
WHERE p.active = 1
    AND p.price > 0
ORDER BY p.id_product, qr.qty;</code></pre>

        <h3>2.5. Planificación de Horarios</h3>

        <pre><code class="language-sql">-- Generar todas las combinaciones de empleados y turnos
SELECT 
    e.id_employee,
    CONCAT(e.firstname, ' ', e.lastname) AS employee_name,
    shifts.day_of_week,
    shifts.shift_time
FROM ps_employee e
CROSS JOIN (
    SELECT 'Lunes' AS day_of_week, 'Mañana' AS shift_time
    UNION SELECT 'Lunes', 'Tarde'
    UNION SELECT 'Martes', 'Mañana'
    UNION SELECT 'Martes', 'Tarde'
    UNION SELECT 'Miércoles', 'Mañana'
    UNION SELECT 'Miércoles', 'Tarde'
    UNION SELECT 'Jueves', 'Mañana'
    UNION SELECT 'Jueves', 'Tarde'
    UNION SELECT 'Viernes', 'Mañana'
    UNION SELECT 'Viernes', 'Tarde'
) AS shifts
WHERE e.active = 1
ORDER BY e.id_employee, 
    FIELD(shifts.day_of_week, 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'),
    shifts.shift_time;</code></pre>

        <h2 class="section-title">3. SELF JOIN - Tabla Consigo Misma</h2>

        <h3>3.1. ¿Qué es un SELF JOIN?</h3>
        <p>Un SELF JOIN es cuando una tabla se une consigo misma. Es útil para datos jerárquicos o relacionados dentro de la misma tabla.</p>

        <h3>3.2. Categorías Padre-Hijo</h3>

        <pre><code class="language-sql">-- Mostrar categorías con su categoría padre
SELECT 
    child.id_category AS child_id,
    child_lang.name AS child_name,
    child.level_depth AS child_level,
    parent.id_category AS parent_id,
    parent_lang.name AS parent_name,
    parent.level_depth AS parent_level
FROM ps_category child
INNER JOIN ps_category_lang child_lang 
    ON child.id_category = child_lang.id_category AND child_lang.id_lang = 1
LEFT JOIN ps_category parent 
    ON child.id_parent = parent.id_category
LEFT JOIN ps_category_lang parent_lang 
    ON parent.id_category = parent_lang.id_category AND parent_lang.id_lang = 1
WHERE child.active = 1
ORDER BY parent.id_category, child.id_category;</code></pre>

        <h3>3.3. Productos Relacionados (Up-Sell/Cross-Sell)</h3>

        <pre><code class="language-sql">-- Encontrar productos del mismo precio rango para recomendaciones
SELECT 
    p1.id_product AS product_id,
    pl1.name AS product_name,
    p1.price AS price,
    p2.id_product AS related_id,
    pl2.name AS related_name,
    p2.price AS related_price,
    ABS(p1.price - p2.price) AS price_diff
FROM ps_product p1
INNER JOIN ps_product_lang pl1 ON p1.id_product = pl1.id_product AND pl1.id_lang = 1
INNER JOIN ps_product p2 ON p1.id_product <> p2.id_product  -- No el mismo producto
INNER JOIN ps_product_lang pl2 ON p2.id_product = pl2.id_product AND pl2.id_lang = 1
WHERE p1.active = 1 
    AND p2.active = 1
    AND ABS(p1.price - p2.price) <= 10  -- Diferencia máxima de precio
    AND p1.id_category_default = p2.id_category_default  -- Misma categoría
    AND p1.id_product = 5  -- Producto específico
ORDER BY price_diff
LIMIT 5;</code></pre>

        <h3>3.4. Comparar Pedidos Consecutivos del Mismo Cliente</h3>

        <pre><code class="language-sql">-- Analizar tiempo entre pedidos consecutivos
SELECT 
    o1.id_customer,
    c.email,
    o1.id_order AS first_order,
    o1.date_add AS first_date,
    o1.total_paid_real AS first_amount,
    o2.id_order AS next_order,
    o2.date_add AS next_date,
    o2.total_paid_real AS next_amount,
    DATEDIFF(o2.date_add, o1.date_add) AS days_between,
    ROUND(o2.total_paid_real - o1.total_paid_real, 2) AS amount_change
FROM ps_orders o1
INNER JOIN ps_orders o2 
    ON o1.id_customer = o2.id_customer 
    AND o2.date_add > o1.date_add
INNER JOIN ps_customer c ON o1.id_customer = c.id_customer
WHERE o1.valid = 1 
    AND o2.valid = 1
    -- Solo el siguiente pedido (no todos los posteriores)
    AND NOT EXISTS (
        SELECT 1 
        FROM ps_orders o3 
        WHERE o3.id_customer = o1.id_customer 
            AND o3.date_add > o1.date_add 
            AND o3.date_add < o2.date_add
            AND o3.valid = 1
    )
ORDER BY o1.id_customer, o1.date_add
LIMIT 100;</code></pre>

        <h3>3.5. Detectar Duplicados</h3>

        <pre><code class="language-sql">-- Encontrar clientes con emails similares (posibles duplicados)
SELECT 
    c1.id_customer AS customer1_id,
    c1.email AS email1,
    c1.firstname AS firstname1,
    c1.lastname AS lastname1,
    c2.id_customer AS customer2_id,
    c2.email AS email2,
    c2.firstname AS firstname2,
    c2.lastname AS lastname2
FROM ps_customer c1
INNER JOIN ps_customer c2 
    ON c1.id_customer < c2.id_customer  -- Evitar duplicados en resultados
    AND (
        -- Mismo nombre y apellido
        (c1.firstname = c2.firstname AND c1.lastname = c2.lastname)
        OR 
        -- Email muy similar
        (SUBSTRING_INDEX(c1.email, '@', 1) = SUBSTRING_INDEX(c2.email, '@', 1))
    )
WHERE c1.active = 1 
    AND c2.active = 1
ORDER BY c1.lastname, c1.firstname;</code></pre>

        <h2 class="section-title">4. FULL OUTER JOIN - Unión Completa</h2>

        <h3>4.1. FULL OUTER JOIN en MySQL</h3>

        <div class="alert alert-warning">
            <strong>⚠️ Limitación de MySQL:</strong> MySQL no soporta FULL OUTER JOIN directamente. Debe emularse usando UNION de LEFT JOIN y RIGHT JOIN.
        </div>

        <pre><code class="language-sql">-- Sintaxis estándar SQL (no soportada en MySQL)
SELECT *
FROM tabla1
FULL OUTER JOIN tabla2 ON tabla1.id = tabla2.id;

-- Emulación en MySQL
SELECT *
FROM tabla1
LEFT JOIN tabla2 ON tabla1.id = tabla2.id
UNION
SELECT *
FROM tabla1
RIGHT JOIN tabla2 ON tabla1.id = tabla2.id
WHERE tabla1.id IS NULL;</code></pre>

        <h3>4.2. Comparativa Completa de Productos y Ventas</h3>

        <pre><code class="language-sql">-- Productos con o sin ventas, y ventas de productos eliminados
SELECT 
    COALESCE(p.id_product, sales.product_id) AS product_id,
    COALESCE(pl.name, 'Producto Eliminado') AS product_name,
    p.active,
    COALESCE(sales.total_sold, 0) AS total_sold,
    COALESCE(sales.revenue, 0) AS revenue
FROM ps_product p
INNER JOIN ps_product_lang pl ON p.id_product = pl.id_product AND pl.id_lang = 1
LEFT JOIN (
    SELECT 
        product_id,
        SUM(product_quantity) AS total_sold,
        SUM(product_quantity * unit_price_tax_incl) AS revenue
    FROM ps_order_detail
    GROUP BY product_id
) AS sales ON p.id_product = sales.product_id

UNION

SELECT 
    sales.product_id,
    'Producto Eliminado' AS product_name,
    0 AS active,
    sales.total_sold,
    sales.revenue
FROM (
    SELECT 
        product_id,
        SUM(product_quantity) AS total_sold,
        SUM(product_quantity * unit_price_tax_incl) AS revenue
    FROM ps_order_detail
    GROUP BY product_id
) AS sales
LEFT JOIN ps_product p ON sales.product_id = p.id_product
WHERE p.id_product IS NULL

ORDER BY revenue DESC;</code></pre>

        <h3>4.3. Análisis Completo de Clientes y Pedidos</h3>

        <pre><code class="language-sql">-- Clientes registrados sin pedidos y pedidos de guests
SELECT 
    COALESCE(c.id_customer, o.id_customer) AS customer_id,
    COALESCE(c.email, g.email) AS email,
    CASE 
        WHEN c.id_customer IS NOT NULL THEN 'Registrado'
        ELSE 'Guest'
    END AS customer_type,
    COUNT(DISTINCT o.id_order) AS total_orders,
    COALESCE(SUM(o.total_paid_real), 0) AS total_spent
FROM ps_customer c
LEFT JOIN ps_orders o ON c.id_customer = o.id_customer

UNION

SELECT 
    o.id_customer,
    g.email,
    'Guest' AS customer_type,
    COUNT(DISTINCT o.id_order),
    SUM(o.total_paid_real)
FROM ps_orders o
INNER JOIN ps_guest g ON o.id_customer = g.id_customer
LEFT JOIN ps_customer c ON o.id_customer = c.id_customer
WHERE c.id_customer IS NULL
GROUP BY o.id_customer, g.email

GROUP BY customer_id, email, customer_type
ORDER BY total_spent DESC;</code></pre>

        <h2 class="section-title">5. Implementación en PHP 8.1+ con PrestaShop</h2>

        <h3>5.1. Repositorio con CROSS JOIN</h3>

        <pre><code class="language-php"><?php
// modules/mymodule/src/Repository/ProductCombinationRepository.php
declare(strict_types=1);

namespace MyModule\\Repository;

use Db;

class ProductCombinationRepository
{
    /**
     * Generar matriz de precios por cantidad
     */
    public function getPriceMatrix(int $idProduct, int $idLang = 1): array
    {
        $sql = '
            WITH quantity_ranges AS (
                SELECT 1 AS qty 
                UNION SELECT 10 
                UNION SELECT 50 
                UNION SELECT 100
            )
            SELECT 
                p.id_product,
                pl.name AS product_name,
                p.price AS base_price,
                qr.qty AS quantity,
                ROUND(p.price * qr.qty, 2) AS subtotal,
                CASE 
                    WHEN qr.qty >= 100 THEN 0.20
                    WHEN qr.qty >= 50 THEN 0.15
                    WHEN qr.qty >= 10 THEN 0.10
                    ELSE 0
                END AS discount_rate,
                ROUND(p.price * qr.qty * (1 - CASE 
                    WHEN qr.qty >= 100 THEN 0.20
                    WHEN qr.qty >= 50 THEN 0.15
                    WHEN qr.qty >= 10 THEN 0.10
                    ELSE 0
                END), 2) AS final_price
            FROM ' . _DB_PREFIX_ . 'product p
            INNER JOIN ' . _DB_PREFIX_ . 'product_lang pl 
                ON p.id_product = pl.id_product AND pl.id_lang = ' . (int) $idLang . '
            CROSS JOIN quantity_ranges qr
            WHERE p.id_product = ' . (int) $idProduct . '
                AND p.active = 1
            ORDER BY qr.qty
        ';

        return Db::getInstance()->executeS($sql) ?: [];
    }

    /**
     * Generar todas las combinaciones de atributos disponibles
     */
    public function generateAttributeCombinations(int $idProduct, int $idLang = 1): array
    {
        $sql = '
            SELECT 
                p.id_product,
                pl.name AS product_name,
                size.id_attribute AS size_id,
                size.name AS size,
                color.id_attribute AS color_id,
                color.name AS color
            FROM ' . _DB_PREFIX_ . 'product p
            INNER JOIN ' . _DB_PREFIX_ . 'product_lang pl 
                ON p.id_product = pl.id_product AND pl.id_lang = ' . (int) $idLang . '
            CROSS JOIN (
                SELECT DISTINCT a.id_attribute, al.name
                FROM ' . _DB_PREFIX_ . 'attribute a
                INNER JOIN ' . _DB_PREFIX_ . 'attribute_lang al 
                    ON a.id_attribute = al.id_attribute AND al.id_lang = ' . (int) $idLang . '
                INNER JOIN ' . _DB_PREFIX_ . 'attribute_group ag 
                    ON a.id_attribute_group = ag.id_attribute_group
                WHERE ag.is_color_group = 0
            ) AS size
            CROSS JOIN (
                SELECT DISTINCT a.id_attribute, al.name
                FROM ' . _DB_PREFIX_ . 'attribute a
                INNER JOIN ' . _DB_PREFIX_ . 'attribute_lang al 
                    ON a.id_attribute = al.id_attribute AND al.id_lang = ' . (int) $idLang . '
                INNER JOIN ' . _DB_PREFIX_ . 'attribute_group ag 
                    ON a.id_attribute_group = ag.id_attribute_group
                WHERE ag.is_color_group = 1
            ) AS color
            WHERE p.id_product = ' . (int) $idProduct . '
            LIMIT 100
        ';

        return Db::getInstance()->executeS($sql) ?: [];
    }
}
</code></pre>

        <h3>5.2. Repositorio con SELF JOIN</h3>

        <pre><code class="language-php"><?php
// modules/mymodule/src/Repository/CategoryHierarchyRepository.php
declare(strict_types=1);

namespace MyModule\\Repository;

use Db;

class CategoryHierarchyRepository
{
    /**
     * Obtener categorías con su categoría padre
     */
    public function getCategoriesWithParent(int $idLang = 1): array
    {
        $sql = '
            SELECT 
                child.id_category AS child_id,
                child_lang.name AS child_name,
                child.level_depth AS child_level,
                parent.id_category AS parent_id,
                parent_lang.name AS parent_name,
                parent.level_depth AS parent_level
            FROM ' . _DB_PREFIX_ . 'category child
            INNER JOIN ' . _DB_PREFIX_ . 'category_lang child_lang 
                ON child.id_category = child_lang.id_category AND child_lang.id_lang = ' . (int) $idLang . '
            LEFT JOIN ' . _DB_PREFIX_ . 'category parent 
                ON child.id_parent = parent.id_category
            LEFT JOIN ' . _DB_PREFIX_ . 'category_lang parent_lang 
                ON parent.id_category = parent_lang.id_category AND parent_lang.id_lang = ' . (int) $idLang . '
            WHERE child.active = 1
            ORDER BY parent.id_category, child.id_category
        ';

        return Db::getInstance()->executeS($sql) ?: [];
    }

    /**
     * Encontrar productos relacionados por rango de precio
     */
    public function getRelatedProductsByPrice(
        int $idProduct, 
        float $priceDiff = 10.0, 
        int $limit = 5, 
        int $idLang = 1
    ): array {
        $sql = '
            SELECT 
                p1.id_product AS product_id,
                pl1.name AS product_name,
                p1.price AS price,
                p2.id_product AS related_id,
                pl2.name AS related_name,
                p2.price AS related_price,
                ABS(p1.price - p2.price) AS price_diff
            FROM ' . _DB_PREFIX_ . 'product p1
            INNER JOIN ' . _DB_PREFIX_ . 'product_lang pl1 
                ON p1.id_product = pl1.id_product AND pl1.id_lang = ' . (int) $idLang . '
            INNER JOIN ' . _DB_PREFIX_ . 'product p2 
                ON p1.id_product <> p2.id_product
            INNER JOIN ' . _DB_PREFIX_ . 'product_lang pl2 
                ON p2.id_product = pl2.id_product AND pl2.id_lang = ' . (int) $idLang . '
            WHERE p1.active = 1 
                AND p2.active = 1
                AND ABS(p1.price - p2.price) <= ' . (float) $priceDiff . '
                AND p1.id_category_default = p2.id_category_default
                AND p1.id_product = ' . (int) $idProduct . '
            ORDER BY price_diff
            LIMIT ' . (int) $limit . '
        ';

        return Db::getInstance()->executeS($sql) ?: [];
    }
}
</code></pre>

        <h2 class="section-title">6. Optimización y Mejores Prácticas</h2>

        <h3>6.1. Índices Recomendados</h3>

        <pre><code class="language-sql">-- Para SELF JOIN en categorías
CREATE INDEX idx_category_parent ON ps_category(id_parent, active);

-- Para SELF JOIN en productos relacionados
CREATE INDEX idx_product_price_category ON ps_product(id_category_default, price, active);

-- Para comparación de pedidos
CREATE INDEX idx_orders_customer_date ON ps_orders(id_customer, date_add, valid);</code></pre>

        <h3>6.2. Limitar Resultados de CROSS JOIN</h3>

        <div class="alert alert-danger">
            <strong>🚫 Evitar:</strong>
            <pre class="mb-0"><code class="language-sql">-- Esto puede generar millones de filas
SELECT * FROM ps_product CROSS JOIN ps_category;</code></pre>
        </div>

        <div class="alert alert-success">
            <strong>✅ Mejor:</strong>
            <pre class="mb-0"><code class="language-sql">-- Limitar con WHERE y LIMIT
SELECT * 
FROM ps_product CROSS JOIN ps_category 
WHERE ps_product.id_product = 10 
LIMIT 100;</code></pre>
        </div>

        <h2 class="section-title">7. Comparativa de Joins</h2>

        <table class="table table-striped">
            <thead class="table-dark">
                <tr>
                    <th>Join Type</th>
                    <th>Casos de Uso</th>
                    <th>Rendimiento</th>
                    <th>Precauciones</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>CROSS JOIN</strong></td>
                    <td>Combinaciones, matrices, planificación</td>
                    <td>⚠️ Puede ser lento</td>
                    <td>Siempre usar LIMIT</td>
                </tr>
                <tr>
                    <td><strong>SELF JOIN</strong></td>
                    <td>Jerarquías, comparaciones, duplicados</td>
                    <td>⭐⭐⭐ Bueno con índices</td>
                    <td>Usar aliases claros</td>
                </tr>
                <tr>
                    <td><strong>FULL OUTER</strong></td>
                    <td>Análisis completos, auditorías</td>
                    <td>⚠️ Lento (usa UNION)</td>
                    <td>Considerar alternativas</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">8. Mejores Prácticas</h2>

        <div class="row">
            <div class="col-md-6">
                <div class="card border-success mb-3">
                    <div class="card-header bg-success text-white">✅ Hacer</div>
                    <div class="card-body">
                        <ul>
                            <li>Usar aliases descriptivos en SELF JOIN</li>
                            <li>Limitar CROSS JOIN con WHERE y LIMIT</li>
                            <li>Añadir índices en columnas de join</li>
                            <li>Testear con EXPLAIN antes de producción</li>
                            <li>Usar CTEs para mejorar legibilidad</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card border-danger mb-3">
                    <div class="card-header bg-danger text-white">❌ Evitar</div>
                    <div class="card-body">
                        <ul>
                            <li>CROSS JOIN sin condiciones de filtrado</li>
                            <li>SELF JOIN sin índices en columnas de unión</li>
                            <li>FULL OUTER JOIN en queries frecuentes</li>
                            <li>Joins complejos sin análisis de rendimiento</li>
                            <li>Demasiados niveles de SELF JOIN anidados</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <div class="alert alert-info">
            <strong>🎯 Cuándo usar cada tipo:</strong>
            <ul class="mb-0">
                <li><strong>CROSS JOIN</strong>: Generar combinaciones, matrices de precios, planificación</li>
                <li><strong>SELF JOIN</strong>: Jerarquías, comparar registros relacionados, detectar duplicados</li>
                <li><strong>FULL OUTER JOIN</strong>: Análisis exhaustivos, auditorías, reportes completos</li>
            </ul>
        </div>
    </div>
`;

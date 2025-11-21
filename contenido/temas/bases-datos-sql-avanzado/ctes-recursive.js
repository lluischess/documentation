// @ts-nocheck
const ctesRecursive = `
    <div class="content-section">
        <h1 id="ctes-recursive">CTEs (Common Table Expressions) y Recursive CTEs</h1>
        <p>Las CTEs (Common Table Expressions) son consultas temporales nombradas que mejoran la legibilidad y mantenibilidad del código SQL. En PrestaShop 8.9+ con PHP 8.1+, los CTEs son especialmente útiles para estructuras jerárquicas como categorías de productos y para simplificar consultas complejas.</p>

        <h2 class="section-title">1. Fundamentos de CTEs</h2>

        <h3>1.1. ¿Qué es un CTE?</h3>
        <p>Un CTE (Common Table Expression) es una consulta temporal que existe solo durante la ejecución de una declaración SELECT, INSERT, UPDATE o DELETE.</p>

        <div class="alert alert-info">
            <strong>💡 Ventajas de CTEs:</strong>
            <ul class="mb-0">
                <li>Mejora la legibilidad del código SQL</li>
                <li>Permite reutilizar subconsultas en la misma query</li>
                <li>Facilita el debugging (puedes ejecutar el CTE aisladamente)</li>
                <li>Soporta recursión para estructuras jerárquicas</li>
                <li>Alternativa más clara a subconsultas anidadas</li>
            </ul>
        </div>

        <h3>1.2. Sintaxis Básica</h3>

        <pre><code class="language-sql">-- Sintaxis general de CTE
WITH nombre_cte AS (
    SELECT columna1, columna2
    FROM tabla
    WHERE condicion
)
SELECT *
FROM nombre_cte
WHERE otra_condicion;</code></pre>

        <h2 class="section-title">2. CTEs Simples (No Recursivos)</h2>

        <h3>2.1. CTE Básico en PrestaShop</h3>

        <pre><code class="language-sql">-- Obtener productos con ventas y su ranking por categoría
-- Sin CTE (difícil de leer)
SELECT 
    p.id_product,
    pl.name,
    ventas.total_vendido,
    ventas.ingresos
FROM ps_product p
INNER JOIN ps_product_lang pl ON p.id_product = pl.id_product AND pl.id_lang = 1
INNER JOIN (
    SELECT 
        product_id,
        SUM(product_quantity) AS total_vendido,
        SUM(product_quantity * unit_price_tax_incl) AS ingresos
    FROM ps_order_detail
    GROUP BY product_id
) AS ventas ON p.id_product = ventas.product_id
WHERE ventas.total_vendido > 10;

-- Con CTE (más legible)
WITH product_sales AS (
    SELECT 
        product_id,
        SUM(product_quantity) AS total_vendido,
        SUM(product_quantity * unit_price_tax_incl) AS ingresos
    FROM ps_order_detail
    GROUP BY product_id
)
SELECT 
    p.id_product,
    pl.name,
    ps.total_vendido,
    ROUND(ps.ingresos, 2) AS ingresos
FROM ps_product p
INNER JOIN ps_product_lang pl ON p.id_product = pl.id_product AND pl.id_lang = 1
INNER JOIN product_sales ps ON p.id_product = ps.product_id
WHERE ps.total_vendido > 10
ORDER BY ps.total_vendido DESC;</code></pre>

        <h3>2.2. Múltiples CTEs</h3>

        <pre><code class="language-sql">-- Análisis completo de ventas con múltiples CTEs
WITH 
-- CTE 1: Ventas por producto
product_sales AS (
    SELECT 
        product_id,
        COUNT(DISTINCT id_order) AS num_orders,
        SUM(product_quantity) AS total_quantity,
        SUM(product_quantity * unit_price_tax_incl) AS total_revenue
    FROM ps_order_detail
    GROUP BY product_id
),
-- CTE 2: Categorías por producto
product_categories AS (
    SELECT 
        cp.id_product,
        c.id_category,
        cl.name AS category_name
    FROM ps_category_product cp
    INNER JOIN ps_category c ON cp.id_category = c.id_category
    INNER JOIN ps_category_lang cl ON c.id_category = cl.id_category AND cl.id_lang = 1
    WHERE c.active = 1
),
-- CTE 3: Stock actual
product_stock AS (
    SELECT 
        id_product,
        quantity AS stock_actual,
        CASE 
            WHEN quantity = 0 THEN 'Sin stock'
            WHEN quantity < 10 THEN 'Stock bajo'
            WHEN quantity < 50 THEN 'Stock medio'
            ELSE 'Stock alto'
        END AS stock_status
    FROM ps_product
)
-- Query final usando los 3 CTEs
SELECT 
    p.id_product,
    p.reference,
    pl.name AS product_name,
    pc.category_name,
    ps.num_orders,
    ps.total_quantity AS vendidos,
    ROUND(ps.total_revenue, 2) AS ingresos,
    pst.stock_actual,
    pst.stock_status
FROM ps_product p
INNER JOIN ps_product_lang pl ON p.id_product = pl.id_product AND pl.id_lang = 1
LEFT JOIN product_sales ps ON p.id_product = ps.product_id
LEFT JOIN product_categories pc ON p.id_product = pc.id_product
LEFT JOIN product_stock pst ON p.id_product = pst.id_product
WHERE p.active = 1
ORDER BY ps.total_revenue DESC
LIMIT 50;</code></pre>

        <h3>2.3. CTE con Agregaciones</h3>

        <pre><code class="language-sql">-- Clientes VIP: aquellos que gastaron más que el promedio
WITH customer_spending AS (
    SELECT 
        o.id_customer,
        COUNT(DISTINCT o.id_order) AS total_orders,
        SUM(o.total_paid_real) AS total_spent,
        AVG(o.total_paid_real) AS avg_order_value,
        MAX(o.date_add) AS last_order_date
    FROM ps_orders o
    WHERE o.valid = 1
    GROUP BY o.id_customer
),
average_spending AS (
    SELECT AVG(total_spent) AS avg_customer_spending
    FROM customer_spending
)
SELECT 
    c.id_customer,
    c.email,
    CONCAT(c.firstname, ' ', c.lastname) AS full_name,
    cs.total_orders,
    ROUND(cs.total_spent, 2) AS total_spent,
    ROUND(cs.avg_order_value, 2) AS avg_order_value,
    cs.last_order_date,
    ROUND(cs.total_spent - avs.avg_customer_spending, 2) AS above_average
FROM ps_customer c
INNER JOIN customer_spending cs ON c.id_customer = cs.id_customer
CROSS JOIN average_spending avs
WHERE cs.total_spent > avs.avg_customer_spending
ORDER BY cs.total_spent DESC;</code></pre>

        <h2 class="section-title">3. CTEs Recursivos</h2>

        <h3>3.1. Concepto de Recursión</h3>
        <p>Los CTEs recursivos permiten consultar estructuras jerárquicas como árboles de categorías. Constan de dos partes:</p>
        
        <ul>
            <li><strong>Anchor Member:</strong> Consulta base (no recursiva)</li>
            <li><strong>Recursive Member:</strong> Consulta que se llama a sí misma</li>
        </ul>

        <h3>3.2. Sintaxis de CTE Recursivo</h3>

        <pre><code class="language-sql">-- Sintaxis general
WITH RECURSIVE nombre_cte AS (
    -- Anchor member (base case)
    SELECT columnas
    FROM tabla
    WHERE condicion_inicial
    
    UNION ALL
    
    -- Recursive member
    SELECT columnas
    FROM tabla
    INNER JOIN nombre_cte ON condicion_recursiva
)
SELECT * FROM nombre_cte;</code></pre>

        <h3>3.3. Árbol Completo de Categorías en PrestaShop</h3>

        <pre><code class="language-sql">-- Obtener todo el árbol de categorías desde la raíz
WITH RECURSIVE category_tree AS (
    -- Anchor: categoría raíz (Home = 2 en PrestaShop)
    SELECT 
        c.id_category,
        c.id_parent,
        cl.name,
        0 AS level,
        CAST(cl.name AS CHAR(500)) AS path
    FROM ps_category c
    INNER JOIN ps_category_lang cl 
        ON c.id_category = cl.id_category AND cl.id_lang = 1
    WHERE c.id_parent = 0  -- Categoría raíz
    
    UNION ALL
    
    -- Recursive: subcategorías
    SELECT 
        c.id_category,
        c.id_parent,
        cl.name,
        ct.level + 1,
        CONCAT(ct.path, ' > ', cl.name)
    FROM ps_category c
    INNER JOIN ps_category_lang cl 
        ON c.id_category = cl.id_category AND cl.id_lang = 1
    INNER JOIN category_tree ct 
        ON c.id_parent = ct.id_category
    WHERE c.active = 1
)
SELECT 
    id_category,
    id_parent,
    name,
    level,
    path,
    REPEAT('  ', level) AS indentation
FROM category_tree
ORDER BY path;</code></pre>

        <div class="alert alert-warning">
            <strong>⚠️ Límite de Recursión:</strong> Por defecto, MySQL limita la recursión a 1000 niveles. Puedes modificarlo:
            <pre class="mb-0"><code class="language-sql">SET SESSION cte_max_recursion_depth = 5000;</code></pre>
        </div>

        <h3>3.4. Subcategorías de una Categoría Específica</h3>

        <pre><code class="language-sql">-- Obtener todas las subcategorías de "Ropa" (id = 5)
WITH RECURSIVE subcategories AS (
    -- Anchor: categoría inicial
    SELECT 
        c.id_category,
        c.id_parent,
        cl.name,
        0 AS depth
    FROM ps_category c
    INNER JOIN ps_category_lang cl 
        ON c.id_category = cl.id_category AND cl.id_lang = 1
    WHERE c.id_category = 5  -- Categoría "Ropa"
    
    UNION ALL
    
    -- Recursive: todas las hijas
    SELECT 
        c.id_category,
        c.id_parent,
        cl.name,
        sc.depth + 1
    FROM ps_category c
    INNER JOIN ps_category_lang cl 
        ON c.id_category = cl.id_category AND cl.id_lang = 1
    INNER JOIN subcategories sc 
        ON c.id_parent = sc.id_category
    WHERE c.active = 1
)
SELECT 
    sc.id_category,
    sc.name,
    sc.depth,
    COUNT(DISTINCT cp.id_product) AS total_products
FROM subcategories sc
LEFT JOIN ps_category_product cp 
    ON sc.id_category = cp.id_category
GROUP BY sc.id_category, sc.name, sc.depth
ORDER BY sc.depth, sc.name;</code></pre>

        <h3>3.5. Ruta desde una Categoría hasta la Raíz</h3>

        <pre><code class="language-sql">-- Breadcrumb: obtener la ruta completa de una categoría (id = 15)
WITH RECURSIVE category_path AS (
    -- Anchor: categoría actual
    SELECT 
        c.id_category,
        c.id_parent,
        cl.name,
        0 AS level
    FROM ps_category c
    INNER JOIN ps_category_lang cl 
        ON c.id_category = cl.id_category AND cl.id_lang = 1
    WHERE c.id_category = 15
    
    UNION ALL
    
    -- Recursive: subir por la jerarquía
    SELECT 
        c.id_category,
        c.id_parent,
        cl.name,
        cp.level + 1
    FROM ps_category c
    INNER JOIN ps_category_lang cl 
        ON c.id_category = cl.id_category AND cl.id_lang = 1
    INNER JOIN category_path cp 
        ON c.id_category = cp.id_parent
    WHERE c.id_parent > 0
)
SELECT 
    id_category,
    name,
    level
FROM category_path
ORDER BY level DESC;  -- De raíz a hoja

-- Resultado como breadcrumb
WITH RECURSIVE category_path AS (
    SELECT c.id_category, c.id_parent, cl.name, 0 AS level
    FROM ps_category c
    INNER JOIN ps_category_lang cl ON c.id_category = cl.id_category AND cl.id_lang = 1
    WHERE c.id_category = 15
    UNION ALL
    SELECT c.id_category, c.id_parent, cl.name, cp.level + 1
    FROM ps_category c
    INNER JOIN ps_category_lang cl ON c.id_category = cl.id_category AND cl.id_lang = 1
    INNER JOIN category_path cp ON c.id_category = cp.id_parent
    WHERE c.id_parent > 0
)
SELECT GROUP_CONCAT(name ORDER BY level DESC SEPARATOR ' > ') AS breadcrumb
FROM category_path;</code></pre>

        <h2 class="section-title">4. Implementación en PHP 8.1+ con PrestaShop</h2>

        <h3>4.1. Repositorio con CTEs</h3>

        <pre><code class="language-php"><?php
// modules/mymodule/src/Repository/CategoryRepository.php
declare(strict_types=1);

namespace MyModule\\Repository;

use Db;

class CategoryRepository
{
    /**
     * Obtener árbol completo de categorías usando CTE recursivo
     */
    public function getCategoryTree(int $idLang = 1): array
    {
        $sql = '
            WITH RECURSIVE category_tree AS (
                SELECT 
                    c.id_category,
                    c.id_parent,
                    cl.name,
                    c.level_depth,
                    CAST(cl.name AS CHAR(500)) AS path,
                    c.active
                FROM ' . _DB_PREFIX_ . 'category c
                INNER JOIN ' . _DB_PREFIX_ . 'category_lang cl 
                    ON c.id_category = cl.id_category AND cl.id_lang = ' . (int) $idLang . '
                WHERE c.id_parent = 0
                
                UNION ALL
                
                SELECT 
                    c.id_category,
                    c.id_parent,
                    cl.name,
                    c.level_depth,
                    CONCAT(ct.path, " > ", cl.name),
                    c.active
                FROM ' . _DB_PREFIX_ . 'category c
                INNER JOIN ' . _DB_PREFIX_ . 'category_lang cl 
                    ON c.id_category = cl.id_category AND cl.id_lang = ' . (int) $idLang . '
                INNER JOIN category_tree ct ON c.id_parent = ct.id_category
                WHERE c.active = 1
            )
            SELECT * FROM category_tree
            ORDER BY path
        ';

        return Db::getInstance()->executeS($sql) ?: [];
    }

    /**
     * Obtener todas las subcategorías de una categoría
     */
    public function getSubcategories(int $idCategory, int $idLang = 1): array
    {
        $sql = '
            WITH RECURSIVE subcategories AS (
                SELECT c.id_category, c.id_parent, cl.name, 0 AS depth
                FROM ' . _DB_PREFIX_ . 'category c
                INNER JOIN ' . _DB_PREFIX_ . 'category_lang cl 
                    ON c.id_category = cl.id_category AND cl.id_lang = ' . (int) $idLang . '
                WHERE c.id_category = ' . (int) $idCategory . '
                
                UNION ALL
                
                SELECT c.id_category, c.id_parent, cl.name, sc.depth + 1
                FROM ' . _DB_PREFIX_ . 'category c
                INNER JOIN ' . _DB_PREFIX_ . 'category_lang cl 
                    ON c.id_category = cl.id_category AND cl.id_lang = ' . (int) $idLang . '
                INNER JOIN subcategories sc ON c.id_parent = sc.id_category
                WHERE c.active = 1
            )
            SELECT 
                sc.*,
                COUNT(DISTINCT cp.id_product) AS total_products
            FROM subcategories sc
            LEFT JOIN ' . _DB_PREFIX_ . 'category_product cp 
                ON sc.id_category = cp.id_category
            GROUP BY sc.id_category
            ORDER BY sc.depth, sc.name
        ';

        return Db::getInstance()->executeS($sql) ?: [];
    }

    /**
     * Obtener breadcrumb de una categoría
     */
    public function getCategoryBreadcrumb(int $idCategory, int $idLang = 1): string
    {
        $sql = '
            WITH RECURSIVE category_path AS (
                SELECT c.id_category, c.id_parent, cl.name, 0 AS level
                FROM ' . _DB_PREFIX_ . 'category c
                INNER JOIN ' . _DB_PREFIX_ . 'category_lang cl 
                    ON c.id_category = cl.id_category AND cl.id_lang = ' . (int) $idLang . '
                WHERE c.id_category = ' . (int) $idCategory . '
                
                UNION ALL
                
                SELECT c.id_category, c.id_parent, cl.name, cp.level + 1
                FROM ' . _DB_PREFIX_ . 'category c
                INNER JOIN ' . _DB_PREFIX_ . 'category_lang cl 
                    ON c.id_category = cl.id_category AND cl.id_lang = ' . (int) $idLang . '
                INNER JOIN category_path cp ON c.id_category = cp.id_parent
                WHERE c.id_parent > 0
            )
            SELECT GROUP_CONCAT(name ORDER BY level DESC SEPARATOR " > ") AS breadcrumb
            FROM category_path
        ';

        $result = Db::getInstance()->getRow($sql);
        return $result['breadcrumb'] ?? '';
    }
}
</code></pre>

        <h3>4.2. Servicio de Análisis con CTEs</h3>

        <pre><code class="language-php"><?php
// modules/mymodule/src/Service/SalesAnalyticsService.php
declare(strict_types=1);

namespace MyModule\\Service;

use Db;

class SalesAnalyticsService
{
    /**
     * Obtener clientes VIP (gastaron más que el promedio)
     */
    public function getVIPCustomers(): array
    {
        $sql = '
            WITH customer_spending AS (
                SELECT 
                    o.id_customer,
                    COUNT(DISTINCT o.id_order) AS total_orders,
                    SUM(o.total_paid_real) AS total_spent,
                    AVG(o.total_paid_real) AS avg_order_value
                FROM ' . _DB_PREFIX_ . 'orders o
                WHERE o.valid = 1
                GROUP BY o.id_customer
            ),
            average_spending AS (
                SELECT AVG(total_spent) AS avg_customer_spending
                FROM customer_spending
            )
            SELECT 
                c.id_customer,
                c.email,
                CONCAT(c.firstname, " ", c.lastname) AS full_name,
                cs.total_orders,
                ROUND(cs.total_spent, 2) AS total_spent,
                ROUND(cs.avg_order_value, 2) AS avg_order_value,
                ROUND(cs.total_spent - avs.avg_customer_spending, 2) AS above_average
            FROM ' . _DB_PREFIX_ . 'customer c
            INNER JOIN customer_spending cs ON c.id_customer = cs.id_customer
            CROSS JOIN average_spending avs
            WHERE cs.total_spent > avs.avg_customer_spending
            ORDER BY cs.total_spent DESC
        ';

        return Db::getInstance()->executeS($sql) ?: [];
    }

    /**
     * Análisis de productos con múltiples CTEs
     */
    public function getProductAnalysis(int $idLang = 1): array
    {
        $sql = '
            WITH 
            product_sales AS (
                SELECT 
                    product_id,
                    COUNT(DISTINCT id_order) AS num_orders,
                    SUM(product_quantity) AS total_quantity,
                    SUM(product_quantity * unit_price_tax_incl) AS total_revenue
                FROM ' . _DB_PREFIX_ . 'order_detail
                GROUP BY product_id
            ),
            product_categories AS (
                SELECT 
                    cp.id_product,
                    cl.name AS category_name
                FROM ' . _DB_PREFIX_ . 'category_product cp
                INNER JOIN ' . _DB_PREFIX_ . 'category_lang cl 
                    ON cp.id_category = cl.id_category AND cl.id_lang = ' . (int) $idLang . '
            )
            SELECT 
                p.id_product,
                p.reference,
                pl.name AS product_name,
                pc.category_name,
                COALESCE(ps.num_orders, 0) AS num_orders,
                COALESCE(ps.total_quantity, 0) AS vendidos,
                ROUND(COALESCE(ps.total_revenue, 0), 2) AS ingresos,
                p.quantity AS stock_actual
            FROM ' . _DB_PREFIX_ . 'product p
            INNER JOIN ' . _DB_PREFIX_ . 'product_lang pl 
                ON p.id_product = pl.id_product AND pl.id_lang = ' . (int) $idLang . '
            LEFT JOIN product_sales ps ON p.id_product = ps.product_id
            LEFT JOIN product_categories pc ON p.id_product = pc.id_product
            WHERE p.active = 1
            ORDER BY ingresos DESC
            LIMIT 100
        ';

        return Db::getInstance()->executeS($sql) ?: [];
    }
}
</code></pre>

        <h2 class="section-title">5. Comparativa: CTE vs Subconsultas vs Tablas Temporales</h2>

        <table class="table table-striped">
            <thead class="table-dark">
                <tr>
                    <th>Característica</th>
                    <th>CTE</th>
                    <th>Subconsulta</th>
                    <th>Tabla Temporal</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Legibilidad</strong></td>
                    <td>⭐⭐⭐⭐⭐</td>
                    <td>⭐⭐</td>
                    <td>⭐⭐⭐</td>
                </tr>
                <tr>
                    <td><strong>Rendimiento</strong></td>
                    <td>⭐⭐⭐⭐</td>
                    <td>⭐⭐⭐</td>
                    <td>⭐⭐⭐⭐⭐</td>
                </tr>
                <tr>
                    <td><strong>Reutilización</strong></td>
                    <td>Sí (misma query)</td>
                    <td>No</td>
                    <td>Sí (múltiples queries)</td>
                </tr>
                <tr>
                    <td><strong>Recursión</strong></td>
                    <td>✅ Soporta</td>
                    <td>❌ No soporta</td>
                    <td>❌ Requiere código adicional</td>
                </tr>
                <tr>
                    <td><strong>Persistencia</strong></td>
                    <td>Solo en la query</td>
                    <td>Solo en la query</td>
                    <td>Sesión completa</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">6. Mejores Prácticas</h2>

        <div class="row">
            <div class="col-md-6">
                <div class="card border-success mb-3">
                    <div class="card-header bg-success text-white">✅ Hacer</div>
                    <div class="card-body">
                        <ul>
                            <li>Usar nombres descriptivos para CTEs</li>
                            <li>Preferir CTEs sobre subconsultas anidadas</li>
                            <li>Limitar recursión con condiciones WHERE</li>
                            <li>Documentar la lógica de CTEs complejos</li>
                            <li>Testear con EXPLAIN para optimizar</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card border-danger mb-3">
                    <div class="card-header bg-danger text-white">❌ Evitar</div>
                    <div class="card-body">
                        <ul>
                            <li>CTEs sin límite de recursión</li>
                            <li>Demasiados CTEs (>5) en una query</li>
                            <li>CTEs con nombres genéricos (temp, t1)</li>
                            <li>Recursión sin condición de salida</li>
                            <li>CTEs cuando tablas temp son más eficientes</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <div class="alert alert-info">
            <strong>🎯 Cuándo usar CTEs vs otras técnicas:</strong>
            <ul class="mb-0">
                <li><strong>Usa CTE</strong>: Queries complejas que necesitan claridad y mantenibilidad</li>
                <li><strong>Usa Subconsulta</strong>: Queries simples de una sola vez</li>
                <li><strong>Usa Tabla Temporal</strong>: Datos reutilizados en múltiples queries o procedimientos</li>
                <li><strong>Usa CTE Recursivo</strong>: Estructuras jerárquicas (categorías, organigramas)</li>
            </ul>
        </div>
    </div>
`;

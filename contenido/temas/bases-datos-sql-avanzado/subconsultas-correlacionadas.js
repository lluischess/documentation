// @ts-nocheck
const subconsultasCorrelacionadas = `
    <div class="content-section">
        <h1 id="subconsultas-correlacionadas">Subconsultas Correlacionadas y No Correlacionadas</h1>
        <p>Las subconsultas (subqueries) son consultas anidadas dentro de otra consulta SQL. En PrestaShop 8.9+ y proyectos con PHP 8.1+, dominar las subconsultas es esencial para realizar consultas complejas de forma eficiente, especialmente cuando se trabaja con grandes volúmenes de datos de productos, pedidos y clientes.</p>

        <h2 class="section-title">1. Fundamentos de Subconsultas</h2>

        <table class="table table-bordered">
            <thead class="table-dark">
                <tr>
                    <th width="30%">Tipo</th>
                    <th width="40%">Descripción</th>
                    <th width="30%">Ubicación</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Subconsulta Escalar</strong></td>
                    <td>Devuelve un solo valor (1 fila, 1 columna)</td>
                    <td>SELECT, WHERE, HAVING</td>
                </tr>
                <tr>
                    <td><strong>Subconsulta de Fila</strong></td>
                    <td>Devuelve una sola fila (múltiples columnas)</td>
                    <td>WHERE, HAVING</td>
                </tr>
                <tr>
                    <td><strong>Subconsulta de Tabla</strong></td>
                    <td>Devuelve múltiples filas y columnas</td>
                    <td>FROM, IN, EXISTS</td>
                </tr>
                <tr>
                    <td><strong>Subconsulta Correlacionada</strong></td>
                    <td>Hace referencia a columnas de la consulta externa</td>
                    <td>WHERE, SELECT, EXISTS</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">2. Subconsultas No Correlacionadas</h2>

        <p>Son independientes de la consulta externa. Se ejecutan <strong>una sola vez</strong> y su resultado se utiliza en la consulta principal.</p>

        <h3>2.1. Subconsulta Escalar en SELECT</h3>
        
        <pre><code class="language-sql">-- Productos con el precio promedio de su categoría
SELECT 
    p.id_product,
    p.reference,
    pl.name,
    p.price,
    (SELECT AVG(p2.price)
     FROM ps_product p2
     INNER JOIN ps_category_product cp2 ON p2.id_product = cp2.id_product
     WHERE cp2.id_category = (
         SELECT cp.id_category FROM ps_category_product cp 
         WHERE cp.id_product = p.id_product LIMIT 1
     )) AS avg_category_price
FROM ps_product p
INNER JOIN ps_product_lang pl ON p.id_product = pl.id_product AND pl.id_lang = 1
WHERE p.active = 1;</code></pre>

        <h3>2.2. Subconsulta en FROM (Tabla Derivada)</h3>

        <pre><code class="language-sql">-- Top 5 categorías con más productos activos
SELECT 
    c.id_category,
    cl.name AS category_name,
    stats.total_products,
    stats.avg_price
FROM (
    SELECT 
        cp.id_category,
        COUNT(DISTINCT p.id_product) AS total_products,
        ROUND(AVG(p.price), 2) AS avg_price
    FROM ps_category_product cp
    INNER JOIN ps_product p ON cp.id_product = p.id_product
    WHERE p.active = 1
    GROUP BY cp.id_category
) AS stats
INNER JOIN ps_category c ON stats.id_category = c.id_category
INNER JOIN ps_category_lang cl ON c.id_category = cl.id_category AND cl.id_lang = 1
ORDER BY stats.total_products DESC
LIMIT 5;</code></pre>

        <h3>2.3. Subconsulta con IN</h3>

        <pre><code class="language-sql">-- Clientes que compraron productos de categoría "Electrónica" (id=3)
SELECT 
    c.id_customer,
    c.firstname,
    c.lastname,
    COUNT(DISTINCT o.id_order) AS total_orders
FROM ps_customer c
INNER JOIN ps_orders o ON c.id_customer = o.id_customer
WHERE o.id_order IN (
    SELECT DISTINCT od.id_order
    FROM ps_order_detail od
    INNER JOIN ps_category_product cp ON od.product_id = cp.id_product
    WHERE cp.id_category = 3
)
GROUP BY c.id_customer
ORDER BY total_orders DESC;</code></pre>

        <h2 class="section-title">3. Subconsultas Correlacionadas</h2>

        <p>Hacen referencia a columnas de la consulta externa. Se ejecutan <strong>una vez por cada fila</strong> de la consulta principal.</p>

        <h3>3.1. Subconsulta con EXISTS</h3>

        <pre><code class="language-sql">-- Productos NUNCA vendidos (más eficiente que IN)
SELECT 
    p.id_product,
    p.reference,
    pl.name,
    p.price,
    p.quantity
FROM ps_product p
INNER JOIN ps_product_lang pl ON p.id_product = pl.id_product AND pl.id_lang = 1
WHERE p.active = 1
    AND NOT EXISTS (
        SELECT 1
        FROM ps_order_detail od
        WHERE od.product_id = p.id_product  -- Correlación
    )
ORDER BY p.date_add DESC;</code></pre>

        <div class="alert alert-success">
            <strong>✅ EXISTS vs IN:</strong>
            <ul class="mb-0">
                <li><strong>EXISTS</strong> se detiene al encontrar la primera coincidencia</li>
                <li><strong>EXISTS</strong> devuelve TRUE/FALSE, no carga datos</li>
                <li><strong>IN</strong> carga todos los resultados en memoria</li>
            </ul>
        </div>

        <h3>3.2. Último Pedido de Cada Cliente</h3>

        <pre><code class="language-sql">-- Obtener el último pedido de cada cliente
SELECT 
    o.id_order,
    o.id_customer,
    CONCAT(c.firstname, ' ', c.lastname) AS customer_name,
    o.total_paid,
    o.date_add
FROM ps_orders o
INNER JOIN ps_customer c ON o.id_customer = c.id_customer
WHERE o.date_add = (
    SELECT MAX(o2.date_add)
    FROM ps_orders o2
    WHERE o2.id_customer = o.id_customer  -- Correlación
)
ORDER BY o.date_add DESC;</code></pre>

        <h2 class="section-title">4. Implementación en PHP 8.1+ con PrestaShop</h2>

        <pre><code class="language-php"><?php
// modules/mymodule/src/Repository/ProductRepository.php
declare(strict_types=1);

namespace MyModule\\Repository;

use Db;
use DbQuery;

class ProductRepository
{
    public function getNeverSoldProducts(int $idLang = 1, int $limit = 50): array
    {
        $query = new DbQuery();
        $query->select('p.id_product, p.reference, pl.name, p.price')
            ->from('product', 'p')
            ->innerJoin('product_lang', 'pl', 'p.id_product = pl.id_product AND pl.id_lang = ' . (int) $idLang)
            ->where('p.active = 1')
            ->where('NOT EXISTS (
                SELECT 1 FROM ' . _DB_PREFIX_ . 'order_detail od 
                WHERE od.product_id = p.id_product
            )')
            ->orderBy('p.date_add DESC')
            ->limit($limit);

        return Db::getInstance()->executeS($query);
    }

    public function getAbandonedCarts(): array
    {
        $sql = '
            SELECT c.id_customer, c.email, ca.id_cart, ca.date_upd
            FROM ' . _DB_PREFIX_ . 'customer c
            INNER JOIN ' . _DB_PREFIX_ . 'cart ca ON c.id_customer = ca.id_customer
            WHERE ca.date_upd >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                AND NOT EXISTS (
                    SELECT 1 FROM ' . _DB_PREFIX_ . 'orders o 
                    WHERE o.id_cart = ca.id_cart
                )
            ORDER BY ca.date_upd DESC';

        return Db::getInstance()->executeS($sql);
    }
}
</code></pre>

        <h2 class="section-title">5. Optimización de Subconsultas</h2>

        <h3>5.1. Convertir a JOINs Cuando Sea Posible</h3>

        <table class="table table-bordered">
            <thead class="table-dark">
                <tr>
                    <th width="50%">❌ Subconsulta</th>
                    <th width="50%">✅ JOIN</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <pre class="mb-0"><code class="language-sql">WHERE p.id_product IN (
  SELECT od.product_id
  FROM ps_order_detail od
  WHERE od.id_order = 100
)</code></pre>
                    </td>
                    <td>
                        <pre class="mb-0"><code class="language-sql">INNER JOIN ps_order_detail od 
  ON p.id_product = od.product_id
WHERE od.id_order = 100</code></pre>
                    </td>
                </tr>
            </tbody>
        </table>

        <h3>5.2. Índices para Subconsultas</h3>

        <pre><code class="language-sql">-- Índices recomendados
CREATE INDEX idx_product_id ON ps_order_detail(product_id);
CREATE INDEX idx_customer_date ON ps_orders(id_customer, date_add);
CREATE INDEX idx_category_product ON ps_category_product(id_category, id_product);</code></pre>

        <h2 class="section-title">6. Comparativa de Rendimiento</h2>

        <table class="table table-striped">
            <thead class="table-dark">
                <tr>
                    <th>Técnica</th>
                    <th>Rendimiento</th>
                    <th>Cuándo Usar</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Subconsulta No Correlacionada</strong></td>
                    <td>⚡⚡⚡ Bueno</td>
                    <td>Se ejecuta 1 vez, resultado pequeño</td>
                </tr>
                <tr>
                    <td><strong>Subconsulta Correlacionada</strong></td>
                    <td>⚡ Regular</td>
                    <td>Queries específicos, pocas filas</td>
                </tr>
                <tr>
                    <td><strong>JOIN</strong></td>
                    <td>⚡⚡⚡ Excelente</td>
                    <td>Alternativa preferida en mayoría de casos</td>
                </tr>
                <tr>
                    <td><strong>EXISTS</strong></td>
                    <td>⚡⚡⚡ Excelente</td>
                    <td>Verificar existencia sin cargar datos</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">7. Mejores Prácticas</h2>

        <div class="row">
            <div class="col-md-6">
                <div class="card border-success mb-3">
                    <div class="card-header bg-success text-white">✅ Hacer</div>
                    <div class="card-body">
                        <ul>
                            <li>Usar EXISTS en lugar de IN</li>
                            <li>Añadir índices en columnas correlacionadas</li>
                            <li>Analizar con EXPLAIN</li>
                            <li>Limitar resultados</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card border-danger mb-3">
                    <div class="card-header bg-danger text-white">❌ Evitar</div>
                    <div class="card-body">
                        <ul>
                            <li>Subconsultas correlacionadas en SELECT</li>
                            <li>IN con subconsultas grandes</li>
                            <li>Subconsultas sin índices</li>
                            <li>Múltiples niveles de anidación</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
`;

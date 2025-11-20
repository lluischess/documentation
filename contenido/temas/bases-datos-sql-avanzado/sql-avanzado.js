// @ts-nocheck
const sqlAvanzado = `
    <div class="content-section">
        <h1 id="sql-avanzado">SQL Avanzado</h1>
        <p>Dominar SQL permite realizar consultas complejas y reportes eficientes directamente desde la base de datos, minimizando el procesamiento en PHP.</p>

        <h2 class="section-title">1. Subconsultas</h2>
        <ul>
            <li><strong>No Correlacionadas:</strong> Se ejecutan una vez y su resultado se usa en la consulta externa.</li>
            <li><strong>Correlacionadas:</strong> Dependen de valores de la consulta externa y se ejecutan para cada fila.</li>
        </ul>
        <pre><code class="language-sql">-- Ejemplo de subconsulta correlacionada
SELECT p.name, p.price
FROM ps_product p
WHERE p.price > (
    SELECT AVG(price) FROM ps_product p2 WHERE p2.id_category_default = p.id_category_default
);</code></pre>

        <h2 class="section-title">2. CTEs (Common Table Expressions)</h2>
        <p>Permiten definir tablas temporales con nombre para simplificar consultas complejas. Las <strong>Recursive CTEs</strong> son ideales para recorrer jerarquías (categorías).</p>
        <pre><code class="language-sql">WITH RecursiveCategory AS (
    SELECT id_category, id_parent, name
    FROM ps_category_lang
    WHERE id_category = 1 -- Raíz
    UNION ALL
    SELECT c.id_category, c.id_parent, cl.name
    FROM ps_category c
    JOIN ps_category_lang cl ON c.id_category = cl.id_category
    JOIN RecursiveCategory rc ON c.id_parent = rc.id_category
)
SELECT * FROM RecursiveCategory;</code></pre>

        <h2 class="section-title">3. Funciones de Ventana (Window Functions)</h2>
        <p>Realizan cálculos a través de un conjunto de filas relacionadas con la fila actual (ej. \`ROW_NUMBER()\`, \`RANK()\`, \`LEAD()\`, \`LAG()\`).</p>
        <pre><code class="language-sql">SELECT 
    name, 
    price, 
    RANK() OVER (PARTITION BY id_category_default ORDER BY price DESC) as ranking_precio
FROM ps_product;</code></pre>

        <h2 class="section-title">4. Funciones Agregadas y GROUP BY</h2>
        <p>Uso avanzado de \`COUNT\`, \`SUM\`, \`AVG\` junto con \`HAVING\` para filtrar grupos.</p>

        <h2 class="section-title">5. Joins Complejos</h2>
        <ul>
            <li><strong>SELF JOIN:</strong> Unir una tabla consigo misma (ej. comparar productos).</li>
            <li><strong>CROSS JOIN:</strong> Producto cartesiano (todas las combinaciones posibles).</li>
            <li><strong>FULL OUTER JOIN:</strong> Filas de ambas tablas, coincidan o no (no soportado nativamente en MySQL, se simula con UNION de LEFT y RIGHT).</li>
        </ul>

        <h2 class="section-title">6. Transacciones y ACID</h2>
        <p>Garantizar la integridad de datos en operaciones múltiples.</p>
        <ul>
            <li><strong>Atomicity:</strong> Todo o nada.</li>
            <li><strong>Consistency:</strong> Datos válidos antes y después.</li>
            <li><strong>Isolation:</strong> Transacciones independientes.</li>
            <li><strong>Durability:</strong> Cambios permanentes tras commit.</li>
        </ul>
        <pre><code class="language-sql">START TRANSACTION;
INSERT INTO ps_orders ...;
INSERT INTO ps_order_detail ...;
UPDATE ps_stock_available ...;
COMMIT; -- O ROLLBACK si hay error</code></pre>

        <h2 class="section-title">7. Vistas</h2>
        <ul>
            <li><strong>Vistas Virtuales:</strong> Consultas guardadas que actúan como tablas. Simplifican el acceso a datos complejos.</li>
            <li><strong>Vistas Materializadas:</strong> Almacenan físicamente el resultado (no nativo en MySQL estándar, requiere emulación o herramientas externas) para alto rendimiento en reportes pesados.</li>
        </ul>
    </div>
`;

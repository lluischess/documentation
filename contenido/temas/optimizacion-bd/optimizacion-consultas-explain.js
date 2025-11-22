// @ts-nocheck
const optimizacionConsultasExplain = `
    <div class="content-section">
        <h1 id="optimizacion-consultas">Optimización de Consultas (EXPLAIN PLAN)</h1>
        <p>EXPLAIN PLAN es la herramienta fundamental para analizar y optimizar consultas SQL en PrestaShop 8.9+. Permite identificar cuellos de botella y optimizar el rendimiento de queries lentas.</p>

        <h2 class="section-title">1. Uso de EXPLAIN</h2>

        <pre><code class="language-sql">-- Analizar query
EXPLAIN SELECT p.*, pl.name
FROM ps_product p
INNER JOIN ps_product_lang pl ON p.id_product = pl.id_product
WHERE p.active = 1 AND pl.id_lang = 1;

-- EXPLAIN con formato mejorado (MySQL 8.0+)
EXPLAIN FORMAT=JSON SELECT * FROM ps_product WHERE id_product = 123;

-- EXPLAIN ANALYZE (ejecución real con tiempos)
EXPLAIN ANALYZE
SELECT * FROM ps_order WHERE id_customer = 10;</code></pre>

        <h2 class="section-title">2. Interpretar EXPLAIN</h2>

        <table class="table table-bordered">
            <thead class="table-dark">
                <tr>
                    <th>Columna</th>
                    <th>Significado</th>
                    <th>Valores Importantes</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>type</strong></td>
                    <td>Tipo de acceso</td>
                    <td>
                        <code>const</code> ✅ Mejor<br>
                        <code>eq_ref</code> ✅ Bueno<br>
                        <code>ref</code> ✅ Aceptable<br>
                        <code>range</code> ⚠️ Revisar<br>
                        <code>ALL</code> ❌ Malo (full scan)
                    </td>
                </tr>
                <tr>
                    <td><strong>possible_keys</strong></td>
                    <td>Índices disponibles</td>
                    <td>NULL = sin índices</td>
                </tr>
                <tr>
                    <td><strong>key</strong></td>
                    <td>Índice usado</td>
                    <td>NULL = no usa índices ❌</td>
                </tr>
                <tr>
                    <td><strong>rows</strong></td>
                    <td>Filas examinadas</td>
                    <td>Menor es mejor</td>
                </tr>
                <tr>
                    <td><strong>Extra</strong></td>
                    <td>Información adicional</td>
                    <td>
                        <code>Using where</code> ✅<br>
                        <code>Using index</code> ✅ Covering index<br>
                        <code>Using filesort</code> ⚠️<br>
                        <code>Using temporary</code> ⚠️
                    </td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">3. Optimizaciones Comunes</h2>

        <h3>3.1. Añadir Índices Faltantes</h3>

        <pre><code class="language-sql">-- ANTES (type = ALL, rows = 50000)
EXPLAIN SELECT * FROM ps_product WHERE active = 1;

-- Añadir índice
CREATE INDEX idx_active ON ps_product(active);

-- DESPUÉS (type = ref, rows = 25000)
EXPLAIN SELECT * FROM ps_product WHERE active = 1;

-- Índice compuesto para múltiples columnas
CREATE INDEX idx_active_category ON ps_product(active, id_category_default);
</code></pre>

        <h3>3.2. Evitar Funciones en WHERE</h3>

        <pre><code class="language-sql">-- ❌ MALO: No usa índices
SELECT * FROM ps_order WHERE YEAR(date_add) = 2024;

-- ✅ BUENO: Usa índices
SELECT * FROM ps_order 
WHERE date_add >= '2024-01-01' AND date_add < '2025-01-01';</code></pre>

        <h3>3.3. Optimizar JOINs</h3>

        <pre><code class="language-sql">-- ❌ MALO: JOIN sin índice
SELECT o.*, c.firstname
FROM ps_order o
JOIN ps_customer c ON o.id_customer = c.id_customer;

-- Verificar índices
SHOW INDEX FROM ps_order;
SHOW INDEX FROM ps_customer;

-- Añadir índices si faltan
CREATE INDEX idx_customer ON ps_order(id_customer);
</code></pre>

        <h2 class="section-title">4. Análisis en PrestaShop</h2>

        <pre><code class="language-php"><?php
// Activar profiling de queries
define('_PS_DEBUG_SQL_', true);

// Ver queries ejecutadas
$queries = Db::getInstance()->queries;
foreach ($queries as $query) {
    if ($query['time'] > 0.1) { // > 100ms
        echo "Slow Query: " . $query['query'] . "\\n";
        echo "Time: " . $query['time'] . "s\\n\\n";
    }
}

// Analizar query específica
$db = Db::getInstance();
$explain = $db->executeS('EXPLAIN SELECT * FROM ps_product WHERE active = 1');
print_r($explain);
</code></pre>

        <h2 class="section-title">5. Herramientas de Análisis</h2>

        <pre><code class="language-bash"># MySQL Slow Query Log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

# Analizar slow query log
mysqldumpslow -s t /var/log/mysql/slow-query.log | head -20

# pt-query-digest (Percona Toolkit)
pt-query-digest /var/log/mysql/slow-query.log
</code></pre>

        <h2 class="section-title">6. Mejores Prácticas</h2>

        <div class="row">
            <div class="col-md-6">
                <div class="card border-success mb-3">
                    <div class="card-header bg-success text-white">✅ Hacer</div>
                    <div class="card-body">
                        <ul>
                            <li>Usar EXPLAIN antes de optimizar</li>
                            <li>Añadir índices en columnas WHERE/JOIN</li>
                            <li>Limitar resultados con LIMIT</li>
                            <li>Usar índices covering cuando sea posible</li>
                            <li>Monitorizar queries > 100ms</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card border-danger mb-3">
                    <div class="card-header bg-danger text-white">❌ Evitar</div>
                    <div class="card-body">
                        <ul>
                            <li>SELECT * en queries críticas</li>
                            <li>Funciones en columnas indexadas</li>
                            <li>Subconsultas sin optimizar</li>
                            <li>JOINs sin índices</li>
                            <li>Full table scans en tablas grandes</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <div class="alert alert-info">
            <strong>🎯 Objetivo:</strong> Toda query en producción debe ejecutarse en < 100ms. Usar EXPLAIN para identificar y resolver cuellos de botella.
        </div>
    </div>
`;

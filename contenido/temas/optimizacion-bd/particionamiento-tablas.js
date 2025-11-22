// @ts-nocheck
const particionamientoTablas = `
    <div class="content-section">
        <h1 id="particionamiento-tablas">Particionamiento de Tablas</h1>
        <p>El particionamiento divide tablas grandes en segmentos más pequeños para mejorar rendimiento y mantenimiento en PrestaShop 8.9+. Especialmente útil para tablas históricas como pedidos y logs.</p>

        <h2 class="section-title">1. Tipos de Particionamiento</h2>

        <table class="table table-bordered">
            <thead class="table-dark">
                <tr>
                    <th>Tipo</th>
                    <th>Uso</th>
                    <th>Ejemplo PrestaShop</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>RANGE</strong></td>
                    <td>Por rangos de valores</td>
                    <td>Pedidos por fecha</td>
                </tr>
                <tr>
                    <td><strong>LIST</strong></td>
                    <td>Por lista de valores</td>
                    <td>Productos por categoría</td>
                </tr>
                <tr>
                    <td><strong>HASH</strong></td>
                    <td>Distribución uniforme</td>
                    <td>Clientes por ID</td>
                </tr>
                <tr>
                    <td><strong>KEY</strong></td>
                    <td>Similar a HASH, por columna</td>
                    <td>Sesiones por hash</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">2. Particionamiento por Rango (RANGE)</h2>

        <pre><code class="language-sql">-- Particionar tabla de pedidos por año
ALTER TABLE ps_orders
PARTITION BY RANGE (YEAR(date_add)) (
    PARTITION p2022 VALUES LESS THAN (2023),
    PARTITION p2023 VALUES LESS THAN (2024),
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- Particionar por mes
ALTER TABLE ps_connections
PARTITION BY RANGE (UNIX_TIMESTAMP(date_add)) (
    PARTITION p202401 VALUES LESS THAN (UNIX_TIMESTAMP('2024-02-01')),
    PARTITION p202402 VALUES LESS THAN (UNIX_TIMESTAMP('2024-03-01')),
    PARTITION p202403 VALUES LESS THAN (UNIX_TIMESTAMP('2024-04-01'))
);
</code></pre>

        <h2 class="section-title">3. Crear Tabla Particionada</h2>

        <pre><code class="language-sql">-- Tabla de logs particionada
CREATE TABLE ps_log_partitioned (
    id_log INT AUTO_INCREMENT,
    severity INT,
    message TEXT,
    date_add DATETIME NOT NULL,
    PRIMARY KEY (id_log, date_add)
) ENGINE=InnoDB
PARTITION BY RANGE (YEAR(date_add)) (
    PARTITION p2023 VALUES LESS THAN (2024),
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);
</code></pre>

        <h2 class="section-title">4. Gestión de Particiones</h2>

        <pre><code class="language-sql">-- Ver particiones existentes
SELECT 
    TABLE_NAME, 
    PARTITION_NAME, 
    TABLE_ROWS,
    DATA_LENGTH/1024/1024 AS size_mb
FROM information_schema.PARTITIONS
WHERE TABLE_NAME = 'ps_orders'
    AND TABLE_SCHEMA = 'prestashop';

-- Añadir nueva partición
ALTER TABLE ps_orders
ADD PARTITION (PARTITION p2025 VALUES LESS THAN (2026));

-- Eliminar partición antigua (con datos)
ALTER TABLE ps_orders
DROP PARTITION p2022;

-- Reorganizar partición
ALTER TABLE ps_orders
REORGANIZE PARTITION p_future INTO (
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);
</code></pre>

        <h2 class="section-title">5. Ejemplo: Tabla de Pedidos</h2>

        <pre><code class="language-sql">-- Convertir ps_orders a particionada (requiere clave primaria con date_add)
ALTER TABLE ps_orders DROP PRIMARY KEY;
ALTER TABLE ps_orders ADD PRIMARY KEY (id_order, date_add);

-- Particionar
ALTER TABLE ps_orders
PARTITION BY RANGE (YEAR(date_add)) (
    PARTITION p2020 VALUES LESS THAN (2021),
    PARTITION p2021 VALUES LESS THAN (2022),
    PARTITION p2022 VALUES LESS THAN (2023),
    PARTITION p2023 VALUES LESS THAN (2024),
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- Queries ahora solo escanean particiones relevantes
EXPLAIN PARTITIONS
SELECT * FROM ps_orders 
WHERE date_add >= '2024-01-01' AND date_add < '2025-01-01';
</code></pre>

        <h2 class="section-title">6. Mantenimiento Automatizado</h2>

        <pre><code class="language-bash">#!/bin/bash
# Script para añadir particiones automáticamente

YEAR=\$(date +%Y)
NEXT_YEAR=\$((YEAR + 1))

mysql -u root -p prestashop << EOF
ALTER TABLE ps_orders
ADD PARTITION (
    PARTITION p$NEXT_YEAR VALUES LESS THAN ($((NEXT_YEAR + 1)))
);

-- Eliminar particiones antiguas (> 3 años)
ALTER TABLE ps_orders DROP PARTITION p$((YEAR - 3));
EOF
</code></pre>

        <h2 class="section-title">7. Ventajas y Consideraciones</h2>

        <div class="row">
            <div class="col-md-6">
                <h4>✅ Ventajas</h4>
                <ul>
                    <li>Queries más rápidas (escaneo parcial)</li>
                    <li>Mantenimiento por partición</li>
                    <li>Eliminación rápida de datos antiguos</li>
                    <li>Mejor para tablas > 100GB</li>
                </ul>
            </div>
            <div class="col-md-6">
                <h4>⚠️ Consideraciones</h4>
                <ul>
                    <li>Clave primaria debe incluir columna de partición</li>
                    <li>No todas las FK son compatibles</li>
                    <li>Overhead en tablas pequeñas</li>
                    <li>Requiere MySQL 5.5+</li>
                </ul>
            </div>
        </div>

        <h2 class="section-title">8. Cuándo Particionar</h2>

        <div class="alert alert-info">
            <strong>📊 Candidatos Ideales para Particionamiento:</strong>
            <ul class="mb-0">
                <li><code>ps_orders</code> - Por fecha (RANGE)</li>
                <li><code>ps_connections</code> - Por fecha (RANGE)</li>
                <li><code>ps_log</code> - Por fecha (RANGE)</li>
                <li><code>ps_cart</code> - Por fecha (RANGE)</li>
                <li>Tablas > 50GB con queries por fecha/rango</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ No Particionar Si:</strong> Tabla < 10GB, queries no usan columna de partición, múltiples FKs complejas.
        </div>
    </div>
`;

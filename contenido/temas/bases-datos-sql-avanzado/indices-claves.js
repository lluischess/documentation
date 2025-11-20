// @ts-nocheck
const indicesClaves = `
    <div class="content-section">
        <h1 id="indices-claves">Índices y Claves (Primarias, Foráneas, Únicas)</h1>
        <p>Los índices y claves son elementos fundamentales en el diseño de bases de datos relacionales. En el contexto de PrestaShop 8.9+ y PHP 8.1+, comprender cómo utilizar correctamente estos mecanismos es esencial para garantizar la integridad de los datos y optimizar el rendimiento de las consultas.</p>

        <h2 class="section-title">1. Tipos de Claves en Bases de Datos</h2>

        <h3>1.1. Clave Primaria (Primary Key)</h3>
        <p>Identifica de forma única cada registro en una tabla. Características:</p>

        <table class="table table-bordered">
            <thead class="table-dark">
                <tr>
                    <th>Característica</th>
                    <th>Descripción</th>
                    <th>Ejemplo PrestaShop</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Unicidad</strong></td>
                    <td>No puede haber dos registros con el mismo valor</td>
                    <td><code>id_product</code> en ps_product</td>
                </tr>
                <tr>
                    <td><strong>No Nulo</strong></td>
                    <td>No puede contener valores NULL</td>
                    <td>Todos los id_* son NOT NULL</td>
                </tr>
                <tr>
                    <td><strong>Inmutabilidad</strong></td>
                    <td>El valor no debería cambiar una vez asignado</td>
                    <td>AUTO_INCREMENT garantiza esto</td>
                </tr>
                <tr>
                    <td><strong>Minimalidad</strong></td>
                    <td>Debe ser el conjunto mínimo de campos necesarios</td>
                    <td>Preferir INT sobre VARCHAR(255) compuesto</td>
                </tr>
            </tbody>
        </table>

        <h3>1.2. Implementación de Claves Primarias</h3>

        <div class="row">
            <div class="col-md-6">
                <div class="card mb-3">
                    <div class="card-header bg-success text-white">✅ Clave Primaria Simple (Recomendada)</div>
                    <div class="card-body">
                        <pre><code class="language-sql">-- PrestaShop estándar: ID autoincrementado
CREATE TABLE ps_product (
    id_product INT UNSIGNED AUTO_INCREMENT,
    reference VARCHAR(64),
    name VARCHAR(255),
    price DECIMAL(20,6),
    
    PRIMARY KEY (id_product),
    UNIQUE KEY reference (reference)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;</code></pre>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="card mb-3">
                    <div class="card-header bg-warning text-dark">⚠️ Clave Primaria Compuesta</div>
                    <div class="card-body">
                        <pre><code class="language-sql">-- Usada en tablas de asociación
CREATE TABLE ps_category_product (
    id_category INT UNSIGNED NOT NULL,
    id_product INT UNSIGNED NOT NULL,
    position INT UNSIGNED DEFAULT 0,
    
    PRIMARY KEY (id_category, id_product)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;</code></pre>
                    </div>
                </div>
            </div>
        </div>

        <h2 class="section-title">2. Claves Foráneas (Foreign Keys)</h2>

        <h3>2.1. Definición y Propósito</h3>
        <p>Las claves foráneas establecen y refuerzan relaciones entre tablas, garantizando la integridad referencial.</p>

        <pre><code class="language-sql">-- Sintaxis completa de clave foránea
CREATE TABLE ps_orders (
    id_order INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_customer INT UNSIGNED NOT NULL,
    id_cart INT UNSIGNED,
    total_paid DECIMAL(20,6) NOT NULL,
    date_add DATETIME NOT NULL,
    
    -- Clave foránea con acciones referenciales
    CONSTRAINT fk_order_customer
        FOREIGN KEY (id_customer) 
        REFERENCES ps_customer(id_customer)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_order_cart
        FOREIGN KEY (id_cart) 
        REFERENCES ps_cart(id_cart)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    
    INDEX idx_customer (id_customer),
    INDEX idx_cart (id_cart)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;</code></pre>

        <h3>2.2. Acciones Referenciales</h3>

        <table class="table table-striped">
            <thead class="table-dark">
                <tr>
                    <th>Acción</th>
                    <th>DELETE</th>
                    <th>UPDATE</th>
                    <th>Cuándo Usar</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><code>CASCADE</code></td>
                    <td>Elimina registros relacionados</td>
                    <td>Actualiza registros relacionados</td>
                    <td>Entidades dependientes (OrderDetail depende de Order)</td>
                </tr>
                <tr>
                    <td><code>SET NULL</code></td>
                    <td>Asigna NULL a la FK</td>
                    <td>Asigna NULL a la FK</td>
                    <td>Relaciones opcionales (Order.id_voucher puede ser NULL)</td>
                </tr>
                <tr>
                    <td><code>RESTRICT</code></td>
                    <td>Impide eliminación si hay referencias</td>
                    <td>Impide actualización si hay referencias</td>
                    <td>Evitar eliminación accidental (Customer con Orders)</td>
                </tr>
                <tr>
                    <td><code>NO ACTION</code></td>
                    <td>Similar a RESTRICT (diferido)</td>
                    <td>Similar a RESTRICT (diferido)</td>
                    <td>MySQL lo trata igual que RESTRICT</td>
                </tr>
                <tr>
                    <td><code>SET DEFAULT</code></td>
                    <td>Asigna valor por defecto</td>
                    <td>Asigna valor por defecto</td>
                    <td>Raramente usado (no soportado en InnoDB)</td>
                </tr>
            </tbody>
        </table>

        <h3>2.3. Ejemplo Práctico: Sistema de Pedidos</h3>

        <pre><code class="language-sql">-- Tabla de pedidos con múltiples claves foráneas
CREATE TABLE ps_order_detail (
    id_order_detail INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_order INT UNSIGNED NOT NULL,
    id_product INT UNSIGNED NOT NULL,
    id_product_attribute INT UNSIGNED DEFAULT 0,
    product_name VARCHAR(255),
    product_quantity INT UNSIGNED NOT NULL,
    product_price DECIMAL(20,6) NOT NULL,
    
    -- Si se elimina el pedido, se eliminan sus detalles
    CONSTRAINT fk_order_detail_order
        FOREIGN KEY (id_order)
        REFERENCES ps_orders(id_order)
        ON DELETE CASCADE
        ON UPDATE RESTRICT,
    
    -- Si se elimina el producto, se preserva el registro histórico
    CONSTRAINT fk_order_detail_product
        FOREIGN KEY (id_product)
        REFERENCES ps_product(id_product)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    
    INDEX idx_order (id_order),
    INDEX idx_product (id_product),
    INDEX idx_attribute (id_product_attribute)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;</code></pre>

        <h2 class="section-title">3. Claves Únicas (Unique Keys)</h2>

        <h3>3.1. Diferencias con Claves Primarias</h3>

        <table class="table table-bordered">
            <thead class="table-dark">
                <tr>
                    <th>Aspecto</th>
                    <th>Primary Key</th>
                    <th>Unique Key</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Cantidad por tabla</strong></td>
                    <td>Solo una</td>
                    <td>Múltiples permitidas</td>
                </tr>
                <tr>
                    <td><strong>Valores NULL</strong></td>
                    <td>No permitidos</td>
                    <td>Permitidos (solo uno en MySQL)</td>
                </tr>
                <tr>
                    <td><strong>Índice automático</strong></td>
                    <td>Sí (Clustered en InnoDB)</td>
                    <td>Sí (Non-clustered)</td>
                </tr>
                <tr>
                    <td><strong>Uso principal</strong></td>
                    <td>Identificador único de registro</td>
                    <td>Restricción de unicidad en campos de negocio</td>
                </tr>
            </tbody>
        </table>

        <h3>3.2. Implementación de Claves Únicas</h3>

        <pre><code class="language-sql">-- Múltiples restricciones UNIQUE en una tabla
CREATE TABLE ps_customer (
    id_customer INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    secure_key VARCHAR(32) NOT NULL,
    siret VARCHAR(14),
    ape VARCHAR(5),
    date_add DATETIME NOT NULL,
    
    -- Email debe ser único
    UNIQUE KEY email (email),
    
    -- Secure key debe ser única
    UNIQUE KEY secure_key (secure_key),
    
    -- Combinación de SIRET y APE única (para empresas francesas)
    UNIQUE KEY siret_ape (siret, ape),
    
    INDEX idx_date (date_add)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;</code></pre>

        <div class="alert alert-info">
            <strong>💡 Tip:</strong> En PrestaShop, muchas tablas multiidioma usan claves únicas compuestas para garantizar que solo haya una traducción por idioma:
            <pre class="mb-0"><code class="language-sql">CREATE TABLE ps_product_lang (
    id_product INT UNSIGNED NOT NULL,
    id_lang INT UNSIGNED NOT NULL,
    id_shop INT UNSIGNED DEFAULT 1,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    
    PRIMARY KEY (id_product, id_lang, id_shop),
    UNIQUE KEY product_lang (id_product, id_lang, id_shop)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;</code></pre>
        </div>

        <h2 class="section-title">4. Índices en Bases de Datos</h2>

        <h3>4.1. ¿Qué es un Índice?</h3>
        <p>Un índice es una estructura de datos que mejora la velocidad de las operaciones de recuperación de datos en una tabla a costa de espacio adicional y tiempo de escritura.</p>

        <h3>4.2. Tipos de Índices</h3>

        <table class="table table-striped">
            <thead class="table-dark">
                <tr>
                    <th>Tipo</th>
                    <th>Sintaxis MySQL</th>
                    <th>Descripción</th>
                    <th>Caso de Uso</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>PRIMARY KEY</strong></td>
                    <td><code>PRIMARY KEY</code></td>
                    <td>Índice único, no nulo, clustered en InnoDB</td>
                    <td>Identificador principal de la tabla</td>
                </tr>
                <tr>
                    <td><strong>UNIQUE INDEX</strong></td>
                    <td><code>UNIQUE KEY</code></td>
                    <td>Garantiza unicidad, permite NULL</td>
                    <td>Email, código de producto, referencia</td>
                </tr>
                <tr>
                    <td><strong>INDEX</strong></td>
                    <td><code>INDEX</code> / <code>KEY</code></td>
                    <td>Índice estándar, permite duplicados</td>
                    <td>Campos de búsqueda y filtrado frecuente</td>
                </tr>
                <tr>
                    <td><strong>FULLTEXT</strong></td>
                    <td><code>FULLTEXT</code></td>
                    <td>Para búsquedas de texto completo</td>
                    <td>Búsqueda en descripciones, contenido</td>
                </tr>
                <tr>
                    <td><strong>SPATIAL</strong></td>
                    <td><code>SPATIAL</code></td>
                    <td>Para datos geoespaciales</td>
                    <td>Coordenadas, mapas (poco usado en PS)</td>
                </tr>
            </tbody>
        </table>

        <h3>4.3. Índices Simples vs Compuestos</h3>

        <div class="row">
            <div class="col-md-6">
                <div class="card mb-3">
                    <div class="card-header bg-primary text-white">Índice Simple</div>
                    <div class="card-body">
                        <pre><code class="language-sql">-- Un solo campo
CREATE TABLE ps_product (
    id_product INT PRIMARY KEY,
    reference VARCHAR(64),
    active TINYINT(1) DEFAULT 1,
    
    INDEX idx_reference (reference),
    INDEX idx_active (active)
);</code></pre>
                        <p><strong>Uso:</strong> Búsqueda por un solo campo</p>
                        <pre><code class="language-sql">SELECT * FROM ps_product 
WHERE reference = 'PROD-001';</code></pre>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="card mb-3">
                    <div class="card-header bg-success text-white">Índice Compuesto</div>
                    <div class="card-body">
                        <pre><code class="language-sql">-- Múltiples campos (orden importa)
CREATE TABLE ps_product (
    id_product INT PRIMARY KEY,
    id_category_default INT,
    active TINYINT(1),
    
    INDEX idx_cat_active (id_category_default, active)
);</code></pre>
                        <p><strong>Uso:</strong> Consultas que filtran por ambos campos</p>
                        <pre><code class="language-sql">SELECT * FROM ps_product 
WHERE id_category_default = 3 
AND active = 1;</code></pre>
                    </div>
                </div>
            </div>
        </div>

        <h3>4.4. Regla del Prefijo Izquierdo (Leftmost Prefix)</h3>
        <div class="alert alert-warning">
            <strong>⚠️ Importante:</strong> En índices compuestos, el orden de las columnas es crucial.
            
            <pre><code class="language-sql">-- Índice en (col1, col2, col3)
INDEX idx_composite (col1, col2, col3)

-- ✅ Usa el índice completamente
SELECT * FROM table WHERE col1 = ? AND col2 = ? AND col3 = ?

-- ✅ Usa el índice (col1, col2)
SELECT * FROM table WHERE col1 = ? AND col2 = ?

-- ✅ Usa el índice (col1)
SELECT * FROM table WHERE col1 = ?

-- ❌ NO usa el índice (falta col1)
SELECT * FROM table WHERE col2 = ? AND col3 = ?

-- ❌ NO usa el índice (falta col1)
SELECT * FROM table WHERE col3 = ?</code></pre>
        </div>

        <h2 class="section-title">5. Diseño de Índices en PrestaShop</h2>

        <h3>5.1. Análisis de Tabla ps_product</h3>

        <pre><code class="language-sql">CREATE TABLE ps_product (
    id_product INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_supplier INT UNSIGNED DEFAULT 0,
    id_manufacturer INT UNSIGNED DEFAULT 0,
    id_category_default INT UNSIGNED,
    id_shop_default INT UNSIGNED DEFAULT 1,
    id_tax_rules_group INT UNSIGNED,
    reference VARCHAR(64),
    supplier_reference VARCHAR(64),
    ean13 VARCHAR(13),
    isbn VARCHAR(32),
    upc VARCHAR(12),
    mpn VARCHAR(40),
    active TINYINT(1) UNSIGNED DEFAULT 0,
    price DECIMAL(20,6) NOT NULL DEFAULT 0,
    date_add DATETIME NOT NULL,
    date_upd DATETIME NOT NULL,
    
    -- Índice clustered (automático con PRIMARY KEY)
    PRIMARY KEY (id_product),
    
    -- Índices para búsquedas frecuentes
    INDEX idx_supplier (id_supplier),
    INDEX idx_manufacturer (id_manufacturer),
    INDEX idx_category (id_category_default),
    
    -- Índices únicos para códigos de producto
    UNIQUE KEY reference (reference),
    UNIQUE KEY ean13 (ean13),
    UNIQUE KEY isbn (isbn),
    
    -- Índice compuesto para productos activos por tienda
    INDEX idx_shop_active (id_shop_default, active),
    
    -- Índice para ordenamiento por fecha
    INDEX idx_date_add (date_add),
    INDEX idx_date_upd (date_upd)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;</code></pre>

        <h3>5.2. Cuándo Crear Índices</h3>

        <table class="table table-bordered">
            <thead class="table-dark">
                <tr>
                    <th width="30%">Situación</th>
                    <th>Crear Índice</th>
                    <th>NO Crear Índice</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Columnas en WHERE</strong></td>
                    <td>✅ Si se usan frecuentemente en filtros</td>
                    <td>❌ Si se usan raramente</td>
                </tr>
                <tr>
                    <td><strong>Columnas en JOIN</strong></td>
                    <td>✅ Siempre (claves foráneas)</td>
                    <td>❌ Nunca omitir</td>
                </tr>
                <tr>
                    <td><strong>Columnas en ORDER BY</strong></td>
                    <td>✅ Si se ordena frecuentemente</td>
                    <td>❌ Si solo se ordena ocasionalmente</td>
                </tr>
                <tr>
                    <td><strong>Tablas pequeñas</strong></td>
                    <td>❌ Menos de 1000 registros</td>
                    <td>✅ Overhead no justificado</td>
                </tr>
                <tr>
                    <td><strong>Alta cardinalidad</strong></td>
                    <td>✅ Muchos valores únicos</td>
                    <td>❌ Pocos valores únicos (ej: género)</td>
                </tr>
                <tr>
                    <td><strong>Escritura frecuente</strong></td>
                    <td>⚠️ Evaluar costo de mantenimiento</td>
                    <td>✅ Si la tabla es de log/audit</td>
                </tr>
            </tbody>
        </table>

        <h3>5.3. Índices FULLTEXT para Búsqueda</h3>

        <pre><code class="language-sql">-- Búsqueda de texto completo en productos
CREATE TABLE ps_product_lang (
    id_product INT UNSIGNED NOT NULL,
    id_lang INT UNSIGNED NOT NULL,
    id_shop INT UNSIGNED DEFAULT 1,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    description_short TEXT,
    
    PRIMARY KEY (id_product, id_lang, id_shop),
    
    -- Índice FULLTEXT para búsqueda rápida
    FULLTEXT KEY idx_search (name, description, description_short)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Uso del índice FULLTEXT
SELECT p.id_product, pl.name, pl.description
FROM ps_product p
INNER JOIN ps_product_lang pl USING(id_product)
WHERE MATCH(pl.name, pl.description, pl.description_short) 
AGAINST ('smartphone android' IN NATURAL LANGUAGE MODE);

-- Modo booleano para búsquedas avanzadas
SELECT p.id_product, pl.name
FROM ps_product p
INNER JOIN ps_product_lang pl USING(id_product)
WHERE MATCH(pl.name) 
AGAINST ('+smartphone -apple' IN BOOLEAN MODE);</code></pre>

        <h2 class="section-title">6. Administración de Índices</h2>

        <h3>6.1. Agregar Índices a Tablas Existentes</h3>

        <pre><code class="language-sql">-- Agregar índice simple
ALTER TABLE ps_customer 
ADD INDEX idx_lastname (lastname);

-- Agregar índice compuesto
ALTER TABLE ps_orders 
ADD INDEX idx_customer_date (id_customer, date_add);

-- Agregar clave única
ALTER TABLE ps_product 
ADD UNIQUE KEY uk_mpn (mpn);

-- Agregar clave foránea
ALTER TABLE ps_orders 
ADD CONSTRAINT fk_order_customer 
    FOREIGN KEY (id_customer) 
    REFERENCES ps_customer(id_customer)
    ON DELETE RESTRICT;</code></pre>

        <h3>6.2. Eliminar Índices</h3>

        <pre><code class="language-sql">-- Eliminar índice por nombre
ALTER TABLE ps_customer 
DROP INDEX idx_lastname;

-- Eliminar clave única
ALTER TABLE ps_product 
DROP INDEX uk_mpn;

-- Eliminar clave foránea
ALTER TABLE ps_orders 
DROP FOREIGN KEY fk_order_customer;</code></pre>

        <h3>6.3. Visualizar Índices de una Tabla</h3>

        <pre><code class="language-sql">-- Ver todos los índices
SHOW INDEX FROM ps_product;

-- Ver estructura de la tabla incluyendo índices
SHOW CREATE TABLE ps_product;

-- Query para obtener información detallada
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX,
    NON_UNIQUE,
    CARDINALITY
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'prestashop'
  AND TABLE_NAME = 'ps_product'
ORDER BY INDEX_NAME, SEQ_IN_INDEX;</code></pre>

        <h2 class="section-title">7. Implementación en PrestaShop con ObjectModel</h2>

        <h3>7.1. Definición de Claves en Clase PHP</h3>

        <pre><code class="language-php"><?php
// classes/Product.php

class Product extends ObjectModel
{
    public static $definition = [
        'table' => 'product',
        'primary' => 'id_product', // Clave primaria
        'fields' => [
            'reference' => [
                'type' => self::TYPE_STRING,
                'validate' => 'isReference',
                'size' => 64,
                'unique' => true // Genera UNIQUE KEY
            ],
            'ean13' => [
                'type' => self::TYPE_STRING,
                'validate' => 'isEan13',
                'size' => 13,
                'unique' => true
            ],
            'id_category_default' => [
                'type' => self::TYPE_INT,
                'validate' => 'isUnsignedId',
                'required' => true,
                // La FK se define en el schema SQL, no aquí
            ]
        ]
    ];
}</code></pre>

        <h3>7.2. Creación de Tablas con Doctrine DBAL</h3>

        <pre><code class="language-php"><?php
// En un módulo: sql/install.php o método install()

use Doctrine\DBAL\Schema\Schema;

class MyModule extends Module
{
    public function install()
    {
        return parent::install() && $this->installTables();
    }
    
    private function installTables()
    {
        $sql = 'CREATE TABLE IF NOT EXISTS \`' . _DB_PREFIX_ . 'my_custom_table\` (
            \`id_custom\` INT UNSIGNED AUTO_INCREMENT,
            \`id_product\` INT UNSIGNED NOT NULL,
            \`custom_field\` VARCHAR(255) NOT NULL,
            \`active\` TINYINT(1) DEFAULT 1,
            \`date_add\` DATETIME NOT NULL,
            
            PRIMARY KEY (\`id_custom\`),
            
            CONSTRAINT \`fk_custom_product\`
                FOREIGN KEY (\`id_product\`)
                REFERENCES \`' . _DB_PREFIX_ . 'product\`(\`id_product\`)
                ON DELETE CASCADE,
            
            INDEX \`idx_product\` (\`id_product\`),
            INDEX \`idx_active_date\` (\`active\`, \`date_add\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;';
        
        return Db::getInstance()->execute($sql);
    }
}</code></pre>

        <h2 class="section-title">8. Optimización de Índices</h2>

        <h3>8.1. Análisis con EXPLAIN</h3>

        <pre><code class="language-sql">-- Verificar si un query usa índices
EXPLAIN SELECT * FROM ps_product 
WHERE id_category_default = 3 AND active = 1;

-- Resultado ideal:
--  type: ref
--  possible_keys: idx_cat_active
--  key: idx_cat_active
--  rows: pocos registros</code></pre>

        <h3>8.2. Mantenimiento de Índices</h3>

        <pre><code class="language-sql">-- Analizar tabla para actualizar estadísticas de índice
ANALYZE TABLE ps_product;

-- Optimizar tabla (reorganiza datos e índices)
OPTIMIZE TABLE ps_product;

-- Reparar tabla si hay corrupción de índices
REPAIR TABLE ps_product;</code></pre>

        <h2 class="section-title">9. Mejores Prácticas</h2>

        <table class="table table-striped">
            <thead class="table-dark">
                <tr>
                    <th width="30%">Práctica</th>
                    <th>Recomendación</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Claves primarias</strong></td>
                    <td>Usar INT UNSIGNED AUTO_INCREMENT en lugar de UUID o claves naturales compuestas</td>
                </tr>
                <tr>
                    <td><strong>Claves foráneas</strong></td>
                    <td>Siempre definirlas con ON DELETE y ON UPDATE apropiados</td>
                </tr>
                <tr>
                    <td><strong>Índices en FK</strong></td>
                    <td>Crear índice en todas las columnas de clave foránea para mejorar JOINs</td>
                </tr>
                <tr>
                    <td><strong>Orden en índices compuestos</strong></td>
                    <td>Columna más selectiva primero (mayor cardinalidad)</td>
                </tr>
                <tr>
                    <td><strong>Índices redundantes</strong></td>
                    <td>Evitar índices que sean prefijo de otros: (a) es redundante si existe (a,b)</td>
                </tr>
                <tr>
                    <td><strong>Tamaño de índice</strong></td>
                    <td>Usar prefijos en índices de VARCHAR largos: INDEX(name(50))</td>
                </tr>
                <tr>
                    <td><strong>Cobertura de índice</strong></td>
                    <td>Considerar incluir columnas SELECT en índice para covering index</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">10. Checklist de Verificación</h2>

        <ul>
            <li>✅ Cada tabla tiene una clave primaria bien definida</li>
            <li>✅ Todas las claves foráneas tienen índices</li>
            <li>✅ Columnas usadas frecuentemente en WHERE tienen índices</li>
            <li>✅ Índices compuestos siguen la regla del prefijo izquierdo</li>
            <li>✅ Acciones ON DELETE y ON UPDATE están correctamente definidas</li>
            <li>✅ No hay índices redundantes o duplicados</li>
            <li>✅ Tablas grandes están adecuadamente indexadas</li>
            <li>✅ Se usa EXPLAIN para verificar uso de índices en queries críticos</li>
        </ul>

        <h2 class="section-title">11. Recursos Adicionales</h2>
        <ul>
            <li><strong>MySQL Reference:</strong> <a href="https://dev.mysql.com/doc/refman/8.0/en/optimization-indexes.html" target="_blank">Index Optimization</a></li>
            <li><strong>InnoDB Storage Engine:</strong> <a href="https://dev.mysql.com/doc/refman/8.0/en/innodb-storage-engine.html" target="_blank">InnoDB Documentation</a></li>
            <li><strong>PrestaShop Schema:</strong> Estudiar <code>install/data/db_structure.sql</code> para ejemplos reales</li>
        </ul>
    </div>
    `;

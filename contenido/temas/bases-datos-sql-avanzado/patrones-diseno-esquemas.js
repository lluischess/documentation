// @ts-nocheck
const patronesDisenoEsquemas = `
    <div class="content-section">
        <h1 id="patrones-diseno-esquemas">Patrones de Diseño de Esquemas (EAV, Adjacency List)</h1>
        <p>Los patrones de diseño de esquemas de bases de datos son soluciones probadas para problemas comunes en el modelado de datos. En el contexto de PrestaShop 8.9+ y PHP 8.1+, comprender estos patrones es fundamental para diseñar módulos escalables y mantener la flexibilidad del sistema.</p>

        <h2 class="section-title">1. Patrón EAV (Entity-Attribute-Value)</h2>

        <h3>1.1. Conceptos Básicos del Patrón EAV</h3>
        <p>El modelo EAV permite almacenar atributos dinámicos sin modificar el esquema de la base de datos. Es especialmente útil cuando las entidades pueden tener un número variable de atributos.</p>

        <div class="row">
            <div class="col-md-6">
                <div class="card mb-3">
                    <div class="card-header bg-danger text-white">❌ Modelo Tradicional (Rígido)</div>
                    <div class="card-body">
                        <pre><code class="language-sql">-- Una columna por atributo
CREATE TABLE product (
    id_product INT PRIMARY KEY,
    name VARCHAR(255),
    color VARCHAR(50),
    size VARCHAR(10),
    weight DECIMAL(10,2),
    material VARCHAR(100),
    battery_capacity INT,
    screen_size DECIMAL(4,2),
    -- ¿Y si necesitamos más atributos?
    -- Debemos modificar el esquema
);</code></pre>
                        <p class="text-danger"><strong>Problema:</strong> Muchas columnas NULL para productos que no usan ciertos atributos.</p>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="card mb-3">
                    <div class="card-header bg-success text-white">✅ Modelo EAV (Flexible)</div>
                    <div class="card-body">
                        <pre><code class="language-sql">-- Tablas EAV
CREATE TABLE product (
    id_product INT PRIMARY KEY,
    name VARCHAR(255)
);

CREATE TABLE product_attribute (
    id_product INT,
    attribute_key VARCHAR(50),
    attribute_value TEXT,
    PRIMARY KEY (id_product, attribute_key)
);</code></pre>
                        <p class="text-success"><strong>Ventaja:</strong> Agregar nuevos atributos sin cambiar el esquema.</p>
                    </div>
                </div>
            </div>
        </div>

        <h3>1.2. Estructura Completa del Patrón EAV</h3>

        <pre><code class="language-sql">-- 1. Tabla de entidades principales
CREATE TABLE ps_eav_entity (
    id_entity INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL, -- 'product', 'customer', etc.
    date_add DATETIME NOT NULL,
    date_upd DATETIME NOT NULL,
    
    INDEX idx_type (entity_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Definición de atributos (metadatos)
CREATE TABLE ps_eav_attribute (
    id_attribute INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    attribute_code VARCHAR(50) NOT NULL UNIQUE,
    attribute_label VARCHAR(255) NOT NULL,
    attribute_type ENUM('varchar', 'int', 'decimal', 'text', 'datetime') NOT NULL,
    is_required TINYINT(1) DEFAULT 0,
    default_value VARCHAR(255),
    
    INDEX idx_code (attribute_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Valores VARCHAR
CREATE TABLE ps_eav_value_varchar (
    value_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_entity INT UNSIGNED NOT NULL,
    id_attribute INT UNSIGNED NOT NULL,
    value VARCHAR(255),
    
    UNIQUE KEY unique_entity_attr (id_entity, id_attribute),
    
    FOREIGN KEY (id_entity) REFERENCES ps_eav_entity(id_entity) ON DELETE CASCADE,
    FOREIGN KEY (id_attribute) REFERENCES ps_eav_attribute(id_attribute) ON DELETE CASCADE,
    
    INDEX idx_entity (id_entity),
    INDEX idx_attribute (id_attribute),
    INDEX idx_value (value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Valores INT
CREATE TABLE ps_eav_value_int (
    value_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_entity INT UNSIGNED NOT NULL,
    id_attribute INT UNSIGNED NOT NULL,
    value INT,
    
    UNIQUE KEY unique_entity_attr (id_entity, id_attribute),
    
    FOREIGN KEY (id_entity) REFERENCES ps_eav_entity(id_entity) ON DELETE CASCADE,
    FOREIGN KEY (id_attribute) REFERENCES ps_eav_attribute(id_attribute) ON DELETE CASCADE,
    
    INDEX idx_entity (id_entity),
    INDEX idx_value (value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Valores DECIMAL
CREATE TABLE ps_eav_value_decimal (
    value_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_entity INT UNSIGNED NOT NULL,
    id_attribute INT UNSIGNED NOT NULL,
    value DECIMAL(20,6),
    
    UNIQUE KEY unique_entity_attr (id_entity, id_attribute),
    
    FOREIGN KEY (id_entity) REFERENCES ps_eav_entity(id_entity) ON DELETE CASCADE,
    FOREIGN KEY (id_attribute) REFERENCES ps_eav_attribute(id_attribute) ON DELETE CASCADE,
    
    INDEX idx_entity (id_entity),
    INDEX idx_value (value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Valores TEXT
CREATE TABLE ps_eav_value_text (
    value_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_entity INT UNSIGNED NOT NULL,
    id_attribute INT UNSIGNED NOT NULL,
    value TEXT,
    
    UNIQUE KEY unique_entity_attr (id_entity, id_attribute),
    
    FOREIGN KEY (id_entity) REFERENCES ps_eav_entity(id_entity) ON DELETE CASCADE,
    FOREIGN KEY (id_attribute) REFERENCES ps_eav_attribute(id_attribute) ON DELETE CASCADE,
    
    INDEX idx_entity (id_entity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;</code></pre>

        <h3>1.3. Implementación en PrestaShop: Product Features</h3>
        <p>PrestaShop ya utiliza un patrón EAV para las características de productos:</p>

        <pre><code class="language-sql">-- Entidades: Productos
ps_product (id_product, name, ...)

-- Atributos: Definiciones de características
CREATE TABLE ps_feature (
    id_feature INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    position INT UNSIGNED NOT NULL DEFAULT 0,
    
    INDEX idx_position (position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE ps_feature_lang (
    id_feature INT UNSIGNED NOT NULL,
    id_lang INT UNSIGNED NOT NULL,
    name VARCHAR(128),
    
    PRIMARY KEY (id_feature, id_lang)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Valores: Valores de características
CREATE TABLE ps_feature_value (
    id_feature_value INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_feature INT UNSIGNED NOT NULL,
    custom TINYINT(1) DEFAULT 0,
    
    FOREIGN KEY (id_feature) REFERENCES ps_feature(id_feature) ON DELETE CASCADE,
    INDEX idx_feature (id_feature)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE ps_feature_value_lang (
    id_feature_value INT UNSIGNED NOT NULL,
    id_lang INT UNSIGNED NOT NULL,
    value VARCHAR(255),
    
    PRIMARY KEY (id_feature_value, id_lang)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Relación: Producto ↔ Característica
CREATE TABLE ps_feature_product (
    id_feature INT UNSIGNED NOT NULL,
    id_product INT UNSIGNED NOT NULL,
    id_feature_value INT UNSIGNED NOT NULL,
    
    PRIMARY KEY (id_feature, id_product, id_feature_value),
    
    FOREIGN KEY (id_feature) REFERENCES ps_feature(id_feature) ON DELETE CASCADE,
    FOREIGN KEY (id_product) REFERENCES ps_product(id_product) ON DELETE CASCADE,
    FOREIGN KEY (id_feature_value) REFERENCES ps_feature_value(id_feature_value) ON DELETE CASCADE,
    
    KEY id_feature_value (id_feature_value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;</code></pre>

        <h3>1.4. Consultas sobre Datos EAV</h3>

        <div class="alert alert-warning">
            <strong>⚠️ Desafío:</strong> Las consultas sobre datos EAV son más complejas que sobre esquemas tradicionales.
        </div>

        <pre><code class="language-sql">-- Obtener todas las características de un producto
SELECT 
    fl.name AS feature_name,
    fvl.value AS feature_value
FROM ps_feature_product fp
INNER JOIN ps_feature_lang fl ON fp.id_feature = fl.id_feature
INNER JOIN ps_feature_value_lang fvl ON fp.id_feature_value = fvl.id_feature_value
WHERE fp.id_product = 1
  AND fl.id_lang = 1
  AND fvl.id_lang = 1;

-- Buscar productos por característica específica
SELECT DISTINCT p.id_product, pl.name
FROM ps_product p
INNER JOIN ps_product_lang pl ON p.id_product = pl.id_product
INNER JOIN ps_feature_product fp ON p.id_product = fp.id_product
INNER JOIN ps_feature_lang fl ON fp.id_feature = fl.id_feature
INNER JOIN ps_feature_value_lang fvl ON fp.id_feature_value = fvl.id_feature_value
WHERE fl.name = 'Color'
  AND fvl.value = 'Rojo'
  AND pl.id_lang = 1;

-- Producto con múltiples características
SELECT p.id_product, pl.name
FROM ps_product p
INNER JOIN ps_product_lang pl ON p.id_product = pl.id_product
WHERE EXISTS (
    SELECT 1 FROM ps_feature_product fp1
    INNER JOIN ps_feature_lang fl1 ON fp1.id_feature = fl1.id_feature
    INNER JOIN ps_feature_value_lang fvl1 ON fp1.id_feature_value = fvl1.id_feature_value
    WHERE fp1.id_product = p.id_product
      AND fl1.name = 'Color' AND fvl1.value = 'Rojo'
)
AND EXISTS (
    SELECT 1 FROM ps_feature_product fp2
    INNER JOIN ps_feature_lang fl2 ON fp2.id_feature = fl2.id_feature
    INNER JOIN ps_feature_value_lang fvl2 ON fp2.id_feature_value = fvl2.id_feature_value
    WHERE fp2.id_product = p.id_product
      AND fl2.name = 'Tamaño' AND fvl2.value = 'Grande'
);</code></pre>

        <h3>1.5. Ventajas y Desventajas del Patrón EAV</h3>

        <table class="table table-bordered">
            <thead class="table-dark">
                <tr>
                    <th>Ventajas ✅</th>
                    <th>Desventajas ❌</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Esquema flexible sin modificaciones</td>
                    <td>Consultas complejas y lentas</td>
                </tr>
                <tr>
                    <td>Agregar atributos sin downtime</td>
                    <td>Difícil validar tipos de datos</td>
                </tr>
                <tr>
                    <td>Ideal para catálogos de productos variables</td>
                    <td>No se pueden usar índices efectivamente</td>
                </tr>
                <tr>
                    <td>Ahorra espacio (no hay columnas NULL)</td>
                    <td>No hay integridad referencial natural</td>
                </tr>
                <tr>
                    <td>Multiidioma fácilmente implementable</td>
                    <td>Requiere múltiples JOINs</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">2. Patrón Adjacency List (Lista de Adyacencia)</h2>

        <h3>2.1. Conceptos Básicos</h3>
        <p>La lista de adyacencia es un patrón para representar estructuras jerárquicas (árboles) donde cada nodo conoce a su padre directo.</p>

        <pre><code class="language-sql">-- Estructura básica de Adjacency List
CREATE TABLE ps_category (
    id_category INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_parent INT UNSIGNED NOT NULL DEFAULT 0,
    level_depth TINYINT(3) UNSIGNED NOT NULL DEFAULT 0,
    active TINYINT(1) UNSIGNED NOT NULL DEFAULT 0,
    position INT UNSIGNED NOT NULL DEFAULT 0,
    date_add DATETIME NOT NULL,
    date_upd DATETIME NOT NULL,
    
    INDEX idx_parent (id_parent),
    INDEX idx_level (level_depth),
    INDEX idx_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE ps_category_lang (
    id_category INT UNSIGNED NOT NULL,
    id_lang INT UNSIGNED NOT NULL,
    id_shop INT UNSIGNED DEFAULT 1,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    link_rewrite VARCHAR(128) NOT NULL,
    
    PRIMARY KEY (id_category, id_lang, id_shop),
    
    FOREIGN KEY (id_category) REFERENCES ps_category(id_category) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;</code></pre>

        <h3>2.2. Ejemplo de Jerarquía de Categorías</h3>

        <pre><code class="language-plaintext">Categorías PrestaShop (Adjacency List)

id_category | id_parent | name           | level_depth
------------|-----------|----------------|------------
1           | 0         | Root           | 0
2           | 1         | Home           | 1
3           | 2         | Ropa           | 2
4           | 3         | Hombre         | 3
5           | 3         | Mujer          | 3
6           | 4         | Camisetas      | 4
7           | 4         | Pantalones     | 4
8           | 2         | Electrónica    | 2
9           | 8         | Móviles        | 3
10          | 8         | Portátiles     | 3

Representación en árbol:
Root (1)
└─ Home (2)
   ├─ Ropa (3)
   │  ├─ Hombre (4)
   │  │  ├─ Camisetas (6)
   │  │  └─ Pantalones (7)
   │  └─ Mujer (5)
   └─ Electrónica (8)
      ├─ Móviles (9)
      └─ Portátiles (10)</code></pre>

        <h3>2.3. Consultas Comunes en Adjacency List</h3>

        <pre><code class="language-sql">-- 1. Obtener hijos directos de una categoría
SELECT c.id_category, cl.name
FROM ps_category c
INNER JOIN ps_category_lang cl ON c.id_category = cl.id_category
WHERE c.id_parent = 3 -- Hijos de "Ropa"
  AND cl.id_lang = 1
ORDER BY c.position;

-- 2. Obtener la ruta completa de una categoría (breadcrumb)
-- Requiere recursividad o múltiples niveles de JOIN

-- Opción 1: Usando CTE recursivo (MySQL 8.0+)
WITH RECURSIVE category_path AS (
    -- Caso base: categoría actual
    SELECT 
        c.id_category,
        c.id_parent,
        cl.name,
        c.level_depth,
        CAST(cl.name AS CHAR(1000)) AS path
    FROM ps_category c
    INNER JOIN ps_category_lang cl ON c.id_category = cl.id_category
    WHERE c.id_category = 6 -- Camisetas
      AND cl.id_lang = 1
    
    UNION ALL
    
    -- Caso recursivo: padres sucesivos
    SELECT 
        parent.id_category,
        parent.id_parent,
        parent_lang.name,
        parent.level_depth,
        CONCAT(parent_lang.name, ' > ', cp.path)
    FROM ps_category parent
    INNER JOIN ps_category_lang parent_lang 
        ON parent.id_category = parent_lang.id_category
    INNER JOIN category_path cp 
        ON parent.id_category = cp.id_parent
    WHERE parent_lang.id_lang = 1
)
SELECT path FROM category_path
WHERE id_parent = 0;
-- Resultado: "Home > Ropa > Hombre > Camisetas"

-- Opción 2: JOINs múltiples (limitado a profundidad conocida)
SELECT 
    CONCAT_WS(' > ', 
        c4.name, c3.name, c2.name, c1.name
    ) AS breadcrumb
FROM ps_category c1
LEFT JOIN ps_category c2 ON c1.id_parent = c2.id_category
LEFT JOIN ps_category c3 ON c2.id_parent = c3.id_category
LEFT JOIN ps_category c4 ON c3.id_parent = c4.id_category
INNER JOIN ps_category_lang cl1 ON c1.id_category = cl1.id_category
LEFT JOIN ps_category_lang cl2 ON c2.id_category = cl2.id_category AND cl2.id_lang = 1
LEFT JOIN ps_category_lang cl3 ON c3.id_category = cl3.id_category AND cl3.id_lang = 1
LEFT JOIN ps_category_lang cl4 ON c4.id_category = cl4.id_category AND cl4.id_lang = 1
WHERE c1.id_category = 6
  AND cl1.id_lang = 1;

-- 3. Obtener todos los descendientes de una categoría
WITH RECURSIVE descendants AS (
    SELECT id_category, id_parent, level_depth
    FROM ps_category
    WHERE id_category = 3 -- "Ropa"
    
    UNION ALL
    
    SELECT c.id_category, c.id_parent, c.level_depth
    FROM ps_category c
    INNER JOIN descendants d ON c.id_parent = d.id_category
)
SELECT d.id_category, cl.name, d.level_depth
FROM descendants d
INNER JOIN ps_category_lang cl ON d.id_category = cl.id_category
WHERE cl.id_lang = 1
ORDER BY d.level_depth, cl.name;

-- 4. Contar productos en categoría y subcategorías
WITH RECURSIVE all_categories AS (
    SELECT id_category FROM ps_category WHERE id_category = 3
    UNION ALL
    SELECT c.id_category 
    FROM ps_category c
    INNER JOIN all_categories ac ON c.id_parent = ac.id_category
)
SELECT COUNT(DISTINCT cp.id_product) AS total_products
FROM ps_category_product cp
WHERE cp.id_category IN (SELECT id_category FROM all_categories);</code></pre>

        <h3>2.4. Operaciones de Mantenimiento</h3>

        <pre><code class="language-sql">-- Mover una categoría a otro padre
UPDATE ps_category 
SET id_parent = 5,  -- Nuevo padre
    level_depth = (SELECT level_depth FROM ps_category WHERE id_category = 5) + 1
WHERE id_category = 7; -- Categoría a mover

-- Actualizar level_depth de todos los descendientes (requiere procedimiento)
DELIMITER $$
CREATE PROCEDURE update_category_depth()
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE cat_id INT;
    DECLARE cur CURSOR FOR SELECT id_category FROM ps_category WHERE id_parent > 0;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;
    
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO cat_id;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        UPDATE ps_category c
        SET c.level_depth = (
            SELECT parent.level_depth + 1
            FROM ps_category parent
            WHERE parent.id_category = c.id_parent
        )
        WHERE c.id_category = cat_id;
    END LOOP;
    
    CLOSE cur;
END$$
DELIMITER ;

CALL update_category_depth();</code></pre>

        <h3>2.5. Ventajas y Desventajas de Adjacency List</h3>

        <table class="table table-bordered">
            <thead class="table-dark">
                <tr>
                    <th>Ventajas ✅</th>
                    <th>Desventajas ❌</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Estructura simple e intuitiva</td>
                    <td>Consultas recursivas complejas</td>
                </tr>
                <tr>
                    <td>Fácil insertar/eliminar nodos</td>
                    <td>Obtener árbol completo requiere recursión</td>
                </tr>
                <tr>
                    <td>Mover subárboles es sencillo</td>
                    <td>Costoso en profundidad desconocida</td>
                </tr>
                <tr>
                    <td>Espacio de almacenamiento mínimo</td>
                    <td>No apto para árboles muy profundos</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">3. Patrón Nested Set (Conjunto Anidado)</h2>

        <h3>3.1. Alternativa a Adjacency List</h3>
        <p>PrestaShop también usa Nested Set para optimizar consultas sobre categorías:</p>

        <pre><code class="language-sql">-- Nested Set añade columnas nleft y nright
ALTER TABLE ps_category
ADD COLUMN nleft INT UNSIGNED NOT NULL DEFAULT 0,
ADD COLUMN nright INT UNSIGNED NOT NULL DEFAULT 0,
ADD INDEX idx_nested (nleft, nright);

-- Ejemplo de valores Nested Set
id_category | name        | nleft | nright | id_parent
------------|-------------|-------|--------|----------
1           | Root        | 1     | 20     | 0
2           | Home        | 2     | 19     | 1
3           | Ropa        | 3     | 12     | 2
4           | Hombre      | 4     | 9      | 3
6           | Camisetas   | 5     | 6      | 4
7           | Pantalones  | 7     | 8      | 4
5           | Mujer       | 10    | 11     | 3
8           | Electrónica | 13    | 18     | 2
9           | Móviles     | 14    | 15     | 8
10          | Portátiles  | 16    | 17     | 8</code></pre>

        <h3>3.2. Consultas Eficientes con Nested Set</h3>

        <pre><code class="language-sql">-- Obtener todos los descendientes (un solo query)
SELECT child.id_category, child.name
FROM ps_category parent
INNER JOIN ps_category child ON child.nleft BETWEEN parent.nleft AND parent.nright
INNER JOIN ps_category_lang cl ON child.id_category = cl.id_category
WHERE parent.id_category = 3 -- "Ropa"
  AND cl.id_lang = 1
ORDER BY child.nleft;

-- Obtener path completo
SELECT parent.id_category, pl.name
FROM ps_category parent
INNER JOIN ps_category child ON child.nleft BETWEEN parent.nleft AND parent.nright
INNER JOIN ps_category_lang pl ON parent.id_category = pl.id_category
WHERE child.id_category = 6 -- "Camisetas"
  AND pl.id_lang = 1
ORDER BY parent.nleft;

-- Contar descendientes
SELECT parent.id_category, (parent.nright - parent.nleft - 1) / 2 AS descendants_count
FROM ps_category parent
WHERE parent.id_category = 3;</code></pre>

        <h3>3.3. Comparación de Patrones Jerárquicos</h3>

        <table class="table table-striped">
            <thead class="table-dark">
                <tr>
                    <th>Aspecto</th>
                    <th>Adjacency List</th>
                    <th>Nested Set</th>
                    <th>Closure Table</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Lectura de árbol</strong></td>
                    <td>❌ Lento (recursivo)</td>
                    <td>✅ Rápido (un query)</td>
                    <td>✅ Rápido</td>
                </tr>
                <tr>
                    <td><strong>Inserción</strong></td>
                    <td>✅ Muy rápido</td>
                    <td>❌ Lento (recalcular)</td>
                    <td>⚠️ Moderado</td>
                </tr>
                <tr>
                    <td><strong>Eliminación</strong></td>
                    <td>✅ Rápido</td>
                    <td>❌ Lento (recalcular)</td>
                    <td>✅ Rápido</td>
                </tr>
                <tr>
                    <td><strong>Mover nodos</strong></td>
                    <td>✅ Muy fácil</td>
                    <td>❌ Muy difícil</td>
                    <td>⚠️ Moderado</td>
                </tr>
                <tr>
                    <td><strong>Complejidad</strong></td>
                    <td>Simple</td>
                    <td>Compleja</td>
                    <td>Moderada</td>
                </tr>
                <tr>
                    <td><strong>Espacio</strong></td>
                    <td>Mínimo</td>
                    <td>Mínimo</td>
                    <td>❌ Mayor</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">4. Patrón Closure Table</h2>

        <h3>4.1. Estructura de Closure Table</h3>

        <pre><code class="language-sql">-- Tabla principal
CREATE TABLE ps_category (
    id_category INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    active TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de cierre (almacena todas las relaciones ancestro-descendiente)
CREATE TABLE ps_category_closure (
    ancestor INT UNSIGNED NOT NULL,
    descendant INT UNSIGNED NOT NULL,
    depth INT UNSIGNED NOT NULL,
    
    PRIMARY KEY (ancestor, descendant),
    
    FOREIGN KEY (ancestor) REFERENCES ps_category(id_category) ON DELETE CASCADE,
    FOREIGN KEY (descendant) REFERENCES ps_category(id_category) ON DELETE CASCADE,
    
    INDEX idx_descendant (descendant),
    INDEX idx_depth (depth)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Datos de ejemplo
INSERT INTO ps_category_closure (ancestor, descendant, depth) VALUES
-- Root se relaciona consigo mismo y todos los demás
(1, 1, 0), -- Root
(1, 2, 1), (2, 2, 0), -- Home
(1, 3, 2), (2, 3, 1), (3, 3, 0), -- Ropa
(1, 4, 3), (2, 4, 2), (3, 4, 1), (4, 4, 0), -- Hombre
(1, 6, 4), (2, 6, 3), (3, 6, 2), (4, 6, 1), (6, 6, 0); -- Camisetas</code></pre>

        <h3>4.2. Consultas con Closure Table</h3>

        <pre><code class="language-sql">-- Obtener todos los descendientes
SELECT c.id_category, c.name, cc.depth
FROM ps_category c
INNER JOIN ps_category_closure cc ON c.id_category = cc.descendant
WHERE cc.ancestor = 3 -- Ropa
  AND cc.depth > 0 -- Excluir el nodo mismo
ORDER BY cc.depth;

-- Obtener todos los ancestros (breadcrumb)
SELECT c.id_category, c.name, cc.depth
FROM ps_category c
INNER JOIN ps_category_closure cc ON c.id_category = cc.ancestor
WHERE cc.descendant = 6 -- Camisetas
ORDER BY cc.depth DESC;

-- Obtener solo hijos directos
SELECT c.id_category, c.name
FROM ps_category c
INNER JOIN ps_category_closure cc ON c.id_category = cc.descendant
WHERE cc.ancestor = 3
  AND cc.depth = 1;

-- Insertar nueva categoría
-- Ejemplo: Agregar "Zapatos" (id=11) bajo "Hombre" (id=4)
INSERT INTO ps_category_closure (ancestor, descendant, depth)
SELECT ancestor, 11, depth + 1
FROM ps_category_closure
WHERE descendant = 4
UNION ALL
SELECT 11, 11, 0;

-- Eliminar categoría (CASCADE lo hace automáticamente)
DELETE FROM ps_category WHERE id_category = 11;

-- Mover categoría (más complejo, requiere eliminar y reinsertar)
-- Mover "Pantalones" (7) de "Hombre" (4) a "Mujer" (5)
DELETE FROM ps_category_closure
WHERE descendant IN (
    SELECT descendant FROM ps_category_closure WHERE ancestor = 7
)
AND ancestor IN (
    SELECT ancestor FROM ps_category_closure WHERE descendant = 7 AND ancestor != 7
);

INSERT INTO ps_category_closure (ancestor, descendant, depth)
SELECT super.ancestor, sub.descendant, super.depth + sub.depth + 1
FROM ps_category_closure super
CROSS JOIN ps_category_closure sub
WHERE super.descendant = 5  -- Nuevo padre
  AND sub.ancestor = 7;</code></pre>

        <h2 class="section-title">5. Otros Patrones Útiles</h2>

        <h3>5.1. Patrón Polymorphic Associations</h3>

        <pre><code class="language-sql">-- Tabla de comentarios que puede asociarse a múltiples entidades
CREATE TABLE ps_comment (
    id_comment INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    commentable_type VARCHAR(50) NOT NULL, -- 'Product', 'BlogPost', etc.
    commentable_id INT UNSIGNED NOT NULL,
    id_customer INT UNSIGNED NOT NULL,
    content TEXT NOT NULL,
    date_add DATETIME NOT NULL,
    
    INDEX idx_commentable (commentable_type, commentable_id),
    INDEX idx_customer (id_customer)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Uso
INSERT INTO ps_comment (commentable_type, commentable_id, id_customer, content, date_add)
VALUES ('Product', 123, 456, 'Gran producto!', NOW());

INSERT INTO ps_comment (commentable_type, commentable_id, id_customer, content, date_add)
VALUES ('BlogPost', 789, 456, 'Interesante artículo', NOW());</code></pre>

        <h3>5.2. Patrón Single Table Inheritance</h3>

        <pre><code class="language-sql">-- Una tabla para diferentes tipos de usuarios
CREATE TABLE ps_user (
    id_user INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_type ENUM('customer', 'employee', 'supplier') NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    
    -- Campos específicos de Customer
    id_default_group INT UNSIGNED,
    newsletter TINYINT(1),
    
    -- Campos específicos de Employee
    id_profile INT UNSIGNED,
    last_login DATETIME,
    
    -- Campos específicos de Supplier
    company_name VARCHAR(255),
    tax_id VARCHAR(50),
    
    INDEX idx_type (user_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;</code></pre>

        <h2 class="section-title">6. Mejores Prácticas</h2>

        <table class="table table-striped">
            <thead class="table-dark">
                <tr>
                    <th>Patrón</th>
                    <th>Cuándo Usar</th>
                    <th>Cuándo Evitar</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>EAV</strong></td>
                    <td>Catálogos con atributos muy variables</td>
                    <td>Consultas frecuentes de múltiples atributos</td>
                </tr>
                <tr>
                    <td><strong>Adjacency List</strong></td>
                    <td>Jerarquías simples con escritura frecuente</td>
                    <td>Necesidad de consultas recursivas frecuentes</td>
                </tr>
                <tr>
                    <td><strong>Nested Set</strong></td>
                    <td>Jerarquías estables con lecturas frecuentes</td>
                    <td>Inserciones/movimientos frecuentes</td>
                </tr>
                <tr>
                    <td><strong>Closure Table</strong></td>
                    <td>Balance entre lecturas y escrituras</td>
                    <td>Restricciones estrictas de espacio</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">7. Recursos Adicionales</h2>
        <ul>
            <li><strong>SQL Antipatterns:</strong> "SQL Antipatterns" by Bill Karwin</li>
            <li><strong>Hierarchical Data:</strong> <a href="https://www.sitepoint.com/hierarchical-data-database/" target="_blank">Managing Hierarchical Data in MySQL</a></li>
            <li><strong>PrestaShop Core:</strong> Estudiar <code>classes/Category.php</code> y <code>classes/Product.php</code></li>
        </ul>
    </div>
    `;

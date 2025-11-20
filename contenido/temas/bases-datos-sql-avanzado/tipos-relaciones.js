// @ts-nocheck
const tiposRelaciones = `
    <div class="content-section">
        <h1 id="tipos-relaciones">Tipos de Relaciones (Uno-a-Uno, Uno-a-Muchos, Muchos-a-Muchos)</h1>
        <p>Las relaciones entre entidades son el núcleo del diseño de bases de datos relacionales. En PrestaShop 8.9+ y el desarrollo de módulos personalizados, comprender cómo implementar correctamente cada tipo de relación es fundamental para crear esquemas eficientes, escalables y mantenibles.</p>

        <h2 class="section-title">1. Relación Uno a Uno (1:1)</h2>

        <h3>1.1. Definición</h3>
        <p>Una instancia de la Entidad A se relaciona con <strong>exactamente una</strong> instancia de la Entidad B, y viceversa.</p>

        <pre><code class="language-plaintext">CUSTOMER (1) ────── (1) CUSTOMER_BILLING_INFO

┌──────────────┐         ┌────────────────────────┐
│  CUSTOMER    │         │ CUSTOMER_BILLING_INFO  │
├──────────────┤         ├────────────────────────┤
│ id_customer  │────1:1──│ id_billing_info        │
│ firstname    │         │ id_customer (FK UNIQUE)│
│ lastname     │         │ tax_id                 │
│ email        │         │ company_name           │
└──────────────┘         │ business_address       │
                         └────────────────────────┘
</code></pre>

        <h3>1.2. Implementación en SQL</h3>

        <h4>Opción 1: Clave Foránea con UNIQUE</h4>
        <pre><code class="language-sql">CREATE TABLE ps_customer (
    id_customer INT AUTO_INCREMENT PRIMARY KEY,
    firstname VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    date_add DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE ps_customer_billing_info (
    id_billing_info INT AUTO_INCREMENT PRIMARY KEY,
    id_customer INT NOT NULL UNIQUE,  -- UNIQUE garantiza 1:1
    tax_id VARCHAR(50),
    company_name VARCHAR(255),
    business_address TEXT,
    
    FOREIGN KEY (id_customer) 
        REFERENCES ps_customer(id_customer)
        ON DELETE CASCADE,
    
    -- Índice único automático por UNIQUE constraint
    UNIQUE KEY uk_customer (id_customer)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;</code></pre>

        <h4>Opción 2: Clave Primaria Compartida</h4>
        <pre><code class="language-sql">CREATE TABLE ps_customer (
    id_customer INT AUTO_INCREMENT PRIMARY KEY,
    firstname VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- La PK de billing_info ES la FK a customer
CREATE TABLE ps_customer_billing_info (
    id_customer INT PRIMARY KEY,  -- PK y FK al mismo tiempo
    tax_id VARCHAR(50),
    company_name VARCHAR(255),
    business_address TEXT,
    
    FOREIGN KEY (id_customer) 
        REFERENCES ps_customer(id_customer)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;</code></pre>

        <h3>1.3. Cuándo Usar Relación 1:1</h3>
        
        <table class="table table-bordered">
            <thead class="table-dark">
                <tr>
                    <th>Escenario</th>
                    <th>Ejemplo en PrestaShop</th>
                    <th>Razón</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Segregación de datos</strong></td>
                    <td>Customer → CustomerExtendedInfo</td>
                    <td>Separar datos poco usados para optimizar queries frecuentes</td>
                </tr>
                <tr>
                    <td><strong>Seguridad</strong></td>
                    <td>Employee → EmployeeCredentials</td>
                    <td>Aislar datos sensibles (contraseñas, tokens) en tabla separada</td>
                </tr>
                <tr>
                    <td><strong>Datos opcionales</strong></td>
                    <td>Product → ProductWarranty</td>
                    <td>No todos los productos tienen garantía extendida</td>
                </tr>
                <tr>
                    <td><strong>Limitación de columnas</strong></td>
                    <td>Dividir tabla con muchas columnas</td>
                    <td>Mejorar rendimiento y organización</td>
                </tr>
            </tbody>
        </table>

        <h3>1.4. Ejemplo Completo: Sistema de Garantías</h3>
        <pre><code class="language-sql">-- Producto principal
CREATE TABLE ps_product (
    id_product INT AUTO_INCREMENT PRIMARY KEY,
    reference VARCHAR(64),
    name VARCHAR(255) NOT NULL,
    price DECIMAL(20,6) NOT NULL,
    active TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Garantía extendida (solo algunos productos la tienen)
CREATE TABLE ps_product_warranty (
    id_warranty INT AUTO_INCREMENT PRIMARY KEY,
    id_product INT NOT NULL UNIQUE,  -- 1:1 con producto
    warranty_type ENUM('standard', 'extended', 'lifetime'),
    warranty_months INT,
    warranty_provider VARCHAR(255),
    warranty_document_url VARCHAR(500),
    
    FOREIGN KEY (id_product) 
        REFERENCES ps_product(id_product)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;</code></pre>

        <pre><code class="language-php"><?php
// Uso en PrestaShop

class ProductWarranty extends ObjectModel
{
    public $id_warranty;
    public $id_product;
    public $warranty_type;
    public $warranty_months;
    public $warranty_provider;

    public static $definition = [
        'table' => 'product_warranty',
        'primary' => 'id_warranty',
        'fields' => [
            'id_product' => ['type' => self::TYPE_INT, 'validate' => 'isUnsignedId', 'required' => true],
            'warranty_type' => ['type' => self::TYPE_STRING, 'validate' => 'isGenericName'],
            'warranty_months' => ['type' => self::TYPE_INT, 'validate' => 'isUnsignedInt'],
            'warranty_provider' => ['type' => self::TYPE_STRING, 'validate' => 'isGenericName'],
        ],
    ];

    /**
     * Obtener garantía de un producto
     */
    public static function getByProduct($id_product)
    {
        $id_warranty = Db::getInstance()->getValue('
            SELECT id_warranty 
            FROM \`' . _DB_PREFIX_ . 'product_warranty\` 
            WHERE id_product = ' . (int)$id_product
        );

        return $id_warranty ? new self($id_warranty) : false;
    }
}</code></pre>

        <h2 class="section-title">2. Relación Uno a Muchos (1:N)</h2>

        <h3>2.1. Definición</h3>
        <p>Una instancia de la Entidad A se relaciona con <strong>cero o más</strong> instancias de la Entidad B, pero cada instancia de B se relaciona con <strong>exactamente una</strong> de A.</p>

        <pre><code class="language-plaintext">CUSTOMER (1) ──────< (N) ORDER

┌──────────────┐         ┌──────────────┐
│  CUSTOMER    │         │    ORDER     │
├──────────────┤         ├──────────────┤
│ id_customer  │────1:N──│ id_order     │
│ firstname    │         │ id_customer  │ ← FK
│ lastname     │         │ total_paid   │
│ email        │         │ date_add     │
└──────────────┘         └──────────────┘
</code></pre>

        <h3>2.2. Implementación en SQL</h3>
        <pre><code class="language-sql">-- Tabla "uno" (padre)
CREATE TABLE ps_customer (
    id_customer INT AUTO_INCREMENT PRIMARY KEY,
    firstname VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    date_add DATETIME NOT NULL,
    
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla "muchos" (hija) - contiene la FK
CREATE TABLE ps_orders (
    id_order INT AUTO_INCREMENT PRIMARY KEY,
    id_customer INT NOT NULL,  -- Clave foránea (sin UNIQUE)
    reference VARCHAR(9) UNIQUE,
    total_paid DECIMAL(20,6) NOT NULL,
    current_state TINYINT NOT NULL,
    date_add DATETIME NOT NULL,
    
    FOREIGN KEY (id_customer) 
        REFERENCES ps_customer(id_customer)
        ON DELETE RESTRICT  -- No permitir borrar cliente con pedidos
        ON UPDATE CASCADE,
    
    INDEX idx_customer (id_customer),
    INDEX idx_date (date_add)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;</code></pre>

        <h3>2.3. Estrategias de ON DELETE</h3>
        
        <table class="table table-striped">
            <thead class="table-dark">
                <tr>
                    <th>Opción</th>
                    <th>Comportamiento</th>
                    <th>Uso Recomendado</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>CASCADE</strong></td>
                    <td>Borra automáticamente registros hijos</td>
                    <td>Customer → Address (si borras cliente, borrar direcciones)</td>
                </tr>
                <tr>
                    <td><strong>RESTRICT</strong></td>
                    <td>Impide borrar el padre si tiene hijos</td>
                    <td>Customer → Order (no borrar cliente con pedidos)</td>
                </tr>
                <tr>
                    <td><strong>SET NULL</strong></td>
                    <td>Establece FK a NULL en hijos</td>
                    <td>Employee → Order (si borras empleado, order.id_employee = NULL)</td>
                </tr>
                <tr>
                    <td><strong>SET DEFAULT</strong></td>
                    <td>Establece FK a valor por defecto</td>
                    <td>Raramente usado en PrestaShop</td>
                </tr>
                <tr>
                    <td><strong>NO ACTION</strong></td>
                    <td>Similar a RESTRICT (depende del motor)</td>
                    <td>Comportamiento por defecto en InnoDB</td>
                </tr>
            </tbody>
        </table>

        <h3>2.4. Ejemplo: Customer → Orders → OrderDetails</h3>
        <pre><code class="language-sql">-- Nivel 1: Cliente
CREATE TABLE ps_customer (
    id_customer INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Nivel 2: Pedidos (1:N con Customer)
CREATE TABLE ps_orders (
    id_order INT AUTO_INCREMENT PRIMARY KEY,
    id_customer INT NOT NULL,
    total_paid DECIMAL(20,6),
    
    FOREIGN KEY (id_customer) 
        REFERENCES ps_customer(id_customer)
        ON DELETE RESTRICT,  -- No borrar cliente con pedidos
    
    INDEX idx_customer (id_customer)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Nivel 3: Detalles de pedido (1:N con Order)
CREATE TABLE ps_order_detail (
    id_order_detail INT AUTO_INCREMENT PRIMARY KEY,
    id_order INT NOT NULL,
    id_product INT NOT NULL,
    product_quantity INT NOT NULL,
    
    FOREIGN KEY (id_order) 
        REFERENCES ps_orders(id_order)
        ON DELETE CASCADE,  -- Si borras pedido, borrar sus detalles
    
    FOREIGN KEY (id_product) 
        REFERENCES ps_product(id_product)
        ON DELETE RESTRICT,  -- No borrar producto en uso
    
    INDEX idx_order (id_order),
    INDEX idx_product (id_product)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;</code></pre>

        <h3>2.5. Consultas Típicas en Relaciones 1:N</h3>
        <pre><code class="language-sql">-- Obtener todos los pedidos de un cliente
SELECT o.* 
FROM ps_orders o
WHERE o.id_customer = 42
ORDER BY o.date_add DESC;

-- Contar pedidos por cliente
SELECT 
    c.id_customer,
    c.email,
    COUNT(o.id_order) AS total_orders,
    SUM(o.total_paid) AS total_spent
FROM ps_customer c
LEFT JOIN ps_orders o ON c.id_customer = o.id_customer
GROUP BY c.id_customer, c.email
HAVING COUNT(o.id_order) > 5  -- Clientes con más de 5 pedidos
ORDER BY total_spent DESC;</code></pre>

        <h2 class="section-title">3. Relación Muchos a Muchos (N:M)</h2>

        <h3>3.1. Definición</h3>
        <p>Múltiples instancias de la Entidad A se relacionan con múltiples instancias de la Entidad B.</p>

        <pre><code class="language-plaintext">PRODUCT (N) ────< CATEGORY_PRODUCT >──── (M) CATEGORY

┌──────────────┐         ┌─────────────────────┐         ┌──────────────┐
│   PRODUCT    │         │ CATEGORY_PRODUCT    │         │  CATEGORY    │
├──────────────┤         ├─────────────────────┤         ├──────────────┤
│ id_product   │────N:M──│ id_product (FK, PK1)│──M:N────│ id_category  │
│ name         │         │ id_category(FK, PK2)│         │ name         │
│ price        │         │ position            │         │ active       │
└──────────────┘         └─────────────────────┘         └──────────────┘
</code></pre>

        <h3>3.2. Tabla Intermedia (Junction Table)</h3>
        <p>Las relaciones N:M se implementan mediante una <strong>tabla intermedia</strong> (association table) que contiene las claves foráneas de ambas entidades:</p>

        <pre><code class="language-sql">-- Tabla "muchos" A
CREATE TABLE ps_product (
    id_product INT AUTO_INCREMENT PRIMARY KEY,
    reference VARCHAR(64),
    name VARCHAR(255) NOT NULL,
    price DECIMAL(20,6) NOT NULL,
    active TINYINT(1) DEFAULT 1,
    
    INDEX idx_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla "muchos" B
CREATE TABLE ps_category (
    id_category INT AUTO_INCREMENT PRIMARY KEY,
    id_parent INT DEFAULT 0,
    name VARCHAR(255) NOT NULL,
    active TINYINT(1) DEFAULT 1,
    
    INDEX idx_active (active),
    INDEX idx_parent (id_parent)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla intermedia (junction)
CREATE TABLE ps_category_product (
    id_category INT NOT NULL,
    id_product INT NOT NULL,
    position INT UNSIGNED NOT NULL DEFAULT 0,
    
    -- Clave primaria compuesta (garantiza unicidad de la relación)
    PRIMARY KEY (id_category, id_product),
    
    -- Claves foráneas a ambas tablas
    FOREIGN KEY (id_category) 
        REFERENCES ps_category(id_category)
        ON DELETE CASCADE,
    
    FOREIGN KEY (id_product) 
        REFERENCES ps_product(id_product)
        ON DELETE CASCADE,
    
    -- Índice para búsquedas inversas (productos por categoría)
    KEY id_product (id_product),
    
    -- Índice para ordenar productos dentro de categoría
    KEY position (id_category, position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;</code></pre>

        <h3>3.3. Atributos en la Relación</h3>
        <p>La tabla intermedia puede contener atributos adicionales que describen la relación:</p>

        <pre><code class="language-sql">-- Ejemplo: Productos en Carritos (con cantidad y fecha)
CREATE TABLE ps_cart_product (
    id_cart INT NOT NULL,
    id_product INT NOT NULL,
    id_product_attribute INT NOT NULL DEFAULT 0,  -- Variante
    quantity INT UNSIGNED NOT NULL DEFAULT 0,      -- ← Atributo de la relación
    date_add DATETIME NOT NULL,                    -- ← Atributo de la relación
    
    PRIMARY KEY (id_cart, id_product, id_product_attribute),
    
    FOREIGN KEY (id_cart) 
        REFERENCES ps_cart(id_cart)
        ON DELETE CASCADE,
    
    FOREIGN KEY (id_product) 
        REFERENCES ps_product(id_product)
        ON DELETE CASCADE,
    
    KEY id_product (id_product),
    KEY id_cart_date (id_cart, date_add)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;</code></pre>

        <h3>3.4. Consultas en Relaciones N:M</h3>

        <h4>Opción 1: Obtener todas las categorías de un producto</h4>
        <pre><code class="language-sql">SELECT 
    c.id_category,
    c.name,
    cp.position
FROM ps_category c
INNER JOIN ps_category_product cp ON c.id_category = cp.id_category
WHERE cp.id_product = 42
ORDER BY cp.position ASC;</code></pre>

        <h4>Opción 2: Obtener todos los productos de una categoría</h4>
        <pre><code class="language-sql">SELECT 
    p.id_product,
    p.name,
    p.price,
    cp.position
FROM ps_product p
INNER JOIN ps_category_product cp ON p.id_product = cp.id_product
WHERE cp.id_category = 5
  AND p.active = 1
ORDER BY cp.position ASC
LIMIT 20;</code></pre>

        <h4>Opción 3: Productos en múltiples categorías específicas (AND)</h4>
        <pre><code class="language-sql">-- Productos que están en AMBAS categorías (5 Y 12)
SELECT p.id_product, p.name
FROM ps_product p
WHERE EXISTS (
    SELECT 1 FROM ps_category_product cp1
    WHERE cp1.id_product = p.id_product AND cp1.id_category = 5
)
AND EXISTS (
    SELECT 1 FROM ps_category_product cp2
    WHERE cp2.id_product = p.id_product AND cp2.id_category = 12
);</code></pre>

        <h4>Opción 4: Productos en al menos una categoría (OR)</h4>
        <pre><code class="language-sql">-- Productos que están en al menos una de las categorías (5 Ó 12)
SELECT DISTINCT p.id_product, p.name
FROM ps_product p
INNER JOIN ps_category_product cp ON p.id_product = cp.id_product
WHERE cp.id_category IN (5, 12);</code></pre>

        <h3>3.5. Operaciones CRUD en Relaciones N:M</h3>
        <pre><code class="language-php"><?php
// Añadir producto a múltiples categorías

class Product extends ObjectModel
{
    /**
     * Actualizar categorías de un producto
     * 
     * @param array $categories Array de IDs de categorías
     */
    public function updateCategories($categories)
    {
        // 1. Borrar categorías actuales
        Db::getInstance()->delete('category_product', 'id_product = ' . (int)$this->id);
        
        // 2. Insertar nuevas categorías
        if (!empty($categories)) {
            $values = [];
            foreach ($categories as $position => $id_category) {
                $values[] = '(' . (int)$id_category . ', ' . (int)$this->id . ', ' . (int)$position . ')';
            }
            
            $sql = 'INSERT INTO \`\' . _DB_PREFIX_ . 'category_product\` 
                    (id_category, id_product, position) 
                    VALUES ' . implode(',', $values);
            
            Db::getInstance()->execute($sql);
        }
        
        return true;
    }
    
    /**
     * Obtener categorías de este producto
     * 
     * @return array
     */
    public function getCategories()
    {
        return Db::getInstance()->executeS('
            SELECT cp.id_category, c.name, cp.position
            FROM  \`' . _DB_PREFIX_ . 'category_product\` cp
            LEFT JOIN \`' . _DB_PREFIX_ . 'category\` c ON cp.id_category = c.id_category
            WHERE cp.id_product = ' . (int)$this->id . '
            ORDER BY cp.position ASC
        ');
    }
    
    /**
     * Verificar si el producto está en una categoría específica
     * 
     * @param int $id_category
     * @return bool
     */
    public function isInCategory($id_category)
    {
        return (bool)Db::getInstance()->getValue('
            SELECT 1
            FROM \`' . _DB_PREFIX_ . 'category_product\`
            WHERE id_product = ' . (int)$this->id . '
              AND id_category = ' . (int)$id_category
        );
    }
}</code></pre>

        <h2 class="section-title">4. Relaciones Recursivas (Self-Referencing)</h2>

        <h3>4.1. Definición</h3>
        <p>Una entidad se relaciona consigo misma. Común en estructuras jerárquicas.</p>

        <pre><code class="language-plaintext">CATEGORY (árbol jerárquico)

┌───────────────┐
│   CATEGORY    │──┐
├───────────────┤  │
│ id_category   │  │
│ id_parent     │←─┘ (FK a sí misma)
│ name          │
└───────────────┘

Ejemplo:
1. Electrónica (id_parent = 0, raíz)
   ├── 2. Teléfonos (id_parent = 1)
   │   ├── 3. Android (id_parent = 2)
   │   └── 4. iOS (id_parent = 2)
   └── 5. Ordenadores (id_parent = 1)
       ├── 6. Portátiles (id_parent = 5)
       └── 7. Sobremesa (id_parent = 5)
</code></pre>

        <h3>4.2. Implementación: Categorías Jerárquicas</h3>
        <pre><code class="language-sql">CREATE TABLE ps_category (
    id_category INT AUTO_INCREMENT PRIMARY KEY,
    id_parent INT NOT NULL DEFAULT 0,  -- FK a sí misma (0 = raíz)
    name VARCHAR(255) NOT NULL,
    description TEXT,
    active TINYINT(1) DEFAULT 1,
    level_depth TINYINT UNSIGNED NOT NULL DEFAULT 0,
    position INT UNSIGNED NOT NULL DEFAULT 0,
    
    -- Self-referencing FK
    FOREIGN KEY (id_parent) 
        REFERENCES ps_category(id_category)
        ON DELETE RESTRICT,  -- No borrar si tiene hijos
    
    INDEX idx_parent (id_parent),
    INDEX idx_level (level_depth),
    INDEX idx_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;</code></pre>

        <h3>4.3. Consultas en Árboles Jerárquicos</h3>

        <h4>Obtener hijos directos:</h4>
        <pre><code class="language-sql">-- Categorías hijas de "Electrónica" (id=1)
SELECT * 
FROM ps_category
WHERE id_parent = 1
ORDER BY position ASC;</code></pre>

        <h4>Obtener todo el árbol (recursivo con CTE):</h4>
        <pre><code class="language-sql">-- Usando Common Table Expression (MySQL 8.0+)
WITH RECURSIVE category_tree AS (
    -- Caso base: categoría raíz
    SELECT 
        id_category, 
        id_parent, 
        name, 
        0 AS level,
        CAST(name AS CHAR(500)) AS path
    FROM ps_category
    WHERE id_parent = 0
    
    UNION ALL
    
    -- Caso recursivo: categorías hijas
    SELECT 
        c.id_category,
        c.id_parent,
        c.name,
        ct.level + 1,
        CONCAT(ct.path, ' > ', c.name)
    FROM ps_category c
    INNER JOIN category_tree ct ON c.id_parent = ct.id_category
)
SELECT * FROM category_tree
ORDER BY path;</code></pre>

        <h3>4.4. Patrón Nested Set (Conjunto Anidado)</h3>
        <p>PrestaShop usa el patrón Nested Set para categorías, más eficiente para lecturas:</p>

        <pre><code class="language-sql">CREATE TABLE ps_category (
    id_category INT AUTO_INCREMENT PRIMARY KEY,
    id_parent INT NOT NULL,
    nleft INT NOT NULL,   -- Borde izquierdo
    nright INT NOT NULL,  -- Borde derecho
    level_depth TINYINT,
    name VARCHAR(255),
    
    INDEX idx_nleft (nleft),
    INDEX idx_nright (nright),
    INDEX idx_parent (id_parent)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Ejemplo de datos:
--                    Electronics (1,10)
--                    /             \
--         Phones (2,5)             Computers (6,9)
--         /      \                  /          \
--   Android(3,4) iOS(5,6)     Laptop(7,8)    Desktop(9,10)

-- Obtener todos los descendientes (más rápido que recursión):
SELECT * 
FROM ps_category
WHERE nleft > 2 AND nright < 5;  -- Todos bajo "Phones"</code></pre>

        <h2 class="section-title">5. Comparación de Tipos de Relaciones</h2>

        <table class="table table-bordered">
            <thead class="table-dark">
                <tr>
                    <th>Tipo</th>
                    <th>Implementación</th>
                    <th>Ejemplo PrestaShop</th>
                    <th>Claves</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>1:1</strong></td>
                    <td>FK con UNIQUE o PK compartida</td>
                    <td>Customer → CustomerBilling</td>
                    <td>FK con UNIQUE constraint</td>
                </tr>
                <tr>
                    <td><strong>1:N</strong></td>
                    <td>FK en tabla "muchos"</td>
                    <td>Customer → Orders</td>
                    <td>FK sin UNIQUE</td>
                </tr>
                <tr>
                    <td><strong>N:M</strong></td>
                    <td>Tabla intermedia con PK compuesta</td>
                    <td>Products ↔ Categories</td>
                    <td>PK (id_a, id_b) + 2 FKs</td>
                </tr>
                <tr>
                    <td><strong>Recursiva</strong></td>
                    <td>FK a la misma tabla</td>
                    <td>Category → Parent Category</td>
                    <td>id_parent (FK a id_category)</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">6. Mejores Prácticas</h2>

        <table class="table table-striped">
            <thead class="table-dark">
                <tr>
                    <th width="30%">Práctica</th>
                    <th>Descripción</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Siempre usar FKs</strong></td>
                    <td>Garantizan integridad referencial, incluso si hay lógica en aplicación</td>
                </tr>
                <tr>
                    <td><strong>Índices en FKs</strong></td>
                    <td>MySQL no crea índices automáticos en FKs, añadirlos manualmente</td>
                </tr>
                <tr>
                    <td><strong>Nombrar FKs consistentemente</strong></td>
                    <td><code>id_entity</code> para claves foráneas, <code>fk_table_column</code> para constraints</td>
                </tr>
                <tr>
                    <td><strong>ON DELETE apropiado</strong></td>
                    <td>CASCADE para dependientes, RESTRICT para datos críticos</td>
                </tr>
                <tr>
                    <td><strong>PK compuesta en N:M</strong></td>
                    <td>Garantiza unicidad de relación y mejora rendimiento</td>
                </tr>
                <tr>
                    <td><strong>Atributos en tablas intermedias</strong></td>
                    <td>Solo si describen la relación, no las entidades</td>
                </tr>
                <tr>
                    <td><strong>Documentar relaciones</strong></td>
                    <td>Comentarios SQL y diagramas ERD actualizados</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">7. Recursos</h2>
        <ul>
            <li><strong>Documentación MySQL:</strong> <a href="https://dev.mysql.com/doc/refman/8.0/en/create-table-foreign-keys.html" target="_blank">Foreign Key Constraints</a></li>
            <li><strong>ERD Tools:</strong> MySQL Workbench, dbdiagram.io, Lucidchart</li>
            <li><strong>Nested Set:</strong> <a href="https://en.wikipedia.org/wiki/Nested_set_model" target="_blank">Wikipedia - Nested Set Model</a></li>
        </ul>
    </div>
    `;

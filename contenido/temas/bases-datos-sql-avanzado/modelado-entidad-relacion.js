// @ts-nocheck
const modeladoEntidadRelacion = `
    <div class="content-section">
        <h1 id="modelado-entidad-relacion">Modelado Entidad-Relación (ERD)</h1>
        <p>El Modelo Entidad-Relación (ERD - Entity-Relationship Diagram) es una herramienta fundamental para el diseño conceptual de bases de datos. En el contexto de PrestaShop 8.9+ y PHP 8.1+, comprender cómo modelar correctamente las relaciones entre entidades es esencial para desarrollar módulos robustos y escalables.</p>

        <h2 class="section-title">1. Conceptos Fundamentales del ERD</h2>

        <h3>1.1. Componentes del Modelo Entidad-Relación</h3>
        
        <table class="table table-bordered">
            <thead class="table-dark">
                <tr>
                    <th>Componente</th>
                    <th>Representación</th>
                    <th>Descripción</th>
                    <th>Ejemplo en PrestaShop</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Entidad</strong></td>
                    <td>Rectángulo</td>
                    <td>Objeto o concepto del mundo real que tiene existencia independiente</td>
                    <td>Product, Customer, Order, Category</td>
                </tr>
                <tr>
                    <td><strong>Atributo</strong></td>
                    <td>Óvalo/Elipse</td>
                    <td>Propiedad o característica de una entidad</td>
                    <td>product_name, price, stock, email, phone</td>
                </tr>
                <tr>
                    <td><strong>Relación</strong></td>
                    <td>Rombo</td>
                    <td>Asociación entre dos o más entidades</td>
                    <td>Customer "places" Order, Product "belongs to" Category</td>
                </tr>
                <tr>
                    <td><strong>Clave Primaria</strong></td>
                    <td>Atributo subrayado</td>
                    <td>Identificador único de cada instancia de la entidad</td>
                    <td>id_product, id_customer, id_order</td>
                </tr>
                <tr>
                    <td><strong>Clave Foránea</strong></td>
                    <td>Línea discontinua</td>
                    <td>Atributo que referencia la clave primaria de otra entidad</td>
                    <td>id_customer en ps_order, id_product en ps_cart_product</td>
                </tr>
            </tbody>
        </table>

        <h3>1.2. Cardinalidad de Relaciones</h3>
        <p>La cardinalidad especifica el número de instancias de una entidad que pueden asociarse con otra:</p>

        <table class="table table-striped">
            <thead class="table-dark">
                <tr>
                    <th>Notación</th>
                    <th>Nombre</th>
                    <th>Significado</th>
                    <th>Ejemplo PrestaShop</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>1:1</strong></td>
                    <td>Uno a Uno</td>
                    <td>Una instancia de A se relaciona con exactamente una de B</td>
                    <td>Customer → CustomerAddress (dirección principal)</td>
                </tr>
                <tr>
                    <td><strong>1:N</strong></td>
                    <td>Uno a Muchos</td>
                    <td>Una instancia de A se relaciona con muchas de B</td>
                    <td>Customer → Orders (un cliente hace múltiples pedidos)</td>
                </tr>
                <tr>
                    <td><strong>N:M</strong></td>
                    <td>Muchos a Muchos</td>
                    <td>Muchas instancias de A se relacionan con muchas de B</td>
                    <td>Products ↔ Categories (un producto en varias categorías)</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">2. Entidades en PrestaShop</h2>

        <h3>2.1. Ejemplo: Diagrama ERD del Sistema de Pedidos</h3>
        
        <pre><code class="language-plaintext">┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
│    CUSTOMER     │          │      ORDER      │          │  ORDER_DETAIL   │
├─────────────────┤          ├─────────────────┤          ├─────────────────┤
│ <u>id_customer</u>    │──────1:N─│ id_order        │──────1:N─│ id_order_detail │
│ firstname       │          │ <u>id_order</u>       │          │ id_order (FK)   │
│ lastname        │          │ id_customer(FK) │          │ id_product (FK) │
│ email           │          │ total_paid      │          │ product_name    │
│ date_add        │          │ current_state   │          │ product_price   │
└─────────────────┘          │ date_add        │          │ product_quantity│
                             └─────────────────┘          └─────────────────┘
                                      │
                                      │ 1:N
                                      ↓
                             ┌─────────────────┐
                             │  ORDER_STATE    │
                             ├─────────────────┤
                             │ <u>id_order_state</u>│
                             │ name            │
                             │ color           │
                             │ paid            │
                             └─────────────────┘
</code></pre>

        <h3>2.2. Definición de Entidades como Clases en PrestaShop</h3>
        <p>En PrestaShop, cada entidad se mapea a una clase PHP que extiende <code>ObjectModel</code>:</p>

        <pre><code class="language-php"><?php
// classes/Product.php

class Product extends ObjectModel
{
    /**
     * @var int Product ID
     */
    public $id_product;

    /**
     * @var string Product name
     */
    public $name;

    /**
     * @var string Product reference
     */
    public $reference;

    /**
     * @var float Product price
     */
    public $price;

    /**
     * @var int Stock quantity
     */
    public $quantity;

    /**
     * @var bool Product active status
     */
    public $active;

    /**
     * @see ObjectModel::$definition
     */
    public static $definition = [
        'table' => 'product',
        'primary' => 'id_product',
        'multilang' => true,
        'fields' => [
            // Atributos simples
            'id_supplier' => [
                'type' => self::TYPE_INT,
                'validate' => 'isUnsignedId'
            ],
            'reference' => [
                'type' => self::TYPE_STRING,
                'validate' => 'isReference',
                'size' => 64
            ],
            'price' => [
                'type' => self::TYPE_FLOAT,
                'validate' => 'isPrice',
                'required' => true
            ],
            'active' => [
                'type' => self::TYPE_BOOL,
                'validate' => 'isBool'
            ],
            
            // Atributos multiidioma
            'name' => [
                'type' => self::TYPE_STRING,
                'lang' => true,
                'validate' => 'isCatalogName',
                'required' => true,
                'size' => 128
            ],
            'description' => [
                'type' => self::TYPE_HTML,
                'lang' => true,
                'validate' => 'isCleanHtml'
            ],
        ],
    ];
}</code></pre>

        <h2 class="section-title">3. Tipos de Atributos</h2>

        <h3>3.1. Atributos Simples vs Compuestos</h3>
        
        <div class="row">
            <div class="col-md-6">
                <div class="card mb-3">
                    <div class="card-header bg-primary text-white">Atributo Simple</div>
                    <div class="card-body">
                        <p>No se puede dividir en partes más pequeñas</p>
                        <pre><code class="language-sql">-- Ejemplos:
email VARCHAR(255)
price DECIMAL(20,6)
active TINYINT(1)
stock_quantity INT(10)</code></pre>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="card mb-3">
                    <div class="card-header bg-success text-white">Atributo Compuesto</div>
                    <div class="card-body">
                        <p>Se divide en componentes más pequeños</p>
                        <pre><code class="language-sql">-- Dirección compuesta:
address1 VARCHAR(128)
address2 VARCHAR(128)
postcode VARCHAR(12)
city VARCHAR(64)
country VARCHAR(64)</code></pre>
                    </div>
                </div>
            </div>
        </div>

        <h3>3.2. Atributos Derivados</h3>
        <p>Valores calculados a partir de otros atributos:</p>

        <pre><code class="language-php"><?php
// En PrestaShop, implementados como getters

class Order extends ObjectModel
{
    /**
     * Atributo almacenado
     */
    public $total_products;
    public $total_shipping;
    public $total_discounts;
    
    /**
     * Atributo derivado - Calculado dinámicamente
     * 
     * @return float Total del pedido
     */
    public function getTotalPaid()
    {
        return $this->total_products 
             + $this->total_shipping 
             - $this->total_discounts;
    }
    
    /**
     * Atributo derivado - Número de productos
     * 
     * @return int
     */
    public function getProductsCount()
    {
        $sql = 'SELECT COUNT(*) 
                FROM \`' . _DB_PREFIX_ . 'order_detail\` 
                WHERE \`id_order\` = ' . (int)$this->id;
        
        return (int)Db::getInstance()->getValue($sql);
    }
}</code></pre>

        <h3>3.3. Atributos Multivaluados</h3>
        <p>En ERD clásico, un atributo multivaluado puede tener múltiples valores. En bases de datos relacionales, se modelan como entidades separadas:</p>

        <div class="alert alert-warning">
            <strong>❌ MAL - Almacenar múltiples valores en un campo:</strong>
            <pre class="mb-0"><code class="language-sql">-- NO hacer esto
CREATE TABLE ps_product (
    id_product INT PRIMARY KEY,
    categories VARCHAR(255) -- "1,3,5,12" ← Viola 1NF
);</code></pre>
        </div>

        <div class="alert alert-success">
            <strong>✅ BIEN - Tabla intermedia para relación N:M:</strong>
            <pre class="mb-0"><code class="language-sql">-- Correcto: Tabla de asociación
CREATE TABLE ps_category_product (
    id_category INT NOT NULL,
    id_product INT NOT NULL,
    position INT DEFAULT 0,
    PRIMARY KEY (id_category, id_product),
    KEY id_product (id_product)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;</code></pre>
        </div>

        <h2 class="section-title">4. Modelado de Relaciones</h2>

        <h3>4.1. Relación Uno a Muchos (1:N)</h3>
        <p>Ejemplo: Un cliente puede tener múltiples pedidos</p>

        <pre><code class="language-plaintext">CUSTOMER (1) ──────< (N) ORDER

CUSTOMER                    ORDER
├─ id_customer (PK)        ├─ id_order (PK)
├─ firstname               ├─ id_customer (FK) ← Clave foránea
├─ lastname                ├─ total_paid
└─ email                   └─ date_add
</code></pre>

        <pre><code class="language-sql">-- Implementación SQL
CREATE TABLE ps_customer (
    id_customer INT AUTO_INCREMENT PRIMARY KEY,
    firstname VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    date_add DATETIME NOT NULL,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE ps_orders (
    id_order INT AUTO_INCREMENT PRIMARY KEY,
    id_customer INT NOT NULL,
    total_paid DECIMAL(20,6) NOT NULL,
    current_state TINYINT NOT NULL,
    date_add DATETIME NOT NULL,
    
    -- Relación explícita con ON DELETE CASCADE
    FOREIGN KEY (id_customer) 
        REFERENCES ps_customer(id_customer)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    
    INDEX idx_customer (id_customer),
    INDEX idx_date (date_add)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;</code></pre>

        <h3>4.2. Relación Muchos a Muchos (N:M)</h3>
        <p>Ejemplo: Productos y Categorías (un producto en múltiples categorías, una categoría con múltiples productos)</p>

        <pre><code class="language-plaintext">PRODUCT (N) ──────< CATEGORY_PRODUCT >────── (M) CATEGORY

PRODUCT                 CATEGORY_PRODUCT           CATEGORY
├─ id_product (PK)     ├─ id_product (FK, PK1)   ├─ id_category (PK)
├─ name                ├─ id_category (FK, PK2)  ├─ name
├─ price               └─ position               └─ active
└─ active
</code></pre>

        <pre><code class="language-sql">-- Tabla intermedia (junction table)
CREATE TABLE ps_category_product (
    id_category INT NOT NULL,
    id_product INT NOT NULL,
    position INT UNSIGNED NOT NULL DEFAULT 0,
    
    -- Clave primaria compuesta
    PRIMARY KEY (id_category, id_product),
    
    -- Claves foráneas
    FOREIGN KEY (id_category) 
        REFERENCES ps_category(id_category)
        ON DELETE CASCADE,
    
    FOREIGN KEY (id_product) 
        REFERENCES ps_product(id_product)
        ON DELETE CASCADE,
    
    -- Índices para búsquedas eficientes
    KEY id_product (id_product),
    KEY position (position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;</code></pre>

        <h3>4.3. Relación Uno a Uno (1:1)</h3>
        <p>Ejemplo: Cliente y su información de facturación extendida</p>

        <pre><code class="language-sql">-- Opción 1: Clave foránea con UNIQUE
CREATE TABLE ps_customer (
    id_customer INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    firstname VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE ps_customer_billing_info (
    id_billing_info INT AUTO_INCREMENT PRIMARY KEY,
    id_customer INT NOT NULL UNIQUE, -- UNIQUE garantiza 1:1
    tax_id VARCHAR(50),
    billing_address TEXT,
    
    FOREIGN KEY (id_customer) 
        REFERENCES ps_customer(id_customer)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;</code></pre>

        <h2 class="section-title">5. Entidades Débiles vs Fuertes</h2>

        <h3>5.1. Entidad Fuerte</h3>
        <p>Tiene existencia independiente, su clave primaria no depende de otra entidad:</p>

        <pre><code class="language-sql">-- Ejemplo: Product es una entidad fuerte
CREATE TABLE ps_product (
    id_product INT AUTO_INCREMENT PRIMARY KEY, -- PK independiente
    reference VARCHAR(64),
    name VARCHAR(255) NOT NULL,
    price DECIMAL(20,6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;</code></pre>

        <h3>5.2. Entidad Débil</h3>
        <p>Su existencia depende de otra entidad (entidad propietaria). Su clave primaria incluye la clave de la entidad fuerte:</p>

        <pre><code class="language-sql">-- Ejemplo: OrderDetail es entidad débil (depende de Order)
CREATE TABLE ps_order_detail (
    id_order_detail INT AUTO_INCREMENT PRIMARY KEY,
    id_order INT NOT NULL,  -- Parte de la identidad
    id_product INT NOT NULL,
    product_name VARCHAR(255),
    product_price DECIMAL(20,6),
    product_quantity INT,
    
    FOREIGN KEY (id_order) 
        REFERENCES ps_orders(id_order)
        ON DELETE CASCADE, -- Si se borra el pedido, se borran sus detalles
    
    KEY id_order (id_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;</code></pre>

        <h2 class="section-title">6. Atributos de Relaciones</h2>

        <p>A veces, las relaciones mismas tienen atributos. Estos se almacenan en la tabla intermedia:</p>

        <pre><code class="language-sql">-- Relación EMPLOYEE trabaja_en SHOP con atributo 'fecha_inicio'
CREATE TABLE ps_employee_shop (
    id_employee INT NOT NULL,
    id_shop INT NOT NULL,
    date_start DATE NOT NULL,      -- ← Atributo de la relación
    position VARCHAR(100),          -- ← Atributo de la relación
    salary DECIMAL(10,2),           -- ← Atributo de la relación
    
    PRIMARY KEY (id_employee, id_shop),
    
    FOREIGN KEY (id_employee) 
        REFERENCES ps_employee(id_employee)
        ON DELETE CASCADE,
    
    FOREIGN KEY (id_shop) 
        REFERENCES ps_shop(id_shop)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;</code></pre>

        <h2 class="section-title">7. Ejemplo Completo: ERD de un Sistema de Reviews</h2>

        <h3>7.1. Requisitos</h3>
        <ul>
            <li>Los clientes pueden escribir reseñas de productos</li>
            <li>Cada reseña tiene una calificación (1-5 estrellas)</li>
            <li>Las reseñas pueden tener imágenes adjuntas</li>
            <li>Los clientes pueden votar si una reseña fue útil</li>
        </ul>

        <h3>7.2. Diagrama ERD</h3>
        <pre><code class="language-plaintext">┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│  CUSTOMER    │         │   REVIEW     │         │   PRODUCT    │
├──────────────┤         ├──────────────┤         ├──────────────┤
│ id_customer  │───1:N───│ id_review    │───N:1───│ id_product   │
│ email        │         │ id_customer  │         │ name         │
│ firstname    │         │ id_product   │         │ price        │
└──────────────┘         │ rating       │         └──────────────┘
                         │ title        │
                         │ content      │
                         │ date_add     │
                         └──────────────┘
                                │
                                │ 1:N
                                ↓
                         ┌──────────────┐
                         │ REVIEW_IMAGE │
                         ├──────────────┤
                         │ id_image     │
                         │ id_review    │
                         │ image_url    │
                         └──────────────┘

┌──────────────┐         ┌──────────────────┐
│  CUSTOMER    │         │  REVIEW_HELPFUL  │
├──────────────┤         ├──────────────────┤
│ id_customer  │───N:M───│ id_customer      │
└──────────────┘         │ id_review        │
                         │ is_helpful       │
                         │ date_add         │
                         └──────────────────┘
                                │ N:M
                         ┌──────────────┐
                         │   REVIEW     │
                         └──────────────┘
</code></pre>

        <h3>7.3. Implementación SQL</h3>
        <pre><code class="language-sql">-- Tabla de Reseñas (Entidad fuerte)
CREATE TABLE ps_product_review (
    id_review INT AUTO_INCREMENT PRIMARY KEY,
    id_customer INT NOT NULL,
    id_product INT NOT NULL,
    rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    validated TINYINT(1) DEFAULT 0,
    date_add DATETIME NOT NULL,
    
    FOREIGN KEY (id_customer) 
        REFERENCES ps_customer(id_customer)
        ON DELETE CASCADE,
    
    FOREIGN KEY (id_product) 
        REFERENCES ps_product(id_product)
        ON DELETE CASCADE,
    
    INDEX idx_product (id_product),
    INDEX idx_customer (id_customer),
    INDEX idx_rating (rating),
    INDEX idx_date (date_add)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Imágenes de Reseñas (Entidad débil)
CREATE TABLE ps_review_image (
    id_image INT AUTO_INCREMENT PRIMARY KEY,
    id_review INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    position TINYINT DEFAULT 0,
    
    FOREIGN KEY (id_review) 
        REFERENCES ps_product_review(id_review)
        ON DELETE CASCADE,
    
    INDEX idx_review (id_review)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Votos de utilidad (Relación N:M con atributo)
CREATE TABLE ps_review_helpful (
    id_customer INT NOT NULL,
    id_review INT NOT NULL,
    is_helpful TINYINT(1) NOT NULL, -- 1 = útil, 0 = no útil
    date_add DATETIME NOT NULL,
    
    PRIMARY KEY (id_customer, id_review),
    
    FOREIGN KEY (id_customer) 
        REFERENCES ps_customer(id_customer)
        ON DELETE CASCADE,
    
    FOREIGN KEY (id_review) 
        REFERENCES ps_product_review(id_review)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;</code></pre>

        <h2 class="section-title">8. Mejores Prácticas en Modelado ERD</h2>

        <table class="table table-bordered">
            <thead class="table-dark">
                <tr>
                    <th width="30%">Práctica</th>
                    <th>Descripción</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Normalización adecuada</strong></td>
                    <td>Mantener al menos 3NF para evitar redundancias y anomalías</td>
                </tr>
                <tr>
                    <td><strong>Nombres descriptivos</strong></td>
                    <td>Usar convenciones claras: <code>id_entity</code>, <code>entity_attribute</code></td>
                </tr>
                <tr>
                    <td><strong>Claves primarias simples</strong></td>
                    <td>Preferir claves surrogadas (INT AUTO_INCREMENT) sobre claves naturales compuestas</td>
                </tr>
                <tr>
                    <td><strong>Índices estratégicos</strong></td>
                    <td>Crear índices en claves foráneas y campos de búsqueda frecuente</td>
                </tr>
                <tr>
                    <td><strong>Integridad referencial</strong></td>
                    <td>Siempre usar FOREIGN KEY con ON DELETE/UPDATE apropiados</td>
                </tr>
                <tr>
                    <td><strong>Documentación</strong></td>
                    <td>Comentar tablas y campos complejos directamente en SQL</td>
                </tr>
                <tr>
                    <td><strong>Evitar redundancias</strong></td>
                    <td>No duplicar información que puede calcularse o derivarse</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">9. Herramientas para Crear ERD</h2>

        <ul>
            <li><strong>MySQL Workbench:</strong> Herramienta gratuita de Oracle con diseñador visual de ERD</li>
            <li><strong>dbdiagram.io:</strong> Herramienta online para crear diagramas con sintaxis simple</li>
            <li><strong>Lucidchart:</strong> Plataforma online de diagramación profesional</li>
            <li><strong>Draw.io (diagrams.net):</strong> Gratuita y open-source, integración con Google Drive</li>
            <li><strong>PlantUML:</strong> Genera diagramas desde código (ideal para documentación)</li>
            <li><strong>phpMyAdmin Designer:</strong> Incluido en phpMyAdmin para visualizar relaciones</li>
        </ul>

        <h2 class="section-title">10. Recursos Adicionales</h2>
        <ul>
            <li><strong>Documentación MySQL:</strong> <a href="https://dev.mysql.com/doc/" target="_blank">MySQL Reference Manual</a></li>
            <li><strong>ERD Tutorial:</strong> <a href="https://www.lucidchart.com/pages/er-diagrams" target="_blank">ER Diagram Tutorial</a></li>
            <li><strong>Database Design Book:</strong> "Database Design for Mere Mortals" - Michael J. Hernandez</li>
        </ul>
    </div>
    `;

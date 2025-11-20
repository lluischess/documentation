const usoOrmPrestaShop = `
    <div class="content-section">
        <h1 id="uso-orm-prestashop">Uso del ORM de PrestaShop (ORM Core)</h1>
        <p>PrestaShop incluye su propio ORM (Object-Relational Mapping) basado en la clase <strong>ObjectModel</strong>, que permite interactuar con la base de datos de manera orientada a objetos. Aunque PrestaShop 8+ integra Doctrine para ciertas partes del core, el sistema ObjectModel sigue siendo fundamental para el desarrollo de módulos y personalización de la tienda.</p>

        <h2 class="section-title">1. Introducción a ObjectModel</h2>
        <p>La clase <code>ObjectModel</code> es la base de todas las entidades de PrestaShop (Productos, Categorías, Clientes, etc.). Proporciona automáticamente:</p>
        <ul>
            <li>Operaciones CRUD (Create, Read, Update, Delete)</li>
            <li>Validación de datos</li>
            <li>Soporte multi-idioma (Lang)</li>
            <li>Soporte multi-tienda (Shop)</li>
            <li>Cache automático</li>
            <li>Gestión de imágenes asociadas</li>
        </ul>

        <h3>1.1. Estructura Básica de un ObjectModel</h3>
        <p>Al crear una entidad personalizada, extendemos <code>ObjectModel</code> y definimos su estructura mediante propiedades estáticas.</p>

        <pre><code class="language-php">declare(strict_types=1);

namespace MiModulo\Entity;

use ObjectModel;

class MiEntidad extends ObjectModel
{
    // Propiedades que mapean a columnas de la BD
    public int $id_mi_entidad;
    public string $nombre;
    public string $descripcion;
    public bool $activo;
    public string $date_add;
    public string $date_upd;

    /**
     * Definición de la estructura (mapping)
     */
    public static $definition = [
        'table' => 'mi_entidad',
        'primary' => 'id_mi_entidad',
        'multilang' => false,
        'multishop' => true,
        'fields' => [
            'nombre' => [
                'type' => self::TYPE_STRING,
                'validate' => 'isGenericName',
                'required' => true,
                'size' => 128,
            ],
            'descripcion' => [
                'type' => self::TYPE_HTML,
                'validate' => 'isCleanHtml',
                'size' => 3999999999999,
            ],
            'activo' => [
                'type' => self::TYPE_BOOL,
                'validate' => 'isBool',
                'default' => true,
            ],
            'date_add' => [
                'type' => self::TYPE_DATE,
                'validate' => 'isDate',
            ],
            'date_upd' => [
                'type' => self::TYPE_DATE,
                'validate' => 'isDate',
            ],
        ],
    ];
}</code></pre>

        <h2 class="section-title">2. Operaciones CRUD</h2>
        <p>ObjectModel proporciona métodos para las operaciones básicas de base de datos.</p>

        <h3>2.1. Create - Crear una nueva entidad</h3>

        <pre><code class="language-php">// Crear una nueva instancia
$miEntidad = new MiEntidad();
$miEntidad->nombre = 'Mi primer registro';
$miEntidad->descripcion = 'Descripción del registro';
$miEntidad->activo = true;

// Guardar en la base de datos
if ($miEntidad->add()) {
    echo "Registro creado con ID: " . $miEntidad->id;
} else {
    echo "Error al crear el registro";
}

// Alternativa con validación previa
if ($miEntidad->validateFields() && $miEntidad->add()) {
    // Éxito
}</code></pre>

        <h3>2.2. Read - Leer entidades</h3>

        <pre><code class="language-php">// Cargar por ID
$miEntidad = new MiEntidad(5); // Carga el registro con id=5

// Verificar si existe
if ($miEntidad->id) {
    echo $miEntidad->nombre;
}

// Cargar con validación de existencia (PHP 8.1)
$entidad = new MiEntidad(5);
$nombre = $entidad->id ? $entidad->nombre : 'No encontrado';

// Obtener todos los registros
$entidades = MiEntidad::getAll();

// Query personalizada
$entidades = Db::getInstance()->executeS(
    'SELECT * FROM ' . _DB_PREFIX_ . 'mi_entidad WHERE activo = 1'
);</code></pre>

        <h3>2.3. Update - Actualizar</h3>

        <pre><code class="language-php">$miEntidad = new MiEntidad(5);
$miEntidad->nombre = 'Nombre actualizado';
$miEntidad->activo = false;

if ($miEntidad->update()) {
    echo "Registro actualizado correctamente";
}

// Force update (ignora cache)
$miEntidad->update(true);</code></pre>

        <h3>2.4. Delete - Eliminar</h3>

        <pre><code class="language-php">$miEntidad = new MiEntidad(5);

if ($miEntidad->delete()) {
    echo "Registro eliminado correctamente";
}

// Eliminación múltiple (soft delete personalizado)
$ids = [1, 2, 3, 4];
foreach ($ids as $id) {
    $entidad = new MiEntidad($id);
    $entidad->delete();
}</code></pre>

        <h2 class="section-title">3. Validaciones</h2>
        <p>PrestaShop incluye validadores predefinidos para asegurar la integridad de los datos.</p>

        <h3>3.1. Validadores Predefinidos</h3>

        <pre><code class="language-php">// Validadores comunes disponibles en la clase Validate
'isGenericName'      // Nombres genéricos (productos, categorías)
'isEmail'            // Emails
'isUrl'              // URLs
'isCleanHtml'        // HTML limpio (sin scripts maliciosos)
'isPhoneNumber'      // Números de teléfono
'isPostCode'         // Códigos postales
'isDate'             // Fechas formato Y-m-d
'isDateFormat'       // Fechas con formato específico
'isPrice'            // Precios (float positivo)
'isBool'             // Booleanos
'isInt'              // Enteros
'isUnsignedInt'      // Enteros sin signo</code></pre>

        <h3>3.2. Validación Manual</h3>

        <pre><code class="language-php">// Validar campos antes de guardar
if (!$miEntidad->validateFields(false, true)) {
    $errors = $miEntidad->getErrors();
    foreach ($errors as $error) {
        echo $error;
    }
}

// Validación personalizada en el modelo
class MiEntidad extends ObjectModel
{
    public function validateFields($die = true, $error_return = false): bool
    {
        // Validación custom
        if (strlen($this->nombre) < 3) {
            if ($error_return) {
                return false;
            }
            throw new PrestaShopException('El nombre debe tener al menos 3 caracteres');
        }

        return parent::validateFields($die, $error_return);
    }
}</code></pre>

        <h2 class="section-title">4. Soporte Multi-idioma (Multilang)</h2>
        <p>Para entidades que necesitan contenido en múltiples idiomas, activamos el soporte multilang.</p>

        <h3>4.1. Definición de Entidad Multilang</h3>

        <pre><code class="language-php">class Producto extends ObjectModel
{
    public int $id_producto;
    public float $precio;
    public bool $activo;
    
    // Campos multiidioma
    public array $nombre; // Array indexado por id_lang
    public array $descripcion;

    public static $definition = [
        'table' => 'producto',
        'primary' => 'id_producto',
        'multilang' => true, // Activar soporte multilang
        'fields' => [
            'precio' => [
                'type' => self::TYPE_FLOAT,
                'validate' => 'isPrice',
                'required' => true,
            ],
            'activo' => [
                'type' => self::TYPE_BOOL,
                'validate' => 'isBool',
            ],
            // Campos multiidioma
            'nombre' => [
                'type' => self::TYPE_STRING,
                'lang' => true, // Campo traducible
                'validate' => 'isGenericName',
                'required' => true,
                'size' => 128,
            ],
            'descripcion' => [
                'type' => self::TYPE_HTML,
                'lang' => true,
                'validate' => 'isCleanHtml',
            ],
        ],
    ];
}</code></pre>

        <h3>4.2. Uso de Campos Multilang</h3>

        <pre><code class="language-php">// Crear con múltiples idiomas
$producto = new Producto();
$producto->precio = 29.99;

// Asignar valores por idioma
$languages = Language::getLanguages(false);
foreach ($languages as $lang) {
    $producto->nombre[$lang['id_lang']] = match($lang['iso_code']) {
        'es' => 'Producto Ejemplo',
        'en' => 'Example Product',
        'fr' => 'Produit Exemple',
        default => 'Default Product'
    };
    $producto->descripcion[$lang['id_lang']] = "Descripción en {$lang['name']}";
}

$producto->add();

// Leer en un idioma específico
$producto = new Producto(1, $id_lang); // Carga solo ese idioma
echo $producto->nombre; // String en lugar de array

// Leer todos los idiomas
$producto = new Producto(1);
foreach ($producto->nombre as $id_lang => $nombre) {
    echo "Idioma $id_lang: $nombre\n";
}</code></pre>

        <h2 class="section-title">5. Soporte Multi-tienda (Multishop)</h2>
        <p>Para datos específicos por tienda en entornos multitienda.</p>

        <h3>5.1. Configuración Multishop</h3>

        <pre><code class="language-php">class MiConfiguracion extends ObjectModel
{
    public static $definition = [
        'table' => 'mi_configuracion',
        'primary' => 'id_configuracion',
        'multishop' => true, // Activar soporte multishop
        'fields' => [
            'api_key' => [
                'type' => self::TYPE_STRING,
                'validate' => 'isString',
                'size' => 255,
                'shop' => true, // Valor específico por tienda
            ],
        ],
    ];
}

// Guardar para tienda específica
$config = new MiConfiguracion();
$config->api_key = 'clave-tienda-1';
$config->id_shop = 1;
$config->add();

// Obtener para la tienda actual
$config = new MiConfiguracion(1, null, Context::getContext()->shop->id);</code></pre>

        <h2 class="section-title">6. Relaciones entre Entidades</h2>
        <p>Aunque ObjectModel no tiene un sistema de relaciones tan avanzado como Doctrine, podemos implementarlas manualmente.</p>

        <h3>6.1. Relación One-to-Many</h3>

        <pre><code class="language-php">class Categoria extends ObjectModel
{
    public int $id_categoria;
    public string $nombre;

    /**
     * Obtener todos los productos de esta categoría
     */
    public function getProductos(): array
    {
        $sql = new DbQuery();
        $sql->select('p.*');
        $sql->from('producto', 'p');
        $sql->innerJoin('categoria_producto', 'cp', 'p.id_producto = cp.id_producto');
        $sql->where('cp.id_categoria = ' . (int)$this->id);

        $results = Db::getInstance()->executeS($sql);
        
        $productos = [];
        foreach ($results as $row) {
            $productos[] = new Producto($row['id_producto']);
        }
        
        return $productos;
    }
}</code></pre>

        <h3>6.2. Relación Many-to-Many</h3>

        <pre><code class="language-php">class Producto extends ObjectModel
{
    /**
     * Asociar producto a categorías (Many-to-Many)
     */
    public function setCategorias(array $categoriaIds): bool
    {
        // Limpiar relaciones existentes
        Db::getInstance()->delete(
            'categoria_producto',
            'id_producto = ' . (int)$this->id
        );

        // Insertar nuevas relaciones
        foreach ($categoriaIds as $idCategoria) {
            Db::getInstance()->insert('categoria_producto', [
                'id_producto' => (int)$this->id,
                'id_categoria' => (int)$idCategoria,
            ]);
        }

        return true;
    }

    /**
     * Obtener todas las categorías del producto
     */
    public function getCategorias(): array
    {
        $sql = new DbQuery();
        $sql->select('id_categoria');
        $sql->from('categoria_producto');
        $sql->where('id_producto = ' . (int)$this->id);

        return array_column(Db::getInstance()->executeS($sql), 'id_categoria');
    }
}</code></pre>

        <h2 class="section-title">7. Queries Personalizadas con DbQuery</h2>
        <p>Para consultas complejas, usa la clase <code>DbQuery</code> que proporciona un query builder.</p>

        <h3>7.1. Query Builder Básico</h3>

        <pre><code class="language-php">use DbQuery;

$query = new DbQuery();
$query->select('p.*, pl.nombre')
      ->from('producto', 'p')
      ->leftJoin('producto_lang', 'pl', 'p.id_producto = pl.id_producto')
      ->where('p.activo = 1')
      ->where('pl.id_lang = ' . (int)Context::getContext()->language->id)
      ->orderBy('p.precio DESC')
      ->limit(10);

$results = Db::getInstance()->executeS($query);

// Con parámetros preparados (recomendado)
$precio_min = 10.00;
$query->where('p.precio >= ' . (float)$precio_min);</code></pre>

        <h3>7.2. Agregaciones y GROUP BY</h3>

        <pre><code class="language-php">// Contar productos por categoría
$query = new DbQuery();
$query->select('c.nombre, COUNT(cp.id_producto) as total_productos')
      ->from('categoria', 'c')
      ->leftJoin('categoria_producto', 'cp', 'c.id_categoria = cp.id_categoria')
      ->groupBy('c.id_categoria')
      ->having('total_productos > 5');

$stats = Db::getInstance()->executeS($query);</code></pre>

        <h3>7.3. Subconsultas</h3>

        <pre><code class="language-php">// Productos con precio superior al promedio
$subQuery = new DbQuery();
$subQuery->select('AVG(precio)')
         ->from('producto');

$query = new DbQuery();
$query->select('*')
      ->from('producto')
      ->where('precio > (' . $subQuery->build() . ')');

$productosCaros = Db::getInstance()->executeS($query);</code></pre>

        <h2 class="section-title">8. Gestión de Imágenes</h2>
        <p>ObjectModel incluye soporte para gestión de imágenes asociadas a entidades.</p>

        <pre><code class="language-php">class MiProducto extends ObjectModel
{
    public static $definition = [
        'table' => 'mi_producto',
        'primary' => 'id_mi_producto',
        'fields' => [
            // ... otros campos
        ],
    ];

    /**
     * Directorio de imágenes
     */
    public function getImagesPath(): string
    {
        return _PS_MODULE_DIR_ . 'mimodulo/views/img/productos/';
    }

    /**
     * Subir imagen
     */
    public function uploadImage(array $file): bool
    {
        $imageUploader = new ImageUploader();
        $imageUploader->setAcceptTypes(['jpeg', 'jpg', 'png', 'gif'])
                      ->setMaxSize(2000000); // 2MB

        $result = $imageUploader->process();
        
        if ($result) {
            $filename = $this->id . '.jpg';
            $result->save($this->getImagesPath() . $filename);
            return true;
        }

        return false;
    }
}</code></pre>

        <h2 class="section-title">9. Cache y Performance</h2>
        <p>ObjectModel incluye cache automático, pero podemos optimizarlo.</p>

        <h3>9.1. Cache Automático</h3>

        <pre><code class="language-php">// El cache se gestiona automáticamente
$producto = new Producto(1); // Primera carga: desde BD
$producto2 = new Producto(1); // Segunda carga: desde cache

// Forzar recarga desde BD (bypass cache)
$producto = new Producto(1);
$producto->force_id = true;

// Limpiar cache de una entidad
Cache::clean('objectmodel_Producto_1');</code></pre>

        <h3>9.2. Bulk Operations para Mejor Performance</h3>

        <pre><code class="language-php">// Cargar múltiples entidades eficientemente
class Producto extends ObjectModel
{
    public static function getMultiple(array $ids): array
    {
        if (empty($ids)) {
            return [];
        }

        $sql = new DbQuery();
        $sql->select('*')
            ->from(self::$definition['table'])
            ->where('id_producto IN (' . implode(',', array_map('intval', $ids)) . ')');

        $results = Db::getInstance()->executeS($sql);
        
        $productos = [];
        foreach ($results as $row) {
            $producto = new self();
            $producto->hydrate($row);
            $productos[$row['id_producto']] = $producto;
        }

        return $productos;
    }
}</code></pre>

        <h2 class="section-title">10. Migraciones y Evolución del Esquema</h2>
        <p>Al crear o actualizar módulos, necesitamos gestionar la estructura de la base de datos.</p>

        <h3>10.1. Crear Tabla en la Instalación del Módulo</h3>

        <pre><code class="language-php">class MiModulo extends Module
{
    public function install(): bool
    {
        return parent::install() 
            && $this->createTables();
    }

    private function createTables(): bool
    {
        $sql = [];

        // Tabla principal
        $sql[] = 'CREATE TABLE IF NOT EXISTS \`' . _DB_PREFIX_ . 'mi_entidad\` (
            \`id_mi_entidad\` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
            \`nombre\` VARCHAR(128) NOT NULL,
            \`descripcion\` TEXT,
            \`activo\` TINYINT(1) NOT NULL DEFAULT 1,
            \`date_add\` DATETIME NOT NULL,
            \`date_upd\` DATETIME NOT NULL,
            PRIMARY KEY (\`id_mi_entidad\`),
            INDEX \`activo\` (\`activo\`)
        ) ENGINE=' . _MYSQL_ENGINE_ . ' DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;';

        // Tabla para multishop
        $sql[] = 'CREATE TABLE IF NOT EXISTS \`' . _DB_PREFIX_ . 'mi_entidad_shop\` (
            \`id_mi_entidad\` INT(11) UNSIGNED NOT NULL,
            \`id_shop\` INT(11) UNSIGNED NOT NULL,
            PRIMARY KEY (\`id_mi_entidad\`, \`id_shop\`)
        ) ENGINE=' . _MYSQL_ENGINE_ . ' DEFAULT CHARSET=utf8mb4;';

        foreach ($sql as $query) {
            if (!Db::getInstance()->execute($query)) {
                return false;
            }
        }

        return true;
    }

    public function uninstall(): bool
    {
        $sql = 'DROP TABLE IF EXISTS 
            \`' . _DB_PREFIX_ . 'mi_entidad\`,
            \`' . _DB_PREFIX_ . 'mi_entidad_shop\`';

        return Db::getInstance()->execute($sql) 
            && parent::uninstall();
    }
}</code></pre>

        <h3>10.2. Migraciones (Actualizaciones de Esquema)</h3>

        <pre><code class="language-php">// En upgrade/upgrade-2.0.0.php
function upgrade_module_2_0_0($module): bool
{
    // Añadir nueva columna
    $sql = 'ALTER TABLE \`' . _DB_PREFIX_ . 'mi_entidad\` 
            ADD COLUMN \`email\` VARCHAR(255) NULL AFTER \`nombre\`';

    if (!Db::getInstance()->execute($sql)) {
        return false;
    }

    // Actualizar datos existentes
    Db::getInstance()->update(
        'mi_entidad',
        ['activo' => 1],
        'activo IS NULL'
    );

    return true;
}</code></pre>

        <h2 class="section-title">11. ObjectModel vs Doctrine</h2>
        <p>PrestaShop 8+ integra Doctrine para el core. Aquí la comparativa:</p>

        <div class="table-responsive">
            <table class="table">
                <thead>
                    <tr>
                        <th>Aspecto</th>
                        <th>ObjectModel (Legacy)</th>
                        <th>Doctrine (Moderno)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Uso Principal</strong></td>
                        <td>Módulos y personalizaciones</td>
                        <td>Core de PrestaShop 8+</td>
                    </tr>
                    <tr>
                        <td><strong>Definición</strong></td>
                        <td>Array estático $definition</td>
                        <td>Atributos PHP 8 o XML/YAML</td>
                    </tr>
                    <tr>
                        <td><strong>Relaciones</strong></td>
                        <td>Manuales</td>
                        <td>Automáticas con lazy loading</td>
                    </tr>
                    <tr>
                        <td><strong>Query Builder</strong></td>
                        <td>DbQuery (limitado)</td>
                        <td>DQL (muy potente)</td>
                    </tr>
                    <tr>
                        <td><strong>Migraciones</strong></td>
                        <td>SQL manual</td>
                        <td>Doctrine Migrations</td>
                    </tr>
                    <tr>
                        <td><strong>Performance</strong></td>
                        <td>Buena con cache</td>
                        <td>Excelente con optimizaciones</td>
                    </tr>
                    <tr>
                        <td><strong>Curva de Aprendizaje</strong></td>
                        <td>Baja</td>
                        <td>Media-Alta</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <h2 class="section-title">12. Best Practices</h2>
        <ul>
            <li><strong>Usa prepared statements:</strong> Siempre sanitiza inputs con <code>(int)</code>, <code>pSQL()</code>, etc.</li>
            <li><strong>Valida antes de guardar:</strong> Llama a <code>validateFields()</code> explícitamente.</li>
            <li><strong>Índices en BD:</strong> Añade índices en columnas frecuentemente consultadas.</li>
            <li><strong>Evita N+1 queries:</strong> Usa bulk operations cuando sea posible.</li>
            <li><strong>Cache inteligente:</strong> Limpia cache después de operaciones críticas.</li>
            <li><strong>Transacciones:</strong> Usa transacciones para operaciones múltiples relacionadas.</li>
            <li><strong>Logging:</strong> Registra errores de BD en producción.</li>
            <li><strong>Versionado de esquema:</strong> Mantén scripts de upgrade organizados.</li>
        </ul>

        <h3>12.1. Ejemplo de Transacciones</h3>

        <pre><code class="language-php">try {
    Db::getInstance()->beginTransaction();

    $producto = new Producto();
    $producto->nombre = 'Nuevo Producto';
    $producto->add();

    // Asociar a categorías
    $producto->setCategorias([1, 2, 3]);

    // Crear stock
    $stock = new Stock();
    $stock->id_producto = $producto->id;
    $stock->cantidad = 100;
    $stock->add();

    Db::getInstance()->commit();
} catch (Exception $e) {
    Db::getInstance()->rollback();
    PrestaShopLogger::addLog('Error: ' . $e->getMessage(), 3);
    throw $e;
}</code></pre>
    </div>
`;

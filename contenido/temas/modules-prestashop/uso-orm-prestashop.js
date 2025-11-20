const usoOrmPrestaShop = `
    <div class="content-section">
        <h1 id="uso-orm-prestashop">Uso del ORM de PrestaShop (ORM Core)</h1>
        <p>PrestaShop incluye su propio ORM (Object-Relational Mapping) basado en la clase <strong>ObjectModel</strong>, que permite interactuar con la base de datos de manera orientada a objetos. Aunque PrestaShop 8+ integra Doctrine para ciertas partes del core (especialmente en el Back Office moderno), el sistema ObjectModel sigue siendo fundamental para el desarrollo de módulos y la personalización de la tienda debido a su simplicidad y profunda integración con el ecosistema legacy.</p>

        <h2 class="section-title">1. Introducción a ObjectModel</h2>
        <p>La clase <code>ObjectModel</code> es la base de todas las entidades de PrestaShop (Productos, Categorías, Clientes, etc.). Al extender esta clase, tu objeto hereda automáticamente una serie de funcionalidades poderosas sin necesidad de escribir SQL repetitivo. Proporciona:</p>
        <ul>
            <li><strong>Operaciones CRUD:</strong> Métodos <code>add()</code>, <code>update()</code>, <code>delete()</code> y constructores para lectura.</li>
            <li><strong>Validación de datos:</strong> Sistema de reglas de validación antes de la persistencia.</li>
            <li><strong>Soporte Multi-idioma (Lang):</strong> Gestión automática de tablas <code>_lang</code>.</li>
            <li><strong>Soporte Multi-tienda (Shop):</strong> Gestión automática de tablas <code>_shop</code>.</li>
            <li><strong>Cache automático:</strong> Sistema de cache de objetos para reducir consultas a la BD.</li>
            <li><strong>Hooks automáticos:</strong> Dispara hooks como <code>actionObjectAddAfter</code>, <code>actionObjectUpdateAfter</code>, etc.</li>
        </ul>

        <h3>1.1. Estructura Básica de un ObjectModel</h3>
        <p>Al crear una entidad personalizada, extendemos <code>ObjectModel</code> y definimos su estructura mediante la propiedad estática <code>$definition</code>. Esta definición actúa como el "mapa" que le dice a PrestaShop cómo traducir tu objeto a la base de datos.</p>

        <pre><code class="language-php">declare(strict_types=1);

namespace MiModulo\Entity;

use ObjectModel;

class MiEntidad extends ObjectModel
{
    // Propiedades públicas que mapean directamente a columnas de la BD
    public int $id_mi_entidad;
    public string $nombre;
    public string $descripcion;
    public bool $activo;
    public string $date_add;
    public string $date_upd;

    /**
     * Definición de la estructura (mapping).
     * Es crucial definir esto correctamente para que el ORM funcione.
     */
    public static $definition = [
        'table' => 'mi_entidad',      // Nombre de la tabla (sin prefijo)
        'primary' => 'id_mi_entidad', // Clave primaria
        'multilang' => false,         // ¿Tiene tabla _lang asociada?
        'multishop' => true,          // ¿Tiene tabla _shop asociada?
        'fields' => [
            // Definición de cada campo y sus reglas
            'nombre' => [
                'type' => self::TYPE_STRING,    // Tipo de dato (STRING, INT, FLOAT, BOOL, DATE, HTML, SQL)
                'validate' => 'isGenericName',  // Método de validación en clase Validate
                'required' => true,             // ¿Es obligatorio?
                'size' => 128,                  // Longitud máxima
            ],
            'descripcion' => [
                'type' => self::TYPE_HTML,      // HTML permite etiquetas, se sanitiza con isCleanHtml
                'validate' => 'isCleanHtml',
                'size' => 3999999999999,
            ],
            'activo' => [
                'type' => self::TYPE_BOOL,
                'validate' => 'isBool',
                'default' => true,              // Valor por defecto (solo lógico, no en BD)
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
        <p>ObjectModel abstrae las consultas SQL. Es importante entender qué ocurre "bajo el capó" al llamar a estos métodos.</p>

        <h3>2.1. Create - Crear una nueva entidad</h3>
        <p>El método <code>add()</code> inserta el registro en la base de datos. Si <code>multilang</code> o <code>multishop</code> están activos, también inserta en las tablas auxiliares correspondientes. Además, actualiza automáticamente <code>date_add</code> si existe.</p>

        <pre><code class="language-php">// Crear una nueva instancia
$miEntidad = new MiEntidad();
$miEntidad->nombre = 'Mi primer registro';
$miEntidad->descripcion = 'Descripción del registro';
$miEntidad->activo = true;

// Guardar en la base de datos
// add() devuelve true si tiene éxito, false si falla.
// El segundo parámetro (true) indica si se debe hacer autoincrement (por defecto true).
if ($miEntidad->add()) {
    echo "Registro creado con ID: " . $miEntidad->id;
} else {
    echo "Error al crear el registro";
}

// Alternativa robusta: Validar antes de intentar guardar
if ($miEntidad->validateFields() && $miEntidad->add()) {
    // Éxito
}</code></pre>

        <h3>2.2. Read - Leer entidades</h3>
        <p>El constructor de <code>ObjectModel</code> acepta un ID. Si se proporciona, PrestaShop intenta cargar los datos desde la base de datos (o desde la caché de objetos si ya fue cargado).</p>

        <pre><code class="language-php">// Cargar por ID
$miEntidad = new MiEntidad(5); // Ejecuta SELECT * FROM ... WHERE id = 5

// Verificar si la carga fue exitosa
if ($miEntidad->id) {
    echo $miEntidad->nombre;
} else {
    echo "El registro no existe";
}

// Cargar con validación de existencia (estilo PHP 8.1)
$entidad = new MiEntidad(5);
$nombre = $entidad->id ? $entidad->nombre : 'No encontrado';

// Obtener todos los registros (método helper común, no nativo de ObjectModel base pero sí en muchos módulos)
// Normalmente se usa Db::getInstance() para colecciones
$entidades = Db::getInstance()->executeS(
    'SELECT * FROM ' . _DB_PREFIX_ . 'mi_entidad WHERE activo = 1'
);</code></pre>

        <h3>2.3. Update - Actualizar</h3>
        <p>El método <code>update()</code> actualiza el registro existente. Solo actualiza los campos que han cambiado si el sistema de tracking de cambios está activo, o todos si no. Actualiza automáticamente <code>date_upd</code>.</p>

        <pre><code class="language-php">$miEntidad = new MiEntidad(5);
$miEntidad->nombre = 'Nombre actualizado';
$miEntidad->activo = false;

// update() devuelve true/false
if ($miEntidad->update()) {
    echo "Registro actualizado correctamente";
}

// Force update: El parámetro true fuerza la actualización incluso si PrestaShop cree que no hubo cambios,
// y evita el uso de cache para esta operación.
$miEntidad->update(true);</code></pre>

        <h3>2.4. Delete - Eliminar</h3>
        <p>El método <code>delete()</code> elimina el registro de la tabla principal y de todas las tablas asociadas (lang, shop). También dispara hooks de eliminación.</p>

        <pre><code class="language-php">$miEntidad = new MiEntidad(5);

if ($miEntidad->delete()) {
    echo "Registro eliminado correctamente";
}

// Eliminación múltiple (soft delete personalizado)
// A veces no queremos borrar físicamente, sino marcar como eliminado.
// Esto requiere lógica personalizada, ObjectModel::delete() es destructivo.
$ids = [1, 2, 3, 4];
foreach ($ids as $id) {
    $entidad = new MiEntidad($id);
    $entidad->delete();
}</code></pre>

        <h2 class="section-title">3. Validaciones</h2>
        <p>PrestaShop incluye un sistema de validación robusto a través de la clase <code>Validate</code>. Estas reglas se definen en el array <code>$definition</code> y se comprueban automáticamente al guardar, pero es buena práctica comprobarlas manualmente antes para manejar errores de usuario.</p>

        <h3>3.1. Validadores Predefinidos</h3>
        <p>Estos son métodos estáticos de la clase <code>Validate</code>.</p>

        <pre><code class="language-php">// Validadores comunes disponibles en la clase Validate
'isGenericName'      // Permite letras, números y algunos caracteres especiales básicos.
'isEmail'            // Valida formato de email.
'isUrl'              // Valida formato de URL absoluta.
'isCleanHtml'        // Permite HTML pero elimina scripts y eventos (XSS protection).
'isPhoneNumber'      // Valida formatos de teléfono globales.
'isPostCode'         // Valida códigos postales.
'isDate'             // Fechas formato Y-m-d.
'isPrice'            // Precios (float positivo).
'isBool'             // Booleanos (0, 1, true, false).
'isInt'              // Enteros.
'isUnsignedInt'      // Enteros positivos.</code></pre>

        <h3>3.2. Validación Manual</h3>
        <p>El método <code>validateFields()</code> recorre la definición y comprueba cada propiedad contra su regla.</p>

        <pre><code class="language-php">// Validar campos antes de guardar
// validateFields($die = true, $error_return = false)
// Si $die es true, lanza una excepción y detiene la ejecución (comportamiento por defecto).
// Si $error_return es true, devuelve el mensaje de error en lugar de false.

if (!$miEntidad->validateFields(false, true)) {
    // Aquí capturamos errores sin detener el script
    $errors = $miEntidad->getErrors(); // Método custom o manejo manual
    // ObjectModel no tiene un getErrors() público nativo que acumule todo, 
    // validateFields devuelve el primer error encontrado si $error_return es true.
    echo "Error de validación encontrado";
}

// Validación personalizada en el modelo
class MiEntidad extends ObjectModel
{
    public function validateFields($die = true, $error_return = false): bool
    {
        // Añadimos lógica de negocio extra
        if (strlen($this->nombre) < 3) {
            $message = 'El nombre debe tener al menos 3 caracteres';
            if ($error_return) {
                return $message;
            }
            if ($die) {
                throw new PrestaShopException($message);
            }
            return false;
        }

        return parent::validateFields($die, $error_return);
    }
}</code></pre>

        <h2 class="section-title">4. Soporte Multi-idioma (Multilang)</h2>
        <p>Cuando <code>'multilang' => true</code>, PrestaShop busca automáticamente una tabla llamada <code>nombre_tabla_lang</code>. Esta tabla debe contener la PK, <code>id_lang</code> y los campos definidos con <code>'lang' => true</code>.</p>

        <h3>4.1. Definición de Entidad Multilang</h3>

        <pre><code class="language-php">class Producto extends ObjectModel
{
    public int $id_producto;
    public float $precio;
    public bool $activo;
    
    // Los campos multilang se definen como arrays públicos o strings (dependiendo del contexto de carga)
    public array $nombre; // Array indexado por id_lang [1 => 'Nombre ES', 2 => 'Name EN']
    public array $descripcion;

    public static $definition = [
        'table' => 'producto',
        'primary' => 'id_producto',
        'multilang' => true, // Activar soporte multilang
        'fields' => [
            'precio' => ['type' => self::TYPE_FLOAT, 'validate' => 'isPrice', 'required' => true],
            'activo' => ['type' => self::TYPE_BOOL, 'validate' => 'isBool'],
            
            // Campos multiidioma: 'lang' => true es obligatorio
            'nombre' => [
                'type' => self::TYPE_STRING,
                'lang' => true, 
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
        <p>Al trabajar con objetos multilang, debes tener cuidado de si estás accediendo a un valor específico o a todos los idiomas.</p>

        <pre><code class="language-php">// Crear con múltiples idiomas
$producto = new Producto();
$producto->precio = 29.99;

// Para guardar, asignamos un array con todos los idiomas activos
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

// Leer en un idioma específico (Contexto Front Office)
// Si pasamos el id_lang al constructor, las propiedades lang se cargan como strings simples.
$id_lang_es = 1;
$producto = new Producto(1, $id_lang_es); 
echo $producto->nombre; // Imprime "Producto Ejemplo" (String)

// Leer todos los idiomas (Contexto Back Office)
// Si NO pasamos id_lang, se cargan como arrays.
$producto = new Producto(1);
foreach ($producto->nombre as $id_lang => $nombre) {
    echo "Idioma $id_lang: $nombre\n";
}</code></pre>

        <h2 class="section-title">5. Soporte Multi-tienda (Multishop)</h2>
        <p>El soporte multitienda permite que una misma entidad tenga valores diferentes dependiendo de la tienda en la que se visualice. Requiere una tabla <code>nombre_tabla_shop</code>.</p>

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
                'shop' => true, // Este campo puede variar por tienda
            ],
        ],
    ];
}

// Guardar para tienda específica
$config = new MiConfiguracion();
$config->api_key = 'clave-tienda-1';
$config->id_shop = 1; // Forzamos el ID de tienda
$config->add();

// Obtener para la tienda actual (automático basado en Context)
$config = new MiConfiguracion(1); // Usa Context::getContext()->shop->id</code></pre>

        <h2 class="section-title">6. Relaciones entre Entidades</h2>
        <p>A diferencia de Doctrine u Eloquent, ObjectModel <strong>no gestiona relaciones automáticamente</strong> (como <code>$product->getCategories()</code>). Debes implementar métodos getter/setter manualmente para gestionar claves foráneas y tablas intermedias.</p>

        <h3>6.1. Relación One-to-Many</h3>
        <p>Ejemplo: Una Categoría tiene muchos Productos.</p>

        <pre><code class="language-php">class Categoria extends ObjectModel
{
    public int $id_categoria;
    public string $nombre;

    /**
     * Obtener todos los productos de esta categoría.
     * Implementación manual de la relación.
     */
    public function getProductos(): array
    {
        $sql = new DbQuery();
        $sql->select('p.*');
        $sql->from('producto', 'p');
        $sql->innerJoin('categoria_producto', 'cp', 'p.id_producto = cp.id_producto');
        $sql->where('cp.id_categoria = ' . (int)$this->id);

        $results = Db::getInstance()->executeS($sql);
        
        // Hidratar objetos (opcional, costoso en rendimiento si son muchos)
        $productos = [];
        foreach ($results as $row) {
            $productos[] = new Producto($row['id_producto']);
        }
        
        return $productos;
    }
}</code></pre>

        <h3>6.2. Relación Many-to-Many</h3>
        <p>Ejemplo: Un Producto pertenece a muchas Categorías. Se gestiona mediante una tabla pivote.</p>

        <pre><code class="language-php">class Producto extends ObjectModel
{
    /**
     * Asociar producto a categorías (Many-to-Many).
     * Estrategia: Borrar todo y volver a insertar.
     */
    public function setCategorias(array $categoriaIds): bool
    {
        // 1. Limpiar relaciones existentes para este producto
        Db::getInstance()->delete(
            'categoria_producto',
            'id_producto = ' . (int)$this->id
        );

        // 2. Insertar nuevas relaciones
        if (empty($categoriaIds)) {
            return true;
        }

        $insertData = [];
        foreach ($categoriaIds as $idCategoria) {
            $insertData[] = [
                'id_producto' => (int)$this->id,
                'id_categoria' => (int)$idCategoria,
            ];
        }

        return Db::getInstance()->insert('categoria_producto', $insertData);
    }

    /**
     * Obtener IDs de las categorías.
     */
    public function getCategorias(): array
    {
        $sql = new DbQuery();
        $sql->select('id_categoria');
        $sql->from('categoria_producto');
        $sql->where('id_producto = ' . (int)$this->id);

        // array_column para devolver solo un array plano de IDs [1, 5, 8]
        return array_column(Db::getInstance()->executeS($sql), 'id_categoria');
    }
}</code></pre>

        <h2 class="section-title">7. Queries Personalizadas con DbQuery</h2>
        <p>Nunca concatenes variables directamente en strings SQL. Usa la clase <code>DbQuery</code> para construir consultas de manera segura, legible y orientada a objetos.</p>

        <h3>7.1. Query Builder Básico</h3>

        <pre><code class="language-php">use DbQuery;

$query = new DbQuery();
$query->select('p.*, pl.nombre')
      ->from('producto', 'p')
      ->leftJoin('producto_lang', 'pl', 'p.id_producto = pl.id_producto')
      ->where('p.activo = 1')
      ->where('pl.id_lang = ' . (int)Context::getContext()->language->id) // Siempre cast a int
      ->orderBy('p.precio DESC')
      ->limit(10);

// executeS devuelve un array de arrays (filas)
$results = Db::getInstance()->executeS($query);

// Con parámetros preparados (recomendado para strings)
// PrestaShop no usa prepared statements nativos de PDO en DbQuery de forma directa como Doctrine,
// pero pSQL() es obligatorio para sanitizar.
$nombre_buscar = pSQL('Camiseta');
$query->where("pl.nombre LIKE '%$nombre_buscar%'");</code></pre>

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
        <p>Puedes anidar objetos <code>DbQuery</code> usando el método <code>build()</code>.</p>

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
        <p>ObjectModel no gestiona la subida de archivos automáticamente, pero facilita la definición de rutas. Se suele usar junto con la clase <code>ImageManager</code>.</p>

        <pre><code class="language-php">class MiProducto extends ObjectModel
{
    // ... definición ...

    /**
     * Definir ruta de almacenamiento.
     */
    public function getImagesPath(): string
    {
        return _PS_MODULE_DIR_ . 'mimodulo/views/img/productos/';
    }

    /**
     * Método helper para subir imagen.
     */
    public function uploadImage(array $file): bool
    {
        // ImageUploader es una clase hipotética o helper del módulo, 
        // PrestaShop usa internamente ImageManager::resize, etc.
        
        if (!ImageManager::isRealImage($file['tmp_name'], $file['type'])) {
            return false;
        }

        $path = $this->getImagesPath() . $this->id . '.jpg';
        
        // Mueve y redimensiona si es necesario
        return ImageManager::resize($file['tmp_name'], $path);
    }
}</code></pre>

        <h2 class="section-title">9. Cache y Performance</h2>
        <p>PrestaShop tiene un sistema de cache de objetos interno. Cuando haces <code>new Product(1)</code>, se guarda en memoria. Las siguientes llamadas en el mismo request no consultan la BD.</p>

        <h3>9.1. Cache Automático</h3>

        <pre><code class="language-php">// El cache se gestiona automáticamente
$producto = new Producto(1); // Primera carga: SELECT a la BD
$producto2 = new Producto(1); // Segunda carga: Recupera de memoria RAM (Cache estático)

// Forzar recarga desde BD (bypass cache)
// Útil si sospechas que la BD cambió por otro proceso o trigger
$producto = new Producto(1);
$producto->force_id = true; // Flag interno para forzar recarga

// Limpiar cache de una entidad específica
Cache::clean('objectmodel_Producto_1');</code></pre>

        <h3>9.2. Bulk Operations para Mejor Performance</h3>
        <p>El problema N+1 es común: cargar una lista de IDs y luego hacer <code>new Object($id)</code> dentro de un bucle genera N consultas. Evítalo hidratando manualmente.</p>

        <pre><code class="language-php">// Cargar múltiples entidades eficientemente (1 sola consulta)
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
            $producto->hydrate($row); // Método clave: llena el objeto con el array de datos sin consultar BD
            $productos[$row['id_producto']] = $producto;
        }

        return $productos;
    }
}</code></pre>

        <h2 class="section-title">10. Migraciones y Evolución del Esquema</h2>
        <p>Los módulos deben ser capaces de instalarse, desinstalarse y actualizarse. PrestaShop no tiene un sistema de migraciones "up/down" como Laravel, pero usa métodos de instalación y scripts de upgrade.</p>

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

        // Tabla principal: ENGINE debe ser el configurado en PS (_MYSQL_ENGINE_)
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

        // Tabla para multishop (PK compuesta)
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
        // Buena práctica: Borrar tablas al desinstalar (opcional, a veces se prefiere conservar datos)
        $sql = 'DROP TABLE IF EXISTS 
            \`' . _DB_PREFIX_ . 'mi_entidad\`,
            \`' . _DB_PREFIX_ . 'mi_entidad_shop\`';

        return Db::getInstance()->execute($sql) 
            && parent::uninstall();
    }
}</code></pre>

        <h3>10.2. Migraciones (Actualizaciones de Esquema)</h3>
        <p>Cuando lanzas una nueva versión del módulo (ej. 2.0.0) que cambia la BD, debes crear un archivo en <code>upgrade/upgrade-2.0.0.php</code>.</p>

        <pre><code class="language-php">// Archivo: modules/mimodulo/upgrade/upgrade-2.0.0.php
if (!defined('_PS_VERSION_')) {
    exit;
}

function upgrade_module_2_0_0($module): bool
{
    // Añadir nueva columna
    $sql = 'ALTER TABLE \`' . _DB_PREFIX_ . 'mi_entidad\` 
            ADD COLUMN \`email\` VARCHAR(255) NULL AFTER \`nombre\`';

    if (!Db::getInstance()->execute($sql)) {
        return false;
    }

    // Migración de datos: Actualizar datos existentes
    Db::getInstance()->update(
        'mi_entidad',
        ['activo' => 1],
        'activo IS NULL'
    );

    return true;
}</code></pre>

        <h2 class="section-title">11. ObjectModel vs Doctrine</h2>
        <p>PrestaShop está en un proceso de transición. El Back Office moderno usa Doctrine, pero los módulos siguen dependiendo en gran medida de ObjectModel.</p>

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
                        <td>Desarrollo de Módulos, Front Office, Entidades Custom.</td>
                        <td>Core de PrestaShop 8+, Controladores Symfony nuevos.</td>
                    </tr>
                    <tr>
                        <td><strong>Definición</strong></td>
                        <td>Array estático <code>$definition</code> en la clase.</td>
                        <td>Atributos PHP 8 (Annotations) o XML/YAML.</td>
                    </tr>
                    <tr>
                        <td><strong>Relaciones</strong></td>
                        <td>Manuales (implementar getters).</td>
                        <td>Automáticas (OneToMany, ManyToOne) con lazy loading.</td>
                    </tr>
                    <tr>
                        <td><strong>Query Builder</strong></td>
                        <td><code>DbQuery</code> (sencillo, limitado).</td>
                        <td><code>DQL</code> (Doctrine Query Language, muy potente).</td>
                    </tr>
                    <tr>
                        <td><strong>Migraciones</strong></td>
                        <td>SQL manual en scripts de upgrade.</td>
                        <td>Doctrine Migrations (comando diff/migrate).</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <h2 class="section-title">12. Best Practices</h2>
        <ul>
            <li><strong>Sanitización:</strong> PrestaShop no usa prepared statements reales en ObjectModel. Siempre usa <code>(int)</code> para enteros y <code>pSQL()</code> para strings en consultas manuales.</li>
            <li><strong>Validación explícita:</strong> Aunque <code>add()</code> valida, llama a <code>validateFields()</code> antes para poder mostrar mensajes de error amigables al usuario.</li>
            <li><strong>Índices:</strong> Si buscas por un campo (ej. <code>reference</code>), asegúrate de añadir un índice en la creación de la tabla. ObjectModel no lo hace por ti.</li>
            <li><strong>Evita N+1:</strong> No hagas bucles cargando objetos completos. Usa <code>DbQuery</code> para traer solo los datos necesarios o hidrata manualmente.</li>
            <li><strong>Transacciones:</strong> Si modificas varias tablas (ej. Pedido + Líneas de Pedido), usa transacciones para evitar inconsistencias si algo falla a mitad.</li>
        </ul>

        <h3>12.1. Ejemplo de Transacciones</h3>
        <p>Las transacciones aseguran atomicidad: o se guarda todo, o no se guarda nada.</p>

        <pre><code class="language-php">try {
    Db::getInstance()->beginTransaction();

    $producto = new Producto();
    $producto->nombre = 'Nuevo Producto';
    $producto->add(); // Si falla, lanza excepción o devuelve false

    // Asociar a categorías
    $producto->setCategorias([1, 2, 3]);

    // Crear stock inicial
    $stock = new Stock();
    $stock->id_producto = $producto->id;
    $stock->cantidad = 100;
    $stock->add();

    Db::getInstance()->commit(); // Confirma cambios
} catch (Exception $e) {
    Db::getInstance()->rollback(); // Deshace cambios si hubo error
    PrestaShopLogger::addLog('Error crítico: ' . $e->getMessage(), 3);
    throw $e; // Relanzar para que el controlador lo maneje
}</code></pre>
    </div>
`;

const configuracionMultitiendaIdioma = `
    <h1>Configuración Multitienda y Multi-idioma en PrestaShop</h1>

    <p>PrestaShop está diseñado nativamente para soportar múltiples tiendas y múltiples idiomas desde una única instalación. Comprender cómo interactúan estas capas con el modelo de datos es vital para desarrollar módulos compatibles.</p>

    <h2>1. Sistema Multitienda (Multistore)</h2>
    <p>La funcionalidad multitienda permite gestionar múltiples front-offices desde un único back-office, compartiendo (o no) clientes, pedidos y stock.</p>

    <h3>Jerarquía de Tiendas</h3>
    <ul>
        <li><strong>All Shops (Contexto Global)</strong>: Afecta a todas las tiendas.</li>
        <li><strong>Shop Group (Grupo de Tiendas)</strong>: Un conjunto de tiendas que pueden compartir clientes y pedidos.</li>
        <li><strong>Shop (Tienda Individual)</strong>: La instancia específica donde navega el cliente.</li>
    </ul>

    <h3>Detección y Contexto</h3>
    <div class="code-block"><pre><code>&lt;?php
// Verificar si la multitienda está activa
if (Shop::isFeatureActive()) {
    // Lógica específica para multitienda
}

// Obtener el contexto actual
$context = Shop::getContext(); // Shop::CONTEXT_ALL, Shop::CONTEXT_GROUP, Shop::CONTEXT_SHOP

// Obtener ID de la tienda actual
$id_shop = Context::getContext()->shop->id;

// Obtener ID del grupo actual
$id_shop_group = Context::getContext()->shop->id_shop_group;
?&gt;</code></pre></div>

    <h3>Tablas _shop en la Base de Datos</h3>
    <p>Cuando se activa la multitienda, muchas tablas principales ganan una tabla asociada <code>_shop</code> para guardar configuraciones específicas por tienda.</p>
    <ul>
        <li><code>ps_product</code>: Datos globales del producto (referencia, peso).</li>
        <li><code>ps_product_shop</code>: Datos específicos por tienda (precio, activo/inactivo, visibilidad).</li>
    </ul>

    <div class="warning-box">
        <strong>⚠️ Desarrollo de Módulos:</strong>
        Al crear tablas personalizadas para tu módulo, si los datos varían por tienda, debes crear una tabla <code>ps_mimodulo_shop</code> que contenga <code>id_mimodulo</code> y <code>id_shop</code> como clave primaria compuesta.
    </div>

    <h3>Recuperación de Configuración</h3>
    <p>La clase <code>Configuration</code> maneja automáticamente el contexto, pero puedes forzarlo:</p>

    <div class="code-block"><pre><code>&lt;?php
// Obtiene el valor para el contexto actual (automático)
$valor = Configuration::get('MY_CONFIG');

// Obtener valor global (todas las tiendas)
$global = Configuration::getGlobalValue('MY_CONFIG');

// Forzar valor de una tienda específica
$valorTienda1 = Configuration::get('MY_CONFIG', null, null, 1); // id_shop = 1
?&gt;</code></pre></div>

    <h2>2. Sistema Multi-idioma</h2>
    <p>PrestaShop permite tener contenido traducido para casi cualquier entidad (Productos, Categorías, CMS, Configuraciones).</p>

    <h3>La Clase Language</h3>
    <div class="code-block"><pre><code>&lt;?php
// Obtener idioma actual del usuario
$id_lang = Context::getContext()->language->id;

// Obtener todos los idiomas activos
$languages = Language::getLanguages(true); // true = solo activos

foreach ($languages as $lang) {
    echo $lang['id_lang'] . ' - ' . $lang['iso_code']; // 1 - es, 2 - en
}
?&gt;</code></pre></div>

    <h3>Tablas _lang en la Base de Datos</h3>
    <p>Cualquier campo traducible se mueve a una tabla con sufijo <code>_lang</code>.</p>
    <ul>
        <li><code>ps_product</code>: Datos no traducibles (precio, referencia).</li>
        <li><code>ps_product_lang</code>: Datos traducibles (nombre, descripción, link_rewrite).</li>
    </ul>

    <p><strong>Estructura típica de tabla _lang:</strong></p>
    <ul>
        <li><code>id_entity</code> (PK)</li>
        <li><code>id_shop</code> (PK) - ¡Importante! Las traducciones pueden variar por tienda.</li>
        <li><code>id_lang</code> (PK)</li>
        <li><code>field_name</code> (El contenido traducido)</li>
    </ul>

    <h3>Manejo en ObjectModel</h3>
    <p>Al definir un <code>ObjectModel</code>, indicamos qué campos son multilenguaje:</p>

    <div class="code-block"><pre><code>&lt;?php
public static $definition = [
    'fields' => [
        'name' => [
            'type' => self::TYPE_STRING, 
            'lang' => true, // <--- Habilita multi-idioma
            'required' => true
        ],
    ],
];
?&gt;</code></pre></div>

    <p>Al acceder a una propiedad multilenguaje de un objeto cargado:</p>
    <div class="code-block"><pre><code>&lt;?php
$product = new Product($id_product);

// Si se cargó con un id_lang específico en el constructor:
// $product = new Product($id_product, false, $id_lang);
echo $product->name; // String: "Camiseta"

// Si NO se especificó idioma (carga todos):
print_r($product->name);
// Array: [1 => "Camiseta", 2 => "T-Shirt"]
?&gt;</code></pre></div>

    <h2>3. Traducciones en Módulos (Internacionalización)</h2>
    <p>Para textos estáticos en PHP y Smarty/Twig, se utiliza el sistema de traducción de Symfony (PS 1.7+).</p>

    <h3>En Controladores/Clases (PHP)</h3>
    <div class="code-block"><pre><code>&lt;?php
// Sintaxis moderna (TranslatableTrait)
$this->trans('Hello World', [], 'Modules.Mymodule.Admin');

// Sintaxis Legacy (evitar en código nuevo)
$this->l('Hello World');
?&gt;</code></pre></div>

    <h3>En Plantillas (Smarty)</h3>
    <div class="code-block"><pre><code>{l s='Hello World' d='Modules.Mymodule.Shop'}</code></pre></div>

    <h3>En Plantillas (Twig)</h3>
    <div class="code-block"><pre><code>{{ 'Hello World'|trans({}, 'Modules.Mymodule.Admin') }}</code></pre></div>

    <div class="info-box">
        <strong>💡 Dominios de Traducción:</strong>
        Organiza tus traducciones usando dominios estándar: <code>Modules.NombreModulo.Ubicacion</code> (ej. <code>Modules.MyModule.Admin</code> o <code>Modules.MyModule.Shop</code>).
    </div>
`;

// @ts-nocheck
const estructuraTemaClassicStarter = `
    <div class="content-section">
        <h1 id="estructura-tema-classic-starter">Estructura de un Tema (Classic, Starter Theme)</h1>
        <p>El desarrollo de temas en PrestaShop 8 se basa en el sistema de plantillas Smarty y una estructura de archivos organizada que permite la herencia y la personalización modular. Comprender la diferencia entre el <strong>Classic Theme</strong> y el <strong>Starter Theme</strong> es fundamental para iniciar un nuevo proyecto.</p>

        <h2 class="section-title">1. Classic Theme vs. Starter Theme</h2>
        
        <div class="row">
            <div class="col-md-6">
                <div class="card mb-3">
                    <div class="card-header bg-primary text-white">Classic Theme</div>
                    <div class="card-body">
                        <p>Es el tema por defecto de PrestaShop. Es un tema completo, funcional y listo para usar.</p>
                        <ul>
                            <li><strong>Uso recomendado:</strong> Como base para crear temas hijos (Child Themes) o para tiendas que necesitan pocas modificaciones.</li>
                            <li><strong>Características:</strong> Incluye todos los estilos, scripts y plantillas necesarios para una tienda estándar.</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card mb-3">
                    <div class="card-header bg-dark text-white">Starter Theme</div>
                    <div class="card-body">
                        <p>Es un esqueleto mínimo que contiene solo la lógica y la estructura HTML necesaria, sin estilos CSS ni scripts JS superfluos.</p>
                        <ul>
                            <li><strong>Uso recomendado:</strong> Para desarrolladores que quieren construir un diseño totalmente personalizado desde cero sin "limpiar" estilos preexistentes.</li>
                            <li><strong>Características:</strong> HTML semántico, bloques Smarty definidos, pero sin diseño visual (CSS).</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <h2 class="section-title">2. Estructura de Directorios de un Tema</h2>
        <p>Todos los temas deben residir en el directorio <code>/themes/</code> de tu instalación. Una estructura típica (basada en Classic) se ve así:</p>

        <pre><code class="language-plaintext">/themes/mi-tema/
├── assets/                 # Archivos estáticos compilados (CSS, JS, fuentes, imágenes)
│   ├── css/
│   ├── js/
│   └── img/
├── config/                 # Configuración del tema
│   └── theme.yml           # Archivo principal de configuración
├── modules/                # Sobrescritura de plantillas de módulos (Overrides)
│   └── ps_shoppingcart/
│       └── ps_shoppingcart.tpl
├── templates/              # Plantillas Smarty (.tpl)
│   ├── _partials/          # Fragmentos reutilizables (header, footer, breadcrumb)
│   ├── catalog/            # Plantillas de productos y categorías
│   │   ├── _partials/
│   │   ├── product.tpl
│   │   └── listing/
│   ├── checkout/           # Proceso de compra
│   ├── cms/                # Páginas de contenido
│   ├── customer/           # Área de cliente
│   ├── errors/             # Páginas de error (404, 500)
│   └── layouts/            # Estructuras base (columnas, wrappers)
├── preview.png             # Imagen de vista previa en el Back Office (180x180px)
└── composer.json           # Dependencias (opcional)</code></pre>

        <h2 class="section-title">3. El Archivo de Configuración (theme.yml)</h2>
        <p>El archivo <code>config/theme.yml</code> es el corazón de tu tema. Define metadatos, configuración de imágenes, hooks y módulos por defecto.</p>

        <pre><code class="language-yaml">parent: classic  # Opcional: Define si este es un tema hijo
name: mi-tema
display_name: 'Mi Tema Personalizado'
version: 1.0.0
author:
  name: 'Tu Nombre'
  email: 'tu@email.com'
  url: 'http://www.tuweb.com'

meta:
  compatibility:
    from: 8.0.0
    to: ~

# Configuración de imágenes (se regenerarán al instalar el tema)
image_types:
  cart_default:
    width: 125
    height: 125
    scope: [products]
  small_default:
    width: 98
    height: 98
    scope: [products, categories, manufacturers, suppliers]
  medium_default:
    width: 452
    height: 452
    scope: [products, manufacturers, suppliers]
  large_default:
    width: 800
    height: 800
    scope: [products, manufacturers, suppliers]

# Configuración por defecto del tema
global_settings:
  configuration:
    PS_IMAGE_QUALITY: png
  modules:
    to_enable:
      - ps_linklist
      - ps_mainmenu
    to_disable:
      - ps_banner

# Hooks y posiciones de módulos
theme_settings:
  default_layout: layout-full-width
  layouts:
    category: layout-left-column
    product: layout-full-width</code></pre>

        <h2 class="section-title">4. Sistema de Plantillas y Herencia</h2>
        <p>PrestaShop utiliza un potente sistema de herencia de plantillas. El archivo base suele ser <code>layouts/layout-both-columns.tpl</code>.</p>

        <h3>4.1. Jerarquía de Layouts</h3>
        <ol>
            <li><strong>layout-both-columns.tpl:</strong> Define la estructura HTML base (html, head, body, header, columnas, footer).</li>
            <li><strong>layout-left-column.tpl:</strong> Extiende <em>both-columns</em> y oculta la columna derecha.</li>
            <li><strong>layout-full-width.tpl:</strong> Extiende <em>both-columns</em> y oculta ambas columnas laterales.</li>
            <li><strong>page.tpl:</strong> Plantilla genérica para páginas.</li>
        </ol>

        <h3>4.2. Ejemplo de Herencia (Extends y Block)</h3>
        <p>Para modificar una parte de la plantilla sin reescribir todo el archivo, usamos <code>{extends}</code> y <code>{block}</code>.</p>

        <p><strong>Archivo Padre (layouts/layout-both-columns.tpl):</strong></p>
        <pre><code class="language-smarty">&lt;!doctype html&gt;
&lt;html lang="{$language.iso_code}"&gt;
  &lt;head&gt;
    {block name='head'}
      {include file='_partials/head.tpl'}
    {/block}
  &lt;/head&gt;
  &lt;body&gt;
    {block name='content_wrapper'}
      &lt;div id="content-wrapper" class="left-column right-column"&gt;
        {block name='content'}
          &lt;p&gt;Contenido por defecto&lt;/p&gt;
        {/block}
      &lt;/div&gt;
    {/block}
  &lt;/body&gt;
&lt;/html&gt;</code></pre>

        <p><strong>Archivo Hijo (page.tpl):</strong></p>
        <pre><code class="language-smarty">{extends file='layouts/layout-both-columns.tpl'}

{block name='content'}
  &lt;section id="main"&gt;
    &lt;h1&gt;{$page.title}&lt;/h1&gt;
    {$page.body nofilter}
  &lt;/section&gt;
{/block}</code></pre>

        <h2 class="section-title">5. Temas Hijos (Child Themes)</h2>
        <p>La forma más segura de modificar un tema existente (como Classic) es crear un Tema Hijo. Esto permite actualizar el tema padre sin perder tus cambios.</p>

        <h3>Pasos para crear un Tema Hijo:</h3>
        <ol>
            <li>Crea una carpeta en <code>/themes/mi-tema-hijo/</code>.</li>
            <li>Crea el archivo <code>config/theme.yml</code> y define la propiedad <code>parent</code>.</li>
            <li>Crea <code>preview.png</code>.</li>
        </ol>

        <p><strong>Ejemplo theme.yml para Tema Hijo:</strong></p>
        <pre><code class="language-yaml">parent: classic
name: mi-tema-hijo
display_name: 'Mi Tema Hijo de Classic'
version: 1.0.0
assets:
  use_parent_assets: true # Usa CSS/JS del padre por defecto</code></pre>

        <p>Ahora, solo necesitas crear en tu tema hijo los archivos <code>.tpl</code> que quieras modificar. PrestaShop buscará primero en tu tema hijo; si no encuentra el archivo, usará el del tema padre.</p>

        <h2 class="section-title">6. Assets y Compilación (Webpack)</h2>
        <p>Los temas modernos de PrestaShop utilizan Webpack para compilar SCSS a CSS y transpirar JavaScript ES6+.</p>
        
        <p>En la carpeta <code>_dev/</code> del tema (si estás desarrollando desde cero o modificando el source):</p>
        
        <pre><code class="language-bash"># Instalar dependencias
npm install

# Compilar para desarrollo (con sourcemaps y watch)
npm run watch

# Compilar para producción (minificado)
npm run build</code></pre>

        <p>El archivo <code>webpack.config.js</code> define cómo se procesan los archivos de <code>_dev/css/theme.scss</code> y <code>_dev/js/theme.js</code> hacia la carpeta <code>assets/</code>.</p>
    </div>
    `;

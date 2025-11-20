const gestionActivosCssJs = `
    <div class="content-section">
        <h1 id="gestion-activos-css-js">Gestión de Activos (CSS/JS) y Compilación</h1>
        <p>La gestión eficiente de activos (CSS y JavaScript) es crucial para el rendimiento y la experiencia del usuario. PrestaShop ofrece varios métodos para incluir archivos estáticos, desde hooks básicos hasta sistemas de compilación modernos con Webpack. En esta sección exploraremos tanto el enfoque legacy como las mejores prácticas modernas.</p>

        <h2 class="section-title">1. Registro de Activos en el Front Office</h2>
        <p>Para incluir CSS y JavaScript en el Front Office, utilizamos los métodos <code>registerStylesheet()</code> y <code>registerJavascript()</code> disponibles en el contexto del hook <code>hookDisplayHeader</code>.</p>

        <h3>1.1. Método Moderno: registerStylesheet y registerJavascript</h3>
        <p>Este es el método recomendado desde PrestaShop 1.7+. Permite un control granular sobre la carga, prioridad, y posición de los archivos.</p>

        <pre><code class="language-php">declare(strict_types=1);

class MiModulo extends Module
{
    public function hookDisplayHeader(): void
    {
        // Registrar CSS
        $this->context->controller->registerStylesheet(
            'mimodulo-style', // ID único
            'modules/' . $this->name . '/views/css/front.css', // Ruta relativa a la raíz de PrestaShop
            [
                'media' => 'all', // Media query: all, screen, print
                'priority' => 200, // Prioridad de carga (menor = antes)
            ]
        );

        // Registrar JavaScript
        $this->context->controller->registerJavascript(
            'mimodulo-main-js',
            'modules/' . $this->name . '/views/js/front.js',
            [
                'position' => 'bottom', // 'head' o 'bottom'
                'priority' => 200,
                'attributes' => 'defer', // Atributos HTML: defer, async
            ]
        );

        // JavaScript con dependencias externas (ejemplo: requiere jQuery)
        $this->context->controller->registerJavascript(
            'mimodulo-jquery-plugin',
            'modules/' . $this->name . '/views/js/plugin.js',
            [
                'position' => 'bottom',
                'priority' => 210, // Cargar después de jQuery (priority 100)
            ]
        );
    }
}</code></pre>

        <h3>1.2. Método Legacy: addCSS y addJS</h3>
        <p>Aunque funcional, este método está <strong>deprecated</strong> y no ofrece control de prioridad ni lazy loading. Está aquí por compatibilidad con módulos antiguos.</p>

        <pre><code class="language-php">public function hookDisplayHeader(): void
{
    // Legacy: No recomendado
    $this->context->controller->addCSS($this->_path . 'views/css/front.css', 'all');
    $this->context->controller->addJS($this->_path . 'views/js/front.js');
}</code></pre>

        <h3>1.3. Inline CSS y JavaScript</h3>
        <p>Para pequeños fragmentos de código que dependen de variables PHP dinámicas, puedes incluir estilos o scripts inline.</p>

        <pre><code class="language-php">public function hookDisplayHeader(): string
{
    $primaryColor = Configuration::get('MIMODULO_PRIMARY_COLOR');
    
    $inlineCSS = "
        <style>
            .mi-modulo-widget {
                background-color: {$primaryColor};
                padding: 20px;
            }
        </style>
    ";

    // Sanitizar salida si incluye datos del usuario
    return $inlineCSS;
}

public function hookDisplayFooter(): string
{
    $apiEndpoint = Tools::jsonEncode($this->getApiEndpoint());
    
    return "
        <script>
            window.miModuloConfig = {
                apiEndpoint: {$apiEndpoint},
                debug: " . (_PS_MODE_DEV_ ? 'true' : 'false') . "
            };
        </script>
    ";
}</code></pre>

        <h2 class="section-title">2. Activos en el Back Office</h2>
        <p>El Back Office tiene su propio sistema de gestión de activos. Los controladores heredan de <code>ModuleAdminController</code> o <code>FrameworkBundleAdminController</code> (Symfony).</p>

        <h3>2.1. CSS y JS en Controladores Legacy del Back Office</h3>

        <pre><code class="language-php">class AdminMiModuloController extends ModuleAdminController
{
    public function setMedia(): void
    {
        parent::setMedia();

        // Añadir CSS personalizado
        $this->addCSS($this->module->getPathUri() . 'views/css/admin.css');

        // Añadir JavaScript
        $this->addJS($this->module->getPathUri() . 'views/js/admin.js');

        // Incluir librería externa (ejemplo: Chart.js)
        $this->addJS('https://cdn.jsdelivr.net/npm/chart.js');
    }
}</code></pre>

        <h3>2.2. Assets en Controladores Symfony</h3>
        <p>En controladores Symfony, los assets se gestionan mediante Twig y el componente <code>Asset</code> de Symfony.</p>

        <pre><code class="language-twig">{# modules/mimodulo/views/templates/admin/configuracion.html.twig #}
{% extends '@PrestaShop/Admin/layout.html.twig' %}

{% block stylesheets %}
    {{ parent() }}
    <link href="{{ asset('modules/mimodulo/views/css/admin.css') }}" rel="stylesheet">
{% endblock %}

{% block javascripts %}
    {{ parent() }}
    <script src="{{ asset('modules/mimodulo/views/js/admin.js') }}"></script>
{% endblock %}

{% block content %}
    <div class="mi-modulo-admin">
        <h2>{{ 'Configuración'|trans({}, 'Modules.Mimodulo.Admin') }}</h2>
        <!-- Contenido -->
    </div>
{% endblock %}</code></pre>

        <h2 class="section-title">3. Organización de Assets</h2>
        <p>Una estructura clara facilita el mantenimiento. Aquí un ejemplo de organización recomendada:</p>

        <pre><code class="language-plaintext">mimodulo/
├── views/
│   ├── css/
│   │   ├── front.css          # Estilos del Front Office
│   │   ├── admin.css          # Estilos del Back Office
│   │   └── components/        # Estilos por componente
│   │       ├── widget.css
│   │       └── modal.css
│   ├── js/
│   │   ├── front.js           # JavaScript Front Office
│   │   ├── admin.js           # JavaScript Back Office
│   │   └── modules/           # Módulos JS reutilizables
│   │       ├── api-client.js
│   │       └── validator.js
│   ├── img/                   # Imágenes estáticas
│   │   ├── logo.svg
│   │   └── icons/
│   └── templates/
│       ├── front/
│       └── admin/
└── src/                       # Assets fuente (antes de compilar)
    ├── scss/                  # Sass/SCSS
    │   ├── front.scss
    │   ├── admin.scss
    │   └── _variables.scss
    └── ts/                    # TypeScript (opcional)
        ├── front.ts
        └── admin.ts</code></pre>

        <h2 class="section-title">4. Compilación de Assets con Webpack</h2>
        <p>PrestaShop 8+ utiliza <strong>Webpack</strong> para compilar assets del core. Puedes usar la misma herramienta para tu módulo, permitiendo uso de Sass, TypeScript, minificación, y tree-shaking.</p>

        <h3>4.1. Instalación de Dependencias</h3>

        <pre><code class="language-bash"># Inicializar package.json en tu módulo
cd modules/mimodulo
npm init -y

# Instalar Webpack y loaders
npm install --save-dev webpack webpack-cli css-loader sass sass-loader style-loader mini-css-extract-plugin

# Para TypeScript (opcional)
npm install --save-dev typescript ts-loader

# Para optimización
npm install --save-dev terser-webpack-plugin css-minimizer-webpack-plugin</code></pre>

        <h3>4.2. Configuración de Webpack</h3>

        <pre><code class="language-javascript">// modules/mimodulo/webpack.config.js
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = (env, argv) => {
    const isDevelopment = argv.mode === 'development';

    return {
        entry: {
            front: './src/js/front.js',
            admin: './src/js/admin.js',
        },
        output: {
            path: path.resolve(__dirname, 'views/dist'),
            filename: 'js/[name].bundle.js',
            clean: true, // Limpia dist/ antes de compilar
        },
        module: {
            rules: [
                {
                    test: /\.scss$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        'sass-loader',
                    ],
                },
                {
                    test: /\.ts$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
                {
                    test: /\.(png|svg|jpg|jpeg|gif)$/i,
                    type: 'asset/resource',
                    generator: {
                        filename: 'img/[name][ext]',
                    },
                },
            ],
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: 'css/[name].bundle.css',
            }),
        ],
        optimization: {
            minimize: !isDevelopment,
            minimizer: [
                new TerserPlugin(),
                new CssMinimizerPlugin(),
            ],
        },
        resolve: {
            extensions: ['.ts', '.js', '.scss', '.css'],
        },
        devtool: isDevelopment ? 'source-map' : false,
    };
};</code></pre>

        <h3>4.3. Scripts en package.json</h3>

        <pre><code class="language-json">{
  "name": "mimodulo",
  "version": "1.0.0",
  "scripts": {
    "build": "webpack --mode production",
    "dev": "webpack --mode development --watch",
    "build:dev": "webpack --mode development"
  },
  "devDependencies": {
    "webpack": "^5.88.0",
    "webpack-cli": "^5.1.4",
    "sass": "^1.63.6",
    "sass-loader": "^13.3.2",
    "css-loader": "^6.8.1",
    "mini-css-extract-plugin": "^2.7.6"
  }
}</code></pre>

        <h3>4.4. Uso de Assets Compilados</h3>

        <pre><code class="language-php">public function hookDisplayHeader(): void
{
    // Usar archivos compilados
    $this->context->controller->registerStylesheet(
        'mimodulo-front',
        'modules/' . $this->name . '/views/dist/css/front.bundle.css',
        ['priority' => 200]
    );

    $this->context->controller->registerJavascript(
        'mimodulo-front',
        'modules/' . $this->name . '/views/dist/js/front.bundle.js',
        ['position' => 'bottom', 'priority' => 200]
    );
}</code></pre>

        <h2 class="section-title">5. Uso de SCSS/Sass</h2>
        <p>Sass permite variables, anidamiento, mixins, y funciones que mejoran la mantenibilidad del CSS.</p>

        <h3>5.1. Ejemplo de Estructura SCSS</h3>

        <pre><code class="language-scss">// src/scss/_variables.scss
$primary-color: #3498db;
$secondary-color: #2ecc71;
$font-stack: 'Helvetica Neue', Helvetica, Arial, sans-serif;
$breakpoint-tablet: 768px;

// src/scss/_mixins.scss
@mixin respond-to($breakpoint) {
  @media (min-width: $breakpoint) {
    @content;
  }
}

@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

// src/scss/front.scss
@import 'variables';
@import 'mixins';

.mi-modulo-widget {
  background-color: $primary-color;
  font-family: $font-stack;
  padding: 1rem;

  @include respond-to($breakpoint-tablet) {
    padding: 2rem;
  }

  &__header {
    @include flex-center;
    font-weight: bold;
  }

  &__content {
    margin-top: 1rem;
    color: darken($primary-color, 20%);
  }
}</code></pre>

        <h2 class="section-title">6. Optimización y Performance</h2>
        <p>Reducir el peso y optimizar la carga de activos mejora significativamente el rendimiento.</p>

        <h3>6.1. Minificación</h3>
        <p>Webpack se encarga automáticamente en modo <code>production</code>. Si trabajas sin Webpack:</p>

        <pre><code class="language-bash"># Minificar CSS manualmente con cssnano
npm install -g cssnano-cli
cssnano views/css/front.css views/css/front.min.css

# Minificar JS con UglifyJS
npm install -g uglify-js
uglifyjs views/js/front.js -o views/js/front.min.js -c -m</code></pre>

        <h3>6.2. Lazy Loading de Scripts</h3>
        <p>Carga scripts solo cuando se necesiten usando el atributo <code>defer</code> o <code>async</code>.</p>

        <pre><code class="language-php">$this->context->controller->registerJavascript(
    'mimodulo-analytics',
    'modules/' . $this->name . '/views/js/analytics.js',
    [
        'position' => 'bottom',
        'attributes' => 'defer', // No bloquea el parsing del HTML
    ]
);</code></pre>

        <h3>6.3. Combinación de Archivos</h3>
        <p>PrestaShop tiene un sistema de combinación (CCC - Combine, Compress, Cache) activable en <strong>Rendimiento</strong>. Sin embargo, con Webpack esto no es necesario ya que tú mismo controlas el bundling.</p>

        <h2 class="section-title">7. Versionado de Assets (Cache Busting)</h2>
        <p>Para evitar que los navegadores cacheen versiones antiguas al actualizar el módulo, añade un hash de versión a las URLs.</p>

        <h3>7.1. Manual: Query String</h3>

        <pre><code class="language-php">public function hookDisplayHeader(): void
{
    $version = $this->version; // '1.2.3'
    
    $this->context->controller->registerStylesheet(
        'mimodulo-front',
        'modules/' . $this->name . '/views/css/front.css?v=' . $version,
        ['priority' => 200]
    );
}</code></pre>

        <h3>7.2. Automático con Webpack</h3>
        <p>Webpack puede generar hashes automáticamente en los nombres de archivo.</p>

        <pre><code class="language-javascript">// webpack.config.js
output: {
    path: path.resolve(__dirname, 'views/dist'),
    filename: 'js/[name].[contenthash].js', // Genera: front.a3f4b2c5.js
    clean: true,
}</code></pre>

        <h2 class="section-title">8. Integración con Frameworks CSS/JS</h2>
        <p>Puedes integrar librerías populares como Bootstrap, Tailwind, Vue.js, React, etc.</p>

        <h3>8.1. Ejemplo con Vue.js</h3>

        <pre><code class="language-bash">npm install vue</code></pre>

        <pre><code class="language-javascript">// src/js/front.js
import { createApp } from 'vue';
import MiComponente from './components/MiComponente.vue';

createApp(MiComponente).mount('#mi-modulo-app');</code></pre>

        <pre><code class="language-php">// Renderizar el contenedor en un hook
public function hookDisplayHome(): string
{
    return '<div id="mi-modulo-app"></div>';
}</code></pre>

        <h2 class="section-title">9. Mejores Prácticas</h2>
        <ul>
            <li><strong>Usa Webpack para proyectos grandes:</strong> Facilita el uso de preprocesadores, módulos, y optimización automática.</li>
            <li><strong>Divide assets por contexto:</strong> Separa archivos de Front Office y Back Office para evitar cargar código innecesario.</li>
            <li><strong>Evita polyfills innecesarios:</strong> PrestaShop 8+ soporta navegadores modernos. No incluyas Babel si solo usas ES6+.</li>
            <li><strong>Critical CSS:</strong> Para mejorar FCP (First Contentful Paint), incluye el CSS crítico inline y difiere el resto.</li>
            <li><strong>Carga condicional:</strong> Si un script solo se usa en ciertas páginas (ej. checkout), cárgalo solo en esas páginas usando condiciones en el hook.</li>
        </ul>

        <h3>9.1. Carga Condicional por Página</h3>

        <pre><code class="language-php">public function hookDisplayHeader(): void
{
    $controller = $this->context->controller;

    // Solo cargar en la página de producto
    if ($controller instanceof ProductController) {
        $this->context->controller->registerJavascript(
            'mimodulo-product-zoom',
            'modules/' . $this->name . '/views/js/product-zoom.js',
            ['position' => 'bottom']
        );
    }

    // Solo en el checkout
    if ($controller instanceof OrderController) {
        $this->context->controller->registerStylesheet(
            'mimodulo-checkout',
            'modules/' . $this->name . '/views/css/checkout.css'
        );
    }
}</code></pre>
    </div>
`;

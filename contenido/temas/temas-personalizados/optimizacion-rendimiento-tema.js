// @ts-nocheck
const optimizacionRendimientoTema = `
    <div class="content-section">
        <h1 id="optimizacion-rendimiento-tema">Optimización de Rendimiento del Tema</h1>
        <p>El rendimiento del Front Office es crucial para la experiencia del usuario y el SEO. Un tema bien optimizado en PrestaShop 8.9+ puede reducir significativamente los tiempos de carga, mejorar las conversiones y reducir la tasa de rebote. Este capítulo cubre técnicas avanzadas de optimización específicas para temas de PrestaShop.</p>

        <h2 class="section-title">1. Métricas Clave de Rendimiento</h2>
        
        <h3>1.1. Core Web Vitals de Google</h3>
        <p>Estas son las métricas que Google utiliza para evaluar la experiencia del usuario:</p>

        <table class="table table-bordered">
            <thead class="table-dark">
                <tr>
                    <th>Métrica</th>
                    <th>Significado</th>
                    <th>Objetivo</th>
                    <th>Cómo Mejorar</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>LCP</strong><br>(Largest Contentful Paint)</td>
                    <td>Tiempo hasta que el contenido principal es visible</td>
                    <td>&lt; 2.5s</td>
                    <td>Optimizar imágenes, lazy loading, preload de recursos críticos</td>
                </tr>
                <tr>
                    <td><strong>FID</strong><br>(First Input Delay)</td>
                    <td>Tiempo hasta que la página responde a la primera interacción</td>
                    <td>&lt; 100ms</td>
                    <td>Reducir JavaScript, diferir scripts no críticos</td>
                </tr>
                <tr>
                    <td><strong>CLS</strong><br>(Cumulative Layout Shift)</td>
                    <td>Estabilidad visual durante la carga</td>
                    <td>&lt; 0.1</td>
                    <td>Reservar espacio para imágenes, evitar contenido dinámico arriba</td>
                </tr>
                <tr>
                    <td><strong>FCP</strong><br>(First Contentful Paint)</td>
                    <td>Tiempo hasta que aparece el primer contenido</td>
                    <td>&lt; 1.8s</td>
                    <td>Critical CSS inline, optimizar server response time</td>
                </tr>
            </tbody>
        </table>

        <h3>1.2. Herramientas de Medición</h3>
        <ul>
            <li><strong>Google PageSpeed Insights:</strong> <a href="https://pagespeed.web.dev/" target="_blank" rel="noopener">pagespeed.web.dev</a></li>
            <li><strong>Lighthouse (Chrome DevTools):</strong> Auditoría completa de rendimiento, accesibilidad y SEO</li>
            <li><strong>WebPageTest:</strong> <a href="https://www.webpagetest.org/" target="_blank" rel="noopener">webpagetest.org</a> - Análisis detallado con waterfall charts</li>
            <li><strong>GTmetrix:</strong> <a href="https://gtmetrix.com/" target="_blank" rel="noopener">gtmetrix.com</a> - Comparación histórica de rendimiento</li>
        </ul>

        <h2 class="section-title">2. Optimización de Imágenes</h2>

        <h3>2.1. Formatos de Imagen Modernos</h3>
        <p>PrestaShop 8.9+ soporta formatos de imagen modernos. Configúralo desde el Back Office:</p>

        <pre><code class="language-plaintext">Back Office → Diseño → Imágenes
✅ Activar WebP: Reducción de 25-35% sin pérdida de calidad
✅ Activar AVIF: Reducción de 50% (soporte limitado en navegadores antiguos)
</code></pre>

        <h3>2.2. Lazy Loading Nativo con IntersectionObserver</h3>
        <pre><code class="language-html">{* /themes/mi-tema/templates/_partials/miniatures/product.tpl *}

<div class="product-miniature">
  <div class="product-thumbnail">
    {* Imagen principal con lazy loading nativo *}
    <img 
      src="{$product.cover.bySize.home_default.url}" 
      alt="{$product.cover.legend}" 
      loading="lazy"
      width="{$product.cover.bySize.home_default.width}"
      height="{$product.cover.bySize.home_default.height}"
      class="img-fluid">
    
    {* Imagen de placeholder con blur-up *}
    <img 
      src="{$product.cover.bySize.small_default.url}" 
      alt="{$product.cover.legend}" 
      class="img-placeholder"
      style="filter: blur(10px); transition: opacity 0.3s;"
      width="100%"
      height="auto">
  </div>
</div></code></pre>

        <h3>2.3. Responsive Images con srcset</h3>
        <pre><code class="language-html">{* Diferentes tamaños según viewport *}
<picture>
  <source 
    media="(max-width: 576px)" 
    srcset="{$product.cover.bySize.small_default.url}" 
    type="image/webp">
  <source 
    media="(max-width: 992px)" 
    srcset="{$product.cover.bySize.medium_default.url}" 
    type="image/webp">
  <source 
    srcset="{$product.cover.bySize.large_default.url}" 
    type="image/webp">
  
  {* Fallback para navegadores sin soporte WebP *}
  <img 
    src="{$product.cover.bySize.home_default.url}" 
    alt="{$product.cover.legend}"
    loading="lazy"
    width="400"
    height="400"
    class="img-fluid">
</picture></code></pre>

        <h3>2.4. Preload de Imágenes Críticas</h3>
        <p>Añade en el <code>&lt;head&gt;</code> de tu tema:</p>
        <pre><code class="language-html">{* /themes/mi-tema/templates/_partials/head.tpl *}

{block name='head_preload'}
  {* Precargar logo (LCP candidate) *}
  <link rel="preload" 
        as="image" 
        href="{$shop.logo}" 
        type="image/webp">
  
  {* Precargar imagen hero de homepage *}
  {if $page.page_name == 'index'}
    <link rel="preload" 
          as="image" 
          href="{$urls.base_url}themes/mi-tema/assets/img/hero-banner.webp" 
          type="image/webp">
  {/if}
{/block}</code></pre>

        <h2 class="section-title">3. Optimización de CSS</h2>

        <h3>3.1. Critical CSS Inline</h3>
        <p>Extrae e inline el CSS crítico para el primer pintado (above-the-fold):</p>

        <pre><code class="language-bash"># Generar CSS crítico con Critical
npm install --save-dev critical

# Generar desde la línea de comandos
npx critical https://tu-tienda.com \
  --inline \
  --base ./ \
  --css assets/css/theme.css \
  --width 1300 \
  --height 900 \
  --minify > critical.css</code></pre>

        <p>Luego añádelo inline en el head:</p>
        <pre><code class="language-html">{block name='head_critical_css'}
  <style>
    {* Pegar aquí el CSS crítico generado *}
    /* Critical CSS Above-the-fold */
    body{margin:0;font-family:Inter,sans-serif}
    .header{height:80px;background:#fff}
    .product-grid{display:grid;gap:20px}
    /* ... más estilos críticos ... */
  </style>
{/block}

{* Cargar el resto del CSS de forma asíncrona *}
<link rel="preload" 
      href="{$urls.css_url}theme.css" 
      as="style" 
      onload="this.onload=null;this.rel='stylesheet'">
<noscript>
  <link rel="stylesheet" href="{$urls.css_url}theme.css">
</noscript></code></pre>

        <h3>3.2. Remover CSS No Utilizado</h3>
        <pre><code class="language-bash"># Usar PurgeCSS para eliminar estilos no utilizados
npm install --save-dev @fullhuman/postcss-purgecss

# postcss.config.js
module.exports = {
  plugins: [
    require('@fullhuman/postcss-purgecss')({
      content: [
        './templates/**/*.tpl',
        './modules/**/*.tpl',
        './assets/js/**/*.js'
      ],
      safelist: [
        /^js-/,
        /^page-/,
        /modal/,
        /dropdown/,
        /tooltip/
      ]
    })
  ]
}</code></pre>

        <h3>3.3. Defer Non-Critical CSS</h3>
        <pre><code class="language-html">{* Diferir CSS de módulos no críticos *}
<link rel="preload" 
      href="{$urls.css_url}modules/ps_imageslider.css" 
      as="style" 
      onload="this.onload=null;this.rel='stylesheet'">

{* CSS de iconos/fuentes también puede diferirse *}
<link rel="preload" 
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" 
      as="style" 
      onload="this.onload=null;this.rel='stylesheet'"></code></pre>

        <h2 class="section-title">4. Optimización de JavaScript</h2>

        <h3>4.1. Defer y Async Estratégicamente</h3>
        <pre><code class="language-html">{* /themes/mi-tema/templates/_partials/javascript.tpl *}

{block name='javascript_bottom'}
  {* Scripts críticos que bloquean el render - Usar con precaución *}
  <script src="{$urls.base_url}themes/mi-tema/assets/js/critical.js"></script>
  
  {* Scripts que pueden esperar pero mantienen orden - DEFER *}
  <script src="{$urls.js_url}jquery-3.7.1.min.js" defer></script>
  <script src="{$urls.js_url}theme.js" defer></script>
  
  {* Scripts independientes que pueden cargar en paralelo - ASYNC *}
  <script src="{$urls.js_url}analytics.js" async></script>
  
  {* Scripts de terceros *}
  <script src="https://www.google-analytics.com/analytics.js" async></script>
{/block}</code></pre>

        <div class="alert alert-info">
            <strong>📌 Diferencia entre defer y async:</strong>
            <ul class="mb-0">
                <li><code>defer</code>: Descarga en paralelo, pero ejecuta en orden después del HTML</li>
                <li><code>async</code>: Descarga y ejecuta inmediatamente cuando está listo (sin orden garantizado)</li>
            </ul>
        </div>

        <h3>4.2. Code Splitting por Página</h3>
        <pre><code class="language-javascript">// webpack.config.js - Multiple entry points

module.exports = {
  entry: {
    theme: './_dev/js/theme.js',           // Código común
    product: './_dev/js/pages/product.js', // Solo página producto
    checkout: './_dev/js/pages/checkout.js', // Solo checkout
    listing: './_dev/js/pages/listing.js'  // Categorías y búsqueda
  },
  
  output: {
    path: path.resolve(__dirname, 'assets/js'),
    filename: '[name].js'
  },
  
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10
        }
      }
    }
  }
};</code></pre>

        <p>Luego carga condicionalmente por página:</p>
        <pre><code class="language-html">{* Cargar script específico solo en página de producto *}
{if $page.page_name == 'product'}
  <script src="{$urls.js_url}product.js" defer></script>
{/if}

{* Cargar script de checkout solo en proceso de compra *}
{if $page.page_name == 'cart' || $page.page_name == 'order'}
  <script src="{$urls.js_url}checkout.js" defer></script>
{/if}</code></pre>

        <h3>4.3. Lazy Loading de Módulos JavaScript</h3>
        <pre><code class="language-javascript">// theme.js - Cargar módulos bajo demanda

// Lazy load del módulo de galería solo cuando existe
if (document.querySelector('.product-images')) {
  import('./components/image-gallery.js')
    .then(module => {
      const ImageGallery = module.default;
      new ImageGallery('.product-images');
    })
    .catch(err => console.error('Error cargando galería:', err));
}

// Lazy load de validación de formularios solo en checkout
if (document.querySelector('#checkout-form')) {
  import('./components/form-validator.js')
    .then(module => {
      module.initFormValidation('#checkout-form');
    });
}</code></pre>

        <h2 class="section-title">5. Optimización de Fuentes</h2>

        <h3>5.1. Preconnect a Dominios de Fuentes</h3>
        <pre><code class="language-html">{block name='head_dns_prefetch'}
  {* Establecer conexión temprana con Google Fonts *}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  
  {* Prefetch de otros dominios externos *}
  <link rel="dns-prefetch" href="https://www.google-analytics.com">
  <link rel="dns-prefetch" href="{$urls.img_url}">
{/block}</code></pre>

        <h3>5.2. Font-Display: Swap</h3>
        <pre><code class="language-css">/* /assets/css/_fonts.scss */

@font-face {
  font-family: 'Inter';
  src: url('../fonts/inter-regular.woff2') format('woff2'),
       url('../fonts/inter-regular.woff') format('woff');
  font-weight: 400;
  font-style: normal;
  font-display: swap; /* Mostrar fuente del sistema mientras carga */
}

@font-face {
  font-family: 'Inter';
  src: url('../fonts/inter-bold.woff2') format('woff2'),
       url('../fonts/inter-bold.woff') format('woff');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}</code></pre>

        <h3>5.3. Subsetting de Fuentes</h3>
        <p>Cargar solo los caracteres que necesitas:</p>
        <pre><code class="language-html">{* Solo caracteres latinos y números *}
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap&subset=latin" rel="stylesheet">

{* Para fuentes locales, usar herramientas como glyphhanger *}</code></pre>

        <h2 class="section-title">6. Caché del Navegador y Service Workers</h2>

        <h3>6.1. Configurar Headers de Caché (.htaccess)</h3>
        <pre><code class="language-apache"># /themes/mi-tema/.htaccess

<IfModule mod_expires.c>
  ExpiresActive On
  
  # Imágenes - 1 año
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/avif "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  
  # CSS y JavaScript - 1 mes
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  
  # Fuentes - 1 año
  ExpiresByType font/woff2 "access plus 1 year"
  ExpiresByType font/woff "access plus 1 year"
  ExpiresByType font/ttf "access plus 1 year"
</IfModule>

# Cache-Control headers
<IfModule mod_headers.c>
  <FilesMatch "\\.(jpg|jpeg|png|gif|webp|css|js|woff2)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
</IfModule></code></pre>

        <h3>6.2. Versionado de Assets</h3>
        <p>Añadir hash de versión para forzar nueva descarga cuando cambies archivos:</p>
        <pre><code class="language-html">{* Usar versión del tema para invalidar caché *}
<link rel="stylesheet" href="{$urls.css_url}theme.css?v={$theme_version}">
<script src="{$urls.js_url}theme.js?v={$theme_version}"></script>

{* O usar timestamp *}
<link rel="stylesheet" href="{$urls.css_url}theme.css?v={$smarty.now}"></code></pre>

        <h2 class="section-title">7. Optimización de Base de Datos y Queries</h2>

        <h3>7.1. Reducir Queries en Plantillas</h3>
        <div class="alert alert-danger">
            <strong>❌ MAL - Query dentro del foreach:</strong>
            <pre class="mb-0"><code class="language-html">{foreach $products as $product}
  {* ¡Esto hace 1 query por cada producto! *}
  {assign var="category" value=Category::getCategory($product.id_category)}
  <span>{$category->name}</span>
{/foreach}</code></pre>
        </div>

        <div class="alert alert-success">
            <strong>✅ BIEN - Cargar datos en el controlador:</strong>
            <pre class="mb-0"><code class="language-php">// En tu módulo o override del controlador
public function initContent()
{
    parent::initContent();
    
    // Cargar todas las categorías de una vez
    $products = $this->getProducts();
    $categoryIds = array_column($products, 'id_category');
    $categories = Category::getCategories($this->context->language->id, $categoryIds);
    
    $this->context->smarty->assign([
        'products' => $products,
        'categories' => $categories
    ]);
}</code></pre>
        </div>

        <h3>7.2. Activar Caché de Smarty y PrestaShop</h3>
        <pre><code class="language-plaintext">Back Office → Configuración Avanzada → Rendimiento

✅ Activar caché de Smarty
✅ Compilación de Smarty: Recompilar plantillas si han cambiado
✅ Tipo de caché: Sistema de archivos (o Redis para mejor rendimiento)
✅ Minificar HTML
✅ Combinar, Comprimir y Cachear CSS
✅ Combinar, Comprimir y Cachear JavaScript</code></pre>

        <h2 class="section-title">8. Compresión y Minificación</h2>

        <h3>8.1. Habilitar Gzip/Brotli en el Servidor</h3>
        <pre><code class="language-apache"># .htaccess - Gzip compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css
  AddOutputFilterByType DEFLATE application/xml application/xhtml+xml
  AddOutputFilterByType DEFLATE application/rss+xml application/atom+xml
  AddOutputFilterByType DEFLATE text/javascript application/javascript application/x-javascript
  AddOutputFilterByType DEFLATE application/json
  AddOutputFilterByType DEFLATE image/svg+xml
</IfModule>

# Brotli compression (mejor que Gzip)
<IfModule mod_brotli.c>
  AddOutputFilterByType BROTLI_COMPRESS text/html text/plain text/xml text/css
  AddOutputFilterByType BROTLI_COMPRESS application/javascript application/json
</IfModule></code></pre>

        <h3>8.2. Minificar con Webpack</h3>
        <pre><code class="language-javascript">// webpack.config.js
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  mode: 'production',
  
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true, // Remover console.log en producción
            drop_debugger: true,
            pure_funcs: ['console.info', 'console.debug']
          },
          format: {
            comments: false // Remover comentarios
          }
        },
        extractComments: false
      }),
      new CssMinimizerPlugin()
    ]
  }
};</code></pre>

        <h2 class="section-title">9. Checklist de Optimización</h2>

        <table class="table table-striped">
            <thead class="table-dark">
                <tr>
                    <th width="60%">Tarea</th>
                    <th width="20%">Impacto</th>
                    <th width="20%">Dificultad</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>✅ Imágenes en formato WebP/AVIF</td>
                    <td><span class="badge bg-success">Alto</span></td>
                    <td><span class="badge bg-success">Fácil</span></td>
                </tr>
                <tr>
                    <td>✅ Lazy loading de imágenes</td>
                    <td><span class="badge bg-success">Alto</span></td>
                    <td><span class="badge bg-success">Fácil</span></td>
                </tr>
                <tr>
                    <td>✅ Defer/Async en scripts no críticos</td>
                    <td><span class="badge bg-success">Alto</span></td>
                    <td><span class="badge bg-success">Fácil</span></td>
                </tr>
                <tr>
                    <td>✅ Critical CSS inline</td>
                    <td><span class="badge bg-success">Alto</span></td>
                    <td><span class="badge bg-warning">Media</span></td>
                </tr>
                <tr>
                    <td>✅ Code splitting por página</td>
                    <td><span class="badge bg-warning">Medio</span></td>
                    <td><span class="badge bg-warning">Media</span></td>
                </tr>
                <tr>
                    <td>✅ Preconnect/DNS-prefetch</td>
                    <td><span class="badge bg-warning">Medio</span></td>
                    <td><span class="badge bg-success">Fácil</span></td>
                </tr>
                <tr>
                    <td>✅ Font-display: swap</td>
                    <td><span class="badge bg-warning">Medio</span></td>
                    <td><span class="badge bg-success">Fácil</span></td>
                </tr>
                <tr>
                    <td>✅ Gzip/Brotli compression</td>
                    <td><span class="badge bg-success">Alto</span></td>
                    <td><span class="badge bg-success">Fácil</span></td>
                </tr>
                <tr>
                    <td>✅ Browser caching headers</td>
                    <td><span class="badge bg-success">Alto</span></td>
                    <td><span class="badge bg-success">Fácil</span></td>
                </tr>
                <tr>
                    <td>✅ Minificar CSS/JS</td>
                    <td><span class="badge bg-warning">Medio</span></td>
                    <td><span class="badge bg-success">Fácil</span></td>
                </tr>
                <tr>
                    <td>✅ Reducir queries en plantillas</td>
                    <td><span class="badge bg-success">Alto</span></td>
                    <td><span class="badge bg-warning">Media</span></td>
                </tr>
                <tr>
                    <td>✅ CDN para assets estáticos</td>
                    <td><span class="badge bg-success">Alto</span></td>
                    <td><span class="badge bg-danger">Alta</span></td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">10. Herramientas y Recursos</h2>
        <ul>
            <li><strong>Lighthouse CI:</strong> Integrar auditorías de rendimiento en tu CI/CD</li>
            <li><strong>Bundle Analyzer:</strong> <code>webpack-bundle-analyzer</code> para visualizar tamaño de bundles</li>
            <li><strong>ImageOptim/Squoosh:</strong> Compresión de imágenes sin pérdida de calidad</li>
            <li><strong>Critical:</strong> Generar CSS crítico automáticamente</li>
            <li><strong>PurgeCSS:</strong> Eliminar CSS no utilizado</li>
            <li><strong>Chrome DevTools Performance Tab:</strong> Analizar bottlenecks de JavaScript</li>
        </ul>
    </div>
    `;

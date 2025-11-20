// @ts-nocheck
const responsiveDesignAdaptacionMovil = `
    <div class="content-section">
        <h1 id="responsive-design-adaptacion-movil">Responsive Design y Adaptación Móvil</h1>
        <p>Con más del 70% del tráfico de e-commerce proveniente de dispositivos móviles, un diseño responsive optimizado en PrestaShop 8.9+ es fundamental. Este capítulo cubre técnicas avanzadas de responsive design, optimización móvil y mejores prácticas para crear experiencias fluidas en todos los dispositivos.</p>

        <h2 class="section-title">1. Estrategia Mobile-First</h2>
        
        <h3>1.1. ¿Por Qué Mobile-First?</h3>
        <div class="row">
            <div class="col-md-6">
                <div class="card mb-3">
                    <div class="card-header bg-success text-white">✅ Ventajas de Mobile-First</div>
                    <div class="card-body">
                        <ul>
                            <li>Prioriza la experiencia del usuario móvil (mayoría del tráfico)</li>
                            <li>Fuerza a simplificar diseño y contenido esencial</li>
                            <li>Mejor rendimiento: carga solo lo necesario</li>
                            <li>Escalado progresivo más natural que reducción</li>
                            <li>Mejor SEO (Google usa mobile-first indexing)</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card mb-3">
                    <div class="card-header bg-danger text-white">❌ Problemas de Desktop-First</div>
                    <div class="card-body">
                        <ul>
                            <li>Tendencia a ocultar contenido en móvil (mala UX)</li>
                            <li>Imágenes y recursos pesados para móviles</li>
                            <li>Navegación compleja difícil de simplificar</li>
                            <li>Menor rendimiento en dispositivos lentos</li>
                            <li>Más sobrescritura de CSS (código menos mantenible)</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <h3>1.2. Breakpoints Recomendados para PrestaShop</h3>
        <pre><code class="language-scss">// /themes/mi-tema/_dev/css/_variables.scss

// Breakpoints basados en dispositivos comunes
$breakpoint-xs: 0;          // Extra small (portrait phones)
$breakpoint-sm: 576px;      // Small (landscape phones)
$breakpoint-md: 768px;      // Medium (tablets)
$breakpoint-lg: 992px;      // Large (desktops)
$breakpoint-xl: 1200px;     // Extra large (large desktops)
$breakpoint-xxl: 1400px;    // Extra extra large (ultra-wide)

// Mixins para media queries
@mixin media-up($breakpoint) {
  @media (min-width: $breakpoint) {
    @content;
  }
}

@mixin media-down($breakpoint) {
  @media (max-width: ($breakpoint - 1px)) {
    @content;
  }
}

@mixin media-between($min, $max) {
  @media (min-width: $min) and (max-width: ($max - 1px)) {
    @content;
  }
}

// Uso:
.container {
  padding: 1rem; // Móvil primero
  
  @include media-up($breakpoint-md) {
    padding: 2rem; // Tablets y superior
  }
  
  @include media-up($breakpoint-xl) {
    padding: 3rem; // Desktop grande
  }
}</code></pre>

        <h2 class="section-title">2. Estructura HTML Responsive</h2>

        <h3>2.1. Viewport Meta Tag Correcto</h3>
        <pre><code class="language-html">{* /themes/mi-tema/templates/_partials/head.tpl *}

<head>
  <meta charset="utf-8">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  
  {* Viewport esencial para responsive design *}
  <meta name="viewport" 
        content="width=device-width, initial-scale=1, shrink-to-fit=no">
  
  {* Prevenir zoom en inputs en iOS (opcional) *}
  <meta name="viewport" 
        content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
  
  {* Theme color para la barra de navegación móvil *}
  <meta name="theme-color" content="#2c3e50">
  
  {* Apple specific *}
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
</head></code></pre>

        <h3>2.2. Contenedores Flexibles</h3>
        <pre><code class="language-html">{* Layout responsive con CSS Grid *}
<div class="page-wrapper">
  <aside class="sidebar">
    {* Sidebar se oculta en móvil, se muestra como off-canvas *}
    {hook h='displayLeftColumn'}
  </aside>
  
  <main class="main-content">
    {* Contenido principal siempre visible *}
    {block name='content'}{/block}
  </main>
  
  <aside class="sidebar-right">
    {hook h='displayRightColumn'}
  </aside>
</div></code></pre>

        <pre><code class="language-scss">// CSS Grid responsive
.page-wrapper {
  display: grid;
  gap: 1rem;
  
  // Móvil: Una sola columna
  grid-template-columns: 1fr;
  grid-template-areas:
    "main"
    "sidebar"
    "sidebar-right";
  
  // Tablet: 2 columnas
  @include media-up($breakpoint-md) {
    grid-template-columns: 250px 1fr;
    grid-template-areas:
      "sidebar main"
      "sidebar sidebar-right";
  }
  
  // Desktop: 3 columnas
  @include media-up($breakpoint-lg) {
    grid-template-columns: 250px 1fr 300px;
    grid-template-areas: "sidebar main sidebar-right";
  }
}

.sidebar { grid-area: sidebar; }
.main-content { grid-area: main; }
.sidebar-right { grid-area: sidebar-right; }</code></pre>

        <h2 class="section-title">3. Navegación Móvil</h2>

        <h3>3.1. Menú Hamburguesa con Off-Canvas</h3>
        <pre><code class="language-html">{* /themes/mi-tema/templates/_partials/header.tpl *}

<header class="header">
  <div class="container">
    {* Menú hamburguesa (solo móvil) *}
    <button class="mobile-menu-toggle" 
            aria-label="Abrir menú" 
            data-toggle="mobile-menu">
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    </button>
    
    {* Logo *}
    <div class="header-logo">
      <a href="{$urls.base_url}">
        <img src="{$shop.logo}" alt="{$shop.name}" width="150" height="auto">
      </a>
    </div>
    
    {* Navegación principal *}
    <nav class="main-navigation" id="mobile-menu">
      <div class="mobile-menu-header">
        <h3>Menú</h3>
        <button class="mobile-menu-close" aria-label="Cerrar menú">
          <i class="material-icons">close</i>
        </button>
      </div>
      
      {* Menú multinivel *}
      {hook h='displayTop'}
    </nav>
    
    {* Acciones del header (carrito, usuario) *}
    <div class="header-actions">
      <a href="{$urls.pages.my_account}" class="account-link">
        <i class="material-icons">person</i>
      </a>
      {hook h='displayNav2'}
    </div>
  </div>
</header></code></pre>

        <pre><code class="language-scss">// Estilos del menú off-canvas
.mobile-menu-toggle {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  
  // Ocultar en desktop
  @include media-up($breakpoint-lg) {
    display: none;
  }
  
  .hamburger-line {
    width: 25px;
    height: 3px;
    background: $color-primary;
    transition: all 0.3s ease;
  }
}

.main-navigation {
  // Móvil: Off-canvas menu
  position: fixed;
  top: 0;
  left: -100%;
  width: 280px;
  height: 100vh;
  background: white;
  box-shadow: 2px 0 10px rgba(0,0,0,0.1);
  transition: left 0.3s ease;
  overflow-y: auto;
  z-index: 1000;
  
  &.is-open {
    left: 0;
  }
  
  // Desktop: Navegación horizontal normal
  @include media-up($breakpoint-lg) {
    position: static;
    width: auto;
    height: auto;
    box-shadow: none;
    display: flex;
    align-items: center;
    overflow-y: visible;
  }
}

// Overlay para cerrar menú móvil
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease;
  z-index: 999;
  
  &.is-active {
    opacity: 1;
    visibility: visible;
  }
}</code></pre>

        <h3>3.2. JavaScript del Menú Móvil</h3>
        <pre><code class="language-javascript">// _dev/js/components/mobile-menu.js

export default class MobileMenu {
  constructor() {
    this.$menu = document.getElementById('mobile-menu');
    this.$toggle = document.querySelector('.mobile-menu-toggle');
    this.$close = document.querySelector('.mobile-menu-close');
    this.$overlay = this.createOverlay();
    
    this.init();
  }
  
  init() {
    // Abrir menú
    this.$toggle.addEventListener('click', () => this.open());
    
    // Cerrar menú
    this.$close.addEventListener('click', () => this.close());
    this.$overlay.addEventListener('click', () => this.close());
    
    // Cerrar con ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.$menu.classList.contains('is-open')) {
        this.close();
      }
    });
    
    // Submenús en móvil
    this.initSubmenus();
  }
  
  createOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'mobile-menu-overlay';
    document.body.appendChild(overlay);
    return overlay;
  }
  
  open() {
    this.$menu.classList.add('is-open');
    this.$overlay.classList.add('is-active');
    document.body.style.overflow = 'hidden'; // Prevenir scroll
  }
  
  close() {
    this.$menu.classList.remove('is-open');
    this.$overlay.classList.remove('is-active');
    document.body.style.overflow = '';
  }
  
  initSubmenus() {
    const submenuToggles = this.$menu.querySelectorAll('.has-submenu > a');
    
    submenuToggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        if (window.innerWidth < 992) { // Solo en móvil
          e.preventDefault();
          toggle.parentElement.classList.toggle('is-expanded');
        }
      });
    });
  }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
  new MobileMenu();
});</code></pre>

        <h2 class="section-title">4. Grids Responsive de Productos</h2>

        <h3>4.1. Grid Adaptable con CSS Grid</h3>
        <pre><code class="language-html">{* /themes/mi-tema/templates/catalog/_partials/products.tpl *}

<div class="products-grid">
  {foreach from=$products item=product}
    <article class="product-miniature">
      {include file='catalog/_partials/miniatures/product.tpl' product=$product}
    </article>
  {/foreach}
</div></code></pre>

        <pre><code class="language-scss">.products-grid {
  display: grid;
  gap: 1rem;
  
  // Móvil: 1 columna
  grid-template-columns: 1fr;
  
  // Pequeño (landscape phones): 2 columnas
  @include media-up($breakpoint-sm) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  // Tablet: 3 columnas
  @include media-up($breakpoint-md) {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
  
  // Desktop: 4 columnas
  @include media-up($breakpoint-lg) {
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
  }
}

// Alternativa con auto-fit (grid fluido)
.products-grid-auto {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}</code></pre>

        <h3>4.2. Tarjetas de Producto Responsive</h3>
        <pre><code class="language-scss">.product-miniature {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
  
  // Móvil: Layout horizontal para mejor uso del espacio
  @include media-down($breakpoint-sm) {
    flex-direction: row;
    
    .product-thumbnail {
      flex: 0 0 120px;
    }
    
    .product-info {
      flex: 1;
      padding: 1rem;
    }
  }
  
  // Tablet y superior: Layout vertical
  @include media-up($breakpoint-sm) {
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }
  }
}</code></pre>

        <h2 class="section-title">5. Imágenes Responsive</h2>

        <h3>5.1. Srcset y Sizes para Diferentes Dispositivos</h3>
        <pre><code class="language-html">{* Imagen responsive con múltiples tamaños *}
<img 
  srcset="
    {$product.cover.bySize.small_default.url} 300w,
    {$product.cover.bySize.medium_default.url} 600w,
    {$product.cover.bySize.large_default.url} 900w,
    {$product.cover.bySize.home_default.url} 1200w
  "
  sizes="
    (max-width: 576px) 100vw,
    (max-width: 768px) 50vw,
    (max-width: 992px) 33vw,
    25vw
  "
  src="{$product.cover.bySize.home_default.url}"
  alt="{$product.cover.legend}"
  loading="lazy"
  class="img-fluid"></code></pre>

        <h3>5.2. Picture con Art Direction</h3>
        <pre><code class="language-html">{* Diferentes crops para móvil y desktop *}
<picture>
  {* Móvil: Imagen cuadrada (mejor para portrait) *}
  <source 
    media="(max-width: 767px)"
    srcset="{$banner.mobile_image}"
    type="image/webp">
  
  {* Tablet: Aspecto 4:3 *}
  <source 
    media="(max-width: 991px)"
    srcset="{$banner.tablet_image}"
    type="image/webp">
  
  {* Desktop: Aspecto 16:9 panorámico *}
  <source 
    media="(min-width: 992px)"
    srcset="{$banner.desktop_image}"
    type="image/webp">
  
  {* Fallback *}
  <img src="{$banner.desktop_image}" 
       alt="{$banner.title}"
       class="banner-image">
</picture></code></pre>

        <h2 class="section-title">6. Touch y Interacciones Móviles</h2>

        <h3>6.1. Tamaños Táctiles Mínimos</h3>
        <div class="alert alert-info">
            <strong>📱 Regla de oro:</strong> Los elementos táctiles deben tener mínimo <strong>44x44 píxeles</strong> (recomendación de Apple) o <strong>48x48 píxeles</strong> (Material Design de Google).
        </div>

        <pre><code class="language-scss">// Asegurar tamaños táctiles adecuados
.btn, a.button, button {
  min-height: 44px;
  padding: 0.75rem 1.5rem;
  
  // En móvil, incluso más grande
  @include media-down($breakpoint-md) {
    min-height: 48px;
    padding: 1rem 2rem;
  }
}

// Checkbox y radio buttons táctiles
.custom-checkbox,
.custom-radio {
  input[type="checkbox"],
  input[type="radio"] {
    width: 20px;
    height: 20px;
    
    @include media-down($breakpoint-md) {
      width: 24px;
      height: 24px;
    }
  }
  
  label {
    min-height: 44px;
    display: flex;
    align-items: center;
    cursor: pointer;
  }
}</code></pre>

        <h3>6.2. Swipe Gestures</h3>
        <pre><code class="language-javascript">// Implementar swipe para galería de imágenes en móvil

class ImageGallerySwipe {
  constructor(element) {
    this.gallery = element;
    this.startX = 0;
    this.currentIndex = 0;
    
    this.initSwipe();
  }
  
  initSwipe() {
    this.gallery.addEventListener('touchstart', (e) => {
      this.startX = e.touches[0].clientX;
    }, { passive: true });
    
    this.gallery.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].clientX;
      const diff = this.startX - endX;
      
      // Swipe left (siguiente imagen)
      if (diff > 50) {
        this.nextImage();
      }
      
      // Swipe right (imagen anterior)
      if (diff < -50) {
        this.prevImage();
      }
    }, { passive: true });
  }
  
  nextImage() {
    // Lógica para mostrar siguiente imagen
  }
  
  prevImage() {
    // Lógica para mostrar imagen anterior
  }
}</code></pre>

        <h2 class="section-title">7. Formularios Móviles</h2>

        <h3>7.1. Inputs Optimizados para Móvil</h3>
        <pre><code class="language-html">{* Teclados específicos en móviles *}

{* Email: Muestra @ y .com *}
<input type="email" 
       name="email" 
       autocomplete="email"
       placeholder="tu@email.com">

{* Teléfono: Muestra teclado numérico *}
<input type="tel" 
       name="phone" 
       autocomplete="tel"
       pattern="[0-9]{9}"
       placeholder="600 000 000">

{* Números: Teclado numérico *}
<input type="number" 
       name="quantity" 
       min="1" 
       max="99"
       inputmode="numeric">

{* URL: Muestra .com y / *}
<input type="url" 
       name="website"
       placeholder="https://ejemplo.com">

{* Búsqueda: Muestra botón "buscar" en teclado *}
<input type="search" 
       name="s"
       placeholder="Buscar productos..."
       autocomplete="off"></code></pre>

        <h3>7.2. Formulario de Checkout Móvil Optimizado</h3>
        <pre><code class="language-html">{* Un solo campo por línea en móvil *}
<form class="checkout-form">
  <div class="form-row">
    <div class="form-group col-mobile-12 col-md-6">
      <label for="firstname">Nombre *</label>
      <input type="text" 
             id="firstname" 
             name="firstname"
             autocomplete="given-name"
             required>
    </div>
    
    <div class="form-group col-mobile-12 col-md-6">
      <label for="lastname">Apellidos *</label>
      <input type="text" 
             id="lastname" 
             name="lastname"
             autocomplete="family-name"
             required>
    </div>
  </div>
  
  {* Botón grande y fijo en la parte inferior en móvil *}
  <div class="form-actions">
    <button type="submit" class="btn btn-primary btn-lg btn-block">
      Continuar con el pago
    </button>
  </div>
</form></code></pre>

        <pre><code class="language-scss">.checkout-form {
  .form-group {
    margin-bottom: 1rem;
    
    // En móvil, labels más prominentes
    @include media-down($breakpoint-md) {
      label {
        font-size: 1rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
      }
      
      input, select, textarea {
        font-size: 16px; // Prevenir zoom en iOS
        padding: 1rem;
      }
    }
  }
  
  .form-actions {
    // En móvil, sticky footer
    @include media-down($breakpoint-md) {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 1rem;
      background: white;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
      z-index: 100;
      
      .btn {
        width: 100%;
        font-size: 1.125rem;
      }
    }
  }
}</code></pre>

        <h2 class="section-title">8. Testing Responsive</h2>

        <h3>8.1. Dispositivos a Testear</h3>
        <table class="table table-striped">
            <thead class="table-dark">
                <tr>
                    <th>Dispositivo</th>
                    <th>Resolución</th>
                    <th>Viewport</th>
                    <th>Prioridad</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>iPhone SE</td>
                    <td>375 x 667</td>
                    <td>375px</td>
                    <td><span class="badge bg-success">Alta</span></td>
                </tr>
                <tr>
                    <td>iPhone 12/13/14</td>
                    <td>390 x 844</td>
                    <td>390px</td>
                    <td><span class="badge bg-success">Alta</span></td>
                </tr>
                <tr>
                    <td>Samsung Galaxy S21</td>
                    <td>360 x 800</td>
                    <td>360px</td>
                    <td><span class="badge bg-success">Alta</span></td>
                </tr>
                <tr>
                    <td>iPad</td>
                    <td>768 x 1024</td>
                    <td>768px</td>
                    <td><span class="badge bg-warning">Media</span></td>
                </tr>
                <tr>
                    <td>iPad Pro</td>
                    <td>1024 x 1366</td>
                    <td>1024px</td>
                    <td><span class="badge bg-secondary">Baja</span></td>
                </tr>
            </tbody>
        </table>

        <h3>8.2. Herramientas de Testing</h3>
        <ul>
            <li><strong>Chrome DevTools Device Mode:</strong> Emulador de dispositivos integrado</li>
            <li><strong>BrowserStack:</strong> Testing en dispositivos reales en la nube</li>
            <li><strong>Responsively App:</strong> Ver múltiples viewports simultáneamente</li>
            <li><strong>Mobile-Friendly Test de Google:</strong> <a href="https://search.google.com/test/mobile-friendly" target="_blank">Verificar mobile-friendliness</a></li>
        </ul>

        <h2 class="section-title">9. Checklist Responsive y Móvil</h2>

        <table class="table table-bordered">
            <thead class="table-dark">
                <tr>
                    <th width="70%">Verificación</th>
                    <th width="30%">Estado</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>✅ Meta viewport configurada correctamente</td>
                    <td><input type="checkbox"></td>
                </tr>
                <tr>
                    <td>✅ Diseño fluido en todos los breakpoints</td>
                    <td><input type="checkbox"></td>
                </tr>
                <tr>
                    <td>✅ Imágenes responsive con srcset</td>
                    <td><input type="checkbox"></td>
                </tr>
                <tr>
                    <td>✅ Texto legible sin zoom (mínimo 16px)</td>
                    <td><input type="checkbox"></td>
                </tr>
                <tr>
                    <td>✅ Elementos táctiles mínimo 44x44px</td>
                    <td><input type="checkbox"></td>
                </tr>
                <tr>
                    <td>✅ Navegación móvil funcional y accesible</td>
                    <td><input type="checkbox"></td>
                </tr>
                <tr>
                    <td>✅ Formularios optimizados para móvil</td>
                    <td><input type="checkbox"></td>
                </tr>
                <tr>
                    <td>✅ Links y botones con espaciado adecuado</td>
                    <td><input type="checkbox"></td>
                </tr>
                <tr>
                    <td>✅ Sin scroll horizontal en ningún breakpoint</td>
                    <td><input type="checkbox"></td>
                </tr>
                <tr>
                    <td>✅ Rendimiento móvil (LCP < 2.5s)</td>
                    <td><input type="checkbox"></td>
                </tr>
                <tr>
                    <td>✅ Test en dispositivos reales (iOS y Android)</td>
                    <td><input type="checkbox"></td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">10. Recursos</h2>
        <ul>
            <li><strong>Mobile-First CSS:</strong> <a href="https://web.dev/mobile" target="_blank">web.dev/mobile</a></li>
            <li><strong>Responsive Design Patterns:</strong> <a href="https://responsivedesign.is/patterns/" target="_blank">responsivedesign.is/patterns</a></li>
            <li><strong>Touch Target Sizes:</strong> <a href="https://web.dev/accessible-tap-targets/" target="_blank">web.dev/accessible-tap-targets</a></li>
            <li><strong>Material Design Mobile:</strong> <a href="https://m3.material.io/" target="_blank">Material Design 3</a></li>
        </ul>
    </div>
    `;

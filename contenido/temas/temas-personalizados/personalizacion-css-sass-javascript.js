// @ts-nocheck
const personalizacionCssSassJavascript = `
    <div class="content-section">
        <h1 id="personalizacion-css-sass-javascript">Personalización Avanzada de CSS (Sass/Less) y JavaScript</h1>
        <p>PrestaShop 8.9+ utiliza <strong>Sass</strong> como preprocesador CSS y <strong>Webpack</strong> para compilar y optimizar assets. Este capítulo cubre desde configuración básica hasta técnicas avanzadas de personalización, animaciones modernas, y optimización de rendimiento para tu tema.</p>

        <h2 class="section-title">1. Arquitectura de Estilos en PrestaShop 8.9+</h2>
        
        <h3>1.1. Estructura de Archivos _dev</h3>
        <p>Los temas modernos utilizan la carpeta <code>_dev</code> para el código fuente que luego se compila a <code>assets/</code>:</p>

        <pre><code class="language-plaintext">/themes/mi-tema/
├── _dev/                          # Código fuente (no se distribuye en producción)
│   ├── css/
│   │   ├── theme.scss             # Punto de entrada principal
│   │   ├── _variables.scss        # Variables globales (colores, tipografía, spacing)
│   │   ├── _mixins.scss           # Mixins reutilizables
│   │   ├── _reset.scss            # Reset/normalize CSS
│   │   ├── partials/
│   │   │   ├── _header.scss
│   │   │   ├── _footer.scss
│   │   │   ├── _navigation.scss
│   │   │   └── _buttons.scss
│   │   ├── components/
│   │   │   ├── _product-card.scss
│   │   │   ├── _cart.scss
│   │   │   └── _modal.scss
│   │   ├── pages/
│   │   │   ├── _home.scss
│   │   │   ├── _product.scss
│   │   │   ├── _category.scss
│   │   │   └── _checkout.scss
│   │   └── modules/               # Estilos específicos de módulos
│   │       ├── _ps_mainmenu.scss
│   │       └── _ps_featuredproducts.scss
│   │
│   └── js/
│       ├── theme.js               # Punto de entrada principal
│       ├── components/
│       │   ├── header.js
│       │   ├── cart.js
│       │   └── product.js
│       └── modules/
│           └── featured-products.js
│
└── assets/                        # Archivos compilados (producción)
    ├── css/
    │   ├── theme.css              # Compilado desde theme.scss
    │   └── theme.css.map          # Source map para debugging
    └── js/
        ├── theme.js               # Bundle compilado
        └── theme.js.map</code></pre>

        <h3>1.2. Configuración de Webpack</h3>
        <p>El archivo <code>webpack.config.js</code> define el proceso de compilación:</p>

        <pre><code class="language-javascript">// /themes/mi-tema/webpack.config.js

const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development';

module.exports = {
  mode: isDev ? 'development' : 'production',
  
  entry: {
    theme: './_dev/js/theme.js',
    // Puedes tener múltiples entry points
    checkout: './_dev/js/checkout.js',
  },
  
  output: {
    path: path.resolve(__dirname, 'assets'),
    filename: 'js/[name].js',
  },
  
  module: {
    rules: [
      // Procesar SCSS
      {
        test: /\\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: isDev,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: isDev,
              postcssOptions: {
                plugins: [
                  ['autoprefixer'],
                  isDev ? null : ['cssnano', { preset: 'default' }],
                ].filter(Boolean),
              },
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: isDev,
            },
          },
        ],
      },
      
      // Transpilar JavaScript ES6+
      {
        test: /\\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: '> 0.25%, not dead',
                useBuiltIns: 'usage',
                corejs: 3,
              }],
            ],
          },
        },
      },
      
      // Procesar imágenes
      {
        test: /\\.(png|jpe?g|gif|svg|webp)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name][ext]',
        },
      },
      
      // Procesar fuentes
      {
        test: /\\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext]',
        },
      },
    ],
  },
  
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
    }),
  ],
  
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: !isDev,
          },
        },
      }),
      new CssMinimizerPlugin(),
    ],
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\\\/]node_modules[\\\\/]/,
          name: 'vendors',
          priority: 10,
        },
      },
    },
  },
  
  devtool: isDev ? 'source-map' : false,
  
  watchOptions: {
    ignored: /node_modules/,
    poll: 1000,
  },
};
</code></pre>

        <h2 class="section-title">2. Sistema de Variables y Tokens de Diseño</h2>

        <h3>2.1. Variables SCSS Organizadas</h3>
        <pre><code class="language-scss">// /themes/mi-tema/_dev/css/_variables.scss

// ============================================
// COLORES DE MARCA
// ============================================
$color-primary: #2c3e50;
$color-secondary: #e74c3c;
$color-accent: #3498db;

// Paleta de grises
$color-gray-50: #f8f9fa;
$color-gray-100: #e9ecef;
$color-gray-200: #dee2e6;
$color-gray-300: #ced4da;
$color-gray-400: #adb5bd;
$color-gray-500: #6c757d;
$color-gray-600: #495057;
$color-gray-700: #343a40;
$color-gray-800: #212529;
$color-gray-900: #000000;

// Estados
$color-success: #27ae60;
$color-warning: #f39c12;
$color-error: #e74c3c;
$color-info: #3498db;

// ============================================
// TIPOGRAFÍA
// ============================================
// Importar Google Fonts
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

$font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
$font-family-heading: 'Inter', sans-serif;
$font-family-mono: 'Courier New', monospace;

// Escala tipográfica modular (ratio 1.25)
$font-size-xs: 0.64rem;    // 10.24px
$font-size-sm: 0.8rem;     // 12.8px
$font-size-base: 1rem;     // 16px
$font-size-md: 1.25rem;    // 20px
$font-size-lg: 1.563rem;   // 25px
$font-size-xl: 1.953rem;   // 31.25px
$font-size-2xl: 2.441rem;  // 39px
$font-size-3xl: 3.052rem;  // 48.83px

$font-weight-light: 300;
$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-semibold: 600;
$font-weight-bold: 700;

$line-height-tight: 1.2;
$line-height-normal: 1.5;
$line-height-relaxed: 1.75;

// ============================================
// ESPACIADO (Sistema de 8px)
// ============================================
$spacing-1: 0.5rem;   // 8px
$spacing-2: 1rem;     // 16px
$spacing-3: 1.5rem;   // 24px
$spacing-4: 2rem;     // 32px
$spacing-5: 2.5rem;   // 40px
$spacing-6: 3rem;     // 48px
$spacing-8: 4rem;     // 64px
$spacing-10: 5rem;    // 80px
$spacing-12: 6rem;    // 96px

// ============================================
// BREAKPOINTS (Mobile-first)
// ============================================
$breakpoint-xs: 0;
$breakpoint-sm: 576px;
$breakpoint-md: 768px;
$breakpoint-lg: 992px;
$breakpoint-xl: 1200px;
$breakpoint-xxl: 1400px;

// ============================================
// BORDES Y SOMBRAS
// ============================================
$border-radius-sm: 0.25rem;   // 4px
$border-radius-md: 0.5rem;    // 8px
$border-radius-lg: 1rem;      // 16px
$border-radius-xl: 1.5rem;    // 24px
$border-radius-full: 9999px;  // Círculo

$border-width: 1px;
$border-width-thick: 2px;

// Sombras (elevaciones)
$shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
$shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
$shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
$shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
$shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.25);

// ============================================
// TRANSICIONES
// ============================================
$transition-duration-fast: 150ms;
$transition-duration-base: 300ms;
$transition-duration-slow: 500ms;

$transition-timing-ease: ease;
$transition-timing-ease-in: ease-in;
$transition-timing-ease-out: ease-out;
$transition-timing-ease-in-out: ease-in-out;

// ============================================
// Z-INDEX (Capas)
// ============================================
$z-dropdown: 1000;
$z-sticky: 1020;
$z-fixed: 1030;
$z-modal-backdrop: 1040;
$z-modal: 1050;
$z-popover: 1060;
$z-tooltip: 1070;</code></pre>

        <h3>2.2. Mixins Reutilizables</h3>
        <pre><code class="language-scss">// /themes/mi-tema/_dev/css/_mixins.scss

// ============================================
// RESPONSIVE BREAKPOINTS
// ============================================
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
// @include media-up($breakpoint-md) { ... }

// ============================================
// FLEXBOX UTILITIES
// ============================================
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

@mixin flex-column {
  display: flex;
  flex-direction: column;
}

// ============================================
// TRUNCATE TEXT
// ============================================
@mixin truncate($lines: 1) {
  @if $lines == 1 {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  } @else {
    display: -webkit-box;
    -webkit-line-clamp: $lines;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

// ============================================
// ASPECT RATIO
// ============================================
@mixin aspect-ratio($width, $height) {
  position: relative;
  
  &::before {
    content: '';
    display: block;
    padding-top: ($height / $width) * 100%;
  }
  
  > * {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}

// Uso:
// .video-wrapper {
//   @include aspect-ratio(16, 9);
// }

// ============================================
// BUTTON STYLES
// ============================================
@mixin button-variant($bg, $color: #fff, $hover-bg: darken($bg, 10%)) {
  background-color: $bg;
  color: $color;
  border: none;
  transition: all $transition-duration-base $transition-timing-ease;
  
  &:hover,
  &:focus {
    background-color: $hover-bg;
    color: $color;
    transform: translateY(-2px);
    box-shadow: $shadow-lg;
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: $shadow-sm;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
}

// ============================================
// GLASSMORPHISM
// ============================================
@mixin glassmorphism($opacity: 0.1, $blur: 10px) {
  background: rgba(255, 255, 255, $opacity);
  backdrop-filter: blur($blur);
  -webkit-backdrop-filter: blur($blur);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

// ============================================
// GRADIENT
// ============================================
@mixin gradient($direction, $color-stops...) {
  background: linear-gradient($direction, $color-stops);
}

// Uso:
// @include gradient(135deg, $color-primary, $color-secondary);

// ============================================
// SMOOTH SCROLL
// ============================================
@mixin smooth-scroll {
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

// ============================================
// DARK MODE
// ============================================
@mixin dark-mode {
  @media (prefers-color-scheme: dark) {
    @content;
  }
}

// O con clase:
@mixin dark-mode-class {
  .dark-mode & {
    @content;
  }
}</code></pre>

        <h2 class="section-title">3. Estructura del theme.scss Principal</h2>

        <pre><code class="language-scss">// /themes/mi-tema/_dev/css/theme.scss

// ============================================
// 1. CONFIGURACIÓN
// ============================================
@import 'variables';
@import 'mixins';

// ============================================
// 2. BASE (Reset, Typography, Utilities)
// ============================================
@import 'reset';

// Reset base
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px; // 1rem = 16px
  @include smooth-scroll;
}

body {
  font-family: $font-family-base;
  font-size: $font-size-base;
  font-weight: $font-weight-normal;
  line-height: $line-height-normal;
  color: $color-gray-800;
  background-color: $color-gray-50;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

// ============================================
// 3. TIPOGRAFÍA
// ============================================
h1, h2, h3, h4, h5, h6 {
  font-family: $font-family-heading;
  font-weight: $font-weight-bold;
  line-height: $line-height-tight;
  margin-bottom: $spacing-2;
  color: $color-gray-900;
}

h1 { font-size: $font-size-3xl; }
h2 { font-size: $font-size-2xl; }
h3 { font-size: $font-size-xl; }
h4 { font-size: $font-size-lg; }
h5 { font-size: $font-size-md; }
h6 { font-size: $font-size-base; }

p {
  margin-bottom: $spacing-2;
}

a {
  color: $color-primary;
  text-decoration: none;
  transition: color $transition-duration-fast $transition-timing-ease;
  
  &:hover {
    color: darken($color-primary, 15%);
    text-decoration: underline;
  }
}

// ============================================
// 4. BOTONES
// ============================================
.btn {
  display: inline-block;
  padding: $spacing-2 $spacing-4;
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  text-align: center;
  text-decoration: none;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: all $transition-duration-base $transition-timing-ease;
  
  &-primary {
    @include button-variant($color-primary);
  }
  
  &-secondary {
    @include button-variant($color-secondary);
  }
  
  &-success {
    @include button-variant($color-success);
  }
  
  &-outline {
    background-color: transparent;
    border: $border-width-thick solid $color-primary;
    color: $color-primary;
    
    &:hover {
      background-color: $color-primary;
      color: white;
    }
  }
  
  &-lg {
    padding: $spacing-3 $spacing-5;
    font-size: $font-size-md;
  }
  
  &-sm {
    padding: $spacing-1 $spacing-2;
    font-size: $font-size-sm;
  }
}

// ============================================
// 5. PARTIALS (Componentes estructurales)
// ============================================
@import 'partials/header';
@import 'partials/footer';
@import 'partials/navigation';
@import 'partials/breadcrumb';

// ============================================
// 6. COMPONENTS (Componentes reutilizables)
// ============================================
@import 'components/product-card';
@import 'components/cart';
@import 'components/modal';
@import 'components/pagination';
@import 'components/alerts';

// ============================================
// 7. PAGES (Estilos específicos de página)
// ============================================
@import 'pages/home';
@import 'pages/product';
@import 'pages/category';
@import 'pages/checkout';
@import 'pages/customer-account';

// ============================================
// 8. MODULES (Sobrescribir estilos de módulos)
// ============================================
@import 'modules/ps_mainmenu';
@import 'modules/ps_featuredproducts';
@import 'modules/ps_shoppingcart';
@import 'modules/ps_imageslider';

// ============================================
// 9. UTILITIES (Clases de utilidad)
// ============================================
// Espaciado
.mt-1 { margin-top: $spacing-1; }
.mt-2 { margin-top: $spacing-2; }
.mt-3 { margin-top: $spacing-3; }
// ... más utilidades

// Flexbox
.d-flex { display: flex; }
.flex-center { @include flex-center; }
.flex-between { @include flex-between; }

// Texto
.text-center { text-align: center; }
.text-bold { font-weight: $font-weight-bold; }
.text-truncate { @include truncate(1); }

// ============================================
// 10. ANIMACIONES
// ============================================
@import 'animations';</code></pre>

        <h2 class="section-title">4. Componentes CSS Avanzados</h2>

        <h3>4.1. Product Card con Animaciones Modernas</h3>
        <pre><code class="language-scss">// /themes/mi-tema/_dev/css/components/_product-card.scss

.product-miniature {
  position: relative;
  background: white;
  border-radius: $border-radius-lg;
  overflow: hidden;
  transition: all $transition-duration-base cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: $shadow-sm;
  
  // Hover state
  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: $shadow-2xl;
    
    .product-img img {
      transform: scale(1.1);
    }
    
    .quick-view-btn {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  // Imagen del producto
  .product-img {
    @include aspect-ratio(1, 1);
    overflow: hidden;
    background: $color-gray-100;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform $transition-duration-slow $transition-timing-ease-out;
    }
  }
  
  // Badge de descuento
  .discount-badge {
    position: absolute;
    top: $spacing-2;
    right: $spacing-2;
    padding: $spacing-1 $spacing-2;
    background: $color-error;
    color: white;
    font-size: $font-size-sm;
    font-weight: $font-weight-bold;
    border-radius: $border-radius-full;
    z-index: 2;
    animation: pulse 2s infinite;
  }
  
  // Badges adicionales (Nuevo, Bestseller)
  .product-flags {
    position: absolute;
    top: $spacing-2;
    left: $spacing-2;
    display: flex;
    flex-direction: column;
    gap: $spacing-1;
    z-index: 2;
    
    .flag {
      padding: $spacing-1 $spacing-2;
      font-size: $font-size-xs;
      font-weight: $font-weight-semibold;
      text-transform: uppercase;
      border-radius: $border-radius-sm;
      
      &.new {
        background: $color-success;
        color: white;
      }
      
      &.bestseller {
        background: $color-accent;
        color: white;
      }
    }
  }
  
  // Botón de vista rápida
  .quick-view-btn {
    position: absolute;
    bottom: $spacing-2;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    opacity: 0;
    padding: $spacing-2 $spacing-4;
    background: white;
    color: $color-primary;
    border-radius: $border-radius-full;
    font-weight: $font-weight-semibold;
    box-shadow: $shadow-lg;
    transition: all $transition-duration-base $transition-timing-ease-out;
    cursor: pointer;
    
    &:hover {
      background: $color-primary;
      color: white;
    }
  }
  
  // Información del producto
  .product-info {
    padding: $spacing-3;
    
    .product-category {
      font-size: $font-size-sm;
      color: $color-gray-500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: $spacing-1;
    }
    
    .product-title {
      font-size: $font-size-md;
      font-weight: $font-weight-semibold;
      margin-bottom: $spacing-2;
      @include truncate(2);
      
      a {
        color: $color-gray-900;
        
        &:hover {
          color: $color-primary;
          text-decoration: none;
        }
      }
    }
    
    .product-price {
      @include flex-between;
      align-items: baseline;
      
      .current-price {
        font-size: $font-size-lg;
        font-weight: $font-weight-bold;
        color: $color-primary;
      }
      
      .old-price {
        font-size: $font-size-base;
        color: $color-gray-400;
        text-decoration: line-through;
      }
    }
    
    .product-rating {
      display: flex;
      align-items: center;
      gap: $spacing-1;
      margin-top: $spacing-2;
      
      .stars {
        color: #f39c12;
      }
      
      .reviews-count {
        font-size: $font-size-sm;
        color: $color-gray-500;
      }
    }
  }
  
  // Botones de acción
  .product-actions {
    padding: 0 $spacing-3 $spacing-3;
    display: flex;
    gap: $spacing-2;
    
    .add-to-cart-btn {
      flex: 1;
      @include button-variant($color-primary);
      @include flex-center;
      gap: $spacing-1;
    }
    
    .wishlist-btn {
      width: 48px;
      height: 48px;
      @include flex-center;
      background: $color-gray-100;
      border-radius: $border-radius-md;
      transition: all $transition-duration-base;
      
      &:hover,
      &.active {
        background: $color-error;
        color: white;
      }
    }
  }
}</code></pre>

        <h3>4.2. Animaciones y Efectos Avanzados</h3>
        <pre><code class="language-scss">// /themes/mi-tema/_dev/css/_animations.scss

// ============================================
// KEYFRAMES
// ============================================
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

// ============================================
// UTILITY CLASSES
// ============================================
.fade-in {
  animation: fadeIn 0.5s ease-out;
}

.slide-in-up {
  animation: slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-in-down {
  animation: slideInDown 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

// Stagger children animations
.stagger-children {
  > * {
    opacity: 0;
    animation: slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    
    @for $i from 1 through 10 {
      &:nth-child(#{$i}) {
        animation-delay: #{$i * 0.1}s;
      }
    }
  }
}

// Skeleton loader
.skeleton {
  background: linear-gradient(
    90deg,
    $color-gray-200 0%,
    $color-gray-100 50%,
    $color-gray-200 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: $border-radius-sm;
}</code></pre>

        <h2 class="section-title">5. JavaScript Modular y ES6+</h2>

        <h3>5.1. Estructura del theme.js</h3>
        <pre><code class="language-javascript">// /themes/mi-tema/_dev/js/theme.js

// Importar estilos (Webpack los procesará)
import '../css/theme.scss';

// Importar jQuery (incluido en PrestaShop)
import $ from 'jquery';

// Importar componentes
import Header from './components/header';
import Cart from './components/cart';
import ProductPage from './components/product';
import Filters from './components/filters';

// Importar módulos de terceros si es necesario
// import Swiper from 'swiper';
// import 'swiper/css';

// ============================================
// INICIALIZACIÓN
// ============================================
class Theme {
  constructor() {
    this.init();
  }
  
  init() {
    // Inicializar componentes globales
    this.initComponents();
    
    // Event listeners globales
    this.bindEvents();
    
    // Lazy loading de imágenes
    this.initLazyLoading();
    
    // Smooth scroll
    this.initSmoothScroll();
    
    console.log('🎨 Tema inicializado correctamente');
  }
  
  initComponents() {
    new Header();
    new Cart();
    
    // Componentes específicos por página
    if (prestashop.page.page_name === 'product') {
      new ProductPage();
    }
    
    if (prestashop.page.page_name === 'category') {
      new Filters();
    }
  }
  
  bindEvents() {
    // Escuchar eventos nativos de PrestaShop
    prestashop.on('updateCart', (event) => {
      this.handleCartUpdate(event);
    });
    
    prestashop.on('updatedProduct', (event) => {
      this.handleProductUpdate(event);
    });
  }
  
  handleCartUpdate(event) {
    console.log('Carrito actualizado:', event.reason);
    
    // Mostrar notificación
    this.showNotification('Carrito actualizado', 'success');
  }
  
  handleProductUpdate(event) {
    console.log('Producto actualizado:', event);
  }
  
  initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.add('fade-in');
            imageObserver.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px',
      });
      
      images.forEach(img => imageObserver.observe(img));
    } else {
      // Fallback para navegadores antiguos
      images.forEach(img => {
        img.src = img.dataset.src;
      });
    }
  }
  
  initSmoothScroll() {
    $('a[href^="#"]').on('click', function(e) {
      const target = $(this.getAttribute('href'));
      
      if (target.length) {
        e.preventDefault();
        $('html, body').animate({
          scrollTop: target.offset().top - 100
        }, 800);
      }
    });
  }
  
  showNotification(message, type = 'info') {
    const notification = $(\`
      <div class="notification notification-\${type} fade-in">
        <span>\${message}</span>
        <button class="close-btn">&times;</button>
      </div>
    \`);
    
    $('body').append(notification);
    
    notification.find('.close-btn').on('click', () => {
      notification.remove();
    });
    
    setTimeout(() => {
      notification.fadeOut(() => notification.remove());
    }, 3000);
  }
}

// Inicializar cuando el DOM esté listo
$(document).ready(() => {
  new Theme();
});

// También exportar para uso desde otros scripts
export default Theme;
</code></pre>

        <h3>5.2. Componente Ejemplo: Product Page</h3>
        <pre><code class="language-javascript">// /themes/mi-tema/_dev/js/components/product.js

import $ from 'jquery';

export default class ProductPage {
  constructor() {
    this.$productContainer = $('#product');
    
    if (!this.$productContainer.length) {
      return;
    }
    
    this.init();
  }
  
  init() {
    this.initImageGallery();
    this.initQuantitySelector();
    this.initVariantSelector();
    this.initWishlist();
    
    console.log('📦 Página de producto inicializada');
  }
  
  initImageGallery() {
    const $images = $('.product-images img');
    const $mainImage = $('.product-cover img');
    
    $images.on('click', function() {
      const newSrc = $(this).data('large-src');
      $mainImage.fadeOut(200, function() {
        $(this).attr('src', newSrc).fadeIn(200);
      });
      
      $images.removeClass('active');
      $(this).addClass('active');
    });
    
    // Zoom en hover (solo desktop)
    if (window.innerWidth > 992) {
      this.initImageZoom();
    }
  }
  
  initImageZoom() {
    const $mainImage = $('.product-cover');
    
    $mainImage.on('mousemove', function(e) {
      const $img = $(this).find('img');
      const offset = $(this).offset();
      const x = e.pageX - offset.left;
      const y = e.pageY - offset.top;
      
      const xPercent = (x / $(this).width()) * 100;
      const yPercent = (y / $(this).height()) * 100;
      
      $img.css({
        'transform-origin': \`\${ xPercent }% \${ yPercent }% \`,
        'transform': 'scale(2)'
      });
    });
    
    $mainImage.on('mouseleave', function() {
      $(this).find('img').css('transform', 'scale(1)');
    });
  }
  
  initQuantitySelector() {
    const $input = $('#quantity_wanted');
    const $increaseBtn = $('.qty-increase');
    const $decreaseBtn = $('.qty-decrease');
    
    $increaseBtn.on('click', () => {
      let currentValue = parseInt($input.val());
      $input.val(currentValue + 1).trigger('change');
    });
    
    $decreaseBtn.on('click', () => {
      let currentValue = parseInt($input.val());
      if (currentValue > 1) {
        $input.val(currentValue - 1).trigger('change');
      }
    });
    
    // Validación
    $input.on('change', function() {
      let value = parseInt($(this).val());
      
      if (isNaN(value) || value < 1) {
        $(this).val(1);
      }
    });
  }
  
  initVariantSelector() {
    $('.product-variants input, .product-variants select').on('change', function() {
      // PrestaShop se encarga de actualizar el producto
      // Aquí podemos agregar efectos visuales adicionales
      
      $('.product-cover img').addClass('loading');
      
      setTimeout(() => {
        $('.product-cover img').removeClass('loading');
      }, 500);
    });
  }
  
  initWishlist() {
    $('.wishlist-btn').on('click', function(e) {
      e.preventDefault();
      
      const $btn = $(this);
      const productId = $btn.data('product-id');
      
      // Llamar al endpoint de wishlist
      $.ajax({
        url: prestashop.urls.pages.cart,
        method: 'POST',
        data: {
          action: 'add-to-wishlist',
          id_product: productId,
          ajax: true
        },
        success: (response) => {
          $btn.addClass('active');
          $btn.find('.material-icons').text('favorite');
          
          // Mostrar notificación
          if (window.Theme) {
            window.Theme.showNotification('Añadido a favoritos', 'success');
          }
        },
        error: () => {
          alert('Error al añadir a favoritos');
        }
      });
    });
  }
}
</code></pre>

        <h2 class="section-title">6. Comandos NPM para Desarrollo</h2>

        <pre><code class="language-json">// /themes/mi-tema/package.json
{
  "name": "mi-tema-prestashop",
  "version": "1.0.0",
  "description": "Tema personalizado para PrestaShop 8.9+",
  "scripts": {
    "dev": "webpack --mode development --watch",
    "build": "webpack --mode production",
    "build:analyze": "webpack --mode production --analyze",
    "lint:css": "stylelint './_dev/css/**/*.scss' --fix",
    "lint:js": "eslint './_dev/js/**/*.js' --fix"
  },
  "devDependencies": {
    "@babel/core": "^7.23.0",
    "@babel/preset-env": "^7.23.0",
    "autoprefixer": "^10.4.16",
    "babel-loader": "^9.1.3",
    "css-loader": "^6.8.1",
    "css-minimizer-webpack-plugin": "^5.0.1",
    "eslint": "^8.52.0",
    "mini-css-extract-plugin": "^2.7.6",
    "postcss": "^8.4.31",
    "postcss-loader": "^7.3.3",
    "sass": "^1.69.4",
    "sass-loader": "^13.3.2",
    "style-loader": "^3.3.3",
    "stylelint": "^15.11.0",
    "stylelint-config-standard-scss": "^11.0.0",
    "terser-webpack-plugin": "^5.3.9",
    "webpack": "^5.89.0",
    "webpack-cli": "^5.1.4"
  },
  "dependencies": {
    "jquery": "^3.7.1"
  }
}
</code></pre>

        <h3>6.1. Flujo de Trabajo de Desarrollo</h3>
        <pre><code class="language-bash"># 1. Instalar dependencias
npm install

# 2. Modo desarrollo (con watch)
npm run dev
# Webpack recompilará automáticamente al guardar cambios

# 3. Build de producción (antes de subir a servidor)
npm run build
# Genera archivos minificados en /assets/

# 4. Analizar bundle (opcional)
npm run build:analyze
# Muestra qué ocupa más espacio en el bundle final

# 5. Linter de CSS
npm run lint:css

# 6. Linter de JavaScript
npm run lint:js
</code></pre>

        <h2 class="section-title">7. Optimización de Performance</h2>

        <h3>7.1. Code Splitting</h3>
        <pre><code class="language-javascript">// Cargar módulos bajo demanda solo cuando se necesiten
// /themes/mi-tema/_dev/js/theme.js

// En lugar de importar todo de entrada:
// import Swiper from 'swiper';

// Carga diferida:
async function initCarousel() {
  const { default: Swiper } = await import(/* webpackChunkName: "swiper" */ 'swiper');
  
  new Swiper('.swiper', {
    slidesPerView: 3,
    spaceBetween: 30,
  });
}

// Ejecutar solo si existe el elemento
if (document.querySelector('.swiper')) {
  initCarousel();
}
</code></pre>

        <h3>7.2. Critical CSS</h3>
        <p>Extraer CSS crítico para renderizado inicial más rápido:</p>

        <pre><code class="language-bash"># Instalar herramienta
npm install --save-dev critical

# Generar CSS crítico
npx critical https://tu-tienda.com --base ./ --inline --css assets/css/theme.css > critical.css
</code></pre>

        <h2 class="section-title">8. Recursos y Herramientas</h2>
        <ul>
            <li><strong>Webpack Documentation:</strong> <a href="https://webpack.js.org/" target="_blank" rel="noopener">webpack.js.org</a></li>
            <li><strong>Sass Reference:</strong> <a href="https://sass-lang.com/documentation" target="_blank" rel="noopener">sass-lang.com/documentation</a></li>
            <li><strong>Color Palettes:</strong> <a href="https://coolors.co/" target="_blank" rel="noopener">coolors.co</a></li>
            <li><strong>CSS Tricks:</strong> <a href="https://css-tricks.com/" target="_blank" rel="noopener">css-tricks.com</a></li>
            <li><strong>Can I Use:</strong> <a href="https://caniuse.com/" target="_blank" rel="noopener">caniuse.com</a> - Verificar compatibilidad de navegadores</li>
            <li><strong>Autoprefixer:</strong> Añade prefijos de navegador automáticamente</li>
        </ul>
    </div>
    `;

// @ts-nocheck
const integracionModulosTema = `
    <div class="content-section">
        <h1 id="integracion-modulos-tema">Integración de Módulos en el Tema</h1>
        <p>La integración de módulos en un tema de PrestaShop 8.9+ va más allá de simplemente instalar un módulo. Requiere comprender el sistema de <strong>hooks</strong>, cómo posicionar módulos estratégicamente, personalizar su apariencia y optimizar su rendimiento. Este capítulo cubre técnicas avanzadas para una integración perfecta entre tu tema y los módulos.</p>

        <h2 class="section-title">1. Sistema de Hooks en PrestaShop</h2>
        
        <h3>1.1. ¿Qué son los Hooks?</h3>
        <p>Los <strong>hooks</strong> son puntos de anclaje predefinidos en el código donde los módulos pueden "engancharse" para inyectar contenido, modificar datos o ejecutar lógica personalizada.</p>

        <div class="row">
            <div class="col-md-6">
                <div class="card mb-3">
                    <div class="card-header bg-primary text-white">Hooks de Visualización (Display Hooks)</div>
                    <div class="card-body">
                        <p>Inyectan HTML/CSS/JS en posiciones específicas de la página.</p>
                        <ul>
                            <li><code>displayHeader</code> - &lt;head&gt; del HTML</li>
                            <li><code>displayNav</code> - Navegación superior</li>
                            <li><code>displayFooter</code> - Pie de página</li>
                            <li><code>displayHome</code> - Página de inicio</li>
                            <li><code>displayProductAdditionalInfo</code> - Página de producto</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card mb-3">
                    <div class="card-header bg-dark text-white">Hooks de Acción (Action Hooks)</div>
                    <div class="card-body">
                        <p>Ejecutan lógica en momentos clave sin renderizar contenido.</p>
                        <ul>
                            <li><code>actionValidateOrder</code> - Al crear un pedido</li>
                            <li><code>actionProductSave</code> - Al guardar un producto</li>
                            <li><code>actionCustomerAccountAdd</code> - Al registrar cliente</li>
                            <li><code>actionCartSave</code> - Al modificar el carrito</li>
                            <li><code>actionObjectUpdateAfter</code> - Después de actualizar entidad</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <h3>1.2. Llamar Hooks desde las Plantillas</h3>
        <p>En tus archivos <code>.tpl</code>, puedes renderizar módulos enganchados a un hook específico:</p>

        <pre><code class="language-html">{* Renderizar todos los módulos enganchados a displayHome *}
{hook h='displayHome'}

{* Con parámetros adicionales *}
{hook h='displayProductAdditionalInfo' product=$product}

{* Asignar resultado a variable *}
{assign var='headerModules' value={hook h='displayHeader'}}
{if $headerModules}
  <div class="header-modules-wrapper">
    {$headerModules nofilter}
  </div>
{/if}</code></pre>

        <h3>1.3. Hooks Disponibles por Página</h3>
        
        <table class="table table-bordered">
            <thead class="table-dark">
                <tr>
                    <th>Página</th>
                    <th>Hooks Principales</th>
                    <th>Uso Común</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Todas las páginas</strong></td>
                    <td><code>displayHeader</code>, <code>displayFooter</code>, <code>displayNav</code></td>
                    <td>Scripts globales, menús, cookies banner</td>
                </tr>
                <tr>
                    <td><strong>Inicio</strong></td>
                    <td><code>displayHome</code>, <code>displayHomeTab</code>, <code>displayHomeTabContent</code></td>
                    <td>Sliders, productos destacados, bloques promocionales</td>
                </tr>
                <tr>
                    <td><strong>Producto</strong></td>
                    <td><code>displayProductAdditionalInfo</code>, <code>displayReassurance</code>, <code>displayProductButtons</code></td>
                    <td>Reviews, información de envío, botones personalizados</td>
                </tr>
                <tr>
                    <td><strong>Carrito/Checkout</strong></td>
                    <td><code>displayShoppingCartFooter</code>, <code>displayBeforeCarrier</code>, <code>displayPaymentReturn</code></td>
                    <td>Cupones, métodos de pago, confirmación de pedido</td>
                </tr>
                <tr>
                    <td><strong>Categoría</strong></td>
                    <td><code>displayLeftColumn</code>, <code>displayRightColumn</code>, <code>displayCategoryFooter</code></td>
                    <td>Filtros, banners de categoría</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">2. Gestión de Posiciones de Módulos</h2>

        <h3>2.1. Configurar Posiciones desde el Back Office</h3>
        <p>Accede a <strong>Diseño → Posiciones</strong> para gestionar visualmente qué módulos se muestran en cada hook y en qué orden.</p>

        <div class="alert alert-info">
            <strong>💡 Tip:</strong> Puedes arrastrar y soltar módulos para cambiar su orden de aparición en cada hook.
        </div>

        <h3>2.2. Controlar Posiciones desde el Tema (theme.yml)</h3>
        <p>Puedes preconfigurar qué módulos deben engancharse a ciertos hooks al instalar tu tema:</p>

        <pre><code class="language-yaml"># /themes/mi-tema/config/theme.yml

theme_settings:
  default_layout: layout-full-width
  
# Configurar hooks específicos
hooks:
  modules_to_hook:
    # Módulos que deben engancharse en displayHome al instalar el tema
    displayHome:
      - name: ps_imageslider
        position: 1
      - name: ps_featuredproducts
        position: 2
      - name: ps_customtext
        position: 3
    
    # Desactivar ciertos módulos en algunos hooks
    displayLeftColumn:
      - name: ps_categorytree
        position: 0  # 0 = desactivado
        
# Módulos que deben activarse con el tema
global_settings:
  modules:
    to_enable:
      - ps_imageslider
      - ps_featuredproducts
      - ps_mainmenu
      - ps_linklist
    to_disable:
      - ps_banner  # Si no se usa en este tema</code></pre>

        <h3>2.3. Registrar Hooks Personalizados en el Tema</h3>
        <p>Si necesitas crear tus propios hooks para permitir que módulos se integren en zonas específicas de tu tema:</p>

        <p><strong>Paso 1: Crear el hook en la plantilla</strong></p>
        <pre><code class="language-html">{* /themes/mi-tema/templates/catalog/product.tpl *}

<div class="product-page">
  {* Hook personalizado antes del título *}
  {hook h='displayProductTitleBefore'}
  
  <h1 class="product-title">{$product.name}</h1>
  
  {* Hook personalizado después del título *}
  {hook h='displayProductTitleAfter'}
  
  {* ... resto del contenido ... *}
</div></code></pre>

        <p><strong>Paso 2: Registrar el hook en la base de datos (si es nuevo)</strong></p>
        <pre><code class="language-php">// Desde un módulo o script de instalación del tema
$hook = new Hook();
$hook->name = 'displayProductTitleBefore';
$hook->title = 'Product Title Before';
$hook->description = 'Hook visible antes del título del producto';
$hook->position = true;
$hook->add();

// Alternativamente, usar el método de PrestaShop
Hook::exec('displayProductTitleBefore', ['product' => $product]);</code></pre>

        <h2 class="section-title">3. Personalizar la Apariencia de Módulos en el Tema</h2>

        <h3>3.1. Override de Plantillas de Módulos</h3>
        <p>Como vimos anteriormente, puedes sobreescribir las plantillas de cualquier módulo creando una copia en tu tema:</p>

        <div class="alert alert-warning">
            <strong>⚠️ Ruta Original:</strong><br>
            <code>/modules/ps_featuredproducts/views/templates/hook/ps_featuredproducts.tpl</code>
            <br><br>
            <strong>✅ Tu Override:</strong><br>
            <code>/themes/mi-tema/modules/ps_featuredproducts/views/templates/hook/ps_featuredproducts.tpl</code>
        </div>

        <p><strong>Ejemplo: Personalizar el módulo de productos destacados</strong></p>
        <pre><code class="language-html">{* /themes/mi-tema/modules/ps_featuredproducts/views/templates/hook/ps_featuredproducts.tpl *}

<section class="featured-products-custom">
  <div class="container">
    {* Título personalizado con icono *}
    <h2 class="section-title">
      <i class="material-icons">star</i>
      {l s='Our Bestsellers' d='Shop.Theme.Catalog'}
    </h2>
    
    {* Grid responsivo personalizado *}
    <div class="products-grid row">
      {foreach from=$products item=product}
        <div class="col-xs-6 col-sm-4 col-md-3">
          {include file='catalog/_partials/miniatures/product.tpl' product=$product}
        </div>
      {/foreach}
    </div>
    
    {* Botón para ver todos los productos *}
    <div class="all-products-link text-center">
      <a href="{$allProductsLink}" class="btn btn-primary">
        {l s='View all products' d='Shop.Theme.Catalog'}
        <i class="material-icons">arrow_forward</i>
      </a>
    </div>
  </div>
</section></code></pre>

        <h3>3.2. Estilos CSS Específicos por Módulo</h3>
        <p>Organiza tus estilos de módulos en archivos separados para mejor mantenibilidad:</p>

        <pre><code class="language-scss">// /themes/mi-tema/_dev/css/modules/_ps_featuredproducts.scss

.featured-products-custom {
  margin: 60px 0;
  
  .section-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 30px;
    
    .material-icons {
      color: var(--primary-color);
      font-size: 2.5rem;
    }
  }
  
  .products-grid {
    margin-bottom: 30px;
    
    .product-miniature {
      transition: transform 0.3s ease;
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(0,0,0,0.15);
      }
    }
  }
  
  .all-products-link {
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 30px;
    }
  }
}

// Importar en el archivo principal
// /themes/mi-tema/_dev/css/theme.scss
@import 'modules/ps_featuredproducts';
@import 'modules/ps_shoppingcart';
@import 'modules/ps_mainmenu';</code></pre>

        <h3>3.3. JavaScript Modular para Integración</h3>
        <pre><code class="language-javascript">// /themes/mi-tema/_dev/js/modules/featured-products.js

import $ from 'jquery';

export default class FeaturedProducts {
  constructor() {
    this.$container = $('.featured-products-custom');
    
    if (this.$container.length) {
      this.init();
    }
  }
  
  init() {
    this.initCarousel();
    this.initLazyLoading();
  }
  
  initCarousel() {
    // Si quieres convertir el grid en un carousel en móvil
    if (window.innerWidth < 768) {
      this.$container.find('.products-grid').slick({
        slidesToShow: 2,
        slidesToScroll: 1,
        dots: true,
        arrows: true,
        responsive: [
          {
            breakpoint: 480,
            settings: {
              slidesToShow: 1
            }
          }
        ]
      });
    }
  }
  
  initLazyLoading() {
    // Lazy loading de imágenes
    const images = this.$container.find('img[data-src]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        });
      });
      
      images.each((i, img) => imageObserver.observe(img));
    }
  }
}

// Importar en theme.js
// /themes/mi-tema/_dev/js/theme.js
import FeaturedProducts from './modules/featured-products';

$(document).ready(() => {
  new FeaturedProducts();
});</code></pre>

        <h2 class="section-title">4. Comunicación entre Tema y Módulos</h2>

        <h3>4.1. Pasar Datos del Tema a Módulos mediante Hooks</h3>
        <pre><code class="language-html">{* Pasar variables adicionales al módulo *}
{hook h='displayProductButtons' 
      product=$product 
      id_product=$product.id
      custom_data=['show_wishlist' => true, 'show_compare' => true]}

{* Los módulos enganchados recibirán estos parámetros *}</code></pre>

        <h3>4.2. Capturar Datos en el Módulo</h3>
        <pre><code class="language-php">// En tu módulo
class MiModulo extends Module
{
    public function hookDisplayProductButtons($params)
    {
        // Acceder a los parámetros pasados desde el tema
        $product = $params['product'];
        $customData = $params['custom_data'] ?? [];
        
        // Verificar configuraciones del tema
        if (isset($customData['show_wishlist']) && $customData['show_wishlist']) {
            $this->context->smarty->assign([
                'show_wishlist' => true,
                'product_id' => $params['id_product'],
            ]);
        }
        
        return $this->display(__FILE__, 'views/templates/hook/product-buttons.tpl');
    }
}</code></pre>

        <h3>4.3. Usar eventos JavaScript personalizados</h3>
        <p>Establecer comunicación bidireccional entre el tema y módulos mediante eventos:</p>

        <pre><code class="language-javascript">// En el tema: Disparar evento cuando se añade un producto al carrito
// /themes/mi-tema/_dev/js/theme.js

prestashop.on('updateCart', (event) => {
  // Evento nativo de PrestaShop
  const cart = event.resp.cart;
  
  // Disparar evento personalizado para módulos
  const customEvent = new CustomEvent('themeCartUpdated', {
    detail: {
      cart: cart,
      action: 'add',
      timestamp: Date.now()
    }
  });
  
  document.dispatchEvent(customEvent);
  
  // Actualizar UI del tema
  updateCartBadge(cart.products_count);
});

// En un módulo: Escuchar eventos del tema
// /modules/mi_modulo/views/js/front.js

document.addEventListener('themeCartUpdated', (event) => {
  const cartData = event.detail.cart;
  
  // Actualizar componente del módulo
  console.log('Carrito actualizado:', cartData);
  
  // Mostrar notificación personalizada
  showCustomNotification(\`\${ event.detail.cart.products_count } productos en el carrito\`);
});</code></pre>

        <h2 class="section-title">5. Optimización de Módulos en el Tema</h2>

        <h3>5.1. Lazy Loading de Módulos</h3>
        <p>Cargar módulos solo cuando sean visibles para mejorar el rendimiento inicial:</p>

        <pre><code class="language-html">{* Marcar módulos no críticos para carga diferida *}
<div class="lazy-module" 
     data-hook="displayFooter" 
     data-module="ps_emailsubscription">
  {* Placeholder o skeleton mientras carga *}
  <div class="skeleton-loader">
    <div class="skeleton-line"></div>
    <div class="skeleton-line"></div>
  </div>
</div>

{* JavaScript para cargar bajo demanda *}
<script>
document.addEventListener('DOMContentLoaded', () => {
  const lazyModules = document.querySelectorAll('.lazy-module');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        loadModule(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '100px' });
  
  lazyModules.forEach(module => observer.observe(module));
});

function loadModule(element) {
  const hook = element.dataset.hook;
  const module = element.dataset.module;
  
  fetch(\`/index.php?fc=module&module=\${module}&controller=ajax&action=getContent\`)
    .then(r => r.text())
    .then(html => {
      element.innerHTML = html;
    });
}
</script></code></pre>

        <h3>5.2. Cachear Salidas de Módulos</h3>
        <p>Implementar caché para módulos que generan contenido estático o semi-estático:</p>

        <pre><code class="language-php">// En tu módulo
class MiModulo extends Module
{
    public function hookDisplayHome($params)
    {
        $cacheId = $this->getCacheId('displayHome');
        
        // Verificar si hay caché válida
        if (!$this->isCached('views/templates/hook/displayhome.tpl', $cacheId)) {
            // Solo ejecutar queries si no hay caché
            $products = $this->getPopularProducts();
            
            $this->context->smarty->assign([
                'products' => $products,
                'title' => $this->l('Popular Products'),
            ]);
        }
        
        // Renderizar desde caché o generar nuevo
        return $this->display(__FILE__, 'views/templates/hook/displayhome.tpl', $cacheId);
    }
    
    protected function getCacheId($name)
    {
        return parent::getCacheId($name . '|' . 
            (int)Shop::getContextShopID() . '|' .
            (int)Context::getContext()->language->id . '|' .
            (int)Context::getContext()->currency->id
        );
    }
}</code></pre>

        <h3>5.3. Cargar CSS/JS de Módulos solo cuando sea necesario</h3>
        <pre><code class="language-php">// En el módulo: Registrar assets solo en páginas específicas
class MiModulo extends Module
{
    public function hookHeader($params)
    {
        $controller = $this->context->controller;
        
        // Solo cargar en páginas de producto
        if ($controller instanceof ProductController) {
            $this->context->controller->registerStylesheet(
                'module-mimodulo-product',
                'modules/' . $this->name . '/views/css/product.css',
                [
                    'media' => 'all',
                    'priority' => 200,
                ]
            );
            
            $this->context->controller->registerJavascript(
                'module-mimodulo-product-js',
                'modules/' . $this->name . '/views/js/product.js',
                [
                    'position' => 'bottom',
                    'priority' => 200,
                    'attribute' => 'defer',
                ]
            );
        }
    }
}</code></pre>

        <h2 class="section-title">6. Testing de Integración de Módulos</h2>

        <h3>6.1. Checklist de Compatibilidad</h3>
        <ul>
            <li>✓ El módulo se renderiza correctamente en todos los layouts (full-width, left-column, right-column)</li>
            <li>✓ Los estilos del módulo no interfieren con los del tema (no hay conflictos CSS)</li>
            <li>✓ El módulo funciona bien en todas las resoluciones (responsive)</li>
            <li>✓ No hay errores JavaScript en la consola al cargar el módulo</li>
            <li>✓ El módulo no ralentiza significativamente la carga de la página</li>
            <li>✓ Los hooks se ejecutan en el orden correcto</li>
            <li>✓ Las traducciones del módulo funcionan con el idioma del tema</li>
        </ul>

        <h3>6.2. Debugging de Hooks</h3>
        <pre><code class="language-php">// Activar log de hooks en config/defines.inc.php
define('_PS_DEBUG_PROFILING_', true);

// Ver qué módulos están enganchados a un hook
$modules = Hook::getHookModuleExecList('displayHome');
var_dump($modules);

// Verificar si un módulo está activo y enganchado
$isHooked = Hook::isModuleRegisteredOnHook(
    Module::getInstanceByName('ps_featuredproducts'),
    'displayHome',
    Shop::getContextShopID()
);
var_dump($isHooked);</code></pre>

        <h2 class="section-title">7. Ejemplo Completo: Integración de Menú Mega</h2>
        <p>Caso práctico de integración de un módulo de mega menú personalizado:</p>

        <pre><code class="language-html">{* /themes/mi-tema/modules/ps_mainmenu/ps_mainmenu.tpl *}

<div id="mega-menu-wrapper" class="desktop-menu">
  <nav class="main-navigation">
    <ul class="menu-items">
      {foreach from=$menu item=node}
        <li class="menu-item {if $node.children}has-dropdown{/if}">
          <a href="{$node.url}" 
             class="menu-link {if $node.current}active{/if}"
             {if $node.open_in_new_window}target="_blank"{/if}>
            
            {* Icono si existe *}
            {if isset($node.icon) && $node.icon}
              <i class="material-icons">{$node.icon}</i>
            {/if}
            
            {$node.label}
            
            {* Indicador de dropdown *}
            {if $node.children}
              <i class=" material-icons chevron">expand_more</i>
            {/if}
          </a>
          
          {* Mega menu dropdown *}
          {if $node.children}
            <div class="mega-dropdown">
              <div class="container">
                <div class="row">
                  {foreach from=$node.children item=child}
                    <div class="col-md-3">
                      <h3 class="dropdown-title">
                        <a href="{$child.url}">{$child.label}</a>
                      </h3>
                      
                      {if $child.children}
                        <ul class="sub-menu">
                          {foreach from=$child.children item=subChild}
                            <li>
                              <a href="{$subChild.url}">
                                {$subChild.label}
                              </a>
                            </li>
                          {/foreach}
                        </ul>
                      {/if}
                    </div>
                  {/foreach}
                </div>
              </div>
            </div>
          {/if}
        </li>
      {/foreach}
    </ul>
  </nav>
</div></code></pre>

        <h2 class="section-title">8. Recursos y Herramientas</h2>
        <ul>
            <li><strong>PrestaShop Hook Reference:</strong> <a href="https://devdocs.prestashop-project.org/8/modules/concepts/hooks/" target="_blank" rel="noopener">DevDocs - Hooks</a></li>
            <li><strong>Module Generator:</strong> <a href="https://validator.prestashop.com/generator" target="_blank" rel="noopener">PrestaShop Module Generator</a></li>
            <li><strong>Hook Displayer Module:</strong> Módulo para visualizar todos los hooks disponibles en una página</li>
            <li><strong>Chrome DevTools:</strong> Para debugging de eventos JavaScript y performance</li>
            <li><strong>PrestaShop Debug Mode:</strong> Activa <code>_PS_MODE_DEV_</code> para ver mensajes detallados</li>
        </ul>
    </div>
    `;

// @ts-nocheck
const sobreescrituraPlantillasSmartyTwig = `
    <div class="content-section">
        <h1 id="sobreescritura-plantillas-smarty-twig">Sobreescritura de Plantillas Smarty/Twig (PrestaShop 1.7+)</h1>
        <p>En PrestaShop 8.9+, el sistema de plantillas sigue basándose principalmente en <strong>Smarty</strong>, aunque algunas áreas del Back Office moderno utilizan <strong>Twig</strong>. Comprender cómo sobreescribir plantillas correctamente es esencial para personalizar el diseño de tu tienda sin romper la funcionalidad ni dificultar las actualizaciones futuras.</p>

        <h2 class="section-title">1. Smarty vs. Twig en PrestaShop 8.9+</h2>
        
        <div class="row">
            <div class="col-md-6">
                <div class="card mb-3">
                    <div class="card-header bg-primary text-white">Smarty (Front Office)</div>
                    <div class="card-body">
                        <p>Motor de plantillas por defecto para el Front Office (tienda visible al público).</p>
                        <ul>
                            <li><strong>Extensión:</strong> <code>.tpl</code></li>
                            <li><strong>Uso:</strong> Renderizado de páginas de productos, categorías, checkout, etc.</li>
                            <li><strong>Ventajas:</strong> Ampliamente documentado, compatible con todos los módulos y temas legacy.</li>
                            <li><strong>Sintaxis:</strong> <code>{$variable}</code>, <code>{foreach}</code>, <code>{if}</code></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card mb-3">
                    <div class="card-header bg-dark text-white">Twig (Back Office Moderno)</div>
                    <div class="card-body">
                        <p>Motor de plantillas utilizado en el Back Office moderno y algunos módulos avanzados.</p>
                        <ul>
                            <li><strong>Extensión:</strong> <code>.html.twig</code></li>
                            <li><strong>Uso:</strong> Controladores Symfony, paneles de administración modernos, módulos con Symfony.</li>
                            <li><strong>Ventajas:</strong> Más seguro (escapado automático), integración perfecta con Symfony.</li>
                            <li><strong>Sintaxis:</strong> <code>{{ variable }}</code>, <code>{% for %}</code>, <code>{% if %}</code></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <h2 class="section-title">2. Sobreescritura de Plantillas Smarty en el Tema</h2>
        
        <h3>2.1. Jerarquía de Búsqueda de Plantillas</h3>
        <p>PrestaShop busca plantillas en el siguiente orden de prioridad:</p>
        <ol>
            <li><strong>Tema actual:</strong> <code>/themes/mi-tema/templates/...</code></li>
            <li><strong>Tema padre (si existe):</strong> <code>/themes/classic/templates/...</code></li>
            <li><strong>Módulos sobrescritos en el tema:</strong> <code>/themes/mi-tema/modules/nombre-modulo/...</code></li>
            <li><strong>Módulo original:</strong> <code>/modules/nombre-modulo/views/templates/...</code></li>
        </ol>

        <h3>2.2. Sobreescribir Plantilla del Core</h3>
        <p>Para modificar una plantilla del sistema (por ejemplo, la página de producto):</p>

        <div class="alert alert-info">
            <strong>📍 Ruta Original:</strong> <code>/themes/classic/templates/catalog/product.tpl</code><br>
            <strong>🎯 Tu Override:</strong> <code>/themes/mi-tema/templates/catalog/product.tpl</code>
        </div>

        <p><strong>Ejemplo: Personalizar la página de producto</strong></p>
        <pre><code class="language-html">{* /themes/mi-tema/templates/catalog/product.tpl *}

{extends file='catalog/product.tpl'}

{* Sobreescribir solo el bloque de precio *}
{block name='product_prices'}
  <div class="product-prices-custom">
    <span class="current-price">
      <span class="price" itemprop="price" content="{$product.price_amount}">
        {$product.price}
      </span>
    </span>
    
    {* Agregar badge personalizado si hay descuento *}
    {if $product.has_discount}
      <span class="discount-badge">
        ¡{$product.discount_percentage}% OFF!
      </span>
    {/if}
    
    {* Añadir precio con impuestos incluidos *}
    {if $product.show_price}
      <div class="tax-info">
        IVA incluido: {$product.price_tax_exc}
      </div>
    {/if}
  </div>
{/block}

{* Añadir un nuevo bloque personalizado al final *}
{block name='product_additional_info' append}
  <div class="custom-shipping-info">
    <i class="material-icons">local_shipping</i>
    <span>Envío gratis en pedidos superiores a 50€</span>
  </div>
{/block}</code></pre>

        <h3>2.3. Modificadores de Bloques en Smarty</h3>
        
        <table class="table table-bordered">
            <thead class="table-dark">
                <tr>
                    <th>Modificador</th>
                    <th>Comportamiento</th>
                    <th>Ejemplo</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><code>{block name='xxx'}</code></td>
                    <td>Reemplaza completamente el contenido del bloque padre</td>
                    <td><code>{block name='head'}&lt;!-- nuevo contenido --&gt;{/block}</code></td>
                </tr>
                <tr>
                    <td><code>{block name='xxx' prepend}</code></td>
                    <td>Añade contenido ANTES del contenido del padre</td>
                    <td><code>{block name='head' prepend}&lt;meta ...&gt;{/block}</code></td>
                </tr>
                <tr>
                    <td><code>{block name='xxx' append}</code></td>
                    <td>Añade contenido DESPUÉS del contenido del padre</td>
                    <td><code>{block name='footer' append}&lt;script&gt;...&lt;/script&gt;{/block}</code></td>
                </tr>
                <tr>
                    <td><code>{$smarty.block.parent}</code></td>
                    <td>Inserta el contenido original del bloque padre</td>
                    <td><code>{block name='head'}{$smarty.block.parent}&lt;link...&gt;{/block}</code></td>
                </tr>
            </tbody>
        </table>

        <h3>2.4. Sobreescribir Plantillas de Módulos</h3>
        <p>Para personalizar la apariencia de un módulo sin modificar sus archivos originales:</p>

        <div class="alert alert-warning">
            <strong>⚠️ Ruta Original del Módulo:</strong> <code>/modules/ps_shoppingcart/views/templates/hook/ps_shoppingcart.tpl</code><br>
            <strong>✅ Tu Override en el Tema:</strong> <code>/themes/mi-tema/modules/ps_shoppingcart/views/templates/hook/ps_shoppingcart.tpl</code>
        </div>

        <p><strong>Ejemplo: Personalizar el carrito flotante (ps_shoppingcart)</strong></p>
        <pre><code class="language-html">{* /themes/mi-tema/modules/ps_shoppingcart/views/templates/hook/ps_shoppingcart.tpl *}

<div id="_desktop_cart" class="custom-cart-widget">
  <div class="blockcart cart-preview {if $cart.products_count > 0}active{else}inactive{/if}" 
       data-refresh-url="{$refresh_url}">
    
    {* Contador de productos con animación *}
    <div class="cart-products-count">
      <i class="material-icons shopping-cart">shopping_cart</i>
      {if $cart.products_count > 0}
        <span class="cart-badge">{$cart.products_count}</span>
      {/if}
    </div>

    {* Subtotal visible siempre *}
    <div class="cart-subtotal">
      {$cart.subtotals.products.value}
    </div>
    
    {* Dropdown cuando hay productos *}
    {if $cart.products_count > 0}
      <div class="cart-dropdown-content">
        {foreach from=$cart.products item=product}
          <div class="cart-item">
            <img src="{$product.cover.small.url}" alt="{$product.name}" loading="lazy">
            <div class="item-details">
              <p class="product-name">{$product.name|truncate:30:'...'}</p>
              <span class="product-quantity">x{$product.quantity}</span>
              <span class="product-price">{$product.price}</span>
            </div>
          </div>
        {/foreach}
        
        <div class="cart-actions">
          <a href="{$cart_url}" class="btn btn-primary">
            {l s='View Cart' d='Shop.Theme.Actions'}
          </a>
        </div>
      </div>
    {/if}
  </div>
</div></code></pre>

        <h2 class="section-title">3. Trabajando con Twig en el Back Office</h2>
        
        <h3>3.1. Estructura de Plantillas Twig en Módulos</h3>
        <p>Los módulos modernos que utilizan controladores Symfony emplean Twig para renderizar sus vistas de administración.</p>

        <pre><code class="language-plaintext">mi-modulo/
└── views/
    └── templates/
        └── admin/
            ├── configure.html.twig        # Página de configuración
            ├── list.html.twig            # Listado de elementos
            └── _partials/
                └── form.html.twig        # Fragmento reutilizable</code></pre>

        <h3>3.2. Ejemplo de Plantilla Twig para Configuración de Módulo</h3>
        <pre><code class="language-html">{# views/templates/admin/configure.html.twig #}

{% extends '@PrestaShop/Admin/layout.html.twig' %}

{% block content %}
  <div class="module-configuration">
    <h2>{{ 'Configuración del Módulo'|trans({}, 'Modules.Mimodulo.Admin') }}</h2>
    
    {# Renderizar formulario de configuración #}
    {{ form_start(configurationForm) }}
      
      <div class="form-group">
        {{ form_label(configurationForm.api_key) }}
        {{ form_widget(configurationForm.api_key, {'attr': {'class': 'form-control'}}) }}
        {{ form_errors(configurationForm.api_key) }}
      </div>

      <div class="form-group">
        {{ form_label(configurationForm.enabled) }}
        {{ form_widget(configurationForm.enabled) }}
        <small class="form-text text-muted">
          {{ 'Activa o desactiva el módulo'|trans({}, 'Modules.Mimodulo.Admin') }}
        </small>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary">
          <i class="material-icons">save</i>
          {{ 'Guardar'|trans({}, 'Admin.Actions') }}
        </button>
      </div>

    {{ form_end(configurationForm) }}
  </div>
{% endblock %}

{% block javascripts %}
  {{ parent() }}
  <script src="{{ asset('modules/mimodulo/views/js/admin-config.js') }}"></script>
{% endblock %}</code></pre>

        <h3>3.3. Diferencias Clave entre Smarty y Twig</h3>
        
        <table class="table table-striped">
            <thead class="table-dark">
                <tr>
                    <th>Característica</th>
                    <th>Smarty</th>
                    <th>Twig</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Variables</strong></td>
                    <td><code>{$variable}</code></td>
                    <td><code>{{ variable }}</code></td>
                </tr>
                <tr>
                    <td><strong>Condicionales</strong></td>
                    <td><code>{if $condition}...{/if}</code></td>
                    <td><code>{% if condition %}...{% endif %}</code></td>
                </tr>
                <tr>
                    <td><strong>Bucles</strong></td>
                    <td><code>{foreach $items as $item}...{/foreach}</code></td>
                    <td><code>{% for item in items %}...{% endfor %}</code></td>
                </tr>
                <tr>
                    <td><strong>Includes</strong></td>
                    <td><code>{include file='_partials/header.tpl'}</code></td>
                    <td><code>{% include '@Module/admin/_partials/header.html.twig' %}</code></td>
                </tr>
                <tr>
                    <td><strong>Traducción</strong></td>
                    <td><code>{l s='Text' d='Shop.Theme'}</code></td>
                    <td><code>{{ 'Text'|trans({}, 'Shop.Theme') }}</code></td>
                </tr>
                <tr>
                    <td><strong>Escapado</strong></td>
                    <td><code>{$var|escape:'html'}</code></td>
                    <td><code>{{ var|e }}</code> (automático por defecto)</td>
                </tr>
                <tr>
                    <td><strong>Sin escapar</strong></td>
                    <td><code>{$html nofilter}</code></td>
                    <td><code>{{ html|raw }}</code></td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">4. Mejores Prácticas para Sobreescritura</h2>

        <h3>4.1. Usa Herencia en Lugar de Copiar Todo</h3>
        <p><strong>❌ Evita esto:</strong></p>
        <pre><code class="language-html">{* Copiar TODO el contenido del archivo original solo para cambiar una línea *}
{* ... 500 líneas de código copiado ... *}</code></pre>

        <p><strong>✅ Haz esto:</strong></p>
        <pre><code class="language-html">{extends file='catalog/listing/product-list.tpl'}

{* Solo modifica el bloque específico que necesitas *}
{block name='product_list_body'}
  <div class="custom-product-grid">
    {$smarty.block.parent}  {* Mantiene el contenido original *}
  </div>
{/block}</code></pre>

        <h3>4.2. Documenta tus Cambios</h3>
        <pre><code class="language-html">{**
 * Template personalizado de la página de producto
 * 
 * @override themes/classic/templates/catalog/product.tpl
 * @modificaciones:
 *   - Añadido badge de descuento personalizado
 *   - Agregada información de envío gratis
 *   - Modificado diseño del precio
 * @author Tu Nombre
 * @date 2024-01-15
 *}

{extends file='catalog/product.tpl'}</code></pre>

        <h3>4.3. Mantén la Compatibilidad con Variables del Core</h3>
        <p>Siempre verifica que las variables que uses existan en el contexto:</p>
        <pre><code class="language-html">{* Verifica antes de usar *}
{if isset($product.has_discount) && $product.has_discount}
  <span class="discount">{$product.discount_percentage}%</span>
{/if}

{* Valor por defecto si no existe *}
{$product.description_short|default:'Sin descripción disponible'}</code></pre>

        <h3>4.4. Usar Funciones de Prestashop para Seguridad</h3>
        <pre><code class="language-html">{* Escapar correctamente los datos del usuario *}
{$customer_comment|escape:'html':'UTF-8'}

{* Para URLs *}
{$product_url|escape:'url'}

{* Para JavaScript *}
{$variable|escape:'javascript':'UTF-8'}

{* Para atributos HTML *}
{$title|escape:'htmlall':'UTF-8'}</code></pre>

        <h2 class="section-title">5. Debugging de Plantillas</h2>

        <h3>5.1. Mostrar Variables Disponibles en Smarty</h3>
        <pre><code class="language-html">{* Ver todas las variables accesibles en la plantilla actual *}
{debug}

{* Ver contenido de una variable específica *}
<pre>{$product|@print_r}</pre>

{* En producción (solo para admins), activar modo de debug *}
{* En config/defines.inc.php: define('_PS_MODE_DEV_', true); *}</code></pre>

        <h3>5.2. Debugging en Twig</h3>
        <pre><code class="language-html">{# Volcado de variable (requiere modo debug activo) #}
{{ dump(variable) }}

{# Verificar si existe una variable #}
{% if variable is defined %}
  {{ variable }}
{% else %}
  Variable no disponible
{% endif %}</code></pre>

        <h2 class="section-title">6. Ejemplo Completo: Override del Header</h2>
        <p>Caso práctico de sobreescritura del header para agregar un banner promocional:</p>

        <pre><code class="language-html">{* /themes/mi-tema/templates/_partials/header.tpl *}

{extends file='_partials/header.tpl'}

{* Agregar banner promocional ANTES del header *}
{block name='header_banner' prepend}
  <div class="promo-banner">
    <div class="container">
      <p>
        <i class="material-icons">local_offer</i>
        ¡Envío gratis en compras superiores a 50€! 
        <a href="{$urls.pages.index}promociones">Ver promociones</a>
      </p>
    </div>
  </div>
{/block}

{* Modificar el logo para hacerlo responsive *}
{block name='header_logo'}
  <a href="{$urls.base_url}">
    <picture>
      <source media="(max-width: 768px)" 
              srcset="{$shop.logo_details.src_mobile}" 
              width="150" 
              height="auto">
      <img src="{$shop.logo}" 
           alt="{$shop.name}" 
           loading="lazy"
           width="250"
           height="auto">
    </picture>
  </a>
{/block}

{* Añadir menú de usuario mejorado *}
{block name='header_user'}
  <div class="user-info-enhanced">
    {$smarty.block.parent}  {* Mantiene el menú original *}
    
    {if $customer.is_logged}
      <div class="user-quick-links">
        <a href="{$urls.pages.my_account}" class="account-link">
          <i class="material-icons">account_circle</i>
          <span>{$customer.firstname}</span>
        </a>
        <a href="{$urls.pages.history}" class="orders-link">
          <i class="material-icons">shopping_bag</i>
          <span>{l s='My Orders' d='Shop.Theme.Customeraccount'}</span>
        </a>
      </div>
    {/if}
  </div>
{/block}</code></pre>

        <h2 class="section-title">7. Recursos y Referencias</h2>
        <ul>
            <li><strong>Documentación Oficial Smarty:</strong> <a href="https://www.smarty.net/docs/en/" target="_blank" rel="noopener">smarty.net/docs</a></li>
            <li><strong>Documentación Oficial Twig:</strong> <a href="https://twig.symfony.com/doc/3.x/" target="_blank" rel="noopener">twig.symfony.com</a></li>
            <li><strong>PrestaShop DevDocs - Themes:</strong> <a href="https://devdocs.prestashop-project.org/8/themes/" target="_blank" rel="noopener">DevDocs Themes</a></li>
            <li><strong>Smarty Modifier Reference:</strong> <a href="https://www.smarty.net/docs/en/language.modifiers.tpl" target="_blank" rel="noopener">Modifiers Smarty</a></li>
            <li><strong>Twig Filters:</strong> <a href="https://twig.symfony.com/doc/3.x/filters/index.html" target="_blank" rel="noopener">Twig Filters</a></li>
        </ul>
    </div>
    `;

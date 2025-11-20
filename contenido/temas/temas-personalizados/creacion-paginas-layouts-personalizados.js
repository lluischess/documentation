// @ts-nocheck
const creacionPaginasLayoutsPersonalizados = `
    <div class="content-section">
        <h1 id="creacion-paginas-layouts-personalizados">Creación de Páginas y Layouts Personalizados</h1>
        <p>PrestaShop 8.9+ ofrece un sistema flexible para crear páginas completamente personalizadas más allá de las plantillas estándar del catálogo. Este capítulo explica cómo crear controladores personalizados, layouts únicos, páginas de aterrizaje y gestionar contenido dinámico para necesidades específicas de tu tienda.</p>

        <h2 class="section-title">1. Tipos de Páginas Personalizadas</h2>

        <table class="table table-bordered">
            <thead class="table-dark">
                <tr>
                    <th>Tipo</th>
                    <th>Casos de Uso</th>
                    <th>Complejidad</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>CMS Pages</strong></td>
                    <td>Sobre nosotros, Términos y Condiciones, FAQ</td>
                    <td><span class="badge bg-success">Baja</span></td>
                </tr>
                <tr>
                    <td><strong>Controladores Front</strong></td>
                    <td>Páginas con lógica personalizada, formularios avanzados</td>
                    <td><span class="badge bg-warning">Media</span></td>
                </tr>
                <tr>
                    <td><strong>Landing Pages</strong></td>
                    <td>Campañas de marketing, promociones especiales</td>
                    <td><span class="badge bg-warning">Media</span></td>
                </tr>
                <tr>
                    <td><strong>Páginas con Layouts Únicos</strong></td>
                    <td>Homepage especializada, páginas de marca</td>
                    <td><span class="badge bg-danger">Alta</span></td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">2. Creación de Páginas CMS Básicas</h2>

        <h3>2.1. Crear CMS Page desde Back Office</h3>
        <pre><code class="language-plaintext">Back Office → Diseño → Páginas

1. Clic en "Añadir nueva página"
2. Contenido:
   - Meta título: "Sobre Nosotros | Mi Tienda"
   - Meta descripción: SEO friendly
   - Contenido: Usar editor TinyMCE o HTML
3. SEO:
   - URL amigable: "sobre-nosotros"
4. Opciones:
   ✅ Activada
   ✅ Indexada (si quieres que aparezca en buscadores)
5. Guardar</code></pre>

        <h3>2.2. Template Personalizado para CMS</h3>
        <p>Por defecto, PrestaShop usa <code>cms.tpl</code>. Puedes crear templates específicos:</p>

        <pre><code class="language-plaintext">/themes/mi-tema/templates/cms/
├── cms.tpl                    # Template por defecto
├── page-about.tpl            # Template específico "Sobre nosotros"
├── page-faq.tpl              # Template FAQ con acordeón
└── page-contact-extended.tpl  # Contacto personalizado</code></pre>

        <pre><code class="language-html">{* /themes/mi-tema/templates/cms/page-about.tpl *}

{extends file='page.tpl'}

{block name='page_content'}
  <div class="about-page">
    {* Hero section *}
    <section class="hero-section">
      <div class="container">
        <h1>{$cms.meta_title}</h1>
        <p class="lead">Descubre nuestra historia</p>
      </div>
    </section>
    
    {* Contenido del CMS *}
    <section class="content-section">
      <div class="container">
        <div class="row">
          <div class="col-lg-8">
            {$cms.content nofilter}
          </div>
          
          <div class="col-lg-4">
            {* Sidebar con información adicional *}
            <aside class="about-sidebar">
              <div class="card">
                <div class="card-body">
                  <h3>Contacta con nosotros</h3>
                  <p><i class="material-icons">phone</i> {$shop.phone}</p>
                  <p><i class="material-icons">email</i> {$shop.email}</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
    
    {* Timeline de la empresa *}
    <section class="timeline-section">
      <div class="container">
        <h2>Nuestra Historia</h2>
        <div class="timeline">
          <div class="timeline-item">
            <div class="timeline-year">2010</div>
            <div class="timeline-content">
              <h3>Fundación</h3>
              <p>Comenzamos como una pequeña tienda local</p>
            </div>
          </div>
          
          <div class="timeline-item">
            <div class="timeline-year">2015</div>
            <div class="timeline-content">
              <h3>Expansión Online</h3>
              <p>Lanzamiento de nuestra tienda e-commerce</p>
            </div>
          </div>
          
          <div class="timeline-item">
            <div class="timeline-year">2024</div>
            <div class="timeline-content">
              <h3>Líderes del Sector</h3>
              <p>Más de 10,000 clientes satisfechos</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
{/block}</code></pre>

        <p>Para asignar este template a una página CMS específica, añade en <code>theme.yml</code>:</p>
        <pre><code class="language-yaml"># theme.yml
meta:
  name: Mi Tema
  version: 1.0.0

# Asignación de templates CMS personalizados
cms:
  about-us:
    template: cms/page-about.tpl
  faq:
    template: cms/page-faq.tpl</code></pre>

        <h2 class="section-title">3. Controlador Front Personalizado</h2>

        <h3>3.1. Crear un Módulo con Controlador Custom</h3>
        <pre><code class="language-plaintext">modulosamplepage/
├── modulosamplepage.php
├── controllers/
│   └── front/
│       └── display.php
├── views/
│   └── templates/
│       └── front/
│           └── display.tpl
└── config.xml</code></pre>

        <h3>3.2. Archivo Principal del Módulo</h3>
        <pre><code class="language-php"><?php
// modules/modulosamplepage/modulosamplepage.php

if (!defined('_PS_VERSION_')) {
    exit;
}

class ModuloSamplePage extends Module
{
    public function __construct()
    {
        $this->name = 'modulosamplepage';
        $this->tab = 'front_office_features';
        $this->version = '1.0.0';
        $this->author = 'Tu Nombre';
        $this->need_instance = 0;

        parent::__construct();

        $this->displayName = $this->l('Sample Custom Page');
        $this->description = $this->l('Crea una página personalizada con controlador');
    }

    public function install()
    {
        return parent::install() 
            && $this->registerHook('displayHeader');
    }

    public function hookDisplayHeader()
    {
        // Añadir CSS/JS específico si es necesario
        if ($this->context->controller instanceof ModuloSamplePageDisplayModuleFrontController) {
            $this->context->controller->addCSS($this->_path . 'views/css/samplepage.css');
            $this->context->controller->addJS($this->_path . 'views/js/samplepage.js');
        }
    }
}</code></pre>

        <h3>3.3. Controlador Frontend</h3>
        <pre><code class="language-php"><?php
// modules/modulosamplepage/controllers/front/display.php

class ModuloSamplePageDisplayModuleFrontController extends ModuleFrontController
{
    public function init()
    {
        parent::init();
    }

    public function initContent()
    {
        parent::initContent();

        // Obtener datos para la página
        $products = $this->getFeaturedProducts();
        $categories = $this->getTopCategories();
        
        // Manejar formulario si es POST
        if (Tools::isSubmit('submitContactForm')) {
            $this->processContactForm();
        }

        // Asignar variables a Smarty
        $this->context->smarty->assign([
            'page_title' => $this->l('Mi Página Personalizada'),
            'page_description' => $this->l('Descripción de la página'),
            'products' => $products,
            'categories' => $categories,
            'form_action' => $this->context->link->getModuleLink(
                'modulosamplepage',
                'display'
            )
        ]);

        // SEO
        $this->context->smarty->assign([
            'meta_title' => $this->l('Página Personalizada | ') . Configuration::get('PS_SHOP_NAME'),
            'meta_description' => $this->l('Esta es una página personalizada con contenido único'),
            'meta_keywords' => $this->l('keywords, personalizadas')
        ]);

        // Renderizar template
        $this->setTemplate('module:modulosamplepage/views/templates/front/display.tpl');
    }

    /**
     * Obtener productos destacados
     */
    private function getFeaturedProducts($limit = 8)
    {
        $products = Product::getProducts(
            $this->context->language->id,
            0,
            $limit,
            'date_add',
            'DESC',
            false,
            true
        );

        // Procesar productos con el ProductAssembler
        $assembler = new ProductAssembler($this->context);
        $presenterFactory = new ProductPresenterFactory($this->context);
        $presentationSettings = $presenterFactory->getPresentationSettings();
        $presenter = new ProductListingPresenter(
            new ImageRetriever($this->context->link),
            $this->context->link,
            new PriceFormatter(),
            new ProductColorsRetriever(),
            $this->context->getTranslator()
        );

        $productsForTemplate = [];
        foreach ($products as $rawProduct) {
            $productsForTemplate[] = $presenter->present(
                $presentationSettings,
                $assembler->assembleProduct($rawProduct),
                $this->context->language
            );
        }

        return $productsForTemplate;
    }

    /**
     * Obtener categorías principales
     */
    private function getTopCategories($limit = 6)
    {
        $categories = Category::getCategories(
            $this->context->language->id,
            true,
            false
        );

        return array_slice($categories, 0, $limit);
    }

    /**
     * Procesar formulario de contacto
     */
    private function processContactForm()
    {
        $name = Tools::getValue('name');
        $email = Tools::getValue('email');
        $message = Tools::getValue('message');

        // Validación
        if (empty($name) || empty($email) || empty($message)) {
            $this->errors[] = $this->l('Todos los campos son obligatorios');
            return;
        }

        if (!Validate::isEmail($email)) {
            $this->errors[] = $this->l('Email inválido');
            return;
        }

        // Enviar email
        $templateVars = [
            '{name}' => $name,
            '{email}' => $email,
            '{message}' => nl2br($message)
        ];

        Mail::Send(
            $this->context->language->id,
            'contact_form',
            $this->l('Nuevo mensaje de contacto'),
            $templateVars,
            Configuration::get('PS_SHOP_EMAIL'),
            null,
            $email,
            $name
        );

        $this->success[] = $this->l('Mensaje enviado correctamente');
    }

    /**
     * Definir breadcrumb personalizado
     */
    public function getBreadcrumbLinks()
    {
        $breadcrumb = parent::getBreadcrumbLinks();

        $breadcrumb['links'][] = [
            'title' => $this->l('Mi Página'),
            'url' => $this->context->link->getModuleLink('modulosamplepage', 'display')
        ];

        return $breadcrumb;
    }

    /**
     * Configurar canonical URL
     */
    public function getCanonicalURL()
    {
        return $this->context->link->getModuleLink('modulosamplepage', 'display');
    }
}</code></pre>

        <h3>3.4. Template del Controlador</h3>
        <pre><code class="language-html">{* modules/modulosamplepage/views/templates/front/display.tpl *}

{extends file='page.tpl'}

{block name='page_title'}
  <h1>{$page_title}</h1>
{/block}

{block name='page_content_container'}
  <div class="custom-page-content">
    
    {* Hero Section *}
    <section class="hero-section mb-5">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-6">
            <h2>Bienvenido a nuestra página especial</h2>
            <p class="lead">{$page_description}</p>
            <a href="{$urls.pages.index}" class="btn btn-primary btn-lg">
              Explorar productos
            </a>
          </div>
          <div class="col-lg-6">
            <img src="{$urls.img_url}hero-image.jpg" 
                 alt="Hero" 
                 class="img-fluid rounded">
          </div>
        </div>
      </div>
    </section>

    {* Productos destacados *}
    {if $products}
      <section class="featured-products mb-5">
        <div class="container">
          <h2 class="section-title">Productos Destacados</h2>
          
          <div class="products-grid">
            {foreach from=$products item=product}
              <article class="product-miniature">
                {include file='catalog/_partials/miniatures/product.tpl' product=$product}
              </article>
            {/foreach}
          </div>
        </div>
      </section>
    {/if}

    {* Categorías principales *}
    {if $categories}
      <section class="top-categories mb-5">
        <div class="container">
          <h2 class="section-title">Explora por Categoría</h2>
          
          <div class="categories-grid">
            {foreach from=$categories item=category}
              <a href="{$link->getCategoryLink($category.id_category)}" 
                 class="category-card">
                <div class="category-image">
                  {if $category.id_image}
                    <img src="{$link->getCatImageLink($category.link_rewrite, $category.id_image, 'medium_default')}" 
                         alt="{$category.name}"
                         loading="lazy">
                  {/if}
                </div>
                <h3>{$category.name}</h3>
              </a>
            {/foreach}
          </div>
        </div>
      </section>
    {/if}

    {* Formulario de contacto *}
    <section class="contact-form-section">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-8">
            <h2 class="section-title text-center">Contáctanos</h2>
            
            {if $success}
              <div class="alert alert-success">
                {foreach from=$success item=message}
                  {$message}
                {/foreach}
              </div>
            {/if}
            
            {if $errors}
              <div class="alert alert-danger">
                {foreach from=$errors item=error}
                  {$error}
                {/foreach}
              </div>
            {/if}
            
            <form action="{$form_action}" method="post" class="contact-form">
              <div class="form-group">
                <label for="name">Nombre *</label>
                <input type="text" 
                       id="name" 
                       name="name" 
                       class="form-control"
                       value="{if isset($smarty.post.name)}{$smarty.post.name}{/if}"
                       required>
              </div>
              
              <div class="form-group">
                <label for="email">Email *</label>
                <input type="email" 
                       id="email" 
                       name="email" 
                       class="form-control"
                       value="{if isset($smarty.post.email)}{$smarty.post.email}{/if}"
                       required>
              </div>
              
              <div class="form-group">
                <label for="message">Mensaje *</label>
                <textarea id="message" 
                          name="message" 
                          class="form-control" 
                          rows="5"
                          required>{if isset($smarty.post.message)}{$smarty.post.message}{/if}</textarea>
              </div>
              
              <div class="form-actions text-center">
                <button type="submit" 
                        name="submitContactForm" 
                        class="btn btn-primary btn-lg">
                  Enviar Mensaje
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
    
  </div>
{/block}</code></pre>

        <h3>3.5. URL de Acceso</h3>
        <p>La página será accesible en:</p>
        <pre><code class="language-plaintext">https://tu-tienda.com/module/modulosamplepage/display

# URL amigable (configurar en .htaccess o usar módulo de URLs):
https://tu-tienda.com/pagina-personalizada</code></pre>

        <h2 class="section-title">4. Layouts Personalizados</h2>

        <h3>4.1. Crear Layout Sin Columnas</h3>
        <pre><code class="language-html">{* /themes/mi-tema/templates/layouts/layout-full-width.tpl *}

<!doctype html>
<html lang="{$language.locale}">
  <head>
    {block name='head'}
      {include file='_partials/head.tpl'}
    {/block}
  </head>

  <body id="{$page.page_name}" class="{$page.body_classes|classnames} layout-full-width">
    
    {hook h='displayAfterBodyOpeningTag'}

    <main>
      {block name='header'}
        {include file='_partials/header.tpl'}
      {/block}

      {block name='notifications'}
        {include file='_partials/notifications.tpl'}
      {/block}

      {* Sin columnas laterales - contenido full width *}
      <section id="main">
        {block name='breadcrumb'}
          {include file='_partials/breadcrumb.tpl'}
        {/block}

        <div class="container-fluid"> {* fluid para ancho completo *}
          {block name='page_content_top'}{/block}
          
          {block name='page_content'}
            <!-- Aquí va el contenido de la página -->
          {/block}
          
          {block name='page_content_bottom'}{/block}
        </div>
      </section>

      {block name='footer'}
        {include file='_partials/footer.tpl'}
      {/block}
    </main>

    {block name='javascript_bottom'}
      {include file="_partials/javascript.tpl" javascript=$javascript.bottom}
    {/block}

    {hook h='displayBeforeBodyClosingTag'}
  </body>
</html></code></pre>

        <h3>4.2. Homepage con Layout Único</h3>
        <pre><code class="language-html">{* /themes/mi-tema/templates/index.tpl *}

{extends file='layouts/layout-full-width.tpl'}

{block name='page_content'}
  
  {* Hero slider full width *}
  <section class="hero-slider">
    {hook h='displayHome'}
  </section>

  {* Categorías destacadas en grid *}
  <section class="featured-categories py-5">
    <div class="container">
      <h2 class="text-center mb-5">Compra por Categoría</h2>
      
      <div class="categories-grid">
        {* Obtener categorías principales *}
        {foreach from=$categories item=category}
          <div class="category-card">
            <a href="{$link->getCategoryLink($category.id)}">
              <img src="{$category.image}" alt="{$category.name}">
              <h3>{$category.name}</h3>
              <span class="product-count">{$category.nb_products} productos</span>
            </a>
          </div>
        {/foreach}
      </div>
    </div>
  </section>

  {* Productos más vendidos *}
  <section class="best-sellers py-5 bg-light">
    <div class="container">
      <h2 class="text-center mb-5">Los Más Vendidos</h2>
      {hook h='displayHomeTabContent'}
    </div>
  </section>

  {* Newsletter y ventajas *}
  <section class="advantages py-5">
    <div class="container">
      <div class="row">
        <div class="col-md-3 text-center">
          <i class="material-icons">local_shipping</i>
          <h4>Envío Gratis</h4>
          <p>En pedidos superiores a 50€</p>
        </div>
        <div class="col-md-3 text-center">
          <i class="material-icons">security</i>
          <h4>Pago Seguro</h4>
          <p>Transacciones protegidas</p>
        </div>
        <div class="col-md-3 text-center">
          <i class="material-icons">autorenew</i>
          <h4>Devoluciones Fáciles</h4>
          <p>30 días para devoluciones</p>
        </div>
        <div class="col-md-3 text-center">
          <i class="material-icons">support_agent</i>
          <h4>Soporte 24/7</h4>
          <p>Estamos aquí para ayudarte</p>
        </div>
      </div>
    </div>
  </section>

{/block}</code></pre>

        <h2 class="section-title">5. Landing Pages para Campañas</h2>

        <h3>5.1. Landing Page Standalone</h3>
        <p>Para campañas de marketing que necesitan diseño completamente diferente:</p>

        <pre><code class="language-html">{* /themes/mi-tema/templates/cms/landing-black-friday.tpl *}

<!doctype html>
<html lang="{$language.locale}">
  <head>
    {block name='head'}
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Black Friday - Descuentos hasta 70%</title>
      <meta name="description" content="Black Friday en {$shop.name}. Aprovecha descuentos de hasta 70% en toda la tienda">
      
      {* CSS específico de landing *}
      <link rel="stylesheet" href="{$urls.base_url}themes/mi-tema/assets/css/landing-blackfriday.css">
    {/block}
  </head>

  <body class="landing-page landing-blackfriday">
    
    {* Header minimalista solo con logo *}
    <header class="landing-header">
      <div class="container">
        <img src="{$shop.logo}" alt="{$shop.name}" class="logo">
      </div>
    </header>

    {* Hero con countdown *}
    <section class="hero-section">
      <div class="container text-center">
        <h1 class="display-1">BLACK FRIDAY</h1>
        <p class="lead">Hasta 70% de descuento</p>
        
        {* Countdown timer *}
        <div class="countdown" data-end-date="2024-11-29 23:59:59">
          <div class="countdown-item">
            <span class="countdown-value" id="days">00</span>
            <span class="countdown-label">Días</span>
          </div>
          <div class="countdown-item">
            <span class="countdown-value" id="hours">00</span>
            <span class="countdown-label">Horas</span>
          </div>
          <div class="countdown-item">
            <span class="countdown-value" id="minutes">00</span>
            <span class="countdown-label">Minutos</span>
          </div>
          <div class="countdown-item">
            <span class="countdown-value" id="seconds">00</span>
            <span class="countdown-label">Segundos</span>
          </div>
        </div>
        
        <a href="#offers" class="btn btn-primary btn-lg mt-4">
          Ver Ofertas
        </a>
      </div>
    </section>

    {* Ofertas destacadas *}
    <section id="offers" class="offers-section">
      <div class="container">
        <h2 class="text-center mb-5">Ofertas Exclusivas</h2>
        
        <div class="products-grid">
          {* Mostrar productos en oferta *}
          {foreach from=$products item=product}
            <div class="product-card">
              <div class="discount-badge">-{$product.discount_percentage}%</div>
              <img src="{$product.cover.large.url}" alt="{$product.name}">
              <h3>{$product.name}</h3>
              <div class="prices">
                <span class="price-old">{$product.regular_price}</span>
                <span class="price-sale">{$product.price}</span>
              </div>
              <a href="{$product.url}" class="btn btn-block btn-primary">
                Comprar Ahora
              </a>
            </div>
          {/foreach}
        </div>
      </div>
    </section>

    {* Footer minimalista *}
    <footer class="landing-footer">
      <div class="container text-center">
        <p>&copy; {$smarty.now|date_format:"%Y"} {$shop.name}</p>
      </div>
    </footer>

    {* JavaScript del countdown *}
    <script src="{$urls.base_url}themes/mi-tema/assets/js/countdown.js"></script>
  </body>
</html></code></pre>

        <h2 class="section-title">6. Página de Construcción (Coming Soon)</h2>

        <pre><code class="language-php"><?php
// modules/comingsoonpage/controllers/front/display.php

class ComingSoonPageDisplayModuleFrontController extends ModuleFrontController
{
    public function initContent()
    {
        // Verificar que solo los admins puedan ver la tienda
        if (!$this->context->employee && Configuration::get('PS_SHOP_ENABLE') == 0) {
            parent::initContent();
            
            // Email subscription
            if (Tools::isSubmit('submitEmail')) {
                $email = Tools::getValue('email');
                
                if (Validate::isEmail($email)) {
                    // Guardar en base de datos o servicio de emails
                    Db::getInstance()->insert('coming_soon_subscribers', [
                        'email' => pSQL($email),
                        'date_add' => date('Y-m-d H:i:s')
                    ]);
                    
                    $this->context->smarty->assign('subscribed', true);
                }
            }
            
            $this->context->smarty->assign([
                'launch_date' => Configuration::get('COMING_SOON_LAUNCH_DATE'),
                'page_title' => 'Próximamente...',
                'social_links' => [
                    'facebook' => Configuration::get('PS_FACEBOOK'),
                    'twitter' => Configuration::get('PS_TWITTER'),
                    'instagram' => Configuration::get('PS_INSTAGRAM')
                ]
            ]);
            
            $this->setTemplate('module:comingsoonpage/views/templates/front/comingsoon.tpl');
        } else {
            // Redirigir a homepage si la tienda está activa
            Tools::redirect('index.php');
        }
    }
}</code></pre>

        <h2 class="section-title">7. Gestión de Contenido Dinámico</h2>

        <h3>7.1. Bloques Reutilizables con Hooks</h3>
        <pre><code class="language-php"><?php
// En tu módulo - Crear bloque reutilizable

public function hookDisplayCustomBlock($params)
{
    $blockType = $params['block_type'] ?? 'default';
    
    $this->context->smarty->assign([
        'block_title' => Configuration::get('CUSTOM_BLOCK_TITLE_' . strtoupper($blockType)),
        'block_content' => Configuration::get('CUSTOM_BLOCK_CONTENT_' . strtoupper($blockType)),
        'block_image' => Configuration::get('CUSTOM_BLOCK_IMAGE_' . strtoupper($blockType))
    ]);
    
    return $this->display(__FILE__, 'views/templates/hook/custom-block.tpl');
}</code></pre>

        <pre><code class="language-html">{* En cualquier plantilla *}
{hook h='displayCustomBlock' block_type='promo'}
{hook h='displayCustomBlock' block_type='info'}</code></pre>

        <h2 class="section-title">8. Best Practices</h2>

        <table class="table table-striped">
            <thead class="table-dark">
                <tr>
                    <th>Práctica</th>
                    <th>Descripción</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>SEO Friendly URLs</strong></td>
                    <td>Siempre configurar URLs amigables y canónicas</td>
                </tr>
                <tr>
                    <td><strong>Meta Tags Completos</strong></td>
                    <td>Title, description, keywords en todas las páginas custom</td>
                </tr>
                <tr>
                    <td><strong>Breadcrumbs</strong></td>
                    <td>Implementar navegación breadcrumb para mejor UX y SEO</td>
                </tr>
                <tr>
                    <td><strong>Responsive Design</strong></td>
                    <td>Todas las páginas custom deben ser responsive</td>
                </tr>
                <tr>
                    <td><strong>Cache</strong></td>
                    <td>Aprovechar caché de PrestaShop para páginas estáticas</td>
                </tr>
                <tr>
                    <td><strong>Validación de Datos</strong></td>
                    <td>Siempre validar entradas de usuario en formularios</td>
                </tr>
                <tr>
                    <td><strong>Escapar Output</strong></td>
                    <td>Usar <code>|escape:'html'</code> para prevenir XSS</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">9. Recursos</h2>
        <ul>
            <li><strong>PrestaShop Docs - Controllers:</strong> <a href="https://devdocs.prestashop-project.org/8/modules/concepts/controllers/" target="_blank">Controllers Documentation</a></li>
            <li><strong>Smarty Templates:</strong> <a href="https://www.smarty.net/docs/en/" target="_blank">Smarty Documentation</a></li>
            <li><strong>Page Builder Modules:</strong> Considera usar módulos como Elementor for PrestaShop para facilitar la creación de landing pages</li>
        </ul>
    </div>
    `;

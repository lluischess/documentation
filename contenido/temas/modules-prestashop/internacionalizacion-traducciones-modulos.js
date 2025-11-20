const internacionalizacionTraduccionesModulos = `
    <div class="content-section">
        <h1 id="internacionalizacion-traducciones-modulos">Internacionalización y Traducciones en Módulos</h1>
        <p>La internacionalización (i18n) permite que tu módulo funcione en múltiples idiomas sin modificar el código. PrestaShop usa un sistema de traducción basado en archivos de idioma y el método <code>$this->l()</code> (legacy) o el sistema de traducción de Symfony (moderno). Es esencial para módulos distribuibles globalmente.</p>

        <h2 class="section-title">1. Método Legacy: $this->l()</h2>
        <p>Este es el método tradicional de PrestaShop, aún ampliamente usado en módulos. Las cadenas se marcan en el código y se extraen automáticamente al instalar el módulo.</p>

        <h3>1.1. Uso Básico de $this->l()</h3>
        <p>El método <code>l()</code> (de "localize") traduce una cadena según el idioma activo del contexto.</p>

        <pre><code class="language-php">declare(strict_types=1);

class MiModulo extends Module
{
    public function __construct()
    {
        $this->name = 'mimodulo';
        // ... otras propiedades ...

        parent::__construct();

        // Textos traducibles
        $this->displayName = $this->l('Mi Módulo Increíble');
        $this->description = $this->l('Este módulo hace cosas increíbles para tu tienda.');
    }

    public function getContent(): string
    {
        $output = '';

        if (Tools::isSubmit('submit_config')) {
            $output .= $this->displayConfirmation(
                $this->l('Configuración guardada correctamente')
            );
        }

        $output .= $this->l('Bienvenido a la configuración del módulo');
        
        return $output;
    }
}</code></pre>

        <h3>1.2. Traducción en Plantillas Smarty</h3>
        <p>En plantillas <code>.tpl</code>, usa el modificador <code>{l s='...' mod='nombremodulo'}</code>.</p>

        <pre><code class="language-smarty">{* modules/mimodulo/views/templates/front/widget.tpl *}
<div class="mi-modulo-widget">
    <h3>{l s='Bienvenido' mod='mimodulo'}</h3>
    <p>{l s='Este es el contenido de mi widget' mod='mimodulo'}</p>
    
    {* Variables en traducciones *}
    <p>{l s='Hola, %s' sprintf=$customer_name mod='mimodulo'}</p>
    
    {* Plurales (requiere lógica adicional en PHP) *}
    {if $count == 1}
        {l s='1 producto encontrado' mod='mimodulo'}
    {else}
        {l s='%d productos encontrados' sprintf=$count mod='mimodulo'}
    {/if}
</div></code></pre>

        <h3>1.3. Contexto de Traducción (Archivos)</h3>
        <p>PrestaShop separa traducciones por archivo para facilitar la gestión. Debes especificar el "source" si traduces fuera del archivo principal del módulo.</p>

        <pre><code class="language-php">// En un controlador: modules/mimodulo/controllers/front/display.php
class MiModuloDisplayModuleFrontController extends ModuleFrontController
{
    public function initContent(): void
    {
        parent::initContent();

        // Especifica el archivo fuente para la traducción
        $mensaje = $this->module->l(
            'Cargando datos...',
            'display' // Nombre del archivo sin extensión
        );

        $this->context->smarty->assign('mensaje', $mensaje);
    }
}</code></pre>

        <h2 class="section-title">2. Archivos de Traducción</h2>
        <p>Las traducciones se almacenan en archivos dentro de <code>translations/[locale]/</code>. PrestaShop los genera automáticamente al usar el panel de traducciones del Back Office.</p>

        <h3>2.1. Estructura de Archivos de Traducción</h3>

        <pre><code class="language-plaintext">mimodulo/
├── translations/
│   ├── es.php              # Español (España)
│   ├── en.php              # Inglés
│   ├── fr.php              # Francés
│   ├── de.php              # Alemán
│   └── es-mx.php           # Español (México)
└── ...</code></pre>

        <h3>2.2. Contenido de un Archivo de Traducción</h3>
        <p>Estos archivos son generados automáticamente, pero puedes editarlos manualmente si es necesario.</p>

        <pre><code class="language-php">// translations/es.php
global $_MODULE;
$_MODULE = [];

// Formato: [hash md5] => traducción
$_MODULE['<{mimodulo}prestashop>mimodulo_abc123def456'] = 'Mi Módulo Increíble';
$_MODULE['<{mimodulo}prestashop>mimodulo_789xyz012abc'] = 'Este módulo hace cosas increíbles para tu tienda.';
$_MODULE['<{mimodulo}prestashop>mimodulo_def456ghi789'] = 'Configuración guardada correctamente';

// Para controladores
$_MODULE['<{mimodulo}prestashop>display_jkl012mno345'] = 'Cargando datos...';

// Para plantillas
$_MODULE['<{mimodulo}prestashop>widget_pqr678stu901'] = 'Bienvenido';
$_MODULE['<{mimodulo}prestashop>widget_vwx234yza567'] = 'Este es el contenido de mi widget';</code></pre>

        <h3>2.3. Generar Traducciones desde el Back Office</h3>
        <p><strong>Ruta:</strong> <em>Traducciones > Modificar traducciones > Tipo: Módulos instalados > Seleccionar módulo > Seleccionar idioma</em></p>
        <p>PrestaShop escaneará tu módulo, extraerá todas las llamadas a <code>l()</code> y generará el archivo de traducción automáticamente.</p>

        <h2 class="section-title">3. Sistema Moderno: Trans (Symfony)</h2>
        <p>PrestaShop 8+ permite usar el sistema de traducción de Symfony en controladores modernos y plantillas Twig. Este método usa archivos <code>.xlf</code> (XLIFF) y es más robusto.</p>

        <h3>3.1. Uso en Controladores Symfony</h3>

        <pre><code class="language-php">declare(strict_types=1);

namespace MiModulo\Controller\Admin;

use PrestaShopBundle\Controller\Admin\FrameworkBundleAdminController;
use Symfony\Component\HttpFoundation\Response;

class ConfiguracionController extends FrameworkBundleAdminController
{
    public function index(): Response
    {
        // trans($id, $parameters, $domain, $locale)
        $titulo = $this->trans(
            'Configuración del Módulo',
            [], // Parámetros (placeholders)
            'Modules.Mimodulo.Admin' // Dominio de traducción
        );

        // Con placeholders
        $mensaje = $this->trans(
            'Has guardado %count% configuraciones',
            ['%count%' => 5],
            'Modules.Mimodulo.Admin'
        );

        return $this->render('@Modules/mimodulo/views/templates/admin/configuracion.html.twig', [
            'titulo' => $titulo,
            'mensaje' => $mensaje,
        ]);
    }
}</code></pre>

        <h3>3.2. Uso en Plantillas Twig</h3>

        <pre><code class="language-twig">{# modules/mimodulo/views/templates/admin/configuracion.html.twig #}
{% extends '@PrestaShop/Admin/layout.html.twig' %}

{% block content %}
    <h1>{{ 'Configuración del Módulo'|trans({}, 'Modules.Mimodulo.Admin') }}</h1>
    
    <p>{{ 'Bienvenido a la configuración'|trans({}, 'Modules.Mimodulo.Admin') }}</p>
    
    {# Con variables #}
    <p>{{ 'Tienes %count% productos activos'|trans({'%count%': product_count}, 'Modules.Mimodulo.Admin') }}</p>
    
    {# Pluralización #}
    <p>{{ 'message.product.count'|transchoice(product_count, {}, 'Modules.Mimodulo.Admin') }}</p>
{% endblock %}</code></pre>

        <h3>3.3. Archivos XLIFF (.xlf)</h3>
        <p>Los archivos de traducción de Symfony se almacenan en <code>translations/</code> con formato XML.</p>

        <pre><code class="language-xml">&lt;!-- modules/mimodulo/translations/es.Modules.Mimodulo.Admin.xlf --&gt;
&lt;?xml version="1.0" encoding="UTF-8"?&gt;
&lt;xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2"&gt;
    &lt;file source-language="en" target-language="es" datatype="plaintext" original="file.ext"&gt;
        &lt;body&gt;
            &lt;trans-unit id="1"&gt;
                &lt;source&gt;Module Configuration&lt;/source&gt;
                &lt;target&gt;Configuración del Módulo&lt;/target&gt;
            &lt;/trans-unit&gt;
            &lt;trans-unit id="2"&gt;
                &lt;source&gt;Welcome to configuration&lt;/source&gt;
                &lt;target&gt;Bienvenido a la configuración&lt;/target&gt;
            &lt;/trans-unit&gt;
            &lt;trans-unit id="3"&gt;
                &lt;source&gt;You have %count% active products&lt;/source&gt;
                &lt;target&gt;Tienes %count% productos activos&lt;/target&gt;
            &lt;/trans-unit&gt;
            
            &lt;!-- Plurales --&gt;
            &lt;trans-unit id="4"&gt;
                &lt;source&gt;message.product.count&lt;/source&gt;
                &lt;target&gt;{0} No hay productos|{1} 1 producto|]1,Inf[ %count% productos&lt;/target&gt;
            &lt;/trans-unit&gt;
        &lt;/body&gt;
    &lt;/file&gt;
&lt;/xliff&gt;</code></pre>

        <h2 class="section-title">4. Dominios de Traducción</h2>
        <p>Los dominios organizan las traducciones por contexto. Sigue las convenciones de PrestaShop para mantener consistencia.</p>

        <h3>4.1. Convenciones de Nombres</h3>

        <pre><code class="language-plaintext">Modules.[NombreModulo].Admin      # Back Office del módulo
Modules.[NombreModulo].Shop       # Front Office del módulo
Modules.[NombreModulo].Emails     # Plantillas de email del módulo

Ejemplos:
- Modules.Mimodulo.Admin
- Modules.Bestsellers.Shop
- Modules.Newsletter.Emails</code></pre>

        <h2 class="section-title">5. Traducción de Emails</h2>
        <p>Los módulos pueden enviar emails personalizados. PrestaShop permite crear plantillas de email multiidioma.</p>

        <h3>5.1. Estructura de Plantillas de Email</h3>

        <pre><code class="language-plaintext">mimodulo/
├── mails/
│   ├── es/
│   │   ├── welcome.html         # Versión HTML
│   │   └── welcome.txt          # Versión texto plano
│   ├── en/
│   │   ├── welcome.html
│   │   └── welcome.txt
│   └── fr/
│       ├── welcome.html
│       └── welcome.txt</code></pre>

        <h3>5.2. Contenido de Plantilla de Email</h3>

        <pre><code class="language-html">&lt;!-- mails/es/welcome.html --&gt;
&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
    &lt;meta charset="UTF-8"&gt;
    &lt;title&gt;Bienvenido&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
    &lt;h1&gt;Hola {firstname} {lastname},&lt;/h1&gt;
    &lt;p&gt;Gracias por registrarte en nuestra tienda.&lt;/p&gt;
    &lt;p&gt;Tu código de descuento es: &lt;strong&gt;{discount_code}&lt;/strong&gt;&lt;/p&gt;
    &lt;p&gt;Atentamente,&lt;br&gt;El equipo de {shop_name}&lt;/p&gt;
&lt;/body&gt;
&lt;/html&gt;</code></pre>

        <pre><code class="language-plaintext">// mails/es/welcome.txt
Hola {firstname} {lastname},

Gracias por registrarte en nuestra tienda.
Tu código de descuento es: {discount_code}

Atentamente,
El equipo de {shop_name}</code></pre>

        <h3>5.3. Envío de Email Traducido</h3>

        <pre><code class="language-php">use Mail;

public function enviarEmailBienvenida(int $idCustomer): bool
{
    $customer = new Customer($idCustomer);
    $idLang = (int)$customer->id_lang;

    // Variables para la plantilla
    $templateVars = [
        '{firstname}' => $customer->firstname,
        '{lastname}' => $customer->lastname,
        '{discount_code}' => 'WELCOME10',
        '{shop_name}' => Configuration::get('PS_SHOP_NAME'),
    ];

    return Mail::send(
        $idLang,                              // ID del idioma
        'welcome',                            // Nombre de la plantilla (sin extensión)
        $this->l('Bienvenido a nuestra tienda'), // Asunto del email
        $templateVars,                        // Variables
        $customer->email,                     // Destinatario
        $customer->firstname . ' ' . $customer->lastname, // Nombre destinatario
        null,                                 // Email remitente (usa default si null)
        null,                                 // Nombre remitente
        null,                                 // Adjuntos
        null,                                 // Modo (0=ambos, 1=HTML, 2=TXT)
        dirname(__FILE__) . '/mails/'         // Directorio de plantillas
    );
}</code></pre>

        <h2 class="section-title">6. Buenas Prácticas de Traducción</h2>

        <h3>6.1. Evitar Traducciones Hardcoded</h3>
        <p><strong>❌ Incorrecto:</strong></p>
        <pre><code class="language-php">// Nunca hagas esto
if ($lang == 'es') {
    return 'Hola';
} elseif ($lang == 'en') {
    return 'Hello';
}</code></pre>

        <p><strong>✅ Correcto:</strong></p>
        <pre><code class="language-php">return $this->l('Hola'); // PrestaShop gestionará el idioma automáticamente</code></pre>

        <h3>6.2. Contexto en las Traducciones</h3>
        <p>Proporciona contexto para palabras ambiguas que pueden tener diferentes traducciones según el uso.</p>

        <pre><code class="language-php">// "Close" puede significar "Cerrar" o "Cerca" en español
$this->l('Close', 'button'); // Contexto: es un botón -> "Cerrar"
$this->l('Close' 'proximity'); // Contexto: proximidad -> "Cerca"</code></pre>

        <h3>6.3. Variables en las Traducciones</h3>
        <p>Usa marcadores de posición para variables, no concatenes strings traducidos.</p>

        <p><strong>❌ Incorrecto:</strong></p>
        <pre><code class="language-php">$mensaje = $this->l('Has comprado') . ' ' . $cantidad . ' ' . $this->l('productos');</code></pre>

        <p><strong>✅ Correcto:</strong></p>
        <pre><code class="language-php">$mensaje = sprintf(
    $this->l('Has comprado %d productos'),
    $cantidad
);</code></pre>

        <h3>6.4. Pluralización</h3>
        <p>Los plurales varían según el idioma. En español: 1 producto / 2 productos. En inglés: 1 product / 2 products. Pero en otros idiomas las reglas son diferentes.</p>

        <pre><code class="language-php">// Legacy: Manejo manual
if ($count == 1) {
    $mensaje = $this->l('1 producto en tu carrito');
} else {
    $mensaje = sprintf($this->l('%d productos en tu carrito'), $count);
}

// Symfony (recomendado para precisión lingüística)
$mensaje = $this->trans(
    'cart.product.count',
    ['%count%' => $count],
    'Modules.Mimodulo.Shop'
);

// En el archivo .xlf:
// &lt;target&gt;{0} Sin productos|{1} 1 producto|]1,Inf[ %count% productos&lt;/target&gt;</code></pre>

        <h2 class="section-title">7. Exportación e Importación de Traducciones</h2>

        <h3>7.1. Exportar Traducciones para Traductores</h3>
        <p>Puedes exportar las traducciones desde el Back Office para enviarlas a traductores profesionales.</p>
        <p><strong>Ruta:</strong> <em>Internacional > Traducciones > Exportar idioma</em></p>

        <h3>7.2. Importar Traducciones</h3>
        <p>Si recibes traducciones de terceros, colócalas en las carpetas correspondientes y limpia la caché.</p>

        <pre><code class="language-bash"># Limpiar cache de traducciones (CLI)
php bin/console cache:clear --env=prod

# O desde el BO: Parámetros Avanzados > Rendimiento > Limpiar caché</code></pre>

        <h2 class="section-title">8. Testing de Traducciones</h2>

        <h3>8.1. Cambio Manual de Idioma</h3>
        <pre><code class="language-php">// Forzar idioma temporalmente (útil para pruebas o emails)
$context = Context::getContext();
$idLangOriginal = $context->language->id;

// Cambiar a español
$context->language = new Language((int)Language::getIdByIso('es'));

$mensajeES = $this->l('Hola');

// Restaurar idioma original
$context->language = new Language($idLangOriginal);</code></pre>

        <h3>8.2. Detectar Cadenas Sin Traducir</h3>
        <p>Si una cadena aparece en inglés cuando debería estar en otro idioma, verifica:</p>
        <ul>
            <li>¿Usaste <code>$this->l()</code>?</li>
            <li>¿Especificaste el contexto correcto (nombre de archivo)?</li>
            <li>¿Generaste las traducciones desde el BO?</li>
            <li>¿Limpiaste la caché después de añadir traducciones?</li>
        </ul>

        <h2 class="section-title">9. Herramientas Útiles</h2>

        <h3>9.1. Prestashop Translation Tools (GitHub)</h3>
        <p>PrestaShop mantiene herramientas CLI para facilitar la gestión de traducciones.</p>

        <pre><code class="language-bash"># Clonar herramientas
git clone https://github.com/PrestaShop/TranslationToolsBundle.git

# Validar que todas las cadenas estén marcadas para traducción
php bin/console prestashop:translation:validate mimodulo

# Extraer cadenas a archivos .xlf
php bin/console translation:extract --format=xlf es Modules.Mimodulo.Admin</code></pre>

        <h2 class="section-title">10. Checklist de Internacionalización</h2>
        <ul>
            <li><strong>✓</strong> Todos los textos visibles usan <code>$this->l()</code> o <code>trans()</code></li>
            <li><strong>✓</strong> No hay traducciones hardcoded (if/else por idioma)</li>
            <li><strong>✓</strong> Las variables usan marcadores de posición (<code>%s</code>, <code>%d</code>, <code>%count%</code>)</li>
            <li><strong>✓</strong> Los plurales están correctamente gestionados</li>
            <li><strong>✓</strong> Las plantillas de email existen en todos los idiomas soportados</li>
            <li><strong>✓</strong> Los archivos de traducción se generan desde el BO antes de lanzar</li>
            <li><strong>✓</strong> Se limpia la caché tras actualizar traducciones</li>
            <li><strong>✓</strong> Se prueba el módulo en al menos 2 idiomas</li>
        </ul>
    </div>
`;

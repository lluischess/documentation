const overridesClasesControladores = `
<h1>Overrides en PrestaShop 8 y 9: Clases, Controladores y Modelos</h1>

<p>El sistema de "override" en PrestaShop es un mecanismo poderoso que permite modificar o extender el comportamiento del core sin alterar sus archivos originales. Esto es crucial para mantener la compatibilidad con futuras actualizaciones.</p>

<p>En PrestaShop 8 y 9, el enfoque ha evolucionado. Aunque el sistema de override tradicional sigue funcionando, se fomenta el uso de patrones más modernos y robustos basados en la arquitectura de Symfony, como la <strong>decoración de servicios</strong> y la <strong>extensión de clases de Doctrine</strong>.</p>

<div class="info-box">
    <strong>💡 Nota Clave:</strong> A partir de PrestaShop 8, la recomendación es <strong>evitar los overrides tradicionales</strong> siempre que sea posible y optar por decorar servicios o extender clases, ya que es una práctica más segura y alineada con Symfony.
</div>

<h2>1. El Sistema de Override Tradicional (Legado)</h2>
<p>Este es el método clásico, que sigue siendo funcional pero se considera menos mantenible a largo plazo. Funciona para clases del core (no basadas en Symfony), controladores y modelos.</p>

<h3>¿Cómo funciona?</h3>
<p>PrestaShop, al iniciarse, busca en la carpeta <code>/override</code> de la raíz del proyecto. Si encuentra un archivo que coincide con una clase del core, lo fusiona en tiempo de ejecución.</p>

<h4>A. Override de una Clase Core (Modelo de Datos - ObjectModel)</h4>
<p>Vamos a extender la clase <code>Product</code> para añadir un nuevo campo <code>isbn</code>.</p>

<p><strong>Paso 1: Crear el archivo de override</strong></p>
<p>Crea el archivo en la siguiente ruta:</p>
<code>/override/classes/Product.php</code>

<p><strong>Paso 2: Escribir el código del override</strong></p>
<div class="code-block"><pre><code>&lt;?php
// /override/classes/Product.php

class Product extends ProductCore
{
    /**
     * @var string|null
     */
    public $isbn;

    public function __construct($id = null, $full = false, $id_lang = null, $id_shop = null, \Context $context = null)
    {
        // Añadir el nuevo campo a la definición de la clase
        self::$definition['fields']['isbn'] = [
            'type' => self::TYPE_STRING,
            'validate' => 'isIsbn', // Regla de validación
            'size' => 32,
        ];

        parent::__construct($id, $full, $id_lang, $id_shop, $context);
    }

    /**
     * Ejemplo de cómo sobrescribir un método existente
     * para añadir lógica adicional.
     */
    public function getPrice($specific_price_output = null, $id_product_attribute = null, $decimals = 6, $divisor = null, $only_reduc = false, $user_reduction = true, $id_customer = null)
    {
        $price = parent::getPrice($specific_price_output, $id_product_attribute, $decimals, $divisor, $only_reduc, $user_reduction, $id_customer);

        // Añadir una lógica personalizada: si el producto tiene ISBN, suma 1€
        if (!empty($this->isbn)) {
            $price += 1;
        }

        return $price;
    }
}
</code></pre></div>

<h4>B. Override de un Controlador</h4>
<p>Supongamos que queremos modificar el controlador de la página de producto (<code>ProductController</code>).</p>

<p><strong>Paso 1: Crear el archivo de override</strong></p>
<p>Crea el archivo en:</p>
<code>/override/controllers/front/ProductController.php</code>

<p><strong>Paso 2: Escribir el código del override</strong></p>
<div class="code-block"><pre><code>&lt;?php
// /override/controllers/front/ProductController.php

class ProductController extends ProductControllerCore
{
    /**
     * Sobrescribir el método init() para redirigir si el producto
     * no está disponible.
     */
    public function init()
    {
        parent::init();

        // Si el producto está deshabilidado, redirigir a la home
        if (!$this->product->active) {
            Tools::redirect('index.php');
        }
    }

    /**
     * Sobrescribir initContent() para pasar una nueva variable a la plantilla.
     */
    public function initContent()
    {
        parent::initContent();

        $this->context->smarty->assign([
            'mi_variable_personalizada' => 'Hola desde el override!',
        ]);

        // También puedes cambiar la plantilla a renderizar
        // $this->setTemplate('mi-plantilla-producto');
    }
}
</code></pre></div>

<div class="warning-box">
    <strong>⚠️ ¡Importante! Después de crear o modificar un archivo de override, debes eliminar el archivo <code>/var/cache/prod/class_index.php</code> (o <code>/app/cache/prod/class_index.php</code> en versiones antiguas) para que PrestaShop regenere la caché de clases. En modo desarrollo, esto suele ser automático.</strong>
</div>

<h2>2. El Enfoque Moderno (PrestaShop 8+)</h2>
<p>Con la integración de Symfony, muchas partes del core de PrestaShop ahora son <strong>servicios</strong> gestionados por el contenedor de inyección de dependencias de Symfony. La forma correcta de modificar estos servicios es mediante la <strong>Decoración de Servicios</strong>.</p>

<h3>A. Decoración de un Servicio Core</h3>
<p>Imaginemos que queremos modificar el servicio <code>ProductPresenter</code>, que es responsable de preparar los datos del producto para la plantilla.</p>

<p><strong>Paso 1: Identificar el servicio</strong></p>
<p>Puedes listar todos los servicios de Symfony con el comando:</p>
<code>php bin/console debug:container</code>

<p>Supongamos que el servicio que queremos decorar se llama <code>prestashop.core.presenter.product.product_presenter</code>.</p>

<p><strong>Paso 2: Crear tu clase decoradora</strong></p>
<p>Dentro de tu módulo, crea una nueva clase que implemente la misma interfaz que el servicio original (o que extienda su clase).</p>

<div class="code-block"><pre><code>&lt;?php
// /modules/mi_modulo/src/Presenter/DecoratedProductPresenter.php

namespace MiModulo\Presenter;

use PrestaShop\PrestaShop\Core\Product\ProductPresenterInterface;
use PrestaShop\PrestaShop\Adapter\Presenter\Product\ProductLazyArray;

class DecoratedProductPresenter implements ProductPresenterInterface
{
    private $originalPresenter;

    public function __construct(ProductPresenterInterface $originalPresenter)
    {
        $this->originalPresenter = $originalPresenter;
    }

    /**
     * Este es el método que queremos modificar.
     */
    public function present(
        \PrestaShop\PrestaShop\Adapter\Presenter\Product\ProductPresenterSettings $settings,
        \Product $product,
        \Language $language
    ): ProductLazyArray {
        // 1. Llama al presentador original para obtener los datos base
        $presentedProduct = $this->originalPresenter->present($settings, $product, $language);

        // 2. Añade o modifica los datos
        $presentedProduct['mi_campo_personalizado'] = '¡Valor añadido por mi decorador!';
        
        // Si el producto tiene un ISBN (del override anterior), lo añadimos
        if (!empty($product->isbn)) {
            $presentedProduct['isbn'] = $product->isbn;
        }

        // 3. Devuelve el array modificado
        return $presentedProduct;
    }
}
</code></pre></div>

<p><strong>Paso 3: Registrar el decorador en tu módulo</strong></p>
<p>En el archivo de servicios de tu módulo (ej: <code>/modules/mi_modulo/config/services.yml</code>), registra tu decorador:</p>

<div class="code-block"><pre><code># /modules/mi_modulo/config/services.yml
services:
    # 1. Define tu servicio decorador
    MiModulo\Presenter\DecoratedProductPresenter:
        # 'decorates' indica qué servicio del core estás extendiendo
        decorates: 'prestashop.core.presenter.product.product_presenter'
        # 'decoration_priority' define el orden si hay múltiples decoradores
        decoration_priority: 10
        # Inyecta el servicio original (con el sufijo .inner)
        arguments:
            - '@MiModulo\Presenter\DecoratedProductPresenter.inner'
        public: false
</code></pre></div>

<div class="success-box">
    <strong>✅ Ventajas de la Decoración de Servicios:</strong>
    <ul>
        <li><strong>Mantenibilidad:</strong> No dependes de la estructura interna de la clase original, solo de su contrato (interfaz).</li>
        <li><strong>Composición:</strong> Puedes encadenar múltiples decoradores sin conflictos.</li>
        <li><strong>Seguridad:</strong> Es menos propenso a romperse con actualizaciones del core.</li>
        <li><strong>Claridad:</strong> La intención de modificar un servicio es explícita en tu <code>services.yml</code>.</li>
    </ul>
</div>

<h3>B. Extender Clases de Doctrine (Entidades)</h3>
<p>Si necesitas añadir una nueva propiedad a una entidad de Doctrine (como <code>Product</code> en la nueva arquitectura), el método correcto es usar la herencia de Doctrine y registrar tu extensión.</p>

<p><strong>Paso 1: Crear la clase de extensión</strong></p>
<p>Dentro de tu módulo, crea una clase que extienda la entidad original.</p>

<div class="code-block"><pre><code>&lt;?php
// /modules/mi_modulo/src/Entity/ProductExtension.php

namespace MiModulo\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table(name="ps_product")
 */
class ProductExtension extends \PrestaShop\PrestaShop\Core\Domain\Product\ValueObject\Product
{
    /**
     * @var string|null
     *
     * @ORM\Column(name="isbn", type="string", length=32, nullable=true)
     */
    private $isbn;

    public function getIsbn(): ?string
    {
        return $this->isbn;
    }

    public function setIsbn(?string $isbn): void
    {
        $this->isbn = $isbn;
    }
}
</code></pre></div>

<p><strong>Paso 2: Registrar la extensión</strong></p>
<p>Esto es más complejo y requiere escuchar eventos de Doctrine para modificar los metadatos de la entidad. Generalmente, se hace a través de un <strong>Compiler Pass</strong> en tu módulo.</p>

<div class="info-box">
    <strong>💡 Nota Avanzada:</strong> Extender entidades de Doctrine es un tema complejo. En la mayoría de los casos, es más sencillo añadir tu campo a la tabla a través de un override del <code>ObjectModel</code> (como en el primer ejemplo) y luego acceder a él en los servicios decorados. La extensión de entidades de Doctrine solo es necesaria si quieres que tu campo sea parte integral del ORM de Symfony en PrestaShop.
</div>

<h2>Resumen: ¿Cuándo usar cada método?</h2>

<table class="comparison-table">
    <thead>
        <tr>
            <th>Método</th>
            <th>Cuándo usarlo</th>
            <th>Ventajas</th>
            <th>Desventajas</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><strong>Override Tradicional</strong></td>
            <td>
                <ul>
                    <li>Clases que no son servicios de Symfony (ej: <code>ObjectModel</code>, <code>ControllerCore</code>).</li>
                    <li>Modificaciones rápidas y sencillas.</li>
                    <li>Cuando no hay una alternativa de servicio.</li>
                </ul>
            </td>
            <td>Fácil y rápido de implementar.</td>
            <td>Frágil, propenso a romperse con actualizaciones, puede generar conflictos.</td>
        </tr>
        <tr>
            <td><strong>Decoración de Servicios</strong></td>
            <td>
                <ul>
                    <li><strong>(Recomendado)</strong> Para cualquier clase del core que esté registrada como un servicio de Symfony.</li>
                    <li>Para extender la lógica de negocio de forma limpia.</li>
                </ul>
            </td>
            <td>Robusto, mantenible, sigue las mejores prácticas de Symfony.</td>
            <td>Requiere más configuración inicial (definir el servicio en YML).</td>
        </tr>
        <tr>
            <td><strong>Extensión de Entidades</strong></td>
            <td>
                <ul>
                    <li>Para añadir campos a entidades de Doctrine gestionadas por Symfony.</li>
                    <li>Casos de uso muy avanzados.</li>
                </ul>
            </td>
            <td>Integración completa con el ORM de Symfony.</td>
            <td>Muy complejo de implementar y mantener.</td>
        </tr>
    </tbody>
</table>

<div class="success-box">
    <strong>✅ Regla General para PrestaShop 8 y 9:</strong>
    <ol>
        <li><strong>Primero, busca un Hook:</strong> Antes de sobrescribir, comprueba si un hook puede hacer lo que necesitas.</li>
        <li><strong>Si no hay hook, decora un Servicio:</strong> Si la lógica está en un servicio de Symfony, decóralo.</li>
        <li><strong>Como último recurso, usa un Override:</strong> Si la clase es antigua y no es un servicio, usa el override tradicional.</li>
    </ol>
</div>
`;

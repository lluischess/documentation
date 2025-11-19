const hooksYEventos = `
<h1>Hooks y Eventos en PrestaShop: La Guía Definitiva (PS 8 y 9)</h1>

<p>Los <strong>hooks</strong> y <strong>eventos</strong> son los dos mecanismos principales que PrestaShop ofrece para permitir a los módulos interactuar y modificar el comportamiento del core de forma limpia y modular. Aunque a menudo se usan indistintamente, representan dos sistemas diferentes: el sistema de hooks legado de PrestaShop y el sistema de eventos moderno basado en el EventDispatcher de Symfony.</p>

<div class="info-box">
    <strong>💡 Diferencia Clave:</strong><br>
    • <strong>Hooks (Legado):</strong> Son "puntos de anclaje" predefinidos en el código. Se usan principalmente para mostrar contenido en el front-office (hooks de display) o para reaccionar a acciones específicas (hooks de acción).<br>
    • <strong>Eventos (Moderno):</strong> Utilizan el componente EventDispatcher de Symfony. Son más flexibles, desacoplados y potentes. Permiten una comunicación más avanzada entre diferentes partes de la aplicación.
</div>

<h2>1. Hooks de PrestaShop (Sistema Legado)</h2>
<p>Los hooks son la forma tradicional de extender PrestaShop. Un módulo se "engancha" (hooks into) a uno o más de estos puntos para ejecutar su propio código.</p>

<h3>Tipos de Hooks</h3>
<ul>
    <li><strong>Hooks de Display (Display Hooks):</strong> Permiten a los módulos mostrar contenido en una parte específica de una página (ej: <code>displayHome</code>, <code>displayLeftColumn</code>, <code>displayProductAdditionalInfo</code>). Devuelven contenido HTML.</li>
    <li><strong>Hooks de Acción (Action Hooks):</strong> Se ejecutan cuando ocurre una acción específica en el sistema (ej: <code>actionProductSave</code>, <code>actionCartSave</code>, <code>actionValidateOrder</code>). No devuelven nada (void) y se usan para realizar tareas en segundo plano, como sincronizar datos o enviar notificaciones.</li>
</ul>

<h3>¿Cómo usar un Hook en un Módulo?</h3>
<p>El proceso consta de dos pasos: registrar el hook durante la instalación del módulo y crear el método correspondiente en la clase principal del módulo.</p>

<p><strong>Paso 1: Registrar el Hook</strong></p>
<p>En el método <code>install()</code> de tu módulo, usa el método <code>registerHook()</code>.</p>
<div class="code-block"><pre><code>&lt;?php
// /modules/mi_modulo/mi_modulo.php

class MiModulo extends Module
{
    public function install()
    {
        return parent::install() &&
            $this->registerHook('displayProductAdditionalInfo') && // Hook de display
            $this->registerHook('actionProductUpdate');           // Hook de acción
    }
}
</code></pre></div>
<p>Es una buena práctica registrar también la desinstalación del hook en el método <code>uninstall()</code>.</p>

<p><strong>Paso 2: Implementar el Método del Hook</strong></p>
<p>Crea un método público en la clase de tu módulo con el prefijo <code>hook</code> seguido del nombre del hook en CamelCase.</p>
<div class="code-block"><pre><code>&lt;?php
// /modules/mi_modulo/mi_modulo.php

class MiModulo extends Module
{
    // ... install() y otros métodos

    /**
     * Hook de display para mostrar información extra en la página de producto.
     *
     * @param array $params Parámetros pasados por el hook (ej: el producto)
     * @return string HTML a mostrar
     */
    public function hookDisplayProductAdditionalInfo(array $params): string
    {
        $product = $params['product'];

        $this->context->smarty->assign([
            'mi_info_producto' => 'Este producto es especial.',
            'id_producto' => $product->id,
        ]);

        return $this->display(__FILE__, 'views/templates/hook/product_info.tpl');
    }

    /**
     * Hook de acción que se ejecuta cuando un producto es actualizado.
     *
     * @param array $params Parámetros (ej: el objeto Product)
     */
    public function hookActionProductUpdate(array $params): void
    {
        $product = $params['product'];

        // Lógica a ejecutar: por ejemplo, enviar una notificación a un sistema externo.
        $this->logProductUpdate($product->id);
    }

    private function logProductUpdate(int $productId): void
    {
        // Lógica para guardar en un log
        file_put_contents(
            $this->getLocalPath() . 'update_log.txt',
            "Producto ID: {$productId} actualizado el " . date('Y-m-d H:i:s') . "\n",
            FILE_APPEND
        );
    }
}
</code></pre></div>

<div class="warning-box">
    <strong>⚠️ Parámetros de los Hooks:</strong> Los parámetros que recibe cada hook varían. La mejor forma de saber qué parámetros están disponibles es buscar la llamada <code>Hook::exec('nombreDelHook', [...])</code> en el código fuente de PrestaShop.
</div>

<h3>Crear un Hook Personalizado</h3>
<p>Puedes crear tus propios hooks en tus módulos o temas para permitir que otros módulos se enganchen a tu código.</p>
<div class="code-block"><pre><code>&lt;?php
// En cualquier parte de tu módulo (ej: un controlador)

// Ejecutar un hook personalizado y pasarle parámetros
Hook::exec('actionMiModuloCustomAction', [
    'mi_parametro' => 'valor_importante',
    'id_objeto' => 42,
]);
</code></pre></div>
<p>Otros módulos ahora pueden registrarse a <code>actionMiModuloCustomAction</code> y ejecutar su código cuando tú lo llamas.</p>

<h2>2. Eventos de Symfony (El Enfoque Moderno)</h2>
<p>Desde la introducción de la arquitectura de Symfony en PrestaShop 1.7, y especialmente en las versiones 8 y 9, muchas de las funcionalidades del core ahora disparan <strong>eventos de Symfony</strong>. Este sistema es más flexible y potente que los hooks.</p>

<h3>¿Cómo funcionan los Eventos?</h3>
<ol>
    <li><strong>El Evento (Event):</strong> Es una clase PHP que contiene los datos relacionados con lo que ha sucedido. Por ejemplo, <code>PrestaShop\PrestaShop\Core\Domain\Product\Event\ProductUpdatedEvent</code>.</li>
    <li><strong>El Despachador (EventDispatcher):</strong> Es un servicio central de Symfony que se encarga de "despachar" los eventos.</li>
    <li><strong>El Oyente (Listener) o Suscriptor (Subscriber):</strong> Es una clase en tu módulo que "escucha" uno o más eventos y ejecuta una acción cuando se despachan.</li>
</ol>

<h3>¿Cómo usar un Evento en un Módulo?</h3>
<p>El método recomendado es crear un <strong>Suscriptor de Eventos (Event Subscriber)</strong>, que es una clase que le dice al despachador a qué eventos quiere suscribirse.</p>

<p><strong>Paso 1: Crear la clase del Suscriptor</strong></p>
<p>Dentro de tu módulo, crea una clase que implemente <code>Symfony\Component\EventDispatcher\EventSubscriberInterface</code>.</p>
<div class="code-block"><pre><code>&lt;?php
// /modules/mi_modulo/src/Subscriber/ProductEventSubscriber.php

namespace MiModulo\Subscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use PrestaShop\PrestaShop\Core\Domain\Product\Event\ProductUpdatedEvent;
use Psr\Log\LoggerInterface;

class ProductEventSubscriber implements EventSubscriberInterface
{
    private $logger;

    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
    }

    /**
     * Le dice al despachador a qué eventos suscribirse y qué método llamar.
     */
    public static function getSubscribedEvents(): array
    {
        return [
            // El nombre del evento es la clave, el método a llamar es el valor
            ProductUpdatedEvent::class => 'onProductUpdate',
        ];
    }

    /**
     * Este método se ejecutará cuando se despache el evento ProductUpdatedEvent.
     *
     * @param ProductUpdatedEvent $event El objeto del evento con los datos
     */
    public function onProductUpdate(ProductUpdatedEvent $event): void
    {
        $productId = $event->getId()->getValue();
        $productName = $event->getProductName()->getValue();

        $this->logger->info(
            "El producto '{$productName}' (ID: {$productId}) ha sido actualizado. ¡Evento de Symfony capturado!"
        );

        // Aquí puedes añadir cualquier lógica compleja, como llamar a una API externa.
    }
}
</code></pre></div>

<p><strong>Paso 2: Registrar el Suscriptor como un servicio</strong></p>
<p>En el archivo de servicios de tu módulo (<code>/modules/mi_modulo/config/services.yml</code>), registra tu suscriptor y etiquétalo como <code>kernel.event_subscriber</code>.</p>
<div class="code-block"><pre><code># /modules/mi_modulo/config/services.yml
services:
    MiModulo\Subscriber\ProductEventSubscriber:
        # Inyectamos el servicio de logger de PrestaShop
        arguments:
            - '@prestashop.core.logger.file'
        # La etiqueta 'kernel.event_subscriber' hace que Symfony lo reconozca automáticamente
        tags:
            - { name: 'kernel.event_subscriber' }
</code></pre></div>

<p>¡Y eso es todo! Ahora, cada vez que un producto se actualice a través de la nueva arquitectura, tu método <code>onProductUpdate</code> se ejecutará.</p>

<div class="success-box">
    <strong>✅ Ventajas de los Eventos de Symfony:</strong>
    <ul>
        <li><strong>Fuertemente Tipado:</strong> Los eventos son objetos, lo que permite el autocompletado del IDE y un código más seguro.</li>
        <li><strong>Desacoplamiento:</strong> El código que despacha el evento no necesita saber quién lo está escuchando.</li>
        <li><strong>Flexibilidad:</strong> Puedes tener múltiples suscriptores para un mismo evento y controlar su prioridad.</li>
        <li><strong>Inyección de Dependencias:</strong> Tus suscriptores son servicios, por lo que puedes inyectar otras dependencias (como el logger, el entity manager, etc.).</li>
    </ul>
</div>

<h2>Hooks vs. Eventos: ¿Cuál usar?</h2>
<p>La elección depende de qué parte de PrestaShop estés intentando extender.</p>

<table class="comparison-table">
    <thead>
        <tr>
            <th>Criterio</th>
            <th>Hooks</th>
            <th>Eventos de Symfony</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><strong>Arquitectura</strong></td>
            <td>Legado (Core de PrestaShop)</td>
            <td>Moderno (Integración con Symfony)</td>
        </tr>
        <tr>
            <td><strong>Casos de Uso</strong></td>
            <td>
                <ul>
                    <li>Mostrar contenido en plantillas TPL (display hooks).</li>
                    <li>Reaccionar a acciones en controladores legados (action hooks).</li>
                    <li>Compatibilidad con versiones antiguas de PrestaShop.</li>
                </ul>
            </td>
            <td>
                <ul>
                    <li>Reaccionar a operaciones CRUD en la nueva arquitectura (CQRS).</li>
                    <li>Modificar datos o lógica de negocio en servicios de Symfony.</li>
                    <li>Interacciones complejas y desacopladas.</li>
                </ul>
            </td>
        </tr>
        <tr>
            <td><strong>Ejemplos</strong></td>
            <td><code>displayHome</code>, <code>actionValidateOrder</code>, <code>actionProductDelete</code></td>
            <td><code>ProductCreatedEvent</code>, <code>OrderStateUpdatedEvent</code>, <code>CustomerGroupUpdatedEvent</code></td>
        </tr>
    </tbody>
</table>

<div class="success-box">
    <strong>✅ Regla General para PrestaShop 8 y 9:</strong>
    <ol>
        <li><strong>Prefiere Eventos:</strong> Si la funcionalidad que quieres extender despacha un evento de Symfony, úsalo siempre. Es el método más robusto y preparado para el futuro.</li>
        <li><strong>Usa Hooks para el Legado:</strong> Si necesitas interactuar con una parte del sistema que aún no ha sido migrada a Symfony (como muchos controladores del front-office o procesos de pago), los hooks siguen siendo la única opción.</li>
        <li><strong>Hooks de Display:</strong> Para añadir contenido al front-office, los hooks de display siguen siendo el estándar.</li>
    </ol>
</div>

<p>Dominar tanto los hooks como los eventos es esencial para ser un desarrollador de PrestaShop eficaz, ya que te permitirá extender cualquier parte de la plataforma, ya sea antigua o moderna.</p>
`;

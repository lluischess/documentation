const creacionControladoresFrontBack = `
    <div class="content-section">
        <h1 id="creacion-controladores-front-back">Creación de Controladores Front Office y Back Office</h1>
        <p>En el desarrollo moderno de módulos para PrestaShop 8.2+, la arquitectura de controladores ha evolucionado significativamente. Aprovechando las capacidades de <strong>PHP 8.1</strong> y la integración profunda con <strong>Symfony</strong>, podemos crear controladores más robustos, seguros y mantenibles. Esta guía cubre desde lo básico hasta implementaciones avanzadas como el uso de Grids, Formularios de Symfony, CQRS y testing.</p>

        <h2 class="section-title">1. Controladores de Front Office</h2>
        <p>Los controladores del Front Office gestionan las páginas públicas de tu tienda. Aunque siguen heredando de <code>ModuleFrontController</code>, podemos aplicar prácticas modernas de PHP 8.1 para mejorar su calidad.</p>

        <h3>1.1. Estructura Moderna con PHP 8.1</h3>
        <p>Usa tipos estrictos, propiedades tipadas y constantes de clase para una mejor legibilidad y seguridad.</p>

        <pre><code class="language-php">declare(strict_types=1);

class MiModuloDisplayModuleFrontController extends ModuleFrontController
{
    // Propiedades tipadas de PHP 7.4+ / 8.0+
    private string $templateFile = 'module:mimodulo/views/templates/front/display.tpl';
    
    public function initContent(): void
    {
        parent::initContent();

        // Lógica de negocio encapsulada
        $productData = $this->getProductData();

        $this->context->smarty->assign([
            'message' => 'Hola desde PHP 8.1',
            'products' => $productData,
            'is_v8' => true,
        ]);

        $this->setTemplate($this->templateFile);
    }

    /**
     * Ejemplo de uso de Return Types y funcionalidades modernas
     */
    private function getProductData(): array
    {
        // Simulación de obtención de datos
        return [
            ['id' => 1, 'name' => 'Producto A', 'price' => 19.99],
            ['id' => 2, 'name' => 'Producto B', 'price' => 29.99],
        ];
    }
}</code></pre>

        <h3>1.2. Manejo de Formularios en Front Office</h3>
        <p>Para procesar formularios de manera segura, debes validar el token CSRF y sanitizar los datos de entrada.</p>

        <pre><code class="language-php">public function postProcess(): void
{
    if (Tools::isSubmit('submitContactForm')) {
        // Validar token CSRF
        if (!$this->context->customer->isLogged() && !Tools::getValue('token')) {
            $this->errors[] = 'Token de seguridad inválido';
            return;
        }

        $name = Tools::getValue('name');
        $email = Tools::getValue('email');
        $message = Tools::getValue('message');

        // Validación usando match expression (PHP 8)
        $validationResult = match(true) {
            empty($name) => 'El nombre es obligatorio',
            empty($email) || !Validate::isEmail($email) => 'Email inválido',
            empty($message) => 'El mensaje es obligatorio',
            default => null
        };

        if ($validationResult) {
            $this->errors[] = $validationResult;
            return;
        }

        // Procesar el formulario
        // ...
        $this->success[] = 'Formulario enviado correctamente';
    }
}</code></pre>

        <h3>1.3. Manejo de Peticiones AJAX en Front Office</h3>
        <p>Para manejar peticiones AJAX de manera segura y eficiente, debemos verificar si la petición es realmente AJAX y devolver respuestas JSON tipadas.</p>

        <pre><code class="language-php">public function displayAjax(): void
{
    // Validación de seguridad básica
    if (!$this->isXmlHttpRequest()) {
        $this->ajaxRender(json_encode(['error' => 'Invalid request']));
        return;
    }

    $action = Tools::getValue('action');

    try {
        // Uso de match para routing interno (PHP 8)
        $data = match($action) {
            'getProducts' => $this->getProductsAjax(),
            'addToCart' => $this->addToCartAjax(),
            default => throw new \Exception('Acción no válida')
        };
        
        $response = ['status' => 'success', 'data' => $data];
    } catch (\Exception $e) {
        $response = ['status' => 'error', 'message' => $e->getMessage()];
    }

    // Respuesta JSON
    header('Content-Type: application/json');
    $this->ajaxRender(json_encode($response));
}

private function getProductsAjax(): array
{
    $categoryId = (int)Tools::getValue('category_id');
    // Lógica para obtener productos
    return ['products' => []];
}</code></pre>

        <h3>1.4. Ventajas de la Arquitectura Actual</h3>
        <ul>
            <li><strong>Tipado Estricto:</strong> Reduce errores en tiempo de ejecución al asegurar que los datos son del tipo esperado.</li>
            <li><strong>Claridad:</strong> El código es auto-documentado gracias a las declaraciones de tipos.</li>
            <li><strong>Seguridad:</strong> Al validar tipos, reducimos vulnerabilidades de inyección de datos inesperados.</li>
            <li><strong>Mantenibilidad:</strong> El código es más fácil de refactorizar y mantener a largo plazo.</li>
        </ul>

        <h2 class="section-title">2. Controladores de Back Office (La Revolución Symfony)</h2>
        <p>Aquí es donde el cambio es más drástico y beneficioso. En PrestaShop 8+, la forma recomendada de crear controladores de administración es utilizando <strong>Controladores de Symfony</strong> estándar, abandonando gradualmente los antiguos <code>ModuleAdminController</code> (Legacy).</p>

        <h3>2.1. ¿Por qué usar Controladores Symfony?</h3>
        <ul>
            <li><strong>Inyección de Dependencias:</strong> Acceso limpio a servicios del contenedor.</li>
            <li><strong>Routing Flexible:</strong> Definición de rutas mediante YAML o Atributos (PHP 8).</li>
            <li><strong>Twig:</strong> Uso del motor de plantillas moderno en lugar de Smarty para el BO.</li>
            <li><strong>Testing:</strong> Mucho más fáciles de testear unitariamente.</li>
            <li><strong>Formularios Tipados:</strong> Symfony Form Component proporciona validación robusta.</li>
            <li><strong>CQRS:</strong> Separación clara entre comandos (escritura) y consultas (lectura).</li>
        </ul>

        <h3>2.2. Controlador Básico con Symfony y PHP 8.1</h3>
        <p>Este controlador se ubica en <code>src/Controller/Admin/</code> dentro de tu módulo.</p>

        <pre><code class="language-php">declare(strict_types=1);

namespace MiModulo\Controller\Admin;

use PrestaShopBundle\Controller\Admin\FrameworkBundleAdminController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use MiModulo\Form\ConfigurationType;

class ConfigurationController extends FrameworkBundleAdminController
{
    // Constructor Promotion (PHP 8.0) para inyección de dependencias
    public function __construct(
        private readonly \MiModulo\Service\ConfigurationService $configurationService
    ) {}

    public function index(Request $request): Response
    {
        // Uso del servicio inyectado
        $currentValue = $this->configurationService->getValue();
        
        // Creación de formulario Symfony
        $form = $this->createForm(ConfigurationType::class, ['value' => $currentValue]);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $data = $form->getData();
            $this->configurationService->save($data['value']);
            $this->addFlash('success', 'Configuración guardada correctamente.');
            return $this->redirectToRoute('admin_mimodulo_configuration');
        }

        // Renderizado usando Twig (recomendado en BO)
        return $this->render('@Modules/mimodulo/views/templates/admin/configuration.html.twig', [
            'form' => $form->createView(),
            'enable_feature' => true,
        ]);
    }
}</code></pre>

        <h3>2.3. Uso de Atributos PHP 8 para Routing</h3>
        <p>En lugar de definir rutas en YAML, podemos usar atributos directamente en el controlador (PHP 8+).</p>

        <pre><code class="language-php">use Symfony\Component\Routing\Annotation\Route;
use PrestaShopBundle\Security\Annotation\AdminSecurity;

#[Route('/mimodulo/configuration', name: 'admin_mimodulo_configuration')]
#[AdminSecurity("is_granted('read', 'AdminModules')")]
class ConfigurationController extends FrameworkBundleAdminController
{
    #[Route('/list', name: 'admin_mimodulo_list', methods: ['GET'])]
    public function list(): Response
    {
        // Lógica del listado
    }

    #[Route('/create', name: 'admin_mimodulo_create', methods: ['GET', 'POST'])]
    public function create(Request $request): Response
    {
        // Lógica de creación
    }
}</code></pre>

        <h3>2.4. Configuración de Rutas (routes.yaml)</h3>
        <p>Para que PrestaShop reconozca este controlador, definimos las rutas en <code>config/routes.yaml</code> del módulo.</p>

        <pre><code class="language-yaml">admin_mimodulo_configuration:
  path: /mimodulo/configuration
  methods: [GET, POST]
  defaults:
    _controller: 'MiModulo\Controller\Admin\ConfigurationController::index'
    _legacy_controller: 'AdminMiModuloConfiguration' # Para compatibilidad con menú</code></pre>

        <h2 class="section-title">3. Implementación de Grids en Back Office</h2>
        <p>Una de las características más potentes de los controladores modernos es la integración con el sistema de Grids de PrestaShop. Esto permite listar, filtrar y ordenar datos de manera estandarizada.</p>

        <h3>3.1. Definición del Grid (GridDefinitionFactory)</h3>
        <p>Debes crear una clase que implemente <code>GridDefinitionFactoryInterface</code> para definir las columnas, filtros y acciones.</p>

        <pre><code class="language-php">namespace MiModulo\Grid;

use PrestaShop\PrestaShop\Core\Grid\Definition\Factory\AbstractGridDefinitionFactory;
use PrestaShop\PrestaShop\Core\Grid\Column\Type\DataColumn;
use PrestaShop\PrestaShop\Core\Grid\Column\ColumnCollection;
use PrestaShop\PrestaShop\Core\Grid\Action\Row\RowActionCollection;
use PrestaShop\PrestaShop\Core\Grid\Action\Row\Type\LinkRowAction;

final class MyGridDefinitionFactory extends AbstractGridDefinitionFactory
{
    protected function getId(): string
    {
        return 'my_module_grid';
    }

    protected function getName(): string
    {
        return $this->trans('Lista de Elementos', [], 'Modules.Mimodulo.Admin');
    }

    protected function getColumns(): ColumnCollection
    {
        return (new ColumnCollection())
            ->add((new DataColumn('id_element'))
                ->setName($this->trans('ID', [], 'Admin.Global'))
                ->setOptions(['field' => 'id_element'])
            )
            ->add((new DataColumn('name'))
                ->setName($this->trans('Nombre', [], 'Admin.Global'))
                ->setOptions(['field' => 'name'])
            )
            ->add((new DataColumn('active'))
                ->setName($this->trans('Estado', [], 'Admin.Global'))
                ->setOptions(['field' => 'active'])
            );
    }

    protected function getRowActions(): RowActionCollection
    {
        return (new RowActionCollection())
            ->add((new LinkRowAction('edit'))
                ->setName($this->trans('Editar', [], 'Admin.Actions'))
                ->setIcon('edit')
                ->setOptions(['route' => 'admin_mimodulo_edit'])
            )
            ->add((new LinkRowAction('delete'))
                ->setName($this->trans('Eliminar', [], 'Admin.Actions'))
                ->setIcon('delete')
                ->setOptions(['route' => 'admin_mimodulo_delete'])
            );
    }
}</code></pre>

        <h3>3.2. Renderizado del Grid en el Controlador</h3>
        <p>En tu controlador Symfony, utilizas el <code>GridFactory</code> para obtener y presentar el grid.</p>

        <pre><code class="language-php">use PrestaShop\PrestaShop\Core\Grid\GridFactoryInterface;

class ListController extends FrameworkBundleAdminController
{
    public function __construct(
        private readonly GridFactoryInterface $gridFactory
    ) {}

    public function index(Request $request): Response
    {
        $grid = $this->gridFactory->getGrid(
            $this->getGridSearchFilters($request, 'my_module_grid')
        );

        return $this->render('@Modules/mimodulo/views/templates/admin/list.html.twig', [
            'grid' => $this->presentGrid($grid),
            'layoutTitle' => $this->trans('Lista de Elementos', 'Modules.Mimodulo.Admin'),
        ]);
    }
}</code></pre>

        <h3>3.3. Plantilla Twig para el Grid</h3>
        <p>La plantilla Twig es muy simple gracias al sistema de Grid integrado.</p>

        <pre><code class="language-twig">{% extends '@PrestaShop/Admin/layout.html.twig' %}

{% block content %}
  <div class="row">
    <div class="col">
      {{ grid.render|raw }}
    </div>
  </div>
{% endblock %}</code></pre>

        <h2 class="section-title">4. Implementación de Formularios Symfony</h2>
        <p>Los formularios de Symfony proporcionan validación automática, renderizado consistente y protección CSRF.</p>

        <h3>4.1. Creación de un Formulario (FormType)</h3>

        <pre><code class="language-php">namespace MiModulo\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Validator\Constraints as Assert;

class ConfigurationType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('api_key', TextType::class, [
                'label' => 'API Key',
                'required' => true,
                'constraints' => [
                    new Assert\NotBlank(),
                    new Assert\Length(['min' => 10, 'max' => 100])
                ]
            ])
            ->add('mode', ChoiceType::class, [
                'label' => 'Modo',
                'choices' => [
                    'Producción' => 'production',
                    'Desarrollo' => 'development',
                ],
                'required' => true,
            ]);
    }
}</code></pre>

        <h2 class="section-title">5. CQRS: Command Bus y Query Bus</h2>
        <p>PrestaShop 8+ integra el patrón CQRS (Command Query Responsibility Segregation), separando operaciones de lectura y escritura.</p>

        <h3>5.1. Definición de un Command</h3>

        <pre><code class="language-php">namespace MiModulo\Command;

class CreateElementCommand
{
    public function __construct(
        private readonly string $name,
        private readonly bool $active
    ) {}

    public function getName(): string
    {
        return $this->name;
    }

    public function isActive(): bool
    {
        return $this->active;
    }
}</code></pre>

        <h3>5.2. Creación del Command Handler</h3>

        <pre><code class="language-php">namespace MiModulo\CommandHandler;

use MiModulo\Command\CreateElementCommand;

class CreateElementCommandHandler
{
    public function handle(CreateElementCommand $command): int
    {
        // Lógica para crear el elemento
        $element = new MyElement();
        $element->name = $command->getName();
        $element->active = $command->isActive();
        $element->save();

        return (int) $element->id;
    }
}</code></pre>

        <h3>5.3. Uso del Command Bus en el Controlador</h3>

        <pre><code class="language-php">use PrestaShop\PrestaShop\Core\CommandBus\CommandBusInterface;

class CreateController extends FrameworkBundleAdminController
{
    public function __construct(
        private readonly CommandBusInterface $commandBus
    ) {}

    public function create(Request $request): Response
    {
        // ... validación de formulario ...

        $command = new CreateElementCommand(
            name: $request->request->get('name'),
            active: (bool) $request->request->get('active')
        );

        try {
            $elementId = $this->commandBus->handle($command);
            $this->addFlash('success', 'Elemento creado correctamente');
        } catch (\Exception $e) {
            $this->addFlash('error', $e->getMessage());
        }

        return $this->redirectToRoute('admin_mimodulo_list');
    }
}</code></pre>

        <h2 class="section-title">6. Comparativa: Legacy vs Moderno</h2>
        <div class="table-responsive">
            <table class="table">
                <thead>
                    <tr>
                        <th>Característica</th>
                        <th>Legacy (AdminController)</th>
                        <th>Moderno (Symfony Controller)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Motor de Plantillas</strong></td>
                        <td>Smarty (.tpl)</td>
                        <td>Twig (.html.twig)</td>
                    </tr>
                    <tr>
                        <td><strong>Acceso a Datos</strong></td>
                        <td>ObjectModel / Db::getInstance()</td>
                        <td>Doctrine Entities / Repositories</td>
                    </tr>
                    <tr>
                        <td><strong>Gestión de Dependencias</strong></td>
                        <td><code>new Class()</code> / <code>Context::getContext()</code></td>
                        <td>Inyección de Dependencias (Constructor)</td>
                    </tr>
                    <tr>
                        <td><strong>Routing</strong></td>
                        <td>Parámetros URL (?controller=Admin...)</td>
                        <td>Symfony Routing (Clean URLs)</td>
                    </tr>
                    <tr>
                        <td><strong>Listados</strong></td>
                        <td>HelperList</td>
                        <td>PrestaShop Grid Component</td>
                    </tr>
                    <tr>
                        <td><strong>Formularios</strong></td>
                        <td>HelperForm</td>
                        <td>Symfony Form Component</td>
                    </tr>
                    <tr>
                        <td><strong>Lógica de Negocio</strong></td>
                        <td>Mezclada en el controlador</td>
                        <td>CQRS (Commands/Queries)</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <h2 class="section-title">7. Buenas Prácticas en PHP 8.1 para Controladores</h2>
        <ul>
            <li><strong>Enums:</strong> Usa <code>Enums</code> para estados o tipos fijos en lugar de constantes o strings mágicos.</li>
            <li><strong>Readonly Properties:</strong> Usa <code>readonly</code> para DTOs (Data Transfer Objects) que pasas a la vista.</li>
            <li><strong>Match Expression:</strong> Sustituye <code>switch</code> complejos por <code>match</code> para lógica de presentación más limpia.</li>
            <li><strong>Named Arguments:</strong> Usa argumentos nombrados al llamar funciones con muchos parámetros.</li>
            <li><strong>Nullsafe Operator:</strong> Evita verificaciones anidadas de null usando <code>?-></code>.</li>
        </ul>

        <pre><code class="language-php">// Ejemplo de Enum en un Controlador
enum ProductStatus: string {
    case Active = 'active';
    case Disabled = 'disabled';
    case Archived = 'archived';

    public function getLabel(): string
    {
        return match($this) {
            self::Active => 'Activo',
            self::Disabled => 'Desactivado',
            self::Archived => 'Archivado',
        };
    }
}

// Uso en lógica
$status = ProductStatus::from($request->get('status'));
$message = $status->getLabel();

// DTO Readonly
readonly class ProductDTO {
    public function __construct(
        public int $id,
        public string $name,
        public float $price,
        public ProductStatus $status
    ) {}
}

// Nullsafe operator
$customerEmail = $order?->customer?->email ?? 'N/A';</code></pre>

        <h2 class="section-title">8. Seguridad en Controladores</h2>
        <p>La seguridad es primordial. Al usar controladores modernos, obtenemos varias capas de seguridad por defecto, pero debemos ser conscientes de:</p>
        
        <h3>8.1. Protección CSRF</h3>
        <ul>
            <li><strong>Formularios Symfony:</strong> Los formularios incluyen tokens CSRF automáticamente.</li>
            <li><strong>Front Office:</strong> Valida tokens en peticiones POST sensibles usando el método <code>$this->isTokenValid()</code>.</li>
        </ul>

        <h3>8.2. Validación de Datos</h3>
        <p>Nunca confíes en el input del usuario. Usa las Constraints de Symfony en tus formularios o DTOs.</p>

        <pre><code class="language-php">use Symfony\Component\Validator\Constraints as Assert;

class ProductData
{
    #[Assert\NotBlank]
    #[Assert\Length(min: 3, max: 255)]
    public string $name;

    #[Assert\Positive]
    public float $price;

    #[Assert\Email]
    public string $email;
}</code></pre>

        <h3>8.3. Control de Permisos en Back Office</h3>

        <pre><code class="language-php">use PrestaShopBundle\Security\Annotation\AdminSecurity;

#[Route('/mimodulo/delete/{id}', name: 'admin_mimodulo_delete')]
#[AdminSecurity("is_granted('delete', 'AdminModules')")]
public function delete(int $id): Response
{
    // Solo usuarios con permiso de eliminar pueden acceder
}</code></pre>

        <h2 class="section-title">9. Testing de Controladores</h2>
        <p>Los controladores Symfony son mucho más fáciles de testear que los Legacy.</p>

        <h3>9.1. Test Funcional de un Controlador</h3>

        <pre><code class="language-php">namespace MiModulo\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class ConfigurationControllerTest extends WebTestCase
{
    public function testIndexPage(): void
    {
        $client = static::createClient();
        $client->request('GET', '/mimodulo/configuration');

        $this->assertResponseIsSuccessful();
        $this->assertSelectorTextContains('h1', 'Configuración');
    }

    public function testFormSubmission(): void
    {
        $client = static::createClient();
        $crawler = $client->request('GET', '/mimodulo/configuration');

        $form = $crawler->selectButton('Guardar')->form([
            'configuration[api_key]' => 'test-api-key-123',
            'configuration[mode]' => 'production',
        ]);

        $client->submit($form);
        $this->assertResponseRedirects();
    }
}</code></pre>

        <h2 class="section-title">10. Debugging y Profiling</h2>
        <p>PrestaShop 8 integra la Symfony Web Debug Toolbar y el Profiler, herramientas esenciales para depuración.</p>

        <h3>10.1. Acceso al Profiler</h3>
        <p>En modo desarrollo, al final de cada respuesta verás la toolbar con información detallada:</p>
        <ul>
            <li><strong>Tiempo de ejecución</strong> y uso de memoria</li>
            <li><strong>Consultas SQL</strong> ejecutadas</li>
            <li><strong>Eventos disparados</strong></li>
            <li><strong>Logs</strong> de la aplicación</li>
        </ul>

        <h3>10.2. Logging en Controladores</h3>

        <pre><code class="language-php">use Psr\Log\LoggerInterface;

class MyController extends FrameworkBundleAdminController
{
    public function __construct(
        private readonly LoggerInterface $logger
    ) {}

    public function process(): Response
    {
        $this->logger->info('Procesando solicitud', [
            'user_id' => $this->getContext()->employee->id,
        ]);

        try {
            // Lógica...
        } catch (\Exception $e) {
            $this->logger->error('Error en proceso', [
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }
}</code></pre>
    </div>
`;

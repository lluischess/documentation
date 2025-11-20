const configuracionModulosBackOffice = `
    <div class="content-section">
        <h1 id="configuracion-modulos-back-office">Configuración de Módulos y Pestañas en el Back Office</h1>
        <p>La configuración del Back Office es esencial para que los administradores de la tienda puedan gestionar las funcionalidades de tu módulo. PrestaShop proporciona varios mecanismos para crear interfaces de configuración, añadir pestañas personalizadas, y gestionar permisos de acceso.</p>

        <h2 class="section-title">1. Página de Configuración del Módulo</h2>
        <p>Cada módulo puede tener una página de configuración accesible desde <strong>Módulos > Module Manager</strong>. Se implementa sobrescribiendo el método <code>getContent()</code>.</p>

        <h3>1.1. Configuración Básica con getContent()</h3>
        <p>Este método se llama cuando el administrador hace clic en "Configurar" en el módulo. Aquí puedes renderizar formularios, procesar datos enviados, y mostrar interfaces personalizadas.</p>

        <pre><code class="language-php">declare(strict_types=1);

namespace MiModulo;

use Module;
use Tools;
use Configuration;

class MiModulo extends Module
{
    public function __construct()
    {
        $this->name = 'mimodulo';
        $this->tab = 'front_office_features';
        $this->version = '1.0.0';
        $this->author = 'Tu Nombre';
        $this->need_instance = 0;

        parent::__construct();

        $this->displayName = $this->l('Mi Módulo');
        $this->description = $this->l('Módulo de ejemplo con configuración avanzada');
    }

    /**
     * Método principal de configuración.
     * Se ejecuta al hacer clic en "Configurar" desde el gestor de módulos.
     */
    public function getContent(): string
    {
        $output = '';

        // Procesar el formulario si se envió
        if (Tools::isSubmit('submit' . $this->name)) {
            $output .= $this->processConfiguration();
        }

        // Mostrar mensajes de confirmación o error
        $output .= $this->displayConfirmation($this->l('Configuración guardada correctamente'));

        // Renderizar el formulario
        $output .= $this->renderForm();

        return $output;
    }

    /**
     * Procesa y guarda la configuración.
     */
    private function processConfiguration(): string
    {
        $apiKey = Tools::getValue('MIMODULO_API_KEY');
        $enabled = (bool)Tools::getValue('MIMODULO_ENABLED');

        // Validar datos
        if (empty($apiKey)) {
            return $this->displayError($this->l('La API Key no puede estar vacía'));
        }

        // Guardar en la tabla ps_configuration
        Configuration::updateValue('MIMODULO_API_KEY', $apiKey);
        Configuration::updateValue('MIMODULO_ENABLED', $enabled);

        return $this->displayConfirmation($this->l('Configuración guardada'));
    }

    /**
     * Renderiza el formulario de configuración.
     */
    private function renderForm(): string
    {
        $fieldsForm = [
            'form' => [
                'legend' => [
                    'title' => $this->l('Configuración General'),
                    'icon' => 'icon-cogs',
                ],
                'input' => [
                    [
                        'type' => 'text',
                        'label' => $this->l('API Key'),
                        'name' => 'MIMODULO_API_KEY',
                        'desc' => $this->l('Introduce tu clave de API'),
                        'required' => true,
                        'size' => 50,
                    ],
                    [
                        'type' => 'switch',
                        'label' => $this->l('Activar módulo'),
                        'name' => 'MIMODULO_ENABLED',
                        'is_bool' => true,
                        'values' => [
                            ['id' => 'active_on', 'value' => 1, 'label' => $this->l('Sí')],
                            ['id' => 'active_off', 'value' => 0, 'label' => $this->l('No')],
                        ],
                    ],
                ],
                'submit' => [
                    'title' => $this->l('Guardar'),
                    'class' => 'btn btn-default pull-right',
                ],
            ],
        ];

        $helper = new \HelperForm();
        $helper->module = $this;
        $helper->name_controller = $this->name;
        $helper->token = Tools::getAdminTokenLite('AdminModules');
        $helper->currentIndex = \AdminController::$currentIndex . '&configure=' . $this->name;
        $helper->submit_action = 'submit' . $this->name;

        // Cargar valores actuales
        $helper->fields_value['MIMODULO_API_KEY'] = Configuration::get('MIMODULO_API_KEY');
        $helper->fields_value['MIMODULO_ENABLED'] = Configuration::get('MIMODULO_ENABLED');

        return $helper->generateForm([$fieldsForm]);
    }
}</code></pre>

        <h3>1.2. Tipos de Campos Disponibles en HelperForm</h3>
        <p>PrestaShop proporciona diversos tipos de campos para construir formularios complejos.</p>

        <pre><code class="language-php">// Campo de texto
[
    'type' => 'text',
    'label' => $this->l('Nombre'),
    'name' => 'CAMPO_TEXTO',
    'size' => 40,
    'required' => true,
]

// Área de texto
[
    'type' => 'textarea',
    'label' => $this->l('Descripción'),
    'name' => 'CAMPO_TEXTAREA',
    'cols' => 60,
    'rows' => 10,
]

// Editor WYSIWYG
[
    'type' => 'textarea',
    'label' => $this->l('Contenido HTML'),
    'name' => 'CAMPO_HTML',
    'autoload_rte' => true, // Activa TinyMCE
    'lang' => true, // Multiidioma
]

// Select / Dropdown
[
    'type' => 'select',
    'label' => $this->l('Selecciona una opción'),
    'name' => 'CAMPO_SELECT',
    'options' => [
        'query' => [
            ['id' => 'opcion1', 'name' => 'Opción 1'],
            ['id' => 'opcion2', 'name' => 'Opción 2'],
        ],
        'id' => 'id',
        'name' => 'name',
    ],
]

// Checkbox
[
    'type' => 'checkbox',
    'label' => $this->l('Opciones múltiples'),
    'name' => 'CAMPO_CHECKBOX',
    'values' => [
        'query' => [
            ['id' => 1, 'name' => 'Opción A', 'val' => '1'],
            ['id' => 2, 'name' => 'Opción B', 'val' => '2'],
        ],
        'id' => 'id',
        'name' => 'name',
    ],
]

// Radio buttons
[
    'type' => 'radio',
    'label' => $this->l('Seleccionar uno'),
    'name' => 'CAMPO_RADIO',
    'values' => [
        ['id' => 'si', 'value' => 1, 'label' => $this->l('Sí')],
        ['id' => 'no', 'value' => 0, 'label' => $this->l('No')],
    ],
]

// File upload
[
    'type' => 'file',
    'label' => $this->l('Subir archivo'),
    'name' => 'CAMPO_FILE',
    'desc' => $this->l('Formatos permitidos: jpg, png, pdf'),
]

// Color picker
[
    'type' => 'color',
    'label' => $this->l('Color'),
    'name' => 'CAMPO_COLOR',
    'size' => 20,
]

// Date picker
[
    'type' => 'date',
    'label' => $this->l('Fecha'),
    'name' => 'CAMPO_FECHA',
]</code></pre>

        <h2 class="section-title">2. Creación de Pestañas Personalizadas en el Menú</h2>
        <p>Para crear pestañas personalizadas en el menú del Back Office de PrestaShop (como "Pedidos", "Catálogo", etc.), debes insertar entradas en la tabla <code>ps_tab</code>. Esto se hace típicamente durante la instalación del módulo.</p>

        <h3>2.1. Instalación de Pestañas</h3>

        <pre><code class="language-php">class MiModulo extends Module
{
    public function install(): bool
    {
        return parent::install()
            && $this->installTabs()
            && $this->registerHook('displayHeader');
    }

    public function uninstall(): bool
    {
        return parent::uninstall()
            && $this->uninstallTabs();
    }

    /**
     * Crea las pestañas del módulo en el menú del Back Office.
     */
    private function installTabs(): bool
    {
        $tabs = [
            [
                'class_name' => 'AdminMiModulo',
                'parent_class_name' => 'SELL', // Ubicación: bajo "Vender"
                'name' => 'Mi Módulo',
                'icon' => 'settings', // Icono Material Icons
            ],
            [
                'class_name' => 'AdminMiModuloConfiguracion',
                'parent_class_name' => 'AdminMiModulo', // Submenú de AdminMiModulo
                'name' => 'Configuración',
            ],
            [
                'class_name' => 'AdminMiModuloReportes',
                'parent_class_name' => 'AdminMiModulo',
                'name' => 'Reportes',
            ],
        ];

        foreach ($tabs as $tabData) {
            $tab = new \Tab();
            $tab->class_name = $tabData['class_name'];
            $tab->module = $this->name;
            $tab->id_parent = (int)\Tab::getIdFromClassName($tabData['parent_class_name']);
            $tab->icon = $tabData['icon'] ?? '';

            // Nombre multiidioma
            foreach (\Language::getLanguages(false) as $lang) {
                $tab->name[$lang['id_lang']] = $this->l($tabData['name'], 'Admin.Global', $lang['locale']);
            }

            if (!$tab->add()) {
                return false;
            }
        }

        return true;
    }

    /**
     * Elimina las pestañas al desinstalar el módulo.
     */
    private function uninstallTabs(): bool
    {
        $tabClasses = [
            'AdminMiModulo',
            'AdminMiModuloConfiguracion',
            'AdminMiModuloReportes',
        ];

        foreach ($tabClasses as $className) {
            $idTab = (int)\Tab::getIdFromClassName($className);
            if ($idTab) {
                $tab = new \Tab($idTab);
                if (!$tab->delete()) {
                    return false;
                }
            }
        }

        return true;
    }
}</code></pre>

        <h3>2.2. Controlador Asociado a la Pestaña</h3>
        <p>Cada pestaña necesita un controlador que herede de <code>ModuleAdminController</code>. El nombre del archivo debe coincidir con el <code>class_name</code> de la pestaña.</p>

        <pre><code class="language-php">// Archivo: modules/mimodulo/controllers/admin/AdminMiModuloController.php
declare(strict_types=1);

use PrestaShop\PrestaShop\Core\Grid\GridFactory;

class AdminMiModuloController extends ModuleAdminController
{
    public function __construct()
    {
        $this->bootstrap = true; // Usar Bootstrap 3
        $this->table = 'mi_entidad';
        $this->className = 'MiEntidad';
        $this->lang = false;
        $this->addRowAction('edit');
        $this->addRowAction('delete');

        parent::__construct();

        $this->fields_list = [
            'id_mi_entidad' => [
                'title' => $this->l('ID'),
                'align' => 'center',
                'class' => 'fixed-width-xs',
            ],
            'nombre' => [
                'title' => $this->l('Nombre'),
                'filter_key' => 'a!nombre',
            ],
            'activo' => [
                'title' => $this->l('Estado'),
                'active' => 'status',
                'type' => 'bool',
                'align' => 'center',
            ],
            'date_add' => [
                'title' => $this->l('Fecha creación'),
                'type' => 'datetime',
            ],
        ];
    }

    /**
     * Renderiza el formulario de edición/creación.
     */
    public function renderForm(): string
    {
        $this->fields_form = [
            'legend' => [
                'title' => $this->l('Editar Entidad'),
            ],
            'input' => [
                [
                    'type' => 'text',
                    'label' => $this->l('Nombre'),
                    'name' => 'nombre',
                    'required' => true,
                ],
                [
                    'type' => 'textarea',
                    'label' => $this->l('Descripción'),
                    'name' => 'descripcion',
                ],
                [
                    'type' => 'switch',
                    'label' => $this->l('Activo'),
                    'name' => 'activo',
                    'is_bool' => true,
                    'values' => [
                        ['id' => 'active_on', 'value' => 1],
                        ['id' => 'active_off', 'value' => 0],
                    ],
                ],
            ],
            'submit' => [
                'title' => $this->l('Guardar'),
            ],
        ];

        return parent::renderForm();
    }
}</code></pre>

        <h2 class="section-title">3. Uso de Controladores Symfony en el Back Office</h2>
        <p>PrestaShop 8+ permite crear controladores Symfony para el Back Office, ofreciendo una experiencia más moderna con routing, atributos PHP 8, y grids avanzados.</p>

        <h3>3.1. Estructura de un Controlador Symfony</h3>

        <pre><code class="language-php">// Archivo: modules/mimodulo/src/Controller/Admin/MiModuloController.php
declare(strict_types=1);

namespace MiModulo\Controller\Admin;

use PrestaShopBundle\Controller\Admin\FrameworkBundleAdminController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/mimodulo', name: 'mimodulo_')]
class MiModuloController extends FrameworkBundleAdminController
{
    #[Route('/configuracion', name: 'configuracion')]
    public function configuracion(): Response
    {
        return $this->render('@Modules/mimodulo/views/templates/admin/configuracion.html.twig', [
            'apiKey' => $this->getConfiguration()->get('MIMODULO_API_KEY'),
            'layoutTitle' => $this->trans('Configuración de Mi Módulo', 'Modules.Mimodulo.Admin'),
        ]);
    }

    #[Route('/guardar', name: 'guardar', methods: ['POST'])]
    public function guardar(Request $request): Response
    {
        $apiKey = $request->request->get('api_key');
        
        $this->getConfiguration()->set('MIMODULO_API_KEY', $apiKey);

        $this->addFlash('success', $this->trans('Configuración guardada', 'Admin.Notifications.Success'));

        return $this->redirectToRoute('mimodulo_configuracion');
    }
}</code></pre>

        <h3>3.2. Registro de Rutas en el Módulo</h3>
        <p>Para que PrestaShop reconozca las rutas de tu controlador Symfony, debes registrarlas en el archivo de configuración de servicios.</p>

        <pre><code class="language-yaml"># modules/mimodulo/config/routes.yml
mimodulo_admin:
    resource: '../src/Controller/Admin'
    type: annotation
    prefix: /admin-module</code></pre>

        <h2 class="section-title">4. Gestión de Permisos y Accesos</h2>
        <p>PrestaShop permite controlar qué empleados pueden ver o editar cada pestaña según su perfil (Admin, Logístico, Traductor, etc.).</p>

        <h3>4.1. Verificación de Permisos en Controladores Legacy</h3>

        <pre><code class="language-php">class AdminMiModuloController extends ModuleAdminController
{
    public function initContent(): void
    {
        // Verificar si el usuario tiene permiso de lectura
        if (!$this->tabAccess['view']) {
            $this->errors[] = $this->l('No tienes permiso para ver esta página');
            return;
        }

        parent::initContent();
    }

    public function postProcess(): bool
    {
        // Verificar si el usuario tiene permiso de escritura
        if (!$this->tabAccess['edit']) {
            $this->errors[] = $this->l('No tienes permiso para editar');
            return false;
        }

        return parent::postProcess();
    }
}</code></pre>

        <h3>4.2. Permisos en Controladores Symfony con Atributos</h3>

        <pre><code class="language-php">use PrestaShopBundle\Security\Annotation\AdminSecurity;

#[Route('/mimodulo/editar/{id}', name: 'mimodulo_editar')]
#[AdminSecurity("is_granted('update', request.get('_legacy_controller'))")]
public function editar(int $id): Response
{
    // Solo usuarios con permiso "update" pueden acceder
    // ...
}</code></pre>

        <h2 class="section-title">5. Mejores Prácticas</h2>
        <ul>
            <li><strong>Validación robusta:</strong> Siempre usa <code>Tools::getValue()</code> y valida entradas con <code>Validate::isCleanHtml()</code>, <code>Validate::isInt()</code>, etc.</li>
            <li><strong>Tokens CSRF:</strong> Los formularios generados con <code>HelperForm</code> incluyen tokens automáticamente. Si creas formularios manuales, usa <code>Tools::getAdminTokenLite()</code>.</li>
            <li><strong>Mensajes traducibles:</strong> Usa <code>$this->l()</code> para todos los textos visibles.</li>
            <li><strong>Backup antes de desinstalar:</strong> Si tu módulo almacena datos críticos, ofrece una opción de exportación antes de borrar tablas en <code>uninstall()</code>.</li>
            <li><strong>Multitienda:</strong> Si trabajas con configuraciones multitienda, usa <code>Configuration::updateValue()</code> con el contexto de shop correcto.</li>
        </ul>
    </div>
`;

const estructuraModulosTemas = `
    <h1>Estructura de Módulos y Temas en PrestaShop 8.2 y 9</h1>
    
    <p>Con la llegada de <strong>PrestaShop 8</strong> y la evolución hacia la versión <strong>9</strong>, la estructura de archivos se ha modernizado para adoptar estándares de Symfony y Composer. Entender dónde ubicar cada archivo es crucial para la compatibilidad y el mantenimiento.</p>

    <h2>Visión General: Legacy vs. Modern</h2>
    <div class="code-block"><pre><code>Evolución de la Arquitectura:

1. Estructura Legacy (PS 1.6 - 1.7 temprano)
   - Lógica mezclada en la clase principal.
   - Controladores propios de PrestaShop.
   - require_once manuales.

2. Estructura Moderna (PS 8.2 - 9)
   - Separación de responsabilidades (SoC).
   - Uso de carpeta /src para lógica PHP (Namespaces).
   - Uso de Composer (Vendor).
   - Configuración de servicios (services.yml).
   - Controladores Symfony para Back Office.
</code></pre></div>

    <h2>1. Estructura de un Módulo Moderno</h2>
    <p>En PrestaShop 9, se recomienda encarecidamente (y en muchos casos se exige) seguir la estructura basada en Namespaces y Composer.</p>

    <div class="code-block"><pre><code>/modules/mi_modulo_pro/
├── composer.json          # Dependencias y Autoloading (PSR-4)
├── mi_modulo_pro.php      # Clase principal (Hereda de Module)
├── logo.png               # Icono del módulo (32x32)
├── config.xml             # Cache de configuración (XML)
│
├── config/
│   ├── services.yml       # Inyección de dependencias (Symfony)
│   └── routes.yml         # Rutas personalizadas (Symfony Routing)
│
├── src/                   # Lógica de Negocio (PSR-4 Namespace)
│   ├── Controller/        # Controladores Symfony (Admin/API)
│   ├── Entity/            # Entidades de Doctrine (Base de datos)
│   ├── Repository/        # Repositorios de Doctrine
│   ├── Form/              # Formularios Symfony
│   └── Service/           # Clases de servicio reutilizables
│
├── views/                 # Vistas (Front Office y Legacy Admin)
│   ├── templates/
│   │   ├── admin/         # Vistas legacy (.tpl)
│   │   ├── front/         # Vistas front (.tpl)
│   │   └── hook/          # Vistas para hooks (.tpl)
│   ├── css/
│   └── js/
│
└── translations/          # Traducciones (Nuevo sistema XLF o PHP)
</code></pre></div>

    <h3>El archivo composer.json</h3>
    <p>Es el corazón de un módulo moderno en PS 8/9. Define cómo se cargan las clases automáticamente.</p>

    <div class="code-block"><pre><code>{
  "name": "autor/mi_modulo_pro",
  "description": "Módulo moderno para PS 9",
  "autoload": {
    "psr-4": {
      "Autor\\\\MiModuloPro\\\\": "src/"
    }
  },
  "config": {
    "platform": {
      "php": "8.1"
    }
  },
  "type": "prestashop-module"
}</code></pre></div>

    <div class="info-box">
        <strong>💡 Nota sobre PrestaShop 9:</strong>
        <ul>
            <li>Requiere <strong>PHP 8.1</strong> como mínimo.</li>
            <li>El uso de <code>Strict types</code> es altamente recomendado.</li>
            <li>Las clases en <code>src/</code> se cargan automáticamente gracias al autoloader de Composer generado.</li>
        </ul>
    </div>

    <h2>2. La Clase Principal (Main Class)</h2>
    <p>Aunque usemos Symfony, el archivo raíz <code>.php</code> sigue siendo necesario para la instalación y registro de Hooks.</p>

    <div class="code-block"><pre><code>&lt;?php
// mi_modulo_pro.php

declare(strict_types=1); // Estándar en PS 9

if (!defined('_PS_VERSION_')) {
    exit;
}

// Cargar autoloader si existe (para desarrollo local)
if (file_exists(__DIR__.'/vendor/autoload.php')) {
    require_once __DIR__.'/vendor/autoload.php';
}

use PrestaShop\\PrestaShop\\Adapter\\SymfonyContainer;

class Mi_Modulo_Pro extends Module
{
    public function __construct()
    {
        $this->name = 'mi_modulo_pro';
        $this->tab = 'administration';
        $this->version = '1.0.0';
        $this->author = 'Tu Nombre';
        $this->need_instance = 0;
        $this->ps_versions_compliancy = ['min' => '8.0.0', 'max' => _PS_VERSION_];
        $this->bootstrap = true;

        parent::__construct();

        $this->displayName = $this->trans('Mi Módulo Pro', [], 'Modules.Mimodulopro.Admin');
        $this->description = $this->trans('Ejemplo de estructura PS 9', [], 'Modules.Mimodulopro.Admin');
    }

    public function install(): bool
    {
        return parent::install() &&
            $this->registerHook('displayHeader') &&
            $this->installService(); // Ejemplo de lógica extra
    }
    
    // En PS 9, evitamos lógica compleja aquí. 
    // Delegamos a servicios en /src/Service
}
?></code></pre></div>

    <h2>3. Estructura de un Tema (PrestaShop 8/9)</h2>
    <p>Los temas en PrestaShop 8 y 9 siguen basándose en la herencia (Parent/Child themes) y usan Smarty para el Front-Office, aunque Twig gana terreno en partes específicas.</p>

    <div class="code-block"><pre><code>/themes/mi_tema_child/
├── config/
│   └── theme.yml          # Configuración vital del tema
├── assets/
│   ├── css/               # CSS compilado
│   ├── js/                # JavaScript compilado
│   └── img/
│
├── templates/             # Estructura de plantillas
│   ├── _partials/         # Cabecera, pie, breadcrumbs
│   ├── catalog/           # Página de producto, listados
│   │   ├── _partials/
│   │   ├── product.tpl
│   │   └── listing/
│   ├── checkout/          # Proceso de compra
│   ├── cms/               # Páginas estáticas
│   ├── customer/          # Área de cliente
│   ├── errors/            # 404, 500
│   └── layouts/           # Layouts base (full-width, columnas)
│
├── modules/               # Overrides de plantillas de módulos
│   └── ps_shoppingcart/
│       └── ps_shoppingcart.tpl
│
└── dependencies/          # Módulos requeridos por el tema
</code></pre></div>

    <h3>Configuración: theme.yml</h3>
    <p>Este archivo define los metadatos, hooks por defecto y configuración de imágenes.</p>

    <div class="code-block"><pre><code>parent: classic
name: mi_tema_child
display_name: 'Mi Tema Hijo PS 9'
version: 1.0.0
assets:
  use_parent_assets: true  # Heredar CSS/JS del padre

global_settings:
  hooks:
    modules_to_hook:
      displayHeader:
        - ps_shoppingcart
        - ps_mainmenu

image_types:
  cart_default:
    width: 125
    height: 125
    scope: [products]
</code></pre></div>

    <h2>4. Inyección de Dependencias (Symfony)</h2>
    <p>En PrestaShop 9, acceder al objeto global <code>Context::getContext()</code> se considera mala práctica dentro de clases de servicio. Se debe usar <strong>Inyección de Dependencias</strong>.</p>

    <div class="code-block"><pre><code># config/services.yml

services:
  _defaults:
    public: true
    autowire: true       # Auto-detectar dependencias

  # Registrar nuestro controlador
  Autor\\\\MiModuloPro\\\\Controller\\\\Admin\\\\DemoController:
    tags: ['controller.service_arguments']

  # Registrar un servicio propio
  Autor\\\\MiModuloPro\\\\Service\\\\CalculadoraPrecio:
    arguments:
      $currencyId: 1
</code></pre></div>

    <h2>5. Comparativa: Controladores Admin</h2>
    <p>La gran diferencia en el desarrollo backend entre versiones antiguas y PS 9.</p>

    <div class="code-block"><pre><code>Legacy (AdminController)
------------------------
Ubicación: /controllers/admin/AdminMiModulo.php
Herencia: ModuleAdminController
Renderizado: HelperForm / Smarty (.tpl)
URL: index.php?controller=AdminMiModulo&token=...

Moderno (Symfony Controller)
----------------------------
Ubicación: /src/Controller/Admin/MiModuloController.php
Herencia: FrameworkBundleAdminController
Renderizado: Twig (.html.twig)
URL: /admin-dev/mi-modulo/config (Ruta amigable)
</code></pre></div>

    <div class="success-box">
        <strong>✅ Mejores Prácticas para PS 9:</strong>
        <ul>
            <li><strong>Composer</strong>: Úsalo siempre para gestionar librerías externas.</li>
            <li><strong>Namespaces</strong>: Evita colisiones de nombres de clases usando <code>Vendor\\\\Module\\\\Domain</code>.</li>
            <li><strong>Modern Controller</strong>: Migra tus controladores de Back Office a Symfony.</li>
            <li><strong>Hooks</strong>: Usa Interfaces PHP para definir contratos en tus servicios.</li>
            <li><strong>Grid Component</strong>: Usa el componente Grid de PrestaShop para listados en el admin, no \`HelperList\`.</li>
        </ul>
    </div>

    <div class="warning-box">
        <strong>⚠️ Cambios Rupturistas (Breaking Changes):</strong>
        <ul>
            <li>Funciones eliminadas: Muchas funciones obsoletas (\`Tools::jsonEncode\`, etc.) han sido eliminadas en PS 9.</li>
            <li>Versión PHP: Tu código debe ser compatible con PHP 8.1+.</li>
            <li>Symfony: PrestaShop 8 usa Symfony 4.4/5.4, pero PrestaShop 9 salta a versiones más recientes (Symfony 6/7), lo que cambia la sintaxis de algunos servicios.</li>
        </ul>
    </div>

    <h2>Diagrama de Flujo: Módulo Moderno</h2>
    <div class="code-block"><pre><code>+---------------------------+
|  Ruta (Symfony Routing)   | /admin/mi-modulo/configura
+-------------+-------------+
              |
              v
+---------------------------+
|    Controller (Symfony)   | src/Controller/Admin/ConfigController.php
|  (Inyecta Servicios Auto) |
+-------------+-------------+
              |
              v
+---------------------------+      +--------------------------+
|     Service Layer (src)   | <--> |    Doctrine (Database)   |
|  (Lógica de Negocio Pura) |      | (Repository / Entity)    |
+-------------+-------------+      +--------------------------+
              |
              v
+---------------------------+
|     View (Twig Template)  | views/templates/admin/config.html.twig
+---------------------------+
</code></pre></div>
`;
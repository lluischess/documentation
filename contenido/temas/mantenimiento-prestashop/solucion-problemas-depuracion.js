// @ts-nocheck
const solucionProblemasDepuracion = `
    <div class="content-section">
        <h1 id="solucion-problemas">Solución de Problemas Comunes y Depuración</h1>
        <p>La depuración efectiva es crucial para resolver problemas en PrestaShop 8.9+. Esta guía cubre errores comunes, herramientas de debugging y estrategias de troubleshooting.</p>

        <h2 class="section-title">1. Problemas Comunes y Soluciones</h2>

        <h3>1.1. Pantalla Blanca (White Screen of Death)</h3>

        <div class="alert alert-danger">
            <strong>🚨 Síntoma:</strong> La página carga completamente en blanco, sin mensajes de error visibles.
        </div>

        <h4>Causas Comunes:</h4>
        <ul>
            <li>Error fatal de PHP no mostrado</li>
            <li>Memoria PHP agotada</li>
            <li>Archivo corrupto o override incorrecto</li>
            <li>Módulo incompatible</li>
        </ul>

        <h4>Soluciones:</h4>

        <pre><code class="language-php"><?php
// 1. Activar modo debug en config/defines.inc.php
define('_PS_MODE_DEV_', true);

// 2. Mostrar errores de PHP
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// 3. Aumentar límite de memoria en config/defines.inc.php
ini_set('memory_limit', '256M');
</code></pre>

        <pre><code class="language-bash"># 4. Revisar logs del servidor
tail -f /var/log/apache2/error.log
tail -f /var/log/nginx/error.log
tail -f /var/log/php8.1-fpm.log

# 5. Revisar logs de PrestaShop
tail -f var/logs/dev.log
tail -f var/logs/prod.log</code></pre>

        <h3>1.2. Error 500 (Internal Server Error)</h3>

        <table class="table table-bordered">
            <thead class="table-dark">
                <tr>
                    <th width="30%">Causa</th>
                    <th width="40%">Diagnóstico</th>
                    <th width="30%">Solución</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>.htaccess corrupto</strong></td>
                    <td>Error aparece en toda la tienda</td>
                    <td>Reemplazar con .htaccess original</td>
                </tr>
                <tr>
                    <td><strong>Permisos incorrectos</strong></td>
                    <td>Errores al escribir archivos</td>
                    <td>Ajustar permisos: 755 dirs, 644 files</td>
                </tr>
                <tr>
                    <td><strong>PHP timeout</strong></td>
                    <td>Error en operaciones largas</td>
                    <td>Aumentar max_execution_time</td>
                </tr>
                <tr>
                    <td><strong>Sintaxis PHP</strong></td>
                    <td>Después de editar archivos</td>
                    <td>Revisar logs, verificar sintaxis</td>
                </tr>
            </tbody>
        </table>

        <pre><code class="language-bash"># Verificar sintaxis de archivos PHP
find . -name "*.php" -exec php -l {} \\;

# Corregir permisos
find . -type d -exec chmod 755 {} \\;
find . -type f -exec chmod 644 {} \\;
chown -R www-data:www-data .</code></pre>

        <h3>1.3. Error "Cannot modify header information"</h3>

        <div class="alert alert-warning">
            <strong>⚠️ Error típico:</strong> <code>Warning: Cannot modify header information - headers already sent by...</code>
        </div>

        <h4>Causas:</h4>
        <ul>
            <li>Espacios en blanco antes de <code>&lt;?php</code></li>
            <li>BOM (Byte Order Mark) en archivos UTF-8</li>
            <li>Echo/print antes de header()</li>
            <li>Archivos con salida después de <code>?&gt;</code></li>
        </ul>

        <h4>Solución:</h4>

        <pre><code class="language-bash"># Encontrar archivos con BOM
find . -name "*.php" -exec grep -l $'\\xEF\\xBB\\xBF' {} \\;

# Eliminar BOM de archivos PHP
find . -name "*.php" -exec sed -i '1s/^\\xEF\\xBB\\xBF//' {} \\;

# Buscar espacios en blanco al inicio
grep -r "^[[:space:]]*<?php" --include="*.php" .</code></pre>

        <pre><code class="language-php"><?php
// Buena práctica: No usar cierre de PHP al final
// INCORRECTO
?>
(espacio o salto de línea aquí)

// CORRECTO - Sin cierre de PHP
// ... código ...
// (fin de archivo sin ?>)
</code></pre>

        <h3>1.4. Problemas de Cache</h3>

        <pre><code class="language-bash"># Limpiar toda la caché de forma segura
rm -rf var/cache/dev/*
rm -rf var/cache/prod/*
php bin/console cache:clear --env=prod

# Si persisten problemas, regenerar
php bin/console prestashop:update:configuration</code></pre>

        <h2 class="section-title">2. Modo Debug de PrestaShop</h2>

        <h3>2.1. Activar Modo Desarrollo</h3>

        <pre><code class="language-php"><?php
// config/defines.inc.php
define('_PS_MODE_DEV_', true);

// También en .env (PrestaShop 8+)
APP_ENV=dev
APP_DEBUG=1
</code></pre>

        <h3>2.2. Debug Toolbar de Symfony</h3>

        <div class="alert alert-info">
            <strong>📊 Información que muestra:</strong>
            <ul class="mb-0">
                <li><strong>Performance:</strong> Tiempo de ejecución total</li>
                <li><strong>Database:</strong> Número de queries y tiempo</li>
                <li><strong>Memory:</strong> Uso de memoria</li>
                <li><strong>Events:</strong> Hooks disparados</li>
                <li><strong>Logs:</strong> Mensajes de log</li>
                <li><strong>Cache:</strong> Hits/misses</li>
            </ul>
        </div>

        <h3>2.3. Profiler Avanzado</h3>

        <pre><code class="language-php"><?php
// Acceder al profiler
// URL: http://tu-tienda.com/_profiler

// Ver último perfil
// URL: http://tu-tienda.com/_profiler/latest

// Buscar por token
// URL: http://tu-tienda.com/_profiler/abc123
</code></pre>

        <h2 class="section-title">3. Herramientas de Depuración</h2>

        <h3>3.1. Xdebug - Configuración</h3>

        <pre><code class="language-ini"># /etc/php/8.1/mods-available/xdebug.ini
zend_extension=xdebug.so

; Xdebug 3.x configuration
xdebug.mode=debug,develop,coverage,profile
xdebug.start_with_request=trigger
xdebug.client_host=127.0.0.1
xdebug.client_port=9003
xdebug.idekey=PHPSTORM

; Profiler
xdebug.output_dir=/tmp/xdebug
xdebug.profiler_output_name=cachegrind.out.%t

; Stack traces mejorados
xdebug.var_display_max_depth=10
xdebug.var_display_max_children=256
xdebug.var_display_max_data=1024</code></pre>

        <pre><code class="language-bash"># Activar Xdebug
sudo phpenmod xdebug
sudo service php8.1-fpm restart

# Desactivar Xdebug (mejora rendimiento en desarrollo normal)
sudo phpdismod xdebug
sudo service php8.1-fpm restart

# Verificar instalación
php -v | grep Xdebug</code></pre>

        <h3>3.2. Debugging en PhpStorm</h3>

        <pre><code class="language-json">// .vscode/launch.json para VS Code
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Listen for Xdebug",
            "type": "php",
            "request": "launch",
            "port": 9003,
            "pathMappings": {
                "/var/www/prestashop": "\${workspaceFolder}"
            }
        }
    ]
}</code></pre>

        <h3>3.3. var_dump() Mejorado</h3>

        <pre><code class="language-php"><?php
// Usar dump() de Symfony (más legible)
dump($variable);
dump($array, $object);

// dd() = dump() + die()
dd($variable); // Muestra y detiene ejecución

// PrestaShop Tools::d() 
Tools::d($variable);      // Dump
Tools::dd($variable);     // Dump and die
Tools::p($variable);      // Print_r formateado

// Para AJAX, devolver JSON
header('Content-Type: application/json');
echo json_encode($data, JSON_PRETTY_PRINT);
die();
</code></pre>

        <h3>3.4. Logging Personalizado</h3>

        <pre><code class="language-php"><?php
// Usando PrestaShopLogger
PrestaShopLogger::addLog(
    'Mensaje de debug',
    1, // Severity: 1=Info, 2=Warning, 3=Error, 4=Fatal
    null,
    'Order',
    123, // ID del objeto
    true // Permitir duplicados
);

// Usando Monolog (Symfony)
use Psr\\Log\\LoggerInterface;

class MyService
{
    private LoggerInterface $logger;

    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
    }

    public function doSomething(): void
    {
        $this->logger->debug('Debug message');
        $this->logger->info('Info message');
        $this->logger->warning('Warning message');
        $this->logger->error('Error message', [
            'context' => 'additional data',
            'user_id' => 123
        ]);
    }
}
</code></pre>

        <h2 class="section-title">4. Debugging de Queries SQL</h2>

        <h3>4.1. Activar SQL Debug</h3>

        <pre><code class="language-php"><?php
// config/defines.inc.php
define('_PS_DEBUG_SQL_', true);

// Ver queries en tiempo real
$queries = Db::getInstance()->queries;
foreach ($queries as $query) {
    echo "Query: " . $query['query'] . "\\n";
    echo "Time: " . $query['time'] . "s\\n\\n";
}

// Contar queries
echo "Total queries: " . Db::getInstance()->getNumberOfQueries();
</code></pre>

        <h3>4.2. Analizar Queries Lentas</h3>

        <pre><code class="language-php"><?php
// Wrapper para detectar queries lentas
class DbProfiler
{
    public static function logSlowQueries(): void
    {
        $db = Db::getInstance();
        $slowQueries = [];

        foreach ($db->queries as $query) {
            if (isset($query['time']) && $query['time'] > 0.1) { // > 100ms
                $slowQueries[] = [
                    'query' => substr($query['query'], 0, 200),
                    'time' => round($query['time'], 4),
                    'backtrace' => debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 5)
                ];
            }
        }

        if (!empty($slowQueries)) {
            PrestaShopLogger::addLog(
                'Slow queries detected: ' . json_encode($slowQueries),
                2,
                null,
                'Performance'
            );
        }
    }
}

// Usar al final del proceso
register_shutdown_function([DbProfiler::class, 'logSlowQueries']);
</code></pre>

        <h2 class="section-title">5. Debugging de Hooks</h2>

        <pre><code class="language-php"><?php
// Ver todos los hooks ejecutados
define('_PS_DEBUG_PROFILING_', true);

// Listar módulos en un hook específico
$modules = Hook::getModulesFromHook('displayHeader');
foreach ($modules as $module) {
    echo $module['name'] . "\\n";
}

// Verificar si un hook existe
if (Hook::isRegistered('myCustomHook')) {
    echo "Hook registrado\\n";
}

// Ejecutar hook con debugging
Hook::exec('displayHeader', [], null, true); // true = debugging
</code></pre>

        <h2 class="section-title">6. Errores de Módulos</h2>

        <h3>6.1. Desactivar Módulo Problemático</h3>

        <pre><code class="language-sql">-- Desactivar módulo desde BD
UPDATE ps_module SET active = 0 WHERE name = 'nombre_modulo';

-- Ver módulos activos
SELECT id_module, name, version, active 
FROM ps_module 
WHERE active = 1;</code></pre>

        <pre><code class="language-bash"># Renombrar directorio del módulo temporalmente
cd modules/
mv problemmodule problemmodule.disabled

# Limpiar caché
rm -rf ../var/cache/*/*</code></pre>

        <h3>6.2. Debugging de Módulo</h3>

        <pre><code class="language-php"><?php
// En el módulo, activar logs
class MyModule extends Module
{
    private function log($message, $data = null): void
    {
        $logMessage = '[' . $this->name . '] ' . $message;
        
        if ($data !== null) {
            $logMessage .= ': ' . json_encode($data, JSON_PRETTY_PRINT);
        }
        
        PrestaShopLogger::addLog($logMessage, 1);
        
        // También escribir a archivo
        $logFile = _PS_MODULE_DIR_ . $this->name . '/logs/debug.log';
        file_put_contents(
            $logFile,
            date('Y-m-d H:i:s') . ' | ' . $logMessage . PHP_EOL,
            FILE_APPEND
        );
    }

    public function hookDisplayHeader($params)
    {
        $this->log('Hook displayHeader called', $params);
        
        try {
            // ... código del hook ...
        } catch (Exception $e) {
            $this->log('Error in displayHeader: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
}
</code></pre>

        <h2 class="section-title">7. Checklist de Troubleshooting</h2>

        <div class="card mb-3">
            <div class="card-header bg-primary text-white">🔍 Pasos de Diagnóstico</div>
            <div class="card-body">
                <ol>
                    <li><strong>Activar modo debug</strong>
                        <ul>
                            <li>defines.inc.php → <code>_PS_MODE_DEV_ = true</code></li>
                            <li>Mostrar errores PHP</li>
                        </ul>
                    </li>
                    <li><strong>Revisar logs</strong>
                        <ul>
                            <li>PrestaShop: var/logs/</li>
                            <li>PHP-FPM: /var/log/php8.1-fpm.log</li>
                            <li>Web server: /var/log/nginx/ o /var/log/apache2/</li>
                        </ul>
                    </li>
                    <li><strong>Limpiar caché</strong>
                        <ul>
                            <li>rm -rf var/cache/*/*</li>
                            <li>php bin/console cache:clear</li>
                        </ul>
                    </li>
                    <li><strong>Verificar permisos</strong>
                        <ul>
                            <li>Directorios: 755</li>
                            <li>Archivos: 644</li>
                            <li>Propietario: www-data</li>
                        </ul>
                    </li>
                    <li><strong>Desactivar módulos</strong>
                        <ul>
                            <li>Probar desactivando módulos uno por uno</li>
                            <li>Especialmente los instalados recientemente</li>
                        </ul>
                    </li>
                    <li><strong>Verificar configuración PHP</strong>
                        <ul>
                            <li>memory_limit ≥ 256M</li>
                            <li>max_execution_time ≥ 300</li>
                            <li>post_max_size ≥ 32M</li>
                            <li>upload_max_filesize ≥ 32M</li>
                        </ul>
                    </li>
                    <li><strong>Revisar base de datos</strong>
                        <ul>
                            <li>Conexión correcta</li>
                            <li>Tablas no corruptas</li>
                            <li>REPAIR TABLE si es necesario</li>
                        </ul>
                    </li>
                </ol>
            </div>
        </div>

        <h2 class="section-title">8. Script de Diagnóstico Automático</h2>

        <pre><code class="language-php"><?php
// tools/diagnostic.php
require_once dirname(__DIR__) . '/config/config.inc.php';

class PrestaShopDiagnostic
{
    public static function run(): array
    {
        $results = [];
        
        // 1. PHP Version
        $results['php_version'] = [
            'current' => PHP_VERSION,
            'required' => '7.2.5',
            'status' => version_compare(PHP_VERSION, '7.2.5', '>=') ? 'OK' : 'ERROR'
        ];
        
        // 2. PHP Extensions
        $requiredExtensions = ['curl', 'gd', 'intl', 'mbstring', 'zip', 'json', 'xml'];
        $results['php_extensions'] = [];
        
        foreach ($requiredExtensions as $ext) {
            $results['php_extensions'][$ext] = extension_loaded($ext) ? 'OK' : 'MISSING';
        }
        
        // 3. Directory Permissions
        $directories = [
            'var/cache' => is_writable(_PS_CACHE_DIR_),
            'var/logs' => is_writable(_PS_LOG_DIR_),
            'img' => is_writable(_PS_IMG_DIR_),
            'upload' => is_writable(_PS_UPLOAD_DIR_),
        ];
        $results['permissions'] = $directories;
        
        // 4. Database Connection
        try {
            $db = Db::getInstance();
            $results['database'] = [
                'connection' => $db->getRow('SELECT 1') ? 'OK' : 'ERROR',
                'prefix' => _DB_PREFIX_,
                'engine' => $db->getValue('SELECT ENGINE FROM information_schema.TABLES WHERE TABLE_SCHEMA = "' . _DB_NAME_ . '" LIMIT 1')
            ];
        } catch (Exception $e) {
            $results['database'] = ['error' => $e->getMessage()];
        }
        
        // 5. PHP Configuration
        $results['php_config'] = [
            'memory_limit' => ini_get('memory_limit'),
            'max_execution_time' => ini_get('max_execution_time'),
            'post_max_size' => ini_get('post_max_size'),
            'upload_max_filesize' => ini_get('upload_max_filesize'),
            'display_errors' => ini_get('display_errors'),
        ];
        
        // 6. PrestaShop Config
        $results['prestashop'] = [
            'version' => _PS_VERSION_,
            'debug_mode' => _PS_MODE_DEV_ ? 'ENABLED' : 'DISABLED',
            'cache' => Configuration::get('PS_SMARTY_CACHE') ? 'ENABLED' : 'DISABLED',
        ];
        
        // 7. Módulos problemáticos
        $results['modules'] = self::checkModules();
        
        return $results;
    }
    
    private static function checkModules(): array
    {
        $modules = Module::getModulesOnDisk();
        $issues = [];
        
        foreach ($modules as $module) {
            $instance = Module::getInstanceByName($module->name);
            
            if (!$instance) {
                $issues[] = [
                    'module' => $module->name,
                    'issue' => 'Cannot instantiate module'
                ];
            }
        }
        
        return $issues;
    }
    
    public static function printReport(): void
    {
        $results = self::run();
        
        echo "=== PRESTASHOP DIAGNOSTIC REPORT ===\\n\\n";
        echo json_encode($results, JSON_PRETTY_PRINT);
        echo "\\n\\n=== END OF REPORT ===\\n";
    }
}

// Ejecutar
PrestaShopDiagnostic::printReport();
</code></pre>

        <h2 class="section-title">9. Mejores Prácticas</h2>

        <div class="row">
            <div class="col-md-6">
                <div class="card border-success mb-3">
                    <div class="card-header bg-success text-white">✅ Hacer</div>
                    <div class="card-body">
                        <ul>
                            <li>Usar modo debug solo en desarrollo</li>
                            <li>Revisar logs regularmente</li>
                            <li>Documentar errores y soluciones</li>
                            <li>Usar Xdebug para debugging complejo</li>
                            <li>Hacer backup antes de cambios</li>
                            <li>Probar en staging primero</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card border-danger mb-3">
                    <div class="card-header bg-danger text-white">❌ Evitar</div>
                    <div class="card-body">
                        <ul>
                            <li>Modo debug en producción</li>
                            <li>Ignorar warnings de PHP</li>
                            <li>No leer logs de errores</li>
                            <li>Hacer cambios sin backup</li>
                            <li>Usar var_dump() en producción</li>
                            <li>Dejar display_errors activo en prod</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <div class="alert alert-info">
            <strong>💡 Tip Final:</strong> Mantener un documento con errores comunes y sus soluciones. Esto acelera significativamente la resolución de problemas recurrentes.
        </div>
    </div>
`;

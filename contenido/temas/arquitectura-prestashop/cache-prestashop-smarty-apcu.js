const cachePrestaShopSmartyApcu = `
    <div class="content-section">
        <h1 id="cache-prestashop-smarty-apcu">Caché de PrestaShop (Smarty, APCu, Memcached)</h1>
        <p>El rendimiento es crucial en el comercio electrónico. PrestaShop ofrece varios niveles de caché para optimizar la carga de páginas y reducir la carga del servidor. Comprender cómo funcionan Smarty Cache, la caché de servidor (APCu, Memcached) y el sistema de archivos es fundamental.</p>

        <h2 class="section-title">1. Caché de Smarty</h2>
        <p>Smarty es el motor de plantillas utilizado por PrestaShop (aunque Twig está ganando terreno en el Back Office y partes del Front Office en versiones recientes). La caché de Smarty almacena versiones compiladas y renderizadas de los archivos de plantilla.</p>

        <h3>Configuración</h3>
        <p>Se puede configurar desde el Back Office en <strong>Parámetros Avanzados > Rendimiento</strong>.</p>
        <ul>
            <li><strong>Compilación de plantillas:</strong>
                <ul>
                    <li><em>Nunca recompilar los archivos de las plantillas:</em> Máximo rendimiento, usar solo en producción.</li>
                    <li><em>Recompilar las plantillas si los archivos han sido actualizados:</em> Recomendado para producción si se hacen cambios ocasionales.</li>
                    <li><em>Forzar compilación:</em> Solo para desarrollo.</li>
                </ul>
            </li>
            <li><strong>Caché:</strong> Activar para producción.</li>
        </ul>

        <h3>Uso en Módulos</h3>
        <p>Al desarrollar módulos, es importante gestionar la caché de Smarty para asegurar que los cambios se reflejen correctamente.</p>
        <pre><code class="language-php">// Comprobar si la plantilla ya está en caché
if (!$this->isCached('module:mimodulo/views/templates/hook/mimodulo.tpl', $this->getCacheId())) {
    // Lógica costosa (consultas a BD, cálculos)
    $this->smarty->assign([
        'variable' => $valorCalculado,
    ]);
}

// Mostrar la plantilla (usará la caché si existe)
return $this->fetch('module:mimodulo/views/templates/hook/mimodulo.tpl', $this->getCacheId());</code></pre>

        <h3>Limpieza de Caché Smarty</h3>
        <p>Es crucial limpiar la caché cuando se actualiza el contenido del módulo.</p>
        <pre><code class="language-php">public function hookActionUpdateQuantity($params)
{
    $this->_clearCache('module:mimodulo/views/templates/hook/mimodulo.tpl');
}</code></pre>

        <h2 class="section-title">2. Caché de Servidor (Cache Class)</h2>
        <p>PrestaShop tiene una clase abstracta <code>Cache</code> que permite almacenar datos en memoria utilizando diferentes drivers como APCu, Memcached o el sistema de archivos.</p>

        <h3>Configuración</h3>
        <p>Se activa en <strong>Parámetros Avanzados > Rendimiento</strong>, en la sección de "Caché" al final de la página. Aquí se selecciona el sistema de caché (Memcached, APCu, Xcache, etc.).</p>

        <h3>Uso de la Clase Cache</h3>
        <p>Se utiliza para almacenar resultados de consultas SQL pesadas o cálculos complejos.</p>
        <pre><code class="language-php">use PrestaShop\PrestaShop\Adapter\Cache\CacheAdapter;

// Generar una clave única
$cacheKey = 'MiModulo_GetData_' . $id_producto;

if (!Cache::isStored($cacheKey)) {
    // El dato no está en caché, calcularlo
    $result = Db::getInstance()->getValue('SELECT ...');
    
    // Guardar en caché
    Cache::store($cacheKey, $result);
}

// Recuperar de caché
$data = Cache::retrieve($cacheKey);</code></pre>

        <div class="alert alert-warning">
            <strong>Nota:</strong> <code>Cache::store()</code> y <code>Cache::retrieve()</code> usan la caché configurada en el Back Office. Si no hay ninguna activa, no harán nada o usarán un fallback dependiendo de la versión.
        </div>

        <h2 class="section-title">3. Caché de Symfony (PS 1.7 / 8 / 9)</h2>
        <p>Con la migración a Symfony, PrestaShop también utiliza el componente de Cache de Symfony, especialmente en el Back Office y para servicios.</p>

        <h3>Limpiar Caché desde Consola</h3>
        <p>La forma más efectiva de limpiar toda la caché (Smarty, Symfony, XML, autoload) es mediante la consola:</p>
        <pre><code class="language-bash"># Limpiar caché de producción
php bin/console cache:clear --env=prod

# Limpiar caché de desarrollo (si se usa)
php bin/console cache:clear --env=dev</code></pre>

        <h2 class="section-title">4. Caché de Archivos Estáticos (CCC)</h2>
        <p>Combine, Compress and Cache (CCC) reduce el número de peticiones HTTP y el tamaño de los archivos.</p>
        <ul>
            <li><strong>Smart cache para CSS:</strong> Combina y minifica archivos CSS.</li>
            <li><strong>Smart cache para JavaScript:</strong> Combina y minifica archivos JS.</li>
            <li><strong>Optimización de Apache:</strong> Añade directivas al .htaccess para el caché del navegador.</li>
        </ul>

        <h2 class="section-title">Buenas Prácticas</h2>
        <ul>
            <li>Nunca desarrollar con la caché activada.</li>
            <li>Usar <code>_clearCache</code> en los hooks de actualización (add/update/delete) de los modelos.</li>
            <li>No abusar de la caché para datos que cambian muy frecuentemente o son específicos por usuario (como carritos), a menos que se gestione muy bien la clave de caché.</li>
            <li>Verificar que el servidor tenga configurado correctamente OPcache para el rendimiento de PHP.</li>
        </ul>
    </div>
`;

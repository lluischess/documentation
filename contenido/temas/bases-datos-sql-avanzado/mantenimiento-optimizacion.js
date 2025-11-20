// @ts-nocheck
const mantenimientoOptimizacionPrestaShop = `
    <div class="content-section">
        <h1 id="mantenimiento-optimizacion-prestashop">Mantenimiento y Optimización de PrestaShop</h1>
        <p>El mantenimiento regular y la optimización son cruciales para asegurar que una tienda PrestaShop funcione de manera rápida, segura y eficiente. Esta sección cubre las tareas esenciales para administradores y desarrolladores.</p>

        <h2 class="section-title">1. Gestión y Limpieza de la Caché</h2>
        <p>PrestaShop utiliza varios niveles de caché (Smarty, Symfony, Assets) para mejorar el rendimiento. Saber cuándo y cómo limpiarla es vital.</p>
        <ul>
            <li><strong>Caché de Smarty:</strong> Almacena plantillas compiladas. Limpiar tras cambios en TPL.</li>
            <li><strong>Caché de Symfony (var/cache):</strong> Contenedor de servicios, rutas, anotaciones. Limpiar tras cambios en configuración o código PHP core/módulos.</li>
            <li><strong>Caché de Assets (CCC):</strong> CSS y JS minificados. Limpiar tras cambios en estilos o scripts.</li>
        </ul>
        <pre><code class="language-bash"># Limpieza manual desde consola (recomendado)
php bin/console cache:clear
php bin/console cache:clear --env=prod</code></pre>

        <h2 class="section-title">2. Optimización de Base de Datos y Consultas</h2>
        <p>Una base de datos optimizada reduce los tiempos de carga y mejora la experiencia del usuario.</p>
        <ul>
            <li><strong>Limpieza de tablas de logs:</strong> <code>ps_connections</code>, <code>ps_guest</code>, <code>ps_pagenotfound</code> pueden crecer indefinidamente.</li>
            <li><strong>Optimización de tablas:</strong> Uso de <code>OPTIMIZE TABLE</code> para recuperar espacio no utilizado.</li>
            <li><strong>Índices faltantes:</strong> Identificar consultas lentas y añadir índices apropiados.</li>
        </ul>

        <h2 class="section-title">3. Monitorización de Rendimiento y Herramientas</h2>
        <p>Herramientas para medir y mejorar la velocidad de la tienda.</p>
        <ul>
            <li><strong>Profiler de Symfony:</strong> Activar modo debug para ver tiempos de ejecución, consultas SQL y uso de memoria.</li>
            <li><strong>Módulo de Google Analytics / GTM:</strong> Para métricas de usuario.</li>
            <li><strong>Herramientas externas:</strong> GTMetrix, PageSpeed Insights.</li>
        </ul>

        <h2 class="section-title">4. Actualizaciones y Migraciones de Versión</h2>
        <p>Estrategias para actualizar PrestaShop (Major/Minor) minimizando riesgos.</p>
        <ul>
            <li><strong>Módulo 1-Click Upgrade:</strong> Herramienta nativa para actualizaciones.</li>
            <li><strong>Actualización manual:</strong> Proceso paso a paso para mayor control.</li>
            <li><strong>Backups:</strong> Imprescindibles antes de cualquier operación (Archivos + BD).</li>
        </ul>

        <h2 class="section-title">5. Solución de Problemas Comunes y Depuración</h2>
        <p>Guía para resolver errores frecuentes (Pantalla blanca, Error 500).</p>
        <ul>
            <li><strong>Modo Debug:</strong> Activar en <code>config/defines.inc.php</code> (<code>_PS_MODE_DEV_</code> a <code>true</code>).</li>
            <li><strong>Logs del servidor:</strong> Revisar error.log de Apache/Nginx y PHP.</li>
        </ul>

        <h2 class="section-title">6. Gestión de Logs y Errores</h2>
        <p>Configuración y rotación de logs de PrestaShop.</p>
        <ul>
            <li><strong>Logs de PrestaShop:</strong> Visibles en Parámetros Avanzados > Registros.</li>
            <li><strong>Niveles de log:</strong> Configurar la severidad mínima a registrar.</li>
        </ul>

        <h2 class="section-title">7. Configuración de CRON Jobs</h2>
        <p>Automatización de tareas recurrentes.</p>
        <ul>
            <li><strong>Generación de sitemaps.</strong></li>
            <li><strong>Envío de emails en cola.</strong></li>
            <li><strong>Indexación de búsqueda.</strong></li>
            <li><strong>Alertas de stock.</strong></li>
        </ul>
        <pre><code class="language-bash"># Ejemplo de crontab
0 2 * * * curl "https://mitienda.com/admin/index.php?controller=AdminSearch&action=searchCron&token=..."</code></pre>
    </div>
`;

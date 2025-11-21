// @ts-nocheck
const actualizacionesMigraciones = `
    <div class="content-section">
        <h1 id="actualizaciones-migraciones">Actualizaciones y Migraciones de Versión (Major/Minor)</h1>
        <p>Mantener PrestaShop actualizado es crucial para seguridad, rendimiento y acceso a nuevas funcionalidades. Esta guía cubre el proceso completo de actualización desde versiones menores (8.1 → 8.2) hasta migraciones mayores (1.7 → 8.x).</p>

        <h2 class="section-title">1. Tipos de Actualizaciones</h2>

        <table class="table table-bordered">
            <thead class="table-dark">
                <tr>
                    <th width="20%">Tipo</th>
                    <th width="30%">Ejemplo</th>
                    <th width="25%">Complejidad</th>
                    <th width="25%">Riesgo</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Patch</strong></td>
                    <td>8.1.0 → 8.1.5</td>
                    <td>⭐ Baja</td>
                    <td>🟢 Bajo</td>
                </tr>
                <tr>
                    <td><strong>Minor</strong></td>
                    <td>8.1.x → 8.2.0</td>
                    <td>⭐⭐ Media</td>
                    <td>🟡 Medio</td>
                </tr>
                <tr>
                    <td><strong>Major</strong></td>
                    <td>1.7.x → 8.0.0</td>
                    <td>⭐⭐⭐⭐⭐ Alta</td>
                    <td>🔴 Alto</td>
                </tr>
            </tbody>
        </table>

        <div class="alert alert-warning">
            <strong>⚠️ Regla de Oro:</strong> Nunca actualizar directamente en producción. Siempre probar en entorno de desarrollo/staging primero.
        </div>

        <h2 class="section-title">2. Preparación Pre-Actualización</h2>

        <h3>2.1. Checklist Esencial</h3>

        <div class="card mb-3">
            <div class="card-header bg-primary text-white">✅ Pre-Actualización Checklist</div>
            <div class="card-body">
                <ol>
                    <li><strong>Backup completo</strong>
                        <ul>
                            <li>Base de datos (mysqldump)</li>
                            <li>Archivos del sitio (rsync/tar)</li>
                            <li>Configuración de servidor (nginx/apache)</li>
                        </ul>
                    </li>
                    <li><strong>Documentar versiones actuales</strong>
                        <ul>
                            <li>PrestaShop version</li>
                            <li>PHP version</li>
                            <li>MySQL/MariaDB version</li>
                            <li>Módulos instalados y sus versiones</li>
                            <li>Tema y su versión</li>
                        </ul>
                    </li>
                    <li><strong>Verificar compatibilidad</strong>
                        <ul>
                            <li>Requisitos de sistema de la nueva versión</li>
                            <li>Compatibilidad de módulos</li>
                            <li>Compatibilidad del tema</li>
                        </ul>
                    </li>
                    <li><strong>Probar en staging</strong></li>
                    <li><strong>Planificar ventana de mantenimiento</strong></li>
                    <li><strong>Preparar plan de rollback</strong></li>
                </ol>
            </div>
        </div>

        <h3>2.2. Scripts de Backup</h3>

        <pre><code class="language-bash">#!/bin/bash
# backup_prestashop.sh - Backup completo automatizado

SITE_PATH="/var/www/prestashop"
BACKUP_PATH="/backups/prestashop"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="prestashop"
DB_USER="root"
DB_PASS="password"

echo "Starting PrestaShop backup: $DATE"

# Crear directorio de backup
mkdir -p "$BACKUP_PATH/$DATE"

# 1. Backup de Base de Datos
echo "Backing up database..."
mysqldump -u $DB_USER -p$DB_PASS \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    $DB_NAME | gzip > "$BACKUP_PATH/$DATE/database.sql.gz"

# 2. Backup de archivos
echo "Backing up files..."
tar -czf "$BACKUP_PATH/$DATE/files.tar.gz" \
    -C $SITE_PATH \
    --exclude='var/cache/*' \
    --exclude='var/logs/*' \
    --exclude='img/tmp/*' \
    .

# 3. Backup de configuración
echo "Backing up configuration..."
cp /etc/nginx/sites-available/prestashop "$BACKUP_PATH/$DATE/nginx.conf"
cp /etc/php/8.1/fpm/pool.d/prestashop.conf "$BACKUP_PATH/$DATE/php-fpm.conf"

# 4. Guardar versiones
echo "Documenting versions..."
{
    echo "=== PrestaShop Version ==="
    grep "define('_PS_VERSION_'" "$SITE_PATH/config/config.inc.php"
    echo ""
    echo "=== PHP Version ==="
    php -v
    echo ""
    echo "=== MySQL Version ==="
    mysql --version
    echo ""
    echo "=== Installed Modules ==="
    mysql -u $DB_USER -p$DB_PASS -e "SELECT name, version FROM \${DB_NAME}\.ps_module WHERE active = 1"
} > "$BACKUP_PATH/$DATE/versions.txt"

# 5. Comprimir todo
cd "$BACKUP_PATH"
tar -czf "prestashop_backup_$DATE.tar.gz" "$DATE"
rm -rf "$DATE"

echo "Backup completed: prestashop_backup_$DATE.tar.gz"
echo "Size: $(du -h prestashop_backup_$DATE.tar.gz | cut -f1)"

# Limpiar backups antiguos (mantener últimos 7 días)
find "$BACKUP_PATH" -name "prestashop_backup_*.tar.gz" -mtime +7 -delete</code></pre>

        <h2 class="section-title">3. Método 1: Actualización con Módulo 1-Click Upgrade</h2>

        <h3>3.1. Instalación del Módulo</h3>

        <pre><code class="language-bash"># Descargar el módulo
cd /var/www/prestashop/modules
wget https://github.com/PrestaShop/autoupgrade/releases/latest/download/autoupgrade.zip
unzip autoupgrade.zip
rm autoupgrade.zip

# Ajustar permisos
chown -R www-data:www-data autoupgrade/
chmod -R 755 autoupgrade/</code></pre>

        <h3>3.2. Configuración del Módulo</h3>

        <pre><code class="language-php"><?php
// modules/autoupgrade/config.xml (ejemplo)
<autoupgrade>
    <channel>major</channel>  <!-- major, minor, patch -->
    <skip_backup>0</skip_backup>
    <backup_name>auto_backup</backup_name>
    <backup_all>1</backup_all>
    <deactivate_custom_modules>1</deactivate_custom_modules>
    <disable_all_overrides>0</disable_all_overrides>
    <regenerate_email_templates>1</regenerate_email_templates>
</autoupgrade>
</code></pre>

        <h3>3.3. Proceso de Actualización via BO</h3>

        <pre><code class="language-plaintext">Back Office > Módulos > Module Manager
└── Buscar "1-Click Upgrade"
    ├── Instalar
    ├── Configurar
    │   ├── Seleccionar canal (major/minor/patch)
    │   ├── Configurar backup
    │   └── Opciones avanzadas
    └── Iniciar actualización
        ├── Verificación de requisitos
        ├── Backup automático
        ├── Descarga de archivos
        ├── Actualización de archivos
        ├── Actualización de BD
        ├── Actualización de tema
        └── Limpieza de caché</code></pre>

        <div class="alert alert-info">
            <strong>💡 Ventajas del 1-Click Upgrade:</strong>
            <ul class="mb-0">
                <li>Proceso guiado paso a paso</li>
                <li>Backup automático integrado</li>
                <li>Rollback automático en caso de error</li>
                <li>Verificación de requisitos pre-actualización</li>
                <li>Recomendado para usuarios sin experiencia técnica</li>
            </ul>
        </div>

        <h2 class="section-title">4. Método 2: Actualización Manual</h2>

        <h3>4.1. Proceso Paso a Paso</h3>

        <pre><code class="language-bash">#!/bin/bash
# manual_upgrade.sh - Actualización manual de PrestaShop

OLD_VERSION="8.1.0"
NEW_VERSION="8.2.0"
SITE_PATH="/var/www/prestashop"
TEMP_PATH="/tmp/prestashop_upgrade"

echo "=== PrestaShop Manual Upgrade: $OLD_VERSION → $NEW_VERSION ==="

# 1. Activar modo mantenimiento
echo "Enabling maintenance mode..."
touch "$SITE_PATH/maintenance.php"

# 2. Backup (ya hecho previamente)
echo "Ensure backup is complete before continuing..."
read -p "Press enter to continue..."

# 3. Descargar nueva versión
echo "Downloading PrestaShop $NEW_VERSION..."
mkdir -p $TEMP_PATH
cd $TEMP_PATH
wget "https://github.com/PrestaShop/PrestaShop/releases/download/$NEW_VERSION/prestashop_$NEW_VERSION.zip"
unzip "prestashop_$NEW_VERSION.zip"
unzip prestashop.zip -d prestashop_new

# 4. Comparar y copiar archivos
echo "Copying new files..."
rsync -av --exclude='config/' \
         --exclude='themes/' \
         --exclude='modules/' \
         --exclude='override/' \
         --exclude='img/' \
         --exclude='download/' \
         --exclude='upload/' \
         prestashop_new/ $SITE_PATH/

# 5. Copiar archivos específicos si es necesario
cp prestashop_new/install/upgrade/php/update_translations.php $SITE_PATH/install/upgrade/php/

# 6. Ajustar permisos
echo "Setting permissions..."
chown -R www-data:www-data $SITE_PATH/
find $SITE_PATH/ -type d -exec chmod 755 {} \;
find $SITE_PATH/ -type f -exec chmod 644 {} \;

# 7. Ejecutar script de actualización de BD
echo "Upgrading database..."
php $SITE_PATH/install/upgrade/upgrade.php

# 8. Limpiar caché
echo "Clearing cache..."
rm -rf $SITE_PATH/var/cache/prod/*
rm -rf $SITE_PATH/var/cache/dev/*
php $SITE_PATH/bin/console cache:clear --env=prod

# 9. Regenerar assets
php $SITE_PATH/bin/console prestashop:update:assets

# 10. Desactivar modo mantenimiento
echo "Disabling maintenance mode..."
rm $SITE_PATH/maintenance.php

echo "=== Upgrade completed ==="
echo "Please verify the site manually"</code></pre>

        <h3>4.2. Actualización de Base de Datos</h3>

        <pre><code class="language-php"><?php
// install/upgrade/php/custom_upgrade.php
// Script personalizado de actualización de BD

function upgrade_module_custom()
{
    $db = Db::getInstance();
    
    // Añadir nueva columna si no existe
    $sql = "SELECT COUNT(*) 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = '" . _DB_NAME_ . "' 
                AND TABLE_NAME = '" . _DB_PREFIX_ . "product' 
                AND COLUMN_NAME = 'new_field'";
    
    if (!$db->getValue($sql)) {
        $db->execute("ALTER TABLE \`" . _DB_PREFIX_ . "product\` 
            ADD COLUMN \`new_field\` VARCHAR(255) DEFAULT NULL");
    }
    
    // Migrar datos si es necesario
    $db->execute("UPDATE \`" . _DB_PREFIX_ . "product\` 
        SET \`new_field\` = \`old_field\` 
        WHERE \`new_field\` IS NULL");
    
    return true;
}
</code></pre>

        <h2 class="section-title">5. Actualización Major (1.7.x → 8.x)</h2>

        <h3>5.1. Consideraciones Especiales</h3>

        <div class="alert alert-danger">
            <strong>🚨 Cambios Importantes en PrestaShop 8:</strong>
            <ul class="mb-0">
                <li><strong>PHP 7.2.5+ requerido</strong> (recomendado 8.1+)</li>
                <li><strong>Symfony 4.4 → 5.4</strong> (componentes actualizados)</li>
                <li><strong>Nuevo sistema de módulos</strong></li>
                <li><strong>Namespace changes</strong> en clases core</li>
                <li><strong>Deprecaciones</strong> de métodos antiguos</li>
                <li><strong>Cambios en structure de BD</strong></li>
            </ul>
        </div>

        <h3>5.2. Checklist Adicional para Major Upgrade</h3>

        <ol>
            <li><strong>Actualizar PHP primero</strong>
                <pre><code class="language-bash"># Ubuntu/Debian
apt-get update
apt-get install php8.1-fpm php8.1-mysql php8.1-xml php8.1-zip php8.1-gd php8.1-curl php8.1-intl php8.1-mbstring
systemctl restart php8.1-fpm</code></pre>
            </li>
            <li><strong>Verificar compatibilidad de módulos</strong>
                <ul>
                    <li>Descargar versiones compatibles con PS 8</li>
                    <li>Desactivar módulos incompatibles temporalmente</li>
                    <li>Contactar con desarrolladores si es necesario</li>
                </ul>
            </li>
            <li><strong>Actualizar tema</strong>
                <ul>
                    <li>Classic theme compatible por defecto</li>
                    <li>Temas custom requieren adaptación</li>
                    <li>Verificar templates Smarty/Twig</li>
                </ul>
            </li>
            <li><strong>Revisar overrides</strong>
                <pre><code class="language-bash"># Listar todos los overrides
find override/ -name "*.php" -type f</code></pre>
            </li>
        </ol>

        <h3>5.3. Migración de Módulos Custom</h3>

        <pre><code class="language-php"><?php
// Actualizar namespace de PrestaShop 1.7 a 8
// ANTES (1.7)
use PrestaShop\\PrestaShop\\Adapter\\ServiceLocator;

// DESPUÉS (8.0+)
use PrestaShop\\PrestaShop\\Adapter\\ContainerBuilder;

// Actualizar métodos deprecados
// ANTES
$this->context->controller->addCSS(...);

// DESPUÉS
$this->context->controller->registerStylesheet(...);

// Actualizar constructores de módulo
class MyModule extends Module
{
    public function __construct()
    {
        $this->name = 'mymodule';
        $this->version = '2.0.0';
        $this->author = 'My Company';
        $this->ps_versions_compliancy = [
            'min' => '8.0.0',
            'max' => '8.99.99',
        ];
        
        parent::__construct();
    }
}
</code></pre>

        <h2 class="section-title">6. Testing Post-Actualización</h2>

        <h3>6.1. Verificaciones Manuales</h3>

        <table class="table table-bordered">
            <thead class="table-dark">
                <tr>
                    <th width="30%">Área</th>
                    <th width="70%">Qué Verificar</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Front Office</strong></td>
                    <td>
                        <ul class="mb-0">
                            <li>Home page carga correctamente</li>
                            <li>Navegación de categorías</li>
                            <li>Páginas de producto</li>
                            <li>Proceso de checkout completo</li>
                            <li>Registro de usuario</li>
                            <li>Login de usuario</li>
                            <li>Búsqueda</li>
                        </ul>
                    </td>
                </tr>
                <tr>
                    <td><strong>Back Office</strong></td>
                    <td>
                        <ul class="mb-0">
                            <li>Login administrativo</li>
                            <li>Dashboard carga sin errores</li>
                            <li>Gestión de productos</li>
                            <li>Gestión de pedidos</li>
                            <li>Gestión de clientes</li>
                            <li>Configuración</li>
                            <li>Módulos funcionan</li>
                        </ul>
                    </td>
                </tr>
                <tr>
                    <td><strong>Funcionalidades</strong></td>
                    <td>
                        <ul class="mb-0">
                            <li>Emails se envían correctamente</li>
                            <li>Pagos funcionan (test mode)</li>
                            <li>Stock se actualiza</li>
                            <li>Cron jobs ejecutan</li>
                            <li>Multi-idioma funciona</li>
                            <li>Multi-tienda si aplica</li>
                        </ul>
                    </td>
                </tr>
            </tbody>
        </table>

        <h3>6.2. Tests Automatizados</h3>

        <pre><code class="language-bash"># Tests de humo básicos
#!/bin/bash

SITE_URL="https://mitienda.com"

echo "Running post-upgrade smoke tests..."

# Test 1: Home page
response=$(curl -s -o /dev/null -w "%{http_code}" $SITE_URL)
if [ "$response" == "200" ]; then
    echo "✓ Home page OK"
else
    echo "✗ Home page FAILED (HTTP $response)"
fi

# Test 2: Product page
response=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL/en/2-home")
if [ "$response" == "200" ]; then
    echo "✓ Category page OK"
else
    echo "✗ Category page FAILED"
fi

# Test 3: Backend accessible
response=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL/admin")
if [ "$response" == "200" ] || [ "$response" == "302" ]; then
    echo "✓ Backend accessible"
else
    echo "✗ Backend FAILED"
fi

# Test 4: Database connection
php -r "
require_once 'config/config.inc.php';
if (Db::getInstance()->getRow('SELECT 1')) {
    echo '✓ Database connection OK\n';
} else {
    echo '✗ Database connection FAILED\n';
}"</code></pre>

        <h2 class="section-title">7. Rollback en Caso de Error</h2>

        <h3>7.1. Procedimiento de Rollback</h3>

        <pre><code class="language-bash">#!/bin/bash
# rollback_prestashop.sh

BACKUP_FILE="/backups/prestashop/prestashop_backup_20240115_120000.tar.gz"
SITE_PATH="/var/www/prestashop"
DB_NAME="prestashop"
DB_USER="root"
DB_PASS="password"

echo "=== PrestaShop Rollback ==="
echo "WARNING: This will restore the site to a previous state"
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Rollback cancelled"
    exit 1
fi

# 1. Activar mantenimiento
touch "$SITE_PATH/maintenance.php"

# 2. Eliminar archivos actuales
echo "Removing current files..."
rm -rf $SITE_PATH/*

# 3. Restaurar archivos desde backup
echo "Restoring files from backup..."
tar -xzf "$BACKUP_FILE" -C /tmp/
tar -xzf "/tmp/files.tar.gz" -C $SITE_PATH/

# 4. Restaurar base de datos
echo "Restoring database..."
gunzip < "/tmp/database.sql.gz" | mysql -u $DB_USER -p$DB_PASS $DB_NAME

# 5. Ajustar permisos
chown -R www-data:www-data $SITE_PATH/

# 6. Limpiar caché
rm -rf $SITE_PATH/var/cache/*/*

# 7. Desactivar mantenimiento
rm $SITE_PATH/maintenance.php

echo "=== Rollback completed ==="</code></pre>

        <h2 class="section-title">8. Mejores Prácticas</h2>

        <div class="row">
            <div class="col-md-6">
                <div class="card border-success mb-3">
                    <div class="card-header bg-success text-white">✅ Hacer</div>
                    <div class="card-body">
                        <ul>
                            <li>Siempre hacer backup completo</li>
                            <li>Probar en staging primero</li>
                            <li>Actualizar en horarios de bajo tráfico</li>
                            <li>Leer release notes completas</li>
                            <li>Verificar compatibilidad de módulos</li>
                            <li>Tener plan de rollback preparado</li>
                            <li>Documentar todo el proceso</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card border-danger mb-3">
                    <div class="card-header bg-danger text-white">❌ Evitar</div>
                    <div class="card-body">
                        <ul>
                            <li>Actualizar directamente en producción</li>
                            <li>Saltar versiones (1.7.5 → 8.2)</li>
                            <li>No hacer backup</li>
                            <li>Ignorar requisitos de sistema</li>
                            <li>Actualizar sin probar módulos</li>
                            <li>No leer la documentación</li>
                            <li>Hacerlo en horas pico</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <div class="alert alert-info">
            <strong>🎯 Timeline Típico de Actualización:</strong>
            <ul class="mb-0">
                <li><strong>Día 1-3:</strong> Preparación y backup</li>
                <li><strong>Día 4-5:</strong> Actualización en staging</li>
                <li><strong>Día 6-10:</strong> Testing exhaustivo</li>
                <li><strong>Día 11:</strong> Actualización en producción (si todo OK)</li>
                <li><strong>Día 12-14:</strong> Monitorización intensiva</li>
            </ul>
        </div>

        <h3>8.1. Recursos Oficiales</h3>

        <ul>
            <li><strong>Documentación Oficial:</strong> <a href="https://devdocs.prestashop-project.org/" target="_blank">devdocs.prestashop-project.org</a></li>
            <li><strong>Release Notes:</strong> <a href="https://github.com/PrestaShop/PrestaShop/releases" target="_blank">GitHub Releases</a></li>
            <li><strong>Foro de Soporte:</strong> <a href="https://www.prestashop.com/forums/" target="_blank">PrestaShop Forums</a></li>
            <li><strong>Slack Community:</strong> <a href="https://www.prestashop-project.org/slack/" target="_blank">PrestaShop Slack</a></li>
        </ul>
    </div>
`;

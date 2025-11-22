// @ts-nocheck
const seguridadBDPermisos = `
    <div class="content-section">
        <h1 id="seguridad-bd">Seguridad de Bases de Datos y Permisos</h1>
        <p>Implementar una configuración segura de MySQL/MariaDB es crítico para proteger los datos de PrestaShop 8.9+. Esta guía cubre configuración de permisos, hardening y mejores prácticas de seguridad.</p>

        <h2 class="section-title">1. Principio de Mínimo Privilegio</h2>

        <pre><code class="language-sql">-- Usuario para PrestaShop (solo base de datos específica)
CREATE USER 'prestashop_user'@'localhost' IDENTIFIED BY 'StrongPassword123!';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER
ON prestashop.* TO 'prestashop_user'@'localhost';
FLUSH PRIVILEGES;

-- Usuario solo lectura (para reportes)
CREATE USER 'prestashop_ro'@'localhost' IDENTIFIED BY 'ReadOnlyPass123!';
GRANT SELECT ON prestashop.* TO 'prestashop_ro'@'localhost';
FLUSH PRIVILEGES;

-- Usuario para backups
CREATE USER 'backup_user'@'localhost' IDENTIFIED BY 'BackupPass123!';
GRANT SELECT, LOCK TABLES, SHOW VIEW, EVENT, TRIGGER
ON prestashop.* TO 'backup_user'@'localhost';
FLUSH PRIVILEGES;
</code></pre>

        <h2 class="section-title">2. Auditar Usuarios y Permisos</h2>

        <pre><code class="language-sql">-- Ver todos los usuarios
SELECT user, host FROM mysql.user;

-- Ver permisos de usuario específico
SHOW GRANTS FOR 'prestashop_user'@'localhost';

-- Revocar permisos innecesarios
REVOKE ALL PRIVILEGES ON *.* FROM 'prestashop_user'@'localhost';

-- Eliminar usuarios sin usar
DROP USER 'old_user'@'localhost';

-- Ver usuarios con acceso global (potencial riesgo)
SELECT user, host FROM mysql.user WHERE Select_priv='Y';
</code></pre>

        <h2 class="section-title">3. Hardening de MySQL</h2>

        <pre><code class="language-ini"># /etc/mysql/my.cnf - Configuración segura

[mysqld]
# Deshabilitar root remoto
skip-networking=0
bind-address=127.0.0.1

# Deshabilitar LOAD DATA LOCAL
local-infile=0

# Deshabilitar comandos del sistema
skip-symbolic-links=1

# Logs de auditoría
log_error=/var/log/mysql/error.log
general_log=0
general_log_file=/var/log/mysql/mysql.log

# SSL/TLS
require_secure_transport=ON
ssl-ca=/etc/mysql/ssl/ca.pem
ssl-cert=/etc/mysql/ssl/server-cert.pem
ssl-key=/etc/mysql/ssl/server-key.pem
</code></pre>

        <h2 class="section-title">4. Configurar SSL/TLS</h2>

        <pre><code class="language-bash"># Generar certificados
mysql_ssl_rsa_setup --datadir=/var/lib/mysql

# Verificar SSL activo
mysql -u root -p -e "SHOW VARIABLES LIKE '%ssl%';"

# Forzar SSL para usuario
ALTER USER 'prestashop_user'@'localhost' REQUIRE SSL;
</code></pre>

        <pre><code class="language-php"><?php
// Conectar con SSL en PrestaShop
// config/defines.inc.php

define('_DB_SERVER_', 'localhost');
define('_DB_NAME_', 'prestashop');
define('_DB_USER_', 'prestashop_user');
define('_DB_PASSWD_', 'StrongPassword123!');

// SSL options
define('_PS_USE_SQL_SLAVE_', false);
define('_PS_MYSQL_SSL_', true);
define('_PS_MYSQL_SSL_CA_', '/etc/mysql/ssl/ca.pem');
</code></pre>

        <h2 class="section-title">5. Prevención de SQL Injection</h2>

        <pre><code class="language-php"><?php
// NUNCA hacer esto (vulnerable)
$id = $_GET['id'];
$sql = "SELECT * FROM ps_product WHERE id_product = $id";

// ✅ CORRECTO: Usar Prepared Statements
$id = (int)$_GET['id'];
$sql = 'SELECT * FROM ' . _DB_PREFIX_ . 'product WHERE id_product = ' . (int)$id;

// O usar Db::getInstance() de PrestaShop
$db = Db::getInstance();
$result = $db->getRow('
    SELECT * FROM ' . _DB_PREFIX_ . 'product 
    WHERE id_product = ' . (int)$id
);

// Con placeholder (más seguro)
$stmt = $pdo->prepare('SELECT * FROM ps_product WHERE id_product = :id');
$stmt->execute(['id' => $id]);
</code></pre>

        <h2 class="section-title">6. Cifrado de Datos Sensibles</h2>

        <pre><code class="language-sql">-- Cifrar columnas sensibles
ALTER TABLE ps_customer 
ADD COLUMN email_encrypted VARBINARY(255);

-- Cifrar datos
UPDATE ps_customer 
SET email_encrypted = AES_ENCRYPT(email, 'encryption_key_here');

-- Descifrar
SELECT 
    id_customer,
    AES_DECRYPT(email_encrypted, 'encryption_key_here') AS email
FROM ps_customer;
</code></pre>

        <h2 class="section-title">7. Auditoría y Logging</h2>

        <pre><code class="language-sql">-- Habilitar audit log (MariaDB)
INSTALL SONAME 'server_audit';

SET GLOBAL server_audit_logging = ON;
SET GLOBAL server_audit_events = 'CONNECT,QUERY_DDL,QUERY_DML';
SET GLOBAL server_audit_file_path = '/var/log/mysql/audit.log';

-- Ver logs
SELECT * FROM mysql.general_log WHERE command_type = 'Query' LIMIT 10;
</code></pre>

        <h2 class="section-title">8. Firewall de Base de Datos</h2>

        <pre><code class="language-bash"># iptables - Solo permitir desde servidor web
iptables -A INPUT -p tcp --dport 3306 -s 192.168.1.100 -j ACCEPT
iptables -A INPUT -p tcp --dport 3306 -j DROP

# UFW
ufw allow from 192.168.1.100 to any port 3306
ufw deny 3306
</code></pre>

        <h2 class="section-title">9. Checklist de Seguridad</h2>

        <div class="card mb-3">
            <div class="card-header bg-warning">🔒 Security Checklist</div>
            <div class="card-body">
                <ul class="mb-0">
                    <li>☐ Contraseñas fuertes (mínimo 16 caracteres)</li>
                    <li>☐ Usuario root sin acceso remoto</li>
                    <li>☐ SSL/TLS habilitado</li>
                    <li>☐ Permisos mínimos por usuario</li>
                    <li>☐ Firewall configurado (puerto 3306)</li>
                    <li>☐ Backups cifrados</li>
                    <li>☐ Audit logging activado</li>
                    <li>☐ Actualizaciones de seguridad aplicadas</li>
                    <li>☐ Datos sensibles cifrados</li>
                    <li>☐ Monitorización de accesos sospechosos</li>
                </ul>
            </div>
        </div>

        <h2 class="section-title">10. Mejores Prácticas</h2>

        <div class="row">
            <div class="col-md-6">
                <div class="card border-success mb-3">
                    <div class="card-header bg-success text-white">✅ Hacer</div>
                    <div class="card-body">
                        <ul>
                            <li>Rotar contraseñas regularmente</li>
                            <li>Auditar permisos mensualmente</li>
                            <li>Usar SSL para conexiones</li>
                            <li>Cifrar backups</li>
                            <li>Monitorizar intentos de acceso</li>
                            <li>Mantener MySQL actualizado</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card border-danger mb-3">
                    <div class="card-header bg-danger text-white">❌ Evitar</div>
                    <div class="card-body">
                        <ul>
                            <li>Contraseñas débiles o por defecto</li>
                            <li>Root con acceso remoto</li>
                            <li>Permisos GRANT ALL sin necesidad</li>
                            <li>Conexiones sin cifrar</li>
                            <li>Usuarios compartidos entre aplicaciones</li>
                            <li>SQL injection sin sanitizar</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <div class="alert alert-danger">
            <strong>🚨 Crítico:</strong> Cambiar contraseñas por defecto, deshabilitar root remoto y usar SSL son los tres pasos mínimos obligatorios para cualquier entorno de producción.
        </div>
    </div>
`;

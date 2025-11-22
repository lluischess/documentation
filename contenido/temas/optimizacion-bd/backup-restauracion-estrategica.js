// @ts-nocheck
const backupRestauracionEstrategica = `
    <div class="content-section">
        <h1 id="backup-restauracion">Backup y Restauración Estratégica</h1>
        <p>Implementar una estrategia sólida de backup es crítico para la continuidad del negocio en PrestaShop 8.9+. Esta guía cubre métodos de backup, restauración y mejores prácticas.</p>

        <h2 class="section-title">1. Tipos de Backup</h2>

        <table class="table table-bordered">
            <thead class="table-dark">
                <tr>
                    <th>Tipo</th>
                    <th>Descripción</th>
                    <th>Frecuencia</th>
                    <th>Ventaja</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Completo</strong></td>
                    <td>Toda la base de datos</td>
                    <td>Diario/Semanal</td>
                    <td>Restauración simple</td>
                </tr>
                <tr>
                    <td><strong>Incremental</strong></td>
                    <td>Solo cambios desde último backup</td>
                    <td>Cada hora</td>
                    <td>Espacio mínimo</td>
                </tr>
                <tr>
                    <td><strong>Diferencial</strong></td>
                    <td>Cambios desde último completo</td>
                    <td>Cada 6h</td>
                    <td>Balance espacio/velocidad</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">2. Backup con mysqldump</h2>

        <pre><code class="language-bash"># Backup completo
mysqldump -u root -p prestashop \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    | gzip > backup_\$(date +%Y%m%d_%H%M%S).sql.gz

# Backup solo estructura (sin datos)
mysqldump -u root -p prestashop \
    --no-data \
    > estructura.sql

# Backup solo datos
mysqldump -u root -p prestashop \
    --no-create-info \
    --skip-triggers \
    > datos.sql

# Backup excluyen tablas grandes
mysqldump -u root -p prestashop \
    --ignore-table=prestashop.ps_log \
    --ignore-table=prestashop.ps_connections \
    | gzip > backup_sin_logs.sql.gz
</code></pre>

        <h2 class="section-title">3. Backup Automatizado</h2>

        <pre><code class="language-bash">#!/bin/bash
# /usr/local/bin/backup_prestashop.sh

DB_NAME="prestashop"
DB_USER="root"
DB_PASS="password"
BACKUP_DIR="/backups/mysql"
RETENTION_DAYS=7

# Crear directorio con fecha
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/$DATE"
mkdir -p "$BACKUP_PATH"

# Backup completo
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME \
    --single-transaction \
    --routines \
    --triggers \
    | gzip > "$BACKUP_PATH/database.sql.gz"

# Verificar backup
if [ $? -eq 0 ]; then
    echo "Backup exitoso: $BACKUP_PATH/database.sql.gz"
    # Limpiar backups antiguos
    find $BACKUP_DIR -type d -mtime +$RETENTION_DAYS -exec rm -rf {} \;
else
    echo "Error en backup!" | mail -s "Backup Failed" admin@example.com
    exit 1
fi
</code></pre>

        <pre><code class="language-bash"># Añadir a crontab
0 2 * * * /usr/local/bin/backup_prestashop.sh >> /var/log/backup.log 2>&1
</code></pre>

        <h2 class="section-title">4. Restauración</h2>

        <pre><code class="language-bash"># Restaurar desde backup
gunzip < backup_20240115_020000.sql.gz | mysql -u root -p prestashop

# Restaurar tabla específica
mysql -u root -p prestashop < tabla_backup.sql

# Restaurar con progreso
pv backup.sql.gz | gunzip | mysql -u root -p prestashop
</code></pre>

        <h2 class="section-title">5. Backup con Percona XtraBackup</h2>

        <pre><code class="language-bash"># Instalar
apt-get install percona-xtrabackup-80

# Backup completo (hot backup, sin bloqueo)
xtrabackup --backup \
    --user=root \
    --password=password \
    --target-dir=/backups/full

# Preparar backup
xtrabackup --prepare --target-dir=/backups/full

# Restaurar
systemctl stop mysql
rm -rf /var/lib/mysql/*
xtrabackup --copy-back --target-dir=/backups/full
chown -R mysql:mysql /var/lib/mysql
systemctl start mysql
</code></pre>

        <h2 class="section-title">6. Backup en la Nube</h2>

        <pre><code class="language-bash"># AWS S3
apt-get install awscli

# Subir backup
aws s3 cp backup.sql.gz s3://mi-bucket/backups/

# Script automático con S3
mysqldump -u root -p prestashop | gzip | \
    aws s3 cp - s3://mi-bucket/backups/backup_\$(date +%Y%m%d).sql.gz

# Google Cloud Storage
gsutil cp backup.sql.gz gs://mi-bucket/backups/
</code></pre>

        <h2 class="section-title">7. Verificación de Backups</h2>

        <pre><code class="language-bash">#!/bin/bash
# Verificar integridad del backup

BACKUP_FILE="backup.sql.gz"

# Verificar archivo no corrupto
gunzip -t "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "Backup integrity OK"
    
    # Test restore en BD temporal
    mysql -u root -p -e "CREATE DATABASE test_restore;"
    gunzip < "$BACKUP_FILE" | mysql -u root -p test_restore
    
    # Verificar tablas
    TABLES=\$(mysql -u root -p test_restore -e "SHOW TABLES;" | wc -l)
    echo "Tables restored: $TABLES"
    
    # Limpiar
    mysql -u root -p -e "DROP DATABASE test_restore;"
else
    echo "Backup corrupted!" | mail -s "Backup Verification Failed" admin@example.com
fi
</code></pre>

        <h2 class="section-title">8. Estrategia 3-2-1</h2>

        <div class="alert alert-info">
            <strong>📋 Regla 3-2-1 para Backups:</strong>
            <ul class="mb-0">
                <li><strong>3</strong> copias de tus datos</li>
                <li><strong>2</strong> tipos de medios diferentes</li>
                <li><strong>1</strong> copia offsite (fuera del servidor)</li>
            </ul>
        </div>

        <h2 class="section-title">9. Mejores Prácticas</h2>

        <div class="row">
            <div class="col-md-6">
                <div class="card border-success mb-3">
                    <div class="card-header bg-success text-white">✅ Hacer</div>
                    <div class="card-body">
                        <ul>
                            <li>Backups automatizados diarios</li>
                            <li>Probar restauraciones mensualmente</li>
                            <li>Múltiples copias (local + cloud)</li>
                            <li>Monitorizar éxito de backups</li>
                            <li>Documentar procedimientos</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card border-danger mb-3">
                    <div class="card-header bg-danger text-white">❌ Evitar</div>
                    <div class="card-body">
                        <ul>
                            <li>Backups solo en producción</li>
                            <li>No verificar integridad</li>
                            <li>Backups sin cifrar datos sensibles</li>
                            <li>No probar restauraciones</li>
                            <li>Retención indefinida (costos)</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Importante:</strong> Probar el proceso de restauración es tan importante como hacer el backup. Un backup no verificado es un backup inútil.
        </div>
    </div>
`;

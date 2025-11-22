// @ts-nocheck
const phpCodeSnifferPSR12 = `
    <div class="content-section">
        <h1 id="php-codesniffer-psr12">PHP_CodeSniffer para Estándares de Codificación (PSR-12)</h1>
        <p>Herramienta para verificar y corregir automáticamente el cumplimiento de estándares de codificación PSR-12 en PrestaShop 8.9+.</p>

        <h2 class="section-title">1. ¿Qué es PHP_CodeSniffer?</h2>

        <div class="alert alert-info">
            <strong>🎨 PHP_CodeSniffer (PHPCS):</strong>
            <ul class="mb-0">
                <li><strong>phpcs:</strong> Detecta violaciones de estándares</li>
                <li><strong>phpcbf:</strong> Corrige automáticamente violaciones</li>
                <li>Soporta PSR-1, PSR-2, PSR-12</li>
                <li>Reglas personalizables (custom rulesets)</li>
                <li>Integración con IDEs</li>
                <li>Reportes en múltiples formatos</li>
            </ul>
        </div>

        <h2 class="section-title">2. Instalación</h2>

        <pre><code class="language-bash"># Instalar PHPCS
composer require --dev squizlabs/php_codesniffer

# Verificar instalación
vendor/bin/phpcs --version
vendor/bin/phpcbf --version

# Ver estándares disponibles
vendor/bin/phpcs -i
# Output: PSR1, PSR2, PSR12, PEAR, Squiz, Zend
</code></pre>

        <h2 class="section-title">3. Estándares PSR</h2>

        <table>
            <thead>
                <tr>
                    <th>Estándar</th>
                    <th>Descripción</th>
                    <th>Uso</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>PSR-1</strong></td>
                    <td>Coding Standard básico</td>
                    <td>Mínimo requerido</td>
                </tr>
                <tr>
                    <td><strong>PSR-2</strong></td>
                    <td>Coding Style Guide (deprecated)</td>
                    <td>Legado</td>
                </tr>
                <tr>
                    <td><strong>PSR-12</strong></td>
                    <td>Extended Coding Style (reemplaza PSR-2)</td>
                    <td>Recomendado actual</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">4. Configuración Básica</h2>

        <pre><code class="language-xml">&lt;?xml version="1.0"?&gt;
&lt;!-- phpcs.xml --&gt;
&lt;ruleset name="PrestaShop Custom"&gt;
    &lt;description&gt;Custom coding standard for PrestaShop modules&lt;/description&gt;
    
    &lt;!-- Usar PSR-12 como base --&gt;
    &lt;rule ref="PSR12"/&gt;
    
    &lt;!-- Archivos a analizar --&gt;
    &lt;file&gt;modules/mymodule&lt;/file&gt;
    &lt;file&gt;override&lt;/file&gt;
    
    &lt;!-- Excluir directorios --&gt;
    &lt;exclude-pattern&gt;*/vendor/*&lt;/exclude-pattern&gt;
    &lt;exclude-pattern&gt;*/tests/*&lt;/exclude-pattern&gt;
    &lt;exclude-pattern&gt;*/cache/*&lt;/exclude-pattern&gt;
    
    &lt;!-- PHP version --&gt;
    &lt;config name="php_version" value="80100"/&gt;
    
    &lt;!-- Encoding --&gt;
    &lt;arg name="encoding" value="utf-8"/&gt;
    
    &lt;!-- Progress --&gt;
    &lt;arg value="p"/&gt;
    
    &lt;!-- Colors --&gt;
    &lt;arg name="colors"/&gt;
&lt;/ruleset&gt;
</code></pre>

        <h2 class="section-title">5. PSR-12 Principales Reglas</h2>

        <h3>5.1. Indentación y Espaciado</h3>

        <pre><code class="language-php"><?php
// ✅ Correcto
class ProductService
{
    public function getProduct(int $id): Product
    {
        if ($id > 0) {
            return new Product($id);
        }
        
        throw new Exception('Invalid ID');
    }
}

// ❌ Incorrecto (tabs en lugar de 4 espacios)
class ProductService
{
\tpublic function getProduct(int $id): Product
\t{
\t\tif($id>0){
\t\t\treturn new Product($id);
\t\t}
\t\tthrow new Exception('Invalid ID');
\t}
}
</code></pre>

        <h3>5.2. Declaraciones de Clases</h3>

        <pre><code class="language-php"><?php
// ✅ Correcto
declare(strict_types=1);

namespace MyModule\\Service;

use Product;
use PrestaShopException;

class ProductService extends BaseService implements ServiceInterface
{
    private int $idLang;
    
    public function __construct(int $idLang)
    {
        $this->idLang = $idLang;
    }
}

// ❌ Incorrecto
namespace MyModule\\Service;
use Product;use PrestaShopException;  // En una línea

class ProductService extends BaseService implements ServiceInterface {  // Llave en misma línea
    private $idLang;  // Sin type hint
    
    public function __construct($idLang) {
        $this->idLang = $idLang;
    }
}
</code></pre>

        <h3>5.3. Métodos y Funciones</h3>

        <pre><code class="language-php"><?php
// ✅ Correcto
public function updateProduct(
    int $idProduct,
    string $name,
    float $price,
    bool $active = true
): bool {
    $product = new Product($idProduct);
    $product->name = $name;
    $product->price = $price;
    $product->active = $active;
    
    return $product->save();
}

// ❌ Incorrecto
public function updateProduct(int $idProduct, string $name, float $price, bool $active = true): bool {  // Muy largo
    $product = new Product($idProduct);
    $product->name = $name;$product->price = $price;  // Dos statements en una línea
    return $product->save();
}
</code></pre>

        <h2 class="section-title">6. Configuración Avanzada PrestaShop</h2>

        <pre><code class="language-xml">&lt;?xml version="1.0"?&gt;
&lt;ruleset name="PrestaShop Advanced"&gt;
    &lt;description&gt;Advanced coding standard&lt;/description&gt;
    
    &lt;!-- Base PSR-12 --&gt;
    &lt;rule ref="PSR12"&gt;
        &lt;!-- Excepciones para PrestaShop legacy --&gt;
        &lt;exclude name="PSR1.Classes.ClassDeclaration.MissingNamespace"/&gt;
        &lt;exclude name="PSR2.Methods.MethodDeclaration.Underscore"/&gt;
    &lt;/rule&gt;
    
    &lt;!-- Longitud de línea --&gt;
    &lt;rule ref="Generic.Files.LineLength"&gt;
        &lt;properties&gt;
            &lt;property name="lineLimit" value="120"/&gt;
            &lt;property name="absoluteLineLimit" value="150"/&gt;
        &lt;/properties&gt;
    &lt;/rule&gt;
    
    &lt;!-- Complejidad ciclomática --&gt;
    &lt;rule ref="Generic.Metrics.CyclomaticComplexity"&gt;
        &lt;properties&gt;
            &lt;property name="complexity" value="10"/&gt;
            &lt;property name="absoluteComplexity" value="15"/&gt;
        &lt;/properties&gt;
    &lt;/rule&gt;
    
    &lt;!-- Nesting level --&gt;
    &lt;rule ref="Generic.Metrics.NestingLevel"&gt;
        &lt;properties&gt;
            &lt;property name="nestingLevel" value="3"/&gt;
            &lt;property name="absoluteNestingLevel" value="5"/&gt;
        &lt;/properties&gt;
    &lt;/rule&gt;
    
    &lt;!-- No usar funciones prohibidas --&gt;
    &lt;rule ref="Generic.PHP.ForbiddenFunctions"&gt;
        &lt;properties&gt;
            &lt;property name="forbiddenFunctions" type="array"&gt;
                &lt;element key="eval" value="null"/&gt;
                &lt;element key="create_function" value="null"/&gt;
                &lt;element key="var_dump" value="null"/&gt;
                &lt;element key="print_r" value="null"/&gt;
            &lt;/property&gt;
        &lt;/properties&gt;
    &lt;/rule&gt;
    
    &lt;!-- Comentarios en archivos --&gt;
    &lt;rule ref="Squiz.Commenting.FileComment"/&gt;
    &lt;rule ref="Squiz.Commenting.ClassComment"/&gt;
    &lt;rule ref="Squiz.Commenting.FunctionComment"&gt;
        &lt;exclude name="Squiz.Commenting.FunctionComment.MissingParamComment"/&gt;
    &lt;/rule&gt;
    
    &lt;!-- Arrays --&gt;
    &lt;rule ref="Generic.Arrays.DisallowLongArraySyntax"/&gt;
    
    &lt;!-- Casting --&gt;
    &lt;rule ref="Generic.Formatting.SpaceAfterCast"/&gt;
    
    &lt;!-- Control structures --&gt;
    &lt;rule ref="Generic.ControlStructures.InlineControlStructure"/&gt;
&lt;/ruleset&gt;
</code></pre>

        <h2 class="section-title">7. Ejecutar PHPCS</h2>

        <pre><code class="language-bash"># Análisis básico
vendor/bin/phpcs

# Directorio específico
vendor/bin/phpcs modules/mymodule

# Archivo específico
vendor/bin/phpcs modules/mymodule/mymodule.php

# Con estándar específico
vendor/bin/phpcs --standard=PSR12 modules/mymodule

# Mostrar progreso
vendor/bin/phpcs -p modules/mymodule

# Reporte detallado
vendor/bin/phpcs --report=full modules/mymodule

# Reporte resumen
vendor/bin/phpcs --report=summary modules/mymodule

# Múltiples reportes
vendor/bin/phpcs --report=full --report=summary --report-file=report.txt

# Solo errores (sin warnings)
vendor/bin/phpcs --error-severity=1 --warning-severity=8

# Con colores
vendor/bin/phpcs --colors modules/mymodule
</code></pre>

        <h2 class="section-title">8. Auto-fix con PHPCBF</h2>

        <pre><code class="language-bash"># Corregir automáticamente
vendor/bin/phpcbf

# Directorio específico
vendor/bin/phpcbf modules/mymodule

# Dry-run (mostrar sin aplicar)
vendor/bin/phpcbf --dry-run modules/mymodule

# Solo ciertos tipos de errores
vendor/bin/phpcbf --sniffs=PSR2.Classes.ClassDeclaration,PSR2.Methods.MethodDeclaration
</code></pre>

        <pre><code class="language-php"><?php
// Antes de phpcbf
class ProductService{
public function getProduct($id){
if($id>0){
return new Product($id);
}
return null;
}
}

// Después de phpcbf
class ProductService
{
    public function getProduct($id)
    {
        if ($id > 0) {
            return new Product($id);
        }
        
        return null;
    }
}
</code></pre>

        <h2 class="section-title">9. Integración IDE</h2>

        <h3>9.1. VS Code</h3>

        <pre><code class="language-json">// .vscode/settings.json
{
    "phpcs.enable": true,
    "phpcs.standard": "PSR12",
    "phpcs.executablePath": "./vendor/bin/phpcs",
    "phpcbf.enable": true,
    "phpcbf.executablePath": "./vendor/bin/phpcbf",
    "phpcbf.onsave": true,
    "[php]": {
        "editor.defaultFormatter": "valeryanm.vscode-phpsab",
        "editor.formatOnSave": true
    }
}
</code></pre>

        <h3>9.2. PhpStorm</h3>

        <pre><code class="language-plaintext">Settings → PHP → Quality Tools → PHP_CodeSniffer
- Configuration: Local
- PHP_CodeSniffer path: vendor/bin/phpcs
- Coding standard: PSR12

Settings → Editor → Inspections
- PHP → Quality tools → PHP_CodeSniffer validation
  ✓ Enable
  Severity: Warning
</code></pre>

        <h2 class="section-title">10. CI/CD Integration</h2>

        <h3>10.1. GitHub Actions</h3>

        <pre><code class="language-yaml"># .github/workflows/phpcs.yml
name: PHP_CodeSniffer

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  phpcs:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.1'
          tools: phpcs
      
      - name: Install dependencies
        run: composer install --no-progress
      
      - name: Run PHPCS
        run: vendor/bin/phpcs --report=checkstyle | cs2pr
      
      - name: Auto-fix (if possible)
        if: failure()
        run: |
          vendor/bin/phpcbf || true
          git diff > phpcs-fixes.patch
      
      - name: Upload Patch
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: phpcs-fixes
          path: phpcs-fixes.patch
</code></pre>

        <h3>10.2. Pre-commit Hook</h3>

        <pre><code class="language-bash"># .git/hooks/pre-commit
#!/bin/bash

echo "Running PHPCS..."

# Get staged files
FILES=\$(git diff --cached --name-only --diff-filter=ACM | grep '\\.php$')

if [ -z "\$FILES" ]; then
    exit 0
fi

# Run PHPCS
vendor/bin/phpcs \$FILES

if [ \$? -ne 0 ]; then
    echo ""
    echo "❌ PHPCS found errors. Attempting auto-fix..."
    vendor/bin/phpcbf \$FILES
    
    echo ""
    echo "✅ Fixed. Please review changes and commit again."
    exit 1
fi

echo "✅ PHPCS check passed"
exit 0
</code></pre>

        <h2 class="section-title">11. Ignorar Violations</h2>

        <pre><code class="language-php"><?php
// Ignorar regla específica en línea
// phpcs:ignore PSR1.Classes.ClassDeclaration.MissingNamespace
class MyLegacyClass
{
    // Ignorar siguiente línea
    // phpcs:ignore Generic.Files.LineLength.TooLong
    private $veryLongPropertyNameThatExceedsTheRecommendedLengthForReadability;
    
    public function myMethod()
    {
        // phpcs:disable
        $legacy_code = true;
        if($legacy_code){
            echo "This won't be checked";
        }
        // phpcs:enable
    }
}
</code></pre>

        <h2 class="section-title">12. Custom Sniffs</h2>

        <pre><code class="language-php"><?php
// src/Sniffs/PrestaShop/ForbidDirectDbQuerySniff.php

namespace MyModule\\Sniffs\\PrestaShop;

use PHP_CodeSniffer\\Sniffs\\Sniff;
use PHP_CodeSniffer\\Files\\File;

class ForbidDirectDbQuerySniff implements Sniff
{
    public function register()
    {
        return [T_STRING];
    }
    
    public function process(File $phpcsFile, $stackPtr)
    {
        $tokens = $phpcsFile->getTokens();
        $token  = $tokens[$stackPtr];
        
        // Detectar Db::getInstance()->execute()
        if ($token['content'] === 'execute') {
            $prevToken = $phpcsFile->findPrevious(T_WHITESPACE, $stackPtr - 1, null, true);
            
            if ($tokens[$prevToken]['content'] === '->') {
                $error = 'Direct database queries are forbidden. Use Repository pattern.';
                $phpcsFile->addError($error, $stackPtr, 'DirectQuery');
            }
        }
    }
}
</code></pre>

        <pre><code class="language-xml">&lt;!-- Registrar custom sniff --&gt;
&lt;ruleset name="Custom"&gt;
    &lt;rule ref="./src/Sniffs/PrestaShop/ForbidDirectDbQuerySniff.php"/&gt;
&lt;/ruleset&gt;
</code></pre>

        <h2 class="section-title">13. Reportes y Métricas</h2>

        <pre><code class="language-bash"># Reporte JSON
vendor/bin/phpcs --report=json --report-file=phpcs-report.json

# Reporte XML
vendor/bin/phpcs --report=xml --report-file=phpcs-report.xml

# Reporte HTML
vendor/bin/phpcs --report=full --report-file=phpcs-report.html

# Estadísticas
vendor/bin/phpcs --report=summary --report-width=120

# Gráfico
vendor/bin/phpcs --report=source
</code></pre>

        <h2 class="section-title">14. Scripts Composer</h2>

        <pre><code class="language-json">{
    "scripts": {
        "cs": "phpcs",
        "cs:fix": "phpcbf",
        "cs:report": "phpcs --report=summary --report-file=reports/phpcs.txt",
        "quality": [
            "@cs",
            "@phpstan"
        ]
    }
}
</code></pre>

        <h2 class="section-title">15. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ PHP_CodeSniffer:</strong>
            <ul class="mb-0">
                <li>Usar PSR-12 como estándar base</li>
                <li>Configurar en phpcs.xml versionado</li>
                <li>Auto-fix en IDE (save on format)</li>
                <li>Pre-commit hook para prevenir violations</li>
                <li>CI/CD obligatorio en pull requests</li>
                <li>Reportes automáticos en builds</li>
                <li>Evitar ignorar reglas sin justificación</li>
                <li>Custom sniffs para reglas específicas del proyecto</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>📐 Línea Base:</strong>
            <ul class="mb-0">
                <li><strong>Longitud línea:</strong> 120 caracteres</li>
                <li><strong>Indentación:</strong> 4 espacios</li>
                <li><strong>Complejidad:</strong> < 10</li>
                <li><strong>Nesting:</strong> < 3 niveles</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Migración Legacy:</strong>
            <ul class="mb-0">
                <li>Aplicar PHPCBF archivo por archivo</li>
                <li>Revisar cambios antes de commit</li>
                <li>Excluir clases PrestaShop core</li>
                <li>Documentar excepciones necesarias</li>
            </ul>
        </div>
    </div>
`;

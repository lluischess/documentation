// Loader central que combina todo el contenido
const allContent = {
    // Sintaxis y Tipos de Datos
    ...sintaxisTiposDatos,
    
    // Operadores y Estructuras
    'coercion-tipos': `
        <h1>Coerción de Tipos y Comparaciones Estrictas</h1>
        <p>PHP realiza conversión automática de tipos (type juggling), pero también permite comparaciones estrictas.</p>
        <h3>Coerción Automática</h3>
        <div class="code-block"><pre><code>&lt;?php
$numero = "10";
$resultado = $numero + 5;  // 15

// Conversión explícita (casting)
$int = (int)"123abc";        // 123
$float = (float)"45.67";     // 45.67
$bool = (bool)0;             // false
?&gt;</code></pre></div>
        <h3>Comparaciones Estrictas</h3>
        <div class="code-block"><pre><code>&lt;?php
var_dump(5 == "5");   // true
var_dump(5 === "5");  // false
var_dump(0 === false); // false

// Null coalescing
$nombre = $usuario ?? "Invitado";
$variable ??= "valor";
?&gt;</code></pre></div>
        <div class="warning-box"><strong>⚠️ Advertencia:</strong> Usa === para comparaciones estrictas.</div>
    `,
    'operadores': `
        <h1>Operadores Aritméticos, Lógicos y de Comparación</h1>
        <h3>Operadores Aritméticos</h3>
        <div class="code-block"><pre><code>&lt;?php
$a = 10; $b = 3;
echo $a + $b;  // 13
echo $a - $b;  // 7
echo $a * $b;  // 30
echo $a / $b;  // 3.333
echo $a % $b;  // 1
echo $a ** $b; // 1000
?&gt;</code></pre></div>
        <h3>Operadores Lógicos</h3>
        <div class="code-block"><pre><code>&lt;?php
var_dump(true && true);   // true
var_dump(true || false);  // true
var_dump(!true);          // false
?&gt;</code></pre></div>
    `,
    'estructuras-control': `
        <h1>Estructuras de Control</h1>
        <h3>If/Else</h3>
        <div class="code-block"><pre><code>&lt;?php
if ($edad < 18) {
    echo "Menor";
} elseif ($edad < 65) {
    echo "Adulto";
} else {
    echo "Senior";
}
?&gt;</code></pre></div>
        <h3>Bucles</h3>
        <div class="code-block"><pre><code>&lt;?php
for ($i = 0; $i < 5; $i++) {
    echo $i;
}

foreach ($array as $key => $value) {
    echo "$key: $value";
}
?&gt;</code></pre></div>
    `,
    'funciones-anonimas': `
        <h1>Funciones Anónimas y Arrow Functions</h1>
        <h3>Closures</h3>
        <div class="code-block"><pre><code>&lt;?php
$saludar = function($nombre) {
    return "Hola, $nombre!";
};

$multiplicador = 3;
$multiplicar = function($n) use ($multiplicador) {
    return $n * $multiplicador;
};
?&gt;</code></pre></div>
        <h3>Arrow Functions (PHP 7.4+)</h3>
        <div class="code-block"><pre><code>&lt;?php
$multiplicador = 3;
$multiplicar = fn($n) => $n * $multiplicador;
$cuadrados = array_map(fn($n) => $n * $n, $numeros);
?&gt;</code></pre></div>
    `,
    'namespaces': `
        <h1>Namespaces y Autoloading</h1>
        <div class="code-block"><pre><code>&lt;?php
namespace App\\Models;

class Usuario {
    public function __construct(
        public string $nombre,
        public string $email
    ) {}
}

use App\\Models\\Usuario;
$user = new Usuario("Juan", "juan@example.com");
?&gt;</code></pre></div>
    `,
    
    // Gestión de Errores
    ...gestionErrores,
    
    'excepciones-personalizadas': `
        <h1>Excepciones Personalizadas</h1>
        <div class="code-block"><pre><code>&lt;?php
class UsuarioNoEncontradoException extends Exception {
    protected $userId;
    
    public function __construct($userId) {
        $this->userId = $userId;
        parent::__construct("Usuario $userId no encontrado");
    }
    
    public function getUserId() {
        return $this->userId;
    }
}

try {
    throw new UsuarioNoEncontradoException(123);
} catch (UsuarioNoEncontradoException $e) {
    echo $e->getMessage();
}
?&gt;</code></pre></div>
    `,
    'bloques-try-catch': `
        <h1>Bloques try-catch-finally</h1>
        <div class="code-block"><pre><code>&lt;?php
try {
    $archivo = fopen("datos.txt", "r");
    if (!$archivo) throw new RuntimeException("Error");
} catch (RuntimeException $e) {
    echo "Error: " . $e->getMessage();
} finally {
    if ($archivo) fclose($archivo);
}

// Múltiples catch (PHP 7.1+)
try {
    // código
} catch (InvalidArgumentException | RuntimeException $e) {
    echo $e->getMessage();
}
?&gt;</code></pre></div>
    `,
    'errores-fatales': `
        <h1>Errores Fatales y Shutdown Functions</h1>
        <div class="code-block"><pre><code>&lt;?php
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE])) {
        error_log("Error Fatal: {$error['message']}");
    }
});

try {
    $result = intdiv(10, 0);
} catch (DivisionByZeroError $e) {
    echo $e->getMessage();
}
?&gt;</code></pre></div>
    `,
    'logging-errores': `
        <h1>Logging de Errores y Stack Traces</h1>
        <div class="code-block"><pre><code>&lt;?php
error_log("Mensaje de error");
error_log("Error DB", 3, "logs/db.log");

$log = [
    'time' => date('Y-m-d H:i:s'),
    'level' => 'ERROR',
    'message' => 'Fallo'
];
error_log(json_encode($log), 3, "logs/app.log");

try {
    throw new Exception("Error");
} catch (Exception $e) {
    error_log($e->getTraceAsString());
}
?&gt;</code></pre></div>
    `,
    'xdebug': `
        <h1>Depuración con Xdebug</h1>
        <p>Xdebug es una extensión para debugging y profiling de PHP.</p>
        <div class="code-block"><pre><code># Instalación
pecl install xdebug

# php.ini
zend_extension=xdebug.so
xdebug.mode=debug
xdebug.start_with_request=yes
xdebug.client_port=9003
</code></pre></div>
    `,
    
    // OOP
    ...oop,
    
    'herencia': `
        <h1>Herencia, Abstracción e Interfaces</h1>
        <h3>Herencia</h3>
        <div class="code-block"><pre><code>&lt;?php
class Animal {
    protected string $nombre;
    
    public function __construct(string $nombre) {
        $this->nombre = $nombre;
    }
}

class Perro extends Animal {
    public function ladrar(): void {
        echo "Guau!";
    }
}
?&gt;</code></pre></div>
        <h3>Interfaces</h3>
        <div class="code-block"><pre><code>&lt;?php
interface Autenticable {
    public function autenticar(string $password): bool;
}

class Usuario implements Autenticable {
    public function autenticar(string $password): bool {
        return true;
    }
}
?&gt;</code></pre></div>
    `,
    'traits': `
        <h1>Traits y Clases Anónimas</h1>
        <h3>Traits</h3>
        <div class="code-block"><pre><code>&lt;?php
trait Timestamps {
    public DateTime $createdAt;
    public DateTime $updatedAt;
    
    public function touch(): void {
        $this->updatedAt = new DateTime();
    }
}

class Post {
    use Timestamps;
    public string $titulo;
}
?&gt;</code></pre></div>
    `,
    'encapsulamiento': `
        <h1>Encapsulamiento</h1>
        <div class="code-block"><pre><code>&lt;?php
class CuentaBancaria {
    private float $saldo = 0;
    
    public function depositar(float $monto): bool {
        if ($monto <= 0) return false;
        $this->saldo += $monto;
        return true;
    }
    
    public function getSaldo(): float {
        return $this->saldo;
    }
}
?&gt;</code></pre></div>
    `,
    'polimorfismo': `
        <h1>Polimorfismo y Type Hinting</h1>
        <div class="code-block"><pre><code>&lt;?php
interface Pagable {
    public function calcularMonto(): float;
}

class Factura implements Pagable {
    public function calcularMonto(): float {
        return $this->subtotal * 1.16;
    }
}

function procesarPago(Pagable $item): void {
    echo $item->calcularMonto();
}
?&gt;</code></pre></div>
    `,
    'clases-finales': `
        <h1>Clases Finales y Métodos Finales</h1>
        <div class="code-block"><pre><code>&lt;?php
final class Configuracion {
    private static ?Configuracion $instancia = null;
    
    private function __construct() {}
    
    public static function getInstance(): Configuracion {
        if (self::$instancia === null) {
            self::$instancia = new self();
        }
        return self::$instancia;
    }
}
?&gt;</code></pre></div>
    `,
    
    // Patrones de Diseño
    ...patronesDiseno,
    
    // Placeholders para secciones pendientes (a desarrollar)
    'declaraciones-tipos': `<h1>Declaraciones de Tipos Escalares y de Retorno</h1><p>Contenido en desarrollo...</p>`,
    'propiedades-promocionadas': `<h1>Propiedades Promocionadas en Constructores (PHP 8+)</h1><p>Ver la sección de Constructores para más detalles.</p>`,
    'atributos': `<h1>Atributos (PHP 8+) y su uso</h1><p>Contenido en desarrollo...</p>`,
    'enumeraciones': `<h1>Enumeraciones (Enums) (PHP 8.1+)</h1><p>Contenido en desarrollo...</p>`,
    'principio-ocp': `<h1>Principio Abierto/Cerrado (OCP)</h1><p>Contenido en desarrollo...</p>`,
    'principio-lsp': `<h1>Principio de Sustitución de Liskov (LSP)</h1><p>Contenido en desarrollo...</p>`,
    'principio-isp': `<h1>Principio de Segregación de Interfaces (ISP)</h1><p>Contenido en desarrollo...</p>`,
    'principio-dip': `<h1>Principio de Inversión de Dependencias (DIP)</h1><p>Contenido en desarrollo...</p>`,
    'aplicacion-solid': `<h1>Aplicación de SOLID en PHP</h1><p>Contenido en desarrollo...</p>`,
    'refactoring-solid': `<h1>Refactoring Basado en SOLID</h1><p>Contenido en desarrollo...</p>`,
    'patron-singleton': `<h1>Patrón Singleton</h1><p>Contenido en desarrollo...</p>`,
    'patron-factory': `<h1>Patrón Factory Method</h1><p>Contenido en desarrollo...</p>`,
    'patron-abstract-factory': `<h1>Patrón Abstract Factory</h1><p>Contenido en desarrollo...</p>`,
    'patron-builder': `<h1>Patrón Builder</h1><p>Contenido en desarrollo...</p>`,
    'patron-prototype': `<h1>Patrón Prototype</h1><p>Contenido en desarrollo...</p>`,
    'inyeccion-dependencias': `<h1>Inyección de Dependencias (DI) y Contenedores DI</h1><p>Contenido en desarrollo...</p>`,
    'service-locator': `<h1>Service Locator</h1><p>Contenido en desarrollo...</p>`,
    'patron-adapter': `<h1>Patrón Adapter</h1><p>Contenido en desarrollo...</p>`,
    'patron-decorator': `<h1>Patrón Decorator</h1><p>Contenido en desarrollo...</p>`,
    'patron-facade': `<h1>Patrón Facade</h1><p>Contenido en desarrollo...</p>`,
    'patron-bridge': `<h1>Patrón Bridge</h1><p>Contenido en desarrollo...</p>`,
    'patron-composite': `<h1>Patrón Composite</h1><p>Contenido en desarrollo...</p>`,
    'patron-proxy': `<h1>Patrón Proxy</h1><p>Contenido en desarrollo...</p>`,
    'patron-flyweight': `<h1>Patrón Flyweight</h1><p>Contenido en desarrollo...</p>`
};

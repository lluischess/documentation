// Contenido completo de la documentación
const allContent = {
    'declaracion-variables': `
        <h1>Declaración de Variables y Constantes</h1>
        <p>En PHP, las variables se declaran con el símbolo <code>$</code> y no requieren un tipo explícito.</p>
        <h3>Variables</h3>
        <div class="code-block"><pre><code>&lt;?php
$nombre = "Juan";
$edad = 25;
$activo = true;

// Variables variables
$var = "nombre";
$$var = "Pedro";
echo $nombre; // Output: Pedro
?&gt;</code></pre></div>
        <h3>Constantes</h3>
        <div class="code-block"><pre><code>&lt;?php
define('SITIO_NOMBRE', 'Mi Sitio Web');
const MAX_INTENTOS = 3;

echo SITIO_NOMBRE;

// Constantes mágicas
echo __FILE__;
echo __LINE__;
echo __DIR__;
?&gt;</code></pre></div>
        <div class="info-box"><strong>💡 Buena Práctica:</strong> Usa constantes para valores inmutables.</div>
    `,
    'tipos-escalares': `
        <h1>Tipos Escalares y Compuestos</h1>
        <h3>Tipos Escalares</h3>
        <div class="code-block"><pre><code>&lt;?php
// Integer
$entero = 42;
$hexadecimal = 0x1A;

// Float
$decimal = 3.14159;

// String
$texto = "Hola Mundo";

// Boolean
$verdadero = true;
$falso = false;

// Null
$nulo = null;
?&gt;</code></pre></div>
        <h3>Tipos Compuestos</h3>
        <div class="code-block"><pre><code>&lt;?php
// Array indexado
$frutas = ["manzana", "naranja", "plátano"];

// Array asociativo
$persona = [
    "nombre" => "Ana",
    "edad" => 30
];

// Objeto
class Usuario {
    public $nombre;
    public $email;
}

$user = new Usuario();
$user->nombre = "Carlos";
?&gt;</code></pre></div>
    `,
    'coercion-tipos': `
        <h1>Coerción de Tipos y Comparaciones Estrictas</h1>
        <div class="code-block"><pre><code>&lt;?php
// Coerción automática
$numero = "10";
$resultado = $numero + 5;  // 15

// Casting explícito
$int = (int)"123abc";  // 123
$bool = (bool)0;       // false

// Comparaciones
var_dump(5 == "5");   // true
var_dump(5 === "5");  // false

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
var_dump(true xor false); // true
?&gt;</code></pre></div>
    `,
    'estructuras-control': `
        <h1>Estructuras de Control</h1>
        <h3>If/Else</h3>
        <div class="code-block"><pre><code>&lt;?php
if ($edad &lt; 18) {
    echo "Menor";
} elseif ($edad &lt; 65) {
    echo "Adulto";
} else {
    echo "Senior";
}
?&gt;</code></pre></div>
        <h3>Switch/Match</h3>
        <div class="code-block"><pre><code>&lt;?php
// Switch
switch ($dia) {
    case "lunes":
        echo "Día laboral";
        break;
    default:
        echo "Otro día";
}

// Match (PHP 8+)
$resultado = match($dia) {
    'lunes', 'martes' => 'Laboral',
    'sábado', 'domingo' => 'Fin de semana',
    default => 'No válido'
};
?&gt;</code></pre></div>
        <h3>Bucles</h3>
        <div class="code-block"><pre><code>&lt;?php
// For
for ($i = 0; $i &lt; 5; $i++) {
    echo $i;
}

// Foreach
foreach ($frutas as $fruta) {
    echo $fruta;
}

foreach ($persona as $key => $value) {
    echo "$key: $value";
}
?&gt;</code></pre></div>
    `,
    'funciones-anonimas': `
        <h1>Funciones Anónimas y Arrow Functions</h1>
        <h3>Funciones Anónimas</h3>
        <div class="code-block"><pre><code>&lt;?php
$saludar = function($nombre) {
    return "Hola, $nombre!";
};

// Con use
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
        <div class="info-box"><strong>💡 Diferencia:</strong> Arrow functions capturan variables automáticamente.</div>
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

// Uso
use App\\Models\\Usuario;
$user = new Usuario("Juan", "juan@example.com");
?&gt;</code></pre></div>
        <h3>PSR-4 Autoloading</h3>
        <div class="code-block"><pre><code>// composer.json
{
    "autoload": {
        "psr-4": {
            "App\\\\": "src/"
        }
    }
}

// index.php
require 'vendor/autoload.php';
$usuario = new App\\Models\\Usuario("Juan", "juan@example.com");
</code></pre></div>
    `,
    'manejo-errores-tradicional': `
        <h1>Manejo de Errores Tradicional</h1>
        <div class="code-block"><pre><code>&lt;?php
function dividir($a, $b) {
    if ($b == 0) {
        trigger_error("División por cero", E_USER_WARNING);
        return null;
    }
    return $a / $b;
}

// Error handler personalizado
set_error_handler(function($errno, $errstr, $file, $line) {
    error_log("[$errno] $errstr en $file:$line");
    return true;
});

error_reporting(E_ALL);
ini_set('display_errors', 1);
?&gt;</code></pre></div>
    `,
    'clases-excepciones': `
        <h1>Clases de Excepciones Estándar</h1>
        <div class="code-block"><pre><code>&lt;?php
try {
    if ($edad &lt; 0) {
        throw new InvalidArgumentException("Edad inválida");
    }
} catch (InvalidArgumentException $e) {
    echo $e->getMessage();
}

// Jerarquía
/*
Throwable
├── Error
│   ├── TypeError
│   └── DivisionByZeroError
└── Exception
    ├── LogicException
    │   └── InvalidArgumentException
    └── RuntimeException
        └── OutOfBoundsException
*/
?&gt;</code></pre></div>
    `,
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

// Uso
try {
    throw new UsuarioNoEncontradoException(123);
} catch (UsuarioNoEncontradoException $e) {
    echo $e->getMessage();
    echo $e->getUserId();
}
?&gt;</code></pre></div>
    `,
    'bloques-try-catch': `
        <h1>Bloques try-catch-finally</h1>
        <div class="code-block"><pre><code>&lt;?php
$archivo = null;

try {
    $archivo = fopen("datos.txt", "r");
    if (!$archivo) {
        throw new RuntimeException("Error al abrir");
    }
    $contenido = fread($archivo, 100);
    
} catch (RuntimeException $e) {
    echo "Error: " . $e->getMessage();
} finally {
    if ($archivo) {
        fclose($archivo);
    }
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
        http_response_code(500);
        echo "Error del servidor";
    }
});

// Try-Catch para Errors (PHP 7+)
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
// Error log básico
error_log("Mensaje de error");
error_log("Error DB", 3, "logs/db.log");

// Log estructurado
$log = [
    'time' => date('Y-m-d H:i:s'),
    'level' => 'ERROR',
    'message' => 'Fallo en operación',
    'user' => $_SESSION['user_id'] ?? null
];
error_log(json_encode($log), 3, "logs/app.log");

// Stack trace
try {
    throw new Exception("Error de prueba");
} catch (Exception $e) {
    error_log($e->getTraceAsString());
    
    foreach ($e->getTrace() as $frame) {
        echo "{$frame['file']}:{$frame['line']} - {$frame['function']}";
    }
}
?&gt;</code></pre></div>
    `,
    'xdebug': `
        <h1>Depuración con Xdebug</h1>
        <p>Xdebug es una extensión para debugging y profiling de PHP.</p>
        <h3>Instalación</h3>
        <div class="code-block"><pre><code># Con PECL
pecl install xdebug

# Configuración en php.ini
zend_extension=xdebug.so
xdebug.mode=debug
xdebug.start_with_request=yes
xdebug.client_host=localhost
xdebug.client_port=9003
</code></pre></div>
        <h3>Funciones útiles</h3>
        <div class="code-block"><pre><code>&lt;?php
// Dump mejorado
var_dump($variable);
xdebug_var_dump($variable);

// Stack trace
xdebug_print_function_stack();

// Información de errores
xdebug_break();
?&gt;</code></pre></div>
    `,
    'clases-objetos': `
        <h1>Clases, Objetos, Propiedades y Métodos</h1>
        <div class="code-block"><pre><code>&lt;?php
class Usuario {
    // Propiedades
    public string $nombre;
    private string $email;
    protected int $edad;
    
    // Método
    public function saludar(): string {
        return "Hola, soy {$this->nombre}";
    }
    
    // Getter/Setter
    public function getEmail(): string {
        return $this->email;
    }
    
    public function setEmail(string $email): void {
        $this->email = $email;
    }
}

$usuario = new Usuario();
$usuario->nombre = "Juan";
echo $usuario->saludar();
?&gt;</code></pre></div>
    `,
    'constructores': `
        <h1>Constructores y Destructores</h1>
        <div class="code-block"><pre><code>&lt;?php
class Conexion {
    private $conn;
    
    // Constructor
    public function __construct(
        private string $host,
        private string $user,
        private string $password
    ) {
        $this->conn = mysqli_connect($host, $user, $password);
    }
    
    // Destructor
    public function __destruct() {
        if ($this->conn) {
            mysqli_close($this->conn);
        }
    }
}

// PHP 8 Constructor Property Promotion
class Usuario {
    public function __construct(
        public string $nombre,
        public string $email,
        public int $edad = 18
    ) {}
}

$user = new Usuario("Juan", "juan@example.com");
?&gt;</code></pre></div>
    `,
    'herencia': `
        <h1>Herencia, Abstracción e Interfaces</h1>
        <h3>Herencia</h3>
        <div class="code-block"><pre><code>&lt;?php
class Animal {
    protected string $nombre;
    
    public function __construct(string $nombre) {
        $this->nombre = $nombre;
    }
    
    public function hacerSonido(): void {
        echo "Algún sonido";
    }
}

class Perro extends Animal {
    public function hacerSonido(): void {
        echo "Guau guau";
    }
}
?&gt;</code></pre></div>
        <h3>Clases Abstractas</h3>
        <div class="code-block"><pre><code>&lt;?php
abstract class Forma {
    abstract public function calcularArea(): float;
    
    public function descripcion(): string {
        return "Área: " . $this->calcularArea();
    }
}

class Circulo extends Forma {
    public function __construct(
        private float $radio
    ) {}
    
    public function calcularArea(): float {
        return pi() * $this->radio ** 2;
    }
}
?&gt;</code></pre></div>
        <h3>Interfaces</h3>
        <div class="code-block"><pre><code>&lt;?php
interface Autenticable {
    public function autenticar(string $password): bool;
    public function getToken(): string;
}

class Usuario implements Autenticable {
    public function autenticar(string $password): bool {
        // Lógica de autenticación
        return true;
    }
    
    public function getToken(): string {
        return bin2hex(random_bytes(32));
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

trait SoftDeletes {
    public ?DateTime $deletedAt = null;
    
    public function delete(): void {
        $this->deletedAt = new DateTime();
    }
    
    public function restore(): void {
        $this->deletedAt = null;
    }
}

class Post {
    use Timestamps, SoftDeletes;
    
    public string $titulo;
    public string $contenido;
}
?&gt;</code></pre></div>
        <h3>Clases Anónimas</h3>
        <div class="code-block"><pre><code>&lt;?php
// Clase anónima
$logger = new class {
    public function log(string $message): void {
        echo "[LOG] $message";
    }
};

$logger->log("Mensaje de prueba");

// Con constructor
$calculadora = new class(10) {
    public function __construct(
        private int $base
    ) {}
    
    public function sumar(int $num): int {
        return $this->base + $num;
    }
};
?&gt;</code></pre></div>
    `,
    'encapsulamiento': `
        <h1>Encapsulamiento</h1>
        <div class="code-block"><pre><code>&lt;?php
class CuentaBancaria {
    private float $saldo = 0;
    protected string $titular;
    public string $numeroCuenta;
    
    // Private: solo accesible dentro de la clase
    private function validarMonto(float $monto): bool {
        return $monto > 0;
    }
    
    // Protected: accesible en la clase y subclases
    protected function registrarTransaccion(string $tipo): void {
        echo "Transacción: $tipo";
    }
    
    // Public: accesible desde cualquier lugar
    public function depositar(float $monto): bool {
        if ($this->validarMonto($monto)) {
            $this->saldo += $monto;
            $this->registrarTransaccion("depósito");
            return true;
        }
        return false;
    }
    
    public function getSaldo(): float {
        return $this->saldo;
    }
}

class CuentaAhorro extends CuentaBancaria {
    public function aplicarInteres(): void {
        // Puede acceder a protected
        $this->registrarTransaccion("interés");
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
    public function __construct(
        private float $subtotal,
        private float $impuesto
    ) {}
    
    public function calcularMonto(): float {
        return $this->subtotal * (1 + $this->impuesto);
    }
}

class Suscripcion implements Pagable {
    public function __construct(
        private float $mensualidad,
        private int $meses
    ) {}
    
    public function calcularMonto(): float {
        return $this->mensualidad * $this->meses;
    }
}

// Type Hinting con polimorfismo
function procesarPago(Pagable $item): void {
    $monto = $item->calcularMonto();
    echo "Procesando pago de $$monto";
}

procesarPago(new Factura(100, 0.16));
procesarPago(new Suscripcion(50, 12));

// Union Types (PHP 8+)
function procesar(int|float|string $valor): void {
    echo $valor;
}

// Return types
function obtenerUsuario(): ?Usuario {
    return $usuario ?? null;
}
?&gt;</code></pre></div>
    `,
    'clases-finales': `
        <h1>Clases Finales y Métodos Finales</h1>
        <div class="code-block"><pre><code>&lt;?php
// Clase final: no puede ser extendida
final class Configuracion {
    private static ?Configuracion $instancia = null;
    
    private function __construct(
        private array $config
    ) {}
    
    public static function getInstance(): Configuracion {
        if (self::$instancia === null) {
            self::$instancia = new self([]);
        }
        return self::$instancia;
    }
}

// Método final: no puede ser sobrescrito
class Usuario {
    final public function getId(): int {
        return $this->id;
    }
    
    // Este método puede ser sobrescrito
    public function getNombre(): string {
        return $this->nombre;
    }
}

class Admin extends Usuario {
    // ❌ Error: no se puede sobrescribir método final
    // public function getId(): int {}
    
    // ✅ OK: este método sí puede ser sobrescrito
    public function getNombre(): string {
        return "Admin: " . parent::getNombre();
    }
}
?&gt;</code></pre></div>
        <div class="info-box">
            <strong>💡 Cuándo usar final:</strong><br>
            • <strong>Clases</strong>: Para implementaciones que no deben ser modificadas (ej: singletons)<br>
            • <strong>Métodos</strong>: Para garantizar comportamiento crítico que no debe cambiar
        </div>
    `
};

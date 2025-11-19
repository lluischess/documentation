// Contenido: Gestión de Errores y Excepciones
const gestionErrores = {
    'manejo-errores-tradicional': `
        <h1>Manejo de Errores Tradicional (trigger_error)</h1>
        
        <p>El manejo tradicional de errores en PHP utiliza funciones como <code>trigger_error()</code> y error handlers personalizados. Aunque las excepciones son más modernas, entender el sistema de errores es crucial.</p>

        <h3>Niveles de Error</h3>
        <p>PHP tiene varios niveles de errores que indican la severidad del problema:</p>
        
        <div class="code-block"><pre><code>&lt;?php
// E_ERROR - Errores fatales, detienen la ejecución
// E_WARNING - Advertencias, no detienen la ejecución
// E_NOTICE - Avisos, problemas menores
// E_PARSE - Errores de sintaxis en tiempo de compilación
// E_DEPRECATED - Uso de características obsoletas

// Errores generados por el usuario
// E_USER_ERROR - Error fatal de usuario
// E_USER_WARNING - Advertencia de usuario
// E_USER_NOTICE - Aviso de usuario
// E_USER_DEPRECATED - Deprecación de usuario

// Todos los errores
// E_ALL - Todos los errores y avisos
?&gt;</code></pre></div>

        <h3>Trigger Error</h3>
        <div class="code-block"><pre><code>&lt;?php
function dividir($a, $b) {
    if ($b == 0) {
        trigger_error(
            "División por cero: No se puede dividir $a entre 0",
            E_USER_WARNING
        );
        return null;
    }
    return $a / $b;
}

$resultado = dividir(10, 0);
// Output: PHP Warning: División por cero...

// Ejemplo con validación
function establecerEdad($edad) {
    if (!is_numeric($edad)) {
        trigger_error(
            "La edad debe ser un número, " . gettype($edad) . " dado",
            E_USER_ERROR  // Fatal - detiene ejecución
        );
    }
    
    if ($edad < 0) {
        trigger_error(
            "La edad no puede ser negativa",
            E_USER_WARNING
        );
        $edad = 0;
    }
    
    if ($edad > 150) {
        trigger_error(
            "Edad poco realista: $edad",
            E_USER_NOTICE
        );
    }
    
    return $edad;
}
?&gt;</code></pre></div>

        <h3>Error Handler Personalizado</h3>
        <p>Puedes definir tu propio manejador de errores con <code>set_error_handler()</code>:</p>
        
        <div class="code-block"><pre><code>&lt;?php
// Definir handler personalizado
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    // Formatear el mensaje
    $fecha = date('Y-m-d H:i:s');
    $tipo = match($errno) {
        E_ERROR, E_USER_ERROR => 'ERROR',
        E_WARNING, E_USER_WARNING => 'WARNING',
        E_NOTICE, E_USER_NOTICE => 'NOTICE',
        E_DEPRECATED, E_USER_DEPRECATED => 'DEPRECATED',
        default => 'UNKNOWN'
    };
    
    $mensaje = "[$fecha] $tipo: $errstr en $errfile:$errline";
    
    // Guardar en log
    error_log($mensaje, 3, __DIR__ . "/logs/errors.log");
    
    // En desarrollo, mostrar en pantalla
    if (getenv('APP_ENV') === 'development') {
        echo "&lt;div style='
            background: #ff4444;
            color: white;
            padding: 1rem;
            margin: 0.5rem;
            border-radius: 4px;
            font-family: monospace;
        '&gt;";
        echo "&lt;strong&gt;$tipo:&lt;/strong&gt; $errstr&lt;br&gt;";
        echo "&lt;small&gt;$errfile:$errline&lt;/small&gt;";
        echo "&lt;/div&gt;";
    }
    
    // Retornar true para no ejecutar el handler interno de PHP
    return true;
});

// Restaurar el handler original
restore_error_handler();

// Handler con contexto
set_error_handler(function($errno, $errstr, $errfile, $errline, $context) {
    // $context contiene las variables en el scope del error
    $vars = [];
    foreach ($context as $key => $value) {
        $vars[$key] = var_export($value, true);
    }
    
    $log = [
        'error' => $errstr,
        'file' => $errfile,
        'line' => $errline,
        'variables' => $vars
    ];
    
    error_log(json_encode($log), 3, "logs/debug.log");
    return true;
});
?&gt;</code></pre></div>

        <h3>Configuración de Errores</h3>
        <div class="code-block"><pre><code>&lt;?php
// Configuración en tiempo de ejecución

// Reportar todos los errores
error_reporting(E_ALL);

// Reportar todos excepto notices
error_reporting(E_ALL & ~E_NOTICE);

// Solo errores y warnings
error_reporting(E_ERROR | E_WARNING);

// Mostrar errores en pantalla (desarrollo)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

// No mostrar errores en pantalla (producción)
ini_set('display_errors', 0);

// Guardar errores en log
ini_set('log_errors', 1);
ini_set('error_log', '/var/log/php/errors.log');

// Configuración según entorno
if (getenv('APP_ENV') === 'production') {
    error_reporting(E_ALL & ~E_DEPRECATED & ~E_STRICT);
    ini_set('display_errors', 0);
    ini_set('log_errors', 1);
} else {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
}
?&gt;</code></pre></div>

        <h3>Error Handler con Logger</h3>
        <div class="code-block"><pre><code>&lt;?php
class ErrorLogger {
    private $logFile;
    private $logLevel;
    
    public function __construct($logFile, $logLevel = E_ALL) {
        $this->logFile = $logFile;
        $this->logLevel = $logLevel;
    }
    
    public function handleError($errno, $errstr, $errfile, $errline) {
        // Verificar si debemos manejar este nivel
        if (!($this->logLevel & $errno)) {
            return false;
        }
        
        $errorData = [
            'timestamp' => date('c'),
            'level' => $this->getErrorLevel($errno),
            'message' => $errstr,
            'file' => $errfile,
            'line' => $errline,
            'trace' => debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS)
        ];
        
        // Guardar en formato JSON
        $log = json_encode($errorData, JSON_PRETTY_PRINT) . ",\\n";
        file_put_contents($this->logFile, $log, FILE_APPEND);
        
        // Enviar notificación si es error crítico
        if ($errno === E_USER_ERROR) {
            $this->sendNotification($errorData);
        }
        
        return true;
    }
    
    private function getErrorLevel($errno) {
        return match($errno) {
            E_ERROR, E_USER_ERROR => 'FATAL',
            E_WARNING, E_USER_WARNING => 'WARNING',
            E_NOTICE, E_USER_NOTICE => 'NOTICE',
            E_DEPRECATED, E_USER_DEPRECATED => 'DEPRECATED',
            default => 'UNKNOWN'
        };
    }
    
    private function sendNotification($errorData) {
        // Enviar email, Slack, etc.
        // mail('admin@example.com', 'Error Crítico', ...);
    }
}

// Uso
$logger = new ErrorLogger(__DIR__ . '/logs/app.log');
set_error_handler([$logger, 'handleError']);
?&gt;</code></pre></div>

        <div class="warning-box">
            <strong>⚠️ Importante:</strong> Los error handlers personalizados no pueden capturar errores fatales (E_ERROR, E_PARSE, E_CORE_ERROR). Para esos, necesitas usar <code>register_shutdown_function()</code>.
        </div>
    `,

    'clases-excepciones': `
        <h1>Clases de Excepciones Estándar en PHP 8+</h1>
        
        <p>PHP proporciona una <strong>jerarquía completa de excepciones</strong> para manejar diferentes tipos de errores. Cada excepción tiene un propósito específico y te ayuda a escribir código más robusto y mantenible.</p>

        <h3>Jerarquía de Excepciones (Árbol Completo)</h3>
        <p>Todas las excepciones heredan de <code>Throwable</code>, que se divide en dos ramas principales:</p>
        
        <div class="code-block"><pre><code>Throwable (interface) ← Solo esto se puede lanzar con throw
├── Error ← Errores internos de PHP (normalmente NO se capturan)
│   ├── ParseError ← Error de sintaxis
│   ├── TypeError ← Tipo incorrecto (PHP 8+ más estricto)
│   ├── ArgumentCountError ← Número incorrecto de argumentos
│   ├── ArithmeticError ← Error aritmético
│   │   └── DivisionByZeroError ← División por cero
│   ├── CompileError ← Error de compilación
│   └── AssertionError ← Fallo de assert()
│
└── Exception ← Excepciones de aplicación (SÍ se capturan)
    ├── LogicException ← Errores de lógica (bugs en tu código)
    │   ├── BadFunctionCallException ← Función llamada incorrectamente
    │   │   └── BadMethodCallException ← Método llamado incorrectamente
    │   ├── DomainException ← Valor fuera del dominio válido
    │   ├── InvalidArgumentException ← Argumento inválido
    │   ├── LengthException ← Longitud inválida
    │   └── OutOfRangeException ← Índice fuera de rango
    │
    └── RuntimeException ← Errores en tiempo de ejecución
        ├── OutOfBoundsException ← Acceso fuera de límites
        ├── OverflowException ← Overflow en estructura
        ├── RangeException ← Rango inválido
        ├── UnderflowException ← Underflow en estructura
        └── UnexpectedValueException ← Valor inesperado</code></pre></div>

        <div class="info-box">
            <strong>💡 ¿Error o Exception?</strong><br>
            • <strong>Error</strong>: Problemas internos de PHP (TypeError, ParseError). Normalmente NO deberías capturarlos.<br>
            • <strong>Exception</strong>: Problemas de tu aplicación. SÍ debes capturarlos y manejarlos.<br>
            • <strong>LogicException</strong>: Bugs que deberías arreglar en desarrollo.<br>
            • <strong>RuntimeException</strong>: Problemas que solo ocurren en ejecución (BD caída, archivo no existe).
        </div>

        <h3>Exception (Clase Base)</h3>
        <p>Todas las excepciones heredan de <code>Exception</code> y tienen estos métodos útiles:</p>
        
        <div class="code-block"><pre><code>&lt;?php
try {
    throw new Exception("Algo salió mal", 500);
} catch (Exception $e) {
    // Métodos disponibles en TODAS las excepciones:
    echo $e->getMessage();        // "Algo salió mal"
    echo $e->getCode();           // 500
    echo $e->getFile();           // "/ruta/archivo.php"
    echo $e->getLine();           // 42
    echo $e->getTrace();          // Array con stack trace
    echo $e->getTraceAsString();  // Stack trace como string
    echo $e->getPrevious();       // Excepción anterior (si existe)
    echo $e->__toString();        // Representación completa
}

// PHP 8+: Crear excepción con excepción anterior
try {
    try {
        throw new Exception("Error original");
    } catch (Exception $e) {
        throw new Exception("Error secundario", 0, $e);
    }
} catch (Exception $e) {
    echo $e->getMessage();           // "Error secundario"
    echo $e->getPrevious()->getMessage(); // "Error original"
}
?&gt;</code></pre></div>

        <h3>LogicException - Errores de Lógica (Bugs)</h3>
        <p>Usa estas excepciones para <strong>errores que deberían detectarse en desarrollo</strong>. Indican bugs en tu código:</p>
        
        <div class="code-block"><pre><code>&lt;?php
// 1️⃣ InvalidArgumentException - Argumento inválido
class Usuario {
    public function __construct(
        private string $nombre,
        private int $edad
    ) {
        if (empty($nombre)) {
            throw new InvalidArgumentException(
                "El nombre no puede estar vacío"
            );
        }
        
        if ($edad < 0 || $edad > 150) {
            throw new InvalidArgumentException(
                "La edad debe estar entre 0 y 150, $edad dado"
            );
        }
    }
}

// Uso:
try {
    $usuario = new Usuario("", -5);
} catch (InvalidArgumentException $e) {
    echo "Error de validación: " . $e->getMessage();
}

// 2️⃣ OutOfRangeException - Índice fuera de rango
function obtenerMes(int $numero): string {
    $meses = [
        1 => 'Enero', 2 => 'Febrero', 3 => 'Marzo',
        4 => 'Abril', 5 => 'Mayo', 6 => 'Junio',
        7 => 'Julio', 8 => 'Agosto', 9 => 'Septiembre',
        10 => 'Octubre', 11 => 'Noviembre', 12 => 'Diciembre'
    ];
    
    if ($numero < 1 || $numero > 12) {
        throw new OutOfRangeException(
            "El mes debe estar entre 1 y 12, $numero dado"
        );
    }
    
    return $meses[$numero];
}

// 3️⃣ DomainException - Valor fuera del dominio válido
class Calculadora {
    public function raizCuadrada(float $numero): float {
        if ($numero < 0) {
            throw new DomainException(
                "No se puede calcular la raíz cuadrada de un número negativo"
            );
        }
        return sqrt($numero);
    }
    
    public function logaritmo(float $numero): float {
        if ($numero <= 0) {
            throw new DomainException(
                "El logaritmo requiere un número positivo"
            );
        }
        return log($numero);
    }
}

// 4️⃣ LengthException - Longitud inválida
class ValidadorPassword {
    public function validar(string $password): bool {
        if (strlen($password) < 8) {
            throw new LengthException(
                "La contraseña debe tener al menos 8 caracteres"
            );
        }
        
        if (strlen($password) > 128) {
            throw new LengthException(
                "La contraseña no puede exceder 128 caracteres"
            );
        }
        
        return true;
    }
}

// 5️⃣ BadMethodCallException - Método llamado incorrectamente
class ServicioAPI {
    private bool $autenticado = false;
    
    public function autenticar(string $token): void {
        $this->autenticado = true;
    }
    
    public function obtenerDatos(): array {
        if (!$this->autenticado) {
            throw new BadMethodCallException(
                "Debes autenticarte antes de obtener datos"
            );
        }
        return ['data' => 'valores'];
    }
}
?&gt;</code></pre></div>

        <h3>RuntimeException - Errores en Tiempo de Ejecución</h3>
        <p>Usa estas excepciones para <strong>errores que solo se pueden detectar durante la ejecución</strong> (BD caída, archivo no existe, etc.):</p>
        
        <div class="code-block"><pre><code>&lt;?php
// 1️⃣ RuntimeException - Error genérico de runtime
class BaseDatos {
    public function conectar(string $host, string $user, string $pass): mysqli {
        $conexion = @mysqli_connect($host, $user, $pass);
        
        if (!$conexion) {
            throw new RuntimeException(
                "No se pudo conectar a la base de datos: " . mysqli_connect_error(),
                mysqli_connect_errno()
            );
        }
        
        return $conexion;
    }
    
    public function ejecutar(string $query): mysqli_result|bool {
        $resultado = mysqli_query($this->conexion, $query);
        
        if (!$resultado) {
            throw new RuntimeException(
                "Error al ejecutar query: " . mysqli_error($this->conexion)
            );
        }
        
        return $resultado;
    }
}

// 2️⃣ OutOfBoundsException - Acceso fuera de límites
class ColeccionSegura {
    private array $items = [];
    
    public function agregar(mixed $item): void {
        $this->items[] = $item;
    }
    
    public function obtener(int $indice): mixed {
        if (!isset($this->items[$indice])) {
            throw new OutOfBoundsException(
                "El índice $indice no existe. Índices válidos: 0-" . 
                (count($this->items) - 1)
            );
        }
        return $this->items[$indice];
    }
}

// 3️⃣ OverflowException - Overflow en estructura de datos
class ColaLimitada {
    private array $items = [];
    
    public function __construct(
        private readonly int $maxSize = 10
    ) {}
    
    public function agregar(mixed $item): void {
        if (count($this->items) >= $this->maxSize) {
            throw new OverflowException(
                "La cola ha alcanzado su capacidad máxima de {$this->maxSize} elementos"
            );
        }
        $this->items[] = $item;
    }
}

// 4️⃣ UnderflowException - Underflow en estructura de datos
class Pila {
    private array $items = [];
    
    public function push(mixed $item): void {
        $this->items[] = $item;
    }
    
    public function pop(): mixed {
        if (empty($this->items)) {
            throw new UnderflowException(
                "No se puede hacer pop de una pila vacía"
            );
        }
        return array_pop($this->items);
    }
}

// 5️⃣ UnexpectedValueException - Valor inesperado
class ProcesadorJSON {
    public function procesar(string $json): array {
        $datos = json_decode($json, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new UnexpectedValueException(
                "JSON inválido: " . json_last_error_msg()
            );
        }
        
        if (!is_array($datos)) {
            throw new UnexpectedValueException(
                "Se esperaba un array JSON, " . gettype($datos) . " dado"
            );
        }
        
        return $datos;
    }
}

// 6️⃣ RangeException - Valor fuera de rango permitido
class Temperatura {
    private float $celsius;
    
    public function setCelsius(float $celsius): void {
        // Temperatura absoluta mínima: -273.15°C
        if ($celsius < -273.15) {
            throw new RangeException(
                "La temperatura no puede ser menor a -273.15°C (cero absoluto)"
            );
        }
        $this->celsius = $celsius;
    }
}
?&gt;</code></pre></div>

        <h3>PHP 8+: TypeError (Error, no Exception)</h3>
        <p>PHP 8+ lanza <code>TypeError</code> automáticamente cuando hay problemas de tipos:</p>
        
        <div class="code-block"><pre><code>&lt;?php
declare(strict_types=1);

function sumar(int $a, int $b): int {
    return $a + $b;
}

try {
    // PHP 8+ con strict_types lanza TypeError
    sumar("5", "10");  // TypeError: debe ser int, string dado
} catch (TypeError $e) {
    echo "Error de tipo: " . $e->getMessage();
}

// PHP 8+: Union types también lanzan TypeError
function procesar(int|float $numero): string {
    return (string)$numero;
}

try {
    procesar("texto");  // TypeError: debe ser int|float, string dado
} catch (TypeError $e) {
    echo "Tipo incorrecto: " . $e->getMessage();
}

// PHP 8.1+: Intersection types
interface Loggable {}
interface Cacheable {}

function guardar(Loggable&Cacheable $objeto): void {
    // ...
}

try {
    guardar(new stdClass());  // TypeError
} catch (TypeError $e) {
    echo $e->getMessage();
}
?&gt;</code></pre></div>

        <h3>Ejemplo Completo: Uso Práctico</h3>
        <div class="code-block"><pre><code>&lt;?php
declare(strict_types=1);

class UsuarioService {
    public function crear(string $nombre, string $email, int $edad): array {
        // Validaciones (LogicException)
        if (empty($nombre)) {
            throw new InvalidArgumentException("El nombre es obligatorio");
        }
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException("Email inválido: $email");
        }
        
        if ($edad < 18 || $edad > 120) {
            throw new OutOfRangeException("Edad debe estar entre 18 y 120");
        }
        
        // Operación que puede fallar (RuntimeException)
        try {
            $resultado = $this->guardarEnBD($nombre, $email, $edad);
        } catch (RuntimeException $e) {
            // Re-lanzar con más contexto
            throw new RuntimeException(
                "Error al guardar usuario: " . $e->getMessage(),
                0,
                $e
            );
        }
        
        return $resultado;
    }
    
    private function guardarEnBD(string $nombre, string $email, int $edad): array {
        // Simular error de BD
        if (rand(0, 1)) {
            throw new RuntimeException("Conexión a BD perdida");
        }
        
        return ['id' => 1, 'nombre' => $nombre, 'email' => $email];
    }
}

// Uso con manejo específico
$service = new UsuarioService();

try {
    $usuario = $service->crear("Ana", "ana@example.com", 25);
    echo "Usuario creado: " . json_encode($usuario);
    
} catch (InvalidArgumentException $e) {
    // Error de validación - mostrar al usuario
    echo "Error de validación: " . $e->getMessage();
    
} catch (OutOfRangeException $e) {
    // Error de rango - mostrar al usuario
    echo "Valor fuera de rango: " . $e->getMessage();
    
} catch (RuntimeException $e) {
    // Error de sistema - loguear y mostrar mensaje genérico
    error_log($e->getMessage());
    echo "Error del sistema. Intenta más tarde.";
    
} catch (Throwable $e) {
    // Captura TODO (último recurso)
    error_log("Error inesperado: " . $e->getMessage());
    echo "Error inesperado";
}
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Guía Rápida: ¿Qué Excepción Usar?</strong><br>
            <strong>Validación de parámetros:</strong> <code>InvalidArgumentException</code><br>
            <strong>Índice/rango inválido:</strong> <code>OutOfRangeException</code> o <code>OutOfBoundsException</code><br>
            <strong>Longitud incorrecta:</strong> <code>LengthException</code><br>
            <strong>Valor matemático inválido:</strong> <code>DomainException</code><br>
            <strong>Error de BD/archivo/red:</strong> <code>RuntimeException</code><br>
            <strong>Estructura llena:</strong> <code>OverflowException</code><br>
            <strong>Estructura vacía:</strong> <code>UnderflowException</code><br>
            <strong>Valor inesperado:</strong> <code>UnexpectedValueException</code><br>
            <strong>Método mal llamado:</strong> <code>BadMethodCallException</code>
        </div>

        <div class="warning-box">
            <strong>⚠️ Buenas Prácticas:</strong><br>
            • Usa la excepción <strong>más específica</strong> posible (no solo <code>Exception</code>)<br>
            • <strong>LogicException</strong> = bugs que debes arreglar<br>
            • <strong>RuntimeException</strong> = problemas externos (BD, archivos)<br>
            • NO captures <code>Error</code> (solo <code>Exception</code> y sus hijos)<br>
            • Captura excepciones específicas primero, genéricas después<br>
            • Usa <code>getPrevious()</code> para mantener contexto de errores
        </div>

        <div class="info-box">
            <strong>💡 Resumen:</strong><br>
            • <strong>Exception</strong>: Clase base de todas las excepciones<br>
            • <strong>LogicException</strong>: Errores de programación (bugs)<br>
            • <strong>RuntimeException</strong>: Errores en ejecución (BD, archivos)<br>
            • <strong>TypeError</strong>: PHP 8+ lo lanza automáticamente<br>
            • Cada excepción tiene un <strong>propósito específico</strong> - úsalas correctamente
        </div>

// OverflowException - Overflow en estructura de datos
class ColaLimitada {
    private $items = [];
    private $maxSize;
    
    public function __construct($maxSize = 10) {
        $this->maxSize = $maxSize;
    }
    
    public function agregar($item) {
        if (count($this->items) >= $this->maxSize) {
            throw new OverflowException(
                "La cola ha alcanzado su capacidad máxima de {$this->maxSize}"
            );
        }
        $this->items[] = $item;
    }
}

// UnderflowException - Underflow en estructura de datos
class Pila {
    private $items = [];
    
    public function pop() {
        if (empty($this->items)) {
            throw new UnderflowException(
                "No se puede hacer pop de una pila vacía"
            );
        }
        return array_pop($this->items);
    }
}

// UnexpectedValueException - Valor inesperado
class Procesador {
    public function procesar($datos) {
        if (!is_array($datos)) {
            throw new UnexpectedValueException(
                "Se esperaba un array, " . gettype($datos) . " dado"
            );
        }
        
        if (empty($datos)) {
            throw new UnexpectedValueException(
                "El array no puede estar vacío"
            );
        }
    }
}
?&gt;</code></pre></div>

        <h3>Error - Errores del Motor de PHP</h3>
        <p>PHP 7+ introdujo la clase Error para errores internos:</p>
        
        <div class="code-block"><pre><code>&lt;?php
// TypeError - Error de tipo (PHP 7+)
function sumar(int $a, int $b): int {
    return $a + $b;
}

try {
    sumar("texto", 5);
} catch (TypeError $e) {
    echo "Error de tipo: " . $e->getMessage();
    // Error de tipo: Argument 1 must be of type int, string given
}

// DivisionByZeroError - División por cero (PHP 7+)
try {
    $resultado = intdiv(10, 0);
} catch (DivisionByZeroError $e) {
    echo "División por cero detectada";
}

// ArithmeticError - Error aritmético
try {
    $resultado = 1 << -1;  // Shift negativo
} catch (ArithmeticError $e) {
    echo "Error aritmético: " . $e->getMessage();
}

// ParseError - Error de sintaxis en eval()
try {
    eval('$x = ;');  // Sintaxis inválida
} catch (ParseError $e) {
    echo "Error de sintaxis: " . $e->getMessage();
}

// AssertionError - Assertion fallida (PHP 7+)
ini_set('zend.assertions', 1);
ini_set('assert.exception', 1);

try {
    assert(false, "La aserción falló");
} catch (AssertionError $e) {
    echo "Aserción falló: " . $e->getMessage();
}
?&gt;</code></pre></div>

        <h3>Capturar Cualquier Throwable</h3>
        <div class="code-block"><pre><code>&lt;?php
// Throwable captura tanto Exception como Error
try {
    // Código que puede lanzar Exception o Error
    throw new TypeError("Error de tipo");
} catch (Throwable $e) {
    // Captura TODOS los errores y excepciones
    echo "Algo salió mal: " . $e->getMessage();
    
    // Verificar tipo específico
    if ($e instanceof Error) {
        echo "Es un Error del motor PHP";
    } elseif ($e instanceof Exception) {
        echo "Es una Exception de usuario";
    }
}

// Ejemplo práctico: función con manejo robusto
function ejecutarSeguro(callable $funcion) {
    try {
        return $funcion();
    } catch (Throwable $e) {
        // Log del error
        error_log(sprintf(
            "[%s] %s en %s:%d",
            get_class($e),
            $e->getMessage(),
            $e->getFile(),
            $e->getLine()
        ));
        
        // Retornar null en caso de error
        return null;
    }
}

$resultado = ejecutarSeguro(function() {
    return 10 / 0;  // Lanza DivisionByZeroError
});
?&gt;</code></pre></div>

        <div class="info-box">
            <strong>💡 Guía de Uso:</strong><br>
            • <strong>LogicException</strong>: Errores que deberían prevenirse (validación, argumentos)<br>
            • <strong>RuntimeException</strong>: Errores que solo aparecen en tiempo de ejecución (DB, archivos)<br>
            • <strong>InvalidArgumentException</strong>: La más usada para validación de parámetros<br>
            • <strong>Error</strong>: Errores internos de PHP, generalmente no debes lanzarlos tú<br>
            • <strong>Throwable</strong>: Usa en catch cuando quieres capturar TODO
        </div>
    `
};

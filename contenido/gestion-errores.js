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
        <h1>Clases de Excepciones Estándar</h1>
        
        <p>PHP proporciona una jerarquía completa de clases de excepciones para manejar diferentes tipos de errores de forma orientada a objetos.</p>

        <h3>Jerarquía de Excepciones</h3>
        <div class="code-block"><pre><code>Throwable (interface)
├── Error
│   ├── ParseError
│   ├── TypeError
│   ├── ArgumentCountError
│   ├── ArithmeticError
│   │   └── DivisionByZeroError
│   ├── CompileError
│   └── AssertionError
└── Exception
    ├── LogicException
    │   ├── BadFunctionCallException
    │   │   └── BadMethodCallException
    │   ├── DomainException
    │   ├── InvalidArgumentException
    │   ├── LengthException
    │   └── OutOfRangeException
    └── RuntimeException
        ├── OutOfBoundsException
        ├── OverflowException
        ├── RangeException
        ├── UnderflowException
        └── UnexpectedValueException</code></pre></div>

        <h3>Exception (Clase Base)</h3>
        <div class="code-block"><pre><code>&lt;?php
try {
    throw new Exception("Mensaje de error", 500);
} catch (Exception $e) {
    echo $e->getMessage();     // "Mensaje de error"
    echo $e->getCode();        // 500
    echo $e->getFile();        // Archivo donde se lanzó
    echo $e->getLine();        // Línea donde se lanzó
    echo $e->getTrace();       // Array del stack trace
    echo $e->getTraceAsString(); // Stack trace como string
    echo $e->getPrevious();    // Excepción anterior (si existe)
    echo $e->__toString();     // Representación completa
}
?&gt;</code></pre></div>

        <h3>LogicException - Errores de Lógica</h3>
        <p>Se usan para errores que deberían detectarse en desarrollo:</p>
        
        <div class="code-block"><pre><code>&lt;?php
// InvalidArgumentException - Argumento inválido
function establecerEdad($edad) {
    if (!is_int($edad)) {
        throw new InvalidArgumentException(
            "La edad debe ser un entero, " . gettype($edad) . " dado"
        );
    }
    
    if ($edad < 0 || $edad > 150) {
        throw new OutOfRangeException(
            "La edad debe estar entre 0 y 150, $edad dado"
        );
    }
    
    return $edad;
}

// DomainException - Valor fuera del dominio válido
class Calculadora {
    public function logaritmo($numero) {
        if ($numero <= 0) {
            throw new DomainException(
                "El logaritmo requiere un número positivo"
            );
        }
        return log($numero);
    }
}

// LengthException - Longitud inválida
function validarPassword($password) {
    if (strlen($password) < 8) {
        throw new LengthException(
            "La contraseña debe tener al menos 8 caracteres"
        );
    }
}

// BadMethodCallException - Método no válido
class MagicClass {
    private $metodos = ['metodo1', 'metodo2'];
    
    public function __call($name, $args) {
        if (!in_array($name, $this->metodos)) {
            throw new BadMethodCallException(
                "El método $name no existe"
            );
        }
    }
}
?&gt;</code></pre></div>

        <h3>RuntimeException - Errores en Tiempo de Ejecución</h3>
        <p>Para errores que solo se pueden detectar durante la ejecución:</p>
        
        <div class="code-block"><pre><code>&lt;?php
// RuntimeException - Error genérico de runtime
class BaseDatos {
    public function conectar($host, $user, $pass) {
        $conexion = @mysqli_connect($host, $user, $pass);
        
        if (!$conexion) {
            throw new RuntimeException(
                "No se pudo conectar a la base de datos: " . mysqli_connect_error(),
                mysqli_connect_errno()
            );
        }
        
        return $conexion;
    }
}

// OutOfBoundsException - Índice fuera de límites
class ColeccionSegura {
    private $items = [];
    
    public function get($indice) {
        if (!isset($this->items[$indice])) {
            throw new OutOfBoundsException(
                "El índice $indice no existe en la colección"
            );
        }
        return $this->items[$indice];
    }
}

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

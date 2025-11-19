// Contenido: Sintaxis y Tipos de Datos
const sintaxisTiposDatos = {
    'declaracion-variables': `
        <h1>Declaración de Variables y Constantes</h1>
        
        <p>En PHP, las variables son contenedores dinámicos que pueden almacenar diferentes tipos de datos sin necesidad de declarar el tipo explícitamente. PHP es un lenguaje de tipado dinámico, lo que significa que el tipo de una variable se determina en tiempo de ejecución.</p>

        <h3>Variables en PHP</h3>
        <p>Las variables en PHP siempre comienzan con el símbolo <code>$</code> seguido del nombre de la variable. Los nombres de variables son case-sensitive y deben comenzar con una letra o guion bajo.</p>
        
        <div class="code-block"><pre><code>&lt;?php
// Declaración básica de variables
$nombre = "Juan";           // String
$edad = 25;                 // Integer
$activo = true;             // Boolean
$precio = 19.99;            // Float
$datosNull = null;          // Null

// Convenciones de nombres
$nombreCompleto = "Juan Pérez";     // camelCase ✓
$nombre_completo = "Juan Pérez";    // snake_case ✓
$CONSTANTE_VALOR = 100;             // UPPERCASE para constantes ✓

// Variables case-sensitive
$nombre = "Juan";
$Nombre = "Pedro";
$NOMBRE = "María";
// Estas son tres variables diferentes!

echo $nombre;  // Output: Juan
echo $Nombre;  // Output: Pedro
echo $NOMBRE;  // Output: María
?&gt;</code></pre></div>

        <h3>Variables Variables</h3>
        <p>PHP permite usar el valor de una variable como el nombre de otra variable. Esto se conoce como "variables variables".</p>
        
        <div class="code-block"><pre><code>&lt;?php
// Variables variables
$campo = "nombre";
$$campo = "Juan";  // Equivale a: $nombre = "Juan"

echo $nombre;      // Output: Juan
echo $$campo;      // Output: Juan

// Ejemplo práctico
$propiedades = ['titulo', 'descripcion', 'precio'];

foreach ($propiedades as $propiedad) {
    $$propiedad = "Valor de $propiedad";
}

echo $titulo;       // Output: Valor de titulo
echo $descripcion;  // Output: Valor de descripcion
echo $precio;       // Output: Valor de precio
?&gt;</code></pre></div>

        <h3>Constantes con define()</h3>
        <p>Las constantes son valores inmutables que no cambian durante la ejecución del script. Se definen con <code>define()</code> o <code>const</code>.</p>
        
        <div class="code-block"><pre><code>&lt;?php
// Constantes con define() - Scope global
define('SITIO_NOMBRE', 'Mi Sitio Web');
define('VERSION', '1.0.0');
define('MAX_USUARIOS', 100);
define('PI', 3.14159);

// Acceso sin $
echo SITIO_NOMBRE;  // Output: Mi Sitio Web
echo VERSION;       // Output: 1.0.0

// Constantes insensibles a mayúsculas (no recomendado)
define('saludo', 'Hola', true);
echo SALUDO;  // Output: Hola
echo saludo;  // Output: Hola

// Verificar si existe una constante
if (defined('SITIO_NOMBRE')) {
    echo "La constante existe";
}

// Constantes de arrays (PHP 7+)
define('COLORES', [
    'rojo' => '#FF0000',
    'verde' => '#00FF00',
    'azul' => '#0000FF'
]);

echo COLORES['rojo'];  // Output: #FF0000
?&gt;</code></pre></div>

        <h3>Constantes con const</h3>
        <p>La palabra clave <code>const</code> define constantes en tiempo de compilación y tiene alcance de namespace.</p>
        
        <div class="code-block"><pre><code>&lt;?php
// Constantes con const - Tiempo de compilación
const MAX_INTENTOS = 3;
const API_KEY = 'tu-api-key-segura';
const TIMEOUT = 30;

// Dentro de clases
class Configuracion {
    const DB_HOST = 'localhost';
    const DB_PORT = 3306;
    const DB_NAME = 'mi_database';
    
    // Constantes con visibilidad (PHP 7.1+)
    private const DB_PASSWORD = 'secreto';
    protected const CACHE_TIME = 3600;
    public const VERSION = '2.0';
}

// Acceso a constantes de clase
echo Configuracion::DB_HOST;    // Output: localhost
echo Configuracion::VERSION;    // Output: 2.0

// Diferencias entre define() y const:
// 1. const se evalúa en tiempo de compilación
// 2. const no puede estar dentro de bloques condicionales
// 3. const soporta namespaces
// 4. const es más rápido
?&gt;</code></pre></div>

        <h3>Constantes Mágicas</h3>
        <p>PHP proporciona constantes mágicas predefinidas que cambian según el contexto donde se usan.</p>
        
        <div class="code-block"><pre><code>&lt;?php
// Constantes mágicas (comienzan y terminan con __)
echo __FILE__;      // Ruta completa del archivo actual
echo __DIR__;       // Directorio del archivo actual
echo __LINE__;      // Número de línea actual
echo __FUNCTION__;  // Nombre de la función actual
echo __CLASS__;     // Nombre de la clase actual
echo __METHOD__;    // Nombre del método actual (Clase::metodo)
echo __NAMESPACE__; // Nombre del namespace actual
echo __TRAIT__;     // Nombre del trait (PHP 5.4+)

// Ejemplo práctico
function registrarError($mensaje) {
    $log = sprintf(
        "[%s:%d] %s - %s",
        __FILE__,
        __LINE__,
        __FUNCTION__,
        $mensaje
    );
    error_log($log);
}

class Logger {
    public function info($mensaje) {
        echo __METHOD__ . ": $mensaje";
        // Output: Logger::info: [mensaje]
    }
}

// Constantes útiles del sistema
echo PHP_VERSION;        // Versión de PHP
echo PHP_OS;            // Sistema operativo
echo PHP_EOL;           // Salto de línea del sistema
echo PHP_INT_MAX;       // Valor máximo de integer
echo PHP_FLOAT_MAX;     // Valor máximo de float
?&gt;</code></pre></div>

        <div class="info-box">
            <strong>💡 Buenas Prácticas:</strong><br>
            • Usa <code>const</code> para constantes de clase y dentro de namespaces<br>
            • Usa <code>define()</code> solo cuando necesites constantes dinámicas o condicionales<br>
            • Nombra las constantes en MAYÚSCULAS con guiones bajos<br>
            • No uses constantes para valores que puedan cambiar entre entornos (usa variables de entorno)<br>
            • Las constantes son globales por defecto, úsalas con moderación
        </div>

        <h3>Ámbito de Variables (Scope)</h3>
        <div class="code-block"><pre><code>&lt;?php
// Scope global
$globalVar = "Soy global";

function ejemplo() {
    // Scope local
    $localVar = "Soy local";
    
    // Acceder a variable global
    global $globalVar;
    echo $globalVar;  // Output: Soy global
    
    // Alternativa con $GLOBALS
    echo $GLOBALS['globalVar'];
}

// Variables estáticas
function contador() {
    static $cuenta = 0;
    $cuenta++;
    return $cuenta;
}

echo contador();  // 1
echo contador();  // 2
echo contador();  // 3
// La variable $cuenta mantiene su valor entre llamadas
?&gt;</code></pre></div>

<div class="warning-box">
    <strong>⚠️ Advertencia:</strong> Evita usar variables globales en exceso. Pueden hacer tu código difícil de mantener y probar. Prefiere pasar variables como parámetros o usar inyección de dependencias.
</div>
    `,

    'tipos-escalares': `
        <h1>Tipos Escalares y Compuestos en PHP 8+</h1>
        
<p>PHP 8+ ofrece un sistema de tipos robusto con <strong>typed properties, union types, y mejor validación</strong>. Los tipos se dividen en escalares (valores simples) y compuestos (estructuras complejas).</p>

<h3>Tipos Escalares</h3>

<h4>1. Integer</h4>
<div class="code-block"><pre><code>&lt;?php
// Diferentes bases
$decimal = 42;
$hex = 0xFF;                // 255
$octal = 0o755;             // 493 (PHP 8.1+: prefijo 0o)
$binario = 0b1010;          // 10

// Separadores (PHP 7.4+) - mejora legibilidad
$millon = 1_000_000;
$tarjeta = 1234_5678_9012_3456;

// PHP 8+: Typed properties
class Contador {
    public function __construct(
        private int $valor = 0,
        public readonly int $maximo = 100  // PHP 8.1+
    ) {}
    
    public function incrementar(): int {
        return min(++$this->valor, $this->maximo);
    }
}

// Verificación
var_dump(is_int(42));       // true
echo PHP_INT_MAX;           // 9223372036854775807 (64-bit)
?&gt;</code></pre></div>

<h4>2. Float</h4>
        
        <div class="code-block"><pre><code>&lt;?php
// Números decimales
$precio = 19.99;
$temperatura = -15.5;

// Notación científica
$avogadro = 6.022e23;       // 6.022 × 10^23
$electron = 9.109e-31;      // 9.109 × 10^-31
$millon = 1.0e6;            // 1000000.0

// Separadores (PHP 7.4+)
$pi = 3.141_592_653_589;

// Valores especiales
$infinito = INF;
$menosInfinito = -INF;
$noNumero = NAN;            // Not a Number

// Verificaciones especiales
var_dump(is_finite(10.5));  // true
var_dump(is_infinite(INF)); // true
var_dump(is_nan(NAN));      // true

// Precisión de floats
echo PHP_FLOAT_MAX;         // Valor máximo
echo PHP_FLOAT_MIN;         // Valor mínimo positivo
echo PHP_FLOAT_EPSILON;     // Diferencia más pequeña

// ⚠️ Problema de precisión de floats
$a = 0.1 + 0.2;
var_dump($a === 0.3);       // false! (problema de precisión)
var_dump(abs($a - 0.3) < 0.00001); // true (comparación correcta)

// Conversión
$flotante = (float)"3.14159";
$flotante = floatval("2.718");
var_dump(is_float($flotante)); // true
?&gt;</code></pre></div>

        <div class="warning-box">
            <strong>⚠️ Precisión de Floats:</strong> Nunca compares floats con <code>===</code>. Los números de punto flotante tienen problemas de precisión inherentes. Usa una función que compare con un margen de error (epsilon).
        </div>

        <h4>3. String</h4>
        <div class="code-block"><pre><code>&lt;?php
// Comillas simples vs dobles
$nombre = 'Juan';
$mensaje = "Hola, $nombre!";  // Interpola variables

// PHP 8.0+: Nuevas funciones de string
$email = "usuario@example.com";
var_dump(str_contains($email, '@'));          // true
var_dump(str_starts_with($email, 'usuario')); // true
var_dump(str_ends_with($email, '.com'));      // true

// Heredoc con indentación flexible (PHP 7.3+)
$html = &lt;&lt;&lt;HTML
    &lt;div&gt;
        &lt;h1&gt;$nombre&lt;/h1&gt;
    &lt;/div&gt;
    HTML;  // Puede estar indentado

// Acceso a caracteres
$palabra = "Hola";
echo $palabra[0];     // "H"
echo $palabra[-1];    // "a" (desde el final, PHP 7.1+)

// Funciones comunes
strlen($palabra);                  // 4
strtoupper($palabra);              // "HOLA"
str_replace('o', '0', $palabra);   // "H0la"
substr($palabra, 0, 2);            // "Ho"
?&gt;</code></pre></div>

        <h4>4. Boolean (Booleano)</h4>
        <div class="code-block"><pre><code>&lt;?php
// Valores booleanos
$verdadero = true;
$falso = false;

// Valores que se evalúan como false (falsy)
var_dump((bool)0);          // false
var_dump((bool)0.0);        // false
var_dump((bool)"");         // false
var_dump((bool)"0");        // false
var_dump((bool)null);       // false
var_dump((bool)[]);         // false (array vacío)

// Valores que se evalúan como true (truthy)
var_dump((bool)1);          // true
var_dump((bool)-1);         // true
var_dump((bool)"false");    // true! (string no vacío)
var_dump((bool)" ");        // true (string con espacio)
var_dump((bool)[0]);        // true (array con elementos)

// Conversión explícita
$bool = (bool)"texto";
$bool = boolval(123);
var_dump(is_bool($bool));   // true

// Uso en condicionales
if ($activo) {
    echo "Usuario activo";
}

// Operador ternario
$mensaje = $activo ? "Activo" : "Inactivo";
?&gt;</code></pre></div>

        <h3>Tipos Compuestos</h3>
        
        <h4>5. Array</h4>
        <div class="code-block"><pre><code>&lt;?php
// Array indexado (numérico)
$frutas = ["manzana", "naranja", "plátano"];
$numeros = array(1, 2, 3, 4, 5);  // Sintaxis antigua

// Acceso por índice (comienza en 0)
echo $frutas[0];        // "manzana"
echo $frutas[2];        // "plátano"

// Array asociativo (clave => valor)
$persona = [
    "nombre" => "Ana",
    "edad" => 30,
    "ciudad" => "Madrid",
    "activo" => true
];

echo $persona["nombre"];  // "Ana"
echo $persona["edad"];    // 30

// Array multidimensional
$usuarios = [
    [
        "id" => 1,
        "nombre" => "Juan",
        "roles" => ["admin", "editor"]
    ],
    [
        "id" => 2,
        "nombre" => "María",
        "roles" => ["usuario"]
    ]
];

echo $usuarios[0]["nombre"];        // "Juan"
echo $usuarios[0]["roles"][0];      // "admin"

// Añadir elementos
$frutas[] = "uva";                  // Al final
$persona["email"] = "ana@example.com";

// Array destructuring (PHP 7.1+)
[$primero, $segundo, $tercero] = $frutas;
["nombre" => $nombre, "edad" => $edad] = $persona;

// Spread operator (PHP 7.4+)
$arr1 = [1, 2, 3];
$arr2 = [4, 5, 6];
$combinado = [...$arr1, ...$arr2];  // [1,2,3,4,5,6]

// Funciones útiles
count($frutas);                     // 4
in_array("manzana", $frutas);       // true
array_key_exists("nombre", $persona); // true
array_keys($persona);               // ["nombre", "edad", "ciudad", "activo"]
array_values($persona);             // ["Ana", 30, "Madrid", true]
array_merge($arr1, $arr2);
array_map(fn($x) => $x * 2, $numeros);
array_filter($numeros, fn($x) => $x > 2);
?&gt;</code></pre></div>

        <h4>6. Object</h4>
        <div class="code-block"><pre><code>&lt;?php
// PHP 8+: Constructor Property Promotion
class Usuario {
    public function __construct(
        public string $nombre,
        public readonly string $email,  // PHP 8.1+ inmutable
        private string $password = ''
    ) {}
    
    public function saludar(): string {
        return "Hola, soy {$this->nombre}";
    }
}

// Crear con named arguments
$user = new Usuario(
    nombre: "Carlos",
    email: "carlos@example.com"
);

echo $user->nombre;          // "Carlos"
echo $user->saludar();       // "Hola, soy Carlos"

// PHP 8.0+: Nullsafe operator
$ciudad = $user?->direccion?->ciudad ?? "Desconocida";

// stdClass para datos dinámicos
$config = (object)['debug' => true, 'cache' => false];
echo $config->debug;  // true
?&gt;</code></pre></div>

        <h3>Tipos Especiales</h3>
        
        <h4>7. NULL</h4>
        <div class="code-block"><pre><code>&lt;?php
// NULL representa la ausencia de valor
$vacio = null;
$noDefinido = NULL;  // Case-insensitive

// Variables que son null
$a;                  // Variable no asignada
$b = null;          // Asignación explícita
unset($c);          // Variable eliminada

// Verificar null
var_dump(is_null($vacio));        // true
var_dump($vacio === null);        // true
var_dump(isset($vacio));          // false
var_dump(empty($vacio));          // true

// Null coalescing operator (??)
$nombre = $usuario ?? "Invitado";
$edad = $_GET['edad'] ?? 18;

// Null coalescing assignment (??=)
$config['timeout'] ??= 30;  // Asigna solo si es null

// Nullsafe operator (PHP 8.0+)
$longitud = $usuario?->nombre?->length();
// No lanza error si $usuario o $nombre son null
?&gt;</code></pre></div>

        <h3>Tipos Especiales y Union Types (PHP 8+)</h3>
        
        <div class="code-block"><pre><code>&lt;?php
// PHP 8.0+: Union Types
function procesar(int|float $numero): string|int {
    return $numero > 10 ? "grande" : 0;
}

procesar(5);      // OK: int
procesar(3.14);   // OK: float

// PHP 8.0+: Mixed type (cualquier tipo)
function flexble(mixed $dato): mixed {
    return $dato;
}

// PHP 8.1+: Intersection Types
interface Loggable {}
interface Cacheable {}

function guardar(Loggable&Cacheable $obj): void {
    // $obj debe implementar AMBAS interfaces
}

// PHP 8.0+: Nullsafe operator
$usuario = obtenerUsuario();
$email = $usuario?->contacto?->email ?? "no-email@example.com";

// PHP 8.1+: Readonly properties
class Punto {
    public function __construct(
        public readonly float $x,
        public readonly float $y
    ) {}
}

$p = new Punto(10.5, 20.3);
// $p->x = 15;  // ❌ Error: Cannot modify readonly

// PHP 8.1+: Enums
enum Estado: string {
    case ACTIVO = 'activo';
    case INACTIVO = 'inactivo';
    case SUSPENDIDO = 'suspendido';
}

$estado = Estado::ACTIVO;
echo $estado->value;  // "activo"
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Novedades PHP 8+:</strong><br>
            • <strong>Union Types</strong> (8.0): <code>int|string|null</code><br>
            • <strong>Intersection Types</strong> (8.1): <code>Interface1&Interface2</code><br>
            • <strong>Readonly Properties</strong> (8.1): Inmutables después de inicialización<br>
            • <strong>Enums</strong> (8.1): Tipos enumerados nativos<br>
            • <strong>Nullsafe Operator</strong> (8.0): <code>?-></code> para evitar errores con null<br>
            • <strong>Constructor Property Promotion</strong> (8.0): Sintaxis concisa<br>
            • <strong>Named Arguments</strong> (8.0): Argumentos por nombre<br>
            • <strong>Match Expression</strong> (8.0): Reemplazo moderno de switch<br>
            • <strong>Nuevas funciones de string</strong> (8.0): <code>str_contains()</code>, <code>str_starts_with()</code>, <code>str_ends_with()</code>
        </div>
    `
};

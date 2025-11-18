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
        <h1>Tipos Escalares y Compuestos</h1>
        
        <p>PHP soporta varios tipos de datos que se clasifican en tipos escalares (valores simples) y tipos compuestos (valores complejos que contienen múltiples valores).</p>

        <h3>Tipos Escalares</h3>
        <p>Los tipos escalares representan un único valor. PHP tiene cuatro tipos escalares principales:</p>

        <h4>1. Integer (Entero)</h4>
        <div class="code-block"><pre><code>&lt;?php
// Decimal (base 10)
$decimal = 42;
$negativo = -15;

// Hexadecimal (base 16) - prefijo 0x
$hexadecimal = 0x1A;        // 26 en decimal
$colorHex = 0xFF0000;       // 16711680 (rojo en RGB)

// Octal (base 8) - prefijo 0
$octal = 0755;              // 493 en decimal

// Binario (base 2) - prefijo 0b (PHP 5.4+)
$binario = 0b1010;          // 10 en decimal
$permisos = 0b111101101;    // 493 en decimal

// Separadores numéricos (PHP 7.4+)
$millon = 1_000_000;
$bytes = 0xFF_FF_FF;
$binarioLargo = 0b0101_1111;

// Información del sistema
echo PHP_INT_MAX;           // Valor máximo de integer
echo PHP_INT_MIN;           // Valor mínimo de integer (PHP 7.0+)
echo PHP_INT_SIZE;          // Tamaño en bytes (4 o 8)

// Conversión y verificación
$numero = "123";
$entero = (int)$numero;
var_dump(is_int($entero));  // bool(true)
var_dump(is_integer($entero)); // Alias de is_int
?&gt;</code></pre></div>

        <h4>2. Float (Punto Flotante / Double)</h4>
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

        <h4>3. String (Cadena de Texto)</h4>
        <div class="code-block"><pre><code>&lt;?php
// Comillas simples - literal
$nombre = 'Juan';
$path = 'C:\\Users\\Juan\\Documents';  // Necesita escapar \\

// Comillas dobles - interpola variables
$apellido = "Pérez";
$nombreCompleto = "$nombre $apellido";  // "Juan Pérez"
$mensaje = "Hola, {$nombre}!";          // Llaves opcionales

// Secuencias de escape en comillas dobles
$texto = "Línea 1\\nLínea 2\\tTabulado";
$unicode = "\\u{1F600}";  // 😀 emoji (PHP 7.0+)

// Heredoc - para strings multilínea
$html = &lt;&lt;&lt;HTML
&lt;div class="container"&gt;
    &lt;h1&gt;$nombre&lt;/h1&gt;
    &lt;p&gt;Este es un texto largo&lt;/p&gt;
&lt;/div&gt;
HTML;

// Nowdoc - como heredoc pero sin interpolación (PHP 5.3+)
$codigo = &lt;&lt;&lt;'CODE'
function ejemplo() {
    echo $variable;  // No se interpola
    return true;
}
CODE;

// String wrapping (PHP 7.3+)
$query = &lt;&lt;&lt;SQL
    SELECT *
    FROM usuarios
    WHERE estado = 'activo'
        AND edad &gt;= 18
    ORDER BY nombre
SQL;

// Concatenación
$saludo = "Hola" . " " . "Mundo";
$nombre .= " Pérez";  // Append

// Acceso a caracteres (como array)
$palabra = "Hola";
echo $palabra[0];     // "H"
echo $palabra[-1];    // "a" (desde el final, PHP 7.1+)

// Funciones útiles
strlen($palabra);           // 4 (longitud)
strtoupper($palabra);       // "HOLA"
strtolower($palabra);       // "hola"
ucfirst($palabra);          // "Hola"
str_replace('o', '0', $palabra); // "H0la"
substr($palabra, 0, 2);     // "Ho"
strpos($palabra, 'la');     // 2 (posición)
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

        <h4>6. Object (Objeto)</h4>
        <div class="code-block"><pre><code>&lt;?php
// Definición de clase
class Usuario {
    public $nombre;
    public $email;
    private $password;
    
    public function __construct($nombre, $email) {
        $this->nombre = $nombre;
        $this->email = $email;
    }
    
    public function saludar() {
        return "Hola, soy {$this->nombre}";
    }
}

// Crear objeto
$user = new Usuario("Carlos", "carlos@example.com");

// Acceder a propiedades y métodos
echo $user->nombre;          // "Carlos"
echo $user->saludar();       // "Hola, soy Carlos"

// Propiedades dinámicas
$user->edad = 25;
echo $user->edad;            // 25

// Objeto stdClass (objeto genérico)
$producto = new stdClass();
$producto->nombre = "Laptop";
$producto->precio = 999.99;

// Conversión de array a objeto
$datos = ["x" => 10, "y" => 20];
$punto = (object)$datos;
echo $punto->x;              // 10

// Verificación
var_dump(is_object($user));  // true
var_dump($user instanceof Usuario); // true

// Información del objeto
get_class($user);            // "Usuario"
get_object_vars($user);      // Array de propiedades públicas
method_exists($user, 'saludar'); // true
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

        <h4>8. Resource (Recurso)</h4>
        <div class="code-block"><pre><code>&lt;?php
// Resource: referencias a recursos externos
// Ejemplos: conexiones de base de datos, archivos, streams

// Archivo
$archivo = fopen("datos.txt", "r");
var_dump(is_resource($archivo));  // true
var_dump(get_resource_type($archivo)); // "stream"

// Base de datos
$conexion = mysqli_connect("localhost", "user", "pass");
var_dump(is_resource($conexion));  // true

// cURL
$ch = curl_init("https://api.example.com");
var_dump(is_resource($ch));       // true

// Cerrar recursos
fclose($archivo);
mysqli_close($conexion);
curl_close($ch);

// Nota: Muchos recursos están siendo reemplazados por 
// objetos en PHP 8+ (por ejemplo, mysqli_connect ahora 
// retorna un objeto mysqli)
?&gt;</code></pre></div>

        <div class="info-box">
            <strong>💡 Verificación de Tipos:</strong><br>
            • <code>gettype($var)</code> - Retorna el tipo como string<br>
            • <code>is_int()</code>, <code>is_float()</code>, <code>is_string()</code>, <code>is_bool()</code><br>
            • <code>is_array()</code>, <code>is_object()</code>, <code>is_null()</code>, <code>is_resource()</code><br>
            • <code>is_numeric()</code> - Verifica si es número o string numérico<br>
            • <code>is_callable()</code> - Verifica si es invocable como función
        </div>
    `
};

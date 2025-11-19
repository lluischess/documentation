// Loader central que combina todo el contenido
const allContent = {
    // Sintaxis y Tipos de Datos
    ...sintaxisTiposDatos,
    
    // Operadores y Estructuras
    'coercion-tipos': `
        <h1>Coerción de Tipos y Comparaciones en PHP 8+</h1>
        
        <p>PHP 8+ mejora el sistema de tipos con <strong>strict_types, union types, y mejor validación</strong>. Aunque permite coerción automática, es recomendable usar tipos estrictos.</p>

        <h3>Strict Types (PHP 7.0+)</h3>
        <div class="code-block"><pre><code>&lt;?php
declare(strict_types=1);  // SIEMPRE en la primera línea

function sumar(int $a, int $b): int {
    return $a + $b;
}

// Con strict_types=1
sumar(5, 10);        // ✅ OK: 15
// sumar("5", "10"); // ❌ TypeError

// Sin strict_types (coerción automática)
// sumar("5", "10"); // ✅ OK: convierte a int
?&gt;</code></pre></div>

        <h3>Comparaciones: == vs ===</h3>
        <div class="code-block"><pre><code>&lt;?php
// Comparación débil (==) - con coerción
var_dump(5 == "5");          // true (coerción)
var_dump(0 == false);        // true
var_dump("" == false);       // true
var_dump(null == false);     // true

// Comparación estricta (===) - sin coerción
var_dump(5 === "5");         // false (tipos diferentes)
var_dump(0 === false);       // false
var_dump("" === false);      // false
var_dump(null === false);    // false

// PHP 8+: Comparaciones más consistentes
var_dump(0 == "texto");      // false (PHP 8+ arregla bug)
// En PHP 7: true (bug)
?&gt;</code></pre></div>

        <h3>PHP 8.0+: Match Expression</h3>
        <p>Match usa comparación estricta (===) por defecto, a diferencia de switch (==):</p>
        
        <div class="code-block"><pre><code>&lt;?php
$valor = "0";

// Match: comparación estricta
$resultado = match($valor) {
    0 => "número cero",      // No coincide ("0" !== 0)
    "0" => "string cero",    // ✅ Coincide
    default => "otro"
};

// Switch: comparación débil
switch($valor) {
    case 0:  // ✅ Coincide ("0" == 0)
        $resultado = "número cero";
        break;
}

// Match con múltiples valores
$tipo = match($extension) {
    'jpg', 'jpeg', 'png' => 'imagen',
    'mp4', 'avi' => 'video',
    'pdf', 'doc' => 'documento',
    default => 'desconocido'
};
?&gt;</code></pre></div>

        <h3>Operador Spaceship (&lt;=&gt;) - PHP 7.0+</h3>
        <div class="code-block"><pre><code>&lt;?php
// Retorna: -1 si menor, 0 si igual, 1 si mayor
var_dump(1 &lt;=&gt; 2);           // -1
var_dump(2 &lt;=&gt; 2);           // 0
var_dump(3 &lt;=&gt; 2);           // 1

// Útil para ordenamiento
$usuarios = [
    ['nombre' => 'Juan', 'edad' => 30],
    ['nombre' => 'Ana', 'edad' => 25],
    ['nombre' => 'Pedro', 'edad' => 35]
];

usort($usuarios, fn($a, $b) => $a['edad'] &lt;=&gt; $b['edad']);
// Ordena por edad: Ana(25), Juan(30), Pedro(35)
?&gt;</code></pre></div>

        <h3>Null Coalescing y Nullsafe (PHP 8.0+)</h3>
        <div class="code-block"><pre><code>&lt;?php
// Null coalescing (??) - retorna primer valor no-null
$nombre = $usuario ?? "Invitado";
$edad = $_GET['edad'] ?? 18;
$config = $opciones['db'] ?? $default ?? [];

// Null coalescing assignment (??=) - PHP 7.4+
$variable ??= "valor por defecto";
$config['timeout'] ??= 30;

// Nullsafe operator (?->) - PHP 8.0+
$ciudad = $usuario?->direccion?->ciudad;
$email = $cliente?->contacto?->email ?? "sin-email@example.com";

// Antes de PHP 8 (verboso):
$ciudad = isset($usuario->direccion->ciudad) 
    ? $usuario->direccion->ciudad 
    : null;
?&gt;</code></pre></div>

        <h3>PHP 8.0+: Union Types</h3>
        <div class="code-block"><pre><code>&lt;?php
declare(strict_types=1);

// Union types permiten múltiples tipos
function procesar(int|float $numero): string|int {
    if ($numero > 10) {
        return "grande";
    }
    return 0;
}

procesar(5);      // ✅ int
procesar(3.14);   // ✅ float
// procesar("5"); // ❌ TypeError con strict_types

// Nullable con union
function obtener(?string $id): Usuario|null {
    return $id ? new Usuario($id) : null;
}

// Mixed type (cualquier tipo)
function flexible(mixed $dato): mixed {
    return $dato;
}
?&gt;</code></pre></div>

        <h3>Casting (Conversión Explícita)</h3>
        <div class="code-block"><pre><code>&lt;?php
// Casting básico
$int = (int)"123abc";        // 123 (ignora texto)
$int = (int)"abc123";        // 0 (no empieza con número)
$float = (float)"3.14";      // 3.14
$bool = (bool)1;             // true
$string = (string)123;       // "123"
$array = (array)"texto";     // ["texto"]

// Valores falsy (se convierten a false)
var_dump((bool)0);           // false
var_dump((bool)"");          // false
var_dump((bool)"0");         // false
var_dump((bool)null);        // false
var_dump((bool)[]);          // false

// Valores truthy (se convierten a true)
var_dump((bool)1);           // true
var_dump((bool)"texto");     // true
var_dump((bool)" ");         // true (espacio)
var_dump((bool)[0]);         // true (array con elementos)
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Mejores Prácticas PHP 8+:</strong><br>
            • Usa <code>declare(strict_types=1)</code> en todos tus archivos<br>
            • Prefiere <code>===</code> sobre <code>==</code> para evitar coerción implícita<br>
            • Usa <code>match</code> en lugar de <code>switch</code> para comparaciones estrictas<br>
            • Aprovecha <code>??</code> y <code>?-></code> para manejar valores null<br>
            • Define tipos en funciones con <strong>Union Types</strong> cuando sea necesario<br>
            • Usa <code>spaceship</code> (&lt;=&gt;) para ordenamiento
        </div>

        <div class="warning-box">
            <strong>⚠️ Cambios en PHP 8+:</strong><br>
            • Comparaciones de strings no-numéricos con números ahora son más estrictas<br>
            • Muchos warnings se convirtieron en errores (TypeError, ValueError)<br>
            • La coerción implícita es menos permisiva que en PHP 7
        </div>
    `,
    'operadores': `
        <h1>Operadores en PHP 8+</h1>
        
        <p>PHP 8+ incluye operadores clásicos y nuevos operadores modernos para código más expresivo y seguro.</p>

        <h3>Operadores Aritméticos</h3>
        <div class="code-block"><pre><code>&lt;?php
$a = 10;
$b = 3;

echo $a + $b;   // 13 (suma)
echo $a - $b;   // 7 (resta)
echo $a * $b;   // 30 (multiplicación)
echo $a / $b;   // 3.333... (división)
echo $a % $b;   // 1 (módulo/resto)
echo $a ** $b;  // 1000 (potencia - PHP 5.6+)

// PHP 8+: intdiv() para división entera
echo intdiv(10, 3);  // 3 (sin decimales)

// Operadores de asignación combinados
$x = 5;
$x += 3;  // $x = $x + 3  → 8
$x -= 2;  // $x = $x - 2  → 6
$x *= 2;  // $x = $x * 2  → 12
$x /= 3;  // $x = $x / 3  → 4
$x %= 3;  // $x = $x % 3  → 1
$x **= 3; // $x = $x ** 3 → 1

// Incremento y decremento
$i = 5;
echo ++$i;  // 6 (pre-incremento)
echo $i++;  // 6 (post-incremento, luego $i = 7)
echo --$i;  // 6 (pre-decremento)
echo $i--;  // 6 (post-decremento, luego $i = 5)
?&gt;</code></pre></div>

        <h3>Operadores de Comparación</h3>
        <div class="code-block"><pre><code>&lt;?php
// Comparación débil (==) vs estricta (===)
var_dump(5 == "5");    // true (con coerción)
var_dump(5 === "5");   // false (sin coerción)
var_dump(5 != "5");    // false
var_dump(5 !== "5");   // true

// Operadores relacionales
var_dump(5 > 3);       // true (mayor que)
var_dump(5 < 3);       // false (menor que)
var_dump(5 >= 5);      // true (mayor o igual)
var_dump(5 <= 3);      // false (menor o igual)

// Spaceship operator (&lt;=&gt;) - PHP 7.0+
// Retorna: -1, 0, o 1
echo 1 &lt;=&gt; 2;          // -1 (menor)
echo 2 &lt;=&gt; 2;          // 0 (igual)
echo 3 &lt;=&gt; 2;          // 1 (mayor)

// Útil para ordenamiento
$numeros = [3, 1, 4, 1, 5, 9];
usort($numeros, fn($a, $b) => $a &lt;=&gt; $b);
// Resultado: [1, 1, 3, 4, 5, 9]
?&gt;</code></pre></div>

        <h3>Operadores Lógicos</h3>
        <div class="code-block"><pre><code>&lt;?php
// AND lógico
var_dump(true && true);    // true
var_dump(true and true);   // true (menor precedencia)

// OR lógico
var_dump(true || false);   // true
var_dump(true or false);   // true (menor precedencia)

// NOT lógico
var_dump(!true);           // false

// XOR (OR exclusivo)
var_dump(true xor false);  // true
var_dump(true xor true);   // false

// Cortocircuito (short-circuit)
$usuario = null;
$nombre = $usuario && $usuario->nombre;  // null (no evalúa ->nombre)

// Precedencia: && tiene mayor precedencia que and/or
$result = false || true;   // true
$result = false or true;   // false (por precedencia de =)
?&gt;</code></pre></div>

        <h3>Operadores de Null (PHP 7.0+ / 8.0+)</h3>
        <div class="code-block"><pre><code>&lt;?php
// Null coalescing (??) - PHP 7.0+
$nombre = $usuario ?? "Invitado";
$edad = $_GET['edad'] ?? 18;

// Encadenamiento
$valor = $a ?? $b ?? $c ?? "default";

// Null coalescing assignment (??=) - PHP 7.4+
$config['timeout'] ??= 30;  // Asigna solo si es null

// Nullsafe operator (?->) - PHP 8.0+
$ciudad = $usuario?->direccion?->ciudad;
$largo = $texto?->length();

// Equivalente sin nullsafe (verboso)
$ciudad = isset($usuario->direccion->ciudad) 
    ? $usuario->direccion->ciudad 
    : null;
?&gt;</code></pre></div>

        <h3>Operadores de String</h3>
        <div class="code-block"><pre><code>&lt;?php
// Concatenación
$nombre = "Juan";
$apellido = "Pérez";
$completo = $nombre . " " . $apellido;  // "Juan Pérez"

// Concatenación con asignación
$mensaje = "Hola";
$mensaje .= " Mundo";  // "Hola Mundo"

// PHP 8+: str_contains(), str_starts_with(), str_ends_with()
$email = "usuario@example.com";
var_dump(str_contains($email, '@'));          // true
var_dump(str_starts_with($email, 'usuario')); // true
var_dump(str_ends_with($email, '.com'));      // true
?&gt;</code></pre></div>

        <h3>Operador Ternario</h3>
        <div class="code-block"><pre><code>&lt;?php
// Ternario clásico
$edad = 20;
$mensaje = $edad >= 18 ? "Mayor" : "Menor";

// Ternario corto (PHP 5.3+)
$nombre = $usuario ?: "Invitado";  // Si $usuario es falsy

// Mejor usar null coalescing para null
$nombre = $usuario ?? "Invitado";  // Solo si es null

// Ternarios anidados (evitar cuando sea complejo)
$nivel = $puntos > 1000 ? "Oro" 
    : ($puntos > 500 ? "Plata" : "Bronce");

// Mejor usar match (PHP 8.0+)
$nivel = match(true) {
    $puntos > 1000 => "Oro",
    $puntos > 500 => "Plata",
    default => "Bronce"
};
?&gt;</code></pre></div>

        <h3>Operadores de Array</h3>
        <div class="code-block"><pre><code>&lt;?php
// Unión de arrays (+)
$arr1 = ['a' => 1, 'b' => 2];
$arr2 = ['b' => 3, 'c' => 4];
$union = $arr1 + $arr2;  // ['a'=>1, 'b'=>2, 'c'=>4]

// Comparación de arrays
$a = [1, 2, 3];
$b = [1, 2, 3];
var_dump($a == $b);   // true (mismo contenido)
var_dump($a === $b);  // true (mismo contenido y orden)

// Spread operator (...) - PHP 7.4+
$arr1 = [1, 2, 3];
$arr2 = [4, 5, 6];
$combinado = [...$arr1, ...$arr2];  // [1,2,3,4,5,6]

// PHP 8.1+: Spread en arrays asociativos
$defaults = ['timeout' => 30, 'retry' => 3];
$config = [...$defaults, 'timeout' => 60];
// ['timeout' => 60, 'retry' => 3]
?&gt;</code></pre></div>

        <h3>Operadores Bit a Bit</h3>
        <div class="code-block"><pre><code>&lt;?php
// AND, OR, XOR, NOT
echo 5 & 3;   // 1  (0101 & 0011 = 0001)
echo 5 | 3;   // 7  (0101 | 0011 = 0111)
echo 5 ^ 3;   // 6  (0101 ^ 0011 = 0110)
echo ~5;      // -6 (invierte bits)

// Desplazamiento
echo 5 << 1;  // 10 (desplaza izquierda)
echo 5 >> 1;  // 2  (desplaza derecha)

// Uso práctico: permisos
define('READ', 1);    // 0001
define('WRITE', 2);   // 0010
define('DELETE', 4);  // 0100

$permisos = READ | WRITE;  // 0011 (3)
var_dump($permisos & READ);   // true (tiene READ)
var_dump($permisos & DELETE); // false (no tiene DELETE)
?&gt;</code></pre></div>

        <div class="info-box">
            <strong>💡 Precedencia de Operadores (de mayor a menor):</strong><br>
            1. <code>++ --</code> (incremento/decremento)<br>
            2. <code>**</code> (potencia)<br>
            3. <code>* / %</code> (multiplicación, división, módulo)<br>
            4. <code>+ - .</code> (suma, resta, concatenación)<br>
            5. <code>&lt; &lt;= &gt; &gt;=</code> (comparación)<br>
            6. <code>== != === !==</code> (igualdad)<br>
            7. <code>&&</code> (AND lógico)<br>
            8. <code>||</code> (OR lógico)<br>
            9. <code>??</code> (null coalescing)<br>
            10. <code>? :</code> (ternario)<br>
            11. <code>= += -= etc.</code> (asignación)
        </div>

        <div class="success-box">
            <strong>✅ Operadores Modernos PHP 8+:</strong><br>
            • <strong>Nullsafe</strong> (<code>?-></code>): Evita errores con null<br>
            • <strong>Null coalescing</strong> (<code>??</code>, <code>??=</code>): Valores por defecto<br>
            • <strong>Spaceship</strong> (<code>&lt;=&gt;</code>): Comparación de tres vías<br>
            • <strong>Spread</strong> (<code>...</code>): Desempaquetado de arrays<br>
            • Preferir <code>match</code> sobre ternarios complejos<br>
            • Usar <code>str_contains()</code> en lugar de <code>strpos()</code>
        </div>
    `,
    'estructuras-control': `
        <h1>Estructuras de Control en PHP 8+</h1>
        
        <p>PHP 8+ mejora las estructuras de control con <strong>match expression, null coalescing, y sintaxis moderna</strong> para código más limpio y expresivo.</p>

        <h3>If / Elseif / Else</h3>
        <div class="code-block"><pre><code>&lt;?php
// Estructura básica
if ($edad < 18) {
    echo "Menor de edad";
} elseif ($edad < 65) {
    echo "Adulto";
} else {
    echo "Senior";
}

// PHP 8+: Con null coalescing
$nombre = $usuario?->nombre ?? "Invitado";
if ($nombre !== "Invitado") {
    echo "Bienvenido, $nombre";
}

// Operador ternario
$mensaje = $edad >= 18 ? "Mayor" : "Menor";

// PHP 8+: Nullsafe en condicionales
if ($usuario?->esPremium()) {
    echo "Acceso premium";
}
?&gt;</code></pre></div>

        <h3>PHP 8.0+: Match Expression</h3>
        <p>Match es el reemplazo moderno de switch con comparación estricta (===) y retorno de valor:</p>
        
        <div class="code-block"><pre><code>&lt;?php
// Match: comparación estricta, retorna valor
$resultado = match($valor) {
    0 => "Cero",
    1 => "Uno",
    2 => "Dos",
    default => "Otro número"
};

// Match con múltiples valores
$tipo = match($extension) {
    'jpg', 'jpeg', 'png', 'gif' => 'imagen',
    'mp4', 'avi', 'mov' => 'video',
    'pdf', 'doc', 'docx' => 'documento',
    default => 'desconocido'
};

// Match con expresiones
$descuento = match(true) {
    $total > 1000 => 0.25,
    $total > 500 => 0.15,
    $total > 100 => 0.05,
    default => 0
};

// Match con tipos
$resultado = match(true) {
    $valor instanceof DateTime => $valor->format('Y-m-d'),
    is_string($valor) => strtoupper($valor),
    is_int($valor) => $valor * 2,
    default => throw new InvalidArgumentException()
};
?&gt;</code></pre></div>

        <h3>Switch (Tradicional)</h3>
        <div class="code-block"><pre><code>&lt;?php
// Switch con comparación débil (==)
switch($tipo) {
    case 'admin':
        $permisos = ['leer', 'escribir', 'eliminar'];
        break;
    
    case 'editor':
        $permisos = ['leer', 'escribir'];
        break;
    
    case 'usuario':
        $permisos = ['leer'];
        break;
    
    default:
        $permisos = [];
}

// Switch con múltiples casos
switch($dia) {
    case 'lunes':
    case 'martes':
    case 'miércoles':
    case 'jueves':
    case 'viernes':
        echo "Día laboral";
        break;
    
    case 'sábado':
    case 'domingo':
        echo "Fin de semana";
        break;
}
?&gt;</code></pre></div>

        <div class="warning-box">
            <strong>⚠️ Switch vs Match:</strong><br>
            • <strong>Switch</strong>: Comparación débil (==), requiere break<br>
            • <strong>Match</strong>: Comparación estricta (===), retorna valor automáticamente<br>
            • Prefiere <code>match</code> en PHP 8+ por ser más seguro y conciso
        </div>

        <h3>Bucle For</h3>
        <div class="code-block"><pre><code>&lt;?php
// For clásico
for ($i = 0; $i < 5; $i++) {
    echo $i;  // 0, 1, 2, 3, 4
}

// For con paso personalizado
for ($i = 0; $i <= 10; $i += 2) {
    echo $i;  // 0, 2, 4, 6, 8, 10
}

// For inverso
for ($i = 10; $i > 0; $i--) {
    echo $i;  // 10, 9, 8, ..., 1
}

// For con múltiples variables
for ($i = 0, $j = 10; $i < $j; $i++, $j--) {
    echo "i: $i, j: $j\\n";
}
?&gt;</code></pre></div>

        <h3>Bucle While y Do-While</h3>
        <div class="code-block"><pre><code>&lt;?php
// While - evalúa condición antes de ejecutar
$i = 0;
while ($i < 5) {
    echo $i;
    $i++;
}

// Do-While - ejecuta al menos una vez
$i = 0;
do {
    echo $i;
    $i++;
} while ($i < 5);

// While con condiciones complejas
$intentos = 0;
$maximo = 3;
while ($intentos < $maximo && !$conexion) {
    $conexion = conectarBaseDatos();
    $intentos++;
}

// PHP 8+: While con nullsafe
while ($usuario?->tienePermisos()) {
    procesarAccion();
}
?&gt;</code></pre></div>

        <h3>Foreach - Iteración de Arrays</h3>
        <div class="code-block"><pre><code>&lt;?php
// Foreach básico - solo valores
$frutas = ['manzana', 'naranja', 'plátano'];
foreach ($frutas as $fruta) {
    echo $fruta;
}

// Foreach con clave y valor
$persona = [
    'nombre' => 'Ana',
    'edad' => 30,
    'ciudad' => 'Madrid'
];

foreach ($persona as $clave => $valor) {
    echo "$clave: $valor\\n";
}

// PHP 7.1+: Destructuring en foreach
$usuarios = [
    ['id' => 1, 'nombre' => 'Juan'],
    ['id' => 2, 'nombre' => 'María']
];

foreach ($usuarios as ['id' => $id, 'nombre' => $nombre]) {
    echo "ID: $id, Nombre: $nombre\\n";
}

// Foreach por referencia (modifica el array)
$numeros = [1, 2, 3, 4, 5];
foreach ($numeros as &$numero) {
    $numero *= 2;
}
unset($numero);  // ⚠️ Importante: liberar la referencia
// $numeros ahora es [2, 4, 6, 8, 10]

// PHP 8+: Foreach con arrow functions
$dobles = array_map(fn($n) => $n * 2, $numeros);
$pares = array_filter($numeros, fn($n) => $n % 2 === 0);
?&gt;</code></pre></div>

        <h3>Break y Continue</h3>
        <div class="code-block"><pre><code>&lt;?php
// Break - sale del bucle
for ($i = 0; $i < 10; $i++) {
    if ($i === 5) {
        break;  // Sale cuando $i es 5
    }
    echo $i;  // Imprime 0, 1, 2, 3, 4
}

// Continue - salta a la siguiente iteración
for ($i = 0; $i < 5; $i++) {
    if ($i === 2) {
        continue;  // Salta el 2
    }
    echo $i;  // Imprime 0, 1, 3, 4
}

// Break con niveles (rompe múltiples bucles)
for ($i = 0; $i < 3; $i++) {
    for ($j = 0; $j < 3; $j++) {
        if ($i === 1 && $j === 1) {
            break 2;  // Sale de ambos bucles
        }
        echo "i:$i, j:$j\\n";
    }
}

// Continue con niveles
foreach ($categorias as $categoria) {
    foreach ($productos as $producto) {
        if (!$producto->activo) {
            continue;  // Salta este producto
        }
        if ($categoria->vacia) {
            continue 2;  // Salta a la siguiente categoría
        }
        procesarProducto($producto);
    }
}
?&gt;</code></pre></div>

        <h3>Alternativas Modernas (PHP 8+)</h3>
        <div class="code-block"><pre><code>&lt;?php
// En lugar de bucles complejos, usa funciones de array

$numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Filtrar y mapear con arrow functions
$resultado = array_map(
    fn($n) => $n * 2,
    array_filter($numeros, fn($n) => $n % 2 === 0)
);
// $resultado = [4, 8, 12, 16, 20]

// Reduce
$suma = array_reduce($numeros, fn($carry, $n) => $carry + $n, 0);

// Verificar condiciones
$todosPares = !in_array(false, array_map(fn($n) => $n % 2 === 0, $numeros));
$algunPar = in_array(true, array_map(fn($n) => $n % 2 === 0, $numeros));

// PHP 8+: Combinación con match
foreach ($usuarios as $usuario) {
    $estado = match($usuario?->getTipo()) {
        'premium' => procesarPremium($usuario),
        'normal' => procesarNormal($usuario),
        default => null
    };
}
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Mejores Prácticas PHP 8+:</strong><br>
            • Usa <code>match</code> en lugar de <code>switch</code> cuando sea posible<br>
            • Prefiere <code>array_map</code>, <code>array_filter</code> sobre bucles for<br>
            • Usa <strong>arrow functions</strong> (fn) para callbacks simples<br>
            • Aprovecha <code>??</code> y <code>?-></code> para evitar verificaciones de null<br>
            • Libera referencias después de foreach por referencia con <code>unset()</code><br>
            • Considera funciones de array para código más funcional
        </div>

        <div class="info-box">
            <strong>💡 PHP 8+ vs PHP 7:</strong><br>
            • <strong>Match</strong> es más seguro que switch (comparación estricta)<br>
            • <strong>Nullsafe operator</strong> simplifica verificaciones de null<br>
            • <strong>Arrow functions</strong> reducen verbosidad en callbacks<br>
            • <strong>Named arguments</strong> mejoran legibilidad en llamadas<br>
            • <strong>Destructuring</strong> en foreach para arrays asociativos
        </div>
    `,
    'funciones-anonimas': `
        <h1>Funciones Anónimas y Arrow Functions en PHP 8+</h1>
        
        <p>PHP 8+ mejora las funciones anónimas con <strong>arrow functions, first-class callables, y mejor tipado</strong> para código más expresivo y funcional.</p>

        <h3>Closures (Funciones Anónimas)</h3>
        <div class="code-block"><pre><code>&lt;?php
// Closure básica
$saludar = function(string $nombre): string {
    return "Hola, $nombre!";
};

echo $saludar("Juan");  // "Hola, Juan!"

// Closure con captura de variables (use)
$multiplicador = 3;
$multiplicar = function(int $n) use ($multiplicador): int {
    return $n * $multiplicador;
};

echo $multiplicar(5);  // 15

// Capturar por referencia (permite modificar)
$contador = 0;
$incrementar = function() use (&$contador): int {
    return ++$contador;
};

echo $incrementar();  // 1
echo $incrementar();  // 2
echo $contador;       // 2 (modificado)

// PHP 8+: Closures con union types
$procesar = function(int|float $valor): int|float {
    return $valor * 2;
};
?&gt;</code></pre></div>

        <h3>PHP 7.4+: Arrow Functions</h3>
        <p>Las arrow functions capturan variables automáticamente y son perfectas para expresiones simples:</p>
        
        <div class="code-block"><pre><code>&lt;?php
// Arrow function - captura automática
$multiplicador = 3;
$multiplicar = fn(int $n): int => $n * $multiplicador;

echo $multiplicar(5);  // 15 (captura $multiplicador automáticamente)

// Diferencias clave:
// ✅ No necesita 'use' - captura automática
// ✅ Siempre retorna una sola expresión
// ✅ Sintaxis más concisa

// Arrow functions en array_map
$numeros = [1, 2, 3, 4, 5];
$cuadrados = array_map(fn($n) => $n * $n, $numeros);
// [1, 4, 9, 16, 25]

// Arrow functions en array_filter
$pares = array_filter($numeros, fn($n) => $n % 2 === 0);
// [2, 4]

// Arrow function con múltiples parámetros
$sumar = fn(int $a, int $b): int => $a + $b;
echo $sumar(10, 5);  // 15

// Arrow function anidada (currying)
$multiplicar = fn($x) => fn($y) => $x * $y;
$duplicar = $multiplicar(2);
echo $duplicar(5);  // 10

// PHP 8+: Arrow functions con union types
$convertir = fn(int|float|string $valor): float => (float)$valor;
echo $convertir("42.5");  // 42.5
?&gt;</code></pre></div>

        <h3>Uso Práctico con Array Functions</h3>
        <div class="code-block"><pre><code>&lt;?php
$productos = [
    ['nombre' => 'Laptop', 'precio' => 1000, 'stock' => 5],
    ['nombre' => 'Mouse', 'precio' => 25, 'stock' => 50],
    ['nombre' => 'Teclado', 'precio' => 75, 'stock' => 0],
    ['nombre' => 'Monitor', 'precio' => 300, 'stock' => 10]
];

// Filtrar productos en stock
$enStock = array_filter(
    $productos, 
    fn($p) => $p['stock'] > 0
);

// Obtener solo nombres
$nombres = array_map(
    fn($p) => $p['nombre'], 
    $productos
);

// Obtener precios con IVA (21%)
$preciosConIVA = array_map(
    fn($p) => $p['precio'] * 1.21,
    $productos
);

// Filtrar y transformar
$productosCaros = array_map(
    fn($p) => [
        'nombre' => strtoupper($p['nombre']),
        'precio' => $p['precio']
    ],
    array_filter($productos, fn($p) => $p['precio'] > 50)
);

// Calcular total del inventario
$total = array_reduce(
    $productos,
    fn($carry, $p) => $carry + ($p['precio'] * $p['stock']),
    0
);

// Ordenar por precio descendente
usort($productos, fn($a, $b) => $b['precio'] <=> $a['precio']);
?&gt;</code></pre></div>

        <h3>PHP 8.1+: First-Class Callable Syntax</h3>
        <p>Nueva sintaxis para obtener referencias a funciones sin llamarlas:</p>
        
        <div class="code-block"><pre><code>&lt;?php
// PHP 8.1+: First-class callable syntax
$callback = strlen(...);
echo $callback("hola");  // 4

// Con funciones de usuario
function saludar(string $nombre): string {
    return "Hola, $nombre";
}

$fn = saludar(...);
echo $fn("Ana");  // "Hola, Ana"

// Con métodos de clase
class Calculadora {
    public function sumar(int $a, int $b): int {
        return $a + $b;
    }
    
    public static function restar(int $a, int $b): int {
        return $a - $b;
    }
}

$calc = new Calculadora();

// Método de instancia
$sumarFn = $calc->sumar(...);
echo $sumarFn(5, 3);  // 8

// Método estático
$restarFn = Calculadora::restar(...);
echo $restarFn(10, 4);  // 6

// Uso en array functions
$numeros = [1, 2, 3, 4, 5];
$strings = array_map(strval(...), $numeros);
$mayusculas = array_map(strtoupper(...), ["hola", "mundo"]);
?&gt;</code></pre></div>

        <h3>Closures como Callbacks</h3>
        <div class="code-block"><pre><code>&lt;?php
// Callbacks en funciones nativas
$numeros = [5, 2, 8, 1, 9, 3];

// usort con arrow function
usort($numeros, fn($a, $b) => $a <=> $b);

// array_walk para modificar elementos
$precios = [100, 200, 300];
array_walk($precios, function(&$precio) {
    $precio *= 1.21;  // Agregar IVA
});

// Callbacks personalizados
function procesarDatos(array $datos, callable $callback): array {
    return array_map($callback, $datos);
}

$resultado = procesarDatos(
    [1, 2, 3, 4, 5],
    fn($n) => $n ** 2
);

// PHP 8+: Parámetros con tipos callable
function aplicarOperacion(
    int|float $valor,
    callable $operacion
): int|float {
    return $operacion($valor);
}

$resultado = aplicarOperacion(10, fn($n) => $n * 2);  // 20
?&gt;</code></pre></div>

        <h3>Closures Recursivas</h3>
        <div class="code-block"><pre><code>&lt;?php
// Factorial recursivo con closure
$factorial = function(int $n) use (&$factorial): int {
    return $n <= 1 ? 1 : $n * $factorial($n - 1);
};

echo $factorial(5);  // 120

// PHP 8+: Fibonacci con memoization
$fibonacci = function(int $n) use (&$fibonacci): int {
    static $cache = [0 => 0, 1 => 1];
    
    if (!isset($cache[$n])) {
        $cache[$n] = $fibonacci($n - 1) + $fibonacci($n - 2);
    }
    
    return $cache[$n];
};

echo $fibonacci(10);  // 55
?&gt;</code></pre></div>

        <h3>Closures con bindTo (Avanzado)</h3>
        <div class="code-block"><pre><code>&lt;?php
class Usuario {
    private string $nombre = "Juan";
    
    public function getNombre(): string {
        return $this->nombre;
    }
}

// Closure sin acceso a $this
$closure = function() {
    return $this->nombre;
};

$usuario = new Usuario();

// Bind: vincular closure a un objeto
$boundClosure = $closure->bindTo($usuario, Usuario::class);
echo $boundClosure();  // "Juan"

// PHP 8.1+: First-class callable con bind
class Contador {
    private static int $cuenta = 0;
    
    public static function incrementar(): int {
        return ++self::$cuenta;
    }
}

$callback = Contador::incrementar(...);
echo $callback();  // 1
echo $callback();  // 2
?&gt;</code></pre></div>

        <div class="info-box">
            <strong>💡 Cuándo Usar Arrow Functions vs Closures:</strong><br>
            <strong>Arrow Functions (fn):</strong><br>
            • Expresiones simples de una sola línea<br>
            • Callbacks en array_map, array_filter, etc.<br>
            • No necesitas modificar variables capturadas<br>
            • Quieres código más conciso<br>
            <br>
            <strong>Closures (function):</strong><br>
            • Lógica compleja con múltiples líneas<br>
            • Necesitas modificar variables por referencia (use &$var)<br>
            • Requieres recursión<br>
            • Necesitas bindTo para cambiar el contexto
        </div>

        <div class="success-box">
            <strong>✅ Ventajas de Arrow Functions en PHP 8+:</strong><br>
            • Código más limpio y legible<br>
            • Captura automática de variables (sin <code>use</code>)<br>
            • Perfectas para programación funcional<br>
            • Reducen verbosidad en callbacks<br>
            • Mejor rendimiento que closures tradicionales<br>
            • Compatibles con union types y named arguments
        </div>

        <div class="warning-box">
            <strong>⚠️ Consideraciones Importantes:</strong><br>
            • Arrow functions capturan variables <strong>por valor</strong> (no por referencia)<br>
            • No puedes usar <code>return</code> explícito en arrow functions<br>
            • First-class callables (PHP 8.1+) son más eficientes que strings<br>
            • Libera referencias después de usar closures por referencia con <code>unset()</code>
        </div>
    `,
    'namespaces': `
        <h1>Namespaces y Autoloading en PHP 8+</h1>
        
        <p>Los <strong>namespaces</strong> son como "carpetas virtuales" para organizar tu código PHP y evitar conflictos de nombres. El <strong>autoloading</strong> carga automáticamente las clases cuando las necesitas, sin tener que usar <code>require</code> manualmente.</p>

        <h3>¿Por qué usar Namespaces?</h3>
        <p>Imagina que tienes dos clases llamadas <code>Usuario</code>: una para tu aplicación y otra de una librería externa. Sin namespaces, habría un conflicto. Los namespaces resuelven esto:</p>
        
        <div class="code-block"><pre><code>&lt;?php
// Sin namespaces (❌ CONFLICTO)
class Usuario {}  // Tu clase
class Usuario {}  // Librería externa - ERROR: Cannot redeclare class

// Con namespaces (✅ SIN CONFLICTO)
namespace MiApp;
class Usuario {}  // MiApp\\Usuario

namespace Libreria;
class Usuario {}  // Libreria\\Usuario

// Ahora son dos clases diferentes
$miUsuario = new \\MiApp\\Usuario();
$otroUsuario = new \\Libreria\\Usuario();
?&gt;</code></pre></div>

        <h3>Declaración de Namespaces</h3>
        <p>El namespace debe ser la <strong>primera declaración</strong> del archivo PHP (después de <code>declare</code> si lo usas):</p>
        
        <div class="code-block"><pre><code>&lt;?php
// Namespace simple
namespace App\\Models;

class Usuario {
    public function __construct(
        public string $nombre,
        public string $email
    ) {}
}

// Este archivo define la clase: App\\Models\\Usuario
?&gt;</code></pre></div>

        <h3>Estructura de Namespaces (Jerarquía)</h3>
        <p>Los namespaces se organizan jerárquicamente con <code>\\</code> (como carpetas en tu disco):</p>
        
        <div class="code-block"><pre><code>&lt;?php
// Estructura típica de una aplicación
namespace App\\Models;           // App\\Models\\Usuario
namespace App\\Controllers;      // App\\Controllers\\UsuarioController
namespace App\\Services;         // App\\Services\\EmailService
namespace App\\Repositories;     // App\\Repositories\\UsuarioRepository

// Ejemplo completo de un archivo
// Archivo: src/Models/Usuario.php
namespace App\\Models;

class Usuario {
    public function __construct(
        public readonly int $id,
        public string $nombre,
        public string $email
    ) {}
}
?&gt;</code></pre></div>

        <h3>Importar Clases con "use"</h3>
        <p>Para usar una clase de otro namespace, la importas con <code>use</code>. Es como decir "voy a usar esta clase":</p>
        
        <div class="code-block"><pre><code>&lt;?php
// Archivo: src/Controllers/UsuarioController.php
namespace App\\Controllers;

// Importar clases de otros namespaces
use App\\Models\\Usuario;
use App\\Services\\EmailService;

class UsuarioController {
    public function crear(string $nombre, string $email): Usuario {
        // Ahora puedo usar "Usuario" directamente
        $usuario = new Usuario(
            id: 1,
            nombre: $nombre,
            email: $email
        );
        
        // También puedo usar EmailService
        $emailService = new EmailService();
        $emailService->enviar($email, "Bienvenido");
        
        return $usuario;
    }
}
?&gt;</code></pre></div>

        <h3>Alias con "as" (para evitar conflictos)</h3>
        <p>Si dos clases tienen el mismo nombre, usa alias:</p>
        
        <div class="code-block"><pre><code>&lt;?php
namespace App\\Controllers;

// Importar dos clases con el mismo nombre
use App\\Models\\Usuario;
use Libreria\\Models\\Usuario as UsuarioLibreria;

class UsuarioController {
    public function ejemplo() {
        $miUsuario = new Usuario();           // App\\Models\\Usuario
        $otroUsuario = new UsuarioLibreria(); // Libreria\\Models\\Usuario
    }
}
?&gt;</code></pre></div>

        <h3>Importar Múltiples Clases (Group Use)</h3>
        <p>Puedes importar varias clases del mismo namespace de forma más limpia:</p>
        
        <div class="code-block"><pre><code>&lt;?php
namespace App\\Controllers;

// Forma larga (❌ repetitivo)
use App\\Models\\Usuario;
use App\\Models\\Post;
use App\\Models\\Comentario;

// Forma corta (✅ mejor)
use App\\Models\\{Usuario, Post, Comentario};

// También funciona con alias
use App\\Services\\{
    EmailService,
    SmsService,
    NotificationService as Notificador
};
?&gt;</code></pre></div>

        <h3>Resolución de Nombres (Cómo PHP encuentra las clases)</h3>
        <p>PHP busca las clases de 3 formas diferentes:</p>
        
        <div class="code-block"><pre><code>&lt;?php
namespace App\\Controllers;

use App\\Models\\Usuario;

class UsuarioController {
    public function ejemplos() {
        // 1️⃣ Nombre sin calificar (busca en el namespace actual)
        $service = new EmailService();
        // PHP busca: App\\Controllers\\EmailService
        
        // 2️⃣ Nombre calificado (relativo al namespace actual)
        $user = new Models\\Usuario();
        // PHP busca: App\\Controllers\\Models\\Usuario
        
        // 3️⃣ Nombre completamente calificado (absoluto, empieza con \\)
        $user = new \\App\\Models\\Usuario();
        // PHP busca: App\\Models\\Usuario (siempre)
        
        // 4️⃣ Nombre importado (con use)
        $user = new Usuario();
        // PHP busca: App\\Models\\Usuario (por el use)
    }
}
?&gt;</code></pre></div>

        <div class="info-box">
            <strong>💡 Regla de Oro:</strong><br>
            • Si la clase empieza con <code>\\</code> → PHP busca desde la raíz<br>
            • Si usaste <code>use</code> → PHP usa lo que importaste<br>
            • Si no → PHP busca en el namespace actual
        </div>

        <h3>Autoloading: Carga Automática de Clases</h3>
        <p>El autoloading carga automáticamente los archivos de las clases cuando las usas. <strong>Ya no necesitas escribir <code>require</code> para cada clase.</strong></p>

        <h4>PSR-4: El Estándar Moderno</h4>
        <p>PSR-4 es una convención que relaciona namespaces con carpetas:</p>
        
        <div class="code-block"><pre><code>// Regla PSR-4:
// Namespace: App\\Models\\Usuario
// Archivo:   src/Models/Usuario.php

// Estructura del proyecto:
proyecto/
├── src/
│   ├── Models/
│   │   ├── Usuario.php      → namespace App\\Models;
│   │   └── Post.php         → namespace App\\Models;
│   ├── Controllers/
│   │   └── UsuarioController.php → namespace App\\Controllers;
│   └── Services/
│       └── EmailService.php → namespace App\\Services;
├── vendor/
├── composer.json
└── index.php

// La regla es simple:
// App\\ → se mapea a → src/
// Entonces:
// App\\Models\\Usuario → src/Models/Usuario.php
// App\\Controllers\\UsuarioController → src/Controllers/UsuarioController.php
</code></pre></div>

        <h3>Composer: Autoloading Automático</h3>
        <p>Composer es la herramienta estándar para gestionar dependencias y autoloading en PHP:</p>
        
        <div class="code-block"><pre><code>// 1️⃣ Crear composer.json
{
    "autoload": {
        "psr-4": {
            "App\\\\": "src/"
        }
    }
}

// 2️⃣ Ejecutar en terminal:
composer dump-autoload

// 3️⃣ Usar en tu código:
</code></pre></div>

        <div class="code-block"><pre><code>&lt;?php
// index.php
require __DIR__ . '/vendor/autoload.php';

// ¡Ya está! Ahora puedes usar cualquier clase sin require
use App\\Models\\Usuario;
use App\\Controllers\\UsuarioController;

$usuario = new Usuario(1, "Ana", "ana@example.com");
$controller = new UsuarioController();

// Composer carga automáticamente:
// App\\Models\\Usuario → src/Models/Usuario.php
// App\\Controllers\\UsuarioController → src/Controllers/UsuarioController.php
?&gt;</code></pre></div>

        <h3>Autoloading Personalizado (sin Composer)</h3>
        <p>Si no usas Composer, puedes crear tu propio autoloader con <code>spl_autoload_register</code>:</p>
        
        <div class="code-block"><pre><code>&lt;?php
// autoload.php
spl_autoload_register(function (string $className) {
    // Namespace base: App\\
    $baseNamespace = 'App\\\\';
    $baseDir = __DIR__ . '/src/';
    
    // Verificar si la clase pertenece a nuestro namespace
    if (strpos($className, $baseNamespace) !== 0) {
        return;  // No es nuestra clase, salir
    }
    
    // Obtener el nombre relativo: Models\\Usuario
    $relativeClass = substr($className, strlen($baseNamespace));
    
    // Convertir namespace a ruta: Models/Usuario.php
    $file = $baseDir . str_replace('\\\\', '/', $relativeClass) . '.php';
    
    // Cargar el archivo si existe
    if (file_exists($file)) {
        require $file;
    }
});

// Uso:
require 'autoload.php';

use App\\Models\\Usuario;
$user = new Usuario(1, "Juan", "juan@example.com");
// Se carga automáticamente: src/Models/Usuario.php
?&gt;</code></pre></div>

        <h3>Ejemplo Completo: Aplicación Real</h3>
        <div class="code-block"><pre><code>&lt;?php
// ========================================
// Archivo: src/Models/Usuario.php
// ========================================
namespace App\\Models;

class Usuario {
    public function __construct(
        public readonly int $id,
        public string $nombre,
        public string $email
    ) {}
    
    public function saludar(): string {
        return "Hola, soy {$this->nombre}";
    }
}

// ========================================
// Archivo: src/Services/EmailService.php
// ========================================
namespace App\\Services;

class EmailService {
    public function enviar(string $to, string $asunto, string $mensaje): bool {
        // Lógica de envío de email
        echo "Email enviado a: $to\\n";
        return true;
    }
}

// ========================================
// Archivo: src/Controllers/UsuarioController.php
// ========================================
namespace App\\Controllers;

use App\\Models\\Usuario;
use App\\Services\\EmailService;

class UsuarioController {
    public function __construct(
        private EmailService $emailService
    ) {}
    
    public function crear(string $nombre, string $email): Usuario {
        // Crear usuario
        $usuario = new Usuario(
            id: 1,
            nombre: $nombre,
            email: $email
        );
        
        // Enviar email de bienvenida
        $this->emailService->enviar(
            $email,
            "Bienvenido",
            "Hola {$nombre}, bienvenido a nuestra app"
        );
        
        return $usuario;
    }
}

// ========================================
// Archivo: public/index.php
// ========================================
require __DIR__ . '/../vendor/autoload.php';

use App\\Controllers\\UsuarioController;
use App\\Services\\EmailService;

// Crear instancias
$emailService = new EmailService();
$controller = new UsuarioController($emailService);

// Usar el controller
$usuario = $controller->crear("Ana", "ana@example.com");
echo $usuario->saludar();  // "Hola, soy Ana"
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Ventajas de Namespaces + Autoloading:</strong><br>
            • <strong>Sin conflictos</strong>: Puedes tener múltiples clases con el mismo nombre<br>
            • <strong>Organización clara</strong>: Tu código está bien estructurado<br>
            • <strong>Sin require manual</strong>: Las clases se cargan automáticamente<br>
            • <strong>Estándar PSR-4</strong>: Compatible con todas las librerías modernas<br>
            • <strong>Fácil de mantener</strong>: Encuentras las clases rápidamente<br>
            • <strong>IDE friendly</strong>: Mejor autocompletado en tu editor
        </div>

        <div class="warning-box">
            <strong>⚠️ Errores Comunes:</strong><br>
            • <strong>Namespace debe ser lo primero</strong> (después de <code>&lt;?php</code> y <code>declare</code>)<br>
            • <strong>Usar <code>\\</code> no <code>/</code></strong> en namespaces<br>
            • <strong>Estructura de carpetas debe coincidir</strong> con namespaces (PSR-4)<br>
            • <strong>Ejecutar <code>composer dump-autoload</code></strong> después de crear clases<br>
            • <strong>Clases globales necesitan <code>\\</code></strong>: <code>new \\DateTime()</code>
        </div>

        <div class="info-box">
            <strong>💡 Resumen Rápido:</strong><br>
            1️⃣ <strong>Namespace</strong> = Organiza tu código en "carpetas virtuales"<br>
            2️⃣ <strong>use</strong> = Importa clases de otros namespaces<br>
            3️⃣ <strong>PSR-4</strong> = Convención: namespace → carpeta<br>
            4️⃣ <strong>Composer</strong> = Gestiona autoloading automáticamente<br>
            5️⃣ <strong>autoload.php</strong> = Carga clases sin <code>require</code>
        </div>
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

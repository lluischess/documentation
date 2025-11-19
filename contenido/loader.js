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
        <h1>Excepciones Personalizadas en PHP 8+</h1>
        
        <p>Las excepciones personalizadas te permiten crear <strong>tipos de error específicos</strong> para tu aplicación, con información adicional y mejor manejo de errores.</p>

        <h3>¿Por qué Crear Excepciones Personalizadas?</h3>
        <div class="info-box">
            <strong>💡 Ventajas:</strong><br>
            • <strong>Semántica clara</strong>: <code>UsuarioNoEncontradoException</code> es más claro que <code>RuntimeException</code><br>
            • <strong>Información adicional</strong>: Puedes agregar propiedades específicas (userId, email, etc.)<br>
            • <strong>Captura específica</strong>: Puedes capturar solo tus excepciones personalizadas<br>
            • <strong>Mejor debugging</strong>: Stack traces más claros y específicos<br>
            • <strong>Código más mantenible</strong>: Errores bien organizados por dominio
        </div>

        <h3>Excepción Personalizada Básica</h3>
        <div class="code-block"><pre><code>&lt;?php
// Excepción simple que extiende Exception
class UsuarioNoEncontradoException extends Exception {
    public function __construct(
        private readonly int $userId,
        string $message = "",
        int $code = 404
    ) {
        // Si no hay mensaje, crear uno por defecto
        if (empty($message)) {
            $message = "Usuario con ID {$userId} no encontrado";
        }
        
        // Llamar al constructor padre
        parent::__construct($message, $code);
    }
    
    // Método adicional para obtener el userId
    public function getUserId(): int {
        return $this->userId;
    }
}

// Uso:
try {
    throw new UsuarioNoEncontradoException(123);
} catch (UsuarioNoEncontradoException $e) {
    echo $e->getMessage();  // "Usuario con ID 123 no encontrado"
    echo $e->getUserId();   // 123
    echo $e->getCode();     // 404
}
?&gt;</code></pre></div>

        <h3>Jerarquía de Excepciones Personalizadas</h3>
        <p>Organiza tus excepciones en una jerarquía lógica para tu aplicación:</p>
        
        <div class="code-block"><pre><code>&lt;?php
// Excepción base de tu aplicación
abstract class AppException extends Exception {
    public function __construct(
        string $message = "",
        int $code = 0,
        ?Throwable $previous = null
    ) {
        parent::__construct($message, $code, $previous);
        
        // Loguear automáticamente todas las excepciones
        $this->logException();
    }
    
    protected function logException(): void {
        error_log(sprintf(
            "[%s] %s en %s:%d",
            static::class,
            $this->getMessage(),
            $this->getFile(),
            $this->getLine()
        ));
    }
    
    // Método para obtener respuesta HTTP
    abstract public function getHttpStatusCode(): int;
}

// Excepciones de validación (400 Bad Request)
class ValidationException extends AppException {
    public function __construct(
        private readonly array $errors,
        string $message = "Errores de validación"
    ) {
        parent::__construct($message, 400);
    }
    
    public function getErrors(): array {
        return $this->errors;
    }
    
    public function getHttpStatusCode(): int {
        return 400;
    }
}

// Excepciones de autenticación (401 Unauthorized)
class AuthenticationException extends AppException {
    public function getHttpStatusCode(): int {
        return 401;
    }
}

// Excepciones de autorización (403 Forbidden)
class AuthorizationException extends AppException {
    public function __construct(
        private readonly string $requiredPermission,
        string $message = "Acceso denegado"
    ) {
        parent::__construct($message, 403);
    }
    
    public function getRequiredPermission(): string {
        return $this->requiredPermission;
    }
    
    public function getHttpStatusCode(): int {
        return 403;
    }
}

// Excepciones de recursos no encontrados (404 Not Found)
class NotFoundException extends AppException {
    public function __construct(
        private readonly string $resourceType,
        private readonly int|string $resourceId
    ) {
        $message = "{$resourceType} con ID {$resourceId} no encontrado";
        parent::__construct($message, 404);
    }
    
    public function getResourceType(): string {
        return $this->resourceType;
    }
    
    public function getResourceId(): int|string {
        return $this->resourceId;
    }
    
    public function getHttpStatusCode(): int {
        return 404;
    }
}

// Excepciones de conflicto (409 Conflict)
class ConflictException extends AppException {
    public function getHttpStatusCode(): int {
        return 409;
    }
}
?&gt;</code></pre></div>

        <h3>Excepciones Específicas de Dominio</h3>
        <p>Crea excepciones específicas para cada parte de tu aplicación:</p>
        
        <div class="code-block"><pre><code>&lt;?php
// Excepciones de Usuario
class UsuarioNoEncontradoException extends NotFoundException {
    public function __construct(int $userId) {
        parent::__construct('Usuario', $userId);
    }
}

class EmailYaRegistradoException extends ConflictException {
    public function __construct(
        private readonly string $email
    ) {
        parent::__construct("El email {$email} ya está registrado");
    }
    
    public function getEmail(): string {
        return $this->email;
    }
}

class PasswordInvalidoException extends ValidationException {
    public function __construct() {
        parent::__construct(
            ['password' => ['La contraseña debe tener al menos 8 caracteres']],
            'Contraseña inválida'
        );
    }
}

// Excepciones de Pago
class PagoRechazadoException extends AppException {
    public function __construct(
        private readonly string $razon,
        private readonly string $transaccionId
    ) {
        parent::__construct("Pago rechazado: {$razon}", 402);
    }
    
    public function getRazon(): string {
        return $this->razon;
    }
    
    public function getTransaccionId(): string {
        return $this->transaccionId;
    }
    
    public function getHttpStatusCode(): int {
        return 402;
    }
}

class SaldoInsuficienteException extends AppException {
    public function __construct(
        private readonly float $saldoActual,
        private readonly float $montoRequerido
    ) {
        $message = sprintf(
            "Saldo insuficiente. Actual: %.2f, Requerido: %.2f",
            $saldoActual,
            $montoRequerido
        );
        parent::__construct($message, 400);
    }
    
    public function getSaldoActual(): float {
        return $this->saldoActual;
    }
    
    public function getMontoRequerido(): float {
        return $this->montoRequerido;
    }
    
    public function getHttpStatusCode(): int {
        return 400;
    }
}

// Excepciones de Base de Datos
class DatabaseException extends AppException {
    public function __construct(
        string $message,
        private readonly ?string $query = null
    ) {
        parent::__construct($message, 500);
    }
    
    public function getQuery(): ?string {
        return $this->query;
    }
    
    public function getHttpStatusCode(): int {
        return 500;
    }
}
?&gt;</code></pre></div>

        <h3>Uso Práctico en una Aplicación</h3>
        <div class="code-block"><pre><code>&lt;?php
class UsuarioService {
    public function __construct(
        private UsuarioRepository $repository,
        private EmailService $emailService
    ) {}
    
    public function registrar(string $nombre, string $email, string $password): Usuario {
        // Validar email
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new ValidationException(
                ['email' => ['Email inválido']],
                'Datos de registro inválidos'
            );
        }
        
        // Validar contraseña
        if (strlen($password) < 8) {
            throw new PasswordInvalidoException();
        }
        
        // Verificar si el email ya existe
        if ($this->repository->existeEmail($email)) {
            throw new EmailYaRegistradoException($email);
        }
        
        // Crear usuario
        try {
            $usuario = $this->repository->crear($nombre, $email, $password);
        } catch (Exception $e) {
            throw new DatabaseException(
                "Error al crear usuario: " . $e->getMessage(),
                $e->getCode()
            );
        }
        
        // Enviar email de bienvenida
        try {
            $this->emailService->enviarBienvenida($usuario);
        } catch (Exception $e) {
            // No fallar si el email falla, solo loguear
            error_log("Error al enviar email: " . $e->getMessage());
        }
        
        return $usuario;
    }
    
    public function obtenerPorId(int $id): Usuario {
        $usuario = $this->repository->buscarPorId($id);
        
        if (!$usuario) {
            throw new UsuarioNoEncontradoException($id);
        }
        
        return $usuario;
    }
}

// Controlador HTTP
class UsuarioController {
    public function __construct(
        private UsuarioService $service
    ) {}
    
    public function registrar(array $datos): array {
        try {
            $usuario = $this->service->registrar(
                $datos['nombre'],
                $datos['email'],
                $datos['password']
            );
            
            return [
                'success' => true,
                'data' => $usuario,
                'status' => 201
            ];
            
        } catch (ValidationException $e) {
            return [
                'success' => false,
                'errors' => $e->getErrors(),
                'message' => $e->getMessage(),
                'status' => $e->getHttpStatusCode()
            ];
            
        } catch (EmailYaRegistradoException $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
                'email' => $e->getEmail(),
                'status' => $e->getHttpStatusCode()
            ];
            
        } catch (DatabaseException $e) {
            // No exponer detalles de BD al usuario
            error_log($e->getMessage());
            return [
                'success' => false,
                'message' => 'Error del servidor',
                'status' => 500
            ];
            
        } catch (AppException $e) {
            // Capturar cualquier otra excepción de la app
            return [
                'success' => false,
                'message' => $e->getMessage(),
                'status' => $e->getHttpStatusCode()
            ];
        }
    }
}
?&gt;</code></pre></div>

        <h3>PHP 8+: Named Arguments en Excepciones</h3>
        <div class="code-block"><pre><code>&lt;?php
class ProductoException extends AppException {
    public function __construct(
        private readonly int $productoId,
        private readonly string $sku,
        private readonly ?int $stock = null,
        string $message = "",
        int $code = 0
    ) {
        if (empty($message)) {
            $message = "Error con producto SKU: {$sku}";
        }
        parent::__construct($message, $code);
    }
    
    public function getProductoId(): int {
        return $this->productoId;
    }
    
    public function getSku(): string {
        return $this->sku;
    }
    
    public function getStock(): ?int {
        return $this->stock;
    }
    
    public function getHttpStatusCode(): int {
        return 400;
    }
}

// Uso con named arguments (PHP 8+)
throw new ProductoException(
    productoId: 42,
    sku: 'PROD-123',
    stock: 0,
    message: 'Producto sin stock',
    code: 400
);

// Orden flexible con named arguments
throw new ProductoException(
    sku: 'PROD-456',
    productoId: 99,
    message: 'Producto descontinuado'
);
?&gt;</code></pre></div>

        <h3>Excepciones con Contexto Adicional</h3>
        <div class="code-block"><pre><code>&lt;?php
class ApiException extends AppException {
    public function __construct(
        string $message,
        private readonly int $httpCode,
        private readonly array $context = [],
        private readonly ?string $endpoint = null,
        ?Throwable $previous = null
    ) {
        parent::__construct($message, $httpCode, $previous);
    }
    
    public function getContext(): array {
        return $this->context;
    }
    
    public function getEndpoint(): ?string {
        return $this->endpoint;
    }
    
    public function getHttpStatusCode(): int {
        return $this->httpCode;
    }
    
    // Convertir a array para respuesta JSON
    public function toArray(): array {
        return [
            'error' => true,
            'message' => $this->getMessage(),
            'code' => $this->getCode(),
            'endpoint' => $this->endpoint,
            'context' => $this->context,
            'timestamp' => date('c')
        ];
    }
}

// Uso:
try {
    // Llamada a API externa
    $response = $apiClient->get('/usuarios/123');
} catch (Exception $e) {
    throw new ApiException(
        message: 'Error al obtener usuario de API externa',
        httpCode: 503,
        context: [
            'user_id' => 123,
            'api_response_code' => $e->getCode(),
            'api_response_body' => $e->getMessage()
        ],
        endpoint: '/usuarios/123',
        previous: $e
    );
}

// En el controlador:
try {
    $usuario = $service->obtenerUsuarioExterno(123);
} catch (ApiException $e) {
    return response()->json($e->toArray(), $e->getHttpStatusCode());
}
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Mejores Prácticas para Excepciones Personalizadas:</strong><br>
            • <strong>Hereda de la excepción correcta</strong>: LogicException o RuntimeException<br>
            • <strong>Nombres descriptivos</strong>: <code>UsuarioNoEncontradoException</code> mejor que <code>UserException</code><br>
            • <strong>Propiedades readonly</strong> (PHP 8.1+): Datos inmutables<br>
            • <strong>Constructor con valores por defecto</strong>: Facilita el uso<br>
            • <strong>Métodos getter</strong>: Para acceder a propiedades adicionales<br>
            • <strong>Jerarquía clara</strong>: Organiza por dominio o funcionalidad<br>
            • <strong>Códigos HTTP</strong>: Si es una API, incluye el código de estado<br>
            • <strong>Contexto útil</strong>: Agrega información que ayude al debugging
        </div>

        <div class="warning-box">
            <strong>⚠️ Errores Comunes:</strong><br>
            • NO crear demasiadas excepciones (solo las necesarias)<br>
            • NO poner lógica de negocio en excepciones<br>
            • NO capturar excepciones genéricas si puedes ser específico<br>
            • NO exponer información sensible en mensajes de excepción<br>
            • SIEMPRE llamar a <code>parent::__construct()</code><br>
            • NO usar excepciones para control de flujo normal
        </div>

        <div class="info-box">
            <strong>💡 Estructura Recomendada:</strong><br>
            <code>src/Exceptions/</code><br>
            ├── <code>AppException.php</code> (base abstracta)<br>
            ├── <code>ValidationException.php</code><br>
            ├── <code>NotFoundException.php</code><br>
            ├── <code>AuthenticationException.php</code><br>
            ├── <code>Usuario/</code><br>
            │   ├── <code>UsuarioNoEncontradoException.php</code><br>
            │   └── <code>EmailYaRegistradoException.php</code><br>
            └── <code>Pago/</code><br>
                ├── <code>PagoRechazadoException.php</code><br>
                └── <code>SaldoInsuficienteException.php</code>
        </div>
    `,
    'bloques-try-catch': `
        <h1>Bloques try-catch-finally en PHP 8+</h1>
        
        <p>Los bloques <code>try-catch-finally</code> te permiten <strong>capturar y manejar excepciones</strong> de forma controlada, evitando que tu aplicación se detenga abruptamente.</p>

        <h3>Estructura Básica: try-catch</h3>
        <div class="code-block"><pre><code>&lt;?php
// Estructura básica
try {
    // Código que puede lanzar excepciones
    $resultado = dividir(10, 0);
    echo "Resultado: $resultado";
    
} catch (Exception $e) {
    // Código que se ejecuta si hay una excepción
    echo "Error: " . $e->getMessage();
}

// Ejemplo práctico: Lectura de archivo
try {
    $contenido = file_get_contents('config.json');
    $config = json_decode($contenido, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new RuntimeException('JSON inválido: ' . json_last_error_msg());
    }
    
    echo "Configuración cargada correctamente";
    
} catch (RuntimeException $e) {
    echo "Error al cargar configuración: " . $e->getMessage();
    // Usar configuración por defecto
    $config = ['debug' => false, 'timeout' => 30];
}
?&gt;</code></pre></div>

        <h3>Múltiples Bloques catch (Específico a Genérico)</h3>
        <p>Captura excepciones específicas primero, luego las más genéricas:</p>
        
        <div class="code-block"><pre><code>&lt;?php
class UsuarioService {
    public function crear(array $datos): Usuario {
        try {
            // Validar datos
            $this->validar($datos);
            
            // Guardar en BD
            $usuario = $this->repository->guardar($datos);
            
            // Enviar email
            $this->emailService->enviarBienvenida($usuario);
            
            return $usuario;
            
        } catch (InvalidArgumentException $e) {
            // Error de validación - específico
            echo "Datos inválidos: " . $e->getMessage();
            throw $e;
            
        } catch (PDOException $e) {
            // Error de base de datos - específico
            error_log("Error BD: " . $e->getMessage());
            throw new RuntimeException("Error al guardar usuario");
            
        } catch (RuntimeException $e) {
            // Error genérico de runtime
            error_log("Error runtime: " . $e->getMessage());
            throw $e;
            
        } catch (Exception $e) {
            // Captura cualquier otra excepción - genérico
            error_log("Error inesperado: " . $e->getMessage());
            throw new RuntimeException("Error inesperado del sistema");
        }
    }
}
?&gt;</code></pre></div>

        <div class="info-box">
            <strong>💡 Orden Importante:</strong><br>
            Siempre captura excepciones <strong>de más específica a más genérica</strong>.<br>
            Si pones <code>catch (Exception $e)</code> primero, capturará TODAS las excepciones y los bloques siguientes nunca se ejecutarán.
        </div>

        <h3>PHP 7.1+: Múltiples Excepciones en un catch</h3>
        <p>Captura varias excepciones con el mismo manejo usando el operador <code>|</code>:</p>
        
        <div class="code-block"><pre><code>&lt;?php
// Antes de PHP 7.1 (repetitivo)
try {
    $resultado = operacionCompleja();
} catch (InvalidArgumentException $e) {
    echo "Error: " . $e->getMessage();
} catch (OutOfRangeException $e) {
    echo "Error: " . $e->getMessage();
} catch (LengthException $e) {
    echo "Error: " . $e->getMessage();
}

// PHP 7.1+ (conciso)
try {
    $resultado = operacionCompleja();
} catch (InvalidArgumentException | OutOfRangeException | LengthException $e) {
    echo "Error de validación: " . $e->getMessage();
}

// Ejemplo práctico: API externa
try {
    $response = $apiClient->get('/usuarios/123');
    $data = json_decode($response->getBody(), true);
    
} catch (ConnectException | RequestException | TimeoutException $e) {
    // Todos son errores de red/conexión
    error_log("Error de conexión API: " . $e->getMessage());
    throw new RuntimeException("Servicio no disponible temporalmente");
    
} catch (ClientException $e) {
    // Error 4xx (cliente)
    throw new RuntimeException("Solicitud inválida: " . $e->getMessage());
    
} catch (ServerException $e) {
    // Error 5xx (servidor)
    throw new RuntimeException("Error del servidor externo");
}
?&gt;</code></pre></div>

        <h3>Bloque finally: Siempre se Ejecuta</h3>
        <p>El bloque <code>finally</code> se ejecuta <strong>SIEMPRE</strong>, haya o no excepción:</p>
        
        <div class="code-block"><pre><code>&lt;?php
// Ejemplo 1: Cerrar recursos
function procesarArchivo(string $ruta): array {
    $archivo = null;
    
    try {
        $archivo = fopen($ruta, 'r');
        
        if (!$archivo) {
            throw new RuntimeException("No se pudo abrir el archivo");
        }
        
        $datos = [];
        while (($linea = fgets($archivo)) !== false) {
            $datos[] = trim($linea);
        }
        
        return $datos;
        
    } catch (RuntimeException $e) {
        error_log("Error: " . $e->getMessage());
        return [];
        
    } finally {
        // SIEMPRE se ejecuta, haya o no error
        if ($archivo) {
            fclose($archivo);
            echo "Archivo cerrado\\n";
        }
    }
}

// Ejemplo 2: Conexión a BD
function consultarBD(string $query): array {
    $conexion = null;
    
    try {
        $conexion = new PDO('mysql:host=localhost;dbname=test', 'user', 'pass');
        $stmt = $conexion->query($query);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
        
    } catch (PDOException $e) {
        error_log("Error BD: " . $e->getMessage());
        throw new RuntimeException("Error en consulta");
        
    } finally {
        // Cerrar conexión SIEMPRE
        $conexion = null;
        echo "Conexión cerrada\\n";
    }
}

// Ejemplo 3: Medir tiempo de ejecución
function operacionLenta(): mixed {
    $inicio = microtime(true);
    
    try {
        // Operación que puede fallar
        sleep(2);
        
        if (rand(0, 1)) {
            throw new RuntimeException("Operación fallida");
        }
        
        return "Éxito";
        
    } catch (RuntimeException $e) {
        return "Error: " . $e->getMessage();
        
    } finally {
        // Medir tiempo SIEMPRE
        $tiempo = microtime(true) - $inicio;
        error_log("Tiempo de ejecución: {$tiempo}s");
    }
}
?&gt;</code></pre></div>

        <div class="warning-box">
            <strong>⚠️ Importante sobre finally:</strong><br>
            • Se ejecuta <strong>SIEMPRE</strong>, incluso si hay <code>return</code> en try o catch<br>
            • Si <code>finally</code> tiene un <code>return</code>, sobrescribe el return de try/catch<br>
            • Si <code>finally</code> lanza una excepción, reemplaza la excepción original<br>
            • Úsalo para <strong>limpieza de recursos</strong> (cerrar archivos, conexiones, etc.)
        </div>

        <h3>try-catch-finally Completo</h3>
        <div class="code-block"><pre><code>&lt;?php
class TransaccionService {
    private PDO $db;
    
    public function transferir(int $origen, int $destino, float $monto): bool {
        $this->db->beginTransaction();
        $exito = false;
        
        try {
            // Validar saldo
            $saldo = $this->obtenerSaldo($origen);
            if ($saldo < $monto) {
                throw new RuntimeException("Saldo insuficiente");
            }
            
            // Retirar de origen
            $this->actualizarSaldo($origen, -$monto);
            
            // Simular error aleatorio
            if (rand(0, 10) === 0) {
                throw new RuntimeException("Error de red");
            }
            
            // Depositar en destino
            $this->actualizarSaldo($destino, $monto);
            
            // Confirmar transacción
            $this->db->commit();
            $exito = true;
            
            return true;
            
        } catch (RuntimeException $e) {
            // Revertir transacción en caso de error
            $this->db->rollBack();
            error_log("Error en transferencia: " . $e->getMessage());
            throw $e;
            
        } finally {
            // Registrar en log SIEMPRE
            $estado = $exito ? 'EXITOSA' : 'FALLIDA';
            error_log("Transferencia {$estado}: {$origen} -> {$destino} ({$monto})");
            
            // Notificar al usuario
            $this->notificar($origen, $estado, $monto);
        }
    }
}
?&gt;</code></pre></div>

        <h3>PHP 8+: Non-capturing catches</h3>
        <p>Si no necesitas la variable de excepción, puedes omitirla (PHP 8+):</p>
        
        <div class="code-block"><pre><code>&lt;?php
// Antes de PHP 8
try {
    $resultado = operacionArriesgada();
} catch (Exception $e) {
    // No usamos $e
    echo "Algo salió mal";
}

// PHP 8+: Sin variable si no la necesitas
try {
    $resultado = operacionArriesgada();
} catch (Exception) {
    // Más limpio si no necesitas los detalles
    echo "Algo salió mal";
}

// Ejemplo práctico
function intentarConexion(): bool {
    try {
        $conexion = new PDO('mysql:host=localhost;dbname=test', 'user', 'pass');
        return true;
    } catch (PDOException) {
        // No necesitamos los detalles, solo saber que falló
        return false;
    }
}

// Con múltiples excepciones
try {
    validarDatos($datos);
} catch (InvalidArgumentException | OutOfRangeException | LengthException) {
    // No necesitamos los detalles específicos
    return ['error' => 'Datos inválidos'];
}
?&gt;</code></pre></div>

        <h3>Nested try-catch (Anidados)</h3>
        <p>Puedes anidar bloques try-catch para manejar errores en diferentes niveles:</p>
        
        <div class="code-block"><pre><code>&lt;?php
class PedidoService {
    public function procesarPedido(array $items): array {
        try {
            // Nivel externo: errores generales
            $total = 0;
            $procesados = [];
            
            foreach ($items as $item) {
                try {
                    // Nivel interno: errores por item
                    $precio = $this->obtenerPrecio($item['id']);
                    $subtotal = $precio * $item['cantidad'];
                    $total += $subtotal;
                    
                    $procesados[] = [
                        'id' => $item['id'],
                        'subtotal' => $subtotal,
                        'estado' => 'OK'
                    ];
                    
                } catch (RuntimeException $e) {
                    // Error en un item específico - continuar con los demás
                    error_log("Error en item {$item['id']}: " . $e->getMessage());
                    $procesados[] = [
                        'id' => $item['id'],
                        'subtotal' => 0,
                        'estado' => 'ERROR',
                        'mensaje' => $e->getMessage()
                    ];
                }
            }
            
            // Validar que al menos un item se procesó
            if ($total === 0) {
                throw new RuntimeException("No se pudo procesar ningún item");
            }
            
            return [
                'total' => $total,
                'items' => $procesados
            ];
            
        } catch (RuntimeException $e) {
            // Error general del pedido
            throw new RuntimeException("Error al procesar pedido: " . $e->getMessage());
        }
    }
}
?&gt;</code></pre></div>

        <h3>Re-lanzar Excepciones (Re-throw)</h3>
        <p>Captura una excepción, haz algo, y vuelve a lanzarla:</p>
        
        <div class="code-block"><pre><code>&lt;?php
function guardarUsuario(array $datos): void {
    try {
        $this->repository->guardar($datos);
        
    } catch (PDOException $e) {
        // Loguear el error técnico
        error_log("Error BD: " . $e->getMessage());
        
        // Re-lanzar con mensaje más amigable
        throw new RuntimeException(
            "No se pudo guardar el usuario",
            0,
            $e  // Mantener excepción original
        );
    }
}

// Uso:
try {
    guardarUsuario(['nombre' => 'Ana']);
} catch (RuntimeException $e) {
    echo $e->getMessage();  // "No se pudo guardar el usuario"
    
    // Acceder a la excepción original
    if ($e->getPrevious()) {
        error_log($e->getPrevious()->getMessage());  // Error técnico de BD
    }
}

// Re-throw simple
try {
    operacionCritica();
} catch (Exception $e) {
    error_log("Error crítico: " . $e->getMessage());
    
    // Re-lanzar la misma excepción
    throw $e;
}
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Mejores Prácticas:</strong><br>
            • <strong>Captura específico primero</strong>: De más específico a más genérico<br>
            • <strong>Usa finally para limpieza</strong>: Cerrar archivos, conexiones, etc.<br>
            • <strong>No captures todo con Exception</strong>: Sé específico cuando puedas<br>
            • <strong>Loguea errores técnicos</strong>: Usa error_log() para debugging<br>
            • <strong>Mensajes amigables al usuario</strong>: No expongas detalles técnicos<br>
            • <strong>Re-lanza con contexto</strong>: Usa el tercer parámetro para mantener la excepción original<br>
            • <strong>PHP 8+</strong>: Omite la variable si no la usas
        </div>

        <div class="info-box">
            <strong>💡 Resumen:</strong><br>
            • <strong>try</strong>: Código que puede lanzar excepciones<br>
            • <strong>catch</strong>: Maneja excepciones específicas (de específico a genérico)<br>
            • <strong>finally</strong>: Se ejecuta SIEMPRE (limpieza de recursos)<br>
            • <strong>|</strong>: Captura múltiples excepciones (PHP 7.1+)<br>
            • <strong>Sin variable</strong>: Omite $e si no la necesitas (PHP 8+)<br>
            • <strong>Re-throw</strong>: Captura, loguea, y vuelve a lanzar
        </div>
    `,
    'errores-fatales': `
        <h1>Errores Fatales y Shutdown Functions en PHP 8+</h1>
        
        <p>Los <strong>errores fatales</strong> son errores críticos que detienen la ejecución de PHP. Con <code>register_shutdown_function()</code> puedes capturarlos y manejarlos antes de que el script termine.</p>

        <h3>¿Qué son los Errores Fatales?</h3>
        <div class="info-box">
            <strong>💡 Tipos de Errores Fatales:</strong><br>
            • <strong>E_ERROR</strong>: Error fatal en tiempo de ejecución<br>
            • <strong>E_PARSE</strong>: Error de sintaxis (parse error)<br>
            • <strong>E_CORE_ERROR</strong>: Error fatal durante el inicio de PHP<br>
            • <strong>E_COMPILE_ERROR</strong>: Error fatal de compilación<br>
            • <strong>E_USER_ERROR</strong>: Error fatal generado por trigger_error()<br><br>
            ⚠️ Estos errores <strong>NO se pueden capturar con try-catch</strong>, pero sí con shutdown functions.
        </div>

        <h3>Shutdown Function Básica</h3>
        <p><code>register_shutdown_function()</code> registra una función que se ejecuta cuando el script termina (normal o por error fatal):</p>
        
        <div class="code-block"><pre><code>&lt;?php
// Registrar función que se ejecuta al finalizar el script
register_shutdown_function(function() {
    echo "Script finalizado\\n";
});

echo "Ejecutando script...\\n";

// Salida:
// Ejecutando script...
// Script finalizado
?&gt;</code></pre></div>

        <h3>Capturar Errores Fatales</h3>
        <p>Usa <code>error_get_last()</code> dentro de la shutdown function para detectar errores fatales:</p>
        
        <div class="code-block"><pre><code>&lt;?php
register_shutdown_function(function() {
    $error = error_get_last();
    
    // Verificar si hubo un error fatal
    if ($error !== null) {
        $errorTypes = [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR];
        
        if (in_array($error['type'], $errorTypes)) {
            // Es un error fatal
            $mensaje = sprintf(
                "ERROR FATAL: %s en %s línea %d",
                $error['message'],
                $error['file'],
                $error['line']
            );
            
            error_log($mensaje);
            
            // Mostrar página de error amigable
            http_response_code(500);
            echo "Lo sentimos, ha ocurrido un error. Por favor, intenta más tarde.";
        }
    }
});

// Esto causará un error fatal
llamarFuncionQueNoExiste();  // Fatal error: Uncaught Error: Call to undefined function
?&gt;</code></pre></div>

        <h3>Shutdown Function Avanzada con Logging</h3>
        <div class="code-block"><pre><code>&lt;?php
class ErrorHandler {
    private string $logFile;
    private bool $isProduction;
    
    public function __construct(string $logFile, bool $isProduction = false) {
        $this->logFile = $logFile;
        $this->isProduction = $isProduction;
        
        // Registrar shutdown function
        register_shutdown_function([$this, 'handleShutdown']);
    }
    
    public function handleShutdown(): void {
        $error = error_get_last();
        
        if ($error === null) {
            return;  // No hubo error
        }
        
        $fatalErrors = [
            E_ERROR,
            E_PARSE,
            E_CORE_ERROR,
            E_COMPILE_ERROR,
            E_USER_ERROR
        ];
        
        if (in_array($error['type'], $fatalErrors)) {
            $this->logFatalError($error);
            $this->displayErrorPage($error);
        }
    }
    
    private function logFatalError(array $error): void {
        $logData = [
            'timestamp' => date('c'),
            'type' => $this->getErrorTypeName($error['type']),
            'message' => $error['message'],
            'file' => $error['file'],
            'line' => $error['line'],
            'url' => $_SERVER['REQUEST_URI'] ?? 'CLI',
            'method' => $_SERVER['REQUEST_METHOD'] ?? 'CLI',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown'
        ];
        
        // Guardar en formato JSON
        $logEntry = json_encode($logData, JSON_PRETTY_PRINT) . ",\\n";
        file_put_contents($this->logFile, $logEntry, FILE_APPEND);
        
        // Enviar notificación si es producción
        if ($this->isProduction) {
            $this->sendNotification($logData);
        }
    }
    
    private function displayErrorPage(array $error): void {
        // Limpiar cualquier output previo
        if (ob_get_level()) {
            ob_clean();
        }
        
        http_response_code(500);
        
        if ($this->isProduction) {
            // Mensaje genérico en producción
            echo '<!DOCTYPE html>
            <html>
            <head>
                <title>Error del Servidor</title>
                <style>
                    body { font-family: Arial; text-align: center; padding: 50px; }
                    h1 { color: #e74c3c; }
                </style>
            </head>
            <body>
                <h1>Error del Servidor</h1>
                <p>Lo sentimos, ha ocurrido un error inesperado.</p>
                <p>Por favor, intenta nuevamente más tarde.</p>
            </body>
            </html>';
        } else {
            // Mostrar detalles en desarrollo
            echo '<!DOCTYPE html>
            <html>
            <head>
                <title>Fatal Error</title>
                <style>
                    body { font-family: monospace; padding: 20px; background: #f8f9fa; }
                    .error { background: #fff; border-left: 4px solid #e74c3c; padding: 20px; }
                    .type { color: #e74c3c; font-weight: bold; }
                    .file { color: #3498db; }
                </style>
            </head>
            <body>
                <div class="error">
                    <h2 class="type">' . $this->getErrorTypeName($error['type']) . '</h2>
                    <p><strong>Mensaje:</strong> ' . htmlspecialchars($error['message']) . '</p>
                    <p class="file"><strong>Archivo:</strong> ' . $error['file'] . '</p>
                    <p><strong>Línea:</strong> ' . $error['line'] . '</p>
                </div>
            </body>
            </html>';
        }
    }
    
    private function getErrorTypeName(int $type): string {
        return match($type) {
            E_ERROR => 'E_ERROR',
            E_PARSE => 'E_PARSE',
            E_CORE_ERROR => 'E_CORE_ERROR',
            E_COMPILE_ERROR => 'E_COMPILE_ERROR',
            E_USER_ERROR => 'E_USER_ERROR',
            default => 'UNKNOWN_ERROR'
        };
    }
    
    private function sendNotification(array $logData): void {
        // Enviar email, Slack, etc.
        // mail('admin@example.com', 'Error Fatal', json_encode($logData));
    }
}

// Uso:
$errorHandler = new ErrorHandler(
    __DIR__ . '/logs/fatal-errors.log',
    isProduction: getenv('APP_ENV') === 'production'
);

// El resto de tu aplicación...
?&gt;</code></pre></div>

        <h3>PHP 7+: Error vs Exception</h3>
        <p>Desde PHP 7, muchos errores fatales se convirtieron en excepciones <code>Error</code> que SÍ se pueden capturar:</p>
        
        <div class="code-block"><pre><code>&lt;?php
// PHP 7+: DivisionByZeroError (se puede capturar)
try {
    $result = intdiv(10, 0);
} catch (DivisionByZeroError $e) {
    echo "Error: " . $e->getMessage();  // "Division by zero"
}

// PHP 7+: TypeError (se puede capturar)
declare(strict_types=1);

function sumar(int $a, int $b): int {
    return $a + $b;
}

try {
    sumar("5", "10");
} catch (TypeError $e) {
    echo "Error de tipo: " . $e->getMessage();
}

// PHP 7+: ParseError (se puede capturar con eval)
try {
    eval('$x = ;');  // Sintaxis inválida
} catch (ParseError $e) {
    echo "Error de sintaxis: " . $e->getMessage();
}

// PHP 7+: ArithmeticError
try {
    $x = PHP_INT_MAX;
    $y = $x << 1000;  // Shift muy grande
} catch (ArithmeticError $e) {
    echo "Error aritmético: " . $e->getMessage();
}

// Capturar todos los errores de PHP 7+
try {
    // Código que puede lanzar Error o Exception
    operacionPeligrosa();
} catch (Throwable $e) {
    // Captura TANTO Error como Exception
    echo "Error: " . $e->getMessage();
}
?&gt;</code></pre></div>

        <div class="warning-box">
            <strong>⚠️ Error vs Exception:</strong><br>
            • <strong>Exception</strong>: Errores de tu aplicación (SÍ capturar con try-catch)<br>
            • <strong>Error</strong>: Errores internos de PHP (normalmente NO capturar)<br>
            • <strong>Throwable</strong>: Interfaz padre de ambos (captura TODO)<br>
            • Desde PHP 7, muchos errores fatales son ahora <code>Error</code> y se pueden capturar<br>
            • Los errores de sintaxis (E_PARSE) NO se pueden capturar en el mismo archivo
        </div>

        <h3>Múltiples Shutdown Functions</h3>
        <p>Puedes registrar varias shutdown functions. Se ejecutan en el orden en que fueron registradas:</p>
        
        <div class="code-block"><pre><code>&lt;?php
// Primera función: Cerrar conexiones
register_shutdown_function(function() {
    global $db;
    if ($db) {
        $db->close();
        error_log("Conexión BD cerrada");
    }
});

// Segunda función: Limpiar archivos temporales
register_shutdown_function(function() {
    $tempFiles = glob('/tmp/app_*');
    foreach ($tempFiles as $file) {
        unlink($file);
    }
    error_log("Archivos temporales eliminados");
});

// Tercera función: Registrar tiempo de ejecución
register_shutdown_function(function() {
    $tiempo = microtime(true) - $_SERVER['REQUEST_TIME_FLOAT'];
    error_log("Tiempo de ejecución: {$tiempo}s");
});

// Cuarta función: Detectar errores fatales
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error && $error['type'] === E_ERROR) {
        error_log("ERROR FATAL: " . $error['message']);
    }
});

// Todas se ejecutarán en orden al finalizar el script
?&gt;</code></pre></div>

        <h3>Shutdown Function con Output Buffering</h3>
        <p>Combina shutdown functions con output buffering para modificar la salida antes de enviarla:</p>
        
        <div class="code-block"><pre><code>&lt;?php
// Iniciar output buffering
ob_start();

register_shutdown_function(function() {
    $error = error_get_last();
    
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR])) {
        // Limpiar el buffer (descartar output previo)
        ob_clean();
        
        // Enviar página de error personalizada
        http_response_code(500);
        echo json_encode([
            'error' => true,
            'message' => 'Error interno del servidor',
            'timestamp' => date('c')
        ]);
        
        // Loguear el error real
        error_log(sprintf(
            "Fatal Error: %s en %s:%d",
            $error['message'],
            $error['file'],
            $error['line']
        ));
    }
    
    // Enviar el buffer al navegador
    ob_end_flush();
});

// Tu aplicación
echo "Procesando...\\n";
// Si hay un error fatal aquí, se mostrará la respuesta JSON
?&gt;</code></pre></div>

        <h3>Ejemplo Completo: Sistema de Manejo de Errores</h3>
        <div class="code-block"><pre><code>&lt;?php
class GlobalErrorHandler {
    private static ?self $instance = null;
    private array $config;
    
    private function __construct(array $config) {
        $this->config = $config;
        
        // Configurar error reporting
        error_reporting(E_ALL);
        ini_set('display_errors', $config['display_errors'] ? '1' : '0');
        ini_set('log_errors', '1');
        ini_set('error_log', $config['log_file']);
        
        // Registrar handlers
        set_error_handler([$this, 'handleError']);
        set_exception_handler([$this, 'handleException']);
        register_shutdown_function([$this, 'handleShutdown']);
    }
    
    public static function init(array $config): void {
        if (self::$instance === null) {
            self::$instance = new self($config);
        }
    }
    
    public function handleError(
        int $errno,
        string $errstr,
        string $errfile,
        int $errline
    ): bool {
        // No procesar si está suprimido con @
        if (!(error_reporting() & $errno)) {
            return false;
        }
        
        throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
    }
    
    public function handleException(Throwable $e): void {
        $this->logException($e);
        $this->displayException($e);
    }
    
    public function handleShutdown(): void {
        $error = error_get_last();
        
        if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR])) {
            $this->logFatalError($error);
            $this->displayFatalError($error);
        }
    }
    
    private function logException(Throwable $e): void {
        $logData = [
            'timestamp' => date('c'),
            'type' => get_class($e),
            'message' => $e->getMessage(),
            'code' => $e->getCode(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString()
        ];
        
        error_log(json_encode($logData));
    }
    
    private function logFatalError(array $error): void {
        error_log(sprintf(
            "FATAL ERROR: %s en %s:%d",
            $error['message'],
            $error['file'],
            $error['line']
        ));
    }
    
    private function displayException(Throwable $e): void {
        http_response_code(500);
        
        if ($this->config['display_errors']) {
            echo "<h1>Exception: " . get_class($e) . "</h1>";
            echo "<p>" . htmlspecialchars($e->getMessage()) . "</p>";
            echo "<pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
        } else {
            echo "Error del servidor. Por favor, contacta al administrador.";
        }
    }
    
    private function displayFatalError(array $error): void {
        if (ob_get_level()) {
            ob_clean();
        }
        
        http_response_code(500);
        echo "Error fatal del servidor.";
    }
}

// Inicializar
GlobalErrorHandler::init([
    'display_errors' => getenv('APP_ENV') !== 'production',
    'log_file' => __DIR__ . '/logs/errors.log'
]);

// Ahora todos los errores y excepciones serán manejados automáticamente
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Mejores Prácticas:</strong><br>
            • <strong>Siempre registra shutdown functions</strong> para capturar errores fatales<br>
            • <strong>Loguea errores fatales</strong> con contexto completo (archivo, línea, URL)<br>
            • <strong>Muestra mensajes genéricos en producción</strong>, detalles solo en desarrollo<br>
            • <strong>Combina con output buffering</strong> para controlar la salida<br>
            • <strong>Usa Throwable</strong> para capturar tanto Error como Exception<br>
            • <strong>Limpia recursos</strong> en shutdown functions (conexiones, archivos)<br>
            • <strong>Notifica errores críticos</strong> (email, Slack, etc.)
        </div>

        <div class="info-box">
            <strong>💡 Resumen:</strong><br>
            • <strong>register_shutdown_function()</strong>: Se ejecuta al finalizar el script<br>
            • <strong>error_get_last()</strong>: Obtiene el último error (incluidos fatales)<br>
            • <strong>E_ERROR, E_PARSE</strong>: Errores fatales que detienen PHP<br>
            • <strong>PHP 7+</strong>: Muchos errores fatales son ahora <code>Error</code> (capturables)<br>
            • <strong>Throwable</strong>: Captura tanto Error como Exception<br>
            • <strong>Output buffering</strong>: Controla la salida en caso de error fatal
        </div>
    `,
    'logging-errores': `
        <h1>Logging de Errores y Stack Traces en PHP 8+</h1>
        
        <p>El <strong>logging</strong> es fundamental para detectar, diagnosticar y resolver problemas en producción. Un buen sistema de logs te permite entender qué pasó, cuándo y por qué.</p>

        <h3>error_log() - Función Básica</h3>
        <p>La función <code>error_log()</code> es la forma más simple de registrar errores en PHP:</p>
        
        <div class="code-block"><pre><code>&lt;?php
// 1. Log al archivo de error por defecto (php.ini: error_log)
error_log("Mensaje de error simple");

// 2. Log a un archivo específico (tipo 3)
error_log("Error en base de datos", 3, "/var/log/php/app.log");

// 3. Log con contexto
error_log(sprintf(
    "[%s] Usuario %d intentó acceder a recurso %s",
    date('Y-m-d H:i:s'),
    $userId,
    $recurso
));

// 4. Log de arrays/objetos
$datos = ['user_id' => 123, 'action' => 'login', 'ip' => '192.168.1.1'];
error_log(print_r($datos, true));  // Legible pero no estructurado

// Mejor: JSON
error_log(json_encode($datos));  // Estructurado y parseable
?&gt;</code></pre></div>

        <h3>Niveles de Log (PSR-3 Standard)</h3>
        <p>Los logs deben tener niveles de severidad para filtrar y priorizar:</p>
        
        <div class="code-block"><pre><code>&lt;?php
class Logger {
    private string $logFile;
    
    public function __construct(string $logFile) {
        $this->logFile = $logFile;
    }
    
    // Nivel 1: DEBUG - Información detallada para debugging
    public function debug(string $message, array $context = []): void {
        $this->log('DEBUG', $message, $context);
    }
    
    // Nivel 2: INFO - Eventos informativos
    public function info(string $message, array $context = []): void {
        $this->log('INFO', $message, $context);
    }
    
    // Nivel 3: NOTICE - Eventos normales pero significativos
    public function notice(string $message, array $context = []): void {
        $this->log('NOTICE', $message, $context);
    }
    
    // Nivel 4: WARNING - Advertencias, no errores
    public function warning(string $message, array $context = []): void {
        $this->log('WARNING', $message, $context);
    }
    
    // Nivel 5: ERROR - Errores en runtime que no detienen la app
    public function error(string $message, array $context = []): void {
        $this->log('ERROR', $message, $context);
    }
    
    // Nivel 6: CRITICAL - Condiciones críticas
    public function critical(string $message, array $context = []): void {
        $this->log('CRITICAL', $message, $context);
    }
    
    // Nivel 7: ALERT - Acción debe tomarse inmediatamente
    public function alert(string $message, array $context = []): void {
        $this->log('ALERT', $message, $context);
    }
    
    // Nivel 8: EMERGENCY - Sistema inutilizable
    public function emergency(string $message, array $context = []): void {
        $this->log('EMERGENCY', $message, $context);
    }
    
    private function log(string $level, string $message, array $context): void {
        $logEntry = [
            'timestamp' => date('c'),
            'level' => $level,
            'message' => $message,
            'context' => $context,
            'memory' => memory_get_usage(true),
            'peak_memory' => memory_get_peak_usage(true)
        ];
        
        $logLine = json_encode($logEntry) . "\\n";
        file_put_contents($this->logFile, $logLine, FILE_APPEND | LOCK_EX);
    }
}

// Uso:
$logger = new Logger(__DIR__ . '/logs/app.log');

$logger->debug('Iniciando proceso de login', ['user_id' => 123]);
$logger->info('Usuario autenticado correctamente', ['user_id' => 123]);
$logger->warning('Intento de acceso a recurso restringido', ['user_id' => 123, 'resource' => '/admin']);
$logger->error('Error al conectar con BD', ['host' => 'localhost', 'error' => 'Connection refused']);
$logger->critical('Disco casi lleno', ['usage' => '95%']);
?&gt;</code></pre></div>

        <h3>Stack Traces - Rastreo de Llamadas</h3>
        <p>Los stack traces muestran la secuencia de llamadas que llevaron a un error:</p>
        
        <div class="code-block"><pre><code>&lt;?php
// 1. Stack trace de una excepción
try {
    funcionA();
} catch (Exception $e) {
    // Obtener stack trace como string
    echo $e->getTraceAsString();
    
    // Obtener stack trace como array
    $trace = $e->getTrace();
    foreach ($trace as $frame) {
        echo "Archivo: {$frame['file']}\\n";
        echo "Línea: {$frame['line']}\\n";
        echo "Función: {$frame['function']}\\n";
        echo "Clase: " . ($frame['class'] ?? 'N/A') . "\\n";
    }
}

// 2. Stack trace sin excepción (debug_backtrace)
function funcionA() {
    funcionB();
}

function funcionB() {
    funcionC();
}

function funcionC() {
    // Obtener stack trace actual
    $trace = debug_backtrace();
    
    echo "Stack trace actual:\\n";
    foreach ($trace as $i => $frame) {
        echo "#{$i} {$frame['file']}({$frame['line']}): ";
        echo "{$frame['function']}()\\n";
    }
}

funcionA();

// Salida:
// #0 /path/file.php(15): funcionC()
// #1 /path/file.php(11): funcionB()
// #2 /path/file.php(7): funcionA()

// 3. Stack trace simplificado (sin argumentos)
$trace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS);

// 4. Stack trace limitado (solo N niveles)
$trace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 5);
?&gt;</code></pre></div>

        <h3>Logger Avanzado con Stack Traces</h3>
        <div class="code-block"><pre><code>&lt;?php
class AdvancedLogger {
    private string $logFile;
    private string $minLevel;
    
    private const LEVELS = [
        'DEBUG' => 0,
        'INFO' => 1,
        'WARNING' => 2,
        'ERROR' => 3,
        'CRITICAL' => 4
    ];
    
    public function __construct(string $logFile, string $minLevel = 'DEBUG') {
        $this->logFile = $logFile;
        $this->minLevel = $minLevel;
    }
    
    public function error(string $message, ?Throwable $exception = null): void {
        $context = [];
        
        if ($exception) {
            $context = [
                'exception_class' => get_class($exception),
                'exception_message' => $exception->getMessage(),
                'exception_code' => $exception->getCode(),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
                'stack_trace' => $this->formatStackTrace($exception->getTrace())
            ];
            
            // Incluir excepción anterior si existe
            if ($exception->getPrevious()) {
                $context['previous_exception'] = [
                    'class' => get_class($exception->getPrevious()),
                    'message' => $exception->getPrevious()->getMessage()
                ];
            }
        }
        
        $this->log('ERROR', $message, $context);
    }
    
    private function formatStackTrace(array $trace): array {
        $formatted = [];
        
        foreach ($trace as $i => $frame) {
            $formatted[] = sprintf(
                "#%d %s(%d): %s%s%s()",
                $i,
                $frame['file'] ?? '[internal]',
                $frame['line'] ?? 0,
                $frame['class'] ?? '',
                $frame['type'] ?? '',
                $frame['function']
            );
        }
        
        return $formatted;
    }
    
    private function log(string $level, string $message, array $context): void {
        // Verificar nivel mínimo
        if (self::LEVELS[$level] < self::LEVELS[$this->minLevel]) {
            return;
        }
        
        $logEntry = [
            'timestamp' => date('c'),
            'level' => $level,
            'message' => $message,
            'context' => $context,
            'request_uri' => $_SERVER['REQUEST_URI'] ?? 'CLI',
            'request_method' => $_SERVER['REQUEST_METHOD'] ?? 'CLI',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown',
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'Unknown',
            'memory_usage' => $this->formatBytes(memory_get_usage(true)),
            'peak_memory' => $this->formatBytes(memory_get_peak_usage(true))
        ];
        
        // Escribir en formato JSON con pretty print
        $logLine = json_encode($logEntry, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . ",\\n";
        file_put_contents($this->logFile, $logLine, FILE_APPEND | LOCK_EX);
    }
    
    private function formatBytes(int $bytes): string {
        $units = ['B', 'KB', 'MB', 'GB'];
        $i = 0;
        
        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }
}

// Uso:
$logger = new AdvancedLogger(__DIR__ . '/logs/app.log', 'WARNING');

try {
    // Operación que puede fallar
    $resultado = operacionPeligrosa();
} catch (Exception $e) {
    $logger->error('Error al ejecutar operación', $e);
}
?&gt;</code></pre></div>

        <h3>Logging con Rotación de Archivos</h3>
        <p>Para evitar que los logs crezcan indefinidamente:</p>
        
        <div class="code-block"><pre><code>&lt;?php
class RotatingLogger {
    private string $logDir;
    private string $logName;
    private int $maxFileSize;
    private int $maxFiles;
    
    public function __construct(
        string $logDir,
        string $logName = 'app',
        int $maxFileSize = 10 * 1024 * 1024,  // 10 MB
        int $maxFiles = 5
    ) {
        $this->logDir = rtrim($logDir, '/');
        $this->logName = $logName;
        $this->maxFileSize = $maxFileSize;
        $this->maxFiles = $maxFiles;
        
        // Crear directorio si no existe
        if (!is_dir($this->logDir)) {
            mkdir($this->logDir, 0755, true);
        }
    }
    
    public function log(string $level, string $message, array $context = []): void {
        $currentFile = "{$this->logDir}/{$this->logName}.log";
        
        // Rotar si el archivo es muy grande
        if (file_exists($currentFile) && filesize($currentFile) >= $this->maxFileSize) {
            $this->rotate();
        }
        
        $logEntry = [
            'timestamp' => date('c'),
            'level' => $level,
            'message' => $message,
            'context' => $context
        ];
        
        $logLine = json_encode($logEntry) . "\\n";
        file_put_contents($currentFile, $logLine, FILE_APPEND | LOCK_EX);
    }
    
    private function rotate(): void {
        // Eliminar el archivo más antiguo si existe
        $oldestFile = "{$this->logDir}/{$this->logName}.{$this->maxFiles}.log";
        if (file_exists($oldestFile)) {
            unlink($oldestFile);
        }
        
        // Renombrar archivos existentes
        for ($i = $this->maxFiles - 1; $i >= 1; $i--) {
            $oldFile = "{$this->logDir}/{$this->logName}.{$i}.log";
            $newFile = "{$this->logDir}/{$this->logName}." . ($i + 1) . ".log";
            
            if (file_exists($oldFile)) {
                rename($oldFile, $newFile);
            }
        }
        
        // Renombrar archivo actual
        $currentFile = "{$this->logDir}/{$this->logName}.log";
        $newFile = "{$this->logDir}/{$this->logName}.1.log";
        rename($currentFile, $newFile);
    }
}

// Uso:
$logger = new RotatingLogger(__DIR__ . '/logs', 'app', 10 * 1024 * 1024, 5);
$logger->log('ERROR', 'Error de conexión', ['host' => 'localhost']);

// Estructura de archivos:
// logs/app.log        (actual)
// logs/app.1.log      (anterior)
// logs/app.2.log      (más antiguo)
// logs/app.3.log
// logs/app.4.log
// logs/app.5.log      (se eliminará en la próxima rotación)
?&gt;</code></pre></div>

        <h3>Logging por Canal (Múltiples Logs)</h3>
        <div class="code-block"><pre><code>&lt;?php
class ChannelLogger {
    private array $channels = [];
    
    public function channel(string $name): self {
        if (!isset($this->channels[$name])) {
            $this->channels[$name] = new Logger(__DIR__ . "/logs/{$name}.log");
        }
        return $this->channels[$name];
    }
}

class Logger {
    private string $logFile;
    
    public function __construct(string $logFile) {
        $this->logFile = $logFile;
    }
    
    public function info(string $message, array $context = []): void {
        $this->log('INFO', $message, $context);
    }
    
    public function error(string $message, array $context = []): void {
        $this->log('ERROR', $message, $context);
    }
    
    private function log(string $level, string $message, array $context): void {
        $logEntry = [
            'timestamp' => date('c'),
            'level' => $level,
            'message' => $message,
            'context' => $context
        ];
        
        $logLine = json_encode($logEntry) . "\\n";
        file_put_contents($this->logFile, $logLine, FILE_APPEND | LOCK_EX);
    }
}

// Uso: Logs separados por funcionalidad
$logger = new ChannelLogger();

// Log de base de datos
$logger->channel('database')->error('Error en query', ['query' => 'SELECT * FROM users']);

// Log de autenticación
$logger->channel('auth')->info('Usuario autenticado', ['user_id' => 123]);

// Log de API
$logger->channel('api')->error('Error en API externa', ['endpoint' => '/users/123']);

// Log de pagos
$logger->channel('payments')->info('Pago procesado', ['amount' => 99.99, 'currency' => 'USD']);

// Estructura de archivos:
// logs/database.log
// logs/auth.log
// logs/api.log
// logs/payments.log
?&gt;</code></pre></div>

        <h3>Ejemplo Completo: Sistema de Logging Profesional</h3>
        <div class="code-block"><pre><code>&lt;?php
class ProductionLogger {
    private string $logFile;
    private string $errorLogFile;
    private bool $logToFile;
    private bool $logToSyslog;
    
    public function __construct(array $config) {
        $this->logFile = $config['log_file'];
        $this->errorLogFile = $config['error_log_file'];
        $this->logToFile = $config['log_to_file'] ?? true;
        $this->logToSyslog = $config['log_to_syslog'] ?? false;
    }
    
    public function logException(Throwable $e, array $additionalContext = []): void {
        $logData = [
            'timestamp' => date('c'),
            'level' => 'ERROR',
            'exception' => [
                'class' => get_class($e),
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ],
            'stack_trace' => array_map(function($frame) {
                return [
                    'file' => $frame['file'] ?? 'unknown',
                    'line' => $frame['line'] ?? 0,
                    'function' => $frame['function'],
                    'class' => $frame['class'] ?? null
                ];
            }, $e->getTrace()),
            'request' => [
                'uri' => $_SERVER['REQUEST_URI'] ?? 'CLI',
                'method' => $_SERVER['REQUEST_METHOD'] ?? 'CLI',
                'ip' => $_SERVER['REMOTE_ADDR'] ?? 'Unknown',
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown'
            ],
            'server' => [
                'hostname' => gethostname(),
                'php_version' => PHP_VERSION,
                'memory_usage' => memory_get_usage(true),
                'peak_memory' => memory_get_peak_usage(true)
            ],
            'context' => $additionalContext
        ];
        
        // Log a archivo
        if ($this->logToFile) {
            $logLine = json_encode($logData, JSON_PRETTY_PRINT) . ",\\n";
            file_put_contents($this->errorLogFile, $logLine, FILE_APPEND | LOCK_EX);
        }
        
        // Log a syslog
        if ($this->logToSyslog) {
            syslog(LOG_ERR, json_encode($logData));
        }
        
        // Enviar notificación para errores críticos
        if ($e instanceof CriticalException) {
            $this->sendNotification($logData);
        }
    }
    
    public function logRequest(): void {
        $logData = [
            'timestamp' => date('c'),
            'level' => 'INFO',
            'type' => 'REQUEST',
            'method' => $_SERVER['REQUEST_METHOD'] ?? 'CLI',
            'uri' => $_SERVER['REQUEST_URI'] ?? 'CLI',
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'Unknown',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown',
            'execution_time' => microtime(true) - $_SERVER['REQUEST_TIME_FLOAT']
        ];
        
        $logLine = json_encode($logData) . "\\n";
        file_put_contents($this->logFile, $logLine, FILE_APPEND | LOCK_EX);
    }
    
    private function sendNotification(array $logData): void {
        // Enviar a Slack, email, etc.
        // mail('admin@example.com', 'Error Crítico', json_encode($logData));
    }
}

// Uso:
$logger = new ProductionLogger([
    'log_file' => __DIR__ . '/logs/app.log',
    'error_log_file' => __DIR__ . '/logs/errors.log',
    'log_to_file' => true,
    'log_to_syslog' => false
]);

// Registrar en shutdown function
register_shutdown_function(function() use ($logger) {
    $logger->logRequest();
});

// Capturar excepciones
try {
    // Tu código
} catch (Throwable $e) {
    $logger->logException($e, ['user_id' => $userId ?? null]);
    throw $e;
}
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Mejores Prácticas de Logging:</strong><br>
            • <strong>Usa niveles apropiados</strong>: DEBUG, INFO, WARNING, ERROR, CRITICAL<br>
            • <strong>Formato estructurado</strong>: JSON es ideal para parsear y analizar<br>
            • <strong>Incluye contexto</strong>: timestamp, user_id, IP, URI, etc.<br>
            • <strong>Stack traces completos</strong>: Facilitan el debugging<br>
            • <strong>Rota logs</strong>: Evita archivos gigantes<br>
            • <strong>Separa por canal</strong>: database.log, auth.log, api.log<br>
            • <strong>No loguees datos sensibles</strong>: Contraseñas, tokens, tarjetas<br>
            • <strong>Usa LOCK_EX</strong>: Evita corrupción en escrituras concurrentes
        </div>

        <div class="warning-box">
            <strong>⚠️ Errores Comunes:</strong><br>
            • NO loguear contraseñas o datos sensibles<br>
            • NO usar <code>print_r()</code> o <code>var_dump()</code> en producción<br>
            • NO dejar logs de DEBUG activos en producción<br>
            • NO ignorar permisos de archivos (755 para directorios, 644 para logs)<br>
            • NO olvidar rotar logs (pueden llenar el disco)<br>
            • SIEMPRE sanitizar datos antes de loguear
        </div>

        <div class="info-box">
            <strong>💡 Resumen:</strong><br>
            • <strong>error_log()</strong>: Función básica de PHP para logging<br>
            • <strong>PSR-3</strong>: Estándar de niveles de log (DEBUG → EMERGENCY)<br>
            • <strong>Stack traces</strong>: <code>getTrace()</code>, <code>getTraceAsString()</code>, <code>debug_backtrace()</code><br>
            • <strong>JSON</strong>: Formato ideal para logs estructurados<br>
            • <strong>Rotación</strong>: Limita tamaño de archivos de log<br>
            • <strong>Canales</strong>: Separa logs por funcionalidad
        </div>
    `,
    'xdebug': `
        <h1>Depuración con Xdebug en PHP 8+</h1>
        
        <p><strong>Xdebug</strong> es la extensión más potente para debugging y profiling de PHP. Te permite depurar código paso a paso, inspeccionar variables, y analizar el rendimiento de tu aplicación.</p>

        <h3>¿Qué es Xdebug?</h3>
        <div class="info-box">
            <strong>💡 Características de Xdebug:</strong><br>
            • <strong>Step Debugging</strong>: Depurar código línea por línea<br>
            • <strong>Breakpoints</strong>: Pausar ejecución en puntos específicos<br>
            • <strong>Variable Inspection</strong>: Ver valores de variables en tiempo real<br>
            • <strong>Stack Traces</strong>: Rastreo detallado de llamadas<br>
            • <strong>Profiling</strong>: Análisis de rendimiento y cuellos de botella<br>
            • <strong>Code Coverage</strong>: Cobertura de código para tests<br>
            • <strong>Improved var_dump()</strong>: Salida más legible y colorida
        </div>

        <h3>Instalación de Xdebug</h3>
        <div class="code-block"><pre><code># Linux/Mac con PECL
pecl install xdebug

# Ubuntu/Debian
sudo apt-get install php-xdebug

# Mac con Homebrew
brew install php@8.2
pecl install xdebug

# Windows
# 1. Descargar DLL desde https://xdebug.org/download
# 2. Copiar a C:\\php\\ext\\
# 3. Agregar a php.ini

# Verificar instalación
php -v
# Deberías ver: "with Xdebug v3.x.x"

# Ver configuración de Xdebug
php -i | grep xdebug
</code></pre></div>

        <h3>Configuración de Xdebug 3 (php.ini)</h3>
        <p>Xdebug 3 simplificó la configuración con el parámetro <code>xdebug.mode</code>:</p>
        
        <div class="code-block"><pre><code># php.ini - Configuración básica de Xdebug 3

# Cargar extensión
zend_extension=xdebug.so  # Linux/Mac
; zend_extension=php_xdebug.dll  # Windows

# Modo de operación (puedes combinar varios con comas)
xdebug.mode=debug,develop,coverage,profile

# Configuración de debugging
xdebug.start_with_request=trigger  # trigger, yes, no
xdebug.client_host=localhost
xdebug.client_port=9003  # Puerto por defecto en Xdebug 3 (antes era 9000)

# Configuración de desarrollo
xdebug.var_display_max_depth=10
xdebug.var_display_max_children=256
xdebug.var_display_max_data=1024

# Configuración de profiling
xdebug.output_dir=/tmp/xdebug
xdebug.profiler_output_name=cachegrind.out.%p

# Configuración de tracing
xdebug.trace_output_dir=/tmp/xdebug
xdebug.trace_format=1  # 0=texto, 1=computarizado

# Mejorar var_dump()
xdebug.cli_color=1  # Colores en CLI
</code></pre></div>

        <div class="warning-box">
            <strong>⚠️ Importante:</strong><br>
            • <strong>Xdebug 3 usa puerto 9003</strong> (Xdebug 2 usaba 9000)<br>
            • <strong>NO uses Xdebug en producción</strong> - reduce el rendimiento significativamente<br>
            • <strong>start_with_request=trigger</strong> es más seguro que "yes"<br>
            • Reinicia PHP/servidor web después de cambiar php.ini
        </div>

        <h3>Modos de Xdebug 3</h3>
        <div class="code-block"><pre><code># Modos disponibles en xdebug.mode:

# 1. debug - Step debugging con IDE
xdebug.mode=debug

# 2. develop - Mejoras en desarrollo (var_dump mejorado, etc.)
xdebug.mode=develop

# 3. coverage - Cobertura de código para tests
xdebug.mode=coverage

# 4. profile - Profiling de rendimiento
xdebug.mode=profile

# 5. trace - Rastreo de ejecución
xdebug.mode=trace

# 6. gcstats - Estadísticas de garbage collector
xdebug.mode=gcstats

# Combinar varios modos (separados por coma)
xdebug.mode=debug,develop,coverage

# Desactivar Xdebug
xdebug.mode=off
</code></pre></div>

        <h3>Configuración en VS Code</h3>
        <p>VS Code es uno de los IDEs más populares para PHP con Xdebug:</p>
        
        <div class="code-block"><pre><code>// .vscode/launch.json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Listen for Xdebug",
            "type": "php",
            "request": "launch",
            "port": 9003,
            "pathMappings": {
                "/var/www/html": "\${workspaceFolder}"
            }
        },
        {
            "name": "Launch currently open script",
            "type": "php",
            "request": "launch",
            "program": "\${file}",
            "cwd": "\${fileDirname}",
            "port": 9003
        }
    ]
}

// Extensión requerida:
// PHP Debug por Xdebug
// https://marketplace.visualstudio.com/items?itemName=xdebug.php-debug
</code></pre></div>

        <h3>Configuración en PhpStorm</h3>
        <div class="code-block"><pre><code>// PhpStorm tiene soporte nativo para Xdebug

// 1. Settings → PHP → Debug
//    - Xdebug port: 9003
//    - ✓ Can accept external connections
//    - ✓ Break at first line in PHP scripts

// 2. Settings → PHP → Servers
//    - Name: localhost
//    - Host: localhost
//    - Port: 80
//    - Debugger: Xdebug
//    - ✓ Use path mappings
//    - Absolute path on server: /var/www/html
//    - Project files: /path/to/project

// 3. Activar "Start Listening for PHP Debug Connections"
//    (icono de teléfono en la barra superior)

// 4. Establecer breakpoints (click en margen izquierdo)

// 5. Iniciar debugging con navegador o CLI
</code></pre></div>

        <h3>Activar Debugging (Trigger)</h3>
        <p>Con <code>start_with_request=trigger</code>, necesitas activar Xdebug manualmente:</p>
        
        <div class="code-block"><pre><code># 1. Navegador - Agregar parámetro GET
http://localhost/index.php?XDEBUG_SESSION_START=1

# O usar cookie (más conveniente)
# Instalar extensión de navegador:
# - Chrome: Xdebug helper
# - Firefox: Xdebug Helper
# - Edge: Xdebug Helper

# 2. CLI - Variable de entorno
export XDEBUG_SESSION=1
php script.php

# O en una sola línea
XDEBUG_SESSION=1 php script.php

# 3. Curl - Header
curl -H "Cookie: XDEBUG_SESSION=1" http://localhost/api/users

# 4. Postman - Cookie
# Agregar cookie: XDEBUG_SESSION=1

# Desactivar debugging
http://localhost/index.php?XDEBUG_SESSION_STOP=1
</code></pre></div>

        <h3>Uso Básico: Breakpoints y Step Debugging</h3>
        <div class="code-block"><pre><code>&lt;?php
// ejemplo.php

function calcularTotal(array $items): float {
    $total = 0;
    
    // Breakpoint aquí - La ejecución se pausará
    foreach ($items as $item) {
        $precio = $item['precio'];
        $cantidad = $item['cantidad'];
        $subtotal = $precio * $cantidad;
        
        // Breakpoint condicional: solo si $subtotal > 100
        $total += $subtotal;
    }
    
    return $total;
}

$items = [
    ['nombre' => 'Laptop', 'precio' => 999.99, 'cantidad' => 2],
    ['nombre' => 'Mouse', 'precio' => 29.99, 'cantidad' => 5],
    ['nombre' => 'Teclado', 'precio' => 79.99, 'cantidad' => 3]
];

// Breakpoint aquí
$total = calcularTotal($items);
echo "Total: $total\\n";

// Controles de debugging:
// F9 / F5: Continue (continuar hasta siguiente breakpoint)
// F10: Step Over (ejecutar línea actual, no entrar en funciones)
// F11: Step Into (entrar en función)
// Shift+F11: Step Out (salir de función actual)
// F8: Evaluate Expression (evaluar expresión)
?&gt;</code></pre></div>

        <h3>var_dump() Mejorado con Xdebug</h3>
        <p>Con <code>xdebug.mode=develop</code>, var_dump() se vuelve mucho más útil:</p>
        
        <div class="code-block"><pre><code>&lt;?php
// Sin Xdebug
$usuario = [
    'id' => 123,
    'nombre' => 'Ana García',
    'email' => 'ana@example.com',
    'roles' => ['admin', 'editor'],
    'metadata' => ['created_at' => '2024-01-01', 'updated_at' => '2024-11-19']
];

var_dump($usuario);
// Salida: array(5) { ["id"]=> int(123) ["nombre"]=> ... }

// Con Xdebug (modo develop)
var_dump($usuario);
// Salida colorida, indentada, con tipos resaltados
// Muestra estructura completa de forma legible

// Funciones útiles de Xdebug
xdebug_info();  // Información de configuración de Xdebug

xdebug_var_dump($usuario);  // var_dump mejorado explícito

xdebug_debug_zval('usuario');  // Ver información interna de la variable

// Stack trace actual
xdebug_print_function_stack();

// Tiempo de ejecución
xdebug_time_index();  // Segundos desde inicio del script
?&gt;</code></pre></div>

        <h3>Profiling - Análisis de Rendimiento</h3>
        <p>El profiling te ayuda a identificar cuellos de botella:</p>
        
        <div class="code-block"><pre><code># php.ini - Configuración de profiling
xdebug.mode=profile
xdebug.output_dir=/tmp/xdebug
xdebug.profiler_output_name=cachegrind.out.%p
xdebug.start_with_request=trigger

# Activar profiling
http://localhost/script.php?XDEBUG_PROFILE=1

# O con cookie
# Cookie: XDEBUG_PROFILE=1

# Esto genera un archivo: /tmp/xdebug/cachegrind.out.12345

# Analizar con herramientas:
# 1. KCacheGrind (Linux)
kcachegrind /tmp/xdebug/cachegrind.out.12345

# 2. QCacheGrind (Mac/Windows)
qcachegrind /tmp/xdebug/cachegrind.out.12345

# 3. Webgrind (Web-based)
# https://github.com/jokkedk/webgrind

# 4. PhpStorm (integrado)
# Tools → Analyze Xdebug Profiler Snapshot
</code></pre></div>

        <div class="code-block"><pre><code>&lt;?php
// Ejemplo de código a perfilar

function operacionLenta() {
    sleep(1);  // Simulación
    return array_map(fn($i) => $i * 2, range(1, 10000));
}

function operacionRapida() {
    return range(1, 100);
}

function procesarDatos() {
    $inicio = microtime(true);
    
    // Esto aparecerá en el profiler
    $datos1 = operacionLenta();  // Cuello de botella
    $datos2 = operacionRapida();
    
    $tiempo = microtime(true) - $inicio;
    echo "Tiempo: {$tiempo}s\\n";
}

// Activar profiling con XDEBUG_PROFILE=1
procesarDatos();

// El profiler mostrará:
// - Tiempo de cada función
// - Número de llamadas
// - Memoria utilizada
// - Árbol de llamadas
?&gt;</code></pre></div>

        <h3>Code Coverage para Tests</h3>
        <div class="code-block"><pre><code>&lt;?php
// Xdebug proporciona cobertura de código para PHPUnit

// phpunit.xml
&lt;phpunit&gt;
    &lt;coverage&gt;
        &lt;include&gt;
            &lt;directory suffix=".php"&gt;src&lt;/directory&gt;
        &lt;/include&gt;
        &lt;report&gt;
            &lt;html outputDirectory="coverage"/&gt;
            &lt;text outputFile="php://stdout"/&gt;
        &lt;/report&gt;
    &lt;/coverage&gt;
&lt;/phpunit&gt;

// Ejecutar tests con cobertura
phpunit --coverage-html coverage

// Xdebug 3 requiere:
// xdebug.mode=coverage

// Ver reporte en: coverage/index.html
// Muestra:
// - Líneas ejecutadas (verde)
// - Líneas no ejecutadas (rojo)
// - Porcentaje de cobertura
// - Ramas condicionales cubiertas
?&gt;</code></pre></div>

        <h3>Debugging Remoto (Docker/VM)</h3>
        <div class="code-block"><pre><code># docker-compose.yml
version: '3.8'
services:
  php:
    image: php:8.2-fpm
    volumes:
      - ./:/var/www/html
    environment:
      # Configuración de Xdebug para Docker
      XDEBUG_MODE: debug
      XDEBUG_CONFIG: >
        client_host=host.docker.internal
        client_port=9003
        start_with_request=trigger
    extra_hosts:
      # Permitir conexión al host
      - "host.docker.internal:host-gateway"

# php.ini en Docker
xdebug.mode=debug
xdebug.client_host=host.docker.internal
xdebug.client_port=9003
xdebug.start_with_request=trigger

# VS Code - launch.json para Docker
{
    "name": "Listen for Xdebug (Docker)",
    "type": "php",
    "request": "launch",
    "port": 9003,
    "pathMappings": {
        "/var/www/html": "\${workspaceFolder}"
    }
}

# Activar debugging
docker-compose exec php bash
export XDEBUG_SESSION=1
php script.php
</code></pre></div>

        <h3>Comandos Útiles de Xdebug</h3>
        <div class="code-block"><pre><code>&lt;?php
// Funciones útiles de Xdebug

// 1. Información de Xdebug
xdebug_info();  // Página HTML con toda la configuración

// 2. Stack trace
xdebug_print_function_stack('Error personalizado');

// 3. Tiempo de ejecución
$inicio = xdebug_time_index();
// ... código ...
$fin = xdebug_time_index();
echo "Tiempo: " . ($fin - $inicio) . "s\\n";

// 4. Uso de memoria
echo "Memoria: " . xdebug_memory_usage() . " bytes\\n";
echo "Pico de memoria: " . xdebug_peak_memory_usage() . " bytes\\n";

// 5. Breakpoint programático
xdebug_break();  // Pausa ejecución aquí (si debugger está activo)

// 6. Verificar si Xdebug está activo
if (function_exists('xdebug_info')) {
    echo "Xdebug está activo\\n";
}

// 7. Obtener configuración
$config = ini_get_all('xdebug');
print_r($config);
?&gt;</code></pre></div>

        <h3>Troubleshooting - Problemas Comunes</h3>
        <div class="code-block"><pre><code># 1. Xdebug no se conecta al IDE
# Verificar:
php -v  # ¿Aparece Xdebug?
php -i | grep xdebug.mode  # ¿Modo correcto?
php -i | grep xdebug.client_port  # ¿Puerto 9003?

# Verificar firewall
sudo ufw allow 9003/tcp  # Linux
# Windows: Agregar regla en Firewall

# 2. Puerto ocupado
netstat -an | grep 9003  # ¿Está en uso?
lsof -i :9003  # ¿Qué proceso lo usa?

# 3. Path mappings incorrectos
# Verificar que las rutas coincidan:
# IDE: /home/user/project
# Servidor: /var/www/html
# Configurar en launch.json o PhpStorm

# 4. Xdebug no se carga
php -m | grep xdebug  # ¿Aparece en módulos?
# Verificar ruta en php.ini
php --ini  # Ver qué php.ini se está usando

# 5. Rendimiento lento
# Desactivar Xdebug cuando no lo uses:
xdebug.mode=off
# O usar diferentes php.ini para CLI y web

# 6. Docker no conecta
# Usar host.docker.internal en lugar de localhost
# Verificar extra_hosts en docker-compose.yml
</code></pre></div>

        <div class="success-box">
            <strong>✅ Mejores Prácticas con Xdebug:</strong><br>
            • <strong>Solo en desarrollo</strong>: NUNCA en producción<br>
            • <strong>Usa trigger mode</strong>: start_with_request=trigger<br>
            • <strong>Breakpoints condicionales</strong>: Solo pausar cuando sea necesario<br>
            • <strong>Step Over vs Step Into</strong>: No entres en funciones nativas<br>
            • <strong>Profiling selectivo</strong>: Solo perfilar cuando sea necesario<br>
            • <strong>Path mappings correctos</strong>: Crucial para Docker/VM<br>
            • <strong>Extensión de navegador</strong>: Facilita activar/desactivar<br>
            • <strong>Desactiva cuando no uses</strong>: xdebug.mode=off
        </div>

        <div class="warning-box">
            <strong>⚠️ Advertencias Importantes:</strong><br>
            • <strong>Impacto en rendimiento</strong>: Xdebug hace PHP 2-3x más lento<br>
            • <strong>NO usar en producción</strong>: Riesgo de seguridad y rendimiento<br>
            • <strong>Puerto 9003</strong>: Xdebug 3 cambió de 9000 a 9003<br>
            • <strong>Firewall</strong>: Debe permitir conexiones en puerto 9003<br>
            • <strong>Path mappings</strong>: Deben coincidir exactamente<br>
            • <strong>Archivos grandes</strong>: Profiling genera archivos grandes
        </div>

        <div class="info-box">
            <strong>💡 Resumen:</strong><br>
            • <strong>Xdebug 3</strong>: Configuración simplificada con xdebug.mode<br>
            • <strong>Puerto 9003</strong>: Puerto por defecto en Xdebug 3<br>
            • <strong>Modos</strong>: debug, develop, coverage, profile, trace<br>
            • <strong>IDEs</strong>: VS Code, PhpStorm, Eclipse, NetBeans<br>
            • <strong>Trigger</strong>: XDEBUG_SESSION=1 para activar<br>
            • <strong>Profiling</strong>: Analizar con KCacheGrind/QCacheGrind<br>
            • <strong>Coverage</strong>: Integración con PHPUnit<br>
            • <strong>Docker</strong>: Usar host.docker.internal
        </div>
    `,
    
    // OOP
    ...oop,
    
    'herencia': `
        <h1>Herencia, Abstracción e Interfaces en PHP 8+</h1>
        
        <p>La <strong>herencia</strong>, <strong>abstracción</strong> e <strong>interfaces</strong> son pilares fundamentales de la OOP que permiten crear código reutilizable, extensible y mantenible.</p>

        <h3>Herencia Básica</h3>
        <p>La herencia permite que una clase (hija) herede propiedades y métodos de otra clase (padre):</p>
        
        <div class="code-block"><pre><code>&lt;?php
// Clase padre (base)
class Animal {
    protected string $nombre;
    protected int $edad;
    
    public function __construct(string $nombre, int $edad) {
        $this->nombre = $nombre;
        $this->edad = $edad;
    }
    
    public function getNombre(): string {
        return $this->nombre;
    }
    
    public function comer(): void {
        echo "{$this->nombre} está comiendo\\n";
    }
    
    public function dormir(): void {
        echo "{$this->nombre} está durmiendo\\n";
    }
}

// Clase hija (derivada)
class Perro extends Animal {
    private string $raza;
    
    public function __construct(string $nombre, int $edad, string $raza) {
        // Llamar al constructor del padre
        parent::__construct($nombre, $edad);
        $this->raza = $raza;
    }
    
    // Método propio
    public function ladrar(): void {
        echo "{$this->nombre} dice: ¡Guau guau!\\n";
    }
    
    public function getRaza(): string {
        return $this->raza;
    }
}

class Gato extends Animal {
    private bool $esCallejero;
    
    public function __construct(string $nombre, int $edad, bool $esCallejero = false) {
        parent::__construct($nombre, $edad);
        $this->esCallejero = $esCallejero;
    }
    
    public function maullar(): void {
        echo "{$this->nombre} dice: ¡Miau!\\n";
    }
}

// Uso
$perro = new Perro("Max", 3, "Labrador");
$perro->comer();      // Heredado de Animal
$perro->ladrar();     // Propio de Perro
echo $perro->getNombre();  // "Max"

$gato = new Gato("Michi", 2, true);
$gato->dormir();      // Heredado de Animal
$gato->maullar();     // Propio de Gato
?&gt;</code></pre></div>

        <h3>Sobrescritura de Métodos (Override)</h3>
        <p>Las clases hijas pueden sobrescribir métodos del padre:</p>
        
        <div class="code-block"><pre><code>&lt;?php
class Vehiculo {
    protected string $marca;
    protected int $velocidadMaxima;
    
    public function __construct(string $marca, int $velocidadMaxima) {
        $this->marca = $marca;
        $this->velocidadMaxima = $velocidadMaxima;
    }
    
    public function acelerar(): string {
        return "El vehículo acelera";
    }
    
    public function getInfo(): string {
        return "{$this->marca} - Velocidad máxima: {$this->velocidadMaxima} km/h";
    }
}

class Coche extends Vehiculo {
    private int $numeroPuertas;
    
    public function __construct(string $marca, int $velocidadMaxima, int $numeroPuertas) {
        parent::__construct($marca, $velocidadMaxima);
        $this->numeroPuertas = $numeroPuertas;
    }
    
    // Sobrescribir método del padre
    public function acelerar(): string {
        return "El coche {$this->marca} acelera rápidamente";
    }
    
    // Sobrescribir y extender
    public function getInfo(): string {
        // Llamar al método del padre
        $infoBase = parent::getInfo();
        return "{$infoBase}, Puertas: {$this->numeroPuertas}";
    }
}

class Moto extends Vehiculo {
    private string $tipo;
    
    public function __construct(string $marca, int $velocidadMaxima, string $tipo) {
        parent::__construct($marca, $velocidadMaxima);
        $this->tipo = $tipo;
    }
    
    public function acelerar(): string {
        return "La moto {$this->marca} acelera con agilidad";
    }
    
    public function hacerCaballito(): string {
        return "¡Haciendo caballito!";
    }
}

// Uso
$coche = new Coche("Toyota", 180, 4);
echo $coche->acelerar();  // "El coche Toyota acelera rápidamente"
echo $coche->getInfo();   // "Toyota - Velocidad máxima: 180 km/h, Puertas: 4"

$moto = new Moto("Yamaha", 220, "Deportiva");
echo $moto->acelerar();   // "La moto Yamaha acelera con agilidad"
?&gt;</code></pre></div>

        <h3>Clases Abstractas</h3>
        <p>Las clases abstractas no se pueden instanciar directamente y pueden contener métodos abstractos (sin implementación):</p>
        
        <div class="code-block"><pre><code>&lt;?php
// Clase abstracta
abstract class Forma {
    protected string $color;
    
    public function __construct(string $color) {
        $this->color = $color;
    }
    
    // Método abstracto (sin implementación)
    abstract public function calcularArea(): float;
    abstract public function calcularPerimetro(): float;
    
    // Método concreto (con implementación)
    public function getColor(): string {
        return $this->color;
    }
    
    public function describir(): string {
        return "Forma de color {$this->color} con área " . $this->calcularArea();
    }
}

class Rectangulo extends Forma {
    private float $ancho;
    private float $alto;
    
    public function __construct(string $color, float $ancho, float $alto) {
        parent::__construct($color);
        $this->ancho = $ancho;
        $this->alto = $alto;
    }
    
    // Implementar métodos abstractos (obligatorio)
    public function calcularArea(): float {
        return $this->ancho * $this->alto;
    }
    
    public function calcularPerimetro(): float {
        return 2 * ($this->ancho + $this->alto);
    }
}

class Circulo extends Forma {
    private float $radio;
    
    public function __construct(string $color, float $radio) {
        parent::__construct($color);
        $this->radio = $radio;
    }
    
    public function calcularArea(): float {
        return pi() * pow($this->radio, 2);
    }
    
    public function calcularPerimetro(): float {
        return 2 * pi() * $this->radio;
    }
}

// Uso
// $forma = new Forma("rojo");  // ❌ Error: no se puede instanciar clase abstracta

$rectangulo = new Rectangulo("azul", 10, 5);
echo $rectangulo->calcularArea();  // 50
echo $rectangulo->describir();     // "Forma de color azul con área 50"

$circulo = new Circulo("rojo", 7);
echo $circulo->calcularArea();     // 153.94
echo $circulo->calcularPerimetro();  // 43.98
?&gt;</code></pre></div>

        <h3>Interfaces</h3>
        <p>Las interfaces definen un contrato que las clases deben cumplir. Solo contienen declaraciones de métodos públicos:</p>
        
        <div class="code-block"><pre><code>&lt;?php
// Definir interface
interface Autenticable {
    public function autenticar(string $password): bool;
    public function cerrarSesion(): void;
    public function estaAutenticado(): bool;
}

interface Notificable {
    public function enviarNotificacion(string $mensaje): void;
    public function getEmailNotificacion(): string;
}

// Implementar una interface
class Usuario implements Autenticable {
    private string $email;
    private string $passwordHash;
    private bool $autenticado = false;
    
    public function __construct(string $email, string $password) {
        $this->email = $email;
        $this->passwordHash = password_hash($password, PASSWORD_ARGON2ID);
    }
    
    // Implementar todos los métodos de la interface (obligatorio)
    public function autenticar(string $password): bool {
        if (password_verify($password, $this->passwordHash)) {
            $this->autenticado = true;
            return true;
        }
        return false;
    }
    
    public function cerrarSesion(): void {
        $this->autenticado = false;
    }
    
    public function estaAutenticado(): bool {
        return $this->autenticado;
    }
}

// Implementar múltiples interfaces
class Admin implements Autenticable, Notificable {
    private string $email;
    private string $passwordHash;
    private bool $autenticado = false;
    
    public function __construct(string $email, string $password) {
        $this->email = $email;
        $this->passwordHash = password_hash($password, PASSWORD_ARGON2ID);
    }
    
    // Métodos de Autenticable
    public function autenticar(string $password): bool {
        if (password_verify($password, $this->passwordHash)) {
            $this->autenticado = true;
            $this->enviarNotificacion("Inicio de sesión exitoso");
            return true;
        }
        return false;
    }
    
    public function cerrarSesion(): void {
        $this->autenticado = false;
        $this->enviarNotificacion("Sesión cerrada");
    }
    
    public function estaAutenticado(): bool {
        return $this->autenticado;
    }
    
    // Métodos de Notificable
    public function enviarNotificacion(string $mensaje): void {
        echo "Notificación a {$this->email}: {$mensaje}\\n";
    }
    
    public function getEmailNotificacion(): string {
        return $this->email;
    }
}

// Uso
$usuario = new Usuario("juan@example.com", "secreto123");
$usuario->autenticar("secreto123");  // true
echo $usuario->estaAutenticado();    // true

$admin = new Admin("admin@example.com", "admin123");
$admin->autenticar("admin123");
// Output: "Notificación a admin@example.com: Inicio de sesión exitoso"
?&gt;</code></pre></div>

        <h3>Interfaces con Constantes y Herencia</h3>
        <div class="code-block"><pre><code>&lt;?php
// Interface con constantes
interface Pagable {
    public const IVA = 0.16;
    public const DESCUENTO_MAYORISTA = 0.10;
    
    public function calcularTotal(): float;
    public function aplicarDescuento(float $porcentaje): void;
}

// Interface puede extender otra interface
interface PagableConFactura extends Pagable {
    public function generarFactura(): string;
    public function getNumeroFactura(): string;
}

class Producto implements PagableConFactura {
    private float $precio;
    private float $descuento = 0;
    private string $numeroFactura;
    
    public function __construct(float $precio) {
        $this->precio = $precio;
        $this->numeroFactura = 'FAC-' . uniqid();
    }
    
    public function calcularTotal(): float {
        $subtotal = $this->precio * (1 - $this->descuento);
        return $subtotal * (1 + self::IVA);
    }
    
    public function aplicarDescuento(float $porcentaje): void {
        $this->descuento = $porcentaje;
    }
    
    public function generarFactura(): string {
        return "Factura {$this->numeroFactura}: Total \${$this->calcularTotal()}";
    }
    
    public function getNumeroFactura(): string {
        return $this->numeroFactura;
    }
}

$producto = new Producto(1000);
$producto->aplicarDescuento(Pagable::DESCUENTO_MAYORISTA);
echo $producto->calcularTotal();  // 1044 (1000 - 10% + 16% IVA)
echo $producto->generarFactura();
?&gt;</code></pre></div>

        <h3>Type Hinting con Interfaces</h3>
        <p>Las interfaces permiten polimorfismo mediante type hinting:</p>
        
        <div class="code-block"><pre><code>&lt;?php
interface Exportable {
    public function exportar(): string;
}

class ReporteJSON implements Exportable {
    private array $datos;
    
    public function __construct(array $datos) {
        $this->datos = $datos;
    }
    
    public function exportar(): string {
        return json_encode($this->datos, JSON_PRETTY_PRINT);
    }
}

class ReporteCSV implements Exportable {
    private array $datos;
    
    public function __construct(array $datos) {
        $this->datos = $datos;
    }
    
    public function exportar(): string {
        $csv = '';
        foreach ($this->datos as $fila) {
            $csv .= implode(',', $fila) . "\\n";
        }
        return $csv;
    }
}

class ReporteXML implements Exportable {
    private array $datos;
    
    public function __construct(array $datos) {
        $this->datos = $datos;
    }
    
    public function exportar(): string {
        $xml = "&lt;datos&gt;\\n";
        foreach ($this->datos as $key => $value) {
            $xml .= "  &lt;item&gt;{$value}&lt;/item&gt;\\n";
        }
        $xml .= "&lt;/datos&gt;";
        return $xml;
    }
}

// Función que acepta cualquier clase que implemente Exportable
function guardarReporte(Exportable $reporte, string $archivo): void {
    $contenido = $reporte->exportar();
    file_put_contents($archivo, $contenido);
    echo "Reporte guardado en {$archivo}\\n";
}

// Uso - Polimorfismo
$datos = ['nombre' => 'Juan', 'edad' => 30, 'ciudad' => 'Madrid'];

$reporteJSON = new ReporteJSON($datos);
guardarReporte($reporteJSON, 'reporte.json');

$reporteCSV = new ReporteCSV([['Juan', 30, 'Madrid']]);
guardarReporte($reporteCSV, 'reporte.csv');

$reporteXML = new ReporteXML($datos);
guardarReporte($reporteXML, 'reporte.xml');

// Todos funcionan porque implementan la misma interface
?&gt;</code></pre></div>

        <h3>Diferencias: Clase Abstracta vs Interface</h3>
        <div class="code-block"><pre><code>&lt;?php
// CLASE ABSTRACTA:
// - Puede tener propiedades
// - Puede tener métodos concretos (con implementación)
// - Puede tener métodos abstractos (sin implementación)
// - Una clase solo puede extender una clase abstracta (herencia simple)
// - Usa 'extends'

abstract class Empleado {
    protected string $nombre;  // ✅ Propiedad
    protected float $salario;
    
    public function __construct(string $nombre, float $salario) {
        $this->nombre = $nombre;
        $this->salario = $salario;
    }
    
    // ✅ Método concreto
    public function getNombre(): string {
        return $this->nombre;
    }
    
    // ✅ Método abstracto
    abstract public function calcularSalarioNeto(): float;
}

// INTERFACE:
// - NO puede tener propiedades (solo constantes)
// - Solo declaraciones de métodos públicos
// - Una clase puede implementar múltiples interfaces
// - Usa 'implements'

interface Trabajador {
    // const SALARIO_MINIMO = 1000;  // ✅ Constante OK
    // private $nombre;  // ❌ Error: no puede tener propiedades
    
    public function trabajar(): void;
    public function tomarDescanso(): void;
}

interface Evaluable {
    public function evaluar(): float;
    public function getCalificacion(): string;
}

// Clase que extiende abstracta e implementa interfaces
class Desarrollador extends Empleado implements Trabajador, Evaluable {
    private string $lenguaje;
    private float $calificacion = 0;
    
    public function __construct(string $nombre, float $salario, string $lenguaje) {
        parent::__construct($nombre, $salario);
        $this->lenguaje = $lenguaje;
    }
    
    // Implementar método abstracto de Empleado
    public function calcularSalarioNeto(): float {
        return $this->salario * 0.85;  // Después de impuestos
    }
    
    // Implementar métodos de Trabajador
    public function trabajar(): void {
        echo "{$this->nombre} está programando en {$this->lenguaje}\\n";
    }
    
    public function tomarDescanso(): void {
        echo "{$this->nombre} está tomando un descanso\\n";
    }
    
    // Implementar métodos de Evaluable
    public function evaluar(): float {
        $this->calificacion = rand(70, 100) / 10;
        return $this->calificacion;
    }
    
    public function getCalificacion(): string {
        return match(true) {
            $this->calificacion >= 9 => 'Excelente',
            $this->calificacion >= 7 => 'Bueno',
            $this->calificacion >= 5 => 'Regular',
            default => 'Necesita mejorar'
        };
    }
}

$dev = new Desarrollador("Ana", 50000, "PHP");
$dev->trabajar();
echo $dev->calcularSalarioNeto();  // 42500
echo $dev->getCalificacion();
?&gt;</code></pre></div>

        <h3>Ejemplo Completo: Sistema de Pagos</h3>
        <div class="code-block"><pre><code>&lt;?php
// Interface para métodos de pago
interface MetodoPago {
    public function procesarPago(float $monto): bool;
    public function reembolsar(float $monto): bool;
    public function getNombre(): string;
}

// Clase abstracta base
abstract class PagoElectronico implements MetodoPago {
    protected string $numeroTransaccion;
    protected float $comision;
    
    public function __construct(float $comision = 0.03) {
        $this->comision = $comision;
        $this->numeroTransaccion = 'TXN-' . uniqid();
    }
    
    public function getNumeroTransaccion(): string {
        return $this->numeroTransaccion;
    }
    
    protected function calcularComision(float $monto): float {
        return $monto * $this->comision;
    }
    
    // Método abstracto que las clases hijas deben implementar
    abstract protected function validarPago(float $monto): bool;
}

class PagoTarjeta extends PagoElectronico {
    private string $numeroTarjeta;
    private string $titular;
    
    public function __construct(string $numeroTarjeta, string $titular) {
        parent::__construct(0.025);  // 2.5% comisión
        $this->numeroTarjeta = $numeroTarjeta;
        $this->titular = $titular;
    }
    
    protected function validarPago(float $monto): bool {
        // Validar tarjeta, fondos, etc.
        return strlen($this->numeroTarjeta) === 16 && $monto > 0;
    }
    
    public function procesarPago(float $monto): bool {
        if (!$this->validarPago($monto)) {
            return false;
        }
        
        $comision = $this->calcularComision($monto);
        $total = $monto + $comision;
        
        echo "Procesando pago con tarjeta: \${$total}\\n";
        echo "Comisión: \${$comision}\\n";
        return true;
    }
    
    public function reembolsar(float $monto): bool {
        echo "Reembolsando \${$monto} a tarjeta {$this->numeroTarjeta}\\n";
        return true;
    }
    
    public function getNombre(): string {
        return "Tarjeta de crédito";
    }
}

class PagoPayPal extends PagoElectronico {
    private string $email;
    
    public function __construct(string $email) {
        parent::__construct(0.035);  // 3.5% comisión
        $this->email = $email;
    }
    
    protected function validarPago(float $monto): bool {
        return filter_var($this->email, FILTER_VALIDATE_EMAIL) && $monto > 0;
    }
    
    public function procesarPago(float $monto): bool {
        if (!$this->validarPago($monto)) {
            return false;
        }
        
        $comision = $this->calcularComision($monto);
        $total = $monto + $comision;
        
        echo "Procesando pago con PayPal: \${$total}\\n";
        echo "Email: {$this->email}\\n";
        return true;
    }
    
    public function reembolsar(float $monto): bool {
        echo "Reembolsando \${$monto} a PayPal {$this->email}\\n";
        return true;
    }
    
    public function getNombre(): string {
        return "PayPal";
    }
}

class PagoEfectivo implements MetodoPago {
    private float $montoPagado;
    
    public function procesarPago(float $monto): bool {
        echo "Pago en efectivo: \${$monto}\\n";
        $this->montoPagado = $monto;
        return true;
    }
    
    public function reembolsar(float $monto): bool {
        echo "Reembolso en efectivo: \${$monto}\\n";
        return true;
    }
    
    public function getNombre(): string {
        return "Efectivo";
    }
    
    public function calcularCambio(float $montoPagado): float {
        return $montoPagado - $this->montoPagado;
    }
}

// Procesador de pagos que acepta cualquier método
class ProcesadorPagos {
    public function procesar(MetodoPago $metodo, float $monto): bool {
        echo "Procesando con: {$metodo->getNombre()}\\n";
        return $metodo->procesarPago($monto);
    }
}

// Uso - Polimorfismo en acción
$procesador = new ProcesadorPagos();

$tarjeta = new PagoTarjeta("1234567890123456", "Juan Pérez");
$procesador->procesar($tarjeta, 100);

$paypal = new PagoPayPal("juan@example.com");
$procesador->procesar($paypal, 200);

$efectivo = new PagoEfectivo();
$procesador->procesar($efectivo, 50);
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Mejores Prácticas:</strong><br>
            • <strong>Herencia</strong>: Usa cuando hay relación "es un" (Perro ES UN Animal)<br>
            • <strong>Interfaces</strong>: Usa cuando hay relación "puede hacer" (Usuario PUEDE autenticarse)<br>
            • <strong>Clases abstractas</strong>: Usa para compartir código entre clases relacionadas<br>
            • <strong>Múltiples interfaces</strong>: Una clase puede implementar varias interfaces<br>
            • <strong>parent::</strong>: Llama a métodos del padre en sobrescritura<br>
            • <strong>Type hinting</strong>: Usa interfaces para polimorfismo<br>
            • <strong>Favor composición sobre herencia</strong>: No abuses de la herencia profunda
        </div>

        <div class="warning-box">
            <strong>⚠️ Errores Comunes:</strong><br>
            • NO crear jerarquías de herencia muy profundas (max 3-4 niveles)<br>
            • NO usar herencia solo para reutilizar código (usa composición)<br>
            • NO olvidar implementar TODOS los métodos de una interface<br>
            • NO instanciar clases abstractas directamente<br>
            • NO confundir <code>extends</code> (herencia) con <code>implements</code> (interface)<br>
            • SIEMPRE llamar a <code>parent::__construct()</code> si el padre tiene constructor
        </div>

        <div class="info-box">
            <strong>💡 Resumen:</strong><br>
            • <strong>Herencia</strong>: <code>extends</code> - Una clase hereda de otra<br>
            • <strong>Clase abstracta</strong>: <code>abstract class</code> - No se puede instanciar<br>
            • <strong>Método abstracto</strong>: <code>abstract function</code> - Sin implementación<br>
            • <strong>Interface</strong>: <code>interface</code> - Contrato de métodos públicos<br>
            • <strong>Implementar</strong>: <code>implements</code> - Cumplir contrato de interface<br>
            • <strong>parent::</strong>: Acceder a métodos/propiedades del padre<br>
            • <strong>Polimorfismo</strong>: Diferentes clases, misma interface
        </div>
    `,
    'traits': `
        <h1>Traits y Clases Anónimas en PHP 8+</h1>
        
        <p>Los <strong>Traits</strong> permiten reutilizar código en múltiples clases sin usar herencia. Las <strong>Clases Anónimas</strong> son útiles para objetos de un solo uso.</p>

        <h3>¿Qué son los Traits?</h3>
        <p>Los Traits son mecanismos de reutilización de código que permiten incluir métodos en múltiples clases. Resuelven el problema de la herencia simple en PHP.</p>
        
        <div class="info-box">
            <strong>💡 Cuándo usar Traits:</strong><br>
            • Cuando necesitas compartir funcionalidad entre clases no relacionadas<br>
            • Para evitar duplicación de código sin usar herencia<br>
            • Cuando una clase necesita comportamientos de múltiples fuentes<br>
            • Para implementar "mixins" o composición horizontal
        </div>

        <h3>Trait Básico</h3>
        <div class="code-block"><pre><code>&lt;?php
// Definir un trait
trait Timestamps {
    private DateTime $createdAt;
    private DateTime $updatedAt;
    
    public function initTimestamps(): void {
        $this->createdAt = new DateTime();
        $this->updatedAt = new DateTime();
    }
    
    public function touch(): void {
        $this->updatedAt = new DateTime();
    }
    
    public function getCreatedAt(): DateTime {
        return $this->createdAt;
    }
    
    public function getUpdatedAt(): DateTime {
        return $this->updatedAt;
    }
}

// Usar el trait
class Post {
    use Timestamps;
    
    public function __construct(
        private string $titulo,
        private string $contenido
    ) {
        $this->initTimestamps();
    }
    
    public function getTitulo(): string {
        return $this->titulo;
    }
}

class Usuario {
    use Timestamps;
    
    public function __construct(
        private string $nombre,
        private string $email
    ) {
        $this->initTimestamps();
    }
}

// Uso
$post = new Post("Mi primer post", "Contenido...");
echo $post->getCreatedAt()->format('Y-m-d H:i:s');

$post->touch();  // Actualizar timestamp
echo $post->getUpdatedAt()->format('Y-m-d H:i:s');
?&gt;</code></pre></div>

        <h3>Múltiples Traits</h3>
        <p>Una clase puede usar múltiples traits:</p>
        
        <div class="code-block"><pre><code>&lt;?php
trait Loggable {
    private array $logs = [];
    
    public function log(string $mensaje): void {
        $this->logs[] = [
            'timestamp' => new DateTime(),
            'mensaje' => $mensaje
        ];
    }
    
    public function getLogs(): array {
        return $this->logs;
    }
}

trait Cacheable {
    private array $cache = [];
    
    public function setCache(string $key, mixed $value): void {
        $this->cache[$key] = $value;
    }
    
    public function getCache(string $key): mixed {
        return $this->cache[$key] ?? null;
    }
    
    public function hasCache(string $key): bool {
        return isset($this->cache[$key]);
    }
    
    public function clearCache(): void {
        $this->cache = [];
    }
}

trait Validable {
    private array $errores = [];
    
    public function addError(string $campo, string $mensaje): void {
        $this->errores[$campo][] = $mensaje;
    }
    
    public function getErrors(): array {
        return $this->errores;
    }
    
    public function hasErrors(): bool {
        return !empty($this->errores);
    }
    
    public function isValid(): bool {
        return empty($this->errores);
    }
}

// Usar múltiples traits
class Producto {
    use Loggable, Cacheable, Validable;
    
    public function __construct(
        private string $nombre,
        private float $precio
    ) {
        $this->log("Producto creado: {$nombre}");
    }
    
    public function setPrecio(float $precio): void {
        if ($precio < 0) {
            $this->addError('precio', 'El precio no puede ser negativo');
            return;
        }
        
        $this->precio = $precio;
        $this->clearCache();  // Limpiar cache al cambiar precio
        $this->log("Precio actualizado a {$precio}");
    }
    
    public function getPrecioConDescuento(float $descuento): float {
        $cacheKey = "precio_descuento_{$descuento}";
        
        if ($this->hasCache($cacheKey)) {
            return $this->getCache($cacheKey);
        }
        
        $precioFinal = $this->precio * (1 - $descuento);
        $this->setCache($cacheKey, $precioFinal);
        
        return $precioFinal;
    }
}

// Uso
$producto = new Producto("Laptop", 1000);
$producto->setPrecio(-100);  // Error

if ($producto->hasErrors()) {
    print_r($producto->getErrors());
}

echo $producto->getPrecioConDescuento(0.1);  // 900 (calculado)
echo $producto->getPrecioConDescuento(0.1);  // 900 (desde cache)

print_r($producto->getLogs());
?&gt;</code></pre></div>

        <h3>Resolución de Conflictos</h3>
        <p>Cuando dos traits tienen métodos con el mismo nombre, debes resolver el conflicto:</p>
        
        <div class="code-block"><pre><code>&lt;?php
trait Logger {
    public function log(string $mensaje): void {
        echo "[LOG] {$mensaje}\\n";
    }
    
    public function info(string $mensaje): void {
        echo "[INFO] {$mensaje}\\n";
    }
}

trait FileLogger {
    public function log(string $mensaje): void {
        file_put_contents('app.log', "[FILE] {$mensaje}\\n", FILE_APPEND);
    }
    
    public function debug(string $mensaje): void {
        file_put_contents('debug.log', "[DEBUG] {$mensaje}\\n", FILE_APPEND);
    }
}

class Aplicacion {
    // Usar ambos traits
    use Logger, FileLogger {
        // Resolver conflicto: usar log() de FileLogger
        FileLogger::log insteadof Logger;
        
        // Crear alias para log() de Logger
        Logger::log as consoleLog;
        
        // Cambiar visibilidad de debug
        FileLogger::debug as private;
    }
    
    public function ejecutar(): void {
        $this->log("Guardado en archivo");      // FileLogger::log
        $this->consoleLog("Mostrado en consola");  // Logger::log (alias)
        $this->info("Información");             // Logger::info
        // $this->debug("Debug");  // ❌ Error: es privado ahora
    }
}

$app = new Aplicacion();
$app->ejecutar();
?&gt;</code></pre></div>

        <h3>Traits con Propiedades y Métodos Abstractos</h3>
        <div class="code-block"><pre><code>&lt;?php
trait Serializable {
    // Método abstracto que la clase debe implementar
    abstract protected function getData(): array;
    
    public function toJSON(): string {
        return json_encode($this->getData(), JSON_PRETTY_PRINT);
    }
    
    public function toArray(): array {
        return $this->getData();
    }
    
    public function toXML(): string {
        $data = $this->getData();
        $xml = "&lt;?xml version=\\"1.0\\"?&gt;\\n&lt;root&gt;\\n";
        
        foreach ($data as $key => $value) {
            $xml .= "  &lt;{$key}&gt;{$value}&lt;/{$key}&gt;\\n";
        }
        
        $xml .= "&lt;/root&gt;";
        return $xml;
    }
}

class Usuario {
    use Serializable;
    
    public function __construct(
        private int $id,
        private string $nombre,
        private string $email
    ) {}
    
    // Implementar método abstracto del trait
    protected function getData(): array {
        return [
            'id' => $this->id,
            'nombre' => $this->nombre,
            'email' => $this->email
        ];
    }
}

class Producto {
    use Serializable;
    
    public function __construct(
        private string $nombre,
        private float $precio,
        private int $stock
    ) {}
    
    protected function getData(): array {
        return [
            'nombre' => $this->nombre,
            'precio' => $this->precio,
            'stock' => $this->stock
        ];
    }
}

// Uso
$usuario = new Usuario(1, "Juan", "juan@example.com");
echo $usuario->toJSON();
echo $usuario->toXML();

$producto = new Producto("Laptop", 999.99, 10);
print_r($producto->toArray());
?&gt;</code></pre></div>

        <h3>Traits que Usan Otros Traits</h3>
        <div class="code-block"><pre><code>&lt;?php
trait HasId {
    private int $id;
    
    public function getId(): int {
        return $this->id;
    }
    
    public function setId(int $id): void {
        $this->id = $id;
    }
}

trait HasTimestamps {
    private DateTime $createdAt;
    private DateTime $updatedAt;
    
    public function initTimestamps(): void {
        $this->createdAt = new DateTime();
        $this->updatedAt = new DateTime();
    }
    
    public function touch(): void {
        $this->updatedAt = new DateTime();
    }
}

// Trait que usa otros traits
trait ActiveRecord {
    use HasId, HasTimestamps;
    
    public function save(): bool {
        if (!isset($this->id)) {
            $this->initTimestamps();
        } else {
            $this->touch();
        }
        
        // Lógica de guardado en BD
        echo "Guardando registro con ID: {$this->getId()}\\n";
        return true;
    }
    
    public function delete(): bool {
        echo "Eliminando registro con ID: {$this->getId()}\\n";
        return true;
    }
}

class Post {
    use ActiveRecord;
    
    public function __construct(
        private string $titulo,
        private string $contenido
    ) {}
}

// Uso
$post = new Post("Título", "Contenido");
$post->setId(1);
$post->save();
?&gt;</code></pre></div>

        <h3>Clases Anónimas</h3>
        <p>Las clases anónimas son útiles para crear objetos simples sin definir una clase con nombre:</p>
        
        <div class="code-block"><pre><code>&lt;?php
// Clase anónima básica
$logger = new class {
    public function log(string $mensaje): void {
        echo "[" . date('Y-m-d H:i:s') . "] {$mensaje}\\n";
    }
};

$logger->log("Mensaje de prueba");

// Clase anónima con constructor
$punto = new class(10, 20) {
    public function __construct(
        private int $x,
        private int $y
    ) {}
    
    public function getX(): int {
        return $this->x;
    }
    
    public function getY(): int {
        return $this->y;
    }
    
    public function distancia(): float {
        return sqrt($this->x ** 2 + $this->y ** 2);
    }
};

echo $punto->distancia();  // 22.36
?&gt;</code></pre></div>

        <h3>Clases Anónimas con Interfaces y Traits</h3>
        <div class="code-block"><pre><code>&lt;?php
interface Notificador {
    public function enviar(string $mensaje): void;
}

trait Loggable {
    public function log(string $mensaje): void {
        echo "[LOG] {$mensaje}\\n";
    }
}

// Clase anónima que implementa interface y usa trait
$emailNotificador = new class implements Notificador {
    use Loggable;
    
    public function enviar(string $mensaje): void {
        $this->log("Enviando email: {$mensaje}");
        // Lógica de envío de email
        echo "Email enviado\\n";
    }
};

$smsNotificador = new class implements Notificador {
    use Loggable;
    
    public function enviar(string $mensaje): void {
        $this->log("Enviando SMS: {$mensaje}");
        // Lógica de envío de SMS
        echo "SMS enviado\\n";
    }
};

// Función que acepta cualquier Notificador
function notificar(Notificador $notificador, string $mensaje): void {
    $notificador->enviar($mensaje);
}

notificar($emailNotificador, "Hola por email");
notificar($smsNotificador, "Hola por SMS");
?&gt;</code></pre></div>

        <h3>Clases Anónimas para Testing/Mocking</h3>
        <div class="code-block"><pre><code>&lt;?php
interface RepositorioUsuarios {
    public function encontrar(int $id): ?array;
    public function guardar(array $datos): bool;
}

class ServicioUsuarios {
    public function __construct(
        private RepositorioUsuarios $repositorio
    ) {}
    
    public function obtenerUsuario(int $id): ?array {
        return $this->repositorio->encontrar($id);
    }
}

// Mock con clase anónima para testing
$mockRepositorio = new class implements RepositorioUsuarios {
    private array $usuarios = [
        1 => ['id' => 1, 'nombre' => 'Juan', 'email' => 'juan@example.com'],
        2 => ['id' => 2, 'nombre' => 'Ana', 'email' => 'ana@example.com']
    ];
    
    public function encontrar(int $id): ?array {
        return $this->usuarios[$id] ?? null;
    }
    
    public function guardar(array $datos): bool {
        $this->usuarios[$datos['id']] = $datos;
        return true;
    }
};

// Usar el mock
$servicio = new ServicioUsuarios($mockRepositorio);
$usuario = $servicio->obtenerUsuario(1);
print_r($usuario);
?&gt;</code></pre></div>

        <h3>Clases Anónimas como Callbacks</h3>
        <div class="code-block"><pre><code>&lt;?php
interface Estrategia {
    public function ejecutar(array $datos): mixed;
}

class Procesador {
    public function procesar(array $datos, Estrategia $estrategia): mixed {
        echo "Procesando datos...\\n";
        return $estrategia->ejecutar($datos);
    }
}

$procesador = new Procesador();

// Estrategia 1: Sumar
$resultado1 = $procesador->procesar(
    [1, 2, 3, 4, 5],
    new class implements Estrategia {
        public function ejecutar(array $datos): mixed {
            return array_sum($datos);
        }
    }
);
echo "Suma: {$resultado1}\\n";  // 15

// Estrategia 2: Multiplicar
$resultado2 = $procesador->procesar(
    [2, 3, 4],
    new class implements Estrategia {
        public function ejecutar(array $datos): mixed {
            return array_product($datos);
        }
    }
);
echo "Producto: {$resultado2}\\n";  // 24

// Estrategia 3: Filtrar pares
$resultado3 = $procesador->procesar(
    [1, 2, 3, 4, 5, 6],
    new class implements Estrategia {
        public function ejecutar(array $datos): mixed {
            return array_filter($datos, fn($n) => $n % 2 === 0);
        }
    }
);
print_r($resultado3);  // [2, 4, 6]
?&gt;</code></pre></div>

        <h3>Ejemplo Completo: Sistema de Plugins</h3>
        <div class="code-block"><pre><code>&lt;?php
trait PluginBase {
    private string $nombre;
    private string $version;
    private bool $activo = false;
    
    public function getNombre(): string {
        return $this->nombre;
    }
    
    public function getVersion(): string {
        return $this->version;
    }
    
    public function activar(): void {
        $this->activo = true;
        echo "Plugin {$this->nombre} activado\\n";
    }
    
    public function desactivar(): void {
        $this->activo = false;
        echo "Plugin {$this->nombre} desactivado\\n";
    }
    
    public function estaActivo(): bool {
        return $this->activo;
    }
}

interface Plugin {
    public function instalar(): void;
    public function desinstalar(): void;
    public function ejecutar(): void;
}

class GestorPlugins {
    private array $plugins = [];
    
    public function registrar(string $nombre, Plugin $plugin): void {
        $this->plugins[$nombre] = $plugin;
        echo "Plugin '{$nombre}' registrado\\n";
    }
    
    public function ejecutarTodos(): void {
        foreach ($this->plugins as $nombre => $plugin) {
            echo "Ejecutando plugin: {$nombre}\\n";
            $plugin->ejecutar();
        }
    }
}

$gestor = new GestorPlugins();

// Plugin 1: Cache (clase anónima)
$gestor->registrar('cache', new class implements Plugin {
    use PluginBase;
    
    public function __construct() {
        $this->nombre = 'Cache Manager';
        $this->version = '1.0.0';
    }
    
    public function instalar(): void {
        echo "Instalando sistema de cache...\\n";
    }
    
    public function desinstalar(): void {
        echo "Desinstalando sistema de cache...\\n";
    }
    
    public function ejecutar(): void {
        if ($this->estaActivo()) {
            echo "Limpiando cache...\\n";
        }
    }
});

// Plugin 2: Analytics (clase anónima)
$gestor->registrar('analytics', new class implements Plugin {
    use PluginBase;
    
    public function __construct() {
        $this->nombre = 'Analytics Tracker';
        $this->version = '2.1.0';
    }
    
    public function instalar(): void {
        echo "Instalando analytics...\\n";
    }
    
    public function desinstalar(): void {
        echo "Desinstalando analytics...\\n";
    }
    
    public function ejecutar(): void {
        if ($this->estaActivo()) {
            echo "Enviando estadísticas...\\n";
        }
    }
});

$gestor->ejecutarTodos();
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Mejores Prácticas:</strong><br>
            • <strong>Traits</strong>: Usa para compartir funcionalidad entre clases no relacionadas<br>
            • <strong>Nombres descriptivos</strong>: Usa sufijos como "able" (Loggable, Cacheable)<br>
            • <strong>Métodos abstractos</strong>: Usa en traits para forzar implementación<br>
            • <strong>Resolución de conflictos</strong>: Siempre resuelve conflictos explícitamente<br>
            • <strong>Clases anónimas</strong>: Usa para objetos simples de un solo uso<br>
            • <strong>Testing</strong>: Las clases anónimas son perfectas para mocks<br>
            • <strong>No abuses</strong>: Los traits no reemplazan el buen diseño OOP
        </div>

        <div class="warning-box">
            <strong>⚠️ Errores Comunes:</strong><br>
            • NO usar traits como reemplazo de herencia cuando hay relación "es un"<br>
            • NO crear traits muy grandes (max 200-300 líneas)<br>
            • NO ignorar conflictos de nombres entre traits<br>
            • NO usar clases anónimas para lógica compleja<br>
            • NO abusar de traits (puede dificultar el seguimiento del código)<br>
            • SIEMPRE documentar qué hace cada trait
        </div>

        <div class="info-box">
            <strong>💡 Resumen:</strong><br>
            • <strong>Trait</strong>: <code>trait NombreTrait { }</code> - Reutilización horizontal<br>
            • <strong>Usar trait</strong>: <code>use NombreTrait;</code> - Incluir en clase<br>
            • <strong>Múltiples traits</strong>: <code>use Trait1, Trait2;</code><br>
            • <strong>Resolver conflictos</strong>: <code>insteadof</code> y <code>as</code><br>
            • <strong>Clase anónima</strong>: <code>new class { }</code> - Objeto sin nombre<br>
            • <strong>Con constructor</strong>: <code>new class($param) { }</code><br>
            • <strong>Uso ideal</strong>: Callbacks, mocks, objetos temporales
        </div>
    `,
    'encapsulamiento': `
        <h1>Encapsulamiento en PHP 8+</h1>
        
        <p>El <strong>encapsulamiento</strong> es uno de los pilares fundamentales de la OOP. Consiste en ocultar los detalles internos de una clase y exponer solo lo necesario mediante una interfaz pública controlada.</p>

        <div class="info-box">
            <strong>💡 Principios del Encapsulamiento:</strong><br>
            • <strong>Ocultar datos</strong>: Las propiedades deben ser privadas o protegidas<br>
            • <strong>Controlar acceso</strong>: Usar getters y setters para acceder a propiedades<br>
            • <strong>Validar datos</strong>: Validar en setters antes de modificar el estado<br>
            • <strong>Proteger invariantes</strong>: Mantener el objeto en un estado válido<br>
            • <strong>Exponer comportamiento</strong>: No exponer implementación interna
        </div>

        <h3>Niveles de Visibilidad</h3>
        <div class="code-block"><pre><code>&lt;?php
class Ejemplo {
    // PUBLIC: Accesible desde cualquier lugar
    public string $publico = "Visible en todas partes";
    
    // PROTECTED: Accesible en la clase y clases hijas
    protected string $protegido = "Visible en clase e hijas";
    
    // PRIVATE: Solo accesible dentro de esta clase
    private string $privado = "Solo visible aquí";
    
    public function mostrarAcceso(): void {
        echo $this->publico;     // ✅ OK
        echo $this->protegido;   // ✅ OK
        echo $this->privado;     // ✅ OK
    }
}

class Hija extends Ejemplo {
    public function mostrarAccesoHija(): void {
        echo $this->publico;     // ✅ OK
        echo $this->protegido;   // ✅ OK
        // echo $this->privado;  // ❌ Error: no accesible
    }
}

$obj = new Ejemplo();
echo $obj->publico;      // ✅ OK
// echo $obj->protegido; // ❌ Error: no accesible
// echo $obj->privado;   // ❌ Error: no accesible
?&gt;</code></pre></div>

        <h3>Encapsulamiento Básico con Getters y Setters</h3>
        <div class="code-block"><pre><code>&lt;?php
class CuentaBancaria {
    private float $saldo = 0;
    private string $titular;
    private string $numeroCuenta;
    private bool $activa = true;
    
    public function __construct(string $titular, string $numeroCuenta) {
        $this->titular = $titular;
        $this->numeroCuenta = $numeroCuenta;
    }
    
    // Getter: Solo lectura del saldo
    public function getSaldo(): float {
        return $this->saldo;
    }
    
    // NO hay setter para saldo - solo se modifica con depositar/retirar
    
    public function getTitular(): string {
        return $this->titular;
    }
    
    // Setter con validación
    public function setTitular(string $titular): void {
        if (strlen($titular) < 3) {
            throw new InvalidArgumentException(
                "El nombre del titular debe tener al menos 3 caracteres"
            );
        }
        $this->titular = $titular;
    }
    
    // Getter que oculta información sensible
    public function getNumeroCuenta(): string {
        // Mostrar solo los últimos 4 dígitos
        return "****" . substr($this->numeroCuenta, -4);
    }
    
    // Métodos de negocio que modifican el estado de forma controlada
    public function depositar(float $monto): bool {
        if (!$this->activa) {
            throw new RuntimeException("La cuenta está inactiva");
        }
        
        if ($monto <= 0) {
            throw new InvalidArgumentException("El monto debe ser positivo");
        }
        
        $this->saldo += $monto;
        return true;
    }
    
    public function retirar(float $monto): bool {
        if (!$this->activa) {
            throw new RuntimeException("La cuenta está inactiva");
        }
        
        if ($monto <= 0) {
            throw new InvalidArgumentException("El monto debe ser positivo");
        }
        
        if ($monto > $this->saldo) {
            throw new RuntimeException("Saldo insuficiente");
        }
        
        $this->saldo -= $monto;
        return true;
    }
    
    public function isActiva(): bool {
        return $this->activa;
    }
    
    public function desactivar(): void {
        $this->activa = false;
    }
}

// Uso
$cuenta = new CuentaBancaria("Juan Pérez", "1234567890");
$cuenta->depositar(1000);
echo $cuenta->getSaldo();  // 1000

$cuenta->retirar(300);
echo $cuenta->getSaldo();  // 700

echo $cuenta->getNumeroCuenta();  // "****7890"

// ❌ No se puede acceder directamente
// $cuenta->saldo = 99999;  // Error: propiedad privada
?&gt;</code></pre></div>

        <h3>Encapsulamiento con Readonly Properties (PHP 8.1+)</h3>
        <div class="code-block"><pre><code>&lt;?php
class Usuario {
    // Propiedades readonly: solo se asignan una vez
    public readonly int $id;
    public readonly string $email;
    public readonly DateTime $fechaRegistro;
    
    // Propiedades mutables
    private string $nombre;
    private string $passwordHash;
    private bool $activo = true;
    
    public function __construct(
        int $id,
        string $email,
        string $nombre,
        string $password
    ) {
        // Asignar readonly properties (solo en constructor)
        $this->id = $id;
        $this->email = $email;
        $this->fechaRegistro = new DateTime();
        
        // Asignar propiedades mutables
        $this->nombre = $nombre;
        $this->passwordHash = password_hash($password, PASSWORD_ARGON2ID);
    }
    
    // Getters para propiedades mutables
    public function getNombre(): string {
        return $this->nombre;
    }
    
    // Setter con validación
    public function setNombre(string $nombre): void {
        if (strlen($nombre) < 2) {
            throw new InvalidArgumentException("Nombre muy corto");
        }
        $this->nombre = $nombre;
    }
    
    // Método para cambiar password (encapsula la lógica)
    public function cambiarPassword(string $passwordActual, string $passwordNuevo): bool {
        if (!password_verify($passwordActual, $this->passwordHash)) {
            throw new RuntimeException("Password actual incorrecto");
        }
        
        if (strlen($passwordNuevo) < 8) {
            throw new InvalidArgumentException("Password debe tener al menos 8 caracteres");
        }
        
        $this->passwordHash = password_hash($passwordNuevo, PASSWORD_ARGON2ID);
        return true;
    }
    
    // Verificar password sin exponer el hash
    public function verificarPassword(string $password): bool {
        return password_verify($password, $this->passwordHash);
    }
    
    public function isActivo(): bool {
        return $this->activo;
    }
    
    public function activar(): void {
        $this->activo = true;
    }
    
    public function desactivar(): void {
        $this->activo = false;
    }
}

// Uso
$usuario = new Usuario(1, "juan@example.com", "Juan", "secreto123");

// Readonly properties son accesibles pero no modificables
echo $usuario->id;     // 1
echo $usuario->email;  // "juan@example.com"

// ❌ Error: no se puede modificar readonly
// $usuario->id = 999;
// $usuario->email = "otro@example.com";

// Propiedades privadas solo con getters/setters
$usuario->setNombre("Juan Pérez");
echo $usuario->getNombre();

$usuario->cambiarPassword("secreto123", "nuevoPassword456");
?&gt;</code></pre></div>

        <h3>Encapsulamiento con Constructor Property Promotion (PHP 8.0+)</h3>
        <div class="code-block"><pre><code>&lt;?php
class Producto {
    // Constructor property promotion: declara y asigna en una línea
    public function __construct(
        private string $nombre,
        private float $precio,
        private int $stock,
        private readonly string $sku,
        private bool $disponible = true
    ) {
        // Validación después de la asignación
        if ($precio < 0) {
            throw new InvalidArgumentException("El precio no puede ser negativo");
        }
        
        if ($stock < 0) {
            throw new InvalidArgumentException("El stock no puede ser negativo");
        }
    }
    
    // Getters
    public function getNombre(): string {
        return $this->nombre;
    }
    
    public function getPrecio(): float {
        return $this->precio;
    }
    
    public function getStock(): int {
        return $this->stock;
    }
    
    public function getSku(): string {
        return $this->sku;
    }
    
    // Setters con validación
    public function setNombre(string $nombre): void {
        if (strlen($nombre) < 3) {
            throw new InvalidArgumentException("Nombre muy corto");
        }
        $this->nombre = $nombre;
    }
    
    public function setPrecio(float $precio): void {
        if ($precio < 0) {
            throw new InvalidArgumentException("Precio inválido");
        }
        $this->precio = $precio;
    }
    
    // Métodos de negocio que encapsulan lógica
    public function agregarStock(int $cantidad): void {
        if ($cantidad <= 0) {
            throw new InvalidArgumentException("Cantidad debe ser positiva");
        }
        
        $this->stock += $cantidad;
        
        // Lógica adicional encapsulada
        if ($this->stock > 0 && !$this->disponible) {
            $this->disponible = true;
        }
    }
    
    public function reducirStock(int $cantidad): void {
        if ($cantidad <= 0) {
            throw new InvalidArgumentException("Cantidad debe ser positiva");
        }
        
        if ($cantidad > $this->stock) {
            throw new RuntimeException("Stock insuficiente");
        }
        
        $this->stock -= $cantidad;
        
        // Lógica adicional encapsulada
        if ($this->stock === 0) {
            $this->disponible = false;
        }
    }
    
    public function isDisponible(): bool {
        return $this->disponible && $this->stock > 0;
    }
    
    public function getPrecioConDescuento(float $porcentaje): float {
        if ($porcentaje < 0 || $porcentaje > 1) {
            throw new InvalidArgumentException("Porcentaje debe estar entre 0 y 1");
        }
        
        return $this->precio * (1 - $porcentaje);
    }
}

// Uso
$producto = new Producto("Laptop", 999.99, 10, "LAP-001");

echo $producto->getPrecio();  // 999.99
echo $producto->getStock();   // 10

$producto->reducirStock(3);
echo $producto->getStock();   // 7

echo $producto->getPrecioConDescuento(0.1);  // 899.99

// ❌ No se puede acceder directamente a propiedades privadas
// $producto->precio = 0;  // Error
?&gt;</code></pre></div>

        <h3>Encapsulamiento de Colecciones</h3>
        <div class="code-block"><pre><code>&lt;?php
class Carrito {
    private array $items = [];
    private float $descuento = 0;
    
    // Agregar item con validación
    public function agregarItem(Producto $producto, int $cantidad): void {
        if ($cantidad <= 0) {
            throw new InvalidArgumentException("Cantidad debe ser positiva");
        }
        
        if (!$producto->isDisponible()) {
            throw new RuntimeException("Producto no disponible");
        }
        
        $sku = $producto->getSku();
        
        if (isset($this->items[$sku])) {
            $this->items[$sku]['cantidad'] += $cantidad;
        } else {
            $this->items[$sku] = [
                'producto' => $producto,
                'cantidad' => $cantidad
            ];
        }
    }
    
    // Eliminar item
    public function eliminarItem(string $sku): void {
        if (!isset($this->items[$sku])) {
            throw new InvalidArgumentException("Item no encontrado");
        }
        
        unset($this->items[$sku]);
    }
    
    // Obtener items (retorna copia, no referencia)
    public function getItems(): array {
        return $this->items;
    }
    
    // Contar items
    public function contarItems(): int {
        return count($this->items);
    }
    
    // Calcular subtotal
    public function getSubtotal(): float {
        $subtotal = 0;
        
        foreach ($this->items as $item) {
            $subtotal += $item['producto']->getPrecio() * $item['cantidad'];
        }
        
        return $subtotal;
    }
    
    // Aplicar descuento con validación
    public function aplicarDescuento(float $porcentaje): void {
        if ($porcentaje < 0 || $porcentaje > 0.5) {
            throw new InvalidArgumentException("Descuento debe estar entre 0% y 50%");
        }
        
        $this->descuento = $porcentaje;
    }
    
    // Calcular total (encapsula toda la lógica)
    public function getTotal(): float {
        $subtotal = $this->getSubtotal();
        $descuento = $subtotal * $this->descuento;
        return $subtotal - $descuento;
    }
    
    // Vaciar carrito
    public function vaciar(): void {
        $this->items = [];
        $this->descuento = 0;
    }
    
    // Verificar si está vacío
    public function estaVacio(): bool {
        return empty($this->items);
    }
}

// Uso
$carrito = new Carrito();

$laptop = new Producto("Laptop", 999.99, 5, "LAP-001");
$mouse = new Producto("Mouse", 29.99, 10, "MOU-001");

$carrito->agregarItem($laptop, 1);
$carrito->agregarItem($mouse, 2);

echo $carrito->getSubtotal();  // 1059.97
echo $carrito->contarItems();  // 2

$carrito->aplicarDescuento(0.1);  // 10% descuento
echo $carrito->getTotal();  // 953.97

// ❌ No se puede modificar directamente el array interno
// $carrito->items = [];  // Error: propiedad privada
?&gt;</code></pre></div>

        <h3>Encapsulamiento con Immutability</h3>
        <div class="code-block"><pre><code>&lt;?php
// Clase inmutable: una vez creada, no se puede modificar
readonly class Dinero {
    public function __construct(
        public float $cantidad,
        public string $moneda
    ) {
        if ($cantidad < 0) {
            throw new InvalidArgumentException("Cantidad no puede ser negativa");
        }
        
        if (!in_array($moneda, ['USD', 'EUR', 'MXN'])) {
            throw new InvalidArgumentException("Moneda no válida");
        }
    }
    
    // Métodos que retornan nuevas instancias en lugar de modificar
    public function sumar(Dinero $otro): self {
        if ($this->moneda !== $otro->moneda) {
            throw new InvalidArgumentException("No se pueden sumar monedas diferentes");
        }
        
        return new self($this->cantidad + $otro->cantidad, $this->moneda);
    }
    
    public function restar(Dinero $otro): self {
        if ($this->moneda !== $otro->moneda) {
            throw new InvalidArgumentException("No se pueden restar monedas diferentes");
        }
        
        return new self($this->cantidad - $otro->cantidad, $this->moneda);
    }
    
    public function multiplicar(float $factor): self {
        return new self($this->cantidad * $factor, $this->moneda);
    }
    
    public function dividir(float $divisor): self {
        if ($divisor === 0.0) {
            throw new InvalidArgumentException("No se puede dividir por cero");
        }
        
        return new self($this->cantidad / $divisor, $this->moneda);
    }
    
    public function formato(): string {
        return number_format($this->cantidad, 2) . " {$this->moneda}";
    }
}

// Uso
$precio1 = new Dinero(100, 'USD');
$precio2 = new Dinero(50, 'USD');

$total = $precio1->sumar($precio2);
echo $total->formato();  // "150.00 USD"

$conDescuento = $total->multiplicar(0.9);  // 10% descuento
echo $conDescuento->formato();  // "135.00 USD"

// Los objetos originales no cambian (inmutables)
echo $precio1->formato();  // "100.00 USD" (sin cambios)
echo $total->formato();    // "150.00 USD" (sin cambios)
?&gt;</code></pre></div>

        <h3>Ejemplo Completo: Sistema de Pedidos</h3>
        <div class="code-block"><pre><code>&lt;?php
enum EstadoPedido: string {
    case PENDIENTE = 'pendiente';
    case PROCESANDO = 'procesando';
    case ENVIADO = 'enviado';
    case ENTREGADO = 'entregado';
    case CANCELADO = 'cancelado';
}

class Pedido {
    private array $items = [];
    private EstadoPedido $estado;
    private DateTime $fechaCreacion;
    private ?DateTime $fechaEnvio = null;
    private ?DateTime $fechaEntrega = null;
    
    public function __construct(
        private readonly int $id,
        private readonly int $clienteId,
        private string $direccionEnvio
    ) {
        $this->estado = EstadoPedido::PENDIENTE;
        $this->fechaCreacion = new DateTime();
    }
    
    // Getters para propiedades readonly
    public function getId(): int {
        return $this->id;
    }
    
    public function getClienteId(): int {
        return $this->clienteId;
    }
    
    public function getEstado(): EstadoPedido {
        return $this->estado;
    }
    
    public function getDireccionEnvio(): string {
        return $this->direccionEnvio;
    }
    
    // Setter con validación
    public function setDireccionEnvio(string $direccion): void {
        // Solo se puede cambiar si el pedido no ha sido enviado
        if ($this->estado === EstadoPedido::ENVIADO || 
            $this->estado === EstadoPedido::ENTREGADO) {
            throw new RuntimeException("No se puede cambiar la dirección de un pedido enviado");
        }
        
        if (strlen($direccion) < 10) {
            throw new InvalidArgumentException("Dirección muy corta");
        }
        
        $this->direccionEnvio = $direccion;
    }
    
    // Agregar item con validación
    public function agregarItem(Producto $producto, int $cantidad): void {
        if ($this->estado !== EstadoPedido::PENDIENTE) {
            throw new RuntimeException("Solo se pueden agregar items a pedidos pendientes");
        }
        
        if ($cantidad <= 0) {
            throw new InvalidArgumentException("Cantidad debe ser positiva");
        }
        
        $this->items[] = [
            'producto' => $producto,
            'cantidad' => $cantidad,
            'precio' => $producto->getPrecio()  // Guardar precio actual
        ];
    }
    
    // Calcular total
    public function getTotal(): float {
        $total = 0;
        foreach ($this->items as $item) {
            $total += $item['precio'] * $item['cantidad'];
        }
        return $total;
    }
    
    // Transiciones de estado encapsuladas
    public function procesar(): void {
        if ($this->estado !== EstadoPedido::PENDIENTE) {
            throw new RuntimeException("Solo se pueden procesar pedidos pendientes");
        }
        
        if (empty($this->items)) {
            throw new RuntimeException("No se puede procesar un pedido vacío");
        }
        
        $this->estado = EstadoPedido::PROCESANDO;
    }
    
    public function enviar(): void {
        if ($this->estado !== EstadoPedido::PROCESANDO) {
            throw new RuntimeException("Solo se pueden enviar pedidos en procesamiento");
        }
        
        $this->estado = EstadoPedido::ENVIADO;
        $this->fechaEnvio = new DateTime();
    }
    
    public function entregar(): void {
        if ($this->estado !== EstadoPedido::ENVIADO) {
            throw new RuntimeException("Solo se pueden entregar pedidos enviados");
        }
        
        $this->estado = EstadoPedido::ENTREGADO;
        $this->fechaEntrega = new DateTime();
    }
    
    public function cancelar(): void {
        if ($this->estado === EstadoPedido::ENTREGADO) {
            throw new RuntimeException("No se puede cancelar un pedido entregado");
        }
        
        $this->estado = EstadoPedido::CANCELADO;
    }
    
    // Verificaciones de estado
    public function puedeModificarse(): bool {
        return $this->estado === EstadoPedido::PENDIENTE;
    }
    
    public function estaCancelado(): bool {
        return $this->estado === EstadoPedido::CANCELADO;
    }
    
    public function estaEntregado(): bool {
        return $this->estado === EstadoPedido::ENTREGADO;
    }
}

// Uso
$pedido = new Pedido(1, 123, "Calle Principal 123, Madrid");

$laptop = new Producto("Laptop", 999.99, 5, "LAP-001");
$mouse = new Producto("Mouse", 29.99, 10, "MOU-001");

$pedido->agregarItem($laptop, 1);
$pedido->agregarItem($mouse, 2);

echo $pedido->getTotal();  // 1059.97

// Flujo de estados encapsulado
$pedido->procesar();
$pedido->enviar();
$pedido->entregar();

// ❌ No se puede modificar después de entregado
// $pedido->setDireccionEnvio("Nueva dirección");  // Error
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Mejores Prácticas:</strong><br>
            • <strong>Propiedades privadas</strong>: Por defecto, todas las propiedades deben ser privadas<br>
            • <strong>Getters/Setters</strong>: Controla el acceso a propiedades con métodos<br>
            • <strong>Validación</strong>: Valida siempre en setters y constructores<br>
            • <strong>Readonly</strong>: Usa <code>readonly</code> para datos inmutables (PHP 8.1+)<br>
            • <strong>Invariantes</strong>: Mantén el objeto siempre en un estado válido<br>
            • <strong>Métodos de negocio</strong>: Encapsula lógica compleja en métodos<br>
            • <strong>No expongas colecciones</strong>: Retorna copias, no referencias directas
        </div>

        <div class="warning-box">
            <strong>⚠️ Errores Comunes:</strong><br>
            • NO hacer todas las propiedades públicas<br>
            • NO crear getters/setters sin validación<br>
            • NO exponer detalles de implementación interna<br>
            • NO permitir modificar el estado sin control<br>
            • NO retornar referencias a colecciones internas<br>
            • SIEMPRE validar datos antes de asignar<br>
            • SIEMPRE mantener invariantes de clase
        </div>

        <div class="info-box">
            <strong>💡 Resumen:</strong><br>
            • <strong>Private</strong>: Solo accesible dentro de la clase<br>
            • <strong>Protected</strong>: Accesible en clase e hijas<br>
            • <strong>Public</strong>: Accesible desde cualquier lugar<br>
            • <strong>Readonly</strong>: Propiedad inmutable (PHP 8.1+)<br>
            • <strong>Getters</strong>: Métodos para leer propiedades privadas<br>
            • <strong>Setters</strong>: Métodos para modificar con validación<br>
            • <strong>Invariantes</strong>: Reglas que el objeto siempre debe cumplir
        </div>
    `,
    'polimorfismo': `
        <h1>Polimorfismo y Type Hinting en PHP 8+</h1>
        
        <p>El <strong>polimorfismo</strong> permite que diferentes clases respondan al mismo mensaje de formas distintas. El <strong>type hinting</strong> garantiza que los parámetros y valores de retorno sean del tipo correcto.</p>

        <div class="info-box">
            <strong>💡 Conceptos Clave:</strong><br>
            • <strong>Polimorfismo</strong>: "Muchas formas" - mismo método, diferentes implementaciones<br>
            • <strong>Type Hinting</strong>: Declarar tipos de parámetros y retorno<br>
            • <strong>Duck Typing</strong>: "Si camina como pato y grazna como pato, es un pato"<br>
            • <strong>Sustitución</strong>: Usar objetos de diferentes clases de forma intercambiable<br>
            • <strong>Contratos</strong>: Interfaces definen el "qué", clases el "cómo"
        </div>

        <h3>Polimorfismo Básico con Interfaces</h3>
        <div class="code-block"><pre><code>&lt;?php
interface Pagable {
    public function calcularMonto(): float;
    public function getDescripcion(): string;
}

class Factura implements Pagable {
    public function __construct(
        private float $subtotal,
        private float $iva = 0.16
    ) {}
    
    public function calcularMonto(): float {
        return $this->subtotal * (1 + $this->iva);
    }
    
    public function getDescripcion(): string {
        return "Factura por \${$this->subtotal}";
    }
}

class Recibo implements Pagable {
    public function __construct(
        private float $monto,
        private float $retencion = 0.10
    ) {}
    
    public function calcularMonto(): float {
        return $this->monto * (1 - $this->retencion);
    }
    
    public function getDescripcion(): string {
        return "Recibo por \${$this->monto}";
    }
}

class NotaCredito implements Pagable {
    public function __construct(
        private float $montoOriginal,
        private float $descuento
    ) {}
    
    public function calcularMonto(): float {
        return -($this->montoOriginal * $this->descuento);
    }
    
    public function getDescripcion(): string {
        return "Nota de crédito";
    }
}

// Función polimórfica: acepta cualquier Pagable
function procesarPago(Pagable $item): void {
    echo $item->getDescripcion() . "\\n";
    echo "Monto: \$" . number_format($item->calcularMonto(), 2) . "\\n";
}

// Uso - Polimorfismo en acción
$factura = new Factura(1000);
$recibo = new Recibo(500);
$notaCredito = new NotaCredito(1000, 0.1);

procesarPago($factura);      // "Factura por $1000" / "Monto: $1160.00"
procesarPago($recibo);       // "Recibo por $500" / "Monto: $450.00"
procesarPago($notaCredito);  // "Nota de crédito" / "Monto: $-100.00"
?&gt;</code></pre></div>

        <h3>Type Hinting con Tipos Escalares</h3>
        <div class="code-block"><pre><code>&lt;?php
// Declarar strict types para mayor seguridad
declare(strict_types=1);

class Calculadora {
    // Type hinting de parámetros y retorno
    public function sumar(int $a, int $b): int {
        return $a + $b;
    }
    
    public function dividir(float $a, float $b): float {
        if ($b === 0.0) {
            throw new InvalidArgumentException("División por cero");
        }
        return $a / $b;
    }
    
    public function concatenar(string $a, string $b): string {
        return $a . $b;
    }
    
    public function esVerdadero(bool $valor): string {
        return $valor ? "Verdadero" : "Falso";
    }
    
    // Array type hint
    public function sumarArray(array $numeros): float {
        return array_sum($numeros);
    }
    
    // Mixed type (PHP 8.0+)
    public function procesarValor(mixed $valor): string {
        return match(gettype($valor)) {
            'integer' => "Entero: {$valor}",
            'double' => "Float: {$valor}",
            'string' => "String: {$valor}",
            'boolean' => "Boolean: " . ($valor ? 'true' : 'false'),
            'array' => "Array con " . count($valor) . " elementos",
            default => "Tipo: " . gettype($valor)
        };
    }
}

$calc = new Calculadora();

echo $calc->sumar(5, 3);           // 8
echo $calc->dividir(10.0, 2.0);    // 5.0
echo $calc->concatenar("Hola", " Mundo");  // "Hola Mundo"

// ❌ Error con strict_types=1
// $calc->sumar(5.5, 3);  // TypeError: debe ser int
?&gt;</code></pre></div>

        <h3>Union Types (PHP 8.0+)</h3>
        <div class="code-block"><pre><code>&lt;?php
class Procesador {
    // Acepta int o float
    public function procesar(int|float $numero): int|float {
        return $numero * 2;
    }
    
    // Acepta string o null
    public function formatear(?string $texto): string {
        return $texto ?? "Sin texto";
    }
    
    // Acepta array o objeto
    public function serializar(array|object $datos): string {
        return json_encode($datos);
    }
    
    // Union type complejo
    public function convertir(int|float|string $valor): float {
        return (float) $valor;
    }
}

$proc = new Procesador();

echo $proc->procesar(10);      // 20
echo $proc->procesar(5.5);     // 11.0
echo $proc->formatear(null);   // "Sin texto"
echo $proc->formatear("Hola"); // "Hola"
?&gt;</code></pre></div>

        <h3>Intersection Types (PHP 8.1+)</h3>
        <div class="code-block"><pre><code>&lt;?php
interface Loggable {
    public function log(string $mensaje): void;
}

interface Cacheable {
    public function cache(string $key, mixed $value): void;
}

class Logger implements Loggable {
    public function log(string $mensaje): void {
        echo "[LOG] {$mensaje}\\n";
    }
}

class CacheManager implements Cacheable {
    public function cache(string $key, mixed $value): void {
        echo "[CACHE] {$key} = {$value}\\n";
    }
}

class AdvancedService implements Loggable, Cacheable {
    public function log(string $mensaje): void {
        echo "[SERVICE LOG] {$mensaje}\\n";
    }
    
    public function cache(string $key, mixed $value): void {
        echo "[SERVICE CACHE] {$key}\\n";
    }
}

// Intersection type: debe implementar AMBAS interfaces
function procesar(Loggable&Cacheable $servicio): void {
    $servicio->log("Procesando...");
    $servicio->cache("resultado", "OK");
}

$advanced = new AdvancedService();
procesar($advanced);  // ✅ OK: implementa ambas

// $logger = new Logger();
// procesar($logger);  // ❌ Error: solo implementa Loggable
?&gt;</code></pre></div>

        <h3>Polimorfismo con Clases Abstractas</h3>
        <div class="code-block"><pre><code>&lt;?php
abstract class Notificacion {
    protected string $destinatario;
    protected string $mensaje;
    
    public function __construct(string $destinatario, string $mensaje) {
        $this->destinatario = $destinatario;
        $this->mensaje = $mensaje;
    }
    
    // Método abstracto: cada clase lo implementa diferente
    abstract public function enviar(): bool;
    
    // Método concreto: compartido por todas
    public function validar(): bool {
        return !empty($this->destinatario) && !empty($this->mensaje);
    }
    
    public function getMensaje(): string {
        return $this->mensaje;
    }
}

class EmailNotificacion extends Notificacion {
    public function enviar(): bool {
        if (!$this->validar()) {
            return false;
        }
        
        echo "Enviando email a {$this->destinatario}: {$this->mensaje}\\n";
        // Lógica de envío de email
        return true;
    }
}

class SMSNotificacion extends Notificacion {
    public function enviar(): bool {
        if (!$this->validar()) {
            return false;
        }
        
        echo "Enviando SMS a {$this->destinatario}: {$this->mensaje}\\n";
        // Lógica de envío de SMS
        return true;
    }
}

class PushNotificacion extends Notificacion {
    public function enviar(): bool {
        if (!$this->validar()) {
            return false;
        }
        
        echo "Enviando push a {$this->destinatario}: {$this->mensaje}\\n";
        // Lógica de push notification
        return true;
    }
}

// Función polimórfica que acepta cualquier Notificacion
function enviarNotificacion(Notificacion $notif): void {
    if ($notif->validar()) {
        $notif->enviar();
    } else {
        echo "Notificación inválida\\n";
    }
}

// Uso - Polimorfismo
$email = new EmailNotificacion("user@example.com", "Hola por email");
$sms = new SMSNotificacion("+34123456789", "Hola por SMS");
$push = new PushNotificacion("device-token-123", "Hola por push");

enviarNotificacion($email);
enviarNotificacion($sms);
enviarNotificacion($push);
?&gt;</code></pre></div>

        <h3>Type Hinting con Clases y Objetos</h3>
        <div class="code-block"><pre><code>&lt;?php
class Usuario {
    public function __construct(
        public readonly int $id,
        public readonly string $nombre
    ) {}
}

class Producto {
    public function __construct(
        public readonly int $id,
        public readonly string $nombre,
        public readonly float $precio
    ) {}
}

class Pedido {
    private array $items = [];
    
    public function __construct(
        private Usuario $usuario  // Type hint de clase
    ) {}
    
    // Type hint de clase en parámetro
    public function agregarProducto(Producto $producto, int $cantidad): void {
        $this->items[] = [
            'producto' => $producto,
            'cantidad' => $cantidad
        ];
    }
    
    // Type hint de clase en retorno
    public function getUsuario(): Usuario {
        return $this->usuario;
    }
    
    public function getTotal(): float {
        $total = 0;
        foreach ($this->items as $item) {
            $total += $item['producto']->precio * $item['cantidad'];
        }
        return $total;
    }
}

// Uso
$usuario = new Usuario(1, "Juan");
$producto1 = new Producto(1, "Laptop", 999.99);
$producto2 = new Producto(2, "Mouse", 29.99);

$pedido = new Pedido($usuario);
$pedido->agregarProducto($producto1, 1);
$pedido->agregarProducto($producto2, 2);

echo $pedido->getUsuario()->nombre;  // "Juan"
echo $pedido->getTotal();  // 1059.97
?&gt;</code></pre></div>

        <h3>Polimorfismo con Callable y First-Class Callables (PHP 8.1+)</h3>
        <div class="code-block"><pre><code>&lt;?php
class Filtrador {
    // Type hint: callable
    public function filtrar(array $datos, callable $criterio): array {
        return array_filter($datos, $criterio);
    }
    
    // Type hint: Closure
    public function transformar(array $datos, Closure $transformacion): array {
        return array_map($transformacion, $datos);
    }
}

$filtrador = new Filtrador();
$numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Usando función anónima
$pares = $filtrador->filtrar($numeros, fn($n) => $n % 2 === 0);
print_r($pares);  // [2, 4, 6, 8, 10]

// Usando closure
$dobles = $filtrador->transformar($numeros, fn($n) => $n * 2);
print_r($dobles);  // [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]

// First-class callable (PHP 8.1+)
class Matematicas {
    public static function cuadrado(int $n): int {
        return $n * $n;
    }
}

// Sintaxis antigua
$cuadrados1 = $filtrador->transformar($numeros, 'Matematicas::cuadrado'(...));

// Sintaxis nueva (PHP 8.1+)
$cuadrados2 = $filtrador->transformar($numeros, Matematicas::cuadrado(...));
print_r($cuadrados2);  // [1, 4, 9, 16, 25, 36, 49, 64, 81, 100]
?&gt;</code></pre></div>

        <h3>Nullable Types y Null Coalescing</h3>
        <div class="code-block"><pre><code>&lt;?php
class PerfilUsuario {
    public function __construct(
        private string $nombre,
        private ?string $apellido = null,  // Nullable
        private ?int $edad = null,
        private ?string $email = null
    ) {}
    
    // Retorno nullable
    public function getApellido(): ?string {
        return $this->apellido;
    }
    
    public function getNombreCompleto(): string {
        // Null coalescing operator
        return $this->nombre . ' ' . ($this->apellido ?? '');
    }
    
    public function getEdad(): int {
        // Null coalescing con valor por defecto
        return $this->edad ?? 0;
    }
    
    // Union type con null (alternativa a ?)
    public function getEmail(): string|null {
        return $this->email;
    }
    
    public function setEmail(?string $email): void {
        $this->email = $email;
    }
}

$perfil1 = new PerfilUsuario("Juan", "Pérez", 30, "juan@example.com");
echo $perfil1->getNombreCompleto();  // "Juan Pérez"

$perfil2 = new PerfilUsuario("Ana");
echo $perfil2->getNombreCompleto();  // "Ana "
echo $perfil2->getEdad();            // 0
echo $perfil2->getEmail() ?? "Sin email";  // "Sin email"
?&gt;</code></pre></div>

        <h3>Ejemplo Completo: Sistema de Pagos Polimórfico</h3>
        <div class="code-block"><pre><code>&lt;?php
interface MetodoPago {
    public function procesar(float $monto): bool;
    public function getNombre(): string;
    public function getComision(): float;
}

class PagoTarjeta implements MetodoPago {
    public function __construct(
        private string $numero,
        private string $cvv
    ) {}
    
    public function procesar(float $monto): bool {
        echo "Procesando \${$monto} con tarjeta ****" . substr($this->numero, -4) . "\\n";
        return true;
    }
    
    public function getNombre(): string {
        return "Tarjeta de Crédito";
    }
    
    public function getComision(): float {
        return 0.025;  // 2.5%
    }
}

class PagoPayPal implements MetodoPago {
    public function __construct(
        private string $email
    ) {}
    
    public function procesar(float $monto): bool {
        echo "Procesando \${$monto} con PayPal ({$this->email})\\n";
        return true;
    }
    
    public function getNombre(): string {
        return "PayPal";
    }
    
    public function getComision(): float {
        return 0.035;  // 3.5%
    }
}

class PagoCripto implements MetodoPago {
    public function __construct(
        private string $wallet,
        private string $moneda = 'BTC'
    ) {}
    
    public function procesar(float $monto): bool {
        echo "Procesando \${$monto} con {$this->moneda} a wallet {$this->wallet}\\n";
        return true;
    }
    
    public function getNombre(): string {
        return "Criptomoneda ({$this->moneda})";
    }
    
    public function getComision(): float {
        return 0.01;  // 1%
    }
}

// Procesador polimórfico
class ProcesadorPagos {
    private array $historial = [];
    
    // Type hint: acepta cualquier MetodoPago
    public function procesarPago(MetodoPago $metodo, float $monto): array {
        $comision = $monto * $metodo->getComision();
        $total = $monto + $comision;
        
        echo "Método: {$metodo->getNombre()}\\n";
        echo "Monto: \${$monto}\\n";
        echo "Comisión: \${$comision}\\n";
        echo "Total: \${$total}\\n";
        
        $resultado = $metodo->procesar($total);
        
        $transaccion = [
            'metodo' => $metodo->getNombre(),
            'monto' => $monto,
            'comision' => $comision,
            'total' => $total,
            'exitoso' => $resultado,
            'fecha' => new DateTime()
        ];
        
        $this->historial[] = $transaccion;
        
        return $transaccion;
    }
    
    // Type hint: array de MetodoPago
    public function procesarMultiple(array $metodos, float $monto): void {
        foreach ($metodos as $metodo) {
            if (!$metodo instanceof MetodoPago) {
                throw new InvalidArgumentException("Debe ser MetodoPago");
            }
            
            $this->procesarPago($metodo, $monto);
            echo "---\\n";
        }
    }
    
    public function getHistorial(): array {
        return $this->historial;
    }
}

// Uso - Polimorfismo en acción
$procesador = new ProcesadorPagos();

$tarjeta = new PagoTarjeta("4532123456789012", "123");
$paypal = new PagoPayPal("user@example.com");
$cripto = new PagoCripto("1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", "BTC");

// Procesar con diferentes métodos (polimorfismo)
$procesador->procesarPago($tarjeta, 100);
echo "\\n";
$procesador->procesarPago($paypal, 200);
echo "\\n";
$procesador->procesarPago($cripto, 300);

// Procesar múltiples
echo "\\n=== PROCESAMIENTO MÚLTIPLE ===\\n";
$procesador->procesarMultiple([$tarjeta, $paypal, $cripto], 50);
?&gt;</code></pre></div>

        <h3>Never Type (PHP 8.1+)</h3>
        <div class="code-block"><pre><code>&lt;?php
class ErrorHandler {
    // never: indica que la función nunca retorna (siempre lanza excepción o termina)
    public function abort(string $mensaje): never {
        throw new RuntimeException($mensaje);
    }
    
    public function exit(int $codigo = 0): never {
        exit($codigo);
    }
    
    public function redirect(string $url): never {
        header("Location: {$url}");
        exit;
    }
}

function validarEdad(int $edad): void {
    $handler = new ErrorHandler();
    
    if ($edad < 0) {
        $handler->abort("Edad no puede ser negativa");
        // El código nunca llega aquí
    }
    
    if ($edad < 18) {
        echo "Menor de edad\\n";
    }
}

// validarEdad(-5);  // Lanza RuntimeException
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Mejores Prácticas:</strong><br>
            • <strong>Siempre usa type hints</strong>: En parámetros y valores de retorno<br>
            • <strong>Strict types</strong>: Usa <code>declare(strict_types=1)</code> para mayor seguridad<br>
            • <strong>Interfaces sobre clases</strong>: Type hint con interfaces para flexibilidad<br>
            • <strong>Union types</strong>: Usa cuando un parámetro acepta múltiples tipos<br>
            • <strong>Nullable con ?</strong>: Usa <code>?Type</code> para valores opcionales<br>
            • <strong>Mixed con cuidado</strong>: Solo cuando realmente necesitas cualquier tipo<br>
            • <strong>Never para funciones que no retornan</strong>: Documenta el flujo claramente
        </div>

        <div class="warning-box">
            <strong>⚠️ Errores Comunes:</strong><br>
            • NO omitir type hints en código nuevo<br>
            • NO usar <code>mixed</code> cuando puedes ser más específico<br>
            • NO confundir <code>?Type</code> (nullable) con <code>Type|null</code> (son equivalentes)<br>
            • NO usar type hints incorrectos solo para evitar errores<br>
            • SIEMPRE validar tipos en funciones públicas<br>
            • SIEMPRE usar <code>instanceof</code> para verificar tipos en runtime<br>
            • NUNCA asumir el tipo sin verificar en código crítico
        </div>

        <div class="info-box">
            <strong>💡 Resumen:</strong><br>
            • <strong>Polimorfismo</strong>: Diferentes clases, misma interfaz<br>
            • <strong>Type Hint</strong>: <code>function foo(Type $param): ReturnType</code><br>
            • <strong>Union Types</strong>: <code>int|float|string</code> (PHP 8.0+)<br>
            • <strong>Intersection Types</strong>: <code>Interface1&Interface2</code> (PHP 8.1+)<br>
            • <strong>Nullable</strong>: <code>?Type</code> o <code>Type|null</code><br>
            • <strong>Mixed</strong>: Acepta cualquier tipo (PHP 8.0+)<br>
            • <strong>Never</strong>: Función que nunca retorna (PHP 8.1+)<br>
            • <strong>Strict Types</strong>: <code>declare(strict_types=1)</code>
        </div>
    `,
    'clases-finales': `
        <h1>Clases Finales y Métodos Finales en PHP 8+</h1>
        
        <p>La palabra clave <strong>final</strong> previene que una clase sea heredada o que un método sea sobrescrito. Es útil para garantizar la integridad del diseño y prevenir modificaciones no deseadas.</p>

        <div class="info-box">
            <strong>💡 Cuándo usar final:</strong><br>
            • <strong>Clases final</strong>: Cuando no quieres que nadie herede de tu clase<br>
            • <strong>Métodos final</strong>: Cuando un método no debe ser sobrescrito<br>
            • <strong>Seguridad</strong>: Prevenir modificaciones que rompan la lógica<br>
            • <strong>Optimización</strong>: El compilador puede optimizar mejor<br>
            • <strong>Diseño claro</strong>: Comunica intención de no extender
        </div>

        <h3>Clases Finales Básicas</h3>
        <p>Una clase final no puede ser heredada:</p>
        
        <div class="code-block"><pre><code>&lt;?php
// Clase final: no se puede heredar
final class Usuario {
    public function __construct(
        private string $nombre,
        private string $email
    ) {}
    
    public function getNombre(): string {
        return $this->nombre;
    }
    
    public function getEmail(): string {
        return $this->email;
    }
}

// ❌ Error: no se puede heredar de una clase final
// class UsuarioPremium extends Usuario {
//     // Fatal error: Class UsuarioPremium may not inherit from final class Usuario
// }

// ✅ Uso normal
$usuario = new Usuario("Juan", "juan@example.com");
echo $usuario->getNombre();
?&gt;</code></pre></div>

        <h3>Métodos Finales</h3>
        <p>Un método final no puede ser sobrescrito en clases hijas:</p>
        
        <div class="code-block"><pre><code>&lt;?php
class Vehiculo {
    protected string $marca;
    protected int $año;
    
    public function __construct(string $marca, int $año) {
        $this->marca = $marca;
        $this->año = $año;
    }
    
    // Método final: no se puede sobrescribir
    final public function getIdentificacion(): string {
        return "{$this->marca} ({$this->año})";
    }
    
    // Método normal: se puede sobrescribir
    public function getDescripcion(): string {
        return "Vehículo {$this->marca}";
    }
    
    // Método final con lógica crítica
    final public function validarAño(): bool {
        $añoActual = (int) date('Y');
        return $this->año >= 1900 && $this->año <= $añoActual;
    }
}

class Coche extends Vehiculo {
    private int $puertas;
    
    public function __construct(string $marca, int $año, int $puertas) {
        parent::__construct($marca, $año);
        $this->puertas = $puertas;
    }
    
    // ✅ OK: sobrescribir método normal
    public function getDescripcion(): string {
        return "Coche {$this->marca} con {$this->puertas} puertas";
    }
    
    // ❌ Error: no se puede sobrescribir método final
    // public function getIdentificacion(): string {
    //     return "Coche: " . parent::getIdentificacion();
    // }
    // Fatal error: Cannot override final method Vehiculo::getIdentificacion()
}

$coche = new Coche("Toyota", 2023, 4);
echo $coche->getIdentificacion();  // "Toyota (2023)"
echo $coche->getDescripcion();     // "Coche Toyota con 4 puertas"
echo $coche->validarAño() ? "Válido" : "Inválido";
?&gt;</code></pre></div>

        <h3>Patrón Singleton con Clase Final</h3>
        <div class="code-block"><pre><code>&lt;?php
// Clase final para prevenir herencia del Singleton
final class Configuracion {
    private static ?Configuracion $instancia = null;
    private array $config = [];
    
    // Constructor privado: no se puede instanciar desde fuera
    private function __construct() {
        // Cargar configuración
        $this->config = [
            'app_name' => 'Mi Aplicación',
            'version' => '1.0.0',
            'debug' => true
        ];
    }
    
    // Prevenir clonación
    private function __clone() {}
    
    // Prevenir deserialización
    public function __wakeup() {
        throw new Exception("No se puede deserializar un Singleton");
    }
    
    // Método estático para obtener la instancia única
    public static function getInstance(): self {
        if (self::$instancia === null) {
            self::$instancia = new self();
        }
        return self::$instancia;
    }
    
    public function get(string $key): mixed {
        return $this->config[$key] ?? null;
    }
    
    public function set(string $key, mixed $value): void {
        $this->config[$key] = $value;
    }
    
    public function getAll(): array {
        return $this->config;
    }
}

// Uso
$config1 = Configuracion::getInstance();
$config2 = Configuracion::getInstance();

var_dump($config1 === $config2);  // true - misma instancia

echo $config1->get('app_name');  // "Mi Aplicación"
$config1->set('timezone', 'Europe/Madrid');
echo $config2->get('timezone');  // "Europe/Madrid" - comparten estado

// ❌ No se puede instanciar directamente
// $config = new Configuracion();  // Error: constructor privado

// ❌ No se puede heredar
// class ConfiguracionExtendida extends Configuracion {}  // Error: clase final
?&gt;</code></pre></div>

        <h3>Clases Finales para Value Objects</h3>
        <div class="code-block"><pre><code>&lt;?php
// Value Object inmutable y final
final readonly class Email {
    public function __construct(
        public string $valor
    ) {
        if (!filter_var($valor, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException("Email inválido: {$valor}");
        }
    }
    
    public function getDominio(): string {
        return substr($this->valor, strpos($this->valor, '@') + 1);
    }
    
    public function getUsuario(): string {
        return substr($this->valor, 0, strpos($this->valor, '@'));
    }
    
    public function equals(Email $otro): bool {
        return strtolower($this->valor) === strtolower($otro->valor);
    }
    
    public function __toString(): string {
        return $this->valor;
    }
}

final readonly class Dinero {
    public function __construct(
        public float $cantidad,
        public string $moneda
    ) {
        if ($cantidad < 0) {
            throw new InvalidArgumentException("Cantidad no puede ser negativa");
        }
        
        if (!in_array($moneda, ['USD', 'EUR', 'MXN', 'GBP'])) {
            throw new InvalidArgumentException("Moneda no válida");
        }
    }
    
    public function sumar(Dinero $otro): self {
        if ($this->moneda !== $otro->moneda) {
            throw new InvalidArgumentException("No se pueden sumar monedas diferentes");
        }
        return new self($this->cantidad + $otro->cantidad, $this->moneda);
    }
    
    public function multiplicar(float $factor): self {
        return new self($this->cantidad * $factor, $this->moneda);
    }
    
    public function formato(): string {
        return number_format($this->cantidad, 2) . " {$this->moneda}";
    }
}

// Uso
$email = new Email("usuario@example.com");
echo $email->getDominio();  // "example.com"
echo $email->getUsuario();  // "usuario"

$precio = new Dinero(100, 'USD');
$descuento = $precio->multiplicar(0.9);
echo $descuento->formato();  // "90.00 USD"

// ❌ No se pueden heredar (son finales)
// class EmailCorporativo extends Email {}  // Error
?&gt;</code></pre></div>

        <h3>Métodos Finales para Lógica Crítica</h3>
        <div class="code-block"><pre><code>&lt;?php
abstract class BaseDatos {
    protected string $host;
    protected string $usuario;
    protected string $password;
    protected ?PDO $conexion = null;
    
    public function __construct(string $host, string $usuario, string $password) {
        $this->host = $host;
        $this->usuario = $usuario;
        $this->password = $password;
    }
    
    // Método final: la lógica de conexión no debe cambiar
    final public function conectar(): void {
        if ($this->conexion !== null) {
            return;  // Ya conectado
        }
        
        try {
            $dsn = $this->getDSN();
            $this->conexion = new PDO($dsn, $this->usuario, $this->password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]);
            
            $this->afterConnect();
        } catch (PDOException $e) {
            throw new RuntimeException("Error de conexión: " . $e->getMessage());
        }
    }
    
    // Método final: la desconexión debe ser consistente
    final public function desconectar(): void {
        $this->beforeDisconnect();
        $this->conexion = null;
    }
    
    // Método final: transacciones deben ser seguras
    final public function transaction(callable $callback): mixed {
        if ($this->conexion === null) {
            throw new RuntimeException("No hay conexión activa");
        }
        
        try {
            $this->conexion->beginTransaction();
            $resultado = $callback($this->conexion);
            $this->conexion->commit();
            return $resultado;
        } catch (Exception $e) {
            $this->conexion->rollBack();
            throw $e;
        }
    }
    
    // Métodos abstractos: cada BD los implementa diferente
    abstract protected function getDSN(): string;
    
    // Hooks que las clases hijas pueden sobrescribir
    protected function afterConnect(): void {
        // Opcional: configuración post-conexión
    }
    
    protected function beforeDisconnect(): void {
        // Opcional: limpieza pre-desconexión
    }
}

class MySQL extends BaseDatos {
    private string $database;
    
    public function __construct(string $host, string $usuario, string $password, string $database) {
        parent::__construct($host, $usuario, $password);
        $this->database = $database;
    }
    
    protected function getDSN(): string {
        return "mysql:host={$this->host};dbname={$this->database};charset=utf8mb4";
    }
    
    protected function afterConnect(): void {
        // Configuración específica de MySQL
        $this->conexion->exec("SET time_zone = '+00:00'");
    }
    
    // ❌ No se puede sobrescribir método final
    // public function conectar(): void {
    //     // Error: Cannot override final method
    // }
}

class PostgreSQL extends BaseDatos {
    private string $database;
    
    public function __construct(string $host, string $usuario, string $password, string $database) {
        parent::__construct($host, $usuario, $password);
        $this->database = $database;
    }
    
    protected function getDSN(): string {
        return "pgsql:host={$this->host};dbname={$this->database}";
    }
}

// Uso
$mysql = new MySQL("localhost", "root", "password", "midb");
$mysql->conectar();

$mysql->transaction(function($pdo) {
    $pdo->exec("INSERT INTO usuarios (nombre) VALUES ('Juan')");
    $pdo->exec("INSERT INTO logs (accion) VALUES ('usuario_creado')");
    return true;
});

$mysql->desconectar();
?&gt;</code></pre></div>

        <h3>Clases Finales para DTOs (Data Transfer Objects)</h3>
        <div class="code-block"><pre><code>&lt;?php
// DTO final: estructura de datos simple e inmutable
final readonly class UsuarioDTO {
    public function __construct(
        public int $id,
        public string $nombre,
        public string $email,
        public DateTime $fechaRegistro,
        public bool $activo
    ) {}
    
    public function toArray(): array {
        return [
            'id' => $this->id,
            'nombre' => $this->nombre,
            'email' => $this->email,
            'fecha_registro' => $this->fechaRegistro->format('Y-m-d H:i:s'),
            'activo' => $this->activo
        ];
    }
    
    public static function fromArray(array $data): self {
        return new self(
            $data['id'],
            $data['nombre'],
            $data['email'],
            new DateTime($data['fecha_registro']),
            $data['activo']
        );
    }
}

final readonly class ProductoDTO {
    public function __construct(
        public int $id,
        public string $nombre,
        public float $precio,
        public int $stock,
        public string $categoria
    ) {}
    
    public function toJSON(): string {
        return json_encode([
            'id' => $this->id,
            'nombre' => $this->nombre,
            'precio' => $this->precio,
            'stock' => $this->stock,
            'categoria' => $this->categoria
        ]);
    }
}

// Uso
$usuario = new UsuarioDTO(
    1,
    "Juan Pérez",
    "juan@example.com",
    new DateTime(),
    true
);

$array = $usuario->toArray();
print_r($array);

$producto = new ProductoDTO(1, "Laptop", 999.99, 10, "Electrónica");
echo $producto->toJSON();
?&gt;</code></pre></div>

        <h3>Combinación: Clase Final con Métodos Finales</h3>
        <div class="code-block"><pre><code>&lt;?php
// Clase final con métodos finales (redundante pero explícito)
final class ValidadorTarjeta {
    // Método final en clase final (redundante pero documenta intención)
    final public function validarNumero(string $numero): bool {
        // Eliminar espacios y guiones
        $numero = preg_replace('/[\s-]/', '', $numero);
        
        // Verificar que solo contenga dígitos
        if (!ctype_digit($numero)) {
            return false;
        }
        
        // Algoritmo de Luhn
        return $this->algoritmoLuhn($numero);
    }
    
    final public function validarCVV(string $cvv): bool {
        return ctype_digit($cvv) && (strlen($cvv) === 3 || strlen($cvv) === 4);
    }
    
    final public function validarFechaExpiracion(int $mes, int $año): bool {
        if ($mes < 1 || $mes > 12) {
            return false;
        }
        
        $añoActual = (int) date('Y');
        $mesActual = (int) date('m');
        
        if ($año < $añoActual) {
            return false;
        }
        
        if ($año === $añoActual && $mes < $mesActual) {
            return false;
        }
        
        return true;
    }
    
    final public function getTipo(string $numero): string {
        $numero = preg_replace('/[\s-]/', '', $numero);
        
        return match(true) {
            str_starts_with($numero, '4') => 'Visa',
            str_starts_with($numero, '5') => 'Mastercard',
            str_starts_with($numero, '3') => 'American Express',
            default => 'Desconocido'
        };
    }
    
    private function algoritmoLuhn(string $numero): bool {
        $suma = 0;
        $longitud = strlen($numero);
        
        for ($i = $longitud - 1; $i >= 0; $i--) {
            $digito = (int) $numero[$i];
            
            if (($longitud - $i) % 2 === 0) {
                $digito *= 2;
                if ($digito > 9) {
                    $digito -= 9;
                }
            }
            
            $suma += $digito;
        }
        
        return $suma % 10 === 0;
    }
}

// Uso
$validador = new ValidadorTarjeta();

$numeroTarjeta = "4532 1234 5678 9010";
echo $validador->validarNumero($numeroTarjeta) ? "Válida" : "Inválida";
echo $validador->getTipo($numeroTarjeta);  // "Visa"
echo $validador->validarCVV("123") ? "CVV válido" : "CVV inválido";
echo $validador->validarFechaExpiracion(12, 2025) ? "Fecha válida" : "Fecha inválida";

// ❌ No se puede heredar
// class ValidadorTarjetaExtendido extends ValidadorTarjeta {}  // Error
?&gt;</code></pre></div>

        <h3>Cuándo NO usar final</h3>
        <div class="code-block"><pre><code>&lt;?php
// ❌ MAL: Clase que debería ser extensible
// final class Controlador {
//     public function index() {}
// }
// Problema: Los usuarios querrán extender controladores

// ✅ BIEN: Clase base extensible
abstract class Controlador {
    // Método final para lógica común
    final protected function validarRequest(): bool {
        return !empty($_SERVER['REQUEST_METHOD']);
    }
    
    // Método abstracto para que las clases hijas implementen
    abstract public function index(): void;
}

class HomeControlador extends Controlador {
    public function index(): void {
        if ($this->validarRequest()) {
            echo "Página de inicio";
        }
    }
}

// ❌ MAL: Librería con clases finales innecesarias
// final class Helper {
//     public static function formatear($valor) {}
// }
// Problema: Los usuarios pueden querer extender funcionalidad

// ✅ BIEN: Clase extensible con métodos finales críticos
class Helper {
    // Método final para lógica que no debe cambiar
    final public static function sanitizar(string $input): string {
        return htmlspecialchars($input, ENT_QUOTES, 'UTF-8');
    }
    
    // Método normal que se puede sobrescribir
    public static function formatear(mixed $valor): string {
        return (string) $valor;
    }
}

class HelperExtendido extends Helper {
    // ✅ OK: sobrescribir método normal
    public static function formatear(mixed $valor): string {
        if (is_array($valor)) {
            return json_encode($valor);
        }
        return parent::formatear($valor);
    }
}
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Mejores Prácticas:</strong><br>
            • <strong>Value Objects</strong>: Usa clases finales para objetos inmutables<br>
            • <strong>DTOs</strong>: Marca DTOs como finales (son estructuras de datos)<br>
            • <strong>Singleton</strong>: Usa final para prevenir herencia del patrón<br>
            • <strong>Métodos críticos</strong>: Marca como final lógica de seguridad/validación<br>
            • <strong>Template Method</strong>: Usa final en el algoritmo principal<br>
            • <strong>Documenta intención</strong>: Usa final para comunicar diseño<br>
            • <strong>Optimización</strong>: PHP puede optimizar mejor clases/métodos finales
        </div>

        <div class="warning-box">
            <strong>⚠️ Errores Comunes:</strong><br>
            • NO marcar todo como final por defecto<br>
            • NO usar final en librerías/frameworks extensibles<br>
            • NO prevenir extensión sin razón válida<br>
            • NO usar final solo por "optimización" prematura<br>
            • SIEMPRE considerar si otros necesitarán extender tu código<br>
            • SIEMPRE documentar por qué algo es final<br>
            • NUNCA hacer final una clase base de framework
        </div>

        <div class="info-box">
            <strong>💡 Resumen:</strong><br>
            • <strong>final class</strong>: No se puede heredar<br>
            • <strong>final method</strong>: No se puede sobrescribir<br>
            • <strong>Uso principal</strong>: Value Objects, DTOs, Singleton<br>
            • <strong>Ventajas</strong>: Seguridad, claridad de diseño, optimización<br>
            • <strong>Desventajas</strong>: Menos flexibilidad, dificulta testing<br>
            • <strong>Regla de oro</strong>: Usa final cuando tengas una razón específica<br>
            • <strong>Combinación</strong>: Puedes tener métodos finales en clases no finales
        </div>
    `,
    
    // Patrones de Diseño
    ...patronesDiseno,
    
    // Placeholders para secciones pendientes (a desarrollar)
    'declaraciones-tipos': `
        <h1>Declaraciones de Tipos Escalares y de Retorno</h1>
        
        <p>PHP permite declarar tipos para parámetros y valores de retorno, mejorando la seguridad y claridad del código.</p>

        <h3>Strict Types</h3>
        <div class="code-block"><pre><code>&lt;?php
declare(strict_types=1);  // Activar modo estricto

function sumar(int $a, int $b): int {
    return $a + $b;
}

echo sumar(5, 3);      // ✅ 8
// echo sumar(5.5, 3); // ❌ TypeError en modo estricto
?&gt;</code></pre></div>

        <h3>Tipos Escalares</h3>
        <div class="code-block"><pre><code>&lt;?php
function procesar(
    int $entero,
    float $decimal,
    string $texto,
    bool $bandera,
    array $lista
): void {
    // Lógica aquí
}

procesar(10, 3.14, "Hola", true, [1, 2, 3]);
?&gt;</code></pre></div>

        <h3>Tipos de Retorno</h3>
        <div class="code-block"><pre><code>&lt;?php
function getNumero(): int {
    return 42;
}

function getTexto(): string {
    return "Hola";
}

function getNada(): void {
    echo "Sin retorno";
}

function getPosibleNull(): ?string {
    return null;  // Nullable
}

function getMultiple(): int|float {
    return rand(0, 1) ? 10 : 3.14;  // Union type
}
?&gt;</code></pre></div>

        <h3>Tipos Especiales (PHP 8+)</h3>
        <div class="code-block"><pre><code>&lt;?php
// mixed: cualquier tipo
function procesar(mixed $valor): mixed {
    return $valor;
}

// never: nunca retorna
function error(string $msg): never {
    throw new Exception($msg);
}

// self: retorna instancia de la misma clase
class Builder {
    public function setNombre(string $n): self {
        return $this;  // Chainable
    }
}
?&gt;</code></pre></div>

        <div class="info-box">
            <strong>💡 Resumen Rápido:</strong><br>
            • <code>declare(strict_types=1)</code>: Modo estricto<br>
            • <strong>Escalares</strong>: int, float, string, bool, array<br>
            • <strong>Nullable</strong>: <code>?Type</code> o <code>Type|null</code><br>
            • <strong>Union</strong>: <code>int|float|string</code> (PHP 8.0+)<br>
            • <strong>mixed</strong>: Cualquier tipo (PHP 8.0+)<br>
            • <strong>void</strong>: Sin retorno<br>
            • <strong>never</strong>: Nunca retorna (PHP 8.1+)<br>
            • <strong>self</strong>: Retorna la misma clase
        </div>
    `,
    'propiedades-promocionadas': `
        <h1>Propiedades Promocionadas en Constructores (PHP 8+)</h1>
        
        <p>Las <strong>propiedades promocionadas</strong> permiten declarar y asignar propiedades directamente en el constructor, reduciendo código repetitivo.</p>

        <div class="info-box">
            <strong>💡 Ventajas:</strong><br>
            • <strong>Menos código</strong>: Declaración y asignación en una línea<br>
            • <strong>Más legible</strong>: Constructor más limpio y claro<br>
            • <strong>Type hints</strong>: Tipos declarados directamente<br>
            • <strong>Visibilidad</strong>: public, protected, private en el constructor<br>
            • <strong>Readonly</strong>: Compatible con propiedades readonly (PHP 8.1+)
        </div>

        <h3>Antes vs Después (PHP 8.0+)</h3>
        <div class="code-block"><pre><code>&lt;?php
// ❌ ANTES (PHP 7.x): Código repetitivo
class Usuario {
    private string $nombre;
    private string $email;
    private int $edad;
    
    public function __construct(string $nombre, string $email, int $edad) {
        $this->nombre = $nombre;
        $this->email = $email;
        $this->edad = $edad;
    }
}

// ✅ DESPUÉS (PHP 8.0+): Constructor Property Promotion
class Usuario {
    public function __construct(
        private string $nombre,
        private string $email,
        private int $edad
    ) {}
}

// Uso idéntico
$usuario = new Usuario("Juan", "juan@example.com", 30);
?&gt;</code></pre></div>

        <h3>Con Diferentes Visibilidades</h3>
        <div class="code-block"><pre><code>&lt;?php
class Producto {
    public function __construct(
        public int $id,              // Público: accesible desde fuera
        public string $nombre,       // Público
        protected float $precio,     // Protegido: solo clase e hijas
        private int $stock           // Privado: solo esta clase
    ) {}
    
    public function getPrecio(): float {
        return $this->precio;
    }
    
    public function getStock(): int {
        return $this->stock;
    }
}

$producto = new Producto(1, "Laptop", 999.99, 10);
echo $producto->id;      // ✅ OK: público
echo $producto->nombre;  // ✅ OK: público
// echo $producto->precio;  // ❌ Error: protegido
// echo $producto->stock;   // ❌ Error: privado
?&gt;</code></pre></div>

        <h3>Con Readonly (PHP 8.1+)</h3>
        <div class="code-block"><pre><code>&lt;?php
class Pedido {
    public function __construct(
        public readonly int $id,
        public readonly string $numero,
        public readonly DateTime $fecha,
        private float $total = 0
    ) {}
    
    public function agregarTotal(float $monto): void {
        $this->total += $monto;  // ✅ OK: no es readonly
    }
    
    public function getTotal(): float {
        return $this->total;
    }
}

$pedido = new Pedido(1, "PED-001", new DateTime());
echo $pedido->id;      // ✅ Leer: OK
// $pedido->id = 2;    // ❌ Error: readonly no se puede modificar

$pedido->agregarTotal(100);
echo $pedido->getTotal();  // 100
?&gt;</code></pre></div>

        <h3>Combinando Promocionadas y Tradicionales</h3>
        <div class="code-block"><pre><code>&lt;?php
class Empleado {
    // Propiedades tradicionales
    private array $proyectos = [];
    private DateTime $fechaContratacion;
    
    public function __construct(
        // Propiedades promocionadas
        public readonly int $id,
        public readonly string $nombre,
        private float $salario,
        public string $departamento
    ) {
        // Lógica adicional en el constructor
        $this->fechaContratacion = new DateTime();
        $this->validarSalario();
    }
    
    private function validarSalario(): void {
        if ($this->salario < 0) {
            throw new InvalidArgumentException("Salario no puede ser negativo");
        }
    }
    
    public function asignarProyecto(string $proyecto): void {
        $this->proyectos[] = $proyecto;
    }
    
    public function getSalario(): float {
        return $this->salario;
    }
    
    public function aumentarSalario(float $porcentaje): void {
        $this->salario *= (1 + $porcentaje / 100);
    }
}

$empleado = new Empleado(1, "Ana García", 50000, "IT");
$empleado->asignarProyecto("Proyecto Alpha");
$empleado->aumentarSalario(10);  // +10%
echo $empleado->getSalario();  // 55000
?&gt;</code></pre></div>

        <h3>Con Valores por Defecto</h3>
        <div class="code-block"><pre><code>&lt;?php
class Configuracion {
    public function __construct(
        public string $nombre,
        public string $entorno = 'production',
        public bool $debug = false,
        public int $timeout = 30,
        public array $opciones = []
    ) {}
}

// Todos los parámetros
$config1 = new Configuracion("App", "development", true, 60, ['cache' => true]);

// Solo obligatorios (usa valores por defecto)
$config2 = new Configuracion("App");
echo $config2->entorno;  // "production"
echo $config2->debug ? 'true' : 'false';  // false
echo $config2->timeout;  // 30

// Algunos opcionales
$config3 = new Configuracion("App", "staging", true);
?&gt;</code></pre></div>

        <h3>Con Named Arguments (PHP 8.0+)</h3>
        <div class="code-block"><pre><code>&lt;?php
class Notificacion {
    public function __construct(
        public string $titulo,
        public string $mensaje,
        public string $tipo = 'info',
        public bool $urgente = false,
        public ?DateTime $programada = null
    ) {}
}

// Argumentos posicionales tradicionales
$notif1 = new Notificacion("Alerta", "Mensaje importante", "warning", true);

// Named arguments: más claro y flexible
$notif2 = new Notificacion(
    titulo: "Recordatorio",
    mensaje: "Tienes una reunión",
    urgente: true,
    tipo: "info"
);

// Solo los necesarios
$notif3 = new Notificacion(
    titulo: "Info",
    mensaje: "Todo OK"
);

// Saltar parámetros opcionales
$notif4 = new Notificacion(
    titulo: "Programada",
    mensaje: "Enviar mañana",
    programada: new DateTime('+1 day')
);
?&gt;</code></pre></div>

        <h3>Clase Readonly Completa (PHP 8.2+)</h3>
        <div class="code-block"><pre><code>&lt;?php
// Todas las propiedades son readonly automáticamente
readonly class Coordenada {
    public function __construct(
        public float $latitud,
        public float $longitud,
        public ?string $nombre = null
    ) {
        // Validación
        if ($latitud < -90 || $latitud > 90) {
            throw new InvalidArgumentException("Latitud inválida");
        }
        if ($longitud < -180 || $longitud > 180) {
            throw new InvalidArgumentException("Longitud inválida");
        }
    }
    
    public function distanciaA(Coordenada $otra): float {
        // Fórmula de Haversine simplificada
        $deltaLat = deg2rad($otra->latitud - $this->latitud);
        $deltaLon = deg2rad($otra->longitud - $this->longitud);
        
        $a = sin($deltaLat / 2) ** 2 +
             cos(deg2rad($this->latitud)) * 
             cos(deg2rad($otra->latitud)) *
             sin($deltaLon / 2) ** 2;
        
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return 6371 * $c;  // Radio de la Tierra en km
    }
}

$madrid = new Coordenada(40.4168, -3.7038, "Madrid");
$barcelona = new Coordenada(41.3851, 2.1734, "Barcelona");

echo $madrid->distanciaA($barcelona);  // ~504 km

// ❌ No se puede modificar (readonly)
// $madrid->latitud = 50;  // Error
?&gt;</code></pre></div>

        <h3>Con Herencia</h3>
        <div class="code-block"><pre><code>&lt;?php
class Persona {
    public function __construct(
        public string $nombre,
        public int $edad
    ) {}
}

class Estudiante extends Persona {
    public function __construct(
        string $nombre,
        int $edad,
        public string $matricula,
        public string $carrera
    ) {
        // Llamar al constructor padre
        parent::__construct($nombre, $edad);
    }
    
    public function getInfo(): string {
        return "{$this->nombre} - {$this->carrera} ({$this->matricula})";
    }
}

$estudiante = new Estudiante("Carlos", 20, "EST-2024-001", "Ingeniería");
echo $estudiante->nombre;     // "Carlos" (heredado)
echo $estudiante->matricula;  // "EST-2024-001"
echo $estudiante->getInfo();  // "Carlos - Ingeniería (EST-2024-001)"
?&gt;</code></pre></div>

        <h3>Ejemplo Completo: Sistema de E-commerce</h3>
        <div class="code-block"><pre><code>&lt;?php
readonly class Direccion {
    public function __construct(
        public string $calle,
        public string $ciudad,
        public string $codigoPostal,
        public string $pais = 'España'
    ) {}
    
    public function formato(): string {
        return "{$this->calle}, {$this->ciudad} {$this->codigoPostal}, {$this->pais}";
    }
}

class Cliente {
    private array $pedidos = [];
    
    public function __construct(
        public readonly int $id,
        public readonly string $nombre,
        public readonly string $email,
        public readonly Direccion $direccion,
        private bool $activo = true
    ) {}
    
    public function agregarPedido(Pedido $pedido): void {
        $this->pedidos[] = $pedido;
    }
    
    public function getPedidos(): array {
        return $this->pedidos;
    }
    
    public function isActivo(): bool {
        return $this->activo;
    }
    
    public function desactivar(): void {
        $this->activo = false;
    }
}

class ItemPedido {
    public function __construct(
        public readonly string $producto,
        public readonly float $precio,
        public readonly int $cantidad
    ) {}
    
    public function getSubtotal(): float {
        return $this->precio * $this->cantidad;
    }
}

class Pedido {
    private array $items = [];
    
    public function __construct(
        public readonly int $id,
        public readonly Cliente $cliente,
        public readonly DateTime $fecha
    ) {}
    
    public function agregarItem(ItemPedido $item): void {
        $this->items[] = $item;
    }
    
    public function getTotal(): float {
        return array_reduce(
            $this->items,
            fn($total, $item) => $total + $item->getSubtotal(),
            0
        );
    }
    
    public function getItems(): array {
        return $this->items;
    }
}

// Uso del sistema
$direccion = new Direccion("Calle Mayor 1", "Madrid", "28001");
$cliente = new Cliente(1, "Juan Pérez", "juan@example.com", $direccion);

$pedido = new Pedido(1, $cliente, new DateTime());
$pedido->agregarItem(new ItemPedido("Laptop", 999.99, 1));
$pedido->agregarItem(new ItemPedido("Mouse", 29.99, 2));

$cliente->agregarPedido($pedido);

echo "Cliente: {$cliente->nombre}\\n";
echo "Dirección: {$cliente->direccion->formato()}\\n";
echo "Total pedido: €" . number_format($pedido->getTotal(), 2);
// Cliente: Juan Pérez
// Dirección: Calle Mayor 1, Madrid 28001, España
// Total pedido: €1059.97
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Mejores Prácticas:</strong><br>
            • <strong>Usa siempre</strong>: En PHP 8+ para constructores simples<br>
            • <strong>Readonly</strong>: Combina con readonly para inmutabilidad<br>
            • <strong>Visibilidad</strong>: Usa private/protected por defecto<br>
            • <strong>Validación</strong>: Añade lógica de validación en el constructor<br>
            • <strong>Named arguments</strong>: Combina con named arguments para claridad<br>
            • <strong>DTOs</strong>: Perfecto para Data Transfer Objects<br>
            • <strong>Value Objects</strong>: Ideal para objetos inmutables
        </div>

        <div class="warning-box">
            <strong>⚠️ Limitaciones:</strong><br>
            • NO puedes usar <code>var</code> (solo public, protected, private)<br>
            • NO puedes declarar propiedades promocionadas como static<br>
            • NO puedes usar el mismo nombre para promocionada y tradicional<br>
            • Las propiedades promocionadas NO pueden tener valores calculados<br>
            • Si necesitas lógica compleja, usa propiedades tradicionales
        </div>

        <div class="info-box">
            <strong>💡 Resumen:</strong><br>
            • <strong>Sintaxis</strong>: <code>public function __construct(private Type $prop) {}</code><br>
            • <strong>PHP 8.0+</strong>: Constructor Property Promotion<br>
            • <strong>PHP 8.1+</strong>: Compatible con readonly<br>
            • <strong>PHP 8.2+</strong>: Clases readonly completas<br>
            • <strong>Ventaja</strong>: Reduce código repetitivo hasta 70%<br>
            • <strong>Uso ideal</strong>: DTOs, Value Objects, entidades simples
        </div>
    `,
    'atributos': `
        <h1>Atributos (PHP 8+) y su uso</h1>
        
        <p>Los <strong>atributos</strong> (anteriormente llamados "anotaciones") permiten añadir metadatos estructurados a clases, métodos, propiedades y parámetros. Son una alternativa moderna a los docblocks.</p>

        <div class="info-box">
            <strong>💡 Conceptos Clave:</strong><br>
            • <strong>Metadatos estructurados</strong>: Información sobre el código<br>
            • <strong>Sintaxis nativa</strong>: <code>#[Atributo]</code> en lugar de docblocks<br>
            • <strong>Reflexión</strong>: Accesibles mediante Reflection API<br>
            • <strong>Tipado</strong>: Clases PHP normales con validación<br>
            • <strong>Múltiples targets</strong>: Clases, métodos, propiedades, parámetros, constantes
        </div>

        <h3>Sintaxis Básica</h3>
        <div class="code-block"><pre><code>&lt;?php
// Definir un atributo
#[Attribute]
class Ruta {
    public function __construct(
        public string $path,
        public string $metodo = 'GET'
    ) {}
}

// Usar el atributo
#[Ruta('/usuarios', 'GET')]
class UsuarioController {
    #[Ruta('/usuarios/{id}', 'GET')]
    public function mostrar(int $id) {
        return "Usuario $id";
    }
    
    #[Ruta('/usuarios', 'POST')]
    public function crear() {
        return "Crear usuario";
    }
}

// Leer atributos con Reflection
$reflection = new ReflectionClass(UsuarioController::class);
$atributos = $reflection->getAttributes(Ruta::class);

foreach ($atributos as $atributo) {
    $instancia = $atributo->newInstance();
    echo "{$instancia->metodo} {$instancia->path}\\n";
}
// GET /usuarios
?&gt;</code></pre></div>

        <h3>Targets de Atributos</h3>
        <div class="code-block"><pre><code>&lt;?php
// Atributo solo para clases
#[Attribute(Attribute::TARGET_CLASS)]
class Entidad {
    public function __construct(public string $tabla) {}
}

// Atributo solo para métodos
#[Attribute(Attribute::TARGET_METHOD)]
class Cache {
    public function __construct(public int $ttl = 3600) {}
}

// Atributo solo para propiedades
#[Attribute(Attribute::TARGET_PROPERTY)]
class Columna {
    public function __construct(
        public string $nombre,
        public string $tipo = 'string'
    ) {}
}

// Atributo para múltiples targets
#[Attribute(Attribute::TARGET_CLASS | Attribute::TARGET_METHOD)]
class Deprecated {
    public function __construct(public string $mensaje = '') {}
}

// Atributo repetible
#[Attribute(Attribute::TARGET_METHOD | Attribute::IS_REPEATABLE)]
class Validar {
    public function __construct(public string $regla) {}
}

// Uso
#[Entidad('usuarios')]
class Usuario {
    #[Columna('id', 'int')]
    public int $id;
    
    #[Columna('nombre', 'string')]
    public string $nombre;
    
    #[Deprecated('Usar getNombreCompleto()')]
    public function getNombre(): string {
        return $this->nombre;
    }
    
    #[Cache(ttl: 1800)]
    #[Validar('required')]
    #[Validar('min:3')]
    #[Validar('max:50')]
    public function getNombreCompleto(): string {
        return $this->nombre;
    }
}
?&gt;</code></pre></div>

        <h3>Atributos para Validación</h3>
        <div class="code-block"><pre><code>&lt;?php
#[Attribute(Attribute::TARGET_PROPERTY)]
class Required {
    public function __construct(public string $mensaje = 'Campo requerido') {}
}

#[Attribute(Attribute::TARGET_PROPERTY)]
class Email {
    public function __construct(public string $mensaje = 'Email inválido') {}
}

#[Attribute(Attribute::TARGET_PROPERTY)]
class MinLength {
    public function __construct(
        public int $min,
        public string $mensaje = 'Muy corto'
    ) {}
}

#[Attribute(Attribute::TARGET_PROPERTY)]
class MaxLength {
    public function __construct(
        public int $max,
        public string $mensaje = 'Muy largo'
    ) {}
}

#[Attribute(Attribute::TARGET_PROPERTY)]
class Range {
    public function __construct(
        public int $min,
        public int $max,
        public string $mensaje = 'Fuera de rango'
    ) {}
}

class RegistroDTO {
    #[Required]
    #[MinLength(3, 'Nombre debe tener al menos 3 caracteres')]
    #[MaxLength(50)]
    public string $nombre;
    
    #[Required]
    #[Email]
    public string $email;
    
    #[Required]
    #[MinLength(8, 'Password debe tener al menos 8 caracteres')]
    public string $password;
    
    #[Range(18, 100, 'Edad debe estar entre 18 y 100')]
    public int $edad;
}

// Validador simple
class Validador {
    public function validar(object $objeto): array {
        $errores = [];
        $reflection = new ReflectionClass($objeto);
        
        foreach ($reflection->getProperties() as $propiedad) {
            $nombre = $propiedad->getName();
            $valor = $propiedad->getValue($objeto);
            
            foreach ($propiedad->getAttributes() as $atributo) {
                $instancia = $atributo->newInstance();
                
                if ($instancia instanceof Required && empty($valor)) {
                    $errores[$nombre][] = $instancia->mensaje;
                }
                
                if ($instancia instanceof Email && !filter_var($valor, FILTER_VALIDATE_EMAIL)) {
                    $errores[$nombre][] = $instancia->mensaje;
                }
                
                if ($instancia instanceof MinLength && strlen($valor) < $instancia->min) {
                    $errores[$nombre][] = $instancia->mensaje;
                }
                
                if ($instancia instanceof MaxLength && strlen($valor) > $instancia->max) {
                    $errores[$nombre][] = $instancia->mensaje;
                }
                
                if ($instancia instanceof Range) {
                    if ($valor < $instancia->min || $valor > $instancia->max) {
                        $errores[$nombre][] = $instancia->mensaje;
                    }
                }
            }
        }
        
        return $errores;
    }
}

// Uso
$registro = new RegistroDTO();
$registro->nombre = "An";  // Muy corto
$registro->email = "invalido";
$registro->password = "123";  // Muy corto
$registro->edad = 15;  // Fuera de rango

$validador = new Validador();
$errores = $validador->validar($registro);
print_r($errores);
?&gt;</code></pre></div>

        <h3>Atributos para Routing</h3>
        <div class="code-block"><pre><code>&lt;?php
#[Attribute(Attribute::TARGET_CLASS)]
class Controller {
    public function __construct(public string $prefijo = '') {}
}

#[Attribute(Attribute::TARGET_METHOD | Attribute::IS_REPEATABLE)]
class Route {
    public function __construct(
        public string $path,
        public string $metodo = 'GET',
        public string $nombre = ''
    ) {}
}

#[Attribute(Attribute::TARGET_METHOD)]
class Middleware {
    public function __construct(public array $middlewares = []) {}
}

#[Controller('/api/productos')]
class ProductoController {
    #[Route('/', 'GET', 'productos.index')]
    #[Middleware(['auth'])]
    public function index() {
        return ['productos' => []];
    }
    
    #[Route('/{id}', 'GET', 'productos.show')]
    #[Route('/{id}/detalles', 'GET')]
    #[Middleware(['auth'])]
    public function show(int $id) {
        return ['producto' => ['id' => $id]];
    }
    
    #[Route('/', 'POST', 'productos.store')]
    #[Middleware(['auth', 'admin'])]
    public function store() {
        return ['mensaje' => 'Producto creado'];
    }
    
    #[Route('/{id}', 'PUT', 'productos.update')]
    #[Middleware(['auth', 'admin'])]
    public function update(int $id) {
        return ['mensaje' => "Producto $id actualizado"];
    }
    
    #[Route('/{id}', 'DELETE', 'productos.destroy')]
    #[Middleware(['auth', 'admin'])]
    public function destroy(int $id) {
        return ['mensaje' => "Producto $id eliminado"];
    }
}

// Router simple
class Router {
    private array $rutas = [];
    
    public function registrarControlador(string $clase): void {
        $reflection = new ReflectionClass($clase);
        
        // Obtener prefijo del controlador
        $prefijo = '';
        $atributosClase = $reflection->getAttributes(Controller::class);
        if (!empty($atributosClase)) {
            $prefijo = $atributosClase[0]->newInstance()->prefijo;
        }
        
        // Registrar rutas de métodos
        foreach ($reflection->getMethods() as $metodo) {
            $atributosRuta = $metodo->getAttributes(Route::class);
            
            foreach ($atributosRuta as $atributoRuta) {
                $ruta = $atributoRuta->newInstance();
                $pathCompleto = $prefijo . $ruta->path;
                
                // Obtener middlewares
                $middlewares = [];
                $atributosMiddleware = $metodo->getAttributes(Middleware::class);
                if (!empty($atributosMiddleware)) {
                    $middlewares = $atributosMiddleware[0]->newInstance()->middlewares;
                }
                
                $this->rutas[] = [
                    'metodo' => $ruta->metodo,
                    'path' => $pathCompleto,
                    'nombre' => $ruta->nombre,
                    'handler' => [$clase, $metodo->getName()],
                    'middlewares' => $middlewares
                ];
            }
        }
    }
    
    public function getRutas(): array {
        return $this->rutas;
    }
}

// Uso
$router = new Router();
$router->registrarControlador(ProductoController::class);

foreach ($router->getRutas() as $ruta) {
    echo "{$ruta['metodo']} {$ruta['path']}";
    if (!empty($ruta['middlewares'])) {
        echo " [" . implode(', ', $ruta['middlewares']) . "]";
    }
    echo "\\n";
}
?&gt;</code></pre></div>

        <h3>Atributos para ORM/Serialización</h3>
        <div class="code-block"><pre><code>&lt;?php
#[Attribute(Attribute::TARGET_CLASS)]
class Table {
    public function __construct(public string $nombre) {}
}

#[Attribute(Attribute::TARGET_PROPERTY)]
class Column {
    public function __construct(
        public string $nombre,
        public string $tipo = 'string',
        public bool $nullable = false,
        public bool $unique = false
    ) {}
}

#[Attribute(Attribute::TARGET_PROPERTY)]
class PrimaryKey {
    public function __construct(public bool $autoIncrement = true) {}
}

#[Attribute(Attribute::TARGET_PROPERTY)]
class JsonIgnore {}

#[Table('usuarios')]
class Usuario {
    #[PrimaryKey]
    #[Column('id', 'int')]
    public int $id;
    
    #[Column('nombre', 'string', nullable: false)]
    public string $nombre;
    
    #[Column('email', 'string', unique: true)]
    public string $email;
    
    #[Column('password', 'string')]
    #[JsonIgnore]  // No incluir en JSON
    public string $password;
    
    #[Column('activo', 'bool')]
    public bool $activo = true;
    
    #[Column('created_at', 'datetime')]
    public DateTime $createdAt;
}

// Generador de SQL
class SchemaGenerator {
    public function generarCreateTable(string $clase): string {
        $reflection = new ReflectionClass($clase);
        
        // Obtener nombre de tabla
        $atributosTabla = $reflection->getAttributes(Table::class);
        $nombreTabla = $atributosTabla[0]->newInstance()->nombre;
        
        $columnas = [];
        
        foreach ($reflection->getProperties() as $propiedad) {
            $atributosColumna = $propiedad->getAttributes(Column::class);
            if (empty($atributosColumna)) continue;
            
            $columna = $atributosColumna[0]->newInstance();
            $sql = "{$columna->nombre} {$columna->tipo}";
            
            // Primary key
            if (!empty($propiedad->getAttributes(PrimaryKey::class))) {
                $sql .= " PRIMARY KEY";
                $pk = $propiedad->getAttributes(PrimaryKey::class)[0]->newInstance();
                if ($pk->autoIncrement) {
                    $sql .= " AUTO_INCREMENT";
                }
            }
            
            if (!$columna->nullable) {
                $sql .= " NOT NULL";
            }
            
            if ($columna->unique) {
                $sql .= " UNIQUE";
            }
            
            $columnas[] = $sql;
        }
        
        return "CREATE TABLE {$nombreTabla} (\\n  " . 
               implode(",\\n  ", $columnas) . 
               "\\n);";
    }
}

// Serializador JSON
class JsonSerializer {
    public function toJson(object $objeto): string {
        $reflection = new ReflectionClass($objeto);
        $data = [];
        
        foreach ($reflection->getProperties() as $propiedad) {
            // Ignorar propiedades con JsonIgnore
            if (!empty($propiedad->getAttributes(JsonIgnore::class))) {
                continue;
            }
            
            $nombre = $propiedad->getName();
            $valor = $propiedad->getValue($objeto);
            
            if ($valor instanceof DateTime) {
                $valor = $valor->format('Y-m-d H:i:s');
            }
            
            $data[$nombre] = $valor;
        }
        
        return json_encode($data, JSON_PRETTY_PRINT);
    }
}

// Uso
$generator = new SchemaGenerator();
echo $generator->generarCreateTable(Usuario::class);

$usuario = new Usuario();
$usuario->id = 1;
$usuario->nombre = "Juan";
$usuario->email = "juan@example.com";
$usuario->password = "secret123";  // No aparecerá en JSON
$usuario->createdAt = new DateTime();

$serializer = new JsonSerializer();
echo $serializer->toJson($usuario);
?&gt;</code></pre></div>

        <h3>Atributos Personalizados Avanzados</h3>
        <div class="code-block"><pre><code>&lt;?php
#[Attribute(Attribute::TARGET_METHOD)]
class RateLimit {
    public function __construct(
        public int $maxIntentos,
        public int $ventanaSegundos = 60
    ) {}
}

#[Attribute(Attribute::TARGET_METHOD)]
class RequiresPermission {
    public function __construct(public string $permiso) {}
}

#[Attribute(Attribute::TARGET_CLASS | Attribute::TARGET_METHOD)]
class Log {
    public function __construct(
        public string $nivel = 'info',
        public string $mensaje = ''
    ) {}
}

#[Attribute(Attribute::TARGET_PROPERTY)]
class Encrypt {}

#[Attribute(Attribute::TARGET_PROPERTY)]
class Computed {
    public function __construct(public string $metodo) {}
}

#[Log('info', 'API de pagos')]
class PagoController {
    #[RateLimit(maxIntentos: 5, ventanaSegundos: 60)]
    #[RequiresPermission('pagos.crear')]
    #[Log('warning', 'Intento de pago')]
    public function procesarPago(float $monto) {
        return ['monto' => $monto, 'estado' => 'procesado'];
    }
}

class DatosSensibles {
    #[Encrypt]
    public string $numeroTarjeta;
    
    #[Encrypt]
    public string $cvv;
    
    public string $titular;
    
    #[Computed('calcularExpiracion')]
    public ?DateTime $expiracion = null;
    
    private function calcularExpiracion(): DateTime {
        return new DateTime('+5 years');
    }
}

// Procesador de atributos
class AttributeProcessor {
    public function procesarObjeto(object $objeto): void {
        $reflection = new ReflectionClass($objeto);
        
        foreach ($reflection->getProperties() as $propiedad) {
            // Procesar Encrypt
            if (!empty($propiedad->getAttributes(Encrypt::class))) {
                $valor = $propiedad->getValue($objeto);
                if ($valor) {
                    $encriptado = base64_encode($valor);  // Simplificado
                    $propiedad->setValue($objeto, $encriptado);
                }
            }
            
            // Procesar Computed
            $atributosComputed = $propiedad->getAttributes(Computed::class);
            if (!empty($atributosComputed)) {
                $computed = $atributosComputed[0]->newInstance();
                $metodo = $reflection->getMethod($computed->metodo);
                $metodo->setAccessible(true);
                $valor = $metodo->invoke($objeto);
                $propiedad->setValue($objeto, $valor);
            }
        }
    }
}

// Uso
$datos = new DatosSensibles();
$datos->numeroTarjeta = "4532123456789012";
$datos->cvv = "123";
$datos->titular = "Juan Pérez";

$processor = new AttributeProcessor();
$processor->procesarObjeto($datos);

echo $datos->numeroTarjeta;  // NDUzMjEyMzQ1Njc4OTAxMg== (encriptado)
echo $datos->expiracion->format('Y-m-d');  // Fecha calculada
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Mejores Prácticas:</strong><br>
            • <strong>Usa atributos</strong>: En lugar de docblocks para metadatos<br>
            • <strong>Define targets</strong>: Especifica dónde se puede usar el atributo<br>
            • <strong>Valida en constructor</strong>: Valida parámetros del atributo<br>
            • <strong>Nombra claramente</strong>: Nombres descriptivos y específicos<br>
            • <strong>Documenta</strong>: Explica el propósito y uso del atributo<br>
            • <strong>Combina con Reflection</strong>: Para leer y procesar atributos<br>
            • <strong>Reutiliza</strong>: Crea bibliotecas de atributos comunes
        </div>

        <div class="warning-box">
            <strong>⚠️ Consideraciones:</strong><br>
            • Los atributos NO se ejecutan automáticamente<br>
            • Necesitas Reflection API para leerlos<br>
            • Impacto en rendimiento si usas mucha reflexión<br>
            • NO reemplazan toda la funcionalidad de docblocks<br>
            • Disponibles solo desde PHP 8.0+<br>
            • Considera cachear resultados de reflexión
        </div>

        <div class="info-box">
            <strong>💡 Resumen:</strong><br>
            • <strong>Sintaxis</strong>: <code>#[Atributo(parametros)]</code><br>
            • <strong>Definir</strong>: <code>#[Attribute]</code> en la clase<br>
            • <strong>Targets</strong>: CLASS, METHOD, PROPERTY, PARAMETER, etc.<br>
            • <strong>Repetible</strong>: <code>Attribute::IS_REPEATABLE</code><br>
            • <strong>Leer</strong>: <code>$reflection->getAttributes()</code><br>
            • <strong>Instanciar</strong>: <code>$atributo->newInstance()</code><br>
            • <strong>Casos de uso</strong>: Routing, validación, ORM, serialización
        </div>
    `,
    'enumeraciones': `
        <h1>Enumeraciones (Enums) (PHP 8.1+)</h1>
        
        <p>Las <strong>enumeraciones</strong> permiten definir un tipo con un conjunto fijo de valores posibles. Son perfectas para representar estados, opciones o categorías.</p>

        <div class="info-box">
            <strong>💡 Conceptos Clave:</strong><br>
            • <strong>Pure Enums</strong>: Sin valores asociados (solo nombres)<br>
            • <strong>Backed Enums</strong>: Con valores string o int asociados<br>
            • <strong>Type-safe</strong>: Validación de tipos en tiempo de compilación<br>
            • <strong>Métodos</strong>: Pueden tener métodos propios<br>
            • <strong>Interfaces</strong>: Pueden implementar interfaces
        </div>

        <h3>Pure Enums (Sin Valores)</h3>
        <div class="code-block"><pre><code>&lt;?php
// Enum básico sin valores
enum Estado {
    case Pendiente;
    case EnProceso;
    case Completado;
    case Cancelado;
}

// Uso
function procesarPedido(Estado $estado): string {
    return match($estado) {
        Estado::Pendiente => "Esperando procesamiento",
        Estado::EnProceso => "Procesando pedido",
        Estado::Completado => "Pedido completado",
        Estado::Cancelado => "Pedido cancelado"
    };
}

$estado = Estado::Pendiente;
echo procesarPedido($estado);  // "Esperando procesamiento"

// Comparación
if ($estado === Estado::Pendiente) {
    echo "El pedido está pendiente";
}

// Obtener nombre
echo $estado->name;  // "Pendiente"
?&gt;</code></pre></div>

        <h3>Backed Enums (Con Valores String)</h3>
        <div class="code-block"><pre><code>&lt;?php
enum EstadoPedido: string {
    case Pendiente = 'pending';
    case EnProceso = 'processing';
    case Completado = 'completed';
    case Cancelado = 'cancelled';
    case Reembolsado = 'refunded';
}

// Uso
$estado = EstadoPedido::Pendiente;
echo $estado->value;  // "pending"
echo $estado->name;   // "Pendiente"

// Crear desde valor
$estadoDesdeDB = EstadoPedido::from('completed');
echo $estadoDesdeDB->name;  // "Completado"

// tryFrom: retorna null si no existe
$estadoInvalido = EstadoPedido::tryFrom('invalid');
var_dump($estadoInvalido);  // NULL

// Guardar en base de datos
function guardarPedido(int $id, EstadoPedido $estado): void {
    $valorDB = $estado->value;  // 'pending', 'processing', etc.
    echo "INSERT INTO pedidos (id, estado) VALUES ($id, '$valorDB')";
}

guardarPedido(1, EstadoPedido::Pendiente);
?&gt;</code></pre></div>

        <h3>Backed Enums (Con Valores Int)</h3>
        <div class="code-block"><pre><code>&lt;?php
enum Prioridad: int {
    case Baja = 1;
    case Media = 2;
    case Alta = 3;
    case Urgente = 4;
    case Critica = 5;
}

// Uso
$prioridad = Prioridad::Alta;
echo $prioridad->value;  // 3
echo $prioridad->name;   // "Alta"

// Comparación de valores
if ($prioridad->value >= Prioridad::Alta->value) {
    echo "Prioridad alta o superior";
}

// Crear desde valor
$prioridadDesdeForm = Prioridad::from(4);
echo $prioridadDesdeForm->name;  // "Urgente"

// Ordenar por prioridad
$tareas = [
    ['nombre' => 'Tarea 1', 'prioridad' => Prioridad::Baja],
    ['nombre' => 'Tarea 2', 'prioridad' => Prioridad::Urgente],
    ['nombre' => 'Tarea 3', 'prioridad' => Prioridad::Media],
];

usort($tareas, fn($a, $b) => $b['prioridad']->value <=> $a['prioridad']->value);

foreach ($tareas as $tarea) {
    echo "{$tarea['nombre']}: {$tarea['prioridad']->name}\\n";
}
?&gt;</code></pre></div>

        <h3>Enums con Métodos</h3>
        <div class="code-block"><pre><code>&lt;?php
enum TipoUsuario: string {
    case Admin = 'admin';
    case Editor = 'editor';
    case Autor = 'author';
    case Suscriptor = 'subscriber';
    
    // Método para obtener permisos
    public function getPermisos(): array {
        return match($this) {
            self::Admin => ['crear', 'editar', 'eliminar', 'publicar', 'gestionar_usuarios'],
            self::Editor => ['crear', 'editar', 'eliminar', 'publicar'],
            self::Autor => ['crear', 'editar'],
            self::Suscriptor => ['leer']
        };
    }
    
    // Método para verificar permiso
    public function tienePermiso(string $permiso): bool {
        return in_array($permiso, $this->getPermisos());
    }
    
    // Método para obtener label
    public function getLabel(): string {
        return match($this) {
            self::Admin => 'Administrador',
            self::Editor => 'Editor',
            self::Autor => 'Autor',
            self::Suscriptor => 'Suscriptor'
        };
    }
    
    // Método estático
    public static function porDefecto(): self {
        return self::Suscriptor;
    }
}

// Uso
$usuario = TipoUsuario::Editor;
echo $usuario->getLabel();  // "Editor"

if ($usuario->tienePermiso('publicar')) {
    echo "Puede publicar";
}

$permisos = $usuario->getPermisos();
print_r($permisos);  // ['crear', 'editar', 'eliminar', 'publicar']

$nuevoUsuario = TipoUsuario::porDefecto();
echo $nuevoUsuario->value;  // "subscriber"
?&gt;</code></pre></div>

        <h3>Enums con Interfaces</h3>
        <div class="code-block"><pre><code>&lt;?php
interface Coloreable {
    public function getColor(): string;
    public function getIcono(): string;
}

enum EstadoTarea: string implements Coloreable {
    case Pendiente = 'pending';
    case EnProgreso = 'in_progress';
    case Completada = 'completed';
    case Bloqueada = 'blocked';
    
    public function getColor(): string {
        return match($this) {
            self::Pendiente => '#gray',
            self::EnProgreso => '#blue',
            self::Completada => '#green',
            self::Bloqueada => '#red'
        };
    }
    
    public function getIcono(): string {
        return match($this) {
            self::Pendiente => '⏳',
            self::EnProgreso => '🔄',
            self::Completada => '✅',
            self::Bloqueada => '🚫'
        };
    }
    
    public function puedeTransicionarA(self $nuevoEstado): bool {
        return match($this) {
            self::Pendiente => in_array($nuevoEstado, [self::EnProgreso, self::Bloqueada]),
            self::EnProgreso => in_array($nuevoEstado, [self::Completada, self::Bloqueada]),
            self::Bloqueada => $nuevoEstado === self::Pendiente,
            self::Completada => false  // No se puede cambiar desde completada
        };
    }
}

// Uso
$estado = EstadoTarea::EnProgreso;
echo $estado->getIcono() . " " . $estado->name;  // "🔄 EnProgreso"
echo "Color: " . $estado->getColor();  // "Color: #blue"

// Validar transición
if ($estado->puedeTransicionarA(EstadoTarea::Completada)) {
    echo "Puede marcar como completada";
}
?&gt;</code></pre></div>

        <h3>Listar Todos los Casos</h3>
        <div class="code-block"><pre><code>&lt;?php
enum DiaSemana: int {
    case Lunes = 1;
    case Martes = 2;
    case Miercoles = 3;
    case Jueves = 4;
    case Viernes = 5;
    case Sabado = 6;
    case Domingo = 7;
    
    public function esFinDeSemana(): bool {
        return $this === self::Sabado || $this === self::Domingo;
    }
    
    public function esLaboral(): bool {
        return !$this->esFinDeSemana();
    }
}

// Obtener todos los casos
$dias = DiaSemana::cases();
echo "Total de días: " . count($dias) . "\\n";

foreach ($dias as $dia) {
    $tipo = $dia->esLaboral() ? "Laboral" : "Fin de semana";
    echo "{$dia->name} ({$dia->value}): {$tipo}\\n";
}

// Filtrar casos
$diasLaborales = array_filter(
    DiaSemana::cases(),
    fn($dia) => $dia->esLaboral()
);

echo "Días laborales: " . count($diasLaborales);
?&gt;</code></pre></div>

        <h3>Enums en Clases</h3>
        <div class="code-block"><pre><code>&lt;?php
enum MetodoPago: string {
    case Tarjeta = 'card';
    case PayPal = 'paypal';
    case Transferencia = 'transfer';
    case Efectivo = 'cash';
    case Cripto = 'crypto';
    
    public function getComision(): float {
        return match($this) {
            self::Tarjeta => 0.029,      // 2.9%
            self::PayPal => 0.034,       // 3.4%
            self::Transferencia => 0.01, // 1%
            self::Efectivo => 0.0,       // 0%
            self::Cripto => 0.015        // 1.5%
        };
    }
    
    public function requiereVerificacion(): bool {
        return match($this) {
            self::Tarjeta, self::Cripto => true,
            default => false
        };
    }
}

class Pago {
    public function __construct(
        public readonly float $monto,
        public readonly MetodoPago $metodo,
        public readonly DateTime $fecha
    ) {}
    
    public function calcularComision(): float {
        return $this->monto * $this->metodo->getComision();
    }
    
    public function getTotal(): float {
        return $this->monto + $this->calcularComision();
    }
    
    public function getDetalles(): array {
        return [
            'monto' => $this->monto,
            'metodo' => $this->metodo->name,
            'metodo_valor' => $this->metodo->value,
            'comision' => $this->calcularComision(),
            'total' => $this->getTotal(),
            'requiere_verificacion' => $this->metodo->requiereVerificacion(),
            'fecha' => $this->fecha->format('Y-m-d H:i:s')
        ];
    }
}

// Uso
$pago = new Pago(100.0, MetodoPago::Tarjeta, new DateTime());
echo "Total: $" . $pago->getTotal();  // $102.90
echo "Comisión: $" . $pago->calcularComision();  // $2.90

print_r($pago->getDetalles());
?&gt;</code></pre></div>

        <h3>Enums con Traits</h3>
        <div class="code-block"><pre><code>&lt;?php
trait EnumHelper {
    public static function nombres(): array {
        return array_map(fn($case) => $case->name, self::cases());
    }
    
    public static function valores(): array {
        return array_map(fn($case) => $case->value, self::cases());
    }
    
    public static function opciones(): array {
        $opciones = [];
        foreach (self::cases() as $case) {
            $opciones[$case->value] = $case->name;
        }
        return $opciones;
    }
    
    public static function random(): self {
        $cases = self::cases();
        return $cases[array_rand($cases)];
    }
}

enum Moneda: string {
    use EnumHelper;
    
    case USD = 'usd';
    case EUR = 'eur';
    case GBP = 'gbp';
    case JPY = 'jpy';
    case MXN = 'mxn';
    
    public function getSimbolo(): string {
        return match($this) {
            self::USD => '$',
            self::EUR => '€',
            self::GBP => '£',
            self::JPY => '¥',
            self::MXN => '$'
        };
    }
}

// Uso del trait
print_r(Moneda::nombres());   // ['USD', 'EUR', 'GBP', 'JPY', 'MXN']
print_r(Moneda::valores());   // ['usd', 'eur', 'gbp', 'jpy', 'mxn']
print_r(Moneda::opciones());  // ['usd' => 'USD', 'eur' => 'EUR', ...]

$monedaAleatoria = Moneda::random();
echo $monedaAleatoria->getSimbolo();
?&gt;</code></pre></div>

        <h3>Ejemplo Completo: Sistema de Pedidos</h3>
        <div class="code-block"><pre><code>&lt;?php
enum EstadoPedido: string {
    case Borrador = 'draft';
    case Pendiente = 'pending';
    case Confirmado = 'confirmed';
    case Preparando = 'preparing';
    case EnCamino = 'shipping';
    case Entregado = 'delivered';
    case Cancelado = 'cancelled';
    case Devuelto = 'returned';
    
    public function getColor(): string {
        return match($this) {
            self::Borrador => 'gray',
            self::Pendiente => 'yellow',
            self::Confirmado => 'blue',
            self::Preparando => 'cyan',
            self::EnCamino => 'purple',
            self::Entregado => 'green',
            self::Cancelado => 'red',
            self::Devuelto => 'orange'
        };
    }
    
    public function getDescripcion(): string {
        return match($this) {
            self::Borrador => 'Pedido en borrador',
            self::Pendiente => 'Esperando confirmación de pago',
            self::Confirmado => 'Pago confirmado, preparando envío',
            self::Preparando => 'Preparando tu pedido',
            self::EnCamino => 'Tu pedido está en camino',
            self::Entregado => 'Pedido entregado',
            self::Cancelado => 'Pedido cancelado',
            self::Devuelto => 'Pedido devuelto'
        };
    }
    
    public function puedeTransicionarA(self $nuevo): bool {
        return match($this) {
            self::Borrador => in_array($nuevo, [self::Pendiente, self::Cancelado]),
            self::Pendiente => in_array($nuevo, [self::Confirmado, self::Cancelado]),
            self::Confirmado => in_array($nuevo, [self::Preparando, self::Cancelado]),
            self::Preparando => in_array($nuevo, [self::EnCamino, self::Cancelado]),
            self::EnCamino => in_array($nuevo, [self::Entregado]),
            self::Entregado => in_array($nuevo, [self::Devuelto]),
            self::Cancelado, self::Devuelto => false
        };
    }
    
    public function esEditable(): bool {
        return in_array($this, [self::Borrador, self::Pendiente]);
    }
    
    public function esCancelable(): bool {
        return in_array($this, [
            self::Borrador,
            self::Pendiente,
            self::Confirmado,
            self::Preparando
        ]);
    }
    
    public function esFinal(): bool {
        return in_array($this, [self::Entregado, self::Cancelado, self::Devuelto]);
    }
}

class Pedido {
    private EstadoPedido $estado;
    private array $historialEstados = [];
    
    public function __construct(
        public readonly int $id,
        public readonly float $total
    ) {
        $this->estado = EstadoPedido::Borrador;
        $this->registrarCambioEstado($this->estado);
    }
    
    public function getEstado(): EstadoPedido {
        return $this->estado;
    }
    
    public function cambiarEstado(EstadoPedido $nuevoEstado): void {
        if (!$this->estado->puedeTransicionarA($nuevoEstado)) {
            throw new RuntimeException(
                "No se puede cambiar de {$this->estado->name} a {$nuevoEstado->name}"
            );
        }
        
        $this->estado = $nuevoEstado;
        $this->registrarCambioEstado($nuevoEstado);
    }
    
    private function registrarCambioEstado(EstadoPedido $estado): void {
        $this->historialEstados[] = [
            'estado' => $estado,
            'fecha' => new DateTime()
        ];
    }
    
    public function getHistorial(): array {
        return $this->historialEstados;
    }
    
    public function puedeEditar(): bool {
        return $this->estado->esEditable();
    }
    
    public function puedeCancelar(): bool {
        return $this->estado->esCancelable();
    }
    
    public function getInfo(): array {
        return [
            'id' => $this->id,
            'total' => $this->total,
            'estado' => $this->estado->name,
            'estado_valor' => $this->estado->value,
            'color' => $this->estado->getColor(),
            'descripcion' => $this->estado->getDescripcion(),
            'puede_editar' => $this->puedeEditar(),
            'puede_cancelar' => $this->puedeCancelar(),
            'es_final' => $this->estado->esFinal()
        ];
    }
}

// Uso
$pedido = new Pedido(1, 150.00);
echo "Estado inicial: {$pedido->getEstado()->name}\\n";

try {
    $pedido->cambiarEstado(EstadoPedido::Pendiente);
    echo "✅ Cambio a Pendiente\\n";
    
    $pedido->cambiarEstado(EstadoPedido::Confirmado);
    echo "✅ Cambio a Confirmado\\n";
    
    $pedido->cambiarEstado(EstadoPedido::Preparando);
    echo "✅ Cambio a Preparando\\n";
    
    // Intentar cambio inválido
    $pedido->cambiarEstado(EstadoPedido::Borrador);
} catch (RuntimeException $e) {
    echo "❌ Error: {$e->getMessage()}\\n";
}

print_r($pedido->getInfo());

echo "\\nHistorial de estados:\\n";
foreach ($pedido->getHistorial() as $registro) {
    echo "- {$registro['estado']->name} ({$registro['fecha']->format('H:i:s')})\\n";
}
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Mejores Prácticas:</strong><br>
            • <strong>Usa Backed Enums</strong>: Para persistencia en BD (string o int)<br>
            • <strong>Añade métodos</strong>: Encapsula lógica relacionada con el enum<br>
            • <strong>Usa match</strong>: Perfecto para mapear casos a valores<br>
            • <strong>Implementa interfaces</strong>: Para comportamiento común<br>
            • <strong>Valida transiciones</strong>: En máquinas de estado<br>
            • <strong>Documenta casos</strong>: Explica el significado de cada caso<br>
            • <strong>Type hints</strong>: Usa enums en parámetros y retornos
        </div>

        <div class="warning-box">
            <strong>⚠️ Limitaciones:</strong><br>
            • Solo disponible desde PHP 8.1+<br>
            • Los casos NO pueden ser dinámicos<br>
            • Backed enums solo aceptan string o int (no float, bool, etc.)<br>
            • NO puedes extender enums (no herencia)<br>
            • Los valores deben ser únicos dentro del enum<br>
            • NO puedes usar propiedades de instancia (solo métodos)
        </div>

        <div class="info-box">
            <strong>💡 Resumen:</strong><br>
            • <strong>Pure Enum</strong>: <code>enum Nombre { case Caso; }</code><br>
            • <strong>Backed Enum</strong>: <code>enum Nombre: string { case Caso = 'valor'; }</code><br>
            • <strong>Acceder</strong>: <code>$enum->name</code> y <code>$enum->value</code><br>
            • <strong>Crear</strong>: <code>Enum::from('valor')</code> o <code>Enum::tryFrom('valor')</code><br>
            • <strong>Listar</strong>: <code>Enum::cases()</code><br>
            • <strong>Métodos</strong>: Pueden tener métodos públicos y estáticos<br>
            • <strong>Interfaces</strong>: Pueden implementar interfaces<br>
            • <strong>Uso ideal</strong>: Estados, opciones, categorías, máquinas de estado
        </div>
    `,
    'principio-ocp': `
        <h1>Principio Abierto/Cerrado (OCP)</h1>
        
        <p>El <strong>Principio Abierto/Cerrado</strong> establece que las clases deben estar <strong>abiertas para extensión</strong> pero <strong>cerradas para modificación</strong>. Debes poder añadir nueva funcionalidad sin cambiar el código existente.</p>

        <div class="info-box">
            <strong>💡 Conceptos Clave:</strong><br>
            • <strong>Abierto para extensión</strong>: Puedes añadir nuevo comportamiento<br>
            • <strong>Cerrado para modificación</strong>: No cambias código existente<br>
            • <strong>Abstracción</strong>: Usa interfaces y clases abstractas<br>
            • <strong>Polimorfismo</strong>: Diferentes implementaciones de la misma interfaz<br>
            • <strong>Ventaja</strong>: Código más estable y menos propenso a bugs
        </div>

        <h3>❌ Violando OCP</h3>
        <div class="code-block"><pre><code>&lt;?php
// MAL: Cada vez que añades un tipo, debes modificar la clase
class CalculadorDescuento {
    public function calcular(string $tipoCliente, float $monto): float {
        if ($tipoCliente === 'regular') {
            return $monto * 0.05;  // 5%
        } elseif ($tipoCliente === 'premium') {
            return $monto * 0.10;  // 10%
        } elseif ($tipoCliente === 'vip') {
            return $monto * 0.20;  // 20%
        }
        // ❌ Para añadir 'gold', debes modificar esta clase
        // elseif ($tipoCliente === 'gold') {
        //     return $monto * 0.15;
        // }
        
        return 0;
    }
}

// Problema: Cada nuevo tipo requiere modificar el código existente
$calc = new CalculadorDescuento();
echo $calc->calcular('premium', 100);  // 10
?&gt;</code></pre></div>

        <h3>✅ Respetando OCP</h3>
        <div class="code-block"><pre><code>&lt;?php
// BIEN: Usa abstracción para permitir extensión sin modificación
interface EstrategiaDescuento {
    public function calcular(float $monto): float;
    public function getNombre(): string;
}

class DescuentoRegular implements EstrategiaDescuento {
    public function calcular(float $monto): float {
        return $monto * 0.05;  // 5%
    }
    
    public function getNombre(): string {
        return 'Regular';
    }
}

class DescuentoPremium implements EstrategiaDescuento {
    public function calcular(float $monto): float {
        return $monto * 0.10;  // 10%
    }
    
    public function getNombre(): string {
        return 'Premium';
    }
}

class DescuentoVIP implements EstrategiaDescuento {
    public function calcular(float $monto): float {
        return $monto * 0.20;  // 20%
    }
    
    public function getNombre(): string {
        return 'VIP';
    }
}

// ✅ Añadir nuevo tipo SIN modificar código existente
class DescuentoGold implements EstrategiaDescuento {
    public function calcular(float $monto): float {
        return $monto * 0.15;  // 15%
    }
    
    public function getNombre(): string {
        return 'Gold';
    }
}

class CalculadorDescuento {
    public function __construct(
        private EstrategiaDescuento $estrategia
    ) {}
    
    public function calcular(float $monto): float {
        return $this->estrategia->calcular($monto);
    }
}

// Uso: Extensible sin modificar código existente
$regular = new CalculadorDescuento(new DescuentoRegular());
echo $regular->calcular(100);  // 5

$gold = new CalculadorDescuento(new DescuentoGold());
echo $gold->calcular(100);  // 15
?&gt;</code></pre></div>

        <h3>OCP con Clases Abstractas</h3>
        <div class="code-block"><pre><code>&lt;?php
abstract class Notificacion {
    protected string $destinatario;
    protected string $mensaje;
    
    public function __construct(string $destinatario, string $mensaje) {
        $this->destinatario = $destinatario;
        $this->mensaje = $mensaje;
    }
    
    // Template method: cerrado para modificación
    final public function enviar(): bool {
        if (!$this->validar()) {
            return false;
        }
        
        $this->antesDeEnviar();
        $resultado = $this->enviarMensaje();
        $this->despuesDeEnviar($resultado);
        
        return $resultado;
    }
    
    // Abierto para extensión: cada clase implementa su lógica
    abstract protected function enviarMensaje(): bool;
    
    protected function validar(): bool {
        return !empty($this->destinatario) && !empty($this->mensaje);
    }
    
    protected function antesDeEnviar(): void {
        // Hook opcional
    }
    
    protected function despuesDeEnviar(bool $resultado): void {
        // Hook opcional
    }
}

class EmailNotificacion extends Notificacion {
    protected function enviarMensaje(): bool {
        echo "Enviando email a {$this->destinatario}: {$this->mensaje}\\n";
        return true;
    }
    
    protected function antesDeEnviar(): void {
        echo "Preparando conexión SMTP...\\n";
    }
}

class SMSNotificacion extends Notificacion {
    protected function enviarMensaje(): bool {
        echo "Enviando SMS a {$this->destinatario}: {$this->mensaje}\\n";
        return true;
    }
}

// ✅ Extensión: Nueva notificación sin modificar código existente
class SlackNotificacion extends Notificacion {
    protected function enviarMensaje(): bool {
        echo "Enviando mensaje Slack a {$this->destinatario}: {$this->mensaje}\\n";
        return true;
    }
    
    protected function antesDeEnviar(): void {
        echo "Conectando con API de Slack...\\n";
    }
}

// Uso
$email = new EmailNotificacion("user@example.com", "Hola");
$email->enviar();

$slack = new SlackNotificacion("@usuario", "Hola");
$slack->enviar();
?&gt;</code></pre></div>

        <h3>OCP con Composición</h3>
        <div class="code-block"><pre><code>&lt;?php
interface Filtro {
    public function aplicar(array $items): array;
}

class FiltroActivos implements Filtro {
    public function aplicar(array $items): array {
        return array_filter($items, fn($item) => $item['activo'] === true);
    }
}

class FiltroPorPrecio implements Filtro {
    public function __construct(
        private float $precioMinimo,
        private float $precioMaximo
    ) {}
    
    public function aplicar(array $items): array {
        return array_filter($items, function($item) {
            return $item['precio'] >= $this->precioMinimo 
                && $item['precio'] <= $this->precioMaximo;
        });
    }
}

class FiltroPorCategoria implements Filtro {
    public function __construct(private string $categoria) {}
    
    public function aplicar(array $items): array {
        return array_filter($items, fn($item) => $item['categoria'] === $this->categoria);
    }
}

// ✅ Extensión: Nuevo filtro sin modificar código existente
class FiltroPorStock implements Filtro {
    public function __construct(private int $stockMinimo) {}
    
    public function aplicar(array $items): array {
        return array_filter($items, fn($item) => $item['stock'] >= $this->stockMinimo);
    }
}

class BuscadorProductos {
    private array $filtros = [];
    
    public function agregarFiltro(Filtro $filtro): self {
        $this->filtros[] = $filtro;
        return $this;
    }
    
    public function buscar(array $productos): array {
        $resultado = $productos;
        
        foreach ($this->filtros as $filtro) {
            $resultado = $filtro->aplicar($resultado);
        }
        
        return $resultado;
    }
}

// Uso
$productos = [
    ['id' => 1, 'nombre' => 'Laptop', 'precio' => 1000, 'categoria' => 'tech', 'activo' => true, 'stock' => 5],
    ['id' => 2, 'nombre' => 'Mouse', 'precio' => 25, 'categoria' => 'tech', 'activo' => true, 'stock' => 0],
    ['id' => 3, 'nombre' => 'Silla', 'precio' => 150, 'categoria' => 'muebles', 'activo' => false, 'stock' => 10],
    ['id' => 4, 'nombre' => 'Teclado', 'precio' => 75, 'categoria' => 'tech', 'activo' => true, 'stock' => 3],
];

$buscador = new BuscadorProductos();
$resultado = $buscador
    ->agregarFiltro(new FiltroActivos())
    ->agregarFiltro(new FiltroPorCategoria('tech'))
    ->agregarFiltro(new FiltroPorPrecio(50, 500))
    ->agregarFiltro(new FiltroPorStock(1))
    ->buscar($productos);

print_r($resultado);  // Solo Teclado cumple todos los filtros
?&gt;</code></pre></div>

        <h3>OCP con Enums y Match (PHP 8.1+)</h3>
        <div class="code-block"><pre><code>&lt;?php
interface CalculadorImpuesto {
    public function calcular(float $monto): float;
}

enum TipoImpuesto: string {
    case IVA = 'iva';
    case ISR = 'isr';
    case IEPS = 'ieps';
    case Exento = 'exento';
    
    public function getCalculador(): CalculadorImpuesto {
        return match($this) {
            self::IVA => new CalculadorIVA(),
            self::ISR => new CalculadorISR(),
            self::IEPS => new CalculadorIEPS(),
            self::Exento => new CalculadorExento()
        };
    }
}

class CalculadorIVA implements CalculadorImpuesto {
    public function calcular(float $monto): float {
        return $monto * 0.16;  // 16%
    }
}

class CalculadorISR implements CalculadorImpuesto {
    public function calcular(float $monto): float {
        return $monto * 0.30;  // 30%
    }
}

class CalculadorIEPS implements CalculadorImpuesto {
    public function calcular(float $monto): float {
        return $monto * 0.08;  // 8%
    }
}

class CalculadorExento implements CalculadorImpuesto {
    public function calcular(float $monto): float {
        return 0;
    }
}

class Producto {
    public function __construct(
        public readonly string $nombre,
        public readonly float $precio,
        public readonly TipoImpuesto $tipoImpuesto
    ) {}
    
    public function getPrecioConImpuesto(): float {
        $calculador = $this->tipoImpuesto->getCalculador();
        $impuesto = $calculador->calcular($this->precio);
        return $this->precio + $impuesto;
    }
}

// Uso
$laptop = new Producto("Laptop", 1000, TipoImpuesto::IVA);
echo $laptop->getPrecioConImpuesto();  // 1160

$libro = new Producto("Libro", 100, TipoImpuesto::Exento);
echo $libro->getPrecioConImpuesto();  // 100
?&gt;</code></pre></div>

        <h3>OCP con Decoradores</h3>
        <div class="code-block"><pre><code>&lt;?php
interface Reporte {
    public function generar(): string;
}

class ReporteBasico implements Reporte {
    public function __construct(private array $datos) {}
    
    public function generar(): string {
        return "Reporte: " . json_encode($this->datos);
    }
}

// Decorador base
abstract class DecoradorReporte implements Reporte {
    public function __construct(protected Reporte $reporte) {}
    
    abstract public function generar(): string;
}

// ✅ Extensión: Añadir funcionalidad sin modificar código existente
class ReporteConFecha extends DecoradorReporte {
    public function generar(): string {
        $fecha = date('Y-m-d H:i:s');
        return "[{$fecha}] " . $this->reporte->generar();
    }
}

class ReporteConEncabezado extends DecoradorReporte {
    public function __construct(
        Reporte $reporte,
        private string $titulo
    ) {
        parent::__construct($reporte);
    }
    
    public function generar(): string {
        return "=== {$this->titulo} ===\\n" . $this->reporte->generar();
    }
}

class ReporteConPie extends DecoradorReporte {
    public function generar(): string {
        return $this->reporte->generar() . "\\n--- Fin del reporte ---";
    }
}

class ReporteHTML extends DecoradorReporte {
    public function generar(): string {
        $contenido = $this->reporte->generar();
        return "<html><body><pre>{$contenido}</pre></body></html>";
    }
}

// Uso: Combinar decoradores sin modificar código existente
$datos = ['ventas' => 1000, 'gastos' => 500];
$reporte = new ReporteBasico($datos);

// Reporte simple
echo $reporte->generar() . "\\n\\n";

// Reporte decorado
$reporteCompleto = new ReporteHTML(
    new ReporteConPie(
        new ReporteConFecha(
            new ReporteConEncabezado($reporte, "Reporte Mensual")
        )
    )
);

echo $reporteCompleto->generar();
?&gt;</code></pre></div>

        <h3>Ejemplo Completo: Sistema de Pagos</h3>
        <div class="code-block"><pre><code>&lt;?php
interface ProcesadorPago {
    public function procesar(float $monto): bool;
    public function getComision(): float;
    public function getNombre(): string;
}

class PagoTarjeta implements ProcesadorPago {
    public function procesar(float $monto): bool {
        echo "Procesando pago con tarjeta: \${$monto}\\n";
        return true;
    }
    
    public function getComision(): float {
        return 0.029;  // 2.9%
    }
    
    public function getNombre(): string {
        return 'Tarjeta de Crédito';
    }
}

class PagoPayPal implements ProcesadorPago {
    public function procesar(float $monto): bool {
        echo "Procesando pago con PayPal: \${$monto}\\n";
        return true;
    }
    
    public function getComision(): float {
        return 0.034;  // 3.4%
    }
    
    public function getNombre(): string {
        return 'PayPal';
    }
}

// ✅ Extensión: Nuevos métodos de pago sin modificar código existente
class PagoCripto implements ProcesadorPago {
    public function __construct(private string $moneda = 'BTC') {}
    
    public function procesar(float $monto): bool {
        echo "Procesando pago con {$this->moneda}: \${$monto}\\n";
        return true;
    }
    
    public function getComision(): float {
        return 0.01;  // 1%
    }
    
    public function getNombre(): string {
        return "Criptomoneda ({$this->moneda})";
    }
}

class PagoTransferencia implements ProcesadorPago {
    public function procesar(float $monto): bool {
        echo "Procesando transferencia bancaria: \${$monto}\\n";
        return true;
    }
    
    public function getComision(): float {
        return 0.005;  // 0.5%
    }
    
    public function getNombre(): string {
        return 'Transferencia Bancaria';
    }
}

// Clase cerrada para modificación, abierta para extensión
class GestorPagos {
    private array $historial = [];
    
    public function procesarPago(ProcesadorPago $procesador, float $monto): array {
        $comision = $monto * $procesador->getComision();
        $total = $monto + $comision;
        
        echo "Método: {$procesador->getNombre()}\\n";
        echo "Monto: \${$monto}\\n";
        echo "Comisión: \${$comision}\\n";
        echo "Total: \${$total}\\n";
        
        $resultado = $procesador->procesar($total);
        
        $transaccion = [
            'metodo' => $procesador->getNombre(),
            'monto' => $monto,
            'comision' => $comision,
            'total' => $total,
            'exitoso' => $resultado,
            'fecha' => new DateTime()
        ];
        
        $this->historial[] = $transaccion;
        
        return $transaccion;
    }
    
    public function getHistorial(): array {
        return $this->historial;
    }
    
    public function getTotalProcesado(): float {
        return array_reduce(
            $this->historial,
            fn($total, $t) => $total + ($t['exitoso'] ? $t['total'] : 0),
            0
        );
    }
}

// Uso: Añadir nuevos métodos sin modificar GestorPagos
$gestor = new GestorPagos();

$gestor->procesarPago(new PagoTarjeta(), 100);
echo "\\n";

$gestor->procesarPago(new PagoPayPal(), 200);
echo "\\n";

$gestor->procesarPago(new PagoCripto('ETH'), 300);
echo "\\n";

$gestor->procesarPago(new PagoTransferencia(), 400);
echo "\\n";

echo "Total procesado: \$" . $gestor->getTotalProcesado();
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Cómo Aplicar OCP:</strong><br>
            • <strong>Usa interfaces</strong>: Define contratos para comportamiento<br>
            • <strong>Clases abstractas</strong>: Template methods para algoritmos comunes<br>
            • <strong>Composición</strong>: Combina objetos en lugar de herencia<br>
            • <strong>Strategy Pattern</strong>: Encapsula algoritmos intercambiables<br>
            • <strong>Decorator Pattern</strong>: Añade funcionalidad dinámicamente<br>
            • <strong>Dependency Injection</strong>: Inyecta dependencias abstractas<br>
            • <strong>Evita if/switch</strong>: Usa polimorfismo en su lugar
        </div>

        <div class="warning-box">
            <strong>⚠️ Errores Comunes:</strong><br>
            • NO uses if/switch para determinar comportamiento<br>
            • NO modifiques clases existentes para añadir funcionalidad<br>
            • NO uses type checking (<code>instanceof</code>) para decidir lógica<br>
            • EVITA clases con muchos métodos condicionales<br>
            • NO sobre-ingenierices: aplica OCP cuando realmente lo necesites<br>
            • REFACTORIZA código que viola OCP cuando añadas nueva funcionalidad
        </div>

        <div class="info-box">
            <strong>💡 Resumen:</strong><br>
            • <strong>Definición</strong>: Abierto para extensión, cerrado para modificación<br>
            • <strong>Objetivo</strong>: Añadir funcionalidad sin cambiar código existente<br>
            • <strong>Herramientas</strong>: Interfaces, clases abstractas, polimorfismo<br>
            • <strong>Patrones</strong>: Strategy, Decorator, Template Method<br>
            • <strong>Ventaja</strong>: Código más estable y mantenible<br>
            • <strong>Señal de violación</strong>: Muchos if/switch basados en tipos<br>
            • <strong>Solución</strong>: Reemplazar condicionales con polimorfismo
        </div>
    `,
    'principio-lsp': `
        <h1>Principio de Sustitución de Liskov (LSP)</h1>
        
        <p>El <strong>Principio de Sustitución de Liskov</strong> establece que los objetos de una clase derivada deben poder reemplazar objetos de la clase base sin alterar el comportamiento correcto del programa.</p>

        <div class="info-box">
            <strong>💡 Conceptos Clave:</strong><br>
            • <strong>Sustituibilidad</strong>: Las subclases deben ser sustituibles por su clase base<br>
            • <strong>Contratos</strong>: Las subclases deben respetar el contrato de la clase base<br>
            • <strong>Precondiciones</strong>: No pueden ser más fuertes en subclases<br>
            • <strong>Postcondiciones</strong>: No pueden ser más débiles en subclases<br>
            • <strong>Invariantes</strong>: Deben mantenerse en toda la jerarquía
        </div>

        <h3>❌ Violando LSP</h3>
        <div class="code-block"><pre><code>&lt;?php
// MAL: La subclase no puede sustituir a la clase base
class Rectangulo {
    protected float $ancho;
    protected float $alto;
    
    public function setAncho(float $ancho): void {
        $this->ancho = $ancho;
    }
    
    public function setAlto(float $alto): void {
        $this->alto = $alto;
    }
    
    public function getArea(): float {
        return $this->ancho * $this->alto;
    }
}

// ❌ Viola LSP: Un cuadrado no es un rectángulo en términos de comportamiento
class Cuadrado extends Rectangulo {
    public function setAncho(float $ancho): void {
        $this->ancho = $ancho;
        $this->alto = $ancho;  // ❌ Cambia el comportamiento esperado
    }
    
    public function setAlto(float $alto): void {
        $this->alto = $alto;
        $this->ancho = $alto;  // ❌ Cambia el comportamiento esperado
    }
}

// Problema: El código que funciona con Rectangulo falla con Cuadrado
function probarRectangulo(Rectangulo $rect): void {
    $rect->setAncho(5);
    $rect->setAlto(4);
    
    // Esperamos área = 20, pero con Cuadrado será 16
    echo "Área esperada: 20, Área real: " . $rect->getArea() . "\\n";
}

$rectangulo = new Rectangulo();
probarRectangulo($rectangulo);  // ✅ OK: 20

$cuadrado = new Cuadrado();
probarRectangulo($cuadrado);  // ❌ FALLA: 16 (no 20)
?&gt;</code></pre></div>

        <h3>✅ Respetando LSP</h3>
        <div class="code-block"><pre><code>&lt;?php
// BIEN: Usa composición o interfaces separadas
interface Forma {
    public function getArea(): float;
}

class Rectangulo implements Forma {
    public function __construct(
        private float $ancho,
        private float $alto
    ) {}
    
    public function getArea(): float {
        return $this->ancho * $this->alto;
    }
    
    public function getAncho(): float {
        return $this->ancho;
    }
    
    public function getAlto(): float {
        return $this->alto;
    }
}

class Cuadrado implements Forma {
    public function __construct(
        private float $lado
    ) {}
    
    public function getArea(): float {
        return $this->lado * $this->lado;
    }
    
    public function getLado(): float {
        return $this->lado;
    }
}

// Ahora funciona correctamente con cualquier Forma
function calcularArea(Forma $forma): float {
    return $forma->getArea();
}

$rectangulo = new Rectangulo(5, 4);
echo calcularArea($rectangulo);  // 20

$cuadrado = new Cuadrado(4);
echo calcularArea($cuadrado);  // 16
?&gt;</code></pre></div>

        <h3>LSP con Excepciones</h3>
        <div class="code-block"><pre><code>&lt;?php
// ❌ MAL: La subclase lanza excepciones que la clase base no lanza
class CuentaBancaria {
    protected float $saldo = 0;
    
    public function depositar(float $monto): void {
        if ($monto <= 0) {
            throw new InvalidArgumentException("Monto debe ser positivo");
        }
        $this->saldo += $monto;
    }
    
    public function retirar(float $monto): void {
        if ($monto <= 0) {
            throw new InvalidArgumentException("Monto debe ser positivo");
        }
        if ($monto > $this->saldo) {
            throw new RuntimeException("Saldo insuficiente");
        }
        $this->saldo -= $monto;
    }
    
    public function getSaldo(): float {
        return $this->saldo;
    }
}

// ❌ Viola LSP: Añade restricciones que la clase base no tiene
class CuentaAhorro extends CuentaBancaria {
    private int $retirosHoy = 0;
    private const MAX_RETIROS_DIA = 3;
    
    public function retirar(float $monto): void {
        // ❌ Nueva excepción que la clase base no lanza
        if ($this->retirosHoy >= self::MAX_RETIROS_DIA) {
            throw new RuntimeException("Límite de retiros diarios alcanzado");
        }
        
        parent::retirar($monto);
        $this->retirosHoy++;
    }
}

// ✅ BIEN: Usa composición o indica claramente las restricciones
interface CuentaConLimites {
    public function puedeRetirar(float $monto): bool;
    public function getRetirosRestantes(): int;
}

class CuentaAhorroMejorada extends CuentaBancaria implements CuentaConLimites {
    private int $retirosHoy = 0;
    private const MAX_RETIROS_DIA = 3;
    
    public function puedeRetirar(float $monto): bool {
        return $this->retirosHoy < self::MAX_RETIROS_DIA 
            && $monto <= $this->getSaldo();
    }
    
    public function getRetirosRestantes(): int {
        return self::MAX_RETIROS_DIA - $this->retirosHoy;
    }
    
    public function retirar(float $monto): void {
        if (!$this->puedeRetirar($monto)) {
            throw new RuntimeException("No se puede realizar el retiro");
        }
        
        parent::retirar($monto);
        $this->retirosHoy++;
    }
}
?&gt;</code></pre></div>

        <h3>LSP con Precondiciones</h3>
        <div class="code-block"><pre><code>&lt;?php
// ❌ MAL: La subclase fortalece las precondiciones
abstract class Archivo {
    abstract public function leer(string $ruta): string;
}

class ArchivoTexto extends Archivo {
    public function leer(string $ruta): string {
        return file_get_contents($ruta);
    }
}

// ❌ Viola LSP: Requiere que la ruta termine en .txt
class ArchivoTextoEstricto extends Archivo {
    public function leer(string $ruta): string {
        // ❌ Precondición más fuerte que la clase base
        if (!str_ends_with($ruta, '.txt')) {
            throw new InvalidArgumentException("Solo archivos .txt");
        }
        return file_get_contents($ruta);
    }
}

// ✅ BIEN: Las subclases no fortalecen precondiciones
abstract class ArchivoMejorado {
    abstract public function leer(string $ruta): string;
    abstract public function soporta(string $ruta): bool;
}

class ArchivoTextoMejorado extends ArchivoMejorado {
    public function leer(string $ruta): string {
        return file_get_contents($ruta);
    }
    
    public function soporta(string $ruta): bool {
        return str_ends_with($ruta, '.txt');
    }
}

class ArchivoJSON extends ArchivoMejorado {
    public function leer(string $ruta): string {
        return file_get_contents($ruta);
    }
    
    public function soporta(string $ruta): bool {
        return str_ends_with($ruta, '.json');
    }
}
?&gt;</code></pre></div>

        <h3>LSP con Postcondiciones</h3>
        <div class="code-block"><pre><code>&lt;?php
// ✅ BIEN: Las subclases respetan las postcondiciones
interface Validador {
    // Postcondición: debe retornar true si es válido, false si no
    public function validar(string $valor): bool;
}

class ValidadorEmail implements Validador {
    public function validar(string $valor): bool {
        return filter_var($valor, FILTER_VALIDATE_EMAIL) !== false;
    }
}

class ValidadorEmailEstricto implements Validador {
    public function validar(string $valor): bool {
        // ✅ Respeta la postcondición: retorna bool
        if (!filter_var($valor, FILTER_VALIDATE_EMAIL)) {
            return false;
        }
        
        // Validación adicional pero mantiene el contrato
        return !str_contains($valor, '+');
    }
}

// ❌ MAL: Debilita la postcondición
class ValidadorEmailRoto implements Validador {
    public function validar(string $valor): bool {
        // ❌ Puede lanzar excepción cuando no debería
        if (empty($valor)) {
            throw new InvalidArgumentException("Valor vacío");
        }
        return filter_var($valor, FILTER_VALIDATE_EMAIL) !== false;
    }
}
?&gt;</code></pre></div>

        <h3>LSP con Invariantes</h3>
        <div class="code-block"><pre><code>&lt;?php
// ✅ BIEN: Las subclases mantienen los invariantes
abstract class Producto {
    protected float $precio;
    
    public function __construct(float $precio) {
        $this->setPrecio($precio);
    }
    
    // Invariante: el precio siempre debe ser positivo
    protected function setPrecio(float $precio): void {
        if ($precio <= 0) {
            throw new InvalidArgumentException("Precio debe ser positivo");
        }
        $this->precio = $precio;
    }
    
    public function getPrecio(): float {
        return $this->precio;
    }
    
    abstract public function getPrecioFinal(): float;
}

class ProductoConDescuento extends Producto {
    public function __construct(
        float $precio,
        private float $descuento = 0
    ) {
        parent::__construct($precio);
        
        if ($descuento < 0 || $descuento > 1) {
            throw new InvalidArgumentException("Descuento debe estar entre 0 y 1");
        }
        $this->descuento = $descuento;
    }
    
    public function getPrecioFinal(): float {
        $precioFinal = $this->precio * (1 - $this->descuento);
        // ✅ Mantiene el invariante: el precio final es positivo
        return max($precioFinal, 0.01);
    }
}

class ProductoConImpuesto extends Producto {
    public function __construct(
        float $precio,
        private float $impuesto = 0.16
    ) {
        parent::__construct($precio);
    }
    
    public function getPrecioFinal(): float {
        // ✅ Mantiene el invariante: el precio final es positivo
        return $this->precio * (1 + $this->impuesto);
    }
}
?&gt;</code></pre></div>

        <h3>LSP con Type Hints</h3>
        <div class="code-block"><pre><code>&lt;?php
interface Notificacion {
    public function enviar(string $mensaje): bool;
}

class EmailNotificacion implements Notificacion {
    public function __construct(private string $email) {}
    
    public function enviar(string $mensaje): bool {
        echo "Enviando email a {$this->email}: {$mensaje}\\n";
        return true;
    }
}

class SMSNotificacion implements Notificacion {
    public function __construct(private string $telefono) {}
    
    public function enviar(string $mensaje): bool {
        echo "Enviando SMS a {$this->telefono}: {$mensaje}\\n";
        return true;
    }
}

// ✅ Cualquier Notificacion puede usarse aquí (LSP)
class NotificadorMasivo {
    /** @var Notificacion[] */
    private array $notificaciones = [];
    
    public function agregar(Notificacion $notificacion): void {
        $this->notificaciones[] = $notificacion;
    }
    
    public function enviarATodos(string $mensaje): int {
        $enviados = 0;
        
        foreach ($this->notificaciones as $notificacion) {
            // ✅ Todas las implementaciones respetan el contrato
            if ($notificacion->enviar($mensaje)) {
                $enviados++;
            }
        }
        
        return $enviados;
    }
}

// Uso
$notificador = new NotificadorMasivo();
$notificador->agregar(new EmailNotificacion("user@example.com"));
$notificador->agregar(new SMSNotificacion("+34123456789"));

$enviados = $notificador->enviarATodos("Mensaje importante");
echo "Enviados: {$enviados}\\n";
?&gt;</code></pre></div>

        <h3>Ejemplo Completo: Sistema de Transporte</h3>
        <div class="code-block"><pre><code>&lt;?php
interface Vehiculo {
    public function arrancar(): bool;
    public function detener(): bool;
    public function getVelocidadMaxima(): int;
}

abstract class VehiculoBase implements Vehiculo {
    protected bool $encendido = false;
    protected int $velocidadActual = 0;
    
    public function arrancar(): bool {
        if ($this->encendido) {
            return false;
        }
        
        $this->encendido = true;
        echo get_class($this) . " arrancado\\n";
        return true;
    }
    
    public function detener(): bool {
        if (!$this->encendido) {
            return false;
        }
        
        $this->velocidadActual = 0;
        $this->encendido = false;
        echo get_class($this) . " detenido\\n";
        return true;
    }
    
    public function estaEncendido(): bool {
        return $this->encendido;
    }
    
    public function getVelocidadActual(): int {
        return $this->velocidadActual;
    }
    
    abstract public function getVelocidadMaxima(): int;
}

class Coche extends VehiculoBase {
    public function getVelocidadMaxima(): int {
        return 180;  // km/h
    }
    
    public function acelerar(int $incremento): void {
        if (!$this->encendido) {
            throw new RuntimeException("El coche debe estar encendido");
        }
        
        $nuevaVelocidad = $this->velocidadActual + $incremento;
        $this->velocidadActual = min($nuevaVelocidad, $this->getVelocidadMaxima());
    }
}

class Bicicleta extends VehiculoBase {
    public function getVelocidadMaxima(): int {
        return 30;  // km/h
    }
    
    // ✅ Respeta LSP: arrancar() funciona igual que en la clase base
    public function arrancar(): bool {
        // Las bicicletas no necesitan "arrancar" pero respetan el contrato
        $this->encendido = true;
        echo "Bicicleta lista para usar\\n";
        return true;
    }
    
    public function pedalear(int $intensidad): void {
        if (!$this->encendido) {
            throw new RuntimeException("La bicicleta debe estar lista");
        }
        
        $incremento = $intensidad * 2;
        $nuevaVelocidad = $this->velocidadActual + $incremento;
        $this->velocidadActual = min($nuevaVelocidad, $this->getVelocidadMaxima());
    }
}

class Moto extends VehiculoBase {
    public function getVelocidadMaxima(): int {
        return 200;  // km/h
    }
    
    public function hacerCaballito(): bool {
        if (!$this->encendido) {
            return false;
        }
        
        if ($this->velocidadActual < 30) {
            return false;
        }
        
        echo "¡Caballito!\\n";
        return true;
    }
}

// ✅ Función que respeta LSP: funciona con cualquier Vehiculo
class SistemaTransporte {
    public function iniciarViaje(Vehiculo $vehiculo): void {
        echo "Iniciando viaje...\\n";
        
        if ($vehiculo->arrancar()) {
            echo "Vehículo arrancado correctamente\\n";
            echo "Velocidad máxima: {$vehiculo->getVelocidadMaxima()} km/h\\n";
        }
    }
    
    public function finalizarViaje(Vehiculo $vehiculo): void {
        echo "Finalizando viaje...\\n";
        
        if ($vehiculo->detener()) {
            echo "Vehículo detenido correctamente\\n";
        }
    }
    
    public function compararVehiculos(Vehiculo $v1, Vehiculo $v2): void {
        echo "Comparando vehículos:\\n";
        echo "Vehículo 1 - Velocidad máxima: {$v1->getVelocidadMaxima()} km/h\\n";
        echo "Vehículo 2 - Velocidad máxima: {$v2->getVelocidadMaxima()} km/h\\n";
        
        if ($v1->getVelocidadMaxima() > $v2->getVelocidadMaxima()) {
            echo "Vehículo 1 es más rápido\\n";
        } else {
            echo "Vehículo 2 es más rápido\\n";
        }
    }
}

// Uso: Todos los vehículos son sustituibles
$sistema = new SistemaTransporte();

$coche = new Coche();
$sistema->iniciarViaje($coche);
$sistema->finalizarViaje($coche);

echo "\\n";

$bici = new Bicicleta();
$sistema->iniciarViaje($bici);
$sistema->finalizarViaje($bici);

echo "\\n";

$moto = new Moto();
$sistema->iniciarViaje($moto);
$sistema->finalizarViaje($moto);

echo "\\n";

$sistema->compararVehiculos($coche, $moto);
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Cómo Aplicar LSP:</strong><br>
            • <strong>Respeta contratos</strong>: Las subclases deben cumplir el contrato de la clase base<br>
            • <strong>No fortalezcas precondiciones</strong>: No añadas restricciones en subclases<br>
            • <strong>No debilites postcondiciones</strong>: Mantén las garantías de la clase base<br>
            • <strong>Mantén invariantes</strong>: Las reglas de negocio deben mantenerse<br>
            • <strong>Usa composición</strong>: Si no puedes sustituir, usa composición<br>
            • <strong>Interfaces segregadas</strong>: Divide interfaces grandes en específicas<br>
            • <strong>Piensa en comportamiento</strong>: No solo en estructura de datos
        </div>

        <div class="warning-box">
            <strong>⚠️ Señales de Violación de LSP:</strong><br>
            • Necesitas usar <code>instanceof</code> para verificar el tipo<br>
            • Las subclases lanzan excepciones que la clase base no lanza<br>
            • Las subclases tienen métodos vacíos o que lanzan NotImplementedException<br>
            • Necesitas sobrescribir métodos para "desactivar" funcionalidad<br>
            • El código cliente necesita conocer el tipo específico<br>
            • Las pruebas fallan cuando usas subclases en lugar de la clase base
        </div>

        <div class="info-box">
            <strong>💡 Resumen:</strong><br>
            • <strong>Definición</strong>: Las subclases deben ser sustituibles por su clase base<br>
            • <strong>Regla</strong>: Si S es subtipo de T, entonces T puede ser reemplazado por S<br>
            • <strong>Precondiciones</strong>: No pueden ser más fuertes en subclases<br>
            • <strong>Postcondiciones</strong>: No pueden ser más débiles en subclases<br>
            • <strong>Invariantes</strong>: Deben mantenerse en toda la jerarquía<br>
            • <strong>Beneficio</strong>: Código más robusto y predecible<br>
            • <strong>Solución</strong>: Usa composición cuando la herencia no funciona
        </div>
    `,
    'principio-isp': `
        <h1>Principio de Segregación de Interfaces (ISP)</h1>
        
        <p>El <strong>Principio de Segregación de Interfaces</strong> establece que ningún cliente debe ser forzado a depender de métodos que no utiliza. Es mejor tener muchas interfaces específicas que una interfaz general.</p>

        <div class="info-box">
            <strong>💡 Conceptos Clave:</strong><br>
            • <strong>Interfaces pequeñas</strong>: Cada interfaz debe tener un propósito específico<br>
            • <strong>No forzar implementaciones</strong>: Los clientes solo implementan lo que necesitan<br>
            • <strong>Cohesión</strong>: Métodos relacionados juntos en la misma interfaz<br>
            • <strong>Composición</strong>: Combinar interfaces pequeñas según necesidad<br>
            • <strong>Ventaja</strong>: Código más flexible y fácil de mantener
        </div>

        <h3>❌ Violando ISP</h3>
        <div class="code-block"><pre><code>&lt;?php
// MAL: Interfaz demasiado grande que fuerza implementaciones innecesarias
interface Trabajador {
    public function trabajar(): void;
    public function comer(): void;
    public function dormir(): void;
    public function cobrarSalario(): void;
    public function tomarVacaciones(): void;
    public function asistirReunion(): void;
}

// ❌ Un robot no come, no duerme, no toma vacaciones
class Robot implements Trabajador {
    public function trabajar(): void {
        echo "Robot trabajando\\n";
    }
    
    // ❌ Implementaciones vacías o que lanzan excepciones
    public function comer(): void {
        throw new Exception("Los robots no comen");
    }
    
    public function dormir(): void {
        throw new Exception("Los robots no duermen");
    }
    
    public function cobrarSalario(): void {
        throw new Exception("Los robots no cobran salario");
    }
    
    public function tomarVacaciones(): void {
        throw new Exception("Los robots no toman vacaciones");
    }
    
    public function asistirReunion(): void {
        echo "Robot asistiendo a reunión\\n";
    }
}

// ❌ Un empleado remoto no asiste a reuniones presenciales
class EmpleadoRemoto implements Trabajador {
    public function trabajar(): void {
        echo "Trabajando remotamente\\n";
    }
    
    public function comer(): void {
        echo "Comiendo\\n";
    }
    
    public function dormir(): void {
        echo "Durmiendo\\n";
    }
    
    public function cobrarSalario(): void {
        echo "Cobrando salario\\n";
    }
    
    public function tomarVacaciones(): void {
        echo "De vacaciones\\n";
    }
    
    // ❌ Implementación forzada
    public function asistirReunion(): void {
        throw new Exception("Empleado remoto no asiste presencialmente");
    }
}
?&gt;</code></pre></div>

        <h3>✅ Respetando ISP</h3>
        <div class="code-block"><pre><code>&lt;?php
// BIEN: Interfaces pequeñas y específicas
interface Trabajable {
    public function trabajar(): void;
}

interface Alimentable {
    public function comer(): void;
}

interface Descansable {
    public function dormir(): void;
}

interface Pagable {
    public function cobrarSalario(): void;
}

interface Vacacionalable {
    public function tomarVacaciones(): void;
}

interface AsistenteReuniones {
    public function asistirReunion(): void;
}

// ✅ Robot solo implementa lo que necesita
class Robot implements Trabajable, AsistenteReuniones {
    public function trabajar(): void {
        echo "Robot trabajando 24/7\\n";
    }
    
    public function asistirReunion(): void {
        echo "Robot asistiendo a reunión\\n";
    }
}

// ✅ Empleado implementa lo que corresponde
class Empleado implements Trabajable, Alimentable, Descansable, Pagable, Vacacionalable, AsistenteReuniones {
    public function trabajar(): void {
        echo "Empleado trabajando\\n";
    }
    
    public function comer(): void {
        echo "Empleado comiendo\\n";
    }
    
    public function dormir(): void {
        echo "Empleado durmiendo\\n";
    }
    
    public function cobrarSalario(): void {
        echo "Empleado cobrando salario\\n";
    }
    
    public function tomarVacaciones(): void {
        echo "Empleado de vacaciones\\n";
    }
    
    public function asistirReunion(): void {
        echo "Empleado en reunión\\n";
    }
}

// ✅ Empleado remoto solo lo que necesita
class EmpleadoRemoto implements Trabajable, Alimentable, Descansable, Pagable, Vacacionalable {
    public function trabajar(): void {
        echo "Trabajando remotamente\\n";
    }
    
    public function comer(): void {
        echo "Comiendo en casa\\n";
    }
    
    public function dormir(): void {
        echo "Durmiendo\\n";
    }
    
    public function cobrarSalario(): void {
        echo "Cobrando salario\\n";
    }
    
    public function tomarVacaciones(): void {
        echo "De vacaciones\\n";
    }
}

// Uso flexible
function iniciarTrabajo(Trabajable $trabajador): void {
    $trabajador->trabajar();
}

function pagarSalario(Pagable $empleado): void {
    $empleado->cobrarSalario();
}

$robot = new Robot();
iniciarTrabajo($robot);  // ✅ OK

$empleado = new Empleado();
iniciarTrabajo($empleado);  // ✅ OK
pagarSalario($empleado);    // ✅ OK

// $robot no es Pagable, no se puede pasar a pagarSalario()
?&gt;</code></pre></div>

        <h3>ISP con Persistencia</h3>
        <div class="code-block"><pre><code>&lt;?php
// ❌ MAL: Interfaz que obliga a implementar todo
interface RepositorioCompleto {
    public function crear(array $datos): int;
    public function leer(int $id): ?array;
    public function actualizar(int $id, array $datos): bool;
    public function eliminar(int $id): bool;
    public function buscar(array $criterios): array;
    public function contar(): int;
    public function paginar(int $pagina, int $porPagina): array;
}

// ✅ BIEN: Interfaces segregadas
interface Creatable {
    public function crear(array $datos): int;
}

interface Readable {
    public function leer(int $id): ?array;
}

interface Updatable {
    public function actualizar(int $id, array $datos): bool;
}

interface Deletable {
    public function eliminar(int $id): bool;
}

interface Searchable {
    public function buscar(array $criterios): array;
}

interface Countable {
    public function contar(): int;
}

interface Paginable {
    public function paginar(int $pagina, int $porPagina): array;
}

// ✅ Repositorio de solo lectura
class RepositorioLectura implements Readable, Searchable, Countable {
    public function leer(int $id): ?array {
        echo "Leyendo registro {$id}\\n";
        return ['id' => $id, 'nombre' => 'Ejemplo'];
    }
    
    public function buscar(array $criterios): array {
        echo "Buscando con criterios\\n";
        return [];
    }
    
    public function contar(): int {
        return 100;
    }
}

// ✅ Repositorio completo (CRUD)
class RepositorioCRUD implements Creatable, Readable, Updatable, Deletable {
    public function crear(array $datos): int {
        echo "Creando registro\\n";
        return 1;
    }
    
    public function leer(int $id): ?array {
        echo "Leyendo registro {$id}\\n";
        return ['id' => $id];
    }
    
    public function actualizar(int $id, array $datos): bool {
        echo "Actualizando registro {$id}\\n";
        return true;
    }
    
    public function eliminar(int $id): bool {
        echo "Eliminando registro {$id}\\n";
        return true;
    }
}

// ✅ Log de solo escritura
class LogRepository implements Creatable {
    public function crear(array $datos): int {
        echo "Escribiendo log\\n";
        return 1;
    }
}
?&gt;</code></pre></div>

        <h3>ISP con Notificaciones</h3>
        <div class="code-block"><pre><code>&lt;?php
// ✅ Interfaces específicas para cada capacidad
interface Enviable {
    public function enviar(string $destinatario, string $mensaje): bool;
}

interface Programable {
    public function programar(string $destinatario, string $mensaje, DateTime $fecha): bool;
}

interface Masivo {
    public function enviarMasivo(array $destinatarios, string $mensaje): int;
}

interface ConAdjuntos {
    public function enviarConAdjunto(string $destinatario, string $mensaje, array $archivos): bool;
}

interface ConPlantillas {
    public function enviarConPlantilla(string $destinatario, string $plantilla, array $datos): bool;
}

// ✅ Email soporta todo
class EmailNotificacion implements Enviable, Programable, Masivo, ConAdjuntos, ConPlantillas {
    public function enviar(string $destinatario, string $mensaje): bool {
        echo "Enviando email a {$destinatario}\\n";
        return true;
    }
    
    public function programar(string $destinatario, string $mensaje, DateTime $fecha): bool {
        echo "Programando email para {$fecha->format('Y-m-d H:i')}\\n";
        return true;
    }
    
    public function enviarMasivo(array $destinatarios, string $mensaje): int {
        echo "Enviando a " . count($destinatarios) . " destinatarios\\n";
        return count($destinatarios);
    }
    
    public function enviarConAdjunto(string $destinatario, string $mensaje, array $archivos): bool {
        echo "Enviando email con " . count($archivos) . " adjuntos\\n";
        return true;
    }
    
    public function enviarConPlantilla(string $destinatario, string $plantilla, array $datos): bool {
        echo "Enviando email con plantilla {$plantilla}\\n";
        return true;
    }
}

// ✅ SMS solo soporta envío básico y masivo
class SMSNotificacion implements Enviable, Masivo {
    public function enviar(string $destinatario, string $mensaje): bool {
        echo "Enviando SMS a {$destinatario}\\n";
        return true;
    }
    
    public function enviarMasivo(array $destinatarios, string $mensaje): int {
        echo "Enviando SMS masivo\\n";
        return count($destinatarios);
    }
}

// ✅ Push solo envío básico
class PushNotificacion implements Enviable {
    public function enviar(string $destinatario, string $mensaje): bool {
        echo "Enviando push a {$destinatario}\\n";
        return true;
    }
}

// Uso con type hints específicos
function enviarNotificacion(Enviable $notificacion, string $dest, string $msg): void {
    $notificacion->enviar($dest, $msg);
}

function programarNotificacion(Programable $notificacion, string $dest, string $msg, DateTime $fecha): void {
    $notificacion->programar($dest, $msg, $fecha);
}

$email = new EmailNotificacion();
$sms = new SMSNotificacion();
$push = new PushNotificacion();

enviarNotificacion($email, "user@example.com", "Hola");
enviarNotificacion($sms, "+34123456789", "Hola");
enviarNotificacion($push, "device-token", "Hola");

programarNotificacion($email, "user@example.com", "Recordatorio", new DateTime('+1 day'));
// programarNotificacion($sms, ...);  // ❌ Error: SMS no es Programable
?&gt;</code></pre></div>

        <h3>ISP con Documentos</h3>
        <div class="code-block"><pre><code>&lt;?php
interface Imprimible {
    public function imprimir(): string;
}

interface Exportable {
    public function exportarPDF(): string;
    public function exportarExcel(): string;
}

interface Firmable {
    public function firmar(string $firma): bool;
    public function verificarFirma(): bool;
}

interface Encriptable {
    public function encriptar(string $clave): bool;
    public function desencriptar(string $clave): string;
}

interface Versionable {
    public function guardarVersion(): int;
    public function restaurarVersion(int $version): bool;
    public function getVersiones(): array;
}

// ✅ Documento simple: solo imprimible
class DocumentoSimple implements Imprimible {
    public function __construct(private string $contenido) {}
    
    public function imprimir(): string {
        return "Imprimiendo: {$this->contenido}";
    }
}

// ✅ Factura: imprimible y exportable
class Factura implements Imprimible, Exportable {
    public function __construct(
        private float $total,
        private string $cliente
    ) {}
    
    public function imprimir(): string {
        return "Factura para {$this->cliente}: \${$this->total}";
    }
    
    public function exportarPDF(): string {
        return "factura_{$this->cliente}.pdf";
    }
    
    public function exportarExcel(): string {
        return "factura_{$this->cliente}.xlsx";
    }
}

// ✅ Contrato: todo
class Contrato implements Imprimible, Exportable, Firmable, Encriptable, Versionable {
    private array $versiones = [];
    private ?string $firma = null;
    private bool $encriptado = false;
    
    public function __construct(private string $contenido) {}
    
    public function imprimir(): string {
        return "Contrato: {$this->contenido}";
    }
    
    public function exportarPDF(): string {
        return "contrato.pdf";
    }
    
    public function exportarExcel(): string {
        return "contrato.xlsx";
    }
    
    public function firmar(string $firma): bool {
        $this->firma = $firma;
        return true;
    }
    
    public function verificarFirma(): bool {
        return $this->firma !== null;
    }
    
    public function encriptar(string $clave): bool {
        $this->encriptado = true;
        return true;
    }
    
    public function desencriptar(string $clave): string {
        return $this->contenido;
    }
    
    public function guardarVersion(): int {
        $this->versiones[] = $this->contenido;
        return count($this->versiones);
    }
    
    public function restaurarVersion(int $version): bool {
        if (isset($this->versiones[$version - 1])) {
            $this->contenido = $this->versiones[$version - 1];
            return true;
        }
        return false;
    }
    
    public function getVersiones(): array {
        return $this->versiones;
    }
}

// Funciones que usan interfaces específicas
function imprimirDocumento(Imprimible $doc): void {
    echo $doc->imprimir() . "\\n";
}

function exportarDocumento(Exportable $doc): void {
    echo "PDF: " . $doc->exportarPDF() . "\\n";
    echo "Excel: " . $doc->exportarExcel() . "\\n";
}

function firmarDocumento(Firmable $doc, string $firma): void {
    if ($doc->firmar($firma)) {
        echo "Documento firmado\\n";
    }
}

$simple = new DocumentoSimple("Texto simple");
imprimirDocumento($simple);  // ✅ OK
// exportarDocumento($simple);  // ❌ Error: no es Exportable

$factura = new Factura(1000, "Juan");
imprimirDocumento($factura);  // ✅ OK
exportarDocumento($factura);  // ✅ OK
// firmarDocumento($factura, "firma");  // ❌ Error: no es Firmable

$contrato = new Contrato("Términos del contrato");
imprimirDocumento($contrato);  // ✅ OK
exportarDocumento($contrato);  // ✅ OK
firmarDocumento($contrato, "Juan Pérez");  // ✅ OK
?&gt;</code></pre></div>

        <h3>Ejemplo Completo: Sistema de Medios</h3>
        <div class="code-block"><pre><code>&lt;?php
// Interfaces segregadas para diferentes capacidades
interface Reproducible {
    public function reproducir(): void;
    public function pausar(): void;
    public function detener(): void;
}

interface Descargable {
    public function descargar(string $ruta): bool;
}

interface Compartible {
    public function compartir(string $plataforma): string;
}

interface ConSubtitulos {
    public function activarSubtitulos(string $idioma): bool;
    public function desactivarSubtitulos(): bool;
}

interface ConCalidad {
    public function cambiarCalidad(string $calidad): bool;
    public function getCalidadesDisponibles(): array;
}

interface ConLista {
    public function agregarALista(string $lista): bool;
    public function quitarDeLista(string $lista): bool;
}

// ✅ Audio: reproducible, descargable, compartible
class Audio implements Reproducible, Descargable, Compartible, ConLista {
    public function __construct(private string $titulo) {}
    
    public function reproducir(): void {
        echo "Reproduciendo audio: {$this->titulo}\\n";
    }
    
    public function pausar(): void {
        echo "Audio pausado\\n";
    }
    
    public function detener(): void {
        echo "Audio detenido\\n";
    }
    
    public function descargar(string $ruta): bool {
        echo "Descargando audio a {$ruta}\\n";
        return true;
    }
    
    public function compartir(string $plataforma): string {
        return "https://{$plataforma}/audio/{$this->titulo}";
    }
    
    public function agregarALista(string $lista): bool {
        echo "Añadido a lista: {$lista}\\n";
        return true;
    }
    
    public function quitarDeLista(string $lista): bool {
        echo "Quitado de lista: {$lista}\\n";
        return true;
    }
}

// ✅ Video: todas las capacidades
class Video implements Reproducible, Descargable, Compartible, ConSubtitulos, ConCalidad, ConLista {
    public function __construct(private string $titulo) {}
    
    public function reproducir(): void {
        echo "Reproduciendo video: {$this->titulo}\\n";
    }
    
    public function pausar(): void {
        echo "Video pausado\\n";
    }
    
    public function detener(): void {
        echo "Video detenido\\n";
    }
    
    public function descargar(string $ruta): bool {
        echo "Descargando video a {$ruta}\\n";
        return true;
    }
    
    public function compartir(string $plataforma): string {
        return "https://{$plataforma}/video/{$this->titulo}";
    }
    
    public function activarSubtitulos(string $idioma): bool {
        echo "Subtítulos activados: {$idioma}\\n";
        return true;
    }
    
    public function desactivarSubtitulos(): bool {
        echo "Subtítulos desactivados\\n";
        return true;
    }
    
    public function cambiarCalidad(string $calidad): bool {
        echo "Calidad cambiada a: {$calidad}\\n";
        return true;
    }
    
    public function getCalidadesDisponibles(): array {
        return ['360p', '480p', '720p', '1080p', '4K'];
    }
    
    public function agregarALista(string $lista): bool {
        echo "Video añadido a lista: {$lista}\\n";
        return true;
    }
    
    public function quitarDeLista(string $lista): bool {
        echo "Video quitado de lista: {$lista}\\n";
        return true;
    }
}

// ✅ Streaming en vivo: solo reproducible y con calidad
class StreamingEnVivo implements Reproducible, ConCalidad, Compartible {
    public function __construct(private string $canal) {}
    
    public function reproducir(): void {
        echo "Viendo stream en vivo: {$this->canal}\\n";
    }
    
    public function pausar(): void {
        echo "No se puede pausar un stream en vivo\\n";
    }
    
    public function detener(): void {
        echo "Stream detenido\\n";
    }
    
    public function cambiarCalidad(string $calidad): bool {
        echo "Calidad del stream: {$calidad}\\n";
        return true;
    }
    
    public function getCalidadesDisponibles(): array {
        return ['480p', '720p', '1080p'];
    }
    
    public function compartir(string $plataforma): string {
        return "https://{$plataforma}/live/{$this->canal}";
    }
}

// Reproductor que usa interfaces específicas
class ReproductorMultimedia {
    public function reproducir(Reproducible $medio): void {
        echo "=== Iniciando reproducción ===\\n";
        $medio->reproducir();
    }
    
    public function descargar(Descargable $medio, string $ruta): void {
        echo "=== Iniciando descarga ===\\n";
        $medio->descargar($ruta);
    }
    
    public function configurarSubtitulos(ConSubtitulos $medio, string $idioma): void {
        $medio->activarSubtitulos($idioma);
    }
    
    public function compartirEnRedes(Compartible $medio): void {
        echo "Facebook: " . $medio->compartir('facebook') . "\\n";
        echo "Twitter: " . $medio->compartir('twitter') . "\\n";
    }
}

// Uso
$reproductor = new ReproductorMultimedia();

$audio = new Audio("Canción.mp3");
$reproductor->reproducir($audio);
$reproductor->descargar($audio, "/descargas/");
$reproductor->compartirEnRedes($audio);

echo "\\n";

$video = new Video("Película.mp4");
$reproductor->reproducir($video);
$reproductor->configurarSubtitulos($video, "es");
$reproductor->descargar($video, "/descargas/");

echo "\\n";

$stream = new StreamingEnVivo("Canal Deportes");
$reproductor->reproducir($stream);
$reproductor->compartirEnRedes($stream);
// $reproductor->descargar($stream, "/descargas/");  // ❌ Error: no es Descargable
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Cómo Aplicar ISP:</strong><br>
            • <strong>Interfaces pequeñas</strong>: Una responsabilidad por interfaz<br>
            • <strong>Composición</strong>: Combina múltiples interfaces según necesidad<br>
            • <strong>Nombres descriptivos</strong>: El nombre debe indicar la capacidad<br>
            • <strong>Cohesión</strong>: Métodos relacionados en la misma interfaz<br>
            • <strong>Evita métodos vacíos</strong>: Si no implementas, no deberías tener la interfaz<br>
            • <strong>Piensa en clientes</strong>: Diseña interfaces desde el punto de vista del usuario<br>
            • <strong>Refactoriza</strong>: Divide interfaces grandes en específicas
        </div>

        <div class="warning-box">
            <strong>⚠️ Señales de Violación de ISP:</strong><br>
            • Métodos que lanzan <code>NotImplementedException</code><br>
            • Implementaciones vacías o con comentarios "no aplicable"<br>
            • Clases que implementan interfaces pero no usan todos los métodos<br>
            • Interfaces con muchos métodos no relacionados<br>
            • Necesitas implementar métodos que no tienen sentido para tu clase<br>
            • Cambios en la interfaz afectan a clases que no usan esos métodos
        </div>

        <div class="info-box">
            <strong>💡 Resumen:</strong><br>
            • <strong>Definición</strong>: No forzar a depender de métodos no utilizados<br>
            • <strong>Regla</strong>: Muchas interfaces específicas > Una interfaz general<br>
            • <strong>Beneficio</strong>: Clases más simples y desacopladas<br>
            • <strong>Técnica</strong>: Segregar interfaces por capacidades/roles<br>
            • <strong>Composición</strong>: Una clase puede implementar múltiples interfaces<br>
            • <strong>Type hints</strong>: Usa la interfaz más específica posible<br>
            • <strong>Complementa OCP</strong>: Facilita extensión sin modificación
        </div>
    `,
    'principio-dip': `
        <h1>Principio de Inversión de Dependencias (DIP)</h1>
        
        <p>El <strong>Principio de Inversión de Dependencias</strong> establece que los módulos de alto nivel no deben depender de módulos de bajo nivel. Ambos deben depender de abstracciones. Las abstracciones no deben depender de detalles, los detalles deben depender de abstracciones.</p>

        <div class="info-box">
            <strong>💡 Conceptos Clave:</strong><br>
            • <strong>Alto nivel</strong>: Lógica de negocio, casos de uso<br>
            • <strong>Bajo nivel</strong>: Detalles de implementación (BD, APIs, archivos)<br>
            • <strong>Abstracciones</strong>: Interfaces y clases abstractas<br>
            • <strong>Inversión</strong>: Los detalles dependen de abstracciones, no al revés<br>
            • <strong>Ventaja</strong>: Código desacoplado, testeable y flexible
        </div>

        <h3>❌ Violando DIP</h3>
        <div class="code-block"><pre><code>&lt;?php
// MAL: Clase de alto nivel depende directamente de implementaciones concretas
class MySQLConnection {
    public function connect(): void {
        echo "Conectando a MySQL\\n";
    }
    
    public function query(string $sql): array {
        echo "Ejecutando query MySQL: {$sql}\\n";
        return [];
    }
}

// ❌ UsuarioService depende de MySQLConnection (detalle de implementación)
class UsuarioService {
    private MySQLConnection $db;
    
    public function __construct() {
        // ❌ Acoplamiento fuerte: instancia directa
        $this->db = new MySQLConnection();
    }
    
    public function obtenerUsuario(int $id): array {
        $this->db->connect();
        return $this->db->query("SELECT * FROM usuarios WHERE id = {$id}");
    }
}

// Problemas:
// 1. No puedes cambiar a PostgreSQL sin modificar UsuarioService
// 2. No puedes testear sin una BD real
// 3. UsuarioService está acoplado a MySQL
// 4. Difícil de extender o mantener

$service = new UsuarioService();
$usuario = $service->obtenerUsuario(1);
?&gt;</code></pre></div>

        <h3>✅ Respetando DIP</h3>
        <div class="code-block"><pre><code>&lt;?php
// BIEN: Definir abstracción (interfaz)
interface DatabaseConnection {
    public function connect(): void;
    public function query(string $sql): array;
}

// Implementaciones concretas dependen de la abstracción
class MySQLConnection implements DatabaseConnection {
    public function connect(): void {
        echo "Conectando a MySQL\\n";
    }
    
    public function query(string $sql): array {
        echo "Ejecutando query MySQL: {$sql}\\n";
        return [];
    }
}

class PostgreSQLConnection implements DatabaseConnection {
    public function connect(): void {
        echo "Conectando a PostgreSQL\\n";
    }
    
    public function query(string $sql): array {
        echo "Ejecutando query PostgreSQL: {$sql}\\n";
        return [];
    }
}

// ✅ Clase de alto nivel depende de abstracción
class UsuarioService {
    // Inyección de dependencia: recibe la abstracción
    public function __construct(
        private DatabaseConnection $db
    ) {}
    
    public function obtenerUsuario(int $id): array {
        $this->db->connect();
        return $this->db->query("SELECT * FROM usuarios WHERE id = {$id}");
    }
}

// Uso: Inyectamos la implementación concreta
$mysqlDb = new MySQLConnection();
$service1 = new UsuarioService($mysqlDb);
$service1->obtenerUsuario(1);

// Fácil cambiar a PostgreSQL
$postgresDb = new PostgreSQLConnection();
$service2 = new UsuarioService($postgresDb);
$service2->obtenerUsuario(1);

// Fácil testear con mock
class MockConnection implements DatabaseConnection {
    public function connect(): void {}
    public function query(string $sql): array {
        return ['id' => 1, 'nombre' => 'Test'];
    }
}

$mockDb = new MockConnection();
$serviceTest = new UsuarioService($mockDb);
?&gt;</code></pre></div>

        <h3>DIP con Repositorios</h3>
        <div class="code-block"><pre><code>&lt;?php
// Abstracción de repositorio
interface UsuarioRepository {
    public function buscarPorId(int $id): ?array;
    public function guardar(array $datos): int;
    public function eliminar(int $id): bool;
}

// Implementación con MySQL
class MySQLUsuarioRepository implements UsuarioRepository {
    public function __construct(
        private DatabaseConnection $db
    ) {}
    
    public function buscarPorId(int $id): ?array {
        $resultado = $this->db->query("SELECT * FROM usuarios WHERE id = {$id}");
        return $resultado[0] ?? null;
    }
    
    public function guardar(array $datos): int {
        echo "Guardando en MySQL\\n";
        return 1;
    }
    
    public function eliminar(int $id): bool {
        echo "Eliminando de MySQL\\n";
        return true;
    }
}

// Implementación con API REST
class APIUsuarioRepository implements UsuarioRepository {
    public function __construct(
        private string $apiUrl
    ) {}
    
    public function buscarPorId(int $id): ?array {
        echo "GET {$this->apiUrl}/usuarios/{$id}\\n";
        return ['id' => $id, 'nombre' => 'Usuario API'];
    }
    
    public function guardar(array $datos): int {
        echo "POST {$this->apiUrl}/usuarios\\n";
        return 1;
    }
    
    public function eliminar(int $id): bool {
        echo "DELETE {$this->apiUrl}/usuarios/{$id}\\n";
        return true;
    }
}

// Implementación en memoria (para tests)
class InMemoryUsuarioRepository implements UsuarioRepository {
    private array $usuarios = [];
    private int $nextId = 1;
    
    public function buscarPorId(int $id): ?array {
        return $this->usuarios[$id] ?? null;
    }
    
    public function guardar(array $datos): int {
        $id = $this->nextId++;
        $this->usuarios[$id] = array_merge(['id' => $id], $datos);
        return $id;
    }
    
    public function eliminar(int $id): bool {
        if (isset($this->usuarios[$id])) {
            unset($this->usuarios[$id]);
            return true;
        }
        return false;
    }
}

// ✅ Caso de uso depende de abstracción
class CrearUsuarioUseCase {
    public function __construct(
        private UsuarioRepository $repository
    ) {}
    
    public function ejecutar(string $nombre, string $email): int {
        $datos = ['nombre' => $nombre, 'email' => $email];
        return $this->repository->guardar($datos);
    }
}

// Uso flexible
$mysqlRepo = new MySQLUsuarioRepository(new MySQLConnection());
$useCase1 = new CrearUsuarioUseCase($mysqlRepo);
$useCase1->ejecutar("Juan", "juan@example.com");

$apiRepo = new APIUsuarioRepository("https://api.example.com");
$useCase2 = new CrearUsuarioUseCase($apiRepo);
$useCase2->ejecutar("Ana", "ana@example.com");

$memoryRepo = new InMemoryUsuarioRepository();
$useCase3 = new CrearUsuarioUseCase($memoryRepo);
$useCase3->ejecutar("Test", "test@example.com");
?&gt;</code></pre></div>

        <h3>DIP con Servicios Externos</h3>
        <div class="code-block"><pre><code>&lt;?php
// Abstracción para envío de emails
interface EmailSender {
    public function enviar(string $destinatario, string $asunto, string $cuerpo): bool;
}

// Implementación con SMTP
class SMTPEmailSender implements EmailSender {
    public function __construct(
        private string $host,
        private int $port,
        private string $usuario,
        private string $password
    ) {}
    
    public function enviar(string $destinatario, string $asunto, string $cuerpo): bool {
        echo "Enviando email vía SMTP ({$this->host}:{$this->port})\\n";
        echo "Para: {$destinatario}\\n";
        echo "Asunto: {$asunto}\\n";
        return true;
    }
}

// Implementación con API (SendGrid, Mailgun, etc.)
class APIEmailSender implements EmailSender {
    public function __construct(
        private string $apiKey,
        private string $apiUrl
    ) {}
    
    public function enviar(string $destinatario, string $asunto, string $cuerpo): bool {
        echo "Enviando email vía API ({$this->apiUrl})\\n";
        echo "Para: {$destinatario}\\n";
        echo "Asunto: {$asunto}\\n";
        return true;
    }
}

// Implementación para desarrollo/testing
class LogEmailSender implements EmailSender {
    public function enviar(string $destinatario, string $asunto, string $cuerpo): bool {
        echo "[LOG] Email para {$destinatario}: {$asunto}\\n";
        return true;
    }
}

// ✅ Servicio de notificaciones depende de abstracción
class NotificacionService {
    public function __construct(
        private EmailSender $emailSender
    ) {}
    
    public function notificarRegistro(string $email, string $nombre): void {
        $asunto = "Bienvenido {$nombre}";
        $cuerpo = "Gracias por registrarte en nuestra plataforma.";
        $this->emailSender->enviar($email, $asunto, $cuerpo);
    }
    
    public function notificarCompra(string $email, float $total): void {
        $asunto = "Confirmación de compra";
        $cuerpo = "Tu compra de \${$total} ha sido procesada.";
        $this->emailSender->enviar($email, $asunto, $cuerpo);
    }
}

// Uso en producción
$smtpSender = new SMTPEmailSender("smtp.example.com", 587, "user", "pass");
$notificaciones = new NotificacionService($smtpSender);
$notificaciones->notificarRegistro("user@example.com", "Juan");

// Uso en desarrollo
$logSender = new LogEmailSender();
$notificacionesDev = new NotificacionService($logSender);
$notificacionesDev->notificarCompra("test@example.com", 100);
?&gt;</code></pre></div>

        <h3>DIP con Logging</h3>
        <div class="code-block"><pre><code>&lt;?php
// Abstracción para logging
interface Logger {
    public function info(string $mensaje): void;
    public function error(string $mensaje): void;
    public function debug(string $mensaje): void;
}

// Implementación con archivos
class FileLogger implements Logger {
    public function __construct(private string $rutaArchivo) {}
    
    public function info(string $mensaje): void {
        $this->escribir("INFO", $mensaje);
    }
    
    public function error(string $mensaje): void {
        $this->escribir("ERROR", $mensaje);
    }
    
    public function debug(string $mensaje): void {
        $this->escribir("DEBUG", $mensaje);
    }
    
    private function escribir(string $nivel, string $mensaje): void {
        $timestamp = date('Y-m-d H:i:s');
        echo "[{$timestamp}] [{$nivel}] {$mensaje} -> {$this->rutaArchivo}\\n";
    }
}

// Implementación con base de datos
class DatabaseLogger implements Logger {
    public function __construct(private DatabaseConnection $db) {}
    
    public function info(string $mensaje): void {
        $this->log("INFO", $mensaje);
    }
    
    public function error(string $mensaje): void {
        $this->log("ERROR", $mensaje);
    }
    
    public function debug(string $mensaje): void {
        $this->log("DEBUG", $mensaje);
    }
    
    private function log(string $nivel, string $mensaje): void {
        echo "INSERT INTO logs (nivel, mensaje) VALUES ('{$nivel}', '{$mensaje}')\\n";
    }
}

// Implementación múltiple (composite)
class MultiLogger implements Logger {
    /** @var Logger[] */
    private array $loggers = [];
    
    public function agregar(Logger $logger): void {
        $this->loggers[] = $logger;
    }
    
    public function info(string $mensaje): void {
        foreach ($this->loggers as $logger) {
            $logger->info($mensaje);
        }
    }
    
    public function error(string $mensaje): void {
        foreach ($this->loggers as $logger) {
            $logger->error($mensaje);
        }
    }
    
    public function debug(string $mensaje): void {
        foreach ($this->loggers as $logger) {
            $logger->debug($mensaje);
        }
    }
}

// ✅ Aplicación depende de abstracción
class ProcesadorPagos {
    public function __construct(
        private Logger $logger
    ) {}
    
    public function procesar(float $monto): bool {
        $this->logger->info("Iniciando procesamiento de pago: \${$monto}");
        
        try {
            // Lógica de procesamiento
            $this->logger->debug("Validando datos de pago");
            
            // Simular procesamiento
            if ($monto > 0) {
                $this->logger->info("Pago procesado exitosamente");
                return true;
            }
            
            $this->logger->error("Monto inválido");
            return false;
        } catch (Exception $e) {
            $this->logger->error("Error al procesar pago: " . $e->getMessage());
            return false;
        }
    }
}

// Uso con diferentes loggers
$fileLogger = new FileLogger("/var/log/app.log");
$procesador1 = new ProcesadorPagos($fileLogger);
$procesador1->procesar(100);

// Uso con múltiples loggers
$multiLogger = new MultiLogger();
$multiLogger->agregar(new FileLogger("/var/log/app.log"));
$multiLogger->agregar(new DatabaseLogger(new MySQLConnection()));

$procesador2 = new ProcesadorPagos($multiLogger);
$procesador2->procesar(200);
?&gt;</code></pre></div>

        <h3>Ejemplo Completo: Sistema de E-commerce</h3>
        <div class="code-block"><pre><code>&lt;?php
// ========== ABSTRACCIONES ==========

interface ProductoRepository {
    public function buscarPorId(int $id): ?array;
    public function buscarTodos(): array;
}

interface CarritoRepository {
    public function obtener(int $usuarioId): array;
    public function agregar(int $usuarioId, int $productoId, int $cantidad): bool;
}

interface ProcesadorPago {
    public function procesar(float $monto, array $datosPago): bool;
}

interface NotificadorPedido {
    public function notificar(int $pedidoId, string $email): void;
}

interface Logger {
    public function info(string $mensaje): void;
    public function error(string $mensaje): void;
}

// ========== IMPLEMENTACIONES ==========

class MySQLProductoRepository implements ProductoRepository {
    public function __construct(private DatabaseConnection $db) {}
    
    public function buscarPorId(int $id): ?array {
        echo "Buscando producto {$id} en MySQL\\n";
        return ['id' => $id, 'nombre' => 'Producto', 'precio' => 100];
    }
    
    public function buscarTodos(): array {
        echo "Obteniendo todos los productos de MySQL\\n";
        return [];
    }
}

class RedisCarritoRepository implements CarritoRepository {
    public function obtener(int $usuarioId): array {
        echo "Obteniendo carrito de Redis para usuario {$usuarioId}\\n";
        return [
            ['producto_id' => 1, 'cantidad' => 2],
            ['producto_id' => 2, 'cantidad' => 1]
        ];
    }
    
    public function agregar(int $usuarioId, int $productoId, int $cantidad): bool {
        echo "Agregando al carrito en Redis\\n";
        return true;
    }
}

class StripeProcesadorPago implements ProcesadorPago {
    public function __construct(private string $apiKey) {}
    
    public function procesar(float $monto, array $datosPago): bool {
        echo "Procesando \${$monto} con Stripe\\n";
        return true;
    }
}

class EmailNotificadorPedido implements NotificadorPedido {
    public function __construct(private EmailSender $emailSender) {}
    
    public function notificar(int $pedidoId, string $email): void {
        $asunto = "Pedido #{$pedidoId} confirmado";
        $cuerpo = "Tu pedido ha sido procesado exitosamente.";
        $this->emailSender->enviar($email, $asunto, $cuerpo);
    }
}

// ========== CASO DE USO (ALTO NIVEL) ==========

class ProcesarPedidoUseCase {
    public function __construct(
        private ProductoRepository $productoRepo,
        private CarritoRepository $carritoRepo,
        private ProcesadorPago $procesadorPago,
        private NotificadorPedido $notificador,
        private Logger $logger
    ) {}
    
    public function ejecutar(int $usuarioId, string $email, array $datosPago): bool {
        $this->logger->info("Iniciando procesamiento de pedido para usuario {$usuarioId}");
        
        try {
            // 1. Obtener carrito
            $items = $this->carritoRepo->obtener($usuarioId);
            if (empty($items)) {
                $this->logger->error("Carrito vacío");
                return false;
            }
            
            // 2. Calcular total
            $total = 0;
            foreach ($items as $item) {
                $producto = $this->productoRepo->buscarPorId($item['producto_id']);
                if ($producto) {
                    $total += $producto['precio'] * $item['cantidad'];
                }
            }
            
            $this->logger->info("Total del pedido: \${$total}");
            
            // 3. Procesar pago
            if (!$this->procesadorPago->procesar($total, $datosPago)) {
                $this->logger->error("Error al procesar pago");
                return false;
            }
            
            // 4. Notificar
            $pedidoId = rand(1000, 9999);
            $this->notificador->notificar($pedidoId, $email);
            
            $this->logger->info("Pedido #{$pedidoId} procesado exitosamente");
            return true;
            
        } catch (Exception $e) {
            $this->logger->error("Error: " . $e->getMessage());
            return false;
        }
    }
}

// ========== CONFIGURACIÓN Y USO ==========

// Configurar dependencias (normalmente en un contenedor DI)
$db = new MySQLConnection();
$productoRepo = new MySQLProductoRepository($db);
$carritoRepo = new RedisCarritoRepository();
$procesadorPago = new StripeProcesadorPago("sk_test_123");
$emailSender = new SMTPEmailSender("smtp.example.com", 587, "user", "pass");
$notificador = new EmailNotificadorPedido($emailSender);
$logger = new FileLogger("/var/log/pedidos.log");

// Crear caso de uso con todas las dependencias
$procesarPedido = new ProcesarPedidoUseCase(
    $productoRepo,
    $carritoRepo,
    $procesadorPago,
    $notificador,
    $logger
);

// Ejecutar
$resultado = $procesarPedido->ejecutar(
    usuarioId: 1,
    email: "cliente@example.com",
    datosPago: ['token' => 'tok_123']
);

echo $resultado ? "✅ Pedido procesado" : "❌ Error al procesar";

// ========== VENTAJAS ==========
// 1. Fácil cambiar MySQL por PostgreSQL
// 2. Fácil cambiar Stripe por PayPal
// 3. Fácil cambiar Redis por Memcached
// 4. Fácil testear con mocks
// 5. Cada componente es independiente
// 6. Código desacoplado y mantenible
?&gt;</code></pre></div>

        <h3>DIP con Contenedor de Dependencias</h3>
        <div class="code-block"><pre><code>&lt;?php
// Contenedor DI simple
class Container {
    private array $bindings = [];
    private array $instances = [];
    
    public function bind(string $abstract, callable $concrete): void {
        $this->bindings[$abstract] = $concrete;
    }
    
    public function singleton(string $abstract, callable $concrete): void {
        $this->bind($abstract, function() use ($abstract, $concrete) {
            if (!isset($this->instances[$abstract])) {
                $this->instances[$abstract] = $concrete($this);
            }
            return $this->instances[$abstract];
        });
    }
    
    public function make(string $abstract): mixed {
        if (isset($this->bindings[$abstract])) {
            return $this->bindings[$abstract]($this);
        }
        
        throw new Exception("No se encontró binding para {$abstract}");
    }
}

// Configurar contenedor
$container = new Container();

// Registrar dependencias
$container->singleton(DatabaseConnection::class, function() {
    return new MySQLConnection();
});

$container->bind(UsuarioRepository::class, function($c) {
    return new MySQLUsuarioRepository($c->make(DatabaseConnection::class));
});

$container->bind(EmailSender::class, function() {
    return new SMTPEmailSender("smtp.example.com", 587, "user", "pass");
});

$container->bind(Logger::class, function() {
    return new FileLogger("/var/log/app.log");
});

// Resolver dependencias automáticamente
$repository = $container->make(UsuarioRepository::class);
$emailSender = $container->make(EmailSender::class);
$logger = $container->make(Logger::class);

// Crear servicio con dependencias resueltas
$service = new NotificacionService($emailSender);
$service->notificarRegistro("user@example.com", "Juan");
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Cómo Aplicar DIP:</strong><br>
            • <strong>Define abstracciones</strong>: Interfaces para todos los servicios externos<br>
            • <strong>Inyección de dependencias</strong>: Pasa dependencias por constructor<br>
            • <strong>Depende de interfaces</strong>: No de implementaciones concretas<br>
            • <strong>Invierte el control</strong>: Las implementaciones dependen de abstracciones<br>
            • <strong>Usa contenedores DI</strong>: Para gestionar dependencias complejas<br>
            • <strong>Testea con mocks</strong>: Fácil crear implementaciones de prueba<br>
            • <strong>Configuración externa</strong>: Decide implementaciones fuera del código
        </div>

        <div class="warning-box">
            <strong>⚠️ Señales de Violación de DIP:</strong><br>
            • Uso de <code>new</code> para crear dependencias dentro de clases<br>
            • Clases que dependen de implementaciones concretas<br>
            • Imposible testear sin dependencias reales<br>
            • Difícil cambiar implementaciones (BD, APIs, etc.)<br>
            • Código acoplado a detalles de infraestructura<br>
            • No puedes reutilizar lógica de negocio con diferentes implementaciones
        </div>

        <div class="info-box">
            <strong>💡 Resumen:</strong><br>
            • <strong>Definición</strong>: Depende de abstracciones, no de implementaciones<br>
            • <strong>Regla 1</strong>: Módulos de alto nivel no dependen de bajo nivel<br>
            • <strong>Regla 2</strong>: Ambos dependen de abstracciones<br>
            • <strong>Inversión</strong>: Los detalles dependen de abstracciones<br>
            • <strong>Técnica</strong>: Inyección de dependencias por constructor<br>
            • <strong>Beneficio</strong>: Código desacoplado, testeable y flexible<br>
            • <strong>Complementa</strong>: Funciona con todos los demás principios SOLID
        </div>
    `,
    'aplicacion-solid': `
        <h1>Aplicación de SOLID en PHP</h1>
        
        <p>Veamos cómo aplicar <strong>todos los principios SOLID</strong> juntos en un sistema real de gestión de pedidos. Este ejemplo integra SRP, OCP, LSP, ISP y DIP en una arquitectura cohesiva.</p>

        <div class="info-box">
            <strong>💡 Sistema de Ejemplo:</strong><br>
            • <strong>Dominio</strong>: Gestión de pedidos en e-commerce<br>
            • <strong>Funcionalidades</strong>: Crear pedido, procesar pago, enviar notificación<br>
            • <strong>Principios</strong>: Todos los SOLID aplicados<br>
            • <strong>Arquitectura</strong>: Hexagonal (Ports & Adapters)<br>
            • <strong>Patrones</strong>: Repository, Strategy, Dependency Injection
        </div>

        <h3>1. Definir Abstracciones (DIP + ISP)</h3>
        <div class="code-block"><pre><code>&lt;?php
// ========== INTERFACES SEGREGADAS (ISP) ==========

// Repositorio de productos
interface ProductoRepository {
    public function buscarPorId(int $id): ?Producto;
    public function buscarDisponibles(): array;
}

// Repositorio de pedidos
interface PedidoRepository {
    public function guardar(Pedido $pedido): int;
    public function buscarPorId(int $id): ?Pedido;
}

// Procesador de pagos (Strategy Pattern)
interface ProcesadorPago {
    public function procesar(float $monto, array $datosPago): ResultadoPago;
    public function soporta(string $metodo): bool;
}

// Calculador de descuentos (Strategy Pattern)
interface CalculadorDescuento {
    public function calcular(Pedido $pedido): float;
    public function aplicable(Cliente $cliente): bool;
}

// Notificador
interface Notificador {
    public function notificar(Pedido $pedido, Cliente $cliente): void;
}

// Logger
interface Logger {
    public function info(string $mensaje, array $contexto = []): void;
    public function error(string $mensaje, array $contexto = []): void;
}

// Validador
interface ValidadorPedido {
    public function validar(Pedido $pedido): ResultadoValidacion;
}
?&gt;</code></pre></div>

        <h3>2. Entidades de Dominio (SRP)</h3>
        <div class="code-block"><pre><code>&lt;?php
// ========== ENTIDADES CON RESPONSABILIDAD ÚNICA (SRP) ==========

// Cada clase tiene UNA responsabilidad clara

class Producto {
    public function __construct(
        private int $id,
        private string $nombre,
        private float $precio,
        private int $stock
    ) {}
    
    public function getId(): int {
        return $this->id;
    }
    
    public function getNombre(): string {
        return $this->nombre;
    }
    
    public function getPrecio(): float {
        return $this->precio;
    }
    
    public function hayStock(int $cantidad): bool {
        return $this->stock >= $cantidad;
    }
    
    public function reducirStock(int $cantidad): void {
        if (!$this->hayStock($cantidad)) {
            throw new DomainException("Stock insuficiente");
        }
        $this->stock -= $cantidad;
    }
}

class ItemPedido {
    public function __construct(
        private Producto $producto,
        private int $cantidad
    ) {
        if ($cantidad <= 0) {
            throw new InvalidArgumentException("Cantidad debe ser positiva");
        }
    }
    
    public function getProducto(): Producto {
        return $this->producto;
    }
    
    public function getCantidad(): int {
        return $this->cantidad;
    }
    
    public function getSubtotal(): float {
        return $this->producto->getPrecio() * $this->cantidad;
    }
}

class Cliente {
    public function __construct(
        private int $id,
        private string $nombre,
        private string $email,
        private string $tipo  // 'regular', 'premium', 'vip'
    ) {}
    
    public function getId(): int {
        return $this->id;
    }
    
    public function getNombre(): string {
        return $this->nombre;
    }
    
    public function getEmail(): string {
        return $this->email;
    }
    
    public function getTipo(): string {
        return $this->tipo;
    }
    
    public function esPremium(): bool {
        return in_array($this->tipo, ['premium', 'vip']);
    }
}

enum EstadoPedido: string {
    case PENDIENTE = 'pendiente';
    case PAGADO = 'pagado';
    case ENVIADO = 'enviado';
    case CANCELADO = 'cancelado';
}

class Pedido {
    private array $items = [];
    private EstadoPedido $estado;
    private float $descuento = 0;
    private ?int $id = null;
    
    public function __construct(
        private Cliente $cliente,
        private DateTime $fecha
    ) {
        $this->estado = EstadoPedido::PENDIENTE;
    }
    
    public function agregarItem(ItemPedido $item): void {
        $this->items[] = $item;
    }
    
    public function getItems(): array {
        return $this->items;
    }
    
    public function getCliente(): Cliente {
        return $this->cliente;
    }
    
    public function getFecha(): DateTime {
        return $this->fecha;
    }
    
    public function getEstado(): EstadoPedido {
        return $this->estado;
    }
    
    public function marcarComoPagado(): void {
        if ($this->estado !== EstadoPedido::PENDIENTE) {
            throw new DomainException("Solo pedidos pendientes pueden marcarse como pagados");
        }
        $this->estado = EstadoPedido::PAGADO;
    }
    
    public function getSubtotal(): float {
        return array_reduce(
            $this->items,
            fn($total, $item) => $total + $item->getSubtotal(),
            0
        );
    }
    
    public function aplicarDescuento(float $descuento): void {
        if ($descuento < 0 || $descuento > $this->getSubtotal()) {
            throw new InvalidArgumentException("Descuento inválido");
        }
        $this->descuento = $descuento;
    }
    
    public function getDescuento(): float {
        return $this->descuento;
    }
    
    public function getTotal(): float {
        return $this->getSubtotal() - $this->descuento;
    }
    
    public function setId(int $id): void {
        $this->id = $id;
    }
    
    public function getId(): ?int {
        return $this->id;
    }
}

class ResultadoPago {
    public function __construct(
        private bool $exitoso,
        private string $transaccionId,
        private ?string $mensaje = null
    ) {}
    
    public function esExitoso(): bool {
        return $this->exitoso;
    }
    
    public function getTransaccionId(): string {
        return $this->transaccionId;
    }
    
    public function getMensaje(): ?string {
        return $this->mensaje;
    }
}

class ResultadoValidacion {
    private array $errores = [];
    
    public function agregarError(string $error): void {
        $this->errores[] = $error;
    }
    
    public function esValido(): bool {
        return empty($this->errores);
    }
    
    public function getErrores(): array {
        return $this->errores;
    }
}
?&gt;</code></pre></div>

        <h3>3. Implementaciones Concretas (LSP + OCP)</h3>
        <div class="code-block"><pre><code>&lt;?php
// ========== ESTRATEGIAS DE DESCUENTO (OCP + LSP) ==========

// Abierto para extensión, cerrado para modificación
class DescuentoRegular implements CalculadorDescuento {
    public function calcular(Pedido $pedido): float {
        return $pedido->getSubtotal() * 0.05;  // 5%
    }
    
    public function aplicable(Cliente $cliente): bool {
        return $cliente->getTipo() === 'regular';
    }
}

class DescuentoPremium implements CalculadorDescuento {
    public function calcular(Pedido $pedido): float {
        return $pedido->getSubtotal() * 0.10;  // 10%
    }
    
    public function aplicable(Cliente $cliente): bool {
        return $cliente->getTipo() === 'premium';
    }
}

class DescuentoVIP implements CalculadorDescuento {
    public function calcular(Pedido $pedido): float {
        $descuento = $pedido->getSubtotal() * 0.15;  // 15%
        
        // VIP: descuento adicional si compra > $500
        if ($pedido->getSubtotal() > 500) {
            $descuento += 50;
        }
        
        return $descuento;
    }
    
    public function aplicable(Cliente $cliente): bool {
        return $cliente->getTipo() === 'vip';
    }
}

// ========== PROCESADORES DE PAGO (OCP + LSP) ==========

class ProcesadorTarjeta implements ProcesadorPago {
    public function procesar(float $monto, array $datosPago): ResultadoPago {
        // Simular procesamiento
        $transaccionId = 'TXN_' . uniqid();
        
        if (isset($datosPago['numero']) && strlen($datosPago['numero']) === 16) {
            return new ResultadoPago(true, $transaccionId, "Pago con tarjeta exitoso");
        }
        
        return new ResultadoPago(false, $transaccionId, "Datos de tarjeta inválidos");
    }
    
    public function soporta(string $metodo): bool {
        return $metodo === 'tarjeta';
    }
}

class ProcesadorPayPal implements ProcesadorPago {
    public function procesar(float $monto, array $datosPago): ResultadoPago {
        $transaccionId = 'PAYPAL_' . uniqid();
        
        if (isset($datosPago['email'])) {
            return new ResultadoPago(true, $transaccionId, "Pago con PayPal exitoso");
        }
        
        return new ResultadoPago(false, $transaccionId, "Email de PayPal inválido");
    }
    
    public function soporta(string $metodo): bool {
        return $metodo === 'paypal';
    }
}

// ========== NOTIFICADORES (OCP + LSP) ==========

class NotificadorEmail implements Notificador {
    public function __construct(
        private string $remitente
    ) {}
    
    public function notificar(Pedido $pedido, Cliente $cliente): void {
        echo "📧 Email enviado a {$cliente->getEmail()}\\n";
        echo "   Pedido #{$pedido->getId()} - Total: \${$pedido->getTotal()}\\n";
    }
}

class NotificadorSMS implements Notificador {
    public function notificar(Pedido $pedido, Cliente $cliente): void {
        echo "📱 SMS enviado al cliente {$cliente->getNombre()}\\n";
        echo "   Pedido #{$pedido->getId()} confirmado\\n";
    }
}

class NotificadorMultiple implements Notificador {
    private array $notificadores = [];
    
    public function agregar(Notificador $notificador): void {
        $this->notificadores[] = $notificador;
    }
    
    public function notificar(Pedido $pedido, Cliente $cliente): void {
        foreach ($this->notificadores as $notificador) {
            $notificador->notificar($pedido, $cliente);
        }
    }
}

// ========== VALIDADORES (SRP) ==========

class ValidadorStockPedido implements ValidadorPedido {
    public function validar(Pedido $pedido): ResultadoValidacion {
        $resultado = new ResultadoValidacion();
        
        foreach ($pedido->getItems() as $item) {
            if (!$item->getProducto()->hayStock($item->getCantidad())) {
                $resultado->agregarError(
                    "Stock insuficiente para: {$item->getProducto()->getNombre()}"
                );
            }
        }
        
        return $resultado;
    }
}

class ValidadorMontoPedido implements ValidadorPedido {
    public function __construct(
        private float $montoMinimo = 10
    ) {}
    
    public function validar(Pedido $pedido): ResultadoValidacion {
        $resultado = new ResultadoValidacion();
        
        if ($pedido->getTotal() < $this->montoMinimo) {
            $resultado->agregarError(
                "El monto mínimo es \${$this->montoMinimo}"
            );
        }
        
        return $resultado;
    }
}

// ========== LOGGER SIMPLE ==========

class FileLogger implements Logger {
    public function __construct(private string $archivo) {}
    
    public function info(string $mensaje, array $contexto = []): void {
        $this->log('INFO', $mensaje, $contexto);
    }
    
    public function error(string $mensaje, array $contexto = []): void {
        $this->log('ERROR', $mensaje, $contexto);
    }
    
    private function log(string $nivel, string $mensaje, array $contexto): void {
        $timestamp = date('Y-m-d H:i:s');
        $contextoStr = !empty($contexto) ? json_encode($contexto) : '';
        echo "[{$timestamp}] [{$nivel}] {$mensaje} {$contextoStr}\\n";
    }
}
?&gt;</code></pre></div>

        <h3>4. Caso de Uso (SRP + DIP)</h3>
        <div class="code-block"><pre><code>&lt;?php
// ========== CASO DE USO: PROCESAR PEDIDO ==========
// Aplica SRP: Una sola responsabilidad (procesar pedido)
// Aplica DIP: Depende de abstracciones, no de implementaciones

class ProcesarPedidoUseCase {
    public function __construct(
        private PedidoRepository $pedidoRepo,
        private ProductoRepository $productoRepo,
        private array $calculadoresDescuento,  // CalculadorDescuento[]
        private ProcesadorPago $procesadorPago,
        private Notificador $notificador,
        private array $validadores,  // ValidadorPedido[]
        private Logger $logger
    ) {}
    
    public function ejecutar(
        Cliente $cliente,
        array $itemsData,  // [['producto_id' => int, 'cantidad' => int]]
        string $metodoPago,
        array $datosPago
    ): ResultadoPedido {
        $this->logger->info("Iniciando procesamiento de pedido", [
            'cliente_id' => $cliente->getId(),
            'metodo_pago' => $metodoPago
        ]);
        
        try {
            // 1. Crear pedido
            $pedido = new Pedido($cliente, new DateTime());
            
            // 2. Agregar items
            foreach ($itemsData as $itemData) {
                $producto = $this->productoRepo->buscarPorId($itemData['producto_id']);
                
                if (!$producto) {
                    throw new DomainException("Producto no encontrado: {$itemData['producto_id']}");
                }
                
                $item = new ItemPedido($producto, $itemData['cantidad']);
                $pedido->agregarItem($item);
            }
            
            // 3. Aplicar descuento (OCP: fácil agregar nuevos descuentos)
            foreach ($this->calculadoresDescuento as $calculador) {
                if ($calculador->aplicable($cliente)) {
                    $descuento = $calculador->calcular($pedido);
                    $pedido->aplicarDescuento($descuento);
                    $this->logger->info("Descuento aplicado", [
                        'tipo' => get_class($calculador),
                        'monto' => $descuento
                    ]);
                    break;
                }
            }
            
            // 4. Validar pedido (SRP: cada validador una responsabilidad)
            foreach ($this->validadores as $validador) {
                $resultado = $validador->validar($pedido);
                if (!$resultado->esValido()) {
                    $errores = implode(', ', $resultado->getErrores());
                    $this->logger->error("Validación fallida", ['errores' => $errores]);
                    return new ResultadoPedido(false, null, $errores);
                }
            }
            
            // 5. Procesar pago (LSP: cualquier procesador funciona)
            if (!$this->procesadorPago->soporta($metodoPago)) {
                throw new InvalidArgumentException("Método de pago no soportado: {$metodoPago}");
            }
            
            $resultadoPago = $this->procesadorPago->procesar(
                $pedido->getTotal(),
                $datosPago
            );
            
            if (!$resultadoPago->esExitoso()) {
                $this->logger->error("Pago fallido", [
                    'mensaje' => $resultadoPago->getMensaje()
                ]);
                return new ResultadoPedido(false, null, $resultadoPago->getMensaje());
            }
            
            // 6. Actualizar estado y guardar
            $pedido->marcarComoPagado();
            $pedidoId = $this->pedidoRepo->guardar($pedido);
            $pedido->setId($pedidoId);
            
            // 7. Reducir stock
            foreach ($pedido->getItems() as $item) {
                $item->getProducto()->reducirStock($item->getCantidad());
            }
            
            // 8. Notificar (ISP: solo usa lo que necesita)
            $this->notificador->notificar($pedido, $cliente);
            
            $this->logger->info("Pedido procesado exitosamente", [
                'pedido_id' => $pedidoId,
                'total' => $pedido->getTotal()
            ]);
            
            return new ResultadoPedido(true, $pedido, "Pedido procesado exitosamente");
            
        } catch (Exception $e) {
            $this->logger->error("Error al procesar pedido", [
                'error' => $e->getMessage()
            ]);
            return new ResultadoPedido(false, null, $e->getMessage());
        }
    }
}

class ResultadoPedido {
    public function __construct(
        private bool $exitoso,
        private ?Pedido $pedido,
        private ?string $mensaje
    ) {}
    
    public function esExitoso(): bool {
        return $this->exitoso;
    }
    
    public function getPedido(): ?Pedido {
        return $this->pedido;
    }
    
    public function getMensaje(): ?string {
        return $this->mensaje;
    }
}
?&gt;</code></pre></div>

        <h3>5. Repositorios (Implementación)</h3>
        <div class="code-block"><pre><code>&lt;?php
// ========== REPOSITORIOS (DIP) ==========

class InMemoryProductoRepository implements ProductoRepository {
    private array $productos = [];
    
    public function __construct() {
        // Datos de ejemplo
        $this->productos[1] = new Producto(1, "Laptop", 1000, 10);
        $this->productos[2] = new Producto(2, "Mouse", 25, 50);
        $this->productos[3] = new Producto(3, "Teclado", 75, 30);
    }
    
    public function buscarPorId(int $id): ?Producto {
        return $this->productos[$id] ?? null;
    }
    
    public function buscarDisponibles(): array {
        return array_values($this->productos);
    }
}

class InMemoryPedidoRepository implements PedidoRepository {
    private array $pedidos = [];
    private int $nextId = 1;
    
    public function guardar(Pedido $pedido): int {
        $id = $this->nextId++;
        $pedido->setId($id);
        $this->pedidos[$id] = $pedido;
        return $id;
    }
    
    public function buscarPorId(int $id): ?Pedido {
        return $this->pedidos[$id] ?? null;
    }
}
?&gt;</code></pre></div>

        <h3>6. Configuración y Uso (Dependency Injection)</h3>
        <div class="code-block"><pre><code>&lt;?php
// ========== CONFIGURACIÓN DEL SISTEMA ==========

// Crear dependencias (normalmente en un contenedor DI)
$logger = new FileLogger('/var/log/pedidos.log');

$productoRepo = new InMemoryProductoRepository();
$pedidoRepo = new InMemoryPedidoRepository();

// Configurar calculadores de descuento (OCP: fácil agregar más)
$calculadoresDescuento = [
    new DescuentoRegular(),
    new DescuentoPremium(),
    new DescuentoVIP()
];

// Configurar procesador de pago (LSP: cualquiera funciona)
$procesadorPago = new ProcesadorTarjeta();
// $procesadorPago = new ProcesadorPayPal();  // Fácil cambiar

// Configurar notificadores (ISP: combinar múltiples)
$notificador = new NotificadorMultiple();
$notificador->agregar(new NotificadorEmail('noreply@tienda.com'));
$notificador->agregar(new NotificadorSMS());

// Configurar validadores (SRP: cada uno valida una cosa)
$validadores = [
    new ValidadorStockPedido(),
    new ValidadorMontoPedido(10)
];

// Crear caso de uso con todas las dependencias (DIP)
$procesarPedido = new ProcesarPedidoUseCase(
    $pedidoRepo,
    $productoRepo,
    $calculadoresDescuento,
    $procesadorPago,
    $notificador,
    $validadores,
    $logger
);

// ========== EJECUTAR ==========

// Cliente VIP
$cliente = new Cliente(1, "Juan Pérez", "juan@example.com", "vip");

// Items del pedido
$items = [
    ['producto_id' => 1, 'cantidad' => 1],  // Laptop
    ['producto_id' => 2, 'cantidad' => 2]   // 2 Mouse
];

// Procesar pedido
$resultado = $procesarPedido->ejecutar(
    $cliente,
    $items,
    'tarjeta',
    ['numero' => '1234567890123456', 'cvv' => '123']
);

if ($resultado->esExitoso()) {
    $pedido = $resultado->getPedido();
    echo "\\n✅ PEDIDO PROCESADO EXITOSAMENTE\\n";
    echo "   ID: #{$pedido->getId()}\\n";
    echo "   Cliente: {$cliente->getNombre()}\\n";
    echo "   Subtotal: \${$pedido->getSubtotal()}\\n";
    echo "   Descuento: \${$pedido->getDescuento()}\\n";
    echo "   Total: \${$pedido->getTotal()}\\n";
    echo "   Estado: {$pedido->getEstado()->value}\\n";
} else {
    echo "\\n❌ ERROR: {$resultado->getMensaje()}\\n";
}

// ========== VENTAJAS DE APLICAR SOLID ==========
echo "\\n📋 VENTAJAS DE ESTA ARQUITECTURA:\\n";
echo "1. SRP: Cada clase tiene una responsabilidad clara\\n";
echo "2. OCP: Fácil agregar nuevos descuentos, pagos, notificadores\\n";
echo "3. LSP: Cualquier implementación es intercambiable\\n";
echo "4. ISP: Interfaces pequeñas y específicas\\n";
echo "5. DIP: Fácil testear con mocks, cambiar implementaciones\\n";
echo "6. Código mantenible, escalable y testeable\\n";
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Principios SOLID Aplicados:</strong><br>
            • <strong>SRP</strong>: Cada clase tiene una responsabilidad (Producto, Pedido, Validadores)<br>
            • <strong>OCP</strong>: Fácil agregar descuentos, pagos sin modificar código existente<br>
            • <strong>LSP</strong>: Todos los procesadores/notificadores son intercambiables<br>
            • <strong>ISP</strong>: Interfaces pequeñas y específicas por funcionalidad<br>
            • <strong>DIP</strong>: Caso de uso depende de abstracciones, no implementaciones<br>
            • <strong>Resultado</strong>: Sistema flexible, testeable y mantenible
        </div>

        <div class="warning-box">
            <strong>⚠️ Errores Comunes al Aplicar SOLID:</strong><br>
            • <strong>Over-engineering</strong>: No crear abstracciones innecesarias<br>
            • <strong>Interfaces vacías</strong>: Cada interfaz debe tener propósito claro<br>
            • <strong>Acoplamiento oculto</strong>: Evitar dependencias implícitas<br>
            • <strong>Demasiadas capas</strong>: Balance entre flexibilidad y simplicidad<br>
            • <strong>Ignorar el contexto</strong>: SOLID es una guía, no una ley absoluta<br>
            • <strong>Abstraer demasiado pronto</strong>: Espera a ver patrones antes de abstraer
        </div>

        <div class="info-box">
            <strong>💡 Resumen de la Aplicación:</strong><br>
            • <strong>Arquitectura</strong>: Hexagonal con casos de uso<br>
            • <strong>Dominio</strong>: Entidades ricas con lógica de negocio<br>
            • <strong>Abstracciones</strong>: Interfaces para todos los servicios<br>
            • <strong>Implementaciones</strong>: Múltiples estrategias intercambiables<br>
            • <strong>Inyección</strong>: Dependencias inyectadas por constructor<br>
            • <strong>Testeable</strong>: Fácil crear mocks para testing<br>
            • <strong>Extensible</strong>: Agregar funcionalidad sin modificar existente
        </div>
    `,
    'refactoring-solid': `
        <h1>Refactoring Basado en SOLID</h1>
        
        <p>El <strong>refactoring basado en SOLID</strong> consiste en mejorar código existente aplicando los principios SOLID para hacerlo más mantenible, testeable y extensible. Veamos ejemplos prácticos de transformación paso a paso.</p>

        <div class="info-box">
            <strong>💡 Proceso de Refactoring:</strong><br>
            • <strong>Identificar</strong>: Detectar violaciones de SOLID<br>
            • <strong>Analizar</strong>: Entender el impacto del cambio<br>
            • <strong>Refactorizar</strong>: Aplicar principios uno a uno<br>
            • <strong>Testear</strong>: Verificar que funciona igual<br>
            • <strong>Iterar</strong>: Mejorar continuamente
        </div>

        <h3>Ejemplo 1: Refactoring con SRP</h3>
        <div class="code-block"><pre><code>&lt;?php
// ❌ ANTES: Clase con múltiples responsabilidades
class Usuario {
    private string $nombre;
    private string $email;
    private string $password;
    
    public function __construct(string $nombre, string $email, string $password) {
        $this->nombre = $nombre;
        $this->email = $email;
        $this->password = $password;
    }
    
    // Responsabilidad 1: Validación
    public function validar(): bool {
        if (empty($this->nombre)) {
            return false;
        }
        if (!filter_var($this->email, FILTER_VALIDATE_EMAIL)) {
            return false;
        }
        if (strlen($this->password) < 8) {
            return false;
        }
        return true;
    }
    
    // Responsabilidad 2: Persistencia
    public function guardar(): bool {
        $sql = "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)";
        // Lógica de base de datos...
        return true;
    }
    
    // Responsabilidad 3: Envío de emails
    public function enviarEmailBienvenida(): void {
        $asunto = "Bienvenido {$this->nombre}";
        $mensaje = "Gracias por registrarte";
        mail($this->email, $asunto, $mensaje);
    }
    
    // Responsabilidad 4: Generación de reportes
    public function generarReporte(): string {
        return "Usuario: {$this->nombre}\\nEmail: {$this->email}";
    }
}

// Uso problemático
$usuario = new Usuario("Juan", "juan@example.com", "password123");
if ($usuario->validar()) {
    $usuario->guardar();
    $usuario->enviarEmailBienvenida();
}
?&gt;</code></pre></div>

        <div class="code-block"><pre><code>&lt;?php
// ✅ DESPUÉS: Aplicando SRP - Cada clase una responsabilidad

// Clase de dominio: Solo datos y lógica de negocio
class Usuario {
    public function __construct(
        private string $nombre,
        private string $email,
        private string $password
    ) {}
    
    public function getNombre(): string {
        return $this->nombre;
    }
    
    public function getEmail(): string {
        return $this->email;
    }
    
    public function getPassword(): string {
        return $this->password;
    }
}

// Responsabilidad 1: Validación
class ValidadorUsuario {
    public function validar(Usuario $usuario): array {
        $errores = [];
        
        if (empty($usuario->getNombre())) {
            $errores[] = "El nombre es requerido";
        }
        
        if (!filter_var($usuario->getEmail(), FILTER_VALIDATE_EMAIL)) {
            $errores[] = "Email inválido";
        }
        
        if (strlen($usuario->getPassword()) < 8) {
            $errores[] = "La contraseña debe tener al menos 8 caracteres";
        }
        
        return $errores;
    }
}

// Responsabilidad 2: Persistencia
class UsuarioRepository {
    public function guardar(Usuario $usuario): bool {
        $sql = "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)";
        // Lógica de base de datos...
        return true;
    }
}

// Responsabilidad 3: Notificaciones
class NotificadorUsuario {
    public function enviarBienvenida(Usuario $usuario): void {
        $asunto = "Bienvenido {$usuario->getNombre()}";
        $mensaje = "Gracias por registrarte";
        mail($usuario->getEmail(), $asunto, $mensaje);
    }
}

// Responsabilidad 4: Reportes
class GeneradorReporteUsuario {
    public function generar(Usuario $usuario): string {
        return "Usuario: {$usuario->getNombre()}\\nEmail: {$usuario->getEmail()}";
    }
}

// Uso mejorado
$usuario = new Usuario("Juan", "juan@example.com", "password123");

$validador = new ValidadorUsuario();
$errores = $validador->validar($usuario);

if (empty($errores)) {
    $repository = new UsuarioRepository();
    $repository->guardar($usuario);
    
    $notificador = new NotificadorUsuario();
    $notificador->enviarBienvenida($usuario);
}
?&gt;</code></pre></div>

        <h3>Ejemplo 2: Refactoring con OCP</h3>
        <div class="code-block"><pre><code>&lt;?php
// ❌ ANTES: Código cerrado para extensión
class CalculadorPrecio {
    public function calcular(string $tipoProducto, float $precio): float {
        if ($tipoProducto === 'libro') {
            return $precio * 0.9;  // 10% descuento
        } elseif ($tipoProducto === 'electronico') {
            return $precio * 0.95;  // 5% descuento
        } elseif ($tipoProducto === 'ropa') {
            return $precio * 0.85;  // 15% descuento
        }
        
        return $precio;
    }
}

// Problema: Para agregar un nuevo tipo, debes modificar la clase
$calculador = new CalculadorPrecio();
$precioFinal = $calculador->calcular('libro', 100);
?&gt;</code></pre></div>

        <div class="code-block"><pre><code>&lt;?php
// ✅ DESPUÉS: Aplicando OCP - Abierto para extensión

interface EstrategiaPrecio {
    public function calcular(float $precio): float;
}

class PrecioLibro implements EstrategiaPrecio {
    public function calcular(float $precio): float {
        return $precio * 0.9;  // 10% descuento
    }
}

class PrecioElectronico implements EstrategiaPrecio {
    public function calcular(float $precio): float {
        return $precio * 0.95;  // 5% descuento
    }
}

class PrecioRopa implements EstrategiaPrecio {
    public function calcular(float $precio): float {
        return $precio * 0.85;  // 15% descuento
    }
}

// Nueva estrategia sin modificar código existente
class PrecioAlimento implements EstrategiaPrecio {
    public function calcular(float $precio): float {
        return $precio * 0.92;  // 8% descuento
    }
}

class CalculadorPrecio {
    public function calcular(EstrategiaPrecio $estrategia, float $precio): float {
        return $estrategia->calcular($precio);
    }
}

// Uso extensible
$calculador = new CalculadorPrecio();
$precioFinal = $calculador->calcular(new PrecioLibro(), 100);
?&gt;</code></pre></div>

        <h3>Ejemplo 3: Refactoring con LSP</h3>
        <div class="code-block"><pre><code>&lt;?php
// ❌ ANTES: Violando LSP
class Ave {
    public function volar(): void {
        echo "Volando...\\n";
    }
}

class Aguila extends Ave {
    public function volar(): void {
        echo "El águila vuela alto\\n";
    }
}

class Pinguino extends Ave {
    public function volar(): void {
        // ❌ Los pingüinos no vuelan
        throw new Exception("Los pingüinos no pueden volar");
    }
}

// Problema: No puedes sustituir Ave por Pinguino
function hacerVolar(Ave $ave): void {
    $ave->volar();  // Falla con Pinguino
}

$aguila = new Aguila();
hacerVolar($aguila);  // ✅ OK

$pinguino = new Pinguino();
hacerVolar($pinguino);  // ❌ Exception
?&gt;</code></pre></div>

        <div class="code-block"><pre><code>&lt;?php
// ✅ DESPUÉS: Aplicando LSP - Interfaces segregadas

interface Ave {
    public function comer(): void;
    public function dormir(): void;
}

interface AveVoladora extends Ave {
    public function volar(): void;
}

class Aguila implements AveVoladora {
    public function comer(): void {
        echo "Águila comiendo\\n";
    }
    
    public function dormir(): void {
        echo "Águila durmiendo\\n";
    }
    
    public function volar(): void {
        echo "El águila vuela alto\\n";
    }
}

class Pinguino implements Ave {
    public function comer(): void {
        echo "Pingüino comiendo\\n";
    }
    
    public function dormir(): void {
        echo "Pingüino durmiendo\\n";
    }
    
    public function nadar(): void {
        echo "Pingüino nadando\\n";
    }
}

// Ahora funciona correctamente
function hacerVolar(AveVoladora $ave): void {
    $ave->volar();
}

function alimentar(Ave $ave): void {
    $ave->comer();
}

$aguila = new Aguila();
hacerVolar($aguila);  // ✅ OK
alimentar($aguila);   // ✅ OK

$pinguino = new Pinguino();
// hacerVolar($pinguino);  // ❌ Error de compilación (correcto)
alimentar($pinguino);  // ✅ OK
$pinguino->nadar();    // ✅ OK
?&gt;</code></pre></div>

        <h3>Ejemplo 4: Refactoring con ISP</h3>
        <div class="code-block"><pre><code>&lt;?php
// ❌ ANTES: Interfaz gorda que fuerza implementaciones innecesarias
interface Impresora {
    public function imprimir(string $documento): void;
    public function escanear(string $documento): void;
    public function fax(string $documento): void;
    public function email(string $documento): void;
}

class ImpresoraMultifuncion implements Impresora {
    public function imprimir(string $documento): void {
        echo "Imprimiendo: {$documento}\\n";
    }
    
    public function escanear(string $documento): void {
        echo "Escaneando: {$documento}\\n";
    }
    
    public function fax(string $documento): void {
        echo "Enviando fax: {$documento}\\n";
    }
    
    public function email(string $documento): void {
        echo "Enviando email: {$documento}\\n";
    }
}

class ImpresoraSimple implements Impresora {
    public function imprimir(string $documento): void {
        echo "Imprimiendo: {$documento}\\n";
    }
    
    // ❌ Forzado a implementar métodos que no usa
    public function escanear(string $documento): void {
        throw new Exception("No soportado");
    }
    
    public function fax(string $documento): void {
        throw new Exception("No soportado");
    }
    
    public function email(string $documento): void {
        throw new Exception("No soportado");
    }
}
?&gt;</code></pre></div>

        <div class="code-block"><pre><code>&lt;?php
// ✅ DESPUÉS: Aplicando ISP - Interfaces segregadas

interface Imprimible {
    public function imprimir(string $documento): void;
}

interface Escaneable {
    public function escanear(string $documento): void;
}

interface EnviadorFax {
    public function fax(string $documento): void;
}

interface EnviadorEmail {
    public function email(string $documento): void;
}

// Impresora multifunción implementa todas las interfaces
class ImpresoraMultifuncion implements Imprimible, Escaneable, EnviadorFax, EnviadorEmail {
    public function imprimir(string $documento): void {
        echo "Imprimiendo: {$documento}\\n";
    }
    
    public function escanear(string $documento): void {
        echo "Escaneando: {$documento}\\n";
    }
    
    public function fax(string $documento): void {
        echo "Enviando fax: {$documento}\\n";
    }
    
    public function email(string $documento): void {
        echo "Enviando email: {$documento}\\n";
    }
}

// Impresora simple solo implementa lo que necesita
class ImpresoraSimple implements Imprimible {
    public function imprimir(string $documento): void {
        echo "Imprimiendo: {$documento}\\n";
    }
}

// Escáner solo implementa escaneo
class Escaner implements Escaneable {
    public function escanear(string $documento): void {
        echo "Escaneando: {$documento}\\n";
    }
}

// Uso con interfaces específicas
function procesarImpresion(Imprimible $dispositivo, string $doc): void {
    $dispositivo->imprimir($doc);
}

function procesarEscaneo(Escaneable $dispositivo, string $doc): void {
    $dispositivo->escanear($doc);
}

$multifuncion = new ImpresoraMultifuncion();
procesarImpresion($multifuncion, "documento.pdf");
procesarEscaneo($multifuncion, "foto.jpg");

$simple = new ImpresoraSimple();
procesarImpresion($simple, "documento.pdf");
// procesarEscaneo($simple, "foto.jpg");  // ❌ Error de compilación (correcto)
?&gt;</code></pre></div>

        <h3>Ejemplo 5: Refactoring con DIP</h3>
        <div class="code-block"><pre><code>&lt;?php
// ❌ ANTES: Alto acoplamiento con implementaciones concretas
class EmailService {
    public function enviar(string $destinatario, string $mensaje): void {
        echo "Enviando email a {$destinatario}: {$mensaje}\\n";
    }
}

class UsuarioController {
    private EmailService $emailService;
    
    public function __construct() {
        // ❌ Acoplamiento fuerte: instancia directa
        $this->emailService = new EmailService();
    }
    
    public function registrar(string $nombre, string $email): void {
        // Lógica de registro...
        
        // Enviar notificación
        $this->emailService->enviar($email, "Bienvenido {$nombre}");
    }
}

// Problemas:
// 1. No puedes cambiar a SMS sin modificar UsuarioController
// 2. No puedes testear sin enviar emails reales
// 3. Acoplamiento fuerte a EmailService

$controller = new UsuarioController();
$controller->registrar("Juan", "juan@example.com");
?&gt;</code></pre></div>

        <div class="code-block"><pre><code>&lt;?php
// ✅ DESPUÉS: Aplicando DIP - Depender de abstracciones

// Abstracción
interface NotificacionService {
    public function enviar(string $destinatario, string $mensaje): void;
}

// Implementaciones concretas
class EmailService implements NotificacionService {
    public function enviar(string $destinatario, string $mensaje): void {
        echo "Enviando email a {$destinatario}: {$mensaje}\\n";
    }
}

class SMSService implements NotificacionService {
    public function enviar(string $destinatario, string $mensaje): void {
        echo "Enviando SMS a {$destinatario}: {$mensaje}\\n";
    }
}

class LogService implements NotificacionService {
    public function enviar(string $destinatario, string $mensaje): void {
        echo "[LOG] Notificación para {$destinatario}: {$mensaje}\\n";
    }
}

// Controlador depende de abstracción
class UsuarioController {
    public function __construct(
        private NotificacionService $notificacionService
    ) {}
    
    public function registrar(string $nombre, string $email): void {
        // Lógica de registro...
        
        // Enviar notificación (cualquier implementación funciona)
        $this->notificacionService->enviar($email, "Bienvenido {$nombre}");
    }
}

// Uso flexible
$emailService = new EmailService();
$controller1 = new UsuarioController($emailService);
$controller1->registrar("Juan", "juan@example.com");

// Fácil cambiar a SMS
$smsService = new SMSService();
$controller2 = new UsuarioController($smsService);
$controller2->registrar("Ana", "+34123456789");

// Fácil testear con mock
$logService = new LogService();
$controller3 = new UsuarioController($logService);
$controller3->registrar("Test", "test@example.com");
?&gt;</code></pre></div>

        <h3>Ejemplo Completo: Refactoring de Sistema Legacy</h3>
        <div class="code-block"><pre><code>&lt;?php
// ❌ ANTES: Código legacy con múltiples violaciones SOLID
class GestorPedidos {
    public function procesarPedido(array $datos): void {
        // Validación mezclada con lógica
        if (empty($datos['cliente'])) {
            die("Cliente requerido");
        }
        if (empty($datos['productos'])) {
            die("Productos requeridos");
        }
        
        // Cálculo de precio con if/else
        $total = 0;
        foreach ($datos['productos'] as $producto) {
            if ($producto['tipo'] === 'normal') {
                $total += $producto['precio'];
            } elseif ($producto['tipo'] === 'premium') {
                $total += $producto['precio'] * 0.9;
            }
        }
        
        // Persistencia directa
        $sql = "INSERT INTO pedidos (cliente, total) VALUES (?, ?)";
        // Ejecutar SQL...
        
        // Envío de email directo
        mail($datos['cliente']['email'], "Pedido confirmado", "Total: \${$total}");
        
        // Logging mezclado
        file_put_contents('log.txt', "Pedido procesado\\n", FILE_APPEND);
    }
}
?&gt;</code></pre></div>

        <div class="code-block"><pre><code>&lt;?php
// ✅ DESPUÉS: Aplicando todos los principios SOLID

// SRP: Entidades de dominio
class Pedido {
    public function __construct(
        private Cliente $cliente,
        private array $items,
        private float $total
    ) {}
    
    public function getCliente(): Cliente {
        return $this->cliente;
    }
    
    public function getTotal(): float {
        return $this->total;
    }
}

class Cliente {
    public function __construct(
        private string $nombre,
        private string $email
    ) {}
    
    public function getEmail(): string {
        return $this->email;
    }
}

// ISP: Interfaces segregadas
interface ValidadorPedido {
    public function validar(array $datos): array;
}

interface CalculadorPrecio {
    public function calcular(array $productos): float;
}

interface RepositorioPedidos {
    public function guardar(Pedido $pedido): int;
}

interface NotificadorPedidos {
    public function notificar(Pedido $pedido): void;
}

interface Logger {
    public function log(string $mensaje): void;
}

// SRP: Implementaciones con responsabilidad única
class ValidadorPedidoSimple implements ValidadorPedido {
    public function validar(array $datos): array {
        $errores = [];
        
        if (empty($datos['cliente'])) {
            $errores[] = "Cliente requerido";
        }
        if (empty($datos['productos'])) {
            $errores[] = "Productos requeridos";
        }
        
        return $errores;
    }
}

// OCP: Estrategias de precio extensibles
class CalculadorPrecioConDescuento implements CalculadorPrecio {
    public function calcular(array $productos): float {
        $total = 0;
        foreach ($productos as $producto) {
            $precio = $producto['precio'];
            
            if ($producto['tipo'] === 'premium') {
                $precio *= 0.9;  // 10% descuento
            }
            
            $total += $precio;
        }
        return $total;
    }
}

class RepositorioPedidosMySQL implements RepositorioPedidos {
    public function guardar(Pedido $pedido): int {
        $sql = "INSERT INTO pedidos (cliente, total) VALUES (?, ?)";
        // Ejecutar SQL...
        return 1;  // ID del pedido
    }
}

class NotificadorEmail implements NotificadorPedidos {
    public function notificar(Pedido $pedido): void {
        $email = $pedido->getCliente()->getEmail();
        $total = $pedido->getTotal();
        mail($email, "Pedido confirmado", "Total: \${$total}");
    }
}

class FileLogger implements Logger {
    public function log(string $mensaje): void {
        file_put_contents('log.txt', $mensaje . "\\n", FILE_APPEND);
    }
}

// DIP: Caso de uso depende de abstracciones
class ProcesarPedidoUseCase {
    public function __construct(
        private ValidadorPedido $validador,
        private CalculadorPrecio $calculador,
        private RepositorioPedidos $repositorio,
        private NotificadorPedidos $notificador,
        private Logger $logger
    ) {}
    
    public function ejecutar(array $datos): bool {
        // 1. Validar
        $errores = $this->validador->validar($datos);
        if (!empty($errores)) {
            $this->logger->log("Validación fallida: " . implode(', ', $errores));
            return false;
        }
        
        // 2. Calcular precio
        $total = $this->calculador->calcular($datos['productos']);
        
        // 3. Crear pedido
        $cliente = new Cliente($datos['cliente']['nombre'], $datos['cliente']['email']);
        $pedido = new Pedido($cliente, $datos['productos'], $total);
        
        // 4. Guardar
        $id = $this->repositorio->guardar($pedido);
        
        // 5. Notificar
        $this->notificador->notificar($pedido);
        
        // 6. Log
        $this->logger->log("Pedido #{$id} procesado exitosamente");
        
        return true;
    }
}

// Configuración (Dependency Injection)
$useCase = new ProcesarPedidoUseCase(
    new ValidadorPedidoSimple(),
    new CalculadorPrecioConDescuento(),
    new RepositorioPedidosMySQL(),
    new NotificadorEmail(),
    new FileLogger()
);

// Uso
$datos = [
    'cliente' => ['nombre' => 'Juan', 'email' => 'juan@example.com'],
    'productos' => [
        ['tipo' => 'normal', 'precio' => 100],
        ['tipo' => 'premium', 'precio' => 200]
    ]
];

$resultado = $useCase->ejecutar($datos);
echo $resultado ? "✅ Pedido procesado" : "❌ Error";
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Beneficios del Refactoring SOLID:</strong><br>
            • <strong>Mantenibilidad</strong>: Código más fácil de entender y modificar<br>
            • <strong>Testabilidad</strong>: Fácil crear tests unitarios con mocks<br>
            • <strong>Extensibilidad</strong>: Agregar funcionalidad sin modificar existente<br>
            • <strong>Reusabilidad</strong>: Componentes independientes reutilizables<br>
            • <strong>Flexibilidad</strong>: Cambiar implementaciones sin afectar el resto<br>
            • <strong>Escalabilidad</strong>: Sistema preparado para crecer
        </div>

        <div class="warning-box">
            <strong>⚠️ Consideraciones al Refactorizar:</strong><br>
            • <strong>Tests primero</strong>: Asegura que tienes tests antes de refactorizar<br>
            • <strong>Pasos pequeños</strong>: Refactoriza incrementalmente, no todo a la vez<br>
            • <strong>Un principio a la vez</strong>: Aplica un principio SOLID por iteración<br>
            • <strong>Verifica funcionamiento</strong>: Ejecuta tests después de cada cambio<br>
            • <strong>No sobre-ingenierizar</strong>: Balance entre flexibilidad y simplicidad<br>
            • <strong>Documenta cambios</strong>: Explica por qué refactorizaste
        </div>

        <div class="info-box">
            <strong>💡 Checklist de Refactoring SOLID:</strong><br>
            • <strong>SRP</strong>: ¿Cada clase tiene una sola razón para cambiar?<br>
            • <strong>OCP</strong>: ¿Puedes agregar funcionalidad sin modificar código?<br>
            • <strong>LSP</strong>: ¿Las subclases son intercambiables con la clase base?<br>
            • <strong>ISP</strong>: ¿Las interfaces son pequeñas y específicas?<br>
            • <strong>DIP</strong>: ¿Dependes de abstracciones en lugar de implementaciones?<br>
            • <strong>Tests</strong>: ¿El código refactorizado pasa todos los tests?<br>
            • <strong>Simplicidad</strong>: ¿El código es más simple que antes?
        </div>
    `,
    'patron-singleton': `
        <h1>Patrón Singleton</h1>
        
        <p>El <strong>patrón Singleton</strong> es un patrón de diseño creacional que garantiza que una clase tenga <strong>una única instancia</strong> en toda la aplicación y proporciona un punto de acceso global a esa instancia.</p>

        <div class="info-box">
            <strong>💡 ¿Qué es Singleton?</strong><br>
            • <strong>Propósito</strong>: Asegurar que solo exista una instancia de una clase<br>
            • <strong>Acceso global</strong>: Proporcionar un punto de acceso único<br>
            • <strong>Control</strong>: La clase controla su propia instanciación<br>
            • <strong>Lazy loading</strong>: La instancia se crea solo cuando se necesita<br>
            • <strong>Uso común</strong>: Conexiones BD, configuración, loggers, caches
        </div>

        <h3>¿Por Qué Usar Singleton?</h3>
        <p>Imagina que tienes una conexión a base de datos. No quieres crear múltiples conexiones porque:</p>
        <ul>
            <li>Consume recursos innecesarios (memoria, conexiones)</li>
            <li>Puede causar problemas de sincronización</li>
            <li>Es ineficiente y costoso</li>
        </ul>
        <p>El patrón Singleton garantiza que solo haya UNA conexión compartida por toda la aplicación.</p>

        <h3>Implementación Básica</h3>
        <div class="code-block"><pre><code>&lt;?php
class Database {
    // 1. Propiedad estática privada para guardar la única instancia
    private static ?Database $instance = null;
    
    // 2. Constructor privado: impide crear instancias con 'new'
    private function __construct() {
        echo "Conexión a base de datos creada\\n";
    }
    
    // 3. Método estático público para obtener la instancia
    public static function getInstance(): Database {
        // Si no existe instancia, créala
        if (self::$instance === null) {
            self::$instance = new self();
        }
        
        // Siempre retorna la misma instancia
        return self::$instance;
    }
    
    // 4. Prevenir clonación
    private function __clone() {}
    
    // 5. Prevenir deserialización
    public function __wakeup() {
        throw new Exception("No se puede deserializar un Singleton");
    }
    
    // Métodos de negocio
    public function query(string $sql): array {
        echo "Ejecutando: {$sql}\\n";
        return [];
    }
}

// ❌ No puedes hacer esto (constructor privado)
// $db = new Database();  // Error: Call to private constructor

// ✅ Forma correcta de obtener la instancia
$db1 = Database::getInstance();  // Crea la conexión
$db2 = Database::getInstance();  // Retorna la misma instancia
$db3 = Database::getInstance();  // Retorna la misma instancia

// Verificar que es la misma instancia
var_dump($db1 === $db2);  // bool(true)
var_dump($db2 === $db3);  // bool(true)

$db1->query("SELECT * FROM usuarios");
?&gt;</code></pre></div>

        <h3>Explicación Paso a Paso</h3>
        <div class="code-block"><pre><code>&lt;?php
class Logger {
    // PASO 1: Variable estática privada para guardar la instancia
    // 'static' = pertenece a la clase, no a objetos individuales
    // 'private' = solo accesible desde dentro de la clase
    private static ?Logger $instance = null;
    
    private array $logs = [];
    
    // PASO 2: Constructor privado
    // Esto impide que alguien haga: new Logger()
    private function __construct() {
        echo "Logger inicializado\\n";
    }
    
    // PASO 3: Método público estático para obtener la instancia
    public static function getInstance(): Logger {
        // Si aún no existe instancia
        if (self::$instance === null) {
            echo "Creando nueva instancia de Logger\\n";
            self::$instance = new self();  // 'self' = esta clase
        } else {
            echo "Retornando instancia existente\\n";
        }
        
        return self::$instance;
    }
    
    // PASO 4: Prevenir clonación
    // Sin esto, alguien podría hacer: $logger2 = clone $logger1;
    private function __clone() {
        // Constructor vacío = no se puede clonar
    }
    
    // PASO 5: Prevenir deserialización
    // Sin esto, alguien podría deserializar y crear otra instancia
    public function __wakeup() {
        throw new Exception("No se puede deserializar un Singleton");
    }
    
    // Métodos de negocio
    public function log(string $mensaje): void {
        $timestamp = date('Y-m-d H:i:s');
        $this->logs[] = "[{$timestamp}] {$mensaje}";
        echo "[LOG] {$mensaje}\\n";
    }
    
    public function getLogs(): array {
        return $this->logs;
    }
}

// Uso del Logger
echo "=== Primera llamada ===\\n";
$logger1 = Logger::getInstance();  // Crea la instancia
$logger1->log("Usuario inició sesión");

echo "\\n=== Segunda llamada ===\\n";
$logger2 = Logger::getInstance();  // Retorna la misma instancia
$logger2->log("Usuario hizo una compra");

echo "\\n=== Tercera llamada ===\\n";
$logger3 = Logger::getInstance();  // Retorna la misma instancia
$logger3->log("Usuario cerró sesión");

// Todos son la misma instancia
echo "\\n=== Verificación ===\\n";
echo "¿logger1 === logger2? " . ($logger1 === $logger2 ? "SÍ" : "NO") . "\\n";
echo "¿logger2 === logger3? " . ($logger2 === $logger3 ? "SÍ" : "NO") . "\\n";

// Todos comparten los mismos logs
echo "\\n=== Logs compartidos ===\\n";
print_r($logger1->getLogs());  // Muestra los 3 logs
print_r($logger2->getLogs());  // Muestra los 3 logs (misma instancia)
?&gt;</code></pre></div>

        <h3>Ejemplo Real: Configuración de Aplicación</h3>
        <div class="code-block"><pre><code>&lt;?php
class Config {
    private static ?Config $instance = null;
    private array $settings = [];
    
    private function __construct() {
        // Cargar configuración desde archivo
        $this->settings = [
            'app_name' => 'Mi Aplicación',
            'version' => '1.0.0',
            'debug' => true,
            'database' => [
                'host' => 'localhost',
                'port' => 3306,
                'name' => 'mi_db'
            ],
            'api_keys' => [
                'stripe' => 'sk_test_123',
                'sendgrid' => 'SG.abc123'
            ]
        ];
        
        echo "Configuración cargada\\n";
    }
    
    public static function getInstance(): Config {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __clone() {}
    
    public function get(string $key, mixed $default = null): mixed {
        // Soporta notación de punto: 'database.host'
        $keys = explode('.', $key);
        $value = $this->settings;
        
        foreach ($keys as $k) {
            if (!isset($value[$k])) {
                return $default;
            }
            $value = $value[$k];
        }
        
        return $value;
    }
    
    public function set(string $key, mixed $value): void {
        $keys = explode('.', $key);
        $settings = &$this->settings;
        
        foreach ($keys as $k) {
            if (!isset($settings[$k])) {
                $settings[$k] = [];
            }
            $settings = &$settings[$k];
        }
        
        $settings = $value;
    }
    
    public function all(): array {
        return $this->settings;
    }
}

// Uso en diferentes partes de la aplicación
echo "=== En el controlador ===\\n";
$config = Config::getInstance();
echo "App: " . $config->get('app_name') . "\\n";
echo "Debug: " . ($config->get('debug') ? 'ON' : 'OFF') . "\\n";

echo "\\n=== En el servicio de base de datos ===\\n";
$config = Config::getInstance();  // Misma instancia
$host = $config->get('database.host');
$port = $config->get('database.port');
echo "Conectando a {$host}:{$port}\\n";

echo "\\n=== En el servicio de pagos ===\\n";
$config = Config::getInstance();  // Misma instancia
$stripeKey = $config->get('api_keys.stripe');
echo "Usando Stripe key: {$stripeKey}\\n";

// Modificar configuración (afecta a toda la app)
$config->set('debug', false);

echo "\\n=== Verificar cambio ===\\n";
$config2 = Config::getInstance();
echo "Debug ahora: " . ($config2->get('debug') ? 'ON' : 'OFF') . "\\n";
?&gt;</code></pre></div>

        <h3>Ejemplo Real: Conexión a Base de Datos</h3>
        <div class="code-block"><pre><code>&lt;?php
class DatabaseConnection {
    private static ?DatabaseConnection $instance = null;
    private ?PDO $connection = null;
    
    private function __construct() {
        try {
            $this->connection = new PDO(
                'mysql:host=localhost;dbname=mi_db',
                'usuario',
                'password',
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                ]
            );
            echo "✅ Conexión a base de datos establecida\\n";
        } catch (PDOException $e) {
            die("❌ Error de conexión: " . $e->getMessage());
        }
    }
    
    public static function getInstance(): DatabaseConnection {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __clone() {}
    
    public function getConnection(): PDO {
        return $this->connection;
    }
    
    public function query(string $sql, array $params = []): array {
        $stmt = $this->connection->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }
    
    public function execute(string $sql, array $params = []): int {
        $stmt = $this->connection->prepare($sql);
        $stmt->execute($params);
        return $stmt->rowCount();
    }
}

// Uso en diferentes partes de la aplicación
echo "=== Repositorio de Usuarios ===\\n";
$db = DatabaseConnection::getInstance();
$usuarios = $db->query("SELECT * FROM usuarios WHERE activo = ?", [1]);
echo "Usuarios encontrados: " . count($usuarios) . "\\n";

echo "\\n=== Repositorio de Productos ===\\n";
$db = DatabaseConnection::getInstance();  // Misma conexión
$productos = $db->query("SELECT * FROM productos WHERE stock > ?", [0]);
echo "Productos encontrados: " . count($productos) . "\\n";

echo "\\n=== Servicio de Pedidos ===\\n";
$db = DatabaseConnection::getInstance();  // Misma conexión
$affected = $db->execute(
    "UPDATE pedidos SET estado = ? WHERE id = ?",
    ['enviado', 123]
);
echo "Pedidos actualizados: {$affected}\\n";

// Solo hay UNA conexión a la base de datos
// Esto ahorra recursos y evita problemas
?&gt;</code></pre></div>

        <h3>Ejemplo Real: Cache Manager</h3>
        <div class="code-block"><pre><code>&lt;?php
class CacheManager {
    private static ?CacheManager $instance = null;
    private array $cache = [];
    private array $stats = ['hits' => 0, 'misses' => 0];
    
    private function __construct() {
        echo "Cache Manager inicializado\\n";
    }
    
    public static function getInstance(): CacheManager {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __clone() {}
    
    public function set(string $key, mixed $value, int $ttl = 3600): void {
        $this->cache[$key] = [
            'value' => $value,
            'expires' => time() + $ttl
        ];
        echo "✅ Cache guardado: {$key}\\n";
    }
    
    public function get(string $key): mixed {
        if (!isset($this->cache[$key])) {
            $this->stats['misses']++;
            echo "❌ Cache miss: {$key}\\n";
            return null;
        }
        
        $item = $this->cache[$key];
        
        // Verificar si expiró
        if ($item['expires'] < time()) {
            unset($this->cache[$key]);
            $this->stats['misses']++;
            echo "⏰ Cache expirado: {$key}\\n";
            return null;
        }
        
        $this->stats['hits']++;
        echo "✅ Cache hit: {$key}\\n";
        return $item['value'];
    }
    
    public function has(string $key): bool {
        return $this->get($key) !== null;
    }
    
    public function delete(string $key): void {
        unset($this->cache[$key]);
        echo "🗑️ Cache eliminado: {$key}\\n";
    }
    
    public function clear(): void {
        $this->cache = [];
        echo "🧹 Cache limpiado completamente\\n";
    }
    
    public function getStats(): array {
        return $this->stats;
    }
}

// Uso en diferentes servicios
echo "=== Servicio de Usuarios ===\\n";
$cache = CacheManager::getInstance();

// Guardar en cache
$usuarios = ['Juan', 'Ana', 'Pedro'];
$cache->set('usuarios_activos', $usuarios, 60);

echo "\\n=== Servicio de Productos ===\\n";
$cache = CacheManager::getInstance();  // Misma instancia

// Intentar obtener del cache
$usuariosCache = $cache->get('usuarios_activos');
if ($usuariosCache) {
    echo "Usuarios desde cache: " . implode(', ', $usuariosCache) . "\\n";
}

// Guardar productos
$cache->set('productos_destacados', ['Laptop', 'Mouse', 'Teclado'], 120);

echo "\\n=== Servicio de Reportes ===\\n";
$cache = CacheManager::getInstance();  // Misma instancia

// Obtener estadísticas
$stats = $cache->getStats();
echo "Cache hits: {$stats['hits']}\\n";
echo "Cache misses: {$stats['misses']}\\n";

// Intentar obtener algo que no existe
$cache->get('clave_inexistente');

// Estadísticas actualizadas
$stats = $cache->getStats();
echo "\\nEstadísticas finales:\\n";
echo "Cache hits: {$stats['hits']}\\n";
echo "Cache misses: {$stats['misses']}\\n";
?&gt;</code></pre></div>

        <h3>Singleton con Parámetros de Configuración</h3>
        <div class="code-block"><pre><code>&lt;?php
class Logger {
    private static ?Logger $instance = null;
    private string $logFile;
    private string $level;
    
    // Constructor acepta parámetros
    private function __construct(string $logFile = 'app.log', string $level = 'INFO') {
        $this->logFile = $logFile;
        $this->level = $level;
        echo "Logger configurado: {$logFile} (nivel: {$level})\\n";
    }
    
    // getInstance acepta parámetros solo en la primera llamada
    public static function getInstance(
        string $logFile = 'app.log',
        string $level = 'INFO'
    ): Logger {
        if (self::$instance === null) {
            self::$instance = new self($logFile, $level);
        }
        // Las siguientes llamadas ignoran los parámetros
        return self::$instance;
    }
    
    private function __clone() {}
    
    public function log(string $mensaje): void {
        $timestamp = date('Y-m-d H:i:s');
        $entry = "[{$timestamp}] [{$this->level}] {$mensaje}\\n";
        file_put_contents($this->logFile, $entry, FILE_APPEND);
        echo $entry;
    }
    
    public function getConfig(): array {
        return [
            'file' => $this->logFile,
            'level' => $this->level
        ];
    }
}

// Primera llamada: configura el logger
$logger1 = Logger::getInstance('custom.log', 'DEBUG');
$logger1->log("Aplicación iniciada");

// Segunda llamada: ignora los parámetros (usa la instancia existente)
$logger2 = Logger::getInstance('otro.log', 'ERROR');  // Parámetros ignorados
$logger2->log("Usuario autenticado");

// Verificar configuración
print_r($logger2->getConfig());  // Muestra 'custom.log' y 'DEBUG'
?&gt;</code></pre></div>

        <h3>Singleton Thread-Safe (PHP 8+)</h3>
        <div class="code-block"><pre><code>&lt;?php
class ThreadSafeLogger {
    private static ?ThreadSafeLogger $instance = null;
    private static $lock = false;
    
    private function __construct() {
        echo "Logger inicializado\\n";
    }
    
    public static function getInstance(): ThreadSafeLogger {
        // Double-checked locking para thread safety
        if (self::$instance === null) {
            // Simular lock (en producción usarías mutex real)
            while (self::$lock) {
                usleep(100);  // Esperar 100 microsegundos
            }
            
            self::$lock = true;
            
            // Verificar nuevamente después del lock
            if (self::$instance === null) {
                self::$instance = new self();
            }
            
            self::$lock = false;
        }
        
        return self::$instance;
    }
    
    private function __clone() {}
    
    public function log(string $mensaje): void {
        echo "[LOG] {$mensaje}\\n";
    }
}
?&gt;</code></pre></div>

        <h3>Cuándo NO Usar Singleton</h3>
        <div class="code-block"><pre><code>&lt;?php
// ❌ MAL: Usar Singleton para algo que debería tener múltiples instancias
class Usuario {
    private static ?Usuario $instance = null;
    private string $nombre;
    
    private function __construct(string $nombre) {
        $this->nombre = $nombre;
    }
    
    public static function getInstance(string $nombre): Usuario {
        if (self::$instance === null) {
            self::$instance = new self($nombre);
        }
        return self::$instance;
    }
}

// Problema: Solo puedes tener UN usuario
$juan = Usuario::getInstance("Juan");
$ana = Usuario::getInstance("Ana");  // Sigue siendo Juan!

// ✅ BIEN: Usar clases normales para múltiples instancias
class Usuario {
    public function __construct(
        private string $nombre
    ) {}
    
    public function getNombre(): string {
        return $this->nombre;
    }
}

$juan = new Usuario("Juan");
$ana = new Usuario("Ana");  // Instancia diferente
?&gt;</code></pre></div>

        <h3>Alternativas Modernas al Singleton</h3>
        <div class="code-block"><pre><code>&lt;?php
// Alternativa 1: Inyección de Dependencias
class Logger {
    public function log(string $mensaje): void {
        echo "[LOG] {$mensaje}\\n";
    }
}

class UsuarioService {
    public function __construct(
        private Logger $logger  // Inyectado, no Singleton
    ) {}
    
    public function crear(string $nombre): void {
        $this->logger->log("Usuario creado: {$nombre}");
    }
}

// Crear UNA instancia de Logger
$logger = new Logger();

// Inyectarla en todos los servicios que la necesiten
$usuarioService = new UsuarioService($logger);
$productoService = new ProductoService($logger);

// Alternativa 2: Contenedor de Dependencias
class Container {
    private array $instances = [];
    
    public function singleton(string $class, callable $factory): void {
        $this->instances[$class] = null;
        $this->factories[$class] = $factory;
    }
    
    public function get(string $class): mixed {
        if (!isset($this->instances[$class])) {
            $this->instances[$class] = $this->factories[$class]();
        }
        return $this->instances[$class];
    }
}

$container = new Container();
$container->singleton(Logger::class, fn() => new Logger());

// Obtener la misma instancia
$logger1 = $container->get(Logger::class);
$logger2 = $container->get(Logger::class);  // Misma instancia
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Ventajas del Singleton:</strong><br>
            • <strong>Control de instancia</strong>: Garantiza una única instancia<br>
            • <strong>Acceso global</strong>: Disponible desde cualquier parte<br>
            • <strong>Lazy initialization</strong>: Se crea solo cuando se necesita<br>
            • <strong>Ahorro de recursos</strong>: No duplica objetos costosos<br>
            • <strong>Estado compartido</strong>: Todos acceden al mismo estado<br>
            • <strong>Punto de control</strong>: Centraliza la lógica de creación
        </div>

        <div class="warning-box">
            <strong>⚠️ Desventajas del Singleton:</strong><br>
            • <strong>Estado global</strong>: Puede causar acoplamiento fuerte<br>
            • <strong>Difícil de testear</strong>: Complica los tests unitarios<br>
            • <strong>Viola SRP</strong>: Controla su creación y su lógica<br>
            • <strong>Oculta dependencias</strong>: No es claro quién lo usa<br>
            • <strong>Thread safety</strong>: Puede tener problemas en concurrencia<br>
            • <strong>Anti-patrón</strong>: Considerado anti-patrón por muchos desarrolladores
        </div>

        <div class="info-box">
            <strong>💡 Cuándo Usar Singleton:</strong><br>
            • <strong>Conexiones BD</strong>: Pool de conexiones compartido<br>
            • <strong>Configuración</strong>: Settings globales de la aplicación<br>
            • <strong>Logger</strong>: Sistema de logging centralizado<br>
            • <strong>Cache</strong>: Gestión de cache en memoria<br>
            • <strong>Registro</strong>: Registry pattern para objetos globales<br>
            • <strong>Factory</strong>: Fábricas de objetos compartidas<br>
            <br>
            <strong>⚠️ Cuándo NO Usar:</strong><br>
            • Cuando necesitas múltiples instancias<br>
            • Cuando puedes usar inyección de dependencias<br>
            • En tests unitarios (mejor usar mocks)<br>
            • Cuando el estado debe ser independiente
        </div>
    `,
    'patron-factory': `
        <h1>Patrón Factory Method</h1>
        
        <p>El <strong>patrón Factory Method</strong> es un patrón de diseño creacional que proporciona una interfaz para crear objetos, pero permite que las subclases decidan qué clase instanciar. En lugar de llamar directamente al constructor con <code>new</code>, delegas la creación de objetos a un método factory.</p>

        <div class="info-box">
            <strong>💡 ¿Qué es Factory Method?</strong><br>
            • <strong>Propósito</strong>: Delegar la creación de objetos a métodos especializados<br>
            • <strong>Problema</strong>: Evitar acoplamiento con clases concretas<br>
            • <strong>Solución</strong>: Usar un método que retorna objetos de una interfaz común<br>
            • <strong>Ventaja</strong>: El código cliente no necesita conocer las clases concretas<br>
            • <strong>Uso común</strong>: Crear objetos de diferentes tipos según condiciones
        </div>

        <h3>¿Por Qué Usar Factory Method?</h3>
        <p>Imagina que tienes una aplicación que procesa diferentes tipos de documentos (PDF, Word, Excel). Sin Factory Method:</p>
        <ul>
            <li>Tendrías que usar <code>new</code> con clases concretas en muchos lugares</li>
            <li>Si agregas un nuevo tipo, debes modificar todo el código</li>
            <li>El código está acoplado a implementaciones específicas</li>
        </ul>
        <p>Con Factory Method, centralizas la lógica de creación y el código cliente solo trabaja con interfaces.</p>

        <h3>Problema Sin Factory Method</h3>
        <div class="code-block"><pre><code>&lt;?php
// ❌ SIN Factory Method: Código acoplado y difícil de mantener

class PDFDocument {
    public function open(): void {
        echo "Abriendo documento PDF\\n";
    }
}

class WordDocument {
    public function open(): void {
        echo "Abriendo documento Word\\n";
    }
}

class ExcelDocument {
    public function open(): void {
        echo "Abriendo documento Excel\\n";
    }
}

// Código cliente acoplado a clases concretas
function procesarDocumento(string $tipo): void {
    // ❌ Muchos if/switch basados en tipos
    if ($tipo === 'pdf') {
        $doc = new PDFDocument();  // Acoplamiento directo
    } elseif ($tipo === 'word') {
        $doc = new WordDocument();  // Acoplamiento directo
    } elseif ($tipo === 'excel') {
        $doc = new ExcelDocument();  // Acoplamiento directo
    } else {
        throw new Exception("Tipo no soportado");
    }
    
    $doc->open();
}

// Problemas:
// 1. Código duplicado en múltiples lugares
// 2. Difícil agregar nuevos tipos
// 3. Acoplamiento fuerte con clases concretas
// 4. Viola el principio Open/Closed

procesarDocumento('pdf');
?&gt;</code></pre></div>

        <h3>Solución Con Factory Method</h3>
        <div class="code-block"><pre><code>&lt;?php
// ✅ CON Factory Method: Código desacoplado y extensible

// 1. Definir interfaz común
interface Document {
    public function open(): void;
    public function save(): void;
    public function close(): void;
}

// 2. Implementaciones concretas
class PDFDocument implements Document {
    public function open(): void {
        echo "📄 Abriendo documento PDF\\n";
    }
    
    public function save(): void {
        echo "💾 Guardando PDF\\n";
    }
    
    public function close(): void {
        echo "❌ Cerrando PDF\\n";
    }
}

class WordDocument implements Document {
    public function open(): void {
        echo "📝 Abriendo documento Word\\n";
    }
    
    public function save(): void {
        echo "💾 Guardando Word\\n";
    }
    
    public function close(): void {
        echo "❌ Cerrando Word\\n";
    }
}

class ExcelDocument implements Document {
    public function open(): void {
        echo "📊 Abriendo documento Excel\\n";
    }
    
    public function save(): void {
        echo "💾 Guardando Excel\\n";
    }
    
    public function close(): void {
        echo "❌ Cerrando Excel\\n";
    }
}

// 3. Factory Method: Centraliza la creación
class DocumentFactory {
    public static function create(string $tipo): Document {
        return match($tipo) {
            'pdf' => new PDFDocument(),
            'word' => new WordDocument(),
            'excel' => new ExcelDocument(),
            default => throw new InvalidArgumentException("Tipo no soportado: {$tipo}")
        };
    }
}

// 4. Código cliente desacoplado
function procesarDocumento(string $tipo): void {
    // ✅ Solo conoce la interfaz Document
    $doc = DocumentFactory::create($tipo);
    
    $doc->open();
    $doc->save();
    $doc->close();
}

// Uso simple y limpio
procesarDocumento('pdf');
procesarDocumento('word');
procesarDocumento('excel');

// Ventajas:
// 1. Código cliente desacoplado
// 2. Fácil agregar nuevos tipos
// 3. Lógica de creación centralizada
// 4. Respeta Open/Closed Principle
?&gt;</code></pre></div>

        <h3>Factory Method con Clase Abstracta</h3>
        <div class="code-block"><pre><code>&lt;?php
// Patrón Factory Method clásico con herencia

// 1. Producto abstracto
interface Transporte {
    public function entregar(): void;
}

// 2. Productos concretos
class Camion implements Transporte {
    public function entregar(): void {
        echo "🚚 Entrega por tierra en camión\\n";
    }
}

class Barco implements Transporte {
    public function entregar(): void {
        echo "🚢 Entrega por mar en barco\\n";
    }
}

class Avion implements Transporte {
    public function entregar(): void {
        echo "✈️ Entrega por aire en avión\\n";
    }
}

// 3. Creador abstracto con Factory Method
abstract class Logistica {
    // Factory Method abstracto: las subclases deciden qué crear
    abstract protected function crearTransporte(): Transporte;
    
    // Método que usa el Factory Method
    public function planificarEntrega(): void {
        echo "Planificando entrega...\\n";
        
        // Llama al Factory Method (implementado por subclases)
        $transporte = $this->crearTransporte();
        
        // Usa el objeto creado
        $transporte->entregar();
        
        echo "Entrega completada\\n\\n";
    }
}

// 4. Creadores concretos: implementan el Factory Method
class LogisticaTerrestre extends Logistica {
    protected function crearTransporte(): Transporte {
        return new Camion();
    }
}

class LogisticaMaritima extends Logistica {
    protected function crearTransporte(): Transporte {
        return new Barco();
    }
}

class LogisticaAerea extends Logistica {
    protected function crearTransporte(): Transporte {
        return new Avion();
    }
}

// Uso: El cliente trabaja con la clase base
function procesarLogistica(Logistica $logistica): void {
    $logistica->planificarEntrega();
}

// Cada tipo de logística crea su propio transporte
$terrestre = new LogisticaTerrestre();
procesarLogistica($terrestre);

$maritima = new LogisticaMaritima();
procesarLogistica($maritima);

$aerea = new LogisticaAerea();
procesarLogistica($aerea);
?&gt;</code></pre></div>

        <h3>Ejemplo Real: Sistema de Notificaciones</h3>
        <div class="code-block"><pre><code>&lt;?php
// Sistema de notificaciones con Factory Method

// 1. Interfaz de notificación
interface Notificacion {
    public function enviar(string $destinatario, string $mensaje): bool;
    public function getTipo(): string;
}

// 2. Implementaciones concretas
class EmailNotificacion implements Notificacion {
    public function enviar(string $destinatario, string $mensaje): bool {
        echo "📧 Enviando email a {$destinatario}\\n";
        echo "   Mensaje: {$mensaje}\\n";
        return true;
    }
    
    public function getTipo(): string {
        return 'email';
    }
}

class SMSNotificacion implements Notificacion {
    public function enviar(string $destinatario, string $mensaje): bool {
        echo "📱 Enviando SMS a {$destinatario}\\n";
        echo "   Mensaje: {$mensaje}\\n";
        return true;
    }
    
    public function getTipo(): string {
        return 'sms';
    }
}

class PushNotificacion implements Notificacion {
    public function enviar(string $destinatario, string $mensaje): bool {
        echo "🔔 Enviando push a {$destinatario}\\n";
        echo "   Mensaje: {$mensaje}\\n";
        return true;
    }
    
    public function getTipo(): string {
        return 'push';
    }
}

class SlackNotificacion implements Notificacion {
    public function enviar(string $destinatario, string $mensaje): bool {
        echo "💬 Enviando mensaje Slack a {$destinatario}\\n";
        echo "   Mensaje: {$mensaje}\\n";
        return true;
    }
    
    public function getTipo(): string {
        return 'slack';
    }
}

// 3. Factory con lógica de creación
class NotificacionFactory {
    public static function create(string $tipo): Notificacion {
        return match(strtolower($tipo)) {
            'email', 'correo' => new EmailNotificacion(),
            'sms', 'texto' => new SMSNotificacion(),
            'push', 'notificacion' => new PushNotificacion(),
            'slack', 'chat' => new SlackNotificacion(),
            default => throw new InvalidArgumentException(
                "Tipo de notificación no soportado: {$tipo}"
            )
        };
    }
    
    // Factory Method con configuración
    public static function createFromConfig(array $config): Notificacion {
        $tipo = $config['tipo'] ?? 'email';
        return self::create($tipo);
    }
    
    // Factory Method para múltiples notificaciones
    public static function createMultiple(array $tipos): array {
        return array_map(
            fn($tipo) => self::create($tipo),
            $tipos
        );
    }
}

// 4. Servicio que usa el Factory
class NotificadorService {
    public function notificarUsuario(
        string $tipoNotificacion,
        string $destinatario,
        string $mensaje
    ): void {
        // Crear notificación usando Factory
        $notificacion = NotificacionFactory::create($tipoNotificacion);
        
        echo "Usando notificación tipo: {$notificacion->getTipo()}\\n";
        $notificacion->enviar($destinatario, $mensaje);
        echo "\\n";
    }
    
    public function notificarMultiple(
        array $tiposNotificacion,
        string $destinatario,
        string $mensaje
    ): void {
        $notificaciones = NotificacionFactory::createMultiple($tiposNotificacion);
        
        foreach ($notificaciones as $notificacion) {
            $notificacion->enviar($destinatario, $mensaje);
        }
    }
}

// Uso del servicio
$servicio = new NotificadorService();

echo "=== Notificación simple ===\\n";
$servicio->notificarUsuario('email', 'user@example.com', 'Bienvenido!');

echo "=== Notificación por SMS ===\\n";
$servicio->notificarUsuario('sms', '+34123456789', 'Código: 1234');

echo "=== Notificaciones múltiples ===\\n";
$servicio->notificarMultiple(
    ['email', 'push', 'slack'],
    'usuario',
    'Tienes un nuevo mensaje'
);
?&gt;</code></pre></div>

        <h3>Ejemplo Real: Sistema de Pagos</h3>
        <div class="code-block"><pre><code>&lt;?php
// Sistema de procesamiento de pagos

// 1. Interfaz de procesador de pagos
interface ProcesadorPago {
    public function procesarPago(float $monto, array $datos): bool;
    public function reembolsar(string $transaccionId): bool;
    public function getNombre(): string;
}

// 2. Implementaciones concretas
class ProcesadorTarjeta implements ProcesadorPago {
    public function procesarPago(float $monto, array $datos): bool {
        echo "💳 Procesando pago con tarjeta\\n";
        echo "   Monto: \${$monto}\\n";
        echo "   Tarjeta: ****{$datos['ultimos4']}\\n";
        return true;
    }
    
    public function reembolsar(string $transaccionId): bool {
        echo "↩️ Reembolsando transacción: {$transaccionId}\\n";
        return true;
    }
    
    public function getNombre(): string {
        return 'Tarjeta de Crédito';
    }
}

class ProcesadorPayPal implements ProcesadorPago {
    public function procesarPago(float $monto, array $datos): bool {
        echo "🅿️ Procesando pago con PayPal\\n";
        echo "   Monto: \${$monto}\\n";
        echo "   Email: {$datos['email']}\\n";
        return true;
    }
    
    public function reembolsar(string $transaccionId): bool {
        echo "↩️ Reembolsando vía PayPal: {$transaccionId}\\n";
        return true;
    }
    
    public function getNombre(): string {
        return 'PayPal';
    }
}

class ProcesadorCripto implements ProcesadorPago {
    public function procesarPago(float $monto, array $datos): bool {
        echo "₿ Procesando pago con criptomoneda\\n";
        echo "   Monto: \${$monto}\\n";
        echo "   Wallet: {$datos['wallet']}\\n";
        echo "   Moneda: {$datos['moneda']}\\n";
        return true;
    }
    
    public function reembolsar(string $transaccionId): bool {
        echo "↩️ Reembolsando cripto: {$transaccionId}\\n";
        return true;
    }
    
    public function getNombre(): string {
        return 'Criptomoneda';
    }
}

class ProcesadorTransferencia implements ProcesadorPago {
    public function procesarPago(float $monto, array $datos): bool {
        echo "🏦 Procesando transferencia bancaria\\n";
        echo "   Monto: \${$monto}\\n";
        echo "   Banco: {$datos['banco']}\\n";
        echo "   Cuenta: ****{$datos['cuenta']}\\n";
        return true;
    }
    
    public function reembolsar(string $transaccionId): bool {
        echo "↩️ Reembolsando transferencia: {$transaccionId}\\n";
        return true;
    }
    
    public function getNombre(): string {
        return 'Transferencia Bancaria';
    }
}

// 3. Factory con validación y lógica compleja
class ProcesadorPagoFactory {
    private static array $procesadores = [
        'tarjeta' => ProcesadorTarjeta::class,
        'paypal' => ProcesadorPayPal::class,
        'cripto' => ProcesadorCripto::class,
        'transferencia' => ProcesadorTransferencia::class,
    ];
    
    public static function create(string $metodo): ProcesadorPago {
        $metodo = strtolower($metodo);
        
        if (!isset(self::$procesadores[$metodo])) {
            throw new InvalidArgumentException(
                "Método de pago no soportado: {$metodo}"
            );
        }
        
        $clase = self::$procesadores[$metodo];
        return new $clase();
    }
    
    // Factory Method con detección automática
    public static function createFromDatos(array $datos): ProcesadorPago {
        if (isset($datos['numero_tarjeta'])) {
            return new ProcesadorTarjeta();
        }
        
        if (isset($datos['email_paypal'])) {
            return new ProcesadorPayPal();
        }
        
        if (isset($datos['wallet'])) {
            return new ProcesadorCripto();
        }
        
        if (isset($datos['cuenta_bancaria'])) {
            return new ProcesadorTransferencia();
        }
        
        throw new InvalidArgumentException("No se pudo determinar el método de pago");
    }
    
    // Registrar nuevos procesadores dinámicamente
    public static function registrar(string $nombre, string $clase): void {
        if (!is_subclass_of($clase, ProcesadorPago::class)) {
            throw new InvalidArgumentException(
                "La clase debe implementar ProcesadorPago"
            );
        }
        
        self::$procesadores[$nombre] = $clase;
    }
    
    public static function getMetodosDisponibles(): array {
        return array_keys(self::$procesadores);
    }
}

// 4. Servicio de pagos
class ServicioPagos {
    public function procesarPedido(
        float $monto,
        string $metodoPago,
        array $datosPago
    ): bool {
        echo "=== Procesando pedido ===\\n";
        echo "Monto total: \${$monto}\\n";
        
        // Crear procesador usando Factory
        $procesador = ProcesadorPagoFactory::create($metodoPago);
        
        echo "Método seleccionado: {$procesador->getNombre()}\\n\\n";
        
        // Procesar pago
        $resultado = $procesador->procesarPago($monto, $datosPago);
        
        if ($resultado) {
            echo "\\n✅ Pago procesado exitosamente\\n";
        } else {
            echo "\\n❌ Error al procesar pago\\n";
        }
        
        return $resultado;
    }
}

// Uso del servicio
$servicio = new ServicioPagos();

echo "=== Pago 1: Tarjeta ===\\n";
$servicio->procesarPedido(
    150.00,
    'tarjeta',
    ['ultimos4' => '1234', 'cvv' => '123']
);

echo "\\n=== Pago 2: PayPal ===\\n";
$servicio->procesarPedido(
    75.50,
    'paypal',
    ['email' => 'user@example.com']
);

echo "\\n=== Pago 3: Cripto ===\\n";
$servicio->procesarPedido(
    200.00,
    'cripto',
    ['wallet' => '1A2B3C...', 'moneda' => 'BTC']
);

echo "\\n=== Métodos disponibles ===\\n";
$metodos = ProcesadorPagoFactory::getMetodosDisponibles();
echo "Métodos: " . implode(', ', $metodos) . "\\n";
?&gt;</code></pre></div>

        <h3>Factory Method con Parámetros</h3>
        <div class="code-block"><pre><code>&lt;?php
// Factory que acepta parámetros de configuración

interface Reporte {
    public function generar(array $datos): string;
}

class ReportePDF implements Reporte {
    public function __construct(
        private string $orientacion = 'portrait',
        private string $tamano = 'A4'
    ) {}
    
    public function generar(array $datos): string {
        return "Reporte PDF ({$this->orientacion}, {$this->tamano})";
    }
}

class ReporteExcel implements Reporte {
    public function __construct(
        private bool $incluirGraficos = true
    ) {}
    
    public function generar(array $datos): string {
        $graficos = $this->incluirGraficos ? 'con gráficos' : 'sin gráficos';
        return "Reporte Excel ({$graficos})";
    }
}

class ReporteHTML implements Reporte {
    public function __construct(
        private string $tema = 'light'
    ) {}
    
    public function generar(array $datos): string {
        return "Reporte HTML (tema: {$this->tema})";
    }
}

class ReporteFactory {
    public static function create(
        string $tipo,
        array $opciones = []
    ): Reporte {
        return match($tipo) {
            'pdf' => new ReportePDF(
                $opciones['orientacion'] ?? 'portrait',
                $opciones['tamano'] ?? 'A4'
            ),
            'excel' => new ReporteExcel(
                $opciones['graficos'] ?? true
            ),
            'html' => new ReporteHTML(
                $opciones['tema'] ?? 'light'
            ),
            default => throw new InvalidArgumentException("Tipo no soportado")
        };
    }
}

// Uso con diferentes configuraciones
$pdfVertical = ReporteFactory::create('pdf', [
    'orientacion' => 'portrait',
    'tamano' => 'A4'
]);

$pdfHorizontal = ReporteFactory::create('pdf', [
    'orientacion' => 'landscape',
    'tamano' => 'Letter'
]);

$excelSimple = ReporteFactory::create('excel', [
    'graficos' => false
]);

$htmlOscuro = ReporteFactory::create('html', [
    'tema' => 'dark'
]);

echo $pdfVertical->generar([]) . "\\n";
echo $pdfHorizontal->generar([]) . "\\n";
echo $excelSimple->generar([]) . "\\n";
echo $htmlOscuro->generar([]) . "\\n";
?&gt;</code></pre></div>

        <h3>Factory Method con Registro Dinámico</h3>
        <div class="code-block"><pre><code>&lt;?php
// Factory extensible que permite registrar nuevos tipos

interface Exportador {
    public function exportar(array $datos): string;
}

class ExportadorJSON implements Exportador {
    public function exportar(array $datos): string {
        return json_encode($datos);
    }
}

class ExportadorXML implements Exportador {
    public function exportar(array $datos): string {
        return "&lt;datos&gt;" . print_r($datos, true) . "&lt;/datos&gt;";
    }
}

class ExportadorCSV implements Exportador {
    public function exportar(array $datos): string {
        return implode(',', $datos);
    }
}

class ExportadorFactory {
    private static array $exportadores = [];
    
    // Registrar exportadores en tiempo de ejecución
    public static function registrar(string $tipo, string $clase): void {
        if (!is_subclass_of($clase, Exportador::class)) {
            throw new InvalidArgumentException(
                "La clase debe implementar Exportador"
            );
        }
        
        self::$exportadores[$tipo] = $clase;
    }
    
    public static function create(string $tipo): Exportador {
        if (!isset(self::$exportadores[$tipo])) {
            throw new InvalidArgumentException(
                "Exportador no registrado: {$tipo}"
            );
        }
        
        $clase = self::$exportadores[$tipo];
        return new $clase();
    }
    
    public static function getTiposDisponibles(): array {
        return array_keys(self::$exportadores);
    }
}

// Registrar exportadores
ExportadorFactory::registrar('json', ExportadorJSON::class);
ExportadorFactory::registrar('xml', ExportadorXML::class);
ExportadorFactory::registrar('csv', ExportadorCSV::class);

// Usar exportadores
$datos = ['nombre' => 'Juan', 'edad' => 30];

$json = ExportadorFactory::create('json');
echo "JSON: " . $json->exportar($datos) . "\\n";

$xml = ExportadorFactory::create('xml');
echo "XML: " . $xml->exportar($datos) . "\\n";

// Agregar nuevo exportador en tiempo de ejecución
class ExportadorYAML implements Exportador {
    public function exportar(array $datos): string {
        return "nombre: Juan\\nedad: 30";
    }
}

ExportadorFactory::registrar('yaml', ExportadorYAML::class);

$yaml = ExportadorFactory::create('yaml');
echo "YAML: " . $yaml->exportar($datos) . "\\n";

echo "\\nTipos disponibles: " . implode(', ', ExportadorFactory::getTiposDisponibles());
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Ventajas del Factory Method:</strong><br>
            • <strong>Desacoplamiento</strong>: El código cliente no conoce clases concretas<br>
            • <strong>Extensibilidad</strong>: Fácil agregar nuevos tipos sin modificar código existente<br>
            • <strong>Centralización</strong>: Lógica de creación en un solo lugar<br>
            • <strong>Flexibilidad</strong>: Puedes cambiar qué objetos se crean sin afectar clientes<br>
            • <strong>Open/Closed</strong>: Abierto para extensión, cerrado para modificación<br>
            • <strong>Testeable</strong>: Fácil crear mocks y stubs para testing
        </div>

        <div class="warning-box">
            <strong>⚠️ Desventajas del Factory Method:</strong><br>
            • <strong>Complejidad</strong>: Añade clases y abstracciones adicionales<br>
            • <strong>Over-engineering</strong>: Puede ser excesivo para casos simples<br>
            • <strong>Indirección</strong>: Un nivel más de indirección en el código<br>
            • <strong>Mantenimiento</strong>: Más código que mantener<br>
            • <strong>Curva de aprendizaje</strong>: Puede ser confuso para principiantes
        </div>

        <div class="info-box">
            <strong>💡 Cuándo Usar Factory Method:</strong><br>
            • <strong>Múltiples tipos</strong>: Cuando tienes varias implementaciones de una interfaz<br>
            • <strong>Lógica compleja</strong>: La creación requiere lógica condicional<br>
            • <strong>Desacoplamiento</strong>: Quieres separar creación de uso<br>
            • <strong>Extensibilidad</strong>: Necesitas agregar tipos frecuentemente<br>
            • <strong>Configuración</strong>: La creación depende de configuración externa<br>
            • <strong>Testing</strong>: Necesitas intercambiar implementaciones fácilmente<br>
            <br>
            <strong>⚠️ Cuándo NO Usar:</strong><br>
            • Solo tienes una implementación<br>
            • La creación es trivial (solo <code>new</code>)<br>
            • El código es simple y no cambiará<br>
            • Añade complejidad innecesaria
        </div>
    `,
    'patron-abstract-factory': `
        <h1>Patrón Abstract Factory</h1>
        
        <p>El <strong>patrón Abstract Factory</strong> es un patrón de diseño creacional que proporciona una interfaz para crear <strong>familias de objetos relacionados</strong> sin especificar sus clases concretas. Es como un "factory de factories" que crea grupos de objetos que están diseñados para trabajar juntos.</p>

        <div class="info-box">
            <strong>💡 ¿Qué es Abstract Factory?</strong><br>
            • <strong>Propósito</strong>: Crear familias completas de objetos relacionados<br>
            • <strong>Diferencia con Factory Method</strong>: Crea múltiples productos relacionados, no solo uno<br>
            • <strong>Problema</strong>: Garantizar que objetos de una familia sean compatibles entre sí<br>
            • <strong>Solución</strong>: Una interfaz factory que crea todos los productos de una familia<br>
            • <strong>Uso común</strong>: Temas UI, sistemas multiplataforma, familias de productos
        </div>

        <h3>Factory Method vs Abstract Factory</h3>
        <p><strong>Factory Method</strong> crea UN tipo de objeto. <strong>Abstract Factory</strong> crea FAMILIAS de objetos relacionados que trabajan juntos.</p>

        <h3>¿Por Qué Usar Abstract Factory?</h3>
        <p>Imagina que estás creando una aplicación con diferentes temas visuales (Claro, Oscuro). Cada tema necesita botones, inputs y checkboxes con estilo específico. Abstract Factory garantiza que todos los componentes de un tema sean compatibles entre sí.</p>

        <h3>Solución Con Abstract Factory</h3>
        <div class="code-block"><pre><code>&lt;?php
// 1. Interfaces de productos
interface Boton {
    public function render(): void;
}

interface Input {
    public function render(): void;
}

// 2. Productos concretos - Tema Claro
class BotonClaro implements Boton {
    public function render(): void {
        echo "🔘 Botón claro (fondo blanco)\\n";
    }
}

class InputClaro implements Input {
    public function render(): void {
        echo "📝 Input claro (borde gris)\\n";
    }
}

// 3. Productos concretos - Tema Oscuro
class BotonOscuro implements Boton {
    public function render(): void {
        echo "🔘 Botón oscuro (fondo negro)\\n";
    }
}

class InputOscuro implements Input {
    public function render(): void {
        echo "📝 Input oscuro (borde gris oscuro)\\n";
    }
}

// 4. Abstract Factory
interface UIFactory {
    public function crearBoton(): Boton;
    public function crearInput(): Input;
}

// 5. Factories concretas
class TemaClaro implements UIFactory {
    public function crearBoton(): Boton {
        return new BotonClaro();
    }
    
    public function crearInput(): Input {
        return new InputClaro();
    }
}

class TemaOscuro implements UIFactory {
    public function crearBoton(): Boton {
        return new BotonOscuro();
    }
    
    public function crearInput(): Input {
        return new InputOscuro();
    }
}

// 6. Cliente
class Formulario {
    public function __construct(private UIFactory $factory) {}
    
    public function render(): void {
        $boton = $this->factory->crearBoton();
        $input = $this->factory->crearInput();
        
        $boton->render();
        $input->render();
    }
}

// Uso
$formularioClaro = new Formulario(new TemaClaro());
$formularioClaro->render();

$formularioOscuro = new Formulario(new TemaOscuro());
$formularioOscuro->render();
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Ventajas del Abstract Factory:</strong><br>
            • <strong>Consistencia</strong>: Garantiza que productos sean compatibles<br>
            • <strong>Aislamiento</strong>: Separa código de implementaciones concretas<br>
            • <strong>Intercambiabilidad</strong>: Fácil cambiar familias completas<br>
            • <strong>Open/Closed</strong>: Agregar familias sin modificar código<br>
            • <strong>Testeable</strong>: Fácil crear familias mock
        </div>

        <div class="warning-box">
            <strong>⚠️ Desventajas:</strong><br>
            • <strong>Complejidad</strong>: Muchas interfaces y clases<br>
            • <strong>Rigidez</strong>: Agregar producto requiere modificar todas las factories<br>
            • <strong>Over-engineering</strong>: Puede ser excesivo para casos simples
        </div>

        <div class="info-box">
            <strong>💡 Cuándo Usar:</strong><br>
            • Familias de productos que deben ser compatibles<br>
            • UI con diferentes temas visuales<br>
            • Aplicaciones multiplataforma<br>
            • Diferentes implementaciones de una API<br>
            • Necesitas garantizar consistencia entre objetos
        </div>
    `,
    'patron-builder': `
        <h1>Patrón Builder</h1>
        
        <p>El <strong>patrón Builder</strong> es un patrón de diseño creacional que permite construir objetos complejos paso a paso. Separa la construcción de un objeto de su representación, permitiendo crear diferentes representaciones usando el mismo proceso de construcción.</p>

        <div class="info-box">
            <strong>💡 ¿Qué es Builder?</strong><br>
            • <strong>Propósito</strong>: Construir objetos complejos paso a paso<br>
            • <strong>Problema</strong>: Evitar constructores con muchos parámetros<br>
            • <strong>Solución</strong>: Clase builder que construye el objeto gradualmente<br>
            • <strong>Ventaja</strong>: Código más legible y flexible<br>
            • <strong>Uso común</strong>: Objetos con muchas propiedades opcionales
        </div>

        <h3>¿Por Qué Usar Builder?</h3>
        <p>Imagina que tienes una clase con 10+ parámetros opcionales. Sin Builder:</p>
        <ul>
            <li>Constructor con muchos parámetros (difícil de leer)</li>
            <li>Múltiples constructores sobrecargados</li>
            <li>No sabes qué representa cada parámetro</li>
            <li>Difícil agregar nuevas opciones</li>
        </ul>
        <p>Con Builder, construyes el objeto paso a paso con métodos descriptivos.</p>

        <h3>Problema Sin Builder</h3>
        <div class="code-block"><pre><code>&lt;?php
// ❌ SIN Builder: Constructor con muchos parámetros

class Pizza {
    public function __construct(
        private string $masa,
        private string $salsa,
        private string $queso,
        private bool $pepperoni = false,
        private bool $jamon = false,
        private bool $champinones = false,
        private bool $aceitunas = false,
        private bool $pimiento = false,
        private bool $cebolla = false,
        private string $tamano = 'mediana',
        private bool $bordRelleno = false,
        private string $coccion = 'normal'
    ) {}
}

// ❌ Difícil de leer y entender
$pizza = new Pizza(
    'delgada',
    'tomate',
    'mozzarella',
    true,   // ¿Qué es esto?
    false,  // ¿Y esto?
    true,   // ¿Y esto?
    false,
    true,
    false,
    'grande',
    true,
    'extra'
);

// Problemas:
// 1. No sabes qué representa cada parámetro
// 2. Debes pasar todos los parámetros en orden
// 3. Difícil agregar nuevas opciones
// 4. Código poco legible
?&gt;</code></pre></div>

        <h3>Solución Con Builder</h3>
        <div class="code-block"><pre><code>&lt;?php
// ✅ CON Builder: Construcción paso a paso y legible

class Pizza {
    private string $masa;
    private string $salsa;
    private string $queso;
    private array $ingredientes = [];
    private string $tamano = 'mediana';
    private bool $bordRelleno = false;
    private string $coccion = 'normal';
    
    // Constructor privado: solo el builder puede crear pizzas
    private function __construct() {}
    
    public function describir(): string {
        $desc = "Pizza {$this->tamano} con masa {$this->masa}, ";
        $desc .= "salsa {$this->salsa}, queso {$this->queso}";
        
        if (!empty($this->ingredientes)) {
            $desc .= ", ingredientes: " . implode(', ', $this->ingredientes);
        }
        
        if ($this->bordRelleno) {
            $desc .= ", borde relleno";
        }
        
        $desc .= ", cocción {$this->coccion}";
        
        return $desc;
    }
}

// Builder: Construye pizzas paso a paso
class PizzaBuilder {
    private Pizza $pizza;
    
    public function __construct() {
        $this->reset();
    }
    
    public function reset(): self {
        $this->pizza = new Pizza();
        return $this;
    }
    
    public function setMasa(string $tipo): self {
        $this->pizza->masa = $tipo;
        return $this;
    }
    
    public function setSalsa(string $tipo): self {
        $this->pizza->salsa = $tipo;
        return $this;
    }
    
    public function setQueso(string $tipo): self {
        $this->pizza->queso = $tipo;
        return $this;
    }
    
    public function agregarPepperoni(): self {
        $this->pizza->ingredientes[] = 'pepperoni';
        return $this;
    }
    
    public function agregarJamon(): self {
        $this->pizza->ingredientes[] = 'jamón';
        return $this;
    }
    
    public function agregarChampinones(): self {
        $this->pizza->ingredientes[] = 'champiñones';
        return $this;
    }
    
    public function agregarAceitunas(): self {
        $this->pizza->ingredientes[] = 'aceitunas';
        return $this;
    }
    
    public function setTamano(string $tamano): self {
        $this->pizza->tamano = $tamano;
        return $this;
    }
    
    public function conBordRelleno(): self {
        $this->pizza->bordRelleno = true;
        return $this;
    }
    
    public function setCoccion(string $tipo): self {
        $this->pizza->coccion = $tipo;
        return $this;
    }
    
    public function build(): Pizza {
        $resultado = $this->pizza;
        $this->reset(); // Preparar para la siguiente pizza
        return $resultado;
    }
}

// ✅ Uso: Código legible y descriptivo
$builder = new PizzaBuilder();

$pizzaMargarita = $builder
    ->setMasa('delgada')
    ->setSalsa('tomate')
    ->setQueso('mozzarella')
    ->setTamano('mediana')
    ->build();

echo $pizzaMargarita->describir() . "\\n\\n";

$pizzaSuprema = $builder
    ->setMasa('gruesa')
    ->setSalsa('tomate')
    ->setQueso('mozzarella')
    ->agregarPepperoni()
    ->agregarJamon()
    ->agregarChampinones()
    ->agregarAceitunas()
    ->setTamano('grande')
    ->conBordRelleno()
    ->setCoccion('extra')
    ->build();

echo $pizzaSuprema->describir() . "\\n";

// Ventajas:
// 1. Código muy legible
// 2. Solo especificas lo que necesitas
// 3. Fácil agregar nuevas opciones
// 4. Construcción paso a paso
?&gt;</code></pre></div>

        <h3>Builder con Director</h3>
        <div class="code-block"><pre><code>&lt;?php
// Director: Encapsula recetas comunes de construcción

class PizzaDirector {
    public function __construct(private PizzaBuilder $builder) {}
    
    public function construirMargarita(): Pizza {
        return $this->builder
            ->setMasa('delgada')
            ->setSalsa('tomate')
            ->setQueso('mozzarella')
            ->setTamano('mediana')
            ->build();
    }
    
    public function construirPepperoni(): Pizza {
        return $this->builder
            ->setMasa('normal')
            ->setSalsa('tomate')
            ->setQueso('mozzarella')
            ->agregarPepperoni()
            ->setTamano('grande')
            ->build();
    }
    
    public function construirVegetariana(): Pizza {
        return $this->builder
            ->setMasa('integral')
            ->setSalsa('tomate')
            ->setQueso('mozzarella')
            ->agregarChampinones()
            ->agregarAceitunas()
            ->setTamano('mediana')
            ->build();
    }
    
    public function construirSuprema(): Pizza {
        return $this->builder
            ->setMasa('gruesa')
            ->setSalsa('tomate')
            ->setQueso('mozzarella')
            ->agregarPepperoni()
            ->agregarJamon()
            ->agregarChampinones()
            ->agregarAceitunas()
            ->setTamano('grande')
            ->conBordRelleno()
            ->setCoccion('extra')
            ->build();
    }
}

// Uso del Director
$builder = new PizzaBuilder();
$director = new PizzaDirector($builder);

echo "=== Pizzas predefinidas ===\\n";
$margarita = $director->construirMargarita();
echo "Margarita: " . $margarita->describir() . "\\n\\n";

$pepperoni = $director->construirPepperoni();
echo "Pepperoni: " . $pepperoni->describir() . "\\n\\n";

$vegetariana = $director->construirVegetariana();
echo "Vegetariana: " . $vegetariana->describir() . "\\n\\n";

$suprema = $director->construirSuprema();
echo "Suprema: " . $suprema->describir() . "\\n";
?&gt;</code></pre></div>

        <h3>Ejemplo Real: Constructor de Consultas SQL</h3>
        <div class="code-block"><pre><code>&lt;?php
// Builder para construir consultas SQL de forma segura

class Query {
    private string $select = '*';
    private string $from = '';
    private array $joins = [];
    private array $where = [];
    private array $orderBy = [];
    private ?int $limit = null;
    private ?int $offset = null;
    
    public function toSQL(): string {
        $sql = "SELECT {$this->select} FROM {$this->from}";
        
        foreach ($this->joins as $join) {
            $sql .= " {$join}";
        }
        
        if (!empty($this->where)) {
            $sql .= " WHERE " . implode(' AND ', $this->where);
        }
        
        if (!empty($this->orderBy)) {
            $sql .= " ORDER BY " . implode(', ', $this->orderBy);
        }
        
        if ($this->limit !== null) {
            $sql .= " LIMIT {$this->limit}";
        }
        
        if ($this->offset !== null) {
            $sql .= " OFFSET {$this->offset}";
        }
        
        return $sql;
    }
}

class QueryBuilder {
    private Query $query;
    
    public function __construct() {
        $this->reset();
    }
    
    public function reset(): self {
        $this->query = new Query();
        return $this;
    }
    
    public function select(string ...$columns): self {
        $this->query->select = implode(', ', $columns);
        return $this;
    }
    
    public function from(string $table): self {
        $this->query->from = $table;
        return $this;
    }
    
    public function join(string $table, string $on): self {
        $this->query->joins[] = "JOIN {$table} ON {$on}";
        return $this;
    }
    
    public function leftJoin(string $table, string $on): self {
        $this->query->joins[] = "LEFT JOIN {$table} ON {$on}";
        return $this;
    }
    
    public function where(string $condition): self {
        $this->query->where[] = $condition;
        return $this;
    }
    
    public function orderBy(string $column, string $direction = 'ASC'): self {
        $this->query->orderBy[] = "{$column} {$direction}";
        return $this;
    }
    
    public function limit(int $limit): self {
        $this->query->limit = $limit;
        return $this;
    }
    
    public function offset(int $offset): self {
        $this->query->offset = $offset;
        return $this;
    }
    
    public function build(): Query {
        $resultado = $this->query;
        $this->reset();
        return $resultado;
    }
}

// Uso: Construir consultas complejas de forma legible
$builder = new QueryBuilder();

// Consulta simple
$query1 = $builder
    ->select('id', 'nombre', 'email')
    ->from('usuarios')
    ->where('activo = 1')
    ->orderBy('nombre', 'ASC')
    ->limit(10)
    ->build();

echo "Consulta 1:\\n" . $query1->toSQL() . "\\n\\n";

// Consulta con JOIN
$query2 = $builder
    ->select('u.nombre', 'u.email', 'p.titulo', 'p.fecha')
    ->from('usuarios u')
    ->join('posts p', 'p.usuario_id = u.id')
    ->where('u.activo = 1')
    ->where('p.publicado = 1')
    ->orderBy('p.fecha', 'DESC')
    ->limit(20)
    ->build();

echo "Consulta 2:\\n" . $query2->toSQL() . "\\n\\n";

// Consulta con paginación
$query3 = $builder
    ->select('*')
    ->from('productos')
    ->where('precio > 100')
    ->where('stock > 0')
    ->orderBy('precio', 'ASC')
    ->limit(15)
    ->offset(30)
    ->build();

echo "Consulta 3:\\n" . $query3->toSQL() . "\\n";
?&gt;</code></pre></div>

        <h3>Ejemplo Real: Constructor de Emails</h3>
        <div class="code-block"><pre><code>&lt;?php
// Builder para construir emails complejos

class Email {
    private string $from = '';
    private array $to = [];
    private array $cc = [];
    private array $bcc = [];
    private string $subject = '';
    private string $body = '';
    private string $htmlBody = '';
    private array $attachments = [];
    private int $priority = 3; // 1=alta, 3=normal, 5=baja
    
    public function enviar(): bool {
        echo "📧 Enviando email:\\n";
        echo "De: {$this->from}\\n";
        echo "Para: " . implode(', ', $this->to) . "\\n";
        
        if (!empty($this->cc)) {
            echo "CC: " . implode(', ', $this->cc) . "\\n";
        }
        
        echo "Asunto: {$this->subject}\\n";
        echo "Cuerpo: {$this->body}\\n";
        
        if (!empty($this->attachments)) {
            echo "Adjuntos: " . implode(', ', $this->attachments) . "\\n";
        }
        
        echo "Prioridad: {$this->priority}\\n";
        echo "✅ Email enviado\\n";
        
        return true;
    }
}

class EmailBuilder {
    private Email $email;
    
    public function __construct() {
        $this->reset();
    }
    
    public function reset(): self {
        $this->email = new Email();
        return $this;
    }
    
    public function from(string $email): self {
        $this->email->from = $email;
        return $this;
    }
    
    public function to(string ...$emails): self {
        $this->email->to = array_merge($this->email->to, $emails);
        return $this;
    }
    
    public function cc(string ...$emails): self {
        $this->email->cc = array_merge($this->email->cc, $emails);
        return $this;
    }
    
    public function bcc(string ...$emails): self {
        $this->email->bcc = array_merge($this->email->bcc, $emails);
        return $this;
    }
    
    public function subject(string $subject): self {
        $this->email->subject = $subject;
        return $this;
    }
    
    public function body(string $body): self {
        $this->email->body = $body;
        return $this;
    }
    
    public function htmlBody(string $html): self {
        $this->email->htmlBody = $html;
        return $this;
    }
    
    public function attach(string ...$files): self {
        $this->email->attachments = array_merge($this->email->attachments, $files);
        return $this;
    }
    
    public function prioridadAlta(): self {
        $this->email->priority = 1;
        return $this;
    }
    
    public function prioridadNormal(): self {
        $this->email->priority = 3;
        return $this;
    }
    
    public function prioridadBaja(): self {
        $this->email->priority = 5;
        return $this;
    }
    
    public function build(): Email {
        $resultado = $this->email;
        $this->reset();
        return $resultado;
    }
}

// Uso: Construir emails complejos
$builder = new EmailBuilder();

// Email simple
echo "=== Email simple ===\\n";
$emailSimple = $builder
    ->from('sender@example.com')
    ->to('user@example.com')
    ->subject('Bienvenido')
    ->body('Gracias por registrarte')
    ->build();

$emailSimple->enviar();

// Email complejo
echo "\\n=== Email complejo ===\\n";
$emailComplejo = $builder
    ->from('admin@example.com')
    ->to('user1@example.com', 'user2@example.com')
    ->cc('manager@example.com')
    ->subject('Reporte mensual')
    ->body('Adjunto encontrarás el reporte del mes')
    ->attach('reporte.pdf', 'graficos.xlsx')
    ->prioridadAlta()
    ->build();

$emailComplejo->enviar();
?&gt;</code></pre></div>

        <h3>Ejemplo Real: Constructor de Documentos HTML</h3>
        <div class="code-block"><pre><code>&lt;?php
// Builder para construir documentos HTML

class HTMLDocument {
    private string $title = '';
    private array $meta = [];
    private array $styles = [];
    private array $scripts = [];
    private string $body = '';
    
    public function render(): string {
        $html = "&lt;!DOCTYPE html&gt;\\n&lt;html&gt;\\n&lt;head&gt;\\n";
        $html .= "  &lt;title&gt;{$this->title}&lt;/title&gt;\\n";
        
        foreach ($this->meta as $meta) {
            $html .= "  {$meta}\\n";
        }
        
        foreach ($this->styles as $style) {
            $html .= "  {$style}\\n";
        }
        
        $html .= "&lt;/head&gt;\\n&lt;body&gt;\\n";
        $html .= $this->body;
        $html .= "\\n";
        
        foreach ($this->scripts as $script) {
            $html .= "  {$script}\\n";
        }
        
        $html .= "&lt;/body&gt;\\n&lt;/html&gt;";
        
        return $html;
    }
}

class HTMLBuilder {
    private HTMLDocument $document;
    
    public function __construct() {
        $this->reset();
    }
    
    public function reset(): self {
        $this->document = new HTMLDocument();
        return $this;
    }
    
    public function setTitle(string $title): self {
        $this->document->title = $title;
        return $this;
    }
    
    public function addMeta(string $name, string $content): self {
        $this->document->meta[] = "&lt;meta name=\\"{$name}\\" content=\\"{$content}\\"&gt;";
        return $this;
    }
    
    public function addStylesheet(string $href): self {
        $this->document->styles[] = "&lt;link rel=\\"stylesheet\\" href=\\"{$href}\\"&gt;";
        return $this;
    }
    
    public function addStyle(string $css): self {
        $this->document->styles[] = "&lt;style&gt;{$css}&lt;/style&gt;";
        return $this;
    }
    
    public function addScript(string $src): self {
        $this->document->scripts[] = "&lt;script src=\\"{$src}\\"&gt;&lt;/script&gt;";
        return $this;
    }
    
    public function addInlineScript(string $js): self {
        $this->document->scripts[] = "&lt;script&gt;{$js}&lt;/script&gt;";
        return $this;
    }
    
    public function setBody(string $html): self {
        $this->document->body = $html;
        return $this;
    }
    
    public function appendToBody(string $html): self {
        $this->document->body .= $html;
        return $this;
    }
    
    public function build(): HTMLDocument {
        $resultado = $this->document;
        $this->reset();
        return $resultado;
    }
}

// Uso
$builder = new HTMLBuilder();

$documento = $builder
    ->setTitle('Mi Página Web')
    ->addMeta('charset', 'UTF-8')
    ->addMeta('viewport', 'width=device-width, initial-scale=1.0')
    ->addStylesheet('styles.css')
    ->addStyle('body { font-family: Arial; }')
    ->setBody('&lt;h1&gt;Hola Mundo&lt;/h1&gt;')
    ->appendToBody('&lt;p&gt;Bienvenido a mi sitio&lt;/p&gt;')
    ->addScript('app.js')
    ->addInlineScript('console.log("Página cargada");')
    ->build();

echo $documento->render();
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Ventajas del Builder:</strong><br>
            • <strong>Legibilidad</strong>: Código muy claro y descriptivo<br>
            • <strong>Flexibilidad</strong>: Solo especificas lo que necesitas<br>
            • <strong>Inmutabilidad</strong>: Objeto final puede ser inmutable<br>
            • <strong>Validación</strong>: Puedes validar en el método build()<br>
            • <strong>Reutilización</strong>: El builder se puede reutilizar<br>
            • <strong>Paso a paso</strong>: Construcción gradual del objeto
        </div>

        <div class="warning-box">
            <strong>⚠️ Desventajas del Builder:</strong><br>
            • <strong>Más código</strong>: Requiere crear clase builder adicional<br>
            • <strong>Complejidad</strong>: Puede ser excesivo para objetos simples<br>
            • <strong>Duplicación</strong>: Builder duplica propiedades del objeto<br>
            • <strong>Overhead</strong>: Objeto adicional en memoria
        </div>

        <div class="info-box">
            <strong>💡 Cuándo Usar Builder:</strong><br>
            • <strong>Muchos parámetros</strong>: Constructor con 4+ parámetros<br>
            • <strong>Parámetros opcionales</strong>: Muchas propiedades opcionales<br>
            • <strong>Construcción compleja</strong>: Proceso de construcción con varios pasos<br>
            • <strong>Inmutabilidad</strong>: Quieres objetos inmutables<br>
            • <strong>Validación</strong>: Necesitas validar antes de crear el objeto<br>
            • <strong>Legibilidad</strong>: Quieres código más expresivo<br>
            <br>
            <strong>⚠️ Cuándo NO Usar:</strong><br>
            • Objetos simples con pocos parámetros<br>
            • Constructor simple es suficiente<br>
            • No hay parámetros opcionales<br>
            • Añade complejidad innecesaria
        </div>
    `,
    'patron-prototype': `
        <h1>Patrón Prototype</h1>
        
        <p>El <strong>patrón Prototype</strong> es un patrón de diseño creacional que permite copiar objetos existentes sin hacer que el código dependa de sus clases. En lugar de crear objetos desde cero, clonas un prototipo existente.</p>

        <div class="info-box">
            <strong>💡 ¿Qué es Prototype?</strong><br>
            • <strong>Propósito</strong>: Crear nuevos objetos clonando prototipos existentes<br>
            • <strong>Problema</strong>: Evitar la creación costosa de objetos desde cero<br>
            • <strong>Solución</strong>: Implementar un método clone() que copia el objeto<br>
            • <strong>Ventaja</strong>: Rápido y no depende de clases concretas<br>
            • <strong>Uso común</strong>: Objetos complejos o costosos de crear
        </div>

        <h3>¿Por Qué Usar Prototype?</h3>
        <p>Imagina que tienes un objeto complejo que tarda mucho en inicializarse (carga datos de BD, archivos, APIs). En lugar de recrearlo cada vez:</p>
        <ul>
            <li>Creas una instancia inicial (prototipo)</li>
            <li>Clonas ese prototipo cuando necesitas copias</li>
            <li>Modificas solo lo necesario en cada clon</li>
            <li>Ahorras tiempo y recursos</li>
        </ul>

        <h3>Clonación Superficial vs Profunda</h3>
        <div class="code-block"><pre><code>&lt;?php
// Diferencia entre clonación superficial y profunda

class Direccion {
    public function __construct(
        public string $calle,
        public string $ciudad
    ) {}
}

class Persona {
    public function __construct(
        public string $nombre,
        public int $edad,
        public Direccion $direccion
    ) {}
}

// Clonación superficial (shallow copy)
$persona1 = new Persona('Juan', 30, new Direccion('Calle 1', 'Madrid'));
$persona2 = clone $persona1; // PHP usa __clone() por defecto

$persona2->nombre = 'Ana';
$persona2->direccion->ciudad = 'Barcelona';

echo "Persona 1: {$persona1->nombre}, {$persona1->direccion->ciudad}\\n";
echo "Persona 2: {$persona2->nombre}, {$persona2->direccion->ciudad}\\n";

// ⚠️ Problema: Ambas personas comparten el mismo objeto Direccion
// Persona 1: Juan, Barcelona (¡cambió!)
// Persona 2: Ana, Barcelona
?&gt;</code></pre></div>

        <h3>Implementación Correcta con Clonación Profunda</h3>
        <div class="code-block"><pre><code>&lt;?php
// ✅ Clonación profunda (deep copy)

class Direccion {
    public function __construct(
        public string $calle,
        public string $ciudad,
        public string $codigoPostal
    ) {}
    
    // Método para clonar
    public function __clone() {
        // Direccion no tiene objetos anidados, no necesita hacer nada
    }
}

class Persona {
    public function __construct(
        public string $nombre,
        public int $edad,
        public Direccion $direccion,
        public array $hobbies = []
    ) {}
    
    // Método mágico __clone para clonación profunda
    public function __clone() {
        // Clonar objetos anidados
        $this->direccion = clone $this->direccion;
        
        // Copiar arrays (PHP copia arrays por valor, pero por seguridad)
        $this->hobbies = [...$this->hobbies];
    }
    
    public function describir(): string {
        return "{$this->nombre}, {$this->edad} años, " .
               "{$this->direccion->ciudad}, " .
               "hobbies: " . implode(', ', $this->hobbies);
    }
}

// Uso
$persona1 = new Persona(
    'Juan',
    30,
    new Direccion('Calle 1', 'Madrid', '28001'),
    ['fútbol', 'lectura']
);

// Clonar persona
$persona2 = clone $persona1;

// Modificar el clon
$persona2->nombre = 'Ana';
$persona2->edad = 25;
$persona2->direccion->ciudad = 'Barcelona';
$persona2->hobbies[] = 'música';

// ✅ Ahora son independientes
echo "Persona 1: " . $persona1->describir() . "\\n";
echo "Persona 2: " . $persona2->describir() . "\\n";

// Persona 1: Juan, 30 años, Madrid, hobbies: fútbol, lectura
// Persona 2: Ana, 25 años, Barcelona, hobbies: fútbol, lectura, música
?&gt;</code></pre></div>

        <h3>Patrón Prototype con Interfaz</h3>
        <div class="code-block"><pre><code>&lt;?php
// Interfaz Prototype

interface Prototype {
    public function clone(): self;
}

// Implementación base
abstract class Forma implements Prototype {
    public function __construct(
        public int $x,
        public int $y,
        public string $color
    ) {}
    
    abstract public function dibujar(): void;
    
    public function clone(): self {
        return clone $this;
    }
}

class Circulo extends Forma {
    public function __construct(
        int $x,
        int $y,
        string $color,
        public int $radio
    ) {
        parent::__construct($x, $y, $color);
    }
    
    public function dibujar(): void {
        echo "⭕ Círculo en ({$this->x}, {$this->y}), " .
             "color: {$this->color}, radio: {$this->radio}\\n";
    }
}

class Rectangulo extends Forma {
    public function __construct(
        int $x,
        int $y,
        string $color,
        public int $ancho,
        public int $alto
    ) {
        parent::__construct($x, $y, $color);
    }
    
    public function dibujar(): void {
        echo "▭ Rectángulo en ({$this->x}, {$this->y}), " .
             "color: {$this->color}, {$this->ancho}x{$this->alto}\\n";
    }
}

// Uso: Clonar formas
$circuloRojo = new Circulo(10, 20, 'rojo', 5);
$circuloAzul = $circuloRojo->clone();
$circuloAzul->color = 'azul';
$circuloAzul->x = 50;

$circuloRojo->dibujar();
$circuloAzul->dibujar();

$rectanguloVerde = new Rectangulo(0, 0, 'verde', 100, 50);
$rectanguloAmarillo = $rectanguloVerde->clone();
$rectanguloAmarillo->color = 'amarillo';
$rectanguloAmarillo->y = 100;

$rectanguloVerde->dibujar();
$rectanguloAmarillo->dibujar();
?&gt;</code></pre></div>

        <h3>Ejemplo Real: Registro de Prototipos</h3>
        <div class="code-block"><pre><code>&lt;?php
// Registry de prototipos para gestionar y clonar objetos

interface DocumentoPrototype {
    public function clone(): self;
    public function getTipo(): string;
}

class DocumentoPDF implements DocumentoPrototype {
    public function __construct(
        private string $plantilla,
        private array $estilos,
        private array $configuracion
    ) {}
    
    public function clone(): self {
        return new self(
            $this->plantilla,
            [...$this->estilos],
            [...$this->configuracion]
        );
    }
    
    public function getTipo(): string {
        return 'PDF';
    }
    
    public function setContenido(string $contenido): void {
        echo "Configurando contenido en PDF: {$contenido}\\n";
    }
    
    public function generar(): void {
        echo "📄 Generando PDF con plantilla: {$this->plantilla}\\n";
    }
}

class DocumentoWord implements DocumentoPrototype {
    public function __construct(
        private string $plantilla,
        private array $estilos
    ) {}
    
    public function clone(): self {
        return new self($this->plantilla, [...$this->estilos]);
    }
    
    public function getTipo(): string {
        return 'Word';
    }
    
    public function setContenido(string $contenido): void {
        echo "Configurando contenido en Word: {$contenido}\\n";
    }
    
    public function generar(): void {
        echo "📝 Generando Word con plantilla: {$this->plantilla}\\n";
    }
}

// Registry: Almacena y gestiona prototipos
class DocumentoRegistry {
    private array $prototipos = [];
    
    public function registrar(string $nombre, DocumentoPrototype $prototipo): void {
        $this->prototipos[$nombre] = $prototipo;
    }
    
    public function obtener(string $nombre): ?DocumentoPrototype {
        if (!isset($this->prototipos[$nombre])) {
            return null;
        }
        
        // Retornar un clon del prototipo
        return $this->prototipos[$nombre]->clone();
    }
    
    public function listar(): array {
        return array_keys($this->prototipos);
    }
}

// Uso del Registry
$registry = new DocumentoRegistry();

// Registrar prototipos predefinidos
$registry->registrar('factura-pdf', new DocumentoPDF(
    'plantilla-factura.pdf',
    ['fuente' => 'Arial', 'tamano' => 12],
    ['orientacion' => 'vertical', 'margenes' => 20]
));

$registry->registrar('reporte-word', new DocumentoWord(
    'plantilla-reporte.docx',
    ['fuente' => 'Times New Roman', 'tamano' => 11]
));

// Crear documentos clonando prototipos
echo "=== Creando documentos desde prototipos ===\\n";

$factura1 = $registry->obtener('factura-pdf');
$factura1->setContenido('Factura #001');
$factura1->generar();

$factura2 = $registry->obtener('factura-pdf');
$factura2->setContenido('Factura #002');
$factura2->generar();

$reporte1 = $registry->obtener('reporte-word');
$reporte1->setContenido('Reporte Mensual');
$reporte1->generar();

echo "\\nPrototipos disponibles: " . implode(', ', $registry->listar()) . "\\n";
?&gt;</code></pre></div>

        <h3>Ejemplo Real: Configuración de Productos</h3>
        <div class="code-block"><pre><code>&lt;?php
// Clonar configuraciones complejas de productos

class Caracteristicas {
    public function __construct(
        public array $especificaciones,
        public array $dimensiones
    ) {}
    
    public function __clone() {
        // Clonar arrays anidados
        $this->especificaciones = [...$this->especificaciones];
        $this->dimensiones = [...$this->dimensiones];
    }
}

class Producto {
    public function __construct(
        public string $nombre,
        public float $precio,
        public Caracteristicas $caracteristicas,
        public array $imagenes = []
    ) {}
    
    public function __clone() {
        // Clonación profunda de objetos anidados
        $this->caracteristicas = clone $this->caracteristicas;
        $this->imagenes = [...$this->imagenes];
    }
    
    public function describir(): void {
        echo "Producto: {$this->nombre}\\n";
        echo "Precio: \${$this->precio}\\n";
        echo "Especificaciones: " . 
             json_encode($this->caracteristicas->especificaciones) . "\\n";
        echo "Imágenes: " . implode(', ', $this->imagenes) . "\\n";
        echo "---\\n";
    }
}

// Crear producto base (prototipo)
$laptopBase = new Producto(
    'Laptop Estándar',
    800,
    new Caracteristicas(
        ['RAM' => '8GB', 'Almacenamiento' => '256GB SSD', 'Procesador' => 'i5'],
        ['ancho' => 35, 'alto' => 25, 'grosor' => 2]
    ),
    ['laptop-front.jpg', 'laptop-side.jpg']
);

echo "=== Prototipo Base ===\\n";
$laptopBase->describir();

// Clonar y personalizar para diferentes modelos
echo "=== Modelo Pro (clonado y mejorado) ===\\n";
$laptopPro = clone $laptopBase;
$laptopPro->nombre = 'Laptop Pro';
$laptopPro->precio = 1200;
$laptopPro->caracteristicas->especificaciones['RAM'] = '16GB';
$laptopPro->caracteristicas->especificaciones['Almacenamiento'] = '512GB SSD';
$laptopPro->imagenes[] = 'laptop-pro-detail.jpg';
$laptopPro->describir();

echo "=== Modelo Básico (clonado y simplificado) ===\\n";
$laptopBasica = clone $laptopBase;
$laptopBasica->nombre = 'Laptop Básica';
$laptopBasica->precio = 600;
$laptopBasica->caracteristicas->especificaciones['RAM'] = '4GB';
$laptopBasica->caracteristicas->especificaciones['Almacenamiento'] = '128GB SSD';
$laptopBasica->describir();

// Verificar que el prototipo original no cambió
echo "=== Prototipo Original (sin cambios) ===\\n";
$laptopBase->describir();
?&gt;</code></pre></div>

        <h3>Ejemplo Real: Sistema de Plantillas</h3>
        <div class="code-block"><pre><code>&lt;?php
// Sistema de plantillas de emails con Prototype

class EmailTemplate {
    public function __construct(
        private string $asunto,
        private string $cuerpo,
        private array $variables,
        private array $estilos
    ) {}
    
    public function __clone() {
        $this->variables = [...$this->variables];
        $this->estilos = [...$this->estilos];
    }
    
    public function setVariable(string $nombre, string $valor): void {
        $this->variables[$nombre] = $valor;
    }
    
    public function render(): string {
        $contenido = $this->cuerpo;
        
        foreach ($this->variables as $nombre => $valor) {
            $contenido = str_replace("{{$nombre}}", $valor, $contenido);
        }
        
        return $contenido;
    }
    
    public function enviar(string $destinatario): void {
        echo "📧 Enviando email a: {$destinatario}\\n";
        echo "Asunto: {$this->asunto}\\n";
        echo "Contenido:\\n{$this->render()}\\n";
        echo "---\\n";
    }
}

// Crear plantillas base (prototipos)
$plantillaBienvenida = new EmailTemplate(
    'Bienvenido a {empresa}',
    'Hola {nombre},\\n\\nGracias por registrarte en {empresa}.\\n\\nSaludos,\\nEl equipo',
    ['nombre' => '', 'empresa' => 'MiApp'],
    ['color' => '#007bff', 'fuente' => 'Arial']
);

$plantillaRecuperacion = new EmailTemplate(
    'Recupera tu contraseña',
    'Hola {nombre},\\n\\nTu código de recuperación es: {codigo}\\n\\nSaludos,\\nEl equipo',
    ['nombre' => '', 'codigo' => ''],
    ['color' => '#dc3545', 'fuente' => 'Arial']
);

// Usar prototipos para enviar emails personalizados
echo "=== Emails de bienvenida ===\\n";

$email1 = clone $plantillaBienvenida;
$email1->setVariable('nombre', 'Juan');
$email1->enviar('juan@example.com');

$email2 = clone $plantillaBienvenida;
$email2->setVariable('nombre', 'Ana');
$email2->enviar('ana@example.com');

echo "\\n=== Emails de recuperación ===\\n";

$email3 = clone $plantillaRecuperacion;
$email3->setVariable('nombre', 'Pedro');
$email3->setVariable('codigo', 'ABC123');
$email3->enviar('pedro@example.com');

$email4 = clone $plantillaRecuperacion;
$email4->setVariable('nombre', 'María');
$email4->setVariable('codigo', 'XYZ789');
$email4->enviar('maria@example.com');
?&gt;</code></pre></div>

        <h3>Prototype vs Factory</h3>
        <div class="code-block"><pre><code>&lt;?php
// Comparación: Cuándo usar Prototype vs Factory

// Factory: Cuando creas objetos desde cero
class UsuarioFactory {
    public static function crear(string $tipo): Usuario {
        return match($tipo) {
            'admin' => new Usuario('Admin', ['*']),
            'editor' => new Usuario('Editor', ['edit', 'view']),
            'viewer' => new Usuario('Viewer', ['view']),
        };
    }
}

// Prototype: Cuando clonas objetos existentes
class ConfiguracionCompleja {
    public function __construct(
        private array $database,
        private array $cache,
        private array $mail,
        private array $api
    ) {
        // Inicialización costosa
        echo "⏱️ Inicializando configuración compleja...\\n";
    }
    
    public function __clone() {
        $this->database = [...$this->database];
        $this->cache = [...$this->cache];
        $this->mail = [...$this->mail];
        $this->api = [...$this->api];
    }
}

// Crear una vez (costoso)
$configProduccion = new ConfiguracionCompleja(
    ['host' => 'prod.db', 'port' => 3306],
    ['driver' => 'redis', 'ttl' => 3600],
    ['smtp' => 'smtp.prod.com', 'port' => 587],
    ['url' => 'https://api.prod.com', 'timeout' => 30]
);

// Clonar para diferentes entornos (rápido)
$configDesarrollo = clone $configProduccion;
// Modificar solo lo necesario...

$configTesting = clone $configProduccion;
// Modificar solo lo necesario...

echo "✅ Configuraciones creadas mediante clonación\\n";
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Ventajas del Prototype:</strong><br>
            • <strong>Rendimiento</strong>: Más rápido que crear desde cero<br>
            • <strong>Flexibilidad</strong>: Clonar objetos sin conocer sus clases<br>
            • <strong>Menos código</strong>: No necesitas múltiples constructores<br>
            • <strong>Configuración</strong>: Fácil crear variantes de objetos complejos<br>
            • <strong>Runtime</strong>: Puedes agregar/quitar prototipos en tiempo de ejecución<br>
            • <strong>Independencia</strong>: No depende de jerarquías de clases
        </div>

        <div class="warning-box">
            <strong>⚠️ Desventajas del Prototype:</strong><br>
            • <strong>Clonación profunda</strong>: Complejo con objetos anidados<br>
            • <strong>Referencias circulares</strong>: Difícil de clonar correctamente<br>
            • <strong>__clone()</strong>: Debes implementar correctamente el método<br>
            • <strong>Confusión</strong>: No siempre es claro qué se está clonando
        </div>

        <div class="info-box">
            <strong>💡 Cuándo Usar Prototype:</strong><br>
            • <strong>Objetos costosos</strong>: Creación requiere mucho tiempo/recursos<br>
            • <strong>Configuraciones</strong>: Objetos con muchas configuraciones similares<br>
            • <strong>Variantes</strong>: Necesitas crear variantes de objetos existentes<br>
            • <strong>Runtime</strong>: Tipos de objetos determinados en tiempo de ejecución<br>
            • <strong>Plantillas</strong>: Sistema de plantillas o prototipos predefinidos<br>
            • <strong>Evitar subclases</strong>: No quieres crear muchas subclases<br>
            <br>
            <strong>⚠️ Cuándo NO Usar:</strong><br>
            • Objetos simples sin estado complejo<br>
            • Creación desde cero es suficientemente rápida<br>
            • Objetos con muchas referencias circulares<br>
            • La clonación profunda es muy compleja
        </div>
    `,
    'inyeccion-dependencias': `
        <h1>Inyección de Dependencias (DI) y Contenedores DI</h1>
        
        <p>La <strong>Inyección de Dependencias (DI)</strong> es un patrón de diseño que implementa el principio de Inversión de Dependencias (DIP). En lugar de que una clase cree sus propias dependencias, estas se "inyectan" desde el exterior, haciendo el código más flexible, testeable y desacoplado.</p>

        <div class="info-box">
            <strong>💡 ¿Qué es Inyección de Dependencias?</strong><br>
            • <strong>Propósito</strong>: Proveer dependencias desde el exterior en lugar de crearlas internamente<br>
            • <strong>Problema</strong>: Acoplamiento fuerte entre clases<br>
            • <strong>Solución</strong>: Pasar dependencias por constructor, setter o interfaz<br>
            • <strong>Ventaja</strong>: Código testeable, flexible y desacoplado<br>
            • <strong>Uso común</strong>: Frameworks modernos (Symfony, Laravel, Spring)
        </div>

        <h3>Problema Sin Inyección de Dependencias</h3>
        <div class="code-block"><pre><code>&lt;?php
// ❌ SIN DI: Acoplamiento fuerte

class MySQLDatabase {
    public function query(string $sql): array {
        echo "Ejecutando query en MySQL: {$sql}\\n";
        return [];
    }
}

class UsuarioRepository {
    private MySQLDatabase $db;
    
    public function __construct() {
        // ❌ Crea su propia dependencia
        $this->db = new MySQLDatabase();
    }
    
    public function obtenerUsuario(int $id): array {
        return $this->db->query("SELECT * FROM usuarios WHERE id = {$id}");
    }
}

// Problemas:
// 1. Acoplado a MySQLDatabase (no puedes cambiar a PostgreSQL)
// 2. Imposible testear sin base de datos real
// 3. No puedes reutilizar la conexión
// 4. Viola el principio de Inversión de Dependencias

$repo = new UsuarioRepository();
$repo->obtenerUsuario(1);
?&gt;</code></pre></div>

        <h3>Solución Con Inyección de Dependencias</h3>
        <div class="code-block"><pre><code>&lt;?php
// ✅ CON DI: Desacoplamiento

// 1. Definir interfaz (abstracción)
interface Database {
    public function query(string $sql): array;
}

// 2. Implementaciones concretas
class MySQLDatabase implements Database {
    public function query(string $sql): array {
        echo "📊 MySQL: {$sql}\\n";
        return [];
    }
}

class PostgreSQLDatabase implements Database {
    public function query(string $sql): array {
        echo "🐘 PostgreSQL: {$sql}\\n";
        return [];
    }
}

// 3. Clase que recibe dependencias
class UsuarioRepository {
    // ✅ Depende de la abstracción, no de implementación concreta
    public function __construct(private Database $db) {}
    
    public function obtenerUsuario(int $id): array {
        return $this->db->query("SELECT * FROM usuarios WHERE id = {$id}");
    }
}

// Uso: Inyectar dependencia
$mysqlDb = new MySQLDatabase();
$repoMySQL = new UsuarioRepository($mysqlDb);
$repoMySQL->obtenerUsuario(1);

// Fácil cambiar de base de datos
$postgresDb = new PostgreSQLDatabase();
$repoPostgres = new UsuarioRepository($postgresDb);
$repoPostgres->obtenerUsuario(1);

// Ventajas:
// 1. Desacoplado de implementaciones concretas
// 2. Fácil de testear (inyectar mock)
// 3. Flexible (cambiar implementación sin modificar código)
// 4. Reutilizar conexiones
?&gt;</code></pre></div>

        <h3>Tipos de Inyección de Dependencias</h3>
        <div class="code-block"><pre><code>&lt;?php
// 1. Inyección por Constructor (más común y recomendada)
class ServicioEmail {
    public function __construct(
        private MailerInterface $mailer,
        private LoggerInterface $logger
    ) {}
    
    public function enviar(string $destinatario, string $mensaje): void {
        $this->logger->info("Enviando email a {$destinatario}");
        $this->mailer->send($destinatario, $mensaje);
    }
}

// 2. Inyección por Setter
class ServicioNotificacion {
    private ?LoggerInterface $logger = null;
    
    public function setLogger(LoggerInterface $logger): void {
        $this->logger = $logger;
    }
    
    public function notificar(string $mensaje): void {
        $this->logger?->info($mensaje);
        echo "Notificación: {$mensaje}\\n";
    }
}

// 3. Inyección por Interfaz
interface LoggerAwareInterface {
    public function setLogger(LoggerInterface $logger): void;
}

class ServicioConLogger implements LoggerAwareInterface {
    private ?LoggerInterface $logger = null;
    
    public function setLogger(LoggerInterface $logger): void {
        $this->logger = $logger;
    }
    
    public function procesar(): void {
        $this->logger?->info("Procesando...");
    }
}

// 4. Inyección por Método
class ServicioProcesamiento {
    public function procesar(LoggerInterface $logger, array $datos): void {
        $logger->info("Procesando datos");
        // Procesar datos...
    }
}
?&gt;</code></pre></div>

        <h3>Contenedor de Dependencias Simple</h3>
        <div class="code-block"><pre><code>&lt;?php
// Contenedor DI básico

class Container {
    private array $services = [];
    private array $instances = [];
    
    // Registrar un servicio
    public function set(string $id, callable $factory): void {
        $this->services[$id] = $factory;
    }
    
    // Obtener un servicio (singleton)
    public function get(string $id): mixed {
        // Si ya existe la instancia, retornarla
        if (isset($this->instances[$id])) {
            return $this->instances[$id];
        }
        
        // Si no existe el servicio, error
        if (!isset($this->services[$id])) {
            throw new Exception("Servicio no encontrado: {$id}");
        }
        
        // Crear instancia usando la factory
        $factory = $this->services[$id];
        $instance = $factory($this);
        
        // Guardar instancia (singleton)
        $this->instances[$id] = $instance;
        
        return $instance;
    }
    
    // Verificar si existe un servicio
    public function has(string $id): bool {
        return isset($this->services[$id]);
    }
}

// Uso del contenedor
$container = new Container();

// Registrar servicios
$container->set('database', function($c) {
    return new MySQLDatabase();
});

$container->set('logger', function($c) {
    return new FileLogger('app.log');
});

$container->set('usuario.repository', function($c) {
    return new UsuarioRepository(
        $c->get('database')
    );
});

$container->set('usuario.service', function($c) {
    return new UsuarioService(
        $c->get('usuario.repository'),
        $c->get('logger')
    );
});

// Obtener servicios del contenedor
$usuarioService = $container->get('usuario.service');
$usuarioService->crearUsuario('Juan', 'juan@example.com');
?&gt;</code></pre></div>

        <h3>Contenedor DI Avanzado con Autowiring</h3>
        <div class="code-block"><pre><code>&lt;?php
// Contenedor con resolución automática de dependencias

class AdvancedContainer {
    private array $bindings = [];
    private array $instances = [];
    
    // Vincular interfaz a implementación
    public function bind(string $abstract, string|callable $concrete): void {
        $this->bindings[$abstract] = $concrete;
    }
    
    // Registrar singleton
    public function singleton(string $abstract, string|callable $concrete): void {
        $this->bind($abstract, $concrete);
    }
    
    // Resolver dependencias automáticamente
    public function make(string $abstract): mixed {
        // Si es singleton y ya existe, retornar
        if (isset($this->instances[$abstract])) {
            return $this->instances[$abstract];
        }
        
        // Obtener la implementación concreta
        $concrete = $this->bindings[$abstract] ?? $abstract;
        
        // Si es un callable, ejecutarlo
        if (is_callable($concrete)) {
            $instance = $concrete($this);
        } else {
            // Resolver usando reflexión
            $instance = $this->resolve($concrete);
        }
        
        // Guardar singleton si está registrado
        if (isset($this->bindings[$abstract])) {
            $this->instances[$abstract] = $instance;
        }
        
        return $instance;
    }
    
    // Resolver clase usando reflexión
    private function resolve(string $class): object {
        $reflector = new ReflectionClass($class);
        
        // Verificar si la clase es instanciable
        if (!$reflector->isInstantiable()) {
            throw new Exception("La clase {$class} no es instanciable");
        }
        
        // Obtener constructor
        $constructor = $reflector->getConstructor();
        
        // Si no tiene constructor, crear instancia simple
        if ($constructor === null) {
            return new $class;
        }
        
        // Obtener parámetros del constructor
        $parameters = $constructor->getParameters();
        
        // Resolver cada dependencia
        $dependencies = [];
        foreach ($parameters as $parameter) {
            $type = $parameter->getType();
            
            if ($type === null) {
                throw new Exception(
                    "No se puede resolver el parámetro {\$parameter->getName()} sin type hint"
                );
            }
            
            $typeName = $type->getName();
            
            // Resolver dependencia recursivamente
            $dependencies[] = $this->make($typeName);
        }
        
        // Crear instancia con dependencias resueltas
        return $reflector->newInstanceArgs($dependencies);
    }
}

// Ejemplo de uso con autowiring
interface LoggerInterface {
    public function log(string $message): void;
}

class FileLogger implements LoggerInterface {
    public function __construct(private string $filename = 'app.log') {}
    
    public function log(string $message): void {
        echo "📝 Log en {$this->filename}: {$message}\\n";
    }
}

interface CacheInterface {
    public function get(string $key): mixed;
    public function set(string $key, mixed $value): void;
}

class RedisCache implements CacheInterface {
    public function get(string $key): mixed {
        echo "🔍 Obteniendo de cache: {$key}\\n";
        return null;
    }
    
    public function set(string $key, mixed $value): void {
        echo "💾 Guardando en cache: {$key}\\n";
    }
}

class UsuarioService {
    public function __construct(
        private UsuarioRepository $repository,
        private LoggerInterface $logger,
        private CacheInterface $cache
    ) {}
    
    public function obtenerUsuario(int $id): void {
        $this->logger->log("Obteniendo usuario {$id}");
        
        // Intentar obtener de cache
        $usuario = $this->cache->get("usuario_{$id}");
        
        if ($usuario === null) {
            $usuario = $this->repository->obtenerUsuario($id);
            $this->cache->set("usuario_{$id}", $usuario);
        }
    }
}

// Configurar contenedor
$container = new AdvancedContainer();

// Vincular interfaces a implementaciones
$container->bind(Database::class, MySQLDatabase::class);
$container->bind(LoggerInterface::class, FileLogger::class);
$container->bind(CacheInterface::class, RedisCache::class);

// ✨ Autowiring: El contenedor resuelve todas las dependencias automáticamente
$usuarioService = $container->make(UsuarioService::class);
$usuarioService->obtenerUsuario(1);
?&gt;</code></pre></div>

        <h3>Ejemplo Real: Sistema de Facturación</h3>
        <div class="code-block"><pre><code>&lt;?php
// Sistema completo con DI

// Interfaces
interface RepositorioFacturas {
    public function guardar(Factura $factura): void;
    public function obtener(int $id): ?Factura;
}

interface ServicioEmail {
    public function enviar(string $destinatario, string $asunto, string $cuerpo): void;
}

interface GeneradorPDF {
    public function generar(Factura $factura): string;
}

// Implementaciones
class FacturaRepositoryMySQL implements RepositorioFacturas {
    public function __construct(private Database $db) {}
    
    public function guardar(Factura $factura): void {
        echo "💾 Guardando factura en MySQL\\n";
    }
    
    public function obtener(int $id): ?Factura {
        echo "🔍 Obteniendo factura {$id} de MySQL\\n";
        return new Factura($id, 'Cliente', 100.00);
    }
}

class SMTPEmailService implements ServicioEmail {
    public function __construct(
        private string $host,
        private int $port,
        private LoggerInterface $logger
    ) {}
    
    public function enviar(string $destinatario, string $asunto, string $cuerpo): void {
        $this->logger->log("Enviando email a {$destinatario}");
        echo "📧 Email enviado vía SMTP ({$this->host}:{$this->port})\\n";
    }
}

class DomPDFGenerator implements GeneradorPDF {
    public function generar(Factura $factura): string {
        echo "📄 Generando PDF para factura #{$factura->id}\\n";
        return "factura_{$factura->id}.pdf";
    }
}

// Modelo
class Factura {
    public function __construct(
        public int $id,
        public string $cliente,
        public float $total
    ) {}
}

// Servicio principal
class ServicioFacturacion {
    public function __construct(
        private RepositorioFacturas $repository,
        private ServicioEmail $emailService,
        private GeneradorPDF $pdfGenerator,
        private LoggerInterface $logger
    ) {}
    
    public function crearYEnviarFactura(string $cliente, float $total): void {
        $this->logger->log("Creando factura para {$cliente}");
        
        // Crear factura
        $factura = new Factura(rand(1000, 9999), $cliente, $total);
        
        // Guardar en BD
        $this->repository->guardar($factura);
        
        // Generar PDF
        $pdf = $this->pdfGenerator->generar($factura);
        
        // Enviar por email
        $this->emailService->enviar(
            "{$cliente}@example.com",
            "Factura #{$factura->id}",
            "Adjunto encontrarás tu factura"
        );
        
        $this->logger->log("Factura procesada exitosamente");
    }
}

// Configurar contenedor
$container = new AdvancedContainer();

$container->bind(Database::class, MySQLDatabase::class);
$container->bind(LoggerInterface::class, FileLogger::class);
$container->bind(RepositorioFacturas::class, FacturaRepositoryMySQL::class);
$container->bind(GeneradorPDF::class, DomPDFGenerator::class);

$container->bind(ServicioEmail::class, function($c) {
    return new SMTPEmailService(
        'smtp.example.com',
        587,
        $c->make(LoggerInterface::class)
    );
});

// Usar el servicio
$servicioFacturacion = $container->make(ServicioFacturacion::class);
$servicioFacturacion->crearYEnviarFactura('Juan Pérez', 250.00);
?&gt;</code></pre></div>

        <h3>Ejemplo Real: Contenedor con Configuración</h3>
        <div class="code-block"><pre><code>&lt;?php
// Service Provider Pattern

abstract class ServiceProvider {
    public function __construct(protected Container $container) {}
    
    abstract public function register(): void;
}

class DatabaseServiceProvider extends ServiceProvider {
    public function register(): void {
        $this->container->singleton('db.connection', function($c) {
            $config = $c->get('config');
            
            return match($config['database']['driver']) {
                'mysql' => new MySQLDatabase(
                    $config['database']['host'],
                    $config['database']['port']
                ),
                'pgsql' => new PostgreSQLDatabase(
                    $config['database']['host'],
                    $config['database']['port']
                ),
                default => throw new Exception('Driver no soportado')
            };
        });
    }
}

class LoggerServiceProvider extends ServiceProvider {
    public function register(): void {
        $this->container->singleton('logger', function($c) {
            $config = $c->get('config');
            
            return new FileLogger($config['logging']['file']);
        });
    }
}

class RepositoryServiceProvider extends ServiceProvider {
    public function register(): void {
        $this->container->bind('usuario.repository', function($c) {
            return new UsuarioRepository(
                $c->get('db.connection')
            );
        });
        
        $this->container->bind('producto.repository', function($c) {
            return new ProductoRepository(
                $c->get('db.connection')
            );
        });
    }
}

// Configuración de la aplicación
$config = [
    'database' => [
        'driver' => 'mysql',
        'host' => 'localhost',
        'port' => 3306,
    ],
    'logging' => [
        'file' => 'app.log',
    ],
];

// Crear contenedor
$container = new Container();
$container->set('config', fn() => $config);

// Registrar providers
$providers = [
    new DatabaseServiceProvider($container),
    new LoggerServiceProvider($container),
    new RepositoryServiceProvider($container),
];

foreach ($providers as $provider) {
    $provider->register();
}

// Usar servicios
$usuarioRepo = $container->get('usuario.repository');
$logger = $container->get('logger');
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Ventajas de la Inyección de Dependencias:</strong><br>
            • <strong>Testeable</strong>: Fácil inyectar mocks y stubs en tests<br>
            • <strong>Desacoplamiento</strong>: Clases no dependen de implementaciones concretas<br>
            • <strong>Flexibilidad</strong>: Cambiar implementaciones sin modificar código<br>
            • <strong>Reutilización</strong>: Compartir instancias entre múltiples clases<br>
            • <strong>Mantenibilidad</strong>: Código más limpio y fácil de mantener<br>
            • <strong>SOLID</strong>: Respeta principios de diseño (DIP, SRP, OCP)
        </div>

        <div class="warning-box">
            <strong>⚠️ Desventajas:</strong><br>
            • <strong>Complejidad inicial</strong>: Más código de configuración<br>
            • <strong>Curva de aprendizaje</strong>: Concepto difícil para principiantes<br>
            • <strong>Over-engineering</strong>: Puede ser excesivo para proyectos simples<br>
            • <strong>Debugging</strong>: Más difícil seguir el flujo de dependencias
        </div>

        <div class="info-box">
            <strong>💡 Cuándo Usar DI:</strong><br>
            • <strong>Aplicaciones grandes</strong>: Proyectos con muchas dependencias<br>
            • <strong>Testing</strong>: Necesitas tests unitarios extensivos<br>
            • <strong>Múltiples implementaciones</strong>: Diferentes entornos (dev, prod, test)<br>
            • <strong>Frameworks</strong>: Trabajas con frameworks modernos<br>
            • <strong>Equipos grandes</strong>: Múltiples desarrolladores<br>
            • <strong>Mantenibilidad</strong>: Código que cambiará frecuentemente<br>
            <br>
            <strong>⚠️ Cuándo NO Usar:</strong><br>
            • Scripts simples o pequeños<br>
            • Prototipos rápidos<br>
            • Aplicaciones con pocas dependencias<br>
            • Cuando añade complejidad innecesaria
        </div>
    `,
    'service-locator': `
        <h1>Service Locator</h1>
        
        <p>El <strong>patrón Service Locator</strong> es un patrón de diseño que proporciona un registro centralizado donde las clases pueden obtener sus dependencias. Actúa como un "directorio" de servicios que las clases consultan cuando necesitan una dependencia.</p>

        <div class="info-box">
            <strong>💡 ¿Qué es Service Locator?</strong><br>
            • <strong>Propósito</strong>: Registro centralizado para localizar y obtener servicios<br>
            • <strong>Problema</strong>: Evitar crear dependencias manualmente en cada clase<br>
            • <strong>Solución</strong>: Localizador global que provee servicios bajo demanda<br>
            • <strong>Ventaja</strong>: Desacoplamiento entre clases y sus dependencias<br>
            • <strong>Controversia</strong>: Considerado anti-patrón por muchos desarrolladores
        </div>

        <h3>Implementación Básica</h3>
        <div class="code-block"><pre><code>&lt;?php
// Service Locator básico

class ServiceLocator {
    private static ?self $instance = null;
    private array $services = [];
    
    // Singleton: Una sola instancia del locator
    private function __construct() {}
    
    public static function getInstance(): self {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    // Registrar un servicio
    public function register(string $name, object $service): void {
        $this->services[$name] = $service;
    }
    
    // Obtener un servicio
    public function get(string $name): object {
        if (!isset($this->services[$name])) {
            throw new Exception("Servicio no encontrado: {$name}");
        }
        return $this->services[$name];
    }
    
    // Verificar si existe un servicio
    public function has(string $name): bool {
        return isset($this->services[$name]);
    }
}

// Servicios
class Logger {
    public function log(string $message): void {
        echo "📝 Log: {$message}\\n";
    }
}

class Database {
    public function query(string $sql): array {
        echo "🗄️ Query: {$sql}\\n";
        return [];
    }
}

// Clase que usa el Service Locator
class UsuarioRepository {
    private Logger $logger;
    private Database $db;
    
    public function __construct() {
        // ⚠️ Obtiene dependencias del Service Locator
        $locator = ServiceLocator::getInstance();
        $this->logger = $locator->get('logger');
        $this->db = $locator->get('database');
    }
    
    public function obtenerUsuario(int $id): void {
        $this->logger->log("Obteniendo usuario {$id}");
        $this->db->query("SELECT * FROM usuarios WHERE id = {$id}");
    }
}

// Configuración inicial
$locator = ServiceLocator::getInstance();
$locator->register('logger', new Logger());
$locator->register('database', new Database());

// Uso
$repo = new UsuarioRepository();
$repo->obtenerUsuario(1);
?&gt;</code></pre></div>

        <h3>Service Locator con Factory</h3>
        <div class="code-block"><pre><code>&lt;?php
// Service Locator que crea servicios bajo demanda

class LazyServiceLocator {
    private static ?self $instance = null;
    private array $factories = [];
    private array $instances = [];
    
    private function __construct() {}
    
    public static function getInstance(): self {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    // Registrar una factory para crear el servicio
    public function registerFactory(string $name, callable $factory): void {
        $this->factories[$name] = $factory;
    }
    
    // Obtener servicio (lazy loading)
    public function get(string $name): object {
        // Si ya existe la instancia, retornarla
        if (isset($this->instances[$name])) {
            return $this->instances[$name];
        }
        
        // Si no existe la factory, error
        if (!isset($this->factories[$name])) {
            throw new Exception("Servicio no encontrado: {$name}");
        }
        
        // Crear instancia usando la factory
        $factory = $this->factories[$name];
        $instance = $factory();
        
        // Guardar instancia (singleton)
        $this->instances[$name] = $instance;
        
        return $instance;
    }
    
    // Resetear instancias (útil para testing)
    public function reset(): void {
        $this->instances = [];
    }
}

// Configuración
$locator = LazyServiceLocator::getInstance();

$locator->registerFactory('logger', function() {
    echo "🔨 Creando Logger\\n";
    return new Logger();
});

$locator->registerFactory('database', function() {
    echo "🔨 Creando Database\\n";
    return new Database();
});

$locator->registerFactory('cache', function() {
    echo "🔨 Creando Cache\\n";
    return new Cache();
});

// Los servicios se crean solo cuando se solicitan
echo "=== Obteniendo servicios ===\\n";
$logger = $locator->get('logger');  // Se crea aquí
$logger2 = $locator->get('logger'); // Retorna la misma instancia
?&gt;</code></pre></div>

        <h3>Service Locator con Interfaces</h3>
        <div class="code-block"><pre><code>&lt;?php
// Service Locator tipado con interfaces

interface LoggerInterface {
    public function log(string $message): void;
}

interface CacheInterface {
    public function get(string $key): mixed;
    public function set(string $key, mixed $value): void;
}

interface DatabaseInterface {
    public function query(string $sql): array;
}

class FileLogger implements LoggerInterface {
    public function __construct(private string $filename) {}
    
    public function log(string $message): void {
        echo "📝 [{$this->filename}] {$message}\\n";
    }
}

class RedisCache implements CacheInterface {
    public function get(string $key): mixed {
        echo "🔍 Cache GET: {$key}\\n";
        return null;
    }
    
    public function set(string $key, mixed $value): void {
        echo "💾 Cache SET: {$key}\\n";
    }
}

class MySQLDatabase implements DatabaseInterface {
    public function query(string $sql): array {
        echo "🗄️ MySQL: {$sql}\\n";
        return [];
    }
}

// Service Locator tipado
class TypedServiceLocator {
    private static ?self $instance = null;
    private array $services = [];
    
    private function __construct() {}
    
    public static function getInstance(): self {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function registerLogger(LoggerInterface $logger): void {
        $this->services[LoggerInterface::class] = $logger;
    }
    
    public function registerCache(CacheInterface $cache): void {
        $this->services[CacheInterface::class] = $cache;
    }
    
    public function registerDatabase(DatabaseInterface $db): void {
        $this->services[DatabaseInterface::class] = $db;
    }
    
    public function getLogger(): LoggerInterface {
        return $this->services[LoggerInterface::class] 
            ?? throw new Exception('Logger no registrado');
    }
    
    public function getCache(): CacheInterface {
        return $this->services[CacheInterface::class] 
            ?? throw new Exception('Cache no registrado');
    }
    
    public function getDatabase(): DatabaseInterface {
        return $this->services[DatabaseInterface::class] 
            ?? throw new Exception('Database no registrado');
    }
}

// Clase que usa el locator tipado
class ProductoService {
    private LoggerInterface $logger;
    private CacheInterface $cache;
    private DatabaseInterface $db;
    
    public function __construct() {
        $locator = TypedServiceLocator::getInstance();
        $this->logger = $locator->getLogger();
        $this->cache = $locator->getCache();
        $this->db = $locator->getDatabase();
    }
    
    public function obtenerProducto(int $id): void {
        $this->logger->log("Obteniendo producto {$id}");
        
        // Intentar cache
        $producto = $this->cache->get("producto_{$id}");
        
        if ($producto === null) {
            $producto = $this->db->query("SELECT * FROM productos WHERE id = {$id}");
            $this->cache->set("producto_{$id}", $producto);
        }
    }
}

// Configuración
$locator = TypedServiceLocator::getInstance();
$locator->registerLogger(new FileLogger('app.log'));
$locator->registerCache(new RedisCache());
$locator->registerDatabase(new MySQLDatabase());

// Uso
$service = new ProductoService();
$service->obtenerProducto(1);
?&gt;</code></pre></div>

        <h3>Ejemplo Real: Sistema de Notificaciones</h3>
        <div class="code-block"><pre><code>&lt;?php
// Sistema completo con Service Locator

interface NotificadorInterface {
    public function enviar(string $destinatario, string $mensaje): void;
}

class EmailNotificador implements NotificadorInterface {
    public function enviar(string $destinatario, string $mensaje): void {
        echo "📧 Email a {$destinatario}: {$mensaje}\\n";
    }
}

class SMSNotificador implements NotificadorInterface {
    public function enviar(string $destinatario, string $mensaje): void {
        echo "📱 SMS a {$destinatario}: {$mensaje}\\n";
    }
}

class PushNotificador implements NotificadorInterface {
    public function enviar(string $destinatario, string $mensaje): void {
        echo "🔔 Push a {$destinatario}: {$mensaje}\\n";
    }
}

// Service Locator para notificadores
class NotificadorLocator {
    private static ?self $instance = null;
    private array $notificadores = [];
    
    private function __construct() {}
    
    public static function getInstance(): self {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function register(string $tipo, NotificadorInterface $notificador): void {
        $this->notificadores[$tipo] = $notificador;
    }
    
    public function get(string $tipo): NotificadorInterface {
        if (!isset($this->notificadores[$tipo])) {
            throw new Exception("Notificador no encontrado: {$tipo}");
        }
        return $this->notificadores[$tipo];
    }
    
    public function getAll(): array {
        return $this->notificadores;
    }
}

// Servicio que usa múltiples notificadores
class ServicioNotificaciones {
    public function notificarUsuario(string $usuario, string $mensaje, array $canales): void {
        $locator = NotificadorLocator::getInstance();
        
        foreach ($canales as $canal) {
            try {
                $notificador = $locator->get($canal);
                $notificador->enviar($usuario, $mensaje);
            } catch (Exception $e) {
                echo "⚠️ Error: {$e->getMessage()}\\n";
            }
        }
    }
    
    public function notificarATodos(string $usuario, string $mensaje): void {
        $locator = NotificadorLocator::getInstance();
        
        foreach ($locator->getAll() as $tipo => $notificador) {
            echo "Enviando por {$tipo}...\\n";
            $notificador->enviar($usuario, $mensaje);
        }
    }
}

// Configuración
$locator = NotificadorLocator::getInstance();
$locator->register('email', new EmailNotificador());
$locator->register('sms', new SMSNotificador());
$locator->register('push', new PushNotificador());

// Uso
$servicio = new ServicioNotificaciones();

echo "=== Notificación por canales específicos ===\\n";
$servicio->notificarUsuario('juan@example.com', 'Hola Juan', ['email', 'push']);

echo "\\n=== Notificación por todos los canales ===\\n";
$servicio->notificarATodos('maria@example.com', 'Hola María');
?&gt;</code></pre></div>

        <h3>Service Locator vs Dependency Injection</h3>
        <div class="code-block"><pre><code>&lt;?php
// Comparación directa

// ❌ Service Locator (Pull)
class UsuarioServiceConLocator {
    private Logger $logger;
    private Database $db;
    
    public function __construct() {
        // La clase "tira" (pull) de sus dependencias
        $locator = ServiceLocator::getInstance();
        $this->logger = $locator->get('logger');
        $this->db = $locator->get('database');
    }
    
    public function crear(string $nombre): void {
        $this->logger->log("Creando usuario: {$nombre}");
        $this->db->query("INSERT INTO usuarios...");
    }
}

// ✅ Dependency Injection (Push)
class UsuarioServiceConDI {
    // Las dependencias se "empujan" (push) desde afuera
    public function __construct(
        private Logger $logger,
        private Database $db
    ) {}
    
    public function crear(string $nombre): void {
        $this->logger->log("Creando usuario: {$nombre}");
        $this->db->query("INSERT INTO usuarios...");
    }
}

// Uso de Service Locator
$locator = ServiceLocator::getInstance();
$locator->register('logger', new Logger());
$locator->register('database', new Database());

$serviceLocator = new UsuarioServiceConLocator();
$serviceLocator->crear('Juan');

// Uso de DI
$logger = new Logger();
$db = new Database();
$serviceDI = new UsuarioServiceConDI($logger, $db);
$serviceDI->crear('Ana');
?&gt;</code></pre></div>

        <h3>Ventajas y Desventajas Comparadas</h3>
        <div class="code-block"><pre><code>&lt;?php
// Ejemplo que muestra problemas del Service Locator

// ❌ Problema 1: Dependencias ocultas
class PedidoService {
    public function procesarPedido(int $id): void {
        // No es obvio qué dependencias necesita esta clase
        $locator = ServiceLocator::getInstance();
        $db = $locator->get('database');
        $email = $locator->get('email');
        $logger = $locator->get('logger');
        $cache = $locator->get('cache');
        $payment = $locator->get('payment');
        
        // ... procesar pedido
    }
}

// ✅ Con DI las dependencias son explícitas
class PedidoServiceDI {
    // Claramente visible qué necesita esta clase
    public function __construct(
        private Database $db,
        private EmailService $email,
        private Logger $logger,
        private Cache $cache,
        private PaymentGateway $payment
    ) {}
    
    public function procesarPedido(int $id): void {
        // ... procesar pedido
    }
}

// ❌ Problema 2: Difícil de testear
class ReporteService {
    public function generar(): string {
        $locator = ServiceLocator::getInstance();
        $db = $locator->get('database'); // Difícil mockear
        
        return "Reporte generado";
    }
}

// ✅ Con DI es fácil testear
class ReporteServiceDI {
    public function __construct(private Database $db) {}
    
    public function generar(): string {
        return "Reporte generado";
    }
}

// Test con DI (fácil)
$mockDb = new MockDatabase();
$service = new ReporteServiceDI($mockDb);
$resultado = $service->generar();

// Test con Service Locator (complicado)
// Necesitas resetear el locator global, puede afectar otros tests
?&gt;</code></pre></div>

        <h3>Cuándo Usar Service Locator</h3>
        <div class="code-block"><pre><code>&lt;?php
// Casos donde Service Locator puede ser útil

// 1. Framework Legacy o código existente
class LegacyController {
    public function action(): void {
        // En código legacy puede ser más práctico
        $locator = ServiceLocator::getInstance();
        $db = $locator->get('database');
        // ...
    }
}

// 2. Plugin System
interface Plugin {
    public function execute(): void;
}

class PluginManager {
    private static array $plugins = [];
    
    public static function register(string $name, Plugin $plugin): void {
        self::$plugins[$name] = $plugin;
    }
    
    public static function get(string $name): ?Plugin {
        return self::$plugins[$name] ?? null;
    }
    
    public static function executeAll(): void {
        foreach (self::$plugins as $plugin) {
            $plugin->execute();
        }
    }
}

// 3. Registry de configuración global
class Config {
    private static array $values = [];
    
    public static function set(string $key, mixed $value): void {
        self::$values[$key] = $value;
    }
    
    public static function get(string $key, mixed $default = null): mixed {
        return self::$values[$key] ?? $default;
    }
}

// Uso
Config::set('app.name', 'Mi Aplicación');
Config::set('app.debug', true);

$appName = Config::get('app.name');
$debug = Config::get('app.debug', false);
?&gt;</code></pre></div>

        <div class="warning-box">
            <strong>⚠️ Por Qué Service Locator es Considerado Anti-Patrón:</strong><br>
            • <strong>Dependencias ocultas</strong>: No es claro qué necesita una clase<br>
            • <strong>Acoplamiento global</strong>: Todas las clases dependen del locator<br>
            • <strong>Difícil de testear</strong>: Complicado mockear el locator global<br>
            • <strong>Violación de principios</strong>: No respeta el principio de inversión de dependencias<br>
            • <strong>Runtime errors</strong>: Errores en tiempo de ejecución si falta un servicio<br>
            • <strong>Dificulta refactoring</strong>: No sabes qué clases usan qué servicios
        </div>

        <div class="success-box">
            <strong>✅ Ventajas del Service Locator:</strong><br>
            • <strong>Simplicidad</strong>: Fácil de entender e implementar<br>
            • <strong>Flexibilidad</strong>: Agregar/quitar servicios en runtime<br>
            • <strong>Centralización</strong>: Un solo punto para gestionar servicios<br>
            • <strong>Legacy code</strong>: Útil para migrar código antiguo<br>
            • <strong>Menos boilerplate</strong>: No necesitas pasar dependencias por constructor
        </div>

        <div class="info-box">
            <strong>💡 Service Locator vs Dependency Injection:</strong><br>
            <br>
            <strong>Service Locator (Pull):</strong><br>
            • La clase "tira" de sus dependencias<br>
            • Dependencias ocultas<br>
            • Acoplamiento al locator<br>
            • Difícil de testear<br>
            • Útil en código legacy<br>
            <br>
            <strong>Dependency Injection (Push):</strong><br>
            • Las dependencias se "empujan" desde afuera<br>
            • Dependencias explícitas<br>
            • Sin acoplamiento global<br>
            • Fácil de testear<br>
            • Recomendado para código nuevo<br>
            <br>
            <strong>⚠️ Recomendación:</strong><br>
            Prefiere <strong>Dependency Injection</strong> sobre Service Locator en código nuevo. Usa Service Locator solo cuando:<br>
            • Trabajas con código legacy<br>
            • Necesitas un sistema de plugins<br>
            • Implementas un registry de configuración<br>
            • La complejidad de DI no se justifica
        </div>
    `,
    'patron-adapter': `
        <h1>Patrón Adapter (Adaptador)</h1>
        
        <p>El <strong>patrón Adapter</strong> es un patrón estructural que permite que interfaces incompatibles trabajen juntas. Actúa como un "traductor" entre dos interfaces diferentes, convirtiendo la interfaz de una clase en otra que el cliente espera.</p>

        <div class="info-box">
            <strong>💡 ¿Qué es el Patrón Adapter?</strong><br>
            • <strong>Propósito</strong>: Hacer compatibles interfaces incompatibles<br>
            • <strong>Problema</strong>: Necesitas usar una clase pero su interfaz no coincide con la que esperas<br>
            • <strong>Solución</strong>: Crear un adaptador que traduce una interfaz a otra<br>
            • <strong>Analogía</strong>: Como un adaptador de enchufe para viajar<br>
            • <strong>Tipo</strong>: Patrón estructural
        </div>

        <h3>Problema: Interfaces Incompatibles</h3>
        <div class="code-block"><pre><code>&lt;?php
// Problema: Tienes una interfaz esperada pero una implementación diferente

// Interfaz que tu aplicación espera
interface Logger {
    public function log(string $message): void;
}

// Tu código usa esta interfaz
class UserService {
    public function __construct(private Logger $logger) {}
    
    public function createUser(string $name): void {
        $this->logger->log("Usuario creado: {$name}");
    }
}

// ❌ Problema: Librería externa con interfaz diferente
class ThirdPartyLogger {
    public function writeLog(string $level, string $msg): void {
        echo "[{$level}] {$msg}\\n";
    }
}

// No puedes hacer esto:
// $service = new UserService(new ThirdPartyLogger()); // ❌ Error de tipos

// Necesitas un ADAPTER
?&gt;</code></pre></div>

        <h3>Solución: Patrón Adapter</h3>
        <div class="code-block"><pre><code>&lt;?php
// ✅ Adapter que hace compatible la librería externa

interface Logger {
    public function log(string $message): void;
}

// Librería externa (no puedes modificarla)
class ThirdPartyLogger {
    public function writeLog(string $level, string $msg): void {
        echo "[{$level}] {$msg}\\n";
    }
}

// ✅ Adapter: Traduce la interfaz
class ThirdPartyLoggerAdapter implements Logger {
    public function __construct(
        private ThirdPartyLogger $thirdPartyLogger
    ) {}
    
    public function log(string $message): void {
        // Adapta la llamada a la interfaz externa
        $this->thirdPartyLogger->writeLog('INFO', $message);
    }
}

// Tu código
class UserService {
    public function __construct(private Logger $logger) {}
    
    public function createUser(string $name): void {
        $this->logger->log("Usuario creado: {$name}");
    }
}

// Uso: Ahora funciona perfectamente
$thirdPartyLogger = new ThirdPartyLogger();
$adapter = new ThirdPartyLoggerAdapter($thirdPartyLogger);
$service = new UserService($adapter);
$service->createUser('Juan');
?&gt;</code></pre></div>

        <h3>Adapter de Clase vs Adapter de Objeto</h3>
        <div class="code-block"><pre><code>&lt;?php
// Dos formas de implementar Adapter

// 1. ADAPTER DE OBJETO (Composición - Recomendado)
class ObjectAdapter implements Logger {
    public function __construct(
        private ThirdPartyLogger $adaptee
    ) {}
    
    public function log(string $message): void {
        $this->adaptee->writeLog('INFO', $message);
    }
}

// 2. ADAPTER DE CLASE (Herencia - Menos flexible)
class ClassAdapter extends ThirdPartyLogger implements Logger {
    public function log(string $message): void {
        $this->writeLog('INFO', $message);
    }
}

// Uso
echo "=== Adapter de Objeto ===\\n";
$objectAdapter = new ObjectAdapter(new ThirdPartyLogger());
$objectAdapter->log('Mensaje con adapter de objeto');

echo "\\n=== Adapter de Clase ===\\n";
$classAdapter = new ClassAdapter();
$classAdapter->log('Mensaje con adapter de clase');

// Ventaja del Adapter de Objeto:
// - Más flexible (composición sobre herencia)
// - Puede adaptar múltiples clases
// - No expone métodos innecesarios
?&gt;</code></pre></div>

        <h3>Ejemplo Real: Adaptadores de Pago</h3>
        <div class="code-block"><pre><code>&lt;?php
// Sistema de pagos con múltiples proveedores

// Interfaz común que tu aplicación usa
interface PaymentGateway {
    public function processPayment(float $amount, string $currency): bool;
    public function refund(string $transactionId, float $amount): bool;
}

// Proveedor 1: Stripe (API externa)
class StripeAPI {
    public function charge(int $amountInCents, string $curr): array {
        echo "💳 Stripe: Cobrando {$amountInCents} centavos en {$curr}\\n";
        return ['id' => 'stripe_' . rand(1000, 9999), 'status' => 'success'];
    }
    
    public function createRefund(string $chargeId, int $amountInCents): array {
        echo "💰 Stripe: Reembolsando {$amountInCents} centavos\\n";
        return ['status' => 'refunded'];
    }
}

// Proveedor 2: PayPal (API externa diferente)
class PayPalSDK {
    public function makePayment(array $data): string {
        echo "💵 PayPal: Procesando pago de {$data['amount']} {$data['currency']}\\n";
        return 'PAYPAL-' . rand(1000, 9999);
    }
    
    public function refundTransaction(string $txId, array $details): bool {
        echo "💸 PayPal: Reembolsando transacción {$txId}\\n";
        return true;
    }
}

// ✅ Adapter para Stripe
class StripeAdapter implements PaymentGateway {
    private ?string $lastTransactionId = null;
    
    public function __construct(private StripeAPI $stripe) {}
    
    public function processPayment(float $amount, string $currency): bool {
        // Convertir a centavos (Stripe usa centavos)
        $amountInCents = (int)($amount * 100);
        
        $result = $this->stripe->charge($amountInCents, strtoupper($currency));
        $this->lastTransactionId = $result['id'];
        
        return $result['status'] === 'success';
    }
    
    public function refund(string $transactionId, float $amount): bool {
        $amountInCents = (int)($amount * 100);
        $result = $this->stripe->createRefund($transactionId, $amountInCents);
        
        return $result['status'] === 'refunded';
    }
}

// ✅ Adapter para PayPal
class PayPalAdapter implements PaymentGateway {
    public function __construct(private PayPalSDK $paypal) {}
    
    public function processPayment(float $amount, string $currency): bool {
        $data = [
            'amount' => $amount,
            'currency' => $currency,
            'description' => 'Payment'
        ];
        
        $transactionId = $this->paypal->makePayment($data);
        
        return !empty($transactionId);
    }
    
    public function refund(string $transactionId, float $amount): bool {
        $details = ['amount' => $amount];
        return $this->paypal->refundTransaction($transactionId, $details);
    }
}

// Servicio que usa la interfaz común
class CheckoutService {
    public function __construct(private PaymentGateway $gateway) {}
    
    public function checkout(float $amount, string $currency): void {
        echo "🛒 Procesando checkout de {$amount} {$currency}\\n";
        
        if ($this->gateway->processPayment($amount, $currency)) {
            echo "✅ Pago exitoso\\n";
        } else {
            echo "❌ Pago fallido\\n";
        }
    }
}

// Uso: Mismo código, diferentes proveedores
echo "=== Checkout con Stripe ===\\n";
$stripeGateway = new StripeAdapter(new StripeAPI());
$checkoutStripe = new CheckoutService($stripeGateway);
$checkoutStripe->checkout(99.99, 'USD');

echo "\\n=== Checkout con PayPal ===\\n";
$paypalGateway = new PayPalAdapter(new PayPalSDK());
$checkoutPaypal = new CheckoutService($paypalGateway);
$checkoutPaypal->checkout(149.99, 'EUR');
?&gt;</code></pre></div>

        <h3>Ejemplo Real: Adaptadores de Almacenamiento</h3>
        <div class="code-block"><pre><code>&lt;?php
// Sistema de almacenamiento con múltiples backends

interface StorageInterface {
    public function save(string $key, string $data): bool;
    public function load(string $key): ?string;
    public function delete(string $key): bool;
    public function exists(string $key): bool;
}

// Backend 1: Sistema de archivos
class FileSystem {
    public function __construct(private string $basePath) {}
    
    public function writeFile(string $filename, string $content): void {
        echo "📁 Escribiendo archivo: {$this->basePath}/{$filename}\\n";
    }
    
    public function readFile(string $filename): string {
        echo "📖 Leyendo archivo: {$this->basePath}/{$filename}\\n";
        return "contenido del archivo";
    }
    
    public function removeFile(string $filename): void {
        echo "🗑️ Eliminando archivo: {$this->basePath}/{$filename}\\n";
    }
    
    public function fileExists(string $filename): bool {
        return true;
    }
}

// Backend 2: Amazon S3
class S3Client {
    public function putObject(array $params): array {
        echo "☁️ S3: Subiendo objeto {$params['Key']} al bucket {$params['Bucket']}\\n";
        return ['status' => 'success'];
    }
    
    public function getObject(array $params): array {
        echo "☁️ S3: Descargando objeto {$params['Key']}\\n";
        return ['Body' => 'contenido de S3'];
    }
    
    public function deleteObject(array $params): void {
        echo "☁️ S3: Eliminando objeto {$params['Key']}\\n";
    }
    
    public function headObject(array $params): bool {
        return true;
    }
}

// ✅ Adapter para FileSystem
class FileSystemAdapter implements StorageInterface {
    public function __construct(private FileSystem $fs) {}
    
    public function save(string $key, string $data): bool {
        $this->fs->writeFile($key, $data);
        return true;
    }
    
    public function load(string $key): ?string {
        return $this->fs->readFile($key);
    }
    
    public function delete(string $key): bool {
        $this->fs->removeFile($key);
        return true;
    }
    
    public function exists(string $key): bool {
        return $this->fs->fileExists($key);
    }
}

// ✅ Adapter para S3
class S3Adapter implements StorageInterface {
    public function __construct(
        private S3Client $s3,
        private string $bucket
    ) {}
    
    public function save(string $key, string $data): bool {
        $result = $this->s3->putObject([
            'Bucket' => $this->bucket,
            'Key' => $key,
            'Body' => $data
        ]);
        
        return $result['status'] === 'success';
    }
    
    public function load(string $key): ?string {
        $result = $this->s3->getObject([
            'Bucket' => $this->bucket,
            'Key' => $key
        ]);
        
        return $result['Body'] ?? null;
    }
    
    public function delete(string $key): bool {
        $this->s3->deleteObject([
            'Bucket' => $this->bucket,
            'Key' => $key
        ]);
        
        return true;
    }
    
    public function exists(string $key): bool {
        return $this->s3->headObject([
            'Bucket' => $this->bucket,
            'Key' => $key
        ]);
    }
}

// Servicio que usa almacenamiento
class DocumentService {
    public function __construct(private StorageInterface $storage) {}
    
    public function saveDocument(string $id, string $content): void {
        echo "📄 Guardando documento {$id}\\n";
        $this->storage->save("doc_{$id}.txt", $content);
    }
    
    public function loadDocument(string $id): ?string {
        echo "📄 Cargando documento {$id}\\n";
        return $this->storage->load("doc_{$id}.txt");
    }
}

// Uso: Cambiar de backend sin modificar DocumentService
echo "=== Usando FileSystem ===\\n";
$fsStorage = new FileSystemAdapter(new FileSystem('/var/data'));
$docService = new DocumentService($fsStorage);
$docService->saveDocument('123', 'Contenido del documento');

echo "\\n=== Usando S3 ===\\n";
$s3Storage = new S3Adapter(new S3Client(), 'my-bucket');
$docService2 = new DocumentService($s3Storage);
$docService2->saveDocument('456', 'Contenido en la nube');
?&gt;</code></pre></div>

        <h3>Ejemplo Real: Adaptador de API REST a GraphQL</h3>
        <div class="code-block"><pre><code>&lt;?php
// Adaptar una API REST legacy a GraphQL

// Interfaz moderna que quieres usar
interface UserRepository {
    public function findById(int $id): array;
    public function findByEmail(string $email): array;
    public function create(array $data): array;
}

// API REST legacy (no puedes modificarla)
class LegacyRestAPI {
    public function get(string $endpoint): array {
        echo "🌐 GET {$endpoint}\\n";
        return ['id' => 1, 'name' => 'Juan', 'email' => 'juan@example.com'];
    }
    
    public function post(string $endpoint, array $body): array {
        echo "🌐 POST {$endpoint}\\n";
        return array_merge(['id' => rand(100, 999)], $body);
    }
}

// Nueva API GraphQL
class GraphQLClient {
    public function query(string $query, array $variables = []): array {
        echo "🔷 GraphQL Query: {$query}\\n";
        return ['data' => ['user' => ['id' => 1, 'name' => 'Ana', 'email' => 'ana@example.com']]];
    }
    
    public function mutate(string $mutation, array $variables): array {
        echo "🔷 GraphQL Mutation: {$mutation}\\n";
        return ['data' => ['createUser' => array_merge(['id' => rand(100, 999)], $variables)]];
    }
}

// ✅ Adapter para REST
class RestUserAdapter implements UserRepository {
    public function __construct(private LegacyRestAPI $api) {}
    
    public function findById(int $id): array {
        return $this->api->get("/users/{$id}");
    }
    
    public function findByEmail(string $email): array {
        return $this->api->get("/users?email=" . urlencode($email));
    }
    
    public function create(array $data): array {
        return $this->api->post('/users', $data);
    }
}

// ✅ Adapter para GraphQL
class GraphQLUserAdapter implements UserRepository {
    public function __construct(private GraphQLClient $client) {}
    
    public function findById(int $id): array {
        $query = "query GetUser(\$id: ID!) { user(id: \$id) { id name email } }";
        $result = $this->client->query($query, ['id' => $id]);
        return $result['data']['user'];
    }
    
    public function findByEmail(string $email): array {
        $query = "query GetUserByEmail(\$email: String!) { user(email: \$email) { id name email } }";
        $result = $this->client->query($query, ['email' => $email]);
        return $result['data']['user'];
    }
    
    public function create(array $data): array {
        $mutation = "mutation CreateUser(\$name: String!, \$email: String!) { createUser(name: \$name, email: \$email) { id name email } }";
        $result = $this->client->mutate($mutation, $data);
        return $result['data']['createUser'];
    }
}

// Servicio que usa el repositorio
class UserService {
    public function __construct(private UserRepository $repository) {}
    
    public function getUser(int $id): void {
        $user = $this->repository->findById($id);
        echo "👤 Usuario: {$user['name']} ({$user['email']})\\n";
    }
    
    public function registerUser(string $name, string $email): void {
        $user = $this->repository->create(['name' => $name, 'email' => $email]);
        echo "✅ Usuario registrado con ID: {$user['id']}\\n";
    }
}

// Uso: Migración gradual de REST a GraphQL
echo "=== Usando API REST Legacy ===\\n";
$restRepo = new RestUserAdapter(new LegacyRestAPI());
$service1 = new UserService($restRepo);
$service1->getUser(1);

echo "\\n=== Usando GraphQL Moderno ===\\n";
$graphqlRepo = new GraphQLUserAdapter(new GraphQLClient());
$service2 = new UserService($graphqlRepo);
$service2->getUser(1);
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Ventajas del Patrón Adapter:</strong><br>
            • <strong>Reutilización</strong>: Usa código existente sin modificarlo<br>
            • <strong>SRP</strong>: Separa la lógica de conversión de la lógica de negocio<br>
            • <strong>OCP</strong>: Abierto a extensión, cerrado a modificación<br>
            • <strong>Flexibilidad</strong>: Cambia implementaciones fácilmente<br>
            • <strong>Integración</strong>: Integra librerías de terceros sin problemas<br>
            • <strong>Testing</strong>: Fácil crear mocks del adaptador
        </div>

        <div class="warning-box">
            <strong>⚠️ Desventajas:</strong><br>
            • <strong>Complejidad</strong>: Añade una capa adicional<br>
            • <strong>Overhead</strong>: Pequeña penalización de rendimiento<br>
            • <strong>Mantenimiento</strong>: Más clases que mantener<br>
            • <strong>Sobre-ingeniería</strong>: Puede ser excesivo para casos simples
        </div>

        <div class="info-box">
            <strong>💡 Cuándo Usar Adapter:</strong><br>
            • <strong>Librerías externas</strong>: Integrar APIs de terceros<br>
            • <strong>Código legacy</strong>: Adaptar código antiguo a nuevas interfaces<br>
            • <strong>Múltiples proveedores</strong>: Pagos, almacenamiento, notificaciones<br>
            • <strong>Migración</strong>: Transición gradual entre sistemas<br>
            • <strong>Interfaces incompatibles</strong>: Hacer trabajar juntas clases incompatibles<br>
            • <strong>Testing</strong>: Aislar dependencias externas<br>
            <br>
            <strong>⚠️ Cuándo NO Usar:</strong><br>
            • Puedes modificar directamente la clase original<br>
            • La conversión es trivial (una línea)<br>
            • Solo usarás la clase en un lugar<br>
            • Añade complejidad innecesaria
        </div>
    `,
    'patron-decorator': `
        <h1>Patrón Decorator (Decorador)</h1>
        
        <p>El <strong>patrón Decorator</strong> es un patrón estructural que permite añadir funcionalidades a objetos de forma dinámica sin modificar su estructura. Los decoradores envuelven objetos existentes y añaden comportamiento adicional manteniendo la misma interfaz.</p>

        <div class="info-box">
            <strong>💡 ¿Qué es el Patrón Decorator?</strong><br>
            • <strong>Propósito</strong>: Añadir responsabilidades a objetos dinámicamente<br>
            • <strong>Problema</strong>: Extender funcionalidad sin modificar clases existentes<br>
            • <strong>Solución</strong>: Envolver objetos en decoradores que añaden comportamiento<br>
            • <strong>Analogía</strong>: Como vestir capas de ropa una sobre otra<br>
            • <strong>Tipo</strong>: Patrón estructural
        </div>

        <h3>Problema Sin Decorator</h3>
        <div class="code-block"><pre><code>&lt;?php
// ❌ Sin Decorator: Explosión de subclases

interface Notificador {
    public function enviar(string $mensaje): void;
}

class NotificadorEmail implements Notificador {
    public function enviar(string $mensaje): void {
        echo "📧 Email: {$mensaje}\\n";
    }
}

// ❌ Necesitas una clase para cada combinación
class NotificadorEmailYSMS implements Notificador {
    public function enviar(string $mensaje): void {
        echo "📧 Email: {$mensaje}\\n";
        echo "📱 SMS: {$mensaje}\\n";
    }
}

class NotificadorEmailYSlack implements Notificador {
    public function enviar(string $mensaje): void {
        echo "📧 Email: {$mensaje}\\n";
        echo "💬 Slack: {$mensaje}\\n";
    }
}

class NotificadorEmailSMSYSlack implements Notificador {
    public function enviar(string $mensaje): void {
        echo "📧 Email: {$mensaje}\\n";
        echo "📱 SMS: {$mensaje}\\n";
        echo "💬 Slack: {$mensaje}\\n";
    }
}

// ❌ Problema: Con N canales necesitas 2^N clases!
?&gt;</code></pre></div>

        <h3>Solución Con Decorator</h3>
        <div class="code-block"><pre><code>&lt;?php
// ✅ Con Decorator: Composición flexible

interface Notificador {
    public function enviar(string $mensaje): void;
}

// Notificador base
class NotificadorEmail implements Notificador {
    public function enviar(string $mensaje): void {
        echo "📧 Email: {$mensaje}\\n";
    }
}

// Decorador base abstracto
abstract class NotificadorDecorator implements Notificador {
    public function __construct(protected Notificador $notificador) {}
    
    public function enviar(string $mensaje): void {
        $this->notificador->enviar($mensaje);
    }
}

// Decoradores concretos
class SMSDecorator extends NotificadorDecorator {
    public function enviar(string $mensaje): void {
        parent::enviar($mensaje);
        echo "📱 SMS: {$mensaje}\\n";
    }
}

class SlackDecorator extends NotificadorDecorator {
    public function enviar(string $mensaje): void {
        parent::enviar($mensaje);
        echo "💬 Slack: {$mensaje}\\n";
    }
}

class PushDecorator extends NotificadorDecorator {
    public function enviar(string $mensaje): void {
        parent::enviar($mensaje);
        echo "🔔 Push: {$mensaje}\\n";
    }
}

// Uso: Combinar decoradores dinámicamente
$notificador = new NotificadorEmail();

echo "=== Solo Email ===\\n";
$notificador->enviar("Hola");

echo "\\n=== Email + SMS ===\\n";
$conSMS = new SMSDecorator($notificador);
$conSMS->enviar("Hola");

echo "\\n=== Email + SMS + Slack ===\\n";
$completo = new SlackDecorator(new SMSDecorator($notificador));
$completo->enviar("Hola");

echo "\\n=== Todos los canales ===\\n";
$todos = new PushDecorator(new SlackDecorator(new SMSDecorator($notificador)));
$todos->enviar("Hola");
?&gt;</code></pre></div>

        <h3>Ejemplo Real: Sistema de Café</h3>
        <div class="code-block"><pre><code>&lt;?php
// Sistema de cafetería con ingredientes adicionales

interface Bebida {
    public function getDescripcion(): string;
    public function getPrecio(): float;
}

// Bebidas base
class Cafe implements Bebida {
    public function getDescripcion(): string {
        return "Café";
    }
    
    public function getPrecio(): float {
        return 2.00;
    }
}

class Te implements Bebida {
    public function getDescripcion(): string {
        return "Té";
    }
    
    public function getPrecio(): float {
        return 1.50;
    }
}

// Decorador base
abstract class BebidaDecorator implements Bebida {
    public function __construct(protected Bebida $bebida) {}
    
    public function getDescripcion(): string {
        return $this->bebida->getDescripcion();
    }
    
    public function getPrecio(): float {
        return $this->bebida->getPrecio();
    }
}

// Decoradores de ingredientes
class LecheDecorator extends BebidaDecorator {
    public function getDescripcion(): string {
        return $this->bebida->getDescripcion() . ", Leche";
    }
    
    public function getPrecio(): float {
        return $this->bebida->getPrecio() + 0.50;
    }
}

class CarameloDecorator extends BebidaDecorator {
    public function getDescripcion(): string {
        return $this->bebida->getDescripcion() . ", Caramelo";
    }
    
    public function getPrecio(): float {
        return $this->bebida->getPrecio() + 0.75;
    }
}

class CremaDecorator extends BebidaDecorator {
    public function getDescripcion(): string {
        return $this->bebida->getDescripcion() . ", Crema";
    }
    
    public function getPrecio(): float {
        return $this->bebida->getPrecio() + 0.60;
    }
}

class ChocolateDecorator extends BebidaDecorator {
    public function getDescripcion(): string {
        return $this->bebida->getDescripcion() . ", Chocolate";
    }
    
    public function getPrecio(): float {
        return $this->bebida->getPrecio() + 0.80;
    }
}

// Uso: Crear bebidas personalizadas
echo "=== Café simple ===\\n";
$cafe = new Cafe();
echo "{$cafe->getDescripcion()}: \${$cafe->getPrecio()}\\n";

echo "\\n=== Café con leche ===\\n";
$cafeConLeche = new LecheDecorator(new Cafe());
echo "{$cafeConLeche->getDescripcion()}: \${$cafeConLeche->getPrecio()}\\n";

echo "\\n=== Café con leche y caramelo ===\\n";
$cafeEspecial = new CarameloDecorator(new LecheDecorator(new Cafe()));
echo "{$cafeEspecial->getDescripcion()}: \${$cafeEspecial->getPrecio()}\\n";

echo "\\n=== Café completo ===\\n";
$cafeCompleto = new ChocolateDecorator(
    new CremaDecorator(
        new CarameloDecorator(
            new LecheDecorator(new Cafe())
        )
    )
);
echo "{$cafeCompleto->getDescripcion()}: \${$cafeCompleto->getPrecio()}\\n";
?&gt;</code></pre></div>

        <h3>Ejemplo Real: Procesamiento de Texto</h3>
        <div class="code-block"><pre><code>&lt;?php
// Sistema de procesamiento de texto con filtros

interface TextProcessor {
    public function process(string $text): string;
}

// Procesador base (no hace nada)
class PlainTextProcessor implements TextProcessor {
    public function process(string $text): string {
        return $text;
    }
}

// Decorador base
abstract class TextDecorator implements TextProcessor {
    public function __construct(protected TextProcessor $processor) {}
    
    public function process(string $text): string {
        return $this->processor->process($text);
    }
}

// Decoradores de procesamiento
class UpperCaseDecorator extends TextDecorator {
    public function process(string $text): string {
        $processed = parent::process($text);
        return strtoupper($processed);
    }
}

class TrimDecorator extends TextDecorator {
    public function process(string $text): string {
        $processed = parent::process($text);
        return trim($processed);
    }
}

class HtmlEncodeDecorator extends TextDecorator {
    public function process(string $text): string {
        $processed = parent::process($text);
        return htmlspecialchars($processed, ENT_QUOTES, 'UTF-8');
    }
}

class MarkdownDecorator extends TextDecorator {
    public function process(string $text): string {
        $processed = parent::process($text);
        // Convertir **texto** a <strong>texto</strong>
        $processed = preg_replace('/\\*\\*(.+?)\\*\\*/', '<strong>$1</strong>', $processed);
        // Convertir *texto* a <em>texto</em>
        $processed = preg_replace('/\\*(.+?)\\*/', '<em>$1</em>', $processed);
        return $processed;
    }
}

class StripTagsDecorator extends TextDecorator {
    public function process(string $text): string {
        $processed = parent::process($text);
        return strip_tags($processed);
    }
}

// Uso: Pipeline de procesamiento
$texto = "  <script>alert('xss')</script> **Hola** *mundo*  ";

echo "=== Texto original ===\\n";
echo "\"{$texto}\"\\n";

echo "\\n=== Solo trim ===\\n";
$processor1 = new TrimDecorator(new PlainTextProcessor());
echo "\"{$processor1->process($texto)}\"\\n";

echo "\\n=== Trim + HTML encode ===\\n";
$processor2 = new HtmlEncodeDecorator(new TrimDecorator(new PlainTextProcessor()));
echo "\"{$processor2->process($texto)}\"\\n";

echo "\\n=== Trim + Strip tags + Markdown ===\\n";
$processor3 = new MarkdownDecorator(
    new StripTagsDecorator(
        new TrimDecorator(new PlainTextProcessor())
    )
);
echo "\"{$processor3->process($texto)}\"\\n";
?&gt;</code></pre></div>

        <h3>Ejemplo Real: Logging con Decoradores</h3>
        <div class="code-block"><pre><code>&lt;?php
// Sistema de logging con diferentes formatos y destinos

interface Logger {
    public function log(string $message): void;
}

// Logger base
class SimpleLogger implements Logger {
    public function log(string $message): void {
        echo "{$message}\\n";
    }
}

// Decorador base
abstract class LoggerDecorator implements Logger {
    public function __construct(protected Logger $logger) {}
    
    public function log(string $message): void {
        $this->logger->log($message);
    }
}

// Decoradores de formato
class TimestampDecorator extends LoggerDecorator {
    public function log(string $message): void {
        $timestamp = date('Y-m-d H:i:s');
        parent::log("[{$timestamp}] {$message}");
    }
}

class LevelDecorator extends LoggerDecorator {
    public function __construct(Logger $logger, private string $level) {
        parent::__construct($logger);
    }
    
    public function log(string $message): void {
        parent::log("[{$this->level}] {$message}");
    }
}

class ColorDecorator extends LoggerDecorator {
    public function __construct(Logger $logger, private string $color) {
        parent::__construct($logger);
    }
    
    public function log(string $message): void {
        $colors = [
            'red' => '\\033[31m',
            'green' => '\\033[32m',
            'yellow' => '\\033[33m',
            'reset' => '\\033[0m'
        ];
        
        $colorCode = $colors[$this->color] ?? '';
        $reset = $colors['reset'];
        parent::log("{$colorCode}{$message}{$reset}");
    }
}

class FileDecorator extends LoggerDecorator {
    public function __construct(Logger $logger, private string $filename) {
        parent::__construct($logger);
    }
    
    public function log(string $message): void {
        parent::log($message);
        file_put_contents($this->filename, $message . "\\n", FILE_APPEND);
        echo "💾 Guardado en {$this->filename}\\n";
    }
}

// Uso: Crear loggers personalizados
echo "=== Logger simple ===\\n";
$logger1 = new SimpleLogger();
$logger1->log("Mensaje simple");

echo "\\n=== Logger con timestamp ===\\n";
$logger2 = new TimestampDecorator(new SimpleLogger());
$logger2->log("Mensaje con timestamp");

echo "\\n=== Logger completo ===\\n";
$logger3 = new FileDecorator(
    new ColorDecorator(
        new LevelDecorator(
            new TimestampDecorator(new SimpleLogger()),
            'ERROR'
        ),
        'red'
    ),
    'app.log'
);
$logger3->log("Error crítico en el sistema");
?&gt;</code></pre></div>

        <h3>Ejemplo Real: Compresión y Encriptación de Datos</h3>
        <div class="code-block"><pre><code>&lt;?php
// Sistema de almacenamiento con compresión y encriptación

interface DataSource {
    public function write(string $data): void;
    public function read(): string;
}

// Fuente de datos base
class FileDataSource implements DataSource {
    public function __construct(private string $filename) {}
    
    public function write(string $data): void {
        echo "📁 Escribiendo en archivo: {$this->filename}\\n";
        file_put_contents($this->filename, $data);
    }
    
    public function read(): string {
        echo "📖 Leyendo de archivo: {$this->filename}\\n";
        return file_get_contents($this->filename) ?: '';
    }
}

// Decorador base
abstract class DataSourceDecorator implements DataSource {
    public function __construct(protected DataSource $source) {}
    
    public function write(string $data): void {
        $this->source->write($data);
    }
    
    public function read(): string {
        return $this->source->read();
    }
}

// Decorador de compresión
class CompressionDecorator extends DataSourceDecorator {
    public function write(string $data): void {
        echo "🗜️ Comprimiendo datos...\\n";
        $compressed = gzcompress($data);
        parent::write($compressed);
    }
    
    public function read(): string {
        $data = parent::read();
        echo "📦 Descomprimiendo datos...\\n";
        return gzuncompress($data);
    }
}

// Decorador de encriptación
class EncryptionDecorator extends DataSourceDecorator {
    public function __construct(DataSource $source, private string $key) {
        parent::__construct($source);
    }
    
    public function write(string $data): void {
        echo "🔒 Encriptando datos...\\n";
        $encrypted = base64_encode($data); // Simplificado
        parent::write($encrypted);
    }
    
    public function read(): string {
        $data = parent::read();
        echo "🔓 Desencriptando datos...\\n";
        return base64_decode($data);
    }
}

// Uso: Combinar compresión y encriptación
$datos = "Información confidencial muy importante que debe ser protegida";

echo "=== Guardar sin protección ===\\n";
$source1 = new FileDataSource('data.txt');
$source1->write($datos);

echo "\\n=== Guardar con compresión ===\\n";
$source2 = new CompressionDecorator(new FileDataSource('data_compressed.txt'));
$source2->write($datos);

echo "\\n=== Guardar con encriptación ===\\n";
$source3 = new EncryptionDecorator(new FileDataSource('data_encrypted.txt'), 'secret');
$source3->write($datos);

echo "\\n=== Guardar con compresión + encriptación ===\\n";
$source4 = new EncryptionDecorator(
    new CompressionDecorator(
        new FileDataSource('data_secure.txt')
    ),
    'secret'
);
$source4->write($datos);

echo "\\n=== Leer datos seguros ===\\n";
$datosLeidos = $source4->read();
echo "Datos recuperados: {$datosLeidos}\\n";
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Ventajas del Patrón Decorator:</strong><br>
            • <strong>Flexibilidad</strong>: Añade funcionalidad dinámicamente<br>
            • <strong>SRP</strong>: Cada decorador tiene una responsabilidad única<br>
            • <strong>OCP</strong>: Extensible sin modificar código existente<br>
            • <strong>Composición</strong>: Combina decoradores de múltiples formas<br>
            • <strong>Alternativa a herencia</strong>: Evita explosión de subclases<br>
            • <strong>Runtime</strong>: Configuración en tiempo de ejecución
        </div>

        <div class="warning-box">
            <strong>⚠️ Desventajas:</strong><br>
            • <strong>Complejidad</strong>: Muchos objetos pequeños<br>
            • <strong>Orden importa</strong>: El orden de decoradores afecta el resultado<br>
            • <strong>Debugging</strong>: Difícil seguir la cadena de decoradores<br>
            • <strong>Identidad</strong>: El objeto decorado no es idéntico al original
        </div>

        <div class="info-box">
            <strong>💡 Cuándo Usar Decorator:</strong><br>
            • <strong>Añadir funcionalidad</strong>: Sin modificar clases existentes<br>
            • <strong>Combinaciones</strong>: Múltiples combinaciones de comportamiento<br>
            • <strong>Runtime</strong>: Configuración dinámica en tiempo de ejecución<br>
            • <strong>Evitar herencia</strong>: Alternativa a jerarquías complejas<br>
            • <strong>Pipeline</strong>: Procesamiento en cadena (filtros, middleware)<br>
            • <strong>Responsabilidades opcionales</strong>: Funcionalidad que puede o no aplicarse<br>
            <br>
            <strong>⚠️ Cuándo NO Usar:</strong><br>
            • La funcionalidad es parte esencial del objeto<br>
            • Solo necesitas una combinación específica<br>
            • El orden de decoradores no debe importar<br>
            • Añade complejidad innecesaria
        </div>
    `,
    'patron-facade': `
        <h1>Patrón Facade (Fachada)</h1>
        
        <p>El <strong>patrón Facade</strong> es un patrón estructural que proporciona una interfaz simplificada a un sistema complejo de clases, bibliotecas o frameworks. Actúa como una "fachada" que oculta la complejidad interna y expone solo lo necesario.</p>

        <div class="info-box">
            <strong>💡 ¿Qué es el Patrón Facade?</strong><br>
            • <strong>Propósito</strong>: Simplificar la interfaz de un sistema complejo<br>
            • <strong>Problema</strong>: Subsistemas con muchas clases interdependientes difíciles de usar<br>
            • <strong>Solución</strong>: Crear una clase fachada que coordina las operaciones<br>
            • <strong>Analogía</strong>: Como el mostrador de un hotel que coordina todos los servicios<br>
            • <strong>Tipo</strong>: Patrón estructural
        </div>

        <h3>Problema Sin Facade</h3>
        <div class="code-block"><pre><code>&lt;?php
// ❌ Sin Facade: Cliente debe conocer y coordinar múltiples subsistemas

class VideoFile {
    public function __construct(public string $filename) {}
}

class CodecFactory {
    public function extract(VideoFile $file): string {
        echo "🎬 Extrayendo codec del video\\n";
        return "h264";
    }
}

class BitrateReader {
    public function read(VideoFile $file, string $codec): string {
        echo "📊 Leyendo bitrate\\n";
        return "1080p";
    }
}

class AudioMixer {
    public function fix(VideoFile $file): void {
        echo "🎵 Arreglando audio\\n";
    }
}

// ❌ Cliente debe conocer todos los pasos
$file = new VideoFile("video.mp4");
$codecFactory = new CodecFactory();
$bitrateReader = new BitrateReader();
$audioMixer = new AudioMixer();

$codec = $codecFactory->extract($file);
$bitrate = $bitrateReader->read($file, $codec);
$audioMixer->fix($file);

echo "✅ Video procesado\\n";

// Problema: Demasiado complejo para el cliente
?&gt;</code></pre></div>

        <h3>Solución Con Facade</h3>
        <div class="code-block"><pre><code>&lt;?php
// ✅ Con Facade: Interfaz simple para el cliente

// Subsistemas complejos (sin cambios)
class VideoFile {
    public function __construct(public string $filename) {}
}

class CodecFactory {
    public function extract(VideoFile $file): string {
        echo "🎬 Extrayendo codec del video\\n";
        return "h264";
    }
}

class BitrateReader {
    public function read(VideoFile $file, string $codec): string {
        echo "📊 Leyendo bitrate\\n";
        return "1080p";
    }
}

class AudioMixer {
    public function fix(VideoFile $file): void {
        echo "🎵 Arreglando audio\\n";
    }
}

// ✅ Facade: Simplifica el uso
class VideoConverter {
    public function convert(string $filename, string $format): void {
        echo "🎥 Iniciando conversión de video\\n";
        
        $file = new VideoFile($filename);
        $codecFactory = new CodecFactory();
        $bitrateReader = new BitrateReader();
        $audioMixer = new AudioMixer();
        
        $codec = $codecFactory->extract($file);
        $bitrate = $bitrateReader->read($file, $codec);
        $audioMixer->fix($file);
        
        echo "✅ Video convertido a {$format}\\n";
    }
}

// Uso: Mucho más simple
$converter = new VideoConverter();
$converter->convert("video.mp4", "avi");
?&gt;</code></pre></div>

        <h3>Ejemplo Real: Facade de E-commerce</h3>
        <div class="code-block"><pre><code>&lt;?php
// Sistema de e-commerce con múltiples subsistemas

// Subsistema de inventario
class InventorySystem {
    public function checkStock(int $productId, int $quantity): bool {
        echo "📦 Verificando stock del producto {$productId}\\n";
        return true;
    }
    
    public function reserveStock(int $productId, int $quantity): void {
        echo "🔒 Reservando {$quantity} unidades\\n";
    }
}

// Subsistema de pagos
class PaymentGateway {
    public function authorize(float $amount, string $cardNumber): string {
        echo "💳 Autorizando pago de \${$amount}\\n";
        return "AUTH_" . rand(1000, 9999);
    }
    
    public function capture(string $authCode): void {
        echo "✅ Capturando pago {$authCode}\\n";
    }
}

// Subsistema de envíos
class ShippingService {
    public function calculateShipping(string $address): float {
        echo "📮 Calculando envío a {$address}\\n";
        return 5.99;
    }
    
    public function createShipment(int $orderId, string $address): string {
        echo "🚚 Creando envío para orden {$orderId}\\n";
        return "SHIP_" . rand(1000, 9999);
    }
}

// Subsistema de notificaciones
class NotificationService {
    public function sendOrderConfirmation(string $email, int $orderId): void {
        echo "📧 Enviando confirmación a {$email} para orden {$orderId}\\n";
    }
}

// ✅ Facade: Simplifica el proceso de compra
class CheckoutFacade {
    public function __construct(
        private InventorySystem $inventory,
        private PaymentGateway $payment,
        private ShippingService $shipping,
        private NotificationService $notification
    ) {}
    
    public function placeOrder(
        int $productId,
        int $quantity,
        string $cardNumber,
        string $address,
        string $email
    ): array {
        echo "🛒 Procesando orden...\\n\\n";
        
        // 1. Verificar stock
        if (!$this->inventory->checkStock($productId, $quantity)) {
            throw new Exception("Producto sin stock");
        }
        
        // 2. Calcular total
        $productPrice = 29.99;
        $shippingCost = $this->shipping->calculateShipping($address);
        $total = ($productPrice * $quantity) + $shippingCost;
        
        // 3. Procesar pago
        $authCode = $this->payment->authorize($total, $cardNumber);
        $this->payment->capture($authCode);
        
        // 4. Reservar inventario
        $this->inventory->reserveStock($productId, $quantity);
        
        // 5. Crear envío
        $orderId = rand(10000, 99999);
        $trackingNumber = $this->shipping->createShipment($orderId, $address);
        
        // 6. Enviar confirmación
        $this->notification->sendOrderConfirmation($email, $orderId);
        
        echo "\\n✅ Orden completada exitosamente\\n";
        
        return [
            'orderId' => $orderId,
            'total' => $total,
            'trackingNumber' => $trackingNumber
        ];
    }
}

// Uso: Cliente solo llama a un método
$facade = new CheckoutFacade(
    new InventorySystem(),
    new PaymentGateway(),
    new ShippingService(),
    new NotificationService()
);

$order = $facade->placeOrder(
    productId: 123,
    quantity: 2,
    cardNumber: "4111111111111111",
    address: "Calle Principal 123",
    email: "cliente@example.com"
);

echo "\\nOrden ID: {$order['orderId']}\\n";
echo "Total: \${$order['total']}\\n";
echo "Tracking: {$order['trackingNumber']}\\n";
?&gt;</code></pre></div>

        <h3>Ejemplo Real: Facade de Base de Datos</h3>
        <div class="code-block"><pre><code>&lt;?php
// Sistema de base de datos con múltiples componentes

// Subsistema de conexión
class DatabaseConnection {
    public function connect(string $host, string $db): void {
        echo "🔌 Conectando a {$host}/{$db}\\n";
    }
    
    public function disconnect(): void {
        echo "🔌 Desconectando\\n";
    }
}

// Subsistema de consultas
class QueryBuilder {
    public function select(string $table, array $columns): string {
        $cols = implode(', ', $columns);
        return "SELECT {$cols} FROM {$table}";
    }
    
    public function where(string $query, array $conditions): string {
        $where = implode(' AND ', array_map(
            fn($k, $v) => "{$k} = '{$v}'",
            array_keys($conditions),
            $conditions
        ));
        return "{$query} WHERE {$where}";
    }
}

// Subsistema de ejecución
class QueryExecutor {
    public function execute(string $query): array {
        echo "⚡ Ejecutando: {$query}\\n";
        return [
            ['id' => 1, 'name' => 'Juan'],
            ['id' => 2, 'name' => 'Ana']
        ];
    }
}

// Subsistema de caché
class QueryCache {
    private array $cache = [];
    
    public function get(string $key): ?array {
        if (isset($this->cache[$key])) {
            echo "💾 Obteniendo de caché\\n";
            return $this->cache[$key];
        }
        return null;
    }
    
    public function set(string $key, array $data): void {
        echo "💾 Guardando en caché\\n";
        $this->cache[$key] = $data;
    }
}

// ✅ Facade: Simplifica operaciones de BD
class DatabaseFacade {
    private DatabaseConnection $connection;
    private QueryBuilder $builder;
    private QueryExecutor $executor;
    private QueryCache $cache;
    
    public function __construct(string $host, string $database) {
        $this->connection = new DatabaseConnection();
        $this->builder = new QueryBuilder();
        $this->executor = new QueryExecutor();
        $this->cache = new QueryCache();
        
        $this->connection->connect($host, $database);
    }
    
    public function find(string $table, array $conditions): array {
        $cacheKey = $table . '_' . md5(json_encode($conditions));
        
        // Intentar obtener de caché
        $cached = $this->cache->get($cacheKey);
        if ($cached !== null) {
            return $cached;
        }
        
        // Construir y ejecutar query
        $query = $this->builder->select($table, ['*']);
        $query = $this->builder->where($query, $conditions);
        $results = $this->executor->execute($query);
        
        // Guardar en caché
        $this->cache->set($cacheKey, $results);
        
        return $results;
    }
    
    public function findAll(string $table): array {
        $query = $this->builder->select($table, ['*']);
        return $this->executor->execute($query);
    }
    
    public function __destruct() {
        $this->connection->disconnect();
    }
}

// Uso: Interfaz simple
echo "=== Primera consulta ===\\n";
$db = new DatabaseFacade('localhost', 'mydb');
$users = $db->find('users', ['status' => 'active']);
print_r($users);

echo "\\n=== Segunda consulta (desde caché) ===\\n";
$users2 = $db->find('users', ['status' => 'active']);
print_r($users2);
?&gt;</code></pre></div>

        <h3>Ejemplo Real: Facade de Sistema de Reportes</h3>
        <div class="code-block"><pre><code>&lt;?php
// Sistema de generación de reportes

// Subsistema de datos
class DataCollector {
    public function collectSalesData(string $startDate, string $endDate): array {
        echo "📊 Recolectando datos de ventas\\n";
        return [
            ['date' => '2024-01-01', 'amount' => 1500],
            ['date' => '2024-01-02', 'amount' => 2300],
        ];
    }
    
    public function collectUserData(): array {
        echo "👥 Recolectando datos de usuarios\\n";
        return ['total' => 150, 'active' => 120];
    }
}

// Subsistema de análisis
class DataAnalyzer {
    public function calculateTotal(array $data): float {
        echo "🧮 Calculando totales\\n";
        return array_sum(array_column($data, 'amount'));
    }
    
    public function calculateAverage(array $data): float {
        echo "📈 Calculando promedios\\n";
        $total = $this->calculateTotal($data);
        return $total / count($data);
    }
}

// Subsistema de formato
class ReportFormatter {
    public function formatPDF(array $data): string {
        echo "📄 Formateando a PDF\\n";
        return "report.pdf";
    }
    
    public function formatExcel(array $data): string {
        echo "📊 Formateando a Excel\\n";
        return "report.xlsx";
    }
    
    public function formatHTML(array $data): string {
        echo "🌐 Formateando a HTML\\n";
        return "<html>...</html>";
    }
}

// Subsistema de envío
class ReportDelivery {
    public function sendEmail(string $report, string $email): void {
        echo "📧 Enviando reporte a {$email}\\n";
    }
    
    public function saveToCloud(string $report): string {
        echo "☁️ Guardando en la nube\\n";
        return "https://cloud.com/reports/" . $report;
    }
}

// ✅ Facade: Simplifica generación de reportes
class ReportFacade {
    private DataCollector $collector;
    private DataAnalyzer $analyzer;
    private ReportFormatter $formatter;
    private ReportDelivery $delivery;
    
    public function __construct() {
        $this->collector = new DataCollector();
        $this->analyzer = new DataAnalyzer();
        $this->formatter = new ReportFormatter();
        $this->delivery = new ReportDelivery();
    }
    
    public function generateSalesReport(
        string $startDate,
        string $endDate,
        string $format = 'pdf',
        ?string $email = null
    ): array {
        echo "📋 Generando reporte de ventas...\\n\\n";
        
        // 1. Recolectar datos
        $salesData = $this->collector->collectSalesData($startDate, $endDate);
        
        // 2. Analizar
        $total = $this->analyzer->calculateTotal($salesData);
        $average = $this->analyzer->calculateAverage($salesData);
        
        // 3. Formatear
        $report = match($format) {
            'pdf' => $this->formatter->formatPDF($salesData),
            'excel' => $this->formatter->formatExcel($salesData),
            'html' => $this->formatter->formatHTML($salesData),
            default => throw new Exception("Formato no soportado")
        };
        
        // 4. Entregar
        $url = $this->delivery->saveToCloud($report);
        
        if ($email) {
            $this->delivery->sendEmail($report, $email);
        }
        
        echo "\\n✅ Reporte generado\\n";
        
        return [
            'report' => $report,
            'url' => $url,
            'total' => $total,
            'average' => $average
        ];
    }
    
    public function generateDashboard(): string {
        echo "📊 Generando dashboard...\\n\\n";
        
        $salesData = $this->collector->collectSalesData('2024-01-01', '2024-12-31');
        $userData = $this->collector->collectUserData();
        
        $salesTotal = $this->analyzer->calculateTotal($salesData);
        
        $dashboard = $this->formatter->formatHTML([
            'sales' => $salesTotal,
            'users' => $userData
        ]);
        
        echo "\\n✅ Dashboard generado\\n";
        
        return $dashboard;
    }
}

// Uso: Interfaz simple y clara
$reportFacade = new ReportFacade();

echo "=== Generar reporte de ventas ===\\n";
$result = $reportFacade->generateSalesReport(
    '2024-01-01',
    '2024-01-31',
    'pdf',
    'gerente@example.com'
);

echo "\\nURL: {$result['url']}\\n";
echo "Total: \${$result['total']}\\n";
echo "Promedio: \${$result['average']}\\n";
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Ventajas del Patrón Facade:</strong><br>
            • <strong>Simplicidad</strong>: Interfaz simple para sistemas complejos<br>
            • <strong>Desacoplamiento</strong>: Cliente no depende de subsistemas internos<br>
            • <strong>Facilita uso</strong>: Reduce curva de aprendizaje<br>
            • <strong>Centralización</strong>: Un punto de entrada para operaciones comunes<br>
            • <strong>Mantenibilidad</strong>: Cambios internos no afectan al cliente<br>
            • <strong>Testing</strong>: Fácil mockear la fachada
        </div>

        <div class="warning-box">
            <strong>⚠️ Desventajas:</strong><br>
            • <strong>God Object</strong>: Puede convertirse en un objeto que sabe demasiado<br>
            • <strong>Limitación</strong>: Puede no exponer toda la funcionalidad necesaria<br>
            • <strong>Capa adicional</strong>: Añade una capa de indirección<br>
            • <strong>Rigidez</strong>: Puede ser inflexible para casos especiales
        </div>

        <div class="info-box">
            <strong>💡 Cuándo Usar Facade:</strong><br>
            • <strong>Sistema complejo</strong>: Muchas clases interdependientes<br>
            • <strong>Simplificar API</strong>: Librería o framework complicado<br>
            • <strong>Punto de entrada</strong>: Operaciones comunes bien definidas<br>
            • <strong>Desacoplar</strong>: Aislar cliente de subsistemas<br>
            • <strong>Migración</strong>: Facilitar transición entre sistemas<br>
            • <strong>Capas</strong>: Definir puntos de entrada a cada capa<br>
            <br>
            <strong>⚠️ Cuándo NO Usar:</strong><br>
            • El sistema ya es simple<br>
            • Necesitas acceso completo a subsistemas<br>
            • Solo tienes una clase<br>
            • Añade complejidad innecesaria
        </div>
    `,
    'patron-bridge': `
        <h1>Patrón Bridge (Puente)</h1>
        
        <p>El <strong>patrón Bridge</strong> separa la abstracción de su implementación, permitiendo que ambas varíen independientemente. Divide una clase grande en dos jerarquías separadas: abstracción e implementación.</p>

        <div class="info-box">
            <strong>💡 ¿Qué es el Patrón Bridge?</strong><br>
            • <strong>Propósito</strong>: Desacoplar abstracción de implementación<br>
            • <strong>Problema</strong>: Explosión de subclases al combinar múltiples dimensiones<br>
            • <strong>Solución</strong>: Composición en lugar de herencia<br>
            • <strong>Analogía</strong>: Como un control remoto (abstracción) que funciona con diferentes TVs (implementación)<br>
            • <strong>Tipo</strong>: Patrón estructural
        </div>

        <h3>Problema Sin Bridge</h3>
        <div class="code-block"><pre><code>&lt;?php
// ❌ Sin Bridge: Explosión de subclases

// Formas: Círculo, Cuadrado
// Colores: Rojo, Azul, Verde
// Necesitas: 2 × 3 = 6 clases

class CirculoRojo {
    public function dibujar(): void {
        echo "⭕ Círculo rojo\\n";
    }
}

class CirculoAzul {
    public function dibujar(): void {
        echo "⭕ Círculo azul\\n";
    }
}

class CuadradoRojo {
    public function dibujar(): void {
        echo "⬛ Cuadrado rojo\\n";
    }
}

// ❌ Con N formas y M colores necesitas N × M clases
?&gt;</code></pre></div>

        <h3>Solución Con Bridge</h3>
        <div class="code-block"><pre><code>&lt;?php
// ✅ Con Bridge: Separar abstracción e implementación

// Implementación: Colores
interface Color {
    public function aplicar(): string;
}

class Rojo implements Color {
    public function aplicar(): string {
        return "rojo";
    }
}

class Azul implements Color {
    public function aplicar(): string {
        return "azul";
    }
}

// Abstracción: Formas
abstract class Forma {
    public function __construct(protected Color $color) {}
    
    abstract public function dibujar(): void;
}

class Circulo extends Forma {
    public function dibujar(): void {
        echo "⭕ Círculo {$this->color->aplicar()}\\n";
    }
}

class Cuadrado extends Forma {
    public function dibujar(): void {
        echo "⬛ Cuadrado {$this->color->aplicar()}\\n";
    }
}

// Uso: Combinar libremente
$circuloRojo = new Circulo(new Rojo());
$circuloRojo->dibujar();

$cuadradoAzul = new Cuadrado(new Azul());
$cuadradoAzul->dibujar();
?&gt;</code></pre></div>

        <h3>Ejemplo Real: Notificaciones Multiplataforma</h3>
        <div class="code-block"><pre><code>&lt;?php
// Sistema de notificaciones con múltiples plataformas y tipos

// Implementación: Plataformas
interface Platform {
    public function send(string $title, string $message): void;
}

class EmailPlatform implements Platform {
    public function send(string $title, string $message): void {
        echo "📧 Email: {$title} - {$message}\\n";
    }
}

class SMSPlatform implements Platform {
    public function send(string $title, string $message): void {
        echo "📱 SMS: {$message}\\n";
    }
}

class PushPlatform implements Platform {
    public function send(string $title, string $message): void {
        echo "🔔 Push: {$title} - {$message}\\n";
    }
}

// Abstracción: Tipos de notificación
abstract class Notification {
    public function __construct(protected Platform $platform) {}
    
    abstract public function notify(string $message): void;
}

class UrgentNotification extends Notification {
    public function notify(string $message): void {
        $this->platform->send("🚨 URGENTE", $message);
    }
}

class InfoNotification extends Notification {
    public function notify(string $message): void {
        $this->platform->send("ℹ️ Info", $message);
    }
}

class WarningNotification extends Notification {
    public function notify(string $message): void {
        $this->platform->send("⚠️ Advertencia", $message);
    }
}

// Uso
$urgentEmail = new UrgentNotification(new EmailPlatform());
$urgentEmail->notify("Servidor caído");

$infoSMS = new InfoNotification(new SMSPlatform());
$infoSMS->notify("Mantenimiento programado");

$warningPush = new WarningNotification(new PushPlatform());
$warningPush->notify("Espacio en disco bajo");
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Ventajas del Bridge:</strong><br>
            • <strong>Desacoplamiento</strong>: Abstracción e implementación independientes<br>
            • <strong>Extensibilidad</strong>: Añade abstracciones o implementaciones sin afectar la otra<br>
            • <strong>OCP</strong>: Abierto a extensión, cerrado a modificación<br>
            • <strong>SRP</strong>: Separa responsabilidades claramente
        </div>

        <div class="warning-box">
            <strong>⚠️ Desventajas:</strong><br>
            • <strong>Complejidad</strong>: Más clases e interfaces<br>
            • <strong>Indirección</strong>: Capa adicional de abstracción
        </div>
    `,
    'patron-composite': `
        <h1>Patrón Composite (Compuesto)</h1>
        
        <p>El <strong>patrón Composite</strong> permite componer objetos en estructuras de árbol para representar jerarquías parte-todo. Permite tratar objetos individuales y composiciones de manera uniforme.</p>

        <div class="info-box">
            <strong>💡 ¿Qué es el Patrón Composite?</strong><br>
            • <strong>Propósito</strong>: Tratar objetos individuales y grupos uniformemente<br>
            • <strong>Problema</strong>: Trabajar con estructuras de árbol complejas<br>
            • <strong>Solución</strong>: Interfaz común para hojas y contenedores<br>
            • <strong>Analogía</strong>: Como carpetas y archivos en un sistema de archivos<br>
            • <strong>Tipo</strong>: Patrón estructural
        </div>

        <h3>Ejemplo Real: Sistema de Archivos</h3>
        <div class="code-block"><pre><code>&lt;?php
// Sistema de archivos con archivos y carpetas

interface FileSystemComponent {
    public function getName(): string;
    public function getSize(): int;
    public function display(int $indent = 0): void;
}

// Hoja: Archivo
class File implements FileSystemComponent {
    public function __construct(
        private string $name,
        private int $size
    ) {}
    
    public function getName(): string {
        return $this->name;
    }
    
    public function getSize(): int {
        return $this->size;
    }
    
    public function display(int $indent = 0): void {
        echo str_repeat("  ", $indent) . "📄 {$this->name} ({$this->size} KB)\\n";
    }
}

// Compuesto: Carpeta
class Folder implements FileSystemComponent {
    private array $children = [];
    
    public function __construct(private string $name) {}
    
    public function add(FileSystemComponent $component): void {
        $this->children[] = $component;
    }
    
    public function remove(FileSystemComponent $component): void {
        $this->children = array_filter(
            $this->children,
            fn($child) => $child !== $component
        );
    }
    
    public function getName(): string {
        return $this->name;
    }
    
    public function getSize(): int {
        return array_reduce(
            $this->children,
            fn($total, $child) => $total + $child->getSize(),
            0
        );
    }
    
    public function display(int $indent = 0): void {
        echo str_repeat("  ", $indent) . "📁 {$this->name} ({$this->getSize()} KB)\\n";
        
        foreach ($this->children as $child) {
            $child->display($indent + 1);
        }
    }
}

// Uso
$root = new Folder("root");

$documents = new Folder("documents");
$documents->add(new File("cv.pdf", 150));
$documents->add(new File("carta.docx", 80));

$photos = new Folder("photos");
$photos->add(new File("vacaciones.jpg", 2500));
$photos->add(new File("familia.png", 1800));

$root->add($documents);
$root->add($photos);
$root->add(new File("readme.txt", 5));

$root->display();
echo "\\nTamaño total: {$root->getSize()} KB\\n";
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Ventajas del Composite:</strong><br>
            • <strong>Uniformidad</strong>: Trata hojas y compuestos igual<br>
            • <strong>Recursividad</strong>: Fácil trabajar con estructuras recursivas<br>
            • <strong>Extensibilidad</strong>: Fácil añadir nuevos tipos de componentes
        </div>
    `,
    'patron-proxy': `
        <h1>Patrón Proxy (Apoderado)</h1>
        
        <p>El <strong>patrón Proxy</strong> proporciona un sustituto o representante de otro objeto para controlar el acceso a él. El proxy actúa como intermediario entre el cliente y el objeto real.</p>

        <div class="info-box">
            <strong>💡 ¿Qué es el Patrón Proxy?</strong><br>
            • <strong>Propósito</strong>: Controlar acceso a un objeto<br>
            • <strong>Problema</strong>: Necesitas funcionalidad adicional al acceder a un objeto<br>
            • <strong>Solución</strong>: Crear un proxy con la misma interfaz<br>
            • <strong>Tipos</strong>: Virtual, Protección, Remoto, Cache<br>
            • <strong>Tipo</strong>: Patrón estructural
        </div>

        <h3>Proxy Virtual (Lazy Loading)</h3>
        <div class="code-block"><pre><code>&lt;?php
// Proxy para cargar imágenes pesadas solo cuando se necesitan

interface Image {
    public function display(): void;
}

// Objeto real (costoso de crear)
class RealImage implements Image {
    public function __construct(private string $filename) {
        $this->loadFromDisk();
    }
    
    private function loadFromDisk(): void {
        echo "📥 Cargando imagen desde disco: {$this->filename}\\n";
        sleep(2); // Simula carga pesada
    }
    
    public function display(): void {
        echo "🖼️ Mostrando imagen: {$this->filename}\\n";
    }
}

// Proxy: Carga lazy
class ImageProxy implements Image {
    private ?RealImage $realImage = null;
    
    public function __construct(private string $filename) {}
    
    public function display(): void {
        // Cargar solo cuando se necesita
        if ($this->realImage === null) {
            $this->realImage = new RealImage($this->filename);
        }
        $this->realImage->display();
    }
}

// Uso
echo "Creando proxies (rápido)...\\n";
$image1 = new ImageProxy("foto1.jpg");
$image2 = new ImageProxy("foto2.jpg");
echo "Proxies creados\\n\\n";

echo "Mostrando imagen 1...\\n";
$image1->display();

echo "\\nMostrando imagen 1 de nuevo (ya cargada)...\\n";
$image1->display();
?&gt;</code></pre></div>

        <h3>Proxy de Protección</h3>
        <div class="code-block"><pre><code>&lt;?php
// Proxy para controlar acceso según permisos

interface Document {
    public function read(): string;
    public function write(string $content): void;
}

class SecretDocument implements Document {
    private string $content = "Información confidencial";
    
    public function read(): string {
        return $this->content;
    }
    
    public function write(string $content): void {
        $this->content = $content;
    }
}

class DocumentProxy implements Document {
    private ?SecretDocument $document = null;
    
    public function __construct(private string $userRole) {}
    
    private function getDocument(): SecretDocument {
        if ($this->document === null) {
            $this->document = new SecretDocument();
        }
        return $this->document;
    }
    
    public function read(): string {
        if ($this->userRole === 'admin' || $this->userRole === 'user') {
            return $this->getDocument()->read();
        }
        throw new Exception("❌ Acceso denegado para lectura");
    }
    
    public function write(string $content): void {
        if ($this->userRole === 'admin') {
            $this->getDocument()->write($content);
            echo "✅ Documento actualizado\\n";
        } else {
            throw new Exception("❌ Acceso denegado para escritura");
        }
    }
}

// Uso
$adminDoc = new DocumentProxy('admin');
echo $adminDoc->read() . "\\n";
$adminDoc->write("Nueva información");

$userDoc = new DocumentProxy('user');
echo $userDoc->read() . "\\n";
try {
    $userDoc->write("Intento de escritura");
} catch (Exception $e) {
    echo $e->getMessage() . "\\n";
}
?&gt;</code></pre></div>

        <h3>Proxy de Cache</h3>
        <div class="code-block"><pre><code>&lt;?php
// Proxy que cachea resultados costosos

interface DataService {
    public function getData(int $id): array;
}

class DatabaseService implements DataService {
    public function getData(int $id): array {
        echo "🗄️ Consultando base de datos...\\n";
        sleep(1); // Simula consulta lenta
        return ['id' => $id, 'name' => "Usuario {$id}"];
    }
}

class CachedDataService implements DataService {
    private array $cache = [];
    
    public function __construct(private DatabaseService $service) {}
    
    public function getData(int $id): array {
        if (isset($this->cache[$id])) {
            echo "💾 Obteniendo de caché\\n";
            return $this->cache[$id];
        }
        
        $data = $this->service->getData($id);
        $this->cache[$id] = $data;
        
        return $data;
    }
}

// Uso
$service = new CachedDataService(new DatabaseService());

echo "Primera llamada:\\n";
$data1 = $service->getData(1);
print_r($data1);

echo "\\nSegunda llamada (desde caché):\\n";
$data2 = $service->getData(1);
print_r($data2);
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Ventajas del Proxy:</strong><br>
            • <strong>Control</strong>: Controla acceso al objeto real<br>
            • <strong>Lazy loading</strong>: Carga objetos costosos solo cuando se necesitan<br>
            • <strong>Seguridad</strong>: Añade capa de protección<br>
            • <strong>Cache</strong>: Mejora rendimiento
        </div>

        <div class="warning-box">
            <strong>⚠️ Desventajas:</strong><br>
            • <strong>Complejidad</strong>: Añade capa adicional<br>
            • <strong>Latencia</strong>: Pequeño overhead
        </div>
    `,
    // ============================================
    // SYMFONY FRAMEWORK
    // ============================================
    
    // 1. Patrones de Diseño de Comportamiento
    'introduccion-patrones-symfony': `
        <h1>Patrones de Comportamiento en Symfony</h1>
        
        <p>Antes de profundizar en cada patrón, es fundamental entender <strong>por qué estudiamos estos patrones específicamente en el contexto de Symfony</strong>. Symfony no es solo un framework, es una arquitectura completa construida sobre principios SOLID y patrones de diseño.</p>

        <div class="info-box">
            <strong>🎯 ¿Por qué estos patrones en Symfony?</strong><br>
            Symfony utiliza extensivamente estos patrones de comportamiento en su núcleo. Entenderlos te permitirá:
            <br><br>
            • <strong>Comprender el código interno</strong> de Symfony<br>
            • <strong>Extender el framework</strong> correctamente<br>
            • <strong>Crear aplicaciones escalables</strong> siguiendo las mejores prácticas<br>
            • <strong>Debuggear eficientemente</strong> conociendo cómo funciona internamente
        </div>

        <h2>🔍 Cómo Symfony Usa Cada Patrón</h2>

        <h3>1. Strategy Pattern</h3>
        <div class="code-block"><pre><code>&lt;?php
// Symfony usa Strategy en múltiples componentes

// 🔹 Security: Diferentes estrategias de autenticación
interface AuthenticationStrategyInterface {
    public function authenticate(Request $request): ?TokenInterface;
}

class FormLoginAuthenticator implements AuthenticationStrategyInterface { }
class JsonLoginAuthenticator implements AuthenticationStrategyInterface { }
class ApiTokenAuthenticator implements AuthenticationStrategyInterface { }

// 🔹 Serializer: Diferentes estrategias de normalización
interface NormalizerInterface {
    public function normalize($object, string $format = null);
}

// 🔹 Cache: Diferentes estrategias de caché
$cache = new FilesystemAdapter();  // Strategy: Filesystem
$cache = new RedisAdapter();       // Strategy: Redis
$cache = new MemcachedAdapter();   // Strategy: Memcached
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Uso Real en Symfony:</strong><br>
            • <strong>Security Component</strong>: Authenticators, Voters<br>
            • <strong>Serializer</strong>: Normalizers, Encoders<br>
            • <strong>Cache</strong>: Adapters (Redis, Filesystem, APCu)<br>
            • <strong>Messenger</strong>: Transports (AMQP, Redis, Doctrine)<br>
            • <strong>Validator</strong>: Constraints (Email, NotBlank, Length)
        </div>

        <h3>2. Observer Pattern (Event Dispatcher)</h3>
        <div class="code-block"><pre><code>&lt;?php
// 🎯 El EventDispatcher de Symfony ES el patrón Observer

use Symfony\\Component\\EventDispatcher\\EventDispatcher;
use Symfony\\Component\\HttpKernel\\Event\\RequestEvent;

// Subject = EventDispatcher
$dispatcher = new EventDispatcher();

// Observers = Event Listeners/Subscribers
class RequestListener {
    public function onKernelRequest(RequestEvent $event): void {
        // Reaccionar al evento
    }
}

$dispatcher->addListener('kernel.request', [new RequestListener(), 'onKernelRequest']);

// Cuando ocurre un evento, TODOS los listeners son notificados
$dispatcher->dispatch($event, 'kernel.request');
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Eventos Clave de Symfony:</strong><br>
            • <strong>kernel.request</strong>: Cuando llega una petición HTTP<br>
            • <strong>kernel.controller</strong>: Antes de ejecutar el controlador<br>
            • <strong>kernel.response</strong>: Antes de enviar la respuesta<br>
            • <strong>kernel.exception</strong>: Cuando ocurre una excepción<br>
            • <strong>console.command</strong>: Al ejecutar comandos CLI<br>
            • <strong>doctrine.post_persist</strong>: Después de guardar entidad
        </div>

        <h3>3. Command Pattern</h3>
        <div class="code-block"><pre><code>&lt;?php
// Symfony usa Command en dos contextos principales

// 🔹 1. Console Commands (CLI)
use Symfony\\Component\\Console\\Command\\Command;

class CreateUserCommand extends Command {
    protected function execute(InputInterface $input, OutputInterface $output): int {
        // Encapsula la acción "crear usuario" como objeto
        $this->userService->createUser(...);
        return Command::SUCCESS;
    }
}

// 🔹 2. Messenger Component (CQRS)
class CreateUserCommand {
    public function __construct(
        public string $email,
        public string $password
    ) {}
}

class CreateUserHandler {
    public function __invoke(CreateUserCommand $command): void {
        // Ejecutar el comando
    }
}

// El bus encola y ejecuta comandos
$messageBus->dispatch(new CreateUserCommand('user@example.com', 'pass'));
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Uso Real en Symfony:</strong><br>
            • <strong>Console Component</strong>: Cada comando CLI es un Command object<br>
            • <strong>Messenger</strong>: CQRS con Commands y Queries<br>
            • <strong>Form Component</strong>: Form handlers encapsulan acciones<br>
            • <strong>Workflow</strong>: Transiciones como comandos
        </div>

        <h3>4. Iterator Pattern</h3>
        <div class="code-block"><pre><code>&lt;?php
// Symfony usa Iterator extensivamente

// 🔹 Doctrine Collections
$users = $userRepository->findAll(); // Retorna Collection (Iterator)

foreach ($users as $user) {
    echo $user->getName();
}

// 🔹 Form Component
foreach ($form->getErrors(true) as $error) {
    echo $error->getMessage();
}

// 🔹 Finder Component
use Symfony\\Component\\Finder\\Finder;

$finder = new Finder();
$finder->files()->in(__DIR__);

foreach ($finder as $file) {
    echo $file->getFilename();
}
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Uso Real en Symfony:</strong><br>
            • <strong>Doctrine Collections</strong>: ArrayCollection, PersistentCollection<br>
            • <strong>Finder</strong>: Iterar archivos y directorios<br>
            • <strong>Form</strong>: Iterar errores y campos<br>
            • <strong>Process</strong>: Iterar output de procesos
        </div>

        <h3>5. State Pattern</h3>
        <div class="code-block"><pre><code>&lt;?php
// Symfony Workflow Component implementa State Pattern

use Symfony\\Component\\Workflow\\WorkflowInterface;

// Estados: draft, review, published
// Transiciones: to_review, publish, reject

$workflow->apply($post, 'to_review');  // draft -> review
$workflow->apply($post, 'publish');    // review -> published

// El comportamiento del objeto cambia según su estado
if ($workflow->can($post, 'publish')) {
    // Solo disponible en estado 'review'
}
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Uso Real en Symfony:</strong><br>
            • <strong>Workflow Component</strong>: Máquinas de estado<br>
            • <strong>Security</strong>: Estados de autenticación<br>
            • <strong>Form</strong>: Estados del formulario (submitted, valid)<br>
            • <strong>HttpFoundation</strong>: Estados de sesión
        </div>

        <h3>6. Template Method Pattern</h3>
        <div class="code-block"><pre><code>&lt;?php
// Symfony usa Template Method en clases abstractas

// 🔹 AbstractController
abstract class AbstractController {
    // Template Method: estructura fija
    public function __invoke(Request $request): Response {
        $this->denyAccessUnlessGranted('ROLE_USER');
        
        $data = $this->getData($request);      // Hook method
        $result = $this->process($data);       // Hook method
        
        return $this->render('template.html.twig', ['result' => $result]);
    }
    
    abstract protected function getData(Request $request): array;
    abstract protected function process(array $data): mixed;
}

// 🔹 Command
abstract class Command {
    public function run(InputInterface $input, OutputInterface $output): int {
        $this->initialize($input, $output);  // Hook
        $this->interact($input, $output);    // Hook
        return $this->execute($input, $output); // Hook (abstract)
    }
}
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Uso Real en Symfony:</strong><br>
            • <strong>AbstractController</strong>: Métodos helper predefinidos<br>
            • <strong>Command</strong>: initialize(), interact(), execute()<br>
            • <strong>Kernel</strong>: boot(), registerBundles()<br>
            • <strong>EventSubscriber</strong>: getSubscribedEvents()
        </div>

        <h3>7. Chain of Responsibility Pattern</h3>
        <div class="code-block"><pre><code>&lt;?php
// Symfony usa Chain of Responsibility en Middleware

// 🔹 HTTP Kernel: Cadena de listeners
Request -> Firewall -> Router -> Controller -> Response

// 🔹 Security: Cadena de voters
class VoterChain {
    public function vote(TokenInterface $token, $subject, array $attributes): int {
        foreach ($this->voters as $voter) {
            $result = $voter->vote($token, $subject, $attributes);
            if ($result !== VoterInterface::ACCESS_ABSTAIN) {
                return $result; // Primer voter que decide, gana
            }
        }
        return VoterInterface::ACCESS_DENIED;
    }
}

// 🔹 Messenger: Cadena de middleware
$messageBus->dispatch($message); // Pasa por múltiples middleware
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Uso Real en Symfony:</strong><br>
            • <strong>HttpKernel</strong>: Event listeners en cadena<br>
            • <strong>Security Voters</strong>: Cadena de decisión de acceso<br>
            • <strong>Messenger Middleware</strong>: Procesar mensajes en cadena<br>
            • <strong>Firewall</strong>: Cadena de autenticadores
        </div>

        <h2>📊 Tabla Resumen: Patrones en Symfony</h2>
        <table style="width:100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
                <tr style="background: #2d3748; color: white;">
                    <th style="padding: 12px; border: 1px solid #4a5568;">Patrón</th>
                    <th style="padding: 12px; border: 1px solid #4a5568;">Componente Symfony</th>
                    <th style="padding: 12px; border: 1px solid #4a5568;">Ejemplo Concreto</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="padding: 10px; border: 1px solid #4a5568;"><strong>Strategy</strong></td>
                    <td style="padding: 10px; border: 1px solid #4a5568;">Security, Cache, Serializer</td>
                    <td style="padding: 10px; border: 1px solid #4a5568;">Authenticators, Cache Adapters</td>
                </tr>
                <tr style="background: #f7fafc;">
                    <td style="padding: 10px; border: 1px solid #4a5568;"><strong>Observer</strong></td>
                    <td style="padding: 10px; border: 1px solid #4a5568;">EventDispatcher</td>
                    <td style="padding: 10px; border: 1px solid #4a5568;">kernel.request, kernel.response</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #4a5568;"><strong>Command</strong></td>
                    <td style="padding: 10px; border: 1px solid #4a5568;">Console, Messenger</td>
                    <td style="padding: 10px; border: 1px solid #4a5568;">bin/console commands, CQRS</td>
                </tr>
                <tr style="background: #f7fafc;">
                    <td style="padding: 10px; border: 1px solid #4a5568;"><strong>Iterator</strong></td>
                    <td style="padding: 10px; border: 1px solid #4a5568;">Doctrine, Finder, Form</td>
                    <td style="padding: 10px; border: 1px solid #4a5568;">Collections, File iteration</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #4a5568;"><strong>State</strong></td>
                    <td style="padding: 10px; border: 1px solid #4a5568;">Workflow</td>
                    <td style="padding: 10px; border: 1px solid #4a5568;">State machines, Form states</td>
                </tr>
                <tr style="background: #f7fafc;">
                    <td style="padding: 10px; border: 1px solid #4a5568;"><strong>Template Method</strong></td>
                    <td style="padding: 10px; border: 1px solid #4a5568;">AbstractController, Command</td>
                    <td style="padding: 10px; border: 1px solid #4a5568;">Controller base, CLI commands</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #4a5568;"><strong>Chain of Resp.</strong></td>
                    <td style="padding: 10px; border: 1px solid #4a5568;">HttpKernel, Security, Messenger</td>
                    <td style="padding: 10px; border: 1px solid #4a5568;">Middleware, Voters, Firewalls</td>
                </tr>
            </tbody>
        </table>

        <div class="warning-box">
            <strong>💡 Importante:</strong><br>
            No necesitas memorizar todo esto ahora. A medida que avances en Symfony, reconocerás estos patrones en acción. Esta introducción es tu mapa mental para entender <strong>por qué</strong> Symfony funciona como funciona.
        </div>

        <h2>🎓 Próximos Pasos</h2>
        <p>Ahora que entiendes el contexto, estudia cada patrón en detalle. Cada sección incluye:</p>
        <ul>
            <li>✅ Explicación del patrón con ejemplos PHP modernos</li>
            <li>✅ Casos de uso reales</li>
            <li>✅ Ventajas y desventajas</li>
            <li>✅ Cuándo usar y cuándo NO usar</li>
            <li>✅ Relación con Symfony (donde aplique)</li>
        </ul>

        <div class="info-box">
            <strong>🚀 Recomendación:</strong><br>
            Lee primero esta introducción, luego estudia cada patrón individualmente. Cuando llegues a los componentes de Symfony, todo tendrá sentido porque ya conocerás los patrones subyacentes.
        </div>
    `,
    'patron-strategy': `
        <h1>Patrón Strategy (Estrategia)</h1>
        
        <p>El <strong>patrón Strategy</strong> define una familia de algoritmos, encapsula cada uno y los hace intercambiables. Permite que el algoritmo varíe independientemente de los clientes que lo usan.</p>

        <div class="info-box">
            <strong>💡 ¿Qué es el Patrón Strategy?</strong><br>
            • <strong>Propósito</strong>: Definir familia de algoritmos intercambiables<br>
            • <strong>Problema</strong>: Múltiples formas de hacer lo mismo (if/else gigantes)<br>
            • <strong>Solución</strong>: Encapsular cada algoritmo en una clase separada<br>
            • <strong>Analogía</strong>: Como elegir método de transporte (auto, bus, bici)<br>
            • <strong>Tipo</strong>: Patrón de comportamiento
        </div>

        <h3>Problema Sin Strategy</h3>
        <div class="code-block"><pre><code>&lt;?php
// ❌ Sin Strategy: Código acoplado con if/else

class PaymentProcessor {
    public function processPayment(string $type, float $amount): void {
        if ($type === 'credit_card') {
            echo "Procesando {$amount}€ con tarjeta de crédito\\n";
            // Lógica específica de tarjeta
        } elseif ($type === 'paypal') {
            echo "Procesando {$amount}€ con PayPal\\n";
            // Lógica específica de PayPal
        } elseif ($type === 'bitcoin') {
            echo "Procesando {$amount}€ con Bitcoin\\n";
            // Lógica específica de Bitcoin
        } else {
            throw new Exception("Método de pago no soportado");
        }
    }
}

// ❌ Problemas:
// - Viola OCP (abierto/cerrado)
// - Difícil de testear
// - Difícil añadir nuevos métodos
// - Código acoplado
?&gt;</code></pre></div>

        <h3>Solución Con Strategy</h3>
        <div class="code-block"><pre><code>&lt;?php
// ✅ Con Strategy: Cada algoritmo es una estrategia

// Interfaz Strategy
interface PaymentStrategy {
    public function pay(float $amount): void;
}

// Estrategias concretas
class CreditCardPayment implements PaymentStrategy {
    public function __construct(
        private string $cardNumber,
        private string $cvv
    ) {}
    
    public function pay(float $amount): void {
        echo "💳 Pagando {$amount}€ con tarjeta ****{$this->getLast4()}\\n";
    }
    
    private function getLast4(): string {
        return substr($this->cardNumber, -4);
    }
}

class PayPalPayment implements PaymentStrategy {
    public function __construct(private string $email) {}
    
    public function pay(float $amount): void {
        echo "🅿️ Pagando {$amount}€ con PayPal ({$this->email})\\n";
    }
}

class BitcoinPayment implements PaymentStrategy {
    public function __construct(private string $walletAddress) {}
    
    public function pay(float $amount): void {
        echo "₿ Pagando {$amount}€ con Bitcoin ({$this->walletAddress})\\n";
    }
}

// Contexto
class ShoppingCart {
    private array $items = [];
    private ?PaymentStrategy $paymentStrategy = null;
    
    public function addItem(string $item, float $price): void {
        $this->items[] = ['item' => $item, 'price' => $price];
    }
    
    public function setPaymentStrategy(PaymentStrategy $strategy): void {
        $this->paymentStrategy = $strategy;
    }
    
    public function checkout(): void {
        if (!$this->paymentStrategy) {
            throw new Exception("Seleccione un método de pago");
        }
        
        $total = array_sum(array_column($this->items, 'price'));
        echo "Total: {$total}€\\n";
        $this->paymentStrategy->pay($total);
    }
}

// Uso
$cart = new ShoppingCart();
$cart->addItem("Laptop", 999.99);
$cart->addItem("Mouse", 29.99);

// Cambiar estrategia dinámicamente
$cart->setPaymentStrategy(new CreditCardPayment("1234567890123456", "123"));
$cart->checkout();

$cart->setPaymentStrategy(new PayPalPayment("user@example.com"));
$cart->checkout();
?&gt;</code></pre></div>

        <h3>Ejemplo Real: Sistema de Envíos</h3>
        <div class="code-block"><pre><code>&lt;?php
// Sistema de cálculo de costos de envío

interface ShippingStrategy {
    public function calculateCost(float $weight, float $distance): float;
}

class StandardShipping implements ShippingStrategy {
    public function calculateCost(float $weight, float $distance): float {
        return $weight * 0.5 + $distance * 0.1;
    }
}

class ExpressShipping implements ShippingStrategy {
    public function calculateCost(float $weight, float $distance): float {
        return ($weight * 0.5 + $distance * 0.1) * 2 + 10; // Doble + tarifa express
    }
}

class InternationalShipping implements ShippingStrategy {
    public function calculateCost(float $weight, float $distance): float {
        return $weight * 1.5 + $distance * 0.3 + 25; // Tarifa internacional
    }
}

class Order {
    public function __construct(
        private float $weight,
        private float $distance,
        private ShippingStrategy $shippingStrategy
    ) {}
    
    public function getShippingCost(): float {
        return $this->shippingStrategy->calculateCost($this->weight, $this->distance);
    }
    
    public function setShippingStrategy(ShippingStrategy $strategy): void {
        $this->shippingStrategy = $strategy;
    }
}

// Uso
$order = new Order(5.0, 100.0, new StandardShipping());
echo "Envío estándar: " . $order->getShippingCost() . "€\\n";

$order->setShippingStrategy(new ExpressShipping());
echo "Envío express: " . $order->getShippingCost() . "€\\n";

$order->setShippingStrategy(new InternationalShipping());
echo "Envío internacional: " . $order->getShippingCost() . "€\\n";
?&gt;</code></pre></div>

        <h3>Ejemplo Real: Compresión de Archivos</h3>
        <div class="code-block"><pre><code>&lt;?php
// Sistema de compresión con diferentes algoritmos

interface CompressionStrategy {
    public function compress(string $data): string;
    public function decompress(string $data): string;
}

class ZipCompression implements CompressionStrategy {
    public function compress(string $data): string {
        echo "🗜️ Comprimiendo con ZIP...\\n";
        return "ZIP:" . gzcompress($data);
    }
    
    public function decompress(string $data): string {
        return gzuncompress(substr($data, 4));
    }
}

class RarCompression implements CompressionStrategy {
    public function compress(string $data): string {
        echo "🗜️ Comprimiendo con RAR...\\n";
        return "RAR:" . base64_encode($data); // Simulado
    }
    
    public function decompress(string $data): string {
        return base64_decode(substr($data, 4));
    }
}

class NoCompression implements CompressionStrategy {
    public function compress(string $data): string {
        echo "📄 Sin compresión\\n";
        return $data;
    }
    
    public function decompress(string $data): string {
        return $data;
    }
}

class FileManager {
    public function __construct(private CompressionStrategy $compression) {}
    
    public function saveFile(string $filename, string $data): void {
        $compressed = $this->compression->compress($data);
        file_put_contents($filename, $compressed);
        echo "✅ Archivo guardado: {$filename}\\n";
    }
    
    public function loadFile(string $filename): string {
        $compressed = file_get_contents($filename);
        return $this->compression->decompress($compressed);
    }
    
    public function setCompression(CompressionStrategy $compression): void {
        $this->compression = $compression;
    }
}

// Uso
$fileManager = new FileManager(new ZipCompression());
$fileManager->saveFile("data.zip", "Contenido muy largo...");

$fileManager->setCompression(new RarCompression());
$fileManager->saveFile("data.rar", "Contenido muy largo...");
?&gt;</code></pre></div>

        <h3>Ejemplo Real: Validación de Datos</h3>
        <div class="code-block"><pre><code>&lt;?php
// Sistema de validación con diferentes estrategias

interface ValidationStrategy {
    public function validate(string $value): bool;
    public function getErrorMessage(): string;
}

class EmailValidation implements ValidationStrategy {
    public function validate(string $value): bool {
        return filter_var($value, FILTER_VALIDATE_EMAIL) !== false;
    }
    
    public function getErrorMessage(): string {
        return "Email inválido";
    }
}

class PhoneValidation implements ValidationStrategy {
    public function validate(string $value): bool {
        return preg_match('/^\\+?[0-9]{9,15}$/', $value) === 1;
    }
    
    public function getErrorMessage(): string {
        return "Teléfono inválido";
    }
}

class PasswordValidation implements ValidationStrategy {
    public function validate(string $value): bool {
        // Mínimo 8 caracteres, 1 mayúscula, 1 número
        return strlen($value) >= 8 
            && preg_match('/[A-Z]/', $value) 
            && preg_match('/[0-9]/', $value);
    }
    
    public function getErrorMessage(): string {
        return "Contraseña debe tener mínimo 8 caracteres, 1 mayúscula y 1 número";
    }
}

class FormField {
    private ?ValidationStrategy $validator = null;
    
    public function __construct(
        private string $name,
        private string $value
    ) {}
    
    public function setValidator(ValidationStrategy $validator): void {
        $this->validator = $validator;
    }
    
    public function isValid(): bool {
        if (!$this->validator) {
            return true;
        }
        
        if (!$this->validator->validate($this->value)) {
            echo "❌ {$this->name}: {$this->validator->getErrorMessage()}\\n";
            return false;
        }
        
        echo "✅ {$this->name}: válido\\n";
        return true;
    }
}

// Uso
$emailField = new FormField("Email", "user@example.com");
$emailField->setValidator(new EmailValidation());
$emailField->isValid();

$phoneField = new FormField("Teléfono", "+34123456789");
$phoneField->setValidator(new PhoneValidation());
$phoneField->isValid();

$passwordField = new FormField("Contraseña", "Pass123");
$passwordField->setValidator(new PasswordValidation());
$passwordField->isValid();
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Ventajas del Strategy:</strong><br>
            • <strong>OCP</strong>: Fácil añadir nuevas estrategias sin modificar código existente<br>
            • <strong>SRP</strong>: Cada estrategia tiene una sola responsabilidad<br>
            • <strong>Testeable</strong>: Fácil testear cada estrategia por separado<br>
            • <strong>Flexible</strong>: Cambiar algoritmo en tiempo de ejecución<br>
            • <strong>Elimina condicionales</strong>: No más if/else gigantes
        </div>

        <div class="warning-box">
            <strong>⚠️ Desventajas:</strong><br>
            • <strong>Más clases</strong>: Una clase por cada estrategia<br>
            • <strong>Cliente debe conocer</strong>: El cliente debe saber qué estrategia usar<br>
            • <strong>Overhead</strong>: Para algoritmos muy simples puede ser excesivo
        </div>

        <div class="info-box">
            <strong>🎯 Cuándo Usar Strategy:</strong><br>
            • Tienes múltiples formas de hacer lo mismo<br>
            • Necesitas cambiar algoritmo en tiempo de ejecución<br>
            • Quieres evitar if/else o switch largos<br>
            • Los algoritmos son independientes del contexto<br>
            <br>
            <strong>⚠️ Cuándo NO Usar:</strong><br>
            • Solo tienes un algoritmo<br>
            • El algoritmo nunca cambia<br>
            • La lógica es muy simple
        </div>

        <h3>Strategy vs State vs Command</h3>
        <div class="code-block"><pre><code>&lt;?php
// Comparación de patrones similares

// STRATEGY: Diferentes formas de hacer LO MISMO
interface SortStrategy {
    public function sort(array $data): array;
}

// STATE: Diferentes comportamientos según ESTADO
interface PlayerState {
    public function play(): void;
    public function pause(): void;
}

// COMMAND: Encapsular ACCIONES como objetos
interface Command {
    public function execute(): void;
    public function undo(): void;
}

// Strategy se enfoca en ALGORITMOS intercambiables
// State se enfoca en COMPORTAMIENTO según estado
// Command se enfoca en ACCIONES como objetos
?&gt;</code></pre></div>
    `,
    'patron-observer': `
        <h1>Patrón Observer (Observador)</h1>
        
        <p>El <strong>patrón Observer</strong> define una dependencia uno-a-muchos entre objetos, de modo que cuando un objeto cambia de estado, todos sus dependientes son notificados y actualizados automáticamente.</p>

        <div class="info-box">
            <strong>💡 ¿Qué es el Patrón Observer?</strong><br>
            • <strong>Propósito</strong>: Notificar cambios a múltiples objetos automáticamente<br>
            • <strong>Problema</strong>: Mantener objetos sincronizados sin acoplamiento<br>
            • <strong>Solución</strong>: Suscripción/notificación (pub/sub)<br>
            • <strong>Analogía</strong>: Como suscribirse a un canal de YouTube<br>
            • <strong>Tipo</strong>: Patrón de comportamiento
        </div>

        <h3>Estructura del Patrón</h3>
        <div class="code-block"><pre><code>&lt;?php
// Estructura básica del Observer

// Subject (Observable)
interface Subject {
    public function attach(Observer $observer): void;
    public function detach(Observer $observer): void;
    public function notify(): void;
}

// Observer
interface Observer {
    public function update(Subject $subject): void;
}
?&gt;</code></pre></div>

        <h3>Ejemplo Real: Sistema de Notificaciones</h3>
        <div class="code-block"><pre><code>&lt;?php
// Sistema de notificaciones cuando cambia el estado de un pedido

interface Observer {
    public function update(string $event, array $data): void;
}

class EmailNotifier implements Observer {
    public function update(string $event, array $data): void {
        echo "📧 Email: Pedido #{$data['orderId']} - {$event}\\n";
    }
}

class SMSNotifier implements Observer {
    public function update(string $event, array $data): void {
        echo "📱 SMS: Pedido #{$data['orderId']} - {$event}\\n";
    }
}

class PushNotifier implements Observer {
    public function update(string $event, array $data): void {
        echo "🔔 Push: Pedido #{$data['orderId']} - {$event}\\n";
    }
}

class LogNotifier implements Observer {
    public function update(string $event, array $data): void {
        echo "📝 Log: [{$event}] Pedido #{$data['orderId']}\\n";
    }
}

// Subject
class Order {
    private array $observers = [];
    private string $status = 'pending';
    
    public function __construct(private int $orderId) {}
    
    public function attach(Observer $observer): void {
        $this->observers[] = $observer;
        echo "✅ Observador añadido\\n";
    }
    
    public function detach(Observer $observer): void {
        $this->observers = array_filter(
            $this->observers,
            fn($obs) => $obs !== $observer
        );
        echo "❌ Observador eliminado\\n";
    }
    
    public function notify(string $event): void {
        $data = [
            'orderId' => $this->orderId,
            'status' => $this->status
        ];
        
        foreach ($this->observers as $observer) {
            $observer->update($event, $data);
        }
    }
    
    public function setStatus(string $status): void {
        $this->status = $status;
        $this->notify("Estado cambiado a: {$status}");
    }
    
    public function ship(): void {
        $this->status = 'shipped';
        $this->notify("Pedido enviado");
    }
    
    public function deliver(): void {
        $this->status = 'delivered';
        $this->notify("Pedido entregado");
    }
}

// Uso
$order = new Order(12345);

$order->attach(new EmailNotifier());
$order->attach(new SMSNotifier());
$order->attach(new PushNotifier());
$order->attach(new LogNotifier());

echo "\\n--- Procesando pedido ---\\n";
$order->setStatus('processing');

echo "\\n--- Enviando pedido ---\\n";
$order->ship();

echo "\\n--- Entregando pedido ---\\n";
$order->deliver();
?&gt;</code></pre></div>

        <h3>Ejemplo Real: Sistema de Eventos</h3>
        <div class="code-block"><pre><code>&lt;?php
// Event Dispatcher similar a Symfony

class Event {
    private bool $propagationStopped = false;
    
    public function __construct(private array $data = []) {}
    
    public function getData(): array {
        return $this->data;
    }
    
    public function stopPropagation(): void {
        $this->propagationStopped = true;
    }
    
    public function isPropagationStopped(): bool {
        return $this->propagationStopped;
    }
}

interface EventListener {
    public function handle(Event $event): void;
}

class EventDispatcher {
    private array $listeners = [];
    
    public function addListener(string $eventName, EventListener $listener, int $priority = 0): void {
        if (!isset($this->listeners[$eventName])) {
            $this->listeners[$eventName] = [];
        }
        
        $this->listeners[$eventName][] = [
            'listener' => $listener,
            'priority' => $priority
        ];
        
        // Ordenar por prioridad
        usort($this->listeners[$eventName], fn($a, $b) => $b['priority'] <=> $a['priority']);
    }
    
    public function dispatch(string $eventName, Event $event): void {
        if (!isset($this->listeners[$eventName])) {
            return;
        }
        
        foreach ($this->listeners[$eventName] as $item) {
            if ($event->isPropagationStopped()) {
                break;
            }
            
            $item['listener']->handle($event);
        }
    }
}

// Listeners concretos
class UserRegisteredEmailListener implements EventListener {
    public function handle(Event $event): void {
        $data = $event->getData();
        echo "📧 Enviando email de bienvenida a {$data['email']}\\n";
    }
}

class UserRegisteredAnalyticsListener implements EventListener {
    public function handle(Event $event): void {
        $data = $event->getData();
        echo "📊 Registrando evento en analytics: {$data['email']}\\n";
    }
}

class UserRegisteredCouponListener implements EventListener {
    public function handle(Event $event): void {
        $data = $event->getData();
        echo "🎁 Generando cupón de bienvenida para {$data['email']}\\n";
    }
}

// Uso
$dispatcher = new EventDispatcher();

$dispatcher->addListener('user.registered', new UserRegisteredEmailListener(), 10);
$dispatcher->addListener('user.registered', new UserRegisteredAnalyticsListener(), 5);
$dispatcher->addListener('user.registered', new UserRegisteredCouponListener(), 1);

echo "--- Usuario registrado ---\\n";
$event = new Event(['email' => 'user@example.com', 'name' => 'Juan']);
$dispatcher->dispatch('user.registered', $event);
?&gt;</code></pre></div>

        <h3>Ejemplo Real: Monitor de Stock</h3>
        <div class="code-block"><pre><code>&lt;?php
// Sistema que notifica cuando el stock cambia

interface StockObserver {
    public function onStockChange(string $product, int $quantity): void;
}

class WarehouseManager implements StockObserver {
    public function onStockChange(string $product, int $quantity): void {
        if ($quantity < 10) {
            echo "⚠️ Almacén: Stock bajo de {$product} ({$quantity} unidades)\\n";
        }
    }
}

class SalesTeam implements StockObserver {
    public function onStockChange(string $product, int $quantity): void {
        if ($quantity === 0) {
            echo "🚫 Ventas: {$product} agotado, pausar promociones\\n";
        }
    }
}

class SupplierNotifier implements StockObserver {
    public function onStockChange(string $product, int $quantity): void {
        if ($quantity < 5) {
            echo "📞 Proveedor: Solicitar reposición de {$product}\\n";
        }
    }
}

class CustomerNotifier implements StockObserver {
    private array $waitingCustomers = [];
    
    public function addWaitingCustomer(string $product, string $email): void {
        $this->waitingCustomers[$product][] = $email;
    }
    
    public function onStockChange(string $product, int $quantity): void {
        if ($quantity > 0 && isset($this->waitingCustomers[$product])) {
            foreach ($this->waitingCustomers[$product] as $email) {
                echo "📧 Cliente: {$product} disponible para {$email}\\n";
            }
            unset($this->waitingCustomers[$product]);
        }
    }
}

class Product {
    private array $observers = [];
    private int $stock;
    
    public function __construct(
        private string $name,
        int $initialStock
    ) {
        $this->stock = $initialStock;
    }
    
    public function attach(StockObserver $observer): void {
        $this->observers[] = $observer;
    }
    
    public function detach(StockObserver $observer): void {
        $this->observers = array_filter(
            $this->observers,
            fn($obs) => $obs !== $observer
        );
    }
    
    private function notifyObservers(): void {
        foreach ($this->observers as $observer) {
            $observer->onStockChange($this->name, $this->stock);
        }
    }
    
    public function sell(int $quantity): void {
        $this->stock -= $quantity;
        echo "💰 Vendidas {$quantity} unidades de {$this->name}\\n";
        $this->notifyObservers();
    }
    
    public function restock(int $quantity): void {
        $this->stock += $quantity;
        echo "📦 Añadidas {$quantity} unidades de {$this->name}\\n";
        $this->notifyObservers();
    }
    
    public function getStock(): int {
        return $this->stock;
    }
}

// Uso
$product = new Product("iPhone 15", 15);

$warehouse = new WarehouseManager();
$sales = new SalesTeam();
$supplier = new SupplierNotifier();
$customers = new CustomerNotifier();

$product->attach($warehouse);
$product->attach($sales);
$product->attach($supplier);
$product->attach($customers);

$customers->addWaitingCustomer("iPhone 15", "cliente1@example.com");
$customers->addWaitingCustomer("iPhone 15", "cliente2@example.com");

echo "\\n--- Vendiendo 10 unidades ---\\n";
$product->sell(10);

echo "\\n--- Vendiendo 5 unidades más ---\\n";
$product->sell(5);

echo "\\n--- Reponiendo stock ---\\n";
$product->restock(20);
?&gt;</code></pre></div>

        <h3>Observer con SplObserver (PHP Nativo)</h3>
        <div class="code-block"><pre><code>&lt;?php
// PHP tiene interfaces nativas para Observer

class User implements SplSubject {
    private SplObjectStorage $observers;
    private string $name;
    private string $email;
    
    public function __construct(string $name, string $email) {
        $this->observers = new SplObjectStorage();
        $this->name = $name;
        $this->email = $email;
    }
    
    public function attach(SplObserver $observer): void {
        $this->observers->attach($observer);
    }
    
    public function detach(SplObserver $observer): void {
        $this->observers->detach($observer);
    }
    
    public function notify(): void {
        foreach ($this->observers as $observer) {
            $observer->update($this);
        }
    }
    
    public function changeEmail(string $newEmail): void {
        $this->email = $newEmail;
        $this->notify();
    }
    
    public function getEmail(): string {
        return $this->email;
    }
    
    public function getName(): string {
        return $this->name;
    }
}

class EmailChangeLogger implements SplObserver {
    public function update(SplSubject $subject): void {
        if ($subject instanceof User) {
            echo "📝 Log: Email de {$subject->getName()} cambió a {$subject->getEmail()}\\n";
        }
    }
}

class SecurityAlert implements SplObserver {
    public function update(SplSubject $subject): void {
        if ($subject instanceof User) {
            echo "🔒 Seguridad: Verificar cambio de email para {$subject->getName()}\\n";
        }
    }
}

// Uso
$user = new User("Juan", "juan@old.com");
$user->attach(new EmailChangeLogger());
$user->attach(new SecurityAlert());

echo "--- Cambiando email ---\\n";
$user->changeEmail("juan@new.com");
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Ventajas del Observer:</strong><br>
            • <strong>Desacoplamiento</strong>: Subject y observers independientes<br>
            • <strong>Extensibilidad</strong>: Fácil añadir nuevos observers<br>
            • <strong>Broadcast</strong>: Notificar a múltiples objetos automáticamente<br>
            • <strong>OCP</strong>: Abierto a extensión sin modificar subject<br>
            • <strong>Dinámico</strong>: Suscribir/desuscribir en tiempo de ejecución
        </div>

        <div class="warning-box">
            <strong>⚠️ Desventajas:</strong><br>
            • <strong>Orden impredecible</strong>: No garantiza orden de notificación<br>
            • <strong>Memory leaks</strong>: Observers no eliminados pueden causar fugas<br>
            • <strong>Performance</strong>: Muchos observers pueden ser costosos<br>
            • <strong>Debugging</strong>: Difícil rastrear flujo de ejecución
        </div>

        <div class="info-box">
            <strong>🎯 Cuándo Usar Observer:</strong><br>
            • Cambio en un objeto requiere cambiar otros<br>
            • No sabes cuántos objetos necesitan ser notificados<br>
            • Quieres desacoplar objetos que se comunican<br>
            • Sistema de eventos o notificaciones<br>
            <br>
            <strong>⚠️ Cuándo NO Usar:</strong><br>
            • Relación simple uno-a-uno<br>
            • Observers tienen dependencias entre sí<br>
            • Performance crítica con muchos observers
        </div>
    `,
    'patron-command': `
        <h1>Patrón Command (Comando)</h1>
        
        <p>El <strong>patrón Command</strong> encapsula una solicitud como un objeto, permitiendo parametrizar clientes con diferentes solicitudes, encolar o registrar solicitudes, y soportar operaciones que se pueden deshacer.</p>

        <div class="info-box">
            <strong>💡 ¿Qué es el Patrón Command?</strong><br>
            • <strong>Propósito</strong>: Encapsular acciones como objetos<br>
            • <strong>Problema</strong>: Necesitas deshacer/rehacer, encolar o registrar operaciones<br>
            • <strong>Solución</strong>: Convertir solicitudes en objetos independientes<br>
            • <strong>Analogía</strong>: Como un control remoto con botones (cada botón es un comando)<br>
            • <strong>Tipo</strong>: Patrón de comportamiento
        </div>

        <h3>Estructura Básica</h3>
        <div class="code-block"><pre><code>&lt;?php
// Estructura del patrón Command

interface Command {
    public function execute(): void;
    public function undo(): void;
}

// Receiver: quien ejecuta la acción real
class Receiver {
    public function action(): void {
        echo "Ejecutando acción\\n";
    }
}

// Comando concreto
class ConcreteCommand implements Command {
    public function __construct(private Receiver $receiver) {}
    
    public function execute(): void {
        $this->receiver->action();
    }
    
    public function undo(): void {
        echo "Deshaciendo acción\\n";
    }
}

// Invoker: quien invoca el comando
class Invoker {
    private ?Command $command = null;
    
    public function setCommand(Command $command): void {
        $this->command = $command;
    }
    
    public function executeCommand(): void {
        $this->command?->execute();
    }
}
?&gt;</code></pre></div>

        <h3>Ejemplo Real: Editor de Texto con Undo/Redo</h3>
        <div class="code-block"><pre><code>&lt;?php
// Editor de texto con historial de comandos

interface Command {
    public function execute(): void;
    public function undo(): void;
}

// Receiver
class TextEditor {
    private string $text = "";
    
    public function write(string $text): void {
        $this->text .= $text;
        echo "📝 Texto: '{$this->text}'\\n";
    }
    
    public function delete(int $length): void {
        $this->text = substr($this->text, 0, -$length);
        echo "🗑️ Texto: '{$this->text}'\\n";
    }
    
    public function getText(): string {
        return $this->text;
    }
}

// Comando: Escribir texto
class WriteCommand implements Command {
    public function __construct(
        private TextEditor $editor,
        private string $text
    ) {}
    
    public function execute(): void {
        $this->editor->write($this->text);
    }
    
    public function undo(): void {
        $this->editor->delete(strlen($this->text));
    }
}

// Comando: Borrar texto
class DeleteCommand implements Command {
    private string $deletedText = "";
    
    public function __construct(
        private TextEditor $editor,
        private int $length
    ) {}
    
    public function execute(): void {
        $this->deletedText = substr($this->editor->getText(), -$this->length);
        $this->editor->delete($this->length);
    }
    
    public function undo(): void {
        $this->editor->write($this->deletedText);
    }
}

// Invoker con historial
class CommandHistory {
    private array $history = [];
    private int $currentIndex = -1;
    
    public function execute(Command $command): void {
        // Eliminar comandos después del índice actual
        $this->history = array_slice($this->history, 0, $this->currentIndex + 1);
        
        $command->execute();
        $this->history[] = $command;
        $this->currentIndex++;
    }
    
    public function undo(): void {
        if ($this->currentIndex >= 0) {
            $this->history[$this->currentIndex]->undo();
            $this->currentIndex--;
            echo "⬅️ Deshacer\\n";
        } else {
            echo "❌ No hay nada que deshacer\\n";
        }
    }
    
    public function redo(): void {
        if ($this->currentIndex < count($this->history) - 1) {
            $this->currentIndex++;
            $this->history[$this->currentIndex]->execute();
            echo "➡️ Rehacer\\n";
        } else {
            echo "❌ No hay nada que rehacer\\n";
        }
    }
}

// Uso
$editor = new TextEditor();
$history = new CommandHistory();

echo "--- Escribiendo ---\\n";
$history->execute(new WriteCommand($editor, "Hola "));
$history->execute(new WriteCommand($editor, "mundo"));

echo "\\n--- Deshaciendo ---\\n";
$history->undo();

echo "\\n--- Rehaciendo ---\\n";
$history->redo();

echo "\\n--- Borrando ---\\n";
$history->execute(new DeleteCommand($editor, 3));

echo "\\n--- Deshaciendo borrado ---\\n";
$history->undo();
?&gt;</code></pre></div>

        <h3>Ejemplo Real: Sistema de Transacciones Bancarias</h3>
        <div class="code-block"><pre><code>&lt;?php
// Sistema bancario con comandos reversibles

interface BankCommand {
    public function execute(): bool;
    public function undo(): bool;
    public function getDescription(): string;
}

class BankAccount {
    public function __construct(
        private string $accountNumber,
        private float $balance
    ) {}
    
    public function deposit(float $amount): void {
        $this->balance += $amount;
        echo "💰 Depósito: +{$amount}€ | Saldo: {$this->balance}€\\n";
    }
    
    public function withdraw(float $amount): bool {
        if ($this->balance >= $amount) {
            $this->balance -= $amount;
            echo "💸 Retiro: -{$amount}€ | Saldo: {$this->balance}€\\n";
            return true;
        }
        echo "❌ Fondos insuficientes\\n";
        return false;
    }
    
    public function getBalance(): float {
        return $this->balance;
    }
    
    public function getAccountNumber(): string {
        return $this->accountNumber;
    }
}

class DepositCommand implements BankCommand {
    public function __construct(
        private BankAccount $account,
        private float $amount
    ) {}
    
    public function execute(): bool {
        $this->account->deposit($this->amount);
        return true;
    }
    
    public function undo(): bool {
        return $this->account->withdraw($this->amount);
    }
    
    public function getDescription(): string {
        return "Depósito de {$this->amount}€";
    }
}

class WithdrawCommand implements BankCommand {
    public function __construct(
        private BankAccount $account,
        private float $amount
    ) {}
    
    public function execute(): bool {
        return $this->account->withdraw($this->amount);
    }
    
    public function undo(): bool {
        $this->account->deposit($this->amount);
        return true;
    }
    
    public function getDescription(): string {
        return "Retiro de {$this->amount}€";
    }
}

class TransferCommand implements BankCommand {
    public function __construct(
        private BankAccount $fromAccount,
        private BankAccount $toAccount,
        private float $amount
    ) {}
    
    public function execute(): bool {
        if ($this->fromAccount->withdraw($this->amount)) {
            $this->toAccount->deposit($this->amount);
            echo "🔄 Transferencia completada\\n";
            return true;
        }
        return false;
    }
    
    public function undo(): bool {
        $this->toAccount->withdraw($this->amount);
        $this->fromAccount->deposit($this->amount);
        echo "↩️ Transferencia revertida\\n";
        return true;
    }
    
    public function getDescription(): string {
        return "Transferencia de {$this->amount}€";
    }
}

class TransactionManager {
    private array $executedCommands = [];
    
    public function executeCommand(BankCommand $command): bool {
        echo "▶️ Ejecutando: {$command->getDescription()}\\n";
        
        if ($command->execute()) {
            $this->executedCommands[] = $command;
            return true;
        }
        
        return false;
    }
    
    public function undoLast(): void {
        if (empty($this->executedCommands)) {
            echo "❌ No hay transacciones para deshacer\\n";
            return;
        }
        
        $command = array_pop($this->executedCommands);
        echo "⬅️ Deshaciendo: {$command->getDescription()}\\n";
        $command->undo();
    }
}

// Uso
$account1 = new BankAccount("ES001", 1000);
$account2 = new BankAccount("ES002", 500);

$manager = new TransactionManager();

echo "--- Transacciones ---\\n";
$manager->executeCommand(new DepositCommand($account1, 200));
$manager->executeCommand(new WithdrawCommand($account1, 100));
$manager->executeCommand(new TransferCommand($account1, $account2, 300));

echo "\\n--- Deshaciendo última transacción ---\\n";
$manager->undoLast();
?&gt;</code></pre></div>

        <h3>Ejemplo Real: Control Remoto (Smart Home)</h3>
        <div class="code-block"><pre><code>&lt;?php
// Sistema de domótica con control remoto

interface Command {
    public function execute(): void;
    public function undo(): void;
}

// Receivers
class Light {
    public function __construct(private string $location) {}
    
    public function on(): void {
        echo "💡 Luz {$this->location} encendida\\n";
    }
    
    public function off(): void {
        echo "🌑 Luz {$this->location} apagada\\n";
    }
}

class Thermostat {
    private int $temperature = 20;
    
    public function setTemperature(int $temp): void {
        $this->temperature = $temp;
        echo "🌡️ Temperatura ajustada a {$temp}°C\\n";
    }
    
    public function getTemperature(): int {
        return $this->temperature;
    }
}

class GarageDoor {
    public function open(): void {
        echo "🚪 Puerta del garaje abierta\\n";
    }
    
    public function close(): void {
        echo "🔒 Puerta del garaje cerrada\\n";
    }
}

// Comandos
class LightOnCommand implements Command {
    public function __construct(private Light $light) {}
    
    public function execute(): void {
        $this->light->on();
    }
    
    public function undo(): void {
        $this->light->off();
    }
}

class LightOffCommand implements Command {
    public function __construct(private Light $light) {}
    
    public function execute(): void {
        $this->light->off();
    }
    
    public function undo(): void {
        $this->light->on();
    }
}

class ThermostatCommand implements Command {
    private int $previousTemp;
    
    public function __construct(
        private Thermostat $thermostat,
        private int $temperature
    ) {}
    
    public function execute(): void {
        $this->previousTemp = $this->thermostat->getTemperature();
        $this->thermostat->setTemperature($this->temperature);
    }
    
    public function undo(): void {
        $this->thermostat->setTemperature($this->previousTemp);
    }
}

class GarageDoorOpenCommand implements Command {
    public function __construct(private GarageDoor $door) {}
    
    public function execute(): void {
        $this->door->open();
    }
    
    public function undo(): void {
        $this->door->close();
    }
}

// Macro Command: ejecuta múltiples comandos
class MacroCommand implements Command {
    public function __construct(private array $commands) {}
    
    public function execute(): void {
        foreach ($this->commands as $command) {
            $command->execute();
        }
    }
    
    public function undo(): void {
        // Deshacer en orden inverso
        foreach (array_reverse($this->commands) as $command) {
            $command->undo();
        }
    }
}

// Control Remoto
class RemoteControl {
    private array $commands = [];
    private array $history = [];
    
    public function setCommand(int $slot, Command $command): void {
        $this->commands[$slot] = $command;
    }
    
    public function pressButton(int $slot): void {
        if (isset($this->commands[$slot])) {
            $this->commands[$slot]->execute();
            $this->history[] = $this->commands[$slot];
        }
    }
    
    public function pressUndo(): void {
        if (!empty($this->history)) {
            $command = array_pop($this->history);
            $command->undo();
        }
    }
}

// Uso
$livingRoomLight = new Light("Sala");
$bedroomLight = new Light("Dormitorio");
$thermostat = new Thermostat();
$garageDoor = new GarageDoor();

$remote = new RemoteControl();

// Configurar botones
$remote->setCommand(0, new LightOnCommand($livingRoomLight));
$remote->setCommand(1, new LightOnCommand($bedroomLight));
$remote->setCommand(2, new ThermostatCommand($thermostat, 24));
$remote->setCommand(3, new GarageDoorOpenCommand($garageDoor));

// Macro: "Modo Noche"
$nightMode = new MacroCommand([
    new LightOffCommand($livingRoomLight),
    new LightOffCommand($bedroomLight),
    new ThermostatCommand($thermostat, 18),
    new GarageDoorOpenCommand($garageDoor)
]);
$remote->setCommand(4, $nightMode);

echo "--- Presionando botones ---\\n";
$remote->pressButton(0);
$remote->pressButton(2);

echo "\\n--- Activando modo noche ---\\n";
$remote->pressButton(4);

echo "\\n--- Deshacer ---\\n";
$remote->pressUndo();
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Ventajas del Command:</strong><br>
            • <strong>Undo/Redo</strong>: Fácil implementar deshacer/rehacer<br>
            • <strong>Desacoplamiento</strong>: Separa quien invoca de quien ejecuta<br>
            • <strong>Composición</strong>: Crear macros combinando comandos<br>
            • <strong>Logging</strong>: Registrar todas las operaciones<br>
            • <strong>Queue</strong>: Encolar comandos para ejecución diferida
        </div>

        <div class="warning-box">
            <strong>⚠️ Desventajas:</strong><br>
            • <strong>Más clases</strong>: Un comando por cada acción<br>
            • <strong>Complejidad</strong>: Puede ser excesivo para operaciones simples<br>
            • <strong>Memoria</strong>: Historial puede consumir mucha memoria
        </div>

        <div class="info-box">
            <strong>🎯 Cuándo Usar Command:</strong><br>
            • Necesitas undo/redo<br>
            • Quieres encolar operaciones<br>
            • Necesitas logging de operaciones<br>
            • Quieres parametrizar objetos con acciones<br>
            • Implementar transacciones<br>
            <br>
            <strong>⚠️ Cuándo NO Usar:</strong><br>
            • Operaciones muy simples<br>
            • No necesitas historial ni undo<br>
            • Performance crítica
        </div>
    `,
    'patron-iterator': `
        <h1>Patrón Iterator (Iterador)</h1>
        
        <p>El <strong>patrón Iterator</strong> proporciona una forma de acceder secuencialmente a los elementos de un objeto agregado sin exponer su representación subyacente.</p>

        <div class="info-box">
            <strong>💡 ¿Qué es el Patrón Iterator?</strong><br>
            • <strong>Propósito</strong>: Recorrer colecciones sin exponer estructura interna<br>
            • <strong>Problema</strong>: Acceder a elementos de diferentes estructuras de datos<br>
            • <strong>Solución</strong>: Interfaz común para recorrer cualquier colección<br>
            • <strong>Analogía</strong>: Como un cursor de base de datos<br>
            • <strong>Tipo</strong>: Patrón de comportamiento
        </div>

        <h3>Iterator Nativo de PHP</h3>
        <div class="code-block"><pre><code>&lt;?php
// PHP tiene interfaz Iterator nativa

class BookCollection implements Iterator {
    private array $books = [];
    private int $position = 0;
    
    public function addBook(string $book): void {
        $this->books[] = $book;
    }
    
    public function current(): mixed {
        return $this->books[$this->position];
    }
    
    public function key(): mixed {
        return $this->position;
    }
    
    public function next(): void {
        $this->position++;
    }
    
    public function rewind(): void {
        $this->position = 0;
    }
    
    public function valid(): bool {
        return isset($this->books[$this->position]);
    }
}

// Uso
$collection = new BookCollection();
$collection->addBook("Clean Code");
$collection->addBook("Design Patterns");
$collection->addBook("Refactoring");

foreach ($collection as $key => $book) {
    echo "{$key}: {$book}\\n";
}
?&gt;</code></pre></div>

        <h3>Ejemplo Real: Iterador Personalizado de Productos</h3>
        <div class="code-block"><pre><code>&lt;?php
// Iterador con filtros y ordenamiento

class Product {
    public function __construct(
        public string $name,
        public float $price,
        public string $category
    ) {}
}

class ProductIterator implements Iterator {
    private int $position = 0;
    
    public function __construct(private array $products) {}
    
    public function current(): Product {
        return $this->products[$this->position];
    }
    
    public function key(): int {
        return $this->position;
    }
    
    public function next(): void {
        $this->position++;
    }
    
    public function rewind(): void {
        $this->position = 0;
    }
    
    public function valid(): bool {
        return isset($this->products[$this->position]);
    }
}

class ProductCollection implements IteratorAggregate {
    private array $products = [];
    
    public function addProduct(Product $product): void {
        $this->products[] = $product;
    }
    
    public function getIterator(): ProductIterator {
        return new ProductIterator($this->products);
    }
    
    public function getByCategory(string $category): ProductIterator {
        $filtered = array_filter(
            $this->products,
            fn($p) => $p->category === $category
        );
        return new ProductIterator(array_values($filtered));
    }
    
    public function getByPriceRange(float $min, float $max): ProductIterator {
        $filtered = array_filter(
            $this->products,
            fn($p) => $p->price >= $min && $p->price <= $max
        );
        return new ProductIterator(array_values($filtered));
    }
}

// Uso
$products = new ProductCollection();
$products->addProduct(new Product("Laptop", 999, "Electronics"));
$products->addProduct(new Product("Mouse", 29, "Electronics"));
$products->addProduct(new Product("Desk", 299, "Furniture"));

echo "--- Todos los productos ---\\n";
foreach ($products as $product) {
    echo "{$product->name}: {$product->price}€\\n";
}

echo "\\n--- Solo electrónicos ---\\n";
foreach ($products->getByCategory("Electronics") as $product) {
    echo "{$product->name}: {$product->price}€\\n";
}
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Ventajas del Iterator:</strong><br>
            • <strong>Encapsulación</strong>: Oculta estructura interna<br>
            • <strong>Múltiples iteradores</strong>: Varios recorridos simultáneos<br>
            • <strong>SRP</strong>: Separa lógica de recorrido de la colección<br>
            • <strong>Polimorfismo</strong>: Interfaz común para diferentes colecciones
        </div>
    `,
    'patron-state': `
        <h1>Patrón State (Estado)</h1>
        
        <p>El <strong>patrón State</strong> permite que un objeto altere su comportamiento cuando su estado interno cambia. El objeto parecerá cambiar de clase.</p>

        <div class="info-box">
            <strong>💡 ¿Qué es el Patrón State?</strong><br>
            • <strong>Propósito</strong>: Cambiar comportamiento según estado interno<br>
            • <strong>Problema</strong>: Múltiples if/else según estado<br>
            • <strong>Solución</strong>: Encapsular cada estado en una clase<br>
            • <strong>Analogía</strong>: Como un reproductor de música (play, pause, stop)<br>
            • <strong>Tipo</strong>: Patrón de comportamiento
        </div>

        <h3>Ejemplo Real: Pedido con Estados</h3>
        <div class="code-block"><pre><code>&lt;?php
// Sistema de pedidos con diferentes estados

interface OrderState {
    public function process(Order $order): void;
    public function ship(Order $order): void;
    public function deliver(Order $order): void;
    public function cancel(Order $order): void;
}

class PendingState implements OrderState {
    public function process(Order $order): void {
        echo "⚙️ Procesando pedido...\n";
        $order->setState(new ProcessingState());
    }
    
    public function ship(Order $order): void {
        echo "❌ No se puede enviar un pedido pendiente\n";
    }
    
    public function deliver(Order $order): void {
        echo "❌ No se puede entregar un pedido pendiente\n";
    }
    
    public function cancel(Order $order): void {
        echo "🚫 Pedido cancelado\n";
        $order->setState(new CancelledState());
    }
}

class ProcessingState implements OrderState {
    public function process(Order $order): void {
        echo "❌ El pedido ya está en proceso\n";
    }
    
    public function ship(Order $order): void {
        echo "📦 Enviando pedido...\n";
        $order->setState(new ShippedState());
    }
    
    public function deliver(Order $order): void {
        echo "❌ No se puede entregar sin enviar primero\n";
    }
    
    public function cancel(Order $order): void {
        echo "🚫 Pedido cancelado\n";
        $order->setState(new CancelledState());
    }
}

class ShippedState implements OrderState {
    public function process(Order $order): void {
        echo "❌ El pedido ya fue procesado\n";
    }
    
    public function ship(Order $order): void {
        echo "❌ El pedido ya fue enviado\n";
    }
    
    public function deliver(Order $order): void {
        echo "✅ Pedido entregado\n";
        $order->setState(new DeliveredState());
    }
    
    public function cancel(Order $order): void {
        echo "❌ No se puede cancelar un pedido enviado\n";
    }
}

class DeliveredState implements OrderState {
    public function process(Order $order): void {
        echo "❌ El pedido ya fue entregado\n";
    }
    
    public function ship(Order $order): void {
        echo "❌ El pedido ya fue entregado\n";
    }
    
    public function deliver(Order $order): void {
        echo "❌ El pedido ya fue entregado\n";
    }
    
    public function cancel(Order $order): void {
        echo "❌ No se puede cancelar un pedido entregado\n";
    }
}

class CancelledState implements OrderState {
    public function process(Order $order): void {
        echo "❌ El pedido está cancelado\n";
    }
    
    public function ship(Order $order): void {
        echo "❌ El pedido está cancelado\n";
    }
    
    public function deliver(Order $order): void {
        echo "❌ El pedido está cancelado\n";
    }
    
    public function cancel(Order $order): void {
        echo "❌ El pedido ya está cancelado\n";
    }
}

class Order {
    private OrderState $state;
    
    public function __construct(private int $id) {
        $this->state = new PendingState();
    }
    
    public function setState(OrderState $state): void {
        $this->state = $state;
    }
    
    public function process(): void {
        $this->state->process($this);
    }
    
    public function ship(): void {
        $this->state->ship($this);
    }
    
    public function deliver(): void {
        $this->state->deliver($this);
    }
    
    public function cancel(): void {
        $this->state->cancel($this);
    }
}

// Uso
$order = new Order(123);
$order->process();
$order->ship();
$order->deliver();
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Ventajas del State:</strong><br>
            • <strong>SRP</strong>: Cada estado en su propia clase<br>
            • <strong>OCP</strong>: Fácil añadir nuevos estados<br>
            • <strong>Elimina condicionales</strong>: No más if/else gigantes<br>
            • <strong>Claridad</strong>: Transiciones de estado explícitas
        </div>
    `,
    'patron-template-method': `
        <h1>Patrón Template Method (Método Plantilla)</h1>
        
        <p>El <strong>patrón Template Method</strong> define el esqueleto de un algoritmo en una operación, delegando algunos pasos a las subclases. Permite que las subclases redefinan ciertos pasos sin cambiar la estructura del algoritmo.</p>

        <div class="info-box">
            <strong>💡 ¿Qué es el Template Method?</strong><br>
            • <strong>Propósito</strong>: Definir estructura de algoritmo, delegar detalles<br>
            • <strong>Problema</strong>: Código duplicado con pequeñas variaciones<br>
            • <strong>Solución</strong>: Método plantilla con pasos abstractos<br>
            • <strong>Analogía</strong>: Como una receta de cocina con pasos variables<br>
            • <strong>Tipo</strong>: Patrón de comportamiento
        </div>

        <h3>Ejemplo Real: Procesamiento de Documentos</h3>
        <div class="code-block"><pre><code>&lt;?php
// Procesador de documentos con template method

abstract class DocumentProcessor {
    // Template Method
    final public function process(): void {
        $this->openDocument();
        $this->parseContent();
        $this->validateData();
        $this->saveToDatabase();
        $this->closeDocument();
        echo "✅ Documento procesado\n";
    }
    
    protected function openDocument(): void {
        echo "📂 Abriendo documento...\n";
    }
    
    // Métodos abstractos que subclases deben implementar
    abstract protected function parseContent(): void;
    abstract protected function validateData(): void;
    
    protected function saveToDatabase(): void {
        echo "💾 Guardando en base de datos...\n";
    }
    
    protected function closeDocument(): void {
        echo "🔒 Cerrando documento\n";
    }
}

class PDFProcessor extends DocumentProcessor {
    protected function parseContent(): void {
        echo "📄 Parseando contenido PDF...\n";
    }
    
    protected function validateData(): void {
        echo "✓ Validando datos PDF\n";
    }
}

class XMLProcessor extends DocumentProcessor {
    protected function parseContent(): void {
        echo "🏷️ Parseando contenido XML...\n";
    }
    
    protected function validateData(): void {
        echo "✓ Validando esquema XML\n";
    }
}

// Uso
$pdfProcessor = new PDFProcessor();
$pdfProcessor->process();

echo "\n";

$xmlProcessor = new XMLProcessor();
$xmlProcessor->process();
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Ventajas del Template Method:</strong><br>
            • <strong>Reutilización</strong>: Código común en clase base<br>
            • <strong>Control</strong>: Estructura del algoritmo fija<br>
            • <strong>DRY</strong>: Evita duplicación de código<br>
            • <strong>Extensibilidad</strong>: Fácil añadir variantes
        </div>
    `,
    'patron-chain-responsibility': `
        <h1>Patrón Chain of Responsibility (Cadena de Responsabilidad)</h1>
        
        <p>El <strong>patrón Chain of Responsibility</strong> evita acoplar el emisor de una solicitud a su receptor, dando a más de un objeto la oportunidad de manejar la solicitud. Encadena los objetos receptores y pasa la solicitud a lo largo de la cadena hasta que un objeto la maneje.</p>

        <div class="info-box">
            <strong>💡 ¿Qué es Chain of Responsibility?</strong><br>
            • <strong>Propósito</strong>: Pasar solicitud por cadena de manejadores<br>
            • <strong>Problema</strong>: Múltiples objetos pueden manejar una solicitud<br>
            • <strong>Solución</strong>: Cadena de manejadores que procesan o pasan<br>
            • <strong>Analogía</strong>: Como escalado de soporte técnico (nivel 1, 2, 3)<br>
            • <strong>Tipo</strong>: Patrón de comportamiento
        </div>

        <h3>Ejemplo Real: Sistema de Autenticación</h3>
        <div class="code-block"><pre><code>&lt;?php
// Middleware de autenticación en cadena

abstract class AuthHandler {
    private ?AuthHandler $next = null;
    
    public function setNext(AuthHandler $handler): AuthHandler {
        $this->next = $handler;
        return $handler;
    }
    
    public function handle(array $request): bool {
        if ($this->check($request)) {
            if ($this->next) {
                return $this->next->handle($request);
            }
            return true;
        }
        return false;
    }
    
    abstract protected function check(array $request): bool;
}

class RateLimitHandler extends AuthHandler {
    protected function check(array $request): bool {
        echo "🚦 Verificando límite de peticiones...\n";
        // Simular verificación
        return true;
    }
}

class AuthenticationHandler extends AuthHandler {
    protected function check(array $request): bool {
        echo "🔐 Verificando credenciales...\n";
        return isset($request['token']) && $request['token'] === 'valid';
    }
}

class AuthorizationHandler extends AuthHandler {
    protected function check(array $request): bool {
        echo "👮 Verificando permisos...\n";
        return isset($request['role']) && $request['role'] === 'admin';
    }
}

class ValidationHandler extends AuthHandler {
    protected function check(array $request): bool {
        echo "✓ Validando datos...\n";
        return !empty($request['data']);
    }
}

// Uso
$rateLimit = new RateLimitHandler();
$auth = new AuthenticationHandler();
$authz = new AuthorizationHandler();
$validation = new ValidationHandler();

$rateLimit->setNext($auth)
          ->setNext($authz)
          ->setNext($validation);

$request = [
    'token' => 'valid',
    'role' => 'admin',
    'data' => ['name' => 'Juan']
];

if ($rateLimit->handle($request)) {
    echo "✅ Solicitud autorizada\n";
} else {
    echo "❌ Solicitud denegada\n";
}
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Ventajas de Chain of Responsibility:</strong><br>
            • <strong>Desacoplamiento</strong>: Emisor no conoce receptor<br>
            • <strong>Flexibilidad</strong>: Cambiar cadena dinámicamente<br>
            • <strong>SRP</strong>: Cada handler una responsabilidad<br>
            • <strong>OCP</strong>: Fácil añadir nuevos handlers
        </div>
    `,
    
    // 2. Fundamentos y Componentes de Symfony
    'arquitectura-kernel-bundles': `
        <h1>Arquitectura del Kernel y Bundles</h1>
        
        <p>El <strong>Kernel</strong> es el corazón de Symfony. Es el componente central que inicializa la aplicación, registra bundles, maneja peticiones HTTP y coordina todos los componentes del framework.</p>

        <div class="info-box">
            <strong>🎯 ¿Qué es el Kernel?</strong><br>
            El Kernel es la clase principal que:<br><br>
            • <strong>Inicializa</strong> la aplicación Symfony<br>
            • <strong>Registra</strong> todos los bundles<br>
            • <strong>Compila</strong> el contenedor de servicios<br>
            • <strong>Maneja</strong> peticiones HTTP y las convierte en respuestas<br>
            • <strong>Gestiona</strong> entornos (dev, prod, test)
        </div>

        <h2>Estructura del Kernel</h2>
        <div class="code-block"><pre><code>&lt;?php
// src/Kernel.php - El Kernel de tu aplicación

namespace App;

use Symfony\\Bundle\\FrameworkBundle\\Kernel\\MicroKernelTrait;
use Symfony\\Component\\HttpKernel\\Kernel as BaseKernel;

class Kernel extends BaseKernel
{
    use MicroKernelTrait;

    // 1. Registrar bundles
    public function registerBundles(): iterable
    {
        $contents = require $this->getProjectDir().'/config/bundles.php';
        
        foreach ($contents as $class => $envs) {
            if ($envs[$this->environment] ?? $envs['all'] ?? false) {
                yield new $class();
            }
        }
    }
    
    // 2. Configurar rutas
    protected function configureRoutes(): void
    {
        $this->import('../config/{routes}/'.$this->environment.'/*.yaml');
        $this->import('../config/{routes}/*.yaml');
    }
    
    // 3. Configurar contenedor
    protected function configureContainer(): void
    {
        $this->import('../config/{packages}/*.yaml');
        $this->import('../config/{packages}/'.$this->environment.'/*.yaml');
        $this->import('../config/{services}.yaml');
    }
}
?&gt;</code></pre></div>

        <h2>Ciclo de Vida del Kernel</h2>
        <div class="code-block"><pre><code>&lt;?php
// public/index.php - Punto de entrada

require_once dirname(__DIR__).'/vendor/autoload_runtime.php';

return function (array $context) {
    // 1. Crear instancia del Kernel
    $kernel = new Kernel($context['APP_ENV'], (bool) $context['APP_DEBUG']);
    
    // 2. Crear Request desde globales PHP
    $request = Request::createFromGlobals();
    
    // 3. Manejar request y obtener response
    $response = $kernel->handle($request);
    
    // 4. Enviar response al navegador
    $response->send();
    
    // 5. Terminar request
    $kernel->terminate($request, $response);
};
?&gt;</code></pre></div>

        <h3>Proceso Interno del Kernel</h3>
        <div class="code-block"><pre><code>&lt;?php
// Proceso simplificado de handle()

class Kernel extends BaseKernel
{
    public function handle(Request $request): Response
    {
        // 1. Boot: Inicializar bundles y contenedor
        if (!$this->booted) {
            $this->boot();
        }
        
        // 2. Dispatch evento kernel.request
        $event = new RequestEvent($this, $request);
        $this->dispatcher->dispatch($event, KernelEvents::REQUEST);
        
        // 3. Resolver controlador
        $controller = $this->resolver->getController($request);
        
        // 4. Dispatch evento kernel.controller
        $event = new ControllerEvent($this, $controller, $request);
        $this->dispatcher->dispatch($event, KernelEvents::CONTROLLER);
        
        // 5. Ejecutar controlador
        $response = $controller($request);
        
        // 6. Dispatch evento kernel.response
        $event = new ResponseEvent($this, $request, $response);
        $this->dispatcher->dispatch($event, KernelEvents::RESPONSE);
        
        // 7. Retornar response
        return $event->getResponse();
    }
}
?&gt;</code></pre></div>

        <h2>¿Qué son los Bundles?</h2>
        <div class="info-box">
            <strong>📦 Bundle</strong><br>
            Un Bundle es un <strong>paquete reutilizable</strong> de código que agrupa funcionalidad relacionada. Es similar a un plugin o módulo en otros frameworks.<br><br>
            • Contiene: Controladores, servicios, configuración, templates, assets<br>
            • Se registra en el Kernel<br>
            • Puede extender otros bundles<br>
            • Puede ser compartido entre proyectos
        </div>

        <h3>Estructura de un Bundle</h3>
        <div class="code-block"><pre><code>src/
└── MyCustomBundle/
    ├── Controller/
    │   └── DefaultController.php
    ├── DependencyInjection/
    │   ├── Configuration.php          # Configuración del bundle
    │   └── MyCustomExtension.php      # Carga servicios
    ├── Resources/
    │   ├── config/
    │   │   └── services.yaml
    │   └── views/
    │       └── default/
    │           └── index.html.twig
    ├── Service/
    │   └── MyService.php
    └── MyCustomBundle.php             # Clase principal del bundle
?&gt;</code></pre></div>

        <h3>Crear un Bundle Personalizado</h3>
        <div class="code-block"><pre><code>&lt;?php
// src/MyCustomBundle/MyCustomBundle.php

namespace App\\MyCustomBundle;

use Symfony\\Component\\HttpKernel\\Bundle\\Bundle;

class MyCustomBundle extends Bundle
{
    // Métodos opcionales para personalizar el bundle
    
    public function boot(): void
    {
        // Ejecutado cuando el bundle se inicializa
        parent::boot();
    }
    
    public function build(ContainerBuilder $container): void
    {
        // Registrar compiler passes, extensiones, etc.
        parent::build($container);
        
        $container->addCompilerPass(new CustomCompilerPass());
    }
}
?&gt;</code></pre></div>

        <h3>Extension: Cargar Configuración</h3>
        <div class="code-block"><pre><code>&lt;?php
// src/MyCustomBundle/DependencyInjection/MyCustomExtension.php

namespace App\\MyCustomBundle\\DependencyInjection;

use Symfony\\Component\\Config\\FileLocator;
use Symfony\\Component\\DependencyInjection\\ContainerBuilder;
use Symfony\\Component\\DependencyInjection\\Extension\\Extension;
use Symfony\\Component\\DependencyInjection\\Loader\\YamlFileLoader;

class MyCustomExtension extends Extension
{
    public function load(array $configs, ContainerBuilder $container): void
    {
        // 1. Procesar configuración
        $configuration = new Configuration();
        $config = $this->processConfiguration($configuration, $configs);
        
        // 2. Registrar parámetros
        $container->setParameter('my_custom.api_key', $config['api_key']);
        
        // 3. Cargar servicios
        $loader = new YamlFileLoader(
            $container,
            new FileLocator(__DIR__.'/../Resources/config')
        );
        $loader->load('services.yaml');
    }
}
?&gt;</code></pre></div>

        <h3>Configuration: Definir Opciones</h3>
        <div class="code-block"><pre><code>&lt;?php
// src/MyCustomBundle/DependencyInjection/Configuration.php

namespace App\\MyCustomBundle\\DependencyInjection;

use Symfony\\Component\\Config\\Definition\\Builder\\TreeBuilder;
use Symfony\\Component\\Config\\Definition\\ConfigurationInterface;

class Configuration implements ConfigurationInterface
{
    public function getConfigTreeBuilder(): TreeBuilder
    {
        $treeBuilder = new TreeBuilder('my_custom');
        
        $treeBuilder->getRootNode()
            ->children()
                ->scalarNode('api_key')
                    ->isRequired()
                    ->cannotBeEmpty()
                ->end()
                ->arrayNode('options')
                    ->children()
                        ->booleanNode('debug')->defaultFalse()->end()
                        ->integerNode('timeout')->defaultValue(30)->end()
                    ->end()
                ->end()
            ->end();
        
        return $treeBuilder;
    }
}
?&gt;</code></pre></div>

        <h2>Bundles Principales de Symfony</h2>
        <div class="code-block"><pre><code>&lt;?php
// config/bundles.php - Bundles registrados

return [
    // Core
    Symfony\\Bundle\\FrameworkBundle\\FrameworkBundle::class => ['all' => true],
    
    // Doctrine ORM
    Doctrine\\Bundle\\DoctrineBundle\\DoctrineBundle::class => ['all' => true],
    Doctrine\\Bundle\\MigrationsBundle\\DoctrineMigrationsBundle::class => ['all' => true],
    
    // Twig
    Symfony\\Bundle\\TwigBundle\\TwigBundle::class => ['all' => true],
    
    // Security
    Symfony\\Bundle\\SecurityBundle\\SecurityBundle::class => ['all' => true],
    
    // Maker (solo dev)
    Symfony\\Bundle\\MakerBundle\\MakerBundle::class => ['dev' => true],
    
    // Debug (solo dev)
    Symfony\\Bundle\\DebugBundle\\DebugBundle::class => ['dev' => true, 'test' => true],
    Symfony\\Bundle\\WebProfilerBundle\\WebProfilerBundle::class => ['dev' => true, 'test' => true],
];
?&gt;</code></pre></div>

        <h2>Entornos del Kernel</h2>
        <div class="code-block"><pre><code>&lt;?php
// Symfony soporta múltiples entornos

// 1. Desarrollo (dev)
$kernel = new Kernel('dev', true);  // debug = true
// - Profiler activo
// - Sin caché de configuración
// - Errores detallados

// 2. Producción (prod)
$kernel = new Kernel('prod', false);  // debug = false
// - Sin profiler
// - Caché optimizado
// - Errores genéricos

// 3. Testing (test)
$kernel = new Kernel('test', true);
// - Base de datos de prueba
// - Sin emails reales
// - Configuración aislada
?&gt;</code></pre></div>

        <h3>Variables de Entorno</h3>
        <div class="code-block"><pre><code># .env - Configuración del entorno

APP_ENV=dev
APP_DEBUG=1
APP_SECRET=your-secret-key

# Cambiar entorno
APP_ENV=prod    # Producción
APP_ENV=test    # Testing
APP_ENV=dev     # Desarrollo
?&gt;</code></pre></div>

        <h2>Ejemplo Práctico: Custom Bundle</h2>
        <div class="code-block"><pre><code>&lt;?php
// Crear un bundle para integración con API externa

namespace App\\PaymentBundle;

use Symfony\\Component\\HttpKernel\\Bundle\\Bundle;

class PaymentBundle extends Bundle
{
    // Bundle para procesar pagos
}

// Extension
class PaymentExtension extends Extension
{
    public function load(array $configs, ContainerBuilder $container): void
    {
        $configuration = new Configuration();
        $config = $this->processConfiguration($configuration, $configs);
        
        // Registrar servicio de pago
        $container->register('payment.processor', PaymentProcessor::class)
            ->setArguments([
                $config['api_key'],
                $config['api_secret'],
                $config['environment']
            ]);
    }
}

// Uso en config/packages/payment.yaml
payment:
    api_key: '%env(PAYMENT_API_KEY)%'
    api_secret: '%env(PAYMENT_API_SECRET)%'
    environment: 'sandbox'
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Ventajas de la Arquitectura Kernel + Bundles:</strong><br>
            • <strong>Modularidad</strong>: Funcionalidad organizada en bundles<br>
            • <strong>Reutilización</strong>: Bundles compartibles entre proyectos<br>
            • <strong>Flexibilidad</strong>: Activar/desactivar bundles por entorno<br>
            • <strong>Extensibilidad</strong>: Fácil extender funcionalidad<br>
            • <strong>Separación</strong>: Cada bundle con su responsabilidad
        </div>

        <div class="warning-box">
            <strong>⚠️ Buenas Prácticas:</strong><br>
            • No crear bundles innecesarios (Symfony Flex prefiere estructura plana)<br>
            • Usar bundles solo para código reutilizable entre proyectos<br>
            • Preferir servicios en src/ para lógica específica de la app<br>
            • Bundles de terceros vía Composer, no manualmente
        </div>

        <div class="info-box">
            <strong>🎯 Resumen:</strong><br>
            • <strong>Kernel</strong>: Corazón de Symfony, maneja todo el ciclo de vida<br>
            • <strong>Bundles</strong>: Paquetes modulares de funcionalidad<br>
            • <strong>Entornos</strong>: dev, prod, test con configuraciones diferentes<br>
            • <strong>MicroKernelTrait</strong>: Simplifica configuración del kernel<br>
            • <strong>Extension</strong>: Carga configuración y servicios del bundle
        </div>
    `,
    'rutas-controladores-http': `
        <h1>Rutas, Controladores y Respuestas HTTP</h1>
        
        <p>El sistema de <strong>routing</strong> de Symfony mapea URLs a controladores. Los <strong>controladores</strong> procesan peticiones y retornan <strong>respuestas HTTP</strong>.</p>

        <h2>Definir Rutas con Atributos PHP 8</h2>
        <div class="code-block"><pre><code>&lt;?php
// src/Controller/ProductController.php

namespace App\\Controller;

use Symfony\\Bundle\\FrameworkBundle\\Controller\\AbstractController;
use Symfony\\Component\\HttpFoundation\\Response;
use Symfony\\Component\\Routing\\Attribute\\Route;

class ProductController extends AbstractController
{
    #[Route('/products', name: 'product_list', methods: ['GET'])]
    public function list(): Response
    {
        return $this->render('product/list.html.twig');
    }
    
    #[Route('/products/{id}', name: 'product_show', requirements: ['id' => '\\d+'])]
    public function show(int $id): Response
    {
        return $this->json(['id' => $id]);
    }
    
    #[Route('/products/new', name: 'product_new', methods: ['GET', 'POST'])]
    public function new(Request $request): Response
    {
        // Crear producto
        return $this->redirectToRoute('product_list');
    }
}
?&gt;</code></pre></div>

        <h2>Tipos de Respuestas</h2>
        <div class="code-block"><pre><code>&lt;?php
use Symfony\\Component\\HttpFoundation\\Response;
use Symfony\\Component\\HttpFoundation\\JsonResponse;
use Symfony\\Component\\HttpFoundation\\RedirectResponse;
use Symfony\\Component\\HttpFoundation\\BinaryFileResponse;

// 1. Response HTML
return new Response('<h1>Hola</h1>');

// 2. Response con Twig
return $this->render('template.html.twig', ['data' => $data]);

// 3. JSON Response
return $this->json(['status' => 'success']);

// 4. Redirect
return $this->redirectToRoute('route_name', ['id' => 123]);

// 5. File Download
return $this->file('/path/to/file.pdf');

// 6. Stream Response
return new StreamedResponse(function() {
    echo 'Streaming...';
});
?&gt;</code></pre></div>

        <h2>Parámetros de Ruta</h2>
        <div class="code-block"><pre><code>&lt;?php
#[Route('/blog/{slug}', name: 'blog_show')]
public function show(string $slug): Response
{
    // $slug automáticamente inyectado
}

// Parámetros opcionales
#[Route('/blog/{page}', name: 'blog_list', defaults: ['page' => 1])]
public function list(int $page): Response { }

// Requisitos (regex)
#[Route('/api/{version}', requirements: ['version' => 'v1|v2'])]
public function api(string $version): Response { }
?&gt;</code></pre></div>
    `,
    'plantillas-twig-extensiones': `
        <h1>Plantillas Twig y sus Extensiones</h1>
        
        <p><strong>Twig</strong> es el motor de plantillas de Symfony. Proporciona sintaxis clara, seguridad (auto-escaping) y extensibilidad.</p>

        <h2>Sintaxis Básica de Twig</h2>
        <div class="code-block"><pre><code>{# templates/product/show.html.twig #}

{% extends 'base.html.twig' %}

{% block title %}{{ product.name }}{% endblock %}

{% block body %}
    <h1>{{ product.name }}</h1>
    <p>Precio: {{ product.price|number_format(2) }}€</p>
    
    {# Condicionales #}
    {% if product.stock > 0 %}
        <span class="available">Disponible</span>
    {% else %}
        <span class="sold-out">Agotado</span>
    {% endif %}
    
    {# Bucles #}
    {% for image in product.images %}
        <img src="{{ image.url }}" alt="{{ image.alt }}">
    {% endfor %}
    
    {# Incluir parciales #}
    {% include 'product/_reviews.html.twig' %}
{% endblock %}
?&gt;</code></pre></div>

        <h2>Filtros de Twig</h2>
        <div class="code-block"><pre><code>{# Filtros comunes #}

{{ name|upper }}                    {# MAYÚSCULAS #}
{{ text|lower }}                    {# minúsculas #}
{{ date|date('Y-m-d') }}           {# Formatear fecha #}
{{ price|number_format(2) }}       {# 1234.56 #}
{{ html|striptags }}               {# Quitar HTML #}
{{ text|truncate(100) }}           {# Truncar texto #}
{{ array|length }}                 {# Longitud #}
{{ value|default('N/A') }}         {# Valor por defecto #}
{{ text|escape }}                  {# Escapar HTML #}
?&gt;</code></pre></div>

        <h2>Crear Extensión Twig Personalizada</h2>
        <div class="code-block"><pre><code>&lt;?php
// src/Twig/AppExtension.php

namespace App\\Twig;

use Twig\\Extension\\AbstractExtension;
use Twig\\TwigFilter;
use Twig\\TwigFunction;

class AppExtension extends AbstractExtension
{
    public function getFilters(): array
    {
        return [
            new TwigFilter('price', [$this, 'formatPrice']),
        ];
    }
    
    public function getFunctions(): array
    {
        return [
            new TwigFunction('area', [$this, 'calculateArea']),
        ];
    }
    
    public function formatPrice(float $price): string
    {
        return number_format($price, 2) . '€';
    }
    
    public function calculateArea(int $width, int $height): int
    {
        return $width * $height;
    }
}

// Uso en Twig:
// {{ product.price|price }}
// {{ area(10, 20) }}
?&gt;</code></pre></div>
    `,
    'inyeccion-dependencias-contenedor': `
        <h1>Inyección de Dependencias y Contenedor de Servicios</h1>
        
        <p>El <strong>Contenedor de Servicios</strong> (Service Container) es el corazón de la inyección de dependencias en Symfony. Gestiona la creación y configuración de objetos.</p>

        <h2>Definir Servicios</h2>
        <div class="code-block"><pre><code>&lt;?php
// src/Service/MailerService.php

namespace App\\Service;

class MailerService
{
    public function __construct(
        private string $from,
        private LoggerInterface $logger
    ) {}
    
    public function send(string $to, string $subject): void
    {
        $this->logger->info("Sending email to {$to}");
        // Lógica de envío
    }
}
?&gt;</code></pre></div>

        <h2>Configurar Servicios (YAML)</h2>
        <div class="code-block"><pre><code># config/services.yaml

services:
    _defaults:
        autowire: true      # Inyección automática
        autoconfigure: true # Auto-configuración

    App\\:
        resource: '../src/'
        exclude:
            - '../src/DependencyInjection/'
            - '../src/Entity/'
            - '../src/Kernel.php'

    # Servicio específico
    App\\Service\\MailerService:
        arguments:
            $from: '%env(MAILER_FROM)%'
?&gt;</code></pre></div>

        <h2>Inyección en Controladores</h2>
        <div class="code-block"><pre><code>&lt;?php
class ProductController extends AbstractController
{
    #[Route('/products')]
    public function list(
        ProductRepository $repository,
        MailerService $mailer
    ): Response {
        $products = $repository->findAll();
        return $this->render('product/list.html.twig', [
            'products' => $products
        ]);
    }
}
?&gt;</code></pre></div>
    `,
    'ciclo-vida-peticion-http': `
        <h1>Ciclo de Vida de una Petición HTTP</h1>
        
        <p>Comprender el <strong>ciclo de vida de una petición</strong> es fundamental para trabajar con Symfony efectivamente.</p>

        <h2>Flujo Completo</h2>
        <div class="code-block"><pre><code>1. Request llega a public/index.php
   ↓
2. Kernel::handle(Request) se ejecuta
   ↓
3. Evento: kernel.request
   - Firewalls de seguridad
   - Locale listener
   ↓
4. Router resuelve la ruta
   ↓
5. Evento: kernel.controller
   - ParamConverter
   - Security voters
   ↓
6. Controller se ejecuta
   ↓
7. Evento: kernel.view (si no hay Response)
   ↓
8. Evento: kernel.response
   - Profiler
   - CORS headers
   ↓
9. Response se envía al cliente
   ↓
10. Evento: kernel.terminate
    - Tareas asíncronas
    - Logging
?&gt;</code></pre></div>

        <h2>Eventos del Kernel</h2>
        <div class="code-block"><pre><code>&lt;?php
use Symfony\\Component\\EventDispatcher\\EventSubscriberInterface;
use Symfony\\Component\\HttpKernel\\Event\\RequestEvent;
use Symfony\\Component\\HttpKernel\\Event\\ResponseEvent;
use Symfony\\Component\\HttpKernel\\KernelEvents;

class RequestSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::REQUEST => 'onKernelRequest',
            KernelEvents::RESPONSE => 'onKernelResponse',
        ];
    }
    
    public function onKernelRequest(RequestEvent $event): void
    {
        $request = $event->getRequest();
        // Modificar request antes del controller
    }
    
    public function onKernelResponse(ResponseEvent $event): void
    {
        $response = $event->getResponse();
        // Modificar response antes de enviar
        $response->headers->set('X-Custom-Header', 'value');
    }
}
?&gt;</code></pre></div>
    `,
    'consola-symfony-bin-console': `
        <h1>Consola de Symfony (bin/console)</h1>
        
        <p>La <strong>consola de Symfony</strong> proporciona comandos CLI para tareas comunes: cache, debug, migraciones, etc.</p>

        <h2>Comandos Esenciales</h2>
        <div class="code-block"><pre><code># Listar todos los comandos
php bin/console list

# Limpiar caché
php bin/console cache:clear

# Ver rutas
php bin/console debug:router

# Ver servicios
php bin/console debug:container

# Ver configuración
php bin/console debug:config framework

# Crear entidad
php bin/console make:entity Product

# Crear controlador
php bin/console make:controller ProductController

# Ejecutar migraciones
php bin/console doctrine:migrations:migrate
?&gt;</code></pre></div>

        <h2>Crear Comando Personalizado</h2>
        <div class="code-block"><pre><code>&lt;?php
// src/Command/SendNewsletterCommand.php

namespace App\\Command;

use Symfony\\Component\\Console\\Attribute\\AsCommand;
use Symfony\\Component\\Console\\Command\\Command;
use Symfony\\Component\\Console\\Input\\InputInterface;
use Symfony\\Component\\Console\\Output\\OutputInterface;
use Symfony\\Component\\Console\\Input\\InputArgument;

#[AsCommand(
    name: 'app:send-newsletter',
    description: 'Envía newsletter a usuarios'
)]
class SendNewsletterCommand extends Command
{
    protected function configure(): void
    {
        $this->addArgument('email', InputArgument::REQUIRED, 'Email del destinatario');
    }
    
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $email = $input->getArgument('email');
        
        $output->writeln("Enviando newsletter a {$email}...");
        
        // Lógica de envío
        
        $output->writeln('<info>Newsletter enviado!</info>');
        
        return Command::SUCCESS;
    }
}

// Ejecutar: php bin/console app:send-newsletter user@example.com
?&gt;</code></pre></div>
    `,
    'configuracion-variables-dotenv': `
        <h1>Configuración y Variables de Entorno (DotEnv)</h1>
        
        <p>Symfony usa archivos <strong>.env</strong> para gestionar configuración sensible y específica del entorno.</p>

        <h2>Archivos de Entorno</h2>
        <div class="code-block"><pre><code># .env - Valores por defecto (commitear)
APP_ENV=dev
APP_SECRET=change-me
DATABASE_URL="mysql://user:pass@127.0.0.1:3306/dbname"

# .env.local - Sobrescribe .env (NO commitear)
DATABASE_URL="mysql://root:@127.0.0.1:3306/mydb_local"

# .env.prod - Producción
APP_ENV=prod
APP_DEBUG=0

# .env.test - Testing
DATABASE_URL="sqlite:///%kernel.project_dir%/var/test.db"
?&gt;</code></pre></div>

        <h2>Usar Variables de Entorno</h2>
        <div class="code-block"><pre><code># config/packages/framework.yaml

framework:
    secret: '%env(APP_SECRET)%'
    
# En servicios
services:
    App\\Service\\ApiClient:
        arguments:
            $apiKey: '%env(API_KEY)%'
            $apiUrl: '%env(API_URL)%'
?&gt;</code></pre></div>

        <h2>Acceder en PHP</h2>
        <div class="code-block"><pre><code>&lt;?php
class ApiClient
{
    public function __construct(
        private string $apiKey,
        private string $apiUrl
    ) {}
}

// O directamente (no recomendado)
$secret = $_ENV['APP_SECRET'];
$secret = getenv('APP_SECRET');
?&gt;</code></pre></div>

        <h2>Procesadores de Variables</h2>
        <div class="code-block"><pre><code># Convertir a base64
APP_SECRET: '%env(base64:SECRET_KEY)%'

# Resolver archivo
CERT_PATH: '%env(file:resolve:CERT_FILE)%'

# JSON decode
API_CONFIG: '%env(json:API_CONFIG_JSON)%'

# Valor por defecto
API_TIMEOUT: '%env(default:api_timeout_default:API_TIMEOUT)%'
?&gt;</code></pre></div>
    `,
    
    // 3. Doctrine ORM
    'mapeo-entidades-repositorios': `
        <h1>Mapeo de Entidades y Repositorios</h1>
        
        <p><strong>Doctrine ORM</strong> es el Object-Relational Mapper de Symfony. Permite trabajar con bases de datos usando objetos PHP en lugar de SQL directo.</p>

        <div class="info-box">
            <strong>🎯 ¿Qué es una Entidad?</strong><br>
            Una <strong>Entidad</strong> es una clase PHP que representa una tabla de base de datos. Cada instancia de la entidad representa una fila.<br><br>
            • Mapeada a tabla con atributos PHP 8<br>
            • Propiedades = columnas<br>
            • Métodos getter/setter para acceso<br>
            • Gestionada por EntityManager
        </div>

        <h2>Crear una Entidad</h2>
        <div class="code-block"><pre><code>&lt;?php
// src/Entity/Product.php

namespace App\\Entity;

use Doctrine\\ORM\\Mapping as ORM;

#[ORM\\Entity(repositoryClass: ProductRepository::class)]
#[ORM\\Table(name: 'products')]
class Product
{
    #[ORM\\Id]
    #[ORM\\GeneratedValue]
    #[ORM\\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\\Column(type: 'string', length: 255)]
    private string $name;

    #[ORM\\Column(type: 'decimal', precision: 10, scale: 2)]
    private float $price;

    #[ORM\\Column(type: 'text', nullable: true)]
    private ?string $description = null;

    #[ORM\\Column(type: 'datetime')]
    private \\DateTimeInterface $createdAt;

    public function __construct()
    {
        $this->createdAt = new \\DateTime();
    }

    // Getters y Setters
    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;
        return $this;
    }

    public function getPrice(): float
    {
        return $this->price;
    }

    public function setPrice(float $price): self
    {
        $this->price = $price;
        return $this;
    }
}
?&gt;</code></pre></div>

        <h2>Tipos de Columnas</h2>
        <div class="code-block"><pre><code>&lt;?php
// Tipos de datos comunes en Doctrine

#[ORM\\Column(type: 'string', length: 255)]        // VARCHAR(255)
private string $name;

#[ORM\\Column(type: 'text')]                       // TEXT
private string $description;

#[ORM\\Column(type: 'integer')]                    // INT
private int $quantity;

#[ORM\\Column(type: 'decimal', precision: 10, scale: 2)]  // DECIMAL(10,2)
private float $price;

#[ORM\\Column(type: 'boolean')]                    // BOOLEAN
private bool $isActive;

#[ORM\\Column(type: 'datetime')]                   // DATETIME
private \\DateTimeInterface $createdAt;

#[ORM\\Column(type: 'json')]                       // JSON
private array $metadata;

#[ORM\\Column(type: 'string', nullable: true)]     // NULL permitido
private ?string $optional = null;
?&gt;</code></pre></div>

        <h2>Repositorios</h2>
        <div class="code-block"><pre><code>&lt;?php
// src/Repository/ProductRepository.php

namespace App\\Repository;

use App\\Entity\\Product;
use Doctrine\\Bundle\\DoctrineBundle\\Repository\\ServiceEntityRepository;
use Doctrine\\Persistence\\ManagerRegistry;

class ProductRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Product::class);
    }

    // Métodos de búsqueda personalizados
    public function findByPriceRange(float $min, float $max): array
    {
        return $this->createQueryBuilder('p')
            ->where('p.price >= :min')
            ->andWhere('p.price <= :max')
            ->setParameter('min', $min)
            ->setParameter('max', $max)
            ->orderBy('p.price', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findActiveProducts(): array
    {
        return $this->createQueryBuilder('p')
            ->where('p.isActive = true')
            ->getQuery()
            ->getResult();
    }
}
?&gt;</code></pre></div>

        <h2>Operaciones CRUD</h2>
        <div class="code-block"><pre><code>&lt;?php
use Doctrine\\ORM\\EntityManagerInterface;

class ProductController extends AbstractController
{
    // CREATE
    #[Route('/product/new')]
    public function new(EntityManagerInterface $em): Response
    {
        $product = new Product();
        $product->setName('Laptop');
        $product->setPrice(999.99);
        
        $em->persist($product);  // Preparar para guardar
        $em->flush();            // Ejecutar INSERT
        
        return $this->json(['id' => $product->getId()]);
    }
    
    // READ
    #[Route('/product/{id}')]
    public function show(Product $product): Response
    {
        // ParamConverter automáticamente busca por ID
        return $this->json([
            'name' => $product->getName(),
            'price' => $product->getPrice()
        ]);
    }
    
    // UPDATE
    #[Route('/product/{id}/edit')]
    public function edit(Product $product, EntityManagerInterface $em): Response
    {
        $product->setPrice(899.99);
        
        // No necesita persist() para entidades ya gestionadas
        $em->flush();  // Ejecutar UPDATE
        
        return $this->json(['success' => true]);
    }
    
    // DELETE
    #[Route('/product/{id}/delete')]
    public function delete(Product $product, EntityManagerInterface $em): Response
    {
        $em->remove($product);  // Marcar para eliminar
        $em->flush();           // Ejecutar DELETE
        
        return $this->json(['success' => true]);
    }
}
?&gt;</code></pre></div>

        <h2>Métodos de Búsqueda del Repositorio</h2>
        <div class="code-block"><pre><code>&lt;?php
// Métodos heredados de EntityRepository

// Buscar por ID
$product = $repository->find(1);

// Buscar uno por criterios
$product = $repository->findOneBy(['name' => 'Laptop']);

// Buscar todos
$products = $repository->findAll();

// Buscar por criterios
$products = $repository->findBy(
    ['isActive' => true],      // Criterios
    ['price' => 'DESC'],       // Orden
    10,                        // Límite
    0                          // Offset
);
?&gt;</code></pre></div>
    `,
    'migraciones-doctrine-migrations': `
        <h1>Migraciones de Base de Datos con Doctrine Migrations</h1>
        
        <p>Las <strong>migraciones</strong> son archivos versionados que modifican el esquema de la base de datos de forma controlada y reversible.</p>

        <h2>Comandos de Migraciones</h2>
        <div class="code-block"><pre><code># Crear migración automática (compara entidades con BD)
php bin/console make:migration

# Ver estado de migraciones
php bin/console doctrine:migrations:status

# Ejecutar migraciones pendientes
php bin/console doctrine:migrations:migrate

# Ejecutar migración específica
php bin/console doctrine:migrations:execute --up 20231119120000

# Revertir última migración
php bin/console doctrine:migrations:migrate prev

# Ver SQL sin ejecutar
php bin/console doctrine:migrations:migrate --dry-run
?&gt;</code></pre></div>

        <h2>Archivo de Migración</h2>
        <div class="code-block"><pre><code>&lt;?php
// migrations/Version20231119120000.php

namespace DoctrineMigrations;

use Doctrine\\DBAL\\Schema\\Schema;
use Doctrine\\Migrations\\AbstractMigration;

final class Version20231119120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Crear tabla products';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE products (
            id INT AUTO_INCREMENT NOT NULL,
            name VARCHAR(255) NOT NULL,
            price NUMERIC(10, 2) NOT NULL,
            created_at DATETIME NOT NULL,
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE products');
    }
}
?&gt;</code></pre></div>

        <h2>Flujo de Trabajo</h2>
        <div class="code-block"><pre><code>1. Modificar entidad (agregar campo)
   ↓
2. php bin/console make:migration
   ↓
3. Revisar archivo de migración generado
   ↓
4. php bin/console doctrine:migrations:migrate
   ↓
5. Cambios aplicados a BD
?&gt;</code></pre></div>
    `,
    'dql-doctrine-query-language': `
        <h1>DQL (Doctrine Query Language)</h1>
        
        <p><strong>DQL</strong> es un lenguaje de consultas orientado a objetos similar a SQL pero que trabaja con entidades en lugar de tablas.</p>

        <h2>Query Builder</h2>
        <div class="code-block"><pre><code>&lt;?php
// Consultas con QueryBuilder (recomendado)

$products = $repository->createQueryBuilder('p')
    ->where('p.price > :price')
    ->setParameter('price', 100)
    ->orderBy('p.name', 'ASC')
    ->setMaxResults(10)
    ->getQuery()
    ->getResult();

// Con JOIN
$products = $repository->createQueryBuilder('p')
    ->leftJoin('p.category', 'c')
    ->addSelect('c')
    ->where('c.name = :category')
    ->setParameter('category', 'Electronics')
    ->getQuery()
    ->getResult();

// Agregaciones
$total = $repository->createQueryBuilder('p')
    ->select('SUM(p.price) as total')
    ->getQuery()
    ->getSingleScalarResult();
?&gt;</code></pre></div>

        <h2>DQL Puro</h2>
        <div class="code-block"><pre><code>&lt;?php
$dql = 'SELECT p FROM App\\Entity\\Product p WHERE p.price > :price';

$query = $em->createQuery($dql);
$query->setParameter('price', 100);
$products = $query->getResult();

// Un solo resultado
$product = $query->getSingleResult();

// Resultado escalar
$count = $query->getSingleScalarResult();
?&gt;</code></pre></div>

        <h2>Métodos de Resultado</h2>
        <div class="code-block"><pre><code>&lt;?php
// Array de objetos
$products = $query->getResult();

// Un solo objeto (lanza excepción si no existe o hay más de uno)
$product = $query->getSingleResult();

// Un solo objeto o null
$product = $query->getOneOrNullResult();

// Valor escalar (para COUNT, SUM, etc.)
$total = $query->getSingleScalarResult();

// Array de arrays (en lugar de objetos)
$data = $query->getArrayResult();
?&gt;</code></pre></div>
    `,
    'relaciones-entidades': `
        <h1>Relaciones entre Entidades</h1>
        
        <p>Doctrine soporta los 4 tipos de relaciones: <strong>OneToOne</strong>, <strong>ManyToOne</strong>, <strong>OneToMany</strong> y <strong>ManyToMany</strong>.</p>

        <h2>ManyToOne / OneToMany</h2>
        <div class="code-block"><pre><code>&lt;?php
// Product (Many) -> Category (One)
class Product
{
    #[ORM\\ManyToOne(targetEntity: Category::class, inversedBy: 'products')]
    #[ORM\\JoinColumn(nullable: false)]
    private Category $category;

    public function getCategory(): Category
    {
        return $this->category;
    }

    public function setCategory(Category $category): self
    {
        $this->category = $category;
        return $this;
    }
}

// Category (One) -> Products (Many)
class Category
{
    #[ORM\\OneToMany(targetEntity: Product::class, mappedBy: 'category')]
    private Collection $products;

    public function __construct()
    {
        $this->products = new ArrayCollection();
    }

    public function getProducts(): Collection
    {
        return $this->products;
    }

    public function addProduct(Product $product): self
    {
        if (!$this->products->contains($product)) {
            $this->products[] = $product;
            $product->setCategory($this);
        }
        return $this;
    }
}
?&gt;</code></pre></div>

        <h2>ManyToMany</h2>
        <div class="code-block"><pre><code>&lt;?php
// Product <-> Tag (muchos a muchos)
class Product
{
    #[ORM\\ManyToMany(targetEntity: Tag::class, inversedBy: 'products')]
    #[ORM\\JoinTable(name: 'product_tags')]
    private Collection $tags;

    public function __construct()
    {
        $this->tags = new ArrayCollection();
    }

    public function addTag(Tag $tag): self
    {
        if (!$this->tags->contains($tag)) {
            $this->tags[] = $tag;
        }
        return $this;
    }
}

class Tag
{
    #[ORM\\ManyToMany(targetEntity: Product::class, mappedBy: 'tags')]
    private Collection $products;
}
?&gt;</code></pre></div>

        <h2>OneToOne</h2>
        <div class="code-block"><pre><code>&lt;?php
// User <-> Profile (uno a uno)
class User
{
    #[ORM\\OneToOne(targetEntity: Profile::class, cascade: ['persist', 'remove'])]
    private Profile $profile;
}

class Profile
{
    #[ORM\\OneToOne(targetEntity: User::class, mappedBy: 'profile')]
    private User $user;
}
?&gt;</code></pre></div>
    `,
    'eventos-doctrine-lifecycle': `
        <h1>Eventos de Doctrine (Lifecycle Callbacks)</h1>
        
        <p>Los <strong>eventos de ciclo de vida</strong> permiten ejecutar código automáticamente cuando ocurren ciertos eventos en las entidades.</p>

        <h2>Lifecycle Callbacks en la Entidad</h2>
        <div class="code-block"><pre><code>&lt;?php
use Doctrine\\ORM\\Mapping as ORM;

#[ORM\\Entity]
#[ORM\\HasLifecycleCallbacks]
class Product
{
    #[ORM\\Column(type: 'datetime')]
    private \\DateTimeInterface $createdAt;

    #[ORM\\Column(type: 'datetime')]
    private \\DateTimeInterface $updatedAt;

    #[ORM\\PrePersist]
    public function setCreatedAtValue(): void
    {
        $this->createdAt = new \\DateTime();
        $this->updatedAt = new \\DateTime();
    }

    #[ORM\\PreUpdate]
    public function setUpdatedAtValue(): void
    {
        $this->updatedAt = new \\DateTime();
    }
}
?&gt;</code></pre></div>

        <h2>Entity Listener</h2>
        <div class="code-block"><pre><code>&lt;?php
// src/EventListener/ProductListener.php

namespace App\\EventListener;

use App\\Entity\\Product;
use Doctrine\\ORM\\Event\\PrePersistEventArgs;
use Doctrine\\ORM\\Event\\PreUpdateEventArgs;

class ProductListener
{
    public function prePersist(Product $product, PrePersistEventArgs $args): void
    {
        // Lógica antes de INSERT
    }

    public function preUpdate(Product $product, PreUpdateEventArgs $args): void
    {
        // Lógica antes de UPDATE
    }
}

// config/services.yaml
services:
    App\\EventListener\\ProductListener:
        tags:
            - { name: doctrine.orm.entity_listener, event: prePersist, entity: App\\Entity\\Product }
            - { name: doctrine.orm.entity_listener, event: preUpdate, entity: App\\Entity\\Product }
?&gt;</code></pre></div>

        <h2>Eventos Disponibles</h2>
        <div class="code-block"><pre><code>prePersist    - Antes de INSERT
postPersist   - Después de INSERT

preUpdate     - Antes de UPDATE
postUpdate    - Después de UPDATE

preRemove     - Antes de DELETE
postRemove    - Después de DELETE

postLoad      - Después de cargar desde BD
?&gt;</code></pre></div>
    `,
    'fixtures-datos-doctrinefixtures': `
        <h1>Fixtures de Datos con DoctrineFixturesBundle</h1>
        
        <p>Los <strong>fixtures</strong> son datos de prueba que se cargan en la base de datos para desarrollo y testing.</p>

        <h2>Instalar Fixtures</h2>
        <div class="code-block"><pre><code>composer require --dev orm-fixtures
?&gt;</code></pre></div>

        <h2>Crear Fixture</h2>
        <div class="code-block"><pre><code>&lt;?php
// src/DataFixtures/ProductFixtures.php

namespace App\\DataFixtures;

use App\\Entity\\Product;
use Doctrine\\Bundle\\FixturesBundle\\Fixture;
use Doctrine\\Persistence\\ObjectManager;

class ProductFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        // Crear 10 productos
        for ($i = 1; $i <= 10; $i++) {
            $product = new Product();
            $product->setName('Product ' . $i);
            $product->setPrice(rand(10, 1000));
            $product->setDescription('Description for product ' . $i);
            
            $manager->persist($product);
        }

        $manager->flush();
    }
}
?&gt;</code></pre></div>

        <h2>Cargar Fixtures</h2>
        <div class="code-block"><pre><code># Cargar todos los fixtures (BORRA datos existentes)
php bin/console doctrine:fixtures:load

# Agregar sin borrar (append)
php bin/console doctrine:fixtures:load --append

# Cargar fixture específico
php bin/console doctrine:fixtures:load --group=dev
?&gt;</code></pre></div>

        <h2>Fixtures con Relaciones</h2>
        <div class="code-block"><pre><code>&lt;?php
use Doctrine\\Common\\DataFixtures\\DependentFixtureInterface;

class ProductFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        $product = new Product();
        $product->setName('Laptop');
        
        // Obtener referencia de otro fixture
        $category = $this->getReference('category-electronics');
        $product->setCategory($category);
        
        $manager->persist($product);
        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [CategoryFixtures::class];
    }
}

class CategoryFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $category = new Category();
        $category->setName('Electronics');
        
        $manager->persist($category);
        $manager->flush();
        
        // Guardar referencia para otros fixtures
        $this->addReference('category-electronics', $category);
    }
}
?&gt;</code></pre></div>
    `,
    'caching-consultas-resultados': `
        <h1>Caching de Consultas y Resultados</h1>
        
        <p>Doctrine proporciona <strong>caché de consultas</strong> y <strong>caché de resultados</strong> para mejorar el rendimiento.</p>

        <h2>Configurar Caché</h2>
        <div class="code-block"><pre><code># config/packages/doctrine.yaml

doctrine:
    orm:
        metadata_cache_driver:
            type: pool
            pool: doctrine.system_cache_pool
        query_cache_driver:
            type: pool
            pool: doctrine.query_cache_pool
        result_cache_driver:
            type: pool
            pool: doctrine.result_cache_pool

framework:
    cache:
        pools:
            doctrine.result_cache_pool:
                adapter: cache.app
            doctrine.system_cache_pool:
                adapter: cache.system
            doctrine.query_cache_pool:
                adapter: cache.app
?&gt;</code></pre></div>

        <h2>Usar Caché de Resultados</h2>
        <div class="code-block"><pre><code>&lt;?php
// Cachear resultado de consulta
$query = $repository->createQueryBuilder('p')
    ->where('p.isActive = true')
    ->getQuery()
    ->useResultCache(true, 3600, 'active_products_cache'); // TTL: 1 hora

$products = $query->getResult();

// Invalidar caché
$cache = $em->getConfiguration()->getResultCache();
$cache->delete('active_products_cache');
?&gt;</code></pre></div>

        <h2>Second Level Cache</h2>
        <div class="code-block"><pre><code>&lt;?php
// Habilitar en entidad
#[ORM\\Entity]
#[ORM\\Cache(usage: 'NONSTRICT_READ_WRITE', region: 'product_cache')]
class Product
{
    // ...
}

// Configuración
doctrine:
    orm:
        second_level_cache:
            enabled: true
            region_cache_driver:
                type: pool
                pool: doctrine.second_level_cache_pool
?&gt;</code></pre></div>

        <div class="warning-box">
            <strong>⚠️ Importante:</strong><br>
            • El caché puede causar datos obsoletos<br>
            • Usar TTL apropiado según caso de uso<br>
            • Invalidar caché cuando datos cambian<br>
            • Monitorear uso de memoria
        </div>
    `,
    
    // 4. Formas y Validaciones
    'creacion-formularios-form': `
        <h1>Creación de Formularios con el Componente Form</h1>
        
        <p>El <strong>componente Form</strong> de Symfony es uno de los más potentes del framework. Permite crear, renderizar y procesar formularios de manera declarativa, con validación automática y protección CSRF integrada.</p>

        <div class="info-box">
            <strong>🎯 ¿Por qué usar el Componente Form?</strong><br>
            • <strong>Abstracción</strong>: Define formularios en PHP, no HTML<br>
            • <strong>Validación automática</strong>: Integración con el componente Validator<br>
            • <strong>Reutilización</strong>: Formularios como clases reutilizables<br>
            • <strong>Seguridad</strong>: Protección CSRF automática<br>
            • <strong>Mapeo automático</strong>: De request a entidades<br>
            • <strong>Temas personalizables</strong>: Control total del HTML generado
        </div>

        <h2>Instalación</h2>
        <div class="code-block"><pre><code>composer require symfony/form
composer require symfony/validator
composer require symfony/twig-bundle
?></code></pre></div>

        <h2>Crear un Formulario Simple</h2>
        <div class="code-block"><pre><code>&lt;?php
// src/Form/ProductType.php

namespace App\\Form;

use App\\Entity\\Product;
use Symfony\\Component\\Form\\AbstractType;
use Symfony\\Component\\Form\\Extension\\Core\\Type\\TextType;
use Symfony\\Component\\Form\\Extension\\Core\\Type\\NumberType;
use Symfony\\Component\\Form\\Extension\\Core\\Type\\TextareaType;
use Symfony\\Component\\Form\\Extension\\Core\\Type\\SubmitType;
use Symfony\\Component\\Form\\FormBuilderInterface;
use Symfony\\Component\\OptionsResolver\\OptionsResolver;

class ProductType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('name', TextType::class, [
                'label' => 'Nombre del Producto',
                'attr' => [
                    'placeholder' => 'Ingrese el nombre',
                    'class' => 'form-control'
                ],
                'required' => true
            ])
            ->add('price', NumberType::class, [
                'label' => 'Precio',
                'scale' => 2,
                'attr' => ['class' => 'form-control']
            ])
            ->add('description', TextareaType::class, [
                'label' => 'Descripción',
                'required' => false,
                'attr' => [
                    'rows' => 5,
                    'class' => 'form-control'
                ]
            ])
            ->add('save', SubmitType::class, [
                'label' => 'Guardar Producto',
                'attr' => ['class' => 'btn btn-primary']
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Product::class,
        ]);
    }
}
?></code></pre></div>

        <h2>Usar el Formulario en un Controlador</h2>
        <div class="code-block"><pre><code>&lt;?php
// src/Controller/ProductController.php

namespace App\\Controller;

use App\\Entity\\Product;
use App\\Form\\ProductType;
use Doctrine\\ORM\\EntityManagerInterface;
use Symfony\\Bundle\\FrameworkBundle\\Controller\\AbstractController;
use Symfony\\Component\\HttpFoundation\\Request;
use Symfony\\Component\\HttpFoundation\\Response;
use Symfony\\Component\\Routing\\Attribute\\Route;

class ProductController extends AbstractController
{
    #[Route('/product/new', name: 'product_new')]
    public function new(Request $request, EntityManagerInterface $em): Response
    {
        // 1. Crear instancia de la entidad
        $product = new Product();
        
        // 2. Crear el formulario
        $form = $this->createForm(ProductType::class, $product);
        
        // 3. Manejar el request
        $form->handleRequest($request);
        
        // 4. Verificar si el formulario fue enviado y es válido
        if ($form->isSubmitted() && $form->isValid()) {
            // $product ahora contiene los datos del formulario
            
            // 5. Guardar en base de datos
            $em->persist($product);
            $em->flush();
            
            // 6. Mensaje flash y redirección
            $this->addFlash('success', 'Producto creado exitosamente!');
            
            return $this->redirectToRoute('product_list');
        }
        
        // 7. Renderizar template con el formulario
        return $this->render('product/new.html.twig', [
            'form' => $form->createView(),
        ]);
    }
}
?></code></pre></div>

        <h2>Editar una Entidad Existente</h2>
        <div class="code-block"><pre><code>&lt;?php
#[Route('/product/{id}/edit', name: 'product_edit')]
public function edit(
    Product $product, 
    Request $request, 
    EntityManagerInterface $em
): Response {
    // El formulario se crea con la entidad existente
    $form = $this->createForm(ProductType::class, $product);
    
    $form->handleRequest($request);
    
    if ($form->isSubmitted() && $form->isValid()) {
        // No necesita persist() porque la entidad ya está gestionada
        $em->flush();
        
        $this->addFlash('success', 'Producto actualizado!');
        
        return $this->redirectToRoute('product_show', [
            'id' => $product->getId()
        ]);
    }
    
    return $this->render('product/edit.html.twig', [
        'form' => $form->createView(),
        'product' => $product,
    ]);
}
?></code></pre></div>

        <h2>Formulario sin Entidad (DTO)</h2>
        <div class="code-block"><pre><code>&lt;?php
// Para formularios que no mapean directamente a una entidad

class ContactType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('name', TextType::class)
            ->add('email', EmailType::class)
            ->add('subject', TextType::class)
            ->add('message', TextareaType::class)
            ->add('send', SubmitType::class);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        // Sin data_class, devuelve array asociativo
        $resolver->setDefaults([]);
    }
}

// En el controlador
#[Route('/contact', name: 'contact')]
public function contact(Request $request): Response
{
    $form = $this->createForm(ContactType::class);
    
    $form->handleRequest($request);
    
    if ($form->isSubmitted() && $form->isValid()) {
        // Obtener datos como array
        $data = $form->getData();
        
        // $data = [
        //     'name' => 'John Doe',
        //     'email' => 'john@example.com',
        //     'subject' => 'Consulta',
        //     'message' => 'Hola...'
        // ]
        
        // Procesar datos (enviar email, etc.)
        
        return $this->redirectToRoute('contact_success');
    }
    
    return $this->render('contact/index.html.twig', [
        'form' => $form->createView(),
    ]);
}
?></code></pre></div>

        <h2>Crear Formulario Directamente en el Controlador</h2>
        <div class="code-block"><pre><code>&lt;?php
// Para formularios simples, sin crear clase FormType

#[Route('/search', name: 'product_search')]
public function search(Request $request): Response
{
    $form = $this->createFormBuilder()
        ->add('query', TextType::class, [
            'label' => 'Buscar',
            'required' => false
        ])
        ->add('category', ChoiceType::class, [
            'choices' => [
                'Electrónica' => 'electronics',
                'Ropa' => 'clothing',
                'Libros' => 'books',
            ],
            'required' => false
        ])
        ->add('search', SubmitType::class, ['label' => 'Buscar'])
        ->getForm();
    
    $form->handleRequest($request);
    
    if ($form->isSubmitted() && $form->isValid()) {
        $data = $form->getData();
        
        // Realizar búsqueda con $data['query'] y $data['category']
    }
    
    return $this->render('product/search.html.twig', [
        'form' => $form->createView(),
    ]);
}
?></code></pre></div>

        <h2>Validación con Constraints</h2>
        <div class="code-block"><pre><code>&lt;?php
use Symfony\\Component\\Validator\\Constraints as Assert;

class ProductType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('name', TextType::class, [
                'constraints' => [
                    new Assert\\NotBlank([
                        'message' => 'El nombre no puede estar vacío'
                    ]),
                    new Assert\\Length([
                        'min' => 3,
                        'max' => 255,
                        'minMessage' => 'El nombre debe tener al menos {{ limit }} caracteres',
                        'maxMessage' => 'El nombre no puede exceder {{ limit }} caracteres',
                    ]),
                ],
            ])
            ->add('price', NumberType::class, [
                'constraints' => [
                    new Assert\\NotBlank(),
                    new Assert\\Positive([
                        'message' => 'El precio debe ser positivo'
                    ]),
                    new Assert\\LessThan([
                        'value' => 10000,
                        'message' => 'El precio no puede exceder {{ compared_value }}'
                    ]),
                ],
            ])
            ->add('email', EmailType::class, [
                'constraints' => [
                    new Assert\\Email([
                        'message' => 'El email {{ value }} no es válido',
                    ]),
                ],
            ]);
    }
}
?></code></pre></div>

        <h2>Opciones Comunes de Campos</h2>
        <div class="code-block"><pre><code>&lt;?php
$builder->add('fieldName', TextType::class, [
    // Etiqueta del campo
    'label' => 'Nombre del Campo',
    
    // Campo requerido
    'required' => true,
    
    // Valor por defecto
    'data' => 'Valor inicial',
    
    // Atributos HTML
    'attr' => [
        'class' => 'form-control',
        'placeholder' => 'Ingrese valor',
        'maxlength' => 100,
    ],
    
    // Atributos del label
    'label_attr' => [
        'class' => 'form-label'
    ],
    
    // Ayuda/descripción
    'help' => 'Texto de ayuda para el usuario',
    
    // Deshabilitar campo
    'disabled' => false,
    
    // Mapear a propiedad diferente
    'property_path' => 'differentProperty',
    
    // No mapear a ninguna propiedad
    'mapped' => false,
]);
?></code></pre></div>

        <h2>Eventos de Formulario</h2>
        <div class="code-block"><pre><code>&lt;?php
use Symfony\\Component\\Form\\FormEvent;
use Symfony\\Component\\Form\\FormEvents;

class ProductType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder->add('name', TextType::class);
        
        // PRE_SET_DATA: Antes de poblar el formulario con datos
        $builder->addEventListener(FormEvents::PRE_SET_DATA, function (FormEvent $event) {
            $product = $event->getData();
            $form = $event->getForm();
            
            // Agregar campos dinámicamente según los datos
            if ($product && $product->getId()) {
                $form->add('updatedAt', DateTimeType::class, [
                    'disabled' => true
                ]);
            }
        });
        
        // PRE_SUBMIT: Antes de vincular datos del request
        $builder->addEventListener(FormEvents::PRE_SUBMIT, function (FormEvent $event) {
            $data = $event->getData();
            
            // Modificar datos antes de vincular
            if (isset($data['name'])) {
                $data['name'] = strtoupper($data['name']);
                $event->setData($data);
            }
        });
        
        // POST_SUBMIT: Después de vincular y validar
        $builder->addEventListener(FormEvents::POST_SUBMIT, function (FormEvent $event) {
            $product = $event->getData();
            
            // Lógica adicional después de validación
        });
    }
}
?></code></pre></div>

        <h2>Formularios Anidados</h2>
        <div class="code-block"><pre><code>&lt;?php
// Formulario para entidad con relación

class OrderType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('orderNumber', TextType::class)
            ->add('customer', CustomerType::class)  // Formulario anidado
            ->add('items', CollectionType::class, [
                'entry_type' => OrderItemType::class,
                'allow_add' => true,
                'allow_delete' => true,
                'by_reference' => false,
            ]);
    }
}

class CustomerType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('name', TextType::class)
            ->add('email', EmailType::class)
            ->add('phone', TelType::class);
    }
}
?></code></pre></div>

        <div class="success-box">
            <strong>✅ Ventajas del Componente Form:</strong><br>
            • <strong>Productividad</strong>: Menos código HTML manual<br>
            • <strong>Mantenibilidad</strong>: Formularios centralizados y reutilizables<br>
            • <strong>Validación</strong>: Integrada y automática<br>
            • <strong>Seguridad</strong>: CSRF, XSS protection automática<br>
            • <strong>Flexibilidad</strong>: Eventos, extensiones, temas personalizados
        </div>

        <div class="warning-box">
            <strong>⚠️ Buenas Prácticas:</strong><br>
            • Crear clases FormType para formularios reutilizables<br>
            • Usar FormBuilder solo para formularios muy simples<br>
            • Validar en la entidad con atributos, no solo en el formulario<br>
            • Usar eventos para lógica dinámica compleja<br>
            • Separar lógica de negocio del formulario
        </div>

        <div class="info-box">
            <strong>🎯 Resumen:</strong><br>
            • <strong>FormType</strong>: Clase que define estructura del formulario<br>
            • <strong>buildForm()</strong>: Método donde se agregan campos<br>
            • <strong>handleRequest()</strong>: Procesa datos del request<br>
            • <strong>isSubmitted()</strong>: Verifica si formulario fue enviado<br>
            • <strong>isValid()</strong>: Ejecuta validación<br>
            • <strong>getData()</strong>: Obtiene datos procesados
        </div>
    `,
    'tipos-campos-opciones': `
        <h1>Tipos de Campos y Opciones Avanzados</h1>
        
        <p>Symfony proporciona más de <strong>40 tipos de campos</strong> predefinidos para cubrir casi cualquier necesidad. Cada tipo tiene opciones específicas para personalizar su comportamiento.</p>

        <h2>Tipos de Campos de Texto</h2>
        <div class="code-block"><pre><code>&lt;?php
use Symfony\\Component\\Form\\Extension\\Core\\Type\\*;

// TextType - Input de texto simple
$builder->add('name', TextType::class, [
    'attr' => ['maxlength' => 100]
]);

// TextareaType - Área de texto multilínea
$builder->add('description', TextareaType::class, [
    'attr' => ['rows' => 5, 'cols' => 50]
]);

// EmailType - Input type="email"
$builder->add('email', EmailType::class);

// PasswordType - Input type="password"
$builder->add('password', PasswordType::class, [
    'always_empty' => false  // No vaciar en edición
]);

// SearchType - Input type="search"
$builder->add('query', SearchType::class);

// UrlType - Input type="url"
$builder->add('website', UrlType::class, [
    'default_protocol' => 'https'
]);

// TelType - Input type="tel"
$builder->add('phone', TelType::class);

// ColorType - Input type="color"
$builder->add('favoriteColor', ColorType::class);
?&gt;</code></pre></div>

        <h2>Tipos Numéricos</h2>
        <div class="code-block"><pre><code>&lt;?php
// NumberType - Números decimales
$builder->add('price', NumberType::class, [
    'scale' => 2,  // Decimales
    'rounding_mode' => \\NumberFormatter::ROUND_HALFUP
]);

// IntegerType - Solo enteros
$builder->add('quantity', IntegerType::class, [
    'attr' => ['min' => 0, 'max' => 1000]
]);

// MoneyType - Campos monetarios
$builder->add('amount', MoneyType::class, [
    'currency' => 'EUR',
    'divisor' => 100  // Almacenar en centavos
]);

// PercentType - Porcentajes
$builder->add('discount', PercentType::class, [
    'type' => 'integer',  // 0-100 en lugar de 0-1
    'symbol' => '%'
]);

// RangeType - Input type="range" (slider)
$builder->add('volume', RangeType::class, [
    'attr' => [
        'min' => 0,
        'max' => 100,
        'step' => 5
    ]
]);
?&gt;</code></pre></div>

        <h2>Tipos de Fecha y Hora</h2>
        <div class="code-block"><pre><code>&lt;?php
// DateType - Selector de fecha
$builder->add('birthDate', DateType::class, [
    'widget' => 'single_text',  // HTML5 date picker
    'format' => 'yyyy-MM-dd',
    'years' => range(date('Y') - 100, date('Y'))
]);

// TimeType - Selector de hora
$builder->add('startTime', TimeType::class, [
    'widget' => 'single_text',  // HTML5 time picker
    'input' => 'datetime',
    'with_seconds' => false
]);

// DateTimeType - Fecha y hora
$builder->add('publishedAt', DateTimeType::class, [
    'widget' => 'single_text',
    'html5' => true
]);

// DateIntervalType - Intervalos de tiempo
$builder->add('duration', DateIntervalType::class, [
    'widget' => 'integer',
    'with_years' => false,
    'with_months' => false,
    'with_days' => true,
    'with_hours' => true
]);

// BirthdayType - Fechas de nacimiento (optimizado)
$builder->add('birthday', BirthdayType::class, [
    'placeholder' => [
        'year' => 'Año', 'month' => 'Mes', 'day' => 'Día'
    ]
]);
?&gt;</code></pre></div>

        <h2>Tipos de Selección</h2>
        <div class="code-block"><pre><code>&lt;?php
// ChoiceType - Select, radio buttons, checkboxes
$builder->add('category', ChoiceType::class, [
    'choices' => [
        'Electrónica' => 'electronics',
        'Ropa' => 'clothing',
        'Libros' => 'books',
    ],
    'expanded' => false,  // false = select, true = radio/checkbox
    'multiple' => false,  // false = radio/select, true = checkbox
    'placeholder' => 'Seleccione una categoría',
    'choice_attr' => function($choice, $key, $value) {
        return ['data-price' => $value === 'electronics' ? '1000' : '100'];
    }
]);

// EntityType - Select de entidades Doctrine
$builder->add('category', EntityType::class, [
    'class' => Category::class,
    'choice_label' => 'name',  // Propiedad a mostrar
    'query_builder' => function (CategoryRepository $repo) {
        return $repo->createQueryBuilder('c')
            ->where('c.active = true')
            ->orderBy('c.name', 'ASC');
    },
    'multiple' => false,
    'expanded' => false
]);

// CountryType - Selector de países
$builder->add('country', CountryType::class, [
    'preferred_choices' => ['ES', 'FR', 'DE'],
    'placeholder' => 'Seleccione un país'
]);

// LanguageType - Selector de idiomas
$builder->add('language', LanguageType::class, [
    'preferred_choices' => ['es', 'en', 'fr']
]);

// LocaleType - Selector de locales
$builder->add('locale', LocaleType::class);

// TimezoneType - Selector de zonas horarias
$builder->add('timezone', TimezoneType::class);

// CurrencyType - Selector de monedas
$builder->add('currency', CurrencyType::class);
?&gt;</code></pre></div>

        <h2>Tipos Booleanos</h2>
        <div class="code-block"><pre><code>&lt;?php
// CheckboxType - Checkbox simple
$builder->add('agreeTerms', CheckboxType::class, [
    'label' => 'Acepto los términos y condiciones',
    'required' => true,
    'mapped' => false  // No mapear a entidad
]);

// RadioType - Radio button individual
$builder->add('gender', ChoiceType::class, [
    'choices' => [
        'Masculino' => 'm',
        'Femenino' => 'f',
        'Otro' => 'o'
    ],
    'expanded' => true,  // Renderizar como radio buttons
    'multiple' => false
]);
?&gt;</code></pre></div>

        <h2>Tipos de Colección</h2>
        <div class="code-block"><pre><code>&lt;?php
// CollectionType - Colección dinámica de formularios
$builder->add('emails', CollectionType::class, [
    'entry_type' => EmailType::class,
    'entry_options' => [
        'label' => false,
        'attr' => ['class' => 'email-input']
    ],
    'allow_add' => true,     // Permitir agregar
    'allow_delete' => true,  // Permitir eliminar
    'by_reference' => false, // Importante para OneToMany
    'prototype' => true,     // Generar template JS
    'prototype_name' => '__name__',
    'label' => 'Emails de contacto'
]);

// Ejemplo con formularios anidados
$builder->add('phoneNumbers', CollectionType::class, [
    'entry_type' => PhoneNumberType::class,
    'allow_add' => true,
    'allow_delete' => true,
    'by_reference' => false
]);
?&gt;</code></pre></div>

        <h2>Tipos de Archivo</h2>
        <div class="code-block"><pre><code>&lt;?php
// FileType - Subida de archivos
$builder->add('attachment', FileType::class, [
    'label' => 'Adjuntar archivo (PDF)',
    'mapped' => false,
    'required' => false,
    'constraints' => [
        new File([
            'maxSize' => '5M',
            'mimeTypes' => [
                'application/pdf',
                'application/x-pdf',
            ],
            'mimeTypesMessage' => 'Por favor suba un PDF válido',
        ])
    ],
]);
?&gt;</code></pre></div>

        <h2>Tipos Ocultos y Especiales</h2>
        <div class="code-block"><pre><code>&lt;?php
// HiddenType - Input hidden
$builder->add('token', HiddenType::class, [
    'data' => bin2hex(random_bytes(32))
]);

// ButtonType - Botón simple (no submit)
$builder->add('cancel', ButtonType::class, [
    'attr' => ['class' => 'btn btn-secondary']
]);

// SubmitType - Botón submit
$builder->add('save', SubmitType::class, [
    'label' => 'Guardar',
    'attr' => ['class' => 'btn btn-primary']
]);

// ResetType - Botón reset
$builder->add('reset', ResetType::class);
?&gt;</code></pre></div>

        <h2>Opciones Avanzadas Comunes</h2>
        <div class="code-block"><pre><code>&lt;?php
$builder->add('field', TextType::class, [
    // Transformadores de datos
    'empty_data' => '',  // Valor cuando está vacío
    
    // Validación
    'constraints' => [/* ... */],
    'invalid_message' => 'Valor inválido',
    
    // Mapeo
    'property_path' => 'differentProperty',
    'mapped' => true,
    'by_reference' => true,
    
    // Herencia
    'inherit_data' => false,
    
    // Prioridad de renderizado
    'priority' => 0,
    
    // Autocompletado
    'autocomplete' => true,
    
    // Traducción
    'label_translation_parameters' => ['%name%' => 'valor'],
    'attr_translation_parameters' => [],
    
    // Ayuda
    'help' => 'Texto de ayuda',
    'help_attr' => ['class' => 'help-text'],
    'help_html' => false,
]);
?&gt;</code></pre></div>

        <h2>Campos Dinámicos con Eventos</h2>
        <div class="code-block"><pre><code>&lt;?php
use Symfony\\Component\\Form\\FormEvent;
use Symfony\\Component\\Form\\FormEvents;

class ProductType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder->add('category', EntityType::class, [
            'class' => Category::class,
            'placeholder' => 'Seleccione categoría'
        ]);
        
        // Agregar subcategoría dinámicamente
        $formModifier = function (FormInterface $form, ?Category $category) {
            $subcategories = $category ? $category->getSubcategories() : [];
            
            $form->add('subcategory', EntityType::class, [
                'class' => Subcategory::class,
                'choices' => $subcategories,
                'placeholder' => 'Seleccione subcategoría',
            ]);
        };
        
        $builder->addEventListener(
            FormEvents::PRE_SET_DATA,
            function (FormEvent $event) use ($formModifier) {
                $product = $event->getData();
                $formModifier($event->getForm(), $product?->getCategory());
            }
        );
        
        $builder->get('category')->addEventListener(
            FormEvents::POST_SUBMIT,
            function (FormEvent $event) use ($formModifier) {
                $category = $event->getForm()->getData();
                $formModifier($event->getForm()->getParent(), $category);
            }
        );
    }
}
?&gt;</code></pre></div>

        <div class="info-box">
            <strong>🎯 Tipos de Campos Más Usados:</strong><br>
            • <strong>TextType</strong>: Texto simple<br>
            • <strong>EmailType</strong>: Emails con validación<br>
            • <strong>ChoiceType</strong>: Selects, radios, checkboxes<br>
            • <strong>EntityType</strong>: Relaciones con Doctrine<br>
            • <strong>DateType</strong>: Fechas<br>
            • <strong>FileType</strong>: Subida de archivos<br>
            • <strong>CollectionType</strong>: Formularios dinámicos
        </div>
    `,
    'manejo-subida-archivos': `
        <h1>Manejo de Subida de Archivos en Formularios</h1>
        
        <p>La subida de archivos en Symfony se maneja con el tipo <strong>FileType</strong> y el componente <strong>File</strong> de Symfony. Es importante validar, procesar y almacenar archivos de forma segura.</p>

        <h2>Configuración Básica</h2>
        <div class="code-block"><pre><code>&lt;?php
// src/Entity/Product.php

use Symfony\\Component\\HttpFoundation\\File\\File;
use Symfony\\Component\\Validator\\Constraints as Assert;

class Product
{
    #[ORM\\Column(type: 'string', nullable: true)]
    private ?string $imagePath = null;

    #[Assert\\Image(
        maxSize: '5M',
        mimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
        mimeTypesMessage: 'Por favor suba una imagen válida (JPG, PNG, GIF)'
    )]
    private ?File $imageFile = null;

    public function getImagePath(): ?string
    {
        return $this->imagePath;
    }

    public function setImagePath(?string $imagePath): self
    {
        $this->imagePath = $imagePath;
        return $this;
    }

    public function getImageFile(): ?File
    {
        return $this->imageFile;
    }

    public function setImageFile(?File $imageFile): self
    {
        $this->imageFile = $imageFile;
        return $this;
    }
}
?&gt;</code></pre></div>

        <h2>Formulario con FileType</h2>
        <div class="code-block"><pre><code>&lt;?php
// src/Form/ProductType.php

use Symfony\\Component\\Form\\Extension\\Core\\Type\\FileType;
use Symfony\\Component\\Validator\\Constraints\\File;
use Symfony\\Component\\Validator\\Constraints\\Image;

class ProductType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('name', TextType::class)
            ->add('imageFile', FileType::class, [
                'label' => 'Imagen del Producto',
                'mapped' => false,  // No mapear directamente a la entidad
                'required' => false,
                'constraints' => [
                    new Image([
                        'maxSize' => '5M',
                        'maxSizeMessage' => 'La imagen no puede exceder {{ limit }} {{ suffix }}',
                        'mimeTypes' => [
                            'image/jpeg',
                            'image/png',
                            'image/gif',
                            'image/webp'
                        ],
                        'mimeTypesMessage' => 'Formato de imagen no válido',
                        'maxWidth' => 4000,
                        'maxHeight' => 4000,
                        'allowPortrait' => true,
                        'allowLandscape' => true,
                    ])
                ],
            ]);
    }
}
?&gt;</code></pre></div>

        <h2>Procesar Subida en el Controlador</h2>
        <div class="code-block"><pre><code>&lt;?php
use Symfony\\Component\\HttpFoundation\\File\\Exception\\FileException;
use Symfony\\Component\\HttpFoundation\\File\\UploadedFile;
use Symfony\\Component\\String\\Slugger\\SluggerInterface;

class ProductController extends AbstractController
{
    #[Route('/product/new', name: 'product_new')]
    public function new(
        Request $request,
        EntityManagerInterface $em,
        SluggerInterface $slugger
    ): Response {
        $product = new Product();
        $form = $this->createForm(ProductType::class, $product);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            /** @var UploadedFile $imageFile */
            $imageFile = $form->get('imageFile')->getData();

            if ($imageFile) {
                // Obtener nombre original y generar nombre seguro
                $originalFilename = pathinfo(
                    $imageFile->getClientOriginalName(),
                    PATHINFO_FILENAME
                );
                
                // Slug para nombre seguro
                $safeFilename = $slugger->slug($originalFilename);
                $newFilename = $safeFilename.'-'.uniqid().'.'.$imageFile->guessExtension();

                // Mover archivo al directorio configurado
                try {
                    $imageFile->move(
                        $this->getParameter('images_directory'),
                        $newFilename
                    );
                } catch (FileException $e) {
                    $this->addFlash('error', 'Error al subir la imagen');
                    return $this->redirectToRoute('product_new');
                }

                // Guardar nombre del archivo en la entidad
                $product->setImagePath($newFilename);
            }

            $em->persist($product);
            $em->flush();

            $this->addFlash('success', 'Producto creado exitosamente!');
            return $this->redirectToRoute('product_list');
        }

        return $this->render('product/new.html.twig', [
            'form' => $form->createView(),
        ]);
    }
}
?&gt;</code></pre></div>

        <h2>Configuración de Directorios</h2>
        <div class="code-block"><pre><code># config/services.yaml

parameters:
    images_directory: '%kernel.project_dir%/public/uploads/images'
    documents_directory: '%kernel.project_dir%/public/uploads/documents'

services:
    # ...
?&gt;</code></pre></div>

        <h2>Servicio de Subida de Archivos</h2>
        <div class="code-block"><pre><code>&lt;?php
// src/Service/FileUploader.php

namespace App\\Service;

use Symfony\\Component\\HttpFoundation\\File\\Exception\\FileException;
use Symfony\\Component\\HttpFoundation\\File\\UploadedFile;
use Symfony\\Component\\String\\Slugger\\SluggerInterface;

class FileUploader
{
    public function __construct(
        private string $targetDirectory,
        private SluggerInterface $slugger
    ) {}

    public function upload(UploadedFile $file): string
    {
        $originalFilename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $safeFilename = $this->slugger->slug($originalFilename);
        $fileName = $safeFilename.'-'.uniqid().'.'.$file->guessExtension();

        try {
            $file->move($this->getTargetDirectory(), $fileName);
        } catch (FileException $e) {
            throw new \\Exception('Error al subir archivo: ' . $e->getMessage());
        }

        return $fileName;
    }

    public function getTargetDirectory(): string
    {
        return $this->targetDirectory;
    }
}

// config/services.yaml
services:
    App\\Service\\FileUploader:
        arguments:
            $targetDirectory: '%images_directory%'

// Uso en controlador
public function new(
    Request $request,
    FileUploader $fileUploader,
    EntityManagerInterface $em
): Response {
    // ...
    if ($imageFile) {
        $newFilename = $fileUploader->upload($imageFile);
        $product->setImagePath($newFilename);
    }
    // ...
}
?&gt;</code></pre></div>

        <h2>Múltiples Archivos</h2>
        <div class="code-block"><pre><code>&lt;?php
// Formulario
$builder->add('attachments', FileType::class, [
    'label' => 'Adjuntar archivos',
    'multiple' => true,
    'mapped' => false,
    'required' => false,
    'constraints' => [
        new All([
            new File([
                'maxSize' => '10M',
                'mimeTypes' => [
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'image/jpeg',
                    'image/png'
                ]
            ])
        ])
    ],
]);

// Controlador
$attachments = $form->get('attachments')->getData();

if ($attachments) {
    foreach ($attachments as $attachment) {
        $filename = $fileUploader->upload($attachment);
        
        // Crear entidad para cada archivo
        $document = new Document();
        $document->setFilename($filename);
        $document->setProduct($product);
        
        $em->persist($document);
    }
}
?&gt;</code></pre></div>

        <h2>Validaciones Avanzadas</h2>
        <div class="code-block"><pre><code>&lt;?php
use Symfony\\Component\\Validator\\Constraints as Assert;

// Validar imagen con dimensiones
new Assert\\Image([
    'maxSize' => '5M',
    'minWidth' => 200,
    'maxWidth' => 4000,
    'minHeight' => 200,
    'maxHeight' => 4000,
    'maxRatio' => 2,  // Ancho/Alto máximo
    'minRatio' => 0.5,
    'allowSquare' => true,
    'allowLandscape' => true,
    'allowPortrait' => true,
    'detectCorrupted' => true
]);

// Validar archivo genérico
new Assert\\File([
    'maxSize' => '10M',
    'mimeTypes' => [
        'application/pdf',
        'application/x-pdf',
    ],
    'mimeTypesMessage' => 'Por favor suba un PDF válido',
    'uploadIniSizeErrorMessage' => 'El archivo excede el tamaño máximo permitido',
    'uploadFormSizeErrorMessage' => 'El archivo es demasiado grande',
    'uploadErrorMessage' => 'Error al subir el archivo'
]);
?&gt;</code></pre></div>

        <h2>Eliminar Archivo Anterior</h2>
        <div class="code-block"><pre><code>&lt;?php
public function edit(
    Product $product,
    Request $request,
    FileUploader $fileUploader,
    EntityManagerInterface $em
): Response {
    $form = $this->createForm(ProductType::class, $product);
    $form->handleRequest($request);

    if ($form->isSubmitted() && $form->isValid()) {
        $imageFile = $form->get('imageFile')->getData();

        if ($imageFile) {
            // Eliminar imagen anterior si existe
            if ($product->getImagePath()) {
                $oldImagePath = $this->getParameter('images_directory') . '/' . $product->getImagePath();
                if (file_exists($oldImagePath)) {
                    unlink($oldImagePath);
                }
            }

            // Subir nueva imagen
            $newFilename = $fileUploader->upload($imageFile);
            $product->setImagePath($newFilename);
        }

        $em->flush();
        return $this->redirectToRoute('product_show', ['id' => $product->getId()]);
    }

    return $this->render('product/edit.html.twig', [
        'form' => $form->createView(),
        'product' => $product,
    ]);
}
?&gt;</code></pre></div>

        <h2>Mostrar Imagen en Twig</h2>
        <div class="code-block"><pre><code>{# templates/product/show.html.twig #}

{% if product.imagePath %}
    <img src="{{ asset('uploads/images/' ~ product.imagePath) }}" 
         alt="{{ product.name }}"
         class="img-fluid">
{% else %}
    <img src="{{ asset('images/placeholder.png') }}" 
         alt="Sin imagen"
         class="img-fluid">
{% endif %}
?&gt;</code></pre></div>

        <div class="warning-box">
            <strong>⚠️ Seguridad en Subida de Archivos:</strong><br>
            • <strong>Validar siempre</strong> tipo MIME y extensión<br>
            • <strong>Renombrar archivos</strong> para evitar sobrescritura<br>
            • <strong>Limitar tamaño</strong> de archivos<br>
            • <strong>No confiar</strong> en extensión del cliente<br>
            • <strong>Almacenar fuera</strong> del document root si es posible<br>
            • <strong>Escanear</strong> archivos con antivirus en producción
        </div>
    `,
    'grupos-validacion-contextos': `
        <h1>Grupos de Validación y Contextos</h1>
        
        <p>Los <strong>grupos de validación</strong> permiten aplicar diferentes conjuntos de reglas de validación según el contexto. Esto es útil cuando una entidad necesita validaciones diferentes para crear, editar o eliminar.</p>

        <h2>Definir Grupos en la Entidad</h2>
        <div class="code-block"><pre><code>&lt;?php
// src/Entity/User.php

use Symfony\\Component\\Validator\\Constraints as Assert;

class User
{
    #[ORM\\Column(type: 'string', length: 255)]
    #[Assert\\NotBlank(groups: ['registration', 'profile'])]
    #[Assert\\Length(
        min: 3,
        max: 255,
        groups: ['registration', 'profile']
    )]
    private string $username;

    #[ORM\\Column(type: 'string', length: 255)]
    #[Assert\\NotBlank(groups: ['registration', 'profile'])]
    #[Assert\\Email(groups: ['registration', 'profile'])]
    private string $email;

    #[Assert\\NotBlank(groups: ['registration'])]
    #[Assert\\Length(
        min: 8,
        minMessage: 'La contraseña debe tener al menos {{ limit }} caracteres',
        groups: ['registration']
    )]
    #[Assert\\Regex(
        pattern: '/^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)/',
        message: 'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
        groups: ['registration']
    )]
    private ?string $plainPassword = null;

    #[ORM\\Column(type: 'boolean')]
    #[Assert\\IsTrue(
        message: 'Debe aceptar los términos y condiciones',
        groups: ['registration']
    )]
    private bool $agreeTerms = false;

    #[ORM\\Column(type: 'string', length: 20, nullable: true)]
    #[Assert\\NotBlank(groups: ['profile_complete'])]
    #[Assert\\Regex(
        pattern: '/^[0-9]{9,15}$/',
        groups: ['profile_complete']
    )]
    private ?string $phone = null;
}
?></code></pre></div>

        <h2>Usar Grupos en Formularios</h2>
        <div class="code-block"><pre><code>&lt;?php
// src/Form/RegistrationFormType.php

class RegistrationFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('username', TextType::class)
            ->add('email', EmailType::class)
            ->add('plainPassword', PasswordType::class)
            ->add('agreeTerms', CheckboxType::class);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => User::class,
            'validation_groups' => ['registration'],  // Aplicar grupo
        ]);
    }
}

// src/Form/ProfileFormType.php

class ProfileFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('username', TextType::class)
            ->add('email', EmailType::class)
            ->add('phone', TelType::class, ['required' => false]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => User::class,
            'validation_groups' => ['profile'],  // Grupo diferente
        ]);
    }
}
?></code></pre></div>

        <h2>Grupos Dinámicos con Callback</h2>
        <div class="code-block"><pre><code>&lt;?php
class ProductType extends AbstractType
{
    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Product::class,
            'validation_groups' => function (FormInterface $form) {
                $data = $form->getData();
                
                // Grupos según estado del producto
                if ($data->isPublished()) {
                    return ['Default', 'published'];
                }
                
                return ['Default', 'draft'];
            },
        ]);
    }
}

// En la entidad
class Product
{
    #[Assert\\NotBlank(groups: ['Default'])]
    private string $name;

    #[Assert\\NotBlank(groups: ['published'])]
    #[Assert\\Length(min: 100, groups: ['published'])]
    private ?string $description = null;

    #[Assert\\NotBlank(groups: ['published'])]
    #[Assert\\Positive(groups: ['published'])]
    private ?float $price = null;
}
?></code></pre></div>

        <h2>Secuencia de Grupos</h2>
        <div class="code-block"><pre><code>&lt;?php
use Symfony\\Component\\Validator\\Constraints\\GroupSequence;

// Validar grupos en orden, detener si uno falla
#[GroupSequence(['User', 'Strict'])]
class User
{
    #[Assert\\NotBlank]
    #[Assert\\Email]
    private string $email;

    #[Assert\\NotBlank(groups: ['Strict'])]
    #[Assert\\Length(min: 8, groups: ['Strict'])]
    private string $password;
}

// Uso en formulario
$resolver->setDefaults([
    'validation_groups' => new GroupSequence(['User', 'Strict']),
]);
?></code></pre></div>

        <h2>Validación Condicional</h2>
        <div class="code-block"><pre><code>&lt;?php
use Symfony\\Component\\Validator\\Context\\ExecutionContextInterface;

class Order
{
    #[Assert\\NotBlank]
    private string $shippingMethod;

    #[Assert\\NotBlank(groups: ['home_delivery'])]
    private ?string $address = null;

    #[Assert\\Callback]
    public function validate(ExecutionContextInterface $context): void
    {
        // Validación condicional
        if ($this->shippingMethod === 'home_delivery' && !$this->address) {
            $context->buildViolation('La dirección es obligatoria para envío a domicilio')
                ->atPath('address')
                ->addViolation();
        }
    }
}
?></code></pre></div>

        <h2>Grupos en Controlador</h2>
        <div class="code-block"><pre><code>&lt;?php
use Symfony\\Component\\Validator\\Validator\\ValidatorInterface;

class UserController extends AbstractController
{
    #[Route('/user/validate', name: 'user_validate')]
    public function validate(
        Request $request,
        ValidatorInterface $validator
    ): Response {
        $user = new User();
        // ... poblar datos
        
        // Validar con grupos específicos
        $errors = $validator->validate($user, null, ['registration']);
        
        if (count($errors) > 0) {
            foreach ($errors as $error) {
                $this->addFlash('error', $error->getMessage());
            }
        }
        
        return $this->redirectToRoute('user_list');
    }
}
?></code></pre></div>

        <h2>Grupos Predeterminados</h2>
        <div class="code-block"><pre><code>&lt;?php
// Symfony define estos grupos automáticamente:

// 'Default' - Grupo por defecto si no se especifica
#[Assert\\NotBlank]  // Equivale a groups: ['Default']

// Nombre de la clase - Grupo con el nombre de la entidad
class User
{
    #[Assert\\NotBlank(groups: ['User'])]
    private string $name;
}

// Uso combinado
$resolver->setDefaults([
    'validation_groups' => ['Default', 'registration'],
]);
?></code></pre></div>

        <div class="info-box">
            <strong>🎯 Casos de Uso Comunes:</strong><br>
            • <strong>Registro vs Edición</strong>: Contraseña obligatoria solo en registro<br>
            • <strong>Publicación</strong>: Validaciones estrictas al publicar contenido<br>
            • <strong>Pasos de formulario</strong>: Validar cada paso por separado<br>
            • <strong>Roles</strong>: Validaciones diferentes según rol del usuario<br>
            • <strong>Estados</strong>: Validaciones según estado de la entidad
        </div>
    `,
    'validadores-personalizados': `
        <h1>Validadores Personalizados</h1>
        
        <p>Cuando las validaciones integradas no son suficientes, puedes crear <strong>validadores personalizados</strong> (custom constraints) para implementar lógica de validación específica de tu aplicación.</p>

        <h2>Crear un Constraint Personalizado</h2>
        <div class="code-block"><pre><code>&lt;?php
// src/Validator/Constraints/ValidDni.php

namespace App\\Validator\\Constraints;

use Symfony\\Component\\Validator\\Constraint;

#[\\Attribute]
class ValidDni extends Constraint
{
    public string $message = 'El DNI "{{ value }}" no es válido.';
    public string $mode = 'strict';

    public function __construct(
        ?string $mode = null,
        ?string $message = null,
        ?array $groups = null,
        mixed $payload = null
    ) {
        parent::__construct([], $groups, $payload);
        
        $this->mode = $mode ?? $this->mode;
        $this->message = $message ?? $this->message;
    }
}
?></code></pre></div>

        <h2>Crear el Validador</h2>
        <div class="code-block"><pre><code>&lt;?php
// src/Validator/Constraints/ValidDniValidator.php

namespace App\\Validator\\Constraints;

use Symfony\\Component\\Validator\\Constraint;
use Symfony\\Component\\Validator\\ConstraintValidator;
use Symfony\\Component\\Validator\\Exception\\UnexpectedTypeException;
use Symfony\\Component\\Validator\\Exception\\UnexpectedValueException;

class ValidDniValidator extends ConstraintValidator
{
    public function validate(mixed $value, Constraint $constraint): void
    {
        if (!$constraint instanceof ValidDni) {
            throw new UnexpectedTypeException($constraint, ValidDni::class);
        }

        // Permitir valores nulos o vacíos (usar NotBlank para requerir)
        if (null === $value || '' === $value) {
            return;
        }

        if (!is_string($value)) {
            throw new UnexpectedValueException($value, 'string');
        }

        // Lógica de validación del DNI español
        if (!$this->isValidDni($value)) {
            $this->context->buildViolation($constraint->message)
                ->setParameter('{{ value }}', $value)
                ->addViolation();
        }
    }

    private function isValidDni(string $dni): bool
    {
        // Validar formato: 8 dígitos + letra
        if (!preg_match('/^[0-9]{8}[A-Z]$/', $dni)) {
            return false;
        }

        // Validar letra de control
        $number = substr($dni, 0, 8);
        $letter = substr($dni, 8, 1);
        $validLetters = 'TRWAGMYFPDXBNJZSQVHLCKE';
        
        return $letter === $validLetters[$number % 23];
    }
}
?></code></pre></div>

        <h2>Usar el Validador Personalizado</h2>
        <div class="code-block"><pre><code>&lt;?php
// En una entidad
use App\\Validator\\Constraints as AppAssert;

class User
{
    #[ORM\\Column(type: 'string', length: 9)]
    #[AppAssert\\ValidDni]
    private string $dni;
}

// En un formulario
use App\\Validator\\Constraints\\ValidDni;

$builder->add('dni', TextType::class, [
    'constraints' => [
        new ValidDni([
            'message' => 'Por favor ingrese un DNI válido'
        ])
    ]
]);
?></code></pre></div>

        <h2>Validador con Dependencias</h2>
        <div class="code-block"><pre><code>&lt;?php
// src/Validator/Constraints/UniqueEmail.php

#[\\Attribute]
class UniqueEmail extends Constraint
{
    public string $message = 'El email "{{ email }}" ya está registrado.';
}

// src/Validator/Constraints/UniqueEmailValidator.php

use App\\Repository\\UserRepository;
use Symfony\\Component\\Validator\\Constraint;
use Symfony\\Component\\Validator\\ConstraintValidator;

class UniqueEmailValidator extends ConstraintValidator
{
    public function __construct(
        private UserRepository $userRepository
    ) {}

    public function validate(mixed $value, Constraint $constraint): void
    {
        if (!$constraint instanceof UniqueEmail) {
            throw new UnexpectedTypeException($constraint, UniqueEmail::class);
        }

        if (null === $value || '' === $value) {
            return;
        }

        // Buscar email en base de datos
        $existingUser = $this->userRepository->findOneBy(['email' => $value]);

        if ($existingUser) {
            $this->context->buildViolation($constraint->message)
                ->setParameter('{{ email }}', $value)
                ->addViolation();
        }
    }
}

// Registrar como servicio (autoconfigure hace esto automáticamente)
// config/services.yaml
services:
    App\\Validator\\Constraints\\UniqueEmailValidator:
        tags:
            - { name: validator.constraint_validator }
?></code></pre></div>

        <h2>Validador de Clase Completa</h2>
        <div class="code-block"><pre><code>&lt;?php
// src/Validator/Constraints/PasswordMatch.php

#[\\Attribute(\\Attribute::TARGET_CLASS)]
class PasswordMatch extends Constraint
{
    public string $message = 'Las contraseñas no coinciden.';

    public function getTargets(): string
    {
        return self::CLASS_CONSTRAINT;
    }
}

// src/Validator/Constraints/PasswordMatchValidator.php

class PasswordMatchValidator extends ConstraintValidator
{
    public function validate(mixed $value, Constraint $constraint): void
    {
        if (!$constraint instanceof PasswordMatch) {
            throw new UnexpectedTypeException($constraint, PasswordMatch::class);
        }

        // $value es el objeto completo
        if (!method_exists($value, 'getPassword') || !method_exists($value, 'getConfirmPassword')) {
            throw new \\InvalidArgumentException('El objeto debe tener métodos getPassword y getConfirmPassword');
        }

        $password = $value->getPassword();
        $confirmPassword = $value->getConfirmPassword();

        if ($password !== $confirmPassword) {
            $this->context->buildViolation($constraint->message)
                ->atPath('confirmPassword')
                ->addViolation();
        }
    }
}

// Uso en entidad
#[PasswordMatch]
class RegistrationDTO
{
    private string $password;
    private string $confirmPassword;
    
    // getters y setters
}
?></code></pre></div>

        <h2>Validador Asíncrono</h2>
        <div class="code-block"><pre><code>&lt;?php
// src/Validator/Constraints/ValidCreditCard.php

#[\\Attribute]
class ValidCreditCard extends Constraint
{
    public string $message = 'La tarjeta de crédito no es válida.';
}

// src/Validator/Constraints/ValidCreditCardValidator.php

use Symfony\\Contracts\\HttpClient\\HttpClientInterface;

class ValidCreditCardValidator extends ConstraintValidator
{
    public function __construct(
        private HttpClientInterface $httpClient
    ) {}

    public function validate(mixed $value, Constraint $constraint): void
    {
        if (!$constraint instanceof ValidCreditCard) {
            throw new UnexpectedTypeException($constraint, ValidCreditCard::class);
        }

        if (null === $value || '' === $value) {
            return;
        }

        // Llamar a API externa para validar tarjeta
        try {
            $response = $this->httpClient->request('POST', 'https://api.payment.com/validate', [
                'json' => ['card_number' => $value]
            ]);

            $data = $response->toArray();

            if (!$data['valid']) {
                $this->context->buildViolation($constraint->message)
                    ->addViolation();
            }
        } catch (\\Exception $e) {
            // Manejar error de API
            $this->context->buildViolation('Error al validar la tarjeta')
                ->addViolation();
        }
    }
}
?></code></pre></div>

        <h2>Validador con Opciones Múltiples</h2>
        <div class="code-block"><pre><code>&lt;?php
// src/Validator/Constraints/StrongPassword.php

#[\\Attribute]
class StrongPassword extends Constraint
{
    public string $message = 'La contraseña no cumple los requisitos de seguridad.';
    public int $minLength = 8;
    public bool $requireUppercase = true;
    public bool $requireLowercase = true;
    public bool $requireNumbers = true;
    public bool $requireSpecialChars = false;

    public function __construct(
        ?int $minLength = null,
        ?bool $requireUppercase = null,
        ?bool $requireLowercase = null,
        ?bool $requireNumbers = null,
        ?bool $requireSpecialChars = null,
        ?string $message = null,
        ?array $groups = null,
        mixed $payload = null
    ) {
        parent::__construct([], $groups, $payload);
        
        $this->minLength = $minLength ?? $this->minLength;
        $this->requireUppercase = $requireUppercase ?? $this->requireUppercase;
        $this->requireLowercase = $requireLowercase ?? $this->requireLowercase;
        $this->requireNumbers = $requireNumbers ?? $this->requireNumbers;
        $this->requireSpecialChars = $requireSpecialChars ?? $this->requireSpecialChars;
        $this->message = $message ?? $this->message;
    }
}

// Validator
class StrongPasswordValidator extends ConstraintValidator
{
    public function validate(mixed $value, Constraint $constraint): void
    {
        if (!$constraint instanceof StrongPassword) {
            throw new UnexpectedTypeException($constraint, StrongPassword::class);
        }

        if (null === $value || '' === $value) {
            return;
        }

        $errors = [];

        if (strlen($value) < $constraint->minLength) {
            $errors[] = sprintf('mínimo %d caracteres', $constraint->minLength);
        }

        if ($constraint->requireUppercase && !preg_match('/[A-Z]/', $value)) {
            $errors[] = 'al menos una mayúscula';
        }

        if ($constraint->requireLowercase && !preg_match('/[a-z]/', $value)) {
            $errors[] = 'al menos una minúscula';
        }

        if ($constraint->requireNumbers && !preg_match('/[0-9]/', $value)) {
            $errors[] = 'al menos un número';
        }

        if ($constraint->requireSpecialChars && !preg_match('/[^A-Za-z0-9]/', $value)) {
            $errors[] = 'al menos un carácter especial';
        }

        if (!empty($errors)) {
            $this->context->buildViolation($constraint->message)
                ->setParameter('{{ requirements }}', implode(', ', $errors))
                ->addViolation();
        }
    }
}

// Uso
#[StrongPassword(
    minLength: 12,
    requireSpecialChars: true,
    message: 'La contraseña debe tener {{ requirements }}'
)]
private string $password;
?></code></pre></div>

        <div class="success-box">
            <strong>✅ Ventajas de Validadores Personalizados:</strong><br>
            • <strong>Reutilización</strong>: Lógica centralizada<br>
            • <strong>Testeable</strong>: Fácil de probar unitariamente<br>
            • <strong>Mantenible</strong>: Cambios en un solo lugar<br>
            • <strong>Expresivo</strong>: Código más legible<br>
            • <strong>Flexible</strong>: Opciones configurables
        </div>
    `,
    'integracion-formularios-twig': `
        <h1>Integración de Formularios con Twig</h1>
        
        <p>Twig proporciona funciones y filtros especializados para renderizar formularios de manera flexible. Puedes renderizar el formulario completo automáticamente o personalizar cada elemento.</p>

        <h2>Renderizado Automático Completo</h2>
        <div class="code-block"><pre><code>{# templates/product/new.html.twig #}

{% extends 'base.html.twig' %}

{% block body %}
    <h1>Crear Producto</h1>

    {# Renderizar formulario completo #}
    {{ form(form) }}
{% endblock %}
?></code></pre></div>

        <h2>Renderizado Manual por Partes</h2>
        <div class="code-block"><pre><code>{# Control total sobre el HTML #}

{{ form_start(form) }}
    
    {# Renderizar campo individual #}
    {{ form_row(form.name) }}
    
    {# Renderizar con clases personalizadas #}
    {{ form_row(form.email, {'attr': {'class': 'custom-input'}}) }}
    
    {# Renderizar campo por campo #}
    <div class="form-group">
        {{ form_label(form.price) }}
        {{ form_widget(form.price, {'attr': {'class': 'form-control'}}) }}
        {{ form_errors(form.price) }}
        {{ form_help(form.price) }}
    </div>
    
    {# Botón de submit #}
    <button type="submit" class="btn btn-primary">Guardar</button>

{{ form_end(form) }}
?></code></pre></div>

        <h2>Funciones de Twig para Formularios</h2>
        <div class="code-block"><pre><code>{# form_start() - Abre el formulario con <form> #}
{{ form_start(form, {'attr': {'class': 'my-form', 'novalidate': 'novalidate'}}) }}

{# form_end() - Cierra </form> y renderiza campos ocultos (CSRF, etc.) #}
{{ form_end(form) }}

{# form_widget() - Renderiza el input del campo #}
{{ form_widget(form.name) }}
{{ form_widget(form.name, {'attr': {'placeholder': 'Nombre'}}) }}

{# form_label() - Renderiza el <label> #}
{{ form_label(form.name) }}
{{ form_label(form.name, 'Nombre del Producto') }}

{# form_errors() - Renderiza errores del campo #}
{{ form_errors(form.name) }}

{# form_help() - Renderiza texto de ayuda #}
{{ form_help(form.name) }}

{# form_row() - Renderiza label + widget + errors + help #}
{{ form_row(form.name) }}

{# form_rest() - Renderiza campos no renderizados aún #}
{{ form_rest(form) }}
?></code></pre></div>

        <h2>Personalización Avanzada</h2>
        <div class="code-block"><pre><code>{# Formulario con Bootstrap 5 #}

<div class="container">
    <h1>Registro de Usuario</h1>
    
    {{ form_start(form, {'attr': {'class': 'needs-validation', 'novalidate': 'novalidate'}}) }}
        
        <div class="row">
            <div class="col-md-6">
                <div class="mb-3">
                    {{ form_label(form.username, null, {'label_attr': {'class': 'form-label'}}) }}
                    {{ form_widget(form.username, {'attr': {'class': 'form-control'}}) }}
                    {{ form_errors(form.username) }}
                    <div class="form-text">{{ form_help(form.username) }}</div>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="mb-3">
                    {{ form_label(form.email, null, {'label_attr': {'class': 'form-label'}}) }}
                    {{ form_widget(form.email, {'attr': {'class': 'form-control'}}) }}
                    {{ form_errors(form.email) }}
                </div>
            </div>
        </div>
        
        <div class="mb-3">
            {{ form_row(form.password, {
                'label': 'Contraseña',
                'attr': {'class': 'form-control'},
                'label_attr': {'class': 'form-label'}
            }) }}
        </div>
        
        <div class="mb-3 form-check">
            {{ form_widget(form.agreeTerms, {'attr': {'class': 'form-check-input'}}) }}
            {{ form_label(form.agreeTerms, null, {'label_attr': {'class': 'form-check-label'}}) }}
            {{ form_errors(form.agreeTerms) }}
        </div>
        
        <button type="submit" class="btn btn-primary">Registrarse</button>
        
    {{ form_end(form) }}
</div>
?></code></pre></div>

        <h2>Iterar sobre Campos</h2>
        <div class="code-block"><pre><code>{# Renderizar todos los campos dinámicamente #}

{{ form_start(form) }}
    
    {% for field in form %}
        {% if field.vars.name != '_token' %}
            <div class="form-group">
                {{ form_row(field) }}
            </div>
        {% endif %}
    {% endfor %}
    
    <button type="submit">Enviar</button>
    
{{ form_end(form) }}

{# Renderizar solo campos específicos #}
{% for field in form.children %}
    {% if field.vars.block_prefixes[1] == 'text' %}
        {{ form_row(field) }}
    {% endif %}
{% endfor %}
?></code></pre></div>

        <h2>Formularios Anidados</h2>
        <div class="code-block"><pre><code>{# Formulario con subformularios #}

{{ form_start(form) }}
    
    <h2>Información del Pedido</h2>
    {{ form_row(form.orderNumber) }}
    
    <h3>Cliente</h3>
    <div class="customer-section">
        {{ form_row(form.customer.name) }}
        {{ form_row(form.customer.email) }}
        {{ form_row(form.customer.phone) }}
    </div>
    
    <h3>Artículos</h3>
    <div id="items-collection">
        {% for item in form.items %}
            <div class="item-row">
                {{ form_row(item.product) }}
                {{ form_row(item.quantity) }}
                {{ form_row(item.price) }}
            </div>
        {% endfor %}
    </div>
    
    <button type="submit">Guardar Pedido</button>
    
{{ form_end(form) }}
?></code></pre></div>

        <h2>CollectionType con JavaScript</h2>
        <div class="code-block"><pre><code>{# Formulario con colección dinámica #}

<div class="emails-collection" data-prototype="{{ form_widget(form.emails.vars.prototype)|e('html_attr') }}">
    <h3>Emails</h3>
    
    {% for email in form.emails %}
        <div class="email-item">
            {{ form_widget(email) }}
            <button type="button" class="remove-email">Eliminar</button>
        </div>
    {% endfor %}
    
    <button type="button" class="add-email">Agregar Email</button>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const collectionHolder = document.querySelector('.emails-collection');
    const addButton = document.querySelector('.add-email');
    
    let index = collectionHolder.querySelectorAll('.email-item').length;
    
    addButton.addEventListener('click', function() {
        const prototype = collectionHolder.dataset.prototype;
        const newForm = prototype.replace(/__name__/g, index);
        
        const div = document.createElement('div');
        div.className = 'email-item';
        div.innerHTML = newForm + '<button type="button" class="remove-email">Eliminar</button>';
        
        collectionHolder.insertBefore(div, addButton);
        index++;
        
        // Agregar listener para eliminar
        div.querySelector('.remove-email').addEventListener('click', function() {
            div.remove();
        });
    });
    
    // Listeners para botones de eliminar existentes
    document.querySelectorAll('.remove-email').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.email-item').remove();
        });
    });
});
</script>
?></code></pre></div>

        <h2>Temas de Formulario (Form Themes)</h2>
        <div class="code-block"><pre><code>{# Aplicar tema Bootstrap 5 globalmente #}
{# config/packages/twig.yaml #}
twig:
    form_themes:
        - 'bootstrap_5_layout.html.twig'

{# Aplicar tema a un formulario específico #}
{% form_theme form 'bootstrap_5_layout.html.twig' %}

{# Aplicar múltiples temas #}
{% form_theme form 'bootstrap_5_layout.html.twig' 'form/custom_theme.html.twig' %}

{# Tema inline #}
{% form_theme form _self %}

{% block _product_name_widget %}
    <div class="custom-widget">
        <input type="text" {{ block('widget_attributes') }} value="{{ value }}" />
        <span class="icon">📝</span>
    </div>
{% endblock %}
?></code></pre></div>

        <h2>Personalizar Renderizado de Campos</h2>
        <div class="code-block"><pre><code>{# templates/form/custom_theme.html.twig #}

{# Personalizar todos los campos de texto #}
{% block text_widget %}
    <div class="input-wrapper">
        <input type="text" {{ block('widget_attributes') }} {% if value is not empty %}value="{{ value }}" {% endif %}/>
        <span class="input-icon">✏️</span>
    </div>
{% endblock %}

{# Personalizar campo específico por nombre #}
{% block _product_price_widget %}
    <div class="price-input">
        <span class="currency">€</span>
        <input type="number" {{ block('widget_attributes') }} value="{{ value }}" step="0.01" />
    </div>
{% endblock %}

{# Personalizar label de campo específico #}
{% block _product_name_label %}
    <label class="required-label">
        {{ label }}
        <span class="required-asterisk">*</span>
    </label>
{% endblock %}

{# Personalizar errores #}
{% block form_errors %}
    {% if errors|length > 0 %}
        <div class="alert alert-danger">
            <ul class="error-list">
                {% for error in errors %}
                    <li>{{ error.message }}</li>
                {% endfor %}
            </ul>
        </div>
    {% endif %}
{% endblock %}
?></code></pre></div>

        <h2>Variables Disponibles en Templates</h2>
        <div class="code-block"><pre><code>{# Acceder a variables del formulario #}

{# Nombre del campo #}
{{ form.name.vars.name }}

{# Valor del campo #}
{{ form.name.vars.value }}

{# ID del campo #}
{{ form.name.vars.id }}

{# Label #}
{{ form.name.vars.label }}

{# ¿Es requerido? #}
{% if form.name.vars.required %}
    <span class="required">*</span>
{% endif %}

{# ¿Está deshabilitado? #}
{% if form.name.vars.disabled %}
    <span class="disabled-badge">Deshabilitado</span>
{% endif %}

{# Atributos HTML #}
{{ form.name.vars.attr.class }}

{# Errores #}
{% if form.name.vars.errors|length > 0 %}
    <div class="has-error">
        {% for error in form.name.vars.errors %}
            {{ error.message }}
        {% endfor %}
    </div>
{% endif %}

{# Ayuda #}
{{ form.name.vars.help }}
?></code></pre></div>

        <h2>Formularios AJAX</h2>
        <div class="code-block"><pre><code>{# Enviar formulario con AJAX #}

<div id="form-container">
    {{ form_start(form, {'attr': {'id': 'product-form'}}) }}
        {{ form_widget(form) }}
        <button type="submit" class="btn btn-primary">Guardar</button>
    {{ form_end(form) }}
</div>

<div id="form-messages"></div>

<script>
document.getElementById('product-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const messagesDiv = document.getElementById('form-messages');
    
    try {
        const response = await fetch(this.action, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            messagesDiv.innerHTML = '<div class=\"alert alert-success\">Guardado exitosamente</div>';
            this.reset();
        } else {
            // Mostrar errores de validación
            messagesDiv.innerHTML = '<div class=\"alert alert-danger\">' + data.errors.join('<br>') + '</div>';
        }
    } catch (error) {
        messagesDiv.innerHTML = '<div class=\"alert alert-danger\">Error al enviar formulario</div>';
    }
});
</script>
?></code></pre></div>

        <div class="info-box">
            <strong>🎯 Funciones Principales de Twig:</strong><br>
            • <strong>form()</strong>: Renderiza formulario completo<br>
            • <strong>form_start()</strong>: Abre tag &lt;form&gt;<br>
            • <strong>form_end()</strong>: Cierra &lt;/form&gt; y campos ocultos<br>
            • <strong>form_row()</strong>: Label + widget + errors + help<br>
            • <strong>form_widget()</strong>: Solo el input<br>
            • <strong>form_label()</strong>: Solo el label<br>
            • <strong>form_errors()</strong>: Solo los errores<br>
            • <strong>form_help()</strong>: Solo el texto de ayuda
        </div>
    `,
    'manejo-errores-mensajes-validacion': `
        <h1>Manejo de Errores y Mensajes de Validación</h1>
        
        <p>El manejo correcto de errores y mensajes de validación es crucial para una buena experiencia de usuario. Symfony proporciona múltiples formas de personalizar y mostrar errores de validación.</p>

        <h2>Mostrar Errores en Twig</h2>
        <div class="code-block"><pre><code>{# Mostrar todos los errores del formulario #}
{{ form_errors(form) }}

{# Mostrar errores de un campo específico #}
{{ form_errors(form.email) }}

{# Verificar si hay errores #}
{% if not form.vars.valid %}
    <div class="alert alert-danger">
        El formulario contiene errores. Por favor corrígelos.
    </div>
{% endif %}

{# Iterar sobre errores de un campo #}
{% if form.email.vars.errors|length > 0 %}
    <ul class="error-list">
        {% for error in form.email.vars.errors %}
            <li>{{ error.message }}</li>
        {% endfor %}
    </ul>
{% endif %}
?></code></pre></div>

        <h2>Personalizar Mensajes de Error</h2>
        <div class="code-block"><pre><code>&lt;?php
// En la entidad
use Symfony\\Component\\Validator\\Constraints as Assert;

class User
{
    #[Assert\\NotBlank(message: 'El email no puede estar vacío')]
    #[Assert\\Email(message: 'El email "{{ value }}" no es válido')]
    private string $email;

    #[Assert\\Length(
        min: 8,
        max: 50,
        minMessage: 'La contraseña debe tener al menos {{ limit }} caracteres',
        maxMessage: 'La contraseña no puede exceder {{ limit }} caracteres'
    )]
    private string $password;

    #[Assert\\Regex(
        pattern: '/^[a-zA-Z0-9]+$/',
        message: 'El nombre de usuario solo puede contener letras y números'
    )]
    private string $username;
}
?></code></pre></div>

        <h2>Mensajes de Error en Formularios</h2>
        <div class="code-block"><pre><code>&lt;?php
// En el FormType
class UserType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('email', EmailType::class, [
                'invalid_message' => 'Por favor ingrese un email válido',
                'constraints' => [
                    new Assert\\NotBlank([
                        'message' => 'El email es obligatorio'
                    ]),
                    new Assert\\Email([
                        'message' => 'El formato del email no es válido'
                    ])
                ]
            ])
            ->add('password', PasswordType::class, [
                'invalid_message' => 'La contraseña no es válida',
                'constraints' => [
                    new Assert\\NotBlank([
                        'message' => 'La contraseña es obligatoria'
                    ]),
                    new Assert\\Length([
                        'min' => 8,
                        'minMessage' => 'La contraseña debe tener al menos {{ limit }} caracteres'
                    ])
                ]
            ]);
    }
}
?></code></pre></div>

        <h2>Traducción de Mensajes</h2>
        <div class="code-block"><pre><code># translations/validators.es.yaml

# Mensajes de validación predeterminados
"This value should not be blank.": "Este campo no puede estar vacío."
"This value is not a valid email address.": "Este no es un email válido."
"This value is too short.": "Este valor es demasiado corto."
"This value is too long.": "Este valor es demasiado largo."

# Mensajes personalizados
user.email.required: "El email es obligatorio"
user.password.too_short: "La contraseña debe tener al menos %min% caracteres"
user.username.invalid: "El nombre de usuario contiene caracteres no válidos"

# Uso en constraints
&lt;?php
#[Assert\\NotBlank(message: 'user.email.required')]
private string $email;
?></code></pre></div>

        <h2>Errores Globales del Formulario</h2>
        <div class="code-block"><pre><code>&lt;?php
// Agregar errores manualmente en el controlador

public function register(Request $request): Response
{
    $form = $this->createForm(RegistrationFormType::class);
    $form->handleRequest($request);

    if ($form->isSubmitted() && $form->isValid()) {
        $user = $form->getData();
        
        // Verificar si el email ya existe
        if ($this->userRepository->findOneBy(['email' => $user->getEmail()])) {
            // Agregar error al campo específico
            $form->get('email')->addError(
                new FormError('Este email ya está registrado')
            );
            
            return $this->render('registration/register.html.twig', [
                'form' => $form->createView(),
            ]);
        }
        
        // Agregar error global al formulario
        if (!$this->validateCaptcha($request)) {
            $form->addError(
                new FormError('La verificación CAPTCHA falló')
            );
        }
        
        // Continuar con el registro...
    }
    
    return $this->render('registration/register.html.twig', [
        'form' => $form->createView(),
    ]);
}
?></code></pre></div>

        <h2>Personalizar Renderizado de Errores</h2>
        <div class="code-block"><pre><code>{# templates/form/custom_errors.html.twig #}

{% block form_errors %}
    {% if errors|length > 0 %}
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>¡Error!</strong>
            <ul class="mb-0">
                {% for error in errors %}
                    <li>{{ error.message }}</li>
                {% endfor %}
            </ul>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    {% endif %}
{% endblock %}

{# Aplicar tema personalizado #}
{% form_theme form 'form/custom_errors.html.twig' %}
?></code></pre></div>

        <h2>Errores con Iconos y Estilos</h2>
        <div class="code-block"><pre><code>{# Template con estilos personalizados #}

<div class="form-group {% if form.email.vars.errors|length > 0 %}has-error{% endif %}">
    {{ form_label(form.email, null, {'label_attr': {'class': 'form-label'}}) }}
    
    <div class="input-group">
        {{ form_widget(form.email, {'attr': {'class': 'form-control ' ~ (form.email.vars.errors|length > 0 ? 'is-invalid' : '')}}) }}
        
        {% if form.email.vars.errors|length > 0 %}
            <span class="input-group-text text-danger">
                <i class="fas fa-exclamation-circle"></i>
            </span>
        {% endif %}
    </div>
    
    {% if form.email.vars.errors|length > 0 %}
        <div class="invalid-feedback d-block">
            {% for error in form.email.vars.errors %}
                <i class="fas fa-times-circle"></i> {{ error.message }}
            {% endfor %}
        </div>
    {% endif %}
</div>
?></code></pre></div>

        <h2>Validación en Tiempo Real con JavaScript</h2>
        <div class="code-block"><pre><code>{# Validación mientras el usuario escribe #}

<div class="form-group">
    {{ form_label(form.email) }}
    {{ form_widget(form.email, {'attr': {'id': 'email-input', 'class': 'form-control'}}) }}
    <div id="email-error" class="invalid-feedback"></div>
</div>

<script>
const emailInput = document.getElementById('email-input');
const emailError = document.getElementById('email-error');

emailInput.addEventListener('blur', async function() {
    const email = this.value;
    
    // Validación básica del lado del cliente
    if (!email) {
        showError('El email es obligatorio');
        return;
    }
    
    if (!isValidEmail(email)) {
        showError('El formato del email no es válido');
        return;
    }
    
    // Validación asíncrona con el servidor
    try {
        const response = await fetch('/api/validate-email', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email: email})
        });
        
        const data = await response.json();
        
        if (!data.valid) {
            showError(data.message);
        } else {
            clearError();
        }
    } catch (error) {
        console.error('Error validando email:', error);
    }
});

function showError(message) {
    emailInput.classList.add('is-invalid');
    emailError.textContent = message;
    emailError.style.display = 'block';
}

function clearError() {
    emailInput.classList.remove('is-invalid');
    emailError.textContent = '';
    emailError.style.display = 'none';
}

function isValidEmail(email) {
    return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
}
</script>
?></code></pre></div>

        <h2>Mensajes Flash para Errores Globales</h2>
        <div class="code-block"><pre><code>&lt;?php
// En el controlador
if ($form->isSubmitted() && !$form->isValid()) {
    $this->addFlash('error', 'El formulario contiene errores. Por favor revísalo.');
}

// En Twig
{% for message in app.flashes('error') %}
    <div class="alert alert-danger alert-dismissible">
        {{ message }}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
{% endfor %}
?></code></pre></div>

        <h2>Agrupar Errores por Tipo</h2>
        <div class="code-block"><pre><code>{# Mostrar resumen de errores al inicio del formulario #}

{% if not form.vars.valid %}
    <div class="alert alert-danger">
        <h4>Por favor corrige los siguientes errores:</h4>
        <ul>
            {% for child in form.children %}
                {% if child.vars.errors|length > 0 %}
                    <li>
                        <strong>{{ child.vars.label }}:</strong>
                        <ul>
                            {% for error in child.vars.errors %}
                                <li>{{ error.message }}</li>
                            {% endfor %}
                        </ul>
                    </li>
                {% endif %}
            {% endfor %}
        </ul>
    </div>
{% endif %}
?></code></pre></div>

        <h2>Validación Condicional con Mensajes Dinámicos</h2>
        <div class="code-block"><pre><code>&lt;?php
use Symfony\\Component\\Validator\\Context\\ExecutionContextInterface;

class Order
{
    #[Assert\\Callback]
    public function validate(ExecutionContextInterface $context): void
    {
        // Validación compleja con mensaje dinámico
        if ($this->total < 10 && $this->shippingMethod === 'express') {
            $context->buildViolation('El envío express requiere un pedido mínimo de {{ min }}€')
                ->setParameter('{{ min }}', '10')
                ->atPath('shippingMethod')
                ->addViolation();
        }
        
        if ($this->items->count() === 0) {
            $context->buildViolation('Debe agregar al menos un artículo al pedido')
                ->atPath('items')
                ->addViolation();
        }
    }
}
?></code></pre></div>

        <h2>Errores en API REST</h2>
        <div class="code-block"><pre><code>&lt;?php
// Retornar errores como JSON

#[Route('/api/user', methods: ['POST'])]
public function createUser(Request $request, ValidatorInterface $validator): JsonResponse
{
    $data = json_decode($request->getContent(), true);
    
    $user = new User();
    $user->setEmail($data['email'] ?? '');
    $user->setPassword($data['password'] ?? '');
    
    $errors = $validator->validate($user);
    
    if (count($errors) > 0) {
        $errorMessages = [];
        
        foreach ($errors as $error) {
            $errorMessages[$error->getPropertyPath()][] = $error->getMessage();
        }
        
        return $this->json([
            'success' => false,
            'errors' => $errorMessages
        ], 400);
    }
    
    // Guardar usuario...
    
    return $this->json([
        'success' => true,
        'user' => ['id' => $user->getId()]
    ], 201);
}

// Respuesta JSON de error:
{
    "success": false,
    "errors": {
        "email": ["El email no puede estar vacío", "El email no es válido"],
        "password": ["La contraseña debe tener al menos 8 caracteres"]
    }
}
?></code></pre></div>

        <h2>Logging de Errores de Validación</h2>
        <div class="code-block"><pre><code>&lt;?php
use Psr\\Log\\LoggerInterface;

class UserController extends AbstractController
{
    public function register(
        Request $request,
        LoggerInterface $logger
    ): Response {
        $form = $this->createForm(RegistrationFormType::class);
        $form->handleRequest($request);

        if ($form->isSubmitted() && !$form->isValid()) {
            // Registrar errores de validación
            foreach ($form->getErrors(true) as $error) {
                $logger->warning('Validation error', [
                    'field' => $error->getOrigin()?->getName(),
                    'message' => $error->getMessage(),
                    'user_ip' => $request->getClientIp()
                ]);
            }
        }
        
        // ...
    }
}
?></code></pre></div>

        <div class="success-box">
            <strong>✅ Mejores Prácticas:</strong><br>
            • <strong>Mensajes claros</strong>: Explicar qué está mal y cómo corregirlo<br>
            • <strong>Posición visible</strong>: Mostrar errores cerca del campo afectado<br>
            • <strong>Estilo consistente</strong>: Usar colores y iconos uniformes<br>
            • <strong>Validación progresiva</strong>: Cliente primero, servidor después<br>
            • <strong>Feedback inmediato</strong>: Validar mientras el usuario escribe<br>
            • <strong>Accesibilidad</strong>: Usar aria-labels y roles ARIA
        </div>

        <div class="warning-box">
            <strong>⚠️ Errores Comunes:</strong><br>
            • No mostrar errores claramente<br>
            • Mensajes técnicos incomprensibles<br>
            • Perder datos del formulario al recargar<br>
            • No validar en el servidor (solo cliente)<br>
            • Errores genéricos sin contexto
        </div>

        <div class="info-box">
            <strong>🎯 Resumen:</strong><br>
            • <strong>form_errors()</strong>: Renderiza errores en Twig<br>
            • <strong>addError()</strong>: Agregar errores manualmente<br>
            • <strong>Mensajes personalizados</strong>: En constraints y FormTypes<br>
            • <strong>Traducción</strong>: validators.yaml para i18n<br>
            • <strong>Validación en tiempo real</strong>: JavaScript + API<br>
            • <strong>Errores API</strong>: JSON estructurado para REST
        </div>
    `,
    
    // 5. Seguridad y Autenticación
    'firewall-seguridad-acceso': `
        <h1>Firewall de Seguridad y Acceso</h1>
        
        <p>El <strong>Security Firewall</strong> de Symfony es el componente central del sistema de seguridad. Define cómo se autentica a los usuarios, qué rutas están protegidas y qué permisos se requieren para acceder a cada sección.</p>

        <h2>Instalación del Componente Security</h2>
        <div class="code-block"><pre><code>composer require symfony/security-bundle
?></code></pre></div>

        <h2>Configuración Básica del Firewall</h2>
        <div class="code-block"><pre><code># config/packages/security.yaml

security:
    # Configurar el hasher de contraseñas
    password_hashers:
        Symfony\\Component\\Security\\Core\\User\\PasswordAuthenticatedUserInterface: 'auto'
    
    # Proveedores de usuarios
    providers:
        app_user_provider:
            entity:
                class: App\\Entity\\User
                property: email
    
    # Configuración del firewall
    firewalls:
        dev:
            pattern: ^/(_(profiler|wdt)|css|images|js)/
            security: false
        
        main:
            lazy: true
            provider: app_user_provider
            
            # Punto de entrada para usuarios no autenticados
            entry_point: form_login
            
            # Formulario de login
            form_login:
                login_path: app_login
                check_path: app_login
                enable_csrf: true
            
            # Logout
            logout:
                path: app_logout
                target: app_home
            
            # Remember me
            remember_me:
                secret: '%kernel.secret%'
                lifetime: 604800  # 1 semana en segundos
                path: /
    
    # Control de acceso
    access_control:
        - { path: ^/admin, roles: ROLE_ADMIN }
        - { path: ^/profile, roles: ROLE_USER }
?></code></pre></div>

        <h2>Múltiples Firewalls</h2>
        <div class="code-block"><pre><code># Configurar diferentes firewalls para diferentes secciones

security:
    firewalls:
        # Firewall para API (sin estado, usa tokens)
        api:
            pattern: ^/api
            stateless: true
            provider: app_user_provider
            custom_authenticators:
                - App\\Security\\ApiTokenAuthenticator
        
        # Firewall para área de administración
        admin:
            pattern: ^/admin
            provider: admin_user_provider
            form_login:
                login_path: admin_login
                check_path: admin_login
                default_target_path: admin_dashboard
            logout:
                path: admin_logout
                target: admin_login
        
        # Firewall principal para usuarios normales
        main:
            pattern: ^/
            lazy: true
            provider: app_user_provider
            form_login:
                login_path: app_login
                check_path: app_login
            logout:
                path: app_logout
    
    access_control:
        - { path: ^/api/login, roles: PUBLIC_ACCESS }
        - { path: ^/api, roles: ROLE_USER }
        - { path: ^/admin/login, roles: PUBLIC_ACCESS }
        - { path: ^/admin, roles: ROLE_ADMIN }
        - { path: ^/login, roles: PUBLIC_ACCESS }
        - { path: ^/register, roles: PUBLIC_ACCESS }
        - { path: ^/profile, roles: ROLE_USER }
?></code></pre></div>

        <h2>Controlador de Login</h2>
        <div class="code-block"><pre><code>&lt;?php
// src/Controller/SecurityController.php

namespace App\\Controller;

use Symfony\\Bundle\\FrameworkBundle\\Controller\\AbstractController;
use Symfony\\Component\\HttpFoundation\\Response;
use Symfony\\Component\\Routing\\Attribute\\Route;
use Symfony\\Component\\Security\\Http\\Authentication\\AuthenticationUtils;

class SecurityController extends AbstractController
{
    #[Route('/login', name: 'app_login')]
    public function login(AuthenticationUtils $authenticationUtils): Response
    {
        // Si el usuario ya está autenticado, redirigir
        if ($this->getUser()) {
            return $this->redirectToRoute('app_dashboard');
        }

        // Obtener error de login si existe
        $error = $authenticationUtils->getLastAuthenticationError();
        
        // Último username ingresado
        $lastUsername = $authenticationUtils->getLastUsername();

        return $this->render('security/login.html.twig', [
            'last_username' => $lastUsername,
            'error' => $error,
        ]);
    }

    #[Route('/logout', name: 'app_logout')]
    public function logout(): void
    {
        // Este método puede estar vacío
        // Symfony intercepta esta ruta automáticamente
        throw new \\LogicException('This method can be blank - it will be intercepted by the logout key on your firewall.');
    }
}
?></code></pre></div>

        <h2>Template de Login</h2>
        <div class="code-block"><pre><code>{# templates/security/login.html.twig #}

{% extends 'base.html.twig' %}

{% block title %}Iniciar Sesión{% endblock %}

{% block body %}
<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-6">
            <div class="card mt-5">
                <div class="card-header">
                    <h3>Iniciar Sesión</h3>
                </div>
                <div class="card-body">
                    {% if error %}
                        <div class="alert alert-danger">
                            {{ error.messageKey|trans(error.messageData, 'security') }}
                        </div>
                    {% endif %}

                    <form method="post">
                        <div class="mb-3">
                            <label for="username" class="form-label">Email</label>
                            <input type="email" 
                                   class="form-control" 
                                   id="username" 
                                   name="_username" 
                                   value="{{ last_username }}" 
                                   required 
                                   autofocus>
                        </div>

                        <div class="mb-3">
                            <label for="password" class="form-label">Contraseña</label>
                            <input type="password" 
                                   class="form-control" 
                                   id="password" 
                                   name="_password" 
                                   required>
                        </div>

                        <div class="mb-3 form-check">
                            <input type="checkbox" 
                                   class="form-check-input" 
                                   id="remember_me" 
                                   name="_remember_me">
                            <label class="form-check-label" for="remember_me">
                                Recordarme
                            </label>
                        </div>

                        <input type="hidden" name="_csrf_token" value="{{ csrf_token('authenticate') }}">

                        <button type="submit" class="btn btn-primary w-100">
                            Iniciar Sesión
                        </button>
                    </form>

                    <div class="mt-3 text-center">
                        <a href="{{ path('app_forgot_password') }}">¿Olvidaste tu contraseña?</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
{% endblock %}
?></code></pre></div>

        <h2>Control de Acceso Avanzado</h2>
        <div class="code-block"><pre><code># Configuración avanzada de access_control

security:
    access_control:
        # Permitir acceso público
        - { path: ^/login, roles: PUBLIC_ACCESS }
        - { path: ^/register, roles: PUBLIC_ACCESS }
        
        # Requerir autenticación
        - { path: ^/profile, roles: ROLE_USER }
        
        # Requerir rol específico
        - { path: ^/admin, roles: ROLE_ADMIN }
        
        # Múltiples roles (OR)
        - { path: ^/moderator, roles: [ROLE_MODERATOR, ROLE_ADMIN] }
        
        # Requerir HTTPS
        - { path: ^/secure, roles: ROLE_USER, requires_channel: https }
        
        # Restringir por IP
        - { path: ^/internal, roles: ROLE_USER, ips: [127.0.0.1, ::1] }
        
        # Restringir por método HTTP
        - { path: ^/api/admin, roles: ROLE_ADMIN, methods: [POST, PUT, DELETE] }
        
        # Combinar condiciones
        - { path: ^/super-admin, roles: ROLE_SUPER_ADMIN, requires_channel: https, ips: [192.168.1.0/24] }
?></code></pre></div>

        <h2>Proteger Controladores con Atributos</h2>
        <div class="code-block"><pre><code>&lt;?php
use Symfony\\Component\\Security\\Http\\Attribute\\IsGranted;

// Proteger toda la clase
#[IsGranted('ROLE_ADMIN')]
class AdminController extends AbstractController
{
    // Todos los métodos requieren ROLE_ADMIN
    
    #[Route('/admin/dashboard')]
    public function dashboard(): Response
    {
        return $this->render('admin/dashboard.html.twig');
    }
    
    // Requerir rol adicional para método específico
    #[IsGranted('ROLE_SUPER_ADMIN')]
    #[Route('/admin/settings')]
    public function settings(): Response
    {
        return $this->render('admin/settings.html.twig');
    }
}

// Proteger métodos individuales
class ProductController extends AbstractController
{
    #[Route('/products')]
    public function list(): Response
    {
        // Acceso público
        return $this->render('product/list.html.twig');
    }
    
    #[IsGranted('ROLE_USER')]
    #[Route('/products/new')]
    public function new(): Response
    {
        // Solo usuarios autenticados
        return $this->render('product/new.html.twig');
    }
    
    #[IsGranted('ROLE_ADMIN')]
    #[Route('/products/{id}/delete')]
    public function delete(Product $product): Response
    {
        // Solo administradores
        return $this->redirectToRoute('product_list');
    }
}
?></code></pre></div>

        <h2>Verificación Manual de Permisos</h2>
        <div class="code-block"><pre><code>&lt;?php
class PostController extends AbstractController
{
    #[Route('/post/{id}/edit')]
    public function edit(Post $post): Response
    {
        // Verificar si el usuario tiene permiso
        $this->denyAccessUnlessGranted('ROLE_USER');
        
        // Verificar si el usuario es el autor
        if ($post->getAuthor() !== $this->getUser()) {
            throw $this->createAccessDeniedException('No tienes permiso para editar este post');
        }
        
        // O usar denyAccessUnlessGranted con subject
        $this->denyAccessUnlessGranted('EDIT', $post);
        
        return $this->render('post/edit.html.twig', ['post' => $post]);
    }
    
    #[Route('/post/{id}')]
    public function show(Post $post, Security $security): Response
    {
        // Verificar sin lanzar excepción
        if ($security->isGranted('ROLE_ADMIN')) {
            // Mostrar opciones de administrador
        }
        
        if ($security->isGranted('EDIT', $post)) {
            // Mostrar botón de editar
        }
        
        return $this->render('post/show.html.twig', ['post' => $post]);
    }
}
?></code></pre></div>

        <h2>Verificación en Twig</h2>
        <div class="code-block"><pre><code>{# Verificar si el usuario está autenticado #}
{% if is_granted('IS_AUTHENTICATED_FULLY') %}
    <p>Bienvenido, {{ app.user.username }}!</p>
{% endif %}

{# Verificar rol #}
{% if is_granted('ROLE_ADMIN') %}
    <a href="{{ path('admin_dashboard') }}" class="btn btn-primary">Panel Admin</a>
{% endif %}

{# Verificar múltiples roles #}
{% if is_granted('ROLE_MODERATOR') or is_granted('ROLE_ADMIN') %}
    <button class="btn btn-warning">Moderar</button>
{% endif %}

{# Verificar permiso sobre objeto #}
{% if is_granted('EDIT', post) %}
    <a href="{{ path('post_edit', {id: post.id}) }}" class="btn btn-secondary">Editar</a>
{% endif %}

{# Obtener usuario actual #}
{% if app.user %}
    <p>Email: {{ app.user.email }}</p>
    <p>Roles: {{ app.user.roles|join(', ') }}</p>
{% endif %}
?></code></pre></div>

        <h2>Redirección Después del Login</h2>
        <div class="code-block"><pre><code># Configurar redirección por defecto

security:
    firewalls:
        main:
            form_login:
                # Ruta por defecto después del login
                default_target_path: app_dashboard
                
                # Siempre redirigir a esta ruta (ignorar target_path)
                always_use_default_target_path: false
                
                # Ruta si el login falla
                failure_path: app_login
                
                # Usar el referer como target
                use_referer: true

# En el controlador
public function someAction(): Response
{
    // Guardar URL de destino antes de redirigir al login
    return $this->redirectToRoute('app_login', [
        '_target_path' => $this->generateUrl('app_profile')
    ]);
}

# En Twig
<a href="{{ path('app_login', {'_target_path': path('app_dashboard')}) }}">Login</a>
?></code></pre></div>

        <h2>Eventos de Seguridad</h2>
        <div class="code-block"><pre><code>&lt;?php
// src/EventListener/LoginListener.php

namespace App\\EventListener;

use Symfony\\Component\\EventDispatcher\\Attribute\\AsEventListener;
use Symfony\\Component\\Security\\Http\\Event\\LoginSuccessEvent;
use Symfony\\Component\\Security\\Http\\Event\\LoginFailureEvent;
use Symfony\\Component\\Security\\Http\\Event\\LogoutEvent;
use Psr\\Log\\LoggerInterface;

#[AsEventListener(event: LoginSuccessEvent::class)]
class LoginListener
{
    public function __construct(
        private LoggerInterface $logger
    ) {}

    public function __invoke(LoginSuccessEvent $event): void
    {
        $user = $event->getUser();
        $request = $event->getRequest();
        
        // Registrar login exitoso
        $this->logger->info('User logged in', [
            'username' => $user->getUserIdentifier(),
            'ip' => $request->getClientIp()
        ]);
        
        // Actualizar último login
        if (method_exists($user, 'setLastLoginAt')) {
            $user->setLastLoginAt(new \\DateTime());
        }
    }
}

#[AsEventListener(event: LoginFailureEvent::class)]
class LoginFailureListener
{
    public function __construct(
        private LoggerInterface $logger
    ) {}

    public function __invoke(LoginFailureEvent $event): void
    {
        $request = $event->getRequest();
        
        $this->logger->warning('Login failed', [
            'username' => $request->request->get('_username'),
            'ip' => $request->getClientIp()
        ]);
    }
}

#[AsEventListener(event: LogoutEvent::class)]
class LogoutListener
{
    public function __invoke(LogoutEvent $event): void
    {
        $token = $event->getToken();
        
        if ($token && $user = $token->getUser()) {
            // Lógica al cerrar sesión
        }
    }
}
?></code></pre></div>

        <div class="success-box">
            <strong>✅ Conceptos Clave del Firewall:</strong><br>
            • <strong>Firewall</strong>: Define cómo se autentica y autoriza<br>
            • <strong>Provider</strong>: Carga usuarios desde BD, memoria, etc.<br>
            • <strong>Entry Point</strong>: Qué hacer si usuario no autenticado<br>
            • <strong>Access Control</strong>: Reglas de acceso por ruta<br>
            • <strong>Stateless</strong>: Para APIs sin sesión<br>
            • <strong>Lazy</strong>: No cargar usuario hasta que sea necesario
        </div>

        <div class="warning-box">
            <strong>⚠️ Buenas Prácticas:</strong><br>
            • Usar HTTPS en producción<br>
            • Habilitar CSRF en formularios<br>
            • Configurar remember_me con secret seguro<br>
            • Usar roles jerárquicos (ROLE_ADMIN hereda ROLE_USER)<br>
            • Proteger rutas sensibles con access_control<br>
            • Registrar intentos de login fallidos
        </div>
    `,
    'autenticacion-sesiones-tokens-jwt': `
        <h1>Autenticación Basada en Sesiones, Tokens y JWT</h1>
        
        <p>Symfony soporta múltiples métodos de autenticación: <strong>sesiones</strong> (tradicional para aplicaciones web), <strong>tokens API</strong> y <strong>JWT</strong> (JSON Web Tokens) para APIs RESTful y aplicaciones SPA.</p>

        <h2>1. Autenticación por Sesión (Tradicional)</h2>
        
        <h3>Configuración Básica</h3>
        <div class="code-block"><pre><code># config/packages/security.yaml

security:
    firewalls:
        main:
            lazy: true
            provider: app_user_provider
            
            # Autenticación con formulario
            form_login:
                login_path: app_login
                check_path: app_login
                enable_csrf: true
                default_target_path: app_dashboard
            
            # Logout
            logout:
                path: app_logout
                target: app_home
            
            # Remember me (cookie persistente)
            remember_me:
                secret: '%kernel.secret%'
                lifetime: 2592000  # 30 días
                path: /
                name: REMEMBERME
                secure: true  # Solo HTTPS en producción
                httponly: true
                samesite: lax
?></code></pre></div>

        <h3>Entidad User para Sesiones</h3>
        <div class="code-block"><pre><code>&lt;?php
// src/Entity/User.php

namespace App\\Entity;

use Doctrine\\ORM\\Mapping as ORM;
use Symfony\\Component\\Security\\Core\\User\\PasswordAuthenticatedUserInterface;
use Symfony\\Component\\Security\\Core\\User\\UserInterface;

#[ORM\\Entity]
#[ORM\\Table(name: 'users')]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\\Id]
    #[ORM\\GeneratedValue]
    #[ORM\\Column]
    private ?int $id = null;

    #[ORM\\Column(length: 180, unique: true)]
    private string $email;

    #[ORM\\Column]
    private array $roles = [];

    #[ORM\\Column]
    private string $password;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function setEmail(string $email): self
    {
        $this->email = $email;
        return $this;
    }

    /**
     * Identificador único del usuario (usado por Symfony)
     */
    public function getUserIdentifier(): string
    {
        return $this->email;
    }

    public function getRoles(): array
    {
        $roles = $this->roles;
        // Garantizar que todo usuario tenga al menos ROLE_USER
        $roles[] = 'ROLE_USER';
        
        return array_unique($roles);
    }

    public function setRoles(array $roles): self
    {
        $this->roles = $roles;
        return $this;
    }

    public function getPassword(): string
    {
        return $this->password;
    }

    public function setPassword(string $password): self
    {
        $this->password = $password;
        return $this;
    }

    /**
     * Borrar datos sensibles (si se almacenan temporalmente)
     */
    public function eraseCredentials(): void
    {
        // Si almacenas contraseña temporal, límpiala aquí
        // $this->plainPassword = null;
    }
}
?></code></pre></div>

        <h2>2. Autenticación con API Token</h2>
        
        <h3>Crear Authenticator Personalizado</h3>
        <div class="code-block"><pre><code>&lt;?php
// src/Security/ApiTokenAuthenticator.php

namespace App\\Security;

use App\\Repository\\UserRepository;
use Symfony\\Component\\HttpFoundation\\JsonResponse;
use Symfony\\Component\\HttpFoundation\\Request;
use Symfony\\Component\\HttpFoundation\\Response;
use Symfony\\Component\\Security\\Core\\Authentication\\Token\\TokenInterface;
use Symfony\\Component\\Security\\Core\\Exception\\AuthenticationException;
use Symfony\\Component\\Security\\Http\\Authenticator\\AbstractAuthenticator;
use Symfony\\Component\\Security\\Http\\Authenticator\\Passport\\Badge\\UserBadge;
use Symfony\\Component\\Security\\Http\\Authenticator\\Passport\\Passport;
use Symfony\\Component\\Security\\Http\\Authenticator\\Passport\\SelfValidatingPassport;

class ApiTokenAuthenticator extends AbstractAuthenticator
{
    public function __construct(
        private UserRepository $userRepository
    ) {}

    public function supports(Request $request): ?bool
    {
        // Verificar si la petición tiene el header Authorization
        return $request->headers->has('Authorization');
    }

    public function authenticate(Request $request): Passport
    {
        $authHeader = $request->headers->get('Authorization');
        
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            throw new AuthenticationException('Token no proporcionado');
        }

        // Extraer token
        $apiToken = substr($authHeader, 7);

        if (!$apiToken) {
            throw new AuthenticationException('Token vacío');
        }

        // Retornar passport con el token
        return new SelfValidatingPassport(
            new UserBadge($apiToken, function($apiToken) {
                // Buscar usuario por token
                $user = $this->userRepository->findOneBy(['apiToken' => $apiToken]);
                
                if (!$user) {
                    throw new AuthenticationException('Token inválido');
                }
                
                return $user;
            })
        );
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        // No hacer nada, dejar que la petición continúe
        return null;
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        return new JsonResponse([
            'message' => $exception->getMessage()
        ], Response::HTTP_UNAUTHORIZED);
    }
}
?></code></pre></div>

        <h3>Configurar Firewall para API</h3>
        <div class="code-block"><pre><code># config/packages/security.yaml

security:
    firewalls:
        api:
            pattern: ^/api
            stateless: true
            provider: app_user_provider
            custom_authenticators:
                - App\\Security\\ApiTokenAuthenticator
    
    access_control:
        - { path: ^/api/login, roles: PUBLIC_ACCESS }
        - { path: ^/api, roles: ROLE_USER }
?></code></pre></div>

        <h3>Generar Token para Usuario</h3>
        <div class="code-block"><pre><code>&lt;?php
// Agregar campo apiToken a la entidad User

#[ORM\\Column(type: 'string', length: 64, unique: true, nullable: true)]
private ?string $apiToken = null;

public function getApiToken(): ?string
{
    return $this->apiToken;
}

public function setApiToken(?string $apiToken): self
{
    $this->apiToken = $apiToken;
    return $this;
}

// Generar token al crear usuario o en endpoint de login
public function generateApiToken(): void
{
    $this->apiToken = bin2hex(random_bytes(32));
}

// Controlador de login API
#[Route('/api/login', name: 'api_login', methods: ['POST'])]
public function apiLogin(
    Request $request,
    UserRepository $userRepository,
    UserPasswordHasherInterface $passwordHasher,
    EntityManagerInterface $em
): JsonResponse {
    $data = json_decode($request->getContent(), true);
    
    $user = $userRepository->findOneBy(['email' => $data['email'] ?? '']);
    
    if (!$user || !$passwordHasher->isPasswordValid($user, $data['password'] ?? '')) {
        return $this->json(['message' => 'Credenciales inválidas'], 401);
    }
    
    // Generar nuevo token
    $user->generateApiToken();
    $em->flush();
    
    return $this->json([
        'token' => $user->getApiToken(),
        'user' => [
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'roles' => $user->getRoles()
        ]
    ]);
}
?></code></pre></div>

        <h2>3. Autenticación con JWT (JSON Web Tokens)</h2>
        
        <h3>Instalación de LexikJWTAuthenticationBundle</h3>
        <div class="code-block"><pre><code>composer require lexik/jwt-authentication-bundle

# Generar claves SSH
php bin/console lexik:jwt:generate-keypair
?></code></pre></div>

        <h3>Configuración JWT</h3>
        <div class="code-block"><pre><code># config/packages/lexik_jwt_authentication.yaml

lexik_jwt_authentication:
    secret_key: '%env(resolve:JWT_SECRET_KEY)%'
    public_key: '%env(resolve:JWT_PUBLIC_KEY)%'
    pass_phrase: '%env(JWT_PASSPHRASE)%'
    token_ttl: 3600  # 1 hora

# .env
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=your_passphrase
?></code></pre></div>

        <h3>Configurar Firewall JWT</h3>
        <div class="code-block"><pre><code># config/packages/security.yaml

security:
    firewalls:
        login:
            pattern: ^/api/login
            stateless: true
            json_login:
                check_path: /api/login_check
                success_handler: lexik_jwt_authentication.handler.authentication_success
                failure_handler: lexik_jwt_authentication.handler.authentication_failure
        
        api:
            pattern: ^/api
            stateless: true
            jwt: ~
    
    access_control:
        - { path: ^/api/login, roles: PUBLIC_ACCESS }
        - { path: ^/api, roles: ROLE_USER }
?></code></pre></div>

        <h3>Rutas para JWT</h3>
        <div class="code-block"><pre><code># config/routes.yaml

api_login_check:
    path: /api/login_check
?></code></pre></div>

        <h3>Usar JWT desde Cliente</h3>
        <div class="code-block"><pre><code>// Login y obtener token
fetch('/api/login_check', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        username: 'user@example.com',
        password: 'password123'
    })
})
.then(response => response.json())
.then(data => {
    // Guardar token
    localStorage.setItem('jwt_token', data.token);
    console.log('Token:', data.token);
});

// Hacer petición autenticada
const token = localStorage.getItem('jwt_token');

fetch('/api/protected-resource', {
    method: 'GET',
    headers: {
        'Authorization': \`Bearer \${token}\`
    }
})
.then(response => response.json())
.then(data => console.log(data));
?></code></pre></div>

        <h3>Personalizar Payload del JWT</h3>
        <div class="code-block"><pre><code>&lt;?php
// src/EventListener/JWTCreatedListener.php

namespace App\\EventListener;

use Lexik\\Bundle\\JWTAuthenticationBundle\\Event\\JWTCreatedEvent;
use Symfony\\Component\\EventDispatcher\\Attribute\\AsEventListener;

#[AsEventListener(event: 'lexik_jwt_authentication.on_jwt_created')]
class JWTCreatedListener
{
    public function __invoke(JWTCreatedEvent $event): void
    {
        $user = $event->getUser();
        $payload = $event->getData();
        
        // Agregar datos personalizados al token
        $payload['id'] = $user->getId();
        $payload['email'] = $user->getEmail();
        $payload['roles'] = $user->getRoles();
        
        $event->setData($payload);
    }
}

// Decodificar JWT en el controlador
#[Route('/api/me', methods: ['GET'])]
public function me(): JsonResponse
{
    $user = $this->getUser();
    
    return $this->json([
        'id' => $user->getId(),
        'email' => $user->getEmail(),
        'roles' => $user->getRoles()
    ]);
}
?></code></pre></div>

        <h3>Refresh Token</h3>
        <div class="code-block"><pre><code>composer require gesdinet/jwt-refresh-token-bundle

# config/packages/gesdinet_jwt_refresh_token.yaml
gesdinet_jwt_refresh_token:
    ttl: 2592000  # 30 días
    
# config/routes.yaml
api_refresh_token:
    path: /api/token/refresh

# Uso desde cliente
fetch('/api/token/refresh', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        refresh_token: refreshToken
    })
})
.then(response => response.json())
.then(data => {
    localStorage.setItem('jwt_token', data.token);
    localStorage.setItem('refresh_token', data.refresh_token);
});
?></code></pre></div>

        <h2>Comparación de Métodos</h2>
        <div class="code-block"><pre><code>┌─────────────────┬──────────────┬──────────────┬──────────────┐
│ Característica  │   Sesión     │  API Token   │     JWT      │
├─────────────────┼──────────────┼──────────────┼──────────────┤
│ Stateful        │      Sí      │      Sí      │      No      │
│ Escalabilidad   │    Baja      │    Media     │     Alta     │
│ Uso típico      │  Web apps    │  APIs simples│  APIs REST   │
│ Almacenamiento  │   Servidor   │   Base datos │   Cliente    │
│ Expiración      │  Configurable│  Manual      │  Automática  │
│ Revocación      │    Fácil     │    Fácil     │   Compleja   │
│ Overhead        │    Bajo      │    Medio     │     Bajo     │
└─────────────────┴──────────────┴──────────────┴──────────────┘
?></code></pre></div>

        <div class="success-box">
            <strong>✅ Cuándo Usar Cada Método:</strong><br>
            • <strong>Sesiones</strong>: Aplicaciones web tradicionales, SSR<br>
            • <strong>API Token</strong>: APIs internas, integraciones simples<br>
            • <strong>JWT</strong>: SPAs, aplicaciones móviles, microservicios<br>
            • <strong>Combinado</strong>: Web con sesiones + API con JWT
        </div>

        <div class="info-box">
            <strong>🎯 Seguridad:</strong><br>
            • <strong>Sesiones</strong>: Usar HTTPS, httpOnly cookies, CSRF protection<br>
            • <strong>Tokens</strong>: Almacenar de forma segura, rotar periódicamente<br>
            • <strong>JWT</strong>: TTL corto, refresh tokens, validar firma<br>
            • <strong>General</strong>: Rate limiting, logging, 2FA
        </div>
    `,
    'proveedores-usuarios': `
        <h1>Proveedores de Usuarios</h1>
        
        <p>Los <strong>User Providers</strong> son responsables de cargar usuarios desde diferentes fuentes (base de datos, memoria, LDAP, API externa). Symfony proporciona varios proveedores integrados y permite crear proveedores personalizados.</p>

        <h2>1. Entity User Provider (Base de Datos)</h2>
        
        <h3>Configuración Básica</h3>
        <div class="code-block"><pre><code># config/packages/security.yaml

security:
    providers:
        app_user_provider:
            entity:
                class: App\\Entity\\User
                property: email  # Campo único para identificar usuario
?></code></pre></div>

        <h3>Entidad User Completa</h3>
        <div class="code-block"><pre><code>&lt;?php
// src/Entity/User.php

namespace App\\Entity;

use App\\Repository\\UserRepository;
use Doctrine\\ORM\\Mapping as ORM;
use Symfony\\Bridge\\Doctrine\\Validator\\Constraints\\UniqueEntity;
use Symfony\\Component\\Security\\Core\\User\\PasswordAuthenticatedUserInterface;
use Symfony\\Component\\Security\\Core\\User\\UserInterface;

#[ORM\\Entity(repositoryClass: UserRepository::class)]
#[ORM\\Table(name: 'users')]
#[UniqueEntity(fields: ['email'], message: 'Ya existe una cuenta con este email')]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\\Id]
    #[ORM\\GeneratedValue]
    #[ORM\\Column]
    private ?int $id = null;

    #[ORM\\Column(length: 180, unique: true)]
    private string $email;

    #[ORM\\Column]
    private array $roles = [];

    #[ORM\\Column]
    private string $password;

    #[ORM\\Column(length: 255, nullable: true)]
    private ?string $name = null;

    #[ORM\\Column(type: 'boolean')]
    private bool $isVerified = false;

    #[ORM\\Column(type: 'datetime_immutable')]
    private \\DateTimeImmutable $createdAt;

    #[ORM\\Column(type: 'datetime_immutable', nullable: true)]
    private ?\\DateTimeImmutable $lastLoginAt = null;

    public function __construct()
    {
        $this->createdAt = new \\DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function setEmail(string $email): self
    {
        $this->email = $email;
        return $this;
    }

    public function getUserIdentifier(): string
    {
        return $this->email;
    }

    public function getRoles(): array
    {
        $roles = $this->roles;
        $roles[] = 'ROLE_USER';
        return array_unique($roles);
    }

    public function setRoles(array $roles): self
    {
        $this->roles = $roles;
        return $this;
    }

    public function getPassword(): string
    {
        return $this->password;
    }

    public function setPassword(string $password): self
    {
        $this->password = $password;
        return $this;
    }

    public function eraseCredentials(): void
    {
        // Limpiar datos sensibles temporales
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(?string $name): self
    {
        $this->name = $name;
        return $this;
    }

    public function isVerified(): bool
    {
        return $this->isVerified;
    }

    public function setIsVerified(bool $isVerified): self
    {
        $this->isVerified = $isVerified;
        return $this;
    }

    public function getLastLoginAt(): ?\\DateTimeImmutable
    {
        return $this->lastLoginAt;
    }

    public function setLastLoginAt(?\\DateTimeImmutable $lastLoginAt): self
    {
        $this->lastLoginAt = $lastLoginAt;
        return $this;
    }
}
?></code></pre></div>

        <h2>2. Memory User Provider (Usuarios en Configuración)</h2>
        
        <div class="code-block"><pre><code># config/packages/security.yaml

security:
    providers:
        in_memory_provider:
            memory:
                users:
                    admin@example.com:
                        password: '$2y$13$hashed_password_here'
                        roles: ['ROLE_ADMIN']
                    user@example.com:
                        password: '$2y$13$another_hashed_password'
                        roles: ['ROLE_USER']
    
    firewalls:
        main:
            provider: in_memory_provider
            # ...

# Generar password hasheado
php bin/console security:hash-password
?></code></pre></div>

        <h2>3. Chain Provider (Múltiples Proveedores)</h2>
        
        <div class="code-block"><pre><code># Combinar múltiples proveedores

security:
    providers:
        # Provider de base de datos
        database_users:
            entity:
                class: App\\Entity\\User
                property: email
        
        # Provider de memoria (para admin de emergencia)
        admin_users:
            memory:
                users:
                    emergency_admin:
                        password: '$2y$13$hashed_password'
                        roles: ['ROLE_SUPER_ADMIN']
        
        # Chain provider: busca en ambos
        all_users:
            chain:
                providers: ['database_users', 'admin_users']
    
    firewalls:
        main:
            provider: all_users
?></code></pre></div>

        <h2>4. Custom User Provider</h2>
        
        <h3>Crear Provider Personalizado</h3>
        <div class="code-block"><pre><code>&lt;?php
// src/Security/ApiUserProvider.php

namespace App\\Security;

use App\\Entity\\User;
use Symfony\\Component\\Security\\Core\\Exception\\UnsupportedUserException;
use Symfony\\Component\\Security\\Core\\Exception\\UserNotFoundException;
use Symfony\\Component\\Security\\Core\\User\\UserInterface;
use Symfony\\Component\\Security\\Core\\User\\UserProviderInterface;
use Symfony\\Contracts\\HttpClient\\HttpClientInterface;

class ApiUserProvider implements UserProviderInterface
{
    public function __construct(
        private HttpClientInterface $httpClient,
        private string $apiUrl
    ) {}

    /**
     * Cargar usuario desde API externa
     */
    public function loadUserByIdentifier(string $identifier): UserInterface
    {
        try {
            $response = $this->httpClient->request('GET', $this->apiUrl . '/users/' . $identifier);
            $data = $response->toArray();
            
            // Crear objeto User desde datos de API
            $user = new User();
            $user->setEmail($data['email']);
            $user->setRoles($data['roles'] ?? ['ROLE_USER']);
            $user->setPassword($data['password_hash']);
            $user->setName($data['name'] ?? null);
            
            return $user;
        } catch (\\Exception $e) {
            throw new UserNotFoundException(sprintf('Usuario "%s" no encontrado en API', $identifier));
        }
    }

    /**
     * Refrescar usuario (recargar desde fuente)
     */
    public function refreshUser(UserInterface $user): UserInterface
    {
        if (!$user instanceof User) {
            throw new UnsupportedUserException(sprintf('Instancia de "%s" no soportada', get_class($user)));
        }

        return $this->loadUserByIdentifier($user->getUserIdentifier());
    }

    /**
     * Verificar si este provider soporta la clase de usuario
     */
    public function supportsClass(string $class): bool
    {
        return User::class === $class || is_subclass_of($class, User::class);
    }
}
?></code></pre></div>

        <h3>Registrar Provider Personalizado</h3>
        <div class="code-block"><pre><code># config/services.yaml

services:
    App\\Security\\ApiUserProvider:
        arguments:
            $apiUrl: '%env(API_URL)%'

# config/packages/security.yaml

security:
    providers:
        api_user_provider:
            id: App\\Security\\ApiUserProvider
    
    firewalls:
        main:
            provider: api_user_provider
?></code></pre></div>

        <h2>5. LDAP User Provider</h2>
        
        <div class="code-block"><pre><code>composer require symfony/ldap

# config/packages/security.yaml

security:
    providers:
        ldap_user_provider:
            ldap:
                service: Symfony\\Component\\Ldap\\Ldap
                base_dn: 'dc=example,dc=com'
                search_dn: 'cn=admin,dc=example,dc=com'
                search_password: 'admin_password'
                default_roles: ['ROLE_USER']
                uid_key: 'uid'
    
    firewalls:
        main:
            provider: ldap_user_provider
            form_login_ldap:
                service: Symfony\\Component\\Ldap\\Ldap
                dn_string: 'uid={username},dc=example,dc=com'

# config/services.yaml

services:
    Symfony\\Component\\Ldap\\Ldap:
        arguments: ['@Symfony\\Component\\Ldap\\Adapter\\ExtLdap\\Adapter']
    
    Symfony\\Component\\Ldap\\Adapter\\ExtLdap\\Adapter:
        arguments:
            - host: 'ldap.example.com'
              port: 389
              encryption: 'ssl'
?></code></pre></div>

        <h2>6. Provider con Cache</h2>
        
        <div class="code-block"><pre><code>&lt;?php
// src/Security/CachedUserProvider.php

namespace App\\Security;

use Symfony\\Component\\Security\\Core\\User\\UserInterface;
use Symfony\\Component\\Security\\Core\\User\\UserProviderInterface;
use Symfony\\Contracts\\Cache\\CacheInterface;
use Symfony\\Contracts\\Cache\\ItemInterface;

class CachedUserProvider implements UserProviderInterface
{
    public function __construct(
        private UserProviderInterface $innerProvider,
        private CacheInterface $cache,
        private int $ttl = 3600
    ) {}

    public function loadUserByIdentifier(string $identifier): UserInterface
    {
        return $this->cache->get(
            'user_' . md5($identifier),
            function (ItemInterface $item) use ($identifier) {
                $item->expiresAfter($this->ttl);
                return $this->innerProvider->loadUserByIdentifier($identifier);
            }
        );
    }

    public function refreshUser(UserInterface $user): UserInterface
    {
        // Invalidar cache y recargar
        $this->cache->delete('user_' . md5($user->getUserIdentifier()));
        return $this->loadUserByIdentifier($user->getUserIdentifier());
    }

    public function supportsClass(string $class): bool
    {
        return $this->innerProvider->supportsClass($class);
    }
}

# Configuración
services:
    app.cached_user_provider:
        class: App\\Security\\CachedUserProvider
        arguments:
            $innerProvider: '@security.user.provider.concrete.app_user_provider'
            $cache: '@cache.app'
            $ttl: 3600

security:
    providers:
        cached_provider:
            id: app.cached_user_provider
?></code></pre></div>

        <h2>7. Provider con Múltiples Identificadores</h2>
        
        <div class="code-block"><pre><code>&lt;?php
// Permitir login con email o username

// src/Repository/UserRepository.php

namespace App\\Repository;

use App\\Entity\\User;
use Doctrine\\Bundle\\DoctrineBundle\\Repository\\ServiceEntityRepository;
use Doctrine\\Persistence\\ManagerRegistry;
use Symfony\\Component\\Security\\Core\\Exception\\UnsupportedUserException;
use Symfony\\Component\\Security\\Core\\User\\PasswordUpgraderInterface;
use Symfony\\Component\\Security\\Core\\User\\UserInterface;

class UserRepository extends ServiceEntityRepository implements PasswordUpgraderInterface
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, User::class);
    }

    /**
     * Buscar usuario por email o username
     */
    public function loadUserByIdentifier(string $identifier): ?User
    {
        return $this->createQueryBuilder('u')
            ->where('u.email = :identifier')
            ->orWhere('u.username = :identifier')
            ->setParameter('identifier', $identifier)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function upgradePassword(UserInterface $user, string $newHashedPassword): void
    {
        if (!$user instanceof User) {
            throw new UnsupportedUserException(sprintf('Instancia de "%s" no soportada', get_class($user)));
        }

        $user->setPassword($newHashedPassword);
        $this->getEntityManager()->flush();
    }
}

# config/packages/security.yaml

security:
    providers:
        app_user_provider:
            entity:
                class: App\\Entity\\User
                # No especificar property, usar método del repositorio
?></code></pre></div>

        <h2>8. Provider con Roles Dinámicos</h2>
        <div class="code-block"><pre><code>&lt;?php
// src/Security/DynamicRoleUserProvider.php

namespace App\\Security;

use App\\Entity\\User;
use App\\Repository\\UserRepository;
use Symfony\\Component\\Security\\Core\\User\\UserInterface;
use Symfony\\Component\\Security\\Core\\User\\UserProviderInterface;

class DynamicRoleUserProvider implements UserProviderInterface
{
    public function __construct(
        private UserRepository $userRepository
    ) {}

    public function loadUserByIdentifier(string $identifier): UserInterface
    {
        $user = $this->userRepository->findOneBy(['email' => $identifier]);
        
        if (!$user) {
            throw new UserNotFoundException();
        }

        // Agregar roles dinámicos basados en lógica de negocio
        $roles = $user->getRoles();
        
        // Ejemplo: agregar rol según suscripción
        if ($user->hasActiveSubscription()) {
            $roles[] = 'ROLE_PREMIUM';
        }
        
        // Ejemplo: agregar rol según actividad
        if ($user->getPostCount() > 100) {
            $roles[] = 'ROLE_CONTRIBUTOR';
        }
        
        $user->setRoles(array_unique($roles));
        
        return $user;
    }

    public function refreshUser(UserInterface $user): UserInterface
    {
        return $this->loadUserByIdentifier($user->getUserIdentifier());
    }

    public function supportsClass(string $class): bool
    {
        return User::class === $class;
    }
}
?></code></pre></div>

        <div class="success-box">
            <strong>✅ Tipos de Providers:</strong><br>
            • <strong>Entity Provider</strong>: Usuarios desde Doctrine ORM<br>
            • <strong>Memory Provider</strong>: Usuarios hardcodeados en config<br>
            • <strong>Chain Provider</strong>: Combina múltiples providers<br>
            • <strong>Custom Provider</strong>: Lógica personalizada (API, LDAP, etc.)<br>
            • <strong>LDAP Provider</strong>: Autenticación contra directorio LDAP<br>
            • <strong>Cached Provider</strong>: Mejora rendimiento con cache
        </div>

        <div class="info-box">
            <strong>🎯 Métodos Requeridos en UserProviderInterface:</strong><br>
            • <strong>loadUserByIdentifier()</strong>: Cargar usuario por identificador<br>
            • <strong>refreshUser()</strong>: Refrescar datos del usuario<br>
            • <strong>supportsClass()</strong>: Verificar si soporta clase de usuario
        </div>

        <div class="warning-box">
            <strong>⚠️ Consideraciones:</strong><br>
            • El provider debe lanzar <code>UserNotFoundException</code> si no encuentra usuario<br>
            • <code>refreshUser()</code> se llama en cada request con sesión activa<br>
            • Usar cache para providers que consultan APIs externas<br>
            • Chain provider busca en orden hasta encontrar usuario<br>
            • Memory provider útil para testing y usuarios de emergencia
        </div>
    `,
    'volantes-seguridad-voters': `
        <h1>Volantes de Seguridad (Voters)</h1>
        
        <p>Los <strong>Security Voters</strong> son el sistema de autorización más flexible de Symfony. Permiten implementar lógica de autorización compleja y granular, decidiendo si un usuario puede realizar una acción específica sobre un recurso.</p>

        <h2>Concepto de Voters</h2>
        <div class="code-block"><pre><code>Un Voter responde a la pregunta:
"¿Puede este USUARIO realizar esta ACCIÓN sobre este RECURSO?"

Ejemplo:
- ¿Puede el usuario "john@example.com" EDITAR el post #123?
- ¿Puede el usuario "admin" ELIMINAR el comentario #456?
- ¿Puede el usuario "guest" VER el documento privado?
?></code></pre></div>

        <h2>Crear un Voter Básico</h2>
        <div class="code-block"><pre><code>&lt;?php
// src/Security/Voter/PostVoter.php

namespace App\\Security\\Voter;

use App\\Entity\\Post;
use App\\Entity\\User;
use Symfony\\Component\\Security\\Core\\Authentication\\Token\\TokenInterface;
use Symfony\\Component\\Security\\Core\\Authorization\\Voter\\Voter;

class PostVoter extends Voter
{
    // Definir las acciones que este voter maneja
    const VIEW = 'VIEW';
    const EDIT = 'EDIT';
    const DELETE = 'DELETE';

    protected function supports(string $attribute, mixed $subject): bool
    {
        // Verificar si este voter soporta el atributo (acción)
        if (!in_array($attribute, [self::VIEW, self::EDIT, self::DELETE])) {
            return false;
        }

        // Verificar si el subject es un Post
        if (!$subject instanceof Post) {
            return false;
        }

        return true;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();

        // Si el usuario no está autenticado, denegar acceso
        if (!$user instanceof User) {
            return false;
        }

        /** @var Post $post */
        $post = $subject;

        // Decidir según la acción
        return match($attribute) {
            self::VIEW => $this->canView($post, $user),
            self::EDIT => $this->canEdit($post, $user),
            self::DELETE => $this->canDelete($post, $user),
            default => false
        };
    }

    private function canView(Post $post, User $user): bool
    {
        // Cualquier usuario puede ver posts públicos
        if ($post->isPublic()) {
            return true;
        }

        // Solo el autor puede ver posts privados
        return $user === $post->getAuthor();
    }

    private function canEdit(Post $post, User $user): bool
    {
        // Solo el autor puede editar
        return $user === $post->getAuthor();
    }

    private function canDelete(Post $post, User $user): bool
    {
        // El autor o un admin pueden eliminar
        return $user === $post->getAuthor() 
            || in_array('ROLE_ADMIN', $user->getRoles());
    }
}
?></code></pre></div>

        <h2>Usar el Voter en Controladores</h2>
        <div class="code-block"><pre><code>&lt;?php
use Symfony\\Component\\Security\\Http\\Attribute\\IsGranted;

class PostController extends AbstractController
{
    // Usar con atributo
    #[Route('/post/{id}', name: 'post_show')]
    #[IsGranted('VIEW', subject: 'post')]
    public function show(Post $post): Response
    {
        return $this->render('post/show.html.twig', ['post' => $post]);
    }

    // Verificar manualmente
    #[Route('/post/{id}/edit', name: 'post_edit')]
    public function edit(Post $post): Response
    {
        $this->denyAccessUnlessGranted('EDIT', $post);
        
        // Lógica de edición...
        return $this->render('post/edit.html.twig', ['post' => $post]);
    }

    // Verificar sin lanzar excepción
    #[Route('/post/{id}', name: 'post_view')]
    public function view(Post $post, Security $security): Response
    {
        $canEdit = $security->isGranted('EDIT', $post);
        $canDelete = $security->isGranted('DELETE', $post);
        
        return $this->render('post/view.html.twig', [
            'post' => $post,
            'can_edit' => $canEdit,
            'can_delete' => $canDelete,
        ]);
    }
}
?></code></pre></div>

        <h2>Usar Voter en Twig</h2>
        <div class="code-block"><pre><code>{# templates/post/show.html.twig #}

<div class="post">
    <h1>{{ post.title }}</h1>
    <p>{{ post.content }}</p>
    
    <div class="actions">
        {% if is_granted('EDIT', post) %}
            <a href="{{ path('post_edit', {id: post.id}) }}" class="btn btn-primary">
                Editar
            </a>
        {% endif %}
        
        {% if is_granted('DELETE', post) %}
            <a href="{{ path('post_delete', {id: post.id}) }}" 
               class="btn btn-danger"
               onclick="return confirm('¿Estás seguro?')">
                Eliminar
            </a>
        {% endif %}
    </div>
</div>
?></code></pre></div>

        <h2>Voter con Múltiples Entidades</h2>
        <div class="code-block"><pre><code>&lt;?php
// src/Security/Voter/CommentVoter.php

class CommentVoter extends Voter
{
    const EDIT = 'EDIT';
    const DELETE = 'DELETE';
    const APPROVE = 'APPROVE';

    protected function supports(string $attribute, mixed $subject): bool
    {
        return in_array($attribute, [self::EDIT, self::DELETE, self::APPROVE])
            && $subject instanceof Comment;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();

        if (!$user instanceof User) {
            return false;
        }

        /** @var Comment $comment */
        $comment = $subject;

        return match($attribute) {
            self::EDIT => $this->canEdit($comment, $user),
            self::DELETE => $this->canDelete($comment, $user),
            self::APPROVE => $this->canApprove($comment, $user),
            default => false
        };
    }

    private function canEdit(Comment $comment, User $user): bool
    {
        // Puede editar si es el autor y no han pasado más de 15 minutos
        if ($user !== $comment->getAuthor()) {
            return false;
        }

        $now = new \\DateTime();
        $createdAt = $comment->getCreatedAt();
        $diff = $now->getTimestamp() - $createdAt->getTimestamp();
        
        return $diff < 900; // 15 minutos
    }

    private function canDelete(Comment $comment, User $user): bool
    {
        // Puede eliminar el autor, el dueño del post o un moderador
        return $user === $comment->getAuthor()
            || $user === $comment->getPost()->getAuthor()
            || in_array('ROLE_MODERATOR', $user->getRoles());
    }

    private function canApprove(Comment $comment, User $user): bool
    {
        // Solo moderadores pueden aprobar
        return in_array('ROLE_MODERATOR', $user->getRoles());
    }
}
?></code></pre></div>

        <h2>Voter con Dependencias</h2>
        <div class="code-block"><pre><code>&lt;?php
// src/Security/Voter/DocumentVoter.php

use App\\Service\\SubscriptionService;

class DocumentVoter extends Voter
{
    const DOWNLOAD = 'DOWNLOAD';
    const VIEW = 'VIEW';

    public function __construct(
        private SubscriptionService $subscriptionService
    ) {}

    protected function supports(string $attribute, mixed $subject): bool
    {
        return in_array($attribute, [self::DOWNLOAD, self::VIEW])
            && $subject instanceof Document;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();

        if (!$user instanceof User) {
            return false;
        }

        /** @var Document $document */
        $document = $subject;

        return match($attribute) {
            self::VIEW => $this->canView($document, $user),
            self::DOWNLOAD => $this->canDownload($document, $user),
            default => false
        };
    }

    private function canView(Document $document, User $user): bool
    {
        // Documentos públicos: todos pueden ver
        if ($document->isPublic()) {
            return true;
        }

        // Documentos privados: solo el propietario
        return $user === $document->getOwner();
    }

    private function canDownload(Document $document, User $user): bool
    {
        // Verificar si el usuario tiene suscripción activa
        if (!$this->subscriptionService->hasActiveSubscription($user)) {
            return false;
        }

        // Verificar si el documento es premium
        if ($document->isPremium()) {
            return $this->subscriptionService->hasPremiumAccess($user);
        }

        return true;
    }
}
?></code></pre></div>

        <h2>Voter sin Subject (Permisos Globales)</h2>
        <div class="code-block"><pre><code>&lt;?php
// src/Security/Voter/FeatureVoter.php

class FeatureVoter extends Voter
{
    const CREATE_POST = 'CREATE_POST';
    const ACCESS_ADMIN = 'ACCESS_ADMIN';
    const EXPORT_DATA = 'EXPORT_DATA';

    protected function supports(string $attribute, mixed $subject): bool
    {
        // Este voter no requiere subject
        return in_array($attribute, [
            self::CREATE_POST,
            self::ACCESS_ADMIN,
            self::EXPORT_DATA
        ]) && $subject === null;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();

        if (!$user instanceof User) {
            return false;
        }

        return match($attribute) {
            self::CREATE_POST => $this->canCreatePost($user),
            self::ACCESS_ADMIN => $this->canAccessAdmin($user),
            self::EXPORT_DATA => $this->canExportData($user),
            default => false
        };
    }

    private function canCreatePost(User $user): bool
    {
        // Verificar si el usuario está verificado
        if (!$user->isVerified()) {
            return false;
        }

        // Verificar si no está baneado
        if ($user->isBanned()) {
            return false;
        }

        return true;
    }

    private function canAccessAdmin(User $user): bool
    {
        return in_array('ROLE_ADMIN', $user->getRoles());
    }

    private function canExportData(User $user): bool
    {
        // Solo usuarios premium pueden exportar
        return in_array('ROLE_PREMIUM', $user->getRoles());
    }
}

// Uso sin subject
$this->denyAccessUnlessGranted('CREATE_POST');
$this->denyAccessUnlessGranted('ACCESS_ADMIN');
?></code></pre></div>

        <h2>Estrategias de Decisión de Voters</h2>
        <div class="code-block"><pre><code># config/packages/security.yaml

security:
    access_decision_manager:
        # Estrategia de decisión
        strategy: affirmative  # Por defecto
        
        # Opciones:
        # - affirmative: Si al menos un voter dice SÍ, se concede acceso
        # - consensus: La mayoría debe decir SÍ
        # - unanimous: Todos deben decir SÍ
        # - priority: El primer voter que decida gana
        
        # Permitir si todos se abstienen
        allow_if_all_abstain: false
        
        # Permitir si hay empate (solo para consensus)
        allow_if_equal_granted_denied: true
?></code></pre></div>

        <h2>Voter con Prioridad</h2>
        <div class="code-block"><pre><code>&lt;?php
// src/Security/Voter/SuperAdminVoter.php

class SuperAdminVoter extends Voter
{
    protected function supports(string $attribute, mixed $subject): bool
    {
        // Este voter soporta CUALQUIER atributo
        return true;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();

        if (!$user instanceof User) {
            return false;
        }

        // Super admin puede hacer TODO
        if (in_array('ROLE_SUPER_ADMIN', $user->getRoles())) {
            return true;
        }

        // Abstenerse para otros usuarios (dejar que otros voters decidan)
        return false;
    }
}

# Configurar prioridad en services.yaml
services:
    App\\Security\\Voter\\SuperAdminVoter:
        tags:
            - { name: security.voter, priority: 255 }  # Alta prioridad
    
    App\\Security\\Voter\\PostVoter:
        tags:
            - { name: security.voter, priority: 0 }  # Prioridad normal
?></code></pre></div>

        <h2>Testing de Voters</h2>
        <div class="code-block"><pre><code>&lt;?php
// tests/Security/Voter/PostVoterTest.php

namespace App\\Tests\\Security\\Voter;

use App\\Entity\\Post;
use App\\Entity\\User;
use App\\Security\\Voter\\PostVoter;
use PHPUnit\\Framework\\TestCase;
use Symfony\\Component\\Security\\Core\\Authentication\\Token\\UsernamePasswordToken;
use Symfony\\Component\\Security\\Core\\Authorization\\Voter\\VoterInterface;

class PostVoterTest extends TestCase
{
    private PostVoter $voter;

    protected function setUp(): void
    {
        $this->voter = new PostVoter();
    }

    public function testAuthorCanEditOwnPost(): void
    {
        $user = new User();
        $post = new Post();
        $post->setAuthor($user);

        $token = new UsernamePasswordToken($user, 'main', ['ROLE_USER']);
        
        $result = $this->voter->vote($token, $post, ['EDIT']);
        
        $this->assertEquals(VoterInterface::ACCESS_GRANTED, $result);
    }

    public function testUserCannotEditOthersPost(): void
    {
        $author = new User();
        $otherUser = new User();
        
        $post = new Post();
        $post->setAuthor($author);

        $token = new UsernamePasswordToken($otherUser, 'main', ['ROLE_USER']);
        
        $result = $this->voter->vote($token, $post, ['EDIT']);
        
        $this->assertEquals(VoterInterface::ACCESS_DENIED, $result);
    }

    public function testAdminCanDeleteAnyPost(): void
    {
        $author = new User();
        $admin = new User();
        $admin->setRoles(['ROLE_ADMIN']);
        
        $post = new Post();
        $post->setAuthor($author);

        $token = new UsernamePasswordToken($admin, 'main', ['ROLE_ADMIN']);
        
        $result = $this->voter->vote($token, $post, ['DELETE']);
        
        $this->assertEquals(VoterInterface::ACCESS_GRANTED, $result);
    }
}
?></code></pre></div>

        <h2>Debugging de Voters</h2>
        <div class="code-block"><pre><code># Ver todos los voters registrados
php bin/console debug:security

# Ver decisión de voters para una acción específica
php bin/console debug:security --voters

# En el controlador, obtener información de decisión
use Symfony\\Bundle\\SecurityBundle\\Security\\FirewallMap;
use Symfony\\Component\\Security\\Core\\Authorization\\AccessDecisionManagerInterface;

public function debug(
    Post $post,
    AccessDecisionManagerInterface $decisionManager,
    TokenStorageInterface $tokenStorage
): Response {
    $token = $tokenStorage->getToken();
    
    // Verificar decisión
    $decision = $decisionManager->decide($token, ['EDIT'], $post);
    
    // $decision será true o false
    dd($decision);
}
?></code></pre></div>

        <div class="success-box">
            <strong>✅ Ventajas de los Voters:</strong><br>
            • <strong>Granularidad</strong>: Control fino sobre permisos<br>
            • <strong>Reutilización</strong>: Lógica centralizada de autorización<br>
            • <strong>Testeable</strong>: Fácil de probar unitariamente<br>
            • <strong>Flexible</strong>: Lógica compleja con dependencias<br>
            • <strong>Composable</strong>: Múltiples voters trabajan juntos<br>
            • <strong>Mantenible</strong>: Cambios en un solo lugar
        </div>

        <div class="info-box">
            <strong>🎯 Cuándo Usar Voters:</strong><br>
            • <strong>Permisos basados en propiedad</strong>: "¿Es el autor?"<br>
            • <strong>Lógica de negocio compleja</strong>: Suscripciones, tiempo, estado<br>
            • <strong>Permisos contextuales</strong>: Dependen del recurso específico<br>
            • <strong>Autorización granular</strong>: Más allá de roles simples
        </div>

        <div class="warning-box">
            <strong>⚠️ Mejores Prácticas:</strong><br>
            • Mantener voters simples y enfocados<br>
            • Un voter por tipo de entidad<br>
            • Usar constantes para nombres de atributos<br>
            • Documentar la lógica de decisión<br>
            • Testear todos los casos de uso<br>
            • Considerar el rendimiento en voters con queries pesadas
        </div>
    `,
    'encriptacion-contrasenas-password-hasher': `
        <h1>Encriptación de Contraseñas (Password Hasher)</h1>
        
        <p>Symfony utiliza el componente <strong>PasswordHasher</strong> para hashear contraseñas de forma segura. Nunca se deben almacenar contraseñas en texto plano. El sistema usa algoritmos modernos como bcrypt, argon2i y argon2id.</p>

        <h2>Configuración del Password Hasher</h2>
        <div class="code-block"><pre><code># config/packages/security.yaml

security:
    password_hashers:
        # Configuración automática (recomendado)
        Symfony\\Component\\Security\\Core\\User\\PasswordAuthenticatedUserInterface: 'auto'
        
        # O especificar algoritmo manualmente
        App\\Entity\\User:
            algorithm: auto  # Usa el mejor disponible (bcrypt, argon2i, argon2id)
            
        # Configuración específica de bcrypt
        App\\Entity\\Admin:
            algorithm: bcrypt
            cost: 12  # Mayor = más seguro pero más lento (4-31)
        
        # Configuración específica de argon2i
        App\\Entity\\SuperAdmin:
            algorithm: argon2i
            memory_cost: 65536  # 64 MB
            time_cost: 4
            threads: 2
?></code></pre></div>

        <h2>Hashear Contraseña en Registro</h2>
        <div class="code-block"><pre><code>&lt;?php
// src/Controller/RegistrationController.php

namespace App\\Controller;

use App\\Entity\\User;
use App\\Form\\RegistrationFormType;
use Doctrine\\ORM\\EntityManagerInterface;
use Symfony\\Bundle\\FrameworkBundle\\Controller\\AbstractController;
use Symfony\\Component\\HttpFoundation\\Request;
use Symfony\\Component\\HttpFoundation\\Response;
use Symfony\\Component\\PasswordHasher\\Hasher\\UserPasswordHasherInterface;
use Symfony\\Component\\Routing\\Attribute\\Route;

class RegistrationController extends AbstractController
{
    #[Route('/register', name: 'app_register')]
    public function register(
        Request $request,
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $entityManager
    ): Response {
        $user = new User();
        $form = $this->createForm(RegistrationFormType::class, $user);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            // Obtener contraseña en texto plano del formulario
            $plainPassword = $form->get('plainPassword')->getData();

            // Hashear la contraseña
            $hashedPassword = $passwordHasher->hashPassword(
                $user,
                $plainPassword
            );
            $user->setPassword($hashedPassword);

            // Guardar usuario
            $entityManager->persist($user);
            $entityManager->flush();

            $this->addFlash('success', '¡Cuenta creada exitosamente!');

            return $this->redirectToRoute('app_login');
        }

        return $this->render('registration/register.html.twig', [
            'registrationForm' => $form->createView(),
        ]);
    }
}
?></code></pre></div>

        <h2>Verificar Contraseña</h2>
        <div class="code-block"><pre><code>&lt;?php
// Verificar si una contraseña coincide con el hash

use Symfony\\Component\\PasswordHasher\\Hasher\\UserPasswordHasherInterface;

class SecurityService
{
    public function __construct(
        private UserPasswordHasherInterface $passwordHasher
    ) {}

    public function verifyPassword(User $user, string $plainPassword): bool
    {
        return $this->passwordHasher->isPasswordValid($user, $plainPassword);
    }
}

// Uso en controlador
#[Route('/verify-password', name: 'verify_password')]
public function verifyPassword(
    Request $request,
    UserPasswordHasherInterface $passwordHasher
): Response {
    $user = $this->getUser();
    $submittedPassword = $request->request->get('password');
    
    if ($passwordHasher->isPasswordValid($user, $submittedPassword)) {
        // Contraseña correcta
        return $this->json(['valid' => true]);
    }
    
    // Contraseña incorrecta
    return $this->json(['valid' => false], 401);
}
?></code></pre></div>

        <h2>Cambiar Contraseña</h2>
        <div class="code-block"><pre><code>&lt;?php
// src/Controller/ProfileController.php

#[Route('/profile/change-password', name: 'profile_change_password')]
public function changePassword(
    Request $request,
    UserPasswordHasherInterface $passwordHasher,
    EntityManagerInterface $entityManager
): Response {
    $user = $this->getUser();
    $form = $this->createForm(ChangePasswordFormType::class);
    $form->handleRequest($request);

    if ($form->isSubmitted() && $form->isValid()) {
        // Verificar contraseña actual
        $currentPassword = $form->get('currentPassword')->getData();
        
        if (!$passwordHasher->isPasswordValid($user, $currentPassword)) {
            $this->addFlash('error', 'La contraseña actual es incorrecta');
            return $this->redirectToRoute('profile_change_password');
        }

        // Hashear nueva contraseña
        $newPassword = $form->get('newPassword')->getData();
        $hashedPassword = $passwordHasher->hashPassword($user, $newPassword);
        
        $user->setPassword($hashedPassword);
        $entityManager->flush();

        $this->addFlash('success', 'Contraseña actualizada exitosamente');
        
        return $this->redirectToRoute('app_profile');
    }

    return $this->render('profile/change_password.html.twig', [
        'form' => $form->createView(),
    ]);
}
?></code></pre></div>

        <h2>Formulario de Cambio de Contraseña</h2>
        <div class="code-block"><pre><code>&lt;?php
// src/Form/ChangePasswordFormType.php

namespace App\\Form;

use Symfony\\Component\\Form\\AbstractType;
use Symfony\\Component\\Form\\Extension\\Core\\Type\\PasswordType;
use Symfony\\Component\\Form\\Extension\\Core\\Type\\RepeatedType;
use Symfony\\Component\\Form\\FormBuilderInterface;
use Symfony\\Component\\Validator\\Constraints\\Length;
use Symfony\\Component\\Validator\\Constraints\\NotBlank;
use Symfony\\Component\\Validator\\Constraints\\NotCompromisedPassword;
use Symfony\\Component\\Validator\\Constraints\\PasswordStrength;

class ChangePasswordFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('currentPassword', PasswordType::class, [
                'label' => 'Contraseña Actual',
                'mapped' => false,
                'constraints' => [
                    new NotBlank([
                        'message' => 'Por favor ingrese su contraseña actual',
                    ]),
                ],
            ])
            ->add('newPassword', RepeatedType::class, [
                'type' => PasswordType::class,
                'mapped' => false,
                'first_options' => [
                    'label' => 'Nueva Contraseña',
                    'constraints' => [
                        new NotBlank([
                            'message' => 'Por favor ingrese una contraseña',
                        ]),
                        new Length([
                            'min' => 8,
                            'minMessage' => 'La contraseña debe tener al menos {{ limit }} caracteres',
                            'max' => 4096,
                        ]),
                        new PasswordStrength([
                            'minScore' => PasswordStrength::STRENGTH_MEDIUM,
                            'message' => 'La contraseña es demasiado débil. Use mayúsculas, minúsculas, números y símbolos.',
                        ]),
                        new NotCompromisedPassword([
                            'message' => 'Esta contraseña ha sido comprometida en filtraciones de datos. Por favor use otra.',
                        ]),
                    ],
                ],
                'second_options' => [
                    'label' => 'Repetir Nueva Contraseña',
                ],
                'invalid_message' => 'Las contraseñas deben coincidir.',
            ]);
    }
}
?></code></pre></div>

        <h2>Resetear Contraseña (Forgot Password)</h2>
        <div class="code-block"><pre><code>&lt;?php
// src/Controller/ResetPasswordController.php

use Symfony\\Component\\Mailer\\MailerInterface;
use Symfony\\Component\\Mime\\Email;

class ResetPasswordController extends AbstractController
{
    #[Route('/reset-password/request', name: 'app_forgot_password_request')]
    public function request(
        Request $request,
        UserRepository $userRepository,
        MailerInterface $mailer
    ): Response {
        $form = $this->createForm(ResetPasswordRequestFormType::class);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $email = $form->get('email')->getData();
            $user = $userRepository->findOneBy(['email' => $email]);

            if ($user) {
                // Generar token único
                $resetToken = bin2hex(random_bytes(32));
                $user->setResetToken($resetToken);
                $user->setResetTokenExpiresAt(new \\DateTime('+1 hour'));
                
                $userRepository->save($user, true);

                // Enviar email
                $resetUrl = $this->generateUrl('app_reset_password', [
                    'token' => $resetToken
                ], UrlGeneratorInterface::ABSOLUTE_URL);

                $email = (new Email())
                    ->from('noreply@example.com')
                    ->to($user->getEmail())
                    ->subject('Restablecer Contraseña')
                    ->html("<p>Haz clic aquí para restablecer tu contraseña:</p>
                           <a href='$resetUrl'>Restablecer Contraseña</a>
                           <p>Este enlace expira en 1 hora.</p>");

                $mailer->send($email);
            }

            // Siempre mostrar el mismo mensaje (seguridad)
            $this->addFlash('success', 'Si el email existe, recibirás instrucciones para restablecer tu contraseña.');
            
            return $this->redirectToRoute('app_login');
        }

        return $this->render('reset_password/request.html.twig', [
            'requestForm' => $form->createView(),
        ]);
    }

    #[Route('/reset-password/{token}', name: 'app_reset_password')]
    public function reset(
        string $token,
        Request $request,
        UserRepository $userRepository,
        UserPasswordHasherInterface $passwordHasher
    ): Response {
        $user = $userRepository->findOneBy(['resetToken' => $token]);

        if (!$user || $user->getResetTokenExpiresAt() < new \\DateTime()) {
            $this->addFlash('error', 'Token inválido o expirado');
            return $this->redirectToRoute('app_forgot_password_request');
        }

        $form = $this->createForm(ResetPasswordFormType::class);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $newPassword = $form->get('plainPassword')->getData();
            
            // Hashear nueva contraseña
            $hashedPassword = $passwordHasher->hashPassword($user, $newPassword);
            $user->setPassword($hashedPassword);
            
            // Limpiar token
            $user->setResetToken(null);
            $user->setResetTokenExpiresAt(null);
            
            $userRepository->save($user, true);

            $this->addFlash('success', 'Contraseña restablecida exitosamente');
            
            return $this->redirectToRoute('app_login');
        }

        return $this->render('reset_password/reset.html.twig', [
            'resetForm' => $form->createView(),
        ]);
    }
}
?></code></pre></div>

        <h2>Comando para Hashear Contraseñas</h2>
        <div class="code-block"><pre><code># Hashear contraseña desde consola
php bin/console security:hash-password

# Especificar contraseña directamente
php bin/console security:hash-password MySecretPassword

# Hashear para clase específica
php bin/console security:hash-password MySecretPassword --user-class=App\\Entity\\Admin
?></code></pre></div>

        <h2>Actualizar Algoritmo de Hash Automáticamente</h2>
        <div class="code-block"><pre><code>&lt;?php
// src/Repository/UserRepository.php

namespace App\\Repository;

use Symfony\\Component\\Security\\Core\\User\\PasswordUpgraderInterface;

class UserRepository extends ServiceEntityRepository implements PasswordUpgraderInterface
{
    /**
     * Actualizar hash de contraseña si el algoritmo cambió
     */
    public function upgradePassword(UserInterface $user, string $newHashedPassword): void
    {
        if (!$user instanceof User) {
            throw new UnsupportedUserException(sprintf('Instancia de "%s" no soportada', get_class($user)));
        }

        $user->setPassword($newHashedPassword);
        $this->getEntityManager()->flush();
    }
}

// Symfony llamará automáticamente a upgradePassword() después de login exitoso
// si detecta que el algoritmo de hash cambió
?></code></pre></div>

        <h2>Validadores de Contraseña</h2>
        <div class="code-block"><pre><code>&lt;?php
use Symfony\\Component\\Validator\\Constraints as Assert;

class User
{
    #[Assert\\NotBlank]
    #[Assert\\Length(min: 8, max: 4096)]
    #[Assert\\PasswordStrength(
        minScore: PasswordStrength::STRENGTH_STRONG,
        message: 'La contraseña debe ser fuerte: mayúsculas, minúsculas, números y símbolos'
    )]
    #[Assert\\NotCompromisedPassword(
        message: 'Esta contraseña ha sido filtrada. Use otra diferente.',
        skipOnError: true
    )]
    private ?string $plainPassword = null;
}

// PasswordStrength niveles:
// - STRENGTH_WEAK: Muy débil
// - STRENGTH_MEDIUM: Media
// - STRENGTH_STRONG: Fuerte
// - STRENGTH_VERY_STRONG: Muy fuerte
?></code></pre></div>

        <h2>Generar Contraseña Aleatoria Segura</h2>
        <div class="code-block"><pre><code>&lt;?php
class PasswordGenerator
{
    public function generateSecurePassword(int $length = 16): string
    {
        $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
        $password = '';
        $charsLength = strlen($chars);
        
        for ($i = 0; $i < $length; $i++) {
            $password .= $chars[random_int(0, $charsLength - 1)];
        }
        
        return $password;
    }

    public function generateReadablePassword(): string
    {
        $words = ['correct', 'horse', 'battery', 'staple'];
        shuffle($words);
        return implode('-', array_slice($words, 0, 4)) . random_int(10, 99);
    }
}

// Uso
$generator = new PasswordGenerator();
$password = $generator->generateSecurePassword(20);
// Ejemplo: "aB3$xY9@mN2&pQ7!zR4%"

$readablePassword = $generator->generateReadablePassword();
// Ejemplo: "horse-battery-correct-staple-42"
?></code></pre></div>

        <h2>Política de Contraseñas</h2>
        <div class="code-block"><pre><code>&lt;?php
// src/Validator/Constraints/StrongPassword.php

namespace App\\Validator\\Constraints;

use Symfony\\Component\\Validator\\Constraint;
use Symfony\\Component\\Validator\\ConstraintValidator;

#[\\Attribute]
class StrongPassword extends Constraint
{
    public string $message = 'La contraseña no cumple los requisitos de seguridad.';
    public int $minLength = 12;
    public bool $requireUppercase = true;
    public bool $requireLowercase = true;
    public bool $requireNumbers = true;
    public bool $requireSpecialChars = true;
    public array $commonPasswords = ['password', '123456', 'qwerty'];
}

class StrongPasswordValidator extends ConstraintValidator
{
    public function validate(mixed $value, Constraint $constraint): void
    {
        if (!$constraint instanceof StrongPassword) {
            throw new UnexpectedTypeException($constraint, StrongPassword::class);
        }

        if (null === $value || '' === $value) {
            return;
        }

        $errors = [];

        // Longitud mínima
        if (strlen($value) < $constraint->minLength) {
            $errors[] = sprintf('al menos %d caracteres', $constraint->minLength);
        }

        // Mayúsculas
        if ($constraint->requireUppercase && !preg_match('/[A-Z]/', $value)) {
            $errors[] = 'al menos una letra mayúscula';
        }

        // Minúsculas
        if ($constraint->requireLowercase && !preg_match('/[a-z]/', $value)) {
            $errors[] = 'al menos una letra minúscula';
        }

        // Números
        if ($constraint->requireNumbers && !preg_match('/[0-9]/', $value)) {
            $errors[] = 'al menos un número';
        }

        // Caracteres especiales
        if ($constraint->requireSpecialChars && !preg_match('/[^A-Za-z0-9]/', $value)) {
            $errors[] = 'al menos un carácter especial';
        }

        // Contraseñas comunes
        if (in_array(strtolower($value), $constraint->commonPasswords)) {
            $errors[] = 'no puede ser una contraseña común';
        }

        if (!empty($errors)) {
            $this->context->buildViolation($constraint->message)
                ->setParameter('{{ requirements }}', implode(', ', $errors))
                ->addViolation();
        }
    }
}
?></code></pre></div>

        <h2>Comparación de Algoritmos</h2>
        <div class="code-block"><pre><code>┌──────────────┬──────────┬────────────┬─────────────┬──────────────┐
│  Algoritmo   │ Seguridad│ Velocidad  │ Memoria     │ Recomendado  │
├──────────────┼──────────┼────────────┼─────────────┼──────────────┤
│ bcrypt       │   Alta   │   Media    │    Baja     │      Sí      │
│ argon2i      │ Muy Alta │   Lenta    │    Alta     │      Sí      │
│ argon2id     │ Muy Alta │   Lenta    │    Alta     │  Sí (mejor)  │
│ md5          │   Baja   │   Rápida   │    Baja     │      NO      │
│ sha256       │   Media  │   Rápida   │    Baja     │      NO      │
└──────────────┴──────────┴────────────┴─────────────┴──────────────┘

Recomendación: Usar 'auto' para que Symfony elija el mejor disponible
?></code></pre></div>

        <div class="success-box">
            <strong>✅ Mejores Prácticas:</strong><br>
            • <strong>Nunca</strong> almacenar contraseñas en texto plano<br>
            • Usar algoritmo 'auto' para mejor seguridad<br>
            • Implementar política de contraseñas fuertes<br>
            • Validar con NotCompromisedPassword<br>
            • Actualizar hashes automáticamente (PasswordUpgraderInterface)<br>
            • Usar tokens con expiración para reset de contraseña<br>
            • Limitar intentos de login (rate limiting)
        </div>

        <div class="warning-box">
            <strong>⚠️ Errores Comunes:</strong><br>
            • Usar algoritmos débiles (md5, sha1)<br>
            • No validar fortaleza de contraseña<br>
            • Permitir contraseñas comunes<br>
            • No implementar reset de contraseña seguro<br>
            • Exponer información sobre usuarios en errores<br>
            • No usar HTTPS para transmitir contraseñas
        </div>

        <div class="info-box">
            <strong>🎯 Resumen:</strong><br>
            • <strong>hashPassword()</strong>: Hashear contraseña<br>
            • <strong>isPasswordValid()</strong>: Verificar contraseña<br>
            • <strong>upgradePassword()</strong>: Actualizar hash automáticamente<br>
            • <strong>PasswordStrength</strong>: Validar fortaleza<br>
            • <strong>NotCompromisedPassword</strong>: Verificar filtraciones<br>
            • <strong>bcrypt/argon2</strong>: Algoritmos recomendados
        </div>
    `,
    'proteccion-csrf-headers': `
        <h1>Protección CSRF y Headers de Seguridad</h1>
        
        <p>La <strong>protección CSRF</strong> (Cross-Site Request Forgery) y los <strong>headers de seguridad</strong> son esenciales para proteger aplicaciones web contra ataques comunes. Symfony proporciona herramientas integradas para implementar estas protecciones.</p>

        <h2>1. Protección CSRF en Formularios</h2>
        
        <h3>Habilitar CSRF Globalmente</h3>
        <div class="code-block"><pre><code># config/packages/framework.yaml

framework:
    csrf_protection: ~  # Habilitado por defecto

# config/packages/security.yaml

security:
    firewalls:
        main:
            form_login:
                enable_csrf: true  # Protección CSRF en login
?></code></pre></div>

        <h3>CSRF en Formularios Symfony</h3>
        <div class="code-block"><pre><code>&lt;?php
// Los formularios de Symfony incluyen CSRF automáticamente

class ProductType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('name', TextType::class)
            ->add('price', MoneyType::class)
            ->add('save', SubmitType::class);
        
        // CSRF se agrega automáticamente
    }
    
    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Product::class,
            'csrf_protection' => true,  // Por defecto
            'csrf_field_name' => '_token',  // Nombre del campo
            'csrf_token_id' => 'product_item',  // ID único del token
        ]);
    }
}

// En Twig, el token se renderiza automáticamente
{{ form_start(form) }}
    {{ form_widget(form) }}
    {# Campo _token se incluye automáticamente #}
{{ form_end(form) }}
?></code></pre></div>

        <h3>CSRF Manual en Formularios HTML</h3>
        <div class="code-block"><pre><code>{# templates/product/edit.html.twig #}

<form method="post" action="{{ path('product_edit', {id: product.id}) }}">
    <input type="text" name="name" value="{{ product.name }}">
    <input type="number" name="price" value="{{ product.price }}">
    
    {# Generar token CSRF manualmente #}
    <input type="hidden" name="_token" value="{{ csrf_token('product_edit') }}">
    
    <button type="submit">Guardar</button>
</form>

&lt;?php
// Verificar token en el controlador

use Symfony\\Component\\Security\\Csrf\\CsrfTokenManagerInterface;
use Symfony\\Component\\Security\\Csrf\\CsrfToken;

#[Route('/product/{id}/edit', name: 'product_edit', methods: ['POST'])]
public function edit(
    Request $request,
    Product $product,
    CsrfTokenManagerInterface $csrfTokenManager
): Response {
    $token = new CsrfToken('product_edit', $request->request->get('_token'));
    
    if (!$csrfTokenManager->isTokenValid($token)) {
        throw $this->createAccessDeniedException('Token CSRF inválido');
    }
    
    // Procesar formulario...
    return $this->redirectToRoute('product_list');
}
?></code></pre></div>

        <h2>2. CSRF en Peticiones AJAX</h2>
        <div class="code-block"><pre><code>{# Incluir token en meta tag #}
<meta name="csrf-token" content="{{ csrf_token('ajax') }}">

<script>
// Obtener token del meta tag
const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

// Enviar con fetch
fetch('/api/delete-item', {
    method: 'DELETE',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken
    },
    body: JSON.stringify({ id: 123 })
})
.then(response => response.json())
.then(data => console.log(data));

// Con axios (configuración global)
axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

axios.delete('/api/delete-item', { id: 123 })
    .then(response => console.log(response.data));
</script>

&lt;?php
// Verificar en el controlador

#[Route('/api/delete-item', methods: ['DELETE'])]
public function deleteItem(
    Request $request,
    CsrfTokenManagerInterface $csrfTokenManager
): JsonResponse {
    $token = new CsrfToken('ajax', $request->headers->get('X-CSRF-TOKEN'));
    
    if (!$csrfTokenManager->isTokenValid($token)) {
        return $this->json(['error' => 'Token CSRF inválido'], 403);
    }
    
    // Procesar eliminación...
    return $this->json(['success' => true]);
}
?></code></pre></div>

        <h2>3. Headers de Seguridad</h2>
        
        <h3>Configurar Headers con NelmioSecurityBundle</h3>
        <div class="code-block"><pre><code>composer require nelmio/security-bundle

# config/packages/nelmio_security.yaml

nelmio_security:
    # Content Security Policy
    csp:
        enabled: true
        hosts: []
        content_types: []
        enforce:
            level1_fallback: false
            browser_adaptive:
                enabled: false
            default-src:
                - 'self'
            script-src:
                - 'self'
                - 'unsafe-inline'  # Evitar en producción
                - 'https://cdn.example.com'
            style-src:
                - 'self'
                - 'unsafe-inline'
            img-src:
                - 'self'
                - 'data:'
                - 'https:'
            font-src:
                - 'self'
                - 'https://fonts.gstatic.com'
            connect-src:
                - 'self'
                - 'https://api.example.com'
            frame-ancestors:
                - 'none'  # Prevenir clickjacking
    
    # X-Frame-Options
    clickjacking:
        paths:
            '^/.*': DENY  # O SAMEORIGIN
    
    # X-Content-Type-Options
    content_type:
        nosniff: true
    
    # X-XSS-Protection
    xss_protection:
        enabled: true
        mode_block: true
    
    # Referrer-Policy
    referrer_policy:
        enabled: true
        policies:
            - 'no-referrer-when-downgrade'
            - 'strict-origin-when-cross-origin'
    
    # HTTP Strict Transport Security (HSTS)
    forced_ssl:
        enabled: true
        hsts_max_age: 31536000  # 1 año
        hsts_subdomains: true
        hsts_preload: true
?></code></pre></div>

        <h3>Headers Manualmente en Controlador</h3>
        <div class="code-block"><pre><code>&lt;?php
class SecurityController extends AbstractController
{
    #[Route('/secure-page')]
    public function securePage(): Response
    {
        $response = $this->render('secure/page.html.twig');
        
        // X-Frame-Options: Prevenir clickjacking
        $response->headers->set('X-Frame-Options', 'DENY');
        
        // X-Content-Type-Options: Prevenir MIME sniffing
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        
        // X-XSS-Protection
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        
        // Content-Security-Policy
        $response->headers->set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'");
        
        // Referrer-Policy
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        
        // Permissions-Policy (antes Feature-Policy)
        $response->headers->set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
        
        return $response;
    }
}
?></code></pre></div>

        <h3>Event Subscriber para Headers Globales</h3>
        <div class="code-block"><pre><code>&lt;?php
// src/EventSubscriber/SecurityHeadersSubscriber.php

namespace App\\EventSubscriber;

use Symfony\\Component\\EventDispatcher\\EventSubscriberInterface;
use Symfony\\Component\\HttpKernel\\Event\\ResponseEvent;
use Symfony\\Component\\HttpKernel\\KernelEvents;

class SecurityHeadersSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::RESPONSE => 'onKernelResponse',
        ];
    }

    public function onKernelResponse(ResponseEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $response = $event->getResponse();
        
        // Agregar headers de seguridad a todas las respuestas
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        
        // HSTS solo en HTTPS
        if ($event->getRequest()->isSecure()) {
            $response->headers->set(
                'Strict-Transport-Security',
                'max-age=31536000; includeSubDomains; preload'
            );
        }
    }
}
?></code></pre></div>

        <h2>4. Content Security Policy (CSP) Avanzado</h2>
        <div class="code-block"><pre><code>&lt;?php
// Generar nonce para scripts inline

class CspService
{
    private string $nonce;

    public function __construct()
    {
        $this->nonce = base64_encode(random_bytes(16));
    }

    public function getNonce(): string
    {
        return $this->nonce;
    }

    public function getCspHeader(): string
    {
        return sprintf(
            "default-src 'self'; script-src 'self' 'nonce-%s'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;",
            $this->nonce
        );
    }
}

// En el controlador
#[Route('/page')]
public function page(CspService $cspService): Response
{
    $response = $this->render('page.html.twig', [
        'csp_nonce' => $cspService->getNonce()
    ]);
    
    $response->headers->set('Content-Security-Policy', $cspService->getCspHeader());
    
    return $response;
}

{# En Twig #}
<script nonce="{{ csp_nonce }}">
    console.log('Este script es permitido por CSP');
</script>
?></code></pre></div>

        <h2>5. CORS (Cross-Origin Resource Sharing)</h2>
        <div class="code-block"><pre><code>composer require nelmio/cors-bundle

# config/packages/nelmio_cors.yaml

nelmio_cors:
    defaults:
        origin_regex: true
        allow_origin: ['*']  # En producción, especificar dominios
        allow_methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
        allow_headers: ['Content-Type', 'Authorization', 'X-CSRF-TOKEN']
        expose_headers: ['Link']
        max_age: 3600
    paths:
        '^/api/':
            allow_origin: ['https://app.example.com', 'https://admin.example.com']
            allow_headers: ['*']
            allow_methods: ['POST', 'PUT', 'GET', 'DELETE']
            max_age: 3600
        '^/public/':
            allow_origin: ['*']
            allow_methods: ['GET']

# Manual en controlador
public function apiEndpoint(): JsonResponse
{
    $response = $this->json(['data' => 'value']);
    
    $response->headers->set('Access-Control-Allow-Origin', 'https://app.example.com');
    $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return $response;
}
?></code></pre></div>

        <h2>6. Rate Limiting</h2>
        <div class="code-block"><pre><code>composer require symfony/rate-limiter

# config/packages/rate_limiter.yaml

framework:
    rate_limiter:
        # Limitar intentos de login
        login:
            policy: 'sliding_window'
            limit: 5
            interval: '15 minutes'
        
        # Limitar API requests
        api:
            policy: 'token_bucket'
            limit: 100
            rate: { interval: '1 hour' }

&lt;?php
// Usar en controlador

use Symfony\\Component\\RateLimiter\\RateLimiterFactory;

#[Route('/login', name: 'app_login', methods: ['POST'])]
public function login(
    Request $request,
    RateLimiterFactory $loginLimiter
): Response {
    // Crear limiter por IP
    $limiter = $loginLimiter->create($request->getClientIp());
    
    // Intentar consumir un token
    if (!$limiter->consume(1)->isAccepted()) {
        throw new TooManyRequestsHttpException(
            null,
            'Demasiados intentos de login. Intente más tarde.'
        );
    }
    
    // Procesar login...
}

// API con rate limiting
#[Route('/api/resource')]
public function apiResource(
    Request $request,
    RateLimiterFactory $apiLimiter
): JsonResponse {
    $limiter = $apiLimiter->create($request->getClientIp());
    
    $limit = $limiter->consume(1);
    
    if (!$limit->isAccepted()) {
        return $this->json([
            'error' => 'Rate limit exceeded',
            'retry_after' => $limit->getRetryAfter()->getTimestamp()
        ], 429);
    }
    
    // Agregar headers de rate limit
    $response = $this->json(['data' => 'value']);
    $response->headers->set('X-RateLimit-Limit', $limit->getLimit());
    $response->headers->set('X-RateLimit-Remaining', $limit->getRemainingTokens());
    
    return $response;
}
?></code></pre></div>

        <h2>7. Sanitización de Entrada</h2>
        <div class="code-block"><pre><code>&lt;?php
use Symfony\\Component\\HtmlSanitizer\\HtmlSanitizerInterface;

class ContentController extends AbstractController
{
    #[Route('/content/save', methods: ['POST'])]
    public function save(
        Request $request,
        HtmlSanitizerInterface $htmlSanitizer
    ): Response {
        $content = $request->request->get('content');
        
        // Sanitizar HTML para prevenir XSS
        $safeContent = $htmlSanitizer->sanitize($content);
        
        // Guardar contenido sanitizado...
        
        return $this->json(['success' => true]);
    }
}

# config/packages/html_sanitizer.yaml

framework:
    html_sanitizer:
        sanitizers:
            app.sanitizer:
                allowed_elements:
                    - p
                    - a
                    - strong
                    - em
                    - ul
                    - ol
                    - li
                allowed_attributes:
                    a: ['href', 'title']
                allow_safe_elements: true
?></code></pre></div>

        <div class="success-box">
            <strong>✅ Headers de Seguridad Esenciales:</strong><br>
            • <strong>X-Frame-Options</strong>: DENY o SAMEORIGIN (clickjacking)<br>
            • <strong>X-Content-Type-Options</strong>: nosniff (MIME sniffing)<br>
            • <strong>X-XSS-Protection</strong>: 1; mode=block<br>
            • <strong>Content-Security-Policy</strong>: Controlar recursos permitidos<br>
            • <strong>Strict-Transport-Security</strong>: Forzar HTTPS<br>
            • <strong>Referrer-Policy</strong>: Controlar información de referer
        </div>

        <div class="warning-box">
            <strong>⚠️ Ataques Comunes Prevenidos:</strong><br>
            • <strong>CSRF</strong>: Tokens en formularios<br>
            • <strong>XSS</strong>: CSP + sanitización + escape en Twig<br>
            • <strong>Clickjacking</strong>: X-Frame-Options<br>
            • <strong>MIME Sniffing</strong>: X-Content-Type-Options<br>
            • <strong>Man-in-the-Middle</strong>: HSTS<br>
            • <strong>Brute Force</strong>: Rate limiting
        </div>

        <div class="info-box">
            <strong>🎯 Checklist de Seguridad:</strong><br>
            ✓ CSRF habilitado en todos los formularios<br>
            ✓ Headers de seguridad configurados<br>
            ✓ HTTPS forzado en producción<br>
            ✓ CSP configurado correctamente<br>
            ✓ Rate limiting en endpoints sensibles<br>
            ✓ Sanitización de entrada de usuario<br>
            ✓ CORS configurado para APIs<br>
            ✓ Logging de intentos de ataque
        </div>
    `,
    'autorizacion-roles-usuario': `
        <h1>Autorización y Roles de Usuario</h1>
        
        <p>El sistema de <strong>autorización y roles</strong> de Symfony permite controlar qué usuarios pueden acceder a qué recursos. Los roles son jerárquicos y se pueden combinar con voters para lógica de autorización compleja.</p>

        <h2>1. Definir Roles en la Entidad User</h2>
        <div class="code-block"><pre><code>&lt;?php
// src/Entity/User.php

class User implements UserInterface
{
    #[ORM\\Column(type: 'json')]
    private array $roles = [];

    public function getRoles(): array
    {
        $roles = $this->roles;
        // Garantizar que todo usuario tenga ROLE_USER
        $roles[] = 'ROLE_USER';
        
        return array_unique($roles);
    }

    public function setRoles(array $roles): self
    {
        $this->roles = $roles;
        return $this;
    }

    public function addRole(string $role): self
    {
        if (!in_array($role, $this->roles)) {
            $this->roles[] = $role;
        }
        return $this;
    }

    public function removeRole(string $role): self
    {
        $this->roles = array_diff($this->roles, [$role]);
        return $this;
    }

    public function hasRole(string $role): bool
    {
        return in_array($role, $this->getRoles());
    }
}
?></code></pre></div>

        <h2>2. Jerarquía de Roles</h2>
        <div class="code-block"><pre><code># config/packages/security.yaml

security:
    role_hierarchy:
        ROLE_ADMIN:       [ROLE_USER, ROLE_MODERATOR]
        ROLE_SUPER_ADMIN: [ROLE_ADMIN, ROLE_ALLOWED_TO_SWITCH]
        ROLE_MODERATOR:   [ROLE_USER]

# Con esta configuración:
# - ROLE_ADMIN tiene automáticamente ROLE_USER y ROLE_MODERATOR
# - ROLE_SUPER_ADMIN tiene todos los roles
# - ROLE_ALLOWED_TO_SWITCH permite impersonar usuarios
?></code></pre></div>

        <h2>3. Proteger Rutas con Roles</h2>
        <div class="code-block"><pre><code># config/packages/security.yaml

security:
    access_control:
        # Rutas públicas
        - { path: ^/login, roles: PUBLIC_ACCESS }
        - { path: ^/register, roles: PUBLIC_ACCESS }
        
        # Requiere autenticación
        - { path: ^/profile, roles: ROLE_USER }
        
        # Solo moderadores
        - { path: ^/moderate, roles: ROLE_MODERATOR }
        
        # Solo administradores
        - { path: ^/admin, roles: ROLE_ADMIN }
        
        # Solo super admin
        - { path: ^/super-admin, roles: ROLE_SUPER_ADMIN }
        
        # Múltiples roles (OR)
        - { path: ^/dashboard, roles: [ROLE_ADMIN, ROLE_MODERATOR] }
?></code></pre></div>

        <h2>4. Proteger Controladores</h2>
        <div class="code-block"><pre><code>&lt;?php
use Symfony\\Component\\Security\\Http\\Attribute\\IsGranted;

// Proteger toda la clase
#[IsGranted('ROLE_ADMIN')]
class AdminController extends AbstractController
{
    // Todos los métodos requieren ROLE_ADMIN
    
    #[Route('/admin/dashboard')]
    public function dashboard(): Response
    {
        return $this->render('admin/dashboard.html.twig');
    }
    
    // Requiere rol adicional
    #[IsGranted('ROLE_SUPER_ADMIN')]
    #[Route('/admin/settings')]
    public function settings(): Response
    {
        return $this->render('admin/settings.html.twig');
    }
}

// Proteger métodos individuales
class PostController extends AbstractController
{
    #[Route('/posts')]
    public function list(): Response
    {
        // Público
        return $this->render('post/list.html.twig');
    }
    
    #[IsGranted('ROLE_USER')]
    #[Route('/posts/new')]
    public function new(): Response
    {
        // Solo usuarios autenticados
        return $this->render('post/new.html.twig');
    }
    
    #[IsGranted('ROLE_MODERATOR')]
    #[Route('/posts/{id}/approve')]
    public function approve(Post $post): Response
    {
        // Solo moderadores
        $post->setApproved(true);
        return $this->redirectToRoute('post_list');
    }
}
?></code></pre></div>

        <h2>5. Verificar Roles Manualmente</h2>
        <div class="code-block"><pre><code>&lt;?php
class UserController extends AbstractController
{
    #[Route('/dashboard')]
    public function dashboard(Security $security): Response
    {
        // Verificar rol sin lanzar excepción
        $isAdmin = $security->isGranted('ROLE_ADMIN');
        $isModerator = $security->isGranted('ROLE_MODERATOR');
        
        // Lanzar excepción si no tiene permiso
        $this->denyAccessUnlessGranted('ROLE_USER');
        
        // Verificar múltiples roles
        if (!$security->isGranted('ROLE_ADMIN') && !$security->isGranted('ROLE_MODERATOR')) {
            throw $this->createAccessDeniedException('Acceso denegado');
        }
        
        return $this->render('dashboard.html.twig', [
            'is_admin' => $isAdmin,
            'is_moderator' => $isModerator,
        ]);
    }
}
?></code></pre></div>

        <h2>6. Roles en Twig</h2>
        <div class="code-block"><pre><code>{# Verificar si el usuario está autenticado #}
{% if is_granted('IS_AUTHENTICATED_FULLY') %}
    <p>Bienvenido, {{ app.user.email }}</p>
{% endif %}

{# Verificar rol específico #}
{% if is_granted('ROLE_ADMIN') %}
    <a href="{{ path('admin_dashboard') }}">Panel de Administración</a>
{% endif %}

{# Verificar múltiples roles #}
{% if is_granted('ROLE_ADMIN') or is_granted('ROLE_MODERATOR') %}
    <button class="btn-moderate">Moderar Contenido</button>
{% endif %}

{# Mostrar diferentes contenidos según rol #}
{% if is_granted('ROLE_SUPER_ADMIN') %}
    <div class="super-admin-panel">...</div>
{% elseif is_granted('ROLE_ADMIN') %}
    <div class="admin-panel">...</div>
{% elseif is_granted('ROLE_MODERATOR') %}
    <div class="moderator-panel">...</div>
{% else %}
    <div class="user-panel">...</div>
{% endif %}

{# Obtener roles del usuario #}
{% if app.user %}
    <ul>
        {% for role in app.user.roles %}
            <li>{{ role }}</li>
        {% endfor %}
    </ul>
{% endif %}
?></code></pre></div>

        <h2>7. Asignar Roles Dinámicamente</h2>
        <div class="code-block"><pre><code>&lt;?php
// src/Controller/AdminController.php

#[Route('/admin/user/{id}/roles', name: 'admin_user_roles')]
#[IsGranted('ROLE_ADMIN')]
public function manageRoles(
    User $user,
    Request $request,
    EntityManagerInterface $em
): Response {
    $availableRoles = [
        'ROLE_USER' => 'Usuario',
        'ROLE_MODERATOR' => 'Moderador',
        'ROLE_ADMIN' => 'Administrador',
        'ROLE_SUPER_ADMIN' => 'Super Administrador',
    ];
    
    if ($request->isMethod('POST')) {
        $selectedRoles = $request->request->all('roles');
        $user->setRoles($selectedRoles);
        $em->flush();
        
        $this->addFlash('success', 'Roles actualizados');
        return $this->redirectToRoute('admin_users');
    }
    
    return $this->render('admin/user_roles.html.twig', [
        'user' => $user,
        'available_roles' => $availableRoles,
    ]);
}

{# templates/admin/user_roles.html.twig #}
<form method="post">
    <h3>Roles de {{ user.email }}</h3>
    
    {% for role, label in available_roles %}
        <div class="form-check">
            <input type="checkbox" 
                   name="roles[]" 
                   value="{{ role }}" 
                   id="role_{{ role }}"
                   {% if role in user.roles %}checked{% endif %}>
            <label for="role_{{ role }}">{{ label }}</label>
        </div>
    {% endfor %}
    
    <button type="submit" class="btn btn-primary">Guardar</button>
</form>
?></code></pre></div>

        <h2>8. Roles Personalizados</h2>
        <div class="code-block"><pre><code>&lt;?php
// Definir roles personalizados como constantes

class UserRole
{
    public const USER = 'ROLE_USER';
    public const MODERATOR = 'ROLE_MODERATOR';
    public const ADMIN = 'ROLE_ADMIN';
    public const SUPER_ADMIN = 'ROLE_SUPER_ADMIN';
    
    // Roles específicos de negocio
    public const EDITOR = 'ROLE_EDITOR';
    public const AUTHOR = 'ROLE_AUTHOR';
    public const SUBSCRIBER = 'ROLE_SUBSCRIBER';
    public const PREMIUM = 'ROLE_PREMIUM';
    
    public static function getAll(): array
    {
        return [
            self::USER => 'Usuario',
            self::MODERATOR => 'Moderador',
            self::ADMIN => 'Administrador',
            self::SUPER_ADMIN => 'Super Administrador',
            self::EDITOR => 'Editor',
            self::AUTHOR => 'Autor',
            self::SUBSCRIBER => 'Suscriptor',
            self::PREMIUM => 'Premium',
        ];
    }
    
    public static function getLabel(string $role): string
    {
        return self::getAll()[$role] ?? $role;
    }
}

// Uso
$user->addRole(UserRole::EDITOR);
$user->addRole(UserRole::PREMIUM);
?></code></pre></div>

        <h2>9. Impersonar Usuarios (Switch User)</h2>
        <div class="code-block"><pre><code># config/packages/security.yaml

security:
    firewalls:
        main:
            switch_user: true  # Habilitar impersonación

    role_hierarchy:
        ROLE_SUPER_ADMIN: [ROLE_ADMIN, ROLE_ALLOWED_TO_SWITCH]

&lt;?php
// Solo usuarios con ROLE_ALLOWED_TO_SWITCH pueden impersonar

// Impersonar usuario
// URL: /dashboard?_switch_user=user@example.com

// Volver a usuario original
// URL: /dashboard?_switch_user=_exit

{# En Twig - Mostrar si estás impersonando #}
{% if is_granted('ROLE_PREVIOUS_ADMIN') %}
    <div class="alert alert-warning">
        Estás impersonando a {{ app.user.email }}
        <a href="{{ path('app_dashboard', {'_switch_user': '_exit'}) }}">
            Salir de impersonación
        </a>
    </div>
{% endif %}

// En controlador
public function dashboard(Security $security): Response
{
    if ($security->isGranted('ROLE_PREVIOUS_ADMIN')) {
        // El usuario actual está siendo impersonado
        $this->addFlash('warning', 'Modo impersonación activo');
    }
    
    return $this->render('dashboard.html.twig');
}
?></code></pre></div>

        <h2>10. Roles Basados en Atributos</h2>
        <div class="code-block"><pre><code>&lt;?php
// Roles dinámicos basados en propiedades del usuario

class User implements UserInterface
{
    private bool $isVerified = false;
    private ?\\DateTime $subscriptionExpiresAt = null;
    private int $postCount = 0;

    public function getRoles(): array
    {
        $roles = $this->roles;
        $roles[] = 'ROLE_USER';
        
        // Agregar rol si está verificado
        if ($this->isVerified) {
            $roles[] = 'ROLE_VERIFIED';
        }
        
        // Agregar rol si tiene suscripción activa
        if ($this->hasActiveSubscription()) {
            $roles[] = 'ROLE_PREMIUM';
        }
        
        // Agregar rol según actividad
        if ($this->postCount > 100) {
            $roles[] = 'ROLE_CONTRIBUTOR';
        }
        
        if ($this->postCount > 1000) {
            $roles[] = 'ROLE_POWER_USER';
        }
        
        return array_unique($roles);
    }

    public function hasActiveSubscription(): bool
    {
        return $this->subscriptionExpiresAt && 
               $this->subscriptionExpiresAt > new \\DateTime();
    }
}
?></code></pre></div>

        <h2>11. Comando para Gestionar Roles</h2>
        <div class="code-block"><pre><code>&lt;?php
// src/Command/UserRoleCommand.php

namespace App\\Command;

use App\\Repository\\UserRepository;
use Doctrine\\ORM\\EntityManagerInterface;
use Symfony\\Component\\Console\\Attribute\\AsCommand;
use Symfony\\Component\\Console\\Command\\Command;
use Symfony\\Component\\Console\\Input\\InputArgument;
use Symfony\\Component\\Console\\Input\\InputInterface;
use Symfony\\Component\\Console\\Output\\OutputInterface;

#[AsCommand(
    name: 'app:user:role',
    description: 'Agregar o quitar roles de usuario'
)]
class UserRoleCommand extends Command
{
    public function __construct(
        private UserRepository $userRepository,
        private EntityManagerInterface $em
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addArgument('email', InputArgument::REQUIRED, 'Email del usuario')
            ->addArgument('action', InputArgument::REQUIRED, 'add o remove')
            ->addArgument('role', InputArgument::REQUIRED, 'Rol a agregar/quitar');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $email = $input->getArgument('email');
        $action = $input->getArgument('action');
        $role = $input->getArgument('role');

        $user = $this->userRepository->findOneBy(['email' => $email]);

        if (!$user) {
            $output->writeln('<error>Usuario no encontrado</error>');
            return Command::FAILURE;
        }

        if ($action === 'add') {
            $user->addRole($role);
            $output->writeln("<info>Rol $role agregado a $email</info>");
        } elseif ($action === 'remove') {
            $user->removeRole($role);
            $output->writeln("<info>Rol $role removido de $email</info>");
        } else {
            $output->writeln('<error>Acción inválida. Use add o remove</error>');
            return Command::FAILURE;
        }

        $this->em->flush();

        return Command::SUCCESS;
    }
}

# Uso:
php bin/console app:user:role user@example.com add ROLE_ADMIN
php bin/console app:user:role user@example.com remove ROLE_MODERATOR
?></code></pre></div>

        <h2>12. Testing de Autorización</h2>
        <div class="code-block"><pre><code>&lt;?php
// tests/Controller/AdminControllerTest.php

namespace App\\Tests\\Controller;

use App\\Entity\\User;
use Symfony\\Bundle\\FrameworkBundle\\Test\\WebTestCase;

class AdminControllerTest extends WebTestCase
{
    public function testAdminDashboardRequiresAuthentication(): void
    {
        $client = static::createClient();
        $client->request('GET', '/admin/dashboard');

        // Debe redirigir al login
        $this->assertResponseRedirects('/login');
    }

    public function testAdminDashboardWithAdminRole(): void
    {
        $client = static::createClient();
        
        // Crear usuario admin
        $user = new User();
        $user->setEmail('admin@example.com');
        $user->setRoles(['ROLE_ADMIN']);
        
        // Simular login
        $client->loginUser($user);
        
        $client->request('GET', '/admin/dashboard');
        
        $this->assertResponseIsSuccessful();
        $this->assertSelectorTextContains('h1', 'Panel de Administración');
    }

    public function testAdminDashboardWithUserRole(): void
    {
        $client = static::createClient();
        
        $user = new User();
        $user->setEmail('user@example.com');
        $user->setRoles(['ROLE_USER']);
        
        $client->loginUser($user);
        
        $client->request('GET', '/admin/dashboard');
        
        // Debe denegar acceso
        $this->assertResponseStatusCodeSame(403);
    }
}
?></code></pre></div>

        <div class="success-box">
            <strong>✅ Mejores Prácticas de Roles:</strong><br>
            • <strong>Nomenclatura</strong>: Usar prefijo ROLE_ (ej: ROLE_ADMIN)<br>
            • <strong>Jerarquía</strong>: Definir herencia de roles<br>
            • <strong>Granularidad</strong>: Roles específicos para funcionalidades<br>
            • <strong>Constantes</strong>: Definir roles como constantes<br>
            • <strong>Documentación</strong>: Documentar qué hace cada rol<br>
            • <strong>Testing</strong>: Probar autorización en tests
        </div>

        <div class="info-box">
            <strong>🎯 Roles Especiales de Symfony:</strong><br>
            • <strong>PUBLIC_ACCESS</strong>: Acceso público (sin autenticación)<br>
            • <strong>IS_AUTHENTICATED_FULLY</strong>: Usuario autenticado<br>
            • <strong>IS_AUTHENTICATED_REMEMBERED</strong>: Autenticado con remember_me<br>
            • <strong>IS_AUTHENTICATED_ANONYMOUSLY</strong>: Cualquier usuario<br>
            • <strong>ROLE_ALLOWED_TO_SWITCH</strong>: Puede impersonar usuarios<br>
            • <strong>ROLE_PREVIOUS_ADMIN</strong>: Está impersonando a otro usuario
        </div>

        <div class="warning-box">
            <strong>⚠️ Consideraciones:</strong><br>
            • No confundir roles con permisos (usar voters para lógica compleja)<br>
            • Roles son para categorías de usuarios, no para recursos específicos<br>
            • Usar jerarquía para evitar redundancia<br>
            • Proteger tanto en backend como frontend<br>
            • No exponer roles sensibles en URLs o JavaScript<br>
            • Auditar cambios de roles
        </div>
    `,
    
    'patron-flyweight': `
        <h1>Patrón Flyweight (Peso Ligero)</h1>
        
        <p>El <strong>patrón Flyweight</strong> optimiza el uso de memoria compartiendo eficientemente grandes cantidades de objetos similares. Separa el estado intrínseco (compartido) del extrínseco (único).</p>

        <div class="info-box">
            <strong>💡 ¿Qué es el Patrón Flyweight?</strong><br>
            • <strong>Propósito</strong>: Reducir uso de memoria compartiendo datos<br>
            • <strong>Problema</strong>: Miles de objetos similares consumen mucha RAM<br>
            • <strong>Solución</strong>: Compartir estado común, externalizar estado único<br>
            • <strong>Analogía</strong>: Como fuentes en un procesador de textos (compartir glifos)<br>
            • <strong>Tipo</strong>: Patrón estructural
        </div>

        <h3>Problema Sin Flyweight</h3>
        <div class="code-block"><pre><code>&lt;?php
// ❌ Sin Flyweight: Cada árbol tiene toda la información

class Tree {
    public function __construct(
        private int $x,
        private int $y,
        private string $type,      // Repetido
        private string $color,     // Repetido
        private string $texture    // Repetido (puede ser imagen grande)
    ) {}
    
    public function draw(): void {
        echo "🌳 Árbol {$this->type} en ({$this->x}, {$this->y})\\n";
    }
}

// 1000 árboles = 1000 copias de type, color, texture
$trees = [];
for ($i = 0; $i < 1000; $i++) {
    $trees[] = new Tree(
        rand(0, 100),
        rand(0, 100),
        'Pino',        // ❌ Repetido 1000 veces
        'Verde',       // ❌ Repetido 1000 veces
        'texture.png'  // ❌ Repetido 1000 veces
    );
}
?&gt;</code></pre></div>

        <h3>Solución Con Flyweight</h3>
        <div class="code-block"><pre><code>&lt;?php
// ✅ Con Flyweight: Compartir estado común

// Flyweight: Estado intrínseco (compartido)
class TreeType {
    public function __construct(
        private string $name,
        private string $color,
        private string $texture
    ) {}
    
    public function draw(int $x, int $y): void {
        echo "🌳 {$this->name} {$this->color} en ({$x}, {$y})\\n";
    }
}

// Flyweight Factory: Gestiona objetos compartidos
class TreeFactory {
    private static array $treeTypes = [];
    
    public static function getTreeType(
        string $name,
        string $color,
        string $texture
    ): TreeType {
        $key = "{$name}_{$color}_{$texture}";
        
        if (!isset(self::$treeTypes[$key])) {
            echo "➕ Creando nuevo tipo: {$key}\\n";
            self::$treeTypes[$key] = new TreeType($name, $color, $texture);
        }
        
        return self::$treeTypes[$key];
    }
    
    public static function getTypesCount(): int {
        return count(self::$treeTypes);
    }
}

// Contexto: Estado extrínseco (único por objeto)
class Tree {
    public function __construct(
        private int $x,
        private int $y,
        private TreeType $type  // Referencia compartida
    ) {}
    
    public function draw(): void {
        $this->type->draw($this->x, $this->y);
    }
}

// Uso
$trees = [];

// 1000 árboles pero solo 3 TreeType compartidos
for ($i = 0; $i < 1000; $i++) {
    $types = [
        ['Pino', 'Verde', 'pine.png'],
        ['Roble', 'Marrón', 'oak.png'],
        ['Abedul', 'Blanco', 'birch.png']
    ];
    
    $randomType = $types[array_rand($types)];
    
    $trees[] = new Tree(
        rand(0, 100),
        rand(0, 100),
        TreeFactory::getTreeType(...$randomType)
    );
}

echo "\\n📊 Total árboles: " . count($trees) . "\\n";
echo "📊 Tipos únicos: " . TreeFactory::getTypesCount() . "\\n";
echo "💾 Ahorro de memoria: " . (1000 - TreeFactory::getTypesCount()) . " objetos\\n";
?&gt;</code></pre></div>

        <h3>Ejemplo Real: Sistema de Partículas</h3>
        <div class="code-block"><pre><code>&lt;?php
// Sistema de partículas para videojuego

// Flyweight: Tipo de partícula (compartido)
class ParticleType {
    public function __construct(
        private string $sprite,
        private string $color,
        private int $size
    ) {}
    
    public function render(int $x, int $y, int $velocity): void {
        echo "{$this->color} {$this->sprite} ({$this->size}px) ";
        echo "en ({$x}, {$y}) vel:{$velocity}\\n";
    }
}

// Factory
class ParticleFactory {
    private static array $types = [];
    
    public static function getType(string $sprite, string $color, int $size): ParticleType {
        $key = "{$sprite}_{$color}_{$size}";
        
        if (!isset(self::$types[$key])) {
            self::$types[$key] = new ParticleType($sprite, $color, $size);
        }
        
        return self::$types[$key];
    }
}

// Contexto: Partícula individual
class Particle {
    public function __construct(
        private int $x,
        private int $y,
        private int $velocity,
        private ParticleType $type
    ) {}
    
    public function move(): void {
        $this->x += $this->velocity;
    }
    
    public function render(): void {
        $this->type->render($this->x, $this->y, $this->velocity);
    }
}

// Sistema de partículas
class ParticleSystem {
    private array $particles = [];
    
    public function addExplosion(int $x, int $y): void {
        // Crear 100 partículas de explosión
        for ($i = 0; $i < 100; $i++) {
            $this->particles[] = new Particle(
                $x,
                $y,
                rand(1, 10),
                ParticleFactory::getType('●', '🔥', 5)  // Compartido
            );
        }
    }
    
    public function addSmoke(int $x, int $y): void {
        for ($i = 0; $i < 50; $i++) {
            $this->particles[] = new Particle(
                $x,
                $y,
                rand(1, 3),
                ParticleFactory::getType('○', '💨', 3)  // Compartido
            );
        }
    }
    
    public function render(): void {
        foreach ($this->particles as $particle) {
            $particle->render();
        }
    }
    
    public function getCount(): int {
        return count($this->particles);
    }
}

// Uso
$system = new ParticleSystem();
$system->addExplosion(50, 50);
$system->addSmoke(60, 60);

echo "\\n💥 Total partículas: {$system->getCount()}\\n";
?&gt;</code></pre></div>

        <h3>Ejemplo Real: Editor de Texto</h3>
        <div class="code-block"><pre><code>&lt;?php
// Editor de texto con millones de caracteres

// Flyweight: Estilo de carácter (compartido)
class CharacterStyle {
    public function __construct(
        private string $font,
        private int $size,
        private string $color
    ) {}
    
    public function apply(string $char): string {
        return "<span style='font:{$this->font}; size:{$this->size}px; color:{$this->color}'>{$char}</span>";
    }
}

// Factory
class StyleFactory {
    private static array $styles = [];
    
    public static function getStyle(string $font, int $size, string $color): CharacterStyle {
        $key = "{$font}_{$size}_{$color}";
        
        if (!isset(self::$styles[$key])) {
            self::$styles[$key] = new CharacterStyle($font, $size, $color);
        }
        
        return self::$styles[$key];
    }
    
    public static function getCount(): int {
        return count(self::$styles);
    }
}

// Contexto: Carácter individual
class Character {
    public function __construct(
        private string $char,
        private int $position,
        private CharacterStyle $style
    ) {}
    
    public function render(): string {
        return $this->style->apply($this->char);
    }
}

// Documento
class Document {
    private array $characters = [];
    
    public function addText(string $text, string $font, int $size, string $color): void {
        $style = StyleFactory::getStyle($font, $size, $color);
        
        for ($i = 0; $i < strlen($text); $i++) {
            $this->characters[] = new Character(
                $text[$i],
                count($this->characters),
                $style  // Compartido
            );
        }
    }
    
    public function getStats(): array {
        return [
            'characters' => count($this->characters),
            'styles' => StyleFactory::getCount()
        ];
    }
}

// Uso
$doc = new Document();
$doc->addText("Hola mundo", "Arial", 12, "black");
$doc->addText("Título importante", "Arial", 24, "red");
$doc->addText("Más texto normal", "Arial", 12, "black");

$stats = $doc->getStats();
echo "📝 Caracteres totales: {$stats['characters']}\\n";
echo "🎨 Estilos únicos: {$stats['styles']}\\n";
echo "💾 Ahorro: " . ($stats['characters'] - $stats['styles']) . " objetos de estilo\\n";
?&gt;</code></pre></div>

        <div class="success-box">
            <strong>✅ Ventajas del Flyweight:</strong><br>
            • <strong>Memoria</strong>: Reduce drásticamente uso de RAM<br>
            • <strong>Rendimiento</strong>: Menos objetos = menos presión en GC<br>
            • <strong>Escalabilidad</strong>: Maneja millones de objetos<br>
            • <strong>Cache-friendly</strong>: Mejor localidad de datos
        </div>

        <div class="warning-box">
            <strong>⚠️ Desventajas:</strong><br>
            • <strong>Complejidad</strong>: Separar estado intrínseco/extrínseco<br>
            • <strong>CPU</strong>: Pequeño overhead por búsqueda en factory<br>
            • <strong>Contexto</strong>: Debes pasar estado extrínseco en cada llamada
        </div>

        <div class="info-box">
            <strong>🎯 Cuándo Usar Flyweight:</strong><br>
            • Aplicación usa gran cantidad de objetos similares<br>
            • El costo de almacenamiento es alto<br>
            • La mayoría del estado puede ser extrínseco<br>
            • Muchos objetos pueden reemplazarse por pocos compartidos<br>
            <br>
            <strong>⚠️ Cuándo NO Usar:</strong><br>
            • Pocos objetos en memoria<br>
            • Estado mayormente único (no compartible)<br>
            • Complejidad no justifica el ahorro
        </div>

        <h3>Comparación: Con vs Sin Flyweight</h3>
        <div class="code-block"><pre><code>&lt;?php
// Comparación de uso de memoria

class MemoryTest {
    public static function withoutFlyweight(): void {
        $objects = [];
        for ($i = 0; $i < 10000; $i++) {
            $objects[] = [
                'id' => $i,
                'type' => 'Usuario',      // Repetido 10000 veces
                'icon' => '👤',           // Repetido 10000 veces
                'permissions' => ['read'] // Repetido 10000 veces
            ];
        }
        echo "Sin Flyweight: " . memory_get_usage() . " bytes\\n";
    }
    
    public static function withFlyweight(): void {
        $sharedType = [
            'type' => 'Usuario',
            'icon' => '👤',
            'permissions' => ['read']
        ];
        
        $objects = [];
        for ($i = 0; $i < 10000; $i++) {
            $objects[] = [
                'id' => $i,
                'sharedRef' => &$sharedType  // Referencia compartida
            ];
        }
        echo "Con Flyweight: " . memory_get_usage() . " bytes\\n";
    }
}

MemoryTest::withoutFlyweight();
MemoryTest::withFlyweight();
?&gt;</code></pre></div>
    `,

    // ============================================
    // DESARROLLO CON PRESTASHOP
    // ============================================

    // Symfony Messenger y Colas de Mensajes
    'conceptos-message-bus-handlers': `<h1>Conceptos de Message Bus, Messages y Handlers</h1><p>Contenido en desarrollo...</p>`,
    'sincronizacion-asincronia-mensajes': `<h1>Sincronización y Asincronía de Mensajes</h1><p>Contenido en desarrollo...</p>`,
    'integracion-colas-redis-rabbitmq': `<h1>Integración con Colas de Mensajes (Redis, RabbitMQ, SQS)</h1><p>Contenido en desarrollo...</p>`,
    'workers-supervision': `<h1>Workers y Supervisión</h1><p>Contenido en desarrollo...</p>`,
    'serializacion-mensajes': `<h1>Serialización de Mensajes</h1><p>Contenido en desarrollo...</p>`,
    'middleware-messenger': `<h1>Middleware de Messenger</h1><p>Contenido en desarrollo...</p>`,
    'fallos-reintentos-mensajes': `<h1>Fallos y Reintentos de Mensajes</h1><p>Contenido en desarrollo...</p>`,

    // Arquitectura y Conceptos de PrestaShop
    'ciclo-vida-peticiones-prestashop': `<h1>Ciclo de Vida de Peticiones en PrestaShop</h1><p>Contenido en desarrollo...</p>`,
    'estructura-modulos-temas': `<h1>Estructura de Módulos y Temas</h1><p>Contenido en desarrollo...</p>`,
    'overrides-clases-controladores': `<h1>Overrides de Clases, Controladores y Modelos</h1><p>Contenido en desarrollo...</p>`,
    'hooks-eventos-prestashop': `<h1>Hooks y Eventos en PrestaShop</h1><p>Contenido en desarrollo...</p>`,
    'modelo-datos-prestashop': `<h1>Modelo de Datos de PrestaShop y Clases Core</h1><p>Contenido en desarrollo...</p>`,
    'configuracion-multitienda-multiidioma': `<h1>Configuración Multitienda y Multi-idioma</h1><p>Contenido en desarrollo...</p>`,
    'cache-prestashop-smarty-apcu': `<h1>Caché de PrestaShop (Smarty, APCu, Memcached)</h1><p>Contenido en desarrollo...</p>`,

    // Desarrollo de Módulos Avanzados
    'creacion-controladores-front-back': `<h1>Creación de Controladores Front Office y Back Office</h1><p>Contenido en desarrollo...</p>`,
    'uso-orm-prestashop': `<h1>Uso del ORM de PrestaShop (ORM Core)</h1><p>Contenido en desarrollo...</p>`,
    'configuracion-modulos-back-office': `<h1>Configuración de Módulos y Pestañas en el Back Office</h1><p>Contenido en desarrollo...</p>`,
    'gestion-activos-css-js': `<h1>Gestión de Activos (CSS/JS) y Compilación</h1><p>Contenido en desarrollo...</p>`,
    'internacionalizacion-traducciones-modulos': `<h1>Internacionalización y Traducciones en Módulos</h1><p>Contenido en desarrollo...</p>`,
    'integracion-web-services-prestashop': `<h1>Integración con Web Services de PrestaShop</h1><p>Contenido en desarrollo...</p>`,
    'buenas-practicas-estandares-modulos': `<h1>Buenas Prácticas y Estándares de Codificación para Módulos</h1><p>Contenido en desarrollo...</p>`,

    // Desarrollo de Temas Personalizados
    'estructura-tema-classic-starter': `<h1>Estructura de un Tema (Classic, Starter Theme)</h1><p>Contenido en desarrollo...</p>`,
    'sobreescritura-plantillas-smarty-twig': `<h1>Sobreescritura de Plantillas Smarty/Twig (PrestaShop 1.7+)</h1><p>Contenido en desarrollo...</p>`,
    'integracion-modulos-tema': `<h1>Integración de Módulos en el Tema</h1><p>Contenido en desarrollo...</p>`,
    'personalizacion-css-sass-javascript': `<h1>Personalización Avanzada de CSS (Sass/Less) y JavaScript</h1><p>Contenido en desarrollo...</p>`,
    'optimizacion-rendimiento-tema': `<h1>Optimización de Rendimiento del Tema</h1><p>Contenido en desarrollo...</p>`,
    'responsive-design-adaptacion-movil': `<h1>Responsive Design y Adaptación Móvil</h1><p>Contenido en desarrollo...</p>`,
    'creacion-paginas-layouts-personalizados': `<h1>Creación de Páginas y Layouts Personalizados</h1><p>Contenido en desarrollo...</p>`
};

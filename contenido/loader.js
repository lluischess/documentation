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

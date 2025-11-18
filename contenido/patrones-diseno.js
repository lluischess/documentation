// Contenido: Patrones de Diseño y Principios de Ingeniería de Software
const patronesDiseno = {
    // === CARACTERÍSTICAS MODERNAS DE PHP ===
    'match-expression': `
        <h1>Match Expression (PHP 8+)</h1>
        
        <p>La expresión <code>match</code> es una alternativa más poderosa y segura al <code>switch</code> tradicional. Retorna un valor directamente y hace comparaciones estrictas.</p>

        <h3>Sintaxis Básica</h3>
        <div class="code-block"><pre><code>&lt;?php
// Switch tradicional
$dia = 'lunes';
switch ($dia) {
    case 'lunes':
        $mensaje = 'Inicio de semana';
        break;
    case 'viernes':
        $mensaje = 'Fin de semana cerca';
        break;
    default:
        $mensaje = 'Día normal';
}

// Match - más conciso y retorna valor
$mensaje = match($dia) {
    'lunes' => 'Inicio de semana',
    'viernes' => 'Fin de semana cerca',
    default => 'Día normal'
};

echo $mensaje;
?&gt;</code></pre></div>

        <h3>Diferencias con Switch</h3>
        <div class="code-block"><pre><code>&lt;?php
// 1. Match usa comparación estricta (===)
$valor = '1';

// Switch: comparación débil (==)
switch ($valor) {
    case 1:
        echo "Coincide";  // ¡Se ejecuta aunque sea string!
        break;
}

// Match: comparación estricta (===)
$resultado = match($valor) {
    1 => "No coincide",  // No se ejecuta
    '1' => "Coincide",   // ¡Se ejecuta!
    default => "Default"
};

// 2. Match no necesita break
// 3. Match retorna un valor
// 4. Match lanza UnhandledMatchError si no hay coincidencia
?&gt;</code></pre></div>

        <h3>Múltiples Condiciones</h3>
        <div class="code-block"><pre><code>&lt;?php
$codigoHTTP = 404;

$mensaje = match($codigoHTTP) {
    200, 201, 202 => 'Éxito',
    301, 302, 307 => 'Redirección',
    400, 401, 403, 404 => 'Error del cliente',
    500, 502, 503 => 'Error del servidor',
    default => 'Código desconocido'
};

// Con condiciones
$edad = 25;
$categoria = match(true) {
    $edad < 13 => 'Niño',
    $edad < 18 => 'Adolescente',
    $edad < 65 => 'Adulto',
    default => 'Senior'
};
?&gt;</code></pre></div>

        <h3>Con Expresiones Complejas</h3>
        <div class="code-block"><pre><code>&lt;?php
class TipoPago {
    const EFECTIVO = 1;
    const TARJETA = 2;
    const TRANSFERENCIA = 3;
}

function calcularComision(int $tipo, float $monto): float {
    return match($tipo) {
        TipoPago::EFECTIVO => 0,
        TipoPago::TARJETA => $monto * 0.02,
        TipoPago::TRANSFERENCIA => min($monto * 0.01, 10),
        default => throw new InvalidArgumentException("Tipo de pago inválido")
    };
}

// Match con funciones
$operacion = 'sumar';
$resultado = match($operacion) {
    'sumar' => fn($a, $b) => $a + $b,
    'restar' => fn($a, $b) => $a - $b,
    'multiplicar' => fn($a, $b) => $a * $b,
    'dividir' => fn($a, $b) => $b !== 0 ? $a / $b : null,
}(10, 5);  // Ejecutar inmediatamente con argumentos
?&gt;</code></pre></div>

        <div class="info-box">
            <strong>💡 Cuándo usar Match vs Switch:</strong><br>
            • <strong>Match</strong>: Cuando necesitas retornar un valor, comparación estricta<br>
            • <strong>Switch</strong>: Cuando necesitas múltiples statements, fall-through, comparación débil<br>
            • Match es más seguro y moderno, úsalo por defecto en PHP 8+
        </div>
    `,

    'operador-nullsafe': `
        <h1>Operador Nullsafe (PHP 8+)</h1>
        
        <p>El operador nullsafe <code>?-></code> permite acceder a propiedades y métodos de objetos que podrían ser null sin lanzar errores.</p>

        <h3>Problema sin Nullsafe</h3>
        <div class="code-block"><pre><code>&lt;?php
class Usuario {
    public function __construct(
        public ?Direccion $direccion = null
    ) {}
}

class Direccion {
    public function __construct(
        public ?string $ciudad = null
    ) {}
}

$usuario = new Usuario();

// Sin nullsafe - Genera error
// $ciudad = $usuario->direccion->ciudad;
// Error: Trying to get property 'ciudad' of null

// Solución tradicional - verbose
$ciudad = null;
if ($usuario->direccion !== null) {
    $ciudad = $usuario->direccion->ciudad;
}

// O con operador ternario
$ciudad = $usuario->direccion ? $usuario->direccion->ciudad : null;
?&gt;</code></pre></div>

        <h3>Con Operador Nullsafe</h3>
        <div class="code-block"><pre><code>&lt;?php
// Nullsafe operator - elegante y seguro
$ciudad = $usuario?->direccion?->ciudad;

// Si cualquier parte es null, retorna null sin error
// Equivalente a:
$ciudad = ($usuario !== null && $usuario->direccion !== null) 
    ? $usuario->direccion->ciudad 
    : null;

// Funciona con métodos también
$resultado = $objeto?->metodo()?->otroMetodo();

// Encadenar con null coalescing
$ciudad = $usuario?->direccion?->ciudad ?? 'Desconocida';
?&gt;</code></pre></div>

        <h3>Ejemplo Práctico</h3>
        <div class="code-block"><pre><code>&lt;?php
class Pedido {
    public function __construct(
        public ?Usuario $usuario = null
    ) {}
}

class Usuario {
    public function __construct(
        public ?Perfil $perfil = null
    ) {}
}

class Perfil {
    public function __construct(
        public ?string $telefono = null
    ) {}
    
    public function getTelefono(): ?string {
        return $this->telefono;
    }
}

// Sin usuarios
$pedido = new Pedido();

// Antes (PHP 7)
$telefono = null;
if ($pedido->usuario !== null) {
    if ($pedido->usuario->perfil !== null) {
        $telefono = $pedido->usuario->perfil->getTelefono();
    }
}

// Ahora (PHP 8+) - Una línea
$telefono = $pedido?->usuario?->perfil?->getTelefono();

// Con valor por defecto
$telefonoContacto = $pedido?->usuario?->perfil?->getTelefono() ?? '+34 900 000 000';
?&gt;</code></pre></div>

        <h3>Combinado con Arrays</h3>
        <div class="code-block"><pre><code>&lt;?php
class Empresa {
    public function __construct(
        public array $departamentos = []
    ) {}
}

$empresa = new Empresa([
    'ventas' => (object)['jefe' => 'Ana'],
    'IT' => null
]);

// Nullsafe con arrays y objetos
$jefeVentas = $empresa->departamentos['ventas']?->jefe;  // "Ana"
$jefeIT = $empresa->departamentos['IT']?->jefe;          // null

// Cuidado: nullsafe NO funciona con arrays directamente
// $valor = $array?['key'];  // Syntax error
// Solo funciona con objetos
?&gt;</code></pre></div>

        <div class="warning-box">
            <strong>⚠️ Limitaciones:</strong><br>
            • Solo funciona con objetos, no con arrays<br>
            • No hace cortocircuito en parámetros de funciones<br>
            • No reemplaza todas las validaciones - úsalo con criterio
        </div>
    `,

    'named-arguments': `
        <h1>Named Arguments (PHP 8+)</h1>
        
        <p>Los argumentos nombrados permiten pasar parámetros a funciones especificando explícitamente el nombre del parámetro, en cualquier orden.</p>

        <h3>Sintaxis Básica</h3>
        <div class="code-block"><pre><code>&lt;?php
function crearUsuario(
    string $nombre,
    string $email,
    int $edad = 18,
    bool $activo = true,
    ?string $telefono = null
) {
    return compact('nombre', 'email', 'edad', 'activo', 'telefono');
}

// Forma tradicional - posicional
$user1 = crearUsuario('Juan', 'juan@example.com', 25, true, '+34600000000');

// Con named arguments - más legible
$user2 = crearUsuario(
    nombre: 'Ana',
    email: 'ana@example.com',
    edad: 30,
    activo: false,
    telefono: '+34700000000'
);

// Saltar parámetros opcionales
$user3 = crearUsuario(
    nombre: 'Pedro',
    email: 'pedro@example.com',
    telefono: '+34800000000'  // Salta edad y activo
);

// Cambiar el orden
$user4 = crearUsuario(
    email: 'luis@example.com',
    nombre: 'Luis',  // Orden invertido
    edad: 35
);
?&gt;</code></pre></div>

        <h3>Ventajas</h3>
        <div class="code-block"><pre><code>&lt;?php
// 1. Legibilidad - Auto-documentado
enviarEmail(
    destinatario: 'usuario@example.com',
    asunto: 'Bienvenido',
    cuerpo: 'Gracias por registrarte',
    adjuntos: ['documento.pdf'],
    prioridad: 'alta'
);

// 2. Saltar parámetros opcionales sin valores por defecto
function generarReporte(
    $titulo,
    $formato = 'pdf',
    $incluirGraficos = true,
    $comprimido = false,
    $password = null
) {
    // ...
}

// Quiero especificar solo password, saltando el resto
generarReporte(
    titulo: 'Ventas 2024',
    password: 'secreto123'
);

// 3. Claridad en booleanos
guardarArchivo(
    ruta: '/uploads/file.txt',
    sobrescribir: true,  // ✓ Claro qué significa
    crearDirectorio: false
);

// vs posicional (¿qué significan?)
guardarArchivo('/uploads/file.txt', true, false);
?&gt;</code></pre></div>

        <h3>Combinando Posicional y Nombrado</h3>
        <div class="code-block"><pre><code>&lt;?php
function procesar($a, $b, $c = null, $d = null) {
    return [$a, $b, $c, $d];
}

// Posicionales primero, luego nombrados
$resultado = procesar(1, 2, d: 4);
// $a=1, $b=2, $c=null, $d=4

// ❌ ERROR: Named arguments no pueden venir antes de posicionales
// $resultado = procesar(d: 4, 1, 2);  // Parse error

// ✓ Correcto: todos nombrados
$resultado = procesar(a: 1, d: 4, b: 2);

// Útil con constructores
class Configuracion {
    public function __construct(
        public string $host = 'localhost',
        public int $puerto = 3306,
        public string $database = '',
        public string $usuario = 'root',
        public string $password = ''
    ) {}
}

// Solo especificar lo necesario
$config = new Configuracion(
    database: 'mi_db',
    password: 'secreto'
);
?&gt;</code></pre></div>

        <h3>Con Arrays y Spread Operator</h3>
        <div class="code-block"><pre><code>&lt;?php
function crearProducto(
    string $nombre,
    float $precio,
    string $categoria,
    int $stock = 0
) {
    return compact('nombre', 'precio', 'categoria', 'stock');
}

// Spread con named arguments
$datos = [
    'nombre' => 'Laptop',
    'precio' => 999.99,
    'categoria' => 'Electrónica'
];

$producto = crearProducto(...$datos);

// Mezclar spread y argumentos nombrados
$producto = crearProducto(
    ...$datos,
    stock: 50  // Sobrescribe o añade
);

// Útil con arrays de configuración
$configDefecto = [
    'timeout' => 30,
    'retry' => 3,
    'cache' => true
];

$configCustom = [
    'timeout' => 60,
    'debug' => true
];

function conectar(
    int $timeout = 30,
    int $retry = 3,
    bool $cache = true,
    bool $debug = false
) {
    // ...
}

// Combinar configuraciones
conectar(...$configDefecto, ...$configCustom);
// timeout=60 (sobrescrito), retry=3, cache=true, debug=true
?&gt;</code></pre></div>

        <h3>Casos de Uso Reales</h3>
        <div class="code-block"><pre><code>&lt;?php
// Laravel Query Builder
$usuarios = DB::table('usuarios')
    ->where('edad', '>', 18)
    ->orderBy(column: 'nombre', direction: 'asc')
    ->limit(10)
    ->get();

// Validación de formularios
$validator = Validator::make(
    data: $request->all(),
    rules: [
        'email' => 'required|email',
        'password' => 'required|min:8'
    ],
    messages: [
        'email.required' => 'El email es obligatorio'
    ]
);

// Testing más legible
$this->assertDatabaseHas(
    table: 'usuarios',
    data: ['email' => 'test@example.com']
);

// HTML helpers
echo html(
    tag: 'button',
    content: 'Enviar',
    attributes: ['class' => 'btn', 'type' => 'submit'],
    escapeContent: false
);
?&gt;</code></pre></div>

        <div class="info-box">
            <strong>💡 Cuándo Usar Named Arguments:</strong><br>
            • Funciones con muchos parámetros opcionales<br>
            • Cuando los parámetros booleanos no son obvios<br>
            • Para mejorar la legibilidad del código<br>
            • En APIs públicas donde la claridad es importante<br>
            • Con constructores que tienen muchas propiedades
        </div>
    `,

    // === PRINCIPIOS SOLID ===
    'principio-srp': `
        <h1>Principio de Responsabilidad Única (SRP)</h1>
        
        <p>El <strong>Single Responsibility Principle</strong> establece que una clase debe tener una sola razón para cambiar, es decir, una sola responsabilidad.</p>

        <h3>❌ Violación del SRP</h3>
        <div class="code-block"><pre><code>&lt;?php
// Esta clase tiene MÚLTIPLES responsabilidades
class Usuario {
    public function __construct(
        private string $nombre,
        private string $email,
        private string $password
    ) {}
    
    // Responsabilidad 1: Validación
    public function validar(): bool {
        if (empty($this->nombre)) return false;
        if (!filter_var($this->email, FILTER_VALIDATE_EMAIL)) return false;
        if (strlen($this->password) < 8) return false;
        return true;
    }
    
    // Responsabilidad 2: Persistencia
    public function guardar(): void {
        $pdo = new PDO('mysql:host=localhost;dbname=test', 'user', 'pass');
        $stmt = $pdo->prepare('INSERT INTO usuarios VALUES (?, ?, ?)');
        $stmt->execute([$this->nombre, $this->email, $this->password]);
    }
    
    // Responsabilidad 3: Envío de emails
    public function enviarEmailBienvenida(): void {
        mail($this->email, 'Bienvenido', "Hola {$this->nombre}");
    }
    
    // Responsabilidad 4: Logging
    public function log($mensaje): void {
        file_put_contents('logs/usuario.log', $mensaje, FILE_APPEND);
    }
}

// Problemas:
// - Difícil de testear (conexión DB, envío email)
// - Cambios en DB afectan a la clase Usuario
// - Cambios en validación afectan a la clase
// - Difícil de reutilizar cada parte
?&gt;</code></pre></div>

        <h3>✅ Aplicando SRP</h3>
        <div class="code-block"><pre><code>&lt;?php
// Clase Usuario - Solo gestiona los datos del usuario
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

// Responsabilidad de validación separada
class UsuarioValidator {
    public function validar(Usuario $usuario): array {
        $errores = [];
        
        if (empty($usuario->getNombre())) {
            $errores[] = 'El nombre es requerido';
        }
        
        if (!filter_var($usuario->getEmail(), FILTER_VALIDATE_EMAIL)) {
            $errores[] = 'Email inválido';
        }
        
        if (strlen($usuario->getPassword()) < 8) {
            $errores[] = 'La contraseña debe tener al menos 8 caracteres';
        }
        
        return $errores;
    }
}

// Responsabilidad de persistencia separada
class UsuarioRepository {
    public function __construct(
        private PDO $pdo
    ) {}
    
    public function guardar(Usuario $usuario): void {
        $stmt = $this->pdo->prepare(
            'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)'
        );
        
        $stmt->execute([
            $usuario->getNombre(),
            $usuario->getEmail(),
            password_hash($usuario->getPassword(), PASSWORD_DEFAULT)
        ]);
    }
    
    public function buscarPorEmail(string $email): ?Usuario {
        $stmt = $this->pdo->prepare('SELECT * FROM usuarios WHERE email = ?');
        $stmt->execute([$email]);
        $datos = $stmt->fetch();
        
        if (!$datos) return null;
        
        return new Usuario($datos['nombre'], $datos['email'], $datos['password']);
    }
}

// Responsabilidad de notificaciones separada
class EmailService {
    public function enviarBienvenida(Usuario $usuario): void {
        $asunto = 'Bienvenido a nuestra plataforma';
        $mensaje = "Hola {$usuario->getNombre()}, gracias por registrarte";
        
        mail($usuario->getEmail(), $asunto, $mensaje);
    }
}

// Responsabilidad de logging separada
class Logger {
    public function __construct(
        private string $archivo
    ) {}
    
    public function info(string $mensaje): void {
        $this->escribir('INFO', $mensaje);
    }
    
    public function error(string $mensaje): void {
        $this->escribir('ERROR', $mensaje);
    }
    
    private function escribir(string $nivel, string $mensaje): void {
        $fecha = date('Y-m-d H:i:s');
        $linea = "[$fecha] $nivel: $mensaje\\n";
        file_put_contents($this->archivo, $linea, FILE_APPEND);
    }
}

// Uso coordinado
$pdo = new PDO('mysql:host=localhost;dbname=test', 'user', 'pass');
$usuario = new Usuario('Juan', 'juan@example.com', 'password123');

$validator = new UsuarioValidator();
$errores = $validator->validar($usuario);

if (empty($errores)) {
    $repository = new UsuarioRepository($pdo);
    $repository->guardar($usuario);
    
    $emailService = new EmailService();
    $emailService->enviarBienvenida($usuario);
    
    $logger = new Logger('logs/usuarios.log');
    $logger->info("Usuario {$usuario->getEmail()} registrado");
}

// Ventajas:
// - Cada clase tiene una razón para cambiar
// - Fácil de testear (mockear cada servicio)
// - Reutilizable (EmailService para otros casos)
// - Mantenible (cambios aislados)
?&gt;</code></pre></div>

        <div class="info-box">
            <strong>💡 Cómo Identificar Violaciones del SRP:</strong><br>
            • La clase tiene más de 300-400 líneas<br>
            • Métodos que no usan las propiedades de la clase<br>
            • Muchos métodos públicos diferentes<br>
            • La clase tiene palabras como "And" o "Manager" en el nombre<br>
            • Difícil escribir un test unitario para la clase
        </div>
    `
};

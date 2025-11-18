// Contenido: Programación Orientada a Objetos
const oop = {
    'clases-objetos': `
        <h1>Clases, Objetos, Propiedades y Métodos</h1>
        
        <p>La Programación Orientada a Objetos (OOP) es un paradigma que organiza el código en objetos que contienen datos (propiedades) y comportamiento (métodos).</p>

        <h3>Definición de Clases</h3>
        <div class="code-block"><pre><code>&lt;?php
// Clase básica
class Usuario {
    // Propiedades (atributos)
    public string $nombre;
    public string $email;
    private string $password;
    protected int $edad;
    
    // Propiedad estática
    public static int $contador = 0;
    
    // Constante de clase
    const ROLE_ADMIN = 'admin';
    const ROLE_USER = 'user';
}

// Crear objeto (instancia)
$usuario = new Usuario();
$usuario->nombre = "Juan";
$usuario->email = "juan@example.com";

echo $usuario->nombre;  // "Juan"
?&gt;</code></pre></div>

        <h3>Métodos</h3>
        <div class="code-block"><pre><code>&lt;?php
class Calculadora {
    // Método de instancia
    public function sumar($a, $b) {
        return $a + $b;
    }
    
    // Método con type hinting
    public function multiplicar(int $a, int $b): int {
        return $a * $b;
    }
    
    // Método estático
    public static function dividir(float $a, float $b): float {
        if ($b === 0.0) {
            throw new InvalidArgumentException("División por cero");
        }
        return $a / $b;
    }
    
    // Método privado (solo interno)
    private function validar($numero): bool {
        return is_numeric($numero);
    }
}

// Uso
$calc = new Calculadora();
echo $calc->sumar(5, 3);           // 8
echo $calc->multiplicar(4, 2);     // 8

// Método estático sin instancia
echo Calculadora::dividir(10, 2);  // 5.0
?&gt;</code></pre></div>

        <h3>$this y self</h3>
        <div class="code-block"><pre><code>&lt;?php
class Producto {
    private string $nombre;
    private float $precio;
    private static float $impuesto = 0.21;
    
    public function __construct(string $nombre, float $precio) {
        // $this referencia a la instancia actual
        $this->nombre = $nombre;
        $this->precio = $precio;
    }
    
    public function getPrecioFinal(): float {
        // Acceder a propiedad de instancia
        $base = $this->precio;
        
        // Acceder a propiedad estática con self::
        $impuesto = self::$impuesto;
        
        return $base * (1 + $impuesto);
    }
    
    public function getNombre(): string {
        return $this->nombre;
    }
    
    public static function setImpuesto(float $nuevo): void {
        // En métodos estáticos no existe $this
        self::$impuesto = $nuevo;
    }
    
    public static function getImpuesto(): float {
        return self::$impuesto;
    }
}

$laptop = new Producto("Laptop", 1000);
echo $laptop->getPrecioFinal();  // 1210 (1000 + 21%)

Producto::setImpuesto(0.16);
echo $laptop->getPrecioFinal();  // 1160 (1000 + 16%)
?&gt;</code></pre></div>

        <h3>Getters y Setters</h3>
        <div class="code-block"><pre><code>&lt;?php
class CuentaBancaria {
    private float $saldo = 0;
    private string $titular;
    private bool $activa = true;
    
    // Getter
    public function getSaldo(): float {
        return $this->saldo;
    }
    
    // Setter con validación
    public function setTitular(string $titular): void {
        if (strlen($titular) < 3) {
            throw new InvalidArgumentException(
                "El nombre debe tener al menos 3 caracteres"
            );
        }
        $this->titular = $titular;
    }
    
    public function getTitular(): string {
        return $this->titular;
    }
    
    // Métodos de negocio
    public function depositar(float $monto): bool {
        if (!$this->activa) {
            throw new RuntimeException("Cuenta inactiva");
        }
        
        if ($monto <= 0) {
            throw new InvalidArgumentException("Monto inválido");
        }
        
        $this->saldo += $monto;
        return true;
    }
    
    public function retirar(float $monto): bool {
        if ($monto > $this->saldo) {
            throw new RuntimeException("Saldo insuficiente");
        }
        
        $this->saldo -= $monto;
        return true;
    }
    
    // Fluent interface (método chainable)
    public function setActiva(bool $estado): self {
        $this->activa = $estado;
        return $this;  // Retorna $this para encadenar
    }
}

// Uso
$cuenta = new Cuenta BancariaBancaria();
$cuenta->setTitular("Juan Pérez")
       ->setActiva(true)  // Chainable
       ->depositar(1000);
       
echo $cuenta->getSaldo();  // 1000
?&gt;</code></pre></div>

        <div class="info-box">
            <strong>💡 Buenas Prácticas:</strong><br>
            • Usa propiedades privadas y accede a través de getters/setters<br>
            • Valida datos en los setters<br>
            • Usa type hinting en parámetros y return types<br>
            • Los métodos públicos son tu API, manténlos estables<br>
            • Usa nombres descriptivos: <code>calcularTotal()</code> mejor que <code>calc()</code>
        </div>
    `,

    'constructores': `
        <h1>Constructores, Destructores y Autoloading</h1>
        
        <h3>Constructor</h3>
        <p>El constructor es un método especial que se ejecuta automáticamente al crear una instancia.</p>
        
        <div class="code-block"><pre><code>&lt;?php
class Usuario {
    private string $nombre;
    private string $email;
    private DateTime $fechaRegistro;
    
    // Constructor tradicional
    public function __construct(string $nombre, string $email) {
        $this->nombre = $nombre;
        $this->email = $email;
        $this->fechaRegistro = new DateTime();
        
        echo "Usuario creado: $nombre\\n";
    }
    
    public function getNombre(): string {
        return $this->nombre;
    }
}

$user = new Usuario("Juan", "juan@example.com");
// Output: Usuario creado: Juan
?&gt;</code></pre></div>

        <h3>Constructor Property Promotion (PHP 8+)</h3>
        <p>PHP 8 introdujo una sintaxis corta para definir y asignar propiedades en el constructor:</p>
        
        <div class="code-block"><pre><code>&lt;?php
// Antes de PHP 8
class UsuarioAntiguo {
    private string $nombre;
    private string $email;
    private int $edad;
    
    public function __construct(string $nombre, string $email, int $edad) {
        $this->nombre = $nombre;
        $this->email = $email;
        $this->edad = $edad;
    }
}

// PHP 8+ - Constructor Property Promotion
class UsuarioModerno {
    public function __construct(
        private string $nombre,
        private string $email,
        private int $edad = 18,      // Valor por defecto
        public bool $activo = true,  // Propiedad pública
        protected ?string $rol = null // Nullable
    ) {
        // Código adicional del constructor (opcional)
        echo "Usuario $nombre creado\\n";
    }
    
    public function getNombre(): string {
        return $this->nombre;
    }
}

$user = new UsuarioModerno("Ana", "ana@example.com", 25);
echo $user->activo;  // true
?&gt;</code></pre></div>

        <h3>Valores por Defecto y Parámetros Opcionales</h3>
        <div class="code-block"><pre><code>&lt;?php
class Configuracion {
    public function __construct(
        private string $host = 'localhost',
        private int $puerto = 3306,
        private string $charset = 'utf8mb4',
        private array $opciones = []
    ) {}
    
    public function getHost(): string {
        return $this->host;
    }
}

// Uso con valores por defecto
$config1 = new Configuracion();
echo $config1->getHost();  // "localhost"

// Sobrescribir algunos valores
$config2 = new Configuracion('192.168.1.100', 3307);

// Named arguments (PHP 8+)
$config3 = new Configuracion(
    charset: 'latin1',
    host: '10.0.0.1'
);
?&gt;</code></pre></div>

        <h3>Destructor</h3>
        <p>El destructor se ejecuta cuando el objeto es destruido o el script termina:</p>
        
        <div class="code-block"><pre><code>&lt;?php
class ConexionBD {
    private $conexion;
    private string $host;
    
    public function __construct(string $host, string $user, string $pass) {
        $this->host = $host;
        $this->conexion = mysqli_connect($host, $user, $pass);
        
        if (!$this->conexion) {
            throw new RuntimeException("Error de conexión");
        }
        
        echo "Conectado a $host\\n";
    }
    
    public function query(string $sql) {
        return mysqli_query($this->conexion, $sql);
    }
    
    // Destructor
    public function __destruct() {
        if ($this->conexion) {
            mysqli_close($this->conexion);
            echo "Desconectado de {$this->host}\\n";
        }
    }
}

// Uso
$db = new ConexionBD('localhost', 'user', 'pass');
// ... hacer queries ...

// Al finalizar el script o cuando $db sale de scope,
// se llama automáticamente al destructor
unset($db);  // Forzar destrucción inmediata
?&gt;</code></pre></div>

        <h3>Autoloading PSR-4</h3>
        <p>El autoloading carga automáticamente las clases cuando se necesitan:</p>
        
        <div class="code-block"><pre><code>&lt;?php
// Autoloader manual con spl_autoload_register
spl_autoload_register(function ($clase) {
    // Convertir namespace a ruta de archivo
    // App\\Models\\Usuario -> src/Models/Usuario.php
    
    $prefix = 'App\\\\';
    $baseDir = __DIR__ . '/src/';
    
    // Verificar si usa el prefijo
    $len = strlen($prefix);
    if (strncmp($prefix, $clase, $len) !== 0) {
        return;
    }
    
    // Obtener nombre relativo
    $claseRelativa = substr($clase, $len);
    
    // Convertir a ruta de archivo
    $archivo = $baseDir . str_replace('\\\\', '/', $claseRelativa) . '.php';
    
    // Requerir si existe
    if (file_exists($archivo)) {
        require $archivo;
    }
});

// Ahora puedes usar clases sin require
$usuario = new App\\Models\\Usuario();
$producto = new App\\Models\\Producto();
// Las clases se cargan automáticamente
?&gt;</code></pre></div>

        <h3>Composer Autoload (PSR-4)</h3>
        <div class="code-block"><pre><code>// composer.json
{
    "autoload": {
        "psr-4": {
            "App\\\\": "src/",
            "Tests\\\\": "tests/"
        },
        "files": [
            "src/helpers.php"
        ]
    }
}

// Estructura de directorios:
// proyecto/
// ├── composer.json
// ├── vendor/
// │   └── autoload.php
// └── src/
//     ├── Models/
//     │   ├── Usuario.php      (namespace App\\Models)
//     │   └── Producto.php
//     ├── Controllers/
//     │   └── UsuarioController.php
//     └── Services/
//         └── EmailService.php

// Ejecutar: composer dump-autoload

// index.php
require __DIR__ . '/vendor/autoload.php';

// Todas las clases se cargan automáticamente
use App\\Models\\Usuario;
use App\\Controllers\\UsuarioController;

$user = new Usuario("Juan", "juan@example.com");
$controller = new UsuarioController();
?&gt;</code></pre></div>

        <h3>Clone de Objetos</h3>
        <div class="code-block"><pre><code>&lt;?php
class Documento {
    public function __construct(
        public string $titulo,
        public string $contenido,
        public DateTime $fecha
    ) {}
    
    // Método mágico para clonar
    public function __clone() {
        // Clonar objetos anidados (deep copy)
        $this->fecha = clone $this->fecha;
        
        // Modificar datos del clon
        $this->titulo .= " (Copia)";
        
        echo "Documento clonado\\n";
    }
}

$original = new Documento(
    "Mi Documento",
    "Contenido...",
    new DateTime()
);

// Clonar (shallow copy por defecto)
$copia = clone $original;

$copia->titulo = "Documento Modificado";

echo $original->titulo;  // "Mi Documento"
echo $copia->titulo;     // "Documento Modificado (Copia)"
?&gt;</code></pre></div>

        <div class="warning-box">
            <strong>⚠️ Importante:</strong> El operador <code>clone</code> hace una copia superficial por defecto. Si tu clase contiene objetos anidados, implementa <code>__clone()</code> para hacer deep copy de esos objetos.
        </div>
    `
};

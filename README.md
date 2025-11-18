# Documentación PHP Avanzado

Documentación personal de PHP avanzado con diseño dark mode inspirado en Angular.dev

## 📁 Estructura del Proyecto

```
documentation/
├── index.html          # Estructura principal
├── styles.css          # Estilos dark mode
├── script.js           # Lógica de navegación
├── contenido/          # Contenido modular
│   ├── sintaxis-tipos-datos.js
│   ├── gestion-errores.js
│   ├── oop.js
│   ├── patrones-diseno.js
│   └── loader.js       # Carga todos los módulos
└── README.md           # Este archivo
```

## 🎨 Características

- ✅ **Dark Mode** - Diseño oscuro inspirado en Angular.dev
- ✅ **3 Niveles de Navegación** - Sidebar jerárquico organizado
- ✅ **Responsive** - Optimizado para móvil, tablet y desktop
- ✅ **Sin Frameworks** - Solo HTML, CSS y JavaScript vanilla
- ✅ **Navegación Suave** - Transiciones y animaciones fluidas
- ✅ **Syntax Highlighting** - Bloques de código estilizados

## 📱 Responsive Breakpoints

- **Desktop**: > 1024px (sidebar fijo)
- **Tablet**: 768px - 1024px (sidebar colapsable)
- **Mobile**: < 768px (sidebar overlay con menú hamburguesa)

## 📚 Contenido Incluido

### 🎯 Jerarquía 1: Fundamentos de PHP Avanzado

#### Sintaxis y Tipos de Datos
- Declaración de Variables y Constantes (✅ Completo con ejemplos elaborados)
- Tipos Escalares y Compuestos (✅ Completo con ejemplos elaborados)
- Coerción de Tipos y Comparaciones Estrictas
- Operadores Aritméticos, Lógicos y de Comparación
- Estructuras de Control (If/Else, Switch, Bucles)
- Funciones Anónimas, Arrow Functions y Closures
- Namespaces y Autoloading (PSR-4)

#### Gestión de Errores y Excepciones
- Manejo de Errores Tradicional (✅ Completo con ejemplos elaborados)
- Clases de Excepciones Estándar (✅ Completo con jerarquía completa)
- Creación de Excepciones Personalizadas
- Bloques try-catch-finally
- Manejo de Errores Fatales y Shutdown Functions
- Logging de Errores y Stack Traces
- Depuración con Xdebug

#### Programación Orientada a Objetos (OOP)
- Clases, Objetos, Propiedades y Métodos (✅ Completo con ejemplos elaborados)
- Constructores, Destructores y Autoloading (✅ Completo PHP 8+)
- Herencia, Abstracción e Interfaces
- Traits y Clases Anónimas
- Encapsulamiento (público, protegido, privado)
- Polimorfismo y Type Hinting
- Clases Finales y Métodos Finales

### 🏗️ Jerarquía 2: Patrones de Diseño y Principios de Ingeniería

#### Características Modernas de PHP
- Match Expression (PHP 8+) (✅ Completo con ejemplos)
- Operador Nullsafe (PHP 8+) (✅ Completo con ejemplos)
- Named Arguments (PHP 8+) (✅ Completo con ejemplos)
- Declaraciones de Tipos Escalares y de Retorno (⏳ Pendiente)
- Propiedades Promocionadas en Constructores (✅ Ver sección Constructores)
- Atributos (PHP 8+) y su uso (⏳ Pendiente)
- Enumeraciones (Enums) (PHP 8.1+) (⏳ Pendiente)

#### Principios SOLID
- Principio de Responsabilidad Única (SRP) (✅ Completo con ejemplos)
- Principio Abierto/Cerrado (OCP) (⏳ Pendiente)
- Principio de Sustitución de Liskov (LSP) (⏳ Pendiente)
- Principio de Segregación de Interfaces (ISP) (⏳ Pendiente)
- Principio de Inversión de Dependencias (DIP) (⏳ Pendiente)
- Aplicación de SOLID en PHP (⏳ Pendiente)
- Refactoring Basado en SOLID (⏳ Pendiente)

#### Patrones de Diseño Creacionales
- Patrón Singleton (⏳ Pendiente)
- Patrón Factory Method (⏳ Pendiente)
- Patrón Abstract Factory (⏳ Pendiente)
- Patrón Builder (⏳ Pendiente)
- Patrón Prototype (⏳ Pendiente)
- Inyección de Dependencias (DI) y Contenedores DI (⏳ Pendiente)
- Service Locator (⏳ Pendiente)

#### Patrones de Diseño Estructurales
- Patrón Adapter (⏳ Pendiente)
- Patrón Decorator (⏳ Pendiente)
- Patrón Facade (⏳ Pendiente)
- Patrón Bridge (⏳ Pendiente)
- Patrón Composite (⏳ Pendiente)
- Patrón Proxy (⏳ Pendiente)
- Patrón Flyweight (⏳ Pendiente)

## 🚀 Cómo Usar

1. Abre `index.html` en tu navegador
2. Navega por el sidebar para explorar los temas
3. En móvil, usa el menú hamburguesa para abrir/cerrar el sidebar
4. El contenido se carga dinámicamente sin recargar la página

## 💻 Estructura de Navegación

```javascript
// Cada sección se carga desde content.js
{
  'seccion-id': `
    <h1>Título</h1>
    <p>Contenido...</p>
    <div class="code-block">...</div>
  `
}
```

## 🎨 Personalización de Estilos

Las variables CSS están definidas en `:root` en `styles.css`:

```css
:root {
    --bg-primary: #0d1117;
    --bg-secondary: #161b22;
    --text-primary: #e6edf3;
    --accent-primary: #3b82f6;
    /* ... más variables */
}
```

## 📝 Añadir Nuevo Contenido

### Contenido Modular

El contenido está organizado en archivos modulares en la carpeta `contenido/`:

1. **Editar contenido existente**: Abre el archivo correspondiente:
   - `sintaxis-tipos-datos.js` - Variables, tipos, operadores
   - `gestion-errores.js` - Errores y excepciones
   - `oop.js` - POO y clases
   - `patrones-diseno.js` - Patrones y principios SOLID

2. **Añadir nueva sección**:
   ```javascript
   // En el archivo correspondiente (ej: patrones-diseno.js)
   const patronesDiseno = {
       'mi-nueva-seccion': `
           <h1>Mi Nueva Sección</h1>
           <p>Contenido elaborado con ejemplos...</p>
           <div class="code-block"><pre><code>
           // Código aquí
           </code></pre></div>
       `
   };
   ```

3. **Añadir el link en HTML**:
   ```html
   <li><a href="#mi-nueva-seccion" class="nav-link">Mi Nueva Sección</a></li>
   ```

### Ventajas de la Estructura Modular

- ✅ **Fácil de editar**: Cada archivo contiene un tema específico
- ✅ **Mantenible**: Cambios aislados por módulo
- ✅ **Escalable**: Añadir nuevas jerarquías sin modificar todo
- ✅ **Organizado**: Estructura clara por categorías

## 🔍 Componentes de Estilo

### Bloques de Código
```html
<div class="code-block">
    <pre><code>Tu código aquí</code></pre>
</div>
```

### Info Boxes
```html
<div class="info-box">
    <strong>💡 Título:</strong> Contenido
</div>

<div class="warning-box">
    <strong>⚠️ Advertencia:</strong> Contenido
</div>

<div class="success-box">
    <strong>✅ Éxito:</strong> Contenido
</div>
```

## 🌐 Navegador Compatible

- Chrome/Edge (recomendado)
- Firefox
- Safari
- Opera

## 📄 Licencia

Proyecto personal para aprendizaje.

---

Creado con ❤️ para aprender PHP avanzado

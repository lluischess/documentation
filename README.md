# 📚 Documentación PrestaShop 8.9+ y PHP 8.1+

Documentación completa y exhaustiva sobre desarrollo avanzado en PrestaShop 8.9+ y PHP 8.1+. Este proyecto es una aplicación web estática que funciona sin backend, cargando todo el contenido dinámicamente mediante JavaScript.

---

## 🚀 Inicio Rápido

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repo>
   cd documentation
   ```

2. **Abrir la documentación**
   - Simplemente abre `index.html` en tu navegador
   - O sirve con un servidor local:
     ```bash
     # Opción 1: Python
     python -m http.server 8000
     
     # Opción 2: Node.js http-server
     npx http-server -p 8000
     
     # Opción 3: PHP
     php -S localhost:8000
     ```

3. **Acceder**
   - Abre tu navegador en `http://localhost:8000`
   - Navega por las categorías del sidebar

---

## 📂 Estructura del Proyecto

```
documentation/
├── index.html                      # Página principal (estructura y navegación)
├── styles.css                      # Estilos globales de la documentación
├── script.js                       # Script principal de la aplicación
├── README.md                       # Este archivo
│
├── contenido/                      # Todo el contenido de la documentación
│   ├── sintaxis-tipos-datos.js    # Temas base de PHP
│   ├── gestion-errores.js
│   ├── oop.js
│   ├── patrones-diseno.js
│   ├── loader.js                   # ⚙️ Cargador dinámico de contenido
│   │
│   └── temas/                      # Temas organizados por categorías
│       ├── index.js                # 📍 ÍNDICE CENTRAL - Mapea IDs a contenidos
│       │
│       ├── arquitectura-prestashop/
│       │   ├── ciclo-vida-peticiones.js
│       │   ├── estructuraModulosTemas.js
│       │   ├── overrides.js
│       │   ├── hooks-y-eventos.js
│       │   ├── modelo-datos.js
│       │   ├── multitienda-idioma.js
│       │   └── cache-prestashop-smarty-apcu.js
│       │
│       ├── modules-prestashop/
│       │   ├── creacion-controladores.js
│       │   ├── uso-orm-prestashop.js
│       │   ├── configuracion-modulos-back-office.js
│       │   ├── gestion-activos-css-js.js
│       │   ├── internacionalizacion-traducciones-modulos.js
│       │   ├── integracion-web-services-prestashop.js
│       │   └── buenas-practicas-estandares-modulos.js
│       │
│       ├── temas-personalizados/
│       │   ├── estructura-tema-classic-starter.js
│       │   ├── sobreescritura-plantillas-smarty-twig.js
│       │   ├── integracion-modulos-tema.js
│       │   ├── personalizacion-css-sass-javascript.js
│       │   ├── optimizacion-rendimiento-tema.js
│       │   ├── responsive-design-adaptacion-movil.js
│       │   └── creacion-paginas-layouts-personalizados.js
│       │
│       └── bases-datos-sql-avanzado/
│           ├── mantenimiento-optimizacion.js
│           ├── diseno-bases-datos.js
│           └── sql-avanzado.js
```

---

## ⚙️ Cómo Funciona

### 1. **Carga Inicial (`index.html`)**

El archivo `index.html` es la estructura base que contiene:

#### 📍 Navegación Sidebar
```html
<nav class="sidebar">
  <div class="nav-section">
    <h2 class="nav-title">Desarrollo con PrestaShop</h2>
    
    <div class="nav-category">
      <button class="nav-category-title" data-category="temas-personalizados">
        <span class="chevron">›</span>
        Desarrollo de Temas Personalizados
      </button>
      
      <ul class="nav-items">
        <li>
          <a href="#estructura-tema-classic-starter" class="nav-link">
            Estructura de un Tema (Classic vs Starter)
          </a>
        </li>
        <li>
          <a href="#sobreescritura-plantillas-smarty-twig" class="nav-link">
            Sobreescritura de Plantillas Smarty/Twig
          </a>
        </li>
        <!-- Más enlaces... -->
      </ul>
    </div>
  </div>
</nav>
```

**Elementos clave:**
- **`data-category`**: Identificador de categoría para colapsar/expandir
- **`href="#ID"`**: Ancla que identifica cada tema de documentación
- **`.nav-link`**: Clase para los enlaces clicables

#### 📄 Área de Contenido
```html
<main class="main-content" id="mainContent">
  <div id="content">
    <!-- El contenido se carga dinámicamente aquí -->
  </div>
</main>
```

#### 📜 Carga de Scripts
```html
<!-- Highlight.js para syntax highlighting -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>

<!-- Temas de contenido (orden importa) -->
<script src="contenido/temas/arquitectura-prestashop/ciclo-vida-peticiones.js"></script>
<script src="contenido/temas/arquitectura-prestashop/estructuraModulosTemas.js"></script>
<!-- ... TODOS los archivos de temas ... -->

<!-- IMPORTANTE: Este debe cargarse DESPUÉS de todos los temas -->
<script src="contenido/temas/index.js"></script>

<!-- Loader y script principal -->
<script src="contenido/loader.js"></script>
<script src="script.js"></script>
```

**⚠️ Orden de carga crítico:**
1. Primero: Todos los archivos individuales de temas (definen constantes)
2. Segundo: `contenido/temas/index.js` (mapea constantes a IDs)
3. Tercero: `contenido/loader.js` (carga contenido dinámicamente)
4. Cuarto: `script.js` (inicializa la aplicación)

---

### 2. **Archivos de Contenido (`.js`)**

Cada archivo de tema es un módulo JavaScript que exporta una constante con HTML:

```javascript
// Ejemplo: contenido/temas/temas-personalizados/optimizacion-rendimiento-tema.js

// @ts-nocheck
const optimizacionRendimientoTema = `
    <div class="content-section">
        <h1 id="optimizacion-rendimiento-tema">Optimización de Rendimiento del Tema</h1>
        <p>El rendimiento del Front Office es crucial...</p>

        <h2 class="section-title">1. Métricas Clave de Rendimiento</h2>
        
        <pre><code class="language-javascript">
// Ejemplo de código
console.log('Hola mundo');
        </code></pre>
        
        <!-- Más contenido HTML... -->
    </div>
`;
```

**📋 Características:**
- **Constante con nombre descriptivo**: `optimizacionRendimientoTema`
- **Template literal** (backticks \` \`) para multi-línea
- **HTML completo** con estructura semántica
- **IDs únicos** en `<h1>` para navegación
- **Clases CSS** para estilización consistente
- **Bloques `<pre><code>`** con `class="language-XXX"` para syntax highlighting

**🎨 Clases CSS Comunes:**
- `.content-section` - Contenedor principal
- `.section-title` - Títulos de sección
- `.table`, `.table-bordered`, `.table-striped` - Tablas
- `.alert`, `.alert-info`, `.alert-warning` - Alertas
- `.card`, `.card-header`, `.card-body` - Cards
- `.badge`, `.bg-success`, `.bg-warning` - Badges

---

### 3. **Índice Central (`contenido/temas/index.js`)**

Este archivo **mapea los IDs de navegación** a las **constantes de contenido**:

```javascript
// contenido/temas/index.js

const temasPrestaShop = {
    // Arquitectura y Conceptos de PrestaShop
    'ciclo-vida-peticiones-prestashop': cicloVidaPeticiones,
    'estructura-modulos-temas': estructuraModulosTemas,
    'overrides-clases-controladores': overridesClasesControladores,
    
    // Desarrollo de Módulos Avanzados
    'creacion-controladores-front-back': creacionControladoresFrontBack,
    'uso-orm-prestashop': usoOrmPrestaShop,
    
    // Desarrollo de Temas Personalizados
    'estructura-tema-classic-starter': estructuraTemaClassicStarter,
    'sobreescritura-plantillas-smarty-twig': sobreescrituraPlantillasSmartyTwig,
    'integracion-modulos-tema': integracionModulosTema,
    'personalizacion-css-sass-javascript': personalizacionCssSassJavascript,
    'optimizacion-rendimiento-tema': optimizacionRendimientoTema,
    'responsive-design-adaptacion-movil': responsiveDesignAdaptacionMovil,
    'creacion-paginas-layouts-personalizados': creacionPaginasLayoutsPersonalizados,
    
    // Bases de Datos y SQL Avanzado
    'mantenimiento-optimizacion-prestashop': mantenimientoOptimizacionPrestaShop,
    'diseno-bases-datos-relacionales': disenoBasesDatosRelacionales,
    'sql-avanzado': sqlAvanzado
};
```

**🔑 Relación ID → Contenido:**
- `'optimizacion-rendimiento-tema'` - ID utilizado en `href="#optimizacion-rendimiento-tema"`
- `optimizacionRendimientoTema` - Constante definida en el archivo `.js`

---

### 4. **Cargador Dinámico (`contenido/loader.js`)**

Este script escucha clics en los enlaces de navegación y carga el contenido correspondiente:

```javascript
// Pseudocódigo simplificado

document.addEventListener('DOMContentLoaded', () => {
    // Escuchar clics en enlaces de navegación
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            
            // Obtener ID del tema desde href="#tema-id"
            const temaId = link.getAttribute('href').substring(1);
            
            // Buscar contenido en el índice
            const contenido = temasPrestaShop[temaId];
            
            if (contenido) {
                // Inyectar HTML en el contenedor
                document.getElementById('content').innerHTML = contenido;
                
                // Aplicar syntax highlighting a bloques de código
                document.querySelectorAll('pre code').forEach(block => {
                    hljs.highlightElement(block);
                });
                
                // Actualizar URL sin recargar
                window.history.pushState(null, '', `#${temaId}`);
                
                // Scroll to top
                window.scrollTo(0, 0);
            }
        });
    });
    
    // Cargar contenido inicial si hay hash en URL
    if (window.location.hash) {
        const initialId = window.location.hash.substring(1);
        loadContent(initialId);
    }
});
```

---

### 5. **Script Principal (`script.js`)**

Maneja la interactividad de la UI:

```javascript
// Colapsar/expandir categorías del sidebar
document.querySelectorAll('.nav-category-title').forEach(button => {
    button.addEventListener('click', () => {
        const category = button.closest('.nav-category');
        category.classList.toggle('expanded');
        
        // Rotar chevron
        const chevron = button.querySelector('.chevron');
        chevron.classList.toggle('rotated');
    });
});

// Destacar enlace activo
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        // Remover clase active de todos
        document.querySelectorAll('.nav-link').forEach(l => 
            l.classList.remove('active')
        );
        
        // Añadir clase active al clickeado
        link.classList.add('active');
    });
});
```

---

## 🎨 Sistema de Estilos

### CSS Global (`styles.css`)

```css
/* Layout principal */
.app-container {
    display: flex;
    min-height: 100vh;
}

.sidebar {
    width: 300px;
    background: #2c3e50;
    color: white;
    overflow-y: auto;
    position: fixed;
    height: 100vh;
}

.main-content {
    margin-left: 300px;
    flex: 1;
    padding: 2rem;
    background: #f5f5f5;
}

/* Navegación */
.nav-category {
    margin-bottom: 1rem;
}

.nav-category-title {
    width: 100%;
    padding: 1rem;
    background: transparent;
    border: none;
    color: white;
    text-align: left;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.nav-items {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
}

.nav-category.expanded .nav-items {
    max-height: 2000px;
}

.nav-link {
    display: block;
    padding: 0.75rem 1.5rem;
    color: #ecf0f1;
    text-decoration: none;
    transition: background 0.2s;
}

.nav-link:hover,
.nav-link.active {
    background: #34495e;
    color: #3498db;
}

/* Contenido */
.content-section {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Syntax highlighting */
pre {
    background: #282c34;
    border-radius: 8px;
    padding: 1.5rem;
    overflow-x: auto;
}

code {
    font-family: 'Fira Code', 'Consolas', monospace;
    font-size: 0.9em;
}
```

---

## ➕ Añadir Nuevo Tema de Documentación

### Paso 1: Crear el Archivo de Contenido

```javascript
// contenido/temas/CATEGORIA/mi-nuevo-tema.js

// @ts-nocheck
const miNuevoTema = `
    <div class="content-section">
        <h1 id="mi-nuevo-tema">Mi Nuevo Tema</h1>
        <p>Descripción del tema...</p>

        <h2 class="section-title">1. Primera Sección</h2>
        <p>Contenido...</p>

        <pre><code class="language-php">
<?php
// Ejemplo de código
echo "Hola mundo";
        </code></pre>
        
        <h2 class="section-title">2. Segunda Sección</h2>
        <!-- Más contenido... -->
    </div>
`;
```

**📝 Notas:**
- El ID del `<h1>` debe ser único y descriptivo: `id="mi-nuevo-tema"`
- Usa clases existentes para consistencia visual
- Añade `@ts-nocheck` para evitar warnings de TypeScript

### Paso 2: Añadir al Índice

```javascript
// contenido/temas/index.js

const temasPrestaShop = {
    // ... temas existentes ...
    
    // Nuevo tema
    'mi-nuevo-tema': miNuevoTema,
};
```

### Paso 3: Añadir Enlace en Navegación

```html
<!-- index.html -->

<div class="nav-category">
    <button class="nav-category-title" data-category="mi-categoria">
        <span class="chevron">›</span>
        Mi Categoría
    </button>
    
    <ul class="nav-items">
        <!-- Enlaces existentes... -->
        
        <li>
            <a href="#mi-nuevo-tema" class="nav-link">
                Mi Nuevo Tema
            </a>
        </li>
    </ul>
</div>
```

### Paso 4: Añadir Script en index.html

```html
<!-- index.html - antes de contenido/temas/index.js -->

<script src="contenido/temas/CATEGORIA/mi-nuevo-tema.js"></script>

<!-- Índice central (después de TODOS los temas) -->
<script src="contenido/temas/index.js"></script>
```

**⚠️ IMPORTANTE:** El orden de los scripts es crítico. Siempre añade el nuevo script **antes** de `contenido/temas/index.js`.

---

## 🔍 Syntax Highlighting

La documentación usa **Highlight.js** para colorear bloques de código.

### Lenguajes Soportados

Especifica el lenguaje con `class="language-XXX"`:

```html
<!-- PHP -->
<pre><code class="language-php">
<?php
echo "Hola";
</code></pre>

<!-- JavaScript -->
<pre><code class="language-javascript">
console.log('Hola');
</code></pre>

<!-- HTML/Smarty/Twig -->
<pre><code class="language-html">
{* Plantilla Smarty *}
<div>{$variable}</div>
</code></pre>

<!-- CSS/SCSS -->
<pre><code class="language-scss">
.clase {
  color: red;
}
</code></pre>

<!-- SQL -->
<pre><code class="language-sql">
SELECT * FROM ps_product;
</code></pre>

<!-- Bash -->
<pre><code class="language-bash">
npm install
</code></pre>

<!-- JSON -->
<pre><code class="language-json">
{
  "name": "valor"
}
</code></pre>

<!-- YAML -->
<pre><code class="language-yaml">
meta:
  name: Mi Tema
  version: 1.0.0
</code></pre>

<!-- Texto plano -->
<pre><code class="language-plaintext">
Texto sin highlighting
</code></pre>
```

**💡 Tip:** Para plantillas Smarty/Twig, usa `language-html` ya que Highlight.js no tiene soporte nativo para estos lenguajes, pero HTML funciona bien.

---

## 🛠️ Mejores Prácticas

### ✅ DO (Hacer)

1. **Usa IDs descriptivos y únicos**
   ```html
   <h1 id="optimizacion-rendimiento-tema">...</h1>
   ```

2. **Mantén consistencia en clases CSS**
   ```html
   <div class="content-section">
   <h2 class="section-title">
   <div class="alert alert-info">
   ```

3. **Escapa HTML cuando sea necesario**
   ```javascript
   const ejemplo = `<code>&lt;div&gt;HTML escapado&lt;/div&gt;</code>`;
   ```

4. **Usa tablas para datos tabulares**
   ```html
   <table class="table table-bordered">
   ```

5. **Añade ejemplos de código reales y funcionales**

6. **Documenta con comentarios dentro del código**

### ❌ DON'T (Evitar)

1. **No uses IDs duplicados**
2. **No mezcles estilos inline** (usa clases CSS)
3. **No olvides cerrar template literals** (backticks)
4. **No uses comillas simples** dentro de template literals sin escapar
5. **No cargues scripts en orden incorrecto**

---

## 📊 Categorías Actuales

### 1. **Arquitectura y Conceptos de PrestaShop** (7 temas)
- Ciclo de vida de peticiones
- Estructura de módulos y temas
- Overrides de clases y controladores
- Hooks y eventos
- Modelo de datos
- Configuración multitienda/multiidioma
- Sistema de caché

### 2. **Desarrollo de Módulos Avanzados** (7 temas)
- Creación de controladores
- Uso del ORM
- Configuración de módulos
- Gestión de activos CSS/JS
- Internacionalización
- Integración con Web Services
- Buenas prácticas

### 3. **Desarrollo de Temas Personalizados** (7 temas)
- Estructura de temas
- Sobreescritura de plantillas
- Integración de módulos
- Personalización CSS/JS
- Optimización de rendimiento
- Responsive design
- Creación de páginas personalizadas

### 4. **Bases de Datos y SQL Avanzado** (3 temas)
- Mantenimiento y optimización
- Diseño de bases de datos
- SQL avanzado

**Total: 24 temas de documentación**

---

## 🚀 Optimizaciones Futuras

### Posibles Mejoras

1. **Búsqueda en Tiempo Real**
   - Indexar todo el contenido
   - Filtrado fuzzy search
   - Resaltado de resultados

2. **Modo Oscuro**
   - Toggle dark/light theme
   - Persistir preferencia en localStorage

3. **Tabla de Contenidos por Tema**
   - TOC flotante en cada artículo
   - Sticky sidebar con scroll spy

4. **Versiones PDF/ePub**
   - Exportar documentación completa
   - Uso offline

5. **Progressive Web App (PWA)**
   - Service Worker para cache
   - Instalable en dispositivos
   - Funcionalidad offline

6. **Comentarios/Feedback**
   - Sistema de votación
   - Comentarios por sección

---

## 📄 Licencia

[Especificar licencia del proyecto]

---

## 👨‍💻 Contribuir

Para contribuir con nuevos temas o mejoras:

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nuevo-tema`
3. Añade tu contenido siguiendo la estructura
4. Commit: `git commit -m 'Add: Nuevo tema sobre X'`
5. Push: `git push origin feature/nuevo-tema`
6. Crea un Pull Request

---

## 📞 Contacto

[Tu información de contacto]

---

**Última actualización:** 2024-11-20
**Versión:** 1.0.0
**Temas totales:** 24

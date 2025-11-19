# Estructura de Temas de Documentación

Este directorio contiene todos los temas de documentación organizados por categorías en archivos separados.

## Estructura de Carpetas

```
temas/
├── index.js                              # Índice principal que exporta todos los temas
├── README.md                             # Este archivo
│
├── arquitectura-prestashop/              # Arquitectura y Conceptos de PrestaShop
│   ├── ciclo-vida-peticiones.js         # ✅ Completado
│   ├── estructura-modulos-temas.js      # Pendiente
│   ├── overrides-clases.js              # Pendiente
│   ├── hooks-eventos.js                 # Pendiente
│   ├── modelo-datos.js                  # Pendiente
│   ├── multitienda-multiidioma.js       # Pendiente
│   └── cache-prestashop.js              # Pendiente
│
├── modulos-avanzados/                    # Desarrollo de Módulos Avanzados
│   ├── controladores-front-back.js      # Pendiente
│   ├── orm-prestashop.js                # Pendiente
│   ├── configuracion-back-office.js     # Pendiente
│   ├── gestion-activos.js               # Pendiente
│   ├── internacionalizacion.js          # Pendiente
│   ├── web-services.js                  # Pendiente
│   └── buenas-practicas.js              # Pendiente
│
└── temas-personalizados/                 # Desarrollo de Temas Personalizados
    ├── estructura-tema.js               # Pendiente
    ├── plantillas-smarty-twig.js        # Pendiente
    ├── integracion-modulos.js           # Pendiente
    ├── css-sass-javascript.js           # Pendiente
    ├── optimizacion-rendimiento.js      # Pendiente
    ├── responsive-design.js             # Pendiente
    └── paginas-layouts.js               # Pendiente
```

## Formato de Archivos

Cada archivo debe seguir este formato:

```javascript
export const nombreTema = `
    <h1>Título del Tema</h1>
    
    <p>Introducción breve del tema...</p>

    <h2>Sección 1</h2>
    <p>Contenido...</p>

    <div class="code-block"><pre><code>
// Código de ejemplo
    </code></pre></div>

    <div class="info-box">
        <strong>💡 Información importante:</strong>
        <ul>
            <li>Punto 1</li>
            <li>Punto 2</li>
        </ul>
    </div>

    <div class="success-box">
        <strong>✅ Mejores prácticas:</strong>
        <ul>
            <li>Práctica 1</li>
            <li>Práctica 2</li>
        </ul>
    </div>

    <div class="warning-box">
        <strong>⚠️ Advertencias:</strong>
        <ul>
            <li>Advertencia 1</li>
            <li>Advertencia 2</li>
        </ul>
    </div>
`;
```

## Convenciones

### Boxes
- **info-box**: Información general, conceptos, definiciones (💡)
- **success-box**: Mejores prácticas, ventajas, recomendaciones (✅)
- **warning-box**: Advertencias, errores comunes, consideraciones (⚠️)

### Listas
- Siempre usar `<ul><li>` en lugar de texto plano con bullets
- Usar `<strong>` para resaltar términos importantes

### Código
- Usar bloques `<div class="code-block"><pre><code>` para código
- Incluir comentarios explicativos en el código
- Mostrar ejemplos prácticos y reales

### Estructura
- **H1**: Título principal del tema
- **H2**: Secciones principales
- **H3**: Subsecciones
- Incluir ejemplos prácticos en cada sección
- Terminar con mejores prácticas y errores comunes

## Cómo Agregar un Nuevo Tema

1. Crear el archivo en la carpeta correspondiente:
   ```bash
   # Ejemplo: crear tema de hooks
   touch temas/arquitectura-prestashop/hooks-eventos.js
   ```

2. Exportar el contenido:
   ```javascript
   export const hooksEventos = `
       <h1>Hooks y Eventos en PrestaShop</h1>
       // ... contenido ...
   `;
   ```

3. Importar en `index.js`:
   ```javascript
   import { hooksEventos } from './arquitectura-prestashop/hooks-eventos.js';
   
   export const temas = {
       'hooks-eventos-prestashop': hooksEventos,
       // ... otros temas
   };
   ```

4. El tema estará disponible automáticamente en la documentación

## Ventajas de esta Estructura

✅ **Modularidad**: Cada tema en su propio archivo
✅ **Mantenibilidad**: Fácil encontrar y editar contenido
✅ **Escalabilidad**: Agregar nuevos temas sin modificar loader.js
✅ **Colaboración**: Varios desarrolladores pueden trabajar en paralelo
✅ **Organización**: Estructura clara por categorías
✅ **Performance**: Posibilidad de lazy loading en el futuro

## Próximos Pasos

1. Completar temas de "Arquitectura y Conceptos de PrestaShop" (6 temas)
2. Completar temas de "Desarrollo de Módulos Avanzados" (7 temas)
3. Completar temas de "Desarrollo de Temas Personalizados" (7 temas)
4. Total: 20 temas pendientes + 1 completado = 21 temas

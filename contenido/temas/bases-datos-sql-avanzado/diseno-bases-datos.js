// @ts-nocheck
const disenoBasesDatosRelacionales = `
    <div class="content-section">
        <h1 id="diseno-bases-datos-relacionales">Diseño de Bases de Datos Relacionales</h1>
        <p>Un diseño de base de datos sólido es la base de cualquier aplicación escalable. En el contexto de PrestaShop y módulos personalizados, entender estos principios es fundamental.</p>

        <h2 class="section-title">1. Modelado Entidad-Relación (ERD)</h2>
        <p>El primer paso en el diseño. Identificar las entidades (ej. Producto, Cliente, Pedido) y cómo se relacionan entre sí.</p>

        <h2 class="section-title">2. Normalización de Bases de Datos</h2>
        <p>Proceso para organizar los datos y reducir la redundancia.</p>
        <ul>
            <li><strong>1NF (Primera Forma Normal):</strong> Atomicidad de datos, sin grupos repetidos.</li>
            <li><strong>2NF (Segunda Forma Normal):</strong> Todo atributo no clave depende de la clave primaria completa.</li>
            <li><strong>3NF (Tercera Forma Normal):</strong> Sin dependencias transitivas entre atributos no clave.</li>
            <li><strong>BCNF (Forma Normal de Boyce-Codd):</strong> Versión más estricta de la 3NF.</li>
        </ul>

        <h2 class="section-title">3. Tipos de Relaciones</h2>
        <ul>
            <li><strong>Uno a Uno (1:1):</strong> Ej. Usuario -> Perfil de Usuario extendido.</li>
            <li><strong>Uno a Muchos (1:N):</strong> Ej. Categoría -> Productos (si un producto solo tiene una categoría principal).</li>
            <li><strong>Muchos a Muchos (N:M):</strong> Ej. Productos <-> Etiquetas. Requiere tabla intermedia (pivote).</li>
        </ul>

        <h2 class="section-title">4. Índices y Claves</h2>
        <p>Cruciales para el rendimiento y la integridad.</p>
        <ul>
            <li><strong>Primary Key (PK):</strong> Identificador único de fila.</li>
            <li><strong>Foreign Key (FK):</strong> Enlace a otra tabla, asegura integridad referencial.</li>
            <li><strong>Unique Index:</strong> Evita duplicados (ej. email de usuario).</li>
            <li><strong>Index:</strong> Acelera búsquedas (ej. búsqueda por nombre de producto).</li>
        </ul>

        <h2 class="section-title">5. Patrones de Diseño de Esquemas</h2>
        <ul>
            <li><strong>EAV (Entity-Attribute-Value):</strong> Usado en PrestaShop para características de productos (flexibilidad vs rendimiento).</li>
            <li><strong>Adjacency List:</strong> Para estructuras jerárquicas simples (ej. Categorías con \`id_parent\`).</li>
            <li><strong>Nested Sets:</strong> Para jerarquías optimizadas para lectura (ej. Categorías en versiones antiguas de PS).</li>
        </ul>

        <h2 class="section-title">6. Integridad Referencial y Restricciones</h2>
        <p>Uso de \`ON DELETE CASCADE\`, \`ON UPDATE CASCADE\` para mantener la consistencia de los datos automáticamente.</p>

        <h2 class="section-title">7. Desnormalización Estratégica</h2>
        <p>Cuándo romper las reglas de normalización para ganar rendimiento (ej. almacenar el total de un pedido en la tabla \`orders\` en lugar de sumarlo siempre desde \`order_details\`).</p>
    </div>
`;

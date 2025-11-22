// @ts-nocheck
const paginacionFiltradoBusqueda = `
    <div class="content-section">
        <h1 id="paginacion-filtrado">Paginación, Filtrado, Ordenamiento y Búsqueda</h1>
        <p>Implementar paginación, filtrado y búsqueda eficientes es esencial para APIs escalables en PrestaShop 8.9+. Esta guía cubre patrones y mejores prácticas.</p>

        <h2 class="section-title">1. Paginación</h2>

        <h3>1.1. Paginación Offset/Limit</h3>

        <pre><code class="language-php"><?php
// GET /api/products?page=2&limit=20
class ProductApiController extends ModuleFrontController
{
    public function getProducts()
    {
        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = min(100, max(1, (int)($_GET['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;
        
        // Total de productos
        $total = Product::getNbProducts();
        
        // Obtener productos paginados
        $products = Product::getProducts(
            $this->context->language->id,
            $offset,
            $limit,
            'id_product',
            'DESC'
        );
        
        $response = [
            'data' => array_map([$this, 'formatProduct'], $products),
            'pagination' => [
                'current_page' => $page,
                'per_page' => $limit,
                'total' => $total,
                'total_pages' => ceil($total / $limit),
                'has_more' => $page < ceil($total / $limit),
            ],
            'links' => $this->generatePaginationLinks($page, $limit, $total),
        ];
        
        $this->ajaxDie(json_encode($response));
    }
    
    private function generatePaginationLinks(int $page, int $limit, int $total): array
    {
        $baseUrl = $this->context->link->getModuleLink('myapi', 'products');
        $totalPages = ceil($total / $limit);
        
        $links = [
            'self' => "$baseUrl?page=$page&limit=$limit",
            'first' => "$baseUrl?page=1&limit=$limit",
            'last' => "$baseUrl?page=$totalPages&limit=$limit",
        ];
        
        if ($page > 1) {
            $links['prev'] = "$baseUrl?page=" . ($page - 1) . "&limit=$limit";
        }
        
        if ($page < $totalPages) {
            $links['next'] = "$baseUrl?page=" . ($page + 1) . "&limit=$limit";
        }
        
        return $links;
    }
}
</code></pre>

        <h3>1.2. Cursor-based Pagination (Más Eficiente)</h3>

        <pre><code class="language-php"><?php
// GET /api/products?cursor=123&limit=20
public function getCursorProducts()
{
    $cursor = (int)($_GET['cursor'] ?? 0);
    $limit = min(100, max(1, (int)($_GET['limit'] ?? 20)));
    
    $db = Db::getInstance();
    $sql = 'SELECT * FROM ' . _DB_PREFIX_ . 'product
            WHERE id_product > ' . (int)$cursor . '
            ORDER BY id_product ASC
            LIMIT ' . (int)$limit;
    
    $products = $db->executeS($sql);
    
    $lastId = !empty($products) ? end($products)['id_product'] : null;
    
    $response = [
        'data' => array_map([$this, 'formatProduct'], $products),
        'pagination' => [
            'cursor' => $lastId,
            'limit' => $limit,
            'has_more' => count($products) === $limit,
        ],
        'links' => [
            'next' => $lastId ? "/api/products?cursor=$lastId&limit=$limit" : null,
        ],
    ];
    
    $this->ajaxDie(json_encode($response));
}
</code></pre>

        <h2 class="section-title">2. Filtrado</h2>

        <pre><code class="language-php"><?php
// GET /api/products?active=1&category=3&price_min=10&price_max=100
class ProductFilterService
{
    public function filterProducts(array $filters): array
    {
        $sql = new DbQuery();
        $sql->select('p.*');
        $sql->from('product', 'p');
        $sql->leftJoin('product_lang', 'pl', 
            'p.id_product = pl.id_product AND pl.id_lang = ' . (int)Context::getContext()->language->id
        );
        
        // Filtrar por activo
        if (isset($filters['active'])) {
            $sql->where('p.active = ' . (int)$filters['active']);
        }
        
        // Filtrar por categoría
        if (isset($filters['category'])) {
            $sql->leftJoin('category_product', 'cp', 'p.id_product = cp.id_product');
            $sql->where('cp.id_category = ' . (int)$filters['category']);
        }
        
        // Filtrar por rango de precio
        if (isset($filters['price_min'])) {
            $sql->where('p.price >= ' . (float)$filters['price_min']);
        }
        
        if (isset($filters['price_max'])) {
            $sql->where('p.price <= ' . (float)$filters['price_max']);
        }
        
        // Filtrar por stock
        if (isset($filters['in_stock']) && $filters['in_stock']) {
            $sql->where('p.quantity > 0');
        }
        
        return Db::getInstance()->executeS($sql);
    }
}

// En controlador
public function getFilteredProducts()
{
    $filters = [
        'active' => $_GET['active'] ?? null,
        'category' => $_GET['category'] ?? null,
        'price_min' => $_GET['price_min'] ?? null,
        'price_max' => $_GET['price_max'] ?? null,
        'in_stock' => isset($_GET['in_stock']),
    ];
    
    $service = new ProductFilterService();
    $products = $service->filterProducts(array_filter($filters));
    
    $this->ajaxDie(json_encode(['data' => $products]));
}
</code></pre>

        <h2 class="section-title">3. Ordenamiento</h2>

        <pre><code class="language-php"><?php
// GET /api/products?sort=price&order=asc
class ProductSortService
{
    private array $allowedSortFields = [
        'id' => 'id_product',
        'name' => 'name',
        'price' => 'price',
        'quantity' => 'quantity',
        'date' => 'date_add',
    ];
    
    public function getProducts(string $sortBy = 'id', string $order = 'desc'): array
    {
        // Validar campo de ordenamiento
        if (!isset($this->allowedSortFields[$sortBy])) {
            $sortBy = 'id';
        }
        
        $sortField = $this->allowedSortFields[$sortBy];
        
        // Validar dirección
        $order = strtoupper($order) === 'ASC' ? 'ASC' : 'DESC';
        
        $sql = new DbQuery();
        $sql->select('*');
        $sql->from('product', 'p');
        $sql->orderBy("$sortField $order");
        
        return Db::getInstance()->executeS($sql);
    }
}

// Múltiples campos de ordenamiento
// GET /api/products?sort=category,price&order=asc,desc
public function getProductsMultiSort()
{
    $sortFields = explode(',', $_GET['sort'] ?? 'id');
    $orders = explode(',', $_GET['order'] ?? 'desc');
    
    $sql = new DbQuery();
    $sql->select('*');
    $sql->from('product');
    
    foreach ($sortFields as $index => $field) {
        $order = $orders[$index] ?? 'DESC';
        $order = strtoupper($order) === 'ASC' ? 'ASC' : 'DESC';
        $sql->orderBy("$field $order");
    }
    
    $products = Db::getInstance()->executeS($sql);
    $this->ajaxDie(json_encode(['data' => $products]));
}
</code></pre>

        <h2 class="section-title">4. Búsqueda</h2>

        <pre><code class="language-php"><?php
// GET /api/products?search=laptop
class ProductSearchService
{
    public function search(string $query, int $limit = 20): array
    {
        $words = explode(' ', trim($query));
        
        $sql = new DbQuery();
        $sql->select('p.*, pl.name, pl.description_short');
        $sql->from('product', 'p');
        $sql->leftJoin('product_lang', 'pl', 
            'p.id_product = pl.id_product AND pl.id_lang = ' . (int)Context::getContext()->language->id
        );
        $sql->where('p.active = 1');
        
        // Construir condiciones de búsqueda
        $conditions = [];
        foreach ($words as $word) {
            $word = pSQL($word);
            $conditions[] = "(
                pl.name LIKE '%$word%' OR 
                pl.description_short LIKE '%$word%' OR
                p.reference LIKE '%$word%'
            )";
        }
        
        if (!empty($conditions)) {
            $sql->where(implode(' AND ', $conditions));
        }
        
        $sql->limit($limit);
        
        return Db::getInstance()->executeS($sql);
    }
}

// Búsqueda con relevancia
public function fullTextSearch(string $query): array
{
    $query = pSQL($query);
    
    $sql = 'SELECT p.*, pl.name,
            MATCH(pl.name, pl.description_short) AGAINST("' . $query . '") AS relevance
            FROM ' . _DB_PREFIX_ . 'product p
            LEFT JOIN ' . _DB_PREFIX_ . 'product_lang pl 
                ON p.id_product = pl.id_product
            WHERE MATCH(pl.name, pl.description_short) AGAINST("' . $query . '" IN BOOLEAN MODE)
            ORDER BY relevance DESC
            LIMIT 20';
    
    return Db::getInstance()->executeS($sql);
}
</code></pre>

        <h2 class="section-title">5. Combinando Todo</h2>

        <pre><code class="language-php"><?php
// GET /api/products?search=laptop&category=3&price_min=500&sort=price&order=asc&page=1&limit=20
class ProductQueryBuilder
{
    public function buildQuery(array $params): DbQuery
    {
        $sql = new DbQuery();
        $sql->select('p.*, pl.name');
        $sql->from('product', 'p');
        $sql->leftJoin('product_lang', 'pl', 
            'p.id_product = pl.id_product AND pl.id_lang = ' . (int)Context::getContext()->language->id
        );
        
        // Búsqueda
        if (!empty($params['search'])) {
            $search = pSQL($params['search']);
            $sql->where("(pl.name LIKE '%$search%' OR p.reference LIKE '%$search%')");
        }
        
        // Filtros
        if (isset($params['category'])) {
            $sql->leftJoin('category_product', 'cp', 'p.id_product = cp.id_product');
            $sql->where('cp.id_category = ' . (int)$params['category']);
        }
        
        if (isset($params['price_min'])) {
            $sql->where('p.price >= ' . (float)$params['price_min']);
        }
        
        if (isset($params['price_max'])) {
            $sql->where('p.price <= ' . (float)$params['price_max']);
        }
        
        // Ordenamiento
        $sortField = $params['sort'] ?? 'id_product';
        $order = strtoupper($params['order'] ?? 'DESC');
        $sql->orderBy("$sortField $order");
        
        // Paginación
        $page = max(1, (int)($params['page'] ?? 1));
        $limit = min(100, max(1, (int)($params['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;
        
        $sql->limit($limit, $offset);
        
        return $sql;
    }
}

// Uso en controlador
public function getProducts()
{
    $builder = new ProductQueryBuilder();
    $query = $builder->buildQuery($_GET);
    
    $products = Db::getInstance()->executeS($query);
    $total = $this->getTotalCount($_GET);
    
    $response = [
        'data' => array_map([$this, 'formatProduct'], $products),
        'filters' => [
            'search' => $_GET['search'] ?? null,
            'category' => $_GET['category'] ?? null,
            'price_range' => [
                'min' => $_GET['price_min'] ?? null,
                'max' => $_GET['price_max'] ?? null,
            ],
        ],
        'sorting' => [
            'field' => $_GET['sort'] ?? 'id',
            'order' => $_GET['order'] ?? 'desc',
        ],
        'pagination' => $this->buildPagination($_GET, $total),
    ];
    
    $this->ajaxDie(json_encode($response, JSON_PRETTY_PRINT));
}
</code></pre>

        <h2 class="section-title">6. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Recomendaciones:</strong>
            <ul class="mb-0">
                <li><strong>Paginación:</strong> Usar cursor para grandes datasets</li>
                <li><strong>Límites:</strong> Máximo 100 items por página</li>
                <li><strong>Filtros:</strong> Validar y sanitizar todos los inputs</li>
                <li><strong>Ordenamiento:</strong> Whitelist de campos permitidos</li>
                <li><strong>Búsqueda:</strong> Usar índices FULLTEXT para texto</li>
                <li><strong>Cache:</strong> Cachear resultados frecuentes</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>📊 Ejemplo de URL Completa:</strong><br>
            <code>/api/products?search=laptop&category=3&price_min=500&price_max=2000&sort=price&order=asc&page=1&limit=20</code>
        </div>
    </div>
`;

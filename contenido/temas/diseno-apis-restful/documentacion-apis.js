// @ts-nocheck
const documentacionAPIs = `
    <div class="content-section">
        <h1 id="documentacion-apis">Documentación de APIs (OpenAPI/Swagger, Postman)</h1>
        <p>Documentar correctamente una API es esencial para su adopción y uso. Esta guía cubre OpenAPI/Swagger y Postman para documentar APIs REST en PrestaShop 8.9+.</p>

        <h2 class="section-title">1. OpenAPI Specification (OAS)</h2>

        <h3>1.1. Estructura Básica</h3>

        <pre><code class="language-yaml"># openapi.yaml
openapi: 3.0.3
info:
  title: PrestaShop Products API
  version: 1.0.0
  description: API REST para gestión de productos en PrestaShop 8.9+
  contact:
    email: api@prestashop.com
  license:
    name: MIT

servers:
  - url: https://api.prestashop.com/v1
    description: Production
  - url: https://staging-api.prestashop.com/v1
    description: Staging

paths:
  /products:
    get:
      summary: Listar productos
      tags:
        - Products
      parameters:
        - in: query
          name: page
          schema:
            type: integer
            default: 1
          description: Número de página
        - in: query
          name: limit
          schema:
            type: integer
            default: 20
            maximum: 100
          description: Items por página
      responses:
        '200':
          description: Lista de productos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProductList'
        '401':
          $ref: '#/components/responses/Unauthorized'
    
    post:
      summary: Crear producto
      tags:
        - Products
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ProductInput'
      responses:
        '201':
          description: Producto creado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Product'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'

  /products/{id}:
    get:
      summary: Obtener producto por ID
      tags:
        - Products
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: integer
          description: ID del producto
      responses:
        '200':
          description: Producto encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Product'
        '404':
          $ref: '#/components/responses/NotFound'

components:
  schemas:
    Product:
      type: object
      properties:
        id:
          type: integer
          example: 123
        name:
          type: string
          example: "Product Name"
        reference:
          type: string
          example: "REF-001"
        price:
          type: number
          format: float
          example: 29.99
        quantity:
          type: integer
          example: 100
        active:
          type: boolean
          example: true
        created_at:
          type: string
          format: date-time
    
    ProductInput:
      type: object
      required:
        - name
        - price
      properties:
        name:
          type: string
          minLength: 3
          maxLength: 128
        price:
          type: number
          minimum: 0
        quantity:
          type: integer
          minimum: 0
          default: 0
        active:
          type: boolean
          default: true
    
    ProductList:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/Product'
        pagination:
          type: object
          properties:
            current_page:
              type: integer
            per_page:
              type: integer
            total:
              type: integer
            total_pages:
              type: integer
    
    Error:
      type: object
      properties:
        error:
          type: string
        message:
          type: string
        status_code:
          type: integer

  responses:
    Unauthorized:
      description: No autenticado
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    
    NotFound:
      description: Recurso no encontrado
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    
    BadRequest:
      description: Datos inválidos
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
</code></pre>

        <h2 class="section-title">2. Generar Documentación con PHP</h2>

        <pre><code class="language-php"><?php
// Usar swagger-php para anotaciones
// composer require zircote/swagger-php

/**
 * @OA\\Info(
 *     title="PrestaShop API",
 *     version="1.0.0",
 *     description="API REST para PrestaShop 8.9+"
 * )
 * @OA\\Server(
 *     url="https://api.prestashop.com/v1",
 *     description="Production server"
 * )
 * @OA\\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT"
 * )
 */

/**
 * @OA\\Get(
 *     path="/products",
 *     summary="Listar productos",
 *     tags={"Products"},
 *     @OA\\Parameter(
 *         name="page",
 *         in="query",
 *         description="Número de página",
 *         @OA\\Schema(type="integer", default=1)
 *     ),
 *     @OA\\Parameter(
 *         name="limit",
 *         in="query",
 *         description="Items por página",
 *         @OA\\Schema(type="integer", default=20, maximum=100)
 *     ),
 *     @OA\\Response(
 *         response=200,
 *         description="Lista de productos",
 *         @OA\\JsonContent(
 *             @OA\\Property(property="data", type="array", @OA\\Items(ref="#/components/schemas/Product"))
 *         )
 *     )
 * )
 */
class ProductsController extends ModuleFrontController
{
    public function getProducts()
    {
        // Implementación...
    }
}

/**
 * @OA\\Schema(
 *     schema="Product",
 *     required={"id", "name", "price"},
 *     @OA\\Property(property="id", type="integer", example=123),
 *     @OA\\Property(property="name", type="string", example="Product Name"),
 *     @OA\\Property(property="price", type="number", format="float", example=29.99),
 *     @OA\\Property(property="quantity", type="integer", example=100),
 *     @OA\\Property(property="active", type="boolean", example=true)
 * )
 */
</code></pre>

        <h3>Generar JSON OpenAPI</h3>

        <pre><code class="language-php"><?php
// tools/generate_openapi.php
require_once __DIR__ . '/../vendor/autoload.php';

$openapi = \\OpenApi\\Generator::scan([
    __DIR__ . '/../modules/myapi/controllers/',
]);

header('Content-Type: application/json');
echo $openapi->toJson();

// Guardar en archivo
file_put_contents(__DIR__ . '/../openapi.json', $openapi->toJson());
</code></pre>

        <h2 class="section-title">3. Swagger UI</h2>

        <pre><code class="language-html"><!-- public_html/api-docs/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>PrestaShop API Documentation</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
</head>
<body>
    <div id="swagger-ui"></div>
    
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
        window.onload = function() {
            SwaggerUIBundle({
                url: "/openapi.json",
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIBundle.SwaggerUIStandalonePreset
                ],
            });
        };
    </script>
</body>
</html>
</code></pre>

        <h2 class="section-title">4. Postman Collection</h2>

        <h3>4.1. Estructura JSON</h3>

        <pre><code class="language-json">{
  "info": {
    "name": "PrestaShop API",
    "description": "API REST para PrestaShop 8.9+",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{api_token}}",
        "type": "string"
      }
    ]
  },
  "item": [
    {
      "name": "Products",
      "item": [
        {
          "name": "Get Products",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{base_url}}/products?page=1&limit=20",
              "host": ["{{base_url}}"],
              "path": ["products"],
              "query": [
                {"key": "page", "value": "1"},
                {"key": "limit", "value": "20"}
              ]
            }
          },
          "response": []
        },
        {
          "name": "Create Product",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Product Name\",\n  \"price\": 29.99,\n  \"quantity\": 100\n}"
            },
            "url": {
              "raw": "{{base_url}}/products",
              "host": ["{{base_url}}"],
              "path": ["products"]
            }
          },
          "response": []
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "https://api.prestashop.com/v1",
      "type": "string"
    }
  ]
}
</code></pre>

        <h3>4.2. Generar desde OpenAPI</h3>

        <pre><code class="language-bash"># Convertir OpenAPI a Postman
npm install -g openapi-to-postmanv2

openapi2postmanv2 -s openapi.yaml -o postman_collection.json

# Con opciones
openapi2postmanv2 \
  -s openapi.yaml \
  -o prestashop_api.postman_collection.json \
  -p \
  -O folderStrategy=Tags
</code></pre>

        <h2 class="section-title">5. Documentación Interactiva</h2>

        <h3>5.1. ReDoc</h3>

        <pre><code class="language-html"><!DOCTYPE html>
<html>
<head>
    <title>PrestaShop API</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
    <style>
        body { margin: 0; padding: 0; }
    </style>
</head>
<body>
    <redoc spec-url='/openapi.json'></redoc>
    <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
</body>
</html>
</code></pre>

        <h3>5.2. Stoplight Elements</h3>

        <pre><code class="language-html"><!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>PrestaShop API</title>
    <script src="https://unpkg.com/@stoplight/elements/web-components.min.js"></script>
    <link rel="stylesheet" href="https://unpkg.com/@stoplight/elements/styles.min.css">
</head>
<body>
    <elements-api
        apiDescriptionUrl="/openapi.json"
        router="hash"
        layout="sidebar"
    />
</body>
</html>
</code></pre>

        <h2 class="section-title">6. Ejemplos de Código</h2>

        <pre><code class="language-php"><?php
// Generar ejemplos de uso en múltiples lenguajes
class ApiCodeExamples
{
    public function generateCurl(string $endpoint, string $method, array $data = null): string
    {
        $curl = "curl -X $method \\\\\n";
        $curl .= "  'https://api.prestashop.com/v1$endpoint' \\\\\n";
        $curl .= "  -H 'Authorization: Bearer YOUR_TOKEN' \\\\\n";
        $curl .= "  -H 'Content-Type: application/json'";
        
        if ($data) {
            $curl .= " \\\\\n  -d '" . json_encode($data) . "'";
        }
        
        return $curl;
    }
    
    public function generatePHP(string $endpoint, string $method, array $data = null): string
    {
        $code = "<?php\n";
        $code .= "\$ch = curl_init();\n";
        $code .= "curl_setopt(\$ch, CURLOPT_URL, 'https://api.prestashop.com/v1$endpoint');\n";
        $code .= "curl_setopt(\$ch, CURLOPT_CUSTOMREQUEST, '$method');\n";
        
        if ($data) {
            $code .= "curl_setopt(\$ch, CURLOPT_POSTFIELDS, json_encode(" . 
                     var_export($data, true) . "));\n";
        }
        
        $code .= "curl_setopt(\$ch, CURLOPT_HTTPHEADER, [\n";
        $code .= "    'Authorization: Bearer YOUR_TOKEN',\n";
        $code .= "    'Content-Type: application/json'\n";
        $code .= "]);\n";
        $code .= "\$response = curl_exec(\$ch);\n";
        $code .= "curl_close(\$ch);\n";
        
        return $code;
    }
    
    public function generateJavaScript(string $endpoint, string $method, array $data = null): string
    {
        $code = "fetch('https://api.prestashop.com/v1$endpoint', {\n";
        $code .= "  method: '$method',\n";
        $code .= "  headers: {\n";
        $code .= "    'Authorization': 'Bearer YOUR_TOKEN',\n";
        $code .= "    'Content-Type': 'application/json'\n";
        $code .= "  }";
        
        if ($data) {
            $code .= ",\n  body: JSON.stringify(" . json_encode($data, JSON_PRETTY_PRINT) . ")";
        }
        
        $code .= "\n})\n";
        $code .= ".then(response => response.json())\n";
        $code .= ".then(data => console.log(data));";
        
        return $code;
    }
}
</code></pre>

        <h2 class="section-title">7. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Documentación Efectiva:</strong>
            <ul class="mb-0">
                <li>Mantener documentación sincronizada con código</li>
                <li>Incluir ejemplos de request/response</li>
                <li>Documentar todos los códigos de error</li>
                <li>Proporcionar ejemplos de código en múltiples lenguajes</li>
                <li>Describir rate limits y autenticación</li>
                <li>Incluir guía de inicio rápido</li>
                <li>Versionado claro de la documentación</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>🛠️ Herramientas Recomendadas:</strong>
            <ul class="mb-0">
                <li><strong>Swagger UI:</strong> Documentación interactiva estándar</li>
                <li><strong>ReDoc:</strong> Documentación elegante y responsive</li>
                <li><strong>Postman:</strong> Testing y colecciones compartidas</li>
                <li><strong>swagger-php:</strong> Generar OpenAPI desde anotaciones</li>
            </ul>
        </div>
    </div>
`;

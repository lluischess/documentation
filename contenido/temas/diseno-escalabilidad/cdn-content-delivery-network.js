// @ts-nocheck
const cdnContentDeliveryNetwork = `
    <div class="content-section">
        <h1 id="cdn-content-delivery-network">CDN (Content Delivery Network) para Contenido Estático</h1>
        <p>Optimización de contenido estático con CDN para PrestaShop 8.9+ de alcance global.</p>

        <h2 class="section-title">1. ¿Qué es un CDN?</h2>

        <pre><code class="language-plaintext">SIN CDN                          CON CDN
┌─────────────┐                 ┌──────────────────┐
│Usuario Tokyo│                 │ Usuario Tokyo    │
└─────┬───────┘                 └────┬─────────────┘
      │                              │
      │ 300ms latency                │ 10ms
      │                              │
┌─────▼────────┐               ┌────▼──────────┐
│ Origin Server│               │ CDN Edge Tokyo │
│  (Madrid)    │               └────────────────┘
└──────────────┘                      ↕
   - Lento                     ┌──────────────────┐
   - Costoso bandwidth         │ Origin Server    │
   - SPOF                      │  (Madrid)        │
                               └──────────────────┘
                                  - Solo 1 request
                                  - Cached en edge
                                  
┌─────────────────────────────────────────────┐
│  CDN Global: 200+ Edge Locations           │
│  Tokyo, Londres, NY, Sydney, São Paulo...  │
└─────────────────────────────────────────────┘
</code></pre>

        <h2 class="section-title">2. CloudFlare (Fácil y Gratis)</h2>

        <h3>2.1. Setup CloudFlare</h3>

        <pre><code class="language-bash"># 1. Registrar en cloudflare.com
# 2. Añadir dominio shop.example.com
# 3. Cambiar nameservers a CloudFlare
#    NS1: ellis.ns.cloudflare.com
#    NS2: pat.ns.cloudflare.com
# 4. Esperar propagación DNS (5-15 min)

# CloudFlare automáticamente cachea:
# - Imágenes (.jpg, .png, .webp)
# - CSS, JS
# - Fuentes (.woff, .ttf)
</code></pre>

        <h3>2.2. CloudFlare Page Rules</h3>

        <pre><code class="language-plaintext"># Reglas de cache agresivo

# Rule 1: Static Assets
URL: shop.example.com/themes/*
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month
  - Browser Cache TTL: 4 hours

# Rule 2: Product Images
URL: shop.example.com/img/p/*
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month
  - Browser Cache TTL: 1 day

# Rule 3: Admin (bypass cache)
URL: shop.example.com/admin*
Settings:
  - Cache Level: Bypass
  - Security Level: High
</code></pre>

        <h3>2.3. CloudFlare Cache Purge (API)</h3>

        <pre><code class="language-php"><?php
// Purgar cache cuando se actualiza producto
class CloudFlareCache
{
    private string \$apiToken;
    private string \$zoneId;
    
    public function purgeProductImages(int \$productId): void
    {
        \$urls = [
            "https://shop.example.com/img/p/{\$productId}.jpg",
            "https://shop.example.com/img/p/{\$productId}-large.jpg",
            "https://shop.example.com/img/p/{\$productId}-medium.jpg",
        ];
        
        \$ch = curl_init("https://api.cloudflare.com/client/v4/zones/{\$this->zoneId}/purge_cache");
        curl_setopt_array(\$ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => [
                "Authorization: Bearer {\$this->apiToken}",
                "Content-Type: application/json",
            ],
            CURLOPT_POSTFIELDS => json_encode(['files' => \$urls]),
        ]);
        
        \$response = curl_exec(\$ch);
        curl_close(\$ch);
    }
}

// Hook PrestaShop
public function hookActionObjectProductUpdateAfter(\$params)
{
    \$cloudflare = new CloudFlareCache();
    \$cloudflare->purgeProductImages(\$params['object']->id);
}
</code></pre>

        <h2 class="section-title">3. AWS CloudFront</h2>

        <h3>3.1. CloudFront Distribution</h3>

        <pre><code class="language-yaml"># AWS CloudFormation
Resources:
  CloudFrontDistribution:
    Type: AWS::CloudFront::Distribution
    Properties:
      DistributionConfig:
        Enabled: true
        Origins:
          - Id: prestashop-origin
            DomainName: shop.example.com
            CustomOriginConfig:
              HTTPPort: 80
              HTTPSPort: 443
              OriginProtocolPolicy: https-only
        
        DefaultCacheBehavior:
          TargetOriginId: prestashop-origin
          ViewerProtocolPolicy: redirect-to-https
          AllowedMethods:
            - GET
            - HEAD
            - OPTIONS
          CachedMethods:
            - GET
            - HEAD
          ForwardedValues:
            QueryString: true
            Cookies:
              Forward: whitelist
              WhitelistedNames:
                - PHPSESSID
          MinTTL: 0
          DefaultTTL: 86400  # 1 día
          MaxTTL: 31536000   # 1 año
        
        # Cache específico para imágenes
        CacheBehaviors:
          - PathPattern: /img/*
            TargetOriginId: prestashop-origin
            ViewerProtocolPolicy: redirect-to-https
            AllowedMethods:
              - GET
              - HEAD
            MinTTL: 86400      # 1 día
            DefaultTTL: 2592000  # 30 días
            MaxTTL: 31536000   # 1 año
            ForwardedValues:
              QueryString: false
        
        # Certificado SSL
        ViewerCertificate:
          AcmCertificateArn: arn:aws:acm:us-east-1:123456:certificate/abc
          SslSupportMethod: sni-only
</code></pre>

        <h3>3.2. S3 + CloudFront (Mejor Performance)</h3>

        <pre><code class="language-php"><?php
// Subir imágenes a S3 en lugar de servidor local
use Aws\\S3\\S3Client;

class S3ImageUploader
{
    private S3Client \$s3;
    private string \$bucket = 'prestashop-images';
    
    public function uploadProductImage(int \$productId, string \$localPath): string
    {
        \$key = "products/{\$productId}.jpg";
        
        \$this->s3->putObject([
            'Bucket' => \$this->bucket,
            'Key' => \$key,
            'SourceFile' => \$localPath,
            'ACL' => 'public-read',
            'ContentType' => 'image/jpeg',
            'CacheControl' => 'max-age=2592000', // 30 días
        ]);
        
        // URL con CloudFront
        return "https://d1234abcd.cloudfront.net/{\$key}";
    }
}

// Hook
public function hookActionObjectProductAddAfter(\$params)
{
    \$uploader = new S3ImageUploader();
    \$localPath = _PS_IMG_DIR_ . "p/{\$params['object']->id}.jpg";
    
    if (file_exists(\$localPath)) {
        \$cdnUrl = \$uploader->uploadProductImage(\$params['object']->id, \$localPath);
        
        // Guardar URL en BD
        Db::getInstance()->update('product', [
            'image_cdn_url' => pSQL(\$cdnUrl)
        ], 'id_product = ' . (int)\$params['object']->id);
    }
}
</code></pre>

        <h2 class="section-title">4. Cache Headers</h2>

        <pre><code class="language-php"><?php
// Configurar headers de cache correctamente

// Imágenes de productos (cachear 30 días)
header('Cache-Control: public, max-age=2592000, immutable');
header('Expires: ' . gmdate('D, d M Y H:i:s', time() + 2592000) . ' GMT');

// CSS/JS versionados (cachear 1 año)
header('Cache-Control: public, max-age=31536000, immutable');
header('Expires: ' . gmdate('D, d M Y H:i:s', time() + 31536000) . ' GMT');

// HTML (no cachear)
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
</code></pre>

        <pre><code class="language-nginx"># Nginx: Cache headers por tipo de archivo
server {
    # Imágenes
    location ~* \\.(jpg|jpeg|png|gif|webp|ico)\$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # CSS/JS versionados
    location ~* \\.(css|js)\$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Fuentes
    location ~* \\.(woff|woff2|ttf|otf|eot)\$ {
        expires 1y;
        add_header Cache-Control "public";
        add_header Access-Control-Allow-Origin "*";
    }

    # HTML
    location ~* \\.html\$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
</code></pre>

        <h2 class="section-title">5. Image Optimization con CDN</h2>

        <h3>5.1. Cloudinary (CDN + Image Processing)</h3>

        <pre><code class="language-php"><?php
// composer require cloudinary/cloudinary_php

use Cloudinary\\Cloudinary;

class CloudinaryImageService
{
    private Cloudinary \$cloudinary;
    
    public function __construct()
    {
        \$this->cloudinary = new Cloudinary([
            'cloud' => [
                'cloud_name' => 'prestashop',
                'api_key' => getenv('CLOUDINARY_API_KEY'),
                'api_secret' => getenv('CLOUDINARY_API_SECRET'),
            ],
        ]);
    }
    
    public function uploadAndOptimize(string \$localPath, string \$publicId): string
    {
        \$result = \$this->cloudinary->uploadApi()->upload(\$localPath, [
            'public_id' => \$publicId,
            'folder' => 'products',
            'quality' => 'auto',    // Auto-optimization
            'fetch_format' => 'auto', // WebP automático si browser soporta
        ]);
        
        return \$result['secure_url'];
    }
    
    public function getResponsiveUrl(string \$publicId): string
    {
        // Generar URL responsive on-the-fly
        return \$this->cloudinary->image(\$publicId)
            ->resize(Resize::scale()->width(800))
            ->delivery(Delivery::format('auto'))
            ->delivery(Delivery::quality('auto'))
            ->toUrl();
    }
}

// Uso en template
<img src="<?php echo \$cloudinary->getResponsiveUrl('products/123'); ?>"
     srcset="<?php echo \$cloudinary->getResponsiveUrl('products/123'); ?> 800w,
             <?php echo \$cloudinary->getResponsiveUrl('products/123-thumb'); ?> 400w"
     sizes="(max-width: 600px) 400px, 800px"
     alt="Product" />
</code></pre>

        <h2 class="section-title">6. Monitoring CDN</h2>

        <pre><code class="language-bash"># Verificar cache hit/miss
curl -I https://shop.example.com/img/p/123.jpg

# CloudFlare
CF-Cache-Status: HIT  # Servido desde CDN
CF-Cache-Status: MISS # Servido desde origin

# AWS CloudFront
X-Cache: Hit from cloudfront
X-Cache: Miss from cloudfront

# Verificar headers
Cache-Control: public, max-age=2592000
Expires: Thu, 31 Dec 2025 23:59:59 GMT
</code></pre>

        <h2 class="section-title">7. Comparación CDN</h2>

        <table>
            <thead>
                <tr>
                    <th>CDN</th>
                    <th>Ventajas</th>
                    <th>Costo</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>CloudFlare</strong></td>
                    <td>Fácil setup, plan gratis, DDoS protection</td>
                    <td>✅ Gratis / \$20/mes Pro</td>
                </tr>
                <tr>
                    <td><strong>AWS CloudFront</strong></td>
                    <td>Integración AWS, Lambda@Edge</td>
                    <td>⚠️ Pay-as-you-go (\$0.085/GB)</td>
                </tr>
                <tr>
                    <td><strong>Cloudinary</strong></td>
                    <td>Image processing on-the-fly, WebP auto</td>
                    <td>⚠️ \$89/mes (25GB)</td>
                </tr>
                <tr>
                    <td><strong>Fastly</strong></td>
                    <td>Real-time purge, VCL config</td>
                    <td>❌ \$0.12/GB (caro)</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">8. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Best Practices:</strong>
            <ul class="mb-0">
                <li><strong>CDN para todo estático:</strong> Imágenes, CSS, JS, fuentes</li>
                <li><strong>Cache headers correctos:</strong> max-age, immutable</li>
                <li><strong>Versioning:</strong> styles.v123.css para evitar cache stale</li>
                <li><strong>WebP + fallback:</strong> Menor tamaño, mejor performance</li>
                <li><strong>Lazy loading:</strong> Cargar imágenes bajo demanda</li>
                <li><strong>Responsive images:</strong> srcset, sizes</li>
                <li><strong>HTTP/2:</strong> Multiplexing, server push</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>🎯 Impacto CDN:</strong>
            <ul class="mb-0">
                <li><strong>Latencia:</strong> -70% (300ms → 50ms)</li>
                <li><strong>Bandwidth:</strong> -80% (ahorro costos)</li>
                <li><strong>TTFB:</strong> -60% (Time To First Byte)</li>
                <li><strong>SEO:</strong> Google PageSpeed +30 puntos</li>
            </ul>
        </div>
    </div>
`;

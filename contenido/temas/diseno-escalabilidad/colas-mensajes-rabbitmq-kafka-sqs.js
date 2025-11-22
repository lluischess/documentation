// @ts-nocheck
const colasMensajesRabbitMQKafkaSQS = `
    <div class="content-section">
        <h1 id="colas-mensajes-rabbitmq-kafka-sqs">Colas de Mensajes (RabbitMQ, Kafka, SQS) para Procesamiento Asíncrono</h1>
        <p>Arquitectura de colas de mensajes para PrestaShop 8.9+ con procesamiento asíncrono y desacoplamiento.</p>

        <h2 class="section-title">1. ¿Por qué Colas de Mensajes?</h2>

        <pre><code class="language-plaintext">SIN COLAS                         CON COLAS
┌──────────┐                      ┌──────────┐
│  Request │                      │  Request │
└────┬─────┘                      └────┬─────┘
     │                                 │
┌────▼────────────┐               ┌────▼─────────┐
│  Web Server     │               │  Web Server  │
│  1. Validar     │               │  1. Validar  │
│  2. Guardar DB  │               │  2. Guardar  │
│  3. Enviar email│  ← LENTO      │  3. Publicar │
│  4. Webhook     │     (5s)      │     evento   │
│  5. Analytics   │               └────┬─────────┘
└────┬────────────┘                    │ RÁPIDO (50ms)
     │                                 │
┌────▼────────────┐               ┌────▼─────────┐
│  Response       │               │  Response    │
│  (después 5s)   │               │  (inmediato) │
└─────────────────┘               └──────────────┘
                                       │
                                  ┌────▼──────────┐
                                  │  Queue        │
                                  └────┬──────────┘
                                       │
                                  ┌────▼──────────┐
                                  │  Workers      │
                                  │  Async tasks  │
                                  └───────────────┘
</code></pre>

        <h2 class="section-title">2. RabbitMQ</h2>

        <h3>2.1. RabbitMQ Setup</h3>

        <pre><code class="language-bash"># Instalar RabbitMQ
sudo apt install rabbitmq-server

# Activar management plugin
sudo rabbitmq-plugins enable rabbitmq_management

# Crear usuario
sudo rabbitmqctl add_user prestashop strong_password
sudo rabbitmqctl set_permissions -p / prestashop ".*" ".*" ".*"
sudo rabbitmqctl set_user_tags prestashop administrator

# Web UI: http://localhost:15672
</code></pre>

        <h3>2.2. PrestaShop: RabbitMQ Publisher</h3>

        <pre><code class="language-php"><?php
// composer require php-amqplib/php-amqplib

use PhpAmqpLib\\Connection\\AMQPStreamConnection;
use PhpAmqpLib\\Message\\AMQPMessage;

class RabbitMQPublisher
{
    private AMQPStreamConnection $connection;
    private $channel;
    
    public function __construct()
    {
        $this->connection = new AMQPStreamConnection(
            'rabbitmq.internal',
            5672,
            'prestashop',
            getenv('RABBITMQ_PASSWORD')
        );
        $this->channel = $this->connection->channel();
        
        // Declarar exchange
        $this->channel->exchange_declare(
            'prestashop.events',
            'topic',
            false,
            true,
            false
        );
    }
    
    public function publishOrderCreated(int $orderId): void
    {
        $payload = json_encode([
            'order_id' => $orderId,
            'timestamp' => time(),
        ]);
        
        $message = new AMQPMessage($payload, [
            'delivery_mode' => AMQPMessage::DELIVERY_MODE_PERSISTENT,
            'content_type' => 'application/json',
        ]);
        
        $this->channel->basic_publish(
            $message,
            'prestashop.events',
            'order.created'  // Routing key
        );
    }
    
    public function __destruct()
    {
        $this->channel->close();
        $this->connection->close();
    }
}

// Uso en OrderController
class OrderController extends FrontController
{
    public function processCheckout()
    {
        // 1. Crear orden (síncrono)
        $order = new Order();
        $order->create();
        
        // 2. Publicar evento (asíncrono)
        $publisher = new RabbitMQPublisher();
        $publisher->publishOrderCreated($order->id);
        
        // 3. Response inmediato
        return $this->redirect('order-confirmation');
    }
}
</code></pre>

        <h3>2.3. RabbitMQ Consumer (Worker)</h3>

        <pre><code class="language-php"><?php
// bin/rabbitmq-consumer.php
class RabbitMQConsumer
{
    public function consume(string $queueName): void
    {
        $connection = new AMQPStreamConnection('rabbitmq.internal', 5672, 'prestashop', getenv('RABBITMQ_PASSWORD'));
        $channel = $connection->channel();
        
        // Declarar queue
        $channel->queue_declare($queueName, false, true, false, false);
        
        // Bind a exchange
        $channel->queue_bind($queueName, 'prestashop.events', 'order.*');
        
        // Callback
        $callback = function ($msg) {
            try {
                $data = json_decode($msg->body, true);
                
                switch ($msg->delivery_info['routing_key']) {
                    case 'order.created':
                        $this->handleOrderCreated($data);
                        break;
                }
                
                // Acknowledge (task completada)
                $msg->ack();
            } catch (\\Exception $e) {
                // Reject y requeue
                PrestaShopLogger::addLog('Worker error: ' . $e->getMessage());
                $msg->nack(true); // Requeue
            }
        };
        
        $channel->basic_qos(null, 1, null); // Prefetch 1 mensaje
        $channel->basic_consume($queueName, '', false, false, false, false, $callback);
        
        while ($channel->is_consuming()) {
            $channel->wait();
        }
    }
    
    private function handleOrderCreated(array $data): void
    {
        $orderId = $data['order_id'];
        
        // Task 1: Enviar email
        $order = new Order($orderId);
        $customer = new Customer($order->id_customer);
        Mail::Send(
            $customer->id_lang,
            'order_conf',
            'Order Confirmation',
            [],
            $customer->email
        );
        
        // Task 2: Actualizar analytics
        $analytics = new GoogleAnalytics();
        $analytics->trackPurchase($order);
        
        // Task 3: Webhook externo
        $webhook = new WebhookClient();
        $webhook->notify('https://external-system.com/webhook', [
            'event' => 'order_created',
            'order_id' => $orderId,
        ]);
    }
}

// Ejecutar worker
// php bin/rabbitmq-consumer.php
</code></pre>

        <h3>2.4. Supervisor para Workers</h3>

        <pre><code class="language-ini"># /etc/supervisor/conf.d/prestashop-worker.conf
[program:prestashop-order-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/prestashop/bin/rabbitmq-consumer.php
autostart=true
autorestart=true
user=www-data
numprocs=3
redirect_stderr=true
stdout_logfile=/var/log/prestashop/worker.log

# Reiniciar supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start prestashop-order-worker:*
</code></pre>

        <h2 class="section-title">3. Apache Kafka</h2>

        <p>Para eventos de alto volumen (> 100k/s) y streaming.</p>

        <pre><code class="language-php"><?php
// composer require rdkafka/rdkafka

class KafkaProducer
{
    private \\RdKafka\\Producer $producer;
    
    public function __construct()
    {
        $conf = new \\RdKafka\\Conf();
        $conf->set('bootstrap.servers', 'kafka.internal:9092');
        $conf->set('compression.type', 'snappy');
        
        $this->producer = new \\RdKafka\\Producer($conf);
    }
    
    public function publishEvent(string $topic, array $data): void
    {
        $kafkaTopic = $this->producer->newTopic($topic);
        
        $kafkaTopic->produce(
            RD_KAFKA_PARTITION_UA,
            0,
            json_encode($data)
        );
        
        $this->producer->flush(10000);
    }
}

// Uso
$kafka = new KafkaProducer();
$kafka->publishEvent('order-events', [
    'type' => 'order_created',
    'order_id' => $orderId,
    'timestamp' => microtime(true),
]);

// Consumer
class KafkaConsumer
{
    public function consume(string $topic): void
    {
        $conf = new \\RdKafka\\Conf();
        $conf->set('group.id', 'prestashop-workers');
        $conf->set('bootstrap.servers', 'kafka.internal:9092');
        
        $consumer = new \\RdKafka\\KafkaConsumer($conf);
        $consumer->subscribe([$topic]);
        
        while (true) {
            $message = $consumer->consume(120000);
            
            if ($message->err === RD_KAFKA_RESP_ERR_NO_ERROR) {
                $data = json_decode($message->payload, true);
                $this->processMessage($data);
            }
        }
    }
}
</code></pre>

        <h2 class="section-title">4. AWS SQS (Managed Queue)</h2>

        <pre><code class="language-php"><?php
// composer require aws/aws-sdk-php

use Aws\\Sqs\\SqsClient;

class SQSQueue
{
    private SqsClient $client;
    private string $queueUrl;
    
    public function __construct()
    {
        $this->client = new SqsClient([
            'region' => 'eu-west-1',
            'version' => 'latest',
        ]);
        
        $this->queueUrl = 'https://sqs.eu-west-1.amazonaws.com/123456/prestashop-orders';
    }
    
    public function sendMessage(array $data): void
    {
        $this->client->sendMessage([
            'QueueUrl' => $this->queueUrl,
            'MessageBody' => json_encode($data),
            'DelaySeconds' => 0,
        ]);
    }
    
    public function receiveMessages(int $maxMessages = 10): array
    {
        $result = $this->client->receiveMessage([
            'QueueUrl' => $this->queueUrl,
            'MaxNumberOfMessages' => $maxMessages,
            'WaitTimeSeconds' => 20,  // Long polling
        ]);
        
        return $result->get('Messages') ?? [];
    }
    
    public function deleteMessage(string $receiptHandle): void
    {
        $this->client->deleteMessage([
            'QueueUrl' => $this->queueUrl,
            'ReceiptHandle' => $receiptHandle,
        ]);
    }
}
</code></pre>

        <h2 class="section-title">5. Comparación</h2>

        <table>
            <thead>
                <tr>
                    <th>Feature</th>
                    <th>RabbitMQ</th>
                    <th>Kafka</th>
                    <th>AWS SQS</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Throughput</strong></td>
                    <td>⚠️ 10k msg/s</td>
                    <td>✅ 1M+ msg/s</td>
                    <td>⚠️ Según AWS</td>
                </tr>
                <tr>
                    <td><strong>Latency</strong></td>
                    <td>✅ < 1ms</td>
                    <td>⚠️ 5-10ms</td>
                    <td>⚠️ 100-500ms</td>
                </tr>
                <tr>
                    <td><strong>Orden garantizado</strong></td>
                    <td>✅ Sí (por queue)</td>
                    <td>✅ Sí (por partition)</td>
                    <td>⚠️ FIFO queue</td>
                </tr>
                <tr>
                    <td><strong>Persistencia</strong></td>
                    <td>✅ Disco</td>
                    <td>✅ Disco (replicas)</td>
                    <td>✅ Managed</td>
                </tr>
                <tr>
                    <td><strong>Complejidad</strong></td>
                    <td>⚠️ Media</td>
                    <td>❌ Alta</td>
                    <td>✅ Baja (managed)</td>
                </tr>
                <tr>
                    <td><strong>Costo</strong></td>
                    <td>✅ Gratis (self-hosted)</td>
                    <td>✅ Gratis (self-hosted)</td>
                    <td>⚠️ Pay per request</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">6. Casos de Uso</h2>

        <div class="alert alert-info">
            <strong>🎯 Cuándo usar cada uno:</strong>
            <ul class="mb-0">
                <li><strong>RabbitMQ:</strong> Tareas async generales (emails, webhooks, reportes)</li>
                <li><strong>Kafka:</strong> Event streaming, analytics real-time, logs</li>
                <li><strong>SQS:</strong> AWS ecosystem, no quieres gestionar infraestructura</li>
            </ul>
        </div>

        <h2 class="section-title">7. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Best Practices:</strong>
            <ul class="mb-0">
                <li><strong>Idempotencia:</strong> Tareas idempotentes (reintentos seguros)</li>
                <li><strong>Dead Letter Queue:</strong> Para mensajes fallidos</li>
                <li><strong>Monitoring:</strong> Queue depth, consumer lag</li>
                <li><strong>Retry policy:</strong> Exponential backoff</li>
                <li><strong>Message TTL:</strong> Expiración de mensajes viejos</li>
                <li><strong>Prefetch limit:</strong> No más de 1-10 por worker</li>
            </ul>
        </div>
    </div>
`;

// @ts-nocheck
const introduccionOrquestadoresPrestashop = `
    <div class="content-section">
        <h1 id="introduccion-orquestadores-prestashop">Introducción a Orquestadores (Docker Swarm, Kubernetes)</h1>
        <p>Comparativa y casos de uso de Docker Swarm y Kubernetes para orquestar PrestaShop 8.9+ en producción a escala.</p>

        <h2 class="section-title">1. ¿Por qué un Orquestador?</h2>

        <div class="alert alert-info">
            <strong>🎯 Problemas que Resuelven:</strong>
            <ul class="mb-0">
                <li>Alta disponibilidad (múltiples réplicas)</li>
                <li>Escalado automático según carga</li>
                <li>Service discovery automático</li>
                <li>Load balancing integrado</li>
                <li>Rolling updates sin downtime</li>
                <li>Auto-recuperación de contenedores</li>
                <li>Gestión centralizada del cluster</li>
            </ul>
        </div>

        <h2 class="section-title">2. Docker Swarm vs Kubernetes</h2>

        <table>
            <thead>
                <tr>
                    <th>Característica</th>
                    <th>Docker Swarm</th>
                    <th>Kubernetes</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Complejidad</strong></td>
                    <td>Baja ⭐</td>
                    <td>Alta ⭐⭐⭐</td>
                </tr>
                <tr>
                    <td><strong>Setup</strong></td>
                    <td>1 comando</td>
                    <td>Herramientas adicionales</td>
                </tr>
                <tr>
                    <td><strong>Curva aprendizaje</strong></td>
                    <td>Corta (días)</td>
                    <td>Larga (semanas/meses)</td>
                </tr>
                <tr>
                    <td><strong>Ecosistema</strong></td>
                    <td>Limitado</td>
                    <td>Muy amplio</td>
                </tr>
                <tr>
                    <td><strong>Escalabilidad</strong></td>
                    <td>Hasta ~100 nodos</td>
                    <td>Miles de nodos</td>
                </tr>
                <tr>
                    <td><strong>Auto-scaling</strong></td>
                    <td>Manual</td>
                    <td>Automático (HPA)</td>
                </tr>
                <tr>
                    <td><strong>Multi-cloud</strong></td>
                    <td>Limitado</td>
                    <td>Excelente</td>
                </tr>
                <tr>
                    <td><strong>Comunidad</strong></td>
                    <td>Pequeña</td>
                    <td>Masiva</td>
                </tr>
                <tr>
                    <td><strong>Managed services</strong></td>
                    <td>Pocos</td>
                    <td>Muchos (GKE, EKS, AKS)</td>
                </tr>
                <tr>
                    <td><strong>Uso ideal</strong></td>
                    <td>SMBs, equipos pequeños</td>
                    <td>Enterprise, escala masiva</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">3. Docker Swarm para PrestaShop</h2>

        <h3>3.1. Inicializar Swarm</h3>

        <pre><code class="language-bash"># En nodo manager
docker swarm init --advertise-addr 192.168.1.10

# Output:
# docker swarm join --token SWMTKN-1-xxx 192.168.1.10:2377

# En worker nodes
docker swarm join --token SWMTKN-1-xxx 192.168.1.10:2377

# Ver cluster
docker node ls
</code></pre>

        <h3>3.2. Stack PrestaShop en Swarm</h3>

        <pre><code class="language-yaml"># docker-stack.yml
version: '3.8'

services:
  # Nginx (2 réplicas)
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    deploy:
      replicas: 2
      update_config:
        parallelism: 1
        delay: 10s
      placement:
        constraints:
          - node.role == manager
    networks:
      - frontend
  
  # PrestaShop (5 réplicas)
  prestashop:
    image: prestashop:8.9
    environment:
      - DB_SERVER=mysql
      - REDIS_HOST=redis
    secrets:
      - db_password
    volumes:
      - prestashop-uploads:/var/www/html/upload
    deploy:
      replicas: 5
      update_config:
        parallelism: 2
        delay: 10s
        order: start-first
      rollback_config:
        parallelism: 2
      restart_policy:
        condition: on-failure
        max_attempts: 3
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.25'
          memory: 256M
      placement:
        constraints:
          - node.role == worker
    networks:
      - frontend
      - backend
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 3s
      retries: 3
  
  # MySQL (1 réplica, nodo específico)
  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD_FILE=/run/secrets/mysql_root
      - MYSQL_DATABASE=prestashop
    secrets:
      - mysql_root
      - db_password
    volumes:
      - mysql-data:/var/lib/mysql
    deploy:
      replicas: 1
      placement:
        constraints:
          - node.labels.type == database
    networks:
      - backend
  
  # Redis (3 réplicas para HA)
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
    networks:
      - backend

networks:
  frontend:
    driver: overlay
  backend:
    driver: overlay
    internal: true

volumes:
  prestashop-uploads:
    driver: local
    driver_opts:
      type: nfs
      o: addr=nfs-server,rw
      device: ":/exports/prestashop/uploads"
  mysql-data:
  redis-data:

secrets:
  db_password:
    external: true
  mysql_root:
    external: true
</code></pre>

        <h3>3.3. Comandos Swarm</h3>

        <pre><code class="language-bash"># Deploy stack
docker stack deploy -c docker-stack.yml prestashop

# Listar stacks
docker stack ls

# Servicios del stack
docker stack services prestashop

# Ver contenedores
docker stack ps prestashop

# Escalar servicio
docker service scale prestashop_prestashop=10

# Update rolling
docker service update --image prestashop:8.9.1 prestashop_prestashop

# Logs
docker service logs prestashop_prestashop -f

# Remover stack
docker stack rm prestashop
</code></pre>

        <h2 class="section-title">4. Kubernetes para PrestaShop</h2>

        <h3>4.1. Setup Kubernetes (Minikube local)</h3>

        <pre><code class="language-bash"># Instalar minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Instalar kubectl
curl -LO "https://dl.k8s.io/release/\$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install kubectl /usr/local/bin/kubectl

# Iniciar cluster
minikube start --cpus=4 --memory=8192

# Verificar
kubectl cluster-info
kubectl get nodes
</code></pre>

        <h3>4.2. Manifests PrestaShop</h3>

        <pre><code class="language-yaml"># prestashop-namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: prestashop

---
# prestashop-configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prestashop-config
  namespace: prestashop
data:
  DB_SERVER: mysql
  DB_NAME: prestashop
  REDIS_HOST: redis

---
# prestashop-secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: prestashop-secrets
  namespace: prestashop
type: Opaque
data:
  db-password: bXlTZWN1cmVQYXNzd29yZA==  # base64
  mysql-root-password: cm9vdFBhc3N3b3Jk  # base64

---
# mysql-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mysql
  namespace: prestashop
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mysql
  template:
    metadata:
      labels:
        app: mysql
    spec:
      containers:
      - name: mysql
        image: mysql:8.0
        env:
        - name: MYSQL_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: prestashop-secrets
              key: mysql-root-password
        - name: MYSQL_DATABASE
          value: prestashop
        ports:
        - containerPort: 3306
        volumeMounts:
        - name: mysql-storage
          mountPath: /var/lib/mysql
        resources:
          limits:
            memory: "2Gi"
            cpu: "1000m"
          requests:
            memory: "512Mi"
            cpu: "250m"
      volumes:
      - name: mysql-storage
        persistentVolumeClaim:
          claimName: mysql-pvc

---
# mysql-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: mysql
  namespace: prestashop
spec:
  selector:
    app: mysql
  ports:
  - port: 3306
  clusterIP: None  # Headless service

---
# redis-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: prestashop
spec:
  replicas: 3
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379
        resources:
          limits:
            memory: "512Mi"
            cpu: "500m"

---
# redis-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: redis
  namespace: prestashop
spec:
  selector:
    app: redis
  ports:
  - port: 6379

---
# prestashop-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prestashop
  namespace: prestashop
spec:
  replicas: 5
  selector:
    matchLabels:
      app: prestashop
  template:
    metadata:
      labels:
        app: prestashop
    spec:
      containers:
      - name: prestashop
        image: prestashop:8.9
        envFrom:
        - configMapRef:
            name: prestashop-config
        env:
        - name: DB_PASSWD
          valueFrom:
            secretKeyRef:
              name: prestashop-secrets
              key: db-password
        ports:
        - containerPort: 80
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 60
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 10
          periodSeconds: 5
        resources:
          limits:
            memory: "1Gi"
            cpu: "1000m"
          requests:
            memory: "512Mi"
            cpu: "500m"
        volumeMounts:
        - name: uploads
          mountPath: /var/www/html/upload
      volumes:
      - name: uploads
        persistentVolumeClaim:
          claimName: prestashop-uploads-pvc

---
# prestashop-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: prestashop
  namespace: prestashop
spec:
  type: LoadBalancer
  selector:
    app: prestashop
  ports:
  - port: 80
    targetPort: 80

---
# prestashop-hpa.yaml (Auto-scaling)
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: prestashop-hpa
  namespace: prestashop
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: prestashop
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
</code></pre>

        <h3>4.3. Comandos Kubernetes</h3>

        <pre><code class="language-bash"># Aplicar manifests
kubectl apply -f prestashop-namespace.yaml
kubectl apply -f prestashop-configmap.yaml
kubectl apply -f prestashop-secrets.yaml
kubectl apply -f mysql-deployment.yaml
kubectl apply -f prestashop-deployment.yaml
kubectl apply -f prestashop-hpa.yaml

# O todo de una vez
kubectl apply -f k8s/

# Ver recursos
kubectl get all -n prestashop
kubectl get pods -n prestashop
kubectl get services -n prestashop

# Logs
kubectl logs -f deployment/prestashop -n prestashop

# Escalar manual
kubectl scale deployment prestashop --replicas=10 -n prestashop

# Ver HPA
kubectl get hpa -n prestashop

# Port forward (testing)
kubectl port-forward svc/prestashop 8080:80 -n prestashop

# Ejecutar comando
kubectl exec -it deployment/prestashop -n prestashop -- bash

# Actualizar imagen
kubectl set image deployment/prestashop prestashop=prestashop:8.9.1 -n prestashop

# Rollback
kubectl rollout undo deployment/prestashop -n prestashop

# Estado del rollout
kubectl rollout status deployment/prestashop -n prestashop
</code></pre>

        <h2 class="section-title">5. Cuándo Usar Cada Uno</h2>

        <h3>5.1. Usar Docker Swarm si:</h3>

        <div class="alert alert-success">
            <ul class="mb-0">
                <li>Equipo pequeño (< 5 personas)</li>
                <li>Cluster pequeño (< 20 nodos)</li>
                <li>Ya usas Docker Compose</li>
                <li>Necesitas setup rápido</li>
                <li>Presupuesto limitado</li>
                <li>Experiencia limitada con orquestadores</li>
                <li>Tienda mediana (< 100k visitors/mes)</li>
            </ul>
        </div>

        <h3>5.2. Usar Kubernetes si:</h3>

        <div class="alert alert-info">
            <ul class="mb-0">
                <li>Enterprise o escala masiva</li>
                <li>Múltiples equipos trabajando</li>
                <li>Multi-cloud o hybrid cloud</li>
                <li>Necesitas auto-scaling avanzado</li>
                <li>Ecosistema de herramientas complejo</li>
                <li>Cumplimiento y auditoría estrictos</li>
                <li>Tienda grande (> 500k visitors/mes)</li>
            </ul>
        </div>

        <h2 class="section-title">6. Alternativas y Herramientas</h2>

        <h3>6.1. K3s (Kubernetes Ligero)</h3>

        <pre><code class="language-bash"># Instalar K3s (más simple que K8s)
curl -sfL https://get.k3s.io | sh -

# Usar kubectl
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
kubectl get nodes

# Deploy igual que K8s
kubectl apply -f k8s/
</code></pre>

        <h3>6.2. Nomad (HashiCorp)</h3>

        <pre><code class="language-hcl"># prestashop.nomad
job "prestashop" {
  datacenters = ["dc1"]
  
  group "web" {
    count = 5
    
    task "prestashop" {
      driver = "docker"
      
      config {
        image = "prestashop:8.9"
      }
      
      resources {
        cpu    = 500
        memory = 1024
      }
    }
  }
}
</code></pre>

        <h3>6.3. Amazon ECS</h3>

        <pre><code class="language-json">{
  "family": "prestashop",
  "containerDefinitions": [{
    "name": "prestashop",
    "image": "prestashop:8.9",
    "memory": 1024,
    "cpu": 512,
    "essential": true
  }]
}
</code></pre>

        <h2 class="section-title">7. Migración: Compose → Swarm → K8s</h2>

        <table>
            <thead>
                <tr>
                    <th>Etapa</th>
                    <th>Herramienta</th>
                    <th>Escala</th>
                    <th>Complejidad</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>1. Desarrollo</td>
                    <td>Docker Compose</td>
                    <td>1 nodo</td>
                    <td>⭐</td>
                </tr>
                <tr>
                    <td>2. Staging</td>
                    <td>Docker Swarm</td>
                    <td>3-10 nodos</td>
                    <td>⭐⭐</td>
                </tr>
                <tr>
                    <td>3. Producción Pequeña</td>
                    <td>Docker Swarm</td>
                    <td>10-50 nodos</td>
                    <td>⭐⭐</td>
                </tr>
                <tr>
                    <td>4. Producción Grande</td>
                    <td>Kubernetes</td>
                    <td>50+ nodos</td>
                    <td>⭐⭐⭐</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">8. Herramientas de Gestión</h2>

        <h3>8.1. Portainer (Swarm y K8s)</h3>

        <pre><code class="language-bash"># Portainer para Swarm
docker volume create portainer_data
docker service create \\
  --name portainer \\
  --publish 9443:9443 \\
  --mount type=bind,src=/var/run/docker.sock,dst=/var/run/docker.sock \\
  --mount type=volume,src=portainer_data,dst=/data \\
  portainer/portainer-ce:latest

# Acceder: https://localhost:9443
</code></pre>

        <h3>8.2. Rancher (Multi-cluster K8s)</h3>

        <pre><code class="language-bash"># Instalar Rancher
docker run -d --restart=unless-stopped \\
  -p 80:80 -p 443:443 \\
  --privileged \\
  rancher/rancher:latest
</code></pre>

        <h3>8.3. Lens (K8s IDE)</h3>

        <pre><code class="language-bash"># Instalar Lens Desktop
# https://k8slens.dev/

# Conectar a cluster
lens --kubeconfig ~/.kube/config
</code></pre>

        <h2 class="section-title">9. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Orquestación:</strong>
            <ul class="mb-0">
                <li>Empezar simple (Compose → Swarm → K8s)</li>
                <li>Health checks en todos los servicios</li>
                <li>Resource limits definidos</li>
                <li>Múltiples réplicas para HA</li>
                <li>Rolling updates configurados</li>
                <li>Monitoreo y logging centralizados</li>
                <li>Backup de etcd/swarm raft</li>
                <li>Secrets management apropiado</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Consideraciones:</strong>
            <ul class="mb-0">
                <li>No sobre-ingeniería: usa lo que necesitas</li>
                <li>Costo de operación y mantenimiento</li>
                <li>Curva de aprendizaje del equipo</li>
                <li>Vendor lock-in en managed services</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>📊 Recomendación PrestaShop:</strong>
            <ul class="mb-0">
                <li><strong>Tienda Pequeña (< 10k/mes):</strong> Docker Compose en 1 servidor</li>
                <li><strong>Tienda Mediana (10-100k/mes):</strong> Docker Swarm 3-5 nodos</li>
                <li><strong>Tienda Grande (> 100k/mes):</strong> Kubernetes managed (GKE, EKS, AKS)</li>
            </ul>
        </div>
    </div>
`;

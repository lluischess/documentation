// @ts-nocheck
const introduccionKubernetes = `
    <div class="content-section">
        <h1 id="introduccion-kubernetes">Introducción a Kubernetes</h1>
        <p>Fundamentos de Kubernetes (K8s) para orquestación de contenedores a escala con PrestaShop 8.9+.</p>

        <h2 class="section-title">1. ¿Qué es Kubernetes?</h2>

        <div class="alert alert-info">
            <strong>☸️ Kubernetes:</strong>
            <ul class="mb-0">
                <li>Orquestador de contenedores de código abierto</li>
                <li>Automatiza despliegue, escalado y gestión</li>
                <li>Self-healing y auto-scaling</li>
                <li>Service discovery y load balancing</li>
                <li>Rolling updates y rollbacks</li>
                <li>Storage orchestration</li>
            </ul>
        </div>

        <h2 class="section-title">2. Arquitectura</h2>

        <pre><code class="language-text"># Control Plane (Master)
├── API Server       # Punto de entrada
├── etcd            # Base de datos clave-valor
├── Scheduler       # Asigna pods a nodes
├── Controller Mgr  # Mantiene estado deseado
└── Cloud Controller # Integración con cloud

# Worker Nodes
├── Kubelet         # Agente en cada node
├── Kube-proxy      # Networking
└── Container Runtime # Docker, containerd, CRI-O
</code></pre>

        <h2 class="section-title">3. Conceptos Básicos</h2>

        <h3>3.1. Pod</h3>

        <pre><code class="language-yaml"># pod.yaml - Unidad mínima
apiVersion: v1
kind: Pod
metadata:
  name: prestashop-pod
  labels:
    app: prestashop
spec:
  containers:
  - name: prestashop
    image: prestashop:8.9
    ports:
    - containerPort: 80
    env:
    - name: DB_SERVER
      value: mysql
    resources:
      limits:
        memory: "1Gi"
        cpu: "1000m"
      requests:
        memory: "512Mi"
        cpu: "500m"
</code></pre>

        <h3>3.2. Deployment</h3>

        <pre><code class="language-yaml"># deployment.yaml - Gestiona ReplicaSets
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prestashop
spec:
  replicas: 3
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
        ports:
        - containerPort: 80
        env:
        - name: DB_SERVER
          value: mysql
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
</code></pre>

        <h3>3.3. Service</h3>

        <pre><code class="language-yaml"># service.yaml - Networking y discovery
apiVersion: v1
kind: Service
metadata:
  name: prestashop-service
spec:
  type: LoadBalancer
  selector:
    app: prestashop
  ports:
  - port: 80
    targetPort: 80
    protocol: TCP
</code></pre>

        <h2 class="section-title">4. Instalación (Minikube)</h2>

        <pre><code class="language-bash"># Instalar minikube (local)
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Instalar kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install kubectl /usr/local/bin/kubectl

# Iniciar cluster
minikube start --driver=docker

# Verificar
kubectl cluster-info
kubectl get nodes
</code></pre>

        <h2 class="section-title">5. Comandos Básicos</h2>

        <pre><code class="language-bash"># Apply manifests
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

# Listar recursos
kubectl get pods
kubectl get deployments
kubectl get services
kubectl get all

# Detalles
kubectl describe pod prestashop-xxx
kubectl describe deployment prestashop

# Logs
kubectl logs prestashop-xxx
kubectl logs -f prestashop-xxx --tail=100

# Ejecutar comando
kubectl exec -it prestashop-xxx -- bash
kubectl exec prestashop-xxx -- ls /var/www/html

# Port forward
kubectl port-forward pod/prestashop-xxx 8080:80
kubectl port-forward service/prestashop-service 8080:80

# Escalar
kubectl scale deployment prestashop --replicas=5

# Rolling update
kubectl set image deployment/prestashop prestashop=prestashop:8.9.1

# Rollback
kubectl rollout undo deployment/prestashop
kubectl rollout history deployment/prestashop

# Eliminar
kubectl delete pod prestashop-xxx
kubectl delete deployment prestashop
kubectl delete -f deployment.yaml
</code></pre>

        <h2 class="section-title">6. ConfigMap y Secrets</h2>

        <h3>6.1. ConfigMap</h3>

        <pre><code class="language-yaml"># configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prestashop-config
data:
  DB_SERVER: mysql
  DB_NAME: prestashop
  DEBUG: "false"
  php.ini: |
    memory_limit = 512M
    max_execution_time = 60
</code></pre>

        <pre><code class="language-yaml"># Usar en deployment
spec:
  containers:
  - name: prestashop
    envFrom:
    - configMapRef:
        name: prestashop-config
    volumeMounts:
    - name: php-config
      mountPath: /usr/local/etc/php/php.ini
      subPath: php.ini
  volumes:
  - name: php-config
    configMap:
      name: prestashop-config
</code></pre>

        <h3>6.2. Secrets</h3>

        <pre><code class="language-bash"># Crear secret
kubectl create secret generic db-password \\
  --from-literal=password=mySecurePassword

# Desde archivo
kubectl create secret generic api-key \\
  --from-file=./api-key.txt

# Ver (no muestra valor)
kubectl get secrets
kubectl describe secret db-password
</code></pre>

        <pre><code class="language-yaml"># secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-password
type: Opaque
data:
  password: bXlTZWN1cmVQYXNzd29yZA==  # base64
</code></pre>

        <pre><code class="language-yaml"># Usar secret
spec:
  containers:
  - name: prestashop
    env:
    - name: DB_PASSWORD
      valueFrom:
        secretKeyRef:
          name: db-password
          key: password
</code></pre>

        <h2 class="section-title">7. Persistent Volumes</h2>

        <pre><code class="language-yaml"># pvc.yaml - Persistent Volume Claim
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mysql-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
  storageClassName: standard
</code></pre>

        <pre><code class="language-yaml"># Usar en deployment
spec:
  containers:
  - name: mysql
    volumeMounts:
    - name: mysql-storage
      mountPath: /var/lib/mysql
  volumes:
  - name: mysql-storage
    persistentVolumeClaim:
      claimName: mysql-pvc
</code></pre>

        <h2 class="section-title">8. Stack Completo PrestaShop</h2>

        <pre><code class="language-yaml"># prestashop-k8s.yaml
---
# MySQL Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mysql
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
              name: mysql-secret
              key: root-password
        - name: MYSQL_DATABASE
          value: prestashop
        ports:
        - containerPort: 3306
        volumeMounts:
        - name: mysql-storage
          mountPath: /var/lib/mysql
      volumes:
      - name: mysql-storage
        persistentVolumeClaim:
          claimName: mysql-pvc

---
# MySQL Service
apiVersion: v1
kind: Service
metadata:
  name: mysql
spec:
  selector:
    app: mysql
  ports:
  - port: 3306

---
# Redis Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
spec:
  replicas: 1
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

---
# Redis Service
apiVersion: v1
kind: Service
metadata:
  name: redis
spec:
  selector:
    app: redis
  ports:
  - port: 6379

---
# PrestaShop Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prestashop
spec:
  replicas: 3
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
        env:
        - name: DB_SERVER
          value: mysql
        - name: DB_NAME
          value: prestashop
        - name: DB_PASSWD
          valueFrom:
            secretKeyRef:
              name: mysql-secret
              key: password
        - name: REDIS_HOST
          value: redis
        ports:
        - containerPort: 80
        resources:
          limits:
            memory: "1Gi"
            cpu: "1000m"
          requests:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 60
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 10
          periodSeconds: 5

---
# PrestaShop Service (LoadBalancer)
apiVersion: v1
kind: Service
metadata:
  name: prestashop-service
spec:
  type: LoadBalancer
  selector:
    app: prestashop
  ports:
  - port: 80
    targetPort: 80
</code></pre>

        <pre><code class="language-bash"># Deploy todo
kubectl apply -f prestashop-k8s.yaml

# Ver estado
kubectl get all

# Obtener URL (minikube)
minikube service prestashop-service --url
</code></pre>

        <h2 class="section-title">9. Ingress</h2>

        <pre><code class="language-yaml"># ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: prestashop-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: shop.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: prestashop-service
            port:
              number: 80
  tls:
  - hosts:
    - shop.example.com
    secretName: tls-secret
</code></pre>

        <h2 class="section-title">10. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Kubernetes:</strong>
            <ul class="mb-0">
                <li>Liveness y readiness probes</li>
                <li>Resource limits y requests</li>
                <li>Secrets para datos sensibles</li>
                <li>PersistentVolumes para datos</li>
                <li>Namespaces para aislamiento</li>
                <li>Labels para organización</li>
                <li>Ingress para routing HTTP/S</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>📚 Recursos:</strong>
            <ul class="mb-0">
                <li><strong>Local:</strong> Minikube, Kind, K3s</li>
                <li><strong>Cloud:</strong> GKE, EKS, AKS</li>
                <li><strong>Managed:</strong> DigitalOcean K8s, Linode LKE</li>
                <li><strong>Herramientas:</strong> Helm, Kustomize, ArgoCD</li>
            </ul>
        </div>
    </div>
`;

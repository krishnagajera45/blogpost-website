# 🚀 WordEcho Deployment Guide

> *From local development to production-ready deployments - deploy WordEcho like a pro*

<div align="center">

[![Docker](https://img.shields.io/badge/Docker-20.10+-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-1.21+-326CE5?style=flat-square&logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![AWS](https://img.shields.io/badge/AWS-Cloud-FF9900?style=flat-square&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)
[![Nginx](https://img.shields.io/badge/Nginx-1.20+-009639?style=flat-square&logo=nginx&logoColor=white)](https://nginx.org/)

**🌟 Scale from prototype to production with confidence**

</div>

## 🎯 Table of Contents

- [🏗️ Deployment Overview](#️-deployment-overview)
- [🐳 Docker Deployment](#-docker-deployment)
- [☸️ Kubernetes Deployment](#️-kubernetes-deployment)
- [☁️ Cloud Platform Deployments](#️-cloud-platform-deployments)
- [🔒 SSL & Security Setup](#-ssl--security-setup)
- [🌐 Domain & DNS Configuration](#-domain--dns-configuration)
- [📊 Monitoring & Logging](#-monitoring--logging)
- [🔄 CI/CD Pipeline](#-cicd-pipeline)
- [📈 Performance Optimization](#-performance-optimization)
- [🔧 Backup & Disaster Recovery](#-backup--disaster-recovery)
- [🚨 Troubleshooting](#-troubleshooting)

---

## 🏗️ Deployment Overview

### 🎯 Deployment Options

| Option | Complexity | Cost | Scalability | Maintenance |
|--------|------------|------|-------------|-------------|
| **VPS/Droplet** | Low | $ | Limited | Manual |
| **Docker Compose** | Medium | $$ | Medium | Semi-Auto |
| **Kubernetes** | High | $$$ | High | Automated |
| **Serverless** | Medium | Variable | Auto | Minimal |

### 🏛️ Production Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │───▶│   Frontend      │    │   Monitoring    │
│   (Nginx/ALB)   │    │   (React/CDN)   │    │   (Grafana)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Backend API   │───▶│   Database      │    │   Logs          │
│   (FastAPI)     │    │   (PostgreSQL)  │    │   (ELK Stack)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 🔧 Infrastructure Requirements

#### Minimum Requirements
- **CPU**: 2 vCPUs
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **Bandwidth**: 1TB/month

#### Recommended Production
- **CPU**: 4+ vCPUs
- **RAM**: 8GB+
- **Storage**: 100GB+ SSD
- **Bandwidth**: Unlimited

---

## 🐳 Docker Deployment

### 📦 Production Docker Setup

#### Backend Dockerfile
```dockerfile
# wordecho-backend/Dockerfile.prod
FROM python:3.9-slim as builder

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Production stage
FROM python:3.9-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Create non-root user
RUN addgroup --system appgroup && \
    adduser --system --group appuser

# Copy Python dependencies from builder
COPY --from=builder /usr/local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages
COPY --from=builder /usr/local/bin/uvicorn /usr/local/bin/uvicorn

# Copy application code
COPY . .

# Change ownership to non-root user
RUN chown -R appuser:appgroup /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

#### Frontend Dockerfile
```dockerfile
# wordecho-frontend/Dockerfile.prod
FROM node:16-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=builder /app/build /usr/share/nginx/html

# Add non-root user
RUN addgroup -g 1001 -S nginx && \
    adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Nginx Configuration
```nginx
# wordecho-frontend/nginx.conf
user nginx;
worker_processes auto;

error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    # Performance settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/json
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # API proxy
        location /api/ {
            proxy_pass http://backend:8000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Static assets caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### 🚀 Docker Compose Production Setup

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  backend:
    build:
      context: ./wordecho-backend
      dockerfile: Dockerfile.prod
    container_name: wordecho-backend
    restart: unless-stopped
    env_file:
      - .env.prod
    environment:
      - DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    networks:
      - wordecho-network
    volumes:
      - ./logs:/app/logs
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./wordecho-frontend
      dockerfile: Dockerfile.prod
    container_name: wordecho-frontend
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    networks:
      - wordecho-network
    volumes:
      - ./ssl:/etc/nginx/ssl:ro
      - ./nginx/logs:/var/log/nginx

  db:
    image: postgres:13-alpine
    container_name: wordecho-db
    restart: unless-stopped
    env_file:
      - .env.prod
    environment:
      - POSTGRES_DB=${DB_NAME}
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    networks:
      - wordecho-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:6-alpine
    container_name: wordecho-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - wordecho-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx-proxy:
    image: nginx:alpine
    container_name: wordecho-proxy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend
    networks:
      - wordecho-network

volumes:
  postgres_data:
  redis_data:

networks:
  wordecho-network:
    driver: bridge
```

### 🔐 Environment Configuration

```bash
# .env.prod
# Database
DB_NAME=wordecho_prod
DB_USER=wordecho_user
DB_PASSWORD=super_secure_password_123
DB_HOST=db
DB_PORT=5432

# Redis
REDIS_PASSWORD=redis_secure_password_456

# FastAPI
SECRET_KEY=your-super-secret-jwt-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=https://yourdomain.com/auth/github/callback

# Application
ENVIRONMENT=production
DEBUG=false
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Email (optional)
SMTP_HOST=smtp.yourmailserver.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASSWORD=email_password

# Monitoring
SENTRY_DSN=your_sentry_dsn_here
```

### 🚀 Deployment Script

```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Starting WordEcho deployment..."

# Load environment variables
source .env.prod

# Backup database
echo "📦 Creating database backup..."
docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U $DB_USER $DB_NAME > "backups/backup_$(date +%Y%m%d_%H%M%S).sql"

# Pull latest images
echo "📥 Pulling latest images..."
docker-compose -f docker-compose.prod.yml pull

# Build and deploy
echo "🔨 Building and deploying services..."
docker-compose -f docker-compose.prod.yml up -d --build

# Run database migrations
echo "🗄️ Running database migrations..."
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head

# Health check
echo "🏥 Performing health checks..."
sleep 30

if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Deployment successful!"
    echo "🌐 Application is running at: https://yourdomain.com"
else
    echo "❌ Health check failed!"
    docker-compose -f docker-compose.prod.yml logs
    exit 1
fi

# Cleanup old images
echo "🧹 Cleaning up old images..."
docker image prune -f

echo "🎉 Deployment completed successfully!"
```

---

## ☸️ Kubernetes Deployment

### 🏗️ Kubernetes Manifests

#### Namespace
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: wordecho
  labels:
    name: wordecho
```

#### ConfigMap
```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: wordecho-config
  namespace: wordecho
data:
  DATABASE_HOST: "postgres-service"
  DATABASE_PORT: "5432"
  DATABASE_NAME: "wordecho"
  REDIS_HOST: "redis-service"
  REDIS_PORT: "6379"
  ENVIRONMENT: "production"
  DEBUG: "false"
```

#### Secrets
```yaml
# k8s/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: wordecho-secrets
  namespace: wordecho
type: Opaque
data:
  database-password: <base64-encoded-password>
  redis-password: <base64-encoded-password>
  jwt-secret: <base64-encoded-jwt-secret>
  github-client-secret: <base64-encoded-github-secret>
```

#### PostgreSQL Deployment
```yaml
# k8s/postgres.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: wordecho
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:13-alpine
        env:
        - name: POSTGRES_DB
          valueFrom:
            configMapKeyRef:
              name: wordecho-config
              key: DATABASE_NAME
        - name: POSTGRES_USER
          value: "wordecho"
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: wordecho-secrets
              key: database-password
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: postgres-service
  namespace: wordecho
spec:
  selector:
    app: postgres
  ports:
  - protocol: TCP
    port: 5432
    targetPort: 5432
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: wordecho
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 20Gi
```

#### Backend Deployment
```yaml
# k8s/backend.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: wordecho-backend
  namespace: wordecho
spec:
  replicas: 3
  selector:
    matchLabels:
      app: wordecho-backend
  template:
    metadata:
      labels:
        app: wordecho-backend
    spec:
      containers:
      - name: backend
        image: wordecho/backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          value: "postgresql://wordecho:$(DATABASE_PASSWORD)@$(DATABASE_HOST):$(DATABASE_PORT)/$(DATABASE_NAME)"
        - name: DATABASE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: wordecho-secrets
              key: database-password
        envFrom:
        - configMapRef:
            name: wordecho-config
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 10
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: wordecho-backend-service
  namespace: wordecho
spec:
  selector:
    app: wordecho-backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8000
  type: ClusterIP
```

#### Frontend Deployment
```yaml
# k8s/frontend.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: wordecho-frontend
  namespace: wordecho
spec:
  replicas: 2
  selector:
    matchLabels:
      app: wordecho-frontend
  template:
    metadata:
      labels:
        app: wordecho-frontend
    spec:
      containers:
      - name: frontend
        image: wordecho/frontend:latest
        ports:
        - containerPort: 80
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 10
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
---
apiVersion: v1
kind: Service
metadata:
  name: wordecho-frontend-service
  namespace: wordecho
spec:
  selector:
    app: wordecho-frontend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: ClusterIP
```

#### Ingress
```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: wordecho-ingress
  namespace: wordecho
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - yourdomain.com
    - www.yourdomain.com
    secretName: wordecho-tls
  rules:
  - host: yourdomain.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: wordecho-backend-service
            port:
              number: 80
      - path: /
        pathType: Prefix
        backend:
          service:
            name: wordecho-frontend-service
            port:
              number: 80
  - host: www.yourdomain.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: wordecho-backend-service
            port:
              number: 80
      - path: /
        pathType: Prefix
        backend:
          service:
            name: wordecho-frontend-service
            port:
              number: 80
```

#### Horizontal Pod Autoscaler
```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: wordecho-backend-hpa
  namespace: wordecho
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: wordecho-backend
  minReplicas: 3
  maxReplicas: 10
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
```

### 🚀 Kubernetes Deployment Script

```bash
#!/bin/bash
# deploy-k8s.sh

set -e

echo "🚀 Deploying WordEcho to Kubernetes..."

# Create namespace
kubectl apply -f k8s/namespace.yaml

# Apply ConfigMaps and Secrets
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml

# Deploy database
kubectl apply -f k8s/postgres.yaml

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres -n wordecho --timeout=300s

# Deploy backend
kubectl apply -f k8s/backend.yaml

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
kubectl wait --for=condition=ready pod -l app=wordecho-backend -n wordecho --timeout=300s

# Deploy frontend
kubectl apply -f k8s/frontend.yaml

# Deploy ingress
kubectl apply -f k8s/ingress.yaml

# Deploy HPA
kubectl apply -f k8s/hpa.yaml

# Check deployment status
echo "📊 Checking deployment status..."
kubectl get pods -n wordecho
kubectl get services -n wordecho
kubectl get ingress -n wordecho

echo "✅ Deployment completed!"
echo "🌐 Application will be available at: https://yourdomain.com"
```

---

## ☁️ Cloud Platform Deployments

### 🔵 AWS Deployment

#### ECS with Fargate
```json
{
  "family": "wordecho-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::account:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "wordecho-backend",
      "image": "your-ecr-repo/wordecho-backend:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "DATABASE_URL",
          "value": "postgresql://user:pass@rds-endpoint:5432/wordecho"
        }
      ],
      "secrets": [
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:ssm:region:account:parameter/wordecho/jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/wordecho-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:8000/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3
      }
    }
  ]
}
```

#### CloudFormation Template
```yaml
# aws-infrastructure.yml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'WordEcho Infrastructure'

Parameters:
  Environment:
    Type: String
    Default: production
    Description: Environment name
  
  DomainName:
    Type: String
    Description: Domain name for the application

Resources:
  # VPC
  VPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      EnableDnsHostnames: true
      EnableDnsSupport: true
      Tags:
        - Key: Name
          Value: !Sub ${Environment}-wordecho-vpc

  # Subnets
  PublicSubnet1:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      AvailabilityZone: !Select [0, !GetAZs '']
      CidrBlock: 10.0.1.0/24
      MapPublicIpOnLaunch: true

  PublicSubnet2:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      AvailabilityZone: !Select [1, !GetAZs '']
      CidrBlock: 10.0.2.0/24
      MapPublicIpOnLaunch: true

  # RDS Instance
  DatabaseSubnetGroup:
    Type: AWS::RDS::DBSubnetGroup
    Properties:
      DBSubnetGroupDescription: Subnet group for RDS
      SubnetIds:
        - !Ref PublicSubnet1
        - !Ref PublicSubnet2

  Database:
    Type: AWS::RDS::DBInstance
    Properties:
      DBInstanceClass: db.t3.micro
      Engine: postgres
      EngineVersion: '13.7'
      AllocatedStorage: 20
      StorageType: gp2
      DBName: wordecho
      MasterUsername: wordecho
      MasterUserPassword: !Ref DatabasePassword
      DBSubnetGroupName: !Ref DatabaseSubnetGroup
      VPCSecurityGroups:
        - !Ref DatabaseSecurityGroup

  # ALB
  ApplicationLoadBalancer:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties:
      Type: application
      Scheme: internet-facing
      Subnets:
        - !Ref PublicSubnet1
        - !Ref PublicSubnet2
      SecurityGroups:
        - !Ref ALBSecurityGroup

  # ECS Cluster
  ECSCluster:
    Type: AWS::ECS::Cluster
    Properties:
      ClusterName: !Sub ${Environment}-wordecho-cluster

Outputs:
  LoadBalancerDNS:
    Description: DNS name of the load balancer
    Value: !GetAtt ApplicationLoadBalancer.DNSName
    Export:
      Name: !Sub ${Environment}-wordecho-alb-dns
```

### 🟢 DigitalOcean App Platform

```yaml
# .do/app.yaml
name: wordecho
services:
- name: backend
  source_dir: wordecho-backend
  github:
    repo: your-username/wordecho
    branch: main
  run_command: uvicorn app.main:app --host 0.0.0.0 --port 8080
  environment_slug: python
  instance_count: 2
  instance_size_slug: basic-xxs
  http_port: 8080
  health_check:
    http_path: /health
  envs:
  - key: DATABASE_URL
    scope: RUN_AND_BUILD_TIME
    value: ${db.DATABASE_URL}
  - key: JWT_SECRET
    scope: RUN_TIME
    type: SECRET
    value: your-jwt-secret

- name: frontend
  source_dir: wordecho-frontend
  github:
    repo: your-username/wordecho
    branch: main
  build_command: npm run build
  run_command: npx serve -s build -l 8080
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  http_port: 8080
  routes:
  - path: /
  envs:
  - key: REACT_APP_API_URL
    scope: BUILD_TIME
    value: ${backend.PUBLIC_URL}

databases:
- name: db
  engine: PG
  version: "13"
  size: basic-xxs
  num_nodes: 1

domain:
  name: yourdomain.com
  type: PRIMARY
```

### 🟡 Google Cloud Platform

```yaml
# gcp-app.yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: wordecho-backend
  annotations:
    run.googleapis.com/ingress: all
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/maxScale: "10"
        run.googleapis.com/cpu-throttling: "false"
        run.googleapis.com/memory: "512Mi"
    spec:
      containers:
      - image: gcr.io/PROJECT_ID/wordecho-backend
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: wordecho-secrets
              key: database-url
        resources:
          limits:
            cpu: 1000m
            memory: 512Mi
```

---

## 🔒 SSL & Security Setup

### 🔐 Let's Encrypt with Certbot

```bash
#!/bin/bash
# setup-ssl.sh

# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Setup auto-renewal
sudo crontab -e
# Add this line:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

### 🛡️ Security Headers Configuration

```nginx
# security-headers.conf
# Security Headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

# Hide Nginx version
server_tokens off;

# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

# Apply rate limiting
location /api/ {
    limit_req zone=api burst=20 nodelay;
}

location /api/auth/ {
    limit_req zone=login burst=5 nodelay;
}
```

### 🔑 Secrets Management

#### Using Docker Secrets
```yaml
# docker-compose.prod.yml (secrets section)
secrets:
  db_password:
    file: ./secrets/db_password.txt
  jwt_secret:
    file: ./secrets/jwt_secret.txt
  github_client_secret:
    file: ./secrets/github_client_secret.txt

services:
  backend:
    secrets:
      - db_password
      - jwt_secret
      - github_client_secret
    environment:
      - DATABASE_PASSWORD_FILE=/run/secrets/db_password
      - JWT_SECRET_FILE=/run/secrets/jwt_secret
```

#### Using HashiCorp Vault
```python
# app/vault_client.py
import hvac

class VaultClient:
    def __init__(self, url, token):
        self.client = hvac.Client(url=url, token=token)
    
    def get_secret(self, path):
        try:
            response = self.client.secrets.kv.v2.read_secret_version(path=path)
            return response['data']['data']
        except Exception as e:
            print(f"Error reading secret: {e}")
            return None

# Usage
vault = VaultClient("https://vault.yourdomain.com", "vault-token")
db_password = vault.get_secret("wordecho/database")["password"]
```

---

## 🌐 Domain & DNS Configuration

### 📋 DNS Records Setup

```dns
; DNS Records for yourdomain.com
@ 300 IN A 192.168.1.100
www 300 IN CNAME yourdomain.com
api 300 IN CNAME yourdomain.com

; CDN (optional)
cdn 300 IN CNAME d123456.cloudfront.net

; Email
@ 300 IN MX 10 mail.yourdomain.com
mail 300 IN A 192.168.1.101

; Security
@ 300 IN TXT "v=spf1 include:_spf.google.com ~all"
_dmarc 300 IN TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com"
```

### 🚀 CDN Setup (CloudFlare)

```javascript
// cloudflare-config.js
const cloudflare = require('cloudflare')({
  token: 'your-api-token'
});

const zoneId = 'your-zone-id';

// Configure caching rules
const cachingRules = [
  {
    targets: [{ target: 'url', constraint: { operator: 'matches', value: '*.js' } }],
    actions: [{ id: 'cache_level', value: 'cache_everything' }],
    priority: 1,
    status: 'active'
  },
  {
    targets: [{ target: 'url', constraint: { operator: 'matches', value: '*.css' } }],
    actions: [{ id: 'cache_level', value: 'cache_everything' }],
    priority: 2,
    status: 'active'
  }
];

// Apply security settings
const securitySettings = {
  security_level: 'medium',
  ssl: 'strict',
  always_use_https: 'on',
  min_tls_version: '1.2',
  tls_1_3: 'on'
};
```

---

## 📊 Monitoring & Logging

### 📈 Prometheus & Grafana Setup

```yaml
# monitoring/docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    restart: unless-stopped
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin123
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning

  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    restart: unless-stopped
    ports:
      - "9100:9100"

volumes:
  prometheus_data:
  grafana_data:
```

#### Prometheus Configuration
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

scrape_configs:
  - job_name: 'wordecho-backend'
    static_configs:
      - targets: ['backend:8000']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx-exporter:9113']

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

### 📊 Application Metrics

```python
# app/metrics.py
from prometheus_client import Counter, Histogram, Gauge, generate_latest
from fastapi import Request
import time

# Metrics
REQUEST_COUNT = Counter(
    'http_requests_total', 
    'Total HTTP requests', 
    ['method', 'endpoint', 'status_code']
)

REQUEST_DURATION = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration',
    ['method', 'endpoint']
)

ACTIVE_CONNECTIONS = Gauge(
    'active_connections',
    'Active database connections'
)

def track_metrics(request: Request, response_time: float, status_code: int):
    REQUEST_COUNT.labels(
        method=request.method,
        endpoint=request.url.path,
        status_code=status_code
    ).inc()
    
    REQUEST_DURATION.labels(
        method=request.method,
        endpoint=request.url.path
    ).observe(response_time)

@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type="text/plain")
```

### 📋 ELK Stack Logging

```yaml
# logging/docker-compose.logging.yml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.15.0
    container_name: elasticsearch
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - es_data:/usr/share/elasticsearch/data

  logstash:
    image: docker.elastic.co/logstash/logstash:7.15.0
    container_name: logstash
    ports:
      - "5044:5044"
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:7.15.0
    container_name: kibana
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch

volumes:
  es_data:
```

---

## 🔄 CI/CD Pipeline

### 🔄 GitHub Actions Workflow

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: 3.9
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: 16
    
    - name: Cache Python dependencies
      uses: actions/cache@v3
      with:
        path: ~/.cache/pip
        key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}
    
    - name: Cache Node dependencies
      uses: actions/cache@v3
      with:
        path: ~/.npm
        key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    
    - name: Install Python dependencies
      run: |
        cd wordecho-backend
        python -m pip install --upgrade pip
        pip install -r requirements.txt
    
    - name: Install Node dependencies
      run: |
        cd wordecho-frontend
        npm ci
    
    - name: Run Python tests
      run: |
        cd wordecho-backend
        pytest --cov=app --cov-report=xml
    
    - name: Run Node tests
      run: |
        cd wordecho-frontend
        npm test -- --coverage --watchAll=false
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3

  security-scan:
    runs-on: ubuntu-latest
    needs: test
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Run Bandit security scan
      run: |
        pip install bandit
        bandit -r wordecho-backend/app -f json -o bandit-report.json
    
    - name: Run npm audit
      run: |
        cd wordecho-frontend
        npm audit --audit-level high

  build-and-push:
    runs-on: ubuntu-latest
    needs: [test, security-scan]
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Log in to Container Registry
      uses: docker/login-action@v2
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Extract metadata
      id: meta-backend
      uses: docker/metadata-action@v4
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-backend
        tags: |
          type=ref,event=branch
          type=sha,prefix={{branch}}-
    
    - name: Build and push backend image
      uses: docker/build-push-action@v4
      with:
        context: ./wordecho-backend
        file: ./wordecho-backend/Dockerfile.prod
        push: true
        tags: ${{ steps.meta-backend.outputs.tags }}
        labels: ${{ steps.meta-backend.outputs.labels }}
    
    - name: Extract metadata
      id: meta-frontend
      uses: docker/metadata-action@v4
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-frontend
    
    - name: Build and push frontend image
      uses: docker/build-push-action@v4
      with:
        context: ./wordecho-frontend
        file: ./wordecho-frontend/Dockerfile.prod
        push: true
        tags: ${{ steps.meta-frontend.outputs.tags }}
        labels: ${{ steps.meta-frontend.outputs.labels }}

  deploy:
    runs-on: ubuntu-latest
    needs: build-and-push
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to production
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.PRODUCTION_HOST }}
        username: ${{ secrets.PRODUCTION_USER }}
        key: ${{ secrets.PRODUCTION_SSH_KEY }}
        script: |
          cd /opt/wordecho
          docker-compose -f docker-compose.prod.yml pull
          docker-compose -f docker-compose.prod.yml up -d
          docker system prune -f
    
    - name: Health check
      run: |
        sleep 30
        curl -f https://yourdomain.com/health || exit 1
    
    - name: Notify Slack
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        channel: '#deployments'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
      if: always()
```

### 🔄 GitLab CI/CD

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

variables:
  DOCKER_DRIVER: overlay2
  POSTGRES_DB: test_db
  POSTGRES_USER: postgres
  POSTGRES_PASSWORD: postgres

services:
  - postgres:13-alpine

test-backend:
  stage: test
  image: python:3.9
  before_script:
    - cd wordecho-backend
    - pip install -r requirements.txt
  script:
    - pytest --cov=app
  coverage: '/TOTAL.*\s+(\d+%)$/'

test-frontend:
  stage: test
  image: node:16-alpine
  before_script:
    - cd wordecho-frontend
    - npm ci
  script:
    - npm test -- --coverage --watchAll=false

build-backend:
  stage: build
  image: docker:20.10.16
  services:
    - docker:20.10.16-dind
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - cd wordecho-backend
    - docker build -t $CI_REGISTRY_IMAGE/backend:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE/backend:$CI_COMMIT_SHA
  only:
    - main

deploy-production:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
    - mkdir -p ~/.ssh
    - chmod 700 ~/.ssh
    - ssh-keyscan $PRODUCTION_HOST >> ~/.ssh/known_hosts
  script:
    - ssh $PRODUCTION_USER@$PRODUCTION_HOST "cd /opt/wordecho && docker-compose -f docker-compose.prod.yml pull && docker-compose -f docker-compose.prod.yml up -d"
  only:
    - main
  when: manual
```

---

## 📈 Performance Optimization

### 🚀 Application Performance

#### Database Optimization
```python
# app/database_optimized.py
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

# Optimized database connection
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=30,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=False  # Disable in production
)

# Database indexes
from sqlalchemy import Index

# Add indexes for common queries
Index('idx_blog_user_id', Blog.user_id)
Index('idx_blog_created_at', Blog.created_at.desc())
Index('idx_user_email', User.email)
Index('idx_comment_blog_id', Comment.blog_id)
```

#### Caching Strategy
```python
# app/cache.py
import redis
from functools import wraps
import json
import pickle

redis_client = redis.Redis(host='redis', port=6379, db=0)

def cache_result(expiration=3600):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Create cache key
            cache_key = f"{func.__name__}:{hash(str(args) + str(kwargs))}"
            
            # Try to get from cache
            cached_result = redis_client.get(cache_key)
            if cached_result:
                return pickle.loads(cached_result)
            
            # Execute function
            result = await func(*args, **kwargs)
            
            # Cache result
            redis_client.setex(
                cache_key, 
                expiration, 
                pickle.dumps(result)
            )
            
            return result
        return wrapper
    return decorator

# Usage
@cache_result(expiration=1800)  # 30 minutes
async def get_popular_blogs():
    return await db.query(Blog).order_by(Blog.views.desc()).limit(10).all()
```

### 🌐 CDN & Static Assets

```nginx
# Static asset optimization
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Vary "Accept-Encoding";
    
    # Enable compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/css
        text/javascript
        application/javascript
        application/json
        application/xml
        image/svg+xml;
}

# API response caching
location /api/blogs {
    proxy_pass http://backend;
    proxy_cache api_cache;
    proxy_cache_valid 200 10m;
    proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
    add_header X-Cache-Status $upstream_cache_status;
}
```

---

## 🔧 Backup & Disaster Recovery

### 💾 Database Backup Strategy

```bash
#!/bin/bash
# backup-database.sh

set -e

BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
echo "🗄️ Creating database backup..."
docker-compose exec -T db pg_dump -U wordecho wordecho > "$BACKUP_DIR/wordecho_db_$DATE.sql"

# Compress backup
gzip "$BACKUP_DIR/wordecho_db_$DATE.sql"

# Upload to S3 (optional)
if [ ! -z "$AWS_S3_BUCKET" ]; then
    echo "☁️ Uploading to S3..."
    aws s3 cp "$BACKUP_DIR/wordecho_db_$DATE.sql.gz" "s3://$AWS_S3_BUCKET/backups/"
fi

# Clean old backups
echo "🧹 Cleaning old backups..."
find $BACKUP_DIR -name "wordecho_db_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "✅ Backup completed: wordecho_db_$DATE.sql.gz"
```

### 🔄 Automated Backup with Cron

```bash
# Setup automated backups
echo "0 2 * * * /opt/scripts/backup-database.sh >> /var/log/backup.log 2>&1" | crontab -
```

### 📥 Disaster Recovery Plan

```bash
#!/bin/bash
# disaster-recovery.sh

BACKUP_FILE=$1
RECOVERY_DB="wordecho_recovery"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

echo "🚨 Starting disaster recovery..."

# Stop application
echo "⏹️ Stopping application..."
docker-compose down

# Create recovery database
echo "🗄️ Creating recovery database..."
docker-compose up -d db
sleep 10

docker-compose exec db createdb -U wordecho $RECOVERY_DB

# Restore from backup
echo "📥 Restoring from backup..."
gunzip -c $BACKUP_FILE | docker-compose exec -T db psql -U wordecho -d $RECOVERY_DB

# Verify restoration
echo "✅ Verifying restoration..."
docker-compose exec db psql -U wordecho -d $RECOVERY_DB -c "SELECT COUNT(*) FROM users;"

# Switch databases
echo "🔄 Switching to recovered database..."
# Update environment variables to point to recovery database
sed -i "s/DATABASE_NAME=wordecho/DATABASE_NAME=$RECOVERY_DB/" .env.prod

# Restart application
echo "🚀 Restarting application..."
docker-compose up -d

echo "✅ Disaster recovery completed!"
```

---

## 🚨 Troubleshooting

### 🔍 Common Issues & Solutions

#### Issue: High Memory Usage
```bash
# Diagnosis
docker stats
htop

# Solutions
# 1. Increase memory limits in docker-compose
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M

# 2. Optimize application
# - Use connection pooling
# - Implement caching
# - Optimize database queries
```

#### Issue: Database Connection Timeouts
```python
# app/database_troubleshooting.py
from sqlalchemy import event
from sqlalchemy.pool import Pool
import logging

# Log pool events
@event.listens_for(Pool, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    logging.info("New database connection established")

@event.listens_for(Pool, "checkout")
def receive_checkout(dbapi_connection, connection_record, connection_proxy):
    logging.info("Connection checked out from pool")

@event.listens_for(Pool, "checkin")
def receive_checkin(dbapi_connection, connection_record):
    logging.info("Connection checked back into pool")
```

#### Issue: SSL Certificate Problems
```bash
# Check certificate status
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Renew certificate
certbot renew --dry-run
certbot renew --force-renewal

# Check nginx configuration
nginx -t
systemctl reload nginx
```

### 📊 Health Checks & Monitoring

```python
# app/health.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
import redis
import psutil

router = APIRouter()

@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    checks = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "checks": {}
    }
    
    # Database check
    try:
        db.execute("SELECT 1")
        checks["checks"]["database"] = "healthy"
    except Exception as e:
        checks["checks"]["database"] = f"unhealthy: {str(e)}"
        checks["status"] = "unhealthy"
    
    # Redis check
    try:
        r = redis.Redis(host='redis', port=6379)
        r.ping()
        checks["checks"]["redis"] = "healthy"
    except Exception as e:
        checks["checks"]["redis"] = f"unhealthy: {str(e)}"
        checks["status"] = "unhealthy"
    
    # System resources
    checks["checks"]["memory"] = f"{psutil.virtual_memory().percent}%"
    checks["checks"]["cpu"] = f"{psutil.cpu_percent()}%"
    checks["checks"]["disk"] = f"{psutil.disk_usage('/').percent}%"
    
    if checks["status"] == "unhealthy":
        raise HTTPException(status_code=503, detail=checks)
    
    return checks
```

### 📋 Debug Scripts

```bash
#!/bin/bash
# debug-application.sh

echo "🔍 WordEcho Debug Information"
echo "=========================="

# System information
echo "📊 System Resources:"
free -h
df -h

# Docker information
echo "🐳 Docker Status:"
docker ps
docker stats --no-stream

# Application logs
echo "📋 Application Logs (last 50 lines):"
docker-compose logs --tail=50 backend

# Database status
echo "🗄️ Database Status:"
docker-compose exec db pg_isready

# Network connectivity
echo "🌐 Network Tests:"
curl -I http://localhost:8000/health
curl -I http://localhost/

# Disk usage
echo "💾 Disk Usage:"
du -sh /var/lib/docker/
du -sh /opt/wordecho/

echo "✅ Debug information collected"
```

---

<div align="center">

## 🎉 Deployment Complete!

Your WordEcho application is now ready for production. Remember to:

- 🔒 **Secure your secrets** and keep them out of version control
- 📊 **Monitor your application** with proper logging and metrics
- 🔄 **Backup regularly** and test your disaster recovery plan
- 🚀 **Scale incrementally** based on actual usage patterns
- 🔐 **Keep dependencies updated** for security patches

**📚 [Back to Main Documentation](README.md) | 🔧 [API Documentation](API_DOCUMENTATION.md) | 👩‍💻 [Developer Guide](DEVELOPER_GUIDE.md)**

---

**Happy deploying! 🚀**

*Made with ❤️ by the WordEcho team*

</div>
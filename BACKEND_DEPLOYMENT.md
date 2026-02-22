# BotFlow2 Backend Deployment Guide

This guide covers deploying the BotFlow2 backend API to Railway or Render with Redis for background job processing.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Load Balancer                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
          ┌───────────┴───────────┐
          │                       │
┌─────────▼─────────┐   ┌─────────▼─────────┐
│   Web Instance 1  │   │   Web Instance 2  │
│   (Next.js App)   │   │   (Auto-scaled)   │
└─────────┬─────────┘   └─────────┬─────────┘
          │                       │
          └───────────┬───────────┘
                      │
              ┌───────▼───────┐
              │     Redis     │
              │   (BullMQ)    │
              └───────┬───────┘
                      │
          ┌───────────┴───────────┐
          │                       │
┌─────────▼─────────┐   ┌─────────▼─────────┐
│    Worker 1       │   │    Worker 2       │
│  (Background)     │   │  (Background)     │
└───────────────────┘   └───────────────────┘
```

## Deployment Options

### Option 1: Railway (Recommended)

Railway provides easy deployment with Redis as a plugin.

#### Quick Deploy

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Link to existing project or create new
railway link

# Deploy
railway up
```

#### Manual Setup

1. **Create Project**
   - Go to [railway.app](https://railway.app)
   - Create new project
   - Connect GitHub repository

2. **Add Redis**
   - Click "New" → "Database" → "Redis"
   - Railway auto-configures `REDIS_URL`

3. **Configure Environment Variables**
   - Go to project settings
   - Add all variables from `.env.example`

4. **Deploy**
   - Railway auto-deploys on git push

#### Railway Configuration

The `railway.json` and `railway.toml` files configure:
- Dockerfile build
- Health check on `/api/health`
- Restart policy
- No sleep (always running)

### Option 2: Render

Render provides infrastructure-as-code with `render.yaml`.

#### Quick Deploy

1. **Connect Repository**
   - Go to [render.com](https://render.com)
   - Create new "Blueprint"
   - Connect GitHub repository
   - Render reads `render.yaml`

2. **Configure Environment Variables**
   - Render prompts for `sync: false` variables
   - Add all required secrets

3. **Deploy**
   - Click "Apply" to deploy all services

#### Render Services

The `render.yaml` configures:

| Service | Type | Description |
|---------|------|-------------|
| botflow-api | Web | Main Next.js application |
| botflow-worker | Worker | BullMQ background processor |
| botflow-redis | Redis | Message queue storage |

#### Auto-scaling

Render auto-scaling is configured:
```yaml
scaling:
  minInstances: 1
  maxInstances: 3
  targetMemoryPercent: 80
  targetCPUPercent: 80
```

## Docker Configuration

### Main Application (Dockerfile)

Multi-stage build optimized for Next.js:
1. **deps** - Install dependencies
2. **builder** - Build application
3. **runner** - Production image (~150MB)

Build locally:
```bash
docker build -t botflow-api .
docker run -p 3000:3000 --env-file .env.local botflow-api
```

### Background Worker (Dockerfile.worker)

Separate image for BullMQ workers:
```bash
docker build -f Dockerfile.worker -t botflow-worker .
docker run --env-file .env.local botflow-worker
```

### Local Development

Use Docker Compose for full stack:
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Start with Redis Commander for debugging
docker-compose --profile debug up -d
```

## Environment Variables

### Required for Production

```bash
# Application
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_APP_URL=https://api.botflow.co.za

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Paystack
PAYSTACK_SECRET_KEY=sk_live_xxx
PAYSTACK_PUBLIC_KEY=pk_live_xxx
PAYSTACK_WEBHOOK_SECRET=whsec_xxx

# OpenAI
OPENAI_API_KEY=sk-xxx

# WhatsApp
META_APP_ID=xxx
META_APP_SECRET=xxx
META_ACCESS_TOKEN=xxx
WHATSAPP_PHONE_NUMBER_ID=xxx
WHATSAPP_BUSINESS_ACCOUNT_ID=xxx
WHATSAPP_WEBHOOK_VERIFY_TOKEN=xxx

# JWT
JWT_SECRET=xxx

# Redis (auto-configured on Railway/Render)
REDIS_URL=redis://xxx
```

## Health Checks

### Endpoints

| Endpoint | Purpose | Used By |
|----------|---------|---------|
| `/api/health` | Full health check | Monitoring |
| `/api/health/ready` | Readiness probe | Kubernetes/ECS |
| `/api/health/live` | Liveness probe | Load balancers |

### Response Format

```json
{
  "status": "healthy",
  "timestamp": "2024-02-22T10:00:00Z",
  "version": "0.1.1",
  "uptime": 3600,
  "checks": [
    { "name": "database", "status": "pass", "responseTime": 15 },
    { "name": "redis", "status": "pass", "responseTime": 5 },
    { "name": "external_services", "status": "pass" }
  ]
}
```

## Background Jobs (BullMQ)

### Queues

| Queue | Purpose | Concurrency |
|-------|---------|-------------|
| billing | Usage aggregation, invoices | 5 |
| email | Transactional emails | 5 |
| whatsapp | Message sending, sync | 5 |
| ai-assistant | GPT processing | 2 |
| receipt-ocr | OCR processing | 5 |
| analytics | Event tracking | 5 |
| webhooks | Webhook processing | 5 |

### Adding Jobs

```typescript
import { addBillingJob, addEmailJob } from '@/lib/queue';

// Add billing job
await addBillingJob({
  type: 'usage_aggregation',
  organizationId: 'org_xxx',
  billingPeriod: '2024-02',
});

// Add email job
await addEmailJob({
  type: 'welcome',
  to: 'user@example.com',
  userId: 'user_xxx',
  templateData: { name: 'John' },
});
```

## Webhook Configuration

After deployment, configure webhooks:

### Paystack
```
URL: https://api.botflow.co.za/api/webhooks/paystack
Events: subscription.create, subscription.cancel, charge.success
```

### WhatsApp
```
Callback URL: https://api.botflow.co.za/api/webhooks/whatsapp
Verify Token: (your WHATSAPP_WEBHOOK_VERIFY_TOKEN)
Fields: messages, message_status
```

## Monitoring

### Logs

**Railway:**
```bash
railway logs
```

**Render:**
View in Render dashboard or use Render CLI.

### Metrics

Both platforms provide:
- CPU usage
- Memory usage
- Request count
- Response times

### Alerts

Configure alerts for:
- Health check failures
- High CPU (>80%)
- High memory (>80%)
- Error rate spikes

## Scaling

### Horizontal Scaling

**Railway:** Configure replicas in dashboard or API

**Render:** Set in `render.yaml`:
```yaml
scaling:
  minInstances: 1
  maxInstances: 5
```

### Vertical Scaling

Upgrade plan for more resources:
- Railway: Hobby → Pro
- Render: Starter → Standard → Pro

## Troubleshooting

### Build Failures

1. Check Dockerfile syntax
2. Verify all dependencies in package.json
3. Check build logs for specific errors

### Connection Issues

1. Verify environment variables
2. Check Redis connection string
3. Verify network rules allow connections

### Performance Issues

1. Check memory usage
2. Monitor queue backlog
3. Scale workers if needed

## Cost Estimation

### Railway

| Resource | Hobby | Pro |
|----------|-------|-----|
| Web (512MB) | ~$5/mo | ~$10/mo |
| Worker (512MB) | ~$5/mo | ~$10/mo |
| Redis | ~$5/mo | ~$10/mo |
| **Total** | **~$15/mo** | **~$30/mo** |

### Render

| Resource | Starter | Standard |
|----------|---------|----------|
| Web | $7/mo | $25/mo |
| Worker | $7/mo | $25/mo |
| Redis | $7/mo | $25/mo |
| **Total** | **~$21/mo** | **~$75/mo** |

## Support

- Railway: [docs.railway.app](https://docs.railway.app)
- Render: [docs.render.com](https://docs.render.com)
- BotFlow: support@botflow.co.za

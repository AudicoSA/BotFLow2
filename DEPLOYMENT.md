# BotFlow2 SaaS Platform - Deployment Guide

This guide covers deploying BotFlow2 to Vercel with all required configurations.

## Prerequisites

- Vercel account
- Domain (botflow.co.za) pointing to Vercel
- Supabase project
- Paystack account (South African payment processing)
- OpenAI API access
- Meta Developer account (for WhatsApp Business API)

## Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/botflow&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,PAYSTACK_SECRET_KEY,PAYSTACK_PUBLIC_KEY,OPENAI_API_KEY&envDescription=Required%20environment%20variables&envLink=https://github.com/yourusername/botflow/blob/main/.env.example)

## Environment Variables

### Required for Production

Copy `.env.example` to `.env.local` for local development, then configure these in Vercel Dashboard:

#### Core Configuration
```bash
NEXT_PUBLIC_APP_URL=https://botflow.co.za
NODE_ENV=production
```

#### Supabase
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

#### Paystack (South African Payments)
```bash
PAYSTACK_SECRET_KEY=sk_live_xxxxx
PAYSTACK_PUBLIC_KEY=pk_live_xxxxx
PAYSTACK_WEBHOOK_SECRET=whsec_xxxxx
PAYSTACK_PLAN_AI_ASSISTANT=PLN_xxxxx
PAYSTACK_PLAN_WHATSAPP_ASSISTANT=PLN_xxxxx
PAYSTACK_PLAN_RECEIPT_ASSISTANT=PLN_xxxxx
PAYSTACK_PLAN_BUNDLE=PLN_xxxxx
```

#### OpenAI
```bash
OPENAI_API_KEY=sk-xxxxx
OPENAI_ORGANIZATION_ID=org-xxxxx
```

#### WhatsApp Business API
```bash
META_APP_ID=xxxxx
META_APP_SECRET=xxxxx
META_ACCESS_TOKEN=xxxxx
WHATSAPP_PHONE_NUMBER_ID=xxxxx
WHATSAPP_BUSINESS_ACCOUNT_ID=xxxxx
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your-verify-token
```

#### JWT
```bash
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
```

## Vercel Configuration

### 1. Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" > "Project"
3. Import your GitHub repository
4. Select the `main` or `launch-botflow2-saas` branch

### 2. Configure Build Settings

These are pre-configured in `vercel.json`:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Node.js Version**: 20.x (recommended)

### 3. Add Environment Variables

1. Go to Project Settings > Environment Variables
2. Add all variables from `.env.example`
3. Set appropriate environments (Production, Preview, Development)

### 4. Configure Custom Domain

1. Go to Project Settings > Domains
2. Add `botflow.co.za`
3. Add `www.botflow.co.za` (redirect to apex)
4. Add `app.botflow.co.za` (optional subdomain)

DNS Configuration:
```
Type  Name    Value
A     @       76.76.21.21
CNAME www     cname.vercel-dns.com
CNAME app     cname.vercel-dns.com
```

### 5. Enable Preview Deployments

1. Go to Project Settings > Git
2. Ensure "Preview Deployments" is enabled
3. Configure branch protection rules in GitHub

### 6. Configure Webhook URLs

Update external services with production webhook URLs:

**Paystack Webhooks:**
```
https://botflow.co.za/api/webhooks/paystack
```

**WhatsApp Webhooks:**
```
https://botflow.co.za/api/webhooks/whatsapp
```

## Security Considerations

### CORS Configuration

CORS is configured for:
- `https://botflow.co.za`
- `https://www.botflow.co.za`
- `https://app.botflow.co.za`
- Vercel preview deployments (`*.vercel.app`)

### Security Headers

All responses include:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=63072000`
- `Referrer-Policy: strict-origin-when-cross-origin`

### API Rate Limiting

Configure in environment:
```bash
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000
```

## Monitoring & Analytics

### Vercel Analytics

Automatically enabled on Vercel deployments.

### PostHog

Set up product analytics:
```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### Sentry

Set up error tracking:
```bash
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

## Deployment Checklist

Before deploying to production:

- [ ] All environment variables configured
- [ ] Supabase database migrations applied
- [ ] Paystack plans created and plan codes added
- [ ] WhatsApp Business API approved
- [ ] Custom domain DNS configured
- [ ] SSL certificate active (automatic on Vercel)
- [ ] Webhook URLs updated in Paystack/Meta
- [ ] Test payment flow end-to-end
- [ ] Test WhatsApp message flow
- [ ] Verify email sending works
- [ ] Check error tracking in Sentry
- [ ] Review security headers

## Troubleshooting

### Build Failures

1. Check Node.js version compatibility
2. Verify all dependencies are installed
3. Check for TypeScript errors: `npm run build`

### Environment Variable Issues

1. Ensure all required variables are set
2. Check for typos in variable names
3. Restart deployment after adding variables

### CORS Errors

1. Verify origin is in allowed list
2. Check `Access-Control-Allow-Origin` header
3. Ensure credentials mode matches

### Webhook Failures

1. Verify webhook URL is accessible
2. Check webhook secret matches
3. Review Vercel function logs

## Support

- GitHub Issues: [github.com/yourusername/botflow/issues](https://github.com/yourusername/botflow/issues)
- Email: support@botflow.co.za

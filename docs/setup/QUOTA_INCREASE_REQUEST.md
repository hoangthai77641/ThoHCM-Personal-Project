# Google Cloud Quota Increase Request

## Current Issue

Build failed with quota limit error:
```
ERROR: Max instances must be set to 5 or fewer
CpuAllocPerProjectRegion requested: 120000 allowed: 20000
MemAllocPerProjectRegion requested: 128GB allowed: 42GB
```

## Current Quota Limits

| Resource | Current Limit | Requested | Region |
|----------|---------------|-----------|--------|
| **CPU** | 20 vCPUs | 120 vCPUs | asia-southeast1 |
| **Memory** | 42 GB | 128 GB | asia-southeast1 |

## Temporary Solution

Reduced configuration to fit within quota:
- Max instances: 30 → **5 instances**
- Min instances: 2 → **1 instance**
- **Capacity:** ~400 concurrent users (5 × 80 requests)

## Request Quota Increase for 1000+ Users

### Step 1: Go to Quotas Page

https://console.cloud.google.com/iam-admin/quotas?project=thohcm-application-475603

### Step 2: Filter Quotas

Search for:
- Service: **Cloud Run API**
- Region: **asia-southeast1**
- Metric: **CPU allocation per project per region**

### Step 3: Request Increase

Click **EDIT QUOTAS** and request:

| Quota Name | Current | Requested | Justification |
|------------|---------|-----------|---------------|
| **CPU allocation per project per region** | 20 | 140 | Production service for 1000+ concurrent users. Need 30 instances × 4 CPU = 120 CPU + 20 buffer |
| **Memory allocation per project per region** | 42 GB | 150 GB | Production service requiring 30 instances × 4 GB = 120 GB + 30 GB buffer |

### Step 4: Justification Template

```
Service: ThoHCM - Home Repair Services Platform
Region: asia-southeast1 (Vietnam market)
Users: Expecting 1,000-2,000 concurrent users

Current Architecture:
- Cloud Run: Node.js backend
- 4 CPU / 4 GB RAM per instance
- 80 concurrent requests per instance
- Target: 30 instances for auto-scaling

Calculation:
- 30 instances × 4 CPU = 120 vCPUs
- 30 instances × 4 GB = 120 GB RAM
- Capacity: 30 × 80 = 2,400 concurrent requests

Timeline: Need approval within 1-2 weeks
Business Impact: Production launch for Vietnam market
```

### Step 5: Wait for Approval

- **Approval time:** 2-7 business days
- **Email notification:** Check email for updates
- **Status:** https://console.cloud.google.com/iam-admin/quotas

## Alternative Solutions

### Option 1: Multi-Region Deployment
Deploy to multiple regions to spread quota:
- asia-southeast1 (Vietnam): 5 instances
- asia-east1 (Taiwan): 5 instances  
- asia-northeast1 (Japan): 5 instances
- **Total:** 15 instances across 3 regions

### Option 2: Upgrade to Premium Support
- Faster quota increase approval
- Higher default limits
- Cost: $150-400/month

### Option 3: Use GKE (Kubernetes)
- Higher default quotas
- More flexible scaling
- More complex setup

## Current Deployment Capacity

With **5 instances** limit:

| Metric | Value |
|--------|-------|
| Max instances | 5 |
| CPU per instance | 4 |
| Memory per instance | 4 GB |
| Concurrency | 80 |
| **Max concurrent users** | **400** |
| **Recommended max** | **300** (with 25% buffer) |

## When Quota is Approved

After quota increase approval, update `config/cloudbuild.yaml`:

```yaml
--max-instances: 30
--min-instances: 2
```

Then redeploy:
```bash
gcloud builds submit --config=config/cloudbuild.yaml \
  --substitutions="_MONGODB_URI=...,_JWT_SECRET=..."
```

## Contact Support

If urgent, contact Google Cloud Support:
- Support Portal: https://console.cloud.google.com/support
- Include project ID: `thohcm-application-475603`
- Reference: Quota increase for production launch

---

**Status:** Waiting for quota increase approval  
**Temporary limit:** 5 instances (~300-400 users)  
**Target limit:** 30 instances (~1,500-2,000 users)

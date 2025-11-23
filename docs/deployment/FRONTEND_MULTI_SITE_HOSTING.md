# Frontend Multi-Site Firebase Hosting (Customer + Admin)

This document describes how the new React frontends are deployed using Firebase Hosting multi-site: one site for the customer application (seed) and one for the admin dashboard (full-version Able Pro template).

## Sites & Targets

| Purpose   | Source Folder                                      | Hosting Site ID        | Target Name |
|-----------|----------------------------------------------------|------------------------|-------------|
| Customer  | `able-pro-material-react-ts-9.2.2/seed`            | `thohcm-customer`      | `customer`  |
| Admin     | `able-pro-material-react-ts-9.2.2/full-version`    | `thohcm-admin`         | `admin`     |

`firebase.json` and `.firebaserc` map these targets. Build output for each app is placed in `dist/` by Vite and deployed individually.

## Prerequisites

1. Firebase project: `thohcm-frontend`.
2. Hosting sites created:
   ```bash
   firebase hosting:sites:create thohcm-customer --project thohcm-frontend
   firebase hosting:sites:create thohcm-admin --project thohcm-frontend
   ```
3. Target mapping (can be safely re-run):
   ```bash
   firebase target:apply hosting customer thohcm-customer --project thohcm-frontend
   firebase target:apply hosting admin thohcm-admin --project thohcm-frontend
   ```
4. Service account JSON with role **Firebase Hosting Admin** (minimal) stored in GitHub secret `FIREBASE_SERVICE_ACCOUNT_THOHCM_FRONTEND`.
5. Node.js 20 in CI.

## Local Build & Manual Deploy

```bash
# Customer
cd able-pro-material-react-ts-9.2.2/seed
npm install
npm run build

# Admin
cd ../full-version
npm install
npm run build

# From repo root
cd ../../..
firebase deploy --only hosting:customer,hosting:admin --project thohcm-frontend
```

After deploy:
- Customer: https://thohcm-customer.web.app
- Admin:    https://thohcm-admin.web.app

## CI/CD Workflows

### Merge to `main`
Workflow: `.github/workflows/firebase-hosting-merge.yml`
- Triggers on changes to either frontend folders or hosting config.
- Steps: install & build both → deploy `hosting:customer,hosting:admin`.

### Pull Request Preview
Workflow: `.github/workflows/firebase-hosting-pull-request.yml`
- Builds both frontends for any PR touching relevant paths.
- Deploys to preview channels `pr-<number>` for both sites.
- Comments preview URLs:
  - `https://pr-<n>--thohcm-customer.web.app`
  - `https://pr-<n>--thohcm-admin.web.app`
- Channel expires in 7 days (configurable).

## Environment Variables

Create optional `.env.production` in each app prior to build (CI can echo file if needed):
```
VITE_API_BASE_URL=https://<backend-domain>
VITE_WS_URL=wss://<backend-domain>
VITE_FEATURE_FLAG_X=true
```
Do NOT commit secrets; use plain runtime URLs only.

## Caching & Headers (Optional)
Add headers section to `firebase.json` for assets versioning & performance:
```jsonc
{
  "hosting": [
    {
      "target": "customer",
      "public": "able-pro-material-react-ts-9.2.2/seed/dist",
      "headers": [
        {"source": "**/*.js", "headers": [{"key": "Cache-Control", "value": "public,max-age=31536000,immutable"}]},
        {"source": "**/*.css", "headers": [{"key": "Cache-Control", "value": "public,max-age=31536000,immutable"}]}
      ],
      "rewrites": [{"source": "**", "destination": "/index.html"}]
    },
    {"target": "admin", "public": "able-pro-material-react-ts-9.2.2/full-version/dist", "rewrites": [{"source": "**", "destination": "/index.html"}]}
  ]
}
```

## Rollback Strategy

- **Preview to Live:** Promote by redeploying main branch (no direct channel promote yet for multi-target; rebuild from main).
- **Immediate rollback:** Re-deploy previous commit SHA using `git checkout <sha>` then run deploy command.
- **Partial rollback:** Deploy only one site: `firebase deploy --only hosting:customer`.

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| `Site not found` | Hosting site not created or wrong ID | Re-run site creation & target apply |
| `Permission denied` | Service account lacks Hosting Admin | Assign role & update secret |
| Empty site / 404 | Forgot build step / wrong `public` path | Check `dist/` exists after build |
| PR workflow no URLs | GitHub script failed or secret missing | Inspect Actions logs & validate secret name |
| Stale assets | Missing cache busting | Use hashed filenames (Vite default) + long Cache-Control |

## Future Enhancements
- Add integration tests before deploy (block on failure).
- Introduce Lighthouse CI for each site.
- Add automatic invalidation for critical files (use shorter cache for `index.html`).
- Support staging branch deploy using separate preview channel naming.

---
Updated: {{DATE}}.
Maintainer: Hoang Thai.
